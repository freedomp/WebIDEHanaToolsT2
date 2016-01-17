sap.ui.jsview("sap.watt.ideplatform.plugin.runconsole.view.RunConsole", {

	getControllerName: function() {
		return "sap.watt.ideplatform.plugin.runconsole.view.RunConsole";
	},

	createContent: function(oController) {
		var oHeader = this._getConsoleHeader(oController);
		var oContent = this._getConsoleContent(oController);
		var oFooter = this._getConsoleFooter(oController);

		var oConsole = new sap.ui.commons.layout.BorderLayout({
			width: "100%",
			height: "100%",
			top: oHeader,
			center: oContent,
			bottom: oFooter
		}).addStyleClass("runConsoleContainer");

		return oConsole;
	},

	_getConsoleContent: function() {
		var oHTML = new sap.ui.core.HTML({
			content: "{aLogs}"
		});

		var oVerticalLayout = new sap.ui.layout.VerticalLayout("runConsoleContainer", {
			content: [oHTML]
		});

		var oContentContainer = new sap.ui.commons.layout.BorderLayoutArea("runConsoleCenter", {
			contentAlign: "left",
			visible: true,
			content: [oVerticalLayout]
		}).addStyleClass("runConsoleContent");

		return oContentContainer;
	},

	_getConsoleHeader: function() {
		var oTitle = new sap.ui.commons.TextView({
			text: "{i18n>run_console_lbl_title}"
		}).addStyleClass("runConsoleTitle");

		var oHeader = new sap.ui.commons.layout.BorderLayoutArea({
			size: "25px",
			contentAlign: "left",
			visible: true,
			overflowY: "hidden",
			content: [oTitle]
		}).addStyleClass("runConsoleEdgesColor");

		return oHeader;
	},

	_getConsoleFooter: function(oController) {
		var oApplicationSection = this._getApplicationSection(oController);
		var oStatusSection = this._getStatusSection(oController);
		var oShutDownSection = this._getShutDownSection(oController);

		var oGrid = new sap.ui.layout.Grid({
			hSpacing: 0,
			vSpacing: 0,
			content: [oApplicationSection, oStatusSection, oShutDownSection]
		});

		var oFooter = new sap.ui.commons.layout.BorderLayoutArea({
			size: "30px",
			visible: true,
			overflowY: "hidden",
			content: [oGrid]
		}).addStyleClass("runConsoleFooter runConsoleEdgesColor");

		return oFooter;
	},

	_getApplicationSection: function() {
		var oApplicationText = new sap.ui.commons.TextView({
			text: "{i18n>run_console_lbl_application}"
		}).addStyleClass("runConsoleApplicationText");

		var oLinkUrl = new sap.ui.commons.Link({
			text: "{sUrl}",
			press: function(oEvent) {
				var sUrl = oLinkUrl.getText();
				window.open(sUrl);
			}
		}).addStyleClass("runConsoleLink selectable");

		var oApplicationSection = new sap.ui.layout.HorizontalLayout({
			content: [oApplicationText, oLinkUrl],
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		}).addStyleClass("runConsoleApplicationSection");

		return oApplicationSection;
	},

	_getStatusSection: function() {
		var oStatusSection = new sap.ui.commons.TextView({
			text: "{ parts: [ {path: 'i18n>run_console_lbl_status'}, {path: 'eStatus'}], formatter: 'jQuery.sap.formatMessage'}",
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S2"
			})
		}).addStyleClass("runConsoleStatusSection");

		return oStatusSection;
	},

	_getShutDownSection: function(oController) {
		var oShutDownButton = new sap.ui.commons.Button({
			text: "{i18n>run_console_lbl_shut_down}",
			icon:  "sap-icon://color-fill",
			press: [oController.onShutDownPress, oController],
			lite: true
		}).addStyleClass("runConsoleShutDownButton");

		var oShutDownSection = new sap.ui.layout.HorizontalLayout({
			content: [oShutDownButton],
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S2"
			})
		}).addStyleClass("runConsoleShutDownSection");

		return oShutDownSection;
	}
});