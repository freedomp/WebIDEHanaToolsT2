var utils = require('../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	BasePageObject = require("./BasePageObject");

function PreferencesPerspectivePage(driver, By, until, configuration, pageObjectFactory) {

	BasePageObject.call(this, driver, By, until, configuration, pageObjectFactory);

	this.mappings = {
		pageObjectLoadedSelector: {type: 'css', path: 'button[id$="applicationLeftSidebar-tools.userpreference"][aria-disabled="true"]'},
		plugins : {type : 'xpath' , path : '//div/*/span[text()="Plugins"]'},
		optionalPluginsButton: {type: 'css', path: 'button[id$="optionalPlugins"]'},
		availablePluginsButton: {type: 'css', path: 'button[id$="availablePlugins"]'}
	};
};

PreferencesPerspectivePage.prototype = Object.create(BasePageObject.prototype);
PreferencesPerspectivePage.prototype.constructor = PreferencesPerspectivePage;

PreferencesPerspectivePage.prototype.clickOnOptionalPluginsButtonAndGoToOptionalPluginsPage = function(){
	console.log("clickOnOptionalPluginsButtonAndGoToOptionalPluginsPage");
	return _choosePluginOptionFromPluginsListAndCreatePageObjectInstance.call(this,this.mappings.optionalPluginsButton,"/Preferences/Plugins/OptionalPluginsPage");
};

PreferencesPerspectivePage.prototype.clickOnOptionalPluginsButtonAndGoToAvailablePluginsPage = function(){
	console.log("clickOnOptionalPluginsButtonAndGoToAvailablePluginsPage");
	return _choosePluginOptionFromPluginsListAndCreatePageObjectInstance.call(this,this.mappings.availablePluginsButton,"/Preferences/Plugins/AvailablePluginsPage");
};

var _choosePluginOptionFromPluginsListAndCreatePageObjectInstance = function(oOptionPluginButton,sPluginPagePath){
	var that = this;

	return this.driver.myWait(utils.toLocator(this.mappings.plugins), this.configuration.defaultTimeout).then(function(oPluginsSection) {
		return oPluginsSection.getAttribute("aria-selected").then(function(sSelected){
			if (sSelected === "false"){
				return that.driver.myWaitAndClick(utils.toLocator(that.mappings.plugins), that.configuration.defaultTimeout).then(function () {
					return that.driver.myWaitAndClick(utils.toLocator(oOptionPluginButton), that.configuration.defaultTimeout).then(function () {
						return that.pageObjectFactory.createPageObjectInstance(sPluginPagePath);
					});
				});
			}
			else{
				return that.driver.myWaitAndClick(utils.toLocator(oOptionPluginButton), that.configuration.defaultTimeout).then(function () {
					return that.pageObjectFactory.createPageObjectInstance(sPluginPagePath);
				});
			}
		});
	});
};

module.exports = PreferencesPerspectivePage;