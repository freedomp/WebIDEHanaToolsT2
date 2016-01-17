(function() {
	"use strict";

	sap.ui.jsfragment("sap.xs.nodejs.project.view.NodejsRunConfigurationArguments", {

		createContent: function() {
			jQuery.sap.require("sap.watt.ideplatform.plugin.run.ui.TitleExtendedControl");

			var oTitle = new sap.ui.commons.Title({
				text: "{i18n>view.RunConfiguration.arguments.title_xtit}",
				tooltip: "{i18n>view.RunConfiguration.arguments.tooltip_xtol}",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			var oTtlArguments = new sap.watt.ideplatform.plugin.run.ui.TitleExtendedControl({});
			oTtlArguments.setAggregation("title", oTitle);

			// input field
			var oArgumentsField = new sap.ui.commons.TextField({
				value: "{/arguments}",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			return [oTtlArguments, oArgumentsField];
		}
	});
}());
