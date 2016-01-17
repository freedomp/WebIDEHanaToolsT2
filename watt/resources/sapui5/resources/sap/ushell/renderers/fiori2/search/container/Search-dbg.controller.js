// iteration 0: ok
// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/* global jQuery, sap, console */

(function() {
    "use strict";


    jQuery.sap.require("sap.ushell.renderers.fiori2.search.SearchModel");

    sap.ui.controller("sap.ushell.renderers.fiori2.search.container.Search", {

        onInit: function() {
            var that = this;
            sap.ui.getCore().getEventBus().subscribe("appSearchFinished", that.getView().onAppSearchFinished, that.getView());
            sap.ui.getCore().getEventBus().subscribe("normalSearchFinished", that.getView().onNormalSearchFinished, that.getView());
            sap.ui.getCore().getEventBus().subscribe("allSearchStarted", that.getView().onAllSearchStarted, that.getView());
            sap.ui.getCore().getEventBus().subscribe("allSearchFinished", that.getView().onAllSearchFinished, that.getView());
        },

        onExit: function() {
            var that = this;
            sap.ui.getCore().getEventBus().unsubscribe("appSearchFinished", that.getView().onAppSearchFinished, that.getView());
            sap.ui.getCore().getEventBus().unsubscribe("normalSearchFinished", that.getView().onNormalSearchFinished, that.getView());
            sap.ui.getCore().getEventBus().unsubscribe("allSearchStarted", that.getView().onAllSearchStarted, that.getView());
            sap.ui.getCore().getEventBus().unsubscribe("allSearchFinished", that.getView().onAllSearchFinished, that.getView());
        }

    });
}());
