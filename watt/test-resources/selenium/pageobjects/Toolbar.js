var utils = require('./Utils');

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		toolbarButton : {type: 'css', path : '#toolbar button[title="$1"]'}
	};

	utils.decorateDriver(driver, until);


	return {

		pressButton : function(sTooltip) {
			var sButtonLocator = utils.toLocator(mappings.toolbarButton, [sTooltip]);
			return driver.myWaitAndClick(sButtonLocator);
		}
	};

};
