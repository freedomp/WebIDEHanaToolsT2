var utils = require('../../../utilities/Utils'),
	BasePageObject = require("../../BasePageObject"),
	webdriver = require('selenium-webdriver');

'use strict';
function OptionalPluginsPage(driver, By, until, configuration, pageObjectFactory) {

	BasePageObject.call(this, driver, By, until, configuration, pageObjectFactory);

	this.mappings = {
		pageObjectLoadedSelector: {type: 'xpath', path: '//div/*/label[text()="Optional Plugins"]'},
		firstRowInPluginsTable : {type : 'xpath' , path : '//*[@id="__table0-rows-row0"]'},
		enabledCheckBoxOfFirstRow : {type : 'xpath' , path : '//*/span[contains(@id,"col0-row0")]'},
		pluginNameOfFirstRow : {type : 'xpath' , path : '//*/span[contains(@id,"col1-row0")]'},
		removeAllButton: {type: 'css', path: 'button[id$="removeBtn"]'},
		saveButton: {type: 'css', path: 'button[id$="applyButton"]'},
		okConfirmButton : {type: 'css', path: 'button[id$="MSG_CONFIRM--btn-OK"]'}
	};

}

OptionalPluginsPage.prototype = Object.create(BasePageObject.prototype);
OptionalPluginsPage.prototype.constructor = OptionalPluginsPage;

OptionalPluginsPage.prototype.removeAllOptionalPlugins = function() {
	console.log("remove All Optional Plugins");
	var that = this;
	return this.driver.myWait(utils.toLocator(this.mappings.removeAllButton), this.configuration.defaultTimeout).then(function(oRemoveAllButton) {
		return oRemoveAllButton.getAttribute("aria-disabled").then(function(sDisabledStatus){
			if (sDisabledStatus === "false"){
				return that.driver.myWaitAndClick(utils.toLocator(that.mappings.removeAllButton), that.configuration.defaultTimeout).then(function () {
					return that.driver.myWaitAndClick(utils.toLocator(that.mappings.okConfirmButton), that.configuration.defaultTimeout);
				}).then(function(){
					return that.driver.myWaitAndClick(utils.toLocator(that.mappings.saveButton), that.configuration.defaultTimeout);
				}).then(function() {
					return that.pageObjectFactory.createPageObjectInstance("/UserNotificationPage");
				}).then(function(UserNotiifcationPage){
					return UserNotiifcationPage.waitUntilSavePreferencesLabelIsHidden();
				});
			}
		});
	});
};

OptionalPluginsPage.prototype.selectPluginFromTable = function() {
	console.log("select Plugin From Table");
	var that = this;

	return this.driver.myWaitAndClick(utils.toLocator(that.mappings.enabledCheckBoxOfFirstRow), that.configuration.defaultTimeout).then(function () {
		return that.driver.myWaitAndClick(utils.toLocator(that.mappings.saveButton), that.configuration.defaultTimeout);
	}).then(function(){
		return that.pageObjectFactory.createPageObjectInstance("/UserNotificationPage");
	}).then(function(UserNotiifcationPage){
		return UserNotiifcationPage.waitUntilSavePreferencesLabelIsHidden();
	}).then(function() {
		return that.driver.myWait(utils.toLocator(that.mappings.pluginNameOfFirstRow), that.configuration.defaultTimeout);
	}).then(function(oPluginName) {
		return oPluginName.getAttribute('title');
	});
};


module.exports = OptionalPluginsPage;