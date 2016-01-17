/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
/*global define*/
/*jshint -W110*/
define([
    "../../util/ResourceLoader",
    "../CalcViewEditorUtil",
    "./FindDialog",
    "../../viewmodel/commands",
    "../../base/modelbase",
    "../../base/MetadataServices",
    "../../control/FormattedTextViewInput"
], function(ResourceLoader, Util, FindDialog, commands, modelbase, MetadataServices) {
    "use strict";

    var cons = typeof console !== "undefined" ? console : undefined,
        resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

    function makeSelf(ref) {
        var self = function() {
            return ref;
        };
        self.changes = 0;
        return self;
    }

    function getIndexOf(entry, data, startAt) {
        var i;
        if (typeof entry !== "object") {
            return -1;
        }
        i = typeof startAt === "number" ? startAt : 0;
        for (; i < data.length; i++) {
            if (data[i] && data[i].name === entry.name && data[i].schemaName === entry.schemaName && data[i].packageName === entry.packageName) {
                return i;
            }
        }
        return -1;
    }

    function change(obj) {
        if (obj && obj.self) {
            obj.self.changes++;
        }
    }

    function addMarker(table, obj, marker) {
        if (!obj.markers) {
            obj.markers = {};
        }
        if (!obj.markers[marker]) {
            obj.markers[marker] = true;
            change(obj);
            table.noOfMarkers++;
        }
    }

    function removeMarker(table, obj, marker) {
        if (obj.markers && obj.markers[marker]) {
            delete obj.markers[marker];
            if (Object.keys(obj.markers).length === 0) {
                delete obj.markers;
            }
            change(obj);
            table.noOfMarkers--;
            return true;
        } else {
            return false;
        }
    }

    function updateInvalidColumnNameMarker(table, obj, isAdd) {
        if (isAdd) {
            if (!obj.name.match(/^[A-Za-z_]\w*$/)) {
                addMarker(table, obj, "msg_column_invalid_name");
            }
        } else {
            removeMarker(table, obj, "msg_column_invalid_name");
        }
    }

    function updateDuplicateMarker(table, obj, isAdd) {
        var firstIndex, secondIndex;

        if (isAdd) {
            firstIndex = getIndexOf(obj, table);
            if (firstIndex >= 0) {
                addMarker(table, table[firstIndex], "msg_duplicate_column");
                addMarker(table, obj, "msg_duplicate_column");
            }
        } else {
            if (removeMarker(table, obj, "msg_duplicate_column")) {
                firstIndex = getIndexOf(obj, table);
                if (firstIndex >= 0) {
                    secondIndex = getIndexOf(obj, table, firstIndex + 1);
                    if (secondIndex < 0) {
                        removeMarker(table, table[firstIndex], "msg_duplicate_column");
                    }
                }
            }
        }
    }

    function updateConflictMarker(table, obj, that, isAdd) {
        var node = that.model.columnView.getDefaultNode();

        if (isAdd && !that.overwriteColumns) {
            if (node.elements.get(obj.name)) {
                addMarker(table, obj, "msg_column_already_exists");
            }
        } else {
            removeMarker(table, obj, "msg_column_already_exists");
        }
    }

    function updateAllConflictMarkers(table, that) {
        var i = 0;

        for (i = 0; i < table.length; i++) {
            updateConflictMarker(table, table[i], that, !that.overwriteColumns);
        }
    }

    function updateMarkers(table, obj, that, isAdd) {
        updateConflictMarker(table, obj, that, isAdd);
        updateDuplicateMarker(table, obj, isAdd);
        updateInvalidColumnNameMarker(table, obj, isAdd);
    }

    function addEntities(entities, table, data, model) {
        var j, toAdd = 0;

        function finalize() {
            toAdd--;
            if (toAdd <= 0) {
                model.setData(data);
                table.setNoData(null);
            }
        }

        function addEntity(entity) {
            var d, qualifier, mode, type, subType, toAdd;

            d = {
                schemaName: entity.physicalSchema,
                packageName: entity.packageName,
                type: entity.type,
                name: entity.name
            };
            d.self = makeSelf(d);
            qualifier = d.schemaName ? d.schemaName : d.packageName;
            mode = d.schemaName ? "RT" : "DT";
            type = d.type;
            if (type === "ATTRIBUTEVIEW") {
                type = "VIEW";
                subType = "ATTRIBUTEVIEW";
            } else if (type === "ANALYTICVIEW") {
                type = "VIEW";
                subType = "ANALYTICVIEW";
            } else if (type === "CALCULATIONVIEW") {
                type = "VIEW";
                subType = "CALCULATIONVIEW";
            }
            if (getIndexOf(d, data) < 0) {
                toAdd++;
                MetadataServices.MetadataDetails.getDetailsNew(qualifier, entity.name, mode, "ACTIVE", type, subType,
                    function(result) {
                        var i, columns, msg, c;

                        if (result && Array.isArray(result.metadata) && result.metadata.length > 0) {
                            d.description = result.metadata[0].description;
                            columns = result.metadata[0].data;
                            d.noOfColumns = columns.length;
                            for (i = 0; i < columns.length; i++) {
                                d[i] = c = {
                                    name: columns[i].name,
                                    dataType: columns[i].dataTypeName,
                                    description: columns[i].description,
                                    semanticType: columns[i].semanticType
                                };
                                c.self = makeSelf(c);
                                if (Util.getPrimitiveTypeMaxLength(c.dataType) > 0) {
                                    c.length = columns[i].length;
                                }
                                if (Util.getPrimitiveTypeMaxScale(c.dataType) > 0) {
                                    c.scale = columns[i].scale;
                                }
                            }
                            data.push(d);
                        } else {
                            msg = result && result.Message ? result.Message : "Error loading metadata";
                            if (cons) {
                                cons.log(msg + " - " + d.type + ": " + d.name);
                            }
                        }
                        finalize();
                    },
                    function(err) {
                        cons.log("Error loading metadata - " + d.type + ": " + d.name);
                        cons.log(err);
                        finalize();
                    });
            }
        }

        table.setNoData(resourceLoader.getText("txt_loading"));
        for (j = 0; j < entities.length; j++) {
            addEntity(entities[j], data);
        }
    }

    function formatRowText(rowData, includeIcon) {
        var text = "";

        if (rowData) {
            text = '<span class="calcViewTT">';
            if (includeIcon) {
                text += '<embed data-index="0">&nbsp;';
            }
            text += rowData.name;
            if (rowData.schemaName) {
                text += '&nbsp;<span class="calcViewTTschemaName">' + rowData.schemaName + '</span>';
            } else if (rowData.packageName) {
                text += '&nbsp;<span class="calcViewTTpackageName">' + rowData.packageName + '</span>';
            } else if (rowData.dataType) {
                text += '&nbsp;<span class="calcViewTTdataType">' + rowData.dataType;
                if (typeof rowData.length === "number") {
                    text += "(" + rowData.length;
                    if (typeof rowData.scale === "number") {
                        text += "," + rowData.scale;
                    }
                    text += ")";
                }
                text += "</span>";
            }
            text += "</span>";
        }
        return text;
    }

    function formatRowTip(rowData) {
        var keys, i, text = "";

        text += formatRowText(rowData);
        if (rowData && rowData.description) {
            text += "<br>";
            text += '<span class="calcViewTTdescription">' + rowData.description + '</span>';
        }
        if (rowData && rowData.markers) {
            keys = Object.keys(rowData.markers);
            text += '<span class="calcViewTTError">';
            for (i = 0; i < keys.length; i++) {
                text += "<br>Error: " + resourceLoader.getText(keys[i], rowData.name);
            }
            text += '</span>';
        }
        return text;
    }

    function makeRowTooltip() {
        var tip = new sap.ui.commons.RichTooltip({
            text: {
                parts: ["self", "self/changes"],
                formatter: function(self) {
                    var rowData = typeof self === "function" ? self() : undefined;
                    return formatRowTip(rowData);
                }
            },
            imageSrc: {
                parts: ["self", "self/changes"],
                formatter: function(self) {
                    var rowData = typeof self === "function" ? self() : undefined;
                    if (rowData) {
                        if (rowData.type) {
                            return Util.getDataSourceImage(rowData.type);
                        }
                        return Util.getDataTypeImage(rowData.dataType);
                    }
                }
            }
        });
        tip.addStyleClass("sapUiClt"); // workaround: tag with a styl class known to WATT UI5Loader which oterwise believes that this is a popup and steals focus
        return tip;
    }

    function makeRowTempl(isEditable) {
        var input, templ;

        templ = new sap.ui.commons.FormattedTextView({
            htmlText: {
                parts: ["self", "self/changes"],
                formatter: function(self) {
                    var rowData = typeof self === "function" ? self() : undefined;
                    return formatRowText(rowData, true);
                }
            },
            tooltip: makeRowTooltip(),
            controls: [
                new sap.ui.commons.Image({
                    src: {
                        parts: ["self", "self/changes"],
                        formatter: function(self) {
                            var rowData = typeof self === "function" ? self() : undefined;

                            if (rowData) {
                                if (rowData.type) {
                                    return Util.getDataSourceImage(rowData.type);
                                }
                                return rowData.markers ? resourceLoader.getImagePath("proxy/error.gif") : Util.getDataTypeImage(rowData.dataType);
                            }
                        }
                    }
                })
            ]
        });

        function leaveCellByKeyboard(e) {
            var elem = e.target;

            e.stopImmediatePropagation(); // would close the surrounding dialog otherwise
            // focus TD element of table cell to allow for fast keybord navigation
            while (elem) {
                if (elem.nodeName.toLowerCase() === "td") {
                    elem.focus();
                    break;
                }
                elem = elem.parentElement;
            }
        }

        if (isEditable) {
            input = new sap.ui.commons.TextField({
                value: {
                    path: "name",
                    mode: sap.ui.model.BindingMode.OneWay
                }
            });
            input.addEventDelegate({
                onsapescape: leaveCellByKeyboard,
                onsapenter: leaveCellByKeyboard
            });
            templ = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.FormattedTextViewInput({
                textView: templ,
                input: input,
                tootip: makeRowTooltip()
            });
        }

        return templ;
    }

    function expandAll(e) {
        var i, size, table;

        table = e.getSource().getParent().getParent();
        size = table.getBinding("rows").getLength(); // table.getRows().lenght would return the visible row count only
        for (i = size - 1; i >= 0; i--) {
            if (!table.isExpanded(i)) {
                table.expand(i);
            }
        }
    }

    function collapseAll(e) {
        var i, size, table;

        table = e.getSource().getParent().getParent();
        size = table.getModel().getData().length;
        for (i = 0; i < size; i++) {
            if (table.isExpanded(i)) {
                table.collapse(i);
            }
        }
    }

    function AddColumnsFromDialog(context, model) {
        this.context = context;
        this.model = model;
        this.overwriteColumns = false;
    }

    AddColumnsFromDialog.prototype.openDialog = function() {
        var that, dialog, topLayout, overwriteExistingCheckBox, okButton, cancelButton, buttonBar,
            availableData, availableModel, addAvailableButton, deleteAvailableButton, availableColumnsTitle, availableColumns,
            selectedData, selectedModel, addSelectedButton, deleteSelectedButton, selectedColumnsTitle, selectedColumnsTempl, selectedColumns;

        that = this;
        availableData = [];
        availableData.noOfMarkers = 0;
        selectedData = [];
        selectedData.noOfMarkers = 0;


        function updateButtons(src) {
            var i, index, selection, selectedObj, entitySelected, columnSelected;

            selection = src.getSelectedIndices();

            if (src === availableColumns) {
                entitySelected = false;
                columnSelected = false;
                for (i = 0; i < selection.length; i++) {
                    index = selection[i];
                    selectedObj = src.getContextByIndex(index).getObject();
                    if (selectedObj.type) {
                        entitySelected = true;
                    } else {
                        columnSelected = true;
                    }
                }

                deleteAvailableButton.setEnabled(entitySelected);
                addSelectedButton.setEnabled(columnSelected || entitySelected);
            } else if (src === selectedColumns) {
                deleteSelectedButton.setEnabled(selection.length > 0);
                okButton.setEnabled(selectedData.length > 0 && selectedData.noOfMarkers <= 0);
            }
        }

        function selectionListener(e) {
            return updateButtons(e.getSource());
        }

        addAvailableButton = new sap.ui.commons.Button({
            lite: true,
            icon: "sap-icon://add",
            tooltip: "{i18n>tol_add}",
            press: function() {
                var findDlg = new FindDialog("find", {
                    types: Util.getSearchObjectTypes(),
                    // noOfSelection: noOfSelection,
                    context: that.context,
                    onOK: function(results) {
                        if (results) {
                            addEntities(results, availableColumns, availableData, availableModel);
                        }
                    }
                });
            }
        });

        deleteAvailableButton = new sap.ui.commons.Button({
            lite: true,
            icon: "sap-icon://delete",
            tooltip: "{i18n>tol_delete}",
            press: function() {
                var i, index, selection, selectedObj, newSelection;

                selection = availableColumns.getSelectedIndices().sort(function(a, b) {
                    return a - b;
                });
                newSelection = Math.max(selection[0] - 1, 0);
                for (i = selection.length - 1; i >= 0; i--) {
                    index = selection[i];
                    selectedObj = availableColumns.getContextByIndex(index).getObject();
                    if (selectedObj && selectedObj.type) {
                        availableData.splice(getIndexOf(selectedObj, availableData), 1);
                    }
                }
                availableModel.setData(availableData);
                availableColumns.setSelectedIndex(availableData.length === 0 ? -1 : newSelection);
            },
            enabled: false
        });

        addSelectedButton = new sap.ui.commons.Button({
            lite: true,
            icon: "sap-icon://navigation-right-arrow",
            tooltip: "{i18n>tol_add}",
            press: function() {
                var i, j, index, selection, selectedObj;

                function addSelected(column) {
                    var c = {
                        name: column.name,
                        dataType: column.dataType,
                        length: column.length,
                        scale: column.scale
                    };

                    c.self = makeSelf(c);
                    updateMarkers(selectedData, c, that, true);
                    selectedData.push(c);
                }

                selection = availableColumns.getSelectedIndices();
                for (i = 0; i < selection.length; i++) {
                    index = selection[i];
                    selectedObj = availableColumns.getContextByIndex(index).getObject();
                    if (selectedObj.type) {
                        for (j = 0; j < selectedObj.noOfColumns; j++) {
                            addSelected(selectedObj[j]);
                        }
                    }
                    if (selectedObj.dataType) {
                        addSelected(selectedObj);
                    }
                }
                selectedModel.setData(selectedData);
                updateButtons(selectedColumns);
            },
            enabled: false
        });

        deleteSelectedButton = new sap.ui.commons.Button({
            lite: true,
            icon: "sap-icon://delete",
            tooltip: "{i18n>tol_delete}",
            press: function() {
                var i, index, selection, newSelection, selectedObj;

                selection = selectedColumns.getSelectedIndices().sort(function(a, b) {
                    return a - b;
                });
                newSelection = Math.max(selection[0] - 1, 0);
                for (i = selection.length - 1; i >= 0; i--) {
                    index = selection[i];
                    selectedObj = selectedData[index];
                    selectedData.splice(index, 1);
                    updateMarkers(selectedData, selectedObj, that, false);
                }
                selectedModel.setData(selectedData);
                selectedColumns.setSelectedIndex(selectedData.length === 0 ? -1 : newSelection);
                updateButtons(selectedColumns);
            },
            enabled: false
        });

        overwriteExistingCheckBox = new sap.ui.commons.CheckBox({
            text: "{i18n>txt_overwrite_existing_columns}",
            checked: that.overwriteColumns,
            change: function(e) {
                that.overwriteColumns = e.getParameters().checked;
                updateAllConflictMarkers(selectedData, that);
                selectedModel.setData(selectedData);
                updateButtons(selectedColumns);
            }
        });

        okButton = new sap.ui.commons.Button({
            text: "{i18n>txt_ok}",
            press: function() {
                var i, node, viewNodeName, attributes, selectedObj,
                    addCommands = [];

                node = that.model.columnView.getDefaultNode();
                viewNodeName = node.name;

                if (that.overwriteColumns) {
                    node.elements.foreach(function(existingElement) {
                        addCommands.push(new modelbase.DeleteCommand(existingElement));
                    });
                }
                for (i = 0; i < selectedData.length; i++) {
                    selectedObj = selectedData[i];
                    attributes = {
                        objectAttributes: {
                            name: selectedObj.name,
                            aggregationBehavior: Util.getAggregationBehavior(selectedObj.dataType),
                            label: selectedObj.name
                        },
                        typeAttributes: {
                            primitiveType: selectedObj.dataType,
                            isDerived: false
                        }
                    };
                    if (typeof selectedObj.length === "number") {
                        attributes.typeAttributes.length = selectedObj.length;
                    }
                    if (typeof scale === "number") {
                        attributes.typeAttributes.scale = selectedObj.scale;
                    }

                    addCommands.push(new commands.AddElementCommand(viewNodeName, attributes));
                }

                that.model.$getUndoManager().execute(new modelbase.CompoundCommand(addCommands));
                dialog.close();
            }
        });

        cancelButton = new sap.ui.commons.Button({
            text: "{i18n>txt_cancel}",
            press: function() {
                dialog.close();
            }
        });

        buttonBar = new sap.ui.commons.layout.VerticalLayout({});
        buttonBar.addContent(addSelectedButton);
        buttonBar.addStyleClass("calcViewAddColumnsFromDlgButtonBar");

        availableColumnsTitle = new sap.ui.commons.FormattedTextView({
            htmlText: {
                parts: ["i18n>tit_available_columns"],
                formatter: function(text) {
                    return '<span class="calcViewAddColumnsFromDlgTableTitle">' + text + '</span>';
                }
            }
        });
        availableColumnsTitle.addStyleClass("calcViewAddColumnsFromDlgTableTitle");
        availableColumns = new sap.ui.table.TreeTable({
            title: availableColumnsTitle,
            height: "100%",
            expandFirstLevel: true,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowSelector,
            toolbar: new sap.ui.commons.Toolbar({
                items: [
                    addAvailableButton,
                    deleteAvailableButton
                ],
                rightItems: [
                    new sap.ui.commons.Button({
                        lite: true,
                        icon: "sap-icon://expand",
                        tooltip: "{i18n>tol_expand_all}",
                        press: expandAll
                    }),
                    new sap.ui.commons.Button({
                        lite: true,
                        icon: "sap-icon://collapse",
                        tooltip: "{i18n>tol_collapse_all}",
                        press: collapseAll
                    })
                ]
            }),
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            minAutoRowCount: 12,
            columns: [new sap.ui.table.Column({
                label: "Name",
                template: makeRowTempl(),
                filterProperty: "name"
                // sortProperty: "name" // not supported by TreeTable
            })]
        });
        availableColumns.attachRowSelectionChange(selectionListener);

        selectedColumnsTitle = new sap.ui.commons.FormattedTextView({
            htmlText: {
                parts: ["i18n>tit_selected_columns"],
                formatter: function(text) {
                    return '<embed data-index="0">&nbsp;<span class="calcViewAddColumnsFromDlgTableTitle">' + text + '</span>';
                }
            },
            tooltip: new sap.ui.commons.RichTooltip({
                text: {
                    parts: ["noOfMarkers"],
                    formatter: function(noOfMarkers) {
                        return noOfMarkers > 0 ? '<span class="calcViewTTError">' + resourceLoader.getText("msg_selected_columns_errors") + "</span>" : null;
                    }
                }
            }),
            controls: [
                new sap.ui.commons.Image({
                    src: {
                        parts: ["noOfMarkers"],
                        formatter: function(noOfMarkers) {
                            return noOfMarkers > 0 ? resourceLoader.getImagePath("proxy/error.gif") : undefined;
                        }
                    }
                })
            ]
        });

        selectedColumnsTempl = makeRowTempl(true);
        selectedColumnsTempl.getInput().attachChange(function(e) {
            var row, obj, index;

            row = e.getSource().getParent().getParent();
            index = row.getIndex();

            // remove existing object
            obj = selectedData[index];
            selectedData[index] = null;
            updateMarkers(selectedData, obj, that, false);

            // rename and add
            obj.name = e.getParameters().newValue;
            change(obj);
            updateMarkers(selectedData, obj, that, true);
            selectedData[index] = obj;

            selectedModel.setData(selectedData);
            updateButtons(selectedColumns);
        });

        selectedColumns = new sap.ui.table.Table({
            title: selectedColumnsTitle,
            height: "100%",
            selectionBehavior: sap.ui.table.SelectionBehavior.RowSelector,
            toolbar: new sap.ui.commons.Toolbar({
                items: [
                    deleteSelectedButton
                ]
            }),
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            minAutoRowCount: 12,
            columns: [new sap.ui.table.Column({
                label: "Name",
                template: selectedColumnsTempl,
                filterProperty: "name"
                // sortProperty: "name" // not supported by TreeTable
            })]
        });
        selectedColumns.attachRowSelectionChange(selectionListener);
        selectedColumns.addEventDelegate({
            onkeyup: function(e) {
                var i, row, rows, index;
                if (e.keyCode === jQuery.sap.KeyCodes.F2) {

                    rows = selectedColumns.getRows();
                    index = selectedColumns.getSelectedIndex();
                    for (i = 0; i < rows.length; i++) {
                        if (rows[i].getIndex() === index) {
                            row = rows[i];
                        }
                    }
                    if (row) {
                        row.getCells()[0].setEditMode(true);
                    }
                }
            }
        });

        topLayout = new sap.ui.commons.layout.MatrixLayout({
            width: "100%",
            height: "100%",
            widths: ["auto", "36px", "auto"]
        });
        topLayout.createRow(availableColumns, buttonBar, selectedColumns);
        topLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            height: "27px",
            cells: [new sap.ui.commons.layout.MatrixLayoutCell({
                colSpan: 3,
                content: overwriteExistingCheckBox
            })]
        }));

        dialog = new sap.ui.commons.Dialog({
            title: "{i18n>tit_add_columns_from}",
            width: "750px",
            height: "600px",
            minWidth: "450px",
            minHeight: "600px",
            maxHeight: "600px",
            applyContentPadding: true,
            resizable: true,
            contentBorderDesign: sap.ui.commons.enums.BorderDesign.Thick,
            modal: true,
            accessibleRole: sap.ui.core.AccessibleRole.Dialog,
            content: topLayout,
            buttons: [okButton, cancelButton],
            defaultButton: okButton,
            keepInWindow: true
        });

        this.context.i18n.applyTo(dialog);

        availableModel = new sap.ui.model.json.JSONModel();
        availableModel.setData(availableData);
        availableColumns.setModel(availableModel);
        availableColumns.bindRows("/");

        selectedModel = new sap.ui.model.json.JSONModel();
        selectedModel.setData(selectedData);
        selectedColumns.setModel(selectedModel);
        selectedColumns.bindRows("/");
        selectedColumns.bindElement("/");

        updateButtons(availableColumns);
        updateButtons(selectedColumns);
        dialog.open();
    };

    return AddColumnsFromDialog;
});
