define({

	isAvailable : function() {
		//filter only for service selection
		var selectionService = this.context.service.selection;
		return selectionService.assertOwner(this.context.service.servicecatalog).then(function() {
			return selectionService.assertNotEmpty().then(function(aSelection) {
				return aSelection[0].document.getHasExpander() && aSelection[0].document.getExpanded();
			});
		});
	},

	isEnabled : function() {
		return true;
	},

	execute : function() {
		return this.context.service.selection.getSelection().then(function(aSelection) {
			var oNode = aSelection[0].document;
			if (oNode) {
				oNode.setExpanded(false);
				oNode.fireToggleOpenState(false);
			}
		});
	}

});
