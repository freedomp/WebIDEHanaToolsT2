define(
	[
		"./W5gCommand"
	],
	function (W5gCommand) {
		"use strict";
		return jQuery.extend({}, W5gCommand, {

			/**
			 * @see W5gCommand.execute
			 */
			execute: function () {
				return this.context.service.ui5wysiwygeditor.navigateUI5Control("up");
			}
		});
	}
);
