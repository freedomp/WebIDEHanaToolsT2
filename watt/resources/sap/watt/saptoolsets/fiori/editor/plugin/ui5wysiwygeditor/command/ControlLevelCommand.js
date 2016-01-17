define(
	[
		"./W5gCommand"
	],
	function (W5gCommand) {
		"use strict";

		return jQuery.extend({}, W5gCommand, {

			/**
			 * Command is enabled if a control has been selected and aggregation is not selected
			 *
			 * @return {Boolean}
			 *
			 * @override W5gCommand.isEnabled
			 */
			isEnabled: function () {
				return this.context.service.ui5wysiwygeditor.getSelection().then(function (oResult) {
					return !!(oResult && oResult[0].control && !oResult[0].aggregation);
				});
			}
		});
	}
);
