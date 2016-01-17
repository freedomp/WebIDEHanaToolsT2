jQuery.sap.declare("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.SelectProjectStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateItemLayout");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent
		.extend("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.SelectProjectStepContent",
				{
					metadata : {
						properties : {
							"wizardControl" : "object",
							"numberOfWizardSteps" : "int"
						}
					},

					_aProjectTemplatesListItems : null,
					_aReferenceProjectTemplatesListItems : null,
					BASIC_STEP_INDEX : 1,

					init : function() {
						var that = this;
						this.bAlreadyLoaded = false;
						this.bAlreadyLoadedDatasetTiles = false;

						//Initialize the example data and the model
						var data = {
							templates : []
						};

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(data);

						//Initialize the Dataset and the layouts
						function createTemplate() {
							var c = sap.ui.commons;
							return new sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateItemLayout({
								button : new c.Button({
									icon : "{image}",
									enabled : false,
									lite : true
								}).addStyleClass('wizardButtonuttonWithIconFont'),

								tileText : new c.TextView({
									text : "{title}",
									wrapping : true,
									enabled : false
								}).addStyleClass('tileTextDiv')
							});
						}

						this.oDataSet = new sap.ui.ux3.DataSet({
							width : "100%",
							layoutData : new sap.ui.layout.GridData({
								span : "L12 M12 S12",
								linebreak : true
							}),
							showSearchField : false,
							showToolbar : false,
							items : {
								path : "/templates",
								template : new sap.ui.ux3.DataSetItem({
									iconSrc : "{image}",
									title : "{title}"
								}).data("template", "{template}")
							},
							views : [ new sap.ui.ux3.DataSetSimpleView({
								name : "Floating, responsive View",
								floating : true,
								template : createTemplate()
							}) ],
							selectionChanged : [ that._dataSetSelectionChanged, that ]
						});
						this.oDataSet.setModel(oModel);

						jQuery.sap.require("sap.ui.ux3.DataSetItem");
						sap.ui.ux3.DataSetItem.prototype.ondblclick = function(oEvent) {
							sap.ui.ux3.DataSetItem.prototype.onclick.apply(this, arguments);
						};

						this.oSearchGrid = new sap.ui.layout.Grid({
							layoutData : new sap.ui.layout.GridData({
								span : "L12 M12 S12",
								linebreak : true
							}),
							vSpacing : 0
						});

						// create RadioButtons to switch template types
						this.oTemplateTypeSwitchLayout = new sap.ui.layout.HorizontalLayout("lll", {
							layoutData : new sap.ui.layout.GridData({
								span : "L12 M12 S12"
							})
						}).addStyleClass("horizontalLayoutRB");

						this.oTemplateModeRB = new sap.ui.commons.RadioButton({
							text : "{i18n>selectProjectStepContent_TemplateMode}",
							groupName : "SelectProjectStepContent_RadioButtonGroup",
							selected : true,
							select : [ this.setProjectTemplatesData, this ]
						});

						this.oReferenceAppModeRB = new sap.ui.commons.RadioButton({
							text : "{i18n>selectProjectStepContent_ReferenceAppMode}",
							groupName : "SelectProjectStepContent_RadioButtonGroup",
							select : [ this.setReferenceProjectsData, this ]
						});

						this.oTemplateTypeSwitchLayout.addContent(this.oTemplateModeRB);
						this.oTemplateTypeSwitchLayout.addContent(this.oReferenceAppModeRB);

						this.oHorizontalLayout = new sap.ui.layout.HorizontalLayout({
							layoutData : new sap.ui.layout.GridData({
								span : "L12 M12 S12"
							})
						});

						this.oSearch = new sap.ui.commons.SearchField({
							enableListSuggest : false,
							enableClear : true,
							startSuggestion : 0,
							width : "250px",
							layoutData : new sap.ui.layout.GridData({
								span : "L1 M5 S5",
								linebreak : true
							}),
							search : function(oEvent) {
								that._updateDataSet(oEvent.getParameter("query"));
							},

							suggest : function(oEvent) {
								if (oEvent.getParameter("value") === "") {
									that._updateDataSet(oEvent.getParameter("value"));
									that.oSearch.setValue("");
								}
							}
						}).addStyleClass("previousButton");

						this.oSearch.addDelegate({
							onAfterRendering : function() {
								if (that._searchValue !== undefined) {
									var oInput = jQuery("#" + that.oSearch.getId() + " :input");
									oInput.focus();
									oInput[0].setSelectionRange(that._searchValue.length, that._searchValue.length);
								}
							}
						});

						this.oCategoriesDropdownBox = new sap.ui.commons.DropdownBox({
							width : "250px",
							layoutData : new sap.ui.layout.GridData({
								span : "L1 M5 S5"
							}),
							change : function(e) {
								var aTemplatesInCategory = e.getParameter("selectedItem").data("templates");

								aTemplatesInCategory.sort(function(template1, template2) {
								    var iTempOrder1 = template1.getIndexOrder();
					                var iTempOrder2 = template2.getIndexOrder();
					                if (!iTempOrder1 || !iTempOrder2 ||(iTempOrder1 === iTempOrder2)){ //either undefine or equals
				       	                return template1.getName().localeCompare(template2.getName());
				                    } else {
					                    return  Math.max(iTempOrder1,iTempOrder2);
				                    }
								});

								data.templates = [];
								for ( var i = 0; i < aTemplatesInCategory.length; i++) {
									var oTemplate = {
										id : i.toString(),
										title : aTemplatesInCategory[i].getName(),
										image : aTemplatesInCategory[i].getIcon(),
										template : aTemplatesInCategory[i]
									};
									data.templates.push(oTemplate);
								}

								oModel.setData(data);
								// if move to different category with filtering
								if (that.oDataSet.getItems().length > 0) {
									if (that.oDataSet.getLeadSelection() !== 0) {
										that.oDataSet.setLeadSelection(0);
									} else {
										that.oDataSet.fireEvent("selectionChanged", {
											newLeadSelectedIndex : 0
										});
									}
								} else {
									that.oDataSet.fireEvent("selectionChanged", {
										newLeadSelectedIndex : -1
									});

									that.oTemplateDescription.setText("");
								}
							}
						});

						this.oTemplateDescription = new sap.ui.commons.Label({
							width : "100%",
							layoutData : new sap.ui.layout.GridData({
								span : "L12 M12 S12",
								linebreak : true
							})
						});

					},

					// Search on data set according to given prefix
					_updateDataSet : function(sPrefix) {

						this.fireValidation({
							isValid : false
						});

						this._searchValue = sPrefix;

						var oBinding = this.oDataSet.getBinding("items");

						var oFilterItems = oBinding.filter(!sPrefix ? [] : [ new sap.ui.model.Filter("title",
								sap.ui.model.FilterOperator.Contains, sPrefix) ]);

						if (oFilterItems.aIndices.length > 0) {
							if (this.oDataSet.getLeadSelection() !== 0) {
								this.oDataSet.setLeadSelection(0);
							} else {
								this.oDataSet.fireEvent("selectionChanged", {
									newLeadSelectedIndex : 0
								});
							}

						} else {
							this.oDataSet.fireEvent("selectionChanged", {
								newLeadSelectedIndex : -1
							});

							this.oTemplateDescription.setText("");
						}

					},

					setFocusOnFirstItem : function() {
						this.oSearch.focus();
					},

					setTabIndexes : function(i, nextButtonId, backButtonId) {
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

					/** Get initial data and save it **/

					// Called once to create step data when first loaded
					getStepData : function() {
						var that = this;
						this.fireProcessingStarted();

						this.getContext().service.template.getTemplatesPerCategories("project").then(
								function(aProjTemplatesPerCategory) {
									that._aProjectTemplatesListItems = that._makeCategoryListItems(aProjTemplatesPerCategory);
									return that.getContext().service.template.getTemplatesPerCategories("referenceProject").then(
											function(aRefTemplatesPerCategory) {
												that._aReferenceProjectTemplatesListItems = that
														._makeCategoryListItems(aRefTemplatesPerCategory);

												// Display Step UI - TODO: extract to caller
												var content = new sap.ui.layout.Grid();
												that.oHorizontalLayout.addContent(that.oSearch);
												that.oHorizontalLayout.addContent(that.oCategoriesDropdownBox);
												that.oSearchGrid.addContent(that.oTemplateTypeSwitchLayout);
												that.oSearchGrid.addContent(that.oHorizontalLayout);
												content.addContent(that.oSearchGrid);
												content.addContent(that.oDataSet);
												content.addContent(that.oTemplateDescription);
												that.addContent(content);

												// Trigger get data for project templates (change radio button to selected)
												that.oTemplateModeRB.fireEvent("select", {});
											});
									//TODO: what to do if only second call is failed? UI not displayed...
								}).fin(function() {
							that.fireProcessingEnded();
						}).done();
					},

					// Called once per template type when step first loaded
					_makeCategoryListItems : function(aTemplatesPerCategory) {
						var aListItems = [];
						var allCatagories = new sap.ui.core.ListItem({
							text : this.getContext().i18n.getText("i18n", "selectTemplateStep_allCategories")
						}).data("templates", this._getAllCategoriesTemplates(aTemplatesPerCategory));
						allCatagories.data("categoryId", "sap.watt.ideplatform.generationwizard.allCategories");
						aListItems.push(allCatagories);
						aTemplatesPerCategory.sort(this._sortCategories);
						for ( var index = 0, len = aTemplatesPerCategory.length; index < len; index++) {
							var listItem = new sap.ui.core.ListItem({
								text : aTemplatesPerCategory[index].category.getName()
							}).data("templates", aTemplatesPerCategory[index].templates);
							listItem.data("categoryId", aTemplatesPerCategory[index].category.getId());
							aListItems.push(listItem);
						}
						return aListItems;
					},

					_getAllCategoriesTemplates : function(aTemplatesPerCategory) {
						var aAggregateTemplates = new Array();
						for ( var i = 0; i < aTemplatesPerCategory.length; i++) {
							jQuery.merge(aAggregateTemplates, aTemplatesPerCategory[i].templates);
						}
						return aAggregateTemplates;
					},

					/** Switch data according to selected mode: **/

					setProjectTemplatesData : function(oEvent) {
						this.setData(this._aProjectTemplatesListItems, "Empty.SAPUI5.Project");
					},

					setReferenceProjectsData : function(oEvent) {
						this.setData(this._aReferenceProjectTemplatesListItems, "");
					},

					setData : function(aListItemsData, sDefaultCategoryName) {
						this.fireValidation({
							isValid : false
						});

						this._setCategoryDropdownBox(aListItemsData);
						var iSelectedIndex = 0;

//						uncomment the following code in order to select specific category.
//						var sCategoryName = this._getCategoryNameFromCategoriesById(aListItemsData, sDefaultCategoryName);
//
//						if (sCategoryName !== "") {
//							var aItems = this.oCategoriesDropdownBox.getItems();
//
//							for ( var i = 0; i < aItems.length; i++) {
//								if (aItems[i].getText() === sCategoryName) {
//									iSelectedIndex = i;
//									break;
//								}
//							}
//						}

						this._selectCategory(iSelectedIndex); // selection will set tiles data and change selection (fires validation as needed)
					},

					_getCategoryNameFromCategoriesById : function(aListItemsData, iCategoryId) {
						var sCategoryName = "";

						for ( var i = 0; i < aListItemsData.length; i++) {
							if (aListItemsData[i].data("categoryId") === iCategoryId) {
								sCategoryName = aListItemsData[i].getText();
								break;
							}
						}

						return sCategoryName;
					},

					_setCategoryDropdownBox : function(aListItems) {
						this.oCategoriesDropdownBox.removeAllItems();
						for ( var i = 0; i < aListItems.length; i++) {
							this.oCategoriesDropdownBox.addItem(aListItems[i]);
						}
					},

					_selectCategory : function(iSelectedIndex) {
						var oFirstItem = this.oCategoriesDropdownBox.getItems()[iSelectedIndex];
						this.oCategoriesDropdownBox.setSelectedItemId(oFirstItem.sId);
						this.oCategoriesDropdownBox.fireEvent("change", {
							selectedItem : oFirstItem
						});
					},

					/** validate step content **/

					validateStepContent : function() {
						var that = this;
						var oDeferred = Q.defer();
						var leadSelectedIndex = this.oDataSet.getLeadSelection();
						if (leadSelectedIndex > -1) {
							//this.selectedTemplate = this.oDataSet.getItems()[leadSelectedIndex].data("template");
							this.selectedTemplate.validateOnSelection(this.getModel().getData()).then(
									function(result) {
										if (result) {
											oDeferred.resolve(true);
											that.fireValidation({
												isValid : true
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

					_notifyStepInvalid : function(sMessage, oDeferred) {
						oDeferred.reject(sMessage);
						this.fireValidation({
							isValid : false,
							message : sMessage
						});
					},

					_addWizardStepsToWizard : function(aWizardSteps, oWizard) {
						// Get and configure all template wizard steps
						this.getModel().oData.selectedTemplate = this.selectedTemplate;
						if (this.getModel().oData.neoapp) {
							this.getModel().oData.neoapp.destinations = undefined;
						} else {
							this.getModel().oData.destinations = undefined;
						}
						if (aWizardSteps !== undefined) {
							for ( var i = 0; i < aWizardSteps.length; i++) {
								var oWizardStepContent = aWizardSteps[i].getStepContent();
								if (oWizardStepContent.onChangeTemplate !== undefined) {
									this.attachValueChange(oWizardStepContent.onChangeTemplate, oWizardStepContent);
								}

								if (oWizardStepContent.onChangeBasicInformation !== undefined) {
									this.oBasicInformationStepContent.attachValueChange(oWizardStepContent.onChangeBasicInformation,
											oWizardStepContent);
								}

								oWizard.addStep(aWizardSteps[i]);
							}
						}

						var sTemplateDescription = this.selectedTemplate.getDescription();
						if (sTemplateDescription) {
							this.oTemplateDescription.setText(sTemplateDescription);
						}
					},

					// 	onBasicInformationChange : function(oEvent) {
					// 		var oWizard = this.getWizardControl();

					// 		if (this.bAlreadyLoaded) {
					// 			var that = this;
					// 			this.validateStepContent().then(
					// 					function() {
					// 						// Add steps of selected template only if they were not already added (in previous validation)
					// 						if (that.getWizardControl().getStepsNumber() === that.getNumberOfWizardSteps()) {
					// 							that.selectedTemplate.configWizardSteps().then(function(aWizardSteps) {
					// 								that._addWizardStepsToWizard(aWizardSteps, oWizard);
					// 								that.fireValueChange({
					// 									id : "templateName",
					// 									value : that.selectedTemplate
					// 								});
					// 							}).fail(
					// 									function(oError) {
					// 										// Getting or configuring steps failed
					// 										this.fireValidation({
					// 											isValid : false,
					// 											message : that.getContext().i18n.getText("i18n",
					// 													"selectTemplateStep_selectTemplateConfigureStepsErrorMsg")
					// 										});
					// 									});
					// 						}
					// 					}).fail(/*No failure handling is needed here*/);
					// 		}
					// 	},

					/** data set selection change **/

					_dataSetSelectionChanged : function(oEvent) {
						var that = this;

						// at the first time the oldIdx = -1, idx = 0
						var oldIdx = oEvent.getParameter("oldLeadSelectedIndex");
						var idx = oEvent.getParameter("newLeadSelectedIndex");

						if (!this.bAlreadyLoadedDatasetTiles || (idx > -1 && oldIdx !== -1)) {
							this.bAlreadyLoadedDatasetTiles = true;
							//Change the validation status to be false until the content reaches
							that.fireValidation({
								isValid : false
							});

							var oWizard = this.getWizardControl();
							this.oBasicInformationStepContent = oWizard.getStepAtIndex(this.BASIC_STEP_INDEX)._step; // getStepContent cannot be used as step already displayed.

							this._updateWizardControl(oWizard);

							this.selectedTemplate = this.oDataSet.getItems()[idx].data("template");
							this.fireProcessingStarted();
							this.selectedTemplate.validateOnSelection(this.getModel().getData()).then(
									function(result) {
										if (result) {
											that.selectedTemplate.configWizardSteps().then(function(aWizardSteps) {

												that._addWizardStepsToWizard(aWizardSteps, oWizard);
												// Notify validation succeeded
												that.fireValidation({
													isValid : true
												});
												that.fireValueChange({
													id : "templateName",
													value : that.selectedTemplate
												});
												//document.getElementById(that.nextButtonId).focus();
												that.fireProcessingEnded();
											}).fail(
													function(oError) {
														// Getting or configuring steps failed
														that._notifyTemplateSelectionInvalid(that.getContext().i18n.getText("i18n",
																"selectTemplateStep_selectTemplateConfigureStepsErrorMsg"));
														that.fireProcessingEnded();
													});
										} else {
											// Validation failed
											that._notifyTemplateSelectionInvalid(that.getContext().i18n.getText("i18n",
													"selectTemplateStep_selectTemplateValidationErrorMsg"));
											that.fireProcessingEnded();
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

										var sTemplateDescription = that.selectedTemplate.getDescription();
										if (sTemplateDescription) {
											that.oTemplateDescription.setText(sTemplateDescription);
										}
									});
						} else if (idx === -1 && oldIdx !== undefined) {// in case that user select the same template again.
							this.oDataSet.setLeadSelection(oldIdx);
						}
					},

					_updateWizardControl : function(oWizard) {

						var iNumberOfWizardSteps = this.getNumberOfWizardSteps();
						this.oBasicInformationStepContent = oWizard.getStepAtIndex(this.BASIC_STEP_INDEX)._step; // getStepContent cannot be used as step already displayed.

						// remove all steps after the selected template step need to remove before we do getContent
						while (oWizard.getStepsNumber() > iNumberOfWizardSteps) {
							var oWizardStep = oWizard.getStepAtIndex(iNumberOfWizardSteps);
							var oWizardStepContent = oWizardStep._step; // getStepContent cannot be used as step already displayed.
							this.detachValueChange(oWizardStepContent.onChangeTemplate, oWizardStepContent);
							this.oBasicInformationStepContent.detachValueChange(oWizardStepContent.onChangeBasicInformation,
									oWizardStepContent);

							oWizard.removeStep(oWizardStep);
							oWizardStep.destroy();
						}

						// set the next step index of the last step to be undefined.
						oWizard.getStepAtIndex(iNumberOfWizardSteps - 1).setNextStepIndex(undefined);
						oWizard.removeFinishStep();
					},

					_notifyTemplateSelectionInvalid : function(sMessage) {
						this.fireValidation({
							isValid : false,
							message : sMessage
						});
						this.fireValueChange({
							id : "templateName",
							value : ""
						});

						this.oTemplateDescription.setText("");
					},

					// 	_makeCategoryListItems : function(aTemplatesPerCategory) {
					// 		var allCatagories = new sap.ui.core.ListItem({
					// 			text : this.getContext().i18n.getText("i18n", "selectTemplateStep_allCategories")
					// 		}).data("sId", "sap.watt.ideplatform.generationwizard.allCategories");
					// 		this.oCategoriesDropdownBox.addItem(allCatagories);
					// 		aTemplatesPerCategory.sort(this._sortCategories);
					// 		for ( var index = 0, len = aTemplatesPerCategory.length; index < len; index++) {
					// 			var listItem = new sap.ui.core.ListItem({
					// 				text : aTemplatesPerCategory[index].category.getName()
					// 			}).data("sId", aTemplatesPerCategory[index].category.getId());
					// 			this.oCategoriesDropdownBox.addItem(listItem);
					// 		}
					// 	},

					_sortCategories : function(categoryA, categoryB) {
						if (categoryA.category.getName() < categoryB.category.getName()) {
							return -1;
						}
						if (categoryA.category.getName() > categoryB.category.getName()) {
							return 1;
						}
						return 0;
					},

					/** Step Lifecycle **/

					cleanStep : function() {
					},

					onAfterRendering : function() {

						if (!this.bAlreadyLoaded) {
							this.bAlreadyLoaded = true;
							this.getStepData();
						}
					},

					renderer : {}

				});
