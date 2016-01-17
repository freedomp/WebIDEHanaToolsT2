var utils = require('../../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	BaseWizardPage = require("./BaseWizardPage");

'use strict';
function DataConnectionWizardPage(driver, By, until, configuration, pageObjectFactory) {

	BaseWizardPage.call(this, driver, By, until, configuration, pageObjectFactory);
	this.mappings = {
		pageObjectLoadedSelector  : {type : 'css' , path : "span[title*='Data Connection']"},
		systemComboBox : {type : 'css' , path : "input[placeholder='Select a system']"},
		systemComboBoxItem : {type : 'css' , path : "li[title*='$1']"},
		serviceSearchField : {type : 'css' , path : "input[type='search']"},
		servicesTree : {type : 'css' , path : 'div[role="tree"][class*="serviceCatalogStepBottomMargin"]'},
		servicesTreeItem : {type : 'css' , path : "li[title*='$1']"},
		fileSystemTab :  {type : 'css' , path : "li[title='File System']"},
		DataConnectionFileUploader :  {type : 'css' , path : 'input[type="file"]'},
		subscribeButton : {type : 'xpath' , path :'//button[.="Subscribe"]'},
		productsTree : {type : 'css' , path : 'div[role="tree"][class*="productsTree"]'},
		productsTreeItem : {type : 'css' , path : "li[title*='$1']"},
		selectProductButton : {type : 'xpath' , path :'//button[.="Select Product"]'},
		apiDescriptionText : {type : 'xpath' , path :'//textarea[.="$1"]'}
	};
}

DataConnectionWizardPage.prototype = Object.create(BaseWizardPage.prototype);
DataConnectionWizardPage.prototype.constructor = DataConnectionWizardPage;

var _selectSystemByName = function(systemName) {
	var that = this;
	return this.driver.myWaitAndSendKeys(systemName ,utils.toLocator(this.mappings.systemComboBox), this.configuration.defaultTimeout).then(function(){
		return that.driver.myWaitAndClick(utils.toLocator(that.mappings.systemComboBoxItem,[systemName]), that.configuration.defaultTimeout);
	});
};

var _selectServiceByName = function(serviceName){
	var that = this;
	return this.driver.myWait(utils.toLocator(this.mappings.servicesTree), this.configuration.defaultTimeout).then(function(){
		return that.driver.myWaitAndSendKeys(serviceName ,utils.toLocator(that.mappings.serviceSearchField), that.configuration.defaultTimeout);
	}).then(function(){
		return that.driver.myWaitAndClick(utils.toLocator(that.mappings.servicesTreeItem,[serviceName]), that.configuration.defaultTimeout);
	});
};

DataConnectionWizardPage.prototype.selectServiceFromCatalog = function(systemName, serviceName){
	console.log("selectServiceFromCatalog");
	var that = this;
	return _selectSystemByName.call(this,systemName).then(function(){
		return _selectServiceByName.call(that,serviceName);
	});
};

DataConnectionWizardPage.prototype.selectServiceFromFileSystem = function(servicePath){
	console.log("selectServiceFromFileSystem");
	var that = this;
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.fileSystemTab), this.configuration.defaultTimeout).then(function(){
		return that.driver.myWaitAndSendKeys(servicePath, utils.toLocator(that.mappings.DataConnectionFileUploader) , that.configuration.startupTimeout);
	});
};

DataConnectionWizardPage.prototype.clickSubscribeButton = function(){
	console.log("clickSubscribeButton");
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.subscribeButton), this.configuration.defaultTimeout);
};

DataConnectionWizardPage.prototype.selectAvailableProduct = function(sProductName){
	console.log("selectAvailableProduct " + sProductName);
	var that = this;
	return this.driver.myWait(utils.toLocator(this.mappings.productsTree), this.configuration.defaultTimeout).then(function(){
		return that.driver.myWaitAndClick(utils.toLocator(that.mappings.servicesTreeItem,[sProductName]), that.configuration.defaultTimeout);
	});
};

DataConnectionWizardPage.prototype.clickSelectProductButton = function(){
	console.log("clickSelectProductButton");
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.selectProductButton), this.configuration.defaultTimeout);
};

DataConnectionWizardPage.prototype.waitForAPIDescriptionText = function(sDescriptionText){
	console.log("waitForAPIDescriptionText " + sDescriptionText);
	var that = this;
	var oErrorText = utils.toLocator(this.mappings.apiDescriptionText, [sDescriptionText]);
	return this.driver.wait(this.until.elementLocated(oErrorText), this.configuration.defaultTimeout).then(function() {
		return that.driver.sleep(2000);
	});
};

module.exports = DataConnectionWizardPage;
