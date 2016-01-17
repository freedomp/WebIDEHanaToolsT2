define(["sap/watt/ideplatform/plugin/gitclient/command/Constants"], function(Constants){
	"use strict";
	return {
		execute: function() {
			var oSelectionService = this.context.service.selection;
			var that = this;
			return oSelectionService.assertNotEmpty().then(function(aSelection) {
				if (!aSelection[0].stageTableRow || !(aSelection[0].document && aSelection[0].document.getEntity() &&
					aSelection[0].document.getEntity().getBackendData() && aSelection[0].document.getEntity().getBackendData().git)) {
					throw new Error("Compare failed");
				}
				var oDocument = aSelection[0].document;
				var bStage = aSelection[0].stageTableRow.Stage;
				var sStatus = aSelection[0].stageTableRow.Status;
				return that.context.service.gitdispatcher.openCompareEditor(oDocument, bStage, sStatus === "C", Constants._ACTIVATED_FROM_COMMAND);
			});
		},

        isAvailable: function() {
            var that = this;
            return that.context.service.git.isFeatureSupported("compare");
        },
		isEnabled: function() {
			var oSelectionService = this.context.service.selection;
			return oSelectionService.assertNotEmpty().then(function(aSelection) {
				if (aSelection[0].document) {
					var sStatus = aSelection[0].stageTableRow.Status;
					return (sStatus === "M" || sStatus === "C");
				}
			});
		}
	};
});