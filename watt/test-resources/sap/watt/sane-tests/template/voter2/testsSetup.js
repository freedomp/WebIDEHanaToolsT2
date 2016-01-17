window.TEST_REGEXP = /sane-tests\/template\/voter2\/.*Spec\.js$/i;
window.allTestFiles = [
	'template/voter2/service/TmplIntellisence/TmplCodeCompletionSpec',
	'template/voter2/service/Translation/TranslationServiceSpec',
	'template/voter2/service/UI5ProjectHandler/AppDescriptorHandlerSpec',
	'template/voter2/service/UI5ProjectHandler/ComponentHandlerSpec',
	'template/voter2/service/UI5ProjectHandler/ConfigurationHandlerSpec',
	'template/voter2/service/UI5ProjectHandler/UI5ProjectHandlerSpec',
	'template/voter2/service/UI5Template/AddSAPUI5SmartTempCompSpec',
	'template/voter2/service/UI5Template/BasicSAPUI5AppComponentSpec',
	'template/voter2/service/UI5Template/BasicSAPUI5ApplicationProjectTemplateSpec',
	'template/voter2/service/UI5Template/FioriFullScreenTemplateSpec',
	'template/voter2/service/UI5Template/FioriMasterDetailsTemplateSpec',
	'template/voter2/service/UI5Template/FioriMasterMasterDetailsTemplateSpec',
	'template/voter2/service/UI5Template/ListReportExtensionSpec',
	'template/voter2/service/UI5Template/MasterDetailWithCrudTemplateSpec',
	'template/voter2/service/UI5Template/MDWithAttachmentsAnnoTempSpec',
	'template/voter2/service/UI5Template/MDWithAttachmentsSettingsSpec',
	'template/voter2/service/UI5Template/MDWithAttachmentsTempSpec',
	'template/voter2/service/UI5Template/ObjectPageExtensionSpec',
	'template/voter2/service/UI5Template/SmartTemplateSpec',
	'template/voter2/service/UI5Template/service/SmartTemplateHelperSpec',
	'template/voter2/service/UIAnnotation/AnnotationSelectionStepSpec',
	'template/voter2/service/UIAnnotation/AnnotationServiceSpec'
];

window.customPaths = {
	'template': window.webappPath() + 'test-resources/sap/watt/sane-tests/template',
	'sinon': window.webappPath() + 'test-resources/sap/watt/sane-tests/libs/sinon-1.15.0'
};

window.TMPL_LIBS_PREFIX = window.isRunningInKarmaWebServer() ? '/base' : '';

window.STF_RUNTIME_CHECKS = true;
window.STF_RUNTIME_CHECKS_FILTER = /plugin\/(ui5template|translation|ui5projecthandler|tmplintellisence|template|generationwizard|plugindevelopment|metadatahandler|servicecatalog|feedback)|sane-tests\/template\/voter2/;
window.STF_RUNTIME_CHECKS_EXCULDE_METHOD = ["configWizardSteps", "getServiceUrl", "getWizardStep"];