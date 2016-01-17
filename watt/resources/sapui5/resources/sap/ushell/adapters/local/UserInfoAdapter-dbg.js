// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview The UserInfo adapter for the demo platform.
 *
 * @version 1.32.6
 */
(function () {
    "use strict";
    /*global jQuery, sap */
    jQuery.sap.declare("sap.ushell.adapters.local.UserInfoAdapter");

    jQuery.sap.require("sap.ui.thirdparty.datajs");
    //jQuery.sap.require("sap.ushell.shells.demo.fioriDemoConfig");

    /**
     * This demo adapter reads its configuration from the demo config, where the target applications are defined.
     *
     * @param oSystem
     * @returns {sap.ushell.adapters.abap.UserInfoAdapter}
     */
    sap.ushell.adapters.local.UserInfoAdapter = function (oUnused, sParameter, oAdapterConfiguration) {

        var oUserThemeConfiguration;

        /**
         * Generates the theme configuration for the user based on the external configuration
         * provided in window['sap-ushell-config'].
         *
         * @param {object}
         *     the configuration specified by the user externally
         *
         * @returns {object}
         *     the theme configuration array for getThemeList method
         *
         * @private
         */
        function generateThemeConfiguration(oAdapterThemesConfiguration) {
            var defaultConfig = [
                    { id: "sap_bluecrystal", name: "sap_bluecrystal" }
                ],
                externalConfig = jQuery.sap.getObject(
                    "config.themes",
                    undefined,
                    oAdapterThemesConfiguration
                );

            return externalConfig === undefined ? defaultConfig : externalConfig;
        }

        this.updateUserPreferences = function (oUSer) {
            var oDeferred = new jQuery.Deferred();

            jQuery.sap.log.info("updateUserPreferences: " + oUSer);
            // var curUser = sap.ushell.Container.getUser();
            // var originTheme = curUser.getSelectedTheme();
            // curUser.setSelectedTheme(selectedTheme);

            oDeferred.resolve({
                status: 200
            });
            // oDeferred.reject("Could not resolve link '" + sHashFragment + "'");
            //   curUser.setUserSelectedTheme(originTheme);

            return oDeferred.promise();
        };

        this.getThemeList = function () {
            var oDeferred = new jQuery.Deferred();

            jQuery.sap.log.info("getThemeList");

            // make sure a configuration is available
            if (oUserThemeConfiguration === undefined) {
                oUserThemeConfiguration = generateThemeConfiguration(oAdapterConfiguration);
            }

            // we need to have at least one theme
            if (oUserThemeConfiguration.length === 0) {
                oDeferred.reject("no themes were configured");
            } else {
                oDeferred.resolve({
                    options: oUserThemeConfiguration
                });
            }


            return oDeferred.promise();
        };

    };
}());
