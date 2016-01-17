"use strict";
define(["sap/watt/common/error/AssertError"], function(AssertError){
	return {
		/**
		 * Implement in inheriting classes
		 * @abstract
		 *
		 * Delegates command execution to ui5wysiwygeditor service.
		 *
		 * @return {Q}
		 *
		 * @name W5gCommand.execute
		 * @function
		 * @public
		 */

		/**
		 * Command is available if wysiwyg editor is the selection owner
		 *
		 * @return {Boolean}
		 *
		 * @name W5gCommand.isAvailable
		 * @function
		 * @public
		 * @throws {sap.watt.common.error.AssertError}
		 */
		isAvailable: function () {
			var oService = this.context.service;
			return this.context.service.ui5wysiwygeditor.getState().then(function (sState) {
				if (sState === null) {
					return oService.selection.assertOwner(oService.ui5wysiwygeditor).fail(function () {
						return oService.selection.assertOwner(oService.w5gOutline);
					});
				} else {
					throw new AssertError("Command is not available yet.");
				}
			});
		},

		/**
		 * Command is enabled if a control has been selected
		 *
		 * @return {Boolean}
		 *
		 * @name W5gCommand.isEnabled
		 * @function
		 * @public
		 */
		isEnabled: function () {
			return this.context.service.ui5wysiwygeditor.getSelection().then(function (oResult) {
				return !!(oResult && oResult[0].control);
			});
		}
	};
});
