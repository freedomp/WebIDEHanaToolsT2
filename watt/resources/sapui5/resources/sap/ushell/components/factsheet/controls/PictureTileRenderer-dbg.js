/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
*/

jQuery.sap.declare("sap.ushell.components.factsheet.controls.PictureTileRenderer");
jQuery.sap.require("sap.m.CustomTileRenderer");

/**
 * @class PictureTile renderer. 
 * @static
 */

sap.ushell.components.factsheet.controls.PictureTileRenderer = sap.ui.core.Renderer.extend(sap.m.CustomTileRenderer);

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */

 sap.ushell.components.factsheet.controls.PictureTileRenderer.render = function(oRm, oControl) {

	jQuery.sap.log.debug("PictureTileRenderer :: begin rendering");
	
	oRm.write("<div ");
	oRm.writeControlData(oControl);

	oRm.addClass("sapCaUiPictureTile");
	oRm.writeClasses();

	oRm.write(">");
	
	
	oRm.write("<div");
	oRm.addClass("sapCaUiPictureTileContent");
	oRm.writeClasses();
	oRm.write(">");

	oRm.write("<div id='" + oControl.getId() + "-wrapper'>");
	
	oRm.renderControl(oControl._oDeletePictureButton);
	
	this._renderContent(oRm, oControl);
	oRm.write("</div>");
	
	oRm.write("</div></div>");
};

sap.ushell.components.factsheet.controls.PictureTileRenderer._renderContent = function(rm, oTile) {
	rm.renderControl(oTile.getContent());
};
