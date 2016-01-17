//  The SaneTestFramework should be imported via 'STF' path.
define(['STF'], function (STF) {
	"use strict";

	var oBaseValidatorService;
	var oSelectionService;
	var oDocumentService;
	var oProjectTypeService;
	var oContentService;
	var oSettingProjectService;
	var MockFileDocument;
	var sandbox;
	var _oImpl;


	var suiteName = "service_basevalidator_concrete";

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

	var jNeoAppWitheError = {
		"welcomeFile": "index.html",
		"routes": [
			{
				"path": "/resources",
				"target": {
					"type": "service",
					"name": "sapui5",
					"additional property": "sapui5"
				},
				"description": "SAPUI5 Resources"
			}
		]
	};

	var jManifestWitheError = {
		"_version": "1.1.0",
		"sap.app": {
			"_version": "1.1.0",
			"id": "finExample",
			"type": "application",
			"i18n": "i18n/i18n.properties",
			"applicationVersion": {
				"version": "1.0.0"
			},
			"title": "{{appTitle}}",
			"description": "{{appDescription}}",
			"ach": "ach",
			"sourceTemplate": {
				"id": "ui5template.basicSAPUI5ApplicationProject",
				"version": "1.30.3"
			}
		}
	};

	var jManifest = {
		"_version": "1.1.0",
			"sap.app": {
			"_version": "1.1.0",
				"id": "fin.co.myspend",
				"type": "application",
				"applicationVersion": {
				"version": "${project.version}"
			},
			"title": "{{DISPLAY_NAME}}",
				"ach": "CO-FIO",
				"dataSources": {
				"FCO_MS_SPEND_SRV": {
					"uri": "/sap/opu/odata/sap/FCO_MS_SPEND_SRV/"
				}
			},
			"resources": "resources.json"
		},
		"sap.ui": {
			"_version": "1.1.0",
				"technology": "UI5",
				"deviceTypes": {
				"desktop": true,
					"tablet": true,
					"phone": true
			},
			"supportedThemes": [
				"sap_hcb",
				"sap_bluecrystal"
			]
		}
	};

	var jNeoApp = {
		"welcomeFile": "index.html",
		"routes": [
			{
				"path": "/resources",
				"target": {
					"type": "service",
					"name": "sapui5"
				},
				"description": "SAPUI5 Resources"
			}
		]
	};
	var aProjectType = [
		{
			decoratorIconStyleClass: "",
			description: "An SAP Fiori project",
			displayName: "SAP Fiori",
			icon: undefined,
			id: "sap.watt.uitools.ide.fiori",
			includes: [],
			isDefault: true,
			service: undefined
		},
		{
			decoratorIconStyleClass: "",
			description: "A web project",
			displayName: "Web",
			icon: undefined,
			id: "sap.watt.uitools.ide.web",
			includes: [],
			isBuiltIn: true,
			service: undefined
		}
	];

	var aDocumentSelection = [{
		"document": {
			"getProject": function () {
				return Q({
					"getEntity": function () {
						return {
							"getFullPath": function () {
								return "/bbb";
							}
						};
					}
				});
			},
			"getOwner": function () {
				return new sap.watt.common.plugin.aceeditor.control.Editor();
			}
		}
	}];

	function getOEvent(oOwner, oDoc) {
		return {
			params: {
				owner: oOwner,
				selection: [{document: oDoc}]
			}
		};
	}

	function initSandbox(oDoc) {
		sandbox.stub(oDocumentService, "getDocumentByPath").returns(Q(oDoc));
		sandbox.stub(oContentService, "getCurrentDocument").returns(Q(oDoc));
		sandbox.stub(oSettingProjectService, "get").returns(Q());
		sandbox.stub(oSettingProjectService, "getProjectSettings").returns(Q({}));
		sandbox.stub(oSelectionService, "getSelection").returns(Q(aDocumentSelection));
	}

	describe("test concrete validators execution ", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {

					var serviceGetter = STF.getServicePartial(suiteName);
					oBaseValidatorService = serviceGetter("basevalidator");
					oSelectionService = serviceGetter("selection");
					oDocumentService = serviceGetter("document");
					oProjectTypeService = serviceGetter("projectType");
					oContentService = serviceGetter("content");
					oSettingProjectService = serviceGetter("setting.project");

					return STF.getServicePrivateImpl(oBaseValidatorService).then(function (oImpl) {
						_oImpl = oImpl;
						return STF.require(suiteName, [
							"sane-tests/util/mockDocument"
						]);
					});
				}).spread(function (oMockDocument) {
					MockFileDocument = oMockDocument.MockFileDocument;
				});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		afterEach(function () {
			sandbox.restore();
		});


		it("sets annotation on mocked editor", function (done) {
			var oDoc = new MockFileDocument("/dev/null", "js", "content");
			var oOwner = new Owner("/dev/null.js", "sap.watt.common.plugin.aceeditor.service.Editor");
			oOwner.clearAnnotations = function () {
				return Q();
			};
			oOwner.setAnnotations = function (aAnnotations, bSetInlineAnnotations) {
				expect(aAnnotations).to.not.be.undefined;
				done();
			};
			initSandbox(oDoc);

			oBaseValidatorService.onSelectionChanged(getOEvent(oOwner, oDoc));
		});

		it("sets annotation on mocked editor for neo-app.json", function (done) {
			var path = "/dev/neo-app";
			var fileType = "json";
			jNeoApp = JSON.stringify(jNeoApp);
			var oDoc = new MockFileDocument(path, fileType, jNeoApp, "proj");
			var oOwner = new Owner(path + "." + fileType, "sap.watt.common.plugin.aceeditor.service.Editor");
			oOwner.clearAnnotations = function () {
				return Q();
			};
			oOwner.setAnnotations = function (aAnnotations, bSetInlineAnnotations) {
				expect(aAnnotations).to.be.empty;
				done();
			};
			initSandbox(oDoc);
			sandbox.stub(oDoc.getEntity(), "getName").returns("neo-app.json");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectType));

			oBaseValidatorService.onSelectionChanged(getOEvent(oOwner, oDoc));
		});

		it("sets annotation on mocked editor for neo-app.json withe error", function (done) {
			var path = "/dev/neo-app";
			var fileType = "json";
			jNeoAppWitheError = JSON.stringify(jNeoAppWitheError);
			var oDoc = new MockFileDocument(path, fileType, jNeoAppWitheError, "proj");
			var oOwner = new Owner(path + "." + fileType, "sap.watt.common.plugin.aceeditor.service.Editor");
			oOwner.clearAnnotations = function () {
				return Q();
			};
			oOwner.setAnnotations = function (aAnnotations, bSetInlineAnnotations) {
				expect(aAnnotations).to.not.be.undefined;
				done();
			};
			initSandbox(oDoc);
			sandbox.stub(oDoc.getEntity(), "getName").returns("neo-app.json");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectType));

			oBaseValidatorService.onSelectionChanged(getOEvent(oOwner, oDoc));
		});

		it("sets annotation on mocked editor for manifest.json ", function (done) {
			var path = "/dev/neo-manifest";
			var fileType = "json";
			jManifest = JSON.stringify(jManifest);
			var oDoc = new MockFileDocument(path, fileType, jManifest, "proj");
			var oOwner = new Owner(path + "." + fileType, "sap.watt.common.plugin.aceeditor.service.Editor");
			oOwner.clearAnnotations = function () {
				return Q();
			};
			oOwner.setAnnotations = function (aAnnotations, bSetInlineAnnotations) {
				expect(aAnnotations).to.be.empty;
				done();
			};
			initSandbox(oDoc);
			sandbox.stub(oDoc.getEntity(), "getName").returns("manifest.json");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectType));

			oBaseValidatorService.onSelectionChanged(getOEvent(oOwner, oDoc));
		});

		it("sets annotation on mocked editor for manifest.json withe error", function (done) {
			var path = "/dev/neo-manifest";
			var fileType = "json";
			jManifestWitheError = JSON.stringify(jManifestWitheError);
			var oDoc = new MockFileDocument(path, fileType, jManifestWitheError, "proj");
			var oOwner = new Owner(path + "." + fileType, "sap.watt.common.plugin.aceeditor.service.Editor");
			oOwner.clearAnnotations = function () {
				return Q();
			};
			oOwner.setAnnotations = function (aAnnotations, bSetInlineAnnotations) {
				expect(aAnnotations).to.not.be.undefined;
				done();
			};
			initSandbox(oDoc);
			sandbox.stub(oDoc.getEntity(), "getName").returns("manifest.json");
			sandbox.stub(oProjectTypeService, "getProjectTypes").returns(Q(aProjectType));

			oBaseValidatorService.onSelectionChanged(getOEvent(oOwner, oDoc));
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

	});
});
