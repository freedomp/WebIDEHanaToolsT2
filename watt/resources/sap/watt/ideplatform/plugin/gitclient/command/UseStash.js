define(["sap/watt/ideplatform/plugin/gitclient/command/Constants"],
	function(Constants) {
		"use strict";
		return {
			execute: function() {
				var that = this;
				return this.context.service.selection.getSelection().then(function(aSelection) {
					return aSelection[0].document.getProject().then(function(oDocument) {
						return that.context.service.gitdispatcher.useStash(oDocument.getEntity(), Constants._ACTIVATED_FROM_COMMAND);
					});
				});

			},

			isAvailable: function() {
				var that = this;
				return Q.all([this.context.service.selection.getSelection().then(function(aSelection) {
					if (aSelection && aSelection[0] && aSelection[0].document) {
						return that._isStashSupported(aSelection[0].document).then(function(bIsStashSupported) {
							return that.context.service.gitclient.isAvailable(aSelection[0].document).then(function(bIsAvailable) {
								return bIsAvailable && bIsStashSupported;
							});
						});

					}
				}), this.context.service.selection.isOwner(this.context.service.repositorybrowser)]).spread(function(isGit, isRepositoryBrowser) {
					return isGit && isRepositoryBrowser;
				});
			},

			isEnabled: function() {
				var that = this;
				return this.context.service.selection.getSelection().then(function(aSelection) {
					var oEntity = aSelection[0].document.getEntity();
					return Q.all([that.context.service.gitclient.isEnabled(aSelection),
			              that.context.service.gitdispatcher.isStashAvailable(oEntity)]).spread(function(bGitEnabled, bStashAvailable) {
						return bGitEnabled && bStashAvailable;
					});
				});
			},

			_isStashSupported: function(oDocument) {
				var that = this;
				var oGit = oDocument.getEntity().getBackendData().git;
				if (!oGit) {
					return Q(false);
				} else {
					return this.context.service.git.isFeatureSupported("gitStashSupported").then(function(bGitStashSupported) {
						if (bGitStashSupported){
							return that.context.service.git.isStashSupported(oGit);
						}	
						else{
							 return Q(false);
						}
					});
					
					
				}
			}
		};
	});