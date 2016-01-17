define([], function() {
	"use strict";
	return {
		_oController: undefined,
		getControl: function(){
			var that = this;
			this._oController = this.context.service.withmockhandler;
			return Q.sap.ui.define(["sap/watt/ideplatform/plugin/run/ui/WithMockControl"]).then(function(WithMockControl){
				var withMock = new WithMockControl({
					oController: that._oController
				});
				return withMock;
			});                                 
		}
	};
});