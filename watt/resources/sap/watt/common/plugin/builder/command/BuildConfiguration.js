define([], function() {
	"use strict";
	return {
		execute: function() {
			var that = this;
			return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
				return that.context.service.projectsetting
					.setVisible(true, aSelection[0].document, "buildConfigurationsInProjectSettings");
			});
		},

		isAvailable: function() {
			var that = this;
			if (sap.watt.getEnv("internal")) {
				return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
					return that.context.service.builder.isBuildConfigurationSupported(aSelection[0].document);
				});
			} else {
				return false;
			}
		},

		isEnabled: function() {
			var that = this;
			if (sap.watt.getEnv("internal")) {
				return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
					return that.context.service.builder.isBuildConfigurationSupported(aSelection[0].document);
				});
			} else {
				return false;
			}
		}
	};

});