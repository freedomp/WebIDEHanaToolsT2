'use strict';

var _ = require('lodash'),
	webdriver = require('selenium-webdriver'),
	GlobalConfiguration = require("./globalConfiguration"),
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

function _startMockServer (sRootURI, aMockRequestsObjects) {
	var done = arguments[arguments.length - 1];
	var aRequests = [];

	if (!_.isEmpty(aMockRequestsObjects)) {
		_.forEach(aMockRequestsObjects, function(oMockRequestsObject) {
			aRequests.push ({
				method: oMockRequestsObject.methodName,
				path: new window.RegExp(oMockRequestsObject.regExp),
				response: function (oXhr) {
					oXhr.respond(200, {
						"Content-Type": oMockRequestsObject.contentType
					}, oMockRequestsObject.responseContent);
				}
			});
		});
	}

	window.jQuery.sap.require("sap.ui.app.MockServer");
	var oMockServer = new window.sap.ui.core.util.MockServer({
		rootUri: sRootURI,
		requests: aRequests
	});
	oMockServer.start();
	done({status: 0});
}

module.exports = {

	//TODO: add js doc
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

		if (!driver.myLog) {
			driver.myLog = function (sMessage) {
				return driver.call(function(){
					console.log(sMessage);
				});
			};
		}

		if (!driver.myWaitAndSendKeys) {
			driver.myWaitAndSendKeys = function (var_args, locator, timeout) {
				return that.waitAndPerformOperation(driver, locator, function(oElement) {
					return oElement.sendKeys(var_args).thenCatch(function(oError) {
						console.log("sendKeys Failure: " + oError);
						return driver.saveScreenshot("sendKeysError.png", that);
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
		

		if (!driver.myRightClick) {
			driver.myRightClick = function (oElement) {
				return new webdriver.ActionSequence(driver).click(oElement, webdriver.Button.RIGHT).perform();
			};
		}

		if (!driver.myDoubleClick) {
			driver.doubleClick = function (oElement) {
				return new webdriver.ActionSequence(driver).doubleClick(oElement).perform();
			};
		}

		if (!driver.mySwitchToWindow) {
			driver.mySwitchToWindow = function (shouldCloseCurrentWindow, timeout) {
				var oCurrentWindow;
				var aHandles;
				var that = this;
				var waitTimeout = timeout ? timeout : 10000;
				return this.getWindowHandle().then(function(_oCurrentWindow) {
					oCurrentWindow = _oCurrentWindow;
					console.log("Current window - " + oCurrentWindow);
					return that.wait(function () {
						return that.getAllWindowHandles().then(function (_aHandles) {
							aHandles = _aHandles;
							console.log("windows length " + aHandles.length);
							return aHandles.length === 2;
						});
					}, waitTimeout);
				}).then(function() {
					if (aHandles){
						aHandles.forEach(function (oHandle) {
							if (oHandle !== oCurrentWindow) {
								if (shouldCloseCurrentWindow) {
									that.close();
								}
								console.log("Switch to window - " + oHandle);
								return that.switchTo().window(oHandle);
							}
						});
					}
					else {
						return that.switchTo().window(oCurrentWindow);
					}

				});
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
	},

	/**
	 * Starts asyncScripts that initiate sap.ui.app.MockServer instance by a given root URI and Mock Server Requests
	 * objects
	 * @param driver					Selenium Webdriver
	 * @param sRootURI					Root URI for the Mock Server
	 * @param aMockRequestsObjects 		Array of Mock Server requests objects with this format for a request:
	 * 									{
	 * 										methodName : sMethod,
	 * 										regExp : sRegExp,
	 * 										contentType : sContentType,
	 * 										responseContent : sResponseContent
	 * 									}
	 */
	startMockServer : function(driver, sRootURI, aMockRequestsObjects) {
		console.log("**********Starting MockServerp**********");
		driver.manage().timeouts().setScriptTimeout(GlobalConfiguration.scriptTimeout);
		return driver.executeAsyncScript(_startMockServer, sRootURI, aMockRequestsObjects).then(function(oResult) {
			if (oResult.status === 0) {
				console.log("Mock Loaded");
			} else {
				console.log("Mock Failed");
			}
		});
	},

	/**
	 * Creates a MockRequest object based on method type ("GET", "POST"...), regular experssion, content type &
	 * returned response content.
	 * @param sMethod
	 * @param sRegExp
	 * @param sContentType
	 * @param sResponseContent
	 * @returns {{methodName: *, regExp: *, contentType: *, responseContent: *}}
	 */
	createMockRequestObj : function(sMethod, sRegExp, sContentType, sResponseContent) {
		return {
			methodName : sMethod,
			regExp : sRegExp,
			contentType: sContentType,
			responseContent : sResponseContent
		};
	}
};