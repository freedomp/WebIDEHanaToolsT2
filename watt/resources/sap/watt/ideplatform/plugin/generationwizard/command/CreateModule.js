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

		return Q.sap.require("sap.watt.ideplatform.generationwizard/ui/ProjectGenerationWizard").then(function(ProjectGenerationWizard) {
			return that.context.service.selection.getSelection().then(function(aSelection) {
			    if (aSelection && aSelection.length === 1 && !aSelection[0].document.getEntity().isRoot()) {
			        if(sTemplateName === "more"){
						ProjectGenerationWizard.openGenerationWizardUI(that.context, aSelection[0].document, "module");
			        }else{
						ProjectGenerationWizard.openGenerationWizardUIFromSecondStep(that.context, aSelection[0].document, oTemplate );
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
