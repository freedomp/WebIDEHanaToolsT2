define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "docWindowsUtil";

	describe("Document Windows Util", function() {
		var oDocumentWindowsUtil;
		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
			});
			return loadWebIdePromise.then(function() {
				return STF.require(suiteName, ["sap/watt/ideplatform/plugin/run/util/DocumentWindowsUtil"]).spread(function(documentWindowsUtil) {
					sandbox = sinon.sandbox.create();
					oDocumentWindowsUtil = documentWindowsUtil;
				});
			});
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("open, get and close a window - positive",
			function() {
				var sWindowId = "sDocumentWindowsUtil_WindowId";

				var oWindow = oDocumentWindowsUtil.getWindow(sWindowId);
				expect(oWindow).to.equal(undefined);

				var sTmpWindowId = oDocumentWindowsUtil.openWindow();
				expect(sTmpWindowId.indexOf("tmpWin_")).to.equal(0);

				var sConfigWindowId = "config_12345";
				oDocumentWindowsUtil.renameWindow(sTmpWindowId, sConfigWindowId);
				oWindow = oDocumentWindowsUtil.getWindow(sConfigWindowId);
				expect(oWindow.name).to.equal(sConfigWindowId);

				oDocumentWindowsUtil.closeWindow(sConfigWindowId);
				oWindow = oDocumentWindowsUtil.getWindow(sConfigWindowId);
				expect(oWindow).to.equal(undefined);

			});

		it("open, get and close a window - negative",
			function() {
				var oWindow = oDocumentWindowsUtil.getWindow(123);
				expect(oWindow).to.equal(undefined);

				oDocumentWindowsUtil.closeWindow({});
				expect(true).to.equal(true);
			});
	});
});