define(["sap/watt/lib/lodash/lodash"],
	function(_) {
		"use strict";

		var isProject = function(sProjectFolderPath) {
			var that = this;

			var projectPath = sProjectFolderPath + "/.project.json";

			return that.context.service.document.getDocumentByPath(projectPath).then(function(oDocument) {
				if (oDocument && oDocument.getType() === "file") {
					return true;
				} else {
					return false;
				}
			}).fail(function() {
				return false;
			});
		};

		var _getProject = function(oDocument) {
			return oDocument.getProject();
		};

		var _getHandlerDocument = function(oDocument, sHandlerName) {
			var that = this;
			// In case the document is external & to avoid unnecessary search
			if (oDocument.getEntity().getName() === sHandlerName) {
				var promises = [];
				promises.push(Q(oDocument));
				return Q.all(promises);
			}
			return that._getProject(oDocument).then(function(oProjectDocument) {
				return oProjectDocument.getCurrentMetadata(true).then(function(aProjectMetadataContent) {
					var promises = [];
					for (var i = 0; i < aProjectMetadataContent.length; i++) {
						if (aProjectMetadataContent[i].name === sHandlerName) {
							promises.push(that.context.service.filesystem.documentProvider.getDocument(aProjectMetadataContent[i].path));
						}
					}
					return Q.all(promises);
				});
			});
		};

		var _getNamespace = function(fileContent) {
			var parseContent = JSON.parse(fileContent);
			if (parseContent !== undefined) {
				var sapApp = parseContent["sap.app"];
				//Only take library type namespaces
				if (sapApp !== undefined && sapApp.type === "library") {
					var namespaceID = sapApp.id;
					if (namespaceID !== undefined) {
						return "/" + namespaceID.split(".").join("/");
					}
				}
				return null;
			}
			return null;
		};

		var addDependenciesToAppDescriptor = function(oDescriptorContent, oDependencies) {
			var that = this;
			if (!_.isEmpty(oDependencies)) {

				if (typeof(oDescriptorContent["sap.ui5"]) !== "object" ||
					oDescriptorContent["sap.ui5"] === null) {
					oDescriptorContent["sap.ui5"] = {};
				}
				if (typeof(oDescriptorContent["sap.ui5"].dependencies) !== "object" ||
					oDescriptorContent["sap.ui5"].dependencies === null) {
					oDescriptorContent["sap.ui5"].dependencies = {};
				}

				var sapUI5Merge = jQuery.extend(true, oDescriptorContent["sap.ui5"].dependencies, oDependencies);
				oDescriptorContent["sap.ui5"].dependencies = sapUI5Merge;

				var strContent = JSON.stringify(oDescriptorContent);
				return that.context.service.beautifier.beautify(strContent)
					.then(function(beutifyString) {
						return beutifyString;
					});

			}
		};
		var getAppNamespace = function(oDocument) {
			var that = this;
			var sFileName = "manifest.json";
			return that._getHandlerDocument(oDocument, sFileName).then(function(aHandlerDocuments) {
				if (!aHandlerDocuments || aHandlerDocuments === undefined) {
					return Q({});
				}

				var promisesArr = [];
				for (var i = 0; i < aHandlerDocuments.length; i++) {
					promisesArr.push(aHandlerDocuments[i].getContent());
				}

				return Q.all(promisesArr).then(function(aHandlerContent) {
					for (var b = 0; b < aHandlerContent.length; b++) {
						var sNamespace = that._getNamespace(aHandlerContent[b]);
						if (sNamespace) {
							return Q(sNamespace);
						}
					}
					return null;
				});
			});
		};

		var isLibraryProject = function(sProjectFolderPath) {
			var that = this;

			return that.context.service.document.getDocumentByPath(sProjectFolderPath).then(function(oDocument) {
				return that.context.service.projectType.getProjectTypes(oDocument).then(function(projectTypes) {
					for (var i = 0; i < projectTypes.length; i++) {
						if (projectTypes[i].id === "com.watt.uitools.plugin.reuselibrary") {
							return true;
						}
					}
					return false;
				});
			}).fail(function() {
				return false;
			});
		};

		var getSelectedLibraryModelObject = function(selectedLibraryObject, repositoryType) {
			return {
				destination: selectedLibraryObject.destinationValue,
				repositoryType: repositoryType,
				entryPath: selectedLibraryObject.entryPath,
				path: selectedLibraryObject.path,
				libraryName: selectedLibraryObject.name,
				libraryExternalName: selectedLibraryObject.externalName,
				libraryDescription: selectedLibraryObject.description,
				libraryVersion: selectedLibraryObject.version,
				libraryNumber: selectedLibraryObject.versions && selectedLibraryObject.versions.length > 0 ? selectedLibraryObject.versions[0].version : selectedLibraryObject
					.version,
				controlName: (selectedLibraryObject.controls && selectedLibraryObject.controls.length > 0) ? selectedLibraryObject.controls[0].name : null,
				isManifest: selectedLibraryObject.isManifest
			};
		};

		var updateAppParamsInProjectSetting = function(sPath) {
			var that = this;

			return that.context.service.filesystem.documentProvider.getDocument(sPath).then(function(oProjectDocument) {
				return that.context.service.setting.project.getProjectSettings("appparams", oProjectDocument).then(function(oSetting) {
					var appparamsSettings = {
						"paramName": "sap-ui-xx-lesssupport",
						"paramValue": "true",
						"paramActive": true
					};

					if (oSetting) {
						var i;
						for (i = 0; i < oSetting.length; i++) {
							if (oSetting[i].paramName === "sap-ui-xx-lesssupport") {
								oSetting[i].paramValue = "true";
								oSetting[i].paramActive = true;
								break;
							}
						}
						if (i === oSetting.length) {
							oSetting.push(appparamsSettings);
						}
					} else {
						oSetting = [appparamsSettings];
					}

					return that.context.service.setting.project.setProjectSettings("appparams", oSetting, oProjectDocument);
				});
			});
		};

		var onAfterGeneration = function(oEvent) {
			var that = this;
			var sPath = "/" + oEvent.params.model.projectName;
			var templateId = oEvent.params.selectedTemplate.getId();

			if (templateId === "fiorireuselibrarytemplate.reuselibrary") {
				//	var entryPath = oEvent.params.model.reuselibrary.parameters.LibraryNamespace.value ? "/" + oEvent.params.model.projectPath : "";
				var entryPath = "/" + oEvent.params.model.projectPath;
				var hcpdeploySettings = {
					"account": oEvent.params.model.reuselibrary.systemAcount,
					"name": oEvent.params.model.reuselibrary.libraryName,
					"entryPath": "src" + entryPath
				};

				return this.context.service.filesystem.documentProvider.getDocument(sPath).then(function(oProjectDocument) {

					var promisesArr = [];
					var promise_appparamsSettings = that.updateAppParamsInProjectSetting(sPath);
					promisesArr.push(promise_appparamsSettings);

					var promise_projectType = that.context.service.projectType.setProjectTypes(oProjectDocument, [
						"com.watt.uitools.plugin.reuselibrary"
					]);
					promisesArr.push(promise_projectType);
					var promise_hcpdeploySettings = that.context.service.setting.project.setProjectSettings("hcpdeploy", hcpdeploySettings,
						oProjectDocument);
					promisesArr.push(promise_hcpdeploySettings);

					return Q.all(promisesArr);
				});
			}

		};

		return {
			isProject: isProject,
			isLibraryProject: isLibraryProject,
			getSelectedLibraryModelObject: getSelectedLibraryModelObject,
			updateAppParamsInProjectSetting: updateAppParamsInProjectSetting,
			getAppNamespace: getAppNamespace,
			_getHandlerDocument: _getHandlerDocument,
			_getNamespace: _getNamespace,
			_getProject: _getProject,
			addDependenciesToAppDescriptor: addDependenciesToAppDescriptor,
			onAfterGeneration: onAfterGeneration

		};

	});