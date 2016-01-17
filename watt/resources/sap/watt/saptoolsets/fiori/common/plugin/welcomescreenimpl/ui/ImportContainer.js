define([ "sap/watt/ideplatform/plugin/welcomescreen/ui/controls/BasicWelcomeActionContainer",
		"sap/watt/ideplatform/plugin/welcomescreen/ui/controls/BasicWelcomeTile" ], function() {
	"use strict";
	var _getContent = function() {
		var that = this;

		var oImportContainer = new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeActionContainer("importContainer", {
			borderDesign : sap.ui.commons.enums.BorderDesign.None,
			showCollapseIcon : false,
			title : new sap.ui.core.Title({
				text : that.context.i18n.getText("i18n", "importContainer_containerTitle"),
				level : sap.ui.core.TitleLevel.H3
			})
		});

		oImportContainer.setLayoutData(new sap.ui.layout.GridData({
			span : "L12 M12 S12",
			linebreak : true
		}));

		var oImportArchiveTile = new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeTile("importArchiveTile", {
			title : that.context.i18n.getText("i18n", "importContainer_archiveTile"),
			icon : "sap-icon://attachment-zip-file",
			press : function() {
				that.context.service.usagemonitoring.report("welcome_screen", "import_archive").done();
				that.context.service.import.openImportUI().then(function(oResult) {
					if (oResult === "ExecuteImport") {
						return that.context.service.perspective.renderPerspective("development");
					}
				}).done();
			}
		});

		oImportContainer.addButton(oImportArchiveTile);

		var oImportABAPTile = new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeTile("importABAPTile", {
			title : that.context.i18n.getText("i18n", "importContainer_abapTile"),
			icon : "sap-icon://sap-logo-shape",
			press : function() {
				that.context.service.usagemonitoring.report("welcome_screen", "import_ABAP").done();
				that.context.service.command.getCommand("repositorybrowser.importFromBSP").then(function(oCommand) {
					return oCommand.execute();
				}).done();
			}
		});

		oImportContainer.addButton(oImportABAPTile);

		var oImportHCPTile = new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeTile("importHCPTile", {
			title : that.context.i18n.getText("i18n", "importContainer_hcpTile"),
			icon : "sap-icon://world",
			press : function() {
				that.context.service.usagemonitoring.report("welcome_screen", "import_HCP").done();
				that.context.service.command.getCommand("repositorybrowser.importFromHelium").then(function(oCommand) {
					return oCommand.execute();
				}).done();
			}
		});

		var serverType = sap.watt.getEnv("server_type");

		if (serverType === "java" || serverType === "local_hcproxy") {
			oImportHCPTile.setEnabled(false);
			oImportHCPTile.addStyleClass("disabledWelcomeTileDiv");
		}

		oImportContainer.addButton(oImportHCPTile);

		var oCloneGitTile = new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeTile("cloneGitTile", {
			title : that.context.i18n.getText("i18n", "importContainer_gitTile"),
			icon : "sap-icon://watt/git",
			press : function() {
				that.context.service.usagemonitoring.report("welcome_screen", "import_clone_GIT").done();
				that.context.service.command.getCommand("gitclient.clone").then(function(oCommand) {
					return oCommand.execute().then(function(cloneResolve) {
						if (cloneResolve) {
							return that.context.service.perspective.renderPerspective("development");
						}
					});
				}).done();
			}
		});

		oImportContainer.addButton(oCloneGitTile);

		return oImportContainer;
	};

	return {
		getContainer : _getContent
	};
});