jQuery.sap.declare("sap.watt.ideplatform.plugin.gitclient.ui.AccordionSection");

sap.ui.commons.AccordionSection.extend("sap.watt.ideplatform.plugin.gitclient.ui.AccordionSection", {
	metadata: {
		aggregations: {
			"_radioButton": {
				type: "sap.ui.commons.RadioButton",
				multiple: false,
				visibility: "hidden"
			}
		},
		events: {
			select: {}
		}
	},

	init: function() {
	    var that = this;
		this.setAggregation("_radioButton", new sap.ui.commons.RadioButton({
			groupName: "gitLogRBG",
			select: function(){
			    that.fireSelect();
			}
		}));
	},

	getSelected: function() {
		return this.getAggregation("_radioButton").getSelected();
	}
});