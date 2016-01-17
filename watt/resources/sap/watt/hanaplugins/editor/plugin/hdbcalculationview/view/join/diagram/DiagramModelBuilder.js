/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "../../../util/ResourceLoader",
    "../../CalcViewEditorUtil",
    "../../../viewmodel/model",
    "./model",
    "./ui",
    "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/diagram/galilei"
], function(ResourceLoader, CalcViewEditorUtil, ViewModel) {
	"use strict";

	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

	var DiagramModelBuilder = function(viewModel, viewNode, context, propertiesPane, removeButton) {
		this.resource = new sap.galilei.model.Resource();
		var oModel = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.Model(this.resource);
		oModel.viewNode = viewNode;
		oModel.viewModel = viewModel;
		this._diagram = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.ui.Diagram(this.resource, {
			model: oModel
		});
		this.viewNode = viewNode;
		this._context = context;
		this.removeButton = removeButton;
		this.propertiesPane = propertiesPane;
		this.x = 20;
		if (!viewModel.$$isLoading) {
			this._initialBuild();
		}
	};

	DiagramModelBuilder.prototype = {

		MODEL_PACKAGE: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram",
		DIAGRAM_PACKAGE: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.ui",

		getDiagram: function() {
			return this._diagram;
		},

		getModel: function() {
			return this._diagram.model;
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

		_initialBuild: function() {
			var that = this;
			// create mock model
			//this.createModel();

			//process viewNode

			this.resource.applyUndoableAction(function() { // to improve performance - using undoable action
				that.viewNode.inputs.foreach(function(input) {
					that.createTable(input);
				});
				that.viewNode.joins.foreach(function(join) {
					that.createJoin(join);
				});
			}, "initialBuild", true);

		},

		createTable: function(input) {
			var x = this.x,
				y = 30;
			this.x += 300;
			var isDataFoundation = false;
			var inputName = CalcViewEditorUtil.getInputName(input);
			var oTable = this.createObject(this.MODEL_PACKAGE, "Table", {
				name: inputName,
				displayName: inputName
			});
			this.getModel().tables.push(oTable);
			if (input.getSource()) {
				if (input.getSource().$$className === "ViewNode") {
					if (this.getModel().viewNode && this.getModel().viewNode.isStarJoin()) {
						isDataFoundation = true;
					}
				} else {
					oTable.isDataSource = true;
				}
				//partition infor for tooltip
				if (this._diagram.model.viewModel.isPerformanceAnalysis && input.getSource().hasPartitionSpecifications) {
					if (input.getSource().partitionSpecifications.size() > 0 && input.getSource().partitionSpecifications.get(0).type !== "None") {
						oTable.firstPartitionString = input.getSource().partitionSpecifications.get(0).specificationString;
					}
					if (input.getSource().partitionSpecifications.size() > 1 && input.getSource().partitionSpecifications.get(1).type !== "None") {
						oTable.secondPartitionString = input.getSource().partitionSpecifications.get(1).specificationString;
					}
				}
				this.createColumns(input, oTable);
			}

			//TODO : Read layout info from input
			if (input.layout) {
				x = input.layout.xCoordinate;
				y = input.layout.yCoordinate;
			}

			//return oTable;
			var oTableSymbol = this.createTableSymbol({
				object: oTable,
				x: x,
				y: y,
				isDataFoundtion: isDataFoundation,
				inputKey: input.$getKeyAttributeValue(),
				imagePath: CalcViewEditorUtil.getInputImagePath(input, this._diagram.model.viewModel.isPerformanceAnalysis)
			});
			return oTableSymbol;
		},

		createTableSymbol: function(param) {
			var oTable = param.object;
			param.isAdjustToContent = true;
			var oTableSymbol = this.createObject(this.DIAGRAM_PACKAGE, oTable.classDefinition.name + "Symbol", param);
			oTableSymbol.getOrCreateShape();
			this.getDiagram().symbols.push(oTableSymbol);
			return oTableSymbol;
		},

		updateTable: function(oTableSymbol, input) {
			var that = this;
			if (oTableSymbol && input) {
				var oTable = oTableSymbol.object;
				oTable.columns.clear();
				this.createColumns(input, oTable);
				/*input.getSource().elements.foreach(function(element) {
                    that.createColumn(element, oTable);
                });*/
			}
			return oTableSymbol;
		},

		createColumns: function(input, oTable) {
			function fetchPartSpecs(ps) {
				var elementPartition = [];
				if (ps.type === ViewModel.PartitionSpecificationType.HASH) {
					for (var j = 0; j < ps.expressions.size(); j++) {
						var exp = ps.expressions.getAt(j);
						elementPartition[exp.element.name] = {
							"icon": resourceLoader.getImagePath("hashPartition.png"),
							"iconString": ps.specificationString
						};
					}
				}
				if (ps.type === ViewModel.PartitionSpecificationType.RANGE) {
					if (ps.expressions.size() > 0) {
						elementPartition[ps.expressions.getAt(0).element.name] = {
							"icon": resourceLoader.getImagePath("rangePartition.png"),
							"iconString": ps.specificationString
						};
					}
				}
				return elementPartition;
			}

			if (input.getSource()) {
				var elementPartition1 = [];
				var elementPartition2 = [];
				if (this._diagram.model.viewModel.isPerformanceAnalysis && input.getSource().hasPartitionSpecifications) {
					if (input.getSource().partitionSpecifications.size()) {
						//first level partition
						var ps = input.getSource().partitionSpecifications.getAt(0);
						elementPartition1 = fetchPartSpecs(ps);
						//second level partition
						if (input.getSource().partitionSpecifications.size() > 1) {
							ps = input.getSource().partitionSpecifications.getAt(1);
							elementPartition2 = fetchPartSpecs(ps);
						}
					}
				}
				for (var idx = 0; idx < input.getSource().elements.size(); idx++) {
					var element = input.getSource().elements.getAt(idx);
					var props = {};
					if (this._diagram.model.viewModel.isPerformanceAnalysis) {
						if (typeof elementPartition1[element.name] === 'object') {
							props.firstPartitionIcon = elementPartition1[element.name].icon;
							props.firstPartitionString = elementPartition1[element.name].iconString;
						}
						if (typeof elementPartition2[element.name] === 'object') {
							props.secondPartitionIcon = elementPartition2[element.name].icon;
							props.secondPartitionString = elementPartition2[element.name].iconString;
						}
					}
					if (input.selectAll) {
						if (element.aggregationBehavior === "none") {
							this.createColumn(element, oTable, props);
						}

					} else {
						this.createColumn(element, oTable, props);
					}
				}
			}
		},

		createJoin: function(object) {
			var that = this;

			var oJoin, oJoinSymbols = [],
				oSourceSymbol, oTargetSymbol;

			var leftTable = this.resource.selectObject({
				"classDefinition.name": "Table",
				name: CalcViewEditorUtil.getInputName(object.leftInput)
			});
			var rightTable = this.resource.selectObject({
				"classDefinition.name": "Table",
				name: CalcViewEditorUtil.getInputName(object.rightInput)
			});
			if (leftTable && rightTable) {
				var leftElements = object.leftElements.toArray();
				var rightElements = object.rightElements.toArray();
				if (leftElements.length === rightElements.length) {
					for (var i = 0; i < leftElements.length; i++) {
						var leftColumn = leftTable.columns.selectObject({
							name: leftElements[i].name
						});
						var rightColumn = rightTable.columns.selectObject({
							name: rightElements[i].name
						});
						if (leftColumn && rightColumn) {
							//in performance analysis mode, decide whether to show warning on join or not
							var showWarningIcon = false;
							if (this._diagram.model.viewModel.isPerformanceAnalysis && object.isJoinValidated) {
								if (object.validationStatus === "Warning") {
									showWarningIcon = true;
								}
							}
							// Creates join
							oJoin = this.createObject(this.MODEL_PACKAGE, "Join", {
								name: object.$getKeyAttributeValue(),
								displayName: object.$getKeyAttributeValue(),
								source: leftColumn,
								target: rightColumn,
								joinCardinality: object.cardinality,
								joinType: object.joinType,
								showWarning: showWarningIcon
							});
							if (this._diagram.model.viewModel.isPerformanceAnalysis && object.isJoinValidated) {
								oJoin.proposedCardinality = object.proposedCardinality;
								oJoin.referentialIntegrity = object.isReferential ? "Maintained" : "Not Mantained";
							}

							that.getModel().joins.push(oJoin);

							// Finds source and target symbols
							if (leftColumn.relatedSymbols.length > 0) {
								oSourceSymbol = leftColumn.relatedSymbols.get(0);
							}
							if (rightColumn.relatedSymbols.length > 0) {
								oTargetSymbol = rightColumn.relatedSymbols.get(0);
							}

							if (oSourceSymbol && oTargetSymbol) {
								// Creates join symbol

								oJoinSymbols.push(this.createJoinSymbol({
									object: oJoin,
									sourceSymbol: oSourceSymbol,
									targetSymbol: oTargetSymbol,
									joinKey: object.$getKeyAttributeValue(),
								}));
							}
						}
					}
				}
			}
			return oJoinSymbols;
		},

		createJoinSymbol: function(param) {
			var oJoin = param.object;
			var oJoinSymbol = this.createObject(this.DIAGRAM_PACKAGE, oJoin.classDefinition.name + "Symbol", param);
			this.getDiagram().symbols.push(oJoinSymbol);
			return oJoinSymbol;
		},

		createColumn: function(element, oTable, props) {
			if (oTable.search && oTable.search !== "") {
				if (element.name.indexOf(oTable.search) === -1) {
					return;
				}
			}
			var oColumn = this.createObject(this.MODEL_PACKAGE, "Column", {
				name: element.name,
				displayName: element.name,
				//label: oTable.isDataSource ? element.label : undefined,
				//dataType: element.inlineType ? element.inlineType.primitiveType : undefined,
				dataTypeIcon: element.inlineType ? CalcViewEditorUtil.getDataTypeImage(element.inlineType.primitiveType) : resourceLoader.getImagePath(
					"Column.png"),
				firstPartitionIcon: props.firstPartitionIcon,
				secondPartitionIcon: props.secondPartitionIcon,
				firstPartitionString: props.firstPartitionString,
				secondPartitionString: props.secondPartitionString
			});
			oTable.columns.push(oColumn);
			return oColumn;
		},

		dispose: function() {
			var oModel = this.getModel();
			oModel.viewNode = null;
			oModel = null;
			this.resource = null;
		}

	};

	return DiagramModelBuilder;
});
