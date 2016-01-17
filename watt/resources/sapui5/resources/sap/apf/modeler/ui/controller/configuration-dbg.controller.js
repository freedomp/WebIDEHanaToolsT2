/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.require("sap.apf.modeler.ui.utils.textPoolHelper");
/**
* @class configuration
* @memberOf sap.apf.modeler.ui.controller
* @name configuration
* @description controller for view.configuration
*/
sap.ui.controller("sap.apf.modeler.ui.controller.configuration", {
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.configuration#onInit
	* @description Called on initialization of the view.
	* 			Sets the static texts for all controls in UI.
	* 			Adds style classes to all UI controls.
	* 			Prepares dependecies.
	*  			Sets dynamic text for input controls
	* */
	onInit : function() {
		this.getView().addStyleClass("sapUiSizeCompact");//For non touch devices- compact style class increases the information density on the screen by reducing control dimensions
		this.oViewData = this.getView().getViewData();
		this.oApplicationHandler = this.oViewData.oApplicationHandler;
		this.oConfigurationHandler = this.oViewData.oConfigurationHandler;
		this.oTextPool = this.oConfigurationHandler.getTextPool();
		this.oConfigurationEditor = this.oViewData.oConfigurationEditor;
		this.getText = this.oViewData.getText;
		this.params = this.oViewData.oParams;
		this._setDisplayText();
		this.setDetailData();
		//Set Mandatory Fields
		var mandatoryFields = [];
		mandatoryFields.push(this.byId("idConfigTitle"));
		this._setMandatoryFields(mandatoryFields);
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.configuration#_setDisplayText
	* @description Sets static texts in UI
	* */
	_setDisplayText : function() {
		this.byId("idConfigurationBasicData").setTitle(this.getText("configurationData"));
		this.byId("idConfigTitleLabel").setText(this.getText("configTitle"));
		this.byId("idConfigTitleLabel").setRequired(true);
		this.byId("idConfigTitle").setPlaceholder(this.getText("newConfiguration"));
		this.byId("idConfigurationIdLabel").setText(this.getText("configurationId"));
		this.byId("idSemanticObjectLabel").setText(this.getText("semanticObject"));
		//this.byId("idOriginOfConfigLabel").setText(this.getText("originOfConfig"));
		this.byId("idNoOfCategoriesLabel").setText(this.getText("noOfCategories"));
		this.byId("idNoOfStepsLabel").setText(this.getText("noOfSteps"));
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.configuration#setDetailData
	* @description Sets dynamic texts for controls
	* */
	setDetailData : function() {
		if (this.params && this.params.arguments && this.params.arguments.configId) {
			var oExistingConfig = this.oConfigurationHandler.getConfiguration(this.params.arguments.configId);
		}
		if (oExistingConfig) {
			this.byId("idConfigTitle").setValue(oExistingConfig.AnalyticalConfigurationName);
			if (oExistingConfig.AnalyticalConfiguration.indexOf(sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.ISNEWCONFIG) === -1) { // set the id of the configuration only when it is saved configuration
				this.byId("idConfigurationId").setValue(oExistingConfig.AnalyticalConfiguration);
			}
			var nCategories = this.oConfigurationEditor.getCategories().length;
			var nSteps = this.oConfigurationEditor.getSteps().length;
			this.byId("idNoOfCategories").setValue(nCategories);
			this.byId("idNoOfSteps").setValue(nSteps);
			var appObject = this.oApplicationHandler.getApplication(this.params.arguments.appId);
			if (appObject !== undefined) {
				//self.getView().byId("idOriginOfConfig").setValue(appObject.ApplicationName);
				this.byId("idSemanticObject").setValue(appObject.SemanticObject);
				//TODO set the value of the number of categories, steps and representations when available, for now placeholder is given
			}
		} else {
			var applicationObject = this.oApplicationHandler.getApplication(this.params.arguments.appId);
			if (applicationObject) {
				this.byId("idSemanticObject").setValue(applicationObject.SemanticObject);
			}
		}
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.configuration#handleChangeDetailValue
	* @description Handler for change event on configuration Title input control
	* */
	handleChangeDetailValue : function() { //event handler to check if any value is changed in the configuration form
		var self = this;
		var configInfo = {};
		var sConfigTitle = this.byId("idConfigTitle").getValue().trim();
		var configObj = {
			AnalyticalConfigurationName : sConfigTitle
		};
		if (this.oConfigurationEditor) {
			this.oConfigurationEditor.setIsUnsaved();
		}
		var tempConfigId;
		var oConfigExist = this.oConfigurationHandler.getConfiguration(this.params.arguments.configId);
		if (sConfigTitle !== "" && sConfigTitle !== undefined) {
			if (oConfigExist !== undefined) { //updates a configuration
				this.oConfigurationHandler.setConfiguration(configObj, this.params.arguments.configId);
				//sets the application title
				this.oConfigurationHandler.loadConfiguration(this.params.arguments.configId, function(configurationEditor) {
					var oTranslationFormat = sap.apf.modeler.ui.utils.TranslationFormatMap.APPLICATION_TITLE;
					var sApplicationTitleId = self.oTextPool.setText(sConfigTitle, oTranslationFormat);
					configurationEditor.setApplicationTitle(sApplicationTitleId);
					configInfo.name = sConfigTitle;
					var sTitle = self.getText("configuration") + ": " + sConfigTitle;
					if (sConfigTitle) {
						self.oViewData.updateSelectedNode(configInfo);
						self.oViewData.updateTitleAndBreadCrumb(sTitle);
					}
				});
			} else { //saves a configuration
				tempConfigId = this.oConfigurationHandler.setConfiguration(configObj);
				//sets the application title
				this.oConfigurationHandler.loadConfiguration(tempConfigId, function(configurationEditor) {
					var oTranslationFormat = sap.apf.modeler.ui.utils.TranslationFormatMap.APPLICATION_TITLE;
					var sApplicationTitleId = self.oTextPool.setText(sConfigTitle, oTranslationFormat);
					configurationEditor.setApplicationTitle(sApplicationTitleId);
					var context = {
						appId : self.params.arguments.appId,
						configId : tempConfigId
					};
					configInfo.name = sConfigTitle;
					var sTitle = self.getText("configuration") + ": " + sConfigTitle;
					configInfo.id = oConfigExist === undefined ? configObj.AnalyticalConfiguration : undefined;
					if (sConfigTitle) {
						self.oViewData.updateSelectedNode(configInfo, context);
						self.oViewData.updateTitleAndBreadCrumb(sTitle);
					}
				});
			}
		}
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.category#_setMandatoryFields
	 * @param {Array} fields - Array of form fields
	 * @description Set mandatory fields on the instance level  
	 * */
	_setMandatoryFields : function(fields) {
		this.mandatoryFields = this.mandatoryFields || [];
		for( var i = 0; i < fields.length; i++) {
			fields[i].isMandatory = true;
			this.mandatoryFields.push(fields[i]);
		}
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.category#_getMandatoryFields
	 * @param {Object} oEvent - Event instance of the form field 
	 * @description getter for mandatory fields
	 * */
	_getMandatoryFields : function() {
		return this.mandatoryFields;
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.category#_setValidationState
	 * @param {Object} oEvent - Event instance of the form field 
	 * @description Set validation state of sub view
	 * */
	_setValidationState : function() {
		var mandatoryFields = this._getMandatoryFields();
		for( var i = 0; i < mandatoryFields.length; i++) {
			if (mandatoryFields[i].isMandatory === true) {
				this.isValidState = (mandatoryFields[i].getValue().trim() !== "") ? true : false;
				if (this.isValidState === false) {
					break;
				}
			}
		}
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.category#getValidationState
	 * @description Getter for getting the current validation state of sub view
	 * */
	getValidationState : function() {
		this._setValidationState(); //Set the validation state of view
		var isValidState = (this.isValidState !== undefined) ? this.isValidState : true;
		return isValidState;
	}
});
