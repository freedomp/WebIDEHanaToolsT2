var utils = require('./Utils');
var webdriver = require('selenium-webdriver');

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		 rootNode : {type: 'css', path : '.sapWattRepositoryBrowser .sapUiTreeList > .sapUiTreeNode[title="Local"]'},
		 deleteConfirmationDialogOkButton : {type: 'css', path : '#MSG_CONFIRM--btn-OK'},
		 treeNode :{type : 'xpath' , path :'//li[contains(@class ,"sapUiTreeNodeSelected")][@title="$1"][@aria-selected="true"]'},
		 treeNodeNotSel :{type : 'xpath' , path :'//li[contains(@class ,"sapUiTreeNode")]/span[@class="sapUiTreeNodeContent"][text()="$1"]'}
	};

	utils.decorateDriver(driver, until);

	function _createNodeCssSelector(sContainingFolderCssSelector, sNodeTitle) {
		return sContainingFolderCssSelector + ' + .sapUiTreeChildrenNodes > ' +
			'.sapUiTreeNode[title="' + sNodeTitle + '"]';
	}

	function _expand (aNodesTitles, sRootFolderCssSelector,title) {
		  var sCurrentFolderLocator = utils.toLocator({type: 'css', path: sRootFolderCssSelector});
			   return driver.myWaitAndClick(sCurrentFolderLocator, configuration.defaultTimeout).thenCatch(function (oError) {
				   return driver.myWaitAndClick(sCurrentFolderLocator, configuration.defaultTimeout).thenCatch(function (oError) {
					   return driver.myWaitAndClick(sCurrentFolderLocator, configuration.defaultTimeout).then(function () {
						   var nodeLocator = utils.toLocator(mappings.treeNode, [title]);
						   return driver.findElement(nodeLocator).thenCatch(function (oError) {
							   var nodeLocator1 = utils.toLocator(mappings.treeNodeNotSel, [title]);
							   return driver.findElement(nodeLocator1).then(function () {
								   return driver.myWaitAndClick(nodeLocator1, configuration.defaultTimeout).thenCatch(function (oError) {
									   console.log("Error  " + oError);
								   });
							   }, function (err) {
								   return;
							   });
						   });
					   })
				   })
			   })
	.then(function () {
				return driver.myWaitAndSendKeys(webdriver.Key.ARROW_RIGHT, sCurrentFolderLocator,configuration.defaultTimeout).thenCatch(function (oError){
						return driver.myWaitAndSendKeys(webdriver.Key.ARROW_RIGHT, sCurrentFolderLocator,configuration.defaultTimeout);

				});
			}).then(function () {
				//recursion stop condition
				if (aNodesTitles.length === 0) {
					return sCurrentFolderLocator;
				}
				var sNextFolderCssSelector = _createNodeCssSelector(sRootFolderCssSelector, aNodesTitles[0]);
				aNodesTitles.shift();
				//FIXME - workaround for a bug where a folder is expanded without it's content
				//We need to find a condition that will replace sleep
				return driver.sleep(1500).then(function () {
					return _expand(aNodesTitles, sNextFolderCssSelector,aNodesTitles[0]);
				});
			});
		//});
	}
	return {

		expand : function(sPath) {
			var aNodesTitles = sPath.split('/');
			return _expand(aNodesTitles, mappings.rootNode.path,"Local");
		},

		openFile : function(sPath) {
			return this.expand(sPath).then(function(sFileLocator) {
				return driver.myWaitAndDoubleClick(sFileLocator);
			});
		},
		readFile: function (fileName) {
			// readFileUsingPromises.js
			var FS = require('fs');
			var	Q = require('q');
			var defer = Q.defer();
			FS.readFile( fileName, "utf-8" ,function(error,data){
				if (error) {
					defer.reject(error);
				} else {
					defer.resolve(data);
				}
			});

			return defer.promise;



		},
		selectNode : function(sPath) {
			return this.expand(sPath).then(function(sNodeLocator) {
				return driver.myWaitAndClick(sNodeLocator, configuration.defaultTimeout).thenCatch(function (oError) {
					return driver.myWaitAndClick(sNodeLocator, configuration.defaultTimeout).thenCatch(function (oError){
						return driver.myWaitAndClick(sNodeLocator, configuration.defaultTimeout);
					});
				});
			});
		},

        deleteNode: function (sPath) {
            var oNodeElement;
            var snodeLocator;
            var that = this;
			driver.sleep(2 * 1000);
            return this.expand(sPath).then(function (sNodeLocator) {
                that.snodeLocator = sNodeLocator;
                oNodeElement = driver.findElement(sNodeLocator);
                return driver.myWaitAndSendKeys(webdriver.Key.DELETE, sNodeLocator);
            }).thenCatch(function (oError) {
                oNodeElement = driver.findElement(snodeLocator);
                return driver.myWaitAndSendKeys(webdriver.Key.DELETE, snodeLocator);
            }).then(function () {
                var sDeleteConfirmationDialogOkButtonLocator = utils.toLocator(mappings.deleteConfirmationDialogOkButton);
				return driver.myWait(sDeleteConfirmationDialogOkButtonLocator, 1000).then(function () {
					//driver.sleep(2 * 1000);
					return driver.myWaitAndClick(sDeleteConfirmationDialogOkButtonLocator);
				});
            }).then(function () {
                return driver.wait(until.stalenessOf(oNodeElement), configuration.defaultTimeout);
            });
        }

	};

};
