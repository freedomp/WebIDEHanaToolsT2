// iteration 0 ok

// define a root UIComponent which exposes the main view
jQuery.sap.declare("sap.ushell.renderers.fiori2.search.container.Component");
jQuery.sap.require("sap.ui.core.UIComponent");

// new Component
sap.ui.core.UIComponent.extend("sap.ushell.renderers.fiori2.search.container.Component", {

    metadata: {

        version: "1.32.6",

        library: "sap.ushell.renderers.fiori2.search.container",

        includes: [],

        dependencies: {
            libs: ["sap.m"],
            components: []
        },
        config: {}
    },

    createContent: function() {
        "use strict";
        return sap.ui.view({
            id: "searchContainerApp",
            viewName: "sap.ushell.renderers.fiori2.search.container.App",
            type: sap.ui.core.mvc.ViewType.JS
        });
    }
});
