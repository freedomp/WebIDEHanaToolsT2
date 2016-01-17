define(function() {

	return {

		execute: function() {
			var that = this;
			return that._selectedDocument.getProject().then(function(oProject) {
				return that.context.service.run.getProjectSettingContent().then(function(oView) {
					return that.context.service.run.open(oView, oProject.getTitle());
				});
			});
		},

		isAvailable: function() {
			return this.context.service.run.isRunConfigurationViewActive().then(function(bActive) {
				return !bActive;
			});
		},

		isEnabled: function() {
			var that = this;

			var aPromises = [];
			aPromises.push(this.context.service.perspective.getCurrentPerspective());
			aPromises.push(this.context.service.run.getSelectedDocument());
			aPromises.push(this.context.service.run.getRunnersForSelectedProject());

			return Q.spread(aPromises, function(sPerspectiveName, oSelectedDocument, aRunners) {
				if (sPerspectiveName === "development" && oSelectedDocument && aRunners && aRunners.length > 0) {
					that._selectedDocument = oSelectedDocument;
					return true;
				}

				that._selectedDocument = undefined;
				return false;
			});
		}
	};
});