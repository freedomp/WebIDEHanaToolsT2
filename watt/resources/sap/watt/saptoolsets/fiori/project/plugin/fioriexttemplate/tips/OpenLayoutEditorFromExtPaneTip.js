define([], function() {
	
	"use strict";

	function _getView() {
		return this.context.service.tipsandtricksviewsfactory.buildSimpleTipView(
			"sap.watt.saptoolsets.fiori.project.fioriexttemplate.SimpleTipView.OpenLayoutEditorFromExtPane",
			"sap.watt.saptoolsets.fiori.project.fioriexttemplate/image/OpenLayoutEditorFromExtPane.gif",
			this.context.i18n.getText("open_layout_editor_from_ext_pane_tip_title"),
			this.context.i18n.getText("open_layout_editor_from_ext_pane_tip_text")
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