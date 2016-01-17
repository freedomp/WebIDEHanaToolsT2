var utils = require('../Utils');

module.exports = function (driver, By, until, configuration) {
	'use strict';

	var mappings = {
		codeEditorTab: {type: 'css', path : '.multiEditor li[tabidx="0"]'},
		graphicalEditorTab: {type: 'css', path : '.multiEditor li[tabidx="1"]'}
	};

	utils.decorateDriver(driver, until);

	return {

		clickOnCodeEditorTab : function() {
			return driver.myWaitAndClick(utils.toLocator(mappings.codeEditorTab));
		},

		clickOnGraphicalEditorTab : function() {
			return driver.myWaitAndClick(utils.toLocator(mappings.graphicalEditorTab));
		}
	};

};