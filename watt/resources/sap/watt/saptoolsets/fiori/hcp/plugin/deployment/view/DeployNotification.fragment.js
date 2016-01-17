sap.ui.jsfragment("sap.watt.saptoolsets.fiori.hcp.plugin.deployment.view.DeployNotification", {

	createContent: function(oModel) {
		var registerButton;
		var aDialogButtons = [];

		var oVersionTextView = new sap.ui.commons.TextView({
			text: "{/sVersionMessage}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oAppLink = new sap.ui.commons.Link({
			text: "{i18n>DeployNotificationDialog_access_latest_deployed}",
			href: "{/link}",
			target: "_blank",
			tooltip: "{/link}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("successfullyDeployedLink");
		
		var oFTVLatestVersion = new sap.ui.commons.FormattedTextView();
		//set the text with placeholders inside
		oFTVLatestVersion.setHtmlText(oModel.getData().htmlLinkText);
		//add the desired control to the FormattedTextView
		oFTVLatestVersion.addControl(oAppLink);
		oFTVLatestVersion.setLayoutData(new sap.ui.layout.GridData({
			span: "L12 M12 S12"
		}));

		var oAppActiveLink = new sap.ui.commons.Link({
			text: "{i18n>DeployNotificationDialog_access_active_version}",
			href: "{/activeLink}",
			target: "_blank",
			tooltip: "{/activeLink}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("successfullyDeployedLink");

    	var oFTVLActiveVersion = new sap.ui.commons.FormattedTextView();
		oFTVLActiveVersion.setHtmlText(oModel.getData().htmlLinkText);
		oFTVLActiveVersion.addControl(oAppActiveLink);
		oFTVLActiveVersion.setLayoutData(new sap.ui.layout.GridData({
			span: "L12 M12 S12"
		}));
		
		//The link to the application's page in the cockpit
		var oAppLinkToCockpit = new sap.ui.commons.Link({
			text: "{i18n>DeployNotificationDialog_access_app_cockpit}",
			href: "{/linkToAppInCockpit}",
			target: "_blank",
			tooltip: "{/linkToAppInCockpit}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("successfullyDeployedLink");
		
		var oFTVLinkToCockpit = new sap.ui.commons.FormattedTextView();
		oFTVLinkToCockpit.setHtmlText(oModel.getData().htmlLinkText);
		oFTVLinkToCockpit.addControl(oAppLinkToCockpit);
		oFTVLinkToCockpit.setLayoutData(new sap.ui.layout.GridData({
			span: "L12 M12 S12"
		}));

		var oNextStepTextView = new sap.ui.commons.TextView({
			text: "{i18n>DeployNotificationDialog_next}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oGrid = new sap.ui.layout.Grid({
			vSpacing: 0
		});

		if (oModel.getData().version) {
			oGrid.addContent(oVersionTextView);
		}

		if (oModel.getData().isActive) {
		    oGrid.addContent(oFTVLActiveVersion);
		} else {
		    oGrid.addContent(oFTVLatestVersion);
		}
		
		oGrid.addContent(oFTVLinkToCockpit);

		if (oModel.getData().flp) {
			oGrid.addContent(oNextStepTextView);
			registerButton = new sap.ui.commons.Button({
				text: "{i18n>DeployNotificationDialog_register}",
				tooltip: "{i18n>DeployNotificationDialog_register}",
				press: function() {
					oDialog.close();
					oModel.getData().fiorilaunchpad.openWizard(oModel.getData().project, "deploy", oModel.getData().userAuth).then(function() {});
				}
			});
			aDialogButtons.push(registerButton);
			
			if (sap.watt.getEnv("server_type") === "java" || sap.watt.getEnv("server_type") === "local_hcproxy") {
    			registerButton.setEnabled(false); // disable the button on local environment
    		}
		}

		aDialogButtons.push(
			new sap.ui.commons.Button({
				text: "{i18n>DeployNotificationDialog_close}",
				tooltip: "{i18n>DeployNotificationDialog_close}",
				press: function() {
					oDialog.close();
				}
			})
		);

		var oDialog = new sap.ui.commons.Dialog({
			width: "600px",
			resizable : false,
			modal: true,
			title: "{i18n>DeployNotificationDialog_TitleName}",
			content: [oGrid],
			buttons: aDialogButtons
		});

		oDialog.setModel(oModel);
		return oDialog;
	} 
});
