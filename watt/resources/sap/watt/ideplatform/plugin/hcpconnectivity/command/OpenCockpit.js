define({

	execute : function(value, oWindow) {
		var hcpService = this.context.service.hcpconnectivity;
		hcpService.openCockpit(oWindow).done();
	},

	isAvailable : function() {
		return true;
	},

	isEnabled : function() {
		var serverType = sap.watt.getEnv("server_type");
		if (serverType === "java" || serverType === "local_hcproxy") {
			// "java" for Eclipse/IntelliJ and "local_hcproxy" for local installation
			return false;
		}

	    return true;
	}
});
