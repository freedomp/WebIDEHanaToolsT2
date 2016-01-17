'use strict';

var webdriver = require('selenium-webdriver'),
	driverFactory = require('../../../utilities/driverFactory'),
	utils = require('../../../common/utilities/Utils'),
	assert = require('selenium-webdriver/testing/assert'),
	configuration = require('./Configuration.js'),
	PageObjectFactory = require('../../../common/utilities/PageObjectFactory'),
	HcpLoginPage = require('../../../common/pageObjects/HcpLoginPage'),
	path = require('path'),
	remote = require('selenium-webdriver/remote'),
	fs = require('fs');

var By = webdriver.By,
	until = webdriver.until;

describe('Test_Catalog_Step_API_Management', function () {
	'use strict';
	this.timeout(configuration.startupTimeout);
	var driver;
	var currentProjectName = configuration.projectName + Date.now();
	var jProxies = fs.readFileSync(path.resolve(__dirname, 'resources/jProxies.json'), "utf8");
	var oExpandServiceResponse = fs.readFileSync(path.resolve(__dirname, 'resources/expandServiceResponse.json'), "utf8");
	var sApplications = fs.readFileSync(path.resolve(__dirname, 'resources/sApplications.json'), "utf8");
	var sMetadataXMLFile = fs.readFileSync(path.resolve(__dirname, 'resources/apiProxyMetadata.xml'), "utf8");

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

	it('Test Catalog Step - API Management', function () {
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
			return basicInfoWizardPage.enterBasicInfoTextFields([currentProjectName]).then(function(){
				return basicInfoWizardPage.clickNextButton();
			});
		}).then(function(){
			return utils.startMockServer(driver, "", buildMockRequestsObjects());
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/DataConnectionWizardPage");
		}).then(function(dataConnectionWizardPage){
			return dataConnectionWizardPage.selectServiceFromCatalog(configuration.systemName, configuration.serviceName).then(function(){
				return dataConnectionWizardPage.waitForAPIDescriptionText(configuration.apiDescriptionText).then(function(){
					return dataConnectionWizardPage.clickSubscribeButton().then(function(){
						return dataConnectionWizardPage.selectAvailableProduct(configuration.producetName).then(function(){
							return dataConnectionWizardPage.clickSelectProductButton().then(function(){
								return dataConnectionWizardPage.waitForStepErrorText("Cannot parse the metadata file. ");
							});
						});
					});
				});
			});
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

	function buildMockRequestsObjects() {
		var aRequests = [];
		aRequests.push(utils.createMockRequestObj("GET", ".*APIProxies$", "application/json", jProxies));
		aRequests.push(utils.createMockRequestObj("GET", ".*GPNtestsmoke111.*", "application/json", oExpandServiceResponse));
		aRequests.push(utils.createMockRequestObj("GET", ".*Applications.*", "application/json", sApplications));
		aRequests.push(utils.createMockRequestObj("POST", ".*Applications.*", "application/json", sApplications));
		aRequests.push(utils.createMockRequestObj("GET", ".*metadata", "application/json", sMetadataXMLFile));
		return aRequests;
	}
});
