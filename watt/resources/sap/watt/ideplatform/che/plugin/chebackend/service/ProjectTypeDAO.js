define(["sap/watt/lib/lodash/lodash", "../io/Request", "../dao/Project", "sap/watt/ideplatform/plugin/projectType/service/ProjectTypeMetadata", "../util/PathMapping"],
    function (_, Request, oProjectDao, ProjectTypeMetadata /*, mPathMapping*/) {
        
	"use strict";
	
	return {

		_mProjectTypes : {},
		//TODO un comment in SPS12 - when mixins type will be in scope
		/******
		 _mWorkspace: mPathMapping.workspace,
		*****/

		initProjectType: function() {
			var that = this;
			//return all the available project type from che back-end
			return oProjectDao.getProjectTypes().then(function(aTypes) {
				//create ProjectTypeMetadata from the result
				if (aTypes) {
					_.forEach(aTypes, function(oCheProjectType) {
						var oProjectTypeMetadata = 
						    new ProjectTypeMetadata(oCheProjectType.id, oCheProjectType.displayName, 
						                            oCheProjectType.mixable, oCheProjectType.primaryable, 
						                            oCheProjectType.attributeDescriptors, oCheProjectType.runnerCategories);
						that._mProjectTypes[oCheProjectType.id] = oProjectTypeMetadata;
					});
				}
				
				return that._mProjectTypes;
			});
		},

		getAllTypes: function(){
			// Return array of project type, created from the project types map. The objects are cloned.
			var that = this;
			return Object.keys(this._mProjectTypes).map(function(key) {
				return _.clone(that._mProjectTypes[key]);
			});
		},

		getProjectTypes: function (oTargetDocument) {
			var that = this;
			return oTargetDocument.getProject().then(function(oProjectDocument) {
				if (oProjectDocument) {
					return that._getProjectTypesIDs(oProjectDocument).then(function (aProjectTypeIds) {
						if (!aProjectTypeIds) {
							return [];
						}
						// delete the property isBuiltIn which was set in the previous right click on project.
						// In general we shouldn't touch properties from that._mProjectTypes because it should reflect all types as in the sever.
						// but in this case it is limitation because of the competability also to orion. There is no other place to do this seter.
						var ids = Object.keys(that._mProjectTypes);
						for (var i = 0; i < ids.length; i++) {
							delete that._mProjectTypes[ids[i]].isBuiltIn;
						}
						var aProjectTypes = [];
						var primType = oProjectDocument.getProjectMetadata().type;
						/*The primary type (Base Type) is represented via the isBuiltIn property
						 and it should be reflected in the result which being return from this function*/
						that._mProjectTypes[primType].isBuiltIn = true;

						for (var i = 0; i < aProjectTypeIds.length; i++) {
							aProjectTypes.push(that._mProjectTypes[aProjectTypeIds[i]]);
						}
						return aProjectTypes;
					});
				}
			});
		},

		_getProjectMetadata : function(oDocument) {
			return oDocument.getProject().then(function(oProjectDocument) {
				if (oProjectDocument && oProjectDocument.getProjectMetadata) {
					return oProjectDocument.getProjectMetadata();
				}
			});
		},

		_getProjectTypes : function(oProjectMetadata) {
			var aProjectTypes = [];
			
			if (oProjectMetadata.mixins) {
				var aMixinsProjectTypes = oProjectMetadata.mixins.slice(0);
				aProjectTypes.concat(aMixinsProjectTypes);	
			}
			
			aProjectTypes.push(oProjectMetadata.type);
			
			return aProjectTypes;
		},

		_getProjectTypesIDs: function(oDocument) {
			var that = this;
			return this._getProjectMetadata(oDocument).then(function(oProjectMetadata) {
				if (oProjectMetadata) {
					return that._getProjectTypes(oProjectMetadata);
				}
			});
		},

		getIncludedTypes:function (sProjectTypeID) {
			// TODO: undersatnd if includ is neccasserry!!
			return [sProjectTypeID];
		},

		getType: function(sProjectTypeID){
			return this._mProjectTypes[sProjectTypeID] ? _.clone(this._mProjectTypes[sProjectTypeID]) : null;
		},
		
		getProjectTypesPerCategories: function (oTargetDocument) {
    		return this._getProjectMetadata(oTargetDocument).then(function(oProjectMetadata) {
    	        var oProjectTypesPerCategories = {
    			    builtInProjectTypes:[oProjectMetadata.type],
    			    defaultProjecTypes:[],
    			    projectTypes:oProjectMetadata.mixins
    		    };
    		
    		    return oProjectTypesPerCategories;
    		});
		},

		addProjectTypes : function(oTargetDocument, aProjectTypeIDs) {
			if (!aProjectTypeIDs) {
				return Q();
			}
		},

		removeProjectTypes: function (oTargetDocument, aProjectTypeIDstoRemove) {
			if (!aProjectTypeIDstoRemove) {
				return Q();
			}
		},

		setProjectTypes: function (oTargetDocument, aProjectTypeIDs) {
			if (!aProjectTypeIDs) {
				return Q();
			}
		}



//TODO un comment in SPS12 - when mixins type will be in scope
/*
		_buildProjectTypesDataObject : function(sPrimaryType, aProjectTypeIDs){
			var data = {
				"mixinTypes" : _.uniq(aProjectTypeIDs),
				"type": sPrimaryType
			};
			return data;
		},

		_arrayDifference : function(aValues, aTypesIdsToCheckDiff) {
			// Filter out the values in aTypesIdsToCheckDiff
			return aValues.filter(function(value) { return aTypesIdsToCheckDiff.indexOf(value) === -1; });
		},
		
		addProjectTypes : function(oTargetDocument, aProjectTypeIDs) {
			var that = this;
			if (!aProjectTypeIDs) {
				return Q();
			}
			return that._getProjectMetadata(oTargetDocument).then(function(oProjectMetadata){
				aProjectTypeIDs = aProjectTypeIDs.concat(oProjectMetadata.mixins);
				return that.setProjectTypes(oTargetDocument, aProjectTypeIDs);
			});

		},

		removeProjectTypes: function (oTargetDocument, aProjectTypeIDstoRemove) {
			var that = this;
			var aMixinsProjectTypesIDs = [];
			if (!aProjectTypeIDstoRemove) {
				return Q();
			}
			return that._getProjectMetadata(oTargetDocument).then(function(oProjectMetadata){
				aMixinsProjectTypesIDs = oProjectMetadata.mixins;
				_.remove(aMixinsProjectTypesIDs, function(oMixinsProjectType) {
					return aProjectTypeIDstoRemove.indexOf(oMixinsProjectType) >= 0;
				});
				return that.setProjectTypes(oTargetDocument, aMixinsProjectTypesIDs);
			});
		},

		setProjectTypes: function (oTargetDocument, aProjectTypeIDs) {
			var that = this;
			if (!aProjectTypeIDs) {
				return Q();
			}
			aProjectTypeIDs = _.uniq(aProjectTypeIDs);
			var amixinsProjectTypesIDsToSet = that._removeNotMixableTypesFromArry(aProjectTypeIDs)|| [];
			return that._getProjectMetadata(oTargetDocument).then(function(oProjectMetadata){
				if(oProjectMetadata){
					var oData = that._buildProjectTypesDataObject(oProjectMetadata.type, amixinsProjectTypesIDsToSet);
						return oProjectDao.updateProject(that._mWorkspace.id, oProjectMetadata.name, oData).then(function(oResult) {
							//Return only the new types which need to be sdded.
							var aAddedTypes = that._arrayDifference(amixinsProjectTypesIDsToSet, _.uniq(oProjectMetadata.mixins));
							// The removed types are those which existed before and were not set
							var aRemovedTypes = that._arrayDifference(_.uniq(oProjectMetadata.mixins), amixinsProjectTypesIDsToSet);
							// Fire the event (it is fired in projectType service)
							return {"oTargetDocument":oTargetDocument, "aAddedTypes":aAddedTypes, "aRemovedTypes":aRemovedTypes};
						}).fail(function(oError){
							return that.context.service.log.error("projectType - set", oError.responseText, ["user"]);
						})
				}
			});
		},

		_removeNotMixableTypesFromArry : function(aProjectTypeIDs){
			// Types which are not mixable will be remove from  aProjectTypeIDs
			// because we want to set to the project only mixins types.
			var that = this;
			var allProjectTypes = this.getAllTypes();
			var aRemovedProjectTypesIDs = [];
			// return to the array types which are bMixable === false.
			var aNotMixableProjectTypes =_.remove(allProjectTypes, function(oProjectType) {
				return (oProjectType.bMixable === false);
			});
				_.forEach(aNotMixableProjectTypes, function(oPrimaryableProjectType) {
					var index = _.indexOf(aProjectTypeIDs, oPrimaryableProjectType.id)	;
					if(index >= 0){
						// remove Not Mixable Project Types from the returned array
						aRemovedProjectTypesIDs.push(aProjectTypeIDs.splice(index,1)[0]);
					}
				});
			if(aProjectTypeIDs.length > 0){
				that.context.service.log.warn("Not mixable projectTypes which was not set:", aRemovedProjectTypesIDs.join(), ["user"]);

			}
			return aProjectTypeIDs;
		}
*/
	};

});