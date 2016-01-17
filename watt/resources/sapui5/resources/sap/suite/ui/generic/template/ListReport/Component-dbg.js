jQuery.sap.require("sap.suite.ui.generic.template.library");
jQuery.sap.require("sap.suite.ui.generic.template.lib.TemplateComponent");
jQuery.sap.require("sap.suite.ui.generic.template.js.AnnotationHelper");
jQuery.sap.declare("sap.suite.ui.generic.template.ListReport.Component");

sap.suite.ui.generic.template.lib.TemplateComponent.extend("sap.suite.ui.generic.template.ListReport.Component", {
	// templateName: "sap.suite.ui.generic.template.ListReport.view.List",

	metadata: {
		library: "sap.suite.ui.generic.template",
		properties: {
			"templateName": {
				"type": "string",
				"defaultValue": "sap.suite.ui.generic.template.ListReport.view.ListReport"
			},
			"gridTable": "boolean",
			"hideTableVariantManagement": "boolean"
		},
		"manifest": "json"
	},

	hasDraft: function() {
		"use strict";

		return this.getAppComponent().getTransactionController().getDraftController().getDraftContext().isDraftEnabled(this.getEntitySet());
	},

	refreshBinding: function() {
		"use strict";

		// refresh list binding
		var oView = this.getAggregation("rootControl");
		if (oView instanceof sap.ui.core.mvc.XMLView) {
			// Rebind table
			var oSmartTable = oView.byId("listReport");
			if (oSmartTable && oSmartTable.rebindTable) {
				oSmartTable.rebindTable();
			}
		}
	}

});
