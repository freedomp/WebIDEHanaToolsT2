define({

	getContent : function() {
	    var that = this;
	    return Q.sap.require("sap.watt.saptoolsets.fiori.abap.abaprepository/utils/ABAPRepositoryConstants").then(function(Constants){
    	    return Q.sap.require("sap/watt/platform/plugin/utils/xml/XmlUtil").then(function(xmlUtil){
        	        jQuery.sap.require("sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectApplicationStep");
            		var oSelectApplicationStep = new sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectApplicationStep({
            			context : that.context,
            			xmlUtil : xmlUtil,
            			const : Constants
            		});
            
            		var sTitle = that.context.i18n.getText("SelectApplicationStep_SelectApplication");
            		return that.context.service.wizard.createWizardStep(oSelectApplicationStep, sTitle, "");    
    	    });
	    });
	}
});
