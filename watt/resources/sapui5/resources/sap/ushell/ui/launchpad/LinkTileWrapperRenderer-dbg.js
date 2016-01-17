// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/*global jQuery, sap*/

(function () {
    "use strict";
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.declare("sap.ushell.ui.launchpad.LinkTileWrapperRenderer");

    /**
     * @class LinkTileWrapper renderer.
     * @static
     *
     * @private
     */
    sap.ushell.ui.launchpad.LinkTileWrapperRenderer = {};
    // var translationBundle = sap.ushell.resources.i18n;

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
    sap.ushell.ui.launchpad.LinkTileWrapperRenderer.render = function (oRm, oControl) {
        var oTileView = null, oModel = oControl.getModel(),
            sTileViewId;
        try {
            oTileView = oControl.getTileViews()[0];
        } catch (ex) {
            jQuery.sap.log.warning("Failed to load tile view: ", ex.message);
            oTileView = new sap.m.Text({ text: "Failed to load. "});
        }
        sTileViewId = oTileView && oTileView.getId() ? oTileView.getId() : '';
        oRm.write("<div");

        // if xRay is enabled
        if (oModel && oModel.getProperty("/enableHelp")) {
            // currently only the Tile (and the Tile's footer) has a data attribute in teh xRay integration
            // (as using this value as a class value instead as done in all of the static elements causes parsing errors in the xRay hotspot definition flow)
            oRm.writeAttribute("data-tileCatalogId", oControl.getTileCatalogId());// xRay support
        }
        oRm.writeControlData(oControl);
        oRm.addClass("sapUshellLinkTile");
        if (!oControl.getVisible()) {
            oRm.addClass("sapUshellHidden");
        }
        //TODO:Check this
        if (oControl.getIsLocked()) {
            oRm.addClass("sapUshellLockedTile");
        }
        oRm.writeClasses();
        if (oControl.getIeHtml5DnD()) {
            oRm.writeAttribute("draggable", "true");
        }
        oRm.writeAttributeEscaped("tabindex", "-1");
        var layoutPosition = oControl.data('layoutPosition');
        if (layoutPosition) {
            var stylePosition = '-webkit-transform:' + layoutPosition.translate3D + ';-ms-transform:' + layoutPosition.translate2D + ';transform:' + layoutPosition.translate3D;
            oRm.writeAttribute("style", stylePosition);
        }
        //oRm.writeAccessibilityState(oControl, {role : 'link', label : translationBundle.getText("TileDetails_lable")});
        oRm.writeAttributeEscaped("aria-flowto", sTileViewId);
        oRm.write(">");

        // Tile Content
        oRm.addClass("sapUshellTileInner");

        if (this.renderTileView) {
            this.renderTileView(oRm, oTileView, oControl.getTarget());
        }

        oRm.write("</div>");
    };

    sap.ushell.ui.launchpad.LinkTileWrapperRenderer.renderTileView = function (oRm, oTileView, sTarget) {
        if ((sTarget || "") !== "") {
            oRm.write("<a");
            oRm.writeClasses();
            oRm.writeAttributeEscaped("href", "#" + sTarget);
            oRm.write(">");
            oRm.renderControl(oTileView);
            oRm.write("</a>");
        } else {
            oRm.write("<div");
            oRm.writeClasses();
            oRm.writeAttribute("title", oTileView.getText ? oTileView.getText() : '');
            oRm.write(">");
            oRm.renderControl(oTileView);
            oRm.write("</div>");
        }
    };

}());
