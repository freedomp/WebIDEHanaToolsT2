define(
	[
		"sap/watt/lib/lodash/lodash",
		"../utils/W5gUtils",
		"../utils/ControlMetadata",
		"../utils/UsageMonitoringUtils",
		"../utils/W5gUi5LibraryMediator",
		"./W5gCommand",
		"../utils/DocuUtils",
		"../control/palette/ControlItem"
	],
	function (_, W5gUtils, ControlMetadata, UsageMonitoringUtils, W5gUi5LibraryMediator, W5gCommand, DocuUtils, ControlItem) {
		"use strict";

		return jQuery.extend({}, W5gCommand, {
			_buildItems: function (sAggregationType, oDesignTime, oScope) {
				return W5gUi5LibraryMediator.getSupportedControls(oDesignTime)
					.filter(function (oSupportedControlData) {
						return W5gUtils.isBaseOf(oSupportedControlData.name, sAggregationType, oScope);
					})
					.sort(function (o1, o2) {
						return o1.name.localeCompare(o2.name);
					});
			},

			/**
			 * add control functionality from the outline
			 * @return {Q}
			 * @see W5gCommand.execute
			 */
			execute: function () {
				var that = this;
				return this.context.service.ui5wysiwygeditor.getSelection().then(function (oResult) {
					var sAggregationName = _.get(oResult, "[0].aggregation");
					var sSelectedType = (sAggregationName ? "aggregation" : "control"),
						oWysiwygEditor = that.context.service.ui5wysiwygeditor;
					return Q.all([oWysiwygEditor.getCurrentSelectedControl(), oWysiwygEditor.getDesignTime(), oWysiwygEditor.getScope()])
						.spread(function (oParentControl, oDesignTime, oScope) {
							if (!oParentControl) {
								return;
							}
							if (sSelectedType === "control") {
								sAggregationName = W5gUtils.getContainerTargetAggregation(oParentControl);
							}
							var oAggregation = oParentControl.getMetadata().getAggregation(sAggregationName);
							if (!oAggregation) {
								return;
							}
							var oDialog, aContent;
							var sTargetAggregationType = oAggregation.type;
							var aItems = that._buildItems(sTargetAggregationType, oDesignTime, oScope);
							var oModel = new sap.ui.model.json.JSONModel(aItems);
							oModel.setSizeLimit(Infinity);
							DocuUtils.enrichControlInfos(aItems).then(function () {
								oModel.checkUpdate();
							}).done();

							if(aItems.length > 0) {
								var oSearch = new sap.ui.commons.SearchField({
									enableListSuggest: false,
									enableClear: true,
									startSuggestion: 0,
									width: "100%",
									suggest: function (oEvent) {
										var s = oEvent.getParameter("value").toLowerCase();
										var bHasChanges = false;
										oModel.getData().forEach(function (oItem) {
											var bVisible = oItem.name.toLowerCase().indexOf(s) !== -1;
											if (bVisible !== (oItem._visible === undefined || !!oItem._visible)) {
												bHasChanges = true;
											}
											oItem._visible = bVisible;
										});

										if (bHasChanges) {
											oModel.checkUpdate(true);
										}
									}
								});

								aContent = [oSearch, new sap.ui.commons.Panel({
									content: {
										path: "/",
										factory: function () {
											return new ControlItem({
												name: "{name}",
												title: "{title}",
												icon: "{icon}",
												visible: "{_visible}",
												press: function (oEvent) {
													oDialog.close();
													var sClassName = oEvent.getSource().getBindingContext().getProperty("name");
													UsageMonitoringUtils.report("outline_control_added", sClassName + ' [ ' + sAggregationName + ' ]');
													oWysiwygEditor.injectElementToAggregation(sClassName, sAggregationName).done();
												}
											});
										}
									},
									areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
									borderDesign: sap.ui.commons.enums.BorderDesign.None
								})];
							} else {
								var oMessage = new sap.ui.commons.Label({text: "{i18n>w5g_outline_no_available_control}"});
								aContent = [oMessage];
							}
							var sTitle = W5gUtils.getText("w5g_editor_command_add_control_dialog_title", [sAggregationName]);
							oDialog = new sap.ui.commons.Dialog({
								title: sTitle,
								resizable: false,
								autoClose: true,
								minWidth: "220px",
								content: aContent
							});
							oDialog.setModel(oModel);
							oDialog.addStyleClass("sapWysiwygControlAddDialog");
							W5gUtils.applyBundleTo([oDialog]);
							oDialog.open();
						});
				});
			},


			/**
			 * Command is enabled if "Copy" or "Cut" command was performed and there is a control to paste
			 *
			 * @return {Q<boolean>}
			 *
			 * @override W5gCommand.isEnabled
			 */
			isEnabled: function () {
				return W5gUtils.andBetweenTwoPromises(this.context.service.ui5wysiwygeditor.getSelection().then(function (oResult) {
						var oRes = oResult && oResult[0];
						if (!oRes) {
							return false;
						}
						return !!(oRes.control && oRes.aggregation ||
						oRes.control && !oRes.aggregation && ControlMetadata.isContainer(oRes.control));
					}),
					W5gCommand.isEnabled.apply(this));
			}
		});
	}
);
