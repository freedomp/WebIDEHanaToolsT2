var utils = require('../../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	BaseWizardPage = require("./BaseWizardPage");

'use strict';
function TemplateInfoWizardPage(driver, By, until, configuration, pageObjectFactory) {

	BaseWizardPage.call(this, driver, By, until, configuration, pageObjectFactory);
	this.mappings = {
		pageObjectLoadedSelector  : {type : 'css' , path : "span[title*='Template Information']"},
		templateInfoStepInputField : {type :'css' , path :  'input[placeholder="$1"]'}
	};

}

TemplateInfoWizardPage.prototype = Object.create(BaseWizardPage.prototype);
TemplateInfoWizardPage.prototype.constructor = TemplateInfoWizardPage;

TemplateInfoWizardPage.prototype.enterTemplateNameTextField = function(templateName) {
	console.log("enterTemplateNameTextField " + templateName);
	return enterTextFieldByPlaceholder.call(this, "The template name as displayed in the generation wizard", templateName);
};

TemplateInfoWizardPage.prototype.enterTemplateDescriptionTextField = function(templateDescription) {
	console.log("enterTemplateDescriptionTextField " + templateDescription);
	return enterTextFieldByPlaceholder.call(this, "A description of the artifact to be generated from the template", templateDescription);
};

TemplateInfoWizardPage.prototype.enterCategoryNameTextField = function(categoryName) {
	console.log("enterCategoryNameTextField " + categoryName);
	return enterTextFieldByPlaceholder.call(this, "The category name as displayed in the generation wizard", categoryName);
};

TemplateInfoWizardPage.prototype.enterCategoryDescriptionTextField = function(categoryDescription) {
	console.log("enterCategoryDescriptionTextField " + categoryDescription);
	return enterTextFieldByPlaceholder.call(this, "The category description as displayed in the generation wizard", categoryDescription);
};

function enterTextFieldByPlaceholder(sPlaceholder, sText) {
	var that = this;
	var inputLocator = utils.toLocator(this.mappings.templateInfoStepInputField, [sPlaceholder]);
	return this.driver.myWaitAndClick(inputLocator, this.configuration.defaultTimeout).then(function () {
		return that.driver.myWaitAndSendKeys(sText, inputLocator, that.configuration.defaultTimeout);
	}).then(function () {
		return that.driver.myWaitAndSendKeys(webdriver.Key.ENTER, inputLocator);
	});
}

module.exports = TemplateInfoWizardPage;
