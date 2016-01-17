define([], function() {
	
	"use strict";

	function _getView() {
		return this.context.service.tipsandtricksviewsfactory.buildSimpleTipView(
			"sap.watt.ideplatform.aceeditor.SimpleTipView.AutoSave",
			"sap.watt.ideplatform.aceeditor/img/AutoSave.gif",
			this.context.i18n.getText("auto_save_tip_title"),
			this.context.i18n.getText("auto_save_tip_text")
		);
	}

	return {
		getView: _getView
	};
});