'use strict';

var webdriver = require('selenium-webdriver'),
	remote = require('selenium-webdriver/remote'),
	driverFactory = require('../../../utilities/driverFactory'),
	utils = require('../../../common/utilities/Utils'),
	assert = require('selenium-webdriver/testing/assert'),
	configuration = require('./Configuration.js'),
	PageObjectFactory = require('../../../common/utilities/PageObjectFactory'),
	HcpLoginPage = require('../../../common/pageObjects/HcpLoginPage');

var By = webdriver.By,
	until = webdriver.until;

describe('Plugin Development', function () {
	'use strict';
	this.timeout(configuration.startupTimeout);
	var driver;
	var pageObjectFactory;
	var webIDE;
	var currentProjectName = configuration.projectName + Date.now();
	var projectNameFromNewTemplate = configuration.projectNameFromNewTemplate + Date.now();

	before(function () {
		driver = driverFactory.createDriver();
		driver.setFileDetector(new remote.FileDetector);
		driver.get(configuration.getParam(configuration.KEYS.HOST));

		pageObjectFactory =  new PageObjectFactory(driver, By, until, configuration);
		var hcpLoginPage = new HcpLoginPage(driver, By, until, configuration, pageObjectFactory);
		return hcpLoginPage.doWaitAndLoginOrGoToWebIDE(configuration.getParam(configuration.KEYS.USER_NAME),configuration.getParam(configuration.KEYS.PASSWORD)).then(function(oWebIDE){
			webIDE = oWebIDE;
			return webdriver.promise.fulfilled();
		});
	});

	after(function () {
		return utils.deleteProjectFromWorkspace(driver, currentProjectName).then(function(){
			return utils.deleteProjectFromWorkspace(driver, projectNameFromNewTemplate).thenFinally(function() {
				return driver.sleep(5000).then(function () {
					return driver.quit();
				});
			});
		});
	});



	it(
		'Generate Empty Plugin Project',
		function () {
			var that = this;
			return webIDE.clickWelcomePerspectiveButtonAndGoToWelcomePerspectivePage().then(function(welcomePerspectivePage){
				return welcomePerspectivePage.clickOnNewProjectFromTemplateButtonAndGoToTemplateSelectionPage();
			}).then(function(templateSelectionWizardPage){
				return templateSelectionWizardPage.selectTemplateAndGoToBasicInfoWizardPage(configuration.templateCategory, configuration.templateName);
			}).then(function(basicInfoWizardPage){
				return basicInfoWizardPage.enterBasicInfoTextFields([currentProjectName]).then(function(){
					return basicInfoWizardPage.clickNextButton();
				});
			}).then(function(){
				return pageObjectFactory.createPageObjectInstance("/wizard/TemplateCustomizationWizardPage");
			}).then(function(templateCustomizationWizardPage){
				return templateCustomizationWizardPage.enterTemplateCustomizationText("plugin_for_test", 0, "Plugin Name").then(function(){
					return templateCustomizationWizardPage.clickNextButton();
				});
			}).then(function(){
				return pageObjectFactory.createPageObjectInstance("/wizard/FinishWizardPage");
			}).then(function(finishWizardPage){
				return finishWizardPage.clickFinishButtonAndGoToDevelopmentPerspectivePage();
			}).then(function(developmentPerspectivePage){
				return developmentPerspectivePage.goToRepositoryBrowserModule();
			}).then(function(repositoryBrowserModule){
				return repositoryBrowserModule.expand(currentProjectName);
			}).then(function(){
				console.log("Finished Successfully\n");
				return assert(true).isTrue();
			}).thenCatch(function(oError){
				console.log(oError);
				console.log("Save screenshot");
				return driver.saveScreenshot("Generate_Empty_Plugin_Project.png", that).thenFinally(function(){
					throw oError;
				});
			});
		});

	it('Add new template to the plugin project',function(){
		var that = this;
		return pageObjectFactory.createPageObjectInstance("/RepositoryBrowserModule").then(function(repositoryBrowserModule){
			return repositoryBrowserModule.rightClickAndSelectContextMenuPath(currentProjectName, ["New", "Template"]);
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/TemplateInfoWizardPage");
		}).then(function(templateInfoWizardPage){
			return templateInfoWizardPage.enterTemplateNameTextField(configuration.newTemplateName).then(function(){
				return templateInfoWizardPage.clickNextButton();
			});
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/WizardStepSelectionWizardPage");
		}).then(function(wizardStepSelectionWizardPage){
			return wizardStepSelectionWizardPage.clickNextButton();
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/FinishWizardPage");
		}).then(function(finishWizardPage){
			return finishWizardPage.clickFinishButtonAndGoToDevelopmentPerspectivePage();
		}).then(function(developmentPerspectivePage){
			return developmentPerspectivePage.goToRepositoryBrowserModule();
		}).then(function(repositoryBrowserModule) {
			return repositoryBrowserModule.expand(currentProjectName + "/" + configuration.newTemplateName.toLowerCase());
		}).then(function(){
			console.log("Finished Successfully\n");
			return assert(true).isTrue();
		}).thenCatch(function(oError){
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Add_new_template_to_the_plugin_project.png", that).thenFinally(function(){
				throw oError;
			});
		});
	});

	it('Run plugin project',function(){
		var that = this;
		return pageObjectFactory.createPageObjectInstance("/RepositoryBrowserModule").then(function(repositoryBrowserModule) {
			return repositoryBrowserModule.rightClickAndSelectContextMenuPath(currentProjectName + "/plugin.json", ["Run", "Run Plugin Project"]).then(function(){
				return driver.mySwitchToWindow(false, configuration.defaultTimeout);
			});
		}).then(function() {
			return webIDE.clickWelcomePerspectiveButtonAndGoToWelcomePerspectivePage();
		}).then(function(welcomePerspectivePage){
			return welcomePerspectivePage.clickOnNewProjectFromTemplateButtonAndGoToTemplateSelectionPage();
		}).then(function(templateSelectionWizardPage){
			return templateSelectionWizardPage.selectTemplateAndGoToBasicInfoWizardPage(configuration.templateCategory, configuration.newTemplateName);
		}).then(function(basicInfoWizardPage){
			return basicInfoWizardPage.enterBasicInfoTextFields([projectNameFromNewTemplate]).then(function(){
				return basicInfoWizardPage.clickNextButton();
			});
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/FinishWizardPage");
		}).then(function(finishWizardPage){
			return finishWizardPage.clickFinishButtonAndGoToDevelopmentPerspectivePage();
		}).then(function(developmentPerspectivePage){
			return developmentPerspectivePage.goToRepositoryBrowserModule();
		}).then(function(repositoryBrowserModule) {
			return repositoryBrowserModule.openFile(projectNameFromNewTemplate + "/sample.js");
		}).then(function(){
			console.log("Finished Successfully\n");
			return assert(true).isTrue();
		}).thenCatch(function(oError){
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Run_plugin_project", that).thenFinally(function(){
				throw oError;
			});
		});

	});
});
