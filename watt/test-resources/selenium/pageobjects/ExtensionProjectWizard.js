'use strict';
var webdriver = require('selenium-webdriver');

var utils = require('./Utils'),
	webide = require('./WebIDE'),
	extPane = require('./ExtensibilityPane'),
	chai = require('chai'),
	chaiWebdriver = require('chai-webdriver'),
	Q = require('q');

module.exports = function (driver, By, until, configuration) {
	var mappings = {
		selectApplicationButton : {type : 'css', path : "#ExtensionProjectWizard_SelectAppMenuButton span.sapUiBtnTxt"},
		fromBspButton : { type : 'xpath', path : "//div[@role='menu']/ul/li/div[text()='SAPUI5 ABAP Repository']"},
		selectFromBspDialog : {type: 'css', path: 'span[title="Select Application from SAPUI5 ABAP Repository"]'},
		selectFromBspDialogSystemName : {type: 'css', path: '#fioriexttemplate_remoteDialog .sapUiTfCombo input[class="sapUiTf sapUiTfInner"]'},
		selectFromBspFilledTable : {type: 'css', path: '#fioriexttemplate_remoteDialog div[class="sapUiTable sapUiTableCHdr sapUiTableCommons sapUiTableEdt sapUiTableSelModeSingle sapUiTableShNoDa sapUiTableVScr"]'},
		selectFromBspSearchField : {type: 'css', path: '#fioriexttemplate_remoteDialog div[title="Type application name or description"] input[type="search"]'},
		selectFromBsApplicationRow : {type: 'css', path: '#fioriexttemplate_remoteDialog .sapUiTableTdFirst span[title="$1"]'},
		selectFromBspDialogOKButton : {type : 'xpath', path: '//div[@id="fioriexttemplate_remoteDialog"]//button[text()="OK"][@aria-disabled="false"]'},
		nextButton : {type : 'css' , path :  "button[type='button'][title='Next'][aria-disabled=false]"},
		/**
		 * Locator for the next button in the create extension project wizard. It locates the button only when the
		 * button is enabled.
		 */
		nextButtonEnabled : {type : 'css' , path :  "button[type='button'][title='Next'][aria-disabled=false]"},
		/**
		 * Locates the finish button of the create extension project wizard.
		 */
		finishButton : {type : 'css' , path :"button[type='button'][title='Finish'][aria-disabled=false]"},

		wizardContainer : {type : 'css' , path : "#CreateGenerationWizardUI"},
		/**
		 * Exists when the first step of the extension project wizard is open
		 */
		wizardOpen : {type : 'xpath', path : '//div/span[@class="fontSpecial wizardH2 sapUiTv sapUiTvAlignLeft" and .="Original Application and Name"]'},
		/**
		 * unselect the "open extensibility pane" checkbox
		 */
		unselectOpenExtPaneCheckbox: {type: 'xpath', path: "//label[text()='Open extension project in extensibility pane']"}
	};

	var webIDE = new webide(driver, By, until, configuration);
	var extensibilityPane = new extPane(driver, By, until, configuration);
	chai.use(chaiWebdriver(driver));
	utils.decorateDriver(driver, until);

	return {
		selectFromBspDialog : function (sBspName, sAppName) {
			console.log("ExtensionProjectWizard: click on select application");
			return driver.sleep(1*1000).then(function() {
				return driver.myWaitAndClick(utils.toLocator(mappings.selectApplicationButton), configuration.defaultTimeout);
			}).then(function () {
				return driver.sleep(1*1000);
			}).then(function () {
				console.log("Waiting for the abap repository option");
				return driver.myWaitAndClick(utils.toLocator(mappings.fromBspButton), configuration.defaultTimeout);
			}).then(function () {
				console.log("Waiting for the abap repository dialog");
				return driver.myWait(utils.toLocator(mappings.selectFromBspDialog) , configuration.startupTimeout);
			}).then(function () {
				console.log("Waiting for the abap repository system name");
				return driver.myWait(utils.toLocator(mappings.selectFromBspDialogSystemName) , configuration.startupTimeout);
			}).then(function (systemNameInputControl) {
				console.log("ExtensionProjectWizard: select BSP system - " + sBspName);
				return systemNameInputControl.click().then(function() {
					return systemNameInputControl.clear().then(function() {
						return systemNameInputControl.sendKeys(sBspName).then(function() {
							return systemNameInputControl.sendKeys(webdriver.Key.ENTER);
						});
					});
				});
			}).then(function () {
				return driver.myWait(utils.toLocator(mappings.selectFromBspFilledTable) , configuration.startupTimeout);
			}).then(function () {
				return driver.myWait(utils.toLocator(mappings.selectFromBspSearchField) , configuration.startupTimeout);
			}).then(function (searchField) {
				console.log("ExtensionProjectWizard: search for application - " + sAppName);
				return searchField.click().then(function() {
					return searchField.clear().then(function() {
						return searchField.sendKeys(sAppName).then(function() {
							return searchField.sendKeys(webdriver.Key.ENTER);
						});
					});
				});
			}).then(function () {
				return driver.myWait(utils.toLocator(mappings.selectFromBsApplicationRow, [sAppName]) , configuration.startupTimeout);
			}).then(function(applicationLineInTable) {
				return applicationLineInTable.click();
			}).then(function() {
				return driver.myWait(utils.toLocator(mappings.selectFromBspDialogOKButton) , configuration.startupTimeout);
			}).then(function(okButton) {
				console.log("ExtensionProjectWizard: application selected");
				return okButton.click();
			}).thenCatch(function(oError) {
				console.log("Error: " + oError);
				chai.expect(true).to.equal(false);
			});
		},

		next : function() {
			console.log("ExtensionProjectWizard: click on next");
			return driver.myWaitAndClick(utils.toLocator(mappings.nextButton), configuration.defaultTimeout);
		},

		finish : function() {
			console.log("ExtensionProjectWizard: click on finish");
			return driver.myWaitAndClick(utils.toLocator(mappings.finishButton), configuration.defaultTimeout);
		},

		/**
		 * Opens the extension project wizard
		 * @returns {promise}
		 */
		openExtensionProjectWizard: function () {
			console.log("starting to go through menu items and select");
			return webIDE.goThroughMenubarItemsAndSelect(["File", "New", "Extension Project"], true).then(function () {
				console.log("wait for the wizard to appear");
				return driver.wait(until.elementLocated(utils.toLocator(mappings.wizardOpen)), configuration.defaultTimeout);
			});
		},

		/**
		 * Creates an extension project (using the extension project wizard) for an application in BSP.
		 * @param {string} sAppName - The name of the application that should be extended
		 */
		extendProjectFromBSP: function (sAppName) {
			var that = this;
			console.log("About to open ext' proj' wizard");
			return that.openExtensionProjectWizard().then(function () {
				return that.selectFromBspDialog("ABAP Backend System - for testing!", sAppName);
			}).then(function () {
				return that.next();
			}).then(function () {
				console.log("uncheck 'open extensibility pane' checkbox");
				return driver.myWaitAndClick(utils.toLocator(mappings.unselectOpenExtPaneCheckbox), configuration.defaultTimeout);
			}).then(function() {
				return that.finish();
			}).then(function() {
				console.log("Wait for extension project creation to end");
				var locator = utils.toLocator(webIDE.mappings.consoleInfoOutputContains, ["Extension project created"]);
				return driver.myWait(locator, configuration.longTimeout);
			}).then(function() {
				return driver.sleep(1*1000);
			}).then(function() {
				console.log("Select the extension project in the repo browser");
				return webIDE.selectProjectInRepositoryBrowser(sAppName + "Extension");
			});
		},


		/**
		 * Creates an extension project (using the extension project wizard) for a project from the workspace.
		 * This function assumes that the project that should be extended already exists in the workspace
		 * @param {string} sProjectName - The name of the project that should be extended
		 */
		extendProjectFromWorkspace: function (sProjectName) {
			var that = this;
			//TODO check if this assertion really works...
			//var pathToProjectElement = webIDE.mappings.projectInRepositoryBrowserNode.path.replace("$1", sProjectName);
			//chai.expect(pathToProjectElement).dom.to.exist();

			//If the project is selected in the repository browser then the first step is already filled with the
			//relevant info
			//TODO : can we use Q? It simply makes thing work!!
			return Q().then(function() {
				return webIDE.selectProjectInRepositoryBrowser(sProjectName);
			}).then(function() {
				//TODO check why this is needed... I couldn't figure it out but something runs asynchronously and changes the selection or something...
				return driver.sleep(1*1000);
			}).then(function () {
				console.log("selected the project: " + sProjectName);
				return that.openExtensionProjectWizard();
			}).then(function() {
				//Wait for the next button to be enabled
				console.log("started waiting for the next button to be enabled and clicking on it");
				return driver.myWaitAndClick(utils.toLocator(mappings.nextButtonEnabled), configuration.defaultTimeout);
			}).then(function () {
				console.log("uncheck 'open extensibility pane' checkbox");
				return driver.myWaitAndClick(utils.toLocator(mappings.unselectOpenExtPaneCheckbox), configuration.defaultTimeout);
			}).then(function() {
				console.log("started waiting for the finish button to be enabled and clicking on it");
				return driver.myWaitAndClick(utils.toLocator(mappings.finishButton), configuration.defaultTimeout);
			}).then(function() {
				console.log("Waiting for the extension project to be selected in the repository browser");
				return driver.wait(until.elementLocated(utils.toLocator(webIDE.mappings.projectSelectedInRepositoryBrowserNode, [sProjectName + "Extension"])), configuration.defaultTimeout);
			}).then(function() {
				return driver.sleep(1*1000);
			});
		}
	};
};
