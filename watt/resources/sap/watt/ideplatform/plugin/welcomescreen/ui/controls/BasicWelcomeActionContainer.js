define(["./BasicWelcomeContainer"], function() {
	"use strict";

	sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeContainer.extend(
		"sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeActionContainer", {
			addButton: function(oButton) {
				this.addContent(oButton);
			},
			renderer: {}
		});
});