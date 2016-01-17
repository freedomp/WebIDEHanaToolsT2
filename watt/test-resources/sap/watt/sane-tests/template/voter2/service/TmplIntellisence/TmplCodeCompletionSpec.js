define(["STF", "sinon"] , function(STF) {

	"use strict";

	var suiteName = "TemplateAutoComplete_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oTmplCodeCompletionService, oFilesystem, oFakeFileDAO, oContentService, oIntellisenceService,
			oJsApiReferenceService;
		var aStubs = [];

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/voter2/service/TmplIntellisence/config.json"})
				.then(function () {
					oTmplCodeCompletionService = getService('tmplcodecompletion');
					oFilesystem = getService('filesystem.documentProvider');
					oFakeFileDAO = getService("fakeFileDAO");
					oContentService = getService("content");
					oIntellisenceService = getService("intellisence");
					oJsApiReferenceService = getService("jsapireference");
					return fnCreateFileStructure();

			});
		});

		afterEach(function () {
			aStubs.forEach(function(stub){
				stub.restore();
			});
			aStubs = [];

		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		var oFile1Doc;
		var sDOC1 = "{ \"listList\":{\"parameters\" :{\"List1Title\" :{\"type\" : \"string\",\"value\" : \"\", \"wizard\" : {\"control\" : \"TextField\",\"required\" : false,\"title\" : \"List1Title\"}}}}}";


		var fnCreateFileStructure = function() {
			return oFakeFileDAO.setContent({
				"test" : {
					"model.json" : sDOC1
				}
			}).then(function() {
				return Q.all([oFilesystem.getDocument("/test/model.json")]).spread(function(oDoc1) {
					oFile1Doc = oDoc1;
				});
			}).then(function() {
				return Q.all([oFile1Doc.reload()]);
			});
		};
		var MockDocument = function(sFullPath, sFileExtension, sContent, bIsReadOnly, bIsBlobContent) {
			this.sContent = sContent;
			this.bIsReadOnly = bIsReadOnly;
			this.bIsBlobContent = bIsBlobContent;
			this.extensionSeperator = '.';
			var oEntity = {
				sFileExtension: sFileExtension,
				sFullPath: sFullPath,
				getFullPath: function() {
					return sFullPath;
				},
				getFileExtension: function() {
					return sFileExtension;
				},
				getName: function() {
					return sFullPath;
				}

			};

			this.getEntity = function() {
				return oEntity;
			};

			this.getContent = function() {
				return Q(this.sContent);
			};

			this.setContent = function() {
				return Q();
			};

			this.isReadOnly = function() {
				return this.bIsReadOnly;
			};

			this.isBlobContent = function() {
				return this.bIsBlobContent;
			};

			this.isProject = function() {
				return false;
			};

			this.getProject = function() {
				return Q(this);
			};

			this.getFolderContent = function() {
				return Q(this.sContent);
			};
		};

		it("Test constant proposals", function(){
			var oContentStatus = {
				buffer: "{{pr",
				targetFile : "/test/resources/sample.js.tmpl",
				offset: 4,
				prefix: "pr"
			};

			return oFakeFileDAO.setContent({
				"test" : {
					"model.json" : sDOC1
				}
			}).then(function() {
				return oTmplCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					assert.ok(proposals && proposals.length > 0);
					assert.ok(proposals[0].proposal === "projectName", "return expected proposal");

				}).fail(function() {
				});
			}).then(function() {
			});
		});


		it("Test model proposals 1", function(){
			var oContentStatus = {
				buffer: "{{list",
				targetFile : "/test/resources/sample.js.tmpl",
				offset: 4,
				prefix: "list"
			};

			return oFakeFileDAO.setContent({
				"test" : {
					"model.json" : sDOC1
				}
			}).then(function() {
				return oTmplCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					assert.ok(proposals && proposals.length > 0);
					assert.ok(proposals[0].proposal === "listList", "return expected proposal");

				}).fail(function() {
				});
			}).then(function() {
			});
		});

		it("Test model proposals 1", function(){
			var oContentStatus = {
				buffer: "{{list",
				targetFile : "/test/resources/sample.js.tmpl",
				offset: 4,
				prefix: "list"
			};

			return oFakeFileDAO.setContent({
				"test" : {
					"model.json" : sDOC1
				}
			}).then(function() {
				return oTmplCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					assert.ok(proposals && proposals.length > 0);
					assert.ok(proposals[0].proposal === "listList", "return expected proposal");
				}).fail(function() {
				});
			}).then(function() {
			});
		});


		it("Test model proposals 2", function(){
			var oContentStatus = {
				buffer: "{{listList.parameters.List1Title",
				targetFile : "/test/resources/sample.js.tmpl",
				offset: 4,
				prefix: "listList.parameters.List1Title"
			};

			return oFakeFileDAO.setContent({
				"test" : {
					"model.json" : sDOC1
				}
			}).then(function() {
				return oTmplCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					assert.ok(proposals && proposals.length > 0);
					assert.ok(proposals[0].proposal === "listList", "return expected proposal");

				}).fail(function() {
				});
			}).then(function() {
			});
		});

		it("Test model proposals 3", function(){
			var oContentStatus = {
				buffer: "{{",
				targetFile : "/test/resources/sample.js.tmpl",
				offset: 4,
				prefix: ""
			};

			return oFakeFileDAO.setContent({
				"test" : {
					"model.json" : sDOC1
				}
			}).then(function() {
				return oTmplCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					assert.ok(proposals && proposals.length === 4);

				}).fail(function() {
				});
			}).then(function() {
			});
		});


		it("Test js proposals", function(){
			var oConfig = {
				"id": "js",
				"name": "sapui5",
				"version": "1.24.5",
				"libIndexFile": "sap.watt.toolsets.javascript/service/indexFiles/ui5/1.24.5.zip",
				"libTemplate": "sap.watt.toolsets.javascript/service/template/ui5/1.24.5.zip",
				"help": "https://sapui5.hana.ondemand.com/sdk/#docs/api/symbols/",
				"helpService": oJsApiReferenceService
			};
			var oDocument = new MockDocument("new/doc.js", "js", "", false, false);
			aStubs.push(sinon.stub(oIntellisenceService, "getCalculatedLibraries").returns(Q([oConfig])));
			aStubs.push(sinon.stub(oContentService, "getCurrentDocument").returns(Q(oDocument)));
			var oContentStatus = {
				buffer: " ",
				targetFile : "/test/resources/sample.js.tmpl",
				offset: 4,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			return oFakeFileDAO.setContent({
				"test" : {
					"model.json" : sDOC1
				}
			}).then(function() {
				return oTmplCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					assert.ok(proposals && proposals.length > 100);
					getIntellienseStub.restore();
					getDocumentFromContent.restore();
				}).fail(function() {
				});
			}).then(function() {
			});
		});


		it("Test xml proposals", function(){
			var oConfig = {
				"id": "xml",
				"name": "sapui5",
				"version": "1.24.5",
				"libTemplate": "sap.watt.toolsets.xml/service/template/ui5/1.24.5.zip",
				"libMetadata": "sap.watt.toolsets.xml/service/metadata/ui5/1.24.5.zip"
			};
			var oDocument = new MockDocument("new/doc.js", "js", "", false, false);
			aStubs.push(sinon.stub(oIntellisenceService, "getCalculatedLibraries").returns(Q([oConfig])));
			aStubs.push(sinon.stub(oContentService, "getCurrentDocument").returns(Q(oDocument)));
			var oContentStatus = {
				buffer: " ",
				targetFile : "/test/resources/sample.xml.tmpl",
				offset: 4,
				prefix: ""
			};

			return oFakeFileDAO.setContent({
				"test" : {
					"model.json" : sDOC1
				}
			}).then(function() {
				return oTmplCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					assert.ok(proposals && proposals.length > 0);
					getIntellienseStub.restore();
					getDocumentFromContent.restore();
				}).fail(function() {
				});
			}).then(function() {
			});
		});

		it("Test invalid proposals", function(){
			var oContentStatus = {
				buffer: " ",
				targetFile : "/test/resources/sample.mmm.tmpl",
				offset: 4,
				prefix: ""
			};

			return oFakeFileDAO.setContent({
				"test" : {
					"model.json" : sDOC1
				}
			}).then(function() {
				return oTmplCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					assert.ok(proposals && proposals.length === 0);

				}).fail(function() {
				});
			}).then(function() {
			});
		});


		it("Test help URL", function(){
			var oContentStatus = {
				buffer: "{{listList.parameters.List1Title",
				targetFile : "/test/resources/sample.js.tmpl",
				offset: 4,
				prefix: "listList.parameters.List1Title"
			};

			return oFakeFileDAO.setContent({
				"test" : {
					"model.json" : sDOC1
				}
			}).then(function() {
				return oTmplCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					assert.ok(proposals && proposals.length > 0);
					assert.ok(proposals[0].proposal === "listList", "return expected proposal");
					assert.equal(proposals[0].helpUrl.indexOf(sap.watt.getEnv("help_url"))>-1, true, "Got the right Help URL");
				}).fail(function() {
				});
			}).then(function() {
			});
		});

	});
});
