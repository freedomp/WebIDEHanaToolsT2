define(["sap.watt.ideplatform.orion.orionbackend/featuretoggle/FeatureToggle"], function (oFeatureToggle) {
	"use strict";

	var PROBLEMS_VIEW = "problemsView";
	function isFeatureSupported(sFeatureId) {
		return oFeatureToggle.isFeatureSupported(PROBLEMS_VIEW, sFeatureId);
	}

	return {
		execute: function () {
			var that = this;
			return this.context.service.problemsView.isVisible().then(function (bVisible) {
				return that.context.service.problemsView.setVisible(!bVisible);
			});
		},

		isAvailable: function () {
			return isFeatureSupported(PROBLEMS_VIEW + "UI").then(function (isProblemsViewSupported) {
				return isProblemsViewSupported;
			});
		},

		isEnabled: function () {
			var oPerspectiveService = this.context.service.perspective;
			return oPerspectiveService.getCurrentPerspective().then(function (sPerspectiveName) {
				return sPerspectiveName === 'development';
			});
		}
	};
});