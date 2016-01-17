define([ "../manager/ComponentManager" ], function(ComponentManager) {

	var oComponentManager = null;
	var oContext = null;
	var i18n = "i18n";

	var _updateGuidelinesDocument = function(model) {
		var sUri = model.fiori.extensionCommon.i18nPath;
		var aDocumentsPromises = [oContext.service.filesystem.documentProvider.getDocument(model.extensionProjectPath),
			oContext.service.parentproject.getGuidelinesDocument(model.extensibility, model.extensibility.system, model.extensibility.type)];

		// get parent project guidelines document
		return Q.all(aDocumentsPromises).spread(function(oExtensionProjectDoc, oParentProjectGuidelinesDoc) {
			// check if parent project scaffolding based
			return oContext.service.ui5projecthandler.isScaffoldingBased(oParentProjectGuidelinesDoc).then(function(bIsScaffolding) {
				if (bIsScaffolding) {
					// add scaffolding configuration (and i18n path to manifest)
					var sConfigName = "sap.ca.i18Nconfigs";
					var sBundleName = model.extensionProjectNamespace + ".i18n." + model.fiori.extensionCommon.propertiesFileName;
					var oContent = {
						"bundleName": sBundleName
					};
					return oContext.service.ui5projecthandler.addConfig(oExtensionProjectDoc, sConfigName, oContent, true).then(function () {
						return oContext.service.ui5projecthandler.isManifestProjectGuidelinesType(oExtensionProjectDoc).then(function (bManifestExists) {
							if (bManifestExists) {
								return oContext.service.ui5projecthandler.addI18nPath(oExtensionProjectDoc, sUri, true);
							}
						});
					});
				} else {
					// set the i18n model in extension project (also add i18n path to manifest)
					return oContext.service.ui5projecthandler.addi18nExtensionModel(oExtensionProjectDoc, sUri, true);
				}
			});
		});
	};

	/*
	 * Copy the i18n folder from the parent to the extended application, and update model with i18n parent information
	 */
	var _copyI18nFolderFromParent = function(model, templateZip) {

		if (model.fiori === undefined) {
			model.fiori = {};
		}
		model.fiori.extensionCommon = {};

		var resourceBundle = model.extensibility.resourceBundle;

		if (!resourceBundle || resourceBundle === "") {
			// the path to "i18n" folder does not exist in the "config" block in handler file of the parent app
			// stop the generation
			throw Error(oContext.i18n.getText("i18n", "i18nExtension_noResourceBundle"));
		}

		var parts = resourceBundle.split("/");
		var i18nFolder = parts[0];
		var projectPath = model.extensibility.component.replace("Component.js", "");
		var extensionResourceLocationPath = model.extensionResourceLocationPath;
		model.fiori.extensionCommon.resourceLocationPath = extensionResourceLocationPath + i18n + "/";

		var propertiesFileName = parts[1].split(".")[0];

		model.fiori.extensionCommon.i18nPath = i18n + "/" + propertiesFileName + ".properties";

		model.fiori.extensionCommon.propertiesFileName = propertiesFileName;

		var type = model.extensibility.type;
		var system = model.extensibility.system;

		var lastIndexOf = resourceBundle.lastIndexOf("/");
		var i18nFolderSubPath = resourceBundle.substring(0, lastIndexOf);
		var i18nFolderPath = projectPath + i18nFolderSubPath;

		// get all files in i18n folder
		return oContext.service.parentproject.geti18nFolderFiles(i18nFolderPath, system, type).then(function(i18nFolderFiles) {
			// add all files found to the template zip in order for them to be generated
			return addFilesToTemplateZip(i18nFolderFiles, templateZip);
		});
	};

	/*
	 * Recursive function that adds the given files to the given template zip.
	 */
	var addFilesToTemplateZip = function(filesArray, templateZip) {
		var promises = [];

		for ( var i = 0; i < filesArray.length; i++) {
			promises.push(filesArray[i].getContent());
		}

		return Q.all(promises).spread(function() {
			for ( var i = 0; i < arguments.length; i++) {
				var fileContent = arguments[i];
				// add the current file to the template zip
				templateZip.file(filesArray[i].getEntity().getName(), fileContent);
			}
		});
	};

	var _onAfterGenerate = function(projectZip, model) {
		oComponentManager = new ComponentManager(this.context);
		oContext = this.context;

		if (!projectZip) {
			projectZip = new JSZip();
		}

		// copy the i18n folder from the parent application to the extension project
		return _copyI18nFolderFromParent(model, projectZip).then(function() {
			// update the extension project's manifest.json/Component.js file
			return _updateGuidelinesDocument(model).then(function() {
				oComponentManager.onAfterGenerateCommon(projectZip, model);
				return [projectZip, model];
			});
		});
	};

	// for testing purposes
	var _setContext = function(oNewContext) {
		this.context = oNewContext;
		oContext = oNewContext;
	};

	return {
		onAfterGenerate : _onAfterGenerate,
		updateGuidelinesDocument : _updateGuidelinesDocument,
		copyI18nFolderFromParent : _copyI18nFolderFromParent,
		setContext : _setContext
	};
});
