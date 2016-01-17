define({
	getContent : function() {
	    var that = this;
	    
	        jQuery.sap.require("sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.ConfigureTileStep");
    		var oConfigureTileStep = new sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.ConfigureTileStep({
     			context : that.context
    		});
    
    		var sTitle = that.context.i18n.getText("ConfigureTileStep_ConfigureTile");
    		return that.context.service.wizard.createWizardStep(oConfigureTileStep, sTitle, "");
	}
});