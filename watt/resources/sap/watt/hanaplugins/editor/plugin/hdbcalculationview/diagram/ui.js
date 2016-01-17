/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader", "./galilei"], function(ResourceLoader) {
	"use strict";

	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
	var TRANSPARENT_IMG =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

	function fillUrl(anchor) {
		// firefox resolves local references starting from the beginning of the document
		// it may find a gradient definition in a <svg> tag belonging to a hidden editor, (display=none), 
		// i.e. gradient will not be rendered if there are more than one editors open
		// fortunately, FF supports URLs to external gradient definitions
		// those are not supported by IE and Chrome though
		if (sap.ui.Device.browser.mozilla) {
			return "url(" + resourceLoader.getImagePath("Gradients.svg", "analytics") + anchor + ")";
		} else {
			return "url(" + anchor + ")";
		}
	} 

	/*
	 * Get the attach points list defined on the symbol.
	 * @function
	 * @param {Boolean} bIsSource true is for source; false is for target; undefined is for both.
	 *  @oBBox {Object} boundry shape.
	 * @returns {Array|undefined} If the attach points are defined, the function returns the points array;
	 */
	function getViewNodeAttachPoints(bIsSource, oBBox) {
		if (bIsSource) {
			return {
				isFixedPoints: true,
				points: [[oBBox.x + oBBox.width * 0.5, oBBox.y]]
			};
		} else {
			return {
				isFixedPoints: true,
				points: [[oBBox.x + oBBox.width * 0.5, oBBox.y + oBBox.height]]
			};
		}
	}

	sap.galilei.model.metamodel("Sap.Hana.Ide.Analytics.Ui", {
		contents: {
			/**
			 * Sap.Hana.Ide.Analytics.Diagram definition
			 */
			"Sap.Hana.Ide.Analytics.Diagram": {
				name: "Sap.Hana.Ide.Analytics.Ui",
				classDefinition: "sap.galilei.model.Package",
				displayName: "Sap Hana Ide Analytics Diagram",
				namespaceName: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui",
				classifiers: {
					"Diagram": {
						displayName: "Diagram",
						parent: "sap.galilei.ui.diagram.Diagram"
					},
					"ViewNodeSymbol": {
						displayName: "View Node Symbol",
						parent: "sap.galilei.ui.diagram.Symbol",
						properties: {
							viewNodeName: {
								defaultValue: "viewNodeName"
							},
							changeBorder: {
								defaultValue: false
							},
							isDatasource: {
								defaultValue: false
							}
						},
						onInitialize: function(oResource, oParam) {
							// Set symbol default parameters
							oParam.isComposite = true;
							oParam.isAdjustToContent = false;
						}
					},
					"JoinNodeSymbol": {
						displayName: "Join Node Symbol",
						parent: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.ViewNodeSymbol",
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.JoinNode"
							},
							layoutTemplate: {
								// The main shape is a rounded rectangle with an
								// envelop icon
								mainShape: [{
									shape: "RoundedRectangle",
									r: 5,
									//stroke: "#7FA9DB",
									stroke: "{changeBorder:getStroke}",
									//strokeWidth: 1,
									strokeWidth: "{changeBorder:getStrokeWidth}",
									fill: fillUrl("#joinFill"),
									width: 140,
									height: 30
                                }, {
									shape: "Panel",
									shapes: [
										{
											shape: "Circle",
											dockPosition: "bottom",
											marginBottom: -6,
											r: 6,
											fill: fillUrl("#joinFill"),
											stroke: "#7FA9DB",
											strokeWidth: 1
											},
										{
											shape: "Circle",
											dockPosition: "top",
											marginTop: -6,
											r: 6,
											fill: fillUrl("#joinFill"),
											stroke: "#7FA9DB",
											strokeWidth: 1
											}
                                        ]
								}],
								// The content shape is the template of the
								// interior of the symbol
								contentShape: {
									shape: "Stack",
									horizontalAlignment: "width",
									verticalAlignment: "top",
									innerAlignment: "center",
									padding: 0,
									innerPadding: 0,
									contentPosition: 2,
									shapes: [{
										shape: "Stack",
										orientation: "horizontal",
										padding: 2,
										innerPadding: 2,
										shapes: [{
												shape: "Image",
												href: "{object:getIcon}",
												width: 16,
												height: 16
                                        }, {
												shape: "Text",
												domClass: "entityName",
												text: "{object/displayName}",
												font: "bold 12px Arial,sans-serif",
												fill: "black",
												horizontalAlignment: "width",
												verticalAlignment: "height",
												isWordWrap: true,
												isEllipsis: true
                                        }, {
												shape: "Image",
												href: "{object/validationStatus}",
												width: "{object/validationStatus:getImageWidth}",
												height: 16
                                        }, {
												shape: "Image",
												href: "{object/comments}",
												width: "{object/comments:getImageWidth}",
												height: 16,
												events: {
													"pointerover": function(oEvent, oSymbol, oExtension) {
														if (oExtension) {
															//console.log("pointerover");
															oExtension.showTooltip("viewNode", oEvent, oSymbol);
														}
													},
													"pointerout": function(oEvent, oSymbol, oExtension) {
														if (oExtension) {
															//console.log("pointerout");
															oExtension.hideTooltip(oEvent, oSymbol);
														}
													}
												}
                                        }, {
												shape: "Image",
												href: "{object/joinCardinality}",
												width: "{object/joinCardinality:getImageWidth}",
												height: 16

                                        }, {
												shape: "Image",
												href: "{object/joinType}",
												width: "{object/joinType:getImageWidth}",
												height: 16

                                        }, {
												shape: "Image",
												href: "{object/isExpanded:expanderIcon}",
												width: 16,
												height: 16,
												events: {
													"pointerdown": function(oEvent, oSymbol, oEditorExtension) {
														oEditorExtension.toggleExpanded(oSymbol);
													}
												}
                                        }
											]
                                    }, {
										shape: "Separator",
										stroke: "#7FA9DB",
										orientation: "horizontal",
										isVisible: "{object/isExpanded}"
                                    }]
								}
							},
							formatters: {
								getImageWidth: function(href) {
									if (href === TRANSPARENT_IMG) {
										return 0;
									} else {
										return 16;
									}
								},
								getStroke: function(changeBorder) {
									if (changeBorder) {
										return "#FF8C00";
									} else {
										return "#7FA9DB";
									}
								},
								getStrokeWidth: function(changeBorder) {
									if (changeBorder) {
										return 2;
									} else {
										return 1;
									}
								},
								getIcon: function(object) {
									if (object.isStarJoin) {
										if (object.containsProxy === "proxy") {
											return resourceLoader.getImagePath("proxy/starJoin.png", "analytics");
										} else {
											return resourceLoader.getImagePath("starJoin.png", "analytics");
										}

									} else {
										if (object.containsProxy === "proxy") {
											return resourceLoader.getImagePath("proxy/Join.png", "analytics");
										} else {
											return resourceLoader.getImagePath("Join.png", "analytics");
										}
									}
								},
								expanderIcon: function(bExpanded) {
									return bExpanded ? resourceLoader.getImagePath("CollapseAll.png") : resourceLoader.getImagePath("ExpandAll.png");
								}
							},
							events: {
								"pointerover": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerover");
										oExtension.showTooltip("viewNode", oEvent, oSymbol);
									}
								},
								"pointerout": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerout");
										oExtension.hideTooltip(oEvent, oSymbol);
									}
								}
							}
						},
						methods: {
							/**
							 * Get the attach points list defined on the symbol.
							 * @function
							 * @memberOf sap.galilei.ui.diagram.Symbol#
							 * @param {Boolean} bIsSource true is for source; false is for target; undefined is for both.
							 * @returns {Array|undefined} If the attach points are defined, the function returns the points array;
							 */
							getAttachPoints: function(bIsSource) {
								var oBBox = this.getBBox();
								return getViewNodeAttachPoints(bIsSource, oBBox);
							}
						}
					},
					"UnionSymbol": {
						displayName: "Union Symbol",
						parent: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.ViewNodeSymbol",
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Union"
							},
							layoutTemplate: {
								mainShape: [{
									shape: "RoundedRectangle",
									r: 5,
									//stroke: "#7CB493",
									stroke: "{changeBorder:getStroke}",
									//strokeWidth: 1,
									strokeWidth: "{changeBorder:getStrokeWidth}",
									fill: fillUrl("#unionFill"),
									width: 140,
									height: 30
                                }, {
									shape: "Panel",
									shapes: [
										{
											shape: "Circle",
											dockPosition: "bottom",
											marginBottom: -6,
											r: 6,
											fill: fillUrl("#unionFill"),
											stroke: "#7CB493",
											strokeWidth: 1
											},
										{
											shape: "Circle",
											dockPosition: "top",
											marginTop: -6,
											r: 6,
											fill: fillUrl("#unionFill"),
											stroke: "#7CB493",
											strokeWidth: 1
											}
                                        ]
								}],
								contentShape: {
									shape: "Stack",
									horizontalAlignment: "width",
									verticalAlignment: "top",
									innerAlignment: "center",
									padding: 0,
									innerPadding: 0,
									contentPosition: 2,
									shapes: [{
										shape: "Stack",
										orientation: "horizontal",
										padding: 2,
										innerPadding: 2,
										shapes: [{
											shape: "Image",
											href: "{object/containsProxy:getIcon}",
											width: 16,
											height: 16
                                        }, {
											shape: "Text",
											//domClass: "entityName",
											text: "{object/displayName}",
											font: "bold 12px Arial,sans-serif",
											fill: "black",
											horizontalAlignment: "width",
											verticalAlignment: "height",
											isWordWrap: true,
											isEllipsis: true
                                        }, {
											shape: "Image",
											href: "{object/comments}",
											width: "{object/comments:getImageWidth}",
											height: 16,
											events: {
												"pointerover": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerover");
														oExtension.showTooltip("viewNode", oEvent, oSymbol);
													}
												},
												"pointerout": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerout");
														oExtension.hideTooltip(oEvent, oSymbol);
													}
												}
											}
                                        }, {
											shape: "Image",
											href: "{object/isExpanded:expanderIcon}",
											width: 16,
											height: 16,
											events: {
												"pointerdown": function(oEvent, oSymbol, oEditorExtension) {
													oEditorExtension.toggleExpanded(oSymbol);
												}
											}
                                            }]
                                    }, {
										shape: "Separator",
										stroke: "#7CB493",
										orientation: "horizontal",
										isVisible: "{object/isExpanded}"
                                    }]
								}
							},
							formatters: {
								getImageWidth: function(href) {
									if (href === TRANSPARENT_IMG) {
										return 0;
									} else {
										return 16;
									}
								},
								getStroke: function(changeBorder) {
									if (changeBorder) {
										return "#FF8C00";
									} else {
										return "#7CB493";
									}
								},
								getStrokeWidth: function(changeBorder) {
									if (changeBorder) {
										return 2;
									} else {
										return 1;
									}
								},
								getIcon: {
									"none": resourceLoader.getImagePath("Union.png", "analytics"),
									"proxy": resourceLoader.getImagePath("proxy/Union.png", "analytics")
								},
								expanderIcon: function(bExpanded) {
									return bExpanded ? resourceLoader.getImagePath("CollapseAll.png") : resourceLoader.getImagePath("ExpandAll.png");
								}
							},
							events: {
								"pointerover": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerover");
										oExtension.showTooltip("viewNode", oEvent, oSymbol);
									}
								},
								"pointerout": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerout");
										oExtension.hideTooltip(oEvent, oSymbol);
									}
								}
							}
						},
						methods: {
							/**
							 * Get the attach points list defined on the symbol.
							 * @function
							 * @memberOf sap.galilei.ui.diagram.Symbol#
							 * @param {Boolean} bIsSource true is for source; false is for target; undefined is for both.
							 * @returns {Array|undefined} If the attach points are defined, the function returns the points array;
							 */
							getAttachPoints: function(bIsSource) {
								var oBBox = this.getBBox();
								return getViewNodeAttachPoints(bIsSource, oBBox);
							}
						}

					},
					"ProjectionSymbol": {
						displayName: "Projection Symbol",
						parent: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.ViewNodeSymbol",
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Projection"
							},
							layoutTemplate: {
								mainShape: [{
									shape: "RoundedRectangle",
									r: "{object/isDatasource:getRctangle}",
									//stroke: "#8F7CA9",
									stroke: "{changeBorder:getStroke}",
									//strokeWidth: 1,
									strokeWidth: "{changeBorder:getStrokeWidth}",
									fill: fillUrl("#projectionFill"),
									width: 140,
									height: 30
                                }, {
									shape: "Panel",
									shapes: [
										{
											shape: "Circle",
											dockPosition: "bottom",
											marginBottom: -6,
											r: 6,
											fill: fillUrl("#projectionFill"),
											stroke: "#8F7CA9",
											strokeWidth: 1
											},
										{
											shape: "Circle",
											dockPosition: "top",
											marginTop: -6,
											r: 6,
											fill: fillUrl("#projectionFill"),
											stroke: "#8F7CA9",
											strokeWidth: 1
											}
                                        ]
								}],
								contentShape: {
									shape: "Stack",
									horizontalAlignment: "width",
									verticalAlignment: "top",
									innerAlignment: "center",
									padding: 0,
									innerPadding: 0,
									contentPosition: 2,
									shapes: [{
										shape: "Stack",
										orientation: "horizontal",
										padding: 2,
										innerPadding: 2,
										shapes: [{
											shape: "Image",
											href: "{object/containsProxy:getIcon}",
											width: 16,
											height: 16
                                        }, {
											shape: "Text",
											//domClass: "entityName",
											text: "{object/displayName}",
											font: "bold 12px Arial,sans-serif",
											fill: "black",
											horizontalAlignment: "width",
											verticalAlignment: "height",
											isWordWrap: true,
											isEllipsis: true
                                        }, {
											shape: "Image",
											href: "{object/comments}",
											width: "{object/comments:getImageWidth}",
											height: 16,
											events: {
												"pointerover": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerover");
														oExtension.showTooltip("viewNode", oEvent, oSymbol);
													}
												},
												"pointerout": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerout");
														oExtension.hideTooltip(oEvent, oSymbol);
													}
												}
											}
                                        }, {
											shape: "Image",
											href: "{object/filterExpression}",
											width: "{object/filterExpression:getImageWidth}",
											height: 16,
											events: {
												"pointerover": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerover");
														oExtension.showTooltip("viewNode", oEvent, oSymbol);
													}
												},
												"pointerout": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerout");
														oExtension.hideTooltip(oEvent, oSymbol);
													}
												}
											}
                                        }, {
											shape: "Image",
											href: "{object/isExpanded:expanderIcon}",
											width: "{object/disableExpanded:disableExpandedIcon}",
										
											height: 16,
											events: {
												"pointerdown": function(oEvent, oSymbol, oEditorExtension) {
													oEditorExtension.toggleExpanded(oSymbol);
												}
											}
                                        }]
                                    }, {
										shape: "Separator",
										stroke: "#8F7CA9",
										orientation: "horizontal",
										isVisible: "{object/isExpanded}"
                                    }]
								}
							},
							formatters: {
								getImageWidth: function(href) {
									if (href === TRANSPARENT_IMG) {
										return 0;
									} else {
										return 16;
									}
								},
								getWidth: function(isDatasource) {
									if (isDatasource) {
										return 220;
									} else {
										return 140;
									}
								},
								getRctangle: function(isDatasource) {
									if (isDatasource) {
										return 0;
									} else {
										return 5;
									}
								},
								getStroke: function(changeBorder) {
									if (changeBorder) {
										return "#FF8C00";
									} else {
										return "#8F7CA9";
									}
								},
								getFill: function(isDatasource) {
									if (isDatasource) {
										return "url(#joinFill)";
									} else {
										return "url(#projectionFill)";
									}
								},
								getStrokeWidth: function(changeBorder) {
									if (changeBorder) {
										return 2;
									} else {
										return 1;
									}
								},
								getIcon: function(icon) {
									if (icon === "none") {
										return resourceLoader.getImagePath("Projection.png", "analytics");
									}
									if (icon === "proxy") {
										return resourceLoader.getImagePath("proxy/Projection.png", "analytics");
									}
									if (icon === "pdDataSource") {
										return resourceLoader.getImagePath("Table.png", "analytics");
									}
								},
								expanderIcon: function(bExpanded) {
									return bExpanded ? resourceLoader.getImagePath("CollapseAll.png") : resourceLoader.getImagePath("ExpandAll.png");
								},
								disableExpandedIcon: function(disableIcon) {
									if (disableIcon) {
										return 0;
									}
									return 16;
								}
							},
							events: {
								"pointerover": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerover");
										oExtension.showTooltip("viewNode", oEvent, oSymbol);
									}
								},
								"pointerout": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerout");
										oExtension.hideTooltip(oEvent, oSymbol);
									}
								}
							}
						},
						methods: {
							/**
							 * Get the attach points list defined on the symbol.
							 * @function
							 * @memberOf sap.galilei.ui.diagram.Symbol#
							 * @param {Boolean} bIsSource true is for source; false is for target; undefined is for both.
							 * @returns {Array|undefined} If the attach points are defined, the function returns the points array;
							 */
							getAttachPoints: function(bIsSource) {
								var oBBox = this.getBBox();
								return getViewNodeAttachPoints(bIsSource, oBBox);
							}
						}

					},
					"AggregationSymbol": {
						displayName: "Aggregation Symbol",
						parent: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.ViewNodeSymbol",
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Aggregation"
							},
							layoutTemplate: {
								mainShape: [{
									shape: "RoundedRectangle",
									r: 5,
									//stroke: "#9AA881",
									stroke: "{changeBorder:getStroke}",
									//strokeWidth: 1,
									strokeWidth: "{changeBorder:getStrokeWidth}",
									fill: fillUrl("#aggregationFill"),
									width: 140,
									height: 30
                                }, {
									shape: "Panel",
									shapes: [
										{
											shape: "Circle",
											dockPosition: "bottom",
											marginBottom: -6,
											r: 6,
											fill: fillUrl("#aggregationFill"),
											stroke: "#9AA881",
											strokeWidth: 1
											},
										{
											shape: "Circle",
											dockPosition: "top",
											marginTop: -6,
											r: 6,
											fill: fillUrl("#aggregationFill"),
											stroke: "#9AA881",
											strokeWidth: 1
											}
                                        ]
								}],
								contentShape: {
									shape: "Stack",
									horizontalAlignment: "width",
									verticalAlignment: "top",
									innerAlignment: "center",
									padding: 0,
									innerPadding: 0,
									contentPosition: 2,
									shapes: [{
										shape: "Stack",
										orientation: "horizontal",
										padding: 2,
										innerPadding: 2,
										shapes: [{
											shape: "Image",
											href: "{object/containsProxy:getIcon}",
											width: 16,
											height: 16
                                        }, {
											shape: "Text",
											//domClass: "entityName",
											text: "{object/displayName}",
											font: "bold 12px Arial,sans-serif",
											fill: "black",
											horizontalAlignment: "width",
											verticalAlignment: "height",
											isWordWrap: true,
											isEllipsis: true
                                        }, {
											shape: "Image",
											href: "{object/comments}",
											width: "{object/comments:getImageWidth}",
											height: 16,
											events: {
												"pointerover": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerover");
														oExtension.showTooltip("viewNode", oEvent, oSymbol);
													}
												},
												"pointerout": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerout");
														oExtension.hideTooltip(oEvent, oSymbol);
													}
												}
											}
                                        }, {
											shape: "Image",
											href: "{object/filterExpression}",
											width: "{object/filterExpression:getImageWidth}",
											height: 16,
											events: {
												"pointerover": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerover");
														oExtension.showTooltip("viewNode", oEvent, oSymbol);
													}
												},
												"pointerout": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerout");
														oExtension.hideTooltip(oEvent, oSymbol);
													}
												}
											}

                                            }, {
											shape: "Image",
											href: "{object/isExpanded:expanderIcon}",
											width: 16,
											height: 16,
											events: {
												"pointerdown": function(oEvent, oSymbol, oEditorExtension) {
													oEditorExtension.toggleExpanded(oSymbol);
												}
											}
                                            }]
                                    }, {
										shape: "Separator",
										stroke: "#9AA881",
										orientation: "horizontal",
										isVisible: "{object/isExpanded}"
                                    }]
								}
							},
							formatters: {
								getImageWidth: function(href) {
									if (href === TRANSPARENT_IMG) {
										return 0;
									} else {
										return 16;
									}
								},
								getStroke: function(changeBorder) {
									if (changeBorder) {
										return "#FF8C00";
									} else {
										return "#9AA881";
									}
								},
								getStrokeWidth: function(changeBorder) {
									if (changeBorder) {
										return 2;
									} else {
										return 1;
									}
								},
								getIcon: {
									"none": resourceLoader.getImagePath("Aggregation.png", "analytics"),
									"proxy": resourceLoader.getImagePath("proxy/Aggregation.png", "analytics")
								},
								expanderIcon: function(bExpanded) {
									return bExpanded ? resourceLoader.getImagePath("CollapseAll.png") : resourceLoader.getImagePath("ExpandAll.png");
								}
							},
							events: {
								"pointerover": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerover");
										oExtension.showTooltip("viewNode", oEvent, oSymbol);
									}
								},
								"pointerout": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerout");
										oExtension.hideTooltip(oEvent, oSymbol);
									}
								}
							}
						},
						methods: {
							/**
							 * Get the attach points list defined on the symbol.
							 * @function
							 * @memberOf sap.galilei.ui.diagram.Symbol#
							 * @param {Boolean} bIsSource true is for source; false is for target; undefined is for both.
							 * @returns {Array|undefined} If the attach points are defined, the function returns the points array;
							 */
							getAttachPoints: function(bIsSource) {
								var oBBox = this.getBBox();
								return getViewNodeAttachPoints(bIsSource, oBBox);
							}
						}

					},
					"RankSymbol": {
						displayName: "Rank Symbol",
						parent: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.ViewNodeSymbol",
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Rank"
							},
							layoutTemplate: {
								mainShape: [{
									shape: "RoundedRectangle",
									r: 5,
									//stroke: "#454647",
									stroke: "{changeBorder:getStroke}",
									//strokeWidth: 1,
									strokeWidth: "{changeBorder:getStrokeWidth}",
									fill: fillUrl("#rankFill"),
									width: 140,
									height: 30
                                }, {
									shape: "Panel",
									shapes: [
										{
											shape: "Circle",
											dockPosition: "bottom",
											marginBottom: -6,
											r: 6,
											fill: fillUrl("#rankFill"),
											stroke: "#454647",
											strokeWidth: 1
											},
										{
											shape: "Circle",
											dockPosition: "top",
											marginTop: -6,
											r: 6,
											fill: fillUrl("#rankFill"),
											stroke: "#454647",
											strokeWidth: 1
											}
                                        ]
								}],
								contentShape: {
									shape: "Stack",
									horizontalAlignment: "width",
									verticalAlignment: "top",
									innerAlignment: "center",
									padding: 0,
									innerPadding: 0,
									contentPosition: 2,
									shapes: [{
										shape: "Stack",
										orientation: "horizontal",
										padding: 2,
										innerPadding: 2,
										shapes: [{
											shape: "Image",
											href: "{object/containsProxy:getIcon}",
											width: 16,
											height: 16
                                        }, {
											shape: "Text",
											//domClass: "entityName",
											text: "{object/displayName}",
											font: "bold 12px Arial,sans-serif",
											fill: "black",
											horizontalAlignment: "width",
											verticalAlignment: "height",
											isWordWrap: true,
											isEllipsis: true
                                        }, {
											shape: "Image",
											href: "{object/comments}",
											width: "{object/comments:getImageWidth}",
											height: 16,
											events: {
												"pointerover": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerover");
														oExtension.showTooltip("viewNode", oEvent, oSymbol);
													}
												},
												"pointerout": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerout");
														oExtension.hideTooltip(oEvent, oSymbol);
													}
												}
											}
                                        }, {
											shape: "Image",
											href: "{object/isExpanded:expanderIcon}",
											width: 16,
											height: 16,
											events: {
												"pointerdown": function(oEvent, oSymbol, oEditorExtension) {
													oEditorExtension.toggleExpanded(oSymbol);
												}
											}
                                            }]
                                    }, {
										shape: "Separator",
										stroke: "#454647",
										orientation: "horizontal",
										isVisible: "{object/isExpanded}"
                                    }]
								}
							},
							formatters: {
								getImageWidth: function(href) {
									if (href === TRANSPARENT_IMG) {
										return 0;
									} else {
										return 16;
									}
								},
								getStroke: function(changeBorder) {
									if (changeBorder) {
										return "#FF8C00";
									} else {
										return "#454647";
									}
								},
								getStrokeWidth: function(changeBorder) {
									if (changeBorder) {
										return 2;
									} else {
										return 1;
									}
								},
								getIcon: {
									"none": resourceLoader.getImagePath("Rank.png", "analytics"),
									"proxy": resourceLoader.getImagePath("proxy/Rank.png", "analytics")
								},
								expanderIcon: function(bExpanded) {
									return bExpanded ? resourceLoader.getImagePath("CollapseAll.png") : resourceLoader.getImagePath("ExpandAll.png");
								}
							},
							events: {
								"pointerover": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerover");
										oExtension.showTooltip("viewNode", oEvent, oSymbol);
									}
								},
								"pointerout": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerout");
										oExtension.hideTooltip(oEvent, oSymbol);
									}
								}
							}
						},
						methods: {
							/**
							 * Get the attach points list defined on the symbol.
							 * @function
							 * @memberOf sap.galilei.ui.diagram.Symbol#
							 * @param {Boolean} bIsSource true is for source; false is for target; undefined is for both.
							 * @returns {Array|undefined} If the attach points are defined, the function returns the points array;
							 */
							getAttachPoints: function(bIsSource) {
								var oBBox = this.getBBox();
								return getViewNodeAttachPoints(bIsSource, oBBox);
							}
						}

					},
					"GraphSymbol": {
						displayName: "Graph Symbol",
						parent: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.ViewNodeSymbol",
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Graph"
							},
							layoutTemplate: {
								mainShape: [{
									shape: "RoundedRectangle",
									r: 5,
									//stroke: "#8F7CA9",
									stroke: "{changeBorder:getStroke}",
									//strokeWidth: 1,
									strokeWidth: "{changeBorder:getStrokeWidth}",
									fill: '#F2F2F2', //fillUrl("#projectionFill"),
									width: 140,
									height: 30
                                }, {
									shape: "Panel",
									shapes: [
										{
											shape: "Circle",
											dockPosition: "bottom",
											marginBottom: -6,
											r: 6,
											fill: fillUrl("#projectionFill"),
											stroke: "#8F7CA9",
											strokeWidth: 1
											},
										{
											shape: "Circle",
											dockPosition: "top",
											marginTop: -6,
											r: 6,
											fill: fillUrl("#projectionFill"),
											stroke: "#8F7CA9",
											strokeWidth: 1
											}
                                        ]
								}],
								contentShape: {
									shape: "Stack",
									horizontalAlignment: "width",
									verticalAlignment: "top",
									innerAlignment: "center",
									padding: 0,
									innerPadding: 0,
									contentPosition: 2,
									shapes: [{
										shape: "Stack",
										orientation: "horizontal",
										padding: 2,
										innerPadding: 2,
										shapes: [{
											shape: "Image",
											href: "{object/containsProxy:getIcon}",
											width: 16,
											height: 16
                                        }, {
											shape: "Text",
											//domClass: "entityName",
											text: "{object/displayName}",
											font: "bold 12px Arial,sans-serif",
											fill: "black",
											horizontalAlignment: "width",
											verticalAlignment: "height",
											isWordWrap: true,
											isEllipsis: true
                                        }, {
											shape: "Image",
											href: "{object/isExpanded:expanderIcon}",
											width: "{object/disableExpanded:disableExpandedIcon}",
											height: 16,
											events: {
												"pointerdown": function(oEvent, oSymbol, oEditorExtension) {
													oEditorExtension.toggleExpanded(oSymbol);
												}
											}
                                        }]
                                    }, {
										shape: "Separator",
										stroke: "#8F7CA9",
										orientation: "horizontal",
										isVisible: "{object/isExpanded}"
                                    }]
								}
							},
							formatters: {
								getImageWidth: function(href) {
									if (href === TRANSPARENT_IMG) {
										return 0;
									} else {
										return 16;
									}
								},
								getStroke: function(changeBorder) {
									if (changeBorder) {
										return "#FF0000";
									} else {
										return "#8F7CA9";
									}
								},
								getStrokeWidth: function(changeBorder) {
									if (changeBorder) {
										return 2;
									} else {
										return 1;
									}
								},
								getIcon: function(icon) {
									if (icon === "none") {
										return resourceLoader.getImagePath("GraphNode.png", "analytics");
									}
									if (icon === "proxy") {
										return resourceLoader.getImagePath("proxy/GraphNode.png", "analytics");
									}
									if (icon === "pdDataSource") {
										return resourceLoader.getImagePath("Table.png", "analytics");
									}
								},
								expanderIcon: function(bExpanded) {
									return bExpanded ? resourceLoader.getImagePath("CollapseAll.png") : resourceLoader.getImagePath("ExpandAll.png");
								},
								disableExpandedIcon: function(disableIcon) {
									if (disableIcon) {
										return 0;
									}
									return 16;
								}
							},
							events: {
								"pointerover": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerover");
										oExtension.showTooltip("viewNode", oEvent, oSymbol);
									}
								},
								"pointerout": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerout");
										oExtension.hideTooltip(oEvent, oSymbol);
									}
								}
							}
						},
						methods: {
							/**
							 * Get the attach points list defined on the symbol.
							 * @function
							 * @memberOf sap.galilei.ui.diagram.Symbol#
							 * @param {Boolean} bIsSource true is for source; false is for target; undefined is for both.
							 * @returns {Array|undefined} If the attach points are defined, the function returns the points array;
							 */
							getAttachPoints: function(bIsSource) {
								var oBBox = this.getBBox();
								return getViewNodeAttachPoints(bIsSource, oBBox);
							}
						}

					},
					"SemanticsSymbol": {
						displayName: "Semantics Symbol",
						parent: "sap.galilei.ui.diagram.Symbol",
						properties: {
							changeSemBorder: {
								defaultValue: false
							}
						},
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Semantics"
							},
							layoutTemplate: {
								mainShape: [{
									shape: "RoundedRectangle",
									r: 5,
									//stroke: "#F3D240",
									stroke: "{changeSemBorder:getStroke}",
									//strokeWidth: 1,
									strokeWidth: "{changeSemBorder:getStrokeWidth}",
									fill: fillUrl("#semanticsFill"),
									width: 140,
									height: 30
                                }, {
									shape: "Panel",
									shapes: [
										{
											shape: "Circle",
											dockPosition: "bottom",
											marginBottom: -6,
											r: 6,
											fill: fillUrl("#semanticsFill"),
											stroke: "#F3D240",
											strokeWidth: 1
											}
                                        ]
								}],
								contentShape: {
									shape: "Stack",
									horizontalAlignment: "width",
									verticalAlignment: "height",
									innerPadding: 6,
									orientation: "horizontal",
									shapes: [{
										shape: "Rectangle",
										strokeWidth: 0,
										width: 20
                                    }, {
										shape: "Image",
										href: resourceLoader.getImagePath("calculation_scenario.png", "analytics"),
										verticalAlignment: "height",
										y: 4,
										width: 16,
										height: 16
                                    }, {
										shape: "Text",
										text: "{object/displayName}",
										font: "bold 12px Arial,sans-serif",
										fill: "black",
										horizontalAlignment: "left",
										verticalAlignment: "height"
                                    }]
								}
							},
							formatters: {
								getStroke: function(changeSemBorder) {
									if (changeSemBorder) {
										return "#FF8C00";
									} else {
										return "#F3D240";
									}
								},
								getStrokeWidth: function(changeSemBorder) {
									if (changeSemBorder) {
										return 2;
									} else {
										return 1;
									}
								}
							}
						}
					},
					// The InputSymbol class.
					"InputSymbol": {
						displayName: "Input Symbol",
						parent: "sap.galilei.ui.diagram.LinkSymbol",
						properties: {
							supportedSourceDirections: {
								defaultValue: function() {
									return [sap.galilei.ui.common.LinkDirection.north];
								}
							},
							supportedTargetDirections: {
								defaultValue: function() {
									return [sap.galilei.ui.common.LinkDirection.south];
								}
							},
							changeInputBorder: {
								defaultValue: false
							}
						},
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Input"
							},
							layoutTemplate: {
								//stroke: "#4D4DA6",
								stroke: "{changeInputBorder:getStroke}",
								//strokeWidth: 1,
								strokeWidth: "{changeInputBorder:getStrokeWidth}",
								fill: "#0080c0",
								lineStyle: sap.galilei.ui.common.LineStyle.normal,
								targetArrow: "Arrows.LineEnd"
							},
							formatters: {
								getStroke: function(changeInputBorder) {
									if (changeInputBorder) {
										return "#FF8C00";
									} else {
										return "#4D4DA6";
									}
								},
								getStrokeWidth: function(changeInputBorder) {
									if (changeInputBorder) {
										return 2;
									} else {
										return 1;
									}
								}
							}
						}
					},
					"SemanticsLinkSymbol": {
						displayName: "Semantics Link Symbol",
						parent: "sap.galilei.ui.diagram.LinkSymbol",
						properties: {
							changeSemLinkBorder: {
								defaultValue: false
							}
						},
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Input"
							},
							layoutTemplate: {
								//stroke: "#4D4DA6",
								stroke: "{changeSemLinkBorder:getStroke}",
								//strokeWidth: 1,
								strokeWidth: "{changeSemLinkBorder:getStrokeWidth}",
								fill: "#0080c0",
								lineStyle: sap.galilei.ui.common.LineStyle.normal
							},
							formatters: {
								getStroke: function(changeSemLinkBorder) {
									if (changeSemLinkBorder) {
										return "#FF8C00";
									} else {
										return "#4D4DA6";
									}
								},
								getStrokeWidth: function(changeSemLinkBorder) {
									if (changeSemLinkBorder) {
										return 2;
									} else {
										return 1;
									}
								}
							}
						}
					},
					"TableSymbol": {
						displayName: "TableSymbol",
						parent: "sap.galilei.ui.diagram.Symbol",
						properties: {
							inputIndex: {
								defaultValue: 0
							},
							changeTableBorder: {
								defaultValue: false
							},
							highlightBorder: {

							}
						},
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Table"
							},
							layoutTemplate: {
								mainShape: [{
									shape: "Rectangle",
									stroke: "{highlightBorder:getStroke}",
									strokeWidth: "{changeTableBorder:getStrokeWidth}",
									fill: "Transparent",
									width: 60,
									height: 20
                                }],
								// The content shape is the template of the
								// interior of the symbol
								contentShape: {
									shape: "Stack",
									horizontalAlignment: "width",
									verticalAlignment: "height",
									innerPadding: 6,
									shapes: [{
											shape: "Image",
											href: "{object/displayName}",
											x: 4,
											y: 4,
											width: 16,
											height: 16,
											verticalAlignment: "height"
                                    }, {
											shape: "Text",
											text: "{object/name}",
											tooltip: "{object/name}",
											font: "12px Arial,sans-serif",
											fill: "black",
											horizontalAlignment: "left",
											verticalAlignment: "height",
											overflow: "hidden",
											isEllipsis: true,
											isWordWrap: true

                                    }, {
											shape: "Image",
											href: "{object/thresholdStatus}",
											width: 16,
											height: 16,
											verticalAlignment: "height"

                                    }, {
											shape: "Image",
											href: "{object/deprecated}",
											width: "{object/deprecated:getImageWidth}",
											height: 16,
											events: {
												"pointerover": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerover");
														oExtension.showTooltip("table", oEvent, oSymbol);
													}
												},
												"pointerout": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerout");
														oExtension.hideTooltip(oEvent, oSymbol);
													}
												}
											}

                                    }, {
											shape: "Image",
											href: "{object/pruningTable}",
											width: 12,
											height: 12,
											events: {
												"pointerover": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerover");
														oExtension.showTooltip("table", oEvent, oSymbol);
													}
												},
												"pointerout": function(oEvent, oSymbol, oExtension) {
													if (oExtension) {
														//console.log("pointerout");
														oExtension.hideTooltip(oEvent, oSymbol);
													}
												}
											}

                                    }
                                    ],
									orientation: "horizontal",
									tooltip: "{object/name}"
								}
							},
							formatters: {
								getImageWidth: function(href) {
									if (href === TRANSPARENT_IMG) {
										return 0;
									} else {
										return 16;
									}
								},
								getStroke: function(highlightBorder) {
									if (highlightBorder) {
										return "#FF8C00";
									} else {
										return "#FFFF00";
									}
								},
								getStrokeWidth: function(changeTableBorder) {
									if (changeTableBorder) {
										return 2;
									} else {
										return 0;
									}
								}

							},
							events: {
								"pointerover": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerover");
										oExtension.showTooltip("table", oEvent, oSymbol);
									}
								},
								"pointerout": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerout");
										oExtension.hideTooltip(oEvent, oSymbol);
									}
								}
							}
						}
					},
					"ExpandCollapseNodeSymbol": {
						displayName: "ExpandCollapseSymbol",
						parent: "sap.galilei.ui.diagram.Symbol",

						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ExpandCollapseNode"
							},
							layoutTemplate: {
								mainShape: [{
									shape: "Rectangle",
									fill: "Transparent",
									width: 16,
									height: 16
                                }],
								contentShape: {
									shape: "Stack",
									horizontalAlignment: "width",
									verticalAlignment: "height",
									innerPadding: 0,
									shapes: [{
										shape: "Image",
										href: "{object/displayName}",
										x: 0,
										y: 0,
										width: 16,
										height: 16,
										verticalAlignment: "height"
                                    }]
								}
							}
						}
					}
				}
			}
		}
	});
	// Load all metamodels defined
	sap.galilei.model.loadMetamodels();

});
