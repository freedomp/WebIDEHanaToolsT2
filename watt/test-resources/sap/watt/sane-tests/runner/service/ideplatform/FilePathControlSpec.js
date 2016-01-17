define(["sap/watt/lib/lodash/lodash", "sinon", 'STF'], function(_, sinon, STF) {

	var sandbox;
	var suiteName = "service runconfig.filepath";
	var _oImpl;
	var oFilePathControlService;
	var oFilePathHandlerService;
	var MockFileDocument;
	var MockFolderDocument;

	describe("test FilePath control", function() {

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
			}).
			then(function(webIdeWindowObj) {
				var serviceGetter = STF.getServicePartial(suiteName);
				oFilePathControlService = serviceGetter("runconfig.filepath");
				oFilePathHandlerService = serviceGetter("filepathhandler");
				return STF.getServicePrivateImpl(oFilePathControlService).then(function(oImpl) {
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

		afterEach(function() {
			sandbox.restore();
		});

		it("tests getControl method", function() {
			var oFolder = new MockFolderDocument([], "/A/B");
			var aFiles = ["a.js", "b.html"];
			var aValidation = [{
				"isRegex": false,
				"rule": ".html"
			}];
			return oFilePathControlService.getControl(oFolder, aFiles, aValidation).then(function(oControl) {
				expect(oControl.getControlData()).to.deep.equal(aFiles);
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});
});