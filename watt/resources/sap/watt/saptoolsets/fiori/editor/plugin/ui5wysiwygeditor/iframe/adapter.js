sap.ui.define(
	[
		"jquery.sap.global", "./AdapterUtils", "./QuickSupport"
	],
	function(jQuery, AdapterUtils, QuickSupport) {
		"use strict";

// Private variables and methods
// Begin
		var
			/**
			 * @type {number}
			 * @const
			 * @private
			 */
			PRIORITY_IMPORTANT = 100,

			/**
			 * @type {number}
			 * @const
			 * @private
			 */
			PRIORITY_MEDIUM = 60,

			/**
			 * @type {number}
			 * @const
			 * @private
			 */
			PRIORITY_REGULAR = 50,

			/**
			 * simple icon
			 *
			 * @const
			 * @private
			 * @type {string}
			 */
			SIMPLE_ICON = "sap-icon://picture",

			/**
			 * w5g module path
			 *
			 * @const
			 * @private
			 * @type {string}
			 */
			W5G_MODULE_PATH = jQuery.sap.getModulePath("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe") + "/libs/icons/";

		function _isFragment(oXmlNode) {
			return /:?FragmentDefinition$/.test(oXmlNode.localName || oXmlNode.baseName || oXmlNode.nodeName);
		}
// End
// Private variables and methods

		var Adapter = {
			_getPriority: function(sPriority) {
				switch (sPriority) {
					case "IMPORTANT":
						return PRIORITY_IMPORTANT;
					case "MEDIUM":
						return PRIORITY_MEDIUM;
					case "REGULAR":
						return PRIORITY_REGULAR;
				}
				return 0;
			},

			_getSimpleIcon: function() {
				return SIMPLE_ICON;
			},

			_getW5gModulePath: function() {
				return W5G_MODULE_PATH;
			},

			designTimeMetadata: {},

			/**
			 * Gets empty containers test data
			 *
			 * @return {object} return empty container test data
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter#getEmptyContainersTestData
			 * @function
			 * @public
			 */
			getEmptyContainersTestData: AdapterUtils.getEmptyContainersTestData,

			/**
			 * Registers a control to the layout editor.
			 * If <code>sBaseClassName</code> is provided, the control will extend its design time metadata
			 *
			 * @param {string} sClassName Control class name
			 * @param {string=} sBaseClassName Control base class name
			 * @param {object=} oOptions Design time metadata of the control
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter#register
			 * @function
			 * @public
			 */
			register: function (sClassName, sBaseClassName, oOptions) {
				if (jQuery.type(sBaseClassName) === "object") { //just register new class
					oOptions = sBaseClassName;
				} else if (jQuery.type(sBaseClassName) === "string") { //extend design time metadata and register new class
					var oBaseOptions = jQuery.extend(true, {}, Adapter.designTimeMetadata[sBaseClassName]);
					delete oBaseOptions.icon; //do not use base icon

					if (oOptions) {
						jQuery.extend(true, oBaseOptions, oOptions || {});
					}
					oOptions = oBaseOptions;
				}

				jQuery.sap.require(sClassName);
				var oClassDef = jQuery.sap.getObject(sClassName);

				// Create the default properties for every single control
				var oProperties = oClassDef.getMetadata().getAllProperties();
				var oDefaultProperties = {};
				for (var sProperty in oProperties) {
					oDefaultProperties[sProperty] = {
						visible: true,
						name: null,
						priority: 0,
						description: null
					};
				}
				var oDesignTimeOptions = {
					supported: true,
					defaultSettings: {},
					aggregations: {},
					properties: oDefaultProperties,
					behavior: {},
					css: null,
					icon: W5G_MODULE_PATH + sClassName + ".png",
					name: null,
					description: "",
					draggable: true,
					removable: true,
					droppable: true
				};
				if (oOptions && jQuery.type(oOptions) === "object") {
					jQuery.extend(true, oDesignTimeOptions, oOptions);
				}
				Adapter.designTimeMetadata[sClassName] = oDesignTimeOptions;

				AdapterUtils.extendControlFunction(oClassDef, "onLayoutDataChange", function () {
					//updates layout if required
					if(this.getDomRef()) {
						// only if already rendered
						this.invalidate();
					}
				});
			}
		};

		jQuery.sap.require("sap.ui.core.mvc.XMLViewRenderer");
		sap.ui.core.mvc.XMLViewRenderer.render = function (rm, oControl) {
			var bSubView = oControl.isSubView();
			if (!bSubView) {
				rm.write("<div");
				rm.writeControlData(oControl);
				rm.addClass("sapUiView");
				rm.addClass("sapUiXMLView");

				if (oControl.getWidth()) {
					rm.addStyle("width", oControl.getWidth());
				}
				if (oControl.getHeight()) {
					rm.addStyle("height", oControl.getHeight());
				}
				rm.writeStyles();
				rm.writeClasses();
				rm.write(">");
			}
			for (var i = 0; i < oControl.getContent().length; i++) {
				var fragment = oControl.getContent()[i];
				if (fragment && jQuery.type(fragment) === "string") {
					rm.write(fragment);
				} else {
					rm.renderControl(fragment);
				}
			}
			if (!bSubView) {
				rm.write("</div>");
			}
		};

		Adapter.register("sap.ui.core.LayoutData", {
			visible: false,
			aggregations: {
				layoutData: {
					validateAsDropTarget: function (oAggregationOverlay, oDraggedControl) {
						return false;
					}
				}
			}
		});

		Adapter.register("sap.m.FlexItemData", "sap.ui.core.LayoutData");
		Adapter.register("sap.m.ToolbarLayoutData", "sap.ui.core.LayoutData");
		Adapter.register("sap.ui.core.VariantLayoutData", "sap.ui.core.LayoutData");
		Adapter.register("sap.ui.layout.form.GridContainerData", "sap.ui.core.LayoutData");
		Adapter.register("sap.ui.layout.GridData", "sap.ui.core.LayoutData");
		Adapter.register("sap.ui.layout.form.GridElementData", "sap.ui.core.LayoutData");
		Adapter.register("sap.ui.layout.ResponsiveFlowLayoutData", "sap.ui.core.LayoutData");
		Adapter.register("sap.ui.layout.SplitterLayoutData", "sap.ui.core.LayoutData");

		Adapter.register("sap.m.Button", {
			defaultSettings: {
				text: "Button",
				width: "100px"
			},
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Action"
		});

		Adapter.register("sap.m.ToggleButton", "sap.m.Button");
		Adapter.register("sap.m.OverflowToolbarButton", "sap.m.Button", {
			defaultSettings: {
				icon: "sap-icon://picture"
			},
			properties: {
				icon: {
					priority: PRIORITY_IMPORTANT
				}
			},
			behavior: {
				validateDropTarget: {
					list: [
						"sap.m.OverflowToolbar"
					]
				}
			}
		});

		Adapter.register("sap.ushell.ui.footerbar.AddBookmarkButton", "sap.m.Button");

		Adapter.register("sap.m.SegmentedButton", {
			behavior: {
				constructor: function () {
					this.addButton(new sap.m.Button({
						text: "Button 1"
					}));
					this.addButton(new sap.m.Button({
						text: "Button 2"
					}));
				}
			},
			aggregations: {
				buttons: {
					domRef: ":sap-domref"
				}
			},
			properties: {
				selectedKey: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "User Input"
		});
		AdapterUtils.addEmptyControlBackground(sap.m.SegmentedButton, ["buttons"]);
		//TODO: Do we really need this?
		/************************************************************************/
		/*		13.04.2015  		ui5 version: 1.26.10						*/
		/*		[FIX] LE fixes selected button of segmentedButton control		*/
		/*		GIT: 887868														*/
		AdapterUtils.extendControlFunction(sap.m.SegmentedButton, "onBeforeRendering", function () {
			this._selectDefaultButton();
		});
		sap.m.SegmentedButton.prototype._selectDefaultButton = function () {
			//Cannot set the first button to be selected automatically, since the id of the button changes after adding it
			//to the canvas view. Need to check if the selectedButton id still exists in ui5
			var aButtons = this.getButtons();
			var sSelectedButton = this.getSelectedButton();
			if (aButtons.length > 0 && !sap.ui.getCore().byId(sSelectedButton)) {
				this.setAssociation('selectedButton', aButtons[0], true);
			}
		};
		/*																		*/
		/************************************************************************/

		Adapter.register("sap.m.CheckBox", {
			properties: {
				name: {
					priority: PRIORITY_IMPORTANT
				},
				text: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "User Input"
		});

		Adapter.register("sap.m.Image", {
			defaultSettings: {
				width: "140px",
				height: "140px"
			},
			properties: {
				src: {
					priority: PRIORITY_IMPORTANT
				},
				alt: {
					priority: PRIORITY_REGULAR
				},
				activeSrc: {
					priority: PRIORITY_MEDIUM
				}
			},
			category: "Display"
		});

		Adapter.register("sap.m.Input", {
			properties: {
				value: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "User Input"
		});

		Adapter.register("sap.m.Label", {
			defaultSettings: {
				text: "Label",
				width: "100%"
			},
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Display"
		});
		AdapterUtils.addEmptyControlBackground(sap.m.Label, ["text"], true, ["setText"]);

		Adapter.register("sap.m.DisplayListItem", {
			defaultSettings: {
				label: "List Item",
				value: "Value",
				type: "Navigation"
			},
			properties: {
				label: {
					priority: PRIORITY_IMPORTANT
				},
				value: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "List"
		});

		Adapter.register("sap.m.InputListItem", {
			defaultSettings: {
				label: "Input List Item",
				type: "Navigation"
			},
			behavior: {
				constructor: function () {
					this.addContent(new sap.m.Input({
						value: "input"
					}));
				}
			},
			aggregations: {
				content: {
					domRef: ":sap-domref"
				}
			},
			properties: {
				label: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "List"
		});

		Adapter.register("sap.m.StandardListItem", {
			defaultSettings: {
				title: "List Item",
				description: "Description text",
				icon: SIMPLE_ICON,
				type: "Navigation"
			},
			properties: {
				title: {
					priority: PRIORITY_IMPORTANT
				},
				description: {
					priority: PRIORITY_MEDIUM
				},
				icon: {
					priority: PRIORITY_REGULAR
				}
			},
			category: "List"
		});

		Adapter.register("sap.m.List", {
			defaultSettings: {
				noDataText: "Drop list items here"
			},
			behavior: {
				constructor: function () {
					this.addItem(new sap.m.StandardListItem({
						title: "List Item 1",
						description: "Description text",
						icon: SIMPLE_ICON,
						type: "Navigation"
					}));
					this.addItem(new sap.m.StandardListItem({
						title: "List Item 2",
						description: "Description text",
						icon: SIMPLE_ICON,
						type: "Navigation"
					}));
					this.addItem(new sap.m.StandardListItem({
						title: "List Item 3",
						description: "Description text",
						icon: SIMPLE_ICON,
						type: "Navigation"
					}));
				}
			},
			aggregations: {
				items: {
					domRef: ":sap-domref"
				},
				headerToolbar: {
					domRef: ".sapMListHdr, .sapUiDtEmptyHeader"
				},
				infoToolbar: {
					domRef: ".sapUiDtEmptyInfoToolbar"
				}
			},
			css: "List.designtime.css",
			properties: {
				headerText: {
					priority: PRIORITY_IMPORTANT
				},
				footerText: {
					priority: PRIORITY_MEDIUM
				},
				noDataText: {
					priority: PRIORITY_MEDIUM
				}
			},
			category: "List"
		});
		AdapterUtils.addEmptyHeaderToolbars(sap.m.List, ".sapMListHdr");

		Adapter.register("sap.m.Page", {
			defaultSettings: {
				title: "Page"
			},
			behavior: {
				validateDropTarget: {
					list: [
						//TODO enable once we support these controls so there won't be a confusing message
						//"sap.m.SplitApp",
						//"sap.m.SplitContainer",
						"sap.m.Carousel",
						"sap.ui.core.mvc.XMLView"
					]
				}
			},
			aggregations: {
				headerContent: {
					domRef: ":sap-domref > header.sapMPageHeader"
				},
				subHeader: {
					domRef: ":sap-domref > header.sapMPageSubHeader"
				},
				content: {
					domRef: ":sap-domref > section"
				},
				footer: {
					domRef: ":sap-domref > footer, .sapUiDtEmptyFooter"
				}
			},
			css: "Page.designtime.css",
			draggable: false,
			properties: {
				title: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Container"
		});
		AdapterUtils.addEmptyFooterToolbar(sap.m.Page, "sapMPageWithFooter",
			"sapMBar sapMBar-CTX sapMContent-CTX sapMFooter-CTX sapMIBar sapMIBar-CTX sapMPageFooter");

		Adapter.register("sap.m.semantic.SemanticPage", "sap.m.Page", {
			defaultSettings: {
				title: "Semantic Page"
			},
			aggregations: {
				subHeader: {
					domRef: ":sap-domref > .sapMPage > header.sapMPageSubHeader"
				},
				content: {
					domRef: ":sap-domref > .sapMPage > section"
				}
			},
			css: null
		});

		Adapter.register("sap.m.semantic.MasterPage", "sap.m.semantic.SemanticPage");
		Adapter.register("sap.m.semantic.ShareMenuPage", "sap.m.semantic.SemanticPage");
		Adapter.register("sap.m.semantic.DetailPage", "sap.m.semantic.ShareMenuPage");
		Adapter.register("sap.m.semantic.FullscreenPage", "sap.m.semantic.ShareMenuPage");

		Adapter.register("sap.ui.core.mvc.XMLView", {
			aggregations: {
				content: {
					domRef: ":sap-domref",
					validateAsDropTarget: function () {
						var aAggregations = this.getContent();
						if (aAggregations.length === 1) {
							switch(aAggregations[0].getMetadata().getName()) {
								case "sap.m.Page":
								case "sap.m.semantic.SemanticPage":
								case "sap.m.semantic.MasterPage":
								case "sap.m.semantic.ShareMenuPage":
								case "sap.m.semantic.FullscreenPage":
								case "sap.m.semantic.DetailPage":
								case "sap.m.MessagePage":
								case "sap.m.SplitApp":
								case "sap.m.SplitContainer":
								case "sap.m.Dialog":
									return false;
							}
						}
						return true;
					}
				}
			},
			draggable: false,
			removable: false,
			properties: {
				viewName: {
					priority: PRIORITY_IMPORTANT
				}
			}
		});

		Adapter.register("sap.m.RadioButton", {
			defaultSettings: {
				text: "Radio Button"
			},
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "User Input"
		});

		Adapter.register("sap.m.SearchField", {
			properties: {
				placeholder: {
					priority: PRIORITY_MEDIUM
				},
				value: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "User Input"
		});

		Adapter.register("sap.m.TextArea", {
			properties: {
				value: {
					priority: PRIORITY_IMPORTANT
				},
				placeholder: {
					priority: PRIORITY_MEDIUM
				},
				rows: {
					priority: PRIORITY_REGULAR
				}
			},
			category: "User Input"
		});

		jQuery.sap.require("sap.m.ListBase");
		//TODO: Do we really need this?
		/************************************************************************/
		/*		19.02.2015  		ui5 version: 1.24.4							*/
		/*		[CSN] 1580011509 : Growing list crashes w5g						*/
		/*		GIT: 819148														*/
		sap.m.ListBase.prototype.setGrowing = function () {
			if (this._oGrowingDelegate) {
				this._oGrowingDelegate.destroy();
				this._oGrowingDelegate = null;
			}
		};
		/*																		*/
		/************************************************************************/

		Adapter.register("sap.m.Select", {
			behavior: {
				constructor: function () {
					this.addItem(new sap.ui.core.ListItem({
						text: "List Item 1",
						key: "item1"
					}));
					this.addItem(new sap.ui.core.ListItem({
						text: "List Item 2",
						key: "item2"
					}));
					this.addItem(new sap.ui.core.ListItem({
						text: "List Item 3",
						key: "item3"
					}));
					this.setSelectedKey("item1");
				}
			},
			aggregations: {
				items: {
					domRef: ":sap-domref"
				}
			},
			properties: {
				selectedItemId: {
					//this value doesn't affect run time and may only confuse the user
					visible: false
				},
				selectedKey: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "User Input"
		});
		AdapterUtils.patchBindingText(sap.m.Select, ["selectedKey"], "label");

		Adapter.register("sap.m.ActionSelect", "sap.m.Select");

		Adapter.register("sap.m.SelectList", "sap.m.Select", {
			css: "SelectList.designtime.css",
			category: "List"
		});

		Adapter.register("sap.m.ComboBox", "sap.m.Select", {
			properties: {
				value: {
					//this value doesn't affect run time and may only confuse the user
					visible: false
				},
				placeholder: {
					priority: PRIORITY_MEDIUM
				}
			}
		});
		AdapterUtils.patchBindingText(sap.m.ComboBox, ["selectedKey"], "input", "val");

		Adapter.register("sap.m.Slider", {
			defaultSettings: {
				width: "100%"
			},
			properties: {
				max: {
					priority: PRIORITY_MEDIUM
				},
				step: {
					priority: PRIORITY_MEDIUM
				},
				value: {
					priority: PRIORITY_IMPORTANT
				},
				min: {
					priority: PRIORITY_MEDIUM
				}
			},
			category: "User Input"
		});

		Adapter.register("sap.m.DatePicker", {
			properties: {
				displayFormat: {
					priority: PRIORITY_MEDIUM
				},
				dateValue: {
					priority: PRIORITY_IMPORTANT
				},
				valueFormat: {
					priority: PRIORITY_MEDIUM
				},
				placeholder: {
					priority: PRIORITY_REGULAR
				}
			},
			category: "User Input"
		});

		Adapter.register("sap.m.Text", {
			defaultSettings: {
				text: "No text specified"
			},
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Display"
		});
		AdapterUtils.addEmptyControlBackground(sap.m.Text, ["text"], true, ["setText"]);

		Adapter.register("sap.m.FlexBox", {
			defaultSettings: {
				width: "100%"
			},
			aggregations: {
				items: {
					domRef: ":sap-domref",
					layoutData: function () {
						return new sap.m.FlexItemData({
							alignSelf: "Stretch"
						});
					}
				}
			},
			css: "FlexBox.designtime.css",
			category: "Container"
		});
		AdapterUtils.addEmptyControlBackground(sap.m.FlexBox, ["items"]);

		Adapter.register("sap.m.HBox", "sap.m.FlexBox");

		Adapter.register("sap.m.VBox", "sap.m.FlexBox");

		Adapter.register("sap.ui.layout.HorizontalLayout", {
			aggregations: {
				content: {
					domRef: ":sap-domref"
				}
			},
			icon: W5G_MODULE_PATH + "sap.m.HBox.png",
			category: "Layout"
		});
		AdapterUtils.addEmptyControlBackground(sap.ui.layout.HorizontalLayout, ["content"]);

		Adapter.register("sap.ui.layout.VerticalLayout", {
			defaultSettings: {
				width: "100%"
			},
			aggregations: {
				content: {
					domRef: ":sap-domref"
				}
			},
			icon: W5G_MODULE_PATH + "sap.m.VBox.png",
			category: "Layout"
		});
		AdapterUtils.addEmptyControlBackground(sap.ui.layout.VerticalLayout, ["content"]);

		Adapter.register("sap.ui.unified.Calendar", {
			properties: {
				intervalSelection: {
					priority: PRIORITY_IMPORTANT
				},
				months: {
					priority: PRIORITY_IMPORTANT
				},
				singleSelection: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "User Input"
		});

		Adapter.register("sap.ui.unified.CalendarLegend", {
			defaultSettings: {
				legendForType00: "non-working day",
				legendForType01: "sick leave",
				legendForType04: "open request",
				legendForType06: "public holiday",
				legendForToday: "today",
				legendForNormal: "normal day",
				design: "Approval",
				expanded: true,
				expandable: true
			},
			properties: {
				columnWidth: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Display"
		});

		Adapter.register("sap.m.Bar", {
			aggregations: {
				contentLeft: {
					domRef: ".sapMBarLeft"
				},
				contentMiddle: {
					domRef: ".sapMBarMiddle > .sapMBarPH"
				},
				contentRight: {
					domRef: ".sapMBarRight"
				}
			},
			css: "Bar.designtime.css",
			category: "Container"
		});
		AdapterUtils.addEmptyControlBackground(sap.m.Bar, ["contentLeft", "contentMiddle", "contentRight"]);

		Adapter.register("sap.m.ProgressIndicator", {
			defaultSettings: {
				width: "100%"
			},
			properties: {
				displayValue: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Display"
		});

		Adapter.register("sap.m.Switch", {
			category: "User Input"
		});

		Adapter.register("sap.m.Link", {
			defaultSettings: {
				text: "Link to URL"
			},
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				},
				href: {
					priority: PRIORITY_MEDIUM
				}
			},
			category: "Action"
		});

		Adapter.register("sap.m.ObjectNumber", {
			defaultSettings: {
				number: "100",
				unit: "Euro"
			},
			properties: {
				number: {
					priority: PRIORITY_IMPORTANT
				},
				unit: {
					priority: PRIORITY_MEDIUM
				}
			},
			category: "Display"
		});
		AdapterUtils.addEmptyControlBackground(sap.m.ObjectNumber, ["number", "unit", "numberUnit"], true);

		Adapter.register("sap.m.ObjectAttribute", {
			defaultSettings: {
				text: "attribute text"
			},
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				},
				title: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Display"
		});
		//patch for BCP 1580092087
		AdapterUtils.patchEmptyElementRenderer(sap.m.ObjectAttribute, "sapMObjectAttributeDiv", "_isEmpty");
		AdapterUtils.addEmptyControlBackground(sap.m.ObjectAttribute, ["text", "title"], true);

		Adapter.register("sap.m.ObjectStatus", {
			defaultSettings: {
				text: "status text"
			},
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				},
				title: {
					priority: PRIORITY_MEDIUM
				}
			},
			category: "Display"
		});
		//patch for BCP 1580092087
		AdapterUtils.patchEmptyElementRenderer(sap.m.ObjectStatus, "sapMObjStatus", "_isEmpty");
		AdapterUtils.addEmptyControlBackground(sap.m.ObjectStatus, ["text", "icon", "title"], true);

		Adapter.register("sap.m.ObjectIdentifier", {
			defaultSettings: {
				title: "Title",
				text: "Text",
				badgeNotes: true,
				badgePeople: true,
				badgeAttachments: true
			},
			css: "ObjectIdentifier.designtime.css",
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				},
				title: {
					priority: PRIORITY_IMPORTANT
				},
				badgeAttachments: {
					priority: PRIORITY_MEDIUM
				},
				badgeNotes: {
					priority: PRIORITY_MEDIUM
				},
				badgePeople: {
					priority: PRIORITY_REGULAR
				}
			},
			category: "Display"
		});
		AdapterUtils.addEmptyControlBackground(sap.m.ObjectIdentifier,
			["text", "title", "badgeAttachments", "badgeNotes", "badgePeople"], true, ["setText", "setTitle"]);

		Adapter.register("sap.m.ObjectHeader", {
			defaultSettings: {
				intro: "Intro text",
				introActive: true,
				title: "Title",
				titleActive: true,
				number: "123",
				numberUnit: "eur"
			},
			aggregations: {
				attributes: {
					domRef: ".sapMOHAttrEmpty",
					showInvisibleParts: AdapterUtils.showInvisibleParts_ObjectHeader
				},
				statuses: {
					domRef: ".sapMOHStatusEmpty",
					validateAsDropTarget: function (oAggregationOverlay, oDraggedControl) {
						return oDraggedControl instanceof  sap.m.ObjectStatus || oDraggedControl instanceof sap.m.ProgressIndicator;
					},
					showInvisibleParts: AdapterUtils.showInvisibleParts_ObjectHeader
				}
			},
			css: "ObjectHeader.designtime.css",
			properties: {
				intro: {
					priority: PRIORITY_MEDIUM
				},
				number: {
					priority: PRIORITY_MEDIUM
				},
				numberUnit: {
					priority: PRIORITY_MEDIUM
				},
				title: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Display"
		});
		AdapterUtils.addObjectHeaderEmptyParts();

		Adapter.register("sap.m.StandardTile", {
			defaultSettings: {
				title: "Title",
				info: "Info",
				icon: "sap-icon://customer",
				activeIcon: "sap-icon://customer",
				number: "123",
				numberUnit: "eur",
				infoState: "Success",
				type: "None",
				iconDensityAware: true
			},
			properties: {
				icon: {
					priority: PRIORITY_MEDIUM
				},
				number: {
					priority: PRIORITY_MEDIUM
				},
				numberUnit: {
					priority: PRIORITY_MEDIUM
				},
				title: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Tile"
		});

		Adapter.register("sap.m.CustomTile", {
			behavior: {
				constructor: function () {
					this.setContent(new sap.m.Image({
						width: "140px",
						height: "140px"
					}));
				}
			},
			aggregations: {
				content: {
					domRef: ":sap-domref"
				}
			},
			category: "Tile"
		});
		AdapterUtils.addEmptyControlBackground(sap.m.CustomTile, ["content"]);

		Adapter.register("sap.m.TileContainer", {
			defaultSettings: {
				editable: true,
				allowAdd: true
			},
			behavior: {
				constructor: function () {
					this.addTile(new sap.m.StandardTile({
						title: "Title 1",
						info: "Info",
						icon: "sap-icon://customer",
						activeIcon: "sap-icon://customer",
						number: "123",
						numberUnit: "eur",
						infoState: "Success",
						type: "None",
						iconDensityAware: true
					}));
					this.addTile(new sap.m.StandardTile({
						title: "Title 2",
						info: "Info",
						icon: "sap-icon://customer",
						activeIcon: "sap-icon://customer",
						number: "123",
						numberUnit: "eur",
						infoState: "Success",
						type: "None",
						iconDensityAware: true
					}));
				}
			},
			aggregations: {
				tiles: {
					domRef: ":sap-domref",
					show: function (oTile) {
						this.scrollIntoView(oTile, true);
					}
				}
			},
			properties: {
				width: {
					priority: PRIORITY_IMPORTANT
				},
				height: {
					priority: PRIORITY_IMPORTANT
				},
				editable: {
					priority: PRIORITY_MEDIUM
				},
				allowAdd: {
					priority: PRIORITY_MEDIUM
				}
			},
			category: "Tile"
		});
		AdapterUtils.addEmptyControlBackground(sap.m.TileContainer, ["tiles"], false, ["addTile", "removeTile"]);

		Adapter.register("sap.m.FeedListItem", {
			defaultSettings: {
				icon: "sap-icon://personnel-view",
				text: "Feed List Item text",
				sender: "John Doe",
				timestamp: "Dec 02, 2012",
				info: "Waiting for Approval"
			},
			properties: {
				info: {
					priority: PRIORITY_MEDIUM
				},
				sender: {
					priority: PRIORITY_MEDIUM
				},
				text: {
					priority: PRIORITY_IMPORTANT
				},
				icon: {
					priority: PRIORITY_REGULAR
				},
				timestamp: {
					priority: PRIORITY_MEDIUM
				}
			},
			category: "List"
		});

		Adapter.register("sap.m.ObjectListItem", {
			defaultSettings: {
				type: "Active",
				intro: "On behalf of John Doe",
				title: "Object list item",
				number: "9999999999",
				numberUnit: "eur"
			},
			behavior: {
				constructor: function () {
					this.setFirstStatus(new sap.m.ObjectStatus({
						text: "first status text"
					}));
					this.setSecondStatus(new sap.m.ObjectStatus({
						text: "second status text"
					}));
					this.addAttribute(new sap.m.ObjectAttribute({
						text: "attribute text"
					}));
				}
			},
			aggregations: {
				firstStatus: {
					domRef: ".sapMObjLStatus1DivEmpty"
				},
				secondStatus: {
					domRef: ".sapMObjLStatus2DivEmpty"
				},
				attributes: {
					domRef: ".sapMObjLAttrDivEmpty"
				}
			},
			css: "ObjectListItem.designtime.css",
			properties: {
				title: {
					priority: PRIORITY_IMPORTANT
				},
				number: {
					priority: PRIORITY_MEDIUM
				},
				numberUnit: {
					priority: PRIORITY_MEDIUM
				},
				intro: {
					priority: PRIORITY_MEDIUM
				}
			},
			category: "List"
		});
		AdapterUtils.addObjectListItemEmptyParts();


		Adapter.register("sap.m.IconTabSeparator", {
			category: "Container"
		});

		Adapter.register("sap.m.IconTabFilter", {
			defaultSettings: {
				icon: "sap-icon://task",
				iconColor: "Critical",
				count: "10",
				text: "Open"
			},
			aggregations: {
				content: {
					domRef: function () {
						var oParent = this.getParent(); 
						if ((oParent instanceof sap.m.IconTabHeader) && oParent.getSelectedKey() === this._getNonEmptyKey()) {
							var oGrandParent = oParent.getParent();
							if (oGrandParent instanceof sap.m.IconTabBar) {
								return oGrandParent.getDomRef().querySelector(".sapMITBContainerContent");
							}
						}
					}
				}
			},
			behavior: {
				validateDropTarget: {
					list: [
						"sap.m.IconTabHeader",
						"sap.m.IconTabBar"
					]
				}
			},
			properties: {
				icon: {
					priority: PRIORITY_IMPORTANT
				},
				text: {
					priority: PRIORITY_IMPORTANT
				},
				count: {
					priority: PRIORITY_REGULAR
				},
				key: {
					priority: PRIORITY_MEDIUM
				}
			},
			category: "Container"
		});

		Adapter.register("sap.m.IconTabHeader", {
			behavior: {
				constructor: function () {
					this.addItem(new sap.m.IconTabFilter({
						showAll: true,
						count: "22",
						text: "Orders",
						content: [
							new sap.m.List({
								items: [
									new sap.m.StandardListItem({
										title: "List Item 1"
									}),
									new sap.m.StandardListItem({
										title: "List Item 2"
									}),
									new sap.m.StandardListItem({
										title: "List Item 3"
									})
								]
							})
						]
					}));
					this.addItem(new sap.m.IconTabFilter({
						icon: "sap-icon://task",
						iconColor: "Critical",
						count: "10",
						text: "Open"
					}));
					this.addItem(new sap.m.IconTabFilter({
						icon: "sap-icon://shipping-status",
						iconColor: "Positive",
						count: "5",
						text: "Shipped"
					}));
				}
			},
			aggregations: {
				items: {
					domRef: ".sapMITBHead",
					show: function (oItem) {
						if (oItem) {
							this._scrollIntoView(oItem, 0);
						}
					}
				}
			},
			css: "IconTabHeader.designtime.css",
			properties: {
				selectedKey: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Container"
		});
		AdapterUtils.addEmptyControlBackground(sap.m.IconTabHeader, ["items"]);

		Adapter.register("sap.m.IconTabBar", "sap.m.IconTabHeader", {
			aggregations: {
				items: {
					show: function (oItem) {
						if (oItem) {
							// Scroll icon tab filter into view
							this._getIconTabHeader()._scrollIntoView(oItem, 0);

							if (oItem instanceof sap.m.IconTabSeparator) {
								return;
							}

							// Get it selected if there's a key; Don't select if already done
							if (!this.getExpanded() || !this.getSelectedKey() ||
								this.getSelectedKey() !== oItem._getNonEmptyKey()) {
								this.setSelectedItem(oItem);
							}
						}
					},
					beforeAdd: function(oItem) {
						if(oItem instanceof sap.m.IconTabFilter) {
							var that = this;
							jQuery.each(this.getItems(), function() {
								if (this.getKey && this.getKey() === oItem.getKey()) {
									// BCP: 1570849827
									// 'key' property should be unique!
									// resets the 'key' property to default value
									oItem.setKey();
									return false;
								}
							});
						}
					}
				},
				content: {
					domRef: function () {
						if (!this.getSelectedKey()) {
							return this.getDomRef().querySelector(".sapMITBContainerContent");
						}
					}
				}
			},
			css: "IconTabBar.designtime.css"
		});

		Adapter.register("sap.ui.layout.Grid", {
			behavior: {
				constructor: function () {
					this.addContent(new sap.m.ObjectListItem({
						title: "laptop",
						intro: "Category",
						number: "24",
						numberUnit: "eur",
						icon: "sap-icon://laptop"
					}));
					this.addContent(new sap.m.ObjectListItem({
						title: "projector",
						intro: "Category",
						number: "12",
						numberUnit: "eur",
						icon: "sap-icon://projector"
					}));
					this.addContent(new sap.m.ObjectListItem({
						title: "print",
						intro: "Category",
						number: "12",
						numberUnit: "eur",
						icon: "sap-icon://print"
					}));
					this.addContent(new sap.m.ObjectListItem({
						title: "leads",
						intro: "Category",
						number: "57",
						numberUnit: "eur",
						icon: "sap-icon://leads"
					}));
					this.addContent(new sap.m.InputListItem({
						label: "Customers List",
						type: "Navigation"
					}));
					this.addContent(new sap.m.InputListItem({
						label: "Leads list",
						type: "Navigation"
					}));
				}
			},
			aggregations: {
				content: {
					domRef: ":sap-domref",
					layoutData: function () {//adds the aggregation to every control which is dragged to the grid.
						return new sap.ui.layout.GridData({
							span: "L6 M12 S12"
						});
					}
				}
			},
			category: "Layout"
		});
		AdapterUtils.addEmptyControlBackground(sap.ui.layout.Grid, ["content"]);

		Adapter.register("sap.m.Shell", {
			draggable: false,
			removable: false
		});

		Adapter.register("sap.ui.core.Title", {
			defaultSettings: {
				text: "Title"
			},
			behavior: {
				validateDropTarget: {
					list: [
						"sap.ui.layout.form.SimpleForm",
						"sap.ui.layout.form.Form",
						"sap.ui.layout.form.FormContainer"
					]
				}
			},
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Display"
		});

		Adapter.register("sap.ui.core.InvisibleText", {
			defaultSettings: {
				text: "InvisibleText"
			},
			properties: {
				busy: {
					//this property is not supported according to ui5 documentation
					visible: false
				},
				busyIndicatorDelay: {
					//this property is not supported according to ui5 documentation
					visible: false
				}
			},
			category: "Display"
		});

		Adapter.register("sap.ui.layout.form.SimpleForm", {
			aggregations: {
				content: {
					domRef: ":sap-domref",
					validateAsDropTarget: function (oAggregationOverlay, oDraggedControl) {
						return oDraggedControl instanceof sap.ui.core.Title || oDraggedControl instanceof sap.ui.core.Control;
					}
				}
			},
			defaultSettings: {
				maxContainerCols: 2,
				layout: "ResponsiveGridLayout"
			},
			behavior: {
				constructor: function () {
					this.addContent(new sap.ui.core.Title({
						text: "Title"
					}));
					this.addContent(new sap.m.Label({
						text: "Label 1"
					}));
					this.addContent(new sap.m.Input());
					this.addContent(new sap.m.Input());
					this.addContent(new sap.m.Label({
						text: "Label 2"
					}));
					this.addContent(new sap.m.Input());
				}
			},
			name: "Simple Form",
			properties: {
				layout: {
					visible: false
				}
			},
			category: "Layout"
		});

		Adapter.register("sap.m.GroupHeaderListItem", {
			properties: {
				title: {
					priority: PRIORITY_IMPORTANT
				},
				count: {
					priority: PRIORITY_MEDIUM
				}
			},
			category: "List"
		});

		Adapter.register("sap.ui.core.Item", {
			defaultSettings: {
				text: "Item"
			},
			behavior: {
				validateDropTarget: {
					list: [
						"sap.m.Select"
					]
				}
			},
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				},
				key: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "List"
		});

		Adapter.register("sap.ui.core.ListItem", "sap.ui.core.Item", {
			defaultSettings: {
				text: "List item"
			},
			properties: {
				info: {
					priority: PRIORITY_MEDIUM
				},
				description: {
					priority: PRIORITY_REGULAR
				}
			}
		});

		/* Renders hidden behind the title bar. In runtime you need to pull down this area to refresh. Since events are blocked in designtime it's not visible. */
		Adapter.register("sap.m.PullToRefresh", {
			category: "Action"
		});

		Adapter.register("sap.m.ActionListItem", {
			defaultSettings: {
				text: "Text",
				type: "Navigation"
			},
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "List"
		});

		Adapter.register("sap.m.CustomListItem", {
			defaultSettings: {
				type: "Navigation"
			},
			behavior: {
				constructor: function () {
					this.addContent(new sap.m.Text({
						text: "sample custom content"
					}));
				}
			},
			aggregations: {
				content: {
					domRef: ":sap-domref"
				}
			},
			category: "List"
		});

		Adapter.register("sap.m.Toolbar", {
			defaultSettings: {
				width: "100%"
			},
			aggregations: {
				content: {
					domRef: ":sap-domref"
				}
			},
			category: "Container"
		});
		AdapterUtils.addEmptyControlBackground(sap.m.Toolbar, ["content"]);

		Adapter.register("sap.m.OverflowToolbar", "sap.m.Toolbar"/*, {
			aggregations: {
				content: {
					domRef: ":sap-domref",
					show: function (oControl) {
						if (this._getVisibleContent().indexOf(oControl) === -1) {
							//TODO:how to show hidden content?
						}
					}
				}
			}
		}*/);
		AdapterUtils.addEmptyControlBackground(sap.m.OverflowToolbar, ["content"]);

		Adapter.register("sap.m.ToolbarSpacer", {
			category: "Container",
			behavior: {
				validateDropTarget: {
					list: [
						"sap.m.Toolbar"
					]
				}
			}
		});

		Adapter.register("sap.m.Panel", {
			css: "Panel.designtime.css",
			aggregations: {
				headerToolbar: {
					domRef: ".sapMPanelHdr, .sapUiDtEmptyHeader"
				},
				infoToolbar: {
					domRef: ".sapUiDtEmptyInfoToolbar"
				},
				content: {
					domRef: ".sapMPanelContent",
					show: function () {
						this.setExpanded(true);
					}
				}
			},
			properties: {
				headerText: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Container"
		});
		AdapterUtils.addEmptyHeaderToolbars(sap.m.Panel, ".sapMPanelHdr");

		Adapter.register("sap.ui.core.Icon", {
			defaultSettings: {
				size: "2em",
				src: "sap-icon://doctor"
			},
			icon: W5G_MODULE_PATH + "sap.m.Button.png",
			properties: {
				src: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Display"
		});
		AdapterUtils.addEmptyControlBackground(sap.ui.core.Icon, ["src"], false, ["setSrc"]);

		Adapter.register("sap.m.Table", {
			defaultSettings: {
				width: "100%",
				noDataText: "Drop column list items here and columns in the area above"
			},
			css: "Table.designtime.css",
			behavior: {
				constructor: function () {
					//Table Header
					this.addColumn(new sap.m.Column({
						header: new sap.m.Label({
							text: "Header 1"
						})
					}));
					this.addColumn(new sap.m.Column({
						header: new sap.m.Label({
							text: "Header 2"
						})
					}));
					this.addColumn(new sap.m.Column({
						header: new sap.m.Label({
							text: "Header 3"
						})
					}));

					//Table Content
					this.addItem(new sap.m.ColumnListItem({
						cells: [
							new sap.m.Text({
								text: "Row 1 Cell 1"
							}),
							new sap.m.Text({
								text: "Row 1 Cell 2"
							}),
							new sap.m.Text({
								text: "Row 1 Cell 3"
							})
						]
					}));
					this.addItem(new sap.m.ColumnListItem({
						cells: [
							new sap.m.Text({
								text: "Row 2 Cell 1"
							}),
							new sap.m.Text({
								text: "Row 2 Cell 2"
							}),
							new sap.m.Text({
								text: "Row 2 Cell 3"
							})
						]
					}));
				}
			},
			aggregations: {
				items: {
					domRef: ":sap-domref > table > tbody"
				},
				columns: {
					domRef: ":sap-domref > table > thead"
				},
				headerToolbar: {
					domRef: ".sapMListHdr, .sapUiDtEmptyHeader"
				},
				infoToolbar: {
					domRef: ".sapUiDtEmptyInfoToolbar"
				}
			},
			properties: {
				headerText: {
					priority: PRIORITY_IMPORTANT
				},
				footerText: {
					priority: PRIORITY_MEDIUM
				},
				noDataText: {
					priority: PRIORITY_REGULAR
				}
			},
			category: "List"
		});
		AdapterUtils.addEmptyHeaderToolbars(sap.m.Table, ".sapMListHdr");

		Adapter.register("sap.m.Column", {
			behavior: {
				constructor: function () {
					this.setHeader(new sap.m.Text({
						text: "Header"
					}));
				}
			},
			aggregations: {
				header: {
					domRef: ":sap-domref"
				}
			},
			properties: {
				minScreenWidth: {
					validator: function () {
						sap.m.Column.prototype._validateMinWidth.apply(null, arguments);
					}
				}
			},
			category: "List"
		});
		// Override getDomRef, otherwise the column cannot be selected in the canvas
		(function() {
			var fnGetDomRef = sap.m.Column.prototype.getDomRef;
			sap.m.Column.prototype.getDomRef = function () {
				var oParent = this.getParent();
				if (oParent instanceof sap.m.Table) {
					var oDomRef = oParent.getDomRef();
					if (oDomRef) {
						// regular columns
						var aAggregation = oParent.getAggregation(this.sParentAggregationName),
							aPartition = _.partition(aAggregation, function (oColumn) {
							return oColumn.isPopin();
						}),
							aPopins = aPartition[0],
							aRegulars = aPartition[1];

						if (this.isPopin()) {
							var n = aPopins.indexOf(this) + 1;
							return $(oDomRef).find("table > tbody > .sapMListTblSubRow > td > .sapMListTblSubCnt > div:nth-child(" + n + ") > .sapMListTblSubCntHdr")[0];
						} else {
							return $(oDomRef).find("table > thead > tr >")[aRegulars.indexOf(this)];
						}
					}
				}
				return fnGetDomRef.apply(this, arguments);
			};
		}());

		Adapter.register("sap.m.ColumnListItem", {
			behavior: {
				constructor: function () {
					this.addCell(new sap.m.Label({
						text: "Cell"
					}));
				},
				validateDropTarget: {
					list: [
						"sap.m.Table"
					]
				}
			},
			aggregations: {
				cells: {
					domRef: ":sap-domref"
				}
			},
			category: "List"
		});

		Adapter.register("sap.m.UploadCollection", {
			category: "Action",
			behavior: {
				constructor: function () {
					var sDate = (new Date()).toDateString();

					this.addItem(new sap.m.UploadCollectionItem({
						fileName: "fileName1",
						contributor: "Contributor1",
						uploadedDate: sDate
					}));
					this.addItem(new sap.m.UploadCollectionItem({
						fileName: "fileName2",
						contributor: "Contributor1",
						uploadedDate: sDate
					}));
					this.addItem(new sap.m.UploadCollectionItem({
						fileName: "fileName3",
						contributor: "Contributor1",
						uploadedDate: sDate
					}));
				}
			},
			aggregations: {
				items: {
					domRef: ":sap-domref > div > ul"
				}
			}
		});

		Adapter.register("sap.m.UploadCollectionItem", {
			defaultSettings: {
				fileName: "fileName",
				contributor: "Contributor",
				uploadedDate: (new Date()).toDateString()
			},
			behavior: {
				validateDropTarget: {
					list: [
						"sap.m.UploadCollection"
					]
				}
			},
			properties: {
				contributor: {
					priority: PRIORITY_IMPORTANT
				},
				fileName: {
					priority: PRIORITY_IMPORTANT
				},
				uploadedDate: {
					priority: PRIORITY_IMPORTANT
				},
				enableEdit: {
					priority: PRIORITY_MEDIUM
				},
				enableDelete: {
					priority: PRIORITY_MEDIUM
				},
				visibleEdit: {
					priority: PRIORITY_MEDIUM
				},
				visibleDelete: {
					priority: PRIORITY_MEDIUM
				}
			},
			category: "Action"
		});
		// Override getDomRef, otherwise the collection item cannot be selected in the canvas
		AdapterUtils.patchDomRef(sap.m.UploadCollectionItem, sap.m.UploadCollection, "div > ul >");

		Adapter.register("sap.m.BusyIndicator", {
			defaultSettings: {
				text: "Please wait..."
			},
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Display"
		});

		Adapter.register("sap.m.Carousel", {
			behavior: {
				constructor: function () {
					this.addPage(new sap.m.Image({
						width: "140px",
						height: "140px"
					}));
					this.addPage(new sap.m.Image({
						width: "140px",
						height: "140px"
					}));
					this.addPage(new sap.m.Image({
						width: "140px",
						height: "140px"
					}));
				}
			},
			aggregations: {
				pages: {
					domRef: ":sap-domref",
					show: function(oPage) {
						this.setActivePage(oPage);
					}
				}
			},
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				}
			},
			css: "Carousel.designtime.css",
			category: "Container"
		});
		AdapterUtils.addEmptyControlBackground(sap.m.Carousel, ["pages"]);

		Adapter.register("sap.m.FeedInput", {
			properties: {
				value: {
					priority: PRIORITY_IMPORTANT
				},
				icon: {
					priority: PRIORITY_MEDIUM
				},
				showIcon: {
					priority: PRIORITY_REGULAR
				}
			},
			category: "User Input"
		});

		Adapter.register("sap.m.MessageStrip", {
			defaultSettings: {
				text: "Information message",
				type: "Information",
				showIcon: true,
				showCloseButton: true
			},
			properties: {
				text: {
					priority: PRIORITY_IMPORTANT
				},
				customIcon: {
					priority: PRIORITY_MEDIUM
				},
				showIcon: {
					priority: PRIORITY_MEDIUM
				},
				type: {
					priority: PRIORITY_MEDIUM
				},
				showCloseButton: {
					priority: PRIORITY_REGULAR
				}
			},
			css: "MessageStrip.designtime.css",
			category: "Container"
		});

		Adapter.register("sap.m.RadioButtonGroup", {
			defaultSettings: {
				selectedIndex: 0,
				columns: 2,
				width: "100%"
			},
			behavior: {
				constructor: function () {
					this.addButton(new sap.m.RadioButton({
						text: "Option 1"
					}));
					this.addButton(new sap.m.RadioButton({
						text: "Option 2"
					}));
				}
			},
			aggregations: {
				buttons: {
					domRef: ":sap-domref"
				}
			},
			properties: {
				columns: {
					priority: PRIORITY_MEDIUM
				},
				selectedIndex: {
					priority: PRIORITY_IMPORTANT
				}
			},
			css: "RadioButtonGroup.designtime.css",
			category: "User Input"
		});
		AdapterUtils.patchEmptyElementRenderer(sap.m.RadioButtonGroup, "sapMRbG", function() {
			if (!this.aRBs) { //remove ui5 optimization
				this.aRBs = [];
			}
			return false; //use original renderer
		});
		// Override getDomRef, otherwise the radio button cannot be selected within the radio button group in the canvas
		AdapterUtils.patchDomRef(sap.m.RadioButton, sap.m.RadioButtonGroup, ".sapMRb");
		AdapterUtils.addEmptyControlBackground(sap.m.RadioButtonGroup, ["buttons"]);

		Adapter.register("sap.m.RatingIndicator", {
			properties: {
				value: {
					priority: PRIORITY_IMPORTANT
				},
				maxValue: {
					priority: PRIORITY_MEDIUM
				}
			},
			category: "User Input"
		});

		Adapter.register("sap.m.ToolbarSeparator", {
			behavior: {
				validateDropTarget: {
					list: [
						"sap.m.Toolbar"
					]
				}
			},
			category: "Container"
		});

		Adapter.register("sap.m.NavContainer", {
			behavior: {
				constructor: function () {
					this.addPage(new sap.m.Page({
						title: "Page 1"
					}));
					this.addPage(new sap.m.Page({
						title: "Page 2"
					}));
				}
			},
			aggregations: {
				pages: {
					domRef: ":sap-domref",
					show: function (oPage) {
						this.to(oPage);
					}
				}
			},
			category: "Container"
		});

		Adapter.register("sap.m.PagingButton", {
			defaultSettings: {
				count: 5
			},
			properties: {
				count: {
					priority: PRIORITY_IMPORTANT
				},
				position: {
					priority: PRIORITY_IMPORTANT
				}
			},
			category: "Action"
		});

		Adapter.register("sap.ui.core.CustomData");

		//------------------------ Adding controls to the outline ----------------------------//
		QuickSupport.addControls(Adapter);

		return Adapter;
	},
	/* bExport= */ true
);
