// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview This file handles the resource bundles.
 */

(function () {
    "use strict";
    /*global jQuery, sap */

    // ensure that sap.ushell exists
    jQuery.sap.declare("sap.ushell.resources");

    jQuery.sap.require("sap.ui.model.resource.ResourceModel");

    sap.ushell.resources = { };

    sap.ushell.resources.getTranslationModel = function (sLocale) {
     // create translation resource model
        var oTranslationModel = new sap.ui.model.resource.ResourceModel({
            bundleUrl : jQuery.sap.getModulePath(
                "sap.ushell.renderers.fiori2.resources.resources",
                ".properties"
            ),
            bundleLocale : sLocale
        });
        return oTranslationModel;
    };

    sap.ushell.resources.i18nModel = sap.ushell.resources.getTranslationModel(sap.ui.getCore().getConfiguration().getLanguage());
    sap.ushell.resources.i18n = sap.ushell.resources.i18nModel.getResourceBundle();
}());