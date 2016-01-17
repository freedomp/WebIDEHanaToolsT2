define(function() {
	"use strict";
	return {

		// This is a preliminary feature, only visible if url parameter "testconsole" is available
		execute : function() {
			return this.context.service.console.clear();
		},

		isAvailable : function() {
			return true;
		},

		isEnabled : function() {
			var oPerspectiveService = this.context.service.perspective;
			return oPerspectiveService.getCurrentPerspective().then(function(sPerspectiveName) {
				return sPerspectiveName == 'development';
			});
		}
	};
});
