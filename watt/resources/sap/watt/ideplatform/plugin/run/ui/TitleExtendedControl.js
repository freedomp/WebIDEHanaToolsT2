sap.ui.define(["sap/ui/core/Control"], function(Control) {
	"use strict";
	return Control.extend("sap.watt.ideplatform.plugin.run.ui.TitleExtendedControl", {
		metadata: {
    		aggregations: {
    			title: {type: 'sap.ui.commons.Title', multiple: false}
    		}
		},
		init: function() {
			this.setAggregation("title", new sap.ui.commons.Title({}));
		}
	});
});