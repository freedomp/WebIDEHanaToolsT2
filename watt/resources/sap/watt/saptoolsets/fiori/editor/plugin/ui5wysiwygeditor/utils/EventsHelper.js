define(
	[
		"sap/watt/lib/lodash/lodash"
	],
	function (_) {
		"use strict";

// Private variables and methods
// Begin
		var
			/**
			 * Events object
			 *
			 * @type {object}
			 * @private
			 */
			_oEvent = null,
			/**
			 * Editor
			 *
			 * @type {sap.watt.common.plugin.platform.service.ui.AbstractEditor}
			 * @private
			 */
			_oEditor = null;
// End
// Private variables and methods

		/**
		 * WYSIWYG events helper
		 *
		 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.EventsHelper}
		 */
		var EventsHelper = {
			/**
			 * Initializes the helper
			 *
			 * @param {object} oContext W5g service context
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.EventsHelper.init
			 * @function
			 * @public
			 */
			init: _.once(function (oContext) {
				jQuery.sap.assert(oContext, "oContext must be a valid service context");
				_oEvent = _.get(oContext, "event");
				_oEditor = _.get(oContext, "service.ui5wysiwygeditor");
				jQuery.sap.assert(_oEvent, "event does not exists in the given context");
				jQuery.sap.assert(_oEditor, "ui5wysiwygeditor does not exists in the given context");
			}),

			/**
			 * Gets data model
			 *
			 * @return {sap.ui.model.json.JSONModel} data model
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.EventsHelper.fireViewHasChanged
			 * @function
			 * @public
			 */
			fireViewHasChanged: function () {
				jQuery.sap.assert(_oEvent, "EventsHelper is not initialized");
				if (_oEvent) {
					return _oEvent.fireViewHasChanged({editor: _oEditor});
				}
				return Q();
			}
		};
		return EventsHelper;
	}
);
