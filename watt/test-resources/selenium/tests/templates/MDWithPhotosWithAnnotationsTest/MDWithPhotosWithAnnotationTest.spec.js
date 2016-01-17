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

describe('Generate_MD_with_Photos_And_Annotations', function () {
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

	it('Generate MD photos with annotations project', function () {
		var that = this;
		driver.get(configuration.getParam(configuration.KEYS.HOST));

		var pageObjectFactory =  new PageObjectFactory(driver, By, until, configuration);
		var hcpLoginPage = new HcpLoginPage(driver, By, until, configuration, pageObjectFactory);

		return hcpLoginPage.doWaitAndLoginOrGoToWebIDE(configuration.getParam(configuration.KEYS.USER_NAME),configuration.getParam(configuration.KEYS.PASSWORD)).then(function(webIDE){
			return webIDE.clickWelcomePerspectiveButtonAndGoToWelcomePerspectivePage();
		}).then(function(welcomePerspectivePage){
			return welcomePerspectivePage.clickOnNewProjectFromTemplateButtonAndGoToTemplateSelectionPage();
		}).then(function(templateSelectionWizardPage){
			return templateSelectionWizardPage.selectTemplateAndGoToBasicInfoWizardPage(configuration.templateCategory, configuration.templateName);
		}).then(function(basicInfoWizardPage){
			return basicInfoWizardPage.enterBasicInfoTextFields([currentProjectName]).then(function(){
				return basicInfoWizardPage.clickNextButton();
			});
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/DataConnectionWizardPage");
		}).then(function(dataConnectionWizardPage){
			return dataConnectionWizardPage.selectServiceFromFileSystem(path.resolve(__dirname, 'metadataClaim.xml')).then(function(){
				return dataConnectionWizardPage.clickNextButton();
			});
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/AnnotationSelectionWizardPage");
		}).then(function(annotationSelectionWizardPage){
			return annotationSelectionWizardPage.selectAnnotationFromFileSystem(path.resolve(__dirname, 'claims_annotation.xml')).then(function(){
				return annotationSelectionWizardPage.clickNextButton();
			});
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/TemplateCustomizationWizardPage");
		}).then(function(templateCustomizationWizardPage){
			return configureTemplateCustomizationstep(templateCustomizationWizardPage).then(function(){
				return templateCustomizationWizardPage.clickNextButton();
			});
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/OfflineCapabilitiesWizardPage");
		}).then(function(offlineCapabilitiesWizardPage){
			return offlineCapabilitiesWizardPage.clickNextButton();
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/FinishWizardPage");
		}).then(function(finishWizardPage){
			return finishWizardPage.clickFinishButtonAndGoToDevelopmentPerspectivePage();
		}).then(function(developmentPerspectivePage){
			return developmentPerspectivePage.goToRepositoryBrowserModule();
		}).then(function(repositoryBrowserModule){
			console.log("runAsWebApplication");
			return repositoryBrowserModule.rightClickAndSelectContextMenuPath(currentProjectName + "/index.html", ["Run","Run as", "Web Application"]);
		}).then(function(){
			console.log("Switch to preview window");
			return driver.mySwitchToWindow(false, configuration.defaultTimeout);
		}).then(function(){
			console.log("Get app header");
			return pageObjectFactory.createPageObjectInstance("/ApplicationRuntime/ApplicationRuntimePage", configuration, configuration.startupTimeout);
		}).then(function(applicationRuntimePage){
			return applicationRuntimePage.waitForAppHeaderText(configuration.appHeaderTitle);
		}).then(function(){
			console.log("Switch back to Web IDE");
			return driver.mySwitchToWindow(true, configuration.defaultTimeout);
		}).then(function(){
			console.log("Finished Successfully");
			return assert(true).isTrue();
		}).thenCatch(function(oError){
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Generate_MD_with_Photos.png", that).thenFinally(function(){
				throw oError;
			});
		});
	});

	// insert values to Template Customization step
	function configureTemplateCustomizationstep(templateCustomizationWizardPage){

		//TODO: extract strings
		var templateCustomizationODataCollection = By.css("#GroupContentGrid0 input[title='OData Collection']");
		return driver.myWaitAndSendKeys("DamageReportSet",templateCustomizationODataCollection, configuration.defaultTimeout).then(function(){
			return templateCustomizationWizardPage.enterTemplateCustomizationText(configuration.detailsPageTitle, 2, 'Title');
		}).then(function(){
			return templateCustomizationWizardPage.clickTemplateCustomizationCheckbox(2, 'Add Approve/Reject buttons');
		}).then(function(){
			return templateCustomizationWizardPage.enterTemplateCustomizationText("Filename", 3, 'File name attribute from the photos OData collection');
		}).then(function(){
			return templateCustomizationWizardPage.enterTemplateCustomizationText("ContentType", 3, 'File content type attribute from the photos OData collection');
		}).then(function(){
			return templateCustomizationWizardPage.enterTemplateCustomizationText("DamageReportId", 3, 'ID attribute for the related item in the parent OData collection');
		});
	}

});
