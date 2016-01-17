sap.ui.define(
	[
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/json/JSONListBinding",
		"../databinding/W5gPropertyBinding"
	],
	function (JSONModel, JSONListBinding, W5gPropertyBinding) {
		"use strict";

// Private variables and methods
// Begin
		/**
		 * Gets the value for the property with the given <code>sPath</code>
		 *
		 * @param {object} oData
		 * @param {string} sPath
		 *
		 * @name _getData
		 * @function
		 * @private
		 */
		function _getData(oData, sPath) {
			if (oData === undefined) {
				return undefined;
			}
			sPath = sPath || "";

			var aPath = sPath.split("/"),
				iLen = aPath.length;
			jQuery.each(aPath, function (iIndex, sValue) {
				sPath = sValue;
				if (iIndex !== iLen - 1) {
					if (!oData || oData[sPath] === undefined) {
						return undefined;
					}
					oData = oData[sPath];
				}
			});
			return oData && oData[sPath];
		}
// End
// Private variables and methods

		/**
		 * Constructor for a new W5gDataBindingModel.
		 *
		 * @param {object} oData either the URL where to load the JSON from or a JS object
		 *
		 * @class
		 * WYSIWYG Model implementation
		 * @extends sap.ui.model.json.JSONModel
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gDataBindingModel
		 */
		var W5gDataBindingModel = JSONModel.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gDataBindingModel");

		/**
		 * Returns the value for the property with the given <code>sPath</code>
		 *
		 * @param {string} sPath the path to the property
		 * @param {object=} oContext the context which will be used to retrieve the property
		 * @param {string=} sPathPrefix w5g binding path prefix
		 * @return {any} the value of the property
		 *
		 * @override sap.ui.model.json.JSONModel#getProperty
		 * The original sap.ui.model.json.JSONModel.getProperty has no sPathPrefix parameter!
		 */
		W5gDataBindingModel.prototype.getProperty = function(sPath, oContext, sPathPrefix) {
			return _getData(this.oData, (sPathPrefix || "") + sPath);
		};

		/**
		 * @param {string} sPath the path pointing to the property that should be bound
		 * @param {object=} oContext the context object for this data binding
		 * @param {object=} mParameters additional model specific parameters
		 * @return {sap.ui.model.PropertyBinding}
		 *
		 * @override sap.ui.model.json.JSONModel#bindProperty
		 * We need to use our implementation of PropertyBinding
		 */
		W5gDataBindingModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
			return new W5gPropertyBinding(this, sPath, oContext, mParameters);
		};

		/**
		 * @param {string} sPath the path pointing to the list / array that should be bound
		 * @param {object=} oContext the context object for this databinding (optional)
		 * @param {sap.ui.model.Sorter=} aSorters initial sort order (can be either a sorter or an array of sorters) (optional)
		 * @param {sap.ui.model.Filter=} aFilters predefined filter/s (can be either a filter or an array of filters) (optional)
		 * @param {object=} mParameters additional model specific parameters (optional)
		 * @return {sap.ui.model.ListBinding}
		 *
		 * @override sap.ui.model.json.JSONModel#bindList
		 */
		W5gDataBindingModel.prototype.bindList = function (sPath, oContext, aSorters, aFilters, mParameters) {
			if (!jQuery.sap.startsWith(sPath,'/')) {
				sPath = "/" + sPath;
			}
			return new JSONListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
		};

		return W5gDataBindingModel;
	},
	/* bExport= */ true
);
