// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's ClientSideTargetResolutionAdapter for the local
 *               platform.
 *
 * @version
 * 1.32.6
 */
(function () {
    "use strict";
    /*jslint nomen: true*/
    /*global jQuery, sap, setTimeout */
    jQuery.sap.declare("sap.ushell.adapters.local.ClientSideTargetResolutionAdapter");

    /**
     * Constructs a new instance of the ClientSideTargetResolutionAdapter for the local
     * platform
     *
     * @param {object} oSystem
     *   The system served by the adapter
     * @param {string} sParameters
     *   Parameter string, not in use
     * @param {object} oConfig
     *   A potential adapter configuration
     *
     * @constructor
     * @since 1.32.0
     * @private
     */
    sap.ushell.adapters.local.ClientSideTargetResolutionAdapter = function (oSystem, sParameters, oConfig) {
        this._oConfig = oConfig && oConfig.config;
    };

    /**
     * Getter for the canonic Target Mapping responses
     *
     * @returns {object}
     *   A jQuery promise, whose done function receives the canonic Target Mappings as fist
     *   parameter
     *
     * @since 1.32.0
     * @private
     */
    sap.ushell.adapters.local.ClientSideTargetResolutionAdapter.prototype.getInbounds = function () {
        var oDeferred = new jQuery.Deferred();
//            oSrvc = sap.ushell.Container.getService("LaunchPage");
// TODO         oSrvc._getAdapter().readTargetMappingsCanonic().done(function(oCanonic) {
        oDeferred.resolve([]);
//        }).fail(oDeferred.reject.bind(oDeferred));
        return oDeferred.promise();
    };

}());
