define({

	execute : function() {
		var that = this;
		require([ "sap.watt.ideplatform.generationwizard/ui/TemplateManagementDialog" ], function(TemplateManagementDialog) {
			TemplateManagementDialog.openTemplateManagementUI(that.context);
		});
	},

	isAvailable : function() {
		return true;
	},

	isEnabled : function() {
		return true;
	}
});
