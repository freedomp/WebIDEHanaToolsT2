'use strict';

var webdriver = require('selenium-webdriver'),
	driverFactory = require('../../../utilities/driverFactory'),
	utils = require('../../../common/utilities/Utils'),
	assert = require('selenium-webdriver/testing/assert'),
	configuration = require('./Configuration.js'),
	PageObjectFactory = require('../../../common/utilities/PageObjectFactory'),
	HcpLoginPage = require('../../../common/pageObjects/HcpLoginPage');

var By = webdriver.By,
	until = webdriver.until;

describe('Generate_UI5Starter', function () {
	'use strict';
	this.timeout(configuration.startupTimeout);
	var driver;
	var pageObjectFactory;
	var currentProjectName;
	var webIDE;

	before(function () {
		driver = driverFactory.createDriver();
		driver.get(configuration.getParam(configuration.KEYS.HOST));

		pageObjectFactory =  new PageObjectFactory(driver, By, until, configuration);
		var hcpLoginPage = new HcpLoginPage(driver, By, until, configuration, pageObjectFactory);
		return hcpLoginPage.doWaitAndLoginOrGoToWebIDE(configuration.getParam(configuration.KEYS.USER_NAME),configuration.getParam(configuration.KEYS.PASSWORD)).then(function(oWebIDE){
			webIDE = oWebIDE;
			return webdriver.promise.fulfilled();
		});
	});

	beforeEach(function () {
		currentProjectName = configuration.projectName + Date.now();
	});

	afterEach(function () {
		return utils.deleteProjectFromWorkspace(driver, currentProjectName);
	});

	after(function(){
		return driver.sleep(3000).then(function() {
			return driver.quit();
		});
	});

	var _runTestWithVersion = function(sVersion){
		var that = this;
		return webIDE.clickWelcomePerspectiveButtonAndGoToWelcomePerspectivePage().then(function(welcomePerspectivePage){
			return welcomePerspectivePage.clickOnNewProjectFromTemplateButtonAndGoToTemplateSelectionPage();
		}).then(function(templateSelectionWizardPage){
			return templateSelectionWizardPage.selectTemplateAndGoToBasicInfoWizardPage(configuration.templateCategory, configuration.templateName, sVersion);
		}).then(function(basicInfoWizardPage){
			return basicInfoWizardPage.enterBasicInfoTextFields([currentProjectName, configuration.projectNamespace]).then(function(){
				return basicInfoWizardPage.clickNextButton();
			});
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/TemplateCustomizationWizardPage");
		}).then(function(templateCustomizationWizardPage){
			return templateCustomizationWizardPage.clickNextButton();
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/FinishWizardPage");
		}).then(function(finishWizardPage){
			return finishWizardPage.clickFinishButtonAndGoToDevelopmentPerspectivePage();
		}).then(function(developmentPerspectivePage){
			return developmentPerspectivePage.goToRepositoryBrowserModule();
		}).then(function(repositoryBrowserModule){
			return repositoryBrowserModule.rightClickAndSelectContextMenuPath(currentProjectName, ["Run","Run as", "Web Application"]);
		}).then(function(){
			return driver.mySwitchToWindow(false, configuration.defaultTimeout);
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/ApplicationRuntime/ApplicationRuntimePage", configuration, configuration.startupTimeout);
		}).then(function(applicationRuntimePage){
			return applicationRuntimePage.waitForAppHeaderText(configuration.applicationTitle);
		}).then(function(){
			return driver.mySwitchToWindow(true, configuration.defaultTimeout);
		}).then(function(){
			console.log("Finished Successfully");
			return assert(true).isTrue();
		}).thenCatch(function(oError){
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Generate_UI5StarterApplication.png", that).thenFinally(function(){
				throw oError;
			});
		});
	};

	it('Generate_UI5StarterApplication_SAPUI5_Innovation', function () {

		return _runTestWithVersion("SAPUI5 Innovation");

	});

	it('Generate_UI5StarterApplication_1.28', function () {

		return _runTestWithVersion("1.28");

	});
});
