'use strict';

var driverFactory = require('../utilities/driverFactory'),
	webdriver = require('selenium-webdriver'),
	assert = require('selenium-webdriver/testing/assert'),
	webide = require('../pageobjects/WebIDE'),
	configuration = require('./Configuration.js'),
	HcpLoginPage = require('../pageobjects/HcpLoginPage');

var By = webdriver.By,
	until = webdriver.until;

describe('Sample_Selenium_test', function () {
	this.timeout(configuration.startupTimeout);
	var driver;

	beforeEach(function () {
		driver = driverFactory.createDriver();
	});

	afterEach(function() {
		return driver.sleep(5000).then(function() {
			return driver.quit();
		});
	});

	it('Opens SAP Web IDE', function () {
		driver.get(configuration.getParam(configuration.KEYS.HOST));

		var hcpLoginPage = new HcpLoginPage(driver);
		hcpLoginPage.setUserName(configuration.getParam(configuration.KEYS.USER_NAME));
		hcpLoginPage.setPassword(configuration.getParam(configuration.KEYS.PASSWORD));
		hcpLoginPage.login();

		var webIDE = new webide(driver, By, until, configuration);
		return webIDE.navigateToWelcomePerspectiveViaView().then(function() {
			console.log("Successfully navigated to welcome screen perspective.");
			assert(true).isTrue();
		}).thenCatch(function(oError) {
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Sample_Selenium_test.png", that).thenFinally(function(){
				return assert(false).isTrue();
			});
		});
	});
});
