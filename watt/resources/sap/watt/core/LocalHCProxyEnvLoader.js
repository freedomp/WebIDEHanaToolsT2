define(function() {
	"use strict";
	return function(mEnv, oCallback) {
		var sHost = window.location.host;
		var sHelpServer = window.location.protocol + "//" + sHost + "/webide/help";
		for (var key in mEnv){
			var value = mEnv[key];
			if (typeof value === "string"){
				mEnv[key] = value.replace("{{helpServer}}",sHelpServer);
			}
		}
		oCallback(mEnv);
	};
});