// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview The Search adapter for the demo platform.
 *
 * @version 1.32.6
 */
(function () {
    "use strict";
    /*global jQuery, sap, window */
    jQuery.sap.declare("sap.ushell.adapters.local.SearchAdapter");

    window.sap.bc = window.sap.bc || {};
    window.sap.bc = {ina : {api: {sina: {properties: {systemType: "ABAP", startWithSearch : "false" , noSapClientFromUrl: true}}}}};
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.esh.api.release.sina");

    /**
     *
     * @param oSystem
     * @returns {sap.ushell.adapters.abap.SearchAdapter}
     */
    sap.ushell.adapters.local.SearchAdapter = function (oSystem, sParameter, oAdapterConfiguration) {

        this.isSearchAvailable = function () {
            var oDeferred = jQuery.Deferred();
            oDeferred.resolve(true);
            return oDeferred.promise();
        };

        this.getSina = function(){
            return sap.bc.ina.api.sina;
        };

    };
}());
