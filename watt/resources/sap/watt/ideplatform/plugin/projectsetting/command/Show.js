define({
	_firstTime : true,

	execute : function() {
		var that = this;
		return this.context.service.selection.getSelection().then(function(aSelection) {
			var oSelection = aSelection[0];
			if (oSelection && oSelection.document && (!oSelection.document.getEntity().isRoot())) {
				return that.context.service.projectsetting.setVisible(true, oSelection.document);
			} else {
				return false;
			}
		});

	},

	isAvailable : function() {
		return true;
	},

	isEnabled : function() {
		// This command works only in perspective 'development'
		var oPerspectiveService = this.context.service.perspective;
		var that = this;
		return oPerspectiveService.getCurrentPerspective().then(function(sPerspectiveName){
			return sPerspectiveName == 'development' &&
				that.context.service.selection.getSelection().then(function(aSelection) {
					var oSelection = aSelection[0];
					if (aSelection.length === 1 && oSelection && oSelection.document
						&& (!oSelection.document.getEntity().isRoot())) {
						return true;
					} else {
						return false;
					}
				});
		});
	}
});
