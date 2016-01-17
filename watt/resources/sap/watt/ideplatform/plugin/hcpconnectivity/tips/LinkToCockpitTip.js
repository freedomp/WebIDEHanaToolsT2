define([], function() {
	
	"use strict";

	function _getView() {
		return this.context.service.tipsandtricksviewsfactory.buildSimpleTipView(
			"sap.watt.ideplatform.hcpconnectivity.SimpleTipView.LinkToCockpit",
			"sap.watt.ideplatform.hcpconnectivity/img/LinkToCockpit.gif",
			this.context.i18n.getText("link_to_cockpit_tip_title"),
			this.context.i18n.getText("link_to_cockpit_tip_text")
		);
	}

	function _isAvailable() {
		//The link to cockpit is irrelevant in local installation
		if (sap.watt.getEnv("server_type") === "local_hcproxy") {
			return false;
		} else {
			return true;
		}
	}

	return {
		getView: _getView,
		isAvailable: _isAvailable
	};
});