define(["sap/watt/lib/lodash/lodash"], function (_) {
        
	"use strict";
	
	var _configure = function(mConfig) {
		if (mConfig) {
			this._nodeName = mConfig.implements;
			this._maxConfigurationsToStore = mConfig.maxConfigurationsToStore;
		}
	};
	
	var _get = function(that) {
    	return that.context.service.preferences.get(that._nodeName).then(function(oStoredRunConfigurations) {
    		oStoredRunConfigurations = (oStoredRunConfigurations ? oStoredRunConfigurations : {});
    		oStoredRunConfigurations.runConfigurations = (oStoredRunConfigurations.runConfigurations ? oStoredRunConfigurations.runConfigurations : []);
    		oStoredRunConfigurations.configurationNames = (oStoredRunConfigurations.configurationNames ? oStoredRunConfigurations.configurationNames : {});
    		
    		return Q(oStoredRunConfigurations);
    	});
    };
    
    var _updateAllHistory = function(that, aNewRunConfigurations, aNewConfigurationNames) {
    	var oStoredConfigurationInfo = {"runConfigurations": aNewRunConfigurations, "configurationNames": aNewConfigurationNames};
		return that.context.service.preferences.remove(that._nodeName).then(function() {
			return that.context.service.preferences.set(oStoredConfigurationInfo, that._nodeName);
		});
    };
    
    var _isDisplayNameExists = function(sDisplayName, sConfigurationId) {
    	return _get(this).then(function(oStoredConfigurationsInfo) {
    		var aIds = _.keys(oStoredConfigurationsInfo.configurationNames);
    		
    		for (var i = 0; i < aIds.length; i++) {
    			var sId = aIds[i];
    			if (sId != sConfigurationId) {
    				 var sStoredDisplayName = oStoredConfigurationsInfo.configurationNames[sId].displayName || oStoredConfigurationsInfo.configurationNames[sId];
    				 if (sStoredDisplayName.toLowerCase() === sDisplayName.toLowerCase()) {
    					 return true;
    				 }
    			}
    		}
    		
    		return false;
    	});
    };
	
    var _store = function(oConfigurationToStore, sProjectPath) {
    	var that = this;
        
    	if (oConfigurationToStore) {
    	    // clone configuration and add project path to _metadata
    		var oRunConfigurationToStore = {};
    		oRunConfigurationToStore._metadata = _.clone(oConfigurationToStore._metadata, true);
            oRunConfigurationToStore._metadata.projectPath = sProjectPath;
            

        	return _get(this).then(function(oStoredConfigurationsInfo) {
        		var aStoredConfigurationNames = oStoredConfigurationsInfo.configurationNames;
        		var aStoredRunConfigurations = oStoredConfigurationsInfo.runConfigurations;
                // remove configuration (by id) if it already exists
            	_.remove(aStoredRunConfigurations, function(oRunConfiguration) {
            		return oRunConfiguration._metadata.id === oRunConfigurationToStore._metadata.id;
            	});

            	if (aStoredRunConfigurations.length === that._maxConfigurationsToStore) {
            	    // configuration was not found and there are already stored max configurations -- > remove the last one
            	    aStoredRunConfigurations.pop();
                } 
    			// put the configuration to the head of the array
                aStoredRunConfigurations.unshift(oRunConfigurationToStore);
                // create new configuration name
                var oConfigurationNameToStore = {
                    displayName : oRunConfigurationToStore._metadata.displayName, 
                    projectPath : oRunConfigurationToStore._metadata.projectPath
                };
                
                aStoredConfigurationNames[oRunConfigurationToStore._metadata.id] = oConfigurationNameToStore;
                
        		return _updateAllHistory(that, aStoredRunConfigurations, aStoredConfigurationNames);
        	});
    	}
    };
    
    var _update = function(aRunConfigurationsToUpdate, sProjectPath) {
    	var that = this;
    	
    	if (_.isArray(aRunConfigurationsToUpdate)) {
        	return _get(this).then(function(oStoredConfigurationsInfo) {
        		var aStoredConfigurationNames = oStoredConfigurationsInfo.configurationNames;
        		var aStoredRunConfigurations = oStoredConfigurationsInfo.runConfigurations;

        		_.forEach(aRunConfigurationsToUpdate, function(oRunConfigurationToUpdate) {
        			if (oRunConfigurationToUpdate._metadata.hasIssues !== true) { // update only configurations without issues
            			oRunConfigurationToUpdate = _.clone(oRunConfigurationToUpdate, true);
            			oRunConfigurationToUpdate._metadata.projectPath = sProjectPath;
            			
            			var index = _.findIndex(aStoredRunConfigurations, function(oStoredRunConfigurations) {
            				return oStoredRunConfigurations._metadata.id === oRunConfigurationToUpdate._metadata.id;
            			});
            			
            			if (index !== -1) {
            				aStoredRunConfigurations[index] = oRunConfigurationToUpdate;
            			}
            			// create new configuration name
            			var oConfigurationNameToStore = {
                            displayName : oRunConfigurationToUpdate._metadata.displayName, 
                            projectPath : oRunConfigurationToUpdate._metadata.projectPath
                        };

            			aStoredConfigurationNames[oRunConfigurationToUpdate._metadata.id] = oConfigurationNameToStore;
        			}
        		});
        		
        		return _updateAllHistory(that, aStoredRunConfigurations, aStoredConfigurationNames);
        	});
    	}
    };

    var _removeByProjectPath = function(sProjectPath) {
        var that = this;
        
    	return _get(this).then(function(oStoredConfigurationsInfo) {
    		var aStoredConfigurationNames = oStoredConfigurationsInfo.configurationNames;
    		var aStoredRunConfigurations = oStoredConfigurationsInfo.runConfigurations;
    		// remove stored configurations by projectPath
	        _.remove(aStoredRunConfigurations, function(oStoredRunConfiguration) { 
	            var sConfigurationPath = oStoredRunConfiguration._metadata.projectPath || oStoredRunConfiguration.filePath;
			    return sConfigurationPath.indexOf(sProjectPath) === 0; 
		    });
		    // remove stored displayNames by projectpath
		    var aIds = _.keys(aStoredConfigurationNames);
		    _.forEach(aIds, function(sId) { 
			    if (_.isObject(aStoredConfigurationNames[sId]) && aStoredConfigurationNames[sId].projectPath === sProjectPath) {
			        delete aStoredConfigurationNames[sId];
			    }
		    });

    	    return _updateAllHistory(that, aStoredRunConfigurations, aStoredConfigurationNames);
    	});
    };
    
    var _remove = function(aRunConfigurationIds) {
        var that = this;
        
    	if (_.isArray(aRunConfigurationIds)) {
        	return _get(this).then(function(oStoredConfigurationsInfo) {
        		var aStoredConfigurationNames = oStoredConfigurationsInfo.configurationNames;
        		var aStoredRunConfigurations = oStoredConfigurationsInfo.runConfigurations;
        		
        	    _.forEach(aRunConfigurationIds, function(oRunConfigurationIdToRemove) {
        	        // remove stored configuration by configuration id
        	        _.remove(aStoredRunConfigurations, function(oStoredRunConfiguration) { 
        			    return oStoredRunConfiguration._metadata.id === oRunConfigurationIdToRemove; 
        		    });
        	        // remove displayName by configuration id
        	        delete aStoredConfigurationNames[oRunConfigurationIdToRemove];
        	    });
        		
        	    return _updateAllHistory(that, aStoredRunConfigurations, aStoredConfigurationNames);
        	});
        }
    };
    
    var _getLatestConfigurations = function() {
		return _get(this).then(function(oStoredConfigurationsInfo) {
			return oStoredConfigurationsInfo.runConfigurations;
		});
    };

    var _getConfigurationNames = function() {
		return _get(this).then(function(oStoredConfigurationsInfo) {
		    var aConfigurationNamesAndProjects = _.values(oStoredConfigurationsInfo.configurationNames);
		    // create display names array 
		    var aDisplayNames = [];
		    _.forEach(aConfigurationNamesAndProjects, function(oConfigurationNamesAndProjects) {
		        if (_.isObject(oConfigurationNamesAndProjects)) {
		            aDisplayNames.push(oConfigurationNamesAndProjects.displayName);
		        } else { // in the past display name were stored as string
		            aDisplayNames.push(oConfigurationNamesAndProjects);
		        }
		    });
		    // display names are uniq and not empty/undefined
			return _.uniq(_.compact(aDisplayNames), function(displayName) {
			    return displayName.toLowerCase();
			});
		});
    };
 
    return {
    	store : _store,
    	remove : _remove,
    	removeByProjectPath : _removeByProjectPath,
    	update : _update,
    	configure : _configure,
    	getConfigurationNames : _getConfigurationNames,
    	getLatestConfigurations : _getLatestConfigurations,
    	isDisplayNameExists : _isDisplayNameExists
    };
});
