/**
 * Created by I058513 on 08/07/2015.
 */
"use strict";

var webdriver = require('selenium-webdriver');
var By = webdriver.By;

var HcpLoginPage = function (driver) {

	var usernameInput = driver.findElement(By.id('j_username'));
	var passwordInput = driver.findElement(By.id('j_password'));
	var loginSubmit = driver.findElement(By.id('logOnFormSubmit'));

	this.setUserName = function(username) {
		return usernameInput.sendKeys(username);
	};

	this.setPassword = function(password) {
		return passwordInput.sendKeys(password);
	};

	this.login = function() {
		return loginSubmit.click();
	};

};

module.exports = HcpLoginPage;
