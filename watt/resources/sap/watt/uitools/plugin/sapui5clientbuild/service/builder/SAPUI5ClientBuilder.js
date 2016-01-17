define(["./ResourceLocator", "./PreloadComponentCreator", "./ResourcesJsonCreator", "sap/watt/lib/lodash/lodash"],
	function(mResourceLocator, mPreloadComponentCreator, mResourcesJsonCreator, _) {
		"use strict";

		return {

			DEFAULT_TARGET_FOLDER: "dist",
			DEFAULT_SOURCE_TEST_FOLDER: "test",
			DEFAULT_TARGET_TEST_FOLDER: "test-resources",

			build: function(oTargetProjectDocument) {
				var that = this;
				return Q.spread([this.getSourceFolderPath(oTargetProjectDocument),
						this.getTargetFolderPath(oTargetProjectDocument),
						this._getBuildSettings(oTargetProjectDocument)
					],
					function(sSourceFolderPath, sTargetFolderPath, oBuildSettings) {
						return that._getSourceProjectDocument(sSourceFolderPath, oTargetProjectDocument).then(function(oSourceProjectDocument) {
							return that.context.service.ui5projecthandler.getAppNamespace(oSourceProjectDocument).then(function(sAppNamespace) {
								var oResourceLocator = new mResourceLocator.ResourceLocator(oSourceProjectDocument, that.context, sSourceFolderPath,
									sTargetFolderPath);
								var aExcludedFolders = oBuildSettings ? oBuildSettings.excludedFolders : null;
								var aExcludedFiles = oBuildSettings ? oBuildSettings.excludedFiles : null;
								var oPreloadComponentCreator = new mPreloadComponentCreator.PreloadComponentCreator(oResourceLocator, sAppNamespace,
									aExcludedFolders, aExcludedFiles);
								var oResourcesJsonCreator = new mResourcesJsonCreator.ResourcesJsonCreator(oResourceLocator, sTargetFolderPath);
								return oPreloadComponentCreator.create().then(function() {
									var aWrittenResources = oResourceLocator.getWrittenResources();
									if (sTargetFolderPath !== oSourceProjectDocument.getEntity().getFullPath()) {
										//Not a "flat" project --> target folder should be created
										return that._createTargetFolder(aWrittenResources, sSourceFolderPath, sTargetFolderPath, oSourceProjectDocument,
											oTargetProjectDocument);
									} else {
										// A "flat" project, just create component preload file
										return that._createPreloadComponent(sSourceFolderPath, sTargetFolderPath, aWrittenResources);
									}
								}).then(function() {
									return oResourcesJsonCreator.create().then(function(sResourcesJsonContent) {
										return that._createResourcesJson(sTargetFolderPath, sResourcesJsonContent).then(function() {
											/* return that.getSourceFolderFromProject(oProjectDocument).then(function(sSourceFolderFromProject) {*/
											return that._updateRelativePathsInCopiedFiles(oTargetProjectDocument, sResourcesJsonContent, sTargetFolderPath).then(
												function() {
													return oTargetProjectDocument.refresh();
												});
											/*});*/
										});
									});
								});
							});

						});
					});
			},

			getTargetFolderByProjectSettings: function(oProjectSettings) {
				if (oProjectSettings.build && oProjectSettings.build.targetFolder) {
					return oProjectSettings.build.targetFolder;
				}

				return null;
			},

			getTargetFolder: function(oProjectDocument) {
				var that = this;
				return this.getTargetFolderPath(oProjectDocument).then(function(sTargetFolderPath) {
					return that.context.service.document.getDocumentByPath(sTargetFolderPath);
				});
			},

			getSourceFolder: function(oProjectDocument) {
				var that = this;
				return this.getSourceFolderPath(oProjectDocument).then(function(sSourceFolderPath) {
					return that.context.service.document.getDocumentByPath(sSourceFolderPath);
				});
			},

			getSourceFolderPath: function(oProjectDocument) {
				var sProjectFullPath = oProjectDocument.getEntity().getFullPath();
				return this._getBuildSettings(oProjectDocument).then(function(oBuildSettings) {
					if (oBuildSettings && oBuildSettings.sourceFolder) {
						if (oBuildSettings.sourceFolder.indexOf("/") === 0) { //Full project path
							return oBuildSettings.sourceFolder;
						} else {
							return sProjectFullPath + "/" + oBuildSettings.sourceFolder;
						}
					} else {
						return sProjectFullPath;
					}
					//return oBuildSettings && oBuildSettings.sourceFolder ? sProjectFullPath + "/" + oBuildSettings.sourceFolder : sProjectFullPath;
				});
			},

			getSourceFolderFromProject: function(oProjectDocument) {
				return this._getBuildSettings(oProjectDocument).then(function(oBuildSettings) {
					return oBuildSettings && oBuildSettings.sourceFolder ? oBuildSettings.sourceFolder : "";
				});
			},

			getTargetFolderPath: function(oProjectDocument) {
				var that = this;
				return this.getSourceFolderPath(oProjectDocument).then(function(sSourceFolderPath) {
					if (oProjectDocument.getEntity().getFullPath() === sSourceFolderPath) {
						return oProjectDocument.getEntity().getFullPath();
					} else {
						return that._getTargetFolderName(oProjectDocument).then(function(sTargetFolderName) {
							if (sTargetFolderName.indexOf("/") === 0) {
								return sTargetFolderName;
							} else {
								return oProjectDocument.getEntity().getFullPath() + "/" + sTargetFolderName;
							}
						});
					}
				});
			},

			setLastBuildDateTime: function(oProjectDocument) {
				var that = this;
				return this._getBuildSettings(oProjectDocument).then(function(oBuildSettings) {
					if (!oBuildSettings) {
						oBuildSettings = {};
					}
					oBuildSettings.lastBuildDateTime = new Date().toUTCString();
					oBuildSettings.buildRequired = false;
					return that._setBuildSettings(oProjectDocument, oBuildSettings);
				});
			},

			isBuildRequired: function(oProjectDocument) {
				return this._getBuildSettings(oProjectDocument).then(function(oBuildSettings) {
					if (!oBuildSettings || oBuildSettings.buildRequired === undefined) {
						return Q(true);
					} else {
						return Q(oBuildSettings.buildRequired);
					}
				});
			},

			setIsBuildRequired: function(oEvent, oProjectDocument) {
				var that = this;
				var oDocument = oEvent.params.document;
				var sDocumentName = oDocument.getEntity().getName();
				var bIsGeneratedFile = this._isGeneratedFile(sDocumentName);
				if (sDocumentName !== ".project.json" &&
					sDocumentName !== ".user.project.json" &&
					sDocumentName !== "neo-app.json") {
					if (!bIsGeneratedFile) {
						that.getSourceFolder(oProjectDocument).then(function(oSourceFolderDocument) {
							var sDocumentFullPath = oDocument.getEntity().getFullPath();
							if (sDocumentFullPath.indexOf(oSourceFolderDocument.getEntity().getFullPath()) === 0) { //Something changed in source folder
								that._setBuildRequired(oProjectDocument, true).done();
							}
						});
					}
				}
				if (oEvent.name === "deleted") {
					that.getTargetFolderPath(oProjectDocument).then(function(sTargetFolderPath) {
						if (oDocument.getEntity().getFullPath() === sTargetFolderPath || bIsGeneratedFile) {
							that._setBuildRequired(oProjectDocument, true).done();
						}
					});
				}
			},

			_getTargetFolderName: function(oProjectDocument) {
				var that = this;
				return this._getBuildSettings(oProjectDocument).then(function(oBuildSettings) {
					if (oBuildSettings && oBuildSettings.targetFolder) { //First try to get from .project.json
						return oBuildSettings.targetFolder;
					} else { //Use default
						oBuildSettings.targetFolder = that.DEFAULT_TARGET_FOLDER;
						return that._setBuildSettings(oProjectDocument, oBuildSettings).then(function() {
							return that.DEFAULT_TARGET_FOLDER;
						});
					}
				});
			},

			_setBuildRequired: function(oProjectDocument, bRequired) {
				var that = this;
				return this._getBuildSettings(oProjectDocument).then(function(oBuildSettings) {
					if (!oBuildSettings) {
						oBuildSettings = {};
					}
					oBuildSettings.buildRequired = bRequired;
					return that._setBuildSettings(oProjectDocument, oBuildSettings);
				});
			},

			_getGeneratedFileNames: function() {
				return ["Component-preload.js", "resources.json"];
			},

			_isGeneratedFile: function(sFileName) {
				var aGeneratedFileNames = this._getGeneratedFileNames();
				var sIndex = _.findIndex(aGeneratedFileNames, function(sGeneratedFileName) {
					return sGeneratedFileName === sFileName;
				});
				return sIndex > -1 ? true : false;
			},

			_createTargetFolder: function(aWrittenResources, sSourceFolderPath, sTargetFolderPath, oSourceProjectDocument, oTargetProjectDocument) {
				var that = this;
				return this.context.service.document.getDocumentByPath(sSourceFolderPath).then(function(oSourceFolderDocument) {
					return that.context.service.document.getDocumentByPath(sTargetFolderPath).then(function(oTargetFolderDocument) {
						if (oTargetFolderDocument) { //Target folder already exists
							//Delete content from target folder
							return that._deleteTargetFolderContent(oTargetFolderDocument).then(function() {
								//Copy source to target/resources folder
								return that._copySourceToTarget(oSourceProjectDocument, oTargetProjectDocument, oSourceFolderDocument, oTargetFolderDocument,
									aWrittenResources);
							});

						} else { //Need to create target folder
							return that._getTargetFolderName(oTargetProjectDocument).then(function(sTargetFolderName) {
								return oTargetProjectDocument.createFolder(sTargetFolderName).then(function(oTargetFolderDocumentNew) {
									return that.context.service.git.setIgnore(oTargetFolderDocumentNew.getEntity()).then(function() {
										//Copy source to target/resources folder
										return that._copySourceToTarget(oSourceProjectDocument, oTargetProjectDocument, oSourceFolderDocument,
											oTargetFolderDocumentNew, aWrittenResources);
									});
								});
							});
						}
					});
				});
			},

			_copySourceToTarget: function(oSourceProjectDocument, oTargetProjectDocument, oSourceFolderDocument, oTargetFolderDocument,
				aWrittenResources) {
				var that = this;

				return this._getBuildSettings(oTargetProjectDocument).then(function(oBuildSettings) {
					var sTargetFolderName = oTargetFolderDocument.getEntity().getName();

					//Copy resources
					return that._copyFolderContent(oSourceFolderDocument, oTargetProjectDocument, sTargetFolderName).then(function() {
						var sSourceFolderPath = oSourceFolderDocument.getEntity().getFullPath();
						//var sSourceFolderRelativePath = oSourceFolderDocument.getEntity().getProjectRelativePath();
						var sTargetFolderPath = oTargetFolderDocument.getEntity().getFullPath();
						return that._createPreloadComponent(sSourceFolderPath, sTargetFolderPath, aWrittenResources).then(function() {
							//Generate runtime neo-app.json
							return that._createRuntimeNeoApp(oSourceProjectDocument, oTargetProjectDocument, oSourceFolderDocument, oTargetFolderDocument)
								.then(function() {
									//Remove excluded folders
									var aDeleteFolderPromises = [];
									var aDeleteFilePromises = [];
									if (oBuildSettings.excludedFolders) {
										(oBuildSettings.excludedFolders).forEach(function(sFolderName) {
											aDeleteFolderPromises.push(that.context.service.document.getDocumentByPath(sTargetFolderPath + "/" + sFolderName)
												.then(function(oExcludedFolderDocument) {
													if (oExcludedFolderDocument) {
														return oExcludedFolderDocument.delete();
													}
												}));
										});
									}
									//Remove excluded files
									if (oBuildSettings.excludedFiles) {
										(oBuildSettings.excludedFiles).forEach(function(sFileName) {
											aDeleteFilePromises.push(that.context.service.document.getDocumentByPath(sTargetFolderPath + "/" + sFileName)
												.then(function(oExcludedFileDocument) {
													if (oExcludedFileDocument) {
														return oExcludedFileDocument.delete();
													}
												}));
										});
									}
									if (aDeleteFilePromises.length === 0) {
										return Q.all(aDeleteFolderPromises);
									} else {
										Q.all(aDeleteFolderPromises).then(function() {
											return Q.all(aDeleteFilePromises);
										});
									}

								});
						});
					});
				});
			},

			_createRuntimeNeoApp: function(oSourceProjectDocument, oTargetProjectDocument, oSourceFolderDocument, oTargetFolderDocument) {
				var that = this;
				var sSourceFolderRelativePath = oSourceFolderDocument.getEntity().getProjectRelativePath();
				var sNeoAppPath = oSourceProjectDocument.getEntity().getFullPath() + "/neo-app.json";
				return that.context.service.filesystem.documentProvider.getDocument(sNeoAppPath)
					.then(function(oDTNeoAppDocument) {
						if (!oDTNeoAppDocument) {
							return Q;
						}
						return oDTNeoAppDocument.getContent().then(function(oContent) {
							var oJsonContent = JSON.parse(oContent);
							
							//Remove source folder in routes
							var routes = oJsonContent.routes;
							for (var index in routes) {
								//remove source folder from path
								if (routes[index].path.indexOf(sSourceFolderRelativePath) === 0) {
									routes[index].path = routes[index].path.substring(sSourceFolderRelativePath.length);
								}
							}
							
							//Remove source folder in welcome file
							var welcomeFile = oJsonContent.welcomeFile;
							if (welcomeFile){
							  if (welcomeFile.indexOf(sSourceFolderRelativePath) === 0) {
									oJsonContent.welcomeFile = welcomeFile.substring(sSourceFolderRelativePath.length);
								}	
							}
							var strContent = JSON.stringify(oJsonContent);
							return that.context.service.beautifier.beautify(strContent).then(function(sBeautifiedContent) {
								return oTargetFolderDocument.createFile("neo-app.json").then(function(oRTNeoAppDocument) {
									return oRTNeoAppDocument.setContent(sBeautifiedContent).then(function() {
										return oRTNeoAppDocument.save();
									});
								});
							});
						});
					});
			},

			_createPreloadComponent: function(sSourceFolderPath, sTargetFolderPath, aWrittenResources) {
				var that = this;
				var aPreloadCompPromises = [];
				aWrittenResources.forEach(function(oWrittenResource) {
					var sPreloadObjectPath = "/" + oWrittenResource.preloadObjectPath;
					if (sSourceFolderPath !== sTargetFolderPath) {
						sPreloadObjectPath = sPreloadObjectPath.replace(sSourceFolderPath, sTargetFolderPath);
					}
					var aPathElem = sPreloadObjectPath.split("/");
					var sFilename = aPathElem[aPathElem.length - 1];
					var sComponentPath = sPreloadObjectPath.substring(0, sPreloadObjectPath.length - (sFilename.length + 1));
					aPreloadCompPromises.push(that.context.service.document.getDocumentByPath(sComponentPath).then(function(oParentFolderDocument) {
						var sPreloadComponentPath = oParentFolderDocument.getEntity().getFullPath() + "/" + sFilename;
						return that.context.service.document.getDocumentByPath(sPreloadComponentPath).then(function(oPreloadComponentDocument) {
							var sAutoGeneratedText = that.context.i18n.getText("i18n", "builder_preloadCompAutoGeneratedText");
							oWrittenResource.preloadObjectContent = sAutoGeneratedText + oWrittenResource.preloadObjectContent;
							if (oPreloadComponentDocument) {
								return oPreloadComponentDocument.setContent(oWrittenResource.preloadObjectContent).then(function() {
									return oPreloadComponentDocument.save();
								});
							} else {
								return oParentFolderDocument.createFile(sFilename).then(function(oPreloadComponentDocumentNew) {
									return oPreloadComponentDocumentNew.setContent(oWrittenResource.preloadObjectContent).then(function() {
										return oPreloadComponentDocumentNew.save();
									});
								});
							}
						});
					}));
				});
				return Q.allSettled(aPreloadCompPromises);
			},

			_createResourcesJson: function(sTargetFolderPath, sResourcesJsonContent) {
				var that = this;
				var sFileName = "resources.json";
				var sResourcesJsonPath = sTargetFolderPath + "/" + sFileName;
				return that.context.service.document.getDocumentByPath(sResourcesJsonPath).then(function(oResourcesJsonDocument) {
					if (oResourcesJsonDocument) {
						return oResourcesJsonDocument.setContent(sResourcesJsonContent).then(function() {
							return oResourcesJsonDocument.save();
						});
					} else {
						return that.context.service.document.getDocumentByPath(sTargetFolderPath).then(function(oParentFolderDocument) {
							return oParentFolderDocument.createFile(sFileName).then(function(oResourcesJsonDocumentNew) {
								return oResourcesJsonDocumentNew.setContent(sResourcesJsonContent).then(function() {
									return oResourcesJsonDocumentNew.save();
								});
							});
						});
					}
				});
			},

			//This method is meant to update all the relative paths that change due to moving the resources in the build process
			//Currently the only path that is corrected is the URI in the sap.platform.hcp or sap.platform.abap block in the manifest.json
			_updateRelativePathsInCopiedFiles: function(oProjectDocument, sResourcesJsonContent, sTargetFolderPath) {
				var that = this;
				return this.context.service.ui5projecthandler.isManifestProjectGuidelinesType(oProjectDocument).then(function(isManifest) {
					if (!isManifest) {
						return;
					}

					return Q.spread([that._getTargetFolderName(oProjectDocument), that.getSourceFolderFromProject(oProjectDocument)],
						function(sTargetFolderName, sSourceFolderFromProject) {
							var oResources = JSON.parse(sResourcesJsonContent);
							var aManifestResources = _.filter(oResources.resources, function(resource) {
								return resource.name === "manifest.json" || _.endsWith(resource.name, "/manifest.json");
							});

							if (aManifestResources.length !== 1) {
								//TODO check if this is the correct way to throw the error
								throw Error("The project contains multiple manifest.json files");
							}

							//Theoretically the manifest can exist inside an inner directory inside the dist/target folder
							var sPathToManifestWithoutTarget = _.dropRight(aManifestResources[0].name.split("/"));
							//The path shouldn't start with a slash and shouldn't contain neither the project name nor "manifest.json"
							var sPathToManifest = sTargetFolderName + "/" + sPathToManifestWithoutTarget;

							//The absolute path containe "manifest.json"
							var sAbsolutePathToManifest = sTargetFolderPath + "/" + aManifestResources[0].name;

							return that.context.service.document.getDocumentByPath(sAbsolutePathToManifest).then(function(oManifestDocument) {
								return oManifestDocument.getContent().then(function(sManifestContent) {
									var oManifestContent = JSON.parse(sManifestContent);
									//Update the "sap.platform.hcp".uri to contain the path to the manifest from the target folder
									if (oManifestContent["sap.platform.hcp"]) {
										oManifestContent["sap.platform.hcp"].uri = "/";
									}
									if (oManifestContent["sap.platform.abap"]) {
										var sManifestUri = oManifestContent["sap.platform.abap"].uri; //current uri in manifest
										if ((sSourceFolderFromProject) && sSourceFolderFromProject !== "") { // path to resources in abap (e.g. without webapp)
											var indexOfSourceFolder = sManifestUri.lastIndexOf(sSourceFolderFromProject); //verify the specified src folder exist
											if (indexOfSourceFolder !== -1) {
												oManifestContent["sap.platform.abap"].uri = "/";
											}
										}
									}
									return oManifestDocument.setContent(JSON.stringify(oManifestContent, null, 4)).then(function() {
										return oManifestDocument.save();
									});
								});
							});
						});
				});
			},

			_getBuildService: function() {
				return {
					getProxyMetadata: function() {
						return {
							getName: function() {
								return "build"; // the block name
							}
						};
					}
				};
			},

			_getBuildSettings: function(oProjectDocument) {
				return this.context.service.setting.project.get(this._getBuildService(), oProjectDocument);
			},

			_setBuildSettings: function(oProjectDocument, oBuildSettings) {
				return this.context.service.setting.project.set(this._getBuildService(), oBuildSettings, oProjectDocument);
			},

			_getSourceProjectDocument: function(sSourceFolderPath, oTargetProjectDocument) {
				var sTempPath = sSourceFolderPath.substring(1);
				var sProjectPath = "/" + sTempPath.substring(0, sTempPath.indexOf("/"));
				var sTargetProjectPath = oTargetProjectDocument.getEntity().getFullPath();
				if (sProjectPath === sTargetProjectPath || sSourceFolderPath === sTargetProjectPath ) {
					return Q(oTargetProjectDocument);
				} else {
					return this.context.service.document.getDocumentByPath(sProjectPath);
				}
			},

			_deleteTargetFolderContent: function(oFolderDocument) {
				return this.context.service.document.getContainedDocuments(oFolderDocument).then(function(aDocuments) {
					var aDeletePromises = [];
					for (var i = 0; i < aDocuments.length; i++) {
						if (aDocuments[i].getEntity().getName() !== ".project.json") {
							aDeletePromises.push(aDocuments[i].delete());
						}
					}
					return Q.all(aDeletePromises);
				});
			},

			_copyFolderContent: function(oSourceFolderDocument, oTargetProjectDocument, sTargetFolderName) {
				if (oTargetProjectDocument.getEntity().getName() === sTargetFolderName) {
					return oSourceFolderDocument.getFolderContent().then(function(aDocuments) {
						var aCopyPromises = [];
						for (var i = 0; i < aDocuments.length; i++) {
							var oDocument = aDocuments[i];
							aCopyPromises.push(oDocument.copy(oTargetProjectDocument, oDocument.getEntity().getName(), true));
						}
						return Q.all(aCopyPromises);
					});
				} else {
					return oSourceFolderDocument.copy(oTargetProjectDocument, sTargetFolderName, true);
				}
			}
		};
	});