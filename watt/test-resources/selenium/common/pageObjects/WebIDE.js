
var utils = require('../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	BasePageObject = require("./BasePageObject"),
	promise = webdriver.promise;

'use strict';
function WebIDE(driver, By, until, configuration, pageObjectFactory) {

	BasePageObject.call(this, driver, By, until, configuration, pageObjectFactory);

	this.mappings = {
		welcomePerspectiveButton: {type: 'css', path: 'button[id$="applicationLeftSidebar-tools.welcome"]'},
		pageObjectLoadedSelector : {type: 'css', path: 'button[id$="applicationLeftSidebar-tools.welcome"]'},
		welcomePerspectiveButtonDisabled: {type: 'css', path: 'button[id*="welcome"][aria-disabled="true"]'},
		developmentPerspectiveButton: {type: 'css', path: 'button[id*="development"][aria-disabled="false"]'},
		developmentPerspectiveButtonDisabled: {type: 'css', path: 'button[id*="development"][aria-disabled="true"]'},
		userpreferencePerspectiveButton: {type: 'css', path: 'button[id*="userpreference"][aria-disabled="false"]'},
		userpreferencePerspectiveButtonDisabled: {
			type: 'css',
			path: 'button[id*="userpreference"][aria-disabled="true"]'
		},
		feedbackButton: {type: 'css', path: 'button[class="feedbackButton sapUiBtn sapUiBtnLite sapUiBtnS sapUiBtnStd"]'}
	};
}

WebIDE.prototype = Object.create(BasePageObject.prototype);
WebIDE.prototype.constructor = WebIDE;

function _clickOnPerspectiveButton(welcomePerspectiveButtonLocator, welcomePerspectiveButtonDisabledLocator, timeout){
	var waitTimeout = timeout ? timeout : this.configuration.startupTimeout;
 	var that = this;
	return this.driver.wait(this.until.elementLocated(welcomePerspectiveButtonLocator), waitTimeout).then(function(){
		return that.driver.isElementPresent(welcomePerspectiveButtonDisabledLocator);
	}).then(function(isPresent){
		if (isPresent) {
			return promise.fulfilled();
		}
		else {
			return that.driver.myWaitAndClick(welcomePerspectiveButtonLocator,waitTimeout);
		}
	});
}

WebIDE.prototype.clickWelcomePerspectiveButtonAndGoToWelcomePerspectivePage = function(timeout) {
	console.log("clickWelcomePerspectiveButtonAndGoToWelcomePerspectivePage");
	var that = this;
	return _clickOnPerspectiveButton.call(this,utils.toLocator(this.mappings.welcomePerspectiveButton), utils.toLocator(this.mappings.welcomePerspectiveButtonDisabled),timeout).then(function(){
		return that.pageObjectFactory.createPageObjectInstance("/WelcomePerspectivePage");
	});
};

WebIDE.prototype.clickDevelopmentPerspectiveAndGoToDevelopmentPerspectivePage = function(timeout) {
	console.log("clickDevelopmentPerspectiveAndGoToDevelopmentPerspectivePage");
	var that = this;
	return _clickOnPerspectiveButton.call(this,utils.toLocator(this.mappings.developmentPerspectiveButton), utils.toLocator(this.mappings.developmentPerspectiveButtonDisabled),timeout).then(function(){
		return that.pageObjectFactory.createPageObjectInstance("/DevelopmentPerspectivePage");
	});
};

WebIDE.prototype.clickFeedbackAndGoToFeedbackForm = function(timeout) {
	console.log("clickFeedbackAndGoToFeedbackForm");
	var that = this;
	var waitTimeout = timeout ? timeout : this.configuration.startupTimeout;
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.feedbackButton), waitTimeout).then(function(){
		return that.pageObjectFactory.createPageObjectInstance("/FeedbackFormPage");
	});
};

WebIDE.prototype.clickPreferencesPerspectiveAndGoToPreferencesPerspectivePage = function(timeout) {
	console.log("clickPreferencesPerspectiveAndGoToPreferencesPerspectivePage");
	var that = this;
	return _clickOnPerspectiveButton.call(this,utils.toLocator(this.mappings.userpreferencePerspectiveButton), utils.toLocator(this.mappings.userpreferencePerspectiveButtonDisabled),timeout).then(function(){
		return that.pageObjectFactory.createPageObjectInstance("/PreferencesPerspectivePage");
	});
};

//TODO:refactor as clickDevelopmentPerspectiveAndGoToDevelopmentPerspectivePage
//WebIDE.prototype.clickUserpreferencePerspective = function(timeout) {
//			var waitTimeout = timeout ? timeout : configuration.startupTimeout;
//			var developmentButton = utils.toLocator(mappings.userpreferencePerspectiveButton);
//			return driver.wait(until.elementLocated(developmentButton), waitTimeout).then(function(){
//				var developmentButtonDisabled = utils.toLocator(mappings.userpreferencePerspectiveButtonDisabled);
//				return driver.isElementPresent(developmentButtonDisabled);
//			}).then(function(isPresent){
//				if (isPresent) {
//					return promise.fulfilled();
//				}
//				else {
//					return driver.myWaitAndClick(developmentButton,waitTimeout);
//				}
//			});
//		};

module.exports = WebIDE;