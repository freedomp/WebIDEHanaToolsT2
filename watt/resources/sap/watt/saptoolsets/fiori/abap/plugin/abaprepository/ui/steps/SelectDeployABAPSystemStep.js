jQuery.sap.declare("sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectDeployABAPSystemStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

var selectDeployABAPSystemStep = function() {

	var that = null;
	var stepIndex = null;

	sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.abap.abaprepository/ui/css/Deploy.css"));

	/*
	 * Initializes the step and creates its UI.
	 * Occurs once when the wizard opens.
	 */
	var _init = function() {
		that = this;
		this.destinationsLoaded = false;

		// first disable the Next button 
		that.fireValidation({
			isValid : false
		});

		// System label
		var systemLabel = new sap.ui.commons.Label({
			required : true,
			text : "{i18n>DeployWizard_System}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		this.destinationComboBox = sap.ui.getCore().byId("SelectDeployStep_ComboBox");
		if (this.destinationComboBox) {
			this.destinationComboBox.destroy();
		}

		// Systems DropdownBox
		this.destinationComboBox = new sap.ui.commons.DropdownBox("SelectDeployStep_ComboBox",{
			layoutData : new sap.ui.layout.GridData({
				span : "L4 M8 S12"
			}),
			width : "100%",
			placeholder: "{i18n>SelectDeployABAPSystemStep_SystemsPlaceholder}",
			accessibleRole : sap.ui.core.AccessibleRole.Combobox
		});
		this.destinationComboBox.setEditable(true);
		
		this.destinationComboBox.addDelegate({
		    onAfterRendering : function() {
		        if (that.destinationsLoaded) {
		           that.destinationComboBox.setEnabled(true);
            	   that.destinationComboBox.focus();
                } 
		    }
		});

		this.destinationComboBox.attachChange(function(oEvent) {
			if (!that.oWizard) {
				that.oWizard = that.getWizardControl();
			}

			var model = that.oWizard.getModel();

			//if we're here, it means the user changed the system -> clear persistence
			if (!oEvent.getParameter("firstTime")) {
				model.jsonDestination = undefined;
				model.name = undefined;
			}
			
			var destination = getSelectedDestination();

			if (destination === null) {
				_fireValidation(false); //don't allow the user to continue
				return; // do nothing
			} else if (destination.getData() === null) {
				_fireValidation(false); //don't allow the user to continue
			} else {
			    destination = destination.getData();
			}
			
			that.fireProcessingStarted();

			model.destination = destination;

			that.destinationComboBox.setTooltip(destination.description);

			_fireValidation(false); //don't allow the user to continue in the wizard until the validation is finished.

			that.oWizard.removeSteps(1);
			var selectedActionKey = that.oActionsRadioButtons.getSelectedItem().mProperties.key;
			that.oWizard.addSteps(selectedActionKey).then(function() {
				return _handleSelectedSystem();
			}).done();
		});

		// Systems Grid
		var systemsContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ systemLabel, this.destinationComboBox ]
		});

		this.addContent(systemsContent);

		this.oActionsRadioButtons = sap.ui.getCore().byId("SelectDeployStep_RadioButtons");
		if (this.oActionsRadioButtons) {
			this.oActionsRadioButtons.destroy();
		}

		// Create the RadioButtonGroup with two actions: create and update
		this.oActionsRadioButtons = new sap.ui.commons.RadioButtonGroup("SelectDeployStep_RadioButtons",{
			layoutData : new sap.ui.layout.GridData({
				span : "L5 M8 S12"
			}),
			width : "100%",
			accessibleRole : sap.ui.core.AccessibleRole.RadioGroup
		});

		var oAction = new sap.ui.core.Item({
			text : "{i18n>SelectDeployABAPSystemStep_CreateApplication}",
			key : "CreateKey"
		});

		this.oActionsRadioButtons.addItem(oAction);
		oAction = new sap.ui.core.Item({
			text : "{i18n>SelectDeployABAPSystemStep_UpdateApplication}",
			key : "UpdateKey"
		});
		this.oActionsRadioButtons.addItem(oAction);

		this.oActionsRadioButtons.attachSelect(function() {
			if (!that.oWizard) {
				that.oWizard = that.getWizardControl();
			}

			var wizardModel = that.oWizard.getModel();

			//user changed selection. if had persistence - it should be deleted
			wizardModel.jsonDestination = undefined;
			wizardModel.name = undefined;

			var selectedActionKey = that.oActionsRadioButtons.getSelectedItem().mProperties.key;

			// save the selected action in the model
			wizardModel.action = selectedActionKey;

			if (that.oWizard.removeSteps) { // check if the wizard which holds this step has remove step method
				that.oWizard.removeSteps(stepIndex + 1); //currently we are in the 1st step, and we need to remove the steps after it.
			}
			//add steps according to the selected action
			that.oWizard.addSteps(selectedActionKey).then(function() {
				if (wizardModel.destination) {
				    if (!wizardModel.getProperty("/isS4HanaSystem")) {
				        fireNoteStatusEvent(wizardModel);
				    }
				}
			}).done();
		});

		// Actions Grid
		var actionsContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ this.oActionsRadioButtons ]
		});

		this.addContent(actionsContent);
	};

	var fireNoteStatusEvent = function(wizardModel) {
		if (wizardModel.discoveryStatus) {
			var transportchecks = wizardModel.discoveryStatus.transportchecks;
			if (transportchecks) {
				//sent to createApplicationStep
				that.fireValueChange({
					id : "noteStatus",
					status : "INSTALLED"
				});
			} else {
				that.fireValueChange({
					id : "noteStatus",
					status : "NOT_INSTALLED"
				});
			}
		}
	};

	var _fireValidation = function(bIsValid, sErrorMessage, sSeverity) {
		var oValidation = {
			isValid : bIsValid
		};
		if (sErrorMessage) {
			oValidation.message = sErrorMessage;
		}
		if (sSeverity) {
			oValidation.severity = sSeverity;
		}
		that.fireValidation(oValidation);
	};

	var _handleS4Hana = function(oModel, sAtoSettings) {
		return that.oContext.service.abaprepository.getAtoSettings(sAtoSettings).then(function(settings) {
			if (settings.operationsType === "C") {// Cloud system, in this case we must use s4hana configuration
				if (settings.isExtensibilityDevSystem) {
					_handleS4HanaSettings(oModel, settings); //also throws validation error if data is missing
				} else { // Deployment is not allowed (e.g in cloud production)
					_fireValidation(false, that.oContext.i18n.getText("i18n", "ABAPRepositoryService_DeployFailed_DeploymentIsNotAllowed"), "error");
				}
			} else {//here the use of s4Hana configuration is not mandatory for extensibility
				oModel.setProperty("/isS4HanaSystem", false);
				fireNoteStatusEvent(oModel);
				_fireValidation(true);
			}
			that.fireProcessingEnded();
		});
	};

	var _handleS4HanaSettings = function(model, settings) {
		model.setProperty("/selectedPackage",settings.packageName);
		model.setProperty("/s4HanaAppNamePrefix",settings.prefixName);

		if (settings.packageName !== "" && settings.PrefixName !== "") {
			model.setProperty("/isS4HanaSystem",true);
			_fireValidation(true);

		} else {//no values in package or prefix
			_fireValidation(false, that.oContext.i18n.getText("i18n", "ABAPRepositoryService_DeployFailed_NoPackageAndPrefixConfiguredInAto"),"error");
		}
	};

	var handleSelectedSystemError = function(error, model) {
		if (error.status === 404) { // system is unavailable
			that.destinationComboBox.setSelectedKey("");
			_fireValidation(false, that.oContext.i18n.getText("i18n", "SelectDeployABAPSystemStep_SystemNotFound",
				[ model.destination.name ]), "error");

		} else if (error.status === 401) { // user is unauthorized
			that.destinationComboBox.setSelectedKey("");
			_fireValidation(false, error.statusText, "error");

		} else if (error.message.toLowerCase() === "unauthorized") { // the user has canceled the authentication popup
			that.destinationComboBox.setSelectedKey("");
			_fireValidation(false, "", "error");

		} else if (error.message === "Not Found") { // the server has not found any resource matching /sap/bc/adt/discovery
			that.destinationComboBox.setSelectedKey("");
			_fireValidation(false, that.oContext.i18n.getText("i18n", "SelectDeployABAPSystemStep_NotFoundDiscoveryResource"), "error");

		} else if (error.message === "Forbidden") { // No authorization to access the resource /sap/bc/adt/discovery
			that.destinationComboBox.setSelectedKey("");
			_fireValidation(false, that.oContext.i18n.getText("i18n", "SelectDeployABAPSystemStep_NoAuthorizationDiscoveryResource"), "error");

		} else {
			_fireValidation(false, error.message, "error");
		}
	};

	var _handleSelectedSystem = function(){
		if (!that.oWizard) {
			that.oWizard = that.getWizardControl();
		}

		var model = that.oWizard.getModel();

		return that.oContext.service.discovery.getStatus(model.destination).then(function(discoveryStatus) {
			model.discoveryStatus = discoveryStatus;
			model.csrf = discoveryStatus.csrfToken; //save the csrf token

			if (model.discoveryStatus.filestore_ui5_bsp) { //check if UI5 BSP Repository is installed on the ABAP system
				return that.oContext.service.abaprepository.getApplications(model.discoveryStatus).then(function(applications) {
					model.applications = applications;
					if (discoveryStatus.ato_settings) {
						_handleS4Hana(model, discoveryStatus.ato_settings).fail(function(error) {
							that.destinationComboBox.setSelectedKey("");
							_fireValidation(false, that.oContext.i18n.getText("i18n", "SelectDeployABAPSystemStep_ConfigurationsNotFound"), "error");
							that.oContext.service.log.error("abapDeployment" , that.oContext.i18n.getText("i18n", "SelectDeployABAPSystemStep_AtoSettingsNotFound", model.destination.name), ["user"]).done();
						}).done();
					} else {//ATO service doesn't exist-in this case this is not S4HANA
						model.setProperty("/isS4HanaSystem", false);
						fireNoteStatusEvent(model);
						_fireValidation(true);
						that.fireProcessingEnded();
					}

					that.oWizard.setModel(model);
				});
			} else { // An entry for UI5 BSP Repository was not found in the discovery xml - it should be installed
				var errorMessage = that.oContext.i18n.getText("i18n", "ABAPRepositoryService_DeployFailed_filestoreui5bspNotFound");
				_fireValidation(false, errorMessage, "error");
			}

		}).fail(function(error) {
			handleSelectedSystemError(error, model);
		}).finally(function() {
			that.fireProcessingEnded();
		});
	};
	
	// we get here when a system is selected in the first step
	// and check if the note is installed
	// same event as in createApplictionStep, but for update flow we attach this one.
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
		}
	};

	var getSelectedDestination = function() {
		var destination = null;

		if (that.destinationComboBox.getSelectedKey() === "") { // first empty item was selected
			return destination; // return null;
		}

		var selectedItemId = that.destinationComboBox.getSelectedItemId();
		var items = that.destinationComboBox.getItems();
		for ( var i = 0; i < items.length; i++) {
			var item = that.destinationComboBox.getItems()[i];
			if (item.sId === selectedItemId) {
				destination = item.getModel();
			}
		}

		return destination;
	};
	
	var getItem = function(destinationName) {

		var destination = null;

		var items = that.destinationComboBox.getItems();
		for ( var i = 0; i < items.length; i++) {
			var item = that.destinationComboBox.getItems()[i];
			var data = item.getModel().getData();
			if (data && data.name === destinationName) {
				destination = item;
			}
		}

		return destination;
	};

	// populate destination comboBox
	var populateDestinationComboBox = function() {
		
		var destinations = that.oContext.service.destination.getDestinations("dev_abap", true, "description");
		return destinations.then(function(foundDestinations) {
			destinations = foundDestinations;

			var destination = null;
			var oItem = null;

			if (destinations.length > 0) {
				var firstListItem = new sap.ui.core.ListItem({
					text : ""
				});

				that.destinationComboBox.addItem(firstListItem);
			}

			for ( var i = 0; i < destinations.length; i++) {
				destination = destinations[i];

				oItem = new sap.ui.core.ListItem();
				oItem.setText(destination.description);
				var oDestinationJSON = new sap.ui.model.json.JSONModel(destination);
				oItem.setModel(oDestinationJSON);
				oItem.setKey(i);
				that.destinationComboBox.addItem(oItem);
			}

			// if only one destination exists - select it
			if ((destinations.length === 1) && (oItem !== null)) {
				that.destinationComboBox.setSelectedKey(oItem.getKey());

				that.destinationComboBox.fireChange({
					"selectedItem" : oItem
				});
			}

			that.fireProcessingEnded();
			that.destinationsLoaded = true;
			that.destinationComboBox.setEnabled(true);
			that.destinationComboBox.focus();
		});
	};

	var _onAfterRendering = function() {

		// only in the first time we get the context 
		// populate the destinations comboBox
		if (!that.oContext) {
			//save context
			that.oContext = this.getContext();
			
			populateDestinationComboBox().then(function() {
			    that.destinationComboBox.setEnabled(true);
			    that.destinationComboBox.focus();

			    //save wizard
				that.oWizard = that.getWizardControl();
	
				// save the selected action in the model.
				// this is for the case of entering the wizard for the first time
				var wizardModel = that.oWizard.getModel();
				stepIndex = that.oWizard.currentVisibleStep;
				var items = that.oActionsRadioButtons.getItems();
				if (wizardModel.jsonDestination) { //deploy second time
					var oItem = getItem(wizardModel.jsonDestination);
					if (!oItem) { // system item not found. print to log to alert to developer, and allow him to create a new application
						that.oActionsRadioButtons.setSelectedItem(items[0]);
						wizardModel.action = "CreateKey";
					} else {
						that.oActionsRadioButtons.setSelectedItem(items[1]);
						wizardModel.action = "UpdateKey";
						that.destinationComboBox.setValue(wizardModel.jsonDestination);
						that.destinationComboBox.setSelectedKey(oItem.getKey());
						that.destinationComboBox.fireChange({
							"selectedItem" : oItem ,
							"firstTime" : "true"   //this will indicate not to clear persistence information on system change this time
						});
					}
				}
				else { //first time of deployment
					that.oActionsRadioButtons.setSelectedItem(items[0]);
					wizardModel.action = "CreateKey";
				}
			
			}).fail(function() {
			    that.fireProcessingEnded();

			    that.fireValidation({
					isValid : false,
					message : that.oContext.i18n.getText("i18n", "DeployPersistence_UnableToLoadDestinations"),
					severity : "error"
				});
			}).done();
		}

		if (!this.destinationsLoaded) {
		    that.destinationComboBox.setEnabled(false);
			this.fireProcessingStarted();
		} else {
		    that.destinationComboBox.setEnabled(true);
			that.destinationComboBox.focus();
		}
	};

	// for testing purposes
	var _setContextForTesting = function(oContext) {
		that.oContext = oContext;
	};
	
	return {
		metadata : {
			properties : {
				"wizardControl" : "object"
			}
		},
		init : _init,
		onNoteStatusChange: _onNoteStatusChange,
		onAfterRendering : _onAfterRendering,
		renderer : {},
		setContextForTesting : _setContextForTesting,
		handleSelectedSystem : _handleSelectedSystem,
		handleS4Hana : _handleS4Hana,
		handleS4HanaSettings : _handleS4HanaSettings
	};
}();

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
		"sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectDeployABAPSystemStep", selectDeployABAPSystemStep);