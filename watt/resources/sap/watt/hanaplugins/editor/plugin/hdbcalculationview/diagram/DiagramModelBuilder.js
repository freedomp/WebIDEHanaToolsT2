/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "../util/ResourceLoader",
    "../viewmodel/model",
    "../view/CalcViewEditorUtil",
       "../sharedmodel/sharedmodel",
    "./model",
    "./ui",
    "./galilei"
     
], function(ResourceLoader, viewmodel, CalcViewEditorUtil,SharedModel) {
	"use strict";

	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
	var TRANSPARENT_IMG =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

	var DiagramModelBuilder = function(viewModel, context, removeButton) {
		this.resource = new sap.galilei.model.Resource();
		this._model = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ColumnView(this.resource);
		this._model.viewModel = viewModel;
		this._diagram = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.Diagram(this.resource);
		this._diagram.model = this._model;
		this._context = context;
		this.removeButton = removeButton;
		this._initialBuild();
	};

	DiagramModelBuilder.prototype = {

		MODEL_PACKAGE: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram",
		DIAGRAM_PACKAGE: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui",

		getDiagram: function() {
			return this._diagram;
		},

		createObject: function(packageName, className, param) {
			var cls = sap.galilei.model.getClass(packageName + "." + className);
			this.resource.applyUndoableAction(function() { // to improve performance - using undoable action
				if (cls) {
					cls = cls.create(this.resource, param);
				}
			}, "createObject", true);
			if (cls) {
				return cls;
			}
		},

		createViewNode: function(object) {
			var displayName = object.name;
			if (object.isDataSource) {
				object.inputs.foreach(function(input) {
					displayName = input.getSource().getFullyQualifiedName();
				});
			}
			var viewNode = this.createObject(this.MODEL_PACKAGE, object.type, {
				name: object.name,
				displayName: displayName
			});
			return viewNode;
		},

		createViewNodeSymbol: function(param) {
			var viewNode = param.object;
			param.viewNodeName = viewNode.name;
			var viewNodeSymbol = this.createObject(this.DIAGRAM_PACKAGE, viewNode.classDefinition.name + "Symbol", param);
			this._diagram.symbols.push(viewNodeSymbol);
			return viewNodeSymbol;
		},

		createSemanticsSymbol: function(param) {
			if (!param) param = {};
			this._model.semantics = this.createObject(this.MODEL_PACKAGE, "Semantics", {
				name: "Semantics"
			});
			param.object = this._model.semantics;
			param.x = 100;
			param.y = 30;
			param.isKeepSize = true;
			param.isKeepPosition = true;
			this.semanticsSymbol = this.createObject(this.DIAGRAM_PACKAGE, "SemanticsSymbol", param);
			this._diagram.symbols.push(this.semanticsSymbol);
			return this.semanticsSymbol;
		},

		_initialBuild: function() {
			var columnView = this._model.viewModel.columnView;
			var that = this;
			columnView.viewNodes.foreach(function(viewNode) {
				if (viewNode.type === "Projection" && viewNode.isDataSource) {
					that.buildViewNode(viewNode);
				} else {
					that.buildViewNode(viewNode);
				}
			});

			columnView.viewNodes.foreach(function(targetNode) {
				var targetSymbol = that._diagram.symbols.selectObject({
					"viewNodeName": targetNode.name
				});
				targetNode.inputs.foreach(function(input) {
					that.buildInput(targetSymbol, targetNode, input);
				});
			});
			this.createSemanticsSymbol();
			this.buildSemnticsInput(this.semanticsSymbol, this._model.semantics, columnView.getDefaultNode());
		},

		buildSemnticsInput: function(targetSymbol, targetNode, sourceNode) {
			if (sourceNode instanceof viewmodel.ViewNode) {
				var sourceSymbol = this._diagram.symbols.selectObject({
					"viewNodeName": sourceNode.name
				});
				if (sourceSymbol) {
					var inputObj = this.createObject(this.MODEL_PACKAGE, "Input", {
						name: "semanticsLink",
						target: targetSymbol.object,
						source: sourceSymbol.object
					});
					var linkSymbol = this.createObject(this.DIAGRAM_PACKAGE, "SemanticsLinkSymbol", {
						object: inputObj,
						sourceSymbol: sourceSymbol,
						targetSymbol: targetSymbol
					});
					this._diagram.symbols.push(linkSymbol);
					return linkSymbol;
				}
			}
		},

		buildInput: function(targetSymbol, targetNode, input) {
			var sourceNode;
			if(targetNode.type === "Graph"){
				sourceNode = input;
			}
			else
			{
				 sourceNode = input.getSource();
			}
			if (sourceNode instanceof viewmodel.ViewNode) {
				var sourceSymbol = this._diagram.symbols.selectObject({
					"viewNodeName": sourceNode.name
				});
				if (sourceSymbol) {
					var inputObj = this.createObject(this.MODEL_PACKAGE, "Input", {
						name: input.$getKeyAttributeValue(),
						target: targetSymbol.object,
						source: sourceSymbol.object
					});
					var linkSymbol = this.createObject(this.DIAGRAM_PACKAGE, "InputSymbol", {
						object: inputObj,
						sourceSymbol: sourceSymbol,
						targetSymbol: targetSymbol
					});
					this._diagram.symbols.push(linkSymbol);
					return linkSymbol;
				}
			}
		},

		buildViewNode: function(viewNode) {
			var that = this;
			var view = this.createViewNode(viewNode);
			if (viewNode.isDefaultNode() && viewNode.type === "JoinNode") {
				view.isStarJoin = true;
			}
			if (viewNode.type === "Projection" || "Aggregation") {
				if (viewNode.filterExpression) {
					view.filterExpression = resourceLoader.getImagePath("Filter.png");
					view.filterExpressionvalue = viewNode.filterExpression.formula;
				} else {
					view.filterExpression = TRANSPARENT_IMG;
				}
				if (viewNode.type === "Projection" && viewNode.isDataSource) {
					view.containsProxy = "pdDataSource";
					view.disableExpanded = true;
					view.isExpanded = false;
					//	viewNode.dataSource="true";//for testing all projection node now showing as PD data source
				}
			}
			if (viewNode.type === "JoinNode" && viewNode.isStarJoin() === false) {
				if (viewNode.joins._values[0]) {
					if (viewNode.joins._values[0].cardinality === "C1_1") {
						view.joinCardinality = resourceLoader.getImagePath("one2one.gif");
					} else if (viewNode.joins._values[0].cardinality === "C1_N") {
						view.joinCardinality = resourceLoader.getImagePath("one2n.gif");
					} else if (viewNode.joins._values[0].cardinality === "CN_1") {
						view.joinCardinality = resourceLoader.getImagePath("n2one.gif");
					} else if (viewNode.joins._values[0].cardinality === "CN_N") {
						view.joinCardinality = resourceLoader.getImagePath("n2n.gif");
					} else {
						view.joinCardinality = TRANSPARENT_IMG;
					}
					if (viewNode.joins._values[0].joinType === "leftOuter") {
						view.joinType = resourceLoader.getImagePath("leftJoin_b.png");
					} else if (viewNode.joins._values[0].joinType === "rightOuter") {
						view.joinType = resourceLoader.getImagePath("rightJoin_b.png");
					} else if (viewNode.joins._values[0].joinType === "inner") {
						view.joinType = resourceLoader.getImagePath("innerJoin_b.png");
					} else if (viewNode.joins._values[0].joinType === "fullOuter") {
						view.joinType = resourceLoader.getImagePath("outerJoin_b.png");
					} else if (viewNode.joins._values[0].joinType === "textTable") {
						view.joinType = resourceLoader.getImagePath("text.gif");
					} else if (viewNode.joins._values[0].joinType === "referential") {
						view.joinType = resourceLoader.getImagePath("innerJoin_b.png");
					} else {
						view.joinType = TRANSPARENT_IMG;
					}
				} else {
					view.joinCardinality = TRANSPARENT_IMG;
					view.joinType = TRANSPARENT_IMG;
				}
			}
			if (viewNode.isDataSource) {
				view.isDatasource = viewNode.isDataSource;
			}
			if (viewNode.endUserTexts && viewNode.endUserTexts.comment.text.trim()) {
				view.comments = resourceLoader.getImagePath("Note.png");
				view.commentsvalue = viewNode.endUserTexts.comment.text;
			} else {
				view.comments = TRANSPARENT_IMG;
			}
			if (viewmodel.isPerformanceAnalysis && viewNode.type === "JoinNode" && !viewNode.isDefaultNode()) {
				if (viewNode.joins.size() === 1) {
					var joinDef = viewNode.joins.get(0);
					if (joinDef.isJoinValidated && joinDef.validationStatus === "Warning") {
						view.validationStatus = joinDef.validationStatusIcon;
						view.validationStatusString = joinDef.validationStatusMessage;
					}
				}
			}

			view.isDefaultNode = viewNode.isDefaultNode();

			//var height = viewNode.layout.height === 0 ? 45 : viewNode.layout.height;
			//var width = viewNode.layout.width === 0 ? 100 : viewNode.layout.width;
			var height = 40;
			if (this.isViewNodeExpanded(viewNode)) {
				height = 40 + viewNode.inputs._keys.length * 15;
			} else {
				view.isExpanded = false;
			}
			var width = 150;
			var x = 0,
				y = 0;

			if (viewNode.layout) {
				//var x = Number(viewNode.layout.xCoordinate) + width / 2;
				x = Number(viewNode.layout.xCoordinate) + 60;
				//var y = Number(viewNode.layout.yCoordinate) + height / 2;
				y = Number(viewNode.layout.yCoordinate) + 20;
			}

			var viewSymbol = this.createViewNodeSymbol({
				object: view,
				x: x,
				y: y,
				isKeepPosition: viewNode.isDefaultNode() ? true : false,
				width: width,
				height: height
			});
			//this.buildExpandCollapseNode(viewNode, viewSymbol);
			if (view.isExpanded) {
				viewNode.inputs.foreach(function(input) {
					that.buildTable(input, viewNode, viewSymbol);
				});
			}
			return viewSymbol;
		},

		buildTable: function(input, viewNode, viewNodeSymbol) {
			var isGraphNode = false,
				inputSize = 0;
			if (viewNode.isGraphNode()) {
				isGraphNode = true;
				inputSize = 1;
			}
			var table = this.createTable(input, isGraphNode);
			if (!isGraphNode) {
				if (input.getSource().deprecated) {
					table.deprecated = resourceLoader.getImagePath("Warning.png");
				} else {
					table.deprecated = TRANSPARENT_IMG;
				}

				if (viewNode.isUnion() && input.unionPruningElementFilters && input.unionPruningElementFilters._keys.length > 0) {

					var that = this;
					that.message = " ";
					input.unionPruningElementFilters.foreach(function(f) {
						that.message = "\"" + f.elementName + "\"  ";
						f.valueFilters.foreach(function(v) {
							switch (v.operator) {
								case SharedModel.ValueFilterOperator.EQUAL:
									that.message = that.message + " = " + v.value;
									break;
								case SharedModel.ValueFilterOperator.LESS_THAN:
									that.message = that.message + "<" + v.value;
									break;
								case SharedModel.ValueFilterOperator.LESS_EQUAL:
									that.message = that.message + " <= " + v.value;
									break;
								case SharedModel.ValueFilterOperator.GREATER_THAN:
									that.message = that.message + " > " + v.value;
									break;
								case SharedModel.ValueFilterOperator.GREATER_EQUAL:
									that.message = that.message + " >= " + v.value;
									break;
								case SharedModel.ValueFilterOperator.BETWEEN:
									that.message = that.message + " BETWEEN [" + v.lowValue + " ," + v.highValue + " ]";
									break;
							}

						});

						that.message = that.message + " , "

					})
					table.pruningMessage = that.message;
					table.pruningTable = resourceLoader.getImagePath("info.png");
				} else {
					table.pruningTable = TRANSPARENT_IMG;
				}

				if (input.getSource().$$className === "ViewNode") {
					table.isDataSource = false;
				} else {
					table.isDataSource = true;
					if (viewNode.$$model.isPerformanceAnalysis) {
						var recordCount = 0;
						var THRESHOLD_VALUE = 5000;
						if (viewNode.$$model.preferenceStore && viewNode.$$model.preferenceStore.performanceAnalysisThresholdValue) {
							THRESHOLD_VALUE = parseInt(viewNode.$$model.preferenceStore.performanceAnalysisThresholdValue, 10) || 5000;
						}
						var pds = input.getSource().partitionDetails;
						for (var i = 0; i < pds.size(); i++) {
							var pd = pds.getAt(i);
							recordCount += parseInt(pd.recordCount, 10);
						}
						if (recordCount > THRESHOLD_VALUE) {
							table.thresholdStatus = resourceLoader.getImagePath("Warning.png");
							table.thresholdStatusString = resourceLoader.getText("txt_count_exceeded_threshold");
						}
					}
					if (viewNode.isStarJoin()) {
						if (input.getSource().dataCategory === "CUBE") {
							table.displayName = resourceLoader.getImagePath("CalculationViewError.png");
						}
					}
				}
			} else {
				table.isDataSource = true;
			}
			var height = 16;
			var width = viewNodeSymbol.width - 20;
			var index = 0;
			if(input)	
				index = input.$$defaultKeyValue;

			for (var i = 0; i < viewNode.inputs._keys.length; i++) {
				if (viewNode.inputs.get(viewNode.inputs._keys[i]) === input) {
					inputSize = i + 1;
				}
			}

			var x = viewNodeSymbol.x + 10;
			var y = viewNodeSymbol.y + 15 + inputSize * height;

			var tableSymbol = this.createTableSymbol(viewNodeSymbol, {
				object: table,
				isPreserveAspect: true,
				isModifiable: false,
				isKeepSize: true,
				x: x,
				y: y,
				width: width,
				height: height,
				inputIndex: index
			});
			return tableSymbol;
		},

		createTableSymbol: function(viewNodeSymbol, param) {
			var table = param.object;
			var tableSymbol = this.createObject(this.DIAGRAM_PACKAGE, table.classDefinition.name + "Symbol", param);
			viewNodeSymbol.symbols.push(tableSymbol);
			if (this.tableSymbol) {
				// required for initial build only 
				this.tableSymbol[table.name] = tableSymbol;
			}
			return tableSymbol;
		},

		createTable: function(object, isGraphNode) {
			var table = this.createObject(this.MODEL_PACKAGE, "Table", {
				name: this.getTableName(object, isGraphNode),
				displayName: CalcViewEditorUtil.getInputImagePath(object, this._model.viewModel.isPerformanceAnalysis, isGraphNode)
			});
			return table;
		},

		getTableName: function(input, isGraphNode) {
			var name;
			if (!isGraphNode) {
				if (input && input.getSource()) {
					if (input.getSource().$$className === "Entity") {
						name = input.getSource().name;
						if (input.alias) {
							name = name + "(" + input.alias + ")";
						}
						return name;
					}
					if (input.getSource().$$className === "ViewNode") {
						return input.getSource().name;
					}
				}
			}
			/* Graph Node implementation-start */
			else {
				if (input && input.$$className === "Entity") {
					name = input.name;
					if (input.alias) {
						name = name + "(" + input.alias + ")";
					}
					return name;
				}
			}
			/* Graph Node implementation-end */
		},

		buildExpandCollapseNode: function(viewNode, viewNodeSymbol) {
			var expanded = this.isViewNodeExpanded(viewNode);
			var imagePath;
			if (expanded) {
				imagePath = resourceLoader.getImagePath("CollapseAll.png", "analytics");
			} else {
				imagePath = resourceLoader.getImagePath("ExpandAll.png", "analytics");
			}
			var expandCollapse = this.createObject(this.MODEL_PACKAGE, "ExpandCollapseNode", {
				name: expanded,
				displayName: imagePath,
			});
			var x = viewNodeSymbol.x + viewNodeSymbol.width - 20;
			var y = viewNodeSymbol.y + 4;
			var expandCollapseNodeSymbol = this.createExpandCollapseNodeSymbol(viewNodeSymbol, {
				object: expandCollapse,
				isKeepSize: true,
				x: x,
				y: y,
				width: 16,
				height: 16,
			});
			return expandCollapseNodeSymbol;
		},

		createExpandCollapseNodeSymbol: function(viewNodeSymbol, param) {
			var expandCollapseNode = param.object;
			var expandCollapseNodeSymbol = this.createObject(this.DIAGRAM_PACKAGE, expandCollapseNode.classDefinition.name + "Symbol", param);
			viewNodeSymbol.symbols.push(expandCollapseNodeSymbol);
			return expandCollapseNodeSymbol;
		},

		isViewNodeExpanded: function(viewNode) {
			var expanded = true;
			if (viewNode.isDataSource) {
				return false;
			}
			if (viewNode.layout) {
				expanded = viewNode.layout.expanded;
			}
			return expanded;
		},

		dispose: function() {
			this._model.viewModel = null;
			this._model = null;
			this.resource = null;
		}

	};

	return DiagramModelBuilder;
});
