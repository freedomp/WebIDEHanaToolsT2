'use strict';

var TestConfiguration = require("../../utilities/TestConfiguration");
var d = new Date();
var n = d.getTime();
module.exports = {
	url : TestConfiguration.getParam(TestConfiguration.KEYS.HOST),
	startupTimeout : 800000,
	defaultTimeout : 80000,
	templateName : 'Multi-Target Application Project',
	projectName : 'takt7demo'+n,
    targetProjectName : 'targetProj'+n,
    moduleName :'UI5TestModule',
	jsApplication :'hello-world.js',
	appHeaderTitle  : 'Address Book',
	hdbModuleName  : 'db',
	ui5ModulName :'web'
};
