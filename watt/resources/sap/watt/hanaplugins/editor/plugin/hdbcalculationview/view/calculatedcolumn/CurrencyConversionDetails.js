/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "../dialogs/ValueHelpDialog",
        "../../base/MetadataServices",
        "../IconDropdownBox"
    ],
    function(ResourceLoader, modelbase, commands, CalcViewEditorUtil, ValueHelpDialog, MetadataServices, IconDropdownBox) {
        "use strict";
        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
        var myService = MetadataServices.SearchService;
        //var schemaMapping = SchemaMappingService.schemaMapping;
        var schemas;

        /**
         * @class
         */
        var CurrencyConversionDetails = function(parameters) {
            this._undoManager = parameters.undoManager;
            this.context = parameters.context;
            this.viewnode = parameters.viewnode;
            this.element = parameters.element;
            this.isDialog = parameters.isDialog;
            this.commands = [];
            this.attributes = {};
            this.elementAttribute = {};
        };

        CurrencyConversionDetails.prototype = {

            _execute: function(command) {
                return this._undoManager.execute(command);
            },

            close: function() {

            },
            getContent: function() {
                var that = this;
                var setEnabled;
                var setModel;
                var enableShift;

                var hasConversion = function() {

                    var cc = that.element.currencyConversion;
                    return ((cc) && (
                        //	that.element.currencyConversion.convert || //for storing  converion check box value is checked or not 
                        (cc.sourceCurrency && (cc.sourceCurrency.constantValue || cc.sourceCurrency.element || cc.sourceCurrency.parameter)) ||
                        (cc.targetCurrency && (cc.targetCurrency.constantValue || cc.targetCurrency.element || cc.targetCurrency.parameter)) ||
                        (cc.referenceDate && (cc.exchangeRateType.constantValue || cc.exchangeRateType.element || cc.exchangeRateType.parameter)) ||
                        (cc.exchangeRateType && (cc.exchangeRateType.constantValue || cc.exchangeRateType.element || cc.exchangeRateType.parameter)) ||
                        (cc.client && (cc.client.constantValue || cc.client.element || cc.client.parameter)) ||
                        cc.exchangeRateElement ||
                        cc.erpDecimalShiftBack ||
                        cc.round ||
                        (cc.outputDataType && cc.outputDataType.length)

                        // ||(that.element.currencyConversion.schema && that.element.currencyConversion.schema.schemaName)
                    ));
                };

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
                    text: "Display Currency"
                });

                var currencyTypeCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
                    width: "100%",
                    change: function(oevent) {
                        var unitCurrencyElement = {
                            fixedCurrency: "",
                            element: undefined
                        };
                        that.elementAttribute.unitCurrencyElement = unitCurrencyElement;
                        if (!that.isDialog) {
                            var command = new commands.ChangeElementPropertiesCommand(that.viewnode.name, that.element.name, that.elementAttribute);
                            that._execute(command);
                            that.elementAttribute = {};
                        }
                        unitCurrencyField.setValue("");
                    }
                }).addStyleClass("borderIconCombo");

                var unitCurrencyField = new sap.ui.commons.TextField({
                    value: "{/unitCurrencyElement}",
                    width: "100%",
                    change: function(event) {
                        if (currencyTypeCombo.getSelectedKey() === "column") {
                            var unitElement;
                            var name = this.getValue();
                            that.viewnode.elements.foreach(function(element) {
                                if (element.name === name) {
                                    unitElement = element;
                                }
                            });

                            if (unitElement) {
                                var unitCurrencyElement = {
                                    element: unitElement
                                };
                                that.elementAttribute.unitCurrencyElement = unitCurrencyElement;
                                if (!that.isDialog) {
                                    var command = new commands.ChangeElementPropertiesCommand(that.viewnode.name, that.element.name, that.elementAttribute);
                                    that._execute(command);
                                    that.elementAttribute = {};
                                }
                                this.setValue(name);
                                CalcViewEditorUtil.clearErrorMessageTooltip(this);
                            } else {
                                CalcViewEditorUtil.showErrorMessageTooltip(this, "Column does not exist");
                            }
                        } else {
                            var name = this.getValue();
                            var unitCurrencyElement = {
                                fixedCurrency: name
                            };
                            that.elementAttribute.unitCurrencyElement = unitCurrencyElement;
                            if (!that.isDialog) {
                                var command = new commands.ChangeElementPropertiesCommand(that.viewnode.name, that.element.name, that.elementAttribute);
                                that._execute(command);
                                that.elementAttribute = undefined;
                            }
                            this.setValue(name);
                            CalcViewEditorUtil.clearErrorMessageTooltip(this);
                        }
                    }
                });
                unitCurrencyField.addStyleClass("currencyText");

                var cell_1 = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2
                });
                cell_1.createRow(currencyLabel, currencyTypeCombo);

                var typeLabel = new sap.ui.commons.Label({
                    text: "Type"
                });
                currencyTypeCombo.setModel(this.getCurrencyType());

                if (that.element.fixedCurrency === undefined && hasConversion()) {
                    currencyTypeCombo.setModel(this.getCurrencyColumnType());
                }
                currencyTypeCombo.bindProperty("selectedKey", "selection>/displayCurrency");

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

                var currencyButton = new sap.ui.commons.Button({
                    icon: "sap-icon://value-help",
                    press: function() {
                        var fnCallBack = function(result) {
                            if (result instanceof Object) {
                                var unitElement;
                                if (result.hasOwnProperty("fqName")) {
                                    that.viewnode.inputs.foreach(function(ip) {
                                        if (ip.selectAll && ip.getSource().fqName === result.fqName) {
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

                                if (!unitElement) {
                                    if (that.element && that.element.currencyConversion && that.element.currencyConversion.outputUnitCurrencyElement) {
                                        unitElement = that.element.currencyConversion.outputUnitCurrencyElement;
                                    }
                                }
                                /* that.attributes = {};*/
                                var unitCurrencyElement = {
                                    element: unitElement
                                };
                                that.elementAttribute.unitCurrencyElement = unitCurrencyElement;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeElementPropertiesCommand(that.viewnode.name, that.element.name, that.elementAttribute);
                                    that._execute(command);
                                    that.elementAttribute = undefined;
                                }
                                /*else {
                                                            that.commands.push(command);
                                                        }*/
                                unitCurrencyField.setValue(result.name);
                                CalcViewEditorUtil.clearErrorMessageTooltip(unitCurrencyField);

                            } else {
                                /*     that.attributes = {};*/
                                var unitCurrencyElement = {
                                    fixedCurrency: result
                                };
                                that.elementAttribute.unitCurrencyElement = unitCurrencyElement;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeElementPropertiesCommand(that.viewnode.name, that.element.name, that.elementAttribute);
                                    that._execute(command);
                                    that.elementAttribute = undefined;
                                }
                                /*else {
                                                            that.commands.push(command);
                                                        }*/
                                unitCurrencyField.setValue(result);
                                CalcViewEditorUtil.clearErrorMessageTooltip(unitCurrencyField);
                            }
                        };
                        var title = "";
                        if (currencyTypeCombo.getSelectedKey() === "column") {
                            title = "Select Column";
                        } else {
                            title = "Select Currency";
                        }
                        var schema;
                        var outputUnitCurrencyElement;
                        var isDefaultSchemaset = false;

                        if (that.attributes.outputUnitCurrencyElement) {
                            outputUnitCurrencyElement = that.attributes.outputUnitCurrencyElement;
                        } else if (that.element.currencyConversion && that.element.currencyConversion.outputUnitCurrencyElement) {
                            outputUnitCurrencyElement = that.element.currencyConversion.outputUnitCurrencyElement.name;
                        }

                        /*	for (var i = 0; i < that.commands.length; i++) {
							var command = that.commands[i];
							if (command.schema) {
								schema = command.schema;

							}
							if (command.outputUnitCurrencyElement) {
								outputUnitCurrencyElement = command.outputUnitCurrencyElement;

							}
						}*/

                        if (that.attributes.schema !== "<None>" && that.attributes.schema !== undefined) {
                            schema = that.attributes.schema;
                        }
                        if (!schema) {

                            if (that.element.currencyConversion && that.element.currencyConversion.schema) {
                                schema = that.element.currencyConversion.schema.schemaName;
                            } else {
                                if (that.viewnode) {
                                    var view = that.viewnode.$$containingFeature._owner;
                                    if (view.defaultSchema) {
                                        isDefaultSchemaset = true;
                                        /*schemaMapping.getPhysicalSchema(view.defaultSchema, that.context, function(results) {

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
												isUnit: false,
												schema: schema,
												currencyCode: true,
												selectedElement: that.element,
												outputUnitCurrencyElement: outputUnitCurrencyElement

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
                                isUnit: false,
                                currencyCode: true,
                                selectedElement: that.element,
                                outputUnitCurrencyElement: outputUnitCurrencyElement,
                                schema: schema
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
                    columns: 2,
                    layoutFixed: false,
                    width: "100%"
                        //   widths: ["40%", "60%"]
                });

                topMatrixLayout.addStyleClass("currencyHeader");
                topMatrixLayout_1.addStyleClass("currencyCheckBox");
                var enableConversionCheck = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("txt_conversion"),
                    checked: false,
                    change: function(event) {
                        that.attributes = {
                            isCreate: true,
                            objectAttributes: {
                                convert: this.getChecked()
                            }
                        };

                        setEnabled(this.getChecked());
                        enableShift(false);

                        if (this.getChecked()) {
                            //for enable ing shift by default
                            if (!enableDecimalShift.getChecked()) {
                                enableDecimalShift.setChecked(true);
                                enableDecimalShift.fireChange(event);

                                generateCurrencyCheck.setChecked(this.getChecked());
                                generateCurrencyCheck.fireChange(event);
                            }
                        } else {
                            //for disableing   shiftback 
                            if (decimalshiftBack.getChecked()) {
                                decimalshiftBack.setChecked(this.getChecked());
                                decimalshiftBack.fireChange(event);
                            }
                            if (!enableDecimalShift.getChecked()) {
                                generateCurrencyCheck.setChecked(this.getChecked());
                                generateCurrencyCheck.fireChange(event);
                            }
                            that.attributes.objectAttributes.erpDecimalShiftBack = false;
                        }

                        var schema;

                        /*	that.attributes.isCreate=true;
						that.attributes.objectAttributes.convert=this.getChecked();*/

                        if (this.getChecked()) {
                            if (that.viewnode) {
                                var view = that.viewnode.$$containingFeature._owner;
                                if (view.defaultSchema) {
                                    schema = view.defaultSchema;
                                }
                            }
                            that.attributes.schema = schema;
                        }

                        schemaCurrencyField.setValue(schema);

                        if (!that.isDialog) {
                            var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                            that._execute(command);
                            that.attributes = {};
                        }

                        if (this.getChecked()) {
                            currencyTypeCombo.setModel(that.getCurrencyColumnType());
                            if (!that.element.unitCurrencyElement) {
                                unitCurrencyField.setValue("");
                            }

                        } else {
                            currencyTypeCombo.setModel(that.getCurrencyType());
                            if (that.element.unitCurrencyElement) {
                                currencyTypeCombo.setSelectedKey("column");
                            } else {
                                currencyTypeCombo.setSelectedKey("fixed");
                            }

                        }

                        setModel();
                    }
                }).addStyleClass("dummyTest1");

                //   topMatrixLayout_1.createRow(null, enableConversionCheck);

                var enableDecimalShift = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("txt_decimal_shift"),
                    checked: false,
                    change: function(event) {
                        if (that.attributes.objectAttributes) {
                            that.attributes.objectAttributes.erpDecimalShift = enableDecimalShift.getChecked();
                        } else {
                            if (that.attributes) {
                                that.attributes.objectAttributes = {
                                    erpDecimalShift: enableDecimalShift.getChecked()
                                };
                            } else {
                                that.attributes = {
                                    objectAttributes: {
                                        erpDecimalShift: enableDecimalShift.getChecked()
                                    }
                                };
                            }

                        }
                        if (!enableDecimalShift.getChecked()) {
                            that.attributes.objectAttributes.erpDecimalShiftBack = false;
                            decimalshiftBack.setChecked(false);
                        }
                        if (!that.isDialog) {
                            var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                            that._execute(command);
                            that.attributes = {};
                        }
                        enableShift(this.getChecked());

                        if (!enableConversionCheck.getChecked()) {
                            if (this.getChecked() && generateCurrencyCheck.getChecked() === false) {
                                generateCurrencyCheck.setChecked(this.getChecked());
                                generateCurrencyCheck.fireChange(event);
                            } else if (generateCurrencyCheck.getChecked()) {
                                generateCurrencyCheck.setChecked(this.getChecked());
                                generateCurrencyCheck.fireChange(event);
                            }
                        }

                        if (enableConversionCheck.getChecked() && this.getChecked()) {
                            decimalshiftBack.setEnabled(true);
                        } else {
                            decimalshiftBack.setEnabled(false);
                        }

                    }
                }).addStyleClass("dummyTest2");
                var decimalshiftBack = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("txt_cc_shift_back"),
                    checked: false,
                    change: function() {
                        if (that.attributes.objectAttributes) {
                            that.attributes.objectAttributes.erpDecimalShiftBack = decimalshiftBack.getChecked();
                        } else {
                            that.attributes = {
                                objectAttributes: {
                                    erpDecimalShiftBack: decimalshiftBack.getChecked()
                                }
                            };
                        }

                        if (!that.isDialog) {
                            var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                            that._execute(command);
                            that.attributes = {};
                        }
                        /* else {
                                              that.commands.push(command);
                                          }*/
                    }
                }).addStyleClass("dummyTest3");
                //   topMatrixLayout_1.createRow(null, enableDecimalShift);

                if (that.element.currencyConversion && that.element.currencyConversion.erpDecimalShiftBack) {
                    decimalshiftBack.setChecked(true);
                } else {
                    decimalshiftBack.setChecked(false);
                }

                if (that.element.currencyConversion && that.element.currencyConversion.erpDecimalShift) {
                    enableDecimalShift.setChecked(true);
                } else {
                    enableDecimalShift.setChecked(false);
                }

                var withRounding = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("txt_rounding"),
                    checked: false,
                    change: function() {
                        that.attributes = {
                            objectAttributes: {
                                round: withRounding.getChecked()
                            }
                        };
                        if (!that.isDialog) {
                            var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                            that._execute(command);
                            that.attributes = {};
                        }

                    }
                }).addStyleClass("dummyTest4");

                if (that.element.currencyConversion && that.element.currencyConversion.round) {
                    withRounding.setChecked(true);
                } else {
                    withRounding.setChecked(false);
                }
                topMatrixLayout_1.createRow(enableConversionCheck, enableDecimalShift);
                topMatrixLayout_1.createRow(withRounding, decimalshiftBack);

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

                //conversionMatrixLayout.setEnabled(false);
                var topMatrixLayout_2 = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    layoutFixed: false,
                    width: "100%",
                    widths: ["29.5%", "70.5%"]
                });

                topMatrixLayout_2.addStyleClass("currencyHeader");

                var schemaCurrencyLabel = new sap.ui.commons.Label({
                    text: "Schema for currency conversion",
                    required: true,
                    requiredAtBegin: true
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
                    value: "{/schema}",
                    width: "100%",
                    change: function(oEvent) {
                        var schemaName = schemaCurrencyField.getValue();
                        that.attributes = {
                            schema: schemaName
                        };

                        if (!that.isDialog) {
                            var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                            that._execute(command);
                            that.attributes = {};
                        }
                        /* else {
                                              that.commands.push(command);
                                          }*/
                    }
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

                        var regExp = /\(([^)]+)\)/; //finding the schema name 
                        selectedSchema = regExp.exec(oEvent.getParameter("node").getText());
                        if (selectedSchema === undefined || selectedSchema === null) {
                            selectedSchema = oEvent.getParameter("node").getText();
                        } else {
                            selectedSchema = selectedSchema[1];
                        }

                    }
                });
                oTree.setWidth("220px");
                oTree.setHeight("300px");
                oTree.setShowHeader(false);
                oTree.setShowHeaderIcons(false);
                oTree.setShowHorizontalScrollbar(false);

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
                //Get the Unit tables using Search functionality
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
                        /*if (that.context.service) {
						that.context.service.catalogDAO.getSchemas(undefined, undefined, undefined, undefined, onComplete);
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
                                        if (schemas) {
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
                        //	getSchemaMapping();
                    })
                    // does default error handling, i.e. shows a message in case of exceptions
                    .done();

                oTree.attachBrowserEvent('dblclick', function(oEvent) {
                    setSchema();
                });

                var setSchema = function() {
                    var selectedNode = selectedSchema;

                    if (selectedNode === "<None>") {
                        that.attributes = {
                            schema: "<None>"
                        };

                        if (!that.isDialog) {
                            var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                            that._execute(command);
                            that.attributes = {};
                        }
                        /*else {
                                              that.commands.push(command);
                                          }*/
                        schemaCurrencyField.setValue("");
                        tp1.close();
                    } else if (selectedNode !== "<None>" && selectedNode !== "Currency Schemas" && selectedNode !== "Unit Schemas" && selectedNode !==
                        "Other Schemas") {
                        that.attributes = {
                            schema: selectedNode
                        };

                        if (!that.isDialog) {
                            var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
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
                var schemaRow;

                //Echange rate via Conversion table or column

                /*				var exchangeViaCCTablesRadioBtn = new sap.ui.commons.RadioButton({
					text: resourceLoader.getText("txt_exchange_via_conv_tables"),
					tooltip: resourceLoader.getText("txt_exchange_via_conv_tables"),
					groupName: 'exchangeRate',

					select: function() {
						exchangeViaCCTablesRadioBtn.setSelected(true);
						exchangeViaColumnRadioBtn.setSelected(false);
						//inserting additional rows
						conversionMatrixLayout.insertRow(ClientCurrencyRow, ClientCurrencyRow.indexValue);
						conversionMatrixLayout.insertRow(conversionDateRow, conversionDateRow.indexValue);
						if (that.isDialog && !(that.element.calculationDefinition)) {
							//    topMatrixLayout.insertRow(DataTypeRow, DataTypeRow.indexValue);
						}
						//changing the lable to exhanchge type
						exchangeTypeLabel.setText(resourceLoader.getText("txt_exchange_type"));

						/*  exchangeViaCCTablesRadioBtn.setSelected(false);Fixed
                        exchangeViaColumnRadioBtn.setSelected(true);
						sourceTypeCombo.setEditable(true);
						targetTypeCombo.setEditable(true);
						exchangeTypeCombo.setEditable(true);

						//changing to default type(fixed)
						sourceTypeCombo.setSelectedKey("fixed");
						targetTypeCombo.setSelectedKey("fixed");
						exchangeTypeCombo.setSelectedKey("fixed");

						topMatrixLayout_2.addRow(schemaRow);

						//reseting text box values 
						var sourceCurrency = {
							element: undefined
						};
						var targetCurrency = {
							element: undefined
						};
						var exchangeRateType = {
							element: undefined
						};

						sourceCurrencyField.setValue("");
						targetCurrencyField.setValue("");
						exchangeTypeField.setValue("");
						that.attributes.sourceCurrency = sourceCurrency;
						that.attributes.targetCurrency = targetCurrency;
						that.attributes.exchangeRateElement = undefined;
						that.attributes.exchangeRateType = exchangeRateType;
						if (!that.isDialog) {
							var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
							that._execute(command);
							that.attributes = {};
						}

					}
				}).addStyleClass("dummyTest5");*/

                /*	var exchangeViaColumnRadioBtn = new sap.ui.commons.RadioButton({
					text: resourceLoader.getText("txt_exchange_via_column"),
					tooltip: resourceLoader.getText("txt_exchange_via_column"),
					groupName: 'exchangeRate',

					select: function() {
						ClientCurrencyRow.indexValue = conversionMatrixLayout.indexOfRow(ClientCurrencyRow);
						conversionDateRow.indexValue = conversionMatrixLayout.indexOfRow(conversionDateRow);
						if (that.isDialog && !(that.element.calculationDefinition)) {
							//    DataTypeRow.indexValue = topMatrixLayout.indexOfRow(DataTypeRow);
						}
						conversionMatrixLayout.removeRow(ClientCurrencyRow);
						conversionMatrixLayout.removeRow(conversionDateRow);
						// topMatrixLayout.removeRow(DataTypeRow);

						sourceTypeCombo.setEditable(false);
						targetTypeCombo.setEditable(false);
						exchangeTypeCombo.setEditable(false);

						sourceTypeCombo.setSelectedKey("column");
						targetTypeCombo.setSelectedKey("column");
						exchangeTypeCombo.setSelectedKey("column");

						exchangeTypeLabel.setText(resourceLoader.getText("txt_exchange_rate"));
						schemaRow = topMatrixLayout_2.removeRow(1);

						//reseting text box values 
						var sourceCurrency = {
							element: undefined
						};
						var targetCurrency = {
							element: undefined
						};
						var exchangeRateType = {
							element: undefined
						};

						sourceCurrencyField.setValue("");
						targetCurrencyField.setValue("");
						exchangeTypeField.setValue("");
						that.attributes.sourceCurrency = sourceCurrency;
						that.attributes.targetCurrency = targetCurrency;
						that.attributes.exchangeRateElement = undefined;
						that.attributes.exchangeRateType = exchangeRateType;
						if (!that.isDialog) {
							var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
							that._execute(command);
							that.attributes = {};
						}
					}
				});
*/
                //	topMatrixLayout_2.createRow(exchangeViaCCTablesRadioBtn, exchangeViaColumnRadioBtn);

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
                    text: "Client for currency conversion",
                    required: true,
                    requiredAtBegin: true

                });

                var clientCurrencyCell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2
                });

                var clientCurrencyCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
                    width: "100%"
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
                clientCurrencyCombo.bindProperty("selectedKey", "selection>/client");

                var clientCurrencyField = new sap.ui.commons.TextField({
                    value: "{/client}",
                    width: "100%",
                    change: function(event) {

                        if (clientCurrencyCombo.getSelectedKey() === "column") {
                            var unitElement;
                            var name = this.getValue();
                            that.viewnode.elements.foreach(function(element) {
                                if (element.name === name) {
                                    unitElement = element;
                                }
                            });
                            /* that.attributes = {

                                                 };*/
                            if (unitElement) {
                                var client = {
                                    element: unitElement
                                };
                                that.attributes.client = client;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
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

                        } else if (clientCurrencyCombo.getSelectedKey() === "input_parameter") {
                            var name = this.getValue();
                            var unitElement;
                            if (columnView) {
                                columnView.parameters.foreach(function(parameter) {
                                    if (parameter.name === name) {
                                        unitElement = parameter;
                                    }

                                });
                            }
                            if (unitElement) {
                                /* that.attributes = {};*/
                                var client = {
                                    parameter: unitElement
                                };
                                that.attributes.client = client;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /* else {
                                                            that.commands.push(command);
                                                        }*/
                                CalcViewEditorUtil.clearErrorMessageTooltip(this);
                            }

                        } else {
                            /* that.attributes = {

                                                 };*/
                            var constantValue = this.getValue();
                            var client = {
                                constantValue: constantValue
                            };
                            that.attributes.client = client;

                            if (!that.isDialog) {
                                var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                that._execute(command);
                                that.attributes = {};
                            }
                            /*else {
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
                                /*  that.attributes = {

                                                        };*/
                                if (result.nodetype === "element") {

                                    if (result.hasOwnProperty("fqName")) {
                                        that.viewnode.inputs.foreach(function(ip) {
                                            if (ip.selectAll && ip.getSource().fqName === result.fqName) {
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

                                    var client = {
                                        element: unitElement
                                    };
                                    that.attributes.client = client;

                                    //for shared element
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
                                                unitElement = parameter;
                                            }

                                        });
                                    }
                                    var client = {
                                        parameter: unitElement
                                    };
                                    that.attributes.client = client;
                                }

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /* else {
                                                            that.commands.push(command);
                                                        }*/
                                clientCurrencyField.setValue(result.name);

                            } else {
                                /*  that.attributes = {

                                                        };*/
                                var client = {
                                    constantValue: result
                                };
                                that.attributes.client = client;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
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
                        if (that.element.currencyConversion && that.element.currencyConversion.client) {
                            client = that.element.currencyConversion.client.constantValue;
                        }
                        var schema;
                        if (that.element.currencyConversion && that.element.currencyConversion.schema) {
                            schema = that.element.currencyConversion.schema.schemaName;
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
                            isUnit: false,
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

                //exchangeRateViaColumn
                var ClientCurrencyRow = new sap.ui.commons.layout.MatrixLayoutRow({});
                ClientCurrencyRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    colSpan: 1
                }).addContent(clientCurrencyCell));
                ClientCurrencyRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    colSpan: 1
                }).addContent(clientCurrencyCell_1));

                conversionMatrixLayout.addRow(ClientCurrencyRow);

                //conversionMatrixLayout.createRow(clientCurrencyCell, clientCurrencyCell_1);

                var sourceCurrencyLabel = new sap.ui.commons.Label({
                    text: "Source Currency",
                    required: true,
                    requiredAtBegin: true
                });

                var sourceCurrencyCell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2
                });

                var sourceTypeCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
                    width: "100%"
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
                sourceTypeCombo.bindProperty("selectedKey", "selection>/sourceCurrency");

                var sourceCurrencyField = new sap.ui.commons.TextField({
                    //editable: false,
                    value: "{/sourceCurrency}",
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
                                /* var attributes = {

                                                        };*/
                                var sourceCurrency = {
                                    element: unitElement
                                };
                                that.attributes.sourceCurrency = sourceCurrency;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
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
                            var sourceCurrency = {
                                constantValue: columnName
                            };
                            that.attributes.sourceCurrency = sourceCurrency;

                            if (!that.isDialog) {
                                var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
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

                                if (result.hasOwnProperty("fqName")) {
                                    that.viewnode.inputs.foreach(function(ip) {
                                        if (ip.selectAll && ip.getSource().fqName === result.fqName) {
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

                                /* var attributes = {

                                                        };*/
                                var sourceCurrency = {
                                    element: unitElement
                                };
                                that.attributes.sourceCurrency = sourceCurrency;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
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
                                var sourceCurrency = {
                                    constantValue: result
                                };
                                that.attributes.sourceCurrency = sourceCurrency;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
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
                        if (that.element.currencyConversion && that.element.currencyConversion.schema) {
                            schema = that.element.currencyConversion.schema.schemaName;
                        }
                        var title = "";
                        if (sourceTypeCombo.getSelectedKey() === "fixed") {
                            title = "Select Currency";
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

                            if (that.element.currencyConversion && that.element.currencyConversion.schema) {
                                schema = that.element.currencyConversion.schema.schemaName;
                            } else {
                                if (that.viewnode) {
                                    var view = that.viewnode.$$containingFeature._owner;
                                    if (view.defaultSchema) {
                                        isDefaultSchemaset = true;
                                        /*schemaMapping.getPhysicalSchema(view.defaultSchema, that.context, function(results) {

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
												isUnit: false,
												schema: schema,
												currencyCode: true,
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
                                isUnit: false,
                                currencyCode: true,
                                schema: schema,
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
                    text: "Target Currency",
                    required: true,
                    requiredAtBegin: true
                });

                var targetcell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2
                });

                var targetTypeCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
                    width: "100%"
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
                targetTypeCombo.bindProperty("selectedKey", "selection>/targetCurrency");
                var oldTargetValue;
                var targetCurrencyField = new sap.ui.commons.TextField({
                    // editable: false,
                    value: "{/targetCurrency}",
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
                                // var attributes = {};
                                var targetCurrency = {
                                    element: unitElement
                                };
                                that.attributes.targetCurrency = targetCurrency;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /* else {
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
                                /*var attributes = {};*/
                                var targetCurrency = {
                                    parameter: unitElement
                                };
                                that.attributes.targetCurrency = targetCurrency;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /* else {
                                                            that.commands.push(command);
                                                        }*/
                                CalcViewEditorUtil.clearErrorMessageTooltip(this);
                            } else {
                                CalcViewEditorUtil.showErrorMessageTooltip(this, "Input Parameter does not exist");
                            }

                        } else {
                            /*var attributes = {};*/
                            var targetName = targetCurrencyField.getValue();
                            var targetCurrency = {
                                constantValue: targetName
                            };
                            that.attributes.targetCurrency = targetCurrency;

                            if (!that.isDialog) {
                                var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
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

                            };
                            jQuery.sap.require("sap.ui.commons.MessageBox");

                            // open a fully configured message box
                            sap.ui.commons.MessageBox.show(
                                "The display currency and target currency values have\n been the same.Do you want to apply the modified target currency\n to the display currency as well?",
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
                                var targetCurrency = {};

                                if (result.nodetype === "element") {
                                    if (result.hasOwnProperty("fqName")) {
                                        that.viewnode.inputs.foreach(function(ip) {
                                            if (ip.selectAll && ip.getSource().fqName === result.fqName) {
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
                                    targetCurrency = {
                                        element: unitElement
                                    };
                                } else {
                                    if (columnView) {
                                        columnView.parameters.foreach(function(parameter) {
                                            if (parameter.name === result.name) {
                                                unitElement = parameter;
                                            }

                                        });
                                    }
                                    targetCurrency = {
                                        parameter: unitElement
                                    };
                                }
                                if (unitElement) {
                                    /*  var attributes = {};*/

                                    that.attributes.targetCurrency = targetCurrency;

                                    if (!that.isDialog) {
                                        var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                        that._execute(command);
                                        that.attributes = {};
                                    }
                                    /*else {
                                                                   that.commands.push(command);
                                                               }*/
                                    targetCurrencyField.setValue(result.name);
                                }

                            } else {
                                /*var attributes = {};*/
                                var targetCurrency = {
                                    constantValue: result
                                };
                                that.attributes.targetCurrency = targetCurrency;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /* else {
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
                                sap.ui.commons.MessageBox.show(
                                    "The display currency and target currency values have\n been the same.Do you want to apply the modified target currency\n to the display currency as well?",
                                    sap.ui.commons.MessageBox.Icon.WARNING,
                                    "Confirm Currency Change", [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO],
                                    callBack,
                                    sap.ui.commons.MessageBox.Action.YES);
                            }
                            currencyChanges(isChanged);
                            oldTargetValue = targetCurrencyField.getValue();
                        };

                        var schema;
                        if (that.element.currencyConversion && that.element.currencyConversion.schema) {
                            schema = that.element.currencyConversion.schema.schemaName;
                        }
                        var title = "";
                        if (targetTypeCombo.getSelectedKey() === "fixed") {
                            title = "Select Currency";
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

                            if (that.element.currencyConversion && that.element.currencyConversion.schema) {
                                schema = that.element.currencyConversion.schema.schemaName;
                            } else {
                                if (that.viewnode) {
                                    var view = that.viewnode.$$containingFeature._owner;
                                    if (view.defaultSchema) {
                                        isDefaultSchemaset = true;
                                        /*schemaMapping.getPhysicalSchema(view.defaultSchema, that.context, function(results) {

											if (results) {
												schema = results;
											} else {
												schema = view.defaultSchema;
											}
											var currencyCode = targetTypeCombo.getSelectedKey() === "input_parameter" ? false : true;
											var valueHelpDialog = new ValueHelpDialog({
												undoManager: that._undoManager,
												fnCallBack: fnCallBack,
												context: that.context,
												selectedItem: targetTypeCombo.getSelectedKey(),
												viewnode: that.viewnode,
												title: title,
												isUnit: false,
												schema: schema,
												currencyCode: currencyCode,
												selectedElement: that.element

											});

											valueHelpDialog.openDialog();
										});*/
                                    }
                                }

                            }
                        }
                        if (!isDefaultSchemaset) {

                            if (targetTypeCombo.getSelectedKey() == "input_parameter") {

                            }
                            var valueHelpDialog = new ValueHelpDialog({
                                undoManager: that._undoManager,
                                fnCallBack: fnCallBack,
                                context: that.context,
                                selectedItem: targetTypeCombo.getSelectedKey(),
                                viewnode: that.viewnode,
                                title: title,
                                isUnit: false,
                                currencyCode: targetTypeCombo.getSelectedKey() === "input_parameter" ? false : true,
                                schema: schema,
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

                            /*var attributes = {

                                                 };*/
                            if (unitElement) {
                                var unitCurrencyElement = {
                                    element: unitElement
                                };
                                that.elementAttribute.unitCurrencyElement = unitCurrencyElement;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeElementPropertiesCommand(that.viewnode.name, that.element.name, that.elementAttribute);
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
                                that.attributes = {};
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



                var exchangeTypeLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_exchange_type"),
                    required: true,
                    requiredAtBegin: true
                });

                var exchangeTypecell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2
                });

                /* var exchangeTypeCombo = new sap.ui.commons.DropdownBox({
                                width: "100%",
                                change: function(event) {

                                }
                            });
                            exchangeTypeCombo.setModel(this.getTargetType());*/
                var oItemTemplate = new sap.ui.core.ListItem();
                oItemTemplate.bindProperty("key", "key");
                oItemTemplate.bindProperty("text", "value");
                oItemTemplate.bindProperty("icon", "icon");
                //  exchangeTypeCombo.bindItems("/items", oItemTemplate);

                var exchangeTypeCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
                    width: "100%"
                }).addStyleClass("borderIconCombo");
                exchangeTypeCombo.bindProperty("selectedKey", "selection>/exchangeRateType");
                exchangeTypeCombo.setModel(this.getTargetType());
                var listBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/items",
                        template: oItemTemplate
                    }
                });
                exchangeTypeCombo.setListBox(listBox);

                exchangeTypecell.createRow(exchangeTypeLabel, exchangeTypeCombo);

                var exchangeTypeField = new sap.ui.commons.TextField({
                    //  editable: false,
                    value: "{/exchangeRateType}",
                    width: "100%",
                    change: function(oEvent) {

                        if (exchangeTypeCombo.getSelectedKey() === "column") {
                            var unitElement;
                            var exchangeRateType;
                            var exchangeType = exchangeTypeField.getValue();
                            that.viewnode.elements.foreach(function(element) {
                                if (element.name === exchangeType) {
                                    unitElement = element;
                                }
                            });
                            exchangeRateType = {
                                element: unitElement
                            };

                            if (unitElement) {
                                /* var attributes = {

                                };
*/

                                that.attributes.exchangeRateType = exchangeRateType;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
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
                        } else if (exchangeTypeCombo.getSelectedKey() === "input_parameter") {
                            var unitElement;
                            var exchangeType = exchangeTypeField.getValue();
                            if (columnView) {
                                columnView.parameters.foreach(function(parameter) {
                                    if (parameter.name === exchangeType) {
                                        unitElement = parameter;
                                    }

                                });
                            }
                            exchangeRateType = {
                                parameter: unitElement
                            };

                            if (unitElement) {
                                /* var attributes = {

                                                        };*/

                                that.attributes.exchangeRateElement = undefined;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /* else {
                                                            that.commands.push(command);
                                                        }*/
                                CalcViewEditorUtil.clearErrorMessageTooltip(this);
                            } else {
                                CalcViewEditorUtil.showErrorMessageTooltip(this, "Input Parameter does not exist");
                            }

                        } else {
                            var exchangeType = exchangeTypeField.getValue();
                            /*   var attributes = {

                                                 };*/
                            var exchangeRateType = {
                                constantValue: exchangeType
                            };

                            that.attributes.exchangeRateType = exchangeRateType;

                            //    that.attributes.exchangeRateType = exchangeRateType;

                            if (!that.isDialog) {
                                var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                that._execute(command);
                                that.attributes = {};
                            }
                            /*else {
                                                     that.commands.push(command);
                                                 }*/
                            CalcViewEditorUtil.clearErrorMessageTooltip(this);
                        }

                    }
                });

                exchangeTypeField.addStyleClass("currencyText");

                var exchangeTypeButton = new sap.ui.commons.Button({
                    icon: "sap-icon://value-help",
                    press: function() {

                        var fnCallBack = function(result) {
                            if (result instanceof Object) {
                                var unitElement;
                                var exchangeRateType;
                                if (result.nodetype === "element") {
                                    if (result.hasOwnProperty("fqName")) {
                                        that.viewnode.inputs.foreach(function(ip) {
                                            if (ip.selectAll && ip.getSource().fqName === result.fqName) {
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
                                    exchangeRateType = {
                                        element: unitElement
                                    };
                                } else {
                                    if (columnView) {
                                        columnView.parameters.foreach(function(parameter) {
                                            if (parameter.name === result.name) {
                                                unitElement = parameter;
                                            }

                                        });
                                    }
                                    exchangeRateType = {
                                        parameter: unitElement
                                    };
                                }
                                if (unitElement) {

                                    that.attributes.exchangeRateType = exchangeRateType;

                                    //   that.attributes.exchangeRateType = exchangeRateType;

                                    if (!that.isDialog) {
                                        var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                        that._execute(command);
                                        that.attributes = {};
                                    }
                                    /*else {
                                                                   that.commands.push(command);
                                                               }*/
                                    exchangeTypeField.setValue(result.name);
                                }
                            } else {
                                /* var attributes = {

                                                        };*/
                                var exchangeRateType = {
                                    constantValue: result
                                };
                                that.attributes.exchangeRateType = exchangeRateType;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                }
                                /*else {
                                                            that.commands.push(command);
                                                        }*/
                                exchangeTypeField.setValue(result);
                            }
                            CalcViewEditorUtil.clearErrorMessageTooltip(exchangeTypeField);
                        };
                        var schema;
                        if (that.element.currencyConversion && that.element.currencyConversion.schema) {
                            schema = that.element.currencyConversion.schema.schemaName;
                        }
                        var title = "";
                        if (exchangeTypeCombo.getSelectedKey() === "fixed") {
                            title = "Select Currency";
                        } else if (exchangeTypeCombo.getSelectedKey() === "column") {
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

                            if (that.element.currencyConversion && that.element.currencyConversion.schema) {
                                schema = that.element.currencyConversion.schema.schemaName;
                            } else {
                                if (that.viewnode) {
                                    var view = that.viewnode.$$containingFeature._owner;
                                    if (view.defaultSchema) {
                                        isDefaultSchemaset = true;
                                        /*schemaMapping.getPhysicalSchema(view.defaultSchema, that.context, function(results) {

											if (results) {
												schema = results;
											} else {
												schema = view.defaultSchema;
											}
											var valueHelpDialog = new ValueHelpDialog({
												undoManager: that._undoManager,
												fnCallBack: fnCallBack,
												context: that.context,
												selectedItem: exchangeTypeCombo.getSelectedKey(),
												viewnode: that.viewnode,
												title: title,
												isUnit: false,
												schema: schema,
												isExchangeType: true,
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
                                selectedItem: exchangeTypeCombo.getSelectedKey(),
                                viewnode: that.viewnode,
                                title: title,
                                isUnit: false,
                                isExchangeType: true,
                                schema: schema,
                                selectedElement: that.element

                            });

                            valueHelpDialog.openDialog();
                        }
                    }
                });
                var exchangeTypecell_1 = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    widths: ["80%", "20%"],
                    width: "100%"

                });
                exchangeTypecell_1.createRow(exchangeTypeField, exchangeTypeButton);

                exchangeTypecell_1.addStyleClass("currencyBrowseButton");
                exchangeTypeLabel.addStyleClass("labelFloat");

                conversionMatrixLayout.createRow(exchangeTypecell, exchangeTypecell_1);

                var conversionDateLabel = new sap.ui.commons.Label({
                    text: "Conversion date",
                    required: true,
                    requiredAtBegin: true
                });

                var conversionDateCell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2
                });

                var conversionDateCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
                    width: "100%"
                }).addStyleClass("borderIconCombo");
                conversionDateCombo.bindProperty("selectedKey", "selection>/referenceDate");
                conversionDateCombo.setModel(this.getTargetType());
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
                conversionDateCombo.setListBox(listBox);

                conversionDateCell.createRow(conversionDateLabel, conversionDateCombo);

                // conversionDateCombo.bindProperty("selectedKey", "selection>/referenceDate");
                var oDatePicker1 = new sap.ui.commons.DatePicker({
                    width: "90%",
                    value: '{/referenceDate}'
                });

                if (this.element.currencyConversion && that.element.currencyConversion.referenceDate) {
                    var currencyData = {
                        referenceDate: that.element.currencyConversion.referenceDate.constantValue
                    };
                    var currencyModel = new sap.ui.model.json.JSONModel();
                    // set the data for the model
                    currencyModel.setData(currencyData);
                    oDatePicker1.setModel(currencyModel);

                }

                oDatePicker1.attachChange(
                    function(oEvent) {
                        if (oEvent.getParameter("invalidValue")) {
                            oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
                        } else {
                            oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
                            var date = oEvent.getParameters().newYyyymmdd;
                            /*var attributes = {

                                                 };*/
                            var referenceDate = {
                                constantValue: date
                            };
                            that.attributes.referenceDate = referenceDate;

                            if (!that.isDialog) {
                                var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                that._execute(command);
                                that.attributes = {};
                            }
                            /*else {
                                                     that.commands.push(command);
                                                 }*/
                            this.setValue(date);
                        }
                    }
                );

                var conversionDateField = new sap.ui.commons.TextField({
                    //editable: false,
                    value: "{/referenceDate}",
                    width: "100%",
                    change: function(oEvent) {

                        if (conversionDateCombo.getSelectedKey() === "column") {
                            var unitElement;
                            var conversionDate = conversionDateField.getValue();

                            that.viewnode.elements.foreach(function(element) {
                                if (element.name === conversionDate) {
                                    unitElement = element;
                                }
                            });

                            if (unitElement) {
                                /*  var attributes = {

                                                        };*/
                                var referenceDate = {
                                    element: unitElement
                                };
                                that.attributes.referenceDate = referenceDate;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
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
                            var conversionDate = conversionDateField.getValue();
                            /*var attributes = {

                                                 };*/
                            var referenceDate = {
                                constantValue: conversionDate
                            };
                            that.attributes.referenceDate = referenceDate;

                            if (!that.isDialog) {
                                var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                that._execute(command);
                                that.attributes = {};
                            }
                            /*else {
                                                     that.commands.push(command);
                                                 }*/
                            CalcViewEditorUtil.clearErrorMessageTooltip(this);
                        }

                    }
                });

                conversionDateField.addStyleClass("currencyText");

                var conversionDateButton = new sap.ui.commons.Button({
                    icon: "sap-icon://value-help",
                    press: function() {
                        var fnCallBack = function(result) {

                            if (result instanceof Object) {
                                var unitElement;
                                if (result.nodetype === "element") {

                                    if (result.hasOwnProperty("fqName")) {
                                        that.viewnode.inputs.foreach(function(ip) {
                                            if (ip.selectAll && ip.getSource().fqName === result.fqName) {
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

                                } else {
                                    if (columnView) {
                                        columnView.parameters.foreach(function(parameter) {
                                            if (parameter.name === result.name) {
                                                unitElement = parameter;
                                            }

                                        });
                                    }
                                }
                                if (unitElement) {
                                    /*var attributes = {

                                                               };*/
                                    var referenceDate = {};
                                    if (result.nodetype === "element") {
                                        referenceDate = {
                                            element: unitElement
                                        };
                                    } else {
                                        referenceDate = {
                                            parameter: unitElement
                                        };
                                    }

                                    that.attributes.referenceDate = referenceDate;

                                    if (!that.isDialog) {
                                        var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                        that._execute(command);
                                        that.attributes = {};
                                    }
                                    /* else {
                                                                   that.commands.push(command);
                                                               }*/
                                    conversionDateField.setValue(result.name);
                                }
                            } else {
                                /* var attributes = {

                                                        };*/
                                var referenceDate = {
                                    constantValue: result
                                };
                                that.attributes.referenceDate = referenceDate;

                                if (!that.isDialog) {
                                    var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                    that._execute(command);
                                    that.attributes = {};
                                }
                                /*else {
                                                            that.commands.push(command);
                                                        }*/
                                conversionDateField.setValue(result);
                            }
                            CalcViewEditorUtil.clearErrorMessageTooltip(conversionDateField);
                        };
                        var schema;
                        if (that.element.currencyConversion && that.element.currencyConversion.schema) {
                            schema = that.element.currencyConversion.schema.schemaName;
                        }
                        var title = "";
                        if (conversionDateCombo.getSelectedKey() === "fixed") {
                            title = "Select Currency";
                        } else if (conversionDateCombo.getSelectedKey() === "column") {
                            title = "Select Column";
                        } else {
                            title = "Select Input Parameter";
                        }
                        var currencyDialog = new ValueHelpDialog({
                            undoManager: that._undoManager,
                            fnCallBack: fnCallBack,
                            context: that.context,
                            selectedItem: conversionDateCombo.getSelectedKey(),
                            viewnode: that.viewnode,
                            title: title,
                            isUnit: false,
                            schema: schema,
                            selectedElement: that.element
                        });

                        currencyDialog.openDialog();
                    }
                });
                var conversionDateCell_1 = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    widths: ["80%", "20%"],
                    width: "100%"

                });
                conversionDateCell_1.createRow(conversionDateField, conversionDateButton);

                conversionDateCell_1.addStyleClass("currencyBrowseButton");
                conversionDateLabel.addStyleClass("labelFloat");

                var conversionDateCellFinal = new sap.ui.commons.layout.MatrixLayout({
                    columns: 1,
                    width: "100%"

                });

                conversionDateCombo.attachChange(
                    function(oEvent) {
                        if (this.getSelectedKey() === "fixed") {
                            conversionDateCellFinal.removeAllRows();
                            conversionDateCellFinal.createRow(oDatePicker1);
                        } else {
                            conversionDateCellFinal.removeAllRows();
                            conversionDateCellFinal.createRow(conversionDateCell_1);
                        }
                    }
                );
                conversionDateCellFinal.createRow(oDatePicker1);

                //  conversionMatrixLayout.createRow(conversionDateCell, conversionDateCellFinal);
                // conversionDate 
                var conversionDateRow = new sap.ui.commons.layout.MatrixLayoutRow({});
                conversionDateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    colSpan: 1
                }).addContent(conversionDateCell));
                conversionDateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    colSpan: 1
                }).addContent(conversionDateCellFinal));

                conversionMatrixLayout.addRow(conversionDateRow);

                if (that.element.currencyConversion && that.element.currencyConversion.referenceDate && that.element.currencyConversion.referenceDate.element) {
                    conversionDateCellFinal.removeAllRows();
                    conversionDateCellFinal.createRow(conversionDateCell_1);
                }


                // exchange Rate UI start
                var exchangeRateLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_exchange_rate"),
                    icon: resourceLoader.getImagePath("Information.png")
                });

                var oRichTooltip = new sap.ui.commons.RichTooltip({
                    text: resourceLoader.getText("tol_exchange_rate"),
                    title: resourceLoader.getText("txt_exchange_rate")
                });
                exchangeRateLabel.setTooltip(oRichTooltip);
                var exchangeRateCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
                    width: "100%",
                    editable: false

                }).addStyleClass("borderIconCombo");
                exchangeRateCombo.addItem(new sap.ui.core.ListItem({
                    text: "Column"
                }));
                exchangeRateCombo.setValue("Column");

                var exchangeRatecell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2
                });

                exchangeRatecell.createRow(exchangeRateLabel, exchangeRateCombo);

                var exchangeRateField = new sap.ui.commons.TextField({
                    //  editable: false,
                    value: "{/exchangeRateElement}",
                    width: "100%",
                    change: function() {
                        var unitElement;
                        var exchangeType = exchangeRateField.getValue();
                        that.viewnode.elements.foreach(function(element) {
                            if (element.name === exchangeType) {
                                unitElement = element;
                            }
                        });
                        if (unitElement) {
                            that.attributes.exchangeRateElement = unitElement;
                            if (!that.isDialog) {
                                var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                that._execute(command);
                                that.attributes = {};
                            }
                            CalcViewEditorUtil.clearErrorMessageTooltip(this);
                        } else {
                            CalcViewEditorUtil.showErrorMessageTooltip(this, "Column does not exist");
                        }

                    }
                });

                exchangeRateField.addStyleClass("currencyText");

                var exchangeRateButton = new sap.ui.commons.Button({
                    icon: "sap-icon://value-help",
                    press: function() {

                        var fnCallBack = function(result) {
                            if (result instanceof Object) {
                                var unitElement;
                                if (result.nodetype === "element") {
                                    if (result.hasOwnProperty("fqName")) {
                                        that.viewnode.inputs.foreach(function(ip) {
                                            if (ip.selectAll && ip.getSource().fqName === result.fqName) {
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
                                }
                                if (unitElement) {

                                    that.attributes.exchangeRateElement = unitElement;

                                    if (!that.isDialog) {
                                        var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                        that._execute(command);
                                        that.attributes = {};
                                    }

                                    exchangeRateField.setValue(result.name);
                                }
                            }
                            CalcViewEditorUtil.clearErrorMessageTooltip(exchangeRateField);
                        };
                        var schema;
                        if (that.element.currencyConversion && that.element.currencyConversion.schema) {
                            schema = that.element.currencyConversion.schema.schemaName;
                        }
                        var title = "Select Column";

                        var isDefaultSchemaset = false;

                        if (that.attributes.schema !== "<None>" && that.attributes.schema !== undefined) {
                            schema = that.attributes.schema;
                        }
                        if (!schema) {

                            if (that.element.currencyConversion && that.element.currencyConversion.schema) {
                                schema = that.element.currencyConversion.schema.schemaName;
                            } else {
                                if (that.viewnode) {
                                    var view = that.viewnode.$$containingFeature._owner;
                                    if (view.defaultSchema) {
                                        isDefaultSchemaset = true;
                                        /*	schemaMapping.getPhysicalSchema(view.defaultSchema, that.context, function(results) {

											if (results) {
												schema = results;
											} else {
												schema = view.defaultSchema;
											}
											var valueHelpDialog = new ValueHelpDialog({
												undoManager: that._undoManager,
												fnCallBack: fnCallBack,
												context: that.context,
												selectedItem: "column",
												viewnode: that.viewnode,
												title: title,
												isUnit: false,
												schema: schema,
												isExchangeType: true,
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
                                selectedItem: "column",
                                viewnode: that.viewnode,
                                title: title,
                                isUnit: false,
                                isExchangeType: true,
                                schema: schema,
                                selectedElement: that.element

                            });

                            valueHelpDialog.openDialog();
                        }

                    }
                });
                var exchangeRatecell_1 = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    widths: ["80%", "20%"],
                    width: "100%"

                });
                exchangeRatecell_1.createRow(exchangeRateField, exchangeRateButton);

                exchangeRatecell_1.addStyleClass("currencyBrowseButton");
                exchangeRateLabel.addStyleClass("labelFloat");
                exchangeRateLabel.addStyleClass("cc_exchange");

                conversionMatrixLayout.createRow(exchangeRatecell, exchangeRatecell_1);

                ///exchnage rate ui ends



                var topMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    layoutFixed: false,
                    width: "100%",
                    widths: ["29.5%", "70.5%"]
                });

                topMatrixLayout.addStyleClass("currencyHeader");

                var generateCurrencyLabel = new sap.ui.commons.Label({
                    text: "Generate result currency column"
                });

                var generateCurrencyField = new sap.ui.commons.TextField({
                    editable: false,
                    width: "100%",
                    value: '{/outputUnitCurrencyElement}'

                }).addStyleClass("dummyTest8");

                generateCurrencyField.attachChange(function(event) {
                    var value = event.getParameter("newValue");
                    /*  var attributes = {

                                   };*/
                    var outputUnitCurrencyElement = value;

                    that.attributes.outputUnitCurrencyElement = outputUnitCurrencyElement;

                    if (!that.isDialog) {
                        var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                        that._execute(command);
                        that.attributes = {};
                    }
                    /*else {
                        that.commands.push(command);
                    }
*/
                    generateCurrencyField.setValue(value);
                });

                generateCurrencyField.addStyleClass("currencyText");

                var generateCurrencyCheck = new sap.ui.commons.CheckBox({
                    checked: false,
                    enabled: false,
                    change: function() {
                        if (this.getChecked()) {
                            generateCurrencyField.setEnabled(true);
                            generateCurrencyField.setEditable(true);
                            var name = that.element.name + "_CURRENCY";
                            generateCurrencyField.setValue(name);
                            var value = name;
                            /* var attributes = {

                                                 };*/
                            var outputUnitCurrencyElement = value;

                            that.attributes.outputUnitCurrencyElement = outputUnitCurrencyElement;

                            if (!that.isDialog) {
                                var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                that._execute(command);
                                that.attributes = {};
                            }

                        } else {
                            generateCurrencyField.setEditable(false);
                            generateCurrencyField.setEnabled(false);
                            var name = "";
                            generateCurrencyField.setValue(name);
                            var value = false;
                            /*var attributes = {

                                                 }*/
                            ;
                            var outputUnitCurrencyElement = value;

                            that.attributes.outputUnitCurrencyElement = outputUnitCurrencyElement;

                            if (!that.isDialog) {
                                var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                                that._execute(command);
                                that.attributes = {};
                            }
                            /*else {
                                                     that.commands.push(command);
                                                 }*/

                        }
                    }
                }).addStyleClass("dummyTest7");

                var generateCurrencyCell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    widths: ["8%", "92%"],
                    width: "96%"

                });
                generateCurrencyCell.createRow(generateCurrencyCheck, generateCurrencyField);

                generateCurrencyCell.addStyleClass("currencyBrowseButton");
                generateCurrencyLabel.addStyleClass("labelFloat");

                var dataTypeCurrencyLabel = new sap.ui.commons.Label({
                    text: "Data Type"
                });

                var scaleLabel = new sap.ui.commons.Label({
                    text: "scale"
                });
                var lengthLabel = new sap.ui.commons.Label({
                    text: "Length"
                });
                lengthLabel.addStyleClass("labelFloat");
                scaleLabel.addStyleClass("labelFloat");
                var dataTypeCurrencyCell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 5,
                    widths: ["40%", "20%", "10%", "20%", "10%"],
                    width: "96%"

                });
                var dataTypeComboChange = function(oEvent) {
                    var selectedKey = this.getSelectedKey();
                    /* var attributes = {

                                   };*/
                    var simpleType = {
                        dataType: selectedKey,
                        length: lengthField.getValue(),
                        scale: scaleField.getValue()
                    };
                    that.attributes.simpleType = simpleType;

                    if (!that.isDialog) {
                        var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                        that._execute(command);
                        that.attributes = {};
                    }
                    /*else {
                                       that.commands.push(command);
                                   }*/
                };
                var dataTypeCombo = new sap.ui.commons.ComboBox({
                    width: "100%",
                    change: dataTypeComboChange,
                    selectedKey: '{/dataType}'
                }).addStyleClass("dummyTest6");

                var lengthField = new sap.ui.commons.TextField({
                    width: "100%",
                    value: {
                        parts: ["selection>/dataType", "/dataTypeLength"],
                        formatter: function(dataType, length) {
                            if (dataType === "DOUBLE") {
                                return "";
                            } else {
                                return length;
                            }
                        }
                    },
                    editable: {
                        path: "selection>/dataType",
                        formatter: function(dataType) {
                            if (dataType === "DOUBLE") {
                                return false;
                            } else {
                                return true;
                            }
                        }
                    }
                });
                lengthField.addStyleClass("currencyText");
                lengthField.attachChange(function(event) {
                    var value = event.getParameter("newValue");
                    /* var attributes = {};*/

                    var simpleType = {
                        dataType: dataTypeCombo.getSelectedKey(),
                        length: value,
                        scale: scaleField.getValue()
                    };
                    that.attributes.simpleType = simpleType;

                    if (!that.isDialog) {
                        var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                        that._execute(command);
                        that.attributes = {};
                    }
                    /*else {
                                       that.commands.push(command);
                                   }*/

                    lengthField.setValue(value);
                });

                var scaleField = new sap.ui.commons.TextField({
                    width: "100%",
                    value: {
                        parts: ["selection>/dataType", "/dataTypeScale"],
                        formatter: function(dataType, scale) {
                            if (dataType === "DOUBLE") {
                                return "";
                            } else {
                                return scale;
                            }
                        }
                    },
                    editable: {
                        path: "selection>/dataType",
                        formatter: function(dataType) {
                            if (dataType === "DOUBLE") {
                                return false;
                            } else {
                                return true;
                            }
                        }
                    }
                });
                scaleField.addStyleClass("currencyText");
                scaleField.attachChange(function(event) {
                    var value = event.getParameter("newValue");
                    /*var attributes = {};*/

                    var simpleType = {
                        dataType: dataTypeCombo.getSelectedKey(),
                        length: lengthField.getValue(),
                        scale: value
                    };
                    that.attributes.simpleType = simpleType;

                    if (!that.isDialog) {
                        var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                        that._execute(command);
                        that.attributes = {};
                    }
                    /* else {
                                       that.commands.push(command);
                                   }*/
                    scaleField.setValue(value);
                });
                dataTypeCurrencyCell.createRow(dataTypeCombo, lengthLabel, lengthField, scaleLabel, scaleField);
                dataTypeCombo.setModel(this.getDataType());
                var oItemTemplate = new sap.ui.core.ListItem();
                oItemTemplate.bindProperty("key", "key");
                oItemTemplate.bindProperty("text", "value");
                dataTypeCombo.bindItems("/items", oItemTemplate);
                dataTypeCombo.bindProperty("selectedKey", "selection>/dataType");

                dataTypeCurrencyCell.addStyleClass("currencyBrowseButton");
                dataTypeCurrencyLabel.addStyleClass("labelFloat");
                var DataTypeRow;
                if (that.isDialog && !(that.element.calculationDefinition)) {
                    // DataType
                    DataTypeRow = new sap.ui.commons.layout.MatrixLayoutRow({

                    });
                    DataTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                        colSpan: 1
                    }).addContent(dataTypeCurrencyLabel));
                    DataTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                        colSpan: 1
                    }).addContent(dataTypeCurrencyCell));

                    topMatrixLayout.addRow(DataTypeRow);
                    //   topMatrixLayout.createRow(dataTypeCurrencyLabel, dataTypeCurrencyCell);

                }

                topMatrixLayout.createRow(generateCurrencyLabel, generateCurrencyCell);

                var uponFailureLabel = new sap.ui.commons.Label({
                    text: "Upon failure"
                });

                var uponFailureCombo = new sap.ui.commons.DropdownBox({
                    width: "100%",
                    enabled: false,
                    change: function(event) {
                        var selectedKey = this.getSelectedKey();
                        /*var attributes = {

                                          };*/
                        var errorHandling = {
                            constantValue: selectedKey
                        };
                        that.attributes.errorHandling = errorHandling;

                        if (!that.isDialog) {
                            var command = new commands.ChangeCurrencyPropertiesCommand(that.viewnode.name, that.element.name, that.attributes);
                            that._execute(command);
                            that.attributes = {};
                        }
                        /*else {
                                              that.commands.push(command);
                                          }*/
                    }
                }).addStyleClass("dummyTest9");
                uponFailureCombo.setModel(this.getErrorType());
                var oItemTemplate = new sap.ui.core.ListItem();
                oItemTemplate.bindProperty("key", "key");
                oItemTemplate.bindProperty("text", "value");
                uponFailureCombo.bindItems("/items", oItemTemplate);
                uponFailureCombo.bindProperty("selectedKey", "selection>/errorHandling");

                if (this.element.currencyConversion && that.element.currencyConversion.errorHandling) {
                    var currencyData = {
                        errorHandling: that.element.currencyConversion.errorHandling.constantValue
                    };
                    var currencyModel = new sap.ui.model.json.JSONModel();
                    // set the data for the model
                    currencyModel.setData(currencyData);
                    uponFailureCombo.setModel(currencyModel, "selection");
                }

                uponFailureLabel.addStyleClass("labelFloat");

                var uponFailureCell = new sap.ui.commons.layout.MatrixLayout({
                    columns: 1,
                    width: "96%"
                });
                if (this.element.currencyConversion && that.element.currencyConversion.outputUnitCurrencyElement) {
                    generateCurrencyCheck.setEnabled(true);
                    generateCurrencyCheck.setChecked(true);
                    generateCurrencyField.setEditable(true);
                    uponFailureCombo.setEnabled(true);
                } else if (enableDecimalShift.getChecked()) {
                    generateCurrencyCheck.setEnabled(true);
                    uponFailureCombo.setEnabled(true);
                }
                uponFailureCell.createRow(uponFailureCombo);

                topMatrixLayout.createRow(uponFailureLabel, uponFailureCell);

                setEnabled = function(enable) {
                    withRounding.setEnabled(enable);
                    schemaCurrencyField.setEnabled(enable);
                    topMatrixLayout_2.setEnabled(enable);
                    clientCurrencyCombo.setEnabled(enable);
                    clientCurrencyField.setEnabled(enable);
                    conversionMatrixLayout.setEnabled(enable);
                    sourceTypeCombo.setEnabled(enable);
                    sourceCurrencyField.setEnabled(enable);
                    targetTypeCombo.setEnabled(enable);
                    targetCurrencyField.setEnabled(enable);
                    exchangeTypeCombo.setEnabled(enable);
                    exchangeTypeField.setEnabled(enable);
                    exchangeRateCombo.setEnabled(enable);
                    exchangeRateField.setEnabled(enable);

                    conversionDateCombo.setEnabled(enable);
                    conversionDateField.setEnabled(enable);
                    oDatePicker1.setEnabled(enable);
                    // generateCurrencyField.setEnabled(enable);
                    //  generateCurrencyCheck.setEnabled(enable);
                    // uponFailureCombo.setEnabled(enable);
                    dataTypeCombo.setEnabled(enable);
                    lengthField.setEnabled(enable);
                    scaleField.setEnabled(enable);
                    //	exchangeViaColumnRadioBtn.setEnabled(enable);
                    //	exchangeViaCCTablesRadioBtn.setEnabled(enable);
                    if (enable && enableDecimalShift.getChecked()) {
                        decimalshiftBack.setEnabled(enable);
                    } else {
                        decimalshiftBack.setEnabled(false);
                    }

                };

                enableShift = function(enable) {
                    if (enableDecimalShift.getChecked() || enableConversionCheck.getChecked()) {
                        generateCurrencyCheck.setEnabled(true);
                        uponFailureCombo.setEnabled(true);
                    } else {
                        generateCurrencyCheck.setEnabled(false);
                        uponFailureCombo.setEnabled(false);
                    }

                };

                setModel = function() {

                    var sourceData = {};
                    var selectionData = {};
                    /*   if (that.element.inlineType.semanticType && that.element.inlineType.semanticType === "amount") {
                                        sourceData.unitCurrencyElement = that.element.fixedCurrency;
                                   }*/
                    if (that.element.fixedCurrency) {

                        sourceData.unitCurrencyElement = that.element.fixedCurrency;
                        selectionData.currencyTypeIcon = resourceLoader.getImagePath("fixed-currency.png");
                        selectionData.displayCurrency = "fixed";
                    } else if (that.element.unitCurrencyElement) {
                        sourceData.unitCurrencyElement = that.element.unitCurrencyElement.name;
                        selectionData.currencyTypeIcon = resourceLoader.getImagePath("Column.png");
                        selectionData.displayCurrency = "column";
                    } else if (that.element.currencyConversion) {
                        selectionData.currencyTypeIcon = resourceLoader.getImagePath("Column.png");
                    } else {
                        selectionData.currencyTypeIcon = resourceLoader.getImagePath("fixed-currency.png");
                    }

                    if (that.element.currencyConversion) {
                        if (that.element.currencyConversion.sourceCurrency) {
                            if (that.element.currencyConversion.sourceCurrency.constantValue) {
                                sourceData.sourceCurrency = that.element.currencyConversion.sourceCurrency.constantValue;
                                selectionData.sourceCurrency = "fixed";
                                selectionData.sourceCurrencyIcon = resourceLoader.getImagePath("fixed-currency.png");

                            } else if (that.element.currencyConversion.sourceCurrency.element) {
                                sourceData.sourceCurrency = that.element.currencyConversion.sourceCurrency.element.name;
                                selectionData.sourceCurrency = "column";
                                /*  var icon = CalcViewEditorUtil.getIconPath({
                                                            icon:"Column.png",
                                                            object:that.element.currencyConversion.sourceCurrency.element,
                                                            viewNode:that.viewnode
                                                            //columnView:that.element.$$model.columnView
                                                        });
                                                        
                                                        selectionData.sourceCurrencyIcon = resourceLoader.getImagePath(icon);*/
                                selectionData.sourceCurrencyIcon = resourceLoader.getImagePath("Column.png");
                            } else if (that.element.currencyConversion.sourceCurrency.parameter) {
                                sourceData.sourceCurrency = that.element.currencyConversion.sourceCurrency.parameter.name;
                                selectionData.sourceCurrency = "input_parameter";
                                selectionData.sourceCurrencyIcon = resourceLoader.getImagePath("Parameter.png");
                            } else {
                                selectionData.sourceCurrencyIcon = resourceLoader.getImagePath("fixed-currency.png");
                            }
                        } else {
                            selectionData.sourceCurrencyIcon = resourceLoader.getImagePath("fixed-currency.png");
                        }

                        if (that.element.currencyConversion.targetCurrency) {
                            if (that.element.currencyConversion.targetCurrency.constantValue) {
                                sourceData.targetCurrency = that.element.currencyConversion.targetCurrency.constantValue;
                                selectionData.targetCurrency = "fixed";
                                selectionData.targetCurrencyIcon = resourceLoader.getImagePath("fixed-currency.png");
                            } else if (that.element.currencyConversion.targetCurrency.element) {
                                sourceData.targetCurrency = that.element.currencyConversion.targetCurrency.element.name;
                                selectionData.targetCurrency = "column";
                                /*  var icon = CalcViewEditorUtil.getIconPath({
                                                            icon:"Column.png",
                                                            object:that.element.currencyConversion.targetCurrency.element,
                                                               viewNode:that.viewnode
                                                        });
                                                        selectionData.targetCurrencyIcon = resourceLoader.getImagePath(icon);*/
                                selectionData.targetCurrencyIcon = resourceLoader.getImagePath("Column.png");

                            } else if (that.element.currencyConversion.targetCurrency.parameter) {
                                sourceData.targetCurrency = that.element.currencyConversion.targetCurrency.parameter.name;
                                selectionData.targetCurrency = "input_parameter";
                                selectionData.targetCurrencyIcon = resourceLoader.getImagePath("Parameter.png");
                            } else {
                                selectionData.targetCurrencyIcon = resourceLoader.getImagePath("fixed-currency.png");
                            }
                        } else {
                            selectionData.targetCurrencyIcon = resourceLoader.getImagePath("fixed-currency.png");
                        }

                        if (that.element.currencyConversion.client) {
                            if (that.element.currencyConversion.client.constantValue) {
                                if (that.element.currencyConversion.client.constantValue === "$$client$$") {
                                    sourceData.client = "Session client";
                                } else {
                                    sourceData.client = that.element.currencyConversion.client.constantValue;
                                }
                                selectionData.client = "fixed";
                                selectionData.clientIcon = resourceLoader.getImagePath("fixed-currency.png");
                            } else if (that.element.currencyConversion.client.element) {
                                sourceData.client = that.element.currencyConversion.client.element.name;
                                selectionData.client = "column";
                                /*   var icon = CalcViewEditorUtil.getIconPath({
                                                            icon:"Column.png",
                                                            object:that.element.currencyConversion.client.element,
                                                            viewNode:that.viewnode
                                                        });
                                                        selectionData.clientIcon = resourceLoader.getImagePath(icon);*/
                                selectionData.clientIcon = resourceLoader.getImagePath("Column.png");
                            } else if (that.element.currencyConversion.client.parameter) {
                                sourceData.client = that.element.currencyConversion.client.parameter.name;
                                selectionData.client = "input_parameter";
                                selectionData.clientIcon = resourceLoader.getImagePath("Parameter.png");
                            } else {
                                selectionData.clientIcon = resourceLoader.getImagePath("fixed-currency.png");
                            }
                        } else {
                            selectionData.clientIcon = resourceLoader.getImagePath("fixed-currency.png");
                        }
                        if (that.element.currencyConversion.exchangeRateType) {
                            if (that.element.currencyConversion.exchangeRateType.constantValue) {
                                sourceData.exchangeRateType = that.element.currencyConversion.exchangeRateType.constantValue;
                                selectionData.exchangeRateType = "fixed";
                                selectionData.exchangeRateTypeIcon = resourceLoader.getImagePath("fixed-currency.png");
                            } else if (that.element.currencyConversion.exchangeRateType.element) {
                                sourceData.exchangeRateType = that.element.currencyConversion.exchangeRateType.element.name;
                                selectionData.exchangeRateType = "column";
                                /*  var icon = CalcViewEditorUtil.getIconPath({
                                                            icon:"Column.png",
                                                            object:that.element.currencyConversion.exchangeRateType.element,
                                                             viewNode:that.viewnode
                                                        });
                                                        selectionData.exchangeRateTypeIcon = resourceLoader.getImagePath(icon);*/
                                selectionData.exchangeRateTypeIcon = resourceLoader.getImagePath("Column.png");
                            } else if (that.element.currencyConversion.exchangeRateType.parameter) {
                                sourceData.exchangeRateType = that.element.currencyConversion.exchangeRateType.parameter.name;
                                selectionData.exchangeRateType = "input_parameter";
                                selectionData.exchangeRateTypeIcon = resourceLoader.getImagePath("Parameter.png");
                            } else {
                                selectionData.exchangeRateTypeIcon = resourceLoader.getImagePath("fixed-currency.png");
                            }
                        } else {
                            selectionData.exchangeRateTypeIcon = resourceLoader.getImagePath("fixed-currency.png");
                        }
                        if (that.element.currencyConversion.referenceDate) {
                            if (that.element.currencyConversion.referenceDate.constantValue) {
                                sourceData.referenceDate = that.element.currencyConversion.referenceDate.constantValue;
                                selectionData.referenceDate = "fixed";
                                selectionData.referenceDateIcon = resourceLoader.getImagePath("fixed-currency.png");
                            } else if (that.element.currencyConversion.referenceDate.element) {
                                sourceData.referenceDate = that.element.currencyConversion.referenceDate.element.name;
                                selectionData.referenceDate = "column";
                                /*   var icon = CalcViewEditorUtil.getIconPath({
                                                            icon:"Column.png",
                                                            object:that.element.currencyConversion.referenceDate.element,
                                                             viewNode:that.viewnode
                                                        });
                                                        selectionData.referenceDateIcon = resourceLoader.getImagePath(icon);*/
                                selectionData.referenceDateIcon = resourceLoader.getImagePath("Column.png");
                            } else if (that.element.currencyConversion.referenceDate.parameter) {
                                sourceData.referenceDate = that.element.currencyConversion.referenceDate.parameter.name;
                                selectionData.referenceDate = "input_parameter";
                                selectionData.referenceDateIcon = resourceLoader.getImagePath("Parameter.png");
                            } else {
                                selectionData.referenceDateIcon = resourceLoader.getImagePath("fixed-currency.png");
                            }
                        } else {
                            selectionData.referenceDateIcon = resourceLoader.getImagePath("fixed-currency.png");
                        }

                        if (that.element.currencyConversion.schema && that.element.currencyConversion.schema.schemaName) {
                            sourceData.schema = that.element.currencyConversion.schema.schemaName;

                        }

                        if (that.element.currencyConversion.outputUnitCurrencyElement) {
                            sourceData.outputUnitCurrencyElement = that.element.currencyConversion.outputUnitCurrencyElement.name;
                        } else if (generateCurrencyCheck.getChecked()) {
                            sourceData.outputUnitCurrencyElement = that.element.name + "_CURRENCY";
                        }
                        if (that.element.currencyConversion.outputDataType) {

                            sourceData.dataTypeLength = that.element.currencyConversion.outputDataType.length === undefined ? that.element.inlineType.length :
                                that.element.currencyConversion.outputDataType.length;
                            sourceData.dataTypeScale = that.element.currencyConversion.outputDataType.scale === undefined ? that.element.inlineType.scale : that
                                .element.currencyConversion.outputDataType.scale;
                            selectionData.dataType = that.element.currencyConversion.outputDataType.primitiveType === undefined ? that.element.inlineType.primitiveType :
                                that.element.currencyConversion.outputDataType.primitiveType;
                        } else {

                            sourceData.dataTypeLength = that.element.inlineType.length;
                            sourceData.dataTypeScale = that.element.inlineType.scale;
                            selectionData.dataType = that.element.inlineType.primitiveType;
                        }

                        if (that.element.currencyConversion.exchangeRateElement) {
                            sourceData.exchangeRateElement = that.element.currencyConversion.exchangeRateElement.name;
                        }

                    } else {
                        selectionData.exchangeRateTypeIcon = resourceLoader.getImagePath("fixed-currency.png");
                        selectionData.referenceDateIcon = resourceLoader.getImagePath("fixed-currency.png");
                        selectionData.clientIcon = resourceLoader.getImagePath("fixed-currency.png");
                        selectionData.targetCurrencyIcon = resourceLoader.getImagePath("fixed-currency.png");
                        selectionData.sourceCurrencyIcon = resourceLoader.getImagePath("fixed-currency.png");

                        sourceData.sourceCurrency = "";
                        selectionData.sourceCurrency = "fixed";
                        sourceData.targetCurrency = "";
                        selectionData.targetCurrency = "fixed";
                        sourceData.client = "";
                        selectionData.client = "fixed";
                        sourceData.exchangeRateType = "";
                        selectionData.exchangeRateType = "fixed";
                        if (that.viewnode.$$model.columnView && that.viewnode.$$model.columnView.defaultSchema) {
                            sourceData.schema = that.viewnode.$$model.columnView.defaultSchema;
                        } else {
                            sourceData.schema = "";
                        }

                        if (generateCurrencyCheck.getChecked()) {
                            sourceData.outputUnitCurrencyElement = that.element.name + "_CURRENCY";
                        } else {
                            sourceData.outputUnitCurrencyElement = "";
                        }
                        sourceData.referenceDate = "";
                        selectionData.referenceDate = "fixed";

                        sourceData.dataTypeLength = that.element.inlineType.length;
                        sourceData.dataTypeScale = that.element.inlineType.scale;
                        //  dataTypeCombo.setValue(that.element.inlineType.primitiveType);
                        selectionData.dataType = that.element.inlineType.primitiveType;
                    }

                    /*if (currencyTypeCombo.getValue() === "Column") {
						selectionData.currencyTypeIcon = resourceLoader.getImagePath("Column.png");
					} else {
						selectionData.currencyTypeIcon = resourceLoader.getImagePath("fixed-currency.png");
					}*/

                    var sourceModel = new sap.ui.model.json.JSONModel();
                    // set the data for the model
                    sourceModel.setData(sourceData);
                    oLayout.setModel(sourceModel);

                    var oModel = new sap.ui.model.json.JSONModel();
                    // set the data for the model
                    oModel.setData(selectionData);

                    oLayout.setModel(oModel, "selection");
                    sourceModel.updateBindings();
                    oModel.updateBindings();
                };
                setModel();

                if (hasConversion()) {
                    enableConversionCheck.setChecked(true);
                    setEnabled(true);
                } else {
                    enableConversionCheck.setChecked(false);
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
            getCommands: function() {

                if (!jQuery.isEmptyObject(this.elementAttribute)) {
                    var command = new commands.ChangeElementPropertiesCommand(this.viewnode.name, this.element.name, this.elementAttribute);
                    this.commands.push(command);
                }
                if (!jQuery.isEmptyObject(this.attributes)) {
                    var command = new commands.ChangeCurrencyPropertiesCommand(this.viewnode.name, this.element.name, this.attributes);
                    this.commands.push(command);
                }

                return this.commands;
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
            getHeaderLayoutNew: function(preName, curName, button) {
                var headMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2
                });
                headMatrixLayout.addStyleClass("currencyPropertyHeader");

                var preHeaderName = new sap.ui.commons.Label({
                    text: preName,
                    design: sap.ui.commons.LabelDesign.Bold
                });
                preHeaderName.addStyleClass("currencyHeaderLabel");
                var headerName = new sap.ui.commons.Label({
                    text: ">" + curName,
                    design: sap.ui.commons.LabelDesign.Bold
                });
                var cell = new sap.ui.commons.layout.MatrixLayoutCell();
                cell.addContent(preHeaderName);
                cell.addContent(headerName);
                button.addStyleClass("currencyHeaderBack");
                headMatrixLayout.createRow(cell, button);

                return headMatrixLayout;
            },

            getSemanticType: function() {
                var semanticTypeList = {
                    items: [{
                        key: "Amount",
                        value: "Amount with Currency Code"
                    }, {
                        key: "Quantity",
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
            },
            getDataType: function() {
                var errorTypeList = {
                    items: [{
                        key: "",
                        value: ""
                    }, {
                        key: "DECIMAL",
                        value: "DECIMAL"
                    }, {
                        key: "DOUBLE",
                        value: "DOUBLE"

                    }, {
                        key: "REAL",
                        value: "REAL"

                    }, {
                        key: "SMALLDECIMAL",
                        value: "SMALL DECIMAL"

                    }]
                };
                var errorTypeModel = new sap.ui.model.json.JSONModel();
                errorTypeModel.setData(errorTypeList);
                return errorTypeModel;
            }

        };

        return CurrencyConversionDetails;

    });
