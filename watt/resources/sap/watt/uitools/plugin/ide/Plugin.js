define(function() {
	"use strict";
	return {

		onAfterLogin : function(oEvent) {
			var that = this;
			// Keep IDE alive 
			this.context.service.keepAlive.isAlive().done();

			this.context.service.layout.getLayoutTypes().then (function(oLayoutTypes) {
				return that.context.service.layout.show(oLayoutTypes.MAIN);
			}).done();
		},
		
		onFailure : function(oEvent) {
			var that = this;
			
			this.context.service.layout.getLayoutTypes().then (function(oLayoutTypes) {
				return that.context.service.layout.show(oLayoutTypes.FAILURE);
			}).done();
		}
	};
});