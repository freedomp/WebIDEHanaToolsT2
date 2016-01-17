// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, window */
    jQuery.sap.declare("sap.ushell.services.AppConfiguration");
    /**
     * AppConfiguration service.
     *
     * @private
     */
    function AppConfiguration() {
        var oMetadata = {},
            oCurrentApplication = null,
            aIdsOfAddedButtons = [];


        /**
         * Returns the current application.
         * 
         * 
         * @returns {object}
         *   a copy of the metadata object
         *
         * @private
         */
        this.getCurrentAppliction = function (oApplication) {
            return oCurrentApplication;
        };
        /**
         * Returns the current metadata.
         * 
         * {
         *      title: {string}
         *      library: {string}
         *      version: {string}
         *      fullWidth: {boolean}
         * }  
         * 
         * @returns {object}
         *   a copy of the metadata object
         *
         * @private
         */
        this.getMetadata = function (oApplication) {
            if (!oApplication) {
                oApplication = oCurrentApplication;
            }

            if (oApplication) {
                var sKey = this.getApplicationUrl(oApplication);
                if (!(oMetadata.hasOwnProperty(sKey))) {
                    this.addMetadata(oApplication);
                }
                // If metadata was not created - create it now as an empty object
                if (!oMetadata[sKey]) {
                    oMetadata[sKey] = {};
                }
                // If title doesn't exist in the metadata - try to get it from the result of navTergetResolution, 
                //  or use the default application title 
                if (!oMetadata[sKey].title) {
                    oMetadata[sKey].title = oApplication.text || sap.ushell.resources.i18n.getText("default_app_title");
                }
                return oMetadata[sKey];
            }
            return {};
        };

        /**
         * @private
         */
        this.setCurrentApplication = function (oApplication) {
            oCurrentApplication = oApplication;
        };

        /*
         * Sets the hiding of the shell header.
         * It is meant to be used by applications that want to modify the default behavior of the shell header.
         *
         * @param {boolean} boolean value for setting enable/disable header hiding
         */
        this.setHeaderHiding = function (bEnabled) {
            var shell =  sap.ui.getCore().byId('shell');
            if (shell) {
                // only for smart phone
                if (sap.ui.Device.system.phone) {
                    shell.setHeaderHiding(bEnabled);
                } else {
                    jQuery.sap.log.warning("Application configuration could not be trigger setHeaderHiding on Shell as the running devic is not a phone");
                }
            } else {
                jQuery.sap.log.warning("Application configuration could not be trigger setHeaderHiding on Shell");
            }
        };

        /*
         * Adds buttons to the action sheet in the shell header.
         * This function always overrides the already existing application settings buttons with the new buttons.
         * It is meant to be used by applications that want to add their own settings button to the shell header.
         * 
         * @param {array} array of sap.m.Button controls
         * */
        this.addApplicationSettingsButtons = function (aButtons) {
            var i,
                aIds = [];

            for (i = 0; i < aButtons.length; i++) {
                var oCurrentButton = aButtons[i];
                aIds.push(oCurrentButton.getId());
                oCurrentButton.setIcon(oCurrentButton.getIcon() || sap.ui.core.IconPool.getIconURI('action-settings'));
            }
            if (sap.ushell.Container && sap.ushell.Container.getRenderer("fiori2")) {
                if (aIdsOfAddedButtons.length) {
                    //remove buttons that were added earlier
                    sap.ushell.Container.getRenderer("fiori2").hideActionButton(aIdsOfAddedButtons, true);
                }
                aIdsOfAddedButtons = aIds;
                sap.ushell.Container.getRenderer("fiori2").showActionButton(aIds, true, undefined, true);
            }
        };

        /**
         * Sets the title of the browser tabSets the title of the browser tab.
         *
         * @param {string} sTitle
         */
        this.setWindowTitle = function (sTitle) {
            window.document.title = sTitle;
        };

        /**
         * Sets the icons of the browser.
         *
         * @param oIconsProperties
         * An object holding icon URLs
         */
        this.setIcons = function (oIconsProperties) {
            jQuery.sap.setIcons(oIconsProperties);
        };

        /**
         * Get a settings control to display about dialog and system infos.
         *
         * @returns {sap.ushell.ui.footerbar.SettingsButton}
         *      a settings control which can be embedded where ever its needed
         * @private
         */
        this.getSettingsControl = function () {
            jQuery.sap.require("sap.ushell.ui.footerbar.SettingsButton");
            return new sap.ushell.ui.footerbar.SettingsButton();
        };

        /**
         * @private
         */
        this.getApplicationName = function (oApplication) {
            /*jslint regexp: true */
            var aMatches,
                sAdditionalInformation = (oApplication && oApplication.additionalInformation) || null;

            if (sAdditionalInformation) {
                // SAPUI5.Component=<fully-qualified-component-name>
                aMatches = /^SAPUI5\.Component=(.+)$/i.exec(sAdditionalInformation);
                if (aMatches) {
                    // determine namespace, view name, and view type
                    return aMatches[1];
                }
            }
            return null;
        };
        /**
         * @private
         */
        this.getApplicationUrl = function (oApplication) {
            var sUrl = (oApplication && oApplication.url) || null,
                sSegmentToDetermineWebGUITransaction = "P_TCODE",
                iIndexOfQuestionmark;

            if (sUrl) {

                if (oApplication.applicationType === "NWBC" && sUrl.indexOf(sSegmentToDetermineWebGUITransaction)) {
                    //in case it is a WebGUI transaction then return the whole URL of the application
                    return sUrl;
                }
                iIndexOfQuestionmark = sUrl.indexOf("?");
                if (iIndexOfQuestionmark >= 0) {
                    // pass GET parameters of URL via component data
                    // as member startupParameters  ( to allow blending with other oComponentData usage, e.g.
                    // extensibility use case
                    sUrl = sUrl.slice(0, iIndexOfQuestionmark);
                }
                if (sUrl.slice(-1) !== '/') {
                    sUrl += '/'; // ensure URL ends with a slash
                }
            }
            return sUrl;
        };

        /**
         * Reads a property value from the configuration
         *    
         * Value translation is required if the configuration includes another property whose key is composed of the original key + the string "Resource".
         * e.g. For translating the value of the property "title" - there's another configuration property: "titleResource": "TITLE_KEY".
         * The value (e.g. "TITLE_KEY") is the translation key in the resource bundle
         */
        this.getPropertyValueFromConfig = function (oConfig, sPropertyKey, oResourceBundle) {
            var oValue;

            if (oResourceBundle && oConfig.hasOwnProperty(sPropertyKey + "Resource")) {
                oValue = oResourceBundle.getText(oConfig[sPropertyKey + "Resource"]);
            } else if (oConfig.hasOwnProperty(sPropertyKey)) {
                oValue = oConfig[sPropertyKey];
            }

            return oValue;
        };

        /**
         * Reads a property value from the manifest
         */
        this.getPropertyValueFromManifest = function (oLocalMetadata, oProperties, sPropertyKey) {
            var sManifestEntryKey = oProperties[sPropertyKey].manifestEntryKey,
                sManifestPropertyPath = oProperties[sPropertyKey].path,
                oManifestEntry = oLocalMetadata.getManifestEntry(sManifestEntryKey);

            return jQuery.sap.getObject(sManifestPropertyPath, undefined, oManifestEntry);
        };

        /**
         * Adds the application metadata to oMetadata object.
         * Application metadata is taken from the manifest/descriptor (1st priority), if exists, and from the component configuration (2nd priority).
         *
         * @param oApplication Includes data for launching the application, such as applicationType, url, etc..
         * @private
         */
        this.addMetadata = function (oApplication) {
            try {
                var sComponentName = this.getApplicationName(oApplication),
                    sUrl = this.getApplicationUrl(oApplication),
                    oComponent,
                    oLocalMetadata,
                    oConfig,
                    // Hash object that maps application metadata property (i.e. property name) to its corresponding entry and path 
                    //  in the application descriptor (i.e. manifest file), if exists 
                    oProperties = {
                        "fullWidth" :              {"manifestEntryKey" : "sap.fiori", "path": "fullWidth"},
                        "hideLightBackground" :    {"manifestEntryKey" : "sap.fiori", "path": "hideLightBackground"},
                        "title"   :                {"manifestEntryKey" : "sap.app", "path": "title"},
                        "icon"    :                {"manifestEntryKey" : "sap.ui", "path": "icons.icon"},
                        "favIcon" :                {"manifestEntryKey" : "sap.ui", "path": "icons.favIcon"},
                        "homeScreenIconPhone"    : {"manifestEntryKey" : "sap.ui", "path": "icons.phone"},
                        "homeScreenIconPhone@2"  : {"manifestEntryKey" : "sap.ui", "path": "icons.phone@2"},
                        "homeScreenIconTablet"   : {"manifestEntryKey" : "sap.ui", "path": "icons.tablet"},
                        "homeScreenIconTablet@2" : {"manifestEntryKey" : "sap.ui", "path": "icons.tablet@2"},
                        "startupImage320x460"    : {"manifestEntryKey" : "sap.ui", "path": "icons.startupImage640x920"},
                        "startupImage640x920"    : {"manifestEntryKey" : "sap.ui", "path": "icons.startupImage640x920"},
                        "startupImage640x1096"   : {"manifestEntryKey" : "sap.ui", "path": "icons.startupImage640x1096"},
                        "startupImage768x1004"   : {"manifestEntryKey" : "sap.ui", "path": "icons.startupImage768x1004"},
                        "startupImage748x1024"   : {"manifestEntryKey" : "sap.ui", "path": "icons.startupImage748x1024"},
                        "startupImage1536x2008"  : {"manifestEntryKey" : "sap.ui", "path": "icons.startupImage1536x2008"},
                        "startupImage1496x2048"  : {"manifestEntryKey" : "sap.ui", "path": "icons.startupImage1496x2048"},
                        "compactContentDensity"  : {"manifestEntryKey" : "sap.ui5", "path": "contentDensities.compact"},
                        "cozyContentDensity"  : {"manifestEntryKey" : "sap.ui5", "path": "contentDensities.cozy"}
                    },
                    potentiallyRelativeUrls,
                    sComponentUrl,
                    isUrlRelative,
                    bManifestExists,
                    sPropertyKey,
                    sConfigResourceBundleUrl,
                    oResourceBundle;

                if (sUrl && !(oMetadata.hasOwnProperty(sUrl))) {
                    oMetadata[sUrl] = {};
                    oComponent = sap.ui.component.load({ url : sUrl, name : sComponentName });
                    oLocalMetadata = oComponent.getMetadata();
                    if (oLocalMetadata) {

                        oConfig = oLocalMetadata.getConfig();
                        bManifestExists = (oLocalMetadata.getManifest() !== undefined);

                        // If configuration exists and no resource bundle was created from the manifest
                        if (oConfig) {
                            sConfigResourceBundleUrl = oConfig.resourceBundle || "";
                            if (sConfigResourceBundleUrl) {
                                if (sConfigResourceBundleUrl.slice(0, 1) !== '/') {
                                    sConfigResourceBundleUrl = sUrl + sConfigResourceBundleUrl;
                                }
                                oResourceBundle = jQuery.sap.resources({
                                    url: sConfigResourceBundleUrl,
                                    locale : sap.ui.getCore().getConfiguration().getLanguage()
                                });
                            }
                        }

                        // Loop over all property names, and for each one - get the value from the manifest or from the application configuration 
                        for (sPropertyKey in oProperties) {
                            if (oProperties.hasOwnProperty(sPropertyKey)) {
                                if (bManifestExists) {
                                    // Get property value from the manifest
                                    oMetadata[sUrl][sPropertyKey] = this.getPropertyValueFromManifest(oLocalMetadata, oProperties, sPropertyKey);
                                }

                                // If application configuration exists  and the property value was not found in the manifest - 
                                // look for it in the configuration
                                if (oConfig  && oMetadata[sUrl][sPropertyKey] === undefined) {
                                    // Get property value from the configuration
                                    oMetadata[sUrl][sPropertyKey] = this.getPropertyValueFromConfig(oConfig, sPropertyKey, oResourceBundle);
                                }
                            }
                        }
                    }
                }
                oMetadata[sUrl].version = oLocalMetadata.getVersion();
                oMetadata[sUrl].libraryName = oLocalMetadata.getLibraryName();
                /*
                 * Special behavior for relative URLs: 
                 * Relative URLs are considered relative to the folder containing the Component.js,
                 * which requires adjustments here. Otherwise the browser would interpret them as
                 * relative to the location of the HTML file, which might be different and also
                 * hard to guess for app developers.
                 */
                potentiallyRelativeUrls = [
                    "favIcon",
                    "homeScreenIconPhone",
                    "homeScreenIconPhone@2",
                    "homeScreenIconTablet",
                    "homeScreenIconTablet@2",
                    "startupImage320x460",
                    "startupImage640x920",
                    "startupImage640x1096",
                    "startupImage768x1004",
                    "startupImage748x1024",
                    "startupImage1536x2008",
                    "startupImage1496x2048"
                ];

                sComponentUrl = (sUrl && sUrl[sUrl.length - 1] === '/') ?
                        sUrl.substring(0, sUrl.length - 1) : sUrl;

                isUrlRelative = function (sUrl) {
                    /*jslint regexp : true*/
                    if (sUrl.match(/^https?:\/\/.*/)) {
                        return false;
                    }
                    return sUrl && sUrl[0] !== '/';
                };

                potentiallyRelativeUrls.forEach(function (sPropName) {
                    var sOrigValue = oMetadata[sUrl][sPropName],
                        sFinalValue = null;
                    // Some URL properties might not be defined.
                    if (sOrigValue) {
                        sFinalValue = isUrlRelative(sOrigValue) ?
                                sComponentUrl + "/" + sOrigValue : sOrigValue;
                    }
                    oMetadata[sUrl][sPropName] = sFinalValue;
                });
            } catch (err) {
                jQuery.sap.log.warning("Application configuration could not be parsed");
            }
        };

    } // Metadata

    /**
     * The Unified Shell App configuration service as a singleton object. 
     * 
     * @class The unified shell's AppConfiguration service.
     * 
     * @name sap.ushell.services.AppConfiguration
     * @since 1.15.0
     * @private
     */
    sap.ushell.services.AppConfiguration = new AppConfiguration();

}());
