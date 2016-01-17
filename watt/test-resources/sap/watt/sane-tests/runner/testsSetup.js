window.TEST_REGEXP = /sane-tests\/runner\/.*Spec\.js$/i;
window.allTestFiles = [
	'runner/service/fiorirunner/FiorirunnerSpec',
	'runner/service/commonrunners/CommonrunnersSpec',
	'runner/service/commonrunners/FileSearchUtilSpec',
	'runner/service/commonrunners/InputValidatorUtilSpec',
	'runner/service/commonrunners/SwitchBackendsSpec',
	'runner/service/embeddedrunner/EmbeddedrunnerSpec',
	'runner/service/mockpreview/AppDescriptorUtilSpec',
	'runner/service/runconsole/RunConsoleViewSpec',
	'runner/service/chewebapprunner/CheWebappRunnerSpec',
	'runner/service/translation/PseudoTranslationSpec',
	'runner/service/qunit/QunitUtilSpec',
	'runner/service/qunit/QunitTemplateSpec',
	'runner/service/qunit/OPAfioriTemplateSpec',
	'runner/service/ideplatform/ProjectRecentlyUsedSpec',
	'runner/service/ideplatform/RunConfigHistorySpec',
	'runner/service/commonrunners/UI5VersionsSpec',
	'runner/service/qunit/EsprimaParserSpec',
	'runner/service/qunit/ChooseFileStepContentSpec',
	'runner/service/chepreviewadapter/ChePreviewAdapterSpec',
	'runner/service/mockpreview/MockPreviewSpec',
	'runner/service/ideplatform/AppCacheBusterSpec',
	'runner/service/ideplatform/RunnersSpec',
	'runner/service/ideplatform/RunWithConfigurationSpec',
	'runner/service/ideplatform/DocumentWindowsUtilSpec',
	'runner/service/ui5versionsutil/UI5VersionsUtilSpec',
	'runner/service/destinationsutil/DestinationsUtilSpec',
	'runner/service/ideplatform/FilePathControlSpec',
	'runner/service/ideplatform/FilePathHandlerSpec',
	'runner/service/ideplatform/UI5VersionsCompositeControlSpec',
	'runner/service/ideplatform/ResourceMappingControlSpec',
	'runner/service/translationsettings/TranslationSettingsSpec',
	'runner/service/ideplatform/URLParametersControlSpec',
	'runner/service/ideplatform/DestinationMappingControlSpec',
	'runner/service/reuselibsutil/ReuselibsUtilSpec',
	'runner/service/ideplatform/PreviewControlSpec',
	'runner/service/ideplatform/ResourceMappingHandlerSpec',
	'runner/service/ideplatform/PreviewHandlerSpec',
	'runner/service/qrcode/QRCodeSpec',
	'runner/service/ushellsandbox/UshellSandboxSpec'
	
];

window.customPaths = {
	'runner': window.webappPath() + 'test-resources/sap/watt/sane-tests/runner',
	'sinon': window.webappPath() + 'test-resources/sap/watt/sane-tests/libs/sinon-1.15.0'
};