var utils = require('./Utils');

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		dirtyTab : {type: 'css', path : '#contentAreaView--tabStripNavBar-list li.wattTabDirty [title="/$1"]'},
		undirtyTab : {type: 'css', path : '#contentAreaView--tabStripNavBar-list li:not(.wattTabDirty) [title="/$1"]'},
		tab : {type: 'css', path : '#contentAreaView--tabStripNavBar-list li#__tab$1'},
		tabClose : {type: 'css', path : '#contentAreaView--tabStripNavBar-list li#__tab$1 .sapUiTabClose'}
	};

	utils.decorateDriver(driver, until);


	return {

		waitUntilTabIsDirty : function(sFilePath) {
			var sTabLocator = utils.toLocator(mappings.dirtyTab, [sFilePath]);
			return driver.myWait(sTabLocator);
		},

		waitUntilTabIsNotDirty : function(sFilePath) {
			var sTabLocator = utils.toLocator(mappings.undirtyTab, [sFilePath]);
			return driver.myWait(sTabLocator);
		},

		clickOnEditorTab : function(iTabIndex) {
			var tabLocator = utils.toLocator(mappings.tab, [iTabIndex]);
			return driver.myWaitAndClick(tabLocator);
		},

		clickOnEditorTabClose : function(iTabIndex) {
			var tabCloseLocator = utils.toLocator(mappings.tabClose, [iTabIndex]);
			return driver.myWaitAndClick(tabCloseLocator);
		}
	};

};
