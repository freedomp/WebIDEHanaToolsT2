define([ "sap/watt/common/plugin/platform/service/ui/AbstractPart" ], function(AbstractPart) {
	"use strict";
	var FakeProvider = AbstractPart.extend("sap.watt.common.plugin.outlineprovider.service.outlineProvider", {
		setProvider : function(oEditor) {
			return true;
		},
		getContent : function() {
			return new sap.ui.commons.Button({
				text : "fake outline button", 
				id: "fakeButton"
			});
		},
		onSelectionChanged : function(oEvent) {
			return Q();
		},
		canHandle : function() {
			return true;
		}
	});
	return FakeProvider;
});