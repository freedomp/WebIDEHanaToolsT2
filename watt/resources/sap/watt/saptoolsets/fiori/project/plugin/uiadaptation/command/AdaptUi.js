define(["sap/watt/lib/lodash/lodash"], function(_) {

	var selectedProject = null;
	var that = null;

	/**
	 * Opens the UI Adaptation pane
	 *
	 * @returns {Q.promise}
	 * @private
	 */
	var _execute = function() {
		return that.context.service.uiadaptation.openAdaptUI(selectedProject);
	};

	/**
	 * The UI Adaptation pane command is always available but it is enabled for relevant projects only.
	 *
	 * @returns {boolean}
	 * @private
	 */
	var _isAvailable = function() {
		if(sap.watt.getEnv("internal")) {
			return true;
		}else{
			return false;
		}
	};

	/**
	 * The UI Adaptation pane command is enabled only if the type of the project is UI Adaptation type.
	 * The command is enabled if any file/folder under the root of a valid project is selected.
	 *
	 * @returns {Q.promise[boolean]}
	 * @private
	 */
	var _isEnabled = function() {
		that = this;
		return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
			var oSelectedDocument = aSelection[0].document;
			return oSelectedDocument.getProject();
		}).then(function(oProjectDocument) {
			selectedProject = oProjectDocument;
			var sFilePath = oProjectDocument.getEntity().getFullPath() + "/webapp";
			return that.context.service.filesystem.documentProvider.getDocument(sFilePath);
		}).then(function(sFolder) {
			if (sFolder) {//enable uiAdaptation only for new project types
				return Q.all([
					that.context.service.projectType.getProjectTypes(selectedProject),
					that.context.service.uiadaptation.getUIAdaptationProjectTypeId()
				]).spread(function(aProjectTypes, sUIAdaptationExtProjectTypeId) {
					return _.isArray(aProjectTypes) && _.contains(_.pluck(aProjectTypes, "id"), sUIAdaptationExtProjectTypeId);
				});
			}
			return false;
		});
	};

	return {
		execute: _execute,
		isAvailable: _isAvailable,
		isEnabled: _isEnabled
	};
});