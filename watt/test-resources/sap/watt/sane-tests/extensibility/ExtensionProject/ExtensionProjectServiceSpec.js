define(['STF',
	"sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/services/ExtensionProject"], function(STF, ExtensionProject) {

	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "fioriexttemplate_ExtensionProject_Service";

	var iFrameWindow = null;

	describe("Unit tests for ExtensionProject service", function() {
		before(function (done) {
			STF.startWebIde(suiteName).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				done();
			});
		});

		it('getResourceLocation', function(done) {

			var oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
			var oExtensionProjectService = STF.getService(suiteName, "extensionproject");

			var oFileStructure = {
				"extensionapp1" : {
					"Component.js" : ""
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oExtensionProjectService.getResourceLocation("/extensionapp1").then(function(sResourceLocation1) {
					expect(sResourceLocation1).to.equal("");

					oFileStructure = {
						"extensionapp2" : {
							"src" : {
								"main" : {
									"webapp" : {
										"Component.js" : ""
									}
								}
							}
						}
					};

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oExtensionProjectService.getResourceLocation("/extensionapp2").then(function (sResourceLocation2) {
							expect(sResourceLocation2).to.equal("src/main/webapp/");
							done();
						});
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});

	describe("Unit tests for ExtensionProject internal functions", function() {
		var extensionProject;
		beforeEach(function () {
			extensionProject = new ExtensionProject();
			buildMockContext();
		});

		function EnhanceMock(oAllExtensions, sNamespace) {
			if (!extensionProject.context.service.ui5projecthandler) {
				extensionProject.context.service.ui5projecthandler = {};
			}
			// mock getAppNamespace method
			extensionProject.context.service.ui5projecthandler.getAppNamespace = function() {
				return Q(sNamespace);
			};

			// mock getAllExtensions method
			extensionProject.context.service.ui5projecthandler.getAllExtensions = function() {
				return Q(oAllExtensions);
			};
			// mock getDocument method: returns a Component.js file
			extensionProject.context.service.filesystem.documentProvider.getDocument = function(sFullPath) {
				var oDocument = {};

				var sComponentName = "Component.js";
				if (sFullPath.substr(-sComponentName.length) === sComponentName) {
					oDocument.getContent = function() {
						return Q("jQuery.sap.declare(\"cus.sd.salesorder.monitor.SD_SO_MONExtension.Component\");sap.ui.component.load({name: \"cus.sd.salesorder.monitor\",url: \"/sap/bc/ui5_ui5/sap/SD_SO_MON\"});this.cus.sd.salesorder.monitor.Component.extend(\"cus.sd.salesorder.monitor.SD_SO_MONExtension.Component\",{metadata:{version: \"1.0\",config:{},customizing:{\"sap.ui.controllerExtensions\":{\"cus.sd.salesorder.monitor.view.S3\":{controllerName: \"cus.sd.salesorder.monitor.SD_SO_MONExtension.view.S3Custom\"}}}}});");
					};
					oDocument.getEntity = function() {
						var getType = function() {
							return "file";
						};
						var getName = function() {
							return sComponentName;
						};
						var getFullPath = function() {
							return "/Starter/Component.js";
						};
						return {
							getType: getType,
							getName: getName,
							getFullPath: getFullPath
						};
					};
				} else {
					oDocument.getContent = function () {
						return Q("");
					};
					oDocument.getEntity = function() {
						var getType = function() {
							return "file";
						};
						var getName = function() {
							var aPathParts = sFullPath.split("/");
							return aPathParts.pop();
						};
						var getFullPath = function() {
							return sFullPath;
						};
						return {
							getType: getType,
							getName: getName,
							getFullPath: getFullPath
						};
					};
				}

				oDocument.refresh = function() {
					return Q();
				};

				return Q(oDocument);
			};
		}

		function buildMockContext() {
			extensionProject.context = {};

			extensionProject.context.i18n = {};
			extensionProject.context.i18n.getText = function() {
				return "error";
			};

			extensionProject.context.service = {};
			extensionProject.context.service.filesystem = {};
			extensionProject.context.service.filesystem.documentProvider = {};
			extensionProject.context.service.filesystem.documentProvider.getRoot = function() {
				var oRoot = {};
				oRoot.objectExists = function() {
					return Q(false);
				};
				oRoot.getCurrentMetadata = function() {
					return Q([]);
				};
				return Q(oRoot);
			};
			extensionProject.context.service.filesystem.documentProvider.getDocument = function() {
				return Q({});
			};

			extensionProject.context.service.content = {};
			extensionProject.context.service.content.open = function(oDocument) {
				return Q(oDocument.getEntity ? oDocument.getEntity().getFullPath() : "");
			};

			extensionProject.context.service.log = {};
			extensionProject.context.service.log.error = function() {
				return Q("ExtensionProject test: an error has occurred");
			};

			extensionProject.context.service.repositorybrowser = {};
			extensionProject.context.service.repositorybrowser.setSelection = function() {
				return Q();
			};

			extensionProject.context.service.ui5wysiwygeditor = {};

			extensionProject.context.service.ui5projecthandler = {};
			extensionProject.context.service.ui5projecthandler.getAllExtensions = function() {
				return Q({});
			};

			extensionProject.context.service.document = {};
			extensionProject.context.service.document.open = function() {
				return Q("");
			};
		}

		function buildMockModel() {
			var model = {};
			model.extensionProjectName = "extName";
			model.fiori = {};
			model.fiori.extendHook = true;
			model.fiori.extensionCommon = {};
			return model;
		}

		// Validation of bug 1570798926
		it("Creates a controller hook in a new file with findExtensionRevision", function(done) {

			var model = buildMockModel();
			var oDeferred = Q.defer();
			// When index is bigger than 0, we expect the file name to include the index
			extensionProject.findExtensionRevision(model, "path", ".controller.js", 1, oDeferred);
			oDeferred.promise.then(function() {
				expect(model.fiori.extensionCommon.extensionFilePath).to.equal("path1");
				done();
			});
		});

		it("Tests createFolderName method", function() {

			var folderName = "MichalTest";

			// create a folder and mock as if the folder doesn't exist
			return extensionProject.createFolderName(folderName).then(function(sResultFolderName1) {
				expect(sResultFolderName1).to.equal("MichalTest");

				// mock as if the project already exists
				extensionProject.context.service.filesystem.documentProvider.getRoot = function() {
					var oRoot = {};
					oRoot.getCurrentMetadata = function() {
						var aRawNodes = [];
							aRawNodes.push({name:"MichalTest"});
						return Q(aRawNodes);
					};
					return Q(oRoot);
				};

				return extensionProject.createFolderName(folderName).then(function(sResultFolderName2) {
					expect(sResultFolderName2).to.equal("MichalTest1");

					// mock as if the project not exists, but project name is contained in the existing one
					extensionProject.context.service.filesystem.documentProvider.getRoot = function() {
						var oRoot = {};
						oRoot.getCurrentMetadata = function() {
							var aRawNodes = [];
							aRawNodes.push({name:"MichalTestExtension"});
							return Q(aRawNodes);
						};
						return Q(oRoot);
					};
					return extensionProject.createFolderName(folderName).then(function(sResultFolderName3) {
						expect(sResultFolderName3).to.equal("MichalTest");

						// mock as if the same project with serial #no exist
						extensionProject.context.service.filesystem.documentProvider.getRoot = function() {
							var oRoot = {};
							oRoot.getCurrentMetadata = function() {
								var aRawNodes = [];
								aRawNodes.push({name:"MichalTest"});
								aRawNodes.push({name:"MichalTest2"});
								return Q(aRawNodes);
							};
							return Q(oRoot);
						};
						return extensionProject.createFolderName(folderName).then(function(sResultFolderName4) {
							expect(sResultFolderName4).to.equal("MichalTest1");
						});
					});
				});
			});
		});

		it("Tests isFolderExist method ", function() {
			extensionProject.context.service.filesystem.documentProvider.getRoot = function() {
				var oRoot = {};
				oRoot.getCurrentMetadata = function () {
					var aRawNodes = [];
					aRawNodes.push({name: "SimpleTest1"});
					aRawNodes.push({name: "MoreTest"});
					aRawNodes.push({name: "OtherTest"});
					return Q(aRawNodes);
				};
				return Q(oRoot);
			};
			return extensionProject.context.service.filesystem.documentProvider.getRoot().then(function(rootDocument) {
				return rootDocument.getCurrentMetadata().then(function(oRootContent) {
					var sResult;
					sResult = extensionProject.isFolderExist("SimpleTest1",oRootContent);
					expect(sResult).to.equal(true);
					sResult = extensionProject.isFolderExist("SimpleTest",oRootContent);
					expect(sResult).to.equal(false);
					sResult =  extensionProject.isFolderExist("SimpleTest2",oRootContent);
					expect(sResult).to.equal(false);
					sResult = extensionProject.isFolderExist("OtherTest",oRootContent);
					expect(sResult).to.equal(true);
					sResult = extensionProject.isFolderExist("MoreTest",oRootContent);
					expect(sResult).to.equal(true);
					sResult = extensionProject.isFolderExist("Simple",oRootContent);
					expect(sResult).to.equal(false);
				});
			});
		});

		it("Tests validateExtensionProject method", function() {

			// validation 1 - no model - isValid = false
			return extensionProject.validateExtensionProject("/").then(function(oResult1) {
				expect(oResult1.isValid).to.equal(false);

				// mock getExtensibilityModel method to return empty model
				extensionProject.getExtensibilityModel = function() {
					var oDeferred = Q.defer();
					oDeferred.resolve({});
					return oDeferred.promise;
				};

				// validation 2 - no extensibility block in model - isValid = false
				return extensionProject.validateExtensionProject("/extensionProjectPath").then(function(oResult2) {
					expect(oResult2.isValid).to.equal(false);

					// mock getExtensibilityModel method to return a model with empty extensibility block
					extensionProject.getExtensibilityModel = function() {
						var oDeferred = Q.defer();
						var model = {};
						model.extensibility = {};
						oDeferred.resolve(model);
						return oDeferred.promise;
					};

					// validation 3 - no views/controllers in extensibility block in model - isValid = false
					return extensionProject.validateExtensionProject("/extensionProjectPath").then(function(oResult3) {
						expect(oResult3.isValid).to.equal(false);

						// mock getExtensibilityModel method to return a model
						// with extensibility block with empty views block
						extensionProject.getExtensibilityModel = function() {
							var oDeferred = Q.defer();
							var model = {};
							model.extensibility = {};
							model.extensibility.views = {};
							oDeferred.resolve(model);
							return oDeferred.promise;
						};

						// validation 4 - empty views object in extensibility block in model - isValid = false
						return extensionProject.validateExtensionProject("/extensionProjectPath").then(function(oResult4) {
							expect(oResult4.isValid).to.equal(false);

							// mock getExtensibilityModel method to return a model
							// with extensibility block with empty controllers block
							extensionProject.getExtensibilityModel = function() {
								var oDeferred = Q.defer();
								var model = {};
								model.extensibility = {};
								model.extensibility.controllers = {};
								oDeferred.resolve(model);
								return oDeferred.promise;
							};

							// validation 5 - empty controllers object in extensibility block in model - isValid = false
							return extensionProject.validateExtensionProject("/extensionProjectPath").then(function(oResult5) {
								expect(oResult5.isValid).to.equal(false);

								// mock getExtensibilityModel method to return a model
								// with extensibility block with both views and controllers blocks
								extensionProject.getExtensibilityModel = function() {
									var oDeferred = Q.defer();
									var model = {};
									model.extensibility = {};
									model.extensibility.views = {
										"Master" : "/Demo/Master.view.xml",
										"Detail" : "/Demo/Detail.view.xml"
									};
									model.extensibility.controllers = {
										"Master" : "/Demo/Master.controller.js",
										"Detail" : "/Demo/Detail.controller.js"
									};
									oDeferred.resolve(model);
									return oDeferred.promise;
								};

								// validation 6 - all is good - isValid = true
								return extensionProject.validateExtensionProject("/extensionProjectPath").then(function(oResult6) {
									expect(oResult6.isValid).to.equal(true);
								});
							});
						});
					});
				});
			});
		});

		it("Tests updateFileContent method", function() {
			// mock document
			var oFileDocument = {};
			oFileDocument.setContent = function(content) {
				return Q(content);
			};
			oFileDocument.save = function() {
				return "saved";
			};

			return extensionProject.updateFileContent(oFileDocument, "hello").then(function(sResult) {
				expect(sResult).to.equal("saved");
			});
		});

		it("Tests getExtensibilityModel method", function() {

			// mock getDocument method that returns a file document with content "{}"
			extensionProject.context.service.filesystem.documentProvider.getDocument = function() {
				var oFileDocument = {};
				oFileDocument.getContent = function() {
					return Q("{}"); // empty object
				};
				return Q(oFileDocument);
			};

			// validation 1 - project.json with {} content
			return extensionProject.getExtensibilityModel("/extensionProjectPath").then(function(model) {
				expect(jQuery.isEmptyObject(model)).to.equal(true);

				// validation 2 - empty project.json - should fail
				extensionProject.context.service.filesystem.documentProvider.getDocument = function() {
					var oFileDocument = {};
					oFileDocument.getContent = function() {
						return Q(""); // empty content
					};
					return Q(oFileDocument);
				};

				return extensionProject.getExtensibilityModel("/extensionProjectPath").fail(function(sError1) {
					expect(sError1).to.equal("error");

					// validation 3 - invalid project.json - should fail
					extensionProject.context.service.filesystem.documentProvider.getDocument = function() {
						var oFileDocument = {};
						oFileDocument.getContent = function() {
							return Q("{\"key\" : \"value\"...}"); // invalid json content
						};
						return Q(oFileDocument);
					};

					return extensionProject.getExtensibilityModel("/extensionProjectPath").fail(function(sError2) {
						expect(sError2).to.equal("error");

						// validation 4 - no project.json - should fail
						extensionProject.context.service.filesystem.documentProvider.getDocument = function() {
							return Q(null);
						};

						return extensionProject.getExtensibilityModel("/extensionProjectPath").fail(function(sError3) {
							expect(sError3).to.equal("error");
						});
					});
				});
			});
		});

		it("Tests openDocument method", function() {

			// mock getDocument method: returns a folder with one Component.js file
			extensionProject.context.service.filesystem.documentProvider.getDocument = function() {
				var oFolderDocument = {};
				oFolderDocument.getFolderContent = function() {
					var files = [];
					files.push({
						getEntity : function() {
							var getType = function() {
								return "file";
							};
							var getName = function() {
								return "Component.js";
							};
							var getFullPath = function() {
								return "/Starter/Component.js";
							};
							return {
								getType: getType,
								getName: getName,
								getFullPath: getFullPath
							};
						},
						getContent : function() {
							return Q("jQuery.sap.declare(\"cus.sd.salesorder.monitor.SD_SO_MONExtension.Component\");sap.ui.component.load({name: \"cus.sd.salesorder.monitor\",url: \"/sap/bc/ui5_ui5/sap/SD_SO_MON\"});this.cus.sd.salesorder.monitor.Component.extend(\"cus.sd.salesorder.monitor.SD_SO_MONExtension.Component\",{metadata:{version: \"1.0\",config:{},customizing:{\"sap.ui.controllerExtensions\":{\"cus.sd.salesorder.monitor.view.S3\":{controllerName: \"cus.sd.salesorder.monitor.SD_SO_MONExtension.view.S3Custom\"}}}}});");
						}
					});

					return Q(files);
				};
				oFolderDocument.getContent = function() {
					return Q("jQuery.sap.declare(\"cus.sd.salesorder.monitor.SD_SO_MONExtension.Component\");sap.ui.component.load({name: \"cus.sd.salesorder.monitor\",url: \"/sap/bc/ui5_ui5/sap/SD_SO_MON\"});this.cus.sd.salesorder.monitor.Component.extend(\"cus.sd.salesorder.monitor.SD_SO_MONExtension.Component\",{metadata:{version: \"1.0\",config:{},customizing:{\"sap.ui.controllerExtensions\":{\"cus.sd.salesorder.monitor.view.S3\":{controllerName: \"cus.sd.salesorder.monitor.SD_SO_MONExtension.view.S3Custom\"}}}}});");
				};
				oFolderDocument.getEntity = function() {
					var getType = function() {
						return "file";
					};
					var getName = function() {
						return "Component.js";
					};
					var getFullPath = function() {
						return "/Starter/Component.js";
					};
					return {
						getType: getType,
						getName: getName,
						getFullPath: getFullPath
					};
				};
				oFolderDocument.refresh = function() {
					return Q();
				};

				return Q(oFolderDocument);
			};

			// mock getHandlerDocument method
			extensionProject.context.service.ui5projecthandler = {};
			extensionProject.context.service.ui5projecthandler.getHandlerDocument = function() {
				var handlerDocument = {};
				handlerDocument.getTitle = function() {
					return "manifest.json";
				};
				return Q(handlerDocument);
			};

			var extensionCommon = {};
			extensionCommon.customizationId = "sap.ui.controllerExtensions";
			extensionCommon.resourceTypeName = "controllerName";
			var resourceId = "cus.sd.salesorder.monitor.view.S3";

			// mock getAllExtensions method
			extensionProject.context.service.ui5projecthandler.getAllExtensions = function() {
				var oAllExtensions = {};
				oAllExtensions[extensionCommon.customizationId] = {};
				oAllExtensions[extensionCommon.customizationId][resourceId] = {};
				oAllExtensions[extensionCommon.customizationId][resourceId][extensionCommon.resourceTypeName] = "ext_name";
				return Q(oAllExtensions);
			};

			// mock getAppNamespace method
			extensionProject.context.service.ui5projecthandler.getAppNamespace = function() {
				return Q("NS1");
			};

			extensionProject.getExtensibilityModel = function() {
				var model = {};
				model.extensibility = {};
				model.extensibility.namespace = "namespace";
				return Q(model);
			};

			extensionCommon.resourceSuffix = "xml";

			return extensionProject.openDocument("/extensionProjectPath", extensionCommon, resourceId, "oExtensionId", "/extensionProjectPath/Component.js").then(function(res) {
				expect(res).to.equal("");
			});
		});

		it("Tests openLayoutEditor method - with old structure of extension project (no webapp)", function() {
			var oAllExtensions = {
				"sap.ui.viewReplacements" : {
					"NS1.view.Master" : {
						viewName : "NS1Extension.view.MasterCustom",
						type : "XML"
					}
				}
			};
			var sNamespace = "NS1Extension";

			EnhanceMock(oAllExtensions, sNamespace);

			var extensionCommon = {
				customizationId : "sap.ui.viewReplacements",
				resourceSuffix : ".view.xml",
				resourceTypeName : "viewName"
			};

			var oNodeModel = {
				resourceInfo : {
					resourceLocationPath: "view/",
					originalId : "NS1.view.Master",
					newResourceName: "MasterCustom"
				},
				attributes : {},
				type : "view"
			};

			var sExtensionResourcesPath = ""; // for old structure of extension project (no webapp folder)

			// sExtensionProjectPath, oNodeModel, oExtensionCommon, sExtensionResourcesPath
			return extensionProject.openLayoutEditor("/extensionProjectPath", oNodeModel, extensionCommon, sExtensionResourcesPath).then(function(res) {
				expect(res).to.equal("/extensionProjectPath/view/MasterCustom.view.xml");
			});
		});

		it("Tests openLayoutEditor method - open an extended extension point fragment", function() {

			var oAllExtensions = {
				"sap.ui.viewExtensions" : {
					"NS1.view.Master" : {
						extPoint : {
							className : "sap.ui.core.Fragment",
							fragmentName : "NS1Extension.view.Master_extPointCustom",
							type : "XML"
						}
					}
				}
			};
			var sNamespace = "NS1Extension";

			EnhanceMock(oAllExtensions, sNamespace);

			var extensionCommon = {
				"customizationId" : "sap.ui.viewExtensions",
				"resourceSuffix" : ".fragment.xml",
				"resourceTypeName" : "fragmentName"
			};

			var oNodeModel = {
				resourceInfo : {
					resourceLocationPath: "view/",
					id : "NS1.view.Master"
				},
				attributes : {
					name : "extPoint"
				},
				type : "extensionpoint"
			};

			var sExtensionResourcesPath = "webapp/";

			// sExtensionProjectPath, oNodeModel, oExtensionCommon, sExtensionResourcesPath
			return extensionProject.openLayoutEditor("/extensionProjectPath", oNodeModel, extensionCommon, sExtensionResourcesPath).then(function(res) {
				expect(res).to.equal("/extensionProjectPath/webapp/view/Master_extPointCustom.fragment.xml");
			});
		});

		it("Tests openLayoutEditor method - without closing and opening the pane - open the layout immediately after extending", function() {

			var oAllExtensions = {
				"sap.ui.viewReplacements" : {
					"NS1.view.Master" : {
						viewName : "NS1Extension.view.MasterCustom",
						type : "XML"
					}
				}
			};
			var sNamespace = "NS1Extension";

			EnhanceMock(oAllExtensions, sNamespace);

			var extensionCommon = {
				customizationId : "sap.ui.viewReplacements",
				resourceSuffix : ".view.xml",
				resourceTypeName : "viewName"
			};

			var oNodeModel = {
				resourceInfo : {
					resourceLocationPath: "view/",
					originalId : "NS1.view.Master",
					newResourceName: "MasterCustom"
				},
				attributes : {},
				type : "view"
			};

			var sExtensionResourcesPath = "webapp/"; // with webapp - for case of open the layout immediately after extending

			// sExtensionProjectPath, oNodeModel, oExtensionCommon, sExtensionResourcesPath
			return extensionProject.openLayoutEditor("/extensionProjectPath", oNodeModel, extensionCommon, sExtensionResourcesPath).then(function(res) {
				expect(res).to.equal("/extensionProjectPath/webapp/view/MasterCustom.view.xml");
			});
		});

		it("Tests getCustomizingJson method", function() {
			return extensionProject.getCustomizingJson("/extensionProjectPath").then(function(result) {
				expect(jQuery.isEmptyObject(result)).to.equal(true);
			});
		});

		it("Tests isExtendable method", function() {

			var viewId = "StarterTakt15.view.Master";

			extensionProject.context.service.ui5projecthandler.getAllExtensions = function() {
				var oAllExtensions = {};
				oAllExtensions["sap.ui.viewReplacements"] = {};
				oAllExtensions["sap.ui.viewReplacements"][viewId] = {};
				return Q(oAllExtensions);
			};

			extensionProject.getExtensibilityModel = function() {
				var model = {};
				model.extensibility = {};
				model.extensibility.namespace = "namespace";
				return Q(model);
			};

			extensionProject.getComponentJsDocument = function() {
				var fileDocument = {};
				fileDocument.getContent = function() {
					return Q("{customizing: {\"sap.ui.viewReplacements\": {\"StarterTakt15.view.Master\": {viewName: \"StarterTakt15.StarterTakt15Extension1.view.MasterCustom\",type: \"XML\"}}}");
				};
				fileDocument.getEntity = function() {
					var getType = function() {
						return "file";
					};

					var getName = function() {
						return ".project.json";
					};

					var getFullPath = function() {
						return "/starter/.project.json";
					};

					return {
						getType: getType,
						getName: getName,
						getFullPath : getFullPath
					};
				};

				return Q(fileDocument);
			};

			// validation 1
			var customizingId = "sap.ui.viewReplacements";
			return extensionProject.isExtendable("/extensionProjectPath", customizingId, viewId).then(function(result1) {
				expect(result1).to.equal(false);

				// validation 2
				customizingId = "sap.ui.viewExtensions";
				return extensionProject.isExtendable("/extensionProjectPath", customizingId, viewId).then(function(result2) {
					expect(result2).to.equal(false);

					// validation 3
					customizingId = "somethingIllegal";
					return extensionProject.isExtendable("/extensionProjectPath", customizingId, viewId).then(function(result3) {
						expect(result3).to.equal(true);
					});
				});
			});
		});

		it("Tests getExtensionRevision method - Test that 'Custom' isn't being added more than once as suffix", function() {

			var model = {};
			var projectName = "MyProject";
			var resourceName = "MyController";
			var locationPath = "view";
			var resourceSuffix = ".controller.js";
			model.extensionProjectName = projectName;
			model.fiori = {};
			model.fiori.extensionCommon = {};
			model.fiori.extensionCommon.resourceName = resourceName + "Custom";
			model.fiori.extensionCommon.resourceLocationPath = locationPath + "%2f";
			model.fiori.extensionCommon.resourceSuffix = resourceSuffix;
			model.fiori.extensionCommon.originalId = resourceName;

			return extensionProject.getExtensionRevision(model).then(function(index) {
				expect(index).to.equal(0);
				expect(model.fiori.extensionCommon.extensionFilePath).to.equal(locationPath + "/" + resourceName + "Custom");
			});
		});

		function getMockFor_isHookExtendedInController(customControllerCode) {
			return function() {
				return {getCustomControllerDocument : function() {
					var document = {getContent: function() {
						return Q(customControllerCode);
					}};
					return Q(document);
				}};
			};
		}

		it("Tests isHookExtendedInController method", function() {
			// Prepare mock
			// Using escaped custom controller code with a single hook named extHookOnInit
			extensionProject.getExtendUtil = getMockFor_isHookExtendedInController("sap.ui.controller(\"S3Custom\", {\r\n\t\/\/@@@extHookOnInit start - do not remove this line\r\n\textHookOnInit: function() {\r\n\t\t\/* Place your hook implementation code here *\/\r\n\t}\r\n\t\/\/@@@extHookOnInit end - do not remove this line\r\n});");
			// Use dummy arguments - they are ignored by the mock
			return extensionProject.isHookExtendedInController("extHookOnInit", "dummy", {}).then(function(flag) {
				expect(flag).to.equal(true);
			});
		});

		it("Tests isHookExtendedInController method - no hooks", function() {
			// Prepare mock
			// Using escaped custom controller code with a single hook named differently then extHookOnInit that we want to find
			extensionProject.getExtendUtil = getMockFor_isHookExtendedInController("sap.ui.controller(\"S3Custom\", {\r\n\t\/\/@@@extHookSetHeaderFooterOptions start - do not remove this line\r\n\textHookSetHeaderFooterOptions: function() {\r\n\t\t\/* Place your hook implementation code here *\/\r\n\t}\r\n\t\/\/@@@extHookSetHeaderFooterOptions end - do not remove this line\r\n});");
			// Use dummy arguments - they are ignored by the mock
			return extensionProject.isHookExtendedInController("extHookOnInit", "dummy", {}).then(function(flag) {
				expect(flag).to.equal(false);
			});
		});

		it("Tests isHookExtendedInController method - parsing failure", function() {
			// Prepare mock
			extensionProject.getExtendUtil = getMockFor_isHookExtendedInController("this is invalid JS code");

			// Use dummy arguments - they are ignored by the mock
			return extensionProject.isHookExtendedInController("extHookOnInit", "dummy", {}).fail(function(oError) { // should fail
				expect(oError.message).to.equal("error");
			});
		});

		it("Tests _getResourceConsts method", function() {
			// Test controller consts
			var resourceType = "controller";
			var resourceConsts = extensionProject._getResourceConsts(resourceType);
			expect(resourceConsts.customizationId).to.equal("sap.ui.controllerExtensions");
			expect(resourceConsts.resourceSuffix).to.equal(".controller.js");
			expect(resourceConsts.resourceTypeName).to.equal("controllerName");

			// Test view consts
			resourceType = "view";
			resourceConsts = extensionProject._getResourceConsts(resourceType);
			expect(resourceConsts.customizationId).to.equal("sap.ui.viewReplacements");
			expect(resourceConsts.resourceSuffix).to.equal(".view.xml");
			expect(resourceConsts.resourceTypeName).to.equal("viewName");

			// Anything else as type is treated as view
			resourceType = "kuku";
			resourceConsts = extensionProject._getResourceConsts(resourceType);
			expect(resourceConsts.customizationId).to.equal("sap.ui.viewReplacements");
			expect(resourceConsts.resourceSuffix).to.equal(".view.xml");
			expect(resourceConsts.resourceTypeName).to.equal("viewName");
		});

		it("Tests getExtendedResourceInfo method", function() {

			extensionProject.context.service.filesystem.documentProvider.getDocument = function() {
				var document = {};
				document.getFolderContent = function() {
					// empty folder
					return Q([]);
				};
				document.getFolderContent = function() {
					var files = [];
					files.push({
						getEntity : function() {
							var getType = function() {
								return "file";
							};

							var getName = function() {
								return ".project.json";
							};

							var getFullPath = function() {
								return "/starter/.project.json";
							};

							return {
								getType: getType,
								getName: getName,
								getFullPath : getFullPath
							};
						}});

					files.push({
						getContent : function() {
							return Q("jQuery.sap.declare(\"Starter2.Component\");jQuery.sap.require(\"sap.m.routing.RouteMatchedHandler\");sap.ui.core.UIComponent.extend(\"Starter2.Component\", {" +
								"metadata : {\"name\" : \"Master Detail Sample\",\"version\" : \"1.0\",\"includes\" : [],\"dependencies\" : {\"libs\" : [\"sap.m\", \"sap.me\", \"sap.ushell\"]," +
								"\"components\" : []},\"config\" : {\"resourceBundle\" : \"i18n/messageBundle.properties\",\"titleResource\" : \"SHELL_TITLE\",\"serviceConfig\" : {name: \"SRA018_SO_TRACKING_SRV\"," +
								"serviceUrl: \"/sap/opu/odata/sap/SRA018_SO_TRACKING_SRV/\"}},routing: {config: {viewType : \"XML\",viewPath: \"Starter2.view\",targetAggregation: \"detailPages\",clearTarget: false}," +
								"routes:[{pattern: \"\",name : \"master\",view : \"Master\",targetAggregation : \"masterPages\",preservePageInSplitContainer : true,targetControl: \"fioriContent\",subroutes : [{" +
								"pattern : \"Detail/{contextPath}\",view : \"Detail\",name : \"Detail\"}]}]}},init : function() {sap.ui.core.UIComponent.prototype.init.apply(this, arguments);" +
								"this._oRouteMatchedHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter());this.getRouter().initialize();var oServiceConfig = this.getMetadata().getConfig()[\"serviceConfig\"];var sServiceUrl = oServiceConfig.serviceUrl;" +
								"var rootPath = jQuery.sap.getModulePath(\"Starter2\");var sProxyOn = jQuery.sap.getUriParameters().get(\"proxyOn\");var bUseProxy = (\"true\" === sProxyOn);if (bUseProxy) {" +
								"sServiceUrl = rootPath + \"/proxy\" + sServiceUrl;}var responderOn = jQuery.sap.getUriParameters().get(\"responderOn\");var bUseMockData = (\"true\" === responderOn);if (bUseMockData) {" +
								"jQuery.sap.require(\"sap.ui.app.MockServer\");var oMockServer = new sap.ui.app.MockServer({rootUri: sServiceUrl});oMockServer.simulate(rootPath + \"/model/metadata.xml\", rootPath + \"/model/\");" +
								"oMockServer.start();var msg = \"Running in demo mode with mock data.\";jQuery.sap.require(\"sap.m.MessageToast\");sap.m.MessageToast.show(msg, {duration: 4000});}var i18nModel = new sap.ui.model.resource.ResourceModel({" +
								"bundleUrl : rootPath + \"/i18n/messageBundle.properties\"});this.setModel(i18nModel, \"i18n\");var m = new sap.ui.model.odata.ODataModel(sServiceUrl, true);this.setModel(m);var deviceModel = new sap.ui.model.json.JSONModel({" +
								"isTouch : sap.ui.Device.support.touch,isNoTouch : !sap.ui.Device.support.touch,isPhone : jQuery.device.is.phone,isNoPhone : !jQuery.device.is.phone,listMode : (jQuery.device.is.phone) ? \"None\" : \"SingleSelectMaster\"," +
								"listItemType : (jQuery.device.is.phone) ? \"Active\" : \"Inactive\"});deviceModel.setDefaultBindingMode(\"OneWay\");this.setModel(deviceModel, \"device\");},createContent : function() {var oViewData = {component : this};" +
								"return sap.ui.view({viewName : \"Starter2.view.App\",type : sap.ui.core.mvc.ViewType.XML,viewData : oViewData});}});");
						},
						getEntity : function() {
							var getType = function() {
								return "file";
							};

							var getName = function() {
								return "Component.js";
							};

							var getFullPath = function() {
								return "/starter/Component.js";
							};

							return {
								getType: getType,
								getName: getName,
								getFullPath : getFullPath
							};
						}});

					return Q(files);
				};
				document.getContent = function() {
					return Q("jQuery.sap.declare(\"Starter2.Component\");jQuery.sap.require(\"sap.m.routing.RouteMatchedHandler\");sap.ui.core.UIComponent.extend(\"Starter2.Component\", {" +
						"metadata : {\"name\" : \"Master Detail Sample\",\"version\" : \"1.0\",\"includes\" : [],\"dependencies\" : {\"libs\" : [\"sap.m\", \"sap.me\", \"sap.ushell\"]," +
						"\"components\" : []},\"config\" : {\"resourceBundle\" : \"i18n/messageBundle.properties\",\"titleResource\" : \"SHELL_TITLE\",\"serviceConfig\" : {name: \"SRA018_SO_TRACKING_SRV\"," +
						"serviceUrl: \"/sap/opu/odata/sap/SRA018_SO_TRACKING_SRV/\"}},routing: {config: {viewType : \"XML\",viewPath: \"Starter2.view\",targetAggregation: \"detailPages\",clearTarget: false}," +
						"routes:[{pattern: \"\",name : \"master\",view : \"Master\",targetAggregation : \"masterPages\",preservePageInSplitContainer : true,targetControl: \"fioriContent\",subroutes : [{" +
						"pattern : \"Detail/{contextPath}\",view : \"Detail\",name : \"Detail\"}]}]}},init : function() {sap.ui.core.UIComponent.prototype.init.apply(this, arguments);" +
						"this._oRouteMatchedHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter());this.getRouter().initialize();var oServiceConfig = this.getMetadata().getConfig()[\"serviceConfig\"];var sServiceUrl = oServiceConfig.serviceUrl;" +
						"var rootPath = jQuery.sap.getModulePath(\"Starter2\");var sProxyOn = jQuery.sap.getUriParameters().get(\"proxyOn\");var bUseProxy = (\"true\" === sProxyOn);if (bUseProxy) {" +
						"sServiceUrl = rootPath + \"/proxy\" + sServiceUrl;}var responderOn = jQuery.sap.getUriParameters().get(\"responderOn\");var bUseMockData = (\"true\" === responderOn);if (bUseMockData) {" +
						"jQuery.sap.require(\"sap.ui.app.MockServer\");var oMockServer = new sap.ui.app.MockServer({rootUri: sServiceUrl});oMockServer.simulate(rootPath + \"/model/metadata.xml\", rootPath + \"/model/\");" +
						"oMockServer.start();var msg = \"Running in demo mode with mock data.\";jQuery.sap.require(\"sap.m.MessageToast\");sap.m.MessageToast.show(msg, {duration: 4000});}var i18nModel = new sap.ui.model.resource.ResourceModel({" +
						"bundleUrl : rootPath + \"/i18n/messageBundle.properties\"});this.setModel(i18nModel, \"i18n\");var m = new sap.ui.model.odata.ODataModel(sServiceUrl, true);this.setModel(m);var deviceModel = new sap.ui.model.json.JSONModel({" +
						"isTouch : sap.ui.Device.support.touch,isNoTouch : !sap.ui.Device.support.touch,isPhone : jQuery.device.is.phone,isNoPhone : !jQuery.device.is.phone,listMode : (jQuery.device.is.phone) ? \"None\" : \"SingleSelectMaster\"," +
						"listItemType : (jQuery.device.is.phone) ? \"Active\" : \"Inactive\"});deviceModel.setDefaultBindingMode(\"OneWay\");this.setModel(deviceModel, \"device\");},createContent : function() {var oViewData = {component : this};" +
						"return sap.ui.view({viewName : \"Starter2.view.App\",type : sap.ui.core.mvc.ViewType.XML,viewData : oViewData});}});");
				};
				document.getEntity = function() {
					var getType = function() {
						return "file";
					};
					var getName = function() {
						return "Component.js";
					};
					return {
						getType: getType,
						getName: getName
					};
				};
				return Q(document);
			};

			var controllerContentString = " /** Copyright (C) 2009-2013 SAP SE or an SAP affiliate company. All rights reserved*/(function () {'use strict';" +
				"jQuery.sap.require(\"sap.ca.ui.model.type.Date\");jQuery.sap.require(\"sap.ca.scfld.md.controller.BaseDetailController\");" +
				"jQuery.sap.require(\"cus.sd.salesorder.monitor.utils.Formatter\");jQuery.sap.require(\"sap.ca.ui.quickoverview.EmployeeLaunch\");" +
				"sap.ca.scfld.md.controller.BaseDetailController.extend(\"cus.sd.salesorder.monitor.view.S3\", {onInit: function () {" +
				"sap.ca.scfld.md.controller.BaseDetailController.prototype.onInit.call(this);var v = this.getView();this.oRouter.attachRouteMatched(function (e) {" +
				"if (e.getParameter(\"name\") === \"detail\") {this.getView().bindElement(\"/\" + e.getParameter(\"arguments\").contextPath, {expand: \"OrderItems\"" +
				"});var m = this.oApplicationFacade.getApplicationModel(\"contacts\");this.getView().setModel(m, \"contacts\");}}, this);}, _toDeliverySchedules: function (e) {" +
				"var s = e.getParameters().selectedItem,a = \"T\";if (s.getId() === this.byId(\"OpenSchedules\").getId()) {a = \"A\";} else if (s.getId() === this.byId(\"InProcessSchedules\").getId()) {" +
				"a = \"B\";} else if (s.getId() === this.byId(\"ShippedSchedules\").getId()) {a = \"C\";}this.oRouter.navTo(\"filterDetail\", {statusCode: a," +
				"contextPath: e.getSource().getBindingContext().sPath.substr(1)});},navToSubview: function () {this.oRouter.navTo(\"subDetail\", {" +
				"contextPath: this.getView().getBindingContext().sPath.substr(1)});},navToEmpty: function () {this.oRouter.navTo(\"noData\");},openBusinessCard: function (e) {" +
				"var c = e.getSource();var m = c.getBindingContext(\"contacts\");var E = {title: m.getProperty(\"Title\"),name: m.getProperty(\"Name\")," +
				"imgurl: this.placeholderImg,department: m.getProperty(\"Department\"),contactmobile: m.getProperty(\"MobilePhone\")," +
				"contactphone: m.getProperty(\"phoneNo\"),contactemail: m.getProperty(\"email\"),companyname: m.getProperty(\"CustomerID\"),companyaddress: m.getProperty(\"AddressString\")" +
				"};var o = new sap.ca.ui.quickoverview.EmployeeLaunch(E);o.openBy(c);},_onDetailListItemPressed: function (e) {this.oRouter.navTo(\"itemDetail\", {" +
				"contextPath: e.getSource().getBindingContext().sPath.substr(1)});},getHeaderFooterOptions: function () {return {sI18NDetailTitle: \"SALES_ORDER\"," +
				"oAddBookmarkSettings: {icon: \"sap-icon://Fiori2/F0020\",title: this.getView().getModel(\"i18n\").getProperty('SALES_ORDER_DETAIL')}};}});}());";

			var originalResourceInfo = {
				name: "S3",
				controllerJs: controllerContentString,
				id: "cus.sd.salesorder.monitor.view.S3",
				path: "/sdsomon/view/S3.controller.js",
				resourceLocationPath: "/view/",
				type: "controller"
			};
			var sResourceLocationPath = "webapp/";

			var extensionCommon = {};
			extensionCommon.customizationId = "sap.ui.controllerExtensions";
			extensionCommon.resourceTypeName = "controllerName";
			var resourceId = "cus.sd.salesorder.monitor.view.S3";

			var mAllExtensions = {};
			mAllExtensions[extensionCommon.customizationId] = {};
			mAllExtensions[extensionCommon.customizationId][resourceId] = {};
			mAllExtensions[extensionCommon.customizationId][resourceId][extensionCommon.resourceTypeName] = "ext_name";

			// validation 1
			// parameters: extensionProjectPath, extensionNamespace, originalResourceInfo, resourceType, mAllExtensions, sNamespace
			return extensionProject.getExtendedResourceInfo("/extensionProjectPath", sResourceLocationPath, originalResourceInfo, "controller", mAllExtensions, "dummyNamespace").then(function(result1) {
				expect(result1.id).to.equal("ext_name");
				expect(result1.type).to.equal("controller");

				// validation 2
				extensionProject.context.service.filesystem.documentProvider.getDocument = function() {
					var document = {};
					document.getFolderContent = function() {
						var files = [];
						files.push({
							getEntity : function() {
								var getType = function() {
									return "file";
								};
								var getName = function() {
									return "Component.js";
								};
								return {
									getType: getType,
									getName: getName
								};
							},
							getContent : function() {
								return Q("customizing: {\"sap.ui.controllerExtensions\": {\"cus.sd.salesorder.monitor.view.S3\": {controllerName: " +
									"\"cus.sd.salesorder.monitor.sdsomonExtension.MainCustom\",type: \"XML\"}}}");
							}
						});

						return Q(files);
					};
					document.getContent = function() {
						return Q("customizing: {\"sap.ui.controllerExtensions\": {\"cus.sd.salesorder.monitor.view.S3\": {controllerName: " +
							"\"cus.sd.salesorder.monitor.sdsomonExtension.MainCustom\",type: \"XML\"}}}");
					};
					document.getEntity = function() {
						var getType = function() {
							return "file";
						};
						var getName = function() {
							return "Component.js";
						};
						return {
							getType: getType,
							getName: getName
						};
					};
					return Q(document);
				};

				controllerContentString = " /** Copyright (C) 2009-2013 SAP SE or an SAP affiliate company. All rights reserved*/(function () {'use strict';" +
					"jQuery.sap.require(\"sap.ca.ui.model.type.Date\");jQuery.sap.require(\"sap.ca.scfld.md.controller.BaseDetailController\");" +
					"jQuery.sap.require(\"cus.sd.salesorder.monitor.utils.Formatter\");jQuery.sap.require(\"sap.ca.ui.quickoverview.EmployeeLaunch\");" +
					"sap.ca.scfld.md.controller.BaseDetailController.extend(\"cus.sd.salesorder.monitor.view.S3\", {onInit: function () {" +
					"sap.ca.scfld.md.controller.BaseDetailController.prototype.onInit.call(this);var v = this.getView();this.oRouter.attachRouteMatched(function (e) {" +
					"if (e.getParameter(\"name\") === \"detail\") {this.getView().bindElement(\"/\" + e.getParameter(\"arguments\").contextPath, {expand: \"OrderItems\"" +
					"});var m = this.oApplicationFacade.getApplicationModel(\"contacts\");this.getView().setModel(m, \"contacts\");}}, this);}, _toDeliverySchedules: function (e) {" +
					"var s = e.getParameters().selectedItem,a = \"T\";if (s.getId() === this.byId(\"OpenSchedules\").getId()) {a = \"A\";} else if (s.getId() === this.byId(\"InProcessSchedules\").getId()) {" +
					"a = \"B\";} else if (s.getId() === this.byId(\"ShippedSchedules\").getId()) {a = \"C\";}this.oRouter.navTo(\"filterDetail\", {statusCode: a," +
					"contextPath: e.getSource().getBindingContext().sPath.substr(1)});},navToSubview: function () {this.oRouter.navTo(\"subDetail\", {" +
					"contextPath: this.getView().getBindingContext().sPath.substr(1)});},navToEmpty: function () {this.oRouter.navTo(\"noData\");},openBusinessCard: function (e) {" +
					"var c = e.getSource();var m = c.getBindingContext(\"contacts\");var E = {title: m.getProperty(\"Title\"),name: m.getProperty(\"Name\")," +
					"imgurl: this.placeholderImg,department: m.getProperty(\"Department\"),contactmobile: m.getProperty(\"MobilePhone\")," +
					"contactphone: m.getProperty(\"phoneNo\"),contactemail: m.getProperty(\"email\"),companyname: m.getProperty(\"CustomerID\"),companyaddress: m.getProperty(\"AddressString\")" +
					"};var o = new sap.ca.ui.quickoverview.EmployeeLaunch(E);o.openBy(c);},_onDetailListItemPressed: function (e) {this.oRouter.navTo(\"itemDetail\", {" +
					"contextPath: e.getSource().getBindingContext().sPath.substr(1)});},getHeaderFooterOptions: function () {return {sI18NDetailTitle: \"SALES_ORDER\"," +
					"oAddBookmarkSettings: {icon: \"sap-icon://Fiori2/F0020\",title: this.getView().getModel(\"i18n\").getProperty('SALES_ORDER_DETAIL')}};}});}());";

				originalResourceInfo = {
					name: "S3",
					controllerJs: controllerContentString,
					id: "cus.sd.salesorder.monitor.view.S3",
					path: "/sdsomon/view/S3.controller.js",
					resourceLocationPath: "/view/",
					type: "controller"
				};

				sResourceLocationPath = "";

				// validation 2
				// parameters: extensionProjectPath, extensionNamespace, originalResourceInfo, resourceType, mAllExtensions, sNamespace
				return extensionProject.getExtendedResourceInfo("/extensionProjectPath", sResourceLocationPath, originalResourceInfo, "controller", mAllExtensions, "dummyNamespace").then(function(result2) {
					expect(result2.name).to.equal("Component.js");
					expect(result2.isExtended).to.equal(true);
				});
			});
		});

		it("Tests _getExtendedResourceInfo inner method", function() {
			var sResourceFileContent = "var x = 3;";
			var resourceType = "controller";
			var resourceName = "MyResourceName";
			var resourceSuffix = ".controller.js";
			var replacedResourceId = "MyResourceNameCustom";
			var originalResourceId = "Myid";
			var extendedResourceInfo = extensionProject._getExtendedResourceInfo(sResourceFileContent, resourceType, resourceName, resourceSuffix, replacedResourceId, originalResourceId);

			expect(extendedResourceInfo.name).to.equal(resourceName);
			expect(extendedResourceInfo.id).to.equal(replacedResourceId);
			expect(extendedResourceInfo.resourceContent).to.equal(sResourceFileContent);
			expect(extendedResourceInfo.originalId).to.equal(originalResourceId);
			expect(extendedResourceInfo.originalName).to.equal(originalResourceId);
			expect(extendedResourceInfo.isExtended).to.equal(true);
			expect(extendedResourceInfo.type).to.equal(resourceType);
		});

		it("Tests _getExtendedResourceMetadata inner method", function() {
			// Successful scenario
			var originalResourceInfo = {id: "ui.s2p.mm.purchorder.approve.view.S2"};
			var resourceType = "controller";
			var extensionProjectPath = "MM_PO_APVExtension1";
			var sResourceLocationPath = "";

			var extensionCommon = {};
			extensionCommon.customizationId = "sap.ui.controllerExtensions";
			extensionCommon.resourceTypeName = "controllerName";
			var resourceId = "ui.s2p.mm.purchorder.approve.view.S2";

			var mAllExtensions = {};
			mAllExtensions[extensionCommon.customizationId] = {};
			mAllExtensions[extensionCommon.customizationId][resourceId] = {};
			mAllExtensions[extensionCommon.customizationId][resourceId][extensionCommon.resourceTypeName] = "ui.s2p.mm.purchorder.approve.MM_PO_APVExtension1.view.S2Custom";

			var sNamespace = "ui.s2p.mm.purchorder.approve.MM_PO_APVExtension1";
			var extendedResourceMetadata = extensionProject._getExtendedResourceMetadata(originalResourceInfo, resourceType, extensionProjectPath, sResourceLocationPath, mAllExtensions, sNamespace);

			expect(extendedResourceMetadata.originalResourceId).to.equal("ui.s2p.mm.purchorder.approve.view.S2");
			expect(extendedResourceMetadata.replacedResourceId).to.equal("ui.s2p.mm.purchorder.approve.MM_PO_APVExtension1.view.S2Custom");
			expect(extendedResourceMetadata.extendedResourcePath).to.equal("MM_PO_APVExtension1/view/S2Custom.controller.js");

			// Failure scenario - no customizing block in the json
			sResourceLocationPath = "webapp/";
			mAllExtensions = {};
			extendedResourceMetadata = extensionProject._getExtendedResourceMetadata(originalResourceInfo, resourceType, extensionProjectPath, sResourceLocationPath, mAllExtensions, sNamespace);

			expect(extendedResourceMetadata.originalResourceId).to.equal("ui.s2p.mm.purchorder.approve.view.S2");
			expect(extendedResourceMetadata.replacedResourceId).to.equal(undefined);
			expect(extendedResourceMetadata.extendedResourcePath).to.equal(undefined);
		});
	});
});
