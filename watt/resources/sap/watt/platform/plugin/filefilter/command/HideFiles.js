define(function() {
	
	"use strict";
	
	return {
		execute : function() {
			var that = this;
			return this.context.service._filefilter.hide.hideDocuments().then(function() {
				return that.context.service.command.invalidateAll();
			});
		},

		isAvailable : function() {
			var that = this;
			return this.context.service._filefilter.hide.supportParameterExists().then(function(bSupportparameter) {
				if (bSupportparameter) {
					return false;
				}
				
				return that.context.service._filefilter.hide.getHiddenState().then(function(bHidden) {
					return !bHidden;
				});
			});
		},

		isEnabled : function() {
			return true;
		}
	};
});