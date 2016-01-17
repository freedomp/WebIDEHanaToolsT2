define(
	[
		"sap/watt/common/plugin/platform/service/ui/AbstractPart",
		"../utils/W5gUtils"
	],
	function (AbstractPart, W5gUtils) {
		"use strict";

		var W5GEmptyOutline = AbstractPart.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.service.W5GEmptyOutline", {

			_oView: null,

			init: function () {
				this._oView = sap.ui.xmlview({
					viewContent: '<core:View xmlns="sap.ui.commons" xmlns:core="sap.ui.core" xmlns:commons="sap.ui.commons"><TextView text="{i18n>w5g_outline_empty_pane_message}"/></core:View>'
				}).addStyleClass("wysiwygEmptyOutline");
				W5gUtils.applyBundleTo([this._oView]);
			},

			getContent: function () {
				return this._oView;
			},

			/** Check if outline service is responsible and can work with current selection event
			 */
			canHandle: function (oEvent) {
				return oEvent.params.owner.instanceOf("sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.WYSIWYGEditor");
			},

			/** reacts on selection change
			 */
			onSelectionChanged: function (oEvent) {
				if (this.canHandle(oEvent)) {
					return this.setVisible(true);
				}
			}

		});

		return W5GEmptyOutline;
	}
);