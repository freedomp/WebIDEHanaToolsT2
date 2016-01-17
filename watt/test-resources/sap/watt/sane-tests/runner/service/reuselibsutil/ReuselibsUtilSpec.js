define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "reuselibsUtil";

	describe("ReuseLibs Utility", function() {
		var oLibraryDiscovery;
		var oReuseLibsUtil;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/reuselibsutil/config.json"
			});
			return loadWebIdePromise.then(function() {
				sandbox = sinon.sandbox.create();
				oLibraryDiscovery = STF.getService(suiteName, "libraryDiscovery");
				oReuseLibsUtil = STF.getService(suiteName, "reuseLibsUtil");
			});
		});
		

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test method getLibsFromHCPandWorkspace - positive flow, dont get libs from Workspace",
			function() {
				var oLibsFromHCP = {aa: "fromhcp"};
				var oLibsFromWorkspace = {bb: "fromworkspace"};

				sandbox.stub(oLibraryDiscovery, "getLibrariesFromHCP").returns(Q(oLibsFromHCP));
				sandbox.stub(oLibraryDiscovery, "getLibrariesFromWorkspace").returns(Q(oLibsFromWorkspace));

				return oReuseLibsUtil.getLibsFromHCPandWorkspace().then(function(oResult) {
					expect(oResult.hcp).to.deep.equal(oLibsFromHCP);
					expect(oResult.ws).to.deep.equal(undefined);
				});
			});
			
		it("Test method getLibsFromHCPandWorkspace - positive flow, get libs from hcp and from workspace",
			function() {
				var oLibsFromHCP = {aa: "fromhcp"};
				var oLibsFromWorkspace = {bb: "fromworkspace"};

				sandbox.stub(oLibraryDiscovery, "getLibrariesFromHCP").returns(Q(oLibsFromHCP));
				sandbox.stub(oLibraryDiscovery, "getLibrariesFromWorkspace").returns(Q(oLibsFromWorkspace));

				return oReuseLibsUtil.getLibsFromHCPandWorkspace(true).then(function(oResult) {
					expect(oResult.hcp).to.deep.equal(oLibsFromHCP);
					expect(oResult.ws).to.deep.equal(oLibsFromWorkspace);
				});
			});	
			
		it("Test method getLibsFromHCPandWorkspace - negative flow, libs from hcp empty",
			function() {
				var oLibsFromHCP;
				var oLibsFromWorkspace = {bb: "fromworkspace"};

				sandbox.stub(oLibraryDiscovery, "getLibrariesFromHCP").returns(Q(oLibsFromHCP));
				sandbox.stub(oLibraryDiscovery, "getLibrariesFromWorkspace").returns(Q(oLibsFromWorkspace));

				return oReuseLibsUtil.getLibsFromHCPandWorkspace(true).then(function(oResult) {
					expect(oResult.hcp).to.deep.equal(undefined);
					expect(oResult.ws).to.deep.equal(oLibsFromWorkspace);
				});
			});
		
		it("Test method getLibsFromHCPandWorkspace - negative flow, libs from workspace empty",
			function() {
				var oLibsFromHCP = [{aa: "fromhcp1"}, {aa: "fromhcp2"}];
				var oLibsFromWorkspace;

				sandbox.stub(oLibraryDiscovery, "getLibrariesFromHCP").returns(Q(oLibsFromHCP));
				sandbox.stub(oLibraryDiscovery, "getLibrariesFromWorkspace").returns(Q(oLibsFromWorkspace));

				return oReuseLibsUtil.getLibsFromHCPandWorkspace(true).then(function(oResult) {
					expect(oResult.hcp).to.deep.equal(oLibsFromHCP);
					expect(oResult.ws).to.deep.equal(undefined);
				});
			});	

	});
});