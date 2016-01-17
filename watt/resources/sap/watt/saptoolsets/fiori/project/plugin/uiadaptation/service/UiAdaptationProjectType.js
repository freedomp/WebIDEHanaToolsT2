define([], function() {
	"use strict";

	return {
		isAvailable: function() {
			//make UI Adaptation project type available only in internall mode
			if (sap.watt.getEnv("internal")) {
				return true;
			} else {
				return false;
			}
		},

		isEnabled: function() {
			return true;
		}
	};

});