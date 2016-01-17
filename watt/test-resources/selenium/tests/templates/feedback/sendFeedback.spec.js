'use strict';

var webdriver = require('selenium-webdriver'),
	driverFactory = require('../../../utilities/driverFactory'),
	assert = require('selenium-webdriver/testing/assert'),
	configuration = require('./Configuration.js'),
	PageObjectFactory = require('../../../common/utilities/PageObjectFactory'),
	HcpLoginPage = require('../../../common/pageObjects/HcpLoginPage'),
	remote = require('selenium-webdriver/remote');

var By = webdriver.By,
	until = webdriver.until;

describe('Send Feedback', function () {
	'use strict';
	this.timeout(configuration.startupTimeout);
	var driver;

	beforeEach(function () {
		driver = driverFactory.createDriver();
		driver.setFileDetector(new remote.FileDetector());
	});

	afterEach(function () {
		return driver.sleep(5000).then(function() {
			return driver.quit();
		});
	});

	it('Send Feedback', function () {
		var that = this;
		driver.get(configuration.getParam(configuration.KEYS.HOST));

		var pageObjectFactory =  new PageObjectFactory(driver, By, until, configuration);
		var hcpLoginPage = new HcpLoginPage(driver, By, until, configuration, pageObjectFactory);

		return hcpLoginPage.doWaitAndLoginOrGoToWebIDE(configuration.getParam(configuration.KEYS.USER_NAME),configuration.getParam(configuration.KEYS.PASSWORD)).then(function(webIDE){
			return webIDE.clickFeedbackAndGoToFeedbackForm();
		}).then(function(feedbackFormPage){
			return feedbackFormPage.sendFeedback(3, "Feedback", "Multi paste", "Git");
		}).then(function(){
			console.log("Finished Successfully");
			return assert(true).isTrue();
		}).thenCatch(function(oError){
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Send Feedback.png", that).thenFinally(function(){
				throw oError;
			});
		});
	});
});
