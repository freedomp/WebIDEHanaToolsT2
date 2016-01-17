define(function() {
	"use strict";
	return {

		execute : function(vValue, oWindow) {
			var helpService = this.context.service.help;
			var oWin = oWindow ? oWindow : window.open("", "Help");
			helpService.getHelpUrl().then(function(sUrl) {
				oWin.location.href = sUrl;
			});
			this.context.service.usagemonitoring.report("IDE", "Commands", this.context.self._sName).done();
		}
	};
});