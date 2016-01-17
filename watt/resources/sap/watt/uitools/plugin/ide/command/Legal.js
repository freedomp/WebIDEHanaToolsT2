define(function() {
	"use strict";
	return {

		execute : function(vValue, oWindow) {
			var oWin = oWindow ? oWindow : window.open("", "Legal");
			//TODO for later: use language-dependent url depending on sap.watt.locale
			oWin.location.href = "http://global.sap.com/corporate-en/legal/impressum.epx";
			this.context.service.usagemonitoring.report("IDE", "Commands", this.context.self._sName).done();
		}
	};
});