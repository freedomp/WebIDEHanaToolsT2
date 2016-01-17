sap.ui.jsfragment("sap.watt.ideplatform.plugin.gitclient.view.GitPushNotification", {

	createContent: function(oController) {

		var oSuccessPushNotifTextView = new sap.ui.commons.TextView({
			text: "{/sPushCompletedMessage}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oNewChangesTextView = new sap.ui.commons.TextView({
			text: "{/sChanges}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oLinksRepeater = new sap.ui.commons.RowRepeater({
			design: sap.ui.commons.RowRepeaterDesign.Transparent,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oRowTemplate = new sap.ui.commons.Link({
			text: "{link}",
			href: "{link}",
			target: "_blank",
			tooltip: "{link}"
		});

		oLinksRepeater.bindRows("/aNotificationLinks", oRowTemplate);

        var oSuccessfullyPushedTags = new sap.ui.commons.TextView({
			text: "{/sSuccessfullyPushedTags}",
			visible : "{/isSuccessfullyPushedTags}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

        var oFailedPushedTags = new sap.ui.commons.TextView({
			text: "{/sFailedPushedTags}",
			visible : "{/isFailedPushedTags}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oGrid = new sap.ui.layout.Grid({
			vSpacing: 0,
			content: [oSuccessPushNotifTextView, oNewChangesTextView, oLinksRepeater, oSuccessfullyPushedTags, oFailedPushedTags]
		});

		var oDialog = new sap.ui.commons.Dialog({
			width: "600px",
			modal: true,
			title: "{i18n>gitPushNotificationDialog_TitleName}",
			content: [oGrid],
			buttons: [new sap.ui.commons.Button({
				text: "{i18n>button_ok}",
				tooltip: "{i18n>gitPushNotificationDialog_ButtonTooltip}",
				press: function() {
					oDialog.close();
				}
			})]
		}).addStyleClass("gitClientLink");
		return oDialog;
	} //create content

});