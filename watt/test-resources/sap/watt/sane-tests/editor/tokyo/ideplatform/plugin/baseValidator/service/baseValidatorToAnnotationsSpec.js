//  The SaneTestFramework should be imported via 'STF' path.
define(['STF'], function (STF) {
	"use strict";

	var sandbox;
	var suiteName = "service_baseValidator";

	var oProjectService, oContentService, oBaseValidatorService, oSelectionService, oFakeFileDAO, oFilesystem, oSettingProjectStub;
	var sProj1 = "proj1";
	var sProj2 = "proj2";
	var sProj3 = "proj3";
	var Owner = function (sFilePath, sInstanceOf) {
		this.sInstanceOf = sInstanceOf;
		this.sFilePath = sFilePath;
		this.instanceOf = function (sInstanceOf) {
			return this.sInstanceOf === sInstanceOf;
		};
		this.getCurrentFilePath = function () {
			return Q(this.sFilePath);
		};
	};

	var fnCreateFileStructure = function (oContent) {
		return oFakeFileDAO.setContent(oContent);
	};

	function createOwner(projName) {
		return new Owner("/" + projName + "/file1.js", "sap.watt.common.plugin.aceeditor.service.Editor");
	};

	function createContentForRepository() {

		var SOURCECODE =
			"function aa(){" +
			"var a=6; " +
			"var b=4; " +
			"if(a==4) " +
			"a=1;" +
			"}";

		var sProject1Doc1 = {
			"basevalidator": {
				"validators": [
					{
						"validatorID": "jsValidator",
						"configuration": {
							"eslintConfig": {
								"rules": {
									"block-scoped-var": 2,
									"curly": [
										0,
										"all"
									],
									"eqeqeq": 0
								}
							},
							"rulesExt": {
								"block-scoped-var": {
									"severity": "warning",
									"category": "Best Practice",
									"helpUrl": "http://eslint.org/docs/rules/block-scoped-var"
								},
								"curly": {
									"severity": "warning",
									"category": "Best Practice",
									"helpUrl": "http://eslint.org/docs/rules/curly"
								},
								"eqeqeq": {
									"severity": "warning",
									"category": "Best Practice",
									"helpUrl": "http://eslint.org/docs/rules/eqeqeq"
								}
							}
						},
						"customRulesPath": "/test1/rules"
					}
				],
				"services": {
					"js": "jsValidator"
				}
			}
		};

		sProject1Doc1 = JSON.stringify(sProject1Doc1);

		var sProject2Doc1 = {
			"basevalidator": {
				"validators": [
					{
						"validatorID": "jsValidator",
						"configuration": {
							"eslintConfig": {
								"rules": {
									"block-scoped-var": 2,
									"eqeqeq": 0
								}
							},
							"rulesExt": {
								"block-scoped-var": {
									"severity": "warning",
									"category": "Best Practice",
									"helpUrl": "http://eslint.org/docs/rules/block-scoped-var"
								},
								"eqeqeq": {
									"severity": "warning",
									"category": "Best Practice",
									"helpUrl": "http://eslint.org/docs/rules/eqeqeq"
								}
							}
						},
						"customRulesPath": "/test1/rules"
					}
				],
				"services": {
					"js": "jsValidator"
				}
			}
		};
		sProject2Doc1 = JSON.stringify(sProject2Doc1);
		var sProject3Doc1 = {test: "test"};
		sProject3Doc1 = JSON.stringify(sProject3Doc1);
		var oContent = {
			"proj1": {".project.json": sProject1Doc1, "file1.js": SOURCECODE},
			"proj2": {".project.json": sProject2Doc1, "file1.js": SOURCECODE},
			"proj3": {".project.json": sProject3Doc1, "file1.js": SOURCECODE}
		};
		return oContent;
	};

	var oCurrentImpl;

	describe("test for baseValidatorToAnnotations", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {
					var serviceGetter = STF.getServicePartial(suiteName);
					oBaseValidatorService = serviceGetter("basevalidator");
					oProjectService = serviceGetter("setting.project");
					oContentService = serviceGetter("content");
					oSelectionService = serviceGetter("selection");
					oFakeFileDAO = serviceGetter("fakeFileDAO");
					oFilesystem = serviceGetter("filesystem.documentProvider");
					fnCreateFileStructure(createContentForRepository());
					return STF.getServicePrivateImpl(oProjectService).then(function (oImpl) {
						oCurrentImpl = oImpl;
					});
				});
		});


		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		afterEach(function () {
			sandbox.restore();
		});

		it("project json with eqeqeq and curly disabled", function () {
			return oFilesystem.getDocument("/" + sProj1 + "/file1.js")
				.then(function (oDoc) {
					oCurrentImpl._oSelectedDocument = oDoc;
					sandbox.stub(oSelectionService, "getSelection").returns(Q([{document: oDoc}]));
					sandbox.stub(oContentService, "getCurrentDocument").returns(Q(oDoc));

					var oOwner = createOwner(sProj1);
					oOwner.clearAnnotations = function () {
						return Q();
					};
					oOwner.setAnnotations = function (aAnnotations, bSetInlineAnnotations) {
						var oResult = _.result(_.find(aAnnotations, function (rule) {
							return rule.ruleId === "curly";
						}), 'ruleId');
						expect(oResult).to.be.undefined;
						oResult = _.result(_.find(aAnnotations, function (rule) {
							return rule.ruleId === "eqeqeq";
						}), 'ruleId');
						expect(oResult).to.be.undefined;
						done();
					};
					var oEvent = {
						params: {
							owner: oOwner,
							selection: [{document: oDoc}]
						}
					};
					oBaseValidatorService.onSelectionChanged(oEvent);
				});
		});

		it("project json with eqeqeq disabled and no curly", function (done) {
			return oFilesystem.getDocument("/" + sProj2 + "/file1.js")
				.then(function (oDoc) {
					oCurrentImpl._oSelectedDocument = oDoc;
					sandbox.stub(oSelectionService, "getSelection").returns(Q([{document: oDoc}]));
					sandbox.stub(oContentService, "getCurrentDocument").returns(Q(oDoc));
					var oOwner = createOwner(sProj2);
					oOwner.clearAnnotations = function () {
						return Q();
					};
					oOwner.setAnnotations = function (aAnnotations, bSetInlineAnnotations) {
						var oResult = _.result(_.find(aAnnotations, function (rule) {
							return rule.ruleId === "curly";
						}), 'ruleId');
						expect(oResult).to.deep.equal("curly");
						oResult = _.result(_.find(aAnnotations, function (rule) {
							return rule.ruleId === "eqeqeq";
						}), 'ruleId');
						expect(oResult).to.be.undifined;
						done();
					};
					var oEvent = {
						params: {
							owner: oOwner,
							selection: [{document: oDoc}]
						}
					};
					oBaseValidatorService.onSelectionChanged(oEvent);
				});
		});

		it("project json with no rules", function (done) {
			return oFilesystem.getDocument("/" + sProj3 + "/file1.js")
				.then(function (oDoc) {
					oCurrentImpl._oSelectedDocument = oDoc;
					sandbox.stub(oSelectionService, "getSelection").returns(Q([{document: oDoc}]));
					sandbox.stub(oContentService, "getCurrentDocument").returns(Q(oDoc));

					var oOwner = createOwner(sProj3);
					oOwner.clearAnnotations = function () {
						return Q();
					};
					oOwner.setAnnotations = function (aAnnotations, bSetInlineAnnotations) {
						var oResult = _.result(_.find(aAnnotations, function (rule) {
							return rule.ruleId === "curly";
						}), 'ruleId');
						expect(oResult).to.deep.equal("curly");
						oResult = _.result(_.find(aAnnotations, function (rule) {
							return rule.ruleId === "eqeqeq";
						}), 'ruleId');
						expect(oResult).to.deep.equal("eqeqeq");
						done();
					};
					var oEvent = {
						params: {
							owner: oOwner,
							selection: [{document: oDoc}]
						}
					};
					oBaseValidatorService.onSelectionChanged(oEvent);
				});
		});


		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
