define([ "sap/watt/ideplatform/plugin/welcomescreen/ui/controls/BasicWelcomeActionContainer",
		"sap/watt/ideplatform/plugin/welcomescreen/ui/controls/BasicWelcomeTile" ], function() {
	"use strict";
	var _getContent = function() {

		var that = this;

		var oNewProjectContainer = new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeActionContainer(
				"newProjectContainer", {
					borderDesign : sap.ui.commons.enums.BorderDesign.None,
					showCollapseIcon : false,
					title : new sap.ui.core.Title({
						text : that.context.i18n.getText("i18n", "createNewContainer_containerTitle"),
						level : sap.ui.core.TitleLevel.H3
					})
				});

		oNewProjectContainer.setLayoutData(new sap.ui.layout.GridData({
			span : "L12 M12 S12",
			linebreak : true
		}));

		if (jQuery.browser.chrome) { //Not relevant on other browsers
			var oNewQuickStartWithLayoutEditorProjectTile = new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeTile(
				"newQuickStartWithLayoutEditorProjectTile", {
					title : that.context.i18n.getText("i18n", "createNewContainer_newQuickStartWithLayoutEditorProjectTile"),
					icon : "sap-icon://add-product",
					press : function() {
						that.context.service.usagemonitoring.report("welcome_screen", "quickStart").done();
						that.context.service.command.getCommand("ui5wysiwygeditor.quickStart").then(function(oCommand) {
							return oCommand.execute();
						}).done();
					}
				});

			oNewProjectContainer.addButton(oNewQuickStartWithLayoutEditorProjectTile);
		}

		var oNewProjectTile = new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeTile("newProjectTile", {
			title : that.context.i18n.getText("i18n", "createNewContainer_newProjectTile"),
			icon : "sap-icon://watt/proj_template",
			press : function() {
				that.context.service.usagemonitoring.report("welcome_screen", "project_template").done();
				that.context.service.command.getCommand("template.createProject").then(function(oCommand) {
					return oCommand.execute();
				}).done();
			}
		});

		oNewProjectContainer.addButton(oNewProjectTile);

		var oNewSampleAppTile = new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeTile("newSampleAppTile", {
			title : that.context.i18n.getText("i18n", "createNewContainer_fromSampleTile"),
			icon : "sap-icon://watt/proj_sample",
			press : function() {
				that.context.service.usagemonitoring.report("welcome_screen", "project_sample_application").done();
				that.context.service.command.getCommand("template.createReferenceProject").then(function(oCommand) {
					return oCommand.execute();
				}).done();
			}
		});

		oNewProjectContainer.addButton(oNewSampleAppTile);

		var oNewExtensionProjectTile = new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeTile(
				"newExtensionProjectTile", {
					title : that.context.i18n.getText("i18n", "createNewContainer_newExtensionTile"),
					icon : "sap-icon://watt/proj_extension",
					press : function() {
						that.context.service.usagemonitoring.report("welcome_screen", "extension_project").done();
						that.context.service.command.getCommand("template.createExtensionProject").then(function(oCommand) {
							return oCommand.execute();
						}).done();
					}
				});

		oNewProjectContainer.addButton(oNewExtensionProjectTile);


		return oNewProjectContainer;
	};

	return {
		getContainer : _getContent
	};
});