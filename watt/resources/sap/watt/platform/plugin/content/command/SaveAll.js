define(function() {
	"use strict";
	return {

		execute : function() {
			return this.context.service.content.saveAll();
		},

		isAvailable : function() {
			return true;
		},

		isEnabled : function() {
			return this.context.service.content.isDirty();
		}
	};
});
