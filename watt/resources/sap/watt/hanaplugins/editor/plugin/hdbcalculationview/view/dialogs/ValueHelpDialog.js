/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "../../viewmodel/model"

    ],
	function(ResourceLoader, modelbase, commands, CalcViewEditorUtil, model) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		/**
		 * @class
		 */
		var CurrencyDialog = function(parameters) {
			this._title = parameters.title;
			this._fnCallBack = parameters.fnCallBack;
			this._model = parameters.model;
			this._viewnode = parameters.viewnode;
			this._context = parameters.context;
			this._selectedItem = parameters.selectedItem;
			this._undoManager = parameters.undoManager;
			this._isUnit = parameters.isUnit;
			this._isExchangeType = parameters.isExchangeType;
			this._isClient = parameters.isClient;
			this._clientValue = parameters.clientValue;
			this._schema = parameters.schema;
			this._isCurrencyCodeEnabled = parameters.currencyCode;
			this._isUnitEnabled = parameters.unitCode;
			this._element = parameters.selectedElement;
			this._outputUnitCurrencyElement = parameters.outputUnitCurrencyElement;
			this._modal = parameters.modal;
			this._sessionClient;
			this._selectedElement;
		};

		CurrencyDialog.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);
			},

			close: function() {

			},

			openDialog: function() {
				var that = this;
				var yesButton;
				var modal = false;
				if (this._modal === true) {
					modal = true;
				}
				if (sap.ui.getCore().byId("IDEvalueHelpDialog")) {
					sap.ui.getCore().byId("IDEvalueHelpDialog").destroy();
				}
				var oDialog1 = new sap.ui.commons.Dialog("IDEvalueHelpDialog", {
					//modal: modal
					modal: true
				});
				//Set the title
				oDialog1.setTitle(this._title);
				oDialog1.addStyleClass("calcViewTableInDialog");
				oDialog1.attachBrowserEvent("keydown", function(evt) {
					if (evt.keyCode == 13) {
						if (yesButton.getEnabled()) {
							okPressed();
						}
					}
				});

				if (this._selectedItem !== "fixed") {
					this._isClient = false;
				}
				var oLabel = new sap.ui.commons.Label();
				oLabel.setText("Currency");
				//oDialog1.addContent(oLabel);

				var mLayout = new sap.ui.commons.layout.MatrixLayout({
					layoutFixed: false,
					columns: 2,
				});

				var comboLabel = new sap.ui.commons.Label();
				comboLabel.setText("Type:");

				var dataTypeCombo = new sap.ui.commons.DropdownBox({
					width: "100%",
					change: function(event) {

					}
				});

				var oLayout = new sap.ui.layout.VerticalLayout();

				var oTextView = new sap.ui.commons.TextView({
					text: 'Currency',
					wrapping: false,
					design: sap.ui.commons.TextViewDesign.H2
				});

				var oTextView_1 = new sap.ui.commons.TextView({
					text: 'Select the fixed value that specifies the required currency',
					wrapping: false
				});

				// oLayout.addContent(oTextView);

				//oLayout.addContent(oTextView_1);

				var oTable2 = new sap.ui.table.Table({
					visibleRowCount: 9,
					firstVisibleRow: 9,
					selectionMode: sap.ui.table.SelectionMode.Single,
					selectionBehavior: sap.ui.table.SelectionBehavior.Row,
					rowSelectionChange: function() {
						var index = oTable2.getSelectedIndices();
						if (index.length > 0) {
							yesButton.setEnabled(true);
						} else {
							yesButton.setEnabled(false);
						}
					}
				});
				oTable2.setBusy(true);
				var tableColumnName;
				if (that._isUnit) {
					tableColumnName = "Unit";
				} else {
					tableColumnName = "Currency";
				}
				if (this._isExchangeType) {
					tableColumnName = "Exchange";
				}

				//Define the columns and the control templates to be used
				oTable2.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: tableColumnName
					}),
					template: new sap.ui.commons.Label().bindProperty("text", "currency"),
					sortProperty: "currency",
					filterProperty: "currency",
					width: "150px"
				}));

				oTable2.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: "Description"
					}),
					template: new sap.ui.commons.Label().bindProperty("text", "decription"),
					sortProperty: "decription",
					filterProperty: "decription",
					width: "200px"
				}));

				if (that._viewnode) {
					var columnView = that._viewnode.$getContainer();
					var elements = columnView.getDefaultNode().elements;

					var columnModel = {
						"RootNode": {
							"name": "root",
							"childNodes": [{
								"name": "Columns",
								"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/folder.png",
								"childNodes": []
                            }]
						}
					};

					if (that._isExchangeType===undefined) {
						columnModel.RootNode.childNodes.push({
							"name": "Calculated Columns",
							"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/folder.png",
							"childNodes": []
						});
					}
					var parameterModel = {
						"RootNode": {
							"name": "root",
							"childNodes": [{
								"name": "Input Parameter",
								"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/folder.png",
								"childNodes": []
                            }]
						}
					};

					elements.foreach(function(element) {
						//checking the proxy elements and sking for from value help dialog
						if (!CalcViewEditorUtil.isBasedOnElementProxy({
							object: element,
							viewNode: that._viewnode
						})) {
							if (!element.calculationDefinition && element.aggregationBehavior && element.aggregationBehavior === "none") {
								var elementModel = {
									name: element.name,
									iconpath: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Attribute.png",
									nodetype: "element"

								};

								columnModel.RootNode.childNodes[0].childNodes.push(elementModel);
								
								//not supproting sp10 exchangetype via claculated culum
							} else if (that._isExchangeType===undefined && ((!element.measureType) || (element.measureType && element.measureType === "calculatedMeasure")) && (element.calculationDefinition) &&
								(element.aggregationBehavior === "none")) {
								var elementModel = {
									name: element.name,
									iconpath: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Calculated_Attribute.png",
									nodetype: "element"
								};

								columnModel.RootNode.childNodes[1].childNodes.push(elementModel);
							}
						}

					});

					var addShredcolumn = function(checkbox) {
						if (that._element && that._element.aggregationBehavior != "none") {
							var sharedNode = {
								"name": resourceLoader.getText("tit_calculation_views"),
								"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/folder.png",
								"childNodes": []
							};

							that._viewnode.inputs.foreach(function(ip) {
								if (ip.selectAll) {
									var sharedSubNode = {
										"name": ip.getSource().name,
										"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/calculation_scenario.png",
										"childNodes": []
									};

									ip.getSource().elements.foreach(function(element) {
										//checking the proxy elements and sking for from value help dialog
										if (!CalcViewEditorUtil.isBasedOnElementProxy({
											object: element,
											viewNode: that._viewnode
										})) {
											if (!element.calculationDefinition && element.aggregationBehavior && element.aggregationBehavior === "none") {
												var elementModel = {
													name: element.name,
													iconpath: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Attribute.png",
													nodetype: "element",
													fqName: ip.getSource().fqName
												};
												if (checkbox) {
													if (element.inlineType.semanticType === "currencyCode") {
														sharedSubNode.childNodes.push(elementModel);
													}
												} else {
													sharedSubNode.childNodes.push(elementModel);
												}

											}
										}
									});

									sharedNode.childNodes.push(sharedSubNode);
								}

							});
							if (checkbox) {
								checkbox.RootNode.childNodes.unshift(sharedNode);
							} else {
								columnModel.RootNode.childNodes.unshift(sharedNode);
							}
						}
					};

					if (that._viewnode && that._viewnode.isStarJoin()) {
						//add shared column to tree
						addShredcolumn();

					}

					/*if (that._element && that._element.currencyConversion && that._element.currencyConversion.outputUnitCurrencyElement) {
						var elementModel = {
							name: that._element.currencyConversion.outputUnitCurrencyElement.name,
							iconpath: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Attribute.png",
							nodetype: "element"
						};

						columnModel.RootNode.childNodes[0].childNodes.push(elementModel);
					} else */
					if (that._outputUnitCurrencyElement) {
						var elementModel = {
							name: that._outputUnitCurrencyElement,
							iconpath: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Attribute.png",
							nodetype: "element"
						};

						columnModel.RootNode.childNodes[0].childNodes.push(elementModel);
					}

					if (columnView) {
						columnView.parameters.foreach(function(parameter) {
							if (!parameter.isVariable) {
								var elementModel = {
									name: parameter.name,
									iconpath: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Parameter.png",
									nodetype: "parameter"
								};
								parameterModel.RootNode.childNodes[0].childNodes.push(elementModel);
							}
						});
					}
				}
				var treeModel = new sap.ui.model.json.JSONModel();
				if (that._model) {
					treeModel.setData(that._model);
				}

				if (that._selectedItem) {
					if (that._selectedItem === "column") {
						treeModel.setData(columnModel);
					} else {
						treeModel.setData(parameterModel);
					}
				}

				var selectedItem;
				//create the Tree control
				var oTree = new sap.ui.commons.Tree({
					select: function(oEvent) {
						var nodeType = oEvent.getParameter("node").getBindingContext().getObject().nodetype;
						that._selectedElement = oEvent.getParameter("node").getBindingContext().getObject();
						if (nodeType && (nodeType === "element" || nodeType === "parameter")) {
							yesButton.setEnabled(true);
						} else {
							yesButton.setEnabled(false);
						}
					}
				});
				oTree.setShowHeader(false);
				oTree.setTitle("Explorer");
				// oTree.setWidth("300px");
				oTree.setHeight("400px");
				oTree.setHeight("auto");
				oTree.setShowHeaderIcons(true);
				oTree.setShowHorizontalScrollbar(false);

				var node = new sap.ui.commons.TreeNode({
					text: "{name}",
					/*  text: {
                            parts: ["name","nodeName","fqName"] ,
                          formatter:function(name,nodeName,fqName){
                              if(nodeName || fqName){
                                  return "<p>"+name+"</p> "+nodeName+fqName;
                              }else{
                                  return "<b>"+name+"</b>";
                              }
                              
                          }

                    },*/
					expanded: true
				});

				node.bindAggregation("nodes", "/childNodes", node);

				node.bindProperty("icon", "iconpath");

				//create Tree Nodes

				oTree.bindNodes("/RootNode", node);
				oTree.setModel(treeModel);

				if (that._selectedItem === "fixed" && !this._isClient) {
					oLayout.addContent(oTable2);
					oDialog1.setWidth("450px");
					oDialog1.setHeight("350px");
				} else if (!this._isClient) {
					if (that._isCurrencyCodeEnabled) {
						var currencyCode = new sap.ui.commons.CheckBox({
							text: resourceLoader.getText("txt_currencyCode"),
							change: function() {
								if (this.getChecked()) {
									setCurrencyModel();

								} else {
									oTree.setModel(treeModel);
								}
							}
						});
						oLayout.addContent(currencyCode);
					} else if (that._isUnitEnabled) {
						var unitCode = new sap.ui.commons.CheckBox({
							text: resourceLoader.getText("txt_unitCode"),
							change: function() {
								if (this.getChecked()) {
									setUnitModel();
								} else {
									oTree.setModel(treeModel);
								}
							}
						});
						oLayout.addContent(unitCode);
					}
					oLayout.addContent(oTree);
					oDialog1.setWidth("400px");
					oDialog1.setHeight("350px");
				}

				if (this._isClient) {

					var topMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
						columns: 2,
						layoutFixed: false,
						width: "100%"

					});

					var clientLabel = new sap.ui.commons.Label({
						text: "Client"
					});
					var clientField = new sap.ui.commons.TextField({
						enabled: true,
						width: "250px",
						liveChange: function(oEvent) {
							that._sessionClient = oEvent.mParameters.liveValue;
							yesButton.setEnabled(that._sessionClient.length > 0 && !isNaN(that._sessionClient));

						}
					});

					var sessionClient = new sap.ui.commons.CheckBox({
						text: "Session Client",
						checked: false,
						change: function() {
							if (this.getChecked()) {
								clientField.setEnabled(false);
								yesButton.setEnabled(true);
								that._sessionClient = "$$client$$";
							} else {
								clientField.setEnabled(true);
								that._sessionClient = "";
								yesButton.setEnabled(false);
							}

						}
					});

					if (that._clientValue && that._clientValue !== "$$client$$") {
						clientField.setValue(that._clientValue);
					} else if (that._clientValue === "$$client$$") {
						sessionClient.setChecked(true);
						clientField.setEnabled(false);
					} else {
						sessionClient.setChecked(false);
						clientField.setEnabled(true);
					}
					topMatrixLayout.createRow(clientLabel, clientField);
					topMatrixLayout.createRow(null, sessionClient);
					oLayout.addContent(topMatrixLayout);
					oDialog1.setWidth("400px");
					oDialog1.setHeight("350px");
					oLayout.setWidth("100%");

				}
				oDialog1.addContent(oLayout);

				var currency = [];
				var data = [];
				var callbackresults_1 = function(result) {
					if (result.responses[0].result.entries) {
						for (var i = 0; i < result.responses[0].result.entries.length; i++) {
							currency.push({
								currency: result.responses[0].result.entries[i][0]
							});
						}
					}
					updateTable(currency);
				};

				var callbackresults_2 = function(result) {

					if (result.responses[0].result.entries) {
						for (var i = 0; i < result.responses[0].result.entries.length; i++) {
							data.push({
								currency: result.responses[0].result.entries[i][0],
								decription: result.responses[0].result.entries[i][1]
							});
						}
					}
					if (data.length > 0) {
						updateTable(data);
					}
				};

				var callbackresultsUnit = function(result) {
					if (result.responses[0].result.entries) {
						for (var i = 0; i < result.responses[0].result.entries.length; i++) {
							data.push({
								currency: result.responses[0].result.entries[i][0],
								decription: result.responses[0].result.entries[i][1]
							});
						}
					}
					if (data.length > 0) {
						updateTable(data);
					}
				};

				var callbackresultsExchange = function(result) {
					if (result && result.responses[0] && result.responses[0].result && result.responses[0].result.entries) {
						for (var i = 0; i < result.responses[0].result.entries.length; i++) {
							data.push({
								currency: result.responses[0].result.entries[i][0],
								decription: result.responses[0].result.entries[i][1]
							});
						}
					}
					updateTable(data);
				};

				var updateTable = function(data) {
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData({
						modelData: data
					});
					oTable2.setBusy(false);
					oTable2.setModel(oModel);
					oTable2.bindRows("/modelData");
				};

				var callbackresults = function(result) {
					var clientId = "(";
					if (result.responses[0].result.entries) {
						for (var i = 0; i < result.responses[0].result.entries.length; i++) {
							var id = "'" + result.responses[0].result.entries[i][0] + "'";
							if (i === 0) {
								clientId = clientId + id;
							} else {
								clientId = clientId + "," + id;
							}
						}
					}
					clientId = clientId + ")";
					var aStatements = [];
					var stmt = "SELECT DISTINCT WAERS FROM " + that._schema + ".TCURC WHERE MANDT IN " + clientId;
					var maxResult = 2;
					aStatements.push({
						statement: encodeURI(stmt),
						type: "SELECT"
					});
					//that._context.service.catalogDAO.sqlMultiExecute(aStatements, maxResult, callbackresults_1);

					var aStatements1 = [];
					stmt = "SELECT DISTINCT WAERS,LTEXT from  " + that._schema + ".TCURT where SPRAS = 'E' and MANDT IN " + clientId;
					aStatements1.push({
						statement: encodeURI(stmt),
						type: "SELECT"
					});
					//that._context.service.catalogDAO.sqlMultiExecute(aStatements1, maxResult, callbackresults_2);
				};
				if (that._isUnit && that._selectedItem === "fixed") {
					var aStatements = [];
					var stmt = "select MSEHI,MSEHL FROM " + that._schema + ".T006A WHERE SPRAS = 'E' and MANDT = 000";
					var maxResult = 2;
					aStatements.push({
						statement: encodeURI(stmt),
						type: "SELECT"
					});

					if (that._context) {
						//var viewEntity = that._context.service.catalogDAO.sqlMultiExecute(aStatements, maxResult, callbackresultsUnit);
					}
				} else if (!this._isExchangeType && that._selectedItem === "fixed") {
					var aStatements = [];
					var stmt = "SELECT DISTINCT MANDT FROM " + that._schema + ".TCURC";
					var maxResult = 2;
					aStatements.push({
						statement: encodeURI(stmt),
						type: "SELECT"
					});

					if (that._context) {
						//var viewEntity = that._context.service.catalogDAO.sqlMultiExecute(aStatements, maxResult, callbackresults);
					}
				}

				if (this._isExchangeType && that._selectedItem === "fixed") {
					var aStatements = [];
					var stmt = "SELECT DISTINCT KURST FROM " + that._schema + ".TCURV";
					var maxResult = 2;
					aStatements.push({
						statement: encodeURI(stmt),
						type: "SELECT"
					});

					if (that._context) {
						//var viewEntity = that._context.service.catalogDAO.sqlMultiExecute(aStatements, maxResult, callbackresultsExchange);
					}
				}

				//   mLayout.createRow(comboLabel, dataTypeCombo);

				// oDialog1.addContent(mLayout);

				yesButton = new sap.ui.commons.Button({
					text: "Ok",
					enabled: false,
					press: function() {

						okPressed();

					}
				});

				var okPressed = function() {
					if (that._isClient) {
						that._fnCallBack(that._sessionClient);
						oDialog1.close();
						oDialog1.destroy();
					} else if (that._selectedItem === "fixed") {
						var index = oTable2.getSelectedIndex();
						if (index !== -1) {
							var selectedItem = oTable2.getContextByIndex(index).getProperty("currency");
							that._fnCallBack(selectedItem);
							oDialog1.close();
							oDialog1.destroy();
						}
					} else {
						if (that._selectedElement) {
							that._fnCallBack(that._selectedElement);
							oDialog1.close();
							oDialog1.destroy();
						}
					}
				};

				var setCurrencyModel = function() {
					var newColumnModel = {
						"RootNode": {
							"name": "root",
							"childNodes": [{
								"name": "Columns",
								"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/folder.png",
								"childNodes": []
                            }, {
								"name": "Calculated Columns",
								"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/folder.png",
								"childNodes": []
                            }]
						}
					};

					elements.foreach(function(element) {
						if (!element.calculationDefinition && element.aggregationBehavior && element.aggregationBehavior === "none" && element.inlineType.semanticType ===
							"currencyCode") {
							var elementModel = {
								name: element.name,
								iconpath: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Attribute.png",
								nodetype: "element"
							};

							newColumnModel.RootNode.childNodes[0].childNodes.push(elementModel);
						} else if (that._isExchangeType===undefined && ((!element.measureType) || (element.measureType && element.measureType === "calculatedMeasure")) && (element.calculationDefinition) &&
							(element.aggregationBehavior === "none") && (element.inlineType.semanticType === "currencyCode")) {
							var elementModel = {
								name: element.name,
								iconpath: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Calculated_Attribute.png",
								nodetype: "element"
							};

							newColumnModel.RootNode.childNodes[1].childNodes.push(elementModel);

						}
					});
					if (that._viewnode && that._viewnode.isStarJoin()) {
						addShredcolumn(newColumnModel);
					}
					var newTreeModel = new sap.ui.model.json.JSONModel();
					newTreeModel.setData(newColumnModel);
					oTree.setModel(newTreeModel);
				};
				var setUnitModel = function() {
					var newColumnModel = {
						"RootNode": {
							"name": "root",
							"childNodes": [{
								"name": "Columns",
								"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/folder.png",
								"childNodes": []
                            }, {
								"name": "Calculated Columns",
								"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/folder.png",
								"childNodes": []
                            }]
						}
					};

					elements.foreach(function(element) {
						if (!element.calculationDefinition && element.aggregationBehavior && element.aggregationBehavior === "none" && element.inlineType.semanticType ===
							"unitOfMeasure") {
							var elementModel = {
								name: element.name,
								iconpath: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Attribute.png",
								nodetype: "element"
							};

							newColumnModel.RootNode.childNodes[0].childNodes.push(elementModel);
						} else if (that._isExchangeType===undefined && ((!element.measureType) || (element.measureType && element.measureType === "calculatedMeasure")) && (element.calculationDefinition) &&
							(element.aggregationBehavior === "none") && (element.inlineType.semanticType === "unitOfMeasure")) {
							var elementModel = {
								name: element.name,
								iconpath: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Calculated_Attribute.png",
								nodetype: "element"
							};

							newColumnModel.RootNode.childNodes[1].childNodes.push(elementModel);

						}
					});
					var newTreeModel = new sap.ui.model.json.JSONModel();
					newTreeModel.setData(newColumnModel);
					oTree.setModel(newTreeModel);
				};
				var NoButton = new sap.ui.commons.Button({
					text: "Cancel",
					press: function() {
						oDialog1.close();
						oDialog1.destroy();

					}
				});
				/* if (that._selectedItem === "column") {
                    yesButton.setEnabled(false);
                } else {
                    yesButton.setEnabled(true);
                }*/
				oDialog1.addButton(yesButton);
				oDialog1.addButton(NoButton);

				oDialog1.open();
			}
		};
		return CurrencyDialog;
	}); //To use a javascript view its name must end with .view.js
sap.ui.jsview("##YOUR VIEW NAME GOES HERE", {

	getControllerName: function() {
		return "##CONTROLLER NAME";
	},

	createContent: function(oController) {
		var btn = new sap.ui.commons.Button({
			text: 'Hello World',
			press: function() {
				alert('Hello!')
			}
		});
		return btn;
	}
});
