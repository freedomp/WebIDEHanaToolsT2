define({

	execute: function() {
		var that = this;

		return that.context.service.applicationsdialogservice.getContent().then(function(ApplicationsDialog) {
			ApplicationsDialog.open("import", null).done();
		});

	},
	
	isAvailable: function() {
		return this.context.service.repositorybrowserUtils.isSingleRootSelection();
	},
	
	isEnabled: function() {
		var serverType = sap.watt.getEnv("server_type");
		if (serverType === "java" || serverType === "local_hcproxy") {
			return false;
		}

		return true;
	}
});