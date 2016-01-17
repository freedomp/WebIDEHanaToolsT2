'use strict';

var TestConfiguration = require("../../utilities/TestConfiguration");

module.exports = {
	url : TestConfiguration.getParam(TestConfiguration.KEYS.HOST),
	startupTimeout : 300000,
	defaultTimeout : 100000,
	templateName : 'Multi-Target Application Project',
	projectName : 'MTATest1',
	moduleName :'UI5TestModule'
};
