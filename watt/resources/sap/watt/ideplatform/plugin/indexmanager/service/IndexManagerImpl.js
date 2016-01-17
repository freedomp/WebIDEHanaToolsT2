define([
	"./util/indexUtil",
	"./util/dependencyMapUtil",
	"./cache/indexMemoryCache",
	"./cache/indexFileCache"
], function(mIndexUtil, mDependencyMapUtil, mIndexMemCache, mIndexFileCache) {
	"use strict";

	var _aConfigDependencies;
	var _indexCacheManager = null;
	var _dependencyMapUtil;
	var _indexUtil;

	/**
	 * @private
	 */
	function _initIndexCache(cacheConfig, docProvider, i18n, summaryFromMetaProvider) {
		if (_indexCacheManager) {
			return _indexCacheManager;
		}

		_indexUtil = new mIndexUtil.IndexUtil(docProvider, i18n, summaryFromMetaProvider);
		if (cacheConfig && cacheConfig.host === "file") {
			_indexCacheManager = new mIndexFileCache.IndexFileCache(docProvider, _indexUtil, i18n);
		} else {
			_indexCacheManager = new mIndexMemCache.IndexMemoryCache(_indexUtil, i18n);
		}
	}

	return {
		
		configure: function(mConfig) {
			_aConfigDependencies = mConfig.dependencies;
			_initIndexCache(mConfig.cache, this.context.service.filesystem.documentProvider, this.context.i18n, mConfig.summaryFromMetaProvider);
			_dependencyMapUtil = new mDependencyMapUtil.DependencyMapUtil(this.context.service.filesystem.documentProvider, this.context.service
				.setting.project, this.context.i18n, this);
		},

		/**
		 * Get the array of dependent index json object for given document
		 * @public
		 */
		getDependentIndexes: function(docFullPath, astRoot) {
			return _indexUtil.getProjectPath(docFullPath).then(function(sProjectFullPath) {
				// Assert <NotWATTProject>
				if ( sProjectFullPath && sProjectFullPath.indexOf("/com.sap.watt") === 0) {
					return Q([]); // Skip watt
				}
				// Refresh Module Map
				return _indexCacheManager.refreshModuleList(_aConfigDependencies, sProjectFullPath).then(function(oModuleMap){
					var promises = [];
					if (astRoot) {
						_aConfigDependencies.forEach(function(oDependency) {
							promises.push(_indexUtil.searchDependenciesFromAST(oDependency.identifier, docFullPath, astRoot, oModuleMap));
						});
					} else {
						_aConfigDependencies.forEach(function(oDependency) {
							promises.push(_indexUtil.searchDependencies(oDependency.identifier, docFullPath, oModuleMap));
						});
					}
					return Q.all(promises).then(function(dependencies) {
						var refreshPromises = [];
						var aDependecies = [];
						for (var i = 0; i < dependencies.length; i++) {
						    var aDepPerConf = dependencies[i];
						    for ( var j = 0; j < aDepPerConf.length; j++) {
						        aDependecies.push(aDepPerConf[j]);
							    refreshPromises.push(_indexCacheManager.refreshIndex(aDepPerConf[j]));
						    }
						}
						return Q.all(refreshPromises).then(function() {
							var loadPromises = [];
							for (i = 0; i < aDependecies.length; i++) {
								var promise = _indexCacheManager.loadIndex(aDependecies[i]).then(function(obj) {
									return Q({
										name: obj.source,
										json: obj.index
									});
								});
								loadPromises.push(promise);
							}
							return Q.all(loadPromises).then(function(nameJsons) {
								var depJsons = {};
								for (var i in nameJsons) {
									var nameJson = nameJsons[i];
									depJsons[nameJson.name] = nameJson.json;
								}
								return Q(depJsons);
							});
						});
					}).fail(function(error) {
						return Q.reject(error);
					});
						
				});
			});
/*			var promises = [];
			if (astRoot) {
				_aConfigDependencies.forEach(function(oDependency) {
					promises.push(indexUtil.searchDependenciesFromAST(oDependency.identifier, docFullPath, astRoot));
				});
			} else {
				_aConfigDependencies.forEach(function(oDependency) {
					promises.push(indexUtil.searchDependencies(oDependency.identifier, docFullPath));
				});
			}
			return Q.all(promises).then(function(dependencies) {
				var refreshPromises = [];
				var aDependecies = [];
				for (var i = 0; i < dependencies.length; i++) {
				    var aDepPerConf = dependencies[i];
				    for ( var j = 0; j < aDepPerConf.length; j++) {
				        aDependecies.push(aDepPerConf[j]);
					    refreshPromises.push(_indexCacheManager.refreshIndex(aDepPerConf[j]));
				    }
				}
				return Q.all(refreshPromises).then(function() {
					var loadPromises = [];
					for (i = 0; i < aDependecies.length; i++) {
						var promise = _indexCacheManager.loadIndex(aDependecies[i]).then(function(obj) {
							return Q({
								name: obj.source,
								json: obj.index
							});
						});
						loadPromises.push(promise);
					}
					return Q.all(loadPromises).then(function(nameJsons) {
						var depJsons = {};
						for (var i in nameJsons) {
							var nameJson = nameJsons[i];
							depJsons[nameJson.name] = nameJson.json;
						}
						return Q(depJsons);
					});
				});
			}).fail(function(error) {
				return Q.reject(error);
			});
*/		},

		/**
		 * Get the array of dependent objects for given document
		 * @public
		 */
		getDependentModules: function(oDocument) {
			var docProvider = this.context.service.filesystem.documentProvider;
			return this.updateDependencyMap(oDocument).then(function() {
				return _dependencyMapUtil.getDependent(oDocument).then(function(aDependentModules) {
					var promises = [];
					aDependentModules.forEach(function(oModule) {
						promises.push(docProvider.getDocument(oModule.filePath));
					});
					return Q.all(promises);
				});
			});
		},

		hasDependentModules: function(oDocument) {
			var that = this;
			var documentName = oDocument.getEntity().getName();
			return this.updateDependencyMap(oDocument).then(function() {
				return _dependencyMapUtil.getDependent(oDocument).then(function(aDependentModules) {
					if (aDependentModules && aDependentModules.length > 0) {
						var sMessage = "Delete not possible, file " + documentName + " has " + aDependentModules.length +
							" dependent modules. \nDo you want to refactor?";
						that.context.service.usernotification.confirm(sMessage).then(function(oResult) {
							if (oResult.bResult) {
								//Open refactor
								that.context.service.filesearch.setVisible(true).then(function() {
									that.context.service.filesearch.refactor(oDocument);
								});
							}

						}).done();
						return Q(true);
					} else {
						return Q(false);
					}
				});
			});
		},
		
		getUI5ProjectInfo: function(sDocumentPath) {
			return _indexUtil.getProjectPath(sDocumentPath).then(function(sProjectPath) {
				return _indexUtil.getUI5ProjectInfo(sProjectPath);
			});
		},

		/**
		 * Handling event when a document is saved
		 * 1. Create/Update the index file based on new content
		 * @event
		 */
		onDocumentSaved: function(oEvent) {
			var doc = oEvent.params.document;
			var that = this;
			if (doc && doc.getEntity) {
				var docEntity = doc.getEntity();
				if (!docEntity || !_indexUtil.isSupported(docEntity.getFileExtension())) {
					return;
				}

				_indexUtil.getProjectPath(docEntity.getFullPath()).then(function(sProjectFullPath) {
					// Assert <NotWATTProject>
					if ( sProjectFullPath && sProjectFullPath.indexOf("/com.sap.watt") === 0) {
						return;
					}
					
					_indexCacheManager.refreshIndex(docEntity.getFullPath()).then(function() {
						_indexCacheManager.refreshModule(_aConfigDependencies, sProjectFullPath, docEntity).then(function(){
							//Update dependencies map
							_indexCacheManager.refreshModuleList(_aConfigDependencies,sProjectFullPath).then(function(oModuleMap) {
								Q.all(that.getDependencies(doc, oModuleMap)).then(function(aDependencies) {
									//that.updateDependencyMap(doc, aDependencies).done();
								});
							}).done();
						
						}).done();
					}).fail(function(error) {
							console.warn(error);
					}).done();
					
				}).done();
			}
		},

		/**
		 * Handling event when a document is deleted
		 * 1. Delete the index file of the deleted file
		 * @event
		 */
		onDocumentDeleted: function(oEvent) {
			var doc = oEvent.params.document;
			if (doc && doc.getEntity ) {
				var docEntity = doc.getEntity();
				if (!docEntity) {
					return;
				}
				if (_indexUtil.isSupported(docEntity.getFileExtension()) ||
					docEntity.getType() === "folder") {
					var docFullPath = docEntity.getFullPath();
					//this.updateDependencyMap(doc, []).done();
					_indexCacheManager.deleteIndex(docFullPath).fail(function(error) {
						console.warn(error);
					}).done();
					_indexCacheManager.deleteModule(docFullPath).fail(function(error) {
						console.warn(error);
					}).done();
				}
			}
		},

		/**
		 * Handling event when a file/folder is renamed or moved
		 * 1. Delete the old index file only
		 * @event
		 */
		onDocumentChanged: function(oEvent) {
			if (oEvent.params.changeType !== "renamed") {
				return;
			}
			this.onDocumentDeleted(oEvent);
		},

		/**
		 * Handling event when the first document is opened
		 * 1. search current content to get all the dependencies as the file reference graph
		 * 2. Generate index files for the dependencies, to prepare for computing proposals
		 * @event
		 */
		onDocumentOpened: function(oEvent) {
			var doc = oEvent.params.document;
			var that = this;
			if (doc && doc.getEntity) {
				var docEntity = doc.getEntity();
/*				if (!docEntity || !indexUtil.isSupported(docEntity.getFileExtension())) {
					return that.updateDependencyMap(doc);
				}
*/

				var docFullPath = docEntity.getFullPath();
				var promises = [];

				_aConfigDependencies.forEach(function(oConfigDependency) {
					_indexUtil.searchDependencies(oConfigDependency.identifier, docFullPath).then(function(dependencies) {
						for (var i in dependencies) {
							promises.push(_indexCacheManager.refreshIndex(dependencies[i]));
						}
					}).fail(function(error) {
						console.warn(error);
					});
				});

				Q.all(promises).then(function() {
					//that.updateDependencyMap(doc).done();
				}).done();
			}
		},

		onDocumentCreated: function(oEvent) {
			var doc = oEvent.params.document;
			if (doc && doc.getEntity) {
				var docEntity = doc.getEntity();
				if (!docEntity || !_indexUtil.isSupported(docEntity.getFileExtension()) ) {
					return;
				}

				_indexUtil.getProjectPath(docEntity.getFullPath()).then(function(sProjectFullPath) {
					// Assert <NotWATTProject>
					if ( sProjectFullPath && sProjectFullPath.indexOf("/com.sap.watt") === 0) {
						return Q();
					} else {
						return Q(_indexCacheManager.addModule(_aConfigDependencies, sProjectFullPath, docEntity));
					}

				}).done();
			}

		},

		getDependencies: function(oDocument, aModuleMapper) {
			var docFullPath = oDocument.getEntity().getFullPath();
			var promises = [];
			var aDependencies = [];

			_aConfigDependencies.forEach(function(oConfigDependency) {
				promises.push(_indexUtil.searchDependencies(oConfigDependency.identifier, docFullPath, aModuleMapper).then(function(dependencies) {
					for (var i in dependencies) {
						var oDependency = {
							filePath: dependencies[i],
							requireType: oConfigDependency.identifier,
							document: oDocument
						};
						aDependencies.push(oDependency);
					}
				}).fail(function(error) {
					console.warn(error);
				}));
			});

			return Q.allSettled(promises).then(function() {
				return Q(aDependencies);
			});
		},

		updateDependencyMap: function(oDocument, aDependencies) {
			return oDocument.getProject().then(function(oProjectDocument) {
				if (oProjectDocument.getEntity().getName() !== "com.sap.watt") {
					return _dependencyMapUtil.dependencyMapExists(oDocument).then(function(bDepMapExists) {
						if (!bDepMapExists) {
							return _dependencyMapUtil.buildDependencyMap(oDocument); //Build from scratch
						} else if (aDependencies) {
							return _dependencyMapUtil.updateDependencies(oProjectDocument, aDependencies, oDocument); //Add delta
						} else {
							return Q;
						}
					});
				}
			});
		},
		
		// For testing purposes
		_getIndexUtil: function() {
			return _indexUtil;
		}
	};
});