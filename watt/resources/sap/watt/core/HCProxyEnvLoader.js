define(function() {
	"use strict";
	return function(mEnv, oCallback) {
		var sHost = window.location.hostname;
		var aParts = sHost.split(".");
		var sServer = aParts[0];
		aParts.shift();
		var sDispatcher = aParts.join(".");
		aParts.shift();
		var sAccount = sServer.split("-")[1];
		var sLandscape = aParts.join(".");
		var sHelpServer = window.location.protocol + "//" + "help." + sLandscape;
		sHelpServer = sHelpServer.replace("hanatrial", "hana");
		
		for (var key in mEnv){
			var value = mEnv[key];
			if (typeof value === "string"){
				mEnv[key] = value.replace("{{account}}",sAccount)
    				            .replace("{{landscape}}",sLandscape)
        				        .replace("{{dispatcher}}",sDispatcher)
				                .replace("{{helpServer}}",sHelpServer);
			}
		}
		if (mEnv.internal === undefined){
			mEnv.internal = !!(sLandscape === "neo.ondemand.com") || !!(sLandscape === "staging.hanavlab.ondemand.com");
		}
		
		if (mEnv.orion_preview.indexOf(window.location.host) >= 0 && mEnv.orion_preview_wattonwatt) {
			mEnv.orion_preview = mEnv.orion_preview_wattonwatt;
		}

		oCallback(mEnv);
	};
});