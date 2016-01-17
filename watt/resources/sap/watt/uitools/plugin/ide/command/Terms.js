define(function() {
	"use strict";
	return {

		execute : function(vValue, oWindow) {
			var oWin = oWindow ? oWindow : window.open("", "Terms");
			//TODO for later: use language-dependent url depending on sap.watt.locale
			var sTermsUrl = "https://accounts.sap.com/ui/public/viewTextResource?scenario=SAP_HANA_Cloud_Developer_Edition&resourceType=RESOURCE_TERMS_OF_USE&locale=en_US&spDisplayName=SAP%20HANA%20Cloud%20Developer%20Edition";
			oWin.location.href = sTermsUrl;
			this.context.service.usagemonitoring.report("IDE", "Commands", this.context.self._sName).done();
		}
	};
});