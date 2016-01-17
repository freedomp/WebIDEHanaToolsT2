jQuery.sap.declare("sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.TemplateInfoStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.TemplateInfoStep", {

	metadata : {

	},

	init : function() {
		var that = this;
		this.oCategoryModel = null;
		this.bAlreadyLoaded = false;

		this._createTemplateInformationGrid();

		this.addContent(that.oTemplateInfoGrid);
	},

/* *********************************
 * 		Template and Category UI    *
 ***********************************/

	_createTemplateInformationGrid : function() {
		var that = this;

		var oDisplayNameLabel = new sap.ui.commons.TextView({
			text : "{i18n>templateInfoStep_templateInfoGrid_displayName}",
			tooltip : "{i18n>templateInfoStep_templateInfoGrid_displayNameToolTip}",
			textAlign : "Left",
			labelFor : this.oDisplayNameTextField,
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12",
				linebreak : true
			})
		}).addStyleClass("wizardBody");

		this.oDisplayNameTextField = new sap.ui.commons.TextField({
			width : "100%",
			placeholder : "{i18n>templateInfoStep_templateInfoGrid_displayNameDescription}",
			change : function(oEvent) {
				that._validateTemplateInfoStep(oEvent).fail(/*No failure handling is needed here*/);
			},
			layoutData : new sap.ui.layout.GridData({
				span : "L5 M8 S12"
			}),
			accessibleRole : sap.ui.core.AccessibleRole.Textbox
		});
		
		this.overwriteComponentCheckBox = new sap.ui.commons.CheckBox({
			text : "{i18n>templateInfoStep_templateInfoGrid_overwrite}",
			width : "100%",
			tooltip : "{i18n>templateInfoStep_templateInfoGrid_overwriteTooltip}",
			checked : "{/overwrite}",
			change : function(oEvent) {
				that._validateTemplateInfoStep(oEvent).fail(/*No failure handling is needed here*/);
			},
			layoutData : new sap.ui.layout.GridData({
				span : "L5 M8 S12"
			}),
			accessibleRole : sap.ui.core.AccessibleRole.Checkbox
		}).addStyleClass("wizardCheckBox");

		var oDescriptionLabel = new sap.ui.commons.TextView({
			text : "{i18n>templateInfoStep_templateInfoGrid_description}",
			tooltip : "{i18n>templateInfoStep_templateInfoGrid_descriptionToolTip}",
			textAlign : "Left",
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12",
				linebreak : true
			})
		}).addStyleClass("wizardBody");

		this.oDescriptionTextField = new sap.ui.commons.TextField({
			width : "100%",
			placeholder : "{i18n>templateInfoStep_templateInfoGrid_descriptionDes}",
			change : function(oEvent) {
				that._validateTemplateInfoStep(oEvent).fail(/*No failure handling is needed here*/);
			},
			layoutData : new sap.ui.layout.GridData({
				span : "L5 M8 S12"
			}),
			accessibleRole : sap.ui.core.AccessibleRole.Textbox
		});

		var oTemplateTypeLabel = new sap.ui.commons.TextView({
			text : "{i18n>templateInfoStep_templateInfoGrid_templatetype}",
			tooltip : "{i18n>templateInfoStep_templateInfoGrid_templatetypeToolTip}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12",
				linebreak : true
			})
		}).addStyleClass("wizardBody");

		//TODO: use i18n for project / component and find how to consider value instead of name on selection method
		this.oTemplateTypeDrp = new sap.ui.commons.DropdownBox({
			width : "100%",
			items : [ new sap.ui.core.ListItem({
				text : "project"
			}), new sap.ui.core.ListItem({
				text : "component"
			}) ],
			layoutData : new sap.ui.layout.GridData({
				span : "L5 M8 S12"
			}),
			change : [ that._onTemplateTypeChange, that ],
			accessibleRole : sap.ui.core.AccessibleRole.Combobox
		});

		// Category UI:

		var oCategoryTitleLabel = new sap.ui.commons.TextView({
			text : "{i18n>templateInfoStep_categoryGrid_CategoryTitle}",
			tooltip : "{i18n>templateInfoStep_categoryGrid_CategoryTitleToolTip}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L1 M2 S12",
				linebreak : true
			})
		}).addStyleClass("wizardBody");

		this.oCategoryRB = new sap.ui.commons.RadioButton({
			text : "{i18n>templateInfoStep_categoryGrid_UseExistingRadioButton}",
			tooltip : "{i18n>templateInfoStep_categoryGrid_UseExistingRadioButtonTooltip}",
			groupName : 'CategoryGroup',
			selected : true,
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12"
			}),
			select : [ that._updateAndValidateCategoryFields, that ],
			accessibleRole : sap.ui.core.AccessibleRole.Radio
		});

		this.oCategoryListBox = new sap.ui.commons.DropdownBox({
			maxPopupItems : 6,
			editable : true,
			layoutData : new sap.ui.layout.GridData({
				span : "L4 M7 S12"
			}),
			width : "100%",
			change : function(oEvent) {
				that._validateTemplateInfoStep(oEvent).fail(/*No failure handling is needed here*/);
			},
			accessibleRole : sap.ui.core.AccessibleRole.Combobox
		});

		var oCategoryListItem = new sap.ui.core.ListItem();
		oCategoryListItem.bindProperty("text", "CategoryName");

		this.oCategoryListBox.bindItems("/categories", oCategoryListItem);

		this.oNewCategoryRB = new sap.ui.commons.RadioButton({
			text : "{i18n>templateInfoStep_categoryGrid_CreateNewRadioButton}",
			tooltip : "{i18n>templateInfoStep_categoryGrid_CreateNewRadioButtonTooltip}",
			groupName : 'CategoryGroup',
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			}),
			select : [ that._updateAndValidateCategoryFields, that ],
			accessibleRole : sap.ui.core.AccessibleRole.Radio
		});

		var oCategoryName = new sap.ui.commons.Label({
			text : "{i18n>templateInfoStep_categoryGrid_CategoryName}",
			tooltip : "{i18n>templateInfoStep_categoryGrid_CategoryNameToolTip}",
			layoutData : new sap.ui.layout.GridData({
				linebreak : true,
				span : "L2 M2 S12"
			})
		}).addStyleClass("newCategoryTextField");

		this.oCategoryNameTextField = new sap.ui.commons.TextField({
			width : "100%",
			placeholder : "{i18n>templateInfoStep_categoryGrid_CategoryNamePlaceholder}",
			editable : false,
			change : function(oEvent) {
				that._validateTemplateInfoStep(oEvent).fail(/*No failure handling is needed here*/);
			},
			layoutData : new sap.ui.layout.GridData({
				span : "L4 M7 S12"
			}),
			accessibleRole : sap.ui.core.AccessibleRole.Textbox
		});

		var oCategoryDescription = new sap.ui.commons.Label({
			text : "{i18n>templateInfoStep_categoryGrid_CategoryDescription}",
			tooltip : "{i18n>templateInfoStep_categoryGrid_CategoryDescriptionToolTip}",
			layoutData : new sap.ui.layout.GridData({
				linebreak : true,
				span : "L2 M2 S12"
			})
		}).addStyleClass("newCategoryTextField");

		this.oCategoryDescriptionTextField = new sap.ui.commons.TextField({
			width : "100%",
			editable : false,
			placeholder : "{i18n>templateInfoStep_categoryGrid_CategoryDescriptionPlaceholder}",
			change : function(oEvent) {
				that._validateTemplateInfoStep(oEvent).fail(/*No failure handling is needed here*/);
			},
			layoutData : new sap.ui.layout.GridData({
				span : "L4 M7 S12"
			}),
			accessibleRole : sap.ui.core.AccessibleRole.Textbox
		});

		var oCategoryGrid = new sap.ui.layout.Grid({
			content : [ this.oCategoryRB, this.oCategoryListBox, this.oNewCategoryRB, oCategoryName, that.oCategoryNameTextField,
					oCategoryDescription, that.oCategoryDescriptionTextField ],
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				indent : "L1 M1 S1"
			})
		});

		this.oTemplateInfoGrid = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"

			}),
			content : [ oDisplayNameLabel, that.oDisplayNameTextField, this.overwriteComponentCheckBox, oDescriptionLabel, that.oDescriptionTextField, oTemplateTypeLabel,
					that.oTemplateTypeDrp, oCategoryTitleLabel, oCategoryGrid ]
		});
	},

	_onTemplateTypeChange : function(oEvent) {
		var sTemplateType = oEvent.getParameter("selectedItem").getText();
 		var oModel = this.getModel();
        if (!oModel.getProperty("/template")) {
            oModel.setProperty("/template", {});
        }
		oModel.setProperty("/template/templateType", sTemplateType);

		this.fireValueChange({
			id : "createdTemplateType",
			value : sTemplateType
		});

	},

	_updateAndValidateCategoryFields : function(oEvent) {
		if (this.oCategoryRB.getSelected()) {
			this.oCategoryListBox.setEditable(true);
			this.oCategoryDescriptionTextField.setEditable(false);
			this.oCategoryNameTextField.setEditable(false);
		} else {
			this.oCategoryListBox.setEditable(false);
			this.oCategoryDescriptionTextField.setEditable(true);
			this.oCategoryNameTextField.setEditable(true);
		}

		this._validateTemplateInfoStep(oEvent).fail(/*No failure handling is needed here*/);
	},

	_updateCategoryListModel : function() {

		var that = this;
		var aCategoryNames = [];

		if (!this.oCategoryModel) {
			this.fireProcessingStarted();
			this.getContext().service.template.getCategories().then(function(aCategories) {
				that.oCategoryModel = new sap.ui.model.json.JSONModel();
				if (aCategories !== undefined && aCategories !== null) {
					for ( var category in aCategories) {
						var sCategoryId = aCategories[category].getId();
						var sCategoryName = aCategories[category].getName();
						var sCategoryDescription = aCategories[category].getDescription();

						var oCategory = {
							"CategoryId" : sCategoryId,
							"CategoryName" : sCategoryName,
							"CategoryDescription" : sCategoryDescription,
							"isNew" : false
						};
						aCategoryNames.push(oCategory);
					}
				}

				that._getCategoriesFromPluginProject().then(function(aPluginCategories) {
					// Join the plugin categories into RDE categories array
					aCategoryNames = aCategoryNames.concat(aPluginCategories);
					that.oCategoryModel.setData({
						"categories" : aCategoryNames
					});
					that.oCategoryListBox.setModel(that.oCategoryModel);
					that.fireProcessingEnded();
				}).fail(function(oError) {
					// Use only RDE categories
					that.oCategoryModel.setData({
						"categories" : aCategoryNames
					});
					that.oCategoryListBox.setModel(that.oCategoryModel);
					that.fireProcessingEnded();
				}).done();
			}).fail(function(oError) {
				that.oCategoryListBox.setModel(undefined);
				that.fireProcessingEnded();
			}).done();
		}

	},

	_getCategoriesFromPluginProject : function() {
		var that = this;
		var aParts = this.getModel().getData().componentPath.split("/");
		var sProjectFolderPath = "/" + aParts[1];
		return this.getContext().service.filesystem.documentProvider.getDocument(sProjectFolderPath + "/plugin.json").then(
				function(oPluginDocument) {
					return oPluginDocument.getContent().then(
							function(oContent) {
								var oContentData = JSON.parse(oContent);
								var aCategoriesForModel = [];
								var aPluginCategories = oContentData.configures.services["template:categories"];

								if (aPluginCategories) {
									var aI18nPromises = [];
									for ( var iCategory = 0, len = aPluginCategories.length; iCategory < len; iCategory++) {
										var oCategory = {
											"CategoryId" : aPluginCategories[iCategory].id,
											"CategoryName" : aPluginCategories[iCategory].name,
											"CategoryDescription" : aPluginCategories[iCategory].description,
											"isNew" : false
										};

										// Update oCategory name and description with i18n values.
										var oCategoryNamePromise = Q();
										var iNameKeyStartIndex = oCategory.CategoryName.indexOf("{i18n>");
										if (iNameKeyStartIndex === 0) {
											var sName18nKey = oCategory.CategoryName.substring(iNameKeyStartIndex + 6,
													oCategory.CategoryName.length - 1);
											oCategoryNamePromise = that.getContext().service.translation.getPropertyKey(undefined, "i18n",
													sName18nKey, oPluginDocument).then(function(oNameI18nProperty) {
												for ( var i = 0, leng = aCategoriesForModel.length; i < leng; i++) {
													if (aCategoriesForModel[i].CategoryName === "{i18n>" + oNameI18nProperty.key + "}") {
														aCategoriesForModel[i].CategoryName = oNameI18nProperty.value;
														break;
													}
												}
											}).fail(/*Leave category name as is - and don't fail getCategories method*/);
										}
										aI18nPromises.push(oCategoryNamePromise);

										var oCategoryDescPromise = Q();
										var iDescKeyStartIndex = oCategory.CategoryDescription.indexOf("{i18n>");
										if (iDescKeyStartIndex === 0) {
											var sDesc18nKey = oCategory.CategoryDescription.substring(iDescKeyStartIndex + 6,
													oCategory.CategoryDescription.length - 1);
											oCategoryDescPromise = that.getContext().service.translation.getPropertyKey(undefined, "i18n",
													sDesc18nKey, oPluginDocument).then(
													function(oDescI18nProperty) {
														for ( var i = 0, len = aCategoriesForModel.length; i < len; i++) {
															if (aCategoriesForModel[i].CategoryDescription === "{i18n>"
																	+ oDescI18nProperty.key + "}") {
																aCategoriesForModel[i].CategoryDescription = oDescI18nProperty.value;
																break;
															}
														}
													}).fail(/*Leave category description as is - and don't fail getCategories method*/);
										}
										aI18nPromises.push(oCategoryDescPromise);

										aCategoriesForModel.push(oCategory);
									}

									return Q.all(aI18nPromises).spread(function() {
										return aCategoriesForModel;
									});
								} else {
									return aCategoriesForModel;
								}
							});
				});
	},

