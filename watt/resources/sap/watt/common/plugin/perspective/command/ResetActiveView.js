define(function() {
	"use strict";
	return {

		execute : function() {
			this.context.service.perspective.setAreaMaximized("center_top", false).done();
		},
		
		isAvailable : function() {
			return 	this.context.service.perspective.isAreaMaximized("center_top");
		} 
		
	};
});