/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
*/

jQuery.sap.declare("sap.ushell.components.factsheet.controls.PictureViewerRenderer");

jQuery.sap.require("sap.m.TileContainerRenderer");


/**
 * @class PictureViewer renderer.
 * @static
 */
sap.ushell.components.factsheet.controls.PictureViewerRenderer = {};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.ushell.components.factsheet.controls.PictureViewerRenderer.render = function(oRm, oControl) {
	// write the HTML into the render manager	
	jQuery.sap.log.debug("PictureViewerRenderer :: begin rendering");

	sap.m.TileContainerRenderer.render(oRm, oControl);

    jQuery.sap.log.debug("PictureViewerRenderer :: end rendering");
};
