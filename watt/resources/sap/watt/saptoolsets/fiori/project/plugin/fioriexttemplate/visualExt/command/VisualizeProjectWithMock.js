define(function() {

	var selectedProject = null;
	var extensibilityModel = null;
	var that = null;

	var _execute = function() {
		// checks if a metadata folder exists 
		return this.context.service.metadataHandler.getMetadataPath(selectedProject).then(function(sMetadataFolderPath){
			return selectedProject.objectExists(sMetadataFolderPath).then(function(bObjectExists) {
				if (!bObjectExists) {
					that.context.service.usernotification.alert(that.context.i18n.getText("i18n", "msg_mock_model_missing", [sMetadataFolderPath])).done();
				} else {
					return that.context.service.uicontent.openVisualExt(that.context, selectedProject, extensibilityModel, true);
				}
			});	
		});
	};

	var _isAvailable = function() {
		// command is always visible, but not enabled
		return true;
	};

	var _isEnabled = function() {
		var selectionService = this.context.service.selection;
		that = this;

		// return from both the editor and repository browse
		return selectionService.assertNotEmpty().then(function(aSelection) {
			var selectedDocument = aSelection[0].document;
				return that.context.service.uicontent.isExtensibilityOpen().then(function(extensibilityPaneOpened){
			    if(extensibilityPaneOpened){
			        return false;
			    } else {
			        return isValidExtensionProject(selectedDocument);
			    }
			});
		});
	};

	var isValidExtensionProject = function(selectedDocument) {
		if (selectedDocument) {
			return selectedDocument.getProject().then(function(project) { // User may select any file/folder belonging to the project
				var documentPath = project.getEntity().getFullPath();
				return that.context.service.extensionproject.getExtensibilityModel(documentPath).then(function(projectJson) {
					if (projectJson.extensibility && !jQuery.isEmptyObject(projectJson.extensibility.views) && !jQuery.isEmptyObject(projectJson.extensibility.controllers)) {
						extensibilityModel = projectJson;
						selectedProject = project;
						return true;
					} else {
						return false;
					}
				}).fail(function() {
					return false;
				});
			}).fail(function() {
				return false;
			});
		}

		// document is null or undefined
		return false;
	};

	return {
		execute : _execute,
		isAvailable : _isAvailable,
		isEnabled : _isEnabled
	};
});