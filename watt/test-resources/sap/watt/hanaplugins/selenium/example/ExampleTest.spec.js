'use strict';

var driverFactory = require('../utilities/driverFactory'),
	webdriver = require('selenium-webdriver'),
	assert = require('selenium-webdriver/testing/assert'),
	webide = require('../pageobjects/WebIDE'),
	configuration = require('./Configuration.js'),
	TestConfiguration = require("../utilities/TestConfiguration"),
	HanaLoginPage = require('../pageobjects/HanaLoginPage');

var By = webdriver.By,
	until = webdriver.until;

describe('Sample', function () {
	'use strict';
	this.timeout(configuration.startupTimeout);
	var driver;

	beforeEach(function () {
		driver = driverFactory.createDriver();
	});

	afterEach(function () {
		return driver.saveScreenshot("Sample.png", this).then(function(){
			return driver.quit();
		});
	});

	it('Opens SAP Web IDE', function () {
		driver.get(TestConfiguration.getParam(TestConfiguration.KEYS.HOST));
		var hanaLoginPage = new HanaLoginPage(driver);
		hanaLoginPage.setUserName(TestConfiguration.getParam(TestConfiguration.KEYS.USER_NAME));
		hanaLoginPage.setPassword(TestConfiguration.getParam(TestConfiguration.KEYS.PASSWORD));
		hanaLoginPage.login();
		var webIDE = new webide(driver, By, until, configuration);
		console.log("Selecting workspace root element");
		return webIDE.selectRepositoryTreeRoot();
	});
});
