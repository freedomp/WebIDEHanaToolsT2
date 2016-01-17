define({

	execute : function(oTemplate) {
		var that = this;
		
		var sTemplateName="";
		if(oTemplate){
		    if(oTemplate === "more"){
		        sTemplateName = "more";
		    }else{
		        sTemplateName = oTemplate.getName();
		    }
		}

		return Q.sap.require("sap.watt.ideplatform.generationwizard/ui/ComponentGenerationWizard").then(function(ComponentGenerationWizard) {
			return that.context.service.selection.getSelection().then(function(aSelection) {
			    if (aSelection && aSelection.length === 1 && !aSelection[0].document.getEntity().isRoot()) {
			        if(sTemplateName === "more"){
			            ComponentGenerationWizard.openComponentWizardUI(that.context, aSelection[0].document);
			        }else{
			            ComponentGenerationWizard.openComponentWizardUIFromSecondStep(that.context, aSelection[0].document, oTemplate );
			        }
			    }
			});
		});
	},

	isAvailable : function() {
		return this.context.service.selection.isOwner(this.context.service.repositorybrowser);
	},

	isEnabled : function() {
		var selectionService = this.context.service.selection;
		return selectionService.assertOwner(this.context.service.repositorybrowser).then(function() {
			return selectionService.assertNotEmpty().then(function(aSelection) {
				return aSelection.length === 1 && !aSelection[0].document.getEntity().isRoot();
			});
		});
	}
});
