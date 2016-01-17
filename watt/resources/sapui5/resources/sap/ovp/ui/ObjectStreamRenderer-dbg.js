/**
 * Created by i060586 on 11/25/14.
 */

sap.ui.define(['jquery.sap.global'],

    function(jQuery) {
        "use strict";

        /**
         * Button renderer.
         * @namespace
         */
        var ObjectStreamRenderer = {
        };

        /**
         * Renders the HTML for the given control, using the provided
         * {@link sap.ui.core.RenderManager}.
         *
         * @param {sap.ui.core.RenderManager} oRm
         *            the RenderManager that can be used for writing to
         *            the Render-Output-Buffer
         * @param {sap.ui.core.Control} oButton
         *            the button to be rendered
         */
        ObjectStreamRenderer.render = function(oRm, oControl) {

            if (!oControl.getVisible()) {
                return;
            }

            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("sapOvpObjectStream");
            oRm.writeClasses();
            oRm.write(">");

            /*header*/
            oRm.write('<div class="sapOvpObjectStreamHeader">' + oControl.getTitle() + '</div>');
            oRm.write('<div class="sapOvpObjectStreamClose">');
            oRm.renderControl(oControl._closeIcon);
            oRm.write("</div>");
            /*header*/

            oRm.write('<div id="' + oControl.getId() + '-cont" class="sapOvpObjectStreamCont">');

            oRm.write('<div id="' + oControl.getId() + '-scroll"');
            oRm.addClass("sapOvpObjectStreamScroll");

            oRm.writeClasses();
            oRm.write(">");


            var aContent = oControl.getContent();
            jQuery.each(aContent, function(i, control) {

                oRm.write("<div class='sapOvpObjectStreamItem'>");
                oRm.renderControl(control);
                oRm.write("</div>");
            });

            var placeHolder = oControl.getPlaceHolder();
            if (placeHolder){
                oRm.write("<div class='sapOvpObjectStreamItem'>");
                oRm.renderControl(placeHolder);
                oRm.write("</div>");
            }

            oRm.write("</div>"); // scroll

            oRm.write('<div id="' + oControl.getId() + '-leftedge" class="sapOvpOSEdgeLeft">');
            oRm.renderControl(new sap.ui.core.Icon({src: "sap-icon://slim-arrow-left", useIconTooltip:false}));
            oRm.write('</div>');
            oRm.write('<div id="' + oControl.getId() + '-rightedge" class="sapOvpOSEdgeRight">');
            oRm.renderControl(new sap.ui.core.Icon({src: "sap-icon://slim-arrow-right", useIconTooltip:false}));
            oRm.write('</div>');

            oRm.write("</div>"); // cont
            oRm.write("</div>"); // root

        };

        ObjectStreamRenderer.renderFooterContent = function(oRm, oControl) {

            // overrides this function
        };

        return ObjectStreamRenderer;

    }, /* bExport= */ true);
