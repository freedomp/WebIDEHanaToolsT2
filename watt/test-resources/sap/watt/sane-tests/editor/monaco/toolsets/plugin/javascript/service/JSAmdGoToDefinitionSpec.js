//  The SaneTestFramework should be imported via 'STF' path.
define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "jsDefinition_service_tests";
	var oFakeFileDAOService;
	var oDefinitionService;
	var oRepositoryBrowserService;
	var oEditorService;
	var oSelectionService;
	var oDocumentService;
	var sTestFileContent;
	var sandbox;

	function getOffsetAfter(sBuffer, sText) {
		return sBuffer.indexOf(sText) + sText.length;
	}

	function highlightResultStub(oDefResult) {
		expect(oDefResult).to.not.equal(null);
	}

	function setSelectionStub(oDocument, bExpand) {
		return Q();
	}

	function getDefaultEditor(oDocument) {
		return Q({
			id: "ace",
			service: STF.getService(suiteName, "aceeditor")
		});
	}

	function getSelectionOwner() {
		return Q(STF.getService(suiteName, "aceeditor"));
	}

	describe("JavaScript AMD CrossFile Go To Definition Tests", function() {
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "editor/monaco/toolsets/plugin/javascript/service/config.json"
			}).
			then(function(webIdeWindowObj) {
				var Q = webIdeWindowObj.Q;
				oDefinitionService = STF.getService(suiteName, "jsdefinition");
				sandbox = sinon.sandbox.create();
				sandbox.stub(oDefinitionService, "highlightResult", highlightResultStub);

				// Stub for services.repositorybrowser.setSelection(document, true)
				oRepositoryBrowserService = STF.getService(suiteName, "repositorybrowser");
				sandbox.stub(oRepositoryBrowserService, "setSelection", setSelectionStub);

				// Stub for Editor getDefaultEditor
				oEditorService = STF.getService(suiteName, "editor");
				sandbox.stub(oEditorService, "getDefaultEditor", getDefaultEditor);

				// Stub for Selection.getOwner
				oSelectionService = STF.getService(suiteName, "selection");
				sandbox.stub(oSelectionService, "getOwner", getSelectionOwner);

				oDocumentService = STF.getService(suiteName, "document");

				oFakeFileDAOService = STF.getService(suiteName, "fakeFileDAO");
				sandbox.stub(oFakeFileDAOService, "search", function(oCriteria) {	
					if (oCriteria.sSearchTerm === "Component") {
						return this.getDocument("/sap.watt.coretest.sane/webapp/Component.js").then(function(oDoc) {
							return {aFileEntries: [oDoc], numFound: 1};
						});
					}
					return Q({aFileEntries: [], numFound: 0});
				});
				return STF.require(suiteName, [
					"sane-tests/editor/monaco/toolsets/plugin/javascript/service/testData/UI5AmdCrossFileTestData"
				]);
			}).spread(function(oFileStructure) {
				sTestFileContent = oFileStructure["sap.watt.coretest.sane"].webapp["targetUI5Amd.js"];
				return oFakeFileDAOService.setContent(oFileStructure);
			});
		});

		after(function() {
			sandbox.restore();
			STF.shutdownWebIde(suiteName);
		});

		describe("CrossFile Go To Definition tests for UI5 modules", function() {
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

			var aTests = [{
				title: "Should navigate to amdUtil.js utilMethod() definition",
				offset: "this._depAmdUtil.u",
				prefix: "u",
				expectedResult: {
					target: "/sap.watt.coretest.sane/webapp/util/amdUtil.js",
					pos: "utilMethod"
				}
			}, { 
				title: "Should navigate to amdUtil.js methodInConstructor() definition",
				offset: "this._depAmdUtil.m",
				prefix: "m",
				expectedResult: {
					target: "/sap.watt.coretest.sane/webapp/util/amdUtil.js",
					pos: "methodInConstructor ="
				}
			}, {
				title: "Should navigate to amdControl.js controlProperty definition from generated getter function",
				offset: "this._depAmdControl.get",
				prefix: "get",
				expectedResult: {
					target: "/sap.watt.coretest.sane/webapp/amdControl.js",
					pos: 'controlProperty : "string"'
				}
			}, {
				title: "Should navigate to amdControl.js controlProperty definition from generated setter function",
				offset: "this._depAmdControl.set",
				prefix: "set",
				expectedResult: {
					target: "/sap.watt.coretest.sane/webapp/amdControl.js",
					pos: 'controlProperty : "string"'
				}
			}, {
				title: "Should navigate to amdControl.js label2 definition from generated aggregation getter function",
				offset: "this._depAmdControl.getL",
				prefix: "getL",
				expectedResult: {
					target: "/sap.watt.coretest.sane/webapp/amdControl.js",
					pos: 'label2 : {type : "sap.ui.commons.Label", multiple: true, visibility : "public"}'
				}
			}, {
				title: "Should navigate to amdControl.js testChange definition from generated event function",
				offset: "this._depAmdControl.att",
				prefix: "att",
				expectedResult: {
					target: "/sap.watt.coretest.sane/webapp/amdControl.js",
					pos: 'testChange : { parameters : {value : {type : "string"}}}'
				}
			}, {
				title: "Should navigate to to amdControl.js override of generated property getter function",
				offset: "this._depAmdControl.getControlNew",
				prefix: "getControlNew",
				expectedResult: {
					target: "/sap.watt.coretest.sane/webapp/amdControl.js",
					pos: "getControlNewProperty"
				}
			}, { 
				title: "Should not navigate to to amdNotFound.js and not fall",
				offset: "this._depNotFound.methodN",
				prefix: "methodN",
				expectedResult: {
					target: "/sap.watt.coretest.sane/webapp/targetUI5Amd.js",
					pos: "this._depNotFound.methodN",
					negative: true
				}
			}, { 
				title: "Should not navigate to to amdErroredControl.js and not fall",
				offset: "this._depAndErroredControl.controlM",
				prefix: "controlM",
				expectedResult: {
					target: "/sap.watt.coretest.sane/webapp/amdErroredControl.js",
					pos: "controlMethod",
					negative: true
				}
			}, { 
				title: "Should navigate to a method of a module defined with absolute path",
				offset: "this._depAmdUtil2.",
				prefix: "",
				expectedResult: {
					target: "/sap.watt.coretest.sane/webapp/util/amdUtil2.js",
					pos: "utilMethod"
				}
			}];

			var oDeferred;
			
			aTests.forEach(function(oTest) {
				it(oTest.title, function() {
					
					oDeferred = Q.defer();

					oDocumentService.getDocumentByPath(oTest.expectedResult.target).then(function(oDocument) {
						return oDocument.getContent();
					}).then(function(sContent) {
						oTest.expectedResult.pos = sContent.indexOf(oTest.expectedResult.pos);
						oDefinitionService.attachEventOnce("navigationRequested", function(oEvent) {
							oDeferred.resolve(oEvent);
						});
						oContentStatus.offset = getOffsetAfter(oContentStatus.buffer, oTest.offset);
						oContentStatus.prefix = oTest.prefix || "";
						return oDefinitionService.gotoDefinition(oContentStatus);
					}).fail(function(oEvent){
						console.log(oEvent.message);
					}).done();
					
					return oDeferred.promise.then(function(oEvent) {
						if (!oTest.expectedResult.negative) {
							expect(oEvent.params.sTarget).to.not.equal(null);
							expect(oEvent.params.sTarget).to.equal(oTest.expectedResult.target);
							expect(oEvent.params.oCoordinates[0]).to.equal(oTest.expectedResult.pos);
						} else {
							expect(oEvent.params.sTarget).to.equal(undefined);
							expect(oEvent.params.oCoordinates).to.equal(undefined);
						}
					});
				});
			});
		});
	});
});