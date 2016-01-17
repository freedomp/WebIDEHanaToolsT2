define([ "sap.watt.platform.commandgroup/module/ActionItem", "sap/watt/lib/lodash/lodash" ], function(ActionItem, _) {
	
	"use strict";
	
	return {
		
		getItems : function() {
			var that = this;
			
			return this.context.service.command.getCommand("run.recentlyUsedCommand").then(function(oCommand) {
				return that.context.service.runconfigurationhistory.getLatestConfigurations().then(function(aConfigurations) {
					var aItems = [];
					
					_.forEach(aConfigurations, function(oConfiguration) {
						oCommand.setValue({"type" : "recentlyUsed", "value" : oConfiguration}, oConfiguration._metadata.id);
						var oActionItem = new ActionItem({
							"id" : oConfiguration._metadata.id,
							"label" : oConfiguration._metadata.displayName
						}, oCommand);
						
						aItems.push(oActionItem);
					});
					
					return aItems;
				});
			});
		}
	};
});