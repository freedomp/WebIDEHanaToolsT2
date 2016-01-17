define(["sinon", 'STF'], function(sinon, STF) {

	var sandbox;
	var suiteName = "UI5 Versions Composite Control test";
	var _oImpl;
	var oUI5VersionsControlService;
	var oUI5VersionsHandlerService;
	var MockFileDocument;
	var MockFolderDocument;

	describe("test UI5 Versions Composite Control", function() {

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
				}).then(function(webIdeWindowObj) {
					var serviceGetter = STF.getServicePartial(suiteName);
					oUI5VersionsControlService = serviceGetter("runconfig.ui5versions");
					oUI5VersionsHandlerService = serviceGetter("ui5versionhandler");
					return STF.getServicePrivateImpl(oUI5VersionsControlService).then(function(oImpl) {
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
			// Mockups
			var aUi5VersionsList = [
				{
					"display" : "snapshot",
					"source" : "external",
					"value" : "snapshot"
				},
				{
					"display" : "1.34.0",
					"source" : "internal",
					"value" : "1.34.0"
				},
				{
					"display" : "1.32.7",
					"source" : "external",
					"value" : "1.32.7"
				},
				{
					"display" : "1.32.6",
					"source" : "external",
					"value" : "1.32.6"
				},
				{
					"display" : "1.32.5",
					"source" : "external",
					"value" : "1.32.5"
				},
				{
					"display" : "1.32.4",
					"source" : "external",
					"value" : "1.32.4"
				}
			];
			var sUI5CurrentVersion = "1.31.2";
			return oUI5VersionsControlService.getControl(oFolder, aUi5VersionsList, sUI5CurrentVersion).then(function(oUi5VersionCompositeControl) {
				expect(oUi5VersionCompositeControl.getDropDownBoxItems()).to.deep.equal(aUi5VersionsList);
				var oController = oUi5VersionCompositeControl.getOController();
				return oController.getUIVersions().then(function(aUIVersions) {
					expect(aUIVersions).to.deep.equal(aUi5VersionsList);
				});
			});
		});

	});
});