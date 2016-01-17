/**
 * Created by I300494 on 20/07/2015.
 */
'use strict';

var path = require('path');

var webdriver = require('selenium-webdriver'),
	test = require('selenium-webdriver/testing'),
	remote = require('selenium-webdriver/remote'),
	assert = require('selenium-webdriver/testing/assert'),
	webide = require('../pageobjects/WebIDE'),
	utils = require('../pageobjects/Utils'),
	extensionprojectwizard = require('../pageobjects/ExtensionProjectWizard'),
	Q = require('q'),
	_ = require('lodash'),
	chai = require('chai'),
	expect = chai.expect,
	driverFactory = require('../utilities/driverFactory'),
	HcpLoginPage = require('../pageobjects/HcpLoginPage'),
	configuration = require("./Configuration");

var By = webdriver.By,
	until = webdriver.until;

var mappings = {
	internalSampleApplicationProjectJson :  {type : 'css' , path :'.sapWattRepositoryBrowser .sapUiTreeList .sapUiTreeNode[title="Local"]  ~ ul .wattTreeFolder[title="nw.epm.refapps.shop"]  ~ ul .wattTreeFile[title=".project.json"]'},
	extensionProjectManifestInEditor : {type: 'css', path: 'a[title="/nw.epm.refapps.shopExtension/manifest.json"]'}
};

describe('Create Extension Project ', function () {
	this.timeout(configuration.startupTimeout);
	var driver;
	var webIDE;
	var extensionProjectWizard;
	var applicationName = "blabla";

	before(function (done) {
		driver = driverFactory.createDriver();
		// We need a remote file detector since we use file upload, and when running in jenkins only remote is
		// supported (probably since we use a remote Selenium server)
		driver.setFileDetector(new remote.FileDetector());
		webIDE = new webide(driver, By, until, configuration);
		extensionProjectWizard = new extensionprojectwizard(driver, By, until, configuration);
		driver.get(configuration.getParam(configuration.KEYS.HOST));
		var hcpLoginPage = new HcpLoginPage(driver);
		hcpLoginPage.setUserName(configuration.getParam(configuration.KEYS.USER_NAME));
		hcpLoginPage.setPassword(configuration.getParam(configuration.KEYS.PASSWORD));
		hcpLoginPage.login();

		return webIDE.loadAndOpenDevelopmentPerspective().then(function () {
			return utils.deleteProjectFromWorkspace(driver, applicationName, true).then(function () { // Delete if exist
				return utils.deleteProjectFromWorkspace(driver, applicationName + "Extension", true).then(function () { // Delete if exist
					done();
				});
			});
		});
	});

	afterEach(function () {
		return driver.quit();
	});

	it('from workspace for the default master detail template succeeds', function (done) {

		webIDE.importZip(path.resolve(__dirname, 'zip/' + applicationName + '.zip')).then(function(){
			console.log("already imported: " + applicationName);
			return extensionProjectWizard.extendProjectFromWorkspace(applicationName);
		}).then(function() {
			console.log("About to run extended application");
			return webIDE.runApplicationAsWebApplicationWithPathToRunnable("Local/" + applicationName + "Extension/webapp/index.html");
		}).then(function() {
			return driver.sleep(1*1000);
		}).then(function() {
			console.log("About to switch the driver to the extended application context");
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
			//Here we are in the context of the new tab
			//If the application has started then there is a view that has the class "sapUiView"
			var application = utils.toLocator({type: 'css', path: ".sapUiView"});
			//The application may take a long time until it loads that why we have a big timeout
			return driver.wait(until.elementLocated(application), 60*1000);
		}).then(function() {
			return driver.close(); // Close the preview tab (the one we see at the moment)
		}).then(function() {
			//Here we are in the context of the new tab
			//Go back to the web-ide tab
			return driver.getAllWindowHandles().then(function(aHandles) {
				expect(aHandles).to.have.length(1);
				var sWebIdeHandle = aHandles[0];
				return driver.switchTo().window(sWebIdeHandle);
			});
		}).then(function() {
			return webIDE.deleteProjectByName(applicationName);
		}).then(function() {
			//The delete function doesn't validate that the delete was done before it returns.. //TODO correct that
			return driver.sleep(1*1000);
		}).then(function() {
			return webIDE.deleteProjectByName(applicationName + "Extension");
		}).then(function() {
			done();
		}).thenCatch(function(oError) {
			console.log("Error: " + oError);
			expect(true).to.equal(false);
			done();
		});
	});
});

