// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview
 *
 * <p>This module performs client side navigation target resolution.</p>
 *
 * <p>This Module focuses on the core algorithm of matching an intent against a
 * list of AppDescriptor signature objects (aka TargetMappings in AppDescriptor
 * V3 format), which in addition have a property resolutionResult representing
 * an "opaque" resolutionResult.</p>
 *
 * <p>getSemanticObjectLinks should be called with already expanded hash fragment.
 * The output of getSemanticObjectLinks should then be postprocessed for
 * compaction, outside this service.</p>
 *
 * <p>
 *   Missing:
 *   <ul>
 *   <li>Scope mechanism</li>
 *   <li>Parameter expansion with dynamic parameters</li>
 *   </ul>
 * </p>
 *
 * <p><b>NOTE:</b> Currently the ABAP adapter also delegates isIntentSupported
 * <b>only</b> (=erroneously) to the resolveHashFragment adapter implementation,
 * missing intents injected via custom resolver plug-ins.  The custom resolver
 * hook functionality is currently outside of this method (only affecting
 * resolveHashFragment), as before. The future architecture should handle this
 * consistently.</p>
 *
 * <p><b>NOTE:</b> Old implementations also gave inconsistent results. For example
 * the ABAP adapter on isIntentSupported did call directly the adapter, not the
 * service, thus missing additional targets added only via a custom resolver.</p>
 *
 * <p> In the future, the custom resolver mechanism should be probably moved
 * towards modifying (or only adding to the list of TargetMappings), this way a
 * single data source has to be altered to support consistently
 * getSemanticObjectLinks, isIntentSupported.</p>
 *
 * @version
 * 1.32.6
 */
