jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.AddFinishStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

var stepContent = function() {

	var wizard;

	/*
	 * Initializes the step and creates its UI.
	 * Occurs once when the wizard is opened.
	 */
	var _init = function() {

		wizard = this;

		var openExtPaneCheckBox = new sap.ui.commons.CheckBox({
			text: "{i18n>ParentProjectStep_OpenExtPane}",
			checked: "{/openExtPane}",
			enabled: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L10 M12 S12",
				linebreak: true
			})
		});

		var checkboxesGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [openExtPaneCheckBox]
		});
		
		wizard.addContent(checkboxesGrid);
	};

	return {
	    init: _init,
	    renderer: {}
	};
}();

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
		"sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.AddFinishStepContent",stepContent);
