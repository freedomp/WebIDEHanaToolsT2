/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../base/modelbase",
        "../viewmodel/commands",
        "../../../common/expressioneditor/calcengineexpressioneditor/CalcEngineExpressionEditor"
    ],
	function(ResourceLoader, modelbase, commands, CalcEngineExpressionEditor) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
		/**
		 * @class
		 */
		var FilterExpressionPane = function(parameters) {
			this._undoManager = parameters.undoManager;
			this._context = parameters.context;
			this.model = parameters.model;
			this._expressionEditor = null;
			this._viewNode = parameters.viewNode;
		};

		FilterExpressionPane.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);
			},
            subscribe:function(){
                this._viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.OuterModelChanged, this);
				this._viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.OuterModelChanged, this);
                this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CHANGED, this.OuterModelChanged, this);
                this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CREATED, this.OuterModelChanged, this);
                this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DELETED, this.OuterModelChanged, this);
				
            },
            unsubscribe:function(){
                this._viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.OuterModelChanged, this);
				this._viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.OuterModelChanged, this);
                this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_CHANGED, this.OuterModelChanged, this);
                this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_CREATED, this.OuterModelChanged, this);
                this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DELETED, this.OuterModelChanged, this);
            },
            OuterModelChanged:function(event){
                var model = FilterExpressionPane.createModel(this._viewNode);
                var elementModel1 = new sap.ui.model.json.JSONModel();
				elementModel1.setData(model);
				if(this._expressionEditor){
                this._expressionEditor.setElementModel(elementModel1);
				}
            },
			getContent: function(viewNode) {
				var that = this;
				
				that.unsubscribe();
				that.subscribe();
				
				var model = FilterExpressionPane.createModel(that._viewNode);
				var operatordata = FilterExpressionPane.createOperatorData();

				//if (!this._expressionEditor) {
				var elementModel1 = new sap.ui.model.json.JSONModel();
				elementModel1.setData(model);

				var operatorModel = new sap.ui.model.json.JSONModel();
				operatorModel.setData(operatordata);

				// var treemap = new sap.hana.ide.common.plugin.treemap.Treemap("testTreemap",{});
				this._expressionEditor = CalcEngineExpressionEditor.createExpressionEditor(false, true, false);
				//this._expressionEditor = new sap.hana.ide.common.plugin.expressioneditor.ExpressionEditor();
				//this._expressionEditor.setJSONModel("../common/plugin/expressioneditor/testModelForElements.json");

				this._expressionEditor.setElementModel(elementModel1);
				this._expressionEditor.setOperatorModel(operatorModel);
				this._expressionEditor.setHideValidateButton(true);
				 this._expressionEditor.setLanguageSelectionEnabled(true);
				var attributes = {};
				this._expressionEditor.attachEvent("change", function(event) {
					var existingExpression = that._viewNode.filterExpression ? that._viewNode.filterExpression.formula : undefined;
					var newExpression = that._expressionEditor.getExpression();
					if (existingExpression !== newExpression && ((existingExpression !== undefined || existingExpression !== "") || newExpression !== "")) {

						var filterExpression = {
							formula: that._expressionEditor.getExpression(),
							expressionLanguage: that._viewNode.filterExpression ? that._viewNode.filterExpression.expressionLanguage : "COLUMN_ENGINE"
						};

						attributes.filterExpression = filterExpression;
						var command = new commands.ChangeViewNodeCommand(that._viewNode.name, attributes);
						that._execute(command);
						var editor = that._expressionEditor._editorTextArea;
						that._expressionEditor._editorTextArea = null;
						that._expressionEditor.setExpression(filterExpression.formula);
						 var expressionLanguage = filterExpression.expressionLanguage;
                    if(filterExpression.expressionLanguage === "Column Engine"){
                        expressionLanguage = "TREX";
                    }
                    that._expressionEditor.setLanguage(expressionLanguage);
                    
						that._expressionEditor._editorTextArea = editor;
					}
				});
				this._expressionEditor.attachEvent("languageChange", function(event) {
                    var language = event.getSource().getLanguage();
                    if(language === "TREX"){
                      language = "COLUMN_ENGINE";
                    }
                    var filterExpression = {
                        expressionLanguage: language
                    };
                    attributes.filterExpression = filterExpression;
                     var command = new commands.ChangeViewNodeCommand(that._viewNode.name, attributes);
                    that._execute(command);
                }); 
				if (that._viewNode.filterExpression && this._expressionEditor) {
					var formula = that._viewNode.filterExpression.formula;
					if (formula) {
						this._expressionEditor.setExpression(formula);
					} else {
						this._expressionEditor.setExpression("");
					}
					/* var language = that._viewNode.filterExpression.expressionLanguage;
                    if(language === "COLUMN_ENGINE"){
                      language = "TREX";
                    }
                    if(language){
                          this._expressionEditor.setLanguage(language); 
                    } */
				} else {
					this._expressionEditor.setExpression("");
				}
				return this._expressionEditor;
			},
			setExpression: function(formula) {
				this._expressionEditor.setExpression(formula);
			}

		};

		FilterExpressionPane.createModel = function(viewNode) {
			var model = {
				"elements": {
					"label": "Elements",
					"data": [{
						"id": "Columns",
						"label": "Columns",
						"children": []
                    }, {
						"id": "Calculated Columns",
						"label": "Calculated Columns",
						"children": []
                    }, {
						"id": "Input Parameters",
						"label": "Input Parameters",
						"children": []
                    }]
				}
			};
			if (viewNode) {
				viewNode.elements.foreach(function(element) {
					var elementModel;
					if (!element.calculationDefinition) {
						elementModel = {
							"id": element.name,
							"label": element.name,
							"nodetype": "element",
							//"datatype": "VARCHAR",
							//"separator": "\"",
							"datatype": element.inlineType ? element.inlineType.primitiveType : undefined,
							"elementType": "Column",
							"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Column.png"
						};
						model.elements.data[0].children.push(elementModel);
					} else {
						elementModel = {
							"id": element.name,
							"label": element.name,
							"nodetype": "element",
							//"datatype": "VARCHAR",
							//"separator": "\"",
							"datatype": element.inlineType ? element.inlineType.primitiveType : undefined,
							"elementType": "Column",
							"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/CalculatedColumn.png"
						};
						model.elements.data[1].children.push(elementModel);
					}
				});
			}
			var columnView = viewNode.$getContainer();
			if (columnView) {
				columnView.parameters.foreach(function(parameter) {
					if (!parameter.isVariable) {
						var parameterModel = {
							"id": parameter.name,
							"label": parameter.name,
							"nodetype": "element",
							//"datatype": "INT",
							//"separator": "$$",
							"elementType": "Parameter",
							"datatype": parameter.inlineType ? parameter.inlineType.primitiveType : undefined,
							"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Parameter.png"
						};
						model.elements.data[2].children.push(parameterModel);
					}
				});
			}
			return model;
		};

		FilterExpressionPane.createOperatorData = function() {

			var model = {
				"operators": {
					"label": "operators",
					"data": [{
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
                    }, {
						"id": "isNull",
						"label": "isNull",
						"nodetype": "operator"
                    }, {
						"id": "not",
						"label": "not",
						"nodetype": "operator"
                    }, {
						"id": "and",
						"label": "and",
						"nodetype": "operator"
                    }, {
						"id": "or",
						"label": "or",
						"nodetype": "operator"
                    }, {
						"id": "in",
						"label": "in",
						"nodetype": "operator"
                    }, {
						"id": "match",
						"label": "match",
						"nodetype": "operator"
                    }]
				}
			};

			return model;
		};
		return FilterExpressionPane;

	});
