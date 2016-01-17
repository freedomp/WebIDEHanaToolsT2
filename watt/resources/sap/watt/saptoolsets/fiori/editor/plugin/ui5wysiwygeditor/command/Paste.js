define(
	[
		"../utils/W5gUtils",
		"../utils/ControlMetadata",
		"./W5gCommand"
	],
	function (W5gUtils, ControlMetadata, W5gCommand) {
		"use strict";

		return jQuery.extend({}, W5gCommand, {

			/**
			 * @see W5gCommand.execute
			 */
			execute: function () {
				return this.context.service.ui5wysiwygeditor.paste();
			},


			/**
			 * Command is enabled if "Copy" or "Cut" command was performed and there is a control to paste
			 *
			 * @return {Boolean}
			 *
			 * @override W5gCommand.isEnabled
			 */
			isEnabled: function () {
				var that = this;
				return that.context.service.ui5wysiwygeditor.getCurrentSelectedControl().then( function (oControl) {
					return W5gUtils.andBetweenTwoPromises(that.context.service.ui5wysiwygeditor.hasClipboard(),
							W5gCommand.isEnabled.apply(that)).then(function(bResult) {
								return bResult && ControlMetadata.isControlEditable(oControl);
						});

				}).fail(function(oError) {
					jQuery.sap.log.error(oError);
				});
			}
		});
	}
);
