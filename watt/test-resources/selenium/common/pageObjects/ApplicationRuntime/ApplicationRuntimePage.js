var utils = require('../../utilities/Utils'),
	BasePageObject = require("../BasePageObject");

function ApplicationRuntimePage(driver, By, until, configuration, pageObjectFactory) {

	BasePageObject.call(this, driver, By, until, configuration, pageObjectFactory);

	this.mappings = {
		pageObjectLoadedSelector: {type: 'xpath', path: '//div[@role="heading"]'},
		appHeaderTextShort : {type : "xpath" , path : '//div[@role="heading"]//span[.="$1"]'}
	};
}

ApplicationRuntimePage.prototype = Object.create(BasePageObject.prototype);
ApplicationRuntimePage.prototype.constructor = ApplicationRuntimePage;

ApplicationRuntimePage.prototype.waitForAppHeaderText = function(sText){
	console.log("waitForAppHeaderText");
	var appHeader = utils.toLocator(this.mappings.appHeaderTextShort, [sText]);
	return this.driver.wait(this.until.elementLocated(appHeader), this.configuration.defaultTimeout);
};

module.exports = ApplicationRuntimePage;