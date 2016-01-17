//  The SaneTestFramework should be imported via 'STF' path.
define(["STF", "sinon", "sap/watt/lib/lodash/lodash"], function(STF, sinon, _) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "jsCrossFileCoco_service_tests_amd";
	var oJSCocoService;
	var oIntellisenceService;
	var oFakeFileDAOService;
	var sTestFileContent;
	var oPluginProposalUtil;
	var sandbox;
	var oIndexManagerServiceImpl;
	var oFileStructure;

	function getOffsetAt(sBuffer, sText) {
		return sBuffer.indexOf(sText) + sText.length;
	}

	function isProposalExist(oResult, sProposalToFind) {
		var iIndex = _.findIndex(oResult.proposals, {
			"proposal": sProposalToFind.split(" : ")[0],
			"description": sProposalToFind
		});
		return iIndex !== -1;
	}

	describe("JavaScript CrossFile Code Completion Tests - AMD modules", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config: "editor/monaco/toolsets/plugin/javascript/service/config.json"}).
			then(function() {
				oIntellisenceService = STF.getService(suiteName, "intellisence");
				sandbox = sinon.sandbox.create();
				oJSCocoService = STF.getService(suiteName, "jscodecompletion");
				oFakeFileDAOService = STF.getService(suiteName, "fakeFileDAO");
				var oIndexManagerService = STF.getService(suiteName, "indexmanager");
				return STF.getServicePrivateImpl(oIndexManagerService);
			}).then(function(_oIndexManagerServiceImpl) {
				oIndexManagerServiceImpl = _oIndexManagerServiceImpl;
				return STF.require(suiteName, [
					"sane-tests/editor/monaco/toolsets/plugin/javascript/service/testData/UI5AmdCrossFileTestData",
					"sap.watt.toolsets.javascript/service/watt/pluginProposalUtil"
				]);
			}).spread(function(_oFileStructure, _oPluginProposalUtil) {
				oFileStructure = _oFileStructure;
				sTestFileContent = oFileStructure["sap.watt.coretest.sane"].webapp["targetUI5Amd.js"];
				oPluginProposalUtil = _oPluginProposalUtil;
				return oFakeFileDAOService.setContent(oFileStructure);
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("CrossFile Code Completion tests for UI5 AMD modules", function() {
			var oContentStatus;
			before(function() {
				oContentStatus = {
					buffer: sTestFileContent,
					coords: {
						pageX: 0,
						pageY: 0
					},
					targetFile: "/sap.watt.coretest.sane/webapp/targetUI5Amd.js"
				};
			});
			
			beforeEach(function() {
				sandbox.stub(oIntellisenceService, "getCalculatedLibraries").returns(Q());
				sandbox.stub(oPluginProposalUtil, "getPlugin").returns(Q());
			});
			
			afterEach(function() {
				sandbox.restore();
				oIndexManagerServiceImpl._getIndexUtil()._projectInfo = {};
			});

			var aTests = [
				/**
				 * UI5 AMD Dependency constructor tests
				 */
				{
					title: "Should get proposal for all visible dependencies",
					offset: "this._depAmdUtil = new dep",
					prefix: "dep",
					expectedProposals: [
						"depAmdComponent(sId, mSettings, oScope) : sap.watt.coretest.sane.Component",
						"depAmdControl(sId, mSettings, oScope) : sap.watt.coretest.sane.amdControl",
						"depAmdUtil(p1, p2) : sap.watt.coretest.sane.util.amdUtil",
						"depPureAmd(p1, p2) : MyModule"
						]
				},
				/**
				 * UI5 Dependencies component visisbility tests
				*/
				{
					title: "Should get proposal for Util methods",
					offset: "this._depAmdUtil.",
					prefix: "",
					expectedProposals: [
						"utilMethod(mp1) : Number",
						//FIXME - wrong arguments in proposals for method defined inside a constructor
						"methodInConstructor(num1) : Number"
						]
				},
				{
					title: "Should get proposal for Components methods",
					offset: "this._depAmdComponent.",
					prefix: "",
					expectedProposals: [
						"componentMethod(mp1) : {}"
						]
				},
				{
					title: "Should get proposal for Control methods",
					offset: "this._depAmdControl.",
					prefix: "",
					expectedProposals: [
						"controlMethod(mp1) : {}"
						]
				},
				{
					title: "Should get proposal for methods provided by plane AMD Module with Constructor function",
					offset: "this._depPureAmd.",
					prefix: "",
					expectedProposals: [
						"f1() : Object", "f2() : String"
						]
				},
				{
					title: "Should get proposal for methods provided by Sap AMD static Module",
					offset: "depStaticSapAmd.",
					prefix: "",
					expectedProposals: [
						"f113(p113) : String", "f123(p123) : String", "constructor(p1, p2) : undefined"
						]
				},

				/**
				 * UI5 Dependencies generated component visisbility tests
				*/
				{
					title: "Should get proposal for Component property getter methods",
					offset: "this._depAmdComponent.get",
					prefix: "get",
					expectedProposals: [
						"getComponentProperty() : String"
						]
				},
				{
					title: "Should get proposal for Component property setter methods",
					offset: "this._depAmdComponent.set",
					prefix: "set",
					expectedProposals: [
						"setComponentProperty(componentProperty) : undefined"
						]
				},
				{
					title: "Should get proposal for Control property getter methods",
					offset: "this._depAmdControl.get",
					prefix: "get",
					expectedProposals: [
						"getControlProperty() : String"
						]
				},
				{
					title: "Should get proposal for Control property setter methods",
					offset: "this._depAmdControl.set",
					prefix: "set",
					expectedProposals: [
						"setControlProperty(controlProperty) : undefined"
						]
				},
				{
					title: "Should get proposal for Util methods inside a module defined with absolute path",
					offset: "this._depAmdUtil2.",
					prefix: "",
					expectedProposals: [
						"utilMethod(mp1) : Number"
					],
					before: function() {
						sandbox.stub(oFakeFileDAOService, "search", function(oCriteria) {	
							if (oCriteria.sSearchTerm === "Component") {
								return this.getDocument("/sap.watt.coretest.sane/webapp/Component.js").then(function(oDoc) {
									return {aFileEntries: [oDoc], numFound: 1};
								});
							}
							return Q({aFileEntries: [], numFound: 0});
						});
					}
				},
				{
					title: "Should not get proposals for Util methods inside a module defined with absolute path - Component.js with a syntax error",
					offset: "this._depAmdUtil2.",
					prefix: "",
					unexpectedProposals: [
						"utilMethod(mp1) : Number"
					],
					before: function() {
						sandbox.stub(oFakeFileDAOService, "search", function(oCriteria) {	
							if (oCriteria.sSearchTerm === "Component") {
								return this.getDocument("/sap.watt.coretest.sane/webapp/ComponentWithSyntaxError.js").then(function(oDoc) {
									return {aFileEntries: [oDoc], numFound: 1};
								});
							}
							return Q({aFileEntries: [], numFound: 0});
						});
					}
				},
				{
					title: "Should not get proposals for Util methods inside a module defined with absolute path - Component.js without namespace",
					offset: "this._depAmdUtil2.",
					prefix: "",
					unexpectedProposals: [
						"utilMethod(mp1) : Number"
					],
					before: function() {
						sandbox.stub(oFakeFileDAOService, "search", function(oCriteria) {	
							if (oCriteria.sSearchTerm === "Component") {
								return this.getDocument("/sap.watt.coretest.sane/webapp/ComponentWithoutNamespace.js").then(function(oDoc) {
									return {aFileEntries: [oDoc], numFound: 1};
								});
							}
							return Q({aFileEntries: [], numFound: 0});
						});
					}
				}
			];

			aTests.forEach(function(oTest) {
				it(oTest.title, function() {
					if (oTest.before) {
						oTest.before();
					}
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
								expect(isProposalExist(oResult, sProposal), "Got an unexpected proposal: '" + sProposal + "'").to.equal(false);
							});
						}
					});	
				});
			});
		});
	});
});