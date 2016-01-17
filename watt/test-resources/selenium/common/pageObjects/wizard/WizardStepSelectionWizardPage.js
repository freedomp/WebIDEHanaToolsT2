var utils = require('../../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	BaseWizardPage = require("./BaseWizardPage");

'use strict';
function WizardStepSelectionWizardPage(driver, By, until, configuration, pageObjectFactory) {

	BaseWizardPage.call(this, driver, By, until, configuration, pageObjectFactory);
	this.mappings = {
		pageObjectLoadedSelector  : {type : 'css' , path : "span[title*='Wizard Step Selection']"}
	};

}

WizardStepSelectionWizardPage.prototype = Object.create(BaseWizardPage.prototype);
WizardStepSelectionWizardPage.prototype.constructor = WizardStepSelectionWizardPage;

module.exports = WizardStepSelectionWizardPage;
