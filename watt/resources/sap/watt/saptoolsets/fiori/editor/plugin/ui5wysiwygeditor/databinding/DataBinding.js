define(
	[
		"sap/watt/lib/lodash/lodash"
	],
	function (_) {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.databinding.DataBinding");

// Private variables and methods
// Begin
		var
			/**
			 * Binding path's prefix separator . The separator MUST make the generated path to be invalid binding path
			 * to avoid collisions with original path(s)
			 *
			 * @const
			 * @type {string}
			 * @private
			 */
			PATH_SEPARATOR = "###",
			/**
			 * Aggregation binding dummy data
			 *
			 * @const
			 * @type {Array<object>}
			 * @private
			 */
			DUMMY_AGGREGATION_DATA = [{}],

			/**
			 * Array of not relevant aggregation names
			 *
			 * @type {Array<string>}
			 * @private
			 */
			_aAggregationFilter,

			/**
			 * Wg5 Utils instance
			 *
			 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils}
			 * @private
			 */
			_oUtils;

		/**
		 * Add models with relevant data to the given <code>oControl</code> control
		 *
		 * @param {sap.ui.core.Control} oControl
		 * @param {Window} oWindow
		 *
		 * @name _applyModel
		 * @function
		 * @private
		 */
		function _applyModel(oControl, oWindow) {
			if (!oControl.mBindingInfos) {
				return;
			}

			var mBindingInfos = oControl.mBindingInfos || {},
				mModelsData = {},
				oProperty, sPath, sModelName, oData,
				Model = oWindow.sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gDataBindingModel,
				DataType = oWindow.sap.ui.base.DataType;

			jQuery.each(mBindingInfos, function(sName, oBindingInfo) {
				oProperty = oControl.getMetadata().getAllProperties()[sName];

				if (oProperty && !_isString(oProperty.type, DataType)) {
					// if property and it is not string property, then its binding string can't be shown on the canvas.
					return;
				}

				sPath = oBindingInfo.path;
				sModelName = oBindingInfo.model;
				oData = DUMMY_AGGREGATION_DATA;

				if (oBindingInfo.template || oBindingInfo.factory) { //aggregation binding
					if (sPath !== "/") {
						sPath = _.trimLeft(sPath, "/");
					}
				} else { // property binding
					oBindingInfo.parameters = {
						pathPrefix: sName + PATH_SEPARATOR
					};
					if (oBindingInfo.parts) {
						//use the first part as model data reference
						sModelName = oBindingInfo.parts[0].model;
						sPath = oBindingInfo.parts[0].path;
					}

					// Makes unique not valid binding path within the current model.
					sPath = oBindingInfo.parameters.pathPrefix + sPath;
					oData = _buildPropertyBindingExpression(oBindingInfo);
				}

				if (!mModelsData[sModelName]) {
					mModelsData[sModelName] = {};
				}
				if (oBindingInfo.template && sPath === "/") {
					mModelsData[sModelName] = DUMMY_AGGREGATION_DATA;
				} else {
					_setPath(mModelsData[sModelName], sPath, oData);
				}
			});

			jQuery.each(mModelsData, function(sModelName, oData) {
				if (sModelName === "undefined") { //side effect
					sModelName = undefined;
				}
				oControl.setModel(new Model(oData), sModelName);
			});
		}

		/**
		 * Updates given model data <code>oModelsData</code>
		 *
		 * @param {object} oModelsData model data
		 * @param {string} sPath
		 * @param {object} oData
		 *
		 * @name _setPath
		 * @function
		 * @private
		 */
		function _setPath(oModelsData, sPath, oData) {
			sPath = sPath || "";

			var aPath = sPath.split("/"),
				iLen = aPath.length,
				oTmp = oModelsData;
			jQuery.each(aPath, function (iIndex, sValue) {
				sPath = sValue;
				if (iIndex !== iLen - 1) {
					if (!oTmp[sPath]) {
						oTmp[sPath] = {};
					}
					oTmp = oTmp[sPath];
				}
			});
			oTmp[sPath] = oData;
		}

		/**
		 * Build the user friendly binding expression
		 *
		 * @param {object} oBindingInfo Binding info object
		 * @return {string} Returns user friendly binding expression
		 *
		 * @name _buildPropertyBindingExpression
		 * @function
		 * @private
		 */
		function _buildPropertyBindingExpression(oBindingInfo) {
			//TODO: maybe to use oBindingInfo.bindingString to show formatter

			var sPath = oBindingInfo.path,
				sModelName = oBindingInfo.model;

			if (oBindingInfo.parts) {
				return "{" + _.map(oBindingInfo.parts, function(oBinding) {
					return (oBinding.model ? oBinding.model + ">" : "") + oBinding.path;
				}).join(", ") + "}";
			}

			return "{" + (sModelName ? sModelName + ">" : "") + sPath + "}";
		}

		/**
		 * Checks if the given type is the string type
		 *
		 * @param {string} sTypeName Property type name
		 * @param {sap.ui.base.DataType} DataType Base data type
		 * @return {boolean} true if the given type is the string type
		 *
		 * @name _isString
		 * @function
		 * @private
		 */
		function _isString(sTypeName, DataType) {
			if (sTypeName) {
				var oTypeObject = DataType.getType(sTypeName);

				if (oTypeObject instanceof DataType) {
					return oTypeObject.getPrimitiveType().getName() === "string";
				}

				//Enumeration
				return true;
			}
			return false;
		}
// End
// Private variables and methods

		/**
		 * Constructor for a new DataBinding.
		 *
		 * @param {Window} oWindow
		 *
		 * @class
		 * Data binding class
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.databinding.DataBinding
		 */
		var DataBinding = function(oWindow) {
			this._init();
			//Model constructor has to be inside the canvas, otherwise the instanceof sap.ui.model check in ui5 core will fail.
			oWindow.jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gDataBindingModel");
			oWindow.jQuery.sap.require("sap.ui.base.DataType");

			this._oWindow = oWindow;
		};

		/**
		 * Initializes DataBinding.
		 * This method is invoked only once
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.databinding.DataBinding#_init
		 * @function
		 * @private
		 */
		DataBinding.prototype._init = _.once(function() {
			jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils");

			_oUtils = sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils;
			//TODO: check why _oUtils.getAggregationFilter() does not contain "dependents"
			_aAggregationFilter = _oUtils.getAggregationFilter().concat(["dependents"]);
		});

		/**
		 * Sets data binding model for the given aggregation and all its descendants
		 *
		 * @param {object} oAggregation Aggregation info or an array of aggregation controls
		 * @param {Array<sap.ui.core.Control>=} aValue An array of aggregation controls
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.databinding.DataBinding#displayDataBinding
		 * @function
		 * @public
		 */
		DataBinding.prototype.displayDataBinding = function (oAggregation, aValue) {
			if (arguments.length < 2) {
				aValue = oAggregation;
			}

			var that = this;

			jQuery.each(aValue || [], function() {
				/** @this {sap.ui.core.Control} */
				_applyModel(this, that._oWindow);
				_oUtils.iterateOverAllPublicAggregations(this, that.displayDataBinding.bind(that), null, _aAggregationFilter);
			});
		};

		return DataBinding;
	}
);
