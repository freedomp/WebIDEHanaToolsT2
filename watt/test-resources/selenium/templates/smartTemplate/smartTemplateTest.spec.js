'use strict';

var path = require('path');

var webdriver = require('selenium-webdriver'),
	assert = require('selenium-webdriver/testing/assert'),
	remote = require('selenium-webdriver/remote'),
	webide = require('../../pageobjects/WebIDE'),
	projectwizard = require('../../pageobjects/ProjectWizard'),
	driverFactory = require('../../utilities/driverFactory'),
	configuration = require('./Configuration.js'),
	utils = require('../../pageobjects/Utils'),
	HcpLoginPage = require('../../pageobjects/HcpLoginPage'),
	RunConfiguration = require('../../pageobjects/RunConfiguration'),
	Run = require('../../pageobjects/Run');

var By = webdriver.By,
	until = webdriver.until;

var mapping = {
	goButton : {type : 'css' , path : 'button[class="sapMBarChild sapMBtn sapMBtnBase sapMBtnInverted"]'},
	firstTableFirstRow : {type : 'css' , path : '#__item0-__clone0'},
	secondTableFirstRow : {type : 'css' , path : '[class*="sapMListModeNone"] > tbody > [class*="sapMLIB"]:first-of-type'}
};

describe('Generate Smart Template', function () {
	'use strict';
	this.timeout(configuration.startupTimeout);
	var driver;
	var webIDE;
	var runConfig;
	var run;
	var currentProjectName = configuration.projectName + Date.now();

	beforeEach(function () {
		driver = driverFactory.createDriver();
		driver.setFileDetector(new remote.FileDetector);
		webIDE = new webide(driver, By, until, configuration);
		run = new Run(driver, By, until, configuration);
	});

	afterEach(function () {
		return utils.deleteProjectFromWorkspace(driver, currentProjectName).thenFinally(function(){
			return driver.sleep(5000).then(function() {
				return driver.quit();
			});
		});
	});


	it(
		'Generate Smart Template application',
		function () {
			var that = this;
			driver.get(configuration.getParam(configuration.KEYS.HOST));
			var hcpLoginPage = new HcpLoginPage(driver);
			hcpLoginPage.setUserName(configuration.getParam(configuration.KEYS.USER_NAME));
			hcpLoginPage.setPassword(configuration.getParam(configuration.KEYS.PASSWORD));
			hcpLoginPage.login();

			runConfig = new RunConfiguration(driver, By, until, configuration);
			var projectWizard = new projectwizard(driver, By, until, configuration);

			return webIDE.clickWelcomePerspective().then(function(){
				console.log("openFromWelcomePerspective");
				return projectWizard.openFromWelcomePerspective();
			}).then(function(){
				console.log("selectTemplate");
				return projectWizard.selectTemplate(configuration.templateName);
			}).then(function(){
				console.log("next");
				return projectWizard.next();
			}).then(function(){
				console.log("enterProjectName");
				return projectWizard.enterProjectName(currentProjectName);
			}).then(function(){
				console.log("enterBasicInfo");
				return projectWizard.enterBasicInfo("smart title", 1);
			}).then(function(){
				console.log("enterBasicInfo");
				return projectWizard.enterBasicInfo("smart.namespace", 2);
			}).then(function(){
				console.log("enterBasicInfo");
				return projectWizard.enterBasicInfo("ab", 4);
			}).then(function(){
				console.log("next");
				return projectWizard.next();
			}).then(function(){
				console.log("selectServiceFromFileSystem");
				return projectWizard.selectServiceFromFileSystem(path.resolve(__dirname, 'metadata.xml'));
			}).then(function(){
				console.log("next");
				return projectWizard.next();
			}).then(function(){
				console.log("selectAnnotationFromFileSystem");
				return projectWizard.selectAnnotationFromFileSystem(path.resolve(__dirname, 'annotations.xml'));
			}).then(function(){
				console.log("next");
				return projectWizard.next();
			}).then(function(){
				console.log("waitForTemplateCustomizationStep");
				return projectWizard.waitForTemplateCustomizationStep();
			}).then(function(){
				console.log("enterTemplateCustomizationText");
				return projectWizard.enterTemplateCustomizationText("SEPMRA_I_ProductWithDraft", 0, "Addressable OData collection");
			}).then(function(){
				console.log("enterTemplateCustomizationText");
				return projectWizard.enterTemplateCustomizationText("to_ProductText", 0, "OData navigation attribute to a collection of items");
			}).then(function(){
				console.log("next");
				return projectWizard.next();
			}).then(function(){
				console.log("finishAndWait");
				return projectWizard.finishAndWait();
			}).then(function(){
				console.log("runAsUnitTest");
				return run.runAsUnitTest(currentProjectName + "/webapp/test" ,"testFLPService.html");
			}).then(function(){
				console.log("Switch to preview window");
				return runConfig.switchToWindow(false);
			}).then(function(){
				console.log("myWaitAndClick goButton");
				return driver.myWaitAndClick(utils.toLocator(mapping.goButton), configuration.longTimeout);
			}).then(function() {
				console.log("myWaitAndClick firstTableFirstRow");
				return driver.myWaitAndClick(utils.toLocator(mapping.firstTableFirstRow), configuration.defaultTimeout);
			}).then(function() {
				console.log("sleep");
				return driver.sleep(5000);
			}).then(function() {
				console.log("myWaitAndClick secondTableFirstRow");
				return driver.myWaitAndClick(utils.toLocator(mapping.secondTableFirstRow), configuration.defaultTimeout);
			}).then(function(){
				console.log("Switch back to Web IDE");
				return runConfig.switchToWindow(true);
			}).then(function(){
				console.log("Finished Successfully");
				return assert(true).isTrue();
			}).thenCatch(function(oError){
				console.log(oError);
				return driver.saveScreenshot("Generate_Smart_Template.png", that).thenFinally(function(){
					return assert(false).isTrue();
				});
			});

		});
});
