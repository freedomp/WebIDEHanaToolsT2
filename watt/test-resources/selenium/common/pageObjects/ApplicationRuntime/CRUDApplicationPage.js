var utils = require('../../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	ApplicationRuntimePage = require("./ApplicationRuntimePage"),
	_ = require('lodash');

function CRUDApplicationPage(driver, By, until, configuration, pageObjectFactory) {

	ApplicationRuntimePage.call(this, driver, By, until, configuration, pageObjectFactory);

	var newMappings = {
		detailHeaderTitle : {type : "xpath" , path : '//div[.="$1"]'},
		appFormTitle : {type : "xpath" , path : '//h4[.="$1"]'},
		addButton : {type : 'css' , path : 'button[id*="addButton-button"]'},
		newEntityInput : {type : 'xpath' , path : '(//input[@name="$1"])'},
		newEntityLabel : {type : 'xpath' , path : '(//label[.="$1"])'},
		saveButton : {type : 'css' , path : 'button[id*="save-button"]'},
		deleteButton : {type : 'css' , path : 'button[id*="deleteButton"]'},
		editButton : {type : 'css' , path : 'button[id*="edit-button"]'},
		okButton : {type : 'xpath' , path :'//button[.="OK"]'}
	};

	_.assign(this.mappings, newMappings);
}

CRUDApplicationPage.prototype = Object.create(ApplicationRuntimePage.prototype);
CRUDApplicationPage.prototype.constructor = CRUDApplicationPage;

CRUDApplicationPage.prototype.clickAddButton = function(){
	console.log("clickAddButton");
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.addButton), this.configuration.defaultTimeout);
};

CRUDApplicationPage.prototype.waitForAppFormTitle = function(sText){
	console.log("waitForAppFormTitle " + sText);
	var appFormTitle = utils.toLocator(this.mappings.appFormTitle, [sText]);
	return this.driver.wait(this.until.elementLocated(appFormTitle), this.configuration.defaultTimeout);
};

CRUDApplicationPage.prototype.enterNewEntityText = function(text, inputTitle) {
	console.log("enterNewEntityText " + text + " to " + inputTitle);
	var inputLocator = utils.toLocator(this.mappings.newEntityInput, [inputTitle]);
	var that = this;
	return this.driver.myWaitAndClick(inputLocator, this.configuration.defaultTimeout).then(function(){
		return that.driver.sleep(1000);
	}).then(function(){
		return that.driver.myWaitAndSendKeys(text,inputLocator, that.configuration.defaultTimeout);
	}).then(function() {
		return that.driver.myWaitAndSendKeys(webdriver.Key.ENTER, inputLocator);
	});
};

CRUDApplicationPage.prototype.clickSaveButton = function(){
	console.log("clickSaveButton");
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.saveButton), this.configuration.defaultTimeout);
};

CRUDApplicationPage.prototype.clickEditButton = function(){
	console.log("clickEditButton");
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.editButton), this.configuration.defaultTimeout);
};

CRUDApplicationPage.prototype.clickDeleteButton = function(){
	console.log("clickDeleteButton");
	var that = this;
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.deleteButton), this.configuration.defaultTimeout).then(function(){
		return that.driver.sleep(1000);
	});
};

CRUDApplicationPage.prototype.clickOKButton = function(){
	console.log("clickOKButton");
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.okButton), this.configuration.defaultTimeout);
};

CRUDApplicationPage.prototype.waitForDetailHeaderTitle = function(sText){
	console.log("waitForDetailHeaderTitle " + sText);
	var that = this;
	var appFormTitle = utils.toLocator(this.mappings.detailHeaderTitle, [sText]);
	return this.driver.wait(this.until.elementLocated(appFormTitle), this.configuration.defaultTimeout).then(function() {
		return that.driver.sleep(2000);
	});
};

CRUDApplicationPage.prototype.waitForNewEntityLabel = function(sText){
	console.log("waitForNewEntityLabel " + sText);
	var appFormTitle = utils.toLocator(this.mappings.newEntityLabel, [sText]);
	return this.driver.wait(this.until.elementLocated(appFormTitle), this.configuration.defaultTimeout);
};

module.exports = CRUDApplicationPage;