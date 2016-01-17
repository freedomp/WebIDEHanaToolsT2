/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../../util/ResourceLoader",
        "../../viewmodel/commands",
        "../../base/modelbase",
        "../../viewmodel/model",
        "../CalcViewEditorUtil",
        "../dialogs/ValueHelpDialog"
    ],
	function(ResourceLoader, commands, modelbase, model, CalcViewEditorUtil, ValueHelpDialog) {
		"use strict";
	//	var schemaMapping = SchemaMappingService.schemaMapping;
		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
		var CalculatedColumnDetails = function(attributes) {
			this.undoManager = attributes.undoManager;
			this.gotoExpressionEditor = attributes.gotoExpressionEditor;
			this.gotoSemantics = attributes.gotoSemantics;
			this.element;
			this.elementModel = new sap.ui.model.json.JSONModel();
			this.viewNode = attributes.viewNode;
			this.columnView = attributes.columnView;
			this.topVerticalLayout;
			this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.modelChanged, this);
			this.nameField;
			this.scaleText;
			this.lengthText;
			this.context = attributes.context;
		};
		CalculatedColumnDetails.prototype = {

			_execute: function(commands) {
				var that = this;
				if (that.undoManager) {
					if (commands instanceof Array) {
						return that.undoManager.execute(new modelbase.CompoundCommand(commands));
					} else {
						return that.undoManager.execute(commands);
					}

				}
			},

			close: function() {
				if (this.viewNode.$getEvents()._registry) {
					this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.modelChanged, this);
				}
				if (this.elementModel) {
					this.elementModel.destroy();
				}
			},

			getContent: function() {
				return this.topVerticalLayout;
			},

			updateDetails: function(element) {
				if (element) {
					this.element = element;
				}
				if (this.element && this.headerLabel) {
					this.headerLabel.setText(resourceLoader.getText("tit_calculated_column_properties", [this.element.name]));
				}
				this.elementModel.setData(CalcViewEditorUtil.createModelForCalculatedColumn(this.element, this.viewNode));
				if (!this.topVerticalLayout || !this.topVerticalLayout.getContent()) {
					this.getDetailsContent();
				}
				this.elementModel.updateBindings();
			},

			modelChanged: function(object, event) {
				if (this.element.name === object.name) {
					this.updateDetails();
				}
			},

			destroyContent: function() {
				if (this.topVerticalLayout) {
					this.topVerticalLayout.destroyContent();
				}
			},

			getDetailsContent: function() {
				var that = this;
				if (!this.topVerticalLayout) {
					this.topVerticalLayout = new sap.ui.commons.layout.VerticalLayout({
						height: "100%"
					});
				}

				var headerLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%"
				});

				this.headerLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_calculated_column_properties", [this.element ? this.element.name : ""]),
					design: sap.ui.commons.LabelDesign.Bold
				});

				headerLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
					content: [this.headerLabel],
					hAlign: sap.ui.commons.layout.HAlign.Center,
					vAlign: sap.ui.commons.layout.VAlign.Center
				}).addStyleClass("detailsHeaderStyle"));

				this.topVerticalLayout.addContent(headerLayout);

				var detailsLayout = new sap.ui.commons.layout.VerticalLayout();

				detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("txt_general_prop")));
				detailsLayout.addContent(this.getGeneralContainer());

				if (that.viewNode.isDefaultNode()) {
					detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("txt_semantics")));
					detailsLayout.addContent(that.getSemanticsContainer());
				}

				detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("txt_expression")));
				detailsLayout.addContent(that.getExpressionContainer());

				detailsLayout.setModel(that.elementModel);
				detailsLayout.addStyleClass("customProperties");

				this.topVerticalLayout.addStyleClass("detailsMainDiv");

				this.topVerticalLayout.addContent(detailsLayout);

				return that.topVerticalLayout;
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

			getGeneralContainer: function() {
				var that = this;
				var generalMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					widths: ["30%", "70%"]
				});

				generalMatrixLayout.createRow(null);

				var nameLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_name"),
					required: true
				}).addStyleClass("labelFloat");
				this.nameField = new sap.ui.commons.TextField({
					width: "90%",
					value: "{/name}",
					change: function(event) {
						var value = event.getParameter("newValue");
						var result = CalcViewEditorUtil.checkRenameElement(value, that.element, that.viewNode, that.columnView);
						this.setValueState(sap.ui.core.ValueState.None);
						this.setTooltip(null);
						if (result.message && value !== that.element.name) {
							var message = result.messageObjects ? resourceLoader.getText(result.message, result.messageObjects) : result.message;
							var messageObjects = ["'" + resourceLoader.getText("tit_name") + "'", "'" + that.element.name + "'"];
							message = resourceLoader.getText("msg_message_toast_calculated_column_error", messageObjects) + " (" + message + ")";
							this.setValue(that.element.name);
							this.setTooltip(null);
							jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
							sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show(message, {
								of: that.topVerticalLayout,
								offset: "-10px -100px"
							});
						} else if (value !== that.element.name) {
							var attributes = CalcViewEditorUtil.createModelForElementAttributes();
							attributes.objectAttributes.name = value;
							if (that.element.label === undefined && that.viewNode.isDefaultNode()) {
								attributes.objectAttributes.label = value;
							}
							var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
							that._execute(command);
						}
					},
					liveChange: function(event) {
						var value = event.getParameter("liveValue");
						var result = CalcViewEditorUtil.checkRenameElement(value, that.element, that.viewNode, that.columnView);
						if (result.message && value !== that.element.name) {
							var message = result.messageObjects ? resourceLoader.getText(result.message, result.messageObjects) : result.message;
							this.setTooltip(message);
							this.setValueState(sap.ui.core.ValueState.Error);
						} else {
							this.setTooltip(null);
							this.setValueState(sap.ui.core.ValueState.None);
						}
					}
				}).addStyleClass("dummyTest1");
				generalMatrixLayout.createRow(nameLabel, this.nameField);
				if (that.viewNode.isDefaultNode()) {
					var desLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_label")
					}).addStyleClass("labelFloat");
					var desField = new sap.ui.commons.TextField({
						width: "90%",
						value: "{/label}",
						change: function(event) {
							var value = event.getParameter("newValue");
							var attributes = CalcViewEditorUtil.createModelForElementAttributes();
							attributes.objectAttributes.label = value;
							var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
							that._execute(command);
						}
					}).addStyleClass("dummyTest2");

					generalMatrixLayout.createRow(desLabel, desField);
				}
				var dataTypeLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_data_type"),
					required: true
				}).addStyleClass("labelFloat");

				var dataTypeCombo = new sap.ui.commons.DropdownBox({
					width: "90%",
					selectedKey: "{primitiveType}",
					change: function(event) {
						var selecetdKey = event.getSource().getSelectedKey();
						var attributes = CalcViewEditorUtil.createModelForElementAttributes();
						attributes.typeAttributes.primitiveType = selecetdKey;
						if (selecetdKey === "DECIMAL" || selecetdKey === "FLOAT" || selecetdKey === "NVARCHAR" || selecetdKey === "VARCHAR") {
							attributes.typeAttributes.length = "1";
							if (selecetdKey === "DECIMAL") {
								attributes.typeAttributes.scale = "1";
							} else {
								attributes.typeAttributes.scale = undefined;
							}
						} else {
							attributes.typeAttributes.length = undefined;
							attributes.typeAttributes.scale = undefined;
						}
						var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
						that._execute(command);
					}
				}).addStyleClass("dummyTest3");
				var dataTypeListItem = new sap.ui.core.ListItem({});
				dataTypeListItem.bindProperty("text", "datatype");
				dataTypeListItem.bindProperty("key", "datatype");

				dataTypeCombo.bindItems({
					path: "/dataTypes",
					template: dataTypeListItem
				});

				generalMatrixLayout.createRow(dataTypeLabel, dataTypeCombo);

				var lengthLabel = new sap.ui.commons.Label({
					width: "15%",
					text: resourceLoader.getText("tit_length"),
					textAlign: sap.ui.core.TextAlign.Right
				});

				this.lengthText = new sap.ui.commons.TextField({
					width: "27%",
					value: "{/length}",
					change: function(event) {
						var value = event.getParameter("newValue");
						this.setValueState(sap.ui.core.ValueState.None);
						var dataType = dataTypeCombo.getSelectedKey();

						if (!CalcViewEditorUtil.validateDataTypeLength(value, dataType)) {
							//var message = resourceLoader.getText("msg_invalid_length");
							var messageObjects = ["'" + resourceLoader.getText("tit_length") + "'", "'" + that.element.name + "'"];
							var message = resourceLoader.getText("msg_message_toast_calculated_column_error", messageObjects);
							this.setValue(that.element.inlineType.length);
							this.setTooltip(null);
							jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
							sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show(message, {
								of: that.topVerticalLayout,
								offset: "-10px -100px"
							});
						} else {
							var attributes = CalcViewEditorUtil.createModelForElementAttributes();
							attributes.typeAttributes.length = value;
							var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
							that._execute(command);
						}
					},
					liveChange: function(event) {
						var value = event.getParameter("liveValue");
						var dataType = dataTypeCombo.getSelectedKey();
						if (!CalcViewEditorUtil.validateDataTypeLength(value, dataType)) {
							this.setValueState(sap.ui.core.ValueState.Error);
						} else {
							this.setValueState(sap.ui.core.ValueState.None);
						}
					},
					enabled: {
						path: "/primitiveType",
						formatter: function(primitiveType) {
							if (primitiveType === "DECIMAL" || primitiveType === "FLOAT" || primitiveType === "NVARCHAR" || primitiveType === "VARCHAR") {
								return true;
							}
							return false;
						}
					}
				}).addStyleClass("dummyTest4");

				var scaleLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_scale"),
					width: "14%",
					textAlign: sap.ui.core.TextAlign.Right
				});
				this.scaleText = new sap.ui.commons.TextField({
					width: "27%",
					value: "{/scale}",
					change: function(event) {
						var value = event.getParameter("newValue");
						this.setValueState(sap.ui.core.ValueState.None);
						if (!CalcViewEditorUtil.validateNumber(value) && value !== "") {
							var messageObjects = ["'" + resourceLoader.getText("tit_length") + "'", "'" + that.element.name + "'"];
							var message = resourceLoader.getText("msg_message_toast_calculated_column_error", messageObjects);
							this.setValue(that.element.inlineType.scale);
							this.setTooltip(null);
							jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
							sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show(message, {
								of: that.topVerticalLayout,
								offset: "-10px -100px"
							});
						} else {
							var attributes = CalcViewEditorUtil.createModelForElementAttributes();
							attributes.typeAttributes.scale = value;
							var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
							that._execute(command);
						}
					},
					liveChange: function(event) {
						var value = event.getParameter("liveValue");
						if (!CalcViewEditorUtil.validateNumber(value) && value !== "") {
							this.setValueState(sap.ui.core.ValueState.Error);
						} else {
							this.setValueState(sap.ui.core.ValueState.None);
						}
					},
					enabled: {
						path: "/primitiveType",
						formatter: function(primitiveType) {
							if (primitiveType === "DECIMAL") {
								return true;
							}
							return false;
						}
					}
				}).addStyleClass("dummyTest5");

				var cell = new sap.ui.commons.layout.MatrixLayoutCell();
				cell.addContent(lengthLabel);
				cell.addContent(this.lengthText);
				cell.addContent(scaleLabel);
				cell.addContent(this.scaleText);

				generalMatrixLayout.createRow(null, cell);

				//generalMatrixLayout.createRow(null);
				return generalMatrixLayout;

			},

			getSemanticsContainer: function() {
				var that = this;
				var semanticsMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					widths: ["30%", "70%"]
				});
				semanticsMatrixLayout.createRow(null);

				if (that.viewNode.isDefaultNode() && that.columnView.dataCategory !== "DIMENSION") {
					var columnTypeLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_column_type")
					}).addStyleClass("labelFloat");
					var columnTypeCombo = new sap.ui.commons.DropdownBox({
						width: "90%",
						value: resourceLoader.getText("txt_attribute"),
						selectedKey: {
							path: "/aggregationBehavior",
							formatter: function(aggregationBehavior) {
								if (aggregationBehavior && aggregationBehavior.toUpperCase() === "NONE") {
									return "NONE";
								} else {
									return "FORMULA";
								}
							}
						},

						change: function(event) {
							var selecetdKey = event.getSource().getSelectedKey();
							var attributes;
							if (selecetdKey === "NONE") {
								attributes = CalcViewEditorUtil.getAttributePropertiesModel(that.element);
								aggregationTypeField.unbindItems();
								attributes.objectAttributes.aggregationBehavior = selecetdKey.toLowerCase();
								attributes.objectAttributes.measureType = undefined
							} else {

								attributes = CalcViewEditorUtil.getMeasurePropertiesModel(that.element);

								clientSideAggrCheckBox.setEnabled(true);

								if (clientSideAggrCheckBox.getChecked()) {

									aggregationTypeField.bindItems("/aggregation", oItemTemplate1);

									attributes.objectAttributes.aggregationBehavior = "sum";
								} else {
									aggregationTypeField.unbindItems();
									attributes.objectAttributes.aggregationBehavior = selecetdKey.toLowerCase();
								}
							}
							attributes.objectAttributes.engineAggregation = selecetdKey.toLowerCase();

							attributes.objectAttributes.measureType = model.MeasureType.CALCULATED_MEASURE;
							var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
							that._execute(command);
						}
					}).addStyleClass("dummyTest6");
					columnTypeCombo.addItem(new sap.ui.core.ListItem({
						text: resourceLoader.getText("txt_attribute"),
						key: "NONE"
					}));

					columnTypeCombo.addItem(new sap.ui.core.ListItem({
						text: resourceLoader.getText("txt_measure"),
						key: "FORMULA"
					}));

					semanticsMatrixLayout.createRow(columnTypeLabel, columnTypeCombo);

					var aggregationTypeLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_aggregation_type")
					}).addStyleClass("labelFloat");

					/*var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData({
                        aggregation: [{
                            type: "SUM"
                        }, {
                            type: "MAX"
                        }, {
                            type: "MIN"
                        }, {
                            type: "COUNT"
                        }]
                    });*/

					//   sap.ui.getCore().setModel(oModel);
					var aggregationTypeField = new sap.ui.commons.DropdownBox({
						width: "90%",
						enabled: {
							path: "/aggregationBehavior",
							formatter: function(aggregationBehavior) {
								if (aggregationBehavior && aggregationBehavior.toUpperCase() !== "FORMULA" && aggregationBehavior.toUpperCase() !== "NONE") {
									return true;
								} else {
									return false;
								}
							}
						},
						value: {
							path: "/aggregationBehavior",
							formatter: function(aggregationBehavior) {
								if (aggregationBehavior) {
									return aggregationBehavior.toUpperCase();
								} else {
									return "NONE";
								}
							}
						},

						change: function(event) {

							var attributes = CalcViewEditorUtil.getMeasurePropertiesModel(that.element);
							attributes.objectAttributes.aggregationBehavior = aggregationTypeField.getValue().toLowerCase();

							var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
							that._execute(command);
						}
					}).addStyleClass("dummyTest8");

					//aggregationTypeField.setModel(oModel);
					var oItemTemplate1 = new sap.ui.core.ListItem();
					oItemTemplate1.bindProperty("text", "aggregationType");

					aggregationTypeField.bindItems("aggregationTypes", oItemTemplate1);

					semanticsMatrixLayout.createRow(aggregationTypeLabel, aggregationTypeField);

				}
				if (that.viewNode.isDefaultNode()) {
					var hiddenCB = new sap.ui.commons.CheckBox({
						text: resourceLoader.getText("tit_hidden"),
						tooltip: resourceLoader.getText("tit_hidden"),
						checked: "{/hidden}",
						change: function() {
							var attributes = CalcViewEditorUtil.createModelForElementAttributes();
							attributes.objectAttributes.hidden = hiddenCB.getChecked();
							var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
							that._execute(command);
						}
					}).addStyleClass("dummyTest10");

					var clientSideAggrCheckBox = new sap.ui.commons.CheckBox({
						text: resourceLoader.getText("txt_enbl_client_aggr"),
						tooltip: resourceLoader.getText("txt_enbl_client_aggr"),
						enabled: {
							parts: ["/engineAggregation"],
							formatter: function(engineAggregation) {
								if (engineAggregation && engineAggregation.toUpperCase() === "NONE") {
									return false;
								} else if (engineAggregation && engineAggregation.toUpperCase() === "FORMULA") {
									return true;
								} else {
									return true;
								}
							}

						},
						checked: {
							parts: ["/engineAggregation", "/aggregationBehavior"],
							formatter: function(engineAggregation, aggregationBehavior) {
								if (aggregationBehavior) {
									if (aggregationBehavior.toUpperCase() === "NONE" || aggregationBehavior.toUpperCase() === "FORMULA") {
										return false;
									} else {
										return true;
									}
								} else {
									return false;
								}
							}

						},
						change: function() {

							var attributes = CalcViewEditorUtil.getMeasurePropertiesModel(that.element);
							if (clientSideAggrCheckBox.getChecked()) {
								aggregationTypeField.setEnabled(true);
								aggregationTypeField.bindItems("/aggregationTypes", oItemTemplate1);
								attributes.objectAttributes.aggregationBehavior = "sum";

							} else {
								aggregationTypeField.setEnabled(false);
								aggregationTypeField.unbindItems();

								attributes.objectAttributes.aggregationBehavior = "formula";
							}

							attributes.objectAttributes.engineAggregation = "formula";

							var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
							that._execute(command);
						}
					}).addStyleClass("dummyTest9");

					var cell = new sap.ui.commons.layout.MatrixLayoutCell();
					cell.addContent(hiddenCB);
					cell.addContent(clientSideAggrCheckBox);
					semanticsMatrixLayout.createRow(null, cell);

				}
				var semanticsLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_semantic_type")
				}).addStyleClass("labelFloat");

				var semanticTypeCombo = new sap.ui.commons.DropdownBox({
					width: "90%",
					selectedKey: "{/semanticType}",
					change: function(event) {
						var selecetdKey = event.getSource().getSelectedKey();
						var attributes = CalcViewEditorUtil.createModelForElementAttributes();
						attributes.typeAttributes.semanticType = selecetdKey;
						var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
						that._execute(command);
					}
				}).addStyleClass("dummyTest11");
				var semanticTypesListItem = new sap.ui.core.ListItem();
				semanticTypesListItem.bindProperty("text", "value");
				semanticTypesListItem.bindProperty("key", "key");

				semanticTypeCombo.bindItems({
					path: "/semanticTypes/items",
					template: semanticTypesListItem
				});
				//drill down operation 
				var drillDownLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_drill_down")
				}).addStyleClass("labelFloat");

				//for drillDown  list template 
				var drillDownItemTemplate = new sap.ui.core.ListItem({
					text: "{type}"
				});
				var drillDownTemplate = new sap.ui.commons.DropdownBox({
					width: "90%",

					enabled: {
						parts: ["/aggregationBehavior", "/descriptionColumn"],
						formatter: function(aggregationBehavior, descriptionColumn) {
							return aggregationBehavior === "NONE" && !descriptionColumn;
						}
					},
					value: {
						parts: ["/drillDown", "/aggregationBehavior"],
						formatter: function(drillDown, aggregationBehavior) {
							if (aggregationBehavior === "NONE") {
								if (drillDown === "DRILL_DOWN") {
									return resourceLoader.getText("txt_drill_down");
								} else if (drillDown === "DRILL_DOWN_WITH_HIERARCHY") {
									return resourceLoader.getText("txt_drill_down_hierarchy");
								}
							}
						}
					},
					change: function(event) {
						var value = event.getParameter("newValue");
						var attributes = CalcViewEditorUtil.createModelForElementAttributes();
						if (value === "") {
							value = "NONE";
						} else if (value === resourceLoader.getText("txt_drill_down")) {
							value = "DRILL_DOWN";
							attributes.objectAttributes.attributeHierarchyDefaultMember = "";
						} else if (value === resourceLoader.getText("txt_drill_down_hierarchy")) {
							value = "DRILL_DOWN_WITH_HIERARCHY";
							attributes.objectAttributes.attributeHierarchyDefaultMember = "";
						}
						attributes.objectAttributes.drillDownEnablement = value;

						var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
						that._execute(command);
					}

				}).addStyleClass("dummyTest7");

				semanticsMatrixLayout.createRow(drillDownLabel, drillDownTemplate.bindItems("/drillDownList", drillDownItemTemplate));

				semanticsMatrixLayout.createRow(semanticsLabel, semanticTypeCombo);

				//semanticsMatrixLayout.createRow(null);

				var CurrencyLabel = new sap.ui.commons.Label({
					text: {
						path: "/semanticType",
						formatter: function(semanticType) {
							if (semanticType === "amount") {
								return resourceLoader.getText("txt_currency");
							} else if (semanticType === "quantity") {
								return resourceLoader.getText("txt_unit");
							}
						}
					},
					visible: {
						path: "/semanticType",
						formatter: function(semanticType) {
							if (semanticType === "amount" || semanticType === "quantity") {
								return true;
							}
							return false;
						}
					}
				}).addStyleClass("labelFloat");

				var columnCell = new sap.ui.commons.layout.MatrixLayoutCell();

				this.typeDropdownBox = new sap.ui.commons.DropdownBox({
					width: "42%",
					selectedKey: {
						path: "fixedCurrency",
						formatter: function(fixedCurrency) {
							if (fixedCurrency) {
								return "fixed";
							}
							//return "column";
						}
					},
					visible: {
						path: "/semanticType",
						formatter: function(semanticType) {
							if (semanticType === "amount" || semanticType === "quantity") {
								return true;
							}
							return false;
						}
					},
					change: function(event) {
						var selecetdKey = event.getSource().getSelectedKey();
						var attributes = {
							unitCurrencyElement: {}
						};
						if (selecetdKey === "fixed") {
							attributes.unitCurrencyElement.element = undefined;
						} else {

						}
						attributes.unitCurrencyElement.clear = true;

						var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
						that._execute(command);
					}
				}).addStyleClass("dummyTest12");
				var typeListItem = new sap.ui.core.ListItem({});
				typeListItem.bindProperty("text", "text");
				typeListItem.bindProperty("key", "key");

				this.typeDropdownBox.bindItems({
					path: "/columnTypes",
					template: typeListItem
				});

				columnCell.addContent(this.typeDropdownBox);

				this.columnField = new sap.ui.commons.TextField({
					width: "42%",
					value: {
						parts: ["unitCurrencyElement", "fixedCurrency"],
						formatter: function(unitCurrencyElement, fixedCurrency) {
							if (fixedCurrency) {
								return fixedCurrency;
							}
							if (unitCurrencyElement) {
								return unitCurrencyElement.name;
							}
						}
					},
					//enabled: false,
					visible: {
						path: "/semanticType",
						formatter: function(semanticType) {
							if (semanticType === "amount" || semanticType === "quantity") {
								return true;
							}
							return false;
						}
					},
					change: function(event) {
						this.setValueState(sap.ui.core.ValueState.None);
						this.setTooltip(null);
						var selecetdKey = that.typeDropdownBox.getSelectedKey();
						var value = event.getParameter("newValue");
						var attributes = {
							unitCurrencyElement: {}
						};
						if (selecetdKey === "fixed") {
							attributes.unitCurrencyElement.fixedCurrency = value;
						} else {
							attributes.unitCurrencyElement.element = that.viewNode.elements.get(value);
							if (attributes.unitCurrencyElement.element === undefined) {
								var messageObjects = ["'" + CurrencyLabel.getText() + "'", "'" + that.element.name + "'"];
								var message = resourceLoader.getText("msg_message_toast_calculated_column_error", messageObjects) + " (" + resourceLoader.getText(
									"msg_column_does_not_exist") + ")";
								this.setValue(that.element.unitCurrencyElement ? that.element.unitCurrencyElement.name : that.element.fixedCurrency);
								this.setTooltip(null);
								jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
								sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show(message, {
									of: this,
									offset: "0 100px"
								});
								return;
							}
						}

						var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
						that._execute(command);
					},
					liveChange: function(event) {
						this.setValueState(sap.ui.core.ValueState.None);
						this.setTooltip(null);
						var value = event.getParameter("liveValue");
						var selecetdKey = that.typeDropdownBox.getSelectedKey();

						if (selecetdKey === "column") {
							var col = that.viewNode.elements.get(value);
							if (!col) {
								this.setTooltip(resourceLoader.getText("msg_column_does_not_exist"));
								this.setValueState(sap.ui.core.ValueState.Error);
							}
						}
					}
				});

				columnCell.addContent(this.columnField);

				var valueHelpButton = new sap.ui.commons.Button({
					icon: "sap-icon://value-help",
					width: "5%",
					press: function() {
						var fnCallBack = function(result) {
							var attributes = {
								unitCurrencyElement: {}
							};
							if (that.typeDropdownBox.getSelectedKey() === "fixed") {
								attributes.unitCurrencyElement.fixedCurrency = result;
							} else {
								attributes.unitCurrencyElement.element = that.viewNode.elements.get(result.name);
							}

							var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
							that._execute(command);
						};
						var title = resourceLoader.getText("txt_value_help") + " - ";
						var isUnit = false;
						if (that.element.inlineType.semanticType === "amount") {
							title = title + resourceLoader.getText("txt_currency");
						} else if (that.element.inlineType.semanticType === "quantity") {
							title = title + resourceLoader.getText("txt_unit");
							isUnit = true;
						}
						var view = that.viewNode.$$containingFeature._owner;
						var valueHelp = function(schema) {
							var valueHelpDialog = new ValueHelpDialog({
								fnCallBack: fnCallBack,
								selectedItem: that.typeDropdownBox.getSelectedKey(),
								viewnode: that.viewNode,
								title: title,
								isUnit: isUnit,
								context: that.context,
								schema: schema
							});

							valueHelpDialog.openDialog();
						};
						if (that.typeDropdownBox.getSelectedKey() === "fixed") {
							if (view.defaultSchema) {
								/*schemaMapping.getPhysicalSchema(view.defaultSchema, that.context, function(results) {
									var schema;
									if (results) {
										schema = results;
									} else {
										schema = view.defaultSchema;
									}
									valueHelp(schema);
								});*/
							} else {
								//logger.writeErrorMessage("set default schema for view");
							}
						} else {
							valueHelp(undefined);
						}

					},
					visible: {
						path: "/semanticType",
						formatter: function(semanticType) {
							if (semanticType === "amount" || semanticType === "quantity") {
								return true;
							}
							return false;
						}
					}
				}).addStyleClass("sematicsValueHelpButton");

				columnCell.addContent(valueHelpButton);

				semanticsMatrixLayout.createRow(CurrencyLabel, columnCell);

				var conversionCell = new sap.ui.commons.layout.MatrixLayoutCell();

				var hiddenLabel = new sap.ui.commons.Label({
					width: "60%",
					visible: {
						path: "semanticType",
						formatter: function(semanticType) {
							if (semanticType === "amount" || semanticType === "quantity") {
								return true;
							}
							return false;
						}
					}
				});

				conversionCell.addContent(hiddenLabel);

				var conversionButton = new sap.ui.commons.Button({
					text: resourceLoader.getText("txt_conversion"),
					icon: "sap-icon://navigation-right-arrow",
					//width: "30%",
					iconFirst: false,
					//tooltip : "This is a test tooltip",
					press: function() {
						that.gotoSemantics({
							element: that.element
						});
					},
					/*visible: {
						parts: ["semanticType", "aggregationBehavior"],
						formatter: function(semanticType, aggregationBehavior) {
							if ((semanticType === "amount" || semanticType === "quantity") && aggregationBehavior === "FORMULA") {
								return true;
							}
							return false;
						}
					}*/
					visible: false
				});

				conversionCell.addContent(conversionButton);

				semanticsMatrixLayout.createRow(null, conversionCell);

				return semanticsMatrixLayout;
			},

			getExpressionContainer: function() {
				var that = this;
				var expressionMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					widths: ["30%", "70%"]
				});
				expressionMatrixLayout.createRow(null);

				var updateExpression = function(parameters) {
					var attributes = {
						objectAttributes: {},
						typeAttributes: {},
						calculationAttributes: {}
					};
					if (parameters.hasOwnProperty("expression")) {
						if (parameters.expression !== that.element.calculationDefinition.formula) {
							attributes.calculationAttributes.formula = parameters.expression;
						}
					}
					if (parameters.hasOwnProperty("language")) {
						attributes.calculationAttributes.expressionLanguage = parameters.language;
					}
					if (Object.keys(attributes.calculationAttributes).length > 0) {
						var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
						that._execute(command);
					}
				};
				var expressionLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_value")
				}).addStyleClass("labelFloat");

				var languageCombo = new sap.ui.commons.ComboBox({
					items: [
                        new sap.ui.core.ListItem({
							text: resourceLoader.getText("Column Engine"),
							key: "COLUMN_ENGINE"
						}),
                        new sap.ui.core.ListItem({
							text: resourceLoader.getText("SQL"),
							key: "SQL"
						})
                    ],
					change: function(oEvent) {
						var language = oEvent.oSource.getSelectedKey();
						updateExpression({
							language: language
						});
					},
					selectedKey: "{expressionLanguage}",
					value: {
						path: "expressionLanguage",
						formatter: function(expressionLanguage) {
							if (expressionLanguage) {
								if (expressionLanguage === "SQL") {
									return resourceLoader.getText("SQL");
								} else {
									return resourceLoader.getText("Column Engine");
								}
							}
							return resourceLoader.getText("Column Engine");

						}
					}
				});

				var expressionButton = new sap.ui.commons.Button({
					text: resourceLoader.getText("txt_expression_editor"),
					tooltip: resourceLoader.getText("txt_expression_editor"),
					icon: "sap-icon://navigation-right-arrow",
					iconFirst: false,
					press: function() {
						that.gotoExpressionEditor({
							updateExpression: updateExpression,
							element: that.element
						});
					}
				});
				expressionButton.addStyleClass("expressionButton");

				var toolBar = new sap.ui.commons.Toolbar().addStyleClass("parameterToolbarStyle");
				toolBar.addItem(languageCombo);
				toolBar.addRightItem(expressionButton);

				var expressionField = new sap.ui.commons.TextArea({
					value: "{/formula}",
					width: "100%",
					rows: 4,
					placeholder: resourceLoader.getText("txt_enter_expression"),
					change: function(event) {
						var value = event.getParameter("newValue");
						updateExpression({
							expression: value
						});
					}
				}).addStyleClass("detailsExpressionTextArea");

				var layout = new sap.ui.commons.layout.VerticalLayout({
					width: "90%"
				}).addStyleClass("detailsExpressionLayout");
				layout.addContent(toolBar);
				layout.addContent(expressionField);

				var expressionRow = new sap.ui.commons.layout.MatrixLayoutRow({
					cells: [new sap.ui.commons.layout.MatrixLayoutCell({
							content: [expressionLabel],
							hAlign: sap.ui.commons.layout.HAlign.Center,
							vAlign: sap.ui.commons.layout.VAlign.Top
						}), new sap.ui.commons.layout.MatrixLayoutCell({
							content: [layout],
							hAlign: sap.ui.commons.layout.HAlign.Center,
							vAlign: sap.ui.commons.layout.VAlign.Center
						})

                    ]
				});

				expressionMatrixLayout.addRow(expressionRow);

				//expressionMatrixLayout.createRow(expressionLabel, layout);
				//expressionMatrixLayout.createRow(null, expressionField);

				return expressionMatrixLayout;

			}

		};

		return CalculatedColumnDetails;
	});
