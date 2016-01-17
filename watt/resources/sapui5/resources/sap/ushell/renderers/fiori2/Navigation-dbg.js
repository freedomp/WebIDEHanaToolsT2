// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function () {
    "use strict";
    /*global jQuery, sap, window */
    /*jslint nomen: true */
    jQuery.sap.declare("sap.ushell.renderers.fiori2.Navigation");

    sap.ushell.renderers.fiori2.Navigation = function () {
        //OBSOLETE FOR NOW: search is not part of the navigation
        this.SEARCH = {
            ID : "ShellSearch",
            SEMANTICOBJECT : "shell",
            ACTION : "search"
        };
        sap.ushell.Container.getService("NavTargetResolution").registerCustomResolver({
            name : "Search App Container",
            isApplicable : function (sHashFragment) {
                return sHashFragment === "#Action-search";
            },
            resolveHashFragment : function (sHashFragment) {
                var oDeferred = new jQuery.Deferred(),
                    res = {};
                if (sHashFragment === "#Action-search") {
                    res = {
                        "additionalInformation": "SAPUI5.Component=sap.ushell.renderers.fiori2.search.container",
                        "applicationType": "URL",
                        "url": jQuery.sap.getResourcePath("sap/ushell/renderers/fiori2/search/container")
                    };
                }
                oDeferred.resolve(res);
                return oDeferred.promise();
            }
        });
    };

    //custom resolver for the default FLP intent and for the old catalog intent
    sap.ushell.Container.getService("NavTargetResolution").registerCustomResolver({
        name : "FLP Resolver",
        isApplicable : function (sHashFragment) {
            return sHashFragment === "#Shell-home" || sHashFragment === "#shell-catalog";
        },
        resolveHashFragment : function (sHashFragment) {
            var oDeferred = new jQuery.Deferred(),
                res = {};
            if (sHashFragment === "#Shell-home" || sHashFragment === "#shell-catalog") {
                res = {
                    "additionalInformation": "SAPUI5.Component=sap.ushell.components.flp",
                    "applicationType": "URL",
                    "url": jQuery.sap.getResourcePath("sap/ushell/components/flp")
                };
            }
            oDeferred.resolve(res);
            return oDeferred.promise();
        }
    });

    sap.ushell.renderers.fiori2.Navigation = new sap.ushell.renderers.fiori2.Navigation();
}());
