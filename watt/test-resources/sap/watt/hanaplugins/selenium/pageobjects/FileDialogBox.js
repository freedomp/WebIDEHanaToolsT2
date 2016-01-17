var utils = require('./Utils');
var webdriver = require('selenium-webdriver');

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		fileDialogOkButton : {type: 'css', path : '#FileDialog_ActionButton'}
	};
	utils.decorateDriver(driver, until);

	return {
                clickOkButton : function(){
                    driver.wait(until.elementLocated(utils.toLocator(mappings.fileDialogOkButton)), configuration.defaultTimeout);
                    var sEditorLocator = utils.toLocator(mappings.fileDialogOkButton);
                    return driver.myWaitAndClick(sEditorLocator,configuration.defaultTimeout);
                }
	};
};
