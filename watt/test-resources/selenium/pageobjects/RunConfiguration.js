
var utils = require('./Utils'),
	promise = require('selenium-webdriver').promise;

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		NewRunConfigurationButton : {type : 'xpath' , path :'//button[.="New Run Configuration"]'},
		WebApplicationConfiguration : {type : 'css' , path :'li[title="Web Application"]'},
		ApplicationPath : {type : 'css' , path :'input[placeholder*="Enter path to the file you want to run"]'},
		OpenWithMockDataCheckBox :  {type : 'css' , path : "label[title='Open with mock data']"},
		RunNowButton :  {type : 'css' , path :"button[type='button'][title='Saves your configuration and runs the project'][aria-disabled=false]"},
		OpenWithFrameCheckBox : {type : 'xpath' , path :'//span[@role="checkbox"]/label[contains(text(),"Open with frame")]'}
	};

	utils.decorateDriver(driver);


	return {


		switchToWindow :function(bCloseCurrentWindow){
			var oCurrentWindow;
			var aHandles;
			return driver.getWindowHandle().then(function(_oCurrentWindow) {
				oCurrentWindow = _oCurrentWindow;
				console.log("Current window - " + oCurrentWindow);
				return driver.wait(function () {
					return driver.getAllWindowHandles().then(function (_aHandles) {
						aHandles = _aHandles;
						console.log("windows length " + aHandles.length);
						return aHandles.length === 2;
					});
				}, configuration.defaultTimeout);
			}).then(function() {
				if (aHandles){
					aHandles.forEach(function (oHandle) {
						if (oHandle !== oCurrentWindow) {
							if (bCloseCurrentWindow) {
								driver.close();
							}
							console.log("Switch to window - " + oHandle);
							return driver.switchTo().window(oHandle);
						}
					});
				}
				else {
					return driver.switchTo().window(oCurrentWindow);
				}

			});
		},

		clickOpenWithFrame : function() {
			console.log("RunConfigurationWizard: click on Open with frame");
			return driver.myWaitAndClick(utils.toLocator(mappings.OpenWithFrameCheckBox), configuration.defaultTimeout);
		},

		NewRunConfiguration : function() {
			console.log("RunConfigurationWizard: click on NewRunConfiguration");

			return driver.myWaitAndClick(utils.toLocator(mappings.NewRunConfigurationButton), configuration.defaultTimeout);
		},

		selectWebApplicationConfiguration : function() {
			console.log("RunConfigurationWizard: click on Web Application");

			return driver.myWaitAndClick(utils.toLocator(mappings.WebApplicationConfiguration), configuration.defaultTimeout);
		},

		enterApplicationPath : function(sPath) {
			console.log("RunConfigurationWizard: enterApplicationPath");
			var applicationPathLocator = utils.toLocator(mappings.ApplicationPath);
			return driver.wait(until.elementLocated(applicationPathLocator), configuration.defaultTimeout).then(function(oElement) {
				return oElement.getAttribute("value");
			}).then(function(sValue){
				if (sValue){
					return promise.fulfilled();
				}
				else {
					return driver.myWaitAndClick(applicationPathLocator, configuration.defaultTimeout).then(function(){
						return driver.myWaitAndSendKeys(sPath, applicationPathLocator);
					});
				}
			});
		},

		OpenWithMockData : function() {
			console.log("RunConfigurationWizard: click on Open with Mock Data");

			return driver.myWaitAndClick(utils.toLocator(mappings.OpenWithMockDataCheckBox), configuration.defaultTimeout);
		},
		RunNow : function() {
			console.log("RunConfigurationWizard: click on Run Now ");

			return driver.myWaitAndClick(utils.toLocator(mappings.RunNowButton), configuration.defaultTimeout);
		}
	};

};

