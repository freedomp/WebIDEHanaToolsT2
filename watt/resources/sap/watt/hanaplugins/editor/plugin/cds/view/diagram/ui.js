/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/define(["../../util/ResourceLoader", "./galilei"], function(ResourceLoader) {
	"use strict";
	var TRANSPARENT_IMG =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/cds");

	sap.galilei.model.metamodel("Sap.Hana.Ide.CDS.Ui", {
		contents: {
			/**
			 * Sap.Hana.Ide.CDS.Diagram definition
			 */
			"Sap.Hana.Ide.CDS.Diagram": {
				name: "Sap.Hana.Ide.CDS.Ui",
				classDefinition: "sap.galilei.model.Package",
				displayName: "Sap Hana Ide CDS Diagram",
				namespaceName: "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui",
				classifiers: {
					"Diagram": {
						displayName: "Diagram",
						parent: "sap.galilei.ui.diagram.Diagram"
					},
					/**
					 * @class
					 * @name ContextSymbol
					 * The context symbol
					 */
					"ViewSymbol": {
						displayName: "View Symbol",
						parent: "sap.galilei.ui.diagram.Symbol",
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.cds.diagram.View"
							},
							layoutTemplate: {
								mainShape: [{
									shape: "RoundedRectangle",
									r: 5,
									stroke: "#454647",
									strokeWidth: 1,
									fill: "url(#viewFill)",
									width: 120,
									height: 20
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
											href: resourceLoader.getImagePath("view.gif"),
											width: 16,
											height: 16
                                        }, {
											shape: "Text",
											text: "{object/displayName}",
											font: "bold 12px Arial,sans-serif",
											fill: "black",
											horizontalAlignment: "width",
											verticalAlignment: "height",
											isWordWrap: true,
											isEllipsis: true
                                        }, {
											shape: "Image",
											href: TRANSPARENT_IMG,
											width: 16,
											height: 16
                                        }]
                                    }]
								}
							}
						}
					},
					
					/**
					 * @class
					 * @name ContextSymbol
					 * The context symbol
					 */
					"ContextSymbol": {
						displayName: "Context Symbol",
						parent: "sap.galilei.ui.diagram.TableSymbol",
						properties: {
							"ContextSymbol.isAdjustToContent": {
								name: "isAdjustToContent",
								defaultValue: false
							}
						},
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.cds.diagram.Context"
							},
							layoutTemplate: {
								mainShape: [{
									shape: "RoundedRectangle",
									r: 5,
									domClass: "task",
									stroke: "#8fc400",
									strokeWidth: 1,
									fill: "url(#contextFill)",
									padding: 0,
									width: 150,
									height: 20,
									minWidth: 150,
									minHeight: 20
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
											href: resourceLoader.getImagePath("Constant.png"),
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
											href: "{isExpanded:expanderIcon}",
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
										stroke: "#8fc400",
										orientation: "horizontal",
										isVisible: "{isExpanded}"
                                    }]
								},
								items: {
									path: "object/columns",
									template: [{
											columnHeader: "Icon",
											shape: "Image",
											href: "{object/typeIcon}",
											width: 16,
											height: 16
                                    }, {
											columnHeader: "Name",
											shape: "Text",
											domClass: "attributeName",
											text: "{object/displayName}",
											font: "11px Arial,sans-serif",
											fill: "black",
											horizontalAlignment: "left",
											verticalAlignment: "middle",
											isWordWrap: true
                                    }
										],
									rowSymbolClass: "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.RowSymbol",
									paddingLeft: 0,
									paddingRight: 0,
									paddingTop: 0,
									paddingBottom: 0,
									marginLeft: 4,
									marginRight: 4,
									marginTop: 4,
									marginBottom: 4,
									columnPadding: 4,
									rowPadding: 2
								}
							},
							formatters: {
								expanderIcon: function(bExpanded) {
									return bExpanded ? resourceLoader.getImagePath("CollapseAll.png") : resourceLoader.getImagePath("ExpandAll.png");
								}
							},
							events: {
								"dblclick": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										oExtension.symbolDblClicked(oSymbol);
										oExtension.editor.removeSymbolInPlaceEditControl(oSymbol);
									}
								}
							}
						}
					},
					
					/**
					 * @class
					 * @name StructureSymbol
					 * The structure symbol
					 */
					"StructureSymbol": {
						displayName: "Structure Symbol",
						parent: "sap.galilei.ui.diagram.TableSymbol",
						properties: {
							"StructureSymbol.isAdjustToContent": {
								name: "isAdjustToContent",
								defaultValue: false
							}
						},
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.cds.diagram.Structure"
							},
							layoutTemplate: {
								mainShape: [{
									shape: "RoundedRectangle",
									r: 5,
									domClass: "task",
									stroke: "#8fc400",
									strokeWidth: 1,
									fill: "url(#structureFill)",
									padding: 0,
									width: 150,
									height: 20,
									minWidth: 150,
									minHeight: 20
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
											href: resourceLoader.getImagePath("datatypes/StructureType.png"),
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
											href: "{isExpanded:expanderIcon}",
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
										stroke: "#8fc400",
										orientation: "horizontal",
										isVisible: "{isExpanded}"
                                    }]
								},
								items: {
									path: "object/columns",
									template: [{
											columnHeader: "Icon",
											shape: "Image",
											href: "{object/typeIcon}",
											width: 16,
											height: 16
                                    }, {
											columnHeader: "Name",
											shape: "Text",
											domClass: "attributeName",
											text: "{object/displayName}",
											font: "11px Arial,sans-serif",
											fill: "black",
											horizontalAlignment: "left",
											verticalAlignment: "middle",
											isWordWrap: true
                                    }
										],
									rowSymbolClass: "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.RowSymbol",
									paddingLeft: 0,
									paddingRight: 0,
									paddingTop: 0,
									paddingBottom: 0,
									marginLeft: 4,
									marginRight: 4,
									marginTop: 4,
									marginBottom: 4,
									columnPadding: 4,
									rowPadding: 2
								}
							},
							formatters: {
								expanderIcon: function(bExpanded) {
									return bExpanded ? resourceLoader.getImagePath("CollapseAll.png") : resourceLoader.getImagePath("ExpandAll.png");
								}
							},
							events: {
								"dblclick": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										oExtension.symbolDblClicked(oSymbol);
										oExtension.editor.removeSymbolInPlaceEditControl(oSymbol);
									}
								}
							}
						}
					},
					/**
					 * @class
					 * @name EntitySymbol
					 * The entity symbol
					 */
					"EntitySymbol": {
						displayName: "Entity Symbol",
						parent: "sap.galilei.ui.diagram.TableSymbol",
						properties: {
							"EntitySymbol.isAdjustToContent": {
								name: "isAdjustToContent",
								defaultValue: false
							},
							inputKey: {
								dataType: sap.galilei.model.dataTypes.gDouble
							},
							imagePath: {
								defaultValue: resourceLoader.getImagePath("Table.png"),
								dataType: sap.galilei.model.dataTypes.gString
							},
							isReadOnly: {
								defaultValue: false
							}

						},
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.cds.diagram.Entity"
							},
							layoutTemplate: {
								mainShape: [{
									shape: "RoundedRectangle",
									r: 5,
									domClass: "task",
									stroke: "{isReadOnly:getStroke}",
									strokeWidth: 1,
									fill: "{isReadOnly:getFill}",
									padding: 0,
									width: 150,
									height: 20,
									minWidth: 150,
									minHeight: 20,
									events: {
										"pointerover": function(oEvent, oSymbol, oExtension) {
											if (oExtension) {
												//console.log("pointerover");
												oExtension.showFullName(oEvent, oSymbol);
											}
										},
										"pointerout": function(oEvent, oSymbol, oExtension) {
											if (oExtension) {
												//console.log("pointerout");
												oExtension.hideFullName(oEvent, oSymbol);
											}
										}
									}
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
											href: "{imagePath}",
											width: 16,
											height: 16
                                        }, {
											shape: "Text",
											domClass: "entityName",
											text: "{object/displayName}",
											font: "{isReadOnly:getFont}",
											fill: "black",
											horizontalAlignment: "width",
											verticalAlignment: "height",
											isWordWrap: true,
											isEllipsis: true

                                        }, {
											shape: "Image",
											href: "{isExpanded:expanderIcon}",
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
										stroke: "{isReadOnly:getStroke}",
										orientation: "horizontal",
										isVisible: "{isExpanded}"
                                    }]
								},
								items: {
									path: "object/columns",
									template: [{
											columnHeader: "Icon",
											shape: "Image",
											href: "{object/dataTypeIcon}",
											width: 16,
											height: 16
                                    },
										{
											columnHeader: "Key",
											shape: "Image",
											href: "{object/keyIcon}",
											width: "{object/keyIcon:getIconWidth}",
											height: 16
                                    },
										{
											columnHeader: "Name",
											shape: "Text",
											domClass: "attributeName",
											text: "{object/displayName}",
											font: "{object/isReadOnly:getFont}",
											fill: "black",
											horizontalAlignment: "left",
											verticalAlignment: "middle",
											isWordWrap: true
                                    }
										/*, {
										columnHeader: "Label",
										shape: "Text",
										domClass: "attributeName",
										text: "{object/label}",
										font: "11px Arial,sans-serif",
										fill: "grey",
										horizontalAlignment: "left",
										verticalAlignment: "middle",
										isWordWrap: true,
										isVisible: "{object/label}"
                                    }, {
										columnHeader: "firstPartitionIcon",
										shape: "Image",
										href: "{object/firstPartitionIcon}",
										width: 16,
										height: 16
                                    }, {
										columnHeader: "secondPartitionIcon",
										shape: "Image",
										href: "{object/secondPartitionIcon}",
										width: 16,
										height: 16
                                    }*/
										],
									rowSymbolClass: "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.RowSymbol",
									paddingLeft: 0,
									paddingRight: 0,
									paddingTop: 0,
									paddingBottom: 0,
									marginLeft: 4,
									marginRight: 4,
									marginTop: 4,
									marginBottom: 4,
									columnPadding: 4,
									rowPadding: 2
								}
							},
							formatters: {
								expanderIcon: function(bExpanded) {
									return bExpanded ? resourceLoader.getImagePath("CollapseAll.png") : resourceLoader.getImagePath("ExpandAll.png");
								},
								getFill: function(isReadOnly) {
									return isReadOnly ? "url(#readOnlyEntityFill)" : "url(#entityFill)";
								},
								getStroke: function(isReadOnly) {
									return isReadOnly ? "#928383" : "#428EB0";
								},
								searchTextValue: function(searchText) {
									if (searchText === "") {
										return "Click to search";
									}
									return searchText;
								},
								getSearchTextFill: function(searchText) {
									if (searchText === "") {
										return "gray";
									}
									return "black";
								},
								getFont: function(isReadOnly) {
									if (isReadOnly) {
										return "bold italic 12px Arial,sans-serif";
									} else {
										return "bold 12px Arial,sans-serif";
									}
								}
							},
							events: {
								"dblclick": function(oEvent, oSymbol, oExtension) {
									if (!oSymbol.isReadOnly && oExtension) {
										oExtension.symbolDblClicked(oSymbol);
										oExtension.editor.removeSymbolInPlaceEditControl(oSymbol);
									}
								}
							}
						}
					},
					/**
					 * @class
					 * @name RowSymbol
					 *
					 */
					"RowSymbol": {
						displayName: "Row Symbol",
						parent: "sap.galilei.ui.diagram.RowSymbol",
						properties: {
							isReadOnly: {
								defaultValue: false
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

								// Use the same points for source & target
								return {
									isFixedPoints: true,
									points: [
                                        [oBBox.x, oBBox.y + 0.5 * oBBox.height],
                                        [oBBox.x + oBBox.width, oBBox.y + 0.5 * oBBox.height]
                                    ]
								};
							}
						},
						statics: {
							events: {
								"dragstart": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										var oEditor = oExtension.editor,
											oTool = oEditor.selectTool("sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.AssociationSymbol", false),
											aViewPoint,
											aClientPoint;

										oEvent.preventDefault();
										oEvent.stopPropagation();

										// Gets client point
										aClientPoint = oEditor.viewer.normalizePointerEvent(oEvent, false);

										// Converts client point to view point in order to reuse CreateLinkSymbolTool.
										aViewPoint = oEditor.viewer.clientPointToViewPoint(aClientPoint);

										oEvent.clientViewX = aViewPoint[0];
										oEvent.clientViewY = aViewPoint[1];
										// Do not modify clientX, clientY
										oEvent._clientX = aClientPoint[0];
										oEvent._clientY = aClientPoint[1];
										oEvent._type = "drag";
										oTool.isContextButton = true;
										oEvent.contextButtonSymbol = oSymbol;
										oTool.onPointerDown(oEvent);
										oTool.onDragStart(oEvent);
									}
								},
								"pointermove": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										var oEditor = oExtension.editor;

										if (oEditor.tool && oEditor.tool.onPointerMove) {
											oEditor.tool.onPointerMove(oEvent);
										}
									}
								},
								"drag": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										var oEditor = oExtension.editor;

										if (oEditor.tool && oEditor.tool.onDrag) {
											oEditor.tool.onDrag(oEvent);
										}

									}
								},
								"dragend": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										var oEditor = oExtension.editor;

										if (oEditor.tool && oEditor.tool.onDragEnd) {
											oEditor.tool.onDragEnd(oEvent);
										}
									}
								},
								"pointerover": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerover");
										oExtension.showDataType(oEvent, oSymbol);
									}
								},
								"pointerout": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerout");
										oExtension.hideDataType(oEvent, oSymbol);
									}
								},
								"dblclick": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										oExtension.symbolDblClicked(oSymbol);
										//oExtension.editor.removeSymbolInPlaceEditControl(oSymbol);
									}
								}
							},
							formatters: {
								getIconWidth: function(href) {
									return (href === TRANSPARENT_IMG) ? 0 : 16;
								},
								getFont: function(isReadOnly) {
									if (isReadOnly) {
										return "11px Arial,sans-serif;font-style:italic";
									} else {
										return "11px Arial,sans-serif";
									}
								}
							}
						}
					},
					/**
					 * @class
					 * @name AssociationSymbol
					 * The Join symbol
					 */
					"AssociationSymbol": {
						displayName: "Association Symbol",
						parent: "sap.galilei.ui.diagram.LinkSymbol",
						properties: {
							lineStyle: {
								defaultValue: sap.galilei.ui.common.LineStyle.horzDiagonal
							},
							supportedSourceDirections: {
								defaultValue: function() {
									return [sap.galilei.ui.common.LinkDirection.west, sap.galilei.ui.common.LinkDirection.east];
								}
							},
							supportedTargetDirections: {
								defaultValue: function() {
									return [sap.galilei.ui.common.LinkDirection.west, sap.galilei.ui.common.LinkDirection.east];
								}
							},
							contentOffsetX: {
								dataType: sap.galilei.model.dataTypes.gDouble,
								defaultValue: 15
							},
							contentOffsetY: {
								dataType: sap.galilei.model.dataTypes.gDouble,
								defaultValue: 1
							},
							joinKey: {
								dataType: sap.galilei.model.dataTypes.gDouble
							},
							isExternal: {
								defaultValue: false
							}
						},
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.cds.diagram.Association"
							},
							layoutTemplate: {
								stroke: "black",
								strokeWidth: 1,
								strokeDashArray: "{isExternal:getStrokeDash}",
								lineStyle: "{lineStyle}",
								targetArrow: "Arrows.LineEnd"
								/*	middleArrow: {
									shape: "Text",
									text: "{object/cardinality}",
									font: "12px Calibri",
									fill: "black",
									horizontalAlignment: "middle",
									verticalAlignment: "middle",
									isEllipsis: false,
									isVisible: true
								}*/
								/*targetContent: {
									shape: "Text",
									text: "{object/cardinality : getTargetCardinality}",
									font: "12px Calibri",
									fill: "black",
									horizontalAlignment: "middle",
									verticalAlignment: "middle",
									isEllipsis: false,
									isVisible: true
					 			},
								sourceContent: {
									shape: "Text",
									text: "{object/srcCardinality: getSourceCardinality}",
									font: "12px Calibri",
									fill: "black",
									horizontalAlignment: "middle",
									verticalAlignment: "middle",
									isEllipsis: false,
									isVisible: true
								}*/
							},
							formatters: {
								sourceArrowMarker: {
									"default": "Arrows.SlashStart",
									"condition": "Arrows.DiamondStart"
								},
								getStrokeDash: function(isExternal) {
									if (isExternal) {
										return "3,2";
									} else {
										return "0,0";
									}
								},
								joinTypeImage: {
									"leftOuter": resourceLoader.getImagePath("leftJoin_b.png"),
									"rightOuter": resourceLoader.getImagePath("rightJoin_b.png"),
									"inner": resourceLoader.getImagePath("innerJoin_b.png"),
									"fullOuter": resourceLoader.getImagePath("outerJoin_b.png"),
									"textTable": resourceLoader.getImagePath("text.gif"),
									"referential": resourceLoader.getImagePath("innerJoin_b.png")
								},
								getTargetCardinality: function(cardinality) {
									//[1, 0..1] / [0..1]
									var targetCard;
									if (cardinality.indexOf(",") === -1) {
										targetCard = cardinality.substring(1, cardinality.length - 1).trim();
									} else {
										targetCard = cardinality.substring(cardinality.indexOf(",") + 1, cardinality.length - 1).trim();
									}
									return targetCard;
								},
								getSourceCardinality: function(cardinality) {
									//[1, 0..1] / [0..1]
									var srcCard = cardinality;
									return srcCard;
								}
							},
							events: {
								"pointerover": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerover");
										//oExtension.showTooltip("join", oEvent, oSymbol);
									}
								},
								"pointerout": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerout");
										//oExtension.hideTooltip(oEvent, oSymbol);
									}
								},
								"dblclick": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										oExtension.symbolDblClicked(oSymbol);
										//oExtension.editor.removeSymbolInPlaceEditControl(oSymbol);
									}
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