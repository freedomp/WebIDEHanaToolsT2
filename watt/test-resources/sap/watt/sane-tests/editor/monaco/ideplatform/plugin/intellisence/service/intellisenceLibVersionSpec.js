//  The SaneTestFramework should be imported via 'STF' path.
define(["STF"], function(STF) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "intellisence_service_tests";
	var oLibVersionService;
	var oDocument;
	var oFakeFileDAOService;
    
	describe("intellisence library version service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config : "editor/monaco/ideplatform/plugin/intellisence/service/config.json"}).
			then(function() {
				oLibVersionService = STF.getService(suiteName, "intellisence.libversion");
				oFakeFileDAOService = STF.getService(suiteName, "fakeFileDAO");
				var sNeoAppContent1 = '{ "welcomeFile": "index.html", "routes": [{"path": "/sap/opu/odata", "target": { "type": "destination", "name": "gm6_abap_odata" }, "description": "Gateway system GM6 ABAP oData" }, { "path": "/resources", "target": { "type": "service", "name": "sapui5", "entryPath": "/resources" }, "description": "SAPUI5 Resources" }, { "path": "/test-resources", "target": { "type": "service", "name": "sapui5", "entryPath": "/test-resources" }, "description": "SAPUI5 Test Resources" } ] }';
	        	var oFileStructure =  {
					"myProject": {
						"test.js": "var a = b",
						"neo-app.json": sNeoAppContent1
					}
				};
				return oFakeFileDAOService.setContent(oFileStructure);
			}).then(function() {
				return oFakeFileDAOService.getDocument("/myProject/test.js");	
			}).then(function(oDoc) {
				oDocument = oDoc;
			});
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});
		
		it("Intellisence get Livrary version - no lib", function(){
		    return oLibVersionService.getLibVersion(oDocument, null).then(function(oReturn) {
                expect(oReturn, "Intellisence Service Library does not exist").to.not.exist;
            });
		});

		it("Intellisence get Library version", function() {
		    return oLibVersionService.getLibVersion(oDocument, [{name:"sapui5", id: "js", version: "1.1.1"}]).then(function(oReturn) {
                expect(oReturn, "Intellisence Service Library exist").to.exist;
                expect(oReturn.project, "Intelisense Library correct project name").to.equal("myProject");
                expect(oReturn.aLibrary, "Intelisense Library extracted").to.have.length(1);
                expect(oReturn.aLibrary[0].library, "Intelisense Library correct name").to.equal("sapui5");
                expect(oReturn.aLibrary[0].path, "Intelisense Library correct path").to.equal("/resources");
            });
        });
        
        it("Intellisence get Library version with no id", function() {
		    return oLibVersionService.getLibVersion(oDocument, [{name:"sapui5", version: "1.1.1"}]).then(function(oReturn) {
		    	expect(oReturn, "Intellisence Service Library exist").to.exist;
                expect(oReturn.project, "Intelisense Library correct project name").to.equal("myProject");
                expect(oReturn.aLibrary, "Intelisense Library extracted").to.have.length(1);
                expect(oReturn.aLibrary[0].library, "Intelisense Library correct name").to.equal("sapui5");
                expect(oReturn.aLibrary[0].path, "Intelisense Library correct path").to.equal("/resources");
            });
        });
        
        it("Intellisence get Library version with 2 version", function() {
		    return oLibVersionService.getLibVersion(oDocument, [{name:"sapui5",id: "js", version: "1.1.2"},{name:"sapui5",id: "js", version: "1.2.2"}]).then(function(oReturn) {
            	expect(oReturn, "Intellisence Service Library exist").to.exist;
                expect(oReturn.project, "Intelisense Library correct project name").to.equal("myProject");
                expect(oReturn.aLibrary, "Intelisense Library extracted").to.have.length(1);
                expect(oReturn.aLibrary[0].library, "Intelisense Library correct name").to.equal("sapui5");
                expect(oReturn.aLibrary[0].path, "Intelisense Library correct path").to.equal("/resources");
                expect(oReturn.aLibrary[0].version, "Intelisense Library should have no version").to.not.exist;
            });
        });
	});
});