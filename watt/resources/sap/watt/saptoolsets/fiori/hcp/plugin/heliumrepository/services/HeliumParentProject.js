define(["sap.watt.common.filesystem/document/FileFolderEntity", "sap/watt/lib/jszip/jszip-shim"], function(FileFolderEntity, JSZip) {

	/* eslint-disable no-use-before-define */

	var HeliumParentProject = function() {

		var that = this;
		var pathSeparator = "/";

		var validateParameter = function(paramValue, paramName) {
			if (!paramValue) {
				throw new Error(paramName + " must be defined.");
			}
		};

		/*
		 * Get the model folder and all its files, from the parent application located in remote location
		 */
		this.getModelFolderFiles = function(modelFolderPath, system) {
			validateParameter(modelFolderPath, "model folder path");
			validateParameter(system, "system");
			var path = "/api/html5api/accounts/" + system.account + "/" + system.type + "s/" + system.application +
				"/content?pathSuffixFilter=.json,metadata.xml";
			// get the parent project
			modelFolderPath = modelFolderPath.substring(0, modelFolderPath.lastIndexOf("/"));

			return getFolderFiles(path, modelFolderPath, system);
		};

		// resourcePath value is looks like: "/view/Detail.controller.js"
		this.getDocument = function(resourcePath, resourceType, system, bBeautifyContent) {

			validateParameter(resourcePath, "resource path");
			validateParameter(resourceType, "resource type");
			validateParameter(system, "system");

			// remove first /
			if (resourcePath.indexOf(pathSeparator) === 0) {
				resourcePath = resourcePath.substring(1);
			}

			var lastSeparatorIndex = resourcePath.lastIndexOf(pathSeparator);
			var resourceName = resourcePath.substring(lastSeparatorIndex + pathSeparator.length);

			var parentPath = resourcePath.substring(0, resourcePath.lastIndexOf(pathSeparator));
			var oEntity = new FileFolderEntity(resourceType, resourceName, parentPath, "heliumFileDao", "");
			return that.context.service.filesystem.documentProvider.createDocumentInternally(oEntity, that.context.service.document.context.event)
				.then(function(oDocument) {
					var extInfo = oDocument.getExtInfo();
					if (!extInfo) {
						extInfo = {};
					}

					extInfo.origin = system;
					extInfo.external = true;
					extInfo.bBeautify = bBeautifyContent;
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

		this.getResourcesFromZipFiles = function(aFilePaths) {
			var resourcesInfo = [];
			for (var i = 0; i < aFilePaths.length; i++) {
				var filePath = aFilePaths[i];
				var index = filePath.lastIndexOf("/");
				var name = filePath;
				if (index !== -1) {
					name = filePath.substring(index + 1, filePath.length);
				}

				var resourceInfo = {
					"name": name,
					"path": "/" + filePath,
					"parentFolderPath": filePath.substring(0, filePath.lastIndexOf("/"))
				};

				resourcesInfo.push(resourceInfo);
			}

			return resourcesInfo;
		};

		this.getFileResourcesInfo = function(applicationName, system) {
			var path = "/api/html5api/accounts/" + system.account + "/" + system.type + "s/" + applicationName + "/content";

			return getJSZipFromHCP(path).then(function(jsZip) {
				var filePaths = Object.keys(jsZip.files);
				return that.getResourcesFromZipFiles(filePaths);
			});
		};

		var getBlobFromHCP = function(path) {
			return that.getResponseFromHCP(path, "blob");
		};

		var getJSZipFromHCP = function(path) {
			return that.getResponseFromHCP(path, "arraybuffer").then(function(response) {
				var jsZip = new JSZip(response);
				return jsZip;
			});
		};

		this.getResponseFromHCP = function(path, responseType) {
			var oDeferred = Q.defer();
			//for Blobs, we have to use XMLHttpRequest
			var oXHR = new XMLHttpRequest();
			oXHR.open('GET', path);
			oXHR.setRequestHeader('Accept', '*/*');
			oXHR.responseType = responseType;
			oXHR.onload = function(e) {
				if (this.readyState === 4 && this.status < 300) {
					oDeferred.resolve(this.response);
				} else {
					var error = {};
					if (this.status === 404 || this.status === 400) {
						error.message = that.context.i18n.getText("i18n", "HeliumParentProject_404_error");
					} else {
						error.message = that.context.i18n.getText("i18n", "HeliumParentProject_internal_error");
					}
					oDeferred.reject(error);
				}
			};
			oXHR.send();
			return oDeferred.promise;
		};

		this.geti18nFolderFiles = function(i18nFolderPath, system) {
			var path = "/api/html5api/accounts/" + system.account + "/" + system.type + "s/" + system.application +
				"/content?pathSuffixFilter=.properties";

			return getFolderFiles(path, i18nFolderPath, system);
		};

		var getFolderFiles = function(path, folderPath, system) {

			// remove first /
			if (folderPath.indexOf(pathSeparator) === 0) {
				folderPath = folderPath.substring(1);
			}

			return getJSZipFromHCP(path).then(function(jsZip) {
				var folderFiles = [];
				that.filePromises = [];
				var filePaths = Object.keys(jsZip.files);
				for (var i = 0; i < filePaths.length; i++) {
					var filePath = filePaths[i];
					if (filePath.indexOf(folderPath + pathSeparator) !== -1 && jsZip.files[filePath].options.dir === false) {
						var content = jsZip.file(filePath).asText();

						var resourceName = filePath.substring(filePath.lastIndexOf(pathSeparator) + pathSeparator.length, filePath.length);
						var parentPath = filePath.substring(0, filePath.lastIndexOf(pathSeparator));
						var oEntity = new FileFolderEntity("file", resourceName, parentPath, "heliumFileDao", "");
						var docPromise = that.context.service.filesystem.documentProvider.createDocumentInternally(oEntity, that.context.service.document
							.context.event).then(function(oDocument) {
							var extInfo = oDocument.getExtInfo();
							if (!extInfo) {
								extInfo = {};
							}

							extInfo.origin = system;
							extInfo.external = true;
							oDocument.setExtInfo(extInfo);

							// This document has no project in the workspace
							oDocument.getProject = function() {
								if (!this.isProject()) {
									return Q(null);
								} else {
									return Q(this);
								}
							};

							return oDocument.setContent(content).thenResolve(oDocument);
						}).fail(function(oError) {
							console.log(oError);
							throw oError;
						});
						that.filePromises.push(docPromise);
					}
				}

				return Q.allSettled(that.filePromises).spread(function() {
					jQuery.each(arguments, function(index, oDocumentPromiseRes) {
						if (oDocumentPromiseRes.state === "fulfilled" && oDocumentPromiseRes.value) {
							folderFiles.push(oDocumentPromiseRes.value);
						}
					});
				}).then(function() {
					return folderFiles;
				});
			});
		};

		var addApplicationDestination = function(system, parentDestinations) {

			validateParameter(system, "system");
			validateParameter(system.account, "account");
			validateParameter(system.application, "application name");

			var parentDestination = {
				"path": "/webapp/parent",
				"target": {
					"type": "application",
					"preferLocal": true,
					"name": system.application
				},
				"description": "Original Application"
			};

			if (system.entryPath) {
				parentDestination.target.entryPath = system.entryPath;
			}

			parentDestinations.push(parentDestination);

			return Q(parentDestinations);
		};

		this.getRuntimeDestinations = function(system, parentDestinatons) {
			return addApplicationDestination(system, parentDestinatons);
		};

		var getResourceRoute = function() {
			if (sap.watt.getEnv("ui5dist")) {
				return {
					"path": "/resources",
					"target": {
						"type": "destination",
						"name": "ui5dist"
					},
					"description": "SAPUI5 Resources"
				};
			} else {
				return {
					"path": "/resources",
					"target": {
						"type": "service",
						"name": "sapui5",
						"entryPath": "/resources"
					},
					"description": "SAPUI5 Resources"
				};
			}
		};

		var getTestResourceRoute = function() {
			if (sap.watt.getEnv("ui5dist")) {
				return {
					"path": "/test-resources",
					"target": {
						"type": "destination",
						"name": "ui5dist-test-resources"
					},
					"description": "SAPUI5 Test Resources"
				};
			} else {
				return {
					"path": "/test-resources",
					"target": {
						"type": "service",
						"name": "sapui5",
						"entryPath": "/test-resources"
					},
					"description": "SAPUI5 Test Resources"
				};
			}
		};

		var addUI5ResourcesDestination = function(aRoutes, projectDocument) {
			var resourcesNotFound = true;
			var testResourcesNotFound = true;
			var aRoutesToAdd = [];

			for (var i = 0; i < aRoutes.length; i++) {
				if (aRoutes[i].path === "/resources") {
					resourcesNotFound = false;
				}
				if (aRoutes[i].path === "/test-resources") {
					testResourcesNotFound = false;
				}
			}

			if (resourcesNotFound) {
				aRoutesToAdd.push(getResourceRoute());
			}

			if (testResourcesNotFound) {
				aRoutesToAdd.push(getTestResourceRoute());
			}
            
            if(aRoutesToAdd.length > 0){
            	return that.context.service.neoapp.addDestinations(aRoutesToAdd, projectDocument);
            } 
            
            return Q();
		};

		this.import = function(applicationName, system, destinationDocument) {
            
            var routes = [];
			var path = "/api/html5api/accounts/" + system.account + "/" + system.type + "s/" + applicationName + "/content";

			return getBlobFromHCP(path).then(function(blob) {
				return destinationDocument.importZip(blob, true).then(function() {
					return that.context.service.neoapp.getDestinations(destinationDocument).spread(function(oNeoappDocument, oNeoappContent) {
						if(oNeoappContent && oNeoappContent.routes){
							routes = oNeoappContent.routes;
						}
						return addUI5ResourcesDestination(routes, destinationDocument).then(function() {
							return that.context.service.mockpreview.updateSettings(destinationDocument).then(function() {
								that.context.service.repositorybrowser.setSelection(destinationDocument, true).done();
								// lite info
								that.context.service.usernotification.liteInfo(that.context.i18n.getText("i18n", "HeliumParentProject_msg_end", [
									applicationName
								]), true).done();
								that.context.service.log.info("Import", that.context.i18n.getText("i18n", "HeliumParentProject_msg_end", [
									applicationName
								]), [
									"user"
								]).done();
							});
						});
					});
				});
			});
		};
	};

	/* eslint-enable no-use-before-define */

	return HeliumParentProject;
});