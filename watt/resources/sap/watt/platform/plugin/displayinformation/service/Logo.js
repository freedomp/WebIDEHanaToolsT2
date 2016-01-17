define(function() {
	"use strict";
	return {

		_oImage : null,

		init : function() {
			var that = this;
			this._oImage = new sap.ui.commons.Image("SAP_logo");
			this._oImage.setSrc(jQuery.sap.getModulePath("sap.watt.uitools.images.SAP_logo", ".png"));
			this._oImage.setDecorative(false);
			this._oImage.addStyleClass("rightpaneImage");
			//make image not draggable -> needed for firefox
			this._oImage.addEventDelegate({
				onAfterRendering : function() {
					that._oImage.getDomRef().ondragstart = function() {
						return false;
					};
				}
			});

		},

		getContent : function() {
			return [ this._oImage ];
		}
	};
});
