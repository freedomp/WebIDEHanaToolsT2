define(["STF", "util/orionUtils"], function (STF, OrionUtils) {
	"use strict";

	var suiteName = "projectTypeConfigTest";
	describe("Project Type Config Unit  test", function () {
		var getService = STF.getServicePartial(suiteName);
		var startTestPromise;
		var oProjectSettingServiceImpl;
		var oProjectSettingService;
		var oProject1;
		var oDocument1InProject1;
		var oType;
		var oProjectTypeConfigServiceImpl;
		var oProjectTypeConfigService;
		var sPath;
		var bFakeChecked;
		var bFakeConfirmed;

		var MockDocument = function (sFullPath, sFileExtension, sContent, oProjectDocument, bIsRoot) {

			this.sContent = sContent;
			this.oProjectDocument = oProjectDocument;

			var oEntity = {
				sFileExtension: sFileExtension,
				sFullPath: sFullPath,
				bIsRoot: bIsRoot,

				getFullPath: function () {
					return sFullPath;
				},

				getFileExtension: function () {
					return sFileExtension;
				},
				isRoot: function () {
					return bIsRoot;
				}
			};

			this.getEntity = function () {
				return oEntity;
			};

			this.getContent = function () {
				return Q(this.sContent);
			};
			this.oAccessPromise = Q();

			this.getProject = function () {
				var oProject = this.oProjectDocument || this;
				return Q(oProject);
			},

				this.setContent = function (sContnet) {
					return Q();
				};

			this.save = function () {
				return Q();
			};

		};

		var MockOwner = function (sInterface) {

			this.sInterface = sInterface;

			this.instanceOf = function (sInterface) {
				return this.sInterface === sInterface;
			};
		};

		before(function () {
			oProject1 = new MockDocument("proj1", "", "", undefined, false);
			oDocument1InProject1 = new MockDocument("proj1/doc1.js", "js", "", oProject1, false);
			return OrionUtils.startWebIdeWithOrion(suiteName, {
				config: "core/core/ideplatform/plugin/projectType/configConfig.json"
			}).then(function (webIdeWindowObj) {


				oProjectSettingService = getService("projectsetting");

				return oProjectSettingService.getPlugins().then(function (aServices) {

					sPath = "/" + oDocument1InProject1.getEntity().getFullPath();

					if (aServices) {
						for (var i = 0; i < aServices.length; i++) {
							if (aServices[i].id === "projectTypeConfig") {
								oType = aServices[i];
								break;
							}
						}
					}


					// fake the functions
					if (oType) {
						oType.service.context.service.projectTypeConfig.initialize = function () {
						};
						oProjectSettingService.context.service.document.getDocumentByPath = function (sProjectPath) {
							return Q(oDocument1InProject1.getProject());
						};
					}
				}).then(function () {

					oProjectTypeConfigService = oType.service.context.service.projectTypeConfig;
					return oProjectSettingService.$().then(function (oNonLazyProxy) {
						return oNonLazyProxy._getImpl({});
					}).then(function (oImpl) {
						oProjectSettingServiceImpl = oImpl;
					}).then(function () {
						oProjectTypeConfigService.$().then(function (oNonLazyProxy) {
							return oNonLazyProxy._getImpl({});
						}).then(function (oImpl) {
							oProjectTypeConfigServiceImpl = oImpl;
						});
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});


		describe("Project Type Config Save", function () {
			it("saveProjectSetting fire projectTypeConfigSaved event", function () {
				oProjectSettingServiceImpl.onProjectTypeConfigSaved = function (oEvent) {
					assert.ok(oEvent.name === "projectTypeConfigSaved", "The event of 'projectTypeConfigSaved' was captured");
				};
				// The function saveProjectSetting will fire projectTypeConfigSaved event
				return oType.service.context.service.projectTypeConfig.saveProjectSetting("projetcType", "", sPath);
			});
		});

		describe("Project Type Config remove project type check user confirmation", function () {

			before(function () {
					oProjectTypeConfigServiceImpl.getBindingContext = function () {
						return {};
					};

					oProjectTypeConfigServiceImpl.getModel = function () {
						return {};
					};

					oProjectTypeConfigServiceImpl._getBindingContextPath = function (oBindingContext) {
						return sPath;
					};

					oProjectTypeConfigServiceImpl._getModelObject = function (oModel, sPath) {
						return oType;
					};

					oProjectTypeConfigServiceImpl.getChecked = function () {
						return bFakeChecked;
					};

					oProjectTypeConfigServiceImpl._isUserConfirmConfigurationRemoval = function () {
						var oResult = {};
						oResult.bResult = bFakeConfirmed;
						return Q(oResult);
					};

					oProjectTypeConfigServiceImpl._types.push(oType);

					oProjectTypeConfigServiceImpl.testGetChangeHandler = oProjectTypeConfigServiceImpl._getChangeHandler();
				});

			it("_getChangeHandler unselect project type confirm removal", function () {
				bFakeChecked = false;
				bFakeConfirmed = true;

				return oProjectTypeConfigServiceImpl.testGetChangeHandler().then(function () {
					assert.ok(oProjectTypeConfigServiceImpl._types[0].exists === false, "project type should be unselected");
				});
			});

			it("_getChangeHandler unselect project type not confirm removal", function () {
				bFakeChecked = false;
				bFakeConfirmed = false;

				return oProjectTypeConfigServiceImpl.testGetChangeHandler().then(function () {
					assert.ok(oProjectTypeConfigServiceImpl._types[0].exists === true, "project type should be selected");
				});
			});

		});

	});
});