sap.ui.jsfragment("sap.watt.ideplatform.plugin.basevalidator.view.WorkspaceBrowse", {

	createContent: function(oController) {

		var oDialog = new sap.ui.commons.Dialog("oWorkspaceBrowse", {
			width: "400px",
			modal: true,
			//	title : "{i18n>gitLog_TagTitle}",
			title: "{i18n>workspase_dialog_title}",
			//initialFocus: oNewDetailTextField,
			//content: [oGrid],
			buttons: [new sap.ui.commons.Button({
				text: "{i18n>button_ok}",
				id: "okButton",
			    enabled : false,
				press: [oController.setPathData,  oController]
			}), new sap.ui.commons.Button({
				text: "{i18n>button_cancel}",
				press: [oController.cancel, oController]
			})]
		});

		//Add event listener to escape in order to stop button spinning 
		oDialog.addEventDelegate({
			onsapescape: oController.cancel
		}, oController);

		return oDialog;

	}

});