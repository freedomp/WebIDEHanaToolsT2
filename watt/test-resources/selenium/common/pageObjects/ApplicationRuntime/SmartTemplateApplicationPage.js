var utils = require('../../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	ApplicationRuntimePage = require("./ApplicationRuntimePage"),
	_ = require('lodash');

function SmartTemplateApplicationPage(driver, By, until, configuration, pageObjectFactory) {

	ApplicationRuntimePage.call(this, driver, By, until, configuration, pageObjectFactory);

	var newMappings = {
		goButton : {type : 'css' , path : 'button[class="sapMBarChild sapMBtn sapMBtnBase sapMBtnInverted"]'},
		firstTableFirstRow : {type : 'css' , path : '#__item0-__clone0'},
		busyIndicator : {type : 'css' , path : 'div[id*="responsiveTable-busyIndicator"]'},
		secondTableFirstRow : {type : 'css' , path : '[class*="sapMListModeNone"] > tbody > [class*="sapMLIB"]:first-of-type'}
	};

	_.assign(this.mappings, newMappings);
}

SmartTemplateApplicationPage.prototype = Object.create(ApplicationRuntimePage.prototype);
SmartTemplateApplicationPage.prototype.constructor = SmartTemplateApplicationPage;

SmartTemplateApplicationPage.prototype.clickGoButton = function(){
	console.log("clickGoButton");
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.goButton), 50000);
};

SmartTemplateApplicationPage.prototype.clickFirstTableFirstRow = function(){
	console.log("clickFirstTableFirstRow");
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.firstTableFirstRow), this.configuration.defaultTimeout);
};

SmartTemplateApplicationPage.prototype.clickSecondTableFirstRow = function(){
	console.log("clickSecondTableFirstRow");
	var secondTableFirstRowLocator = utils.toLocator(this.mappings.secondTableFirstRow);
	var that = this;
	return this.driver.myWaitUntilElementIsVisible(secondTableFirstRowLocator, this.configuration.defaultTimeout).then(function(){
		return that.driver.findElement(utils.toLocator(that.mappings.busyIndicator)).then(function(element){
			//TODO: sleep should be replaced by staleness check
			//return that.driver.wait(that.until.stalenessOf(element), that.configuration.defaultTimeout);
			return that.driver.sleep(3000);
		}).thenCatch(function(){
			return webdriver.promise.fulfilled();
		}).then(function(){
			return that.driver.myWaitAndClick(secondTableFirstRowLocator, that.configuration.defaultTimeout);
		});
	});
};

module.exports = SmartTemplateApplicationPage;