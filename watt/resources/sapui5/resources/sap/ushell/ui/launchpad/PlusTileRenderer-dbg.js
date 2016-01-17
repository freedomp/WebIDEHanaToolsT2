// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/*global jQuery, sap*/
/**
 * @class PlusTile renderer.
 * @static
 * 
 * @private
 */
(function () {
    "use strict";
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.declare("sap.ushell.ui.launchpad.PlusTileRenderer");

    /**
     * @class PlusTile renderer.
     * @static
     */
    sap.ushell.ui.launchpad.PlusTileRenderer = {};
    var translationBundle = sap.ushell.resources.i18n;

    /**
     * Renders the HTML for the given control, using the provided
     * {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render
     *            output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be
     *            rendered
     */
    sap.ushell.ui.launchpad.PlusTileRenderer.render = function (oRm, oControl) {
        oRm.write("<div");
        oRm.writeAttribute("tabindex", "-1");
        oRm.writeControlData(oControl);
        oRm.addClass("sapUshellTile");
        oRm.addClass("sapUshellPlusTile");
        oRm.writeClasses();
        oRm.writeAccessibilityState(oControl, {label : translationBundle.getText("TilePlus_label")});
        oRm.write(">");
        oRm.renderControl(oControl.oIcon);

        oRm.write("</div>");
    };
}());
