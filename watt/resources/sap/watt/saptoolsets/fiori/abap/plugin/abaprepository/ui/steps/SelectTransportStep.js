jQuery.sap.declare("sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectTransportStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

var selectTransportStep = function() {

	var that = null;
	var oChooseRequestRadioButton = null;

	/**
	 * Initializes the step and creates its UI.
	 * Occurs once when the wizard opens.
	 */
	var _init = function() {

		that = this;

		sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.abap.abaprepository/ui/css/Deploy.css"));

/* **************************** #1 radio button: Choose from requests in which I am involved ************************************ */
		oChooseRequestRadioButton = new sap.ui.commons.RadioButton({
			text : "{i18n>SelectTransportStep_ChooseRequest}",
			selected : true,
			select : function() {
				if (this.getSelected()) {

					var oEvent = {};
					oEvent.mParameters = {};
					oEvent.mParameters.liveValue = that.chooseRequestTextField.getValue();
					// fire value change to the text field
					that.chooseRequestTextFieldChanged(oEvent);

					enableChooseRequestGroup(true);
					that.requestNumberTextField.setEnabled(false);
					that.newRequestTextField.setEnabled(false);

					var wizardModel = that.oWizard.getModel();

					// update the transport action in the model
					wizardModel.transportAction = "choose";
					// get the existing transports objects of the user
					var transports = wizardModel.userTransports;

					if (!(!transports || transports === "" || transports.length === 0))/* {
						//No transports in which this user involved
					} else*/ {
						// fill the table
						var tableModel = new sap.ui.model.json.JSONModel();
						tableModel.setData({
							modelData : transports
						});

						that.requestsTable.setModel(tableModel);
						that.requestsTable.bindRows("/modelData");
					}
				}
			}
		});

		this.addContent(oChooseRequestRadioButton);

		// Choose Request label
		this.chooseRequestLabel = new sap.ui.commons.Label({
			text : "{i18n>SelectTransportStep_RequestNumber}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S12"
			}),
			visible : true
		}).addStyleClass("wizardBody marginRight");

		// Choose Request TextField
		this.chooseRequestTextField = new sap.ui.commons.TextField({
			value : "",
			tooltip : "{i18n>SelectTransportStep_SelectRequestTooltip}",
			width : "100%",
			liveChange : function(oEvent) {
				that.chooseRequestTextFieldChanged(oEvent);
			},
			layoutData : new sap.ui.layout.GridData({
				span : "L5 M8 S12"
			}),
			editable : false
		});

		this.chooseRequestTextFieldChanged = function(oEvent) {
			var value;

			if (oEvent !== undefined) {
				value = oEvent.mParameters.liveValue;
				value = value.trim();

				// validate this field isn't empty
				var result = validateTransport(value);

				if (result.isValid === false) {

					that.fireValidation({
						isValid : false,
						message : result.message,
						severity : result.severity
					});

					if (result.severity === "error") {
						that.markAsInvalid(that.chooseRequestTextField);
					}

					return;
				}

				that.fireValidation({
					isValid : true
				});

				// set the value in the model
				var model = that.oWizard.getModel();
				model.transport = value;
			}
		};

		// Create the Table of transports requests
		this.requestsTable = new sap.ui.table.Table({
			visibleRowCount : 7,
			firstVisibleRow : 1,
			selectionMode : sap.ui.table.SelectionMode.Single,
			navigationMode : sap.ui.table.NavigationMode.Scrollbar,
			extension : [],
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			}),
			visible : true,
			noData : "{i18n>SelectTransportStep_NoData}"
		});

		// Define the columns and the control templates to be used
		this.requestsTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "{i18n>SelectTransportStep_TransportRequest}",
				design : "Bold"
			}),
			template : new sap.ui.commons.TextView().bindProperty("text", "transportRequest"),
			sortProperty : "transportRequest",
			width : "100%"
		}));

		this.requestsTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "{i18n>SelectTransportStep_User}",
				design : "Bold"
			}),
			template : new sap.ui.commons.TextView().bindProperty("text", "user"),
			sortProperty : "user",
			width : "100%"
		}));

		this.requestsTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "{i18n>SelectTransportStep_Target}",
				design : "Bold"
			}),
			template : new sap.ui.commons.TextView().bindProperty("text", "target"),
			sortProperty : "target",
			width : "100%"
		}));

		this.requestsTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "{i18n>SelectTransportStep_Text}",
				design : "Bold"
			}),
			template : new sap.ui.commons.TextView().bindProperty("text", "text"),
			sortProperty : "text",
			width : "100%"
		}));

		this.requestsTable.attachRowSelectionChange(function(oEvent) {
			if (oEvent.getParameter("rowContext") !== null) { // check if there is a selected row 

				var currentRowContext = oEvent.getParameter("rowContext");
				var selectedRowIndex = oEvent.getParameter("rowIndex");
				that.requestsTable.setSelectedIndex(selectedRowIndex);
				var selectedTransport = currentRowContext.getProperty("transportRequest");

				// update the transport in the model
				var model = that.oWizard.getModel();
				model.transport = selectedTransport;

				that.chooseRequestTextField.setValue(selectedTransport);

				that.fireValidation({
					isValid : true
				});
			}
		});

		this.requestsTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);

		// Choose Request Grid
		var chooseRequestContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ this.chooseRequestLabel, this.chooseRequestTextField, this.requestsTable ]
		});

		this.addContent(chooseRequestContent);

		var validateNewTransportDescription = function(description) {
			var result = {};

			if (description.length === 0) {
				result.isValid = false;
				result.message = that.getContext().i18n.getText("i18n", "SelectTransportStep_EmptyTransportDescriptionInfoMsg");
				result.severity = "info";
				return result;
			}
			
			if (description.length > 60) {
			    result.isValid = false;
				result.message = that.getContext().i18n.getText("i18n", "SelectTransportStep_LongTransportDescriptionInfoMsg");
				result.severity = "error";
				return result;
			}

			result.isValid = true;

			return result;
		};

