define(["sap/watt/ideplatform/plugin/gitclient/command/Constants"],
	function(Constants) {
		"use strict";
		return {


			execute: function() {
				var that = this;
				return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
					if (aSelection[0].document && aSelection[0].document.getEntity()) {
						return that.context.service.gitdispatcher.ignore(aSelection[0].document.getEntity(), Constants._ACTIVATED_FROM_COMMAND);
					}
				});
			},

            isAvailable: function() {

                var that = this;
                return that.context.service.git.isFeatureSupported("ignore");
            },
			isEnabled: function() {
				var selectionService = this.context.service.selection;
				return selectionService.assertNotEmpty().then(
					function(aSelection) {
						//Ignore can be called only on untracked files
						return aSelection[0].document && aSelection[0].stageTableRow.Status === "U" && !aSelection[0].stageTableRow.Stage;
					});
			}
		};
	});