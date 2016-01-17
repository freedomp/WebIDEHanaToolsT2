define(["sap/watt/lib/lodash/lodash"], function(_) {
	"use strict";

	var _DEPENDENCIES_FILE_NAME = ".dependencies.json";

	function dependencyMapExists(oFileDocument) {
		return oFileDocument.getProject().then(function(oProjectDocument) {
			return oProjectDocument.getChild(_DEPENDENCIES_FILE_NAME).then(function(oDocument) {
				if (!oDocument) {
					return Q(false);
				} else {
					return Q(true);
				}
			});
		});
	}

	function buildDependencyMap(oFileDocument) {
		var that = this;
		return oFileDocument.getProject().then(function(oProjectDocument) {
			return oProjectDocument.createFile(_DEPENDENCIES_FILE_NAME).then(function(oDependenciesDocument) {
				var dependencyMap = {};
				return oDependenciesDocument.setContent(JSON.stringify(dependencyMap)).then(function() {
					return oProjectDocument.getCurrentMetadata(true).then(function(aProjectMetadataContent) {
						var promises = [];
						for (var i = 0; i < aProjectMetadataContent.length; i++) {
							var oDocumentMetadata = aProjectMetadataContent[i];
							if (_.endsWith(oDocumentMetadata.name, ".js")) {
								promises = promises.concat(oProjectDocument._oOwner.context.service.filesystem.documentProvider.getDocument(oDocumentMetadata.path).then(function(oDocument) {
									that.indexManagerImpl.getDependencies(oDocument);
								}));
							}
						}
						return Q.allSettled(promises).then(function(aPromDependencies) {
							var aDependencies = [];
							aPromDependencies.forEach(function(promise) {
								if (promise.value && promise.value.length > 0 && promise.value[0]) {
									aDependencies.push(promise.value[0]);
								}
							});
							return that.updateDependencies(oProjectDocument, aDependencies);
						});
					});
				});
			});
		});
	}

	function updateDependencies(oProjectDocument, aDependencies, oCurrentDocument) {
		var that = this;
		return oProjectDocument.getChild(_DEPENDENCIES_FILE_NAME).then(function(oDependenciesDocument) {
			return oDependenciesDocument.getContent().then(function(oContent) {
				try {
					var oDependencyMap = JSON.parse(oContent);
				} catch (e) {
					return Q;
				}
				if (!oDependencyMap.modules) {
					oDependencyMap.modules = [];
				}

				if (oCurrentDocument) {
					that.removeExistingDependencies(oDependencyMap, oCurrentDocument);
				}
				aDependencies.forEach(function(oDependency) {
					var sFileDocumentPath = oDependency.document.getEntity().getFullPath();
					if (oDependencyMap.modules.length > 0) {
						var moduleFound = false;
						for (var i = 0; i < oDependencyMap.modules.length; i++) {
							if (oDependencyMap.modules[i].filePath === oDependency.filePath) {
								var dependentModuleFound = false;
								for (var d = 0; d < oDependencyMap.modules[i].dependentModules.length; d++) {
									if (oDependencyMap.modules[i].dependentModules[d].filePath === sFileDocumentPath) {
										dependentModuleFound = true;
										break;
									}
								}
								if (!dependentModuleFound &&
									sFileDocumentPath !== oDependencyMap.modules[i].filePath) {
									oDependencyMap.modules[i].dependentModules.push({
										filePath: sFileDocumentPath,
										requireType: oDependency.requireType
									});
								}
								moduleFound = true;
								break;
							}
						}
						if (!moduleFound) {
							oDependencyMap.modules.push({
								filePath: oDependency.filePath,
								dependentModules: [{
									filePath: sFileDocumentPath,
									requireType: oDependency.requireType
										}]
							});
						}
					} else {
						oDependencyMap.modules.push({
							filePath: oDependency.filePath,
							dependentModules: [{
								filePath: sFileDocumentPath,
								requireType: oDependency.requireType
									}]
						});
					}
				});
				oDependencyMap.generationDateTime = new Date().toUTCString();
				return oDependenciesDocument.setContent(JSON.stringify(oDependencyMap, null, 4)).then(function() {
					return oDependenciesDocument.save();
				});
			});
		});
	}

	function getDependent(oFileDocument) {
		return oFileDocument.getProject().then(function(oProjectDocument) {
			return oProjectDocument.getChild(_DEPENDENCIES_FILE_NAME).then(function(oDependenciesDocument) {
				return oDependenciesDocument.getContent().then(function(oContent) {
					var oDependencyMap = JSON.parse(oContent);
					for (var i = 0; i < oDependencyMap.modules.length; i++) {
						if (oDependencyMap.modules[i].filePath === oFileDocument.getEntity().getFullPath()) {
							return Q(oDependencyMap.modules[i].dependentModules);
						}
					}
					return Q(null);
				});

			});
		});
	}

	function getRequired(oFileDocument) {
		var sFilePath = oFileDocument.getEntity().getFullPath();
		return oFileDocument.getProject().then(function(oProjectDocument) {
			return oProjectDocument.getChild(_DEPENDENCIES_FILE_NAME).then(function(oDependenciesDocument) {
				var oDependencyMap = JSON.parse(oDependenciesDocument.getContent());
				var aRequired = [];
				for (var i = 0; i < oDependencyMap.modules.length; i++) {
					for (var b = 0; b < oDependencyMap.modules[i].dependentModules.length; b++) {
						if (oDependencyMap.modules[i].dependentModules[b].filePath === sFilePath) {
							aRequired.push({
								filePath: oDependencyMap.modules[i].filePath,
								name: oDependencyMap.modules[i].name
							});
						}
					}
				}
				return Q(aRequired);
			});
		});
	}

	function removeExistingDependencies(oDependencyMap, oCurrentDocument) {
		var sFileDocumentPath = oCurrentDocument.getEntity().getFullPath();
		for (var i = oDependencyMap.modules.length - 1; i >= 0; i--) {
			if (oDependencyMap.modules[i].dependentModules) {
				for (var b = oDependencyMap.modules[i].dependentModules.length - 1; b >= 0; b--) {
					if (oDependencyMap.modules[i].dependentModules[b].filePath === sFileDocumentPath) {
						oDependencyMap.modules[i].dependentModules.splice(b, 1);
					}
				}
				if (oDependencyMap.modules[i].dependentModules.length === 0) {
					oDependencyMap.modules.splice(i, 1);
				}
			}
		}
	}

	function DependencyMapUtil(docProvider, settingProject, i18n, indexManagerImpl) {
		if (!docProvider || !i18n) {
			throw new Error();
		}

		this.docProvider = docProvider;
		this.settingProject = settingProject;
		this.i18n = i18n;
		this.indexManagerImpl = indexManagerImpl;
	}

	DependencyMapUtil.prototype = {
		dependencyMapExists: dependencyMapExists,
		buildDependencyMap: buildDependencyMap,
		updateDependencies: updateDependencies,
		getDependent: getDependent,
		getRequired: getRequired,
		removeExistingDependencies: removeExistingDependencies
	};

	return {
		DependencyMapUtil: DependencyMapUtil
	};
});