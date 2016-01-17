define(function() {
	"use strict";
	return {

		_oTextLabel : null,

		configure : function(mConfig) {
			this._aStyles = mConfig.styles;
		},

		init : function() {
			var that = this;
			this._oTextLabel = new sap.ui.commons.Label({
				id : "userInfoText",
				text : this.context.i18n.getText("i18n", "displayinformation_unknownUserHi")
			});
			this._oTextLabel.addStyleClass("rightpaneText");

			this.context.service.system.getSystemInfo().then(function(oResult) {
				var sUserString = oResult.sFirstName ? oResult.sFirstName : oResult.sUsername;
				that._oTextLabel.setText(that.context.i18n.getText("i18n", "displayinformation_knownUserHi", [ sUserString ]));
			}).done();

		},

		getContent : function() {
			var that = this;
			if (this._aStyles) {
				return this.context.service.resource.includeStyles(this._aStyles).then(function() {
					return [ that._oTextLabel ];
				});
			}
			return [ that._oTextLabel ];
		}
	};
});