(function () {
    "use strict";
    /*global jQuery, sap */
    jQuery.sap.declare("sap.ushell.services.ClientSideTargetResolution");

    jQuery.sap.require("sap.ushell.utils");

    /**
     * <p>A module to perform client side target resolution where possible, based
     * on a complete list of Target Mappings.</p>
     *
     * <p>This list defines a common strategy for selecting <b>one</b> appropriate
     * target (even in case of conflicts) across all platforms.</p>
     *
     * <p>The interface assumes a <b>complete</b> list of target mappings has been
     * passed, including parameter signatures. The array of signatures is to be
     * injected by the <code>oAdapter.getInbounds()</code> function, which is invoked by the
     * <code>_ensureTargetMappings()</code> function.</p>
     *
     * <p>Note that the resolution results (e.g. targets and descriptions) may
     * <b>not</b> be present on the client.</p>
     *
     * <p>All interfaces shall still be asynchronous interfaces w.r.t client
     * invocation.</p>
     *
     * The following request can be served from the client:
     * <ol>
     * <li>isIntentSupported</li>
     * <li>getSemanticObjectLinks</li>
     * </ol>
     *
     * <p>This module does <b>not</b> perform hash expansion or compaction.</p> This
     * is performed by respective preprocessing of the hash (see
     * {@link sap.ushell.services.NavTargetResolution#resolveHashFragment}) and:</p>
     *
     * <ul>
     * <li>resolveHashFragment    (expansion, NavTargetResolution.isIntentSupported)</li>
     * <li>isIntentSupported
     * <li>getSemanticObjectLinks   (post processing, Service)</li>
     * </ul>
     *
     * Usage:
     *
     * <pre>
     * var oSrvc = sap.ushell.Container.getService("ClientSideTargetResolution");
     * oSrvc.isIntentSupported("#SemanticObject-action");
     * </pre>
     *
     * @param {object} oAdapter
     *   Adapter, provides TargetMapping/Signature array
     * @param {object} oContainerInterface
     *   Not in use
     * @param {string} sParameters
     *   Parameter string, not in use
     * @param {object} oServiceConfiguration
     *   The service configuration not in use
     *
     * @constructor
     * @class
     * @see {@link sap.ushell.services.Container#getService}
     * @since 1.32.0
     */
    sap.ushell.services.ClientSideTargetResolution = function (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        var _aTargetMappings = [],       // keeps an array of target mappings
            oHaveTargetMappingsDeferred, // deferred object resolved once TMs are obtained
            oURLParsing;                 // the URLParsing service

        /**
         * Makes sure that the <code>_aTargetMappings</code> array is filled
         * with target mappings.
         *
         * A target mapping in the list has a structure like the following:
         *
         * <pre>
         * {
         *     semanticObject: {string},
         *     action: {string},
         *     signature: {
         *         parameters: {
         *             "parameter1" {
         *                 "defaultValue": {
         *                     value: "abc"
         *                 },
         *                 "filter": {
         *                     value: "(abc)|(def)",
         *                     format: "regexp"
         *                 },
         *                 "required": true
         *             },
         *             ... more parameters
         *         }
         *         additionalParameters: "nomatch", // "allowed", "ignored"
         *    }
         * }
         * </pre>
         *
         * @returns {jQuery.Deferred.promise}
         *    a jQuery promise that is resolved with the list of target
         *    mappings obtained.
         * @private
         */
        this._ensureTargetMappings = function() {
            var fnGetInbounds = oAdapter.getInbounds;
            if (!fnGetInbounds) {
                fnGetInbounds = oAdapter.getTMs;
            }
            if (!oHaveTargetMappingsDeferred) {
                oHaveTargetMappingsDeferred = new jQuery.Deferred();

                fnGetInbounds.call(oAdapter).done(function (aTargetMappings) {
                    _aTargetMappings = aTargetMappings;
                    oHaveTargetMappingsDeferred.resolve(_aTargetMappings);
                }).fail(
                    oHaveTargetMappingsDeferred.reject.bind(oHaveTargetMappingsDeferred)
                );
            }

            return oHaveTargetMappingsDeferred.promise();
        };

        this._getURLParsing = function () {
            if (oURLParsing) {
                return oURLParsing;
            }
            return sap.ushell.Container.getService("URLParsing");
        };

        /**
         * Construct the effective parameter list. This is the union of:
         * <ul>
         *   <li>Intent parameters minus the sap-ushell-defaultedParameterNames
         *   if present (it's a output only reserved parameter).</li>
         *   <li>Any target mapping parameter with a known (resolved reference
         *   or plain value) <code>defaultValue</code> specified.</li>
         * </ul>
         *
         * <p>Reference default values will not be part of the effective parameter
         * list if their value is yet to be determined.</p>
         *
         * @param {object} oIntentParams
         *    Intent parameter object (not modified!)
         * @param {object} oSignatureParams
         *    Signature structure
         * @param {object} oKnownUserDefaultRefsIn
         *    The input user default reference object. See {@link #_matchToTargetMapping}
         * @param {string[]} aMissingUserDefaultRefsIfMatch
         *    Parameters that should be added as missing parameters in case the match is successful
         * @param {string[]} aDefaultedParamNames
         *    Output array of parameters that were not present in the signature
         *
         * @returns {object}
         *    The effective parameter list.
         * <p>
         * NOTE: may be a shallow copy of actual parameter arrays!
         * </p>
         *
         * @private
         * @since 1.32.0
         */
        this._addDefaultParameterValues = function (oIntentParams, oSignatureParams, oKnownUserDefaultRefsIn, aMissingUserDefaultRefsIfMatch, aDefaultedParamNames) {
            var oIntentParamsPlusDefaults = {},
                oDefaultedParameters = {}; // keeps unique entries

            // add the intent parameters first (exclude the sap-ushell-defaultedParamNames)
            Object.keys(oIntentParams).forEach(function (sParamName) {
                // this parameter is output only, and must be ignored during resolveHashFragment
                if (sParamName !== "sap-ushell-defaultedParameterNames") {
                    oIntentParamsPlusDefaults[sParamName] = oIntentParams[sParamName];
                }
            });

            if (!oSignatureParams) {
               return oIntentParamsPlusDefaults;
            }

            // add default parameters on top
            Object.keys(oSignatureParams).forEach(function (sParamName) {
                var oTmSignatureParam = oSignatureParams[sParamName],
                    sTmSignatureParamDefaultValue,
                    bValueKnown = false;

                if (!oIntentParamsPlusDefaults[sParamName] && oTmSignatureParam.hasOwnProperty("defaultValue")) {

                    if (oTmSignatureParam.defaultValue.format &&
                        oTmSignatureParam.defaultValue.format === "reference") {

                        // is there a known value for this reference?
                        sTmSignatureParamDefaultValue = oTmSignatureParam.defaultValue.value;
                        if (oKnownUserDefaultRefsIn.hasOwnProperty(sTmSignatureParamDefaultValue)) {

                            if (typeof oKnownUserDefaultRefsIn[sTmSignatureParamDefaultValue] === "string") {
                                // ... user default value was found
                                oIntentParamsPlusDefaults[sParamName] = [ oKnownUserDefaultRefsIn[sTmSignatureParamDefaultValue] ];
                                bValueKnown = true;
                            }
                            // else discard this default parameter
                        } else {
                            // ... no user default value found
                            oIntentParamsPlusDefaults[sParamName] = [ oTmSignatureParam.defaultValue ]; // NOTE: ref

                            aMissingUserDefaultRefsIfMatch.push(oTmSignatureParam.defaultValue.value);
                        }
                    } else {
                        oIntentParamsPlusDefaults[sParamName] = [ oTmSignatureParam.defaultValue.value ];
                        bValueKnown = true;
                    }

                    // Important, only add known values!
                    if (bValueKnown) {
                        oDefaultedParameters[sParamName] = true;
                    }
                }
            });

            Object.keys(oDefaultedParameters).forEach(function (sParam) {
                aDefaultedParamNames.push(sParam);
            });

            return oIntentParamsPlusDefaults;
        };


        /**
         * Checks that a value matches a filter.
         *
         * @param {string} sValue
         *    Filter value to test, may be undefined or string
         * @param {object} oFilter
         *    Filter object as defined in app descriptor input signature, may
         *    be undefined.
         * @param {object} oKnownUserDefaultRefsIn
         *    The set of known reference values. See {@link #_matchToTargetMapping}
         * @param {object} oMissingUserDefaultRefsOut
         *    The set of missing references. See {@link #_matchToTargetMapping}
         *
         * @returns {boolean}
         *    Match result
         *
         * @private
         * @since 1.32.0
         */
        this._matchesFilter = function(sValue, oFilter, oKnownUserDefaultRefsIn, oMissingUserDefaultRefsOut) {
            var sFilterValue;

            if (!oFilter) {
                return true; // no filter -> match
            }
            if (!sValue && sValue !== "") {
                return false;
            }

            sFilterValue = oFilter.value;

            if (oFilter.format === "reference") {
                // if we have this value, check if it matches...
                if (oKnownUserDefaultRefsIn.hasOwnProperty(sFilterValue)) {
                    return sValue === oKnownUserDefaultRefsIn[sFilterValue];
                }

                // ...or save reference if found for the first time
                oMissingUserDefaultRefsOut[sFilterValue] = true;

                return true;
            }
            if (oFilter.format === "value" || oFilter.format === "plain" || oFilter.format === undefined) {
                return sValue === oFilter.value;

            } else if (oFilter.format === "regexp") {
                return !!sValue.match("^" + oFilter.value + "$");

            } else {
                jQuery.sap.log.error("illegal oFilter format");
                return false;
            }
        };

        this._addSortString = function(oMatchResult) {
            function addLeadingZeros(iNumber) {
                var s = "000" + iNumber;
                return s.substr(s.length - 3);
            }

            oMatchResult.priorityString = [
                /*
                 * General idea: the target mapping that fits best to the
                 * intent has priority.
                 *
                 * NOTE1: when it comes to the digits, we later sort from large
                 *        to small. So a higher number 005 has precedence over
                 *        a lower number 003.
                 *
                 * NOTE2: all intent parameters are matching the target mapping
                 *         at this point.
                 *
                 * Terminology:
                 *
                 * - Required parameter: a parameter that appears in the TM
                 *   signature with the flag "required = true".
                 *
                 * - Filter parameter: a parameter that appears in the TM
                 *   signature in the form "filter: { value: ... }" or
                 *   "filter: {}".
                 *
                 * - Default parameter: a parameter that appears in the TM
                 *   signature in the form "defaultValue: { value: ... }" or
                 *   "defaultValue: {}".
                 *
                 * - Defaulted parameter: a default parameter with a specified
                 *   value that will be added to the intent parameter if match
                 *   occurred.
                 *
                 * - Free parameter: a parameter of the Target Mapping
                 *   signature that is not an intent parameter.
                 *
                 * NOTE: a certain parameter can specify
                 * filter/default/required at the same time. E.g., {
                 *    "param": {
                 *       required: true,
                 *       filter: {}, // param must exist
                 *       defaultValue: {
                 *          value: "apple" // will be defaulted to "apple" if not specified
                 *       }
                 *    }
                 *
                 * }
                 */

                /*
                 * Exact SemanticObject matches have priority
                 *
                 * g: generic  x: explicit/exact semantic object (NOTE: "x" > "g")
                 */
                oMatchResult.genericSO ? "g" : "x",

                /*
                 * Number of matching parameters.
                 *
                 * Number target mapping parameters that match the intent. For
                 * filter parameters, the corresponding intent parameter must
                 * have a matching value specified.
                 */
                "MTCH=" + addLeadingZeros(oMatchResult.countMatchingParams),
                /*
                 * Number of matching required parameters.
                 *
                 * Number target mapping parameters that match the intent and
                 * are required.
                 */
                "MREQ=" + addLeadingZeros(oMatchResult.countMatchingRequiredParams),
                /*
                 * Number of Matching filter parameters.
                 *
                 * Number target mapping parameters that match the intent and
                 * specify a filter value.
                 */
                "NFIL=" + addLeadingZeros(oMatchResult.countMatchingFilterParams),
                /*
                 * Number of Defaulted parameters
                 *
                 * Target mapping parameters that are not part of the intent
                 * but specify a default value (defaulted parameters).
                 */
                "NDEF=" + addLeadingZeros(oMatchResult.countDefaultedParams),
                /*
                 * Number of Potentially matching parameters
                 *
                 * Intent parameters that can potentially match the target mapping.
                 */
                "POT=" + addLeadingZeros(oMatchResult.countPotentiallyMatchingParams),
                /*
                 * Reverse number of target mapping parameters that were not
                 * found in the intent (free parameters).
                 */
                "RFRE=" + addLeadingZeros(999 - oMatchResult.countFreeTargetMappingParams)
            ].join(" ");
        };

        /**
         * Checks whether additional intent parameter (plus defaults) conform
         * to the signature expectation regarding additionalParameters.
         *
         * @param {object} oTM
         *    The target mapping
         * @param {object} oIntentParamsPlusDefaults
         *    The intent parameters (plus defaults)
         *
         * @returns {boolean}
         *    Whether additional intent parameters conform to the signature
         *    expectations.
         *
         * @private
         */
        this._checkAdditionalParameters = function(oTM, oIntentParamsPlusDefaults) {
            var bAdditionalParametersMatchExpectation = false;

            if (oTM.signature.additionalParameters === "allowed" ||
                oTM.signature.additionalParameters === "ignored") {

                return true;
            }

            if (oTM.signature.additionalParameters === "nomatch" ||
                oTM.signature.additionalParameters === undefined ) {

                bAdditionalParametersMatchExpectation =
                    Object.keys(oIntentParamsPlusDefaults).every(function (sParamName) {
                        return (!oTM.signature.parameters[sParamName] && sParamName.indexOf("sap-") !== 0)
                            ? false  // parameter not in TM signature and not sap- parameter
                            : true;
                    });

            } else {
                jQuery.sap.log.error("Unexpected value of target mapping for signature.additionalParameters");
            }

            return bAdditionalParametersMatchExpectation;
        };

        /**
         * Update oMissingUserDefaultRefsOut (containing filter user defaults)
         * with any default parameters that were found during defaulting.
         *
         * @param {array} aUserDefaultRefsIfMatch
         *     The user default references that must be added to
         *     <code>oUserDefaultRefsOut</code> if the match occurred
         * @param {object} oMissingUserDefaultRefsOut
         *     The user default references required to perform a
         *     non-approximate matching
         *
         * @private
         * @since 1.32.0
         */
        this._addFoundParametersToUserDefaultRefs = function (aUserDefaultRefsIfMatch, oMissingUserDefaultRefsOut) {
            aUserDefaultRefsIfMatch.forEach(function (sRefValue) {
                oMissingUserDefaultRefsOut[sRefValue] = true;
            });
        };

        /**
         * Extract an integer value from a parameter "sap-priority" if present
         * among the intent parameters, and adds it to the passed mutated
         * object.
         *
         * @param {object} oIntentParams
         *    The intent parameters that may contain the "sap-priority" to be
         *    parsed.
         * @param {object} oMutated
         *    The mutated object to write the parsed "sap-priority" parameter
         *    to.
         *
         * @private
         * @since 1.32.0
         */
        this._extractSapPriority = function (oIntentParams, oMutated) {
            var iSapPriority;
            if (oIntentParams && oIntentParams["sap-priority"] && oIntentParams["sap-priority"][0] ) {
                iSapPriority = parseInt(oIntentParams["sap-priority"][0], 10);
                if (!isNaN(iSapPriority)) {
                    oMutated["sap-priority"] = iSapPriority;
                }
            }
            return;
        };

        /**
         * Perform matching between an intent and the given target mapping. The
         * matching procedure takes into account references (to user default
         * values) in filters and default values.<br />
         *
         * <ul>
         *   <li>A target mapping with a filter reference (to a user default)
         *     is matched against a given intent if the intent specifies the
         *     filter (name) among its parameters. Otherwise a match does
         *     not occur.
         *   </li>
         *   <li>A target mapping with a default reference (to a user default)
         *     is matched as if such default value was not specified in the
         *     target mapping signature.
         *   </li>
         * </ul>
         *
         * Any reference value involved in the match will be added to the
         * output parameter aMissingUserDefaultRefsOut array, indicating that
         * the returned result is a "potential" match. To obtain a certain
         * result, this method must be called again with resolved references
         * (supplied via the oKnownUserDefaultRefsIn parameter).
         *
         * @param {object} oIntent
         *    The parsed shell hash representing an intent.<br />
         *    <br />
         *    NOTE: this method treats the semantic object/action/formFactor
         *    inside the intent literally, as any other semantic
         *    object/action/formFactor string. It is possible, however, to
         *    specify wildcards for semantic object action and formFactor by
         *    setting them to undefined.
         *
         * @param {object} oTM
         *    A target mapping (inbound of a signature)
         * @param {object} oKnownUserDefaultRefsIn
         *    An input parameter used during the matching procedure to resolve
         *    reference values of defaults and filters.
         * @param {object} oMissingUserDefaultRefsOut
         *    <p>An output object containing missing references to user
         *    default values that must be resolved. This is not an array for
         *    optimization reasons, for example, when providing unique user
         *    default values across multiple calls of this method or for
         *    quickly finding out when a reference value was alrady missing in
         *    a previous call.</p>
         *
         *    This object has the form:
         * <pre>
         *     {
         *        "UserDefault.Value1": true,
         *        "UserDefault.Value2": true  // never false
         *        ...
         *     }
         * </pre>
         *     NOTE: it cannot be undefined, must be supplied as an object.
         *
         * @returns {object}
         *    the match result. When a match occurs, this is an object like:
         *
         * <pre>
         *    {
         *        matches: {boolean},
         *        genericSO: {boolean},
         *        targetMapping: {object},
         *        intentParamsPlusDefaults: {object},
         *        countMatchingParams: {number},
         *        countMatchingRequiredParams: {number},
         *        countMatchingFilterParams: {number},
         *        countDefaultedParams: {number},
         *        countPotentiallyMatchingParams: {number},
         *        countFreeTargetMappingParams: {number},
         *        resolutionResult: {object}
         *    }
         * </pre>
         *
         * When no matching occurs, the returned object looks like:
         * <pre>
         *    {
         *        matches: false,
         *        noMatchReason: "...",
         *        noMatchDebug: "...",     // interpret this in combination with noMatchReason
         *        targetMapping: {object},
         *        [one or more count* keys]: {number}
         *    }
         * </pre>
         *
         * @private
         * @since 1.32.0
         */
        this._matchToTargetMapping = function (oIntent, oTM, oKnownUserDefaultRefsIn, oMissingUserDefaultRefsOut) {
            function fnNoMatch(oResult, sReason, sDebugInfo) {
                oResult.matches = false;
                oResult.noMatchReason = sReason;
                oResult.noMatchDebug = sDebugInfo;
                return oResult;
            }

            function fnMatch(oResult) {
                oResult.matches = true;
                return oResult;
            }

            var that = this,
                oMatchResult = {
                    targetMapping: oTM
                };

            // test the semantic object
            oMatchResult.genericSO = (oTM.semanticObject === "*");
            if (!(oIntent.semanticObject === undefined || oIntent.semanticObject === oTM.semanticObject || oTM.semanticObject === '*')) {
                return fnNoMatch(oMatchResult, "Semantic object did not match", oTM.semanticObject);
            }
            // test the action
            if (!(oIntent.action === undefined || oIntent.action === oTM.action || oTM.action === '*')) {
                return fnNoMatch(oMatchResult, "Action did not match", "Intent:" + oIntent.action + " TM:" + oTM.action);
            }
            // test the form factor
            if (oTM.deviceTypes && !(oIntent.formFactor === undefined || oTM.deviceTypes[oIntent.formFactor])) {
                return fnNoMatch(oMatchResult, "Form factor did not match", "Intent:" + oIntent.formFactor + " TM:" + JSON.stringify(oTM.deviceTypes));
            }

            // An array like: [{ refValue: <string>}, ... ] later used to
            // augment oMissingUserDefaultRefsOut *if* a match occurs.
            var aUserDefaultRefsIfMatch = [],
                aDefaultedParamNames = [],
                oIntentParams = oIntent.params;

            // Expand default values into intent parameters
            var oIntentParamsPlusDefaults = this._addDefaultParameterValues(
                oIntentParams,
                oTM.signature && oTM.signature.parameters,
                oKnownUserDefaultRefsIn,
                aUserDefaultRefsIfMatch,
                aDefaultedParamNames
            );
            oMatchResult.intentParamsPlusDefaults = oIntentParamsPlusDefaults;
            oMatchResult.defaultedParamNames = aDefaultedParamNames;

            // extractSapPriority
            this._extractSapPriority(oIntentParamsPlusDefaults, oMatchResult);

            // check whether the parameter signature matches
            var countMatchingParams = 0,
                countMatchingRequiredParams = 0,
                countMatchingFilterParams = 0,
                countFreeTargetMappingParams = 0;

            var bSignatureMatches = Object.keys(oTM.signature.parameters).every(function (sParameterName) {
                var aValues = oIntentParamsPlusDefaults[sParameterName],
                    sValue = aValues && aValues[0],
                    oSignature = oTM.signature.parameters[sParameterName],
                    bIntentHasParam = oIntentParams.hasOwnProperty(sParameterName);

                if (oSignature.required && (sValue === null || sValue === undefined)) {
                    // no required parameter present -> fatal
                    return false;
                }

                if (oSignature.filter) {

                    if (!that._matchesFilter(sValue, oSignature.filter, oKnownUserDefaultRefsIn, oMissingUserDefaultRefsOut)) {
                        // filter does not match -> fatal
                        return false;
                    }

                    if (bIntentHasParam) {
                        ++countMatchingFilterParams;
                    }
                }

                if (bIntentHasParam && oSignature.required) {
                    ++countMatchingRequiredParams;
                }

                if (bIntentHasParam) {
                    ++countMatchingParams;
                }
                if (!bIntentHasParam && (sValue === null || sValue === undefined)) {
                    ++countFreeTargetMappingParams;
                }

                return true;
            });

            oMatchResult.countMatchingParams = countMatchingParams;
            oMatchResult.countMatchingRequiredParams = countMatchingRequiredParams;
            oMatchResult.countMatchingFilterParams = countMatchingFilterParams;
            oMatchResult.countDefaultedParams = aDefaultedParamNames.length;
            oMatchResult.countPotentiallyMatchingParams = Object.keys(oIntent.params).length;
            oMatchResult.countFreeTargetMappingParams = countFreeTargetMappingParams;

            if (!bSignatureMatches) {
                return fnNoMatch(oMatchResult, "Target mapping parameter signature did not match",
                    this._compactSignatureNotation(oTM.signature));
            }

            if (!this._checkAdditionalParameters(oTM, oIntentParamsPlusDefaults)) {
                return fnNoMatch(oMatchResult, "Additional parameters not allowed",
                    this._compactSignatureNotation(oTM.signature));
            }

            if (oTM.signature.additionalParameters === "ignored") {
                this._filterObjectKeys(oIntentParamsPlusDefaults, function (sKey) {
                    if (sKey.indexOf("sap-") === 0) {
                        return true; // keep sap params
                    }
                    if (oTM.signature.parameters.hasOwnProperty(sKey)) {
                        return true; // keep parameters in the TM signature
                    }
                    return false;
                }, true /* bInPlace */);

                // count is reduced in case of ignored additional parameters
                oMatchResult.countPotentiallyMatchingParams = Object.keys(oIntent.params).filter(function (sIntentParam) {
                    return oTM.signature.parameters.hasOwnProperty(sIntentParam);
                }).length;
            }

            this._constructEffectiveResolutionResult(oMatchResult, oTM);
            this._addSortString(oMatchResult);
            this._addFoundParametersToUserDefaultRefs(aUserDefaultRefsIfMatch, oMissingUserDefaultRefsOut);

            return fnMatch(oMatchResult);
        };

        /**
         * Deletes keys from an object based on a given filter function.
         *
         * @param {object} oObject
         *    The object to be filtered (modified in place)
         * @param {object} fnFilterFunction
         *    The filter function to decide which keys to delete
         * @param {boolean} bInPlace
         *    Modifies the the given object in place
         *
         * @returns {object}
         *    The filtered object
         *
         * @private
         * @since 1.32.0
         */
        this._filterObjectKeys = function (oObject, fnFilterFunction, bInPlace) {
            var oObjectToFilter = bInPlace ? oObject : jQuery.extend(true, {}, oObject);

            Object.keys(oObjectToFilter).forEach(function (sKey) {
                if (fnFilterFunction(sKey) === false) {
                    delete oObjectToFilter[sKey];
                }
            });

            return oObjectToFilter;
        };

        /**
         * Extract and prepare a client side resolution result, if possible
         * append the intent parameters (including defaults) to the URL.
         *
         * @param {object} oMatchResult
         *   An object representing a match result
         * @param {object} oTM
         *   The inbound
         *
         * @private
         * @since 1.32.0
         */
        this._constructEffectiveResolutionResult = function(oMatchResult, oTM) {
            var sUrlParams,
                oResolutionResult = oTM && oTM.resolutionResult;

            oMatchResult.resolutionResult = {};

            // NOTE: always include this
            if (oTM && oTM.hasOwnProperty("hideIntentLink")) {
                oMatchResult.resolutionResult.hideIntentLink = oTM.hideIntentLink;
            }

            oMatchResult.resolutionResult.requiresFallback = !!( // booleanize
                !oTM ||
                !oResolutionResult ||
                (oResolutionResult.applicationType !== "URL" && oResolutionResult.applicationType !== "SAPUI5") ||
                oResolutionResult.additionalInformation.indexOf("SAPUI5.Component") === -1 ||
                (oTM.parameterMapping && Object.keys(oTM.parameterMapping).length > 0)
            );

            if (!oMatchResult.resolutionResult.requiresFallback) {
                ["applicationType", "additionalInformation", "url", "applicationDependencies"].forEach(function (sPropName) {
                    if (oTM.resolutionResult.hasOwnProperty(sPropName)) {
                        oMatchResult.resolutionResult[sPropName] = oTM.resolutionResult[sPropName];
                    }
                });

                // prepare a proper URL!
                sUrlParams = this._getURLParsing().paramsToString(oMatchResult.intentParamsPlusDefaults);

                if (sUrlParams) {
                    // append parameters to URL
                    oMatchResult.resolutionResult.url = oTM.resolutionResult.url + ((oTM.resolutionResult.url.indexOf("?") < 0) ? "?" : "&") + sUrlParams;
                }

                if (typeof oTM.resolutionResult.ui5ComponentName !== "undefined") {
                    oMatchResult.resolutionResult.ui5ComponentName = oTM.resolutionResult.ui5ComponentName;
                }

                if (typeof oTM.resolutionResult.text !== "undefined") {
                    oMatchResult.resolutionResult.text = oTM.resolutionResult.text;
                }
            }
        };

        /**
         * Resolves the URL hash fragment.
         * <p> The hash fragment is resolved with the
         * <code>/sap/opu/odata/UI2/INTEROP/ResolveLink</code> OData function
         * import. This is an asynchronous operation. The form factor of the
         * current device is used to filter the navigation targets returned.
         * </p>
         * @param {string} sHashFragment
         *   The URL hash fragment in internal format (as obtained by the hasher service from SAPUI5,
         *   not as given in <code>location.hash</code>)
         * @param {function} fnFallback
         *   Fallback will be invoked if local <b>result</b> is not esteemed
         *   complete. This function is called with three arguments in
         *   respective order:
         *   <ol>
         *      <li>A string representing the hash fragment to be resolved
         *      (includes leading '#')</li>
         *      <li>An deep copy of the target mapping object that was matched
         *      during target resolution</li>
         *      <li>An object representing the set of intent and default parameters</li>
         *   </ol>
         *
         * @returns {object}
         *   A <code>jQuery.Promise</code>. Its <code>done()</code> function
         *   gets an object that you can use to create a {@link
         *   sap.ushell.components.container.ApplicationContainer} or
         *   <code>undefined</code> in case the hash fragment was empty.
         *
         * @private
         * @since 1.32.0
         */
        this.resolveHashFragment = function (sHashFragment, fnFallback) {
            var that = this,
                oDeferred = new jQuery.Deferred();

            this._ensureTargetMappings().done(function() {
                that._resolveHashFragment(sHashFragment, fnFallback)
                    .done(oDeferred.resolve.bind(oDeferred))
                    .fail(oDeferred.reject.bind(oDeferred));
            }).fail(
                oDeferred.reject.bind(oDeferred)
            );

            return oDeferred.promise();
        };

        this._resolveHashFragment = function (sHashFragment, fnFallback) {
            var oUrlParsing = this._getURLParsing(),
                oDeferred = new jQuery.Deferred(),
                sFixedHashFragment = sHashFragment.indexOf("#") === 0 ? sHashFragment : "#" + sHashFragment,
                oShellHash = oUrlParsing.parseShellHash(sFixedHashFragment);

            if (oShellHash === undefined) {
                jQuery.sap.log.error("Could not parse shell hash '" + sHashFragment + "'",
                    "please specify a valid shell hash",
                    "sap.ushell.services.ClientSideTargetResolution");
                return oDeferred.reject().promise();
            }

            /*
             * This Deferred is always called when a resolution result is found
             * independently on how it is found. If resolved, it will (must)
             * resolve oDeferred.
             */
            var oGotResolutionResultDeferred = new jQuery.Deferred();

            oShellHash.formFactor = sap.ushell.utils.getFormFactor();

            this._getMatchingTargets(oShellHash, _aTargetMappings)
                .fail(function (sError) {
                    jQuery.sap.log.error("Could not resolve " + sHashFragment,
                        "_getMatchingTargets promise rejected with: " + sError,
                        "sap.ushell.services.ClientSideTargetResolution");
                    oDeferred.reject(sError);
                })
                .done(function (aMatchingTargets) {
                    if (aMatchingTargets.length === 0) {
                        jQuery.sap.log.warning("Could not resolve " + sHashFragment,
                            "rejecting promise",
                            "sap.ushell.services.ClientSideTargetResolution");
                        oDeferred.reject("Could not resolve navigation target");
                        return;
                    }

                    /*
                     * We have results
                     */

                    var oMatchingTarget = aMatchingTargets[0],
                        oResolutionResult = oMatchingTarget.resolutionResult;

                    if (!oResolutionResult.requiresFallback) {
                        oGotResolutionResultDeferred.resolve(oMatchingTarget, oResolutionResult);
                        return;
                    }

                    /*
                     * We must fall back
                     */

                    if (typeof fnFallback !== "function") {
                        // no fallback logic available
                        jQuery.sap.log.error(
                            "Cannot resolve hash fragment",
                            sFixedHashFragment + " has matched a target mapping that cannot be resolved client side and no fallback logic can be used",
                            "sap.ushell.services.ClientSideTargetResolution"
                        );

                        oDeferred.reject("client side resolution without valid result");
                        return;
                    }

                    // fallback
                    jQuery.sap.log.warning(
                        "Cannot resolve hash fragment client side",
                        sFixedHashFragment + " has matched a target mapping that cannot be resolved client side. Using fallback logic",
                        "sap.ushell.services.ClientSideTargetResolution"
                    );
                    fnFallback(
                        sFixedHashFragment,
                        jQuery.extend(true, {}, oMatchingTarget.targetMapping),
                        oMatchingTarget.intentParamsPlusDefaults
                    )
                    .done(oGotResolutionResultDeferred.resolve.bind(oGotResolutionResultDeferred, oMatchingTarget))
                    .fail(oDeferred.reject.bind(oDeferred));
                });

            /*
             * Post-resolution amendments.
             *
             * this deferred is guaranteed to be resolved, and <b>must</b> resolve
             * oDeferred.
             */
            oGotResolutionResultDeferred.done(function (oMatchingTarget, oResolutionResult) {
                // add sap-ushell-defaultedParameterNames
                if (oResolutionResult && typeof oResolutionResult.url === "string" &&
                    oMatchingTarget.defaultedParamNames.length > 0) {

                    var sDefaultParameterNames = oUrlParsing.paramsToString({
                        "sap-ushell-defaultedParameterNames": [ JSON.stringify(oMatchingTarget.defaultedParamNames) ]
                    });
                    oResolutionResult.url += (oResolutionResult.url.indexOf("?") < 0 ? "?" : "&") + sDefaultParameterNames;
                }
                oDeferred.resolve(oResolutionResult);
            });

            return oDeferred.promise();
        };

        /**
         * Resolves a given semantic object and business parameters to a list
         * of links, taking into account the form factor of the current device.
         *
         * @param {string} sSemanticObject
         *   The semantic object such as <code>"AnObject"</code><br />
         *   <br />
         *   NOTE: the empty string can be used to obtain all the target
         *   mappings, but strings with one or more spaces are not considered a
         *   valid input and will cause the returned promise to be rejected.
         * @param {object} [mParameters]
         *   The map of business parameters with values, for instance
         *   <pre>
         *   {
         *     A: "B",
         *     C: ["e", "j"]
         *   }
         *   </pre>
         * @param {boolean} [bIgnoreFormFactor=false]
         *   When set to <code>true</code> the form factor of the current device is ignored
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which is resolved with an array of
         *   link objects containing (at least) the following properties:
         * <pre>
         * {
         *   intent: "#AnObject-Action?A=B&C=e&C=j",
         *   text: "Perform action"
         * }
         * </pre>
         *
         * @private
         * @since 1.32.0
         */
        this.getSemanticObjectLinks = function (sSemanticObject, mParameters, bIgnoreFormFactor) {
            var that = this,
                oDeferred = new jQuery.Deferred();

            this._ensureTargetMappings().done(function (){
                that._getSemanticObjectLinks(sSemanticObject, mParameters, bIgnoreFormFactor)
                    .done(oDeferred.resolve.bind(oDeferred))
                    .fail(oDeferred.reject.bind(oDeferred));
            }).fail(oDeferred.reject.bind(oDeferred));

            return oDeferred.promise();
        };

        this._getSemanticObjectLinks = function (sSemanticObject, mParameters, bIgnoreFormFactor) {
            /*
             * Input validation
             */
            if (typeof sSemanticObject !== "string") {
                jQuery.sap.log.error("invalid input for _getSemanticObjectLinks",
                    "the semantic object must be a string, got " + Object.prototype.toString.call(sSemanticObject) + " instead",
                    "sap.ushell.services.ClientSideTargetResolution");
                return new jQuery.Deferred().reject("invalid semantic object").promise();
            }
            if (sSemanticObject.match(/^\s+$/)) {
                jQuery.sap.log.error("invalid input for _getSemanticObjectLinks",
                    "the semantic object must be a non-empty string, got '" + sSemanticObject + "' instead",
                    "sap.ushell.services.ClientSideTargetResolution");
                return new jQuery.Deferred().reject("invalid semantic object").promise();
            }
            if (sSemanticObject === "*") {
                // shortcut: skip matching target mappings and return directly.
                // It can only match "*" and we don't return it anyway.
                return new jQuery.Deferred().resolve([]).promise();
            }

            /*
             * Returns ?-prefixed business parameters
             */
            function fnConstructBusinessParamsString(oUrlParsing, mParameters) {
                var sBusinessParams = oUrlParsing.paramsToString(mParameters);
                return sBusinessParams ? "?" + sBusinessParams : "";
            }

            var that = this,
                oUrlParsing = this._getURLParsing(),
                oDeferred = new jQuery.Deferred(),
                sFormFactor = sap.ushell.utils.getFormFactor(),
                oAllIntentParams = oUrlParsing.parseParameters(fnConstructBusinessParamsString(oUrlParsing, mParameters)),
                oShellHash = {
                    semanticObject: (sSemanticObject === "" ? undefined : sSemanticObject),
                    action: undefined,  // match all actions
                    formFactor: (bIgnoreFormFactor ? undefined : sFormFactor),
                    params: oAllIntentParams
                };

            this._getMatchingTargets(oShellHash, _aTargetMappings)
                .done(function (aMatchingTargets) {
                    var oUniqueIntents = {},
                        aResults = aMatchingTargets
                            .map(function (oMatchResult) {
                                var sAdjustedSemanticObject = sSemanticObject || oMatchResult.targetMapping.semanticObject,
                                    sIntent = "#" + sAdjustedSemanticObject + "-" + oMatchResult.targetMapping.action,
                                    oNeededParameters;

                                // we never return "*" semantic objects from
                                // getSemanticObjectLinks as they are not parsable links
                                if (sAdjustedSemanticObject === "*") {
                                    return undefined;
                                }

                                // we hide based on hideIntentLink
                                if (oMatchResult.resolutionResult.hideIntentLink === true) {
                                    return undefined;
                                }

                                if (!oUniqueIntents.hasOwnProperty(sIntent)) {
                                    oUniqueIntents[sIntent] = 1;

                                    if (oMatchResult.targetMapping.signature.additionalParameters === "ignored") {
                                        /*
                                         * In the result do not show all intent
                                         * parameters, but only those mentioned by
                                         * the target mapping.
                                         */
                                        oNeededParameters = that._filterObjectKeys(oAllIntentParams, function (sIntentParam) {
                                            return (sIntentParam.indexOf("sap-") === 0) ||
                                                oMatchResult.targetMapping.signature.parameters.hasOwnProperty(sIntentParam);
                                        }, false);
                                    } else {
                                        oNeededParameters = oAllIntentParams;
                                    }

                                    return {
                                        "intent": sIntent + fnConstructBusinessParamsString(oUrlParsing, oNeededParameters),
                                        "text": oMatchResult.targetMapping.resolutionResult._original.text
                                    };
                                } else {
                                    // for debugging purposes
                                    oUniqueIntents[sIntent]++;
                                }
                                return undefined;
                            })
                            .filter(function (oSemanticObjectLink) {
                                return typeof oSemanticObjectLink === "object";
                            })
                            .sort(function (oGetSoLinksResult1, oGetSoLinksResult2) {
                                return oGetSoLinksResult1.intent < oGetSoLinksResult2.intent ? -1 : 1;
                            });

                        jQuery.sap.log.debug(
                            "_getSemanticObjectLinks filtered to unique intents.",
                            "Reporting histogram: " + JSON.stringify(oUniqueIntents, null, "   "),
                            "sap.ushell.services.ClientSideTargetResolution"
                        );
                    oDeferred.resolve(aResults);
                })
                .fail(oDeferred.reject.bind(oDeferred));

            return oDeferred.promise();
        };

        /**
         * Transform a matching result into a string for tie-breaking during sort.
         *
         * @param {object} oMatchResult
         *    The match result
         * @returns {string}
         *    The serialized match result
         *
         * @see {@link #_getMatchingTargets}
         * @private
         * @since 1.32.0
         */
        this._serializeMatchingResult = function (oMatchResult) {
            var oResolutionResult = oMatchResult.targetMapping.resolutionResult;
            return [
                "applicationType",
                "ui5ComponentName",
                "url",
                "additionalInformation",
                "text"
            ].map(function (sKey) {
                return oResolutionResult.hasOwnProperty(sKey) ? oResolutionResult[sKey] : "";
            }).join("");
        };

        /**
         * This resolves (finds the value of) all the given reference names.
         *
         * @param {string[]} aReferences
         *    An array of reference names, like <code>["UserDefault.currency", ... ]</code>.
         *
         * @returns {jQuery.Deferred.promise}
         *    <p>A promise that resolves with an object containing all the
         *    resolved references, or is rejected with an error message if it
         *    was not possible to resolve all the references.</p>
         *
         *    <p>The object this promise resolves to maps the full (with prefix)
         *    reference name to its value:</p>
         *    <pre>
         *    {
         *        UserDefault.name: "Alice",
         *        UserDefault.currency: "EUR"
         *        ...
         *    }
         *    </pre>
         *
         * @private
         * @since 1.32.0
         */
        this._resolveAllReferences = function (aReferences) {
            var that = this,
                oDeferred = new jQuery.Deferred(),
                oUserDefaultParametersSrvc,
                aReferencePromises,
                bAllRefsResolvable = true,
                aRichRefs = aReferences
                    .map(function (sRefWithPrefix) {
                        var sRefName = that._extractUserDefaultReferenceName(sRefWithPrefix);

                        /*
                         * This method does not assume aReferences are user defaults,
                         * although we only know how to resolve user default refs at the
                         * moment.
                         */
                        if (typeof sRefName !== "string") {
                            bAllRefsResolvable = false;
                        }

                        return {
                            full: sRefWithPrefix,
                            name: sRefName
                        };
                    });

            if (!bAllRefsResolvable) {
                return oDeferred
                    .reject("Cannot determine value for all references " + aReferences.join(", "))
                    .promise();
            }

            oUserDefaultParametersSrvc = sap.ushell.Container.getService("UserDefaultParameters");
            aReferencePromises = aRichRefs.map(function (oRef) {
                return oUserDefaultParametersSrvc.getValue(oRef.name);
            });

            jQuery.when.apply(jQuery, aReferencePromises)
                .done(function () {
                    /*
                     * All parameters retrieved successfully and
                     * stored in arguments.
                     */
                    var oKnownRefs = {},
                        aRefValues = arguments,
                        i = 0;

                    aRichRefs.forEach(function (oRef) {
                        oKnownRefs[oRef.full] = aRefValues[i].value;
                        ++i;
                    });

                    oDeferred.resolve(oKnownRefs);
                });

            return oDeferred.promise();
        };

        /**
         * Matches the given resolved shell hash against all the target
         * mappings.
         *
         * @param {object} oShellHash
         *     The resolved hash fragment
         * @param {array} aTargetMappings
         *     An array of target mappings to match the shell hash against
         *
         * @returns {jQuery.Promise[]}
         *     a sorted array of targets. A target is a matching result
         *     obtained via {@link #_matchToTargetMapping} that in addition has
         *     a specific priority with respect to other matching targets.
         *
         * @private
         * @since 1.32.0
         */
        this._getMatchingTargets = function(oShellHash, aTargetMappings) {
            var that = this,
                oDeferred = new jQuery.Deferred(),
                oReadyToSortDeferred = new jQuery.Deferred(),
                oReadyToRematchDeferred = new jQuery.Deferred();

            function fnWhenDebugEnabled(fn) {
                if (jQuery.sap.log.getLevel() >= jQuery.sap.log.Level.INFO) {
                    fn();
                }
            }

            setTimeout(function () {

                var aMatchingTargets = [],
                    oMissingUserDefaults = {},
                    aPotentiallyMatchingTargets = [],
                    oNoMatchReasons = {};

                    jQuery.sap.log.debug(
                        "Matching intent to target mappings (first round)",
                        JSON.stringify(oShellHash, null, "   "),
                        "sap.ushell.services.ClientSideTargetResolution"
                    );

                    // match without known values first
                    aTargetMappings.forEach(function (oTM) {
                        var oMatchResult = that._matchToTargetMapping(oShellHash, oTM,
                            {} /* no known references the first time */, oMissingUserDefaults);

                        if (oMatchResult.matches) {
                            aMatchingTargets.push(oMatchResult);

                            // may be useful for re-matching
                            aPotentiallyMatchingTargets.push(oTM);
                        } else {
                            fnWhenDebugEnabled(function () {
                                // collect no match reasons and log (debugging purposes)
                                if (!oNoMatchReasons[oMatchResult.noMatchReason]) {
                                    oNoMatchReasons[oMatchResult.noMatchReason] = [];
                                }

                                oNoMatchReasons[oMatchResult.noMatchReason].push(
                                    "#"  + (oMatchResult.targetMapping || {}).semanticObject +
                                    "-"  + (oMatchResult.targetMapping || {}).action +
                                    "|" + oMatchResult.noMatchDebug
                                );
                            });
                        }
                    });

                    // output no match reasons (debugging)
                    fnWhenDebugEnabled(function () {
                        Object.keys(oNoMatchReasons).forEach(function (sReason) {
                            jQuery.sap.log.debug(
                                sReason + ": " + oNoMatchReasons[sReason].join("; "),
                                null,
                                "sap.ushell.services.ClientSideTargetResolution"
                            );

                        });
                    });

                    if (jQuery.isEmptyObject(oMissingUserDefaults)) {
                        // aMatchingTargets represents a "precise" match, that
                        // is, it was carried out without references to unknown
                        // user default values.
                        oReadyToSortDeferred.resolve(aMatchingTargets);
                    } else {
                        // unknown values were found during the matching
                        // procedure: must get these default values from
                        // UserDefaultService.

                        that._resolveAllReferences(Object.keys(oMissingUserDefaults))
                            .done(function (oResolvedRefs) {
                                oReadyToRematchDeferred.resolve(oResolvedRefs, aPotentiallyMatchingTargets);
                            })
                            .fail(function (sError) {
                                jQuery.sap.log.error("Failed to resolve all references",
                                    sError, "sap.ushell.services.ClientSideTargetResolution");

                                oReadyToSortDeferred.resolve([]);
                            });
                    }

            }, 0);

            // triggered in case of re-match
            oReadyToRematchDeferred.done(function (oKnownUserDefaultRefs, aPotentiallyMatchingTargets) {
                jQuery.sap.log.debug(
                    "Matching intent to target mappings (rematch)",
                    "Known References:" + JSON.stringify(oKnownUserDefaultRefs, null, "   "),
                    "sap.ushell.services.ClientSideTargetResolution"
                );

                var aPreciseMatchingTargets = [],
                    oMissingUserDefaults = {};

                aPotentiallyMatchingTargets.forEach(function (oTM) {
                    var oMatchResult = that._matchToTargetMapping(oShellHash, oTM, oKnownUserDefaultRefs, oMissingUserDefaults);
                    if (oMatchResult.matches) {
                        aPreciseMatchingTargets.push(oMatchResult);
                    }
                });

                if (jQuery.isEmptyObject(oMissingUserDefaults)) {
                    oReadyToSortDeferred.resolve(aPreciseMatchingTargets);
                } else {
                    jQuery.sap.log.error(
                        "Still obtained unknown references during rematch",
                        JSON.stringify(oMissingUserDefaults, null, "   "),
                        "sap.ushell.services.ClientSideTargetResolution"
                    );
                    oDeferred.reject("Rematching returned unknown references!");
                }
            });

            // triggered when a precise match set is obtained
            oReadyToSortDeferred.done(function (aPreciseMatchingTargets) {

                that._sortMatchingResultsDeterministic(aPreciseMatchingTargets);

                fnWhenDebugEnabled(function () {
                    jQuery.sap.log.debug(
                        "Returning sorted results",
                        "\n" + aPreciseMatchingTargets.map(function (oMatchResult) {
                            return "#" + (oMatchResult.targetMapping || {}).semanticObject +
                                   "-" + (oMatchResult.targetMapping || {}).action +
                                   " " + (oMatchResult["sap-priority"] || "") +
                                   " Priority: " + (oMatchResult["sap-priority"] ? "sap-priority : " + oMatchResult["sap-priority"] : "") +
                                   oMatchResult.priorityString +
                                   " Signature: " + that._compactSignatureNotation((oMatchResult.targetMapping || {}).signature) +
                                   " Deterministic: " + that._serializeMatchingResult(oMatchResult);
                        }).join("\n") + "\nwith first Result being:" + JSON.stringify(aPreciseMatchingTargets[0], null, "   "),
                        "sap.ushell.services.ClientSideTargetResolution");
                });

                oDeferred.resolve(aPreciseMatchingTargets);
            });


            return oDeferred.promise();
        };

        /**
         * Sorts the matching results deterministically, using the priority
         * string in the match result and an integer sap-priority if present.
         *
         * @param {object[]} aMatchingResults
         *    The matching results
         *
         * @private
         * @since 1.32.0
         */
        this._sortMatchingResultsDeterministic = function (aMatchingResults) {
            var that = this;
            // deterministic sorting
            aMatchingResults.sort(function (oMatchResult1, oMatchResult2) {
                if ((oMatchResult1["sap-priority"] || 0) - (oMatchResult2["sap-priority"] || 0) !== 0) {
                    return -((oMatchResult1["sap-priority"] || 0) - (oMatchResult2["sap-priority"] || 0));
                }
                if (oMatchResult1.priorityString < oMatchResult2.priorityString) { return 1; }
                if (oMatchResult1.priorityString > oMatchResult2.priorityString) { return -1; }

                // make it deterministic
                return (that._serializeMatchingResult(oMatchResult1) < that._serializeMatchingResult(oMatchResult2))
                    ? 1   // NOTE: inverted result, longer matches come first
                    : -1;
            });
        };

        /**
         *
         * Determines whether a single intent matches one or more navigation
         * targets.
         *
         * @param {string}
         *    sIntent the intent to be matched
         *
         * @returns {jQuery.Deferred.promise}
         *     a promise that is resolved with a boolean if the intent is
         *     supported and rejected if not. The promise resolves to true
         *     if only one target matches the intent, and false if multiple
         *     targets match the intent.
         *
         * @private
         * @since 1.32.0
         */
        this._isIntentSupportedOne = function(sIntent) {
            var oDeferred = new jQuery.Deferred(),
                oShellHash = this._getURLParsing().parseShellHash(sIntent);

            if (oShellHash === undefined) {
                jQuery.sap.log.error("Could not parse shell hash '" + sIntent + "'",
                    "please specify a valid shell hash",
                    "sap.ushell.services.ClientSideTargetResolution");
                return oDeferred.reject().promise();
            }

            oShellHash.formFactor = sap.ushell.utils.getFormFactor();

            this._getMatchingTargets(oShellHash, _aTargetMappings)
                .done(function (aTargets) {
                    oDeferred.resolve(aTargets.length > 0);
                })
                .fail(function () {
                    oDeferred.reject();
                });

            return oDeferred.promise();
        };

        /**
         * Tells whether the given intent(s) are supported, taking into account
         * the form factor of the current device. "Supported" means that
         * navigation to the intent is possible.
         *
         * @param {string[]} aIntents
         *   The intents (such as <code>"#AnObject-Action?A=B&C=e&C=j"</code>) to be checked
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which is resolved with a map
         *   containing the intents from <code>aIntents</code> as keys. The map values are
         *   objects with a property <code>supported</code> of type <code>boolean</code>.<br/>
         *   Example:
         * <pre>
         * {
         *   "#AnObject-Action?A=B&C=e&C=j": { supported: false },
         *   "#AnotherObject-Action2": { supported: true }
         * }
         * </pre>
         *
         * @private
         * @since 1.32.0
         */
        this.isIntentSupported = function (aIntents) {
            var that = this,
                oDeferred = new jQuery.Deferred();

            this._ensureTargetMappings().done(function () {
                that._isIntentSupported(aIntents)
                    .done(oDeferred.resolve.bind(oDeferred))
                    .fail(oDeferred.reject.bind(oDeferred));
            }).fail(oDeferred.reject.bind(oDeferred));

            return oDeferred.promise();
        };

        this._isIntentSupported = function (aIntents) {
            var that = this,
                oDeferred = new jQuery.Deferred(),
                mSupportedByIntent = {};

            oDeferred.resolve();

            /*
             * Sets the result for the given intent as indicated.
             * @params {string} sIntent
             * @params {boolean} bSupported
             */
            function setResult(sIntent, bSupported) {
                mSupportedByIntent[sIntent] = {
                    supported: bSupported
                };
            }

            aIntents.forEach(function (sIntent) {
                var oNextPromise = that._isIntentSupportedOne(sIntent);
                oNextPromise.fail(function (sErrorMessage) {
                    setResult(sIntent, false);
                });
                oNextPromise.done(function (bResult) {
                    setResult(sIntent, bResult);
                });
                oDeferred = jQuery.when(oDeferred, oNextPromise);
            });

            var oRes = new jQuery.Deferred();
            oDeferred.done(function () {
                oRes.resolve(mSupportedByIntent);
            }).fail(function(){
                oRes.reject.bind(oDeferred);
            });

            return oRes.promise();
        };

        /**
         * Extracts the user default reference name from a reference parameter
         * name. For example, returns <code>value</code> from
         * <code>UserDefault.value</code>, but returns <code>undefined</code>
         * for <code>MachineDefault.value</code>.
         *
         * @param {string} sRefParamName
         *    Name of a reference parameter
         * @returns {string}
         *    The name of the user default parameter extracted from
         *    sRefParamName, or undefined in case this cannot be extracted.
         *
         * @private
         * @since 1.32.0
         */
        this._extractUserDefaultReferenceName = function (sRefParamName) {
            if (typeof sRefParamName !== "string" || sRefParamName.indexOf("UserDefault.") !== 0) {
                return undefined;
            }
            return sRefParamName.replace(/^UserDefault[.]/, "");
        };

        /**
         * Finds and returns all unique user default parameter names referenced
         * in target mappings.
         *
         * @returns {jQuery.Deferred.promise}
         *    <p>A promise that resolves to an array of strings. Each string is
         *    the name of a user default parameter referenced in a target
         *    mapping.</p>
         *
         *    <p>
         *    NOTE: the parameter names do not include surrounding special
         *    syntax. Only the inner part is returned. For example:
         *    <pre>
         *    "{{UserDefaultParameterName}}" -> "UserDefaultParameterName"
         *    </pre>
         *    </p>
         *
         * @private
         * @since 1.32.0
         */
        this.getUserDefaultParameterNames = function () {
            var that = this,
                oDeferred = new jQuery.Deferred();

            this._ensureTargetMappings().done(function (aTargetMappings) {
                try {
                    oDeferred.resolve(that._getUserDefaultParameterNames());
                } catch (e) {
                    oDeferred.reject("Cannot get user default parameters from target mappings: " + e);
                }
            }).fail(oDeferred.reject.bind(oDeferred));

            return oDeferred.promise();
        };

        this._getUserDefaultParameterNames = function () {
            var oUniqueRefs = {},
                that = this;

            _aTargetMappings.forEach(function (oTm) {
                var oSignatureParams = oTm.signature && oTm.signature.parameters || [];

                Object.keys(oSignatureParams).forEach(function (sParamName) {
                    var oParam = oSignatureParams[sParamName],
                        sUserDefaultParamName;

                    if (oParam) {
                        // first try to get the user default value from the filter

                        if (oParam.filter && oParam.filter.format === "reference") {
                            sUserDefaultParamName = oParam.filter.value;

                        } else if (oParam.defaultValue && oParam.defaultValue.format === "reference") {
                            sUserDefaultParamName = oParam.defaultValue.value;
                        }

                        if (typeof sUserDefaultParamName === "string") {
                            // only extract user defaults
                            var sRefName = that._extractUserDefaultReferenceName(sUserDefaultParamName);
                            if (typeof sRefName === "string") {
                                oUniqueRefs[sRefName] = 1;
                            }
                        }
                    }
                });
            });

            return Object.keys(oUniqueRefs);
        };

        /**
         * Returns a compact string representation of a Target Mapping
         * signature.
         *
         * @param {object} oSignature
         *    The input parameters in app descriptor format
         * @returns {string}
         *    The input parameters in compact notation
         *
         * @private
         * @since 1.32.0
         */
        this._compactSignatureNotation = function (oSignature) {
            var oFixedSignature = oSignature || {};
            var mParams = oFixedSignature.parameters || {},
                oTypeNotation = {
                    optional: "[FORMAT]",
                    required: "FORMAT"
                },
                oFormatNotation = {
                    regexp: "/VALUE/",
                    reference: "@VALUE",
                    value: "VALUE",
                    plain: "VALUE",
                    _unknown: "?VALUE" // unknown format specified
                },
                oAdditionalParametersSymbol = {
                    allowed: "<+>",
                    nomatch: "<->",
                    ignored: "<o>",
                    _unknown: "<?>"
                };

            if (jQuery.isEmptyObject(mParams)) {
                return "<no params>" + (
                    oAdditionalParametersSymbol[oFixedSignature.additionalParameters || "_unknown"]
                );
            }

            var aResults = [];

            Object.keys(mParams).forEach(function (sParamName) {
                var oParamDefinition = mParams[sParamName],
                    sParamType = oParamDefinition.required ? "required" : "optional",
                    sParamFilterValue = oParamDefinition.filter && oParamDefinition.filter.value,
                    sParamDefaultValue = oParamDefinition.defaultValue && oParamDefinition.defaultValue.value,
                    sParamFilterFormat = (oParamDefinition.filter && oParamDefinition.filter.format) || "plain",
                    sParamDefaultFormat = (oParamDefinition.defaultValue && oParamDefinition.defaultValue.format) || "plain";

                var aValueRepr = [],
                    sParamFilterFormatNotation = oFormatNotation[sParamFilterFormat] || oFormatNotation._unknown,
                    sParamDefaultFormatNotation = oFormatNotation[sParamDefaultFormat] || oFormatNotation._unknown;

                if (sParamFilterValue) {
                    aValueRepr.push(
                        oTypeNotation["required"].replace("FORMAT",
                            sParamFilterFormatNotation.replace("VALUE", sParamFilterValue)
                        )
                    );
                }
                if (sParamDefaultValue) {
                    aValueRepr.push(
                        oTypeNotation["optional"].replace("FORMAT",
                            sParamDefaultFormatNotation.replace("VALUE", sParamDefaultValue)
                        )
                    );
                }
                aResults.push(
                    oTypeNotation[sParamType].replace("FORMAT",
                        sParamName + ":" + aValueRepr.join("")
                    )
                );
            });

            return aResults.join(";") + (
                oAdditionalParametersSymbol[oFixedSignature.additionalParameters || "_unknown"]
            );
        };

    };
    sap.ushell.services.ClientSideTargetResolution.hasNoAdapter = false;
}());
