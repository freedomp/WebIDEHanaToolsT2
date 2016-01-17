'use strict';

var TestConfiguration = require("./TestConfiguration"),
	webdriver = require('selenium-webdriver');

module.exports = {

	createDriver: function () {
		var capabilities = webdriver.Capabilities.chrome();
		var driver = new webdriver.Builder().withCapabilities(capabilities).
			usingServer(TestConfiguration.getParam(TestConfiguration.KEYS.SELENIUM_HOST)).build();
		return driver;
	}
};
