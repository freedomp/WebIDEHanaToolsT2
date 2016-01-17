jQuery.sap.declare("sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.GeneralInfoStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

var generalInfoStep = function() {

	var that = null;
	var nameTextField;
	var descriptionTextField;
	var providerAccountComboBox;
	var oTableIntent;
	var account;
	var password;
	var email;
	var bAlreadyLoaded;

	/*
	 * Initializes the step and creates its UI.
	 * Occurs once when the wizard opens.
	 */
	var _init = function() {
		that = this;
		bAlreadyLoaded = false;

		// provider account name
		var providerAccountName = new sap.ui.commons.Label({
			required: true,
			text: "{i18n>GeneralInfoStep_providerAccountName}",
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		// providers DropdownBox
		providerAccountComboBox = new sap.ui.commons.DropdownBox({
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M8 S12"
			}),
			width: "100%",
			placeholder: "{i18n>GeneralInfoStep_providerAccountPlaceholder}",
			accessibleRole: sap.ui.core.AccessibleRole.Combobox
		});
		providerAccountComboBox.setEditable(true);

		// Name Grid
		var providerContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [providerAccountName, providerAccountComboBox]
		});

		this.addContent(providerContent);

		var getSelectedProvider = function() {

			var provider = null;

			if (providerAccountComboBox.getSelectedKey() === "") { // first empty item was selected
				return provider; // return null;
			}

			var selectedItemId = providerAccountComboBox.getSelectedItemId();
			var items = providerAccountComboBox.getItems();
			for (var i = 0; i < items.length; i++) {
				var item = providerAccountComboBox.getItems()[i];

				if (item.sId === selectedItemId) {
					provider = item.getModel();
				}
			}

			return provider;
		};

		var _validateAppName = function(liveValue) {

			var result = {};

			if (liveValue.length === 0) {
				result.isValid = false;
				result.message = that.getContext().i18n.getText("i18n", "GeneralInfoStep_EmptyNameInfoMsg");
				result.severity = "info";
				return result;
			}

			result.isValid = true;
			return result;
		};

		// This method checks if the selected provider account is valid.
		// It returns oProvider object with the validation's result 
		var handleProviderSelection = function(selectedProvider) {
			var oProviderResult = {};
			if (selectedProvider !== null && selectedProvider.getData() !== null) {
				selectedProvider = selectedProvider.getData();
				that.getModel().setProperty("/provider", selectedProvider);
				that.getModel().setProperty("/flpUrl", selectedProvider.url);

				if (selectedProvider.isAdmin === "true") {
					oProviderResult.isValid = true;
				} else {
					oProviderResult.isValid = false;
					oProviderResult.message = that.oContext.i18n.getText("i18n", "DeployToFLP_UnauthorizedtoRegisterFLP");
					oProviderResult.severity = "error";
				}
			} else {
				oProviderResult.isValid = false;
				oProviderResult.message = that.oContext.i18n.getText("i18n", "GeneralInfoStep_EmptyProviderAccountMsg");
				oProviderResult.severity = "info";

			}

			return oProviderResult;
		};

		var _handleAppName = function(oEvent) {
			var selectedProvider = getSelectedProvider();
			var oProviderResult = handleProviderSelection(selectedProvider);
			if (!oProviderResult.isValid) {
				that.fireValidation(oProviderResult);
				return;
			} else {

				var liveValue;
				if (oEvent) {
					liveValue = oEvent.getParameter("liveValue");
				} else {
					liveValue = nameTextField.getValue();
				}

				var validationResult = _validateAppName(liveValue);
				that.fireValidation(validationResult);
			}
		};

		providerAccountComboBox.attachChange(function() {
			that.fireProcessingStarted();

			// reset this data in the model so the requests will be executed
			// since a different subscription was selected
			var oModelData = that.getModel().getData();
			oModelData.sites = undefined;
			oModelData.groups = undefined;
			oModelData.contentPackages = undefined;
			oModelData.categories = undefined;

			_handleAppName();

			that.fireProcessingEnded();
		});

		// Name Label
		var nameLabel = new sap.ui.commons.Label({
			required: true,
			text: "{i18n>GeneralInfoStep_ApplicationName}",
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		// Name TextField
		nameTextField = new sap.ui.commons.TextField({
			value: "{/name}",
			tooltip: "{i18n>GeneralInfoStep_NameTooltip}",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M8 S12"
			}),
			liveChange: function(oEvent) {
				_handleAppName(oEvent);
			},
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});

		// Name Grid
		var NameContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [nameLabel, nameTextField]
		});

		this.addContent(NameContent);

		// Description Label
		var descriptionLabel = new sap.ui.commons.Label({
			text: "{i18n>GeneralInfoStep_Description}",
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		// Description TextField
		descriptionTextField = new sap.ui.commons.TextField({
			value: "{/description}",
			tooltip: "{i18n>GeneralInfoStep_DescriptionTooltip}",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M8 S12"
			}),
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});

		// Description Grid
		var descriptionContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [descriptionLabel, descriptionTextField]
		});

		this.addContent(descriptionContent);

		// Intent Label
		var intentLabel = new sap.ui.commons.Label({
			text: "{i18n>GeneralInfoStep_Intent}",
			tooltip: "{i18n>GeneralInfoStep_IntentTooltip}",
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		//Create an instance of the table control
		oTableIntent = new sap.ui.table.Table({
			visibleRowCount: 1,
			firstVisibleRow: 1,
			showNoData: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M8 S12"
			})
		});

		//Define the columns and the control templates to be used
		oTableIntent.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>GeneralInfoStep_SemanticObject}",
				tooltip: "{i18n>GeneralInfoStep_SemanticObjectTooltip}",
				design: "Bold"
			}),
			template: new sap.ui.commons.TextField({}).bindProperty("value", "semanticObject"),
			width: "50%"
		}));

		oTableIntent.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>GeneralInfoStep_Action}",
				tooltip: "{i18n>GeneralInfoStep_ActionTooltip}",
				design: "Bold"
			}),
			template: new sap.ui.commons.TextField({}).bindProperty("value", "action"),
			width: "50%"
		}));

		// intent Grid
		var intentContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [intentLabel, oTableIntent]
		});

		this.addContent(intentContent);
		
		var oIntentLink = new sap.ui.commons.Link({
			text: "{i18n>GeneralInfoStep_IntentLink}",
			target: "_blank",
			href: "https://help.hana.ondemand.com/cloud_portal_flp/frameset.htm?1a51a606964141579d14079455ac03b8.html"
		}).addStyleClass("IntentLink");
		
		this.addContent(oIntentLink);
	};

	//	populate providers comboBox
	var populateProvidersComboBox = function() {
		that.fireProcessingStarted();

		return that.getContext().service.fiorilaunchpad.getAllFlpSubscriptions(account, email, password).then(function(
			subscriptions) {
			if (subscriptions.length > 0) {
				that.getModel().setProperty("/allFioriSubscriptions", subscriptions);

				var subscription = null;
				var oItem = null;

				if (subscriptions.length > 0) {
					var firstListItem = new sap.ui.core.ListItem({
						text: ""
					});

					providerAccountComboBox.addItem(firstListItem);
				}

				for (var i = 0; i < subscriptions.length; i++) {
					subscription = subscriptions[i];
					oItem = new sap.ui.core.ListItem();
					oItem.setText(subscription.providerAccount + " (" + subscription.name + ")");
					var oSubscriptionJSON = new sap.ui.model.json.JSONModel(subscription);
					oItem.setModel(oSubscriptionJSON);
					oItem.setKey(i);
					providerAccountComboBox.addItem(oItem);
				}

				// if only one provider exists - select it
				if ((subscriptions.length === 1) && (oItem !== null)) {
					providerAccountComboBox.setSelectedKey(oItem.getKey());

					providerAccountComboBox.fireChange({
						"selectedItem": oItem
					});
					providerAccountComboBox.setEnabled(false);
				} else {
					providerAccountComboBox.setEnabled(true);
					// no provider selected
					that.fireValidation({
						isValid: false
					});
				}

				that.fireProcessingEnded();
				//that.providersLoaded = true;
				providerAccountComboBox.focus();
			} else {
				// there is no subscription for fiori launchpad in the account
				providerAccountComboBox.setEnabled(false);
				that.fireValidation({
					isValid: false,
					message: that.oContext.i18n.getText("i18n", "DeployToFLP_NoSubscriptiontoFLP"),
					severity: "error"
				});

				that.fireProcessingEnded();
			}
		});
	};

	/**
	 * Checks if the project is a cloud portal project. A cloud portal project is identified by having the
	 * cp.app.descriptor.json file under the root folder of the project.
	 *
	 * @param oProjectDocument  - The document of the project
	 * @private
	 * @returns true if the project is a cloud portal project, else otherwise.
	 */
	var _isCloudPortalProject = function(oProjectDocument) {
		return Q.sap.require("sap/watt/lib/lodash/lodash").then(function(_) {
			return oProjectDocument.getCurrentMetadata().then(function(oProjectFolderContentMetadata) {
				if (_.isArray(oProjectFolderContentMetadata)) {
					return _.find(oProjectFolderContentMetadata, function(oFileMetaData) {
						return oFileMetaData.name === "cp.app.descriptor.json";
					});
				}
				return false;
			});
		});
	};

	/**
	 * Executes validations on the project that need to be checked onAfterRendering of the wizard
	 *
	 * @param oContext			- Web-IDE context
	 * @param oProjectDocument  - The document of the project
	 * @private
	 */
	var _executeValidations = function(oContext, oProjectDocument) {
		//execute validations "in parallel"
		return Q.all([
			oContext.service.fiorilaunchpad.isComponentJsExist(oProjectDocument),
			_isCloudPortalProject(oProjectDocument)
		]).spread(function(bIsComponentJsExist, bIsCloudPortalProject) {
			if (bIsCloudPortalProject) {
				throw new Error(that.oContext.i18n.getText("i18n", "FioriLaunchpad_Service_Cloud_Portal_Project_Error"));
			} else if (!bIsComponentJsExist) {
				throw new Error(that.oContext.i18n.getText("i18n", "FioriLaunchpad_Service_Not_Fiori_App"));
			}
		});
	};

	var _onAfterRendering = function() {
		// Execute this flow only once (on first load)
		if (!bAlreadyLoaded) {
			bAlreadyLoaded = true;
			account = that.getModel().getData().account;
			email = that.getModel().getData().email;
			password = that.getModel().getData().password;

			providerAccountComboBox.setEnabled(false);

			if (!that.oContext) {
				//save context
				that.oContext = this.getContext();
				var oProjectDocument = that.getModel().getData().oProjectDocument;
				// entry point to the register wizard (can be from menu, after deploy dialog or from status dialog)
				var sEntryPoint = that.getModel().getData().sEntryPoint;
				// report when the wizard is opened
				that.oContext.service.usagemonitoring.report("deployment", "register_to_flp", "open_wizard_from_" + sEntryPoint).done();

				_executeValidations(that.oContext, oProjectDocument).then(function() {
					return that.oContext.service.hcpconnectivity.getHCPAppName(oProjectDocument, email, password, account);
				}).then(function(hcpAppName) {
					if (!hcpAppName) {
						throw new Error(that.oContext.i18n.getText("i18n", "DeployToFLP_AppIsNotDeployedMsg"));
					}
					//[RS] TODO: remove this 'return' after register to FLP on non default account bug will be solved 
					return that.oContext.service.hcpconnectivity.getHCPDefaultAccount().then(function(sDefaultAccount) {
						if (sDefaultAccount !== account) {
							throw new Error(that.oContext.i18n.getText("i18n", "DeployToFLP_AppIsNotDeployOnDefaultAccountMsg"));
						}

						that.getModel().setProperty("/hcpAppName", hcpAppName);
						// init the name with the selected project name
						var selectedProjectName = that.getModel().getData().selectedProjectName;
						that.getModel().setProperty("/name", selectedProjectName);
						that.getModel().setProperty("/intent", [{
							action: "Display",
							semanticObject: selectedProjectName
						}]);

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData({
							modelData: that.getModel().getData().intent
						});
						oTableIntent.setModel(oModel);
						oTableIntent.bindRows("/modelData");
					});
				}).then(function() {
					//populate providers combobox
					return populateProvidersComboBox().fail(function() {
						throw new Error(that.oContext.i18n.getText("i18n", "DeployToFLP_FLPProvidersFailure"));
					});
				}).fail(function(oError) {
					// Handle all errors the same way
					that.fireProcessingEnded();
					nameTextField.setEnabled(false);

					that.fireValidation({
						isValid: false,
						message: oError.message,
						severity: "error"
					});
				}).done();
			}
		}
	};

	var _cleanStep = function() {
		if (that.getModel()) {
			var oDataModel = that.getModel().getData();
			oDataModel.name = "";
			oDataModel.description = "";
		}
	};

	return {
		metadata: {
			properties: {
				"wizardControl": "object"
			}
		},
		init: _init,
		onAfterRendering: _onAfterRendering,
		cleanStep: _cleanStep,
		renderer: {},
		setFocusOnFirstItem: function() {
			descriptionTextField.focus();
		},
		// expose for testing
		_isCloudPortalProject: _isCloudPortalProject,
		_executeValidations: _executeValidations
	};
}();

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.GeneralInfoStep",
	generalInfoStep);