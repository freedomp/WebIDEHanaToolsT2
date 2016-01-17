define(["sap/watt/ideplatform/plugin/gitclient/command/Constants"],
	function(Constants) {
		"use strict";
		return {
			execute: function() {
				var that = this;
				return Q.all([that.context.service.selection.getSelection(), that.context.service.gitlog.setVisible(true, Constants._ACTIVATED_FROM_COMMAND)]).spread(function(aSelection) {
					if (aSelection[0] && aSelection[0].document && aSelection[0].document.getEntity()) {
						return that.context.service.gitlog.getLogHistory(aSelection[0].document);
					}
				});
			},

			isAvailable: function() {

				var that = this;
                return that.context.service.git.isFeatureSupported("GitHistory").then(function(isFeatureSupport){
                   if (isFeatureSupport) {
                        return Q.all([that.context.service.selection.getSelection().then(function(aSelection) {
                            if (aSelection && aSelection[0] && aSelection[0].document) {
                                return that.context.service.gitclient.isAvailable(aSelection[0].document);
                            }
                        }),that.context.service.selection.isOwner(that.context.service.repositorybrowser)]).spread(function(isGit, isRepositoryBrowser) {
                            return isGit && isRepositoryBrowser;
                        });
                    }
                   else{
                        return false;
                    }
                });
			},

			isEnabled: function() {
				var that = this;
				return that.context.service.selection.getSelection().then(function(aSelection) {
					return that.context.service.gitlog.isEnabled(aSelection);
				});
			}
		};
	});