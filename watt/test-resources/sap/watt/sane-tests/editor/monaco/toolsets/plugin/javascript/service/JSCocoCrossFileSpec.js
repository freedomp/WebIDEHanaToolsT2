//  The SaneTestFramework should be imported via 'STF' path.
define(["STF", "sinon", "sap/watt/lib/lodash/lodash"], function(STF, sinon, _) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "jsCrossFileCoco_service_tests";
	var oJSCocoService;
	var oIntellisenceService;
	var oFakeFileDAOService;
	var sTestFileContent;
	var sandbox;

	function getOffsetAt(sBuffer, sText) {
		return sBuffer.indexOf(sText) + sText.length;
	}

	function isProposalExist(oResult, sProposalToFind) {
		var iIndex = _.findIndex(oResult.proposals, {
			"proposal": sProposalToFind
		});
		return iIndex !== -1;
	}

	describe("JavaScript CrossFile Code Completion Tests", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config: "editor/monaco/toolsets/plugin/javascript/service/config.json"}).
			then(function(webIdeWindowObj) {
				var Q = webIdeWindowObj.Q;
				oIntellisenceService = STF.getService(suiteName, "intellisence");
				sandbox = sinon.sandbox.create();
				sandbox.stub(oIntellisenceService, "getCalculatedLibraries").returns(Q());
				oJSCocoService = STF.getService(suiteName, "jscodecompletion");
				oFakeFileDAOService = STF.getService(suiteName, "fakeFileDAO");
				sandbox.stub(oFakeFileDAOService, "search", function(oCriteria) {
					if (oCriteria.bContentSearch && oCriteria.sSearchTerm === "jQuery.sap.declare") {
						var aPromises = [
							this.getDocument("/sap.watt.coretest.sane/test.js"),
							this.getDocument("/sap.watt.coretest.sane/util/TestModule0.js"),
							this.getDocument("/sap.watt.coretest.sane/util/TestModule1.js"),
							this.getDocument("/sap.watt.coretest.sane/util/TestModuleExtend.js"),
							this.getDocument("/sap.watt.coretest.sane/control/RefControl.js"),
							this.getDocument("/sap.watt.coretest.sane/view/TestViewImpl.js")
						];
						return Q.all(aPromises).then(function(aDocs) {
							return Q({aFileEntries: aDocs, numFound: 6});
						});
					}
					return Q({aFileEntries: [], numFound: 0});
				});
				return STF.require(suiteName, [
					"sane-tests/editor/monaco/toolsets/plugin/javascript/service/testData/crossFileTestData",
					"sap.watt.toolsets.javascript/service/watt/pluginProposalUtil"
				]);
			}).spread(function(oFileStructure, oPluginProposalUtil) {
				sTestFileContent = oFileStructure["sap.watt.coretest.sane"]["test.js"];
				sandbox.stub(oPluginProposalUtil, "getPlugin").returns(Q());
				return oFakeFileDAOService.setContent(oFileStructure);
			});
		});

		after(function() {
			sandbox.restore();
			STF.shutdownWebIde(suiteName);
		});

		describe("CrossFile Code Completion tests for UI5 modules", function() {
			var oContentStatus;
			before(function() {
				oContentStatus = {
					buffer: sTestFileContent,
					coords: {
						pageX: 0,
						pageY: 0
					},
					targetFile: "/sap.watt.coretest.sane/test.js"
				};
			});

			var aTests = [
				/**
				 * Namespace proposals tests
				 */
				{
					title: "Should get proposal for first level namespace",
					offset: "var myUtil = s",
					prefix: "s",
					expectedProposals: ["sap"]
				},
				{
					title: "Should get proposal for second level namespace",
					offset: "var myUtil = sap.",
					prefix: "",
					expectedProposals: ["watt"]
				},
				{
					title: "Should get proposal for third level namespace",
					offset: "var myUtil = sap.watt.",
					prefix: "",
					expectedProposals: ["coretest"]
				},
				{
					title: "Should get proposal for fourth level namespace",
					offset: "var myUtil = sap.watt.coretest.",
					prefix: "",
					expectedProposals: ["sane"]
				},
				{
					title: "Should get proposal for fifth level namespace",
					offset: "var myUtil = sap.watt.coretest.sane.",
					prefix: "",
					expectedProposals: ["util", "control"]
				},
				/**
				 * Static modules proposals tests
				 */
				{
					title: "Should get proposal for Regular UI5 modules by namespace",
					offset: "var myUtil = sap.watt.coretest.sane.util.",
					prefix: "",
					expectedProposals: [ "TestModuleExtend(sId, mSettings, oScope)", "TestModule0", "TestModule1"]
				},
				{
					title: "Should get attributes and methods proposals for a regular UI5 module",
					offset: "myUtil.",
					prefix: "",
					expectedProposals: ["sProp1", "bProp2", "getProp1()", "setProp2(bProp2)"]
				},
				/**
				 * SAPUI5 Control proposals tests with generated accessor methods
				 */
				{
					title: "Should get proposal for constructor of UI5 extension module by it's namespace",
					offset: "var myControl = new sap.watt.coretest.sane.control.",
					prefix: "",
					expectedProposals: ["RefControl(sId, mSettings, oScope)"]
				},
				{
					title: "Should get regular methods proposals for a UI5 extension module",
					offset: "myControl.",
					prefix: "",
					expectedProposals: ["calculateString(myStrArg)"]
				},
				{
					title: "Should get metadata properties generated methods proposals for a UI5 extension module",
					offset: "myControl.",
					prefix: "",
					expectedProposals: [
						"getStringProp()",
						"setStringProp(stringProp)"
					]
				},
				{
					title: "Should get metadata events generated methods events for a UI5 extension module",
					offset: "myControl.",
					prefix: "",
					expectedProposals: [
						"attachLiveChange(oData, fnFunction, oListener)",
						"detachLiveChange(fnFunction, oListener)",
						"fireLiveChange(arguments)"
					]
				},
				{
					title: "Should get metadata associations generated methods associations for a UI5 extension module",
					offset: "myControl.",
					prefix: "",
					expectedProposals: [
						"getRelatedBooks()",
						"setRelatedBooks(relatedBooks)",
						"getRelatedItems()",
						"addRelatedItem(relatedItem)",
						"removeRelatedItem(relatedItem)",
						"removeAllRelatedItem()",
						"getRelatedThings()",
						"setRelatedThings(relatedThings)",
						"getRelatedStudents()",
						"addRelatedStudent(relatedStudent)",
						"removeRelatedStudent(relatedStudent)",
						"removeAllRelatedStudent()"
					],
					unexpectedProposals: [
						"addRelatedBook(relatedBook)",
						"removeRelatedBook(relatedBook)",
						"removeAllRelatedBook()",
						"setRelatedItems(relatedItems)",
						"addRelatedThing(relatedThing)",
						"removeRelatedThing(relatedThing)",
						"removeAllRelatedThing()",
						"setRelatedStudents(relatedStudents)"
					]
				},
				/**
				 * SAPUI5 javascript View proposals
				 */
				{
					title: "Should get proposal for implemented javascript view by namespace",
					offset: "var myView = new sap.watt.coretest.sane.view.",
					prefix: "",
					expectedProposals: ["TestViewImpl(oView, fnOnClose)"]
				},
				{
					title: "Should get proposal for implemented javascript view method",
					offset: "myView.",
					prefix: "",
					expectedProposals: ["open(bExcludeTemporaryContacts)"]
				},
				/**
				 * Unexisting module
				 */
				{
					title: "Should not get proposal for required module that is non existing",
					offset: "var myUtil = sap.watt.coretest.sane.util.",
					prefix: "",
					unexpectedProposals: ["UnexistingModule"]
				},
				/**
				 * SAPUI5 Module extending Component proposals
				 */
				{
					title: "Should get proposal for method inside component extension module",
					offset: "myTestModuleExtend.c",
					prefix: "c",
					expectedProposals: ["createContent()"]
				},
				{
					title: "Should get proposal for documented method inside component extension module",
					offset: "myTestModuleExtend.d",
					prefix: "d",
					expectedProposals: ["documented(pObj, pStr)"]
				}
			];

			aTests.forEach(function(oTest) {
				it(oTest.title, function() {
					oContentStatus.offset = getOffsetAt(oContentStatus.buffer, oTest.offset);
					oContentStatus.prefix = oTest.prefix || "";
					return oJSCocoService.getWordSuggestions(oContentStatus).then(function(oResult) {
						if (oTest.expectedProposals) {
							oTest.expectedProposals.forEach(function(sProposal) {
								expect(isProposalExist(oResult, sProposal), "proposal '" + sProposal + "' was not found").to.equal(true);
							});
						}
						if (oTest.unexpectedProposals) {
							oTest.unexpectedProposals.forEach(function(sProposal) {
								expect(isProposalExist(oResult, sProposal), "Go an unexpected proposal: '" + sProposal + "'").to.equal(false);
							});
						}
					});
				});
			});
		});
	});
});