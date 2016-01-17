// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview Cross Application Navigation
 *
 *   This file exposes an API to perform (invoke) Cross Application Navigation
 *   for applications
 *
 *   It exposes interfaces to perform a hash change and/or trigger an external navigation
 *
 * @version 1.32.6
 */


/*global jQuery, sap, window */

(function () {
    "use strict";
    /*global jQuery, sap, location, setTimeout */
    jQuery.sap.declare("sap.ushell.services.CrossApplicationNavigation");
    jQuery.sap.require("sap.ushell.services.Personalization");

    /**
     * The Unified Shell's CrossApplicationNavigation service, which allows to
     *        navigate to external targets or create links to external targets
     *
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getService("CrossApplicationNavigation")</code>.
     * Constructs a new instance of the CrossApplicationNavigation service.
     *
     *
     * CrossApplicationNavigation currently provides platform independent functionality.
     *
     * This interface is for usage by applications or shell renderers/containers.
     *
     * Usage:
     *
     * example: see demoapps/AppNavSample/MainXML.controller.js
     *
     * <code>
     *   var xnavservice =  sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;<br/>
     *      && sap.ushell.Container.getService("CrossApplicationNavigation");<br/>
     *   var href = ( xnavservice && xnavservice.hrefForExternal({<br/>
     *          target : { semanticObject : "Product", action : "display" },<br/>
     *          params : { "ProductID" : "102343333" }<br/>
     *          })) || "";<br/>
     * </code>
     *
     *
     * Parameter names and values are case sensitive.
     *
     * Note that the usage of multi-valued parameters (specifying an array with more than one member as parameter value, e.g.
     * <code>  params : { A : ["a1", "a2"] } </code> )
     * is possible with this API but <b>strongly discouraged</b>. Especially the navigation target matching performed at the back-end
     * is not supported for multi-value parameters. Furthermore, it is not guaranteed that additional parameter values specified in the
     * back-end configuration are merged with parameter values passed in this method.
     *
     * Note that the application parameter length (including SemanticObject/Action) shall not exceed 512 bytes when serialized as UTF-8
     *
     * Note that when receiving the values as startup parameters (as part of the component data object) single values
     * are represented as an array of size 1. Above example is returned as
     * <code> deepEqual(getComponentData().startupParameters ,  { "ProductID" : [ "102343333" ] } ) </code>
     *
     * Make sure not to store security critical data within an URL
     * URLs may appear in a server log, be persisted inside and outside the system.
     *
     * Note: When constructing large URLs, the URLs may be shortened and persisted on a database server
     * for prolonged time, the actual data is persisted under a key accessible to any User (guessing the key).
     *
     * The same restrictions apply for the Application state
     *
     * @constructor
     * @class
     * @see sap.ushell.services.Container#getService
     * @since 1.15.0
     * @public
     */
    sap.ushell.services.CrossApplicationNavigation = function () {
        var oAppStateService;
        /**
         * Adds the system of the current application specified as <code>sap-system</code>
         * parameter in its URL to the parameter object <code>oTarget</code> used in the
         * methods {@link #hrefForExternal()} and {@link #toExternal()}.
         * The system is only added if the current application specifies it and
         * <code>oTarget</code> does not already contain this parameter.
         *
         * @param {object|string} vTarget
         *    The navigation target object or string, for example:
         *
         *  <code>
         *  {
         *      target: {
         *          semanticObject: "AnObject",
         *          action: "action"
         *      },
         *      params: { A: "B" }
         *  }
         *  </code>
         *
         *  or
         *
         *  <code>
         *  {
         *      target: {
         *          semanticObject: "AnObject",
         *          action: "action"
         *      },
         *      params: {
         *          A: ["B"],
         *          c: "e"
         *      }
         *  }
         *  </code>
         *
         *  or
         *
         *  <code>
         *  {
         *      target: {
         *          shellHash: "SO-36&jumper=postman"
         *      }
         *  }
         *  </code>
         *
         *  or
         *
         *  <code>
         *  "#SO-36&jumper=postman"
         *  </code>
         *
         * @param {object} [oComponent]
         *  the root component of the application
         *
         * @returns {string|object}
         *  the vTarget with the sap-system parameter appended (unless already
         *  present).
         * @private
         */
        function getTargetWithCurrentSystem(vTarget, oComponent) {
            var oResolution,
                sSeparator,
                sSystem,
                oClonedTarget,
                sShellHash,
                oComponentStartupParams;

            if (typeof vTarget !== "string" && !jQuery.isPlainObject(vTarget) && vTarget !== undefined) {
                jQuery.sap.log.error("Unexpected input type", null, "sap.ushell.services.CrossApplicationNavigation");
                return undefined;
            }

            if (vTarget === undefined) {
                return undefined;
            }

            if (oComponent) {
                if (typeof oComponent.getComponentData !== "function"    ||
                    !jQuery.isPlainObject(oComponent.getComponentData()) ||
                    !oComponent.getComponentData().startupParameters     ||
                    !jQuery.isPlainObject(oComponent.getComponentData().startupParameters)) {

                    jQuery.sap.log.error(
                        "Cannot call getComponentData on component",
                        "the component should be an application root component",
                        "sap.ushell.services.CrossApplicationNavigation"
                    );
                } else {
                    oComponentStartupParams = oComponent.getComponentData().startupParameters; // assume always present on root component
                    if (oComponentStartupParams.hasOwnProperty("sap-system")) {
                        sSystem = oComponentStartupParams["sap-system"][0];
                    }
                }
            } else {
                oResolution = sap.ushell.Container.getService("NavTargetResolution").getCurrentResolution();
                if (oResolution && oResolution["sap-system"]) {
                    sSystem = oResolution["sap-system"];
                } else if (oResolution && oResolution.url) {
                    sSystem = jQuery.sap.getUriParameters(oResolution.url).get("sap-system");
                }
            }

            if (jQuery.isPlainObject(vTarget)) {
                // needs deep copy
                oClonedTarget = jQuery.extend(true, {}, vTarget);
                if (!sSystem) {
                    return oClonedTarget;
                }
                if (oClonedTarget.target && oClonedTarget.target.shellHash) {
                    if (typeof oClonedTarget.target.shellHash === "string") {
                        // process shell hash as a string
                        oClonedTarget.target.shellHash = getTargetWithCurrentSystem(
                            oClonedTarget.target.shellHash, oComponent);
                    }
                    return oClonedTarget;
                }

                oClonedTarget.params = oClonedTarget.params || {};

                if (!Object.prototype.hasOwnProperty.call(oClonedTarget.params, "sap-system")) {
                    oClonedTarget.params["sap-system"] = sSystem;
                }

                return oClonedTarget;
            } else {
                sShellHash = vTarget;

                if (!sSystem) {
                    return sShellHash;
                }

                if (!/[?&]sap-system=/.test(sShellHash)) {
                    sSeparator = (sShellHash.indexOf("?") > -1) ? "&" : "?";
                    sShellHash += sSeparator + "sap-system=" + sSystem;
                }
                return sShellHash;
            }

        }

        /**
        * Returns a string which can be put into the DOM (e.g. in a link tag)
        *
        * @param {object} oArgs
        *     object encoding a semantic object and action
        *  e.g.
        *  <pre>
        *  {
        *     target : { semanticObject : "AnObject", action: "action" },
        *     params : { A : "B" }
        *  }
        *  </pre>
        *  or
        *  e.g.
        *  <pre>
        *  {
        *     target : {
        *        semanticObject : "AnObject",
        *        action: "action", context  : "AB7F3C"
        *     },
        *     params : {
        *        A : "B",
        *        c : "e"
        *     }
        *  }
        *  </pre>
        *  or
        *  <pre>
        *  {
        *     target : { shellHash : "SO-36&jumper=postman" }
        *  }
        *  </pre>
        * @param {object} [oComponent]
        *   the root component of the application
        * @param {bool} bAsync
        *   if set to <code>true</code>, a promise will be returned instead of
        *   the direct argument. The promise will only succeed after all
        *   compaction requests have been sent
        *
        * @returns {string}
        *   the href for the specified parameters; always starting with a
        *   hash character; all parameters are URL-encoded (via
        *   encodeURIComponent)
        *
        * Note that the application parameter length (including
        * SemanticObject/Action) shall not exceed 512 bytes when serialized as
        * UTF-8.
        *
        * The function can be used to convert an shell hash internal format
        * commonly encountered into the URL format to use in link tags:
        * <pre>
        * externalHash = oCrossApplicationNavigationService.hrefForExternal({
        *     target: {
        *         shellHash: oLink.intent
        *     }
        * }, that.oComponent);
        * </pre>
        *
        * @since 1.15.0
        * @public
        */
        this.hrefForExternal = function (oArgs, oComponent, bAsync) {
            var oArgsClone;
            if (sap.ushell && sap.ushell.services && sap.ushell.Container && typeof sap.ushell.Container.getService === "function" && sap.ushell.Container.getService("ShellNavigation")) {
                oArgsClone = getTargetWithCurrentSystem(oArgs, oComponent);
                return sap.ushell.Container.getService("ShellNavigation").hrefForExternal(oArgsClone, undefined, oComponent, bAsync);
            }

            jQuery.sap.log.debug("Shell not available, no Cross App Navigation");
            if (bAsync) {
                return (new jQuery.Deferred()).resolve("").promise();
            }
            return "";
        };

        /**
        * if sHashFragment is a compacted hash (sap-intent-param is present),
        * in a hash, this function replaces it into a long url with all parameters
        * expanded
        * @param {string} sHashFragment
        *   an (internal format) shell hash
        * @returns {object} promise
        *           the success handler of the resolve promise get an expanded shell hash
        *           as first argument
        * @public
        */
        this.expandCompactHash = function(sHashFragment) {
            return sap.ushell.Container.getService("NavTargetResolution").expandCompactHash(sHashFragment);
        };

        /**
         * using the browser history, this invocation attempts to navigate back to the previous application
         * This functionality simply performs a browser back today.
         * Its behaviour is subject to change.
         * It may not yield the expected result esp. on mobile devices where "back" is the previous
         * inner app state iff these are put into the history!
         *
         * @public
         */
        this.backToPreviousApp = function () {
            this.historyBack();
        };
        /**
         * performs window.history.back() if supported by the underlying
         * platform.
         * May be a noop if the url is the first url in the browser.
         *
         * @public
         */
        this.historyBack = function () {
            window.history.back();
        };
        /**
        *
        * Navigate to an external target
        *
        * @param {Object} oArgs
        * configuration object describing the target
        *
        *  e.g. <code>{ target : { semanticObject : "AnObject", action: "action" },<br/>
        *         params : { A : "B" } }</code>
        *    constructs sth. like   <code>#AnObject-action?A=B&C=e&C=j</code>;
        *  or
        *  e.g. <code>{ target : { semanticObject : "AnObject", action: "action", context  : "AB7F3C" },<br/>
        *         params : { A : "B", c : "e" } }</code>
        *  or
        *      <code>{ target : { shellHash : "SO-36&jumper=postman" },
        *      }</code>
        *
        * and navigate to it via changing the hash
        *
        * The actual navigation may occur deferred!
        *
        * Note that the application parameter length (including SemanticObject/Action) shall not exceed 512 bytes when serialized as utf-8
        * @param {object} [oComponent]
        *    an optional SAP UI5 Component,
        * @since 1.15.0
        * @public
        */
        this.toExternal = function (oArgs, oComponent) {
            var oArgsClone;
            if (sap.ushell && sap.ushell.services && sap.ushell.Container && typeof sap.ushell.Container.getService === "function" && sap.ushell.Container.getService("ShellNavigation")) {
                oArgsClone = getTargetWithCurrentSystem(oArgs, oComponent);
                sap.ushell.Container.getService("ShellNavigation").toExternal(oArgsClone, oComponent);
                return;
            }
            jQuery.sap.log.debug("Shell not avialable, no Cross App Navigation");
            return;
        };


        /**
         * Returns a string which can be put into the DOM (e.g. in a link tag)
         * given an application specific hash suffix
         *
         * Example: <code>hrefForAppSpecificHash("View1/details/0/")</code> returns
         * <code>#SemanticObject-action&/View1/details/0/</code> if the current application
         * runs in the shell and was started using "SemanticObject-action" as
         * shell navigation hash
         *
         * @param {string} sAppHash
         *   the app specific router, obtained e.g. via router.getURL(...)
         * @returns {string}
         * A string which can be put into the link tag,
         *          containing the current shell navigation target and the
         *          specified application specific hash suffix
         *
         * Note that sAppHash shall not exceed 512 bytes when serialized as UTF-8
         * @since 1.15.0
         * @public
         */
        this.hrefForAppSpecificHash = function (sAppHash) {
            if (sap.ushell && sap.ushell.services && sap.ushell.Container && typeof sap.ushell.Container.getService === "function" && sap.ushell.Container.getService("ShellNavigation")) {
                return sap.ushell.Container.getService("ShellNavigation").hrefForAppSpecificHash(sAppHash);
            }
            jQuery.sap.log.debug("Shell not available, no Cross App Navigation; fallback to app-specific part only");
            // Note: this encoding is to be kept aligned with the encoding in hasher.js ( see _encodePath( ) )
            return "#" + encodeURI(sAppHash);
        };


        /**
         * Resolves a given semantic object and business parameters to a list of links,
         * taking into account the form factor of the current device.
         *
         * @param {string} sSemanticObject
         *   the semantic object such as <code>"AnObject"</code>
         * @param {object} [mParameters]
         *   the map of business parameters with values, for instance
         *   <pre>
         *   {
         *     A: "B",
         *     c: "e"
         *   }
         *   </pre>
         * @param {boolean} [bIgnoreFormFactor=false]
         *   when set to <code>true</code> the form factor of the current device is ignored
         * @param {Object} [oComponent]
         *    SAP UI5 Component invoking the service
         * @param {string} [sAppStateKey]
         *    application state key to add to the generated links, SAP internal usage only
         * @param {boolean} [bCompactIntents]
         *    whether the returned intents should be returned in compact format. Defaults to false.
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which is resolved with an array of
         *   link objects containing (at least) the following properties:
         * <pre>
         * {
         *   intent: "#AnObject-action?A=B&C=e",
         *   text: "Perform action"
         * }
         * </pre>
         *
         * <b>NOTE:</b> the intents returned are in <b>internal</b> format and cannot be directly put into a link tag.
         * <p>
         * Example: Let the string <code>"C&A != H&M"</code> be a parameter value.
         * Intent will be encoded as<code>#AnObject-action?text=C%26A%20!%3D%20H%26M<code>.
         * Note that the intent is in <b>internal</b> format, before putting it into a link tag, you must invoke:
         * <code>externalHash = oCrossApplicationNavigationService.hrefForExternal({ target : { shellHash :  oLink.intent} }, that.oComponent);</code>
         * </p>
         *
         * @since 1.19.0
         * @public
         */
        this.getSemanticObjectLinks = function (sSemanticObject, mParameters, bIgnoreFormFactor, oComponent, sAppStateKey, bCompactIntents) {
            var mParametersPlusSapSystem = getTargetWithCurrentSystem({ params: mParameters }, oComponent).params,
                oSrv = sap.ushell.Container.getService("NavTargetResolution"),
                aExpandedIntents = sap.ushell.utils.invokeUnfoldingArrayArguments(oSrv.getSemanticObjectLinks.bind(oSrv),
                    [sSemanticObject, mParametersPlusSapSystem, bIgnoreFormFactor, oComponent, sAppStateKey, !!bCompactIntents]);

            return aExpandedIntents;
        };

        /**
         * Tells whether the given intent(s) are supported, taking into account the form factor of
         * the current device. "Supported" means that navigation to the intent is possible.
         *
         * @param {string[]} aIntents
         *   the intents (such as <code>["#AnObject-action?A=B&c=e"]</code>) to be checked
         * @param {object} [oComponent]
         *   the root component of the application
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which is resolved with a map
         *   containing the intents from <code>aIntents</code> as keys. The map values are
         *   objects with a property <code>supported</code> of type <code>boolean</code>.<br/>
         *   Example:
         * <pre>
         *   {
         *     "#AnObject-action?A=B&c=e": { supported: false },
         *     "#AnotherObject-action2": { supported: true }
         *   }
         * </pre>
         * Example usage:
         * <code>
         *   this.oCrossAppNav.isIntentSupported(["SalesOrder-approve?SOId=1234"])
         *   .done(function(aResponses) {
         *     if (oResponse["SalesOrder-approve?SOId=1234"].supported===true){
         *        // enable link
         *     }
         *     else {
         *        // disable link
         *     }
         *   })
         *   .fail(function() {
         *     // disable link
         *     // request failed or other error
         *   });
         * </code>
         * * @deprecated switch to isNavigationSupported
         * Note that this has a slightly different response format
         * @since 1.19.1
         * @public
         */
        this.isIntentSupported = function (aIntents, oComponent) {
            var oDeferred = new jQuery.Deferred(),
                mOriginalIntentHash = {}, // used for remapping
                aClonedIntentsWithSapSystem = aIntents.map(function (sIntent) {
                    var sIntentWithSystem = getTargetWithCurrentSystem(sIntent, oComponent); // returns clone

                    mOriginalIntentHash[sIntentWithSystem] = sIntent;

                    return sIntentWithSystem;
                });

            sap.ushell.Container.getService("NavTargetResolution")
                .isIntentSupported(aClonedIntentsWithSapSystem)
                    .done(function (mIntentSupportedPlusSapSystem) {
                        /*
                         * Must restore keys to what the application expects,
                         * as per NavTargetResolution contract.
                         */
                        var mIntentSupportedNoSapSystem = {};
                        Object.keys(mIntentSupportedPlusSapSystem).forEach(function (sKeyPlusSapSystem) {
                            mIntentSupportedNoSapSystem[
                                mOriginalIntentHash[sKeyPlusSapSystem]
                            ] = mIntentSupportedPlusSapSystem[sKeyPlusSapSystem];
                        });
                        oDeferred.resolve(mIntentSupportedNoSapSystem);
                    })
                    .fail(oDeferred.reject.bind(oDeferred));

            return oDeferred.promise();
        };

        /**
         * Tells whether the given navigation intent(s) are supported for the given
         * parameters, form factor etc
         * "Supported" means that a valid navigation target is configured for the
         * user for the given device.
         *
         * This is effectively a test function for {@link toExternal}/ {@link hrefForExternal}.
         * It is functionally equivalent to {@link isIntentSupported} but accepts the same interface
         * as {@link toExternal}/ {@link hrefForExternal}.
         *
         * @param {object[]} aIntents
         *   the intents (such as <code>["#AnObject-action?A=B&c=e"]</code>) to be checked
         * with object being instances the oArgs object of toExternal, hrefForExternal etc.
         *
         *  e.g. <code>
         *  {
         *      target: {
         *          semanticObject: "AnObject",
         *          action: "action"
         *      },
         *      params: {
         *          A: "B"
         *      }
         *  }
         *  </code>
         *  or
         *  e.g. <code>
         *  {
         *      target: {
         *          semanticObject: "AnObject",
         *          action: "action"
         *      },
         *      params: {
         *          A: "B",
         *          c: "e"
         *      }
         *  }
         *  </code>
         *  or
         *  <code>
         *  {
         *      target: {
         *          shellHash: "SO-36&jumper=postman"
         *      },
         *  }
         *  </code>
         * @param {object} [oComponent]
         *   the root component of the application
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which is resolved with an array (!) of
         *   objects representing whether the intent is supported or not
         *   objects with a property <code>supported</code> of type <code>boolean</code>.<br/> representing
         *   Example:
         *
         * aIntents:
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
         * response: [Indices correspond]
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
        this.isNavigationSupported = function (aIntents, oComponent) {
            var aClonedIntents = aIntents.map(function (oIntent) {
                return getTargetWithCurrentSystem(oIntent, oComponent); // returns clone
            });

            return sap.ushell.Container.getService("NavTargetResolution")
                .isNavigationSupported(aClonedIntents);
        };


        /**
         * Tells whether the given URL is supported for the current User.
         *
         * A URL is either supported if it is an intent and a target for the user exists
         * or if it not recognized as a Fiori intent of the same launchpad:
         * Examples for URLs qualified as "supported"
         * E.g.:
         *  * a non-fiori url, e.g. <code>www.sap.com</code> <code>http://mycorp.com/sap/its/webgui</code>
         *  * a hash not recognized as an intent  <code>#someotherhash</code>
         *  * a Fiori URL pointing to a different launchpad
         *
         * <pre>
         *   "https://www.sap.com" -> true, not rejected
         *   "#NotAFioriHash" -> true, not rejected
         *   "#PurchaseOrder-approve?POId=1899" -> true (if application is assigned to user)
         *   "#SystemSettings-change?par=critical_par" -> false (assuming application is not assigned to user)
         *   "https://some.other.system/Fiori#PurchaseOrder-approve?POId=1899" -> true, not rejected
         * </pre>
         *
         * Note that this only disqualifies intents for the same Launchpad.
         * It does not validate whether a URL is valid in general.
         *
         * @param {string} sUrl
         *   URL to test
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which is resolved
         *   if the URL is supported and rejected if not. The promise does not
         *   return parameters.
         *
         * @since 1.30.0
         * @private
         */
        this.isUrlSupported = function (sUrl) {
            var oDeferred = new jQuery.Deferred(),
                oUrlParsingService,
                sHash;
            if (typeof sUrl !== "string") {
                oDeferred.reject();
                return oDeferred.promise();
            }
            oUrlParsingService = sap.ushell.Container.getService("URLParsing");
            if (oUrlParsingService.isIntentUrl(sUrl)) {
                sHash = oUrlParsingService.getHash(sUrl);
                this.isIntentSupported(["#" + sHash])
                    .done(function (oResult) {
                        if (oResult["#" + sHash] && oResult["#" + sHash].supported) {
                            oDeferred.resolve();
                        } else {
                            oDeferred.reject();
                        }
                    })
                    .fail(function () {
                        oDeferred.reject();
                    });
            } else {
                oDeferred.resolve();
            }
            return oDeferred.promise();
        };

        /**
         * Resolves a given navigation intent (if valid) and returns
         * the respective component instance for further processing.
         *
         * This method should be accessed by the Unified Inbox only.
         *
         * @param {string} sIntent
         *     Semantic object and action as a string with a "#" as prefix
         * @param {object} oConfig
         *     Configuration used to instantiate the component
         * @returns {object} promise (component instance)
         *
         * @since 1.32.0
         * @private
         */
        this.createComponentInstance = function (sIntent, oConfig) {
            var oDeferred = new jQuery.Deferred(),
                oUrlParsingService = sap.ushell.Container.getService("URLParsing"),
                sCanonicalIntent = oUrlParsingService.constructShellHash(oUrlParsingService.parseShellHash(sIntent));

            // abort if intent is invalid
            if (!sCanonicalIntent) {
                oDeferred.reject("Navigation intent invalid!");
                return oDeferred.promise();
            }

            sap.ushell.Container.getService("NavTargetResolution").resolveHashFragment("#" + sCanonicalIntent)
                .done(function (oResult) {
                    var iIndex = oResult.url.indexOf("?"),
                        oComponentData = { startupParameters : {}};

                    oConfig = oConfig || {};

                    // If the application type equals "URL" and additionalInformation is undefined,
                    // the promise will be rejected if additionalInformation is not checked for
                    // existence.
                    if (oResult.applicationType !== sap.ushell.components.container.ApplicationType.URL
                            && !(/^SAPUI5\.Component=/.test(oResult.additionalInformation))) {
                        oDeferred.reject("The resolved target mapping is not of type UI5 component.");
                        return oDeferred.promise();
                    }

                    if (iIndex >= 0) {
                        oComponentData.startupParameters = jQuery.sap.getUriParameters(oResult.url).mParams;
                        oComponentData["sap-xapp-state"] = oComponentData.startupParameters["sap-xapp-state"];
                        delete oComponentData.startupParameters["sap-xapp-state"];
                        oResult.url = oResult.url.slice(0, iIndex);
                    }

                    oConfig.name = oResult.additionalInformation &&
                        oResult.additionalInformation.replace(/^SAPUI5\.Component=/, "");
                    oConfig.url = oResult.url;

                    if (oConfig.componentData) {
                        jQuery.extend(true, oComponentData, oConfig.componentData);
                    }

                    oConfig.componentData = oComponentData;

                    if (oConfig.async === true) {
                        sap.ui.component(oConfig).then(
                            function (oComponent) {
                                oDeferred.resolve(oComponent);
                            },
                            function (oError) {
                                // errors always logged per component
                                oError = oError || "";
                                jQuery.sap.log.error("Cannot create UI5 component: " + oError,
                                    oError.stack,
                                    "sap.ushell.services.CrossApplicationNavigation");
                                oDeferred.reject(oError);
                            }
                        );
                    } else {
                        oDeferred.resolve(sap.ui.component(oConfig));
                    }

                })
                .fail(function (sMessage) {
                    oDeferred.reject(sMessage);
                });

            return oDeferred.promise();
        };

        /**
         * Creates an empty app state object which act as a parameter container for
         * cross app navigation.
         * @param {object} oAppComponent - a UI5 component used as context for the app state
         * @return {object} App state Container
         * @since 1.28
         * @protected  SAP Internal usage only, beware! internally public, can not be changed,
         * but not part of the public documentation
         */
        this.createEmptyAppState = function (oAppComponent) {
            if (!oAppStateService) {
                oAppStateService = sap.ushell.Container.getService("AppState");
            }
            if (!(oAppComponent instanceof sap.ui.core.UIComponent)) {
                throw new Error("oAppComponent passed must be a UI5 Component");
            }
            return oAppStateService.createEmptyAppState(oAppComponent);
        };

        /**
         * Get the app state object that was used for the current cross application navigation
         * @param {object} oAppComponent - UI5 component, key will be extracted from component data
         * @return {object} promise object returning the app state object
         *    Note that this is an unmodifiable container and its data must be copied into a writable container!
         * @since 1.28
         * @protected  SAP Internal usage only, beware! internally public, can not be changed, but not part of the
         * public documentation
         */
        this.getStartupAppState = function (oAppComponent) {
            this._checkComponent(oAppComponent);
            var sContainerKey = oAppComponent.getComponentData() && oAppComponent.getComponentData()["sap-xapp-state"] && oAppComponent.getComponentData()["sap-xapp-state"][0];
            return this.getAppState(oAppComponent, sContainerKey);
        };

        /**
         * Check that oAppComponent is of proper type
         * Throws if not correct, returns undefined
         * @param {object} oAppComponent
         *   application component
         * @private
         */
        this._checkComponent = function (oAppComponent) {
            if (!(oAppComponent instanceof sap.ui.core.UIComponent)) {
                throw new Error("oComponent passed must be a UI5 Component");
            }
        };

        /**
         * Get an app state object given a key
         * A lookup for a cross user app state will be performed.
         * @param {object} oAppComponent - UI5 component, key will be extracted from component data
         * @param {object} sAppStateKey - the application state key
         *  SAP internal usage only
         * @return {object} promise object returning the app state object
         *    Note that this is an unmodifiable container and its data must be copied into a writable container!
         * @since 1.28
         * @protected  SAP Internal usage only, beware! internally public, can not be changed, but not part of the
         * public documentation
         */
        this.getAppState = function (oAppComponent, sAppStateKey) {
            // see stakeholders in SFIN etc.
            var oContainer,
                oDeferred = new jQuery.Deferred();
            this._checkComponent(oAppComponent);
            if (!oAppStateService) {
                oAppStateService = sap.ushell.Container.getService("AppState");
            }
            if (typeof sAppStateKey !== "string") {
                if (sAppStateKey !== undefined) {
                    jQuery.sap.log.error("Illegal Argument sAppStateKey ");
                }
                setTimeout(function () {
                    oContainer = oAppStateService.createEmptyUnmodifiableAppState(oAppComponent);
                    oDeferred.resolve(oContainer);
                }, 0);
                return oDeferred.promise();
            }
            return oAppStateService.getAppState(sAppStateKey);
        };

        /**
         * Get data of an AppStates data given a key
         * A lookup for a cross user app state will be performed.
         * @param {object} sAppStateKeyOrArray - the application state key, or an array, see below
         *  SAP internal usage only
         * @return {object} promise object returning the data of an AppState object,
         * or an empty <code>{}</code> javascript object if the key could not be resolved or
         * an error occurred!
         * @since 1.32
         * @protected  SAP Internal usage only, beware! internally public, can not be changed, but not part of the
         * public documentation
         * This is interface exposed to platforms who need a serializable form of the application state
         * data
         *
         * Note: this function may also be used in a multivalued invocation:
         * pass as sAppStateKey an array <code>[["AppStateKey1"],["AppStateKey2"],...]</code>
         * the result of the response will an corresponding array of array
         * <code>[[{asdata1}],[{asdata2}]</code>
         * @private
         * internal usage(exposure to WebDypnro ABAP)
         */
        this.getAppStateData = function (sAppStateKeyOrArray) {
            return sap.ushell.utils.invokeUnfoldingArrayArguments(this._getAppStateData.bind(this),
                    [sAppStateKeyOrArray]);
        };
        /**
         * Get data of an AppStates data given a key
         * A lookup for a cross user app state will be performed.
         * @param {object} sAppStateKey - the application state key, or an array, see below
         *  SAP internal usage only
         * @return {object} promise object returning the data of an AppState object,
         * or an empty <code>{}</code> javascript object if the key could not be resolved or
         * an error occurred!
         * @since 1.32
         * @protected  SAP Internal usage only, beware! internally public, can not be changed, but not part of the
         * public documentation
         * This is interface exposed to platforms who need a serializable form of the application state
         * data
         *
         * Note: this function may also be used in a multivalued invocation:
         * pass as sAppStateKey an array <code>[["AppStateKey1"],["AppStateKey2"],...]</code>
         * the result of the response will an corresponding array of array
         * <code>[[{asdata1}],[{asdata2}]</code>
         * @private
         */
        this._getAppStateData = function (sAppStateKey) {
            var oDeferred = new jQuery.Deferred();
            if (!oAppStateService) {
                oAppStateService = sap.ushell.Container.getService("AppState");
            }
            if (typeof sAppStateKey !== "string") {
                if (sAppStateKey !== undefined) {
                    jQuery.sap.log.error("Illegal Argument sAppStateKey ");
                }
                setTimeout(function () {
                    oDeferred.resolve(undefined);
                }, 0);
            } else {
                oAppStateService.getAppState(sAppStateKey).done(function(oAppState) {
                    oDeferred.resolve(oAppState.getData());
                }).fail(oDeferred.resolve.bind(oDeferred,undefined));
            }
            return oDeferred.promise();
        };
        /**
         * persist multiple app states
         * (in future potentially batched in a single roundtrip)
         * @param {Array} aAppStates
         *    Array of application States
         * @returns {object} a jQuery.Deferred
         * returns a promise, in case of success an array of individual save promise objects is returned as argument
         * in case of a reject, individual respones are not available
         * @private see remarks in getAppState
         */
        this.saveMultipleAppStates = function (aAppStates) {
            var aResult = [],
                oDeferred = new jQuery.Deferred();
            aAppStates.forEach(function (oAppState) {
                aResult.push(oAppState.save());
            });
            jQuery.when.apply(this, aResult).done(function () {
                oDeferred.resolve(aResult);
            }).fail(function () {
                oDeferred.reject("save failed");
            });
            return oDeferred.promise();
        };
    }; // CrossApplicationNavigation

    sap.ushell.services.CrossApplicationNavigation.hasNoAdapter = true;
}());