/* **************************** #2 radio button: Create a new request ************************************ */
		var oCreateNewRequestRadioButton = new sap.ui.commons.RadioButton({
			text : "{i18n>SelectTransportStep_CreateNewRequest}",
			select : function() {
				if (this.getSelected()) {

					var oEvent = {};
					oEvent.mParameters = {};
					oEvent.mParameters.liveValue = that.newRequestTextField.getValue();

					// fire value change to the text field
					that.newRequestTextFieldChanged(oEvent);

					enableChooseRequestGroup(false);

					that.newRequestTextField.setEnabled(true);
					that.requestNumberTextField.setEnabled(false);

					var wizardModel = that.oWizard.getModel();
					// update the transport action in the model
					wizardModel.transportAction = "new";
				}
			}
		});

		this.addContent(oCreateNewRequestRadioButton);

		// New Request label
		var newRequestLabel = new sap.ui.commons.Label({
			text : "{i18n>SelectTransportStep_RequestDescription}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S12"
			})
		}).addStyleClass("wizardBody marginRight");

		// New Request TextField
		this.newRequestTextField = new sap.ui.commons.TextField({
			value : "",
			tooltip : "{i18n>SelectTransportStep_RequestDescriptionTooltip}",
			width : "100%",
			liveChange : function(oEvent) {
				that.newRequestTextFieldChanged(oEvent);
			},
			layoutData : new sap.ui.layout.GridData({
				span : "L5 M8 S12"
			})
		});

		this.newRequestTextFieldChanged = function(oEvent) {
			// validate this field isn't empty
			var value;

			if (oEvent !== undefined) {
				value = oEvent.mParameters.liveValue;
				value = value.trim();

				var result = validateNewTransportDescription(value);

				if (result.isValid === false) {

					that.fireValidation({
						isValid : false,
						message : result.message,
						severity : result.severity
					});

					if (result.severity === "error") {
						that.markAsInvalid(that.newRequestTextField);
					}

					return;
				}

				that.fireValidation({
					isValid : true
				});
				
				that.markAsValid(that.newRequestTextField);

				// set the value in the model
				var model = that.oWizard.getModel();
				model.transportDescription = value;
			}
		};

		// New Request explanation label
		var newRequestExplanationLabel = new sap.ui.commons.Label({
			text : "{i18n>SelectTransportStep_NewRequestExplanation}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				indent : "L3 M3 S2",
				span : "L12 M12 S12",
				linebreak : true
			})
		}).addStyleClass("wizardBody");

		// New Request Grid
		var newRequestContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ newRequestLabel, this.newRequestTextField, newRequestExplanationLabel ]
		});

		this.addContent(newRequestContent);

