var utils = require('../utilities/Utils');
var webdriver = require('selenium-webdriver');
var BasePageObject = require("./BasePageObject");
var _ = require('lodash');

'use strict';
function UserNotificationPage(driver, By, until, configuration, pageObjectFactory) {
	BasePageObject.call(this, driver, By, until, configuration, pageObjectFactory);

	this.mappings = {
		pageObjectLoadedSelector: {type: 'css', path: 'button[id$="applyButton"]'},
		savedLabel : {type: 'css', path: 'label[title="User preference has been saved"]'}
	};
}

UserNotificationPage.prototype = Object.create(BasePageObject.prototype);
UserNotificationPage.prototype.constructor = UserNotificationPage;


UserNotificationPage.prototype.waitUntilSavePreferencesLabelIsHidden = function(){
	var that = this;
	return this.driver.isElementPresent( utils.toLocator(this.mappings.savedLabel), this.configuration.defaultTimeout).then(function(bRes){
		return (bRes) ?  that.waitUntilSavePreferencesLabelIsHidden() : {};
	});
};

module.exports = UserNotificationPage;
