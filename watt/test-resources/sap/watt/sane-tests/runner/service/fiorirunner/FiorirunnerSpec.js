define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var suiteName = "fiorirunner";
	var sandbox;

	describe("Fiori Runner - Create Default Configuration", function() {
		var oFakeFileDAO;
		var oFioriRunnerService;
		var oFileSearchService;
		var oChoosefilepopupService;
		var oDestinationsUtilService;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/fiorirunner/config.json"
			});
			return loadWebIdePromise.then(function() {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oFioriRunnerService = STF.getService(suiteName, "FioriRunner");
				oFileSearchService = STF.getService(suiteName, "filesearchutil");
				oChoosefilepopupService = STF.getService(suiteName, "choosefilepopup");
				oDestinationsUtilService = STF.getService(suiteName, "destinationsutil");
			});
		});
		
		/*beforeEach(function() {
			sandbox = sinon.sandbox.create();
		});*/

		afterEach(function() {
			sandbox.restore();
		});

		it("Test fiori runner createDefaultConfiguration method, selected document is runnable file, use case: src/main/webapp/Component.js ",
			function() {
				var oFileStructure = {
					"myTestProject1": {
						"src": {
							"main": {
								"webapp": {
									"Component.js": "test"
								}
							}

						}
					}
				};
				var oBackends = {aDestBackendSystems: ["GM6", "UIA"], aBackendSystems: [{source: "GM6", destinations: "QEK"}, {source: "GM6", destinations: "QEK"}]};	
				sandbox.stub(oDestinationsUtilService, "getNeoAppDestinations").returns(Q(oBackends));
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1/src/main/webapp/Component.js").then(function(oDocument) {
						return oFioriRunnerService.createDefaultConfiguration(oDocument).then(function(actualResult) {
							expect(actualResult.filePath).to.equal("/myTestProject1/src/main/webapp/Component.js");
						});
					});
				});

			});

		it("Test fiori runner createDefaultConfiguration method, selected document is project ", function() {
			var oFileStructure = {
				"myTestProject1": {
					"src": {
						"main": {
							"webapp": {
								"Component.js": "test"
							}
						}

					}
				}
			};

			sandbox.stub(oFileSearchService, "getRunnableFiles").returns(Q([{
				fullPath: "/myTestProject1/src/main/webapp/Component.js",
				name: "Component.js"
			}]));
			
			var oBackends = {aDestBackendSystems: ["GM6", "UIA"], aBackendSystems: [{source: "GM6", destinations: "QEK"}, {source: "GM6", destinations: "QEK"}]};	
			sandbox.stub(oDestinationsUtilService, "getNeoAppDestinations").returns(Q(oBackends));

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFakeFileDAO.getDocument("myTestProject1").then(function(oDocument) {
					return oFioriRunnerService.createDefaultConfiguration(oDocument).then(function(actualResult) {
						expect(actualResult.filePath).to.equal("/myTestProject1/src/main/webapp/Component.js");
					});
				});
			});
		});
		
		it("Test fiori runner createDefaultConfiguration method, use case: no Component.js files in project",function() {
	        var oFileStructure = {
    				"SomeProject1" : {
    				    "index.html" : "some content"
    				}
    			};
			
			var oBackends = {aDestBackendSystems: ["GM6", "UIA"], aBackendSystems: [{source: "GM6", destinations: "QEK"}, {source: "GM6", destinations: "QEK"}]};	
			sandbox.stub(oDestinationsUtilService, "getNeoAppDestinations").returns(Q(oBackends));
			
			sandbox.stub(oFileSearchService, "getRunnableFiles").returns(Q([]));
			
			return oFakeFileDAO.setContent(oFileStructure).then(function() {	
			     return oFakeFileDAO.getDocument("myTestProject1").then(function(oDocument) {
      		         return oFioriRunnerService.createDefaultConfiguration(oDocument).then(function(actualResult) {
      		         	expect(actualResult.filePath).to.equal(null);
      		         });    
			     });
			});
		});
		
		it("Test fiori runner createDefaultConfiguration method, use case: not valid project ", function() {
	        var oFileStructure = {
					"myTestProject2" : {}
				};
				
			sandbox.stub(oFileSearchService, "getRunnableFiles").returns(Q(null));
			
			var oBackends = {aDestBackendSystems: ["GM6", "UIA"], aBackendSystems: [{source: "GM6", destinations: "QEK"}, {source: "GM6", destinations: "QEK"}]};	
			sandbox.stub(oDestinationsUtilService, "getNeoAppDestinations").returns(Q(oBackends));
				
			return oFakeFileDAO.setContent(oFileStructure).then(function() {	
			     return oFakeFileDAO.getDocument("myTestProject2").then(function(oDocument) {
      		         return oFioriRunnerService.createDefaultConfiguration(oDocument).then(function(actualResult) {
      		         	expect(actualResult).to.equal(undefined);
      		         });    
			     });
			});
		});
		
		
		it("Test fiori runner createDefaultConfiguration method, use case: several Component.js files ",function() {
	        var oFileStructure = {
					"myTestProject2" : {}
				};
				
			sandbox.stub(oFileSearchService, "getRunnableFiles").returns(Q([
			    {
			        fullPath:"/myTestProject2/src/main/webapp/Component.js",
			        name:"Component.js"
			    },
			    {
			        fullPath:"/myTestProject2/Component.js",
			        name:"Component.js"
			    }
			    ]));
			    
			sandbox.stub(oChoosefilepopupService, "getContent").returns(Q(true));    
			sandbox.stub(oChoosefilepopupService, "getResult").returns(Q("/myTestProject2/Component.js"));
			
			var oBackends = {aDestBackendSystems: ["GM6", "UIA"], aBackendSystems: [{source: "GM6", destinations: "QEK"}, {source: "GM6", destinations: "QEK"}]};	
			sandbox.stub(oDestinationsUtilService, "getNeoAppDestinations").returns(Q(oBackends));
												    
			//added fake window id									    
			return oFakeFileDAO.setContent(oFileStructure).then(function() {	
			     return oFakeFileDAO.getDocument("myTestProject2").then(function(oDocument) {
      		         return oFioriRunnerService.createDefaultConfiguration(oDocument,false,"id").then(function(actualResult) {
      		         	expect(actualResult.filePath).to.equal("/myTestProject2/Component.js");
      		         });    
			     });
			});
		});

		after(function() {
			sandbox.restore();
			STF.shutdownWebIde(suiteName);
		});
	});
});