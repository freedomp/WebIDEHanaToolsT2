define(function() {

	var oContext = null;
	var oSystem = null;

	var beautifyXml = function(file) {
		return file.getContent().then(function(metadataContent) {
			if (typeof metadataContent !== "string") {
				metadataContent = (new XMLSerializer()).serializeToString(metadataContent);
			}
			return oContext.service.beautifierProcessor.beautify(metadataContent, "xml");
		});
	};

	var loadBineryFileContentData = function(blob, oTemplateImageFolder, sImageFileName) {
		var oDeferred = Q.defer();
		if (blob) {
			var reader = new FileReader();
			reader.onload = function(e) {
				oTemplateImageFolder.file(sImageFileName, e.target.result, {
					binary : true
				});
				oDeferred.resolve();
			};
			reader.readAsArrayBuffer(blob);
		} else {
			oDeferred.reject(this.context.i18n.getText("i18n", "image_read_error_msg", [ sImageFileName ]));
		}
		return oDeferred.promise;
	};

	/*
	 * Recursive function that adds the given model files to the given template zip, and removes irrelevant files.
	 */
	var addFilesToTemplateZip = function(filesArray, mockPreviewJson, templateZip) {
		var promises = [];
		var filesArr = [];

		var mockRequestsFilename = "mockRequests.js"; //default value of mock requests filename
		if (mockPreviewJson && mockPreviewJson.mockRequestsFilePath) {
			var index = mockPreviewJson.mockRequestsFilePath.lastIndexOf("/");
			mockRequestsFilename = mockPreviewJson.mockRequestsFilePath.substring(index+1);
		}

		// keep only the relevant files (no unwanted js files)
		for ( var x = 0; x < filesArray.length; x++) {
			if (filesArray[x].getEntity().getType() === "file") {
				var file = filesArray[x];
				var filename = file.getEntity().getName();
				// copy all model files except for js files (but keep the mock requests js file, if provided)
				if (file.getEntity().getFileExtension() !== "js" || filename === mockRequestsFilename) {
					filesArr.push(file);
					if (filename === "metadata.xml") {
						promises.push(beautifyXml(file));
					} else {
						promises.push(file.getContent());
					}
				}
			}
		}

		return Q.all(promises).spread(function() {
			var binaryFilesPromises = [];
			for ( var i = 0; i < arguments.length; i++) {
				var fileContent = arguments[i];

				// add the current file to the template zip
				var filePath = filesArr[i].getEntity().getParentPath() + "/" + filesArr[i].getEntity().getName();
				var modelFolderStr = "model";
				var indexOfModel = filePath.indexOf(modelFolderStr);
				if (indexOfModel < 0) {
					modelFolderStr = "localService";
					indexOfModel = filePath.indexOf(modelFolderStr);
				}
				var filePathInExtensionProject = "webapp/localService" + filePath.substring(indexOfModel + modelFolderStr.length);
				if (fileContent instanceof Blob) {
					binaryFilesPromises.push(loadBineryFileContentData(fileContent, templateZip, filePathInExtensionProject));
				} else {
					templateZip.file(filePathInExtensionProject, fileContent);
				}
			}
			return Q.all(binaryFilesPromises).spread(function() {
				return;
			});
		});
	};

	var copyModelFiles = function(templateZip, model) {
		var metadataXmlPath = model.metadataPath;
		if (metadataXmlPath) {
			// get the model folder files (including the metadata.xml) and mock preview settings
			return Q.all([oContext.service.parentproject.getModelFolderFiles(metadataXmlPath, model.extensibility.system, model.extensibility.type),
				oContext.service.parentproject.getMockPreview(model, model.extensibility.system)]).spread(function(modelFolderFiles, mockPreviewJson) {
				return addFilesToTemplateZip(modelFolderFiles, mockPreviewJson, templateZip).then(function() {
					return [ templateZip, model ];
				});
			});
		}

		return Q();
	};

	var getResourceRoute = function() {
		if (sap.watt.getEnv("ui5dist")) {
			return {
				"path": "/webapp/resources",
				"target": {
					"type": "destination",
					"name": "ui5dist"
				},
				"description": "SAPUI5 Resources"
			};
		} else {
			return {
				"path": "/webapp/resources",
				"target": {
					"type": "service",
					"name": "sapui5",
					"entryPath": "/resources"
				},
				"description": "SAPUI5 Resources"
			};
		}
	};

	var getTestResourceRoute =  function() {
		if (sap.watt.getEnv("ui5dist")) {
			return {
				"path": "/webapp/test-resources",
				"target": {
					"type": "destination",
					"name": "ui5dist-test-resources"
				},
				"description": "SAPUI5 Test Resources"
			};
		} else {
			return {
				"path": "/webapp/test-resources",
				"target": {
					"type": "service",
					"name": "sapui5",
					"entryPath": "/test-resources"
				},
				"description": "SAPUI5 Test Resources"
			};
		}
	};

	var addUI5ResourcesDestination = function(aDestinations) {
		var resourcesNotFound = true;
		var testResourcesNotFound = true;

		for (var i = 0; i < aDestinations.length; i++) {
			if (aDestinations[i].path === "/webapp/resources") {
				resourcesNotFound = false;
			}
			if (aDestinations[i].path === "/webapp/test-resources") {
				testResourcesNotFound = false;
			}
		}

		if (resourcesNotFound) {
			aDestinations.push(getResourceRoute());
		}

		if (testResourcesNotFound) {
			aDestinations.push(getTestResourceRoute());
		}
	};

	var updateDestinationsByReplacePathPrefix = function(aDestinations, sOriginalPathPrefix, sReplacedPathPrefix) {
		var aUpdatedDestinations = [];
		var i;
		// prepare new destinations
		for (i = 0; i < aDestinations.length; i++) {
			if (aDestinations[i].path.indexOf(sOriginalPathPrefix) === 0) {
				var sUpdatedPath = aDestinations[i].path.replace(sOriginalPathPrefix,sReplacedPathPrefix);
				// make sure a destination with the new path doesn't already exist
				var bUpdatedDestinationExists = false;
				for (var j = 0; j< aDestinations.length; j++) {
					if (aDestinations[j].path === sUpdatedPath) {
						bUpdatedDestinationExists = true;
						break;
					}
				}
				if (!bUpdatedDestinationExists) {
					var oUpdatedDestination = jQuery.extend(true, {}, aDestinations[i]); // deep copy destination
					oUpdatedDestination.path = sUpdatedPath;
					aUpdatedDestinations.push(oUpdatedDestination);
				}
			}
		}
		// push them to the original array (don't use concat from performance reasons)
		for (i = 0; i < aUpdatedDestinations.length; i++) {
			aDestinations.push(aUpdatedDestinations[i]);
		}
	};
	
	/**
	 * For destinations taken from parent application with path starts with '/resources' (ui5 resources and reuse libraries)- 
	 * create another destination with the same defintion but adjust the path to the
	 * extension project structure (path: /webapp/resources).
	 * Keep also original destination in case it is required for the deployed application
	 */
	var updateParentResourceDestinations = function(aDestinations) {
		updateDestinationsByReplacePathPrefix(aDestinations, "/resources", "/webapp/resources");
	};
	
	/**
	 * For all destinations added so far to the neo-app.json of extension project, 
	 * which refer to the source folder (path starts with /webapp):
	 * create another destination with the same defintion but adjust the path to the
	 * build target folder (path: /dist).
	 * Keep also original destination to run the source code resources of the application.
	 */
	var addBuildTargetDestinations = function(aDestinations) {
		updateDestinationsByReplacePathPrefix(aDestinations, "/webapp", "/dist");
	};

	var initPathToComponentInModel = function(oModel) {
		oModel.componentJsPath = oModel.extensibility.component;
		if (oModel.extensibility.type === "abaprep") {
			oModel.componentJsPath = unescape(oModel.componentJsPath);//change %2f to /
		}
		oModel.componentJsPath = oModel.componentJsPath.replace("/Component.js", "");
		if (oModel.componentJsPath.indexOf("/") === 0) { // remove first '/'
			oModel.componentJsPath = oModel.componentJsPath.substring(1,  oModel.componentJsPath.length);
		}

		return oModel;
	};

	var handleUrlInComponentJs = function(oModel) {
		if (oModel.extensibility.type === "Workspace") {
			oModel.extensionProject.isWorkspace = true;
			// set system for runtime destinations
			oSystem = oModel.parentPath;
			//url for the local parent application resource root
			oModel.extensibility.parentResourceRootUrl = "../" + oModel.componentJsPath;

		} else if (oModel.extensibility.type === "abaprep") {
			oModel.extensionProject.isBSP = true;
			oModel.extensibility.BSPName = oModel.parentPath;

		} else if (oModel.extensibility.type === "hcp") {
			oModel.extensionProject.isHelium = true;
			//url for the parent application resource root in hcp - based on the existing of /ext/parent mapping in the webide neo-app.json
			oModel.extensibility.parentResourceRootUrl = "/ext/parent/" + oModel.parentProjectName + "/" + oModel.componentJsPath;
		}

		return oModel;
	};

	var updateUserInfoInModel = function(oModel, oSystemInfo) {
		// update username in the model for the Component.js. TODO: should be temporary until HCP fix
		oModel.extensionProject.user = oSystemInfo.sUsername;
		var account = oSystemInfo.sAccount;
		if (account) {
			oModel.extensionProject.user = account + "$" + oSystemInfo.sUsername;
		}

		// set orion path
		var orionPath = sap.watt.getEnv("orion_server");
		oModel.extensionProject.orionPath = orionPath;

		return oModel;
	};

	var updateNeoappInModel = function(oModel, aDestinations) {

		if (!oModel.neoapp) {
			oModel.neoapp = {};
		}

		oModel.neoapp.welcomeFile = "/webapp/index.html"; //TODO: Consider using the /dist/index.html for productive usage also from HCP after deployment
		oModel.neoapp.sendWelcomeFileRedirect = true;
		oModel.neoapp.destinations = aDestinations;

		updateParentResourceDestinations(oModel.neoapp.destinations); //add parent resource routes (mainly for reused libraries) for the webapp folder path
		addUI5ResourcesDestination(oModel.neoapp.destinations); //add UI5 resources route for the webapp folder path
		addBuildTargetDestinations(oModel.neoapp.destinations); //add routes for build target resources, in addition to source resources destinations

		return oModel;
	};

	var updateModelForABAP = function(oModel) {

		var aDestinations = oModel.neoapp.destinations;
		for ( var i = 0, length = aDestinations.length; i < length; i++) {
			var oDestination = aDestinations[i];
			if (oDestination.wattUsage === "ui5_execute_abap") {
				var ui5_ui5Path = oDestination.path.trim();
				var lastIndexSlash = ui5_ui5Path.lastIndexOf("/");
				while (lastIndexSlash === ui5_ui5Path.length) {
					ui5_ui5Path = ui5_ui5Path.substring(0, ui5_ui5Path.length - 1);
					lastIndexSlash = ui5_ui5Path.lastIndexOf("/");
				}

				oModel.ui5_ui5Path = ui5_ui5Path;
				//url of the parent application resource root on the remote abap system
				var ns = "/sap/";
				//it has namespace. no need "sap"
				if(oModel.parentPath.lastIndexOf("/") > 0){
					ns = "/";
					// save for component.js.impl. indicates if the componentJsPath contains a namespace of not
					oModel.extensionProject.isBSPNamespace = true;
				}
				oModel.extensibility.parentResourceRootUrl = "/destinations/" + oModel.extensibility.system.name + oModel.ui5_ui5Path
						+ ns + oModel.componentJsPath;
			}
		}

		return oModel;
	};

	var updateI18nPathInModel = function(oModel, oGuidelinesDoc, oComponentDoc) {

		var oDocumentForI18nPathParsing = oGuidelinesDoc;
		if (oModel.extensibility.configuration && (!oModel.extensibility.manifest)) {
			// When there is only configuration file (and no manifest) - the i18n path must be taken from the component
			oDocumentForI18nPathParsing = oComponentDoc;
		}

		return oContext.service.ui5projecthandler.getI18nPath(oDocumentForI18nPathParsing).then(function(i18nPath) {
			if (!i18nPath) {
				i18nPath = ""; //if no i18n path found, put empty string in project settings
			}
			oModel.extensibility.resourceBundle = i18nPath;

			return oModel;
		});
	};

	var updateManifestDetailsInModel = function(oModel, oGuidelinesDoc) {

		var aAttributePromises = [];
		aAttributePromises.push(oContext.service.ui5projecthandler.getAttribute(oGuidelinesDoc, "sap.app"));
		aAttributePromises.push(oContext.service.ui5projecthandler.getAttribute(oGuidelinesDoc, "sap.ui"));
		aAttributePromises.push(oContext.service.ui5projecthandler.getAttribute(oGuidelinesDoc, "sap.ui5"));

		return Q.all(aAttributePromises).spread(function() {

			oModel.manifestTitle = arguments[0].title;
			oModel.manifestIcons = arguments[1].icons;
			oModel.manifestDeviceTypes = arguments[1].deviceTypes;
			oModel.manifestSupportedThemes = arguments[1].supportedThemes;
			oModel.manifestDependencies = arguments[2].dependencies;
			oModel.contentDensities = arguments[2].contentDensities;

			return oModel;
		});
	};

	var _onBeforeTemplateGenerate = function(templateZip, model) {
		oContext = this.context;
		var sManifestFile = "webapp/manifest.json.tmpl";

		if (model.extensionProject === undefined) {
			model.extensionProject = {};
		}

		oSystem = model.extensibility.system;

		// init the path to Component.js in the model
		model = initPathToComponentInModel(model);

		// update the model with properties that will be used in Component.js.tmpl
		// for the url to the parent Component.
		model = handleUrlInComponentJs(model);

		var aPromises = [];
		aPromises.push(oContext.service.system.getSystemInfo());
		aPromises.push(oContext.service.parentproject.getRuntimeDestinations(oSystem, model.extensibility.type, model.neoAppPath));
		aPromises.push(oContext.service.parentproject.getGuidelinesDocument(model.extensibility, oSystem, model.extensibility.type));
		aPromises.push(oContext.service.parentproject.getDocument(model.extensibility.component, "file", oSystem, model.extensibility.type));
		aPromises.push(copyModelFiles(templateZip, model));

		return Q.all(aPromises).spread(function() {

			var oSystemInfo = arguments[0];

			// update properties in the model for the generated Component.js
			model = updateUserInfoInModel(model, oSystemInfo);
			
			model.parentName = model.parentProjectName;
			
			var aDestinations = arguments[1];

			// update the model with i18n resource path and manifest attributes (if manifest exists)
			var oGuidelinesDocument = arguments[2];
			model.parentGuidelinesDocument = oGuidelinesDocument;

			var oComponentDocument = arguments[3];
			return oContext.service.ui5projecthandler.getAppNamespace(oComponentDocument).then(function(sAppNamespace) {
				// update the parent app namespace in the model
				model.extensibility.namespace = sAppNamespace;

				//This is an ugly hack meant to generate a run configuration specifically for "My Inbox" Fiori application
				if (sAppNamespace !== "cross.fnd.fiori.inbox") {
					templateZip.remove(".user.project.json.tmpl");
				}
				
				return updateI18nPathInModel(model, oGuidelinesDocument, oComponentDocument).then(function(oModel) {

					model = oModel;

					if (model.extensibility.manifest) { // if manifest exists, update the model accordingly
						return updateManifestDetailsInModel(model, oGuidelinesDocument).then(function(oUpdatedModel) {
							
							model = oUpdatedModel;
							
							// check if the extension project if for an application on ABAP (that has a manifest)
							if (model.extensibility.type === "abaprep") {
								
								// get the parent app's dependencies using the app index service, as neo-app routes
								return oContext.service.abaprepository.getDependenciesAsNeoappRoutes(oSystem, sAppNamespace).then(function(aDependencies) {
									if (aDependencies && aDependencies.length > 0) {
										return aDependencies;
									}
								}).fail(function(oError) {
									// log the error and continue
									oContext.service.log.info(oContext.i18n.getText("i18n", "Config_ExtensionProject"),
        								oContext.i18n.getText("i18n", "ExtensionProjectTemplate_FailedToGetDependencies", [model.extensibility.namespace, oError.responseText]), [ "user" ]).done();
        								
        							return []; // as if no dependencies
								});                       
							}
						});
					} else {
						// remove manifest file from zip
						templateZip.remove(sManifestFile);
						return undefined;
					}
				}).then(function(aDependenciesAsNeoappRoutes) {
					if (aDependenciesAsNeoappRoutes && aDependenciesAsNeoappRoutes.length > 0) {
						aDestinations = aDestinations.concat(aDependenciesAsNeoappRoutes);
					}

					// set destinations and welcome file properties in model for the generated neo-app.json
					model = updateNeoappInModel(model, aDestinations);
		
					if (model.extensibility.type === "abaprep") {
						// update the model with properties relevant if the extension project is created for an app on ABAP
						model = updateModelForABAP(model);
					}
					
					return [ templateZip, model ];
				});
			});
		});
	};

	var _onAfterGenerate = function(/*templateZip, model*/) {
	};

	var _configWizardSteps = function() {
		return [];
	};

	// Added for testing purposes
	var _setContext = function(oNewContext) {
		this.context = oNewContext;
	};

	return {
		onBeforeTemplateGenerate : _onBeforeTemplateGenerate,
		onAfterGenerate : _onAfterGenerate,
		configWizardSteps : _configWizardSteps,
		setContext : _setContext
	};
});