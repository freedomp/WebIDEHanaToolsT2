var utils = require('../Utils');
var webdriver = require('selenium-webdriver');

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		// Common selectors
		dropdownListItem : {type: 'css', path: '#sap-ui-static .sapUiShd ul[role="listbox"] li[title="$1"]'},
		dialogOkButton : {type: 'xpath', path: '//div[@id="sap-ui-static"]//div[@class="sapUiDlgBtns"]//button[.="OK"]'},
		dialogCancelButton : {type: 'xpath', path: '//div[@id="sap-ui-static"]//div[@class="sapUiDlgBtns"]//button[.="Cancel"]'},
		
		// General container
		generalIdTextField : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-general---Panel")]//div[label[.="ID"]]/following-sibling::div[1]//input'},
		generalTypeDropdown : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-general---Panel")]//div[label[.="Type"]]/following-sibling::div[1]//input'},
		generalTitleTextField : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-general---Panel")]//div[label[.="Title"]]/following-sibling::div[1]//input'},
		generalDescriptionTextField : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-general---Panel")]//div[label[.="Description"]]/following-sibling::div[1]//input'},
		generalSourceTemplateTextField : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-general---Panel")]//div[label[.="Source Template"]]/following-sibling::div[1]//input'},
		generalI18nFilePathTextField : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-general---Panel")]//div[label[.="I18n File Path"]]/following-sibling::div[1]//input'},
		generalVersionTextField : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-general---Panel")]//div[label[.="Version"]]/following-sibling::div[1]//input'},
		generalTagsListbox : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-general---Panel")]//div[label[.="Tags (Keywords)"]]/following-sibling::div[1]//ul'},
		generalTagsListboxAddButton : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-general---Panel")]//div[label[.="Tags (Keywords)"]]/following-sibling::div[1]//*[contains(concat(" ", normalize-space(@class), " "), " sapIDEButtonAdd")]'},
		generalTagsListboxRemoveButton : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-general---Panel")]//div[label[.="Tags (Keywords)"]]/following-sibling::div[1]//*[contains(concat(" ", normalize-space(@class), " "), " sapIDEButtonRemove")]'},
		generalApplicationComponentTextField : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-general---Panel")]//div[label[.="Application Component"]]/following-sibling::div[1]//input'},

		// Sapui5 container
		sapui5ResourcesListbox : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-sapui5---Panel")]//div[label[.="Resources"]]/following-sibling::div[1]//ul'},
		sapui5ResourcesListboxAddButton : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-sapui5---Panel")]//div[label[.="Resources"]]/following-sibling::div[1]//*[contains(concat(" ", normalize-space(@class), " "), " sapIDEButtonAdd")]'},
		sapui5ResourcesListboxRemoveButton : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-sapui5---Panel")]//div[label[.="Resources"]]/following-sibling::div[1]//*[contains(concat(" ", normalize-space(@class), " "), " sapIDEButtonRemove")]'},
		sapui5DependenciesListbox : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-sapui5---Panel")]//div[label[.="Dependencies"]]/following-sibling::div[1]//ul'},
		sapui5DependenciesListboxAddButton : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-sapui5---Panel")]//div[label[.="Dependencies"]]/following-sibling::div[1]//*[contains(concat(" ", normalize-space(@class), " "), " sapIDEButtonAdd")]'},
		sapui5DependenciesListboxRemoveButton : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-sapui5---Panel")]//div[label[.="Dependencies"]]/following-sibling::div[1]//*[contains(concat(" ", normalize-space(@class), " "), " sapIDEButtonRemove")]'},
		
		// User interface container
		userInterfaceTechnologyDropdown : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//div[label[.="Technology"]]/following-sibling::div[1]//input'},
		userInterfacePhoneButton : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//button[span[.="Phone"]]'},
		userInterfaceTabletButton : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//button[span[.="Tablet"]]'},
		userInterfaceDesktopButton : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//button[span[.="Desktop"]]'},
		userInterfaceThemesListbox : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//div[label[.="Themes"]]/following-sibling::div[1]//ul'},
		userInterfaceThemesListboxAddButton : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//div[label[.="Themes"]]/following-sibling::div[1]//*[contains(concat(" ", normalize-space(@class), " "), " sapIDEButtonAdd")]'},
		userInterfaceThemesListboxRemoveButton : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//div[label[.="Themes"]]/following-sibling::div[1]//*[contains(concat(" ", normalize-space(@class), " "), " sapIDEButtonRemove")]'},
		
		// Application icons
		userInterfaceMainIconValueHelpTextField : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//div[label[.="Main"]]/following-sibling::div[1]//input'},
		userInterfaceMainIconValueHelpButton : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//div[label[.="Main"]]/following-sibling::div[1]//span'},
		userInterfacePhone57pxIconTextField : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//div[label[.="Phone 57 px"]]/following-sibling::div[1]//input'},
		userInterfacePhone114pxIconTextField : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//div[label[.="Phone 114 px"]]/following-sibling::div[1]//input'},
		userInterfacePhone72pxIconTextField : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//div[label[.="Phone 72 px"]]/following-sibling::div[1]//input'},
		userInterfacePhone144pxIconTextField : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//div[label[.="Phone 144 px"]]/following-sibling::div[1]//input'},
		userInterfaceFavoritesIconTextField : {type: 'xpath', path: '//div[contains(@id, "appDescriptor-settings-userInterface---Panel")]//div[label[.="Favorites"]]/following-sibling::div[1]//input'},
		
		// Dialogs
		addKewywordDialogKeywordTextField : {type: 'xpath', path: '//div[@id="sap-ui-static"]//div[label[.="Keyword"]]/following-sibling::div[1]//input'},
		addResourceDialogResourceTypeDropdownButton : {type: 'xpath', path: '//div[@id="sap-ui-static"]//div[label[.="Resource Type"]]/following-sibling::div[1]//input[@id="appDescriptorListWithAddRemoveCombo-icon"]'},
		addResourceDialogUriTextField : {type: 'xpath', path: '//div[@id="sap-ui-static"]//div[label[.="URI"]]/following-sibling::div[1]//input'},
		ThemesDialogThemeTextField : {type: 'xpath', path: '//div[@id="sap-ui-static"]//div[label[.="Theme"]]/following-sibling::div[1]//input'},
		//TODO add dependencies dialog
	};

	utils.decorateDriver(driver, until);

	function _setValue(oMapping, sText) {
		return driver.myWaitAndSendKeys(sText, utils.toLocator(oMapping), configuration.defaultTimeout);
	}


	function _pressEnter(oMapping){
		return driver.myWaitAndSendKeys(webdriver.Key.ENTER, utils.toLocator(oMapping));
	}
	
	function _clearValue(oMapping) {
		return driver.myWait(utils.toLocator(oMapping), configuration.defaultTimeout).then(function(oElement){
			return oElement.clear();
		});
	}
	
	function _getValue(oMapping) {
		return driver.myWait(utils.toLocator(oMapping), configuration.defaultTimeout).then(function(oElement) {
			return oElement.getAttribute("value");
		});
	}
	
	function _chooseFromDropDownList(oDropDownMapping, sListItemTitle) {
		return driver.myWaitAndClick(utils.toLocator(oDropDownMapping), configuration.defaultTimeout).then(function() {
			return driver.myWaitAndClick(utils.toLocator(mappings.dropdownListItem, [sListItemTitle]), configuration.defaultTimeout);
		});
	}

	return {
		
		setId : function(sId) {
			return _setValue(mappings.generalIdTextField, sId);
		},

		pressEnterOnId : function(){
			return _pressEnter(mappings.generalIdTextField);
		},

		clearId: function() {
			return _clearValue(mappings.generalIdTextField);
		},
		
		getId: function() {
			return _getValue(mappings.generalIdTextField);
		},
		
		chooseType : function(sType) {
			return _chooseFromDropDownList(mappings.generalTypeDropdown, sType);
		},
		
		getType: function() {
			return _getValue(mappings.generalTypeDropdown);
		},
		
		setTitle : function(sTitle) {
			return _setValue(sTitle, mappings.generalTitleTextField);	
		},
		
		getTitle: function() {
			return _getValue(mappings.generalTitleTextField);
		},
		
		setDescription : function(sDescription) {
			return _setText(sDescription, mappings.generalDescriptionTextField);	
		},
		
		getDescription: function() {
			return _getValue(mappings.generalDescriptionTextField);
		},
		
		getSourceTemplate: function() {
			return _getValue(mappings.generalSourceTemplateTextField);
		},
		
		setI18nFilePath : function(sI18nFilePath) {
			return _setText(sI18nFilePath, mappings.generalI18nFilePathTextField);	
		},
		
		getI18nFilePath: function() {
			return _getValue(mappings.generalI18nFilePathTextField);
		},
		
		setVersion : function(sVersion) {
			return _setText(sVersion, mappings.generalVersionTextField);	
		},
		
		getVersion: function() {
			return _getValue(mappings.generalVersionTextField);
		},
		
		//TODO
		AddKeyword: function(sKeyword) {
			
		},
		
		//TODO
		removeKeyword: function(sKeyword) {
			
		},
		
		//TODO
		AddResource: function(sResourceType, sUri, sId) {
			
		},
		
		//TODO
		removeResource: function(sResourceName) {
			
		},
		
		setApplicationComponent : function(sApplicationComponent) {
			return _setText(sApplicationComponent, mappings.generalApplicationComponentTextField);	
		},
		
		getApplicationComponent: function() {
			return _getValue(mappings.generalApplicationComponentTextField);
		},
		
		chooseTechnology : function(sTechnology) {
			return _chooseFromDropDownList(mappings.userInterfaceTechnologyDropdown, sTechnology);
		},
		
		getTechnology: function() {
			return _getValue(mappings.userInterfaceTechnologyDropdown);
		},
		
		togglePhoneButton: function() {
		
		},
		
		toggleTableButton: function() {
		
		},
		
		toggleDesktopButton: function() {
		
		},
		
		AddTheme: function() {
			
		},
		
		removeTheme: function() {
			
		},
		
		chooseMainIcon: function(sIconName) {
			
		},
		
		getMainIcon: function() {
			
		},
		
		setPhone57pxIconPath : function(sIconPath) {
			
		},
		
		getPhone57pxIconPath : function() {
			
		},
		
		setPhone114pxIconPath : function(sIconPath) {
			
		},
		
		getPhone114pxIconPath : function() {
			
		},
		
		setPhone72pxIconPath : function(sIconPath) {
			
		},
		
		getPhone72pxIconPath : function() {
			
		},
		
		setPhone144pxIconPath : function(sIconPath) {
			
		},
		
		getPhone144pxIconPath : function() {
			
		},
		
		setPhoneFavoritesIconPath : function(sIconPath) {
			
		},
		
		getPhoneFavoritesIconPath : function() {
			
		}
	};

};