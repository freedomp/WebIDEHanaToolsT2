define(["sinon", 'STF'], function(sinon, STF) {

	var sandbox;
	var suiteName = "Preview Composite Control test";

	describe("test Preview Composite Control", function() {
		var _oImpl;
		var oPreviewControlService;
		var MockFileDocument;
		var MockFolderDocument;

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
			}).then(function(webIdeWindowObj) {
				var serviceGetter = STF.getServicePartial(suiteName);
				oPreviewControlService = serviceGetter("runconfig.preview");
				
				return STF.getServicePrivateImpl(oPreviewControlService).then(function(oImpl) {
					_oImpl = oImpl;
					return STF.require(suiteName, [
						"sane-tests/util/mockDocument"
					]);
				});
			}).spread(function(oMockDocument) {
				MockFileDocument = oMockDocument.MockFileDocument;
				MockFolderDocument = oMockDocument.MockFolderDocument;
			});
		});

		beforeEach(function() {
			sandbox = sinon.sandbox.create();
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("tests getControl method", function() {
			return oPreviewControlService.getControl().then(function(oPreviewCompositeControl) {
				oPreviewCompositeControl.setControlTitle("abc");
				var sTitle = oPreviewCompositeControl.getControlTitle();
				expect(sTitle).to.equal("abc");
				oPreviewCompositeControl.setControlButtonPreviewText("withframe");
				var sframe = oPreviewCompositeControl.getControlButtonPreviewText();
				expect(sframe).to.equal("withframe");
				oPreviewCompositeControl.setControlButtonFrameText("Preview");
				var sPreview = oPreviewCompositeControl.getControlButtonFrameText();
				expect(sPreview).to.equal("Preview");
			});
		});

		

	});
});