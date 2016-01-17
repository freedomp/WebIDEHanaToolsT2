define({
	execute : function() {
		var that = this;
		var selectionService = this.context.service.selection;
		return Q.sap.require("sap/watt/saptoolsets/fiori/abap/plugin/abaprepository/ui/wizard/DeployWizard").then(function(DeployWizard) {
		    return selectionService.assertOwner(that.context.service.repositorybrowser).then(function() {
		        return selectionService.assertNotEmpty().then(function(aSelection) {
		            return DeployWizard.openWizard(that.context, aSelection);
		        });
		    });
		});
	},

	isAvailable : function() {
		return true;
	},

    isEnabled : function() {
    	var that = this;
    	
    	return this.context.service.repositorybrowserUtils.isSingleFolderNotRootSelection().then(function(isSingleFolderNotRoot) {
    		if (isSingleFolderNotRoot) {
    			//check if deploy is currently in progress , if yes disable the command 
				//call sync methods synchronously on "non lazy proxy"
                return that.context.service.abaprepository.$().then(function(oNonLazyAbaprepositoryProxy) { //get the "non lazy proxy"
	                //"synchronous island"
	                return !oNonLazyAbaprepositoryProxy.getdeployInProgress();
                });    
    		}
    		
    		return false;
    	});
	}
});