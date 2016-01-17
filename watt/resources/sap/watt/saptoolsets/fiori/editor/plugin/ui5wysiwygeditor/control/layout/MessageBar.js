define(
	[
		"sap/watt/lib/lodash/lodash",
		"../../utils/W5gUtils",
		"./SelectionPath"
	],
	function (_, W5gUtils, SelectionPath) {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.MessageBar");

		/**
		 * Constructor for a new MessageBar.
		 *
		 * @param {string=} sId id for the new control, generated automatically if no id is given
		 * @param {object=} mSettings initial settings for the new control
		 *
		 * @class
		 * WYSIWYG message bar control
		 * @extends sap.ui.core.Control
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.MessageBar
		 */
		var MessageBar = sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.MessageBar",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.MessageBar.prototype */ {
			metadata: {
				properties: {
					/**
					 * Current selected control
					 */
					"selection": {"type": "object", "group": "Data", "defaultValue": null}
				},
				aggregations: {
					/**
					 * Hidden, for internal use only.
					 */
					"path": {
						"type": "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.SelectionPath", "multiple": false,
						"visibility": "hidden"
					}
				},
				events: {
					/**
					 * Event is fired when the user presses the navigation breadcrumb.
					 */
					navigate: {
						parameters: {
							/**
							 * The breadcrumb id which fired the navigate.
							 */
							controlId: {type: "string"}
						}
					}
				}
			},
			constructor: function () {
				sap.ui.core.Control.apply(this, arguments);

				var that = this;

				this.setAggregation("path", new SelectionPath({
					navigate: function (oEvent) {
						that.fireNavigate({
							controlId: oEvent.getParameter("pathId")
						});
					}
				}));
			},

			/**
			 * Renders the HTML for the given control <code>oControl</code>, using the provided render manager <code>oRm</code>
			 *
			 * @param {sap.ui.core.RenderManager} oRm
			 *          The render manager that can be used for writing to the render output buffer.
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.MessageBar} oControl
			 *          An object representation of the control that should be rendered.
			 */
			renderer: function (oRm, oControl) {
				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.addClass("messageArea");
				oRm.writeClasses();
				oRm.write(">");

				oRm.renderControl(oControl.getAggregation("path"));

				oRm.write("</div>");
			}
		});

		/**
		 * Setter for property selection.
		 *
		 * @param {sap.ui.core.Control} oControl property value
		 * @returns {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.MessageBar} this to allow method chaining
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.MessageBar#setSelection
		 * @function
		 * @public
		 */
		MessageBar.prototype.setSelection = function (oControl) {
			this.setProperty("selection", oControl, true);

			var aPath = [];

			var oOverlay = W5gUtils.getControlOverlay(oControl);
			while (oOverlay) {
				oControl = oOverlay.getElementInstance();
				aPath.push({
					id: oControl.getId(),
					name: W5gUtils.getControlTitle(oControl)
				});
				oOverlay = oOverlay.getParentElementOverlay();
			}

			if (aPath.length) { //replace the root name
				aPath = aPath.reverse();
				aPath[0].name = "View"; //XML View
			}

			this.getAggregation("path").setPath(aPath);
			return this;
		};

// QUnit API Methods
// Begin
		/**
		 * Gets the current selection path
		 * @returns {Array<string>} Returns selection path as array of strings
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.MessageBar#getText
		 * @function
		 * @public
		 */
		MessageBar.prototype.__QUnit_getPath = function () {
			return _.pluck(this.getAggregation("path").getPath(), "name");
		};
// End
// QUnit API Methods

		return MessageBar;
	}
);