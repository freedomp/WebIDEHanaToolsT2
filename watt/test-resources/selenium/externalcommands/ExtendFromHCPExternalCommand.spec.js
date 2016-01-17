/**
 * Created by I300494 on 14/07/2015.
 */
'use strict';
var webdriver = require('selenium-webdriver'),
	webide = require('../pageobjects/WebIDE'),
	utils = require('../pageobjects/Utils'),
	configuration = require('./Configuration.js'),
	driverFactory = require('../utilities/driverFactory'),
	HcpLoginPage = require('../pageobjects/HcpLoginPage'),
	chai = require('chai'),
	expect = chai.expect;

var By = webdriver.By,
	until = webdriver.until;

var mappings = {
	loginToHCPDialog : {type:'xpath', path: '//span[text()="Login to SAP HANA Cloud Platform"]'},
	passwordInputField : {type: 'xpath', path: '//input[@title="Enter password"]'},
	loginToHCPButtonInDialogEnabled : {type: 'xpath', path: '//button[text()="Login" and @aria-disabled="false"]'},
	extensionProjectDialog : {type: 'xpath', path: '//span[text()="Extension Project Name"]'},
	extensionProjectDialogOKButtonEnabled : {type: 'xpath', path: '//button[text()="OK" and @aria-disabled="false"]'},
	/**
	 * The label element is clickable, the input element is not, therefore we select the label of the checkbox.
	 */
	importOriginalApplicationCheckBox : {type: 'xpath', path: '//span/label[text()="Import original application" and ../input[@type="CheckBox"]]'}
};

/**
 * This test suite assumes that an application with the name: "md2" is deployed to HCP
 */ 
describe('Extend project from external command', function () {
	this.timeout(configuration.startupTimeout);
	var driver;
	var webIDE;
	var projectName = "md2";
	var extensionProjectName = projectName + "Extension";

	beforeEach(function () {
		driver = driverFactory.createDriver();
		webIDE = new webide(driver, By, until, configuration);
		var that = this;
		console.log("Load Web-IDE");
		return driver.get(configuration.getParam(configuration.url)).then(function() {
			console.log("Login");
			var hcpLoginPage = new HcpLoginPage(driver);
			hcpLoginPage.setUserName(configuration.getParam(configuration.KEYS.USER_NAME));
			hcpLoginPage.setPassword(configuration.getParam(configuration.KEYS.PASSWORD));
			return hcpLoginPage.login();
		}).then(function() {
			console.log("Click the development perspective");
			return webIDE.clickDevelopmentPerspective();
		}).then(function() {
			console.log('Delete the parent project (if exist)');
			return utils.deleteProjectFromWorkspace(driver, projectName, true); // Delete if exist
		}).then(function() {
			console.log('Delete the extension project (if exist)');
			return utils.deleteProjectFromWorkspace(driver, extensionProjectName, true); // Delete if exist
		}).then(function() {			console.log('Then we open the console to know when the external "extendHANACloudProject" command finishes');
			return webIDE.openWebIDEConsole();
		}).then(function() {
			console.log("Then we the external command. This doesn't load web-ide again, it just executes the external command.");
			return driver.get(configuration.getParam(configuration.url) + '#{"extendHANACloudProject": {"parentProjectName":"md2","createEvenIfExists":false, "openExtPane": false}}');
		}).then(function() {
			console.log("Wait until the login to HCP dialog appears...");
			return driver.myWait(
				utils.toLocator(mappings.loginToHCPDialog),
				configuration.startupTimeout
			);
		}).then(function() {
			console.log("Setting password");
			return driver.myWaitAndSendKeys(
				configuration.getParam(configuration.KEYS.PASSWORD),
				utils.toLocator(mappings.passwordInputField),
				configuration.defaultTimeout
			);
		}).then(function() {
			console.log("Clicking login button");
			return driver.myWaitAndClick(
				utils.toLocator(mappings.loginToHCPButtonInDialogEnabled),
				configuration.defaultTimeout
			);
		}).then(function() {
			console.log("Waiting for the extension project dialog");
			return driver.wait(
				until.elementLocated(utils.toLocator(mappings.extensionProjectDialog)),
				configuration.defaultTimeout
			);
		}).thenCatch(function(oError) {
			console.log(oError);
			console.log("Saving screenshot");
			return driver.saveScreenshot("External_command_beforeEach.png", that).thenFinally(function(){
				expect(true).to.equal(false);
			});
		});
	});

	afterEach(function () {
		return driver.quit();
	});

	it('can create an extension project', function () {
		var that = this;
		console.log("waiting for the extension project dialog of the external command");
		return driver.myWaitAndClick(utils.toLocator(mappings.extensionProjectDialogOKButtonEnabled), configuration.defaultTimeout).then(function() {
			console.log('Wait until you see the string: "(External Command) Command extendHANACloudProject has finished executing" in the console');
			var consoleOutputLocator = utils.toLocator(webIDE.mappings.consoleInfoOutputContains, ["(External Command) Command extendHANACloudProject has finished executing"]);
			//The creation of the extension project may take time and therefore we have a relatively big timeout
			return driver.myWait(consoleOutputLocator , 30 * 1000);
		}).then(function () {
			console.log("Calling deleteProjectByName on " + extensionProjectName);
			return webIDE.deleteProjectByName(extensionProjectName);
		}).thenCatch(function(oError) {
			console.log(oError);
			console.log("Saving screenshot");
			return driver.saveScreenshot("External_command_create_ext_proj.png", that).thenFinally(function(){
				expect(true).to.equal(false);
			});
		});
	});

	it('can create an extension project and import its parent to Web-IDE', function () {
		var that = this;
		console.log("Check the import original application checkbox");
		return driver.myWaitAndClick(utils.toLocator(mappings.importOriginalApplicationCheckBox), configuration.defaultTimeout).then(function() {
			console.log("Click OK in the import dialog");
			return driver.myWaitAndClick(utils.toLocator(mappings.extensionProjectDialogOKButtonEnabled),configuration.defaultTimeout);
		}).then(function() {
			console.log('Wait until you see the string: "(External Command) Command extendHANACloudProject has finished executing" in the console');
			var consoleOutputLocator = utils.toLocator(webIDE.mappings.consoleInfoOutputContains, ["(External Command) Command extendHANACloudProject has finished executing"]);
			//The creation of the extension project may take time and therefore we have a relatively big timeout
			return driver.myWait(consoleOutputLocator , 30 * 1000);
		}).then(function() {
			console.log("Deleting extension project: " + extensionProjectName);
			return webIDE.deleteProjectByName(extensionProjectName);
		}).then(function() {
			console.log("Deleting extension project: " + extensionProjectName + " finished");
			console.log("Deleting parent project: " + projectName);
			return webIDE.deleteProjectByName(projectName);
		}).thenCatch(function(oError) {
			console.log(oError);
			console.log("Saving screenshot");
			return driver.saveScreenshot("External_command_create_and_import.png", that).thenFinally(function(){
				expect(true).to.equal(false);
			});
		});
	});

});
