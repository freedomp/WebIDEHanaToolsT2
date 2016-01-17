'use strict';

var path = require('path');

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

describe('Generate Smart Template', function () {
	'use strict';
	this.timeout(configuration.startupTimeout);
	var driver;
	var pageObjectFactory;
	var webIDE;
	var currentProjectName = configuration.projectName + Date.now();

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
			return webIDE.clickWelcomePerspectiveButtonAndGoToWelcomePerspectivePage().then(function(welcomePerspectivePage){
				return welcomePerspectivePage.clickOnNewProjectFromTemplateButtonAndGoToTemplateSelectionPage();
			}).then(function(templateSelectionWizardPage){
				return templateSelectionWizardPage.selectTemplateAndGoToBasicInfoWizardPage(configuration.templateCategory, configuration.templateName);
			}).then(function(basicInfoWizardPage){
				return basicInfoWizardPage.enterBasicInfoTextFields([currentProjectName,configuration.applicationTitle, configuration.applicationNamespace, null, configuration.applicationACH]).then(function(){
					return basicInfoWizardPage.clickNextButton();
				});
			}).then(function(){
				return pageObjectFactory.createPageObjectInstance("/wizard/DataConnectionWizardPage");
			}).then(function(dataConnectionWizardPage){
				return dataConnectionWizardPage.selectServiceFromFileSystem(path.resolve(__dirname, 'metadata.xml')).then(function(){
					return dataConnectionWizardPage.clickNextButton();
				});
			}).then(function(){
				return pageObjectFactory.createPageObjectInstance("/wizard/AnnotationSelectionWizardPage");
			}).then(function(annotationSelectionWizardPage){
				return annotationSelectionWizardPage.selectAnnotationFromFileSystem(path.resolve(__dirname, 'annotations.xml')).then(function(){
					return annotationSelectionWizardPage.clickNextButton();
				});
			}).then(function(){
				return pageObjectFactory.createPageObjectInstance("/wizard/TemplateCustomizationWizardPage");
			}).then(function(templateCustomizationWizardPage){
				return templateCustomizationWizardPage.enterTemplateCustomizationText("SEPMRA_I_ProductWithDraft", 0, "Addressable OData collection").then(function(){
					return templateCustomizationWizardPage.enterTemplateCustomizationText("to_ProductText", 0, "OData navigation attribute to a collection of items");
				}).then(function(){
					return templateCustomizationWizardPage.clickNextButton();
				});
			}).then(function(){
				return pageObjectFactory.createPageObjectInstance("/wizard/FinishWizardPage");
			}).then(function(finishWizardPage){
				return finishWizardPage.clickFinishButtonAndGoToDevelopmentPerspectivePage();
			}).then(function(developmentPerspectivePage){
				return developmentPerspectivePage.goToRepositoryBrowserModule();
			}).then(function(repositoryBrowserModule){
				return repositoryBrowserModule.rightClickAndSelectContextMenuPath(currentProjectName + "/webapp/test/testFLPService.html", ["Run","Run as", "Unit Test"]);
			}).then(function(){
				return driver.mySwitchToWindow(false, configuration.defaultTimeout);
			}).then(function(){
				return pageObjectFactory.createPageObjectInstance("/ApplicationRuntime/SmartTemplateApplicationPage", configuration, configuration.startupTimeout);
			}).then(function(smartTemplateApplicationPage){
				return smartTemplateApplicationPage.waitForAppHeaderText(configuration.applicationTitle).then(function(){
					return smartTemplateApplicationPage.clickGoButton();
				}).then(function(){
					return smartTemplateApplicationPage.clickFirstTableFirstRow();
				}).then(function(){
					return smartTemplateApplicationPage.clickSecondTableFirstRow();
				});
			}).then(function(){
				return driver.mySwitchToWindow(true, configuration.defaultTimeout);
			}).then(function(){
				console.log("Finished Successfully\n");
				return assert(true).isTrue();
			}).thenCatch(function(oError){
				console.log(oError);
				console.log("Save screenshot");
				return driver.saveScreenshot("Generate_Smart_Template.png", that).thenFinally(function(){
					throw oError;
				});
			});


		});

	it('Add OData Service to a smart template',function(){
		var that = this;
		return pageObjectFactory.createPageObjectInstance("/RepositoryBrowserModule").then(function(repositoryBrowserModule){
			return repositoryBrowserModule.rightClickAndSelectContextMenuPath(currentProjectName, ["New", "OData Service"]);
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/DataConnectionWizardPage");
		}).then(function(dataConnectionWizardPage){
			return dataConnectionWizardPage.selectServiceFromFileSystem(path.resolve(__dirname, 'rmtsampleflights_metadata.xml')).then(function(){
				return dataConnectionWizardPage.clickNextButton();
			});
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/FinishWizardPage");
		}).then(function(finishWizardPage){
			return finishWizardPage.clickFinishButtonAndGoToDevelopmentPerspectivePage();
		}).then(function(developmentPerspectivePage){
			return developmentPerspectivePage.goToRepositoryBrowserModule();
		}).then(function(repositoryBrowserModule) {
			return repositoryBrowserModule.expand(currentProjectName + "/webapp/localService/RMTSAMPLEFLIGHT");
		}).then(function(){
			console.log("Finished Successfully\n");
			return assert(true).isTrue();
		}).thenCatch(function(oError){
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Add_OData_Service_to_Smart_Template.png", that).thenFinally(function(){
				throw oError;
			});
		});

	});
});
