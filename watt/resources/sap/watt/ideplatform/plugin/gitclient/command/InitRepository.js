define(["sap/watt/ideplatform/plugin/gitclient/command/Constants"],
	function(Constants) {
		"use strict";
		return {
			execute: function() {
				var that = this;
				return this.context.service.selection.getSelection().then(function(aSelection) {
					return aSelection[0].document.getProject().then(function(oDocument) {
						return that.context.service.gitdispatcher.initRepository(oDocument, Constants._ACTIVATED_FROM_COMMAND);
					});
				});

			},
			isAvailable: function() {
				var that = this;
				return that.context.service.git.isFeatureSupported("initRepositoryCommand");
			},

			isEnabled: function() {
				return true;
			}
		};
	});