define({

	execute: function() {
		var that = this;
		var oSelectionService = this.context.service.selection;

		return oSelectionService.getOwner().then(function(oOwner) {
			if (oOwner.instanceOf("sap.watt.common.service.ui.Browser")) {
				return oSelectionService.assertNotEmpty().then(function(aSelection) {
					return that.context.service.pseudotranslation.generatePseudoPropertiesProject(aSelection[0].document);
				});
			}
		}).fail(function(oError) {
			if (oError && oError.message) {
				that.context.service.usernotification.alert(oError.message).done();
			}
		}).done();
	},

	/*
	 * Available only for internal Web IDE and only if 2Q is set in project settings - languages
	 */
	isAvailable: function() {
		// Available only for internal Web IDE
		if (sap.watt.getEnv("server_type") !== "local_hcproxy" &&
				sap.watt.getEnv("internal") === true){
			// Available only if 2Q is set in project settings - languages
			var that = this;
			var oSelectionService = this.context.service.selection;
			return oSelectionService.getOwner().then(function(oOwner) {
				if (oOwner.instanceOf("sap.watt.common.service.ui.Browser")) {
					return oSelectionService.assertNotEmpty().then(function(aSelection) {
						var oDocument = aSelection[0].document;
						if (!oDocument || !oDocument.getEntity || !oDocument.getEntity().getType || oDocument.getEntity().getType() !== "folder" || oDocument.getEntity().isRoot()) {
							return false;
						}
						return that.context.service.pseudotranslation.is2QEnabled(oDocument).then(function(b2QEnabled) {
							return b2QEnabled;
						});
					});
				}
				return false;
			});
		} else {
			return false;
		}
	},
		
	isEnabled: function() {
		// The check is in isAvailable. If the command is available - it is always enabled.
		return true;
	}

}); //end of define