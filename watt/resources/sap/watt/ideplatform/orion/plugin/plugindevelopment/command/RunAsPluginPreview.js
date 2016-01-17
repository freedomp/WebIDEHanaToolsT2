define({

	execute : function(vValue, oWindow) {
		var that = this;
		var sDebugPageUrl = require.toUrl("sap.watt.ideplatform.plugindevelopment/ui/debugModeInitialPage.html");
		oWindow.open(sDebugPageUrl, "pluginPreview");
		var selectionService = this.context.service.selection;
		selectionService.assertNotEmpty().then(
				function(aSelection) {
					var sParentPath = aSelection[0].document.getEntity().getParentPath();
					return that.context.service.archivetemplateresources.createArchive(sParentPath).then(
							function() {
								return that.context.service.plugindevelopment.writePluginToOrion(aSelection[0].document.getEntity(),
										oWindow).fail(function(oError) {
									that.context.service.plugindevelopment.closeTargetWindow();
									return that.context.service.usernotification.alert(oError.message).done();
								});
							}).fail(function(oError) {
						var sMsg = that.context.i18n.getText("archive_template_resources_error_msg") + oError.message;
						return that.context.service.usernotification.alert(sMsg);
					});

				}).done();
	},

	isAvailable : function() {
		var that = this;
		var selectionService = this.context.service.selection;
		return selectionService.assertNotEmpty().then(
				function(aSelection) {
					return that.context.service.plugindevelopment.isPluginProject(aSelection[0].document.getEntity().getFullPath()).then(
							function(bResult) {
								return bResult;
							});
				});

	},

	isEnabled : function() {
		if(sap.watt.getEnv("server_type") === "local_hcproxy"){
			return false;
		}
		
		var selectionService = this.context.service.selection;
		return selectionService.assertNotEmpty().then(function(aSelection) {
			if (aSelection.length === 1 && aSelection[0].document.getEntity().getName() === "plugin.json") {
				return true;
			} else {
				return false;
			}
		});
	}
});