'use strict';

var driverFactory = require('../../utilities/driverFactory'),
	test = require('selenium-webdriver/testing'),
	Logout = require('../../pageobjects/Logout'),
	webdriver = require('selenium-webdriver'),
	assert = require('selenium-webdriver/testing/assert'),
	webide = require('../../pageobjects/WebIDE'),
	configuration = require('../Configuration.js'),
	HcpLoginPage = require('../../pageobjects/HcpLoginPage');

var By = webdriver.By,
	until = webdriver.until,
	promise = webdriver.promise;

describe('Logout', function () {
	this.timeout(configuration.startupTimeout);
	var driver;
	var logout;
	var webIDE;

	beforeEach(function () {
		driver = driverFactory.createDriver();
		webIDE = new webide(driver, By, until, configuration);
		logout = new Logout(driver, By, until, configuration);
	});

	afterEach(function () {
		return driver.sleep(5000).then(function() {
			return driver.quit();
		});
	});

	it('Logout page is displayed', function () {
		var that = this;
		return openWebIdeAndDevelopmentPerspective().then(function(){
			console.log("navigation Development Perspective");
			return logout.pressButton().then(function(){
				return promise.all([logout.getGoodbyeText(), logout.isImageDisplayed()]).then(function(results) {
					assert(results[0]).equalTo("Goodbye","Goodbye header is not displayed");
					assert(results[1]).isTrue();
				});
			});
		}).thenCatch(function(oError) {
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Logout_page_is_displayed.png", that).thenFinally(function(){
				return assert(false).isTrue();
			});
		});
	});

	it('Log back in from logout page', function () {
		var that = this;
		return openWebIdeAndDevelopmentPerspective().then(function(){
			console.log("navigation Development Perspective");
			return logout.pressButton().then(function(){
				console.log("logout button was pressed");
				return logout.logBackToWebIde().then(function(){
					console.log("log Back To WebIde link was pressed");
					driver.get(configuration.getParam(configuration.KEYS.HOST));
					hcpLogin(); // The test Which run on the build is without single sign on and therefor needs this login
					return webIDE.isDevelopmentButtonDisplayed().then(function(isDevelopmentButtonDisplayed){
						// verify that WebIde page is displayed
						console.log("verify that WebIde page is displayed");
						assert(isDevelopmentButtonDisplayed).isTrue();
					});
				});
			});
		}).thenCatch(function(oError) {
			console.log("thenCatch for test -  Log back in from logout page");
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Log_back_in_from_logout_page.png", that).thenFinally(function(){
				return assert(false).isTrue();
			});
		});
	});

	var openWebIdeAndDevelopmentPerspective = function(){
		driver.get(configuration.getParam(configuration.KEYS.HOST));
		hcpLogin();
		return webIDE.navigateToDevelopmentPerspectiveViaView();
	};

	var hcpLogin = function() {
		var hcpLoginPage = new HcpLoginPage(driver);
		hcpLoginPage.setUserName(configuration.getParam(configuration.KEYS.USER_NAME));
		hcpLoginPage.setPassword(configuration.getParam(configuration.KEYS.PASSWORD));
		hcpLoginPage.login();
	};
});
