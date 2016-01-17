define({

	execute: function() {
		var selectionService = this.context.service.selection;
		var deploymentService = this.context.service.deployment;

		return selectionService.assertNotEmpty().then(function(aSelection) {
			return deploymentService.deployToHelium(aSelection[0]);
		});
	},

	isAvailable: function() {
		return true;
	},

	isEnabled: function() {
		var serverType = sap.watt.getEnv("server_type");
		if (serverType === "java" || serverType === "local_hcproxy") {
		    return false; // "java" for Eclipse and "local_hcproxy" for local installation
		} else {
			var rbUtilsService = this.context.service.repositorybrowserUtils;
			return rbUtilsService.isSingleFolderNotRootSelection();
		}
	}
});

