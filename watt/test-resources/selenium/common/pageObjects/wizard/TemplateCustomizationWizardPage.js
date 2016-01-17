var utils = require('../../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	BaseWizardPage = require("./BaseWizardPage"),
	nodeUtil = require('util');
'use strict';
function TemplateCustomizationWizardPage(driver, By, until, configuration, pageObjectFactory) {

	BaseWizardPage.call(this, driver, By, until, configuration, pageObjectFactory);
	this.mappings = {
		templateCustomizationInput : {type : 'css' , path : "#GroupContentGrid$1 input[title='$2']"},
		templateCustomizationCheckbox : {type : 'css' , path : "#GroupContentGrid$1 label[title='$2']"},
		pageObjectLoadedSelector  : {type : 'css' , path : "span[title*='Template Customization']"},
		templateTile : {type : 'css' , path : "span[title='$1']"}
	};

};

TemplateCustomizationWizardPage.prototype = Object.create(BaseWizardPage.prototype);
TemplateCustomizationWizardPage.prototype.constructor = TemplateCustomizationWizardPage;

TemplateCustomizationWizardPage.prototype.enterTemplateCustomizationText = function(text, groupIndex, inputTitle) {
	console.log("enterTemplateCustomizationText " + text + " to " + inputTitle);
	groupIndex = groupIndex ? groupIndex : 0;
	var inputLocator = utils.toLocator(this.mappings.templateCustomizationInput, [groupIndex, inputTitle]);
	var that = this;
	return this.driver.myWaitAndClick(inputLocator, this.configuration.defaultTimeout).then(function(){
		return that.driver.sleep(1000);
	}).then(function(){
		return that.driver.myWaitAndSendKeys(text,inputLocator, that.configuration.defaultTimeout);
	}).then(function() {
		return that.driver.myWaitAndSendKeys(webdriver.Key.ENTER, inputLocator);
	});
};

TemplateCustomizationWizardPage.prototype.clickTemplateCustomizationCheckbox = function(groupIndex, labelTitle) {
	console.log("clickTemplateCustomizationCheckbox " + labelTitle);
	groupIndex = groupIndex ? groupIndex : 0;
	var labelLocator = utils.toLocator(this.mappings.templateCustomizationCheckbox, [groupIndex, labelTitle]);
	return this.driver.myWaitAndClick(labelLocator, this.configuration.defaultTimeout);
};

module.exports = TemplateCustomizationWizardPage;