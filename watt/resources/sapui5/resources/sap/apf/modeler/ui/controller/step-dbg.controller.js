/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.require("sap.apf.modeler.ui.utils.textPoolHelper");
/**
* @class step
* @memberOf sap.apf.modeler.ui.controller
* @name step
* @description controller for view.step
*/
sap.ui.controller("sap.apf.modeler.ui.controller.step", {
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.step#onInit
	* @description Called on initialization of the view.
	* Sets the static texts for all controls in UI.
	* Sets the scroll height for the container.
	* Adds style classes to all UI controls.
	* Prepares dependecies.
	* Sets dynamic text for input controls
	* */
	onInit : function() {
		this.getView().addStyleClass("sapUiSizeCompact");//For non touch devices- compact style class increases the information density on the screen by reducing control dimensions
		this.oViewData = this.getView().getViewData();
		this.getText = this.oViewData.getText;
		this.params = this.oViewData.oParams;
		this.oConfigurationHandler = this.oViewData.oConfigurationHandler;
		this.oConfigurationEditor = this.oViewData.oConfigurationEditor;
		this.oTextPool = this.oConfigurationHandler.getTextPool();
		this.getNavigationTargetName = this.oViewData.getNavigationTargetName;
		var self = this;
		if (!this.oConfigurationEditor) {
			this.oConfigurationHandler.loadConfiguration(this.params.arguments.configId, function(configurationEditor) {
				self.oConfigurationEditor = configurationEditor;
			});
		}
		this.oTextPool = this.oConfigurationHandler.getTextPool();
		//this._getDependencies(); //get dependencies from router
		this._addConfigStyleClass();
		this._setDisplayText();
		this.setDetailData();
		//Set Mandatory Fields
		var mandatoryFields = [];
		mandatoryFields.push(this.byId("idstepTitle"));
		mandatoryFields.push(this.byId("idSourceSelect"));
		mandatoryFields.push(this.byId("idSelectPropCombo"));
		mandatoryFields.push(this.byId("idCategorySelect"));
		mandatoryFields.push(this.byId("idFilterMapEntitySelect")); //filter map entity,select properties and target filter are mandatory when service is selected
		mandatoryFields.push(this.byId("idFilterMapTargetFilterCombo"));
		this._setMandatoryFields(mandatoryFields);
		if (this.step.getFilterMappingService() === undefined || this.step.getFilterMappingService() === "") { // if the filter mapping field is not available
			this._removeMandatoryFromFilterMap(); //initially filter mapping fields should not be mandatory 
		}
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.step#_setDisplayText
	* @description Sets static texts in UI
	* */
	_setDisplayText : function() {
		this.byId("idStepBasicData").setTitle(this.getText("stepBasicData"));
		this.byId("idStepTitleLabel").setText(this.getText("stepTitle"));
		this.byId("idStepTitleLabel").setRequired(true);
		this.byId("idstepTitle").setPlaceholder(this.getText("newStep"));
		this.byId("idStepLongTitleLabel").setText(this.getText("stepLongTitle"));
		this.byId("idstepLongTitle").setPlaceholder(this.getText("stepLongTitle"));
		this.byId("idCategoryTitleLabel").setText(this.getText("categoryAssignments"));
		this.byId("idCategoryTitleLabel").setRequired(true);
		this.byId("idGlobalLabel").setText(this.getText("globalNavTargets"));
		this.byId("idStepSpecificLabel").setText(this.getText("stepSpecificNavTargets"));
		this.byId("idSourceSelectLabel").setText(this.getText("source"));
		this.byId("idSourceSelectLabel").setRequired(true);
		this.byId("idEntitySelectLabel").setText(this.getText("entity"));
		this.byId("idEntitySelectLabel").setRequired(true);
		this.byId("idSelectPropComboLabel").setText(this.getText("selectProperties"));
		this.byId("idSelectPropComboLabel").setRequired(true);
		this.byId("idReqFilterSelectLabel").setText(this.getText("requiredFilters"));
		this.byId("idDataRequest").setTitle(this.getText("dataRequest"));
		this.byId("idNavigationTarget").setTitle(this.getText("navigationTargetAssignment"));
		this.byId("idCornerTextLabel").setTitle(this.getText("cornerTextLabel"));
		this.byId("idLeftTop").setPlaceholder(this.getText("leftTop"));
		this.byId("idRightTop").setPlaceholder(this.getText("rightTop"));
		this.byId("idLeftBottom").setPlaceholder(this.getText("leftBottom"));
		this.byId("idRightBottom").setPlaceholder(this.getText("rightBottom"));
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.step#_addAutoCompleteFeatureOnInputs
	 * @description Adds 'Auto Complete Feature' to the input fields in the view
	 * using sap.apf.modeler.ui.utils.TextPoolHelper.
	 * */
	_addAutoCompleteFeatureOnInputs : function() {
		if (this.oConfigurationHandler) {
			var oTextPoolHelper = new sap.apf.modeler.ui.utils.TextPoolHelper(this.oTextPool);
			var oStepTitleControl = this.byId("idstepTitle");
			var oTranslationFormatForStepTitle = sap.apf.modeler.ui.utils.TranslationFormatMap.STEP_TITLE;
			var oDependenciesForStepTitle = {
				oTranslationFormat : oTranslationFormatForStepTitle,
				type : "text"
			};
			oTextPoolHelper.setAutoCompleteOn(oStepTitleControl, oDependenciesForStepTitle);
			var oStepLongTitleControl = this.byId("idstepLongTitle");
			var oTranslationFormatForStepLongTitle = sap.apf.modeler.ui.utils.TranslationFormatMap.STEP_LONG_TITLE;
			var oDependenciesForStepLongTitle = {
				oTranslationFormat : oTranslationFormatForStepLongTitle,
				type : "text"
			};
			oTextPoolHelper.setAutoCompleteOn(oStepLongTitleControl, oDependenciesForStepLongTitle);
			var oStepLeftTop = this.byId("idLeftTop");
			var oStepRightTop = this.byId("idRightTop");
			var oStepLeftBottom = this.byId("idLeftBottom");
			var oStepRightBottom = this.byId("idRightBottom");
			var oTranslationFormatForStepCornerText = sap.apf.modeler.ui.utils.TranslationFormatMap.STEP_CORNER_TEXT;
			var oDependenciesForStepCornerText = {
				oTranslationFormat : oTranslationFormatForStepCornerText,
				type : "text"
			};
			oTextPoolHelper.setAutoCompleteOn(oStepLeftTop, oDependenciesForStepCornerText);
			oTextPoolHelper.setAutoCompleteOn(oStepRightTop, oDependenciesForStepCornerText);
			oTextPoolHelper.setAutoCompleteOn(oStepLeftBottom, oDependenciesForStepCornerText);
			oTextPoolHelper.setAutoCompleteOn(oStepRightBottom, oDependenciesForStepCornerText);
			//autocomplete for source
			var oDependenciesForService = {
				oConfigurationEditor : this.oConfigurationEditor,
				type : "service"
			};
			var oSource = this.byId("idSourceSelect");
			oTextPoolHelper.setAutoCompleteOn(oSource, oDependenciesForService);
			var oSourceForFilterMapping = this.byId("idFilterMapSourceSelect");
			oTextPoolHelper.setAutoCompleteOn(oSourceForFilterMapping, oDependenciesForService);
		}
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.step#_addConfigStyleClass
	* @description Adds style classes to the UI controls
	* */
	_addConfigStyleClass : function() {
		this.byId("idChartIcon").addStyleClass("stepChartIcon");
		this.byId("idRightTop").addStyleClass("stepRightCornerText");
		this.byId("idRightBottom").addStyleClass("stepRightCornerText");
		this.byId("idLeftTop").addStyleClass("stepLeftCornerText");
		this.byId("idLeftBottom").addStyleClass("stepLeftCornerText");
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.step#_prepareStepSpecificList
	* @description Prepares the model for step specific targets and sets the step specific targets
	* */
	_prepareStepSpecificList : function() {
		var self = this;
		var aModifiedStepSpecificTargets = [];
		var aAllNavTarget = this.oConfigurationEditor.getNavigationTargets();//Get all the navigation targets in a configuration
		var aStepSpecificNavTargets = this.step.getNavigationTargets();//Get all the navigation targets assigned to the current step
		var aAllStepSpecificNavTargets = aAllNavTarget.filter(function(oNavTarget) {//Filter aAllNavTarget to get only step specific navigation targets
			return oNavTarget.isStepSpecific();
		});
		//If configuration has step specific navigation targets set a busy indicator on the control until texts are read
		if (aAllStepSpecificNavTargets.length !== 0) {
			this.byId("idStepSpecificCombo").setBusy(true);
		}
		aAllStepSpecificNavTargets.forEach(function(oStepSpecificNavTarget) {
			var oNavTarget = {};
			oNavTarget.navTargetKey = oStepSpecificNavTarget.getId();
			self.getNavigationTargetName(oStepSpecificNavTarget.getId()).then(function(value) {
				oNavTarget.navTargetName = value;
				aModifiedStepSpecificTargets.push(oNavTarget);//Push modified step specific target into array
				if (aModifiedStepSpecificTargets.length === aAllStepSpecificNavTargets.length) {
					var stepSpecificModel = new sap.ui.model.json.JSONModel();
					var oStepSpecificData = {
						stepSpecific : aModifiedStepSpecificTargets
					};
					stepSpecificModel.setData(oStepSpecificData);
					self.byId("idStepSpecificCombo").setModel(stepSpecificModel);
					self.byId("idStepSpecificCombo").setSelectedKeys(aStepSpecificNavTargets);//Set navigation targets assigned to the step as selected
					//Remove busy indicator once the model is set on the control
					self.byId("idStepSpecificCombo").setBusy(false);
				}
			});
		});
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.step#_prepareGlobalList
	* @description Prepares the model for global targets and sets the global targets
	* */
	_prepareGlobalList : function() {
		var self = this;
		var aModifiedGlobalTargets = [];
		var aAllNavTarget = this.oConfigurationEditor.getNavigationTargets();//Get all the navigation targets in a configuration
		var aGlobalNavTargets = aAllNavTarget.filter(function(oNavTarget) {//Filter aAllNavTarget to get only global navigation targets
			return oNavTarget.isGlobal();
		});
		//If configuration has global navigation targets set a busy indicator on the control until texts are read
		if (aGlobalNavTargets.length !== 0) {
			this.byId("idGlobalCombo").setBusy(true);
		}
		aGlobalNavTargets = aGlobalNavTargets.map(function(oGlobalNavTarget) {
			return oGlobalNavTarget.getId();
		});
		aGlobalNavTargets.forEach(function(oGlobalTarget) {
			var oGlobalNavTarget = {};
			oGlobalNavTarget.navTargetKey = oGlobalTarget;
			self.getNavigationTargetName(oGlobalTarget).then(function(value) {
				oGlobalNavTarget.navTargetName = value;
				aModifiedGlobalTargets.push(oGlobalNavTarget);//Push modified global target into array
				if (aModifiedGlobalTargets.length === aGlobalNavTargets.length) {
					var globalModel = new sap.ui.model.json.JSONModel();
					var oGlobalData = {
						global : aModifiedGlobalTargets
					};
					globalModel.setData(oGlobalData);
					self.byId("idGlobalCombo").setModel(globalModel);
					self.byId("idGlobalCombo").setSelectedKeys(aGlobalNavTargets);//Set all global targets as selected
					//Remove busy indicator once the model is set on the control
					self.byId("idGlobalCombo").setBusy(false);
				}
			});
		});
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.step#setDetailData
	* @description Sets dynamic texts for controls
	* */
	setDetailData : function() {
		var self = this;
		var Categories = [];
		this.oTextPool = this.oConfigurationHandler.getTextPool();
		var aAllCategories = this.oConfigurationEditor.getCategories();
		aAllCategories.forEach(function(oCategory) {
			var oCatOb = {};
			oCatOb.CategoryId = oCategory.getId();
			oCatOb.CategoryTitle = self.oTextPool.get(oCategory.labelKey) ? self.oTextPool.get(oCategory.labelKey).TextElementDescription : oCategory.labelKey;
			Categories.push(oCatOb);
		});
		var oData = {
			Categories : Categories
		};
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(oData);
		this.byId("idCategorySelect").setModel(oModel);
		var oProp = {
			propertyKey : this.getText("none"),
			propertyName : this.getText("none")
		};
		var oDataForPropertiesSel = {
			Properties : [ oProp ]
		};
		var oModelForSelectables = new sap.ui.model.json.JSONModel();
		oModelForSelectables.setSizeLimit(500);
		oModelForSelectables.setData(oDataForPropertiesSel);
		this.byId("idReqFilterSelect").setModel(oModelForSelectables);
		var aSelectPropertiesForTargetFilter = [];
		var oSelectedPropertiesForTargetFilter = this.byId("idFilterMapTargetFilterCombo") ? this.byId("idFilterMapTargetFilterCombo").getSelectedKeys() : [];
		oSelectedPropertiesForTargetFilter.forEach(function(property) { //selected properties from the combo box
			var oProp = {};
			oProp.propertyKey = property;
			oProp.propertyName = property;
			aSelectPropertiesForTargetFilter.push(oProp);
		});
		var oModelForTargetFilter = new sap.ui.model.json.JSONModel();
		oModelForTargetFilter.setSizeLimit(500);
		oModelForTargetFilter.setData(aSelectPropertiesForTargetFilter);
		//all the selected properties will be displayed in the target filter property dropdown, none will not be displayed as one property has to be selected
		this.byId("idFilterMapTargetFilterCombo").setModel(oModelForTargetFilter);
		if (this.params && this.params.arguments && this.params.arguments.stepId) {
			this.step = this.oConfigurationEditor.getStep(this.params.arguments.stepId);
		}
		if (this.step) { //for existing step
			var sNone = this.getText("none");
			var noneProperties = [ sNone ];
			//Setting the value for title for a step
			if (this.step.getTitleId && this.step.getTitleId() !== undefined && this.step.getTitleId() !== null && self.oTextPool.get(this.step.getTitleId())) {
				this.byId("idstepTitle").setValue(self.oTextPool.get(this.step.getTitleId()).TextElementDescription);
			} else {
				this.byId("idstepTitle").setValue(this.params.arguments.stepId);
			}
			//Setting the value for long title for a step
			if (this.step.getLongTitleId && this.step.getLongTitleId() !== undefined && this.step.getLongTitleId() !== null && self.oTextPool.get(this.step.getLongTitleId())) {
				this.byId("idstepLongTitle").setValue(self.oTextPool.get(this.step.getLongTitleId()).TextElementDescription);
			} else {
				this.byId("idstepLongTitle").setValue("");
			}
			//Setting the value for data source for a step
			if (this.step.getService && this.step.getService() !== undefined && this.step.getService() !== null) {
				this.byId("idSourceSelect").setValue(this.step.getService());
				var sSource = this.step.getService();
				var aAllEntitySets = [];
				var aAllEntitySetsForControll = [];
				aAllEntitySets = this.oConfigurationEditor.getAllEntitySetsOfService(sSource);
				aAllEntitySets.forEach(function(entiset) {
					var oEntitySet = {};
					oEntitySet.entityKey = entiset;
					oEntitySet.entityName = entiset;
					aAllEntitySetsForControll.push(oEntitySet);
				});
				var oDataForEntitySets = {
					Entities : aAllEntitySetsForControll
				};
				var oModelForEntitySet = new sap.ui.model.json.JSONModel();
				oModelForEntitySet.setSizeLimit(500);
				oModelForEntitySet.setData(oDataForEntitySets);
				this.byId("idEntitySelect").setModel(oModelForEntitySet);
			}
			//Setting the value for entity sets for a step
			if (this.step.getEntitySet && this.step.getEntitySet() !== undefined && this.step.getEntitySet() !== null) {
				this.byId("idEntitySelect").setSelectedKey(this.step.getEntitySet());
				var sEntity = this.step.getEntitySet();
				var sServiceRoot = this.step.getService();
				var aProperties = [], aPropertiesForControl = [];
				if (sServiceRoot && sServiceRoot !== null && sServiceRoot !== "") {
					aProperties = this.oConfigurationEditor.getAllPropertiesOfEntitySet(sServiceRoot, sEntity);
					aProperties.forEach(function(property) {
						var oProp = {};
						oProp.propertyKey = property;
						oProp.propertyName = property;
						aPropertiesForControl.push(oProp);
					});
					var oDataForProperties = {
						Properties : aPropertiesForControl
					};
					var oModelForSelProp = new sap.ui.model.json.JSONModel();
					oModelForSelProp.setSizeLimit(500);
					oModelForSelProp.setData(oDataForProperties);
					this.byId("idSelectPropCombo").setModel(oModelForSelProp);
				}
			}
			//Setting the value for select properties for a step
			if (this.step.getSelectProperties && this.step.getSelectProperties() !== undefined && this.step.getSelectProperties().length !== 0) {
				this.byId("idSelectPropCombo").setSelectedKeys(this.step.getSelectProperties());
				aProperties = noneProperties.concat(this.step.getSelectProperties());
				aPropertiesForControl = [];
				aProperties.forEach(function(property) {
					var oProp = {};
					oProp.propertyKey = property;
					oProp.propertyName = property;
					aPropertiesForControl.push(oProp);
				});
				oDataForPropertiesSel = {
					Properties : aPropertiesForControl
				};
				oModelForSelectables = new sap.ui.model.json.JSONModel();
				oModelForSelectables.setSizeLimit(500);
				oModelForSelectables.setData(oDataForPropertiesSel);
				this.byId("idReqFilterSelect").setModel(oModelForSelectables);
			}
			//Setting the value for required filter for a step
			if (this.step.getFilterProperties && this.step.getFilterProperties() !== undefined && this.step.getFilterProperties().length !== 0) {
				this.byId("idReqFilterSelect").setSelectedKey(this.step.getFilterProperties()[0]);
				this._showFilterMappingField();
			} else {
				this.byId("idReqFilterSelect").setSelectedKey(this.getText("none"));
				this._hideAndResetFilterMapField();
			}
			//Setting the value for data source for filter mapping of a step
			if (this.step.getFilterMappingService && this.step.getFilterMappingService() !== undefined && this.step.getFilterMappingService().length !== 0) {
				this.byId("idFilterMapSourceSelect").setValue(this.step.getFilterMappingService());
				var sFilterMapSource = this.step.getFilterMappingService();
				var aFilterMapAllEntitySets = [];
				var aFilterMapAllEntitySetsForControl = [];
				var aRequiredProperties = this.step.getFilterProperties();
				aFilterMapAllEntitySets = this.oConfigurationEditor.getAllEntitySetsOfServiceWithGivenProperties(sFilterMapSource, aRequiredProperties);
				aFilterMapAllEntitySets.forEach(function(entity) {
					var oEntitySetFilterMap = {};
					oEntitySetFilterMap.entityKey = entity;
					oEntitySetFilterMap.entityName = entity;
					aFilterMapAllEntitySetsForControl.push(oEntitySetFilterMap);
				});
				var oDataForFilterMapEntitySets = {
					Entities : aFilterMapAllEntitySetsForControl
				};
				var oModelForFilterMapEntitySet = new sap.ui.model.json.JSONModel();
				oModelForFilterMapEntitySet.setSizeLimit(500);
				oModelForFilterMapEntitySet.setData(oDataForFilterMapEntitySets);
				this.byId("idFilterMapEntitySelect").setModel(oModelForFilterMapEntitySet);
				this._addMandatoryfromFilterMap(); //valid service selected, make other fields in filter mapping mandatory
			} else {// if the service was not saved then reset the filter mapping fields
				this._removeMandatoryFromFilterMap(); // removes the mandatory tag 
				this._resetFilterMappingFields();//reset the values from the filter mapping properties and clears the selected keys in control
			}
			//Setting the value for entity sets for filter mapping of a step
			if (this.step.getFilterMappingEntitySet && this.step.getFilterMappingEntitySet() !== undefined && this.step.getFilterMappingEntitySet().length !== 0) {
				this.byId("idFilterMapEntitySelect").setSelectedKey(this.step.getFilterMappingEntitySet());
				var sFilterMapEntity = this.step.getFilterMappingEntitySet();
				var sFilterMapServiceRoot = this.step.getFilterMappingService();
				var aFilterMapProperties = [], aPropertiesForFilterMapControl = [];
				if (sFilterMapServiceRoot && sFilterMapServiceRoot !== null && sFilterMapServiceRoot !== "") {
					aFilterMapProperties = this.oConfigurationEditor.getAllPropertiesOfEntitySet(sFilterMapServiceRoot, sFilterMapEntity);
					aFilterMapProperties.forEach(function(property) {
						var oProp = {};
						oProp.propertyKey = property;
						oProp.propertyName = property;
						aPropertiesForFilterMapControl.push(oProp);
					});
					var oDataForFilterMapProperties = {
						Properties : aPropertiesForFilterMapControl
					};
					var oModelForFilterMapSelProp = new sap.ui.model.json.JSONModel();
					oModelForFilterMapSelProp.setSizeLimit(500);
					oModelForFilterMapSelProp.setData(oDataForFilterMapProperties);
					this.byId("idFilterMapTargetFilterCombo").setModel(oModelForFilterMapSelProp);
				}
			}
			//Setting the value for target property for filter mapping of a step
			if (this.step.getFilterMappingTargetProperties && this.step.getFilterMappingTargetProperties() !== undefined && this.step.getFilterMappingTargetProperties().length !== 0) {
				this.byId("idFilterMapTargetFilterCombo").setSelectedKeys(this.step.getFilterMappingTargetProperties());
			}
			//Setting the value for keep source checkbox for filter mapping of a step
			if (this.step.getFilterMappingKeepSource && this.step.getFilterMappingKeepSource() !== undefined) {
				this.byId("idFilterKeepSourceCheckBox").setSelected(this.step.getFilterMappingKeepSource());
			}
			//Setting the value of categories of a step
			var aSelectedCategories = self.oConfigurationEditor.getCategoriesForStep(this.step.getId());
			if (aSelectedCategories && aSelectedCategories.length !== 0) {
				this.byId("idCategorySelect").setSelectedKeys(aSelectedCategories);
			}
			//Setting the value of left lower corner text of a step
			if (this.step.getLeftLowerCornerTextKey() && self.oTextPool.get(this.step.getLeftLowerCornerTextKey())) {
				this.byId("idLeftBottom").setValue(self.oTextPool.get(this.step.getLeftLowerCornerTextKey()).TextElementDescription);
			} else {
				this.byId("idLeftBottom").setValue(this.step.getLeftLowerCornerTextKey());
			}
			//Setting the value of left upper corner text of a step
			if (this.step.getLeftUpperCornerTextKey() && self.oTextPool.get(this.step.getLeftUpperCornerTextKey())) {
				this.byId("idLeftTop").setValue(self.oTextPool.get(this.step.getLeftUpperCornerTextKey()).TextElementDescription);
			} else {
				this.byId("idLeftTop").setValue(this.step.getLeftUpperCornerTextKey());
			}
			//Setting the value of right upper corner text of a step
			if (this.step.getRightUpperCornerTextKey() && self.oTextPool.get(this.step.getRightUpperCornerTextKey())) {
				this.byId("idRightTop").setValue(self.oTextPool.get(this.step.getRightUpperCornerTextKey()).TextElementDescription);
			} else {
				this.byId("idRightTop").setValue(this.step.getRightUpperCornerTextKey());
			}
			//Setting the value of right lower corner text of a step
			if (this.step.getRightLowerCornerTextKey() && self.oTextPool.get(this.step.getRightLowerCornerTextKey())) {
				this.byId("idRightBottom").setValue(self.oTextPool.get(this.step.getRightLowerCornerTextKey()).TextElementDescription);
			} else {
				this.byId("idRightBottom").setValue(this.step.getRightLowerCornerTextKey());
			}
		} else { //for new step
			var sCategoryId = this.params.arguments.categoryId;
			var sStepId = self.oConfigurationEditor.createStep(sCategoryId);
			this.step = self.oConfigurationEditor.getStep(sStepId);
			var selectedCategory = [ sCategoryId ];
			this.byId("idCategorySelect").setSelectedKeys(selectedCategory);
			var stepInfo = {
				id : sStepId,
				icon : "sap-icon://BusinessSuiteInAppSymbols/icon-phase"
			};
			this.oViewData.updateSelectedNode(stepInfo);
		}
		this._addAutoCompleteFeatureOnInputs();
		this._prepareGlobalList();
		this._prepareStepSpecificList();
	},
	handleChangeDetailValueForTree : function(oEvent) {
		this.oConfigurationEditor.setIsUnsaved();
		var self = this;
		var aStepCategories = this.oConfigurationEditor.getCategoriesForStep(this.step.getId());
		var oTranslationFormat = sap.apf.modeler.ui.utils.TranslationFormatMap.STEP_TITLE;
		var sStepTitle = this.byId("idstepTitle").getValue().trim();
		var sStepTitleId = self.oTextPool.setText(sStepTitle, oTranslationFormat);
		if (sStepTitle !== "" && sStepTitle !== null) {
			this.step.setTitleId(sStepTitleId);
		}
		var stepInfo = {};
		stepInfo.name = sStepTitle;
		stepInfo.id = this.step.getId();
		if (sStepTitle !== "" && sStepTitle !== null) {
			if (aStepCategories.length > 1) {//In case the step is only assigned to one category
				this.oViewData.updateTree();
			} else {//In case the step is assigned to multiple categories, context of step and the list of categories is passed
				this.oViewData.updateSelectedNode(stepInfo);
			}
			var sTitle = this.getText("step") + ": " + sStepTitle;
			this.oViewData.updateTitleAndBreadCrumb(sTitle);
		}
		
	},
	handleChangeForLongTitle : function() {
		this.oConfigurationEditor.setIsUnsaved();
		var sStepLongTitle = this.byId("idstepLongTitle").getValue().trim();
		var oTranslationFormat = sap.apf.modeler.ui.utils.TranslationFormatMap.STEP_LONG_TITLE;
		var sStepLongTitleId = this.oTextPool.setText(sStepLongTitle, oTranslationFormat);
		this.step.setLongTitleId(sStepLongTitleId);
	},
	/**
	 * @function
	 * @name sap.apf.modeler.ui.controller.step# handleChangeForStepSpecific
	 * @description handler for the step specific navigation target control
	 * Assigns the selected step specific navigation targets to the step
	 * */
	handleChangeForStepSpecific : function() {
		var self = this;
		this.oConfigurationEditor.setIsUnsaved();
		var selectedNavTargets = this.byId("idStepSpecificCombo").getSelectedKeys();
		var prevNavTargets = this.step.getNavigationTargets();
		prevNavTargets.forEach(function(navTargetId) { //Remove the old assigned navigation targets from the step it was assigned to and are unselected now
			if (selectedNavTargets.indexOf(navTargetId) === -1) {
				self.step.removeNavigationTarget(navTargetId);
			}
		});
		selectedNavTargets.forEach(function(navTargetId) {
			if (prevNavTargets.indexOf(navTargetId) === -1) { //Add the selected navigation targets to the step
				self.step.addNavigationTarget(navTargetId);
			}
		});
	},
	/**
	 * @function
	 * @name sap.apf.modeler.ui.controller.step# handleChangeForService
	 * @description handler for the "service" property of the step request or filter mapping based on the event
	 * Checks the id of the source control and sets the value for request service or filter mapping service
	 * Reads all the entity set for the given source.
	 * Also , retrieves all the entities based on the required filters from the given source for filter mapping. 
	 * Checks if all the properties (entity, properties etc ) are valid for a given service and empties these properties if the service is invalid.
	 * */
	handleChangeForService : function(oEvent) {
		this.oConfigurationEditor.setIsUnsaved();
		var sSource, aAllEntitySets = [], aAllEntitySetsForControl = [], aProperties = [], aSelectPropertiesForControl = [], aRequiredProperties;
		var sSelectedRequiredFilter = this.byId("idReqFilterSelect").getSelectedKey();
		if (sSelectedRequiredFilter !== this.getText("none")) {
			aRequiredProperties = [ sSelectedRequiredFilter ]; // required filter from the step
		} else {
			aRequiredProperties = this.step.getFilterProperties();
		}
		var soruceControlId = oEvent ? oEvent.getParameter("id") : "";
		var bIsfilterMapControl = soruceControlId.search("FilterMap") !== -1 ? true : false;
		var bServiceRegistered;
		if (bIsfilterMapControl) {
			sSource = this.byId("idFilterMapSourceSelect").getValue().trim();
			bServiceRegistered = this.oConfigurationEditor.registerService(sSource);
			if (bServiceRegistered) {
				this._addMandatoryfromFilterMap(); //valid service selected, make other fields in filter mapping mandatory
				aAllEntitySets = this.oConfigurationEditor.getAllEntitySetsOfServiceWithGivenProperties(sSource, aRequiredProperties);
			} else {
				this._removeMandatoryFromFilterMap(); //remove mandatory tag from the filter mapping fields
			}
		} else {
			if (sSelectedRequiredFilter === this.getText("none") || sSelectedRequiredFilter === "") {//hide the filter mapping field on change of service when required filter is empty or none
				this._hideAndResetFilterMapField();
			} else { // reset the filter mapping 
				this._removeMandatoryFromFilterMap(); // removes the mandatory tag 
				this._resetFilterMappingFields();//reset the values from the filter mapping properties and clears the selected keys in control
			}
			sSource = this.byId("idSourceSelect").getValue().trim();
			bServiceRegistered = this.oConfigurationEditor.registerService(sSource);
			aAllEntitySets = this.oConfigurationEditor.getAllEntitySetsOfService(sSource);
		}
		aAllEntitySets.forEach(function(entitySet) {
			var oEntitySet = {};
			oEntitySet.entityKey = entitySet;
			oEntitySet.entityName = entitySet;
			aAllEntitySetsForControl.push(oEntitySet);
		});
		var oEntitySetData = {
			Entities : aAllEntitySetsForControl
		};
		var oEntitySetModel = new sap.ui.model.json.JSONModel();
		oEntitySetModel.setSizeLimit(500);
		oEntitySetModel.setData(oEntitySetData);
		var sEntitySet;
		if (aAllEntitySets.length >= 1) { //set default entity set
			if (bIsfilterMapControl) { //for filter mapping entity set
				if (this.step.getFilterMappingEntitySet()) {
					sEntitySet = this.step.getFilterMappingEntitySet();
					aProperties = this.oConfigurationEditor.getAllPropertiesOfEntitySet(sSource, sEntitySet);
				} else {
					aProperties = this.oConfigurationEditor.getAllPropertiesOfEntitySet(sSource, aAllEntitySets[0]);
				}
				this.step.setFilterMappingEntitySet(aAllEntitySets[0]);
				this.byId("idFilterMapEntitySelect").setSelectedKey(aAllEntitySets[0]);
			} else {
				if (this.step.getEntitySet()) { //for data source entity set
					sEntitySet = this.step.getEntitySet();
					aProperties = this.oConfigurationEditor.getAllPropertiesOfEntitySet(sSource, sEntitySet);
				} else {
					aProperties = this.oConfigurationEditor.getAllPropertiesOfEntitySet(sSource, aAllEntitySets[0]);
				}
				this.step.setEntitySet(aAllEntitySets[0]);
				this.byId("idEntitySelect").setSelectedKey(aAllEntitySets[0]);
			}
			aProperties.forEach(function(property) {
				var oProp = {};
				oProp.propertyKey = property;
				oProp.propertyName = property;
				aSelectPropertiesForControl.push(oProp);
			});
		}
		var oSelectPropertiesData = {
			Properties : aSelectPropertiesForControl
		};
		var oSelectPropertiesModel = new sap.ui.model.json.JSONModel();
		oSelectPropertiesModel.setSizeLimit(500);
		oSelectPropertiesModel.setData(oSelectPropertiesData);
		var aSelectPropertiesForRequiredFilter = [], aSelectPropertiesForTargetFilter = [];
		var oSelectedPropertiesForRequiredFilter = this.byId("idSelectPropCombo").getSelectedKeys();
		oSelectedPropertiesForRequiredFilter.forEach(function(property) { //selected properties from the combo box
			var oProp = {};
			oProp.propertyKey = property;
			oProp.propertyName = property;
			aSelectPropertiesForRequiredFilter.push(oProp);
		});
		var noneTextobj = {
			propertyKey : this.getText("none"),
			propertyName : this.getText("none")
		};
		var aNoneTextObject = [ noneTextobj ];
		aNoneTextObject = aNoneTextObject.concat(aSelectPropertiesForRequiredFilter);
		var oRequiredFilterMapProertyModel = new sap.ui.model.json.JSONModel();
		oRequiredFilterMapProertyModel.setSizeLimit(500);
		var oDataForReqFilter = {
			Properties : aNoneTextObject
		};
		oRequiredFilterMapProertyModel.setData(oDataForReqFilter);
		var oSelectedPropertiesForTargetFilter = this.byId("idFilterMapTargetFilterCombo") ? this.byId("idFilterMapTargetFilterCombo").getSelectedKeys() : [];
		oSelectedPropertiesForTargetFilter.forEach(function(property) { //selected properties from the combo box
			var oProp = {};
			oProp.propertyKey = property;
			oProp.propertyName = property;
			aSelectPropertiesForTargetFilter.push(oProp);
		});
		if (bIsfilterMapControl) {
			this.byId("idFilterMapEntitySelect").setModel(oEntitySetModel);
			this.byId("idFilterMapTargetFilterCombo").setModel(oSelectPropertiesModel);
		} else {
			this.byId("idEntitySelect").setModel(oEntitySetModel);
			this.byId("idSelectPropCombo").setModel(oSelectPropertiesModel);
			this.byId("idReqFilterSelect").setModel(oRequiredFilterMapProertyModel);
		}
		this._checkValidationStateForService("source", soruceControlId);
	},
	/**
	 * @function
	 * @private 
	 * @name sap.apf.modeler.ui.controller.step# _addMandatoryfromFilterMap
	 * @description add the mandatory tags to all the fields in the filter mapping if the service is valid
	 * */
	_addMandatoryfromFilterMap : function() {
		this.byId("idFilterMapEntitySelect").isMandatory = true;
		this.byId("idFilterMapTargetFilterCombo").isMandatory = true;
		this.byId("idFilterMapEntityLabel").setText(this.getText("entity"));
		this.byId("idFilterMapEntityLabel").setRequired(true);
		this.byId("idFilterMapTargetFilterLabel").setText(this.getText("filterMapTarget"));
		this.byId("idFilterMapTargetFilterLabel").setRequired(true);
		this.byId("idFilterMapKeepSourceLabel").setText(this.getText("filterMapKeepSource"));
		this.byId("idFilterMapKeepSourceLabel").setRequired(true);
	},
	/**
	 * @function
	 * @private 
	 * @name sap.apf.modeler.ui.controller.step# _removeMandatoryFromFilterMap
	 * @description removes the mandatory tags to all the fields in the filter mapping if the service is invalid
	 * */
	_removeMandatoryFromFilterMap : function() {
		this.byId("idFilterMapEntitySelect").isMandatory = false;
		this.byId("idFilterMapTargetFilterCombo").isMandatory = false;
		this.byId("idFilterMapEntityLabel").setText(this.getText("entity"));
		this.byId("idFilterMapEntityLabel").setRequired(false);
		this.byId("idFilterMapTargetFilterLabel").setText(this.getText("filterMapTarget"));
		this.byId("idFilterMapTargetFilterLabel").setRequired(false);
		this.byId("idFilterMapKeepSourceLabel").setText(this.getText("filterMapKeepSource"));
		this.byId("idFilterMapKeepSourceLabel").setRequired(false);
	},
	/**
	 * @function
	 * @private 
	 * @name sap.apf.modeler.ui.controller.step# _resetFilterMappingFields
	 * Resets all the values for the filter mapping properties (service, entitySet, select properties, target filter and keep source)
	 * and clears all the data and selected values from the controls
	 * */
	_resetFilterMappingFields : function() {
		var self = this;
		this.step.setFilterMappingService("");
		this.step.setFilterMappingEntitySet(undefined);
		this.step.setFilterMappingKeepSource(undefined);
		var aOldFilterMapTargetProperty = this.step.getFilterMappingTargetProperties();
		aOldFilterMapTargetProperty.forEach(function(property) {
			self.step.removeFilterMappingTargetProperty(property);
		});
		//set an empty model to the controls on the UI
		var oEmptyModelForControlOnReset = new sap.ui.model.json.JSONModel();
		var oEmptyDateSetForControlOnReset = {
			NoData : []
		};
		oEmptyModelForControlOnReset.setData(oEmptyDateSetForControlOnReset);
		this.byId("idFilterMapSourceSelect").setValue("");
		this.byId("idFilterMapEntitySelect").setModel(oEmptyModelForControlOnReset);
		this.byId("idFilterMapEntitySelect").setSelectedKey();
		this.byId("idFilterMapTargetFilterCombo").setModel(oEmptyModelForControlOnReset);
		var aSelectedKeys = this.byId("idFilterMapTargetFilterCombo").getSelectedKeys();
		this.byId("idFilterMapTargetFilterCombo").removeSelectedKeys(aSelectedKeys);
	},
	/**
	 * @function
	 * @name sap.apf.modeler.ui.controller.step# handleChangeForEntity
	 * @description handler for the "entity" property of the step request or filter mapping based on the event
	 * Checks the id of the source control and sets the value for request entity or filter mapping entity
	 * Reads all the properties for the given source and entity and updates the select properties based on entity.
	 * */
	handleChangeForEntity : function(oEvent) {
		this.oConfigurationEditor.setIsUnsaved();
		var sEntity, sService, aProperties = [], aPropertiesForControl = [];
		var soruceControlId = oEvent.getParameter("id");
		var bIsfilterMapControl = soruceControlId.search("FilterMap") !== -1 ? true : false;
		if (bIsfilterMapControl) {
			sEntity = this.byId("idFilterMapEntitySelect").getSelectedKey();
			sService = this.byId("idFilterMapSourceSelect").getValue().trim();
			aProperties = this.oConfigurationEditor.getAllPropertiesOfEntitySet(sService, sEntity);
		} else {
			sEntity = this.byId("idEntitySelect").getSelectedKey();
			sService = this.byId("idSourceSelect").getValue().trim();
			aProperties = this.oConfigurationEditor.getAllPropertiesOfEntitySet(sService, sEntity);
		}
		aProperties.forEach(function(property) {
			var oProp = {};
			oProp.propertyKey = property;
			oProp.propertyName = property;
			aPropertiesForControl.push(oProp);
		});
		var oSelectPropertiesData = {
			Properties : aPropertiesForControl
		};
		var oSelectPropertyModel = new sap.ui.model.json.JSONModel();
		oSelectPropertyModel.setSizeLimit(500);
		oSelectPropertyModel.setData(oSelectPropertiesData);
		var noneTextobj = {
			propertyKey : this.getText("none"),
			propertyName : this.getText("none")
		};
		var aRequiredPropertiesControl = [ noneTextobj ];
		aRequiredPropertiesControl = aRequiredPropertiesControl.concat(aPropertiesForControl);
		var oRequiredFilterMapProertyModel = new sap.ui.model.json.JSONModel();
		oRequiredFilterMapProertyModel.setSizeLimit(500);
		var oDataForReqFilter = {
			Properties : aRequiredPropertiesControl
		};
		oRequiredFilterMapProertyModel.setData(oDataForReqFilter);
		var oTargetFilterMapProertyModel = new sap.ui.model.json.JSONModel();
		oTargetFilterMapProertyModel.setSizeLimit(500);
		oTargetFilterMapProertyModel.setData(aPropertiesForControl);
		if (bIsfilterMapControl) {
			this.byId("idFilterMapTargetFilterCombo").setModel(oSelectPropertyModel);
		} else {
			this.byId("idSelectPropCombo").setModel(oSelectPropertyModel);
			this.byId("idReqFilterSelect").setModel(oRequiredFilterMapProertyModel);
		}
		this._checkValidationStateForService("entitySet", soruceControlId);
		var sRequiredFilter = this.byId("idReqFilterSelect").getSelectedKey();
		if (sRequiredFilter === this.getText("none")) {
			this._hideAndResetFilterMapField();
		}
	},
	/**
	 * @function
	 * @name sap.apf.modeler.ui.controller.step# handleChangeForSelectProperty
	 * @description handler for the "select property" of the step request or filter mapping based on the event
	 * Checks the id of the source control and sets the value for request select property or filter mapping select property 
	 * Also updates the properties in the required filter list
	 * */
	handleChangeForSelectProperty : function(oEvent) {
		var self = this;
		this.oConfigurationEditor.setIsUnsaved();
		var aSelectProperty, aSelectPropertiesForControl = [];
		var soruceControlId = oEvent.getParameter("id");
		aSelectProperty = this.byId("idSelectPropCombo").getSelectedKeys();
		aSelectProperty.forEach(function(property) {
			self.step.addSelectProperty(property);
			var oProp = {};
			oProp.propertyKey = property;
			oProp.propertyName = property;
			aSelectPropertiesForControl.push(oProp);
		});
		var noneTextobj = {
			propertyKey : this.getText("none"),
			propertyName : this.getText("none")
		};
		var aRequiredPropertiesControl = [ noneTextobj ];
		aRequiredPropertiesControl = aRequiredPropertiesControl.concat(aSelectPropertiesForControl);
		var oRequiredFilterMapProertyModel = new sap.ui.model.json.JSONModel();
		oRequiredFilterMapProertyModel.setSizeLimit(500);
		var oDataForReqFilter = {
			Properties : aRequiredPropertiesControl
		};
		oRequiredFilterMapProertyModel.setData(oDataForReqFilter);
		var oTargetFilterMapProertyModel = new sap.ui.model.json.JSONModel();
		oTargetFilterMapProertyModel.setSizeLimit(500);
		oTargetFilterMapProertyModel.setData(aSelectPropertiesForControl);
		this.byId("idReqFilterSelect").setModel(oRequiredFilterMapProertyModel);
		this._checkValidationStateForService("selectProperties", soruceControlId);
		var sRequiredFilter = this.byId("idReqFilterSelect").getSelectedKey(); //hide the filter mapping fields if required property is none
		if (sRequiredFilter === this.getText("none")) {
			this._hideAndResetFilterMapField();
		}
	},
	/**
	 * @function
	 * @name sap.apf.modeler.ui.controller.step# handleChangeForRequiredFilter
	 * @description handler for the "Required filter" of the step request
	 * Shows and hides the filter mapping field based on required filter availibility in the step
	 * Updates the entity sets present in the filter mapping based on the required filters
	 * */
	handleChangeForRequiredFilter : function(oEvent) {
		var self = this;
		var soruceControlId = oEvent.getParameter("id");
		this.oConfigurationEditor.setIsUnsaved();
		var aOldSelProp = this.step.getFilterProperties();
		aOldSelProp.forEach(function(property) {
			self.step.removeFilterProperty(property);
		});
		var sRequiredFilter = this.byId("idReqFilterSelect").getSelectedKey();
		if (sRequiredFilter !== this.getText("none")) {
			this.step.addFilterProperty(sRequiredFilter);
			this._showFilterMappingField();//show filter mapping field on UI if there is a required filter
		} else {
			this._hideAndResetFilterMapField();//hide filter mapping field from UI if there is no required filter
		}
		this._checkValidationStateForService("requiredFilter", soruceControlId);
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.step# _showFilterMappingField
	 * @description shows the filter mapping field from UI if the required filter is available in the step
	 * */
	_showFilterMappingField : function() {
		this.byId("idFilterMapping").setVisible(true);
		this.byId("idFilterMapSourceLabel").setVisible(true);
		this.byId("idFilterMapSourceSelect").setVisible(true);
		this.byId("idFilterMapEntityLabel").setVisible(true);
		this.byId("idFilterMapEntitySelect").setVisible(true);
		this.byId("idFilterMapTargetFilterLabel").setVisible(true);
		this.byId("idFilterMapTargetFilterCombo").setVisible(true);
		this.byId("idFilterMapKeepSourceLabel").setVisible(true);
		this.byId("idFilterKeepSourceCheckBox").setVisible(true);
		this.byId("idFilterMapping").setTitle(this.getText("filterMap"));
		this.byId("idFilterMapSourceLabel").setText(this.getText("source"));
		this.byId("idFilterMapSourceLabel").setRequired(false);
		this.byId("idFilterMapEntityLabel").setText(this.getText("entity"));
		this.byId("idFilterMapEntityLabel").setRequired(false);
		this.byId("idFilterMapTargetFilterLabel").setText(this.getText("filterMapTarget"));
		this.byId("idFilterMapTargetFilterLabel").setRequired(false);
		this.byId("idFilterMapKeepSourceLabel").setText(this.getText("filterMapKeepSource"));
		this.byId("idFilterMapKeepSourceLabel").setRequired(false);
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.step# _hideAndResetFilterMapField
	 * @description hides the filter mapping field from UI if the required filter is not available in the step
	 * */
	_hideAndResetFilterMapField : function() {
		this.byId("idFilterMapping").setVisible(false);
		this.byId("idFilterMapSourceLabel").setVisible(false);
		this.byId("idFilterMapSourceSelect").setVisible(false);
		this.byId("idFilterMapEntityLabel").setVisible(false);
		this.byId("idFilterMapEntitySelect").setVisible(false);
		this.byId("idFilterMapTargetFilterLabel").setVisible(false);
		this.byId("idFilterMapTargetFilterCombo").setVisible(false);
		this.byId("idFilterMapKeepSourceLabel").setVisible(false);
		this.byId("idFilterKeepSourceCheckBox").setVisible(false);
		this._removeMandatoryFromFilterMap(); // removes the mandatory tag 
		this._resetFilterMappingFields();//reset the values from the filter mapping properties and clears the selected keys in control
	},
	/**
	 * @function
	 * @name sap.apf.modeler.ui.controller.step# handleChangeForTargetFilter
	 * @description handler for the "target property" of the filter mapping  
	 * sets the value of target filter on the step object
	 * */
	handleChangeForTargetFilter : function(oEvent) {
		var self = this;
		var soruceControlId = oEvent.getParameter("id");
		this.oConfigurationEditor.setIsUnsaved();
		var aTargetFilterMapProp = this.byId("idFilterMapTargetFilterCombo").getSelectedKeys();
		if (aTargetFilterMapProp.length > 0) { // if any value is selected then clear the previous value and add the new one , else retain the old values
			var aOldTargetProp = this.step.getFilterMappingTargetProperties();
			aOldTargetProp.forEach(function(property) {
				self.step.removeFilterMappingTargetProperty(property);
			});
			aTargetFilterMapProp.forEach(function(property) {
				self.step.addFilterMappingTargetProperty(property);
			});
		}
		this._checkValidationStateForService("targetProperties", soruceControlId);
	},
	/**
	 * @function
	 * @name sap.apf.modeler.ui.controller.step# handleFilterMapKeepSource
	 * @description handler for the "keep source" property of the filter mapping  
	 * sets the boolean value of the property on the step object
	 * */
	handleFilterMapKeepSource : function() {
		var bIsKeepSourceSelected = this.byId("idFilterKeepSourceCheckBox").getSelected();
		this.oConfigurationEditor.setIsUnsaved();
		this.step.setFilterMappingKeepSource(bIsKeepSourceSelected);
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.step#_checkValidationStateForService
	 * @param param - to determine which property has to be to validated ( e.g. source, entitySet etc) and based on it the other properties has to be checked and updated
	 * @param soruceControlId  - id of the control to determine if the property are being read from a request or filter mapping 
	 * @description chceks if the filter mapping of the step has all mandatory fields( i.e. entitySet, service, select properties and target filter are available in the step)  
	 * and sets the values on the step object
	 * */
	_checkValidationStateForService : function(param, soruceControlId) {
		var self = this;
		var oValidStep = {
			source : undefined,
			entitySet : undefined,
			selectProperty : undefined,
			requiredFilter : undefined,
			targetFilter : undefined
		};
		var sSource, aRequiredProperties, aAllEntitySets = [], aAllEntitySetsForControll = [];
		var bIsfilterMapControl = soruceControlId.search("FilterMap") !== -1 ? true : false;
		sSource = bIsfilterMapControl ? this.byId("idFilterMapSourceSelect").getValue().trim() : this.byId("idSourceSelect").getValue().trim();
		var bServiceRegistered = this.oConfigurationEditor.registerService(sSource);
		if (bServiceRegistered) {
			oValidStep.source = sSource;
			var sSelectedRequiredFilter = this.byId("idReqFilterSelect").getSelectedKey();
			if (sSelectedRequiredFilter !== this.getText("none")) {
				aRequiredProperties = [ sSelectedRequiredFilter ]; // required filter from the step
			} else {
				aRequiredProperties = this.step.getFilterProperties();
			}
			aAllEntitySets = bIsfilterMapControl ? this.oConfigurationEditor.getAllEntitySetsOfServiceWithGivenProperties(sSource, aRequiredProperties) : this.oConfigurationEditor.getAllEntitySetsOfService(sSource);
			var sSelectedEntity;
			if (param === "entitySet" || param === "selectProperties" || param === "targetProperties" || param === "requiredFilter") {
				sSelectedEntity = bIsfilterMapControl ? this.byId("idFilterMapEntitySelect").getSelectedKey() : this.byId("idEntitySelect").getSelectedKey();
			} else {
				sSelectedEntity = bIsfilterMapControl ? this.step.getFilterMappingEntitySet() : this.step.getEntitySet();
			}
			if (sSelectedEntity) {
				aAllEntitySets.forEach(function(entitySet) {
					if (sSelectedEntity === entitySet) {
						oValidStep.entitySet = sSelectedEntity;
						if (param === "source") {
							if (bIsfilterMapControl) {
								self.byId("idFilterMapEntitySelect").setSelectedKey(sSelectedEntity);
							} else {
								self.byId("idEntitySelect").setSelectedKey(sSelectedEntity);
							}
						}
					}
				});
				var aSelectProperties, aCommonProperty = [];
				if (param === "selectProperties") {
					aSelectProperties = this.byId("idSelectPropCombo").getSelectedKeys();
				} else {
					aSelectProperties = this.step.getSelectProperties();
				}
				var aProperties = this.oConfigurationEditor.getAllPropertiesOfEntitySet(sSource, sSelectedEntity); //TODO check
				var aPropertiesForControl = [];
				aProperties.forEach(function(propertyFromEntity) {
					var oProp = {};
					oProp.propertyKey = propertyFromEntity;
					oProp.propertyName = propertyFromEntity;
					aPropertiesForControl.push(oProp);
				});
				var oDataForProperties = {
					Properties : aPropertiesForControl
				};
				var oModelForSelProp = new sap.ui.model.json.JSONModel();
				oModelForSelProp.setSizeLimit(500);
				oModelForSelProp.setData(oDataForProperties);
				this.byId("idSelectPropCombo").setModel(oModelForSelProp);
				this.byId("idFilterMapTargetFilterCombo").setModel(oModelForSelProp);
				aProperties.forEach(function(propertyFromEntity) {
					aSelectProperties.forEach(function(propertyFromControl) {
						if (propertyFromControl === propertyFromEntity) {
							aCommonProperty.push(propertyFromControl);
						}
					});
				});
				var aPropertiesMapControl = [];
				var objNoneText = [ {
					propertyKey : this.getText("none"),
					propertyName : this.getText("none")
				} ];
				if (this.step.getFilterMappingTargetProperties().length === 0) {
					this.byId("idFilterMapTargetFilterCombo").setSelectedKeys([]);// if the target filter is not available then clear the selected items from the control
				}
				if (aCommonProperty.length > 0) {
					oValidStep.selectProperty = aCommonProperty;
					if (param !== "selectProperties") {
						this.byId("idSelectPropCombo").setSelectedKeys(aCommonProperty);
					}
					aCommonProperty.forEach(function(property) {
						var oProp = {};
						oProp.propertyKey = property;
						oProp.propertyName = property;
						aPropertiesMapControl.push(oProp);
					});
				} else { //clear the selected keys from the control if there is no common properties
					var selectedProperties;
					if (!bIsfilterMapControl) {
						selectedProperties = this.byId("idSelectPropCombo").getSelectedKeys();
						this.byId("idSelectPropCombo").removeSelectedKeys(selectedProperties);
						this.byId("idReqFilterSelect").setSelectedKey(this.getText("none"));
					}
				}
				objNoneText = objNoneText.concat(aPropertiesMapControl);
				var oRequiredOrFilterProperties = {
					Properties : objNoneText
				};
				var oRequiredOrFilterPropertyModel = new sap.ui.model.json.JSONModel();
				oRequiredOrFilterPropertyModel.setData(oRequiredOrFilterProperties);
				var aTargetProperties = [], aRequiredFilters = [];
				if (param === "targetProperties") {
					aTargetProperties = this.byId("idFilterMapTargetFilterCombo").getSelectedKeys();
				} else {
					aTargetProperties = this.step.getFilterMappingTargetProperties();
				}
				if (aTargetProperties.length > 0) {
					oValidStep.targetFilter = aTargetProperties;
					this.byId("idFilterMapTargetFilterCombo").setSelectedKeys(aTargetProperties);
				}
				if (param === "requiredFilter") {
					aRequiredFilters.push(this.byId("idReqFilterSelect").getSelectedKey());
				} else {
					aRequiredFilters = this.step.getFilterProperties();
				}
				var aRequiredFilterForValidStep = [];
				aRequiredFilters.forEach(function(requiredFilter) {
					if (requiredFilter !== self.getText("none")) {
						aPropertiesMapControl.forEach(function(oProperty) {
							if (oProperty.propertyKey === requiredFilter) {
								aRequiredFilterForValidStep.push(requiredFilter);
							}
						});
					}
				});
				if (aRequiredFilterForValidStep.length !== 0) {
					oValidStep.requiredFilter = aRequiredFilterForValidStep; //required filters from dropdown - not none text
				} else {
					if (!bIsfilterMapControl) {
						this.byId("idReqFilterSelect").setSelectedKey(this.getText("none"));
					}
				}
				//all the selected properties will be displayed in the target filter property dropdown, none will not be displayed as one property has to be selected
				var oTargetFilterProperties = {
					Properties : aPropertiesMapControl
				};
				var oTargetFilterMapProertyModel = new sap.ui.model.json.JSONModel();
				oTargetFilterMapProertyModel.setSizeLimit(500);
				oTargetFilterMapProertyModel.setData(oTargetFilterProperties);
				if (!bIsfilterMapControl) { //set the model for required filter /target filter
					this.byId("idReqFilterSelect").setModel(oRequiredOrFilterPropertyModel);
				}
			}
			if (bIsfilterMapControl) {
				this._validateStepServiceForFilterMapping(oValidStep);
			} else {
				this._validateStepServiceForDataSource(oValidStep);
			}
		} else { // if service is invalid , reset all the request properties
			if (bIsfilterMapControl) {
				this._resetFilterMappingFields(); //resets the filter mapping target property
			} else {
				this._resetStepRequestProperties();
			}
		}
	},
	/**
	 * @function
	 * @private 
	 * @name sap.apf.modeler.ui.controller.step# _resetStepRequestProperties
	 * Resets all the values for the step request properties (service, entitySet, select properties, required filter)
	 * */
	_resetStepRequestProperties : function() {
		var self = this;
		this.step.setEntitySet(undefined);
		var aOldSelectProperty = this.step.getSelectProperties();
		aOldSelectProperty.forEach(function(property) {
			self.step.removeSelectProperty(property);
		});
		var aOldRequiredFilterProperty = this.step.getFilterProperties();
		aOldRequiredFilterProperty.forEach(function(property) {
			self.step.removeFilterProperty(property);
		});
		this.byId("idEntitySelect").setSelectedKey();
		this.byId("idReqFilterSelect").setSelectedKey();
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.step#_validateStepServiceForDataSource
	 * @param {Step}  - step object 
	 * @description chceks if the data source of the step is has all mandatory fields (i.e. entitySet, service, select properties are available in the step)  
	 * and sets the values on the step object
	 * */
	_validateStepServiceForDataSource : function(oValidStep) {
		var self = this;
		if (oValidStep.selectProperty && oValidStep.entitySet && oValidStep.source) {
			this.step.setService(oValidStep.source);
			this.step.setEntitySet(oValidStep.entitySet);
			var aOldSelProp = this.step.getSelectProperties();
			aOldSelProp.forEach(function(property) {
				self.step.removeSelectProperty(property);
			});
			oValidStep.selectProperty.forEach(function(property) {
				self.step.addSelectProperty(property);
			});
			var aOldRequiredProp = this.step.getFilterProperties();
			aOldRequiredProp.forEach(function(property) {
				self.step.removeFilterProperty(property);
			});
			if (oValidStep.requiredFilter) {
				oValidStep.requiredFilter.forEach(function(property) {
					self.step.addFilterProperty(property);
				});
			}
		}
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.step#_validateStepServiceForFilterMapping
	 * @param {Step}  - step object 
	 * @description chceks if the filter mapping of the step has all mandatory fields( i.e. entitySet, service, select properties and target filter are available in the step)  
	 * and sets the values on the step object
	 * */
	_validateStepServiceForFilterMapping : function(oValidStep) {
		var self = this;
		if (oValidStep.entitySet && oValidStep.source && oValidStep.targetFilter) {
			this.step.setFilterMappingService(oValidStep.source);
			this.step.setFilterMappingEntitySet(oValidStep.entitySet);
			var aOldFilterMapTargetProp = this.step.getFilterMappingTargetProperties();
			aOldFilterMapTargetProp.forEach(function(property) {
				self.step.removeFilterMappingTargetProperty(property);
			});
			oValidStep.targetFilter.forEach(function(property) {
				self.step.addFilterMappingTargetProperty(property);
			});
		}
	},
	handleChangeForCategory : function() {
		this.oConfigurationEditor.setIsUnsaved();
		var self = this;
		var stepId = self.step.getId();
		var currentCategoryId = this.params.arguments.categoryId;
		var aPreCat = this.oConfigurationEditor.getCategoriesForStep(this.step.getId());
		var sSelCategory = this.byId("idCategorySelect").getSelectedKeys();
		var currentCategoryChange = sSelCategory.indexOf(currentCategoryId);
		var aStepContexts = [];
		var unselectedCategories = [];
		var i, j;
		for(i = 0; i < aPreCat.length; i++) {
			var match = false;
			for(j = 0; j < sSelCategory.length; j++) {
				if (aPreCat[i] === sSelCategory[j]) {
					match = true;
					break;
				}
			}
			if (!match) {
				unselectedCategories.push(aPreCat[i]);
			}
		}
		if (sSelCategory.length !== 0) {
			sSelCategory.forEach(function(category) {
				self.oConfigurationEditor.addCategoryStepAssignment(category, stepId); //Add the step to the categories selected
				var oStepContext = {
					oldContext : {
						name : self.params.name,
						arguments : {
							configId : self.params.arguments.configId,
							categoryId : currentCategoryId,
							stepId : stepId
						}
					},
					newContext : {
						arguments : {
							configId : self.params.arguments.configId,
							categoryId : category
						}
					}
				};
				if (category !== currentCategoryId) {
					aStepContexts.push(oStepContext);
				}
			});
			aPreCat.forEach(function(sCatId) { //Remove the step from all the old categories it was present in
				if (sSelCategory.indexOf(sCatId) === -1) { // ... and that are not selected any more
					self.oConfigurationEditor.removeCategoryStepAssignment(sCatId, self.step.getId());
				}
			});
			if (unselectedCategories.length !== 0) {//Prepare context for unselected categories, to be removed from the model
				var newContext = jQuery.extend(true, {}, self.params);
				unselectedCategories.forEach(function(unselectedCategory) {
					var oStepContext = {
						oldContext : {
							name : self.params.name,
							arguments : {
								configId : self.params.arguments.configId,
								categoryId : currentCategoryId,
								stepId : stepId
							}
						},
						newContext : {
							arguments : {
								configId : self.params.arguments.configId,
								categoryId : unselectedCategory
							}
						},
						removeStep : true
					};
					if (currentCategoryChange === -1 && unselectedCategory === currentCategoryId) {//Prepare context for category change, if the current category is removed from the step
						var categoryChangeContext = {
							arguments : {
								appId : self.params.arguments.appId,
								configId : self.params.arguments.configId,
								categoryId : sSelCategory[0],
								stepId : stepId
							}
						};
						oStepContext.categoryChangeContext = categoryChangeContext;
						oStepContext.changeCategory = true;
					}
					aStepContexts.push(oStepContext);
				});
			}
		}
		if (aStepContexts.length !== 0) {
			this.oViewData.updateConfigTree(aStepContexts);//When the categories in the step is changed
		}
	},
	handleChangeForLeftTop : function() {
		this.oConfigurationEditor.setIsUnsaved();
		var sStepLeftTop = this.byId("idLeftTop").getValue().trim();
		var oTranslationFormat = sap.apf.modeler.ui.utils.TranslationFormatMap.STEP_CORNER_TEXT;
		var sStepLeftTopTextId = this.oTextPool.setText(sStepLeftTop, oTranslationFormat);
		this.step.setLeftUpperCornerTextKey(sStepLeftTopTextId);
	},
	handleChangeForRightTop : function() {
		this.oConfigurationEditor.setIsUnsaved();
		var sStepRightTop = this.byId("idRightTop").getValue().trim();
		var oTranslationFormat = sap.apf.modeler.ui.utils.TranslationFormatMap.STEP_CORNER_TEXT;
		var sStepRightTopTextId = this.oTextPool.setText(sStepRightTop, oTranslationFormat);
		this.step.setRightUpperCornerTextKey(sStepRightTopTextId);
	},
	handleChangeForLeftBottom : function() {
		this.oConfigurationEditor.setIsUnsaved();
		var sStepLeftBottom = this.byId("idLeftBottom").getValue().trim();
		var oTranslationFormat = sap.apf.modeler.ui.utils.TranslationFormatMap.STEP_CORNER_TEXT;
		var sStepLeftBottomTextId = this.oTextPool.setText(sStepLeftBottom, oTranslationFormat);
		this.step.setLeftLowerCornerTextKey(sStepLeftBottomTextId);
	},
	handleChangeForRightBottom : function() {
		this.oConfigurationEditor.setIsUnsaved();
		var sStepRightBottom = this.byId("idRightBottom").getValue().trim();
		var oTranslationFormat = sap.apf.modeler.ui.utils.TranslationFormatMap.STEP_CORNER_TEXT;
		var sStepRightBottomTextId = this.oTextPool.setText(sStepRightBottom, oTranslationFormat);
		this.step.setRightLowerCornerTextKey(sStepRightBottomTextId);
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.step#_setMandatoryFields
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
	 * @name sap.apf.modeler.ui.controller.step#_getMandatoryFields
	 * @param {Object} oEvent - Event instance of the form field 
	 * @description getter for mandatory fields
	 * */
	_getMandatoryFields : function() {
		return this.mandatoryFields;
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.step#_setValidationState
	 * @param {Object} oEvent - Event instance of the form field 
	 * @description Set validation state of sub view
	 * */
	_setValidationState : function() {
		var mandatoryFields = this._getMandatoryFields();
		for( var i = 0; i < mandatoryFields.length; i++) {
			if (mandatoryFields[i].isMandatory === true) {
				if (typeof mandatoryFields[i].getSelectedKeys === "function") {
					this.isValidState = (mandatoryFields[i].getSelectedKeys().length >= 1) ? true : false;
				} else if (typeof mandatoryFields[i].getValue === "function") {
					this.isValidState = (mandatoryFields[i].getValue().trim() !== "") ? true : false;
				} else {
					this.isValidState = (mandatoryFields[i].getSelectedKey().length >= 1) ? true : false;
				}
				if (this.isValidState === false) {
					break;
				}
			}
		}
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.step#getValidationState
	 * @description Getter for getting the current validation state of sub view
	 * */
	getValidationState : function() {
		this._setValidationState(); //Set the validation state of view
		var isValidState = (this.isValidState !== undefined) ? this.isValidState : true;
		return isValidState;
	}
});
