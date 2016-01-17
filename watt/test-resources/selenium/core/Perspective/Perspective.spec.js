'use strict';

var driverFactory = require('../../utilities/driverFactory'),
	test = require('selenium-webdriver/testing'),
	Git = require('../../pageobjects/Git'),
	webdriver = require('selenium-webdriver'),
	assert = require('selenium-webdriver/testing/assert'),
	webide = require('../../pageobjects/WebIDE'),
	configuration = require('../Configuration.js'),
	HcpLoginPage = require('../../pageobjects/HcpLoginPage'),
	Perspective = require('../../pageobjects/Perspective');


var By = webdriver.By,
	until = webdriver.until,
	promise = webdriver.promise;

describe('Perspective', function () {
	this.timeout(configuration.startupTimeout);
	var driver;
	var webIDE;
	var perspective;
	var git;

	beforeEach(function () {
		driver = driverFactory.createDriver();
		webIDE = new webide(driver, By, until, configuration);
		perspective = new Perspective(driver, By, until, configuration);
		git = new Git(driver, By, until, configuration);
	});

	afterEach(function () {
		return driver.sleep(5000).then(function() {
			return driver.quit();
		});
	});

	it('Console and gitPane is displayed', function () {

		return openWebIdeAndDevelopmentPerspective().then(function(){
			console.log("navigation Development Perspective");
			return openConsoleAndGitAndWaitToBeVisible();
		}).thenCatch(function(oError) {
			console.log(oError.message);
			return assert(false).isTrue();
		});
	});

	it.skip('Console and gitPane is displayed after returning from wellcome perspective', function () {
		var that = this;
		return openWebIdeAndDevelopmentPerspective().then(function(){
			console.log("navigation Development Perspective");
			return openConsoleAndGitAndWaitToBeVisible().then(function(){
				return webIDE.clickWelcomePerspective().then(function(){
					console.log("Welcome Perspective is opened");
					return webIDE.clickDevelopmentPerspective().then(function(){
						return promise.all([perspective.waitForConsoleVisible(), perspective.waitForGitPaneVisible()]).then(function(results) {
							console.log("Git pane and console are visible coming back from wellcome page");
							//  check that console and git pane are closed properly when closing it after coming back from wellcome prespective
							return promise.all([webIDE.closeWebIDEConsole(), git.toggleGitPane()]).then(function() {
								console.log("Git pane and console was closed");
								return promise.all([perspective.waitForCenterBottomHidden(), perspective.waitForRightPaneHidden()]).then(function() {
									console.log("Git pane and console are Hidden after close wes pressed");
								});
							});
						});
					});
				});
			});
		}).thenCatch(function(oError) {
				console.log(oError.message);
				console.log("Save screenshot");
				return driver.saveScreenshot("Console_and_gitPane_is_displayed_after_returning_from_wellcome_perspective.png", that).thenFinally(function(){
					return assert(false).isTrue();
				});
			});
	});

	it('Console and gitPane is not displayed after reset to default', function () {

		return openWebIdeAndDevelopmentPerspective().then(function(){
			console.log("navigation Development Perspective");
			return openConsoleAndGitAndWaitToBeVisible().then(function(){
				return webIDE.resetToDefault().then(function(){
					return promise.all([perspective.waitForCenterBottomHidden(), perspective.waitForRightPaneHidden()]).then(function() {
						console.log("Git pane and console are Hidden after reset to default");
					});
				});
			});
		}).thenCatch(function(oError) {
				console.log(oError.message);
				return assert(false).isTrue();
			});
	});

	it('maximized/normalized work well after back from preferences perspective', function () {
		var that = this;
		return openWebIdeAndDevelopmentPerspective().then(function(){
			console.log("navigation Development Perspective");
				return webIDE.maximizeActiveView().then(function(){
						console.log("Active area is maximized");
						return perspective.waitCenterTopMaximized().then(function(){
							return webIDE.resetActiveView().then(function(){
								console.log("Active view was reset");
								return perspective.waitForLeftPaneVisible().then(function(){
									return webIDE.clickUserpreferencePerspective().then(function(){
										console.log("navigation userprefernce Perspective");
										return webIDE.clickDevelopmentPerspective().then(function(){
											 console.log("navigation Development Perspective");
											 return webIDE.maximizeActiveView().then(function(){
												 console.log("Active area is maximized");
												 return perspective.waitCenterTopMaximized().then(function(){
													 return webIDE.resetActiveView().then(function(){
														 console.log("Active view was reset");
														 return perspective.waitForLeftPaneVisible();
													 });
												 });
											 });
										 });
									});
								});

							});
						});
				});
		}).thenCatch(function(oError) {
			console.log(oError.message);
			console.log("Save screenshot");
			return driver.saveScreenshot("maximized_normalized_work_well_after_back_from_preferences_perspective.png", that).thenFinally(function(){
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
	var openConsoleAndGitAndWaitToBeVisible = function() {
		return webIDE.openWebIDEConsole().then(function(){
			console.log("WebIde console is opened");
			return perspective.waitForConsoleVisible().then(function (isConsoleDisplayed) {
				console.log("Console is visible");
				return git.toggleGitPane().then(function () {
					console.log("Git pane was opened");
					return perspective.waitForGitPaneVisible().then(function (isGitPaneDisplayed) {
						console.log("Git pane is visible");
					});
				});
			});
		});
	};
});