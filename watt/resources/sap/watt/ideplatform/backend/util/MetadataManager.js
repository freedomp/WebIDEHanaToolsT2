define(["sap/watt/lib/lodash/lodash"], function(_) {

	var MetadataManager = {
		/**
		 * metadata storage map
		 * stores metadata per project
		 */ 
		_oMetadataStorage : {},
		
		// get project path from metadata path
		_getProjectPath : function(sMetadataPath) {
			// if sMetadataPath does not start with "/" then it is invalid path
			if (_.startsWith(sMetadataPath, "/")) {
				var indexOfSlash = sMetadataPath.indexOf("/", 1);
				// if indexOfSlash is -1 measn that we already got a project path
				if (indexOfSlash === -1) {
					return sMetadataPath; // return project path
				}
				// calculateand return  project path
				return sMetadataPath.substr(0, indexOfSlash);
			}
			// return root path as is
			if (sMetadataPath === "") {
				return sMetadataPath;
			}
		},
		
		// returns metadata storage of a project
		_getProjectMetadataStorage : function(sProjectPath) {
			return this._oMetadataStorage[sProjectPath];
		},
		
		// check whether the provided by path metadata has children
		hasChildren : function(sMetadataPath) {
			var sProjectPath = this._getProjectPath(sMetadataPath);
			if (sProjectPath) {
				var oProjectMetadataStorage = this._getProjectMetadataStorage(sProjectPath);
				if (oProjectMetadataStorage) {
					// a child metadata path must start with the below string 
			    	var sFolderMetadataPath = sMetadataPath + "/";
		        	// stored metadata pathes
		        	var aMetadataPathes = _.keys(oProjectMetadataStorage);
		        	for (var i = 0; i < aMetadataPathes.length; i++) {
		        		// stored metadata path
		        		var sStoredMetadataPath = aMetadataPathes[i];
		        		// check if a metadata path is a child metadata path
						if (sStoredMetadataPath.indexOf(sFolderMetadataPath) === 0) {
							return true;
						}
		        	}
				}
			}
			
			return false;
		},
		
		/**
		 * deletes metadata from cache
		 * @param sMetadataPath
		 * @param bWithChildren
		 */
		deleteMetadata: function(sMetadataPath, bWithChildren) {
			bWithChildren = (bWithChildren === true); // get boolean value
			
			// get project path
			var sProjectPath = this._getProjectPath(sMetadataPath);
			if (sProjectPath) {
				if (sProjectPath === sMetadataPath) {
					delete this._oMetadataStorage[sProjectPath];
					return;
				}
				
				// get project metadata storage
				var oProjectMetadataStorage = this._getProjectMetadataStorage(sProjectPath);
				if (oProjectMetadataStorage) {
					// delete metadata 
				    delete oProjectMetadataStorage[sMetadataPath];
				    // delete also the folder metadata children
				    if (bWithChildren) {
				    	// a child metadata path must start with the below string 
				    	var sFolderMetadataPath = sMetadataPath + "/";
			        	// stored metadata pathes
			        	var aMetadataPathes = _.keys(oProjectMetadataStorage);
			        	for (var i = 0; i < aMetadataPathes.length; i++) {
			        		// stored metadata path
			        		var sStoredMetadataPath = aMetadataPathes[i];
			        		// check if a metadata path is a child metadata path
			        		if (sStoredMetadataPath.indexOf(sFolderMetadataPath) === 0) {
			        			// delete child metadata from the map
			        			delete oProjectMetadataStorage[sStoredMetadataPath];
			        		}
			        	}
				    }
				}
			}
		},
		
		/**
		 * returns metadata from cache
		 * @param sMetadataPath
		 * @param bWithChildren
		 * @param bDirectChildren
		 */
		getMetadata: function(sMetadataPath, bWithChildren, bDirectChildren) {
		    bWithChildren = (bWithChildren === true); // get boolean value
			bDirectChildren = (bDirectChildren === true); // get boolean value
			
			// get project path
			var sProjectPath = this._getProjectPath(sMetadataPath);
			if (sProjectPath === "") {
				// get direct children metadata of all projects
				return this._getRootProjectsMetadata();
			}
			
			if (sProjectPath) {
				// get project metadata storage
				var oProjectMetadataStorage = this._getProjectMetadataStorage(sProjectPath);
				if (oProjectMetadataStorage) {
					// return  also the metadata children
					if (bWithChildren) {
						// a child metadata path must start with the below string 
				    	var sFolderMetadataPath = sMetadataPath + "/";
			        	var aChildrenMetadata = {};
			        	// stored metadata pathes
			        	var aMetadataPathes = _.keys(oProjectMetadataStorage);
			        	for (var i = 0; i < aMetadataPathes.length; i++) {
			        		// stored metadata path
			        		var sStoredMetadataPath = aMetadataPathes[i];
			        		// check if a metadata path is a child metadata path
							if (sStoredMetadataPath.indexOf(sFolderMetadataPath) === 0) {
								// check if direct child metadata path
			        			if (bDirectChildren === true && (sStoredMetadataPath.replace(sFolderMetadataPath, "").indexOf("/") === -1)) {
			        				// collect direct child metadata
			        				aChildrenMetadata[sStoredMetadataPath] = oProjectMetadataStorage[sStoredMetadataPath];
			        			} else if (bDirectChildren === false) { 
			        				// collect child metadata
				        			aChildrenMetadata[sStoredMetadataPath] = oProjectMetadataStorage[sStoredMetadataPath];
				        		}
			        		}
			        	}
			        	// return children metadata (array)
			        	return aChildrenMetadata;
				    } 
				    // return single metadata (object)
				    return oProjectMetadataStorage[sMetadataPath];
				}
			}
		},
		
		_getRootProjectsMetadata : function() {
			var aProjectPathes = Object.keys(this._oMetadataStorage);
			var oProjectsMetadata = {};
			for (var i = 0; i < aProjectPathes.length; i++) {
				var sProjectPath = aProjectPathes[i];
				oProjectsMetadata[sProjectPath] = this.getMetadata(sProjectPath);
			}
			
			return oProjectsMetadata;
		},
		
		/**
		 * stores new metadata values and updates existing metadata 
		 * @param oMetadataValues
		 */ 
		setMetadata: function(oMetadataValues) {
			if (_.isObject(oMetadataValues)) {
				var aMetadataPathes = _.keys(oMetadataValues);
				if (_.isEmpty(aMetadataPathes)) {
					return;
				}
				
				var sProjectPath = this._getProjectPath(aMetadataPathes[0]);
				if (sProjectPath) {
					var oProjectMetadataStorage = this._getProjectMetadataStorage(sProjectPath);
					if (oProjectMetadataStorage === undefined) {
						oProjectMetadataStorage = {};
					}
					
					oProjectMetadataStorage = $.extend(oProjectMetadataStorage, oMetadataValues);
					this._oMetadataStorage[sProjectPath] = oProjectMetadataStorage;
				}
			}
		}
	};

	return MetadataManager;
});