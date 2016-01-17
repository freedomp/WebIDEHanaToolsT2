/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["./galilei"], function() {
	"use strict";
	var TRANSPARENT_IMG =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
	sap.galilei.model.metamodel("Sap.Hana.Ide.Analytics", {
		contents: {
			/**
			 * Sap.Hana.Ide.Analytics.Model definition
			 */
			"Sap.Hana.Ide.Analytics.Model": {
				name: "Sap.Hana.Ide.Analytics",
				classDefinition: "sap.galilei.model.Package",
				displayName: "Sap Hana Ide Analytics Model",
				namespaceName: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram",
				classifiers: {
					/**
					 * @class ColumnView
					 */
					"ColumnView": {
						displayName: "Column View",
						parent: "sap.galilei.common.Model"
					},
					/**
					 * @class Semantics
					 */
					"Semantics": {
						displayName: "Semantics"
					},
					/**
					 * @class ViewNode
					 */
					"ViewNode": {
						displayName: "View Node",
						onDelete: function(oEvent) {
							var x = 1;
						},
						properties: {
							"ViewNode.containsProxy": {
								name: "containsProxy",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: "none"
							},
							"ViewNode.isStarJoin": {
								name: "isStarJoin",
								defaultValue: false
							},
							"ViewNode.isDefaultNode": {
								name: "isDefaultNode",
								defaultValue: false
							},
							"ViewNode.isExpanded": {
								name: "isExpanded",
								defaultValue: true
							},
							"ViewNode.disableExpanded": {
								name: "disableExpanded",
								defaultValue: false
							}
						}
					},
					/**
					 * @class Input
					 */
					"Input": {
						displayName: "Input",
						parent: "sap.galilei.common.LinkObject"
					},
					/**
					 * @class JoinNode
					 */
					"JoinNode": {
						displayName: "Join",
						parent: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ViewNode",
						properties: {
							"JoinNode.validationStatus": {
								name: "validationStatus",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							},
							"JoinNode.comments": {
								name: "comments",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							},
							"JoinNode.commentsvalue": {
								name: "commentsvalue",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: undefined
							},
							"JoinNode.validationStatusString": {
								name: "validationStatusString",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: undefined
							},
							"JoinNode.transparentImg": {
								name: "transparentImg",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							},
							"JoinNode.joinType": {
								name: "joinType",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							},
							"JoinNode.joinCardinality": {
								name: "joinCardinality",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							}
						}
					},
					/**
					 * @class Union
					 */
					"Union": {
						displayName: "Union",
						parent: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ViewNode",
						properties: {
							"Union.comments": {
								name: "comments",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							},
							"Union.commentsvalue": {
								name: "commentsvalue",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: undefined
							}
						}
					},
					/**
					 * @class Projection
					 */
					"Projection": {
						displayName: "Projection",
						parent: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ViewNode",
						properties: {
							"Projection.filterExpression": {
								name: "filterExpression",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							},
							"Projection.comments": {
								name: "comments",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							},
							"Projection.commentsvalue": {
								name: "commentsvalue",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: undefined
							},
							"Projection.filterExpressionvalue": {
								name: "filterExpressionvalue",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: undefined
							},
							"Projection.isDatasource": {
								name: "isDatasource",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: undefined
							}
						}
					},
					/**
					 * @class Aggregation
					 */
					"Aggregation": {
						displayName: "Aggregation",
						parent: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ViewNode",
						properties: {
							"Aggregation.filterExpression": {
								name: "filterExpression",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							},
							"Aggregation.filterExpressionvalue": {
								name: "filterExpressionvalue",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: undefined
							},
							"Aggregation.comments": {
								name: "comments",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							},
							"Aggregation.commentsvalue": {
								name: "commentsvalue",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: undefined
							}
						}
					},
					/** 
					 * @class Rank
					 */
					"Rank": {
						displayName: "Rank",
						parent: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ViewNode",
						properties: {
							"Rank.comments": {
								name: "comments",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							},
							"Rank.commentsvalue": {
								name: "commentsvalue",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: undefined
							}
						}
					},

					/**
					 * @class Graph
					 */
					"Graph": {
						displayName: "Graph",
						parent: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ViewNode",
						properties: {}
					},
					/**
					 * @class Table
					 */
					"Table": {
						displayName: "Table",
						properties: {
							"Table.isDataSource": {
								name: "isDataSource",
								defaultValue: false
							},
							"Table.deprecated": {
								name: "deprecated",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							},
							"Table.pruningMessage": {
								name: "pruningMessage",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: undefined
							},
							"Table.pruningTable": {
								name: "pruningTable",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							},
							"JoinNode.thresholdStatus": {
								name: "thresholdStatus",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							},
							"JoinNode.thresholdStatusString": {
								name: "thresholdStatusString",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: undefined
							}
						}
					},
					/**
					 * @class ExpandCollapseNode
					 */
					"ExpandCollapseNode": {
						displayName: "ExpandCollapseNode"
					}

				}
			}
		}
	});
	// Load all metamodels defined
	sap.galilei.model.loadMetamodels();
});
