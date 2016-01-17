define([], function() {

	var ComponentManager = function(context) {
		var that = this;
		this.customizationFileName = "ComponentCustomizing.json";
		this.customizingJson = null;

		var getExtensionResourceId = function(model) {
			if (model.fiori.extensionCommon.extensionFilePath) {
				var resourceId = model.fiori.extensionCommon.extensionFilePath.replace(model.extensionResourceLocationPath, "");
				resourceId = model.extensionProjectNamespace + "." + resourceId;
				resourceId = resourceId.replace(/\//gm, ".");
				return resourceId;
			} else {
				return "";
			}
		};

		this.getResourceOutputPath = function(model, fileName) {
			var resourcePath = null;
			var parentLocationPath = model.fiori.extensionCommon.resourceLocationPath;
			var resourceName = model.fiori.extensionCommon.resourceName;

			if (!resourceName) {
				return parentLocationPath + fileName;
			}

			var resourceSuffix = model.fiori.extensionCommon.resourceSuffix;
			if (!resourceSuffix) {
				resourcePath = model.fiori.extensionCommon.extensionFilePath;
			} else {
				resourcePath = model.fiori.extensionCommon.extensionFilePath + resourceSuffix;
			}

			return resourcePath;
		};

		/**
		 * onBeforeTemplateGenerate.
		 */
		this.onBeforeTemplateGenerate = function(templateZip, model) {
			return context.service.extensionproject.getExtensionRevision(model).then(function() {
				model.fiori.extensionCommon.extensionResourceId = getExtensionResourceId(model);
				return context.service.filesystem.documentProvider.getDocument(model.extensionProjectPath).then(function(oProjectDoc) {
					return context.service.ui5projecthandler.getHandlerDocument(oProjectDoc).then(function(oHandlerDoc) {
						model.extensionHandlerPath = oHandlerDoc.getEntity().getFullPath();
						return context.service.ui5projecthandler.getAllExtensions(oProjectDoc).then(function(oAllExtensions) {
							that.customizingJson = oAllExtensions;
							return [templateZip, model];
						});
					});
				});
			});
		};

		/**
		 * Returns the "customization" file content from the given zip file.
		 */
		this.getFileContentFromZip = function(zip) {
			var fileContent = "{}";

			// get file from zip
			var file = zip.files[that.customizationFileName];
			if (file) {
				fileContent = file.asText();
			}

			return fileContent;
		};

		this.onAfterGenerateCommon = function(projectZip, model) {
			//Add a field to the model in order to be able to filter the relevant "generation:generated" events
			// thrown by the generation service since our event handler is called after ANY generation
			model.extensionShouldOpenFiles = true;
			updateProjectZip(projectZip, model);
		};

		// Update customizingJson as part of the after-generation flow
		this.onAfterGenerateUpdates = function(projectZip, model) {
			// read json block from customization file
			var customizationString = that.getFileContentFromZip(projectZip);
			var customizationJson = JSON.parse(customizationString);

			var customizationId = Object.keys(customizationJson)[0];
			if (!that.customizingJson[customizationId]) {
				that.customizingJson[customizationId] = customizationJson[customizationId];
			} else if (!model.fiori.extensionCommon.resourceId) {
				that.customizingJson[customizationId] = customizationJson[customizationId];
			} else {
				var resourceId = Object.keys(customizationJson[customizationId])[0];
				if (!that.customizingJson[customizationId][resourceId]) {
					that.customizingJson[customizationId][resourceId] = customizationJson[customizationId][resourceId];
				} else if (typeof customizationJson[customizationId][resourceId] !== "string") {
					var extensionId = Object.keys(customizationJson[customizationId][resourceId])[0];
					if (extensionId) {
						that.customizingJson[customizationId][resourceId][extensionId] = customizationJson[customizationId][resourceId][extensionId];
					}
				}
			}

			that.onAfterGenerateCommon(projectZip, model);
			return customizationId;
		};


		//Handles all extension templates after the template resources went through the generation engine
		//but the files were not yet imported into the workspace
		this.onAfterGenerate = function(projectZip, model) {
			var customizationId = this.onAfterGenerateUpdates(projectZip, model);

			return context.service.filesystem.documentProvider.getDocument(model.extensionProjectPath).then(function(oExtensionProjectDoc) {
				if (!customizationId) {
					customizationId = model.fiori.extensionCommon.customizationId;
				}
				var sViewName = model.fiori.extensionCommon.resourceId;
				var oExtension = that.customizingJson[customizationId];
				return context.service.ui5projecthandler.addExtension(oExtensionProjectDoc, customizationId, sViewName, oExtension[sViewName], true)
					.then(function() {
						return [projectZip, model];
				});
			});
		};

		var updateProjectZip = function(projectZip, model) {
			// remove customization file from projectZip
			projectZip.remove(that.customizationFileName);

			// move generated file to a new location
			for (file in projectZip.files) {
				var outputFilePath = that.getResourceOutputPath(model, file);
				projectZip.file(outputFilePath, projectZip.files[file].asBinary());
				projectZip.remove(projectZip.files[file].name);
			}
		};
	};

	ComponentManager.generatedEventHandler = function(oGeneratedEvent, oUiContentService, oExtensionProjectService) {
		var model = oGeneratedEvent.params.model;
		//Check that we are in a relevant service
		if (model.extensionShouldOpenFiles) {
			return oUiContentService.isExtensibilityOpen().then(
				function(bIsOpen) {
					//We don't want to open the files if we got here from the extensibility pane
					if (!bIsOpen) {
						return oExtensionProjectService.openDocument(model.extensionProjectPath, model.fiori.extensionCommon,
							model.fiori.extensionCommon.resourceId, model.fiori.extensionCommon.extensionId,
							model.extensionResourceLocationPath);
					}
				}).fail(function() {
				//If opening the file fails we still want the generation to happen
				return Q();
			});
		}
		return Q();
	};

	ComponentManager.prototype.initializeComponentModel = function(oModel, initModel) {
		if (!oModel.fiori) {
			oModel.fiori = {};
		}

		if (!oModel.fiori.extensionCommon) {
			oModel.fiori.extensionCommon = {};
		}

		var keys = Object.keys(initModel);

		// add extension common properties
		var extensionCommon = keys[0];
		var extensionCommonKeys = Object.keys(initModel[extensionCommon]);
		extensionCommonKeys.forEach(function(extensionCommonKey) {
			oModel.fiori[extensionCommon][extensionCommonKey] = initModel[extensionCommon][extensionCommonKey];
		});
		if (keys.length > 1) {
			// add component specific properties
			var componentSpecific = keys[1];
			oModel.fiori[componentSpecific] = initModel[componentSpecific];
		}
	};

	return ComponentManager;
});
