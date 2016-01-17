//  The SaneTestFramework should be imported via 'STF' path.
define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "projectmetadata_service_tests";

	var oProjectTypeService;
	var oAppMetadataService;
	var oprojectmetadataService;
	var MockFileDocument;
	var sandbox;

	describe("Project Dependencies Metadata service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config : "editor/monaco/ideplatform/plugin/projectmetadata/service/config.json"}).
			then(function(webIdeWindowObj) {
				oProjectTypeService = STF.getService(suiteName, "projectType");
				oAppMetadataService = STF.getService(suiteName, "appmetadata");
				oprojectmetadataService = STF.getService(suiteName, "projectmetadata");
				return STF.require(suiteName, [
					"sane-tests/util/mockDocument"
				]);
			}).spread(function(oMockDocument) {
				MockFileDocument = oMockDocument.MockFileDocument;
			});
		});

		beforeEach(function() {
			sandbox = sinon.sandbox.create();
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Fiori project type should return lib name and a version", function() {
			var aProjectTypes = [
									{"id": "sap.watt.uitools.ide.fiori"},
									{"id": "sap.watt.web.id"}
								];
			var aRequestedLibs = {"routes": [
												{
													"target": {
														"entryPath": "/resources",
														"name" : "myNewLib",
														"version": "3.3.3"
													},
													"path": "/resources"
												}
											]};
			var oDoc = new MockFileDocument("testProj/1.js", "js");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oAppMetadataService, "getNeoMetadata").returns(Q(aRequestedLibs));
			return oprojectmetadataService.getDependencies(oDoc).then(function(oResult) {
					expect(oResult[0].library).to.equal("myNewLib");
					expect(oResult[0].version).to.equal("3.3.3");
			});                         
		});
		
		it("Fiori project type should return lib name and a version for webapp.", function() {
			var aProjectTypes = [
									{"id": "sap.watt.uitools.ide.fiori"},
									{"id": "sap.watt.web.id"}
								];
			var aRequestedLibs = {"routes": [
												{
													"target": {
														"entryPath": "/resources",
														"name" : "myNewLib",
														"version": "3.3.3"
													},
													"path": "/resources"
												},
												{
													"target": {
														"entryPath": "/resources",
														"name" : "myNewWebappLib",
														"version": "3.3.1"
													},
													"path": "/webapp/resources"
												}
											]};
			var oDoc = new MockFileDocument("testProj/1.js", "js");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oAppMetadataService, "getNeoMetadata").returns(Q(aRequestedLibs));
			return oprojectmetadataService.getDependencies(oDoc).then(function(oResult) {
					expect(oResult[0].library).to.equal("myNewWebappLib");
					expect(oResult[0].version).to.equal("3.3.1");
			});                         
		});		

		it("Fiori project type should return lib name and a version for webapp with another order of routes", function() {
			var aProjectTypes = [
									{"id": "sap.watt.uitools.ide.fiori"},
									{"id": "sap.watt.web.id"}
								];
			var aRequestedLibs = {"routes": [
												{
													"target": {
														"entryPath": "/resources",
														"name" : "myNewWebappLib",
														"version": "3.3.1"
													},
													"path": "/webapp/resources"
												},
												{
													"target": {
														"entryPath": "/resources",
														"name" : "myNewLib",
														"version": "3.3.3"
													},
													"path": "/resources"
												}
												
											]};
			var oDoc = new MockFileDocument("testProj/1.js", "js");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oAppMetadataService, "getNeoMetadata").returns(Q(aRequestedLibs));
			return oprojectmetadataService.getDependencies(oDoc).then(function(oResult) {
					expect(oResult[0].library).to.equal("myNewWebappLib");
					expect(oResult[0].version).to.equal("3.3.1");
			});                         
		});	
		
		it("Fiori project type should return lib name and a version for only webapp ", function() {
			var aProjectTypes = [
									{"id": "sap.watt.uitools.ide.fiori"},
									{"id": "sap.watt.web.id"}
								];
			var aRequestedLibs = {"routes": [
												{
													"target": {
														"entryPath": "/resources",
														"name" : "myNewWebappLib",
														"version": "3.3.1"
													},
													"path": "/webapp/resources"
												}
											]};
			var oDoc = new MockFileDocument("testProj/1.js", "js");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oAppMetadataService, "getNeoMetadata").returns(Q(aRequestedLibs));
			return oprojectmetadataService.getDependencies(oDoc).then(function(oResult) {
					expect(oResult[0].library).to.equal("myNewWebappLib");
					expect(oResult[0].version).to.equal("3.3.1");
			});                         
		});			
		
		
		it("Invalid project type shouldn't return lib name and a version", function() {
			var aProjectTypes = [
									{"id": "sap.watt.uitools.ide.ddd"}
								];
			var aRequestedLibs = {"routes": [
												{
													"target": {
														"entryPath": "/resources",
														"name" : "myNewLib",
														"version": "3.3.3"
													},
													"path": "/resources"
												}
											]};
			var oDoc = new MockFileDocument("testProj/1.js", "js");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oAppMetadataService, "getNeoMetadata").returns(Q(aRequestedLibs));
			return oprojectmetadataService.getDependencies(oDoc).then(function(oResult) {
					expect(oResult).to.be.empty;
			});                         
			
		});
		
		it("If neo-app is missing should return default result (libname sapui5 and version null)", function() {
			var aProjectTypes = [
									{"id": "sap.watt.uitools.ide.fiori"}
								];
			var aRequestedLibs = {};
			var oDoc = new MockFileDocument("testProj/1.js", "js");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oAppMetadataService, "getNeoMetadata").returns(Q(aRequestedLibs));
			return oprojectmetadataService.getDependencies(oDoc).then(function(oResult) {
					expect(oResult[0].library).to.equal("sapui5");
					expect(oResult[0].version).to.equal(null);
			});                         
			
		});
		
		it("Invalid project type and no neo-app shouldn't return lib name and a version", function() {
			var aProjectTypes = [
									{"id": "sap.watt.uitools.ide.ddd"}
								];
			var aRequestedLibs = {};
			var oDoc = new MockFileDocument("testProj/1.js", "js");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oAppMetadataService, "getNeoMetadata").returns(Q(aRequestedLibs));
			return oprojectmetadataService.getDependencies(oDoc).then(function(oResult) {
					expect(oResult).to.be.empty;
			});                         
			
		});
		
		it("If routes is missing in appmetadata results, should return default result (libname sapui5 and version null) ", function() {
			var aProjectTypes = [
									{"id": "sap.watt.uitools.ide.fiori"},
									{"id": "sap.watt.web.id"}
								];
			var aRequestedLibs = {"routes": []};
			var oDoc = new MockFileDocument("testProj/1.js", "js");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oAppMetadataService, "getNeoMetadata").returns(Q(aRequestedLibs));
			return oprojectmetadataService.getDependencies(oDoc).then(function(oResult) {
					expect(oResult[0].library).to.equal("sapui5");
					expect(oResult[0].version).to.equal(null);
			});                         
		});
		
		it("If routes is null, should return default result (libname sapui5 and version null) ", function() {
			var aProjectTypes = [
									{"id": "sap.watt.uitools.ide.fiori"},
									{"id": "sap.watt.web.id"}
								];
			var aRequestedLibs = {"routes": null};
			var oDoc = new MockFileDocument("testProj/1.js", "js");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oAppMetadataService, "getNeoMetadata").returns(Q(aRequestedLibs));
			return oprojectmetadataService.getDependencies(oDoc).then(function(oResult) {
					expect(oResult[0].library).to.equal("sapui5");
					expect(oResult[0].version).to.equal(null);
			});                         
		});
		
		it("If routes is null, should return default result (libname sapui5 and version null) ", function() {
			var aProjectTypes = [
									{"id": "sap.watt.uitools.ide.fiori"},
									{"id": "sap.watt.web.id"}
								];
			var aRequestedLibs = {"routes": [
												{
													"target": {
														"name" : "myNewLib",
														"version": "3.3.3"
													},
													"path": "/resources"
												}
											]};
			var oDoc = new MockFileDocument("testProj/1.js", "js");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oAppMetadataService, "getNeoMetadata").returns(Q(aRequestedLibs));
			return oprojectmetadataService.getDependencies(oDoc).then(function(oResult) {
					expect(oResult[0].library).to.equal("sapui5");
					expect(oResult[0].version).to.equal(null);
			});                         
		});
		
		it("Mock provider test", function() {
			var aProjectTypes = [
									{"id": "sap.watt.my.new.project.type"}
								];
			var oDoc = new MockFileDocument("testProj/1.js", "js");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectTypes));
			return oprojectmetadataService.getDependencies(oDoc).then(function(oResult) {
					expect(oResult).to.deep.include.members([{ library: "mocklib", version: "5.5.5" }]);
					expect(oResult).to.deep.include.members([{ library: "anotherMocklib", version: "9.9.9" }]);
			});                         
		});
		
		it("Two different providers", function() {
			var aProjectTypes = [
									{"id": "sap.watt.uitools.ide.fiori"},
									{"id": "sap.watt.my.new.project.type"}
								];
			var aRequestedLibs = {"routes": [
												{
													"target": {
														"entryPath": "/resources",
														"name" : "myNewLib",
														"version": "3.3.3"
													},
													"path": "/resources"
												}
											]};
			var oDoc = new MockFileDocument("testProj/1.js", "js");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oAppMetadataService, "getNeoMetadata").returns(Q(aRequestedLibs));
			return oprojectmetadataService.getDependencies(oDoc).then(function(oResult) {
					expect(oResult).to.have.length(3);
					expect(oResult).to.deep.include.members([{ library: "mocklib", version: "5.5.5" }]);
					expect(oResult).to.deep.include.members([{ library: "myNewLib", version: "3.3.3" }]);
					expect(oResult).to.deep.include.members([{ library: "anotherMocklib", version: "9.9.9" }]);
			});                         
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});
});