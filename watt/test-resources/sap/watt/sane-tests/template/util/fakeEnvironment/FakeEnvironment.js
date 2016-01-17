define(["sinon"], function(sinon) {

	"use strict";

	return {

		fakeEnv: function(oTarget, oEnvParameters) {
			return sinon.stub(oTarget, "getEnv", function(sInput) {
				for (var sParam in oEnvParameters) {
					if (sInput === sParam) {
						return oEnvParameters[sParam];
					}
				}
			});
		}
	};
});