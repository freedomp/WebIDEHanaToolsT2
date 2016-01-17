define([], function() {
	
	"use strict";

	function _getView() {
		return this.context.service.tipsandtricksviewsfactory.buildSimpleTipView(
			"sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.SimpleTipView.AddControlsFromOutline",
			"sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor/img/AddControlsFromOutline.gif",
			this.context.i18n.getText("add_control_from_outline_layout_editor_tip_title"),
			this.context.i18n.getText("add_control_from_outline_layout_editor_tip_text")
		);
	}

	function _isAvailable() {
		//The layout editor is available only in chrome therefore this tip is relevant only there
		return jQuery.browser.chrome;
	}

	return {
		getView: _getView,
		isAvailable: _isAvailable
	};
});