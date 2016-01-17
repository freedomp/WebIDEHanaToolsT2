define(function() {
	"use strict";
	return {

		execute : function(vValue, oWindow) {
			var helpService = this.context.service.help;
			var oWin = oWindow ? oWindow : window.open("", "ShortcutHelp");
			this.context.service.usagemonitoring.report("IDE", "Commands", this.context.self._sName).done();
			helpService.getHelpUrl().then(function(sUrl) {
				if (sap.watt.getEnv("server_type")==="local_hcproxy" && !sap.watt.getEnv("internal")){
					oWin.location.href = sUrl + "#5.3 Keyboard Shortcuts";
				}else{
					oWin.location.href = sUrl + "?e8b492c0264d4eaf80b344153535a262.html";
				}
			});
		}
	};
});