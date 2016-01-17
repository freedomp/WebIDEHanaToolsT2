define([], function() {

	var FioriLaunchpad = function() {

		var BASE_FLP_URI = sap.watt.getEnv("context_root") + "sap/flp/";
		var FLP_DESIGNER_URI = "/fiori/flp/designer/v1";
		var that = this;
		var COMPONENT_FILE_DESCRIPTOR = "Component.js";
		var componentJsLocation;

		this.isComponentJsExist = function(oProjectDocument) {
			return oProjectDocument.getCurrentMetadata(true).then(function(aRawData) {
				for (var i = 0; i < aRawData.length; i++) {
					if (aRawData[i].name === "Component.js") {
						return true;
					}
				}
				return false;
			});
		};

		var findComponentJsDocument = function(oDocument) {
			return oDocument.getCurrentMetadata(true).then(function(aRawData) {
				for (var i = 0; i < aRawData.length; i++) {
					var oRawData = aRawData[i];
					if (oRawData.name === COMPONENT_FILE_DESCRIPTOR) {
						return that.context.service.filesystem.documentProvider.getDocument(oRawData.path);
					}
				}
			});
		};

		this.getComponentJsDocument = function(oProjectDocument) {
			return that.context.service.builder.isBuildSupported(oProjectDocument).then(function(bIsBuildSupported) {
				if (bIsBuildSupported) {
					return that.context.service.builder.getTargetFolder(oProjectDocument).then(function(oBuildTargetFolder) {
						if (oBuildTargetFolder) { // if the target folder was found, search for the Component.js in there
							return findComponentJsDocument(oBuildTargetFolder).then(function(oComponentJsFileInBuildTargetFolder) {
								if (oComponentJsFileInBuildTargetFolder) {
									return oComponentJsFileInBuildTargetFolder;
								} else {
									return findComponentJsDocument(oProjectDocument).then(function(oComponentJsFile) {
										return oComponentJsFile;
									});
								}
							});
						}
						// the target folder wasn't found, search for the Component.js in the project
						return findComponentJsDocument(oProjectDocument).then(function(oComponentJsDocument) {
							return oComponentJsDocument;
						});
					});
				} 
				// the project isn't buildable, search for the Component.js in the project
				return findComponentJsDocument(oProjectDocument).then(function(oComponentJsDocument) {
					return oComponentJsDocument;
				});
			});
		};

		var fillComponentJsVar = function(oProjectDocument) {
			return that.getComponentJsDocument(oProjectDocument).then(function(componentJsDoc) {
				componentJsLocation = componentJsDoc.getEntity().getFullPath();
			});
		};

		var getComponentName = function(oProjectDocument) {
			return that.context.service.ui5projecthandler.getAppNamespace(oProjectDocument);
		};

		var getHCPParentAppName = function(oProjectDocument) {
			var sProjectFullPath = oProjectDocument.getEntity().getFullPath();

			return that.context.service.extensionproject.getExtensibilityModel(sProjectFullPath).then(function(projectjson) {
				var HCPParentAppName = "";
				if (projectjson.extensibility && projectjson.extensibility.system) { //this is an extension project
					HCPParentAppName = projectjson.extensibility.system.application !== undefined ? projectjson.extensibility.system.application : "";
				}
				return HCPParentAppName;
			});
		};

		// this method receives all subscriptions to FLP that exist in the account, and checks if the given
		// application is registered to any one of them by executing a call to FLP.
		// it returns an array of app details. if oAppDetails.value is empty the application isn't registered at all.
		this.getHtml5App = function(subscriptions, deployedAppName, username, password) {
			var aAppDetails = [];
			var aPromises = [];

			//  execute the request to FLP that checks to which subscriptions the application is registered to
			// and push the promise results to array 
			for (var i = 0; i < subscriptions.length; i++) {
				var sUrl = BASE_FLP_URI + subscriptions[i].name + "/fiori/v1/designer/v1/apps/getHtml5/" + deployedAppName;
				aPromises.push(this.context.service.ajaxrequest.serviceCall("registercheck", sUrl, "GET", null, username, password, true, true));
			}
			// get the results and check their value.
			// allSettled is used here so that one failed request won't reject all the rest of the promises.
			// instead we wish to wait until all promises are either fulfilled or rejected.
			return Q.allSettled(aPromises).then(function(results) {

				//go over the results and insert to oAppDetails the subscription and the app details
				for (var j = 0; j < results.length; j++) {
					if (results[j].state === "fulfilled") {
						var registeredAppDetails = results[j].value;
						if (registeredAppDetails.length > 0) {
							var oAppDetails = {};
							oAppDetails.subscription = subscriptions[j];
							oAppDetails.value = registeredAppDetails;
							aAppDetails.push(oAppDetails);
						}
					}
				}
				return aAppDetails;
			});
		};

		this.getSites = function(providerName) {
			var sUrl = BASE_FLP_URI + providerName + "/fiori/flp/runtime/v1/sites"; 
			return this.context.service.ajaxrequest.serviceCall("getSites", sUrl, "GET", null, null, null, false, true);
		};
		
		this.getGroups = function(providerName,siteID) {
			var sUrl = BASE_FLP_URI + providerName + FLP_DESIGNER_URI + "/groups/site/" + siteID;
			return this.context.service.ajaxrequest.serviceCall("getGroups", sUrl, "GET", null, null, null, false, true);
		};

		this.getCategories = function(providerName) {
			var sUrl = BASE_FLP_URI + providerName + FLP_DESIGNER_URI + "/categories";
			return this.context.service.ajaxrequest.serviceCall("getCategories", sUrl, "GET", null, null, null, false, true);
		};

		this.getContentPackages = function(providerName,siteID) {
			var sUrl = BASE_FLP_URI + providerName + FLP_DESIGNER_URI + "/content_packages?siteId=" + siteID;
			return this.context.service.ajaxrequest.serviceCall("getContentPackage", sUrl, "GET", null, null, null, false, true);
		};

		var pushAll = function(arr, arr2) {
			arr.push.apply(arr, arr2);
		};

		this.getFioriLaunchpadModel = function(projectPath) {
			var oDeferred = Q.defer();
			var filePath = projectPath + "/flp-config.json";
			this.context.service.filesystem.documentProvider.getDocument(filePath).then(function(projectJsonDocument) {
				if (projectJsonDocument) {
					projectJsonDocument.getContent().then(function(fileContent) {
						var flpConfigJson = jQuery.parseJSON(fileContent);
						oDeferred.resolve(flpConfigJson);
					}).fail(function(errormsg) {
						errormsg = that.context.i18n.getText("i18n", "FioriLaunchpad_flpConfigJsonNotFound", [projectPath]);
						oDeferred.reject(errormsg);
					});

				} else {
					var error = {};
					error = that.context.i18n.getText("i18n", "FioriLaunchpad_flpConfigJsonNotFound", [projectPath]);

					oDeferred.reject(error);
				}
			}).fail(function(error) {
				error = that.context.i18n.getText("i18n", "FioriLaunchpad_wasNotFound", [projectPath]);
				oDeferred.reject(error);
			});

			return oDeferred.promise;
		};

		this.openWizard = function(projectDocument, entryPoint, oUserAuth) {
			return Q.sap.require("sap.watt.saptoolsets.fiori.hcp.fiorilaunchpad/ui/wizard/FLPRegistrationWizard").then(function(FLPWizard) {
				return FLPWizard.openWizardUI(that.context, projectDocument, entryPoint, oUserAuth);
			});
		};

		var getComponentjsParentFolderPath = function(oProjectDocument) {
			var relativeComponentJsLocation = componentJsLocation.replace("/" + COMPONENT_FILE_DESCRIPTOR, "");
			relativeComponentJsLocation = relativeComponentJsLocation.replace("/" + oProjectDocument.getEntity().getName(), "");

			if (relativeComponentJsLocation.length === 0) {
				relativeComponentJsLocation = "/";
			}

			return relativeComponentJsLocation;
		};

		this.getAllFioriProviderAccounts = function(aSubscriptions) {

			var allProviderAccounts = [];
			var aAdminPromises = [];

			for (var i = 0; i < aSubscriptions.length; i++) {
				var sUrl = BASE_FLP_URI + aSubscriptions[i].name + "/fiori/v1/neoRoles/isAdmin";
				aAdminPromises.push(this.context.service.ajaxrequest.serviceCall("authorization check", sUrl, "GET", null, null, null, true, true));
			}
			return Q.allSettled(aAdminPromises).then(function(results) {
				var result;

				for (var j = 0; j < results.length; j++) {
					result = results[j];
					if (result.state === "fulfilled") {

						aSubscriptions[j].isAdmin = result.value;
						allProviderAccounts.push(aSubscriptions[j]);
					}
				}
				return allProviderAccounts;
			});
		};

		this.getAllFlpSubscriptions = function(account, email, password) {
			return that.context.service.hcpconnectivity.getSubscriptions(account, email, password, true).then(function(subscriptions) {
				return that.getAllFioriProviderAccounts(subscriptions);
			});
		};

		this.register = function(model, oProjectDocument, providerName) {
			//in phase one this service will load the initial config, 
			//and the wizard will pass its model here as model parameter.
			//this service will make the transformation.
			//in phase 2 the wizard will load the initial config
			//the wizard will make the transformation and pass the config as the model parameter here
			return fillComponentJsVar(oProjectDocument).then(function() {
				return that.context.service.flpconfig.loadConfig(oProjectDocument).then(function(fioriLaunchpadModel) {
					return getComponentName(oProjectDocument).then(function(componentName) {
						return getHCPParentAppName(oProjectDocument).then(function(hcpParentAppName) {
							//update the Application details in fioriLaunchpadModel
							fioriLaunchpadModel.application.title = model.name;
							fioriLaunchpadModel.application.description = model.description;

							//Update intent fields
							fioriLaunchpadModel.application.intentSemanticObject = model.intent[0].semanticObject;
							fioriLaunchpadModel.application.intentAction = model.intent[0].action;

							var relativeComponentJsLocation = getComponentjsParentFolderPath(oProjectDocument);
							fioriLaunchpadModel.application.componentUrl = relativeComponentJsLocation;

							fioriLaunchpadModel.application.navigationComponentName = componentName;
							// the name of the deployed app in HCP from project.json
							fioriLaunchpadModel.application.html5ApplicationName = model.hcpAppName;
							fioriLaunchpadModel.application.HCPParentApplicationName = hcpParentAppName;

							//update the parentNamespace details in Path
							if (model.selectedGroups.length === 1 && !model.selectedGroups[0]) {
								fioriLaunchpadModel.assignment.groups = [];
							} else {
								pushAll(fioriLaunchpadModel.assignment.groups, model.selectedGroups);
							}

							pushAll(fioriLaunchpadModel.assignment.categories, model.selectedCategories);
							pushAll(fioriLaunchpadModel.assignment.contentPackages, model.selectedcontentPackages);

							//update the Tile properties in fioriLaunchpadModel
							fioriLaunchpadModel.tile.type = model.selectedTiletype;
							fioriLaunchpadModel.tile.title = model.title;
							fioriLaunchpadModel.tile.subtitle = model.subtitle;
							fioriLaunchpadModel.tile.displayIconUrl = model.icon;
							fioriLaunchpadModel.tile.displayInfoText = "";
							var searchKeywordsArr = [model.title, model.subtitle];
							fioriLaunchpadModel.tile.searchKeywords = searchKeywordsArr.join();
							if (model.selectedTiletype === "DynamicTile") {
								fioriLaunchpadModel.tile.serviceURL = "/sap/fiori/" + model.hcpAppName + model.relativeServiceUrl + model.collection +
									"/$count";
								fioriLaunchpadModel.tile.displayNumberUnit = model.numberunit;
								fioriLaunchpadModel.tile.refreshInterval = model.refreshrate;
							}

							//persist the fioriLaunchpadModel
							// return that.context.service.flpconfig.saveConfig(fioriLaunchpadModel, oProjectDocument).then(function() {
							//call FioriLaunchpad
							return that.context.service.ajaxrequest.resetCsrfToken().then(function() {
								var sUrl = BASE_FLP_URI + providerName + FLP_DESIGNER_URI +
									"/groups/site/DEFAULT"; //get csrf tocken
								return that.context.service.ajaxrequest.serviceCall("getCSRF", sUrl, "GET", null, null, null, false, true).then(
									function() {
										sUrl = BASE_FLP_URI + providerName + FLP_DESIGNER_URI + "/descriptor/site/" + model.selectedSite;
										return that.context.service.ajaxrequest.serviceCall("Register", sUrl, "POST", fioriLaunchpadModel, null, null, false,
											false).then(function(res) {
											fioriLaunchpadModel.application.appUrl = res;
											return that.context.service.flpconfig.saveConfig(fioriLaunchpadModel, oProjectDocument).then(function() {
												return {
													status: true,
													appUrl: res
												};
											});
										}).catch(function(e) {
											return {
												status: false,
												message: e.errorResponse.error.msg
											};
										});
									});
							});
						});
					});
				});
			}).catch(function(error) {
				return {
					status: false,
					message: error
				};
			});
		};
	};

	return FioriLaunchpad;
});