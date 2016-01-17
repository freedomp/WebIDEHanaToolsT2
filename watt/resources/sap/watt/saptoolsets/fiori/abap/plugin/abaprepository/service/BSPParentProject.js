define(["sap/watt/platform/plugin/utils/xml/XmlUtil",
		"sap.watt.common.filesystem/document/FileFolderEntity",
		"sap/watt/lib/jszip/jszip-shim",
		"../utils/DeploymentUtility"],
		function(xmlUtil, FileFolderEntity, JSZip, oDeploymentUtility) {

	var BSPParentProject = function() {

        /* eslint-disable no-use-before-define */
        
		var that = this;
		var pathSeparator = "%2f";
		var contentUrlsMap = {};

        this.getFileResourcesInfo = function(applicationPath, system, applicationLocalName) {
            return that.context.service.discovery.getStatusBySystem(system).then(function(discoveryStatus) {
                if (discoveryStatus.filestore_ui5_bsp) {
                    var resourcesInfo = [];
                    var promises = [];

                    var promise = getFileResourcePaths(discoveryStatus, applicationPath, resourcesInfo, applicationPath, applicationLocalName);
                    promises.push(promise);

                    return Q.all(promises).spread(function() {
                        return resourcesInfo;
                    });
                }

                throw new Error(that.context.i18n.getText("i18n", "ABAPRepositoryService_DeployFailed_filestoreui5bspNotFound"));
            });
		};

        //check if one string contains a substring
		var contains = function(str, subStr) {
			return str.indexOf(subStr) > -1;
		};

        //encode the path so that we replace all "/" to "%2F"
		var encodeToBspResourcePath = function(resourcePath) {
			if (contains(resourcePath, "/")) {
				return encodeURIComponent(resourcePath);
			}
			return resourcePath;
		};

        //encode the path so that we replace all "%2F" to "/" 
		var decodeFromBspResourcePath = function(resourcePath) {
			if (contains(resourcePath, "%2f")) {
				return decodeURIComponent(resourcePath);
			}
			return resourcePath;
		};

		that._getLocalFullName = function(sResourcePath, sApplicationRemoteName, sApplicationLocalName) {
			if (!sResourcePath || !sApplicationRemoteName || !sApplicationLocalName) {
				return "";
			}
			var sDecodedRemotePath = decodeFromBspResourcePath(sResourcePath);
			var sLocalFullName = sDecodedRemotePath.replace(sApplicationRemoteName, sApplicationLocalName);
			return sLocalFullName;
		};

        var getFileResourcePaths = function(discoveryStatus, resourcePath, resourcesInfo, applicationRemoteName, applicationLocalName) {
			resourcePath = encodeToBspResourcePath(resourcePath);
			
			// get the content of the application and recursively the content of its folders
			var bspServicePath = discoveryStatus.filestore_ui5_bsp + "/" + resourcePath + "/content";
			return Q.sap.ajax({
				url : bspServicePath,
				dataType : "xml",
				cache: false
			}).then(function(response) {
                var folderPromises = [];
				var children = xmlUtil.firstElementChild(response[0]).childNodes;
				var size = children.length;
				for ( var i = 0; i < size; i++) {
					var entry = children[i];
					if (entry.tagName === "atom:entry") {
						var categoryElement = xmlUtil.getChildByTagName(entry, "atom:category");

						var termValue = xmlUtil.getAttribute(categoryElement, "term");
						var isFolder = (termValue === "folder" ? true : false);

						resourcePath = xmlUtil.getChildNodeValue(entry, "atom:id");

                        // get the name of the resource and its parent
						var sName = resourcePath.substring(resourcePath.lastIndexOf(pathSeparator) + 3, resourcePath.length);
						var sParent = resourcePath.substring(0, resourcePath.lastIndexOf(pathSeparator)); // may be undefined
						
						// get the resource's content url
						var sXmlBaseValue = oDeploymentUtility.getXmlBaseUrl(entry);
						var sContentUrl = oDeploymentUtility.getContentUrl(entry, sXmlBaseValue);
						
						// save the content url in the map - for its children
						contentUrlsMap[sName] = sContentUrl;
						// get the content url of its parent from the map. May be undefined if the resource is the root
						var sParentContentUrl = contentUrlsMap[sParent];

						var sLocalFullName = that._getLocalFullName(resourcePath, applicationRemoteName, applicationLocalName);

                        // build a resourceInfo object, with content url that will later pass to each remote document
						var decodedResourcePath = decodeURIComponent(resourcePath);
						var resourceInfo = {
							"name" : sName,
							"path" : resourcePath,
							"localFullName" : sLocalFullName,
							"type" : termValue,
							"parent" : sParent,
							"contentUrl" : sContentUrl,
							"parentContentUrl": sParentContentUrl,
							"parentFolderPath" : decodedResourcePath.substring(0, decodedResourcePath.lastIndexOf("/"))
						};
						resourcesInfo.push(resourceInfo);

						if (isFolder) {
                            var promise = getFileResourcePaths(discoveryStatus, resourcePath, resourcesInfo, applicationRemoteName, applicationLocalName);
                            folderPromises.push(promise);
						}
					}
				}
				return Q.all(folderPromises).spread(function() {
                    return;
                });
			}).fail(function(oError) {
			    // parse the responseText to get the exact error message
        		var parsedErrorMessage = getErrorMessage(oError.responseText);
			    that.context.service.log.error(that.context.i18n.getText("i18n", "Import_ImportTitle"), parsedErrorMessage, [ "user" ]).done();
			    return Q({message:parsedErrorMessage});
			});
		};

		var getErrorMessage = function(responseText) {
            var responseXml = xmlUtil.stringToXml(responseText);
            var messageTag = xmlUtil.getChildByTagName(responseXml.childNodes[0], "message");
            return messageTag.textContent;
        };

		this.getRuntimeDestinations = function(system) {
			var destinations = []; //don't use parent destinations if exists, not relevant to ABAP!

			if (!system) {
				return destinations;
			}

			var bspUsages = {
				"ui5_execute_abap" : "ui5_execute_abap",
				"odata_abap" : "odata_abap"
			};

			return this.context.service.destination.getDestinations().then(function(allDestinations) {
				if (!allDestinations) {
					return destinations;
				}

				for (var k = 0; k < allDestinations.length; k++) {
					var selectedDestination = allDestinations[k];

					if (selectedDestination.name === system.name) {

						for ( var i = 0; i < allDestinations.length; i++) {
							var destination = allDestinations[i];
							var wattUsage = destination.wattUsage;

							if (bspUsages[wattUsage] && destination.systemId === selectedDestination.systemId
							        && destination.name === selectedDestination.name
									&& destination.sapClient === selectedDestination.sapClient) {
								var target = {};
								target.path = destination.path;
								target.wattUsage = destination.wattUsage;
								target.target = {};
								target.target.type = "destination";
								target.target.name = destination.name;
								if (destination.entryPath) {
									target.target.entryPath = destination.entryPath;
								}
								target.description = destination.description;

								var notFound = true;

								for ( var d = 0; d < destinations.length; d++) {
									if (destinations[d].path === target.path) {
										notFound = false;
										break;
									}
								}

								// prevent duplicated destination (with the same path)
								if (notFound) {
									destinations.push(target);
								}
							}
						}

						return destinations;
					}
				}

				return destinations;
			});
		};

		var getFolderFiles = function(folderPath, folderName, system) {
			return that.context.self.getDocument(folderPath, "folder", system).then(function(remoteFolder) {
				return remoteFolder.getContent().then(function(xml) {

					var promises = [];

					var rootFolderXml = xmlUtil.firstElementChild(xml);

					for ( var i = 0; i < rootFolderXml.childElementCount; i++) { // rootFolderXml.childNodes.length is not supported in IE, so don't change this either. Thank you.

						var rootChild = rootFolderXml.childNodes[i];
						if (rootChild.hasChildNodes()) {

							var filePath = xmlUtil.getChildNodeValue(rootChild, "atom:id");
							if (filePath.length > 0) {
								promises.push(that.context.self.getDocument(filePath, "file", system));
							}
						}
					}

					return Q.allSettled(promises).then(function(aFilesPromiseRes) {
						var aFiles = [];
						jQuery.each(aFilesPromiseRes, function(index, oDocumentPromiseRes) {
							if (oDocumentPromiseRes.state === "fulfilled" && oDocumentPromiseRes.value) {
								aFiles.push(oDocumentPromiseRes.value);
							}
						});
						return aFiles;
					});
				});
			});
		};

		/*
		 * Get the i18n folder and all its .properties files, from the parent application located in remote location
		 */
		this.geti18nFolderFiles = function(i18nFolderPath, system) {
			return getFolderFiles(i18nFolderPath, "i18nFolderName", system);
		};

		/*
		 * Get the model folder and all its files, from the parent application located in remote location
		 */
		this.getModelFolderFiles = function(modelFolderPath, system) {
			modelFolderPath = modelFolderPath.substring(0, modelFolderPath.lastIndexOf("%2f"));

			return getFolderFiles(modelFolderPath, "model", system);
		};

		/*
		 * Returns a Document object or undefined if not found on backend
		 */
		this.getDocument = function(resourcePath, resourceType, system, bBeautifyContent) {

			var resourceName;
			var lastSeparatorIndex = resourcePath.lastIndexOf(pathSeparator);
			if (lastSeparatorIndex === -1) {
				resourceName = resourcePath;
			} else {
				resourceName = resourcePath.substring(lastSeparatorIndex + pathSeparator.length);
			}

			var resPath = decodeFromBspResourcePath(resourcePath);
			var parentPath = resPath.substring(0,resPath.lastIndexOf("/"));
			var oEntity = new FileFolderEntity(resourceType, resourceName, parentPath, "bspFileDao", "" );
			return that.context.service.filesystem.documentProvider.createDocumentInternally(oEntity, that.context.service.document.context.event).then(function(oDocument){
				var extInfo = oDocument.getExtInfo();
				if (!extInfo) {
					extInfo = {};
				}

				extInfo.origin = system;
				extInfo.external = true;
				extInfo.bBeautify = bBeautifyContent === true;
				oDocument.setExtInfo(extInfo);

				// This document has no project in the workspace
				oDocument.getProject = function() {
					if (!this.isProject()) {
						return Q(null);
					} else {
						return Q(this);
					}
				};

				return oDocument.getContent().thenResolve(oDocument);
			}).fail(function(oError) {
				console.log(oError);
				throw oError;
			});
		};

		var getDestination = function(destinations, system) {
			for ( var i = 0; i < destinations.length; i++) {
				var destination = destinations[i];
				if (destination.name === system.name || (destination.systemId === system.id && destination.sapClient === system.client)) {
					return destination;
				}
			}
		};
		
		this._addDestinations = function(selectedDestination, projectDocument) {
			var routes = [];
			return that.context.service.destination.getDestinations().then(function(allDestinations) {
				for (var i = 0; i < allDestinations.length; i++) {
					var destination = allDestinations[i];

					if (destination.systemId === selectedDestination.systemId &&
						destination.name === selectedDestination.name &&
						destination.sapClient === selectedDestination.sapClient &&
						destination.wattUsage === "odata_abap") {
						var route = {
							"path" : destination.path,
							"target" : {
								"type" : "destination",
								"name" : destination.name
							},
							"description" : destination.description
						};
						route = (destination.entryPath) ? jQuery.extend(true, route, {
							"target" : {
								"entryPath" : destination.entryPath
							}
						}) : route;
						routes.push(route);
					}
				}
				
				// add a /sap/bc/ui5_ui5 destination 
				// so that if the imported application will be executable from Web IDE
				var oUI5ExecuteAbapRoute = {
					"path" : "/sap/bc/ui5_ui5",
					"target" : {
						"type" : "destination",
						"name" : selectedDestination.name,
						"entryPath" : "/sap/bc/ui5_ui5"
					},
					"description" : selectedDestination.description
				};
				
				routes.push(oUI5ExecuteAbapRoute);

				return that.context.service.neoapp.addDestinations(routes, projectDocument);
			});
		};
		
		// add destinations and dependencies (i.e. reuse libs) to the project's neo-app.json
		this._updateNeoAppJson = function(oSelectedDestination, projectDocument) {
			return that._addDestinations(oSelectedDestination, projectDocument).then(function() {
				// check if the imported app has a manifest.json - because only these apps are supported by the app index service
				// in order to get their dependencies
				return that.context.service.ui5projecthandler.isManifestProjectGuidelinesType(projectDocument).then(function(bIsManifest) {
					if (bIsManifest) {
						// get the app namespace
						return that.context.service.ui5projecthandler.getAppNamespace(projectDocument).then(function(sAppNamespace) {
							// get the dependencies of the imported app as neo-app routes
							return that.context.service.abaprepository.getDependenciesAsNeoappRoutes(oSelectedDestination, sAppNamespace).then(function(aDependencies) {
								if (aDependencies && aDependencies.length > 0) {
									// update the neo-app.json with the dependencies
									return that.context.service.neoapp.addDestinations(aDependencies, projectDocument);
								}
							}).fail(function(oError) {
								// log the error and continue with the import
								that.context.service.log.info(that.context.i18n.getText("i18n", "Import_ImportTitle"),
    								that.context.i18n.getText("i18n", "ImportFromABAP_FailedToGetDependencies", [sAppNamespace, oError.responseText]), [ "user" ]).done();
        								
								return;
							});
						});
					}
				});
			});
		};

		var reportProgerss = function(filename, currentfileIndex, totalFiles) {
		    // console
			that.context.service.log.info("Import from SAPUI5 ABAP Repository",
				that.context.i18n.getText("i18n", "BSPParentProject_msg_report",
				[ filename, currentfileIndex, totalFiles ]), ["user"]).done();
		};

		var updateWorkspace = function(system, blob, destinationDocument, applicationName) {
			return destinationDocument.importZip(blob, true).then(function() {
				return that.context.service.destination.getDestinations("dev_abap").then(function(destinations) {
					var destination = getDestination(destinations, system);
					// add destinations to the project's Neo-app.json
					return that._updateNeoAppJson(destination, destinationDocument).then(function() {
						// update the app's project.json with "mockpreview" settings
						return that.context.service.mockpreview.updateSettings(destinationDocument).then(function() {
							// write "deploy" block to the app's project.json - mainly for "Application Status" 
							// Note: applicationName may contain namespace, so it's not always the same as the destination project name.
							return that.context.service.abaprepository.updateProjectJsonWithDeploy(applicationName, destinationDocument.getEntity().getFullPath(), system);                         
						});
					});
				});
			});
		};

        // used only for import
        this.getResponse = function(path) {
			var oDeferred = Q.defer();
			//for Blobs, we have to use XMLHttpRequest
			/* eslint-disable no-undef */
			var oXHR = new XMLHttpRequest();
			/* eslint-enable no-undef */
			oXHR.open('GET', path);
			oXHR.setRequestHeader('Accept' , '*/*');
			oXHR.responseType = "arraybuffer";
			oXHR.onload = function() {
				if (this.readyState === 4 && this.status < 300) {
					oDeferred.resolve(this.response);
				} else {
					oDeferred.reject(this.statusText);
				}
			};
			oXHR.send();
			return oDeferred.promise;
		};

		// used only for import
		this.handleSingleFileFromBsp = function(path, resourceInfo, applicationName, system, zipFile) {
            var filePath;
            var appNameIndex;
            var sAppNameWithSlash = applicationName + "/";
			return that.getResponse(path).then(function(fileContent) {
				// check if the we got the file content or an error
				var fileSuffixRegex = /\.[0-9a-z]+$/i;
				if (!fileContent) {
					fileContent = "";
				}
				if (resourceInfo.type !== "folder") {
					filePath = resourceInfo.path.split(pathSeparator).join("/");
					appNameIndex = filePath.indexOf(sAppNameWithSlash);
					if (appNameIndex > -1) {
						filePath = filePath.substr(appNameIndex + sAppNameWithSlash.length); //remove the BSP application name (may also include namespace) from the path
					}

					if (jQuery.sap.endsWith(filePath, ".xml")) {//if the file is XML then serialize to String
						zipFile.file(filePath, fileContent);
					} else if (fileSuffixRegex.test(filePath)) { //add only files with suffix to ZIP and not the atom data files
						zipFile.file(filePath, fileContent);
					}
				}

				return Q();
			}).catch(function(res){
                var fileName = resourceInfo.path.split(pathSeparator).join("/");
                // import of this file has failed for some reason   --- > filePath
                that.context.service.log.error(that.context.i18n.getText("i18n", "Import_ImportTitle"),
                                that.context.i18n.getText("i18n", "Import_ImportError",  [resourceInfo.type + " " + fileName , res]), [ "user" ]).done();
                var type = resourceInfo.type;
                // capitalize the first char of the type (File/Folder)
                type = type.charAt(0).toUpperCase() + type.slice(1);
                return Q({error:type + " " + fileName + ": " + res + "\n"});
			});
		};
	

		this.import = function(applicationName, system, destinationDocument) {
			var zipFile = new JSZip();
			
			return that.getFileResourcesInfo(applicationName, system).then(function(resourcesInfo) {
				if (resourcesInfo.length === 0) {
					return Q();
				}

                return that.context.service.destination.getDestinations("dev_abap").then(function(destinations) {
                    var destination = getDestination(destinations, system);

                    var totalFiles = resourcesInfo.length;
                    var promises = [];
                    for (var i = 0; i < resourcesInfo.length; i++) {
                        var resourceInfo = resourcesInfo[i];
                        reportProgerss(resourceInfo.name, (i + 1), totalFiles);
                        
                        var path = destination.url + "/filestore/ui5-bsp/objects/" + resourceInfo.path + "/content";
                        promises.push(that.handleSingleFileFromBsp(path, resourceInfo, applicationName, system, zipFile));
                    }

                    return Q.all(promises).spread(function() {
                        var content = zipFile.generate({
                            type : "blob"
                        });

                        var returnedArgs = arguments;
                        var errors = [];

    					return updateWorkspace(system, content, destinationDocument, applicationName).then(function() {
    					    that.context.service.repositorybrowser.setSelection(destinationDocument, true).done();
    					    // lite info
                		    that.context.service.usernotification.liteInfo(that.context.i18n.getText("i18n", "BSPParentProject_msg_end", [applicationName]), true).done();
                		    // console
                		    that.context.service.log.info("Import",that.context.i18n.getText("i18n", "BSPParentProject_msg_end", [applicationName]), ["user"]).done();
                		    
                		    for (var j = 0 ; j < returnedArgs.length ; j++){
            		          if (returnedArgs[j]) {
            		              errors.push(returnedArgs[j]);
            		           }
                		    }
                		    if (errors.length > 0){
                		      return Q.reject(errors);
                		    }
    					});
    				});
                });
			});
		};
	};
	
	/* eslint-enable no-use-before-define */

	return BSPParentProject;
});