jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.SelectExtensionStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.SelectTemplateStep");

var stepContent = function() {

	_cleanStep = function() {
		this.oDataSet.clearSelection();
	};

	return {
		cleanStep : _cleanStep,
		renderer : {}
	};
}();

sap.watt.ideplatform.plugin.generationwizard.ui.wizard.SelectTemplateStep.extend(
		"sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.SelectExtensionStep", stepContent);
