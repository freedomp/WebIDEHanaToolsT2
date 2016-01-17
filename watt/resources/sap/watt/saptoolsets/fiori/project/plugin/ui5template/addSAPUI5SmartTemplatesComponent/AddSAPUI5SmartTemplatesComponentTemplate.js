define(["sap/watt/lib/lodash/lodash"], function(_) {
	"use strict";

	return {
		_callAjax: function(sUrl, sType, sDataType, sFileName) {
			var that = this;

			var mOptions = {
				type: sType,
				data: null,
				dataType: sDataType
			};

			return Q.sap.ajax(sUrl, mOptions).then(function(aResponse) {
				if (aResponse && aResponse.length > 0) {
					return aResponse[0];
				}
			}).fail(function(oError) {
				if (oError.statusText === "Not Found") {
					that.context.service.log.error("Failed to receive a file", that.context.i18n.getText("i18n", "Failed_receive_file", [sFileName]), [
						"user"
					]).done();
				} else {
					that.context.service.log.error(oError.message).done();
				}
			});
		},

		onBeforeTemplateCustomizationLoaded: function(wizardModel, templateModel) {

			var that = this;
			var sPath = wizardModel.oData.componentPath;

			return this.context.service.filesystem.documentProvider.getDocument(sPath).then(function(oDocument) {
				return that.context.service.ui5projecthandler.getAppNamespace(oDocument).then(function(sNameSpace) {
					templateModel.oData.addSAPUI5SmartTemplatesComponent.parameters.ProjectNamespace.defaultValue = sNameSpace;
					return that.context.service.ui5projecthandler.getDataSources(oDocument).then(function(oDataSources) {
						if (oDataSources) {
							return that._getMetadataContent(oDocument, oDataSources).then(function(oConnectionData) {
								wizardModel.oData.connectionData = oConnectionData;
								return [wizardModel, templateModel];
							});
						}
						return [wizardModel, templateModel];
					});
				});
			}).fail(function(oError) {
				that.context.service.log.info(oError.message).done();
			});
		},

		customValidation: function(model) {

			var that = this;
			return this.context.service.filesystem.documentProvider.getDocument(model.componentPath).then(function(oDocument) {
				return that.context.service.ui5projecthandler.isManifestProjectGuidelinesType(oDocument).then(function(bRes) {
					return bRes;
				});
			});
		},

		_getPathToGenerateFiles: function(sPath, sSmartTemplateName) {

			var sWebappPath = "/webapp";
			// if root project
			if (sPath.indexOf("/", 1) === -1) {
				return this.context.service.filesystem.documentProvider.getDocument(sWebappPath).then(function(oDocument) {
					if (oDocument !== undefined) { // if the webapp folder exists under the root project folder
						return sWebappPath + "/" + sSmartTemplateName; // files will generate under the webapp folder
					} else {
						return sSmartTemplateName;
					}
				});
			}
			// return the selected SmartTemplateName
			return Q(sSmartTemplateName);
		},

		configWizardSteps: function(oTemplateCustomizationStep, oAnnotationselection) {
			var oAnnotationselectionStepContent = oAnnotationselection.getStepContent();
			oAnnotationselectionStepContent.setCollectExistingAnnotations(true);
			return [oTemplateCustomizationStep, oAnnotationselection];
		},

		_updateAppDescriptor: function(oHandlerDocument, sNamespace, sSmartTemplateName, sEntitySet) {
			var that = this;

			return that.context.service.ui5projecthandler.getAttribute(oHandlerDocument, "sap.ui.generic.app").then(function(oRoutes) {
				if (oRoutes.pages && oRoutes.pages.length > 0) {
					that._updateNamespaceInAppDescriptor(oRoutes.pages[0], sNamespace, sSmartTemplateName, sEntitySet);
					return oHandlerDocument.getContent().then(function(sHandlerContent) {
						var oHandlerContent = JSON.parse(sHandlerContent);
						oHandlerContent["sap.ui.generic.app"] = oRoutes;
						sHandlerContent = JSON.stringify(oHandlerContent);
						return oHandlerDocument.setContent(sHandlerContent).then(function() {
							return oHandlerDocument.save();
						});
					});
				}
			});
		},

		_updateNamespaceInAppDescriptor: function(oPageEntity, sNamespace, sSmartTemplateName, sEntitySet) {
			var sName = oPageEntity.component.name;
			var sSmartTemplateWithEntitySet = sSmartTemplateName + "_" + sEntitySet;

			// if page as the selected entitySet and has the same component name
			if (oPageEntity.entitySet === sEntitySet && (sName.endsWith(sSmartTemplateName) || sName.endsWith(sSmartTemplateWithEntitySet))) {
				oPageEntity.component.name = sNamespace;
			}
			if (oPageEntity.pages) {
				this._updateNamespaceInAppDescriptor(oPageEntity.pages[0], sNamespace, sSmartTemplateName, sEntitySet);
			}
		},

		_getSmartTemplateNamespace: function(sComponentPath, sNamespace) {
			var iPos = sComponentPath.indexOf("/", 1);
			var sRootFolder = sComponentPath.substring(0, iPos);

			// if user select folder under the webapp folder
			if (_.startsWith(sComponentPath, sRootFolder + "/webapp/")) {
				var sNs = sComponentPath.replace(sRootFolder + "/webapp/", "");
				sNs = sNs.split("/").join(".");
				sNamespace += "." + sNs;
			}

			return sNamespace;
		},

		onBeforeTemplateGenerate: function(templateZip, model) {
			var that = this;

			var oParameters = model.addSAPUI5SmartTemplatesComponent.parameters;
			var sNamespace = oParameters.ProjectNamespace.value;
			var sSmartTemplateName = oParameters.UI5SmartTemplatesCollection.value.path;
			var sEntitySet = oParameters.UI5SmartTemplatesODataCollection.value.name;
			var sEntityType = oParameters.UI5SmartTemplatesODataCollection.value.entityType;
			var sSmartTemplateWithEntitySet = sSmartTemplateName + "_" + sEntitySet;
			var sComponentPath = model.componentPath;
			
			return this.context.service.filesystem.documentProvider.getDocument(sComponentPath).then(function(oDocument) {
				return that.context.service.ui5projecthandler.getHandlerDocument(oDocument).then(function(oHandlerDocument) {
					return that._getPathToGenerateFiles(sComponentPath, sSmartTemplateWithEntitySet).then(function(sPath) {
						sNamespace = that._getSmartTemplateNamespace(sComponentPath, sNamespace) + "." + sSmartTemplateWithEntitySet;
						return that._updateAppDescriptor(oHandlerDocument, sNamespace, sSmartTemplateName, sEntitySet).then(function() {
							return that._getSmartTemplateFiles(templateZip, sNamespace, sSmartTemplateName, sPath).then(function() {
								return that._getLibArtifacts(templateZip, sNamespace, sSmartTemplateName, sPath).then(function() {
									return that._createSettingsModelForPreProcess(oHandlerDocument, model, sNamespace, sSmartTemplateName, sEntitySet, sEntityType).then(function() {
										that._replaceNamespaceInArtifact(templateZip, sNamespace, sSmartTemplateName);
									});
								});
							});
						});
					});
				});
			}).fail(function(oError) {
				that.context.service.log.error("AddSAPUI5SmartTemplate", oError.message, ["user"]).done();
				return that._getSmartTemplateFiles(templateZip, sNamespace, sSmartTemplateName, sSmartTemplateWithEntitySet);
			});
		},
	
		_getSmartTemplatesFromModel: function(model, sSmartTemplateName) {
			for (var i in model.smartTemplates) {
				if (sSmartTemplateName === model.smartTemplates[i].componentName) {
					return model.smartTemplates[i];
				}
			}
		},
		
		_createParameterObject : function(oHandlerDocument, sNamespace, sSmartTemplateName, sEntitySet, sEntityType){
			
			var that = this;
 			var oSubPages = {};
 			
			return oHandlerDocument.getContent().then(function(sHandlerContent) {
				var oHandlerContent = JSON.parse(sHandlerContent);
				return that.context.service.ui5projecthandler.getAttribute(oHandlerDocument, "sap.ui.generic.app").then(function(oRoutes) {
					if (oRoutes.pages && oRoutes.pages.length > 0) {
						oSubPages = that._getSubPages(oRoutes.pages[0], sNamespace, sSmartTemplateName, sEntitySet);
					}
					
					return new sap.ui.model.json.JSONModel({
						entitySet: sEntitySet,
						entityType: sEntityType,
						"sap-ui-debug": false,
						isDraftEnabled: true,
						manifest : oHandlerContent,
						"settings": {
							isLeaf : false,
							subPages : oSubPages
						}
					});
				});	
			});
		},
		
		_getSubPages : function(oPageEntity, sNamespace, sSmartTemplateName, sEntitySet){
			var sName = oPageEntity.component.name;
			var sSmartTemplateWithEntitySet = sSmartTemplateName + "_" + sEntitySet;

			// if page as the selected entitySet and has the same component name
			if (oPageEntity.entitySet === sEntitySet && (_.endsWith(sName, sSmartTemplateName) || _.endsWith(sName,sSmartTemplateWithEntitySet))) {
				return oPageEntity.pages;
			}
			if (oPageEntity.pages && oPageEntity.pages.length > 0) {
				return this._getSubPages(oPageEntity.pages[0], sNamespace, sSmartTemplateName, sEntitySet);
			}	
		},
		
		_createSettingsModelForPreProcess : function(oHandlerDocument, model, sNamespace, sSmartTemplateName, sEntitySet, sEntityType){
			var oBindingContexts = {}, oModels = {};
			var oModelHelper = this.context.service.modelHelper;
			var aPromises = [];
			var aBinidingNames = [];
			var that = this;
			
			if (model.metaModel) {
				var oMetaModel = model.metaModel;
				var oSmartTemplate = this._getSmartTemplatesFromModel(model, sSmartTemplateName);
				if (oSmartTemplate) {
					for (var i = 0; i < oSmartTemplate.bindings.length; i++) {
						var oBiniding = oSmartTemplate.bindings[i];
						var name = oBiniding.name;
						aPromises.push(oModelHelper.getBindingContext(oBiniding.metadataElementForBindingContext, oMetaModel));
						aBinidingNames.push(name); // save the binding name.
						
						oModels[name] = oMetaModel;
					}
					
					return Q.all(aPromises).then(function(aBindingContextPath) {
						for (var j = 0; j < aBindingContextPath.length; j++) {
							if (aBindingContextPath[j]) {
								var oMetaContext = oMetaModel.createBindingContext(aBindingContextPath[j]);
								var sBindingName = aBinidingNames[j];
								oBindingContexts[sBindingName] = oMetaContext;
							}
						}
						
						return that._createParameterObject(oHandlerDocument, sNamespace, sSmartTemplateName, sEntitySet, sEntityType).then(function(oParameter){
					
							oModels.parameter = oParameter;
							var mSettings = {
								bindingContexts: oBindingContexts,
								models: oModels
							};
							
							model.settingsModel = mSettings;
						});
					});
				}
			}
			
			return Q();
		},
		
		_getArtifacts: function(projectZip, sNamespace, sPath, sFileName) {

			var sResourceName = "lib/" + sFileName + "-dbg.js";
			var sUrl = "/smartTemplateGeneration/" + sResourceName;
			return this._callAjax(sUrl, "GET", "text", sResourceName).then(function(sFileContent) {
				if (sFileContent) {
					sResourceName = sResourceName.replace("-dbg.", ".");

					// Remove CustomizingConfiguration patch from TemplateComponent.js UI5 lib
					if (sResourceName === "lib/TemplateComponent.js") {
						var sStartFromString = 'jQuery.sap.require("sap.ui.core.CustomizingConfiguration");';
						var sEndString = '})();';
						var iStartFromIndex = sFileContent.indexOf(sStartFromString);
						var iEndIndex = sFileContent.indexOf(sEndString) + sEndString.length;
						sFileContent = sFileContent.replace(sFileContent.substring(iStartFromIndex, iEndIndex), "");
					}

					projectZip.folder(sPath).file(sResourceName, sFileContent);
				}
			});
		},

		_getLibArtifacts: function(projectZip, sNamespace, sSmartTemplateName, sPath) {

			var that = this;
			sNamespace += ".lib.";
			var sTemplateViewController = "TemplateViewController";
			var sTemplateComponent = "TemplateComponent";

			return this._getArtifacts(projectZip, sNamespace, sPath, sTemplateViewController, sSmartTemplateName).then(function() {
				return that._getArtifacts(projectZip, sNamespace, sPath, sTemplateComponent, sSmartTemplateName);
			});
		},

		_getSmartTemplateFiles: function(projectZip, sNamespace, sSmartTemplateName, sPath) {
			var that = this;
			var sUrl = "/smartTemplateGeneration/" + sSmartTemplateName + "/resources.json";

			return this._callAjax(sUrl, "GET", "text", "resources.json").then(function(oResult) {
				if (oResult) {
					var aPromises = [];
					var aGeneratedFiles = [];
					var aSmartTemplateFiles = JSON.parse(oResult).resources;

					for (var i = 0; i < aSmartTemplateFiles.length; i++) {
						var sResourceName = aSmartTemplateFiles[i].name;
						if (!_.endsWith(sResourceName, ".js") || sResourceName.indexOf("-dbg.") > -1) {
							sUrl = "/smartTemplateGeneration/" + sSmartTemplateName + "/" + sResourceName;
							aPromises.push(that._callAjax(sUrl, "GET", "text", sResourceName));
							aGeneratedFiles.push(sResourceName);
						}
					}

					projectZip.remove("dummy.txt");
					return Q.all(aPromises).then(function(aResponse) {
						for (var j = 0; j < aResponse.length; j++) {
							if (aResponse[j]) {
								var sFileName = aGeneratedFiles[j].replace("-dbg.", ".");
								projectZip.folder(sPath).file(sFileName, aResponse[j]);
							}
						}
					});
				}
			});
		},

		_replaceNamespaceInArtifact: function(projectZip, sNamespace, sSmartTemplateName) {

			var sFileContent;
			var sLibNamespace = sNamespace + ".lib.";
			var sNamespaceWithSlash = sNamespace.split(".").join("/");
			var sNamespaceWithLibWithSlash = sLibNamespace.split(".").join("/");
	
			for (var sFileName in projectZip.files) {
				if (!projectZip.files[sFileName].options.dir) {
					sFileContent = projectZip.files[sFileName].asText();
					//replace the sap.suite.ui.generic.template.ListReport with ns.ListReport_entitySet and with /
					sFileContent = this._updateFileContent(sFileContent, sSmartTemplateName, sNamespace, sNamespaceWithSlash);
					//replace the sap.suite.ui.generic.template.lib.TemplateComponent with ns.ListReport_entitySet.lib.TemplateComponent and with /
					sFileContent = this._updateFileContent(sFileContent, "", sLibNamespace, sNamespaceWithLibWithSlash);
					projectZip.file(sFileName, sFileContent);
				}
			}
		},

		_updateFileContent : function(sFileContent, sSmartTemplateName, sNamespace, sNewNamespace){
			var sOrigNamespace, sReg;
			
			if (sSmartTemplateName){
				sOrigNamespace = "sap\\.suite\\.ui\\.generic\\.template\\." + sSmartTemplateName;
			}
			else {
				sOrigNamespace = "sap\\.suite\\.ui\\.generic\\.template\\.lib\\.";
			}
			
			sReg = new RegExp(sOrigNamespace, "gi");
			sFileContent = sFileContent.replace(sReg, sNamespace);
			
			sOrigNamespace = sOrigNamespace.split(".").join("/");
			sReg = new RegExp(sOrigNamespace, "gi");
			sFileContent = sFileContent.replace(sReg, sNewNamespace);
			
			return sFileContent;
		},
		
		_getMetadataContent: function(oDocument, oDataSources) {

			var oContext = this.context;
			return oContext.service.ui5projecthandler.getHandlerFilePath(oDocument).then(function(sHandlerPath) {
				if (sHandlerPath) {
					var sMetadataPath = sHandlerPath + "/" + oDataSources.mainService.settings.localUri;
					return oContext.service.filesystem.documentProvider.getDocument(sMetadataPath).then(function(oMdDocument) {
						if (oMdDocument) {
							return oMdDocument.getContent().then(function(sMetadataContent) {
								return oContext.service.csdlParser.parse(sMetadataContent).then(function(oAst) {
									if (!oAst) {
										throw new Error(oContext.i18n.getText("i18n", "addSAPUI5SmartTemplate_could_not_parse_file"));
									}
									return oContext.service.astLibrary.getRiverAstLibrary(oAst.response[0]).then(function(oAstASLib) {
										return {
											metadata: oAstASLib,
											url: "",
											serviceName: "",
											type: "river",
											metadataContent: sMetadataContent,
											metadataPath: undefined
										};
									});
								});
							});
						}
					});
				}
			});
		},

		onAfterGenerate: function(projectZip, model) {

			// don't generate the annotation files
			model.annotations = undefined;

			return [projectZip, model];

		},

		validateOnSelection: function() {
			return true;
		}
	};
});