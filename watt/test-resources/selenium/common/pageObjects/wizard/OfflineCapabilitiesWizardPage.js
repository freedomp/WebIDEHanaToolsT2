var utils = require('../../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	BaseWizardPage = require("./BaseWizardPage");

'use strict';
function OfflineCapabilitiesWizardPage(driver, By, until, configuration, pageObjectFactory) {

	BaseWizardPage.call(this, driver, By, until, configuration, pageObjectFactory);
	this.mappings = {
		pageObjectLoadedSelector  : {type : 'css' , path : "span[title*='Offline Capabilities']"}
	};

}

OfflineCapabilitiesWizardPage.prototype = Object.create(BaseWizardPage.prototype);
OfflineCapabilitiesWizardPage.prototype.constructor = OfflineCapabilitiesWizardPage;

module.exports = OfflineCapabilitiesWizardPage;
