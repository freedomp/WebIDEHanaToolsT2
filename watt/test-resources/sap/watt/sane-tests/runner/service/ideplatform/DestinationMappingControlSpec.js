define(["sinon", 'STF'], function(sinon, STF) {

	var sandbox;
	var suiteName = "Destination Mapping Composite Control test";
	var oDestinationMappingControlService;
	var MockFolderDocument;

	describe("Test Destination Mapping Composite Control", function() {

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
				}).then(function() {
					var serviceGetter = STF.getServicePartial(suiteName);
					oDestinationMappingControlService = serviceGetter("runconfig.destinationmapping");
					return STF.getServicePrivateImpl(oDestinationMappingControlService).then(function() {
						return STF.require(suiteName, [
							"sane-tests/util/mockDocument"
						]);
					});
				}).spread(function(oMockDocument) {
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

		it("Tests getControl method", function() {
			var oFolder = new MockFolderDocument([], "/A/B");
			// Mockups
			var aExcpectedSourceDestinations = ["source01", "source02", "source03", "source04", "source05", "source06", "source07", "source08"];
			var aExcpectedTargetDestinations = ["destination01", "destination02", "destination03", "destination04", "destination05", "destination06"];
			// Test the creation of the rows and table controller, and validate that their controller holds the Destination and target lists. 
			// Only the Init of the controllers is currently being called
			// TODO: see how to unit test the handler methods that change the model 
			return oDestinationMappingControlService.getControl(oFolder, aExcpectedSourceDestinations, aExcpectedTargetDestinations).then(function(oDestinationMappingControl) {
				var oController = oDestinationMappingControl.getOController();
				return oController.getSourceDestinations().then(function(aSourceDestinations) {
					return oController.getTargetDestinations().then(function(aTargetDestinations) {
						expect(aSourceDestinations).to.deep.equal(aExcpectedSourceDestinations);
						expect(aTargetDestinations).to.deep.equal(aExcpectedTargetDestinations);
					});
				});
			});
		});
	});
});