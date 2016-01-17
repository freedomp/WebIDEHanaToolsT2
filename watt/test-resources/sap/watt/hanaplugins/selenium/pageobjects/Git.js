'use strict';

var utils = require('./Utils'),
	_ = require('lodash'),
	path = require('path'),
	webdriver = require('selenium-webdriver'),
	webide = require('./WebIDE'),
	Q = require('q');

module.exports = function (driver, By, until, configuration) {

	var mappings = {
		gitPane: {type: 'id', path: '#GitPaneGrid'},
		rightPaneIsHidden : {type : 'css' , path : '#__splitter1_SB[class=sapUiVerticalSplitterBarHidden]'},
		//hideGitPanel:{type :'xpath' ,path :'//div[@id ="gitStageTable"][contains(@class ,"sapUiTableHScr")]'},
		selectBranchCombobox: {type: 'css', path: '#GitPaneGrid .sapUiTfComboIcon'},
		selectBranchItem: {type: 'css', path: '#sap-ui-static .sapUiLbxI sapUiLbxISel[title="$1"]'},
		addBranch: {type: '', path: ''},
		fetch: {type: '', path: ''},
		rebase: {type: '', path: ''},
		removeBranch: {type: '', path: ''},
		push: {type: '', path: ''},
		reset: {type: '', path: ''},
		pushRemoteBranch: {type: '', path: ''},
		pushMasterBranch: {type: '', path: ''},
		pressAmend: {type: '', path: ''},
		urlInput :  {type : 'css' , path :'input[id$="clone_uri_text_fld"][title="Insert repository URL here"]'},
		userNameInput :  {type : 'css' , path :'input[id$="clone_username_text_fld"][title="Insert user name here"]'},
		passwordInput :  {type : 'css' , path :'input[id$="clone_password_fld"][title="Insert your password here"]'},
		cloneDialogOkButton :  {type : 'css' , path :'button[id$="clone_ok_button"][title="OK"]'},
		pushDialogOkButton :  {type : 'xpath' , path :'//button[contains(@class ,"sapUiBtnS")][text()="OK"]'},
		stageAll: {type: 'css', path: '#GitPaneGrid .sapUiTriCbInner'},
		commitDescription: {
			type: 'css',
			path: '#GitPaneGrid .gitPaneControllerSpacing.sapUiTf.sapUiTfBack.sapUiTfBrd.sapUiTxtA.sapUiTfStd'
		},
		commitBtn: {type: 'xpath', path: '//*[@id="GitPaneGrid"]//button[.="Commit"]'},
		pushBtn:   {type: 'xpath', path: '//*[@id="GitPaneGrid"]//button[.="Push"]'},
		commitPrefix :{type : 'xpath' , path :'//li[contains(@class ,"sapUiTreeNode")][@title="$1"]/*/span[@class="rdeRepositoryBrowserPrefixGitCommitted"]'},
		//fileStage :   {type :'xpath' , path :'//div[@class="sapUiTableCell"]/label[@title="$1"]'}
		fileStage : {type :'xpath' , path :'//div[@class="sapUiTableCell"]/label[@title="$1"]/parent::div/parent::td/following-sibling::td/*/span[@role="checkbox"]'},
		menubarItemRootElement : {type : 'xpath' , path : '//div[contains(@class ,"sapUiMnu")]//div[text()="$1"]'},
		pushUserInput : {type : 'xpath' , path : '//label[contains(@class ,"gitMarginBottonWithGrid0Spacing ")][text()="User Name "]/parent::div/following-sibling::div/input[contains(@class ,"sapUiTf")]'},
		pushpaswordInput : {type : 'xpath' , path : '//input[contains(@class ,"sapUiTf")][@title="Insert password here"]'}
		//	$x('//div[@class="sapUiTableCell"]/label[@title="test1.txt"]/parent::div/parent::td/following-sibling::td')
		//*[@id="__box0-col2-row1-CB"]
	};

	utils.decorateDriver(driver, until);

	var webIDE = new webide(driver, By, until, configuration);

	return {

		openGitPane: function () {
			return webIDE.goThroughMenubarItemsAndSelect(["View" , "Git Pane"], true);
		},

		closeGitPane : function() {
			return webIDE.goThroughMenubarItemsAndSelect(["View" , "Git Pane"], true);
		},
		clone :function(url,user,pass) {
			var that = this;
			return webIDE.goThroughMenubarItemsAndSelect(["File", "Git", "Clone Repository"],true).then(function () {
				console.log("Wellcome to Clone panel");
					return driver.myWaitAndSendKeys(url, utils.toLocator(mappings.urlInput), configuration.defaultTimeout).then(function () {
						return driver.myWaitAndSendKeys(user, utils.toLocator(mappings.userNameInput), configuration.defaultTimeout).then(function () {
							return driver.myWaitAndSendKeys(pass, utils.toLocator(mappings.passwordInput), configuration.defaultTimeout).then(function () {
								return driver.myWaitAndClick(utils.toLocator(mappings.cloneDialogOkButton), configuration.defaultTimeout).then(function () {
									console.log("Finish the Clone project");
									return webIDE.waitForProgressBar();
								});
							});
						});
					});
			});
		},

		stageAll : function() {
			return driver.myWaitAndClick(utils.toLocator(mappings.stageAll), configuration.defaultTimeout);
		},
		stageFile : function(fileName){
			var fileStage =  utils.toLocator(mappings.fileStage,[fileName]);
			return driver.wait(until.elementLocated(fileStage), configuration.defaultTimeout).then(function() {
				return driver.findElement(fileStage).then(function (oFileElement) {
					return driver.myWaitAndClick(fileStage, configuration.defaultTimeout).thenCatch(function (oError) {
						return driver.myWaitAndClick(oFileElement, configuration.defaultTimeout);
					});
					console.log('The file ' + fileName + " is staged");
				});
			});


		},
		addCommitDescription : function(sText) {
			var descriptionEditorLocator =  utils.toLocator(mappings.commitDescription);
			return driver.myWaitAndSendKeys(sText, descriptionEditorLocator, configuration.defaultTimeout);
		},

		commitChange : function() {
				return driver.myWaitAndClick(utils.toLocator(mappings.commitBtn), configuration.defaultTimeout);
		},
		pushChange : function(rootMenuItemTitle,user,pass) {
			return driver.myWaitAndClick(utils.toLocator(mappings.pushBtn), configuration.defaultTimeout).then(function() {
				console.log("Click on the Push branch menu item: " + rootMenuItemTitle);

				var menuElementLocator = utils.toLocator(mappings.menubarItemRootElement,[rootMenuItemTitle] );

				return driver.findElement(menuElementLocator).then(function (oFileElement) {
						return driver.myWaitAndClick(menuElementLocator, configuration.defaultTimeout).then(function(){
							var a=utils.toLocator(mappings.pushUserInput)[0];
							return driver.myWaitAndSendKeys(user, utils.toLocator(mappings.pushUserInput), configuration.defaultTimeout).then(function () {
								return driver.myWaitAndSendKeys(pass, utils.toLocator(mappings.pushpaswordInput), configuration.defaultTimeout).then(function () {
									return driver.myWaitAndClick(utils.toLocator(mappings.pushDialogOkButton), configuration.defaultTimeout).then(function () {
										console.log("Finish the push ");
										return webIDE.waitForProgressBar();
							});
						});

					});
						});

					});

				});
		},
		checkCommitFile : function(fileName) {
			var checkCommit = utils.toLocator(mappings.commitPrefix,[fileName]);
			return driver.findElement(checkCommit).then(function() {
				console.log('The file '+fileName + " is commited");
			});

		},
		checkOpenGitPanel : function(){
			var that = this;
				console.log('Check if Git Panel exists');
				return driver.findElement(utils.toLocator(mappings.rightPaneIsHidden)).then(function() {
					console.log('Add Git Panel');
					return that.openGitPane();
				}, function(err) {
					console.log('Console is exist');
					return;});				}


		}


};