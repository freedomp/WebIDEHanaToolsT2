define([ "sap/watt/ideplatform/plugin/welcomescreen/ui/controls/BasicWelcomeContainer" ], function() {
	"use strict";
	var _getContent = function() {

		var that = this;

		var oWelcomeContainer = new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeContainer("welcomeContainer", {
			borderDesign : sap.ui.commons.enums.BorderDesign.None,
			showCollapseIcon : false,
			title : new sap.ui.core.Title({
				text : "",
				level : sap.ui.core.TitleLevel.H3
			})
		});

		oWelcomeContainer.setLayoutData(new sap.ui.layout.GridData({
			span : "L12 M12 S12",
			linebreak : true
		}));

		var oWelcomeContentLabel = new sap.ui.commons.Label({
			wrapping : true,
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			})
		}).addStyleClass("welcomeContentLabel");

		oWelcomeContainer.addContent(oWelcomeContentLabel);

		var whatsNewLink = new sap.ui.commons.Link({
			text : that.context.i18n.getText("i18n", "welcomeContainer_newVersionLink"),
			href : "https://help.hana.ondemand.com/webide/frameset.htm?98fd3efb757d4e39b25740d2f3c83b61.html",
			target : "_blank",
			press: 	function() {
				that.context.service.usagemonitoring.report("welcome_screen", "welcomeContainer_newVersionLink").done();
				}
		}).addStyleClass("welcomeContentWhatsNewLink");

		oWelcomeContainer.addContent(whatsNewLink);
		
		var oOpenMyWorkspaceButton = new sap.ui.commons.Button("OpenMyWorkspaceButton", {
			text : that.context.i18n.getText("i18n", "welcomeContainer_openMyWorkspaceButton"),
			icon : require.toUrl("sap.watt.saptoolsets.fiori.common.welcomescreenimpl/images/editor_button.png"),
			styled: false,
			lite: true, 
			press : function() {
				that.context.service.usagemonitoring.report("welcome_screen", "open_my_workspace").done();
				that.context.service.perspective.renderPerspective("development").done();
			}
		}).addStyleClass("welcomeContentOpenMyWorkspaceButton");
		
		oWelcomeContainer.addContent(oOpenMyWorkspaceButton);

		this.context.service.system.getSystemInfo().then(function(oResult) {
			var sUserString = oResult.sFirstName ? oResult.sFirstName : oResult.sUsername;
			that.context.service.WelcomeScreenPersistency.getPerspectiveSettings().then(function(oSettings) {
				if (oSettings && oSettings.bIsVersionUpdate === true) {

					var sFromVersion = oSettings.oVersionUpdate.from;
					var sToVersion = oSettings.oVersionUpdate.to;

					if (!sFromVersion || sFromVersion === "") { // First run
						oWelcomeContentLabel.setText(that.context.i18n.getText("i18n", "welcomeContainer_updatedVersion", [ sToVersion ]));
					} else {
						that.context.service.Version.compareVersions(sToVersion, sFromVersion).then(function(iCompare) {
							if (iCompare > 0) { // Update
								oWelcomeContentLabel.setText(that.context.i18n.getText("i18n", "welcomeContainer_updatedFromVersion", [ sFromVersion, sToVersion ]));
							} else { // Downgrade
								oWelcomeContentLabel.setText(that.context.i18n.getText("i18n", "welcomeContainer_downgradedFromVersion", [ sFromVersion, sToVersion ]));
							}
						}).fail(function(oError) {
							oWelcomeContentLabel.setText(that.context.i18n.getText("i18n", "welcomeContainer_currentVersion", [ sToVersion ]));
						}).done();
					}

					oSettings.bIsVersionUpdate = false;
					that.context.service.WelcomeScreenPersistency.setPerspectiveSettings(oSettings).done();
				} else { // No update, just display version
					that.context.service.Version.getCurrentVersion().then(function(sVersion) {
						oWelcomeContentLabel.setText(that.context.i18n.getText("i18n", "welcomeContainer_currentVersion", [ sVersion ]));
					}).done();
				}
				oWelcomeContainer.getTitle().setText(that.context.i18n.getText("i18n", "welcomeContainer_containerTitle", [ sUserString ]));
			}).done();
		}).done();

		return oWelcomeContainer;
	};

	return {
		getContainer : _getContent
	};
});