define(function() {
	"use strict";
	return {

		_oDebugModeTextLabel : null,

		configure : function(mConfig) {
			this._aStyles = mConfig.styles;
		},

		init : function() {
			this._oDebugModeTextLabel = new sap.ui.commons.Label({
				id : "debugModeText",
				text : this.context.i18n.getText("i18n", "debug_mode")
			});
			this._oDebugModeTextLabel.addStyleClass("debugModeText");
		},

		getContent : function() {
			var that = this;
			var bDevMode = /[&?](sap-ide-dev[&=]|sap-ide-dev)+/i.test(window.location.search);
			if (this._aStyles) {
				return this.context.service.resource.includeStyles(this._aStyles).then(function() {
					if (bDevMode) {
						return [ that._oDebugModeTextLabel ];
					} else {
						return null;
					}
				});
			}
			if (bDevMode) {
				return [ that._oDebugModeTextLabel ];
			} else {
				return null;
			}
		},

		onLoadingRDEOnDevMode : function() {
			var bDevMode = /[&?](sap-ide-dev[&=]|sap-ide-dev)+/i.test(window.location.search);
			if (bDevMode) {
				document.title = this.context.i18n.getText("debug_mode_browser_title") + document.title;
			}
		}
	};
});
