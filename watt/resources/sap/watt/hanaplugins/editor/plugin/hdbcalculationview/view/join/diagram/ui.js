/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../../../util/ResourceLoader", "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/diagram/galilei"], function(ResourceLoader) {
	"use strict";

	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

	sap.galilei.model.metamodel("Sap.Hana.Ide.Analytics.Join.Ui", {
		contents: {
			/**
			 * Sap.Hana.Ide.Analytics.Join.Diagram definition
			 */
			"Sap.Hana.Ide.Analytics.Join.Diagram": {
				name: "Sap.Hana.Ide.Analytics.Join.Ui",
				classDefinition: "sap.galilei.model.Package",
				displayName: "Sap Hana Ide Analytics Join Diagram",
				namespaceName: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.ui",
				classifiers: {
					"Diagram": {
						displayName: "Diagram",
						parent: "sap.galilei.ui.diagram.Diagram"
					},
					/**
					 * @class
					 * @name TableSymbol
					 * The table symbol
					 */
					"TableSymbol": {
						displayName: "Table Symbol",
						parent: "sap.galilei.ui.diagram.TableSymbol",
						properties: {
							"TableSymbol.isAdjustToContent": {
								name: "isAdjustToContent",
								defaultValue: false
							},
							isDataFoundtion: {
								defaultValue: false
							},
							inputKey: {
								dataType: sap.galilei.model.dataTypes.gDouble
							},
							imagePath: {
								defaultValue: resourceLoader.getImagePath("Table.png"),
								dataType: sap.galilei.model.dataTypes.gString
							},
							showSearchField: {
								defaultValue: false
							}
						},
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.Table"
							},
							layoutTemplate: {
								mainShape: [{
									shape: "RoundedRectangle",
									r: 0,
									domClass: "task",
									stroke: "{isDataFoundtion:getStroke}",
									strokeWidth: 1,
									fill: "{isDataFoundtion:getFill}",
									padding: 0,
									width: 100,
									height: 20,
									minWidth: 60,
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
										orientation: "vertical",
										padding: 2,
										innerPadding: 2,
										shapes: [
											{
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
													font: "bold 12px Arial,sans-serif",
													fill: "black",
													horizontalAlignment: "width",
													verticalAlignment: "height",
													isWordWrap: true,
													isEllipsis: true
													/*,
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
													}*/
                                        }, {
													shape: "Image",
													href: resourceLoader.getImagePath("Search.png"),
													width: 16,
													height: 16,
													events: {
														"pointerdown": function(oEvent, oSymbol, oEditorExtension) {
															oSymbol.showSearchField = !oSymbol.showSearchField;

															if (oSymbol.showSearchField) {
																oEditorExtension.toggleExpanded(oSymbol, true);
																oEditorExtension.toggleExpanded(oSymbol, true);
																//BUG
																//oEditorExtension.editor.enterInPlaceEditing(oSymbol, [oSymbol.x + 30, oSymbol.y + 30]);
															} else {
																oEditorExtension.editor.removeSymbolInPlaceEditControl(oSymbol);
																oSymbol.object.search = undefined;
															}
														}
													}
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
                                        },
											{
												shape: "Stack",
												orientation: "horizontal",
												padding: 2,
												innerPadding: 2,
												fill: "black",
												shapes: [{
													shape: "Text",
													text: "{object/search:searchTextValue}",
													font: "12px Arial,sans-serif",
													fill: "{object/search:getSearchTextFill}",
													horizontalAlignment: "width",
													verticalAlignment: "height",
													isWordWrap: true,
													isEllipsis: true,
													isVisible: "{showSearchField}"
                                        }, {
													shape: "Image",
													href: resourceLoader.getImagePath("Cancel.png"),
													width: 16,
													height: 16,
													events: {
														"pointerdown": function(oEvent, oSymbol, oEditorExtension) {
															oSymbol.object.search = "";
															var input = oEditorExtension.model.viewNode.inputs.get(oSymbol.inputKey);
															oEditorExtension._editor.extensionParam.builder.updateTable(oSymbol, input);
															oEditorExtension.toggleExpanded(oSymbol, true);
															oEditorExtension.toggleExpanded(oSymbol, true);
															oEditorExtension.editor.removeSymbolInPlaceEditControl(oSymbol);
														}
													},
													isVisible: "{showSearchField}"
                                            }],
												isVisible: "{showSearchField}"
                                        }]
                                    }, {
										shape: "Separator",
										stroke: "{isDataFoundtion:getStroke}",
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
                                    }, {
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
                                    }],
									rowSymbolClass: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.ui.RowSymbol",
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
								getFill: function(isDataFoundtion) {
									return isDataFoundtion ? "url(#dataFoundationFill)" : "url(#entityFill)";
								},
								getStroke: function(isDataFoundtion) {
									return isDataFoundtion ? "#428EB0" : "#428EB0";
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
								}
							},
							events: {
								"pointerover": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										oExtension.showTooltip("table", oEvent, oSymbol);
									}
								},
								"pointerout": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										oExtension.hideTooltip(oEvent, oSymbol);
									}
								}
							}
						}
					},
					/**
					 * @class
					 * @name RowSymbol
					 * The table symbol
					 */
					"RowSymbol": {
						displayName: "Row Symbol",
						parent: "sap.galilei.ui.diagram.RowSymbol",
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
											oTool = oEditor.selectTool("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.ui.JoinSymbol", false),
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
										oExtension.showTooltip("column", oEvent, oSymbol);
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
					/**
					 * @class
					 * @name JoinSymbol
					 * The Join symbol
					 */
					"JoinSymbol": {
						displayName: "Join Symbol",
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
							}
						},
						statics: {
							objectClass: {
								value: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.Join"
							},
							layoutTemplate: {
								stroke: "black",
								strokeWidth: 1,
								lineStyle: "{lineStyle}",
								targetArrow: "Arrows.LineEnd",
								middleArrow: {
									shape: "Stack",
									shapes: [{
										shape: "Image",
										href: resourceLoader.getImagePath("Warning.png"),
										width: 16,
										height: 16,
										isVisible: "{object/showWarning}"
                                    }, {
										shape: "Image",
										href: "{object/joinType:joinTypeImage}",
										width: 16,
										height: 16
                                    }],
									orientation: "horizontal"
								},
								targetContent: {
									shape: "Text",
									text: "{object/joinCardinality:targetCardinality}",
									font: "12px Calibri",
									fill: "black",
									horizontalAlignment: "middle",
									verticalAlignment: "middle",
									isEllipsis: false,
									isVisible: true
								},
								sourceContent: {
									shape: "Text",
									text: "{object/joinCardinality:sourceCardinality}",
									font: "12px Calibri",
									fill: "black",
									horizontalAlignment: "middle",
									verticalAlignment: "middle",
									isEllipsis: false,
									isVisible: true
								}
							},
							formatters: {
								sourceArrowMarker: {
									"default": "Arrows.SlashStart",
									"condition": "Arrows.DiamondStart"
								},
								sourceCardinality: {
									"C1_1": "1",
									"C1_N": "1",
									"CN_1": "n",
									"CN_N": "n"
								},
								targetCardinality: {
									"C1_1": "1",
									"C1_N": "n",
									"CN_1": "1",
									"CN_N": "m"
								},
								joinTypeImage: {
									"leftOuter": resourceLoader.getImagePath("leftJoin_b.png"),
									"rightOuter": resourceLoader.getImagePath("rightJoin_b.png"),
									"inner": resourceLoader.getImagePath("innerJoin_b.png"),
									"fullOuter": resourceLoader.getImagePath("outerJoin_b.png"),
									"textTable": resourceLoader.getImagePath("text.gif"),
									"referential": resourceLoader.getImagePath("innerJoin_b.png")
								}
							},
							events: {
								"pointerover": function(oEvent, oSymbol, oExtension) {
									if (oExtension) {
										//console.log("pointerover");
										oExtension.showTooltip("join", oEvent, oSymbol);
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
					}
				}
			}
		}
	});
	// Load all metamodels defined
	sap.galilei.model.loadMetamodels();

});
