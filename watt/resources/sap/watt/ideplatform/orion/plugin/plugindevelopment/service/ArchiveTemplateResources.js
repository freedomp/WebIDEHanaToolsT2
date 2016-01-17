define({

	_sProjectFolderPath : null,

	/**
	 * Archives the template resources to zip file
	 * @param {string}		sProjectFolderPath		the project path to be archive
	 * @throws archive_template_resources_invalid_plugin
	 */
	createArchive : function(sProjectFolderPath) {
		var that = this;
		this._sProjectFolderPath = sProjectFolderPath;
		
		var oDocumentProvider = this.context.service.filesystem.documentProvider;

		return oDocumentProvider.getDocument(sProjectFolderPath + "/plugin.json").then(function(oPluginDocument) {

			if (oPluginDocument && oPluginDocument.getType() === "file") {
				var aPromises = [];

				return oPluginDocument.getContent().then(function(oContent) {
					var oContentData = JSON.parse(oContent);

					if (oContentData.configures && oContentData.configures.services) {
						var aTemplates = oContentData.configures.services["template:templates"];
						if (aTemplates) {
							for ( var i = 0; i < aTemplates.length; i++) {
								aPromises.push(that._archiveAndImportResourcesZipFileForTemplate(aTemplates[i]));
							}
						}

						return Q.all(aPromises).then(function(aResourcesFolder) {
							for ( var i = 0; i < aResourcesFolder.length; i++) {
								if (aResourcesFolder[i]) {
									var oEntity = aResourcesFolder[i].getEntity();
									var sTemplate = oEntity.getParentPath().substring(oEntity.getParentPath().lastIndexOf("/") + 1);
									var sMsg = "Successfully created the " + oEntity.getName() + " file for template: " + that._sProjectFolderPath + "/"+ sTemplate;
									that._printToConsoleLog("info", sMsg);
								}
							}
						}, function(oError) {
							that._printToConsoleLog("error", oError.message);
							throw new Error(oError);
						});
					} else {
						that._printToConsoleLog("info", "No templates to archive");
					}
				});
			} else {
				// failed to get the plugin.json document.
				throw new Error(that.context.i18n.getText("archive_template_resources_invalid_plugin", [sProjectFolderPath + "/plugin.json"]));
			}
		});
	},

	_printToConsoleLog : function(sSeverity, sMessage) {

		if (sSeverity === "error") {
			this.context.service.log.error("Archive Templates", sMessage, [ "user" ]).done();
		} else if (sSeverity === "info") {
			this.context.service.log.info("Archive Templates", sMessage, [ "user" ]).done();
		}
	},
	
	_archiveAndImportResourcesZipFileForTemplate : function(oTemplate){
			
		var that = this;
		return this._createResourcesZipFileForTemplate(oTemplate).then(function(oTemplateResourcesWithBlobs){
			if (oTemplateResourcesWithBlobs){
				return that._importResourcesZipFile(oTemplateResourcesWithBlobs);
			}
		});
	},

	
	onAfterGeneration : function(oEvent) {
		var that = this;
		var oModel = oEvent.params.model;

		if (oModel.template !== undefined) {
			var sTemplateName = oModel.template.technicalname;
			var sPath = oEvent.params.path;
			var sTemplatePath = sPath + "/" + sTemplateName;

			var oExistingTemplate = oModel.template.selectedTemplateToExtend;
			if (oExistingTemplate) {
				if (oExistingTemplate.getFileName()) {
					var sTemplateClassFullName = oExistingTemplate.getTemplateClass().getProxyMetadata().getName();
					var sExistingResPath = oExistingTemplate.getPath() + "/" + oExistingTemplate.getFileName();
					return that.context.service.pluginmanagement.getPluginFile(sTemplateClassFullName, sExistingResPath, true).then(
							function(oExistingResourcesBlob) {
								return that.context.service.filesystem.documentProvider.getDocument(sTemplatePath).then(
										function(oTemplateDocument) {
											return oTemplateDocument.importFile(oExistingResourcesBlob, false, true, "resources.zip");
										});
							});
				} else {
					return Q(); //resolve without loading any resources
				}
			} else {
				return this.createArchive(sPath);
			}
		}
	},

	_createResourcesZipFileForTemplate : function(oTemplate) {
		
		var iLastIndex = this._sProjectFolderPath.lastIndexOf("/");
		var sPath = this._sProjectFolderPath.substring(0, iLastIndex) + "/" + oTemplate.path;
		
		var sResourcesPath = sPath + "/resources";
		var oDocumentProvider = this.context.service.filesystem.documentProvider;

		return oDocumentProvider.getDocument(sResourcesPath).then(function(oResourcesDoc) {
			if (oResourcesDoc) {
				if (oResourcesDoc.getType() === "folder") {
					return oResourcesDoc.getCurrentMetadata().then(function(aMetadataContent) {
						if ((!aMetadataContent) || aMetadataContent.length === 0) {
							// resources empty - do nothing
							return false;
						} else {
							return oResourcesDoc.exportZip().then(function(oBlob){							
								return {
									"blob" : oBlob,
									"template" : oTemplate
								};
							});			
						}
					}).fail(function(oError) {
						// resources empty - do nothing
						return false;
					});
				} else {
					// resources folder not exists - do nothing
					return false;
				}
			}
		}).fail(function(oError) {
			// resources not exists - do nothing
			return false;
		});
	},

	_importResourcesZipFile : function(aTemplateWithBlob){

		var oBlob = aTemplateWithBlob.blob;
		var oTemplate = aTemplateWithBlob.template;
		var sDestinationZip = oTemplate.fileName;
		
		if (!sDestinationZip) {
			sDestinationZip = "resources.zip";
		}

		var oDocumentProvider = this.context.service.filesystem.documentProvider;
		var iLastIndex = this._sProjectFolderPath.lastIndexOf("/");
		var sPath = this._sProjectFolderPath.substring(0, iLastIndex) + "/" + oTemplate.path;
		
		return oDocumentProvider.getDocument(sPath).then(function(oTemplateDoc) {
			var sFilePath = sPath + "/" + sDestinationZip;
			return oDocumentProvider.getDocument(sFilePath).then(function(oZipResDoc) {
				if (oZipResDoc) {	
					return oZipResDoc.delete();
				}
			}).then(function() {
				return oTemplateDoc.importFile(oBlob, false, true, sDestinationZip);
			});

		});
	},
	
	_loadResourcesDataToZipFile : function(blob, oTemplateResourcesFolder, sResourcesFileName) {
		var oDeferred = Q.defer();
		if (blob) {
			var reader = new FileReader();
			reader.onload = function(e) {
				oTemplateResourcesFolder.file(sResourcesFileName, e.target.result, {
					binary : true
				});
				oDeferred.resolve();
			};
			reader.readAsArrayBuffer(blob);
		} else {
			oDeferred.reject(this.context.i18n.getText("i18n", "archive_template_resources_read_error_msg")); //TODO review string
		}
		return oDeferred.promise;
	},
	
	onBeforeExportZip : function(oEvent) {
	
		var that = this;
		var aPromises = [];

		if (oEvent.params.zip.files !== undefined) {

			var oPluginZip = oEvent.params.zip.files["plugin.json"];

			if (oPluginZip !== undefined) {
				this._sProjectFolderPath = oEvent.params.fullPath;
				var oContentData = JSON.parse(oPluginZip.asText());

				if (oContentData.configures && oContentData.configures.services) {
					var aTemplates = oContentData.configures.services["template:templates"];
					if (aTemplates) {
						for ( var i = 0; i < aTemplates.length; i++) {
							aPromises.push(that._createResourcesZipFileForTemplate(aTemplates[i]));
						}
					}
					return Q.all(aPromises).then(function(aTemplateResourcesWithBlobs) {
						var aResourcesContentPromises = [];
						var aBlobResources = [];
					
						for ( var i = 0; i < aTemplateResourcesWithBlobs.length; i++) {
							if (aTemplateResourcesWithBlobs[i]) {
								aResourcesContentPromises.push(that._importResourcesZipFile(aTemplateResourcesWithBlobs[i]));
								aBlobResources.push(aTemplateResourcesWithBlobs[i].blob);
							}
						}

						return Q.all(aResourcesContentPromises).then(function(aResourcesContent) {
							
							var aResourceZipFilesPromises = [];
							for ( var i = 0; i < aResourcesContent.length; i++) {
								var oBlobResources = aBlobResources[i];
								var sResZip = aResourcesContent[i].getEntity().getName();
								var sPath = aResourcesContent[i].getEntity().getParentPath();
								sPath = sPath.substring(sPath.lastIndexOf("/") + 1);
								
								aResourceZipFilesPromises.push(that._loadResourcesDataToZipFile(oBlobResources, oEvent.params.zip, sPath + "/" + sResZip));
							}
							
							return Q.all(aResourceZipFilesPromises);
						});	
						
					}, function(oError) {
						that._printToConsoleLog("error", oError.message);
						throw new Error(oError);
					});
				}
			}
		}
	}
});