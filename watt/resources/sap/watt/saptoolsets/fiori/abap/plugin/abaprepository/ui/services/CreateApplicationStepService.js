define({

	getContent : function() {
		var that = this;
		var aRequired = [];
 		aRequired.push(Q.sap.require("sap.watt.saptoolsets.fiori.abap.abaprepository/ui/dialog/PackageDialog"));
		aRequired.push(Q.sap.require("sap/watt/platform/plugin/utils/xml/XmlUtil"));
		aRequired.push(Q.sap.require("sap.watt.saptoolsets.fiori.abap.abaprepository/utils/ABAPRepositoryConstants"));

		return Q.all(aRequired).spread(function(PackageDialog, XmlUtil,Constants) {
			jQuery.sap.require("sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.CreateApplicationStep");
			var oCreateApplicationStep = new sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.CreateApplicationStep({
				context : that.context,
				packageDialog : PackageDialog,
				xmlUtil : XmlUtil,
				const : Constants
			});

			var sTitle = that.context.i18n.getText("CreateApplicationStep_CreateNewApplication");
			return that.context.service.wizard.createWizardStep(oCreateApplicationStep, sTitle, "");
		});
	}
});
