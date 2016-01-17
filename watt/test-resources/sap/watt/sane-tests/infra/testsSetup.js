window.TEST_REGEXP = /sane-tests\/infra\/.*Spec\.js$/i;

window.allTestFiles = [
	//Search
	'infra/search/fileSearchSpec', //ignoreLocalInstallation= true
	//Git
	'infra/git/gitClientCloneSpec',
	'infra/git/gitMergeSpec',
	'infra/git/gitIgnoreSpec',
	'infra/git/gitClientInitSpec',
	'infra/git/gitHubCloneSpec',
	'infra/git/gitByPassGerritSpec'
	// Reuse Library
	//'infra/reuseLibrary/AddReferenceSpec'

];

window.customPaths = {
	'infra': window.webappPath() + 'test-resources/sap/watt/sane-tests/infra',
	'util': window.webappPath() + 'test-resources/sap/watt/sane-tests/util',
	'sinon': window.webappPath() + 'test-resources/sap/watt/sane-tests/libs/sinon-1.15.0'
};