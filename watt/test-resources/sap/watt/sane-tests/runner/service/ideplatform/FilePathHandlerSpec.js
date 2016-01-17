define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "File Path Handler";

	describe("File Path Handler methods", function() {

		var oFilePathControlService;
		var oFakeFileDAO;
		var oProviderService;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
			});
			return loadWebIdePromise.then(function(webIdeWindowObj) {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oFilePathControlService = STF.getService(suiteName, "runconfig.filepath");
				oProviderService = STF.getService(suiteName, "filesystem.documentProvider");
			});
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("tests validatePathInput method", function() {
			var aFiles = ["index2.html", "index.html"];
			var aValidation = [{
				"isRegex": false,
				"rule": ".html"
			}];
			var oFileStructure = {
				"myTestProject1": {
					"index.html": "test",
					"src": {
						"main": {
							"webapp": {
								"index.html": "test"
							}
						}
					}
				}
			};
			
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
					sandbox.stub(oProviderService, "getDocument").returns(oFakeFileDAO.getDocument("/myTestProject1/index.html"));
					return oFilePathControlService.getControl(oDocument, aFiles, aValidation).then(function(oControl) {
						return oControl.getOController().validatePathInput("/myTestProject1/index.html").then(function(oValid) {
							expect(oValid.isValid).to.equal(true);
						});
					});
				});
			});

		});

	});
});