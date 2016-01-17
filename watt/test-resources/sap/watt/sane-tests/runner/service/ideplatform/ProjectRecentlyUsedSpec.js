define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "projectRecently";

	describe("Project Recently Used", function() {
		var docProvider;
		var oPru;
		var oRun;
		var oCommand;
		var aSelectedDocs;
		var oConfigurationhelper;
		var aConfigurations1 = [{
			filePath : "",
			_metadata: {
				id: 101,
				displayName: "displayName1"
			}
		}, {
			filePath : "",
			_metadata: {
				id: 102,
				displayName: "displayName2"
			}
		}, {
			filePath : "",
			_metadata: {
				id: 103,
				displayName: "displayName3"
			}
		}, {
			filePath : "",
			_metadata: {
				id: 104,
				displayName: "displayName4"
			}
		}, {
			filePath : "",
			_metadata: {
				id: 105,
				displayName: "displayName5"
			}
		}, {
			filePath : "",
			_metadata: {
				id: 106,
				displayName: "displayName6"
			}
		}];

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
			});
			return loadWebIdePromise.then(function() {
				sandbox = sinon.sandbox.create();
				oPru = STF.getService(suiteName, "projectrecentlyusedprovider");
				oRun = STF.getService(suiteName, "run");
				docProvider = STF.getService(suiteName, "filesystem.documentProvider");
				oCommand = STF.getService(suiteName, "command");
				aSelectedDocs = STF.getService(suiteName, "selection");
				oConfigurationhelper = STF.getService(suiteName, "configurationhelper");

			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test getItems method  positive flow - 6 configuratins exist",
			function() {
				sandbox.stub(aSelectedDocs, "getSelection").returns(Q([{document: {getProject: function() {return Q();}}}]));

				sandbox.stub(oConfigurationhelper, "getAllPersistedConfigurations").returns(Q(aConfigurations1));
				sandbox.stub(docProvider, "getDocument").returns(Q());
				
				return oPru.getItems().then(function(aItems) {
					expect(aItems.length).to.equal(6);
					expect(aItems[0].getId()).to.equal(101);
					expect(aItems[0].getLabel()).to.equal("displayName1");
					expect(aItems[2].getId()).to.equal(103);
					expect(aItems[2].getLabel()).to.equal("displayName3");
					expect(aItems[5].getId()).to.equal("moreProjectRunner");
					expect(aItems[5].getLabel()).to.equal("More ...");
				});
			});

		it("Test getItems method  negative flow - no configuratins exist",
			function() {
				sandbox.stub(aSelectedDocs, "getSelection").returns(Q([{document: {getProject: function() {return Q();}}}]));

				sandbox.stub(docProvider, "getDocument").returns(Q());

				var aConfigurations2 = [];

				sandbox.stub(oConfigurationhelper, "getAllPersistedConfigurations").returns(Q(aConfigurations2));

				return oPru.getItems().then(function(aItems) {
					expect(aItems.length).to.equal(0);
				});
			});

		it("Test getItems method  negative flow - more than one project was selected",
			function() {
				sandbox.stub(aSelectedDocs, "getSelection").returns(Q(["aaa", "bbb"]));

				sandbox.stub(oConfigurationhelper, "getAllPersistedConfigurations").returns(Q(aConfigurations1));

				return oPru.getItems().then(function(aItems) {
					expect(aItems.length).to.equal(0);
				});
			});
	});
});