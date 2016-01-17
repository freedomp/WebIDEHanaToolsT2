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

	describe("JavaScript CrossFile Go To Definition Tests", function() {
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
					"sane-tests/editor/monaco/toolsets/plugin/javascript/service/testData/crossFileTestData"
				]);
			}).spread(function(oFileStructure) {
				sTestFileContent = oFileStructure["sap.watt.coretest.sane"]["test.js"];
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
					targetFile: "/sap.watt.coretest.sane/test.js"
				};
			});

			var aTests = [{
				title: "Should navigate to TestModule0 definition",
				offset: "var myUtil = sap.watt.coretest.sane.util.",
				prefix: "",
				expectedResult: {
					target: "/sap.watt.coretest.sane/util/TestModule0.js",
					pos: "{"
				}
			}, {
				title: "Should navigate to TestModule0 setProp2 method definition",
				offset: "myUtil.",
				prefix: "",
				expectedResult: {
					target: "/sap.watt.coretest.sane/util/TestModule0.js",
					pos: "setProp2"
				}
			}, {
				title: "Should navigate to TestModuleExtend createContent method definition",
				offset: "myTestModuleExtend.creat",
				prefix: "",
				expectedResult: {
					target: "/sap.watt.coretest.sane/util/TestModuleExtend.js",
					pos: "createContent:"
				}
			}, {
				title: "Should navigate to TestModuleExtend documented method definition",
				offset: "myTestModuleExtend.doc",
				prefix: "doc",
				expectedResult: {
					target: "/sap.watt.coretest.sane/util/TestModuleExtend.js",
					pos: "documented:"
				}
			}, {
				title: "Should navigate to RefControl definition",
				offset: "var myControl = new sap.watt.coretest.sane.control.",
				prefix: "",
				expectedResult: {
					target: "/sap.watt.coretest.sane/control/RefControl.js",
					pos: "{"
				}
			}, {
				title: "Should navigate to RefControl property definition from getter",
				offset: "myControl.set",
				prefix: "set",
				expectedResult: {
					target: "/sap.watt.coretest.sane/control/RefControl.js",
					pos: "stringProp"
				}
			}, {
				title: "Should navigate to RefControl property definition from setter",
				offset: "myControl.get",
				prefix: "get",
				expectedResult: {
					target: "/sap.watt.coretest.sane/control/RefControl.js",
					pos: "stringProp"
				}
			}, {
				title: "Should navigate to RefControl liveChange event definition",
				offset: "myControl.att",
				prefix: "att",
				expectedResult: {
					target: "/sap.watt.coretest.sane/control/RefControl.js",
					pos: "liveChange"
				}
			}, {
				title: "Should navigate to RefControl aggregation definition",
				offset: "myControl.getCov",
				prefix: "getCov",
				expectedResult: {
					target: "/sap.watt.coretest.sane/control/RefControl.js",
					pos: "coverPicture"
				}
			}, {
				title: "Should navigate to RefControl association definition",
				offset: "myControl.setRel",
				prefix: "setRel",
				expectedResult: {
					target: "/sap.watt.coretest.sane/control/RefControl.js",
					pos: "relatedBooks"
				}
			}, {
				title: "Should navigate to TestViewImpl constructor",
				offset: "var myView = new sap.watt.coretest.sane.view.Test",
				prefix: "Test",
				expectedResult: {
					target: "/sap.watt.coretest.sane/view/TestViewImpl.js",
					pos: "sap.watt.coretest.sane.view.TestViewImpl = function(oView, fnOnClose)"
				}
			}, {
				title: "Should navigate to TestViewImpl open method",
				offset: "myView.op",
				prefix: "op",
				expectedResult: {
					target: "/sap.watt.coretest.sane/view/TestViewImpl.js",
					pos: "open"
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
					}).done();
					
					return oDeferred.promise.then(function(oEvent) {
						expect(oEvent.params.sTarget).to.not.equal(null);
						expect(oEvent.params.sTarget).to.equal(oTest.expectedResult.target);
						expect(oEvent.params.oCoordinates[0]).to.equal(oTest.expectedResult.pos);
					});
				});
			});
		});
	});
});