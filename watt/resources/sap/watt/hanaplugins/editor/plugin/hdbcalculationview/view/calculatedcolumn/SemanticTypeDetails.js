/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "./CurrencyConversionDetails",
        "./UnitConversionDetails",
        "../dialogs/ValueHelpDialog",
         "../../viewmodel/model"
    ],
	function(ResourceLoader, modelbase, commands, CalcViewEditorUtil, CurrencyConversionDetails, UnitConversionDetails, ValueHelpDialog, model) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		/**
		 * @class
		 */
		var SemanticTypeDetails = function(parameters) {
			this._undoManager = parameters.undoManager;
			this.viewNode = parameters.viewNode;
			this.element = parameters.element;
			this.context = parameters.context;
			this.callBack = parameters.callBack;
			this.isDialog = parameters.isDialog;
			this.commands = [];
			this.currencyConversionDetails;
			this.unitConversionDetails;
		};

		SemanticTypeDetails.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);
			},

			close: function() {

			},

			getContent: function() {
				var that = this;
				var currencyContent;
				var unitContent;
				var oLayout = new sap.ui.layout.VerticalLayout({
					width: "100%"

				});

				var topMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					columns: 2,
					layoutFixed: false,
					width: "100%",
					widths: ["29.5%", "70.5%"]
				});

				topMatrixLayout.addStyleClass("currencyHeader");

				var dataTypeLabel = new sap.ui.commons.Label({
					text: "Semantic Type"
				});

				var comboChange = function(oEvent) {
					var length = oLayout.getContent().length;
					var removeContent;
					if (length > 1) {
						removeContent = oLayout.getContent()[length - 1];
						oLayout.removeContent(removeContent);
					}

					if (this.getSelectedKey() === model.SemanticType.QUANTITY) {
						if (that.element.aggregationBehavior === "none") {
							oLayout.addContent(that.getAttributeUnitCurrency());
						} else {
							oLayout.addContent(unitContent);
						}
					} else if (this.getSelectedKey() === model.SemanticType.AMOUNT) {
						if (that.element.aggregationBehavior === "none") {
							oLayout.addContent(that.getAttributeCurrency());
						} else {
							oLayout.addContent(currencyContent);
						}
					}
					var attributes = {
						objectAttributes: {},
						typeAttributes: {}
					};
					attributes.typeAttributes.semanticType = this.getSelectedKey();
					var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
					if (!that.isDialog) {
						that._execute(command);
					} else {
						that.commands.push(command);
					}
				};

				var dataTypeCombo = new sap.ui.commons.DropdownBox({
					width: "100%",
					change: comboChange
				}).addStyleClass("semanticTypeCombo");

				if (this.element.aggregationBehavior === "none") {
					dataTypeCombo.setModel(this.getSemanticTypeForAttribute());
				} else {
					dataTypeCombo.setModel(this.getSemanticTypeForMeasure());
				}
				var oItemTemplate = new sap.ui.core.ListItem();
				oItemTemplate.bindProperty("key", "key");
				oItemTemplate.bindProperty("text", "value");
				dataTypeCombo.bindItems("/items", oItemTemplate);

				var data = {};
				if (that.element.inlineType && that.element.inlineType.semanticType) {
					data.semanticType = that.element.inlineType.semanticType;
				} else {
					data.semanticType = "";
				}
				var oModel = new sap.ui.model.json.JSONModel(); // create JSON model instance
				oModel.setData(data, "valueModel"); // set the data for the model

				dataTypeCombo.setModel(oModel, "valueModel");

				dataTypeCombo.bindProperty("selectedKey", "valueModel>/semanticType")

				dataTypeLabel.addStyleClass("labelFloat");

				var dataTypeCell = new sap.ui.commons.layout.MatrixLayout({
					columns: 1,
					width: "96%"

				});
				dataTypeCell.createRow(dataTypeCombo);

				dataTypeCell.addStyleClass("currencySemanticCombo");

				topMatrixLayout.createRow(dataTypeLabel, dataTypeCell);

				//   oLayout.addContent(toolBar);
				var backButton = new sap.ui.commons.Button({
					icon: "sap-icon://navigation-left-arrow",
					text: resourceLoader.getText("tol_back"),
					tooltip: resourceLoader.getText("tol_back"),
					press: function(oevent) {
						if (that.callBack) {
							that.callBack();
						}
					}
				}).addStyleClass("backButton");

				var toolbarMatrixlayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%"
				});
				toolbarMatrixlayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
					content: [new sap.ui.commons.Label({
						text: "Semantics(" + that.element.name + ")",
						design: sap.ui.commons.LabelDesign.Bold
					})],
					hAlign: sap.ui.commons.layout.HAlign.Center,
					vAlign: sap.ui.commons.layout.VAlign.Center
				}).addStyleClass("detailsHeaderStyle"));
				var headerContent;
				if (!that.isDialog) {
					// oLayout.addContent(toolbarMatrixlayout);
					headerContent = this.getHeaderLayoutNew("Semantics(" + that.element.name + ")", backButton);

				}
				oLayout.addContent(topMatrixLayout);
				// oLayout.addContent(this.getHeaderLayout("CONVERSION"));

				that.currencyConversionDetails = new CurrencyConversionDetails({
					undoManager: that._undoManager,
					context: that.context,
					viewnode: that.viewNode,
					element: that.element,
					isDialog: that.isDialog

				});

				that.unitConversionDetails = new UnitConversionDetails({
					undoManager: that._undoManager,
					context: that.context,
					viewnode: that.viewNode,
					element: that.element,
					isDialog: that.isDialog

				});
				currencyContent = that.currencyConversionDetails.getContent();
				unitContent = that.unitConversionDetails.getContent();
				//oLayout.addContent(currencyContent);

				that.getAttributeCurrency();
				if (dataTypeCombo.getSelectedKey() === model.SemanticType.QUANTITY) {
					if (that.element.aggregationBehavior === "none") {
						oLayout.addContent(that.getAttributeUnitCurrency());
					} else {
						oLayout.addContent(unitContent);
					}
				} else if (dataTypeCombo.getSelectedKey() === model.SemanticType.AMOUNT) {
					if (that.element.aggregationBehavior === "none") {
						oLayout.addContent(that.getAttributeCurrency());
					} else {
						oLayout.addContent(currencyContent);
					}
				}

				if (headerContent) {
					var mainLayout = new sap.ui.layout.VerticalLayout({
						width: "100%"

					});
					mainLayout.addContent(headerContent);
					mainLayout.addContent(oLayout);
					mainLayout.addStyleClass("detailsMainDiv");
					return mainLayout;
				}

				return oLayout;
			},
			executeCommands: function() {
				var that = this;
				this.commands.forEach(function(command) {

					that._execute(command);
				});
				var unitCommands = that.unitConversionDetails.getCommands();
				if (unitCommands && unitCommands.length > 0) {
					unitCommands.forEach(function(command) {

						that._execute(command);
					});
				}
				var currencyCommands = that.currencyConversionDetails.getCommands();
				if (currencyCommands && currencyCommands.length > 0) {
					currencyCommands.forEach(function(command) {

						that._execute(command);
					});
				}
			},

			getHeaderLayout: function(name) {
				var headMatrixLayout = new sap.ui.commons.layout.MatrixLayout();
				headMatrixLayout.addStyleClass("detailsHeaderStyle");
				var headerName = new sap.ui.commons.Label({
					text: name,
					design: sap.ui.commons.LabelDesign.Bold
				});

				headerName.addStyleClass("currencyHeaderLabel");

				headMatrixLayout.createRow(headerName);

				return headMatrixLayout;
			},
			getHeaderLayoutNew: function(preName, button) {
				var headMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					columns: 2,
					widths: ["40%", "60%"]
				});
				// headMatrixLayout.addStyleClass("currencyPropertyHeader");

				var preHeaderName = new sap.ui.commons.Label({
					text: preName,
					design: sap.ui.commons.LabelDesign.Bold,
					width: "100%"
				});
				//preHeaderName.addStyleClass("currencyHeaderLabel");

				headMatrixLayout.createRow(button, preHeaderName);

				return headMatrixLayout;
			},
			getAttributeCurrency: function() {
				var that = this;
				var topMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					columns: 2,
					layoutFixed: false,
					width: "100%",
					widths: ["29.5%", "70.5%"]
				});

				topMatrixLayout.addStyleClass("currencyHeader");

				var currencyLabel = new sap.ui.commons.Label({
					text: "Currency"
				});

				var currencyField = new sap.ui.commons.DropdownBox({
					width: "96%"
				});

				currencyField.attachChange(function(event) {
					var value = event.getParameter("newValue");
					var unitElement;
					that.viewNode.elements.foreach(function(element) {
						if (element.name === value) {
							unitElement = element;
						}

					});
					var attributes = {

					};
					attributes.unitCurrencyElement = unitElement;
					var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
					if (!that.isDialog) {
						that._execute(command);
					} else {
						that.commands.push(command);
					}

				});

				if (that.element.unitCurrencyElement) {
					var currencyData = {
						unitCurrencyElement: that.element.unitCurrencyElement.name
					};
					var oModel = new sap.ui.model.json.JSONModel(); // create JSON model instance
					oModel.setData(currencyData, "valueModel"); // set the data for the model
					currencyField.setModel(oModel, "valueModel");
					currencyField.bindProperty("selectedKey", "valueModel>/unitCurrencyElement");

				}

				currencyField.setModel(this.getElementList(this.viewNode.elements));
				var oItemTemplate = new sap.ui.core.ListItem();
				oItemTemplate.bindProperty("key", "key");
				oItemTemplate.bindProperty("text", "value");
				currencyField.bindItems("/items", oItemTemplate);

				currencyField.addStyleClass("currencyText");

				currencyLabel.addStyleClass("labelFloat");
				var currencyField = new sap.ui.commons.TextField({
					editable: false,
					value: "{/unitCurrencyElement}",
					width: "100%",
					change: function(event) {

					}
				});

				currencyField.addStyleClass("currencyText");
				var currencyButton = new sap.ui.commons.Button({
					icon: "sap-icon://value-help",
					press: function() {
						var fnCallBack = function(result) {
							var unitElement;

							if (result.nodetype === "element") {

								if (that.viewNode && that.viewNode.isStarJoin()) {
									that.viewNode.inputs.foreach(function(ip) {
										if (ip.selectAll) {
											ip.getSource().elements.foreach(function(element) {
												if (element.name === result.name) {
													unitElement = element;
												}
											});
										}
									});
								} else {
									that.viewNode.elements.foreach(function(element) {
										if (element.name === result.name) {
											unitElement = element;
										}
									});
								}
							}

							var attributes = {

							};
							attributes.unitCurrencyElement = {
								element: unitElement
							};
							var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
							if (!that.isDialog) {
								that._execute(command);
							} else {
								that.commands.push(command);
							}
							currencyField.setValue(result.name);
						};

						var valueHelpDialog = new ValueHelpDialog({
							undoManager: that._undoManager,
							fnCallBack: fnCallBack,
							context: that.context,
							selectedItem: "column",
							viewnode: that.viewNode,
							title: "Value Help-Currency"

						});

						valueHelpDialog.openDialog();
					}
				});

				if (that.element.unitCurrencyElement) {
					var currencyData = {
						unitCurrencyElement: that.element.unitCurrencyElement.name
					};
					var currencyModel = new sap.ui.model.json.JSONModel();
					// set the data for the model
					currencyModel.setData(currencyData);
					currencyField.setModel(currencyModel);
				}
				var cell = new sap.ui.commons.layout.MatrixLayout({
					columns: 2,
					widths: ["88%", "12%"],
					width: "100%"

				});
				cell.createRow(currencyField, currencyButton);

				topMatrixLayout.createRow(currencyLabel, cell);

				return topMatrixLayout;
			},
			getAttributeUnitCurrency: function() {
				var that = this;
				var topMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					columns: 2,
					layoutFixed: false,
					width: "100%",
					widths: ["29.5%", "70.5%"]
				});

				topMatrixLayout.addStyleClass("currencyHeader");

				var currencyLabel = new sap.ui.commons.Label({
					text: "Unit"
				});

				var currencyField = new sap.ui.commons.DropdownBox({
					width: "96%"

				});

				currencyField.attachChange(function(event) {
					var value = event.getParameter("newValue");
					var unitElement;
					that.viewNode.elements.foreach(function(element) {
						if (element.name === value) {
							unitElement = element;
						}

					});
					var attributes = {

					};
					attributes.unitCurrencyElement = unitElement;
					var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
					if (!that.isDialog) {
						that._execute(command);
					} else {
						that.commands.push(command);
					}

					/*  var attributes = {
                            objectAttributes: {},
                            typeAttributes: {}
                        };
                        attributes.objectAttributes.keep = value;

                        var command = new commands.ChangeElementPropertiesCommand(that._viewNode.name, that._element.name, attributes);
                        that._execute(command);*/
				});

				if (that.element.unitCurrencyElement) {
					var currencyData = {
						unitCurrencyElement: that.element.unitCurrencyElement.name
					};
					var oModel = new sap.ui.model.json.JSONModel(); // create JSON model instance
					oModel.setData(currencyData, "valueModel"); // set the data for the model
					currencyField.setModel(oModel, "valueModel");
					currencyField.bindProperty("selectedKey", "valueModel>/unitCurrencyElement");

				}

				currencyField.setModel(this.getElementList(this.viewNode.elements));
				var oItemTemplate = new sap.ui.core.ListItem();
				oItemTemplate.bindProperty("key", "key");
				oItemTemplate.bindProperty("text", "value");
				currencyField.bindItems("/items", oItemTemplate);
				currencyField.addStyleClass("currencyText");

				currencyLabel.addStyleClass("labelFloat");
				var currencyField = new sap.ui.commons.TextField({
					editable: false,
					value: "{/unitCurrencyElement}",
					width: "100%"

				});

				currencyField.addStyleClass("currencyText");
				var currencyButton = new sap.ui.commons.Button({
					icon: "sap-icon://value-help",
					press: function() {
						var fnCallBack = function(result) {
							var unitElement;
							if (result.nodetype === "element") {

								if (that.viewNode && that.viewNode.isStarJoin()) {
									that.viewNode.inputs.foreach(function(ip) {
										if (ip.selectAll) {
											ip.getSource().elements.foreach(function(element) {
												if (element.name === result.name) {
													unitElement = element;
												}
											});
										}
									});
								} else {
									that.viewNode.elements.foreach(function(element) {
										if (element.name === result.name) {
											unitElement = element;
										}
									});
								}
							}

							var attributes = {

							};
							attributes.unitCurrencyElement = {
								element: unitElement
							};
							var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
							if (!that.isDialog) {
								that._execute(command);
							} else {
								that.commands.push(command);
							}
							currencyField.setValue(result.name);
						};

						var valueHelpDialog = new ValueHelpDialog({
							undoManager: that._undoManager,
							fnCallBack: fnCallBack,
							context: that.context,
							selectedItem: "column",
							viewnode: that.viewNode,
							title: "Value Help-Currency"

						});

						valueHelpDialog.openDialog();
					}
				});

				if (that.element.unitCurrencyElement) {
					var currencyData = {
						unitCurrencyElement: that.element.unitCurrencyElement.name
					};
					var currencyModel = new sap.ui.model.json.JSONModel();
					// set the data for the model
					currencyModel.setData(currencyData);
					currencyField.setModel(currencyModel);
				}
				var cell = new sap.ui.commons.layout.MatrixLayout({
					columns: 2,
					widths: ["88%", "12%"],
					width: "100%"

				});
				cell.createRow(currencyField, currencyButton);

				topMatrixLayout.createRow(currencyLabel, cell);

				return topMatrixLayout;
			},

			getSemanticTypeForAttribute: function() {
				var semanticTypeList = {
					items: [{
						key: model.SemanticType.EMPTY,
						value: ""
                    }, {
						key: model.SemanticType.AMOUNT,
						value: "Amount with Currency Code"
                    }, {
						key: model.SemanticType.QUANTITY,
						value: "Quantity with Unit Of Measure"

                    }, {
						key: model.SemanticType.CURRENCY_CODE,
						value: "Currency Code"

                    }, {
						key: model.SemanticType.UNIT_OF_MEASURE,
						value: "Unit Of Measure"

                    }, {
						key: model.SemanticType.DATE,
						value: "Date"

                    }, {
						key: model.SemanticType.DATE_BUSINESS_DATE_FROM,
						value: "Date-Business Date From"

                    }, {
						key: model.SemanticType.DATE_BUSINESS_DATE_TO,
						value: "Date-Business Date To"

                    }, {
						key: model.SemanticType.GEO_LOCATION_LONGITUDE,
						value: "Geo Location-Longitude"

                    }, {
						key: model.SemanticType.GEO_LOCATION_LATITUDE,
						value: "Geo Location-Latitude"

                    }, {
						key: model.SemanticType.GEO_LOCATION_CARTO_ID,
						value: "Geo Location-CartoId"

                    }, {
						key: model.SemanticType.GEO_LOCATION_NORMALIZED_NAME,
						value: "Geo Location-Normalized Name"

                    }]
				};
				var semanticTypeModel = new sap.ui.model.json.JSONModel();
				semanticTypeModel.setData(semanticTypeList);
				return semanticTypeModel;
			},
			getSemanticTypeForMeasure: function() {
				var semanticTypeList = {
					items: [{
					key: model.SemanticType.EMPTY,
						value: ""
                    }, {
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
			getElementList: function(elements) {
				var labelColumnsList = {};
				var items = [];
				items.push({
					key: "",
					value: ""
				});
				elements.foreach(function(element) {
					items.push({
						key: element.name,
						value: element.name
					});

				});
				labelColumnsList["items"] = items;
				var labelColumnnModel = new sap.ui.model.json.JSONModel();
				labelColumnnModel.setData(labelColumnsList);
				return labelColumnnModel;

			}

		};

		return SemanticTypeDetails;

	});
