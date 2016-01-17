/*!
 * ${copyright}
 */
/*global jQuery, sap*/
// Provides default renderer for control sap.ushell.ui.shell.ShellLayout
sap.ui.define(['jquery.sap.global'],
    function (jQuery) {
        "use strict";

        /**
         * Shell Layout renderer.
         * @namespace
         */
        var ShellLayoutRenderer = {};

        /**
         * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
         * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
         * @param {sap.ui.core.Control} oShell an object representation of the control that should be rendered
         */
        ShellLayoutRenderer.render = function (rm, oShell) {
            var id = oShell.getId();

            rm.write("<div");
            rm.writeControlData(oShell);
            rm.addClass("sapUshellShell");
            if (oShell._animation) {
                rm.addClass("sapUshellShellAnim");
            }
            if (!oShell.getHeaderVisible()) {
                rm.addClass("sapUshellShellNoHead");
            }
            rm.addClass("sapUshellShellHead" + (oShell._showHeader ? "Visible" : "Hidden"));
            if (oShell.getShowCurtain()) {
                rm.addClass("sapUshellShellCurtainVisible");
            } else {
                rm.addClass("sapUshellShellCurtainHidden");
                rm.addClass("sapUshellShellCurtainClosed");
            }

            rm.writeClasses();
            rm.write(">");

            rm.write("<hr id='", id, "-brand' class='sapUshellShellBrand'/>");

            rm.write("<header id='", id, "-hdr'  class='sapUshellShellHead'><div>");
            rm.write("<div id='", id, "-hdrcntnt' class='sapUshellShellCntnt'>");
            if (oShell.getHeader()) {
                rm.renderControl(oShell.getHeader());
            }
            rm.write("</div>", "</div>", "</header>");
            if (oShell.getToolArea()) {
                rm.write("<aside>");
                rm.renderControl(oShell.getToolArea());
                rm.write("</aside>");
            }

            rm.write("<section id='", id, "-curt' class='sapUshellShellCntnt sapUshellShellCurtain'>");
            rm.write("<div id='", id, "-curtcntnt' class='sapUshellShellCntnt'>");
            rm.renderControl(oShell._curtCont);
            rm.write("</div>");
            rm.write("<span id='", id, "-curt-focusDummyOut' tabindex='0'></span>");
            rm.write("</section>");
            rm.write("<div id='", id, "-cntnt' class='sapUshellShellCntnt sapUshellShellCanvas sapUiGlobalBackgroundColor sapUiGlobalBackgroundColorForce'>");

            rm.write("<div id='", id, "-strgbg' class='sapUshellShellBG" + (oShell._useStrongBG ? " sapUiStrongBackgroundColor" : "") + "'></div>");
            rm.write("<div class='sapUiGlobalBackgroundImage sapUiGlobalBackgroundImageForce sapUshellShellBG'></div>");
            rm.renderControl(oShell._cont);
            rm.write("</div>");

            rm.write("<span id='", id, "-main-focusDummyOut' tabindex='" + (oShell.getShowCurtain() ? 0 : -1) + "'></span>");

            rm.renderControl(oShell._floatingActions);

            rm.write("</div>");
        };

        return ShellLayoutRenderer;

    }, /* bExport= */ true);
