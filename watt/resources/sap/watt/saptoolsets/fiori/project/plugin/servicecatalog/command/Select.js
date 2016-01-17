define({

	isAvailable : function() {
		//filter only for service selection
		var selectionService = this.context.service.selection;
		return selectionService.assertOwner(this.context.service.servicecatalog).then(function() {
			return selectionService.assertNotEmpty().then(function(aSelection) {
				return (!!aSelection[0].document.data('ServiceUrl') || !!aSelection[0].document.data('RDLPackage'));
			});
		});
	},

	isEnabled : function() {
		return true;
	},

	execute : function() {
		var servicecatalogService = this.context.service.servicecatalog;

		return this.context.service.selection.getSelection().then(function(aSelection) {
			return servicecatalogService.setSelectedNode(aSelection[0].document);
		});
	}

});
