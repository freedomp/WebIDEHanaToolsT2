var utils = require('./Utils'),
	RepositoryBrowser = require('./RepositoryBrowser'),
	promise = require('selenium-webdriver').promise,
	webdriver = require('selenium-webdriver');

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		nextButton : {type : 'css' , path :  "button[type='button'][title='Next'][aria-disabled=false]"},
		finishButton : {type : 'css' , path :"button[type='button'][title='Finish'][aria-disabled=false]"},
		browseButton : {type : 'css' , path :  "button[type='button'][id='__button20'][aria-disabled=false]"},
		newProjectTile :  {type : 'css' , path : '#newProjectTile'},
		templateCategoryCombobox : {type : 'css', path : "#CreateGenerationWizardUI div[role='combobox']"},
		templateCategoryItem : {type : 'css', path : "#sap-ui-static ul[role='listbox'] li[title='$1']"},
		templateSelectionTitle  : {type : 'css' , path : "span[title='Template Selection']"},
		templateTile : {type : 'css' , path : "span[title='$1']"},
		projectNameTextbox : {type : 'css' , path : "input[role='textbox']"},
		systemComboBox : {type : 'css' , path : "input[placeholder='Select a system']"},
		systemComboBoxItem : {type : 'css' , path : "li[title*='$1']"},
		serviceSearchField : {type : 'css' , path : "input[type='search']"},
		servicesTree : {type : 'css' , path : 'div[role="tree"][class*="serviceCatalogStepBottomMargin"]'},
		servicesTreeItem : {type : 'css' , path : "li[title*='$1']"},
		serviceUrlTab :  {type : 'css' , path : "li[title='Service URL']"},
		fileSystemTab :  {type : 'css' , path : "li[title='File System']"},
		DataConnectionFileUploader :  {type : 'css' , path : 'input[type="file"]'},
		serviceUrlDestinationsDropDownButton : {type : 'css' , path : '#DataConnectionPasteURLDestinationsComboBox-icon'},
		serviceUrlDestinationsDropDownItem : {type : 'css' , path : "li[title='$1']"},
		fileSystemTextbox : {type : 'css' , path : "#DataConnectionFileUploader"},
		serviceUrlTextbox : {type : 'css' , path : "#DataConnectionPasteURLTextField"},
		serviceUrlButton : {type : 'css' , path : "#DataConnectionTestButton"},
		ClickAddAnnotationFilesBtn : {type :'css' , path : ".oMenuButton.sapUiBtn.sapUiBtnLite.sapUiBtnS.sapUiMenuButton.sapUiBtnStd"},
		ClickFileSystemBtn : {type :'css' , path : "div#item_file_system-txt.sapUiMnuItmTxt"},
		ClickFromServiceBtn : {type :'css' , path :"div#item_from_service-txt.sapUiMnuItmTxt"},
		ClickFromWorkspaceBtn : {type :'css' , path :"div#item_workspace-txt.sapUiMnuItmTxt"},
		ClickFromAnnotationURLBtn : {type :'css' , path : "div#item_annotation_url-txt.sapUiMnuItmTxt"},
		annotationURLSystemComboBox : {type :'css' , path : "input[aria-autocomplete='list']"},
		annotationURLSystemComboBoxItem : {type :'css' , path : "li[title*='$1']"},
		annotationURLTextBox : {type :'css' , path : "input[role='textbox']"},
		ClickFirstAnnotationFileCheckBox : {type :'css' , path : "span[role='checkbox']"},
		clickFileSystemDialogOkBtn : {type :'xpath' , path :  "//button[text()='OK']"},
		fileSystemAnnoInAnnoTable : {type :'css' , path : "a#__link4-col1-row0.sapUiLnk"},
		serviceAnnoInAnnoTable : {type :'css' , path : "a#__link4-col1-row1.sapUiLnk"},
		remoteAnnoInAnnoTable : {type :'css' , path : "a#__link4-col1-row2.sapUiLnk"},
		serviceUrlApiKeyTextbox : {type : 'css' , path : "#ApiKeyTextField"},
		templateCustomizationTitle : {type : 'css' , path : "span[title*='Template Customization']"},
		templateCustomizationInput : {type : 'css' , path : "#GroupContentGrid$1 input[title='$2']"},
		templateCustomizationCheckbox : {type : 'css' , path : "#GroupContentGrid$1 label[title='$2']"},
		wizardContainer : {type : 'css' , path : "#CreateGenerationWizardUI"},
		wizardContainerHidden : {type : 'css' , path : "div[id='CreateGenerationWizardUI'][style*='hidden']"},
		projectFolder : {type : "css" , path : "li[title='$1'][aria-level='2'][aria-selected='true']"},
		basicInfoStepInputField : {type :'xpath' , path :  "(//input[@role='textbox'])[$1]"},
		versionCB : {type : "css" , path : 'input[value$="(Recommended)"]'},
		templateVersion : {type : "css" , path : 'li[title="$1"]'},
		selectedTemplate : {type : "css" , path : '[class="sapUiUx3DSSVFlow sapUiUx3DSSVItem sapUiUx3DSSVSelected"]'}
	};

	utils.decorateDriver(driver, until);

	var _selectSystemByName = function(systemName) {
		driver.myWaitAndSendKeys(systemName ,utils.toLocator(mappings.systemComboBox), configuration.defaultTimeout);
		return driver.myWaitAndClick(utils.toLocator(mappings.systemComboBoxItem,[systemName]), configuration.defaultTimeout);
	};

	var _selectServiceByName = function(serviceName){
		driver.myWait(utils.toLocator(mappings.servicesTree), configuration.defaultTimeout);
		driver.myWaitAndSendKeys(serviceName ,utils.toLocator(mappings.serviceSearchField), configuration.defaultTimeout);
		return driver.myWaitAndClick(utils.toLocator(mappings.servicesTreeItem,[serviceName]), configuration.defaultTimeout);
	};

	return {

		next : function() {
			return driver.myWaitAndClick(utils.toLocator(mappings.nextButton), configuration.defaultTimeout);
		},

		finishAndWait : function() {
			return driver.myWaitAndClick(utils.toLocator(mappings.finishButton), configuration.defaultTimeout).then(function(){
				console.log("Is wizard container present");
				return driver.isElementPresent(utils.toLocator(mappings.wizardContainer));
			}).then(function(isPresent){
				if (isPresent){
					console.log("wait for wizard container to close");
					return driver.wait(until.elementLocated(utils.toLocator(mappings.wizardContainerHidden)), configuration.defaultTimeout);
				}
				else {
					return promise.fulfilled();
				}
			});
		},

		waitForProjectSelected : function(projectName) {
			var projectFolder = utils.toLocator(mappings.projectFolder, [projectName]);
			return  driver.wait(until.elementLocated(projectFolder), configuration.defaultTimeout);
		},



		openFromWelcomePerspective : function() {
			driver.myWaitAndClick(utils.toLocator(mappings.newProjectTile), configuration.defaultTimeout);
			driver.wait(until.elementLocated(utils.toLocator(mappings.templateSelectionTitle)), configuration.defaultTimeout);
			return driver.wait(until.elementLocated(utils.toLocator(mappings.nextButton)), configuration.defaultTimeout);
		},

		selectTemplateCategory : function(sCategory) {
			var templateCategoryComboboxLocator = utils.toLocator(mappings.templateCategoryCombobox);
			var templateCategoryItemLocator = utils.toLocator(mappings.templateCategoryItem, [sCategory]);
			return driver.myWaitAndClick(templateCategoryComboboxLocator).then(function() {
				return driver.myWaitAndClick(templateCategoryItemLocator);
			});
		},

		selectTemplate : function(templateTitle) {
			return driver.myWait(utils.toLocator(mappings.selectedTemplate), configuration.defaultTimeout).then(function() {
				return driver.myWait(utils.toLocator(mappings.nextButton), configuration.defaultTimeout).then(function () {
					return driver.myWaitAndClick(utils.toLocator(mappings.templateTile, [templateTitle]), configuration.defaultTimeout);
				});
			});

		},

		selectTemplateVersion : function(sVersionTitle){
			driver.myWaitAndClick(utils.toLocator(mappings.versionCB), configuration.defaultTimeout);
			driver.myWaitAndClick(utils.toLocator(mappings.templateVersion,[sVersionTitle]), configuration.defaultTimeout);
			return driver.myWaitAndClick(utils.toLocator(mappings.selectedTemplate,[sVersionTitle]), configuration.defaultTimeout);

		},

		enterProjectName : function(projectName) {
			var projectNameTextbox = utils.toLocator(mappings.projectNameTextbox);
			return driver.myWaitAndSendKeys(projectName,projectNameTextbox,configuration.defaultTimeout).then(function(){
				return driver.myWaitAndSendKeys(webdriver.Key.ENTER, projectNameTextbox);
			});
		},

		enterBasicInfo : function(text, inputFieldIndex) {
			var inputLocator = utils.toLocator(mappings.basicInfoStepInputField, [inputFieldIndex + 1]);
			return driver.myWaitAndClick(inputLocator, configuration.defaultTimeout).then(function(){
			//	return driver.sleep(1000);
			//}).then(function(){
				return driver.myWaitAndSendKeys(text,inputLocator, configuration.defaultTimeout);
			}).then(function() {
				return driver.myWaitAndSendKeys(webdriver.Key.ENTER, inputLocator);
			});
		},

		selectServiceFromCatalog : function(systemName, serviceName){
			_selectSystemByName(systemName);
			return _selectServiceByName(serviceName);
		},

		selectServiceFromFileSystem : function(servicePath){
			driver.myWaitAndClick(utils.toLocator(mappings.fileSystemTab), configuration.defaultTimeout);
			return driver.myWaitAndSendKeys(servicePath, utils.toLocator(mappings.DataConnectionFileUploader) , configuration.startupTimeout);
		},

		selectAnnotationFromFileSystem : function( annotationPath){
			driver.myWaitAndClick(utils.toLocator(mappings.ClickAddAnnotationFilesBtn), configuration.defaultTimeout);
			driver.myWaitAndClick(utils.toLocator(mappings.ClickFileSystemBtn), configuration.defaultTimeout);
			driver.myWaitAndSendKeys(annotationPath, utils.toLocator(mappings.DataConnectionFileUploader) , configuration.startupTimeout);
			driver.myWaitAndClick(utils.toLocator(mappings.clickFileSystemDialogOkBtn), configuration.defaultTimeout);
			return driver.sleep(1000);
		},

		selectAnnotationFromService : function(){
			return driver.myWaitAndClick(utils.toLocator(mappings.ClickAddAnnotationFilesBtn), configuration.defaultTimeout).then(function() {
				 return driver.sleep(1500);
			}).then(function(){
				return driver.wait(until.elementLocated(utils.toLocator(mappings.ClickFromServiceBtn)), 4000);
			}).then(function(){
				return driver.myWaitAndClick(utils.toLocator(mappings.ClickFromServiceBtn), configuration.defaultTimeout);
			}).then(function(){
				driver.sleep(1500);
				return driver.myWaitAndClick(utils.toLocator(mappings.ClickFirstAnnotationFileCheckBox), configuration.defaultTimeout);
			}).then(function(){
				driver.sleep(1500);
				return driver.myWaitAndClick(utils.toLocator(mappings.clickFileSystemDialogOkBtn), configuration.defaultTimeout);
			}).then(function(){
				driver.wait(until.elementLocated(utils.toLocator(mappings.serviceAnnoInAnnoTable)), configuration.defaultTimeout);
				return driver.myWaitAndClick(utils.toLocator(mappings.serviceAnnoInAnnoTable), configuration.defaultTimeout);
			});
		},

		selectAnnotationFromURL : function(){
			var sSystem = "UIA_for_testing";
			var sServiceUrl = "/sap/bc/bsp/sap/zprototypesomds/annotation.xml/";
			return driver.myWaitAndClick(utils.toLocator(mappings.ClickAddAnnotationFilesBtn), configuration.defaultTimeout).then(function() {
				driver.myWaitAndClick(utils.toLocator(mappings.ClickFromAnnotationURLBtn), configuration.defaultTimeout);
			}).then(function(){
					return driver.myWaitAndSendKeys(sSystem ,utils.toLocator(mappings.annotationURLSystemComboBox), configuration.defaultTimeout);
				}).then(function(){
				driver.sleep(1500);
					return driver.myWaitAndSendKeys(sServiceUrl,
						utils.toLocator(mappings.annotationURLTextBox) , configuration.startupTimeout);
				}).then(function(){
				driver.sleep(1500);
					return driver.myWaitAndClick(utils.toLocator(mappings.clickFileSystemDialogOkBtn), configuration.defaultTimeout);
				}).then(function(){
				driver.sleep(1500);
				driver.wait(until.elementLocated(utils.toLocator(mappings.remoteAnnoInAnnoTable)), configuration.defaultTimeout);
				driver.sleep(1500);
				return driver.myWaitAndClick(utils.toLocator(mappings.remoteAnnoInAnnoTable), configuration.defaultTimeout);
			});
		},

		enterServiceUrl : function(destinationName, url, apiKey) {
			driver.myWaitAndClick(utils.toLocator(mappings.serviceUrlTab), configuration.defaultTimeout);
			driver.myWaitAndClick(utils.toLocator(mappings.serviceUrlDestinationsDropDownButton), configuration.defaultTimeout);
			driver.myWaitAndClick(utils.toLocator(mappings.serviceUrlDestinationsDropDownItem,[destinationName]), configuration.defaultTimeout);
			if (url) {
				var serviceUrlTextbox = utils.toLocator(mappings.serviceUrlTextbox);
				driver.wait(until.elementLocated(serviceUrlTextbox), configuration.defaultTimeout);
				driver.findElement(serviceUrlTextbox).sendKeys(url);
				driver.myWaitAndClick(utils.toLocator(mappings.serviceUrlButton), configuration.defaultTimeout);
			}
			if (apiKey) {
				var apiKeyTextbox = utils.toLocator(mappings.serviceUrlApiKeyTextbox);
				driver.wait(until.elementLocated(apiKeyTextbox), configuration.defaultTimeout);
				driver.findElement(apiKeyTextbox).sendKeys(apiKey);
			}

			return driver.wait(until.elementLocated(utils.toLocator(mappings.nextButton)), configuration.defaultTimeout);
		},

		waitForTemplateCustomizationStep : function() {
			return driver.wait(until.elementLocated(utils.toLocator(mappings.templateCustomizationTitle)), configuration.defaultTimeout);
		},

		enterTemplateCustomizationText : function(text, groupIndex, inputTitle) {
			groupIndex = groupIndex ? groupIndex : 0;
			var inputLocator = utils.toLocator(mappings.templateCustomizationInput, [groupIndex, inputTitle]);
			return driver.myWaitAndClick(inputLocator, configuration.defaultTimeout).then(function(){
				return driver.sleep(1000);
			}).then(function(){
				return driver.myWaitAndSendKeys(text,inputLocator, configuration.defaultTimeout);
			}).then(function() {
				return driver.myWaitAndSendKeys(webdriver.Key.ENTER, inputLocator);
			});
		},

		clickTemplateCustomizationCheckbox : function(groupIndex, labelTitle) {
			groupIndex = groupIndex ? groupIndex : 0;
			var labelLocator = utils.toLocator(mappings.templateCustomizationCheckbox, [groupIndex, labelTitle]);
			return driver.myWaitAndClick(labelLocator, configuration.defaultTimeout);
		},

		configureTemplateCustomizationstep : function(){

			var that = this;

			//TODO: extract strings
			var templateCustomizationODataCollection = By.css("#GroupContentGrid0 input[title='OData Collection']");
			return driver.myWaitAndSendKeys("DamageReportSet",templateCustomizationODataCollection, configuration.defaultTimeout).then(function(){
				that.enterTemplateCustomizationText("DamageReport", 1, 'Title attribute from the OData collection');
			}).then(function(){
				that.enterTemplateCustomizationText("Status", 1, 'Status attribute from the OData collection');
			}).then(function(){
				that.enterTemplateCustomizationText("ClaimedsumCurrencyCode", 1, 'Unit of Measure from the OData collection');
			}).then(function(){
				that.enterTemplateCustomizationText("CreatedOn", 1, 'Date attribute from the OData collection');
			}).then(function(){
				that.enterTemplateCustomizationText(configuration.detailsPageTitle, 2, 'Title');
			}).then(function(){
				that.enterTemplateCustomizationText("CheckedOn", 2, 'Editable date attribute from the OData collection');
			}).then(function(){
				that.enterTemplateCustomizationText("Comment", 2, 'Editable text attribute from the OData collection');
			}).then(function(){
				that.clickTemplateCustomizationCheckbox(2, 'Add Approve/Reject buttons');
			}).then(function(){
				that.enterTemplateCustomizationText("AttachmentSet", 3, 'Photos OData collection');
			}).then(function(){
				that.enterTemplateCustomizationText("Filename", 3, 'File name attribute from the photos OData collection');
			}).then(function(){
				that.enterTemplateCustomizationText("ContentType", 3, 'File content type attribute from the photos OData collection');
			}).then(function(){
				that.enterTemplateCustomizationText("DamageReportId", 3, 'ID attribute for the related item in the parent OData collection');
			});
		},

		generateNewMDWithPhotosProject : function(sProjectName, sMetadataPath){

			var that = this;
			console.log("Open wizard from Welcome screen");
			return this.openFromWelcomePerspective().then(function(){
				console.log("select template category");
				return that.selectTemplateCategory(configuration.templateCategory);
			}).then(function(){
				console.log("Select Template");
			 	return that.selectTemplate(configuration.templateName);
			}).then(function(){
				console.log("select template version");
				return that.selectTemplateVersion(configuration.templateVersion);
			}).then(function(){
				console.log("next");
				return that.next();
			}).then(function(){
				console.log("Enter project name");
				return that.enterProjectName(sProjectName ? sProjectName : configuration.projectName);
			}).then(function(){
				console.log("next");
				return that.next();
			}).then(function(){
				console.log("selectServiceFromFileSystem");
				return that.selectServiceFromFileSystem(sMetadataPath);
			}).then(function(){
			//	console.log("Enter service Url");
			//	return that.enterServiceUrl(configuration.catalogDestination,configuration.catalogServiceUrl, configuration.apiKey);
			//}).then(function(){
				console.log("next");
				return that.next();
			}).then(function(){
				console.log("Wait for template customization step");
				return that.waitForTemplateCustomizationStep();
			}).then(function(){
				console.log("Configure template customization step");
				return that.configureTemplateCustomizationstep();
			}).then(function(){
				console.log("next");
				return that.next();
			}).then(function(){
				console.log("next");
				return that.next();
			}).then(function(){
				console.log("Finish");
				return that.finishAndWait();
			});
		}
	};

};
