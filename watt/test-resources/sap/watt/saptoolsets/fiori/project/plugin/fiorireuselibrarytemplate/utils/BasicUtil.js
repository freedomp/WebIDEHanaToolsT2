define(["sap/watt/platform/plugin/utils/xml/XmlUtil"], function(XmlUtil) {

	var BasicUtil = function(sTestId, dTestModuleTimeStamp, oServices, oOptions) {
		this._sTestId = sTestId;
		this._oTemplateService = oServices.oTemplateService;
		this._oFileService = oServices.oFileService;
		this._oGenerationService = oServices.oGenerationService;
		this._oRepoBrowser = oServices.oRepoBrowser;
		this._sTestLibraryName = "";
		this._dTestModuleTimeStamp = dTestModuleTimeStamp;
		this._oOptions = oOptions;
	};

	BasicUtil.prototype.getTestLibraryName = function() {

		return this._sTestLibraryName;

	};

	BasicUtil.prototype.initializeTestLibrary = function() {
		this._sTestLibraryName = this._buildLibraryName(this._sTestId);
		return this._createLibrary();
	};

	BasicUtil.prototype.findDocumentInArray = function(aDocuments, sName) {
		for (var i = 0; i < aDocuments.length; i++) {
			if (aDocuments[i].getEntity().getName() === sName) {
				return aDocuments[i];
			}
		}
	};

	BasicUtil.prototype.isUnixLineEnding = function(sContent) {
		return sContent.match(/\r\n/g) === null;
	};

	BasicUtil.prototype.getTagName = function(sContent, sTagName) {
		var oXMLDocument = jQuery.sap.parseXML(sContent);
		var aNodes = oXMLDocument.getElementsByTagName(sTagName);
		if (aNodes.length > 0) {
			return aNodes[0];
		}
		return null;
	};
	
	BasicUtil.prototype.getTextByTagName = function(sContent, sTagName) {
		var oXMLDocument = jQuery.sap.parseXML(sContent);
		var aNodes = oXMLDocument.getElementsByTagName(sTagName);
		if (aNodes.length > 0) {
			return aNodes[0].textContent;
		}
		return null;
	};

	BasicUtil.prototype.parseToGetVersion = function(fileContent) {
		var patternLibraryJs = /version\s*:\s*\"([\s\S]*?)\"/;

		var versionStr = "";
		var versionArr = fileContent.match(patternLibraryJs);
		if (versionArr) {
			versionStr = versionArr[1];
		} else {
			var oXMLDocument = jQuery.sap.parseXML(fileContent);
			var projNode = XmlUtil.firstElementChild(oXMLDocument);
			var versionNode = XmlUtil.getChildByTagName(projNode, "version");
			versionStr = versionNode.textContent;
		}

		return versionStr;
	};

	BasicUtil.prototype.getTranslationGuid = function(sContent) {
		var start = sContent.lastIndexOf("# __ldi.translation.uuid=") + 25;
		return sContent.substring(start, start + 36);
	};

	BasicUtil.prototype.getLibraryName = function() {
		return this._sTestLibraryName;
	};

	BasicUtil.prototype.getFileFolder = function(sFileFolderName, sNamespace) {
		sNamespace = sNamespace ? ("src" + "/" + sNamespace.replace(/\./g, "/") + "/") : "";
		var sFilePath = "/" + this.getLibraryName() + "/" + sNamespace + sFileFolderName;
		return this._oFileService.getDocument(sFilePath);
	};

	BasicUtil.prototype.deleteTestLibrary = function() {

		var that = this;
		var sTestLibraryName = this._sTestLibraryName;

		return this._oFileService.getRoot().then(function(oRootDocument) {
			return oRootDocument.getFolderContent();
		}).then(function(aResult) {
			if (aResult) {
				var oFileDocument = that.findDocumentInArray(aResult, sTestLibraryName);
				if (oFileDocument) {
					return oFileDocument.delete();
				}
			}
		});

	};

	BasicUtil.prototype._buildLibraryName = function() {
		return "TestLibrary_" + this._dTestModuleTimeStamp + "_" + this._sTestId;

	};

	BasicUtil.prototype.instanciateControl = function(sControlName, sLibraryNamespace) {
		var libraryPath = "/testLibrary/" + this._sTestLibraryName + "/src/" + sLibraryNamespace.split('.').join('/');
		//var sPath = jQuery.sap.getModulePath(this._sTestLibraryName);
		//var libraryPath = sPath + "/src/" + sLibraryNamespace.split(".").join("/");
		jQuery.sap.registerModulePath(sLibraryNamespace, libraryPath);
		jQuery.sap.require(sLibraryNamespace + ".library");

		var oControl = new [sLibraryNamespace + ".controls." + sControlName]();
		return oControl;
		//return Q({});
	};

	BasicUtil.prototype._getReuseLibraryTemplateModel = function() {

		var oModel = {
			"projectName": this._sTestLibraryName,
			"domain": {
				id: "TE"
			},
			"reuselibrary": {
				"parameters": {
					"LibraryDescription": {
						"type": "string",
						"value": this._oOptions.description,
						"wizard": {
							"control": "TextField",
							"required": false,
							"title": "reuselibrary_model_field_library_description"
						}
					},
					"LibraryAppDomain": {
						"type": "string",
						"value": "",
						"multiplicity": "one",
						"isRoot": true,
						"wizard": {
							"control": "ComboBox",
							"required": false,
							"title": "reuselibrary_model_field_library_appDomain"
						}
					},
					"LibraryNamespace": {
						"type": "string",
						"value": this._oOptions.namespace,
						"wizard": {
							"control": "TextField",
							"required": false,
							"title": "reuselibrary_model_field_library_namespace"
						}
					},
					"ControlsCheckBox": {
						"type": "string",
						"value": this._oOptions.addControl,
						"wizard": {
							"control": "CheckBox",
							"required": false,
							"title": "reuselibrary_model_field_controls"
						}
					},
					"LibraryVersion": {
						"type": "string",
						"value": this._oOptions.version,
						"wizard": {
							"control": "TextField",
							"required": false,
							"title": "reuselibrary_model_field_library_version",
							"regExp": "^[0-9]+(?:\\.([0-9]+)(?:\\.([0-9]+))?)?(.*)$"
						}
					},
					"TranslationDeveloper": {
						"type": "string",
						"value": this._oOptions.translationDeveloper,
						"wizard": {
							"control": "TextField",
							"required": false,
							"title": "reuselibrary_model_field_translation_developer"
						}
					},
					"TranslationCollection": {
						"type": "string",
						"value": this._oOptions.translationCollection,
						"wizard": {
							"control": "TextField",
							"required": false,
							"title": "reuselibrary_model_field_translation_collection"
						}
					},
					"TranslationGUID": {
						"type": "string",
						"value": this._oOptions.translationGuid,
						"wizard": {
							"control": "TextField",
							"required": false,
							"title": "reuselibrary_model_field_translation_guid",
							"regExp": "^(([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12})$",
							"regExpErrMsg": "reuselibrarycomponent_model_parameters_translationGUID_validationError"
						}
					},
					"LibraryTitle": {
						"type": "string",
						"value": this._oOptions.libraryTitle,
						"wizard": {
							"control": "TextField",
							"required": true,
							"title": "reuselibrary_model_field_library_title"
						}
					},
					"ContentDensitiesCompact": {
						"type": "string",
						"value": this._oOptions.contentDensitiesCompact,
						"wizard": {
							"control": "CheckBox",
							"required": false,
							"title": "reuselibrary_model_field_content_densities_compact"
						}
					},
					"ContentDensitiesCozy": {
						"type": "string",
						"value": this._oOptions.contentDensitiesCozy,
						"wizard": {
							"control": "CheckBox",
							"required": false,
							"title": "reuselibrary_model_field_content_densities_cozy"
						}
					},
					"SapPlatfromAbapURI": {
						"type": "string",
						"value": this._oOptions.sapPlatfromAbapURI,
						"wizard": {
							"control": "TextField",
							"required": false,
							"title": "reuselibrary_model_field_sap_platfrom_abap_uri"
						}
					},
					"SapFioriRegistrationID": {
						"type": "string",
						"value": this._oOptions.sapFioriRegistrationID,
						"wizard": {
							"control": "TextField",
							"required": false,
							"title": "reuselibrary_model_field_sap_fiori_registration_id"
						}
					},
					"ApplicationComponentHierarchy": {
						"type": "string",
						"value": this._oOptions.applicationComponentHierarchy,
						"wizard": {
							"control": "TextField",
							"required": false,
							"title": "reuselibrary_model_field_application_component_hierarchy"
						}
					}
				}
			}
		};
		return oModel;
	};

	BasicUtil.prototype._getReuseLibraryComponentTemplateModel = function(oOptions, oTemplate) {
		var oModel = {};
		oModel = {
			"componentPath": "/" + this._sTestLibraryName,
			"selectedTemplate": oTemplate,
			"reuselibrarycomponent": {
				"parameters": {
					"ComponentName": {
						"type": "string",
						"value": oOptions.componentName,
						"wizard": {
							"control": "TextField",
							"required": true,
							"title": "reuselibrary_model_field_project_name"
						}
					},
					"CreateQUnitTestCheckBox": {
						"type": "boolean",
						"value": oOptions.createQUnit,
						"wizard": {
							"control": "CheckBox",
							"required": false,
							"title": "reuselibrarycomponent_model_field_create_qunit_test"
						}
					},
					"CreateCssFilesCheckBox": {
						"type": "boolean",
						"value": oOptions.createCssFiles,
						"wizard": {
							"control": "CheckBox",
							"required": false,
							"title": "reuselibrarycomponent_model_field_create_css_files"
						}
					},
					"CreateTestPageCheckBox": {
						"type": "boolean",
						"value": oOptions.createTestPage,
						"wizard": {
							"control": "CheckBox",
							"required": false,
							"title": "reuselibrarycomponent_model_field_create_test_page"
						}
					}
				}
			}
		};
		return oModel;
	};

	BasicUtil.prototype.createControl = function(oOptions) {
		var that = this;
		var sPackageName = "/" + this._sTestLibraryName;
		return that._oTemplateService.getTemplates().then(function(mTemplates) {
			return that._oFileService.getDocument(sPackageName).then(function(oProjectFolderDocument) {
				var oTemplate = mTemplates[oOptions.templateId];
				var oModel = that._getReuseLibraryComponentTemplateModel(oOptions, oTemplate);
				return that._oGenerationService.generate(sPackageName, oTemplate, oModel, false, oProjectFolderDocument);
			});
		});
	};

	BasicUtil.prototype._createLibrary = function() {
		var sPackageName = "/" + this._sTestLibraryName;
		var that = this;
		var oModel = that._getReuseLibraryTemplateModel();
		return that._oTemplateService.getTemplates().then(function(mTemplates) {
			return that._oFileService.getRoot().then(function(oRootDocument) {
				return oRootDocument.createFolder(that._sTestLibraryName).then(function(oProjectFolderDocument) {
					return that._oGenerationService.generate(sPackageName, mTemplates["fiorireuselibrarytemplate.reuselibrary"], oModel,
						false, oProjectFolderDocument);
				});
			});
		});
	};

	return BasicUtil;
});