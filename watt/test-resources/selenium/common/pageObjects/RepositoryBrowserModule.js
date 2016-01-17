var utils = require('../utilities/Utils');
var webdriver = require('selenium-webdriver');
var promise = webdriver.promise;
var BasePageObject = require("./BasePageObject");
var _ = require('lodash');

'use strict';
function RepositoryBrowserModule(driver, By, until, configuration, pageObjectFactory) {
	BasePageObject.call(this, driver, By, until, configuration, pageObjectFactory);
	this.mappings = {
		pageObjectLoadedSelector: {type: 'css', path: '.sapWattRepositoryBrowser .sapUiTreeList > .sapUiTreeNode[title="Local"]'},
		rootNode: {type: 'css', path: '.sapWattRepositoryBrowser .sapUiTreeList > .sapUiTreeNode[title="Local"]'},
		deleteConfirmationDialogOkButton: {type: 'css', path: '#MSG_CONFIRM--btn-OK'},

		contextMenuRootElement : {type : 'xpath' , path : '//div[contains(@class ,"sapWattContextMenu")]/*/li[div/text()="$1"]'},
		contextMenuSubItem : {type : 'xpath' , path : '//div[contains(@class ,"WattMainMenuSub")]/*/li[div/text()="$1"]'},

		menubarItemRootElement : {type : 'xpath' , path : '//div[@id="menubar"]//span[text()="$1"]'},
		menubarItemSubElement : {type : 'xpath' , path : '//div/*/li[@role="menuitem"]/div[text()="$1"]'},
		menubarItemSubElementContains : {type : 'xpath' , path : '//div/*/li[@role="menuitem"]/div[contains(text(),"$1")]'},

		importDialogFileInput : {type : 'css' , path : '.sapUiDlg .sapUiDlgCont input[type="file"]'},
		importDialogImportToInput : {type: 'xpath' , path : '//div[label/text()="Import to"]/following-sibling::div/input'},
		importDialogOKButton : {type : 'xpath' , path : '//div[@role="dialog"]/*/div[@class="sapUiDlgBtns"]/button[text()="OK"]'},
		importOverrideConfirmButton : {type: 'id' , path: 'MSG_CONFIRM--btn-OK'},

		progressBarStart : {type: 'css' , path : '#ideProgressBar.animate'},
		progressBarStop : {type: 'css' , path : '#ideProgressBar:not(.animate)'}
	};
}

RepositoryBrowserModule.prototype = Object.create(BasePageObject.prototype);
RepositoryBrowserModule.prototype.constructor = RepositoryBrowserModule;

function _createNodeCssSelector(sContainingFolderCssSelector, sNodeTitle) {
	return sContainingFolderCssSelector + ' + .sapUiTreeChildrenNodes > ' +
		'.sapUiTreeNode[title="' + sNodeTitle + '"]';
}

function _expand (aNodesTitles, sRootFolderCssSelector) {
	var sCurrentFolderLocator = utils.toLocator({type: 'css', path: sRootFolderCssSelector});
	var that = this;
	return this.driver.myWaitAndClick(sCurrentFolderLocator).then(function() {
		return that.driver.myWaitAndSendKeys(webdriver.Key.ARROW_RIGHT, sCurrentFolderLocator);
	}).then(function() {
		//recursion stop condition
		if (aNodesTitles.length === 0) {
			return sCurrentFolderLocator;
		}
		var sNextFolderCssSelector = _createNodeCssSelector(sRootFolderCssSelector, aNodesTitles[0]);
		aNodesTitles.shift();
		//FIXME - workaround for a bug where a folder is expanded without it's content
		//We need to find a condition that will replace sleep
		return that.driver.sleep(500).then(function() {
			return _expand.call(that, aNodesTitles, sNextFolderCssSelector);
		});
	});
}

function _goThroughContextMenuAndSelect(aTitles) {
	if(!aTitles.length) return;

	var rootItemTitle = aTitles[0];
	var rootItemTitleLocator = utils.toLocator(this.mappings.contextMenuRootElement , [ rootItemTitle ]);

	var callbacks = [];

	var that = this;

	_.each(aTitles.splice(1).reverse() , function(sTitle){

		var oCallbackFn;

		if(callbacks.length) {
			oCallbackFn = callbacks[callbacks.length - 1];
		}

		var newCallback = function() {
			var item = utils.toLocator(that.mappings.contextMenuSubItem , [ sTitle ]);
			if(oCallbackFn) {
				return that.driver.myWaitAndClick(item, that.configuration.defaultTimeout).then(oCallbackFn);
			} else {
				return that.driver.myWaitAndClick(item, that.configuration.defaultTimeout);
			}
		};

		callbacks.push(newCallback);

	});

	return callbacks.length ? this.driver.myWaitAndClick(rootItemTitleLocator,this.configuration.defaultTimeout).then(callbacks[callbacks.length - 1]) : this.driver.myWaitAndClick(rootItemTitleLocator,this.configuration.defaultTimeout).done();
}


RepositoryBrowserModule.prototype.expand = function(sPath) {
	console.log("expand " + sPath);
	var aNodesTitles = [];
	if (sPath){
		aNodesTitles = sPath.split('/');
	}
	return _expand.call(this,aNodesTitles, this.mappings.rootNode.path);
};

