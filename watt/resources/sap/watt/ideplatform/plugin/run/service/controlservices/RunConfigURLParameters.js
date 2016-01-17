define([], function() {
	"use strict";
	return {
		_oController: undefined,
		getControl: function() {
			var that = this;
			this._oController = this.context.service.urlparametershandler;
				return Q.sap.ui.define(["sap/watt/ideplatform/plugin/run/ui/URLParametersControl"]).then(function(URLParametersControl) {
					var urlparameters = new URLParametersControl({
						layoutData: new sap.ui.layout.GridData({
							span: "L12 M12 S12"
						}),
						oController: that._oController,
						sHashTitle: that.sHashTitle,
						sHashLabel: that.sHashTitle,
						sHashInfo: that.sHashInfo,
						sURLLabel: that.sURLLabel,
						sURLInfo: that.sURLInfo,
						sNamelabel: that.sNamelabel,
						sValuelabel: that.sHashInfo
					});
					return urlparameters;
			});
		}
	};
});