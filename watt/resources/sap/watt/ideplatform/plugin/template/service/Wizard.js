define({

	configure : function(mConfig) {
		if (mConfig.styles) {
			return this.context.service.resource.includeStyles(mConfig.styles);
		}
	},

	/**
	 * Creates a new wizard control object with the provided title, description, summary text, finish handler method,
	 * and array of the WizardStep objects to display in the wizard
	 *
	 * @param {String}		[sId]					Wizard control unique identifier
	 * @param {String}		[sTitle]				Wizard title text
	 * @param {String}		[sDescription]			Wizard description text
	 * @param {Array}		[aSteps]				Array of sap.watt.ideplatform.plugin.template.ui.wizard.WizardStep
	 * 												controls
	 * @param {Object}		[mFinishStepConfig]		This parameter allows customizing the UI of wizard's finish step.
	 * 												Can be one of two possible types: A. Configuration object with the
	 * 												following optional properties: 'summaryText' - holds the description
	 * 												of default summary text to display as confirm step description
	 * 												(can be changed by later by setSummary method).
	 * 												'finishStepContent' - holds a control extending the
	 * 												WizardStepContent which implements the confirm step UI and logic. B.
	 * 												String value with the same value as	'summaryText' property in option
	 * 												A.
	 * @param {Function}	[fnFinishHandler]		Handler method to be executed when finishing the wizard.
	 * 												Gets no parameters. Must return a Q-promise
	 * @param {Function}	[fnAfterCloseHandler]	Optional handler method to be executed after closing the wizard.
	 * 												Gets the close event
	 * @param {String}		sExitMessage			Optional custom text to display when closing the wizard before
	 * 												finish
	 * @returns {sap.watt.ideplatform.plugin.template.ui.wizard.WizardControl}
	 */
	createWizard : function(sId, sTitle, sDescription, aSteps, mFinishStepConfig, fnFinishHandler, fnAfterCloseHandler, sExitMessage) {
		jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardControl");
		var oWizard = null;
		var sSummary;
		var oFinishStepContent;
		if (mFinishStepConfig) {
		    if (typeof mFinishStepConfig === "string" || mFinishStepConfig instanceof String) {
		        // Support backwards compatibility - providing summary as simple string with no more configs
                sSummary = mFinishStepConfig;
		    } else {
		        sSummary = mFinishStepConfig.summaryText;
		        oFinishStepContent = mFinishStepConfig.finishStepContent;
		    }
		}
		if (!sSummary) {
		    sSummary = ""; // default value (as summary text is optional)
		}
		var mSettings = {
			context : this.context,
			title : sTitle,
			summary : sSummary,
			description : sDescription,
			steps : aSteps,
			openButtonVisible : false,
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			})
		};
		if (sId) {
			oWizard = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardControl(sId, mSettings);
		} else {
			oWizard = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardControl(mSettings);
		}
		oWizard.addStyleClass("wizardBody");
		if (oFinishStepContent) {
		    oWizard.setFinishStepContent(oFinishStepContent);
		}
		oWizard.setFinishHandler(fnFinishHandler);
		if (fnAfterCloseHandler) {
			oWizard.setAfterCloseHandler(fnAfterCloseHandler);
		}
		if (sExitMessage) {
			oWizard.setExitMessage(sExitMessage);
		}
		// Set default empty JSON model
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({});
		oWizard.setModel(oModel);

		return oWizard;
	},

	/**
	 * Creates a new wizard step control object with the provided title, description and WizardStepContent control
	 * object.
	 *
	 * @param {Object}	[oWizardStepContent]	An object extending the
	 * 											sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent control,
	 * 											displaying the step content
	 * @param {String}	[sTitle]				Wizard step title text
	 * @param {String}	[sDescription]			Wizard step description text
	 * @returns {sap.watt.ideplatform.plugin.template.ui.wizard.WizardStep}
	 */
	createWizardStep : function(oWizardStepContent, sTitle, sDescription) {
		oWizardStepContent.setLayoutData(new sap.ui.layout.GridData({
			span : "L12 M12 S12"
		}));

		jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStep");
		var oWizardStep = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardStep({
			title : sTitle,
			description : sDescription,
			stepContent : oWizardStepContent,
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			})
		});

		return oWizardStep;
	},
	/**
	 * @deprecated	Use createWizardStep instead.
	 */
	getWizardStep : function(oWizardStepContent, sTitle, sDescription) {
		//deprecated call
		return this.createWizardStep(oWizardStepContent, sTitle, sDescription);
	}
});
