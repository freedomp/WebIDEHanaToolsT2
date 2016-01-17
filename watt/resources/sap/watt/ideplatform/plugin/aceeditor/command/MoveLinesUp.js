define(["./General"], function(general){
	"use strict";	
	return {
		execute: function (name) {
			return general.execute(name, this.context);
		},

		isAvailable: function () {
			return true;
		},

		isEnabled: function () {			
			return general.isEnabled(this.context);				
		}	
	};
});