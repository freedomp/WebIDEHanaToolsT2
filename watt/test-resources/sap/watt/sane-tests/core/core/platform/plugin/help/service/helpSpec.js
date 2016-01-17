define(["STF"], function(STF) {
	"use strict";

	var suiteName = "helpTest";
	
	describe("Help test", function() {
		var sUrl = "http://help.sap.com";
		var getService = STF.getServicePartial(suiteName);
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/help/config.json"
			}).then(function(){
				var mConsumer = {
						"name": "helpTestConsumer",

						"requires": {
							"services": [
								"help"
							]
						},
						"configures": {
							"services": {
								"help:url": sUrl
							}
						}
					};
				return STF.register(suiteName, mConsumer);
			});
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("Help", function(){
			it("Get help url", function(){
				getService("help").getHelpUrl().then(function(sHelpUrl){
					assert.equal(sUrl,sHelpUrl);
				});
				
			});
		});
	});
});