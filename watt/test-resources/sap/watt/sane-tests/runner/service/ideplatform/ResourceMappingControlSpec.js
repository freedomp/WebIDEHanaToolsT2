define(["sinon", 'STF'], function(sinon, STF) {

	var sandbox;
	var suiteName = "Resource Mapping Composite Control test";

	describe("test Resource Mapping Composite Control", function() {
		var _oImpl;
		var oResourceMappingControlService;
		var oResourceMappingHandlerService;
		var MockFileDocument;
		var MockFolderDocument;

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
			}).then(function(webIdeWindowObj) {
				var serviceGetter = STF.getServicePartial(suiteName);
				oResourceMappingControlService = serviceGetter("runconfig.resourcemapping");
				oResourceMappingHandlerService = serviceGetter("resourcemappinghandler");
				return STF.getServicePrivateImpl(oResourceMappingControlService).then(function(oImpl) {
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
			var oFolder = new MockFolderDocument([], "/A/B");
			return oResourceMappingControlService.getControl(oFolder).then(function(oRMCompositeControl) {
				var oController = oRMCompositeControl.getOController();
				return oController.getDocument().then(function(oDoc) {
					expect(oDoc).to.deep.equal(oFolder);
				});
			});
		});

		it("tests Controller method - setServiceData", function() {
			var oFolder = new MockFileDocument("/dev/null", "js", "aaaaa", "proj");
			return oResourceMappingControlService.getControl(oFolder).then(function(oRMCompositeControl) {
				var oController = oRMCompositeControl.getOController();
				var newFolder = new MockFileDocument("/dev/null", "js", "bbbbb", "proj");
				return oController.setServiceData(newFolder).then(function() {
					return oController.getDocument().then(function(oDoc) {
						expect(oDoc).to.deep.equal(newFolder);
					});
				});
			});
		});

	});
});