'use strict';

var _ = require('lodash');
var webdriver = require('selenium-webdriver'),
	TestConfiguration = require("../utilities/TestConfiguration"),
	fs = require('fs'),
	mkdirp = require('mkdirp'),
	deep = require('deep-diff').diff,
	By = webdriver.By,
	http = require('http'),
	until = webdriver.until;


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

	checkModuleName: function(sChangeType,diff,eName,eType){
		return this.isModuleExists(sChangeType,diff,function (entry) {
			return entry.name === eName && entry.type === eType;
		});
	},
	checkModuleresource: function(sChangeType, diff,resEname,resEtype){
		return this.isResourceAdded(sChangeType, diff, function (entry) {
			return entry.type === resEtype && entry.name === resEname;
		});
	},
	isModuleExists: function (sChangeType, aTheDiff, fPredicate) {
// locate the index corrisponding to modules
	var modulesIndex = _.findKey(aTheDiff, function (chr) {
		return chr.kind === sChangeType && _.findKey(chr.path, function (modules) {
				return modules === "modules";
			});
	});

	var dbModuleIndex;
	if (modulesIndex) {
		var theDiffJson = aTheDiff[modulesIndex];
		if (aTheDiff[modulesIndex].hasOwnProperty('item')) {
			theDiffJson = aTheDiff[modulesIndex]['item'];
			return fPredicate(theDiffJson['rhs']);
		}
		dbModuleIndex = _.findKey(theDiffJson['rhs'], function (name) {
			return fPredicate(name);
		});
	}
	return dbModuleIndex ? true : false;
},

isResourceAdded: function (sChangeType, aTheDiff, fPredicate) {
// locate the index corrisponding to resources
	var resourceIndex = _.findKey(aTheDiff, function (change) {
		return change.kind === sChangeType && _.findKey(change.path, function (modules) {
				return modules === "resources";
			});
	});

	var hdiContainerIndex;
	if (resourceIndex) {
		var theDiffJson = aTheDiff[resourceIndex];
		if (aTheDiff[resourceIndex].hasOwnProperty('item')) {
			theDiffJson = aTheDiff[resourceIndex]['item'];
			return fPredicate(theDiffJson['rhs']);
		}
		var hdiContainerIndex = _.findKey(theDiffJson['rhs'], function (name) {
			return fPredicate(name);
		});
	}
	return hdiContainerIndex ? true : false;
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
					return oElement.sendKeys(var_args);
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
				if (!_.isNull(test.attachments )) {
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
        
        seconds : function(nMilliseconds){
            return nMilliseconds * 1000;
        }
};
