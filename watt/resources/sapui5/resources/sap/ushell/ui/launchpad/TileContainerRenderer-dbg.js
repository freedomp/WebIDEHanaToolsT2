// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/*global jQuery, sap*/

(function () {
    "use strict";
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.declare("sap.ushell.ui.launchpad.TileContainerRenderer");

    /**
     * @class TileContainer renderer.
     * @static
     *
     * @private
     */
    sap.ushell.ui.launchpad.TileContainerRenderer = {};

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
    sap.ushell.ui.launchpad.TileContainerRenderer.render = function (oRm, oControl) {
        var aTiles = oControl.getTiles(),
            aHeaderActions = oControl.getHeaderActions(),
            aBeforeContent = oControl.getBeforeContent(),
            aAfterContent = oControl.getAfterContent(),
            aFootItems = oControl.getFooterContent() || [],
            // bHideTileContainer = !oControl.getVisible(),
            bVisibleTileExists = false,
            containerHeight,
            aLinks = oControl.getLinks();

        //WRAPPER start
        oRm.write("<div");
        oRm.writeControlData(oControl);
        oRm.addClass("sapUshellTileContainer");
        oRm.writeClasses();
        oRm.writeAccessibilityState(undefined, {role: "list"});

        oRm.write(">");

        //BEFORE CONTENT start
        if (aBeforeContent.length) {
            oRm.write("<div");
            oRm.addClass("sapUshellTileContainerBeforeContent");
            oRm.writeClasses();
            oRm.write(">");
            jQuery.each(aBeforeContent, function () {
                oRm.renderControl(this);
            });
            oRm.write("</div>");
        }
        //BEFORE CONTENT end

        //CONTENT start
        oRm.write("<div");
        oRm.addClass("sapUshellTileContainerContent");
        if (oControl.getIsGroupLocked()) {
            oRm.addClass("sapUshellTileContainerLocked");
        }
        if (oControl.getDefaultGroup()) {
            oRm.addClass("sapUshellTileContainerDefault");
        }
        if (oControl.getShowBackground()) {
            oRm.addClass("sapUshellTileContainerEditMode");
        }
        oRm.writeClasses();
        oRm.writeAttribute("tabindex", "-1");
        oRm.write(">");
        if (oControl.getShowDragIndicator()) {
            oRm.write("<div");
            oRm.addClass("sapUshellCircleBase");
            oRm.writeClasses();
            oRm.write(">");
            oRm.write("<div");
            oRm.addClass("sapUshellCircle");
            oRm.writeClasses();
            oRm.write(">");
            oRm.write("</div>");
            oRm.write("<div");
            oRm.addClass("sapUshellCircle");
            oRm.writeClasses();
            oRm.write(">");
            oRm.write("</div>");
            oRm.write("<div");
            oRm.addClass("sapUshellCircle");
            oRm.writeClasses();
            oRm.write(">");
            oRm.write("</div>");
            oRm.write("<div");
            oRm.addClass("sapUshellCircle");
            oRm.writeClasses();
            oRm.write(">");
            oRm.write("</div>");
            oRm.write("</div>");
        }

        if (oControl.getShowHeader()) {
            // Title
            oRm.write("<div");
            oRm.addClass("sapUshellTileContainerHeader");
            oRm.writeClasses();

            if (oControl.getIeHtml5DnD() && !oControl.getIsGroupLocked() && !oControl.getDefaultGroup() && oControl.getTileActionModeActive()) {
                oRm.writeAttribute("draggable", "true");
            }

            oRm.writeAccessibilityState(oControl, {label : sap.ushell.resources.i18n.getText("tileContainerHeader")});
            oRm.write(">");
            oRm.write("<div");
            oRm.writeAttribute("id", oControl.getId() + "-title");
            oRm.write(">");
            oRm.write("<");
            oRm.write(oControl.getHeaderLevel().toLowerCase());
            oRm.addClass('sapUshellContainerTitle');
            oRm.addClass("sapUiStrongBackgroundTextColor");
            oRm.writeClasses();

            oRm.writeAttributeEscaped("title", oControl.getHeaderText());
            oRm.writeAccessibilityState(oControl, {label : sap.ushell.resources.i18n.getText("tileContainerTitle") + oControl.getHeaderText()});
            oRm.write(">");
            oRm.writeEscaped(oControl.getHeaderText());
            oRm.write("</");
            oRm.write(oControl.getHeaderLevel().toLowerCase());
            oRm.write(">");
            if (oControl.getShowIcon()) {
                oControl.oIcon.removeStyleClass('sapUshellContainerIconHidden');
            } else {
                oControl.oIcon.addStyleClass('sapUshellContainerIconHidden');
            }
            oRm.renderControl(oControl.oIcon);
            oRm.renderControl(oControl.oEditInputField);
            //Header Actions
            //Header Action Start
            oRm.write("<div");
            oRm.addClass('sapUshellContainerHeaderActions');
            oRm.writeClasses();
            oRm.write(">");

            jQuery.each(aHeaderActions, function () {
                oRm.renderControl(this);
            });
            //Header Action End
            oRm.write("</div>");

            oRm.write("</div>");
            // Title END


            oRm.write("</div>");

        }

        //SORTABLE start
        oRm.write("<div");
        containerHeight = oControl.data('containerHeight');
        if (containerHeight) {
            oRm.writeAttribute("style", 'height:' + containerHeight);
        }
        oRm.addClass('sapUshellTilesContainer-sortable');
        oRm.addClass('sapUshellInner');
        oRm.writeClasses();
        oRm.write(">");

        // Tiles rendering, and checking if there is at lest one visible Tile
        jQuery.each(aTiles, function () {
            if (this.getVisible()) {
                bVisibleTileExists = true;
            }
            if (this.getVisible) {
                oRm.renderControl(this);
            }
        });
        // If no tiles in group or default group
        if (oControl.getShowPlaceholder()) {
            oRm.renderControl(oControl.oPlusTile);
        }

        // hook method to render no data
        if (oControl.getShowNoData()) {
            this.renderNoData(oRm, oControl, !aTiles.length || !bVisibleTileExists);
        }

        //SORTABLE end
        oRm.write("</div>");

        //Links rendering
        if (aLinks.length > 0) {
            if (oControl.getShowBackground() && !(oControl.getIsGroupLocked() && aTiles.length === 0)) {
                //Links Separator start.
                oRm.write("<div");
                oRm.addClass('sapUshellTilesContainerSeparator');
                oRm.writeClasses();
                oRm.write(">");
                //Links Separator end.
                oRm.write("</div>");
            }
            oRm.write("<div");
            oRm.addClass('sapUshellLinksContainer');
            oRm.writeClasses();
            oRm.write(">");

            jQuery.each(aLinks, function () {
                oRm.renderControl(this);
            });

            oRm.write("</div>");
        }

        // FOOTER start
        if (aFootItems.length > 0) {
            oRm.write("<footer");
            oRm.addClass('sapUshellTilesContainerFtr');
            oRm.writeClasses();
            oRm.write(">");
            jQuery.each(aFootItems, function () {
                oRm.renderControl(this);
            });
            oRm.write("</footer>");
        }
        // FOOTER end

        //CONTENT end
        oRm.write("</div>");

        //AFTER CONTENT start
        if (aAfterContent.length) {
            oRm.write("<div");
            oRm.addClass("sapUshellTileContainerAfterContent");
            oRm.writeClasses();
            oRm.write(">");
            jQuery.each(aAfterContent, function () {
                oRm.renderControl(this);
            });
            oRm.write("</div>");
        }
        //AFTER CONTENT end

        //WRAPPER end
        oRm.write("</div>");
    };

    // Rendering a message in case no Tiles are visible after applying the user filter
    sap.ushell.ui.launchpad.TileContainerRenderer.renderNoData = function (oRm, oControl, displayData) {
        oRm.write("<div id='" + oControl.getId() + "-listNoData' class='sapUshellNoFilteredItems sapUiStrongBackgroundTextColor'>");
        if (displayData) {
            if (oControl.getNoDataText()) {
                oRm.writeEscaped(oControl.getNoDataText());
            } else {
                oRm.writeEscaped(oControl.getNoDataText(sap.ushell.resources.i18n.getText("noFilteredItems")));
            }
        } else {
            oRm.writeEscaped("");
        }
        oRm.write("</div>");
    };

}());
