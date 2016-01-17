'use strict';
var webdriver = require('selenium-webdriver');

var utils = require('./Utils'),
	webide = require('./WebIDE'),
	chai = require('chai'),
	chaiWebdriver = require('chai-webdriver'),
	Q = require('q'),
	_ = require('lodash');

module.exports = function (driver, By, until, configuration) {
	var mappings = {
		previewFrame: {type: 'id', path: 'previewApp'},
		outline: {type: '', path: ''},
		applicationFrame: {type: 'id', path: 'display'},
		ui5ViewClass: {type: 'css', path: '.sapUiView'},
		controlWithId: {type: 'xpath', path: '//*[contains(@id, "$1")]'},
		extensibilityDropDown: {type: 'css', path: '#ExtDropDown .dropdown-toggle'},
		errorDialogOkButton: {type: 'css', path: '#CA_VIEW_MSG--BTN_OK'},
		extensibilityMode: {type: 'id', path: 'LOCK_UI'},
		extOptionsMenuButton: {type: 'id', path: 'extOptionsMenuButton'},
		extensionsDropdownOption: {type: 'xpath', path: '//div[@role="menu"]/ul/li/div[text()="$1"]'},
		afterExtensionDialogButton: {type: 'xpath', path: '//div[@role="dialog"]//button[text()="$1"]'},
		closeButton: {type: 'css', path: '#ExtensionPreviewContainer-close'},
		outlineNode: {type: 'css', path: '//li[@role="treeitem"]/span[text()="$1"]'},
		filterOptionsDropdown: {type: 'id', path: 'filterOptionsDropdownBox'},
		showExtensibleElements: {type: 'id', path: 'showExtensibleElements'},
		showExtensionPoints: {type: 'id', path: 'showExtensionPoints'},
		showAllElements: {type: 'id', path: 'showAllElements'},
		viewElement: {type: 'xpath', path: '//li[contains(@title, "sap.ui.core:view") or contains(@title, "sap.ui.core.mvc:view")][span[text()="$1"]]'},
		extPointElement: {type: 'xpath', path: '//li[contains(@title, "sap.ui.core:extensionpoint") or contains(@title, "sap.ui.core.mvc:extensionpoint")][span[text()="$1"]]'},
		viewElementStartsWith : {type:'xpath', path: '//li[contains(@title, "sap.ui.core:view") or contains(@title, "sap.ui.core.mvc:view")][span[starts-with(text(),"$1")]]'},
		getElement: {
			type: 'xpath', path: '//li[contains(@title, "$1")]/span[text()="$2"]'
		},
		getSelectedNode: {type: 'xpath', path: '//li[contains(@class,"sapUiTreeNodeSelected")]'},
		nodeUnderView: {type: 'xpath', path: '//li[contains(@title, "sap.ui.core:view")][span[text()="$1"]]/following-sibling::ul//li[contains(@title, "$2")][span[text()="$3"]]'},
		buttonInExtPane: {type: 'xpath', path: '//div[contains(@class,"extPane")]/descendant::button/span[text()="$1"]/..'},
		extPaneContextMenu: {type: "css", path:".sapWattContextMenu .sapUiMnuItm[title='$1']"},
		bodyBlockedW5GOpening: {type: 'CSS', path: 'body.screenBlocker'},
		bodyUnBlockedW5GOpened: {type: 'CSS', path: 'body:not(.screenBlocker)'}
	};

	var webIDE = new webide(driver, By, until, configuration);
	chai.use(chaiWebdriver(driver));
	utils.decorateDriver(driver, until);

	return {
		waitForPane: function() {
			console.log("wait for the pane to appear");
			return driver.myWait(utils.toLocator(mappings.previewFrame), configuration.longTimeout);
		},

		openExtPane: function () {
			var that = this;
			console.log("About to open extensibility pane");
			return webIDE.goThroughMenubarItemsAndSelect(["Tools", "Extensibility Pane"], true).then(function () {
				return that.waitForPane();
			}).then(function () {
				// Go back to main window DOM
				return driver.switchTo().defaultContent();
			});
		},

		openExtPaneWithMock: function () {
			var that = this;
			console.log("About to open extensibility pane with mock data");
			return webIDE.goThroughMenubarItemsAndSelect(["Tools", "Extensibility Pane with Mock Data"], true).then(function () {
				return that.waitForPane();
			}).then(function () {
				// Go back to main window DOM
				return driver.switchTo().defaultContent();
			});
		},

		closeExtPane: function () {
			return driver.switchTo().defaultContent().then(function () {
				return driver.sleep(1000);
			}).then(function () {
				console.log("Closing Extensibility Pane");
				return driver.myWaitAndClick(utils.toLocator(mappings.closeButton), configuration.defaultTimeout).then(function () {
					return driver.sleep(1000);
				});
			});
		},

		waitForAppToLoad: function () {
			console.log("Switching to preview app");
			return driver.switchTo().frame("previewApp").then(function () {
				console.log("switching to application iFrame");
				return driver.sleep(1000);
			}).then(function () {
				return driver.switchTo().frame("display");
			}).then(function () {
				// Check view is loaded
				console.log("Check that view is loaded");
				return driver.myWait(utils.toLocator(mappings.ui5ViewClass), configuration.defaultTimeout);
			}).then(function () {
				console.log("application is running, switch back to Web IDE iFrame");
				return driver.switchTo().defaultContent();
			});
		},

		extensibilityMode: function () {
			return driver.switchTo().frame("previewApp").then(function () {
				return driver.sleep(2000);
			}).then(function () {
				console.log("going into Extensibility Mode");
				return driver.myWaitAndClick(utils.toLocator(mappings.extensibilityDropDown), configuration.defaultTimeout).then(function () {
					return driver.myWaitAndClick(utils.toLocator(mappings.extensibilityMode), configuration.defaultTimeout);
				});
			}).then(function() {
				return driver.switchTo().defaultContent();
			});
		},

		waitForOptionalErrorMessage: function() {
			console.log("Waiting for optional error message");
			return driver.myWaitAndClick(utils.toLocator(mappings.errorDialogOkButton), 3000).then(function() {
				console.log("Error message skipped");
			}, function(oError) {
				if (oError.name === "NoSuchElementError") {
					console.log("No error message. Continue as usual");
				}
			});
		},

		// If we get an error message in the application (e.g. service isn't available),
		// skip it (by clicking the OK button)
		skipOptionalErrorMessage: function() {
			var that = this;
			return that._switchToAppFrame().then(function() {
				return driver.sleep(1000);
			}).then(function () {
				return that.waitForOptionalErrorMessage();
			}).then(function () {
				return driver.switchTo().defaultContent();
			});
		},

		_switchToAppFrame: function() {
			return driver.switchTo().frame("previewApp").then(function () {
				return driver.sleep(1000);
			}).then(function () {
				return driver.switchTo().frame("display");
			}).then(function () {
				return driver.sleep(1000);
			});
		},

		// Execute hide extension command
		_createHideExtension: function(sAfterAction) {
			var that = this;
			return driver.switchTo().defaultContent().then(function () {
				return driver.sleep(1000);
			}).then(function () {
				console.log("Open extensions drop down");
				return driver.myWaitAndClick(utils.toLocator(mappings.extOptionsMenuButton), configuration.defaultTimeout);
			}).then(function () {
				console.log("Select 'Hide Control' from menu");
				return driver.myWaitAndClick(utils.toLocator(mappings.extensionsDropdownOption, ["Hide Control"]), configuration.defaultTimeout);
			}).then(function () {
				switch (sAfterAction) {
					case "refresh" :
						console.log("Refresh the application");
						return driver.myWaitAndClick(utils.toLocator(mappings.afterExtensionDialogButton, ["Refresh"]), configuration.defaultTimeout * 2).then(function() {
							return that.skipOptionalErrorMessage();
						});
					case "go to code":
						return driver.myWaitAndClick(utils.toLocator(mappings.afterExtensionDialogButton, ["Open Extension Code"]), configuration.defaultTimeout);
					default :
						return driver.myWaitAndClick(utils.toLocator(mappings.afterExtensionDialogButton, ["Close"]), configuration.defaultTimeout);
				}
			});
		},

		// Validate that a given control (specified with a locator) isn't present (i.e. it got hidden)
		_validateControlIsHidden: function(sAfterAction, oHiddenElementLocator) {
			// If the application is refreshed, see if element is still present
			if (sAfterAction === "refresh") {
				return this._switchToAppFrame().then(function () {
						// Check view is loaded
						console.log("wait for app to load after refresh");
						return driver.myWait(utils.toLocator(mappings.ui5ViewClass), configuration.defaultTimeout);
				}).then(function () {
					console.log("app loaded, verifying control is hidden");
					return driver.findElements(oHiddenElementLocator, configuration.defaultTimeout).then(function (aControls) {
						chai.expect(aControls).to.have.length(0);
						return driver.switchTo().defaultContent();
					});
				});
			} else {
				return driver.switchTo().defaultContent();
			}
		},

		// Hide control specified by an ID
		hideControlById: function (sControlId, sAfterAction) {
			var that = this;
			return that._switchToAppFrame().then(function() {
				return driver.myWaitAndClick(utils.toLocator(mappings.controlWithId, [sControlId]), configuration.defaultTimeout).then(function () {
					console.log("found the control - " + sControlId);
				});
			}).then(function() {
				return that._createHideExtension(sAfterAction);
			}).then(function () {
				return that._validateControlIsHidden(sAfterAction, utils.toLocator(mappings.controlWithId, [sControlId]));
			});
		},

		// Hide control specified generally by a selector (e.g. {type: 'xpath', path: '//li'})
		hideControlBySelector: function (oSelector, sAfterAction) {
			var that = this;
			var oLocator = utils.toLocator(oSelector);
			return that._switchToAppFrame().then(function() {
				return driver.myWaitAndClick(oLocator, configuration.defaultTimeout).then(function () {
					console.log("found the control. Selector: " + oSelector.path);
				});
			}).then(function() {
				return that._createHideExtension(sAfterAction);
			}).then(function () {
				return that._validateControlIsHidden(sAfterAction, oLocator);
			});
		},

		extendView: function(sViewName, sExtensionId, sExtensionPoint, aNodesTitleAndText, sAfterAction) {
			var element;
			console.log("search filter drop down element and click on it");
			return driver.myWaitAndClick(utils.toLocator(mappings.filterOptionsDropdown), configuration.defaultTimeout).then(function () {
				console.log("filter drop down element is opened");
				console.log("search showExtensibleElements filter, and click on it");
				return driver.myWaitAndClick(utils.toLocator(mappings.showExtensibleElements), configuration.defaultTimeout);
			}).then(function() {
				console.log("showExtensibleElements filter is selected");
				var sCurrentLocator = utils.toLocator(mappings.viewElement, [sViewName]);
				element = driver.findElement(sCurrentLocator);
				return driver.myWaitAndClick(sCurrentLocator, configuration.defaultTimeout);
			}).then(function() {
				console.log("found the view - " + sViewName);
				return element.sendKeys(webdriver.Key.ARROW_RIGHT);
			}).then(function() {
				var oPromise = Q();
				// Open the nodes until (not including) the extension point
				console.log("Open the nodes until (not including) the extension point");
				_.forEach(aNodesTitleAndText, function(oTitleAndText) {
					oPromise = oPromise.then(function() {
						var sTitle = oTitleAndText.title;
						var sText = oTitleAndText.text;
						console.log("Handling node with title: '" + sTitle + "' and text: '" + sText + "'");
						driver.sleep(2 * 1000);
						var sCurrentLocator = utils.toLocator(mappings.nodeUnderView, [sViewName, sTitle, sText]);
						element = driver.findElement(sCurrentLocator);
						return driver.myWaitAndClick(sCurrentLocator, configuration.defaultTimeout).then(function () {
							return element.sendKeys(webdriver.Key.ARROW_RIGHT);
						});
					});
				});

				return oPromise;
			}).then(function() {
				console.log("Waiting for the extension point");
				return driver.myWaitAndClick(utils.toLocator(mappings.getElement, [sExtensionPoint, sExtensionId]), configuration.defaultTimeout);
			}).then(function() {
				console.log("found" + sExtensionId);
				return driver.myWaitAndClick(utils.toLocator(mappings.extOptionsMenuButton), configuration.defaultTimeout);
			}).then(function() {
				console.log("Waiting for extension drop-down option");
				return driver.myWaitAndClick(utils.toLocator(mappings.extensionsDropdownOption, ["Extend View/Fragment"]), configuration.defaultTimeout);
			}).then(function() {
				return driver.myWaitAndClick(utils.toLocator(mappings.afterExtensionDialogButton, [sAfterAction]), configuration.defaultTimeout);
			}).then(function() {
				driver.sleep(5 * 1000);// Let the extension creation end
			});
		},

		selectNodeInOutline: function(sViewName, sExtensionId, sNodeType, aNodesTitleAndText) {
			var element;
			var sCurrentLocator = utils.toLocator(mappings.viewElement, [sViewName]);
			element = driver.findElement(sCurrentLocator);
			return driver.myWaitAndClick(sCurrentLocator, configuration.defaultTimeout).then(function () {
				console.log("found the view - " + sViewName);
				return element.sendKeys(webdriver.Key.ARROW_RIGHT);
			}).then(function() {
				var oPromise = Q();
				// Open the nodes until (not including) the extension point
				console.log("Open the nodes until (not including) the extension point");
				_.forEach(aNodesTitleAndText, function(oTitleAndText) {
					oPromise = oPromise.then(function() {
						var sTitle = oTitleAndText.title;
						var sText = oTitleAndText.text;
						console.log("Handling node with title: '" + sTitle + "' and text: '" + sText + "'");
						var sCurrentLocator = utils.toLocator(mappings.nodeUnderView, [sViewName, sTitle, sText]);
						element = driver.findElement(sCurrentLocator);
						return driver.myWaitAndClick(sCurrentLocator, configuration.defaultTimeout).then(function () {
							return element.sendKeys(webdriver.Key.ARROW_RIGHT);
						});
					});
				});

				return oPromise;
			}).then(function() {
				console.log("Waiting for the extension point");
				return driver.myWaitAndClick(utils.toLocator(mappings.getElement, [sNodeType, sExtensionId]), configuration.defaultTimeout);
			}).then(function() {
				console.log("found" + sExtensionId);
			});
		},

		changeFilter: function(sFilterId) {
			console.log("search filter drop down element and click on it");
			return driver.myWaitAndClick(utils.toLocator(mappings.filterOptionsDropdown), configuration.defaultTimeout).then(function () {
				console.log("filter drop down element is opened");
				switch(sFilterId){
					case "showExtensionPoints":
						console.log("search " + sFilterId + " filter, and click on it");
						return driver.myWaitAndClick(utils.toLocator(mappings.showExtensionPoints), configuration.defaultTimeout);
					default :
						console.log("selecting default filter");
						return driver.myWaitAndClick(utils.toLocator(mappings.showAllElements), configuration.defaultTimeout);
				}

			}).then(function() {
					console.log(sFilterId + " filter is selected");
					driver.sleep(5 * 1000);
			});
		},

		getSelectedElement: function() {
			var element;
			console.log("check if the element is selected");
			var sCurrentLocator = utils.toLocator(mappings.getSelectedNode);
			return driver.findElement(sCurrentLocator).then(function (element) {
				console.log("found element, it is selected");
				return element;
			}, function(oError) {
				console.log("no element is selected");
				return null;
			});
		},

		/**
		 * Assuming extensibility pane is open, this method replaces a view with an empty one and then perform the given action.
		 *
		 * @param {string} sViewName - The name of the view which is being replaced to an empty view
		 * @param {string} sAfterAction - The name of the button (=action) in the Application Changed dialog. e.g. Refresh
		 *
		 * @return {!webdriver.promise.Promise.<void>} A promise that will be resolved
		 *     when the click command has completed.
		 *
		 * @name replaceWithEmptyView
		 * @function
		 * @public
		 */
		replaceWithEmptyView: function(sViewName, sAfterAction) {
			var oLocator, oElement;

			console.log("Start replace " + sViewName + " view with an empty view");
			console.log("locator is " + utils.toLocator(mappings.filterOptionsDropdown));
			return driver.myWaitAndClick(utils.toLocator(mappings.filterOptionsDropdown), configuration.defaultTimeout).then(function(){
				console.log("Clicked on filter drop down to open it");
				console.log("locator is " + utils.toLocator(mappings.showExtensibleElements));
				return driver.myWaitAndClick(utils.toLocator(mappings.showExtensibleElements), configuration.defaultTimeout);
			}).then(function(){
				console.log("Clicking on " + sViewName + " view");
				oLocator = utils.toLocator(mappings.viewElement, [sViewName]);
				return driver.myWaitAndClick(oLocator, configuration.defaultTimeout);
			}).then(function() {
				console.log("Right click on the view" + oLocator);
				oElement = driver.findElement(oLocator);
				return driver.rightClick(oElement, configuration.defaultTimeout);
			}).then(function() {
				console.log("Wait for context menu to be opened");
				driver.myWaitUntilElementIsVisible(utils.toLocator(mappings.extPaneContextMenu, ['Replace with empty view']), configuration.defaultTimeout);
			}).then(function() {
				console.log("Selecting from the context menu - Replace with empty view");
				return driver.myWaitAndClick(utils.toLocator(mappings.extPaneContextMenu, ['Replace with empty view']), configuration.defaultTimeout);
			}).then(function() {
				console.log("Selecting " + sAfterAction + " In the Application Dialog");
				return driver.myWaitAndClick(utils.toLocator(mappings.afterExtensionDialogButton, [sAfterAction]), configuration.defaultTimeout);
			});
		},

		/**
		 * Open a given view, after it has been changed, through the extensibility pane with Layout Editor.
		 * Note that after a view has been changed its name is changing to include a "Custom" suffix
		 * which is being added automatically at the end of the given view name.
		 *
		 * @param {string} sViewName - The *original* name of the view.
		 * @return {!webdriver.promise.Promise<T>} A promise that will be fulfilled
		 *     with the first truthy value returned by the condition function, or
		 *     rejected if the condition times out.
		 *
		 * @name openWithLayoutEditor
		 * @function
		 * @public
		 */
		openWithLayoutEditor: function(sViewName) {
			console.log("Clicking on " + sViewName + "Custom view");
			var oElement, oLocator = utils.toLocator(mappings.viewElementStartsWith, [sViewName +"Custom"]);
			return driver.myWaitAndClick(oLocator, configuration.defaultTimeout).then(function(){
				oElement = driver.findElement(oLocator);
				console.log("Right click on the view" + oLocator);
				oElement = driver.findElement(oLocator);
				return driver.rightClick(oElement, configuration.defaultTimeout);
			}).then(function() {
				console.log("Selecting from the context menu - Open with Layout Editor");
				var oLocator = utils.toLocator(mappings.extPaneContextMenu, ['Open Layout Editor']);
				return driver.myWaitAndClick(oLocator, configuration.defaultTimeout);
			}).then(function () {
				//Wait until the W5G starts opening and this happens when the class .screenBlocker is ADDED to the body
				return driver.wait(until.elementLocated(utils.toLocator(mappings.bodyBlockedW5GOpening)), configuration.defaultTimeout);
			}).then(function () {
				//Wait until the W5G finishes opening and this happens when the class .screenBlocker is REMOVED from the body
				return driver.wait(until.elementLocated(utils.toLocator(mappings.bodyUnBlockedW5GOpened)), configuration.defaultTimeout);
			});
		}
	};
};
