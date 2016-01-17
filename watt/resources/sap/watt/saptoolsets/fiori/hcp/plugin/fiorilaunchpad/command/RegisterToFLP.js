define(function() {
	"use strict";

	var _oProjectFromSelection = null;

	function _getProjectFromSelection(oContext) {
		var selectionService = oContext.service.selection;
		var rbUtilsService = oContext.service.repositorybrowserUtils;
		return rbUtilsService.isSingleFolderNotRootSelection().then(function(bIsSingleFolderNoRootSelection) {
			if (bIsSingleFolderNoRootSelection) {
				return selectionService.getSelection().then(function(aSelection) {
					return aSelection[0].document.getProject().then(function(oProjectDocument) { // User may select any folder belonging to the project
						return oProjectDocument;
					});
				});
			} else {
				return null;
			}
		});
	}

	function _execute() {
		if(_oProjectFromSelection) {
			return this.context.service.fiorilaunchpad.openWizard(_oProjectFromSelection, "menu");
		} else {
			//in case the execute was called directly without calling isEnabled first...
			var that = this;
			return _getProjectFromSelection(that.context).then(function(oProject) {
				return that.context.service.fiorilaunchpad.openWizard(oProject, "menu");
			});
		}
	}

	function _isEnabled() {
		var that = this;
		var serverType = sap.watt.getEnv("server_type");
		if (serverType === "java" || serverType === "local_hcproxy") {
			return false; // "java" for Eclipse and "local_hcproxy" for local installation
		} else {
			return _getProjectFromSelection(that.context).then(function(oProjectDocument) {
				//Init _oProjectFromSelection so it can be used in _execute without being calculated again...
				_oProjectFromSelection = oProjectDocument;
				if (oProjectDocument) {
		            return true; 
				}
				return false;
			});
		}
	}

	return {
		execute: _execute,
		isAvailable: function() {
			return true;
		},
		isEnabled: _isEnabled
	};
});
