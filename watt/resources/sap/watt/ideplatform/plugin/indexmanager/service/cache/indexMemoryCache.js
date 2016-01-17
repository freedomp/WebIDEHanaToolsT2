define([
	], function() {
	"use strict";

	/**
	 * memory mapping singleton object of js file path & index json
	 * @private
	 */
	var _indexMapping = {};

	var _sapUI5moduleMapping = {};

	/**
	 * load index json from index mapping
	 * @public
	 */
	function loadIndex(docFullPath) {
		if (!docFullPath) {
			var errMessage = this.i18n.getText("i18n", "log_emptypath");
			return Q.reject(new Error(errMessage));
		}

		if (_indexMapping[docFullPath]) {
			//console.log("succeed to load index json of: " + docFullPath);
			return Q({
				source: docFullPath,
				index: _indexMapping[docFullPath]
			});
		} else {
			return Q();
		}
	}

	/**
	 * refresh index mapping on demand
	 * @public
	 */
	function refreshIndex(docFullPath) {
		if (!docFullPath) {
			var errMessage = this.i18n.getText("i18n", "log_emptypath");
			return Q.reject(new Error(errMessage));
		}

		var indexUtil = this.indexUtil;
		return isIndexExpired(docFullPath, indexUtil).then(function(isExpired) {
			if (isExpired) {
				return upsertIndex(docFullPath, indexUtil);
			} else {
				return Q();
			}
		}).fail(function(error) {
			return Q.reject(error);
		});
	}

	/**
	 * delete the index file of specific js file
	 * @public
	 */
	function deleteIndex(docFullPath) {
		if (!docFullPath) {
			var errMessage = this.i18n.getText("i18n", "log_emptypath");
			return Q.reject(new Error(errMessage));
		}

		if (_indexMapping[docFullPath]) {
			//console.log("succeed to delete index json of: " + docFullPath);
			delete _indexMapping[docFullPath];
			return Q(docFullPath);
		} else {
			return Q();
		}
	}

	/**
	 * @private
	 */
	function isIndexExpired(docFullPath, indexUtil) {
		if (!_indexMapping[docFullPath]) {
			return Q(true);
		}

		return indexUtil.getTimestamp(docFullPath).then(function(timestamp) {
			timestamp = timestamp || 0;
			var indexTimestamp = _indexMapping[docFullPath].changedOn || 0;
			return Q(indexTimestamp < timestamp);
		});
	}

	/**
	 * @private
	 */
	function upsertIndex(docFullPath, indexUtil) {
		return indexUtil.generateIndexJson(docFullPath).then(function(indexJson) {
			if (indexJson) {
				//console.log("succeed to upsert index of : " + docFullPath);
				_indexMapping[docFullPath] = indexJson;

				indexUtil.getProjectPath(docFullPath).then(function(projectPath) {
					if (_sapUI5moduleMapping[projectPath]) {
						//	_sapUI5moduleMapping[projectPath][indexJson.module] = docFullPath;
						_sapUI5moduleMapping[projectPath][docFullPath] = indexJson.module;
					}
				}).done();
				return Q(docFullPath);
			} else {
				return Q();
			}
		});
	}

	/**
	 * ui5 Module mapping
	 */
	function refreshModuleList(aConfigDependencies, projectFullPath) {
		var that = this;
		var oModuleList = {};
		
		if ( _sapUI5moduleMapping[projectFullPath]) {
			var oProjModules = _sapUI5moduleMapping[projectFullPath];
			for ( var module in oProjModules ) {
				if ( oProjModules.hasOwnProperty(module) ) {
					oModuleList[oProjModules[module]] = module;
				}
			}
			return Q(oModuleList);
		}

		var refreshDefer = Q.defer();
		var refreshPromises = [];
		var aRefreshDeps = [];
		aConfigDependencies.forEach(function(oDependency) {
			if (oDependency.identifier === "jQuery.sap.require") {
				refreshPromises.push(that.indexUtil.mapProjectModules(projectFullPath));
				aRefreshDeps.push(oDependency); // Only indexed dependencies
			}
		});

		Q.allSettled(refreshPromises).then(function(aMaps) {
			for (var a = 0; a < aMaps.length; a++) {
				var res = aMaps[a];
				if (res.state === "fulfilled" && aRefreshDeps[a].identifier === "jQuery.sap.require") {
					oProjModules = res.value;
					_sapUI5moduleMapping[projectFullPath] = oProjModules;
					for ( module in res.value ) {
						if ( oProjModules.hasOwnProperty(module) ) {
							oModuleList[oProjModules[module]] = module;
						}
					}
				}
			}

			refreshDefer.resolve(oModuleList);
		});

		return refreshDefer.promise;
	}
	
	function refreshModule(aConfigDependencies, projectFullPath, moduleEntity) {
		var that = this;

		if ( !_sapUI5moduleMapping[projectFullPath]) {
			return Q({});
		} else {
			var oProjModules = _sapUI5moduleMapping[projectFullPath];
		}

		var refreshDefer = Q.defer();
		var refreshPromises = [];
		aConfigDependencies.forEach(function(oDependency) {
			if (oDependency.identifier === "jQuery.sap.require") {
				refreshPromises.push(that.indexUtil.getModule(moduleEntity));
			}
		});

		Q.allSettled(refreshPromises).then(function(aMaps) {
			for (var a = 0; a < aMaps.length; a++) {
				var res = aMaps[a];
				if (res.state === "fulfilled" && aConfigDependencies[a].identifier === "jQuery.sap.require") {
					oProjModules[moduleEntity.getFullPath()] = res.value.id;
				}
			}

			refreshDefer.resolve();
		});

		return refreshDefer.promise;
	}

	/**
	 * ui5 Module mapping
	 */
	function addModule(aConfigDependencies, projectFullPath, docEntity) {
		var that = this;

		if (!_sapUI5moduleMapping[projectFullPath]) {
			return Q();
		}

		var addDefer = Q.defer();
		var addPromises = [];
		

		aConfigDependencies.forEach(function(oDependency) {
			if (oDependency.identifier === "jQuery.sap.require") {
				addPromises.push(that.indexUtil.getModule(docEntity, /jQuery\.sap\.declare\(".+"\);/i));
			} else if (oDependency.identifier === "sap.ui.define") {
				addPromises.push(that.indexUtil.getModule(docEntity, /sap\.ui\.define\(".+"\);/i));
			}
		});
		
		Q.all(addPromises).then(function(aModuleKinds) {
			aModuleKinds.forEach(function(moduleMapEntry){
				if (moduleMapEntry && moduleMapEntry.id) {
					_sapUI5moduleMapping[projectFullPath][moduleMapEntry.path] = moduleMapEntry.id;
				}
			});
			addDefer.resolve();
		});

		return addDefer.promise;
	}

	function deleteModule(docFullPath) {

		return this.indexUtil.getProjectPath(docFullPath).then(function(sProjPath) {
			if (_sapUI5moduleMapping.hasOwnProperty(sProjPath)) {
				var oProjModules = _sapUI5moduleMapping[sProjPath];
				for (var moduleIdx in oProjModules) {
					if (oProjModules.hasOwnProperty(moduleIdx)) {
						delete oProjModules[moduleIdx];
					}

				}

				return Q();
			}
		});
	}

	function IndexMemoryCache(indexUtil, i18n) {
		if (!indexUtil || !i18n) {
			throw new Error();
		}
		this.indexUtil = indexUtil;
		this.i18n = i18n;

		//	this._getModulePathQ = _getModulePathQ;
	}

	IndexMemoryCache.prototype = {
		loadIndex: loadIndex,
		refreshIndex: refreshIndex,
		deleteIndex: deleteIndex,
		deleteModule: deleteModule,
		refreshModuleList: refreshModuleList,
		refreshModule: refreshModule,
		addModule: addModule
	};

	return {
		IndexMemoryCache: IndexMemoryCache
	};
});
