/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil"
    ],
	function(ResourceLoader, modelbase, commands, CalcViewEditorUtil) {

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		var ConstantMappingDialog = function(parameters) {
			this._undoManager = parameters.undoManager;
			this.viewNode = parameters.viewNode;
			this.element = parameters.element;
			this.isCreate = parameters.isCreate === true;
			this.model = new sap.ui.model.json.JSONModel();
			this.dataTypes = CalcViewEditorUtil.getConstantDataTypes();
		};

		ConstantMappingDialog.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);
			},

			open: function() {

				if (sap.ui.getCore().byId("constantMappingDialog")) {
					sap.ui.getCore().byId("constantMappingDialog").destroy();
				}

				var that = this;

				var title = this.isCreate ? resourceLoader.getText("tit_create_target_manage_mapping") : resourceLoader.getText("tit_manage_mapping");

				//creating dialogtype
				this.dialog = new sap.ui.commons.Dialog("constantMappingDialog", {
					width: "600px",
					title: title,
					//tooltip: that.dialogtype.dialogTitle, //this.title,
					modal: true,
					resizable: true
				});

				//creating layout

				var mainLayout = new sap.ui.commons.layout.VerticalLayout().addStyleClass("customProperties");

				var targetHeader = this.isCreate ? resourceLoader.getText("tit_create_target") : resourceLoader.getText("tit_target");

				mainLayout.addContent(this.getHeaderLayout(targetHeader));
				mainLayout.addContent(this.getGeneralContainer());

				mainLayout.addContent(this.getHeaderLayout(resourceLoader.getText("tit_manage_mapping")));
				mainLayout.addContent(that.getMappingContainer());

				mainLayout.setModel(this.model);
				this.model.setData(this.createModel());
				this.model.updateBindings();

				//adding main layout to dailog
				this.dialog.addContent(mainLayout);

				var loButtonCancel = new sap.ui.commons.Button({
					tooltip: resourceLoader.getText("txt_cancel"),
					text: resourceLoader.getText("txt_cancel"),
					press: function() {
						that.close();
					}
				});
				var dailogOkEvent = function() {
					var mapping;
					var data = that.model.getData();
					if (that.isCreate) {
						// add element command
						var elementAttributes = CalcViewEditorUtil.createModelForElementAttributes();
						elementAttributes.objectAttributes.name = CalcViewEditorUtil.getUniqueNameForElement(data.name, that.viewNode, []);
						elementAttributes.objectAttributes.label = elementAttributes.objectAttributes.name;

						if (data.isConstant) {
							elementAttributes.typeAttributes.primitiveType = data.primitiveType;
							elementAttributes.typeAttributes.length = data.length;
							elementAttributes.typeAttributes.scale = data.scale;
							elementAttributes.typeAttributes.isDerived = false;
						}

						elementAttributes.mappingAttributes = [];
						for (var i = 0; i < data.mappings.length; i++) {
							mapping = data.mappings[i];

							if (mapping.sourceElement) {
								var sourceElementObject = mapping.input.getSource().elements.get(mapping.sourceElement)
								if (sourceElementObject && sourceElementObject.inlineType) {
									elementAttributes.typeAttributes.primitiveType = sourceElementObject.inlineType.primitiveType;
									elementAttributes.typeAttributes.length = sourceElementObject.inlineType.length;
									elementAttributes.typeAttributes.scale = sourceElementObject.inlineType.scale;
								}

							}

							elementAttributes.mappingAttributes.push({
								input: mapping.input,
								sourceName: mapping.sourceElement,
								values: {
									isNull: mapping.isNull,
									value: mapping.isNull ? "" : mapping.constantValue,
									type: mapping.sourceElement ? "ElementMapping" : "ConstantElementMapping"
								}
							});
						}
						var addElementcommand = new commands.AddElementCommand(that.viewNode.name, elementAttributes);
						that._execute(addElementcommand);

					} else {
						// change element properties 

						var elementAttributes = CalcViewEditorUtil.createModelForElementAttributes();

						if (data.isConstant) {
							elementAttributes.typeAttributes.primitiveType = data.primitiveType;
							elementAttributes.typeAttributes.length = data.length;
							elementAttributes.typeAttributes.scale = data.scale;
							elementAttributes.typeAttributes.isDerived = false;
						} else {
							elementAttributes.typeAttributes.isDerived = true;
						}

						var manageMappingCommands = [];
						var mappings = that.model.getData().mappings;
						for (var j = 0; j < mappings.length; j++) {
							mapping = mappings[j];
							var attributes = {
								inputId: mapping.input.$getKeyAttributeValue(),
								mappingId: mapping.mappingObject.$getKeyAttributeValue()
							};
							if (mapping.sourceElement && mapping.sourceElement !== "") {
								// element mapping
								if (mapping.sourceElement) {
									var sourceElementObject = mapping.input.getSource().elements.get(mapping.sourceElement)
									if (sourceElementObject && sourceElementObject.inlineType) {
										elementAttributes.typeAttributes.primitiveType = sourceElementObject.inlineType.primitiveType;
										elementAttributes.typeAttributes.length = sourceElementObject.inlineType.length;
										elementAttributes.typeAttributes.scale = sourceElementObject.inlineType.scale;
									}

								}
								attributes.mappingAttributes = {
									type: "ElementMapping",
									sourceElement: sourceElementObject,
									value: undefined,
									isNull: undefined
								};
							} else {
								// constant mapping
								attributes.mappingAttributes = {
									type: "ConstantElementMapping",
									sourceElement: undefined,
									value: mapping.isNull ? "" : mapping.constantValue,
									isNull: mapping.isNull
								};
							}
							manageMappingCommands.push(new commands.ChangeMappingPropertiesCommand(that.viewNode.name, attributes));
						}

						manageMappingCommands.push(new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, elementAttributes));

						that._execute(new modelbase.CompoundCommand(manageMappingCommands));
					}
					that.close();
				};
				this.loButtonOK = new sap.ui.commons.Button({
					tooltip: resourceLoader.getText("txt_ok"),
					text: resourceLoader.getText("txt_ok"),
					enabled: false,
					press: dailogOkEvent
				});

				//adding ok and Cancel layour
				this.dialog.addButton(this.loButtonOK);
				this.dialog.addButton(loButtonCancel);
				//opeing the dailog 
				this.dialog.open();
			},

			close: function() {
				if (this.model) {
					this.model.destroy();
				}
				if (this.dialog) {
					this.dialog.destroy();
				}
			},

			update: function(newName) {
				if (this.model.getData().mappings) {
					this.model.getData().isConstant = true;
					for (var i = 0; i < this.model.getData().mappings.length; i++) {
						if (!(this.model.getData().mappings[i].sourceElement === "" || this.model.getData().mappings[i].sourceElement === undefined)) {
							this.model.getData().isConstant = false;
							break;
						}
					}
					if (this.model.getData().isConstant) {
						this.model.getData().dataTypes = this.dataTypes;
					} else {
						this.model.getData().dataTypes = undefined;
					}
				}
				this.model.updateBindings();
				this.model.updateBindings();
				this.loButtonOK.setEnabled(true);
				if (newName === "" || this.nameField.getValueState() === "Error" || (this.lengthText.getEnabled() && this.lengthText.getValueState() ===
					"Error") || (this.scaleText.getEnabled() && this.scaleText.getValueState() === "Error")) {
					this.loButtonOK.setEnabled(false);
				}
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
					widths: ["20%", "80%"]
				});

				generalMatrixLayout.createRow(null);

				var nameLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_name"),
					required: true
				}).addStyleClass("labelFloat");
				this.nameField = new sap.ui.commons.TextField({
					width: "90%",
					value: "{/name}",
					enabled: that.isCreate,
					liveChange: function(event) {
						var value = event.getParameter("liveValue");
						var result = CalcViewEditorUtil.checkRenameElement(value, that.element, that.viewNode, that.columnView);
						if (result.message && ((that.element && value !== that.element.name) || !that.element)) {
							var message = result.messageObjects ? resourceLoader.getText(result.message, result.messageObjects) : result.message;
							this.setTooltip(message);
							this.setValueState(sap.ui.core.ValueState.Error);
						} else {
							this.setTooltip(null);
							this.setValueState(sap.ui.core.ValueState.None);
						}
						that.update(value);
					}
				});

				generalMatrixLayout.createRow(nameLabel, this.nameField);

				var dataTypeLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_data_type"),
					required: true
				}).addStyleClass("labelFloat");

				var dataTypeCombo = new sap.ui.commons.DropdownBox({
					width: "90%",
					selectedKey: "{/primitiveType}",
					enabled: "{/isConstant}",
					change: function(event) {
						var selecetdKey = event.getSource().getSelectedKey();
						if (selecetdKey === "ALPHANUM" || selecetdKey === "DECIMAL" || selecetdKey === "FLOAT" || selecetdKey === "NUMERIC" || selecetdKey ===
							"NVARCHAR" || selecetdKey === "VARCHAR" || selecetdKey === "VARBINARY") {
							if (selecetdKey === "DECIMAL") { // scale validation
								if (!CalcViewEditorUtil.validateNumber(that.model.getData().scale) && that.model.getData().scale !== undefined) {
									that.scaleText.setValueState(sap.ui.core.ValueState.Error);
								} else {
									that.scaleText.setValueState(sap.ui.core.ValueState.None);
								}
								if (!CalcViewEditorUtil.validateDataTypeLength(that.model.getData().length, selecetdKey) && that.model.getData().scale !==
									undefined) {
									that.lengthText.setValueState(sap.ui.core.ValueState.Error);
								} else {
									that.lengthText.setValueState(sap.ui.core.ValueState.None);
								}
							} else {
								that.model.getData().scale = undefined;
								if (!CalcViewEditorUtil.validateDataTypeLength(that.model.getData().length, selecetdKey)) {
									that.lengthText.setValueState(sap.ui.core.ValueState.Error);
								} else {
									that.lengthText.setValueState(sap.ui.core.ValueState.None);
								}
							}

						} else {
							that.model.getData().length = undefined;
							that.model.getData().scale = undefined;
							that.lengthText.setValueState("None");
							that.scaleText.setValueState("None");
						}
						that.update();
					}
				});
				var dataTypeListItem = new sap.ui.core.ListItem({});
				dataTypeListItem.bindProperty("text", "datatype");
				dataTypeListItem.bindProperty("key", "datatype");

				dataTypeCombo.bindItems({
					path: "/dataTypes",
					template: dataTypeListItem
				});

				generalMatrixLayout.createRow(dataTypeLabel, dataTypeCombo);

				var lengthLabel = new sap.ui.commons.Label({
					//width: "25%",
					text: resourceLoader.getText("tit_length"),
					textAlign: sap.ui.core.TextAlign.Right
				}).addStyleClass("labelFloat");

				this.lengthText = new sap.ui.commons.TextField({
					width: "90%",
					value: "{/length}",

					liveChange: function(event) {
						var value = event.getParameter("liveValue");
						var dataType = dataTypeCombo.getSelectedKey();
						if (!CalcViewEditorUtil.validateDataTypeLength(value, dataType)) {
							this.setValueState(sap.ui.core.ValueState.Error);
						} else {
							this.setValueState(sap.ui.core.ValueState.None);
						}
						that.update();
					},
					enabled: {
						path: "/primitiveType",
						formatter: function(primitiveType) {
							if (primitiveType === "ALPHANUM" || primitiveType === "DECIMAL" || primitiveType === "FLOAT" || primitiveType === "NUMERIC" ||
								primitiveType === "NVARCHAR" || primitiveType === "VARCHAR" || primitiveType === "VARBINARY") {
								return true;
							}
							return false;
						}
					}
				});

				var scaleLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_scale"),
					//width: "24%",
					textAlign: sap.ui.core.TextAlign.Right
				}).addStyleClass("labelFloat");
				this.scaleText = new sap.ui.commons.TextField({
					width: "90%",
					value: "{/scale}",
					liveChange: function(event) {
						var value = event.getParameter("liveValue");
						if (!CalcViewEditorUtil.validateNumber(value) && value !== "") {
							this.setValueState(sap.ui.core.ValueState.Error);
						} else {
							this.setValueState(sap.ui.core.ValueState.None);
						}
						that.update();
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
				});

				/*var cell = new sap.ui.commons.layout.MatrixLayoutCell();
				cell.addContent(lengthLabel);
				cell.addContent(this.lengthText);
				var cell1 = new sap.ui.commons.layout.MatrixLayoutCell();
				cell1.addContent(scaleLabel);
				cell1.addContent(this.scaleText);*/

				generalMatrixLayout.createRow( lengthLabel, this.lengthText);
				generalMatrixLayout.createRow( scaleLabel, this.scaleText);

				//generalMatrixLayout.createRow(null);
				return generalMatrixLayout;

			},

			getMappingContainer: function() {

				var that = this;

				var table = new sap.ui.table.Table({
					visibleRowCount: 6,
					width: "100%",
					selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
					visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto

				});

				table.addStyleClass("calcViewTableInDialog");

				table.bindRows("/mappings");

				table.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_source_model")
					}),
					template: new sap.ui.commons.Label({
						text: {
							path: "input",
							formatter: function(input) {
								if (input) {
									return CalcViewEditorUtil.getInputName(input);
								}

							}
						},
						icon: {
							path: "input",
							formatter: function(input) {
								if (input) {
									return CalcViewEditorUtil.getInputImagePath(input);
								}

							}
						}
					}),
					width: "150px"
				}));

				var sourceElementItemTemplate = new sap.ui.core.ListItem();
				sourceElementItemTemplate.bindProperty("text", "elementName");

				var sourceElementTemplate = new sap.ui.commons.DropdownBox({
					value: "{sourceElement}",
					change: function(event) {
						var source = event.getSource();
						var object = source.getBindingContext().getObject();
						var value = event.getParameter("newValue");
						if (value === "") {
							object.isNull = true;
						} else {
							object.isNull = false;
							object.constantValue = undefined;
						}
						// Update is called twice to enable Ok Button
						setTimeout(function() {
							that.update()
						}, 100);
						that.update();
					}
				});

				table.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_source_column")
					}),
					template: sourceElementTemplate.bindItems("sourceElementList", sourceElementItemTemplate),
					width: "150px"
				}));

				table.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_constant_value")
					}),
					template: new sap.ui.commons.TextField({
						value: "{constantValue}",
						change: function(event) {
							var source = event.getSource();
							var object = source.getBindingContext().getObject();
							var value = event.getParameter("text");
							if (value === "") {
								object.isNull = true;
							} else {
								object.isNull = false;
								object.sourceElement = "";
							}
							// Update is called twice to enable Ok Button
							setTimeout(function() {
								that.update()
							}, 100);
							that.update();
						}
					}),
					width: "150px"
				}));

				table.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_is_null")
					}),
					template: new sap.ui.commons.CheckBox({
						//change: changeKeepFlag,
						checked: "{isNull}",
						change: function(event) {
							var source = event.getSource();
							var object = source.getBindingContext().getObject();
							var value = event.getParameter("checked");
							if (value) {
								object.sourceElement = "";
								object.constantValue = undefined;
							} else {}
							// Update is called twice to enable Ok Button
							setTimeout(function() {
								that.update()
							}, 100);
							that.update();
						}
					}),
					width: "100px"
				}));

				return table;
			},

			createModel: function() {
				var that = this;

				var isConstant = true;

				var data = {
					mappings: []
				};

				if (this.element) {
					data.name = this.element.name;

					this.viewNode.inputs.foreach(function(input) {
						var sourceElementList = [{
							elementName: ""
                        }];

						input.getSource().elements.foreach(function(element) {
							sourceElementList.push({
								elementName: element.name
							});
						});

						input.mappings.foreach(function(mapping) {
							if (mapping.targetElement === that.element) {
								if (mapping.sourceElement) {
									isConstant = false;
								}
								var mappingData = {
									input: input,
									mappingObject: mapping,
									sourceElementList: sourceElementList,
									isNull: mapping.isNull,
									sourceElement: mapping.sourceElement ? mapping.sourceElement.name : undefined,
									constantValue: mapping.value
								};
								data.mappings.push(mappingData);
							}
						});

					});
					if (isConstant) {
						data.primitiveType = this.element.inlineType ? this.element.inlineType.primitiveType : undefined;
						data.length = this.element.inlineType ? this.element.inlineType.length : undefined;
						data.scale = this.element.inlineType ? this.element.inlineType.scale : undefined;
					}

				} else {

					this.viewNode.inputs.foreach(function(input) {
						var sourceElementList = [{
							elementName: ""
                        }];

						input.getSource().elements.foreach(function(element) {
							sourceElementList.push({
								elementName: element.name
							});
						});

						var mapping = {
							input: input,
							sourceElementList: sourceElementList,
							isNull: true
						};
						data.mappings.push(mapping);
					});
					data.primitiveType = "VARCHAR";
					data.length = "1";
					//that.nameField.setValueState(sap.ui.core.ValueState.Error);
					//that.lengthText.setValueState(sap.ui.core.ValueState.Error);
				}

				if (isConstant) {
					data.dataTypes = this.dataTypes;
				}

				data.isConstant = isConstant;

				return data;
			}

		};
		return ConstantMappingDialog;
	});
