'use strict';

var webdriver = require('selenium-webdriver'),
	driverFactory = require('../../../utilities/driverFactory'),
	utils = require('../../../common/utilities/Utils'),
	assert = require('selenium-webdriver/testing/assert'),
	configuration = require('./Configuration.js'),
	PageObjectFactory = require('../../../common/utilities/PageObjectFactory'),
	HcpLoginPage = require('../../../common/pageObjects/HcpLoginPage'),
	path = require('path'),
	remote = require('selenium-webdriver/remote');

var By = webdriver.By,
	until = webdriver.until;

describe('Generate_MD_with_CRUD', function () {
	'use strict';
	this.timeout(configuration.startupTimeout);
	var driver;
	var currentProjectName = configuration.projectName + Date.now();

	beforeEach(function () {
		driver = driverFactory.createDriver();
		driver.setFileDetector(new remote.FileDetector());
	});

	afterEach(function () {
		return utils.deleteProjectFromWorkspace(driver, currentProjectName).thenFinally(function(){
			return driver.sleep(5000).then(function() {
				return driver.quit();
			});
		});
	});

	it('Generate MD with CRUD project', function () {
		var that = this;
		driver.get(configuration.getParam(configuration.KEYS.HOST));

		var pageObjectFactory =  new PageObjectFactory(driver, By, until, configuration);
		var hcpLoginPage = new HcpLoginPage(driver, By, until, configuration, pageObjectFactory);

		return hcpLoginPage.doWaitAndLoginOrGoToWebIDE(configuration.getParam(configuration.KEYS.USER_NAME),configuration.getParam(configuration.KEYS.PASSWORD)).then(function(webIDE){
			return webIDE.clickWelcomePerspectiveButtonAndGoToWelcomePerspectivePage();
		}).then(function(welcomePerspectivePage){
			return welcomePerspectivePage.clickOnNewProjectFromTemplateButtonAndGoToTemplateSelectionPage();
		}).then(function(templateSelectionWizardPage){
			return templateSelectionWizardPage.selectTemplateAndGoToBasicInfoWizardPage(configuration.templateCategory, configuration.templateName, configuration.templateVersion);
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
			return pageObjectFactory.createPageObjectInstance("/wizard/TemplateCustomizationWizardPage");
		}).then(function(templateCustomizationWizardPage){
			return configureTemplateCustomizationstep(templateCustomizationWizardPage).then(function(){
				return templateCustomizationWizardPage.clickNextButton();
			});
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/FinishWizardPage");
		}).then(function(finishWizardPage){
			return finishWizardPage.clickFinishButtonAndGoToDevelopmentPerspectivePage();
		}).then(function(developmentPerspectivePage){
			return developmentPerspectivePage.goToRepositoryBrowserModule();
		}).then(function(repositoryBrowserModule){
			console.log("runAsWebApplication");
			return repositoryBrowserModule.rightClickAndSelectContextMenuPath(currentProjectName, ["Run","Run with MockServer"]);
		}).then(function(){
			console.log("Switch to preview window");
			return driver.mySwitchToWindow(false, configuration.defaultTimeout);
		}).then(function(){
			console.log("Get app header");
			return pageObjectFactory.createPageObjectInstance("/ApplicationRuntime/CRUDApplicationPage", configuration, configuration.startupTimeout);
		}).then(function(CRUDApplicationPage){
			return CRUDApplicationPage.waitForDetailHeaderTitle("CITY 1").then(function(){
				return CRUDApplicationPage.clickAddButton().then(function(){
					return CRUDApplicationPage.waitForNewEntityLabel("Agency No.").then(function () {
						return configureNewEntryScreen(CRUDApplicationPage).then(function () {
							return CRUDApplicationPage.clickSaveButton().then(function () {
								return CRUDApplicationPage.waitForDetailHeaderTitle("CITY 1A").then(function(){
									return CRUDApplicationPage.clickEditButton().then(function () {
										return CRUDApplicationPage.waitForNewEntityLabel("Agency No.").then(function () {
											return updateCreatedEntity(CRUDApplicationPage).then(function () {
												return CRUDApplicationPage.clickSaveButton().then(function () {
													return CRUDApplicationPage.waitForDetailHeaderTitle("CITY 1A2").then(function(){
														return CRUDApplicationPage.clickDeleteButton().then(function () {
															return CRUDApplicationPage.clickOKButton();
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		}).then(function(){
			return driver.mySwitchToWindow(true, configuration.defaultTimeout);
		}).then(function(){
			console.log("Finished Successfully");
			return assert(true).isTrue();
		}).thenCatch(function(oError){
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Generate_Smart_Template.png", that).thenFinally(function(){
				throw oError;
			});
		});
	});

	// insert values to Template Customization step
	function configureTemplateCustomizationstep(templateCustomizationWizardPage){

		//TODO: extract strings
		var templateCustomizationObjectCollection = By.css("#GroupContentGrid0 input[title='Object Collection']");
		return driver.myWaitAndSendKeys(configuration.collectionName, templateCustomizationObjectCollection, configuration.defaultTimeout).then(function(){
			var templateCustomizationObjectTitle = By.css("#GroupContentGrid0 input[title='Object Collection ID']");
			return driver.myWaitAndClick(templateCustomizationObjectTitle, configuration.defaultTimeout).then(function(){
				var templateCustomizationObjectTitle = By.css("#GroupContentGrid0 input[title='Object Title']");
				return driver.myWaitAndSendKeys("CITY", templateCustomizationObjectTitle, configuration.defaultTimeout).then(function(){
					return driver.myWaitAndClick(templateCustomizationObjectCollection, configuration.defaultTimeout);
				});
			});
		});
	}

	// insert values to Template Customization step
	function configureNewEntryScreen(CRUDApplicationPage){
		return driver.sleep(1000).then(function() {
			return CRUDApplicationPage.enterNewEntityText("1234", "agencynum").then(function () {
				return CRUDApplicationPage.enterNewEntityText("CITY 1A", "CITY");
			});
		});
	}

	// insert values to Template Customization step
	function updateCreatedEntity(CRUDApplicationPage){
		return driver.sleep(1000).then(function() {
			return CRUDApplicationPage.enterNewEntityText("2", "CITY");
		});
	}

});
