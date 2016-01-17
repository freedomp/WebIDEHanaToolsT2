/*!
 * ${copyright}
 */
/*global sap*/
// Provides default renderer for control sap.ushell.ui.shell.ShellOverlay
sap.ui.define(['jquery.sap.global'],
    function (jQuery) {
        "use strict";


    /**
     * ShellOverlay renderer.
     * @namespace
     */
        var ShellOverlayRenderer = {};

        /**
         * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
         * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
         * @param {sap.ui.core.Control} oShell an object representation of the control that should be rendered
         */
        ShellOverlayRenderer.render = function (rm, oControl) {
            rm.write("<div");
            rm.writeControlData(oControl);
            rm.addClass("sapUshellShellOvrly");
            if (oControl._opening) {
                rm.addClass("sapUshellShellOvrlyCntntHidden");
                rm.addClass("sapUshellShellOvrlyOpening");
            }

            if (oControl._getAnimActive()) {
                rm.addClass("sapUshellShellOvrlyAnim");
            }
            rm.writeClasses();
            rm.write("><div>");

            rm.write("<header class='sapUshellShellOvrlyHead'>");
            rm.write("<hr class='sapUshellShellOvrlyBrand'/>");
            rm.write("<div class='sapUshellShellOvrlyHeadCntnt'>");
            rm.write("<div id='" + oControl.getId() + "-hdr-center' class='sapUshellShellOvrlyHeadCenter'>");
            ShellOverlayRenderer.renderSearch(rm, oControl);
            rm.write("</div>");
            //var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui"),
            //sCloseTxt = rb.getText("SHELL_OVERLAY_CLOSE");
            var sCloseTxt = sap.ushell.resources.i18n.getText("SHELL_OVERLAY_CLOSE");

            rm.write("<a tabindex='0' href='javascript:void(0);' id='" + oControl.getId() + "-close' class='sapUshellShellOvrlyHeadClose'");
            rm.writeAttributeEscaped("title", sCloseTxt);
            rm.write(">");
            rm.writeEscaped(sCloseTxt);
            rm.write("</a></div></header>");
            rm.write("<div id='" + oControl.getId() + "-cntnt' class='sapUshellShellOvrlyCntnt'>");
            ShellOverlayRenderer.renderContent(rm, oControl);
            rm.write("</div>");

            rm.write("</div></div>");
        };

        ShellOverlayRenderer.renderSearch = function (rm, oControl) {
            var iWidth = oControl._getSearchWidth();
            var sStyle = "";
            if (iWidth > 0 && oControl._opening) {
                sStyle = "style='width:" + iWidth + "px'";
            }

            rm.write("<div id='" + oControl.getId() + "-search' class='sapUshellShellOvrlySearch' " + sStyle + "><div>");
            var oSearch = oControl.getSearch();
            if (oSearch) {
                rm.renderControl(oSearch);
            }
            rm.write("</div></div>");
        };

        ShellOverlayRenderer.renderContent = function (rm, oControl) {
            rm.write("<div>");
            var aContent = oControl.getContent();
            for (var i = 0; i < aContent.length; i++) {
                rm.renderControl(aContent[i]);
            }
            rm.write("</div>");
        };

        return ShellOverlayRenderer;

    }, /* bExport= */ true);
