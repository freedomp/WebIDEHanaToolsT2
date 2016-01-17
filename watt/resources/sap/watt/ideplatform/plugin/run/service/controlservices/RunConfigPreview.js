define([], function() {
	"use strict";
	return {
		_oController: undefined,
		getControl: function(){
			var that = this;
			this._oController = this.context.service.previewhandler;
			return Q.sap.ui.define(["sap/watt/ideplatform/plugin/run/ui/PreviewControl"]).then(function(previewControl){
				var oPreviewControl = new previewControl({
					oController: that._oController,
					layoutData: new sap.ui.layout.GridData({
							span: "L12 M12 S12"
						})
				});
				return oPreviewControl;
			});                                 
		}
	};
});