define([], function() {
	
	"use strict";

	function _getView() {
		return this.context.service.tipsandtricksviewsfactory.buildShortcutView(
			"sap.watt.ideplatform.aceeditor.ShortcutTipsView.MoveLinesUpDown",
			"sap.watt.ideplatform.aceeditor/img/MoveLinesUpDown.gif",
			this.context.i18n.getText("move_lines_up_down_tip_title"),
			["editor.movelinesup", "editor.movelinesdown"],//TODO handle this
			this.context.i18n.getText("move_lines_up_down_tip_text")
		);
	}

	return {
		getView: _getView
	};
});