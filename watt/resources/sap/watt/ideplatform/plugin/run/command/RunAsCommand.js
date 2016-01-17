define(["sap/watt/lib/lodash/lodash"], function(_) {
	
	"use strict";
	
	var context;
	
	var _setContext = function(oContext) {
		context = oContext;
	};

    var _checkFileType = function(oDocument, aFileType) {
        if (aFileType.indexOf("*") === 0) {
            //check type
            var sFullPath = oDocument.getEntity().getFullPath();
            var sTypeToCompareTo = aFileType.substr(2);
            return (sFullPath.substr(sFullPath.length - sTypeToCompareTo.length) === sTypeToCompareTo);
        }
        
        // check name ends with
        var sName = oDocument.getEntity().getName();
        return sName === aFileType;
    };
    
    var _createConfigurationForRunner = function(aConfigurations, oRunner, oSelectedDocument, sWindowId, oVisibleDisplayNames) {
		// check that the document is suitable for the runner
		var isSuitableForRunner = _.find(oRunner.fileTypes, function(sFyleType) {
			return _checkFileType(oSelectedDocument, sFyleType);
		});
		
		if (isSuitableForRunner) {
			// create a new configuration for the document
			return context.service.configurationhelper.createConfiguration(oRunner, oSelectedDocument, sWindowId, false, oVisibleDisplayNames);			
		}
		// find a first configuration of the runner
		var oExistingConfigurationForRunner = _.find(aConfigurations, function(oConfiguration) {
			return oRunner.sId === oConfiguration._metadata.runnerId;
    	});
		// return if found
		if (oExistingConfigurationForRunner) {
			return oExistingConfigurationForRunner;			
		}
		
		if (!sWindowId) {
			return undefined;
		}
		
		// no suitable configuration was found, create a new configuration
		return context.service.configurationhelper.createConfiguration(oRunner, oSelectedDocument, sWindowId, false, oVisibleDisplayNames);
    };
    
    var _getConfiguration = function(oSelectedDocument, sWindowId, oRunner, oVisibleDisplayNames) {
    	// get all persisted project configurations
    	return context.service.configurationhelper.getAllPersistedConfigurations().then(function(aConfigurations) {
			var sDocumentPath = oSelectedDocument.getEntity().getFullPath();
			//  get an existing (first found) run configuration for a selected document and provided runner
			var oExistingConfigurationForTheRunner = _.find(aConfigurations, function(oConfiguration) {
	    		return oConfiguration.filePath === sDocumentPath && oRunner.sId === oConfiguration._metadata.runnerId;
	    	});
			// return if found
			if (oExistingConfigurationForTheRunner) {
    			return oExistingConfigurationForTheRunner;
    		}
			
			return _createConfigurationForRunner(aConfigurations, oRunner, oSelectedDocument, sWindowId, oVisibleDisplayNames);
    	});
    };

    return {
    	getConfiguration : _getConfiguration,
    	setContext : _setContext,
    	createConfigurationForRunner : _createConfigurationForRunner,
    	checkFileType : _checkFileType
    };
});