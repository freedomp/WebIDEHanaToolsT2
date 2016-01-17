//TODO consider the location of this service, since it does not access the orion BE
define(["sap/watt/lib/lodash/lodash"], function(_) {
    
	"use strict";

	return {
		_mProjectTypes : {},

		initProjectType: function(mConfig) {

			/* to be adjusted when we support multiple configuration calls */
			function cloneProjectType(oProjectType) {
				var oCloned = {};
				// Clone the object. It's a shallow clone except for array properties, since the rest of the properties
				// are primitives (strings).
				for (var sPropName in oProjectType) {
					var propValue = oProjectType[sPropName];
					if (propValue instanceof Array) {
						// Shallow-clone the array (the only property with array value - includes - contains only strings)
						propValue = propValue.map(function (s) { return s; });
					}
					oCloned[sPropName] = propValue;
				}
				return oCloned;
			}

			if (mConfig.types) {
				// Add configured project types to the map.
				// Note: circular includes are not checked here, instead they are handled in getIncludedTypes by being ignored.
				var that = this;
				mConfig.types.forEach(function(oProjectType) {
					oProjectType = cloneProjectType(oProjectType);
					if (!oProjectType || !oProjectType.id) {
						// Error to the log
						if (!oProjectType) {
							that.context.service.log.error("project type",
								that.context.i18n.getText("i18n","project_type_bad_project_type_configuration_ignored",[JSON.stringify(oProjectType)]),
								["system"]).done();
						} else if (!oProjectType.id) {
							that.context.service.log.error("project type",
								that.context.i18n.getText("i18n", "project_type_bad_project_type_configuration_missing_id",[JSON.stringify(oProjectType)]),
								["system"]).done();
						}
						return; // Continue to the next configured project type
					}

					var projectTypeId = oProjectType.id;

					// Add the project type to the map if it doesn't exist
					if (!that._mProjectTypes.hasOwnProperty(projectTypeId)) {
						// Set defaults for optional parameters
						oProjectType.displayName = oProjectType.displayName || oProjectType.id;
						oProjectType.description = oProjectType.description || "";
						oProjectType.includes = oProjectType.includes || [];
						oProjectType.decoratorIconStyleClass = oProjectType.decoratorIconStyleClass || "";

						that._mProjectTypes[projectTypeId] = oProjectType;
					} else {
						// Error to the log
						that.context.service.log.error("project type",
							that.context.i18n.getText("i18n","project_type_project_configured_multiple_definition",
								[projectTypeId,that._mProjectTypes[projectTypeId].displayName]),
							["system"]).done();
					}
				});
			}
			if(mConfig.builtInTypes){
				mConfig.builtInTypes.forEach(function(sTypeId){
					var oProjectType = that._mProjectTypes[sTypeId];
					if(oProjectType){
						oProjectType.isBuiltIn = true;
					}else{
						that.context.service.log.error("project type",
							that.context.i18n.getText("i18n", "project_type_project_not_configured_for_builtin",[sTypeId]),
							["system"]).done();
					}
				});
			}
			if(mConfig.defaultTypes){
				mConfig.defaultTypes.forEach(function(sTypeId){
					var oProjectType = that._mProjectTypes[sTypeId];
					if(oProjectType){
						if(!oProjectType.isBuiltIn){
							oProjectType.isDefault = true;
						}else{
							that.context.service.log.error("project type",
								that.context.i18n.getText("i18n", "project_type_project_duplicate_configration",[sTypeId]),
								["system"]).done();
						}
					}else{
						that.context.service.log.error("project type",
							that.context.i18n.getText("i18n","project_type_project_not_configured_for_default",[sTypeId]),
							["system"]).done();
					}
				});
			}
		},

		getAllTypes: function(){
			var mProjectTypes = this._mProjectTypes;
			// Return array of project type, created from the project types map. The objects are cloned.
			return Object.keys(mProjectTypes).map(function(key) {
				return Object.create(mProjectTypes[key]);
			});

		},

		getProjectTypes: function (oTargetDocument) {
			var mProjectTypes = this._mProjectTypes;
			return this._getProjectTypesIDs(oTargetDocument).then(function (aProjectTypes) {
				return aProjectTypes.map(function (sProjectType) {
					return mProjectTypes[sProjectType];
				});
			});
		},

		// Document related functions

		// Private method - return the project's project types as a list of ids
		// always adds the builtIn types
		// if there are no types, default types are added (unless bAddDefaultTypes is set false)

		_getProjectTypesIDs: function (oTargetDocument, bAddDefaultTypes) {
			if (bAddDefaultTypes === undefined) {
				bAddDefaultTypes = true;
			}
			
			var mProjectTypes = this._mProjectTypes;
			var that = this;

			return this.context.service.setting.project.get(this.context.service.projectType, oTargetDocument).then(function (aExistingProjectTypes) {
				var aProjectTypeIds = [];
				if ($.isArray(aExistingProjectTypes) && aExistingProjectTypes.length > 0) {
				    aProjectTypeIds = _.intersection(_.keys(mProjectTypes), aExistingProjectTypes);
				} else {
					if (bAddDefaultTypes) {
						aProjectTypeIds = that._getDefaultTypesIds();
						// aProjectTypeIds = aProjectTypeIds.concat(aBuiltInTypesIds);
					}
				}
				var aBuiltInTypesIds = that._getBuiltInTypesIds();
				aProjectTypeIds = that._getUniqueValues(aProjectTypeIds.concat(aBuiltInTypesIds));
				return aProjectTypeIds;
			});
		},

		_getDefaultTypesIds: function () {
    		var aIds = [];
    		var mProjectTypes = this._mProjectTypes;
    		for(var sTypeId in mProjectTypes){
    			if(mProjectTypes.hasOwnProperty(sTypeId) && mProjectTypes[sTypeId].isDefault){
    				aIds.push(sTypeId);
    			}
    		}
    		
    		return aIds;
	    },

    	_getBuiltInTypesIds: function () {
    		var aIds = [];
    		var mProjectTypes = this._mProjectTypes;
    		for(var sTypeId in mProjectTypes){
    			if(mProjectTypes.hasOwnProperty(sTypeId) && mProjectTypes[sTypeId].isBuiltIn){
    				aIds.push(sTypeId);
    			}
    		}
    		return aIds;
    	},

    	/**
    	 * Return a copy of the array with unique values. The array values should be of the same primitive type.
    	 * @param aValues - array of values
    	 * @return array with the same values, without duplicates
    	 */
		_getUniqueValues: function(aValues) {
    		var mExistingValues = {};
    		return aValues.filter(function(value) {
    			// Put the existing values in a map and filter out the existing values
    			if (mExistingValues.hasOwnProperty(value)) {
    				return false;
    			}
    			
    			mExistingValues[value] = true;
    			return true;
    		});
    	},

    	getIncludedTypes: function (sProjectTypeID) {
    	    // Keep uniqueness and ignore circular references
    		 var mTypeIDs = {};
    		 var that = this;
    
    		 // Validate a project type. Returns true if it can be added to the list.
    		 function isValidAndUnique(sProjectTypeID) {
    		    return that._mProjectTypes.hasOwnProperty(sProjectTypeID) && !mTypeIDs.hasOwnProperty(sProjectTypeID);
    		 }
    
    		 var aIncludedTypes = [];
    		 if (isValidAndUnique(sProjectTypeID)) {
    		    aIncludedTypes.push(sProjectTypeID);
    		    mTypeIDs[sProjectTypeID] = true;
    		 }
    
    		 // Note: values get added to aIncludedTypes during the loop, so the length changes.
    		for (var i = 0; i < aIncludedTypes.length; ++i) {
        		 // Add the current type's included types at the end (if they're valid and unique)
        		 var sTypeID = aIncludedTypes[i];
        		 var aIncludes = this._mProjectTypes[sTypeID].includes || [];
        		 aIncludes.forEach(function (sCurrIncluded) {
        		    // Note: circular includes are not unique in thr array so they are not added here.
            		if (isValidAndUnique(sCurrIncluded)) {
            		    aIncludedTypes.push(sCurrIncluded);
            		    mTypeIDs[sCurrIncluded] = true;
                    }
    		    });
    		 }
    		 
    		 return aIncludedTypes;
    	 },

    	getProjectTypesPerCategories: function (oTargetDocument){
    		var oProjectTypesPerCategories = {
    			builtInProjectTypes:[],
    			defaultProjecTypes:[],
    			projectTypes:[]
    		};
    		var aBuiltInProjectTypes = this._getBuiltInTypesIds();
    		var aDefaultProjectTypes = this._getDefaultTypesIds();
    		return this._getProjectTypesIDs(oTargetDocument).then(function (aProjectTypes) {
    	        oProjectTypesPerCategories.builtInProjectTypes = _.intersection(aProjectTypes, aBuiltInProjectTypes);
    			oProjectTypesPerCategories.defaultProjecTypes = _.intersection(aProjectTypes, aDefaultProjectTypes);
    			oProjectTypesPerCategories.projectTypes = _.difference(aProjectTypes, oProjectTypesPerCategories.builtInProjectTypes.concat(oProjectTypesPerCategories.defaultProjecTypes));
    			return oProjectTypesPerCategories;
    		});
    	},
    
    	getType: function(sProjectTypeID){
    		return this._mProjectTypes[sProjectTypeID] ? Object.create(this._mProjectTypes[sProjectTypeID]) : null;
    	},
    	
    	/**
         * Return an array which only contains the values in aValues without the values in aValuesToRemove.
         * The values can be of any types, equality is checked with Array.indexOf method.
         * @param aValues
         * @param aValuesToRemove
         * @return array
         */
        _arrayDifference : function(aValues, aValuesToRemove) {
            // Filter out the values in aValuesToRemove
            return aValues.filter(function(value) { return aValuesToRemove.indexOf(value) < 0; });
        },

		removeProjectTypes: function (oTargetDocument, aProjectTypeIDs) {
			var oProject = this.context.service.setting.project;
			var oProjectType = this.context.service.projectType;
			var that = this;
			return this._getProjectTypesIDs(oTargetDocument).then(
				function (aExistingProjectTypes) {
					// Filter from the existing project types the type IDs in aProjectTypeIDs
					aExistingProjectTypes = that._filterOutBuiltInTypes(aExistingProjectTypes);
					var aTypesToSet = that._arrayDifference(aExistingProjectTypes, aProjectTypeIDs);
					return oProject.set(oProjectType, aTypesToSet, oTargetDocument).then(function () {
						// The removed types are those which existed before and were not set
						var aRemovedTypes = that._arrayDifference(aExistingProjectTypes, aTypesToSet);
						return {"oTargetDocument":oTargetDocument, "aAddedTypes":[], "aRemovedTypes":aRemovedTypes};
					});
				});
		},
        
    	addProjectTypes : function(oTargetDocument, aProjectTypeIDs) {
            if (!aProjectTypeIDs) {
                return Q();
            }
            
            var oProject = this.context.service.setting.project;
            var oProjectType = this.context.service.projectType;
            var that = this;
            return this._getProjectTypesIDs(oTargetDocument, false).then(function(aExistingProjectTypes) {
                var aTypesToSet = [];
                // Add the project type and its included project types
                aProjectTypeIDs.forEach(function (sProjectTypeID) {
                    aTypesToSet.push.apply(aTypesToSet, that.getIncludedTypes(sProjectTypeID));
                });
                
                // Types which were sent and already existed are removed here in the uniqueness check.
                // Their included types are still added.
                aTypesToSet = that._getUniqueValues(aExistingProjectTypes.concat(aTypesToSet));
                // never write the built in libraries to settings
                aTypesToSet = that._filterOutBuiltInTypes(aTypesToSet);
                
                return oProject.set(oProjectType, aTypesToSet, oTargetDocument).then(function () {
                    // The newly added types are those which were set and did not exist before
                    var aAddedTypes = that._arrayDifference(aTypesToSet, aExistingProjectTypes);
					// Fire the event (it is fired in projectType service)
					return {"oTargetDocument":oTargetDocument, "aAddedTypes":aAddedTypes, "aRemovedTypes": []};
                });
            });
        },

		setProjectTypes: function (oTargetDocument, aProjectTypeIDs) {
			var that = this;
			return this._getProjectTypesIDs(oTargetDocument).then(function (aExistingProjectTypes) {
				var aTypesToSet = that._getUniqueValues(aProjectTypeIDs || []);
				// aTypesToSet = that._filterOutBuiltInTypes(aTypesToSet);
				return that.context.service.setting.project.set(
					that.context.service.projectType, aTypesToSet, oTargetDocument).then(function () {
						// Calculate the diff
						// The added project types are those which did not exist and were set
						aExistingProjectTypes = that._filterOutBuiltInTypes(aExistingProjectTypes);
						var aAddedTypes = that._arrayDifference(aTypesToSet, aExistingProjectTypes);
						// The removed project types are those which existed and were not set
						var aRemovedTypes = that._arrayDifference(aExistingProjectTypes, aTypesToSet);
						// If no types were added or removed, but the order changed, we want to force firing the event
						var bForce = false;
						if (aAddedTypes.length === 0 && aRemovedTypes.length === 0 && aExistingProjectTypes.length === aTypesToSet.length) {
							for (var i = 0; i < aExistingProjectTypes.length; ++i) {
								if (aExistingProjectTypes[i] !== aTypesToSet[i]) {
									bForce = true;
									break;
								}
							}
						}

						// Fire the event (it is fired in projectType service)
						return {"oTargetDocument":oTargetDocument, "aAddedTypes":aAddedTypes, "aRemovedTypes":aRemovedTypes, "bForce":bForce};
					});
			});
		},

		_filterOutBuiltInTypes: function(aTypesIds) {
			var that = this;
			return aTypesIds.filter(function(typeId){
				return !that._mProjectTypes[typeId].isBuiltIn;
			});
		}

		// Fire update event if anything changed (project types were added or removed) or forced
/*		_fireProjectTypesUpdated: function (oTargetDocument, aAddedTypes, aRemovedTypes, bForce) {
			if (bForce || aAddedTypes.length > 0 || aRemovedTypes.length > 0) {
				var that = this;
				return oTargetDocument.getProject().then(function (oProject) {
					//return that.context.event.fireProjectTypesUpdated({
					return that.context.service.projectType.context.event.fireProjectTypesUpdated({
						"projectDocument": oProject,
						"added": aAddedTypes,
						"removed": aRemovedTypes
					});
				});
			}

			return Q();
		}
		*/
	};
});