/**
 * The goto js definition command.
 * 
 */
define(["./../util/editorUtil"], function(mEditorUtil) {
	"use strict";

	return {
		execute : function() {
			var services = this.context.service;
			services.usagemonitoring.startPerf("editor", "navigate_definition").done();
			return mEditorUtil.getCurrentEditor(services.selection).then(function(oEditor) {
				if (oEditor) {
					return oEditor.getContentStatus(true).then(function(oContentStatus) {
						return services.jsdefinition.gotoDefinition(oContentStatus).then(function() {
							return services.usagemonitoring.report("editor", "navigate_definition");
						});
					});
				} else {
					return Q();
				}
			});
		},

        _isSupported : function() {
            var services = this.context.service;
			return mEditorUtil.getCurrentEditor(services.selection).then(function(oEditor) {
				if (oEditor) {
					return oEditor.getVisible().then(function(visible) {
						if (visible){
							return oEditor.getSelection().then(function(oSelection) {
								var sFileExtension = oSelection && oSelection.document && oSelection.document.getEntity().getFileExtension();
								return services.jsdefinition.isFileExtensionSupported(sFileExtension);
							});
						} else {
							return false;
						}
					});
				} else {
					return false;
				}
			});
        },
        
		isAvailable : function() {
			return this._isSupported(); 
		},

		isEnabled : function() {
			return this._isSupported();
		}
	};
});