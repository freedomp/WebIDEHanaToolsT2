var utils = require('./Utils'),
	webdriver = require('selenium-webdriver');

module.exports = function (driver, By, until, configuration) {
	utils.decorateDriver(driver, until);
	return {
		createPageObjectInstance : function(relativePageObjectPath, pageObjectConfiguration, timeout) {
			console.log("createPageObjectInstance - " + relativePageObjectPath);
			if (!pageObjectConfiguration) {
				pageObjectConfiguration = configuration;
			}
			if (relativePageObjectPath && relativePageObjectPath[0] !== '.') {
				relativePageObjectPath = "../pageObjects" + relativePageObjectPath;
			}
			var PageObjectModule = require(relativePageObjectPath) ;
			if (PageObjectModule){
				var oPageObject = new PageObjectModule(driver, By, until, pageObjectConfiguration, this);
				if (oPageObject.waitForPageToLoad) {
					return oPageObject.waitForPageToLoad(timeout).then(function(){
						return webdriver.promise.fulfilled(oPageObject);
					});
				}
				return webdriver.promise.fulfilled(oPageObject);
			}
			return webdriver.promise.rejected("Failed to require page object from " + relativePageObjectPath);
		}
	};
};