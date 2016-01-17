sap.ui.define(
	[
		"jquery.sap.global",
		"sap/ui/model/json/JSONPropertyBinding"
	],
	function(jQuery, JSONPropertyBinding) {
		"use strict";

		/**
		 * Constructor for a new W5gPropertyBinding.
		 *
		 * @param {sap.ui.model.json.JSONModel} oModel
		 * @param {string} sPath
		 * @param {sap.ui.model.Context} oContext
		 * @param {object} [mParameters]
		 *
		 * @class
		 * WYSIWYG Property binding implementation
		 * @extends sap.ui.model.json.JSONPropertyBinding
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.databinding.W5gPropertyBinding
		 */
		var W5gPropertyBinding = JSONPropertyBinding.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.databinding.W5gPropertyBinding");

		/**
		 * Returns the current value of the bound target (incl. re-evaluation)
		 *
		 * @return {object} the current value of the bound target
		 *
		 * @override sap.ui.model.json.JSONPropertyBinding#_getValue
		 * The original sap.ui.model.json.JSONPropertyBinding._getValue does not use mParameters.
		 */
		W5gPropertyBinding.prototype._getValue = function() {
			/* ---ORIGINAL CODE BEGIN--- */
			var sProperty = this.sPath.substr(this.sPath.lastIndexOf("/") + 1);
			if (sProperty === "__name__") {
				var aPath = this.oContext.split("/");
				return aPath[aPath.length - 1];
			}
			/* ---ORIGINAL CODE END--- */
			// pass path prefix (if any) to the getProperty method
			return this.oModel.getProperty(this.sPath, this.oContext, (this.mParameters || {}).pathPrefix);
		};

		return W5gPropertyBinding;
	},
	/* bExport= */ true
);
