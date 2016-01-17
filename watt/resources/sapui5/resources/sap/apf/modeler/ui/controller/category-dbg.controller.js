/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.require("sap.apf.modeler.ui.utils.textPoolHelper");
/**
* @class category
* @memberOf sap.apf.modeler.ui.controller
* @name category
* @description controller for view.category
*/
sap.ui.controller("sap.apf.modeler.ui.controller.category", {
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.category#onInit
	* @description Called on initialization of the view.
	* 			Sets the static texts for all controls in UI.
	* 			Adds style classes to all UI controls.
	* 			Prepares dependecies.
	*  			Sets dynamic text for input controls
	* */
	onInit : function() {
		this.getView().addStyleClass("sapUiSizeCompact");//For non touch devices- compact style class increases the information density on the screen by reducing control dimensions
		this.oViewData = this.getView().getViewData();
		this.oConfigurationHandler = this.oViewData.oConfigurationHandler;
		this.oConfigurationEditor = this.oViewData.oConfigurationEditor;
		this.oTextPool = this.oConfigurationHandler.getTextPool();
		this.getText = this.oViewData.getText;
		this.params = this.oViewData.oParams;
		var self = this;
		if (!this.oConfigurationEditor) {
			this.oConfigurationHandler.loadConfiguration(this.params.arguments.configId, function(configurationEditor) {
				self.oConfigurationEditor = configurationEditor;
			});
		}
		this._setDisplayText();
		this.setDetailData();
		//Set Mandatory Fields
		var mandatoryFields = [];
		mandatoryFields.push(this.byId("idCategoryTitle"));
		this._setMandatoryFields(mandatoryFields);
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.category#_setDisplayText
	* @description Sets static texts in UI
	* */
	_setDisplayText : function() {
		this.byId("idCategoryBasicData").setTitle(this.getText("categoryData"));
		this.byId("idCategoryTitleLabel").setText(this.getText("categoryTitle"));
		this.byId("idCategoryTitleLabel").setRequired(true);
		this.byId("idCategoryTitle").setPlaceholder(this.getText("newCategory"));
		this.byId("idTotalStepsLabel").setText(this.getText("totalSteps"));
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.category#_addAutoCompleteFeatureOnInputs
	 * @description Adds 'Auto Complete Feature' to the input fields in the view
	 * 		using sap.apf.modeler.ui.utils.TextPoolHelper.
	 * */
	_addAutoCompleteFeatureOnInputs : function() {
		if (this.oConfigurationHandler) {
			var oInputControl = this.byId("idCategoryTitle");
			var oTextPoolHelper = new sap.apf.modeler.ui.utils.TextPoolHelper(this.oTextPool);
			var oTranslationFormat = sap.apf.modeler.ui.utils.TranslationFormatMap.CATEGORY_TITLE;
			var oDependenciesForText = {
				oTranslationFormat : oTranslationFormat,
				type : "text"
			};
			oTextPoolHelper.setAutoCompleteOn(oInputControl, oDependenciesForText);
		}
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.category#setDetailData
	* @description Sets dynamic texts for controls
	* */
	setDetailData : function() {
		var self = this;
		if (this.params && this.params.arguments && this.params.arguments.categoryId) {
			this.oCategory = this.oConfigurationEditor.getCategory(this.params.arguments.categoryId);
		}
		if (this.oCategory) {
			var nSteps = this.oConfigurationEditor.getCategoryStepAssignments(this.oCategory.getId()).length;
			if (this.oTextPool.get(this.oCategory.labelKey) !== undefined) {
				this.byId("idCategoryTitle").setValue(this.oTextPool.get(this.oCategory.labelKey).TextElementDescription);
			} else {
				this.byId("idCategoryTitle").setValue(this.oCategory.labelKey);
			}
			this.byId("idTotalSteps").setValue(nSteps);
			//TODO set the value of the  representations when available, for now placeholder is given
		} else {//create a new category
			var newCategoryId = this.oConfigurationEditor.setCategory();
			this.oCategory = this.oConfigurationEditor.getCategory(newCategoryId);
			var oCategoryInfo = {
				id : newCategoryId,
				icon : "sap-icon://open-folder"
			};
			this.oViewData.updateSelectedNode(oCategoryInfo);
		}
		this._addAutoCompleteFeatureOnInputs();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.category#handleChangeDetailValue
	* @description Handler for change event on chartTypes dropdwn
	* */
	handleChangeDetailValue : function(oEvent) { //event handler to check if any value is changed in the category form
		this.oConfigurationEditor.setIsUnsaved();
		var sCategoryTitle = this.byId("idCategoryTitle").getValue().trim();
		var oTranslationFormat = sap.apf.modeler.ui.utils.TranslationFormatMap.CATEGORY_TITLE;
		var sCategoryTitleId = this.oTextPool.setText(sCategoryTitle, oTranslationFormat);
		this.categoryObj = {
			labelKey : sCategoryTitleId
		};
		var oCategoryInfo = {};
		if (sCategoryTitle) {
			this.oConfigurationEditor.setCategory(this.categoryObj, this.oCategory.getId());
			oCategoryInfo.name = sCategoryTitle;
			if (sCategoryTitle) {
				this.oViewData.updateSelectedNode(oCategoryInfo);
				var sTitle = this.getText("category") + ": " + sCategoryTitle;
				this.oViewData.updateTitleAndBreadCrumb(sTitle);
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
