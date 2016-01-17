/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global', 'sap/m/LinkRenderer'],
	function(jQuery, LinkRenderer) {
	"use strict";


	/**
	 * @class SmartLink renderer. 
	 * @static
	 */
	var SmartLinkRenderer = {}; // = sap.ui.core.Renderer.extend(sap.m.LinkRenderer);
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be rendered.
	 *            
	 * @public
	 */
	SmartLinkRenderer.render = function(oRm, oControl) {
		var bRenderLink = true;
		
		if (oControl.getIgnoreLinkRendering()){
			var oReplaceControl = oControl._getInnerControl();
			if (oReplaceControl){
				oRm.write("<div ");
				oRm.writeControlData(oControl);		
				oRm.writeClasses();
				oRm.write(">");
			
				oRm.renderControl(oReplaceControl);				
			
				oRm.write("</div>");
				
				bRenderLink = false;
			}
		} 
		
		if (bRenderLink){
			LinkRenderer.render.call("", oRm, oControl);
		}
	};
	

	return SmartLinkRenderer;

}, /* bExport= */ true);
