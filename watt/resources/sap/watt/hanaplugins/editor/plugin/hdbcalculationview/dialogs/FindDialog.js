/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader"], function(ResourceLoader) {

    var FindDialog = function(id) {
        this._content = null;
        //._undoManager = undoManager;
        // this._context = context;
        //this._layout = null;
    };

    var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");


    var data = [];

    FindDialog.prototype = {

        _goIO: undefined,

        execute: function() {
            this.searchFile();
            return data;
        },

        isAvailable: function() {
            return true;
        },

        isEnabled: function() {
            return true;
        },

        searchFile: function() {
            var that = this;
            jQuery.sap.require("jquery.sap.strings"); //Load the plugin to use 'jQuery.sap.startsWithIgnoreCase'

            if (sap.ui.getCore().byId("findfile-dialog-form")) {
                sap.ui.getCore().byId("findfile-dialog-form").destroy();
            }
            var loThisDia = new sap.ui.commons.Dialog("findfile-dialog-form", {
                "width": "auto",
                "tooltip": "Find objects",
                "modal": true
            });
            loThisDia.setTitle("Find");

            var loMatrix = new sap.ui.commons.layout.MatrixLayout({
                layoutFixed: false,
                width: '100%',
                columns: 2,
            });
            loThisDia.addContent(loMatrix);
            loLabel1 = new sap.ui.commons.Label({
                text: "Type the object name to search for "
            });
            loMatrix.createRow(loLabel1);

            var loSearch = new sap.ui.commons.SearchField({
                width: '500px',
                enableListSuggest: false,
                enableClear: true,
                startSuggestion: 0,
                suggest: function(ioEvent) {
                    var lsSearchString = ioEvent.getParameter("value");
                    if (lsSearchString.length >= 2) {
                        var loSearchFileObject = {};
                        loSearchFileObject.searchString = lsSearchString;

                        that._goIO.send("/sap/hana/ide/editor/server/serviceAPI.xsjs?action=searchFiles&searchFileObject=" + JSON.stringify(loSearchFileObject), "GET").then(
                            //that._goIO.send("/sap/hana/ide/editor/server/serviceAPI.xsjs?action=searchObject=" + JSON.stringify(loSearchFileObject), "GET").then(
                            function(ioResults) {
                                that._populateResultsInTable(ioResults);
                            }, function(ioError) {
                                //TODO: handle errors
                            });
                    } else if (lsSearchString.length === 0) {
                        //sap.ui.getCore().byId("findobject-result-list").removeAllItems();
                        sap.ui.getCore().byId("findobject-result-header").setText("Matching items:");
                        sap.ui.getCore().byId("table").unbindRows();
                        sap.ui.getCore().byId("table").destroyNoData();
                        //status.setValue("");
                    } else if (lsSearchString.length == 1) {
                        //sap.ui.getCore().byId("findobject-result-list").removeAllItems();
                        sap.ui.getCore().byId("table").unbindRows();
                        sap.ui.getCore().byId("findobject-result-header").setText("Matching items:");
                        /*var loItem = new sap.ui.core.ListItem({
                            text: "<Find needs atleast two characters>",
                            additionalText: "<Find needs atleast two characters>",
                        });
                        sap.ui.getCore().byId("findobject-result-list").addItem(loItem);*/
                        sap.ui.getCore().byId("table").setNoData(new sap.ui.commons.TextView({
                            text: "<Find needs atleast two characters>"
                        }));
                        //status.setValue("");
                        loButtonOK.setEnabled(false);
                    }
                }
            });
            loSearch.addStyleClass("searchInputField");
            loMatrix.createRow(loSearch);

            var loResultLabel = new sap.ui.commons.Label("findobject-result-header", {
                text: "Matching items:"
            });
            loMatrix.createRow(loResultLabel);

            /*var loMatchingList = new sap.ui.commons.ListBox("findobject-result-list", {
                displayIcons: true,
                allowMultiSelect: false,
                width: '500px',
                height: '20px',
                visibleItems: 5,
                select: function(ioEvent) {
                    if (loMatchingList.getSelectedIndex() >= 0) {
                        loButtonOK.setEnabled(true);
                    } else {
                        loButtonOK.setEnabled(false);
                    }
                    var selectedItem = loMatchingList.getSelectedItem();
                    if (selectedItem !== null) {
                        var uri = selectedItem.getAdditionalText();
                        if (uri == "<Find needs atleast two characters>") {
                            loButtonOK.setEnabled(false);
                            status.setValue("");
                        } else {
                            status.setValue(uri);
                        }
                    }
                }
            });
            loMatchingList.attachBrowserEvent('dblclick', function() {
                var selectedItem = loMatchingList.getSelectedItem();
                if (selectedItem !== null) {
                    var uri = selectedItem.getText();
                    if (uri != "<Find needs atleast two characters>") {
                        var finalName, finalType, packageName = "",
                            schemaName = "";
                        var name = uri.split(" (");
                        finalName = name[0];
                        var type = name[0].split(".");
                        finalType = type[1];
                        if (finalType == "calculationview") {
                            packageName = selectedItem.getAdditionalText();
                        } else {
                            schemaName = selectedItem.getAdditionalText();
                        }

                        var obj = {
                            name: finalName,
                            type: finalType,
                            schemaName: packageName,
                            packageName: schemaName,
                        };
                        data.push(obj);
                        loThisDia.destroy();
                    } else {
                        status.setValue("");
                    }
                }
            });*/

            //loMatrix.createRow(loMatchingList);

            //Create table instead of ListBox
            //Create an instance of the table control
            var oTable = new sap.ui.table.Table("table", {
                //title: "Table Example",
                visibleRowCount: 6,
                firstVisibleRow: 0,
                showNoData: true,
                width: '500px',
                //columnHeaderHeight: 30,
                //rowHeight: 2,
                showColumnVisibilityMenu: true,
                fixedColumnCount: 0,
                selectionMode: sap.ui.table.SelectionMode.Single,
                selectionBehavior: "RowOnly",
                enableCellFilter: true,
                enableColumnFreeze: false,
                enableColumnReordering: false,
                navigationMode: sap.ui.table.NavigationMode.Scrollbar,
                /*toolbar: new sap.ui.commons.Toolbar({}),*/
                extension: [new sap.ui.commons.Button({
                    icon: resourceLoader.getImagePath("filter2.png", "analytics"),
                    //width: '25px',
                    press: function() {
                        jQuery.sap.require('sap.m.NavContainer');
                        var oData = {
                            lists: [{
                                title: "List1",
                                values: createListValues(5)
                            }, {
                                title: "List2",
                                values: createListValues(5)
                            }, {
                                title: "List3",
                                values: createListValues(5)
                            }]
                        };
                        var oModel = new sap.ui.model.json.JSONModel(oData);

                        var oFF = new sap.m.FacetFilter({
                            showPersonalization: true,
                            lists: {
                                path: "/lists",
                                template: new sap.m.FacetFilterList({
                                    title: "{title}",
                                    items: {
                                        path: "values",
                                        template: new sap.m.FacetFilterItem({
                                            key: "{key}",
                                            text: "{text}",
                                            count: "{count}",
                                        })
                                    }
                                })
                            },
                        });


                        oFF.setModel(oModel);

                        oFF.getLists()[0].setSelectedKeys({
                            'val1': 'Val1'
                        });
                        //});
                    }
                })],



                rowSelectionChange: function(oEvent) {
                    var index = oTable.getSelectedIndex();
                    if (index >= 0) {
                        loButtonOK.setEnabled(true);
                    } else {
                        loButtonOK.setEnabled(false);
                    }
                    var rows = oTable.getRows();
                    var selectedRow = rows[index];
                    if (selectedRow !== null) {

                    }
                },

                /*cellClick: function(oEvent) {
                    var index = oTable.getSelectedIndex();
                    if (index >= 0) {
                        loButtonOK.setEnabled(true);
                    } else {
                        loButtonOK.setEnabled(false);
                    }
                    var rows = oTable.getRows();
                    var selectedRow = rows[index];
                    if (selectedRow !== null) {

                    }
                }*/
            });

            function createListValues(nCount) {
                var aVals = [];
                for (var i = 1; i < nCount + 1; i++) {
                    aVals.push({
                        text: "Val" + i,
                        key: "val" + i,
                        count: i
                    });
                }
                return aVals;
            }

            oTable.attachBrowserEvent('dblclick', function(oEvent) {
                var index = oTable.getSelectedIndex();
                if (index >= 0) {
                    loButtonOK.setEnabled(true);
                } else {
                    loButtonOK.setEnabled(false);
                }
                var rows = oTable.getRows();
                var selectedRow = rows[index];
                if (selectedRow !== null) {

                }
                loThisDia.destroy();
            });

           // oTable.addStyleClass("customTable");
            loMatrix.createRow(oTable);

            // Template for View Icon and ObjectName
            var labelTemplate1 = new sap.ui.commons.Label({
                icon: "{viewIcon}",
                text: "{objectName}"
            });

            // Icon and ObjectName
            var oColumn = new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "Name"
                }),
                template: labelTemplate1,
                sortProperty: "objectName",
                //filterProperty: "objectName",
                width: "40%",
                hAlign: "Center",
                resizable: false,
            });
            oTable.addColumn(oColumn);

            // Template for Package Icon and Package/Schema Name
            var labelTemplate2 = new sap.ui.commons.Label({
                icon: "{packIcon}",
                text: "{packageName}"
            });

            // Icon and Package/Schema name
            oTable.addColumn(new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "Package/Schema"
                }),
                template: labelTemplate2,
                sortProperty: "packageName",
                filterProperty: "packageName",
                width: "60%",
                hAlign: "Center",
                resizable: false,
            }));

            /*var status = new sap.ui.commons.TextArea("status", {
                width: '500px',
                height: '20px',
                rows: 1,
                editable: false,
                visible: false,
                value: " ",
                //placeholder: 'Package/Schema name'
            });

            loMatrix.createRow(status);*/

            var loButtonCancel = new sap.ui.commons.Button({
                tooltip: "Cancel",
                text: "Cancel",
                press: function() {
                    loThisDia.destroy();
                }
            });

            var loButtonOK = new sap.ui.commons.Button({
                tooltip: "Ok",
                text: "OK",
                enabled: false,
                press: function() {
                    var index = oTable.getSelectedIndex();
                    if (index >= 0) {
                        loButtonOK.setEnabled(true);
                        var rows = oTable.getRows();
                        var selectedRow = rows[index];
                    } else {
                        loButtonOK.setEnabled(false);
                    }
                    if (selectedRow !== null) {
                        var finalName, finalType, packageName = "",
                            schemaName = "";
                        //var uri = selectedRow.getText();
                        /*var name = uri.split(" (");
                        finalName = name[0];
                        var type = name[0].split(".");
                        finalType = type[1];*/
                        /*if (finalType == "calculationview") {
                            packageName = selectedItem.getAdditionalText();
                        } else {
                            schemaName = selectedItem.getAdditionalText();
                        }*/

                        var obj = {
                            name: finalName,
                            type: finalType,
                            schemaName: packageName,
                            packageName: schemaName,
                        };
                        data.push(obj);
                        loThisDia.destroy();
                    }
                }
            });
            loThisDia.addButton(loButtonOK);
            loThisDia.addButton(loButtonCancel);
            loThisDia.setInitialFocus(loSearch);
            loThisDia.open();
        },

        /* _internalToExternalURI: function(isURI) {
            var lsURI = isURI;
            return "/" + lsURI;
        },


        _isFileInFocus: function(isURI) {
            var loFileService = this.context.service.filesystem.documentProvider;
            var loContentService = this.context.service.content;
            return loFileService.getDocument(this._internalToExternalURI(isURI)).then(function(ioDocument) {
                return loContentService.getCurrentDocument().then(function(ioCurrentDocument) {
                    return (ioCurrentDocument !== null && ioDocument.getEntity().getKeyString() === ioCurrentDocument.getEntity().getKeyString()) ? true : false;
                });
            });
        },

        _openFile: function(isURI) {
            var that = this;

            return this._isFileInFocus(isURI).then(function(ibOpen) {
                if (ibOpen === true) {
                    return true;
                } else {
                    var loFileService = that.context.service.filesystem.documentProvider;
                    var loEditorService = that.context.service.editor;
                    var loContentService = that.context.service.content;
                    return loFileService.getDocument(that._internalToExternalURI(isURI)).then(function(ioDocument) {
                        loEditorService.getDefaultEditor(ioDocument).then(function(ioEditor) {
                            return loContentService.open(ioDocument, ioEditor.service);
                        });
                    });
                }
            });
        },*/

        /*_populateResults: function(ioResults, searchString) {
            //sap.ui.getCore().byId("findobject-result-list").removeAllItems();

            for (var i = 0; i < ioResults.length; i++) {
                var packageName = ioResults[i].objectID.package;
                var result = ioResults[i].fileName + " (" + ioResults[i].objectID.package + ")";
                var imageIcon;
                if (ioResults[i].objectID.stype == "calculationview") {
                    imageIcon = resourceLoader.getImagePath("calculation_scenario.png", "analytics");
                } else {
                    imageIcon = resourceLoader.getImagePath("Table.png", "analytics");
                }
                //result.
                var loItem = new sap.ui.core.ListItem({
                    text: result,
                    additionalText: packageName,
                    icon: imageIcon,
                });
                sap.ui.getCore().byId("findobject-result-list").addItem(loItem);
            }

            if (ioResults.length > 1000) {
                sap.ui.getCore().byId("findobject-result-header").setText("More than 1000 matching items:");
            } else {
                sap.ui.getCore().byId("findobject-result-header").setText(ioResults.length + " matching items:");
            }
        },*/

        _populateResultsInTable: function(ioResults) {
            var aData = [];
            for (var i = 0; i < ioResults.length; i++) {
                var objIcon, packIcon;
                if (ioResults[i].objectID.stype == "calculationview") {
                    objIcon = resourceLoader.getImagePath("calculation_scenario.png", "analytics");
                    packIcon = resourceLoader.getImagePath("package_native.png", "analytics");
                } else {
                    objIcon = resourceLoader.getImagePath("Table.png", "analytics");
                    packIcon = resourceLoader.getImagePath("schema.png", "analytics");
                }
                var obj = {
                    viewIcon: objIcon,
                    objectName: ioResults[i].objectID.name,
                    packIcon: packIcon,
                    packageName: ioResults[i].objectID.package
                };
                aData.push(obj);
            }

            //Create a model and bind the table rows to this model
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
                modelData: aData
            });
            sap.ui.getCore().byId("table").setModel(oModel);
            sap.ui.getCore().byId("table").bindRows("/modelData");

            //Initially sort the table
            //sap.ui.getCore().byId("table").sort(oTable.getColumns()[0]);

            if (ioResults.length > 1000) {
                sap.ui.getCore().byId("findobject-result-header").setText("More than 1000 matching items:");
            } else {
                sap.ui.getCore().byId("findobject-result-header").setText(ioResults.length + " matching items:");
            }
        }

    };
    return FindDialog;
});
