define({
	// sample command code ( not actually configured as a command)
	// to demonstrate invocation of the ushellsandbox preview
	// previewWithParameters service method,
	// which allows to run a given component (specified by URL and ComponentName)
	// in the SAP Fiori launchpad sandbox.
	//
	// this.context.service.ushellsandboxpreview; previewWithParameters
	_sServerType : sap.watt.getEnv("server_type"),

	execute : function() {
		var sServerType = this._sServerType;
		var selectionService = this.context.service.selection;
		var previewService = this.context.service.ushellsandboxpreview;
		var sApplicationUrl;
		selectionService.assertNotEmpty().then(
				function(aSelection) {
					// Calculate the application URL: normally, this would be done based on the selection's document
					// using method getExecuteUrl()
					//
					// Note that the absolute URL depends on the runtime platform, i.e. there are different paths for
					// a local server than for the HCP or HANA XS
					//
					// For this demo, we use a hard-coded URL for a sample application coming with the ushell-lib
					// and construct it explicitly
					if (sServerType == "java") {
						sApplicationUrl = new URI("").protocol(window.location.protocol).host(window.location.host).path(
								"/sapui5-sdk-dist/test-resources/sap/ushell/demoapps/AppNavSample").query("?fixed-param1=value%202")
								.toString();
					} else if (sServerType == "hcproxy" || sServerType == "local_hcproxy") {
						sApplicationUrl = "/test-resources/sap/ushell/demoapps/AppNavSample?fixed-param1=value%202";
					} else {
						throw new Error(this.context.i18n.getText("i18n", "previewImpl_unsupportedServerType", [ sServerType ]));
					}
					return previewService.showPreviewWithParameters(sApplicationUrl, "SAPUI5.Component=sap.ushell.demo.AppNavSample",
							aSelection[0].document);
				}).fail(function(oError) {
			// standard error handler just logs to console, but we want additionally a popup;
			throw oError;
		}).done();
	},

	isAvailable : function() {
		// so far, we only support local tomcat, local and hana cloud
		var sServerType = this._sServerType;
		return (sServerType === "java") || (sServerType === "hcproxy") || (sServerType === "local_hcproxy");
	},

	isEnabled : function() {
		var selectionService = this.context.service.selection;
		var previewService = this.context.service.ushellsandboxpreview;
		var that = this;

		return selectionService.assertNotEmpty().then(function(aSelection) {
			return that._isExecutable(aSelection[0]);
		});
	},

	_isExecutable : function(oSelection) {
		var oDocument = null;
		var sName = null;
		var sType = null;
		if (oSelection && oSelection.document) {
			oDocument = oSelection.document;
			sName = oDocument.getEntity().getName();
			sType = oDocument.getType();
		}

		return (sType === "file");
	}

});
