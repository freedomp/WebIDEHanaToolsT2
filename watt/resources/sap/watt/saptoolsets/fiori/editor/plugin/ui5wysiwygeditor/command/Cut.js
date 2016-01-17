define(
	[
		"./ControlLevelCommand"
	],
	function (ControlLevelCommand) {
		"use strict";

		return jQuery.extend({}, ControlLevelCommand, {

			/**
			 * @see ControlLevelCommand.execute
			 */
			execute: function () {
				return this.context.service.ui5wysiwygeditor.cut();
			}

		});
	}
);
