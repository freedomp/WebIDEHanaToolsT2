var utils = require('./Utils');
var webdriver = require('selenium-webdriver');
var Key = webdriver.Key;

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		codeEditorElement : {type: 'css', path : '#contentAreaView--editorArea .ace_text-input'},
		codeEditorElement1 : {type: 'css', path : '.ace_editor'},
		autoCompletePopup : {type: 'css', path : '#contentAreaView--editorArea .ace_autocomplete_popup'},
		autoCompleteProposal : {type : 'xpath', path : '//span[contains(@class, "intellisense_description selectable") and text() = "$1"]'},
		clearCodeElement : {type : 'xpath', path :'//div[@class="ace_line" and contains(text(),"$$http://somehost:someport/$$")]/span[@class="ace_keyword"]'},
		codeElement : {type : 'xpath', path :'//div[contains(@class ,"ace_text-layer")]'},
		saveButton :  {type : 'css' , path : "button[title='Save (Ctrl+S)']"}
	};
	var replacetext;
	var replacetext1;
	utils.decorateDriver(driver, until);


	return {

		insertText : function(sText) {
			var sEditorLocator = utils.toLocator(mappings.codeEditorElement);
			return driver.myWaitAndSendKeys(sText, sEditorLocator, configuration.defaultTimeout);
		},

		//FIXME
		clearText : function() {
			/*var sEditorLocator = utils.toLocator(mappings.codeEditorElement);
			return utils.waitAndPerformOperation(driver, sEditorLocator, function(oEditorElement) {
				return oEditorElement.clear();
			}, configuration.defaultTimeout);*/
			var sEditorLocator = utils.toLocator(mappings.codeEditorElement);
			var oEditor;
			return driver.myWait(sEditorLocator, configuration.defaultTimeout).then(function(editor) {
				oEditor = editor;
				return driver.wait(until.elementIsVisible(oEditor), configuration.defaultTimeout);
			}).then(function(){
				return oEditor.clear();
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
		setText : function(sText) {
			driver.sleep(500);
			var sEditorLocator = utils.toLocator(mappings.codeEditorElement1);
			return driver.myWait(sEditorLocator, configuration.defaultTimeout).then(function(oEditorElement) {
				return oEditorElement.getAttribute("id");
			}).then(function(sId) {
				return driver.executeScript(function() {
					var oEditorControl = sap.ui.getCore().byId(arguments[0]);
					oEditorControl.setValue(arguments[1]);
				}, sId, sText);

			});
		},
		getText : function() {
			var sEditorLocator = utils.toLocator(mappings.codeEditorElement1);
			return driver.myWait(sEditorLocator, configuration.defaultTimeout).then(function(oEditorElement) {
				return oEditorElement.getAttribute("id");
			}).then(function(sId) {
				return driver.executeScript(function() {
					var oEditorControl = sap.ui.getCore().byId(arguments[0]);
					return oEditorControl.getValue();
				}, sId);

			});
		},

		fixTextInEditor1 :function(oSerach,url) {
			var that = this;

			return this.getText().then(function (text) {

				var texp_to_replace = text;

				replacetext = texp_to_replace.replace(oSerach, url.value_);
				replacetext1 = replacetext.replace("        - name: node-hello-world-backend", "- name: node-hello-world-backend");

				return driver.myWaitAndSendKeys(webdriver.Key.chord(webdriver.Key.CONTROL, "a"), utils.toLocator(mappings.codeEditorElement), configuration.defaultTimeout).then(function () {

					return driver.myWaitAndSendKeys(webdriver.Key.DELETE, utils.toLocator(mappings.codeEditorElement)).then(function () {

						return that.setText(replacetext1).then(function () {

							var saveButton = utils.toLocator(mappings.saveButton);
							return driver.myWaitAndClick(saveButton, configuration.defaultTimeout);
						});
					});
				});

			});
		},
		replacefileinEditor :function(text) {
			var that = this;
			var sEditorLocator = utils.toLocator(mappings.codeEditorElement);
			return driver.myWait(sEditorLocator, configuration.defaultTimeout).then(function() {
				return driver.myWait(sEditorLocator, configuration.defaultTimeout).then(function () {
					return driver.myWaitAndSendKeys(webdriver.Key.chord(webdriver.Key.CONTROL, "a"), sEditorLocator, configuration.defaultTimeout).thenCatch(function (oError) {
						return driver.myWaitAndSendKeys(webdriver.Key.chord(webdriver.Key.CONTROL, "a"), sEditorLocator, configuration.defaultTimeout)
					});
				});
			}).then(function () {
						return driver.myWaitAndSendKeys(webdriver.Key.DELETE, utils.toLocator(mappings.codeEditorElement)).then(function () {
							return that.setText(text).then(function () {
								var saveButton = utils.toLocator(mappings.saveButton);
								return driver.myWaitAndClick(saveButton, configuration.defaultTimeout);
							});
						});
					});
				}


		}





};
