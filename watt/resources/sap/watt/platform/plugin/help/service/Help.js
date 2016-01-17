define(function() {
	"use strict";
	return {
		/**
		 * @memberOf sap.watt.common.plugin.help.service.Help
		 */
		_sUrl : null,

		init : function() {
		},

		configure : function(mConfig) {
			var configURL = mConfig.url;
			this._sUrl = configURL ? configURL.replace("{{help_url}}", sap.watt.getEnv("help_url")) : null;
		},

		getHelpUrl : function() {
			return this._sUrl;
		}
	};
});