/* *********************************
* 			Validations            *
***********************************/

	validateStepContent : function() {
		return this._validateTemplateInfoStep();
	},

	_handleInvalidControl : function(sMessage, oControl) {
		this.markAsInvalid(oControl);
		this.fireValidation({
			isValid : false,
			message : sMessage
		});
	},

	_handleInvalidControlConsiderFirstChange : function(sMessage, oControl) {
		if (!oControl.hasAlreadyChanged) {
			this.fireValidation({
				isValid : false
			});
		} else {
			// also mark validation error and put error message
			this._handleInvalidControl(sMessage, oControl);
		}
	},

	_markValidControlIfChanged : function(oControl, oEventSource) {
		if (oEventSource === oControl) {
			// Mark changed control as valid
			this.markAsValid(oControl);
		}
	},

	// Remove all characters except alphanumeric and change the string to be in lower case
	_getIdFromName : function(sName) {

		var sId = sName.replace(/[^\w]/gi, '');
		sId = sId.replace("_", "").toLowerCase();

		return sId;
	},

	_validateTemplateUI : function(bIsTemplateIdValid, oEvent, oEventSource, sTemplateDescription) {

		var sMessage;

		if (!bIsTemplateIdValid) {
			sMessage = this.getContext().i18n.getText("templateInfoStep_templateInfoGrid_existsTemplateIdErr");
		    this._handleInvalidControl(sMessage, this.oDisplayNameTextField);
			throw new Error(sMessage);
		}
		
		// Mark changed template display name control as valid
		if (oEvent) {
			this._markValidControlIfChanged(this.oDisplayNameTextField, oEventSource);
		}

		// Mark changed template description control as valid
		if (oEvent) {
			this._markValidControlIfChanged(this.oDescriptionTextField, oEventSource);
		}
	},

	_validateCategoryUI : function(bNewCategoryMode, oEvent, oEventSource, oCategory) {

		var sMessage;

		if (bNewCategoryMode) {
			// Mark changed template description control as valid
			if (oEvent) {
				this._markValidControlIfChanged(this.oCategoryDescriptionTextField, oEventSource);
			}

			// Validate category id in case that the new category is selected
			if (oCategory.id.length === 0) {
				sMessage = this.getContext().i18n.getText("templateInfoStep_categoryGrid_noCategoryNameErr");
				this._handleInvalidControlConsiderFirstChange(sMessage, this.oCategoryNameTextField);
				throw new Error(sMessage);
			}
			// Mark changed template description control as valid
			if (oEvent) {
				this._markValidControlIfChanged(this.oCategoryNameTextField, oEventSource);
			}

			// Validate category id as valid in case that the new category is selected
			if (!this._validateIfCategoryNotExists(oCategory.id)) {
				sMessage = this.getContext().i18n.getText("templateInfoStep_categoryGrid_exsitsErr");
				this._handleInvalidControl(sMessage, this.oCategoryNameTextField);
				throw new Error(sMessage);
			}

			// Mark changed template description control as valid
			if (oEvent) {
				this._markValidControlIfChanged(this.oCategoryNameTextField, oEventSource);
			}
		} else {
			this.clearValidationMarks(this.oCategoryNameTextField);
			this.clearValidationMarks(this.oCategoryDescriptionTextField);
		}
	},

	_validateIfCategoryNotExists : function(sCategoryId) {
		var bCategoryExists = false;
		var aCategories = this.oCategoryModel.oData.categories;

		for ( var i = 0; i < aCategories.length; i++) {
			var oCategory = aCategories[i];
			if (oCategory.CategoryId === sCategoryId) {
				bCategoryExists = true;
				break;
			}
		}

		return !bCategoryExists;
	},

	_updateModelWithData : function(bNewCategoryMode, oTemplate, oCategory) {

		var oModel = this.getModel().getData();
		if (!oModel.template) {
			oModel.template = {};
		}
		oModel.template.id = oTemplate.id;
		oModel.template.technicalname = oTemplate.technicalname;
		oModel.template.name = oTemplate.name;
		oModel.template.description = oTemplate.description;

		if (!bNewCategoryMode) {
			// update the model with the existing category from the category list box
			var oListItem = null;
			for ( var i = 0; i < this.oCategoryListBox.getItems().length; i++) {
				if (this.oCategoryListBox.getItems()[i].getId() === this.oCategoryListBox.getSelectedItemId()) {
					oListItem = this.oCategoryListBox.getItems()[i];
					break;
				}
			}
			if (oListItem) {
				var oCategoryListItem = oListItem.getBindingContext().getObject();
				if (oCategoryListItem) {
					oModel.template.category = oCategoryListItem.CategoryId;
				}
				if (oModel.template.categoryEntry) {
					oModel.template.categoryEntry = undefined;
				}
			}
		} else {
			// update the model with the new category
			var categoryEntry = {
				"id" : oCategory.id,
				"name" : oCategory.name,
				"description" : oCategory.description
			};
			oModel.template.categoryEntry = categoryEntry;
			if (oModel.template.category) {
				oModel.template.category = undefined;
			}
		}
	},

	_getTextFieldNewValueParameter : function(oEvent, oEventSource, oTextField) {

		var sNewValue = oTextField.getValue();
		if (oEvent && oEventSource === oTextField && oEvent.getParameter("newValue")) {
			sNewValue = oEvent.getParameter("newValue").trim();
		}

		return sNewValue;
	},

	_validateTemplateInfoStep : function(oEvent) {

		var that = this;
		var oEventSource = null;

		if (oEvent) {
			oEventSource = oEvent.getSource();

			// check if event triggered from the first step and not from this step ui.
// 			var sEventId = oEvent.getParameter("id");
// 			if (sEventId === "componentPath" || sEventId === "overwrite") {
// 				oEventSource = this.oDisplayNameTextField;
// 			}
			
			// put validation marks on the name field and not on the overwrite checkbox
			if (oEventSource === this.overwriteComponentCheckBox) {
			    oEventSource = this.oDisplayNameTextField;
			}

			// Clear validation marks from the control that its value was changed
			this.clearValidationMarks(oEventSource);
			// Flag the changed control (so required fields will not be marked with error before ever changed)
			oEventSource.hasAlreadyChanged = true;
		}

		var sTemplateDisplayName = this._getTextFieldNewValueParameter(oEvent, oEventSource, this.oDisplayNameTextField);
		var sTemplateDescription = this._getTextFieldNewValueParameter(oEvent, oEventSource, this.oDescriptionTextField);
		var sCategoryName = this._getTextFieldNewValueParameter(oEvent, oEventSource, this.oCategoryNameTextField);
		var sCategoryDescription = this._getTextFieldNewValueParameter(oEvent, oEventSource, this.oCategoryDescriptionTextField);

		var bNewCategoryMode = this.oNewCategoryRB.getSelected();

		var sMessage;

		// Validate template display name
		if (sTemplateDisplayName.length === 0) {
			// Required field validation - don't mark with error if control wasn't changed 
			sMessage = this.getContext().i18n.getText("templateInfoStep_templateInfoGrid_noTemplateNameErr");
			this._handleInvalidControlConsiderFirstChange(sMessage, this.oDisplayNameTextField);
			return Q.reject(new Error(sMessage));
		}
		
		var sTemplateName = this._getIdFromName(sTemplateDisplayName);
		
		if (!sTemplateName || sTemplateName.length === 0) {
			sMessage = this.getContext().i18n.getText("templateInfoStep_templateInfoGrid_noTemplateTechnicalNameErr");
		    this._handleInvalidControl(sMessage, this.oDisplayNameTextField);
			return Q.reject(new Error(sMessage));
		}

		// Add the prefix pluginName to the template id
		//var pluginPath = this.getModel().oData.componentPath.substring(1);
		var aParts = this.getModel().getData().componentPath.split("/");
		var sProjectName = aParts[1];
		var sTemplateId = sProjectName + "." + sTemplateName;

		return this._validateNonExistingTemplate(sTemplateName).then(function(bIsNameValid) {
			if (!bIsNameValid) {
				sMessage = that.getContext().i18n.getText("templateInfoStep_templateInfoGrid_existsTemplateNameErr");
				that._handleInvalidControl(sMessage, that.oDisplayNameTextField);
				throw new Error(sMessage);
			}

			return that._validateNonExistingTemplateId(sTemplateId).then(function(bIsTemplateIdValid) {

				var oTemplate = {
					"id" : sTemplateId,
					"technicalname" : sTemplateName,
					"name" : sTemplateDisplayName,
					"description" : sTemplateDescription
				};

				var oCategory = {
					"id" : that._getIdFromName(sCategoryName),
					"name" : sCategoryName,
					"description" : sCategoryDescription
				};

				that._validateTemplateUI(bIsTemplateIdValid, oEvent, oEventSource, oTemplate.description);
				that._validateCategoryUI(bNewCategoryMode, oEvent, oEventSource, oCategory);

				// If got here - all template information is valid!
				that._updateModelWithData(bNewCategoryMode, oTemplate, oCategory);

				that.fireValidation({
					isValid : true
				});
				return true;
			});
		});
	},

	_validateNonExistingTemplate : function(sTemplateName) {
		if (!this.getModel().getData().overwrite) {
			var sTargetPath = this.getModel().getData().componentPath;
			if (sTargetPath) {
				var sTemlateFolderPath = sTargetPath;
				if (sTemlateFolderPath.lastIndexOf("/") !== (sTemlateFolderPath.length - 1)) {
					sTemlateFolderPath = sTemlateFolderPath + "/";
				}
				sTemlateFolderPath = sTemlateFolderPath + sTemplateName;
				return this.getContext().service.filesystem.documentProvider.getDocument(sTemlateFolderPath).then(function(oResult) {
					if (oResult) {
						// template already exists and cannot be overwriten - validation failed
						return false;
					} else {
						// template folder not already exists in generation path
						return true;
					}
				}).fail(function(oError) {
					// template folder not already exists in generation path
					return true;
				});
			}
		}
		return Q(true);
	},

	_validateNonExistingTemplateId : function(sId) {
		return this.getContext().service.template.getTemplates().then(function(mTemplates) {
			if (mTemplates) {
				for ( var sTemplateId in mTemplates) {
					if (sId === sTemplateId) {
						return false;
					}
				}
			}
			return true;
		}).fail(function(oError) {
			// don't limit id value from user input if cannot validate it
			return true;
		});
	},

