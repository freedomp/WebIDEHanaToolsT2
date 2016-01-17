define([ "sap.watt.ideplatform.orion.orionbackend/service/ProjectSettingsDAO" ], function(ProjectSettingsDAO) {
	
	"use strict";
	
	return ProjectSettingsDAO.extend("sap.watt.ideplatform.orion.orionbackend.service.UserSettingsDAO", {
	    
	    configure : function() {
			this._oIgnoreService = this.context.service.git;
		},
		
	    SETTINGS_FILE_NAME: ".user.project.json",
	    _FILE_EMPTY_VALUE : {"run":[]}
	});
});