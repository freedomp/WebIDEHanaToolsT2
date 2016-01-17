window.TEST_REGEXP = /sane-tests\/builder\/.*Spec\.js$/i;

window.allTestFiles = [
	'builder/clientBuild/IntSAPUI5ClientBuildWorklistAppSpec',
	'builder/clientBuild/IntSAPUI5ClientBuildFlatSpec'

];

window.customPaths = {
	'builder': window.webappPath() + 'test-resources/sap/watt/sane-tests/builder',
	'util': window.webappPath() + 'test-resources/sap/watt/sane-tests/util',
	'sinon': window.webappPath() + 'test-resources/sap/watt/sane-tests/libs/sinon-1.15.0'
};