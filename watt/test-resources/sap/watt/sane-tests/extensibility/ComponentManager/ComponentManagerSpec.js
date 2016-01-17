define(['STF', "sap/watt/lib/jszip/jszip-shim", "sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/manager/ComponentManager"],
	function (STF, JSZip, ComponentManager) {

	"use strict";

	var oComponentManager;

	describe('Component Manager', function () {

		function buildMockContext() {
			var oMockContext = {};
			oMockContext.service = {};

			oMockContext.service.filesystem = {};
			oMockContext.service.filesystem.documentProvider = {};

			oMockContext.service.selection = {};

			oMockContext.service.extensionproject = {};

			oMockContext.service.filesystem.documentProvider.getRoot = function() {
				var rootDocument = {};
				rootDocument.objectExists = function() {
					return Q(false);
				};
				return Q(rootDocument);
			};

			oMockContext.service.filesystem.documentProvider.getDocument = function() {
				return Q({});
			};

			oMockContext.service.ui5projecthandler = {};
			oMockContext.service.ui5projecthandler.getHandlerDocument = function() {
				var document = {};
				document.getEntity = function() {
					var entity = {};
					entity.getFullPath = function() {
						return "/path";
					};
					return entity;
				};
				return Q(document);
			};
			oMockContext.service.ui5projecthandler.getAllExtensions = function() {
				return Q({});
			};
			oMockContext.service.ui5projecthandler.addExtension = function() {
				return Q();
			};

			oMockContext.service.extensionproject.getComponentJsDocument = function() {
				var componentJsDocument = {};
				componentJsDocument.getContent = function() {
					return Q("{}");
				};
				componentJsDocument.getEntity = function() {
					var entity = {};
					entity.getFullPath = function() {
						return "/path";
					};
					return entity;
				};
				return Q(componentJsDocument);
			};
			oMockContext.service.extensionproject.getExtensionRevision = function() {
				var oDeferred = Q.defer();
				oDeferred.resolve();
				return oDeferred.promise;
			};
			oMockContext.service.extensionproject.updateFileContent = function() {
				return Q();
			};
			oMockContext.service.extensionproject.openDocument = function() {
				return Q();
			};

			oMockContext.service.beautifierProcessor = {};
			oMockContext.service.beautifierProcessor.beautify = function(content) {
				return Q(content);
			};

			oMockContext.service.uicontent = {};
			oMockContext.service.uicontent.isExtensibilityOpen = function() {
				return Q(false);
			};

			return oMockContext;
		}

		function createMockProjectZip() {
			var oMockProjectZip = new JSZip();
			oMockProjectZip.file("ComponentCustomizing.json","{\"sap.ui.viewModifications\": {\"ui.s2p.mm.purchorder.approve.view.S2\": {\"MAIN_LIST_ITEM\": {\"visible\": false}}}");
			oMockProjectZip.file("File1.tmpl","content1");
			oMockProjectZip.file("File2.tmpl","content2");
			return oMockProjectZip;
		}

		before(function () {
			// initialize the ComponentManager with the mock context
			oComponentManager = new ComponentManager(buildMockContext());
		});

		it("Tests initializeComponentModel method", function() {
			// prepare model
			var model = {};

			var initModel = {};
			initModel.extensionCommon = {};
			initModel.extensionCommon.customizationId = "sap.ui.viewExtensions";
			initModel.extendView = {};
			initModel.extendView.fragmentAttributes = "xmlns:sap.ui.layout=\"sap.ui.layout\">";

			// validation
			oComponentManager.initializeComponentModel(model, initModel);
			expect(model.fiori.extensionCommon.customizationId).to.equal("sap.ui.viewExtensions");
			expect(model.fiori.extendView.fragmentAttributes).to.equal("xmlns:sap.ui.layout=\"sap.ui.layout\">");
		});

		it("Tests getResourceOutputPath method", function() {

			// prepare model 1
			var model = {};
			model.fiori = {};
			model.fiori.extensionCommon = {};
			model.fiori.extensionCommon.resourceLocationPath = "/i18n/";
			model.fiori.extensionCommon.extensionFilePath = "/i18n/i18n.properties";
			// validation 1
			var resourcePath1 = oComponentManager.getResourceOutputPath(model, "i18n.properties");
			expect(resourcePath1).to.equal("/i18n/i18n.properties");

			// prepare model 2
			model.fiori.extensionCommon.resourceLocationPath = "/";
			model.fiori.extensionCommon.resourceSuffix = ".controller.js";
			model.fiori.extensionCommon.resourceName = "Main";
			model.fiori.extensionCommon.extensionFilePath = "%2fMainCustom";
			// validation 2
			var resourcePath2 = oComponentManager.getResourceOutputPath(model, "EmptyController.js");
			expect(resourcePath2).to.equal("%2fMainCustom.controller.js");
		});

		it("Tests getFileContentFromZip method", function() {

			var projectZip = function() {
				var file = {};
				file.asText = function() {
					return "{\"customizationId\": {\"resourceId\": {\"controllerName\": \"extensionResourceId\"}}}";
				};

				file.asBinary = function() {

				};

				var files = {};
				files["ComponentCustomizing.json"] = file;

				var generate = function() {
					file.asText();
				};

				var remove = function() {
					files = {};
				};

				var file = function() {

				};

				return {
					file: file,
					files: files,
					generate: generate,
					remove: remove
				};
			}();

			var fileContent = oComponentManager.getFileContentFromZip(projectZip);

			expect(fileContent).to.equal("{\"customizationId\": {\"resourceId\": {\"controllerName\": \"extensionResourceId\"}}}");
		});

		it("Tests onBeforeTemplateGenerate method", function() {

			// prepare model
			var templateZip = {};
			var model = {};
			model.extensionProjectPath = "/HCM_LR_CREExtension";
			model.extensibility = {};
			model.extensibility.namespace = "hcm.emp.myleaverequests";
			model.extensionProjectNamespace = "hcm.emp.myleaverequests.HCM_LR_CREExtension";
			model.fiori = {};
			model.fiori.extensionCommon = {};
			model.fiori.extensionCommon.resourceLocationPath = "%2fview%2f";
			model.fiori.extensionCommon.resourceName = "S2";
			model.fiori.extensionCommon.extensionId = "LRS2_LISTITEM";
			model.fiori.extensionCommon.blockType = "customizing";

			// validation 1
			return oComponentManager.onBeforeTemplateGenerate(templateZip, model).then(function(result) {
				expect(result.length).to.equal(2);
			});
		});

		it("Tests onAfterGenerate method", function() {

			// prepare mock methods
			oComponentManager.getFileContentFromZip = function() {
				return "{\"sap.ui.viewModifications\": {\"hcm.emp.myleaverequests.view.S2\": {\"LRS2_LISTITEM\": {\"visible\": false}}}}";
			};
			oComponentManager.customizingJson = {};

			// prepare mock model and zip
			var templateZip = {};
			templateZip.remove = function() {};
			templateZip.file = function() {};
			templateZip.files = [];
			var file = {};
			file.asBinary = function() {};
			templateZip.files.push(file);

			var model = {};
			model.extensionProjectPath = "/HCM_LR_CREExtension";
			model.extensibility = {};
			model.extensibility.namespace = "hcm.emp.myleaverequests";
			model.extensionProjectNamespace = "hcm.emp.myleaverequests.HCM_LR_CREExtension";
			model.fiori = {};
			model.fiori.extensionCommon = {};

			// validation 1
			return oComponentManager.onAfterGenerate(templateZip, model).then(function(result1) {
				expect(result1.length).to.equal(2);

				// validation 2
				oComponentManager.customizingJson["sap.ui.viewModifications"] = {};
				return oComponentManager.onAfterGenerate(templateZip, model).then(function(result2) {
					expect(result2.length).to.equal(2);

					// validation 3
					model.fiori.extensionCommon.resourceId = "hcm.emp.myleaverequests.view.S2";
					model.fiori.extensionCommon.extensionId = "sap.ui.viewModifications";
					return oComponentManager.onAfterGenerate(templateZip, model).then(function(result3) {
						expect(result3.length).to.equal(2);
					});
				});
			});
		});

		it("Tests onAfterGenerateCommon method", function() {

			var oProjectZip = createMockProjectZip();

			var model = {};
			model.extensionProjectPath = "/HCM_LR_CREExtension";
			model.extensibility = {};
			model.extensibility.namespace = "hcm.emp.myleaverequests";
			model.extensionProjectNamespace = "hcm.emp.myleaverequests.HCM_LR_CREExtension";
			model.fiori = {};
			model.fiori.extensionCommon = {};
			model.fiori.extensionCommon.resourceLocationPath = "%2fview%2f";
			model.fiori.extensionCommon.extensionId = "LRS2_LISTITEM";
			model.fiori.extensionCommon.blockType = "customizing";

			// validation 1 - model with no resourceName
			oComponentManager.onAfterGenerateCommon(oProjectZip, model);
			expect(oProjectZip.files["%2fview%2fFile1.tmpl"].name).to.equal("%2fview%2fFile1.tmpl");
			expect(oProjectZip.files["%2fview%2fFile2.tmpl"].name).to.equal("%2fview%2fFile2.tmpl");


			model.fiori.extensionCommon.resourceName = "S2";
			model.fiori.extensionCommon.extensionFilePath = "%2fS2Custom";

			// validation 2 - model with no resourceSuffix
			oComponentManager.onAfterGenerateCommon(oProjectZip, model);
			expect(oProjectZip.files["%2fS2Custom"].name).to.equal("%2fS2Custom");


			model.fiori.extensionCommon.resourceSuffix = ".xml";

			// validation 3 - model with resourceName and resourceSuffix
			oComponentManager.onAfterGenerateCommon(oProjectZip, model);
			expect(oProjectZip.files["%2fS2Custom.xml"].name).to.equal("%2fS2Custom.xml");
		});

		it("Tests onAfterGenerateUpdates method", function() {

			var oProjectZip = createMockProjectZip();

			var model = {};
			model.extensionProjectPath = "/AppExtension";
			model.extensibility = {};
			model.extensibility.namespace = "a";
			model.extensionProjectNamespace = "a.AppExtension";
			model.fiori = {};
			model.fiori.extensionCommon = {};
			model.fiori.extensionCommon.resourceLocationPath = "/view/";
			model.fiori.extensionCommon.resourceId = "S2";
			model.fiori.extensionCommon.extensionId = "MAIN_LIST_ITEM";
			model.fiori.extensionCommon.blockType = "customizing";

			var sCustomizationId = oComponentManager.onAfterGenerateUpdates(oProjectZip, model);
			expect(sCustomizationId).to.equal("sap.ui.viewModifications");
		});
	});
});
