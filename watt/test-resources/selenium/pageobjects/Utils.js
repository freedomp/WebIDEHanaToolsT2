'use strict';

var _ = require('lodash'),
	webdriver = require('selenium-webdriver'),
	GlobalConfiguration = require("../utilities/globalConfiguration"),
	fs = require('fs'),
	mkdirp = require("mkdirp"),
	By = webdriver.By,
	until = webdriver.until;

function _deleteProjectFromWorkspace(sProjectName) {
	var done = arguments[arguments.length - 1];
	if (!window.Q) { //webide was not started so no project was created yet
		done({status: 0});
		return;
	}

	require(["sap/watt/core/Core", "sap/watt/core/PluginRegistry"], function(oCore, oPluginRegistry) {
		oCore.startup.then(function() {
			var oServiceRegistry = oPluginRegistry.$getServiceRegistry();
			var oDocumentService = oServiceRegistry.get("document");
			return oDocumentService.getDocumentByPath("/" + sProjectName).then(function(oDoc) {
				if (!oDoc) {
					done({status: 0});
					return;
				}
				return oDoc.delete().then(function() {
					done({status: 0});
				});
			});
		}).fail(function(oError) {
			done({status: 1, error: oError.message});
		}).done();
	});
}

module.exports = {

	/**
	 * Calculate the locator according to a given selectors, their type and corresponding parameters
	 *
	 * @param {type: string, path: string} oMapping - an object represent selector. type may be css xpath and id.
	 * @param {Array} aParams - array with parameters to populate the selector
	 * @returns {!webdriver.Locator} - The new locator.
	 *
	 * @name toLocator
	 * @function
	 * @public
	 */
	toLocator: function (oMapping, aParams) {

		var sParametrizedSelector = oMapping.type === "js" ? oMapping.script : oMapping.path;
		if (aParams && aParams.length) {
			_.each(aParams, function (sParam, i) {
				sParametrizedSelector = sParametrizedSelector.replace(('$' + (i + 1)), sParam);
			});
		}

		switch (oMapping.type) {
			case 'id':
				return By.id(sParametrizedSelector);
			case 'xpath':
				return By.xpath(sParametrizedSelector);
			case 'js':
				return By.js(sParametrizedSelector);
			default:
				//to support simple string - assuming css
				return By.css(sParametrizedSelector || oMapping);
		}
	},

	timeout: function (ms) {
		var d = webdriver.promise.defer();
		var start = Date.now();
		setTimeout(function () {
			d.fulfill(Date.now() - start);
		}, ms);
		return d.promise;
	},

	waitAndPerformOperation: function(driver, locator, fnOperation, timeout) {
		var waitTimeout = timeout ? timeout : 10000;
		return driver.wait(until.elementLocated(locator), waitTimeout).then(function(){
			var oElement = driver.findElement(locator);
			return fnOperation(oElement);
		}).thenCatch(function(oError) {
			if (oError.name === "StaleElementReferenceError") {
				var oElement = driver.findElement(locator);
				return fnOperation(oElement);
			}
			throw oError;
		});
	},

	decorateDriver: function (driver, until) {
		var that = this;
		if (!driver.myWaitAndClick) {
			driver.myWaitAndClick = function (locator, timeout) {
				return that.waitAndPerformOperation(driver, locator, function(oElement) {
					return oElement.click();
				}, timeout);
			};
		}

		if (!driver.myWaitAndSendKeys) {
			driver.myWaitAndSendKeys = function (var_args, locator, timeout) {
				return that.waitAndPerformOperation(driver, locator, function(oElement) {
					return oElement.sendKeys(var_args).thenCatch(function(oError) {
						if (oError.name === "UnknownError" && oError.message.indexOf("cannot focus element") !== -1) {
							console.log("sendKeys cannot focus element");
							return oElement.click().then(function(){
								return oElement.sendKeys(var_args);
							});
						}
						else {
							console.log("sendKeys Failure: " + oError);
							return driver.saveScreenshot("sendKeysError.png", that);
						}
					});
				}, timeout);
			};
		}

		if (!driver.myWaitAndDoubleClick) {
			driver.myWaitAndDoubleClick = function (locator, timeout) {
				return that.waitAndPerformOperation(driver, locator, function(oElement) {
					return new webdriver.ActionSequence(driver).doubleClick(oElement).perform();
				}, timeout);
			};
		}

		if (!driver.myWaitAndRightClick) {
			driver.myWaitAndRightClick = function (locator, timeout) {
				return that.waitAndPerformOperation(driver, locator, function(oElement) {
					return driver.rightClick(oElement);
				}, timeout);
			};
		}

		if (!driver.myWait) {
			driver.myWait = function (locator, timeout) {
				return this.wait(until.elementLocated(locator), timeout).then(function() {
					return this.findElement(locator);
				}.bind(this));
			};
		}

		if (!driver.myWaitUntilElementIsVisible) {
			driver.myWaitUntilElementIsVisible = function (locator, timeout) {
				return that.waitAndPerformOperation(driver, locator, function(oElement) {
					return driver.wait(until.elementIsVisible(oElement), timeout);
				}, timeout);
			};
		}

		if (!driver.rightClick) {
			driver.rightClick = function (oElement) {
				return new webdriver.ActionSequence(driver).click(oElement, webdriver.Button.RIGHT).perform();
			};
		}

		if (!driver.doubleClick) {
			driver.doubleClick = function (oElement) {
				return new webdriver.ActionSequence(driver).doubleClick(oElement).perform();
			};
		}

		if (!driver.saveScreenshot) {
			driver.saveScreenshot = function(filename, test) {
				if (!_.isNull(test.attachments)) {
					test.attachments = [];
				}
				var screenshotPath = process.cwd() + "/target/selenium";
				test.attachments.push("[[ATTACHMENT|" + screenshotPath + "/" + filename + "]]");
				return this.takeScreenshot().then(function(data) {
					if (!fs.existsSync(screenshotPath)) {
						//mkdirp is used for creating nested folders in fs
						mkdirp.sync(screenshotPath);
					}
					fs.writeFileSync(screenshotPath + '/' + filename, data.replace(/^data:image\/png;base64,/,''), 'base64', function(err) {
						if(err) {
							throw err;
						}
					});
				});
			};
		}

	},

	deleteProjectFromWorkspace : function(driver, sProjectName, bFailureToDeleteIsOK) {
		console.log("**********Starting workspace cleanup**********");
		console.log("Deleting project " + sProjectName + " from workspace");
		driver.manage().timeouts().setScriptTimeout(GlobalConfiguration.scriptTimeout);
		return driver.executeAsyncScript(_deleteProjectFromWorkspace, sProjectName).then(function(oResult) {
			if (oResult.status === 0) {
				console.log("Project " + sProjectName + " was deleted successfully");
				console.log("**********Cleanup has finished successfully**********");
			} else {
				if (bFailureToDeleteIsOK) {
					console.log("Project " + sProjectName + " wasn't found/deleted");
				} else {
					console.log("Failed to delete project " + sProjectName + " from workspace: " + oResult.error);
				}
			}
		});
	}
};