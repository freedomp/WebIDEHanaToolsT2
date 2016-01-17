/**
 * This file includes only controls with partial (quick) support
 * These controls might have problems with D&D, empty aggregations / properties etc.
 */
sap.ui.define(
	[
		"./AdapterUtils"
	],
	function(AdapterUtils) {
		"use strict";

		return {
			addControls: function(Adapter) {
				var PRIORITY_IMPORTANT = Adapter._getPriority("IMPORTANT");

				Adapter.register("sap.m.Title", {
					defaultSettings: {
						text: "Title",
						width: "100%"
					},
					properties: {
						text: {
							priority: PRIORITY_IMPORTANT
						}
					}
				});

				Adapter.register("sap.m.Token", {
					defaultSettings: {
						text: "Token"
					}
				});

				Adapter.register("sap.m.Tokenizer", {
					behavior: {
						constructor: function () {
							this.addToken(new sap.m.Token({
								text: "Token 1"
							}));
							this.addToken(new sap.m.Token({
								text: "Token 2"
							}));
						}
					},
					droppable : false
				});


				Adapter.register("sap.ui.layout.FixFlex", {
					droppable: false
				});

				Adapter.register("sap.ui.layout.form.Form", {
					droppable: false
				});

				Adapter.register("sap.ui.layout.form.FormContainer", {
					droppable: false
				});

				Adapter.register("sap.ui.layout.form.FormElement", {
					droppable: false
				});

				Adapter.register("sap.ui.layout.form.FormLayout");

				Adapter.register("sap.ui.layout.form.GridLayout");

				Adapter.register("sap.ui.layout.form.ResponsiveGridLayout");

				Adapter.register("sap.ui.layout.form.ResponsiveLayout");

				Adapter.register("sap.ui.unified.Currency");

				Adapter.register("sap.ui.unified.FileUploader", {
					droppable: false
				});

				Adapter.register("sap.ui.unified.FileUploaderParameter");

				Adapter.register("sap.ui.unified.SplitContainer", {
					droppable: false
				});

				Adapter.register("sap.ui.commons.ApplicationHeader");

				Adapter.register("sap.ui.commons.Button", {
					defaultSettings: {
						"text": "Button",
						"width": "100px"
					},
					properties: {
						text: {
							priority: PRIORITY_IMPORTANT
						}
					}
				});

				Adapter.register("sap.ui.commons.CheckBox", {
					properties: {
						name: {
							priority: PRIORITY_IMPORTANT
						},
						text: {
							priority: PRIORITY_IMPORTANT
						}
					}
				});

				Adapter.register("sap.ui.commons.ColorPicker");

				Adapter.register("sap.ui.commons.FileUploader", {
					droppable: false
				});

				Adapter.register("sap.ui.commons.MenuBar", {
					droppable: false
				});
				AdapterUtils.addEmptyControlBackground(sap.ui.commons.MenuBar, ["items"]);

				Adapter.register("sap.ui.unified.MenuItem", {
					defaultSettings: {
						"text": "Item"
					}
				});

				Adapter.register("sap.ui.unified.Menu", {
					droppable: false
				});

				Adapter.register("sap.ui.commons.MenuButton", {
					defaultSettings: {
						"text": "Text"
					},
					properties: {
						text: {
							priority: PRIORITY_IMPORTANT
						}
					},
					droppable: false
				});

				Adapter.register("sap.ui.commons.Paginator", {
					defaultSettings: {
						"numberOfPages": 2
					}
				});

				Adapter.register("sap.ui.commons.Panel", {
					droppable: false
				});

				Adapter.register("sap.ui.commons.PasswordField");

				Adapter.register("sap.ui.commons.ProgressIndicator", {
					properties: {
						displayValue: {
							priority: PRIORITY_IMPORTANT
						}
					}
				});

				Adapter.register("sap.ui.commons.RadioButton");

				Adapter.register("sap.ui.commons.RangeSlider");

				Adapter.register("sap.ui.commons.RatingIndicator");

				Adapter.register("sap.ui.commons.SegmentedButton",{
					behavior: {
						constructor: function () {
							this.addButton(new sap.ui.commons.Button({
								text: "Button 1",
								"width": "100px"
							}));
							this.addButton(new sap.ui.commons.Button({
								text: "Button 2",
								"width": "100px"
							}));
						}
					},
					droppable: false
				});

				Adapter.register("sap.ui.commons.Slider");

				Adapter.register("sap.ui.commons.Splitter", {
					droppable: false
				});

				Adapter.register("sap.ui.commons.TextArea");

				Adapter.register("sap.ui.commons.TextField");

				Adapter.register("sap.ui.commons.Toolbar", {
					droppable: false
				});

				Adapter.register("sap.ui.commons.Tree", {
					droppable: false
				});

				Adapter.register("sap.ui.commons.TreeNode", {
					droppable: false
				});

				Adapter.register("sap.ui.ux3.ExactArea", {
					droppable: false
				});

				Adapter.register("sap.ui.ux3.FeedChunk", {
					droppable: false
				});
				Adapter.register("sap.ui.ux3.Feeder");

				//TODO enable after fix to switch device (which caused an exception)
				//Adapter.register("sap.ui.ux3.NavigationBar", {
				//	behavior: {
				//		constructor: function () {
				//			this.addItem(new sap.ui.ux3.NavigationItem({
				//				text: "Item 1"
				//			}));
				//			this.addItem(new sap.ui.ux3.NavigationItem({
				//				text: "Item 2"
				//			}));
				//		}
				//	},
				//	droppable: false
				//});
				//
				//Adapter.register("sap.ui.ux3.NavigationItem", {
				//	defaultSettings: {
				//		"text": "Item"
				//	},
				//	droppable: false
				//});

				Adapter.register("sap.suite.ui.commons.BusinessCard", {
					droppable: false
				});

				//TODO it cause performance degradation
				//Adapter.register("sap.suite.ui.commons.ChartContainer", {
				//	droppable: false
				//});
				//
				//Adapter.register("sap.suite.ui.commons.ChartContainerContent", {
				//	droppable: false
				//});

				Adapter.register("sap.suite.ui.commons.ComparisonChart", {
					behavior: {
						constructor: function () {
							this.addData(new sap.suite.ui.commons.ComparisonData({
								title: "Data 1",
								value: 4
							}));
							this.addData(new sap.suite.ui.commons.ComparisonData({
								title: "Data 2",
								value: 10
							}));
						}
					},
					droppable: false
				});

				Adapter.register("sap.suite.ui.commons.ComparisonData");

				//TODO enable once NavigationItem is enabled
				//Adapter.register("sap.suite.ui.commons.CountingNavigationItem", {
				//	defaultSettings: {
				//		"text": "item"
				//	},
				//	droppable: false
				//});

				Adapter.register("sap.suite.ui.commons.DateRangeSliderInternal");

				Adapter.register("sap.suite.ui.commons.DeltaMicroChart");

				Adapter.register("sap.suite.ui.commons.GenericTile", {
					droppable: false
				});

				Adapter.register("sap.suite.ui.commons.DynamicContainer", {
					behavior: {
						constructor: function () {
							this.addTile(new sap.suite.ui.commons.GenericTile());
							this.addTile(new sap.suite.ui.commons.GenericTile());
						}
					},
					droppable: false
				});
				AdapterUtils.addEmptyControlBackground(sap.suite.ui.commons.DynamicContainer, ["tiles"]);

				Adapter.register("sap.suite.ui.commons.FacetOverview", {
					droppable: false
				});

				Adapter.register("sap.suite.ui.commons.HarveyBallMicroChart", {
					droppable: false
				});

				Adapter.register("sap.suite.ui.commons.HarveyBallMicroChartItem", {
					droppable: false
				});

				Adapter.register("sap.suite.ui.commons.HeaderCell", {
					droppable: false
				});

				AdapterUtils.addEmptyControlBackground(sap.suite.ui.commons.HeaderCell, ["north"]);

				Adapter.register("sap.suite.ui.commons.HeaderCellItem", {
					droppable: false
				});

				Adapter.register("sap.suite.ui.commons.HeaderContainer", {
					droppable: false
				});

				AdapterUtils.addEmptyControlBackground(sap.suite.ui.commons.HeaderContainer,
					["items"], false, ["addItem", "insertItem", "removeItem", "removeAllItems"]);

				Adapter.register("sap.suite.ui.commons.JamContent", {
					defaultSettings: {
						"contentText": "Content",
						"subheader" : "Subheader"
					}
				});

				Adapter.register("sap.suite.ui.commons.NewsContent", {
					defaultSettings: {
						"contentText": "Content",
						"subheader" : "Subheader"
					}
				});

				Adapter.register("sap.suite.ui.commons.NoteTaker", {
					droppable: false
				});

				Adapter.register("sap.suite.ui.commons.NoteTakerCard");

				Adapter.register("sap.suite.ui.commons.NoteTakerFeeder");

				Adapter.register("sap.suite.ui.commons.NumericContent");

				//TODO it cause performance degradation
				//Adapter.register("sap.m.DateTimeInput");

				Adapter.register("sap.ui.unified.ShellOverlay", {
					droppable: false
				});

				Adapter.register("sap.uxap.ObjectPageHeader", {
					droppable: false
				});

				Adapter.register("sap.uxap.ObjectPageHeaderContent", {
					droppable: false
				});
				AdapterUtils.addEmptyControlBackground(sap.uxap.ObjectPageHeaderContent, ["content"]);

				Adapter.register("sap.suite.ui.commons.DateRangeScroller");

				//TODO enable once fixed. There is an exception while Cut and paste:
				// SyntaxError: Unexpected token S
				//Adapter.register("sap.suite.ui.commons.DateRangeSlider");

				Adapter.register("sap.suite.ui.commons.KpiTile", {
					defaultSettings: {
						"description": "Description",
						"value" : "5"
					}
				});

				Adapter.register("sap.suite.ui.commons.TileContent", {
					droppable: false
				});
				AdapterUtils.addEmptyControlBackground(sap.suite.ui.commons.TileContent, ["content"]);
			}
		};
	},
	/* bExport= */ true
);
