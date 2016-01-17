define({

	onBeforeTemplateGenerate : function(templateZip, model) {
		var sParamList = "";
		var sParam;
		var aWizardSteps = model.template.wizardSteps;
		if (aWizardSteps) {
			model.template.wizardStepsParams = [];
			for ( var i = 0; i < aWizardSteps.length; i++) {
				// remove special characters
				sParam = aWizardSteps[i].replace(/[^a-zA-Z0-9_]/g, "");
				// put 'o' for an object, and capitalize first letter of step name
				sParam = "o" + sParam.substring(0, 1).toUpperCase() + sParam.substring(1);

				model.template.wizardStepsParams.push(sParam);

				sParamList = sParamList + sParam;
				if (i < aWizardSteps.length - 1) {
					sParamList = sParamList + ", ";
				}
			}
			model.template.wizardStepsParamList = sParamList;
		}

		if ((aWizardSteps.indexOf("catalogstep") > -1) && (aWizardSteps.indexOf("templateCustomizationStep") > -1)) {
			model.template.hasCatalogAndCustomizations = true;
		} else {
			model.template.hasCatalogAndCustomizations = false;
		}

		if ((aWizardSteps.indexOf("catalogstep") > -1) && (aWizardSteps.indexOf("odataAnnotationSelectionStep") > -1)) {
			model.template.hasCatalogAndAnnotations = true;
		} else {
			model.template.hasCatalogAndAnnotations = false;
		}

		return [ templateZip, model ];
	},

	onAfterGenerate : function(projectZip, model) {
		var that = this;

		// Rename resources to consider the selected template name, and construct the appropriate folder structure 	
		var sTemplateName = model.template.technicalname;
		var oNewZip = new JSZip();
		var oTemplateFolder = oNewZip.folder(sTemplateName);
		var oResourcesFolder = oTemplateFolder.folder("resources");

		for ( var sFile in projectZip.files) {
			var oFile = projectZip.files[sFile];
			var sName = oFile.name;
			var sData = oFile._data;
			var oOptions = oFile.options;

			if (!oOptions.dir) {
				if (sName === "templateClass.js") {
					var sNewName = sName.replace("templateClass", sTemplateName);
					oTemplateFolder.file(sNewName, sData, oOptions);
				} else if (sName === "sample.js") {
					oResourcesFolder.file("sample.js.tmpl", sData, oOptions);
				} else {
					oTemplateFolder.file(sName, sData, oOptions);
				}
			}
		}

		// Add template parameters to plugin.json and i18n of the surrounding project
		var aParts = model.componentPath.split("/");
		var sProjectFolderPath = "/" + aParts[1];
		return this.context.service.filesystem.documentProvider.getDocument(sProjectFolderPath + "/plugin.json").then(
				function(oPluginDocument) {
					return oPluginDocument.getContent().then(function(oContent) {
						oContent = that._updatePluginConfigFileContent(oContent, model);
						return oPluginDocument.setContent(oContent).then(function() {
							return oPluginDocument.save().then(function() {
								// Add i18n parameters of generated resources and plugin.json entries to the 
								// i18n.properties file of the surrounding project (if not exists it will be created)								
								var aProperties = that._createI18nProperties(model);
								return that.context.service.translation.updatePropertyKeys(undefined, "i18n", aProperties, oPluginDocument).then(function() {
									return [ oNewZip, model ];
								});
							});
						});
					});
				});
	},

	_updatePluginConfigFileContent : function(oContent, model) {
		var oContentData = JSON.parse(oContent);

		// Put the required services in the 'requires' part
		if (!oContentData.requires) {
			oContentData.requires = {};
		}
		if (!oContentData.requires.services) {
			oContentData.requires.services = [];
		}
		if (oContentData.requires.services.indexOf("template") === -1) {
			oContentData.requires.services.push("template");
		}
		var aWizardSteps = model.template.wizardSteps;
		for ( var i = 0; i < aWizardSteps.length; i++) {
			if (oContentData.requires.services.indexOf(aWizardSteps[i]) === -1) {
				oContentData.requires.services.push(aWizardSteps[i]);
			}
		}

		// Put the new template entry in the 'configures' part (or overwrite an existing template if necessary)
		if (!oContentData.configures) {
			oContentData.configures = {};
		}
		if (!oContentData.configures.services) {
			oContentData.configures.services = {};
		}
		if (!oContentData.configures.services["template:templates"]) {
			oContentData.configures.services["template:templates"] = [];
		}

		var aParts = model.componentPath.split("/");
		var sProjectName = aParts[1];
		var sPluginName = oContentData.name;

		var sTargetPluginPath = model.componentPath.substring(1); // Remove first '/'
		var sTargetModulePath = sTargetPluginPath.replace(sProjectName, sPluginName);

		var sTemplateName = model.template.technicalname;
		var sCategoryId = model.template.categoryEntry ? model.template.categoryEntry.id : model.template.category;

		var oTemplateEntry = {
			"id" : model.template.id,
			"template" : sTargetModulePath + "/" + sTemplateName + "/" + sTemplateName,
			"name" : "{i18n>Config_template_" + sTemplateName + "_name}",
			"description" : "{i18n>Config_template_" + sTemplateName + "_desc}",
			"path" : sTargetPluginPath + "/" + sTemplateName,
			"fileName" : "resources.zip",
			"modelFileName" : "model.json",
			"modelRoot" : sTemplateName,
			"icon" : "sap-icon://detail-view",
			"internalOnly" : false,
			"category" : sCategoryId,
			"wizardSteps" : model.template.wizardSteps,
			"templateType" : model.template.templateType,
			"version" : "1.0.0",
			"orderPriority" : 1000
		};

		if (model.template.templateType === "project") {
			oTemplateEntry.requiresNeoApp = true;
		}

		var aContentDataTemplates = oContentData.configures.services["template:templates"];
		if (model.overwrite) {
			var iTemplateIndex = this._checkIfTemplateExists(aContentDataTemplates, oTemplateEntry);
			if (iTemplateIndex !== -1) {
				// overwrite the existing template with the updated template entry
				aContentDataTemplates[iTemplateIndex] = oTemplateEntry;
			} else {
				aContentDataTemplates.push(oTemplateEntry);
			}
		} else {
			aContentDataTemplates.push(oTemplateEntry);
		}

		// Put the new category entry (if relevant) in the 'configures' part
		if (model.template.categoryEntry) {
			if (!oContentData.configures.services["template:categories"]) {
				oContentData.configures.services["template:categories"] = [];
			}
			var sCategoryI18nKey = this._getCategoryI18nKey(model);
			var oCategoryEntry = {
				"id" : model.template.categoryEntry.id,
				"name" : "{i18n>Config_category_" + sCategoryI18nKey + "_name}",
				"description" : "{i18n>Config_category_" + sCategoryI18nKey + "_desc}"
			};
			oContentData.configures.services["template:categories"].push(oCategoryEntry);
		}

		return JSON.stringify(oContentData, undefined, 4);
	},

	_checkIfTemplateExists : function(aTemplates, oTemplate) {
		var oTemplateToOverwrite;
		for ( var index = 0; index < aTemplates.length; index++) {
			oTemplateToOverwrite = aTemplates[index];
			if (oTemplateToOverwrite.template === oTemplate.template) {
				return index;
			}
		}
		return -1;
	},

	_getCategoryI18nKey : function(model) {
		return model.template.categoryEntry.name.replace(/[^a-zA-Z0-9_]/g, "_");
	},

	_createI18nProperties : function(model) {
		var sTemplateName = model.template.technicalname;
		var sFieldTitle = this.context.i18n.getText("i18n", "templateComponent_model_field_title");
		var aProperties = [ {
			key : sTemplateName + "_model_form_title",
			value : model.template.name,
			textType : "XFLD"
		}, {
			key : sTemplateName + "_model_field_title",
			value : sFieldTitle,
			textType : "XFLD"
		}, {
			key : "Config_template_" + sTemplateName + "_name",
			value : model.template.name,
			textType : "XFLD"
		}, {
			key : "Config_template_" + sTemplateName + "_desc",
			value : model.template.description,
			textType : "XFLD"
		} ];

		if (model.template.categoryEntry) {
			var sCategoryI18nKey = this._getCategoryI18nKey(model);
			aProperties.push({
				key : "Config_category_" + sCategoryI18nKey + "_name",
				value : model.template.categoryEntry.name,
				textType : "XFLD"
			});
			aProperties.push({
				key : "Config_category_" + sCategoryI18nKey + "_desc",
				value : model.template.categoryEntry.description,
				textType : "XFLD"
			});
		}
		return aProperties;
	},

	configWizardSteps : function(oTemplateInfoStep, oTemplateStepsSelectionStep) {
	    var oTemplateInfoStepContent = oTemplateInfoStep.getStepContent();
		var oTemplateStepsSelectionStepContent = oTemplateStepsSelectionStep.getStepContent();

		oTemplateInfoStepContent.attachValueChange(oTemplateStepsSelectionStepContent.onChangeTemplateType, oTemplateStepsSelectionStepContent);
	}

});
