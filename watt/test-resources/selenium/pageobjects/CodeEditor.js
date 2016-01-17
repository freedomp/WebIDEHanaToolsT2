var utils = require('./Utils');
var webdriver = require('selenium-webdriver');
var Key = webdriver.Key;

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		codeEditorControlElement : {type: 'css', path : '#contentAreaView--editorArea .ace_editor.ace_focus'},
		codeEditorControlElementNotFocused : {type: 'css', path : '#contentAreaView--editorArea .ace_editor'},
		codeEditorElement : {type: 'css', path : '#contentAreaView--editorArea .ace_editor.ace_focus .ace_text-input'},
		codeEditorContent : {type: 'css', path : '#contentAreaView--editorArea .ace_editor.ace_focus .ace_content'},
		autoCompletePopup : {type: 'css', path : '#contentAreaView--editorArea .ace_autocomplete_popup'},
		autoCompleteProposal : {type : 'xpath', path : '//span[contains(@class, "intellisense_description selectable") and text() = "$1"]'},
		jsContextMenuItem : {type: 'css', path : '#sap-ui-static li[id*="jsContextMenu-$1.$2"]'}
	};

	utils.decorateDriver(driver, until);

	return {

		insertText : function(sText) {
			var sEditorLocator = utils.toLocator(mappings.codeEditorElement);
			return driver.myWaitAndSendKeys(sText, sEditorLocator, configuration.defaultTimeout);
		},

		getText : function(bFocus) {
			var sEditorLocator = utils.toLocator(!bFocus? mappings.codeEditorControlElement : mappings.codeEditorControlElementNotFocused);
			return driver.myWait(sEditorLocator, configuration.defaultTimeout).then(function (oEditorElement) {
				return oEditorElement.getAttribute("id");
			}).then(function (sId) {
				return driver.executeScript(function () {
					var oEditorControl = sap.ui.getCore().byId(arguments[0]);
					return oEditorControl.getValue();
				}, sId);

			});
		},

		clearText : function() {
			var sEditorLocator = utils.toLocator(mappings.codeEditorControlElement);
			return driver.myWait(sEditorLocator, configuration.defaultTimeout).then(function(oEditorElement) {
				return oEditorElement.getAttribute("id");
			}).then(function(sId) {
				return driver.executeScript(function() {
					var oEditorControl = sap.ui.getCore().byId(arguments[0]);
					return oEditorControl.setValue("");
				}, sId);

			});
		},

		triggerAutoCompletePopup : function() {
			var sEditorLocator = utils.toLocator(mappings.codeEditorElement);
			var ctrlSpace = Key.chord(Key.CONTROL, Key.SPACE);
			return driver.myWaitAndSendKeys(ctrlSpace, sEditorLocator, configuration.defaultTimeout);
		},

		chooseAutoCompleteProposal : function(sProposal) {
			var sAutoCompleteLocator = utils.toLocator(mappings.autoCompletePopup);
			return driver.myWait(sAutoCompleteLocator, configuration.defaultTimeout).then(function() {
				var sProposalLocator = utils.toLocator(mappings.autoCompleteProposal, [sProposal]);
				return driver.myWaitAndClick(sProposalLocator, configuration.defaultTimeout);
			});
		},

		openContextMenu : function() {
			var oElementToRightClickOn = utils.toLocator(mappings.codeEditorControlElement);
			return driver.myWaitAndRightClick(oElementToRightClickOn, configuration.defaultTimeout);
		},

		chooseMenuItemInContextMenu : function (sGroup, sText) {
			var oElementToChoose = utils.toLocator(mappings.jsContextMenuItem, [sGroup, sText]);
			return driver.myWaitAndClick(oElementToChoose, configuration.defaultTimeout);
		}


	};

};
