define({
	execute : function() {
		var that = this;

		return Q.sap.require("sap.watt.saptoolsets.fiori.project.fioriexttemplate/ui/dialogs/ImportFromBSPDialog").then(function(ImportFromBSPDialog) {
					ImportFromBSPDialog.openRemoteDialog(that.context);
				});
	}
});