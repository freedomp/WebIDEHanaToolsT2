define([], function () {
	"use strict";
	return {
		_oController: undefined,
		getControl: function (oDocument, aSourceDestinations, aTargetDestinations) {
			var that = this;
			this._oController = this.context.service.destinationmappinghandler;
			return this._oController.setServiceData(oDocument, aSourceDestinations, aTargetDestinations).then(function () {
				return Q.sap.ui.define(["sap/watt/ideplatform/plugin/run/ui/DestinationMappingControl"]).then(function (DestinationMappingControl) {
					return Q.sap.ui.define(["sap/watt/ideplatform/plugin/run/ui/DestinationMappingRowControl"]).then(function (DestinationMappingRowControl) {
						// Table row template
						var oRowTemplate = new DestinationMappingRowControl({
							layoutData: new sap.ui.layout.GridData({
								span: "L12 M12 S12"
							}),
							oController: that._oController
						});

						// Table component with binding to backendSystem model
						var oDestinationMapping = new DestinationMappingControl({
							oController: that._oController,
							rows: {
								path: "/backendSystem",
								template: oRowTemplate
							}
						});
						return oDestinationMapping;
					});
				});
			});
		}
	};
});