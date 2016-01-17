define(["sap/watt/platform/hcp/plugin/hcplibrarymetadataprovider/service/HcpLibraryMetadataProvider", "sinon"],
function (HCPLibraryMetadataProvider, sinon) {
	
	function configureService() {
		var mConfig = { 
				"libraries": [{
					"name" : "sapui5",
					"internalPathPrefix" : "/sapui5preview",
					"nonInternalPathPrefix" : "/sapui5versions",
					"snapshotPathPrefix" : "/sapui5nightly",
					"versionsFileName" : "neo-app.json",
					"minVersion" : "1.30.0",
				    "packages" : ["sap.ui.core"]
				}]
			};
			HCPLibraryMetadataProvider.configure(mConfig);
	}
	
	var mockServer;	
	
	// version file urls
	var sInternalVersionsUrl = "/sapui5preview/neo-app.json";
	var sExternalVersionsUrl = "/sapui5versions/neo-app.json";
	
	// internal packages metadata urls
	var sInternalJsMetadataUrl = "/sapui5preview/1.30.6/test-resources/sap/ui/core/designtime/codeassistance/Library.jsmeta.json";
	var sInternalJsTemplatesUrl = "/sapui5preview/1.30.6/test-resources/sap/ui/core/designtime/codeassistance/Library.jstemplates.json";
	var sInternalXmlMetadataUrl = "/sapui5preview/1.30.6/test-resources/sap/ui/core/designtime/codeassistance/Library.xmlmeta.json";
	var sInternalXmlTemplatesUrl = "/sapui5preview/1.30.6/test-resources/sap/ui/core/designtime/codeassistance/Library.xmltemplates.json";
	
	// external packages metadata urls
	var sExternalJsMetadataUrl = "/sapui5versions/1.30.6/test-resources/sap/ui/core/designtime/codeassistance/Library.jsmeta.json";
	var sExternalJsTemplatesUrl = "/sapui5versions/1.30.6/test-resources/sap/ui/core/designtime/codeassistance/Library.jstemplates.json";
	var sExternalXmlMetadataUrl = "/sapui5versions/1.30.6/test-resources/sap/ui/core/designtime/codeassistance/Library.xmlmeta.json";
	var sExternalXmlTemplatesUrl = "/sapui5versions/1.30.6/test-resources/sap/ui/core/designtime/codeassistance/Library.xmltemplates.json";
	
	// snapshot packages metadata urls
	var sSnapshotJsMetadataUrl = "/sapui5nightly/test-resources/sap/ui/core/designtime/codeassistance/Library.jsmeta.json";
	var sSnapshotJsTemplatesUrl = "/sapui5nightly/test-resources/sap/ui/core/designtime/codeassistance/Library.jstemplates.json";
	var sSnapshotXmlMetadataUrl = "/sapui5nightly/test-resources/sap/ui/core/designtime/codeassistance/Library.xmlmeta.json";
	var sSnapshotXmlTemplatesUrl = "/sapui5nightly/test-resources/sap/ui/core/designtime/codeassistance/Library.xmltemplates.json";

	var oInternalVersions;
	var oExternalVersions;
	
	describe("HCPLibraryMetadataProvider tests", function () {
		var oldSap;
		
		function assertMetadata(oMetadata, sMetadataContent, sTemplatesContent) {
			expect(oMetadata).to.be.an("object");
			expect(oMetadata).to.have.property("metadata");
			expect(oMetadata.metadata).to.have.property("files");
			expect(oMetadata.metadata.files).to.have.property("sap.ui.core.json");
			expect(oMetadata.metadata.files["sap.ui.core.json"].asText()).to.equal(sMetadataContent);
			expect(oMetadata).to.have.property("templates");
			expect(oMetadata.templates).to.have.property("files");
			expect(oMetadata.templates.files).to.have.property("sap.ui.core.json");
			expect(oMetadata.templates.files["sap.ui.core.json"].asText()).to.equal(sTemplatesContent);
		}
		
		before(function() {
			oldSap = window.sap;
			// Load versions files
			var aPromises = [];
			aPromises.push(Q(jQuery.get(require.toUrl("editor/monaco/platform/hcp/plugin/hcplibrarymetadataprovider/unit/testFiles/internalVersions.json"))));
			aPromises.push(Q(jQuery.get(require.toUrl("editor/monaco/platform/hcp/plugin/hcplibrarymetadataprovider/unit/testFiles/externalVersions.json"))));
			return Q.spread(aPromises, function(_oInternalVersions, _oExternalVersions) {
				oInternalVersions = _oInternalVersions;
				oExternalVersions = _oExternalVersions;
			});
		});

		after(function() {
			window.sap = oldSap;
		});
		
		beforeEach(function() {
			mockServer = sinon.fakeServer.create();	
			mockServer.respondImmediately = true;
		});
		
		afterEach(function() {
			mockServer.restore();	
		});
		
		describe("Internal landscape", function () {

			before(function() {
				window.sap = {
					watt: {
						getEnv: function() {
							return true;
						}
					}
				};
				configureService();
			});

			it("Get internal versions of sapui5 from HCP", function () {
				mockServer.respondWith("GET", sInternalVersionsUrl, [200, { "Content-Type": "application/json" }, JSON.stringify(oInternalVersions)]);
				return HCPLibraryMetadataProvider.getVersions("sapui5").then(function(aVersions) {
					expect(aVersions).to.be.an("array").and.to.have.length(12);
					expect(aVersions[0]).to.equal("1.32.4");
					expect(aVersions[11]).to.equal("1.30.0");
				});
			});
			
			it("When HCP is down we should get an empty versions array", function () {
				mockServer.respondWith("GET", sInternalVersionsUrl, [404, {}, ""]);
				return HCPLibraryMetadataProvider.getVersions("sapui5").then(function(aVersions) {
					expect(aVersions).to.be.an("array").and.to.have.length(0);
				});
			});
			
			it("Request metadata when HCP is down - we should get null", function () {
				mockServer.respondWith("GET", sInternalJsMetadataUrl, [404, {}, ""]);
				mockServer.respondWith("GET", sInternalJsTemplatesUrl, [404, {}, ""]);
				return HCPLibraryMetadataProvider.getMetadata("sapui5", "js", "1.30.6").then(function(oMetadata) {
					expect(oMetadata).to.equal(null);
				});
			});
			
			it("Request metadata when one file is not available - we should get the other one", function () {
				mockServer.respondWith("GET", sInternalJsMetadataUrl, [200, {}, "internalJsMetadata"]);
				mockServer.respondWith("GET", sInternalJsTemplatesUrl, [404, {}, ""]);
				return HCPLibraryMetadataProvider.getMetadata("sapui5", "js", "1.30.6").then(function(oMetadata) {
					expect(oMetadata).to.be.an("object");
					expect(oMetadata).to.have.property("metadata");
					expect(oMetadata.metadata).to.have.property("files");
					expect(oMetadata.metadata.files).to.have.property("sap.ui.core.json");
					expect(oMetadata).to.not.have.property("templates");
				});
			});
			
			
			it("Request metadata of sapui5 1.30.6 of type js", function () {
				mockServer.respondWith("GET", sInternalJsMetadataUrl, [200, {}, "internalJsMetadata"]);
				mockServer.respondWith("GET", sInternalJsTemplatesUrl, [200, {}, "internalJsTemplates"]);
				return HCPLibraryMetadataProvider.getMetadata("sapui5", "js", "1.30.6").then(function(oMetadata) {
					assertMetadata(oMetadata, "internalJsMetadata", "internalJsTemplates");
				});
			});
		
			it("Request metadata of sapui5 1.30.6 of type xml", function () {
				mockServer.respondWith("GET", sInternalXmlMetadataUrl, [200, {}, "internalXmlMetadata"]);
				mockServer.respondWith("GET", sInternalXmlTemplatesUrl, [200, {}, "internalXmlTemplates"]);
				return HCPLibraryMetadataProvider.getMetadata("sapui5", "xml", "1.30.6").then(function(oMetadata) {
					assertMetadata(oMetadata, "internalXmlMetadata", "internalXmlTemplates");
				});
			});
			
			it("Request snapshot metadata of type js", function () {
				mockServer.respondWith("GET", sSnapshotJsMetadataUrl, [200, {}, "snapshotJsMetadata"]);
				mockServer.respondWith("GET", sSnapshotJsTemplatesUrl, [200, {}, "snapshotJsTemplates"]);
				return HCPLibraryMetadataProvider.getMetadata("sapui5", "js", "snapshot").then(function(oMetadata) {
					assertMetadata(oMetadata, "snapshotJsMetadata", "snapshotJsTemplates");
				});
			});
			
			it("Request snapshot metadata of type xml", function () {
				mockServer.respondWith("GET", sSnapshotXmlMetadataUrl, [200, {}, "snapshotXmlMetadata"]);
				mockServer.respondWith("GET", sSnapshotXmlTemplatesUrl, [200, {}, "snapshotXmlTemplates"]);
				return HCPLibraryMetadataProvider.getMetadata("sapui5", "xml", "snapshot").then(function(oMetadata) {
					assertMetadata(oMetadata, "snapshotXmlMetadata", "snapshotXmlTemplates");
				});
			});
			
			
		});
		
		describe("External landscape", function () {
			
			before(function() {
				window.sap = {
					watt: {
						getEnv: function() {
							return false;
						}
					}
				};
				configureService();
			});

			it("Get external versions of sapui5 from HCP", function () {
				mockServer.respondWith("GET", sExternalVersionsUrl, [200, { "Content-Type": "application/json" }, JSON.stringify(oExternalVersions)]);
				return HCPLibraryMetadataProvider.getVersions("sapui5").then(function(aVersions) {
					expect(aVersions).to.be.an("array").and.to.have.length(6);
					expect(aVersions[0]).to.equal("1.32.4");
					expect(aVersions[5]).to.equal("1.30.5");
				});
			});
			
			it("Request metadata of sapui5 1.30.6 of type js", function () {
				mockServer.respondWith("GET", sExternalJsMetadataUrl, [200, {}, "externalJsMetadata"]);
				mockServer.respondWith("GET", sExternalJsTemplatesUrl, [200, {}, "externalJsTemplates"]);
				return HCPLibraryMetadataProvider.getMetadata("sapui5", "js", "1.30.6").then(function(oMetadata) {
					assertMetadata(oMetadata, "externalJsMetadata", "externalJsTemplates");
				});
			});
		
			it("Request metadata of sapui5 1.30.6 of type xml", function () {
				mockServer.respondWith("GET", sExternalXmlMetadataUrl, [200, {}, "externalXmlMetadata"]);
				mockServer.respondWith("GET", sExternalXmlTemplatesUrl, [200, {}, "externalXmlTemplates"]);
				return HCPLibraryMetadataProvider.getMetadata("sapui5", "xml", "1.30.6").then(function(oMetadata) {
					assertMetadata(oMetadata, "externalXmlMetadata", "externalXmlTemplates");
				});
			});
			
			it("Request snapshot metadata - should get null because snapshot is not supported in external landscape", function () {
				mockServer.respondWith("GET", sSnapshotJsMetadataUrl, [200, {}, "snapshotJsMetadata"]);
				mockServer.respondWith("GET", sSnapshotJsTemplatesUrl, [200, {}, "snapshotJsTemplates"]);
				var oMetadata = HCPLibraryMetadataProvider.getMetadata("sapui5", "js", "snapshot");
				expect(oMetadata).to.equal(null);
			});

		});
	});
});