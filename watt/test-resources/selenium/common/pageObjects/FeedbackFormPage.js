var utils = require('../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	BasePageObject = require("./BasePageObject");

function FeedbackFormPage(driver, By, until, configuration, pageObjectFactory) {

	BasePageObject.call(this, driver, By, until, configuration, pageObjectFactory);

	this.mappings = {
		pageObjectLoadedSelector: {type: 'css', path: 'button[class="feedbackButton sapUiBtn sapUiBtnLite sapUiBtnS sapUiBtnStd"]'},
		ratingButton: {type: 'css', path: 'button[aria-posinset="$1"]'},
		textArea: {type: 'css', path: 'textArea[id="__area$1"]'},
		sendButtonDisabled: {type: 'css', path: 'button[title="Send"][aria-disabled="true"]'},
		sendButtonEnabled: {type: 'css', path: 'button[title="Send"][aria-disabled="false"]'},
		cancelButton: {type: 'css', path: 'button[title="Cancel"]'}
	};
}

FeedbackFormPage.prototype = Object.create(BasePageObject.prototype);
FeedbackFormPage.prototype.constructor = FeedbackFormPage;

FeedbackFormPage.prototype.sendFeedback = function(iRating, sFirstArea, sSecondArea, sThirdArea){
	console.log("sendFeedback");
	var that = this;
	return _selectRating.call(this,iRating).then(function(){
		return _fillTextArea.call(that,1, sFirstArea);
	}).then(function(){
		return _fillTextArea.call(that,2, sSecondArea);
	}).then(function(){
		return _fillTextArea.call(that,3, sThirdArea);
	}).then(function(){
		return _clickCancel.call(that);
	});
};

function _selectRating(iRatingIndex) {
	console.log("selectRating " + iRatingIndex);
	var that = this;
	return this.driver.myWait(utils.toLocator(this.mappings.sendButtonDisabled), this.configuration.defaultTimeout).then(function () {
		return that.driver.myWaitAndClick(utils.toLocator(that.mappings.ratingButton, [iRatingIndex]), that.configuration.defaultTimeout);
	}).then(function () {
		return that.driver.myWait(utils.toLocator(that.mappings.sendButtonEnabled), that.configuration.defaultTimeout);
	});
}

function _fillTextArea(iAreaIndex, sText){
	console.log("fillTextArea " + iAreaIndex + " " + sText);
	return this.driver.myWaitAndSendKeys(sText, utils.toLocator(this.mappings.textArea, [iAreaIndex + 2]), this.configuration.defaultTimeout);
}

function _clickSend(){
	console.log("clickSend");
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.sendButtonEnabled), this.configuration.defaultTimeout);
}

function _clickCancel(){
	console.log("clickCancel");
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.cancelButton), this.configuration.defaultTimeout);
}

module.exports = FeedbackFormPage;