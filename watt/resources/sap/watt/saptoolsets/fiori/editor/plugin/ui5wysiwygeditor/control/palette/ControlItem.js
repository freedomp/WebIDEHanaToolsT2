define(
	["../../utils/W5gUtils"],
	function (W5gUtils) {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.ControlItem");
		jQuery.sap.require("sap.ui.commons.Image");
		jQuery.sap.require("sap.ui.commons.Label");

// Private variables and methods
// Begin
		/**
		 * @this {sap.ui.commons.Image}
		 * @private
		 */
		function _onError() {
			this.$().addClass("defaultIcon");
		}
// End
// Private variables and methods

		/**
		 * Constructor for a new ControlItem.
		 *
		 * @param {string=} sId id for the new control, generated automatically if no id is given
		 * @param {object=} mSettings initial settings for the new control
		 *
		 * @class
		 * WYSIWYG palette item control
		 * @extends sap.ui.core.Control
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.ControlItem
		 */
		var ControlItem = sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.ControlItem",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.ControlItem.prototype */ {
				metadata: {
					properties: {
						/**
						 * Palette item icon.
						 * Relative or absolute path to URL where the image file is stored.
						 */
						"icon": {"type": "string", "group": "Misc", "defaultValue": null},

						/**
						 * Palette item name.
						 */

						"name": {"type": "string", "group": "Misc", "defaultValue": null},

						/**
						 * Palette item title.
						 */

						"title": {"type": "string", "group": "Misc", "defaultValue": null}
					},
					aggregations: {
						/**
						 * Hidden, for internal use only.
						 */
						"image": {"type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden"},

						/**
						 * Hidden, for internal use only.
						 */
						"label": {"type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden"},

						/**
						 * Hidden, for internal use only.
						 */
						"tooltipImage": {"type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden"}
					},
					events : {

						/**
						 *
						 * Event is fired when the user presses the control.
						 */
						press : {}
					}
				},
				constructor: function () {
					sap.ui.core.Control.apply(this, arguments);

					var oImage = new sap.ui.commons.Image({
						src: this.getIcon()
					});
					oImage.addEventDelegate({
						onAfterRendering: function() {
							this.$().on("error", jQuery.proxy(_onError, this));
						}
					}, oImage);
					this.setAggregation("image", oImage, true);
					this.setAggregation("label", new sap.ui.commons.Label({
						text: this.getTitle(),
						textAlign: sap.ui.core.TextAlign.Begin
					}), true);
					this.setAggregation("tooltipImage", new sap.ui.core.Icon({
						size: "12px",
						src: "sap-icon://question-mark",
						tooltip: new sap.ui.commons.RichTooltip({
							openDelay: 300,
							closeDelay: 0,
							atPosition: "end top",
							title: "{name}",
							text: "{description}"
						}).addStyleClass("sapWysiwygTooltip")
					}).addStyleClass("sapWysiwygPaletteItemTooltip"), true);
				},

				/**
				 * Renders the HTML for the given control <code>oControl</code>, using the provided render manager <code>oRm</code>
				 *
				 * @param {sap.ui.core.RenderManager} oRm
				 *          The render manager that can be used for writing to the render output buffer.
				 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.ControlItem} oControl
				 *          An object representation of the control that should be rendered.
				 */
				renderer: function (oRm, oControl) {
					if (!oControl.getVisible()) {
						return;
					}

					oRm.write("<div");
					oRm.writeControlData(oControl);
					oRm.addClass("sapWysiwygPaletteItem");
					oRm.writeClasses();
					oRm.write("tabindex='0'"); // needed for having focus on DIV
					oRm.write(">");
					oRm.renderControl(oControl.getAggregation("image"));
					oRm.renderControl(oControl.getAggregation("label"));
					oRm.renderControl(oControl.getAggregation("tooltipImage"));
					oRm.write("</div>");
				}
			});

		/**
		 * Function is called when control item is clicked.
		 *
		 * @param {jQuery.Event} oEvent
		 * @private
		 */
		ControlItem.prototype.onclick = function(oEvent) {
			this.firePress({/* no parameters */});

			oEvent.preventDefault();
			oEvent.stopPropagation();
		};

		/**
		 * Setter for property icon.
		 *
		 * @param {string} sIcon icon
		 * @returns {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.ControlItem} this to allow method chaining
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.ControlItem#setIcon
		 * @function
		 * @public
		 */
		ControlItem.prototype.setIcon = function (sIcon) {
			this.getAggregation("image").setSrc(sIcon);
			this.setProperty("icon", sIcon, true);

			return this;
		};

		/**
		 * Setter for property title.
		 *
		 * @param {string} sTitle title
		 * @returns {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.ControlItem} this to allow method chaining
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.ControlItem#setTitle
		 * @function
		 * @public
		 */
		ControlItem.prototype.setTitle = function (sTitle) {
			this.getAggregation("label").setText(sTitle);
			this.setProperty("title", sTitle, true);

			return this;
		};

		/**
		 * Setter for property title.
		 *
		 * @param {boolean} bVisible
		 * @returns {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.ControlItem} this to allow method chaining
		 *
		 * @override sap.ui.core.Control#setVisible
		 */
		ControlItem.prototype.setVisible = function (bVisible) {
			bVisible ? this.$().show() : this.$().hide();
			this.setProperty("visible", bVisible, true);

			return this;
		};

		return ControlItem;
	}
);
