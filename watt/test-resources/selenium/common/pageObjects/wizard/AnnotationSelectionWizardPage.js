var utils = require('../../utilities/Utils'),
	webdriver = require('selenium-webdriver'),
	BaseWizardPage = require("./BaseWizardPage");

'use strict';
function AnnotationSelectionWizardPage(driver, By, until, configuration, pageObjectFactory) {

	BaseWizardPage.call(this, driver, By, until, configuration, pageObjectFactory);
	this.mappings = {
		pageObjectLoadedSelector  : {type : 'css' , path : "span[title*='Annotation Selection']"},
		ClickAddAnnotationFilesBtn : {type :'css' , path : ".oMenuButton.sapUiBtn.sapUiBtnLite.sapUiBtnS.sapUiMenuButton.sapUiBtnStd"},
		ClickFileSystemBtn : {type :'css' , path : "div#item_file_system-txt.sapUiMnuItmTxt"},
		clickFileSystemDialogOkBtn : {type :'xpath' , path :  "//button[text()='OK']"},
		DataConnectionFileUploader :  {type : 'css' , path : 'input[type="file"]'},
		overlayPopupHidden :  { type : 'css' , path : "div[id='sap-ui-blocklayer-popup'][style*='hidden']"}
	};

}

AnnotationSelectionWizardPage.prototype = Object.create(BaseWizardPage.prototype);
AnnotationSelectionWizardPage.prototype.constructor = AnnotationSelectionWizardPage;

AnnotationSelectionWizardPage.prototype.selectAnnotationFromFileSystem = function( annotationPath){
	console.log("selectAnnotationFromFileSystem");
	var that = this;
	return this.driver.myWaitAndClick(utils.toLocator(this.mappings.ClickAddAnnotationFilesBtn), this.configuration.defaultTimeout).then(function(){
		return that.driver.myWaitAndClick(utils.toLocator(that.mappings.ClickFileSystemBtn), that.configuration.defaultTimeout);
	}).then(function(){
		return that.driver.myWaitAndSendKeys(annotationPath, utils.toLocator(that.mappings.DataConnectionFileUploader) , that.configuration.startupTimeout);
	}).then(function(){
		return that.driver.myWaitAndClick(utils.toLocator(that.mappings.clickFileSystemDialogOkBtn), that.configuration.defaultTimeout);
	}).then(function(){
		//TODO: can this sleep be replaced by a wait?
		//return that.driver.sleep(1000);
		return that.driver.myWait(utils.toLocator(that.mappings.overlayPopupHidden), that.configuration.defaultTimeout);
	});
};


module.exports = AnnotationSelectionWizardPage;
