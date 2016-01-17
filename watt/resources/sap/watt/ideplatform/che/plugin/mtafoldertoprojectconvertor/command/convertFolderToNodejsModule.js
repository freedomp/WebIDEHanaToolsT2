define([],function() {
	
	"use strict";
	
	return {
		_oSelectedFolder : undefined,
		
		execute : function() {
			
			var that = this;
			var sComponentName = that.context.i18n.getText("i18n", "convert_to_module_component_name");
			var sOperationName = that.context.i18n.getText("i18n", "convert_to_module_operation_name", that._oSelectedFolder.getEntity().getName());
			return that.context.service.report.startOperation(sComponentName, sOperationName).then(function() {
				return that._oSelectedFolder.convertToProject({"type" : "sap.nodejs"}).then(function(oResponse) {
					return that.context.service.report.endOperationWithSuccess(sComponentName, sOperationName);
				}).fail(function(oError) {
					return that.context.service.report.endOperationWithFailure(sComponentName, sOperationName, oError.message);
				});
			});
		},
			
		isAvailable : function() {
			return true;
		},
		
		isEnabled : function() {
			var that = this;
			return this.context.service.repositorybrowser.getSelection().then(function(oSelection) {
				if (oSelection && oSelection.length === 1) {
					that._oSelectedFolder = oSelection[0].document;
					return that.context.service.mtafoldertoprojectconvertor.validation.isConvertable(that._oSelectedFolder);	
				}
				
				return false;
			});
		}
	};
});