'use strict';

var TestConfiguration = require("../utilities/TestConfiguration");

module.exports = {
	url : TestConfiguration.getParam(TestConfiguration.KEYS.HOST),
	startupTimeout : 300000,
	defaultTimeout : 10000
};
