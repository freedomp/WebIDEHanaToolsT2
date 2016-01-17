define(["sap/watt/ideplatform/plugin/welcomescreen/ui/controls/BasicWelcomeContainer",
	"sap/watt/ideplatform/plugin/welcomescreen/ui/controls/BasicWelcomeTile"
], function() {
	"use strict";
	var _getContent = function() {

		var that = this;

		var oNewProjectContainer = new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeContainer(
			"videoContainer", {
				borderDesign: sap.ui.commons.enums.BorderDesign.None,
				showCollapseIcon: false,
				title: new sap.ui.core.Title({
					text: that.context.i18n.getText("i18n", "videoContainer_containerTitle"),
					level: sap.ui.core.TitleLevel.H3
				})
			});

		oNewProjectContainer.setLayoutData(new sap.ui.layout.GridData({
			span: "L12 M12 S12",
			linebreak: true
		}));

		this.context.service.WelcomeScreenPersistency.getPerspectiveSettings().then(function(oSettings) {
			if (oSettings && oSettings.oVersionUpdate) {

				var sFromVersion = oSettings.oVersionUpdate.from;
				var sToVersion = oSettings.oVersionUpdate.to;

				// there was a version change
				var oWelcomeContentNewUpdate = new sap.ui.commons.Label({
					text: that.context.i18n.getText("i18n", "videoContainer_newVersionLabel"),
					wrapping: true,
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12",
						linebreak: true
					})
				}).addStyleClass("welcomeContentNewUpdate");

				if (!sFromVersion || sFromVersion === "") { // First run
					oNewProjectContainer.addContent(oWelcomeContentNewUpdate);
				} else {
					that.context.service.Version.compareVersions(sToVersion, sFromVersion).then(function(iCompare) {
						if (iCompare > 0) { // Update
							oNewProjectContainer.addContent(oWelcomeContentNewUpdate);
						}
					}).done();
				}
			}
		}).done();

		var embeddedVideoHTML = new sap.ui.core.HTML("embeddedVideoHTML", {
			content: '<iframe width="100%" height="212" src="https://www.youtube.com/embed/lt0L1L9U7js?showinfo=0" frameborder="0" allowfullscreen></iframe>'
		});

		oNewProjectContainer.addContent(embeddedVideoHTML);

		return oNewProjectContainer;
	};

	return {
		getContainer: _getContent
	};
});