define(function() {
	"use strict";

	return {
		build: function(oProjectDocument) {
			var that = this;
			return this.context.service.buildRegistry.build(oProjectDocument/* , oBuildOptions */).then(function() {
				return oProjectDocument.refresh();
			});
		},

		getTargetFolder: function(oProjectDocument) {
			return null;
		},

		isBuildRequired: function(oProjectDocument) {
			return true;
		},

		setIsBuildRequired: function(oEvent, oProjectDocument) {
		},

		setLastBuildDateTime: function(oProjectDocument) {
		}
	};
});