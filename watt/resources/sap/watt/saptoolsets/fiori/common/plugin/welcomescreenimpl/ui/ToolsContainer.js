define(["sap/watt/ideplatform/plugin/welcomescreen/ui/controls/BasicWelcomeLinksContainer"], function() {
	"use strict";
	var _getContent = function() {
		var that = this;
		var sUrl = jQuery.sap.getModulePath("sap.watt.saptoolsets.fiori.common.plugin.welcomescreenimpl.helpfullinks", ".json");
		return Q.sap.ajax({
			url: sUrl,
			dataType: "json"
		}).then(
			function(dataObjects) {
				var dataObject = dataObjects[0];

				var aPromises = [];
				aPromises.push(that.context.service.hcpconnectivity.getLinkToCockPit());
				aPromises.push(that.context.service.hcpconnectivity.getLinkToUIThemeDesigner());
				return Q.spread(aPromises, function(sCockpitLink, sThemeDesignerLink) {

					if (sCockpitLink && sCockpitLink !== "") {
						dataObject.data.push({
							href: sCockpitLink,
							linkDesc: "toolsContainer_cockpitLink"
						});
					}

					if (sThemeDesignerLink && sThemeDesignerLink !== "") {
						dataObject.data.push({
							href: sThemeDesignerLink,
							linkDesc: "toolsContainer_themeDesignerLink"
						});
					}

					var oToolsContainer = new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeLinksContainer(
						"toolsContainer", {
							borderDesign: sap.ui.commons.enums.BorderDesign.None,
							showCollapseIcon: false,
							title: new sap.ui.core.Title({
								text: that.context.i18n.getText("i18n", "toolsContainer_containerTitle"), //"Other Tools",
								level: sap.ui.core.TitleLevel.H3
							}),
							layoutData: new sap.ui.layout.GridData({
								span: "L12 M12 S12",
								linebreak: true
							}),
							i18nSource: that.context.i18n
						}
					);

					oToolsContainer.setLinksModel(dataObject, function(linkDesc) {
						that.context.service.usagemonitoring.report("welcome_screen", linkDesc).done();
					});

					return oToolsContainer;
				});
			});
	};

	return {
		getContainer: _getContent
	};
});