define([], function() {
	"use strict";
    	return {
		execute: function() {
			var that = this;
			return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
					return that.context.service.console.setVisible(true).then(function() {
						return that.context.service.builder.build(aSelection[0].document);
					});
			});
		},

		isAvailable: function() {
			var that = this;
			if (sap.watt.getEnv("internal")) {
				return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
					return that.context.service.builder.isBuildSupported(aSelection[0].document);
				});
			} else {
				return false;
			}
		},

		isEnabled: function() {
			var that = this;
			if (sap.watt.getEnv("internal")) {
				return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
					return that.context.service.builder.isBuildRequired(aSelection[0].document);
				});
			} else {
				return false;
			}
		}
	};

});