var utils = require('../../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	BasePageObject = require("../BasePageObject");

'use strict';
function FinishWizardPage(driver, By, until, configuration, pageObjectFactory) {

	BasePageObject.call(this, driver, By, until, configuration, pageObjectFactory);
	this.mappings = {
		wizardContainer : {type : 'css' , path : "#CreateGenerationWizardUI"},
		wizardContainerHidden : {type : 'css' , path : "div[id='CreateGenerationWizardUI'][style*='hidden']"},
		finishButton : {type : 'css' , path :"button[type='button'][title='Finish'][aria-disabled=false]"},
		pageObjectLoadedSelector  : {type : 'css' , path : "span[title*='Confirmation']"}
	};

};

FinishWizardPage.prototype = Object.create(BasePageObject.prototype);
FinishWizardPage.prototype.constructor = FinishWizardPage;

FinishWizardPage.prototype.clickFinishButtonAndGoToDevelopmentPerspectivePage = function() {
	console.log("clickFinishButtonAndGoToDevelopmentPerspectivePage");
	var that = this;
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.finishButton), this.configuration.defaultTimeout).then(function(){
		console.log("Is wizard container present");
		return that.driver.isElementPresent(utils.toLocator(that.mappings.wizardContainer));
	}).then(function(isPresent){
		if (isPresent){
			console.log("wait for wizard container to close");
			return that.driver.wait(that.until.elementLocated(utils.toLocator(that.mappings.wizardContainerHidden)), that.configuration.defaultTimeout);
		}
		else {
			return promise.fulfilled();
		}
	}).then(function(){
		return that.pageObjectFactory.createPageObjectInstance("/DevelopmentPerspectivePage");
	});
};

module.exports = FinishWizardPage;
