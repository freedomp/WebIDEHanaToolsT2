/* global $ */
(function() {
    "use strict";

    jQuery.sap.require("sap.ui.core.format.NumberFormat");
    sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchNoResultScreen", {


        metadata: {
            properties: {
                searchBoxTerm: "string"
            }
        },

        renderer: function(oRm, oControl) {

            var escapedSearchTerm = $('<div>').text(oControl.getSearchBoxTerm()).html();
            oRm.write('<div class="sapUshellSearch-no-result"');
            oRm.writeControlData(oControl);
            oRm.write('>');
            oRm.write('<div class="sapUshellSearch-no-result-icon">');
            oRm.writeIcon(sap.ui.core.IconPool.getIconURI("travel-request"));
            oRm.write('</div><div class="sapUshellSearch-no-result-text">');
            oRm.write('<div class="sapUshellSearch-no-result-info">' + sap.ushell.resources.i18n.getText("no_results_info").replace('&1', escapedSearchTerm) + '</div>');
            oRm.write('<div class="sapUshellSearch-no-result-tips">' + sap.ushell.resources.i18n.getText("no_results_tips") + '</div> ');
            oRm.write('</div></div>');

        }
    });
})();
