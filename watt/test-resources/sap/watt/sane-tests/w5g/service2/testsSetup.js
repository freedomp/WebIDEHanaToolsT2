window.TEST_REGEXP = /sane-tests\/w5g\/service2\/.*Spec\.js$/i;

window.allTestFiles = window.allTestFiles || [];
window.allTestFiles = window.allTestFiles.concat([
	'w5g/service2/DataBindingDisplaySpec',
	'w5g/service2/DataBindingSerializationSpec',
	'w5g/service2/DataBindingSpec',
	'w5g/service2/EditorGeneralSpec',
	'w5g/service2/EventsSpec',
	'w5g/service2/OpenCloseSpec',
	'w5g/service2/OutlineActivitiesSpec',
	'w5g/service2/OutlineSelectionSpec',
	'w5g/service2/OutlineWithEditorSpec'
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

