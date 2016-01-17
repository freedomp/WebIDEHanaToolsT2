// iteration 0 ok

// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

/* global jQuery, sap */
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchShellHelper');
var SearchShellHelper = sap.ushell.renderers.fiori2.search.SearchShellHelper;

/* global sap */
sap.ui.controller("sap.ushell.renderers.fiori2.search.container.App", {

    onInit: function() {
        "use strict";
        this.oShellNavigation = sap.ushell.Container.getService("ShellNavigation");
        this.oShellNavigation.hashChanger.attachEvent("hashChanged", this.hashChanged);

        if (SearchShellHelper.oSearchFieldGroup === undefined) {
            SearchShellHelper.init();
        }

        sap.ui.getCore().byId('sf').setVisible(false);
        // jQuery('#sf') is undefined in openSearchFieldGroup at this time point
        SearchShellHelper.openSearchFieldGroup(false);
        SearchShellHelper.setSearchFieldGroupInCenter();

        // do not hide search bar, when search app runs
        if (sap.ui.Device.system.tablet || sap.ui.Device.system.phone) {
            sap.ushell.services.AppConfiguration.setHeaderHiding(false);
        }
    },

    hashChanged: function(oEvent) {
        "use strict";
        var model = sap.ushell.renderers.fiori2.search.getModelSingleton();
        model.deserializeURL();
    },

    onExit: function() {
        "use strict";
        this.oShellNavigation.hashChanger.detachEvent("hashChanged", this.hashChanged);
        SearchShellHelper.closeSearchFieldGroup(false);
        SearchShellHelper.setSearchFieldGroupOnSide();
        // allow to hide search bar, when search app exits
        if (sap.ui.Device.system.tablet || sap.ui.Device.system.phone) {
            sap.ushell.services.AppConfiguration.setHeaderHiding(true);
        }
        if (this.oView.oPage.oFacetDialog) {
            //            this.oView.oPage.oFacetDialog.close();
            this.oView.oPage.oFacetDialog.destroy();
        }
    }

});
