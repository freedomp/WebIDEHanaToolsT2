/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader"], function(ResourceLoader) {
    "use strict";

    var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

    var selectAll = function(table, event) {
        var indices = table.getSelectedIndices();
        var rows = table.getRows();
        if (indices.length === rows.length) {
            table.clearSelection();
        } else {
            table.selectAll();
        }
    };

    var suggestTypedObjectFilter = function(sValue, oItem) {
        return true;
    };

    var TypedObjectTable = {};

    TypedObjectTable.sortAscending = function(array) {
        array.sort(function(a, b) {
            return a - b;
        });
        return array;
    };

    TypedObjectTable.sortDescending = function(array) {
        array.sort(function(a, b) {
            return b - a;
        });
        return array;
    };

    TypedObjectTable.getTypedObjectDefinitionCell = function(currentRow) {
        if (!currentRow) return;
        var currentCells = currentRow.getCells();
        for (var i = 0; i < currentCells.length; i++) {
            if (typeof currentCells[i].getName === "function" && currentCells[i].getName() === "TypedObjectDefinitionCell") {
                return currentCells[i];
            }
        }
    };

    TypedObjectTable.focusTypedObjectDefinitionCell = function(currentRow) {
        var cell = TypedObjectTable.getTypedObjectDefinitionCell(currentRow);
        cell.focus();
    };

    TypedObjectTable.clearCellStatus = function(currentCell) {
        if (!currentCell) return;
        var oldTip = currentCell.getTooltip();
        if (oldTip instanceof sap.ui.commons.Callout) {
            oldTip = oldTip.getCustomData("tooltip");
            oldTip = oldTip && oldTip.length === 1 ? oldTip[0].getValue() : null;
        }
        currentCell.setTooltip(oldTip);
        currentCell.setValueState(sap.ui.core.ValueState.None);
        currentCell.getBinding("value").refresh(true);
    };

    TypedObjectTable.clearTypedObjectDefinitionCell = function(currentRow) {
        var currentCell = TypedObjectTable.getTypedObjectDefinitionCell(currentRow);
        if (currentCell) {
            TypedObjectTable.clearCellStatus(currentCell);
        }
    };

    TypedObjectTable.leaveTypedObjectCell = function(event) {
        TypedObjectTable.clearCellStatus(event.getSource());
    };

    TypedObjectTable.suggestTypedObject = function(parser, oEvent) {
        var source = oEvent.getSource();
        source.setFilterFunction(TypedObjectTable.suggestTypedObjectFilter);
        source.destroyItems();
        var suggestions = parser.buildTypeSuggestions(oEvent.getParameter("suggestValue"));
        for (var i = 0; i < suggestions.length; i++) {
            source.addItem(new sap.ui.core.ListItem({
                text: suggestions[i]
            }));
        }
    };

    TypedObjectTable.showMessageTooltip = function(textField, parser, message, messageObjects, headerMessageObjects) {
        var customData;
        var oldTip = textField.getTooltip();
        if (typeof oldTip === "string") {
            customData = new sap.ui.core.CustomData({
                key: "tooltip",
                value: oldTip
            });
        }
        var tooltip = new sap.ui.commons.Callout();
        tooltip.addCustomData(customData);
        tooltip.addContent(
            new sap.ui.layout.VerticalLayout({
                content: [
                    new sap.ui.layout.HorizontalLayout({
                        content: [
                            new sap.ui.commons.Label({
                                design: sap.ui.commons.LabelDesign.Bold,
                                icon: "sap-icon://error"
                            }),
                            new sap.ui.commons.TextView({
                                semanticColor: sap.ui.commons.TextViewColor.Negative,
                                design: sap.ui.commons.TextViewDesign.Bold,
                                text: resourceLoader.getText(parser.MSG_OBJECT_INVALID, headerMessageObjects)
                            })
                        ]
                    }),
                    new sap.ui.commons.HorizontalDivider(),
                    new sap.ui.commons.TextView({
                        text: resourceLoader.getText(message, messageObjects)
                    })
                ]
            })
        );
        textField.setTooltip(tooltip);
        textField.setValueState(sap.ui.core.ValueState.Error);
        var textFieldInput = textField.getInputDomRef();
        if (typeof textFieldInput.selectionStart === "number") {
            textFieldInput.selectionStart = textFieldInput.selectionEnd = textFieldInput.value.length;
        }
        // open the popup
        window.setTimeout(function() {
            tooltip.openPopup(textField);
        }, 200);
    };

    TypedObjectTable.createTable = function(noDataText, tableBindingPath, tableRowsBindingPath, heightPercentage) {
        var allRows = typeof heightPercentage === "undefined";
        var toolbar = new sap.ui.commons.Toolbar();
        var table = new sap.ui.table.Table({
            selectionMode: sap.ui.table.SelectionMode.Multiple,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            navigationMode: sap.ui.table.NavigationMode.Scrollbar,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Fixed,
            noData: new sap.ui.commons.TextView({
                text: resourceLoader.getText(noDataText)
            }),
            visibleRowCount: {
                path: tableRowsBindingPath,
                formatter: function(modelRows) {
                    if (modelRows && modelRows.length > 0) {
                        if (allRows) return modelRows.length;
                        var rows = table.getRows();
                        if (rows.length > 0 && rows[0].$() && table.getParent()) {
                            var rowHeight = rows[0].$().height();
                            var tableHeight = table.$().height();
                            var headerHeight = tableHeight - rowHeight * rows.length;
                            var targetHeight = table.getParent().$().height() * heightPercentage / 100 - headerHeight;
                            var maxRows = Math.floor(targetHeight / rowHeight);
                            return Math.min(modelRows.length, maxRows);
                        }
                    }
                    return 1;
                }
            },
            columnHeaderVisible: false,
            toolbar: toolbar,
            width: "100%",
            rowSelectionChange: function(event) {
                var params = event.getParameters();
                var source = event.getSource();
            }
        });
        table.addStyleClass("calcviewTypedObjectTable"),
        table.bindRows(tableRowsBindingPath);

        table.attachBrowserEvent("keydown", function(event) {
            if (event.target.getAttribute("name") !== "TypedObjectDefinitionCell") {
                if (event.ctrlKey && !event.shiftKey && !event.metaKey && !event.altKey && event.keyCode === 65) {
                    selectAll(table);
                    event.preventDefault();
                }
            }
        });

        return table;
    };

    TypedObjectTable.createButton = function(imageName, tooltip, handler) {
        var isIconFont = function(name) {
            return name.length > 11 && name.substr(0, 11) === "sap-icon://";
        };
        var button = new sap.ui.commons.Button({
            icon: isIconFont(imageName) ? imageName : resourceLoader.getImagePath(imageName),
            lite: true,
            tooltip: resourceLoader.getText(tooltip),
            press: handler
        });
        return button;
    };

    return TypedObjectTable;

});
