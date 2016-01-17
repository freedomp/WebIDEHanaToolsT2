/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader", "../viewmodel/commands", "../base/modelbase", "../dialogs/NewFindDialog",
		"../viewmodel/model", "../viewmodel/ModelProxyResolver", "../sharedmodel/sharedmodel", "./dialogs/SqlColumnValueHelpDialog",
        "./IconComboBox", "./CustomValueHelpField",
		"./OutputToolPopup", "./CalcViewEditorUtil", "./dialogs/ValueHelpDialog"
    ],
	function(ResourceLoader, commands, modelbase, NewFindDialog, model, ModelProxyResolver, sharedmodel, SqlColumnValueHelpDialog, IconComboBox,
		CustomValueHelpField, OutputToolPopup, CalcViewEditorUtil, ValueHelpDialog) {
		"use strict";
		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
		var DetailInputParameter = function(attributes) {
			this.undoManager = attributes.undoManager;
			this.model = attributes.model;
			this.viewNode = attributes.viewNode;
			this.context = attributes.context;
			this.updateMasterList = attributes.updateMasterList;
			this.parameters = attributes.parameters;
			this.gotoExpressionEditorPage = attributes.gotoExpressionEditor;
			this.updateMasterList = attributes.updateMasterList;
			this.isNew;
			this.inputParameter;
			this.inputParameterModel;
			this.parameterStackMatrixCell;
			this.parameterHeaderLabel;
			this.topLayout;
			this.parameterData = [];
			this.inlineTypeData = [];
			this.typeOfElement;
			this.externalTypeOfElement;
			this.modelUpdated = false;
			this.tooltip;
			// this.staticJsonModel = new sap.ui.model.json.JSONModel();
		};
		DetailInputParameter.createModelForParameter = function(parameter) {
			if (parameter) {
				return {
					name: parameter.name,
					label: parameter.label,
					primitiveType: parameter.inlineType.primitiveType,
					length: parameter.inlineType.length,
					scale: parameter.inlineType.scale,
					semanticType: parameter.inlineType.semanticType,
					typeOfElement: parameter.typeOfElement,
					externalTypeOfElement: parameter.externalTypeOfElement,
					assignedElement: parameter.assignedElement,
					mandatory: parameter.mandatory,
					valueRanges: parameter.inlineType.valueRanges,
					multipleSelections: parameter.multipleSelections,
					defaultValue: parameter.defaultValue,
					defaultExpression: parameter.defaultExpression,
					enableConstantHelpButton: false
				};
			} else
				return null;
		};
		DetailInputParameter.prototype = {
			_execute: function(objectAttributes, typeAttributes, typeOfElementName, defaultExpression, hierarchyName) {
				var attributes = {};
				if (objectAttributes)
					attributes.objectAttributes = objectAttributes;
				if (typeAttributes)
					attributes.typeAttributes = typeAttributes;
				if (defaultExpression)
					attributes.defaultExpression = defaultExpression;
				if (typeOfElementName)
					attributes.typeOfElementName = typeOfElementName;
				if (typeAttributes === null)
					attributes.typeAttributes = undefined;
				if (defaultExpression === null)
					attributes.defaultExpression = undefined;
				if (typeOfElementName === null)
					attributes.typeOfElementName = undefined;
				if (hierarchyName) {
					attributes.hierarchyName = hierarchyName;
				}
				if (hierarchyName === null) {
					attributes.hierarchyName = undefined;
				}
				this.modelUpdated = true;
				var changeParameterCommand = new commands.ChangeParameterPropertiesCommand(this.inputParameterModel.name, attributes);
				var parameter = this.undoManager.execute(new modelbase.CompoundCommand(changeParameterCommand));
				this.modelUpdated = false;

			},
			_executeCompound: function(objectAttributes, typeAttributes, defaultExpression, removestatic, removederived) {
				var that = this;
				var compoundCommands = [];
				var attributes = {};
				if (objectAttributes)
					attributes.objectAttributes = objectAttributes;
				if (typeAttributes)
					attributes.typeAttributes = typeAttributes;
				if (defaultExpression)
					attributes.defaultExpression = defaultExpression;
				if (typeAttributes === null)
					attributes.typeAttributes = undefined;
				if (defaultExpression === null)
					attributes.defaultExpression = undefined;

				if (removestatic === true) {
					var removeValueRanges = this.inputParameterModel.inlineType.valueRanges._values;
					for (var i in removeValueRanges) {
						var removeValueRange = removeValueRanges[i];
						compoundCommands.push(new modelbase.DeleteCommand(removeValueRange, false));
					}
				} else if (removestatic === false) {
					var addValueRanges = this.inlineTypeData.valueranges;
					for (var j in addValueRanges) {
						var addValueRange = addValueRanges[j];
						compoundCommands.push(new commands.CreateParameterValueRangeCommand(that.inputParameterModel.name, {
							value: addValueRange.name,
							defaultDescription: addValueRange.description
						}));
					}
				}
				if (removederived === true) {

				} else if (removederived === false) {

				}

				this.modelUpdated = true;
				var changeParameterCommand = new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, attributes);
				compoundCommands.push(changeParameterCommand)
				var parameter = this.undoManager.execute(new modelbase.CompoundCommand(compoundCommands));
				this.modelUpdated = false;

			},
			_executeDirect: function(command) {
				if (command instanceof Array) {
					return this.undoManager.execute(new modelbase.CompoundCommand(command));
				} else {
					return this.undoManager.execute(command);

				}
			},
			buildParameterDetails: function(attributes) {
				// this.inputParameter = DetailInputParameter.createModelForParameter(attributes.parameter);
				this.inputParameterModel = attributes.parameter;
				this.isNew = attributes.isNew;
				this.fillParameterData(this.inputParameterModel);
				this.parameterModel = new sap.ui.model.json.JSONModel(this.parameterData);
				if (this.topLayout)
					this.topLayout.destroyContent();
				this.unsubScribeEvents();
				this.getDetailsContent(attributes.expressionPageCallBack);

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
			unsubScribeEvents: function() {
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_CHANGED, this.modelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_VALUERANGE_CREATED, this.modelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_VALUERANGE_DELETED, this.modelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_VALUERANGE_CHANGED, this.modelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_CREATED, this.modelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_DELETED, this.modelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_CHANGED, this.modelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.HIERARCHY_DELETED, this.modelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_CREATED, this.modelChanged,
					this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_DELETED, this.modelChanged,
					this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_CHANGED, this.modelChanged,
					this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.HIERARCHY_CHANGED, this.modelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.OuterModelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.OuterModelChanged, this);
				this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.OuterModelChanged, this);
				this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.OuterModelChanged, this);
				if (this.inputParameterModel) {
					this.inputParameterModel.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DEFAULTRANGE_CREATED, this.modelChanged, this);
					this.inputParameterModel.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DEFAULTRANGE_DELETED, this.modelChanged, this);
					this.inputParameterModel.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DEFAULTRANGE_CHANGED, this.modelChanged, this);
					this.inputParameterModel.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_CREATED, this.modelChanged, this);
					this.inputParameterModel.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_DELETED, this.modelChanged, this);
					this.inputParameterModel.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_CHANGED, this.modelChanged, this);
				}
			},
			subScribeEvenets: function() {
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CHANGED, this.modelChanged, this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_VALUERANGE_CREATED, this.modelChanged, this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_VALUERANGE_DELETED, this.modelChanged, this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_VALUERANGE_CHANGED, this.modelChanged, this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_CREATED, this.modelChanged, this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_DELETED, this.modelChanged, this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_CHANGED, this.modelChanged, this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_CREATED, this.modelChanged,
					this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_DELETED, this.modelChanged,
					this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_CHANGED, this.modelChanged,
					this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.HIERARCHY_DELETED, this.modelChanged, this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.HIERARCHY_CHANGED, this.modelChanged, this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.OuterModelChanged, this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.outerModelChanged, this);
				this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.OuterModelChanged, this);
				this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.OuterModelChanged, this);

				if (this.inputParameterModel) {
					this.inputParameterModel.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DEFAULTRANGE_CREATED, this.modelChanged, this);
					this.inputParameterModel.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DEFAULTRANGE_DELETED, this.modelChanged, this);
					this.inputParameterModel.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DEFAULTRANGE_CHANGED, this.modelChanged, this);
					this.inputParameterModel.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_CREATED, this.modelChanged, this);
					this.inputParameterModel.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_DELETED, this.modelChanged, this);
					this.inputParameterModel.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DERIVATIONRULE_CHANGED, this.modelChanged, this);
				}

			},
			getValueRanges: function() {
				var valueRanges = [];
				if (this.inputParameterModel.inlineType && this.inputParameterModel.inlineType.valueRanges) {
					for (var valueRange in this.inputParameterModel.inlineType.valueRanges._values) {
						valueRanges.push({
							valueRange: this.inputParameterModel.inlineType.valueRanges._values[valueRange]
						});
					}
				}
				return valueRanges;
			},
			getDerivedRules: function() {
				var elementFilters = [];
				var parameter = this.inputParameterModel;
				if (parameter.derivationRule) {
					var array = parameter.derivationRule.elementFilters.toArray();
					for (var index in array) {
						elementFilters.push({
							derivationRule: array[index]
						});
					}
				}
				return elementFilters;
			},
			isScriptBased: function() {
				if (this.viewNode && this.viewNode.type === "Script") {
					return true;
				}
				return false;
			},
			fillParameterData: function(parameter) {
				var that = this;
				if (parameter) {
					var getElements = function() {
						var elements = [];
						if (parameter.externalTypeOfEntity) {
							var selectedView = parameter.externalTypeOfEntity;
							for (var elementName in selectedView.elements._values) {
								var element = selectedView.elements._values[elementName];
								if (!element.aggregationBehavior || element.aggregationBehavior === model.AggregationBehavior.NONE) {
									if (!element.isProxy && !that.isBasedOnElementProxy(element, selectedView)) {
										elements.push(element);
									}
								}
							}
						} else {
							var selectedView = that.model.columnView.getDefaultNode();
							for (var elementName in selectedView.elements._values) {
								var element = selectedView.elements._values[elementName];
								if (!element.aggregationBehavior || element.aggregationBehavior === model.AggregationBehavior.NONE) {
									if (!element.isProxy && !that.isBasedOnElementProxy(element, that.model.columnView, selectedView)) {
										elements.push(element);
									}
								}
							}
						}
						return elements;
					};

					var getLookupElements = function() {
						var lookupElements = [];
						if (parameter.derivationRule) {
							if (parameter.derivationRule.lookupEntity) {
								for (var lookupelement in parameter.derivationRule.lookupEntity.elements._values) {
									lookupElements.push({
										column: parameter.derivationRule.lookupEntity.elements._values[lookupelement]
									});
								}
							}

						}
						return lookupElements;

					};
					var getDataTypes = function() {
						var dataTypes = [{
							datatype: "VARCHAR"
                        }, {
							datatype: "NVARCHAR"
                        }, {
							datatype: "INTEGER"
                        }, {
							datatype: "TINYINT"
                        }, {
							datatype: "SMALLINT"
                        }, {
							datatype: "BIGINT"
                        }, {
							datatype: "DECIMAL"
                        }, {
							datatype: "TIMESTAMP"
                        }, {
							datatype: "REAL"
                        }, {
							datatype: "FLOAT"
                        }, {
							datatype: "DOUBLE"
                        }, {
							datatype: "DATE"
                        }, {
							datatype: "TIME"
                        }, {
							datatype: "TIMESTAMP"
                        }, {
							datatype: "BLOB"
                        }, {
							datatype: "CLOB"
                        }, {
							datatype: "NCLOB"
                        }, {
							datatype: "VARBINARY"
                        }, {
							datatype: "SMALLDECIMAL"
                        }, {
							datatype: "TEXT"
                        }, {
							datatype: "SHORTTEXT"
                        }, {
							datatype: "ALPHANUM"
                        }, {
							datatype: "ST_POINT"
                        }, {
							datatype: "ST_GEOMETRY"
                        }, {
							datatype: "SECONDDATE"
                        }];
						return dataTypes;
					};
					var getParameterTypes = function() {
						if (that.isScriptBased()) {
							var parameterTypes = [{
								parameterTypeName: "Direct"
                        }, {
								parameterTypeName: "Column"
                        }/* {
								parameterTypeName: "Static List"
                        }*/];
							return parameterTypes;
						} else {
							var parameterTypes = [{
								parameterTypeName: "Direct"
                        }, {
								parameterTypeName: "Column"
                        }/* {
								parameterTypeName: "Static List"
                        }, {
								parameterTypeName: "Derived From Table"
                        }, {
								parameterTypeName: "Derived From Procedure/Scalar Function"
                        }*/];
							return parameterTypes;
						}
					};
					var getSemanticTypes = function() {
						var semanticTypes = [{
							semanticType: "",
							key: ""
                        }, {
							semanticType: model.SemanticType.CURRENCY_CODE,
							key: model.SemanticType.CURRENCY_CODE
                        }, {
							semanticType: model.SemanticType.UNIT_OF_MEASURE,
							key: model.SemanticType.UNIT_OF_MEASURE
                        }, {
							semanticType: model.SemanticType.DATE,
							key: model.SemanticType.DATE
                        }];
						return semanticTypes;
					};
					var getDefaultRanges = function(parameter) {
						var defaultRanges = [];
						parameter.defaultRanges.foreach(function(defaultRange) {
							defaultRanges.push({
								defaultRange: defaultRange
							});
						});
						return defaultRanges;
					};
					var getHierarchies = function(parameter) {
						var hierarchies = [];
						hierarchies.push({
							hierarchy: undefined
						});
						var typeOfElement = parameter.typeOfElement;
						if (typeOfElement && !parameter.externalTypeOfEntity) {
							that.model.columnView.inlineHierarchies.foreach(function(inlineHierarchy) {
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
					};
					this.parameterData = {
						name: parameter.name,
						label: parameter.label,
						parametetertype: this.getParameterType(parameter),
						mandatory: parameter.mandatory,
						multipleSelections: parameter.multipleSelections,
						isVariable: parameter.isVariable,
						defaultValue: parameter.defaultValue ? parameter.defaultValue:"",
						defaultExpression: parameter.defaultExpression ? parameter.defaultExpression.formula : "",
						referenceElement: parameter.typeOfElement ? parameter.typeOfElement : parameter.externalTypeOfElement,
						entity: parameter.externalTypeOfEntity ? parameter.externalTypeOfEntity : this.model.columnView,
						semantictype: parameter.inlineType ? parameter.inlineType.semanticType : "",
						primitiveType: parameter.inlineType ? parameter.inlineType.primitiveType : "",
						length: parameter.inlineType ? parameter.inlineType.length : undefined,
						scale: parameter.inlineType ? parameter.inlineType.scale : undefined,
						enableLength: parameter.inlineType ? isLengthSupported(parameter.inlineType.primitiveType) : false,
						enableScale: parameter.inlineType ? isScaleSupported(parameter.inlineType.primitiveType) : false,
						valueRanges: that.getValueRanges(),
						derivationRules: that.getDerivedRules(),
						lookupEntity: parameter.derivationRule ? parameter.derivationRule.lookupEntity : undefined,
						scriptObject: parameter.derivationRule ? parameter.derivationRule.scriptObject : undefined,
						resultElementName: parameter.derivationRule ? parameter.derivationRule.resultElementName : "",
						inputEnabled: parameter.derivationRule ? parameter.derivationRule.inputEnabled : false,
						lookupElements: getLookupElements(),
						elements: getElements(),
						dataTypes: getDataTypes(),
						parameterTypes: getParameterTypes(),
						semanticTypes: getSemanticTypes(),
						defaultRanges: getDefaultRanges(parameter),
						hierarchies: getHierarchies(parameter),
						hierarchyElement: parameter.hierarchy,
						parameter: parameter

					};
				}
			},

			getParameterType: function(parameter) {
				if (parameter) {
					if (parameter.parameterType == model.ParameterType.COLUMN) {
						return "Column";
					} else if (parameter.parameterType == model.ParameterType.STATIC_LIST) {
						return "Static List";
					} else if (parameter.parameterType == model.ParameterType.DERIVED_FROM_TABLE)
						return "Derived From Table";
					else if (parameter.parameterType == model.ParameterType.DERIVED_FROM_PROCEDURE)
						return "Derived From Procedure/Scalar Function";
					else {
						return "Direct";
					}
				} else {
					return "Direct";
				}
			},
			modelChanged: function(object, event) {
				// if (!this.modelUpdated) {
				/* this.buildParameterDetails({
                    parameter: this.inputParameterModel
                });*/
				// this.parameterModel.updateBindings(true);
				//     this.updateMasterList(object.name);
				// }
				if (this.updateMasterList) {
					this.updateMasterList(this.inputParameterModel);
				}
				this.updateModelBinding(this.inputParameterModel);

			},
			OuterModelChanged: function(object) {
				var that = this;
				if (that.inputParameterModel) {
					that.updateModelBinding(that.inputParameterModel);
				}
			},
			updateModelBinding: function(parameter) {
				if (parameter) {
					this.inputParameterModel = parameter;
					//  this.fillInlineTypeData(this.inputParameterModel);
					this.fillParameterData(this.inputParameterModel);
					if (this.parameterModel) {
						this.parameterModel.setData(this.parameterData);
						this.parameterModel.updateBindings(true);
					}
				}
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
							aggregationBehavior === model.AggregationBehavior.MAX ||
							aggregationBehavior === model.AggregationBehavior.COUNT || aggregationBehavior === model.AggregationBehavior.FORMULA) {
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
			getDetailsContent: function(expressionEditorFunction) {
				var that = this;

				this.expressionEditorFunction = expressionEditorFunction;
				if (!this.topLayout)
					this.topLayout = new sap.ui.commons.layout.VerticalLayout({
						height: "100%"
					}).addStyleClass("detailsMainDiv");

				if (this.inputParameterModel) {

					that.subScribeEvenets();

					var toolbarMatrixlayout = new sap.ui.commons.layout.MatrixLayout({
						width: "100%"
					})
					toolbarMatrixlayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
						content: [new sap.ui.commons.Label({
							text: {
								path: "name",
								formatter: function(name) {
									return resourceLoader.getText("txt_details") + " " + that.inputParameterModel.name;
								}
							},
							design: sap.ui.commons.LabelDesign.Bold
						})],
						hAlign: sap.ui.commons.layout.HAlign.Center,
						vAlign: sap.ui.commons.layout.VAlign.Center
					}).addStyleClass("detailsHeaderStyle"));

					this.topLayout.addContent(toolbarMatrixlayout);

					var mainLayout = new sap.ui.commons.layout.MatrixLayout({});
					this.topLayout.addContent(mainLayout);

					this.parameterStackMatrixCell = null;
					// this.topLayout.addStyleClass("backGroundColor");
					var matrixLayout = new sap.ui.commons.layout.MatrixLayout({
						width: "100%"
						// widths: ["5px", "90px", "5px"]
					});
					// matrixLayout.addStyleClass("layoutMargin");

					var headMatrixLayout = new sap.ui.commons.layout.MatrixLayout();
					headMatrixLayout.addStyleClass("headerHeight");
					var headerMatrixLayoutCell = new sap.ui.commons.layout.MatrixLayoutCell({
						vAlign: sap.ui.commons.layout.VAlign.Middle,
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
						width: "10px",
						vAlign: sap.ui.commons.layout.VAlign.Middle,
						hAlign: sap.ui.commons.layout.HAlign.Begin
					}));
					headerMatrixLayoutCell.addContent(headerName);

					headMatrixLayout.createRow(headerMatrixLayoutCell);

					var parameterLayout = new sap.ui.commons.layout.MatrixLayout({
						width: "100%"
						// widths: ["12px", "80px", "10px"]
					});
					this.parameterStackMatrixCell = new sap.ui.commons.layout.MatrixLayoutCell({
						colSpan: 2
					});
					parameterLayout.createRow(this.parameterStackMatrixCell);

					matrixLayout.createRow(createInputParameterMatrix(expressionEditorFunction, that));

					mainLayout.createRow(headMatrixLayout);
					//  this.topLayout.addContent(getHorizontalDivider());
					mainLayout.createRow(matrixLayout);

					// parameter type section

					var parameterHeadLayout = new sap.ui.commons.layout.MatrixLayout();
					parameterHeadLayout.addStyleClass("headerHeight");
					var parameterHeadLayoutCell = new sap.ui.commons.layout.MatrixLayoutCell({
						vAlign: sap.ui.commons.layout.VAlign.Begin,
						hAlign: sap.ui.commons.layout.HAlign.Begin
					}).addStyleClass("parameterHeaderStyle");

					this.parameterHeaderLabel = new sap.ui.commons.Label({
						text: "Parameter Type - Direct",
						design: sap.ui.commons.LabelDesign.Bold
					});
					var parameterProperty = that.parameterData.parametetertype;
					if (parameterProperty == "Column") {
						this.parameterHeaderLabel.setText("Parameter Type - Column");
						this.parameterData.enableConstantHelpButton = true;
					} else if (parameterProperty == "Static List") {
						this.parameterHeaderLabel.setText("Parameter Type - Static List");
						this.parameterData.enableConstantHelpButton = true;
					} else if (parameterProperty == "Derived From Table") {
						this.parameterHeaderLabel.setText("Parameter Type - Derived From Table");
					} else if (parameterProperty == "Derived From Procedure/Scalar Function") {
						this.parameterHeaderLabel.setText("Parameter Type - Derived From Procedure/Scalar Function");
					}

					//   headerName.bindProperty("text", "IP1");

					parameterHeadLayoutCell.addContent(new sap.ui.commons.Label({
						width: "10px"
					}));
					parameterHeadLayoutCell.addContent(this.parameterHeaderLabel);

					parameterHeadLayout.createRow(parameterHeadLayoutCell);

					// this.topLayout.addContent(getHorizontalDivider());
					mainLayout.createRow(parameterHeadLayout);
					// this.topLayout.addContent(getHorizontalDivider());
					mainLayout.createRow(parameterLayout);

					// Expression Section

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

					var expressionLayout = new sap.ui.commons.layout.MatrixLayout({
						// widths: ["12px", "80px", "10px"]
					});

					// expressionLayout.createRow(null, getExpressionContainer(expressionEditorFunction, that));
					expressionLayout.createRow(getDefaultValueContainer(expressionEditorFunction, that));

					//this.topLayout.addContent(getHorizontalDivider());
					mainLayout.createRow(expressionHeadLayout);
					// this.topLayout.addContent(getHorizontalDivider());
					mainLayout.createRow(expressionLayout);

					this.topLayout.setModel(that.parameterModel);
				}
				return this.topLayout;
			},
			removeParameterMappings: function() {
				var that = this;
				var executeCommands = [];
				that.inputParameterModel.parameterMappings.foreach(function(parameterMapping) {
					executeCommands.push(new commands.RemoveParameterMappingCommand({
						source: {
							type: "parameter",
							typeName: that.inputParameterModel.name
						},
						mapping: {
							parameterNameOtherView: parameterMapping.parameterNameOtherView,
							parameterName: parameterMapping.parameter ? parameterMapping.parameter.name : "",
							value: parameterMapping.value
						}
					}));
				});
				return executeCommands;
			},
			removeParameterMappingsFromDerived: function(all) {
				var that = this;
				var executeCommands = [];
				if (that.inputParameterModel.derivationRule) {
					that.inputParameterModel.derivationRule.parameterMappings.foreach(function(parameterMapping) {
						if (!parameterMapping.value || all) {
							executeCommands.push(new commands.RemoveParameterMappingCommand({
								source: {
									type: "derivationrule",
									typeName: that.inputParameterModel.name
								},
								mapping: {
									parameterNameOtherView: parameterMapping.parameterNameOtherView,
									parameterName: parameterMapping.parameter ? parameterMapping.parameter.name : "",
									value: parameterMapping.value
								}
							}));
						}
					});
				}
				return executeCommands;
			}
		};

		var getHorizontalDivider = function() {
			var horizontalDivider = new sap.ui.commons.HorizontalDivider({
				width: "100%",
				height: sap.ui.commons.HorizontalDividerHeight.Ruleheight,
				type: sap.ui.commons.HorizontalDividerType.Page
			});
			return horizontalDivider;
		}
		var createInputParameterMatrix = function(expressionEditor, thisObject) {
			var that = thisObject;

			var matrixLayout = new sap.ui.commons.layout.MatrixLayout({
				width: "100%",
				widths: ["30%", "70%"]
			});

			matrixLayout.createRow(null);
			var nameLabel = new sap.ui.commons.Label({
				text: "Name:",
				required: true
			}).addStyleClass("labelFloat");

			var nameText = new sap.ui.commons.TextField({
				width: "80%",
				value: "{/name}",
				liveChange: function(event) {
					var value = event.getParameter("liveValue");
					var errorValue = isNameValid(value);
					if (errorValue) {
						this.setTooltip(errorValue);
						this.setValueState(sap.ui.core.ValueState.Error);
					} else {
						this.setTooltip(null);
						this.setValueState(sap.ui.core.ValueState.None);
					}
				},
				change: function(oevent) {
					this.setValueState(sap.ui.core.ValueState.None);
					this.setTooltip(null);
					var errorValue = isNameValid(oevent.getSource().getValue());
					if (!errorValue) {
						if (that.parameterData.label === "") {
							that.parameterData.label = oevent.getSource().getValue();
						}
						that._execute({
							name: oevent.getSource().getValue(),
							label: that.parameterData.label === undefined ? oevent.getSource().getValue() : that.parameterData.label
						});
						that.parameterModel.updateBindings(true);
					} else {
						var message = errorValue;
						var messageObjects = ["'" + resourceLoader.getText("tit_name") + "'", "'" + that.inputParameterModel.name + "'"];
						message = resourceLoader.getText("msg_message_toast_parameter_error", messageObjects) + " (" + message + ")";
						this.setValue(that.inputParameterModel.name);
						jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
						sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show(message, {
							of: that.topLayout,
							offset: "-10px -100px"
						});
					}
				}
			}).addStyleClass("dummyTest1");

			matrixLayout.createRow(nameLabel, nameText);

			var descriptionLabel = new sap.ui.commons.Label({
				text: resourceLoader.getText("tit_label"),
				required: false
			}).addStyleClass("labelFloat");
			var descriptionText = new sap.ui.commons.TextField({
				width: "80%",
			}).bindProperty("value", "/label");
			descriptionText.addStyleClass("dummyTest2");
			descriptionText.attachChange(function(oevent) {
				that._execute({
					label: oevent.getSource().getValue()
				});
				// that.updateModel();
			});

			matrixLayout.createRow(descriptionLabel, descriptionText);

			var checkBoxMatrixCell = new sap.ui.commons.layout.MatrixLayoutCell();

			var mandatoryCheck = new sap.ui.commons.CheckBox({
				text: resourceLoader.getText("tit_is_mandatory"),
				width: "40%",
				enabled: {
					path: "/mandatory",
					formatter: function() {
						if (that.parameterData.parametetertype === "Derived From Table" || that.parameterData.parametetertype ===
							"Derived From Procedure/Scalar Function") {
							if (!that.parameterData.inputEnabled) {
								return false;
							}
						}
						return true;
					}
				},
				change: function(oevent) {
					that._execute({
						mandatory: oevent.getSource().getChecked()
					});
				}
			}).bindProperty("checked", "/mandatory").addStyleClass("marginFields");

			var multipleEntriesCheck = new sap.ui.commons.CheckBox({
				text: resourceLoader.getText("tit_multiple_entries"),
				change: function(oevent) {
					var commandsList = [];
					if (!oevent.getSource().getChecked()) {
						if (that.inputParameterModel.defaultRanges.count() > 1) {
							for (var i = 1; i < that.inputParameterModel.defaultRanges.count(); i++) {
								commandsList.push(new modelbase.DeleteCommand(that.inputParameterModel.defaultRanges.getAt(i), false));
							}
						}
						if (that.inputParameterModel.defaultRanges.count() < 1) {
							commandsList.push(new commands.CreateParameterDefaultRangeCommand(that.inputParameterModel.name, {
								lowExpression: false,
								lowValue: ""
							}));
						}
					}
					commandsList.push(new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, {
						objectAttributes: {
							multipleSelections: oevent.getSource().getChecked()
						}
					}));
					if (commandsList.length > 0) {
						that._executeDirect(commandsList);
					}
				},
				enabled: {
					path: "/multipleSelections",
					formatter: function() {
						if (that.parameterData.parametetertype === "Derived From Table" || that.parameterData.parametetertype ===
							"Derived From Procedure/Scalar Function") {
							return false;
						}
						return true;
					}
				},
				visible: {
					path: "/multipleSelections",
					formatter: function() {
						if (that.viewNode && that.viewNode.type === "Script") {
							return false;
						}
						return true;
					}
				}
			}).bindProperty("checked", "/multipleSelections").addStyleClass("dummyTest3");

			checkBoxMatrixCell.addContent(mandatoryCheck);
			checkBoxMatrixCell.addContent(multipleEntriesCheck);

			matrixLayout.createRow(null, checkBoxMatrixCell);

			var directDetailsContainer; // getDirectDetailsContainer(expressionEditor,that);
			var columnsDetailsContainer; // getColumnDetailsContainer(expressionEditor,that);
			var staticListContainer; //getStaticListContainer(expressionEditor,that);
			var derivedFromTableListContainer; // getDerivedFromTableListContainer(that);
			var derivedFromProcedureListContainer;
			var currentContainer;

			var typeLabel = new sap.ui.commons.Label({
				text: resourceLoader.getText("tit_parameter_type")
			}).addStyleClass("labelFloat");

			var typeCombo = new sap.ui.commons.DropdownBox({
				width: "80%",
				editable: true,
				value: "Direct",
				change: [

                    function(oEvent) {
						// var control = oEvent.getSource().getSelectedItem();
						var dataCatagory = oEvent.getSource().getSelectedKey()
						if (dataCatagory === 'Direct') {
							that.parameterStackMatrixCell.removeContent(currentContainer);
							that.parameterData.enableConstantHelpButton = false;
							if (!directDetailsContainer)
								directDetailsContainer = getDirectDetailsContainer(expressionEditor, that);
							currentContainer = directDetailsContainer;
							that.parameterHeaderLabel.setText("Parameter Type - Direct");
							/*   that._executeCompound({
                            typeOfElement: null,
                            externalTypeOfElement: null
                        }, {
                            name: that.parameterData.name,
                            primitivetype: that.inlineTypeData.datatype,
                            length: that.inlineTypeData.enableLength ? that.inlineTypeData.length : "",
                            scale: that.inlineTypeData.enableScale ? that.inlineTypeData.scale : "",
                            semanticType: that.inlineTypeData.semantictype
                        }, {}, true, true);*/
						} else if (dataCatagory === 'Column') {
							that.parameterStackMatrixCell.removeContent(currentContainer);
							that.parameterData.enableConstantHelpButton = true;
							if (!columnsDetailsContainer)
								columnsDetailsContainer = getColumnDetailsContainer(expressionEditor, that);
							currentContainer = columnsDetailsContainer;
							that.parameterHeaderLabel.setText("Parameter Type - Column");

							if (that.typeOfElement || that.externalTypeOfElement) {
								var typeOfElements = {};
								if (that.typeOfElement)
									typeOfElements.typeOfElement = that.typeOfElement;
								if (that.externalTypeOfElement)
									typeOfElements.externalTypeOfElement = that.externalTypeOfElement;

								// that._executeCompound(typeOfElements, null, {}, true, true);
							}
						} else if (dataCatagory === 'Derived From Table') {
							that.parameterStackMatrixCell.removeContent(currentContainer);
							if (!derivedFromTableListContainer)
								derivedFromTableListContainer = getDerivedFromTableListContainer(that);
							currentContainer = derivedFromTableListContainer;
							that.parameterHeaderLabel.setText("Parameter Type - Derived From Table");

						} else if (dataCatagory === 'Derived From Procedure/Scalar Function') {
							that.parameterStackMatrixCell.removeContent(currentContainer);
							if (!derivedFromProcedureListContainer)
								derivedFromProcedureListContainer = getDerivedFromProcedureListContainer(that);
							currentContainer = derivedFromProcedureListContainer;
							that.parameterHeaderLabel.setText("Parameter Type - Derived From Procedure/Scalar Functions");

						} else {
							that.parameterStackMatrixCell.removeContent(currentContainer);
							that.parameterData.enableConstantHelpButton = true;
							if (!staticListContainer)
								staticListContainer = getStaticListContainer(expressionEditor, that);
							currentContainer = staticListContainer;
							that.parameterHeaderLabel.setText("Parameter Type - StaticList");
							/* that._executeCompound({
                            typeOfElement: null,
                            externalTypeOfElement: null
                        }, {
                            name: that.parameterData.name,
                            primitivetype: that.inlineTypeData.primitiveType,
                            length: that.inlineTypeData.enableLength ? that.inlineTypeData.length : "",
                            scale: that.inlineTypeData.enableScale ? that.inlineTypeData.scale : "",
                        }, {}, false, true);*/
						}
						that.parameterStackMatrixCell.addContent(currentContainer);
						updateModel(dataCatagory, that);
						parameterProperty = dataCatagory;
						that.buildParameterDetails({
							parameter: that.inputParameterModel,
							isNew: that.isNew
						});
						// that.parameterModel.updateBindings(true);
						// that.parameterModel.updateBindings();
                    },
                    this
                ]
			});

			typeCombo.addStyleClass("dummyTest4");

			var typeListItem = new sap.ui.core.ListItem({
				text: "{parameterTypeName}",
				key: "{parameterTypeName}"
			});

			typeCombo.bindItems({
				path: "/parameterTypes",
				template: typeListItem
			});
			// var parameterTypeModel = new sap.ui.model.json.JSONModel(parameterTypes);
			//   typeCombo.setModel(parameterTypeModel);

			typeCombo.bindProperty("selectedKey", "/parametetertype");

			matrixLayout.createRow(typeLabel, new sap.ui.commons.layout.MatrixLayoutCell({
				content: [typeCombo]
			}));

			var parameterProperty = that.parameterData.parametetertype;
			if (parameterProperty == "Column") {
				if (!columnsDetailsContainer)
					columnsDetailsContainer = getColumnDetailsContainer(expressionEditor, that);
				currentContainer = columnsDetailsContainer;
				typeCombo.setSelectedKey("Column");
			} else if (parameterProperty == "Static List") {
				if (!staticListContainer)
					staticListContainer = getStaticListContainer(expressionEditor, that);
				currentContainer = staticListContainer;
				typeCombo.setSelectedKey("Static List");
			} else if (parameterProperty == "Derived From Table") {
				if (!derivedFromTableListContainer)
					derivedFromTableListContainer = getDerivedFromTableListContainer(that);
				currentContainer = derivedFromTableListContainer;
				typeCombo.setSelectedKey("Derived From Table");
			} else if (parameterProperty == "Derived From Procedure/Scalar Function") {
				if (!derivedFromProcedureListContainer)
					derivedFromProcedureListContainer = getDerivedFromProcedureListContainer(that);
				currentContainer = derivedFromProcedureListContainer;
				typeCombo.setSelectedKey("Derived From Procedure/Scalar Functions");
			} else {
				if (!directDetailsContainer)
					directDetailsContainer = getDirectDetailsContainer(expressionEditor, that);
				currentContainer = directDetailsContainer;
				typeCombo.setSelectedKey("Direct");
			}

			that.parameterStackMatrixCell.addContent(currentContainer);

			matrixLayout.setModel(that.parameterModel);

			matrixLayout.createRow(null);

			var isNameValid = function(nameValue) {
				if (nameValue === "")
					return resourceLoader.getText("msg_column_invalid_empty");
				if (!CalcViewEditorUtil.checkValidUnicodeChar(nameValue)) {
					return resourceLoader.getText("msg_column_invalid_unicode", CalcViewEditorUtil.getInvalidUnicodeCharacters());
				}
				for (var i in that.parameters._values) {
					var parameter = that.parameters._values[i];
					if (parameter !== that.inputParameterModel) {
						if (parameter.name === nameValue)
							return resourceLoader.getText("msg_element_already_exists", parameter.name);
					}
				}
				var regularExpression = /[a-zA-Z0-9_]*/
				if (!regularExpression.test(nameValue))
					return resourceLoader.getText("msg_name_contain_alphanumeric_and_underscore");

				return null;
			}
			var updateModel = function(newParameterType, thisObject) {
				var that = thisObject;
				var commandList = [];
				var changeCommand;
				var createCommand;
				if (parameterProperty === "Column") {
					var deleteCommand = new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, {
						typeOfElementName: undefined,
						hierarchyName: undefined
					});
					commandList.push(deleteCommand);
					if (that.inputParameterModel.derivationRule)
						commandList.push(new modelbase.DeleteCommand(that.inputParameterModel.derivationRule, false));

					commandList = commandList.concat(that.removeParameterMappings());

				} else if (parameterProperty === "Static List") {
					if (that.inputParameterModel.inlineType.valueRanges.count() > 0) {
						that.inputParameterModel.inlineType.valueRanges.foreach(function(valueRange) {
							commandList.push(new modelbase.DeleteCommand(valueRange, false));
						});
					}
					if (that.inputParameterModel.derivationRule)
						commandList.push(new modelbase.DeleteCommand(that.inputParameterModel.derivationRule, false));

				} else if (parameterProperty === "Derived From Table") {

					if (that.inputParameterModel.derivationRule.elementFilters.count() > 0) {
						that.inputParameterModel.derivationRule.elementFilters.foreach(function(elementFilter) {
							commandList.push(new modelbase.DeleteCommand(elementFilter, false));
						});
					}
				} else if (parameterProperty === "Derived From Procedure/Scalar Function") {
					/* commandList.push(new commands.ChangeDerivationRuleCommand(that.inputParameterModel.name, {
                       // lookupEntity: undefined,
                    }));
                    */
					commandList = commandList.concat(that.removeParameterMappingsFromDerived(true));
				} else {
					//if (newParameterType !== "Static List")
					// commandList.push(new modelbase.DeleteCommand(that.inputParameterModel.inlineType, false));
					{
						commandList.push(new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, {
							objectAttributes: {
								semanticType: model.SemanticType.EMPTY
							},
							hierarchyName: undefined
						}));
					}
					if (that.inputParameterModel.derivationRule)
						commandList.push(new modelbase.DeleteCommand(that.inputParameterModel.derivationRule, false));

				}

				if (newParameterType === "Column") {
					that.modelUpdated = true;
					commandList.push(new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, {
						objectAttributes: {
							parameterType: model.ParameterType.COLUMN
						},
						typeAttributes: {
							name: that.parameterData.name,
							primitiveType: undefined,
							length: undefined,
							scale: undefined
						},
						hierarchyName: undefined

					}));
					var parameter = that.undoManager.execute(new modelbase.CompoundCommand(commandList));
					that.modelUpdated = false;
				} else if (newParameterType === "Static List") {
					//  commandList.push( new commands.CreateParameterValueRangeCommand(that.inputParameterModel.name, {
					// name: that.inputParameterModel.name
					// }));

					if (parameterProperty !== "Direct") {
						var staticTypeAttributes = {
							name: that.parameterData.name,
							primitiveType: "VARCHAR",
							length: 13,
							semanticType: model.SemanticType.EMPTY

						};

						commandList.push(new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, {
							objectAttributes: {
								parameterType: model.ParameterType.STATIC_LIST
							},
							typeAttributes: staticTypeAttributes,
							hierarchyName: undefined

						}));
						that.undoManager.execute(new modelbase.CompoundCommand(commandList));
					} else {
						commandList.push(new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, {
							objectAttributes: {
								parameterType: model.ParameterType.STATIC_LIST
							},
							hierarchyName: undefined
						}));
						that.undoManager.execute(new modelbase.CompoundCommand(commandList));
					}

				} else if (newParameterType === "Derived From Table") {
					if (!that.inputParameterModel.derivationRule) {
						commandList.push(new commands.CreateDerivationRuleCommand(that.inputParameterModel.name, {}));
					}
					commandList.push(new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, {
						objectAttributes: {
							parameterType: model.ParameterType.DERIVED_FROM_TABLE,
							multipleSelections: false,
							mandatory: parameterProperty === "Derived From Procedure/Scalar Function" ? that.parameterData.mandatory : false
						},
						typeAttributes: {
							name: that.parameterData.name,
							primitiveType: undefined,
							length: undefined,
							scale: undefined
						},
						hierarchyName: undefined
					}));

					if (that.inputParameterModel.defaultRanges.count() > 0) {
						that.inputParameterModel.defaultRanges.foreach(function(defaultRange) {
							commandList.push(new modelbase.DeleteCommand(defaultRange, false));
						});
					}
					commandList.push(new commands.CreateParameterDefaultRangeCommand(that.inputParameterModel.name, {
						lowExpression: false,
						lowValue: ""
					}));

					that.undoManager.execute(new modelbase.CompoundCommand(commandList));

				} else if (newParameterType === "Derived From Procedure/Scalar Function") {
					commandList.push(new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, {
						objectAttributes: {
							parameterType: model.ParameterType.DERIVED_FROM_PROCEDURE,
							multipleSelections: false,
							mandatory: parameterProperty === "Derived From Table" ? that.parameterData.mandatory : false
						},
						typeAttributes: {
							name: that.parameterData.name,
							primitiveType: undefined,
							length: undefined,
							scale: undefined
						},
						hierarchyName: undefined
					}));
					if (!that.inputParameterModel.derivationRule) {
						commandList.push(new commands.CreateDerivationRuleCommand(that.inputParameterModel.name, {}));
					}
					if (that.inputParameterModel.defaultRanges.count() > 0) {
						that.inputParameterModel.defaultRanges.foreach(function(defaultRange) {
							commandList.push(new modelbase.DeleteCommand(defaultRange, false));
						});
					}
					commandList.push(new commands.CreateParameterDefaultRangeCommand(that.inputParameterModel.name, {
						lowExpression: false,
						lowValue: ""
					}));
					that.undoManager.execute(new modelbase.CompoundCommand(commandList));
				} else {
					var typeAttributes = {
						name: that.parameterData.name,
						primitiveType: "VARCHAR",
						length: 13,
						semanticType: model.SemanticType.EMPTY
					};

					commandList.push(new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, {
						objectAttributes: {
							parameterType: model.ParameterType.DIRECT
						},
						typeAttributes: typeAttributes,
						hierarchyName: undefined
					}));
					that.undoManager.execute(new modelbase.CompoundCommand(commandList));
				}
			};

			return matrixLayout;

		};

		var getDirectDetailsContainer = function(expressionEditor, thisObject) {

			var that = thisObject;

			var directMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
				widths: ["30%", "70%"]
			});
			var semanticLabel = new sap.ui.commons.Label({
				text: resourceLoader.getText("tit_semantic_type")
			}).addStyleClass("labelFloat");
			var semanticCombo = new sap.ui.commons.DropdownBox({
				width: "80%",
				selectedKey: {
					path: "/semantictype",
					formatter: function(semanticType) {
						if (semanticType === model.SemanticType.UNIT_OF_MEASURE) {
							return model.SemanticType.UNIT_OF_MEASURE;
						} else if (semanticType === model.SemanticType.CURRENCY_CODE) {
							return model.SemanticType.CURRENCY_CODE;
						} else if (semanticType === model.SemanticType.DATE) {
							return model.SemanticType.DATE;
						} else {
							return "";
						}

					}

				}
			}).addStyleClass("dummyTest5");

			semanticCombo.attachChange(function(oevent) {
				var selectedKey = oevent.getParameter("selectedItem").getKey();
				if (selectedKey === "Date") {
					that.parameterData.primitiveType = "DATE";
					that.parameterData.enableLength = false;
					that.parameterData.enableScale = false;
					that.parameterData.length = undefined;
					that.parameterData.scale = undefined;
				}
				that.parameterData.semantictype = selectedKey;
				that._execute({}, {
					semanticType: selectedKey,
					primitiveType: that.parameterData.primitiveType,
					length: that.parameterData.length,
					scale: that.parameterData.scale
				});

				that.parameterModel.updateBindings(true);
			});

			var semanticListItem = new sap.ui.core.ListItem({
				customData: [new sap.ui.core.CustomData({
					key: "name",
					value: "{key}"
				})]
			});
			semanticListItem.bindProperty("text", {
				path: "semanticType",
				formatter: function(semanticType) {
					if (semanticType === model.SemanticType.UNIT_OF_MEASURE) {
						return "Unit Of Measure";
					} else if (semanticType === model.SemanticType.CURRENCY_CODE) {
						return "Currency";
					} else if (semanticType === model.SemanticType.DATE) {
						return "Date";
					} else {
						return "";
					}

				}
			});
			semanticListItem.bindProperty("key", "key");

			semanticCombo.bindItems({
				path: "/semanticTypes",
				template: semanticListItem
			});

			// var semanticModel = new sap.ui.model.json.JSONModel(semanticTypes);
			// semanticCombo.setModel(semanticModel);

			directMatrixLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
				height: "10px"
			}));
			directMatrixLayout.createRow(semanticLabel, semanticCombo);

			directMatrixLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
				content: getDirectDetails(that),
				colSpan: 2
			}));

			directMatrixLayout.setModel(that.parameterModel);

			return directMatrixLayout;
		};
		var getColumnDetailsContainer = function(expressionEditor, thisObject) {

			var that = thisObject;

			var currentViewName = that.model.columnView.name;
			var selectedView;

			var columnMatrix = new sap.ui.commons.layout.MatrixLayout({
				width: "100%",
				widths: ["30%", "70%"]
			});

			var viewLabel = new sap.ui.commons.Label({
				text: resourceLoader.getText("tit_view_table_value_help"),
				required: true
			}).addStyleClass("labelFloat");

			var viewText = new sap.ui.commons.TextField({
				width: "70%",
				editable: false,
				value: {
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
				}
			}).addStyleClass("inputBorder");

			viewText.attachChange(function(oevent) {
				//   that.updateModel();
			});

			var viewButton = new sap.ui.commons.Button({
				text: "...",
				press: function() {
					var findDialog = new NewFindDialog("", {
						multiSelect: false,
						types: ["TABLE", "CALCULATIONVIEW", "ATTRIBUTEVIEW", "ANALYTICVIEW"],
						noOfSelection: 1,
						context: that.context,
						onOK: function(selectedResource) {
							if (selectedResource) {
								var viewDetails = selectedResource[0];
								viewDetails.viewNodeName = that.model.columnView.viewNodes.toArray()[0].name;
								//viewDetails.context = self.editor.extensionParam.builder._context;
								var executeCommands = [];
								that.modelUpdated = true;
								var changeParameterCommand = new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, {
									externalTypeOfEntity: viewDetails,
									typeOfElementName: undefined,
									hierarchyName: undefined
								});
								executeCommands.push(changeParameterCommand);
								if (that.inputParameterModel.externalTypeOfEntity) {
									if (that.inputParameterModel.externalTypeOfEntity.packageName !== viewDetails.packageName || that.inputParameterModel.externalTypeOfEntity
										.name !== viewDetails.name) {
										executeCommands = executeCommands.concat(that.removeParameterMappings());
									}
								}
								var parameter = that.undoManager.execute(new modelbase.CompoundCommand(executeCommands));
								that.modelUpdated = false;

								var updateCombo = function(event) {

									that.parameterData.elements.splice(0, that.parameterData.elements.length);
									Array.prototype.slice.call(that.parameterData.elements, 0);

									for (var elementName in selectedView.elements._values) {
										var element = selectedView.elements._values[elementName];
										if (!element.aggregationBehavior || element.aggregationBehavior === model.AggregationBehavior.NONE) {
											that.parameterData.elements.push(element);
										}
									}
									that.parameterModel.updateBindings();
									referenceCombo.bindItems({
										path: "/elements",
										template: referenceListItem
									});
									/*  updateReferenceCombo(selectedView,model,that);
                              that.externalTypeOfElement= selectedView.elements.count()>0?selectedView.elements._values[0]:null;
                              that.parameterData.model=model.getData();
                              referenceCombo.bindItems({
                                  path: "/model",
                                   template: referenceListItem
                                     });
                               if(that. externalTypeOfElement){
                               that.typeOfElement=null;
                                that._execute({
                                 typeOfElement: that.typeOfElement,
                                  externalTypeOfElement: that.externalTypeOfElement
                                  }, {});
                               }*/
								}

								selectedView = that.inputParameterModel.externalTypeOfEntity;
								that.parameterData.entity = selectedView;
								referenceCombo.setValue("");
								that.parameterData.referenceElement = undefined;
								if (that.parameterData.entity) {
									viewText.setValue(that.parameterData.entity.getFullyQualifiedName());
								} else {
									var packageName = viewDetails.packageName ? viewDetails.packageName : viewDetails.schemaName;
									viewText.setValue(packageName + "." + viewDetails.name);
								}
								ModelProxyResolver.ProxyResolver.resolve(that.model, that.context, updateCombo);
								// referenceCombo.setValueState(sap.ui.core.ValueState.Error);
								if (referenceCombo.getValueState() === sap.ui.core.ValueState.None && !that.isNew) {
									CalcViewEditorUtil.showErrorMessageTooltip(referenceCombo, resourceLoader.getText("msg_column_invalid_empty"));
								}
								// openToolTip(resourceLoader.getText("msg_column_invalid_empty"), referenceCombo);
								that.parameterModel.updateBindings(true);

							}
						}
					});
				}
			});

			// viewButton.addStyleClass("buttonHeight");

			var referenceLabel = new sap.ui.commons.Label({
				text: resourceLoader.getText("tit_reference_column"),
				required: true
			}).addStyleClass("labelFloat");
			var oImage = new sap.ui.commons.Image({
				src: {
					path: "referenceElement",
					formatter: function(referenceElement) {
						if (referenceElement) {
							return that.getIconPath(referenceElement, that.parameterData.entity);
						}

					}
				}
				//src: resourceLoader.getImagePath("Attribute.png")
			});
			var referenceColumnField = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomValueHelpField({
				width: "80%",
				iconURL: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/F4-Help_icon_regular.png",
                iconHoverURL: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/F4-Help_icon_hover.png",
				canedit: true,
				valueHelpRequest: function(event) {
					var selectedView = that.model.columnView.getDefaultNode();
					if (that.inputParameterModel.externalTypeOfEntity) {
						selectedView = that.inputParameterModel.externalTypeOfEntity;
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
							if (that.isContainsHierarchy(element, that.inputParameterModel.hierarchy)) {
								hierarchyName = that.inputParameterModel.hierarchy.name;
							}
							that._executeDirect(new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, {
								typeAttributes: {
									primitiveType: element.inlineType ? element.inlineType.primitiveType : undefined,
									length: element.inlineType ? element.inlineType.length : undefined,
									scale: element.inlineType ? element.inlineType.scale : undefined
								},
								typeOfElementName: element.name,
								entityFQN: entityFQN,
								hierarchyName: hierarchyName
							}));
							that.parameterData.referenceElement = element;
							that.parameterModel.updateBindings(true);
						}
					};
					var toopPopup = new OutputToolPopup({
						viewNode: selectedView,
						opener: referenceColumnField,
						callback: selectedElement
					});
					toopPopup.open();
				}
			}).addStyleClass("dummyTest9");
			referenceColumnField.bindProperty("value", {
				path: "/referenceElement",
				formatter: function(referenceElement) {
					if (referenceElement) {
						if (referenceColumnField.getTooltip() !== null) {
							CalcViewEditorUtil.clearErrorMessageTooltip(referenceColumnField);
						}
						if (referenceElement.$getContainer() instanceof model.Entity) {
							return referenceElement.$getContainer().name + "." + referenceElement.name;
						}
						return referenceElement.name;
					} else {
						if (!that.isNew) {
							if (that.parameterData.parametetertype === "Column" && referenceColumnField.getValueState() === sap.ui.core.ValueState.None) {
								CalcViewEditorUtil.showErrorMessageTooltip(referenceColumnField, resourceLoader.getText("msg_field_not_empty"));
							}
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
			var referenceCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
				width: "80%",
				canedit: false,
				selectedKey: {
					path: "referenceElement",
					formatter: function(referenceElement) {
						if (referenceElement) {
							// referenceCombo.setValueState(sap.ui.core.ValueState.None);
							// referenceCombo.setTooltip(null);
							if (referenceCombo.getTooltip() !== null) {
								CalcViewEditorUtil.clearErrorMessageTooltip(referenceCombo);
							}
							return referenceElement.name;
						} else {
							if (referenceCombo) {
								referenceCombo.setValue("");
								if (!that.isNew) {
									if (that.parameterData.parametetertype === "Column" && referenceCombo.getValueState() === sap.ui.core.ValueState.None) {
										CalcViewEditorUtil.showErrorMessageTooltip(referenceCombo, resourceLoader.getText("msg_field_not_empty"));
									}
								} else if (referenceCombo.getTooltip() !== null) {
									CalcViewEditorUtil.clearErrorMessageTooltip(referenceCombo);
								}
								// referenceCombo.setValueState(sap.ui.core.ValueState.Error);
								// openToolTip(resourceLoader.getText("msg_column_invalid_empty"), referenceCombo);
							}
						}
					}

				},
				value: {
					path: "referenceElement",
					formatter: function(referenceElement) {
						if (referenceElement) {
							return referenceElement.name;
						} else {
							return "";
						}
					}

				}
				//   icon: oImage
			}).addStyleClass("borderIconCombo");

			referenceCombo.attachChange(function(oevent) {

				if (that.parameterData.entity && (that.parameterData.entity !== that.model.columnView)) {
					var externalTypeOfElement = that.parameterData.entity.elements._values[oevent.getParameter("newValue")];
					if (externalTypeOfElement) {
						that._execute({}, {
							primitiveType: externalTypeOfElement.inlineType ? externalTypeOfElement.inlineType.primitiveType : undefined,
							length: externalTypeOfElement.inlineType ? externalTypeOfElement.inlineType.length : undefined,
							scale: externalTypeOfElement.inlineType ? externalTypeOfElement.inlineType.scale : undefined
						}, externalTypeOfElement.name, {}, null);
						that.parameterData.referenceElement = externalTypeOfElement;
					}
				} else {
					var typeOfElement = that.model.columnView.getDefaultNode().elements._values[oevent.getParameter("newValue")];
					if (typeOfElement) {
						var hierarchyName = null;
						if (that.isContainsHierarchy(typeOfElement, that.inputParameterModel.hierarchy)) {
							hierarchyName = that.inputParameterModel.hierarchy.name;
						}
						that._execute({}, {
							primitiveType: typeOfElement.inlineType ? typeOfElement.inlineType.primitiveType : undefined,
							length: typeOfElement.inlineType ? typeOfElement.inlineType.length : undefined,
							scale: typeOfElement.inlineType ? typeOfElement.inlineType.scale : undefined
						}, typeOfElement.name, {}, hierarchyName);
						that.parameterData.referenceElement = typeOfElement;
					}
				}
				that.parameterModel.updateBindings(true);
				/*if (selectedView.name == currentViewName) {
                that.typeOfElement = getReferenceElement(selectedView, oevent.getSource().getSelectedKey(),that);
                that.externalTypeOfElement = null;
            } else {
                that.typeOfElement = null;
                that.externalTypeOfElement = getReferenceElement(selectedView, oevent.getSource().getSelectedKey(),that);
            }

            that._execute({
                typeOfElement: that.typeOfElement,
                externalTypeOfElement: that.externalTypeOfElement
            }, {});
            */
			}, referenceCombo);

			// var model = new sap.ui.model.json.JSONModel();
			// referenceCombo.setModel(model);

			var referenceListItem = new sap.ui.core.ListItem({});
			referenceListItem.bindProperty("text", {
				path: "",
				formatter: function(element) {
					return element ? element.name : "";
				}
			});
			referenceListItem.bindProperty("icon", {
				path: "",
				formatter: function(element) {
					if (element) {
						return that.getIconPath(element, that.parameterData.entity);
					}

					// return resourceLoader.getImagePath(element.aggregationBehavior === "NONE" ? "Dimension.png" : "Measure.png");
				}
			});
			referenceListItem.bindProperty("key", {
				path: "",
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
            });*/

			var viewCell = new sap.ui.commons.layout.MatrixLayoutCell({
				width: "80%"
			});

			viewCell.addContent(viewText);
			viewCell.addContent(viewButton);
			columnMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
				height: "10px"
			}));
			columnMatrix.createRow(viewLabel, viewCell);
			columnMatrix.createRow(referenceLabel, new sap.ui.commons.layout.MatrixLayoutCell({
				width: "80%",
				content: [referenceColumnField]
			}));
			// columnMatrix.createRow(null, referenceColumnField);

			function updateViewText(selectedObject) {

			}

			function setReferenceComboSelectedItem(value) {
				for (var i = 0; i < referenceCombo.getItems(); i++) {
					var listItem = referenceCombo.getItems()[i];
					if (listItem.getText() === value) {
						referenceCombo.setSelectedItemId(listItem.getId());
					}
				}
			}

			var hierarchyLabel = new sap.ui.commons.Label({
				text: resourceLoader.getText("Hierarchy:")
			}).addStyleClass("labelFloat");
			var hierarchyImage = new sap.ui.commons.Image({
				src: {
					path: "hierarchyElement",
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
					path: "hierarchies",
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
							that._executeDirect(new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, {
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

			/*columnMatrix.createRow(hierarchyLabel, new sap.ui.commons.layout.MatrixLayoutCell({
				width: "80%",
				content: [hierarchyCombo]
			}));*/

			columnMatrix.setModel(that.parameterModel);

			return columnMatrix;
		};

		var getStaticListContainer = function(expressionEditor, thisObject) {

			var focusLastValueRange;

			var that = thisObject;

			var staticListMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
				width: "100%",
				widths: ["100%"]
			});
			staticListMatrixLayout.createRow(null);

			var tableMatrixCell = new sap.ui.commons.layout.MatrixLayoutCell({
				rowSpan: 5,
				colSpan: 2
			});

			var staticListTable = new sap.ui.table.Table({
				visibleRowCount: 4,
				width: "100%"
			}).addStyleClass("dummyTest10");

			var toolBar = new sap.ui.commons.Toolbar();

			var createIcon = new sap.ui.commons.Button({
				icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
				// text: resourceLoader.getText("tol_add"),
				tooltip: resourceLoader.getText("tol_add"),
				press: function() {
					if (that.parameterModel.getData()) {
						var text = getNextStaticText(that.parameterModel, that.inputParameterModel.name);
						that.modelUpdated = true;
						var createValueRangeCommand = new commands.CreateParameterValueRangeCommand(that.inputParameterModel.name, {
							value: text,
							label: text
						});
						var valueRange = that.undoManager.execute(new modelbase.CompoundCommand(createValueRangeCommand));
						that.parameterModel.getData().valueRanges = that.getValueRanges();
						focusLastValueRange = valueRange;
						that.parameterModel.updateBindings(true);
						that.modelUpdated = false;

						staticListTable.setSelectionInterval(that.parameterModel.getData().valueRanges.length - 1, that.parameterModel.getData().valueRanges
							.length - 1);
						/* staticListTable.getRows()[that.parameterModel.getData().valueRanges.length - 1].getFocusDomRef = function() {
                            return this.getDomRef().firstChild.nextSibling;
                        }
                        staticListTable.getRows()[that.parameterModel.getData().valueRanges.length - 1].getFocusInfo = function() {
                            return {
                                id: this.getId(),
                                idx: this.sdas,
                            }
                        }
                        staticListTable.getRows()[that.parameterModel.getData().valueRanges.length - 1].applyFocusInfo = function() {
                            var oDomRef = this.getDomRef();
                            if (oDomRef) {
                                this.sds = oFocusInfo.idx;
                                this.focus();
                            }
                        } */
						//  that.updateModel();
					}
				}
			}).addStyleClass("dummyTest11");
			var deleteIcon = new sap.ui.commons.Button({
				icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
				// text: resourceLoader.getText("tol_remove"),
				tooltip: resourceLoader.getText("tol_remove"),
				enabled: {
					path: "name",
					formatter: function() {
						if (that.parameterModel.getData().valueRanges && that.parameterModel.getData().valueRanges.length > 0) {
							return true;
						} else {
							return false;
						}
					}
				},
				press: function() {
					var removableValueRanges = [];
					if (that.parameterModel.getData().hasOwnProperty("valueRanges")) {
						var valueRanges = that.parameterModel.getData().valueRanges;
						for (var i = staticListTable.getSelectedIndices().length; i > 0; i--) {
							var selectedIndex = staticListTable.getSelectedIndices()[i - 1];
							removableValueRanges.push(valueRanges[selectedIndex].valueRange);
							staticListTable.removeSelectionInterval(selectedIndex, selectedIndex);
						}
					}
					var deleteCommands = [];
					for (var j = 0; j < removableValueRanges.length; j++) {
						deleteCommands.push(new modelbase.DeleteCommand(removableValueRanges[j], false));
					}
					that.modelUpdated = true;
					that.undoManager.execute(new modelbase.CompoundCommand(deleteCommands));
					that.parameterModel.getData().valueRanges = that.getValueRanges();
					that.parameterModel.updateBindings(true);
					that.modelUpdated = false;
				}

			});
			toolBar.addRightItem(createIcon);
			toolBar.addRightItem(deleteIcon);
			toolBar.addItem(new sap.ui.commons.Label({
				text: resourceLoader.getText("tit_list_values")
			})).addStyleClass("parameterToolbarStyle");
			staticListTable.setToolbar(toolBar);
			toolBar.setModel(that.parameterModel);

			tableMatrixCell.addContent(staticListTable);

			var nameTextField = new sap.ui.commons.TextField();
			nameTextField.bindProperty("value", {
				path: "valueRange",
				formatter: function(valueRange) {
					if (focusLastValueRange && focusLastValueRange[0] === valueRange) {
						nameTextField.focus();
						focusLastValueRange = undefined;
					}
					return valueRange ? valueRange.value : "";
				}
			});
			nameTextField.attachChange(function(oevent) {
				var newName = oevent.getParameter("newValue");
				var existingValueRange = that.inputParameterModel.inlineType.valueRanges.get(newName);
				if (newName !== "" && !existingValueRange) {
					// oevent.getSource().setValueState(sap.ui.core.ValueState.None);
					// oevent.getSource().setTooltip(null);
					if (oevent.getSource().getTooltip() !== null) {
						CalcViewEditorUtil.clearErrorMessageTooltip(oevent.getSource());
					}
					var valueRange = oevent.getSource().getBindingContext().getProperty("valueRange");
					that.modelUpdated = true;
					var changeValueRangeCommand = new commands.ChangeParameterValueRangeCommand(that.inputParameterModel.name, valueRange.value, {
						value: newName
					});
					that.undoManager.execute(new modelbase.CompoundCommand(changeValueRangeCommand));
					that.modelUpdated = false;
					that.parameterModel.updateBindings(true);
					staticListTable.setModel(that.parameterModel);
				} else {
					if (newName === "") {
						//CalcViewEditorUtil.showErrorMessageTooltip(oevent.getSource(),resourceLoader.getText("txt_length_not_empty"));
						//   oevent.getSource().setValueState(sap.ui.core.ValueState.Error);
						//    openToolTip("value should not be empty",oevent.getSource());
					} else if (existingValueRange) {
						//CalcViewEditorUtil.showErrorMessageTooltip(oevent.getSource(),resourceLoader.getText("txt_length_not_empty"));
						//  oevent.getSource().setValueState(sap.ui.core.ValueState.Error);
						// openToolTip("value already exist",oevent.getSource());
					}
				}
			});

			var valueTextField = new sap.ui.commons.TextField();
			valueTextField.bindProperty("value", {
				path: "valueRange",
				formatter: function(valueRange) {
					return valueRange ? valueRange.label : "";
				}
			});

			valueTextField.attachChange(function(oevent) {
				var newDescription = oevent.getParameter("newValue")
				var valueRange = oevent.getSource().getBindingContext().getProperty("valueRange");
				that.modelUpdated = true;
				var changeValueRangeCommand = new commands.ChangeParameterValueRangeCommand(that.inputParameterModel.name, valueRange.value, {
					// label: newDescription
					defaultDescription: newDescription
				});
				that.undoManager.execute(new modelbase.CompoundCommand(changeValueRangeCommand));
				that.modelUpdated = false;
				that.parameterModel.updateBindings(true);
				staticListTable.setModel(that.parameterModel);
			});

			var nameColumn = new sap.ui.table.Column({
				width: "100%",
				label: new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_name")
				}),
				template: nameTextField
			});
			nameColumn.setName(resourceLoader.getText("tit_name"));

			var valueColumn = new sap.ui.table.Column({
				width: "100%",
				label: new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_label")
				}),
				template: valueTextField
			});
			valueColumn.setName(resourceLoader.getText("tit_label"));

			staticListTable.addColumn(nameColumn);
			staticListTable.addColumn(valueColumn);

			staticListTable.bindRows("/valueRanges");
			staticListTable.setModel(that.parameterModel);

			staticListMatrixLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
				content: getDirectDetails(that),
				colSpan: 2
			}));
			/*staticListMatrixLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
            content: getExpressionContainer(expressionEditor),
            colSpan: 2
        }));*/

			staticListMatrixLayout.createRow(tableMatrixCell);

			return staticListMatrixLayout;
		}

		var getDerivedFromTableListContainer = function(thisObject) {
			var selectedTable;
			var that = thisObject;
			var derivedMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
				widths: ["30%", "70%"]
			});

			var tableLabel = new sap.ui.commons.Label({
				text: resourceLoader.getText("tit_table_name"),
				required: true
			}).addStyleClass("labelFloat");

			var tableText = new sap.ui.commons.TextField({
				width: "75%",
				editable: false,
				value: {
					path: "/lookupEntity",
					formatter: function(value) {
						if (value) {
							if (value.packageName) {
								return value.fqName;
							} else {
								if (value.physicalSchema) {
									if (value.schemaName === value.physicalSchema) {
										return value.fqName;
									} else {
										var schemaName = value.schemaName + "(" + value.physicalSchema + ")";
										return "\"" + schemaName + "\"" + "." + value.name;
									}
								} else {
									return value.fqName;
								}
							}
						} else {
							return "";
						}
					}
				}
			}).addStyleClass("inputBorder");

			tableText.attachChange(function(oevent) {

			});

			var tableButton = new sap.ui.commons.Button({
				text: "...",
				press: function() {
					var findDialog = new NewFindDialog("", {
						multiSelect: false,
						noOfSelection: 1,
						types: ["TABLE"],
						context: that.context,
						onOK: function(selectedResource) {
							if (selectedResource) {
								var derivationRule = that.inputParameterModel.derivationRule;
								var viewDetails = selectedResource[0];
								viewDetails.viewNodeName = that.model.columnView.viewNodes.toArray()[0].name;
								//viewDetails.context = self.editor.extensionParam.builder._context;

								that.parameterData.derivationRules.splice(0, that.parameterData.derivationRules.length);
								Array.prototype.slice.call(that.parameterData.derivationRules, 0);

								var commandList = [];
								if (that.inputParameterModel.derivationRule) {
									for (var i = 0; i < that.inputParameterModel.derivationRule.elementFilters.count(); i++) {
										commandList.push(new modelbase.DeleteCommand(that.inputParameterModel.derivationRule.elementFilters._values[i], false));
									}
								}

								var changeDerivationRuleCommand = new commands.ChangeDerivationRuleCommand(that.inputParameterModel.name, {
									lookupEntity: viewDetails,
									resultElementName: "",
								});
								commandList.push(changeDerivationRuleCommand);

								if (commandList.length > 0) {
									this.modelUpdated = true;
									that.undoManager.execute(new modelbase.CompoundCommand(commandList));
									this.modelUpdated = false;
								}
								var updateCombo = function(event) {
									that.parameterData.lookupElements.splice(0, that.parameterData.lookupElements.length);
									Array.prototype.slice.call(that.parameterData.lookupElements, 0);
									if (derivationRule && derivationRule.lookupEntity) {
										for (var element in derivationRule.lookupEntity.elements._values) {
											that.parameterData.lookupElements.push({
												column: derivationRule.lookupEntity.elements._values[element]
											});
										}
									}
									that.parameterModel.updateBindings(true);

									/* referenceCombo.bindItems({
                                    path: "/elements",
                                    template: referenceListItem
                                });*/
								};
								if (derivationRule)
									that.parameterData.lookupEntity = derivationRule.lookupEntity;
								that.parameterData.resultElementName = "";
								referenceCombo.setValue("");
								if (that.parameterData.lookupEntity) {
									tableText.setValue(that.parameterData.lookupEntity.getFullyQualifiedName());
								} else {
									var packageName = viewDetails.packageName ? viewDetails.packageName : viewDetails.schemaName;
									tableText.setValue(packageName + "." + viewDetails.name);
								}
								ModelProxyResolver.ProxyResolver.resolve(that.model, that.context, updateCombo);
								if (referenceCombo.getValueState() === sap.ui.core.ValueState.None && !that.isNew) {
									CalcViewEditorUtil.showErrorMessageTooltip(referenceCombo, resourceLoader.getText("msg_column_invalid_empty"));
								}
								// referenceCombo.setValueState(sap.ui.core.ValueState.Error);
								// openToolTip(resourceLoader.getText("msg_column_invalid_empty"), referenceCombo);
								that.parameterModel.updateBindings(true);

							}
						}
					});
				}
			}).addStyleClass("dummyTest18");

			// viewButton.addStyleClass("buttonHeight");

			var referenceLabel = new sap.ui.commons.Label({
				text: resourceLoader.getText("tit_return_column"),
				required: true
			}).addStyleClass("labelFloat");
			var oImage = new sap.ui.commons.Image({
				src: {
					path: "resultElementName",
					formatter: function(resultElementName) {
						if (resultElementName) {
							var element = that.parameterData.lookupEntity.elements.get(resultElementName);
							if (element) {
								return that.getIconPath(element, that.parameterData.lookupEntity);
							}
						}
					}
				}
				//src: resourceLoader.getImagePath("Attribute.png")
			});
			var referenceCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
				width: "80%",
				editable: true,
				canedit: false
				// icon: oImage
			}).addStyleClass("borderIconCombo");

			/*referenceCombo.$('select').selectize({
        onInitialize: function() {
            this.$control_input.attr("readonly","readonly");

        }
    });*/
			/*  referenceCombo.onAfterRendering(function(event){
            var container = this.$();
             container.children()[0];
        });
        */
			referenceCombo.attachChange(function(oevent) {

				that.typeOfElement = null;
				if (oevent.getParameter("selectedItem")) {
					var column = oevent.getParameter("selectedItem").getBindingContext().getProperty("");
					var inlineType;
					if (column.column) {
						inlineType = column.column.inlineType;
					}
					var changeElementFilterCommand = new commands.ChangeDerivationRuleCommand(that.inputParameterModel.name, {
						resultElementName: oevent.getParameter("newValue")
					});
					var changeParameterPropertiesCommand = new commands.ChangeParameterPropertiesCommand(that.inputParameterModel.name, {
						typeAttributes: {
							name: that.inputParameterModel.name,
							primitiveType: inlineType ? inlineType.primitiveType : undefined,
							length: inlineType ? inlineType.length : undefined,
							scale: inlineType ? inlineType.scale : undefined
						}
					});

					this.modelUpdated = true;
					that.undoManager.execute(new modelbase.CompoundCommand([changeElementFilterCommand, changeParameterPropertiesCommand]));
					that.parameterData.resultElementName = oevent.getParameter("newValue");
					// that.parameterData.derivationRules = that.getDerivedRules();
					that.parameterModel.updateBindings(true);
					this.modelUpdated = false;
				}
			}, referenceCombo);

			// var model = new sap.ui.model.json.JSONModel();
			//referenceCombo.setModel(model);

			var referenceListItem = new sap.ui.core.ListItem({});
			referenceListItem.bindProperty("text", {
				path: "column",
				formatter: function(element) {
					return element ? element.name : "";
				}
			});
			referenceListItem.bindProperty("key", {
				path: "column",
				formatter: function(element) {
					return element ? element.name : "";
				}
			});
			referenceListItem.bindProperty("icon", {
				path: "column",
				formatter: function(element) {
					if (element) {
						return that.getIconPath(element, that.parameterData.lookupEntity);
					}

					// return resourceLoader.getImagePath(element.aggregationBehavior === "NONE" ? "Dimension.png" : "Measure.png");
				}
			});

			var listBox = new sap.ui.commons.ListBox({
				displayIcons: true,
				items: {
					path: "/lookupElements",
					template: referenceListItem
				}
			});
			referenceCombo.setListBox(listBox);
			/* referenceCombo.bindItems({
                path: "/lookupElements",
                template: referenceListItem
            });*/

			referenceCombo.bindProperty("selectedKey", {
				path: "/resultElementName",
				formatter: function(resultEmenetName) {
					if (resultEmenetName && resultEmenetName !== "") {
						// referenceCombo.setValueState(sap.ui.core.ValueState.None);
						// referenceCombo.setTooltip(null);
						if (referenceCombo.getTooltip() !== null) {
							CalcViewEditorUtil.clearErrorMessageTooltip(referenceCombo);
						}
						return resultEmenetName;
					} else if (referenceCombo) {
						referenceCombo.setValue("");
						// referenceCombo.setValueState(sap.ui.core.ValueState.Error);
						if (!that.isNew) {
							if (that.parameterData.parametetertype === "Derived From Table" && referenceCombo.getValueState() === sap.ui.core.ValueState.None) {
								CalcViewEditorUtil.showErrorMessageTooltip(referenceCombo, resourceLoader.getText("msg_field_not_empty"));
							}
						} else if (referenceCombo.getTooltip() !== null) {
							CalcViewEditorUtil.clearErrorMessageTooltip(referenceCombo);
						}
						// openToolTip("Field should not be empty", referenceCombo);
					}

				}
			});

			var tableCell = new sap.ui.commons.layout.MatrixLayoutCell();

			tableCell.addContent(tableText);
			tableCell.addContent(tableButton);
			derivedMatrixLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
				height: "10px"
			}));
			derivedMatrixLayout.createRow(tableLabel, tableCell);
			derivedMatrixLayout.createRow(referenceLabel, new sap.ui.commons.layout.MatrixLayoutCell({
				width: "80%",
				content: [referenceCombo]
			}));

			if (that.inputParameterModel.DerivationRule && that.inputParameterModel.DerivationRule.lookupEntity) {
				selectedTable = that.inputParameterModel.DerivationRule.lookupEntity;
				updateReferenceCombo(selectedTable, model, that);
			}
			var inputEnabledCheck = new sap.ui.commons.CheckBox({
				text: resourceLoader.getText("Input Enabled"),
				width: "30%",
				change: function(oevent) {
					var executeCommands = [];
					if (!that.inputParameterModel.derivationRule || that.inputParameterModel.derivationRule === null) {
						var createDerivationRuleCommand = new commands.CreateDerivationRuleCommand(that.inputParameterModel.name, {
							inputEnabled: oevent.getSource().getChecked()
						});
						executeCommands.push(createDerivationRuleCommand);
					}
					var changeDerivationRuleCommand = new commands.ChangeDerivationRuleCommand(that.inputParameterModel.name, {
						inputEnabled: oevent.getSource().getChecked(),
						mandatory: oevent.getSource().getChecked() ? that.parameterData.mandatory : false
					});
					executeCommands.push(changeDerivationRuleCommand);
					that._executeDirect(executeCommands);

				}
			}).addStyleClass("dummyTest19");
			inputEnabledCheck.bindProperty("checked", "/inputEnabled");

			derivedMatrixLayout.createRow(null, inputEnabledCheck);

			var tableMatrixCell = new sap.ui.commons.layout.MatrixLayoutCell({
				rowSpan: 5,
				colSpan: 2

			});

			var derivedFromTable = new sap.ui.table.Table({
				visibleRowCount: 4,
				width: "100%"
			}).addStyleClass("dummyTest13");

			var toolBar = new sap.ui.commons.Toolbar();

			var createIcon = new sap.ui.commons.Button({
				icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
				// text: resourceLoader.getText("tol_add"),
				tooltip: resourceLoader.getText("tol_add"),
				press: function(oevent) {
					var createElementFilterCommand = new commands.CreateDerivationRuleElementFilter(that.inputParameterModel.name, {});
					that.modelUpdated = true;
					var parameter = that.undoManager.execute(createElementFilterCommand);
					that.parameterData.derivationRules = that.getDerivedRules();
					that.parameterModel.updateBindings(true);
					that.modelUpdated = false;
					derivedFromTable.setSelectionInterval(that.parameterData.derivationRules.length - 1, that.parameterData.derivationRules.length - 1);
				}
			}).addStyleClass("dummyTest14");
			var deleteIcon = new sap.ui.commons.Button({
				icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
				// text: resourceLoader.getText("tol_remove"),
				tooltip: resourceLoader.getText("tol_remove"),
				enabled: {
					path: "name",
					formatter: function() {
						if (that.parameterData.derivationRules && that.parameterData.derivationRules.length > 0) {
							return true;
						} else {
							return false;
						}
					}

				},
				press: function(oevent) {
					var deleteCommands = [];
					for (var index in derivedFromTable.getSelectedIndices()) {
						var selectedIndex = derivedFromTable.getSelectedIndices()[index];
						// derivedFromTable.removeSelectionInterval(selectedIndex);
						var bindContext = derivedFromTable.getContextByIndex(selectedIndex);
						if (bindContext) {
							var derivationRule = bindContext.getProperty("derivationRule");
							if (derivationRule) {
								var deleteCommand = new modelbase.DeleteCommand(derivationRule, false);
								// derivedFromTable.removeSelectionInterval(selectedIndex, selectedIndex);
								deleteCommands.push(deleteCommand);
							}
						}

					}
					derivedFromTable.clearSelection();
					if (deleteCommands.length > 0) {
						that.modelUpdated = true;
						var parameter = that.undoManager.execute(new modelbase.CompoundCommand(deleteCommands));
						that.parameterData.derivationRules = that.getDerivedRules();
						that.parameterModel.updateBindings(true);
						that.modelUpdated = false;
					}

				}

			});
			toolBar.addRightItem(createIcon);
			toolBar.addRightItem(deleteIcon);
			toolBar.addItem(new sap.ui.commons.Label({
				text: "Filters"
			})).addStyleClass("parameterToolbarStyle");
			derivedFromTable.setToolbar(toolBar);

			tableMatrixCell.addContent(derivedFromTable);

			var oImageFilter = new sap.ui.commons.Image({
				src: {
					path: "derivationRule",
					formatter: function(derivationRule) {
						if (derivationRule && derivationRule.elementName) {
							var element = that.parameterData.lookupEntity.elements.get(derivationRule.elementName);
							if (element)
								return that.getIconPath(element, that.parameterData.lookupEntity);
						}
					}
				}
				//src: resourceLoader.getImagePath("Attribute.png")
			});
			var filterColumn = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
				icon: oImageFilter,
				canedit: false
			});
			filterColumn.bindProperty("selectedKey", {
				path: "derivationRule",
				formatter: function(derivationRule) {
					if (derivationRule)
						return derivationRule.elementName;
					else {
						if (filterColumn) {
							filterColumn.setValue("");
						}
					}
				}
			});
			filterColumn.bindProperty("value", {
				path: "derivationRule",
				formatter: function(derivationRule) {
					if (derivationRule)
						return derivationRule.elementName;
					else
						return "";
				}
			})
			filterColumn.attachChange(function(oevent) {
				var selectedText = oevent.getParameter("newValue");
				var bindingContext = oevent.getSource().getBindingContext();
				if (bindingContext) {
					var derivedRule = bindingContext.getProperty("derivationRule");
					if (derivedRule && selectedText) {
						var changeElementFilterCommand = new commands.ChangeDerivationRuleElementFilter(that.inputParameterModel.name, derivedRule.$getKeyAttributeValue(), {
							elementName: selectedText
						});
						that.modelUpdated = true;
						var parameter = that.undoManager.execute(changeElementFilterCommand);
						that.parameterData.derivationRules = that.getDerivedRules();
						that.parameterModel.updateBindings(true);
						that.modelUpdated = false;
					}
				}

			});
			var filterListItem = new sap.ui.core.ListItem({})

			filterListItem.bindProperty("text", {
				path: "column",
				formatter: function(element) {
					return element ? element.name : "";
				}
			});
			filterListItem.bindProperty("key", {
				path: "column",
				formatter: function(element) {
					return element ? element.name : "";
				}
			});
			filterListItem.bindProperty("icon", {
				path: "column",
				formatter: function(element) {
					if (element)
						return that.getIconPath(element, that.parameterData.lookupEntity);
				}
			});
			var listBoxFilter = new sap.ui.commons.ListBox({
				displayIcons: true,
				items: {
					path: "/lookupElements",
					template: filterListItem
				}
			});
			filterColumn.setListBox(listBoxFilter);

			/* filterColumn.bindItems({
                path: "/lookupElements",
                template: filterListItem
            });*/

			var horizontalLayout = new sap.ui.commons.layout.HorizontalLayout();
			var valueTextField = new sap.ui.commons.ValueHelpField({
				iconURL: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/F4-Help_icon_regular.png",
                iconHoverURL: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/F4-Help_icon_hover.png",
				enabled: {
					path: "derivationRule",
					formatter: function(derivationRule) {
						if (derivationRule && derivationRule.elementName)
							return true
						else
							return false
					}
				},
				valueHelpRequest: function(event) {
					var textField = event.getSource();
					var context = event.getSource().getBindingContext();
					if (context.getProperty("derivationRule")) {
						var deriValtionRule = context.getProperty("derivationRule");
						if (deriValtionRule.elementName && that.parameterData.lookupEntity) {
							var valueHelpCallback = function(data) {
								textField.setValue(data);
								textField.fireChange({
									newValue: data
								});
							};
							var packageName;
							if (that.parameterData.lookupEntity.type === "DATA_BASE_TABLE") {
								packageName = that.parameterData.lookupEntity.physicalSchema;
							} else {
								packageName = that.parameterData.lookupEntity === that.model.columnView ? that.context.packageName : that.parameterData.lookupEntity
									.packageName;
							}

							var valueHelpDialog = new SqlColumnValueHelpDialog({
								context: that.context,
								tableData: {
									//  table: that.variableData.entity,

									dataSourceName: that.parameterData.lookupEntity.name,
									columnName: deriValtionRule.elementName,
									packageName: packageName,
									isTable: that.parameterData.lookupEntity.type === "DATA_BASE_TABLE" ? true : false

								},
								callback: valueHelpCallback,
								dialogtype: {
									Operator: sharedmodel.ValueFilterOperator.EQUAL,
									oldValue: event.getSource().getValue(),
									dialogTitle: "Value Help for filters"
								}
							});

							valueHelpDialog.onValueHelpRequest();
						}
					}
				}
			});
			valueTextField.bindProperty("value", {
				path: "derivationRule",
				formatter: function(derivationRule) {
					if (derivationRule && derivationRule.valueFilters && derivationRule.valueFilters.count() > 0) {
						return derivationRule.valueFilters._values[0].value;
					}
				}
			});
			var valueButton = new sap.ui.commons.Button({
				text: "..."
			});
			horizontalLayout.addContent(valueTextField);
			horizontalLayout.addContent(valueButton);

			valueTextField.attachChange(function(oevent) {
				var selectedText = oevent.getParameter("newValue");
				var bindingContext = oevent.getSource().getBindingContext();
				if (bindingContext) {
					var derivedRule = bindingContext.getProperty("derivationRule");
					if (derivedRule) {
						var changeElementFilterCommand = new commands.ChangeDerivationRuleElementFilter(that.inputParameterModel.name, derivedRule.$getKeyAttributeValue(), {
							attributeName: derivedRule.elementName,
							valueFilter: {
								operator: sharedmodel.ValueFilterOperator.EQUAL,
								type: sharedmodel.ValueFilterType.SINGLE_VALUE_FILTER,
								value: selectedText
							}
						});
						that.modelUpdated = true;
						var parameter = that.undoManager.execute(changeElementFilterCommand);
						that.parameterData.derivationRules = that.getDerivedRules();
						that.parameterModel.updateBindings(true);
						that.modelUpdated = false;
					}
				}

			});

			var nameColumn = new sap.ui.table.Column({
				width: "100%",
				label: new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_filter_column")
				}),
				template: filterColumn
			});
			nameColumn.setName(resourceLoader.getText("tit_filter_column"));

			var valueColumn = new sap.ui.table.Column({
				width: "100%",
				label: new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_filter_value")
				}),
				template: valueTextField
			});
			valueColumn.setName(resourceLoader.getText("tit_filter_value"));

			derivedFromTable.addColumn(nameColumn);
			derivedFromTable.addColumn(valueColumn);

			derivedFromTable.bindRows("/derivationRules");

			derivedMatrixLayout.createRow(tableMatrixCell);

			derivedMatrixLayout.setModel(that.parameterModel);

			return derivedMatrixLayout;
		};
		var getDerivedFromProcedureListContainer = function(thisObject) {
			var that = thisObject;
			var procedureMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
				widths: ["30%", "70%"]
			});

			var procedureLabel = new sap.ui.commons.Label({
				text: resourceLoader.getText("Procedure/Scalar Function"),
				required: true
			}).addStyleClass("labelFloat");

			var image = new sap.ui.commons.Image({
				src: {
					path: "scriptObject",
					formatter: function(scriptObject) {
						if (scriptObject) {
							if (scriptObject.type && (scriptObject.type.toLowerCase() === "hdbprocedure" || scriptObject.type.toLowerCase() === "procedure")) {
								return resourceLoader.getImagePath("procedure.gif");
							}
						}
					}
				}
			});
			image.addStyleClass("procedure_padding");

			var procedureText = new sap.ui.commons.TextField({
				width: "75%",
				editable: true,
				value: {
					path: "scriptObject",
					formatter: function(value) {
						if (value) {
							if (value.errorMsg) {
								if (that.parameterData.parametetertype === "Derived From Procedure/Scalar Function" && procedureText.getValueState() === sap.ui.core
									.ValueState.None) {
									CalcViewEditorUtil.showErrorMessageTooltip(procedureText, value.errorMsg);
								}
							} else {
								if (procedureText.getTooltip() !== null) {
									CalcViewEditorUtil.clearErrorMessageTooltip(procedureText);
								}
							}
							if (value.packageName) {
								return value.fqName;
							} else {
								if (value.physicalSchema) {
									if (value.schemaName === value.physicalSchema) {
										return value.fqName;
									} else {
										var schemaName = value.schemaName + "(" + value.physicalSchema + ")";
										return "\"" + schemaName + "\"" + "." + value.name;
									}
								} else {
									return value.fqName;
								}
							}
						} else {
							if (!that.isNew) {
								if (that.parameterData.parametetertype === "Derived From Procedure/Scalar Function" && procedureText.getValueState() === sap.ui.core
									.ValueState.None) {
									CalcViewEditorUtil.showErrorMessageTooltip(procedureText, resourceLoader.getText("msg_field_not_empty"));
								}
							} else if (procedureText.getTooltip() !== null) {
								CalcViewEditorUtil.clearErrorMessageTooltip(procedureText);
							}
							return "";
						}
					}
				}
			}).addStyleClass("inputBorder");
			procedureText.attachBrowserEvent("keypress", function(e) {
				e.preventDefault();
			});
			procedureText.attachChange(function(oevent) {

			});
			var procedureButton = new sap.ui.commons.Button({
				text: "...",
				press: function() {
					var findDialog = new NewFindDialog("", {
						multiSelect: false,
						types: ["HDBSCALARFUNCTION", "CATALOG_PROCEDURE", "REPO_PROCEDURE"],
						noOfSelection: 1,
						context: that.context,
						onOK: function(selectedResource) {
							if (selectedResource) {
								var executeCommands = [];
								var viewDetails = selectedResource[0];
								if (viewDetails.type) {
									viewDetails.type = viewDetails.type.toLowerCase();
								}
								if (!that.inputParameterModel.derivationRule || that.inputParameterModel.derivationRule === null) {
									executeCommands.push(new commands.CreateDerivationRuleCommand(that.inputParameterModel.name, {}));
								}
								var changeDerivationRuleCommand = new commands.ChangeDerivationRuleCommand(that.inputParameterModel.name, {
									scriptObject: viewDetails
								});
								executeCommands.push(changeDerivationRuleCommand);
								if (that.inputParameterModel.derivationRule) {
									var oldScriptObject = that.inputParameterModel.derivationRule.scriptObject;
									if (oldScriptObject && (viewDetails.packageName !== oldScriptObject.packageName || viewDetails.name !== oldScriptObject.name)) {
										executeCommands = executeCommands.concat(that.removeParameterMappingsFromDerived(true));
									}
								}
								that.undoManager.execute(new modelbase.CompoundCommand(executeCommands));
								var updateCombo = function(event) {
									that.parameterModel.updateBindings(true);
								}
								ModelProxyResolver.ProxyResolver.resolve(that.model, that.context, updateCombo);
								that.parameterModel.updateBindings(true);

							}
						}
					});
				}
			});
			var tableCell = new sap.ui.commons.layout.MatrixLayoutCell();
			tableCell.addContent(image);
			tableCell.addContent(procedureText);
			tableCell.addContent(procedureButton);
			var inputEnabledCheck = new sap.ui.commons.CheckBox({
				text: resourceLoader.getText("Input Enabled"),
				width: "100%",
				change: function(oevent) {
					if (oevent.getSource().getChecked()) {
						var executeCommands = [];
						if (!that.inputParameterModel.derivationRule || that.inputParameterModel.derivationRule === null) {
							var createDerivationRuleCommand = new commands.CreateDerivationRuleCommand(that.inputParameterModel.name, {});
							executeCommands.push(createDerivationRuleCommand);
						}
						var changeDerivationRuleCommand = new commands.ChangeDerivationRuleCommand(that.inputParameterModel.name, {
							inputEnabled: oevent.getSource().getChecked()
						});
						executeCommands.push(changeDerivationRuleCommand);
						executeCommands = executeCommands.concat(that.removeParameterMappingsFromDerived());
						that._executeDirect(executeCommands);
					} else {
						var changeDerivationRuleCommand = new commands.ChangeDerivationRuleCommand(that.inputParameterModel.name, {
							inputEnabled: oevent.getSource().getChecked(),
							mandatory: false
						});
						that._executeDirect(changeDerivationRuleCommand);
					}
				}
			}).addStyleClass("dummyTest17");
			inputEnabledCheck.bindProperty("checked", "/inputEnabled");

			procedureMatrixLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
				height: "10px"
			}));
			procedureMatrixLayout.createRow(procedureLabel, tableCell);

			procedureMatrixLayout.createRow(null, inputEnabledCheck);

			procedureMatrixLayout.setModel(that.parameterModel);

			return procedureMatrixLayout;
		};
		var getDefaultValueContainer = function(expressionEditor, thisObject) {
			var that = thisObject;
			var defaultValueTable = new sap.ui.table.Table({
				visibleRowCount: 3,
				width: "100%"
			}).addStyleClass("dummyTest15");
			var toolBar = new sap.ui.commons.Toolbar();
			toolBar.addStyleClass("parameterToolbarStyle");
			var createIcon = new sap.ui.commons.Button({
				icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
				// text: resourceLoader.getText("tol_add"),
				tooltip: resourceLoader.getText("tol_add"),
				enabled: {
					path: "/multipleSelections",
					formatter: function(multipleSelections) {
						if (multipleSelections) {
							if (that.inputParameterModel.defaultRanges && that.inputParameterModel.defaultRanges.count() > 0) {
								var firstDefaultRange = that.inputParameterModel.defaultRanges.get(0);
								if (!firstDefaultRange.lowExpression) {
									return true;
								}
							} else {
								return true;
							}
						}
						return false;

					}
				},
				press: function() {
					var defaultRangeCommand = new commands.CreateParameterDefaultRangeCommand(that.inputParameterModel.name, {
						lowExpression: false,
						lowValue: ""
					});
					that._executeDirect(defaultRangeCommand);
				}
			}).addStyleClass("dummyTest16");
			var deleteIcon = new sap.ui.commons.Button({
				icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
				// text: resourceLoader.getText("tol_remove"),
				tooltip: resourceLoader.getText("tol_remove"),
				enabled: {
					parts: [{
						path: "multipleSelections"
                    }, {
						path: "defaultRanges"
                    }],
					formatter: function(multipleSelections, defaultRanges) {
						if (multipleSelections && defaultRanges && defaultRanges.length > 1) {
							return true;
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
								// defaultValueTable.removeSelectionInterval(defaultValueTable.getSelectedIndices()[i], defaultValueTable.getSelectedIndices()[i]);
							}
						}
					}
					defaultValueTable.clearSelection();
					if (deleteCommands.length > 0) {
						that._executeDirect(deleteCommands);
					}
				}
			});
			toolBar.addItem(createIcon);
			toolBar.addItem(deleteIcon);
			defaultValueTable.setToolbar(toolBar);

			var typeCombo = new sap.ui.commons.DropdownBox({
				enabled: {
					path: "parametetertype",
					formatter: function(parametetertype) {
						if (that.parameterModel && that.parameterModel.getData() && (that.parameterModel.getData().parametetertype ===
							"Derived From Table" ||
							that.parameterModel.getData().parametetertype === "Derived From Procedure/Scalar Function"
						)) {
							return false;
						}
						if (that.inputParameterModel.defaultRanges && that.inputParameterModel.defaultRanges.count() > 1) {
							return false;
						}

						return true;
					}
				},
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
							that._executeDirect(new commands.ChangeParameterDefaultRangeCommand(that.inputParameterModel.name, defaultRange.$getKeyAttributeValue(), {
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

			var valueHelpField = new sap.ui.commons.ValueHelpField({
				iconURL: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/F4-Help_icon_regular.png",
                iconHoverURL: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/F4-Help_icon_hover.png",
				enabled: {
					path: "parametetertype",
					formatter: function(parametetertype) {
						if (that.parameterModel && that.parameterModel.getData() && (that.parameterModel.getData().parametetertype ===
							"Derived From Table" ||
							that.parameterModel.getData().parametetertype === "Derived From Procedure/Scalar Function")) {
							return false;
						}
						return true;
					}
				},
				value: {
					path: "defaultRange",
					formatter: function(defaultRange) {
						if (defaultRange && defaultRange.lowValue) {
							return defaultRange.lowValue;
						}
						return "";
					}
				},
				valueHelpRequest: function(event) {
					var defaultRange = event.getSource().getBindingContext().getProperty("defaultRange");
					var oldValue = event.getSource().getValue();
					if (defaultRange) {
						var updateExpression = function(value, updateModel) {
							if (value && value !== oldValue) {
								that._executeDirect(new commands.ChangeParameterDefaultRangeCommand(that.inputParameterModel.name, defaultRange.$getKeyAttributeValue(), {
									lowValue: value
								}));
							}
						};
						if (defaultRange.lowExpression) {
							that.gotoExpressionEditorPage({
								updateExpression: updateExpression,
								expressionValue: oldValue,
								isVariable: false,
								elementName: that.inputParameterModel.name,
								defaultRange:defaultRange
							});
						} else {
							getValueHelpValue(that, updateExpression, oldValue);
						}

					}

				},
				change: function(event) {
					var value = event.getParameter("newValue");
					var defaultRange = event.getSource().getBindingContext().getProperty("defaultRange");
					if (defaultRange) {
						that._executeDirect(new commands.ChangeParameterDefaultRangeCommand(that.inputParameterModel.name, defaultRange.$getKeyAttributeValue(), {
							lowValue: value
						}));
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
			var valueColumn = new sap.ui.table.Column({
				width: "50%",
				label: new sap.ui.commons.Label({
					text: resourceLoader.getText("Value")
				}),
				template: valueHelpField
			});
			defaultValueTable.addColumn(typeColumn);
			defaultValueTable.addColumn(valueColumn);

			defaultValueTable.bindRows("/defaultRanges");

			return defaultValueTable;
		};
		var getValueHelpValue = function(objectClass, valueHelpCallback, oldValue) {
			var that = objectClass;
			var parameterType = that.parameterData.parametetertype;
			var entityName;
			var elementName;
			var labelElementName;
			var packageName;
			var entityType;
			var hierarchyName;
			/*if (parameterType === "Column") {
				entityName = that.parameterData.entity.name;
				elementName = that.parameterData.referenceElement.name;
				entityType = that.parameterData.entity.type;
				if (that.parameterData.referenceElement.$getContainer() instanceof model.Entity) {
					var sharedEntity = that.parameterData.referenceElement.$getContainer();
					entityName = sharedEntity.name;
				}
				hierarchyName = that.parameterData.hierarchyElement ? that.parameterData.hierarchyElement.name : undefined;
				if (that.parameterData.referenceElement.labelElement) {
					labelElementName = that.parameterData.referenceElement.labelElement.name;
				}
				if (that.parameterData.entity.type === "DATA_BASE_TABLE") {
					packageName = that.parameterData.entity.physicalSchema;
				} else {
					if (that.parameterData.referenceElement.$getContainer() instanceof model.Entity) {
						var sharedEntity = that.parameterData.referenceElement.$getContainer();
						packageName = sharedEntity.packageName;
					} else {
						packageName = that.parameterData.entity === that.model.columnView ? that.context.packageName : that.parameterData.entity.packageName;
					}
				}
			} else */
			if (parameterType === "Derived From Table") {
				entityName = that.parameterData.lookupEntity.name;
				entityType = that.parameterData.lookupEntity.type;
				elementName = that.parameterData.lookupEntity.elements.get(that.parameterData.resultElementName) ? that.parameterData.lookupEntity.elements
					.get(that.parameterData.resultElementName).name : "";
				if (that.parameterData.lookupEntity.type === "DATA_BASE_TABLE") {
					packageName = that.parameterData.lookupEntity.physicalSchema;
				} else {
						packageName = that.parameterData.lookupEntity === that.model.columnView ? that.context.packageName : that.parameterData.lookupEntity
							.packageName;
				}
			}

			if (parameterType === "Static List") {
				var listItem = new sap.ui.core.ListItem({});
				listItem.bindProperty("text", {
					path: "",
					formatter: function(element) {
						return element ? element.valueRange.value : "";
					}
				});
				listItem.bindProperty("key", {
					path: "",
					formatter: function(element) {
						return element ? element.valueRange.value : "";
					}
				});
				var listBox = new sap.ui.commons.ListBox({
					displayIcons: false,
					width: "100%",
					height: "100%",
					items: {
						path: "/",
						template: listItem
					},
					select: function() {
						okButton.setEnabled(listBox.getSelectedKeys().length > 0 ? true : false);
					}
				});

				var innerModel = new sap.ui.model.json.JSONModel();
				innerModel.setData(that.parameterData.valueRanges);
				var matrixLayout = new sap.ui.commons.layout.MatrixLayout({
					height: "100%"
				});
				matrixLayout.createRow(listBox);
				matrixLayout.setModel(innerModel);
				var cancelButton = new sap.ui.commons.Button({
					text: "Cancel",
					press: function() {
						inputDialog.close();
					}
				});
				var okButton = new sap.ui.commons.Button({
					text: "Ok",
					press: function(event) {
						if (listBox.getSelectedKeys() && listBox.getSelectedKeys().length >= 1) {
							valueHelpCallback(listBox.getSelectedKeys()[0]);
							inputDialog.close();
						}
					},
					enabled: false,

				});
				var inputDialog = new sap.ui.commons.Dialog({
					modal: true,
					content: [matrixLayout],
					width: "15%",
					height: "25%",
					buttons: [okButton, cancelButton],
					defaultButton: cancelButton,
					title: resourceLoader.getText("tit_select_value")
				});
				inputDialog.open();

			}
			if (entityName && elementName) {
				var valueHelpDialog = new SqlColumnValueHelpDialog({
					context: that.context,
					tableData: {
						//  table: that.variableData.entity,
						dataSourceName: entityName,
						columnName: elementName,
						labelColumnName: labelElementName,
						packageName: packageName,
						hierarchyName: hierarchyName,
						isTable: entityType === "DATA_BASE_TABLE" ? true : false

					},
					callback: valueHelpCallback,
					dialogtype: {
						Operator: sharedmodel.ValueFilterOperator.EQUAL,
						oldValue: oldValue ? oldValue : "",
						dialogTitle: resourceLoader.getText("tit_value_help_default_value")
					}
				});

				valueHelpDialog.onValueHelpRequest();

			}

			if (parameterType === "Direct") {
				if (that.parameterData.semantictype === model.SemanticType.CURRENCY_CODE || that.parameterData.semantictype === model.SemanticType.UNIT_OF_MEASURE) {
					var currencyDialog = new ValueHelpDialog({
						undoManager: that.undoManager,
						fnCallBack: valueHelpCallback,
						context: that.context,
						selectedItem: "fixed",
						viewnode: that.viewNode,
						title: "Currency",
						isUnit: that.parameterData.semantictype === model.SemanticType.UNIT_OF_MEASURE ? true : false,
						schema: that.model.columnView.defaultSchema,
						currencyCode: false
					});
					currencyDialog.openDialog();
				} else if (that.parameterData.semantictype === model.SemanticType.DATE) {
					var calender = new sap.ui.unified.Calendar({
						singleSelection: true,
						select: function() {
							okButton.setEnabled(true);
						}

					});

					var cancelButton = new sap.ui.commons.Button({
						text: "Cancel",
						press: function() {
							dateDialog.close();
						}
					});
					var okButton = new sap.ui.commons.Button({
						text: "Ok",
						press: function() {
							if (calender.getSelectedDates() && calender.getSelectedDates().length >= 1) {
								var date = calender.getSelectedDates()[0].getStartDate();
								if (date) {
									var dateValue = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
									valueHelpCallback(dateValue);
								}
								dateDialog.close();
							}
						},
						enabled: false
					});
					var dateDialog = new sap.ui.commons.Dialog({
						modal: true,
						content: [calender],
						width: "20%",
						height: "40%",
						buttons: [okButton, cancelButton],
						defaultButton: cancelButton,
						title: resourceLoader.getText(resourceLoader.getText("tit_select_date"))
					});
					dateDialog.open();
				}

			}
		};

		var getExpressionContainer = function(expressionEditor, thisObject) {
			var that = thisObject;

			var expressionMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
				width: "100%",
				widths: ["30%", "70%"]
			});

			var radioButtonGroup = new sap.ui.commons.RadioButtonGroup({
				columns: 2,
				selectedIndex: 0,
				select: function(event) {
					if (radioButtonGroup.getSelectedItem().getText() == resourceLoader.getText("tit_constant")) {

						expressionMatrixCell.removeContent(expressionAreaMatrix);
						expressionMatrixCell.addContent(constantAreaMatrix);

						that._execute({
							defaultValue: that.parameterData.defaultValue
						}, {}, {}, null);

					} else {
						expressionMatrixCell.removeContent(constantAreaMatrix);
						expressionMatrixCell.addContent(expressionAreaMatrix);

						that._execute({
							defaultValue: ""
						}, {}, {}, {
							formula: that.parameterData.defaultexpression,
							expressionLanguage: "COLUMN_ENGINE"
						});

					}
				}
			}).addStyleClass("radioButtonStyle");
			var constantItem = new sap.ui.core.Item({
				text: resourceLoader.getText("tit_constant"),
				tooltip: resourceLoader.getText("tit_constant"),
				key: resourceLoader.getText("tit_constant")
			});
			radioButtonGroup.addItem(constantItem);
			var expressionItem = new sap.ui.core.Item({
				text: resourceLoader.getText("tit_expression"),
				tooltip: resourceLoader.getText("tit_expression"),
				key: resourceLoader.getText("tit_expression")
			});
			radioButtonGroup.addItem(expressionItem);

			// segmented buttons

			/* var segMentButtons = new sap.ui.commons.SegmentedButton({
            select: function(oEvent) {
                var selectedButtonId = segMentButtons.getSelectedButton();
                if (selectedButtonId === constantButton.getId()) {
                    that._execute({
                        defaultValue: that.parameterData.defaultValue
                    }, {}, {}, null);
                } else {
                    that._execute({
                        defaultValue: ""
                    }, {}, {}, {
                        formula: that.parameterData.defaultexpression,
                        expressionLanguage: "COLUMN_ENGINE"
                    });
                }
            }
        });
        var constantButton = new sap.ui.commons.Button({
            text: resourceLoader.getText("tit_constant")
        });
        var expressionButton = new sap.ui.commons.Button({
            text: resourceLoader.getText("tit_expression")
        });
        segMentButtons.addButton(constantButton);
        segMentButtons.addButton(expressionButton);
*/

			//Constant area creation

			var constantAreaMatrix = new sap.ui.commons.layout.MatrixLayout({
				width: "100%",
				widths: ["15px", "30px", "15px"]
			});
			var inputField = new sap.ui.commons.TextField({
				width: "100%",
				change: function(oevent) {
					that.modelUpdated = true;
					that._execute({
						defaultValue: oevent.getSource().getValue()
					});
					that.modelUpdated = false;
				}
			}).bindProperty("value", "defaultValue");

			inputField.attachChange(function(oevent) {
				//  that.updateModel();
			});

			var valueHelpButton = new sap.ui.commons.Button({
				text: "...",
				enabled: {
					path: "parametetertype",
					formatter: function(parameterType) {
						if (parameterType == "Direct") {
							if (that.parameterData.semantictype === model.SemanticType.CURRENCY_CODE) {
								return true;
							} else if (that.parameterData.semantictype === model.SemanticType.UNIT_OF_MEASURE) {
								return true;
							} else if (that.parameterData.semantictype === model.SemanticType.DATE) {
								return true;
							}
							return false;
						} else if (parameterType == "Column") {
							if (that.parameterData.referenceElement)
								return true;
						} else if (parameterType == "Derived From Table") {
							if (that.parameterData.resultElementName)
								return true;
						} else if (parameterType == "Static List") {
							return true;
						}
						return false;
					}
				},
				visible: {
					path: "parameterType",
					formatter: function(parameterType) {
						//return parameterType === "Direct" ? false : true;
					}
				},
				press: function(event) {
					var parameterType = that.parameterData.parametetertype;
					var entityName;
					var elementName;
					var labelElementName;
					var packageName;
					var entityType;
					if (parameterType == "Column") {
						entityName = that.parameterData.entity.name;
						elementName = that.parameterData.referenceElement.name;
						entityType = that.parameterData.entity.type;
						if (that.parameterData.referenceElement.labelElement) {
							labelElementName = that.parameterData.referenceElement.labelElement.name;
						}
						if (that.parameterData.entity.type == "DATA_BASE_TABLE") {
							packageName = that.parameterData.entity.physicalSchema;
						} else {
							packageName = that.parameterData.entity == that.model.columnView ? that.context.packageName : that.parameterData.entity.packageName;
						}
					} else if (parameterType == "Derived From Table") {
						entityName = that.parameterData.lookupEntity.name;
						entityType = that.parameterData.lookupEntity.type;
						elementName = that.parameterData.lookupEntity.elements.get(that.parameterData.resultElementName) ? that.parameterData.lookupEntity
							.elements.get(that.parameterData.resultElementName).name : "";
						if (that.parameterData.lookupEntity.type == "DATA_BASE_TABLE") {
							packageName = that.parameterData.lookupEntity.physicalSchema;
						} else {
							packageName = that.parameterData.lookupEntity == that.model.columnView ? that.context.packageName : that.parameterData.lookupEntity
								.packageName;
						}
					}
					var valueHelpCallback = function(data) {
						if (data) {
							inputField.setValue(data);
							inputField.fireChange({
								newValue: data
							});
						}
					}
					if (parameterType == "Static List") {
						var listItem = new sap.ui.core.ListItem({});
						listItem.bindProperty("text", {
							path: "",
							formatter: function(element) {
								return element ? element.valueRange.value : "";
							}
						});
						listItem.bindProperty("key", {
							path: "",
							formatter: function(element) {
								return element ? element.valueRange.value : "";
							}
						});
						var listBox = new sap.ui.commons.ListBox({
							displayIcons: false,
							width: "100%",
							height: "100%",
							items: {
								path: "/",
								template: listItem
							},
							select: function() {
								okButton.setEnabled(listBox.getSelectedKeys().length > 0 ? true : false);
							}
						});

						var innerModel = new sap.ui.model.json.JSONModel();
						innerModel.setData(that.parameterData.valueRanges);
						var matrixLayout = new sap.ui.commons.layout.MatrixLayout({
							height: "100%"
						});
						matrixLayout.createRow(listBox);
						matrixLayout.setModel(innerModel);
						var cancelButton = new sap.ui.commons.Button({
							text: "Cancel",
							press: function() {
								inputDialog.close();
							}
						});
						var okButton = new sap.ui.commons.Button({
							text: "Ok",
							press: function(event) {
								if (listBox.getSelectedKeys() && listBox.getSelectedKeys().length >= 1) {
									valueHelpCallback(listBox.getSelectedKeys()[0]);
									inputDialog.close();
								}
							},
							enabled: false,

						});
						var inputDialog = new sap.ui.commons.Dialog({
							modal: true,
							content: [matrixLayout],
							width: "15%",
							height: "25%",
							buttons: [okButton, cancelButton],
							defaultButton: cancelButton,
							title: resourceLoader.getText("tit_select_value")
						});
						inputDialog.open();

					}
					if (entityName && elementName) {
						var valueHelpDialog = new SqlColumnValueHelpDialog({
							context: that.context,
							tableData: {
								//  table: that.variableData.entity,
								dataSourceName: entityName,
								columnName: elementName,
								labelColumnName: labelElementName,
								packageName: packageName,
								isTable: entityType === "DATA_BASE_TABLE" ? true : false

							},
							callback: valueHelpCallback,
							dialogtype: {
								Operator: sharedmodel.ValueFilterOperator.EQUAL,
								oldValue: inputField.getValue(),
								dialogTitle: resourceLoader.getText("tit_value_help_default_value")
							}

						});

						valueHelpDialog.onValueHelpRequest();

					}

					if (parameterType === "Direct") {
						if (that.parameterData.semantictype === model.SemanticType.CURRENCY_CODE || that.parameterData.semantictype === model.SemanticType
							.UNIT_OF_MEASURE) {
							var currencyDialog = new ValueHelpDialog({
								undoManager: that.undoManager,
								fnCallBack: valueHelpCallback,
								context: that.context,
								selectedItem: "fixed",
								viewnode: that.viewNode,
								title: "Currency",
								isUnit: that.parameterData.semantictype === model.SemanticType.UNIT_OF_MEASURE ? true : false,
								schema: that.model.columnView.defaultSchema,
								currencyCode: false
							});
							currencyDialog.openDialog();
						} else if (that.parameterData.semantictype === model.SemanticType.DATE) {
							var calender = new sap.ui.unified.Calendar({
								singleSelection: true,
								select: function() {
									okButton.setEnabled(true);
								}

							});

							var cancelButton = new sap.ui.commons.Button({
								text: "Cancel",
								press: function() {
									dateDialog.close();
								}
							});
							var okButton = new sap.ui.commons.Button({
								text: "Ok",
								press: function() {
									if (calender.getSelectedDates() && calender.getSelectedDates().length >= 1) {
										var date = calender.getSelectedDates()[0].getStartDate();
										if (date) {
											var dateValue = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
											valueHelpCallback(dateValue);
										}
										dateDialog.close();
									}
								},
								enabled: false
							});
							var dateDialog = new sap.ui.commons.Dialog({
								modal: true,
								content: [calender],
								width: "20%",
								height: "40%",
								buttons: [okButton, cancelButton],
								defaultButton: cancelButton,
								title: resourceLoader.getText(resourceLoader.getText("tit_select_date"))
							});
							dateDialog.open();
						}

					}

				},
			});
			// valueHelpButton.addStyleClass("buttonHeight");

			constantAreaMatrix.createRow(new sap.ui.commons.Label({
				text: resourceLoader.getText("tit_default_value")
			}).addStyleClass("labelFloat"), inputField, valueHelpButton);

			// Expression area creation

			var expressionAreaMatrix = new sap.ui.commons.layout.MatrixLayout({
				width: "100%",
				widths: ["15px", "35px", "10px"]
			});

			var toolBar = new sap.ui.commons.Toolbar().addStyleClass("parameterToolbarStyle");

			var expressionArea = new sap.ui.commons.TextArea({
				width: "100%",
				rows: 4,
				placeholder: resourceLoader.getText("txt_enter_expression"),
				change: function(oevent) {
					that.modelUpdated = true;
					that._execute({
						defaultValue: null
					}, {}, {}, {
						formula: oevent.getSource().getValue(),
						expressionLanguage: "COLUMN_ENGINE"
					});
					that.modelUpdated = false;
				}

			}).bindProperty("value", {
				path: "defaultExpression"

			});

			expressionArea.addStyleClass("detailsExpressionTextArea");

			var advancedButton = new sap.ui.commons.Button({
				//text: "...",
				text: resourceLoader.getText("txt_expression_editor"),
				tooltip: resourceLoader.getText("txt_expression_editor"),
				icon: "sap-icon://navigation-right-arrow",
				iconFirst: false,
				press: function(oEvent) {
					that.gotoExpressionEditorPage({
						updateExpression: updateExpression,
						expressionValue: expressionArea.getValue(),
						isVariable: false,
						elementName: that.inputParameterModel.name
					});
				}
			});
			toolBar.addRightItem(advancedButton);
			// advancedButton.addStyleClass("buttonHeight");

			var layout = new sap.ui.commons.layout.VerticalLayout({
				width: "90%"
			});
			layout.addContent(toolBar);
			layout.addContent(expressionArea);
			var defaultLabel = new sap.ui.commons.Label({
				text: resourceLoader.getText("tit_default_value")
			}).addStyleClass("labelFloat").addStyleClass("labelPaddingBottom")

			expressionAreaMatrix.createRow(defaultLabel, layout, null);

			/*   expressionAreaMatrix.createRow(toolBar);
            expressionAreaMatrix.createRow(expressionArea);
            expressionAreaMatrix.createRow(expressionArea, new sap.ui.commons.layout.MatrixLayoutCell({
                content: advancedButton,
                vAlign: sap.ui.commons.layout.VAlign.Begin,
                hAlign: sap.ui.commons.layout.HAlign.Begin
            }));*/

			var expressionMatrixCell = new sap.ui.commons.layout.MatrixLayoutCell({
				colSpan: 3
			});

			if (that.parameterData.defaultExpression) {
				expressionMatrixCell.addContent(expressionAreaMatrix);
				radioButtonGroup.setSelectedItem(expressionItem)

			} else {
				expressionMatrixCell.addContent(constantAreaMatrix);
				radioButtonGroup.setSelectedItem(constantItem);
			}

			/*  constantButton.attachPress(function(oEvent) {
            expressionMatrixCell.removeContent(expressionAreaMatrix);
            expressionMatrixCell.addContent(constantAreaMatrix);
        }, this);
        expressionButton.attachPress(function(oEvent) {
            expressionMatrixCell.removeContent(constantAreaMatrix);
            expressionMatrixCell.addContent(expressionAreaMatrix);
        }, this);
        */

			/*  expressionMatrixLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
               content: [constantButton, expressionButton],
            colSpan: 2
         })); */
			expressionMatrixLayout.createRow(null);
			expressionMatrixLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [radioButtonGroup],
				colSpan: 3,
				hAlign: sap.ui.commons.layout.HAlign.Center,
				vAlign: sap.ui.commons.layout.VAlign.Bottom
			}));

			expressionMatrixLayout.createRow(expressionMatrixCell);

			var updateExpression = function(value, updateModel) {
				if (value && value !== expressionArea.getValue()) {
					expressionArea.setValue(value);
					that.parameterData.defaultExpression = value;
					if (updateModel) {
						that._execute({
							defaultValue: ""
						}, {}, {}, {
							formula: expressionArea.getValue(),
							expressionLanguage: "COLUMN_ENGINE"
						});
					}
				}

				//  that.parameterModel.updateBindings();
				//  else
				//        expressionArea.setValue("int()");    
			}
			expressionMatrixLayout.setModel(that.parameterModel);

			return expressionMatrixLayout;
		};

		var getDirectDetails = function(thisObject) {

			var that = thisObject;

			var dataTypeLabel = new sap.ui.commons.Label({
				text: resourceLoader.getText("tit_data_type"),
				required: true
			}).addStyleClass("labelFloat");
			var dataTypeCombo = new sap.ui.commons.DropdownBox({
				width: "80%",
				selectedKey: "{primitiveType}"
			}).addStyleClass("dummyTest6");

			dataTypeCombo.attachChange(function(oevent) {
				var dataType = oevent.getSource().getSelectedKey();
				that.parameterData.primitiveType = dataType;
				updateLengthScaleEnablement(dataType);

				if ((lengthText.getEnabled() && lengthText.getValue() !== "") || !lengthText.getEnabled()) {
					that._execute({}, {
						name: that.parameterData.name,
						primitiveType: oevent.getSource().getSelectedKey(),
						length: that.parameterData.enableLength ? that.parameterData.length : undefined,
						scale: that.parameterData.enableScale ? that.parameterData.scale : undefined,

					});
				}
				if (!lengthText.getEnabled() || lengthText.getValue() !== "") {
					// lengthText.setTooltip(null);
					// lengthText.setValueState(sap.ui.core.ValueState.None);
					if (lengthText.getTooltip() !== null) {
						CalcViewEditorUtil.clearErrorMessageTooltip(lengthText);
					}
				} else {
					if (!that.isNew) {
						if (lengthText.getValueState() === sap.ui.core.ValueState.None) {
							CalcViewEditorUtil.showErrorMessageTooltip(lengthText, resourceLoader.getText("msg_length_invalid_empty"));
						}
					} else if (lengthText.getTooltip() !== null) {
						CalcViewEditorUtil.clearErrorMessageTooltip(lengthText);
					}
					// openToolTip(resourceLoader.getText("msg_column_invalid_empty"), lengthText);
					// lengthText.setValueState(sap.ui.core.ValueState.Error);
				}

			});

			var dataTypeListItem = new sap.ui.core.ListItem({});
			dataTypeListItem.bindProperty("text", "datatype");
			dataTypeListItem.bindProperty("key", "datatype");
			//dataTypeCombo.addItem(dataTypeListItem);
			dataTypeCombo.bindItems({
				path: "/dataTypes",
				template: dataTypeListItem
			});
			// var model = new sap.ui.model.json.JSONModel(dataTypes);
			// dataTypeCombo.setModel(model);
			/* for (var i in dataTypeCombo.getItems()) {
            var listItem = dataTypeCombo.getItems()[i];
            if (listItem.getText() == that.inputParameter.primitiveType) {
                dataTypeCombo.setSelectedItemId(listItem.getId());
            }
        }*/

			//dataTypeCombo.setSelectedItemId(that.inputParameter.primitiveType);

			var lengthLabel = new sap.ui.commons.Label({
				text: resourceLoader.getText("tit_length")
				// width: "45px"
			}).addStyleClass("labelFloat");
			var lengthText = new sap.ui.commons.TextField({
				width: "25%",
				type: new sap.ui.model.type.Integer(),
				enabled: "{enableLength}",
				change: function(oevent) {
					if (oevent.getParameter("newValue") !== "") {
						this.setValueState(sap.ui.core.ValueState.None);
						this.setTooltip(null);
						if (oevent.getSource().getTooltip() !== null) {
							CalcViewEditorUtil.clearErrorMessageTooltip(oevent.getSource());
						}
						that._execute({}, {
							name: that.parameterData.name,
							primitiveType: that.parameterData.primitiveType,
							length: oevent.getSource().getValue()
						});
					} else {
						if (!(that.parameterData.primitiveType === "DECIMAL" || that.parameterData.primitiveType === "FLOAT")) {
							var messageObjects = ["'" + resourceLoader.getText("tit_length") + "'", "'" + that.parameterData.name + "'"];
							var message = resourceLoader.getText("msg_message_toast_parameter_error", messageObjects);
							this.setValue(that.parameterData.parameter.inlineType.length);
							this.setTooltip(null);
							jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
							sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show(message, {
								of: that.topLayout,
								offset: "-10px -100px"
							});
						}
						// openToolTip("Length should not be empty", oevent.getSource());
						// oevent.getSource().setValueState(sap.ui.core.ValueState.Error);
					}
				}
			}).bindProperty("value", "/length").addStyleClass("dummyTest7");

			lengthText.attachBrowserEvent("keypress", function(e) {
				var key_codes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 0, 8];
				if ($.inArray(e.which, key_codes) < 0) {
					e.preventDefault();
				}
			});
			lengthText.attachChange(function(oevent) {
				//  that.updateModel();
			});

			var scaleLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_scale"),
					// width: "45px"
				}) //.addStyleClass("labelFloat");
			var scaleText = new sap.ui.commons.TextField({
				width: "25%",
				enabled: "{enableScale}",
				change: function(oevent) {
					if ((lengthText.getEnabled() && lengthText.getValue() !== "") || !lengthText.getEnabled()) {
						that._execute({}, {
							name: that.parameterData.name,
							primitiveType: that.parameterData.primitiveType,
							scale: oevent.getSource().getValue()
						});
					}
				}
			}).bindProperty("value", "/scale").addStyleClass("dummyTest8");

			scaleText.attachChange(function(oevent) {
				//   that.updateModel();
			});

			scaleText.attachBrowserEvent("keypress", function(e) {
				var key_codes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 0, 8];
				if ($.inArray(e.which, key_codes) < 0) {
					e.preventDefault();
				}
			});

			var emptyLabel = new sap.ui.commons.Label({
				width: "10px"
			}).addStyleClass("labelFloat");

			var matrixLayout = new sap.ui.commons.layout.MatrixLayout({
				widths: ["30%", "70%"]
			});
			matrixLayout.createRow(dataTypeLabel, new sap.ui.commons.layout.MatrixLayoutCell({
				width: "80%",
				content: [dataTypeCombo]
			}));
			// matrixLayout.createRow(lengthLabel, lengthText);
			// matrixLayout.createRow(scaleLabel, scaleText);
			matrixLayout.createRow(lengthLabel, new sap.ui.commons.layout.MatrixLayoutCell({
				content: [lengthText, new sap.ui.commons.Label({
					width: "12%",
				}), scaleLabel, scaleText],
			}));

			//that.inlineTypeData.dataTypes = dataTypes;
			matrixLayout.setModel(that.parameterModel);

			var updateLengthScaleEnablement = function(dataType) {
				var isLengthRequired = isLengthSupported(dataType);
				var isScaleRequired = isScaleSupported(dataType);
				that.parameterData.enableLength = isLengthRequired;
				that.parameterData.enableScale = isScaleRequired;
				if (isLengthRequired) {
					if (that.parameterData.length || that.parameterData.length === "")
						that.parameterData.length = 1;
				} else {
					that.parameterData.length = "";
				}
				if (!isScaleRequired)
					that.parameterData.scale = "";
				that.parameterModel.updateBindings(true);
			};

			return matrixLayout;
		};

		function getReferenceElement(selectedView, elementName, thisObject) {
			var that = thisObject;
			var gotElement;
			if (selectedView) {
				var elements;
				if (selectedView.name == that.model.columnView.name) {
					elements = selectedView.getDefaultNode().elements._values;

				} else {
					elements = selectedView.elements._values;
				}
				if (elements) {
					for (var element in elements) {
						if (elements[element] && elements[element].name == elementName && !gotElement)
							gotElement = elements[element];
					}
				}
			}

			return gotElement;

		}

		function updateReferenceCombo(selectedObject, model, thisObject) {
			var that = thisObject;
			if (selectedObject && model) {
				var data = [];
				if (selectedObject.name == that.model.columnView.name) {
					for (var i in selectedObject.getDefaultNode().elements._keys) {
						data.push({
							column: selectedObject.getDefaultNode().elements._keys[i]
						});
					}
				} else {
					for (var j in selectedObject.elements._keys) {
						data.push({
							column: selectedObject.elements._keys[j]
						});
					}
				}

				model.setData(data, false);
			}

		}
		var isLengthSupported = function(dataType) {
			if (dataType == "CHAR" || dataType == "VARCHAR" || dataType == "DECIMAL" || dataType == "NUMERIC" || dataType == "BINARY" || dataType ==
				"VARBINARY" ||
				dataType == "NCHAR" || dataType == "NVARCHAR" || dataType == "FLOAT" || dataType == "ALPHANUM" || dataType == "SHORTTEXT") {
				return true;
			}
			return false;
		};
		var isScaleSupported = function(dataType) {
			if (dataType == "DECIMAL" || dataType == "NUMERIC") {
				return true;
			}
			return false;

		};
		var getNextStaticText = function(jsonModel, stringValue) {
			var j = 0;
			var exist = true;
			while (exist) {
				exist = false;
				if (jsonModel.getData().hasOwnProperty("valueRanges")) {
					for (var i = 0; i < jsonModel.getData().valueRanges.length; i++) {
						var dataItem = jsonModel.getData().valueRanges[i];
						if (dataItem.valueRange.value == (j === 0 ? stringValue : stringValue + j)) {
							exist = true;
							j++;
							break;
						}
					}
				}
			}
			if (j === 0)
				return stringValue;
			else
				return stringValue + j;

		};
		var openToolTip = function(message, control) {
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

		return DetailInputParameter;
	});
