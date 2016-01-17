var utils = require('../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	BasePageObject = require("./BasePageObject");

function DevelopmentPerspectivePage(driver, By, until, configuration, pageObjectFactory) {

	BasePageObject.call(this, driver, By, until, configuration, pageObjectFactory);

	this.mappings = {
		pageObjectLoadedSelector: {type: 'css', path: 'button[id$="applicationLeftSidebar-tools.development"][aria-disabled="true"]'},
		newProjectTile: {type: 'css', path: '#newProjectTile'}
	};
}

DevelopmentPerspectivePage.prototype = Object.create(BasePageObject.prototype);
DevelopmentPerspectivePage.prototype.constructor = DevelopmentPerspectivePage;

DevelopmentPerspectivePage.prototype.goToRepositoryBrowserModule = function(){
	return this.pageObjectFactory.createPageObjectInstance("/RepositoryBrowserModule");
};

module.exports = DevelopmentPerspectivePage;