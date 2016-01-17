'use strict';

var utils = require('./Utils'),
	_ = require('lodash'),
	path = require('path'),
	webdriver = require('selenium-webdriver'),
	WebIDE = require('./WebIDE'),
	RepositoryBrowser = require('./RepositoryBrowser'),
	Configuration = require('../git/Configuration');

module.exports = function (driver, By, until, configuration) {

	var UILabels = {
		viewMenuTxt: 'view',
		gitPaneTxt: 'Git Pane',
		cloneRepoPathTxt: 'Git /Clone Repository',
		localFolderTxt: 'Local',
		authenticationDialogPWInputTxt: 'Insert password here',
		authenticationDialogOKBtnTxt: 'OK'

	};


	var tableRowNamePathVar = '//table[@id="gitStageTable-table"]//td//div[@class="sapUiTableCell"]//label[@title="$1"]';

	var mappings = {
		gitPane: {type: 'id', path: '#GitPaneGrid'},
		//--------------------------------- Git pane - branches --------------------------------------------//
		selectBranchCombobox: {type: 'id', path: 'git_branch_dd_input'},
		selectBranchItem: {type: 'css', path: '#sap-ui-static .sapUiLbxI sapUiLbxISel[title="$1"]'},
		addBranchBtnEnabled: {type: 'xpath', path: '//button[@id="git_add_branch_btn"and @aria-disabled="false"]'},
		deleteBranchBtn: {type: 'id', path: 'git_remove_branch_btn'},
		//--------------------------------- Git Pane - base buttons -------------------------------------//
		pullBtn: {type: 'id', path: 'git_pull_btn'},
		fetchBtn: {type: 'id', path: 'git_fetch_btn'},
		fetchBtnEnabled: {
			type: 'xpath',
			path: '//div[@id="git_fetch_btn" and not(contains(@class,"gitPaneWaitButtonDisabled"))]'
		},
		rebaseBtn: {type: 'id', path: 'git_rebase_btn'},
		mergeBtn: {type: 'id', path: 'git_merge_btn'},
		showStashBtn: {type: 'id', path: 'git_show_stash_btn'},
		resetBtn: {type: 'id', path: 'git_reset_btn'},
		fetchFromGerritBtn: {type: 'id', path: 'git_fetch_from_gerrit_btn'},
		//-------------------------------- Git Pane - status table area  ----------------------------------------//
		stageAllCheckBoxEnabled: {type: 'xpath', path: '//span[@id="git_stage_all_checkbox" and not(@aria-disabled)]'},
		discardAllBtn: {type: 'id', path: 'git_discard_all_btn'},
		statusTableRowNameCell: {type: 'xpath', path: tableRowNamePathVar},
		statusTableRowStatusCell: {
			type: 'xpath',
			path: '//table[@id="gitStageTable-table"]//td//div[@class="sapUiTableCell"]//label[@title="$1"]/../../../td//div[@class="sapUiTableCell"]//label[@title="$2"]'
		},
		//stageCheckBox: {type: 'xpath', path: ''},
		//discardBtn: {type: 'xpath', path: ''},
		//stagingTableRow: {type: 'xpath', path: ''},
		//contextMenuDelete: {type: 'xpath', path: ''},
		//contextMenuIgnore: {type: 'xpath', path: ''},
		//contextMenuEdit: {type: 'xpath', path: ''},
		//contextMenuCompare: {type: 'xpath', path: ''},
		//contextMenuUntrackAndIgnore: {type: 'xpath', path: ''},
		//-------------------------------- Git pane - Commit and Push area -------------------------------//
		commitDescription: {type: 'id', path: 'git_commit_desc_area'},
		amendCheckBox: {type: 'id', path: 'git_amend_commit_btn'},
		commitAndPushBtn: {type: 'xpath', path:'//button[@id="git_commit_and_push_btn" and @aria-disabled="false"]'},
		commitAndPushCurrentBranchBtn: {type: 'id', path: 'git_commit_and_push_to_current_branch_item'},
		commitAndPushRemoteBranchBtn: {type: 'id', path: 'git_commit_and_push_to_remote_branch_item'},
		commitBtnEnabled: {type: 'xpath', path: '//button[@id="git_commit_btn" and @aria-disabled="false"]'},
		pushBtn: {type: 'id', path: 'git_push_menu_btn'},
		pushCurrentBranchItem: {type: 'id', path: 'git_push_to_current_branch_item'},
		pushRemoteBranchItem: {type: 'id', path: 'git__push_to_remote_branch_item'},
		commitAndPushCurrentBranchItem: {type: 'id', path: 'git_commit_and_push_to_current_branch_item'},
		commitAndPushRemoteBranchItem: {type: 'id', path: 'git_commit_and_push_to_remote_branch_item'},
		stashBtn: {type: 'id', path: 'git_stash_btn'},
		//-------------------------------- Clone Dialog ---------------------------------------//
		cloneDialogUriTxtFld: {type: 'id', path: 'clone_uri_text_fld'},
		cloneDialogAddGerritChangeIDCheckBox: {type: 'id', path: 'clone_add_gerrit_id_CheckBox'},
		cloneDialogUsernameTxtFld: {type: 'id', path: 'clone_username_text_fld'},
		cloneDialogPwFld: {type: 'id', path: 'clone_password_fld'},
		cloneDialogOkBtn: {type: 'id', path: 'clone_ok_button'},
		//------------------------------- Rebase Buttons ---------------------------------------------//
		rebaseContinueBtn: {type: 'id', path: 'git_rebase_continue_btn'},
		rebaseSkipPatchBtn: {type: 'id', path: 'git_skip_patch_btn'},
		rebaseRebaseAbortBtn: {type: 'id', path: 'git_rebase_abort_btn'},
		//------------------------------ Add branch dialog ------------------------------------------//
		createBranchDialogBranchNameFld: {type: 'id', path: 'create_branch_dialog_branch_name_fld'},
		createBranchDialogOkBtn: {type: 'id', path: 'create_branch_dialog_ok_btn'},
		//-------------------------------- Fetch changes dialog -------------------------------------//
		fetchDialogOkBtn: {type: 'id', path: 'fetch_dialog_ok_button'},
		//-------------------------------- Authorization dialog -------------------------------------//
		authorizationDialogPwdFld: {type: 'xpath', path: '//input[@title="$1"]'},
		authorizationDialogOkBtn: {
			type: 'xpath', path: '//div[@id="FetchAuthenticationDialog-footer"]/descendant::button[text()="OK"]'
		},
		//-------------------------------- Rebase dialog -------------------------------------//
		branchRowRebaseDialog: {type: 'xpath', path: '//table[@id="BranchesTreeTable-table"]//tr//span[@title="$1"]'},
		rebaseBranchDialogOKBtn: {
			type: 'xpath',
			path: '//div[@role="dialog"]//div[@class="sapUiDlgBtns"]//button[text() ="OK"]'
		},
		//---------------------------------- Push notification dialog ----------------------------------------//
		pushNotificationDlgOKButton: {
			type: 'xpath',
			path: '//div[@role="dialog"]//div[@class="sapUiDlgBtns"]//button[text() ="OK"]'
		},
		pushNotificationHeader: {type: 'xpath', path: '//span[@title="Push Notification"]'},
		//---------------------------------- Remote branches table dialog ---------------------------------------//
		remoteBranchRadioButton : {type: 'xpath', path: '//table[@id="BranchesTreeTable-table"]//div//span[@title="$1"]'},
		remoteBranchDialogOKButton : {type: 'xpath', path: '//div[@role="dialog"]//div[@class="sapUiDlgBtns"]//button[text() ="OK"]'},

		//---------------------------------- Reset Dialog ------------------------------------------------------//
		//resetBranchDialogOKBtn : {type: 'xpath', path: ''},
		//resetBranchDialogHardRadioButton :{type: 'xpath', path: ''},
		//resetBranchDialogMixRadioButton :{type: 'xpath', path: ''},
		//----------------------------------------Add Branch Dialog ---------------------------------------------//
		addBranchDialogSrcBranchDD : {type: 'id', path:'create_branch_dialog_source_branch_dd'},
		addBranchDialogSrcBranchItem : {type: 'xpath', path:'//ul[@id="create_branch_dialog_source_branch_dd-lb-list"]//li//span[text()="$1"]'},
		addBranchDialogBranchNameFld : {type: 'id', path:'create_branch_dialog_branch_name_fld'},
		addBranchDialogOKBtn : {type: 'id', path:'create_branch_dialog_ok_btn'},
		//--------------------------------------------------Others ---------------------------------------------//
		commitLabelIndicator: {type: 'xpath', path: '//label[contains(@class,"gitAmountIndicator")]'}

	};

	//--------------------------------------------------------------------------------------------------------//
	var clickFetchButton = function () {
		var fetchBtn = utils.toLocator(mappings.fetchBtnEnabled);
		return driver.myWaitAndClick(fetchBtn, Configuration.startupTimeout);
	};

	var clickRebaseButton = function () {
		var rebaseBtn = utils.toLocator(mappings.rebaseBtn);
		return driver.myWaitAndClick(rebaseBtn, Configuration.startupTimeout);
	};

	//var clickResetButton = function () {
	//	var resetBtn = utils.toLocator(mappings.resetBtn);
	//	return driver.myWaitAndClick(resetBtn, Configuration.startupTimeout);
	//};
	//
	//var clickOkBtnInResetDialog = function(){
	//	var okBtn = utils.toLocator(mappings.resetBranchDialogOKBtn);
	//	return driver.myWaitAndClick(okBtn, Configuration.startupTimeout);
	//};
	//
	//var selectHardResetInResetDialog = function(){
	//	var hardBtn = utils.toLocator(mappings.resetBranchDialogHardRadioButton);
	//	return driver.myWaitAndClick(hardBtn, Configuration.startupTimeout);
	//};
	//
	//var selectMixResetInResetDialog = function(){
	//	var hardBtn = utils.toLocator(mappings.resetBranchDialogMixRadioButton);
	//	return driver.myWaitAndClick(hardBtn, Configuration.startupTimeout);
	//};

	var fillPassword = function () {
		var pw = Configuration.getParam(Configuration.KEYS.PASSWORD);
		var pwFld = utils.toLocator(mappings.authorizationDialogPwdFld, [UILabels.authenticationDialogPWInputTxt]);
		return driver.myWaitAndSendKeys(pw, pwFld, Configuration.defaultTimeout);
	};

	var clickOKInAuthenticationDialog = function () {
		var okBtn = utils.toLocator(mappings.authorizationDialogOkBtn, [UILabels.authenticationDialogOKBtnTxt]);
		return driver.myWaitAndClick(okBtn, Configuration.defaultTimeout);
	};

	var clickOKInFetchDialog = function () {
		var fetchOkBtn = utils.toLocator(mappings.fetchDialogOkBtn);
		return driver.myWaitAndClick(fetchOkBtn, Configuration.defaultTimeout);
	};

	var selectMenuViewSubMenuGitPane = function () {
		return webIDE.goThroughMenubarItemsAndSelect(["View", "Git Pane"], true);
	};

	var rightClickElement = function (element) {
		return driver.rightClick(element);
	};

	var rightClickRootElement = function () {
		return repositoryBrowser.selectRepositoryTreeRoot().
			then(rightClickElement);
	};

	var selectCloneRepositoryFromContextMenu = function () {
		return webIDE.selectFromContextMenu(UILabels.cloneRepoPathTxt);
	};

	var openCloneDialog = function () {
		return rightClickRootElement().then(selectCloneRepositoryFromContextMenu);

	};

	var fillRepoURLInCloneDialog = function (sUrl) {
		var urlInputElement = utils.toLocator(mappings.cloneDialogUriTxtFld);
		return driver.myWaitAndSendKeys(sUrl, urlInputElement, Configuration.defaultTimeout);
	};

	var fillPwInCloneDialog = function () {
		var pw = Configuration.getParam(Configuration.KEYS.PASSWORD);
		var pwInputElement = utils.toLocator(mappings.cloneDialogPwFld);
		return driver.myWaitAndSendKeys(pw, pwInputElement, Configuration.defaultTimeout);
	};

	var checkAddGerritIdInCloneDialog = function () {
		var addGerritChangeIDElement = utils.toLocator(mappings.cloneDialogAddGerritChangeIDCheckBox);
		return driver.myWaitAndClick(addGerritChangeIDElement, Configuration.defaultTimeout);
	};

	var clickOkInCloneDialog = function () {
		var okButtonElement = utils.toLocator(mappings.cloneDialogOkBtn);
		return driver.myWaitAndClick(okButtonElement, Configuration.defaultTimeout);
	};

	var findAndFillCommitDescField = function (msg) {
		var descFieldLocator = utils.toLocator(mappings.commitDescription);
		return driver.myWaitAndSendKeys(msg, descFieldLocator, Configuration.defaultTimeout);
	};

	var chooseRebaseOntoBranch = function (sOntoBranch) {
		var branchRowElement = utils.toLocator(mappings.branchRowRebaseDialog, [sOntoBranch]);
		return driver.myWaitAndClick(branchRowElement, Configuration.defaultTimeout);
	};

	var clickOkInRebaseDialog = function () {
		var OKBtn = utils.toLocator(mappings.rebaseBranchDialogOKBtn);
		return driver.myWaitAndClick(OKBtn, Configuration.defaultTimeout);
	};

	var clickOkInPushNotificationDialog = function () {
		var OKBtn = utils.toLocator(mappings.pushNotificationDlgOKButton);
		return driver.myWaitAndClick(OKBtn, Configuration.defaultTimeout);
	};

	var checkStageAll = function () {
		return driver.myWaitAndClick(utils.toLocator(mappings.stageAllCheckBoxEnabled), Configuration.defaultTimeout);
	};

	var isStageAll = function () {
		var stageAllElement = utils.toLocator(mappings.stageAllCheckBoxEnabled);
		return driver.myWait(stageAllElement, Configuration.defaultTimeout).then(function (element) {
			return element.getAttribute(("aria-checked"));
		}).then(function (val) {
			if (val === "true") {
				return true;
			}
			else {
				return false;
			}
		});
	};

	var clickCommitButton = function () {
		return driver.myWaitAndClick(utils.toLocator(mappings.commitBtnEnabled), Configuration.defaultTimeout);
	};

	var clickPushButton = function () {
		return driver.myWaitAndClick(utils.toLocator(mappings.pushBtn), Configuration.defaultTimeout);
	};

	var clickAmendCommitCB = function () {
		return driver.myWaitAndClick(utils.toLocator(mappings.amendCheckBox), Configuration.defaultTimeout);
	};

	var selectCurrentBranchFromPushMenu = function () {
		return driver.myWaitAndClick(utils.toLocator(mappings.pushCurrentBranchItem), Configuration.defaultTimeout);
	};

	var selectRemoteBranchFromPushMenu = function () {
		return driver.myWaitAndClick(utils.toLocator(mappings.pushRemoteBranchItem), Configuration.defaultTimeout);
	};

	var clickCommitAndPushButton = function(){
		return driver.myWaitAndClick(utils.toLocator(mappings.commitAndPushBtn), Configuration.defaultTimeout);
	};

	var selectCurrentBranchFromCommitAndPushMenu = function(){
		return driver.myWaitAndClick(utils.toLocator(mappings.commitAndPushCurrentBranchItem), Configuration.defaultTimeout);
	};

	var selectRemoteBranchFromCommitAndPushMenu = function(){
		return driver.myWaitAndClick(utils.toLocator(mappings.commitAndPushRemoteBranchItem), Configuration.defaultTimeout);
	};

	var clickRemoteBranchFromRemoteBranchesTable = function(sBranch){
		return driver.myWaitAndClick(utils.toLocator(mappings.remoteBranchRadioButton, [sBranch]), Configuration.defaultTimeout);
	};

	var clickOkInRemoteBranchesDialog = function(){
		return driver.myWaitAndClick(utils.toLocator(mappings.remoteBranchDialogOKButton), Configuration.defaultTimeout);	};

	var clickBranchComboBox = function () {
		var branchCB = utils.toLocator(mappings.selectBranchCombobox);
		return driver.myWaitAndClick(branchCB, Configuration.defaultTimeout);
	};

	var selectBranchItem = function (sBranch) {
		var branchItem = utils.toLocator(mappings.selectBranchItem, [sBranch]);
		return driver.myWaitAndClick(branchItemm, Configuration.defaultTimeout);
	};

	//var waitForBranchCBToBeEnabled = function () {
	//	var element = utils.toLocator(mappings.selectBranchCombobox);
	//	return driver.wait(until.elementIsEnabled(element));
	//};

	var waitForCommitIndication = function () {
		var labelLocator = utils.toLocator(mappings.commitLabelIndicator);
		return driver.myWait(labelLocator, Configuration.defaultTimeout);
	};

	var waitForPushNotificationDialog = function () {
		var header = utils.toLocator(mappings.pushNotificationHeader);
		return driver.myWait(header, Configuration.defaultTimeout);
	};

	var clickPullButton = function(){
		var pullButton = utils.toLocator(mappings.pullBtn);
		return driver.myWaitAndClick(pullButton, Configuration.defaultTimeout);
	};

	var clickMergeButton = function(){
		var mergeButton = utils.toLocator(mappings.mergeBtn);
		return driver.myWaitAndClick(mergeButton, Configuration.defaultTimeout);
	};


	var clickAddBranchBtn = function(){
		var addBtn = utils.toLocator(mappings.addBranchBtnEnabled);
		return driver.myWaitAndClick(addBtn, Configuration.defaultTimeout);
	};

	var clickSrcBranchCBInAddBranchDialog = function(){
		var srcBranchCB = utils.toLocator(mappings.addBranchDialogSrcBranchDD);
		return driver.myWaitAndClick(srcBranchCB, Configuration.defaultTimeout);
	};

	var selectBranchInAddBranchDialog = function(sBranch){
		var branchItem = utils.toLocator(mappings.addBranchDialogSrcBranchItem, [sBranch]);
		return driver.myWaitAndClick(branchItem, Configuration.defaultTimeout);
	};

	var selectBranchNameInAddBranchDialog = function(){
		var nameFld = utils.toLocator(mappings.addBranchDialogBranchNameFld);
		return driver.myWaitAndDoubleClick(nameFld, Configuration.defaultTimeout);
	};

	var fillNewBranchNameInAddBranchDialog = function(sName){
		var nameFld = utils.toLocator(mappings.addBranchDialogBranchNameFld);
		return driver.myWaitAndSendKeys(sName, nameFld, Configuration.defaultTimeout);
	};

	var clickOKInAddBranchDialog = function(){
		var okBtn = utils.toLocator(mappings.addBranchDialogOKBtn);
		return driver.myWaitAndClick(okBtn, Configuration.defaultTimeout);
	};

	//var clickByPassCBInRemoteBranchesDialog = function(){
	//	var byPassCB = utils.ToLocator(mappings.);
	//	return driver.myWaitAndClick(pullButton, Configuration.defaultTimeout);
	//};

	utils.decorateDriver(driver, until);

	var webIDE = new WebIDE(driver, By, until, Configuration);
	var repositoryBrowser = new RepositoryBrowser(driver, By, until, Configuration);

	//-------------------------------------------------------------------------------------------------------//
	return {

		/**
		 * Open/Close Git pane
		 */
		toggleGitPane: function () {
			return selectMenuViewSubMenuGitPane();
		},


		/**
		 * Clones a git repository of the specified URL
		 * @param sUrl
		 */
		clone: function (sUrl) {
			return openCloneDialog().then(function () {
				return fillRepoURLInCloneDialog(sUrl);
			}).then(function () {
				return fillPwInCloneDialog();
			}).then(function () {
				return checkAddGerritIdInCloneDialog();
			}).then(function () {
				return clickOkInCloneDialog();
			});
		},


		/**
		 * Fetch changes from Git
		 */
		fetch: function () {
			return clickFetchButton().then(function () {
				return fillPassword();
			}).then(function () {
				return clickOKInAuthenticationDialog();
			}).then(function () {
					return clickOKInFetchDialog();
			});
		},

		rebase: function (sOntoBranch) {
			return clickRebaseButton().then(function () {
				return chooseRebaseOntoBranch(sOntoBranch);
			}).then(function () {
				return clickOkInRebaseDialog();
			});
		},

		/**
		 * Stage all changes by checking the 'stage all' check box
		 */
		stageAll: function () {
			return isStageAll().then(function (isStaged) {
				if (!isStaged) {
					return driver.sleep(500).then(function () {
						return checkStageAll();
					});
				}
				return;

			});
		},

		/**
		 * Unstage all chnages by unchecking the 'stage all' check box.
		 */
		unstageAll: function () {
			return isStageAll().then(function (isStaged) {
				if (isStaged) {
					return checkStageAll();
				}
				return;

			});
		},

		/**
		 * Add the given msg as the commit description in the description text area.
		 * @param msg
		 */
		addCommitDescription: function (msg) {
			//TODO - replace sleep
			return driver.sleep(500).then(function () {
				return findAndFillCommitDescField(msg);
			});
		},

		/**
		 * Commits a change by pressing the 'commit' button
		 * @returns {*}
		 */
		commitChange: function () {
			return clickCommitButton().then(function () {
				return waitForCommitIndication();
			});
		},

		/**
		 * Push to the current branch, using the 'push' button
		 *
		 */
		pushToCurrentBranch: function () {
			return clickPushButton().then(function () {
				return selectCurrentBranchFromPushMenu();
			}).then(function () {
				return fillPassword();
			}).then(function () {
				return clickOKInAuthenticationDialog();
			}).then(function () {
				return waitForPushNotificationDialog();
			}).then(function () {
				return clickOkInPushNotificationDialog();
			});
		},

		/**
		 * Pull from upstream using the Pull button
		 */
		pull: function () {
			return clickPullButton().then(function () {
				return fillPassword();
			}).then(function () {
				return clickOKInAuthenticationDialog();
			}).then(function () {
				return clickOKInFetchDialog();
			});
		},

		/**
		 * Merge the changes  from upstream on the given branch
		 * @param sOntoBranch
		 */
		merge: function (sOntoBranch) {
			return clickMergeButton().then(function () {
				return fillPassword();
			}).then(function () {
				return clickOKInAuthenticationDialog();
			}).then(function () {
				return clickOKInFetchDialog();
			});
		},

		/**
		 * Reset the current branch onto the given branch and according to the given reset type.
		 * @param sOntoBranch
		 * @param sType
		 */
		reset: function (sOntoBranch, sType) {
			return clickResetButton().then(function(){
				if(sType === "Mix")
					return selectMixResetInResetDialog();
				else
					return selectHardResetInResetDialog();
			}).then()(function(){
				return clickOkBtnInResetDialog();
			});
		}
		,

		fetchFromGerrit: function (sChange) {

		}
		,

		discardAll: function () {

		}
		,

		amendChange: function () {
			return clickAmendCommitCB();
		},


		commitAndPushToCurrentBranch: function () {
			return clickCommitAndPushButton().then(function() {
				return selectCurrentBranchFromCommitAndPushMenu();
			}).then(function () {
				return fillPassword();
			}).then(function () {
				return clickOKInAuthenticationDialog();
			}).then(function () {
				return waitForPushNotificationDialog();
			}).then(function () {
				return clickOkInPushNotificationDialog();
			});
		},

		commitAndPushToRemoteBranch: function (sRemoteBranch) {
			return clickCommitAndPushButton().then(function(){
				return selectRemoteBranchFromCommitAndPushMenu();
			}).then(function(){
				return clickRemoteBranchFromRemoteBranchesTable(sRemoteBranch);
			}).then(function () {
				return clickOkInRemoteBranchesDialog();
			}).then(function () {
				return fillPassword();
			}).then(function () {
				return clickOKInAuthenticationDialog();
			}).then(function () {
				return waitForPushNotificationDialog();
			}).then(function () {
				return clickOkInPushNotificationDialog();
			});
		},


		pushToRemoteBranch: function (sRemoteBranch, byPass) {
			return clickPushButton().then(function() {
				return selectRemoteBranchFromPushMenu();
			}).then(function(){
				return clickRemoteBranchFromRemoteBranchesTable(sRemoteBranch);
			}).then(function(){
				if(byPass){
					return clickByPassCBInRemoteBranchesDialog();
				}
				return;
			}).then(function(){
				return clickOkInRemoteBranchesDialog();
			}).then(function () {
				return fillPassword();
			}).then(function () {
				return clickOKInAuthenticationDialog();
			}).then(function () {
				return waitForPushNotificationDialog();
			}).then(function () {
				return clickOkInPushNotificationDialog();
			});
		},


		selectBranch: function (sBranch) {
			return clickBranchComboBox().
				then(selectBranchItem(sBranch));
		},

		createBranch : function (sBranchSrc,sNewBranch) {
			return clickAddBranchBtn().then(function(){
				return clickSrcBranchCBInAddBranchDialog();
			}).then(function(){
				return selectBranchInAddBranchDialog(sBranchSrc);
			}).then(function(){
				return selectBranchNameInAddBranchDialog();
			}).then(function(){
				return fillNewBranchNameInAddBranchDialog(sNewBranch);
			}).then(function() {
				return clickOKInAddBranchDialog();
			});

		},

		deleteBranch: function (sBranch) {

		},

		stashChanges: function (stashMsg) {

		}
		,

		applyStash: function () {

		}
		,

		popStash: function () {

		}
		,

		dropStash: function () {

		},

		/******************************************************************************************************/


		waitForFileInStatusTable: function (filePath, status) {
			var locator = utils.toLocator(mappings.statusTableRowStatusCell, [filePath, status]);
			return driver.myWait(locator, Configuration.defaultTimeout);
		}
	};

};