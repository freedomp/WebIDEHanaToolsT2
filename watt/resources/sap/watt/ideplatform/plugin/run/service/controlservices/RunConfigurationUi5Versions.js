define([], function() {
	"use strict";
	var runconfigurationUi = {
		_oController: undefined,
		getControl: function(oDoc, aUi5Version, sUI5CurrentVersion) {
			var that = this;
			this._oController = this.context.service.ui5versionhandler;
			return this._oController.setServiceData(oDoc, aUi5Version, sUI5CurrentVersion).then(function() {
				return Q.sap.ui.define(["sap/watt/ideplatform/plugin/run/ui/Ui5VersionsCompositeControl"]).then(function(ui5VersionSection) {
					var ui5Version = new ui5VersionSection({
						text: "{i18n>title_run_config_ui_a2a_ui5version}",
						layoutData: new sap.ui.layout.GridData({
							span: "L12 M12 S12"
						}),
						dropDownBoxItems: aUi5Version,
						oController: that._oController,
						sUI5CurrentVersion: sUI5CurrentVersion
					});
					return ui5Version;
				});
			});
		}
	};
	return runconfigurationUi;
});