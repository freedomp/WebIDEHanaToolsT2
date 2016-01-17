//  The SaneTestFramework should be imported via 'STF' path.
define(["STF", "sinon", "sap/watt/lib/lodash/lodash"], function(STF, sinon, _) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "jsCrossInFileCoco_service_tests";
	var oJSCocoService;
	var oIntellisenceService;
	var oFakeFileDAOService;
	var sTestFileContent;
	var sTestFileContentDR;
	var sandbox;
	var aSuite = [{
		suiteTitle: "AMD In File Code Completion tests for UI5 modules",
		buffer: "", //sTestFileContent,
		targetFile: "/sap.watt.coretest.sane/amdControl.js"
	}, {
		suiteTitle: "declare Require In File Code Completion tests for UI5 modules",
		buffer: "", //sTestFileContentDR,
		targetFile: "/sap.watt.coretest.sane/declareRequireControl.js"
	}];

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

	describe("JavaScript In File Code Completion Tests", function() {
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "editor/monaco/toolsets/plugin/javascript/service/config.json"
			}).
			then(function(webIdeWindowObj) {
				var Q = webIdeWindowObj.Q;
				oIntellisenceService = STF.getService(suiteName, "intellisence");
				sandbox = sinon.sandbox.create();
				sandbox.stub(oIntellisenceService, "getCalculatedLibraries").returns(Q());
				oJSCocoService = STF.getService(suiteName, "jscodecompletion");
				oFakeFileDAOService = STF.getService(suiteName, "fakeFileDAO");
				return STF.require(suiteName, [
					"sane-tests/editor/monaco/toolsets/plugin/javascript/service/testData/UI5InFileTestData",
					"sap.watt.toolsets.javascript/service/watt/pluginProposalUtil"
				]);
			}).spread(function(oFileStructure, oPluginProposalUtil) {
				sTestFileContent = oFileStructure["sap.watt.coretest.sane"]["amdControl.js"];
				sTestFileContentDR = oFileStructure["sap.watt.coretest.sane"]["declareRequireControl.js"];
				sandbox.stub(oPluginProposalUtil, "getPlugin").returns(Q());
				return oFakeFileDAOService.setContent(oFileStructure);
			});
		});

		after(function() {
			sandbox.restore();
			STF.shutdownWebIde(suiteName);
		});
		describe("Single File Code Completion", function() {
			before(function() {
				aSuite[0].buffer = sTestFileContent;
				aSuite[1].buffer = sTestFileContentDR;
			});
			aSuite.forEach(function(sSuite) {
				describe(sSuite.suiteTitle, function() {

					var oContentStatus;

					before(function() {
						oContentStatus = {
							buffer: sSuite.buffer,
							coords: {
								pageX: 0,
								pageY: 0
							},
							targetFile: sSuite.targetFile
						};
					});

					var aTests = [
						/**
						 * UI5 Dependencies control setter getter generated methods tests
						 */
						{
							title: "Should get proposal for generated setters and getters dependencies",
							offset: "var sTest2 = this.",
							prefix: "",
							expectedProposals: [
								"setProperty1(property1) : undefined",
								"setProperty2(property2) : undefined",
								"getProperty1() : {type:String,defaultValue:String}",
								"getProperty2() : {type:String,defaultValue:String}"
							]
						},

						/**
						 * UI5 Dependencies generated event control visibility tests
						 */
						{
							title: "Should get proposal for Control event getter methods",
							offset: "var sTest2 = this.",
							prefix: "",
							expectedProposals: [
								"fireTestChange(arguments) : Object",
								"detachTestChange(fnFunction, oListener) : Object",
								"attachTestChange(oData, fnFunction, oListener) : Object"
							]
						},

						/**
						 * UI5 Dependencies generated associations control visibility tests
						 */
						{
							title: "Should get proposal for Control property getter methods",
							offset: "var sTest2 = this.",
							prefix: "",
							expectedProposals: [
								"getTestAssoc() : {type:String,multiple:Boolean}",
								"setTestAssoc(testAssoc) : undefined",
								"getTestAssocPublicSingularNames() : {type:String,multiple:Boolean,visibility:String,singularName:String}",
								"addTestAssocPublicSingularName(testAssocPublicSingularName) : Object",
								"removeTestAssocPublicSingularName(testAssocPublicSingularName) : {type:String,multiple:Boolean,visibility:String,singularName:String}",
								"removeAllTestAssocPublicSingularName() : Array",
								"removeTestAssocMulti(testAssocMulti) : {type:String,multiple:Boolean}",
								"getTestAssocBindable() : {type:String,multiple:Boolean,bindable:Boolean}",
								"setTestAssocBindable(testAssocBindable) : undefined"
							],
							unexpectedProposals: [
								"setTestAssocPublicSingularName(testAssocPublicSingularName)",
								"removeTestAssoc(testAssoc) : {type:String,multiple:Boolean}",
								"removeTestAssocBindable(testAssocBindable) : {type:String,multiple:Boolean,bindable:Boolean}"
							]
						},

						/**
						 * UI5 Dependencies control aggregations visisbility tests
						 */
						{
							title: "Should get proposal for visible dependencies",
							offset: "var sTest2 = this.",
							prefix: "",
							expectedProposals: [
								"get_label1() : {type:String,multiple:Boolean,visibility:String}",
								"set_label1(_label1) : undefined",
								"destroy_label1(bSuppressInvalidate) : Object",
								"getLabel2() : {type:String,multiple:Boolean,visibility:String}",
								"addLabel2(label2) : Object",
								"destroyLabel2(bSuppressInvalidate) : Object"
								//"setAggregation : {}",// support for inherited controls not yet implemented
								//"getAggregation : {}"// support for inherited controls not yet implemented
							],
							unexpectedResults: [
								"add_label1(_label1) : Object",
								"setLabel2(label2) : Object"
							]
						},

						/**
						 * Javascript method scope visibility tests
						 */
						{
							title: "Should get proposal for Method scope objects",
							offset: "oNewTest.key = oTest.",
							prefix: "",
							expectedProposals: [
								"key : String",
								"value : String"
							]
						}
					];
					//FIXME need to fix the code to support this also in Declare/Require it is not working right now
					if (sSuite.targetFile === "/sap.watt.coretest.sane/amdControl.js" ){
						aTests.push( {
							title: "Should get proposal for Control Constructor (init) objects and method scope objects",
							offset: "var sTest2 = this._",
							prefix: "_",
							expectedProposals: [
								"_myPrivateValue : {}",
								"_sValue : String"
							]
						});
					}

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
	});
});