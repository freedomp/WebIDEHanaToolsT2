define(
	[
		"../utils/W5gUtils",
		"./ControlLevelCommand"
	],
	function (W5gUtils, ControlLevelCommand) {
		"use strict";

		return jQuery.extend({}, ControlLevelCommand, {
			
			/**
			 * @see ControlLevelCommand.execute
			 */
			execute: function () {
				return this.context.service.ui5wysiwygeditor.pasteSibling(1);
			},

			/**
			 * Command is enabled if "Copy" or "Cut" command was performed and there is a control to paste
			 *
			 * @return {Boolean}
			 *
			 * @override ControlLevelCommand.isEnabled
			 */
			isEnabled: function () {
				return W5gUtils.andBetweenTwoPromises(this.context.service.ui5wysiwygeditor.hasClipboard(),
					ControlLevelCommand.isEnabled.apply(this));
			}

		});
	}
);
