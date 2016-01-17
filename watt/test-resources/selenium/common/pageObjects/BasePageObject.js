var utils = require("../utilities/Utils");

'use strict';
function BasePageObject(driver, By, until, configuration, pageObjectFactory) {
	this.driver = driver;
	this.By = By;
	this.until = until;
	this.configuration = configuration;
	this.pageObjectFactory = pageObjectFactory;
	this.mappings = {};
};

BasePageObject.prototype.waitForPageToLoad = function(timeout) {
	console.log("Wait for page object " + this.constructor.name + " to load");
	var waitTimeout = timeout ? timeout : this.configuration.defaultTimeout;
	if (!this.mappings.pageObjectLoadedSelector){
		throw new Error("pageObjectLoadedSelector for " + this.constructor.name + " is not defined in mappings object");
	}
	return this.driver.myWait(utils.toLocator(this.mappings.pageObjectLoadedSelector), waitTimeout);
};

module.exports = BasePageObject;