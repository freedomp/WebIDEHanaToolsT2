define(["./Preferences", "../util/PathMapping"], function(oPreferencesDAO, mPathMapping) {
	"use strict"; 
	return {

		_sNodeNamePrefix: "UserProjectSettings",
		_mWorkspace: mPathMapping.workspace,
		
        set: function(sSettingsName, vSettings, oDocument) { 	
        	var that = this;
			return this._getProjectPathFromDocument(oDocument).then(function(sProjectPath) {
				var sNodeName = that._getNodeName(sProjectPath, sSettingsName);
				var oSettings = {settings: vSettings};
				return oPreferencesDAO.set(oSettings, sNodeName);
			});    	
        },

		get: function(sSettingsName, oDocument) {
			var that = this;
			return this._getProjectPathFromDocument(oDocument).then(function(sProjectPath) {
				var sNodeName = that._getNodeName(sProjectPath, sSettingsName);
				return oPreferencesDAO.get(sNodeName).then(function(oSettings) {
					return oSettings ? oSettings.settings : null;
				});
			});
		},
        
        _getProjectPathFromDocument: function(oDocument) {
        	return oDocument.getProject().then(function(oProjectDocument) {
        		return oProjectDocument.getEntity().getFullPath();
        	});
        },
        
        _getNodeName: function(sProjectPath, sSettingsName) {
        	return this._sNodeNamePrefix + "." + this._mWorkspace.id + "." + sProjectPath.replace(/\//g, "_") + "." + sSettingsName;
        }
	};
});