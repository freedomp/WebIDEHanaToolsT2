jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.VisibilityContainer");
sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.VisibilityContainer", {
	metadata: {
		properties: {
			visible: {
				type: "boolean",
				defaultValue: true
			}
		},
		aggregations: {
			content: {
				type: "sap.ui.core.Control",
				multiple: true
			}
		}
	},

	renderer: function(oRm, oControl) {
		if (!oControl.getVisible()) {
			return;
		}
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");

		var aChildren = oControl.getContent();
		// loop over all child Controls, 
		for (var i = 0; i < aChildren.length; i++) {
			// render the colored box around them
			oRm.write("<div");
			oRm.addStyle("display", "inherit");
			oRm.writeStyles();
			oRm.write(">");

			oRm.renderControl(aChildren[i]); // render the child Control 
			// (could even be a big Control tree, but you don't need to care)
			oRm.write("</div>"); // end of the box around the respective child
		}
		oRm.write("</div>"); // end of the complete Control
	}
});