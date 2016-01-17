var utils = require('./Utils');
var webdriver = require('selenium-webdriver');
var webide = require('./WebIDE');

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		rootNode : {type: 'css', path : '.sapWattRepositoryBrowser .sapUiTreeList > .sapUiTreeNode[title="Local"]'},
		deleteConfirmationDialogOkButton : {type: 'css', path : '#MSG_CONFIRM--btn-OK'},
		node : {type:'xpath', path : '//span[@class="sapUiTreeNodeContent" and text()="$1"]'},
		rootRepositoryNode : {type: 'css' , path : '.sapWattRepositoryBrowser .sapUiTreeList .sapUiTreeNode[title="Local"]'},
		//---------------------------------New File Dialog-------------------------------------
		CreateFileDialogfileInputField : {type:'id', path:'CreateFileDialog_InputFileName'},
		CreateFileDialogOKButton : {type:'id', path:'CreateFileDialog_CreateButton'}
	};

	utils.decorateDriver(driver, until);
	var webIDE = new webide(driver, By, until, configuration);

	var fillFileNameInNewFileDialog = function(fileName){
		var input = utils.toLocator(mappings.CreateFileDialogfileInputField);
		return driver.myWaitAndSendKeys(fileName,input, configuration.defaultTimeout);
	};

	var clickOkInNewFileDialog = function(){
		var OKBtn = utils.toLocator(mappings.CreateFileDialogOKButton);
		return driver.myWaitAndClick(OKBtn);
	};

	function _createNodeCssSelector(sContainingFolderCssSelector, sNodeTitle) {
		return sContainingFolderCssSelector + ' + .sapUiTreeChildrenNodes > ' +
			'.sapUiTreeNode[title="' + sNodeTitle + '"]';
	}

	function _expand (aNodesTitles, sRootFolderCssSelector) {
		var sCurrentFolderLocator = utils.toLocator({type: 'css', path: sRootFolderCssSelector});
		return driver.myWaitAndClick(sCurrentFolderLocator).then(function() {
			return driver.myWaitAndSendKeys(webdriver.Key.ARROW_RIGHT, sCurrentFolderLocator);
		}).then(function() {
			//recursion stop condition
			if (aNodesTitles.length === 0) {
				return sCurrentFolderLocator;
			}
			var sNextFolderCssSelector = _createNodeCssSelector(sRootFolderCssSelector, aNodesTitles[0]);
			aNodesTitles.shift();
			//FIXME - workaround for a bug where a folder is expanded without it's content
			//We need to find a condition that will replace sleep
			return driver.sleep(500).then(function() {
				return _expand(aNodesTitles, sNextFolderCssSelector);
			});
		});
	}

	return {

		expand : function(sPath) {
			var aNodesTitles = sPath.split('/');
			return _expand(aNodesTitles, mappings.rootNode.path);
		},

		openFile : function(sPath) {
			return this.expand(sPath).then(function(sFileLocator) {
				return driver.myWaitAndDoubleClick(sFileLocator);
			});
		},

		selectNode : function(sPath) {
			return this.expand(sPath).then(function(sNodeLocator) {
				return driver.myWaitAndClick(sNodeLocator);
			});
		},

		deleteNode : function(sPath) {
			var oNodeElement;
			return this.expand(sPath).then(function(sNodeLocator) {
				oNodeElement = driver.findElement(sNodeLocator);
				return driver.myWaitAndSendKeys(webdriver.Key.DELETE, sNodeLocator);
			}).then(function() {
				var sDeleteConfirmationDialogOkButtonLocator = utils.toLocator(mappings.deleteConfirmationDialogOkButton);
				return driver.myWaitAndClick(sDeleteConfirmationDialogOkButtonLocator);
			}).then(function() {
				return driver.wait(until.stalenessOf(oNodeElement), configuration.defaultTimeout);
			});
		},

		waitForNode: function(sPath){
			var folderLocator = utils.toLocator(mappings.node, [sPath]);
			return driver.myWait(folderLocator, configuration.defaultTimeout);
		},

		/**
		 * Create file in the given path, and with the given name
		 */
		createFile: function(sPath, name){
			return this.selectNode(sPath)
				.then(function(element) {
					return driver.rightClick(element);
				}).then(function(){
					return webIDE.selectFromContextMenu("New/File");
				}).then(function(){
					return fillFileNameInNewFileDialog(name);
				}).then(function() {
					return clickOkInNewFileDialog();
				});
		},

		/**
		 * Selects the root in the repository tree
		 */
		selectRepositoryTreeRoot : function() {
			var sRootNodeLocator = utils.toLocator(mappings.rootRepositoryNode);
			return driver.myWaitAndClick(sRootNodeLocator);
		}

	};

};
