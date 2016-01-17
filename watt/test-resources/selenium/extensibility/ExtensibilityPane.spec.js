'use strict';

var path = require('path');

var webdriver = require('selenium-webdriver'),
	driverFactory = require('../utilities/driverFactory'),
	webide = require('../pageobjects/WebIDE'),
	utils = require('../pageobjects/Utils'),
	extensionprojectwizard = require('../pageobjects/ExtensionProjectWizard'),
	extPane = require('../pageobjects/ExtensibilityPane'),
	configuration = require('./Configuration.js'),
	chai = require('chai'),
	expect = chai.expect,
	HcpLoginPage = require('../pageobjects/HcpLoginPage');

var By = webdriver.By,
	until = webdriver.until;

describe('Extensibility_Pane', function () {
	this.timeout(configuration.startupTimeout);
	var driver, webIDE, extensionProjectWizard, extensibilityPane;
	var sAppName = "MM_PO_APV";
	var that = this;

	beforeEach(function () {
		driver = driverFactory.createDriver();
		webIDE = new webide(driver, By, until, configuration);
		extensionProjectWizard = new extensionprojectwizard(driver, By, until, configuration);
		extensibilityPane = new extPane(driver, By, until, configuration);

		driver.get(configuration.getParam(configuration.KEYS.HOST));

		var hcpLoginPage = new HcpLoginPage(driver);
		hcpLoginPage.setUserName(configuration.getParam(configuration.KEYS.USER_NAME));
		hcpLoginPage.setPassword(configuration.getParam(configuration.KEYS.PASSWORD));
		hcpLoginPage.login();

		// Maximize the window - we need the 'down arrow' mark which switches to extensibility mode to be visible - otherwise,
		// it can't be clicked
		driver.manage().window().maximize();
		console.log("Before hook: Logged in");
		return webIDE.loadAndOpenDevelopmentPerspective().then(function () {
			console.log("About to delete prev ext project (if exist)");
			return utils.deleteProjectFromWorkspace(driver, sAppName + "Extension", true).then(function () { // Delete if exist
				console.log("Before hook: Opened development perspective");
				//Open the console since we will use it's output to decide when the extension project is ready
				return webIDE.openWebIDEConsole().then(function () {
					return webIDE.clearWebIDEConsole().then(function () {
						// Create an extension project
						console.log("About to create the extension project");
						return extensionProjectWizard.extendProjectFromBSP(sAppName);
					});
				});
			});
		}).thenCatch(function(oError) {
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Extensibility_Pane_before.png", that).thenFinally(function(){
				expect(true).to.equal(false);
			});
		});
	});

	afterEach(function () {
		return utils.deleteProjectFromWorkspace(driver, sAppName + "Extension").thenFinally(function() {
			return driver.sleep(5000).then(function() {
				return driver.quit();
			});
		});
	});

	it('Add hide control extension', function () {
		console.log("Start: add hide control extension");
		var that = this;
		return extensibilityPane.openExtPaneWithMock().then(function () {
			return extensibilityPane.waitForAppToLoad().then(function () {
				return extensibilityPane.skipOptionalErrorMessage();
			}).then(function () {
				return extensibilityPane.extensibilityMode();
			}).then(function () {
				var oSelector = {type: 'xpath', path: '//label[contains(text(), "Purchase Orders (")]'};
				return extensibilityPane.hideControlBySelector(oSelector, "refresh");
			}).then(function () {
				return extensibilityPane.closeExtPane();
			});
		}).thenCatch(function(oError) {
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Add_hide_control_extension.png", that).thenFinally(function(){
				expect(true).to.equal(false);
			});
		});
	});

	it('Add extend view extension', function () {
		var that = this;
		console.log("About to open extensibility pane");
		return extensibilityPane.openExtPane().then(function () {
			console.log("Waiting for app to load");
			return extensibilityPane.waitForAppToLoad().then(function () {
				console.log("Extending view");
				var aNodesTitleAndText = [{title: "sap.m:page", text: "WIDetail"}, {title: "sap.m:objectheader", text: "Header"}];
				return extensibilityPane.extendView("S3", "extHeaderInfo", "sap.ui.core:extensionpoint", aNodesTitleAndText, "Open Extension Code").then(function () {
					console.log("view was extended");
					var fileLocator = webIDE.getFileLocator("S3_extHeaderInfoCustom.fragment.xml");
					return driver.myWait(fileLocator, configuration.defaultTimeout);
				});
			});
		}).thenCatch(function(oError) {
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Add_extend_view_extension.png", that).thenFinally(function(){
				expect(true).to.equal(false);
			});
		});
	});

	it('Check extension points filter', function () {
		var that = this;
		console.log("About to open extensibility pane");
		return extensibilityPane.openExtPane().then(function () {
			console.log("Waiting for app to load");
			return extensibilityPane.waitForAppToLoad().then(function () {
				console.log("Extending view");
				var aNodesTitleAndText = [{title: "sap.m:page", text: "WIDetail"}, {title: "sap.m:objectheader", text: "Header"}];
				return extensibilityPane.selectNodeInOutline("S3", "extHeaderInfo", "sap.ui.core:extensionpoint", aNodesTitleAndText, "Open Extension Code").then(function () {
					console.log("view was selected");
					return extensibilityPane.changeFilter("showExtensionPoints").then(function () {
						return extensibilityPane.getSelectedElement().then(function (element) {
							if(element){
								//check what is selected.
								return element.findElement(By.xpath('span[text()="extHeaderInfo"]')).then(function(){
									console.log("found the correct element");
								}, function(oError) {
									console.log("no selection. error");
									expect(true).to.equal(false);
								});
							}
							else{
								//there should be a selection on tree.
								expect(true).to.equal(false);
							}
						});
					});
				});
			}).then(function () {
				return extensibilityPane.closeExtPane();
			});
		}).thenCatch(function(oError) {
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Check_extension_points_filter.png", that).thenFinally(function(){
				expect(true).to.equal(false);
			});
		});
	});
});