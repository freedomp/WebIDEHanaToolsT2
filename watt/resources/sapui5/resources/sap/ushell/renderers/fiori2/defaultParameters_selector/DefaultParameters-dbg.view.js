(function () {
    "use strict";
    /*global jQuery, sap, document, self */
    /*jslint plusplus: true, nomen: true, vars: true */

    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.services.Container");
    jQuery.sap.require("sap.ui.comp.smartform.SmartForm");
    jQuery.sap.require("sap.ui.comp.smartfield.SmartField");

    sap.ui.jsview("sap.ushell.renderers.fiori2.defaultParameters_selector.DefaultParameters", {

        createContent: function (oController) {

        },

        getControllerName: function () {
            return "sap.ushell.renderers.fiori2.defaultParameters_selector.DefaultParameters";
        }


    });

}());