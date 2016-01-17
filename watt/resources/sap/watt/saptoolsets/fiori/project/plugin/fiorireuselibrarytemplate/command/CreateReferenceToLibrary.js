define({

    
	execute : function() {
		var that = this;
		//TODO - should we use selection service as in importFile.js
		require([ "sap.watt.saptoolsets.fiori.project.fiorireuselibrarytemplate/ui/ReferenceLibraryDialog" ], function(ReferenceLibraryDialog) {
			ReferenceLibraryDialog.openDialogUI(that.context);
		});
	},

	isAvailable : function() {
	    if (sap.watt.getEnv("internal")) {
		    return true;
	    }
	    else
	    {
	        return false;
	    }
	},

	isEnabled : function() {
		var that = this;
		var selectionService = that.context.service.selection;
		return selectionService.assertOwner(that.context.service.repositorybrowser).then(function() {
		    	return selectionService.assertNotEmpty().then(function(aSelection) {
		    	    if ( aSelection.length === 1){
                        return that.context.service.libraryReference.isValidForReference()
		                .then(function(isValid){
		                    return isValid;     
		                })
		                .fail(function(){
		                    return false;
		                });                    		    	        
		    	    }else{
		    	        return false;
		    	    }
		    	});
		});
	}
});
