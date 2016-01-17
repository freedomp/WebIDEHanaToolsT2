define([], function() {
	"use strict";
	return {
		_oController: undefined,
		_extservice: undefined,

		configure: function(mConfig) {
			if (mConfig) {
				if (mConfig.externalservices && mConfig.externalservices.length > 0) {
					this._extservice = mConfig.externalservices[0].service;
				}
			}
		},
		
		
		getControl: function(oDoc) {
			var that = this;
			this._oController = this.context.service.resourcemappinghandler;
			return this._oController.setServiceData(oDoc, this._extservice).then(function() {
				return Q.sap.ui.define(["sap/watt/ideplatform/plugin/run/ui/ResourceMappingControl"]).then(function(ResourceMappingControl) {
					return Q.sap.ui.define(["sap/watt/ideplatform/plugin/run/ui/ReuseLibraryElement"]).then(function(ReuseLibraryElement) {

						var oRowTemplate = new ReuseLibraryElement({
							oController: that._oController
						});

						var resourceMapping = new ResourceMappingControl({
							 layoutData: new sap.ui.layout.GridData({
							 	span: "L12 M12 S12"
							 }),
							oController: that._oController,

							rows: {
								path: "/appsVersion",
								template: oRowTemplate
							}
						});

						return resourceMapping;
					});
				});

			});

		}
	};
});