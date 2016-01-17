/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.define(["sap/ui/commons/TextField", "sap/ui/commons/TextFieldRenderer"], function(TextField, TextFieldRenderer) {

	var TextFieldCustom = TextField.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.TextFieldCustom", {

		metadata: {
		properties: {
				findString: {
					type: "string",
					defaultValue: ""
				}
			}
		},
		renderer: {
			render: function(oRm, oControl) {
			    	TextFieldRenderer.render(oRm, oControl);	
			}
		},
		onAfterRendering: function(event) {
			var oControl = event.srcControl;
			if(oControl.getValue()==(this.mProperties.findString)){
			oControl.addStyleClass("dummy1");
			}
		}
	});

	return TextFieldCustom;

}, true);
