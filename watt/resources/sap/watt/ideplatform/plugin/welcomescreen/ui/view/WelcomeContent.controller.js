define([], function() {
	"use strict";
	sap.ui.core.mvc.Controller.extend("sap.watt.ideplatform.plugin.welcomescreen.ui.view.WelcomeContent", {
		_oContext: null,

		onInit: function() {
			this._oContext = this.getView().getViewData().context;

			var oMainGrid = this.byId("welcomeMainGrid");
			oMainGrid.setLayoutData(new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}));

			this.oMainSection = this.oView.byId("welcomeMainSection");
			this.oMainSection.setLayoutData(new sap.ui.layout.GridData({
				span: "L7 M7 S7"
			}));

			this.oSubSection = this.oView.byId("welcomeSubSection");
			this.oSubSection.setLayoutData(new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			}));
		}
	});
});