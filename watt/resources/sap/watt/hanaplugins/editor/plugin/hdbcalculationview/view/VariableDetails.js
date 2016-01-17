/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader",
        "../viewmodel/commands",
        "../base/modelbase",
        "../dialogs/NewFindDialog",
        "../viewmodel/model",
        "../viewmodel/ModelProxyResolver",
        "./dialogs/SqlColumnValueHelpDialog",
        "../sharedmodel/sharedmodel",
        "./IconComboBox",
        "./CustomValueHelpField",
        "./OutputToolPopup",
        "./CalcViewEditorUtil"
    ],
	function(ResourceLoader, commands, modelbase, NewFindDialog, model, ModelProxyResolver, SqlColumnValueHelpDialog, sharedmodel, IconComboBox,
		CustomValueHelpField, OutputToolPopup, CalcViewEditorUtil) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
		var VariableDetails = function(attributes) {
			this.undoManager = attributes.undoManager;
			this.model = attributes.model;
			this.context = attributes.context;
			this.gotoExpressionEditor = attributes.gotoExpressionEditor;
			this.updateMasterList = attributes.updateMasterList;
			this.isNew;
			this.variable;
			this.variableData;
			this.variableModel = new sap.ui.model.json.JSONModel();
			this.topVerticalLayout;
			this.modelUpDated = true;
			this.updateExpressionButtonSelection;

		};
		VariableDetails.prototype = {
			execute: function(commands) {
				var that = this;
				if (that.undoManager) {
					// this.modelUpDated = true;
					if (commands instanceof Array) {
						var result = that.undoManager.execute(new modelbase.CompoundCommand(commands));
						// this.modelUpDated = false;
						return result
					} else {
						var result = that.undoManager.execute(commands);
						// this.modelUpDated = false;
						return result;
					}

				}
			},
			modelChanged: function() {
				if (this.modelUpDated) {
					this.updateDetails(this.variable, this.isNew);
				}
			},
			subScribeEvents: function() {
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CHANGED, this.modelChanged, this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_CREATED, this.modelChanged, this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_DELETED, this.modelChanged, this);
				if (this.variable) {
					this.variable.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DEFAULTRANGE_CREATED, this.modelChanged, this);
					this.variable.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DEFAULTRANGE_DELETED, this.modelChanged, this);
					this.variable.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DEFAULTRANGE_CHANGED, this.modelChanged, this);
				}
			},
			unSubScribeEvents: function() {
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_CHANGED, this.modelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_CREATED, this.modelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_DELETED, this.modelChanged, this);
				if (this.variable) {
					this.variable.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DEFAULTRANGE_CREATED, this.modelChanged, this);
					this.variable.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DEFAULTRANGE_DELETED, this.modelChanged, this);
					this.variable.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DEFAULTRANGE_CHANGED, this.modelChanged, this);
				}
			},
			getContent: function() {
				return this.topVerticalLayout;
			},
			updateDetails: function(variable, isNew) {
				this.isNew = isNew;
				if (variable && variable.isVariable) {
					if (!this.topVerticalLayout || !this.topVerticalLayout.getContent()) {
						this.variable = variable;
						this.buildVariableData(variable);
						this.variableModel.setData(this.variableData);
						this.getDetailsContent();
						this.variableModel.updateBindings(true);
						if (this.updateExpressionButtonSelection) {
							this.updateExpressionButtonSelection();
						}
						this.unSubScribeEvents();
						this.subScribeEvents();
					} else {
						this.variable = variable;
						this.buildVariableData(variable);
						this.variableModel.setData(this.variableData);
						this.variableModel.updateBindings(true);
						if (this.updateExpressionButtonSelection) {
							this.updateExpressionButtonSelection();
						}
						this.unSubScribeEvents();
						this.subScribeEvents();
					}
				}
			},
			getElement: function(attributes) {
				if (attributes.inputKey || attributes.inputKey === 0) {
					var input = attributes.selectedView.inputs.getAt(attributes.inputKey);
					if (input && input.getSource()) {
						return input.getSource().elements.get(attributes.elementName);
					}
				} else {
					return attributes.selectedView.elements.get(attributes.elementName);
				}
			},
			getViewNodeElements: function() {
				var elements = [];
				var array = this.model.columnView.getDefaultNode().elements.toArray();
				for (var element in array) {
					if (array[element].aggregationBehavior === model.AggregationBehavior.NONE || array[element].aggregationBehavior === model.AggregationBehavior
						.NONE) {
						var elementExist = false;
						var assignArray = this.variable.assignedElements.toArray();
						for (var assignElement in assignArray) {
							if (array[element] === assignArray[assignElement]) {
								elementExist = true;
								break;
							}
						}
						if (!elementExist && !array[element].hidden) {
							if (!this.isBasedOnElementProxy(array[element], this.model.columnView, this.model.columnView.getDefaultNode())) {
								elements.push({
									element: array[element]
								});
							}
						}
					}
				}
				return elements;
			},
			getAssignedElements: function() {
				var assignedElements = [];
				if (this.variable.assignedElements && this.variable.assignedElements.count() > 0) {
					this.variable.assignedElements.foreach(function(assignedElement) {
						assignedElements.push({
							assignedElement: assignedElement
						});
					});
				}
				return assignedElements;
			},
			getDefaultRanges: function(parameter) {
				var defaultRanges = [];
				parameter.defaultRanges.foreach(function(defaultRange) {
					defaultRanges.push({
						defaultRange: defaultRange
					});
				});
				return defaultRanges;
			},
			getHierarchies: function(variable) {

				var that = this;
				var hierarchies = [];
				hierarchies.push({
					hierarchy: undefined
				});
				var typeOfElement = variable.typeOfElement;
				if (typeOfElement && !variable.externalTypeOfEntity) {
					this.model.columnView.inlineHierarchies.foreach(function(inlineHierarchy) {
						if (inlineHierarchy.type === "LeveledHierarchy") {
							if (inlineHierarchy.levels && inlineHierarchy.levels.count() > 0) {
								var level = inlineHierarchy.levels.getAt(inlineHierarchy.levels.count() - 1);
								if (level && level.element === typeOfElement) {
									if (!that.isBasedOnElementProxy(inlineHierarchy, that.model.columnView, that.model.columnView.getDefaultNode())) {
										hierarchies.push({
											hierarchy: inlineHierarchy
										});
									}

								}
							}
						} else {
							inlineHierarchy.parentDefinitions.foreach(function(parentDefinition) {
								if (typeOfElement === parentDefinition.element) {
									if (!that.isBasedOnElementProxy(inlineHierarchy, that.model.columnView, that.model.columnView.getDefaultNode())) {
										hierarchies.push({
											hierarchy: inlineHierarchy
										});
									}

								}
							});
						}
					});
					var defaultNode = that.model.columnView.getDefaultNode();
					defaultNode.inputs.foreach(function(input) {
						if (input.getSource().inlineHierarchies) {
							input.getSource().inlineHierarchies.foreach(function(inlineHierarchy) {
								if (inlineHierarchy.type === "LeveledHierarchy") {
									if (inlineHierarchy.levels && inlineHierarchy.levels.count() > 0) {
										var level = inlineHierarchy.levels.getAt(inlineHierarchy.levels.count() - 1);
										if (level && level.element === typeOfElement) {
											if (!that.isBasedOnElementProxy(inlineHierarchy, that.model.columnView, that.viewNode)) {
												hierarchies.push({
													hierarchy: inlineHierarchy
												});
											}
										}
									}
								} else {
									inlineHierarchy.parentDefinitions.foreach(function(parentDefinition) {
										if (typeOfElement === parentDefinition.element) {
											if (!that.isBasedOnElementProxy(inlineHierarchy, that.model.columnView, that.viewNode)) {
												hierarchies.push({
													hierarchy: inlineHierarchy
												});
											}
										}
									});
								}
							});
						}
					});
				}
				return hierarchies;
			},
			buildVariableData: function(variable) {
				var that = this;
				if (variable) {
					this.variableData = {
						name: variable.name,
						label: variable.label,
						isMandatory: variable.mandatory,
						isMultipleSelections: variable.multipleSelections,
						selectionType: variable.selectionType,
						valueHelpElement: variable.typeOfElement ? variable.typeOfElement : variable.externalTypeOfElement,
						entity: variable.externalTypeOfEntity ? variable.externalTypeOfEntity : that.model.columnView,
						elements: that.getReferenceElements(),
						defaultValue: variable.defaultValue,
						defaultExpression: variable.defaultExpression ? variable.defaultExpression.formula : "",
						assignedElements: this.getAssignedElements(),
						viewNodeElements: this.getViewNodeElements(),
						operators: this.getOperatorsData(variable),
						defaultRanges: this.getDefaultRanges(variable),
						hierarchies: this.getHierarchies(variable),
						hierarchyElement: variable.hierarchy
					};
				}
			},
			getOperatorsData: function(parameter) {
				if (parameter.selectionType === model.SelectionType.SINGLE) {
					return [{
						operator: "Equal",
						key: sharedmodel.ValueFilterOperator.EQUAL
                    }];
				} else if (parameter.selectionType === model.SelectionType.INTERVAL) {
					return [{
						operator: "Between",
						key: sharedmodel.ValueFilterOperator.BETWEEN
                    }];
				}
				var operators = CalcViewEditorUtil.getOperatorsData();
				operators.push({
					operator: "Not Equal",
					key: "Not Equal"
				});
				
				/*  operators.push({
                    operator: "Is Not Null",
                    key: "Is Not Null"
                }); */
				return operators;
			},
			getReferenceElements: function() {
				var that = this;
				var referenceElements = [];
				if (that.variable) {
					if (that.variable.externalTypeOfEntity) {
						for (var element in that.variable.externalTypeOfEntity.elements._values) {
							if (!element.hidden && (!element.aggregationBehavior || element.aggregationBehavior === model.AggregationBehavior.NONE)) {
								if (!this.isBasedOnElementProxy(that.variable.externalTypeOfEntity.elements._values[element], that.variable.externalTypeOfEntity)) {
									referenceElements.push({
										element: that.variable.externalTypeOfEntity.elements._values[element]
									});
								}
							}
						}
					} else {
						var array = that.model.columnView.getDefaultNode().elements.toArray();
						for (var column in array) {
							if (!array[column].hidden && (!array[column].aggregationBehavior || array[column].aggregationBehavior === model.AggregationBehavior.NONE)) {
								if (!this.isBasedOnElementProxy(array[column], that.model.columnView, that.model.columnView.getDefaultNode())) {
									referenceElements.push({
										element: array[column]
									});
								}
							}
						}
					}
				}
				return referenceElements;
			},

			destroyContent: function() {
				if (this.topVerticalLayout) {
					this.topVerticalLayout.destroyContent();
				}
				this.unSubScribeEvents();
			},

			getDetailsContent: function() {
				var that = this;
				if (!that.topVerticalLayout) {
					that.topVerticalLayout = new sap.ui.commons.layout.VerticalLayout({});
				}
				//  that.topVerticalLayout.addStyleClass("backGroundColor");

				this.topVerticalLayout.addStyleClass("detailsMainDiv");
				this.topVerticalLayout.addStyleClass("customProperties");
				var toolbarMatrixlayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%"
				});
				toolbarMatrixlayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
					content: [new sap.ui.commons.Label({
						text: {
							path: "name",
							formatter: function(name) {
								return resourceLoader.getText("txt_details") + " " + that.variable.name;
							}
						},
						design: sap.ui.commons.LabelDesign.Bold
					})],
					hAlign: sap.ui.commons.layout.HAlign.Center,
					vAlign: sap.ui.commons.layout.VAlign.Center
				}).addStyleClass("detailsHeaderStyle"));

				that.topVerticalLayout.addContent(toolbarMatrixlayout);

				var mainVerticalLayout = new sap.ui.commons.layout.VerticalLayout({});

				that.topVerticalLayout.addContent(mainVerticalLayout);

				var headMatrixLayout = new sap.ui.commons.layout.MatrixLayout();
				headMatrixLayout.addStyleClass("headerHeight");
				var headerMatrixLayoutCell = new sap.ui.commons.layout.MatrixLayoutCell({
					vAlign: sap.ui.commons.layout.VAlign.Begin,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}).addStyleClass("parameterHeaderStyle");

				var icon = new sap.ui.commons.Image({
					src: resourceLoader.getImagePath("Parameter.png")
				});
				var headerName = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_general"),
					design: sap.ui.commons.LabelDesign.Bold
				});
				//   headerName.bindProperty("text", "IP1");

				//headerMatrixLayoutCell.addContent(icon);
				headerMatrixLayoutCell.addContent(new sap.ui.commons.Label({
					width: "10px"
				}));
				headerMatrixLayoutCell.addContent(headerName);

				headMatrixLayout.createRow(headerMatrixLayoutCell);

				mainVerticalLayout.addContent(headMatrixLayout);

				var nameMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					widths: ["5px", "30px", "60px", "10px", "10px"]
				});
				// nameMatrixLayout.addStyleClass("layoutMargin");

				nameMatrixLayout.createRow(null);

				var nameLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_name"),
					required: true
				}).addStyleClass("labelFloat");
				var nameField = new sap.ui.commons.TextField({
					width: "80%",
					value: "{/name}",
					change: function(oevent) {
						this.setValueState(sap.ui.core.ValueState.None);
						this.setTooltip(null);
						var nameValue = oevent.getParameter("newValue");

						var errorValue = that.isNameValid(nameValue);
						if (!errorValue) {
							if (that.variable.name !== nameValue) {
								if (that.variableData.label === "") {
									that.variableData.label = nameValue;
								}
								that.execute(new commands.ChangeParameterPropertiesCommand(that.variable.name, {
									objectAttributes: {
										name: nameValue,
										label: that.variableData.label === "" ? nameValue : that.variableData.label
									}
								}));
								that.variableModel.updateBindings(true);
								that.updateMasterList(that.variable);

							}
						} else {
							var message = errorValue;
							var messageObjects = ["'" + resourceLoader.getText("tit_name") + "'", "'" + that.variable.name + "'"];
							message = resourceLoader.getText("msg_message_toast_variable_error", messageObjects) + " (" + message + ")";
							this.setValue(that.variable.name);
							jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
							sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show(message, {
								of: that.topVerticalLayout,
								offset: "-10px -100px"
							});
						}
					},
					liveChange: function(event) {
						var value = event.getParameter("liveValue");
						var errorValue = that.isNameValid(value);
						if (errorValue) {
							this.setTooltip(errorValue);
							this.setValueState(sap.ui.core.ValueState.Error);
						} else {
							this.setTooltip(null);
							this.setValueState(sap.ui.core.ValueState.None);
						}
					}
				}).addStyleClass("dummyTest1");
				nameMatrixLayout.createRow(null, nameLabel, nameField);

				var desLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_label")
				}).addStyleClass("labelFloat");
				var desField = new sap.ui.commons.TextField({
					width: "80%",
					value: "{/label}",
					change: function(oevent) {
						var desValue = oevent.getParameter("newValue");
						if (that.variable.label !== desValue) {
							that.execute(new commands.ChangeParameterPropertiesCommand(that.variable.name, {
								objectAttributes: {
									label: desValue
								}
							}));
							that.updateMasterList(that.variable);
						}

					}
				}).addStyleClass("dummyTest2");

				nameMatrixLayout.createRow(null, desLabel, desField);

				var selectionTypeLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_selection_type")
				}).addStyleClass("labelFloat");
				var selectionTypeCombo = new sap.ui.commons.DropdownBox({
					width: "80%",
					value: "Single Value",
					selectedKey: "{/selectionType}",
					change: function(oevent) {
						var selecetdKey = oevent.getSource().getSelectedKey();
						var commandsList = [];
						if (that.variable.defaultRanges.count() > 0) {
							for (var i = 0; i < that.variable.defaultRanges.count(); i++) {
								commandsList.push(new modelbase.DeleteCommand(that.variable.defaultRanges.getAt(i), false));
							}
						}
						commandsList.push(new commands.CreateParameterDefaultRangeCommand(that.variable.name, {
							lowExpression: false,
							lowValue: "",
							highValue: "",
							including: true,
							operator: selecetdKey === model.SelectionType.INTERVAL ? sharedmodel.ValueFilterOperator.BETWEEN : sharedmodel.ValueFilterOperator
								.EQUAL
						}));

						commandsList.push(new commands.ChangeParameterPropertiesCommand(that.variable.name, {
							objectAttributes: {
								selectionType: selecetdKey
							}
						}));

						if (commandsList.length > 0) {
							that.execute(commandsList);
						}

					}
				}).addStyleClass("dummyTest3");
				selectionTypeCombo.addItem(new sap.ui.core.ListItem({
					text: "Single Value",
					key: model.SelectionType.SINGLE
				}));

				selectionTypeCombo.addItem(new sap.ui.core.ListItem({
					text: "Interval",
					key: model.SelectionType.INTERVAL
				}));
				selectionTypeCombo.addItem(new sap.ui.core.ListItem({
					text: "Range",
					key: model.SelectionType.RANGE
				}));

				nameMatrixLayout.createRow(null, selectionTypeLabel, selectionTypeCombo);

				var mandateCheck = new sap.ui.commons.CheckBox({
					width: "30%",
					text: resourceLoader.getText("tit_is_mandatory"),
					checked: "{/isMandatory}",
					change: function(oevent) {
						that.execute(new commands.ChangeParameterPropertiesCommand(that.variable.name, {
							objectAttributes: {
								mandatory: oevent.getSource().getChecked()
							}
						}));
					}
				}).addStyleClass("dummyTest4");

				var multipleEntries = new sap.ui.commons.CheckBox({
					text: resourceLoader.getText("tit_multiple_entries"),
					checked: "{/isMultipleSelections}",
					change: function(oevent) {
						var commandsList = [];
						if (!oevent.getSource().getChecked()) {
							if (that.variable.defaultRanges.count() > 1) {
								for (var i = 1; i < that.variable.defaultRanges.count(); i++) {
									commandsList.push(new modelbase.DeleteCommand(that.variable.defaultRanges.getAt(i), false));
								}
							}
							if (that.variable.defaultRanges.count() < 1) {
								commandsList.push(new commands.CreateParameterDefaultRangeCommand(that.variable.name, {
									lowExpression: false,
									lowValue: "",
									including: true,
									operator: that.variable === model.SelectionType.INTERVAL ? sharedmodel.ValueFilterOperator.BETWEEN : sharedmodel.ValueFilterOperator
										.EQUAL
								}));
							}
						}
						commandsList.push(new commands.ChangeParameterPropertiesCommand(that.variable.name, {
							objectAttributes: {
								multipleSelections: oevent.getSource().getChecked()
							}
						}));
						if (commandsList.length > 0) {
							that.execute(commandsList);
						}
					}
				}).addStyleClass("dummyTest5");

				var checkBoxCell = new sap.ui.commons.layout.MatrixLayoutCell();
				checkBoxCell.addContent(mandateCheck);
				checkBoxCell.addContent(multipleEntries);
				nameMatrixLayout.createRow(null, null, checkBoxCell);

				var viewLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_view_table_value_help"),
					required: true
				}).addStyleClass("labelFloat");

				var viewText = new sap.ui.commons.TextField({
					width: "73%"
				}).addStyleClass("inputBorder");
				viewText.bindProperty("value", {
					path: "/entity",
					formatter: function(entity) {
						if (entity) {
							if (entity === that.model.columnView) {
								return entity.name + "(Current View)";
							} else {
								if (entity.packageName) {
									return entity.fqName;
								} else {
									if (entity.physicalSchema) {
										if (entity.schemaName === entity.physicalSchema) {
											return entity.fqName;
										} else {
											var schemaName = entity.schemaName + "(" + entity.physicalSchema + ")";
											return "\"" + schemaName + "\"" + "." + entity.name;
										}
									} else {
										return entity.fqName;
									}
								}
							}
						}
						return "";

					}
				});
				var viewButton = new sap.ui.commons.Button({
					text: "...",
					width: "7%",
					press: function(oevent) {

						var findDialog = new NewFindDialog("", {
							multiSelect: false,
							noOfSelection: 1,
							context: that.context,
							types: ["TABLE", "CALCULATIONVIEW", "ATTRIBUTEVIEW", "ANALYTICVIEW"],
							onOK: function(selectedResource) {
								var selectedView;
								if (selectedResource) {
									var viewDetails = selectedResource[0];
									viewDetails.viewNodeName = that.model.columnView.viewNodes.toArray()[0].name;
									//viewDetails.context = self.editor.extensionParam.builder._context;

									var changeParameterCommand = new commands.ChangeParameterPropertiesCommand(that.variable.name, {
										externalTypeOfEntity: viewDetails,
										hierarchyName: undefined
									});
									var parameter = that.execute(changeParameterCommand);

									var updateCombo = function(event) {

										that.variableData.elements.splice(0, that.variableData.elements.length);
										Array.prototype.slice.call(that.variableData.elements, 0);
										if (selectedView) {
											var array = selectedView.elements.toArray();
											for (var elementName in array) {
												var element = array[elementName];
												if (!element.hidden && (!element.aggregationBehavior || element.aggregationBehavior === model.AggregationBehavior.NONE)) {
													that.variableData.elements.push({
														element: element
													});
												}
											}
											that.variableModel.updateBindings();
											referenceCombo.bindItems({
												path: "/elements",
												template: referenceListItem
											});
										}
									}

									selectedView = that.variable.externalTypeOfEntity;
									that.variableData.entity = selectedView;
									that.variableData.valueHelpElement = undefined;
									referenceCombo.setValue("");
									var packageName = viewDetails.packageName ? viewDetails.packageName : viewDetails.schemaName;
									viewText.setValue(packageName + "." + viewDetails.name);
									ModelProxyResolver.ProxyResolver.resolve(that.model, that.context, updateCombo);

									that.variableModel.updateBindings(true);

								}
							}
						});

					}
				}).addStyleClass("sematicsValueHelpButton");

				nameMatrixLayout.createRow(null, viewLabel, new sap.ui.commons.layout.MatrixLayoutCell({
					content: [viewText, viewButton]
				}));
				// nameMatrixLayout.createRow(null,viewLabel,new sap.ui.commons.layout.MatrixLayoutCell({content:[viewText,viewButton]}));

				var referenceLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_reference_column"),
					required: true
				}).addStyleClass("labelFloat");

				var referenceColumnField = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomValueHelpField({
					width: "80%",
					canedit: false,
					valueHelpRequest: function(event) {
						var selectedView = that.model.columnView.getDefaultNode();
						if (that.variable.externalTypeOfEntity) {
							selectedView = that.variable.externalTypeOfEntity;
						}
						var selectedElement = function(attributes) {
							attributes.selectedView = selectedView;
							var element = that.getElement(attributes);
							var entityFQN;
							if (attributes.inputKey) {
								var input = attributes.selectedView.inputs.getAt(attributes.inputKey);
								if (input && input.getSource()) {
									entityFQN = input.getSource().fqName;
								}
							}
							if (element) {
								var hierarchyName;
								if (that.isContainsHierarchy(element, that.variable.hierarchy)) {
									hierarchyName = that.variable.hierarchy.name;
								}
								var propCommand = new commands.ChangeParameterPropertiesCommand(that.variable.name, {
									typeAttributes: {
										primitiveType: element.inlineType ? element.inlineType.primitiveType : undefined,
										length: element.inlineType ? element.inlineType.length : undefined,
										scale: element.inlineType ? element.inlineType.scale : undefined
									},
									typeOfElementName: element.name,
									entityFQN: entityFQN,
									hierarchyName: hierarchyName
								});
								if (selectedView === that.model.columnView.getDefaultNode()) {
									var addAssignCommand = new commands.AddParamAssignedElemCommand(that.variable.name, {
										elementName: element.name,
										entityFQN: entityFQN,
										nextElementName: undefined,
										nextElementEntityFQN: undefined
									});
								}
								if (that.variableData.assignedElements.length > 0 || !addAssignCommand) {
									that.execute(propCommand);
								} else {
									that.execute([propCommand, addAssignCommand]);
									that.variableData.assignedElements = that.getAssignedElements();
								}
								that.variableData.valueHelpElement = element;
								that.variableModel.updateBindings(true);
							}
						};
						var toopPopup = new OutputToolPopup({
							viewNode: selectedView,
							opener: referenceColumnField,
							callback: selectedElement
						});
						toopPopup.open();
					}
				}).addStyleClass("dummyTest6");
				referenceColumnField.bindProperty("value", {
					path: "/valueHelpElement",
					formatter: function(valueHelpElement) {
						if (valueHelpElement) {
							if (referenceColumnField.getTooltip() !== null) {
								CalcViewEditorUtil.clearErrorMessageTooltip(referenceColumnField);
							}
							if (valueHelpElement.$getContainer() instanceof model.Entity) {
								return valueHelpElement.$getContainer().name + "." + valueHelpElement.name;
							}
							return valueHelpElement.name;
						} else {
							if (referenceColumnField.getValueState() === sap.ui.core.ValueState.None && !that.isNew) {
								CalcViewEditorUtil.showErrorMessageTooltip(referenceColumnField, resourceLoader.getText("msg_field_not_empty"));
							} else if (referenceColumnField.getTooltip() !== null) {
								CalcViewEditorUtil.clearErrorMessageTooltip(referenceColumnField);
							}
							return "";
						}
					}
				});

				referenceColumnField.attachBrowserEvent("keypress", function(e) {
					e.preventDefault();
				});

				var oImage = new sap.ui.commons.Image({
					src: {
						path: "/valueHelpElement",
						formatter: function(valueHelpElement) {
							if (valueHelpElement) {
								return that.getIconPath(valueHelpElement, that.variableData.entity);
							}
						}
					}
					//src: resourceLoader.getImagePath("Attribute.png")
				});
				var referenceCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
					width: "80%",
					canedit: false,
					selectedKey: {
						path: "/valueHelpElement",
						formatter: function(valueHelpElement) {
							if (valueHelpElement) {
								CalcViewEditorUtil.clearErrorMessageTooltip(referenceCombo);
								return valueHelpElement.name;

							} else {
								referenceCombo.setValue("");
								if (referenceCombo.getValueState() === sap.ui.core.ValueState.None && !that.isNew) {
									CalcViewEditorUtil.addErrorMessageTooltip(referenceCombo, resourceLoader.getText("msg_field_not_empty"));
								} else {
									CalcViewEditorUtil.clearErrorMessageTooltip(referenceCombo);
								}
							}
						}

					},
					value: {
						path: "/valueHelpElement",
						formatter: function(valueHelpElement) {
							if (valueHelpElement) {
								return valueHelpElement.name;
							} else {
								return "";
							}
						}
					},
					change: function(oevent) {
						if (that.variableData.entity && (that.variableData.entity !== that.model.columnView)) {
							var externalTypeOfElement = that.variableData.entity.elements._values[oevent.getParameter("newValue")];
							if (externalTypeOfElement) {
								that.execute(new commands.ChangeParameterPropertiesCommand(that.variable.name, {
									typeOfElementName: externalTypeOfElement.name,
									typeAttributes: {
										primitiveType: externalTypeOfElement.inlineType.primitiveType,
										length: externalTypeOfElement.inlineType.length,
										scale: externalTypeOfElement.inlineType.scale
									},
									hierarchyName: undefined
								}));
								that.variableData.valueHelpElement = externalTypeOfElement;
								that.variableModel.updateBindings(true);
							}
						} else {
							var typeOfElement = that.model.columnView.getDefaultNode().elements._values[oevent.getParameter("newValue")];
							if (typeOfElement) {
								var hierarchyName;
								if (that.isContainsHierarchy(typeOfElement, that.variable.hierarchy)) {
									hierarchyName = that.variable.hierarchy.name;
								}
								var propCommand = new commands.ChangeParameterPropertiesCommand(that.variable.name, {
									typeOfElementName: typeOfElement.name,
									typeAttributes: {
										primitiveType: typeOfElement.inlineType.primitiveType,
										length: typeOfElement.inlineType.length,
										scale: typeOfElement.inlineType.scale
									},
									hierarchyName: hierarchyName
								});

								var addAssignCommand = new commands.AddParamAssignedElemCommand(that.variable.name, {
									elementName: typeOfElement.name,
									entityFQN: typeOfElement.$getContainer() instanceof model.ViewNode ? undefined : typeOfElement.$getContainer().fqName,
									nextElementName: undefined,
									nextElementEntityFQN: undefined
								});
								if (that.variableData.assignedElements.length > 0) {
									that.execute(propCommand);
								} else {
									that.execute([propCommand, addAssignCommand]);
									that.variableData.assignedElements = that.getAssignedElements();
								}
								that.variableData.valueHelpElement = typeOfElement;
								that.variableModel.updateBindings(true);
							}
						}
					}
					//  icon: oImage
				}).addStyleClass("borderIconCombo");

				var referenceListItem = new sap.ui.core.ListItem({});
				referenceListItem.bindProperty("text", {
					path: "element",
					formatter: function(element) {
						return element ? element.name : "";
					}
				});
				referenceListItem.bindProperty("icon", {
					path: "element",
					formatter: function(element) {
						if (element) {
							return that.getIconPath(element, that.variableData.entity);
						}
					}
				});
				referenceListItem.bindProperty("key", {
					path: "element",
					formatter: function(element) {
						return element ? element.name : "";
					}
				});

				var listBox = new sap.ui.commons.ListBox({
					displayIcons: true,
					items: {
						path: "/elements",
						template: referenceListItem
					}
				});
				referenceCombo.setListBox(listBox);
				/* referenceCombo.bindItems({
                    path: "/elements",
                    template: referenceListItem
                })*/

				nameMatrixLayout.createRow(null, referenceLabel, referenceColumnField);
				// nameMatrixLayout.createRow(null, null, referenceColumnField);

				var hierarchyLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("Hierarchy:")
				}).addStyleClass("labelFloat");
				var hierarchyImage = new sap.ui.commons.Image({
					src: {
						path: "/hierarchyElement",
						formatter: function(hierarchyElement) {
							if (hierarchyElement) {
								return getImagePath(hierarchyElement, that.variableData.entity);
							}
						}
					}
					//src: resourceLoader.getImagePath("Attribute.png")
				});
				var hierarchyCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
					width: "80%",
					canedit: false,
					selectedKey: {
						path: "/hierarchyElement",
						formatter: function(hierarchyElement) {
							if (hierarchyElement) {
								return hierarchyElement.name;
							}
						}

					},
					enabled: {
						path: "/hierarchies",
						formatter: function(hierarchies) {
							if (hierarchies && hierarchies.length > 1) {
								return true;
							}
							return false;
						}
					},
					value: {
						path: "/hierarchyElement",
						formatter: function(hierarchyElement) {
							if (hierarchyElement) {
								return hierarchyElement.name;
							} else {
								return " ";
							}
						}
					},
					change: function(event) {
						var newValue = event.getParameter("newValue");
						var selectedItem = event.getParameter("selectedItem");
						if (selectedItem) {
							var bindingContext = selectedItem.getBindingContext();
							if (bindingContext) {
								var hierarchyElement = bindingContext.getProperty("hierarchy");
								that.execute(new commands.ChangeParameterPropertiesCommand(that.variable.name, {
									hierarchyName: hierarchyElement ? hierarchyElement.name : undefined
								}));
							}
						}

					}
					//  icon: oImage
				}).addStyleClass("borderIconCombo");

				var hierarchyListItem = new sap.ui.core.ListItem({});
				hierarchyListItem.bindProperty("text", {
					path: "hierarchy",
					formatter: function(hierarchy) {
						return hierarchy ? hierarchy.name : " ";
					}
				});
				hierarchyListItem.bindProperty("icon", {
					path: "hierarchy",
					formatter: function(hierarchy) {
						if (hierarchy) {
							return hierarchy.type === "LeveledHierarchy" ? resourceLoader.getImagePath("Hierarchy.png") : resourceLoader.getImagePath(
								"ParentChildHierarchy.png");
						}
					}
				});
				hierarchyListItem.bindProperty("key", {
					path: "hierarchy",
					formatter: function(hierarchy) {
						return hierarchy ? hierarchy.name : " ";
					}
				});

				var hierarchyListBox = new sap.ui.commons.ListBox({
					displayIcons: true,
					items: {
						path: "/hierarchies",
						template: hierarchyListItem
					}
				});
				hierarchyCombo.setListBox(hierarchyListBox);
				/* referenceCombo.bindItems({
                    path: "/elements",
                    template: referenceListItem
                })*/

				nameMatrixLayout.createRow(null, hierarchyLabel, hierarchyCombo);

				/* 
                  var viewCell = new sap.ui.commons.layout.MatrixLayoutCell();

                viewCell.addContent(viewText);
                viewCell.addContent(viewButton);              
                var columnMatrixCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    colSpan: 2
                });
                columnMatrixCell.addContent(that.getColumnContainer());
                nameMatrixLayout.createRow(null, columnMatrixCell);
                */

				mainVerticalLayout.addContent(nameMatrixLayout);

				var expressionHeadLayout = new sap.ui.commons.layout.MatrixLayout();
				expressionHeadLayout.addStyleClass("headerHeight");
				var expressionHeadLayoutCell = new sap.ui.commons.layout.MatrixLayoutCell({
					vAlign: sap.ui.commons.layout.VAlign.Begin,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}).addStyleClass("parameterHeaderStyle");

				var expressionHeaderName = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_default_value"),
					design: sap.ui.commons.LabelDesign.Bold
				});
				//   headerName.bindProperty("text", "IP1");

				expressionHeadLayoutCell.addContent(new sap.ui.commons.Label({
					width: "10px"
				}));
				expressionHeadLayoutCell.addContent(expressionHeaderName);

				expressionHeadLayout.createRow(expressionHeadLayoutCell);

				mainVerticalLayout.addContent(expressionHeadLayout);

				var expressionMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					widths: ["10%", "80%"]
				});

				// expressionMatrixLayout.createRow(null, that.getDefaultExpressionContainer());
				expressionMatrixLayout.createRow(null, that.getDefaultValueContainer());

				mainVerticalLayout.addContent(expressionMatrixLayout);

				// mainVerticalLayout.addContent(that.getDefaultExpressionContainer());

				//mainVerticalLayout.addContent(getDefaultExpressionContainerCommons());

				var attributesHeadLayout = new sap.ui.commons.layout.MatrixLayout();
				attributesHeadLayout.addStyleClass("headerHeight");
				var attributesHeadLayoutCell = new sap.ui.commons.layout.MatrixLayoutCell({
					vAlign: sap.ui.commons.layout.VAlign.Begin,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}).addStyleClass("parameterHeaderStyle");

				this.attributesHeaderLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_apply_filter"),
					design: sap.ui.commons.LabelDesign.Bold
				});
				attributesHeadLayoutCell.addContent(new sap.ui.commons.Label({
					width: "10px"
				}));
				attributesHeadLayoutCell.addContent(this.attributesHeaderLabel);

				attributesHeadLayout.createRow(attributesHeadLayoutCell);

				mainVerticalLayout.addContent(attributesHeadLayout);

				var attributesMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					widths: ["15%", "85%"]
				});

				attributesMatrixLayout.createRow(null, that.getAttributeFilterTable());

				mainVerticalLayout.addContent(attributesMatrixLayout);

				// mainVerticalLayout.addContent(that.getAttributeFilterTable());

				that.topVerticalLayout.setModel(that.variableModel);

				return that.topVerticalLayout;
			},
			getColumnContainer: function() {
				var that = this;
				var gridMatrix = new sap.ui.commons.layout.MatrixLayout({

					//  widths: ["50px", "55px"]
				});
				// gridMatrix.addStyleClass("layoutWithoutTopMargin");

				var viewLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_view_table_value_help"),
					required: true
				}).addStyleClass("labelFloat");

				var viewText = new sap.ui.commons.TextField({
					width: "80%"
				}).addStyleClass("inputBorder");
				viewText.bindProperty("value", {
					path: "entity",
					formatter: function(entity) {
						if (entity) {
							if (entity === that.model.columnView) {
								return entity.name + "(Current View)";
							} else {
								if (entity.packageName) {
									return entity.fqName;
								} else {
									if (entity.physicalSchema) {
										if (entity.schemaName === entity.physicalSchema) {
											return entity.fqName;
										} else {
											var schemaName = entity.schemaName + "(" + entity.physicalSchema + ")";
											return "\"" + schemaName + "\"" + "." + entity.name;
										}
									} else {
										return entity.fqName;
									}
								}
							}
						}
						return "";

					}
				});
				var viewButton = new sap.ui.commons.Button({
					text: "...",
					press: function(oevent) {

						var findDialog = new NewFindDialog("", {
							multiSelect: false,
							noOfSelection: 1,
							context: that.context,
							types: ["TABLE", "CALCULATIONVIEW", "ATTRIBUTEVIEW", "ANALYTICVIEW"],
							onOK: function(selectedResource) {
								var selectedView;
								if (selectedResource) {
									var viewDetails = selectedResource[0];
									viewDetails.viewNodeName = that.model.columnView.viewNodes.toArray()[0].name;
									//viewDetails.context = self.editor.extensionParam.builder._context;

									var changeParameterCommand = new commands.ChangeParameterPropertiesCommand(that.variable.name, {
										externalTypeOfEntity: viewDetails
									});
									var parameter = that.execute(changeParameterCommand);

									var updateCombo = function(event) {

										that.variableData.elements.splice(0, that.variableData.elements.length);
										Array.prototype.slice.call(that.variableData.elements, 0);
										if (selectedView) {
											var array = selectedView.elements.toArray();
											for (var element in array) {
												if (!element.hidden && (!element.aggregationBehavior || element.aggregationBehavior === model.AggregationBehavior.NONE)) {
													that.variableData.elements.push({
														element: array[element]
													});
												}
											}
											that.variableModel.updateBindings();
											referenceCombo.bindItems({
												path: "/elements",
												template: referenceListItem
											});
										}
									}

									selectedView = that.variable.externalTypeOfEntity;
									that.variableData.entity = selectedView;
									var packageName = viewDetails.packageName ? viewDetails.packageName : viewDetails.schemaName;
									viewText.setValue(packageName + "." + viewDetails.name);
									ModelProxyResolver.ProxyResolver.resolve(that.model, that.context, updateCombo);
									if (!that.isNew) {
										CalcViewEditorUtil.addErrorMessageTooltip(referenceCombo, resourceLoader.getText("msg_column_invalid_empty"));
									}
									// referenceCombo.setValueState(sap.ui.core.ValueState.Error);
									// that.openToolTip(resourceLoader.getText("msg_column_invalid_empty"), referenceCombo);
									that.variableModel.updateBindings();

								}
							}
						});

					}
				});

				var referenceLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_reference_column"),
					required: true
				}).addStyleClass("labelFloat");
				var referenceCombo = new sap.ui.commons.ComboBox({
					width: "90%",
					selectedKey: {
						path: "/valueHelpElement",
						formatter: function(valueHelpElement) {
							if (valueHelpElement) {
								// referenceCombo.setValueState(sap.ui.core.ValueState.None);
								// referenceCombo.setTooltip(null);
								CalcViewEditorUtil.clearErrorMessageTooltip(referenceCombo);
								return valueHelpElement.name;
							} else {
								if (referenceCombo) {
									referenceCombo.setValue("");
									if (!that.isNew) {
										CalcViewEditorUtil.addErrorMessageTooltip(referenceCombo, resourceLoader.getText("msg_column_invalid_empty"));
									} else {
										CalcViewEditorUtil.clearErrorMessageTooltip(referenceCombo);
									}
									// referenceCombo.setValueState(sap.ui.core.ValueState.Error);
									// that.openToolTip(resourceLoader.getText("msg_column_invalid_empty"), referenceCombo);
								}
							}
						}

					},
					value: {
						path: "/valueHelpElement",
						formatter: function(valueHelpElement) {
							if (valueHelpElement) {
								return valueHelpElement.name;
							} else {
								return "";
							}
						}
					},
					change: function(oevent) {
						if (that.variableData.entity && (that.variableData.entity !== that.model.columnView)) {
							var externalTypeOfElement = that.variableData.entity.elements._values[oevent.getSource().getSelectedKey()];
							that.execute(new commands.ChangeParameterPropertiesCommand(that.variable.name, {
								typeOfElementName: externalTypeOfElement.name
							}));
						} else {
							var typeOfElement = that.model.columnView.getDefaultNode().elements._values[oevent.getSource().getSelectedKey()];
							that.execute(new commands.ChangeParameterPropertiesCommand(that.variable.name, {
								typeOfElementName: typeOfElement.name
							}));
						}
					}
				}).addStyleClass("borderIconCombo");

				var referenceListItem = new sap.ui.core.ListItem({});
				referenceListItem.bindProperty("text", {
					path: "element",
					formatter: function(element) {
						return element ? element.name : "";
					}
				});
				referenceListItem.bindProperty("icon", {
					path: "element",
					formatter: function(element) {
						if (element && element.aggregationBehavior) {
							return that.getIconPath(element, that.variableData.entity);
						}
					}
				});
				referenceListItem.bindProperty("key", {
					path: "element",
					formatter: function(element) {
						return element ? element.name : "";
					}
				});

				referenceCombo.bindItems({
					path: "/elements",
					template: referenceListItem
				});

				var viewCell = new sap.ui.commons.layout.MatrixLayoutCell();

				viewCell.addContent(viewText);
				viewCell.addContent(viewButton);

				gridMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
					height: "10px"
				}));
				gridMatrix.createRow(viewLabel, viewCell);
				gridMatrix.createRow(referenceLabel, referenceCombo);

				gridMatrix.setModel(that.variableModel);

				var columnMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					widths: ["12px", "80px", "10px"]
				});
				columnMatrixLayout.createRow(null, gridMatrix);
				return gridMatrix;

			},
			getDefaultValueContainer: function(expressionEditor, thisObject) {
				var that = this;
				var defaultValueTable = new sap.ui.table.Table({
					visibleRowCount: 3,
					width: "100%"
				}).addStyleClass("dummyTest7");
				var toolBar = new sap.ui.commons.Toolbar();
				toolBar.addStyleClass("parameterToolbarStyle");
				defaultValueTable.attachRowSelectionChange(function() {
					var enabled = false;
					if (defaultValueTable.getSelectedIndices().length > 0) {
						if (that.variable.multipleSelections) {
							enabled = true;
						}
					}
					deleteIcon.setEnabled(enabled);
				});
				var createIcon = new sap.ui.commons.Button({
					icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
					// text: resourceLoader.getText("tol_add"),
					tooltip: resourceLoader.getText("tol_add"),
					enabled: {
						path: "/isMultipleSelections",
						formatter: function(multipleSelections) {
							if (multipleSelections) {
								return true;
							}
							return false;

						}
					},
					press: function() {
						var defaultRangeCommand = new commands.CreateParameterDefaultRangeCommand(that.variable.name, {
							lowExpression: false,
							lowValue: "",
							including: true,
							operator: that.variable.selectionType === model.SelectionType.INTERVAL ? sharedmodel.ValueFilterOperator.BETWEEN : sharedmodel.ValueFilterOperator
								.EQUAL
						});
						that.execute(defaultRangeCommand);
					}
				});
				var deleteIcon = new sap.ui.commons.Button({
					icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
					// text: resourceLoader.getText("tol_remove"),
					tooltip: resourceLoader.getText("tol_remove"),
					enabled: {
						parts: [{
							path: "/isMultipleSelections"
                        }, {
							path: "defaultRanges"
                        }],
						formatter: function(multipleSelections, defaultRanges) {
							if (multipleSelections /*&& defaultRanges && defaultRanges.length > 1*/ ) {
								if (defaultValueTable.getSelectedIndices().length > 0) {
									return true;
								}
							}
							return false;
						}

					},
					press: function() {
						var deleteCommands = [];
						for (var i = 0; i < defaultValueTable.getSelectedIndices().length; i++) {
							var bindContext = defaultValueTable.getContextByIndex(defaultValueTable.getSelectedIndices()[i]);
							if (bindContext) {
								var defaultRange = bindContext.getProperty("defaultRange");
								if (defaultRange) {
									deleteCommands.push(new modelbase.DeleteCommand(defaultRange, false));
								}
							}
						}
						if (deleteCommands.length > 0) {
							that.execute(deleteCommands);
							defaultValueTable.removeSelectionInterval(defaultValueTable.getSelectedIndices()[0],
								defaultValueTable.getSelectedIndices()[defaultValueTable.getSelectedIndices().length]);
						}
					}
				});
				toolBar.addItem(createIcon);
				toolBar.addItem(deleteIcon);
				defaultValueTable.setToolbar(toolBar);

				var typeCombo = new sap.ui.commons.DropdownBox({
					selectedKey: {
						path: "defaultRange",
						formatter: function(defaultRange) {
							if (defaultRange) {
								return defaultRange.lowExpression ? "Expression" : "Constant";
							}
						}
					},
					value: {
						path: "defaultRange",
						formatter: function(defaultRange) {
							if (defaultRange) {
								return defaultRange.lowExpression ? "Expression" : "Constant";
							}
						}
					},
					width: "100%",
					change: function(event) {
						var selectedItem = event.getParameter("selectedItem");
						if (selectedItem && selectedItem.getBindingContext()) {
							var value = selectedItem.getText();
							var defaultRange = event.getSource().getBindingContext().getProperty("defaultRange");
							if (defaultRange) {
								that.execute(new commands.ChangeParameterDefaultRangeCommand(that.variable.name, defaultRange.$getKeyAttributeValue(), {
									lowExpression: value === "Constant" ? false : true
								}));
							}
						}

					}
				});
				var constantItem = new sap.ui.core.ListItem({
					text: "Constant",
					key: "Constant"
				});
				var expressionItem = new sap.ui.core.ListItem({
					text: "Expression",
					key: "Expression"
				});
				typeCombo.addItem(constantItem);
				typeCombo.addItem(expressionItem);

				var operatorItem = new sap.ui.core.ListItem();
				operatorItem.bindProperty("text", {
					path: "operator",
					formatter: function(operator) {
						if (operator) {
							return operator;
						}
					}
				});
				operatorItem.bindProperty("key", {
					path: "key",
					formatter: function(key) {
						return key;
					}
				});
				/* operatorItem.bindProperty("icon", {
                    path: "key",
                    formatter: function(key) {
                        return key;
                    }
                }); */

				var operatorCombo = new sap.ui.commons.DropdownBox({
					selectedKey: {
						path: "defaultRange",
						formatter: function(defaultRange) {
							if (defaultRange) {
								if (!defaultRange.including) {
									if (defaultRange.operator === sharedmodel.ValueFilterOperator.IS_NULL) {
										return "Is Not Null";
									} else if (defaultRange.operator === sharedmodel.ValueFilterOperator.EQUAL) {
										return "Not Equal";
									} else {
										return defaultRange.operator;
									}
								} else {
									return defaultRange.operator;
								}
							}

							return "";
						}
					},
					enabled: {
						path: "selectionType",
						formatter: function(selectionType) {
							if (selectionType === model.SelectionType.RANGE) {
								return true;
							}
							return true;
						}
					},
					change: function(event) {
						var selectedItem = event.getParameter("selectedItem");
						if (selectedItem && selectedItem.getBindingContext()) {
							var value = selectedItem.getKey();
							var including = true;
							if (value === "Not Equal") {
								value = sharedmodel.ValueFilterOperator.EQUAL;
								including = false;
							}
							if (value === "Is Not Null") {
								value = sharedmodel.ValueFilterOperator.IS_NULL;
								including = false;
							}
							var defaultRange = event.getSource().getBindingContext().getProperty("defaultRange");
							if (defaultRange) {
								that.execute(new commands.ChangeParameterDefaultRangeCommand(that.variable.name, defaultRange.$getKeyAttributeValue(), {
									operator: value,
									including: including,
									highValue: value === sharedmodel.ValueFilterOperator.BETWEEN ? defaultRange.highValue : "",
									lowValue: value !== sharedmodel.ValueFilterOperator.IS_NULL ? defaultRange.lowValue : ""
								}));
							}
						}
					}
				});

				var listBox = new sap.ui.commons.ListBox({
					displayIcons: true,
					items: {
						path: "/operators",
						template: operatorItem
					}
				});
				operatorCombo.setListBox(listBox);

				var fromValueHelpField = new sap.ui.commons.ValueHelpField({
					value: {
						path: "defaultRange",
						formatter: function(defaultRange) {
							if (defaultRange && defaultRange.lowValue) {
								return defaultRange.lowValue;
							}
							return "";
						}
					},
					enabled: {
						path: "defaultRange",
						formatter: function(defaultRange) {
							if (defaultRange && defaultRange.operator === sharedmodel.ValueFilterOperator.IS_NULL) {
								return false;
							}
							return true;
						}
					},
					valueHelpRequest: function(event) {
						var defaultRange = event.getSource().getBindingContext().getProperty("defaultRange");
						var oldValue = event.getSource().getValue();
						if (defaultRange) {
							var updateExpression = function(value, updateModel) {
								if (value !== undefined && value !== null && value !== oldValue) {
									that.execute(new commands.ChangeParameterDefaultRangeCommand(that.variable.name, defaultRange.$getKeyAttributeValue(), {
										lowValue: value
									}));
								}
							};
							if (defaultRange.lowExpression) {
								that.gotoExpressionEditor({
									updateExpression: updateExpression,
									expressionValue: oldValue,
									isVariable: true,
									elementName: that.variable.name
								});
							} else {
								that.getValueHelpValue(that, updateExpression, oldValue);
							}

						}
					},
					change: function(event) {
						var value = event.getParameter("newValue");
						var defaultRange = event.getSource().getBindingContext().getProperty("defaultRange");
						if (defaultRange) {

							that.modelUpDated = false;
							that.execute(new commands.ChangeParameterDefaultRangeCommand(that.variable.name, defaultRange.$getKeyAttributeValue(), {
								lowValue: value
							}));
							that.modelUpDated = true;
							//that.modelChanged();
						}
					},
					width: "100%"
				});
				var toValueHelpField = new sap.ui.commons.ValueHelpField({
					value: {
						path: "defaultRange",
						formatter: function(defaultRange) {
							if (defaultRange && defaultRange.highValue) {
								return defaultRange.highValue;
							}
							return "";
						}
					},
					valueHelpRequest: function(event) {
						var defaultRange = event.getSource().getBindingContext().getProperty("defaultRange");
						var oldValue = event.getSource().getValue();
						if (defaultRange) {
							var updateExpression = function(value, updateModel) {
								if (value !== undefined && value !== null && value !== oldValue) {
									that.execute(new commands.ChangeParameterDefaultRangeCommand(that.variable.name, defaultRange.$getKeyAttributeValue(), {
										highValue: value
									}));
								}
							};
							if (defaultRange.lowExpression) {
								that.gotoExpressionEditor({
									updateExpression: updateExpression,
									expressionValue: oldValue,
									isVariable: true,
									elementName: that.variable.name
								});
							} else {
								that.getValueHelpValue(that, updateExpression, oldValue);
							}

						}
					},
					change: function(event) {
						var value = event.getParameter("newValue");
						var defaultRange = event.getSource().getBindingContext().getProperty("defaultRange");
						if (defaultRange) {
							that.execute(new commands.ChangeParameterDefaultRangeCommand(that.variable.name, defaultRange.$getKeyAttributeValue(), {
								highValue: value
							}));
						}
					},
					enabled: {
						path: "defaultRange",
						formatter: function(defaultRange) {
							if (defaultRange && defaultRange.operator === sharedmodel.ValueFilterOperator.BETWEEN) {
								return true;
							}
							return false;
						}
					},
					width: "100%"
				});
				var typeColumn = new sap.ui.table.Column({
					width: "50%",
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("Type")
					}),
					template: typeCombo
				});
				var operatorColumn = new sap.ui.table.Column({
					width: "50%",
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("Operator")
					}),
					template: operatorCombo
				});
				var fromValueColumn = new sap.ui.table.Column({
					width: "50%",
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("From Value")
					}),
					template: fromValueHelpField
				});
				var toValueColumn = new sap.ui.table.Column({
					width: "50%",
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("To Value")
					}),
					template: toValueHelpField
				});
				defaultValueTable.addColumn(typeColumn);
				defaultValueTable.addColumn(operatorColumn);
				defaultValueTable.addColumn(fromValueColumn);
				defaultValueTable.addColumn(toValueColumn);

				defaultValueTable.bindRows("/defaultRanges");

				return defaultValueTable;
			},
			getValueHelpValue: function(objectClass, valueHelpCallback, oldValue) {
				var that = this;
				var tableData = {};
				tableData.dataSourceName = that.variableData.entity.name;
				if (that.variableData.valueHelpElement) {
					tableData.columnName = that.variableData.valueHelpElement.name;
					tableData.labelColumnName = that.variableData.valueHelpElement.labelElement ? that.variableData.valueHelpElement.labelElement.name :
						undefined;
					if (that.variableData.valueHelpElement.$getContainer() instanceof model.Entity) {
						var sharedEntity = that.variableData.valueHelpElement.$getContainer();
						tableData.dataSourceName = sharedEntity.name;
					}
					if (that.variableData.entity.type == "DATA_BASE_TABLE") {
						tableData.packageName = that.variableData.entity.physicalSchema;
					} else {
						if (that.variableData.valueHelpElement.$getContainer() instanceof model.Entity) {
							var sharedEntity = that.variableData.valueHelpElement.$getContainer();
							tableData.packageName = sharedEntity.packageName;
						}
						tableData.packageName = that.variableData.entity == that.model.columnView ? that.context.packageName : that.variableData.entity.packageName;
					}

					tableData.isTable = that.variableData.entity.type == "DATA_BASE_TABLE" ? true : false;

					tableData.hierarchyName = that.variableData.hierarchyElement ? that.variableData.hierarchyElement.name : undefined;
					var valueHelpDialog = new SqlColumnValueHelpDialog({
						context: that.context,
						tableData: tableData,
						callback: valueHelpCallback,
						dialogtype: {
							// Operator:sharedmodel.ValueFilterOperator.BETWEEN,
							oldValue: oldValue,
							dialogTitle: "Value Help"

						}

					});

					valueHelpDialog.onValueHelpRequest();
				}

			},
			getDefaultExpressionContainer: function() {
				var that = this;
				var expressionMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%",
					widths: ["30%", "65%"]
				}).addStyleClass("detailsExpressionTextArea");

				var radioButtonGroup = new sap.ui.commons.RadioButtonGroup({
					columns: 2,
					selectedIndex: 0,
					select: function(event) {
						if (radioButtonGroup.getSelectedItem().getText() == resourceLoader.getText("tit_constant")) {
							expressionMatrixCell.removeContent(expressionAreaMatrix);
							expressionMatrixCell.addContent(constantAreaMatrix);
							that.execute(new commands.ChangeParameterPropertiesCommand(that.variable.name, {
								objectAttributes: {
									defaultValue: that.variableData.defaultValue
								},
								defaultExpression: undefined
							}));
						} else {
							expressionMatrixCell.removeContent(constantAreaMatrix);
							expressionMatrixCell.addContent(expressionAreaMatrix);
							that.execute(new commands.ChangeParameterPropertiesCommand(that.variable.name, {
								objectAttributes: {
									defaultValue: ""
								},
								defaultExpression: {
									formula: that.variableData.defaultExpression,
									expressionLanguage: "COLUMN_ENGINE"
								}
							}));
						}
					}
				}).addStyleClass("radioButtonStyle");
				var constantItem = new sap.ui.core.Item({
					text: resourceLoader.getText("tit_constant"),
					tooltip: resourceLoader.getText("tit_constant"),
					key: resourceLoader.getText("tit_constant"),
				});
				radioButtonGroup.addItem(constantItem);
				var expressionItem = new sap.ui.core.Item({
					text: resourceLoader.getText("tit_expression"),
					tooltip: resourceLoader.getText("tit_expression"),
					key: resourceLoader.getText("tit_expression"),
				});
				radioButtonGroup.addItem(expressionItem);
				// segmented buttons

				/*    var segMentButtons = new sap.ui.commons.SegmentedButton({
                    select: function(oEvent) {
                        
                    },
                });
                var constantButton = new sap.ui.commons.Button({
                    text: resourceLoader.getText("tit_constant")
                });
                var expressionButton = new sap.ui.commons.Button({
                    text: resourceLoader.getText("tit_expression")
                });
                segMentButtons.addButton(constantButton);
                segMentButtons.addButton(expressionButton);*/

				//Constant area creation

				var constantAreaMatrix = new sap.ui.commons.layout.MatrixLayout({
					width: "100%",
					widths: ["30px", "55px", "10px"]
				});
				var inputField = new sap.ui.commons.TextField({
					width: "98%",
					change: function(oevent) {

						var attributes = [];
						attributes.objectAttributes = {
							defaultValue: that.variableData.defaultValue
						};
						if (that.variableData.defaultExpression && that.variableData.defaultExpression !== "") {
							attributes.defaultExpression = undefined;
						}
						that.execute(new commands.ChangeParameterPropertiesCommand(that.variable.name, attributes));
					}
				}).bindProperty("value", "/defaultValue");

				inputField.attachChange(function(oevent) {
					//  thisClass.updateModel();
				});

				var valueHelpCallback = function(object) {
					// alert("selected value : " + object);
					/* var string ;
                    for(i=0;i<object.length;i++){
                        string=object[i];
                    }
                    inputField.setValue(string);*/
					inputField.setValue(object);
					inputField.fireChange({
						newValue: object
					})

				};

				var oldValues = [];
				oldValues[0] = "c1";
				oldValues[1] = "c2";
				var valueHelpButton = new sap.ui.commons.Button({
					text: "...",
					// width: "7%",
					enabled: {
						path: "/valueHelpElement",
						formatter: function(valueHelpElement) {
							if (valueHelpElement) {
								return true;
							}
							return false;
						}
					},
					press: function() {

						var tableData = {};
						tableData.dataSourceName = that.variableData.entity.name;
						tableData.columnName = that.variableData.valueHelpElement.name;
						tableData.labelColumnName = that.variableData.valueHelpElement.labelElement ? that.variableData.valueHelpElement.labelElement.name :
							undefined;
						if (that.variableData.entity.type == "DATA_BASE_TABLE") {
							tableData.packageName = that.variableData.entity.physicalSchema;
						} else {
							tableData.packageName = that.variableData.entity == that.model.columnView ? that.context.packageName : that.variableData.entity.packageName;
						}

						tableData.isTable = that.variableData.entity.type == "DATA_BASE_TABLE" ? true : false;

						var valueHelpDialog = new SqlColumnValueHelpDialog({
							context: that.context,
							tableData: tableData,
							callback: valueHelpCallback,
							dialogtype: {
								/*     Operator:sharedmodel.ValueFilterOperator.BETWEEN,
                               oldValue:oldValues,*/
								dialogTitle: "Value Help"

							}

						});

						valueHelpDialog.onValueHelpRequest();
					}
				}).addStyleClass("sematicsValueHelpButton");
				// valueHelpButton.addStyleClass("buttonHeight");

				constantAreaMatrix.createRow(new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_default_value")
				}).addStyleClass("labelFloat"), inputField, new sap.ui.commons.layout.MatrixLayoutCell({
					content: valueHelpButton,
					vAlign: sap.ui.commons.layout.VAlign.Begin,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}));

				// Expression area creation

				var expressionAreaMatrix = new sap.ui.commons.layout.MatrixLayout({
					width: "100%",
					widths: ["30px", "70px"]
				});
				var toolBar = new sap.ui.commons.Toolbar().addStyleClass("parameterToolbarStyle");
				var expressionArea = new sap.ui.commons.TextArea({
					width: "100%",
					rows: 4,
					placeholder: resourceLoader.getText("txt_enter_expression"),
					change: function(oevent) {
						that.execute(new commands.ChangeParameterPropertiesCommand(that.variable.name, {
							objectAttributes: {
								defaultValue: ""
							},
							defaultExpression: {
								formula: that.variableData.defaultExpression,
								expressionLanguage: "COLUMN_ENGINE"
							}
						}));
					}

				}).bindProperty("value", {
					path: "/defaultExpression"

				});
				expressionArea.addStyleClass("detailsExpressionTextArea");

				var advancedButton = new sap.ui.commons.Button({
					// text: "...",
					text: resourceLoader.getText("txt_expression_editor"),
					tooltip: resourceLoader.getText("txt_expression_editor"),
					icon: "sap-icon://navigation-right-arrow",
					iconFirst: false,
					press: function(oEvent) {
						that.gotoExpressionEditor({
							updateExpression: updateExpression,
							expressionValue: expressionArea.getValue(),
							isVariable: true,
							elementName: that.variable.name
						});
					}
				});
				toolBar.addRightItem(advancedButton);

				var layout = new sap.ui.commons.layout.VerticalLayout({
					width: "90%"
				});
				layout.addContent(toolBar);
				layout.addContent(expressionArea);

				var defaultLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_default_value")
				}).addStyleClass("labelFloat").addStyleClass("labelPaddingBottom");
				expressionAreaMatrix.createRow(defaultLabel, layout);
				//  expressionAreaMatrix.createRow(toolBar); 
				//  expressionAreaMatrix.createRow(expressionArea);

				//.addStyleClass("sematicsValueHelpButton");

				// advancedButton.addStyleClass("buttonHeight");

				/* expressionAreaMatrix.createRow(expressionArea, new sap.ui.commons.layout.MatrixLayoutCell({
                    content: advancedButton,
                    vAlign: sap.ui.commons.layout.VAlign.Begin,
                    hAlign: sap.ui.commons.layout.HAlign.Begin
                }));
                */

				var expressionMatrixCell = new sap.ui.commons.layout.MatrixLayoutCell({
					colSpan: 2
				});

				if (that.variableData.defaultExpression) {
					expressionMatrixCell.addContent(expressionAreaMatrix);
					radioButtonGroup.setSelectedItem(expressionItem);

				} else {
					expressionMatrixCell.addContent(constantAreaMatrix);
					radioButtonGroup.setSelectedItem(constantItem);
				}

				/*   constantButton.attachPress(function(oEvent) {
                    expressionMatrixCell.removeContent(expressionAreaMatrix);
                    expressionMatrixCell.addContent(constantAreaMatrix);
                }, this);
                expressionButton.attachPress(function(oEvent) {
                    expressionMatrixCell.removeContent(constantAreaMatrix);
                    expressionMatrixCell.addContent(expressionAreaMatrix);
                }, this);
                */

				expressionMatrixLayout.createRow(null);
				expressionMatrixLayout.createRow(null, new sap.ui.commons.layout.MatrixLayoutCell({
					content: [radioButtonGroup],
					colSpan: 2,
					hAlign: sap.ui.commons.layout.HAlign.Center,
					vAlign: sap.ui.commons.layout.VAlign.Bottom
				}));

				expressionMatrixLayout.createRow(expressionMatrixCell);

				var updateExpressionButtonSelection = function(event) {
					if (that.variableData.defaultExpression) {
						expressionMatrixCell.removeContent(constantAreaMatrix);
						expressionMatrixCell.addContent(expressionAreaMatrix);
						radioButtonGroup.setSelectedItem(expressionItem);

					} else {
						expressionMatrixCell.removeContent(expressionAreaMatrix);
						expressionMatrixCell.addContent(constantAreaMatrix);
						radioButtonGroup.setSelectedItem(constantItem);
					}
					return true;
				};
				that.updateExpressionButtonSelection = updateExpressionButtonSelection;

				var updateExpression = function(value, updateModel) {
					if (value && value !== expressionArea.getValue()) {
						expressionArea.setValue(value);
						that.variableData.defaultExpression = value;
						if (updateModel) {
							that.execute(new commands.ChangeParameterPropertiesCommand(that.variable.name, {
								objectAttributes: {
									defaultValue: ""
								},
								defaultExpression: {
									formula: value,
									expressionLanguage: "COLUMN_ENGINE"
								}
							}));
						}

					}

					//  thisClass.parameterModel.updateBindings();
					//  else
					//        expressionArea.setValue("int()");    
				};
				expressionMatrixLayout.setModel(that.variableModel);

				return expressionMatrixLayout;
			},

			getAttributeFilterTable: function() {
				var that = this;
				var attributesMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%"
					//     widths: ["65px", "25px", "5px"]
				});
				attributesMatrixLayout.createRow(null);

				var tableMatrixCell = new sap.ui.commons.layout.MatrixLayoutCell({
					rowSpan: 5,
					colSpan: 2
				});

				var attributeFilterTable = new sap.ui.table.Table({
					visibleRowCount: 4,
					width: "100%"
				});

				var toolBar = new sap.ui.commons.Toolbar().addStyleClass("parameterToolbarStyle");
				var currentTableActiveRowIndex;
				var createIcon = new sap.ui.commons.Button({
					icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
					// text: resourceLoader.getText("tol_add"),
					tooltip: resourceLoader.getText("tol_add"),
					press: function() {

						for (var j in that.variableData.assignedElements) {
							var emptyElementExist = false;
							var emptyElement = that.variableData.assignedElements[j];
							if (emptyElement && emptyElement.assignedElement && emptyElement.assignedElement.name === " ") {
								emptyElementExist = true;
								break;
							}

						}
						if (!emptyElementExist) {
							var element = new model.Element({
								name: " "
							});
							that.variableData.assignedElements.push({
								assignedElement: element
							});
							that.variableModel.updateBindings(true);
						}
						attributeFilterTable.setSelectionInterval(that.variableData.assignedElements.length - 1, that.variableData.assignedElements.length -
							1);
					}
				});
				attributeFilterTable.attachCellClick(function(event) {
					currentTableActiveRowIndex = event.getParameter("rowIndex");
				});
				var deleteIcon = new sap.ui.commons.Button({
					icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
					// text: resourceLoader.getText("tol_remove"),
					tooltip: resourceLoader.getText("tol_remove"),
					enabled: {
						path: "name",
						formatter: function() {
							if (that.variableData.assignedElements.length > 0) {
								return true;
							} else {
								return false;
							}
						}
					},
					press: function() {
						var removeAssignedCommands = [];
						for (var i = 0; i < attributeFilterTable.getSelectedIndices().length; i++) {
							var bindContext = attributeFilterTable.getContextByIndex(attributeFilterTable.getSelectedIndices()[i]);
							if (bindContext) {
								var assignedElement = bindContext.getProperty("assignedElement");
								if (assignedElement && assignedElement.name !== " ") {
									removeAssignedCommands.push(new commands.RemoveParamAssignedElemCommand(that.variable.name, {
										elementName: assignedElement.name
										//  entityFQN:assignedElement.$getContainer() instanceof model.ViewNode?undefined:assignedElement.$getContainer().fqName,
									}));
									/*attributeFilterTable.removeSelectionInterval(attributeFilterTable.getSelectedIndices()[i], attributeFilterTable.getSelectedIndices()[
										i]);*/
								} else if (assignedElement.name === " ") {
									that.variableData.assignedElements.splice(attributeFilterTable.getSelectedIndices()[i], 1);
									/*attributeFilterTable.removeSelectionInterval(attributeFilterTable.getSelectedIndices()[i], attributeFilterTable.getSelectedIndices()[
										i]);*/
								}
							}
						}
						attributeFilterTable.clearSelection();						for (var j in that.variableData.assignedElements) {
							var emptyElementExist = false;
							var emptyElement = that.variableData.assignedElements[j];
							if (emptyElement && emptyElement.assignedElement && emptyElement.assignedElement.name === " ")
								emptyElementExist = true;

						}
						that.execute(removeAssignedCommands);
						that.variableData.assignedElements = that.getAssignedElements(that.variable);
						that.variableData.viewNodeElements = that.getViewNodeElements();

						if (emptyElementExist) {
							var element = new model.Element({
								name: " "
							});
							that.variableData.assignedElements.push({
								assignedElement: element
							})

						}

						that.variableModel.updateBindings(true);
					}

				});
				toolBar.addRightItem(createIcon);
				toolBar.addRightItem(deleteIcon);
				toolBar.addItem(new sap.ui.commons.Label({
					//  text: "Apply the variable filter to"
				}));
				toolBar.setModel(that.variableModel);
				attributeFilterTable.setToolbar(toolBar);

				tableMatrixCell.addContent(attributeFilterTable);

				var referenceColumnField = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomValueHelpField({
					width: "100%",
					canedit: false,
					valueHelpRequest: function(event) {
						var selectedView = that.model.columnView.getDefaultNode();
						var assignedElement = event.getSource().getBindingContext().getProperty("assignedElement");
						var selectedElement = function(attributes) {
							attributes.selectedView = selectedView;
							var element = that.getElement(attributes);
							var entityFQN;
							if (attributes.inputKey || attributes.inputKey === 0) {
								var input = selectedView.inputs.getAt(attributes.inputKey);
								if (input && input.getSource()) {
									entityFQN = input.getSource().fqName;
								}
							}
							if (element && assignedElement) {
								if (!that.isPartOfAssignedElements(element)) {
									var selectedIndex = currentTableActiveRowIndex;
									selectedIndex = attributeFilterTable._getFocusedRowIndex();
									var nextOfSelectedElement = that.variableData.assignedElements[selectedIndex + 1] ? that.variableData.assignedElements[
										selectedIndex + 1].assignedElement : undefined;
									var nextEntityFQN;
									if (nextOfSelectedElement && nextOfSelectedElement.name !== " ") {
										if (!(nextOfSelectedElement.$getContainer() instanceof model.ViewNode)) {
											nextEntityFQN = nextOfSelectedElement.$getContainer().fqName;
										}
									}
									var addCommand = new commands.AddParamAssignedElemCommand(that.variable.name, {
										elementName: element.name,
										entityFQN: entityFQN,
										nextElementName: nextOfSelectedElement && nextOfSelectedElement !== " " ? nextOfSelectedElement.name : undefined,
										nextElementEntityFQN: nextEntityFQN
									});

									var deleteCommand;
									if (assignedElement && assignedElement.name !== " ") {
										deleteCommand = new commands.RemoveParamAssignedElemCommand(that.variable.name, {
											elementName: assignedElement.name,
											entityFQN: assignedElement.$getContainer() instanceof model.ViewNode ? undefined : assignedElement.$getContainer().fqName
										});
									}
									var emptyElementExist = false;
									for (var j in that.variableData.assignedElements) {
										var emptyElement = that.variableData.assignedElements[j];
										if (emptyElement && emptyElement.name === " ") {
											emptyElementExist = true;
											break;
										}

									}
									if (deleteCommand)
										that.execute([deleteCommand, addCommand]);
									else
										that.execute(addCommand);

									if (emptyElementExist && assignedElement.name !== " ") {
										var element = new model.Element({
											name: " "
										});
										that.variableData.assignedElements.push({
											assignedElement: element
										});

									}
									that.variableData.assignedElements = that.getAssignedElements();
									that.variableData.viewNodeElements = that.getViewNodeElements();

									that.variableModel.updateBindings(true);
									that.variableModel.updateBindings(true);
								}
							}
						};
						var toopPopup = new OutputToolPopup({
							viewNode: selectedView,
							opener: event.getSource(),
							excludedElements: that.variable.assignedElements.toArray(),
							callback: selectedElement
						});
						toopPopup.open();
					}
				});
				referenceColumnField.bindProperty("value", {
					path: "assignedElement",
					formatter: function(assignedElement) {
						if (assignedElement) {
							if (assignedElement.$getContainer() instanceof model.Entity) {
								return assignedElement.$getContainer().fqName + "." + assignedElement.name;
							}
							return assignedElement.name;
						} else {
							return "";
						}
					}
				});
				referenceColumnField.bindProperty("tooltip", {
					path: "assignedElement",
					formatter: function(assignedElement) {
						if (assignedElement) {
							if (assignedElement.$getContainer() instanceof model.Entity) {
								return assignedElement.$getContainer().fqName + "." + assignedElement.name;
							}
							return assignedElement.name;
						} else {
							return "";
						}
					}
				});

				var oImage = new sap.ui.commons.Image({
					src: {
						path: "assignedElement",
						formatter: function(assignedElement) {
							if (assignedElement && assignedElement.aggregationBehavior)
								return that.getIconPath(assignedElement);
						}
					}
					//src: resourceLoader.getImagePath("Attribute.png")
				});
				var attributeCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
					canedit: false,
					selectedKey: {
						path: "assignedElement",
						formatter: function(assignedElement) {
							if (assignedElement && assignedElement.name != " ") {
								attributeCombo.setValue(assignedElement.name);
							} else {
								attributeCombo.setValue("");
							}

						}
					},
					value: {
						path: "assignedElement",
						formatter: function(assignedElement) {
							if (assignedElement && assignedElement.name != " ") {
								return assignedElement.name;
							} else {
								return "";
							}

						}
					},
					change: function(event) {
						var selectedItem = event.getParameter("selectedItem");
						if (selectedItem && selectedItem.getBindingContext()) {
							var selectedElement = selectedItem.getBindingContext().getProperty("element");

							var selectedIndex = currentTableActiveRowIndex; //attributeFilterTable.getSelectedIndex();
							var previousAssignedElement = /*attributeCombo.getValue();*/ that.variableData.assignedElements[selectedIndex] ? that.variableData
								.assignedElements[selectedIndex].assignedElement : undefined;
							var nextOfSelectedElement = that.variableData.assignedElements[selectedIndex + 1] ? that.variableData.assignedElements[
								selectedIndex + 1].assignedElement : undefined;

							var addCommand = new commands.AddParamAssignedElemCommand(that.variable.name, {
								elementName: selectedElement.name,
								entityFQN: selectedElement.$getContainer() instanceof model.ViewNode ? undefined : selectedElement.$getContainer().fqName,
								nextElementName: nextOfSelectedElement ? nextOfSelectedElement.name : undefined,
								nextElementEntityFQN: !nextOfSelectedElement || nextOfSelectedElement.$getContainer() instanceof model.ViewNode ? undefined : nextOfSelectedElement
									.$getContainer().fqName,
							});
							var deleteCommand;
							if (previousAssignedElement && previousAssignedElement.name !== " ") {
								deleteCommand = new commands.RemoveParamAssignedElemCommand(that.variable.name, {
									elementName: previousAssignedElement.name,
									entityFQN: previousAssignedElement.$getContainer() instanceof model.ViewNode ? undefined : previousAssignedElement.$getContainer()
										.fqName,
								});
							}
							if (deleteCommand)
								that.execute([deleteCommand, addCommand]);
							else
								that.execute(addCommand);

							var emptyElementExist = false;
							for (var j in that.variableData.assignedElements) {
								var emptyElement = that.variableData.assignedElements[j];
								if (emptyElement && emptyElement.name === " ") {
									emptyElementExist = true;
									break;
								}

							}

							that.variableData.assignedElements = that.getAssignedElements();
							that.variableData.viewNodeElements = that.getViewNodeElements();

							if (emptyElementExist && previousAssignedElement.name !== " ") {
								var element = new model.Element({
									name: " "
								});
								that.variableData.assignedElements.push({
									assignedElement: element
								});

							}
							that.variableModel.updateBindings(true);
							that.variableModel.updateBindings(true);
						}
					},
					icon: oImage
				}).addStyleClass("marginLeft");
				var attributeListItem = new sap.ui.core.ListItem();
				attributeListItem.bindProperty("text", {
					path: "element",
					formatter: function(element) {
						return element ? element.name : "";
					}
				});
				attributeListItem.bindProperty("key", {
					path: "element",
					formatter: function(element) {
						return element ? element.name : "";
					}
				});
				attributeListItem.bindProperty("icon", {
					path: "element",
					formatter: function(element) {
						if (element && element.aggregationBehavior)
							return that.getIconPath(element);
					}
				});

				var listBox = new sap.ui.commons.ListBox({
					displayIcons: true,
					items: {
						path: "/viewNodeElements",
						template: attributeListItem
					}
				});
				attributeCombo.setListBox(listBox);

				/*  attributeCombo.bindItems({
                    path: "/viewNodeElements",
                    template: attributeListItem
                })*/

				var attributeColumn = new sap.ui.table.Column({
					width: "100%",
					label: new sap.ui.commons.Label({
						text: "Attribute"
					}),
					// template: attributeCombo
					template: referenceColumnField
				});

				attributeFilterTable.addColumn(attributeColumn);

				attributeFilterTable.bindRows("/assignedElements");

				/*attributesMatrixLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
                content: getDirectDetails(),
                colSpan: 2
            }));
            */

				attributesMatrixLayout.createRow(tableMatrixCell);

				attributesMatrixLayout.setModel(that.variableModel);

				var topMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					widths: ["1px", "80px", "10px"]
				});
				topMatrixLayout.createRow(null, attributesMatrixLayout, null);

				return topMatrixLayout;
			},
			isNameValid: function(nameValue) {
				if (nameValue === "") {
					return resourceLoader.getText("msg_column_invalid_empty");
				}
				if (!CalcViewEditorUtil.checkValidUnicodeChar(nameValue)) {
					return resourceLoader.getText("msg_column_invalid_unicode", CalcViewEditorUtil.getInvalidUnicodeCharacters());
				}
				for (var i in this.model.columnView.parameters.toArray()) {
					var variable = this.model.columnView.parameters.toArray()[i];
					if (variable !== this.variable) {
						if (variable.name === nameValue)
							return resourceLoader.getText("msg_column_already_exists", variable.name)
					}
				}
				var regularExpression = /[a-zA-Z0-9_]*/;
				if (!regularExpression.test(nameValue)) {
					return resourceLoader.getText("msg_name_contain_alphanumeric_and_underscore");
				}
				return null;
			},
			getIconPath: function(element, entity) {
				if (element) {
					var aggregationBehavior = element.aggregationBehavior;
					if (aggregationBehavior) {
						if (aggregationBehavior === model.AggregationBehavior.NONE) {
							if (entity && entity.type === "DATA_BASE_TABLE") {
								return resourceLoader.getImagePath("Table.png");
							} else {
								if (element.calculationDefinition)
									return resourceLoader.getImagePath("Calculated_Attribute.png");
								return resourceLoader.getImagePath("Dimension.png");
							}
						} else if (aggregationBehavior === model.AggregationBehavior.SUM || aggregationBehavior === model.AggregationBehavior.MIN ||
							aggregationBehavior === model.AggregationBehavior.MAX || aggregationBehavior === model.AggregationBehavior.COUNT ||
							aggregationBehavior === model.AggregationBehavior.FORMULA) {
							if (element.measureType === model.MeasureType.CALCULATED_MEASURE)
								return resourceLoader.getImagePath("CalculatedMeasure.png");
							if (element.measureType === model.MeasureType.RESTRICTION)
								return resourceLoader.getImagePath("RestrictedMeasure.png");
							if (element.measureType === model.MeasureType.COUNTER)
								return resourceLoader.getImagePath("counter_scale.png");
							return resourceLoader.getImagePath("Measure.png");
						} else {
							return resourceLoader.getImagePath("Table.png");
						}
					}
				}
				return resourceLoader.getImagePath("Table.png");
			},
			isPartOfAssignedElements: function(element) {
				var that = this;
				var exist = false;
				if (element) {
					that.getAssignedElements().forEach(function(assignedElement) {
						if (assignedElement && assignedElement.assignedElement === element) {
							exist = true;
						}
					});
				}
				return exist;
			},
			isBasedOnElementProxy: function(element, columnView, viewNode) {
				if (element) {
					var results = CalcViewEditorUtil.isBasedOnElementProxy({
						object: element,
						columnView: columnView,
						viewNode: viewNode
					});
					if (results) {
						return true;
					}
				}
				return false;
			},
			isContainsHierarchy: function(typeOfElement, hierarchyElement) {
				var exist = false;
				if (typeOfElement && hierarchyElement) {
					if (hierarchyElement.type === "LeveledHierarchy") {
						if (hierarchyElement.levels && hierarchyElement.levels.count() > 0) {
							var level = hierarchyElement.levels.getAt(hierarchyElement.levels.count() - 1);
							if (level && level.element === typeOfElement) {
								exist = true;
							}
						}
					} else {
						hierarchyElement.parentDefinitions.foreach(function(parentDefinition) {
							if (typeOfElement === parentDefinition.element) {
								exist = true;
							}
						});
					}
				}
				return exist;
			},
			openToolTip: function(message, control) {
				var tooltip = new sap.ui.commons.Callout({});
				tooltip.addContent(new sap.ui.commons.TextView({
					semanticColor: sap.ui.commons.TextViewColor.Negative,
					design: sap.ui.commons.TextViewDesign.Bold,
					text: message,
					editable: false
				}))
				control.setTooltip(tooltip);
				// open the popup
				window.setTimeout(function() {
					tooltip.openPopup(control);
				}, 200);
			}

		};

		return VariableDetails;
	});
