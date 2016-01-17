var utils = require('./Utils');

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		logoutButton : {type : 'css' , path : '#userInfoLogout'},
		goodbyeConteiner : {type : 'css' , path : '.logoutContent h1'},
		logoutImg : {type : 'css' , path : '.logoutContent img'},
		logBackOnLink : {type : 'css' , path : '.link a'}
	};

	utils.decorateDriver(driver, until);


	return {

		pressButton : function() {
			var sButtonLocator = utils.toLocator(mappings.logoutButton);
			return driver.myWaitAndClick(sButtonLocator).then(function(){
			});
		},

		getGoodbyeText : function(){
			var goodbyeConteiner = utils.toLocator(mappings.goodbyeConteiner);
			return driver.wait(until.elementLocated(goodbyeConteiner), configuration.defaultTimeout).then(function(oElement) {
				return oElement.getText();
			});
		},

		isImageDisplayed : function(){
			var logoutImg = utils.toLocator(mappings.logoutImg);
			return driver.wait(until.elementLocated(logoutImg), configuration.defaultTimeout).then(function(oElement) {
				return oElement.isDisplayed();
			});

		},

		logBackToWebIde : function(){
			var logBackOnLink = utils.toLocator(mappings.logBackOnLink);
			return driver.wait(until.elementLocated(logBackOnLink), configuration.defaultTimeout).then(function(oElement) {
		 		oElement.click();
			});
		}
	};
};
