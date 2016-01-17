/**
 * Created by I300494 on 14/07/2015.
 */
'use strict';

var path = require('path');

var webdriver = require('selenium-webdriver'),
	webide = require('../pageobjects/WebIDE'),
	wysiwyg = require('../pageobjects/Wysiwyg'),
	_Import = require('../pageobjects/Import'),
	utils = require('../pageobjects/Utils'),
	configuration = require('./Configuration'),
	_ = require('lodash'),
	chai = require('chai'),
	expect = chai.expect,
	driverFactory = require('../utilities/driverFactory'),
	HcpLoginPage = require('../pageobjects/HcpLoginPage');

var By = webdriver.By,
	until = webdriver.until;

var mappings = {

};

describe('Import application', function () {
	this.timeout(configuration.startupTimeout);
	var driver;
	var webIDE;
	var _import;//Added lodash in the beginning since import is a reserved word (I think only in strict mode)

	beforeEach(function () {
		driver = driverFactory.createDriver();
		webIDE = new webide(driver, By, until, configuration);
		_import = new _Import(driver, By, until, configuration);
		return driver.get(configuration.getParam(configuration.KEYS.HOST)).then(function() {
			var hcpLoginPage = new HcpLoginPage(driver);
			hcpLoginPage.setUserName(configuration.getParam(configuration.KEYS.USER_NAME));
			hcpLoginPage.setPassword(configuration.getParam(configuration.KEYS.PASSWORD));
			hcpLoginPage.login();
			return webIDE.loadAndOpenDevelopmentPerspective().then(function() {
				return utils.deleteProjectFromWorkspace(driver, "MM_PO_APV", true); // Delete if exist
			});
		});
	});

	afterEach(function () {
		return driver.quit();
	});

	it('from BSP succeeds', function () {
		return _import.importFromBSP("ABAP Backend System - for testing!", "MM_PO_APV").thenCatch(function(oError) {
			console.log("Error: " + oError);
			expect(true).to.equal(false);
		});
	});

	it('from BSP succeeds and the imported application loads in preview', function () {
		return _import.importFromBSP("ABAP Backend System - for testing!", "MM_PO_APV").then(function() {
			return webIDE.runAsSAPFioriComponentOnSandbox("Local/MM_PO_APV/Component.js");
		}).then(function() {
			return driver.sleep(1*1000);
		}).then(function() {
			return driver.getWindowHandle().then(function(sCurrentWindowHandle) {
				return driver.getAllWindowHandles().then(function(aHandles) {
					expect(aHandles).to.have.length(2);
					var handles = _.filter(aHandles, function(sHandle) {
						return sHandle !== sCurrentWindowHandle;
					});

					//Assuming we only have two open tabs
					expect(handles).to.have.length(1);
					var sPreviewHandle = handles[0];
					return driver.switchTo().window(sPreviewHandle);
				});
			});
		}).then(function() {
			var mainListItem = utils.toLocator({type: 'css', path: '[id*="MAIN_LIST_ITEM"]'});
			return driver.wait(until.elementLocated(mainListItem), 60 * 1000);
		}).then(function() {
			//Go back to the web-ide tab
			return driver.getAllWindowHandles().then(function(aHandles) {
				// Close the preview tab (the one we see at the moment)
				return driver.close().then(function() {
					var sWebIdeHandle = aHandles[0];
					return driver.switchTo().window(sWebIdeHandle);
				});
			});
		}).thenCatch(function(oError) {
			console.log("Error: " + oError);
			expect(true).to.equal(false);
		});
	});
});