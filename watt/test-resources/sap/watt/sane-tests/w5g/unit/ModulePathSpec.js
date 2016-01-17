define(["sap/watt/lib/lodash/lodash",
	"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/ModulePath"], function (_, ModulePath) {
	"use strict";
	describe("Module path", function () {
		var sFilePath, sAppId, oUI5ResRoots,
			oContext = {
				service: {
					ui5projecthandler: {
						getAttribute: function (doc, sAttr) {
							if (sAttr === "sap.ui5") {
								return Q(oUI5ResRoots);
							}
							return Q("");
						},
						getAppNamespace: function () {
							return Q(sAppId);
						},
						getHandlerFilePath: function (doc) {
							return Q(sFilePath);
						}
					}
				}
			};

		/*
		 * @param {DummyDoc} parent
		 * @param {string=} name
		 * @param {Array.<DummyDoc>=}folderContent
		 * @param {string=}fileContent
		 * @constructor
		 */
		function DummyDoc(parent, name, folderContent, fileContent) {
			this._parent = parent;
			this._name = name || "";
			this._folderContent = folderContent || [];
			this._fileContent = fileContent;
		}

		DummyDoc.prototype.isProject = function () {
			return !this._parent;
		};
		DummyDoc.prototype.getParent = function () {
			return Q(this._parent);
		};
		DummyDoc.prototype.getProject = function () {
			var current = this;
			while (current._parent) {
				current = current._parent;
			}
			return Q(current);
		};
		DummyDoc.prototype.getFolderContent = function () {
			return Q(this._folderContent);
		};
		DummyDoc.prototype.getEntity = function () {
			var that = this;
			return {
				getName: function () {
					return that._name;
				},
				getBackendData: function () {
					return {location: that._name};
				},
				getFullPath: function () {
					return that._name;
				}
			};
		};

		DummyDoc.prototype.getContent = function () {
			return Q(this._fileContent);
		};

		before(function () {
			ModulePath.init(oContext);
		});

		// =========     index files tests    ==================================
		// =====================================================================

		it("Get module path metadata for the project folder without manifest.json and without index.html should return null", function () {
			return ModulePath.getModulePaths(new DummyDoc(null)).then(function (oModulePath) {
				assert.equal(oModulePath, null);
			});
		});
		it("Get module path metadata for the project folder without manifest.json and with index.html should return null", function () {
			return ModulePath.getModulePaths(new DummyDoc(null, null, [new DummyDoc(null, "index.html")])).then(function (oModulePath) {
				assert.equal(oModulePath, null);
			});
		});
		it("Get module path metadata for a document in a project folder that doesn't have index.html (without manifest.json)", function () {
			var oDoc = new DummyDoc(new DummyDoc(null, null, [new DummyDoc(null, "foo"), new DummyDoc(null, "bar")]));
			return ModulePath.getModulePaths(oDoc).then(function (pathMetadata) {
				assert.equal(null, pathMetadata);
			});
		});
		it("Get module path metadata for a document in a sub-folder of a project folder that doesn't have index.html (without manifest.json)", function () {
			var oDoc = new DummyDoc(new DummyDoc(new DummyDoc(new DummyDoc(null, null, [new DummyDoc(null, "foo"), new DummyDoc(null, "bar")]))));
			return ModulePath.getModulePaths(oDoc).then(function (pathMetadata) {
				assert.equal(null, pathMetadata);
			});
		});

		function assertExistingContent(oProjectFolder, oDocument, sExpectedFileContent) {
			return ModulePath.getModulePaths(oDocument).then(function (resourcesrootsMetadata) {
				assert.notEqual(null, resourcesrootsMetadata);
				assert.strictEqual(oProjectFolder.getEntity().getBackendData().location, resourcesrootsMetadata.parentFolder);
				assert.deepEqual(JSON.parse(sExpectedFileContent), resourcesrootsMetadata.resourcesroots);
			});
		}

		function surroundWithHTML(sAttributeName, sJson) {
			return "<!DOCTYPE HTML> \
                    <html> \
                    <head> \
                    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\
                    <meta http-equiv='Content-Type' content='text/html;charset=UTF-8'/>\
                    <script src=\"/watt/resources/sap-ui-core.js\"\
                        id=\"sap-ui-bootstrap\"\
                        data-sap-ui-libs=\"sap.m\" " + sAttributeName + "='" + sJson + "'\
                        data-sap-ui-theme=\"sap_bluecrystal\">\
                    <\/script>\
                    <!-- only load the mobile lib \"sap.m\" and the \"sap_bluecrystal\" theme -->\
                    <script>\
                        sap.ui.localResources(\"view\");\
                        var app = new sap.m.App({initialPage:\"idView1\"});\
                        var page = sap.ui.view({id:\"idView1\", viewName:\"view.View1\", type:sap.ui.core.mvc.ViewType.XML});\
                        app.addPage(page);\
                        app.placeAt(\"content\");\
                    <\/script>\
                    </head>\
                    <body class=\"sapUiBody\" role=\"application\">\
                    <div id=\"content\"></div>\
                    </body>\
                    </html>";
		}

		it("Get module path metadata for a document in a project folder that has index.html (without manifest.json)", function () {
			var sFileContent = '{"kuku" : { "yoyo" : 17}}';
			var oProjectFolder = new DummyDoc(null, null, [new DummyDoc(null, "foo"),
				new DummyDoc(null, "index.html", null, surroundWithHTML('data-sap-ui-resourceroots', sFileContent)),
				new DummyDoc(null, "bar")]);
			return assertExistingContent(oProjectFolder, new DummyDoc(oProjectFolder), sFileContent);
		});
		it("Get module path metadata for a document in a project folder that has index.html and resourceroots is not in the first script tag (without manifest.json)", function () {
			var sFileContent = '{"kuku" : { "yoyo" : 17}}';
			var html = "<!DOCTYPE HTML> \
                    <html> \
                    <head> \
                    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\
                    <meta http-equiv='Content-Type' content='text/html;charset=UTF-8'/>\
                   <!-- only load the mobile lib \"sap.m\" and the \"sap_bluecrystal\" theme -->\
                    <script>\
                        sap.ui.localResources(\"view\");\
                        var app = new sap.m.App({initialPage:\"idView1\"});\
                        var page = sap.ui.view({id:\"idView1\", viewName:\"view.View1\", type:sap.ui.core.mvc.ViewType.XML});\
                        app.addPage(page);\
                        app.placeAt(\"content\");\
                    <\/script>\
                    <script src=\"/watt/resources/sap-ui-core.js\"\
                        id=\"sap-ui-bootstrap\"\
                        data-sap-ui-libs=\"sap.m\" data-sap-ui-resourceroots='" + sFileContent + "'\
                        data-sap-ui-theme=\"sap_bluecrystal\">\
                    <\/script>\
                     </head>\
                    <body class=\"sapUiBody\" role=\"application\">\
                    <div id=\"content\"></div>\
                    </body>\
                    </html>";
			var oProjectFolder = new DummyDoc(null, null, [new DummyDoc(null, "foo"),
				new DummyDoc(null, "index.html", null, html),
				new DummyDoc(null, "bar")]);
			return assertExistingContent(oProjectFolder, new DummyDoc(oProjectFolder), sFileContent);
		});
		it("Get module path metadata for a document in a project folder that has index.html but with no attribute (without manifest.json)", function () {
			var sFileContent = '{"kuku" : { "yoyo" : 17}}';
			var oProjectFolder = new DummyDoc(null, null, [new DummyDoc(null, "foo"),
				new DummyDoc(null, "index.html", null, surroundWithHTML('NOT-data-sap-ui-resourceroots', sFileContent)),
				new DummyDoc(null, "bar")]);
			return ModulePath.getModulePaths(new DummyDoc(oProjectFolder)).then(function (resourcesrootsMetadata) {
				assert.equal(null, resourcesrootsMetadata);
			});
		});
		it("Get module path metadata for a document in a project folder that has localIndex.html (without manifest.json)", function () {
			var sFileContent = '{"kuku" : { "yoyo" : 17}}';
			var oProjectFolder = new DummyDoc(null, null, [new DummyDoc(null, "foo"),
				new DummyDoc(null, "localIndex.html", null, surroundWithHTML('data-sap-ui-resourceroots', sFileContent)),
				new DummyDoc(null, "bar")]);
			return assertExistingContent(oProjectFolder, new DummyDoc(oProjectFolder), sFileContent);
		});
		it("Get module path metadata for a document in a project folder that has index.html with strange casing (without manifest.json)", function () {
			var sFileContent = '{"kuku" : { "yoyo" : 17}}';
			var oProjectFolder = new DummyDoc(null, null, [new DummyDoc(null, "foo"),
				new DummyDoc(null, "index.html", null, surroundWithHTML('data-sap-ui-resourceroots', sFileContent)),
				new DummyDoc(null, "bar")]);
			var ret = assertExistingContent(oProjectFolder, new DummyDoc(oProjectFolder), sFileContent);
			return ret;
		});
		it("Get module path metadata for a document in a sub-folder of a project folder that has index.html (without manifest.json)", function () {
			var sFileContent = '{"kuku" : { "yoyo" : 17}}';
			var oProjectFolder = new DummyDoc(null, null, [new DummyDoc(null, "foo"),
				new DummyDoc(null, "index.html", null, surroundWithHTML('data-sap-ui-resourceroots', sFileContent)),
				new DummyDoc(null, "bar")]);
			return assertExistingContent(oProjectFolder, new DummyDoc(new DummyDoc(oProjectFolder)), sFileContent);
		});
		it("Get module path metadata for a document two index.html in parent, closest should be taken (without manifest.json)", function () {
			var sFileContent = '{"kuku" : { "yoyo" : 17}}';
			var oSubFolder = new DummyDoc(new DummyDoc(null, null, [new DummyDoc(null, "index.html", null, '{"y" : 2}')])
				, null, [new DummyDoc(null, "foo"),
					new DummyDoc(null, "index.html", null, surroundWithHTML('data-sap-ui-resourceroots', sFileContent)),
					new DummyDoc(null, "bar")]);
			return assertExistingContent(oSubFolder, new DummyDoc(new DummyDoc(oSubFolder)), sFileContent);
		});

		// =========    tests for AppDescriptor (manifest.json) support   ==============
		// =============================================================================

		it("Get module path metadata for a document in a project folder that has manifest.json", function () {

			var oDoc = new DummyDoc(null);
			sFilePath = "filePath1";
			sAppId = "sap.fiori.appName";
			oUI5ResRoots = {
				resourceRoots: {
					key1: "resRoots1"
				}
			};
			return ModulePath.getModulePaths(oDoc).then(function (pathMetadata) {
				assert.deepEqual(pathMetadata, {
					parentFolder: "filePath1/",
					resourcesroots: {key1: "resRoots1", "sap.fiori.appName": "./"}
				});
			});
		});
	});
});