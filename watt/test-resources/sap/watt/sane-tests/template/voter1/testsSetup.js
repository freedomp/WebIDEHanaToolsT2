window.TEST_REGEXP = /sane-tests\/template\/voter1\/.*Spec\.js$/i;
window.allTestFiles = [
	'template/voter1/service/Feedback/FeedbackServiceSpec',
	'template/voter1/service/FileSystem/FileSystemJSONProviderSpec',
	'template/voter1/service/FioriRefAppTempValidator/FioriRefAppTempValidatorSpec',
	'template/voter1/service/GenerationWizard/AppDescriptorGenericStepSpec',
	'template/voter1/service/GenerationWizard/ModelBuilderValidatorSpec',
	'template/voter1/service/GenerationWizard/RelevantCompProviderSpec',
	'template/voter1/service/GenerationWizard/RelevantModuleProviderSpec',
	'template/voter1/service/GenerationWizard/SmartDocProviderSpec',
	'template/voter1/service/MetaDataHandler/MetadataHandlerSpec',
	'template/voter1/service/PluginDevelopment/templateComponent/TemplateComponentSpec',
	'template/voter1/service/PluginDevelopment/ArchiveTemplateResourcesSpec',
	'template/voter1/service/PluginDevelopment/ConfigSpec',
	'template/voter1/service/PluginDevelopment/EmptyPluginSpec',
	'template/voter1/service/PluginDevelopment/ExistingTemplateComponentSpec',
	'template/voter1/service/PluginDevelopment/PluginDevUtilsSpec',
	'template/voter1/service/PluginManager/PluginManagementSpec',
	'template/voter1/service/ServiceCatalog/CatalogServiceSpec',
	'template/voter1/service/ServiceCatalog/CatalogServiceStepSpec',
	'template/voter1/service/ServiceCatalog/ConnectivityComponentSpec',
	'template/voter1/service/ServiceCatalog/ConnectivityServiceSpec',
	'template/voter1/service/Template/GenerationServiceSpec',
	'template/voter1/service/Template/ModelHelperSpec',
	'template/voter1/service/Template/NeoAppServiceSpec',
	'template/voter1/service/Template/TemplateServiceSpec',
	'template/voter1/service/Template/WizardServiceSpec',
	'template/voter1/unit/GenerationWizard/ContextDocBuilderSpec',
	'template/voter1/unit/GenerationWizard/DataProviderManagerSpec',
	'template/voter1/unit/GenerationWizard/WizardUtilsSpec',
	'template/voter1/unit/GenerationWizard/TemplateCustomizationStepSpec',
	'template/voter1/unit/ServiceCatalog/DataConnectionUtilsSpec'
];

window.customPaths = {
	'template': window.webappPath() + 'test-resources/sap/watt/sane-tests/template',
	'sinon': window.webappPath() + 'test-resources/sap/watt/sane-tests/libs/sinon-1.15.0'
};

window.TMPL_LIBS_PREFIX = window.isRunningInKarmaWebServer() ? '/base' : '';

window.STF_RUNTIME_CHECKS = true;
window.STF_RUNTIME_CHECKS_FILTER = /plugin\/(ui5template|translation|ui5projecthandler|tmplintellisence|template|generationwizard|plugindevelopment|metadatahandler|servicecatalog|feedback)|sane-tests\/template\/voter1/;
window.STF_RUNTIME_CHECKS_EXCULDE_METHOD = ["configWizardSteps", "getServiceUrl", "getWizardStep"];