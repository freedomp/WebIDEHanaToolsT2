sap.ui.jsfragment("sap.watt.ideplatform.plugin.gitclient.view.GitLogCreateNewDetail", {

	createContent: function(oController) {

		var oDescriptionLabel = new sap.ui.commons.Label({
			//		text: "{i18n>gitLog_TagInput}",
			text: {
				path: "/newLogDetailType",
				formatter: function(newLogDetailType) {
					if (!this.getModel("i18n")) {
						return "";
					}
					if (newLogDetailType === "Tag") {
						return this.getModel("i18n").getResourceBundle().getText("gitLog_TagInput");
					}
					return this.getModel("i18n").getResourceBundle().getText("gitLog_CommitChechoutInput");
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L6 M6 S6"
			}),
			wrapping: true
		}).addStyleClass("gitCheckoutConflictsLabel");

		var oNewDetailTextField = new sap.ui.commons.TextField({
			value: "{/newLogDetailName}",
			liveChange: function(oEvent) {
				oController.validateInputNewLogDetail(oEvent.getParameters().liveValue, true);
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L6 M6 S6"
			})
		}).addStyleClass("gitMarginBottonWithGrid0Spacing");

		var oValidationLabel = new sap.ui.commons.Label({
			text: "{/validationStatus}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			wrapping: true
		}).addStyleClass("gitUserError");

		//Handle pressing enter
		oNewDetailTextField.addEventDelegate({
			onsapenter: oController.createNewLogDetail
		}, oController);

		var oGrid = new sap.ui.layout.Grid({
			vSpacing: 0,
			content: [oDescriptionLabel, oNewDetailTextField, oValidationLabel]
		});
		
		var btnOk = new sap.ui.commons.Button({
			text: "{i18n>button_ok}",
			enabled : {
				parts: ["/validationStatus", "/newLogDetailName"],
				formatter: function(sValidationStatus, sNewLogDetailName) {
					if (!sNewLogDetailName || sNewLogDetailName === ""){
						return false;
					}
					if (!sValidationStatus){
						return true;
					}
					return sValidationStatus === "";
				}
			},
			
			press: [oController.createNewLogDetail, oController]
		});

		var oDialog = new sap.ui.commons.Dialog('oGitLogCreateNewDetailDialog', {
			width: "25%",
			modal: true,
			//	title : "{i18n>gitLog_TagTitle}",
			title: {
				path: "/newLogDetailType",
				formatter: function(newLogDetailType) {
					if (!this.getModel("i18n")) {
						return "";
					}
					if (newLogDetailType === "Tag") {
						return this.getModel("i18n").getResourceBundle().getText("gitLog_TagTitle");
					}
					return this.getModel("i18n").getResourceBundle().getText("gitLog_CommitChechoutDialogTitle");
				}
			},
			initialFocus: oNewDetailTextField,
			content: [oGrid],
			buttons: [ btnOk, new sap.ui.commons.Button({
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