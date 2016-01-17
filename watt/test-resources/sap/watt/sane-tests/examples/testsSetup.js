window.TEST_REGEXP = /sane-tests\/examples\/.*Spec\.js$/i;
window.allTestFiles = [
	'examples/unit/unitTestExampleSpec',
	'examples/intellisence/intellisenceCommandSpec',
	'examples/welcomescreen/welcomescreenSpec',
	'examples/orion/fileSearchSpec',
	'examples/fails_with_message/failsWithMsgSpec'
];

window.customPaths = {
	'examples': window.webappPath() + 'test-resources/sap/watt/sane-tests/examples',
	'util': window.webappPath() + 'test-resources/sap/watt/sane-tests/util',
	'sinon': window.webappPath() + 'test-resources/sap/watt/sane-tests/libs/sinon-1.15.0'
};

window.STF_RUNTIME_CHECKS = true;
window.STF_RUNTIME_CHECKS_FILTER = /ideplatform\/plugin\/welcomescreen/;
