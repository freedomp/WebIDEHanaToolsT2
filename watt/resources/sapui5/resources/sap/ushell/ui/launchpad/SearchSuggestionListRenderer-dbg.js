// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function () {
    "use strict";
    /*global jQuery, sap, window */
    /*jslint nomen: true */

    jQuery.sap.declare("sap.ushell.ui.launchpad.SearchSuggestionListRenderer");
    jQuery.sap.require("sap.ui.core.Renderer");
    jQuery.sap.require("sap.m.ListRenderer");

    sap.ushell.ui.launchpad.SearchSuggestionListRenderer = sap.ui.core.Renderer.extend(sap.m.ListRenderer);

    sap.ushell.ui.launchpad.SearchSuggestionListRenderer.renderContainerAttributes = function (rm, oControl) {
        rm.addClass("sapUshellSearchSuggestionList");
    };
}());