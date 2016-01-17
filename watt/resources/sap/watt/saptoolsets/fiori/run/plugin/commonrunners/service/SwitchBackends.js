define([], function() {

	"use strict";

	return {
		configure : function() {
			this._preloadServices();
		},
		
		_preloadServices : function() {
			this.context.service.appmetadata.getNeoMetadata().fail(function() {
				// do nothing
			}).done();
		},
		//return the ui5 version from the ui5 service in HCP
		getBackendsInfo: function(oDocument) {
			
			var that = this;
	
			return that.context.service.appmetadata.getNeoMetadata(oDocument).then(function(oNeoApp) {
				var anewBE;
				var aBackendSystems = [];
				var oBackends = {aBackendSystems: []};
				if((oNeoApp !== null) && (oNeoApp.length !== 0 )){
							if (oNeoApp.routes.length > 0){
								for (var i = 0; i < oNeoApp.routes.length; i++) {
									
									if (oNeoApp.routes[i].target.type === "destination"){
										anewBE = {source: oNeoApp.routes[i].target.name, destinations: oNeoApp.routes[i].target.name};
										aBackendSystems.push(anewBE);
									}
								}
							}
					oBackends.aBackendSystems = that._checkDuplicates(aBackendSystems);
				}
				return (oBackends);
			});
		},
		
		
		getExistingRunnersBackendsInfo: function(oDocument, oConfiguration) {
			//here we make sure that existing runners show the updated state of destinations as there are written in the neo-app.json
			var that = this;
			
			return that.context.service.switchbackends.getBackendsInfo(oDocument).then(function(oBackends) {
				var aTempConfiguration = oBackends.aBackendSystems;
				if(aTempConfiguration){
					if(!oConfiguration.backendSystem)
					{
						oConfiguration.backendSystem = aTempConfiguration;
					}
					else{
						for (var i = 0;  i < aTempConfiguration.length; i++) {
						
							for (var j = 0;  j < oConfiguration.backendSystem.length; j++) {
								
								if(aTempConfiguration[i].source === oConfiguration.backendSystem[j].source)
								{
									aTempConfiguration[i].destinations = oConfiguration.backendSystem[j].destinations;
									break;
								}
							}
						}
						oConfiguration.backendSystem = aTempConfiguration;
					}
				}
				else{
					oConfiguration.backendSystem = [];
				}
				return oConfiguration;
				
			});
		},
		

		getChangedBackends: function(oRunConfiguration) {
			var sSwitchBE = "";
			if(oRunConfiguration.oSwitchBackendParameter){
				for(var i=0; i< oRunConfiguration.oSwitchBackendParameter.length; i++){
					if ((oRunConfiguration.oSwitchBackendParameter[i].destinations !== "") && (oRunConfiguration.oSwitchBackendParameter[i].source !== oRunConfiguration.oSwitchBackendParameter[i].destinations)){
						sSwitchBE = sSwitchBE + oRunConfiguration.oSwitchBackendParameter[i].destinations;
					}
				}
			}
			return sSwitchBE;
		},
		
		_checkDuplicates : function(aBackendSystems) {
	
			var uniqueNames = [];
			var bIsthere = false;
			
			for (var i = 0; i < aBackendSystems.length; ++i) {
				bIsthere = false;
				for (var j = 0; j < uniqueNames.length; ++j){
					if(aBackendSystems[i].source === uniqueNames[j].source){
						bIsthere = true;
						break;
					}
				}
				if (!bIsthere)
				{
					uniqueNames.push(aBackendSystems[i]);
				}
			}
		return uniqueNames;
		}
	};
});