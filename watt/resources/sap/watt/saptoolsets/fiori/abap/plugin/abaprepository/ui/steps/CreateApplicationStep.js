jQuery.sap.declare("sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.CreateApplicationStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

var createApplicationStep = function() {

	var that = null;
	var lastStepRemoved = false;
	var stepIndex = null;

	/*
	 * Initializes the step and creates its UI.
	 * Occurs once when the wizard opens.
	 */
	var _init = function() {

		that = this;

		// Name Label
		var nameLabel = new sap.ui.commons.Label({
			required: true,
			text: "{i18n>CreateApplicationStep_Name}",
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		// Name name prefix
		this.S4HanaPrefixTextField = new sap.ui.commons.TextField({
			value: "{/s4HanaAppNamePrefix}", // bind this property to "s4HanaAppNamePrefix" in the model
			tooltip: "{i18n>CreateApplicationStep_Prefix}",
			width: "100%",
			visible: "{/isS4HanaSystem}",
			enabled: false,
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});

		// Name TextField
		this.nameTextField = new sap.ui.commons.TextField({
			value: "{/name}", // bind this property to "name" in the model
			tooltip: "{i18n>CreateApplicationStep_NameTooltip}",
			width: "100%",
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});
		// Name Grid
		this.nameContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [nameLabel, this.S4HanaPrefixTextField, this.nameTextField]
		});

		this.addContent(this.nameContent);

		this.nameTextField.attachChange(function() {
			that.markAsValid(that.nameTextField);
			var model = that.getWizardControl().getModel();

			// clear the package field only of not $TMP and not s4HANA
			if ((model.getProperty("/selectedPackage") !== "$TMP") && (!model.getProperty("/isS4HanaSystem"))) {
				that.getWizardControl().getModel().setProperty("/selectedPackage", "");
			}

			doesApplicationExists().then(function(exists) {
				if (exists) {
					that.markAsInvalid(that.nameTextField);

					var errorMessage = that.getContext().i18n.getText("i18n", "CreateApplicationStep_NameAlreadyExistsErrorMsg");
					that.fireValidation({
						isValid: false,
						message: errorMessage,
						severity: "error"
					});

					// if the name is invalid - disable the Description field and Browse button
					descriptionTextField.setEnabled(false);
					that.packageBrowseButton.setEnabled(false);
				} else {
					handleFieldsValidation();
				}
			}).done();
		});

		// Description Label
		var descriptionLabel = new sap.ui.commons.Label({
			required: true,
			text: "{i18n>CreateApplicationStep_Description}",
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		// Description TextField
		var descriptionTextField = new sap.ui.commons.TextField({
			value: "{/description}", // bind this property to "description" in the model
			tooltip: "{i18n>CreateApplicationStep_DescriptionTooltip}",
			width: "100%",
			liveChange: function(oEvent) {
				descriptionTextFieldChanged(oEvent);
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M8 S12"
			}),
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});

		var descriptionTextFieldChanged = function(oEvent) {
			that.markAsValid(descriptionTextField);
			var liveValue = oEvent.getParameter("liveValue");
			descriptionTextField.setValue(liveValue);
			handleFieldsValidation();
		};

		// Description Grid
		var descriptionContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [descriptionLabel, descriptionTextField]
		});

		this.addContent(descriptionContent);

		// Package Label
		var packageLabel = new sap.ui.commons.Label({
			required: true,
			text: "{i18n>CreateApplicationStep_Package}",
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		// Package TextField
		//add id
		this.packageTextField = sap.ui.getCore().byId("CreateApplicationStep_PackageField");
		if (this.packageTextField) {
			this.packageTextField.destroy();
		}
		this.packageTextField = new sap.ui.commons.TextField("CreateApplicationStep_PackageField" , {
			tooltip: "{i18n>CreateApplicationStep_PackageTooltip}",
			width: "100%",
			editable: false,
			enabled: {
				parts: ["/note", "/isS4HanaSystem"],
				formatter: function(note, s4Hana) {
					return ((note) && (!s4Hana)); //will be enabled only if there is note and the system is not s4HANA
				}
			},

			layoutData: new sap.ui.layout.GridData({
				span: "L5 M8 S12"
			}),
			value: "{/selectedPackage}"
		});

		this.packageTextField.attachChange(function() {
			that.markAsValid(that.packageTextField);
			handleFieldsValidation();
		});

		var getErrorMessage = function(responseText) {
			var xmlUtil = that.getXmlUtil();
			var responseXml = xmlUtil.stringToXml(responseText);
			var messageTag = xmlUtil.getChildByTagName(responseXml.childNodes[0], "message");
			return messageTag.textContent;
		};

		// Package browse button
		this.packageBrowseButton = new sap.ui.commons.Button({
			text: "{i18n>CreateApplicationStep_Browse}",
			press: function() {
				var model = that.oWizard.getModel();

				that.dialog = that.getPackageDialog().openPackageDialog(that.oContext, this, model.discoveryStatus);
				that.dialog.attachEvent("selectedPackage", function(event) {
					var selectedPackage = event.mParameters.package;
					// update the selected package in the model
					model.setProperty("/selectedPackage", selectedPackage);
					//set focus on browse
					that.packageBrowseButton.focus();

					if (selectedPackage.toUpperCase() === "$TMP") {
						that.errorInPackageField = null;
						handleFieldsValidation();
						removeNextStep();
						return;
					}

					// send the transportchecks request, in order to find out if the selected package is local or not
					// in order to know if to show the transports step or not
					// get the existing transports objects of the user
					that.oContext.service.transport.getTransports(selectedPackage, model.oData.name, model.destination).then(
						function(transportsResponse) {

							//that.packageTextField.setValue(selectedPackage);
							that.errorInPackageField = null;
							handleTransportsResponse(transportsResponse).done();
							handleFieldsValidation();

						}).fail(function(response) {
						var error = "";

						if (response.message) {
							error = response.message;
						} else if (response.responseText) {
							// extract the error from the response text
							error = getErrorMessage(response.responseText);
						}

						// add the error from the backend to the user-friendly error
						var friendlyError = that.getContext().i18n.getText("i18n", "CreateApplicationStep_FailedToGetTransports", [error]);

						that.fireValidation({
							isValid: false,
							message: friendlyError,
							severity: "error"
						});

						that.errorInPackageField = {
							message: friendlyError
						};
					}).done();
				});
			},
			width: "100%",
			enabled: false, 
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S4"
			}),
			accessibleRole: sap.ui.core.AccessibleRole.Button
		});

		// Package Grid
		var packageContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),

			content: [packageLabel, this.packageTextField, this.packageBrowseButton]

		});

		this.addContent(packageContent);
		
		this.createApplicationStepInfo = function(msg){
		    	that.fireValidation({
					isValid: true,
					message: that.getContext().i18n.getText("i18n", msg),
					severity: "info"
				}); 
		};


		// validate that all fields have the right input before enabling the Next button
		var handleFieldsValidation = function() {
			var wizard = that.getWizardControl();
			var note = wizard.getModel().getProperty("/note");
			var isS4HanaSystem = wizard.getModel().getProperty("/isS4HanaSystem");
			var name = that.nameTextField.getValue().trim();
			var resultName = validateName(name);
			
			if (resultName.isValid === false) {

				that.fireValidation({
					isValid: false,
					message: resultName.message,
					severity: resultName.severity
				});

				if (resultName.severity === "error") {
					that.markAsInvalid(that.nameTextField);
				}

				// if the name is invalid - disable the Browse button
				that.packageBrowseButton.setEnabled(false);

				return;
			}

			// after the name validation has passed, enable the description field
			descriptionTextField.setEnabled(true);

			// only if the name is validated and the note exists, and not in s4hana system - enable the Browse button
			if (isS4HanaSystem) {
			   that.packageBrowseButton.setEnabled(false); 
			}
			else if (note) { 
				that.packageBrowseButton.setEnabled(true);
			}

			var description = descriptionTextField.getValue().trim();
			var resultDescription = validateDescription(description);

			if (resultDescription.isValid === false) {

				that.fireValidation({
					isValid: false,
					message: resultDescription.message,
					severity: resultDescription.severity
				});

				if (resultDescription.severity === "error") {
					that.markAsInvalid(descriptionTextField);
				}

				return;
			}

			var packageName = that.packageTextField.getValue().trim();
			var resultPackage = validatePackage(packageName);

			if (resultPackage.isValid === false) {

				that.fireValidation({
					isValid: false,
					message: resultPackage.message,
					severity: resultPackage.severity
				});

				if (resultPackage.severity === "error") {
					that.markAsInvalid(that.packageTextField);
				}

				return;
			} else if (that.errorInPackageField) { // if an error exists in the package field, make sure the Next is still disabled
				that.fireValidation({
					isValid: false,
					message: that.errorInPackageField.message + that.getContext().i18n.getText("i18n", "CreateApplicationStep_AppExistsActionTaken"),
					severity: "error"
				});

				return;
			}

			// if the note doesn't exist, 
			// show an info message to install the note
			if ((!note)) {
			    if(isS4HanaSystem){
			        that.createApplicationStepInfo("CreateApplicationStep_NoteSummaryMsgs4Hana");
			    }else{
			        that.createApplicationStepInfo("CreateApplicationStep_NoteSummaryMsg");
			    }
				return;
			}

			that.fireValidation({
				isValid: true
			});
		};
	
		var validateName = function(name) {
			var result = {};

			if (name.length === 0) {
				result.isValid = false;
				result.message = that.getContext().i18n.getText("i18n", "CreateApplicationStep_EmptyNameErrorMsg");
				result.severity = "info";
				return result;
			}

			if (name.length > 15) {
				result.isValid = false;
				result.message = that.getContext().i18n.getText("i18n", "CreateApplicationStep_NameLimitCharErrorMsg");
				result.severity = "error";
				return result;
			}

			var RegEx = /^[a-zA-Z0-9_\/]+$/;
			if (!RegEx.test(name)) {
				result.isValid = false;
				result.message = that.getContext().i18n.getText("i18n", "CreateApplicationStep_RegexNameErrorMsg");
				result.severity = "error";
				return result;
			}

			result.isValid = true;

			return result;
		};

		var doesApplicationExists = function() {
		    // get the wizard model and get the applications promise
		    var model = that.oWizard.getModel();
			var inputName = that.nameTextField.getValue().trim();
			if(model.getProperty("/isS4HanaSystem")){//in case this is s4Hana we have to compare the name with the prefix
			    inputName = model.getProperty("/s4HanaAppNamePrefix") + inputName;
			}
			
			// run the promise and check if the application exists
			// go over all applications and check if the application exists
			for (var i = 0; i < model.applications.length; i++) {
				if (model.applications[i] && model.applications[i].title.toLowerCase() === inputName.toLowerCase()) {
					return Q(true);
				}
			}

			return Q(false);
		};

		var validateDescription = function(description) {
			var result = {};

			if (description.length === 0) {
				result.isValid = false;
				result.message = that.getContext().i18n.getText("i18n", "CreateApplicationStep_EmptyDescErrorMsg");
				result.severity = "info";
				return result;
			}

			if (description.length <= 60) {
				result.isValid = true;
				return result;
			} else {
				result.isValid = false;
				result.message = that.getContext().i18n.getText("i18n", "CreateApplicationStep_DescLimitCharErrorMsg");
				result.severity = "error";
				return result;
			}
		};

		var validatePackage = function(packageName) {
			var result = {};

			if (packageName.length === 0) {
				result.isValid = false;
				result.message = that.getContext().i18n.getText("i18n", "CreateApplicationStep_EmptyPackageErrorMsg");
				result.severity = "info";
				return result;
			} else {
				result.isValid = true;
				return result;
			}
		};
	};

	var removeNextStep = function() {
		lastStepRemoved = true;

		that.oWizard.removeSteps(stepIndex + 1);
		that.oWizard._steps[stepIndex].setNextStepIndex(undefined);
	};


	// we get here when a system is selected in the first step
	// and check if the note is installed
	var _onNoteStatusChange = function(oEvent) {
		var wizard = that.getWizardControl();
		wizard.getModel().setProperty("/selectedPackage", ""); //Clear selected package
		var model = wizard.getModel();
		if (oEvent.getParameter("id") === "noteStatus") {
			if (oEvent.getParameter("status") === "NOT_INSTALLED") {
				// if note not installed, set the package to be $TMP
				model.setProperty("/selectedPackage", "$TMP");
				model.setProperty("/note", false);
			} else if (oEvent.getParameter("status") === "INSTALLED") {
				model.setProperty("/note", true);
			}
			//		changeNameGrid(oEvent.getParameter("status"));

		}
	};

	var handleTransportsResponse = function(transportsResponse) {
		return that.oContext.service.transport.analyseTransportsResponse(transportsResponse).then(function(res) {
			// if status is "S" then data will hold the transports arrays.
			// if status is "E" then data will hold the error message .    
			// if status is "LOCKED" then data will hold the locking transport.
			// if status is "NOT_ASSAIGNED" then data will be empty.

			if (res.status === that.getConst().TRANSPORT_STATUS_E) { //Error
				that.errorInPackageField = {};
				that.errorInPackageField.message = res.data.message;
				return;
			}

			if (res.status === that.getConst().TRANSPORT_STATUS_LOCKED) { // LOCKED
				that.oWizard.getModel().setProperty("/selectedPackage", res.data.package);
				that.oWizard.getModel().setProperty("/transport", res.data.transport);
				that.fireValueChange({
					id: "transportStatus",
					status: "LOCKED"
				});
				removeNextStep();
				return;
			}

			if (res.status === that.getConst().TRANSPORT_STATUS_LOCAL_PACKAGE) { //LOCAL_PACKAGE
				removeNextStep();
				return;
			}

			if (res.status === that.getConst().TRANSPORT_STATUS_NOT_ASSAIGNED) { // NOT_ASSAIGNED
				//this app/package has no transport assigned and the package is not local (i.e. not $TMP) -> alow transport selection
				if (lastStepRemoved === true) {
					that.oWizard.removeFinishStep();
					that.oWizard.addTransportStep();
					lastStepRemoved = false;
				}
				return;
			}

			if (res.status === that.getConst().TRANSPORT_STATUS_S) { // Success
				if (lastStepRemoved === true) {
					that.oWizard.removeFinishStep();
					that.oWizard.addTransportStep();
					lastStepRemoved = false;
				}

				that.oWizard.getModel().userTransports = res.data.transports; // save the transports in the model
				return;
			}
		});
	};

	var _onBeforeRendering = function() {
    	if (sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.onBeforeRendering) {
			sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.onBeforeRendering.apply(this);
		}
		if (this.getModel().getProperty("/isS4HanaSystem")) {
			this.S4HanaPrefixTextField.setLayoutData(new sap.ui.layout.GridData({
				span: "L1 M8 S12"
			}));
			this.nameTextField.setLayoutData(new sap.ui.layout.GridData({
				span: "L4 M8 S12"
			}));

		} else {
			this.nameTextField.setLayoutData(new sap.ui.layout.GridData({
				span: "L5 M8 S12"
			}));
			this.nameContent.removeContent(this.S4HanaPrefixTextField);
		}
	};

	var _onAfterRendering = function() {
		if (!that.oContext) {
			//save context
			that.oContext = this.getContext();
			//save wizard
			that.oWizard = that.getWizardControl();
			stepIndex = that.oWizard.currentVisibleStep;
		}
		var isS4HanaSystem = that.oWizard.getModel().getProperty("/isS4HanaSystem");
		var noteStatus = that.oWizard.getModel().getProperty("/note");
		if ((noteStatus === false) || isS4HanaSystem) {
			removeNextStep();
			that.oWizard.getModel().setProperty("/note", false);
		}
// 		if(isS4HanaSystem){//in case we decide to show the message when entering the step
// 		     that.createApplicationStepInfo("CreateApplicationStep_NoteSummaryMsgs4Hana");
// 		}
	};

	var _cleanStep = function() {
		if (that.oWizard) {
			var oDataModel = that.oWizard.getModel().getData();
			oDataModel.name = "";
			oDataModel.description = "";
		//	oDataModel.selectedPackage = "";
		//	oDataModel.s4HanaAppNamePrefix = "";
		}

		lastStepRemoved = false;
	};

	return {
		metadata: {
			properties: {
				"wizardControl": "object",
				"packageDialog": "object",
				"xmlUtil": "object",
				"const": "object"
			}
		},
		init: _init,
		onAfterRendering: _onAfterRendering,
		onBeforeRendering: _onBeforeRendering,
		cleanStep: _cleanStep,
		renderer: {},
		onNoteStatusChange: _onNoteStatusChange,
		setFocusOnFirstItem: function() {
			this.nameTextField.focus();
		}
	};

}();

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.CreateApplicationStep",
	createApplicationStep);