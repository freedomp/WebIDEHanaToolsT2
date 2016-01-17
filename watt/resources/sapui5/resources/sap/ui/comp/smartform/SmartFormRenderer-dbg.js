/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/layout/form/Form'],
	function(jQuery, Form) {
	"use strict";


	/**
	 * @class SmartForm renderer.
	 * @static
	 */
	var SmartFormRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *          oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control}
	 *          oControl an object representation of the control that should be rendered
	 */
	SmartFormRenderer.render = function(oRm, oControl) {

		var oToolbar = oControl._getCustomToolbar() || oControl._oToolbar;

		if (oControl.mProperties["expandable"]) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapUiCompSmartForm");
			oRm.writeClasses();
			oRm.write(">"); // div element
			oRm.renderControl(oControl._oPanel);
			oRm.write("</div>");
		} else {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapUiCompSmartForm");
			oRm.writeClasses();
			oRm.write(">"); // span element
			if (oToolbar) {
				oRm.renderControl(oToolbar);
			}
			oRm.renderControl(oControl._oForm);
			oRm.write("</div>");
		}
	};

	return SmartFormRenderer;

}, /* bExport= */ true);
