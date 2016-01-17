define(["STF", "builder/utils/BasicUtil", "util/orionUtils", "sinon"],
	function(STF, BasicUtil, OrionUtils, sinon) {

		"use strict";
		var suiteName = "DeepClientBuild",
			getService = STF.getServicePartial(suiteName);

		var oService = {};
		var stub = null;
		var oProject = null;
		var sap;

		describe("SAPUI5 Client Builder Test, deep structure application", function() {

			before(function() {
				var that = this;
				return OrionUtils.startWebIdeWithOrion(suiteName, {
					config: "builder/clientBuild/config.json"
				}).then(function(webIdeWindowObj) {
					oService.document = getService("document");
					oService.filesystemDocumentProvider = getService("filesystem.documentProvider");
					oService.repositorybrowser = getService("repositorybrowser");
					oService.template = getService("template");
					oService.generation = getService("generation");
					oService.projectType = getService("projectType");
					oService.settingProject = getService("setting.project");
					oService.builder = getService("builder");

					sap = webIdeWindowObj.sap;
					sap.watt = sap.watt || {};
					sap.watt.getEnv = sap.watt.getEnv || function() {
						return true;
					};

					var oOptions = {
						templateId: "ui5template.basicSAPUI5ApplicationProject",
						modelId: "basicSAPUI5ApplicationProject",
						projectTypeId: "com.watt.common.builder.sapui5clientbuild",
						buildSettings: {
							sourceFolder: "webapp",
							excludedFolders: ["test"],
							excludedFiles: ["test.html"]
						},
						model: {
							"projectName": "",
							"domain": {
								id: "TE"
							},
							"basicSAPUI5ApplicationProject": {
								"parameters": {
									"namespace": {
										"value": "sap.crm.build"
									},
									"Object_Number": {
										"value": null
									},
									"Object_UnitOfMeasure": {
										"value": null
									},
									"title": "Title",
									"description": "some description",
									"ApplicationTitle": {
										"value": "App Title"
									},
									"append": function(sNav, sAppValue) {
										return sNav + sAppValue;
									},
									"ViewTypesCollection": {
										"value": {
											"value": "xml"
										}
									},
									"name": {
										"value": "basicSAPUI5ApplicationProject"
									}
								}
							},
							"connectionData": {
								"metadataContent": "metadata"
							},
							selectedTemplate: {
								getId: function() {
									return "ui5template.basicSAPUI5ApplicationProject";
								},
								getVersion: function() {
									return "1.32.0";
								},
								getRequiredModulePaths: function() {
									return null;
								},
								getRequiredModules: function() {
									return null;
								}
							}
						}
					};
					//Setup
					var fOldGetEnv = sap.watt.getEnv;
					stub = sinon.stub(sap.watt, "getEnv", function(sInput) {
						if (sInput === "internal") {
							return false;
						} else {
							return fOldGetEnv(sInput);
						}
					});
					return _initTestProject.call(that, "1a", oOptions).then(function(oNewProject) {
						oProject = oNewProject;
					});
				});
			});
			after(function() {
				return this.oBasicUtil.deleteTestProject()
					//return Q()
					.fin(function() {
						stub.restore();
						return STF.shutdownWebIde(suiteName);
					});
			});

			//**************Tests***********************************************************// 
			it("Build SAPUI5WorklistApplication", function() {
				var that = this;

				//Check Project created
				assert.notEqual(oProject, null, "Project created")

				return Q.spread([that.oBasicUtil.isBuildSupported(oProject),
					that.oBasicUtil.isBuildRequired(oProject)
				], function(bIsBuildSupported, bIsBuildRequired) {

					//Check build supported
					assert.equal(bIsBuildSupported, true, "Build is supported");

					//Check build required
					assert.equal(bIsBuildRequired, true, "Build is required");

					//Trigger build
					return that.oBasicUtil.build(oProject).then(function() {

						var aAssertPromises = [];

						//Check target folder was created;
						aAssertPromises.push(that.oBasicUtil.getTargetFolder(oProject).then(function(oTargetFolder) {
							return assert.notEqual(oTargetFolder, null, "target folder was created");
						}));

						//Check build is not required now;
						aAssertPromises.push(that.oBasicUtil.isBuildRequired(oProject).then(function(bIsBuildRequired) {
							return assert.equal(bIsBuildRequired, false, "build is not required now");
						}));

						//Check Component.js;
						aAssertPromises.push(that.oBasicUtil.getFileFolder("dist/Component.js").then(function(oFileDocument) {
							return assert.notEqual(oFileDocument, null, "Component.js created");
						}));

						//Check Component-preload.js;
						aAssertPromises.push(that.oBasicUtil.getFileFolder("dist/Component-preload.js").then(function(oFileDocument) {
							return assert.notEqual(oFileDocument, null, "Component-preload.js created");
						}));

						//Check resources.json;
						aAssertPromises.push(that.oBasicUtil.getFileFolder("dist/resources.json").then(function(oFileDocument) {
							return assert.notEqual(oFileDocument, null, "resources.json created");
						}));

						//Check excluded folder
						aAssertPromises.push(that.oBasicUtil.getFileFolder("dist/test").then(function(oFileDocument) {
							return assert.equal(oFileDocument, null, "test folder was excluded");
						}));

						//Check excluded file
						aAssertPromises.push(that.oBasicUtil.getFileFolder("dist/test.htm").then(function(oFileDocument) {
							return assert.equal(oFileDocument, null, "test.html file was excluded");
						}));

						return Q.all(aAssertPromises);
					});
				});
			});

			//************End of tests******************************************************//
			function _initTestProject(sTestId, oOptions) {
				// this context refers to the "environment" of the qUnit test
				// which is the object that also holds the setup() and teardown() functions 
				var dTestModuleTimeStamp = Number(new Date());
				this.oBasicUtil = new BasicUtil(sTestId, dTestModuleTimeStamp, oService, oOptions);
				return this.oBasicUtil.initializeTestProject();
			}
		});
	});