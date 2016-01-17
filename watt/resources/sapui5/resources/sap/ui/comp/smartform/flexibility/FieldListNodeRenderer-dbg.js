/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class FieldListNode renderer.
	 * @static
	 */
	var FieldListNodeRenderer = {};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	FieldListNodeRenderer.render = function(oRm, oControl) {

		// write the HTML into the render manager
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapUiCompFieldListNode");
		if (!oControl.getIsVisible()) {
			oRm.addClass("sapUiCompFieldListNodeIsHidden");
		} else {
			oRm.addClass("sapUiCompFieldListNodeIsVisible");
		}
		if (oControl.getIsSelected()) {
			oRm.addClass("sapUiCompFieldListNodeIsSelected");
		}
		oRm.writeClasses();
		oRm.write(">"); // span element
	
		FieldListNodeRenderer.renderLayout(oRm, oControl);
		FieldListNodeRenderer.renderChildren(oRm, oControl);
	
		oRm.write("</div>");
	};
	
	/**
	 * Renders the layout control
	 * 
	 * @param {sap.ui.core.RenderManager} oRm RenderManager
	 * @param {sap.ui.comp.smartform.flexibility.FieldListNode} oControl field list node
	 * @private
	 */
	FieldListNodeRenderer.renderLayout = function(oRm, oControl) {

		oRm.renderControl(oControl._oLayout);
	};
	
	/**
	 * Renders the child nodes
	 * 
	 * @param {sap.ui.core.RenderManager} oRm RenderManager
	 * @param {sap.ui.comp.smartform.flexibility.FieldListNode} oControl field list node
	 * @private
	 */
	FieldListNodeRenderer.renderChildren = function(oRm, oControl) {

		var length, i, aChildren;
		aChildren = oControl.getNodes();
		length = aChildren.length;
		oRm.write('<div class="sapUiCompFieldListNodeBorder">');
		for (i = 0; i < length; i++) {
			oRm.renderControl(aChildren[i]);
		}
		oRm.write("</div>");
	};
	

	return FieldListNodeRenderer;

}, /* bExport= */ true);
