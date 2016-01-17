/**
 * Created by I031231 on 18/08/2015.
 */
var utils = require('./Utils'),
	TestConfiguration = require("../utilities/globalConfiguration"),
	webide = require('./WebIDE');
	RepositoryBrowser = require('./RepositoryBrowser');


module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		dialogHeader : { type : 'xpath' , path : '//div[@role="dialog"]/div[@class="sapUiDlgHdr"]/*/span[@role="heading"]'},
		userInfoDialogTitle : {type : 'css' , path : 'span[role="heading"][title="User Information"]'},
		userInfoDialogOKButton : {type : 'xpath' , path : '//div[@role="dialog"]/*/div[@class="sapUiDlgBtns"]/button[text()="OK"]'},
		loginToHCPDialogTitle : {type : 'css' , path : 'span[title="Login to SAP HANA Cloud Platform"]'},
		loginToHCPDialogRememberMe : {type : 'css' , path : 'label[title="This will store your credentials for this session only"]'},
		loginToHCPDialogPassword : {type : 'css' , path : 'input[title="Enter password"]'},
		loginToHCPDialogLoginButton : {type : 'xpath' , path : '//div[@role="dialog"]/*/div[@class="sapUiDlgBtns"]/button[text()="Login"]'},
		deployToHCPDialogDeployButton : {type : 'xpath' , path : '//div[@role="dialog"]/*/div[@class="sapUiDlgBtns"]/button[text()="Deploy"]'},
		deployToHCPDialogSuccessTitle : {type : 'css' , path : 'span[title="Successfully Deployed"]'},
		deployToHCPDialogCloseButton : {type : 'xpath' , path : '//div[@role="dialog"]/*/div[@class="sapUiDlgBtns"]/button[text()="Close"]'},
		blockLayerPopupNotVisible : { type : 'css' , path :  'div[id="sap-ui-blocklayer-popup"][style*="hidden"]'}
	};

	utils.decorateDriver(driver, until);

	var webIDE = new webide(driver, By, until, configuration);
	var repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);

	return {
		deployToHCP : function(sProjectName) {
			return repositoryBrowser.selectNode(sProjectName).then(function() {
				return webIDE.goThroughMenubarItemsAndSelect(["Deploy", "Deploy to SAP HANA Cloud Platform"]);
			}).then(function(){
				console.log("wait for dialog");
				return driver.wait(until.elementLocated(utils.toLocator(mappings.dialogHeader)),configuration.startupTimeout);
			}).then(function(oDialog) {
				console.log("Get dialog text");
				return oDialog.getText();
			}).then(function(sDialogText){
				if (sDialogText === "User Information") {
					console.log("In User Info - Click OK");
					return driver.myWaitAndClick(utils.toLocator(mappings.userInfoDialogOKButton));
				}
				else {
					console.log("In Login - Uncheck remember me");
					return driver.myWaitAndClick(utils.toLocator(mappings.loginToHCPDialogRememberMe));
				}
			}).then(function(){
				console.log("Enter password");
				return driver.myWaitAndSendKeys(TestConfiguration.getParam(TestConfiguration.KEYS.PASSWORD), utils.toLocator(mappings.loginToHCPDialogPassword));
			}).then(function(){
				console.log("click login");
				return driver.myWaitAndClick(utils.toLocator(mappings.loginToHCPDialogLoginButton));
			}).then(function(){
				console.log("click deploy");
				return driver.myWaitAndClick(utils.toLocator(mappings.deployToHCPDialogDeployButton),configuration.defaultTimeout);
			}).then(function(){
				console.log("wait for deploy success");
				return driver.wait(until.elementLocated(utils.toLocator(mappings.deployToHCPDialogSuccessTitle)),configuration.defaultTimeout);
			}).then(function(){
				console.log("click close");
				return driver.myWaitAndClick(utils.toLocator(mappings.deployToHCPDialogCloseButton));
			}).then(function(){
				console.log("wait for deploy success dialog to close");
				return driver.wait(until.elementLocated(utils.toLocator(mappings.blockLayerPopupNotVisible)),configuration.defaultTimeout);
			});
		}
	};
};

