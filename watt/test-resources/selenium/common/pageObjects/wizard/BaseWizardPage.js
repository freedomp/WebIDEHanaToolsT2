var utils = require('../../utilities/Utils'),
	BasePageObject = require("../BasePageObject");

'use strict';
function BaseWizardPage(driver, By, until, configuration, pageObjectFactory) {

	BasePageObject.call(this, driver, By, until, configuration, pageObjectFactory);
	this.nextButtonSelector = {type : 'css' , path :  "button[type='button'][title='Next'][aria-disabled=false]"},
	this.stepErrorText =  {type : 'css' , path : "span[title*='$1'][class*='wizardStepErrorText']"};
}

BaseWizardPage.prototype = Object.create(BasePageObject.prototype);
BaseWizardPage.prototype.constructor = BaseWizardPage;

BaseWizardPage.prototype.clickNextButton = function() {
	console.log("clickNextButton");
	var that = this;
	var nextButtonLocator = utils.toLocator(this.nextButtonSelector);
	return this.driver.myWait(nextButtonLocator, this.configuration.defaultTimeout).then(function(){
		return that.driver.myWaitAndClick(nextButtonLocator, that.configuration.defaultTimeout);
	});
};

BaseWizardPage.prototype.waitForStepErrorText = function(sErrorText){
	console.log("waitForStepErrorText");
	var oErrorText = utils.toLocator(this.stepErrorText, [sErrorText]);
	return this.driver.wait(this.until.elementLocated(oErrorText), this.configuration.defaultTimeout);
};

module.exports = BaseWizardPage;