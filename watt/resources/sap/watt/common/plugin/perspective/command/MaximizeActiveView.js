define(function() {
	"use strict";
	return {

		execute : function() {
			this.context.service.perspective.setAreaMaximized("center_top", true).done();
		},
		
		isAvailable : function() {
			return 	this.context.service.perspective.isAreaMaximized("center_top").then(function(bMaximized) {
				return !bMaximized;			
			});
		} 
		
	};
});