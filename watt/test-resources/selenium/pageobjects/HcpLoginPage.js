/**
 * Created by I058513 on 08/07/2015.
 */
"use strict";

var webdriver = require('selenium-webdriver');
var By = webdriver.By;

var HcpLoginPage = function (driver) {

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
	};

	this.setUserName = function(username) {
		return driver.findElement(By.id('j_username')).then(
			_elementFoundHandler(username) ,
			_elementNotFoundHandler
		);
	};

	this.setPassword = function(password) {
		return driver.findElement(By.id('j_password')).then(
			_elementFoundHandler(password) ,
			_elementNotFoundHandler
		);
	};

	this.login = function() {
		return driver.findElement(By.id('logOnFormSubmit')).then(
			_elementFoundHandler() ,
			_elementNotFoundHandler
		);
	};

};

module.exports = HcpLoginPage;
