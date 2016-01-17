define(["sap/watt/lib/lodash/lodash"],
	function(_) {
		"use strict";

		return {

			METADATA_FILE_NAME: "metadata.xml",
			WEBAPP_FOLDER_NAME: "webapp",
			MODEL_FOLDER_NAME: "model",
			LOCALSERVICE_FOLDER_NAME: "localService",
			WEBAPP_LOCALSERVICE_FOLDER_NAME: "webapp/localService",
			_oUpdateAnnotationsQueue : new Q.sap.Queue(),

			onAfterGenerate: function(oEvent) {
				var model = oEvent.params.model;
				var oConnectionData = model.connectionData;
				var sWebappPath = "";
				var oParentDocumentPromise = null;

				// for old structure of Fiori applications the model folder was under the webapp path.
				if (oEvent.params.model.webappPath) {
					sWebappPath = oEvent.params.model.webappPath;
					oParentDocumentPromise = this.context.service.filesystem.documentProvider.getDocument(oEvent.params.targetDocument
							.getEntity().getFullPath() + "/" + sWebappPath);
				} else {
					if (model.componentPath) {
						// create the metadata file under the parent project folder
						var aParts = model.componentPath.split("/");
						var sProjectFolderPath = "/" + aParts[1];
						oParentDocumentPromise = this.context.service.filesystem.documentProvider.getDocument(sProjectFolderPath);
					} else {
						oParentDocumentPromise = Q(oEvent.params.targetDocument);
					}

				}

				var that = this;

				return oParentDocumentPromise.then(
					function(oParentDocumet) {
						if (oConnectionData) {
							var sServiceName = model.componentPath ? model.connectionData.serviceName : "";
							var sMetadataPath = model.connectionData.metadataPath;

							return that.updateMetadataXml(oParentDocumet, oConnectionData.metadataContent, sServiceName, sMetadataPath)
								.then(function() {
									// TODO: Workaround - should be in generation - placed here because of race condition
									// with metadata.xml
									that._addTemplateInfoToAppDescriptor(oEvent).done();
									if (model.annotationsXML || model.annotations) {
										return that._generateAnnotationFiles(oParentDocumet, model, sMetadataPath);
									}
								});
						} else if (model.annotationsXML || model.annotations) {
							// TODO: Workaround - should be in generation - placed here because of race condition
							// with metadata.xml
							that._addTemplateInfoToAppDescriptor(oEvent).done();
							return that._generateAnnotationFiles(oParentDocumet, model, sMetadataPath);
						}
					}).then(function(){
						return that.context.event.fireMetadataUploaded();
					});

			},

			_generateAnnotationFiles: function(oParentDocumet, model, sMetadataPath) {
				var annotations = model.annotations;
				var that = this;
				var aPromises = [];
				if (annotations) {
					for (var i = 0; i < annotations.length; i++) {
						var sName = annotations[i].filename;
						var bGenerateInModelFolder = annotations[i].generateInModelFolder;
						var sAnnotationContent = annotations[i].content;
						var bIsLocal = (annotations[i].destination) ? false : true;
						aPromises.push(that.updateAnnotationDocument(oParentDocumet, sName,
							bGenerateInModelFolder, sAnnotationContent, sMetadataPath, bIsLocal));
					}
				}
				//for backword cometability
				var annotationsXML = model.annotationsXML;
				if (annotationsXML) {
					var sFileName = annotationsXML.filename;
					bGenerateInModelFolder = annotationsXML.generateInModelFolder;
					sAnnotationContent = annotationsXML.content;
					aPromises.push(that.updateAnnotationDocument(oParentDocumet, sFileName,
						bGenerateInModelFolder, sAnnotationContent, sMetadataPath));
				}
				return Q.all(aPromises);
			},

			_getMetaDataPathByServiceName: function(oParentDocumet, sServiceName) {
				var that = this;

				return Q.all([oParentDocumet.objectExists(this.WEBAPP_LOCALSERVICE_FOLDER_NAME), oParentDocumet.objectExists(this.LOCALSERVICE_FOLDER_NAME)]).spread(
					function(bWEBAPPExists, bDEFAULTExists) {
						if (!bWEBAPPExists && !bDEFAULTExists) { // localService not exists, then create the metadata.xml under the default folder - localService
							return that.WEBAPP_LOCALSERVICE_FOLDER_NAME;
						}

						var sMDFolderName;
						if (bWEBAPPExists) { // webapp/localService exists
							sMDFolderName = that.WEBAPP_LOCALSERVICE_FOLDER_NAME;
						} else { // localService exists
							sMDFolderName = that.LOCALSERVICE_FOLDER_NAME;
						}
						var sFullPath = oParentDocumet.getEntity().getFullPath() + "/" + sMDFolderName;
						return that.context.service.filesystem.documentProvider.getDocument(sFullPath).then(function(oFolder) {
							return oFolder.getCurrentMetadata().then(function(aFolderMetadataContent) {
								var oFileMetadata = _.find(aFolderMetadataContent, function(oMetadataElement) {
									return oMetadataElement.name === that.METADATA_FILE_NAME;
								});

								if (oFileMetadata) {
									//if metadata.xml exists create new folder
									return sMDFolderName + "/" + sServiceName;
								} else {
									return sMDFolderName;
								}
							});
						});
					});
			},

			/**
			 *
			 * This method returns the metadata path, checking if Component.js refer to manifest.json,
			 * if refer and them under "webapp" folder then the method will return 'webapp/localService' folder,
			 * if refer but them do not under "webapp" folder then the method will return 'localService' folder,
			 * else will return  the 'model' folder.
			 *
			 *
			 * @Note: in case that user has been added a new oData service and Component.js refer to manifest.json then the
			 * method will return the folder with the service name --> 'localService/' + sServiceName
			 *
			 *
			 * @param oParentDocument The project parent folder document object.
			 *
			 * @param sServiceName The service name.
			 */

			getMetadataPath: function(oParentDocument, sServiceName) {
				if (oParentDocument) {
					var that = this;
					var oUI5ProjectHandler = this.context.service.ui5projecthandler;
					return oUI5ProjectHandler.isManifestProjectGuidelinesType(oParentDocument).
						then(function(isManifestProjectGuidelinesType) {
							if (isManifestProjectGuidelinesType) {
								// in case of new component
								if (sServiceName) {
									return that._getMetaDataPathByServiceName(oParentDocument, sServiceName).then(function(sPath) {
										return sPath;
									});
								} else { // Checks whether webapp exist and manifest under it
									// (assumes the component is next to the manifest file)
									return oUI5ProjectHandler.getHandlerFilePath(oParentDocument).
										then(function(sManifestParentPath) {
											if (sManifestParentPath) {
												var iManifestParentPathLen = sManifestParentPath.length;
												var iWebappLen = "/webapp".length;
												var bWebappIsManifestParent = sManifestParentPath.indexOf("/webapp",
														iManifestParentPathLen - iWebappLen) > -1;
												if (bWebappIsManifestParent) {
													return that.WEBAPP_LOCALSERVICE_FOLDER_NAME;
												} else {
													return that.LOCALSERVICE_FOLDER_NAME;
												}
											}
										});
								}
							}
							// if manifest doesn't exist or webapp is exist but without component & manifest under it
							// or if component.js doesn't refer to manifest:
							// try to find if webapp/localService already exists (even when no manifest in the project).
							// If so - use it. If not - fallback to 'model' folder
							return oParentDocument.objectExists(that.WEBAPP_FOLDER_NAME).then(function(bWebappFolderExists) {
								if (bWebappFolderExists) {
									return oParentDocument.objectExists(that.LOCALSERVICE_FOLDER_NAME).then(function(bLocalServiceFolderExists) {
										if (bLocalServiceFolderExists) {
											return that.WEBAPP_LOCALSERVICE_FOLDER_NAME;
										} else {
											return that.WEBAPP_FOLDER_NAME + "/" + that.MODEL_FOLDER_NAME;
										}
									});

								} else {
									return that.MODEL_FOLDER_NAME;
								}
							});
							/*
							 return oParentDocument.objectExists(that.WEBAPP_FOLDER_NAME + "/" + that.LOCALSERVICE_FOLDER_NAME).then(function(bWebappMDFolderExists) {
							 if (bWebappMDFolderExists) {
							 return that.WEBAPP_FOLDER_NAME + "/" + that.LOCALSERVICE_FOLDER_NAME;
							 } else {
							 return that.MODEL_FOLDER_NAME;
							 }
							 });*/
						}).fail(function() {
							return that.MODEL_FOLDER_NAME;
						});
				}
			},

			/**
			 *
			 * This method returns the metadata.xml file documents (in 'model' folder or 'localService' folder)
			 * under the given project document.
			 *
			 *
			 * @Note: in case that Component.js refer to manifest.json, the method will return the metadata file that located in
			 * /localService folder otherwise returns the metadata under model folder
			 *
			 *
			 * @param oParentDocument The project parent folder document object.
			 *
			 */
			getMetadataDocuments: function(oParentDocument) {
				if (oParentDocument) {
					var that = this;
					return that.getMetadataPath(oParentDocument).then(function(sPath) {
						return oParentDocument.getCurrentMetadata(true).then(function(aMetadataContent) {
							var metadataDocPromises = [];

							for (var i = 0; i < aMetadataContent.length; i++) {
								var oMetadataElement = aMetadataContent[i];

								if (!oMetadataElement.folder) {

									var filePath = oMetadataElement.path;

									// get index of /model/metadata.xml
									var metadataIndex = filePath.indexOf("/" + sPath + "/" + that.METADATA_FILE_NAME);
									if (metadataIndex !== -1) { // if /model/metadata.xml found in the file path add document to array
										metadataDocPromises.push(that.context.service.filesystem.documentProvider.getDocument(filePath));
									}
								}
							}

							return Q.all(metadataDocPromises);
						});
					});
				}

				return [];
			},

			_getMetadataFolderObject: function(bFolderExist, oParentDocumet, sPath) {
				if (!bFolderExist) {
					var aFolderNames = sPath.split("/");
					return this._createDestinationFolder(oParentDocumet, 0, aFolderNames);
				} else {
					return this.context.service.filesystem.documentProvider.getDocument(oParentDocumet.getEntity().getFullPath() + "/" + sPath);
				}
			},

			_createDestinationFolder: function(oParentDocument, i, aFolderNames) {
				var that = this;
				var sFolderName = aFolderNames[i];

				return this._getFolderByName(oParentDocument, sFolderName).then(function(oDocument) {
					if (i < aFolderNames.length - 1) {
						return that._createDestinationFolder(oDocument, ++i, aFolderNames);
					}

					return oDocument;
				});
			},

			_getFolderByName: function(oParentDocument, sFolderName) {
				var sDocumentPath = oParentDocument.getEntity().getFullPath() + "/" + sFolderName;
				return this.context.service.document.getDocumentByPath(sDocumentPath).then(function(oDocument) {
					if (oDocument) {
						return oDocument;
					}

					return oParentDocument.createFolder(sFolderName);
				});
			},

			_createFileInLocation: function(oParentDocumet, sPath, sData) {
				var that = this;
				return oParentDocumet.objectExists(sPath).then(function(bObjectExists) {
					return that._getMetadataFolderObject(!!bObjectExists, oParentDocumet, sPath).then(function(oFolderDocument) {
						return oFolderDocument.importFile(new Blob([sData]), false, true, that.METADATA_FILE_NAME);
					});
				});
			},

			/**
			 *
			 * This method updates the metadata under the given document. If the file doesn't exist, creates new file
			 * under the selected metadata path with the given content.
			 *
			 * @note in case that metadata path is empty then creates the file under the default path ('model' or 'localService').
			 *
			 *
			 * @param oParentDocumet The project parent folder document object.
			 *
			 * @param sMetadataContent The metadata content of the file that will be created.
			 *
			 * @param sServiceName The service name.
			 *
			 * @param sMetadataPath The selected metadata path.
			 */

			updateMetadataXml: function(oParentDocumet, sMetadataContent, sServiceName, sMetadataPath) {
				if (oParentDocumet && sMetadataContent) {
					var that = this;

					return Q.sap.require("sap/watt/lib/beautifiers/xml/vkbeautify").then(function(vkbeautify) {
						var sBeautifyData = vkbeautify.xml(sMetadataContent);
						if (!sMetadataPath) {
							return that.getMetadataPath(oParentDocumet, sServiceName).then(function(sPath) {
								return that._createFileInLocation(oParentDocumet, sPath, sBeautifyData);
							});
						} else {
							return that._createFileInLocation(oParentDocumet, sMetadataPath, sBeautifyData);
						}
					});
				}
			},

			_fnGenerateAnnotationFile: function(oProjectDocument, sFileName, sContent) {
				return oProjectDocument.createFile(sFileName).then(function(oFileDocument) {
					return oFileDocument.setContent(sContent).then(function() {
						return oFileDocument.save();
					});
				});

			},

			_createAnnotationFileInLocation: function(oProjectDocument, sPath, sFileName, sData) {
				var that = this;
				return this._oUpdateAnnotationsQueue.next(function(){
					return oProjectDocument.objectExists(sPath).then(function(bObjectExists) {
						return that._getMetadataFolderObject(bObjectExists, oProjectDocument, sPath).then(function(oFolderDocument) {
							return that._fnGenerateAnnotationFile(oFolderDocument, sFileName, sData);
						});
					});
				});
			},

			/**
			 *
			 * This method creates the annotation file under the given document. in the model or root folder
			 *
			 * @param oParentDocument The project parent folder document object.
			 *
			 * @param sFileName the name of the annotation file that will be created.
			 *
			 * @param sContent The annotation content of the file that will be created.
			 *
			 * @param sMetadataPath The selected metadata path.
			 *
			 * @param bIsLocal If the annotation file is remote or local
			 */
			updateAnnotationDocument: function(oProjectDocument, sFileName, bGenerateInModelFolder, sContent, sMetadataPath, bIsLocal) {
				var that = this;
				if (oProjectDocument && sContent && sFileName) {
					return Q.sap.require("sap/watt/lib/beautifiers/xml/vkbeautify").then(function(vkbeautify) {
						var sBeautifyData = vkbeautify.xml(sContent);
						if (bGenerateInModelFolder) {
							if (!sMetadataPath) {
								var oAnnotationsPathPromise = Q();
								if (bIsLocal) {
									oAnnotationsPathPromise = that._getLocalAnnotationsFolderLocation(oProjectDocument);
								} else {
									oAnnotationsPathPromise = that.getMetadataPath(oProjectDocument);
								}
								return oAnnotationsPathPromise.then(function(sPath) {
									return that._createAnnotationFileInLocation(oProjectDocument, sPath, sFileName, sBeautifyData);
								});
							} else {
								return that._createAnnotationFileInLocation(oProjectDocument, sMetadataPath, sFileName, sBeautifyData);
							}
						} else {
							return that._fnGenerateAnnotationFile(oProjectDocument, sFileName, sBeautifyData);
						}
					});
				}

			},

			_getLocalAnnotationsFolderLocation: function(oParentDocumet) {
				var sWebappFolder = "webapp";
				var sAnnotationsFolder = "annotations";
				return oParentDocumet.objectExists(sWebappFolder).then(function(bExists) {
					if (bExists) {
						return sWebappFolder + "/" + sAnnotationsFolder;
					} else {
						return sAnnotationsFolder;
					}
				});
			},

			_addTemplateInfoToAppDescriptor: function(oEvent) {
				var oUI5ProjectHandler = this.context.service.ui5projecthandler;
				if (oEvent && oEvent.params && oEvent.params.selectedTemplate && oEvent.params.targetDocument) {
					var oSelectedTemplate = oEvent.params.selectedTemplate;
					var oTargetDocument = oEvent.params.targetDocument;
					var oSourceTemplateContent = {
						"id": oSelectedTemplate.getId(),
						"version": oSelectedTemplate.getVersion()
					};
					return oUI5ProjectHandler.addSourceTemplate(oTargetDocument, oSourceTemplateContent, true).
						then(function(bSuccess) {
							return bSuccess;

						}).fail(function(oError) {
							if (oError && oError.name === "FileDoesNotExist") {
								return false;
							}
						});
				}
				return Q();
			}

		};
	});