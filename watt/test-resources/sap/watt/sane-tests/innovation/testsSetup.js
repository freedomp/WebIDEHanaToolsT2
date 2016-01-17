window.TEST_REGEXP = /sane-tests\/template\/voter2\/.*Spec\.js$/i;
window.allTestFiles = [
	'innovation/plugin/reportABug/ReportABugSpec',
];

window.customPaths = {
	'innovation': window.webappPath() + 'test-resources/sap/watt/sane-tests/innovation',
	'sinon': window.webappPath() + 'test-resources/sap/watt/sane-tests/libs/sinon-1.15.0'
};

window.TMPL_LIBS_PREFIX = window.isRunningInKarmaWebServer() ? '/base' : '';

//window.STF_RUNTIME_CHECKS = true;
//window.STF_RUNTIME_CHECKS_FILTER = /ideplatform\/plugin\/(template|tmplintellisence|generationwizard)/;