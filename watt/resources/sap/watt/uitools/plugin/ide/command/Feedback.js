define(function() {
	"use strict";
	return {

		execute : function(vValue, oWindow) {
			var oWin = oWindow ? oWindow : window.open("", "Feedback");
			if (sap.watt.getEnv("internal")) {
				// UI5 Jam Community for SAP-internal
				oWin.location.href = "https://jam4.sapjam.com/groups/about_page/7MFgdXHJVVv2BWC8g0Ubep";
			} else {
				// UI5 SCN
				oWin.location.href = "http://scn.sap.com/community/developer-center/front-end/content";
			}
			this.context.service.usagemonitoring.report("IDE", "Commands", this.context.self._sName).done();
		}
	};
});