/* ****************************************
 * 		Step Content Control Life-Cycle   *
 *****************************************/

	renderer : {},

	onAfterRendering : function() {

		var oModel = this.getModel();
		this.oTemplateInfoGrid.setModel(oModel);

		if (!this.bAlreadyLoaded) {
			// loaded on the first time - fire value change of template type dropdown (update model)
			var oFirstItem = this.oTemplateTypeDrp.getItems()[0];
			this.oTemplateTypeDrp.fireEvent("change", {
				selectedItem : oFirstItem
			});
			// get all categories and fire value change of categories dropdown
			this._updateCategoryListModel();
			this.bAlreadyLoaded = true;
		}

		else if (this.getModel() && (!this.getModel().getData().template)) {
			// loaded after clean step - fire value change of template type and category dropdowns (update model)
			var oTemplateTypeFirstItem = this.oTemplateTypeDrp.getItems()[0];
			this.oTemplateTypeDrp.fireEvent("change", {
				selectedItem : oTemplateTypeFirstItem
			});

		}
	},

	setFocusOnFirstItem : function() {
		this.oDisplayNameTextField.focus();
	},

	cleanStep : function() {

		if (this.getModel()) {
			var oModel = this.getModel().getData();
			if (oModel.template) {
				// clean model if created
				oModel.template = undefined;
			}
		}
	}

});