jQuery.sap.declare("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateCustomizationStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent
	.extend(
		"sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateCustomizationStep", {

			_fnJQueryIsArray: null,
			_fnArrayIsArray: null,

			_fnJQueryIsArrayCustom: null,
			_fnArrayIsArrayCustom: null,

			_bAlreadyLoaded: null,
			_bOnLoading: null,
			_bGridDisplayedAfterServiceChanged: null,
			_dynamicModel: null, //JSON model based on smartdoc
			_smartDoc: null,
			_oCurrentTemplate: null,
			_aGroups: null,
			_ : null,

			metadata: {
				properties: {
					"dataProviderManager": "object"
				}
			},

			//deprecated
			initializeSmartModel: function(oContextDocumentBuilder) {
				// 		this._contextDocumentBuilder = oContextDocumentBuilder;
			},

			init: function() {
				var that = this;
				
				require(["sap/watt/lib/lodash/lodash"],function(lodash){
				    that._ = lodash;
				});

				this._bAlreadyLoaded = false;
				this._bOnLoading = false;
				this._bGridDisplayedAfterServiceChanged = false;

				var oTemplateImage = new sap.ui.commons.Image("TemplateImage", {
					decorative: false,
					width: "90%",
					layoutData: new sap.ui.layout.GridData({
						span: "L4 M12 S12"                
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
						imagePopUp.open();
						jQuery("#" + imagePopUp.getId() + "-content").css("overflow", "hidden");
					}
				}).addStyleClass("alignControlToTheCenter templateImageStyle");

				var oDataBindingGrid = new sap.ui.layout.Grid("DataBindingGrid", {
					layoutData: new sap.ui.layout.GridData({
						span: "L8 M12 S12"
					})
				}).addStyleClass("dataBindingGrid");

				var content = new sap.ui.layout.Grid("TemplateCustomizationStepGrid", {
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12",
						linebreak: true
					}),
					content: [oDataBindingGrid, oTemplateImage]
				});

				this.addContent(content);

				// set the custom defintion of array is array
				this._fnJQueryIsArrayCustom = function(v) {
					return ((v instanceof Array) || ((v !== null) && (typeof(v) === "object") && v['#proxy']));
				};
				this._fnArrayIsArrayCustom = function(v) {
					return ((v instanceof Array) || ((v !== null) && (typeof(v) === "object") && v['#proxy']));
				};

				this._fnJQueryIsArray = jQuery.isArray;
				this._fnArrayIsArray = Array.isArray;

				oDataBindingGrid.addDelegate({
					onAfterRendering: function() {
						that._setHeightOfDataBingingGrid();
					}
				});

			},

			_setHeightOfDataBingingGrid: function() {
				var iHeight = jQuery("#" + this.getId()).height() - 20;
				jQuery("#DataBindingGrid").height(iHeight);
			},

			_changeIsArray: function(bRestore) {
				if (bRestore) {
					jQuery.isArray = this._fnJQueryIsArray;
					Array.isArray = this._fnArrayIsArray;
				} else {
					jQuery.isArray = this._fnJQueryIsArrayCustom;
					Array.isArray = this._fnArrayIsArrayCustom;
				}
			},
			
			_getIndexOfTemplateCustomizationForm : function(sModelRoot, oSmartDocModel) {
				var oRoot = oSmartDocModel[sModelRoot];
				if (oRoot && oRoot.forms) {
					for (var i = 0; i < oRoot.forms.length; i++) {
						if (!oRoot.forms[i].type) {
							return i;
						}
						else if (oRoot.forms[i].type === "templateCustomizationStep"){
							return i;
						}
					}
				}
				return -1;
			},

			/**
			 * create the grid for the desired group and add it to the UI.
			 */
			_createDynamicModelGrid: function(groupIndex, sGroupTitle, bAddSeparator) {
				var that = this;
				var oDataBindingGrid = sap.ui.getCore().byId("DataBindingGrid");
				
				var sModelRoot = this._oCurrentTemplate.getModelRoot();
				var iFormIndex = this._getIndexOfTemplateCustomizationForm(sModelRoot, this._smartDoc);
				if (iFormIndex < 0) {
					return;
				}
				var bindingExpression = sModelRoot + "/forms/" + iFormIndex + "/groups/" + groupIndex;

				var sGroupContentGridID = "GroupContentGrid" + groupIndex;
				var oGroupContentGrid = sap.ui.getCore().byId(sGroupContentGridID);

				if (oGroupContentGrid !== undefined) {
					return;
				}

				oGroupContentGrid = new sap.ui.layout.Grid(sGroupContentGridID, {
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12",
						linebreak: true
					})
				});

				if (bAddSeparator) {
					oGroupContentGrid.addStyleClass("parameterGroupWithSeparator");
				}

				var oTitleLabel = new sap.ui.commons.TextView({
					text: sGroupTitle,
					textAlign: "Left",
					width: "100%",
					wrapping: false,
					layoutData: new sap.ui.layout.GridData({
						span: "L3 M12 S12",
						linebreak: true
					})
				}).addStyleClass("fontSpecial wizardH3 parameterGroupTitleMargin");

				oGroupContentGrid.addContent(oTitleLabel);

				oGroupContentGrid.setModel(that._dynamicModel);

				var sSmartDocPath = bindingExpression.replace(new RegExp('/', 'g'), '.');
				var aParameters = this._smartDoc.resolve(sSmartDocPath + ".parameters");

				for (var i = 0; i < aParameters.length; i++) {
					var oParameter = aParameters[i];
					var sControl = oParameter.wizard.control;
					var sModelPath = "/" + bindingExpression + "/parameters/" + i;
					var oControl = null;

					switch (sControl) {
						case "CheckBox":
							oControl = new sap.ui.commons.CheckBox({
								width: "100%",
								checked: "{" + sModelPath + "/value}",
								layoutData: new sap.ui.layout.GridData({
									span: "L9 M12 S12",
									indent: "L3 M0 S0",
									linebreak: true
								})
							}).addStyleClass("wizardCheckBox");

							// No indentation for first UI control after title
							if (i === 0) {
								oControl.setLayoutData(new sap.ui.layout.GridData({
									span: "L9 M12 S12",
									linebreakM: true,
									linebreakS: true
								}));
							}
							break;
						case "TextField":
							oControl = new sap.ui.commons.TextField({
								width: "100%",
								value: "{" + sModelPath + "/value}",
								liveChange: function(oEvent) {
									that.validateStepContent(oEvent).fail( /*No failure handling is needed here*/ );
								},
								layoutData: new sap.ui.layout.GridData({
									span: "L6 M8 S12"
								})
							});
							that.addDelegateToTextField(oControl);

							var sTooltipTFKey = oParameter.wizard.tooltip;
							var sTFTooltip = that.getModel("i18n").getProperty(sTooltipTFKey);
							if (sTFTooltip !== undefined && sTFTooltip !== "") {
								oControl.setPlaceholder(sTFTooltip);
							}
							break;
						case "ComboBox":
							var oItemTemplate = new sap.ui.core.ListItem({
								text: "{name}",
								tooltip: "{fullyQualifiedName}"
							});

							var oFilter = new sap.ui.model.Filter("name", "TEST", {});
							var oSorter = undefined;
							if (oParameter.wizard.sort !== false) {
								oSorter = new sap.ui.model.Sorter("name");
							}
							var oProp = null;

							oControl = new sap.ui.commons.ComboBox({
								items: {
									path: sModelPath + "/binding",
									template: oItemTemplate,
									filters: [oFilter],
									sorter: oSorter
								},
								maxPopupItems: 5,
								change: function(oEvent) {
									var oListItem = oEvent.getParameter("selectedItem");
									if (oListItem) {
										// New item selected
										var oEntity = oListItem.getBindingContext().getObject();
										if (oEntity) {
											oProp = oEntity.resolve(this.data()["bindingDoc"]);
											if (oProp.hasOwnProperty("value")) {
												oProp.value = "@#" + oEntity.id;
											} else {
												oProp.append("value", "@#" + oEntity.id);
											}
											this.getModel().refresh();
											that._clearComboBoxes(this);
										}
									} else {
										// Selection cleared (change to no selection)
										oProp = that._smartDoc.resolve(this.data()["bindingDoc"]);
										oProp.value = "";
										if (!oEvent.getParameter("codeTriggered")) {
											// Selection cleared by the user
											this.addCustomData(new sap.ui.core.CustomData({
												key: "wasClearedByUser",
												value: true
											}));
											this.getModel().refresh();
											that._clearComboBoxes(this);
										} else {
											// Selection cleared by _clearComboBoxes : wait for last clearance before updating the model (avoid redundant validations) 
											that._iFireChangeCounter--;
											if (that._iFireChangeCounter === 0) {
												this.getModel().refresh();
											}
										}
									}
									that.validateStepContent(oEvent).fail( /*No failure handling is needed here*/ );

								},
								width: "100%",
								layoutData: new sap.ui.layout.GridData({
									span: "L6 M8 S12"
								})
							}).data("bindingDoc", sModelPath.replace(new RegExp('/', 'g'), '.').substring(1, sModelPath.length));

							oControl.bindValue(sModelPath + "/value/name", null, sap.ui.model.BindingMode.OneWay);
							oControl.addStyleClass("wizardComboBox");

							var sTooltipComboKey = oParameter.wizard.tooltip;
							var sComboTooltip = that.getModel("i18n").getProperty(sTooltipComboKey);
							if (sComboTooltip !== undefined && sComboTooltip !== "") {
								oControl.setPlaceholder(sComboTooltip);
							}
							var oFilterFunc = that._getFilter(oParameter, oControl, that);
							oFilter.fnTest = oFilterFunc;

							break;
					}
					
					if (!oControl) {
						if (oGroupContentGrid) {
							oGroupContentGrid.destroy();
						}
						throw new Error(that.getContext().i18n.getText("i18n", "modelBuilderStep_FailedToCreateControlErrorMsg", sModelPath));
					}

					oControl.modelParameterConfigurations = aParameters[i];

					var sLabelKey = aParameters[i].wizard.title;
					var sLabelText = that.getModel("i18n").getProperty(sLabelKey);

					var sTooltipKey = aParameters[i].wizard.tooltip;
					var sLabelTooltip = that.getModel("i18n").getProperty(sTooltipKey);

					if (sControl !== "CheckBox") {
						var oLabel = new sap.ui.commons.Label({
							width: "100%",
							layoutData: new sap.ui.layout.GridData({
								span: "L3 M4 S12",
								indent: "L3 M0 S0",
								linebreak: true
							})
						}).addStyleClass("wizardBody");
						// No indentation for first UI control after title
						if (i === 0) {
							oLabel.setLayoutData(new sap.ui.layout.GridData({
								span: "L3 M4 S12",
								linebreakM: true,
								linebreakS: true
							}));
						}

						if ((aParameters[i].wizard.required !== undefined) && aParameters[i].wizard.required) {
							oLabel.setText(sLabelText + "*");
						} else {
							oLabel.setText(sLabelText);
						}
						oLabel.setTooltip(sLabelText);

						oGroupContentGrid.addContent(oLabel);
					} else {
						// if sControl ===  "CheckBox" no label is required
						oControl.setText(sLabelText);
					}
					// Set control's tooltip
					if (sLabelTooltip !== undefined && sLabelTooltip !== "") {
						oControl.setTooltip(sLabelTooltip);
					} else {
						oControl.setTooltip(sLabelText);
					}

					oGroupContentGrid.addContent(oControl);
				}

				oGroupContentGrid.getModel().refresh();

				if (groupIndex === 0) {
					oGroupContentGrid.addDelegate({
						onAfterRendering: function() {
							if (!that._bGridDisplayedAfterServiceChanged && that._isOnScreen()) {
								that.setFocusOnFirstItem();
							} else {
								that._bGridDisplayedAfterServiceChanged = false;
							}
						}
					});
				}

				oDataBindingGrid.addContent(oGroupContentGrid);
			},

			/**
			 * Returns a filter function for the combobox
			 */
			_getFilter: function(oParameter, oControl, scope) {
				var that = scope;
				var sType = oParameter.type;
				var fResult = null;
				switch (sType) {
					case "Entity":
						if (oParameter.isRoot) {
							fResult = function(aValue) {
								oControl.setSelectedItemId(undefined);
								oControl.setValue("");
								if (aValue) {
									return that.getDataProviderManager().isRootEntity(aValue, oParameter.binding);
								}
								return false;
							};
						} else {
							if (oParameter.multiplicity === "many") {
								fResult = function(aValue) {
									oControl.setSelectedItemId(undefined);
									oControl.setValue("");
									if (aValue) {
										return that.getDataProviderManager().isNavigationsToMany(aValue, oParameter.binding);
									}
									return false;
								};
							} else if (oParameter.multiplicity === "one") {
								fResult = function(aValue) {
									oControl.setSelectedItemId(undefined);
									oControl.setValue("");
									if (aValue) {
										return that.getDataProviderManager().isNavigationsToOne(aValue, oParameter.binding);
									}
									return false;
								};
							}
						}
						break;

					case "Property.String":
						fResult = function(aValue) {
							oControl.setSelectedItemId(undefined);
							oControl.setValue("");
							if (aValue) {
								return that.getDataProviderManager().isStringProperty(aValue, oParameter.binding);
							}
							return false;
						};
						break;

					case "Property.Date":
						fResult = function(aValue) {
							oControl.setSelectedItemId(undefined);
							oControl.setValue("");
							if (aValue) {
								return that.getDataProviderManager().isDateProperty(aValue, oParameter.binding);
							}
							return false;
						};
						break;

					case "Property.Number":
						fResult = function(aValue) {
							oControl.setSelectedItemId(undefined);
							oControl.setValue("");
							if (aValue) {
								return that.getDataProviderManager().isNumericProperty(aValue, oParameter.binding);
							}
							return false;
						};
						break;

					case "Property.Boolean":
						fResult = function(aValue) {
							oControl.setSelectedItemId(undefined);
							oControl.setValue("");
							if (aValue) {
								return that.getDataProviderManager().isBooleanProperty(aValue, oParameter.binding);
							}
							return false;
						};
						break;

					case "Property.Binary":
						fResult = function(aValue) {
							oControl.setSelectedItemId(undefined);
							oControl.setValue("");
							if (aValue) {
								return that.getDataProviderManager().isBinaryProperty(aValue, oParameter.binding);
							}
							return false;
						};
						break;

					case "Property.Guid":
						fResult = function(aValue) {
							oControl.setSelectedItemId(undefined);
							oControl.setValue("");
							if (aValue) {
								return that.getDataProviderManager().isGuidProperty(aValue, oParameter.binding);
							}
							return false;
						};
						break;

					case "Property.Key":
						fResult = function(aValue) {
							oControl.setSelectedItemId(undefined);
							oControl.setValue("");
							if (aValue) {
								return that.getDataProviderManager().isKeyProperty(aValue, oParameter.binding);
							}
							return false;
						};
						break;

					default:
						fResult = function(aValue) {
							oControl.setSelectedItemId(undefined);
							oControl.setValue("");
							return true;
						};
						break;
				}
				return fResult;
			},

			/**
			 * Load the smart doc model for selected template into this._smartDoc
			 */
			_loadModelForTemplate: function() {
				var that = this;
				return this.getContext().service.smartDocProvider.getSmartDocByTemplate(this._oCurrentTemplate).then(function(oSmartDoc) {
					that._smartDoc = oSmartDoc;
				});
			},

			addDelegateToTextField: function(oControl) {
				var oTextField = oControl;
				oControl.addDelegate({
					onBeforeRendering: function() {
						oTextField.setValue(oTextField.getLiveValue());
					}
				});

			},

			/**
			 * Update the DataProviderManager with service metadata from the wizard model
			 */
			_updateDataProviderManager: function() {
				var that = this;
				var oConnectionData = this.getModel().oData.connectionData;
				var oDataProviderManager = this.getDataProviderManager();

				// In case there is not Data Provider, just resolve.
				if (oConnectionData === undefined) {
					return false;
				}

				var provider = oConnectionData.metadata;
				var url = oConnectionData.runtimeUrl;
				if (oConnectionData.destination && oConnectionData.destination.wattUsage === "river") {
					url = oConnectionData.url;
				}

				oDataProviderManager.init(provider, url);
				var oResult = oDataProviderManager.getModelTemplateRepresentation();
				if (oResult && that._smartDoc.datasource) {
					that._smartDoc.datasource.append("entities", oResult.entities);
					that._smartDoc.datasource.url = url;
					return true;
				} else {
					throw new Error(that.getContext().i18n.getText("i18n", "modelBuilderStep_modelDatasourceErrorMsg"));
				}				
			},

			_addSmartDocParametersToModel: function(oSmartDoc) {
				if (oSmartDoc) {
					var that = this;
					$.each(oSmartDoc.modelElements(), function(key, item) {
						if (oSmartDoc.resolve(item + ".parameters") || item === "datasource") {
							that.getModel().oData[item] = oSmartDoc[item];
						}
					});
				}
			},

			/**
			 * Create groups list box content and dynamic grids for all groups in the list
			 */
			_createGroupsUIFromModel: function() {
				var that = this;
				var sModelRootName = this._oCurrentTemplate.getModelRoot();
				var iFormIndex = this._getIndexOfTemplateCustomizationForm(sModelRootName, this._smartDoc);
				if (iFormIndex > -1) {
					this._aGroups = this._smartDoc[sModelRootName].forms[iFormIndex].groups;
	
					if (this._aGroups) {
						//create JSON model instance 
						this._addSmartDocParametersToModel(this._smartDoc);
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setSizeLimit(500);
						oModel.setData(this._smartDoc);
						this._dynamicModel = oModel;
						return this._oCurrentTemplate.onBeforeTemplateCustomizationLoaded(this.getModel(), this._dynamicModel).then(function(aModels) {
	                        that.setModel(aModels[0]);
	                        that._dynamicModel = aModels[1];
							for (var i = 0; i < that._aGroups.length; i++) {
								// Create the view of the group and display it
								var sGroupTitle = that.getModel("i18n").getResourceBundle().getText(that._aGroups[i].title);
								var bAddSeparator = false;
								if (i < that._aGroups.length - 1) {
									bAddSeparator = true;
								}
								that._createDynamicModelGrid(i, sGroupTitle, bAddSeparator);
							}
	
							that._setTabIndexesOfLastElement();
						});
					}
				}
				else {
					throw new Error(that.getContext().i18n.getText("i18n", "modelBuilderStep_FailedToLocateFormErrorMsg")); 
				}
				
				return Q();
			},

			onBeforeRendering: function() {
				var that = this;

				if ((!this._bAlreadyLoaded) && (!this._bOnLoading)) {
					that._bOnLoading = true;

					// clean error messages and make the next button disabled
					this.fireValidation({
						isValid: false,
						message: ""
					});

					this.fireProcessingStarted();
					this._oCurrentTemplate = this.getModel().oData.selectedTemplate;
					this.configureI18nResources(this._oCurrentTemplate.getI18nResources());
					this._changeIsArray(false);

					this._loadModelForTemplate().then(function() {
						return that._createGroupsUIFromModel().then(function() {
							that._loadTemplateCustomizationImage();
							
							if (that._updateDataProviderManager()) {
								that._updateUIWithDataSource();
							}
							that.validateStepContent().fail();
							that._bAlreadyLoaded = true;
							that._bOnLoading = false;
							that.fireProcessingEnded();
						});
					}).fail(function(oError){
						that._bAlreadyLoaded = true;
						that.fireValidation({
							isValid: false,
							message: oError.message
						});
						throw oError;
					}).fin(function() {
						that._bOnLoading = false;
						that.fireProcessingEnded();
					}).done(); //Display errors only to console - UI will not be displayed
				}
			},

			_updateUIWithDataSource: function() {
				for (var i = 0; i < this._aGroups.length; ++i) {
					var sGroupContentGridID = "GroupContentGrid" + i;
					var oGroupContentGrid = sap.ui.getCore().byId(sGroupContentGridID);
					if (oGroupContentGrid) {
						var aControls = oGroupContentGrid.getContent();
						for (var j = 0; j < aControls.length; j++) {
							var oCurrentControl = aControls[j];
							var oControlModelConfigs = oCurrentControl.modelParameterConfigurations;
							var oControlDefaultValue = oControlModelConfigs ? oControlModelConfigs.defaultValue : null;

							if (oCurrentControl.setSelectedItemId) {
								if (_.isObject(oControlDefaultValue)) {
									// If value set by user and it is different from default value - reset to default
									if (oCurrentControl.getValue() !== oControlDefaultValue.value) {
										oControlModelConfigs.value = oControlDefaultValue;
									}
								}
								else {
									oCurrentControl.setValue("");
									oCurrentControl.setSelectedItemId(undefined);
								}
								
							}
							else if (oCurrentControl.setValue) {
								if (_.isString(oControlDefaultValue)) {
									// If value set by user and it is different from default value - reset to default
									if (oCurrentControl.getValue() !== oControlDefaultValue) {
										oCurrentControl.setValue(oControlDefaultValue);
									}
								}
								else {
									oCurrentControl.setValue("");
								}
							}
							else if (oCurrentControl.setChecked) {
								if (_.isBoolean(oControlDefaultValue)) {
									// If value set by user and it is different from default value - reset to default
									if (oCurrentControl.getChecked() !== oControlDefaultValue) {
										oCurrentControl.setChecked(oControlDefaultValue);
									}
								}
								else {
									oCurrentControl.setChecked(false);
								}
								
							}
							oCurrentControl.getModel().refresh();
						}
						oGroupContentGrid.getModel().refresh();
					}
				}
			},


			/**
			 * Load template customization image
			 */
			_loadTemplateCustomizationImage: function() {
				var oTemplateImage = sap.ui.getCore().byId("TemplateImage");
				oTemplateImage.setVisible(false);
				var sTemplateCustImg = this._oCurrentTemplate.getTemplateCustomizationImage();
				if (!sTemplateCustImg) {
					sTemplateCustImg = this._oCurrentTemplate.getPreviewImage();
				}
				var sPath = this._oCurrentTemplate.getPath();
				var sTemplate = this._oCurrentTemplate.getTemplateClass().getProxyMetadata().getName();
				if (sTemplate && sPath && sTemplateCustImg) {
					var sTemplateCustImgPath = sPath + "/" + sTemplateCustImg;
					var sImageURL = this._getTemplateCustomizationImgForTemplate(sTemplate, sTemplateCustImgPath);
					oTemplateImage.setSrc(sImageURL);
					oTemplateImage.setVisible(true);
				}
			},

			/**
			 * Return the template image full path Url (considering its plugin location)
			 */
			_getTemplateCustomizationImgForTemplate: function(templateName, sTemplateCustImgPath) {
				// in case that failed to retrieve the image, missing image icon will be display 
				var sUrl = null;

				var sPluginName = null;
				var iSplit = templateName.indexOf("/");
				if (iSplit > -1) {
					sPluginName = templateName.substring(0, iSplit);
				}

				var sRelativeImagePath = sTemplateCustImgPath.substring(sTemplateCustImgPath.indexOf("/")); //remove the plugin folder name from path
				sUrl = require.toUrl(sPluginName + sRelativeImagePath);

				return sUrl;
			},

			onSelectedServiceChange: function(oEvent) {
				var that = this;

				if (this._bAlreadyLoaded) {

					this.fireProcessingStarted();
					var oDataBindingGrid = sap.ui.getCore().byId("DataBindingGrid");
					oDataBindingGrid.destroyContent();

					// clean error messages and make the next button disabled
					this.fireValidation({
						isValid: false,
						message: ""
					});
					
					this._loadModelForTemplate().then(function() {
						//create JSON model instance 
						that._addSmartDocParametersToModel(that._smartDoc);
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setSizeLimit(500);
						oModel.setData(that._smartDoc);
						that._dynamicModel = oModel;

						return that._oCurrentTemplate.onBeforeTemplateCustomizationLoaded(that.getModel(), that._dynamicModel).then(function(aModels) {
							that.setModel(aModels[0]);
							that._dynamicModel = aModels[1];
							for (var i = 0; i < that._aGroups.length; i++) {
								// Create the view of the group and display it in the UI
								var sGroupTitle = that.getModel("i18n").getResourceBundle().getText(that._aGroups[i].title);
								var bAddSeparator = false;
								if (i < that._aGroups.length - 1) {
									bAddSeparator = true;
								}
								that._createDynamicModelGrid(i, sGroupTitle, bAddSeparator);
							}
							that._setTabIndexesOfLastElement();

							that.validateStepContent().fail( /*No failure handling is needed here*/ );
							that._bGridDisplayedAfterServiceChanged = true;
							
							if (that._updateDataProviderManager()) {
								that._updateUIWithDataSource();
								that.fireProcessingEnded();
							}
						});
					}).done(function() {
						that._bAlreadyLoaded = false; // Enable the call of OnBeforeRendering
						that.fireProcessingEnded();
					}); //Display errors only to console - UI will not be displayed
				}
			},

			setFocusOnFirstItem: function() {
				if (this._bAlreadyLoaded) {
					var oGroupContentGrid = sap.ui.getCore().byId("GroupContentGrid0");
					if (oGroupContentGrid) {
						var aContents = oGroupContentGrid.getContent();
						if (aContents && aContents.length > 1) {
							// Skip the first group title label
							var controlModelConfigs = aContents[1].modelParameterConfigurations;
							if (controlModelConfigs) {
								// First control in the grid after title is not a label and represents model.json parameter (probably check-box)
								aContents[1].focus();
							} else {
								// Skip the first control after title (as it is only a label) and focus the one after it (the third in grid)
								aContents[2].focus();
							}
						}
					}
				}
			},

			_setTabIndexesOfLastElement: function() {
				$('#' + this._backButtonId).tabIndex = 0;

				if (this._aGroups && this._aGroups.length > 0) {
					var lastGroupIndex = this._aGroups.length - 1;
					var sGroupContentGridID = "GroupContentGrid" + lastGroupIndex;
					var oGroupContentGrid = sap.ui.getCore().byId(sGroupContentGridID);
					if (oGroupContentGrid) {
						var lastElementNumber = oGroupContentGrid.getContent().length - 1;
						var lastElementId = oGroupContentGrid.getContent()[lastElementNumber].getId();

						$('#' + lastElementId).focusout(function() {
							$('#' + this._nextButtonId).focus();
						});
					}

				}

				$('#' + this._nextButtonId).tabIndex = 0;
			},

			setTabIndexes: function(stepIndex, nextButtonId, backButtonId) {

				this._stepIndex = stepIndex;
				this._nextButtonId = nextButtonId;
				this._backButtonId = backButtonId;
				this._setTabIndexesOfLastElement();
			},

			cleanStep: function() {
				this._changeIsArray(true);

				this._bAlreadyLoaded = false;
				this._bOnLoading = false;
				this._bGridDisplayedAfterServiceChanged = false;

				this._smartDoc = null;
				this._oCurrentTemplate = null;
				this._aGroups = null;

				this._clearSmartDocParametersFromModel();
				this.getContext().service.smartDocProvider.invalidateCachedSmartDoc().done();
			},

			renderer: {},

			_clearSmartDocParametersFromModel: function() {
				// check if model exists for cases when clean step is called without rendering
				if (this._smartDoc && this.getModel()) {
					var that = this;
					$.each(that._smartDoc.modelElements(), function(key, item) {
						if (that._smartDoc.resolve(item + ".parameters") || item === "datasource") {
							delete that.getModel().oData[item];
						}
					});
				}
			},

			_clearComboBoxes: function(oControl) {
				this._initFireChangeCounter(oControl);
				for (var groupIndex = 0; groupIndex < this._aGroups.length; groupIndex++) {
					var oGroupContentGrid = sap.ui.getCore().byId("GroupContentGrid" + groupIndex);
					if (oGroupContentGrid) {
						var aControls = oGroupContentGrid.getContent();

						for (var i = 0; i < aControls.length; i++) {
							var oCurrentControl = aControls[i];
							if (oControl === oCurrentControl) {
								continue;
							}
							if (oCurrentControl.getItems) {
								if (oCurrentControl.getItems().length === 1) {
									// The combo box includes only one item
									var oFirstItem = oCurrentControl.getItems()[0];
									if (oCurrentControl.getSelectedItemId() !== oFirstItem.getId() && oCurrentControl.data("wasClearedByUser") !== true) {
										// Item is not already selected - then select it:
										oCurrentControl.fireChange({
											selectedItem: oFirstItem,
											newValue: oFirstItem.getText()
										});
										oCurrentControl.setSelectedItemId(oFirstItem.getId());
										oCurrentControl.setValue(oFirstItem.getText());
										oCurrentControl.getModel().refresh();
									}
								} else if (!oCurrentControl.getSelectedItemId() || oCurrentControl.getItems().length === 0) {
									oCurrentControl.fireChange({
										selectedItem: "",
										newValue: "",
										codeTriggered: true
									});
									oCurrentControl.setValue("");
									oCurrentControl.setSelectedItemId(undefined);
									oCurrentControl.getModel().refresh();
								}
							}
						}
					}
				}
			},

			_initFireChangeCounter: function(oControl) {
				this._iFireChangeCounter = 0;
				for (var groupIndex = 0; groupIndex < this._aGroups.length; groupIndex++) {
					var oGroupContentGrid = sap.ui.getCore().byId("GroupContentGrid" + groupIndex);
					if (oGroupContentGrid) {
						var aControls = oGroupContentGrid.getContent();

						for (var i = 0; i < aControls.length; i++) {
							var oCurrentControl = aControls[i];
							if (oControl === oCurrentControl) {
								continue;
							}
							// Count all comboboxes that will be cleared (value set to empty) from _clearComboBoxes 
							if (oCurrentControl.getItems) {
								if (oCurrentControl.getItems().length !== 1) {
									if (!oCurrentControl.getSelectedItemId() || oCurrentControl.getItems().length === 0) {
										this._iFireChangeCounter++;
									}
								}
							}
						}
					}
				}
			},

			validateStepContent: function(oChangeEvent) {
				var oDeferred = Q.defer();

				// in case that oChangeEvent === undefined  --> call from onBeforeRendering/onSelectedServiceChange
				if (oChangeEvent !== undefined) {
					// Clear validation marks from the control that its value was changed
					this.clearValidationMarks(oChangeEvent.getSource());
				}

				// Validate all parameters in all groups (by UI order: top-down)
				// Assumption: the grids with the controls for all groups were already created
				for (var groupIndex = 0; groupIndex < this._aGroups.length; groupIndex++) {
					var oGroupContentGrid = sap.ui.getCore().byId("GroupContentGrid" + groupIndex);
					if (oGroupContentGrid) {
						var aControls = oGroupContentGrid.getContent();

						for (var i = 0; i < aControls.length; i++) {
							var oControl = aControls[i];
							var controlModelConfigs = oControl.modelParameterConfigurations;
							// Validate only controls which get user input (skip label controls)
							if (controlModelConfigs !== undefined) {
								var controlValue;
								var aControlListItemOptions;
								if (oChangeEvent !== undefined && oChangeEvent.getSource() === oControl) {
									// For the control that was now changed: the value is taken from the event
									if (controlModelConfigs.wizard.control === "TextField") {
										controlValue = oChangeEvent.getParameter("liveValue");
									} else {
										controlValue = oChangeEvent.getParameter("newValue");
									}
								} else {
									// For other controls: the value is taken from the control itself
									if (controlModelConfigs.wizard.control === "CheckBox") {
										controlValue = oControl.getChecked();
									} else {
										controlValue = oControl.getValue();
									}
								}
								if (controlModelConfigs.wizard.control === "ComboBox") {
									aControlListItemOptions = oControl.getItems();
								}
								// Perform the validation
								var oControlValidationResult = this.validateModelParameter(controlValue, controlModelConfigs, this
									.getModel("i18n").getResourceBundle(), aControlListItemOptions);
								// Mark the first control that is not valid and stop validation (not possible for check box)
								if (!oControlValidationResult.isValid) {
									oDeferred.reject(oControlValidationResult.message);
									// Don't mark a field as invalid if the user did not enter a value in the field yet.
									if ((oChangeEvent !== undefined) && ((oChangeEvent.getSource() === oControl && (!oChangeEvent
										.getParameter("codeTriggered"))) || (controlValue !== undefined && controlValue !== ""))) {
										this.markAsInvalid(oControl);
										this.fireValidation(oControlValidationResult); //fire validation with false
									} else {
										this.fireValidation({
											isValid: false
										});
									}
									return oDeferred.promise; // stop validation
								} else {
									// Mark the changed control as valid if it has now became valid.
									// Other valid controls that were not changed will not be marked at all.
									if (oChangeEvent !== undefined && oChangeEvent.getSource() === oControl && (!oChangeEvent.getParameter("codeTriggered"))) {
										if (controlModelConfigs.wizard.control !== "CheckBox") {
											this.markAsValid(oControl);
										}

									}
								}
							}
						}
					}
				}
				
				// If got here: the whole step is valid
				oDeferred.resolve(true);
				this.fireValidation({
					isValid: true
				});
				return oDeferred.promise;
			},

			/**
			 * Validates that the selected value for a given parameter of the template model is valid.
			 * The validation is performed according to the configurations defined in the model.json file of the template,
			 * for the appropriate model parameter.
			 *
			 * @param oSelectedValue The value for the model parameter, as selected by the user.
			 * 			(This value will be passed to the template in the generation process, if valid).
			 * 			Currently only string value for TextBox / ComboBox wizard control is supported.
			 *
			 * @param oModelParameterConfigs The smart model object defining the configurations from the model.json file
			 * 			for the appropriate template model parameter.
			 *
			 * @param aListItemOptions [Optional] The array of SAPUI5 ListItem which represent the possible
			 *           values availbale for selection. This parameter must be provided only for UI controls allowing selection from a list.
			 *
			 * @returns An object defines the validation result, with the following properties:
			 *  			isValid : Boolean value which states the validation result.
			 *  			message : String error message (only if the value is not valid).
			 */
			validateModelParameter: function(oSelectedValue, oModelParameterConfigs, oResourceBundle, aListItemOptions) {
				// Validation for required fields
				if (oModelParameterConfigs.wizard.required === true) {
					var sControl = oModelParameterConfigs.wizard.control;
					if (sControl === "ComboBox" || sControl === "TextField") {
						// Validate that the string value of the control is not empty for required field
						if (oSelectedValue === undefined || oSelectedValue.length === 0) {
							return {
								isValid: false,
								message: oResourceBundle.getText("templateModelValidator_missingParamValueMsg", [oResourceBundle
												.getText(oModelParameterConfigs.wizard.title)])
							};
						}
					}
				}

				// Validation for combo box (value is one of the options)
				if ((oModelParameterConfigs.wizard.control === "ComboBox") && (oSelectedValue !== undefined) && (oSelectedValue.length !== 0)) {
					var isOptionFound = false;
					aListItemOptions = aListItemOptions || [];
					for (var i = 0; i < aListItemOptions.length; i++) {
						if (aListItemOptions[i].getText() === oSelectedValue) {
							isOptionFound = true;
							break;
						}
					}
					if (!isOptionFound) {
						return {
							isValid: false,
							message: oResourceBundle.getText("templateModelValidator_selectValueMsg", [oResourceBundle
											.getText(oModelParameterConfigs.wizard.title)])
						};
					}
				}

				// Validate regex for text box 
				if ((oModelParameterConfigs.wizard.control === "TextField") && (oSelectedValue !== undefined) && (oSelectedValue.length !== 0)) {
					if (oModelParameterConfigs.wizard.regExp !== undefined) {
						var regex = new RegExp(oModelParameterConfigs.wizard.regExp);

						if (!regex.test(oSelectedValue)) {
							var sGeneralErrorMsg = oResourceBundle.getText("templateModelValidator_invalidFormatMsg", [oResourceBundle.getText(
								oModelParameterConfigs.wizard.title)]);
							return {
								isValid: false,
								message: (oModelParameterConfigs.wizard.regExpErrMsg === undefined) ? sGeneralErrorMsg : sGeneralErrorMsg + ": " + oResourceBundle.getText(
									oModelParameterConfigs.wizard.regExpErrMsg)
							};
						}
					}
				}

				// If got here - the value is valid
				return {
					isValid: true
				};
			}
		});