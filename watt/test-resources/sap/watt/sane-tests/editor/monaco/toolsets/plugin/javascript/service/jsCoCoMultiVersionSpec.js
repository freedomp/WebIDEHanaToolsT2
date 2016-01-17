define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "js_co_co_multiversion_service_tests";
	var suiteWindowObj;
	var sandbox;
	var oJSCodeCompletionService;
	var oJsApiReferenceService;
	var oContentService;
	var MockFileDocument;
	var oConfig;
	var oIntellisenceService;
	var sUrl = window.location.origin + require.toUrl("editor/monaco/toolsets/plugin/javascript/service");

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

	describe("JS Co Co Multi version Service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "editor/monaco/toolsets/plugin/javascript/service/config.json"
			}).
			then(function(webIdeWindowObj) {
				suiteWindowObj = webIdeWindowObj;
				oJSCodeCompletionService = STF.getService(suiteName, "jscodecompletion");
				oJsApiReferenceService = STF.getService(suiteName, "jsapireference");
				oContentService = STF.getService(suiteName, "content");
				oIntellisenceService = STF.getService(suiteName, "intellisence");

				return STF.require(suiteName, [
					"sane-tests/util/mockDocument"
				]);
			}).spread(function(oMockDocument) {
				MockFileDocument = oMockDocument.MockFileDocument;
			});
		});

		beforeEach(function() {
			sandbox = sinon.sandbox.create();
			var oDocument = new MockFileDocument("new/doc.js", "js", "");
			sandbox.stub(oContentService, "getCurrentDocument").returns(Q(oDocument));
			sandbox.stub(oIntellisenceService, "getCalculatedLibraries").returns(Q(oConfig));
		});

		afterEach(function() {
			sandbox.restore();
		});

		describe("JS Co Co Multi version 1.88 Service", function() {
			before(function() {
				oConfig = [{
					"id": "js",
					"name": "sapui5",
					"version": "1.88.88",
					"libIndexFile": sUrl + "/indexFiles/1.88.88.zip",
					"libTemplate": "sap.watt.toolsets.javascript/service/template/ui5/1.24.5.zip",
					"help": "https://sapui5.hana.ondemand.com/sdk/#docs/api/symbols/",
					"helpService": oJsApiReferenceService
				}];
			});

			it("Check [getWordSuggestions] for UI5: static method 'getRouterFor' in 'sap.ui.core.UIComponent Old'", (function() {
				var oContentStatus = {
					buffer: "sap.ui.core.UIComponent.",
					offset: 24,
					prefix: "",
					coords: {
						pageX: 14,
						pageY: 2
					}
				};
				// TODO: Set version 1.88.88

				return getProposals(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					expect(proposals).to.exist;
					expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(0);
					expect(checkProposal(proposals, "description", "getRouterFor(either) : sap.ui.core.routing.Router"), "return expected proposal")
						.to
						.be.true;
				});
			}));

		});

		describe("JS Co Co Multi version 1.99 Service", function() {
			before(function() {
				oConfig = [{
					"id": "js",
					"name": "sapui5",
					"version": "1.99.99",
					"libIndexFile": sUrl + "/indexFiles/1.99.99.zip",
					"libTemplate": "sap.watt.toolsets.javascript/service/template/ui5/1.24.5.zip",
					"help": "https://sapui5.hana.ondemand.com/sdk/#docs/api/symbols/",
					"helpService": oJsApiReferenceService
				}];
			});

			it("Check [getWordSuggestions] for UI5: static method 'getRouterFor' in 'sap.ui.core.UIComponent New'", (function() {
				var oContentStatus = {
					buffer: "sap.ui.core.UIComponentNew.",
					offset: 27,
					prefix: "",
					coords: {
						pageX: 14,
						pageY: 2
					}
				};
				// TODO: Set version 1.88.88

				return getProposals(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					expect(proposals).to.exist;
					expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(0);
					expect(checkProposal(proposals, "description", "getRouterFor(either) : sap.ui.core.routing.Router"), "return expected proposal")
						.to.be.true;
				});
			}));

			it("Check [getWordSuggestions] for UI5: static method 'getRouterNew' in 'sap.ui.core.UIComponent'", (function() {
				var oContentStatus = {
					buffer: "sap.ui.core.UIComponentNew.",
					offset: 27,
					prefix: "",
					coords: {
						pageX: 14,
						pageY: 2
					}
				};
				// TODO: Set version 1.99.99

				return getProposals(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					expect(proposals).to.exist;
					expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(0);
					expect(checkProposal(proposals, "description", "getRouterForNew(either) : sap.ui.core.routing.Router"),
						"return expected proposal").to.be.true;
				});
			}));

		});

		describe("JS Co Co Multi version 1.88 Service", function() {
			before(function() {
				oConfig = [{
					"id": "js",
					"name": "sapui5",
					"version": "1.88.88",
					"libIndexFile": sUrl + "/indexFiles/1.88.88.zip",
					"libTemplate": "sap.watt.toolsets.javascript/service/template/ui5/1.24.5.zip",
					"help": "https://sapui5.hana.ondemand.com/sdk/#docs/api/symbols/",
					"helpService": oJsApiReferenceService
				}];
			});

			it("Negative Check [getWordSuggestions] for UI5: static method 'getRouterFor' in 'sap.ui.core.UIComponent New'", (function() {
				var oContentStatus = {
					buffer: "sap.ui.core.UIComponentNew.",
					offset: 27,
					prefix: "",
					coords: {
						pageX: 14,
						pageY: 2
					}
				};
				// TODO: Set version 1.88.88

				return getProposals(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					var bObject = true;
					var iArrayLength = result.proposals.length;
					for (var i = 0; i < iArrayLength; i++) {
						if (result.proposals[i].category !== "object") {
							bObject = false;
						}
					}
					expect(bObject, "Only object code completion suggestions exist").to.exist;
				});
			}));

			it("Negative Check [getWordSuggestions] for UI5: static method 'getRouterForNew' in 'sap.ui.core.UIComponent New'", (function() {
				var oContentStatus = {
					buffer: "sap.ui.core.UIComponent.",
					offset: 24,
					prefix: "",
					coords: {
						pageX: 14,
						pageY: 2
					}
				};
				// TODO: Set version 1.88.88

				return getProposals(oContentStatus).then(function(result) {
					var proposals = result.proposals;
					expect(proposals).to.exist;
					expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(0);
					expect(checkProposal(proposals, "description", "getRouterForNew(either) : sap.ui.core.routing.RouterNew"),
						"return expected proposal").to.be.false;
				});
			}));

		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});

});