/* **************************** #3 radio button: Enter a request number ************************************ */
		var oRequestNumberRadioButton = new sap.ui.commons.RadioButton({
			text : "{i18n>SelectTransportStep_EnterRequestNumber}",
			select : function() {
				if (this.getSelected()) {

					var oEvent = {};
					oEvent.mParameters = {};
					oEvent.mParameters.liveValue = that.requestNumberTextField.getValue();

					// fire value change to the text field
					that.requestNumberTextFieldChanged(oEvent);

					//table radio button
					enableChooseRequestGroup(false);
					//existing transport radio button
					that.requestNumberTextField.setEnabled(true);
					//new request radio button
					that.newRequestTextField.setEnabled(false);

					var wizardModel = that.oWizard.getModel();

					// update the transport action in the model
					wizardModel.transportAction = "specify";
				}
			}
		});

		this.addContent(oRequestNumberRadioButton);

		// Request Number label
		var requestNumberLabel = new sap.ui.commons.Label({
			text : "{i18n>SelectTransportStep_RequestNumber}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S12"
			})
		}).addStyleClass("wizardBody marginRight");

		// Request Number TextField
		this.requestNumberTextField = new sap.ui.commons.TextField({
			value : "",
			tooltip : "{i18n>SelectTransportStep_ExistingRequestTooltip}",
			width : "100%",
			liveChange : function(oEvent) {
				that.requestNumberTextFieldChanged(oEvent);
			},
			layoutData : new sap.ui.layout.GridData({
				span : "L5 M8 S12"
			})
		});

		// Request Number Grid
		var requestNumberContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ requestNumberLabel, this.requestNumberTextField ]
		});

		this.addContent(requestNumberContent);

		this.requestNumberTextFieldChanged = function(oEvent) {
			// validate this field isn't empty
			var value;

			if (oEvent !== undefined) {
				value = oEvent.mParameters.liveValue;
				value = value.trim();

				var result = validateTransport(value);

				if (result.isValid === false) {

					that.fireValidation({
						isValid : false,
						message : result.message,
						severity : result.severity
					});

					if (result.severity === "error") {
						that.markAsInvalid(that.requestNumberTextField);
					}

					return;
				}

				that.fireValidation({
					isValid : true
				});

				// set the value in the model
				var model = that.oWizard.getModel();
				model.transport = value;
			}
		};

		var validateTransport = function(transport) {
			var result = {};

			if (transport.length === 0) {
				result.isValid = false;
				result.message = that.getContext().i18n.getText("i18n", "SelectTransportStep_EmptyTransportErrorMsg");
				result.severity = "info";
				return result;
			}

			result.isValid = true;

			return result;
		};

		var enableChooseRequestGroup = function(toEnable) {
			if (toEnable) {
				that.chooseRequestTextField.setEnabled(true);
				that.chooseRequestLabel.setVisible(true);
				that.requestsTable.setShowOverlay(false);
			} else {//disable
				that.chooseRequestTextField.setEnabled(false);
				that.chooseRequestLabel.setVisible(false);
				that.requestsTable.setShowOverlay(true);
			}
		};
	};

	var _onAfterRendering = function() {
		if (!that.oContext) {
			//save context
			that.oContext = this.getContext();
			//save wizard
			that.oWizard = that.getWizardControl();

			oChooseRequestRadioButton.fireSelect();
		}
	};

	var _cleanStep = function() {
	};

	return {
		metadata : {
			properties : {
				"wizardControl" : "object"
			}
		},
		init : _init,
		onAfterRendering : _onAfterRendering,
		cleanStep : _cleanStep,
		renderer : {}
	};

}();

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectTransportStep",
		selectTransportStep);