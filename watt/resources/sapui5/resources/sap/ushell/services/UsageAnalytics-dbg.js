// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, window */
    jQuery.sap.declare("sap.ushell.services.UsageAnalytics");

    /**
     * @class A UShell service for tracking business flows and user actions.
     *
     * The UsageAnalytics service exposes API for logging custom events and setting custom field values in the logged events.<br>
     * The data is sent via http and recorded on a server, whose URL is defined by the <code>baseUrl</code> service configuration property.<br>
     * The service configuration must also include the site ID from the <code>pubToken</code> attribute.<br>
     * You can find the pubToken in the code snippet provided in the WARP when creating a new site.
     *
     * Each tracked event is represented by a table entry on the server database.<br>
     * The administrator can produce reports based on the the recorded data.
     *
     * Two types of events can be logged:<br>
     * - Automatic events: Click or pageLoad are predefined events, logged by the base tracking library.<br>
     *  You can disable these events in the service configuration.<br>
     * - Custom events: You can use the service API to log an event with custom data using the function logCustomEvent<br>
     *
     * Each tracked event (either automatic or custom) is represented by a database row, that includes 10 custom attributes named custom1...custom10.<br>
     *  Some of these values can be set using UsageAnalytics service API.<br>
     *
     * @param {object} oContainerInterface
     *     The interface provided by the container
     * @param {object} sParameter
     *     Not used in this service
     * @param {object} oServiceProperties
     *     Service configuration
     *
     * @constructor
     * @see sap.ushell.services.Container#getService
     * @since 1.32.0
     *
     * @public
     */
    sap.ushell.services.UsageAnalytics = function (oContainerInterface, sParameter, oServiceProperties) {
        var oServiceConfig = (oServiceProperties && oServiceProperties.config) || {},
            aDelayedEvents = [],
            bAnalyticsScriptLoaded = false,
            bInitialized = false,
            bEnabled = true;

        window.oCustomProperties = {};

        /**
         * Service API - Begin
         */

        /**
         * Indicates whether Usage Analytics is enabled.
         * Enablement is based on the <code>enable</code> service configuration flag 
         *  and the existence of a valid <code>pubToken</code> in the configuration
         *
         * @returns {boolean} A boolean value indicating whether the UsageAnalytics service is enabled
         *
         * @since 1.32.0
         *
         * @public
         */
        this.isEnabled = function () {
            if (!bInitialized) {
                if (!oServiceConfig.enabled || !oServiceConfig.pubToken) {
                    bEnabled = false;
                    if (!oServiceConfig.pubToken) {
                        jQuery.sap.log.warning("No valid pubToken was found in the service configuration");
                    }
                } else {
                    bEnabled = true;
                }
            }
            return bEnabled;
        };

        /**
         * Initializes the UsageAnalytics service
         *
         * Initialization is performed only if the following two conditions are fulfilled:<br>
         *  1. UsageAnalytics is enabled<br>
         *  2. UsageAnalytics service hasn't been initialized yet
         *
         * @since 1.32.0
         *
         * @public
         */
        this.init = function () {
            if (this.isEnabled() && !bInitialized) {
                this._initUsageAnalyticsLogging();
                bInitialized = true;
            }
        };

        /**
         * Sets up to 4 customer attributes of logged events according to the given object attributes.<br>
         * A customer attribute can be set only once during a session.<br>
         * Currently these attributes correspond to database columns custom3...custom6.
         *
         * @param {object} oCustomFieldValues An object that includes attribute1...attribute4 (or subset)<br>
         *  with values of type string/number/boolean or a function that returns any of these types.<br>
         *  For example:<br>
         *  {<br>
         *   attribute1: "value3",<br>
         *   attribute2: function () {return "value4"},<br>
         *   attribute3: 55<br>
         *  }<br>
         *  in this example the custom field "custom3" gets the string "value3"<br>
         *  the custom field custom4 gets the function that returns the string "value4",<br>
         *  the custom field custom5 gets a string "55".<br>
         *  Any property of oCustomFieldValues which is not in the range of attribute1...attribute4 is ignored.
         *
         * @since 1.32.0
         *
         * @public
         */
        this.setCustomAttributes = function (oCustomFieldValues) {
            var index,
                sParameterKeyPrefix = "attribute",
                sParameterKey,
                sCustomPropertyKeyPrefix = "custom",
                sCustomPropertyKey,
                sFunctionName,
                sFunctionNamePrefix = "customFunction";

            if (!this.isEnabled()) {
                return;
            }
            for (index = 1; index < 5; index++) {

                // Check that the corresponding custom property wasn't set yet
                // e.g. if index=3 then the corresponding sCustomPropertyKey is "custom5"
                // and the check verifies that swa.custom5 is empty
                sCustomPropertyKey = sCustomPropertyKeyPrefix.concat(index + 2);

                if (window.swa[sCustomPropertyKey] !== undefined) {
                    continue;
                }

                // Check that the given object (i.e. oCustomFieldValues) contains parameter with this index
                // e.g. sParameterKey is "attribute3" then check that oCustomFieldValues.attribute3 is defined
                sParameterKey = sParameterKeyPrefix + index;
                if (oCustomFieldValues[sParameterKey] === undefined) {
                    continue;
                }

                // Check if the value of oCustomFieldValues[sCustomPropertyKey] is a function
                if (jQuery.isFunction(oCustomFieldValues[sParameterKey])) {

                     // Giving the anonymous function name . e.g. "customFunction3"
                    sFunctionName = sFunctionNamePrefix + index;

                    // Make a global reference to the function. e.g. window.customFunction3 = the given function
                    window[sFunctionName] = oCustomFieldValues[sParameterKey];

                    // Set the value of the relevant custom property to be a string reference of the function.
                    // e.g. "{ref:"customFunction3"};
                    window.swa[sCustomPropertyKey] = {ref: sFunctionName};
                } else {
                    window.swa[sCustomPropertyKey] = {ref: oCustomFieldValues[sParameterKey]};
                }
            }
        };

        /**
         * Logs a custom event with the given eventType, customEventValue, and additional custom attributes.<br>
         * Each event has up to an additional 4 custom attributes that correspond to database columns custom7...custom10.
         *
         * @param {string} eventType - Type of the event
         * @param {string} customEventValue - Primary value of the event
         * @param {array} aAdditionalValues An array of zero to four strings. Any item above the 4th is ignored.
         *
         * @since 1.32.0
         *
         * @public
         */
        this.logCustomEvent = function (eventType, customEventValue, aAdditionalValues) {
            var index,
                iCustomPropertyIndex,
                sCustomPropertyKey;

            if (!this.isEnabled()) {
                return;
            }
            // If not all logging scripts were loaded - keep the request for later execution, and return.
            if (!this._isAnalyticsScriptLoaded()) {
                this._addDelayedEvent(eventType, customEventValue, aAdditionalValues);
                return;
            }
            if (aAdditionalValues) {
                for (index = 0; index < 4 && index < aAdditionalValues.length; index++) {
                    iCustomPropertyIndex = index + 7;
                    sCustomPropertyKey = "custom" + iCustomPropertyIndex;

                    // Update a global object that includes the additional values
                    window.oCustomProperties[sCustomPropertyKey] = aAdditionalValues[index];

                    // The relevant swa.custom attribute get an object that includes the function _getCustomValue,
                    // and a parameter with which the function locates the relevant value to return
                    window.swa[sCustomPropertyKey] = {ref: "_getCustomValue", params: [iCustomPropertyIndex]};
                }
            }
            this._trackCustomEvent(eventType, customEventValue);
        };

        /**
         * Service API - End
         */

        /**
         * Callback function that is called when SWA scripts are loaded.
         * Goes over all delayed custom events and logs them by calling logCustomEvent
         */
        window._trackingScriptsLoaded = function () {
            var index,
                oTempDelayedEvent;

            bAnalyticsScriptLoaded = true;
            for (index = 0; index < aDelayedEvents.length; index++) {
                oTempDelayedEvent = aDelayedEvents[index];
                this.logCustomEvent(oTempDelayedEvent.eventType, oTempDelayedEvent.customEventValue, oTempDelayedEvent.aAdditionalValues);
            }
            aDelayedEvents = null;
        };

        this._trackCustomEvent = function (eventType, customEventValue) {
            window.swa.trackCustomEvent(eventType, customEventValue);
        };

        /**
         * Embedding SWA's tracking snippet into the renderer's code
         * including the loading of js/privacy.j which is actually SWA's source code
         */
        this._initUsageAnalyticsLogging = function () {
            if (window.swa === undefined) {
                window.swa = {};
            }
            window.swa.pubToken = oServiceConfig.pubToken;
            window.swa.baseUrl = oServiceConfig.baseUrl;
            window.swa.bannerEnabled =  false;
            window.swa.loggingEnabled = true;
            window.swa.visitorCookieTimeout = 63113852;
            window.swa.dntLevel = 1;
            window.swa.trackerReadyCallback = window._trackingScriptsLoaded.bind(this);

            // the following swa properties get the value "true" by default
            window.swa.clicksEnabled  = (oServiceConfig.logClickEvents === false ? false : true);
            window.swa.pageLoadEnabled = (oServiceConfig.logPageLoadEvents === false ? false : true);
            this._handlingTrackingScripts();
        };

        this._handlingTrackingScripts = function () {
            var d = document,
                g = d.createElement('script'),
                s = d.getElementsByTagName('script')[0];

            // Callback function called when tracking script loading failed
            g.onerror = function () {
                bEnabled = false;
                jQuery.sap.log.warning("SWA scripts not loaded!");
            };
            g.type  = 'text/javascript';
            g.defer = true;
            g.async = true;
            g.src = window.swa.baseUrl + 'js/privacy.js';
            s.parentNode.insertBefore(g, s);
        };

        this._isAnalyticsScriptLoaded = function () {
            return bAnalyticsScriptLoaded;
        };

        /**
         * Called when a custom event is being logged but SWA scripts are not loaded yet.
         * Adds the logged event to aDelayedEvents.
         */
        this._addDelayedEvent = function (eventType, customEventValue, aAdditionalValues) {
            var oDelayedEvent = {
                    eventType : eventType,
                    customEventValue : customEventValue,
                    aAdditionalValues : aAdditionalValues
                };
            aDelayedEvents.push(oDelayedEvent);
        };

        window._getCustomValue = function (index) {
            var sCustomPropertyKey = "custom" + index,
                oValueToReturn = window.oCustomProperties[sCustomPropertyKey];

            window.oCustomProperties[sCustomPropertyKey] = undefined;
            return oValueToReturn;
        };
    };
    sap.ushell.services.UsageAnalytics.hasNoAdapter = true;
}());
