/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["require", "../util/ResourceLoader"], function(require, ResourceLoader) {
	"use strict";
	return {
		execute: function() {
		    var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
			return this.context.service.content.getCurrentEditor().then(function(oCurEditor) {

				if (oCurEditor && oCurEditor.getModel) {
					return oCurEditor.getModel().then(function(aModel) {
						if (aModel) {
							if (aModel.columnView && aModel.columnView.getDefaultNode && aModel.columnView.getDefaultNode().type === "Script") {
								sap.ui.commons.MessageBox.show(
									resourceLoader.getText("msg_performance_analysis_for_script_views"),
									sap.ui.commons.MessageBox.Icon.INFORMATION,
									resourceLoader.getText("tit_performance_analysis"), [sap.ui.commons.MessageBox.Action.OK]
								);
							} else {
								require(["../viewmodel/commands"], function(commands) {
									var ViewModelEvents = commands.ViewModelEvents;
									var events = aModel.columnView.$getEvents();
									events.publish(ViewModelEvents.PERFORMANCE_ANALYSIS_CHANGED);
								});
							}
						}
					});
				}
			});
		},

		isAvailable: function() {
			var selectionService = this.context.service.selection;
			return selectionService.assertNotEmpty().then(function(aSelection) {
				var document = aSelection[0].document;
				if (document === null || document.getType() !== "file") {
					return false;
				}

				var extension = document.getEntity().getFileExtension();
				return extension === "calculationview";
			});
		},

		isEnabled: function() {
			return true;
		}
	};
});
