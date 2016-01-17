'use strict';

var utils = require('./Utils'),
	webide = require('./WebIDE'),
	webdriver = require('selenium-webdriver'),
	chai = require('chai'),
	expect = chai.expect;

module.exports = function (driver, By, until, configuration) {
	var mappings = {
		importFromAbapDialog : {type: 'CSS', path: 'span[title="Select Application from SAPUI5 ABAP Repository"]'},
		importFromAbapDialogSystemName : {type: 'CSS', path: '.sapUiRespGridBreak.sapUiRespGridSpanL12.sapUiRespGridSpanM12.sapUiRespGridSpanS12 input'},
		importFromAbapTableNotEmpty : {type: 'css', path:'.sapUiTable.sapUiTableCHdr.sapUiTableCommons.sapUiTableEdt.sapUiTableSelModeSingle.sapUiTableShNoDa.sapUiTableVScr'},
		importFromAbapDialogSearchApplicationInput : {type: 'css', path: 'input[title="Type application name or description"]'},
		importFromAbapApplicationRow : {type: 'css', path: '.sapUiTableTdFirst span[title="$1"]'},
		importFromAbapDialogOKButton : {type : 'xpath' , path : '//div[@role="dialog"]/*/div[@class="sapUiDlgBtns"]/button[text()="OK" and @aria-disabled="false"]'}
	};

	var webIDE = new webide(driver, By, until, configuration);

	utils.decorateDriver(driver);

	return {

		/**
		 * This method assumes that there will NOT be a browser authentication popup since it cannot be handled
		 * in selenium. The solution is to add authentication for the destination in case there is a browser popup.
		 *
		 * @param sBSPName Name of the BSP system as it should be added to the dialog
		 * @param sAppName	Name of the application as it appears in the "Application" column in the dialog
		 */
		importFromBSP: function(sBSPName, sAppName) {
			//Start by clearing the console since we depend on its content to know when the import finishes.
			//Clearing it is needed in case the string we look for already exists in the console output
			//from previous runs.
			console.log("Clearing web IDE console ");
			return webIDE.clearWebIDEConsole().then(function() {
				//Open the console since we will use it's output to decide when the import finishes
				console.log("Opening web IDE console");
				return webIDE.openWebIDEConsole();
			}).then(function() {
				console.log("Clicking in the menu to start import");
				return webIDE.goThroughMenubarItemsAndSelect(["File" , "Import" , "Application from SAPUI5 ABAP Repository"]);
			}).then(function() {
				//Wait for the import from BSP dialog to open
				console.log("Waiting for the BSP dialog");
				return driver.myWait(utils.toLocator(mappings.importFromAbapDialog) , configuration.startupTimeout);
			}).then(function(){
				console.log("Waiting for the system name in the BSP dialog");
				return driver.myWait(utils.toLocator(mappings.importFromAbapDialogSystemName) , configuration.startupTimeout);
			}).then(function(systemNameInputControl) {
				console.log("Clicking the system name input");
				return systemNameInputControl.click().then(function() {
					console.log("Clearing the system name input");
					return systemNameInputControl.clear().then(function() {
						//TODO assert that the system exists!!
						console.log("Setting BSP name in the system name input");
						return systemNameInputControl.sendKeys(sBSPName).then(function() {
							console.log("Enter in the system name input");
							return systemNameInputControl.sendKeys(webdriver.Key.ENTER);
						});
					});
				});
			}).then(function() {
				//Wait until the table of the applications appear
				console.log("Waiting for applications table");
				return driver.myWait(utils.toLocator(mappings.importFromAbapTableNotEmpty) , configuration.startupTimeout);
			}).then(function() {
				console.log("Waiting for app search input");
				return driver.myWait(utils.toLocator(mappings.importFromAbapDialogSearchApplicationInput) , configuration.startupTimeout);
			}).then(function(searchApplicationInput) {
				console.log("Clicking the search input");
				return searchApplicationInput.click().then(function() {
					console.log("Clearing the search input");
					return searchApplicationInput.clear().then(function() {
						//TODO assert that the application exists!!
						console.log("Setting app name in the search input");
						return searchApplicationInput.sendKeys(sAppName).then(function() {
							console.log("Enter in the search input");
							return searchApplicationInput.sendKeys(webdriver.Key.ENTER);
						});
					});
				});
			}).then(function() {
				console.log("Waiting for application row");
				return driver.myWait(utils.toLocator(mappings.importFromAbapApplicationRow, [sAppName]) , configuration.startupTimeout);
			}).then(function(applicationLineInTable) {
				console.log("Clicking app in row");
				return applicationLineInTable.click();
			}).then(function() {
				console.log("Waiting for OK button");
				return driver.myWait(utils.toLocator(mappings.importFromAbapDialogOKButton) , configuration.startupTimeout);
			}).then(function(okButton) {
				console.log("Clicking OK button");
				return okButton.click();
			}).then(function() {
				console.log("Waiting for import to finish (in console)");
				var locator = utils.toLocator(webIDE.mappings.consoleInfoOutputContains, ["Import of " + sAppName + " has finished"]);
				return driver.myWait(locator , configuration.defaultTimeout * 4);
			}).then(function() {
				return driver.sleep(1*1000);
			}).thenCatch(function(oError) {
				console.log("Error: " + oError);
				expect(true).to.equal(false);
			});
		}
	};

};

