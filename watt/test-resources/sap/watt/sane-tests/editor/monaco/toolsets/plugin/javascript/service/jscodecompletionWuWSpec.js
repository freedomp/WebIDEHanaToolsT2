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

	function getProposals(oContentStatus) {
		return oJSCodeCompletionService.getWordSuggestions(oContentStatus);
	}

	function checkProposal(proposals, key, value) {
		for (var i in proposals) {
			var proposal = proposals[i];
			if (proposal[key] === value) {
				return true;
			}
		}
		return false;
	}

	describe("JS Code Completion WuW Service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "editor/monaco/toolsets/plugin/javascript/service/config.json"
			}).
			then(function(webIdeWindowObj) {
				suiteWindowObj = webIdeWindowObj;
				oJSCodeCompletionService = STF.getService(suiteName, "jscodecompletion");
				oJsApiReferenceService = STF.getService(suiteName, "jsapireference");
				oContentService = STF.getService(suiteName, "content");
				oDocumentProviderService = STF.getService(suiteName, "filesystem.documentProvider");
				oIntellisenceService = STF.getService(suiteName, "intellisence");
				oConfig = {
					"id": "js",
					"name": "sapui5",
					"version": "1.24.5",
					"libIndexFile": "sap.watt.toolsets.javascript/service/indexFiles/ui5/1.24.5.zip",
					"libTemplate": "sap.watt.toolsets.javascript/service/template/ui5/1.24.5.zip",
					"help": "https://sapui5.hana.ondemand.com/sdk/#docs/api/symbols/",
					"helpService": oJsApiReferenceService
				};
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

		it("Check [getWordSuggestions] for WuW env: case[1.1]", (function() {
			var oContentStatus = {
				buffer: "this.",
				offset: 5,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "context : Object"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for WuW env: case[1.2]", (function() {
			var oContentStatus = {
				buffer: "this.context.",
				offset: 13,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "service : Object"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for WuW env: case[1.3]", (function() {
			var oContentStatus = {
				buffer: "this.context.service",
				offset: 21,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "focus : Object"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for WuW env: case[1.4]", (function() {
			var oContentStatus = {
				buffer: "this.context.service.focus",
				offset: 27,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "function"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "setFocus(oService)"), "return expected proposal").to.be.true;
			});
		}));
		it("Check [getWordSuggestions] for WuW env: case[2.1]", (function() {
			var oContentStatus = {
				buffer: "var that = this;\nthat.",
				offset: 22,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "context : Object"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for WuW env: case[2.2]", (function() {
			var oContentStatus = {
				buffer: "var context = this.context;\ncontext.",
				offset: 36,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "service : Object"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for WuW env: case[2.3]", (function() {
			var oContentStatus = {
				buffer: "var service = this.context.service;\nservice.",
				offset: 44,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/watt.core.webapp/resources/sap/watt/platform/plugin/command/service/Command.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "focus : Object"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for WuW env: case[2.4]", (function() {
			var oContentStatus = {
				buffer: "var focus = this.context.service.focus;\nfocus.",
				offset: 46,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "function"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "setFocus(oService)"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for WuW env: case[3.1]", (function() {
			var oContentStatus = {
				buffer: "var that = this;\nthat.context.",
				offset: 30,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "service : Object"), "return expected proposal").to.be.true;
			});
		}));
		it("Check [getWordSuggestions] for WuW env: case[3.2]", (function() {
			var oContentStatus = {
				buffer: "var that = this;\nthat.context.service.",
				offset: 38,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "focus : Object"), "return expected proposal").to.be.true;
			});
		}));
		it("Check [getWordSuggestions] for WuW env: case[3.3]", (function() {
			var oContentStatus = {
				buffer: "var that = this;\nthat.context.service.focus.",
				offset: 44,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "function"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "setFocus(oService)"), "return expected proposal").to.be.true;
			});
		}));
		it("Check [getWordSuggestions] for WuW env: case[4.1]", (function() {
			var oContentStatus = {
				buffer: "var that = this;\nvar context = that.context;\ncontext.",
				offset: 53,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "service : Object"), "return expected proposal").to.be.true;
			});
		}));
		it("Check [getWordSuggestions] for WuW env: case[4.2]", (function() {
			var oContentStatus = {
				buffer: "var that = this;\nvar service = that.context.service;\nservice.",
				offset: 61,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "focus : Object"), "return expected proposal").to.be.true;
			});
		}));
		it("Check [getWordSuggestions] for WuW env: case[4.3]", (function() {
			var oContentStatus = {
				buffer: "var that = this;\nvar focus = that.context.service.focus;\nfocus.",
				offset: 63,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "function"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "setFocus(oService)"), "return expected proposal").to.be.true;
			});
		}));
		it("Check [getWordSuggestions] for WuW env: case[5.1]", (function() {
			var oContentStatus = {
				buffer: "var that = this;\nvar context = that.context;\nvar service = context.service;\nservice.",
				offset: 84,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "focus : Object"), "return expected proposal").to.be.true;
			});
		}));
		it("Check [getWordSuggestions] for WuW env: case[5.2]", (function() {
			var oContentStatus = {
				buffer: "var that = this;\nvar context = that.context;\nvar service = context.service;\nvar focus = service.focus;\nfocus.",
				offset: 109,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "function"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "setFocus(oService) : undefined"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for WuW env: plugin services", (function() {
			var oContentStatus = {
				buffer: "this.context.service.",
				offset: 21,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "focus : Object"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for WuW env: plugin service methods", (function() {
			var oContentStatus = {
				buffer: "this.context.service.focus.get",
				offset: 30,
				prefix: "get",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "function"), "return expected proposal").to.be.true;
			//	expect(checkProposal(proposals, "description", "getFocus()"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "getFocus() : sap.watt.common.service.ui.Part"), "return expected proposal").to.be
					.true;
			});
		}));

		it("Check [getWordSuggestions] for WuW env: Int. Msg. 1332768/2014", (function() {
			var oContentStatus = {
				buffer: 'sap.ui.jsview("sap.watt.common.plugin.gitclient.view.GitCloneDialog", {\n	createContent : function(oController) {\n		var oCloneURLLabel = new sap.ui.commons.\n});',
				offset: 155,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testPlugin/service/testServiceImpl.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				// no hang is ok
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
			});
		}));

		// Check for UI project doesn't show WuW proposals
		it("Check [getWordSuggestions] for non WuW env: no context proposals", (function() {
			var oContentStatus = {
				buffer: "this.",
				offset: 5,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				},
				targetFile: "/testUI/testCpmponent.js"
			};
			return getProposals(oContentStatus).then(function(result) {
				// no hang is ok
				expect(result).to.exist;
				var proposals = result.proposals;
				expect(proposals).to.exist;
				expect(checkProposal(proposals, "context", ""), "return expected proposal").to.be.false;
			});
		}));

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});
});