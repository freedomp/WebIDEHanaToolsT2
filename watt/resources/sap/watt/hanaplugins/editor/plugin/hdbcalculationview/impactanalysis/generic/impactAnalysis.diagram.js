/**
 * Defines the Impact Analysis diagram and symbols.
 * User: I063946
 * Date: 04/05/15
 * (c) Copyright 2013-2013 SAP SE. All rights reserved
 */

(function() {
	"use strict";

	var oResource,
		oReader,
		oDiagramDef = {
			contents: {
				"sap.hana.ImpactAnalysis.Diagram": {
					classDefinition: "sap.galilei.model.Package",
					displayName: "Impact Analysis Diagram",
					namespaceName: "sap.hana.impactAnalysis.ui",
					classifiers: {
						/**
						 * @class
						 * @name Diagram
						 * The Impact Analysis Diagram
						 */
						"Diagram": {
							displayName: "Diagram",
							parent: "sap.galilei.ui.diagram.Diagram",
							properties: {
								orientation: {
									dataType: sap.galilei.model.dataTypes.gString,
									defaultValue: sap.galilei.ui.symbol.Orientation.horizontal
								},
								showImpact: {
									dataType: sap.galilei.model.dataTypes.gBool,
									defaultValue: true
								},
								showLineage: {
									dataType: sap.galilei.model.dataTypes.gBool,
									defaultValue: false
								}
							}
						},

						/**
						 * @class
						 * @name NodeSymbol
						 * The Impact Analysis node symbol
						 */
						"NodeSymbol": {
							displayName: "Node Symbol",
							parent: "sap.galilei.impactAnalysis.ui.NodeSymbol",
							properties: {
								"NodeSymbol.isAdjustToContent": {
									name: "isAdjustToContent",
									defaultValue: false
								},
								"NodeSymbol.isKeepSize": {
									name: "isKeepSize",
									defaultValue: true
								},
								"NodeSymbol.isKeepPosition": {
									name: "isKeepPosition",
									defaultValue: true
								},
								"NodeSymbol.showImpact": {
									name: "showImpact",
									get: function() {
										return this.diagram.showImpact && this.object && (this.object.isRoot || this.object.isImpact) && this.object.hasImpact;
									}
								},
								"NodeSymbol.showLineage": {
									name: "showLineage",
									get: function() {
										return this.diagram.showLineage && this.object && (this.object.isRoot || this.object.isLineage) && this.object.hasLineage;
									}
								}
							},
							statics: {
								objectClass: {
									value: "sap.galilei.impactAnalysis.Node"
								},
								layoutTemplate: {
									mainShape: [
                                        { shape: "RoundedRectangle", domClass: "node", padding: 0,
                                            r: "{object/isRoot:radius}",
                                            stroke: "{object/isRoot:stroke}",
                                            strokeWidth: "{object/isRoot:strokeWidth}",
                                            fill: "{object/isRoot:fill}",
                                            width: "{object/isRoot:width}",
                                            height: "{object/isRoot:height}"
                                        },
                                        { shape: "Panel", isFixedDocking: true, shapes: [
                                                { shape: "Image", useReference: true, width: 10, height: 10,
                                                    href: "{object/isImpactExpanded:expanderIcon}",
                                                    isVisible: "{showImpact}",
                                                    dockPosition: "{diagram/orientation:impactExpanderPosition}",
                                                    marginRight: "{diagram/orientation:impactExpanderMarginRight}",
                                                    marginBottom: "{diagram/orientation:impactExpanderMarginBottom}",
                                                    fill: "{object/isImpactExpanded:expanderFill}"
                                                },
                                                // Uses a real shape (not Image) to handle event to avoid freeze on IE11
                                                { shape: "Circle", width: 10, height: 10,
                                                    isVisible: "{showImpact}",
                                                    dockPosition: "{diagram/orientation:impactExpanderPosition}",
                                                    marginRight: "{diagram/orientation:impactExpanderMarginRight}",
                                                    marginBottom: "{diagram/orientation:impactExpanderMarginBottom}",
                                                    stroke: "none",
                                                    fill: "white",
                                                    opacity: 0,
                                                    events: {
                                                        pointerdown: function (oEvent, oSymbol, oExtension) {
                                                            var oImpactAnalyzer = oExtension.impactAnalyzer;
                                                            oEvent.preventDefault();
                                                            oEvent.stopPropagation();
                                                            oImpactAnalyzer.onToggleImpactExpander(oSymbol, oEvent.ctrlKey);
                                                        }
                                                    }
                                                },
                                                { shape: "Image", useReference: true, width: 10, height: 10,
                                                    href: "{object/isLineageExpanded:expanderIcon}",
                                                    isVisible: "{showLineage}",
                                                    dockPosition: "{diagram/orientation:lineageExpanderPosition}",
                                                    marginLeft: "{diagram/orientation:lineageExpanderMarginLeft}",
                                                    marginTop: "{diagram/orientation:lineageExpanderMarginTop}",
                                                    fill: "{object/isLineageExpanded:expanderFill}"
                                                },
                                                // Uses a real shape (not Image) to handle event to avoid freeze on IE11
                                                { shape: "Circle", width: 10, height: 10,
                                                    isVisible: "{showLineage}",
                                                    dockPosition: "{diagram/orientation:lineageExpanderPosition}",
                                                    marginLeft: "{diagram/orientation:lineageExpanderMarginLeft}",
                                                    marginTop: "{diagram/orientation:lineageExpanderMarginTop}",
                                                    stroke: "none",
                                                    fill: "white",
                                                    opacity: 0,
                                                    events: {
                                                        pointerdown: function (oEvent, oSymbol, oExtension) {
                                                            var oImpactAnalyzer = oExtension.impactAnalyzer;
                                                            oEvent.preventDefault();
                                                            oEvent.stopPropagation();
                                                            oImpactAnalyzer.onToggleLineageExpander(oSymbol, oEvent.ctrlKey);
                                                        }
                                                    }
                                                }
                                            ]
                                        }],
									contentShape: {
										shape: "Stack",
										orientation: "horizontal",
										horizontalAlignment: "width",
										verticalAlignment: "height",
										padding: 2,
										innerPadding: 0,
										shapes: [{
											shape: "Image",
											href: "{object/icon}",
											//href: "{object/type :getIconType}",
											isVisible: "{object/icon:hasIcon}",
											width: 16,
											height: 16,
											verticalAlignment: "middle"
                                    }, {
											shape: "Text",
											domClass: "nodeName",
											useReference: true,
											text: "{object/displayName}",
											//text:   "{object/displayName:getName}",
											font: "{object/isRoot:textFont}",
											fill: "black",
											horizontalAlignment: "{object/isRoot:textHorzAlignment}",
											verticalAlignment: "middle",
											isWordWrap: true,
											isEllipsis: true
                                    }]
									}
								},
								formatters: {
									getIconType: function(type) {
										return type === "VIEW" ? "resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/view.jpg" :
						"resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Table.png";
									},
									getName: function(name) {
										name =name.substring(name.lastIndexOf(":")+1,name.length);
										return name;
									},
									radius: function(vValue, oObject, oSymbol) {
										return vValue ? 8 : 4
									},
									impactExpanderPosition: {
										horizontal: "right",
										vertical: "bottom"
									},
									impactExpanderMarginRight: {
										horizontal: -10,
										vertical: 0
									},
									impactExpanderMarginBottom: {
										horizontal: 0,
										vertical: -10
									},
									expanderIcon: function(vValue, oObject, oSymbol) {
										return vValue ? "#ImpactAnalysis.RoundExpanderExpanded" : "#ImpactAnalysis.RoundExpanderCollapsed"
									},
									lineageExpanderPosition: {
										horizontal: "left",
										vertical: "top"
									},
									lineageExpanderMarginLeft: {
										horizontal: -10,
										vertical: 0
									},
									lineageExpanderMarginTop: {
										horizontal: 0,
										vertical: -10
									},
									expanderFill: function(vValue, oObject, oSymbol) {
										return vValue ? "white" : "#0099EB"
									},
									stroke: function(vValue, oObject, oSymbol) {
//										return vValue ? sap.galilei.ui.common.style.Color.green : "#428EB0"
										return vValue ? "#635d5d" : "#428EB0"
									},
									fill: function(vValue, oObject, oSymbol) {
									//	return vValue ? sap.galilei.ui.common.style.Color.getBrighterColor(sap.galilei.ui.common.style.Color.red, 0.8) : "white"
										return vValue ? "#cdd5f0" : "white"
									},
									strokeWidth: function(vValue, oObject, oSymbol) {
//										return vValue ? 3 : 1
										return vValue ? 1 : 1
									},
									width: function (vValue, oObject, oSymbol) {
                                        return vValue ? 140 : 120;
                                    },
									height: function(vValue, oObject, oSymbol) {
										return vValue ? 40 : 24
									},
									textHorzAlignment: function(vValue, oObject, oSymbol) {
										return "width"
									},
									textFont: function(vValue, oObject, oSymbol) {
										return vValue ? "bold 14px Tahoma, Geneva, sans-serif" : "10.5px Tahoma, Geneva, sans-serif";
									},
									wordWrap: function(vValue, oObject, oSymbol) {
										return vValue ? true : false
									},
									hasIcon: function(vValue, oObject, oSymbol) {
										return vValue ? true : false
									}
								},
								events: {
									pointerover: function(oEvent, oSymbol, oExtension) {
										if (oExtension) {
											oExtension.showTooltip("Node", oEvent, oSymbol);
										}
									},
									pointerout: function(oEvent, oSymbol, oExtension) {
										if (oExtension) {
											oExtension.hideTooltip(oEvent, oSymbol);
										}
									}

								}
							}

						},
						/**
						 * @class
						 * @name NodeLinkSymbol
						 * The impact analysis link symbol
						 */
						"NodeLinkSymbol": {
							displayName: "Node Link Symbol",
							parent: "sap.galilei.impactAnalysis.ui.NodeLinkSymbol",
							properties: {
								"NodeLinkSymbol.isKeepPosition": {
									name: "isKeepPosition",
									defaultValue: true
								},
								"NodeLinkSymbol.lineStyle": {
									name: "lineStyle",
									get: function() {
										//                                        var aLinks;
										//
										//                                        if (this.targetSymbol) {
										//                                            aLinks = this.targetSymbol.getLinkSymbols(false, true);
										//                                        }
										//                                        if (aLinks && aLinks.length <= 1) {
										//                                            return this.diagram && this.diagram.orientation === sap.galilei.ui.symbol.Orientation.vertical ? sap.galilei.ui.common.LineStyle.vertDiagonalBezier : sap.galilei.ui.common.LineStyle.horzDiagonalBezier;
										//                                        } else {
										//                                            return sap.galilei.ui.common.LineStyle.Rounded;
										//                                        }
										return this.diagram && this.diagram.orientation === sap.galilei.ui.symbol.Orientation.vertical ? sap.galilei.ui.common.LineStyle
											.vertDiagonalBezier : sap.galilei.ui.common.LineStyle.horzDiagonalBezier;
									}
								},
								supportedSourceDirections: {
									get: function() {
										return [this.diagram && this.diagram.orientation === sap.galilei.ui.symbol.Orientation.vertical ? sap.galilei.ui.common.LinkDirection
											.north : sap.galilei.ui.common.LinkDirection.east];
									}
								},
								supportedTargetDirections: {
									get: function() {
										return [this.diagram && this.diagram.orientation === sap.galilei.ui.symbol.Orientation.vertical ? sap.galilei.ui.common.LinkDirection
											.south : sap.galilei.ui.common.LinkDirection.west];
									}
								}
							},
							statics: {
								layoutTemplate: {
									stroke: "#428EB0",
									strokeWidth: 1,
									lineStyle: "{lineStyle}"
								}
							}
						}
					}
				}
			}
		};

	oResource = new sap.galilei.model.Resource();
	oReader = new sap.galilei.model.JSONReader();
	oReader.load(oResource, oDiagramDef);

	sap.hana.impactAnalysis.ui.Library = sap.galilei.ui.common.library.defineLibrary({

		// Define full class name
		fullClassName: "sap.hana.impactAnalysis.ui.Library",

		// Define library name.
		libraryName: "HanaImpactAnalysis",

		// Define statics
		statics: {
			/**
			 * Initializes the library.
			 * @function
			 * @static
			 * @name onInitialize
			 * @memberOf sap.galilei.impactAnalysis.ui.Library#
			 */
			onInitialize: function() {
				// Expanded icon, size: 10x10
				this.addShape("RoundExpanderExpanded", [
					{
						shape: "Circle",
						domClass: "expandedIconStrokeFill",
						stroke: "#428EB0",
						strokeWidth: 1,
						cx: 5,
						cy: 5,
						r: 5,
						fill: "white"
					},
					{
						shape: "Line",
						domClass: "expandedIconStroke",
						stroke: "#428EB0",
						strokeWidth: 1,
						x1: 2,
						y1: 5,
						x2: 8,
						y2: 5
					}
                    ]);

				// Collapsed icon, size: 10x10
				this.addShape("RoundExpanderCollapsed", [
					{
						shape: "Circle",
						domClass: "collapsedIconStrokeFill",
						stroke: "#428EB0",
						strokeWidth: 1,
						cx: 5,
						cy: 5,
						r: 5,
						fill: sap.galilei.ui.common.style.Color.getBrighterColor("#428EB0", 0.3)
					}, // fill: #0099EB
					{
						shape: "Line",
						domClass: "collapsedIconStroke",
						stroke: "white",
						strokeWidth: 1,
						x1: 2,
						y1: 5,
						x2: 8,
						y2: 5
					},
					{
						shape: "Line",
						domClass: "collapsedIconStroke",
						stroke: "white",
						strokeWidth: 1,
						x1: 5,
						y1: 2,
						x2: 5,
						y2: 8
					}
                    ]);
			}
		}
	});
}());