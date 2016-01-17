var utils = require('./Utils');

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		consoleIsVisible : {type : 'css' , path : '.sapUiHorizontalSplitterBar + div #Console'},
		centerBottomIsHidden : {type : 'css' , path : '#__splitter2_SB[class=sapUiHorizontalSplitterBarHidden]'},
		gitPaneIsVisible : {type : 'css' , path : '.sapUiVerticalSplitterBar + .sapUiVSplitterSecondPane #GitPaneGrid'},
		rightPaneIsHidden : {type : 'css' , path : '#__splitter1_SB[class=sapUiVerticalSplitterBarHidden]'},
		leftPaneIsHidden : {type : 'css' , path : '#__splitter0_SB[class=sapUiVerticalSplitterBarHidden]'},
		leftPaneIsVisible : {type : 'css' , path : '#__splitter0_firstPane + .sapUiVerticalSplitterBar'}

	};

	utils.decorateDriver(driver, until);


	return {
		waitForConsoleVisible : function(){
			var consoleIsVisible = utils.toLocator(mappings.consoleIsVisible);
			return driver.wait(until.elementLocated(consoleIsVisible), configuration.defaultTimeout).then(function() {
				return true;
			});
		},

		waitForCenterBottomHidden : function(){
			var centerBottomIsHidden = utils.toLocator(mappings.centerBottomIsHidden);
			return driver.wait(until.elementLocated(centerBottomIsHidden), configuration.defaultTimeout).then(function() {
				return true;
			});
		},

		waitForGitPaneVisible : function(){
			var gitPane = utils.toLocator(mappings.gitPaneIsVisible);
			return driver.wait(until.elementLocated(gitPane), configuration.defaultTimeout).then(function(oElement) {
			});

		},

		waitForRightPaneHidden : function(){
			var rightPaneIsHidden = utils.toLocator(mappings.rightPaneIsHidden);
			return driver.wait(until.elementLocated(rightPaneIsHidden), configuration.defaultTimeout).then(function() {
				return true;
			});
		},

		waitForLeftPaneHidden : function(){
			var leftPaneIsHidden = utils.toLocator(mappings.leftPaneIsHidden);
			return driver.wait(until.elementLocated(leftPaneIsHidden), configuration.defaultTimeout).then(function() {
				return true;
			});
		},

		waitForLeftPaneVisible : function(){
			var gitPane = utils.toLocator(mappings.leftPaneIsVisible);
			return driver.wait(until.elementLocated(gitPane), configuration.defaultTimeout).then(function(oElement) {
			});

		},

		waitCenterTopMaximized : function(){
			var that = this;
			return that.waitForCenterBottomHidden().then(function(){
				return that.waitForRightPaneHidden().then(function(){
					return that.waitForLeftPaneHidden();
				});
			});
		}
	};
};
