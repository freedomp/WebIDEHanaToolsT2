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
				return this.context.service.quickstart.quickStartWithLayoutEditor();
			},

			/**
			 * Command is available only in "Chrome" browser
			 *
			 * @return {Boolean}
			 *
			 * @override W5gCommand.isAvailable
			 */
			isAvailable: function () {
				return jQuery.browser.chrome;
			},

			/**
			 * The command is always enabled
			 *
			 * @return {Boolean}
			 *
			 * @override W5gCommand.isEnabled
			 */
			isEnabled: function () {
				return true;
			}
		});
	}
);
