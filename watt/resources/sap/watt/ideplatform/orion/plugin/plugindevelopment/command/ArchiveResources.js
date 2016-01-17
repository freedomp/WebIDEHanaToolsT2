define({

	execute : function() {

		var that = this;

		return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
			var sFullPath = aSelection[0].document.getEntity().getFullPath();
			return that.context.service.archivetemplateresources.createArchive(sFullPath).fail(function(oError) {
				var sMsg = that.context.i18n.getText("archive_template_resources_error_msg") + oError.message;
				return that.context.service.usernotification.alert(sMsg);
			});
		});
	},

	isAvailable : function() {
		return true;
	},

	isEnabled : function() {
		if (sap.watt.getEnv("server_type") === "local_hcproxy") {
			return false;
		}
		return this._isValidPluginProject();
	},

	_isValidPluginProject : function() {

		var that = this;
		var selectionService = this.context.service.selection;

		return selectionService.assertOwner(this.context.service.repositorybrowser).then(function() {
			return selectionService.assertNotEmpty().then(function(aSelection) {
				if (aSelection.length === 1 && aSelection[0].document.getType() === "folder"
					&& aSelection[0].document.getEntity().getFullPath() !== "") {
					var sFullPath = aSelection[0].document.getEntity().getFullPath();
					return that.context.service.plugindevelopment.isPluginProject(sFullPath).then(function(bIsPluginProject) {
						if (bIsPluginProject) {
							var oDocumentProvider = that.context.service.filesystem.documentProvider;
							return oDocumentProvider.getDocument(sFullPath + "/plugin.json").then(function(oPluginDocument) {
								if (oPluginDocument && oPluginDocument.getType() === "file") {
									return oPluginDocument.getContent().then(function(oContent) {
										try {
											var oContentData = JSON.parse(oContent);

											if (oContentData.configures && oContentData.configures.services) {
												var aTemplates = oContentData.configures.services["template:templates"];
												return (aTemplates !== undefined);
											}
										} catch (e) {
											// in case that the plugin json file is corrupted.
											return false;
										}
									});
								}
							});
						}
					});
				}
			});
		}).then(function(oRes) {
			if (oRes) {
				return true;
			} else {
				return false;
			}
		});
	}
});
