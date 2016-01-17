(function() {
    "use strict";

    sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchResultListContainer", {


        metadata: {
            aggregations: {
                "topList": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "bottomList": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "tabStrips": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "filterBar": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "noResultScreen": {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
            }
        },

        renderer: function(oRm, oControl) {
            // inner div for results
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUshellSearchResultListsContainer");
            oRm.writeClasses();
            if (sap.ui.Device.system.desktop) {
                if (oControl.getModel() && oControl.getModel().getFacetVisibility() === true) {
                    oRm.write('style="padding-left:1rem;"');
                } else {
                    oRm.write('style="padding-left:2rem;"');
                }
            }
            oRm.write('>');

            // render filter bar
            oRm.renderControl(oControl.getFilterBar());

            // render main header
            oRm.renderControl(oControl.getNoResultScreen());

            // render tabstrips
            oRm.renderControl(oControl.getTabStrips());

            //render top list
            oRm.renderControl(oControl.getTopList());

            // render bottom list
            oRm.renderControl(oControl.getBottomList());

            /// close inner div for results
            oRm.write("</div>");

        }
    });
})();
