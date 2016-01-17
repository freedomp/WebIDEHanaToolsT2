define(["STF"], function(STF) {
	"use strict";

	var suiteName = "perspectiveTest";
	var oLayoutService, oPerspectiveService, oConsoleService, oPerspectiveChanged, oSplitterPositionsChanged;
	describe("perspective test", function() {
		var getService = STF.getServicePartial(suiteName);

		before(function() {
			var qunitDiv = document.createElement('div');
			qunitDiv.id = 'qunit';
			qunitDiv.className = 'block';
			document.getElementsByTagName('body')[0].appendChild(qunitDiv);
			var content = document.createElement('div');
			content.id = 'content';
			content.className = 'contentStyle';
			var section = document.createElement('section');
			section.id = 'center';
			section.className = 'center';
			content.appendChild(section);
			document.getElementsByTagName('body')[0].appendChild(content);

			return STF.startWebIde(suiteName, {
				config: "core/core/common/plugin/perspective/config.json"
			}).then(function() {
				oLayoutService = getService("layout");
				oPerspectiveService = getService("perspective");
				oConsoleService = getService("console");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("API", function() {

			before(function() {
				return oLayoutService.getLayoutTypes().then(function(oLayoutTypes) {
					return oLayoutService.show(oLayoutTypes.MAIN).then(function() {
						return oPerspectiveService.renderPerspective("development");
					});
				});
			});

			it("test perspective getCurrentPerspective", function() {
				return oPerspectiveService.getCurrentPerspective().then(function(sResult) {
					assert.ok((sResult == "development"), "service could not be placed");
				});
			});

			it("test perspective getServiceAt before placement", function() {
				return oPerspectiveService.getServiceAt("center_bottom").then(function(oService) {
					assert.ok(oService !== undefined, "By configuration service 'console' is expected even though it's visibility is false");
				});
			});

			it("test perspective placeServiceAt", function() {
				return oPerspectiveService.placeServiceAt("center_bottom", "console").then(function(oResult) {
					assert.ok(oResult, "service could not be placed");
				});
			});

			it("test perspective getServiceAt", function() {
				return oPerspectiveService.placeServiceAt("center_bottom", "console").then(function(oResult) {
					assert.ok(oResult, "service could not be placed");
					return oPerspectiveService.getServiceAt("center_bottom").then(function(oResult1) {
						assert.ok((oResult1 == oConsoleService), "Previously placed service not found");
					});
				});
			});
			it("test perspective getViewIdAt", function() {
				return oPerspectiveService.placeServiceAt("center_bottom", "console").then(function(oResult) {
					assert.ok(oResult, "service could not be placed");
					return oPerspectiveService.getViewIdAt("center_bottom").then(function(oResult1) {
						assert.ok((oResult1 == "console"), "Previously placed service not found");
					});
				});
			});

			it("test perspective getAreaForService", function() {
				return oPerspectiveService.placeServiceAt("center_bottom", "console").then(function(oResult) {
					assert.ok(oResult, "service could not be placed");
					return oPerspectiveService.getAreaForService("console").then(function(sResult) {
						assert.ok((typeof(sResult) == "string"), "getAreaForService does not return a string");
						assert.ok((sResult == "center_bottom"), "Previously placed service not found");
					});
				});
			});

			it("test perspective isAreaMaximized", function() {
				return oPerspectiveService.placeServiceAt("center_bottom", "console").then(function(oResult) {
					assert.ok(oResult, "service could not be placed");
					return oPerspectiveService.isAreaMaximized("center_bottom").then(function(bResult) {
						assert.ok((bResult == false), "Previously placed service shall not be maximized");
					});
				});
			});

			it("test perspective setAreaMaximized - center_bottom area", function() {
				return oPerspectiveService.placeServiceAt("center_bottom", "console").then(function(oResult) {
					assert.ok(oResult, "service could not be placed");
					return oPerspectiveService.setAreaMaximized("center_bottom", true).then(function() {
						return oPerspectiveService.isAreaMaximized("center_bottom").then(function(bResult) {
							assert.ok((bResult == true), "Area shall be maximized");
						});
					});
				});
			});

			it("test perspective setAreaMaximized - normalized scenario ", function() {
				return oPerspectiveService.placeServiceAt("center_bottom", "console").then(function(oResult) {
					assert.ok(oResult, "service could not be placed");
					return oPerspectiveService.setAreaMaximized("center_bottom", false).then(function() {
						// setAreaMaximized works fine.
						assert.ok(true);
					}).fail(function(error) {
						// setAreaMaximized was failed.
						assert.ok(false);
					});
				});
			});

			it("test perspective setAreaVisible", function() {
				return oPerspectiveService.placeServiceAt("center_bottom", "console").then(function(oResult) {
					assert.ok(oResult, "service could not be placed");
					return oPerspectiveService.setAreaVisible("center_bottom", true).then(function() {
						return oPerspectiveService.isAreaVisible("center_bottom").then(function(bResult) {
							assert.ok((bResult == true), "Area shall be visible");
						});
					});
				});
			});

			it("test perspective isPerspectiveRegistered", function() {
				return oPerspectiveService.isPerspectiveRegistered("welcome").then(function(bResult) {
					assert.ok((bResult == false));
					return oPerspectiveService.isPerspectiveRegistered("development").then(function(bResult) {
						assert.ok((bResult == true));
					});
				});
			});
		});
		describe("Events", function() {

			before(function() {
				return oLayoutService.getLayoutTypes().then(function(oLayoutTypes) {
						return oLayoutService.show(oLayoutTypes.MAIN).then(function() {
							return oPerspectiveService.renderPerspective("development");
						});
					})
					.then(function() {
						return oPerspectiveService.attachEvent("perspectiveChanged", function(oEvent) {
							oPerspectiveChanged = true;
						});
					})
					.then(function() {
						return oPerspectiveService.attachEvent("splitterPositionChanged", function(oEvent) {
							oSplitterPositionsChanged = true;
						});
					});
			});

			it("test event perspectiveChanged after placeServiceAt", function() {
				oPerspectiveChanged = undefined;
				oSplitterPositionsChanged = undefined;
				return oPerspectiveService.placeServiceAt("center_bottom", "console").then(function(oResult) {
					assert.ok(oPerspectiveChanged, "event perspectiveChanged not fired");
				});
			});

			it("test event perspectiveChanged after setAreaVisible", function() {
				oPerspectiveChanged = undefined;
				oSplitterPositionsChanged = undefined;
				// Start with setting to false to have a defined state
				return oPerspectiveService.setAreaVisible("center_bottom", false).then(function() {
					// Now change the state and check event emitters
					return oPerspectiveService.setAreaVisible("center_bottom", true).then(function(oResult) {
						assert.ok(oPerspectiveChanged, "event perspectiveChanged not fired");
						assert.ok(oSplitterPositionsChanged, "event oSplitterPositionsChanged not fired");
						oPerspectiveChanged = undefined;
						oSplitterPositionsChanged = undefined;
						return oPerspectiveService.setAreaVisible("center_bottom", false).then(function(oResult) {
							assert.ok(oPerspectiveChanged, "event perspectiveChanged not fired");
							assert.ok(oSplitterPositionsChanged, "event oSplitterPositionsChanged not fired");
						});
					});
				});
			});
		});

		describe("Dynamics", function() {

			before(function() {
				return oLayoutService.getLayoutTypes().then(function(oLayoutTypes) {
					return oLayoutService.show(oLayoutTypes.MAIN).then(function() {
						return oPerspectiveService.renderPerspective("development");
					});
				}).then(function() {
					return oPerspectiveService.placeServiceAt("center_bottom", "console");
				});
			});

			it("test swap bottom top", function() {

				var oTopPromise = oPerspectiveService.getServiceAt("center_top");
				var oBottomPromise = oPerspectiveService.getServiceAt("center_bottom");

				return Q.spread([oTopPromise, oBottomPromise], function(oTopPart, oBottomPart) {
					if (!!oTopPart) {
						return oPerspectiveService.placeServiceAt("center_bottom", oTopPart).then(function() {
							return oPerspectiveService.placeServiceAt("center_top", oBottomPart);
						}).then(function() {
							return oPerspectiveService.getServiceAt("center_top").then(function(sResult) {
								assert.ok((sResult == oBottomPart), "Unexpected component found");
							});
						});
					} else if (!!oBottomPart) {
						return oPerspectiveService.placeServiceAt("center_top", oBottomPart).then(function() {
							return oPerspectiveService.getServiceAt("center_top").then(function(sResult) {
								assert.ok((sResult == oBottomPart), "Unexpected component found");
							});
						});
					} else {
						return Q();
					}

				});

			});
		});

	});
});