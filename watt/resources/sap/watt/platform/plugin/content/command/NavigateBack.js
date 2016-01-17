define(function() {
	"use strict";
	return {

		execute: function() {
			return this.context.service.content.navigateBack();
		},

		isAvailable: function() {
			return true;
		},

		isEnabled: function() {
			var that = this;
			var oPerspectiveService = that.context.service.perspective;
			var aPromises = [oPerspectiveService.getCurrentPerspective(), oPerspectiveService.getServiceAt("center_top")];
			return Q.all(aPromises).spread(function(sPerspectiveName, oService) {
				if (sPerspectiveName === "development" && oService === that.context.service.content) {
				    return that.context.service.content.hasNavigateBack();
				} else {
					return false;
				}
			});
		}
	};
});