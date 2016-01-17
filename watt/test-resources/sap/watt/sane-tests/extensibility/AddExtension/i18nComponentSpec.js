define(['STF', "sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/i18ncomponent/i18nComponent"],
	function (STF, i18nComponent) {

	"use strict";

	var oMockContext = {};
	var model = {};
	var oMockProjectZip = {};

	describe('i18n Component', function () {

		function buildMockContext() {
			oMockContext.service = {};

			oMockContext.service.filesystem = {};
			oMockContext.service.filesystem.documentProvider = {};
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

			oMockContext.service.parentproject = {};
			oMockContext.service.parentproject.getGuidelinesDocument = function() {
				return Q({});
			};
			oMockContext.service.parentproject.geti18nFolderFiles = function() {

				var oMockFile = {
					getEntity : function() {
						var getType = function() {
							return "file";
						};
						var getName = function() {
							return "i18n_en.peroperties";
						};
						var getFileExtension = function() {
							return ".properties";
						};
						var getParentPath = function() {
							return "/i18n/i18n_en.peroperties";
						};
						return {
							getType: getType,
							getName: getName,
							getFileExtension: getFileExtension,
							getParentPath: getParentPath
						};
					},
					getContent : function() {
						return Q("dummyContent");
					}
				};

				return Q([oMockFile]);
			};

			oMockContext.service.extensionproject = {};
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
			oMockContext.service.ui5projecthandler.isScaffoldingBased = function() {
				return Q(false);
			};
			oMockContext.service.ui5projecthandler.addi18nExtensionModel = function() {
				return Q({});
			};
			oMockContext.service.ui5projecthandler.addConfig = function() {
				return Q();
			};
			oMockContext.service.ui5projecthandler.isManifestProjectGuidelinesType = function() {
				return Q(true);
			};

			i18nComponent.setContext(oMockContext);
		}

		before(function () {
			buildMockContext();
		});

		it("Tests updateGuidelinesDocument method", function() {
			// prepare mock model
			model = {};
			model.fiori = {};
			model.fiori.extensionCommon = {};
			model.fiori.extensionCommon.i18nPath = "/i18n/i18n.properties";
			model.extensibility = {};

			// validation 1 - no scaffolding
			return i18nComponent.updateGuidelinesDocument(model).then(function(oRes1) {
				expect(jQuery.isEmptyObject(oRes1)).to.equal(true);


				oMockContext.service.ui5projecthandler.isScaffoldingBased = function() {
					return Q(true);
				};
				i18nComponent.setContext(oMockContext);

				model.fiori.extensionCommon.propertiesFileName = "michal.properties";
				model.extensionProjectNamespace = "dummyNamespace.AppExtension";

				// validation 2 - with scaffolding
				//return i18nComponent.updateGuidelinesDocument(model).then(function(oRes2) {
				//	expect(jQuery.isEmptyObject(oRes2)).to.equal(true);
				//});
			});
		});

		it("Tests copyI18nFolderFromParent method", function() {

			model = {};
			model.extensibility = {};
			model.extensibility.resourceBundle = "i18n/bundle.properties";
			model.extensibility.component = "/Component.js";
			model.extensibility.type = "dummyType";
			model.extensibility.system = {};
			model.extensionResourceLocationPath = "webapp/";

			oMockProjectZip = new JSZip();
			oMockProjectZip.file("file1","1");

			return i18nComponent.copyI18nFolderFromParent(model, oMockProjectZip).then(function(oRes) {
				expect(oRes).to.equal(undefined); //TODO: we need some other check here, but nothing is returned
				//check the model - the path to i18n folder in extension project should be update correctly.
				//the update of zip file is made later, based on the path
				expect(model.fiori.extensionCommon.i18nPath).to.equal("i18n/bundle.properties");
				expect(model.fiori.extensionCommon.resourceLocationPath).to.equal("webapp/i18n/");
			});
		});
	});
});
