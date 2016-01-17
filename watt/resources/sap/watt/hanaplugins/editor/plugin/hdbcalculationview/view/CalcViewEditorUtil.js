/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../viewmodel/model",
        "../sharedmodel/sharedmodel",
         "../base/modelbase",
         "../viewmodel/RepositoryXmlRenderer",
         "../viewmodel/RepositoryXmlParser",
         "../base/XmlSerializer"
    ],

	function(ResourceLoader, viewModel, sharedmodel, modelbase, RepositoryXmlRenderer, RepositoryXmlParser, XmlSerializer) {
		"use strict";		
		var curEditor ;
		var primitiveTypesLength = {
			"ALPHANUM": {
				length: 127
			},
			"DECIMAL": {
				length: 34,
				scale: 34
			},
			"FLOAT": {
				length: 53
			},
			"NVARCHAR": {
				length: 5000
			},
			"SHORTTEXT": {
				length: 5000
			},
			"VARCHAR": {
				length: 5000
			},
			"VARBINARY": {
				length: 5000
			}
		};
		return {
			resourceLoader: new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview"),
			INVALID_RESOURCE_CHARACTERS: ['\\', '/', ':', '*', '?', '"', '<', '>', '|', '.', '&', ';', '\'', '$', '%', ',', '!', '#', '+', '~', '`'],
			DOUBLE_QUOTE: "",
			typeOfReplace: {
				DATASOURCE_WITH_DATASOURCE: "DATASOURCE_WITH_DATASOURCE",
				NODE_WITH_NODE: "NODE_WITH_NODE",
				NODE_WITH_DATASOURCE: "NODE_WITH_DATASOURCE"
			},
			checkValidUnicodeChar: function(string) {

				for (var i = 0; i < string.length; i++) {
					var ch = string.charAt(i);
					if (ch === ' ' || ch === '\n') {
						return false;
					}
					for (var j = 0; j < this.INVALID_RESOURCE_CHARACTERS.length; j++) {
						var invalidCh = this.INVALID_RESOURCE_CHARACTERS[j];
						if (invalidCh === ch) {
							return false;
						}
					}
				}
				return true;
			},

			getInvalidUnicodeCharacters: function() {
				var invalidCharString = "";
				for (var i = 0; i < this.INVALID_RESOURCE_CHARACTERS.length; i++) {
					invalidCharString = invalidCharString + this.INVALID_RESOURCE_CHARACTERS[i];
					if (i !== this.INVALID_RESOURCE_CHARACTERS.length - 1) {
						invalidCharString = invalidCharString.concat(' ');
					}
				}
				return invalidCharString;
			},

			checkRenameElement: function(value, element, viewNode, columnView, isSharedColumn) {
				var labelElement;
				var result = {
					message: undefined,
					messageObjects: undefined
				};
				if (value.length === 0 && !isSharedColumn) {
					result.message = "msg_column_invalid_empty";
				} else {
					viewNode.elements.foreach(function(elmnt) {
						if (elmnt.name === value) {
							result.message = "msg_column_already_exists";
							result.messageObjects = [elmnt.name];
						}
					});
					if (viewNode.isStarJoin() && !result.message) {
						viewNode.inputs.foreach(function(input) {
							if (input.getSource().$$className !== "ViewNode") {
								// Check shared column names
								input.getSource().elements.foreach(function(sharedElement) {
									if (sharedElement.name === value) {
										result.message = "msg_shared_column_already_exists";
										result.messageObjects = [value];
									}
								});
								// Check alias name
								if (!result.message) {
									input.mappings.foreach(function(mapping) {
										if (mapping.aliasName === value) {
											result.message = "msg_shared_column_already_exists";
											result.messageObjects = [value];
										}
									});
								}
							}
						});
					}
					if (viewNode.isDefaultNode() && columnView) {
						// Check hierarchy names
						columnView.inlineHierarchies.foreach(function(hierarchy) {
							if (hierarchy.name === value) {
								result.message = "msg_name_already_exists";
								result.messageObjects = [value];
							}
						});

					}
				}

				if (!result.message) {
					if (!this.checkValidUnicodeChar(value)) {
						result.message = "msg_column_invalid_unicode";
						result.messageObjects = [this.getInvalidUnicodeCharacters()];
					}
					if (result.message) { // check .description
						if (element && element.aggregationBehavior === "none") {
							var index = value.lastIndexOf('.');
							if (index !== -1) {
								var suffix = value.substring(index + 1);
								var prefix = value.substring(0, index);
								if (this.checkValidUnicodeChar(prefix) && suffix === "description") {
									if (element.calculationDefinition) {
										result.message = "msg_calculated_column_description_error";
										result.messageObjects = [value];
									} else if (columnView.dataCategory === "DIMENSION") {
										result.message = "msg_column_invalid_unicode";
										result.messageObjects = [this.getInvalidUnicodeCharacters()];
									} else {
										viewNode.elements.foreach(function(elmnt) {
											if (elmnt.labelElement && elmnt.labelElement === element) {
												labelElement = elmnt;
											}
										});
										if (labelElement && prefix === labelElement.name) {
											result.message = undefined;
											result.messageObjects = undefined;
										} else {
											result.message = "msg_column_description_error";
											result.messageObjects = undefined;
										}
									}

								}

							}
						}
					} else {
						if (columnView) {
							columnView.parameters.foreach(function(parameter) {
								if (parameter.name === value) {
									result.message = "msg_element_already_exists";
									result.messageObjects = [value];
								}
							});
						}
					}
				}
				return result;
			},

			createModelForElement: function(element, viewNode, columnView, calculatedColumn) {
				if (element) {
					var that = this;
					var labelElementList = [];
					var variableList = [];
					var variableName;
					var mapping;
					var dataTypes;
					var aggregationTypes = [];
					var types = [];
					var imagePath;
					var isProxy;
					var keyElement = false;
					var isDimension = false;
					var iconTooltip;
					var valueHelpEntity;
					var dataTypeString = element.inlineType ? element.inlineType.primitiveType : undefined;
					var engineAggregation;

					if (dataTypeString) {
						if (element.inlineType.length) {
							dataTypeString = dataTypeString + "(" + element.inlineType.length;
							if (element.inlineType.scale) {
								dataTypeString = dataTypeString + "," + element.inlineType.scale;
							}
							dataTypeString = dataTypeString + ")";
						}
					}

					if (element.aggregationBehavior === "none") {
						var elements = element.$$containingFeature;
						labelElementList.push({
							elementName: ""
						});
						if(elements !== undefined &&elements !== null){
							for(var i=0,len=elements.size();i<len ;i++){
							var elmnt =elements.getAt(i);
							if (elmnt !== undefined &&elmnt !== null&&elmnt.aggregationBehavior === "none" && elmnt !== element && !elmnt.measureType) {
									labelElementList.push({
										elementName: elmnt.name
									});
								}
							}
							}
						variableList.push({
							variableName: ""
						});
						if (columnView) {
							columnView.parameters.foreach(function(parameter) {
								if (parameter.isVariable) {
									variableList.push({
										variableName: parameter.name
									});
									if (parameter.assignedElements) {
										parameter.assignedElements.foreach(function(assignedElement) {
											if (assignedElement === element) {
												variableName = parameter.name;
											}
										});
									}
								}
							});
						}
					}

					if (viewNode) {
						isProxy = this.isBasedOnElementProxy({
							object: element,
							viewNode: viewNode
						});
						if (isProxy) {
							iconTooltip = this.consolidateResults(isProxy);
						}
						if(element.hasNoMapping === true && element.measureType !== "restriction" && element.calculationDefinition === undefined){
						    iconTooltip="No mapping exists for this output column";
						}
						if(element.deprecated === true){
						    iconTooltip="This output column is marked for deprecation";
						}
						if (columnView && columnView.dataCategory === "DIMENSION" && viewNode.isDefaultNode()) {
							isDimension = true;
						}
						if (element.calculationDefinition) {
							if (viewNode.isDefaultNode()) {
								if (element.measureType === "counter") {
									imagePath = "counter_scale.png";
								} else if (element.measureType === "restriction") {
									imagePath = "RestrictedMeasure.png";
								} else {
									imagePath = element.aggregationBehavior === "none" ? "Calculated_Attribute.png" : "CalculatedMeasure.png";
									if (element.aggregationBehavior === "none") {
										aggregationTypes = [{
											aggregationType: ""
                                        }, {
											aggregationType: "FORMULA"
                                        }];
									} else {
										aggregationTypes = [{
												aggregationType: ""
                                        }, {
												aggregationType: "VAR"
                                        }, {
												aggregationType: "SUM"
                                        }, {
												aggregationType: "STDDEV"
                                        }, {
												aggregationType: "MAX"
                                        }, {
												aggregationType: "MIN"
                                        }, {
												aggregationType: "COUNT"
                                        }, {
												aggregationType: "AVG"
                                        }
										];

									}
									types = [{
										type: "Attribute",
										icon: this.resourceLoader.getImagePath("Attribute.png")
                                    }, {
										type: "Measure",
										icon: this.resourceLoader.getImagePath("Measure.png")
                                    }];
								}
							} else {
								imagePath = "CalculatedColumn.png";
							}
						} else if (element.measureType === "restriction") {
							imagePath = "RestrictedMeasure.png";
						} else {
							if (viewNode.isDefaultNode()) {
								imagePath = element.aggregationBehavior === "none" ? "Attribute.png" : "Measure.png";
							} else {
								if (element.aggregationBehavior && viewNode.type === "Aggregation") {
									imagePath = element.aggregationBehavior === "none" ? "Column.png" : "AggregationColumn.png";
								} else {
									imagePath = "Column.png";
								}
							}
							aggregationTypes = [{
								aggregationType: ""
                            }, {
									aggregationType: "VAR"
                            }, {
									aggregationType: "SUM"
                            }, {
									aggregationType: "STDDEV"
                            }, {
									aggregationType: "MAX"
                            }, {
									aggregationType: "MIN"
                            }, {
									aggregationType: "COUNT"
                            }, {
									aggregationType: "AVG"
                            }
							];
							if (element.inlineType && element.inlineType.primitiveType) {
								var dataType = element.inlineType.primitiveType;
								if (dataType === "DATE" || dataType === "TIME" || dataType === "TIMESTAMP" || dataType === "VARCHAR" || dataType === "NVARCHAR") {
									aggregationTypes = [{
											aggregationType: ""
                                    },
										/*{
										aggregationType: "SUM"
                                    },*/
										{
											aggregationType: "MAX"
                                    }, {
											aggregationType: "MIN"
                                    }, {
											aggregationType: "COUNT"
                                    }];
								} else if (!(dataType === "BIGINT" || dataType === "DECIMAL" || dataType === "DOUBLE" || dataType === "FLOAT" || dataType ===
									"INTEGER" || dataType === "REAL" || dataType === "SMALLDECIMAL" || dataType === "SMALLINT" || dataType === "TINYINT")) {
									aggregationTypes = [{
										aggregationType: ""
                                    }, {
										aggregationType: "COUNT"
                                    }];
								}
							}
							if (columnView && columnView.dataCategory === "DIMENSION" && viewNode.isDefaultNode()) {
								isDimension = true;
								types = [{
									type: "Attribute",
									icon: this.resourceLoader.getImagePath("Attribute.png")
                                }];
								aggregationTypes = [{
									aggregationType: ""
                                }];
							} else {
								types = [{
									type: "Attribute",
									icon: this.resourceLoader.getImagePath("Attribute.png")
                                }, {
									type: "Measure",
									icon: this.resourceLoader.getImagePath("Measure.png")
                                }];
							}
						}
						if (!calculatedColumn) {
							viewNode.inputs.foreach(function(currInput) {
								currInput.mappings.foreach(function(currMapping) {
									if (element === currMapping.targetElement && currMapping.sourceElement) {
										mapping = that.getInputName(currInput) + "." + currMapping.sourceElement.name;
									}
								});
							});
						}
						if (viewNode.keyElements.get(element.name)) {
							keyElement = true;
						}
						if (viewNode.isDefaultNode()) {
							aggregationTypes.shift();
							if (element.aggregationBehavior === "none") {
								aggregationTypes = [{
									aggregationType: ""
                                }];
							}
						}
					}
					if (calculatedColumn) {
						dataTypes = this.getDataTypes();
					}
					if(element.deprecated === true ){
					    imagePath = this.resourceLoader.getImagePath("proxy/Depre" + imagePath);
					} 
					else if(element.hasNoMapping === true && element.measureType !== "restriction" && element.calculationDefinition === undefined) {
						imagePath = this.resourceLoader.getImagePath("proxy/" + imagePath);
					}
					else if (isProxy ) {

						imagePath = this.resourceLoader.getImagePath("proxy/" + imagePath);
					}else {
						imagePath = this.resourceLoader.getImagePath(imagePath);
					}
					
					
					if (element.externalTypeOfElement) {
						var viewName;
						if (element.externalTypeOfEntity) {
							viewName = element.externalTypeOfEntity.fqName;
						} else if (element.externalTypeOfElement.$getContainer() instanceof viewModel.Entity) {
							viewName = element.externalTypeOfElement.$getContainer().fqName;
						} else {
							viewName = columnView.name;
						}
						valueHelpEntity = viewName + "::" + element.externalTypeOfElement.name;
					} else if (element.typeOfElement && element.typeOfElement !== element) {
						valueHelpEntity = columnView.name + "::" + element.typeOfElement.name;
					}
					var aggregationBehavior = element.aggregationBehavior ? element.aggregationBehavior.toUpperCase() : undefined;
					engineAggregation = element.engineAggregation ? element.engineAggregation.toUpperCase() : aggregationBehavior;
					if (element.measureType === "restriction") {

						if (element.calculationDefinition && element.calculationDefinition.formula && viewNode) {
							var baseMeasure = viewNode.elements.get(element.calculationDefinition.formula);
							if (baseMeasure) {
								aggregationBehavior = baseMeasure.aggregationBehavior ? baseMeasure.aggregationBehavior.toUpperCase() : undefined;
								/*	aggregationTypes = [{
									aggregationType: aggregationBehavior
                                }];*/
								engineAggregation = baseMeasure.engineAggregation ? baseMeasure.engineAggregation.toUpperCase() : baseMeasure.aggregationBehavior.toUpperCase();
							}
						}

					} else if (element.measureType === "counter") {
						aggregationBehavior = element.aggregationBehavior ? element.aggregationBehavior.toUpperCase() : undefined;
						aggregationTypes = [{
							aggregationType: aggregationBehavior
                        }];
					}
					var drillDownList = [];
					drillDownList.push({
						value: viewModel.DrillDownEnablement.NONE,
						type: ""
					});
					drillDownList.push({
						value: viewModel.DrillDownEnablement.DRILL_DOWN,
						type: this.resourceLoader.getText("txt_drill_down")
					});
					if (viewNode && viewNode.$$model.columnView && viewNode.$$model.columnView.dataCategory === "DIMENSION" && viewNode.isDefaultNode()) {
						drillDownList.push({
							value: viewModel.DrillDownEnablement.DRILL_DOWN_WITH_HIERARCHY,
							type: this.resourceLoader.getText("txt_drill_down_hierarchy")
						});
					}

					return {
						measureType: element.measureType,
						aggregationBehavior: aggregationBehavior,
						aggregationTypes: aggregationTypes,
						types: types,
						name: element.name,
						oldName: element.name,
						label: element.label,
						seq: "none",
						focus: "none",
						seq1: "none",
						focus1: "none",
						iconTooltip: iconTooltip,
						dataTypeString: dataTypeString,
						primitiveType: element.inlineType ? element.inlineType.primitiveType : undefined,
						length: element.inlineType ? element.inlineType.length : undefined,
						scale: element.inlineType ? element.inlineType.scale : undefined,
						semanticType: element.inlineType ? element.inlineType.semanticType : viewModel.SemanticType.EMPTY,
						labelElement: element.labelElement,
						labelElementList: labelElementList,
						variable: variableName,
						variableList: variableList,
						hidden: element.hidden,
						mapping: mapping,
						keepFlag: element.keep,
						transparentFilter: element.transparentFilter,
						lineage:element.lineage,
						filter: element.filter ? element.filter : undefined,
						hierarchyDefaultMember: element.attributeHierarchyDefaultMember,
						infoObject: element.infoObjectName,
						drillDown: element.drillDownEnablement,
						drillDownList: drillDownList,
						calculation: element.calculationDefinition,
						formula: element.calculationDefinition ? element.calculationDefinition.formula : undefined,
						expressionLanguage: element.calculationDefinition ? element.calculationDefinition.expressionLanguage : undefined,
						descriptionColumn: element.name.lastIndexOf(".description") !== -1,
						dataTypes: dataTypes,
						imagePath: imagePath,
						keyElement: keyElement,
						displayFolder: element.displayFolder,
						unitCurrencyElement: element.unitCurrencyElement,
						isDimension: isDimension,
						valueHelpEntity: valueHelpEntity,
						valueHelpElementName: element.externalTypeOfElement ? element.externalTypeOfElement.name : "",
						engineAggregation: engineAggregation,
						comment: (element.endUserTexts !== undefined && element.endUserTexts !== null) ? (element.endUserTexts.comment.text ): "",	
						clientAggregation: [{
							aggregationType: "SUM"
						}]
					};
				}
			},

			createModelForSharedColumns: function(viewNode, columnView) {
				var that = this;
				var aModel = [];

				if (viewNode) {
					viewNode.inputs.foreach(function(input) {
						if (input.selectAll) {
							input.getSource().elements.foreach(function(element) {
								if (element && element.aggregationBehavior === viewModel.AggregationBehavior.NONE) {

									var dataTypeString, variableList, variableName, source, aliasName, aliasLabel, drillDown, hidden, transparentFilter = false,
										keyElement = false;

									source = that.getInputName(input);

									if (element.inlineType) {
										dataTypeString = element.inlineType.primitiveType;
										if (element.inlineType.length) {
											dataTypeString = dataTypeString + "(" + element.inlineType.length;
											if (element.inlineType.scale) {
												dataTypeString = dataTypeString + "," + element.inlineType.scale;
											}
											dataTypeString = dataTypeString + ")";
										}
									}

									if (columnView) {
										variableList = [];
										variableList.push({
											variableName: ""
										});
										columnView.parameters.foreach(function(parameter) {
											if (parameter.isVariable) {
												variableList.push({
													variableName: parameter.name
												});
												if (parameter.assignedElements) {
													parameter.assignedElements.foreach(function(assignedElement) {
														if (assignedElement === element) {
															variableName = parameter.name;
														}
													});
												}
											}
										});
									}

									var imagePath = /*element.calculationDefinition ? */ "Attribute.png" /* : "Calculated_Attribute.png"*/ ;

									if (element.isProxy) {
										imagePath = that.resourceLoader.getImagePath("proxy/" + imagePath);
									} else {
										imagePath = that.resourceLoader.getImagePath(imagePath);
									}

									/* if (input.getSource().keyElements.get(element.name)) {
                                        keyElement = true;
                                    }*/

									var mappingObj;
									for (var i = 0; i <= input.mappings.size(); i++) {
										var mapping = input.mappings.getAt(i);
										if (mapping && mapping.sourceElement && mapping.sourceElement === element) {
											mappingObj = mapping;
											break;
										}
									}
									if (mappingObj) {
										aliasName = mappingObj.aliasName;
										aliasLabel = mappingObj.label;
										transparentFilter = mappingObj.transparentFilter;
										/*if (mappingObj.targetEndUserTexts) {
                                            aliasLabel = mappingObj.targetEndUserTexts.label;
                                        }*/
									}
									if (input.excludedElements && input.excludedElements.get(element.name)) {
										hidden = true;
									} else {
										hidden = false;
									}

									if (element.drillDownEnablement === "DRILL_DOWN") {
										drillDown = that.resourceLoader.getText("txt_drill_down");
									} else if (element.drillDownEnablement === "DRILL_DOWN_WITH_HIERARCHY") {
										drillDown = that.resourceLoader.getText("txt_drill_down_hierarchy");
									}

									var oModel = {
										name: element.name,
										label: element.label,
										labelColumnName: element.labelElement ? element.labelElement.name : undefined,
										dataTypeString: dataTypeString,
										imagePath: imagePath,
										aggregationBehavior: element.aggregationBehavior ? element.aggregationBehavior.toUpperCase() : undefined,
										variable: variableName,
										variableList: variableList,
										source: source,
										keyElement: keyElement,
										inputKey: input.$getKeyAttributeValue(),
										aliasName: aliasName,
										aliasLabel: aliasLabel,
										transparentFilter: transparentFilter,
										lineage:element.lineage,
										hidden: hidden,
										drillDown: drillDown
									};
									aModel.push(oModel);
								}

							});
						}
					});
				}

				return aModel;
			},

			createModelForMeasure: function(element, viewNode, columnView, calculatedColumn) {
				if (element) {
					var that = this;
					var labelElementList = [];
					var variableList = [];
					var variableName;
					var mapping;
					var dataTypes;
					var aggregationTypes = [];
					var types = [];
					var imagePath;
					var keyElement = false;
					var isDimension = false;
					var dataTypeString = element.inlineType ? element.inlineType.primitiveType : undefined;

					if (dataTypeString) {
						if (element.inlineType.length) {
							dataTypeString = dataTypeString + "(" + element.inlineType.length;
							if (element.inlineType.scale) {
								dataTypeString = dataTypeString + "," + element.inlineType.scale;
							}
							dataTypeString = dataTypeString + ")";
						}
					}

					if (element.aggregationBehavior === "none") {
						var elements = element.$$containingFeature;
						labelElementList.push({
							elementName: ""
						});
						elements.foreach(function(elmnt) {
							if (elmnt.aggregationBehavior === "none" && elmnt !== element && !elmnt.measureType) {
								labelElementList.push({
									elementName: elmnt.name
								});
							}
						});
						variableList.push({
							variableName: ""
						});
						if (columnView) {
							columnView.parameters.foreach(function(parameter) {
								if (parameter.isVariable) {
									variableList.push({
										variableName: parameter.name
									});
									if (parameter.assignedElements) {
										parameter.assignedElements.foreach(function(assignedElement) {
											if (assignedElement === element) {
												variableName = parameter.name;
											}
										});
									}
								}
							});
						}
					}
					if (viewNode) {
						if (columnView && columnView.dataCategory === "DIMENSION" && viewNode.isDefaultNode()) {
							isDimension = true;
						}
						if (element.calculationDefinition) {
							if (viewNode.isDefaultNode()) {
								if (element.measureType === "counter") {
									imagePath = this.resourceLoader.getImagePath("counter_scale.png");
								} else if (element.measureType === "restriction") {
									imagePath = this.resourceLoader.getImagePath("RestrictedMeasure.png");
								} else {
									imagePath = this.resourceLoader.getImagePath(element.aggregationBehavior === "none" ? "Calculated_Attribute.png" :
										"CalculatedMeasure.png");
									aggregationTypes = [{
										aggregationType: ""
                                    }, {
										aggregationType: "FORMULA"
                                    }];
									types = [{
										type: "Attribute",
										icon: this.resourceLoader.getImagePath("Attribute.png")
                                    }, {
										type: "Measure",
										icon: this.resourceLoader.getImagePath("Measure.png")
                                    }];
								}
							} else {
								imagePath = this.resourceLoader.getImagePath("CalculatedColumn.png");
							}
						} else if (element.measureType === "restriction") {
							imagePath = this.resourceLoader.getImagePath("RestrictedMeasure.png");
						} else {
							if (viewNode.isDefaultNode()) {
								imagePath = this.resourceLoader.getImagePath(element.aggregationBehavior === "none" ? "Attribute.png" : "Measure.png");
							} else {
								if (element.aggregationBehavior && viewNode.type === "Aggregation") {
									imagePath = this.resourceLoader.getImagePath(element.aggregationBehavior === "none" ? "Column.png" : "AggregationColumn.png");
								} else {
									imagePath = this.resourceLoader.getImagePath("Column.png");
								}
							}
							aggregationTypes = [{
								aggregationType: ""
                            }, {
								aggregationType: "SUM"
                            }, {
								aggregationType: "MAX"
                            }, {
								aggregationType: "MIN"
                            }, {
								aggregationType: "COUNT"
                            }];
							if (element.inlineType && element.inlineType.primitiveType) {
								var dataType = element.inlineType.primitiveType;
								if (dataType === "DATE" || dataType === "TIME" || dataType === "TIMESTAMP") {
									aggregationTypes = [{
										aggregationType: ""
                                    }, {
										aggregationType: "MAX"
                                    }, {
										aggregationType: "MIN"
                                    }, {
										aggregationType: "COUNT"
                                    }];
								} else if (!(dataType === "BIGINT" || dataType === "DECIMAL" || dataType === "DOUBLE" || dataType === "FLOAT" || dataType ===
									"INTEGER" || dataType === "REAL" || dataType === "SMALLDECIMAL" || dataType === "SMALLINT" || dataType === "TINYINT")) {
									aggregationTypes = [{
										aggregationType: ""
                                    }, {
										aggregationType: "COUNT"
                                    }];
								}
							}
							if (columnView && columnView.dataCategory === "DIMENSION" && viewNode.isDefaultNode()) {
								isDimension = true;
								types = [{
									type: "Attribute",
									icon: this.resourceLoader.getImagePath("Attribute.png")
                                }];
								aggregationTypes = [{
									aggregationType: ""
                                }];
							} else {
								types = [{
									type: "Attribute",
									icon: this.resourceLoader.getImagePath("Attribute.png")
                                }, {
									type: "Measure",
									icon: this.resourceLoader.getImagePath("Measure.png")
                                }];
							}
						}
						if (!calculatedColumn) {
							viewNode.inputs.foreach(function(currInput) {
								currInput.mappings.foreach(function(currMapping) {
									if (element === currMapping.targetElement) {
										mapping = that.getInputName(currInput) + "." + currMapping.sourceElement.name;
									}
								});
							});
						}
						if (viewNode.keyElements.get(element.name)) {
							keyElement = true;
						}
						if (viewNode.isDefaultNode()) {
							aggregationTypes.shift();
							if (element.aggregationBehavior === "none") {
								aggregationTypes = [{
									aggregationType: ""
                                }];
							}
						}
					}
					if (calculatedColumn) {
						dataTypes = this.getDataTypes();
					}

					return {
						measureType: element.measureType,
						aggregationBehavior: element.aggregationBehavior ? element.aggregationBehavior.toUpperCase() : undefined,
						aggregationTypes: aggregationTypes,
						types: types,
						name: element.name,
						oldName: element.name,
						label: element.label,
						dataTypeString: dataTypeString,
						primitiveType: element.inlineType ? element.inlineType.primitiveType : undefined,
						length: element.inlineType ? element.inlineType.length : undefined,
						scale: element.inlineType ? element.inlineType.scale : undefined,
						semanticType: element.inlineType ? element.inlineType.semanticType : viewModel.SemanticType.EMPTY,
						labelElementList: labelElementList,
						variable: variableName,
						variableList: variableList,
						hidden: element.hidden,
						mapping: mapping,
						filter: element.filter ? element.filter : undefined,
						drillDown: element.drillDownEnablement,
						calculation: element.calculationDefinition,
						formula: element.calculationDefinition ? element.calculationDefinition.formula : undefined,
						descriptionColumn: element.name.lastIndexOf(".description") !== -1,
						dataTypes: dataTypes,
						imagePath: imagePath,
						keyElement: keyElement,
						displayFolder: element.displayFolder,
						unitCurrencyElement: element.unitCurrencyElement,
						isDimension: isDimension
					};
				}

			},

			getAttributePropertiesModel: function(element) {
				var attributes = this.createModelForElementAttributes();
				attributes.objectAttributes.aggregationBehavior = "none";
				attributes.objectAttributes.drillDownEnablement = "DRILL_DOWN";
				attributes.objectAttributes.displayFolder = undefined;
				/*if (!(element.inlineType.semanticType === "amount" || element.inlineType.semanticType === "quantity")) {
                attributes.typeAttributes.semanticType = "empty";
            }*/
				return attributes;
			},

			getMeasurePropertiesModel: function(element) {
				var attributes = this.createModelForElementAttributes();
				if (element.calculationDefinition) {
					attributes.objectAttributes.aggregationBehavior = "formula";
				} else {
					var primitiveType = element.inlineType ? element.inlineType.primitiveType : undefined;
					if (this.isDateOrTime(primitiveType)) {
						attributes.objectAttributes.aggregationBehavior = "min";
					} else if (this.isString(primitiveType) || primitiveType === "BOOLEAN") {
						attributes.objectAttributes.aggregationBehavior = "count";
					} else {
						attributes.objectAttributes.aggregationBehavior = "sum";
					}
				}
				if (element.labelElement) {
					attributes.labelElement = null;
				}
				if (element.keep) {
					attributes.objectAttributes.keep = false;
				}
				if (element.transparentFilter) {
					attributes.objectAttributes.transparentFilter = false;
				}
				if (!(element.inlineType.semanticType === viewModel.SemanticType.AMOUNT || element.inlineType.semanticType === viewModel.SemanticType.QUANTITY)) {
					attributes.typeAttributes.semanticType = viewModel.SemanticType.EMPTY;
				}
				if (element.externalTypeOfEntity) {
					attributes.extTypeEntity = null;
				}
				if (element.externalTypeOfElement) {
					attributes.elementName = null;
				}
				return attributes;
			},

			getSemanticTypeText: function(semanticType) {

				if (semanticType === viewModel.SemanticType.EMPTY) {
					return "";
				}
				if (semanticType === viewModel.SemanticType.AMOUNT) {
					return this.resourceLoader.getText("txt_amount_with_currency_code");
				}
				if (semanticType === viewModel.SemanticType.QUANTITY) {
					return this.resourceLoader.getText("txt_quantity_with_unit_of_measure");
				}
				if (semanticType === viewModel.SemanticType.CURRENCY_CODE) {
					return this.resourceLoader.getText("txt_currency_code");
				}
				if (semanticType === viewModel.SemanticType.UNIT_OF_MEASURE) {
					return this.resourceLoader.getText("txt_unit_of_measure");
				}
				if (semanticType === viewModel.SemanticType.DATE_BUSINESS_DATE_FROM) {
					return this.resourceLoader.getText("txt_date_business_date_from");
				}
				if (semanticType === viewModel.SemanticType.DATE_BUSINESS_DATE_TO) {
					return this.resourceLoader.getText("txt_date_Business_date_to");
				}
				if (semanticType === viewModel.SemanticType.GEO_LOCATION_LONGITUDE) {
					return this.resourceLoader.getText("txt_geo_location_longitude");
				}
				if (semanticType === viewModel.SemanticType.GEO_LOCATION_LATITUDE) {
					return this.resourceLoader.getText("txt_geo_location_latitude");
				}
				if (semanticType === viewModel.SemanticType.GEO_LOCATION_CARTO_ID) {
					return this.resourceLoader.getText("txt_geo_location_carto_id");
				}
				if (semanticType === viewModel.SemanticType.GEO_LOCATION_NORMALIZED_NAME) {
					return this.resourceLoader.getText("txt_geo_location_normalized_name");
				}
				if (semanticType === viewModel.SemanticType.DATE) {
					return this.resourceLoader.getText("txt_date");
				}
				return semanticType;
			},

			createModelForCalculatedColumn: function(element, viewNode) {
				var model = this.createModelForElement(element, viewNode, null, true);
				if (viewNode && viewNode.isDefaultNode()) {
					model.semanticTypes = element.aggregationBehavior === "none" ? this.getSemanticTypesForAttribute() : this.getSemanticTypesForMeasure();
					model.columnTypes = [{
						key: "column",
						text: this.resourceLoader.getText("txt_column")
                    }];

					if (element.currencyConversion === undefined && element.unitConversion === undefined && element.aggregationBehavior !== "none" &&
						element.inlineType && (element.inlineType.semanticType === viewModel.SemanticType.AMOUNT || element.inlineType.semanticType ===
							viewModel.SemanticType.QUANTITY)) {
						model.columnTypes.push({
							key: "fixed",
							text: "Fixed"
						});
						if (element.fixedCurrency) {
							model.fixedCurrency = element.fixedCurrency;
						}
					}
				}
				return model;
			},

			createModelForElementAttributes: function(element) {
				var attributes = {
					objectAttributes: {},
					typeAttributes: {}
				};
				if (element && element.inlineType) {
					attributes.typeAttributes.primitiveType = element.inlineType.primitiveType;
					attributes.typeAttributes.length = element.inlineType.length;
					attributes.typeAttributes.scale = element.inlineType.scale;
				}
				return attributes;
			},

			getUniqueNameForElement: function(string, viewNode, elementNames, skipInputKey) {
				var name = this.normalizeString(string);
				var aliasName = name;
				var count = 0;
				var unique = false;
				while (elementNames && !unique) {
					unique = true;
					for (var i = 0; i < elementNames.length; i++) {
						if (elementNames[i] === aliasName) {
							count++;
							aliasName = name + "_" + count;
							unique = false;
							break;
						}
					}
				}
				while (viewNode.elements.get(aliasName)) {
					count++;
					aliasName = name + "_" + count;
				}
				if (viewNode.isStarJoin()) {
					viewNode.inputs.foreach(function(input) {
						if (input.selectAll && input.$$defaultKeyValue !== skipInputKey) {
							while (input.getSource().elements.get(aliasName)) {
								var mapping = input.mappings.get(aliasName);
								if (mapping && mapping.type === "ElementMapping") {
									if (mapping.aliasName === aliasName) {
										count++;
										aliasName = name + "_" + count;
									} else {
										break;
									}
								} else {
									count++;
									aliasName = name + "_" + count;
								}
							}
							input.mappings.foreach(function(mapping) {
								if (mapping.aliasName === aliasName) {
									count++;
									aliasName = name + "_" + count;
								}
							});
						}
					});
				}
				return aliasName;
			},

			normalizeString: function(string) {
				string = string.replace(/\//g, "_");
				string = string.replace(/\@/g, "_");
				string = string.replace(/\ /g, "_");
				return string.replace(/\./g, "_");
			},

			createModelForColumn: function(element, viewNode, columnView) {

				var labelElementList = [];
				var variableList = [];
				var variableName;
				var mapping;
				var that = this;

				if (!element) {
					return;
				}
				if (element.aggregationBehavior === "none") {
					var elements = element.$$containingFeature;
					labelElementList.push({
						elementName: ""
					});
					if(elements){
					elements.foreach(function(elmnt) {
						if (elmnt.aggregationBehavior === "none" && elmnt !== element) {
							labelElementList.push({
								elementName: elmnt.name
							});
						}
					});
					}
					variableList.push({
						variableName: ""
					});
					columnView.parameters.foreach(function(parameter) {
						if (parameter.isVariable) {
							variableList.push({
								variableName: parameter.name
							});
							if (parameter.typeOfElement === element) {
								variableName = parameter.name;
							}
						}
					});
				}
				if (element.$getContainer() !== viewNode) {
					var inputArr = [];
					if (element.$getContainer() && element.$getContainer().inputs !== undefined) {
						inputArr = that.getFqName(element.$getContainer(), element);
						for (var i = 0; i < inputArr.length; i++) {
							var container = inputArr[i].$getContainer();
							var name;
							name = that.getFullName(container);
							if (mapping === undefined) {
								mapping = name + "." + inputArr[i].name;
							} else {
								mapping = name + "." + inputArr[i].name;
							}
						}
					}
				} else {
					viewNode.inputs.foreach(function(currInput) {
						currInput.mappings.foreach(function(currMapping) {
							if (element === currMapping.targetElement && currMapping.sourceElement) {
								mapping = that.getInputName(currInput) + "." + currMapping.sourceElement.name;
							}
						});
					});
				}
				return {
					name: element.name,
					oldName: element.name,
					primitiveType: element.inlineType ? element.inlineType.primitiveType : undefined,
					length: element.inlineType ? element.inlineType.length : undefined,
					scale: element.inlineType ? element.inlineType.scale : undefined,
					mapping: mapping,
					transparentFilter: element.transparentFilter,
					filter: element.filter ? element.filter : undefined,
					keepFlag: element.keep
				};

			},

			getConstantDataTypes: function() {
				var dataTypes = [{
						datatype: "ALPHANUM"
                    }, {
						datatype: "BIGINT"
                    }, {
						datatype: "BLOB"
                    }, {
						datatype: "CLOB"
                    }, {
						datatype: "DATE"
                    }, {
						datatype: "DECIMAL"
                    }, {
						datatype: "DOUBLE"
                    }, {
						datatype: "FLOAT"
                    }, {
						datatype: "INTEGER"
                    }, {
						datatype: "NCLOB"
                    }, {
						datatype: "NUMERIC"
                    }, {
						datatype: "NVARCHAR"
                    }, {
						datatype: "REAL"
                    }, {
						datatype: "SECONDDATE"
                    }, {
						datatype: "SHORTTEXT"
                    }, {
						datatype: "SMALLDECIMAL"
                    }, {
						datatype: "SMALLINT"
                    },
                    /* {
                               datatype: "ST_GEOMETRY"
            }, {
                datatype: "ST_POINT"
            },*/
					{
						datatype: "TEXT"
                    }, {
						datatype: "TIME"
                    }, {
						datatype: "TIMESTAMP"
                    }, {
						datatype: "TINYINT"
                    }, {
						datatype: "VARBINARY"
                    }, {
						datatype: "VARCHAR"
                    }
                ];
				return dataTypes;
			},

			getDataTypes: function() {
				var dataTypes = [{
					/*                datatype: "ALPHANUM"
            }, {
*/
					datatype: "BIGINT"
                }, {
					/*                datatype: "BLOB"
            }, {
                datatype: "CLOB"
            }, {
*/
					datatype: "DATE"
                }, {
					datatype: "DECIMAL"
                }, {
					datatype: "DOUBLE"
                }, {
					datatype: "FLOAT"
                }, {
					datatype: "INTEGER"
                }, {
					/*                datatype: "NCLOB"
            }, {
*/
					datatype: "NVARCHAR"
                }, {
					datatype: "REAL"
                }, {
					datatype: "SECONDDATE"
                }, {
					/*                datatype: "SHORTTEXT"
            }, {
*/
					datatype: "SMALLDECIMAL"
                }, {
					datatype: "SMALLINT"
                }, {
					/*                datatype: "ST_GEOMETRY"
            }, {
                datatype: "ST_POINT"
            }, {
*/
					/*                datatype: "TEXT"
            }, {
*/
					datatype: "TIME"
                }, {
					datatype: "TIMESTAMP"
                }, {
					datatype: "TINYINT"
                }, {
					/*                datatype: "VARBINARY"
            }, {
*/
					datatype: "VARCHAR"
                }];
				return dataTypes;
			},
			getOperatorsData: function() {
				var operatorData = [{
					operator: "Between",
					key: sharedmodel.ValueFilterOperator.BETWEEN
                }, {
					operator: "Equal",
					key: sharedmodel.ValueFilterOperator.EQUAL
                }, {
					operator: "GreaterEqual",
					key: sharedmodel.ValueFilterOperator.GREATER_EQUAL
                }, {
					operator: "GreaterThan",
					key: sharedmodel.ValueFilterOperator.GREATER_THAN
                }, {
					operator: "Is Not Null",
					key: "Is Not Null"
                }, {
					operator: "IsNull",
					key: sharedmodel.ValueFilterOperator.IS_NULL
                }, {
					operator: "LessEqual",
					key: sharedmodel.ValueFilterOperator.LESS_EQUAL
                }, {
					operator: "LessThan",
					key: sharedmodel.ValueFilterOperator.LESS_THAN
                }];

				return operatorData;
			},

			showErrorMessageTooltip: function(textField, message, messageObjects, headerMessage) {

				var tooltip = this.addErrorMessageTooltip(textField, message, messageObjects, headerMessage);
				if (tooltip) {
					// getting call out exception every time when ever this method is calling.
					if (textField.getTooltip() !== tooltip) {
						tooltip.openPopup(textField);
					}

					// open the popup
					/*	window.setTimeout(function() {
						// Condition is added because of getting exception in CallOutBase class .
						if (textField.getTooltip() !== tooltip) {
							tooltip.openPopup(textField);
						}
					}, 200); */
				}
			},
			addErrorMessageTooltip: function(textField, message, messageObjects, headerMessage) {
				if (!textField) {
					return;
				}
				var tooltip = new sap.ui.commons.Callout({});
				tooltip.addContent(
					new sap.ui.layout.VerticalLayout({
						content: [
                            new sap.ui.layout.HorizontalLayout({
								content: [
                                    new sap.ui.commons.Label({
										design: sap.ui.commons.LabelDesign.Bold,
										icon: "sap-icon://error"
									}),
                                    new sap.ui.commons.TextView({
										semanticColor: sap.ui.commons.TextViewColor.Negative,
										design: sap.ui.commons.TextViewDesign.Bold,
										text: headerMessage ? headerMessage : "Error"
									})
                                ]
							}),
                            new sap.ui.commons.HorizontalDivider(),
                            new sap.ui.commons.TextView({
								text: messageObjects ? this.resourceLoader.getText(message, messageObjects) : message
							})
                        ]
					})
				);
				textField.setTooltip(tooltip);
				textField.setValueState(sap.ui.core.ValueState.Error);
				return tooltip;
			},
			clearErrorMessageTooltip: function(textField) {
				if (!textField) {
					return;
				}
				textField.setTooltip(null);
				textField.setValueState(sap.ui.core.ValueState.None);
				if (textField.getBinding("value")) {
					textField.getBinding("value").refresh(true);
				}
			},

			getSemanticTypesForAttribute: function() {
				var semanticTypeList = {
					items: [{
						key: viewModel.SemanticType.EMPTY,
						value: ""
                    }, {
						key: viewModel.SemanticType.QUANTITY,
						value: this.resourceLoader.getText("txt_amount_with_currency_code")
                    }, {
						key: viewModel.SemanticType.QUANTITY,
						value: this.resourceLoader.getText("txt_quantity_with_unit_of_measure")
                    }, {
						key: viewModel.SemanticType.CURRENCY_CODE,
						value: this.resourceLoader.getText("txt_currency_code")
                    }, {
						key: viewModel.SemanticType.UNIT_OF_MEASURE,
						value: this.resourceLoader.getText("txt_unit_of_measure")
                    }, {
						key: viewModel.SemanticType.DATE_BUSINESS_DATE_FROM,
						value: this.resourceLoader.getText("txt_date_business_date_from")
                    }, {
						key: viewModel.SemanticType.DATE_BUSINESS_DATE_TO,
						value: this.resourceLoader.getText("txt_date_Business_date_to")
                    }, {
						key: viewModel.SemanticType.GEO_LOCATION_LONGITUDE,
						value: this.resourceLoader.getText("txt_geo_location_longitude")
                    }, {
						key: viewModel.SemanticType.GEO_LOCATION_LATITUDE,
						value: this.resourceLoader.getText("txt_geo_location_latitude")
                    }, {
						key: viewModel.SemanticType.GEO_LOCATION_CARTO_ID,
						value: this.resourceLoader.getText("txt_geo_location_carto_id")
                    }, {
						key: viewModel.SemanticType.GEO_LOCATION_NORMALIZED_NAME,
						value: this.resourceLoader.getText("txt_geo_location_normalized_name")
                    }, {
						key: viewModel.SemanticType.DATE,
						value: this.resourceLoader.getText("txt_date")
                    }]
				};
				return semanticTypeList;
			},

			getSemanticTypesForMeasure: function() {
				var semanticTypeList = {
					items: [{
						key: viewModel.SemanticType.EMPTY,
						value: ""
                    }, {
						key: viewModel.SemanticType.AMOUNT,
						value: this.resourceLoader.getText("txt_amount_with_currency_code")
                    }, {
						key: viewModel.SemanticType.QUANTITY,
						value: this.resourceLoader.getText("txt_quantity_with_unit_of_measure")
                    }]
				};
				return semanticTypeList;
			},

			getDataTypeImage: function(dataType) {
				if (dataType) {
					if (dataType === "VARCHAR" || dataType === "NVARCHAR" || dataType === "SHORTTEXT" || dataType === "TEXT") {
						return this.resourceLoader.getImagePath("datatypes/String.png");
					}
					if (dataType === "BIGINT" || dataType === "DECIMAL" || dataType === "DOUBLE" || dataType === "FLOAT" || dataType === "INTEGER" ||
						dataType === "REAL" || dataType === "SMALLDECIMAL" || dataType === "SMALLINT" || dataType === "TINYINT") {
						return this.resourceLoader.getImagePath("datatypes/Numeric.png");
					}
					if (dataType === "DATE") {
						return this.resourceLoader.getImagePath("datatypes/Date.png");
					}
					if (dataType === "TIME") {
						return this.resourceLoader.getImagePath("datatypes/Time.png");
					}
					if (dataType === "TIMESTAMP") {
						return this.resourceLoader.getImagePath("datatypes/DateTime.png");
					}
					if (dataType === "ST_GEOMETRY" || dataType === "ST_POINT") {
						return this.resourceLoader.getImagePath("datatypes/Spatial.png");
					}
					return this.resourceLoader.getImagePath("datatypes/Unknown.png");
				}
				return null;
			},

			getDataSourceImage: function(type) {
				var imageName;

				type = type ? type.toUpperCase() : type;
				switch (type) {
					case "CALCULATIONVIEW":
						imageName = "calculation_scenario.png";
						break;
					case "ANALYTICVIEW":
						imageName = "AnalyticView.png";
						break;
					case "ATTRIBUTEVIEW":
						imageName = "AttributeView.png";
						break;
					case "VIEW":
						imageName = "view.jpg";
						break;
					default:
						imageName = "Table.png";
				}

				return this.resourceLoader.getImagePath(imageName);
			},

			getInputImagePath: function(input, isPerformanceMode,isGraphNode) {
				var imagePath = "Table.png";
				if (!isGraphNode) {
				if (input && input.getSource()) {
					if (input.getSource().$$className === "Entity") {
						if (input.getSource().type === "CALCULATIONVIEW") {
							imagePath = "calculation_scenario.png";
						} else if (input.getSource().type === "ANALYTICVIEW") {
							imagePath = "AnalyticView.png";
						} else if (input.getSource().type === "ATTRIBUTEVIEW") {
							imagePath = "AttributeView.png";
						} else if (input.getSource().type && input.getSource().type.toUpperCase() === "HDBTABLEFUNCTION") {
							if (input.getSource().errorMsg) {
								imagePath = "TableFunctionError.gif";
							} else {
								imagePath = "TableFunction.gif";
							}
						}
						var isProxy = false;
						input.getSource().elements.foreach(function(element) {
							if (element.isProxy) {
								isProxy = true;
							}
						});
						if (isProxy) {
							imagePath = "proxy/" + imagePath;
						}
						if (isPerformanceMode) {
							if (input.getSource().hasPartitionSpecifications && input.getSource().partitionSpecifications.size() > 0 && input.getSource().partitionSpecifications
								.get(0).type !== "None") {
								imagePath = "PartitionTable.gif";
							} else if (input.getSource().subtype === "ROW") {
								imagePath = "row_table.gif";
							} else if (input.getSource().subtype === "VIRTUAL") {
								imagePath = "table_virtual.png";
							}
							/*else if(input.getSource().subtype === "EXTENDED") {
                            }*/
						}
					} else if (input.getSource().$$className === "ViewNode") {
						if (input.getSource().type === "Projection") {
							imagePath = "Projection.png";
						} else if (input.getSource().type === "JoinNode") {
							imagePath = "Join.png";
						} else if (input.getSource().type === "Aggregation") {
							imagePath = "Aggregation.png";
						} else if (input.getSource().type === "Union") {
							imagePath = "Union.png";
						} else if (input.getSource().type === "Rank") {
							imagePath = "Rank.png";
						}
					}
				}
				}
				 /* Graph Node implementation-start */
				else{
				    if(input && input.$$className === "Entity") {
						if (input.type === "GRAPH_WORKSPACE") {
							imagePath = "Projection.png";
						}
				    }
				}
				 /* Graph Node implementation-end */
				return this.resourceLoader.getImagePath(imagePath);
			},
			getFullName: function(container) {
				var name;
				if (container.type === "DATA_BASE_TABLE") {
					if (container.physicalSchema) {
						name = '"' + container.physicalSchema + '".' + container.name;
					} else if (container.schemaName) {
						name = '"' + container.schemaName + '".' + container.name;
					} else {
						name = container.fqName;
					}
				} else if (container.fqName !== undefined) {
					name = container.fqName;
				} else {
					name = container.name;
				}
				return name;
			},
			getFqName: function(container, element) {
				var person = [];
				container.inputs.foreach(function(input) {
					input.mappings.foreach(function(mapping) {
						if (mapping.targetElement === element) {
							if (mapping.sourceElement !== undefined) {
								person.push(mapping.sourceElement);
							}
						}

					});
				});
				return person;
			},
			getInputName: function(input) {
				if (input && input.getSource()) {
					if (input.getSource().$$className === "Entity") {
						var name;
					//	if (input.getSource().type === "DATA_BASE_TABLE" || "TABLE") {

							if(input.getSource().getFullyQualifiedName())
								name = input.getSource().getFullyQualifiedName();
							else if(input.getSource().id)
								name = input.getSource().id;
							else
								name = input.getSource().name;
							
					/*	} 
					else {
							name = input.getSource().getFullyQualifiedName();
						}*/
						if (input.alias) {
							name = name + "(" + input.alias + ")";
						}
						return name;
					} else if (input.getSource().$$className === "ViewNode") {
						return input.getSource().name;
					}
				}
			},

			isDateOrTime: function(dataType) {
				if (dataType === "DATE" || dataType === "TIME" || dataType === "TIMESTAMP") {
					return true;
				}
				return false;
			},
			isNumaric: function(dataType) {
				if (dataType === "BIGINT" || dataType === "DECIMAL" || dataType === "DOUBLE" || dataType === "FLOAT" || dataType === "INTEGER" ||
					dataType === "REAL" || dataType === "SMALLDECIMAL" || dataType === "SMALLINT" || dataType === "TINYINT") {
					return true;
				}
				return false;
			},

			isString: function(dataType) {
				if (dataType === "VARCHAR" || dataType === "NVARCHAR" || dataType === "SHORTTEXT" || dataType === "TEXT") {
					return true;
				}
				return false;
			},
			getPrimitiveTypeMaxLength: function(typeName) {
				var type = primitiveTypesLength[typeName];
				return type ? type.length : -1;
			},
			getPrimitiveTypeMaxScale: function(typeName) {
				var type = primitiveTypesLength[typeName];
				return type && type.scale ? type.scale : -1;
			},
			validateNumber: function(value) {
				var pattern = /^\d+$/;
				return pattern.test(value);
			},
			validateDataTypeLength: function(value, dataType) {
				if ((dataType === "DECIMAL" || dataType === "FLOAT") && value === "") {
					return true;
				}
				var pattern = /^\d+$/;
				return pattern.test(value);
			},
			getAggregationBehavior: function(dataType) {
				if (dataType === "BIGINT" || dataType === "DECIMAL" || dataType === "DOUBLE" || dataType === "FLOAT" || dataType === "INTEGER" ||
					dataType === "REAL" || dataType === "SMALLDECIMAL" || dataType === "SMALLINT" || dataType === "TINYINT") {
					return "SUM";
				} else if (dataType === "DATE" || dataType === "TIME" || dataType === "TIMESTAMP") {
					return "MIN";
				}
			},

			_processElements: function(attributes) {
				var that = this;
				var isProxy = false;
				var element = attributes.element;
				var elements = attributes.elements;
				var viewNode = attributes.viewNode;
				var proxyInformation = attributes.proxyInformation;
				var canWriteText = attributes.canWriteText;
				if (element) {
					// Currency Column
					if (element.unitCurrencyElement && element.inlineType && element.inlineType.semanticType && element.inlineType.semanticType !==
						viewModel.SemanticType.EMPTY) {
						if (element.unitCurrencyElement && elements.indexOf(element.unitCurrencyElement) === -1) {
							elements.push(element.unitCurrencyElement);
							if (that.isProxyElement(element, viewNode)) {
								isProxy = true;
								var columnName = element ? that.DOUBLE_QUOTE + element.name + that.DOUBLE_QUOTE : "";
								proxyInformation.push({
									elementName: element ? element.name : undefined,
									message: "the column " + columnName + "is a proxy column"
								});
							}
							var result = that._processElements({
								element: element.unitCurrencyElement,
								elements: elements,
								viewNode: viewNode,
								proxyInformation: proxyInformation,
								canWriteText: false
							});
							if (result) {
								isProxy = true;
								if (canWriteText) {
									var columnName = element.unitCurrencyElement ? that.DOUBLE_QUOTE + element.unitCurrencyElement.name + that.DOUBLE_QUOTE : "";
									proxyInformation.push({
										elementName: element.unitCurrencyElement ? element.unitCurrencyElement.name : undefined,
										message: "the sematic column " + columnName + " is inconsistent"
									});
								}
							}
						}
					}
					if (element.measureType === "counter") { // counter
						if (element.exceptionAggregationStep && element.exceptionAggregationStep.referenceElements) {
							element.exceptionAggregationStep.referenceElements.foreach(function(e) {
								if (e && elements.indexOf(e) === -1) {
									var result = that._processElements({
										element: e,
										elements: elements,
										viewNode: viewNode,
										proxyInformation: proxyInformation,
										canWriteText: false
									});
									if (result) {
										isProxy = true;
										if (canWriteText) {
											proxyInformation.push({
												elementName: e.name,
												message: "the reference column " + that.DOUBLE_QUOTE + e.name + that.DOUBLE_QUOTE + " is inconsistent"
											});
										}
									}
								}
							});
						}

					} else if (element.measureType === "restriction") { // Restricted Column
						if (element.calculationDefinition && element.calculationDefinition.formula) {
							var baseMeasure = viewNode.elements.get(element.calculationDefinition.formula);
							if (baseMeasure && elements.indexOf(baseMeasure) === -1) {
								var result = that._processElements({
									element: baseMeasure,
									elements: elements,
									viewNode: viewNode,
									proxyInformation: proxyInformation,
									canWriteText: false
								});
								if (result) {
									isProxy = true;
									if (canWriteText) {
										proxyInformation.push({
											elementName: baseMeasure.name,
											message: "the base measure column " + that.DOUBLE_QUOTE + baseMeasure.name + that.DOUBLE_QUOTE + " is inconsistent"
										});
									}

								}
							}
						}
						if (element.restrictions) {
							element.restrictions.foreach(function(restriction) {
								if (restriction.element && elements.indexOf(restriction.element) === -1) {
									var result = that._processElements({
										element: restriction.element,
										elements: elements,
										viewNode: viewNode,
										proxyInformation: proxyInformation,
										canWriteText: false
									});
									if (result) {
										isProxy = true;
										if (canWriteText) {
											proxyInformation.push({
												elementName: restriction.element.name,
												message: "the restricted attribute " + that.DOUBLE_QUOTE + restriction.element.name + that.DOUBLE_QUOTE + " is inconsistent"
											});
										}

									}

								}
							});
						}
						if (element.restrictionExpression && element.restrictionExpression.formula) { // Calculated Column
							var restStr = element.restrictionExpression.formula;
							var restPattern = '"';
							var restResult = restStr.split(restPattern);
							var proxyColumns = "";
							if (viewNode) {
								for (var j = 0; j < restResult.length; j++) {
									var restElementName = restResult[j];
									if (restElementName === "" || element.name === restElementName) {
										continue;
									} else {
										var e = viewNode.elements.get(restElementName);
										if (e && elements.indexOf(e) === -1) {
											var result = that._processElements({
												element: e,
												elements: elements,
												viewNode: viewNode,
												proxyInformation: proxyInformation,
												canWriteText: false
											});
											if (result) {
												isProxy = true;
												proxyColumns = proxyColumns ? proxyColumns + "," + e.name : e.name;
											}
										}
									}
								}
								if (proxyColumns) {
									if (canWriteText) {
										var message;
										if (proxyColumns.indexOf(",") > -1) {
											message = "the columns " + proxyColumns + " used in the restriction expression are inconsistent"
										} else {
											message = "the column " + proxyColumns + " used in the restriction expression is inconsistent"
										}
										proxyInformation.push({
											elementName: element.name,
											message: message
										});
									}

								}
							}
						}
					} else if (element.calculationDefinition && element.calculationDefinition.formula) { // Calculated Column
						var str = element.calculationDefinition.formula;
						var pattern = '"';
						var result = str.split(pattern);
						var proxyColumns = "";
						if (viewNode) {
							for (var i = 0; i < result.length; i++) {
								var elementName = result[i];
								if (elementName === "" || element.name === elementName) {
									continue;
								} else {
									var e = viewNode.elements.get(elementName);
									if (e && elements.indexOf(e) === -1) {
										var results = that._processElements({
											element: e,
											elements: elements,
											viewNode: viewNode,
											proxyInformation: proxyInformation,
											canWriteText: false
										});
										if (results) {
											isProxy = true;
											proxyColumns = proxyColumns ? (proxyColumns + "," + e.name) : e.name;
										}
									}
								}
							}
							if (proxyColumns) {
								if (canWriteText) {
									var message;
									if (proxyColumns.indexOf(",") > -1) {
										message = "the columns " + proxyColumns + " used in the calculated column expression are inconsistent";
									} else {
										message = "the column " + proxyColumns + " used in the calculated column expression is inconsistent";
									}
									proxyInformation.push({
										elementName: element.name,
										message: message
									});
								}

							}
						}
					}
					if (element.typeOfElement || element.externalTypeOfElement) {
						if (element.typeOfElement) {
							var results = that.isProxyElement(element.typeOfElement, viewNode)
							if (results) {
								isProxy = true;
								if (canWriteText) {
									proxyInformation.push({
										elementName: element.name,
										message: "the value help column " + element.typeOfElement.name + " is inconsistent column"
									});
								}
							}

						} else if (element.externalTypeOfElement) {
							if (element.externalTypeOfElement.isProxy) {
								isProxy = true;
								if (canWriteText) {
									proxyInformation.push({
										elementName: element.name,
										message: "the value help column " + element.externalTypeOfElement.name + " is proxy column "
									});
								}
							}
						}
					} else {
						if (that.isProxyElement(element, viewNode)) {
							isProxy = true;
							if (canWriteText) {
								var columnName = element ? that.DOUBLE_QUOTE + element.name + that.DOUBLE_QUOTE : "";
								proxyInformation.push({
									elementName: element ? element.name : undefined,
									message: "the column " + columnName + " is a proxy column or inconsistent column",
									sameElement: true
								});
							}
						}
						elements.push(element);
					}
				}
				return isProxy;
			},

			isBasedOnElementProxy: function(parameters) {
				var that = this;

				var object = parameters.object;
				var columnView = parameters.columnView;
				var viewNode = parameters.viewNode;
				var input = parameters.input;
				var proxyInformation = [];
				var canWriteText = true;

				var checkAllElements = false;

				var elementProxies = [];
				var elements = [];
				if (object) {
					if (object instanceof viewModel.Element && object.isProxy) {
						elementProxies.push(object);
						var columnName = object ? object.name : "";
						proxyInformation.push({
							elementName: object ? object.name : undefined,
							message: "The column " + columnName + "is a proxy column"
						});

						return proxyInformation;
					}
					if (object instanceof viewModel.InlineHierarchy) {
						checkAllElements = true;
						if (object.type === viewModel.HierarchyType.LEVELED) {
							if (object.levels && object.levels.count() > 0) {
								object.levels.foreach(function(level) {
									var result = that._processElements({
										element: level.element,
										elements: elements,
										viewNode: viewNode,
										proxyInformation: proxyInformation,
										canWriteText: false
									});
									if (result) {
										var columnName = level.element ? that.DOUBLE_QUOTE + level.element.name + that.DOUBLE_QUOTE : "";
										proxyInformation.push({
											elementName: level.element ? level.element.name : undefined,
											message: "the level column " + columnName + " in hierarchy definition is inconsistent"
										});
									}
									var orderResult = that._processElements({
										element: level.orderElement,
										elements: elements,
										viewNode: viewNode,
										proxyInformation: proxyInformation,
										canWriteText: false
									});
									if (orderResult) {
										var columnName = level.orderElement ? that.DOUBLE_QUOTE + level.orderElement.name + that.DOUBLE_QUOTE : "";
										proxyInformation.push({
											elementName: level.orderElement ? level.orderElement.name : undefined,
											message: "the order column " + columnName + " in hierarchy definition is inconsistent"
										});
									}
								});
							}
						} else if (object.type === viewModel.HierarchyType.PARENT_CHILD) {
							if (object.parentDefinitions && object.parentDefinitions.count() > 0) {
								object.parentDefinitions.foreach(function(parentDefinition) {
									if (parentDefinition.parent) {
										var result = that._processElements({
											element: parentDefinition.parent,
											elements: elements,
											viewNode: viewNode,
											proxyInformation: proxyInformation,
											canWriteText: false
										});
										if (result) {
											proxyInformation.push({
												elementName: parentDefinition.parent.name,
												message: "the parent column " + that.DOUBLE_QUOTE + parentDefinition.parent.name + that.DOUBLE_QUOTE +
													" in hierarchy definition is inconsistent"
											});
										}
									}
									if (parentDefinition.element) {
										var result = that._processElements({
											element: parentDefinition.element,
											elements: elements,
											viewNode: viewNode,
											proxyInformation: proxyInformation,
											canWriteText: false
										});
										if (result) {
											var columnName = parentDefinition.element ? that.DOUBLE_QUOTE + parentDefinition.element.name + that.DOUBLE_QUOTE : "";
											proxyInformation.push({
												elementName: parentDefinition.element ? parentDefinition.element.name : undefined,
												message: "the child column " + columnName + " in hierarchy definition is inconsistent"
											});
										}
									}
									if (parentDefinition.rootNode && parentDefinition.rootNode.parameterName) {
										var results = that.isBasedOnElementProxy({
											object: columnView.parameters.get(parentDefinition.rootNode.parameterName),
											columnView: columnView,
											viewNode: viewNode,
											input: input
										});
										if (result) {
											proxyInformation.push({
												elementName: parentDefinition.rootNode.parameterName,
												message: "the rootNode parameter " + that.DOUBLE_QUOTE + parentDefinition.rootNode.parameterName + that.DOUBLE_QUOTE +
													" in hierarchy definition is inconsistent"
											});
										}
										// that._pushProxyResults(results, proxyInformation);
									}
								});
							}
							if (object.edgeAttributes && object.edgeAttributes.count() > 0) {
								object.edgeAttributes.foreach(function(edgeAttribute) {
									if (edgeAttribute.element) {
										var result = that._processElements({
											element: edgeAttribute.element,
											elements: elements,
											viewNode: viewNode,
											proxyInformation: proxyInformation,
											canWriteText: false
										});
										if (result) {
											proxyInformation.push({
												elementName: edgeAttribute.element.name,
												message: "the additional attribute " + that.DOUBLE_QUOTE + edgeAttribute.element.name + that.DOUBLE_QUOTE +
													" in hierarchy definition is inconsistent"
											});
										}
									}
								});
							}

							if (object.siblingOrders && object.siblingOrders.count() > 0) {
								object.siblingOrders.foreach(function(siblingOrder) {
									if (siblingOrder.byElement) {
										var result = that._processElements({
											element: siblingOrder.byElement,
											elements: elements,
											viewNode: viewNode,
											proxyInformation: proxyInformation,
											canWriteText: false
										});
										if (result) {
											proxyInformation.push({
												elementName: siblingOrder.byElement.name,
												message: "the order column " + that.DOUBLE_QUOTE + siblingOrder.byElement.name + that.DOUBLE_QUOTE +
													" in hierarchy definition is inconsistent"
											});
										}
									}
								});
							}
							if (object.timeDependent && object.timeProperties) {
								if (object.timeProperties.validFromElement) {
									var result = that._processElements({
										element: object.timeProperties.validFromElement,
										elements: elements,
										viewNode: viewNode,
										proxyInformation: proxyInformation,
										canWriteText: false
									});
									if (result) {
										proxyInformation.push({
											elementName: object.timeProperties.validFromElement.name,
											message: "the valid from column " + that.DOUBLE_QUOTE + object.timeProperties.validFromElement.name + that.DOUBLE_QUOTE +
												" in hierarchy definition is inconsistent"
										});
									}
								}
								if (object.timeProperties.validToElement) {
									var result = that._processElements({
										element: object.timeProperties.validToElement,
										elements: elements,
										viewNode: viewNode,
										proxyInformation: proxyInformation,
										canWriteText: false
									});
									if (result) {
										proxyInformation.push({
											elementName: object.timeProperties.validToElement.name,
											message: "the valid to column " + that.DOUBLE_QUOTE + object.timeProperties.validToElement.name + that.DOUBLE_QUOTE +
												" in hierarchy definition is inconsistent"
										});
									}
								}
								if (object.timeProperties.fromParameter) {
									var results = that.isBasedOnElementProxy({
										object: object.timeProperties.fromParameter,
										columnView: columnView,
										viewNode: viewNode,
										input: input
									});
									if (results) {
										proxyInformation.push({
											elementName: object.timeProperties.fromParameter.name,
											message: "the from parameter " + that.DOUBLE_QUOTE + object.timeProperties.fromParameter.name + that.DOUBLE_QUOTE +
												" in hierarchy definition is inconsistent"
										});
									}
									// this._pushProxyResults(results, proxyInformation);
								}
								if (object.timeProperties.toParameter) {
									var results = that.isBasedOnElementProxy({
										object: object.timeProperties.toParameter,
										columnView: columnView,
										viewNode: viewNode,
										input: input
									});
									if (results) {
										proxyInformation.push({
											elementName: object.timeProperties.toParameter.name,
											message: "the from parameter " + that.DOUBLE_QUOTE + object.timeProperties.toParameter.name + that.DOUBLE_QUOTE +
												" in hierarchy definition is inconsistent"
										});
									}
									// this._pushResults(results, elementProxies);
									// this._pushProxyResults(results, proxyInformation);
								}
								if (object.timeProperties.pointInTimeParameter) {
									var results = that.isBasedOnElementProxy({
										object: object.timeProperties.pointInTimeParameter,
										columnView: columnView,
										viewNode: viewNode,
										input: input
									});
									if (results) {
										proxyInformation.push({
											elementName: object.timeProperties.pointInTimeParameter.name,
											message: "the key parameter " + that.DOUBLE_QUOTE + object.timeProperties.pointInTimeParameter.name + that.DOUBLE_QUOTE +
												" in hierarchy definition is inconsistent"
										});
									}
									// this._pushResults(results, elementProxies);
									//  this._pushProxyResults(results, proxyInformation);
								}
							}
						}
					} else if (object instanceof viewModel.Parameter) {
						var parameter = object;
						checkAllElements = true;
						if (object.isVariable) {
							/*  if (object.typeOfElement) {
                            that._processElements(object.typeOfElement, elements);
                        }*/
							object.assignedElements.foreach(function(element) {
								var result = that._processElements({
									element: element,
									elements: elements,
									viewNode: viewNode,
									proxyInformation: proxyInformation,
									canWriteText: false
								});
								if (result) {
									var columnName = element ? that.DOUBLE_QUOTE + element.name + that.DOUBLE_QUOTE : "";
									proxyInformation.push({
										elementName: element ? element.name : undefined,
										message: "the filter attribute " + columnName + " in variable definition is inconsistent"
									});
								}
							});
						}
						// else {
						var isMappedParameter = false;

						columnView.viewNodes.foreach(function(node) {
							node.inputs.foreach(function(input1) {
								input1.parameterMappings.foreach(function(mapping) {
									if (mapping.parameter === object) {
										isMappedParameter = true;
									}

								});
							});
						});

						if (parameter.externalTypeOfElement && !isMappedParameter) {
							var result = that._processElements({
								element: parameter.externalTypeOfElement,
								elements: elements,
								viewNode: viewNode,
								proxyInformation: proxyInformation,
								canWriteText: false
							});
							if (result) {
								var columnName = parameter.externalTypeOfElement ? that.DOUBLE_QUOTE + parameter.externalTypeOfElement.name + that.DOUBLE_QUOTE :
									"";
								proxyInformation.push({
									elementName: parameter.externalTypeOfElement ? parameter.externalTypeOfElement.name : undefined,
									message: "the reference column " + columnName + " in variable/parameter definition is a proxy column or an inconsistent column"
								});
							}

						}
						if (parameter.typeOfElement) {
							var result = that._processElements({
								element: parameter.typeOfElement,
								elements: elements,
								viewNode: viewNode,
								proxyInformation: proxyInformation,
								canWriteText: false
							});
							if (result) {
								var columnName = parameter.typeOfElement ? that.DOUBLE_QUOTE + parameter.typeOfElement.name + that.DOUBLE_QUOTE : "";
								proxyInformation.push({
									elementName: parameter.externalTypeOfElement ? parameter.externalTypeOfElement.name : undefined,
									message: "the reference column " + columnName + " in variable/parameter definition  is inconsistent "
								});
							}

						}
						// }
					} else if (object instanceof viewModel.Element) {
						if (input && input.getSource().type instanceof viewModel.Entity) {
							return undefined;
						}
						if (viewNode === undefined && input) { // call from mapping editor source table
							viewNode = input.getSource();
						}
						/*if (element.eContainer() != null && element.eContainer().eContainer() instanceof ColumnView) {
				ColumnView columnView = (ColumnView) element.eContainer().eContainer();
				if ((!view.equals(columnView))
						&& (Util.isAttributeView(columnView) || Util.isAnalyticView(columnView) || Util.isCalcView(columnView))) {
					return null;
				}
			}*/
						/* else if (object.calculationDefinition) {
                        checkAllElements = true;
                      this._processElements(object, elements, viewNode);
                    } else {
                        elements.push(object);
                   } */
						var results = that._processElements({
							element: object,
							elements: elements,
							viewNode: viewNode,
							proxyInformation: proxyInformation,
							canWriteText: canWriteText
						});
						this._pushProxyResults(results, proxyInformation);

					}
					/* for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (element) {
                        if (element.isProxy) {
                            elementProxies.push(element);
                            if (!checkAllElements) {
                                return elementProxies;
                            }
                        }
                        this._getSourceElement(element, viewNode, input);
                        if (this.sourceElement && this.sourceElement.isProxy) {
                            elementProxies.push(element);
                            if (!checkAllElements) {
                                return elementProxies;
                            }
                        }
                    }

                }
                if (elementProxies.length > 0) {
                    return elementProxies;
                } */
					if (proxyInformation.length > 0) {
						return proxyInformation;
					}
				}
				return undefined;
			},
			isProxyElement: function(element, viewNode, input) {
				if (element) {
					if (element.isProxy) {
						return true;
					}
					this._getSourceElement(element, viewNode, input);
					if (this.sourceElement && this.sourceElement.isProxy) {
						return true;
					}
				}
				return false;
			},
			getIconPath: function(parameters) {
				var icon = parameters.icon;
				if (this.isBasedOnElementProxy(parameters)) {
					icon = "proxy/" + icon;
				}
				return icon;
			},

			_getSourceElement: function(element, viewNode, sourceInput) {
				var that = this;
				this.sourceElement = undefined;
				if (viewNode === undefined && sourceInput && sourceInput.getSource() && sourceInput.getSource().$$className === "ViewNode") {
					viewNode = sourceInput.getSource();
				}
				if (element && viewNode && viewNode.inputs) {
					viewNode.inputs.foreach(function(input) {
						if (input.getSource()) {
							input.mappings.foreach(function(mapping) {
								if (mapping.type === "ElementMapping" && mapping.targetElement === element) {
									if (input.getSource().$$className === "Entity") {
										that.sourceElement = mapping.sourceElement;
										return;
									} else if (input.getSource().$$className === "ViewNode") {
										that._getSourceElement(mapping.sourceElement, input.getSource());
									}
								}
							});
						}
					});
				}

			},
			_pushResults: function(results, elementProxies) {
				if (results && elementProxies && results.length > 0) {
					results.forEach(function(result) {
						elementProxies.push(result);
					});
				}

			},
			_pushProxyResults: function(results, proxyInformation) {
				if (results && proxyInformation && results.length > 0) {
					results.forEach(function(result) {
						proxyInformation.push(result);
					});
				}
			},
			consolidateResults: function(results, attributes) {
				if (results && results.length > 0) {
					var errorMessage = "This column is inconsistent because: ";
					if (attributes && attributes.elementType) {
						errorMessage = "This " + attributes.elementType + "is inconsistent because: ";
					}
					if (results.length === 1) {
						var singleResult = results[0];
						if (singleResult.sameElement && singleResult.message) {
							errorMessage = "";
							singleResult.message = singleResult.message[0].toUpperCase() + singleResult.message.slice(1);
						}
					}

					results.forEach(function(result) {
						if (result.message) {
							errorMessage = (errorMessage ? (errorMessage + "\n") : "") + "   " + result.message;
						}
					});
					return errorMessage;
				}
				return undefined;
			},

			getSearchObjectTypes: function(viewNode) {
				if (viewNode && viewNode.isDefaultNode() && viewNode.type === "JoinNode") {
					return ["CALCULATIONVIEW"];
				}
				if(viewNode && viewNode.type === "Graph"){
				    return ["GRAPH_WORKSPACE"];
				}
				return ["CALCULATIONVIEW", "TABLE", "VIEW", "ANALYTICVIEW", "ATTRIBUTEVIEW", "hdbtablefunction", "CALCULATIONVIEW_HISTORY",
					"DATA_BASE_TABLE"];
			},

			getJoin: function(viewNode, leftInput, rightInput) {
				var oJoin;
				if (viewNode && viewNode.joins && leftInput && rightInput) {
					viewNode.joins.foreach(function(join) {
						if (join.leftInput === leftInput && join.rightInput === rightInput) {
							oJoin = join;
						}
					});
				}
				return oJoin;
			},
			getParentNodeName: function(viewNode) {
				var parent;
				var columnView = viewNode.$$model.columnView;
				columnView.viewNodes.foreach(function(node) {
					node.inputs.foreach(function(input) {
						if (input.getSource() === viewNode) {
							parent = node;
						}
					});
				});
				return parent;
			},
			getParentNodeNameList: function(viewNode) {
				var parentNames = [];
				var columnView = viewNode.$$model.columnView;
				columnView.viewNodes.foreach(function(node) {
					node.inputs.foreach(function(input) {
						if (input.getSource() === viewNode) {
							parentNames.push(node.name);
						}
					});
				});
				return parentNames;
			},
			getListOfChildNodes: function(viewNode) {
				var listOfChild = [];
				var that = this;
				viewNode.inputs.foreach(function(input) {

					if (input.getSource() instanceof viewModel.ViewNode) {
						listOfChild.push(input);
						var nextChild = that.getListOfChildNodes(input.getSource());
						if (nextChild) {
							for (var index = 0; index < nextChild.length; index++) {
								listOfChild.push(nextChild[index]);
							}
						}
					}
				});
				that._removeDuplicateObject(listOfChild, "name")
				if (listOfChild.length > 0) {
					return listOfChild;
				} else {
					return null;
				}

			},
			_removeDuplicateObject: function(list, property) {
				for (var i = 0; i < list.length; i++) {
					for (var j = i + 1; j < list.length; j++) {
						if (list[i].getSource()[property] === list[j].getSource()[property]) {
							list.splice(j, 1);
						}
					}
				}
				return list;
			},

			getOrCreateContextMenu: function() {
				var that = this;
				var contextMenu = document.getElementById("calcViewEditorContextMenu");

				if (!contextMenu) {
					contextMenu = document.createElement("div");
					contextMenu.setAttribute("class", "calcViewContextMenu");
					contextMenu.setAttribute("id", "calcViewEditorContextMenu");
					var body = document.getElementsByTagName("body")[0];
					body.appendChild(contextMenu);
					body.addEventListener("click", function() {
						that.hideContextMenu();
					});
					if ($.browser.msie) { // IE 
						/*document.addEventListener("click", function() {
							that.hideContextMenu();
						});*/
						window.addEventListener("click", function() {
							that.hideContextMenu();
						});
					}
				}
				// clear context menu items
				while (contextMenu.firstChild) {
					contextMenu.removeChild(contextMenu.firstChild);
				}
				return contextMenu;
			},

			openContextMenu: function(oEvent) {
				var contextMenu = document.getElementById("calcViewEditorContextMenu");
				if (contextMenu) {

					var availableSpaceY = Math.abs(window.screen.availHeight - oEvent.clientViewY);

					if (availableSpaceY > 200) {
						contextMenu.style.top = oEvent.clientViewY + "px";
						contextMenu.style.left = oEvent.clientViewX + 10 + "px";
					} else {
						contextMenu.style.top = oEvent.cilentViewY - (contextMenu.childElementCount * 20) + "px";
						contextMenu.style.left = oEvent.clientViewX + 10 + "px";
					}

					if (contextMenu.firstChild) {
						contextMenu.hidden = false;
					} else {
						this.hideContextMenu();
					}
					if ($.browser.msie) { // IE
						// hide context menu on mouse left click
						if (oEvent.gesture) {
							this.hideContextMenu();
						}
					}
				}
			},
			openEditorContextMenu: function(oEvent) {
				var contextMenu = document.getElementById("calcViewEditorContextMenu");
				if (contextMenu) {

					var availableSpaceY = Math.abs(window.screen.availHeight - oEvent.clientY);
					if (availableSpaceY > 200) {
						contextMenu.style.top = oEvent.clientY + "px";
						contextMenu.style.left = oEvent.clientX + 10 + "px";
					} else {
						contextMenu.style.top = oEvent.cilentY - (1 * 20) + "px";
						contextMenu.style.left = oEvent.clientX + 10 + "px";
					}

					if (contextMenu.firstChild) {
						contextMenu.hidden = false;
					} else {
						this.hideContextMenu();
					}
					if ($.browser.msie) { // IE
						// hide context menu on mouse left click
						if (oEvent.gesture) {
							this.hideContextMenu();
						}
					}

				}
			},

			createContextMenuItem: function(parent, object) {
				var that = this;

				var menuIten = document.createElement("div");
				menuIten.setAttribute("class", "calcViewContextMenuItem");
				var label = document.createElement("label");
				var textnode = document.createTextNode(object.name); // Create a text node
				label.appendChild(textnode)
				menuIten.appendChild(label);
				parent.appendChild(menuIten);

				if (object.action) {
					menuIten.addEventListener("click", function() {
						that.hideContextMenu();
						object.action(object.actionContext);
					});
				}

				return menuIten;
			},

			hideContextMenu: function() {
				var contextMenu = document.getElementById("calcViewEditorContextMenu");
				if (contextMenu) {
					contextMenu.hidden = true;
					if ($.browser.msie) { // IE
						// remove context menu
						var body = document.getElementsByTagName("body")[0];
						body.removeChild(contextMenu);

					}
				}
			},

			_checkUnsupportedEntities: function(model, viewNode, inputs) {
				var that = this;
				var i = 0;

				if (model.severityType === "Error") {
					var unsupportedInputs = [];
					if (model.referenceEntiities) {
						for (i = 0; i < inputs.length; i++) {
							model.referenceEntiities.foreach(function(entity) {
								if (entity === inputs[i].getSource()) {
									unsupportedInputs.push(inputs[i].$$defaultKeyValue);
								}
							});
						}
					}

					if (unsupportedInputs.length > 0) {
						var oDialog = new sap.ui.commons.Dialog({
							title: that.resourceLoader.getText("tit_unsupported_feature"),
							modal: true, // keep UI in sync. with message box for unsupported feature 
							width: "500px",
							closed: function() {
								// Remove input
								var removeCommands = [];
								for (i = 0; i < unsupportedInputs.length; i++) {
									removeCommands.push(new modelbase.DeleteCommand('columnView.viewNodes["' + viewNode.name + '"].inputs["' + unsupportedInputs[i] +
										'"]'));
								}
								model.$getUndoManager().execute(new modelbase.CompoundCommand(removeCommands));
							}
						});

						oDialog.addButton(new sap.ui.commons.Button({
							text: "OK",
							press: function() {
								oDialog.close();
							}
						}));

						var oText = new sap.ui.commons.TextView({
							text: model.message + "\n Input will be removed from the model"
						});

						var oImage1 = new sap.ui.commons.Image({
							src: that.resourceLoader.getImagePath("info.png")
						}).addStyleClass("dialogImg");
						var mLayout = new sap.ui.commons.layout.MatrixLayout({
							layoutFixed: false,
							columns: 2
						});

						mLayout.createRow(oImage1, oText);

						var oLayout = new sap.ui.layout.VerticalLayout();
						oLayout.addContent(mLayout);

						var referenceInfo;
						if (model.referenceEntiities) {
							model.referenceEntiities.foreach(function(entity) {
								if (referenceInfo) {
									referenceInfo = referenceInfo + "\n" + entity.fqName;
								} else {
									referenceInfo = entity.fqName;
								}
							});
						}

						var oInput = new sap.ui.commons.TextArea({
							width: "450px",
							rows: 7,
							editable: false
							//enabled: false
						}).addStyleClass("textAreaBorder");

						oInput.setValue(referenceInfo);
						oLayout.addContent(oInput);
						oDialog.addContent(oLayout);
						oDialog.open();
					}
				}
			},

			fillRepositoryInputNodeId: function(model, targetNodeName, inputKey) {

				//set the flag as true
				model.columnView.readPruningInformation = true;
				var source = model.columnView.viewNodes.get(targetNodeName).inputs.get(inputKey).getSource();
				if (source.$$className === "Entity") {
					//call transformtion
					if (source.type === "TABLE") {
						source.type = viewModel.EntityType.DATABASE_TABLE;
					}
					var xmlDocument = RepositoryXmlRenderer.renderScenario(model);
					var xmlStr = XmlSerializer.serializeToString(xmlDocument);
					var myModel = new viewModel.ViewModel();
					RepositoryXmlParser.parseScenario(xmlStr, myModel);
					var targetNodeLocal = myModel.columnView.viewNodes.get(targetNodeName);
					var inputLocal = targetNodeLocal.inputs.get(inputKey);
					//add extra properties inputLocal.repoId to input.repoId.
					model.columnView.viewNodes.get(targetNodeName).inputs.get(inputKey).repositoryInputNodeId = inputLocal.repositoryInputNodeId;
				}

			},			
			setCurEditor:function(editor){
			    curEditor = editor;
			},
			getCurEditor:function(){
			    return curEditor;
			}

		};

	});