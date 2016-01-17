window.TEST_REGEXP = /sane-tests\/w5g\/mass\/.*Spec\.js$/i;

window.allTestFiles = [
	'w5g/mass/MassRandomViewsSpec'
];

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

