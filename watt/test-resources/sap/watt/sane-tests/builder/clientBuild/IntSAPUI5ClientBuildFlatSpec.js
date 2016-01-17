define(["STF", "builder/utils/BasicUtil", "util/orionUtils"], function(STF, BasicUtil, OrionUtils) {

	"use strict";
	var suiteName = "FlatClientBuild",
		getService = STF.getServicePartial(suiteName);

	var oService = {};
	var oProject = null;

	describe("SAPUI5 Client Builder Test, simple flat application", function() {

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

				var oOptions = {
					templateId: "sap.ui.ui5-template-plugin.2masterdetail",
					modelId: "FioriMasterDetail",
					projectTypeId: "com.watt.common.builder.sapui5clientbuild",
					model: {
						"projectName": "",
						"domain": {
							id: "TE"
						},
						"fioriMasterDetail": {
							"parameters": {
								"ProjectNamespace": "sap.crm.flat"
							}
						}
					}
				};
				return _initTestProject.call(that, "1a", oOptions).then(function(oNewProject) {
					oProject = oNewProject;
				});
			});
		});
		after(function() {
			return this.oBasicUtil.deleteTestProject()
				.fin(function() {
					return STF.shutdownWebIde(suiteName);
				});
		});

		//**************Tests***********************************************************// 
		it("Build Flat Fiori Project", function() {
			var that = this;

			//Check Project created
			assert.notEqual(oProject, null, "Project created");

			return Q.spread([that.oBasicUtil.isBuildSupported(oProject),
				that.oBasicUtil.isBuildRequired(oProject)
			], function(bIsBuildSupported, bIsBuildRequired) {

				//Check build supported
				assert.equal(bIsBuildSupported, true, "Build is supported");

				//Check build required
				assert.equal(bIsBuildRequired, true, "Build is required");

				var oComponentDocument;

				//Trigger build
				return that.oBasicUtil.build(oProject).then(function() {

					var aAssertPromises = [];

					//Check target folder was created;
					aAssertPromises.push(that.oBasicUtil.getTargetFolder(oProject).then(function(oTargetFolder) {
						assert.notEqual(oTargetFolder, null, "target folder was created");
					}));

					//Check build is not required now;
					aAssertPromises.push(that.oBasicUtil.isBuildRequired(oProject).then(function(bIsBuildRequired) {
						assert.equal(bIsBuildRequired, false, "build is not required now");
					}));

					//Check Component.js;
					aAssertPromises.push(that.oBasicUtil.getFileFolder("Component.js").then(function(oFileDocument) {
						oComponentDocument = oFileDocument;
						assert.notEqual(oFileDocument, null, "Component.js created");
					}));

					//Check Component-preload.js;
					aAssertPromises.push(that.oBasicUtil.getFileFolder("Component-preload.js").then(function(oFileDocument) {
						assert.notEqual(oFileDocument, null, "Component-preload.js created");
					}));

					//Check resources.json;
					aAssertPromises.push(that.oBasicUtil.getFileFolder("resources.json").then(function(oFileDocument) {
						assert.notEqual(oFileDocument, null, "resources.json created");
					}));

					return Q.all(aAssertPromises).then(function() {
						//Modify Component.js
						return oComponentDocument.getContent().then(function(sContent) {
							sContent = sContent + "//ADDEDCONTENT";
							return oComponentDocument.setContent(sContent).then(function() {
								return that.oBasicUtil.build(oProject).then(function() {
									return that.oBasicUtil.getFileFolder("Component-preload.js").then(function(oFileDocument) {
										return oFileDocument.getContent().then(function(sContent) {
											assert.notEqual(sContent.indexOf("//ADDEDCONTENT"), -1, "Component-preload.js modified");
										});
									});
								});
							});
						});
					});
				});
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