define({

	execute: function(vValue, oWindow) {
		var oService = this.context.service;
		return oService.selection.getSelection().then(function(aSelection) {
			// checking we got a selection
			var oSelection = aSelection[0];
			if (!oSelection || !oSelection.document) {
				throw new Error("Unexpected Error");
			}

			var oOrigFileDocument = oSelection.document;
			var oPreviewService = oService.preview;
			var oMockpreviewService = oService.mockpreview;

			return oService.setting.project.get(oMockpreviewService).then(function(oSettings) {
                
                //usage analytic 
				oService.usagemonitoring.report("runner", "run_with_mock_old", oOrigFileDocument.getEntity().getParentPath()[1]).done();

				if (!oSettings || oSettings.responderOn) {
					return oPreviewService.getPreviewUrl(oOrigFileDocument).then(function(uri) {
						uri.addQuery({
							responderOn: true
						});
						return oPreviewService.showPreview(uri, oWindow);
					});
				}
				return oMockpreviewService.getRunnableMockSettings(oOrigFileDocument, oSettings).then(function(oRunnableMockSettings) {
					return oMockpreviewService.buildRunnableDocument(oRunnableMockSettings, oOrigFileDocument, oWindow).then(function(oNewDocument) {
						return oPreviewService.getPreviewUrl(oNewDocument).then(function(oUri) {
							return oPreviewService.showPreview(oUri, oWindow, false, null, {});
						});
					});
				});

			});
		});

	},

	isEnabled: function() {
		var selectionService = this.context.service.selection;
		return selectionService.assertNotEmpty().then(function(aSelection) {
			//return previewService.isExecutable(aSelection[0]);
			var oDocument = aSelection[0].document;
			if (!oDocument.getEntity && !oDocument.getType) {
				return false;
			}
			var sName = oDocument.getEntity().getName();
			var sType = oDocument.getType();
			return (sType === "file" && jQuery.sap.endsWith(sName, ".html"));
		});
	}

});