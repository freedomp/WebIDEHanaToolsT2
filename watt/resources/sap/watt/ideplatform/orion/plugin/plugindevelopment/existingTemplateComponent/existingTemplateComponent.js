define({

	onBeforeTemplateGenerate : function(templateZip, model) {

		return [ templateZip, model ];
	},

	onAfterGenerate : function(projectZip, model) {
		var that = this;

		// Construct the appropriate folder structure and template files, considering the new selected template name 	
		var sTemplateName = model.template.technicalname;
		var oExistingTemplate = model.template.selectedTemplateToExtend;
		return Q.sap.require("sap/watt/lib/jszip/jszip-shim").then(function(JSZip) {
			var oNewZip = new JSZip();
			var oTemplateFolder = oNewZip.folder(sTemplateName);
			var oResourcesFolder = oTemplateFolder.folder("resources");
			// Add template class file to project zip
			return that._loadExistingTemplateFile(oExistingTemplate, oTemplateFolder, sTemplateName).then(function() {
				// Add model file to project zip (if exists)
				return that._loadExistingModelFile(oExistingTemplate, oTemplateFolder).then(function(sExistingModelFileContent) {
					// Load template resources zip content (if exists) to project zip (at resources folder) 
					return that._loadExistingResources(oExistingTemplate, oResourcesFolder).then(function() {
						// Load preview image to project zip (if exists) 
						return that._loadExistingPreviewImage(oExistingTemplate, oTemplateFolder).then(function() {
					    	// Load template customization image to project zip (if exists) 
					    	return that._loadExistingTemplateCustomizationImage(oExistingTemplate, oTemplateFolder).then(function() {						    
							    // Add template parameters to plugin.json and i18n of the surrounding project
						    	return that._writeToPluginConfigAndI18n(model,sExistingModelFileContent).then(function() {
								    return [ oNewZip, model ];
						    	});
						    });
					    });
					});
				});
			});
		});
	},

	_loadExistingTemplateFile : function(oExistingTemplate, oTemplateFolder, sNewTemplateName) {
		var sTemplateClassFullName = oExistingTemplate.getTemplateClass().getProxyMetadata().getName();

		var sTemplateClassRelativePath = sTemplateClassFullName.substring(sTemplateClassFullName.indexOf("/") + 1);
		sTemplateClassRelativePath = sTemplateClassRelativePath + ".js";

		var sTemplateFolderPath = oExistingTemplate.getPath();
		var sTemplateClassPluginFolder = sTemplateFolderPath.substring(0, sTemplateFolderPath.indexOf("/"));

		var sTemplateClassFullPath = sTemplateClassPluginFolder + "/" + sTemplateClassRelativePath;

		return this.context.service.pluginmanagement.getPluginFile(sTemplateClassFullName, sTemplateClassFullPath, false).then(
				function(sExistingTemplateFileContent) {
					oTemplateFolder.file(sNewTemplateName + ".js", sExistingTemplateFileContent);
				});
	},

	_loadExistingModelFile : function(oExistingTemplate, oTemplateFolder) {
		if (oExistingTemplate.getModelFileName()) {
			var sTemplateClassFullName = oExistingTemplate.getTemplateClass().getProxyMetadata().getName();
			var sModelPath = oExistingTemplate.getPath() + "/" + oExistingTemplate.getModelFileName();
			return this.context.service.pluginmanagement.getPluginFile(sTemplateClassFullName, sModelPath, false).then(
					function(sExistingModelFileContent) {
						oTemplateFolder.file("model.json", sExistingModelFileContent);
						return sExistingModelFileContent; // for future use
					});
		} else {
			return Q(null); //resolve without loading any model.json file
		}
	},

	_loadExistingPreviewImage : function(oExistingTemplate, oTemplateFolder) {
		var that = this;
		var sPreviewImageRelativePath = oExistingTemplate.getPreviewImage();
		if (sPreviewImageRelativePath) {
			var sTemplateClassFullName = oExistingTemplate.getTemplateClass().getProxyMetadata().getName();
			var sImagePath = oExistingTemplate.getPath() + "/" + sPreviewImageRelativePath;
			return this.context.service.pluginmanagement.getPluginFile(sTemplateClassFullName, sImagePath, true).then(
					function(oExistingImageFileBlob) {
						var oTemplateImageFolder = oTemplateFolder.folder("image");
						return that._loadImageContentData(oExistingImageFileBlob, oTemplateImageFolder, that
								._getImageName(sPreviewImageRelativePath));
					});
		} else {
			return Q(); //resolve without copying any preview image file
		}
	},
	
	_loadExistingTemplateCustomizationImage : function(oExistingTemplate, oTemplateFolder) {
		var that = this;
		var sTmplCustImageRelativePath = oExistingTemplate.getTemplateCustomizationImage();
		if (sTmplCustImageRelativePath) {
			var sTemplateClassFullName = oExistingTemplate.getTemplateClass().getProxyMetadata().getName();
			var sImagePath = oExistingTemplate.getPath() + "/" + sTmplCustImageRelativePath;
			return this.context.service.pluginmanagement.getPluginFile(sTemplateClassFullName, sImagePath, true).then(
					function(oExistingImageFileBlob) {
						var oTemplateImageFolder = oTemplateFolder.folder("image");
						return that._loadImageContentData(oExistingImageFileBlob, oTemplateImageFolder, that
								._getImageName(sTmplCustImageRelativePath));
					});
		} else {
			return Q(); //resolve without copying any preview image file
		}
	},
	
	_getImageName : function(sImagePath) {
		var iLastSlashIndex = sImagePath.lastIndexOf("/");
		if (iLastSlashIndex > -1) {
			return sImagePath.substring(iLastSlashIndex + 1);
		} else {
			return sImagePath;
		}
	},

	_loadImageContentData : function(blob, oTemplateImageFolder, sImageFileName) {
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
			oDeferred.reject(this.context.i18n.getText("i18n", "existingTemplateComponent_image_read_error_msg")); //TODO review string
		}
		return oDeferred.promise;
	},

	_loadExistingResources : function(oExistingTemplate, oResourcesFolder) {
		var that = this;
		if (oExistingTemplate.getFileName()) {
			var sTemplateClassFullName = oExistingTemplate.getTemplateClass().getProxyMetadata().getName();
			var sResPath = oExistingTemplate.getPath() + "/" + oExistingTemplate.getFileName();
			return this.context.service.pluginmanagement.getPluginFile(sTemplateClassFullName, sResPath, true).then(
					function(oExistingResourcesBlob) {
						return that._loadResourcesContentData(oExistingResourcesBlob, oResourcesFolder);
					});
		} else {
			return Q(); //resolve without loading any resources
		}
	},
	
	_loadResourcesContentData : function(blob, oResourcesFolder) {
		var oDeferred = Q.defer();
		if (blob) {
			var reader = new FileReader();
			reader.onload = function(e) {
				oResourcesFolder.load(e.target.result);
				oDeferred.resolve();
			};
			reader.readAsArrayBuffer(blob);
		} else {
			oDeferred.reject(this.context.i18n.getText("i18n", "existingTemplateComponent_resources_read_error_msg")); //TODO review string
		}
		return oDeferred.promise;
	},

	_writeToPluginConfigAndI18n : function(model,sExistingModelFileContent) {
		var that = this;
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
								var aProperties = that._createI18nProperties(model,sExistingModelFileContent);
								return that.context.service.translation.updatePropertyKeys(undefined, "i18n", aProperties, oPluginDocument);
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
		var aWizardSteps = model.template.selectedTemplateToExtend.getWizardSteps();
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
			"icon" : "sap-icon://detail-view",
			"internalOnly" : false,
			"category" : sCategoryId,
			"wizardSteps" : model.template.selectedTemplateToExtend.getWizardSteps(),
			"templateType" : model.template.templateType,
			"requiresNeoApp" : model.template.selectedTemplateToExtend.getRequiresNeoApp(),
			"version" : "1.0.0",
			"orderPriority" : 1000
		};

		// Put resources related information according to existing template
		var sExistingModelRoot = model.template.selectedTemplateToExtend.getModelRoot();
		if (sExistingModelRoot) {
			oTemplateEntry.modelRoot = sExistingModelRoot;
		}

		if (model.template.selectedTemplateToExtend.getModelFileName()) {
			oTemplateEntry.modelFileName = "model.json";
		}

		if (model.template.selectedTemplateToExtend.getFileName()) {
			oTemplateEntry.fileName = "resources.zip";
		}

		var aExistingRequiredTemplates = model.template.selectedTemplateToExtend.getRequiredTemplates();
		if (aExistingRequiredTemplates) {
			oTemplateEntry.requiredTemplates = aExistingRequiredTemplates;
		}

		var sExistingPreviewImagePath = model.template.selectedTemplateToExtend.getPreviewImage();
		if (sExistingPreviewImagePath) {
			oTemplateEntry.previewImage = "image/" + this._getImageName(sExistingPreviewImagePath);
		}
		
		var sExistingTmplCustImagePath = model.template.selectedTemplateToExtend.getTemplateCustomizationImage();
		if (sExistingTmplCustImagePath) {
			oTemplateEntry.templateCustomizationImage = "image/" + this._getImageName(sExistingTmplCustImagePath);
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
			if (oTemplateToOverwrite.template == oTemplate.template) {
				return index;
			}
		}
		return -1;
	},

	_getCategoryI18nKey : function(model) {
		return model.template.categoryEntry.name.replace(/[^a-zA-Z0-9_]/g, "_");
	},

	// Note: i18n properties used in model.json from existing template cannot be considered!
	// Only new i18n properties of the template will be created here
	_createI18nProperties : function(model,sExistingModelFileContent) {
		var sTemplateName = model.template.technicalname;
		var aProperties = [ {
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
		if (sExistingModelFileContent){
		    this._copyModelI18nProperties(model, aProperties, sExistingModelFileContent);
		}
		return aProperties;
	},

    _addProperty : function(propKey, type,aProperties,i18nResource){
        if (propKey){
            var propValue = i18nResource.getText(propKey);
        }
        if (propValue && (propValue !== propKey)){ //If  key itself was returned, it means that no key was found
    		aProperties.push({
    	    	key : propKey,
    		    value :propValue,
    		    textType :type
    	    });
        }
	 },
	
    _copyModelI18nProperties : function(model, aProperties,sExistingModelFileContent){
        var oModel = JSON.parse(sExistingModelFileContent);
        var oExistingTemplate = model.template.selectedTemplateToExtend;
        var sModelRootName = oExistingTemplate.getModelRoot();
        
        if (oExistingTemplate.getI18nResources().i18n) { 
            var i18nResource = oExistingTemplate.getI18nResources().i18n.getResourceBundle();
            //copy conntrols properties
            var aParameters = oModel[sModelRootName].parameters;         
            for ( var param in aParameters) {
        		var oParameter = aParameters[param];
        		var wizard = oParameter.wizard;
        		if (wizard){
            		var sControl = wizard.control;
        
            	    if((sControl === "CheckBox")||(sControl === "TextField")||(sControl === "ComboBox")){ // only those controls' keys are copied
            	        //create toolTip properties
            	        this._addProperty(oParameter.wizard.tooltip,"XTOL",aProperties,i18nResource);
                        //create title properties
            			this._addProperty(oParameter.wizard.title,"XFLD",aProperties,i18nResource);
                    }
            	    if(sControl === "TextField"){
            	        //create error msg properties
        			    this._addProperty(oParameter.wizard.regExpErrMsg,"XMSG",aProperties,i18nResource);
            	    }
                }    
            }
            //copy Form properties
            var forms = oModel[sModelRootName].forms; 
            if (forms){
                for (var i=0; i < forms.length;i++){
                    this._addProperty(forms[i].title,"XFLD",aProperties,i18nResource); 
                    
                    var groups = forms[i].groups; 
                    if (groups){
                        for(var index=0; index<groups.length;index++){
                           this._addProperty(groups[index].title,"XFLD",aProperties,i18nResource);  
                        }
                    }
                }
            }
        }
     
    },

	configWizardSteps : function(oTemplateInfoStep, oExtendTemplateStep) {

		var oTemplateInfoStepContent = oTemplateInfoStep.getStepContent();
		var oExtendTemplateStepContent = oExtendTemplateStep.getStepContent();

		oTemplateInfoStepContent.attachValueChange(oExtendTemplateStepContent.onChangeTemplateType, oExtendTemplateStepContent);

		return [ oTemplateInfoStep, oExtendTemplateStep ];
	}

});
