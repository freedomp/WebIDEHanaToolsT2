// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's container adapter for standalone demos.
 *
 * @version 1.32.6
 */
/**
 * @namespace Default namespace for Unified Shell adapters for standalone demos. They can usually
 * be placed directly into this namespace, e.g.
 * <code>sap.ushell.adapters.local.ContainerAdapter</code>.
 *
 * @name sap.ushell.adapters.local
 * @see sap.ushell.adapters.local.ContainerAdapter
 * @since 1.15.0
 */
(function () {
    "use strict";
    /*global jQuery, location, sap, window */
    jQuery.sap.declare("sap.ushell.adapters.local.ContainerAdapter");

    jQuery.sap.require("sap.ushell.User");
    jQuery.sap.require("sap.ushell.utils");


    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.services.initializeContainer("local")</code>.
     * Constructs a new instance of the container adapter for standalone demos.
     *
     * @param {sap.ushell.System} oSystem
     *     the logon system (alias, platform, base URL)
     *
     * @class The Unified Shell's container adapter which does the bootstrap for standalone demos.
     *
     * @constructor
     * @see sap.ushell.services.initializeContainer
     * @since 1.15.0
     */
    sap.ushell.adapters.local.ContainerAdapter = function (oSystem, sParameter, oAdapterConfiguration) {

        var oAdapterConfig,
            oUserConfig,
            oUser,
            sKey;

        oAdapterConfig = jQuery.sap.getObject("config", 0, oAdapterConfiguration);
        oUserConfig = { // default values
            id: "DEFAULT_USER",
            firstName: "Default",
            lastName: "User",
            fullName: "Default User",
            accessibility: false,
            isJamActive: false,
            language: "en",
            bootTheme: {
                theme: "sap_bluecrystal",
                root: ""
            },
            setAccessibilityPermitted: true,
            setThemePermitted: true
        };
        for (sKey in oAdapterConfig) {
            if (oAdapterConfig.hasOwnProperty(sKey)) {
                oUserConfig[sKey] = oAdapterConfig[sKey];
            }
        }


        /**
         * Returns the logon system.
         *
         * @returns {sap.ushell.System}
         *     object providing information about the system where the container is logged in
         *
         * @since 1.15.0
         */
        this.getSystem = function () {
            return oSystem;
        };

        /**
         * Returns the logged-in user.
         *
         * @returns {sap.ushell.User}
         *      object providing information about the logged-in user
         *
         * @since 1.15.0
         */
        this.getUser = function () {
            return oUser;
        };

        /**
         * Does the bootstrap for the demo platform (and loads the container's configuration).
         *
         * @returns {jQuery.Deferred}
         *     a promise that is resolved once the bootstrap is done
         *
         * @since 1.15.0
         */
        this.load = function () {
            var aUserCallbackNamespace,
                sUserCallback,
                oUserCallback,
                oDeferredUserCallback,
                oDeferredLoad = new jQuery.Deferred();

            if (oAdapterConfig && typeof oAdapterConfig.setUserCallback === "string") {
                // enables a delayed setting of the displayed user name
                oDeferredUserCallback = new jQuery.Deferred();
                aUserCallbackNamespace = oAdapterConfig.setUserCallback.split(".");
                sUserCallback = aUserCallbackNamespace.pop();
                if (aUserCallbackNamespace.length === 0) {
                    oUserCallback = window;
                } else {
                    oUserCallback = jQuery.sap.getObject(aUserCallbackNamespace.join("."));
                }
                if (oUserCallback && typeof oUserCallback[sUserCallback] === "function") {
                    oUserCallback[sUserCallback](oDeferredUserCallback);
                } else {
                    throw new sap.ushell.utils.Error("ContainerAdapter local platform: Cannot execute setUserCallback - " +
                            oAdapterConfig.setUserCallback);
                }
                oDeferredUserCallback.done(function (oUserNames) {
                    ["id", "firstName", "lastName", "fullName"].forEach(function (val) {
                        if (oUserNames[val] && typeof oAdapterConfig.setUserCallback !== "function") {
                            oUserConfig[val] = oUserNames[val];
                        }
                    });
                    oUser = new sap.ushell.User(oUserConfig);
                    oDeferredLoad.resolve();
                });
            } else {
                oUser = new sap.ushell.User(oUserConfig);
                oDeferredLoad.resolve();
            }
            return oDeferredLoad.promise();
        };

        /**
         * Logs out the current user from this adapter's systems backend system.
         *
         * @param {boolean} bLogonSystem
         *      <code>true</code> if this system is the logon system
         * @returns {jQuery.Deferred}
         *      a <code>jQuery.Deferred</code> object's promise to be resolved when logout is
         *      finished, even when it failed
         * @since 1.15.0
         * @public
         */
        this.logout = function (bLogonSystem) {
            jQuery.sap.log.info("Demo system logged out: " + oSystem.getAlias(), null,
                "sap.ushell.adapters.local.ContainerAdapter");
            reload();
            return (new jQuery.Deferred()).resolve().promise();
        };
    };

    /**
     * For a demo platform logout no redirect happens but a reload is made
     * to take care that the progress indicator is gone.
     *
     * @private
     */
    sap.ushell.utils.testPublishAt(sap.ushell.adapters.local.ContainerAdapter);
    function reload() {
        location.reload();
    }
}());
