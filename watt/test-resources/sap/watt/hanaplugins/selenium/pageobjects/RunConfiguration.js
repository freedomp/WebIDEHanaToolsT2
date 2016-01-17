var utils = require('./Utils'),
	promise = require('selenium-webdriver').promise;
var webdriver = require('selenium-webdriver');
var Key = webdriver.Key;
module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		NewRunConfigurationButton : {type : 'xpath' , path :'//button[@title="Add configuration"]'},
		nodeJSApplication1 : {type : 'xpath' ,path:'//span[@class="sapUiLbxITxt"][text()="Node.js Application"]'},
		WebApplicationConfiguration : {type : 'css' , path :'li[title="Web Application"]'},
		ApplicationPath : {type : 'xpath' , path :'//input[@placeholder="Enter the path to the file you want to run."]'},
		OpenWithMockDataCheckBox :  {type : 'css' , path : "label[title='Open with mock data']"},
		saveRunButton :  {type : 'xpath' , path :'//button[@type="button"][text()="Save and Run"][@aria-disabled="false"]'},
		OpenWithFrameCheckBox : {type : 'xpath' , path :'//span[@role="checkbox"]/label[contains(text(),"Open with frame")]'},
		nodeJsApplication : {type : 'css' , path :'li[title="Node.js Application"]'},
		configurationNameLabel : {type :'xpath' , path : '//div[contains(@class ,"sapUiRGLContainer")]/h4[.="Configuration Name"]'},
		chooseApplicationToRun : {type : 'xpath' , path :'//div[@class="sapUiTableCell"]/label[text()="$1"]'},
		chooseApplicationOkButton : {type : 'xpath' , path :'//div[@class="sapUiDlgBtns"]/button[text()="OK"]'}
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
			console.log("RunConfigurationWizard: click on +");
			var addNodeJsApp=utils.toLocator(mappings.NewRunConfigurationButton);
			var nodeJSApp=utils.toLocator(mappings.nodeJSApplication1);
			return driver.myWaitAndClick(addNodeJsApp, configuration.defaultTimeout).thenCatch(function (oError) {
				return driver.myWaitAndClick(addNodeJsApp, configuration.defaultTimeout);
			}).then(function () {
				return driver.myWaitAndClick(nodeJSApp, configuration.defaultTimeout).thenCatch(function (oError) {
					return driver.myWaitAndClick(nodeJSApp, configuration.defaultTimeout);
				});
				return;});

		},

		selectWebApplicationConfiguration : function() {
			console.log("RunConfigurationWizard: click on Web Application");

			return driver.myWaitAndClick(utils.toLocator(mappings.WebApplicationConfiguration), configuration.defaultTimeout);
		},
		selectNodeJsApplicationConfiguration : function() {
			console.log("RunConfigurationWizard: click on Node.js Application");

			return driver.myWaitAndClick(utils.toLocator(mappings.nodeJsApplication), configuration.defaultTimeout);
		},
		chooseFileToRun : function(filename) {
			console.log("Choose File To Run Node.js");
			var applicationLocator = utils.toLocator(mappings.chooseApplicationToRun,[filename]);
			return driver.findElement(applicationLocator).then(function() {
				return driver.myWaitAndClick(applicationLocator, configuration.defaultTimeout).then(function () {
					return driver.myWaitAndClick(chooseApplicationOkButton, configuration.defaultTimeout);

				});
			}, function(err) {
				console.log('Console is exist');
				return;});
		},
		enterApplicationPath : function(sPath) {
			console.log("RunConfigurationWizard: enterApplicationPath");
			var applicationPathLocator = utils.toLocator(mappings.ApplicationPath);
			driver.sleep(2 * 1000);
			driver.wait(until.elementLocated(utils.toLocator(mappings.ApplicationPath)), configuration.defaultTimeout);
			return driver.findElement(utils.toLocator(mappings.ApplicationPath), configuration.defaultTimeout).then(function (oElement) {
				return oElement.getAttribute("value");
			}).then(function(sValue){
				if (sValue){
					console.log("Value is: "+ sValue);
					return driver.myWaitAndSendKeys(webdriver.Key.chord(webdriver.Key.CONTROL, "a"), applicationPathLocator, configuration.defaultTimeout).thenCatch(function (oError) {
						return driver.myWaitAndSendKeys(webdriver.Key.chord(webdriver.Key.CONTROL, "a"), applicationPathLocator, configuration.defaultTimeout);
					}).then(function () {
						return driver.myWaitAndSendKeys(webdriver.Key.DELETE, utils.toLocator(mappings.ApplicationPath)).then(function () {
							return driver.myWaitAndClick(applicationPathLocator, configuration.defaultTimeout).then(function () {
								return driver.myWaitAndSendKeys(sPath, applicationPathLocator).then(function () {
									return driver.myWaitAndSendKeys(Key.ENTER, applicationPathLocator);
								});
							});
						});
					});
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
			driver.wait(until.elementLocated(utils.toLocator(mappings.saveRunButton)), configuration.defaultTimeout);
			return driver.findElement(utils.toLocator(mappings.saveRunButton), configuration.defaultTimeout).then(function (oElement) {
				return driver.myWaitAndClick(utils.toLocator(mappings.saveRunButton), configuration.defaultTimeout).thenCatch(function (oError) {
					return driver.myWaitAndClick(utils.toLocator(mappings.saveRunButton), configuration.defaultTimeout);
				});
			});

		},
		clickOnConfigurationNameLabel : function() {
			console.log("RunConfigurationWizard: click on ApplicationFilePath Label ");

			return driver.myWaitAndClick(utils.toLocator(mappings.configurationNameLabel), configuration.defaultTimeout);
		}
	};

};