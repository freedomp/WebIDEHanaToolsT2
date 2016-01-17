define(["sap/watt/lib/lodash/lodash"], function(_) {

	var selectedProject = null;
	
	var execute = function() {
		var that = this;
		return that.context.service.uiadaptation.loadChangesFromWorkspace(selectedProject).then(function(aChanges) {
			return that.context.service.lrepconnector.updateChange(aChanges).then(function() {
			});
		});

	};

	var isAvailable = function() {
	//	return true;
		return false;
	};

	var isEnabled = function() {
		var that = this;
		return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
			var oSelectedDocument = aSelection[0].document;
			return oSelectedDocument.getProject();
		}).then(function(oProjectDocument) {
			selectedProject = oProjectDocument;
			return Q.all([
				that.context.service.projectType.getProjectTypes(selectedProject),
				that.context.service.uiadaptation.getUIAdaptationProjectTypeId()
			]);
		}).spread(function(aProjectTypes, sUIAdaptationExtProjectTypeId) {
			return _.isArray(aProjectTypes) && _.contains(_.pluck(aProjectTypes, "id"), sUIAdaptationExtProjectTypeId);
		});

	};
	return {
		execute: execute,
		isAvailable: isAvailable,
		isEnabled: isEnabled
	};
});