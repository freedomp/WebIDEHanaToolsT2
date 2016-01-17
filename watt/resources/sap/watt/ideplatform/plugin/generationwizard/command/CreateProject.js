define({

	execute : function() {
		var that = this;
		require([ "sap.watt.ideplatform.generationwizard/ui/ProjectGenerationWizard" ], function(ProjectGenerationWizard) {
			ProjectGenerationWizard.openGenerationWizardUI(that.context);
		});
	},

	isAvailable : function() {
		return true;
	},

	isEnabled : function() {
		return true;
	}

});