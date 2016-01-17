define({

	execute : function() {
        var that = this;
        this.context.service.selection.getSelection().then(function(aSelection) {
        var oSelection = aSelection[0];
        var oDocument = oSelection.document;
        that.context.service.configurations.openMainDialog(oDocument);
        });
    },
    
    
    isAvailable : function() {
		var that = this;
		return Q.all([ this.context.service.selection.getSelection().then(function(aSelection) {
			if (aSelection && aSelection[0] && aSelection[0].document) {
				return that.context.service.gitclient.isAvailable(aSelection[0].document);
			}
		}), this.context.service.selection.isOwner(this.context.service.repositorybrowser) ]).spread(function(isGit, isRepositoryBrowser) {
			return isGit && isRepositoryBrowser;
		});
	},
    

	isEnabled : function() {
		var that = this;
		return this.context.service.selection.getSelection().then(function(aSelection) {
			return that.context.service.gitclient.isEnabled(aSelection);
		});
	}
});