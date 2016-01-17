//  The SaneTestFramework should be imported via 'STF' path.
define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "intellisence_service_tests";
	var oCalculateLibVersionService;
	var oLibVersionService;
	var oDocument;
	var sandbox;
	
	describe("Intellisence calculate library version service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config : "editor/monaco/ideplatform/plugin/intellisence/service/config.json"}).
			then(function() {
				sandbox = sinon.sandbox.create();
				oCalculateLibVersionService =  STF.getService(suiteName, "intellisence.calculatelibraryversion");
				oLibVersionService = STF.getService(suiteName, "intellisence.libversion");
				return STF.require(suiteName, ["sane-tests/util/mockDocument"]);
			}).spread(function(oMockDocument) {
				var MockFileDocument = oMockDocument.MockFileDocument;
				oDocument = new MockFileDocument("proj/test1.js", "js", "var a = b;");
			});
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});
		
		afterEach(function() {
			sandbox.restore();
		});
		
		describe("neoapp.json with sapui5 and no version", function() {
			beforeEach(function() {
				 var oReturn = { aLibrary: [{
                                    id: "js",
                                    library: "sapui5",
                                    path: "/resources",
                                    entrypath: "/resources"
                    }],
                    project: "test"
		        };
		        sandbox.stub(oLibVersionService, "getLibVersion").returns(Q(oReturn));
			});
			
			it("Intellisence calculate Library version - no configured library ", function(){
			    return oCalculateLibVersionService.getCalculatedLibraryVersion(oDocument, undefined).then(function(oReturn) {
	                    expect(oReturn, "Intellisence Service calculate Library should not return anything").to.not.exist;
	                });
			});

			it("Intellisence calculate Library version same ver in neoapp and config", function() {
			    return oCalculateLibVersionService.getCalculatedLibraryVersion(oDocument, [{name:"sapui5", id: "js", version: "1.0.0"}]).then(function(aReturn) {
	                expect(aReturn, "Library found").to.exist;
	                expect(aReturn, "1 Library extracted").to.have.length(1);
	                expect(aReturn[0].name, "Calculated Library correct name").to.equal("sapui5");
	                expect(aReturn[0].version, "Calculated Library correct ver").to.equal("1.0.0");
	                
	            });
	        });

			it("Intellisence calculate Library version same ver in neoapp and config and another library exist", function() {
			    return oCalculateLibVersionService.getCalculatedLibraryVersion(oDocument, [{name:"sapui5", id: "js", version: "1.0.0"}, {name:"another", id: "js", version: "3.0.2"}]).then(function(aReturn) {
	                expect(aReturn, "Library found").to.exist;
	                expect(aReturn, "2 Library extracted one UI5 and another lib").to.have.length(2);
	                expect(aReturn[0].name, "Calculated another Library correct name").to.equal("another");
                	expect(aReturn[0].version, "Calculated another Library correct ver").to.equal("3.0.2");
                	expect(aReturn[1].name, "Calculated Library correct name").to.equal("sapui5");
                	expect(aReturn[1].version, "Calculated Library correct ver").to.equal("1.0.0");
	            });
	        });
	        
			it("Intellisence calculate Library version same ver in neoapp and config and another library exist", function() {
			    return oCalculateLibVersionService.getCalculatedLibraryVersion(oDocument, [{name:"sapui5", id: "js", version: "1.0.0"}, {name:"sapui5", id: "js", version: "0.9.0"}, {name:"test", id: "js", version: "3.0.2"}]).then(function(aReturn) {
	                expect(aReturn, "Library found").to.exist;
	                expect(aReturn, "2 Library extracted one UI5 and another lib").to.have.length(2);
	                expect(aReturn[1].name, "Calculated another Library correct name").to.equal("test");
                	expect(aReturn[1].version, "Calculated another Library correct ver").to.equal("3.0.2");
                	expect(aReturn[0].name, "Calculated Library correct name").to.equal("sapui5");
                	expect(aReturn[0].version, "Calculated Library correct ver").to.equal("1.0.0");
	            });
	        });  
	        
	        	
	        it("Calculate Library version with 2 versions unsorted configured, neo app has no version - Take latest available configured version", function() {
			    return oCalculateLibVersionService.getCalculatedLibraryVersion(oDocument, [{name:"sapui5",id: "js", version: "1.2.2"},{name:"sapui5",id: "js", version: "1.1.2"}]).then(function(aReturn) {
                	expect(aReturn, "Library found").to.exist;
	               	expect(aReturn, "1 Library extracted").to.have.length(1);
               		expect(aReturn[0].name, "Calculated Library correct name").to.equal("sapui5");
                	expect(aReturn[0].version, "Calculated Library correct ver neo-app").to.equal("1.2.2");
	            });
	        });
	
	        it("Calculate Library version with no neo app version  - Take latest available configured version", function() {
			    return oCalculateLibVersionService.getCalculatedLibraryVersion(oDocument, [{name:"sapui5",id: "js", version: "1.2.2"},{name:"sapui5",id: "js", version: "1.1.2"}]).then(function(aReturn) {
                	expect(aReturn, "Library found").to.exist;
                	expect(aReturn, "1 Library extracted").to.have.length(1);
	                expect(aReturn[0].name, "Calculated Library correct name").to.equal("sapui5");
                	expect(aReturn[0].version, "Calculated Library correct ver neo-app").to.equal("1.2.2");
	            });
	        });
		});
		
		describe("neoapp.json with sapui5 and specific version", function() {
			beforeEach(function() {
				 var oReturn = { aLibrary: [{
                                    id: "js",
                                    library: "sapui5",
                                    path: "/resources",
                                    version: "1.0.0",
                                    entrypath: "/resources"
                    }],
                    project: "test"
		        };
		        sandbox.stub(oLibVersionService, "getLibVersion").returns(Q(oReturn));
			});
			
			
			it("Intellisence calculate Library version - NeoApp version is 1.0.0; first configured version is 1.1.1", function() {
			    return oCalculateLibVersionService.getCalculatedLibraryVersion(oDocument, [{name:"sapui5", id: "js", version: "1.1.1"}]).then(function(aReturn) {
	                expect(aReturn, "Library found").to.exist;
                	expect(aReturn, "1 Library extracted").to.have.length(1);
                	expect(aReturn[0].name, "Calculated Library correct name").to.equal("sapui5");
                	expect(aReturn[0].version, "Calculated Library correct ver neo-app").to.equal("1.1.1");
	            });
	        });
	        
			it("Intellisence calculate Library version - NeoApp version is 1.0.0 closeset version is 0.9", function() {
			    return oCalculateLibVersionService.getCalculatedLibraryVersion(oDocument, [{name:"sapui5", id: "js", version: "0.9"}]).then(function(aReturn) {
	                expect(aReturn, "Library found").to.exist;
                	expect(aReturn, "1 Library extracted").to.have.length(1);
                	expect(aReturn[0].name, "Calculated Library correct name").to.equal("sapui5");
	               	expect(aReturn[0].version, "Calculated Library correct ver neo-app").to.equal("0.9");
	            });
	        });        
		});
		
		describe("neoapp.json with non-sapui5 resource entry", function() {
			beforeEach(function() {
				 var oReturn = { aLibrary: [],
                    project: "test"
		        };
		        sandbox.stub(oLibVersionService, "getLibVersion").returns(Q(oReturn));
			});
			
			it("Calculate Library version with neo app not sapui5 resource entry  - Take latest available configured version", function() {
			    return oCalculateLibVersionService.getCalculatedLibraryVersion(oDocument, [{name:"sapui5",id: "js", version: "1.2.2"},{name:"sapui5",id: "js", version: "1.1.2"}]).then(function(aReturn) {
	                expect(aReturn, "Library found").to.exist;
	               	expect(aReturn, "1 Library extracted").to.have.length(1);
                	expect(aReturn[0].name, "Calculated Library correct name").to.equal("sapui5");
	               	expect(aReturn[0].version, "Calculated Library correct ver neo-app").to.equal("1.2.2");
	            });
	        });    
		});
		

	
	});
});