define(
	[
		"sap/watt/lib/lodash/lodash"
	],
	function (_) {
		"use strict";

		/**
		 * Constructor for a new ViewState.
		 *
		 * @param sViewStateContent {string} view content
		 * @param sViewStateSelectedControlId {string} selected control
		 *
		 * @class
		 * View State
		 * @template T
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ViewState
		 */
		function ViewState(sViewStateContent, sViewStateSelectedControlId) {
			/**
			 * @type {string}
			 * @private
			 */
			this._sViewStateContent = sViewStateContent;
			/**
			 * @type {string}
			 * @private
			 */
			this._sViewStateSelectedControlId = sViewStateSelectedControlId;
		}

		/**
		 * compare views state content
		 *
		 * @returns {boolean} Returns true if view states contents are identical
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ViewState#equalTo
		 * @function
		 * @public
		 */
		ViewState.prototype.equalTo = function (oViewStateToCompare) {
			return oViewStateToCompare && this._sViewStateContent === oViewStateToCompare.getViewStateContent();
		};

		/**
		 * getter for view state content
		 *
		 * @returns {string} _sViewStateContent
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ViewState#getViewStateContent
		 * @function
		 * @public
		 */
		ViewState.prototype.getViewStateContent = function () {
			return this._sViewStateContent;
		};

		/**
		 * getter for selected control id
		 *
		 * @returns {string} _sSelectedControlId
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ViewState#getViewStateSelectedControlId
		 * @function
		 * @public
		 */
		ViewState.prototype.getViewStateSelectedControlId = function () {
			return this._sViewStateSelectedControlId;
		};

		return ViewState;
	}
);