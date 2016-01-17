define(["sap/watt/ideplatform/plugin/gitclient/command/Constants"],
	function(Constants) {
		"use strict";
		return {

			execute: function() {
				var that = this;
				var bTag = true;
				return this.context.service.selection.getSelection().then(function(aSelection) {
					aSelection[0].document.getProject().then(function() {
						var oEntity = aSelection[0].document.getEntity();
						return that.context.service.git.getRepositoryConfigurations(oEntity.getBackendData().git).then(function(aSettings) {
							var bGerrit = false;
							for (var i = 0; i < aSettings.length; i++) {
								if (aSettings[i].Key === "gerrit.createchangeid") {
									bGerrit = aSettings[i].Value === "true";
									break;
								}
							}
							return that.context.service.gitdispatcher.pushTo(oEntity, bGerrit, bTag, Constants._ACTIVATED_FROM_COMMAND);
						}).fail(function() {
							return that.context.service.gitdispatcher.pushTo(oEntity, false, bTag, Constants._ACTIVATED_FROM_COMMAND);
						});
					});
				});

			},

			isAvailable: function() {
				var that = this;
				return Q.all([this.context.service.selection.getSelection().then(function(aSelection) {
					if (aSelection && aSelection[0] && aSelection[0].document) {
						return that.context.service.gitclient.isAvailable(aSelection[0].document);
					}
				}), this.context.service.selection.isOwner(this.context.service.repositorybrowser)]).spread(function(isGit, isRepositoryBrowser) {
					return isGit && isRepositoryBrowser;
				});
			},

			isEnabled: function() {
				var that = this;
				return this.context.service.selection.getSelection().then(function(aSelection) {
					return that.context.service.gitclient.isEnabled(aSelection);
				});
			}
		};
	});