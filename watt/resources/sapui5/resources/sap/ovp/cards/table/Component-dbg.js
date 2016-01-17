(function () {
    "use strict";
    /*global jQuery, sap */

    jQuery.sap.declare("sap.ovp.cards.table.Component");
    jQuery.sap.require("sap.ovp.cards.generic.Component");

    sap.ovp.cards.generic.Component.extend("sap.ovp.cards.table.Component", {
        // use inline declaration instead of component.json to save 1 round trip
        metadata: {
            properties: {
                "contentFragment": {
                    "type": "string",
                    "defaultValue": "sap.ovp.cards.table.Table"
                },
                "annotationPath": {
                    "type": "string",
                    "defaultValue": "com.sap.vocabularies.UI.v1.LineItem"
                },
                "footerFragment": {
                    "type": "string",
                    "defaultValue": "sap.ovp.cards.generic.CountFooter"
                }
            },

            version: "1.32.5",

            library: "sap.ovp",

            includes: [],

            dependencies: {
                libs: [ "sap.m" ],
                components: []
            },
            config: {},
            customizing: {
                "sap.ui.controllerExtensions": {
                    "sap.ovp.cards.generic.Card": {
                        controllerName: "sap.ovp.cards.table.Table"
                    }
                }
            }
        }
    });
})();

