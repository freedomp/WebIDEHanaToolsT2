define(['STF',
	"sap/watt/core/q", "sane-tests/util/RepositoryBrowserUtil"], function (STF, coreQ, repositoryBrowserUtil) {

	"use strict";
	
	/* eslint-disable no-use-before-define */

	var suiteName = "fioriexttemplate_CreateExtensionProject";
	var iFrameWindow = null;
	var extensionProjectWizardUtil = null;

	describe('Extensibility: Create Extension Project', function () {
		this.timeout(180000);
		before(function (done) {
			STF.startWebIde(suiteName , { config: "extensibility/config.json" }).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;

				// require the utility class from the context running in Web IDE
				STF.require(suiteName, ["../test-resources/sap/watt/sane-tests/extensibility/util/WizardTestUtil"]).spread(function (utilsInstance) {
					extensionProjectWizardUtil = utilsInstance;
					done();
				});
			});
		});

		it("Generate the external sample Shop app (which doesn't have an AppDescriptor), and creates an Extension Project for it)", function(done) {

			var PROJECT_NAME = "nw.epm.refapps.ext.shop";
			// services
			var oFilesystemDocumentProviderService = STF.getService(suiteName, "filesystem.documentProvider");
			var oUI5ProjectHandlerService = STF.getService(suiteName, "ui5projecthandler");
			var oSettingsProjectService = STF.getService(suiteName, "setting.project");

			var extensionprojectContext = STF.getService(suiteName, "extensionproject").context;
			var selectReferenceProjectStepContext = STF.getService(suiteName, "selectReferenceProjectStep").context;

			// Delete the project if it already exists in the workspace
			repositoryBrowserUtil.deleteProjectIfExists(suiteName, PROJECT_NAME).then(function () {
				// Create the shop reference app
				extensionProjectWizardUtil.createSampleApp(iFrameWindow, selectReferenceProjectStepContext, function() {
					// Create Extension project
					var oResult = {};
					extensionProjectWizardUtil.createLocalExtensionProject(iFrameWindow, extensionprojectContext, PROJECT_NAME, oResult, function () {
						expect(oResult.extensionProjectName).to.exist;
						assert.equal(oResult.extensionProjectName, PROJECT_NAME + "Extension");
						oFilesystemDocumentProviderService.getDocument("/" + oResult.extensionProjectName).then(function(oProjectDoc) {
							var aPromises = [];
							aPromises.push(oUI5ProjectHandlerService.isComponentProjectGuidelinesType(oProjectDoc));
							aPromises.push(oUI5ProjectHandlerService.isConfigProjectGuidelinesType(oProjectDoc));
							aPromises.push(oUI5ProjectHandlerService.isManifestProjectGuidelinesType(oProjectDoc));
							aPromises.push(oUI5ProjectHandlerService.getAppNamespace(oProjectDoc));
							aPromises.push(oUI5ProjectHandlerService.getAllExtensions(oProjectDoc));
							aPromises.push(oUI5ProjectHandlerService.isScaffoldingBased(oProjectDoc));
							Q.all(aPromises).spread(function(bIsComponent, bIsConfig, bIsManifest, sAppNamespace, oExtensions, bIsScaffolding) {
								expect(bIsComponent).to.be.true;
								expect(bIsConfig).to.be.false;
								expect(bIsManifest).to.be.false;
								expect(sAppNamespace).to.equal("nw.epm.refapps.ext.shop.nw.epm.refapps.ext.shopExtension");
								expect(oExtensions).to.be.empty;
								expect(bIsScaffolding).to.be.false;

								aPromises = [];
								aPromises.push(oFilesystemDocumentProviderService.getDocument("/" + oResult.extensionProjectName + "/webapp/localService/metadata.xml"));
								aPromises.push(oSettingsProjectService.getProjectSettings("extensibility", oProjectDoc));
								aPromises.push(oSettingsProjectService.getProjectSettings("build", oProjectDoc));
								Q.all(aPromises).spread(function(oMetadataDocument, oExtensibilitySettings, oBuildSettings) {
									// Validate we have metadata.xml
									expect(oMetadataDocument).to.exist;
									// Validate we have the expected controllers in .project.json
									var controllers = oExtensibilitySettings.controllers;
									expect(controllers.EmptyPage).to.equal("/nw.epm.refapps.ext.shop/webapp/controller/EmptyPage.controller.js");
									expect(controllers.App).to.equal("/nw.epm.refapps.ext.shop/webapp/controller/App.controller.js");
									expect(controllers.S2_ProductList).to.equal("/nw.epm.refapps.ext.shop/webapp/controller/S2_ProductList.controller.js");
									expect(controllers.S3_ProductDetails).to.equal("/nw.epm.refapps.ext.shop/webapp/controller/S3_ProductDetails.controller.js");
									expect(controllers.S4_ShoppingCart).to.equal("/nw.epm.refapps.ext.shop/webapp/controller/S4_ShoppingCart.controller.js");
									expect(controllers.S5_CheckOut).to.equal("/nw.epm.refapps.ext.shop/webapp/controller/S5_CheckOut.controller.js");
									expect(controllers.S2_SmartFilterBar).to.equal("/nw.epm.refapps.ext.shop/webapp/controller/S2_SmartFilterBar.controller.js");

									expect(oBuildSettings).to.exist;
									expect(oBuildSettings.targetFolder).to.equal("dist");
									expect(oBuildSettings.sourceFolder).to.equal("webapp");
									expect(oBuildSettings.buildRequired).to.be.true;

									done();
								});
							});
						});
					});
				});
			}).fail(function (oError) {
				assert(false, oError.message);
				console.log(oError);
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
	
	describe("Test generateExtensionProject method in ExtensionProjectWizard: Create an extension project for the external sample Shop app (which doesn't have an AppDescriptor), without UI", function () {
			
		var oExtensionProjectWizard;
		var sParentAppName = "nw.epm.refapps.ext.shop";
		var sZipPath = "../test-resources/sap/watt/sane-tests/extensibility/ExtensionProject/nw.epm.refapps.ext.shop.zip";
		var oWizardModelData;
		var oFilesystemDocumentProviderService;
		var oTemplateService;
		var oContext;
		var oWizardModel;
		
		before(function () {
			return STF.startWebIde(suiteName , { config: "extensibility/config.json" }).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				oFilesystemDocumentProviderService = STF.getService(suiteName, "filesystem.documentProvider");
				oTemplateService = STF.getService(suiteName, "template");
				oContext = STF.getService(suiteName, "extensionproject").context;
			});
		});
		
		beforeEach(function () {
			// 1. Require the ExtensionProjectWizard
			// 2. Import the parent app zip
			// 3. Initialize the wizard with data
			// 4. Create the wizard model
			return coreQ.sap.require("sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/ui/wizard/ExtensionProjectWizard").then(function(ExtensionProjectWizard) {
				oExtensionProjectWizard = ExtensionProjectWizard;
				
				// import the parent app - the external Shop sample app
				return repositoryBrowserUtil.importZipIntoCleanFolder(suiteName, sParentAppName, iFrameWindow, sZipPath).then(function(oImportedParentApp) {
					expect(oImportedParentApp).to.exist;
						
					return oTemplateService.getTemplate("fioriexttemplate.extensionProject").then(function(oExtensionProjectTemplate) {
						// initialize data in the wizard for the test
						oExtensionProjectWizard.setSelectedTemplate(oExtensionProjectTemplate);
						oExtensionProjectWizard.setContext(oContext);
						
						// use a pre-defined wizard model - instead of using the UI to build one
						oWizardModel = {};
						oWizardModel.oData = oWizardModelData;
						oWizardModel.getData = function() {
							return oWizardModelData;
						};
						
						oWizardModelData = {
							extensibility: {
								component: "/nw.epm.refapps.ext.shop/webapp/Component.js",
								controllers: {
									App: "/nw.epm.refapps.ext.shop/webapp/controller/App.controller.js",
									EmptyPage: "/nw.epm.refapps.ext.shop/webapp/controller/EmptyPage.controller.js",
									S2_ProductList: "/nw.epm.refapps.ext.shop/webapp/controller/S2_ProductList.controller.js",
									S2_SmartFilterBar: "/nw.epm.refapps.ext.shop/webapp/controller/S2_SmartFilterBar.controller.js",
									S3_ProductDetails: "/nw.epm.refapps.ext.shop/webapp/controller/S3_ProductDetails.controller.js",
									S4_ShoppingCart: "/nw.epm.refapps.ext.shop/webapp/controller/S4_ShoppingCart.controller.js",
									S5_CheckOut: "/nw.epm.refapps.ext.shop/webapp/controller/S5_CheckOut.controller.js"
								},
								fragments: {
									ProductGroupingDialog: "/nw.epm.refapps.ext.shop/webapp/view/fragment/ProductGroupingDialog.fragment.xml",
									ProductImage: "/nw.epm.refapps.ext.shop/webapp/view/fragment/ProductImage.fragment.xml",
									ProductSortDialog: "/nw.epm.refapps.ext.shop/webapp/view/fragment/ProductSortDialog.fragment.xml",
									ReviewDialog: "/nw.epm.refapps.ext.shop/webapp/view/fragment/ReviewDialog.fragment.xml",
									ReviewRating: "/nw.epm.refapps.ext.shop/webapp/view/fragment/ReviewRating.fragment.xml",
									SettingsDialog: "/nw.epm.refapps.ext.shop/webapp/view/fragment/SettingsDialog.fragment.xml",
									SupplierCard: "/nw.epm.refapps.ext.shop/webapp/view/fragment/SupplierCard.fragment.xml"
								},
								projectjson: "/nw.epm.refapps.ext.shop/.project.json",
								system: undefined,
								type: "Workspace",
								views: {
									App: "/nw.epm.refapps.ext.shop/webapp/view/App.view.xml",
									EmptyPage: "/nw.epm.refapps.ext.shop/webapp/view/EmptyPage.view.xml",
									S2_ProductList: "/nw.epm.refapps.ext.shop/webapp/view/S2_ProductList.view.xml",
									S2_SmartFilterBar: "/nw.epm.refapps.ext.shop/webapp/view/subview/S2_SmartFilterBar.view.xml",
									S3_ProductDetails: "/nw.epm.refapps.ext.shop/webapp/view/S3_ProductDetails.view.xml",
									S4_ShoppingCart: "/nw.epm.refapps.ext.shop/webapp/view/S4_ShoppingCart.view.xml",
									S5_CheckOut: "/nw.epm.refapps.ext.shop/webapp/view/S5_CheckOut.view.xml"
								}
							},
							metadataPath: "/nw.epm.refapps.ext.shop/webapp/localService/metadata.xml",
							neoAppPath: "/nw.epm.refapps.ext.shop/neo-app.json",
							openExtPane: false,
							parentPath: "/nw.epm.refapps.ext.shop",
							parentProjectName: "nw.epm.refapps.ext.shop",
							projectName: "nw.epm.refapps.ext.shopExtension",
							selectedTemplate: oExtensionProjectTemplate
						};
					});
				});
			});
		});
		
		it("Extension project folder doesn't exist", function() {

			var sExtensionProjectName = "nw.epm.refapps.ext.shopExtension";

			return oExtensionProjectWizard.generateExtensionProject(oWizardModel).then(function() {
				return oFilesystemDocumentProviderService.getDocument("/" + sExtensionProjectName).then(function(oGeneratedExtensionProject) {
					expect(oGeneratedExtensionProject).to.exist;
					
					return oFilesystemDocumentProviderService.getDocument("/" + sExtensionProjectName + "/webapp/Component.js").then(function(oComponent) {
						expect(oComponent).to.exist;
					});
				});
			});				
		});
		
		it("Extension project folder exists!", function() {

			var sExtensionProjectName = "nw.epm.refapps.ext.shopExtension1";
			var oProjectData = {};
			oProjectData.name = sExtensionProjectName;
			// update the model with the new extension project name
			oWizardModel.getData().projectName = sExtensionProjectName;
			
			// create a folder with the same name of the extension project
			return oFilesystemDocumentProviderService.getRoot().then(function(oRoot) {
				return oRoot.createProject(oProjectData).then(function(oFolder) {
					expect(oFolder).to.exist;
					expect(oFolder.getEntity().getName()).to.equal(sExtensionProjectName);
					
					return oExtensionProjectWizard.generateExtensionProject(oWizardModel).then(function() {
						return oFilesystemDocumentProviderService.getDocument("/" + sExtensionProjectName).then(function(oGeneratedExtensionProject) {
							expect(oGeneratedExtensionProject).to.exist;
							
							return oFilesystemDocumentProviderService.getDocument("/" + sExtensionProjectName + "/webapp/Component.js").then(function(oComponent) {
								expect(oComponent).to.exist;
							});
						});
					});	
				});
			});
		});
		
		afterEach(function () {
			oExtensionProjectWizard = null;
		});
		
		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
	/* eslint-enable no-use-before-define */
});