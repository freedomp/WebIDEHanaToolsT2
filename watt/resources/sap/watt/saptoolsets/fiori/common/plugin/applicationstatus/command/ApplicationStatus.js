define({
	execute: function() {
		var that = this;
		var applicationStatusService = this.context.service.applicationstatus;
		var selectionService = this.context.service.selection;

		return selectionService.assertOwner(that.context.service.repositorybrowser).then(function() {
			return selectionService.assertNotEmpty().then(function(aSelection) {
				return applicationStatusService.openDialog(aSelection[0]);
			});
		});
	},

	isAvailable: function() {
		return true;
	},

	isEnabled: function() {
		var rbUtilsService = this.context.service.repositorybrowserUtils;
		return rbUtilsService.isSingleNoRootSelection(this.context.service).then(function(isSingleNoRootSelection) {
			return isSingleNoRootSelection;
		});
	}
});
