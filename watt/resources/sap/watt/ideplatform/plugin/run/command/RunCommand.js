define(["sap.watt.ideplatform.run/command/RunAsCommand", "sap/watt/lib/lodash/lodash"], function(RunAsCommand, _) {
	
	"use strict";
	
	var _findRunner = function(oDocument, oContext) {
    	return oContext.service.run.getRunnersForSelectedProject().then(function(aRunners) {
			for (var r = 0; r < aRunners.length; r++) {
				var oRunner = aRunners[r];
				var aFileTypes = oRunner.fileTypes;
	        	for (var ft = 0; ft < aFileTypes.length; ft++) {
	        		var sFileType = aFileTypes[ft];
	        		if (RunAsCommand.checkFileType(oDocument, sFileType)) {
	        			return oRunner;
	                }
	        	}
	        }
			
			return oContext.service.projectType.getProjectTypesPerCategories(oDocument).then(function(oCategories) {
				return _.find(aRunners, function(oSpecificRunner) {
					return _.find(oSpecificRunner.aProjectTypesIds, function(sProjectTypeId) {
						return sProjectTypeId === oCategories.builtInProjectTypes[0];
					});
				});
			});
    	});
    };
    
	var _getConfiguration = function(oSelectedDocument, sWindowId, oContext) {
    	// get all persisted project configurations
    	oContext = oContext || this.context;
    	return oContext.service.configurationhelper.getAllPersistedConfigurations().then(function(aConfigurations) {
			var sDocumentPath = oSelectedDocument.getEntity().getFullPath();
			//  get an existing (first found) run configuration for a selected document
			var oExistingConfiguration = _.find(aConfigurations, function(oConfiguration) {
	    		return oConfiguration.filePath === sDocumentPath;
	    	});
			
			if (oExistingConfiguration) {
    			return oExistingConfiguration;
    		}
    		
    		if (!sWindowId) {
    			return undefined;
    		}
    		
			// find relevant runner for a selected document
			return _findRunner(oSelectedDocument, oContext).then(function(oRunner) {
				return RunAsCommand.createConfigurationForRunner(aConfigurations, oRunner, oSelectedDocument, sWindowId);
            });				
    	});
	};

	var _prepareCommand = function(oCommandData, oContext) {
    	return oContext.service.run.getSelectedDocument().then(function(oSelectedDocument) {
    		if (oSelectedDocument) {
	    		return Q.spread([_getConfiguration(oSelectedDocument, undefined, oContext), oSelectedDocument.getProject()], function(oConfiguration, oProjectDocument) {
	    			return oContext.service.run.appcachebuster.createAppCacheBusterFile(oProjectDocument).then(function() {
		    			oCommandData.oConfiguration = oConfiguration;
		    			oCommandData.oSelectedDocument = oSelectedDocument;
		    			oCommandData.oProjectDocument = oProjectDocument;
		    			oCommandData.oRunnableDocument = null;
		    			if (oConfiguration && !oConfiguration._metadata.hasIssues && oConfiguration.filePath) {
							return oContext.service.filesystem.documentProvider.getDocument(oConfiguration.filePath).then(function(oRunnableDocument) {
								oCommandData.oRunnableDocument = oRunnableDocument;
							}).fail(function() {
								oCommandData.oRunnableDocument = null;
							});
						}
	    			});
	    		});
    		}
    	});
	};
	
    var _isAvailable = function(oCommandData) {
    	return _prepareCommand(oCommandData, this.context).then(function() {
    		return true;
    	});
    };
    
    var _isEnabled = function(oCommandData) {
        var aPromises = [];
        var oSelectedDocument = oCommandData.oSelectedDocument;
        aPromises.push(this.context.service.run.isRunConfigurationViewActive());
        aPromises.push(this.context.service.perspective.getCurrentPerspective());
        aPromises.push(this.context.service.run.getRunnersForSelectedProject());
        
        return Q.spread(aPromises, function(bActive, sPerspectiveName, aRunners) {
            if (oSelectedDocument && bActive === false && sPerspectiveName === "development" && aRunners.length > 0) {
                return true;
            }
            
            return false;
        });
    };
    
    var _execute = function() {
        // overriden by Run.js
    };

    return {
    	isAvailable : _isAvailable,
    	isEnabled : _isEnabled,
    	execute : _execute,
    	getConfiguration : _getConfiguration
    };
});