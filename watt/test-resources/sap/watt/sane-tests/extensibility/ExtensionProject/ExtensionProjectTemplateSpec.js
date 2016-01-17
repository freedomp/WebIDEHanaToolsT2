define(['STF', "sap/watt/lib/jszip/jszip-shim", "sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/extensionProject/ExtensionProjectTemplate"],
	function (STF, JSZip, extensionProjectTemplate) {

		"use strict";

		var oMockProjectZip = null;

		describe('Extension Project Template', function () {

			function createMockProjectZip() {
				oMockProjectZip = new JSZip();
				oMockProjectZip.folder("TestApp");
				oMockProjectZip.file("Component.js.tmpl","1");
				oMockProjectZip.file("index.html.tmpl","2");
				oMockProjectZip.file("manifest.json.tmpl","3");
				oMockProjectZip.file(".user.project.json.tmpl","4");
			}

			function buildMockContext() {
				var oMockContext = {};
				oMockContext.service = {};

				oMockContext.service.system = {};
				oMockContext.service.system.getSystemInfo = function() {
					var oSystemInfo = {
						"sUsername" : "dummyUser",
						"sAccount" : "dummyAccount"
					};
					return Q(oSystemInfo);
				};

				oMockContext.service.parentproject = {};
				oMockContext.service.parentproject.getRuntimeDestinations = function() {
					var oMockDestination = {
						"path" : "/resources"
					};
					var oMockDestination2 = {
						"path" : "/sap/bc/ui5_ui5",
						wattUsage : "ui5_execute_abap"
					};
					var aMockDestinations = [oMockDestination, oMockDestination2];
					return Q(aMockDestinations);
				};
				oMockContext.service.parentproject.getGuidelinesDocument = function() {
					return Q();
				};
				oMockContext.service.parentproject.getDocument = function() {
					return Q();
				};
				oMockContext.service.parentproject.getModelFolderFiles = function() {

					var oMockFile = {
						getEntity : function() {
							var getType = function() {
								return "file";
							};
							var getName = function() {
								return "metadata.xml";
							};
							var getFileExtension = function() {
								return ".xml";
							};
							var getParentPath = function() {
								return "/model/meatada.xml";
							};
							return {
								getType: getType,
								getName: getName,
								getFileExtension: getFileExtension,
								getParentPath: getParentPath
							};
						},
						getContent : function() {
							return Q("<?xml version=\"1.0\" encoding=\"utf-8\"?><edmx:Edmx Version=\"1.0\" xmlns:edmx=\"http://schemas.microsoft.com/ado/2007/06/edmx\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xmlns:sap=\"http://www.sap.com/Protocols/SAPData\"><edmx:DataServices m:DataServiceVersion=\"2.0\"><Schema Namespace=\"SRA018_SO_TRACKING_SRV\" xml:lang=\"en\" sap:schema-version=\"1\" xmlns=\"http://schemas.microsoft.com/ado/2008/09/edm\"><EntityType Name=\"Attachment\" sap:content-version=\"1\"><Key><PropertyRef Name=\"Id\"/></Key><Property Name=\"Id\" Type=\"Edm.Int32\" Nullable=\"false\" sap:label=\"File Id\"/><Property Name=\"FileSize\" Type=\"Edm.String\" Nullable=\"false\" sap:label=\"File Size\"/><Property Name=\"Type\" Type=\"Edm.String\" Nullable=\"false\" sap:label=\"File Type\"/><Property Name=\"Description\" Type=\"Edm.String\" Nullable=\"false\" m:FC_TargetPath=\"SyndicationTitle\" m:FC_KeepInContent=\"true\" sap:label=\"File Description\"/><Property Name=\"Name\" Type=\"Edm.String\" Nullable=\"false\" sap:label=\"File Name\"/><NavigationProperty Name=\"SalesOrder\" Relationship=\"SRA018_SO_TRACKING_SRV.SalesOrderAttachment\" FromRole=\"ToRole_SalesOrderAttachment\" ToRole=\"FromRole_SalesOrderAttachment\"/></EntityType><EntityContainer Name=\"SRA018_SO_TRACKING_SRV_Entities\" m:IsDefaultEntityContainer=\"true\" sap:supported-formats=\"atom json\"><EntitySet Name=\"SubscriptionCollection\" EntityType=\"SRA018_SO_TRACKING_SRV.Subscription\" sap:content-version=\"1\"/></EntityContainer></Schema></edmx:DataServices></edmx:Edmx>");
						}
					};

					var aMockModelFolderFiles = [oMockFile];

					return Q(aMockModelFolderFiles);

				};
				oMockContext.service.parentproject.getMockPreview = function() {
					return Q({});
				};

				oMockContext.service.beautifierProcessor = {};
				oMockContext.service.beautifierProcessor.beautify = function() {
					return Q();
				};

				oMockContext.service.ui5projecthandler = {};
				oMockContext.service.ui5projecthandler.getAppNamespace = function() {
					return Q("dummyAppNamespace");
				};
				oMockContext.service.ui5projecthandler.getI18nPath = function() {
					return Q("/dummyI18nPath");
				};
				oMockContext.service.ui5projecthandler.getAttribute = function() {
					return Q({
						"title" : "dummyTitle",
						"icons" : "dummyIcons",
						"deviceTypes" : "dummyDeviceTypes",
						"supportedThemes" : "dummySupportedThemes",
						"dependencies" : "dummyDependencies",
						"contentDensities" : "dummyContentDensities"
					});
				};
				
				oMockContext.service.abaprepository = {};
				oMockContext.service.abaprepository.getDependenciesAsNeoappRoutes = function() {
					var oDependecy = {
						"path" : "/resources/dummyDependencyId",
						"target" :{
							"type" : "destination",
							"name" : "GM6",
							"entryPath" : "/dummyDependencyUrl",
							"preferLocal": true
						},
						"description": "dummyDependencyId Reuse Library"
					};
					
					var aDependencies = [oDependecy];
					return Q(aDependencies);
					// throw new Error("An error has occured when trying to get dependencies");
				};

				return oMockContext;
			}

			beforeEach(function () {

				createMockProjectZip();

				var oMockContext = buildMockContext();
				extensionProjectTemplate.setContext(oMockContext);

				// mock sap.watt.getEnv()
				sap.watt.getEnv = function() {
					return "dummyOutput";
				};
			});

			//this test checks the value of componentJsPath in the model when having a project with and without 'webapp' folder
			it("Test onBeforeTemplateGenerate method - from ABAP - w/o webapp folder", function() {

				var oModelNoWebapp = {
					"extensionProject":"",
					"extensibility":{
						"system":{
							"name": "abap_backend",
							"id": "GM6",
							"client": ""
						},
						"component":  "ZTESTGUIDE%2fComponent.js",
						"type": "abaprep",
						"controllers": {
							"App":"ZTESTGUIDE%2fview%2fApp.controller.js",
							"Detail": "ZTESTGUIDE%2fview%2fDetail.controller.js",
							"Master": "ZTESTGUIDE%2fview%2fMaster.controller.js"
						},
						"namespace": "fioridemo",
						"resourceBundle": "i18n/i18n.properties",
						"views": {
							"App":"ZTESTGUIDE%2fview%2fApp.view.xml",
							"Detail": "ZTESTGUIDE%2fview%2fDetail.view.xml",
							"Master": "ZTESTGUIDE%2fview%2fMaster.view.xml"
						}
					},
					"parentProjectName":"ZTESTGUIDE",
					"neoAppPath":"ZTESTGUIDE%2fneo-app.json",
					"metadataPath":"ZTESTGUIDE%2fmodel%2fmetadata.xml",
					"parentPath":"ZTESTGUIDE",
					"projectName": "ZTESTGUIDEExtension1"
				};

				oMockProjectZip = new JSZip();
				oMockProjectZip.folder("res");
				oMockProjectZip.file("Component.js.tmpl","1");
				oMockProjectZip.file("index.html.tmpl","2");
				oMockProjectZip.file("localIndex.html.tmpl","3");
				oMockProjectZip.file("manifest.json.tmpl","5");

				// flow 1 - without 'webapp' folder
				return extensionProjectTemplate.onBeforeTemplateGenerate(oMockProjectZip, oModelNoWebapp).then(function(aResult1) {
					var oResModel = aResult1[1];
					expect(oResModel.componentJsPath).to.equal("ZTESTGUIDE"); // componentJsPath without 'webapp'
					// verify destinations were created properly
					var aResDestinations = oResModel.neoapp.destinations;
					expect(aResDestinations[0].path).to.equal("/resources");
					expect(aResDestinations[1].path).to.equal("/sap/bc/ui5_ui5");
					expect(aResDestinations[2].path).to.equal("/webapp/resources");
					expect(aResDestinations[3].path).to.equal("/webapp/test-resources");
					expect(aResDestinations[4].path).to.equal("/dist/resources");
					expect(aResDestinations[5].path).to.equal("/dist/test-resources");
					// This file should exist only when generating an extension for the "My Inbox" application
					expect(aResult1[0].file(".user.project.json.tmpl")).to.be.null;

					var oModelWithWebapp = {
						"extensionProject":"",
						"extensibility":{
							"system":{
								"name": "abap_backend",
								"id": "GM6",
								"client": ""
							},
							"component":  "ZTESTGUIDE%2fwebapp%2fComponent.js",
							"type": "abaprep",
							"controllers": {
								"App":"ZTESTGUIDE%2fwebapp%2fview%2fApp.controller.js",
								"Detail": "ZTESTGUIDE%2fwebapp%2fview%2fDetail.controller.js",
								"Master": "ZTESTGUIDE%2fwebapp%2fview%2fMaster.controller.js"
							},
							"namespace": "fioridemo",
							"resourceBundle": "i18n/i18n.properties",
							"views": {
								"App":"ZTESTGUIDE%2fwebapp%2fview%2fApp.view.xml",
								"Detail": "ZTESTGUIDE%2fwebapp%2fview%2fDetail.view.xml",
								"Master": "ZTESTGUIDE%2fwebapp%2fview%2fMaster.view.xml"
							}
						},
						"parentProjectName":"ZTESTGUIDE",
						"neoAppPath":"ZTESTGUIDE%2fwebapp%2fneo-app.json",
						"metadataPath":"ZTESTGUIDE%2fwebapp%2fmodel%2fmetadata.xml",
						"parentPath":"ZTESTGUIDE",
						"projectName": "ZTESTGUIDEExtension1"
					};

					// flow 2 - with 'webapp' folder
					return extensionProjectTemplate.onBeforeTemplateGenerate(oMockProjectZip, oModelWithWebapp).then(function(aResult2) {
						// This file should exist only when generating an extension for the "My Inbox" application
						expect(aResult2[0].file(".user.project.json.tmpl")).to.be.null;
						expect(aResult2[1].componentJsPath).to.equal("ZTESTGUIDE/webapp"); // componentJsPath with webapp
					});
				});
			});

			//this test checks the value of componentJsPath in the model when having a parent project with namespace
			it("Test onBeforeTemplateGenerate method - from ABAP - parent project with namespace", function() {

				var oModelWithWebapp = {
					"extensionProject":undefined,
					"extensibility":{
						"system":{
							"name": "abap_backend",
							"id": "GM6",
							"client": ""
						},
						"component":  "%2fTESTNS%2fMYTEST%2fwebapp%2fComponent.js",
						"type": "abaprep",
						"controllers": {
							"App":"%2fTESTNS%2fMYTEST%2fwebapp%2fview%2fApp.controller.js",
							"Detail": "%2fTESTNS%2fMYTEST%2fwebapp%2fview%2fDetail.controller.js",
							"Master": "%2fTESTNS%2fMYTEST%2fwebapp%2fview%2fMaster.controller.js"
						},
						"namespace": "fioridemo",
						"resourceBundle": "i18n/i18n.properties",
						"views": {
							"App":"%2fTESTNS%2fMYTEST%2fwebapp%2fview%2fApp.view.xml",
							"Detail": "%2fTESTNS%2fMYTEST%2fwebapp%2fview%2fDetail.view.xml",
							"Master": "%2fTESTNS%2fMYTEST%2fwebapp%2fview%2fMaster.view.xml"
						}
					},
					"parentProjectName":"TESTNS/MYTEST",
					"neoAppPath":"%2fTESTNS%2fMYTEST%2fwebapp%2fneo-app.json",
					"metadataPath":"%2fTESTNS%2fMYTEST%2fwebapp%2fmodel%2fmetadata.xml",
					"parentPath":"/TESTNS/MYTEST",
					"projectName": "TESTNSMYTESTExtension"
				};

				oMockProjectZip = new JSZip();
				oMockProjectZip.folder("res");
				oMockProjectZip.file("Component.js.tmpl","1");
				oMockProjectZip.file("index.html.tmpl","2");
				oMockProjectZip.file("localIndex.html.tmpl","3");
				oMockProjectZip.file("manifest.json.tmpl","5");

				return extensionProjectTemplate.onBeforeTemplateGenerate(oMockProjectZip, oModelWithWebapp).then(function(aResult2) {
					// This file should exist only when generating an extension for the "My Inbox" application
					expect(aResult2[0].file(".user.project.json.tmpl")).to.be.null;

					expect(aResult2[1].componentJsPath).to.equal("TESTNS/MYTEST/webapp"); // componentJsPath with webapp
					expect(aResult2[1].extensibility.BSPName).to.equal("/TESTNS/MYTEST");
					expect(aResult2[1].extensibility.parentResourceRootUrl).to.equal("/destinations/abap_backend/sap/bc/ui5_ui5/TESTNS/MYTEST/webapp");
					expect(aResult2[1].extensionProject.isBSPNamespace).to.equal(true); // this will update the url in the component.js.tmpl
				});
			});

			it("Tests onBeforeTemplateGenerate method - Type 'Workspace' and with manifest", function() {

				var oMockModel = {
					"parentPath":"/TM3",
					"parentProjectName":"TM3",
					"extensibility":{
						"controllers":{
							"App":"/TM3/webapp/controller/App.controller.js",
							"Detail":"/TM3/webapp/controller/Detail.controller.js",
							"Master":"/TM3/webapp/controller/Master.controller.js"},
						"views":{
							"App":"/TM3/webapp/view/App.view.xml",
							"Detail":"/TM3/webapp/view/Detail.view.xml",
							"DetailNoObjectsAvailable":"/TM3/webapp/view/DetailNoObjectsAvailable.view.xml",
							"DetailObjectNotFound":"/TM3/webapp/view/DetailObjectNotFound.view.xml",
							"Master":"/TM3/webapp/view/Master.view.xml",
							"NotFound":"/TM3/webapp/view/NotFound.view.xml"},
						"fragments":{
							"ViewSettingsDialog":"/TM3/webapp/view/ViewSettingsDialog.fragment.xml"},
						"type":"Workspace",
						"projectjson":"/TM3/.project.json",
						"system" : undefined,
						"component":"/TM3/webapp/Component.js",
						"manifest":"/TM3/webapp/manifest.json"
					},
					"neoAppPath":"/TM3/neo-app.json",
					"metadataPath":"/TM3/webapp/localService/metadata.xml",
					"projectName":"TM3Extension1"
				};

				return extensionProjectTemplate.onBeforeTemplateGenerate(oMockProjectZip, oMockModel).spread(function(oTemplateZip, oResModel) {
					expect(oResModel.extensibility.manifest).to.equal("/TM3/webapp/manifest.json");
					expect(oResModel.extensibility.resourceBundle).to.equal("/dummyI18nPath");
					expect(oResModel.extensibility.namespace).to.equal("dummyAppNamespace");
					expect(oResModel.manifestTitle).to.equal("dummyTitle");
					expect(oResModel.metadataPath).to.equal("/TM3/webapp/localService/metadata.xml");
					expect(oResModel.extensionProject.orionPath).to.equal("dummyOutput");
					expect(oResModel.extensionProject.user).to.equal("dummyAccount$dummyUser");

					// This file should exist only when generating an extension for the "My Inbox" application
					expect(oTemplateZip.file(".user.project.json.tmpl")).to.be.null;
				});
			});
			
			it("Tests onBeforeTemplateGenerate method - from ABAP and with manifest", function() {

				var oModel = {
					"extensionProject":"",
					"extensibility":{
						"system":{
							"name": "abap_backend",
							"id": "GM6",
							"client": ""
						},
						"component":  "ZTESTGUIDE%2fComponent.js",
						"manifest":"ZTESTGUIDE%2fmanifest.json",
						"type": "abaprep",
						"controllers": {
							"App":"ZTESTGUIDE%2fview%2fApp.controller.js",
							"Detail": "ZTESTGUIDE%2fview%2fDetail.controller.js",
							"Master": "ZTESTGUIDE%2fview%2fMaster.controller.js"
						},
						"namespace": "fioridemo",
						"resourceBundle": "i18n/i18n.properties",
						"views": {
							"App":"ZTESTGUIDE%2fview%2fApp.view.xml",
							"Detail": "ZTESTGUIDE%2fview%2fDetail.view.xml",
							"Master": "ZTESTGUIDE%2fview%2fMaster.view.xml"
						}
					},
					"parentProjectName":"ZTESTGUIDE",
					"neoAppPath":"ZTESTGUIDE%2fneo-app.json",
					"metadataPath":"ZTESTGUIDE%2fmodel%2fmetadata.xml",
					"parentPath":"ZTESTGUIDE",
					"projectName": "ZTESTGUIDEExtension1"
				};

				return extensionProjectTemplate.onBeforeTemplateGenerate(oMockProjectZip, oModel).spread(function(oTemplateZip, oResModel) {
					expect(oResModel.extensibility.manifest).to.equal("ZTESTGUIDE%2fmanifest.json");
					expect(oResModel.extensibility.resourceBundle).to.equal("/dummyI18nPath");
					expect(oResModel.extensibility.namespace).to.equal("dummyAppNamespace");
					expect(oResModel.manifestTitle).to.equal("dummyTitle");
					expect(oResModel.metadataPath).to.equal("ZTESTGUIDE%2fmodel%2fmetadata.xml");

					// This file should exist only when generating an extension for the "My Inbox" application
					expect(oTemplateZip.file(".user.project.json.tmpl")).to.be.null;
					
					var aDestinations = oResModel.neoapp.destinations;
					expect(aDestinations.length).to.equal(9);
					expect(aDestinations[2].path).to.equal("/resources/dummyDependencyId");
					expect(aDestinations[4].path).to.equal("/webapp/resources/dummyDependencyId");
					expect(aDestinations[7].path).to.equal("/dist/resources/dummyDependencyId");
				});
			});

			it("Tests onBeforeTemplateGenerate method - My Inbox from ABAP", function() {

				var oModel = {
					"extensionProject":"",
					"extensibility": {
						"controllers": {
							"Main": "CA_FIORI_INBOX%2fMain.controller.js",
							"AddInbox": "CA_FIORI_INBOX%2fview%2fAddInbox.controller.js",
							"Forward": "CA_FIORI_INBOX%2fview%2fForward.controller.js",
							"MultiSelectDetail": "CA_FIORI_INBOX%2fview%2fMultiSelectDetail.controller.js",
							"MultiSelectFilter": "CA_FIORI_INBOX%2fview%2fMultiSelectFilter.controller.js",
							"MultiSelectMessage": "CA_FIORI_INBOX%2fview%2fMultiSelectMessage.controller.js",
							"MultiSelectSummary": "CA_FIORI_INBOX%2fview%2fMultiSelectSummary.controller.js",
							"S2": "CA_FIORI_INBOX%2fview%2fS2.controller.js",
							"S3": "CA_FIORI_INBOX%2fview%2fS3.controller.js",
							"SupportInfo": "CA_FIORI_INBOX%2fview%2fSupportInfo.controller.js",
							"ViewSubstitution": "CA_FIORI_INBOX%2fview%2fViewSubstitution.controller.js"
						},
						"views": {
							"Main": "CA_FIORI_INBOX%2fMain.view.xml",
							"AddInbox": "CA_FIORI_INBOX%2fview%2fAddInbox.view.xml",
							"Forward": "CA_FIORI_INBOX%2fview%2fForward.view.xml",
							"MultiSelectDetail": "CA_FIORI_INBOX%2fview%2fMultiSelectDetail.view.xml",
							"MultiSelectFilter": "CA_FIORI_INBOX%2fview%2fMultiSelectFilter.view.xml",
							"MultiSelectMessage": "CA_FIORI_INBOX%2fview%2fMultiSelectMessage.view.xml",
							"MultiSelectSummary": "CA_FIORI_INBOX%2fview%2fMultiSelectSummary.view.xml",
							"S2": "CA_FIORI_INBOX%2fview%2fS2.view.xml",
							"S3": "CA_FIORI_INBOX%2fview%2fS3.view.xml",
							"SupportInfo": "CA_FIORI_INBOX%2fview%2fSupportInfo.view.xml",
							"ViewSubstitution": "CA_FIORI_INBOX%2fview%2fViewSubstitution.view.xml"
						},
						"fragments": {
							"AddSubstitute": "CA_FIORI_INBOX%2ffrag%2fAddSubstitute.fragment.xml",
							"JamShareItemDisplay": "CA_FIORI_INBOX%2ffrag%2fJamShareItemDisplay.fragment.xml",
							"Resubmit": "CA_FIORI_INBOX%2ffrag%2fResubmit.fragment.xml",
							"SubstituteProfile": "CA_FIORI_INBOX%2ffrag%2fSubstituteProfile.fragment.xml",
							"UserPicker": "CA_FIORI_INBOX%2ffrag%2fUserPicker.fragment.xml"
						},
						"type": "abaprep",
						"component": "CA_FIORI_INBOX%2fComponent.js",
						"configuration": "CA_FIORI_INBOX%2fConfiguration.js",
						"manifest": "CA_FIORI_INBOX%2fmanifest.json",
						"system": {
							"name": "abap_backend",
							"proxyUrlPrefix": "/destinations/abap_backend",
							"sapClient": ""
						}
					},
					"metadataPath": "CA_FIORI_INBOX%2fmodel%2fmetadata.xml",
				 	"neoAppPath": "undefined",
				 	"openExtPane": "false",
				 	"parentPath": "CA_FIORI_INBOX",
				 	"parentProjectName": "CA_FIORI_INBOX",
				 	"projectName": "CA_FIORI_INBOXExtension"

				};

				var oMockContext = buildMockContext();
				oMockContext.service.ui5projecthandler.getAppNamespace = function () {
					return Q("cross.fnd.fiori.inbox");
				};

				extensionProjectTemplate.setContext(oMockContext);

				return extensionProjectTemplate.onBeforeTemplateGenerate(oMockProjectZip, oModel).spread(function(oTemplateZip, oResModel) {
					expect(oResModel.extensibility.namespace).to.equal("cross.fnd.fiori.inbox");
					// This file should exist only when generating an extension for the "My Inbox" application
					expect(oTemplateZip.file(".user.project.json.tmpl")).to.be.ok;
				});
			});
		});
	});