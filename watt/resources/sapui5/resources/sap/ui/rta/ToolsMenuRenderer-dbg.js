/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides default renderer for control sap.ui.rta.ToolsMenu
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	/**
	 * @author SAP SE
	 * @class ToolsMenu renderer.
	 * @static
	 */
	var ToolsMenuRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ToolsMenuRenderer.render = function(oRm, oControl) {
		// write the HTML into the render manager
		oRm.write("<div ");
		oRm.writeClasses();
		oRm.writeControlData(oControl);
		oRm.write(">");
			// render the toolbars
			if (oControl.getToolbars().length !== 0){
				oControl.getToolbars().forEach(function(oCtrl){
					oRm.renderControl(oCtrl);
				});
			} else {
				oRm.write("&nbsp");
			}
		oRm.write("</div>");
	};
	
	return ToolsMenuRenderer;

}, /* bExport= */ true);