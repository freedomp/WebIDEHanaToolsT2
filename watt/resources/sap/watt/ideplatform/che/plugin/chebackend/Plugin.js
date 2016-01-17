define(function() {
	"use strict";
	return {

		onAfterCoreStarted : function(oEvent) {
			this._oSystemService = this.context.service.system;
			var oParameters = jQuery.sap.getUriParameters();
			var sUsername = oParameters.get("username");
			var sPassword = oParameters.get("password");
			// Authentication is only evaluated/used if backend requires login (only when running locally)
			return this._oSystemService.login(sUsername, sPassword).then(function(oResult) {
				window.console && window.console.log("CheBackendPlugin: initialzed!!");
			});
		}
	};
});
