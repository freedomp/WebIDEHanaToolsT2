define(["STF"], function(STF) {
	"use strict";

	var oClipboardService;
	var _oSourceObject;
	var suiteName = "clipboard_test";
	var iFrameWindow = null;

	describe("Clipboard test", function() {
		var getService = STF.getServicePartial(suiteName);
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/clipboard/config.json"
			}).
				then(function(webIdeWindowObj) {
					var mConsumer = {
						"name": "clipboardTestConsumer",

						"requires": {
							"services": [
								"clipboard",
								"clipboard.filedialog",
								"clipboard.filedialog.rename"
							]
						}
					};

					iFrameWindow = webIdeWindowObj;
					oClipboardService = getService("clipboard");

					_oSourceObject = {
						name : "ClipboardQUnitTest"
					};
					return STF.register(suiteName, mConsumer);
				});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("Clipboard", function(){
			it("Add entity and check if equal", function(){
				return oClipboardService.addEntity("TEST Entry").then(function() {
					return oClipboardService.getEntity().then(function (oEntity) {

						assert.equal("TEST Entry", oEntity);
						return oClipboardService.getSource().then(function (oSource) {
							assert.equal(undefined, oSource);
						});
					});
				});
			});

			it("Try to add an null entity that shall cause an error", function () {
				return oClipboardService.addEntity(undefined)
					.then(function () {
						assert.fail(true, false, 'Should not get here. addEntity should have thrown error');
					})
					.fail(function (oError) {
						expect(oError.message).to.equal("Error in Clipboard Service usage. Entity may neither be null nor undefined.");
					});
			});

			it("Add entity and source and check if equal", function() {
				return oClipboardService.addEntity("TEST Entry", _oSourceObject).then(function() {
					return oClipboardService.getEntity().then(function (oEntity) {
						assert.equal("TEST Entry", oEntity);
						return oClipboardService.getSource().then(function (oSource) {
							assert.equal(_oSourceObject, oSource);
						});
					});
				});
			});

			it("Add entity and source, getClipboardEntry and check if equal", function() {
				return oClipboardService.addEntity("TEST Entry", _oSourceObject).then(function() {
					return oClipboardService.getClipboardEntry().then(function (oClipboardEntry) {
						return oClipboardService.getEntity().then(function (oEntities) {
							assert.equal("TEST Entry", oClipboardEntry.entities);
							assert.equal(_oSourceObject, oClipboardEntry.source);
						});
					});
				});
			});
		});
	});
});
