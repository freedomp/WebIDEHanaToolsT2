jQuery.sap.declare("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent", {
		_: null,
		aManifestPropertiesGrids: [],
		AppDescriptorSupportedProperties: [{
			"id": "sap.app.title",
			"i18nKey": "AppDescriptorData_Title"
		}, {
			"id": "Namespace",
			"regExp": "(?!(sap|new(\\..*)*)$)^[a-zA-Z_][\\w]*(\\.[a-zA-Z_][\\w]*)*$",
			"regExpErrMsg": "nameSpace_model_parameters_name_validationError",
			"i18nKey": "AppDescriptorData_Namespace"
		}, {
			"id": "sap.app.description",
			"i18nKey": "AppDescriptorData_Description"
		}, {
			"id": "sap.app.ach",
			"regExp": "^([a-zA-Z]{2,3})(\\-[a-zA-Z0-9]{2,3})*$",
			"regExpErrMsg": "smart_ach_validation_error",
			"i18nKey": "AppDescriptorData_ApplicationComponentHierarchy"
		}, {
			"id": "sap.fiori.registrationIds",
			"i18nKey": "AppDescriptorData_SAPFioriID"
		}, {
			"id": "sap.platform.abap.uri",
			"i18nKey": "AppDescriptorData_ABAPDeployPath"
		}],

		init: function() {
			var that = this;
			require(["sap/watt/lib/lodash/lodash"], function(lodash) {
				that._ = lodash;
			});
		},

		_isPropertyExist: function(sProp) {
			return this._.findIndex(this.AppDescriptorSupportedProperties, function(prop) {
				return prop.id === sProp;
			});
		},

		onSelectedTemplateChange: function(oEvent) {
			var oModel = oEvent.getSource().getModel();
			this.updateUIWithAppDescriptorFields(oModel);
		},

		loadAppDescriptorConfiguration: function(oModel) {
			var that = this;
			return Q.sap.require("sap/watt/lib/lodash/lodash").then(function(lodash) {
				that._ = lodash;
				return that._loadAppDescriptorConfiguration(oModel);
			});

		},

		_loadAppDescriptorConfiguration: function(oModel) {
			var that = this;
			var aPropertiesGrids = [];
			var oSelectedTemplate = oModel.oData.selectedTemplate;

			return this._loadSmartDoc(oSelectedTemplate).then(function(oSmartDoc) {
				var sModelRootName = oSelectedTemplate.getModelRoot();
				if (oSmartDoc && sModelRootName) {
					that._smartDoc = oSmartDoc;
					that._addSmartDocParametersToModel(oModel);
					var templateSmartDopc = oSmartDoc[sModelRootName];
					if (templateSmartDopc) {
						var oForms = templateSmartDopc.forms;
						if (oForms) {
							var oAppDescriptorForm = that._getAppDescriptorForm(oForms);
							var aManifestProperties = oAppDescriptorForm.aManifestProperties;
							var iFormIndex = oAppDescriptorForm.iFormIndex;

							if (!that._.isEmpty(aManifestProperties) && (iFormIndex !== -1)) {
								var oTitleLabel = new sap.ui.commons.TextView({
									text: "{i18n>appDescriptorStep_title}",
									textAlign: "Left",
									width: "100%",
									wrapping: false,
									layoutData: new sap.ui.layout.GridData({
										span: "L3 M12 S12",
										linebreak: true
									})

								}).addStyleClass("fontSpecial wizardH3 parameterGroupTitleMargin manifestTitleMargin");
								aPropertiesGrids.push(oTitleLabel);

								var bindingExpression = sModelRootName + "/forms/" + iFormIndex + "/groups/0";
								var bInternalEnv = sap.watt.getEnv("internal");
								that.aTextFieldControls = [];
								for (var k = 0; k < aManifestProperties.length; k++) {
									var sModelPath = "/" + bindingExpression + "/parameters/" + k;
									var bInternalProperty = (aManifestProperties[k].wizard.internalOnly === undefined) ? false : aManifestProperties[k].wizard.internalOnly;
									var index = that._isPropertyExist(aManifestProperties[k].appDescriptor.id);
									if ((index !== -1) && (!bInternalProperty || (bInternalProperty === bInternalEnv))) {
										var sPropTitle = that.getContext().i18n.getText(that.AppDescriptorSupportedProperties[index].i18nKey);
										var sId = (!aManifestProperties[k].wizard.required) ? sPropTitle : sPropTitle + "*";
										var oSingleAppDescriptorPropertyGrid = that._buildSingleAppDescriptorPropertyGrid(sId, sModelPath, aManifestProperties[k], that
											.AppDescriptorSupportedProperties[
												index]);
										aPropertiesGrids.push(oSingleAppDescriptorPropertyGrid);
									}
								}
							}
						}
					}
					return aPropertiesGrids;
				} else {
					return aPropertiesGrids;
				}
			});
		},

		_buildSingleAppDescriptorPropertyGrid: function(sPropLabelText, sModelPath, oManifestProperty, oAppDescriptorSupportedProperty) {
			var oLabel = new sap.ui.commons.TextView({
				text: sPropLabelText,
				textAlign: "Left",
				layoutData: new sap.ui.layout.GridData({
					span: "L3 M3 S12"
				})
			}).addStyleClass("wizardBody");

			var oTextField = new sap.ui.commons.TextField({
				value: "{" + sModelPath + "/value}",
				width: "100%",
				accessibleRole: sap.ui.core.AccessibleRole.Textbox,
				layoutData: new sap.ui.layout.GridData({
					span: "L5 M5 S12"
				})
			});

			var bIsRequired = oManifestProperty.wizard.required;
			var oAppDescriptorProp = oAppDescriptorSupportedProperty;
			if (bIsRequired || oAppDescriptorProp.regExp) {
				oTextField.modelParameterConfigurations = oAppDescriptorProp;
				oTextField.modelParameterConfigurations.required = bIsRequired;
				oTextField.attachLiveChange(this.validateStepContent, this);
				this.aTextFieldControls.push(oTextField);
				this.addDelegateToTextField(oTextField);
			}

			var oContent = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L10 M12 S12",
					linebreak: true
				}),
				content: [oLabel, oTextField]
			});

			return oContent;
		},

		_getAppDescriptorForm: function(oForms) {
			for (var i = 0; i < oForms.length; i++) {
				if (oForms[i].type && oForms[i].type === "appDescriptorGenericStep") {
					return {
						"aManifestProperties": oForms[i].groups[0].parameters,
						"iFormIndex": i
					};
				}
			}
			return {
				"aManifestProperties": [],
				"iFormIndex": -1
			};
		},

		/**
		 * Load the smart doc model for selected template
		 */
		_loadSmartDoc: function(oSelectedTemplate) {
			return this.getContext().service.smartDocProvider.getSmartDocByTemplate(oSelectedTemplate);
		},

		_addSmartDocParametersToModel: function(oModel) {
			var that = this;
			jQuery.each(this._smartDoc.modelElements(), function(key, item) {
				if (that._smartDoc.resolve(item + ".parameters") || item === "datasource" || item === "neoapp") {
					oModel.oData[item] = that._smartDoc[item];
				}
			});
		},

		_clearSmartDocParametersFromModel: function() {
			// check if model exists for cases when clean step is called without rendering
			if (this._smartDoc && this.getModel()) {
				var that = this;
				jQuery.each(that._smartDoc.modelElements(), function(key, item) {
					if (that._smartDoc.resolve(item + ".parameters") || item === "datasource" || item === "neoapp") {
						delete that.getModel().oData[item];
					}
				});
			}
		},

		cleanStep: function() {
			this.aTextFieldControls = undefined;
			this._clearSmartDocParametersFromModel();
			this.getContext().service.smartDocProvider.invalidateCachedSmartDoc().done();
			this._smartDoc = undefined;
			this.aManifestPropertiesGrids = undefined;
			this.sCurrentTemplate = undefined;
		},

		validateStepContent: function(oEvent) {
			if (oEvent) {
				var sValue = oEvent.getParameter("liveValue");
				var oEventSourceControl = oEvent.getSource();
				var controlModelConfigs;
				for (var i = 0; i < this.aTextFieldControls.length; i++) {
					var oControl = this.aTextFieldControls[i];
					if (oEventSourceControl === oControl) {
						controlModelConfigs = oControl.modelParameterConfigurations;
						oEvent.getSource().setValue(sValue);
						break;
					}
				}
				var i18n = this.getContext().i18n;
				var oControlValidationResult = this.validateModelParameter(sValue, controlModelConfigs, i18n);
				if (!oControlValidationResult.isValid) {
					this.markAsInvalid(oEventSourceControl);
					this.fireValidation(oControlValidationResult);
					return Q.reject(oControlValidationResult.message);
				} else {
					this.markAsValid(oEventSourceControl);
				}
			}

			var bGeneralValidation = this.generalAppDescriptorValidation();
			if (bGeneralValidation) {
				return Q(true);
			} else {
				return Q.reject("");
			}
		},

		generalAppDescriptorValidation: function() {
			var bGeneralValidation = false;
			var i18n = this.getContext().i18n;
			if (this.aTextFieldControls && this.aTextFieldControls.length > 0) {
				for (var k = 0; k < this.aTextFieldControls.length; k++) {
					var oControlValidationResult1 = this.validateModelParameter(this.aTextFieldControls[k].getValue().trim(), this.aTextFieldControls[k].modelParameterConfigurations,
						i18n);
					if (!oControlValidationResult1.isValid) {
						bGeneralValidation = false;
						break;
					} else {
						bGeneralValidation = true;
					}
				}
				return bGeneralValidation;
			} else {
				return true;
			}
		},

		validateModelParameter: function(oSelectedValue, oModelParameterConfigs, oResourceBundle) {
			// Validation for required fields
			if (oModelParameterConfigs.required) {
				// Validate that the string value of the control is not empty for required field
				if (this._.isEmpty(oSelectedValue)) {
					return {
						isValid: false,
						message: oResourceBundle.getText("templateModelValidator_missingParamValueMsg", [oResourceBundle
							.getText(oModelParameterConfigs.i18nKey)
						])
					};
				}
			}

			// Validate regex for text field
			if (!(this._.isEmpty(oSelectedValue)) && !(this._.isEmpty(oModelParameterConfigs.regExp))) {
				var regex = new RegExp(oModelParameterConfigs.regExp);
				if (!regex.test(oSelectedValue)) {
					var sGeneralErrorMsg = oResourceBundle.getText("templateModelValidator_invalidFormatMsg", [oResourceBundle.getText(
						oModelParameterConfigs.i18nKey)]);
					return {
						isValid: false,
						message: (oModelParameterConfigs.regExpErrMsg === undefined) ? sGeneralErrorMsg : sGeneralErrorMsg + ": " + oResourceBundle.getText(
							oModelParameterConfigs.regExpErrMsg)
					};
				}
			}

			// If got here - the value is valid
			return {
				isValid: true
			};
		},

		addDelegateToTextField: function(oControl) {
			var oTextField = oControl;
			oControl.addDelegate({
				onBeforeRendering: function() {
					oTextField.setValue(oTextField.getLiveValue());
				}
			});

		},

		onBeforeRendering: function(oArguments) {
			if (sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.onBeforeRendering) {
				sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.onBeforeRendering.apply(this,
					arguments);
			}
			var oModel = oArguments.srcControl.getModel();
			this.updateUIWithAppDescriptorFields(oModel);
		},

		updateUIWithAppDescriptorFields: function(oModel) {
			var sTemplatePath = oModel.getProperty("/selectedTemplate/_mConfig/template/_sName");
			if (this.sCurrentTemplate !== sTemplatePath) {
				var that = this;
				this.sCurrentTemplate = sTemplatePath;
				// Remove the App Descriptor controls of the previous template
				var numberOfControlsToDelete = that.aManifestPropertiesGrids.length;
				for (var i = 0; i < numberOfControlsToDelete; i++) {
					this.removeContent(that.aManifestPropertiesGrids[i]);
				}
				// Clear the array of controls that have to be validated
				this.aTextFieldControls = [];
				// Add the relevant App Descriptor controls to the current template
				this.loadAppDescriptorConfiguration(oModel).then(function(aManifestPropertiesGrids) {
					if (aManifestPropertiesGrids) {
						that.aManifestPropertiesGrids = aManifestPropertiesGrids;
						for (var k = 0; k < aManifestPropertiesGrids.length; k++) {
							that.addContent(aManifestPropertiesGrids[k]);
						}
					}
					that.validateStepContent();
				}).done();
			}
		},

		renderer: {}
	});