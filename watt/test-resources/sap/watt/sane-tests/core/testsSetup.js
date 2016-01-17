window.TEST_REGEXP = /sane-tests\/core\/.*Spec\.js$/i;
window.allTestFiles = [
	'core/core/RunTimeChecksSpec',
	'core/core/platform/plugin/layout/service/layoutSpec',
	'core/core/platform/plugin/menu/service/menuSpec',
	'core/core/platform/plugin/command/service/commandSpec',
	'core/core/platform/plugin/commandgroup/service/commandGroupSpec',
	'core/core/platform/plugin/clipboard/service/clipboardSpec',
	'core/core/platform/plugin/settings/service/settingsSpec',
	'core/core/platform/plugin/decoration/service/decorationSpec',
	'core/core/platform/plugin/help/service/helpSpec',
	'core/core/platform/plugin/usernotification/service/usernotificationSpec',
	'core/core/platform/hcp/plugin/destination/service/destinationSpec',
	'core/core/platform/plugin/keepalive/service/keepaliveSpec',
	'core/core/platform/plugin/filefilter/service/fileFilterSpec',
	'core/core/platform/plugin/filefilter/service/fileFilterHideSpec',
	'core/core/common/plugin/document/service/documentIntegrationSpec',
	'core/core/common/plugin/document/service/contentManagerSpec',
	'core/core/common/plugin/document/service/documentSpec',
	'core/core/common/plugin/perspective/service/perspectiveSpec',
	'core/core/common/plugin/perspective/service/perspectivenorestoreSpec',
	'core/core/platform/plugin/focus/service/focusSpec',
	'core/core/platform/plugin/importExport/service/importSpec',
	'core/core/platform/plugin/progress/service/progressSpec',
	'core/core/platform/plugin/progress/service/DialogProgressSpec',
	'core/core/platform/plugin/log/service/logSpec',
	'core/core/platform/plugin/resource/service/resourceSpec',
	'core/core/platform/plugin/toolbar/service/toolbarSpec',
	'core/core/platform/plugin/logserver/service/logserverSpec',
	'core/core/platform/plugin/logserver/service/logserverIntegrationSpec',
	'core/core/platform/plugin/console/service/consoleSpec',
	'core/core/platform/plugin/selection/service/selectionSpec',
	'core/core/framework/service/serviceSpec',
	'core/core/framework/proxy/proxySpec',
	'core/core/framework/validations/unit/validationSpec',
	'core/core/framework/validations/serviceImpl/validationSpec',
	'core/core/core/debugHooksSpec',
	'core/core/ideplatform/backend/util/MetadataManagerSpec',
	'core/core/ideplatform/plugin/projectType/service/projectTypeSpec',
	'core/core/ideplatform/plugin/projectType/service/projectTypeNoConfigurationSpec',
	'core/core/ideplatform/plugin/projectType/service/projectTypeNoIdSpec',
	'core/core/ideplatform/plugin/projectType/service/projectTypeBnDSpec',
	'core/core/ideplatform/plugin/projectType/service/projectTypeDuplicateConfigurationSpec',
	'core/core/ideplatform/plugin/projectType/service/projectTypeConfigSpec'
];

window.customPaths = {
	'core': window.webappPath() + 'test-resources/sap/watt/sane-tests/core',
	'util': window.webappPath() + 'test-resources/sap/watt/sane-tests/util',
	'sinon': window.webappPath() + 'test-resources/sap/watt/sane-tests/libs/sinon-1.15.0'
};

//window.STF_RUNTIME_CHECKS = true;
//window.STF_RUNTIME_CHECKS_FILTER = /sap\/watt\/core/;