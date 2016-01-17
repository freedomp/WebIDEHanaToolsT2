// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview The SupportTicket adapter for the local platform.
 *
 * @version 1.32.6
 */
(function () {
    "use strict";
    /*global jQuery, sap */
    jQuery.sap.declare("sap.ushell.adapters.local.SupportTicketAdapter");

    sap.ushell.adapters.local.SupportTicketAdapter = function (oSystem, sParameter, oAdapterConfiguration) {

        this.createTicket = function (oSupportObject) {
            var oDeferred = new jQuery.Deferred(),
                sTicketId = "1234567";

            oDeferred.resolve(sTicketId);
            return oDeferred.promise();
        };

    };
}());
