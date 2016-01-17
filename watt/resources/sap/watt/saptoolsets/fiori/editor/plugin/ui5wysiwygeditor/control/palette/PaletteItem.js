define(
	["../../utils/W5gUtils", "./ControlItem"],
	function (W5gUtils, ControlItem) {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.PaletteItem");
		jQuery.sap.require("sap.ui.commons.Image");
		jQuery.sap.require("sap.ui.commons.Label");

		/**
		 * Constructor for a new PaletteItem.
		 *
		 * @param {string=} sId id for the new control, generated automatically if no id is given
		 * @param {object=} mSettings initial settings for the new control
		 *
		 * @class
		 * WYSIWYG palette item control
		 * @extends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.ControlItem
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.PaletteItem
		 */
		var PaletteItem = ControlItem.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.PaletteItem",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.PaletteItem.prototype */ {
			metadata: {
				library: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe",
				properties: {
					/**
					 * Reference to iframe window object if any.
					 */
					"window": {"type": "object", "group": "Misc", "defaultValue": null},

					/**
					 * Reference to design time object if any.
					 */
					"designTime": {"type": "object", "group": "Misc", "defaultValue": null}
				}
			},

			renderer: {}
		});

		/**
		 * Makes item draggable
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.PaletteItem#onAfterRendering
		 * @function
		 * @public
		 */
		PaletteItem.prototype.onAfterRendering = function () {
			var that= this;
			var oOverlay;
			var oWindow = this.getWindow();
			this.$().attr("draggable", true).on("dragstart", function() {
				var oInstance = W5gUtils.createControl(that.getName(), oWindow, that.getDesignTime());
				oOverlay = that.getDesignTime().createOverlayFor(oInstance);
				oOverlay.setDraggable(true);
				//TODO find better way (Mikhail)
				oOverlay.placeAt("overlay-container");
				oWindow.sap.ui.getCore().applyChanges();
				oOverlay.$().trigger("dragstart");
				W5gUtils.closeW5gTooltips();
			}).on("dragend", function () {
				oOverlay.$().trigger("dragend");
			});
		};

		/**
		 * Cleans up the element instance before destruction.
		 *
		 * @override sap.ui.core.Element#exit
		 */
		PaletteItem.prototype.exit = function () {
			this.setWindow(null);
			this.setDesignTime(null);
		};

		/**
		 * Rebind control to new window instance
		 *
		 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette} oPalette
		 * @returns {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.PaletteItem} this to allow method chaining
		 *
		 */
		PaletteItem.prototype.rebind = function (oPalette) {
			this.setWindow(oPalette.getWindow());
			this.setDesignTime(oPalette.getDesignTime());
			this.onAfterRendering();
			return this;
		};

		return PaletteItem;
	}
);
