/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class VariantManagement renderer.
	 * @static
	 */
	var VariantManagementRenderer = {};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	VariantManagementRenderer.render = function(oRm, oControl) {
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.addClass("sapUiCompVarMngmt");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl.oVariantLayout);
		oRm.write("</div>");
	};
	

	return VariantManagementRenderer;

}, /* bExport= */ true);
