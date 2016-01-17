/*
 * ! @copyright@
 */
sap.ui.define([
	"./Error", "./SelectionVariant", "sap/suite/ui/generic/template/library"
], function(Error, SelectionVariant, TemplateLibrary) {
	"use strict";

	var NavType = TemplateLibrary.ListReport.nav.NavType;
	var ParamHandlingMode = TemplateLibrary.ListReport.nav.ParamHandlingMode;
	var Severity = TemplateLibrary.ListReport.nav.Severity;
	var SuppressionBehavior = TemplateLibrary.ListReport.nav.SuppressionBehavior;
	var NavigationHandler = sap.ui.base.Object.extend("sap.suite.ui.generic.template.ListReport.nav.NavigationHandler",
	{
		metadata: {
			publicMethods: [
				"navigate", "parseNavigation", "storeInnerAppState", "openSmartLinkPopover", "mixAttributesAndSelectionVariant"
			]
		},

		constructor: function(oController, sParamHandlingMode) {
			this.oRouter = this._getRouter(oController);
			this.oComponent = oController.getOwnerComponent().getAppComponent();

			if (typeof this.oRouter === "undefined" || typeof this.oComponent === "undefined") {
				throw new Error("NavigationHandler.INVALID_INPUT", Severity.ERROR);
			}
			
			try {
				this.oCrossAppNavService = sap.ushell.Container.getService("CrossApplicationNavigation");
			} catch (err) {
				jQuery.sap.log.error("NavigationHandler: UShell service for cross app navigation is not available.");
			}
			this.IAPP_STATE = "sap-iapp-state";
			this._oLastSavedInnerAppData = {
				sAppStateKey: "",
				oAppData: {},
				iCacheHit: 0,
				iCacheMiss: 0
			};

			/*
			 * There exists a generation of "old" sap-iapp-states which are based on the following URL schema:
			 * #SemObj-action&/route/sap-iapp-state=ABC12345678 The new URL schema is: #SemObj-action&/route?sap-iapp-state=ABC12345678 (mind the
			 * difference between / and ? above), i.e. the sap-iapp-state has become a parameter of the query parameter section in the AppHash string.
			 * Yet, this tool shall be able to deal even with old sap-iapp-states. Therefore, we use two Regular Expressions (rIAppStateOld and
			 * rIAppStateOldAtStart) as defined below to scan for these old variants. The new variant is being scanned using rIAppStateNew as Regular
			 * Expression search string. Compatibility is centrally ensured by the two methods _getInnerAppStateKey and _replaceInnerAppStateKey (see
			 * below). Never use these RegExp in a method on your own, as it typically indicates that you will fall into the compatibility trap!
			 */
			// Warning! Do not use GLOBAL flags here; RegExp in GLOBAL mode store the lastIndex value
			// Therefore, repeated calls to the RegExp will then only start beginning with that stored
			// lastIndex. Thus, multiple calls therefore could yield strange results.
			// Moreover, there shall only be exactly one IAPP_STATE per RegExp in an AppHash.
			// Therefore, GLOBAL search should be superfluous.
			this._rIAppStateOld = new RegExp("/" + this.IAPP_STATE + "=([^/?]+)");
			this._rIAppStateOldAtStart = new RegExp("^" + this.IAPP_STATE + "=([^/?]+)");

			this._rIAppStateNew = new RegExp("[\?&]" + this.IAPP_STATE + "=([^&]+)");
			/*
			 * Regular Expression in words: Search for something that either stars with ? or &, followed by the term "sap-iapp-state". That one is
			 * followed by an equal sign (=). The stuff that is after the equal sign forms the first regexp group. This group consists of at least one
			 * (or arbitrary many) characters, as long as it is not an ampersand sign (&). Characters after such an ampersand would be ignored and do
			 * not belong to the group. Alternatively, the string also may end.
			 */

			if (sParamHandlingMode === ParamHandlingMode.URLParamWins || sParamHandlingMode === ParamHandlingMode.InsertInSelOpt) {
				this.sParamHandlingMode = sParamHandlingMode;
			} else {
				this.sParamHandlingMode = ParamHandlingMode.SelVarWins; // default
			}

			this.oi18n = new sap.ui.model.resource.ResourceModel({
				bundleName: "sap.suite.ui.generic.template.ListReport.i18n.i18n",
				bundleLocale: sap.ui.getCore().getConfiguration().getFormatLocale()
			}).getResourceBundle();

		},

		hasCrossApplicationNavigationService: function() {
			return this.oCrossAppNavService !== undefined;
		},

		_getRouter: function(oController) {
			return sap.ui.core.UIComponent.getRouterFor(oController);
		},

		navigate: function(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError) {

			var sSelectionVariant, mParameters;

			// for navigation we need URL parameters (legacy navigation) and sap-xapp-state, therefore we need
			// to create the missing one from the passed one
			if (typeof vNavigationParameters === "string") {
				sSelectionVariant = vNavigationParameters;
				mParameters = this._getURLParametersFromSelectionVariant(sSelectionVariant);
			} else if (typeof vNavigationParameters === "object") {
				mParameters = vNavigationParameters;
				var oEnrichedAppData = this._addParametersToAppData({}, mParameters);
				sSelectionVariant = oEnrichedAppData.selectionVariant;
			} else {
				throw new Error("NavigationHandler.INVALID_INPUT", Severity.ERROR);
			}

			var that = this;
			var oNavArguments = {
				target: {
					semanticObject: sSemanticObject,
					action: sActionName
				},
				params: mParameters || {}
			};
			var sIntent = that.oCrossAppNavService.hrefForExternal(oNavArguments);
			var oSupportedPromise = that.oCrossAppNavService.isIntentSupported([
				sIntent
			]);

			oSupportedPromise.done(function(oTargets) {

				if (oTargets[sIntent].supported) {

					var oStorePromise = that.storeInnerAppState(oInnerAppData);
					oStorePromise.done(function() {
						var fnOnContainerSave = function(sAppStateKey) {
							// set the app state key in addition to the navigation arguments
							oNavArguments.appStateKey = sAppStateKey;
							// Remark:
							// The Cross App Service takes care of encoding parameter keys and values. Example:
							// mParams = { "$@%" : "&/=" } results in the URL parameter
							// %2524%2540%2525=%2526%252F%253D
							// Note the double encoding, this is correct.

							// toExternal sets sap-xapp-state in the URL if appStateKey is provided in oNavArguments
							that.oCrossAppNavService.toExternal(oNavArguments, that.oComponent); // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>OUT
						};

						that._saveAppState({
							selectionVariant: sSelectionVariant
						}, fnOnContainerSave, fnOnError);
					});

					if (fnOnError) {
						oStorePromise.fail(function(oError) {
							fnOnError(oError);
						});
					}

				} else if (fnOnError) {
					// intent is not supported
					var sErrorCode = "NavigationHandler.isIntentSupported.notSupported";
					var sSeverity = Severity.ERROR;
					var mUItext = {
						oi18n: that.oi18n,
						sTextKey: "INTENT_NOT_SUPPORTED",
						aParams: [
							sSemanticObject, sActionName
						]
					};
					var oError = new Error(sErrorCode, sSeverity, undefined, mUItext);
					fnOnError(oError);
				}
			});

			if (fnOnError) {
				oSupportedPromise.fail(function() {
					// technical error: could not determine if intent is supported
					var oError = that._createTechnicalError("NavigationHandler.isIntentSupported.failed");
					fnOnError(oError);
				});
			}
		},

		parseNavigation: function() {

			var sAppHash = this.oRouter.oHashChanger.getHash();
			var sIAppState = this._getInnerAppStateKey(sAppHash);

			var oComponentData = this.oComponent.oComponentData;
			// Remark:
			// The startup parameters are already decoded. Example:
			// The original URL parameter %2524%2540%2525=%2526%252F%253D results in oStartupParameters = {
			// "$@%" : "&/=" }
			// Note the double encoding in the URL, this is correct. An URL parameter like xyz=%25 causes an
			// "URI malformed" error.
			// If the decoded value should be e.g. "%25", the parameter in the URL needs to be: xyz=%252525
			var oStartupParameters;
			
			if (oComponentData){
				oStartupParameters = oComponentData.startupParameters;
			}

			/* eslint-disable */
			var oMyDeferred = jQuery.Deferred();
			/* eslint-enable */
			var that = this;

			if (sIAppState) {
				// inner app state is available in the AppHash (back navigation); extract the parameter value
				this._loadAppState(sIAppState, oMyDeferred);

			} else {

				// no back navigation
				var bIsXappStateNavigation = oComponentData !== undefined && oComponentData["sap-xapp-state"] !== undefined;
				if (bIsXappStateNavigation) {
					// inner app state was not found in the AppHash, but xapp state => try to read the xapp state
					var oStartupPromise = this.oCrossAppNavService.getStartupAppState(this.oComponent);

					oStartupPromise.done(function(oAppState) {
						var oError;
						// get app state from sap-xapp-state
						var oAppStateData = oAppState.getData();

						// add URL parameters if available
						if (!jQuery.isEmptyObject(oStartupParameters)) {

							if (oAppStateData) {
								// sap-xapp-state navigation
								oAppStateData = that._addParametersToAppData(oAppStateData, oStartupParameters);
								oMyDeferred.resolve(oAppStateData, oStartupParameters, NavType.xAppState);
							} else {
								// sap-xapp-state navigation, but ID has already expired, but URL parameters
								// available
								oError = that._createTechnicalError("NavigationHandler.getDataFromAppState.failed");
								oMyDeferred.reject(oError, oStartupParameters, NavType.xAppState);
							}
						} else if (oAppStateData) {
							// there are no URL parameters

							// ??!??! broken sender: navigation with sap-xapp-state, but no URL parameters
							jQuery.sap.log.warning("Broken Sender navigation via xapp-state detected; sender did not provide legacy URL parameters");

							oAppStateData.selectionVariant = that._ensureSelectionVariantFormatString(oAppStateData.selectionVariant);

							oMyDeferred.resolve(oAppStateData, {}, NavType.xAppState);
						} else {
							// sap-xapp-state navigation by broken sender, but ID has already expired
							jQuery.sap.log.warning("Broken Sender navigation via xapp-state detected; sender did not provide legacy URL parameters");
							oError = that._createTechnicalError("NavigationHandler.getDataFromAppState.failed");
							oMyDeferred.reject(oError, {}, NavType.xAppState);
						}
					});
					oStartupPromise.fail(function() {
						var oError = that._createTechnicalError("NavigationHandler.getStartupState.failed");
						oMyDeferred.reject(oError, {}, NavType.xAppState);
					});

				} else if (oStartupParameters) {
					// no sap-xapp-state
					// standard URL navigation
					var oAppData = that._addParametersToAppData({}, oStartupParameters);
					oMyDeferred.resolve(oAppData, oStartupParameters, NavType.URLParams);
				} else {
					// no sap-xapp-state & no URL params
					// initial navigation
					oMyDeferred.resolve({}, {}, NavType.initial);
				}
			}

			return oMyDeferred.promise();
		},

		storeInnerAppState: function(mInnerAppData, bImmediateHashReplace) {

			if (typeof bImmediateHashReplace !== "boolean") {
				bImmediateHashReplace = true; // default
			}
			var that = this;

			/* eslint-disable */
			var oMyDeferred = jQuery.Deferred();
			/* eslint-enable */

			var fnReplaceHash = function(sAppStateKey) {
				var sAppHashOld = that.oRouter.oHashChanger.getHash();
				var sAppHashNew = that._replaceInnerAppStateKey(sAppHashOld, sAppStateKey);
				that.oRouter.oHashChanger.replaceHash(sAppHashNew);
			};

			// check if we already saved the same data
			var sAppStateKeyCached = this._oLastSavedInnerAppData.sAppStateKey;
			var bInnerAppDataEqual = (JSON.stringify(mInnerAppData) === JSON.stringify(this._oLastSavedInnerAppData.oAppData));
			if (bInnerAppDataEqual && sAppStateKeyCached) {
				// passed inner app state found in cache
				this._oLastSavedInnerAppData.iCacheHit++;

				// replace inner app hash with cached appStateKey in url (just in case the app has changed the
				// hash in meantime)
				fnReplaceHash(sAppStateKeyCached);
				oMyDeferred.resolve(sAppStateKeyCached);
				return oMyDeferred.promise();
			}

			// passed inner app state not found in cache
			this._oLastSavedInnerAppData.iCacheMiss++;

			var fnOnAfterSave = function(sAppStateKey) {

				// replace inner app hash with new appStateKey in url
				if (!bImmediateHashReplace) {
					fnReplaceHash(sAppStateKey);
				}

				// remember last saved state
				that._oLastSavedInnerAppData.oAppData = mInnerAppData;
				that._oLastSavedInnerAppData.sAppStateKey = sAppStateKey;
				oMyDeferred.resolve(sAppStateKey);
			};

			var fnOnError = function(oError) {
				oMyDeferred.reject(oError);
			};

			var sAppStateKey = this._saveAppState(mInnerAppData, fnOnAfterSave, fnOnError);

			/*
			 * Note that _sapAppState may return 'undefined' in case that the parsing has failed. In this case, we should not trigger the replacement
			 * of the App Hash with the generated key, as the container was not written before. Note as well that the error handling has already
			 * happened before by making the oMyDeferred promise fail (see fnOnError above).
			 */
			if (sAppStateKey !== undefined) {
				// replace inner app hash with new appStateKey in url
				// note: we do not wait for the save to be completed: this asynchronously behaviour is necessary if
				// this method is called e.g. in a onLinkPressed event with no possibility to wait for the promise resolution
				if (bImmediateHashReplace) {
					fnReplaceHash(sAppStateKey);
				}
			}

			return oMyDeferred.promise();
		},

		processBeforeSmartLinkPopoverOpens: function(oTableEventParameters, sSelectionVariant, mInnerAppData) {
			/* eslint-disable */
			var oMyDeferred = jQuery.Deferred();
			/* eslint-enable */
			var mSemanticAttributes = oTableEventParameters.semanticAttributes;
			var that = this;

			var fnStoreXappAndCallOpen = function(mSemanticAttributes, sSelectionVariant) {

				// mix the semantic attributes (e.g. from the row line) with the selection variant (e.g. from
				// the filter bar)
				sSelectionVariant = sSelectionVariant || "{}";

				var iSuppressionBehavior = SuppressionBehavior.raiseErrorOnNull | SuppressionBehavior.raiseErrorOnUndefined;
				/*
				 * compatiblity: Until SAPUI5 1.28.5 (or even later) the Smart Link in a Smart Table is filtering all null- and undefined values.
				 * Therefore, mSemanticAttributes are already reduced appropriately -- this does not need to be done by
				 * mixAttributesAndSelectionVariant again. To ensure that we still have the old behaviour (i.e. an Error is raised in case that
				 * behaviour of the Smart Link control has changed), the "old" Suppression Behaviour is retained.
				 */

				var oMixedSelVar = that.mixAttributesAndSelectionVariant(mSemanticAttributes, sSelectionVariant, iSuppressionBehavior);
				sSelectionVariant = oMixedSelVar.toJSONString();

				// enrich the semantic attributes with single selections from the selection variant
				mSemanticAttributes = that._getURLParametersFromSelectionVariant(oMixedSelVar);

				var fnOnContainerSave = function(sAppStateKey) {
					// set the stored data in popover and call open()
					oTableEventParameters.setSemanticAttributes(mSemanticAttributes);
					oTableEventParameters.setAppStateKey(sAppStateKey);
					oTableEventParameters.open(); // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Note that "open" does not
					// open the popover, but proceeds
					// with firing the onNavTargetsObtained event.
					oMyDeferred.resolve(oTableEventParameters);
				};

				var fnOnError = function(oError) {
					oMyDeferred.reject(oError);
				};

				// store the sap-xapp-state
				that._saveAppState({
					selectionVariant: sSelectionVariant
				}, fnOnContainerSave, fnOnError);
			};

			if (mInnerAppData) {

				var oStoreInnerAppStatePromise = this.storeInnerAppState(mInnerAppData, true);

				// if the inner app state was successfully stored, store also the xapp-state
				oStoreInnerAppStatePromise.done(function() {
					fnStoreXappAndCallOpen(mSemanticAttributes, sSelectionVariant);
				});

				oStoreInnerAppStatePromise.fail(function(oError) {
					oMyDeferred.reject(oError);
				});

			} else {
				// there is no inner app state to save, just put the parameters into xapp-state
				fnStoreXappAndCallOpen(mSemanticAttributes, sSelectionVariant);
			}

			return oMyDeferred.promise();
		},

		mixAttributesAndSelectionVariant: function(mSemanticAttributes, sSelectionVariant, iSuppressionBehavior) {

			if (iSuppressionBehavior === undefined) {
				iSuppressionBehavior = sap.suite.ui.generic.template.ListReport.nav.SuppressionBehavior.standard;
			}

			var oSelectionVariant = new SelectionVariant(sSelectionVariant);
			var oNewSelVariant = new SelectionVariant();

			// add all semantic attributes to the mixed selection variant
			for ( var sPropertyName in mSemanticAttributes) {
				if (mSemanticAttributes.hasOwnProperty(sPropertyName)) {
					// A value of a semantic attribute may not be a string, but can be e.g. a date.
					// Since the selection variant accepts only a string, we have to convert it in dependence of
					// the type.
					var vSemanticAttributeValue = mSemanticAttributes[sPropertyName];

					if (jQuery.type(vSemanticAttributeValue) === "array" || jQuery.type(vSemanticAttributeValue) === "object") {
						vSemanticAttributeValue = JSON.stringify(vSemanticAttributeValue);
					} else if (jQuery.type(vSemanticAttributeValue) === "date") {
						// use the same conversion method for dates as the SmartFilterBar: toJSON()
						vSemanticAttributeValue = vSemanticAttributeValue.toJSON();
					} else if (jQuery.type(vSemanticAttributeValue) === "number" || jQuery.type(vSemanticAttributeValue) === "boolean") {
						vSemanticAttributeValue = vSemanticAttributeValue.toString();
					}

					if (vSemanticAttributeValue === "") {
						if (iSuppressionBehavior & SuppressionBehavior.ignoreEmptyString) {
							jQuery.sap.log.info("Semantic attribute " + sPropertyName + " is an empty string and due to the chosen Suppression Behiavour is being ignored.");
							continue;
						}
					}

					if (vSemanticAttributeValue === null) {
						if (iSuppressionBehavior & SuppressionBehavior.raiseErrorOnNull) {
							throw new Error("NavigationHandler.INVALID_INPUT", Severity.ERROR);
						} else {
							jQuery.sap.log.warning("Semantic attribute " + sPropertyName + " is null and ignored for mix in to selection variant");
							continue; // ignore!
						}
					}

					if (vSemanticAttributeValue === undefined) {
						if (iSuppressionBehavior & SuppressionBehavior.raiseErrorOnUndefined) {
							throw new Error("NavigationHandler.INVALID_INPUT", Severity.ERROR);
						} else {
							jQuery.sap.log.warning("Semantic attribute " + sPropertyName + " is undefined and ignored for mix in to selection variant");
							continue;
						}
					}

					if (jQuery.type(vSemanticAttributeValue) === "string") {
						oNewSelVariant.addSelectOption(sPropertyName, "I", "EQ", vSemanticAttributeValue);
					} else {
						throw new Error("NavigationHandler.INVALID_INPUT", Severity.ERROR);
					}

				}
			}

			// add parameters that are not part of the oNewSelVariant yet
			var aParameters = oSelectionVariant.getParameterNames();
			var i;
			for (i = 0; i < aParameters.length; i++) {
				if (!oNewSelVariant.getSelectOption(aParameters[i])) {
					oNewSelVariant.addSelectOption(aParameters[i], "I", "EQ", oSelectionVariant.getParameter(aParameters[i]));
				}
			}

			// add selOptions that are not part of the oNewSelVariant yet
			var aSelOptionNames = oSelectionVariant.getSelectOptionsPropertyNames();
			for (i = 0; i < aSelOptionNames.length; i++) {
				if (!oNewSelVariant.getSelectOption(aSelOptionNames[i])) {
					var aSelectOption = oSelectionVariant.getSelectOption(aSelOptionNames[i]);
					// add every range in the current select option
					for (var j = 0; j < aSelectOption.length; j++) {
						oNewSelVariant.addSelectOption(aSelOptionNames[i], aSelectOption[j].Sign, aSelectOption[j].Option, aSelectOption[j].Low, aSelectOption[j].High);
					}
				}
			}

			return oNewSelVariant;
		},

		_ensureSelectionVariantFormatString: function(vSelectionVariant) {
			/*
			 * There are legacy AppStates where the SelectionVariant is being stored as a string. However, that is not compliant to the specification,
			 * which states that a standard JS object shall be provided. Internally, however, the selectionVariant is always of type string. Situation
			 * Persistency internal API ---------------- ------------------ --------------------- legacy string string new approach (JSON) object
			 * string
			 */

			if (vSelectionVariant === undefined) {
				return undefined;
			}

			var vConvertedSelectionVariant = vSelectionVariant;

			if (typeof vSelectionVariant === "object") {
				vConvertedSelectionVariant = JSON.stringify(vSelectionVariant);
			}

			return vConvertedSelectionVariant;
		},

		_addParametersToAppData: function(oAppData, oStartupParameters) {
			var vSelectionVariant = oAppData.selectionVariant || {};
			/*
			 * Be aware that oAppData.selectionVariant may be both: a string or an object. for details see also _ensureSelectionVariantFormatString()
			 */
			var oSelectionVariant = new SelectionVariant(vSelectionVariant);

			for ( var sPropertyName in oStartupParameters) {
				if (oStartupParameters.hasOwnProperty(sPropertyName)) {

					var sValue = "";
					// We support parameters as a map with strings and as a map with arrays with length one (as
					// returned by component.getStartupParameters).
					if (typeof oStartupParameters[sPropertyName] === "string") {
						sValue = oStartupParameters[sPropertyName];
					} else if (jQuery.type(oStartupParameters[sPropertyName]) === "array" && oStartupParameters[sPropertyName].length === 1) {
						sValue = oStartupParameters[sPropertyName][0]; // only single-valued parameters are allowed
					} else {
						throw new Error("NavigationHandler.INVALID_INPUT", Severity.ERROR);
					}

					// add URL parameter to SelectionVariant:

					// if the property is neither in parameters nor in selOpts, there is no conflict and we can
					// just put URL parameter to the selection variant
					if (typeof oSelectionVariant.getSelectOption(sPropertyName) === "undefined" && typeof oSelectionVariant.getParameter(sPropertyName) === "undefined") {
						oSelectionVariant.addSelectOption(sPropertyName, "I", "EQ", sValue);
						continue;
					}

					// if the property is already in the selection variant there could be a conflict
					if (oSelectionVariant.getSelectOption(sPropertyName) || oSelectionVariant.getParameter(sPropertyName)) {

						switch (this.sParamHandlingMode) {
							// SelectionVariant wins do nothing
							case ParamHandlingMode.SelVarWins:
								break;

							// URL parameters wins
							case ParamHandlingMode.URLParamWins:

								// first remove the property if it's already in the select option or parameters
								oSelectionVariant.removeSelectOption(sPropertyName);
								oSelectionVariant.removeParameter(sPropertyName);

								oSelectionVariant.addSelectOption(sPropertyName, "I", "EQ", sValue);
								break;

							// Insert URL parameters into Selection Options
							case ParamHandlingMode.InsertInSelOpt:
								// if the parameter which has to be added to the selection variant is already in the
								// parameters of the selection variant,
								// we have to ensure that the added one is in the select option and the old one is
								// removed from the selection variant
								var sOldParamValue = oSelectionVariant.getParameter(sPropertyName);
								if (sOldParamValue) {
									oSelectionVariant.removeParameter(sPropertyName);
									oSelectionVariant.addSelectOption(sPropertyName, "I", "EQ", sOldParamValue);
								}

								// addSelectOption will not add if already in
								oSelectionVariant.addSelectOption(sPropertyName, "I", "EQ", sValue);
								break;
							default:
								// default: SelectionVariant wins. Do nothing.
								break;
						}
					}
				}
			}
			oAppData.selectionVariant = oSelectionVariant.toJSONString();
			return oAppData;
		},

		_saveAppState: function(oAppData, fnOnAfterSave, fnOnError) {

			var oAppState = this.oCrossAppNavService.createEmptyAppState(this.oComponent);
			var sAppStateKey = oAppState.getKey();
			var oError;

			var oAppDataForSave = {
				selectionVariant: {},
				tableVariantId: "",
				customData: {}
			};

			if (oAppData.selectionVariant) {
				/*
				 * The specification states that Selection Variants need to be JSON objects. However, internally, we work with strings for
				 * "selectionVariant". Therefore, in case that this is a string, we need to JSON-parse the data.
				 */
				if (typeof oAppData.selectionVariant === "string") {
					try {
						oAppDataForSave.selectionVariant = JSON.parse(oAppData.selectionVariant);
					} catch (x) {
						oError = this._createTechnicalError("NavigationHandler.AppStateSave.parseError");
						if (fnOnError) {
							fnOnError(oError);
						}
						return undefined;
					}
				} else {
					oAppDataForSave.selectionVariant = oAppData.selectionVariant;
				}
			}
			if (oAppData.tableVariantId) {
				oAppDataForSave.tableVariantId = oAppData.tableVariantId;
			}
			if (oAppData.customData) {
				oAppDataForSave.customData = oAppData.customData;
			}
			oAppState.setData(oAppDataForSave);
			var oSavePromise = oAppState.save();

			if (fnOnAfterSave) {
				oSavePromise.done(function() {
					fnOnAfterSave(sAppStateKey);
				});
			}

			if (fnOnError) {
				var that = this;
				oSavePromise.fail(function() {
					oError = that._createTechnicalError("NavigationHandler.AppStateSave.failed");
					fnOnError(oError);
				});
			}
			return sAppStateKey;
		},

		_loadAppState: function(sAppStateKey, oDeferred) {

			var oAppStatePromise = this.oCrossAppNavService.getAppState(this.oComponent, sAppStateKey);
			var that = this;

			oAppStatePromise.done(function(oAppState) {
				var oAppData = {
					selectionVariant: "{}",
					tableVariantId: "",
					customData: {}
				};
				var oAppDataLoaded = oAppState.getData();

				if (typeof oAppDataLoaded === "undefined") {
					var oError = that._createTechnicalError("NavigationHandler.getDataFromAppState.failed");
					oDeferred.reject(oError, {}, NavType.iAppState);
				} else {
					if (oAppDataLoaded.selectionVariant) {
						/*
						 * In case that we get an object from the stored AppData (=persistency), we need to stringify the JSON object.
						 */
						oAppData.selectionVariant = that._ensureSelectionVariantFormatString(oAppDataLoaded.selectionVariant);
					}
					if (oAppDataLoaded.tableVariantId) {
						oAppData.tableVariantId = oAppDataLoaded.tableVariantId;
					}
					if (oAppDataLoaded.customData) {
						oAppData.customData = oAppDataLoaded.customData;
					}
				}

				// resolve is called on passed Deferred object to trigger a call of the done method, if
				// implemented
				// the done method will receive the loaded appState and the navigation type as parameters
				oDeferred.resolve(oAppData, {}, NavType.iAppState);
			});
			oAppStatePromise.fail(function() {
				var oError = that._createTechnicalError("NavigationHandler.getAppState.failed");
				oDeferred.reject(oError, {}, NavType.iAppState);
			});
		},

		_getInnerAppStateKey: function(sAppHash) {

			// trivial case: no app hash available at all.
			if (!sAppHash) {
				return undefined;
			}

			/* new approach: separated via question mark / part of the query parameter of the AppHash */
			var aMatches = this._rIAppStateNew.exec(sAppHash);

			/* old approach: spearated via slashes / i.e. part of the route itself */
			if (aMatches === null) {
				aMatches = this._rIAppStateOld.exec(sAppHash);
			}

			/*
			 * old approach: special case: if there is no deep route/key defined, the sap-iapp-state may be at the beginning of the string, without
			 * any separation with the slashes
			 */
			if (aMatches === null) {
				aMatches = this._rIAppStateOldAtStart.exec(sAppHash);
			}

			if (aMatches === null) {
				// there is no (valid) sap-iapp-state in the App Hash
				return undefined;
			}

			return aMatches[1];
		},

		_replaceInnerAppStateKey: function(sAppHash, sAppStateKey) {
			var sNewIAppState = this.IAPP_STATE + "=" + sAppStateKey;

			/*
			 * generate sap-iapp-states with the new way
			 */
			if (!sAppHash) {
				// there's no sAppHash key yet
				return "?" + sNewIAppState;
			}

			var fnAppendToQueryParameter = function(sAppHash) {
				// there is an AppHash available, but it does not contain a sap-iapp-state parameter yet - we need to append one

				// new approach: we need to check, if a set of query parameters is already available
				if (sAppHash.indexOf("?") !== -1) {
					// there are already query parameters available - append it as another parameter
					return sAppHash + "&" + sNewIAppState;
				}
				// there are no a query parameters available yet; create a set with a single parameter
				return sAppHash + "?" + sNewIAppState;
			};

			if (!this._getInnerAppStateKey(sAppHash)) {
				return fnAppendToQueryParameter(sAppHash);
			}
			// There is an AppHash available and there is already an sap-iapp-state in the AppHash

			if (this._rIAppStateNew.test(sAppHash)) {
				// the new approach is being used
				return sAppHash.replace(this._rIAppStateNew, function(sNeedle) {
					return sNeedle.replace(/\=.*/ig, "=" + sAppStateKey);
				});
			}

			// we need to remove the old AppHash entirely and replace it with a new one.

			var fnReplaceOldApproach = function(rOldApproach, sAppHash) {
				sAppHash = sAppHash.replace(rOldApproach, "");
				return fnAppendToQueryParameter(sAppHash);
			};

			if (this._rIAppStateOld.test(sAppHash)) {
				return fnReplaceOldApproach(this._rIAppStateOld, sAppHash);
			}

			if (this._rIAppStateOldAtStart.test(sAppHash)) {
				return fnReplaceOldApproach(this._rIAppStateOldAtStart, sAppHash);
			}

			jQuery.sap.assert(false, "internal inconsistency: Approach of sap-iapp-state not known, but _getInnerAppStateKey returned it");
			return undefined;
		},

		_getURLParametersFromSelectionVariant: function(vSelectionVariant) {
			var mURLParameters = {};
			var i = 0;
			var oSelectionVariant;

			if (typeof vSelectionVariant === "string") {
				oSelectionVariant = new SelectionVariant(vSelectionVariant);
			} else if (typeof vSelectionVariant === "object") {
				oSelectionVariant = vSelectionVariant;
			} else {
				throw new Error("NavigationHandler.INVALID_INPUT", Severity.ERROR);
			}

			// add URLs parameters from SelectionVariant.SelectOptions (if single value)
			var aSelectProperties = oSelectionVariant.getSelectOptionsPropertyNames();
			for (i = 0; i < aSelectProperties.length; i++) {
				var aSelectOptions = oSelectionVariant.getSelectOption(aSelectProperties[i]);
				if (aSelectOptions.length === 1 && aSelectOptions[0].Sign === "I" && aSelectOptions[0].Option === "EQ") {
					mURLParameters[aSelectProperties[i]] = aSelectOptions[0].Low;
				}
			}

			// add parameters from SelectionVariant.Parameters
			var aParameterNames = oSelectionVariant.getParameterNames();
			for (i = 0; i < aParameterNames.length; i++) {
				var sParameterValue = oSelectionVariant.getParameter(aParameterNames[i]);

				mURLParameters[aParameterNames[i]] = sParameterValue;
			}
			return mURLParameters;
		},

		_createTechnicalError: function(sErrorCode, oPrevious) {

			// currently the following error codes are set:
			// "NavigationHandler.isIntentSupported.failed"
			// "NavigationHandler.AppStateSave.failed"
			// "NavigationHandler.getDataFromAppState.failed"
			// "NavigationHandler.getStartupState.failed"

			var sSeverity = Severity.ERROR;
			var mUItext = {
				oi18n: this.oi18n,
				sTextKey: "TECHNICAL_ERROR"
			};
			/* eslint-disable */
			// TODO provide detail error messages, as soon as Error object supports it
			/* eslint-enable */
			return new Error(sErrorCode, sSeverity, oPrevious, mUItext);
		}
	});

	return NavigationHandler;

});
