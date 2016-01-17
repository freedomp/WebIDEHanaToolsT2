'use strict';

var utils = require('./Utils'),
	webide = require('./WebIDE'),
	webdriver = require('selenium-webdriver'),
	_ = require('lodash'),
	Q = require('q');


module.exports = function (driver, By, until, configuration) {

	var webIDE = new webide(driver, By, until, configuration),

		/**
		 * selectors mapping object
		 *
		 * @type {type: string, path:string}
		 * @private
		 */
		mappings = {
			bodyBlockedW5GOpening: {type: 'CSS', path: 'body.screenBlocker'},
			bodyUnBlockedW5GOpened: {type: 'CSS', path: 'body:not(.screenBlocker)'},
			searchForControlInputPalette: {type: 'CSS', path: 'input[type="search"][placeholder="Search for control"]'},
			searchInAddControlFromOutline: {
				type: 'xpath',
				path: "//div[contains(@class,'sapWysiwygControlAddDialog')]/div/div[contains(@class,'sapUiSearchField')]/div/input"
			},
			listInAddingControlFromOutline: {
				type: 'xpath',
				path: "//div[contains(@class,'sapWysiwygControlAddDialog')]/div/div/ul"
			},
			itemFromAddingControlInOutlineList: {
				type: 'xpath',
				path: "//div[contains(@class,'sapWysiwygControlAddDialog')]//*/label[text()='$1']/.."
			},
			buttonInToolbarLeftPane: {
				type: 'xpath',
				path: "//div[@class='wysiwygLayoutLeftPaneContainer']/descendant::div[@role='toolbar']/div/button[@title='$1']"
			},
			buttonInConfirmationDialog: {
				type: 'xpath',
				path: "//span[@title='Confirmation Needed']/../../../div/div/button[contains(text(),'$1')]"
			},
			tabListOfLeftPane: {type: 'xpath', path: "//ul[@role='tablist']/li[contains(text(),'$1')]"},
			dataSetDropDown: {type: 'xpath', path: "//label[contains(.,'Data Set')]/following-sibling::div/input"},
			entitySetFromDropDown: {
				type: 'xpath',
				path: "//ul[@id='__editor0--dataSet-lb-list']/li/span[contains(.,'$1')]"
			},
			buttonInDataSetConfirmationDialog: {
				type: 'xpath',
				path: "//div[@id='MSG_CONFIRM-footer']/div/button[contains(.,'$1')]"
			},
			inputFieldForPropertyInPropertiesPane: {
				type: 'xpath',
				path: "//div[@class='sapPropertiesEditor']/descendant::label[text()='$1']/../../../div/input"
			},
			iconPickerButton: {
				type: 'xpath',
				path: "//div[@class='sapPropertiesEditor']/descendant::label[text()='Icon']/../../../div/div/img[@role='button']"
			},
			bindButtonForProperty: {
				type: "xpath",
				path: "//div[@class='sapPropertiesEditor']/descendant::label[text()='$1']/../../../div/button[@title='Binds this property.']"
			}
		};

	utils.decorateDriver(driver);

	/**
	 * Writes the given string into an input field that is found by the given locator
	 *
	 * @param {string} sInput - The string to write
	 * @param {!webdriver.Locator} locator - a locator object of the input field
	 * @return {!webdriver.promise.Promise.<void>} A promise that will be resolved
	 *     when all keys have been typed.
	 *
	 * @name _writeInInputField
	 * @function
	 * @private
	 */
	function _writeInInputField(sInput, locator) {
		console.log("writing " + sInput + " in input field");

		return driver.myWait(locator, configuration.defaultTimeout).then(function (oInputFieldElement) {
			return oInputFieldElement.click().then(function () {
				return oInputFieldElement.clear().then(function () {
					return driver.myWaitAndSendKeys(sInput, locator, configuration.defaultTimeout);
				});
			});
		});
	}


	/**
	 * Picks an icon according to the given value name through the icon picker dialog
	 *
	 * @param {string} sIconName - The new icon name to pick
	 * @returns {!webdriver.promise.Promise.<void>} A promise that will be resolved
	 *     when the click command has completed.
	 *
	 * @name _pickIcon
	 * @function
	 * @private
	 */
	function _pickIcon(sIconName) {

		console.log("Picking icon " + sIconName);

		var sSelectIconDialogSelector = "//div[contains(@class,'sapUiDlg')]/div/span/span[@title='Select Icon']/../../..",

			oMappingIconPickerSearchInputField = {
				type: "xpath",
				path: sSelectIconDialogSelector + "/div/div[contains(@class,'sapUiSearchField')]/div/input"
			},
			oRowToSelect = {
				type: "xpath",
				path: sSelectIconDialogSelector + "/div/div/div[@class='sapUiTableCnt']/descendant::tr/td/div/span[text()='$1']"
			},
			oButtonInSelectIconDialog = {
				type: "xpath",
				path: sSelectIconDialogSelector + "/descendant::button[text()='$1']"
			},
			oIconDialog = {
				type: "xpath",
				path: sSelectIconDialogSelector
			};


		var oLocator = utils.toLocator(mappings.iconPickerButton);
		console.log("Locator for button of icon" + oLocator);
		return driver.myWaitAndClick(oLocator, configuration.defaultTimeout).then(function () {
			console.log("Clicked on icon picker to open the dialog");
			return driver.myWait(utils.toLocator(oIconDialog), configuration.defaultTimeout).then(function () {
				console.log("Dialog for selecting icon is visible");
				return _writeInInputField(sIconName, utils.toLocator(oMappingIconPickerSearchInputField)).then(function () {
					return driver.myWaitUntilElementIsVisible(utils.toLocator(oMappingIconPickerSearchInputField),configuration.defaultTimeout).then(function(){
						return driver.myWaitAndClick(utils.toLocator(oRowToSelect, [sIconName]), configuration.defaultTimeout).then(function () {
							console.log("Click OK in picking icon dialog");
							return driver.myWaitAndClick(utils.toLocator(oButtonInSelectIconDialog, ['OK']), configuration.defaultTimeout);
						});
					});
				});
			});
		});
	}

	/**
	 * Binds the given property to the given data field
	 *
	 * @param {string} sProperty - The property that has to be bound
	 * @param {string} sDataField - The data field to bind to
	 * @returns {!webdriver.promise.Promise.<void>} A promise that will be resolved
	 *     when the click command has completed.
	 *
	 * @name _bindProperty
	 * @function
	 * @private
	 */
	function _bindProperty(sProperty, sDataField , bClearBefore) {



		var sDataBindingDialogSelector = "//div[contains(@class,'sapUiDlg')]/div/span/span[contains(.,'Data Binding')]/../../..",

			oMappingDataFieldSearchField = {
				type: "xpath",
				path: sDataBindingDialogSelector + "/descendant::input[@placeholder='Search for data field']"
			},

			oRowToSelect = {
				type: "xpath",
				path: sDataBindingDialogSelector + "/div/descendant::ul/li/span[contains(text(),'$1')]"
			},

			oButtonInDataBindingDialog = {
				type: "xpath",
				path: sDataBindingDialogSelector + "/descendant::button[text()='$1']"
			},
			oBindingDialog = {
				type: "xpath",
				path: sDataBindingDialogSelector
			};

		var oClearAction;
		if(bClearBefore) {
			oClearAction = function() {
				return driver.myWaitAndClick(utils.toLocator(oButtonInDataBindingDialog, ['Clear']), configuration.defaultTimeout);
			};
		} else {
			oClearAction = function() {
				return Q();
			};
		}

		return driver.myWaitAndClick(utils.toLocator(mappings.bindButtonForProperty, [sProperty]), configuration.defaultTimeout).then(function () {
			console.log("Clicked on binding button to open the dialog");
			return driver.myWait(utils.toLocator(oBindingDialog, configuration.defaultTimeout)).then(function () {
				console.log("Dialog for selecting icon is visible");
				return oClearAction().then(function(){
					return _writeInInputField(sDataField, utils.toLocator(oMappingDataFieldSearchField)).then(function () {
						return driver.myWaitUntilElementIsVisible(utils.toLocator(oRowToSelect, [sDataField]),configuration.defaultTimeout).then(function(){
							console.log("Entered " + sDataField + " in search field");
							return driver.myWaitAndDoubleClick(utils.toLocator(oRowToSelect, [sDataField]), configuration.defaultTimeout).then(function () {
								console.log("Selected entry from the results list");
								return driver.myWaitAndClick(utils.toLocator(oButtonInDataBindingDialog, ['OK']), configuration.defaultTimeout);
							});
						});
					});
				});
			});
		});
	}

	/**
	 * Writes console log in case control deletion was done on an empty control so that confirmation dialog doesn't pop up.
	 *
	 * @param {object} oError - Error that is thrown while waiting confirmation dialof of delete
	 *
	 * @name _confirmDeleteNotFound
	 * @function
	 * @private
	 */
	function _confirmDeleteNotFound(oError) {
		if (oError.message.indexOf("Waiting element") !== -1) {
			console.log("No confirmation dialog upon deletion since the control is empty" + oError.message);
		}
	}

	/**
	 * Expands the properties pane if it is not already expanded
	 *
	 * @returns {!webdriver.promise.Promise.<void>} A promise that will be resolved
	 *     when the click command has completed.
	 *
	 * @name _expandPropertiesSection
	 * @function
	 * @private
	 */
	function _expandPropertiesSection() {

		console.log("Verify properties section is expanded");
		var oPropertiesSection = {
			type: 'xpath',
			path: "//div[@class='wysiwygLayoutRightPaneContainer']/descendant::span[text()='$1']/../../../../div[contains(@class,'sapUiAcdSectionHdr') and @aria-expanded='$2']"
		};

		return driver.myWait(utils.toLocator(oPropertiesSection, ['Properties', 'true']), configuration.defaultTimeout).then(null, function () {
			return driver.myWaitAndClick(utils.toLocator(oPropertiesSection, ['Properties', 'false']), configuration.defaultTimeout);
		});
	}

	/**
	 * Changes a certain property for already selected control
	 *
	 * @param {string} sProperty - The property to change
	 * @param {string} sNewValue - The new value of the property
	 * @param {boolean} bToBindProperty - True if the property being changed by binding and False otherwise.
	 *
	 * @returns {!webdriver.promise.Promise.<void>} A promise that will be resolved when the sleep has finished.
	 *
	 * @name _changeProperty
	 * @function
	 * @private
	 */
	function _changeProperty(sProperty, sNewValue, bToBindProperty) {

		var oPromise;

		if (sProperty === "Icon") {
			oPromise = _pickIcon(sNewValue);
		}
		else if (bToBindProperty) {
			oPromise = _bindProperty(sProperty, sNewValue , true);
		}
		else {
			oPromise = _writeInInputField(sNewValue, utils.toLocator(mappings.inputFieldForPropertyInPropertiesPane, [sProperty]));
		}

		return oPromise.then(function () {
			console.log("Finished updating " + sProperty);
			return driver.sleep(1 * 1000);
		});
	}


	return {

		/**
		 * Open Layout editor
		 * @param {string} sPath - The path to the view to open with Layout Editor (not including the view name)
		 * @param {string} sFileName - The view file name
		 * @returns {!webdriver.promise.Promise<T>} A promise that will be fulfilled
		 *     with the first truthy value returned by the condition function, or
		 *     rejected if the condition times out.
		 *
		 * @name openLayoutEditorForFile
		 * @function
		 * @public
		 */
		openLayoutEditorForFile: function (sPath, sFileName) {
			console.log("Open Layout Editor");
			return webIDE.getRepositoryTreeFileElement(sPath, sFileName).then(function (oFileElement) {
				return driver.rightClick(oFileElement);
			}).then(function () {
				return webIDE.selectFromContextMenu("Open With/Layout Editor");
			}).then(function () {
				//Wait until the W5G starts opening and this happens when the class .screenBlocker is ADDED to the body
				return driver.wait(until.elementLocated(utils.toLocator(mappings.bodyBlockedW5GOpening)), configuration.startupTimeout);
			}).then(function () {
				//Wait until the W5G finishes opening and this happens when the class .screenBlocker is REMOVED from the body
				return driver.wait(until.elementLocated(utils.toLocator(mappings.bodyUnBlockedW5GOpened)), configuration.startupTimeout);
			});
		},

		/**
		 * This function assumes that the Layout Editor is already open and the controls pane is visible
		 * Responsible for searching control from the palette
		 *
		 * @param {string} sControlName - The name of the UI5 control as it appears in the palette for example: "Pull To Refresh"
		 * @returns {!webdriver.promise.Promise.<void>} A promise that will be resolved
		 *     when the sleep has finished.
		 *
		 * @name searchForControlInPalette
		 * @function
		 * @public
		 */
		searchForControlInPalette: function (sControlName) {
			return _writeInInputField(sControlName, utils.toLocator(mappings.searchForControlInputPalette));
		},


		/**
		 * Finds the control in outline tree according to the given path to that control.
		 * Note: If there are few controls with the same name in the same level - the first one is returned by default
		 * or the mentioned position will be returned.
		 *
		 * @param {string} sPath - The path in the tree including aggregations. e.g. for "view1.view.xml/sap.m.Page/content/sap.m.Button"
		 *                           the first button (in case of multiple) will be returned.
		 *                           for "view1.view.xml/sap.m.Page/content/sap.m.Button(3)" the third button will be returned in case more then 1.
		 * @returns {Promise}
		 *
		 * @name findControlInOutline
		 * @function
		 * @public
		 */
		findControlInOutline: function (sPath) {
			var aPathTitles = sPath.split("/");

			if (!aPathTitles.length) {
				return Q(null);
			}

			function _buildLocatorForFileOrFolderByPath(aPathTitles) {
				var sPart, i, sXpath = "//", rRegExPosition = /\((\d+)\)$/, iPosition, aResult;

				if (!aPathTitles.length) {
					return "";
				}

				for (i = 0; i < aPathTitles.length; i++) {
					iPosition = 1; //Assume to take the first if there are multiple
					sPart = aPathTitles[i];
					if (i === 0) { //Expecting first node to be the view
						sXpath += "li[@tag='__xmlview0']/span[text()='" + sPart + "']/..";
					}
					else {
						sXpath += "/following-sibling::ul";
						sXpath += "/li";
						aResult = rRegExPosition.exec(sPart);
						if (aResult) { //The part include position in parentheses /sap.m.Button(1)/
							iPosition = aResult[1];
							sPart = sPart.substring(0, sPart.indexOf("("));//Remove the parentheses
						}
						sXpath += "[./span[text()='" + sPart + "']][" + iPosition + "]";
					}
				}
				return sXpath;
			}

			var oPromise = Q();

			_.forEach(aPathTitles, function (sPathTitle, index) {

				oPromise = oPromise.then(function () {
					var aCurrentPath = _.slice(aPathTitles, 0, index + 1),
						sPath = _buildLocatorForFileOrFolderByPath(aCurrentPath),
						sCurrentLocator = utils.toLocator({
							type: 'xpath',
							path: sPath
						}),
						oSpanLocator = utils.toLocator({
							type: 'xpath',
							path: sPath + "/span"
						});

					//console.log("sCurrentLocator " + sCurrentLocator);
					//Selecting the span is a fix where selecting the li element is not enough - it doesn't really select
					return driver.myWaitAndClick(oSpanLocator, configuration.defaultTimeout).then(function () {
							//console.log("Clicked on ---> " + oSpanLocator);
							if (aPathTitles.length - 1 === index) { //return last element
								return driver.myWait(sCurrentLocator);
							}
							else {
								//console.log("sending keys arrow right!!");
								return driver.myWaitAndSendKeys(webdriver.Key.ARROW_RIGHT, sCurrentLocator, configuration.defaultTimeout);
							}
						}
					);
				});
			});
			return oPromise;
		},


		/**
		 * Deletes control in the given path from the outline
		 *
		 * @param {string} sPath - The path to the control to delete
		 * @returns {!webdriver.promise.Promise.<void>} A promise that will be resolved
		 *     when the sleep has finished
		 *
		 * @name deleteControlFromOutline
		 * @function
		 * @public
		 */
		deleteControlFromOutline: function (sPath) {

			console.log("Deleting control " + sPath + " from outline...");
			var that = this, locator;
			return driver.switchTo().defaultContent()
				.then(function () {
					console.log("Click on outline tab");
					return driver.myWaitAndClick(utils.toLocator(mappings.tabListOfLeftPane, ['Outline']), configuration.defaultTimeout);
				})
				.then(function () {
					console.log("Find path " + sPath + " in outline");
					return that.findControlInOutline(sPath);
				}).then(function () {
					console.log("Click on delete button");
					return driver.myWaitAndClick(utils.toLocator(mappings.buttonInToolbarLeftPane, ['Delete selected control.']), configuration.defaultTimeout);
				}).then(function () {
					console.log("Confirm deletion if relevant");
					locator = utils.toLocator(mappings.buttonInConfirmationDialog, ['Yes']);
					return driver.myWaitAndClick(locator, 1500)
						.then(function () {
							return driver.sleep(1 * 1000);
						}, _confirmDeleteNotFound);
				});
		},

		/**
		 * Changes the data set from the drop down list to the given data set
		 *
		 * @param {string} sDataSet - The new data set
		 * @returns {!webdriver.promise.Promise.<void>} A promise that will be resolved
		 *     when the click command has completed.
		 *
		 * @name changeDataSetForViewInDropDown
		 * @function
		 * @public
		 */
		changeDataSetForViewInDropDown: function (sViewName, sDataSet) {
			var that = this;
			return driver.switchTo().defaultContent()
				.then(function () {
					console.log("Click on outline tab");
					return driver.myWaitAndClick(utils.toLocator(mappings.tabListOfLeftPane, ['Outline']), configuration.defaultTimeout);
				})
				.then(function () {
					console.log("Select View from the outline");
					return that.findControlInOutline(sViewName);
				})
				.then(function () {
					return _expandPropertiesSection();
				})
				.then(function () {
					console.log("Select Data set drop down to open it");
					return driver.myWaitAndClick(utils.toLocator(mappings.dataSetDropDown, configuration.defaultTimeout));
				}).then(function () {
					console.log("Select the " + sDataSet + " Data set");
					return driver.myWaitAndClick(utils.toLocator(mappings.entitySetFromDropDown, [sDataSet]), configuration.defaultTimeout);
				}).then(function () {
					console.log("Click OK in the data set warning dialog");
					return driver.myWaitAndClick(utils.toLocator(mappings.buttonInDataSetConfirmationDialog, ['OK']), configuration.defaultTimeout);
				}).then(function () {
					return driver.sleep(2 * 1000); //after popup
				});
		},

		/**
		 * Add a new control to the given destination path from the outline
		 *
		 * @param {string} sDestinationPath - The path represent the location to add the new control
		 * @param {string} sControlToAdd - The full name of the new control to add. e.g. sap.m.Button
		 * @returns {!webdriver.promise.Promise.<void>} A promise that will be resolved
		 *     when the click command has completed.
		 *
		 * @name addControlFromOutline
		 * @function
		 * @public
		 */
		addControlFromOutline: function (sDestinationPath, sControlToAdd) {
			var that = this;
			var sNiceControlName = _.startCase(_.last(sControlToAdd.split(".")));
			console.log("Adding " + sControlToAdd + " to " + sDestinationPath);
			return driver.switchTo().defaultContent()
				.then(function () {
					console.log("Click on outline tab");
					return driver.myWaitAndClick(utils.toLocator(mappings.tabListOfLeftPane, ['Outline']), configuration.defaultTimeout);
				}).then(function () {
					console.log("Find " + sDestinationPath + " in outline and select it");
					return that.findControlInOutline(sDestinationPath);
				}).then(function () {
					console.log("Click on Add in toolbar to open dialog");
					return driver.myWaitAndClick(utils.toLocator(mappings.buttonInToolbarLeftPane, ['Add control.']), configuration.defaultTimeout);
				}).then(function () {
					console.log("Adding " + sControlToAdd);
					return _writeInInputField(sControlToAdd, utils.toLocator(mappings.searchInAddControlFromOutline));
				}).then(function () {
					return driver.myWaitUntilElementIsVisible(utils.toLocator(mappings.itemFromAddingControlInOutlineList, [sNiceControlName]),configuration.defaultTimeout);
				}).then(function () {
					var oLocatorTest = utils.toLocator(mappings.itemFromAddingControlInOutlineList, [sNiceControlName]);
					console.log("Waiting to click on  " + oLocatorTest);
					return driver.myWaitAndClick(oLocatorTest, configuration.defaultTimeout);
				});

		},

		/**
		 * Selects the given control from the outline and verify the properties is expanded and visible
		 *
		 * @param {string} sControlPath - The control to be selected
		 * @returns {!webdriver.promise.Promise.<void>} A promise that will be resolved
		 *     when the click command has completed.
		 *
		 * @name selectControlAndOpenItsProperties
		 * @function
		 * @public
		 */
		selectControlAndOpenItsProperties: function (sControlPath) {
			var that = this;

			return driver.switchTo().defaultContent()
				.then(function () {
					console.log("Click on outline tab");
					return driver.myWaitAndClick(utils.toLocator(mappings.tabListOfLeftPane, ['Outline']), configuration.defaultTimeout);
				}).then(function () {
					return that.findControlInOutline(sControlPath);
				}).then(function () {
					return _expandPropertiesSection();
				});
		},


		/**
		 * Choose a control and change the property with a new value. It can be by changing value, binding or icon picking.
		 *
		 * @param {string} sControlPath - The control which its property is being changed
		 * @param {string} sProperty - The property to change
		 * @param {string} sNewValue - The new value of the property
		 * @param {boolean} bToBindProperty - True if the property being changed by binding and False otherwise.
		 *
		 * @returns {!webdriver.promise.Promise.<void>} A promise that will be resolved when the sleep has finished.
		 *
		 * @name changePropertyOfControl
		 * @function
		 * @public
		 */
		changePropertyOfControl: function (sControlPath, sProperty, sNewValue, bToBindProperty) {
			var that = this;

			console.log(bToBindProperty ? "Binding" : "Changing" + " property " + sProperty + " of " + sControlPath + " to " + sNewValue);

			return that.selectControlAndOpenItsProperties(sControlPath).then(function () {
				return _changeProperty(sProperty, sNewValue, bToBindProperty);
			});
		},


		/**
		 * Changing several properties of the given control
		 *
		 * @param {string} sControlPath - The path to the control its properties being changed
		 * @param {Array<{propertyName:string, newValue:string, bBind:boolean}>} aPropertiesToChange - Array representing the properties to change.
		 *
		 * @returns {!webdriver.promise.Promise.<void>} A promise that will be resolved when the sleep has finished.
		 *
		 * @name changePropertiesForControl
		 * @function
		 * @public
		 */
		changePropertiesForControl: function (sControlPath, aPropertiesToChange) {
			var that = this;

			return that.selectControlAndOpenItsProperties(sControlPath).then(function () {

				var oCurrentPromise = Q();
				_.each(aPropertiesToChange, function (oProperty) {
					oCurrentPromise = oCurrentPromise.then(function () {
						return _changeProperty(oProperty.propertyName, oProperty.newValue, oProperty.bBind);
					});
				});

				return oCurrentPromise;
			});
		}
	};

};