RepositoryBrowserModule.prototype.openFile = function(sPath) {
	console.log("openFile " + sPath);
	var that = this;
	return this.expand(sPath).then(function(sFileLocator) {
		return that.driver.myWaitAndDoubleClick(sFileLocator);
	});
};

RepositoryBrowserModule.prototype.selectNode = function(sPath) {
	console.log("selectNode " + sPath);
	var that = this;
	return this.expand(sPath).then(function(sNodeLocator) {
		return that.driver.myWaitAndClick(sNodeLocator);
	});
};

RepositoryBrowserModule.prototype.rightClickAndSelectContextMenuPath = function(sPath, aContextMenuPath) {
	console.log("rightClickAndSelectContextMenuPath " + sPath + " " + aContextMenuPath);
	var that = this;
	return this.expand(sPath).then(function(sNodeLocator) {
		return that.driver.myWait(sNodeLocator);
	}).then(function(oElement){
		return that.driver.myRightClick(oElement);
	}).then(function(){
		_goThroughContextMenuAndSelect.call(that,aContextMenuPath);
	});
};

RepositoryBrowserModule.prototype.deleteNode = function(sPath) {
	console.log("deleteNode " + sPath);
	var oNodeElement;
	var that = this;
	return this.expand(sPath).then(function(sNodeLocator) {
		oNodeElement = that.driver.findElement(sNodeLocator);
		return that.driver.myWaitAndSendKeys(webdriver.Key.DELETE, sNodeLocator);
	}).then(function() {
		var sDeleteConfirmationDialogOkButtonLocator = utils.toLocator(that.mappings.deleteConfirmationDialogOkButton);
		return that.driver.myWaitAndClick(sDeleteConfirmationDialogOkButtonLocator);
	}).then(function() {
		return that.driver.wait(that.until.stalenessOf(oNodeElement), that.configuration.defaultTimeout);
	});
};

// Note: in order for this importZip to succeed in jenkins, add a call to driver.setFileDetector(new remote.FileDetector())
/**
 * Import project from zip file onto the webide worksapce
 * @param {string} sZipPath path to the zip file
 * @param {boolean} bOverride override if project is already exists
 * @returns {webdriver.Promise}
 */
RepositoryBrowserModule.prototype.importZip = function(sZipPath , bOverride) {
	var that = this;
	console.log("Before going through import menu");
	return _goThroughMenubarItemsAndSelect.call(this, ["File" , "Import" , "From File System"]).then(function(){
		console.log("Before sending path to import dialog");
		return that.driver.myWaitAndSendKeys(sZipPath, utils.toLocator(that.mappings.importDialogFileInput) , that.configuration.startupTimeout).then(function() {
			console.log("Before OK in import dialog");
			return that.driver.myWaitAndClick(utils.toLocator(that.mappings.importDialogOKButton) , that.configuration.defaultTimeout).then(function() {
				//override if already exists
				return that.driver.myWaitAndClick(utils.toLocator(that.mappings.importOverrideConfirmButton), 1000).then(
					function() {
						if(!bOverride) {
							var sMsg = "Project " + sZipPath +  " already exists - no override";
							console.log(sMsg);
							throw(new Error(sMsg));
						}
						console.log("Project overriden: Before progress bar of import");
						return _waitForProgressBar.call(that);
					},
					function() {
						console.log("Project created: Before progress bar of import");
						return _waitForProgressBar.call(that).thenCatch(
							function(){
								console.log("progress bar not found - probably ended while waiting for the confirmation dialog");
								return;
							}
						);
					}
				);
			});
		});
	});
};

var _goThroughMenubarItemsAndSelect = function(aMenuBarTitles, bUseContains) {
	var that = this;
	if (!aMenuBarTitles.length) {
		return promise.fulfilled(null);
	}
	var menuBarSubItemSelector = this.mappings.menubarItemSubElement;
	if (bUseContains) {
		menuBarSubItemSelector = this.mappings.menubarItemSubElementContains;
	}

	var oPromise = promise.fulfilled().then(function() {
		that.driver.sleep(1*1000);
		var rootMenuItemTitle = aMenuBarTitles[0];
		console.log("click on the main menu item: " + rootMenuItemTitle);
		var menuElementLocator = utils.toLocator(that.mappings.menubarItemRootElement , [ rootMenuItemTitle ]);
		return that.driver.myWaitAndClick(menuElementLocator, that.configuration.defaultTimeout);
	});

	_.forEach(_.drop(aMenuBarTitles, 1), function(sTitle) {
		oPromise = oPromise.then(function() {
			console.log("click on the sub menu item: " + sTitle);
			var subElementLocator = utils.toLocator(menuBarSubItemSelector , [ sTitle ]);
			return that.driver.myWaitAndClick(subElementLocator, that.configuration.defaultTimeout);
		});
	});

	return oPromise;
};

var _waitForProgressBar = function () {
	var that = this;
	return this.driver.wait(this.until.elementLocated(utils.toLocator(this.mappings.progressBarStart)), this.configuration.defaultTimeout).then(function() {
		return that.driver.wait(that.until.elementLocated(utils.toLocator(that.mappings.progressBarStop)), that.configuration.defaultTimeout * 4);
	});
};

module.exports = RepositoryBrowserModule;

