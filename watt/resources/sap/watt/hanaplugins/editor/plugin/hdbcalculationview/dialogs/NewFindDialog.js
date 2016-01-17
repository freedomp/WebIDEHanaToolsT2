/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader",
    "../view/MultiComboBox",
    "../base/MetadataServices"
], function(ResourceLoader, MultiCombobox, MetadataServices) {

    var NewFindDialog = function(sId, mSettings) {
        this._content = null;
        this.types = mSettings.types;
        this.noOfSelection = mSettings.noOfSelection; 
        this.context = mSettings.context;
        this.onOK = mSettings.onOK;
        this.execute();
        // this.oSearchString = "**";
        this.currentViewName = mSettings.currentViewName;
    	this.currentCVname = this.context.currentCVname;
        //this for replace data source
        this.replaceDataSourceDailog = mSettings.replaceDataSourceDailog;
        this.onSelectTableRow = mSettings.onSelectTableRow;
        this.onPressNext = mSettings.onNext;
    };
    var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

    var myService = MetadataServices.SearchService;
    //var noOfRecords = 0;

    // enums for object types
    var objectTypes = {
        TABLE: "TABLE",
        VIEW: "VIEW",
        FUNCTION: "FUNCTION",
        REPO_PROCEDURE: "REPO_PROCEDURE",
        CALC_VIEW: "CALCULATIONVIEW",
        ANALYTIC_VIEW: "ANALYTICVIEW",
        ATTR_VIEW: "ATTRIBUTEVIEW",
        CATALOG_PROCEDURE: "CATALOG_PROCEDURE",
        TABLEFUNCTION: "TABLEFUNCTION",
        SCALAR_FUNCTION: "HDBSCALARFUNCTION",
        GRAPH_WORKSPACE: "GRAPH_WORKSPACE",
		CDS_STRUCTURE_TYPE: "CDS_STRUCTURE_TYPE"
    };

    var mapTypes = {
        "CALCULATIONVIEW": "Calculation View",
        "TABLE": "Table",
        "VIEW": "View",
        "ANALYTICVIEW": "Analytic View",
        "ATTRIBUTEVIEW": "Attribute View",
        "TABLEFUNCTION": "Table Function",
        "CALCULATIONVIEW_HISTORY": "Calculation View History",
        "DATA_BASE_TABLE": "Data Base Table",
        "GRAPH_WORKSPACE": "Graph Workspace",
		"CDS_STRUCTURE_TYPE": "CDS Structure Type"
    };
   // var SelectionType = ["CALCULATIONVIEW", "TABLE", "VIEW", "TABLEFUNCTION"];


    NewFindDialog.prototype = {

        _goIO: undefined,

        execute: function() {
            this.searchFile();
            // return data;
        },

        isAvailable: function() {
            return true;
        },

        isEnabled: function() {
            return true;
        },
        getDialogContend: function() {
            var that = this;
            if (that.replaceDataSourceDailog) {
                this.searchFile();
                return that.loMatrix;
            }
        },
        closeDialog: function() {
            if (sap.ui.getCore().byId("findobjects-dialog-form")) {
                sap.ui.getCore().byId("findobjects-dialog-form").destroy();
            }
        },
        pressOK: function() {
            if (this.ok) {
                this.ok.firePress();
            }
        },

        searchFile: function() {
            var that = this;

            if (sap.ui.getCore().byId("findobjects-dialog-form")) {
                sap.ui.getCore().byId("findobjects-dialog-form").destroy();
            }
            var loThisDia = new sap.ui.commons.Dialog("findobjects-dialog-form", {
                width: '545px',
                height: '430px',
                tooltip: "Find objects",
                modal: true,
                resizable: true

            });
            loThisDia.addStyleClass("FindDialogTitle");
            loThisDia.setTitle(resourceLoader.getText("txt_find_title"));
            /*var loThisDia = new sap.m.Dialog("findfile-dialog-form", {
            "contentWidth": "auto",
            "title" : "Find"
            });*/

            that.loMatrix = new sap.ui.commons.layout.MatrixLayout({
                layoutFixed: false,
                width: '100%',
                columns: 2
            });
            loThisDia.addContent(that.loMatrix);
            var loLabel1 = new sap.ui.commons.Label({
                text: resourceLoader.getText("txt_find_search_text")
            });
            that.loMatrix.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
                colSpan: 2
            }).addContent(loLabel1));
            /*this.serviceText = new sap.ui.commons.TextField({});
                                                                                                                                                                                                that.loMatrix.createRow();
                                                                                                                                                                                                that.loMatrix.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
                                                                                                                                                                                                                content:[new sap.ui.commons.Label({
                                                                                                                                                                                                                text:"Service Name"
                                                 }),this.serviceText]
                                                                                                                                                                                                }),null); */

            var multiComboBox = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MultiCombobox();
            var reqTypes = this.types;
            var reqItems = [];
            var selItems=[];
            for (var i in reqTypes) {
                if (reqTypes[i] === "CALCULATIONVIEW" || reqTypes[i] === "VIEW" || reqTypes[i] === "TABLE" || reqTypes[i] === "GRAPH_WORKSPACE" ||  reqTypes[i] === "CDS_STRUCTURE_TYPE")
                    reqItems.push({
                        key: reqTypes[i],
                        text: mapTypes[reqTypes[i]]
                    });
                 if(reqTypes[i] === "hdbtablefunction") {
                 	reqItems.push({
                        key: "TABLEFUNCTION",
                        text: mapTypes["TABLEFUNCTION"]
                    });
                 }
            }
            //multiComboBox.setItems(reqItems);
            multiComboBox.setItems(reqItems);
            for(var j=0; j<reqItems.length;j++){
				selItems.push(reqItems[j].key);
            }
            multiComboBox.setSelections(selItems);            
			/*if(reqItems.length < 2 && (reqItems[0].key === "GRAPH_WORKSPACE" || reqItems[0].key === "CALCULATIONVIEW" || reqTypes[i] === "CDS_STRUCTURE_TYPE")){
              multiComboBox.setSelections([reqItems[0].key]);
            } else{
              multiComboBox.setSelections(SelectionType);
            }*/

            //Create a model and bind the table rows to this model
            var oModel = new sap.ui.model.json.JSONModel();
            var xhr = null;
		
            var search = function(value, type) {
					if(value.length < 2) { //Clearing all data when search string is lesser than 2 characters
						oModel.setData({}) 
					}
				else {
                var onSuccess = function(result) {
                	var resultList = JSON.parse(result);
                	for(var i=0; i<resultList.dbobjects.length ; i++) {
					if(that.currentCVname === resultList.dbobjects[i].name){
							resultList.dbobjects.splice(i,1);
						}
				}
				result = JSON.stringify(resultList);
                    if(result === "{\"dbobjects\":[]}") { //No Result Case
                        oModel.setData({}) 
                             that.oTable.setNoData(new sap.ui.commons.TextView({
                            text: "No Result"
                        }));
                    }
                    else{
                    oModel.setData({// Result Case (when all conditions are satisfied)
                        modelData: JSON.parse(result)
                    });
                    }
                };
				}
                var onError = function() {};
                myService.search(("*" + value + "*"), type, that.context.serviceName, onSuccess, onError);
            };

            //  updateSeach("**");  //for diabling initail searching
            var loSearch = new sap.ui.commons.SearchField({
                width: '340px',
                enableListSuggest: false,
                enableClear: true,
                startSuggestion: 0,
                suggest: function() {
                    var types = multiComboBox.getSelections();
					if($('#' + this.getId() + "-tf-input").val().length < 2){//Less than 2 characters should not initiate search
						 that.oTable.setNoData(new sap.ui.commons.TextView({
                            text: "<Find Service needs atleast two characters>"
                        }));
						search($('#' + this.getId() + "-tf-input").val(), types);// Calling search in this case to clear the values that are there in teh table already
					}
					else{
                    search($('#' + this.getId() + "-tf-input").val(), types);
                     that.oTable.setNoData(new sap.ui.commons.TextView({ //Text Searching
                            text: "Searching.."
                        }));
					}
                }
            });

            //loSearch.addStyleClass("searchInputField");
            that.loMatrix.createRow(multiComboBox, loSearch);
            loThisDia.setInitialFocus(loSearch);

            that.loResultLabel = new sap.ui.commons.Label( /*"findobjects-result-header",*/ {
                text: resourceLoader.getText("txt_find_found")
            });
            that.loMatrix.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
                colSpan: 2
            }).addContent(that.loResultLabel));
            var selectionMode = sap.ui.table.SelectionMode.Multi;

            if (that.noOfSelection === 1) {
                selectionMode = sap.ui.table.SelectionMode.Single;
            }

            this.oTable = new sap.ui.table.Table({
                //  visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                firstVisibleRow: 0,
                visibleRowCount: 5,
                showNoData: true,
                width: '100%',
                height: '100%',
                showColumnVisibilityMenu: false,
                fixedColumnCount: 0,
                selectionMode: selectionMode,
                selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
                enableCellFilter: true,
                navigationMode: sap.ui.table.NavigationMode.Scrollbar,
                rowSelectionChange: function(event) {
                    var index = that.oTable.getSelectedIndices();
                    if (index.length > 0) {
                        if (that.replaceDataSourceDailog) {
                            that.onSelectTableRow(true);
                        }
                        loButtonOK.setEnabled(true);
                    } else {
                        if (that.replaceDataSourceDailog && event.type === "click") {
                            that.onSelectTableRow(false);
                        }
                        loButtonOK.setEnabled(false);
                    }
                    /* var rows = that.oTable.getRows();
                    var selectedRow = rows[index];
                    if (selectedRow !== null) {

                    }*/
                }

            });


            this.oTable.setModel(oModel);
            this.oTable.bindRows("/modelData/dbobjects");

            that.oTable.setNoData(new sap.ui.commons.TextView({
                text: resourceLoader.getText("txt_find_search_text")
            }));


            this.oTable.addStyleClass("customTable");
            this.oTable.addStyleClass("calcViewTableInDialog");
            that.loMatrix.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
                colSpan: 2
            }).addContent(this.oTable));

            // Icon and Package/Schema name
            this.oTable.addColumn(new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_find_type")
                }),
                template: new sap.ui.commons.Label({
                    icon: {
                        path: "type",
                        formatter: function(Type) {
                            if (Type === objectTypes.CALC_VIEW) {
                                return resourceLoader.getImagePath("calculation_scenario.png", "analytics");
                            } else if (Type === objectTypes.ANALYTIC_VIEW) {
                                return resourceLoader.getImagePath("AnalyticView.png", "analytics");
                            } else if (Type === objectTypes.ATTR_VIEW) {
                                return resourceLoader.getImagePath("AttributeView.png", "analytics");
                            } else if (Type === "PROCEDURE" || Type === "HDBPROCEDURE") {
                                return resourceLoader.getImagePath("procedure.jpg", "analytics");
                            } else if (Type === objectTypes.TABLE) {
                                return resourceLoader.getImagePath("Table.png", "analytics");
                            } else if (Type === objectTypes.VIEW) {
                                return resourceLoader.getImagePath("view.jpg", "analytics");
                            } else if (Type && Type.toUpperCase() == "TABLEFUNCTION") {
                                return resourceLoader.getImagePath("TableFunction.gif", "analytics");
                            } else if (Type === objectTypes.SCALAR_FUNCTION) {
                                return resourceLoader.getImagePath("procedure.jpg", "analytics"); //this icon need to be change ...this temp
                            } else {
                                return resourceLoader.getImagePath("Table.png", "analytics");
                            }
                        }
                    }
                }),
                sortProperty: "type",
                filterProperty: "type",
                width: "15%",
                hAlign: "Center",
                resizable: true
            }));

            this.oTable.addColumn(new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_find_name")
                }),
                template: new sap.ui.commons.TextView().bindProperty("text", "name"),
                sortProperty: "folder",
                filterProperty: "folder",
                width: "30%",
                hAlign: "Center",
                resizable: true
            }));

            this.oTable.addColumn(new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_find_schema")
                }),
                template: new sap.ui.commons.TextView().bindProperty("text", "schema"),
                /*           sortProperty: "folder",
                                filterProperty: "folder",*/
                width: "30%",
                hAlign: "Center",
                resizable: true
            }));

            this.oTable.addColumn(new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_find_synonym")
                }),
                template: new sap.ui.commons.TextView(),
                /*           sortProperty: "folder",
                                filterProperty: "folder",*/
                width: "30%",
                hAlign: "Center",
                resizable: true
            }));


            var loButtonCancel = new sap.ui.commons.Button({
                //var loButtonCancel = new sap.m.Button({
                width: "48%",
				tooltip: resourceLoader.getText("txt_find_cancel"),
                text: resourceLoader.getText("txt_find_cancel"),
                press: function() {
                    that.onOK();
                    loThisDia.destroy();
                }
            });

            var okBtnPressed = function() {
                var index = that.oTable.getSelectedIndices();
                if (index.length >= 0) {
                    var data = [];
					for(var i=0;i<index.length;i++) {
                    var selectedObject = that.oTable.getContextByIndex(index[i]);
                    var modelIndex = selectedObject.sPath.split("/modelData/dbobjects/");
                    var element = that.oTable.getModel().getData().modelData.dbobjects[index[i]];
                    var obj = {
                        name: element.name,
                        id:element.name,
                        isColumnView:element.isColumnView,
                        namepsace: that.context.namespace,
                        type: element.type,
                        packageName: element.packageName ? element.packageName : undefined,
                        physicalSchema: element.schemaName ? element.schemaName : undefined,
                        schemaName: element.schema ? element.schema : undefined
                    };
                    data.push(obj);
					}



                    that.oTable.clearSelection();
                    that.onOK(data);
                    if (!that.replaceDataSourceDailog) {
                        loThisDia.destroy();
                    }


                    //.done();

                }
            };

            var loButtonOK = new sap.ui.commons.Button( /*"OK",*/ {
                //var loButtonOK = new sap.m.Button({
                tooltip: resourceLoader.getText("txt_find_ok"),
                text: resourceLoader.getText("txt_find_ok"),
                enabled: false,
                press: function() {
                    okBtnPressed();

                }

            });
            that.ok = loButtonOK;
            if (!that.replaceDataSourceDailog) {
                loThisDia.addButton(loButtonOK);
                loThisDia.addButton(loButtonCancel);
                loThisDia.open();
            }

        }
    };
    return NewFindDialog;
});
