(function() {
	"use strict";

	sap.ui.jsfragment("sap.xs.nodejs.project.view.NodejsRunConfigurationDebug", {

		createContent: function() {
			jQuery.sap.require("sap.watt.ideplatform.plugin.run.ui.TitleExtendedControl");
			var that = this;

			// Title
			var oTitle = new sap.ui.commons.Title({
				text: "{i18n>view.RunConfiguration.debug.title_xtit}",
				tooltip: "{i18n>view.RunConfiguration.debug.tooltip_xtol}",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			var oTtlDebugEnabled = new sap.watt.ideplatform.plugin.run.ui.TitleExtendedControl({});
			oTtlDebugEnabled.setAggregation("title", oTitle);

			// CheckBox - Debug enabled
			var oCbDebugEnabled = new sap.ui.commons.CheckBox({
				text: "{i18n>view.RunConfiguration.enabled_xckl}",
				checked: "{/debug/enabled}",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			// CheckBox - Break on first statement
			var oCbBreakOnFirstStatement = new sap.ui.commons.CheckBox({
				text: "{i18n>view.RunConfiguration.breakOnFirstStatement_xckl}",
				enabled: "{/debug/enabled}",
				checked: {
					parts: ["/debug/enabled", "/debug/breakOnFirstStatement"],
					formatter: function(enabled, breakOnFirstStatement) {
						return enabled && breakOnFirstStatement;
					}
				},
				change: function(e) {
					that._updateCB(e, "/debug/breakOnFirstStatement", e.getParameter("checked"), [true, false]);
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			return [oTtlDebugEnabled, oCbDebugEnabled, oCbBreakOnFirstStatement];
		},

		_updateCB: function(oEvent, name, state, values) {
			var model = oEvent.getSource().getModel();
			model.setProperty(name, (state) ? values[0] : values[1]);
		}
	});
}());
