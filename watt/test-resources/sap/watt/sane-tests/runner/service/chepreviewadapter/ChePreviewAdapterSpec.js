define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "chePreviewAdapter";

	describe("Che Preview Adapter", function() {
		var oFakeFileDAO;
		var oChePreview;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/chepreviewadapter/config.json"
			});
			return loadWebIdePromise.then(function() {
				return STF.require(suiteName, ["sap/watt/ideplatform/plugin/chepreview/service/ChePreviewAdapter"]).spread(function(chepreview) {
					sandbox = sinon.sandbox.create();
					oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
					oChePreview = chepreview;
				});

			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test getPreviewUrl method - first run flow",
			function() {
				var oFileStructure = {
					"myTestProject1": {
						"src": {
							"main": {
								"webapp": {
									"index.html": "test"
								}
							}

						}
					}
				};

				var oStatusResponse = {
					links: [{
						rel: "web url",
						href: "http://myApp:51004/"
					}]
				};

				var context = {
					service: {
						log: {
							info: function() {
								return Q(null);
							},
							error: function() {
								return Q(null);
							}
						},
						runRegistry: {
							getProcesses: function() {
								return Q(null);
							},
							run: function() {
								return Q(oStatusResponse);
							}
						}
					},
					i18n: {
						getText: function() {
							return Q("");
						}
					},
					event: {
						fireRunProgress: function() {
							return Q(null);
						}
					}
				};

				oChePreview.context = context;

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1/src/main/webapp/index.html").then(function(oDocument) {
						return oChePreview.getPreviewUrl(oDocument).then(function(sURL) {
							expect(sURL.toString()).to.equal("http://myApp:51004/");
						});
					});
				});
			});
	});
});