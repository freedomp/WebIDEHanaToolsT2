define(["sap/watt/lib/lodash/lodash"], function (_) { 
	"use strict";
	
	return {
		_createUniqConfigurationName : function(initialName, otherVisibleConfigurationNames) {
	    	otherVisibleConfigurationNames = (otherVisibleConfigurationNames ? otherVisibleConfigurationNames : []);
	    	
	    	return this.context.service.runconfigurationhistory.getConfigurationNames().then(function(aConfigurationNames) {
	    		aConfigurationNames = aConfigurationNames.concat(otherVisibleConfigurationNames);
	    		aConfigurationNames = _.uniq(aConfigurationNames, function(sConfigurationName) {
	    		    return sConfigurationName.toLowerCase();
	    		});
	    		
	    		initialName = initialName.trim();
	    		var uniqName = initialName;
	    		var i = 0;
	    		var index = _.findIndex(aConfigurationNames, function(sConfigurationName) {
	    		    return sConfigurationName.toLowerCase() === uniqName.toLowerCase();
	    		});
	    		while (index !== -1) {
	    		    i++;
	    		    uniqName = initialName + " " + i;
	    		    index = _.findIndex(aConfigurationNames, function(sConfigurationName) {
	    		        return sConfigurationName.toLowerCase() === uniqName.toLowerCase();
	    		    });
	    		}
	    		
	    		return uniqName;
	    	});
	    },
	    
        createConfiguration : function(oRunner, oDocument, sWindowId, isRunConfigurationFlow, otherConfigurationNames) {
            var that = this;
            isRunConfigurationFlow = (isRunConfigurationFlow ? isRunConfigurationFlow : false);
                            
                    if (oRunner) {
                return oRunner.oService.createDefaultConfiguration(oDocument, isRunConfigurationFlow, sWindowId).then(function(oConfiguration) {
                    if (oConfiguration) {
                                    return that._getOtherConfigurationNames(isRunConfigurationFlow, otherConfigurationNames).then(function(otherConfigurationNames) {
                                                    return that._createConfigurationMetadata(oRunner, otherConfigurationNames).then(function(_metadata) {
                                                                     oConfiguration._metadata = _metadata;
                                                                     return oRunner.oService.isConfigurationValid(oConfiguration, oDocument).then(function(bValid) {
                                                                        if (!bValid) {
                                                                            oConfiguration._metadata.hasIssues = true;
                                                                        } 
                                                                        
                                                                        return oConfiguration;
                                                                     });
                                                    });
                                    });
                    }
                });
            } 
            return Q();
    },

	    
	    _getOtherConfigurationNames : function(isRunConfigurationFlow, oRunConfigurationDisplayNames) {
	    	if (_.isEmpty(oRunConfigurationDisplayNames)) {
	    		return this._getPersistedConfigurationNames();
	    	}
	    	
	    	return Q(oRunConfigurationDisplayNames);
	    },
	    
	    _createConfigurationMetadata : function(oRunner, otherConfigurationNames) {
            return this._createUniqConfigurationName(this.context.i18n.getText("i18n", "run_newRunner", [oRunner.displayName]), otherConfigurationNames).then(function(sDisplayName) {
	        	 var _metadata =  {
	                 runnerId : oRunner.sId,
	                 id : Math.floor((Math.random() * 10000000) + 1),
	                 displayName : sDisplayName
	        	 };
	        	 return _metadata;
            });
	    },
	    
	    _getPersistedConfigurationNames : function() {
	    	return this.getAllPersistedConfigurations().then(function(aConfigurations) {
	    		var aConfigurationNames = [];
	    		_.forEach(aConfigurations, function(oConfiguration) {
	    			if (oConfiguration._metadata && oConfiguration._metadata.displayName) {
	    				aConfigurationNames.push(oConfiguration._metadata.displayName);
	    			}
	    		});
	    		
	    		return _.uniq(aConfigurationNames);
	    	});
	    },
	    
	    getAllPersistedConfigurations : function(oDocument) { 
	        return this.context.service.setting.user.get(this.context.service.run, oDocument).then(function(aConfigurations) {
	            return aConfigurations || [];
	        });                  
		},

		writeConfigurationsToFile : function(aConfigurationToWrite, oDocument) {
			var that = this;
			var oDocumentPromise = (oDocument ? Q(oDocument) : this.context.service.run.getSelectedDocument());
			
			return oDocumentPromise.then(function(oDoc){
				return that.context.service.setting.user.set(that.context.service.run, aConfigurationToWrite, oDoc);
			}).fail(function(oError) {
				that.context.service.usernotification.alert(oError.message).done();
				return Q.reject(oError.message);
			});
		}
	};
});