define(["sap/watt/lib/jszip/jszip-shim", "sap/watt/lib/lodash/lodash"], function(JSZip, _) {
	"use strict";

	return {

		_binaryFilesExtensions: [".jpeg", ".jpg", ".gif", ".bmp", ".png"],
		_oTemplateService: null,
		_oFileService: null,
		_oDocumentService: null,
		_aBeautifiedExtentions: null,

		init: function() {
			this._oFileService = this.context.service.filesystem.documentProvider;
			this._oDocumentService = this.context.service.document;
			this._oTemplateService = this.context.service.template;
			this._oMockFileLoader = this.context.service.mockFileLoader;
			this._oModelHelper = this.context.service.modelHelper;
			this._oProjectTypeService = this.context.service.projectType;
			jQuery.sap.require("sap.ui.thirdparty.handlebars");
			this._populateBeautifiedExtentions().done();
		},

		/**
		 * Generates a new project based on a template and the user selections in the wizard
		 *
		 *
		 * @param {String} [sPath]  			The path where the template files should be generated at
		 * @param {Object} [oSelectedTemplate]  The settings of the selected template, as appears in the plugin.json
		 *                                		of the template plugin
		 * @param {Object} [oModel] 			JSON object which includes all the data provided by all the wizard steps
		 *                                		that are used for generating the template
		 * @param {Boolean}[bOverwrite]      	states if the created template files should overwrite an existing
		 *                                		project / component
		 * @param {object}[oParentDocument]     The parent document of the created template. passed by the wizard only
		 * 										in case of module (sub project)
		 * @returns {Object} The newly created project instance
		 */
		generateProject: function(sPath, oSelectedTemplate, oModel, bOverwrite, oParentDocument) {
			if (!sPath) {
				throw new TypeError(this.context.i18n.getText("i18n", "Generation_generationInvalidPathError"));
			}
			if (!oSelectedTemplate) {
				throw new TypeError(this.context.i18n.getText("i18n", "Generation_generationNoTemplateSelectedError"));
			}
			var aProjectTypes;
			aProjectTypes = oSelectedTemplate.getTargetProjectTypes();
			if (!aProjectTypes) { // for backward compatibility
				aProjectTypes = oSelectedTemplate.getSupportedProjectTypes();
			}
			var aFirstProjectType = (aProjectTypes && aProjectTypes.length > 0) ? aProjectTypes[0] : undefined;
			var aAdditionalTypes = (aProjectTypes && aProjectTypes.length > 1) ? aProjectTypes.slice(1) : [];
			var aPath = sPath.split("/");
			var sPackageName = aPath[aPath.length - 1];
			var oProjectData = {};
			oProjectData.name = sPackageName;
			oProjectData.type = aFirstProjectType;
			oProjectData.additionalTypes = aAdditionalTypes;
			oProjectData.attributes = {};

			oProjectData.generatorDescription = {
				options: this._getProjectOptionsFromModel(oModel, oSelectedTemplate.getModelRoot())
			};

			var that = this;
			if (oParentDocument) {
				// module scenario
				return this._createProject(oParentDocument, oProjectData, sPath, oSelectedTemplate, oModel, bOverwrite);
			} else {
				if (sPath[0] !== "/") {
					sPath = "/" + sPath;
				}
				return this._oFileService.getDocument(sPath).then(function (oPathResult) {
					if (oPathResult) {
						// create project in existing folder
						return that._addProjectTypes(oPathResult, aProjectTypes).then(function(){
							try {
								return that.generate(sPath, oSelectedTemplate, oModel, true, oPathResult).then(function(){
									return oPathResult;
								});
							}
							catch(oError) {
								that._deleteGeneratedContentInAlreadyExistingfolder(oPathResult);
								throw oError;
							}
						});
					} else {
						return that._oFileService.getRoot().then(function(oRootDocument) {
							return that._createProject(oRootDocument, oProjectData, sPath, oSelectedTemplate, oModel, bOverwrite);
						});
					}
				}, function(){
					//This is a fix for Incident ID:1570846692 - In HANA IDE in first use of a clean installation getDocument throws an error
					return that._oFileService.getRoot().then(function(oRootDocument) {
						return that._createProject(oRootDocument, oProjectData, sPath, oSelectedTemplate, oModel, bOverwrite);
					});
				});
				
			}
		},
		
		_deleteGeneratedContentInAlreadyExistingfolder: function(oProjectFolderDocument) {
			var aWhiteList = [".project.json", "README.md", "sap-ui-cachebuster-info.json", ".git", ".gitignore"];
			oProjectFolderDocument.getFolderContent().then(function(aContent) {
					if (aContent) {
						for (var i = 0; i < aContent.length; i++) {
							if (aWhiteList.indexOf(aContent[i].getTitle()) === -1) {
								// delete all content except for whilelist files
								aContent[i].delete().done();
							}
						}
					}
			}).done();
		},
		
		_addProjectTypes : function(oProjectDoc, aProjectTypes) {
			if (aProjectTypes) {
				return this._oProjectTypeService.addProjectTypes(oProjectDoc, aProjectTypes);
			}
			else {
				return Q();
			}
		},

		_createProject: function(oParentDoc, oProjectData, sPath, oSelectedTemplate, oModel, bOverwrite) {
			var that = this;
			return oParentDoc.createProject(oProjectData).then(function(oProjectDocument) {
				if (oProjectDocument) {
					try {
						return that.generate(sPath, oSelectedTemplate, oModel, bOverwrite, oProjectDocument).then(function() {
							return oProjectDocument;
						});
					}
					catch(oError) {
						oProjectDocument.delete().done();
						throw oError;
					}
				} else {
					throw new Error(that.context.i18n.getText("i18n", "Generation_createFolderFailedError"));
				}
			});
		},

		_getProjectOptionsFromModel: function(oModel, sModelRootName) {
			var options = {};
			if (oModel && sModelRootName) {
				var oModelRoot = oModel[sModelRootName];
				if (oModelRoot) {
					var oParameters = oModelRoot.parameters;
					for (var k in oParameters) {
						if (oParameters.hasOwnProperty(k) && oParameters[k].hasOwnProperty("value")) {
							options[k] = oParameters[k].value;
						}
					}
				}
			}
			return options;
		},

		/**
		 * Generates into an existing folder a new project or component based on a template and the user selections in the wizard
		 *
		 *
		 * @param {String}	[path]				The path where the template files should be generated at
		 * @param {Object}	[selectedTemplate]	The settings of the selected template, as appears in the plugin.json
		 * 										of the template plugin
		 * @param {Object}	[model]				JSON object which includes all the data provided by all the wizard steps
		 * 										that are used for generating the template
		 * @param {Boolean}	[bOverwrite]		states if the created template files should overwrite an existing
		 * 										project / component
		 * @param {Object}	[oTargetDocument]	The document of the newly generated project
		 * @returns {*}
		 */
		generate: function(path, selectedTemplate, model, bOverwrite, oTargetDocument) {
			var that = this;
			if (!path) {
				throw new TypeError(this.context.i18n.getText("i18n", "Generation_generationInvalidPathError"));
			}
			if (!selectedTemplate) {
				throw new TypeError(this.context.i18n.getText("i18n", "Generation_generationNoTemplateSelectedError"));
			}
			that._registerHandlebarsHelperMethods();
			var oFinalZip = new JSZip();
			return this._oTemplateService.getAllRequiredTemplates(selectedTemplate).then(
				function(aAllRequiredTemplates) {
					var aLoadTemplateFiles = [];
					for (var i = 0; i < aAllRequiredTemplates.length; i++) {
						var oRequiredTemplate = aAllRequiredTemplates[i];
						if (oRequiredTemplate.getFileName()) {
							// generate only templates with zip files
							var sRelPath = oRequiredTemplate.getPath() + "/" + oRequiredTemplate.getFileName();
							aLoadTemplateFiles.push(that._getZipBlobFromPlugin(oRequiredTemplate._oProxy._sName, sRelPath));
						}

					}
					return Q.all(aLoadTemplateFiles).spread(function() {
						var aGenerateZips = [];
						for (var j = 0; j < arguments.length; j++) {
							var blob = arguments[j];
							aGenerateZips.push(that._generateSingleZip(blob, selectedTemplate, model));
						}

						return Q.all(aGenerateZips).spread(function() {
							//	var oFinalZip = new JSZip();
							for (var i = 0; i < arguments.length; i++) {
								var resultContent = arguments[i].generate();
								oFinalZip.load(resultContent, {
									base64: true
								});
							}

							var aXMLTemplateViews = [];
							aXMLTemplateViews.push(that._generateXMLTemplateViews(oFinalZip, model));
							return Q.all(aXMLTemplateViews).fin(function() {
								that._oMockFileLoader.stopMock().done();
							});
						});
					}).then(
						function() {
							// After generating all zip files:
							// Complete the flow for the selected template (note that it might not contain a zip file)
							if (!selectedTemplate.getFileName()) {
								oFinalZip = null;
							}
							return selectedTemplate.onAfterGenerate(oFinalZip, model).spread(
								function(oFinalZipAfterGenerate, model) {
									if (oFinalZipAfterGenerate) {
										// Goes over all templates files and beatify them according to supported type,
										// using beautifierProcessor service
										return that._beautifyZipFiles(oFinalZipAfterGenerate,selectedTemplate.getBeautifyFilesFlag() ).then(
											function(oFinalBeautifiedZip) {
												return that._updateWorkspace(oFinalBeautifiedZip, path, bOverwrite,
													selectedTemplate, oTargetDocument).then(
													function() {
														that.context.service.repositorybrowser.setSelection(
															oTargetDocument, true).done();
														return that._fireGenerated(model, path, selectedTemplate,
															oTargetDocument);
													});
											});
									} else {
										return that._addTemplateInfoToSettings(selectedTemplate, oTargetDocument).then(
											function() {
												return that._addProjectTypeToSettings(selectedTemplate, oTargetDocument)
													.then(
														function() {
															that.context.service.repositorybrowser.setSelection(
																oTargetDocument, true).done();
															return that._fireGenerated(model, path,
																selectedTemplate, oTargetDocument);
														});
											});
									}
								});
						});
				});
		},

		_fireGenerated: function(model, path, selectedTemplate, oTargetDocument) {
			var oModel = {};
			jQuery.extend(true, oModel, model);
			var that =this;
			return this.context.event.fireGenerated({
				path: path,
				selectedTemplate: selectedTemplate,
				model: oModel,
				targetDocument: oTargetDocument
			}).fail(function(oError){
				//Note: this hides error pop ups from user
				that.context.service.log.error("Generation", oError.message, ["user"]).done();
				console.error(oError);
			});
		},

		_beautifyZipFiles: function(oFinalZip,beautifyFilesFlag) {
			//if this plugin requires not to beautify the files return current zip
			if(!beautifyFilesFlag) { return Q(oFinalZip);} 
			var files = oFinalZip.files;
			// List of file objects which contain file name, content and extenstion
			var filesNamesToBeautify = [];
			var beautifyProms = [];

			// Builds list of promises to check which file in the zip should be passed the beautifier,
			// using its file extension
			for (var file in files) {
				if (files.hasOwnProperty(file)) {
					var name = null;
					if (!this._isDir(files[file])) { //not a directory
						name = file.split("/")[file.split("/").length - 1];
						var fileExtension = this._getFileExtension(name);
						var that = this;
						// Checks if the type can be beautified
						if (_.includes(this._aBeautifiedExtentions, fileExtension)) {
							filesNamesToBeautify.push(file);
							beautifyProms
								.push(that.context.service.beautifierProcessor.beautify(files[file].asText(), fileExtension, null));
						}
					}
				}
			}

			// Trigger the beautify promises and update the beautified content in the origin zip file
			return Q.all(beautifyProms).then(function(aResults) {
				var iResultLength = aResults.length;
				for (var i = 0; i < iResultLength; i++) {
					var sFileName = filesNamesToBeautify[i];
					var sContent = aResults[i];
					oFinalZip.file(sFileName, sContent);
				}
				return oFinalZip;
			});
		},

		_updateWorkspace: function(oFinalZip, path, bOvveride, selectedTemplate, oTargetDocument) {
			var finalResultContent = oFinalZip.generate();
			var blob = this._convertB64ToBinary(finalResultContent, "application/zip");
			var that = this;
			return this._oFileService.getDocument(path).then(function(result1) {
				if (result1) {
					return result1.importZip(blob, bOvveride).then(function() {
						return that._addTemplateInfoToSettings(selectedTemplate, oTargetDocument).then(function() {
							return that._addProjectTypeToSettings(selectedTemplate, oTargetDocument);
						});
					});
				}
			});
		},

		_generateSingleZip: function(blob, selectedTemplate, model) {
			var that = this;
			var oDeferred = Q.defer();
			if (blob) {
				var reader = new FileReader();
				reader.onload = function(e) {

					var zip = new JSZip(e.target.result);
					selectedTemplate.onBeforeTemplateGenerate(zip, model).spread(function(zip, model) {
						if (model.selectedTemplate) {
							that._registerModulePath(model);
							that._requiredModules(model);
						}
						that._generateZipWithModel(that, zip, oDeferred, model);
					}).fail(function(sError) {
						oDeferred.reject(sError);
					});
				};
				reader.readAsArrayBuffer(blob);
			} else {
				oDeferred.reject();
			}
			return oDeferred.promise;
		},

		_registerModulePath: function(model) {
			var aRequiredModulePaths = model.selectedTemplate.getRequiredModulePaths();
			if (aRequiredModulePaths) {
				var oJsonModel = new sap.ui.model.json.JSONModel(model);
				for (var k = 0; k < aRequiredModulePaths.length; k++) {
					var sModuleName = aRequiredModulePaths[k].moduleName;
					var sModulePath = aRequiredModulePaths[k].path;
					jQuery.sap.registerModulePath(this._replaceWithValueFromModel(sModuleName, oJsonModel), this
						._replaceWithValueFromModel(sModulePath, oJsonModel));
				}
			}
		},

		_replaceWithValueFromModel: function(sSource, model) {
			var iIndexOfStartCurlyBracket = sSource.indexOf("{");
			var iIndexOfEndCurlyBracket = sSource.indexOf("}");
			if (iIndexOfStartCurlyBracket !== -1 && iIndexOfEndCurlyBracket > iIndexOfStartCurlyBracket) {
				var sModelExpression = sSource.substring(iIndexOfStartCurlyBracket + 1, iIndexOfEndCurlyBracket);
				var sModelExpressionPath = "/" + sModelExpression.replace(/\./g, "/");
				var sModelExpressionValue = model.getProperty(sModelExpressionPath);
				return sSource.replace("{" + sModelExpression + "}", sModelExpressionValue);
			}
			return sSource;
		},

		_requiredModules: function(model) {
			var aRequiredModules = model.selectedTemplate.getRequiredModules();
			if (aRequiredModules) {
				for (var k = 0; k < aRequiredModules.length; k++) {
					jQuery.sap.require(aRequiredModules[k]);
				}
			}
		},

		_generateZipWithModel: function(that, zip, oDeferred, model) {
			var resultZip = new JSZip();
			var templateExtenstion = ".tmpl";
			for (var file in zip.files) {
				var fileFullName = zip.files[file].name;
				if (fileFullName.indexOf("/", fileFullName.length - 1) !== -1) { // handle create folder inside zip
					resultZip.folder(fileFullName);
				} else { // handle create files in zip

					// add static files as-is
					if (fileFullName.indexOf(templateExtenstion, fileFullName.length - templateExtenstion.length) === -1) {
						if (that._isBinary(fileFullName)) {
							var data = btoa(zip.files[file].asBinary());
							resultZip.file(fileFullName, data, {
								base64: true
							});
						} else {
							resultZip.file(fileFullName, zip.files[file].asText());
						}
					} else {
						// generate templates and add to zip
						var fileName = fileFullName.split(templateExtenstion)[0];
						var compiledTemplate = Handlebars.compile(zip.files[file].asText());
						var generatedTemplate = compiledTemplate(model);
						resultZip.file(fileName, generatedTemplate);
					}
				}
			}
			oDeferred.resolve(resultZip);
		},

		_preProcessFiles: function(oZip, oFile, mSettings) {
			var oViewContent = jQuery.sap.parseXML(oFile.asText());
		
			// for snapshot version use following
			
			var oViewInfo = {
				"caller": "Generation Service",
				// "componentId": "__component0",
				// "id": "aa::sap.suite.ui.generic.template.ListReport.view.ListReport::SEPMRA_C_PD_Product",
				// "name": "sap.suite.ui.generic.template.ListReport.view.ListReport",
				"sync": true
			};
			
	//		sap.ui.core.util.XMLPreprocessor.process(oViewContent.documentElement, mSettings, "Generation Service");
			 sap.ui.core.util.XMLPreprocessor.process(oViewContent.documentElement,oViewInfo , mSettings);
			var sContent = jQuery.sap.serializeXML(oViewContent);
			oZip.file(oFile.name, sContent);
		},

		_generateXMLTemplateViews: function(oZip, model) {
			var that = this;
			var aPromises = [];
			
			if (model.smartTemplates) {

				jQuery.sap.require("sap.ui.model.odata.AnnotationHelper");
				jQuery.sap.require("sap.ui.core.util.XMLPreprocessor");
				var oBindingContexts = {},
					oModels = {};

				if (!model.smartTemplates[0].componentName) {
					return this._oMockFileLoader.mockXMLFromZipFile(oZip).then(function() {
						// loop on views in smartTemplates
						for (var i = 0; i < model.smartTemplates.length; i++) {
							var oViewTemplate = model.smartTemplates[i];
							if (oViewTemplate.preprocess) {
								
								var sViewPath = oViewTemplate.viewPath;
								if (oViewTemplate.bindings && sViewPath) {
									aPromises.push(that._createPreprocessorsDataForView(model, oViewTemplate, oBindingContexts, oModels));
								} else {
									that.context.service.log.error("Wrong definition for smartTemplates found in model");
								}
							}
						}
						
						return Q.all(aPromises).then(function(){
							if (!jQuery.isEmptyObject(oBindingContexts) || !jQuery.isEmptyObject(oModels)) {
								// runs the preprocessors per view
								if (sViewPath.indexOf("/") === 0) {
									sViewPath = sViewPath.substring(1, sViewPath.length);
								}
								var oFile = oZip.files[sViewPath];
								if (oFile) {
									var mSettings = {
										bindingContexts: oBindingContexts,
										models: oModels
									};
									that._preProcessFiles(oZip, oFile, mSettings);
								}
							}
						});
					});
				} else {
					if (model.settingsModel) {
						var aXMLFiles = oZip.file(/xml$/g);
						for (var i = 0; i < aXMLFiles.length; i++) {
							that._preProcessFiles(oZip, aXMLFiles[i], model.settingsModel);
						}
					}
				}
			}
		},

	
		_createPreprocessorsDataForView: function(model, oViewTemplate, oBindingContexts, oModels) {

			var oMetaModel = model.metaModel;
			var aPromises = [];
			var aBinidings = [];
			var that = this;
			
			// loop on bindings of view
			for (var j = 0; j < oViewTemplate.bindings.length; j++) {

				var oBiniding = oViewTemplate.bindings[j];

				if (oBiniding.name) {

					if (oBiniding.metadataElementForBindingContext && oMetaModel) {
						aPromises.push(this._oModelHelper.getBindingContext(oBiniding.metadataElementForBindingContext, oMetaModel));
						aBinidings.push(oBiniding); // hold the binding objects.
					} else {
						var sBindingContextPath = oBiniding.bindingContext;
						this._createObjectsForSettingsModel(sBindingContextPath, oBiniding, oBindingContexts, oModels, oMetaModel);
					}
				} else {
					this.context.service.log.error("Wrong definition of biniding name");
				}
			}
			
			// return array of sBindingContextPath
			return Q.all(aPromises).then(function(aBindingContextPath) {
				for (var i = 0; i < aBindingContextPath.length; i++) {
					that._createObjectsForSettingsModel(aBindingContextPath[i], aBinidings[i], oBindingContexts, oModels, oMetaModel );
				}
			});
		},

		_createObjectsForSettingsModel : function(sBindingContextPath, oBiniding, oBindingContexts, oModels, oMetaModel){
			
			if (sBindingContextPath) {

				if (oBiniding.dataSourceModel) {
					var oDataSourceModel = new sap.ui.model.json.JSONModel();
					oDataSourceModel.setData(oBiniding.dataSourceModel.toJSONRec());
					oBindingContexts[oBiniding.name] = oDataSourceModel.createBindingContext(sBindingContextPath);
					oModels[oBiniding.name] = oDataSourceModel;
				} else if (oMetaModel) {
					// if sBindingContextPath is undefined the method will return null.
					var oMetaContext = oMetaModel.createBindingContext(sBindingContextPath);
					oBindingContexts[oBiniding.name] = oMetaContext;
					oModels[oBiniding.name] = oMetaModel;
				} else {
					this.context.service.log.error("no definition of dataSourceModel or failed to load metaModel");
				}
			} else {
				this.context.service.log
					.error("no definition of 'bindingContext' or 'metadataElementForBindingContext' found in model");
			}	
		},
		
		_registerHandlebarsHelperMethods: function() {
			// Block helper which surrounds the template inside the block with curly brackets
			Handlebars.registerHelper("addCurlyBrackets", function(options) {
				return "{" + options.fn(this) + "}";
			});
		},

		_isBinary: function(fileFullName) {

			var isBinaryFile = false;

			this._binaryFilesExtensions.forEach(function(entry) {
				if (fileFullName.toLowerCase().indexOf(entry) != -1) {
					isBinaryFile = true;
				}
			});

			return isBinaryFile;
		},

		_convertB64ToBinary: function(base64Data, contentType, sliceSize) {
			contentType = contentType || '';
			sliceSize = sliceSize || 1024;

			function charCodeFromCharacter(c) {
				return c.charCodeAt(0);
			}

			var byteCharacters = atob(base64Data);
			var byteArrays = [];

			for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
				var slice = byteCharacters.slice(offset, offset + sliceSize);
				var byteNumbers = Array.prototype.map.call(slice, charCodeFromCharacter);
				var byteArray = new Uint8Array(byteNumbers);

				byteArrays.push(byteArray);
			}

			var blob = new Blob(byteArrays, {
				type: contentType
			});
			return blob;
		},

		_addTemplateInfoToSettings: function(selectedTemplate, oTargetDocument) {
			var oProject = this.context.service.setting.project;
			var oGeneration = this.context.self;
			return oProject.get(this.context.service.generation, oTargetDocument).then(function(mSettings) {
				var oSettings = new Array();
				if (mSettings) {
					if (Object.prototype.toString.call(mSettings) === '[object Array]') {
						oSettings = mSettings;
					} else {
						//migrate to Array
						oSettings.push(mSettings);
					}
				}
				var oSetting = _.find(mSettings, function(oSettingEntry) {
					return oSettingEntry.templateId === selectedTemplate.getId();
				});
				if (!oSetting) {
					oSetting = {};
					oSettings.push(oSetting);
				}
				var dateTimeStamp = new Date();
				oSetting.templateId = selectedTemplate.getId();
				oSetting.templateVersion = selectedTemplate.getVersion();
				oSetting.dateTimeStamp = dateTimeStamp.toUTCString();
				return oProject.set(oGeneration, oSettings, oTargetDocument);
			});
		},

		//adds supportedProjects from template to project settings only when template is of type project
		_addProjectTypeToSettings: function(oSelectedTemplate, oTargetDocument) {
			// if (oSelectedTemplate.getType() === "project") {
			// 	var aSupportProjectTypes = oSelectedTemplate.getSupportedProjectTypes();
			// 	if (aSupportProjectTypes && aSupportProjectTypes.length > 0) {
			// 		return this.context.service.projectType.addProjectTypes(oTargetDocument, aSupportProjectTypes);
			// 	}
			// }
			return Q();
		},

		//method changed to support only blob requests
		_getZipBlobFromPlugin: function(sPlugin, sFilePath) {
			var that = this;
			var sUrl = null;
			//check where is the plugin located
			var sPluginName = sPlugin;
			var iSplit = sPlugin.indexOf("/");
			if (iSplit > -1) {
				sPluginName = sPluginName.substring(0, iSplit);
			}

			var sRelativePath = sFilePath.substring(sFilePath.indexOf("/")); //remove the plugin folder name from path
			sUrl = require.toUrl(sPluginName + sRelativePath);

			if (!sUrl) {
				throw new Error(that.context.i18n.getText("i18n", "pluginManagement_PluginNotFound", [sPluginName]));
			}

			return Q.sap.ajax(sUrl, {
				responseType: 'blob'
			}).then(function(aResponse) {
				if (aResponse && aResponse.length > 0) {
					return aResponse[0];
				}
			}).fail(function() {
				throw new Error(that.context.i18n.getText("i18n", "pluginManagement_ResourceNotFound", [sFilePath, sPluginName]));
			});
		},

		_isDir: function(resource) {
			var isDirByName = _.endsWith(resource.name, "/");
			if (resource.options.dir || isDirByName) {
				return true;
			}
			return false;
		},

		_getFileExtension: function(name) {
			var sExtension = "";
			var index = name.lastIndexOf(".");
			if (index > 0) {
				sExtension = name.substr(index + 1);
			}
			return sExtension.toLowerCase();
		},

		_populateBeautifiedExtentions: function() {
			var that = this;
			return this.context.service.beautifierProcessor.getBeautifiedExtentions().then(function(aExtentions) {
				that._aBeautifiedExtentions = aExtentions;
			});
		}
	};

});