define(
	[
		"../utils/W5gUtils",
		"../utils/ControlMetadata",
		"./ControlLevelCommand"
	],
	function (W5gUtils, ControlMetadata, ControlLevelCommand) {
		"use strict";
		return jQuery.extend({}, ControlLevelCommand, {

			/**
			 * @param {object=} oEvt keyboard event object (optional as it can come from context menu)
			 *
			 * @see W5gCommand.execute
			 */
			execute: function (oEvt) {
				var oElem = oEvt && oEvt.srcElement;
				while (oElem) {
					if (oElem.getAttribute("id") === "sap-ui-static") { //dialog
						return false;
					}
					oElem = oElem.parentElement;
				}
				return this.context.service.ui5wysiwygeditor.deleteUI5ControlWithValidations();
			},

			/**
			 * Command is enabled if the control is marked as removable in design time metadata
			 *
			 * @return {Q<boolean>}
			 *
			 * @override ControlLevelCommand.isEnabled
			 */
			isEnabled: function () {
				var that = this;
				return ControlLevelCommand.isEnabled.apply(this).then(function (b) {
					return b &&
						that.context.service.ui5wysiwygeditor.getSelection().then(function (oSelection) {
							var oDesignTimeData = ControlMetadata.getDesignTimeData(((oSelection && oSelection[0]) || {}).control);
							return !!(oDesignTimeData && oDesignTimeData.removable);
						});
				});
			}
		});
	}
);
