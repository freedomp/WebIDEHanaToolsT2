sap.ui.jsfragment("sap.watt.ideplatform.plugin.run.view.RunConfigurations", {

	createContent: function(oController) {
		var oDialog = new sap.ui.commons.Dialog({
			width: "950px",
			height: "700px",
			modal: true,
			resizable: false,
			keepInWindow: true,
			title: "{i18n>run_RunConfigurations}",
			buttons: [new sap.ui.commons.Button("runbtn_dialog", {
				text: "{i18n>run_Run}", 
				press: [oController.runAction, oController],
				enabled: false
			}), new sap.ui.commons.Button({
				text: "{i18n>run_Save}", 
				press: [oController.save, oController]
			}), new sap.ui.commons.Button({
				text: "{i18n>run_Cancel}", 
				press: [oController.close, oController]
			})]
		}).addStyleClass("runconfigurationsdialog");

		return oDialog;
	}

});