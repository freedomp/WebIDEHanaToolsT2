window.TEST_REGEXP = /sane-tests\/w5g\/service1\/.*Spec\.js$/i;

window.allTestFiles = window.allTestFiles || [];
window.allTestFiles = window.allTestFiles.concat([
	'w5g/service1/CutCopyPasteAddSpec',
	'w5g/service1/ContentWithW5gSpec',
	'w5g/service1/PropertiesSpec',
	'w5g/service1/QuickStartTemplateServiceSpec',
	'w5g/service1/SerializationIntegrationSpec',
	'w5g/service1/UtilsServicesSpec',
	'w5g/service1/AssociationsSpec'
]);

window.customPaths = {
	'w5g': window.webappPath() + 'test-resources/sap/watt/sane-tests/w5g'
};

window.W5G_LIBS_PREFIX = window.isRunningInKarmaWebServer() ? '/base' : '';

// uncomment to enable runtime type checks
window.STF_RUNTIME_CHECKS = true;
window.STF_RUNTIME_CHECKS_FILTER = /plugin\/ui5wysiwygeditor|sane-tests\/w5g/;

(function(){
	'use strict';
	window.jQuery.sap.registerModulePath('sap.watt', window.webappPath() + 'resources/sap/watt');
})();

