define({

	execute : function() {
		var that = this;
		require([ "sap.watt.ideplatform.generationwizard/ui/ReferenceProjectGenerationWizard" ], function(ReferenceProjectGenerationWizard) {
			ReferenceProjectGenerationWizard.openGenerationWizardUI(that.context);
		});
	},

	isAvailable : function() {
		return true;
	},

	isEnabled : function() {
		return true;
	}

});