'use strict';

var TestConfiguration = require("../../utilities/TestConfiguration");
var d = new Date();
var n = d.getTime();

module.exports = {
	url : TestConfiguration.getParam(TestConfiguration.KEYS.HOST),
	startupTimeout : 800000,
	defaultTimeout : 800000,
	localName : 'Local',
	templateName : 'Multi-Target Application Project',
	cloneProjectName : 'restrictPushRepo',
	file1 : 'file1',
	file2 : 'file2',
	file3 : 'file3',
	repositoryURL : 'https://localhost:8443/r/restrictPushRepo.git',
	user :'admin',
	pass : 'admin',


};
