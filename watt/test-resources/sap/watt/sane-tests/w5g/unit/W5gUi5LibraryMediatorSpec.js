define(["sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUi5LibraryMediator"],
	function (W5gUi5Lm) {
		"use strict";

		describe("W5gUi5LibraryMediator: support for sapui5 version which less than current", function () {
			var oMockLibrariesInfo = [
				{
					"id": "xml",
					"libMetadata": "sap.watt.common.xml/service/metadata/ui5/1.39.1.zip",
					"name": "sapui5",
					"version": "1.39.1"
				},
				{
					"id": "xml",
					"libMetadata": "sap.watt.common.xml/service/metadata/ui5/1.24.5.zip",
					"name": "sapui5",
					"version": "1.24.5"
				}
			];
			var oMockMetadata = {
				libId: "sapui5;1.24.5",
				meta: [
					{
						metadatas: {
							"sap.m.Page": {
								properties : {
									backgroundDesign: {},
									enableScrolling: {},
									icon: {},
									navButtonText: {},
									navButtonType: {},
									showFooter: {},
									showHeader: {},
									showNavButton: {},
									title: {}
								}
							}
						}
					}
				]
			};
			var oMockContext = {
				service: {
					intellisence: {
						getCalculatedLibraries: function () {
							return Q(oMockLibrariesInfo);
						}
					}
				}
			};

			before(function () {
				jQuery.sap.require("sap.m.Page");
				W5gUi5Lm.init(oMockContext);
				W5gUi5Lm.__QUnit_setMockInitLibrary(oMockLibrariesInfo[1], oMockMetadata);
				return W5gUi5Lm.loadLibrary();
			});

			it("initialization", function () {
				var lastUi5Version = W5gUi5Lm.__QUnit_getLastUI5version();
				assert.strictEqual(lastUi5Version.length, 3, "library version parsed wrong");
				_.each(lastUi5Version, function (subVersion) {
					assert.strictEqual(typeof (subVersion), "number", "library version initialization wrong");
				});
			});

			it("compare library version", function () {
				var isLibraryLowerThenCompiled = W5gUi5Lm.__QUnit_getIsLibraryLowerThenCompiledFunction();
				var lastUi5Version = W5gUi5Lm.__QUnit_getLastUI5version();
				var result = isLibraryLowerThenCompiled.apply(W5gUi5Lm, [[lastUi5Version[0], lastUi5Version[1], lastUi5Version[2]].join(".")]);
				assert.isTrue(result, "version comparison wrong");
				result = isLibraryLowerThenCompiled.apply(W5gUi5Lm, [[lastUi5Version[0], lastUi5Version[1], lastUi5Version[2] + 3].join(".")]);
				assert.isFalse(result, "version comparison wrong");
				result = isLibraryLowerThenCompiled.apply(W5gUi5Lm, [[lastUi5Version[0], lastUi5Version[1] + 3, lastUi5Version[2]].join(".")]);
				assert.isFalse(result, "version comparison wrong");
				result = isLibraryLowerThenCompiled.apply(W5gUi5Lm, [[lastUi5Version[0] + 2, lastUi5Version[1], lastUi5Version[2]].join(".")]);
				assert.isFalse(result, "version comparison wrong");
				result = isLibraryLowerThenCompiled.apply(W5gUi5Lm, [[lastUi5Version[0], lastUi5Version[1] - 4, lastUi5Version[2]].join(".")]);
				assert.isTrue(result, "version comparison wrong");
				result = isLibraryLowerThenCompiled.apply(W5gUi5Lm, ["bla123bla"]);
				assert.isTrue(result, "version comparison wrong");
				result = isLibraryLowerThenCompiled.apply(W5gUi5Lm, [[lastUi5Version[0], lastUi5Version[1]].join(".")]);
				assert.isTrue(result, "version comparison wrong");
				result = isLibraryLowerThenCompiled.apply(W5gUi5Lm, [[lastUi5Version[0], lastUi5Version[1], lastUi5Version[2], 12].join(".")]);
				assert.isFalse(result, "version comparison wrong");
			});

			it("load library", function () {
				assert.ok(W5gUi5Lm.__QUnit_getLoadedLibraries()[oMockLibrariesInfo[1].version], "wrong version library is taken");
			});

			it("is control supported", function () {
				var oPage = new sap.m.Page();
				assert.isTrue(W5gUi5Lm.isControlSupported(oPage.getMetadata()._sClassName), "control metadata analyzing wrong");
			});

			it("get all supported properties", function () {
				var oPage = new sap.m.Page();
				var oSupported = W5gUi5Lm.getAllSupportedControlProperties(oPage);
				var oProperties = oPage.getMetadata().getAllProperties();
				assert.notStrictEqual(Object.keys(oProperties).length, Object.keys(oSupported).length, "control properties validation error");
				assert.ok(oProperties["showSubHeader"], "property 'showSubHeader' expected to exists");
				assert.ok(!oSupported.showSubHeader, "property 'showSubHeader' expected to not exists");
				assert.ok(oProperties["titleLevel"], "property 'titleLevel' expected to exists");
				assert.ok(!oSupported.titleLevel, "property 'titleLevel' expected to not exists");
			});

		});
	});
