// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview The NavTargetResolution service.
 */
(function () {
    "use strict";
    /*global jQuery, sap, localStorage, window, URI, document*/
    /*jslint nomen: true */
    jQuery.sap.declare("sap.ushell.services.NavTargetResolution");

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getService("NavTargetResolution")</code>.
     * Constructs a new instance of the navigation target resolution service.
     *
     * @class The Unified Shell's internal navigation target resolution service
     *
     *Methods in this class deal with *internal* representations of the shell hash.
     *
     * configurations:
     * <code>config : { allowTestUrlComponentConfig  : true }</code>
     * allow to redefine the Test-url, Test-local1, Test-local2 applications via url parameters
     * (sap-ushell-test-local1-url=  / sap-ushell-test-local1-additionalInformation=  ... )
     *
     *
     * @constructor
     * @see sap.ushell.services.Container#getService
     * @since 1.15.0
     * @param {oServiceConfiguration} a Service configuration
     *
     * @public
     */
    sap.ushell.services.NavTargetResolution = function (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        var oServiceConfig = oServiceConfiguration && oServiceConfiguration.config,
            aLocalResolvedNavTargets,
            // oAdapter resolver is the "last" custom resolver
            aResolvers = [{
                name : "DefaultAdapter",
                isApplicable: function () { return true; },
                resolveHashFragment : oAdapter.resolveHashFragment.bind(oAdapter)
            }],
            oCurrentResolution;

        this._nextResolveHashFragment = function (aCustomResolvers, sHashFragment) {
            var oResolver,
                f;

            oResolver = aCustomResolvers.pop();
            if (oResolver.isApplicable(sHashFragment)) {
                jQuery.sap.log.info("NavTargetResolution: custom resolver " + oResolver.name + " resolves " + sHashFragment);
                f = this._nextResolveHashFragment.bind(this, aCustomResolvers);
                return oResolver.resolveHashFragment(sHashFragment, f);
            }
            return this._nextResolveHashFragment(aCustomResolvers, sHashFragment);
        };

        /**
         * expands a URL hash fragment
         *
         * This function gets the hash part of the URL and expands a sap-intent-param if present
         * and retrievable
         *
         * This is an asynchronous operation.
         *
         * @param {string} sHashFragment
         *     The formatted URL hash fragment in internal format(as obtained by the SAPUI5 hasher service,
         *     not as given in <code>location.hash</code>)
         *
         * @returns {string}
         *     A jQuery.Promise. Its <code>done()</code> function gets an expanded shell hash
         *     (in internal format)
         *
         * @public
         */
        this.expandCompactHash = function(sHashFragment) {
            var oUrlParsingService = sap.ushell.Container.getService("URLParsing"),
                oParsedShellHash,
                oDeferred = new jQuery.Deferred();

            // augment URL with application parameters from sHashFragment
            oParsedShellHash = oUrlParsingService.parseShellHash(sHashFragment);

            if (oParsedShellHash && oParsedShellHash.params && oParsedShellHash.params["sap-intent-param"]) {
                sap.ushell.Container.getService("AppState").getAppState(oParsedShellHash.params["sap-intent-param"][0]).done(

                    function (oContainer) {

                        var sValue = oContainer.getData("sap-intent-param"),
                            sHashFragmentPotentiallyExpanded = sHashFragment;

                        if (sValue) {
                            sHashFragmentPotentiallyExpanded = sap.ushell.Container.getService("URLShortening").expandParamGivenRetrievalFunction(sHashFragment, "sap-intent-param", function () {
                                return sValue;
                            });
                        }

                        oDeferred.resolve(sHashFragmentPotentiallyExpanded);
                    }
                ).fail(
                    function () {
                        oDeferred.resolve(sHashFragment);
                    }
                );
            } else {
                //setTimeout(function () {
                    oDeferred.resolve(sHashFragment);
                //}, 0);
            }
            return oDeferred.promise();
        };

        /**
         * Returns the navigation mode of a given resolved hash fragment
         *
         * @param {object} oResolvedHashFragment
         *     the hash fragment resolved by one of the registered resolvers
         *
         * @returns {string}
         *     the navigation mode for the given hash fragment. Returns the
         *     following values, each corresponding to a specific way the
         *     application should be navigated to:
         *
         *     <ul>
         *         <li><code>"embedded"</code>: the application should be
         *         opened in the current window, and rendered within the
         *         launchpad shell.</li>
         *
         *         <li><code>"newWindow"</code>: the application should be
         *         rendered in a new window, but no launchpad header must be
         *         present.</li>
         *
         *         <li><code>"newWindowThenEmbedded"</code>: the application
         *         should be opened in a new window but rendered within the
         *         launchpad shell.</li>
         *
         *         <li><code>undefined</code>: it was not possible to determine
         *         a navigation mode for the app. An error should be displayed
         *         in this case.</li>
         *     </ul>
         *
         * @private
         */
        this._getNavigationMode = function (oResolvedHashFragment) {
            var sAdditionalInformation = oResolvedHashFragment.additionalInformation,
                sApplicationType = oResolvedHashFragment.applicationType,
                sUi5ComponentPart,
                sUi5ComponentRegex;

            if ((sAdditionalInformation === null || typeof sAdditionalInformation === "string" || typeof sAdditionalInformation === "undefined") &&
                    sApplicationType === "URL") {

                /*
                 * NOTE: The "managed=" and "SAPUI5.Component=" cases are
                 * skipped if the additionalInformation field does not start
                 * exactly with the "managed=" and "SAPUI5.Component=" values;
                 */

                // managed= case(s)
                if (sAdditionalInformation && sAdditionalInformation.indexOf("managed=") === 0) {

                    if (sAdditionalInformation === "managed=FioriWave1") {
                        return "embedded";
                    }

                    if (sAdditionalInformation === "managed=") {
                        return "newWindow";
                    }

                    return undefined;
                }

                // UI5 component case
                if (sAdditionalInformation && sAdditionalInformation.indexOf("SAPUI5.Component=") === 0) {
                    sUi5ComponentPart = "[a-zA-Z0-9_]+";
                    sUi5ComponentRegex = [
                        "^SAPUI5.Component=",   // starts with SAPUI5.Component=
                        sUi5ComponentPart,      // at least one part
                        "([.]", sUi5ComponentPart, ")*$" // multiple dot-separated parts
                    ].join("");

                    if (!(new RegExp(sUi5ComponentRegex)).test(sAdditionalInformation)) {
                        jQuery.sap.log.warning(["The UI5 component name in",
                            sAdditionalInformation, "is not valid.",
                            "Please use names satisfying", sUi5ComponentRegex
                            ].join(" "));
                    }

                    return "embedded";
                }

                return "newWindow";
            }

            // NWBC
            if (sApplicationType === "NWBC") {
                return "newWindowThenEmbedded";
            }

            // default
            return undefined;
        };

        var aWDAGUIAppType = ["NWBC", "WDA", "TR"];
        /**
         * Determines the sap-system of given resolution result, if present
         *
         * @param {object} sHashFragment
         *     the hash fragment resolved by one of the registered resolvers
         * @param {object} oResolutionResult
         *     the resolution result
         *
         * @returns {string}
         *     a sap-system, if present, or undefined
         *    The result is taken from the following sequence:
         *     <ol>
         *         <li><code>result url</code>if the result url contains a parameter value
         *         sap-system, this is the value determined by this function
         *         </li>
         *         <li><code>NWBC/TR/WDA</code>If the application type is of one NWBC/TR/WDA
         *         and no sap-system is part of the *resolved* url or already, sap-system is taken from the these
         *         original hash if present
         *         </li>
         *         <li><code>undefined</code> otherwise
         *         </li>
         *     </ol>
         *  Note: in this manner sap-system can be overwritten for SAPUI5 applications within the target mapping
         * @private
         */
        this._getSapSystem = function (sHashFragment, oResolutionResult) {
            var sSystem;
            if (oResolutionResult && oResolutionResult["sap-system"]) {
                return oResolutionResult["sap-system"];
            }
            if (oResolutionResult && oResolutionResult.url) {
                sSystem = jQuery.sap.getUriParameters(oResolutionResult.url).get("sap-system");
                if (sSystem) {
                    return sSystem;
                }
            }
            if (aWDAGUIAppType.indexOf(oResolutionResult.applicationType) >= 0 && sHashFragment && sHashFragment.substring(1)) {
                sSystem = jQuery.sap.getUriParameters(sHashFragment.substring(1)).get("sap-system");
                if (sSystem) {
                    return sSystem;
                }
            }
            return undefined;
        };
        /**
         * Resolves the URL hash fragment.
         *
         * This function should be used by a custom renderer in order to
         * implement custom navigation.  Do not use this function for developing
         * Fiori applications.
         *
         * This function gets the hash part of the URL and returns data of the
         * target application.
         *
         * Example of the returned data:
         * <pre>
         * {
         *    "additionalInformation": "SAPUI5.Component=sap.ushell.renderers.fiori2.search.container",
         *    "applicationType": "URL",
         *    "url": "/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/container",
         *    "navigationMode": "embedded"
         * }
         * </pre>
         *
         * The <code>navigationMode</code> indicates how the target application
         * should be navigated. It is always added to the result using the logic
         * in {@link #_getNavigationMode} if none of the resolvers in the chain
         * added it.
         *
         * This is an asynchronous operation.
         *
         * @param {string} sHashFragment
         *     The formatted URL hash fragment in internal format (as obtained by the SAPUI5 hasher service)
         *     not as given in <code>location.hash</code>)!
         *     example <code>#SemanticObject-action?P1=V1&P2=A%20B%20C</code>
         *
         * @returns {object}
         *     A jQuery.Promise. Its <code>done()</code> function gets an object that you can use
         *     to create a {@link sap.ushell.components.container.ApplicationContainer}
         *     or <code>undefined</code> in case the hash fragment was empty.
         *     Typically it contains the following information:
         * <pre>
         * {
         *   applicationType: "URL",
         *   url: "/sap/bc/",
         *   additionalInformation: "SAPUI5.Component=com.sap.AComponent",
         *   text: "My targetmapping description"
         * }
         * </pre>
         *
         * @public
         */
        this.resolveHashFragment = function (sHashFragment) {
            var oDeferred = new jQuery.Deferred(),
                sSapSystem,
                that = this;
            this.expandCompactHash(sHashFragment).done(function (sHashFragmentPotentiallyExpanded) {
                that._invokeResolveHashChain(sHashFragmentPotentiallyExpanded).done(function (oResult) {

                    /*
                     * Certain platforms like EP may use results from ABAP
                     * backend with custom adapters that do not fix the
                     * applicationType back to URL. This is normally done in
                     * ABAP adapters which we cannot assume to be present.
                     */
                    if (oResult && oResult.applicationType && oResult.applicationType === "SAPUI5") {
                        oResult.applicationType = "URL";
                    }

                    // Add navigation mode if it's not already there
                    if (jQuery.isPlainObject(oResult) && !oResult.hasOwnProperty("navigationMode")) {
                        oResult.navigationMode = that._getNavigationMode(oResult);
                    }

                    // add a sap-system if not already there
                    if (jQuery.isPlainObject(oResult) && !oResult.hasOwnProperty("sap-system")) {
                        sSapSystem = that._getSapSystem(sHashFragment, oResult);
                        if (sSapSystem) {
                            oResult["sap-system"] = sSapSystem;
                        }
                    }

                    oDeferred.resolve(oResult);
                }).fail(function (sMessage) {
                    oDeferred.reject(sMessage);
                });
            }).fail(function (sMessage) {
                oDeferred.reject(sMessage);
            });
            return oDeferred.promise();
        };

        this._invokeResolveHashChain = function (sHashFragment) {
            var oCRs = aResolvers.map(function (a) { return a; });

            return this._nextResolveHashFragment(oCRs, sHashFragment).done(function (oResolution) {
                oCurrentResolution = oResolution;
            });
        };

        this.baseResolveHashFragment = function (sHashFragment) {
            return oAdapter.resolveHashFragment(sHashFragment);
        };

        /**
         * Resolves a given semantic object and business parameters to a list of links,
         * taking into account the form factor of the current device.
         *
         * Note: Applications should call getService("CrossApplicationNavigation").getSemanticObjectLinks
         *
         * @param {string} sSemanticObject
         *   the semantic object such as <code>"AnObject"</code>
         * @param {object} [mParameters]
         *   the map of business parameters with values, for instance
         *   <pre>
         *   {
         *     A: "B",
         *     C: ["e", "j"]
         *   }
         *   </pre>
         * @param {boolean} [bIgnoreFormFactor=false]
         *   when set to <code>true</code> the form factor of the current device is ignored
         * @param {Object} [oComponent]
         *    SAP UI5 Component invoking the service
         * @param {string} [sAppStateKey]
         *    application state key to add to the generated links
         * @param {boolean} [bCompactIntents]
         *    whether the returned intents should be returned in compact format. Defaults to false.
         * <pre>
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which is resolved with an array of
         *   link objects containing (at least) the following properties:
         * <pre>
         * {
         *   intent: "#AnObject-action?A=B&C=e&C=j",
         *   text: "Perform action"
         * }
         *
         * Note: the intent returned is in internal format and can not be directly put into a link tag.
         * example: Let the string "C&A != H&M" be a parameter value,
         * Intent will be encoded as<code>#AnObject-action?text=C%26A%20!%3D%20H%26M<code>
         * To use this shell in a link tag, use </code>
         * <code>
         * Container.getService("CrossApplicationNavigation").hrefForExternal({ target : { shellHash :  aLink.intent} }, that.oComponent));
         * </code>
         * @private
         * </pre>
         */
        this.getSemanticObjectLinks = function (sSemanticObject, mParameters, bIgnoreFormFactor, oComponent, sAppStateKey, bCompactIntents) {
            var that = this,
                oParameters,
                oArgs,
                oPromise = new jQuery.Deferred(),
                oShellNavigation;

            if (/\?/.test(sSemanticObject)) {
                throw new Error("Parameter must not be part of semantic object");
            }

            oParameters = (mParameters === undefined) ? undefined : JSON.parse(JSON.stringify(mParameters));
            if (sAppStateKey) {
                oParameters = oParameters || {};
                oParameters["sap-xapp-state"] = encodeURIComponent(sAppStateKey);
            }

            oArgs = {
                target : {
                    semanticObject : sSemanticObject,
                    action : "dummyAction"
                },
                params : oParameters
            };

            oShellNavigation = sap.ushell.Container.getService("ShellNavigation");
            oShellNavigation.hrefForExternal(oArgs, true, oComponent, true).done(function (oResVerboseCompacted) {
                oParameters = oResVerboseCompacted.params || oParameters;
                if (oAdapter.getSemanticObjectLinks) {

                    oAdapter.getSemanticObjectLinks(sSemanticObject, oParameters, bIgnoreFormFactor).done(function (aSemanticObjectLinks) {
                        if (bCompactIntents) {
                            that._shortenGetSemanticObjectLinksResults(aSemanticObjectLinks, oComponent)
                                .done(function (aCompactSemanticObjectLinks) { // note: no fail handler
                                    oPromise.resolve(aCompactSemanticObjectLinks);
                                });
                        } else {
                            oPromise.resolve(aSemanticObjectLinks);
                        }
                    }).fail(function (sMsg) {
                        oPromise.reject(sMsg);
                    });
                } else {
                    oPromise.resolve([]);
                }
            }).fail(function (sMsg) {
                oPromise.reject(sMsg);
            });
            return oPromise.promise();
        };

        /**
         * Shortens all URLs found in the result of getSemanticObjectLinks.
         *
         * @param {array} aGetSemanticObjectLinksResults
         *    the result of {@link #getSemanticObjectLinks}
         * @param {object} oComponent
         *    a SAPUI5 component. The same passed to getSemanticObjectLinks}.
         *
         * @returns {jQuery.Deferred.Promise}
         *    a promise that is guaranteed to resolve to an array with the same
         *    structure as the array returned from getSemanticObjectLinks, but
         *    with shortened intents.
         *
         * NOTE: if it's not possible to shorten an intent in the input array,
         *       a warning is logged on the console and the unshortened intent is
         *       kept.
         *
         * @private
         * @since 1.32.0
         */
        this._shortenGetSemanticObjectLinksResults = function (aGetSemanticObjectLinksResults, oComponent) {
            var that = this,
                aSemanticObjectLinksShortened = [],
                i = 0,
                iPromisesToResolve = aGetSemanticObjectLinksResults.length,
                oUrlParsingService = sap.ushell.Container.getService("URLParsing"),
                oShellNavigation = sap.ushell.Container.getService("ShellNavigation"),
                oDeferred = new jQuery.Deferred();

            aGetSemanticObjectLinksResults.forEach(function (oIntent) {
                var oUrlParts = oUrlParsingService.parseShellHash(oIntent.intent),
                    oCompactParamsPromise = oShellNavigation.compactParams(oUrlParts.params, undefined /* keep all params */, oComponent);

                aSemanticObjectLinksShortened.push(oCompactParamsPromise);
                aSemanticObjectLinksShortened[i].done(function(iIdx, oCompactParams) {
                    aSemanticObjectLinksShortened[iIdx] = {
                        text: oIntent.text,
                        intent: "#" + oUrlParts.semanticObject + "-" + oUrlParts.action + "?" +
                            oUrlParsingService.paramsToString(oCompactParams)
                    };
                }.bind(that, i)).fail(function(iIdx, sMsg) {
                    jQuery.sap.log.warning(
                        "Cannot shorten GetSemanticObjectLinks result, using expanded form",
                        "Failure message: " + sMsg + "; intent had title ''" + oIntent.title + "'' and link ''" + oIntent.intent + "'",
                        "sap.ushell.services.NavTargetResolution"
                    );
                    aSemanticObjectLinksShortened[iIdx] = {
                        text: oIntent.text,
                        intent: oIntent.intent
                    };
                }.bind(that, i)).always(function () {
                    iPromisesToResolve--;
                    if (iPromisesToResolve === 0) {
                        oDeferred.resolve(aSemanticObjectLinksShortened);
                    }
                });
                i++;
            });

            return oDeferred.promise();
        };

        /**
         * Tells whether the given intent(s) are supported, taking into account the form factor of
         * the current device. "Supported" means that navigation to the intent is possible.
         *
         * @param {string[]} aIntents
         *   the intents (such as <code>"#AnObject-action?A=B&C=e&C=j"</code>) to be checked
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which is resolved with a map
         *   containing the intents from <code>aIntents</code> as keys. The map values are
         *   objects with a property <code>supported</code> of type <code>boolean</code>.<br/>
         *   Example:
         * <pre>
         * {
         *   "#AnObject-action?A=B&C=e&C=j": { supported: false },
         *   "#AnotherObject-action2": { supported: true }
         * }
         * </pre>
         * @deprecated switch to isNavigationSupported
         * note that this has a slightly different response!
         */
        this.isIntentSupported = function (aIntents) {
            var mResult = {};
            // TODO: expand all intents, note that remapping is required!
            if (oAdapter.isIntentSupported) {
                return oAdapter.isIntentSupported(aIntents);
            }

            aIntents.forEach(function (sIntent) {
                mResult[sIntent] = {supported: undefined};
            });
            return (new jQuery.Deferred()).resolve(mResult).promise();
        };

        /**
         * Tells whether the given navigation intent(s) are supported for the given
         * parameters
         * Supported" means that a valid navigation target is configured for the
         * user for the given device form factor.
         *
         * This is effectively a test function for {@link toExternal}/ {@link hrefForExternal}.
         * It is functionally equivalent to {@link isIntentSupported} but accepts the same input
         * as {@link toExternal}/ {@link hrefForExternal}.
         *
         * @param {object[]} aIntents
         *   the intents (such as <code>["#AnObject-action?A=B&c=e"]</code>) to be checked
         * with object beeing instances the oArgs object of toExternal, hrefForExternal etc.
         *
         *  e.g. <code>{ target : { semanticObject : "AnObject", action: "action" },<br/>
         *         params : { A : "B" } }</code>
         *  or
         *  e.g. <code>{ target : { semanticObject : "AnObject", action: "action" },<br/>
         *         params : { A : "B", c : "e" } }</code>
         *  or
         *      <code>{ target : { shellHash : "AnObject-action?A=B&c=e" },
         *      }</code>
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which is resolved with an array (!) of
         *   objects representing whether the intent is supported or not
         *   objects with a property <code>supported</code> of type <code>boolean</code>.<br/> representing
         *   Example:
         *
         * aIntents:
         * an array of parameterized (parsed) Intent objects,
         * in the corresponding structure to arguments to {@link sap.ushell.services.CrossApplicationNavigation.toExternal},
         * {@link sap.ushell.services.CrossApplicationNavigation.hrefForExternal}
         * <pre>
         *  [
         *    {  target : {
         *          semanticObject : "AnObject",
         *          action: "action"
         *       },
         *       params : { P1 : "B", P2 : [ "V2a", "V2b"]  }
         *    },
         *    {  target : {
         *          semanticObject : "SalesOrder",
         *          action: "display"
         *       },
         *       params : { P3 : "B", SalesOrderIds : [ "4711", "472"] }
         *    }
         * ]
         * </pre>
         *
         * The following formats are also supported as input:
         *  <code>[ "#AnObject-action?P1=B&SalesOrderIds=4711&SalesOrderIds=472" ]
         * to ease migration of existing code
         *
         * response:
         * <pre>
         * [
         *   { supported: false },
         *   { supported: true }
         * ]
         * </pre>
         * Example usage:
         * <code>
         * this.oCrossAppNav.isNavigationSupported([ ])
         * .done(function(aResponses) {
         *   if (oResponse[0].supported===true){
         *      // enable link
         *   }
         *   else {
         *      // disable link
         *   }
         * })
         * .fail(function() {
         *   // disable link
         *   // request failed or other fatal error
         * });
         * </code>
         *
         * @since 1.32
         * @public
         */
        this.isNavigationSupported = function (aIntents) {
            var oUrlParsingService = sap.ushell.Container.getService("URLParsing"),
                oDeferred = new jQuery.Deferred(),
                aIntentsAsString = [];
            aIntentsAsString = aIntents.map(function (oArg) {
                if (typeof oArg === "string") {
                    return oArg;
                }
                return "#" + oUrlParsingService.constructShellHash(oArg);
            });
            this.isIntentSupported(aIntentsAsString).done(function (oResult) {
                var aResults = aIntentsAsString.map(function (sIntent) { return oResult[sIntent] || { supported : false}; });
                oDeferred.resolve(aResults);
            }).fail(oDeferred.reject.bind(oDeferred));
            return oDeferred.promise();
        };
        /**
         * Register a custom resolver for semantic objects
         *
         * The resolver must be JavaScipt object with a string property name,
         * and two functions resolveHashFragment(sHashFragment,nextResolver) returning a promise
         * and isApplicable(sHashFragment) returning a boolean
         *
         * @param {Object} oResolver the custom resolver
         *
         * @returns {boolean} true if resolver was registered, false otherwise
         */
        this.registerCustomResolver = function (oResolver) {
            // verify oResolver
            if (typeof oResolver.name !== "string") {
                jQuery.sap.log.error("NavTargetResolution: Custom Resolver must have name {string} member");
                return false;
            }
            if (typeof oResolver.isApplicable !== "function") {
                jQuery.sap.log.error("NavTargetResolution: Custom Resolver must have isApplicable member");
                return false;
            }
            if (typeof oResolver.resolveHashFragment !== "function") {
                jQuery.sap.log.error("NavTargetResolution: Custom Resolver must have \"resolveHashFragment\" member");
                return false;
            }
            aResolvers.push(oResolver);
            return true;
        };

        // specific custom resolvers enabled by a configuration
        // #1 localResolveNavigationResolver  : given an array in config.resolveLocal, resolve
        // given SO-action strings to a locally supplied configuration
        // member of a resolveLocal setting are locally resolved
        if (oServiceConfig && jQuery.isArray(oServiceConfig.resolveLocal)) {
            // register a custom resolver which redirects all !allowed to defaultOthersTo
            aLocalResolvedNavTargets = oServiceConfig.resolveLocal.map(function (oArg) {
                return oArg.linkId;
            });
            this.registerCustomResolver({
                name : "localResolveNavigationResolver",
                cleanHash : function (sHashFragment) {
                    if (sHashFragment === "") {
                        return "#";
                    }
                    var res = sap.ushell.Container.getService("URLParsing").parseShellHash(sHashFragment.substring(1));
                    if (!res) {
                        return "#";
                    }
                    sHashFragment = "#" + res.semanticObject + "-" + res.action;
                    return sHashFragment;
                },
                _getIndex : function (sOrigHashFragment) {
                    var sHashFragment = this.cleanHash(sOrigHashFragment);
                    return aLocalResolvedNavTargets.indexOf(sHashFragment.substring(1));
                },
                // applicability test
                isApplicable: function (sOrigHashFragment) {
                    return this._getIndex(sOrigHashFragment) >= 0;
                },
                // replace hash, then resolve to app
                resolveHashFragment : function (sHashFragment) {
                    var oDeferred,
                        idx = this._getIndex(sHashFragment),
                        oResolvedResult,
                        obj,
                        hasQM,
                        newsh;
                    // assume it is a configuration object
                    //{
                    //    additionalInformation : "SAPUI5.Component=sap.ushell.demoapps.FioriSandboxDefaultApp",
                    //    applicationType : "URL",
                    //    url : "../../../../../test-resources/sap/ushell/demoapps/FioriSandboxDefaultApp",
                    //},
                    oDeferred = new jQuery.Deferred();
                    oResolvedResult = JSON.parse(JSON.stringify(oServiceConfig.resolveLocal[idx].resolveTo));

                    // augment url with application parameters from sHashFragment
                    obj = sap.ushell.Container.getService("URLParsing").parseShellHash(sHashFragment);
                    if (obj && obj.params) {
                        newsh = sap.ushell.Container.getService("URLParsing").paramsToString(obj.params);
                        hasQM = oResolvedResult.url.indexOf('?') >= 0;
                        oResolvedResult.url = oResolvedResult.url + (hasQM ? "" : "?") + newsh;
                    }

                    oDeferred.resolve(oResolvedResult);
                    return oDeferred.promise();
                } // function resolveHashFragment
            });// function registerCustomResolver
        }//if resolveLocal

        // register one fixed resolver for Standalone resolution (portal use case)
        // this resolver
        // a) demonstrates a sample resolver
        // b) Allows to launch an application via a specific ( client side coded )
        //    Target  #Shell-runStandaloneApp
        // with the effective application beeing coded via hash parameters:
        //  sap-ushell-SAPUI5.Component
        //  sap-ushell-url
        //  as in:
        //       #Shell-runStandaloneApp?sap-ushell-SAPUI5.Component=...&sap-ushell-url=...
        //  example:
        //       http://<server>/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-client=120#Shell-runStandaloneApp?sap-ushell-SAPUI5.Component=sap.ushell.demo.AppNavSample&sap-ushell-url=%252Fsap%252Fbc%252Fui5_demokit%252Ftest-resources%252Fsap%252Fushell%252Fdemoapps%252FAppNavSample%253FA%253DURL%2526A%253DTAP%2526B%253DTAP%2526AA%253DTAP&MORE=fun
        //
        //
        //       #Test-local1 => local storage key  "sap.ushell#Test-local1"
        //       #Test-local2 => local storage key  "sap.ushell#Test-local1"
        //       #Test-url => sap-ushell-test-local1 , sap-ushell-test-url1-additionalInformation
        //  #Test-config

        this.registerCustomResolver({ name : "StandaloneLocalResolver",
            aElement : undefined,
            cleanHash : function (sHashFragment) {
                if (sHashFragment === "") {
                    return undefined;
                }
                var res = sap.ushell.Container.getService("URLParsing").parseShellHash(sHashFragment.substring(1));
                if (!res) {
                    return undefined;
                }
                sHashFragment = "#" + res.semanticObject + "-" + res.action;
                return sHashFragment;
            },
            isRunStandaloneHash : function (sHashFragment) {
                return typeof sHashFragment === "string" && sHashFragment.indexOf("#Shell-runStandaloneApp") === 0;
            },
            isApplicable: function (sHashFragment) {
                sHashFragment = this.cleanHash(sHashFragment);
                if (!sHashFragment) {
                    return false;
                }
                return sHashFragment === "#Test-url" ||
                    sHashFragment === "#Test-local1" ||
                    sHashFragment === "#Test-local2" ||
                    sHashFragment === "#Test-config" ||
                    sHashFragment === "#Test-clear" ||
                    this.isRunStandaloneHash(sHashFragment);
            },
            parseUrl : function (url) {
                if (!this.aElement) {
                    this.aElement = window.document.createElement('a');
                }
                this.aElement.href = url;
                return this.aElement;
            },
            resolveHashFragment : function (sHashFragment) {
                var oDeferred = new jQuery.Deferred(),
                    hardCoded = null,
                    that = this,
                    res,
                    oParsedShellHash,
                    oLocal,
                    additionalInformation,
                    sPrefix,
                    newsh,
                    hasQM,
                    oParams,
                    sFullHashFragment = sHashFragment,
                    url;
                sHashFragment = this.cleanHash(sHashFragment);
                if (!sHashFragment) {
                    return false;
                }
                hardCoded = {
                    "#Test-config" : {
                        applicationType: "URL",
                        url: "/sap/bc/ui5_ui5/ui2/ushell/test-resources/sap/ushell/demoapps/FioriSandboxConfigApp",
                        additionalInformation : //"SAPUI5.Component=AppNavSample"
                            "SAPUI5.Component=sap.ushell.demoapps.FioriSandboxConfigApp"
                    },
                    "none" : {
                        applicationType: "URL",
                        url: "",
                        additionalInformation : ""
                    }
                };

                function getFromLocalStorage(sKey) {
                    if (localStorage) {
                        return localStorage[sKey];
                    }
                    return undefined;
                }

                function filterParams(oParams, sKey) {
                    var res = {},
                        a;
                    for (a in oParams) {
                        if (oParams.hasOwnProperty(a)) { // correct Object.hasOwnProperty.call(this,a)
                            if (a !== sKey) {
                                res[a] = oParams[a];
                            }
                        }
                    }
                    return res;
                }

                // return undefined URL if not in same domain or not in runStandaloneAppFolderWhitelist
                function localURL(sUrl) {
                    if (sap.ushell.utils.calculateOrigin(that.parseUrl(sUrl)) !== sap.ushell.utils.calculateOrigin(window.location)) {
                        return undefined;
                    }
                    // on IE11, that.parseUrl(sUrl).pathname when set with /a/../b/ is /a/../b/,
                    // however, href is normalized ! so we use href to extract the normalized pathname /b/
                    // (and normalize again with URI)
                    var sPathNameUrl = (new URI(that.parseUrl(sUrl).href)).normalizePathname().pathname(),
                        oRunStandaloneAppFolderWhitelist = jQuery.sap.getObject("runStandaloneAppFolderWhitelist", 0, oServiceConfig),
                        sElement;
                    if (!oRunStandaloneAppFolderWhitelist) {
                        return undefined;
                    }
                    for (sElement in oRunStandaloneAppFolderWhitelist) {
                        if (oRunStandaloneAppFolderWhitelist.hasOwnProperty(sElement)) {
                            if (oRunStandaloneAppFolderWhitelist[sElement]) {
                                if (sElement === "*" || sPathNameUrl.indexOf((new URI(that.parseUrl(sElement).href)).normalizePathname().pathname()) === 0) {
                                    return sUrl;
                                }
                            }
                        }
                    }
                    return undefined;
                }
                function getURLParameter(sKey) {
                    return jQuery.sap.getUriParameters().get(sKey);
                }
                function getHashOrURLParameter(oParsedHash, sKey) {
                    return (oParsedHash.params && oParsedHash.params[sKey] && oParsedHash.params[sKey][0]) ||
                        getURLParameter(sKey);
                }
                function addToLocalStorage(sKey, sValue) {
                    if (localStorage) {
                        localStorage[sKey] = sValue;
                    }
                }
                if (hardCoded[sHashFragment]) {
                    res = hardCoded[sHashFragment];
                } else if (sHashFragment === "#Test-clear") {
                    addToLocalStorage("sap.ushell.#Test-local1", undefined);
                    addToLocalStorage("sap.ushell.#Test-local2", undefined);
                    jQuery.sap.log.info("NavTargetResolution: Local storage keys for #Test have been cleared");
                    res = hardCoded["#Test-config"];
                } else if (this.isRunStandaloneHash(sHashFragment)) {
                    oLocal = { applicationType : "URL" };
                    oParsedShellHash = sap.ushell.Container.getService("URLParsing").parseShellHash(sFullHashFragment);
                    additionalInformation =
                        (getHashOrURLParameter(oParsedShellHash, "sap-ushell-SAPUI5.Component") &&
                        "SAPUI5.Component=" + getHashOrURLParameter(oParsedShellHash, "sap-ushell-SAPUI5.Component")) ||
                        (getHashOrURLParameter(oParsedShellHash, "sap-ushell-additionalInformation"));
                    url = getHashOrURLParameter(oParsedShellHash, "sap-ushell-url") || "";
                    // blend the parameters together:
                    oParams = filterParams(oParsedShellHash.params, "sap-ushell-SAPUI5.Component");
                    oParams = filterParams(oParams, "sap-ushell-additionalInformation");
                    oParams = filterParams(oParams, "sap-ushell-url");
                    newsh = sap.ushell.Container.getService("URLParsing").paramsToString(oParams);
                    hasQM = url.indexOf('?') >= 0;
                    if (newsh) {
                        url = url + (hasQM ? (((url[url.length - 1] !== "&") && "&") || "") : "?") + newsh;
                    }
                    oLocal.url = localURL(url);
                    oLocal.additionalInformation = additionalInformation;
                    res = oLocal;
                } else if (sHashFragment === "#Test-local1" || sHashFragment === "#Test-local2" || sHashFragment === "#Test-url") {
                    res = getFromLocalStorage("sap.ushell." + sHashFragment);
                    if (!res || res === "undefined") {
                        oLocal = { applicationType : "URL" };
                    } else {
                        oLocal = JSON.parse(res);
                    }
                    // Configuring an app via url parameters is restricted to localhost for security reasons,
                    // unless explicitly enabled by config
                    if ((window.location.hostname === "localhost") ||
                            oServiceConfig.allowTestUrlComponentConfig) {
                        sPrefix = "sap-ushell-test-" + sHashFragment.substring(6);
                        additionalInformation = getURLParameter(sPrefix + "-additionalInformation");
                        if (additionalInformation) {
                            oLocal.additionalInformation = additionalInformation;
                        }
                        url = getURLParameter(sPrefix + "-url");
                        if (url) {
                            oLocal.url = localURL(url);
                        }
                    }
                    if (!oLocal.url) {
                        jQuery.sap.log.info("NavTargetResolution: No configured app for " + sHashFragment + " found ( local storage or url params sap-ushell-test-local1-url  sap-ushell-test-local1-additionalInfo  not supplied? ");
                        jQuery.sap.log.info("NavTargetResolution: Defaulting to config app ...\n");
                        oDeferred.reject("URL is not resolvable");
                        return oDeferred.promise();
                    }
                    oLocal.url = localURL(oLocal.url);
                    res = oLocal;
                }
                if (res.url === undefined) {
                    oDeferred.reject("URL is not resolvable");
                    return oDeferred.promise();
                }
                jQuery.sap.log.info("NavTargetResolution: As URL:  http://localhost:8080/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-ushell-test-local1-url=" + encodeURIComponent((res && res.url) || "") + "&sap-ushell-test-local1-additionalInformation=" + encodeURIComponent((res && res.additionalInfo) || "") + "#Test-local1");
                jQuery.sap.log.info("NavTargetResolution: Resolving " + sHashFragment + " to "  + JSON.stringify(res));
                oDeferred.resolve(res);
                return oDeferred.promise();
            }
            });

        /**
         * Returns the last successful resolution of a hash fragment or <code>undefined</code> if
         * no resolution has been performed yet.
         *
         * @private
         * @returns {object} the last successful resolution
         * @see #resolveHashFragment
         */
        this.getCurrentResolution = function () {
            return oCurrentResolution;
        };
    };
}());
