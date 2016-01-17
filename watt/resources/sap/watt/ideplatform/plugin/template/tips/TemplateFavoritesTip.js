define([], function() {

	"use strict";

	function _getView() {
		return this.context.service.tipsandtricksviewsfactory.buildSimpleTipView(
			"sap.watt.ideplatform.template.SimpleTipView.TemplateFavorites",
			"sap.watt.ideplatform.template/img/TemplateFavorites.gif",
			this.context.i18n.getText("favorite_templates_tip_title"),
			this.context.i18n.getText("favorite_templates_tip_text")
		);
	}

	return {
		getView: _getView
	};
});