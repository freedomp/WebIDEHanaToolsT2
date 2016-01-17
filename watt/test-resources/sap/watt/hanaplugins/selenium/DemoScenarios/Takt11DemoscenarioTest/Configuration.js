'use strict';

var TestConfiguration = require("../../utilities/TestConfiguration");
var d = new Date();
var n = d.getTime();

module.exports = {
	url : TestConfiguration.getParam(TestConfiguration.KEYS.HOST),
	startupTimeout : 600000,
	defaultTimeout : 600000,
	localName : 'Local',
	templateName : 'Multi-Target Application Project',
	projectName : 'takt11demo'+n,
	moduleName :'UI5TestModule',
	jsApplication :'hello-world.js',
	appHeaderTitle  : 'Address Book'
};
