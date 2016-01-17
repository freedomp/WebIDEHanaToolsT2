/**
 * Created by I059304 on 06/09/2015.
 */
"use strict";

var webdriver = require('selenium-webdriver');
var By = webdriver.By;

var HanaLoginPage = function (driver) {

	var usernameInput = driver.findElement(By.name('username'));
	var passwordInput = driver.findElement(By.name('password'));
	var loginSubmit = driver.findElement(By.name('submit'));

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

module.exports = HanaLoginPage;
