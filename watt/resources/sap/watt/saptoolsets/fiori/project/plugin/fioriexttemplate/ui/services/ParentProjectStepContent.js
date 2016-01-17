define({
	getContent : function() {
		var that = this;
		var promises = [];
		promises.push(Q.sap.require("sap.watt.saptoolsets.fiori.project.fioriexttemplate/ui/dialogs/RemoteDialog"));
		promises.push(Q.sap.require("sap.watt.saptoolsets.fiori.project.fioriexttemplate/ui/dialogs/LocalDialog"));
		promises.push(this.context.service.applicationsdialogservice.getContent());

		return Q.all(promises).spread(function(RemoteDialog, LocalDialog, ApplicationsDialog) {
			jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ParentProjectStepContent");
			var oParentProjectStepContent = new sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ParentProjectStepContent({
				context : that.context,
				localDialog : LocalDialog,
				remoteDialog : RemoteDialog,
				applicationsDialog : ApplicationsDialog
			});

			var sTitle = that.context.i18n.getText("ExProjWizard_ParentProjectAndName");
			return that.context.service.wizard.createWizardStep(oParentProjectStepContent, sTitle, "");
		});
	}
});
