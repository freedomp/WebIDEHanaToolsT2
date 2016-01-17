var utils = require('../../utilities/Utils'),
	BaseWizardPage = require("./BaseWizardPage"),
	webdriver = require('selenium-webdriver');

'use strict';
function TemplateSelectionWizardPage(driver, By, until, configuration, pageObjectFactory) {

	BaseWizardPage.call(this, driver, By, until, configuration, pageObjectFactory);

	this.mappings = {
		templateCategoryCombobox : {type : 'css', path : "#CreateGenerationWizardUI div[role='combobox']"},
		templateCategoryItem : {type : 'css', path : "#sap-ui-static ul[role='listbox'] li[title='$1']"},
		templateSelectionTitle  : {type : 'css' , path : "span[title='Template Selection']"},
		templateTile : {type : 'css' , path : "span[title='$1']"},
		versionCB : {type : "css" , path : 'input[value$="(Recommended)"]'},
		templateVersion : {type : "css" , path : 'li[title*="$1"]'},
		selectedTemplate : {type : "css" , path : '[class="sapUiUx3DSSVFlow sapUiUx3DSSVItem sapUiUx3DSSVSelected"]'}
	};

}

TemplateSelectionWizardPage.prototype = Object.create(BaseWizardPage.prototype);
TemplateSelectionWizardPage.prototype.constructor = TemplateSelectionWizardPage;

TemplateSelectionWizardPage.prototype.waitForPageToLoad = function() {
	console.log("Wait for template selection wizard step to load");
	var that = this;
	return this.driver.wait(this.until.elementLocated(utils.toLocator(this.mappings.templateSelectionTitle)), this.configuration.defaultTimeout).then(function(){
		return that.driver.wait(that.until.elementLocated(utils.toLocator(that.nextButtonSelector)), that.configuration.defaultTimeout);
	});
};

TemplateSelectionWizardPage.prototype.clickNextAndGoToBasicInfoWizardPage = function() {
	console.log("clickNextAndGoToBasicInfoWizardPage");
	var that = this;
	return this.clickNextButton().then(function(){
		return that.pageObjectFactory.createPageObjectInstance("/wizard/BasicInfoWizardPage");
	});
};


TemplateSelectionWizardPage.prototype.selectTemplateCategory = function(sCategory) {
	console.log("selectTemplateCategory");
	var that = this;
	var templateCategoryComboboxLocator = utils.toLocator(this.mappings.templateCategoryCombobox);
	var templateCategoryItemLocator = utils.toLocator(this.mappings.templateCategoryItem, [sCategory]);
	return this.driver.myWaitAndClick(templateCategoryComboboxLocator).then(function() {
		return that.driver.myWaitAndClick(templateCategoryItemLocator);
	});
};

TemplateSelectionWizardPage.prototype.selectTemplateVersion = function(sVersionTitle) {
	console.log("selectTemplateVersion");
	var that = this;
	var templateVersionComboboxLocator = utils.toLocator(this.mappings.versionCB);
	var templateVersionItemLocator = utils.toLocator(this.mappings.templateVersion, [sVersionTitle]);
	var selectedTemplateLocator = utils.toLocator(this.mappings.selectedTemplate);
	return this.driver.myWaitAndClick(templateVersionComboboxLocator, this.configuration.defaultTimeout).then(function() {
		return that.driver.myWaitAndClick(templateVersionItemLocator, that.configuration.defaultTimeout).then(function(){
			// click again the selected template just to focus out from the versions combo box. otherwise the selenium doesn't find the next button.
			return that.driver.myWaitAndClick(selectedTemplateLocator, that.configuration.defaultTimeout);
		});
	});
};

TemplateSelectionWizardPage.prototype.clickTemplate = function(templateTitle) {
	console.log("clickTemplate");
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.templateTile,[templateTitle]), this.configuration.defaultTimeout);
};

TemplateSelectionWizardPage.prototype.selectTemplateAndGoToBasicInfoWizardPage = function(sCategory, templateTitle, sVersionTitle){
	console.log("selectTemplateAndGoToBasicInfoWizardPage");
	var that = this;
	return this.selectTemplateCategory(sCategory).then(function(){
		return that.clickTemplate(templateTitle);
	}).then(function(){
		if (!sVersionTitle) {
			return that.clickNextAndGoToBasicInfoWizardPage();
		} else {
			return that.selectTemplateVersion(sVersionTitle).then(function () {
				return that.clickNextAndGoToBasicInfoWizardPage();
			});
		}
	});
};

module.exports = TemplateSelectionWizardPage;