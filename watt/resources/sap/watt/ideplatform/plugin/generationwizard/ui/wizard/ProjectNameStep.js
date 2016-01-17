jQuery.sap.declare("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ProjectNameStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent");

sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent.extend(
	"sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ProjectNameStep", {
		//	emptyProjectNameErrorMsg : "Project name cannot be empty",
		//	regexProjectNameErrorMsg : "The project name may contain characters a-z, A-Z, digits 0-9, periods, dashes, and underscores.",
		//	projectNameAlreadyExistsErrorMsg : "A project with this name already exists at your workspace",

		emptyProjectNameErrorMsg: undefined,
		regexProjectNameErrorMsg: undefined,
		projectNameAlreadyExistsErrorMsg: undefined,
		_oPromise: undefined,
		_oSelectedDocContent: undefined,

		init: function() {
			var that = this;
			if (sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent.prototype.init) {
				sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent.prototype.init.apply(this, arguments); // call super.init()
			}
			this.liveProjectName = "";

			this.projectNameLabel = new sap.ui.commons.TextView({
				textAlign: "Left",
				layoutData: new sap.ui.layout.GridData({
					span: "L3 M3 S12"
				})
			}).addStyleClass("wizardBody");

			this.packageNameTextField = new sap.ui.commons.TextField({
				value: "{/projectName}",
				width: "100%",
				maxLength : 80,
				liveChange: function(oEvent) {
					that.validateStepContent(oEvent, true).fail( /*No failure handling is needed here*/ );
				},
				accessibleRole: sap.ui.core.AccessibleRole.Textbox,
				layoutData: new sap.ui.layout.GridData({
					span: "L5 M5 S12"
				})
			});

			this.packageNameTextField.addDelegate({

				onBeforeRendering: function() {
					var value = that.packageNameTextField.getLiveValue();
					if (!value) {
						value = that.liveProjectName;
					}
					if (value) {
						that.packageNameTextField.setValue(value);
					}
				}
			});

			var projectNameContent = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L10 M12 S12",
					linebreak: true
				}),
				content: [this.projectNameLabel, this.packageNameTextField]
			});

			this.addContent(projectNameContent);
		},

		validateStepContent: function(oEvent, bMarkFieldsValidation) {
			var that = this;
			if (oEvent && oEvent.getSource() !== this.packageNameTextField) {
				if (sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent.prototype.validateStepContent) {
					return sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent.prototype.validateStepContent.apply(this,
						arguments).then(function() {
							return that._validateProjectName(undefined, false);
						}).fail(function(sError) {
							return that.fireValidation({
								isValid: false,
								message: sError
							});
						});
				}
			} else {
				return this._validateProjectName(oEvent, bMarkFieldsValidation);
			}
		},

		_getRootContent: function() {
			return this.getContext().service.filesystem.documentProvider.getRoot().then(function(oRoot) {
				return oRoot.getFolderContent().then(function(aContent) {
					return aContent;
				});
			});
		},

		_getSelectedDocContent: function(oSelectedDoc) {
			return oSelectedDoc.getFolderContent().then(function(aContent) {
				return aContent;
			});
		},

		_getDocumentFromRoot: function(sProjectName) {
			if (!this._oPromise) {
				this._oPromise = this._getRootContent();
			}
			var that = this;
			return this._oPromise.then(function(aContent) {
				return that._getContentByName(aContent, sProjectName);
			});
		},

		_getDocumentFromSelectedDoc: function(sProjectName, oSelectedDoc) {
			var that = this;
			if (!this._oSelectedDocContent) {
				if (oSelectedDoc.getEntity().getType() === "file") {
					return oSelectedDoc.getParent().then(function(oParentDoc) {
						that._oSelectedDocContent = that._getSelectedDocContent(oParentDoc);
						return that._searchExistingProject(sProjectName);
					});
				}
				this._oSelectedDocContent = this._getSelectedDocContent(oSelectedDoc);
			}
			return this._searchExistingProject(sProjectName);
		},
		
		_getContentByName : function(aContent, sProjectName) {
			var sProjectNameLowerCase = sProjectName.toLowerCase();
			for (var i = 0; i < aContent.length; i++) {
				if (aContent[i].getEntity().getName().toLowerCase() === sProjectNameLowerCase) {
					return aContent[i];
				}
			}
		},

		_searchExistingProject: function(sProjectName) {
			var that = this;
			return this._oSelectedDocContent.then(function(aContent) {
				return that._getContentByName(aContent, sProjectName);
			});
		},

		_validateProjectName: function(oEvent, bMarkFieldsValidation) {
			var that = this;
			var bValueChanged;
			var sProjectName;
			var bAppDescriptorValidation;
			if (this.generalAppDescriptorValidation) {
				bAppDescriptorValidation = this.generalAppDescriptorValidation();
			}

			if (oEvent !== undefined) {
				sProjectName = oEvent.getParameter("liveValue");
				this.liveProjectName = sProjectName;
				bValueChanged = true;
			} else {
				sProjectName = this.packageNameTextField.getValue();
				bValueChanged = false;
			}

			// validate project name is not empty
			if (sProjectName.length === 0) {
				this._handleInvalidProjectName(this.emptyProjectNameErrorMsg, bMarkFieldsValidation);
				if (bMarkFieldsValidation) {
					return Q.reject(this.emptyProjectNameErrorMsg);
				} else {
					return Q.reject("");
				}

			} else if (!this._checkFolderNameAllowed(sProjectName)) {
				// validate project name is valid according to regex
				this._handleInvalidProjectName(this.regexProjectNameErrorMsg, bMarkFieldsValidation);
				if (bMarkFieldsValidation) {
					return Q.reject(this.regexProjectNameErrorMsg);
				} else {
					return Q.reject("");
				}
			} else {
				//  Validate the project doesn't exist, or exists but empty folder, or exists but only contains allowed content (empty git repository / project)
				this._sLastProjectName = sProjectName;
				var sSelectedTemplateType;
				var projectDocPromise;
				var oCurrModel = this.getModel();
				if (oCurrModel && oCurrModel.oData && oCurrModel.oData.selectedTemplate) {
					sSelectedTemplateType = oCurrModel.oData.selectedTemplate.getType();
				}
				var sExistingMessage;
				if (sSelectedTemplateType === "module") { //we have to search existing project only under the selected MTA
					sExistingMessage = "projNameStep_projectexistsinselectedmsg";
					var oSelectedDoc = oCurrModel.oData.selectedDocument;
					projectDocPromise = this._getDocumentFromSelectedDoc(sProjectName, oSelectedDoc);
				} else { //sSelectedTemplateType === "project" or undefined
					sExistingMessage = "projNameStep_projectexistsmsg";
					projectDocPromise = this._getDocumentFromRoot(sProjectName); //this.getContext().service.filesystem.documentProvider.getDocument("/" + sProjectName);
				}
				if (!this.projectNameAlreadyExistsErrorMsg) {
					this.projectNameAlreadyExistsErrorMsg = this.getContext().i18n.getText("i18n", sExistingMessage);
				}
				return projectDocPromise.then(
					function(oProjectDoc) {
						if (oProjectDoc) {
							// project folder exists - check if it is also empty folder or an empty git repository
							return oProjectDoc.getFolderContent().then(
								function(aContent) {
									return Q.sap.require("sap.watt.ideplatform.generationwizard/utils/WizardUtils").then(function(oWizardUtils) {
										var bValidFolder = oWizardUtils.isFolderEmpty(aContent);
										// Handle validation check result for existing folder
										if (bValidFolder) {
											if (that._sLastProjectName === sProjectName) {
												that._handleValidProjectName(sProjectName, bValueChanged, bMarkFieldsValidation, bAppDescriptorValidation);
											}
											return that._checkFinalValidation(bAppDescriptorValidation);
										} else {
											if (that._sLastProjectName === sProjectName) {
												that._handleInvalidProjectName(that.projectNameAlreadyExistsErrorMsg, bMarkFieldsValidation);
											}
											if (bMarkFieldsValidation) {
												return Q.reject(this.projectNameAlreadyExistsErrorMsg);
											} else {
												return Q.reject("");
											}

										}
									});
								});
						} else {
							// project folder doesn't exist
							if (that._sLastProjectName === sProjectName) {
								that._handleValidProjectName(sProjectName, bValueChanged, bMarkFieldsValidation, bAppDescriptorValidation);
							}
							return that._checkFinalValidation(bAppDescriptorValidation);
						}
					});
			}
		},

		_checkFinalValidation: function(bAppDescriptorValidation) {
			if (bAppDescriptorValidation) {
				return Q(true);
			} else {
				this.fireValidation({
					isValid: false,
					message: ""
				});
				return Q.reject("");
			}
		},

		_handleValidProjectName: function(sProjectName, bValueChanged, bMarkFieldsValidation, bAppDescriptorValidation) {
			if (bValueChanged && bMarkFieldsValidation) {
				this.markAsValid(this.packageNameTextField);
			}
			if (bAppDescriptorValidation) {
				this.fireValidation({
					isValid: true
				});
			}
			if (bValueChanged) {
				this.fireValueChange({
					id: "projectName",
					value: sProjectName
				});
			}
		},

		_handleInvalidProjectName: function(sMessage, bMarkFieldsValidation) {
			if (bMarkFieldsValidation) {
				this.markAsInvalid(this.packageNameTextField);
			} else {
				sMessage = "";
			}
			this.fireValidation({
				isValid: false,
				message: sMessage
			});
		},

		setProjectName: function(sSelected) {
			this.packageNameTextField.setValue(sSelected);
			this.liveProjectName = sSelected;
			this.packageNameTextField.fireLiveChange({
				liveValue: sSelected
			});
		},

		setProjectNameLabel: function(sTemplateType) {
			if (sTemplateType === "module") {
				this.projectNameLabel.setText(this.getContext().i18n.getText("i18n", "projNameStep_modulename"));
			} else {
				this.projectNameLabel.setText(this.getContext().i18n.getText("i18n", "projNameStep_projectname"));
			}
		},

		/** Note: This method checks against all the name parts (splitted by '.') and not in one regex due to performance reasons **/
		_checkFolderNameAllowed: function(sName) {
			//Corresponds to allowed characters for UI5 Repositories (which are also valid UI5 namespaces):
			//Last character must not be a "."
			//First character must be a letter or _
			//After . must come a letter or _
			//Length is maximum 128 characters
			if (sName.length > 128) {
				return false;
			}
			var sLastChar = sName.charAt(sName.length - 1);
			if (sLastChar === ".") {
				return false;
			} else {
				var aParts = sName.split(".");
				var rAllowedPartNames = /^[a-zA-Z_]+[a-zA-Z0-9_-]*$/;
				for (var i = 0; i < aParts.length; i++) {
					if (!rAllowedPartNames.test(aParts[i])) {
						return false;
					}
				}
				return true;
			}
		},

		setFocusOnFirstItem: function() {
			this.packageNameTextField.focus();
		},

		onBeforeRendering: function() {
			if (sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent.prototype.onBeforeRendering) {
				sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent.prototype.onBeforeRendering.apply(this,
					arguments);
			}

			if (this._isHATPluginLoaded) {
				this.updateUIWithMobileEnablementFields();
			}
		},

		renderer: {},

		onAfterRendering: function() {
			this.emptyProjectNameErrorMsg = this.getContext().i18n.getText("i18n", "projNameStep_emptyprojectmsg");
			this.regexProjectNameErrorMsg = this.getContext().i18n.getText("i18n", "projNameStep_projectvalidationmsg");
		},

		cleanStep: function() {
			if (sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent.prototype.cleanStep) {
				sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent.prototype.cleanStep.apply(this,
					arguments); // call super.init()
			}
			this._oPromise = undefined;
			this._oSelectedDocContent = undefined;
		},

		onSelectedTemplateChange : function() {
			if (sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent.prototype.onSelectedTemplateChange) {
				sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent.prototype.onSelectedTemplateChange.apply(this, arguments);
			}

			var that = this;
			this.getContext().service.pluginmanagement.isPluginLoaded("com.sap.webide.hybrid").done(function(isLoaded) {
				that._isHATPluginLoaded = isLoaded;
			});
		},

		_isSupportedProjectType: function(oModel) {
			var aSupportedProjectTypes = oModel.getData().selectedTemplate._mConfig.targetProjectTypes;

			if (aSupportedProjectTypes) {
				for (var i = 0, len = aSupportedProjectTypes.length; i < len; i ++) {
					if (aSupportedProjectTypes[i] === "com.sap.webide.hybrid.cordova") {
						return true;
					}
				}
			}

			return false;
		},

		updateUIWithMobileEnablementFields: function() {
			var oModel = this.getModel();
			var i, len;
			
			// as this wizard step is shared between templates, need to remove previous controls after AppDescriptor controls are generated
			if (this._oHybridMobileApplicationControls) {
				for (i = 0, len = this._oHybridMobileApplicationControls.length; i < len; i ++) {
					this.removeContent(this._oHybridMobileApplicationControls[i]);
				}
			}

			if (this._isSupportedProjectType(oModel)) {

				if (typeof oModel.oData.bMobileEnabled === "undefined") {
					oModel.oData.bMobileEnabled = false;
				}

				if (!this._oHybridMobileApplicationControls) {
					this._oHybridMobileApplicationControls = [];

					this._oHybridMobileApplicationControls.push(new sap.ui.commons.TextView({
						text: "{i18n>projNameStep_mobileEnablement_title}",
						textAlign: "Left",
						width: "100%",
						wrapping: false,
						layoutData: new sap.ui.layout.GridData({
							span: "L3 M12 S12",
							linebreak: true
						})
					}).addStyleClass("fontSpecial wizardH3 parameterGroupTitleMargin manifestTitleMargin"));

					var oCheckBox = new sap.ui.commons.CheckBox({
											checked : oModel.oData.bMobileEnabled,
											change : function() {
														oModel.oData.bMobileEnabled = oCheckBox.getChecked();
													}
										}).addStyleClass("wizardCheckBox");
					var oTextViewCBDescription =	new sap.ui.commons.TextView({
									text : "{i18n>projNameStep_hybridMobileApplication}",
									textAlign: "Left"
									}).addStyleClass("wizardBody");
					var oContent = new sap.ui.commons.layout.HorizontalLayout({
							content : [oCheckBox, oTextViewCBDescription]
					});
					this._oHybridMobileApplicationControls.push(oContent);
				}
				
				// append controls so that they are at the end after AppDescriptor controls
				for (i = 0, len = this._oHybridMobileApplicationControls.length; i < len; i ++) {
					this.addContent(this._oHybridMobileApplicationControls[i]);
				}
			}
		}

	});