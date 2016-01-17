define(['STF',
	"sap/watt/core/q", "sane-tests/util/RepositoryBrowserUtil"], function (STF, coreQ, repositoryBrowserUtil) {

	"use strict";
	
	/* eslint-disable no-unused-expressions */
	/* eslint-disable no-console */
	/* eslint-disable no-use-before-define */

	var suiteName = "fioriexttemplate_AppDescriptor";
	var iFrameWindow = null;
	var extensionProjectWizardUtil = null;
	var projectNameTM = "TM3";
	var extensionProjectNameTM = "TM3Extension";

	var sZipTMPath = "../test-resources/sap/watt/sane-tests/extensibility/AppDescriptor/TM3.zip";
	var sZipTMExtensionPath = "../test-resources/sap/watt/sane-tests/extensibility/AppDescriptor/TM3Extension.zip";

	describe('Extensibility with AppDescriptor', function () {
		this.timeout(180000);

		var oPerspectiveService;
		var oFakeFileDAOService;
		var oFilesystemDocumentProviderService;
		var oUI5ProjectHandlerService;
		var oGenerationService;
		var oUIContentService;
		var oTemplateService;
		var oContext;

		beforeEach(function (done) {
			STF.startWebIde(suiteName , { config: "extensibility/config.json" }).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;

				// get services
				oPerspectiveService = STF.getService(suiteName, "perspective");
				oFakeFileDAOService = STF.getService(suiteName, "fakeFileDAO");
				oFilesystemDocumentProviderService = STF.getService(suiteName, "filesystem.documentProvider");
				oUI5ProjectHandlerService = STF.getService(suiteName, "ui5projecthandler");
				oGenerationService = STF.getService(suiteName, "generation");
				oUIContentService = STF.getService(suiteName, "uicontent");
				oTemplateService = STF.getService(suiteName, "template");
				// get context
				oContext = oUIContentService.context;

				// require the utility class from the context running in Web IDE
				STF.require(suiteName, ["../test-resources/sap/watt/sane-tests/extensibility/util/WizardTestUtil"]).spread(function (utilsInstance) {
					extensionProjectWizardUtil = utilsInstance;
					done();
				});
			});
		});

		/**
		 * Import an application with manifest.json and create an extension project for it.
		 */
		function importZipWithAppDescriptorAndCreateExtensionProject(done, sFolderName, sZipPath, oExpectations) {

			return oPerspectiveService.renderPerspective("development").then(function () {
				return repositoryBrowserUtil.importZipIntoCleanFolder(suiteName, sFolderName, iFrameWindow, sZipPath).then(function(oCreatedFolder) {
					expect(oCreatedFolder).to.exist;

					var sParentName = oCreatedFolder.getEntity().getName();

					var oResult = {};
					return extensionProjectWizardUtil.createLocalExtensionProject(iFrameWindow, oContext, sParentName, oResult, function () {

						expect(oResult.extensionProjectName).to.exist;
						/* eslint-disable no-undef */
						assert.equal(oResult.extensionProjectName, sParentName + "Extension");
						/* eslint-disable no-undef */

						var aExtesionProjDocPromises = [];
						aExtesionProjDocPromises.push(oFilesystemDocumentProviderService.getDocument("/" + oResult.extensionProjectName + "/webapp/manifest.json"));
						aExtesionProjDocPromises.push(oFilesystemDocumentProviderService.getDocument("/" + oResult.extensionProjectName + "/webapp/Component.js"));
						return Q.all(aExtesionProjDocPromises).spread(function(oManifestDoc, oComponentDoc) {

							// expect to have manifest.json and Component.js in the extension project
							expect(oManifestDoc).to.exist;
							expect(oComponentDoc).to.exist;
							
							// investigate the extension project's manifest.json
							var aAttributesPromises = [];
							aAttributesPromises.push(oUI5ProjectHandlerService.getAttribute(oManifestDoc, "sap.app"));
							aAttributesPromises.push(oUI5ProjectHandlerService.getAttribute(oManifestDoc, "sap.ui"));
							aAttributesPromises.push(oUI5ProjectHandlerService.getAttribute(oManifestDoc, "sap.ui5"));

							return Q.all(aAttributesPromises).spread(function () {

								var manifestId = arguments[0].id;
								assert.equal(manifestId, oExpectations.sapApp.id);

								var manifestTitle = arguments[0].title;
								assert.equal(manifestTitle, oExpectations.sapApp.title);

								var oManifestIcons = arguments[1].icons;
								assert.equal(oManifestIcons.icon, oExpectations.icons.icon);
								assert.equal(oManifestIcons.favIcon, oExpectations.icons.favIcon);

								var oManifestDeviceTypes = arguments[1].deviceTypes;
								assert.equal(oManifestDeviceTypes.desktop, true);
								assert.equal(oManifestDeviceTypes.tablet, true);
								assert.equal(oManifestDeviceTypes.phone, true);

								var aManifestSupportedThemes = arguments[1].supportedThemes;
								assert.equal(aManifestSupportedThemes[0], "sap_hcb,sap_bluecrystal");

								var oManifestDependencies = arguments[2].dependencies;
								assert.equal(oManifestDependencies.minUI5Version, "${sap.ui5.dist.version}");

								var oManifestExtends = arguments[2].extends;
								assert.equal(oManifestExtends.component, oExpectations.component);

								var oContentDensities = arguments[2].contentDensities;
								assert.equal(oContentDensities.compact, true);
								assert.equal(oContentDensities.cozy, true);


								// investigate the Component.js created
								return oComponentDoc.getContent().then(function(sCreatedComponentContent) {
									assert.equal(sCreatedComponentContent, oExpectations.expectedComponentContent);
									done();
								});
							});
						});
					}).fail(function (oError) {
						assert(false, oError.message);
						console.log(oError);
					});
				});
			});
		}

		/**
		 * Imports an application with manifest.json and its matching extension project.
		 * @returns	{object} - the created extension project document.
		 */
		function importOriginalAppAndItsExtensionProject() {
			// import the original application
			return repositoryBrowserUtil.importZipIntoCleanFolder(suiteName, projectNameTM, iFrameWindow, sZipTMPath).then(function (oCreatedFolder) {
				expect(oCreatedFolder).to.exist;
				// import the extension project
				return repositoryBrowserUtil.importZipIntoCleanFolder(suiteName, extensionProjectNameTM, iFrameWindow, sZipTMExtensionPath).then(function (oCreatedExtensionFolder) {
					expect(oCreatedExtensionFolder).to.exist;
					return oCreatedExtensionFolder;
				});
			});
		}

		//########################### App Descriptor: Create Extension Project Tests #####################################
		it("Imports 'SAPUI5 Master-Detail Application' (A.K.A. Thomas Marz's internal template), and creates an Extension Project for it)", function(done) {
			console.log("start - create extension project for TM template");
			var sSAPUI5MDAppName = "sap_ui_ui5_template_plugin_2masterdetail";
			var sPathToZip1 = "../test-resources/sap/watt/sane-tests/extensibility/AppDescriptor/sap_ui_ui5_template_plugin_2masterdetail.zip";
			var oExpectations1 = {sapApp: {id: "b." + sSAPUI5MDAppName + "Extension", title: "{{appTitle}}"},
				icons: {icon: "sap-icon://detail-view", favIcon: ""},
				component: "b",
				expectedComponentContent: "jQuery.sap.declare(\"b.sap_ui_ui5_template_plugin_2masterdetailExtension.Component\");\n\n// use the load function for getting the optimized preload file if present\nsap.ui.component.load({\n\tname: \"b\",\n\t// Use the below URL to run the extended application when SAP-delivered application located in a local cloud environment:\n\t//url: jQuery.sap.getModulePath(\"b.sap_ui_ui5_template_plugin_2masterdetailExtension\") + \"/../../sap_ui_ui5_template_plugin_2masterdetail/webapp\"\t\n\t// Use the below url to run the extended application when SAP-delivered application located in a cloud environment:\n\turl: jQuery.sap.getModulePath(\"b.sap_ui_ui5_template_plugin_2masterdetailExtension\") +\n\t\t\"/../orion/file/Hugo-OrionContent/sap_ui_ui5_template_plugin_2masterdetail/webapp\"\n\t// we use a URL relative to our own component\n\t// extension application is deployed with customer namespace\n});\n\nthis.b.Component.extend(\"b.sap_ui_ui5_template_plugin_2masterdetailExtension.Component\", {\n\tmetadata: {\n\t\tmanifest: \"json\"\n\t}\n});"
			};

			importZipWithAppDescriptorAndCreateExtensionProject(done, sSAPUI5MDAppName, sPathToZip1, oExpectations1);
		});

		it('Imports an internal Sample App and creates an Extension Project for it', function (done) {
			console.log("start - create extension project for shop");
			var sInternalShopAppName = "nw.epm.refapps.shop";
			var sPathToZip2 = "../test-resources/sap/watt/sane-tests/extensibility/AppDescriptor/nw.epm.refapps.shop.zip";
			var oExpectations2 = {sapApp: {id: sInternalShopAppName + "." + sInternalShopAppName + "Extension", title: "{{shellTitle}}"},
				icons: {icon: "sap-icon://Fiori6/F0866", favIcon: "icon/F0866_My_Shops.ico"},
				component: "nw.epm.refapps.shop",
				expectedComponentContent: "jQuery.sap.declare(\"nw.epm.refapps.shop.nw.epm.refapps.shopExtension.Component\");\n\n// use the load function for getting the optimized preload file if present\nsap.ui.component.load({\n\tname: \"nw.epm.refapps.shop\",\n\t// Use the below URL to run the extended application when SAP-delivered application located in a local cloud environment:\n\t//url: jQuery.sap.getModulePath(\"nw.epm.refapps.shop.nw.epm.refapps.shopExtension\") + \"/../../nw.epm.refapps.shop/src/main/webapp\"\t\n\t// Use the below url to run the extended application when SAP-delivered application located in a cloud environment:\n\turl: jQuery.sap.getModulePath(\"nw.epm.refapps.shop.nw.epm.refapps.shopExtension\") +\n\t\t\"/../orion/file/Hugo-OrionContent/nw.epm.refapps.shop/src/main/webapp\"\n\t// we use a URL relative to our own component\n\t// extension application is deployed with customer namespace\n});\n\nthis.nw.epm.refapps.shop.Component.extend(\"nw.epm.refapps.shop.nw.epm.refapps.shopExtension.Component\", {\n\tmetadata: {\n\t\tmanifest: \"json\"\n\t}\n});"
			};

			importZipWithAppDescriptorAndCreateExtensionProject(done, sInternalShopAppName, sPathToZip2, oExpectations2);
		});

		//########################### App Descriptor: Create Extensions Tests #####################################
		it("Create Hide Control Extension: Hide 'page' control in Detail view", function() {

			var sParentDetailController = "sap.ui.define([\"ns\/controller\/BaseController\",\"sap\/ui\/model\/json\/JSONModel\",\"ns\/model\/formatter\"],function(e,t,i){\"use strict\";return e.extend(\"ns.controller.Detail\",{formatter:i,onInit:function(){var e=new t({busy:!1,delay:0});this.getRouter().getRoute(\"object\").attachPatternMatched(this._onObjectMatched,this),this.setModel(e,\"detailView\"),this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this)),this.extHookOnInit&&this.extHookOnInit(),this.extHookOnInit1&&this.extHookOnInit1()},onShareEmailPress:function(){var e=this.getModel(\"detailView\");sap.m.URLHelper.triggerEmail(null,e.getProperty(\"\/shareSendEmailSubject\"),e.getProperty(\"\/shareSendEmailMessage\"))},onShareInJamPress:function(){var e=this.getModel(\"detailView\"),t=sap.ui.getCore().createComponent({name:\"sap.collaboration.components.fiori.sharing.dialog\",settings:{object:{id:location.href,share:e.getProperty(\"\/shareOnJamTitle\")}}});t.open()},_onObjectMatched:function(e){var t=\"\/CarrierCollection(\'\"+e.getParameter(\"arguments\").objectId+\"\')\";this._bindView(t)},_bindView:function(e){var t=this.getModel(\"detailView\");t.setProperty(\"\/busy\",!1),this.getView().bindElement({path:e,events:{change:this._onBindingChange.bind(this),dataRequested:function(){t.setProperty(\"\/busy\",!0)},dataReceived:function(){t.setProperty(\"\/busy\",!1)}}})},_onBindingChange:function(){var e=this.getView(),t=e.getElementBinding();if(!t.getBoundContext())return this.getRouter().getTargets().display(\"detailObjectNotFound\"),void this.getOwnerComponent().oListSelector.clearMasterListSelection();var i=t.getPath(),n=this.getResourceBundle(),o=e.getModel().getObject(i),a=o.carrid,r=o.CARRNAME,s=this.getModel(\"detailView\");this.getOwnerComponent().oListSelector.selectAListItem(i),s.setProperty(\"\/saveAsTileTitle\",n.getText(\"shareSaveTileAppTitle\",[r])),s.setProperty(\"\/shareOnJamTitle\",r),s.setProperty(\"\/shareSendEmailSubject\",n.getText(\"shareSendEmailObjectSubject\",[a])),s.setProperty(\"\/shareSendEmailMessage\",n.getText(\"shareSendEmailObjectMessage\",[r,a,location.href]))},_onMetadataLoaded:function(){var e=this.getView().getBusyIndicatorDelay(),t=this.getModel(\"detailView\");t.setProperty(\"\/delay\",0),t.setProperty(\"\/busy\",!0),t.setProperty(\"\/delay\",e)}})});";
			var sParentDetailView = "<mvc:View controllerName=\"ns.controller.Detail\" xmlns=\"sap.m\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:core=\"sap.ui.core\" xmlns:semantic=\"sap.m.semantic\" xmlns:footerbar=\"sap.ushell.ui.footerbar\"> <semantic:DetailPage id=\"page\" navButtonPress=\"onNavBack\" showNavButton=\"{device>/system/phone}\" title=\"{i18n>detailTitle}\" busy=\"{detailView>/busy}\" busyIndicatorDelay=\"{detailView>/delay}\"> <semantic:content> <ObjectHeader id=\"objectHeader\" title=\"{CARRNAME}\"></ObjectHeader><IconTabBar id=\"iconTabBar\" class=\"sapUiResponsiveContentPadding\"><items><IconTabFilter id=\"iconTabBarFilter1\" icon=\"sap-icon://hint\" tooltip=\"{i18n>detailIconTabBarInfo}\"> </IconTabFilter><IconTabFilter id=\"iconTabBarFilter2\" icon=\"sap-icon://attachment\" tooltip=\"{i18n>detailIconTabBarAttachments}\"> </IconTabFilter><core:ExtensionPoint name=\"extListItemInfo\" /></items></IconTabBar></semantic:content><semantic:sendEmailAction> <semantic:SendEmailAction id=\"shareEmail\" press=\"onShareEmailPress\"/></semantic:sendEmailAction><semantic:shareInJamAction><semantic:ShareInJamAction id=\"shareInJam\" visible=\"{FLP>/isShareInJamActive}\" press=\"onShareInJamPress\"/></semantic:shareInJamAction><semantic:saveAsTileAction> <footerbar:AddBookmarkButton id=\"shareTile\" title=\"{detailView>/saveAsTileTitle}\"/></semantic:saveAsTileAction></semantic:DetailPage></mvc:View>";
			var sParentManifest = "{\"_version\":\"1.1.0\",\"sap.app\":{\"_version\":\"1.1.0\",\"id\":\"${project.artifactId}\",\"type\":\"application\",\"resources\":\"resources.json\",\"i18n\":\"i18n\/i18n.properties\",\"title\":\"{{appTitle}}\",\"description\":\"{{appDescription}}\",\"applicationVersion\":{\"version\":\"${project.version}\"},\"ach\":\"\",\"dataSources\":{\"mainService\":{\"uri\":\"\/sap\/opu\/odata\/iwfnd\/RMTSAMPLEFLIGHT\/\",\"type\":\"OData\",\"settings\":{\"odataVersion\":\"2.0\",\"localUri\":\"localService\/metadata.xml\"}}},\"sourceTemplate\":{\"id\":\"sap.ui.ui5-template-plugin.2masterdetail\",\"version\":\"1.0.10\"}},\"sap.ui\":{\"_version\":\"1.1.0\",\"technology\":\"UI5\",\"icons\":{\"icon\":\"sap-icon:\/\/detail-view\",\"favIcon\":\"\",\"phone\":\"\",\"phone@2\":\"\",\"tablet\":\"\",\"tablet@2\":\"\"},\"deviceTypes\":{\"desktop\":true,\"tablet\":true,\"phone\":true},\"supportedThemes\":[\"sap_hcb\",\"sap_bluecrystal\"]},\"sap.ui5\":{\"_version\":\"1.1.0\",\"rootView\":\"ns.view.App\",\"dependencies\":{\"minUI5Version\":\"${sap.ui5.dist.version}\",\"libs\":{\"sap.ui.core\":{},\"sap.m\":{},\"sap.ui.layout\":{}}},\"contentDensities\":{\"compact\":true,\"cozy\":true},\"models\":{\"i18n\":{\"type\":\"sap.ui.model.resource.ResourceModel\",\"settings\":{\"bundleName\":\"ns.i18n.i18n\"}},\"\":{\"dataSource\":\"mainService\",\"settings\":{\"metadataUrlParams\":{\"sap-documentation\":\"heading\"}}}},\"routing\":{\"config\":{\"routerClass\":\"sap.m.routing.Router\",\"viewType\":\"XML\",\"viewPath\":\"ns.view\",\"controlId\":\"idAppControl\",\"controlAggregation\":\"detailPages\",\"bypassed\":{\"target\":[\"master\",\"notFound\"]}},\"routes\":[{\"pattern\":\"\",\"name\":\"master\",\"target\":[\"object\",\"master\"]},{\"pattern\":\"CarrierCollection\/{objectId}\",\"name\":\"object\",\"target\":[\"master\",\"object\"]}],\"targets\":{\"master\":{\"viewName\":\"Master\",\"viewLevel\":1,\"viewId\":\"master\",\"controlAggregation\":\"masterPages\"},\"object\":{\"viewName\":\"Detail\",\"viewId\":\"detail\",\"viewLevel\":2},\"detailObjectNotFound\":{\"viewName\":\"DetailObjectNotFound\",\"viewId\":\"detailObjectNotFound\"},\"detailNoObjectsAvailable\":{\"viewName\":\"DetailNoObjectsAvailable\",\"viewId\":\"detailNoObjectsAvailable\"},\"notFound\":{\"viewName\":\"NotFound\",\"viewId\":\"notFound\"}}}}}";

			return oTemplateService.getTemplate("fioriexttemplate.hidecontrolcomponent").then(function(oHideControlTemplate) {

				var oParentViews = {
					"Detail.view.xml" : sParentDetailView
				};

				var oParentControllers = {
					"Detail.controller.js" : sParentDetailController
				};

				var oFileStructure = createFileStructure(sParentManifest, oParentViews, oParentControllers);

				return oFakeFileDAOService.setContent(oFileStructure).then(function() {
					return oFilesystemDocumentProviderService.getDocument("/extensionProject").then(function(oExtensionProjectDocument){
						var oExtensionCommon = {
							extensionId: "page",
							resourceId: "ns.view.Detail",
							resourceLocationPath: "webapp/view/",
							resourceName: "Detail",
							selectedDocumentPath: "/parentProject/webapp/view/Detail.view.xml"
						};

						var model = createModelForExtensionWithManifest(oExtensionCommon);

						return oGenerationService.generate("/extensionProject", oHideControlTemplate, model, false, oExtensionProjectDocument).then(function() {
							// get the manifest of the extension project
							return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/manifest.json").then(function(oManifestDoc) {
								// analyze the manifest.json using the project handler
								return oUI5ProjectHandlerService.getAllExtensions(oManifestDoc).then(function(oAllExtensions) {
									expect(oAllExtensions).to.exist;

									/* This is what should be in oAllExtensions:
									 * "sap.ui.viewModifications": {
									 * "ns.view.Detail": {
									 *     "page": {
									 *        "visible": false
									 *     }
									 * }
									 *}
									 */
									expect(oAllExtensions["sap.ui.viewModifications"]).to.exist;
									expect(oAllExtensions["sap.ui.viewModifications"]["ns.view.Detail"]).to.exist;
									expect(oAllExtensions["sap.ui.viewModifications"]["ns.view.Detail"].page).to.exist;
									expect(oAllExtensions["sap.ui.viewModifications"]["ns.view.Detail"].page.visible).to.be.false;
								});
							});
						});
					});
				});
			});
		});

		it("Create Extend View/Fragment Extension: Extend extListItemInfo extension point in Detail view", function() {

			var sParentDetailController = "sap.ui.define([\"ns\/controller\/BaseController\",\"sap\/ui\/model\/json\/JSONModel\",\"ns\/model\/formatter\"],function(e,t,i){\"use strict\";return e.extend(\"ns.controller.Detail\",{formatter:i,onInit:function(){var e=new t({busy:!1,delay:0});this.getRouter().getRoute(\"object\").attachPatternMatched(this._onObjectMatched,this),this.setModel(e,\"detailView\"),this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this)),this.extHookOnInit&&this.extHookOnInit(),this.extHookOnInit1&&this.extHookOnInit1()},onShareEmailPress:function(){var e=this.getModel(\"detailView\");sap.m.URLHelper.triggerEmail(null,e.getProperty(\"\/shareSendEmailSubject\"),e.getProperty(\"\/shareSendEmailMessage\"))},onShareInJamPress:function(){var e=this.getModel(\"detailView\"),t=sap.ui.getCore().createComponent({name:\"sap.collaboration.components.fiori.sharing.dialog\",settings:{object:{id:location.href,share:e.getProperty(\"\/shareOnJamTitle\")}}});t.open()},_onObjectMatched:function(e){var t=\"\/CarrierCollection(\'\"+e.getParameter(\"arguments\").objectId+\"\')\";this._bindView(t)},_bindView:function(e){var t=this.getModel(\"detailView\");t.setProperty(\"\/busy\",!1),this.getView().bindElement({path:e,events:{change:this._onBindingChange.bind(this),dataRequested:function(){t.setProperty(\"\/busy\",!0)},dataReceived:function(){t.setProperty(\"\/busy\",!1)}}})},_onBindingChange:function(){var e=this.getView(),t=e.getElementBinding();if(!t.getBoundContext())return this.getRouter().getTargets().display(\"detailObjectNotFound\"),void this.getOwnerComponent().oListSelector.clearMasterListSelection();var i=t.getPath(),n=this.getResourceBundle(),o=e.getModel().getObject(i),a=o.carrid,r=o.CARRNAME,s=this.getModel(\"detailView\");this.getOwnerComponent().oListSelector.selectAListItem(i),s.setProperty(\"\/saveAsTileTitle\",n.getText(\"shareSaveTileAppTitle\",[r])),s.setProperty(\"\/shareOnJamTitle\",r),s.setProperty(\"\/shareSendEmailSubject\",n.getText(\"shareSendEmailObjectSubject\",[a])),s.setProperty(\"\/shareSendEmailMessage\",n.getText(\"shareSendEmailObjectMessage\",[r,a,location.href]))},_onMetadataLoaded:function(){var e=this.getView().getBusyIndicatorDelay(),t=this.getModel(\"detailView\");t.setProperty(\"\/delay\",0),t.setProperty(\"\/busy\",!0),t.setProperty(\"\/delay\",e)}})});";
			var sParentDetailView = "<mvc:View controllerName=\"ns.controller.Detail\" xmlns=\"sap.m\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:core=\"sap.ui.core\" xmlns:semantic=\"sap.m.semantic\" xmlns:footerbar=\"sap.ushell.ui.footerbar\"> <semantic:DetailPage id=\"page\" navButtonPress=\"onNavBack\" showNavButton=\"{device>/system/phone}\" title=\"{i18n>detailTitle}\" busy=\"{detailView>/busy}\" busyIndicatorDelay=\"{detailView>/delay}\"> <semantic:content> <ObjectHeader id=\"objectHeader\" title=\"{CARRNAME}\"></ObjectHeader><IconTabBar id=\"iconTabBar\" class=\"sapUiResponsiveContentPadding\"><items><IconTabFilter id=\"iconTabBarFilter1\" icon=\"sap-icon://hint\" tooltip=\"{i18n>detailIconTabBarInfo}\"> </IconTabFilter><IconTabFilter id=\"iconTabBarFilter2\" icon=\"sap-icon://attachment\" tooltip=\"{i18n>detailIconTabBarAttachments}\"> </IconTabFilter><core:ExtensionPoint name=\"extListItemInfo\" /></items></IconTabBar></semantic:content><semantic:sendEmailAction> <semantic:SendEmailAction id=\"shareEmail\" press=\"onShareEmailPress\"/></semantic:sendEmailAction><semantic:shareInJamAction><semantic:ShareInJamAction id=\"shareInJam\" visible=\"{FLP>/isShareInJamActive}\" press=\"onShareInJamPress\"/></semantic:shareInJamAction><semantic:saveAsTileAction> <footerbar:AddBookmarkButton id=\"shareTile\" title=\"{detailView>/saveAsTileTitle}\"/></semantic:saveAsTileAction></semantic:DetailPage></mvc:View>";
			var sParentManifest = "{\"_version\":\"1.1.0\",\"sap.app\":{\"_version\":\"1.1.0\",\"id\":\"${project.artifactId}\",\"type\":\"application\",\"resources\":\"resources.json\",\"i18n\":\"i18n\/i18n.properties\",\"title\":\"{{appTitle}}\",\"description\":\"{{appDescription}}\",\"applicationVersion\":{\"version\":\"${project.version}\"},\"ach\":\"\",\"dataSources\":{\"mainService\":{\"uri\":\"\/sap\/opu\/odata\/iwfnd\/RMTSAMPLEFLIGHT\/\",\"type\":\"OData\",\"settings\":{\"odataVersion\":\"2.0\",\"localUri\":\"localService\/metadata.xml\"}}},\"sourceTemplate\":{\"id\":\"sap.ui.ui5-template-plugin.2masterdetail\",\"version\":\"1.0.10\"}},\"sap.ui\":{\"_version\":\"1.1.0\",\"technology\":\"UI5\",\"icons\":{\"icon\":\"sap-icon:\/\/detail-view\",\"favIcon\":\"\",\"phone\":\"\",\"phone@2\":\"\",\"tablet\":\"\",\"tablet@2\":\"\"},\"deviceTypes\":{\"desktop\":true,\"tablet\":true,\"phone\":true},\"supportedThemes\":[\"sap_hcb\",\"sap_bluecrystal\"]},\"sap.ui5\":{\"_version\":\"1.1.0\",\"rootView\":\"ns.view.App\",\"dependencies\":{\"minUI5Version\":\"${sap.ui5.dist.version}\",\"libs\":{\"sap.ui.core\":{},\"sap.m\":{},\"sap.ui.layout\":{}}},\"contentDensities\":{\"compact\":true,\"cozy\":true},\"models\":{\"i18n\":{\"type\":\"sap.ui.model.resource.ResourceModel\",\"settings\":{\"bundleName\":\"ns.i18n.i18n\"}},\"\":{\"dataSource\":\"mainService\",\"settings\":{\"metadataUrlParams\":{\"sap-documentation\":\"heading\"}}}},\"routing\":{\"config\":{\"routerClass\":\"sap.m.routing.Router\",\"viewType\":\"XML\",\"viewPath\":\"ns.view\",\"controlId\":\"idAppControl\",\"controlAggregation\":\"detailPages\",\"bypassed\":{\"target\":[\"master\",\"notFound\"]}},\"routes\":[{\"pattern\":\"\",\"name\":\"master\",\"target\":[\"object\",\"master\"]},{\"pattern\":\"CarrierCollection\/{objectId}\",\"name\":\"object\",\"target\":[\"master\",\"object\"]}],\"targets\":{\"master\":{\"viewName\":\"Master\",\"viewLevel\":1,\"viewId\":\"master\",\"controlAggregation\":\"masterPages\"},\"object\":{\"viewName\":\"Detail\",\"viewId\":\"detail\",\"viewLevel\":2},\"detailObjectNotFound\":{\"viewName\":\"DetailObjectNotFound\",\"viewId\":\"detailObjectNotFound\"},\"detailNoObjectsAvailable\":{\"viewName\":\"DetailNoObjectsAvailable\",\"viewId\":\"detailNoObjectsAvailable\"},\"notFound\":{\"viewName\":\"NotFound\",\"viewId\":\"notFound\"}}}}}";

			return oTemplateService.getTemplate("fioriexttemplate.extendviewcomponent").then(function(oExtendViewTemplate) {

				var oParentViews = {
					"Detail.view.xml" : sParentDetailView
				};

				var oParentControllers = {
					"Detail.controller.js" : sParentDetailController
				};

				var oFileStructure = createFileStructure(sParentManifest, oParentViews, oParentControllers);

				return oFakeFileDAOService.setContent(oFileStructure).then(function() {
					return oFilesystemDocumentProviderService.getDocument("/extensionProject").then(function(oExtensionProjectDocument){
						var oExtensionCommon = {
							extensionId: "extListItemInfo",
							resourceId: "ns.view.Detail",
							resourceLocationPath: "webapp/view/",
							resourceName: "Detail",
							selectedDocumentPath: "/parentProject/webapp/view/Detail.view.xml"
						};

						var model = createModelForExtensionWithManifest(oExtensionCommon);

						return oGenerationService.generate("/extensionProject", oExtendViewTemplate, model, false, oExtensionProjectDocument).then(function() {
							// get the manifest of the extension project
							return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/manifest.json").then(function(oManifestDoc) {
								// analyze the manifest.json using the project handler
								return oUI5ProjectHandlerService.getAllExtensions(oManifestDoc).then(function(oAllExtensions) {
									expect(oAllExtensions).to.exist;

									/* This is what should be in oAllExtensions:
									 * "sap.ui.viewExtensions": {
									 * "ns.view.Detail": {
									 * "extListItemInfo": {
									 * 	 "className": "sap.ui.core.Fragment",
									 * 	 "fragmentName": "ns.extensionProject.view.Detail_extListItemInfoCustom",
									 * 	 "type": "XML"
									 * }
									 *}
									 *}
									 */
									expect(oAllExtensions["sap.ui.viewExtensions"]).to.exist;
									expect(oAllExtensions["sap.ui.viewExtensions"]["ns.view.Detail"]).to.exist;
									expect(oAllExtensions["sap.ui.viewExtensions"]["ns.view.Detail"].extListItemInfo).to.exist;
									expect(oAllExtensions["sap.ui.viewExtensions"]["ns.view.Detail"].extListItemInfo.fragmentName).to.equal("ns.extensionProject.view.Detail_extListItemInfoCustom");

									return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/view/Detail_extListItemInfoCustom.fragment.xml").then(function(oCustomFragment) {
										expect(oCustomFragment).to.exist;
										var sCustomFragmentContent = oCustomFragment._savedContent;
										expect(sCustomFragmentContent.startsWith("<core:FragmentDefinition xmlns:core")).to.be.true;
									});
								});
							});
						});
					});
				});
			});
		});

		function createReplaceServiceExtension(sPerentManifest) {
			return oTemplateService.getTemplate("fioriexttemplate.replaceservicecomponent").then(function(oTemplate) {
				var oFileStructure = {
					"targetProject": {
						"webapp": {
							"manifest.json": '{\
								"_version": "1.1.0",\
								"sap.app": {\
									"_version": "1.1.0",\
									"id": "${project.artifactId}",\
									"type": "application"\
								}\
							}',
							"Component.js": "metadata: {manifest: \"json\"}"
						}
					},
					"parentProject" : {
						"webapp": {
							"manifest.json": sPerentManifest,
							"Component.js": "metadata: {manifest: \"json\"}"
						}
					}
				};
				return oFakeFileDAOService.setContent(oFileStructure).then(function() {
					return oFilesystemDocumentProviderService.getDocument("/targetProject").then(function(oTargetDocument){
						var model = {
							extensibility: {manifest: "/parentProject/webapp/manifest.json",
								component: "/parentProject/webapp/Component.js",
								type: "Workspace"},
							extensionProjectPath: "/targetProject",
							connectionData: {runtimeUrl:
								"/sap/opu/odata/sap/SRA018_SO_TRACKING_SRV/",
								metadataContent: '<?xml version="1.0" encoding="utf-8"?><edmx:Edmx Version="1.0"</edmx:Edmx>'}
						};
						return oGenerationService.generate("/targetProject", oTemplate, model, false, oTargetDocument).then(function(){
							return oFilesystemDocumentProviderService.getDocument("/targetProject/webapp/manifest.json").then(function(oManifestDoc) {
								// analyze the manifest.json using the project handler
								return oUI5ProjectHandlerService.getDataSources(oManifestDoc).then(function(oDataSources) {
									expect(oDataSources).to.exist;
									expect(Object.keys(oDataSources).length).to.equal(1);
									expect(oDataSources.mainService).to.exist;
									expect(oDataSources.mainService.uri).to.equal("/sap/opu/odata/sap/SRA018_SO_TRACKING_SRV/");
									expect(oDataSources.mainService.settings.localUri).to.equal("./localService/metadata.xml");
									return oUI5ProjectHandlerService.getConfigs(oManifestDoc).then(function(oConfigs) {
										return oConfigs;
									});
								});
							});
						});
					});
				});
			});
		}

		it("Creates a replace service extension. Parent project doesn't have scaffolding", function() {
			var sParentManifestNoScaffolding = '{\
				"_version": "1.1.0",\
				"sap.app": {\
					"_version": "1.1.0",\
					"id": "${project.artifactId}",\
					"type": "application",\
					"dataSources": {\
						"mainService": {\
							"uri": "/sap/opu/odata/iwfnd/RMTSAMPLEFLIGHT/",\
							"type": "OData",\
							"settings": {\
								"odataVersion": "2.0",\
								"localUri": "localService/metadata.xml"\
							}\
						}\
					}\
				}\
			}';
						
			return createReplaceServiceExtension(sParentManifestNoScaffolding).then(function(oConfigs) {
				expect(oConfigs).not.to.exist;// No configs are expected
			});
		});

		it("Creates a replace service extension. Parent project has scaffolding", function() {
			var sParentManifestWithScaffolding = '{\
				"_version": "1.1.0",\
				"sap.app": {\
					"_version": "1.1.0",\
					"id": "${project.artifactId}",\
					"type": "application",\
					"dataSources": {\
						"mainService": {\
							"uri": "/sap/opu/odata/iwfnd/RMTSAMPLEFLIGHT/",\
							"type": "OData",\
							"settings": {\
								"odataVersion": "2.0",\
								"localUri": "localService/metadata.xml"\
							}\
						}\
					}\
				},\
				"sap.ui5": {\
					"extends": {\
						"component" : "sap.ca.scfld.md"\
					}\
				}\
			}';

			return createReplaceServiceExtension(sParentManifestWithScaffolding).then(function(oConfigs) {
				expect(oConfigs).to.exist;
				expect(Object.keys(oConfigs).length).to.equal(1);
				expect(oConfigs["sap.ca.serviceConfigs"]).to.exist;
				expect(oConfigs["sap.ca.serviceConfigs"][0].name).to.equal("mainService");
				expect(oConfigs["sap.ca.serviceConfigs"][0].isDefault).to.equal(true);
			});
		});

		function createI18nExtension(sParentManifest, bIsScaffolding) {
			return oTemplateService.getTemplate("fioriexttemplate.i18ncomponent").then(function(oi18nTemplate) {
				var oFileStructure = {
					"extensionProject": {
						"webapp": {
							"manifest.json": '{\
								"_version": "1.1.0",\
								"sap.app": {\
									"_version": "1.1.0",\
									"id": "${project.artifactId}",\
									"type": "application"\
								}\
							}',
							"Component.js": "metadata: {manifest: \"json\"}"
						}
					},
					"parentProject" : {
						"webapp": {
							"i18n" : {
								"i18n_he.properties" : ""
							},
							"manifest.json": sParentManifest,
							"Component.js": "metadata: {manifest: \"json\"}"
						}
					}
				};

				return oFakeFileDAOService.setContent(oFileStructure).then(function() {
					return oFilesystemDocumentProviderService.getDocument("/extensionProject").then(function(oExtensionProjectDocument){
						var model = {
							extensibility: {
								manifest: "/parentProject/webapp/manifest.json",
								component: "/parentProject/webapp/Component.js",
								type: "Workspace",
								resourceBundle: "i18n/i18n.properties"
							},
							extensionProjectPath: "/extensionProject",
							extensionProjectNamespace: "parentProject.extensionProject"
						};

						return oGenerationService.generate("/extensionProject", oi18nTemplate, model, false, oExtensionProjectDocument).then(function() {
							// get the i18n folder from the extension project
							return oFilesystemDocumentProviderService.getDocument("/extensionProject/i18n").then(function(oCopiedI18nFolder) {
								// verify the i18n folder was copied from the parent project to the extension project
								//expect(oCopiedI18nFolder).to.exist;

								return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/manifest.json").then(function(oManifestDoc) {
									// analyze the manifest.json using the project handler

									if (bIsScaffolding) {
										return oUI5ProjectHandlerService.getConfigs(oManifestDoc).then(function(oConfigs) {
											expect(oConfigs).to.exist;
											expect(oConfigs["sap.ca.i18Nconfigs"]).to.exist;
											expect(oConfigs["sap.ca.i18Nconfigs"].bundleName).to.equal("parentProject.extensionProject.i18n.i18n");

											return oUI5ProjectHandlerService.getI18nPath(oManifestDoc).then(function(sI18nPath) {
												return sI18nPath;
											});
										});
									} else {
										return oUI5ProjectHandlerService.getModels(oManifestDoc).then(function(oModels) {
											expect(oModels).to.exist;
											expect(Object.keys(oModels).length).to.equal(1);
											expect(oModels.i18n).to.exist;
											expect(oModels.i18n.type).to.equal("sap.ui.model.resource.ResourceModel");
											expect(oModels.i18n.settings).to.exist;
											expect(oModels.i18n.settings.bundleName).to.equal("${project.artifactId}.i18n.i18n");

											return oUI5ProjectHandlerService.getI18nPath(oManifestDoc).then(function(sI18nPath) {
												return sI18nPath;
											});
										});
									}
								});
							});
						});
					});
				});
			});
		}

		it("Creates an i18n extension. No scaffolding", function() {
			var sParentManifestNoScaffolding = '{\
				"_version": "1.1.0",\
				"sap.app": {\
					"_version": "1.1.0",\
					"id": "${project.artifactId}",\
					"type": "application",\
					"dataSources": {\
						"mainService": {\
							"uri": "/sap/opu/odata/iwfnd/RMTSAMPLEFLIGHT/",\
							"type": "OData",\
							"settings": {\
								"odataVersion": "2.0",\
								"localUri": "localService/metadata.xml"\
							}\
						}\
					}\
				}\
			}';

			return createI18nExtension(sParentManifestNoScaffolding, false).then(function(sI18nPath) {
				expect(sI18nPath).to.equal("i18n/i18n.properties");
			});
		});

		it("Creates a replace service extension. With scaffolding", function() {
			var sParentManifestWithScaffolding = '{\
				"_version": "1.1.0",\
				"sap.app": {\
					"_version": "1.1.0",\
					"id": "${project.artifactId}",\
					"type": "application",\
					"dataSources": {\
						"mainService": {\
							"uri": "/sap/opu/odata/iwfnd/RMTSAMPLEFLIGHT/",\
							"type": "OData",\
							"settings": {\
								"odataVersion": "2.0",\
								"localUri": "localService/metadata.xml"\
							}\
						}\
					}\
				},\
				"sap.ui5": {\
					"extends": {\
						"component" : "sap.ca.scfld.md"\
					}\
				}\
			}';

			return createI18nExtension(sParentManifestWithScaffolding, true).then(function(sI18nPath) {
				expect(sI18nPath).to.equal("i18n/i18n.properties");
			});
		});

		function createFileStructure(sParentManifest, oParentViews, oParentControllers) {
			var oFileStructure = {
				"extensionProject": {
					"webapp": {
						"manifest.json": '{\
								"_version": "1.1.0",\
								"sap.app": {\
									"_version": "1.1.0",\
									"id": "${project.artifactId}",\
									"type": "application"\
								}\
							}',
						"Component.js": "metadata: {manifest: \"json\"}"
					}
				},
				"parentProject" : {
					"webapp": {
						"i18n" : {
							"i18n_he.properties" : ""
						},
						"manifest.json": sParentManifest,
						"Component.js": "metadata: {manifest: \"json\"}",
						"controller": oParentControllers,
						"view": oParentViews
					}
				}
			};

			return oFileStructure;
		}

		function createModelForExtensionWithManifest(oExtensionCommon) {
			var model = {
				extensibility: {
					manifest: "/parentProject/webapp/manifest.json",
					component: "/parentProject/webapp/Component.js",
					type: "Workspace",
					resourceBundle: "i18n/i18n.properties",
					controllers: {
						"Master": "/parentProject/webapp/controller/Master.controller.js",
						"Detail": "/parentProject/webapp/controller/Detail.controller.js"
					},
					views: {
						"Master": "/parentProject/webapp/view/Master.view.xml",
						"Detail": "/parentProject/webapp/view/Detail.view.xml"
					},
					namespace: "ns",
					parentResourceRootUrl: "../parentProject/webapp"
				},
				extensionProjectPath: "/extensionProject",
				extensionProjectNamespace: "ns.extensionProject",
				extensionProjectName: "extensionProject",
				extensionResourceLocationPath: "webapp/",
				fiori: {
					extendController: {
						parentControllerContent: {},
						parentMethodHeaders: [{
							header: "_onMetadataLoaded",
							params: []
						},{
							header: "_onBindingChange",
							params: []
						},{
							header: "_bindView",
							params: ["sObjectPath"]
						}],
						resourceSuffix: {}
					},
					extensionCommon: oExtensionCommon
				},
				resources: [{
					id: "ns.controller.Detail",
					name: "Detail",
					parentNamespace: "ns",
					path: "/parentProject/webapp/controller/Detail.controller.js",
					resourceLocationPath: "controller/",
					type: "controllers"
				},{
					id: "ns.view.Master",
					name: "Master",
					parentNamespace: "ns",
					path: "/parentProject/webapp/view/Master.view.xml",
					resourceLocationPath: "view/",
					type: "views"
				}]
			};

			return model;
		}

		it("Create Extend Controller Extension: Extend Detail controller with copy of original controller", function() {

			var sParentDetailController = "sap.ui.define([\"ns\/controller\/BaseController\",\"sap\/ui\/model\/json\/JSONModel\",\"ns\/model\/formatter\"],function(e,t,i){\"use strict\";return e.extend(\"ns.controller.Detail\",{formatter:i,onInit:function(){var e=new t({busy:!1,delay:0});this.getRouter().getRoute(\"object\").attachPatternMatched(this._onObjectMatched,this),this.setModel(e,\"detailView\"),this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this)),this.extHookOnInit&&this.extHookOnInit(),this.extHookOnInit1&&this.extHookOnInit1()},onShareEmailPress:function(){var e=this.getModel(\"detailView\");sap.m.URLHelper.triggerEmail(null,e.getProperty(\"\/shareSendEmailSubject\"),e.getProperty(\"\/shareSendEmailMessage\"))},onShareInJamPress:function(){var e=this.getModel(\"detailView\"),t=sap.ui.getCore().createComponent({name:\"sap.collaboration.components.fiori.sharing.dialog\",settings:{object:{id:location.href,share:e.getProperty(\"\/shareOnJamTitle\")}}});t.open()},_onObjectMatched:function(e){var t=\"\/CarrierCollection(\'\"+e.getParameter(\"arguments\").objectId+\"\')\";this._bindView(t)},_bindView:function(e){var t=this.getModel(\"detailView\");t.setProperty(\"\/busy\",!1),this.getView().bindElement({path:e,events:{change:this._onBindingChange.bind(this),dataRequested:function(){t.setProperty(\"\/busy\",!0)},dataReceived:function(){t.setProperty(\"\/busy\",!1)}}})},_onBindingChange:function(){var e=this.getView(),t=e.getElementBinding();if(!t.getBoundContext())return this.getRouter().getTargets().display(\"detailObjectNotFound\"),void this.getOwnerComponent().oListSelector.clearMasterListSelection();var i=t.getPath(),n=this.getResourceBundle(),o=e.getModel().getObject(i),a=o.carrid,r=o.CARRNAME,s=this.getModel(\"detailView\");this.getOwnerComponent().oListSelector.selectAListItem(i),s.setProperty(\"\/saveAsTileTitle\",n.getText(\"shareSaveTileAppTitle\",[r])),s.setProperty(\"\/shareOnJamTitle\",r),s.setProperty(\"\/shareSendEmailSubject\",n.getText(\"shareSendEmailObjectSubject\",[a])),s.setProperty(\"\/shareSendEmailMessage\",n.getText(\"shareSendEmailObjectMessage\",[r,a,location.href]))},_onMetadataLoaded:function(){var e=this.getView().getBusyIndicatorDelay(),t=this.getModel(\"detailView\");t.setProperty(\"\/delay\",0),t.setProperty(\"\/busy\",!0),t.setProperty(\"\/delay\",e)}})});";
			var sParentDetailView = "<mvc:View controllerName=\"ns.controller.Detail\" xmlns=\"sap.m\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:core=\"sap.ui.core\" xmlns:semantic=\"sap.m.semantic\" xmlns:footerbar=\"sap.ushell.ui.footerbar\"> <semantic:DetailPage id=\"page\" navButtonPress=\"onNavBack\" showNavButton=\"{device>/system/phone}\" title=\"{i18n>detailTitle}\" busy=\"{detailView>/busy}\" busyIndicatorDelay=\"{detailView>/delay}\"> <semantic:content> <ObjectHeader id=\"objectHeader\" title=\"{CARRNAME}\"></ObjectHeader><IconTabBar id=\"iconTabBar\" class=\"sapUiResponsiveContentPadding\"><items><IconTabFilter id=\"iconTabBarFilter1\" icon=\"sap-icon://hint\" tooltip=\"{i18n>detailIconTabBarInfo}\"> </IconTabFilter><IconTabFilter id=\"iconTabBarFilter2\" icon=\"sap-icon://attachment\" tooltip=\"{i18n>detailIconTabBarAttachments}\"> </IconTabFilter><core:ExtensionPoint name=\"extListItemInfo\" /></items></IconTabBar></semantic:content><semantic:sendEmailAction> <semantic:SendEmailAction id=\"shareEmail\" press=\"onShareEmailPress\"/></semantic:sendEmailAction><semantic:shareInJamAction><semantic:ShareInJamAction id=\"shareInJam\" visible=\"{FLP>/isShareInJamActive}\" press=\"onShareInJamPress\"/></semantic:shareInJamAction><semantic:saveAsTileAction> <footerbar:AddBookmarkButton id=\"shareTile\" title=\"{detailView>/saveAsTileTitle}\"/></semantic:saveAsTileAction></semantic:DetailPage></mvc:View>";
			var sParentManifest = "{\"_version\":\"1.1.0\",\"sap.app\":{\"_version\":\"1.1.0\",\"id\":\"${project.artifactId}\",\"type\":\"application\",\"resources\":\"resources.json\",\"i18n\":\"i18n\/i18n.properties\",\"title\":\"{{appTitle}}\",\"description\":\"{{appDescription}}\",\"applicationVersion\":{\"version\":\"${project.version}\"},\"ach\":\"\",\"dataSources\":{\"mainService\":{\"uri\":\"\/sap\/opu\/odata\/iwfnd\/RMTSAMPLEFLIGHT\/\",\"type\":\"OData\",\"settings\":{\"odataVersion\":\"2.0\",\"localUri\":\"localService\/metadata.xml\"}}},\"sourceTemplate\":{\"id\":\"sap.ui.ui5-template-plugin.2masterdetail\",\"version\":\"1.0.10\"}},\"sap.ui\":{\"_version\":\"1.1.0\",\"technology\":\"UI5\",\"icons\":{\"icon\":\"sap-icon:\/\/detail-view\",\"favIcon\":\"\",\"phone\":\"\",\"phone@2\":\"\",\"tablet\":\"\",\"tablet@2\":\"\"},\"deviceTypes\":{\"desktop\":true,\"tablet\":true,\"phone\":true},\"supportedThemes\":[\"sap_hcb\",\"sap_bluecrystal\"]},\"sap.ui5\":{\"_version\":\"1.1.0\",\"rootView\":\"ns.view.App\",\"dependencies\":{\"minUI5Version\":\"${sap.ui5.dist.version}\",\"libs\":{\"sap.ui.core\":{},\"sap.m\":{},\"sap.ui.layout\":{}}},\"contentDensities\":{\"compact\":true,\"cozy\":true},\"models\":{\"i18n\":{\"type\":\"sap.ui.model.resource.ResourceModel\",\"settings\":{\"bundleName\":\"ns.i18n.i18n\"}},\"\":{\"dataSource\":\"mainService\",\"settings\":{\"metadataUrlParams\":{\"sap-documentation\":\"heading\"}}}},\"routing\":{\"config\":{\"routerClass\":\"sap.m.routing.Router\",\"viewType\":\"XML\",\"viewPath\":\"ns.view\",\"controlId\":\"idAppControl\",\"controlAggregation\":\"detailPages\",\"bypassed\":{\"target\":[\"master\",\"notFound\"]}},\"routes\":[{\"pattern\":\"\",\"name\":\"master\",\"target\":[\"object\",\"master\"]},{\"pattern\":\"CarrierCollection\/{objectId}\",\"name\":\"object\",\"target\":[\"master\",\"object\"]}],\"targets\":{\"master\":{\"viewName\":\"Master\",\"viewLevel\":1,\"viewId\":\"master\",\"controlAggregation\":\"masterPages\"},\"object\":{\"viewName\":\"Detail\",\"viewId\":\"detail\",\"viewLevel\":2},\"detailObjectNotFound\":{\"viewName\":\"DetailObjectNotFound\",\"viewId\":\"detailObjectNotFound\"},\"detailNoObjectsAvailable\":{\"viewName\":\"DetailNoObjectsAvailable\",\"viewId\":\"detailNoObjectsAvailable\"},\"notFound\":{\"viewName\":\"NotFound\",\"viewId\":\"notFound\"}}}}}";

			return oTemplateService.getTemplate("fioriexttemplate.extendcontrollercomponent").then(function(oExtendControllerTemplate) {

				var oParentViews = {
					"Detail.view.xml" : sParentDetailView
				};

				var oParentControllers = {
					"Detail.controller.js" : sParentDetailController
				};

				var oFileStructure = createFileStructure(sParentManifest, oParentViews, oParentControllers);

				return oFakeFileDAOService.setContent(oFileStructure).then(function() {
					return oFilesystemDocumentProviderService.getDocument("/extensionProject").then(function(oExtensionProjectDocument){
						var oExtensionCommon = {
							customizationId: "sap.ui.controllerExtensions",
							extensionFilePath: "webapp/controller/DetailCustom",
							extensionId: undefined, // it's "Copy of Parent Controller" by default
							extensionResourceId: "ns.extensionProject.controller.DetailCustom",
							resourceId: "ns.controller.Detail",
							resourceLocationPath: "webapp/controller/",
							resourceName: "Detail",
							resourceSuffix: ".controller.js",
							resourceTypeName: "controllerName",
							selectedDocumentPath: "/parentProject/webapp/controller/Detail.controller.js"
						};

						var model = createModelForExtensionWithManifest(oExtensionCommon);

						return oGenerationService.generate("/extensionProject", oExtendControllerTemplate, model, false, oExtensionProjectDocument).then(function() {
							// get the manifest of the extension project
							return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/manifest.json").then(function(oManifestDoc) {
								// analyze the manifest.json using the project handler
								return oUI5ProjectHandlerService.getAllExtensions(oManifestDoc).then(function(oAllExtensions) {
									expect(oAllExtensions).to.exist;

									/* this is what should be in oAllExtensions:
									 * "sap.ui.controllerExtensions": {
									 * 	 "ns.controller.Detail": {
									 * 		"controllerName":"ns.extensionProject.controller.DetailCustom"
									 * 	 }
									 * }
									 */
									expect(oAllExtensions["sap.ui.controllerExtensions"]).to.exist;
									expect(oAllExtensions["sap.ui.controllerExtensions"]["ns.controller.Detail"]).to.exist;
									expect(oAllExtensions["sap.ui.controllerExtensions"]["ns.controller.Detail"].controllerName).to.equal("ns.extensionProject.controller.DetailCustom");

									return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/controller/DetailCustom.controller.js").then(function(oCustomCopyDetailController) {
										expect(oCustomCopyDetailController).to.exist;
										var sCustomCopyControllerContent = oCustomCopyDetailController._savedContent;
										expect(sCustomCopyControllerContent.startsWith("sap.ui.define")).to.be.true;
									});
								});
							});
						});
					});
				});
			});
		});

		it("Create Extend Controller Extension: Extend Detail controller with empty controller", function() {

			var sParentDetailController = "sap.ui.define([\"ns\/controller\/BaseController\",\"sap\/ui\/model\/json\/JSONModel\",\"ns\/model\/formatter\"],function(e,t,i){\"use strict\";return e.extend(\"ns.controller.Detail\",{formatter:i,onInit:function(){var e=new t({busy:!1,delay:0});this.getRouter().getRoute(\"object\").attachPatternMatched(this._onObjectMatched,this),this.setModel(e,\"detailView\"),this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this)),this.extHookOnInit&&this.extHookOnInit(),this.extHookOnInit1&&this.extHookOnInit1()},onShareEmailPress:function(){var e=this.getModel(\"detailView\");sap.m.URLHelper.triggerEmail(null,e.getProperty(\"\/shareSendEmailSubject\"),e.getProperty(\"\/shareSendEmailMessage\"))},onShareInJamPress:function(){var e=this.getModel(\"detailView\"),t=sap.ui.getCore().createComponent({name:\"sap.collaboration.components.fiori.sharing.dialog\",settings:{object:{id:location.href,share:e.getProperty(\"\/shareOnJamTitle\")}}});t.open()},_onObjectMatched:function(e){var t=\"\/CarrierCollection(\'\"+e.getParameter(\"arguments\").objectId+\"\')\";this._bindView(t)},_bindView:function(e){var t=this.getModel(\"detailView\");t.setProperty(\"\/busy\",!1),this.getView().bindElement({path:e,events:{change:this._onBindingChange.bind(this),dataRequested:function(){t.setProperty(\"\/busy\",!0)},dataReceived:function(){t.setProperty(\"\/busy\",!1)}}})},_onBindingChange:function(){var e=this.getView(),t=e.getElementBinding();if(!t.getBoundContext())return this.getRouter().getTargets().display(\"detailObjectNotFound\"),void this.getOwnerComponent().oListSelector.clearMasterListSelection();var i=t.getPath(),n=this.getResourceBundle(),o=e.getModel().getObject(i),a=o.carrid,r=o.CARRNAME,s=this.getModel(\"detailView\");this.getOwnerComponent().oListSelector.selectAListItem(i),s.setProperty(\"\/saveAsTileTitle\",n.getText(\"shareSaveTileAppTitle\",[r])),s.setProperty(\"\/shareOnJamTitle\",r),s.setProperty(\"\/shareSendEmailSubject\",n.getText(\"shareSendEmailObjectSubject\",[a])),s.setProperty(\"\/shareSendEmailMessage\",n.getText(\"shareSendEmailObjectMessage\",[r,a,location.href]))},_onMetadataLoaded:function(){var e=this.getView().getBusyIndicatorDelay(),t=this.getModel(\"detailView\");t.setProperty(\"\/delay\",0),t.setProperty(\"\/busy\",!0),t.setProperty(\"\/delay\",e)}})});";
			var sParentDetailView = "<mvc:View controllerName=\"ns.controller.Detail\" xmlns=\"sap.m\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:core=\"sap.ui.core\" xmlns:semantic=\"sap.m.semantic\" xmlns:footerbar=\"sap.ushell.ui.footerbar\"> <semantic:DetailPage id=\"page\" navButtonPress=\"onNavBack\" showNavButton=\"{device>/system/phone}\" title=\"{i18n>detailTitle}\" busy=\"{detailView>/busy}\" busyIndicatorDelay=\"{detailView>/delay}\"> <semantic:content> <ObjectHeader id=\"objectHeader\" title=\"{CARRNAME}\"></ObjectHeader><IconTabBar id=\"iconTabBar\" class=\"sapUiResponsiveContentPadding\"><items><IconTabFilter id=\"iconTabBarFilter1\" icon=\"sap-icon://hint\" tooltip=\"{i18n>detailIconTabBarInfo}\"> </IconTabFilter><IconTabFilter id=\"iconTabBarFilter2\" icon=\"sap-icon://attachment\" tooltip=\"{i18n>detailIconTabBarAttachments}\"> </IconTabFilter><core:ExtensionPoint name=\"extListItemInfo\" /></items></IconTabBar></semantic:content><semantic:sendEmailAction> <semantic:SendEmailAction id=\"shareEmail\" press=\"onShareEmailPress\"/></semantic:sendEmailAction><semantic:shareInJamAction><semantic:ShareInJamAction id=\"shareInJam\" visible=\"{FLP>/isShareInJamActive}\" press=\"onShareInJamPress\"/></semantic:shareInJamAction><semantic:saveAsTileAction> <footerbar:AddBookmarkButton id=\"shareTile\" title=\"{detailView>/saveAsTileTitle}\"/></semantic:saveAsTileAction></semantic:DetailPage></mvc:View>";
			var sParentManifest = "{\"_version\":\"1.1.0\",\"sap.app\":{\"_version\":\"1.1.0\",\"id\":\"${project.artifactId}\",\"type\":\"application\",\"resources\":\"resources.json\",\"i18n\":\"i18n\/i18n.properties\",\"title\":\"{{appTitle}}\",\"description\":\"{{appDescription}}\",\"applicationVersion\":{\"version\":\"${project.version}\"},\"ach\":\"\",\"dataSources\":{\"mainService\":{\"uri\":\"\/sap\/opu\/odata\/iwfnd\/RMTSAMPLEFLIGHT\/\",\"type\":\"OData\",\"settings\":{\"odataVersion\":\"2.0\",\"localUri\":\"localService\/metadata.xml\"}}},\"sourceTemplate\":{\"id\":\"sap.ui.ui5-template-plugin.2masterdetail\",\"version\":\"1.0.10\"}},\"sap.ui\":{\"_version\":\"1.1.0\",\"technology\":\"UI5\",\"icons\":{\"icon\":\"sap-icon:\/\/detail-view\",\"favIcon\":\"\",\"phone\":\"\",\"phone@2\":\"\",\"tablet\":\"\",\"tablet@2\":\"\"},\"deviceTypes\":{\"desktop\":true,\"tablet\":true,\"phone\":true},\"supportedThemes\":[\"sap_hcb\",\"sap_bluecrystal\"]},\"sap.ui5\":{\"_version\":\"1.1.0\",\"rootView\":\"ns.view.App\",\"dependencies\":{\"minUI5Version\":\"${sap.ui5.dist.version}\",\"libs\":{\"sap.ui.core\":{},\"sap.m\":{},\"sap.ui.layout\":{}}},\"contentDensities\":{\"compact\":true,\"cozy\":true},\"models\":{\"i18n\":{\"type\":\"sap.ui.model.resource.ResourceModel\",\"settings\":{\"bundleName\":\"ns.i18n.i18n\"}},\"\":{\"dataSource\":\"mainService\",\"settings\":{\"metadataUrlParams\":{\"sap-documentation\":\"heading\"}}}},\"routing\":{\"config\":{\"routerClass\":\"sap.m.routing.Router\",\"viewType\":\"XML\",\"viewPath\":\"ns.view\",\"controlId\":\"idAppControl\",\"controlAggregation\":\"detailPages\",\"bypassed\":{\"target\":[\"master\",\"notFound\"]}},\"routes\":[{\"pattern\":\"\",\"name\":\"master\",\"target\":[\"object\",\"master\"]},{\"pattern\":\"CarrierCollection\/{objectId}\",\"name\":\"object\",\"target\":[\"master\",\"object\"]}],\"targets\":{\"master\":{\"viewName\":\"Master\",\"viewLevel\":1,\"viewId\":\"master\",\"controlAggregation\":\"masterPages\"},\"object\":{\"viewName\":\"Detail\",\"viewId\":\"detail\",\"viewLevel\":2},\"detailObjectNotFound\":{\"viewName\":\"DetailObjectNotFound\",\"viewId\":\"detailObjectNotFound\"},\"detailNoObjectsAvailable\":{\"viewName\":\"DetailNoObjectsAvailable\",\"viewId\":\"detailNoObjectsAvailable\"},\"notFound\":{\"viewName\":\"NotFound\",\"viewId\":\"notFound\"}}}}}";

			return oTemplateService.getTemplate("fioriexttemplate.extendcontrollercomponent").then(function(oExtendControllerTemplate) {

				var oParentViews = {
					"Detail.view.xml" : sParentDetailView
				};

				var oParentControllers = {
					"Detail.controller.js" : sParentDetailController
				};

				var oFileStructure = createFileStructure(sParentManifest, oParentViews, oParentControllers);

				return oFakeFileDAOService.setContent(oFileStructure).then(function() {
					return oFilesystemDocumentProviderService.getDocument("/extensionProject").then(function(oExtensionProjectDocument){

						var oExtensionCommon = {
							customizationId: "sap.ui.controllerExtensions",
							extensionFilePath: "webapp/controller/DetailCustom",
							extensionId: "Empty controller", // Empty!
							extensionResourceId: "ns.extensionProject.controller.DetailCustom",
							resourceId: "ns.controller.Detail",
							resourceLocationPath: "webapp/controller/",
							resourceName: "Detail",
							resourceSuffix: ".controller.js",
							resourceTypeName: "controllerName",
							selectedDocumentPath: "/parentProject/webapp/controller/Detail.controller.js"
						};

						var model = createModelForExtensionWithManifest(oExtensionCommon);

						return oGenerationService.generate("/extensionProject", oExtendControllerTemplate, model, false, oExtensionProjectDocument).then(function() {
							// get the manifest of the extension project
							return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/manifest.json").then(function(oManifestDoc) {
								// analyze the manifest.json using the project handler
								return oUI5ProjectHandlerService.getAllExtensions(oManifestDoc).then(function(oAllExtensions) {
									expect(oAllExtensions).to.exist;

									/* this is what should be in oAllExtensions:
									 * "sap.ui.controllerExtensions": {
									 * 	 "ns.controller.Detail": {
									 * 		"controllerName":"ns.extensionProject.controller.DetailCustom"
									 * 	 }
									 * }
									 */
									expect(oAllExtensions["sap.ui.controllerExtensions"]).to.exist;
									expect(oAllExtensions["sap.ui.controllerExtensions"]["ns.controller.Detail"]).to.exist;
									expect(oAllExtensions["sap.ui.controllerExtensions"]["ns.controller.Detail"].controllerName).to.equal("ns.extensionProject.controller.DetailCustom");

									return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/controller/DetailCustom.controller.js").then(function(oCustomEmptyDetailController) {
										expect(oCustomEmptyDetailController).to.exist;
										var sCustomEmptyControllerContent = oCustomEmptyDetailController._savedContent;
										expect(sCustomEmptyControllerContent.startsWith("sap.ui.controller(\"ns.extensionProject.controller.DetailCustom")).to.be.true;
									});
								});
							});
						});
					});
				});
			});
		});

		it("Create Replace View Extension: Replace Master view with empty view", function() {

			var sParentMasterController = "sap.ui.define([\"NS1\/controller\/BaseController\",\"sap\/ui\/model\/json\/JSONModel\",\"sap\/ui\/model\/Filter\",\"sap\/ui\/model\/FilterOperator\",\"sap\/ui\/model\/Sorter\",\"sap\/m\/GroupHeaderListItem\",\"sap\/ui\/Device\",\"NS1\/model\/formatter\",\"NS1\/model\/grouper\"],function(c,b,f,d,g,i,e,h,a){return c.extend(\"NS1.controller.Master\",{formatter:h,onInit:function(){var l=this.byId(\"list\"),k=new b({isFilterBarVisible:false,filterBarLabel:\"\",delay:0,title:this.getResourceBundle().getText(\"masterTitleCount\",[0]),noDataText:this.getResourceBundle().getText(\"masterListNoDataText\")}),j=l.getBusyIndicatorDelay();this._oList=l;this._oListFilterState={aFilter:[],aSearch:[]};this._oListSorterState={aGroup:[],aSort:[]};this.setModel(k,\"masterView\");l.attachEventOnce(\"updateFinished\",function(){k.setProperty(\"\/delay\",j)});this.getOwnerComponent().oListSelector.setBoundMasterList(l);this.getRouter().getRoute(\"master\").attachPatternMatched(this._onMasterMatched,this);this.getRouter().attachBypassed(this.onBypassed,this)},onUpdateFinished:function(j){this._updateListItemCount(j.getParameter(\"total\"));this.byId(\"pullToRefresh\").hide()},onSearch:function(j){if(j.getParameters().refreshButtonPressed){this.onRefresh();return}var k=j.getParameter(\"query\");if(k&&k.length>0){this._oListFilterState.aSearch=[new f(\"CARRNAME\",d.Contains,k)]}else{this._oListFilterState.aSearch=[]}this._applyFilterSearch()},onRefresh:function(){this._oList.getBinding(\"items\").refresh()},onSort:function(k){var j=k.getSource().getSelectedItem().getKey();this._oListSorterState.aSort=new g(j,false);this._applyGroupSort()},onGroup:function(j){var l=j.getSource().getSelectedItem().getKey(),k={Group1:\"\"};if(l!==\"None\"){this._oListSorterState.aGroup=[new g(k[l],false,a[l].bind(j.getSource()))]}else{this._oListSorterState.aGroup=[]}this._applyGroupSort()},onOpenViewSettings:function(){if(!this.oViewSettingsDialog){this.oViewSettingsDialog=sap.ui.xmlfragment(\"NS1.view.ViewSettingsDialog\",this);this.getView().addDependent(this.oViewSettingsDialog);this.oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass())}this.oViewSettingsDialog.open()},onSelectionChange:function(j){this._showDetail(j.getParameter(\"listItem\")||j.getSource())},onBypassed:function(){this._oList.removeSelections(true)},createGroupHeader:function(j){return new i({title:j.text,upperCase:false})},onNavBack:function(){var l=sap.ui.core.routing.History.getInstance(),k=l.getPreviousHash(),j=sap.ushell.Container.getService(\"CrossApplicationNavigation\");if(k!==undefined){history.go(-1)}else{j.toExternal({target:{shellHash:\"#\"}})}},_onMasterMatched:function(){this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(function(j){if(j.list.getMode()===\"None\"){return}var k=j.firstListitem.getBindingContext().getProperty(\"carrid\");this.getRouter().navTo(\"object\",{objectId:k},true)}.bind(this),function(j){if(j.error){return}this.getRouter().getTargets().display(\"detailNoObjectsAvailable\")}.bind(this))},_showDetail:function(k){var j=!e.system.phone;this.getRouter().navTo(\"object\",{objectId:k.getBindingContext().getProperty(\"carrid\")},j)},_updateListItemCount:function(k){var j;if(this._oList.getBinding(\"items\").isLengthFinal()){j=this.getResourceBundle().getText(\"masterTitleCount\",[k]);this.getModel(\"masterView\").setProperty(\"\/title\",j)}},_applyFilterSearch:function(){var j=this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),k=this.getModel(\"masterView\");this._oList.getBinding(\"items\").filter(j,\"Application\");if(j.length!==0){k.setProperty(\"\/noDataText\",this.getResourceBundle().getText(\"masterListNoDataWithFilterOrSearchText\"))}else{if(this._oListFilterState.aSearch.length>0){k.setProperty(\"\/noDataText\",this.getResourceBundle().getText(\"masterListNoDataText\"))}}},_applyGroupSort:function(){var j=this._oListSorterState.aGroup.concat(this._oListSorterState.aSort);this._oList.getBinding(\"items\").sort(j)},_updateFilterBar:function(j){var k=this.getModel(\"masterView\");k.setProperty(\"\/isFilterBarVisible\",(this._oListFilterState.aFilter.length>0));k.setProperty(\"\/filterBarLabel\",this.getResourceBundle().getText(\"masterFilterBarText\",[j]))}})});";
			var sParentMasterView = "<mvc:View controllerName=\"ns.controller.Master\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:core=\"sap.ui.core\" xmlns=\"sap.m\" xmlns:semantic=\"sap.m.semantic\"><semantic:MasterPage id=\"page\" title=\"{masterView>/title}\" navButtonPress=\"onNavBack\" id=\"searchField\" showRefreshButton=\"{= !${device>/support/touch} }\" tooltip=\"{i18n>masterSearchTooltip}\"width=\"100%\" search=\"onSearch\"></SearchField></contentMiddle></Bar></semantic:subHeader><semantic:content><PullToRefresh id=\"pullToRefresh\" visible=\"{device>/support/touch}\" refresh=\"onRefresh\" /><List id=\"list\" items=\"{path: '/CarrierCollection',sorter: {path: 'CARRNAME',descending: false},groupHeaderFactory: '.createGroupHeader'}\" busyIndicatorDelay=\"{masterView>/delay}\" noDataText=\"{masterView>/noDataText}\" mode=\"{= ${device>/system/phone} ? 'None' : 'SingleSelectMaster'}\" growing=\"true\" growingThreshold=\"10\" growingScrollToLoad=\"true\" updateFinished=\"onUpdateFinished\" selectionChange=\"onSelectionChange\"><infoToolbar><Toolbar active=\"true\" id=\"filterBar\" visible=\"{masterView>/isFilterBarVisible}\" press=\"onOpenViewSettings\"><Title id=\"filterBarLabel\" text=\"{masterView>/filterBarLabel}\" /></Toolbar></infoToolbar><items><ObjectListItemtype=\"{= ${device>/system/phone} ? 'Active' : 'Inactive'}\" press=\"onSelectionChange\" title=\"{CARRNAME}\"></ObjectListItem></items></List></semantic:content></semantic:MasterPage></mvc:View>";
			var sParentManifest = "{\"_version\":\"1.1.0\",\"sap.app\":{\"_version\":\"1.1.0\",\"id\":\"${project.artifactId}\",\"type\":\"application\",\"resources\":\"resources.json\",\"i18n\":\"i18n\/i18n.properties\",\"title\":\"{{appTitle}}\",\"description\":\"{{appDescription}}\",\"applicationVersion\":{\"version\":\"${project.version}\"},\"ach\":\"\",\"dataSources\":{\"mainService\":{\"uri\":\"\/sap\/opu\/odata\/iwfnd\/RMTSAMPLEFLIGHT\/\",\"type\":\"OData\",\"settings\":{\"odataVersion\":\"2.0\",\"localUri\":\"localService\/metadata.xml\"}}},\"sourceTemplate\":{\"id\":\"sap.ui.ui5-template-plugin.2masterdetail\",\"version\":\"1.0.10\"}},\"sap.ui\":{\"_version\":\"1.1.0\",\"technology\":\"UI5\",\"icons\":{\"icon\":\"sap-icon:\/\/detail-view\",\"favIcon\":\"\",\"phone\":\"\",\"phone@2\":\"\",\"tablet\":\"\",\"tablet@2\":\"\"},\"deviceTypes\":{\"desktop\":true,\"tablet\":true,\"phone\":true},\"supportedThemes\":[\"sap_hcb\",\"sap_bluecrystal\"]},\"sap.ui5\":{\"_version\":\"1.1.0\",\"rootView\":\"ns.view.App\",\"dependencies\":{\"minUI5Version\":\"${sap.ui5.dist.version}\",\"libs\":{\"sap.ui.core\":{},\"sap.m\":{},\"sap.ui.layout\":{}}},\"contentDensities\":{\"compact\":true,\"cozy\":true},\"models\":{\"i18n\":{\"type\":\"sap.ui.model.resource.ResourceModel\",\"settings\":{\"bundleName\":\"ns.i18n.i18n\"}},\"\":{\"dataSource\":\"mainService\",\"settings\":{\"metadataUrlParams\":{\"sap-documentation\":\"heading\"}}}},\"routing\":{\"config\":{\"routerClass\":\"sap.m.routing.Router\",\"viewType\":\"XML\",\"viewPath\":\"ns.view\",\"controlId\":\"idAppControl\",\"controlAggregation\":\"detailPages\",\"bypassed\":{\"target\":[\"master\",\"notFound\"]}},\"routes\":[{\"pattern\":\"\",\"name\":\"master\",\"target\":[\"object\",\"master\"]},{\"pattern\":\"CarrierCollection\/{objectId}\",\"name\":\"object\",\"target\":[\"master\",\"object\"]}],\"targets\":{\"master\":{\"viewName\":\"Master\",\"viewLevel\":1,\"viewId\":\"master\",\"controlAggregation\":\"masterPages\"},\"object\":{\"viewName\":\"Detail\",\"viewId\":\"detail\",\"viewLevel\":2},\"detailObjectNotFound\":{\"viewName\":\"DetailObjectNotFound\",\"viewId\":\"detailObjectNotFound\"},\"detailNoObjectsAvailable\":{\"viewName\":\"DetailNoObjectsAvailable\",\"viewId\":\"detailNoObjectsAvailable\"},\"notFound\":{\"viewName\":\"NotFound\",\"viewId\":\"notFound\"}}}}}";

			return oTemplateService.getTemplate("fioriexttemplate.replaceviewcomponent").then(function(oReplaceViewTemplate) {

				var oParentViews = {
					"Master.view.xml" : sParentMasterView
				};

				var oParentControllers = {
					"Master.controller.js" : sParentMasterController
				};

				var oFileStructure = createFileStructure(sParentManifest, oParentViews, oParentControllers);

				return oFakeFileDAOService.setContent(oFileStructure).then(function() {
					return oFilesystemDocumentProviderService.getDocument("/extensionProject").then(function(oExtensionProjectDocument){
						var oExtensionCommon = {
							extensionId: "Empty view",
							resourceId: "ns.view.Master",
							resourceLocationPath: "webapp/view/",
							resourceName: "Master",
							selectedDocumentPath: "/parentProject/webapp/view/Master.view.xml"
						};

						var model = createModelForExtensionWithManifest(oExtensionCommon);

						return oGenerationService.generate("/extensionProject", oReplaceViewTemplate, model, false, oExtensionProjectDocument).then(function() {
							// get the manifest of the extension project
							return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/manifest.json").then(function(oManifestDoc) {
								// analyze the manifest.json using the project handler
								return oUI5ProjectHandlerService.getAllExtensions(oManifestDoc).then(function(oAllExtensions) {
									expect(oAllExtensions).to.exist;

									/* This is what should be in oAllExtensions:
									 * "sap.ui.viewReplacements": {
									 * "ns.view.Master": {
									 * "viewName": "ns.extensionProject.view.MasterCustom",
									 * "type": "XML"
									 * }
									 * }
									 */
									expect(oAllExtensions["sap.ui.viewReplacements"]).to.exist;
									expect(oAllExtensions["sap.ui.viewReplacements"]["ns.view.Master"]).to.exist;
									expect(oAllExtensions["sap.ui.viewReplacements"]["ns.view.Master"].viewName).to.equal("ns.extensionProject.view.MasterCustom");

									return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/view/MasterCustom.view.xml").then(function(oCustomEmptyMasterView) {
										expect(oCustomEmptyMasterView).to.exist;
										var sCustomEmptyMasterViewContent = oCustomEmptyMasterView._savedContent;
										expect(sCustomEmptyMasterViewContent.startsWith("<mvc:View controllerName=\"ns.controller.Master")).to.be.true;
									});
								});
							});
						});
					});
				});
			});
		});

		it("Create Replace View Extension: Replace Master view with copy of original view", function() {

			var sParentMasterController = "sap.ui.define([\"NS1\/controller\/BaseController\",\"sap\/ui\/model\/json\/JSONModel\",\"sap\/ui\/model\/Filter\",\"sap\/ui\/model\/FilterOperator\",\"sap\/ui\/model\/Sorter\",\"sap\/m\/GroupHeaderListItem\",\"sap\/ui\/Device\",\"NS1\/model\/formatter\",\"NS1\/model\/grouper\"],function(c,b,f,d,g,i,e,h,a){return c.extend(\"NS1.controller.Master\",{formatter:h,onInit:function(){var l=this.byId(\"list\"),k=new b({isFilterBarVisible:false,filterBarLabel:\"\",delay:0,title:this.getResourceBundle().getText(\"masterTitleCount\",[0]),noDataText:this.getResourceBundle().getText(\"masterListNoDataText\")}),j=l.getBusyIndicatorDelay();this._oList=l;this._oListFilterState={aFilter:[],aSearch:[]};this._oListSorterState={aGroup:[],aSort:[]};this.setModel(k,\"masterView\");l.attachEventOnce(\"updateFinished\",function(){k.setProperty(\"\/delay\",j)});this.getOwnerComponent().oListSelector.setBoundMasterList(l);this.getRouter().getRoute(\"master\").attachPatternMatched(this._onMasterMatched,this);this.getRouter().attachBypassed(this.onBypassed,this)},onUpdateFinished:function(j){this._updateListItemCount(j.getParameter(\"total\"));this.byId(\"pullToRefresh\").hide()},onSearch:function(j){if(j.getParameters().refreshButtonPressed){this.onRefresh();return}var k=j.getParameter(\"query\");if(k&&k.length>0){this._oListFilterState.aSearch=[new f(\"CARRNAME\",d.Contains,k)]}else{this._oListFilterState.aSearch=[]}this._applyFilterSearch()},onRefresh:function(){this._oList.getBinding(\"items\").refresh()},onSort:function(k){var j=k.getSource().getSelectedItem().getKey();this._oListSorterState.aSort=new g(j,false);this._applyGroupSort()},onGroup:function(j){var l=j.getSource().getSelectedItem().getKey(),k={Group1:\"\"};if(l!==\"None\"){this._oListSorterState.aGroup=[new g(k[l],false,a[l].bind(j.getSource()))]}else{this._oListSorterState.aGroup=[]}this._applyGroupSort()},onOpenViewSettings:function(){if(!this.oViewSettingsDialog){this.oViewSettingsDialog=sap.ui.xmlfragment(\"NS1.view.ViewSettingsDialog\",this);this.getView().addDependent(this.oViewSettingsDialog);this.oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass())}this.oViewSettingsDialog.open()},onSelectionChange:function(j){this._showDetail(j.getParameter(\"listItem\")||j.getSource())},onBypassed:function(){this._oList.removeSelections(true)},createGroupHeader:function(j){return new i({title:j.text,upperCase:false})},onNavBack:function(){var l=sap.ui.core.routing.History.getInstance(),k=l.getPreviousHash(),j=sap.ushell.Container.getService(\"CrossApplicationNavigation\");if(k!==undefined){history.go(-1)}else{j.toExternal({target:{shellHash:\"#\"}})}},_onMasterMatched:function(){this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(function(j){if(j.list.getMode()===\"None\"){return}var k=j.firstListitem.getBindingContext().getProperty(\"carrid\");this.getRouter().navTo(\"object\",{objectId:k},true)}.bind(this),function(j){if(j.error){return}this.getRouter().getTargets().display(\"detailNoObjectsAvailable\")}.bind(this))},_showDetail:function(k){var j=!e.system.phone;this.getRouter().navTo(\"object\",{objectId:k.getBindingContext().getProperty(\"carrid\")},j)},_updateListItemCount:function(k){var j;if(this._oList.getBinding(\"items\").isLengthFinal()){j=this.getResourceBundle().getText(\"masterTitleCount\",[k]);this.getModel(\"masterView\").setProperty(\"\/title\",j)}},_applyFilterSearch:function(){var j=this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),k=this.getModel(\"masterView\");this._oList.getBinding(\"items\").filter(j,\"Application\");if(j.length!==0){k.setProperty(\"\/noDataText\",this.getResourceBundle().getText(\"masterListNoDataWithFilterOrSearchText\"))}else{if(this._oListFilterState.aSearch.length>0){k.setProperty(\"\/noDataText\",this.getResourceBundle().getText(\"masterListNoDataText\"))}}},_applyGroupSort:function(){var j=this._oListSorterState.aGroup.concat(this._oListSorterState.aSort);this._oList.getBinding(\"items\").sort(j)},_updateFilterBar:function(j){var k=this.getModel(\"masterView\");k.setProperty(\"\/isFilterBarVisible\",(this._oListFilterState.aFilter.length>0));k.setProperty(\"\/filterBarLabel\",this.getResourceBundle().getText(\"masterFilterBarText\",[j]))}})});";
			var sParentMasterView = "<mvc:View controllerName=\"ns.controller.Master\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:core=\"sap.ui.core\" xmlns=\"sap.m\" xmlns:semantic=\"sap.m.semantic\"><semantic:MasterPage id=\"page\" title=\"{masterView>/title}\" navButtonPress=\"onNavBack\" id=\"searchField\" showRefreshButton=\"{= !${device>/support/touch} }\" tooltip=\"{i18n>masterSearchTooltip}\"width=\"100%\" search=\"onSearch\"></SearchField></contentMiddle></Bar></semantic:subHeader><semantic:content><PullToRefresh id=\"pullToRefresh\" visible=\"{device>/support/touch}\" refresh=\"onRefresh\" /><List id=\"list\" items=\"{path: '/CarrierCollection',sorter: {path: 'CARRNAME',descending: false},groupHeaderFactory: '.createGroupHeader'}\" busyIndicatorDelay=\"{masterView>/delay}\" noDataText=\"{masterView>/noDataText}\" mode=\"{= ${device>/system/phone} ? 'None' : 'SingleSelectMaster'}\" growing=\"true\" growingThreshold=\"10\" growingScrollToLoad=\"true\" updateFinished=\"onUpdateFinished\" selectionChange=\"onSelectionChange\"><infoToolbar><Toolbar active=\"true\" id=\"filterBar\" visible=\"{masterView>/isFilterBarVisible}\" press=\"onOpenViewSettings\"><Title id=\"filterBarLabel\" text=\"{masterView>/filterBarLabel}\" /></Toolbar></infoToolbar><items><ObjectListItemtype=\"{= ${device>/system/phone} ? 'Active' : 'Inactive'}\" press=\"onSelectionChange\" title=\"{CARRNAME}\"></ObjectListItem></items></List></semantic:content></semantic:MasterPage></mvc:View>";
			var sParentManifest = "{\"_version\":\"1.1.0\",\"sap.app\":{\"_version\":\"1.1.0\",\"id\":\"${project.artifactId}\",\"type\":\"application\",\"resources\":\"resources.json\",\"i18n\":\"i18n\/i18n.properties\",\"title\":\"{{appTitle}}\",\"description\":\"{{appDescription}}\",\"applicationVersion\":{\"version\":\"${project.version}\"},\"ach\":\"\",\"dataSources\":{\"mainService\":{\"uri\":\"\/sap\/opu\/odata\/iwfnd\/RMTSAMPLEFLIGHT\/\",\"type\":\"OData\",\"settings\":{\"odataVersion\":\"2.0\",\"localUri\":\"localService\/metadata.xml\"}}},\"sourceTemplate\":{\"id\":\"sap.ui.ui5-template-plugin.2masterdetail\",\"version\":\"1.0.10\"}},\"sap.ui\":{\"_version\":\"1.1.0\",\"technology\":\"UI5\",\"icons\":{\"icon\":\"sap-icon:\/\/detail-view\",\"favIcon\":\"\",\"phone\":\"\",\"phone@2\":\"\",\"tablet\":\"\",\"tablet@2\":\"\"},\"deviceTypes\":{\"desktop\":true,\"tablet\":true,\"phone\":true},\"supportedThemes\":[\"sap_hcb\",\"sap_bluecrystal\"]},\"sap.ui5\":{\"_version\":\"1.1.0\",\"rootView\":\"ns.view.App\",\"dependencies\":{\"minUI5Version\":\"${sap.ui5.dist.version}\",\"libs\":{\"sap.ui.core\":{},\"sap.m\":{},\"sap.ui.layout\":{}}},\"contentDensities\":{\"compact\":true,\"cozy\":true},\"models\":{\"i18n\":{\"type\":\"sap.ui.model.resource.ResourceModel\",\"settings\":{\"bundleName\":\"ns.i18n.i18n\"}},\"\":{\"dataSource\":\"mainService\",\"settings\":{\"metadataUrlParams\":{\"sap-documentation\":\"heading\"}}}},\"routing\":{\"config\":{\"routerClass\":\"sap.m.routing.Router\",\"viewType\":\"XML\",\"viewPath\":\"ns.view\",\"controlId\":\"idAppControl\",\"controlAggregation\":\"detailPages\",\"bypassed\":{\"target\":[\"master\",\"notFound\"]}},\"routes\":[{\"pattern\":\"\",\"name\":\"master\",\"target\":[\"object\",\"master\"]},{\"pattern\":\"CarrierCollection\/{objectId}\",\"name\":\"object\",\"target\":[\"master\",\"object\"]}],\"targets\":{\"master\":{\"viewName\":\"Master\",\"viewLevel\":1,\"viewId\":\"master\",\"controlAggregation\":\"masterPages\"},\"object\":{\"viewName\":\"Detail\",\"viewId\":\"detail\",\"viewLevel\":2},\"detailObjectNotFound\":{\"viewName\":\"DetailObjectNotFound\",\"viewId\":\"detailObjectNotFound\"},\"detailNoObjectsAvailable\":{\"viewName\":\"DetailNoObjectsAvailable\",\"viewId\":\"detailNoObjectsAvailable\"},\"notFound\":{\"viewName\":\"NotFound\",\"viewId\":\"notFound\"}}}}}";

			return oTemplateService.getTemplate("fioriexttemplate.replaceviewcomponent").then(function(oReplaceViewTemplate) {

				var oParentViews = {
					"Master.view.xml" : sParentMasterView
				};

				var oParentControllers = {
					"Master.controller.js" : sParentMasterController
				};

				var oFileStructure = createFileStructure(sParentManifest, oParentViews, oParentControllers);

				return oFakeFileDAOService.setContent(oFileStructure).then(function() {
					return oFilesystemDocumentProviderService.getDocument("/extensionProject").then(function(oExtensionProjectDocument){
						var oExtensionCommon = {
							extensionId: "Copy of the parent view",
							resourceId: "ns.view.Master",
							resourceLocationPath: "webapp/view/",
							resourceName: "Master",
							selectedDocumentPath: "/parentProject/webapp/view/Master.view.xml"
						};

						var model = createModelForExtensionWithManifest(oExtensionCommon);

						return oGenerationService.generate("/extensionProject", oReplaceViewTemplate, model, false, oExtensionProjectDocument).then(function() {
							// get the manifest of the extension project
							return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/manifest.json").then(function(oManifestDoc) {
								// analyze the manifest.json using the project handler
								return oUI5ProjectHandlerService.getAllExtensions(oManifestDoc).then(function(oAllExtensions) {
									expect(oAllExtensions).to.exist;

									/* This is what should be in oAllExtensions:
									 * "sap.ui.viewReplacements": {
									 * "ns.view.Master": {
									 * "viewName": "ns.extensionProject.view.MasterCustom",
									 * "type": "XML"
									 * }
									 * }
									 */
									expect(oAllExtensions["sap.ui.viewReplacements"]).to.exist;
									expect(oAllExtensions["sap.ui.viewReplacements"]["ns.view.Master"]).to.exist;
									expect(oAllExtensions["sap.ui.viewReplacements"]["ns.view.Master"].viewName).to.equal("ns.extensionProject.view.MasterCustom");

									return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/view/MasterCustom.view.xml").then(function(oCustomCopyMasterView) {
										expect(oCustomCopyMasterView).to.exist;
										var sCustomCopyMasterViewContent = oCustomCopyMasterView._savedContent;
										expect(sCustomCopyMasterViewContent.startsWith("<mvc:View controllerName=\"ns.controller.Master")).to.be.true;
									});
								});
							});
						});
					});
				});
			});
		});

		it("Create UI Controller Hook Extension: Extend extHookOnInit hook in Detail controller", function() {

			var sParentDetailController = "sap.ui.define([\"ns\/controller\/BaseController\",\"sap\/ui\/model\/json\/JSONModel\",\"ns\/model\/formatter\"],function(e,t,i){\"use strict\";return e.extend(\"ns.controller.Detail\",{formatter:i,onInit:function(){var e=new t({busy:!1,delay:0});this.getRouter().getRoute(\"object\").attachPatternMatched(this._onObjectMatched,this),this.setModel(e,\"detailView\"),this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this)),this.extHookOnInit&&this.extHookOnInit(),this.extHookOnInit1&&this.extHookOnInit1()},onShareEmailPress:function(){var e=this.getModel(\"detailView\");sap.m.URLHelper.triggerEmail(null,e.getProperty(\"\/shareSendEmailSubject\"),e.getProperty(\"\/shareSendEmailMessage\"))},onShareInJamPress:function(){var e=this.getModel(\"detailView\"),t=sap.ui.getCore().createComponent({name:\"sap.collaboration.components.fiori.sharing.dialog\",settings:{object:{id:location.href,share:e.getProperty(\"\/shareOnJamTitle\")}}});t.open()},_onObjectMatched:function(e){var t=\"\/CarrierCollection(\'\"+e.getParameter(\"arguments\").objectId+\"\')\";this._bindView(t)},_bindView:function(e){var t=this.getModel(\"detailView\");t.setProperty(\"\/busy\",!1),this.getView().bindElement({path:e,events:{change:this._onBindingChange.bind(this),dataRequested:function(){t.setProperty(\"\/busy\",!0)},dataReceived:function(){t.setProperty(\"\/busy\",!1)}}})},_onBindingChange:function(){var e=this.getView(),t=e.getElementBinding();if(!t.getBoundContext())return this.getRouter().getTargets().display(\"detailObjectNotFound\"),void this.getOwnerComponent().oListSelector.clearMasterListSelection();var i=t.getPath(),n=this.getResourceBundle(),o=e.getModel().getObject(i),a=o.carrid,r=o.CARRNAME,s=this.getModel(\"detailView\");this.getOwnerComponent().oListSelector.selectAListItem(i),s.setProperty(\"\/saveAsTileTitle\",n.getText(\"shareSaveTileAppTitle\",[r])),s.setProperty(\"\/shareOnJamTitle\",r),s.setProperty(\"\/shareSendEmailSubject\",n.getText(\"shareSendEmailObjectSubject\",[a])),s.setProperty(\"\/shareSendEmailMessage\",n.getText(\"shareSendEmailObjectMessage\",[r,a,location.href]))},_onMetadataLoaded:function(){var e=this.getView().getBusyIndicatorDelay(),t=this.getModel(\"detailView\");t.setProperty(\"\/delay\",0),t.setProperty(\"\/busy\",!0),t.setProperty(\"\/delay\",e)}})});";
			var sParentDetailView = "<mvc:View controllerName=\"ns.controller.Detail\" xmlns=\"sap.m\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:core=\"sap.ui.core\" xmlns:semantic=\"sap.m.semantic\" xmlns:footerbar=\"sap.ushell.ui.footerbar\"> <semantic:DetailPage id=\"page\" navButtonPress=\"onNavBack\" showNavButton=\"{device>/system/phone}\" title=\"{i18n>detailTitle}\" busy=\"{detailView>/busy}\" busyIndicatorDelay=\"{detailView>/delay}\"> <semantic:content> <ObjectHeader id=\"objectHeader\" title=\"{CARRNAME}\"></ObjectHeader><IconTabBar id=\"iconTabBar\" class=\"sapUiResponsiveContentPadding\"><items><IconTabFilter id=\"iconTabBarFilter1\" icon=\"sap-icon://hint\" tooltip=\"{i18n>detailIconTabBarInfo}\"> </IconTabFilter><IconTabFilter id=\"iconTabBarFilter2\" icon=\"sap-icon://attachment\" tooltip=\"{i18n>detailIconTabBarAttachments}\"> </IconTabFilter><core:ExtensionPoint name=\"extListItemInfo\" /></items></IconTabBar></semantic:content><semantic:sendEmailAction> <semantic:SendEmailAction id=\"shareEmail\" press=\"onShareEmailPress\"/></semantic:sendEmailAction><semantic:shareInJamAction><semantic:ShareInJamAction id=\"shareInJam\" visible=\"{FLP>/isShareInJamActive}\" press=\"onShareInJamPress\"/></semantic:shareInJamAction><semantic:saveAsTileAction> <footerbar:AddBookmarkButton id=\"shareTile\" title=\"{detailView>/saveAsTileTitle}\"/></semantic:saveAsTileAction></semantic:DetailPage></mvc:View>";
			var sParentManifest = "{\"_version\":\"1.1.0\",\"sap.app\":{\"_version\":\"1.1.0\",\"id\":\"${project.artifactId}\",\"type\":\"application\",\"resources\":\"resources.json\",\"i18n\":\"i18n\/i18n.properties\",\"title\":\"{{appTitle}}\",\"description\":\"{{appDescription}}\",\"applicationVersion\":{\"version\":\"${project.version}\"},\"ach\":\"\",\"dataSources\":{\"mainService\":{\"uri\":\"\/sap\/opu\/odata\/iwfnd\/RMTSAMPLEFLIGHT\/\",\"type\":\"OData\",\"settings\":{\"odataVersion\":\"2.0\",\"localUri\":\"localService\/metadata.xml\"}}},\"sourceTemplate\":{\"id\":\"sap.ui.ui5-template-plugin.2masterdetail\",\"version\":\"1.0.10\"}},\"sap.ui\":{\"_version\":\"1.1.0\",\"technology\":\"UI5\",\"icons\":{\"icon\":\"sap-icon:\/\/detail-view\",\"favIcon\":\"\",\"phone\":\"\",\"phone@2\":\"\",\"tablet\":\"\",\"tablet@2\":\"\"},\"deviceTypes\":{\"desktop\":true,\"tablet\":true,\"phone\":true},\"supportedThemes\":[\"sap_hcb\",\"sap_bluecrystal\"]},\"sap.ui5\":{\"_version\":\"1.1.0\",\"rootView\":\"ns.view.App\",\"dependencies\":{\"minUI5Version\":\"${sap.ui5.dist.version}\",\"libs\":{\"sap.ui.core\":{},\"sap.m\":{},\"sap.ui.layout\":{}}},\"contentDensities\":{\"compact\":true,\"cozy\":true},\"models\":{\"i18n\":{\"type\":\"sap.ui.model.resource.ResourceModel\",\"settings\":{\"bundleName\":\"ns.i18n.i18n\"}},\"\":{\"dataSource\":\"mainService\",\"settings\":{\"metadataUrlParams\":{\"sap-documentation\":\"heading\"}}}},\"routing\":{\"config\":{\"routerClass\":\"sap.m.routing.Router\",\"viewType\":\"XML\",\"viewPath\":\"ns.view\",\"controlId\":\"idAppControl\",\"controlAggregation\":\"detailPages\",\"bypassed\":{\"target\":[\"master\",\"notFound\"]}},\"routes\":[{\"pattern\":\"\",\"name\":\"master\",\"target\":[\"object\",\"master\"]},{\"pattern\":\"CarrierCollection\/{objectId}\",\"name\":\"object\",\"target\":[\"master\",\"object\"]}],\"targets\":{\"master\":{\"viewName\":\"Master\",\"viewLevel\":1,\"viewId\":\"master\",\"controlAggregation\":\"masterPages\"},\"object\":{\"viewName\":\"Detail\",\"viewId\":\"detail\",\"viewLevel\":2},\"detailObjectNotFound\":{\"viewName\":\"DetailObjectNotFound\",\"viewId\":\"detailObjectNotFound\"},\"detailNoObjectsAvailable\":{\"viewName\":\"DetailNoObjectsAvailable\",\"viewId\":\"detailNoObjectsAvailable\"},\"notFound\":{\"viewName\":\"NotFound\",\"viewId\":\"notFound\"}}}}}";

			return oTemplateService.getTemplate("fioriexttemplate.extendcontrollerhook").then(function(oExtendUIControllerHookTemplate) {

				var oParentViews = {
					"Detail.view.xml" : sParentDetailView
				};

				var oParentControllers = {
					"Detail.controller.js" : sParentDetailController
				};

				var oFileStructure = createFileStructure(sParentManifest, oParentViews, oParentControllers);

				return oFakeFileDAOService.setContent(oFileStructure).then(function() {
					return oFilesystemDocumentProviderService.getDocument("/extensionProject").then(function(oExtensionProjectDocument){
						var oExtensionCommon = {
							extensionArgs: [],
							extensionId: "extHookOnInit", // the hook
							resourceId: "ns.controller.Detail",
							resourceLocationPath: "webapp/controller/",
							resourceName: "Detail",
							selectedDocumentPath: "/parentProject/webapp/controller/Detail.controller.js"
						};

						var model = createModelForExtensionWithManifest(oExtensionCommon);

						return oGenerationService.generate("/extensionProject", oExtendUIControllerHookTemplate, model, false, oExtensionProjectDocument).then(function() {
							// get the manifest of the extension project
							return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/manifest.json").then(function(oManifestDoc) {
								// analyze the manifest.json using the project handler
								return oUI5ProjectHandlerService.getAllExtensions(oManifestDoc).then(function(oAllExtensions) {
									expect(oAllExtensions).to.exist;

									/* this is what should be in oAllExtensions:
									 * "sap.ui.controllerExtensions": {
									 * 	 "ns.controller.Detail": {
									 * 		"controllerName":"ns.extensionProject.controller.DetailCustom"
									 * 	 }
									 * }
									 */
									expect(oAllExtensions["sap.ui.controllerExtensions"]).to.exist;
									expect(oAllExtensions["sap.ui.controllerExtensions"]["ns.controller.Detail"]).to.exist;
									expect(oAllExtensions["sap.ui.controllerExtensions"]["ns.controller.Detail"].controllerName).to.equal("ns.extensionProject.controller.DetailCustom");

									return oFilesystemDocumentProviderService.getDocument("/extensionProject/webapp/controller/DetailCustom.controller.js").then(function(oCustomDetailController) {
										expect(oCustomDetailController).to.exist;
										var sCustomControllerContent = oCustomDetailController._savedContent;
										expect(sCustomControllerContent.startsWith("sap.ui.controller(\"ns.extensionProject.controller.DetailCustom")).to.be.true;
									});
								});
							});
						});
					});
				});
			});
		});
		
		/* eslint-enable no-use-before-define */
		/* eslint-enable no-console */
		/* eslint-enable no-unused-expressions */

		afterEach(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
