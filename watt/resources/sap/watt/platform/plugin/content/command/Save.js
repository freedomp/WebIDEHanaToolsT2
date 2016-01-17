define(function() {
	"use strict";
	return {

		execute : function() {
			return this.context.service.content.save();
		},

		isAvailable : function() {
			return true;
		},

		isEnabled : function() {
			return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
				return !!aSelection[0].document.isDirty && aSelection[0].document.isDirty();
			});
		}
	};
});
