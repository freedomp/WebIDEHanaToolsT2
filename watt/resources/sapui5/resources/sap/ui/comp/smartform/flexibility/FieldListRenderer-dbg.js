/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class FieldList renderer.
	 * @static
	 */
	var FieldListRenderer = {};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.comp.smartform.flexibility.FieldList} oControl an object representation of the control that should be rendered
	 */
	FieldListRenderer.render = function(oRm, oControl) {

		// write the HTML into the render manager
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapUiCompFieldList");
		oRm.writeClasses();
		oRm.write(">"); // span element
	
		FieldListRenderer.renderNodes(oRm, oControl);
	
		oRm.write("</div>");
	};
	
	/**
	 * Renders the child nodes from the aggregation nodes
	 * 
	 * @param {sap.ui.core.RenderManager} oRm RenderManager
	 * @param {sap.ui.comp.smartform.flexibility.FieldList} oControl field list node
	 * @private
	 */
	FieldListRenderer.renderNodes = function(oRm, oControl) {

		var aNodes, length, i;
		aNodes = oControl.getNodes();
		length = aNodes.length;
		for (i = 0; i < length; i++) {
			oRm.renderControl(aNodes[i]);
		}
	};
	

	return FieldListRenderer;

}, /* bExport= */ true);
