var utils = require('../Utils');

module.exports = function (driver, By, until, configuration) {
	'use strict';

	var mappings = {
		codeEditorElement : {type: 'css', path : '.multiEditor .ace_editor'},
	};

	utils.decorateDriver(driver, until);

	function _getEditorControl(oEditorElement) {

	}

	return {

		setText : function(sText) {
			var sEditorLocator = utils.toLocator(mappings.codeEditorElement);
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
			var sEditorLocator = utils.toLocator(mappings.codeEditorElement);
			return driver.myWait(sEditorLocator, configuration.defaultTimeout).then(function(oEditorElement) {
				return oEditorElement.getAttribute("id");
			}).then(function(sId) {
				return driver.executeScript(function() {
					var oEditorControl = sap.ui.getCore().byId(arguments[0]);
					return oEditorControl.getValue();
				}, sId);

			});
		},

		clearText : function() {
			var sEditorLocator = utils.toLocator(mappings.codeEditorElement);
			return driver.myWait(sEditorLocator, configuration.defaultTimeout).then(function(oEditorElement) {
				return oEditorElement.getAttribute("id");
			}).then(function(sId) {
				return driver.executeScript(function() {
					var oEditorControl = sap.ui.getCore().byId(arguments[0]);
					return oEditorControl.setValue("");
				}, sId);

			});
		}
	};

};
