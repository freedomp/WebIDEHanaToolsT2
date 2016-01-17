sap.ui.define(
	function () {
		"use strict";

		/**
		 * @class Wysiwyg renderer.
		 * @static
		 */
		var WysiwygRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		WysiwygRenderer.render = function(oRm, oControl) {
			var sDeviceClass = oControl._getDeviceClass();

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapWysiwygWrapper"); // Needed so that only the inner divs are scrolled
			oRm.addClass(sDeviceClass);
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("<div");
			oRm.addClass("sapWysiwyg");
			oRm.addClass(sDeviceClass);
			oRm.writeAttribute("data-sap-ui-wysiwyg", true);
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl._oIFrame);
			oRm.write("</div>");
			oRm.write("</div>");
		};

		return WysiwygRenderer;
	},
	/* bExport= */ true
);
