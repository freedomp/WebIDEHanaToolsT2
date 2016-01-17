define(function() {
	"use strict";
	return {

		execute : function() {
			this.context.service.perspective.resetToDefault().done();
		},

		isAvailable : function() {
			return true;
		},

		isEnabled : function() {
			return true;
		}
	};
});
