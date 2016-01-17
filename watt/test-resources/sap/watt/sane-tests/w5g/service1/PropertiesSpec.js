define(['STF'], function (STF) {
	"use strict";
	var oW5gPropertiesService, suiteName = "Properties Service", getService = STF.getServicePartial(suiteName);

	describe(suiteName, function () {
		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json",
				html: "w5g/service1/w5geditor.html"
			}).then(function () {
				oW5gPropertiesService = getService('w5gproperties');
				var oSelectionService = getService('selection');
				oSelectionService.setSelectionOwner(getService('ui5wysiwygeditor'));
			});
		});
		after(function () {
			STF.shutdownWebIde(suiteName);
		});
		it("Test UI Content creation", function () {
			return expect(oW5gPropertiesService.getContent()).to.eventually.be.ok;
		});
		it("Test that the W5GProperties service is a selection provider", function () {
			assert.ok(oW5gPropertiesService.instanceOf("sap.watt.common.service.selection.Provider"), "W5GProperties must implement the sap.watt.common.service.selection.Provider interface");
		});
	});
});
