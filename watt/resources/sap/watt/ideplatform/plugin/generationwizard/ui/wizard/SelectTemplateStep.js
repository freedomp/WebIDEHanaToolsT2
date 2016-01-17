jQuery.sap.declare("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.SelectTemplateStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateItemLayout");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent
	.extend("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.SelectTemplateStep", {
		metadata: {
			properties: {
				"data": "object",
				"wizardControl": "object",
				"numberOfWizardSteps": "int",
				"basicStepIndex": "int"
			}
		},

		_aAggregateTemplates: null,
		_sNode: "sap.watt.ideplatform.generationwizard.favoritesTemplates.",
		_allCategoriesId: "sap.watt.ideplatform.generationwizard.allCategories",
		_sFavoriteCategoryId: "Favorite",
		_sFavoriteIcon: "sap-icon://watt/favorite",
		_sUnFavoriteIcon: "sap-icon://watt/unfavorite",

		init: function() {
			var that = this;
			this.bAlreadyLoaded = false;
			this.bLoadData = false;
			this.bAlreadySetPreferences = false;
			this.setBasicStepIndex(0); //default value
			this.sSelectedCategoryId = "";

			//Initialize the example data and the model
			var data = {
				templates: []
			};

			this._oModel = new sap.ui.model.json.JSONModel();
			this._oModel.setData(data);

			//Initialize the Dataset and the layouts
			function createTemplate() {
				var c = sap.ui.commons;

				return new sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateItemLayout({
					button: [
						new c.Button({
							icon: {
								path: "favorite",
								mode: sap.ui.model.BindingMode.OneWay
							},
							lite: true,
							press: [that._templateFavoriteSelectionChanged, that]
						}),
						new c.Button({
							icon: "{image}",
							lite: true,
							press: function(oEvent) {
								// TODO : check if we can use oDataSet object
								var oItem = this.getParent().getParent();
								var sPath = oItem.getBindingContext().getPath(); //e.g. "/templates/1"
								var iPos = sPath.indexOf("/", 1);
								if (iPos > -1) {
									var sNewLeadSelectedIndex = sPath.substring(iPos + 1, sPath.length);
									that.oDataSet.setLeadSelection(sNewLeadSelectedIndex);
								}
							}
						}).addStyleClass('wizardButtonuttonWithIconFont')
					],
					tileText: new c.TextView({
						text: "{title}",
						wrapping: true,
						enabled: false
					}).addStyleClass('tileTextDiv')
				});
			}

			that = this;
			this.oTemplateSelectionGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L8 M8 S12"
				}),
				hSpacing: 0
			});

			this.oDataSet = sap.ui.getCore().byId("SelectTemplateStep_DataSet");
			if (this.oDataSet) {
				this.oDataSet.destroy();
			}

			this.oDataSet = new sap.ui.ux3.DataSet("SelectTemplateStep_DataSet", {
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				showSearchField: false,
				showToolbar: false,
				items: {
					path: "/templates",
					template: new sap.ui.ux3.DataSetItem({
						iconSrc: "{image}",
						title: "{title}",
						favourite: "{favourite}"
					}).data("template", "{template}")
				},
				views: [new sap.ui.ux3.DataSetSimpleView({
					name: "Floating, responsive View",
					floating: true,
					template: createTemplate()
				})],
				selectionChanged: [that._dataSetSelectionChanged, that],
				busyIndicatorDelay : 0
			});

			this.oDataSet.setModel(this._oModel);

			jQuery.sap.require("sap.ui.ux3.DataSetItem");
			sap.ui.ux3.DataSetItem.prototype.ondblclick = function() {
				sap.ui.ux3.DataSetItem.prototype.onclick.apply(this, arguments);
			};

			jQuery.sap.require("sap.ui.commons.Button");
			sap.ui.commons.Button.prototype.ondblclick = function(oEvent) {
				if ( oEvent.srcControl.getIcon() === that._sFavoriteIcon || oEvent.srcControl.getIcon() === that._sUnFavoriteIcon){
					if (that.sSelectedCategoryId === that._sFavoriteCategoryId ){
						sap.ui.commons.Button.prototype.onclick.apply(this, arguments);
					}
					else{
						sap.ui.commons.Button.prototype.onclick.apply(this, arguments);
						that.oDataSet.fireEvent("selectionChanged", {
							newLeadSelectedIndex: that.oDataSet.getLeadSelection()
						});
					}
				}
			};
			
			that = this;

			this.oSearchGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				vSpacing: 0
			});

			this.oHorizontalLayout = new sap.ui.layout.HorizontalLayout({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			this.oSearch = new sap.ui.commons.SearchField({
				enableListSuggest: false,
				enableClear: true,
				startSuggestion: 0,
				width: "250px",
				layoutData: new sap.ui.layout.GridData({
					span: "L1 M5 S5",
					linebreak: true
				}),
				search: function(oEvent) {
					that._updateDataSet(oEvent.getParameter("query"));
				},

				suggest: function(oEvent) {
					if (oEvent.getParameter("value") === "") {
						that._updateDataSet(oEvent.getParameter("value"));
						that.oSearch.setValue("");
					}
				}
			}).addStyleClass("previousButton");

			this.oSearch.addDelegate({
				onAfterRendering: function() {
					if (that._searchValue !== undefined) {
						var oInput = jQuery("#" + that.oSearch.getId() + " :input");
						oInput.focus();
						oInput[0].setSelectionRange(that._searchValue.length, that._searchValue.length);
					}
				}
			});

			this.oCategoriesDropdownBox = new sap.ui.commons.DropdownBox({
				width: "250px",
				layoutData: new sap.ui.layout.GridData({
					span: "L1 M5 S5"
				}),
				change: function(e) {
					that.sSelectedCategoryId = e.getParameter("selectedItem").data()["sId"];
					that._displayAvailableTitles();
				}
			});

			this.oTemplateDetailsGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L4 M4 S12"
				})
			});

			this.oTemplateDescription = new sap.ui.commons.TextView({
				width: "100%",
				wrapping: true,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				})
			}).addStyleClass("wizardBody wrappedText");

			this.oHorizontalVersionsLayout = new sap.ui.layout.HorizontalLayout({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			this.availableVersionsLabel = new sap.ui.commons.TextView({
				text: "{i18n>selectTemplateStep_availableVersions}",
				labelFor: this.oTemplateVersionDropdownBox,
				textAlign: "Left",
				width: "150px"
			});

			this.oTemplateVersionDropdownBox = new sap.ui.commons.DropdownBox({
				width: "300px",
				change: function(e) {
					var selectedVersion = e.getParameter("selectedItem").getKey();
					return that.getContext().service.template.getTemplate(that.selectedTemplate.getId(), selectedVersion).then(
						function(oTemplate) {
							that.fireValidation({
								isValid: false
							});

							that.selectedTemplate = oTemplate;
							that._selectTemplateChanged();
						});
				}
			});

			this.oTemplateImage = new sap.ui.commons.Image({
				decorative: false,
				width: "85%",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				press: function(oEvent) {
					var fullSizeImage = new sap.ui.commons.Image({
						alt: this.getAlt(),
						src: this.getSrc(),
						decorative: false,
						height: "600px"
					});
					var imagePopUp = new sap.ui.ux3.OverlayDialog({
						openButtonVisible: false,
						closeButtonVisible: true,
						height: fullSizeImage.getHeight(),
						width: fullSizeImage.getWidth()
					});
					imagePopUp.addContent(fullSizeImage);
					imagePopUp.attachBrowserEvent("keyup", function(e) {
						if (e && e.keyCode === 27) {
							// esc key is pressed
							imagePopUp.close();
						}
					});
					imagePopUp.open();
					jQuery("#" + imagePopUp.getId() + "-content").css("overflow", "hidden");
				}
			}).addStyleClass("alignControlToTheCenter templateImageStyle");
		},

		_isFavoriteCategoryExists: function(oTemplate) {

			var templateCategory = oTemplate._mConfig.category;

			if (templateCategory.indexOf(this._sFavoriteCategoryId) > -1) {
				return this._sFavoriteIcon;
			}

			return this._sUnFavoriteIcon;
		},

		_sortTemplates: function(aTemplatesInCategory) {
			aTemplatesInCategory.sort(function(template1, template2) {
				//sort by order priority, the smaller priority comes first. undefined priority will 
				//be listed last. equal priority will be sorted alphabetically
				var iTempOrder1 = template1.getOrderPriority();
				var iTempOrder2 = template2.getOrderPriority();
				if (iTempOrder1 === iTempOrder2) { //either undefine or equals
					return template1.getName().localeCompare(template2.getName());
				} else {
					if (!iTempOrder1 || !iTempOrder2) { //only one of them is undefined
						return (!iTempOrder1) ? 1 : -1; //undefine has low priority
					}
					return iTempOrder1 - iTempOrder2;
				}
			});
		},

		_bindTemplatesDataToModel: function(aTemplatesInCategory) {
			var data = this._oModel.getData();
			data.templates = [];

			var sCategoryLength = aTemplatesInCategory.length;
			for (var i = 0; i < sCategoryLength; i++) {

				var sFavIcon = this._isFavoriteCategoryExists(aTemplatesInCategory[i]);
				var oTemplate = {
					id: i.toString(),
					title: aTemplatesInCategory[i].getName(),
					image: aTemplatesInCategory[i].getIcon(),
					template: aTemplatesInCategory[i],
					favorite: sFavIcon
				};
				data.templates.push(oTemplate);
			}

			this._oModel.setData(data);
		},

		_initialWizardControls: function() {

			this.oTemplateDescription.setText("");
			this.oTemplateDescription.setTooltip("");
			this.oTemplateImage.setSrc("");
			this.oTemplateVersionDropdownBox.setVisible(false);
			this.availableVersionsLabel.setVisible(false);
		},

		_displayAvailableTitles: function() {

			var aTemplatesInCategory = this._getTemplatesByCategory();
			this._sortTemplates(aTemplatesInCategory);
			this._bindTemplatesDataToModel(aTemplatesInCategory);

			// if move to different category with filtering
			if (this.oDataSet.getItems().length > 0) {
				if (this.oDataSet.getLeadSelection() !== 0) {
					this.oDataSet.setLeadSelection(0);
				} else {
					this.oDataSet.fireEvent("selectionChanged", {
						newLeadSelectedIndex: 0
					});
				}
			} else {
				this._notifyTemplateSelectionInvalid("");
				this.oDataSet.fireEvent("selectionChanged", {
					newLeadSelectedIndex: -1
				});

				this._initialWizardControls();
			}
		},

		_getTemplatesByCategory: function() {
			var aData = this.getData();
			var i;
			if (this.sSelectedCategoryId === this._allCategoriesId) {
				if (!this._aAggregateTemplates) {
					this._aAggregateTemplates = new Array();
					for (i = 0; i < aData.length; i++) {
						this._unionArrays(this._aAggregateTemplates, aData[i].templates);
					}
				}
				return this._aAggregateTemplates;
			} else {
				for (i = 0; i < aData.length; i++) {
					if (aData[i].category.getId() === this.sSelectedCategoryId) {
						return aData[i].templates;
					}
				}
			}
		},

		_unionArrays: function(aArrayA, aArrayB) {

			for (var i = 0; i < aArrayB.length; i++) {
				if (jQuery.inArray(aArrayB[i], aArrayA) === -1) {
					aArrayA.push(aArrayB[i]);
				}
			}
		},

		_initializeDataSetSelection: function(data) {
			if (data.templates.length > 0) {
				this.oDataSet.fireEvent("selectionChanged", {
					newLeadSelectedIndex: 0
				});
			}
		},

		_updateDataSet: function(sPrefix) {
			this._searchValue = sPrefix;

			var oBinding = this.oDataSet.getBinding("items");

			var oFilterItems = oBinding.filter(!sPrefix ? [] : [new sap.ui.model.Filter("title",
				sap.ui.model.FilterOperator.Contains, sPrefix)]);

			if (oFilterItems.aIndices.length > 0) {
				if (this.oDataSet.getLeadSelection() !== 0) {
					this.oDataSet.setLeadSelection(0);
				} else {
					this.oDataSet.fireEvent("selectionChanged", {
						newLeadSelectedIndex: 0
					});
				}

			} else {
				this._notifyTemplateSelectionInvalid("");
				this.oDataSet.fireEvent("selectionChanged", {
					newLeadSelectedIndex: -1
				});

				this._initialWizardControls();
			}
		},

		setFocusOnFirstItem: function() {
			this.oSearch.focus();
		},

		setTabIndexes: function(i, nextButtonId) {
			this.nextButtonId = nextButtonId;

			var $listBox = jQuery("#" + this.oCategoriesDropdownBox.getId());
			if ($listBox) {
				$listBox.tabIndex = 0;
			}
			var $searchBox = jQuery("#" + this.oSearch.getId());
			if ($searchBox) {
				$searchBox.tabIndex = 0;
			}
			var $dataSet = jQuery("#" + this.oDataSet.getId());
			if ($dataSet) {
				$dataSet.tabIndex = 0;
			}
		},

		_getCategoryNameFromCategoriesById: function(aData, iCategoryId) {
			var sCategoryName = "";

			for (var i = 0; i < aData.length; i++) {
				if (aData[i].category.getId() === iCategoryId) {
					sCategoryName = aData[i].category.getName();
					break;
				}
			}

			return sCategoryName;
		},

		setData: function(aData) {
			this.setProperty("data", aData, true);
			var oFirstItem = this._getAndMakeCategoryListItems();
			this.oCategoriesDropdownBox.setSelectedItemId(oFirstItem.sId);
			this.oCategoriesDropdownBox.fireEvent("change", {
				selectedItem: oFirstItem
			});

			var content = new sap.ui.layout.Grid();

			this.oHorizontalLayout.addContent(this.oSearch);
			this.oHorizontalLayout.addContent(this.oCategoriesDropdownBox);
			this.oSearchGrid.addContent(this.oHorizontalLayout);
			content.addContent(this.oSearchGrid);

			this.oHorizontalVersionsLayout.addContent(this.availableVersionsLabel);
			this.oHorizontalVersionsLayout.addContent(this.oTemplateVersionDropdownBox);
			this.oTemplateSelectionGrid.addContent(this.oDataSet);
			this.oTemplateSelectionGrid.addContent(this.oHorizontalVersionsLayout);
			this.oTemplateSelectionGrid.addContent(this.oTemplateDescription);
			content.addContent(this.oTemplateSelectionGrid);

			this.oTemplateDetailsGrid.addContent(this.oTemplateImage);
			content.addContent(this.oTemplateDetailsGrid);

			this.addContent(content);

			this.fireProcessingEnded();
			this.bLoadData = true;
		},

		validateStepContent: function() {
			var that = this;
			var oDeferred = Q.defer();
			var leadSelectedIndex = this.oDataSet.getLeadSelection();
			if (leadSelectedIndex > -1) {
				//this.selectedTemplate = this.oDataSet.getItems()[leadSelectedIndex].data("template");
				this.selectedTemplate.validateOnSelection(this.getModel().getData()).then(function(bValidationOnSelectionResult) {
					if (bValidationOnSelectionResult) {
						that.selectedTemplate.customValidation(that.getModel().getData()).then(
							function(result) {
								if (result) {
									oDeferred.resolve(true);
									that.fireValidation({
										isValid: true
									});
								} else {
									that._notifyStepInvalid(that.getContext().i18n.getText("i18n",
										"selectTemplateStep_selectTemplateValidationErrorMsg"), oDeferred);
								}
							}).fail(
							function(oError) {
								if (oError && oError.message) {
									that._notifyStepInvalid(oError.message, oDeferred);
								} else {
									that._notifyStepInvalid(that.getContext().i18n.getText("i18n",
										"selectTemplateStep_selectTemplateValidationErrorMsg"), oDeferred);
								}
							});
					} else {
						that._notifyStepInvalid(that.getContext().i18n.getText("i18n",
							"selectTemplateStep_selectTemplateValidationErrorMsg"), oDeferred);
					}

				}).fail(
					function(oError) {
						if (oError && oError.message) {
							that._notifyStepInvalid(oError.message, oDeferred);
						} else {
							that._notifyStepInvalid(that.getContext().i18n.getText("i18n",
								"selectTemplateStep_selectTemplateValidationErrorMsg"), oDeferred);
						}
					});
			} else {
				this._notifyStepInvalid(this.getContext().i18n.getText("i18n", "selectTemplateStep_selectTemplateErrorMsg"),
					oDeferred);
			}
			return oDeferred.promise;
		},

		_notifyStepInvalid: function(sMessage, oDeferred) {
			oDeferred.reject(sMessage);
			this.fireValidation({
				isValid: false,
				message: sMessage
			});
		},

		_cleanNeoappModel: function() {
			if (this.getModel().oData.neoapp) {
				this.getModel().oData.neoapp = undefined;
			} else if (this.getModel().oData.destinations) {
				this.getModel().oData.destinations = undefined;
			}
		},

		_addWizardStepsToWizard: function(aWizardSteps, oWizard) {
			// Get and configure all template wizard steps
			if (this.getModel().oData.neoapp) {
				this.getModel().oData.neoapp.destinations = undefined;
			} else {
				this.getModel().oData.destinations = undefined;
			}
			var oServiceCatalogStepContent, oTemplateCustomizationStepContent, oOdataAnnotationSelectionStepContent = false;
			if (aWizardSteps !== undefined) {

				for (var i = 0; i < aWizardSteps.length; i++) {
					var oStepService = this.selectedTemplate.getWizardStepService(i);
					var oWizardStepContent = aWizardSteps[i].getStepContent();

					if (oStepService._sName === "catalogstep") {
						oServiceCatalogStepContent = oWizardStepContent;
					}

					if (oStepService._sName === "templateCustomizationStep") {
						oTemplateCustomizationStepContent = oWizardStepContent;
					}

					if (oStepService._sName === "odataAnnotationSelectionStep") {
						oOdataAnnotationSelectionStepContent = oWizardStepContent;
					}

					if (oWizardStepContent.onChangeBasicInformation !== undefined) {
						if (this.oBasicInformationStepContent) {
							this.oBasicInformationStepContent.attachValueChange(oWizardStepContent.onChangeBasicInformation,
								oWizardStepContent);
						}
					}

					if ((i === aWizardSteps.length - 1) && oStepService.instanceOf("sap.watt.common.service.ui.WizardFinishStep")) {
						// Last step which represents finish step
						oWizard.setFinishStepContent(oWizardStepContent);
					} else {
						// Any other regular wizard step
						oWizard.addStep(aWizardSteps[i]);
					}
				}

				// Handle auto registration on service change
				if (oServiceCatalogStepContent) {
					// Register Template Customization step on service catalog step change
					if (oTemplateCustomizationStepContent) {
						oServiceCatalogStepContent.attachValidation(
							oTemplateCustomizationStepContent.onSelectedServiceChange,
							oTemplateCustomizationStepContent);
					}
					// Register Annotation Selection step on service catalog step change
					if (oOdataAnnotationSelectionStepContent) {
						oServiceCatalogStepContent.attachValidation(
							oOdataAnnotationSelectionStepContent.onSelectedServiceChange,
							oOdataAnnotationSelectionStepContent);
					}
				}
			}
		},

		onBasicInformationChange: function(oEvent) {
			var oWizard = this.getWizardControl();

			if (this.bAlreadyLoaded) {
				var that = this;
				this.validateStepContent().then(
					function() {
						// Add steps of selected template only if they were not already added (in previous validation)
						if (that.getWizardControl().getStepsNumber() === that.getNumberOfWizardSteps()) {
							that.selectedTemplate.configWizardSteps().then(function(aWizardSteps) {
								that._addWizardStepsToWizard(aWizardSteps, oWizard);
								that.fireValueChange({
									id: "templateName",
									value: that.selectedTemplate
								});
							}).fail(
								function(oError) {
									// Getting or configuring steps failed
									this.fireValidation({
										isValid: false,
										message: that.getContext().i18n.getText("i18n",
											"selectTemplateStep_selectTemplateConfigureStepsErrorMsg")
									});
								});
						}
					}).fail( /*No failure handling is needed here*/ );
			}
		},

		cleanStep: function() {
			this._aAggregateTemplates = null;
			this.setProperty("data", undefined, true);
		},

		onAfterRendering: function() {
			if (!this.bLoadData) {
				this.fireProcessingStarted();
			}
			if (!this.bAlreadyLoaded) {
				this.bAlreadyLoaded = true;
				this._initializeDataSetSelection(this.oDataSet.getModel().oData);
			}
			if(this.bLoadData && this.bAlreadyLoaded){
				var aTemplatesInCategory = this._getTemplatesByCategory();
				this._sortTemplates(aTemplatesInCategory);
				this._bindTemplatesDataToModel(aTemplatesInCategory);
			}
		},

		_updateWizardControl: function(oWizard) {

			var iNumberOfWizardSteps = this.getNumberOfWizardSteps();
			if (this.getBasicStepIndex() !== -1) {
				this.oBasicInformationStepContent = oWizard.getStepAtIndex(this.getBasicStepIndex())._step; // getStepContent cannot be used as step already displayed.
			} else {
				this.oBasicInformationStepContent = null;
			}
			// remove all steps after the selected template step need to remove before we do getContent
			while (oWizard.getStepsNumber() > iNumberOfWizardSteps) {
				var oWizardStep = oWizard.getStepAtIndex(iNumberOfWizardSteps);
				var oWizardStepContent = oWizardStep._step; // getStepContent cannot be used as step already displayed.
				this.detachValueChange(oWizardStepContent.onChangeTemplate, oWizardStepContent);
				if (this.oBasicInformationStepContent) {
					this.oBasicInformationStepContent.detachValueChange(oWizardStepContent.onChangeBasicInformation,
						oWizardStepContent);
				}

				oWizard.removeStep(oWizardStep);
				oWizardStep.destroy();
			}

			// set the next step index of the last step to be undefined.
			oWizard.getStepAtIndex(iNumberOfWizardSteps - 1).setNextStepIndex(undefined);
			oWizard.removeFinishStep();
			oWizard.setFinishStepContent(null);
		},

		_isFavoriteState: function(sFavState) {
			return (sFavState === this._sUnFavoriteIcon) ? false : true;
		},

		_updateTemplatesCategory: function(sFavState, oTemplate) {
			var index;

			if (this._isFavoriteState(sFavState)) {
				// add Favorite Category to the template category array
				index = oTemplate._mConfig.category.indexOf(this._sFavoriteCategoryId);
				if (index === -1) {
					oTemplate._mConfig.category.push(this._sFavoriteCategoryId);
				}
			} else { // if Favorite
				// remove the Favorite Category from template category array
				index = oTemplate._mConfig.category.indexOf(this._sFavoriteCategoryId);
				if (index > -1) {
					oTemplate._mConfig.category.splice(index, 1);
				}
			}
		},

		_getFavoriteCategoryFromModel: function() {
			var aData = this.getData();

			for (var i = 0; i < aData.length; i++) {
				if (aData[i].category.getId() === this._sFavoriteCategoryId) {
					return aData[i];
				}
			}
		},

		_getFavoriteTemplates: function(sFavState, sTemplateId) {

			var aFavorite = [];
			var index;

			var oFavorite = this._getFavoriteCategoryFromModel();
			if (oFavorite && oFavorite.templates) {
				for (var i = 0; i < oFavorite.templates.length; i++) {
					aFavorite.push(oFavorite.templates[i].getId());
				}
			}

			if (this._isFavoriteState(sFavState)) {
				// adds the selected template id to the favorite model in user Preferences
				index = aFavorite.indexOf(sTemplateId);
				if (index === -1) {
					aFavorite.push(sTemplateId);
				}
			} else { // removes the selected template id from the favorite model in user Preferences
				index = aFavorite.indexOf(sTemplateId);
				if (index > -1) {
					aFavorite.splice(index, 1);
				}
			}

			var oFavTemplates = {
				templates: aFavorite
			};

			return oFavTemplates;

		},

		_updateFavoriteCategoryInModel: function(sFavState, oTemplate) {
			var oFavorite = this._getFavoriteCategoryFromModel();
			var index;

			if (this._isFavoriteState(sFavState)) {
				// adds the selected template to the favorite Category in model.
				index = oFavorite.templates.indexOf(oTemplate);
				if (index === -1) {
					oFavorite.templates.push(oTemplate);
				}
			} else { // removes the selected template from the favorite Category in model.
				index = oFavorite.templates.indexOf(oTemplate);
				if (index > -1) {
					oFavorite.templates.splice(index, 1);
				}
			}
		},

		_updateSelectionInCategoriesDropdownBox: function(sFavState, oControl) {

			this.oCategoriesDropdownBox.removeAllItems();
			this._getAndMakeCategoryListItems();
			oControl.setIcon(sFavState);
			var oSelectedItem = this._getSelectedListItem();

			// if the Favorite category was removed then the selected caegory will be - allCategories
			if (!oSelectedItem) {
				this.sSelectedCategoryId = this._allCategoriesId;
			} else {
				this.oCategoriesDropdownBox.setSelectedItemId(oSelectedItem.sId);
			}

			// refresh the Tiles in the wizard if -  
			// 1. The selected category is Favorite and it's not available
			// or 2. selected category is Favorite and the user select to do unFavorite for a, 
			if (!oSelectedItem || (sFavState === this._sUnFavoriteIcon && oSelectedItem.data().sId === this._sFavoriteCategoryId)) {
				this._displayAvailableTitles();
			}
		},

		_generatePrefFavorite: function(sTemplateType) {
			return this._sNode + sTemplateType;
		},

		_templateFavoriteSelectionChanged: function(oEvent) {
			var that = this;
			this.bAlreadySetPreferences = false;
			var oControl = oEvent.getSource();
			var oItem = oControl.getParent().getParent();
			var sPath = oItem.getBindingContext().getPath(); //e.g. "/templates/1"
			var oTemplate = this.oDataSet.getModel().getProperty(sPath + "/template");
			var sTemplateId = oTemplate.getId();
			var sTemplateType = oTemplate.getType();
			var oPreferences = this.getContext().service.preferences;

			var sFavState = (oControl.getIcon() === this._sFavoriteIcon) ? this._sUnFavoriteIcon : this._sFavoriteIcon;
			var oFavTemplates = this._getFavoriteTemplates(sFavState, sTemplateId);

			return oPreferences.set(oFavTemplates, this._generatePrefFavorite(sTemplateType)).then(function() {
				if (!that.bAlreadySetPreferences){
					that._updateTemplatesCategory(sFavState, oTemplate);
					that._updateFavoriteCategoryInModel(sFavState, oTemplate);
					that._updateSelectionInCategoriesDropdownBox(sFavState, oControl);
					that.bAlreadySetPreferences = true;
				}
			});
		},

		_getSelectedListItem: function() {
			var aItems = this.oCategoriesDropdownBox.getItems();

			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].data().sId === this.sSelectedCategoryId) {
					return aItems[i];
				}
			}
		},

		_dataSetSelectionChanged: function(oEvent) {
			var that = this;

			if (!this.bAlreadyLoaded) {
				return;
			}

			// at the first time the oldLeadSelectedIndex === undefined
			var oldIdx = oEvent.getParameter("oldLeadSelectedIndex");
			var idx = oEvent.getParameter("newLeadSelectedIndex");
			if ((idx > -1 && !this.bAlreadyLoadedDatasetTiles) || (idx > -1 && oldIdx !== -1)) {
				this.bAlreadyLoadedDatasetTiles = true;
				//Change the validation status to be false until the content reaches
				that.fireValidation({
					isValid: false
				});

				this.selectedTemplate = this.oDataSet.getItems()[idx].data("template");
				this._updateWizardControlTitle(this.selectedTemplate.getName());
				this._updateTemplateVersionsListItems(this.selectedTemplate);
				this._selectTemplateChanged();

			} else if (idx === -1 && oldIdx !== undefined) { // in case that user select the same template again.
				this.oDataSet.setLeadSelection(oldIdx);
				//this._notifyTemplateSelectionInvalid();
			}
		},

		_updateWizardControlTitle : function(sName){
			this.getWizardControl().setTitle( this.getContext().i18n.getText("i18n", "genWizard_wizardTitle_new")+ " " + sName);
		},

		_selectTemplateChanged: function() {

			var that = this;

			var oWizard = this.getWizardControl();
			if (this.getBasicStepIndex() !== -1) {
				this.oBasicInformationStepContent = oWizard.getStepAtIndex(this.getBasicStepIndex())._step; // getStepContent cannot be used as step already displayed.
			} else {
				this.oBasicInformationStepContent = null;
			}

			this._updateWizardControl(oWizard);
			this._cleanNeoappModel();

			// set selected template to wizard model (even if not valid selection) - so it will be available also to the validtion method
			this.getModel().oData.selectedTemplate = this.selectedTemplate;
			this.fireValueChange({
				id: "templateName",
				value: that.selectedTemplate
			});

			this.fireProcessingStarted();
			this.oDataSet.setBusy(true);

			var sTemplateDescription = this.selectedTemplate.getDescription();
			this.oTemplateDescription.setText(sTemplateDescription);
			this.oTemplateDescription.setTooltip(sTemplateDescription);

			this.oTemplateImage.setVisible(false);
			var sPreviewImg = this.selectedTemplate.getPreviewImage();
			var sPath = this.selectedTemplate.getPath();
			var sTemplate = this.selectedTemplate.getTemplateClass().getProxyMetadata().getName();
			if (sTemplate && sPath && sPreviewImg) {
				var sPreviewImgPath = sPath + "/" + sPreviewImg;
				var sImageURL = this._getPreviewImgForTemplate(sTemplate, sPreviewImgPath);
				this.oTemplateImage.setSrc(sImageURL);
				this.oTemplateImage.setVisible(true);
			}
			if (this.selectedTemplate.getType() !== "component") {
				this._callTemplateValidation(this.selectedTemplate, oWizard);
			} else {
				var aSupportedProjectTypes = this.selectedTemplate.getSupportedProjectTypes();
				if (!aSupportedProjectTypes || aSupportedProjectTypes.length === 0) {
					that._callTemplateValidation(this.selectedTemplate, oWizard);
				} else {
					this._validateSelectionBySupportedProjectTypes(this.selectedTemplate, aSupportedProjectTypes).then(
						function(bResult) {
							if (bResult) {
								that._callTemplateValidation(that.selectedTemplate, oWizard);
							} else {
								// Validation failed
								that._notifyTemplateSelectionInvalid(that.getContext().i18n.getText("i18n",
									"selectTemplateStep_selectTemplateValidationErrorMsg"));
								that.fireProcessingEnded();
								that.oDataSet.setBusy(false);
							}
						}).done();
				}
			}
		},

		_callTemplateValidation: function(oSelectedTemplate, oWizard) {
			var that = this;
			oSelectedTemplate.validateOnSelection(this.getModel().getData()).then(
				function(result) {
					if (result) {
						oSelectedTemplate.customValidation(that.getModel().getData()).then(function(bCustomValidationResult) {
							if (bCustomValidationResult) {
								oSelectedTemplate.configWizardSteps().then(function(aWizardSteps) {
									that._addWizardStepsToWizard(aWizardSteps, oWizard);
									// Notify validation succeeded
									that.fireValidation({
										isValid: true
									});
									//document.getElementById(that.nextButtonId).focus();
									that.fireProcessingEnded();
									that.oDataSet.setBusy(false);
								}).fail(
									function(oError) {
										// Getting or configuring steps failed
										console.log("Failed to obtain the wizard steps required for template %s", oSelectedTemplate.getName());
										if (oError && oError.stack) {
											console.log(oError.stack);
										}
										that._notifyTemplateSelectionInvalid(that.getContext().i18n.getText("i18n",
											"selectTemplateStep_selectTemplateConfigureStepsErrorMsg"));
										that.fireProcessingEnded();
										that.oDataSet.setBusy(false);
									});
							} else {
								// Validation failed
								that._notifyTemplateSelectionInvalid(that.getContext().i18n.getText("i18n",
									"selectTemplateStep_selectTemplateValidationErrorMsg"));
								that.fireProcessingEnded();
								that.oDataSet.setBusy(false);
							}
						}).fail(
							function(oError) {
								// Validation failed
								if (oError && oError.message) {
									that._notifyTemplateSelectionInvalid(oError.message);
								} else {
									that._notifyTemplateSelectionInvalid(that.getContext().i18n.getText("i18n",
										"selectTemplateStep_selectTemplateValidationErrorMsg"));
								}
								that.fireProcessingEnded();
								that.oDataSet.setBusy(false);
							});
					} else {
						// Validation failed
						that._notifyTemplateSelectionInvalid(that.getContext().i18n.getText("i18n",
							"selectTemplateStep_selectTemplateValidationErrorMsg"));
						that.fireProcessingEnded();
						that.oDataSet.setBusy(false);
					}
				}).fail(
				function(oError) {
					// Validation failed
					if (oError && oError.message) {
						that._notifyTemplateSelectionInvalid(oError.message);
					} else {
						that._notifyTemplateSelectionInvalid(that.getContext().i18n.getText("i18n",
							"selectTemplateStep_selectTemplateValidationErrorMsg"));
					}
					that.fireProcessingEnded();
					that.oDataSet.setBusy(false);
				});
		},

		_validateSelectionBySupportedProjectTypes: function(oTemplate, aSupportedProjectTypes) {
			var that = this;
			return this.getContext().service.filesystem.documentProvider.getDocument(this.getModel().getData().componentPath).then(function(
				oDocument) {
				return that.getContext().service.projectType.getProjectTypes(oDocument).then(function(aFolderProjectTypes) {
					for (var i = 0; i < aFolderProjectTypes.length; i++) {
						for (var k = 0; k < aSupportedProjectTypes.length; k++) {
							if (aFolderProjectTypes[i].id === aSupportedProjectTypes[k]) {
								return true;
							}
						}
					}
					return false;
				});
			});
		},

		/**
		 * Return the template image full path Url (considering its plugin location)
		 */
		_getPreviewImgForTemplate: function(templateName, sPreviewImagePath) {
			// in case that failed to retrieve the image, missing image icon will be display 
			var sUrl = null;

			var sPluginName = null;
			var iSplit = templateName.indexOf("/");
			if (iSplit > -1) {
				sPluginName = templateName.substring(0, iSplit);
			}

			var sRelativeImagePath = sPreviewImagePath.substring(sPreviewImagePath.indexOf("/")); //remove the plugin folder name from path
			sUrl = require.toUrl(sPluginName + sRelativeImagePath);

			return sUrl;
		},

		_notifyTemplateSelectionInvalid: function(sMessage) {
			this.fireValidation({
				isValid: false,
				message: sMessage
			});
		},

		_getAndMakeCategoryListItems: function() {
			var bFoundFavCategory = false;
			var aTemplatesPerCategory = this.getData();
			var allCatagories = new sap.ui.core.ListItem({
				text: this.getContext().i18n.getText("i18n", "selectTemplateStep_allCategories")
			}).data("sId", this._allCategoriesId);
			this.oCategoriesDropdownBox.addItem(allCatagories);
			var oSelectedItem = allCatagories;

			aTemplatesPerCategory.sort(this._sortCategories);
			for (var index = 0, len = aTemplatesPerCategory.length; index < len; index++) {

				// adds list items which has category with templates
				if (aTemplatesPerCategory[index].templates.length > 0) {
					var sCategoryId = aTemplatesPerCategory[index].category.getId();
					var listItem = new sap.ui.core.ListItem({
						text: aTemplatesPerCategory[index].category.getName()
					}).data("sId", sCategoryId);
					this.oCategoriesDropdownBox.addItem(listItem);
					if (sCategoryId === this._sFavoriteCategoryId) {
						oSelectedItem = listItem;
						bFoundFavCategory = true;
					}

					if (!bFoundFavCategory && sCategoryId === "Common") {
						oSelectedItem = listItem;
					}
				}
			}

			return oSelectedItem;
		},

		_sortCategories: function(categoryA, categoryB) {
			if (categoryA.category.getName() < categoryB.category.getName()) {
				return -1;
			}
			if (categoryA.category.getName() > categoryB.category.getName()) {
				return 1;
			}
			return 0;
		},

		_updateTemplateVersionsListItems: function(oTemplate) {
			var that = this;
			this.oTemplateVersionDropdownBox.destroyItems();

			this.getContext().service.template.getTemplateVersions(oTemplate.getId()).then(function(aTemplateVersions) {
				if (aTemplateVersions.length > 1) {
					var templateVersionStr;
					for (var i = 0; i < aTemplateVersions.length; i++) {

						that.oHorizontalVersionsLayout.setVisible(true);
						that.oTemplateVersionDropdownBox.setVisible(true);
						that.availableVersionsLabel.setVisible(true);

						templateVersionStr = aTemplateVersions[i].getVersion();
						if (i === 0) {
							templateVersionStr = that.getContext().i18n.getText("i18n", "selectTemplateStep_recommendedTemplateVersion");
						}
						var listItem = new sap.ui.core.ListItem({
							text: that._setTextOfListItem(aTemplateVersions[i].getVersionLabel(), templateVersionStr),
							key: aTemplateVersions[i].getVersion()
						});

						that.oTemplateVersionDropdownBox.addItem(listItem);
					}
				} else {
					that.oHorizontalVersionsLayout.setVisible(false);
				}
			}).done();
		},

		_setTextOfListItem: function(sVersionLabel, sVersion) {

			var sText = (sVersionLabel) ? sVersionLabel + " (" + sVersion + ")" : sVersion;
			return sText;
		},
		renderer: {}

	});