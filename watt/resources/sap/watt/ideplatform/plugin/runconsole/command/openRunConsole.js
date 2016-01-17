define(function() {
	"use strict";
	return {
		execute: function() {
			var oRunConsole = this.context.service.runconsole;
			return oRunConsole.isVisible().then(function(bVisible) {
				return oRunConsole.setVisible(!bVisible);
			});
		},

		isAvailable: function() {
			var sServerType = sap.watt.getEnv("server_type");
			// Orion backend
			if (sServerType !== "xs2") {
				return false;
			} else {
				// Che backend
				return true;
			}
		},

		isEnabled: function() {
			var oPerspectiveService = this.context.service.perspective;
			return oPerspectiveService.getCurrentPerspective().then(function(sPerspectiveName) {
				return sPerspectiveName === 'development';
			});
		}
	};
});