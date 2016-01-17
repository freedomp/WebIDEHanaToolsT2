var webide = require('./WebIDE');

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var webIDE = new webide(driver, By, until, configuration);
	return {
		runAsUnitTest : function(sPath , sFileName){
			return webIDE.getRepositoryTreeFileElement(sPath ,sFileName).then(function(oFileElement){
				return driver.rightClick(oFileElement);
			}).then(function(){
				return webIDE.selectFromContextMenu("Run/Run as/Unit Test");
			});
		}
	};
};
