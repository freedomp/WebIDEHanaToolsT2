define([], function() {
	"use strict";
	return {
		_oController: undefined,
		getControl: function(oDoc, aFiles, aValidation) {
			var that = this;
			this._oController = this.context.service.filepathhandler;
			return this._oController.setServiceData(oDoc, aValidation).then(function() {
				return Q.sap.ui.define(["sap/watt/ideplatform/plugin/run/ui/FilePathControl"]).then(function(FilePathControl) {
					var filePath = new FilePathControl({
						maxHistoryItems: 10,
						controlData: aFiles,
						// placeholder: "{i18n>lbl_run_config_enter_file_path}",
						// displaySecondaryValues: true,
						layoutData: new sap.ui.layout.GridData({
							span: "L12 M12 S12"
						}),
						oController: that._oController//,
						// selectedKey: '/filePath'
					});
					return filePath;
				});
			});
		}
	};
});