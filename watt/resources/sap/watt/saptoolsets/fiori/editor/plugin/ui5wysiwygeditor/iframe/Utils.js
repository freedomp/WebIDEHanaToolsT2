sap.ui.define(
	function () {
		"use strict";

// Private variables and methods
// Begin
		function nameToUpperCase(sName) {
			return sName.charAt(0).toUpperCase() + sName.slice(1);
		}

		/**
		 * Provides the mutation method for the this control and aggregation.
		 * @param {object} oAggregation  aggregation object
		 * @param {string} candidatePrefixes
		 * @returns {string}
		 */
		function getAggregationMethod(oAggregation, candidatePrefixes) {
			var method;
			var sCamelCaseName;
			if (oAggregation.multiple) {
				sCamelCaseName = nameToUpperCase(oAggregation.singularName);
			}
			var sCamelCasePluralName = nameToUpperCase(oAggregation.name);
			var sMethods = candidatePrefixes || [ "insert", "set", "add" ];
			for (var _i = 0; _i < sMethods.length; _i++) {
				var methodName = sMethods[_i] + sCamelCasePluralName;
				method = this[methodName] ?
					this[methodName] : this[sMethods[_i] + sCamelCaseName];
				if (method) {
					break;
				}
			}
			return method;
		}
// End
// Private variables and methods

		var Utils = {};

		Utils.getAggregationFilter = function() {
			return [ "tooltip", "customData", "layoutData" ];
		};

		Utils.iterateOverAllPublicAggregations = function(oControl, fnCallback, fnBreakCondition, aFilter) {
			var aPromises = [],
				oRes;
			var mAggregations = oControl.getMetadata().getAllAggregations();
			if (!mAggregations) {
				oRes = fnCallback();
				// TODO Remove the Q instance
				if (window.Q && Q.isPromise(oRes)) {
					return oRes;
				}
			}
			for ( var sName in mAggregations) {
				if (aFilter && aFilter.indexOf(sName) !== -1) {
					continue;
				}
				var oAggregation = mAggregations[sName];
				if (!oAggregation._sGetter && !oControl.__calledJSONKeys) {
					oControl.getMetadata().getJSONKeys();
					// Performance optimization
					oControl.__calledJSONKeys = true;
				}
				if (oAggregation._sGetter) {
					var oValue = oControl[oAggregation._sGetter]();
					//mix attribute value and aggregation control here
					//example: SimpleForm has both an attribute 'title' and an aggregation 'title'
					if(typeof oValue !== "object") {
						continue;
					}
					//ATTENTION:
					//under some unknown circumstances the return oValue looks like an Array but jQuery.isArray() returned undefined => false
					//that is why we use array ducktyping with a null check!
					//In Watt reproducible with Windows and Chrome (currently 35), when creating a project and opening WYSIWYG editor afterwards on any file
					//sap.m.Panel.prototype.getHeaderToolbar() returns a single object but an array
					oValue = oValue && oValue.splice ? oValue : (oValue ? [oValue]: []);
					oRes = fnCallback(oAggregation, oValue);
					if (window.Q && Q.isPromise(oRes)) {
						aPromises.push(oRes);
					}
					if (fnBreakCondition && fnBreakCondition(oAggregation, oValue)) {
						break;
					}
				}
			}

			if (window.Q && aPromises.length) {
				return Q.all(aPromises);
			}
		};

		/**
		 * Gets the <code>oWYSIWYGParent</code>'s aggregation name for the given <code>oControl</code> control.
		 *
		 * @param {sap.ui.core.Control} oControl control
		 * @param {sap.ui.core.Control} oWYSIWYGParent parent control
		 * @return {!string} Returns the aggregation name or null if not found.
		 */
		Utils.getWYSIWYGParentAggregationName = function(oControl, oWYSIWYGParent) {
			var sAggregationName = oWYSIWYGParent ? oControl.sParentAggregationName : null,
				bFound = false,
				that = this;

			if (oWYSIWYGParent) {
				if ((that.getAggregationByName(oWYSIWYGParent, sAggregationName)).indexOf(oControl) === -1) {
					jQuery.each(oWYSIWYGParent.getMetadata().getAllAggregations() || {}, function(sName) {
						if ((that.getAggregationByName(oWYSIWYGParent, sName)).indexOf(oControl) !== -1) {
							bFound = true;
							sAggregationName = sName;
							return false;
						}
					});
					if (!bFound) {
						sAggregationName = null;
					}
				}
			}
			return sAggregationName;
		};

		/**
		 * Gets the content of the aggregation identified by <code>sName</code> of the given <code>oControl</code> control.
		 *
		 * @param {sap.ui.core.Control} oControl control
		 * @param {string} sName aggregation name
		 * @return {Array} Returns content of the aggregation or an empty array.
		 */
		Utils.getAggregationByName = function(oControl, sName) {
			var aResult = [],
				oAggregation = (oControl && oControl.getMetadata().getAllAggregations() || {})[sName];

			if (oAggregation) {
				if (!oAggregation._sGetter && !oControl.__calledJSONKeys) {
					oControl.getMetadata().getJSONKeys();
					// Performance optimization
					oControl.__calledJSONKeys = true;
				}

				aResult = oAggregation._sGetter && oControl[oAggregation._sGetter]() || [];

				//the aggregation has primitive alternative type
				if (typeof aResult !== "object") {
					aResult = [];
				}
				aResult = aResult.splice ? aResult : [aResult];
			}
			return aResult;
		};

		Utils.findAllPublicControls = function(oCtl, oCore) {
			var aFoundControls = [];
			var thiz = this;

			function internalFind(oControl) {
				if (oControl.getMetadata().getClass() === oCore.UIArea) {
					var aContent = oControl.getContent();
					for (var i = 0; i < aContent.length; i++) {
						internalFind(aContent[i]);
					}
				} else if (oControl.getMetadata().getClass() === oCore.ComponentContainer) {
					internalFind(oControl.getComponentInstance().getAggregation("rootControl"));
				} else {
					oControl.__publicControl = true;
					aFoundControls.push(oControl);
					var mBindingInfos = oControl.mBindingInfos;
					if (mBindingInfos) {
						for (var sBinding in mBindingInfos) {
							var oBindingInfo = mBindingInfos[sBinding];
							if (oBindingInfo.parts && oBindingInfo.parts[0] && oBindingInfo.parts[0].template) {
								aFoundControls.push(oBindingInfo.parts[0].template);
							} else if (oBindingInfo.template) {
								aFoundControls.push(oBindingInfo.template);
							}
						}
					}
					thiz.iterateOverAllPublicAggregations(oControl, function(oAggregation, aControls) {
						if (aControls && aControls.length) { // TODO: ARRAY CHECK
							for (var k = 0; k < aControls.length; k++) {
								var oObj = aControls[k];
								if (oObj instanceof oCore.Element) {
									internalFind(oObj);
								}
							}
						} else if (aControls instanceof oCore.Element) {
							internalFind(aControls);
						}
					}, null, Utils.getAggregationFilter());
				}
			}
			internalFind(oCtl);

			return aFoundControls;

		};

		Utils.isControlPublic = function(oControl, oCore) {
			var thiz = this;

			function internalCheck(oObject) {
				if (oObject.__publicControl) {
					return true;
				}
				if (!oObject) {
					return false;
				}
				var oParent = oObject.getParent();
				if (!oParent) {
					return false;
				}
				if (oParent.__publicControl) {
					var aList = thiz.findAllPublicControls(oParent, oCore).filter(function(oSingleControl) {
						return oSingleControl.getId() === oControl.getId();
					});
					return aList.length > 0;
				}
				return internalCheck(oParent);
			}
			return internalCheck(oControl);
		};

		Utils.aggregationGetter = function(oControl, oAggregation) {
			var oResult = getAggregationMethod.call(oControl, oAggregation, [ "get" ]).call(oControl);
			// Some controls return only single control and not array.... Bad implementation??!?
			if (!jQuery.isArray(oResult)) {
				oResult = [ oResult ];
			}
			return oResult;
		};

		/**
		 * Returns the aggregation content of the given aggregation overlay
		 *
		 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay
		 * @returns {object}
		 */
		Utils.getAggregation = function(oAggregationOverlay) {
			var sAggregationName = oAggregationOverlay.getAggregationName(),
				oParentControl = oAggregationOverlay.getElementInstance();

			return oParentControl && oParentControl.mAggregations && oParentControl.mAggregations[sAggregationName];
		};

		return Utils;
	},
	/* bExport= */ true
);
