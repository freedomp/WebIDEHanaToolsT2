define({

	TEMPLATENAME : "sap.suite.ui.generic.template.ListReport",

	configWizardSteps: function() {},

	onBeforeTemplateGenerate: function(templateZip, model) {

		var that = this;
		var oDocument = model.selectedDocument;
		var oSmartTemplateHelper = this.context.service.smartTemplateHelper;
		var sViewName = this.TEMPLATENAME + ".view.ListReport";
		var sExtPoint = "SmartFilterBarControlConfigurationExtension";

		return this.context.service.ui5projecthandler.getAppNamespace(oDocument).then(function(sNameSpace) {
			model.namespace = sNameSpace;
			return oSmartTemplateHelper.getEntitySets(model.selectedDocument, that.TEMPLATENAME).then(function(aEntitySets) {
				var oExtensionContent = {
					"className": "sap.ui.core.Fragment",
					"fragmentName": sNameSpace + ".ext.fragment.customfilter",
					"type": "XML"
				};
				var sControllerName = sNameSpace + ".ext.controller.customfilter";
				var sEntitySet = aEntitySets[0] ? aEntitySets[0].name : "";
				var bOverwrite = model.overwrite;
				model.sViewFile = model.selectedDocument.getEntity().getFullPath() + "/webapp/ext/fragment/customfilter.fragment.xml";

				return oSmartTemplateHelper.createNewViewExtensionEntry(oDocument, sViewName, sExtPoint, sEntitySet, oExtensionContent, null, bOverwrite).then(
					function() {
						return oSmartTemplateHelper.createNewControllerExtensionEntry(oDocument, sViewName, sControllerName, bOverwrite).then(function() {
							return [templateZip, model];
						});
					});
			});
		});
	},

	onAfterGenerate: function(projectZip, model) {
		return [projectZip, model];
	},

	customValidation: function(model) {
		var that = this;
		return this.context.service.smartTemplateHelper.validateOnSelection(model.selectedDocument, this.TEMPLATENAME).fail(function(oError){
			if(oError.name === "TemplateDoesNotExist"){
				throw new Error(that.context.i18n.getText("i18n", "smart_extension_err", "List Report"));
			} else {
				throw oError;
			}
		});
	}
});