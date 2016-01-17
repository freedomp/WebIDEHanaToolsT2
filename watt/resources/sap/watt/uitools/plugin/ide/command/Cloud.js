define(function() {
	"use strict";
	return {

		execute : function(vValue, oWindow) {
			var oWin = oWindow ? oWindow : window.open("", "Cloud");
			oWin.location.href = "http://marketplace.saphana.com/p/3334";
			this.context.service.usagemonitoring.report("IDE", "Commands", this.context.self._sName).done();
		}
	};
});