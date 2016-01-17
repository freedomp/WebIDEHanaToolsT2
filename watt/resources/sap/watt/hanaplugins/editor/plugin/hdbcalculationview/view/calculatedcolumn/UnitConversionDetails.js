/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "../dialogs/ValueHelpDialog",
        "../../base/MetadataServices"
    ],
    function(ResourceLoader, modelbase, commands, CalcViewEditorUtil, ValueHelpDialog, MetadataServices) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
        var myService = MetadataServices.SearchService;
       // var schemaMapping = SchemaMappingService.schemaMapping;
        var schemas;

        /**
         * @class
         */
        var UnitConversionDetails = function(parameters) {
            this._undoManager = parameters.undoManager;
            this.context = parameters.context;
            this.viewnode = parameters.viewnode;
            this.element = parameters.element;
            this.isDialog = parameters.isDialog;
            this.commands = [];
            this.attributes = {};
            this.elementAttribute = {};

        };

        UnitConversionDetails.prototype = {

            _execute: function(command) {
                return this._undoManager.execute(command);
            },

            close: function() {

            },

            getContent: function() {
                var that = this;
                var setEnabled;
                var setModel;

                var oLayout = new sap.ui.layout.VerticalLayout({
                    width: "100%"

                });

                var topMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    layoutFixed: false,
                    width: "100%",
                    widths: ["60%", "40%"]
                });

                topMatrixLayout.addStyleClass("currencyHeader");

                var currencyLabel = new sap.ui.commons.Label({
                    text: "Display Unit"
                });

             /*   var currencyTypeImage = new sap.ui.commons.Image({
                    src: "{selection>/currencyTypeIcon}"
                });*/

                var currencyTypeCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
                    width: "100%",
                   // icon: currencyTypeImage,
                    change: function(oevent) {
                        var value = oevent.getParameter("newValue");
                      /*  if (value === "Column") {
                            currencyTypeImage.setSrc(resourceLoader.getImagePath("Column.png"));
                        } else if (value === "Fixed") {
                            currencyTypeImage.setSrc(resourceLoader.getImagePath("fixed-currency.png"));
                        } else {
                            currencyTypeImage.setSrc(resourceLoader.getImagePath("Parameter.png"));
                        }*/

                    }


                }).addStyleClass("borderIconCombo");

                var unitCurrencyField = new sap.ui.commons.TextField({
                    //   editable: false,
                    width: "100%",
                    value: "{/unitCurrencyElement}",
                    change: function(event) {
                        if (currencyTypeCombo.getSelectedKey() === "column") {
                            var unitElement;
                            var name = this.getValue();
                            that.viewnode.elements.foreach(function(element) {
                                if (element.name === name) {
                                    unitElement = element;
                                }

                            });

                            /*var attributes = {

                            };*/
                            if (unitElement) {
                                that.elementAttribute.unitCurrencyElement = unitElement;
                                
                                if (!that.isDialog) {
                                    var command = new commands.ChangeElementPropertiesCommand(that.viewnode.name, that.element.name, that.elementAttribute);
                                    that._execute(command);
                                    that.elementAttribute = {};
                                }
                                /*else {
                                    that.commands.push(command);
                                }*/
                                this.setValue(name);
                                CalcViewEditorUtil.clearErrorMessageTooltip(this);
                            } else {
                                CalcViewEditorUtil.showErrorMessageTooltip(this, "Column does not exist");
                            }

                        } else {

                            var name = this.getValue();
                            /* var attributes = {

                            };*/
                            var unitCurrencyElement = {
                                fixedCurrency: name
                            };
                            that.elementAttribute.unitCurrencyElement = unitCurrencyElement;
                           
                            if (!that.isDialog) {
                                 var command = new commands.ChangeElementPropertiesCommand(that.viewnode.name, that.element.name, that.elementAttribute);
                                that._execute(command);
                                that.elementAttribute = {};
                            }
                            /*else {
                                that.commands.push(command);
                            }*/
                            this.setValue(name);
                            CalcViewEditorUtil.clearErrorMessageTooltip(this);
                        }

                    }
                });

                unitCurrencyField.addStyleClass("currencyText");



                var oItemTemplate = new sap.ui.core.ListItem();
                oItemTemplate.bindProperty("key", "key");
                oItemTemplate.bindProperty("text", "value");
                oItemTemplate.bindProperty("icon", "icon");
                var listBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/items",
                        template: oItemTemplate
                    }
                });
                currencyTypeCombo.setListBox(listBox);

                var cell_1 = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2
                });
                cell_1.createRow(currencyLabel, currencyTypeCombo);

                var typeLabel = new sap.ui.commons.Label({
                    text: "Type"
                });


                var oItemTemplate = new sap.ui.core.ListItem();
                oItemTemplate.bindProperty("key", "key");
                oItemTemplate.bindProperty("text", "value");
                oItemTemplate.bindProperty("icon", "icon");
                currencyTypeCombo.bindItems("/items", oItemTemplate);

                if (that.element.unitConversion) {
                    currencyTypeCombo.setModel(that.getCurrencyColumnType());
                } else {
                    currencyTypeCombo.setModel(that.getCurrencyType());
                }

                var currencyButton = new sap.ui.commons.Button({
                    icon: "sap-icon://value-help",
                    press: function() {
                        var fnCallBack = function(result) {
                            if (result instanceof Object) {
                                var unitElement;
                                that.viewnode.elements.foreach(function(element) {
                                    if (element.name === result.name) {
                                        unitElement = element;
                                    }
                                });
                                if (that.viewnode && that.viewnode.isStarJoin()) {
                                    that.viewnode.inputs.foreach(function(ip) {
                                        if (ip.selectAll) {
                                            ip.getSource().elements.foreach(function(element) {
                                                if (element.name === result.name) {
                                                    unitElement = element;
                                                }
                                            });
                                        }
                                    });
                                }
                                if (!unitElement) {
                                    if (that.element && that.element.unitConversion && that.element.unitConversion.outputUnitCurrencyElement) {
                                        unitElement = that.element.unitConversion.outputUnitCurrencyElement
                                    }
                                }
                                /*  var attributes = {};*/
                                var unitCurrencyElement = {
                                    element: result
                                };
                                that.elementAttribute.unitCurrencyElement = unitCurrencyElement;
                               
                                if (!that.isDialog) {
                                     var command = new commands.ChangeElementPropertiesCommand(that.viewnode.name, that.element.name, that.elementAttribute);
                                    that._execute(command);
                                    that.elementAttribute = {};
                                }
                                /*else {
                                    that.commands.push(command);
                                }*/
                                unitCurrencyField.setValue(unitElement.name);
                                CalcViewEditorUtil.clearErrorMessageTooltip(unitCurrencyField);

                            } else {
                                /* var attributes = {};*/
                                var unitCurrencyElement = {
                                    fixedCurrency: result
                                };
                                that.elementAttribute.unitCurrencyElement = unitCurrencyElement;
                                
                                if (!that.isDialog) {
                                    var command = new commands.ChangeElementPropertiesCommand(that.viewnode.name, that.element.name, that.elementAttribute);
                                    that._execute(command);
                                    that.elementAttribute = {};
                                }
                                /*else {
                                    that.commands.push(command);
                                }*/
                                unitCurrencyField.setValue(result);
                                CalcViewEditorUtil.clearErrorMessageTooltip(unitCurrencyField);
                            }
                        };

                        var title = "";
                        if (currencyTypeCombo.getSelectedKey() === "fixed") {
                            title = "Select Unit";
                        } else if (currencyTypeCombo.getSelectedKey() === "column") {
                            title = "Select Column";
                        }
                        var schema;
                        var isDefaultSchemaset = false;
                        for (var i = 0; i < that.commands.length; i++) {
                            var command = that.commands[i];
                            if (command.schema) {
                                schema = command.schema;
                                break;
                            }
                        }
                        
                         if (that.attributes.schema !== "<None>" && that.attributes.schema !== undefined) {
                            schema = that.attributes.schema;
                        }
                        if (!schema) {
                            if (that.element.unitConversion && that.element.unitConversion.schema) {
                                schema = that.element.unitConversion.schema.schemaName;
                            } else {
                                if (that.viewnode) {
                                    var view = that.viewnode.$$containingFeature._owner;
                                    if (view.defaultSchema) {
                                        isDefaultSchemaset = true;
                                      /*  schemaMapping.getPhysicalSchema(view.defaultSchema, that.context, function(results) {

                                            if (results) {
                                                schema = results;
                                            } else {
                                                schema = view.defaultSchema;
                                            }
                                            var valueHelpDialog = new ValueHelpDialog({
                                                undoManager: that._undoManager,
                                                fnCallBack: fnCallBack,
                                                context: that.context,
                                                selectedItem: currencyTypeCombo.getSelectedKey(),
                                                viewnode: that.viewnode,
                                                title: title,
                                                isUnit: true,
                                                schema: schema,
                                                unitCode: true,
                                                selectedElement: that.element
                                            });

                                            valueHelpDialog.openDialog();
                                        });*/
                                    }
                                }

                            }
                        }
                        if (!isDefaultSchemaset) {
                            var valueHelpDialog = new ValueHelpDialog({
                                undoManager: that._undoManager,
                                fnCallBack: fnCallBack,
                                context: that.context,
                                selectedItem: currencyTypeCombo.getSelectedKey(),
                                viewnode: that.viewnode,
                                title: title,
                                 isUnit: true,
                                //isUnit: false,
                                schema: schema,
                                unitCode: true,
                                selectedElement: that.element
                            });

                            valueHelpDialog.openDialog();
                        }
                    }
                });
                var cell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    widths: ["80%", "20%"],
                    width: "100%"

                });
                cell.createRow(unitCurrencyField, currencyButton);

                cell.addStyleClass("currencyBrowseButton");
                currencyLabel.addStyleClass("labelFloat");

                topMatrixLayout.createRow(cell_1, cell);


                var topMatrixLayout_1 = new sap.ui.commons.layout.MatrixLayout({
                    columns: 1,
                    layoutFixed: false,
                    width: "100%"
                    //   widths: ["40%", "60%"]
                });

                topMatrixLayout.addStyleClass("currencyHeader");
                topMatrixLayout_1.addStyleClass("currencyCheckBox");
                var enableConversionCheck = new sap.ui.commons.CheckBox({
                    text: "Enable Conversion",
                    checked: false,
                    change: function() {
                        if (this.getChecked()) {
                            setEnabled(true);
                        } else {
                            setEnabled(false);
                        }
                        var schema;
                        if (this.getChecked()) {
                            if (that.viewnode) {
                                var view = that.viewnode.$$containingFeature._owner;
                                if (view.defaultSchema) {
                                    schema = view.defaultSchema;
                                }
                            }
                        }
                        that.attributes = {
                            isCreate: this.getChecked(),
                            schema: schema
                        };
                        if (schema) {
                            schemaCurrencyField.setValue(schema);
                        }
                       
                        if (!that.isDialog) {
                             var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                            that._execute(command);
                            that.attributes={};
                        }
                        /* else {
                            that.commands.push(command);
                        }*/

                        if (this.getChecked()) {
                            currencyTypeCombo.setModel(that.getCurrencyColumnType());
                            if (!that.element.unitCurrencyElement) {
                                //unitCurrencyField.setValue("");
                            }
                        } else {
                            currencyTypeCombo.setModel(that.getCurrencyType());
                            if (that.element.unitCurrencyElement) {
                                currencyTypeCombo.setSelectedKey("column");
                            }
                        }

                       /* if (currencyTypeCombo.getValue() === "Column") {
                            currencyTypeImage.setSrc(resourceLoader.getImagePath("Column.png"));
                        } else {
                            currencyTypeImage.setSrc(resourceLoader.getImagePath("fixed-currency.png"));
                        }*/
                        setModel();

                    }
                }).addStyleClass("dummyTest1");
                if (that.element.unitConversion) {
                    enableConversionCheck.setChecked(true);
                } else {
                    enableConversionCheck.setChecked(false);
                }

                topMatrixLayout_1.createRow(enableConversionCheck);

                //   oLayout.addContent(toolBar);
                var button = new sap.ui.commons.Button({
                    text: "Back",
                    press: function(oevent) {
                        /*  if (that.callBack) {
                            that.callBack();
                        }*/
                    }
                });

                var toolbarMatrixlayout = new sap.ui.commons.layout.MatrixLayout({
                    width: "100%"
                });


                oLayout.addContent(topMatrixLayout);
                oLayout.addContent(topMatrixLayout_1);
                oLayout.addContent(this.getHeaderLayout("CONVERSION"));

                var conversionMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    layoutFixed: false,
                    width: "100%",
                    widths: ["60%", "40%"]
                });

                conversionMatrixLayout.addStyleClass("currencyHeader");

                var topMatrixLayout_2 = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    layoutFixed: false,
                    width: "100%",
                    widths: ["29.5%", "70.5%"]
                });

                topMatrixLayout_2.addStyleClass("currencyHeader");

                var schemaCurrencyLabel = new sap.ui.commons.Label({
                    text: "Schema for Unit Conversion",
                    	required: true,
						requiredAtBegin:true
                });
                var schemaCurrencyCell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2
                });

                var schemaCurrencyCombo = new sap.ui.commons.DropdownBox({
                    width: "100%",
                    change: function(event) {

                    }
                });
                schemaCurrencyCombo.setModel(this.getCurrencyType());
                var oItemTemplate = new sap.ui.core.ListItem();
                oItemTemplate.bindProperty("key", "key");
                oItemTemplate.bindProperty("text", "value");
                schemaCurrencyCombo.bindItems("/items", oItemTemplate);
                // topMatrixLayout_2.createRow(schemaCurrencyLabel, schemaCurrencyCombo);

                var schemaCurrencyField = new sap.ui.commons.TextField({
                    editable: false,
                    width: "100%",
                    value: "{/schema}"
                });

                schemaCurrencyField.addStyleClass("currencyText");

                var schemaCurrencyButton = new sap.ui.commons.Button({
                    icon: "sap-icon://value-help",
                    press: function() {
                        if (tp1.isOpen()) {
                            tp1.close();
                        } else {
                            tp1.open(sap.ui.core.Popup.Dock.BeginCenter, sap.ui.core.Popup.Dock.EndCenter);
                        }

                    }
                });



                var selectedSchema;
                //Create a tree
                var oTree = new sap.ui.commons.Tree({
                    select: function(oEvent) {
                        selectedSchema = oEvent.getParameter("node").getText();
                    }
                });
                oTree.setWidth("220px");
                oTree.setHeight("300px");
                oTree.setShowHeader(false);
                oTree.setShowHeaderIcons(false);
                oTree.setShowHorizontalScrollbar(false);

                //create Tree Nodes
                var oNode1 = new sap.ui.commons.TreeNode({
                    text: "<None>",
                    expanded: true
                });
                var oNode2 = new sap.ui.commons.TreeNode({
                    text: "Currency Schemas",
                    icon: resourceLoader.getImagePath("folder.png", "analytics"),
                    expanded: true
                });
                var oNode3 = new sap.ui.commons.TreeNode({
                    text: "Unit Schemas",
                    icon: resourceLoader.getImagePath("folder.png", "analytics"),
                    expanded: true
                });
                var oNode4 = new sap.ui.commons.TreeNode({
                    text: "Other Schemas",
                    icon: resourceLoader.getImagePath("folder.png", "analytics"),
                    expanded: true
                });

                //add Tree Node root to the Tree
                oTree.addNode(oNode1);
                oTree.addNode(oNode2);
                oTree.addNode(oNode3);
                oTree.addNode(oNode4);
                oTree.addStyleClass("customProperties");
                oTree.attachBrowserEvent("keydown", function(evt) {
                    if (evt.keyCode == 13) {
                        var selectedNode;
                        if (oTree.oSelectedNode) {
                            selectedNode = oTree.oSelectedNode.getText();
                        }
                        if (selectedNode) {
                            setSchema();
                        }
                    }
                });

                var objectTypeContext = [];
                var modeArray_rt = [];
                var typesArray_rt = [];
                var mode_rt = {
                    "main": "RT"
                };
                modeArray_rt.push(mode_rt);
                var type = {
                    "main": "TABLE"
                };
                typesArray_rt.push(type);
                var objectModel = {
                    mode: modeArray_rt,
                    type: typesArray_rt
                };
                objectTypeContext.push(objectModel);

                var getSchemas = function() {
                    var q = Q.defer();

                    function onComplete(result) {
                        q.resolve(result);
                    }
                   /* if (that.context.service) {
                        that.context.service.catalogDAO.getSchemas(undefined, undefined, undefined, undefined,onComplete);
                        //.done();
                    }*/
                    return q.promise;
                };

                /*function getSchemaMapping() {
                    schemaMapping.getSchemaMapping(that.context, function(results) {
                        if (results) {
                            for (var i = 0; i < results.length; i++) {
                                var obj = results[i];
                                for (var j = 0; j < oNode2.getNodes().length; j++) {
                                    var node2SchemaName = oNode2.getNodes()[j].getText();
                                    if (node2SchemaName === obj[1]) {
                                        oNode2.getNodes()[j].setText(obj[0] + " (" + node2SchemaName + ")");
                                    }
                                }
                                for (var k = 0; k < oNode3.getNodes().length; k++) {
                                    var node3SchemaName = oNode3.getNodes()[k].getText();
                                    if (node3SchemaName === obj[1]) {
                                        oNode3.getNodes()[k].setText(obj[0] + " (" + node3SchemaName + ")");
                                    }
                                }
                                for (var l = 0; l < oNode4.getNodes().length; l++) {
                                    var node4SchemaName = oNode4.getNodes()[l].getText();
                                    if (node4SchemaName === obj[1]) {
                                        oNode4.getNodes()[l].setText(obj[0] + " (" + node4SchemaName + ")");
                                    }
                                }
                            }
                            //q.resolve();
                        }
                    });
                    //return q.promise;
                };*/
                var searchWithPromise = function(searchStr, node, objectTypeContext) {
                    var q = Q.defer();

                    function onComplete(result) {
                        var metadata = result.metadata;
                        q.resolve(metadata);
                    }

                    function onError(error) {
                        var errorText = JSON.stringify(error);
                        q.reject(errorText);
                    }
                    //myService.searchNew(searchStr, 'PATTERN', 100, false, false, true, onComplete, onError, objectTypeContext);
                    return q.promise;

                };



                Q.all([
                    getSchemas(),
                    searchWithPromise("T006", objectTypeContext),
                    searchWithPromise("TCUR", objectTypeContext)
                ])
                    .spread(function(schemas, unitResults, currResults) {
                        // here you combine the results and calculate the parameter for schema mapping
                        if (unitResults) {
                            for (var i = 0; i < unitResults.length; i++) {
                                var schemaFound = false;
                                if (unitResults[i].mainType === "TABLE") {
                                    for (var j = 0; j < oNode3.getNodes().length; j++) {
                                        if (oNode3.getNodes()[j].getText() === unitResults[i].schema) {
                                            schemaFound = true;
                                            break;
                                        } else {
                                            continue;
                                        }
                                    }
                                    if (!schemaFound) {
                                        var schemaInSchemas = false;
                                        if (schemas && schemas.schemas) {
                                            for (var k = 0; k < schemas.schemas.length; k++) {
                                                if (schemas.schemas[k].schemaName === unitResults[i].schema) {
                                                    schemaInSchemas = true;
                                                    break;
                                                } else {
                                                    continue;
                                                }
                                            }
                                        }
                                        if (schemaInSchemas) {
                                            oNode3.addNode(new sap.ui.commons.TreeNode({
                                                text: unitResults[i].schema,
                                                icon: resourceLoader.getImagePath("schema.png", "analytics")
                                            }));
                                        }
                                    }
                                }
                            }
                        }
                        if (currResults) {
                            for (var i = 0; i < currResults.length; i++) {
                                var schemaFound = false;
                                if (currResults[i].mainType === "TABLE") {
                                    for (var j = 0; j < oNode2.getNodes().length; j++) {
                                        if (oNode2.getNodes()[j].getText() === currResults[i].schema) {
                                            schemaFound = true;
                                            break;
                                        } else {
                                            continue;
                                        }
                                    }
                                    if (!schemaFound) {
                                        var schemaInSchemas = false;
                                        if (schemas) {
                                            for (var k = 0; k < schemas.schemas.length; k++) {
                                                if (schemas.schemas[k].schemaName === currResults[i].schema) {
                                                    schemaInSchemas = true;
                                                    break;
                                                } else {
                                                    continue;
                                                }
                                            }
                                        }
                                        if (schemaInSchemas) {
                                            oNode2.addNode(new sap.ui.commons.TreeNode({
                                                text: currResults[i].schema,
                                                icon: resourceLoader.getImagePath("schema.png", "analytics")
                                            }));
                                        }
                                    }
                                }
                            }

                        }

                        if (schemas) {
                            for (var i = 0; i < schemas.schemas.length; i++) {
                                var schemaFound = false;
                                for (var j = 0; j < oNode3.getNodes().length; j++) {
                                    if (oNode3.getNodes()[j].getText() === schemas.schemas[i].schemaName) {
                                        schemaFound = true;
                                        break;
                                    } else {
                                        continue;
                                    }
                                }
                                if (!schemaFound) {
                                    for (var k = 0; k < oNode2.getNodes().length; k++) {
                                        if (oNode2.getNodes()[k].getText() === schemas.schemas[i].schemaName) {
                                            schemaFound = true;
                                            break;
                                        } else {
                                            continue;
                                        }
                                    }
                                }
                                if (!schemaFound) {
                                    oNode4.addNode(new sap.ui.commons.TreeNode({
                                        text: schemas.schemas[i].schemaName,
                                        icon: resourceLoader.getImagePath("schema.png", "analytics")
                                    }));
                                }
                            }
                        }
                        //getSchemaMapping();
                    })
                // does default error handling, i.e. shows a message in case of exceptions
                .done();


                oTree.attachBrowserEvent('dblclick', function(oEvent) {
                    setSchema();
                });

                var setSchema = function() {
                    var selectedNode = selectedSchema;
                    schemaCurrencyField.setValue(selectedNode);
                    if (selectedNode === "<None>") {
                        that.attributes = {
                            schema: "<None>"
                        };
                       
                        if (!that.isDialog) {
                             var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                            that._execute(command);
                            that.attributes = {};
                        }
                        /*else {
                            that.commands.push(command);
                        }*/
                        schemaCurrencyField.setValue("");
                        tp1.close();
                    } else if (selectedNode !== "<None>" && selectedNode !== "Currency Schemas" && selectedNode !== "Unit Schemas" && selectedNode !== "Other Schemas") {
                        that.attributes = {
                            schema: selectedNode
                        };
                     
                        if (!that.isDialog) {
                               var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                            that._execute(command);
                            that.attributes = {};
                        }
                        /*else {
                            that.commands.push(command);
                        }*/
                        schemaCurrencyField.setValue(selectedNode);
                        tp1.close();
                    } else {
                        setModel();
                    }
                };

                var tp1 = new sap.ui.ux3.ToolPopup({
                    title: "Default Schema",
                    content: [oTree],
                    autoClose: true,
                    opener: schemaCurrencyButton
                });

                var schemaCurrencyCell_1 = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    widths: ["89%", "11%"],
                    width: "100%"

                });
                schemaCurrencyCell_1.createRow(schemaCurrencyField, schemaCurrencyButton);

                schemaCurrencyCell_1.addStyleClass("currencyBrowseButton");
                schemaCurrencyLabel.addStyleClass("labelFloat");

                topMatrixLayout_2.createRow(schemaCurrencyLabel, schemaCurrencyCell_1);



                var clientCurrencyLabel = new sap.ui.commons.Label({
                    text: "Client for Unit Conversion",
                    	required: true,
						requiredAtBegin:true
                });

                var clientCurrencyCell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2
                });

               /* var clientImage = new sap.ui.commons.Image({
                    src: "{selection>/clientIcon}"
                });*/

                var clientCurrencyCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
                    width: "100%",
                    //icon: clientImage,
                    change: function(oevent) {
                        var value = oevent.getParameter("newValue");
                       /* if (value === "Column") {
                            clientImage.setSrc(resourceLoader.getImagePath("Column.png"));
                        } else if (value === "Fixed") {
                            clientImage.setSrc(resourceLoader.getImagePath("fixed-currency.png"));
                        } else {
                            clientImage.setSrc(resourceLoader.getImagePath("Parameter.png"));
                        }*/

                    }

                }).addStyleClass("borderIconCombo");

                clientCurrencyCombo.setModel(this.getTargetType());
                var oItemTemplate = new sap.ui.core.ListItem();
                oItemTemplate.bindProperty("key", "key");
                oItemTemplate.bindProperty("text", "value");
                oItemTemplate.bindProperty("icon", "icon");
                var listBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/items",
                        template: oItemTemplate
                    }
                });
                clientCurrencyCombo.setListBox(listBox);

                clientCurrencyCell.createRow(clientCurrencyLabel, clientCurrencyCombo);
                clientCurrencyCombo.bindProperty("selectedKey", "selection>/client")

                var clientCurrencyField = new sap.ui.commons.TextField({
                    //    editable: false,
                    value: "{/client}",
                    width: "100%",
                    change: function(oEvent) {


                        if (clientCurrencyCombo.getSelectedKey() === "column") {
                            var unitElement;
                            var name = this.getValue();
                            that.viewnode.elements.foreach(function(element) {
                                if (element.name === name) {
                                    unitElement = element;
                                }
                            });
                            /*var attributes = {

                            };*/
                            if (unitElement) {
                                var client = {
                                    element: unitElement
                                };
                                that.attributes.client = client;
                               
                                if (!that.isDialog) {
                                     var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /*else {
                                    that.commands.push(command);
                                }*/
                                this.setValue(name);
                                CalcViewEditorUtil.clearErrorMessageTooltip(this);
                            } else {
                                CalcViewEditorUtil.showErrorMessageTooltip(this, "Column does not exist");
                            }

                        } else {
                            /*var attributes = {

                            };*/

                            var constantValue = this.getValue();
                            var client = {
                                constantValue: constantValue
                            };
                            that.attributes.client = client;
                         
                            if (!that.isDialog) {
                                   var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                that._execute(command);
                                that.attributes = {};
                            }
                            /* else {
                                that.commands.push(command);
                            }*/
                            this.setValue(constantValue);
                        }



                    }
                });

                clientCurrencyField.addStyleClass("currencyText");

                var clientCurrencyButton = new sap.ui.commons.Button({
                    icon: "sap-icon://value-help",
                    press: function() {

                        var fnCallBack = function(result) {

                            if (result instanceof Object) {
                                var unitElement;

                                if (that.viewnode && that.viewnode.isStarJoin()) {
                                    that.viewnode.inputs.foreach(function(ip) {
                                        if (ip.selectAll) {
                                            ip.getSource().elements.foreach(function(element) {
                                                if (element.name === result.name) {
                                                    unitElement = element;
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    that.viewnode.elements.foreach(function(element) {
                                        if (element.name === result.name) {
                                            unitElement = element;
                                        }
                                    });
                                }
                                /*  var attributes = {

                                };*/
                                var client = {
                                    element: unitElement
                                }
                                that.attributes.client = client;
                               
                                if (!that.isDialog) {
                                     var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /*else {
                                    that.commands.push(command);
                                }*/
                                clientCurrencyField.setValue(result.name);

                            } else {
                                /* var attributes = {

                                };*/
                                var client = {
                                    constantValue: result
                                };
                                that.attributes.client = client;
                        
                                if (!that.isDialog) {
                                            var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /*else {
                                    that.commands.push(command);
                                }*/
                                if (result === "$$client$$") {
                                    clientCurrencyField.setValue("Session Client");

                                } else {
                                    clientCurrencyField.setValue(result);
                                }
                            }
                            CalcViewEditorUtil.clearErrorMessageTooltip(clientCurrencyField);

                        };
                        var client;
                        if (that.element.unitConversion && that.element.unitConversion.client) {
                            client = that.element.unitConversion.client.constantValue;
                        }
                        var schema;
                        if (that.element.unitConversion && that.element.unitConversion.schema) {
                            schema = that.element.unitConversion.schema.schemaName;
                        }
                        var title = "";
                        if (clientCurrencyCombo.getSelectedKey() === "fixed") {
                            title = "Select Client";
                        } else if (clientCurrencyCombo.getSelectedKey() === "column") {
                            title = "Select Column";
                        } else {
                            title = "Select Input Parameter";
                        }
                        var valueHelpDialog = new ValueHelpDialog({
                            undoManager: that._undoManager,
                            fnCallBack: fnCallBack,
                            context: that.context,
                            selectedItem: clientCurrencyCombo.getSelectedKey(),
                            viewnode: that.viewnode,
                            title: title,
                            isUnit: true,
                            isClient: true,
                            clientValue: client,
                            schema: schema,
                            selectedElement: that.element
                        });

                        valueHelpDialog.openDialog();
                    }
                });
                var clientCurrencyCell_1 = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    widths: ["80%", "20%"],
                    width: "100%"
                });
                clientCurrencyCell_1.createRow(clientCurrencyField, clientCurrencyButton);

                clientCurrencyCell_1.addStyleClass("currencyBrowseButton");
                clientCurrencyLabel.addStyleClass("labelFloat");

                conversionMatrixLayout.createRow(clientCurrencyCell, clientCurrencyCell_1);

                var sourceCurrencyLabel = new sap.ui.commons.Label({
                    text: "Source Unit",
                    	required: true,
						requiredAtBegin:true
                });

                var sourceCurrencyCell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2
                });

             /*   var sourceTypeImage = new sap.ui.commons.Image({
                    src: "{selection>/sourceUnitIcon}"
                });*/

                var sourceTypeCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
                    width: "100%",
                    //icon: sourceTypeImage,
                    change: function(oevent) {
                        var value = oevent.getParameter("newValue");
                       /* if (value === "Column") {
                            sourceTypeImage.setSrc(resourceLoader.getImagePath("Column.png"));
                        } else if (value === "Fixed") {
                            sourceTypeImage.setSrc(resourceLoader.getImagePath("fixed-currency.png"));
                        } else {
                            sourceTypeImage.setSrc(resourceLoader.getImagePath("Parameter.png"));
                        }*/

                    }

                }).addStyleClass("borderIconCombo");

                sourceTypeCombo.setModel(this.getCurrencyType());
                var oItemTemplate = new sap.ui.core.ListItem();
                oItemTemplate.bindProperty("key", "key");
                oItemTemplate.bindProperty("text", "value");
                oItemTemplate.bindProperty("icon", "icon");
                var listBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/items",
                        template: oItemTemplate
                    }
                });
                sourceTypeCombo.setListBox(listBox);
                sourceCurrencyCell.createRow(sourceCurrencyLabel, sourceTypeCombo);
                sourceTypeCombo.bindProperty("selectedKey", "selection>/sourceUnit");

                var sourceCurrencyField = new sap.ui.commons.TextField({
                    //editable: false,
                    value: "{/sourceUnit}",
                    width: "100%",
                    change: function(oEvent) {

                        if (sourceTypeCombo.getSelectedKey() === "column") {
                            var unitElement;
                            var columnName = sourceCurrencyField.getValue();
                            that.viewnode.elements.foreach(function(element) {
                                if (element.name === columnName) {
                                    unitElement = element;
                                }
                            });
                            if (unitElement) {
                                /*var attributes = {

                                };*/
                                var sourceUnit = {
                                    element: unitElement
                                };
                                that.attributes.sourceUnit = sourceUnit;
                                
                                if (!that.isDialog) {
                                    var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /*else {
                                    that.commands.push(command);
                                }*/
                                CalcViewEditorUtil.clearErrorMessageTooltip(this);
                            } else {
                                CalcViewEditorUtil.showErrorMessageTooltip(this, "Column does not exist");
                            }
                        } else {
                            /*var attributes = {

                            };*/
                            var columnName = sourceCurrencyField.getValue();
                            var sourceUnit = {
                                constantValue: columnName
                            };
                            that.attributes.sourceUnit = sourceUnit;
                           
                            if (!that.isDialog) {
                                 var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                that._execute(command);
                                that.attributes = {};
                            }
                            /*else {
                                that.commands.push(command);
                            }*/
                        }


                    }
                });

                sourceCurrencyField.addStyleClass("currencyText");

                var sourceCurrencyButton = new sap.ui.commons.Button({
                    icon: "sap-icon://value-help",
                    press: function() {
                        var fnCallBack = function(result) {


                            if (result instanceof Object) {
                                var unitElement;
                                that.viewnode.elements.foreach(function(element) {
                                    if (element.name === result.name) {
                                        unitElement = element;
                                    }
                                });
                                if (that.viewnode && that.viewnode.isStarJoin()) {
                                    that.viewnode.inputs.foreach(function(ip) {
                                        if (ip.selectAll) {
                                            ip.getSource().elements.foreach(function(element) {
                                                if (element.name === result.name) {
                                                    unitElement = element;
                                                }
                                            });
                                        }
                                    });
                                }

                                /* var attributes = {

                                };*/
                                var sourceUnit = {
                                    element: unitElement
                                };
                                that.attributes.sourceUnit = sourceUnit;
                               
                                if (!that.isDialog) {
                                     var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /*else {
                                    that.commands.push(command);
                                }*/
                                sourceCurrencyField.setValue(result.name);

                            } else {
                                /*  var attributes = {

                                };*/
                                var sourceUnit = {
                                    constantValue: result
                                };
                                that.attributes.sourceUnit = sourceUnit;
                                
                                if (!that.isDialog) {
                                    var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /*else {
                                    that.commands.push(command);
                                }*/
                                sourceCurrencyField.setValue(result);
                            }
                            CalcViewEditorUtil.clearErrorMessageTooltip(sourceCurrencyField);

                        };
                        var schema;
                        if (that.element.unitConversion && that.element.unitConversion.schema) {
                            schema = that.element.unitConversion.schema.schemaName;
                        }
                        var title = "";
                        if (sourceTypeCombo.getSelectedKey() === "fixed") {
                            title = "Select Unit";
                        } else if (sourceTypeCombo.getSelectedKey() === "column") {
                            title = "Select Column";
                        } else {
                            title = "Select Input Parameter";
                        }
                        var schema;
                        var isDefaultSchemaset = false;
                        for (var i = 0; i < that.commands.length; i++) {
                            var command = that.commands[i];
                            if (command.schema) {
                                schema = command.schema;
                                break;
                            }
                        }
                         if (that.attributes.schema !== "<None>" && that.attributes.schema !== undefined) {
                            schema = that.attributes.schema;
                        }
                        if (!schema) {
                            if (that.element.unitConversion && that.element.unitConversion.schema) {
                                schema = that.element.unitConversion.schema.schemaName;
                            } else {
                                if (that.viewnode) {
                                    var view = that.viewnode.$$containingFeature._owner;
                                    if (view.defaultSchema) {
                                        isDefaultSchemaset = true;
                                      /*  schemaMapping.getPhysicalSchema(view.defaultSchema, that.context, function(results) {

                                            if (results) {
                                                schema = results;
                                            } else {
                                                schema = view.defaultSchema;
                                            }
                                            var valueHelpDialog = new ValueHelpDialog({
                                                undoManager: that._undoManager,
                                                fnCallBack: fnCallBack,
                                                context: that.context,
                                                selectedItem: sourceTypeCombo.getSelectedKey(),
                                                viewnode: that.viewnode,
                                                title: title,
                                                isUnit: true,
                                                schema: schema,
                                                unitCode: true,
                                                selectedElement: that.element
                                            });

                                            valueHelpDialog.openDialog();
                                        });*/
                                    }
                                }

                            }
                        }
                        if (!isDefaultSchemaset) {
                            var valueHelpDialog = new ValueHelpDialog({
                                undoManager: that._undoManager,
                                fnCallBack: fnCallBack,
                                context: that.context,
                                selectedItem: sourceTypeCombo.getSelectedKey(),
                                viewnode: that.viewnode,
                                title: title,
                                isUnit: true,
                                schema: schema,
                                unitCode: true,
                                selectedElement: that.element

                            });

                            valueHelpDialog.openDialog();
                        }

                    }
                });
                var sourceCurrencyCell_1 = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    widths: ["80%", "20%"],
                    width: "100%"

                });
                sourceCurrencyCell_1.createRow(sourceCurrencyField, sourceCurrencyButton);

                sourceCurrencyCell_1.addStyleClass("currencyBrowseButton");
                sourceCurrencyLabel.addStyleClass("labelFloat");

                conversionMatrixLayout.createRow(sourceCurrencyCell, sourceCurrencyCell_1);



                var targeturrencyLabel = new sap.ui.commons.Label({
                    text: "Target Unit",
                    	required: true,
						requiredAtBegin:true
                });

                var targetcell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2
                });

               /* var targetTypeImage = new sap.ui.commons.Image({
                    src: "{selection>/targetUnitIcon}"
                });*/

                var targetTypeCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
                    width: "100%",
                  /*  icon: targetTypeImage,*/
                    change: function(oevent) {
                        var value = oevent.getParameter("newValue");
                      /*  if (value === "Column") {
                            targetTypeImage.setSrc(resourceLoader.getImagePath("Column.png"));
                        } else if (value === "Fixed") {
                            targetTypeImage.setSrc(resourceLoader.getImagePath("fixed-currency.png"));
                        } else {
                            targetTypeImage.setSrc(resourceLoader.getImagePath("Parameter.png"));
                        }*/

                    }

                }).addStyleClass("borderIconCombo");

                targetTypeCombo.setModel(this.getTargetType());
                var oItemTemplate = new sap.ui.core.ListItem();
                oItemTemplate.bindProperty("key", "key");
                oItemTemplate.bindProperty("text", "value");
                oItemTemplate.bindProperty("icon", "icon");
                var listBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/items",
                        template: oItemTemplate
                    }
                });
                targetTypeCombo.setListBox(listBox);

                targetcell.createRow(targeturrencyLabel, targetTypeCombo);
                targetTypeCombo.bindProperty("selectedKey", "selection>/targetUnit");
                var oldTargetValue;
                var targetCurrencyField = new sap.ui.commons.TextField({
                    //  editable: false,
                    value: "{/targetUnit}",
                    width: "100%",
                    change: function(oEvent) {

                        if (targetTypeCombo.getSelectedKey() === "column") {
                            var unitElement;
                            var targetName = targetCurrencyField.getValue();
                            that.viewnode.elements.foreach(function(element) {
                                if (element.name === targetName) {
                                    unitElement = element;
                                }
                            });

                            if (unitElement) {
                                /*var attributes = {};*/
                                var targetUnit = {
                                    element: unitElement
                                };
                                that.attributes.targetUnit = targetUnit;
                                
                                if (!that.isDialog) {
                                    var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /*else {
                                    that.commands.push(command);
                                }*/
                                CalcViewEditorUtil.clearErrorMessageTooltip(this);

                            } else {
                                CalcViewEditorUtil.showErrorMessageTooltip(this, "Column does not exist");
                            }

                        } else if (targetTypeCombo.getSelectedKey() === "input_parameter") {
                            var targetName = targetCurrencyField.getValue();
                            var unitElement;
                            if (columnView) {
                                columnView.parameters.foreach(function(parameter) {
                                    if (parameter.name === targetName) {
                                        unitElement = parameter;
                                    }

                                });
                            }
                            if (unitElement) {
                                /* var attributes = {};*/
                                var targetUnit = {
                                    parameter: unitElement
                                };
                                that.attributes.targetUnit = targetUnit;
                                
                                if (!that.isDialog) {
                                    var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /*else {
                                    that.commands.push(command);
                                }*/
                                CalcViewEditorUtil.clearErrorMessageTooltip(this);

                            } else {
                                CalcViewEditorUtil.showErrorMessageTooltip(this, "Input Parameter does not exist");
                            }

                        } else {
                            // var attributes = {};
                            var targetName = targetCurrencyField.getValue();
                            var targetUnit = {
                                constantValue: targetName
                            };
                            that.attributes.targetUnit = targetUnit;
                            
                            if (!that.isDialog) {
                                var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                that._execute(command);
                                that.attributes = {};
                            }
                            /*else {
                                that.commands.push(command);
                            }*/

                        }
                        var isChanged = false;
                        if (!(that.element.fixedCurrency) && !(that.element.unitCurrencyElement)) {
                            isChanged = true;
                        } else if (oldTargetValue && unitCurrencyField.getValue() === oldTargetValue) {

                            var callBack = function(sResult) {

                                isChanged = true;
                                currencyChanges(isChanged);

                            }
                            jQuery.sap.require("sap.ui.commons.MessageBox");

                            // open a fully configured message box
                            sap.ui.commons.MessageBox.show("The display currency and target currency values have\n been the same.Do you want to apply the modified target currency\n to the display currency as well?",
                                sap.ui.commons.MessageBox.Icon.WARNING,
                                "Confirm Currency Change", [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO],
                                callBack,
                                sap.ui.commons.MessageBox.Action.YES);

                        }

                        currencyChanges(isChanged);

                        oldTargetValue = this.getValue();

                    }
                });

                targetCurrencyField.addStyleClass("currencyText");
                var columnView = that.viewnode.$getContainer();
                var targetCurrencyButton = new sap.ui.commons.Button({
                    icon: "sap-icon://value-help",
                    press: function() {

                        var fnCallBack = function(result) {


                            if (result instanceof Object) {
                                var unitElement;
                                var unitParameter;

                                if (result.nodetype === "element") {
                                    that.viewnode.elements.foreach(function(element) {
                                        if (element.name === result.name) {
                                            unitElement = element;
                                        }
                                    });

                                    if (that.viewnode && that.viewnode.isStarJoin()) {
                                        that.viewnode.inputs.foreach(function(ip) {
                                            if (ip.selectAll) {
                                                ip.getSource().elements.foreach(function(element) {
                                                    if (element.name === result.name) {
                                                        unitElement = element;
                                                    }
                                                });
                                            }
                                        });
                                    }
                                } else {
                                    if (columnView) {
                                        columnView.parameters.foreach(function(parameter) {
                                            if (parameter.name === result.name) {
                                                unitParameter = parameter;
                                            }

                                        });
                                    }
                                }
                                if (unitElement || unitParameter) {
                                    //  var attributes = {};
                                    var targetUnit;
                                    if (unitElement) {
                                        targetUnit = {
                                            element: unitElement
                                        };
                                    }
                                    if (unitParameter) {
                                        targetUnit = {
                                            parameter: unitParameter
                                        };
                                    }
                                    that.attributes.targetUnit = targetUnit;
                                    
                                    if (!that.isDialog) {
                                        var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                        that._execute(command);
                                        that.attributes = {};
                                    }
                                    /*else {
                                        that.commands.push(command);
                                    }*/
                                    targetCurrencyField.setValue(result.name);
                                }

                            } else {
                                // var attributes = {};
                                var targetCurrency = {
                                    constantValue: result
                                };
                                that.attributes.targetUnit = targetCurrency;
                                
                                if (!that.isDialog) {
                                    var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /*else {
                                    that.commands.push(command);
                                }*/
                                targetCurrencyField.setValue(result);
                            }
                            CalcViewEditorUtil.clearErrorMessageTooltip(targetCurrencyField);

                            var isChanged = false;
                            if (!(that.element.fixedCurrency) && !(that.element.unitCurrencyElement)) {
                                isChanged = true;
                            } else if (oldTargetValue && unitCurrencyField.getValue() === oldTargetValue) {
                                var callBack = function(sResult) {
                                    isChanged = true;
                                    currencyChanges(isChanged);
                                };
                                jQuery.sap.require("sap.ui.commons.MessageBox");

                                // open a fully configured message box
                                sap.ui.commons.MessageBox.show("The display currency and target currency values have\n been the same.Do you want to apply the modified target currency\n to the display currency as well?",
                                    sap.ui.commons.MessageBox.Icon.WARNING,
                                    "Confirm Currency Change", [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO],
                                    callBack,
                                    sap.ui.commons.MessageBox.Action.YES);
                            }
                            currencyChanges(isChanged);
                            oldTargetValue = targetCurrencyField.getValue();
                        };
                        var schema;
                        if (that.element.unitConversion && that.element.unitConversion.schema) {
                            schema = that.element.unitConversion.schema.schemaName;
                        }
                        var title = "";
                        if (targetTypeCombo.getSelectedKey() === "fixed") {
                            title = "Select Unit";
                        } else if (targetTypeCombo.getSelectedKey() === "column") {
                            title = "Select Column";
                        } else {
                            title = "Select Input Parameter";
                        }
                        var schema;
                        var isDefaultSchemaset = false;
                        for (var i = 0; i < that.commands.length; i++) {
                            var command = that.commands[i];
                            if (command.schema) {
                                schema = command.schema;
                                break;
                            }
                        }
                         if (that.attributes.schema !== "<None>" && that.attributes.schema !== undefined) {
                            schema = that.attributes.schema;
                        }
                        if (!schema) {
                            if (that.element.unitConversion && that.element.unitConversion.schema) {
                                schema = that.element.unitConversion.schema.schemaName;
                            } else {
                                if (that.viewnode) {
                                    var view = that.viewnode.$$containingFeature._owner;
                                    if (view.defaultSchema) {
                                        isDefaultSchemaset = true;
                                      /*  schemaMapping.getPhysicalSchema(view.defaultSchema, that.context, function(results) {

                                            if (results) {
                                                schema = results;
                                            } else {
                                                schema = view.defaultSchema;
                                            }
                                            var valueHelpDialog = new ValueHelpDialog({
                                                undoManager: that._undoManager,
                                                fnCallBack: fnCallBack,
                                                context: that.context,
                                                selectedItem: targetTypeCombo.getSelectedKey(),
                                                viewnode: that.viewnode,
                                                title: title,
                                                isUnit: true,
                                                schema: schema,
                                                unitCode:  targetTypeCombo.getSelectedKey() === "input_parameter" ? false : true,
                                                selectedElement: that.element
                                            });

                                            valueHelpDialog.openDialog();
                                        });*/
                                    }
                                }

                            }
                        }
                        if (!isDefaultSchemaset) {
                            var valueHelpDialog = new ValueHelpDialog({
                                undoManager: that._undoManager,
                                fnCallBack: fnCallBack,
                                context: that.context,
                                selectedItem: targetTypeCombo.getSelectedKey(),
                                viewnode: that.viewnode,
                                title: title,
                                isUnit: true,
                                schema: schema,
                                unitCode:  targetTypeCombo.getSelectedKey() === "input_parameter" ? false : true,
                                selectedElement: that.element

                            });

                            valueHelpDialog.openDialog();
                        }
                    }
                });

                var currencyChanges = function(isChanged) {
                    if (isChanged) {
                        if (targetTypeCombo.getSelectedKey() === "column") {
                            currencyTypeCombo.setSelectedKey("column");
                            var unitElement;
                            var name = targetCurrencyField.getValue();
                            that.viewnode.elements.foreach(function(element) {
                                if (element.name === name) {
                                    unitElement = element;
                                }

                            });

                            /* var attributes = {

                            };*/
                            if (unitElement) {
                                var unitCurrencyElement = {
                                    element: unitElement
                                };
                                that.elementAttribute.unitCurrencyElement = unitCurrencyElement;
                                var command = new commands.ChangeElementPropertiesCommand(that.viewnode.name, that.element.name, that.elementAttribute);
                                if (!that.isDialog) {
                                    that._execute(command);
                                    that.elementAttribute = {};
                                }
                                /* else {
                                    that.commands.push(command);
                                }*/
                                unitCurrencyField.setValue(name);
                                CalcViewEditorUtil.clearErrorMessageTooltip(targetCurrencyField);
                            } else {
                                CalcViewEditorUtil.showErrorMessageTooltip(targetCurrencyField, "Column does not exist");
                            }
                        } else if (targetTypeCombo.getSelectedKey() === "fixed") {
                            currencyTypeCombo.setModel(that.getCurrencyType());
                            currencyTypeCombo.setSelectedKey("fixed");
                            var name = targetCurrencyField.getValue();
                            /* var attributes = {

                            };*/
                            var unitCurrencyElement = {
                                fixedCurrency: name
                            };
                            that.elementAttribute.unitCurrencyElement = unitCurrencyElement;
                           
                            if (!that.isDialog) {
                                 var command = new commands.ChangeElementPropertiesCommand(that.viewnode.name, that.element.name, that.elementAttribute);
                                that._execute(command);
                                that.elementAttribute = {};
                            }
                            /*else {
                                that.commands.push(command);
                            }*/
                            unitCurrencyField.setValue(name);
                            CalcViewEditorUtil.clearErrorMessageTooltip(targetCurrencyField);
                        }
                    }
                };
                var targetcell_1 = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    widths: ["80%", "20%"],
                    width: "100%"
                });
                targetcell_1.createRow(targetCurrencyField, targetCurrencyButton);

                targetcell_1.addStyleClass("currencyBrowseButton");
                targeturrencyLabel.addStyleClass("labelFloat");

                conversionMatrixLayout.createRow(targetcell, targetcell_1);


                var topMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    layoutFixed: false,
                    width: "100%",
                    widths: ["29.5%", "70.5%"]
                });

                topMatrixLayout.addStyleClass("currencyHeader");


                var generateCurrencyLabel = new sap.ui.commons.Label({
                    text: "Generate result unit column"
                });

                var generateCurrencyField = new sap.ui.commons.TextField({
                    //editable: false,
                    width: "100%",
                    value: '{/outputUnitCurrencyElement}'
                }).addStyleClass("dummyTest8");

                generateCurrencyField.addStyleClass("currencyText");


                generateCurrencyField.attachChange(function(event) {
                    var value = event.getParameter("newValue");
                    /* var attributes = {

                    };*/
                    var outputUnitCurrencyElement = value;

                    that.attributes.outputUnitCurrencyElement = outputUnitCurrencyElement;
                  
                    if (!that.isDialog) {
                          var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                        that._execute(command);
                        that.attributes = {};
                    }
                    /*else {
                        that.commands.push(command);
                    }*/

                    generateCurrencyField.setValue(value);
                });


                var generateCurrencyCheck = new sap.ui.commons.CheckBox({
                    checked: false,
                    change: function() {
                        if (this.getChecked()) {
                            generateCurrencyField.setEditable(true);
                            var name = that.element.name + "_UNIT";
                            generateCurrencyField.setValue(name);
                            var value = name;
                            /*  var attributes = {

                            };*/
                            var outputUnitCurrencyElement = value;

                            that.attributes.outputUnitCurrencyElement = outputUnitCurrencyElement;
                           
                            if (!that.isDialog) {
                             var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                that._execute(command);
                                that.attributes = {};
                            }
                            /*else {
                                that.commands.push(command);
                            }*/

                        } else {
                            generateCurrencyField.setEditable(false);
                            var name = "";
                            generateCurrencyField.setValue(name);
                            var value = undefined;
                            /* var attributes = {

                            };*/
                            var outputUnitCurrencyElement = value;

                            that.attributes.outputUnitCurrencyElement = outputUnitCurrencyElement;
                           
                            if (!that.isDialog) {
                                 var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                that._execute(command);
                            }
                            /*else {
                                that.commands.push(command);
                            }*/

                        }
                    }
                }).addStyleClass("dummyTest7");

                if (this.element.unitConversion && that.element.unitConversion.outputUnitCurrencyElement) {
                    generateCurrencyCheck.setChecked(true);
                    generateCurrencyField.setEditable(true);
                }

                var generateCurrencyCell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    widths: ["8%", "92%"],
                    width: "96%"

                });
                generateCurrencyCell.createRow(generateCurrencyCheck, generateCurrencyField);

                generateCurrencyCell.addStyleClass("currencyBrowseButton");
                generateCurrencyLabel.addStyleClass("labelFloat");

                topMatrixLayout.createRow(generateCurrencyLabel, generateCurrencyCell);

                var uponFailureLabel = new sap.ui.commons.Label({
                    text: "Upon failure"
                });


                var uponFailureCombo = new sap.ui.commons.DropdownBox({
                    width: "100%",
                    change: function(event) {

                        var selectedKey = this.getSelectedKey();
                        /*  var attributes = {

                        };*/
                        var errorHandling = {
                            constantValue: selectedKey
                        };
                        that.attributes.errorHandling = errorHandling;
                       
                        if (!that.isDialog) {
                             var command = new commands.ChangeUnitPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                            that._execute(command);
                            that.attributes = {};
                        }
                        /*else {
                            that.commands.push(command);
                        }*/

                    }
                });

                uponFailureLabel.addStyleClass("labelFloat");

                var uponFailureCell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 1,
                    width: "96%"
                });

                uponFailureCell.createRow(uponFailureCombo);

                uponFailureCombo.bindProperty("selectedKey", "selection>/errorHandling");

                if (this.element.unitConversion && that.element.unitConversion.errorHandling) {
                    var currencyData = {
                        errorHandling: that.element.unitConversion.errorHandling.constantValue
                    };
                    var currencyModel = new sap.ui.model.json.JSONModel();
                    // set the data for the model
                    currencyModel.setData(currencyData);
                    uponFailureCombo.setModel(currencyModel, "selection");

                }

                uponFailureCombo.setModel(this.getErrorType());
                var oItemTemplate = new sap.ui.core.ListItem();
                oItemTemplate.bindProperty("key", "key");
                oItemTemplate.bindProperty("text", "value");
                uponFailureCombo.bindItems("/items", oItemTemplate);
                topMatrixLayout.createRow(uponFailureLabel, uponFailureCell);

                setEnabled = function(enable) {
                    schemaCurrencyField.setEnabled(enable);
                    topMatrixLayout_2.setEnabled(enable);
                    clientCurrencyCombo.setEnabled(enable);
                    clientCurrencyField.setEnabled(enable);
                    conversionMatrixLayout.setEnabled(enable);
                    sourceTypeCombo.setEnabled(enable);
                    sourceCurrencyField.setEnabled(enable);
                    targetTypeCombo.setEnabled(enable);
                    targetCurrencyField.setEnabled(enable);
                    generateCurrencyField.setEnabled(enable);
                    generateCurrencyCheck.setEnabled(enable);
                    uponFailureCombo.setEnabled(enable);

                };


                setModel = function() {

                    var sourceData = {

                    };
                    var selectionData = {};

                    if (that.element.inlineType.semanticType && that.element.inlineType.semanticType === "quantity") {

                    }
                    if (that.element.fixedCurrency) {
                        sourceData.unitCurrencyElement = that.element.fixedCurrency;
                        selectionData.currencyTypeIcon = resourceLoader.getImagePath("fixed-currency.png");
                    } else if (that.element.unitCurrencyElement) {
                        sourceData.unitCurrencyElement = that.element.unitCurrencyElement.name;
                        selectionData.currencyTypeIcon = resourceLoader.getImagePath("Column.png");
                    } else if (that.element.unitConversion) {

                        selectionData.currencyTypeIcon = resourceLoader.getImagePath("Column.png");
                    } else {
                        selectionData.currencyTypeIcon = resourceLoader.getImagePath("fixed-currency.png");
                    }
                    if (that.element.unitConversion) {
                        if (that.element.unitConversion.sourceUnit) {
                            if (that.element.unitConversion.sourceUnit.constantValue) {
                                sourceData.sourceUnit = that.element.unitConversion.sourceUnit.constantValue;
                                selectionData.sourceUnit = "fixed";
                                selectionData.sourceUnitIcon = resourceLoader.getImagePath("fixed-currency.png");
                            } else if (that.element.unitConversion.sourceUnit.element) {
                                sourceData.sourceUnit = that.element.unitConversion.sourceUnit.element.name;
                                selectionData.sourceUnit = "column";
                                selectionData.sourceUnitIcon = resourceLoader.getImagePath("Column.png");
                            } else if (that.element.unitConversion.sourceUnit.parameter) {
                                sourceData.sourceUnit = that.element.unitConversion.sourceUnit.parameter.name;
                                selectionData.sourceUnit = "input_parameter";
                                selectionData.sourceUnitIcon = resourceLoader.getImagePath("Parameter.png");
                            }
                        } else {
                            selectionData.sourceUnitIcon = resourceLoader.getImagePath("fixed-currency.png");
                        }

                        if (that.element.unitConversion.targetUnit) {
                            if (that.element.unitConversion.targetUnit.constantValue) {
                                sourceData.targetUnit = that.element.unitConversion.targetUnit.constantValue;
                                selectionData.targetUnit = "fixed";
                                selectionData.targetUnitIcon = resourceLoader.getImagePath("fixed-currency.png");
                            } else if (that.element.unitConversion.targetUnit.element) {
                                sourceData.targetUnit = that.element.unitConversion.targetUnit.element.name;
                                selectionData.targetUnit = "column";
                                selectionData.targetUnitIcon = resourceLoader.getImagePath("Column.png");
                            } else if (that.element.unitConversion.targetUnit.parameter) {
                                sourceData.targetUnit = that.element.unitConversion.targetUnit.parameter.name;
                                selectionData.targetUnit = "input_parameter";
                                selectionData.targetUnitIcon = resourceLoader.getImagePath("Parameter.png");
                            }
                        } else {
                            selectionData.targetUnitIcon = resourceLoader.getImagePath("fixed-currency.png");
                        }

                        if (that.element.unitConversion.client) {
                            if (that.element.unitConversion.client.constantValue) {
                                if (that.element.unitConversion.client.constantValue === "$$client$$") {
                                    sourceData.client = "Session client";
                                } else {
                                    sourceData.client = that.element.unitConversion.client.constantValue;
                                }
                                selectionData.clientIcon = resourceLoader.getImagePath("fixed-currency.png");
                            } else if (that.element.unitConversion.client.element) {
                                sourceData.client = that.element.unitConversion.client.element.name;
                                selectionData.client = "column";
                                selectionData.clientIcon = resourceLoader.getImagePath("Column.png");
                            } else if (that.element.unitConversion.client.parameter) {
                                sourceData.client = that.element.unitConversion.client.parameter.name;
                                selectionData.client = "input_parameter";
                                selectionData.clientIcon = resourceLoader.getImagePath("Parameter.png");
                            }
                        } else {
                            selectionData.clientIcon = resourceLoader.getImagePath("fixed-currency.png");
                        }
                        if (that.element.unitConversion.schema && that.element.unitConversion.schema.schemaName) {
                            sourceData.schema = that.element.unitConversion.schema.schemaName;
                        }
                        if (that.element.unitConversion && that.element.unitConversion.outputUnitCurrencyElement) {
                            sourceData.outputUnitCurrencyElement = that.element.unitConversion.outputUnitCurrencyElement.name;
                        }
                    } else {
                        selectionData.currencyTypeIcon = resourceLoader.getImagePath("fixed-currency.png");
                        selectionData.sourceUnitIcon = resourceLoader.getImagePath("fixed-currency.png");
                        selectionData.targetUnitIcon = resourceLoader.getImagePath("fixed-currency.png");
                        selectionData.clientIcon = resourceLoader.getImagePath("fixed-currency.png");
                        selectionData.currencyTypeIcon = resourceLoader.getImagePath("fixed-currency.png");
                        sourceData.sourceUnit = "";
                        selectionData.sourceUnit = "fixed";
                        sourceData.targetUnit = "";
                        selectionData.targetUnit = "fixed";
                        sourceData.client = "";
                        selectionData.client = "fixed";
                        if (that.viewnode.$$model.columnView && that.viewnode.$$model.columnView.defaultSchema) {
                            sourceData.schema = that.viewnode.$$model.columnView.defaultSchema;
                        } else {
                            sourceData.schema = "";
                        }
                    }
                    if (currencyTypeCombo.getValue() === "Column") {
                        selectionData.currencyTypeIcon = resourceLoader.getImagePath("Column.png");
                    } else {
                        selectionData.currencyTypeIcon = resourceLoader.getImagePath("fixed-currency.png");
                    }

                    var sourceModel = new sap.ui.model.json.JSONModel();
                    // set the data for the model
                    sourceModel.setData(sourceData);
                    oLayout.setModel(sourceModel);
                    var oModel = new sap.ui.model.json.JSONModel();
                    // set the data for the model
                    oModel.setData(selectionData);

                    oLayout.setModel(oModel, "selection");
                };
                setModel();
                if (that.element.unitConversion) {
                    setEnabled(true);
                } else {
                    setEnabled(false);
                }

                if (that.viewnode.type === "Script") {
                    setEnabled(false);
                    enableConversionCheck.setEnabled(false);
                }

                oLayout.addContent(topMatrixLayout_2);
                oLayout.addContent(conversionMatrixLayout);
                oLayout.addContent(topMatrixLayout);
                return oLayout;

            },
            getHeaderLayout: function(name) {
                var headMatrixLayout = new sap.ui.commons.layout.MatrixLayout();
                headMatrixLayout.addStyleClass("headerHeight");
                var headerMatrixLayoutCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    vAlign: sap.ui.commons.layout.VAlign.Begin,
                    hAlign: sap.ui.commons.layout.HAlign.Begin
                }).addStyleClass("parameterHeaderStyle");

                var headerName = new sap.ui.commons.Label({
                    text: name,
                    design: sap.ui.commons.LabelDesign.Bold
                });

                headerMatrixLayoutCell.addContent(new sap.ui.commons.Label({
                    width: "10px"
                }));
                headerMatrixLayoutCell.addContent(headerName);

                headMatrixLayout.createRow(headerMatrixLayoutCell);

                return headMatrixLayout;
            },
            getCommands: function() {
                if (!jQuery.isEmptyObject(this.elementAttribute)) {
                    this.commands.push(new commands.ChangeElementPropertiesCommand(this.viewnode.name, this.element.name, this.elementAttribute));
                }
                if (!jQuery.isEmptyObject(this.attributes)) {
                    this.commands.push(new commands.ChangeUnitPropertiesCommand(this.viewnode.name, this.element.name, this.attributes));
                }
                return this.commands;
            },
            getSemanticType: function() {
                var semanticTypeList = {
                    items: [{
                        key: model.SemanticType.AMOUNT,
                        value: "Amount with Currency Code"
                    }, {
                        key: model.SemanticType.QUANTITY,
                        value: "Quantity with Unit Of Measure"

                    }]
                };
                var semanticTypeModel = new sap.ui.model.json.JSONModel();
                semanticTypeModel.setData(semanticTypeList);
                return semanticTypeModel;
            },
            getCurrencyColumnType: function() {
                var currencyColumnTypeList = {
                    items: [{
                        key: "column",
                        value: "Column",
                        icon: resourceLoader.getImagePath("Column.png")

                    }]
                };
                var currencyColumnTypeModel = new sap.ui.model.json.JSONModel();
                currencyColumnTypeModel.setData(currencyColumnTypeList);
                return currencyColumnTypeModel;
            },
            getCurrencyType: function() {
                var currencyTypeList = {
                    items: [{
                        key: "fixed",
                        value: "Fixed",
                        icon: resourceLoader.getImagePath("fixed-currency.png")
                    }, {
                        key: "column",
                        value: "Column",
                        icon: resourceLoader.getImagePath("Column.png")

                    }]
                };
                var currencyTypeModel = new sap.ui.model.json.JSONModel();
                currencyTypeModel.setData(currencyTypeList);
                return currencyTypeModel;
            },
            getTargetType: function() {
                var targetTypeList = {
                    items: [{
                        key: "fixed",
                        value: "Fixed",
                        icon: resourceLoader.getImagePath("fixed-currency.png")
                    }, {
                        key: "column",
                        value: "Column",
                        icon: resourceLoader.getImagePath("Column.png")

                    }, {
                        key: "input_parameter",
                        value: "Input Parameter",
                        icon: resourceLoader.getImagePath("Parameter.png")

                    }]
                };
                var targetTypeModel = new sap.ui.model.json.JSONModel();
                targetTypeModel.setData(targetTypeList);
                return targetTypeModel;
            },
            getErrorType: function() {
                var errorTypeList = {
                    items: [{
                        key: "failOnError",
                        value: "Fail"
                    }, {
                        key: "keepUnconverted",
                        value: "Ignore"

                    }, {
                        key: "setToNull",
                        value: "Set to NULL"

                    }]
                };
                var errorTypeModel = new sap.ui.model.json.JSONModel();
                errorTypeModel.setData(errorTypeList);
                return errorTypeModel;
            }

        };

        return UnitConversionDetails;

    });
