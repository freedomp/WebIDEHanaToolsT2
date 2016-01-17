/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define([	"jquery.sap.global" ], function(jQuery) { // EXC_JSHINT_002
	"use strict";

	/**
	 * @class ValueHelpDialog renderer.
	 * @static
	 */
	var SmartFieldRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered.
	 * @public
	 */
	SmartFieldRenderer.render = function(oRm, oControl) {
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.addClass("sapUiCompSmartField");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl.getAggregation("_content"));
		oRm.write("</div>");
	};

	return SmartFieldRenderer;

}, /* bExport= */true);
