define(["sap/watt/lib/lodash/lodash"], function(_) {

	var oSelectedProject = null;

	var _execute = function(vValue, oWindow) {
		return this.context.service.uiadaptation.previewAppWithChanges(oSelectedProject, oWindow);
	};

	var _isAvailable = function() {
		return this.isEnabled(); // the logic of isAvailable is the same as isEnabled
	};

	var _isEnabled = function() {
		if (sap.watt.getEnv("internal")) {
			var that = this;
			return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
				var oSelectedDocument = aSelection[0].document;
				return oSelectedDocument.getProject();
			}).then(function(oProjectDocument) {
				oSelectedProject = oProjectDocument;
				var sFilePath = oProjectDocument.getEntity().getFullPath() + "/webapp";
				return that.context.service.filesystem.documentProvider.getDocument(sFilePath);
			}).then(function(sFolder) {//available only on new projects (with webapp)
				if (sFolder) {
					return Q.all([
						that.context.service.projectType.getProjectTypes(oSelectedProject),
						that.context.service.uiadaptation.getUIAdaptationProjectTypeId()
					]).spread(function(aProjectTypes, sLREPExtProjectTypeId) {
						return _.isArray(aProjectTypes) && _.contains(_.pluck(aProjectTypes, "id"), sLREPExtProjectTypeId);
					});
				} else {
					return false;
				}
			});
		}
		return false;
	};
	return {
		execute: _execute,
		isAvailable: _isAvailable,
		isEnabled: _isEnabled
	};
});