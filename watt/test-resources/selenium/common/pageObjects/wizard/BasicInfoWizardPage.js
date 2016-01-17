var utils = require('../../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	BaseWizardPage = require("./BaseWizardPage");

'use strict';
function BasicInfoWizardPage(driver, By, until, configuration, pageObjectFactory) {

	BaseWizardPage.call(this, driver, By, until, configuration, pageObjectFactory);
	this.mappings = {
		pageObjectLoadedSelector  : {type : 'css' , path : "span[title*='Basic Information']"},
		basicInfoStepInputField : {type :'xpath' , path :  "(//input[@role='textbox'])[$1]"}
	};

}

BasicInfoWizardPage.prototype = Object.create(BaseWizardPage.prototype);
BasicInfoWizardPage.prototype.constructor = BasicInfoWizardPage;

BasicInfoWizardPage.prototype.enterProjectNameTextField = function(projectName) {
	console.log("enterProjectNameTextField " + projectName);
	return this.enterBasicInfoTextFieldByIndex(projectName,0);
};

BasicInfoWizardPage.prototype.enterBasicInfoTextFieldByIndex = function(text, inputFieldIndex) {
	console.log("enterBasicInfoTextFieldByIndex " + text + " " + inputFieldIndex);
	var that = this;
	var inputLocator = utils.toLocator(this.mappings.basicInfoStepInputField, [inputFieldIndex + 1]);
	return this.driver.myWaitAndClick(inputLocator, this.configuration.defaultTimeout).then(function(){
		return that.driver.myWaitAndSendKeys(text,inputLocator, that.configuration.defaultTimeout);
	}).then(function() {
		return that.driver.myWaitAndSendKeys(webdriver.Key.ENTER, inputLocator);
	});
};

BasicInfoWizardPage.prototype.enterBasicInfoTextFields = function(aInfoTexts) {
	console.log("enterBasicInfoTextFields");
	var aPromises = [];
	for (var i = 0; i < aInfoTexts.length; i++){
		if (aInfoTexts[i]){
			aPromises.push(this.enterBasicInfoTextFieldByIndex(aInfoTexts[i],i));
		}
	}
	return webdriver.promise.all(aPromises);
};


module.exports = BasicInfoWizardPage;
