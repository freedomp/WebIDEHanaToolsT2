/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "../../../../common/expressioneditor/calcengineexpressioneditor/CalcEngineExpressionEditor"
    ],
	function(ResourceLoader, commands, CalcViewEditorUtil, CalcEngineExpressionEditor) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		/**
		 * @class
		 */
		var ExpressionDetails = function(parameters) {
			this._undoManager = parameters.undoManager;
			this._viewNode = parameters.viewNode;
			this._columnView = parameters.columnView;
			this.callBack = parameters.callBack;
			this.updateExpression = parameters.updateExpression;
			this.element = parameters.element;
			this._expressionEditor = null;
			this.elementModel = new sap.ui.model.json.JSONModel();
			this.operatorModel = new sap.ui.model.json.JSONModel();
		};

		ExpressionDetails.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);
			},

			close: function() {
				if (this.elementModel) {
					this.elementModel.destroy();
				}
				if (this.operatorModel) {
					this.operatorModel.destroy();
				}
			},

			getContent: function() {
				var that = this;

				var oLayout = new sap.ui.commons.layout.VerticalLayout({
					height: "100%"
				});

				var headerLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%",
					height: "100%",
					widths: ["40%", "60%"]
				});

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

				var headerLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_expression_editor") + " (" + this.element.name + ")",
					design: sap.ui.commons.LabelDesign.Bold
				});

				headerLayout.createRow(backButton, headerLabel);
				headerLayout.addStyleClass("expressionEditorHeader");

				oLayout.addContent(headerLayout);

				var model = this.createElementModel();
				var operatordata = this.createOperatorData();

				this.elementModel.setData(model);

				this.operatorModel.setData(operatordata);

				this._expressionEditor = CalcEngineExpressionEditor.createExpressionEditor(true, true, true);
				this._expressionEditor.setHideValidateButton(true);
				if (this.element.calculationDefinition && this.element.calculationDefinition.expressionLanguage) {
					if (this.element.calculationDefinition.expressionLanguage === "COLUMN_ENGINE") {
						this._expressionEditor.setLanguage("TREX");
					} else {
						if (!this.element.calculationDefinition.expressionLanguage) {
							this._expressionEditor.setLanguage("TREX");
						} else {
							this._expressionEditor.setLanguage(this.element.calculationDefinition.expressionLanguage);
						}
					}
				}
				this._expressionEditor.setLanguageSelectionEnabled(true);
				this._expressionEditor.attachEvent("languageChange", function(event) {
					var language = event.getSource().getLanguage();
					if (language === "TREX") {
						language = "COLUMN_ENGINE";
					}
					that.updateExpression({
						language: language
					});
				});

				this._expressionEditor.setElementModel(this.elementModel);
				this._expressionEditor.setOperatorModel(this.operatorModel);

				this._expressionEditor.attachEvent("change", function(event) {
					var filterExpression = that._expressionEditor.getExpression();
					var editor = that._expressionEditor._editorTextArea;
					that._expressionEditor._editorTextArea = null;
					that.updateExpression({
						expression: filterExpression
					});
					// that.setExpression(that.element); 
					that._expressionEditor._editorTextArea = editor;
				});

				this.setExpression(this.element);

				oLayout.addContent(this._expressionEditor);
				//oLayout.addStyleClass("detailsExpressionEditor");
				oLayout.addStyleClass("detailsMainDiv");
				return oLayout;
			},

			setExpression: function(element) {
				if (this._expressionEditor) {
					this._expressionEditor.setExpression("");
				}
				if (element && element !== this.element) {
					this.element = element;
				}
				if (this._expressionEditor && this.element) {
					var formula = this.element.calculationDefinition.formula;
					if (formula) {
						this._expressionEditor.setExpression(formula);
					} else {
						this._expressionEditor.setExpression("");
					}
				}
			},

			createElementModel: function() {
				var that = this;
				var model = {
					"elements": {
						"label": "Elements",
						"data": [{
							"id": resourceLoader.getText("tit_columns"),
							"label": resourceLoader.getText("tit_columns"),
							"children": []
                        }, {
							"id": resourceLoader.getText("tit_calculated_columns"),
							"label": resourceLoader.getText("tit_calculated_columns"),
							"children": []
                        }, {
							"id": resourceLoader.getText("tit_restricted_columns"),
							"label": resourceLoader.getText("tit_restricted_columns"),
							"children": []
                        }, {
							"id": resourceLoader.getText("tit_parameters"),
							"label": resourceLoader.getText("tit_parameters"),
							"children": []
                        }]
					}
				};
				if (this._viewNode) {
					this._viewNode.elements.foreach(function(element) {
						var isProxy = CalcViewEditorUtil.isBasedOnElementProxy({
							object: element,
							viewNode: that._viewNode
						});
						if (!isProxy) {
							var elementModel = {
								"id": element.name,
								"label": element.name,
								"nodetype": "element",
								"datatype": element.inlineType ? element.inlineType.primitiveType : undefined,
								"elementType": "Column"
								//"separator": "\""
							};
							if (element.aggregationBehavior || element.measureType) {
								if (element.measureType === "restriction") {
									elementModel.iconpath = resourceLoader.getImagePath("RestrictedMeasure.png");
									model.elements.data[2].children.push(elementModel);
								} else if (element.calculationDefinition) {
									if (element !== that.element) {
										if (that._viewNode.isDefaultNode()) {
											elementModel.iconpath = resourceLoader.getImagePath(element.aggregationBehavior === "none" ? "Calculated_Attribute.png" :
												"CalculatedMeasure.png");
										} else {
											elementModel.iconpath = resourceLoader.getImagePath("CalculatedColumn.png");
										}
										model.elements.data[1].children.push(elementModel);
									}
								} else {
									if (that._viewNode.isDefaultNode()) {
										elementModel.iconpath = resourceLoader.getImagePath(element.aggregationBehavior === "none" ? "Attribute.png" : "Measure.png");
									} else {
										elementModel.iconpath = resourceLoader.getImagePath("Column.png");
									}
									model.elements.data[0].children.push(elementModel);
								}
							} else {
							    if(element.calculationDefinition){
							        if(element !== that.element){
							        elementModel.iconpath = resourceLoader.getImagePath("CalculatedColumn.png");
							    	model.elements.data[1].children.push(elementModel);
							        }
							    }else{
								elementModel.iconpath = resourceLoader.getImagePath("Column.png");
								model.elements.data[0].children.push(elementModel);
							    }
							}
						}
					});
				}
				if (this._columnView) {
					this._columnView.parameters.foreach(function(parameter) {
						if (!parameter.isVariable) {
							/*var separatorStart = "'$$";
                            var separatorEnd = "$$'";
                            if (CalcViewEditorUtil.isNumaric(parameter.inlineType.primitiveType)) {
                                separatorStart = "$$";
                                separatorEnd = "$$";
                            }*/
							var parameterModel = {
								"id": parameter.name,
								"label": parameter.name,
								"nodetype": "element",
								"elementType": "Parameter",
								"datatype": parameter.inlineType ? parameter.inlineType.primitiveType : undefined,
								//"separatorStart": separatorStart,
								//"separatorEnd": separatorEnd,
								"iconpath": resourceLoader.getImagePath("Parameter.png")
							};
							model.elements.data[3].children.push(parameterModel);
						}
					});
				}
				if (this._viewNode) {
					if (this._viewNode.isStarJoin()) {
						var calcViewModel = {
							"id": resourceLoader.getText("tit_calculation_views"),
							"label": resourceLoader.getText("tit_calculation_views"),
							"children": []
						};

						this._viewNode.inputs.foreach(function(input) {
							if (input.selectAll) {
								var inputModel = {
									"id": CalcViewEditorUtil.getInputName(input),
									"label": CalcViewEditorUtil.getInputName(input),
									"iconpath": CalcViewEditorUtil.getInputImagePath(input),
									"children": []
								};

								input.getSource().elements.foreach(function(element) {
									if (element.aggregationBehavior === "none") {
										var elementName = element.name;
										// check if alias exist
										input.mappings.foreach(function(mapping) {
											if (mapping.type === "ElementMapping" && element === mapping.sourceElement) {
												elementName = mapping.aliasName;
											}
										});
										var elementModel = {
											"id": elementName,
											"label": elementName,
											"nodetype": "element",
											"datatype": element.inlineType ? element.inlineType.primitiveType : undefined,
											"elementType": "Column",
											"iconpath": resourceLoader.getImagePath(element.calculationDefinition ? "CalculatedColumn.png" : "Attribute.png")
										};
										inputModel.children.push(elementModel);
									}
								});

								calcViewModel.children.push(inputModel);
							}

						});
						model.elements.data.unshift(calcViewModel);
					}
					if (!this._viewNode.isDefaultNode()) {
						model.elements.data.splice(2, 1);
					}
				}
				return model;
			},

			updateElementModel: function() {
				if (this._expressionEditor) {
					var model = this.createElementModel();
					this.elementModel.setData(model);
					//this._expressionEditor.setElementModel(elementModel);
				}
			},

			createOperatorData: function() {

				var model = {
					"operators": {
						"label": "operators",
						"data": [{
							"id": "plus",
							"label": "+",
							"nodetype": "operator"
                        }, {
							"id": "minus",
							"label": "-",
							"nodetype": "operator"
                        }, {
							"id": "multiply",
							"label": "*",
							"nodetype": "operator"
                        }, {
							"id": "starstar",
							"label": "**",
							"nodetype": "operator"
                        }, {
							"id": "divide",
							"label": "/",
							"nodetype": "operator"
                        }, {
							"id": "modulus",
							"label": "%",
							"nodetype": "operator"
                        }, {
							"id": "braceopen",
							"label": "(",
							"nodetype": "operator"
                        }, {
							"id": "braceclose",
							"label": ")",
							"nodetype": "operator"
                        }, {
							"id": "equals",
							"label": "=",
							"nodetype": "operator"
                        }, {
							"id": "notequal",
							"label": "!=",
							"nodetype": "operator"
                        }, {
							"id": "greater",
							"label": ">",
							"nodetype": "operator"
                        }, {
							"id": "smaller",
							"label": "<",
							"nodetype": "operator"
                        }, {
							"id": "greaterorequal",
							"label": ">=",
							"nodetype": "operator"
                        }, {
							"id": "smallerorequal",
							"label": "<=",
							"nodetype": "operator"
                        }]
					}
				};

				return model;
			}

		};

		return ExpressionDetails;

	});
