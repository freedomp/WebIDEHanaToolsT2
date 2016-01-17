var utils = require('../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	BasePageObject = require("./BasePageObject");

function WelcomePerspectivePage(driver, By, until, configuration, pageObjectFactory) {

	BasePageObject.call(this, driver, By, until, configuration, pageObjectFactory);

	this.mappings = {
		pageObjectLoadedSelector: {type: 'css', path: 'button[id$="applicationLeftSidebar-tools.welcome"][aria-disabled="true"]'},
		newProjectTile: {type: 'css', path: '#newProjectTile'}
	};
};

WelcomePerspectivePage.prototype = Object.create(BasePageObject.prototype);
WelcomePerspectivePage.prototype.constructor = WelcomePerspectivePage;

WelcomePerspectivePage.prototype.clickOnNewProjectFromTemplateButtonAndGoToTemplateSelectionPage = function(){
	console.log("clickOnNewProjectFromTemplateButtonAndGoToTemplateSelectionPage");
	var that = this;
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.newProjectTile), this.configuration.defaultTimeout).then(function(){
		return that.pageObjectFactory.createPageObjectInstance("/wizard/TemplateSelectionWizardPage");
	});
};

module.exports = WelcomePerspectivePage;