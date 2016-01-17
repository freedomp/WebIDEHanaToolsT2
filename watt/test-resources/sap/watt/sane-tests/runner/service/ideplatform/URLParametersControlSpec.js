define(["sap/watt/lib/lodash/lodash", "sinon", 'STF'], function(_, sinon, STF) {

	var sandbox;
	var suiteName = "URL Paramerters Composite Control test";
	 var _oImpl;

	 var oURLParameterControlService;
	 var oURLParameterHandlerService;
	 var MockFileDocument;
	 var MockFolderDocument;

	describe("test URL Paramerters control", function() {
		
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
			}).
			then(function(webIdeWindowObj) {
				var serviceGetter = STF.getServicePartial(suiteName);
				oURLParameterControlService = serviceGetter("runconfig.urlparameters");
				oURLParameterHandlerService = serviceGetter("urlparametershandler");
				
				return STF.getServicePrivateImpl(oURLParameterControlService).then(function(oImpl) {
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
			return oURLParameterControlService.getControl().then(function(oURLParametersControl) {
				expect(oURLParametersControl._sHashInfo.getText()).to.deep.equal("");
			});
		});
		
		it("tests get/set methods", function() {
			return oURLParameterControlService.getControl().then(function(oURLParametersControl) {
					oURLParametersControl.setSHashInfo("haha");
					expect(oURLParametersControl.getSHashInfo()).to.deep.equal("haha");
					expect(oURLParametersControl._sHashLabel.getText()).to.deep.equal("");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});
});