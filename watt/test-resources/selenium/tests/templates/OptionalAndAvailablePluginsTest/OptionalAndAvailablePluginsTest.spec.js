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

describe('Optional_And_Available_Plugins_Test', function () {
	'use strict';
	this.timeout(configuration.startupTimeout);
	var driver;
	var pageObjectFactory;
	var webIDE;
	var currentProjectName = configuration.projectName + Date.now();

	before(function () {
		var that = this;
		driver = driverFactory.createDriver();
		driver.setFileDetector(new remote.FileDetector);
		driver.get(configuration.getParam(configuration.KEYS.HOST));

		pageObjectFactory =  new PageObjectFactory(driver, By, until, configuration);
		var hcpLoginPage = new HcpLoginPage(driver, By, until, configuration, pageObjectFactory);
		return hcpLoginPage.doWaitAndLoginOrGoToWebIDE(configuration.getParam(configuration.KEYS.USER_NAME),configuration.getParam(configuration.KEYS.PASSWORD)).then(function(oWebIDE){
			that._webIDE = oWebIDE;
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

	it('Optional And Available Plugins Test - Add Plugin', function () {
		var that = this;

		return remvoeAllPlugins(this._webIDE).then(function(){
			return selectPluginFromTable(that._webIDE);
		}).then(function(sPluginName){
			that._sPluginName = sPluginName;
			return searchForPluginInTable(that._webIDE, sPluginName);
		}).then(function(bPluginExists){
			displayToConsolePluginStatus(that._sPluginName, bPluginExists);
			if(!bPluginExists){
				assert(bPluginExists).equalTo(true);
			}
		}).thenCatch(function(oError){
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Optional_And_Available_Plugins_Add_Plugin.png", that).thenFinally(function(){
				throw oError;
			});
		});
	});

	it('Optional And Available Plugins Test - Remove Plugin', function () {
		var that = this;

		return remvoeAllPlugins(this._webIDE).then(function(){
			return searchForPluginInTable(that._webIDE, that._sPluginName);
		}).then(function(bPluginExists) {
			displayToConsolePluginStatus(that._sPluginName, bPluginExists);
			return assert(!bPluginExists).isTrue();
		}).thenCatch(function(oError){
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Optional_And_Available_Plugins_Remove_Plugin.png", that).thenFinally(function(){
				throw oError;
			});
		});
	});

	function remvoeAllPlugins(webIDE) {

		return webIDE.clickPreferencesPerspectiveAndGoToPreferencesPerspectivePage().then(function (PreferencesPerspectivePage) {
			return PreferencesPerspectivePage.clickOnOptionalPluginsButtonAndGoToOptionalPluginsPage();
		}).then(function (OptionalPluginsPage) {
			return OptionalPluginsPage.removeAllOptionalPlugins();
		}).then(function () {
			console.log("refresh browser");
			return driver.navigate().refresh();
		});
	}

	function selectPluginFromTable(webIDE){

		return webIDE.clickPreferencesPerspectiveAndGoToPreferencesPerspectivePage().then(function(PreferencesPerspectivePage){
			return PreferencesPerspectivePage.clickOnOptionalPluginsButtonAndGoToOptionalPluginsPage();
		}).then(function(OptionalPluginsPage) {
			return OptionalPluginsPage.selectPluginFromTable();
		}).then(function(sPluginName) {
			console.log("refresh browser");
			return driver.navigate().refresh().then(function(){
				return sPluginName;
			});
		});
	}

	function searchForPluginInTable(webIDE, sPluginName){
		return webIDE.clickPreferencesPerspectiveAndGoToPreferencesPerspectivePage().then(function(PreferencesPerspectivePage){
			return PreferencesPerspectivePage.clickOnOptionalPluginsButtonAndGoToAvailablePluginsPage();
		}).then(function(AvailablePluginsPage) {
			return AvailablePluginsPage.searchForPlugin(sPluginName).then(function(bPluginExists){
				console.log("refresh browser");
				return driver.navigate().refresh().then(function(){
					return bPluginExists;
				});
			});
		});
	}

	function displayToConsolePluginStatus(sPluginName, bPluginExists){
		var sMsg = "The selected Plugin - " + sPluginName;
		sMsg += (bPluginExists) ? " has been found in table." : " hasn't been found in table.";
		console.log(sMsg);
	}
});

