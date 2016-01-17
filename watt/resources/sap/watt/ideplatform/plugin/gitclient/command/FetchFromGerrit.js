define(["sap/watt/ideplatform/plugin/gitclient/command/Constants"], 
    function(Constants){
    "use strict";
	return {
		execute: function() {
			var that = this;
			return this.context.service.selection.getSelection().then(function(aSelection) {
				aSelection[0].document.getProject().then(function(oDocument) {
					return that.context.service.gitdispatcher.fetchFromGerrit(oDocument.getEntity(), Constants._ACTIVATED_FROM_COMMAND);
				});
			});
		},

		isAvailable: function() {
			var that = this;
            return that.context.service.git.isFeatureSupported("Gerrit").then(function(iGerritSupport) {
                if (iGerritSupport) {
                    return Q.all([that.context.service.selection.getSelection().then(function(aSelection) {
                        if (aSelection && aSelection[0] && aSelection[0].document) {
                            return that.context.service.gitclient.isAvailable(aSelection[0].document);
                        }
                    }), that.context.service.selection.isOwner(that.context.service.repositorybrowser)]).spread(function(isGit, isRepositoryBrowser) {
                        return isGit && isRepositoryBrowser && !!sap.watt.getEnv("internal");
                    });
                }else{
                    return false;
                }
            });

		},

		isEnabled: function() {
			var that = this;
			return this.context.service.selection.getSelection().then(function(aSelection) {
				return that.context.service.gitclient.isEnabled(aSelection).then(function(oResult) {
					return oResult && !!sap.watt.getEnv("internal");
				});
			});
		}
	};
});