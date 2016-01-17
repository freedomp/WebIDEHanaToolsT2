/**
 * Created by I058513 on 08/07/2015.
 */

var webdriver = require('selenium-webdriver');
var utils = require('../utilities/Utils');
var BasePageObject = require("./BasePageObject");

"use strict";

function HcpLoginPage(driver, By, until, configuration, pageObjectFactory) {
	BasePageObject.call(this, driver, By, until, configuration, pageObjectFactory);
	this.mappings = {
		userNameField: {type: "id", path: "j_username"},
		passwordField: {type: "id", path: "j_password"},
		submitButton: {type: "id", path: "logOnFormSubmit"}
	};
};

function _elementFoundHandler(input) {
	return function(element) {
		if(input) {
			element.sendKeys(input);
		} else {
			element.click();
		}

	};
};

function _elementNotFoundHandler(err) {
	if (err.name === "NoSuchElementError")
		console.log("HCP LOGIN: Element no found - probably SSO is in action : " + err.message);
	else {
		console.log(err.message);
	}
};

HcpLoginPage.prototype = Object.create(BasePageObject.prototype);
HcpLoginPage.prototype.constructor = HcpLoginPage;

HcpLoginPage.prototype.waitForPageToLoad = function() {
		console.log("Wait for HCP Login page to load");
		return this.driver.myWait(utils.toLocator(this.mappings.userNameField), 10000).then(
			function(){
				return webdriver.promise.fulfilled(true);
			} ,
			function(oError){
				return webdriver.promise.fulfilled(false);
			}
		);
	};

HcpLoginPage.prototype.doLoginAndGoToWebIDE = function(username, password){
	console.log("doLoginAndGoToWebIDE");
	var that = this;
	return this.enterUserNameTextField(username).then(function(){
		return that.enterPasswordTextField(password);
	}).then(function(){
		return that.clickLoginButtonAndGoToWebIDE();
	});
};

HcpLoginPage.prototype.doWaitAndLoginOrGoToWebIDE = function(username, password){
	console.log("doWaitAndLoginOrGoToWebIDE");
	var that = this;
	return this.waitForPageToLoad().then(function(bLoaded){
		if (bLoaded){
			return that.doLoginAndGoToWebIDE(username,password);
		}
		else {
			return that.pageObjectFactory.createPageObjectInstance("/WebIDE", that.configuration, 40000);
		}
	});
};

HcpLoginPage.prototype.enterUserNameTextField = function(username) {
		console.log("enterUserNameTextField");
		return this.driver.findElement(utils.toLocator(this.mappings.userNameField)).then(
			_elementFoundHandler.call(this,username) ,
			_elementNotFoundHandler
		);
	};

HcpLoginPage.prototype.enterPasswordTextField = function(password) {
		console.log("enterPasswordTextField");
		return this.driver.findElement(utils.toLocator(this.mappings.passwordField)).then(
			_elementFoundHandler.call(this,password),
			_elementNotFoundHandler
		);
	};

HcpLoginPage.prototype.clickLoginButtonAndGoToWebIDE = function() {
	console.log("clickLoginButtonAndGoToWebIDE");
	var that = this;
		return this.driver.findElement(utils.toLocator(this.mappings.submitButton)).then(
			_elementFoundHandler.call(this),
			_elementNotFoundHandler
		).then(function() {
				return that.pageObjectFactory.createPageObjectInstance("/WebIDE", that.configuration, 40000);
			});
	};


module.exports = HcpLoginPage;
