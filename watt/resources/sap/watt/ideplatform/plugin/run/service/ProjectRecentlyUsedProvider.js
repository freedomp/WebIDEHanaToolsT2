define(["sap.watt.platform.commandgroup/module/ActionItem", "sap/watt/lib/lodash/lodash"], function(ActionItem, _) {

	"use strict";

	return {
		_updateConfiguration : function(oConfiguration) {
			if (!oConfiguration._metadata.hasIssues) {
				return this.context.service.filesystem.documentProvider.getDocument(oConfiguration.filePath).then(function(oRunnableDocument) {
					oConfiguration.oRunnableDocument = oRunnableDocument;
				});
			}
		},
		
		_getConfigurations : function(oProjectDocument) {
			var that = this;
			
			var aPromises = [];
			return this.context.service.configurationhelper.getAllPersistedConfigurations(oProjectDocument).then(function(aConfigurations) {
				for (var c = 0; c < aConfigurations.length; c++) {
					var oConfiguration = aConfigurations[c];
					aPromises.push(that._updateConfiguration(oConfiguration));
				}
				
				return Q.all(aPromises).then(function() {
					return aConfigurations;
				});
			});
		},
		
		getItems: function() {
			var that = this;
			return this.context.service.command.getCommand("run.projectRecentlyUsedCommand").then(function(oCommand) {
				//get the selected project
				return that.context.service.selection.getSelection().then(function(aSelectedDocs) {
					if (aSelectedDocs.length !== 1) {
						return [];
					}
					var oSelectedDocument = aSelectedDocs[0].document;
					//get all runners for the selected project
					return oSelectedDocument.getProject().then(function(oProjectDocument) {
						return that._getConfigurations(oProjectDocument).then(function(aConfigurations) {
							var aItems = [];
							var bMore = false;
							
							//create command for each runner and return the arry of commands 
							_.forEach(aConfigurations, function(oConfiguration) {
								
								oCommand.setValue({
									"type": "projectRecentlyUsed",
									"value": oConfiguration,
									"oProjectDocument" : oProjectDocument,
									"oRunnableDocument" : oConfiguration.oRunnableDocument
								}, oConfiguration._metadata.id);
								delete oConfiguration.oRunnableDocument;
								var oActionItem = new ActionItem({
									"id": oConfiguration._metadata.id,
									"label": oConfiguration._metadata.displayName
								}, oCommand);
								if (aItems.length === 0){
									aItems.push(oActionItem);
								}
								else{
									var i;
									for (i=0;i<aItems.length;i++){
										if(oActionItem._sId === aItems[i]._sId)
										{
											that.context.service.log.error("run", that.context.i18n.getText("i18n", "error_duplicateId",[oActionItem._sLabel]), ["user"]).done();
											return;
										}
										else {
											continue;
										}
									}
									if(i === aItems.length){
										aItems.push(oActionItem);
									}
								}
							});
					
							//ensuring that we present only 5 runners at a time
							if (aItems.length > 5) {
								bMore = true;
								aItems = _.slice(aItems, 0, 5);
							}
							
							//in case of more than 5 runners, the More Command is added 
							if(bMore){
								oCommand.setValue({
									"type": "moreRunConfiguration",
									"value": "moreRunConfiguration"
								},"moreProjectRunner");
								var oActionItem = new ActionItem({
									"id":"moreProjectRunner",
									"label": that.context.i18n.getText("i18n", "run_MoreRunConfigurations")
								}, oCommand);
	
								aItems.push(oActionItem);
							}
							
							return aItems;
						});
					});
				});
			});
		}
	};
});