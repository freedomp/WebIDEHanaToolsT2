define(function() {
	"use strict";
	return {

		execute : function() {
			this.context.service.reportABug.report("Report");
		},

		isAvailable : function() {
			return true;
		},

		isEnabled : function() {
			return true;
		}
	};
});