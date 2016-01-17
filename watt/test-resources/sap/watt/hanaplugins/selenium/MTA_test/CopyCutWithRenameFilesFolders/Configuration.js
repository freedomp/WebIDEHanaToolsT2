'use strict';

var TestConfiguration = require("../../utilities/TestConfiguration");
var d = new Date();
var n = d.getTime();
module.exports = {
	url : TestConfiguration.getParam(TestConfiguration.KEYS.HOST),
	startupTimeout : 300000,
	defaultTimeout : 100000,
	projectName : 'AliceProject'+n,
        importedProjectZipPath: 'Files/AliceProject.zip'
};
