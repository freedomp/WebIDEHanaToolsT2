define([], function() {
	
	"use strict";

	function _getView() {
		return this.context.service.tipsandtricksviewsfactory.buildShortcutView(
			"sap.watt.platform.resourceindex.ShortcutTipsView.OpenResource",
			"sap.watt.platform.resourceindex/img/OpenResource.gif",
			this.context.i18n.getText("open_resource_tip_title"),
			["resourceindex.resourcelist"],
			this.context.i18n.getText("open_resource_tip_text")
		);
	}

	return {
		getView: _getView
	};
});