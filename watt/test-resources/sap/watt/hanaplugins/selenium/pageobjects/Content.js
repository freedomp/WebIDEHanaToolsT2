var utils = require('./Utils');

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		dirtyTab : {type: 'css', path : '#contentAreaView--tabStripNavBar-list li.wattTabDirty [title="/$1"]'},
		undirtyTab : {type: 'css', path : '#contentAreaView--tabStripNavBar-list li:not(.wattTabDirty) [title="/$1"]'}
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
		}
	};

};
