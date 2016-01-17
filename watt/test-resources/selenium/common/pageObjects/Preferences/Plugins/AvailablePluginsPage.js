var utils = require('../../../utilities/Utils'),
	BasePageObject = require("../../BasePageObject"),
	webdriver = require('selenium-webdriver');

'use strict';
function AvailablePluginsPage(driver, By, until, configuration, pageObjectFactory) {

	BasePageObject.call(this, driver, By, until, configuration, pageObjectFactory);

	this.mappings = {
		pageObjectLoadedSelector: {type: 'xpath', path: '//div/*/label[text()="Available Plugins"]'},
		searchField: {type: 'css', path: 'input[id*="searchField"][type="search"]'},
		cellData : {type: 'css', path: 'tr[id*="pluginTable"] > td[id*="pluginTable"][class="sapUiTableTdFirst"] >div > span[class="sapUiTv sapUiTvAlignLeft"]'},
		searchForCell : {type : 'css', path : 'tr[id*="pluginTable"] > td[id*="pluginTable"][class="sapUiTableTdFirst"] >div > span[title="$1"]'}
	};

}

AvailablePluginsPage.prototype = Object.create(BasePageObject.prototype);
AvailablePluginsPage.prototype.constructor = AvailablePluginsPage;

AvailablePluginsPage.prototype.searchForPlugin = function(sPluginName) {
	console.log("search For Plugin - " + sPluginName );
	var that = this;
	var inputLocator = utils.toLocator(this.mappings.searchField);
	return this.driver.myWaitAndClick(inputLocator, this.configuration.defaultTimeout).then(function(){
		return that.driver.myWaitAndSendKeys(sPluginName,inputLocator, that.configuration.defaultTimeout);
	}).then(function() {
		that.driver.sleep(1500);
		return that.driver.isElementPresent( utils.toLocator(that.mappings.searchForCell, [sPluginName]), that.configuration.defaultTimeout);
	});
};

module.exports = AvailablePluginsPage;