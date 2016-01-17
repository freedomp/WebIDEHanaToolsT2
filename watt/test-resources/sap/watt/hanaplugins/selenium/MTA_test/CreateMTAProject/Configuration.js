'use strict';

var TestConfiguration = require("../../utilities/TestConfiguration");
var d = new Date();
var n = d.getTime();

module.exports = {
	url : TestConfiguration.getParam(TestConfiguration.KEYS.HOST),
	startupTimeout : 800000,
	defaultTimeout : 500000,
	templateName : 'Multi-Target Application Project',
	projectName : 'MTATest'+n,
	hdbModuleName :'db',
	hdbModuleType : 'HDB Module',
	jsModuleType :'Node.js Module',
	nodejsModulName :'js',
	ui5ModulName :'web',
	hdbFile :'AddressBook.hdbcds',
	hdiconfig :".hdiconfig",
	hdinamespace : '.hdinamespace',
	addresbook : 'adressbook.js',
	addresbookManager :"adressbookManager.js",
	index : "index.js",
	testdata : "testdata.js",
	testdataCreator :"testdataCreator.js",
	testdataDestructor : "testdataDestructor.js",
	userinfo : "userinfo.js",
	userinfoQuery : "userinfoQuery.js",
	testDataSpec : "testDataSpec.js",
	userinfoSpec : "userinfoSpec.js",
	jasmine : "jasmine.json",
	helloworld : "hello-world.js",
	sapuicachebusterinfo : "sap-ui-cachebuster-info.json",
	mtaYaml : "mta.yaml",
	defaultservices :"default-services.json",
	packageJson : "package.json",
	treeController : "tree.controller.js",
	treeView : "tree.view.js",
	infoController : "info.controller.js",
	infoView : "info.view.js",
	webIndex : "index.html",
	webPackage : "package.json",
	xsapp : "xs-app.json",
	webCodenvyProject : "project.json",
	appHeaderTitle : "Address Book",
	localName : "Local"

};
