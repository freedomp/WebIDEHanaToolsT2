define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "js_codecompletion_wuw_service_tests";
	var suiteWindowObj;
	var sandbox;
	var oJSCodeCompletionService;
	var oJsApiReferenceService;
	var oContentService;
	var oDocumentProviderService;
	var oConfig;
	var oIntellisenceService;

	var MockProject = function(sProjPath) {
		this._sProjPath = sProjPath;
		var oProjEntity = {
			getFullPath: function() {
				return sProjPath;
			}
		};

		this.getEntity = function() {
			return oProjEntity;
		};
	};

	var MockDocument = function(oParent, aFolderContent, sName, sFileExtension, sFileContent, isFolder, oProject) {
		this._oParent = oParent;
		this._aFolderContent = aFolderContent || [];
		this._sName = sName || "";
		this._sFileContent = sFileContent;
		this._sFileExtension = sFileExtension;
		this._isFolder = isFolder;
		this._oProject = oProject;

		var oEntity = {
			sFileExtension: sFileExtension,
			sFullPath: sName,
			getFullPath: function() {
				return sName;
			},
			getFileExtension: function() {
				return sFileExtension;
			},
			getName: function() {
				return sName;
			},
			getType: function() {
				return this._isFolder ? "folder" : "file";
			}

		};

		this.getEntity = function() {
			return oEntity;
		};

		this.getProject = function() {
			//For testing support only one level
			return Q(this._oProject);
		};

		this.isProject = function() {
			return false;
		};

		this.getContent = function() {
			return Q(this._sFileContent);
		};

		this.getFolderContent = function() {
			return Q(this._aFolderContent);
		};
	};

	var oProj = new MockProject("/testPlugin");
	var sPluginJsonContent = '{ "name": "testPlugin", "requires": { "services": ["focus"] } }';
	var oPluginJsonDoc = new MockDocument("/testPlugin", null, "/testPlugin/plugin.json", "json", sPluginJsonContent, false, oProj);
	var oDocument = new MockDocument("service", null, "/testPlugin/service/testServiceImpl.js", "js", "", false, oProj);

	function getSummary(sPath) {
		return oJSCodeCompletionService.getSummaryFromMeta(sPath);
	}
 

	describe("JS Get Summary from meta Service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "editor/toolsets/plugin/javascript/service/config.json"
			}).
			then(function(webIdeWindowObj) {
				suiteWindowObj = webIdeWindowObj;
				oJSCodeCompletionService = STF.getService(suiteName, "jscodecompletion");
				oJsApiReferenceService = STF.getService(suiteName, "jsapireference");
				oContentService = STF.getService(suiteName, "content");
				oDocumentProviderService = STF.getService(suiteName, "filesystem.documentProvider");
				oIntellisenceService = STF.getService(suiteName, "intellisence");
				oConfig = [{
					"id": "js",
					"name": "sapui5",
					"version": "1.24.5",
					"libIndexFile": "sap.watt.toolsets.javascript/service/indexFiles/ui5/1.24.5.zip",
					"libTemplate": "sap.watt.toolsets.javascript/service/template/ui5/1.24.5.zip",
					"help": "https://sapui5.hana.ondemand.com/sdk/#docs/api/symbols/",
					"helpService": oJsApiReferenceService
				}];
			});
		});

		beforeEach(function() {
			sandbox = sinon.sandbox.create();
			sandbox.stub(oIntellisenceService, "getCalculatedLibraries").returns(Q(oConfig));
			sandbox.stub(oContentService, "getCurrentDocument").returns(Q(oDocument));
			sandbox.stub(oDocumentProviderService, "getDocument").returns(Q(oPluginJsonDoc));
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Get Library Metadata based summary", (function() {
			return getSummary("sap/m/Button").then(function(oSummary){
				expect(oSummary,"Summary returned").to.exists;
			});
		})
		);

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});
});