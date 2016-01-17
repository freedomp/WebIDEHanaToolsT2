jQuery.sap.require("sap.suite.ui.generic.template.library");
jQuery.sap.require("sap.suite.ui.generic.template.lib.TemplateComponent");
jQuery.sap.require("sap.suite.ui.generic.template.js.AnnotationHelper");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.declare("sap.suite.ui.generic.template.ObjectPage.Component");

sap.suite.ui.generic.template.lib.TemplateComponent.extend("sap.suite.ui.generic.template.ObjectPage.Component", {
	metadata: {
		library: "sap.suite.ui.generic.template",
		properties: {
			"templateName": {
				"type": "string",
				"defaultValue": "sap.suite.ui.generic.template.ObjectPage.view.Details"
			},
			"attachmentSupport": "boolean",
			"showRelatedApps": "boolean"
		},
		"manifest": "json"
	},
	updateBindingContext: function () {
		"use strict";

		sap.suite.ui.generic.template.lib.TemplateComponent.prototype.updateBindingContext.apply(this, arguments);
		var that = this;

		var oBindingContext = this.getBindingContext();
		if (oBindingContext) {
			this.getModel().getMetaModel().loaded().then(function () {
				var oUIModel = that.getModel("ui");

				// set draft status to blank according to UI decision
				oUIModel.setProperty("/draftStatus", '');

				var oActiveEntity = oBindingContext.getObject();
				if (oActiveEntity) {

					var oDraftController = that.getAppComponent().getTransactionController().getDraftController();
					var oDraftContext = oDraftController.getDraftContext();
					var bIsDraft = oDraftContext.hasDraft(oBindingContext) && !oActiveEntity.IsActiveEntity;
					var bHasActiveEntity = oActiveEntity.HasActiveEntity;
					if (that.getCreateMode()) {
						oUIModel.setProperty("/createMode", true);
						oUIModel.setProperty("/editable", true);
						oUIModel.setProperty("/enabled", true);
					} else {
						if (bIsDraft) {
							if (bHasActiveEntity) {
								oUIModel.setProperty("/createMode", false);
								oUIModel.setProperty("/editable", true);
								oUIModel.setProperty("/enabled", true);
							} else {
								oUIModel.setProperty("/createMode", true);
								oUIModel.setProperty("/editable", true);
								oUIModel.setProperty("/enabled", true);
							}
						} else {
							oUIModel.setProperty("/createMode", false);
							oUIModel.setProperty("/editable", false);

							if (oActiveEntity.hasOwnProperty("HasDraftEntity") && oActiveEntity.HasDraftEntity && oDraftContext.hasSiblingEntity(that.getEntitySet())) {
								oUIModel.setProperty("/enabled", false);
								that.getModel().read(oBindingContext.getPath(), {
										urlParameters: {'$expand': "SiblingEntity,DraftAdministrativeData"},
										success: function (oResponseData) {
											var oSiblingContext = {};
											if (oResponseData.hasOwnProperty("SiblingEntity")) {
												oSiblingContext = that.getModel().getContext("/" + that.getModel().getKey(oResponseData.SiblingEntity));
											}
											if (oSiblingContext) {
												var oSiblingEntity = oSiblingContext.getObject();
												if (oSiblingEntity && oSiblingEntity.hasOwnProperty("IsActiveEntity") && oSiblingEntity.IsActiveEntity === false) {
													var oResourceBundle = that.getModel("i18n").getResourceBundle();
													var oModel = that.getModel();
													var oMetaModel = oModel.getMetaModel();
													var oModelEntitySet = oMetaModel.getODataEntitySet(that.getEntitySet());
													var oDataEntityType = oMetaModel.getODataEntityType(oModelEntitySet.entityType);

													var sType = "";
													var sPath;
													//TODO: not use String directly but Thomas Ch. helpers, sometimes the value is behind a path
													//to do so best way would be to extract this in a DraftResumeDialoge
													//determining the value from an annotation path is not yet supported
													if (oDataEntityType["com.sap.vocabularies.Common.v1.Label"]) {
														sType = oDataEntityType["com.sap.vocabularies.Common.v1.Label"].String;
														if (sType === "") {
															sPath = oDataEntityType["com.sap.vocabularies.Common.v1.Label"].Path;
															if (sPath) {
																sType = oActiveEntity[sPath];
															}
														}
													}
													if (oDataEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"] && oDataEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"].TypeName) {
														if (sType === "") {
															sType = oDataEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"].TypeName.String;
														}
														if (sType === "") {
															sPath = oDataEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"].TypeName.Path;
															if (sPath) {
																sType = oActiveEntity[sPath];
															}
														}
													}

													var sObjectKey = "";
													var aSemKey = oDataEntityType["com.sap.vocabularies.Common.v1.SemanticKey"];
													for (var i in aSemKey) {
														var oPropertyRef = aSemKey[i];
														if (sObjectKey === "") {
															sObjectKey = oActiveEntity[oPropertyRef.PropertyPath];
														} else {
															sObjectKey = sObjectKey + "-" + oActiveEntity[oPropertyRef.PropertyPath];
														}
													}

													var sChangedAt = "-";
													if (oResponseData.DraftAdministrativeData !== null && oResponseData.DraftAdministrativeData.LastChangeDateTime !== null) {
														var oDateFormatter = sap.ui.core.format.DateFormat.getDateTimeInstance({
															pattern: "MMMM d, yyyy HH:mm",
															style: "long"
														});
														sChangedAt = oDateFormatter.format(oResponseData.DraftAdministrativeData.LastChangeDateTime);
													}

													var aParams = [sType, sObjectKey, sChangedAt];
													var sDraftFoundText = oResourceBundle.getText("DRAFT_FOUND_RESUME", aParams);

													var oDialog = new sap.m.Dialog({
															title: oResourceBundle.getText("WARNING"),
															type: 'Message',
															state: 'Warning',
															content: new sap.m.Text({text: sDraftFoundText}),
															buttons: [
																new sap.m.Button({
																	text: oResourceBundle.getText("RESUME"),
																	press: function () {
																		oDialog.close();
																		that.getAppComponent().getNavigationController().navigateToContext(oSiblingContext, null, true);
																	}
																}),
																new sap.m.Button({
																	text: oResourceBundle.getText("DISCARD"),
																	press: function () {
																		oDialog.close();
																		// enable the buttons
																		oUIModel.setProperty("/enabled", true);																		
																		//delete the draft node
																		var oView = that.getAggregation("rootControl");
																		var oController = oView.getController();
																		oController.oBaseViewController.deleteEntity(true);
																		var oLockButton = sap.ui.getCore().byId(oView.getAggregation("content")[0].getAggregation("content")[0].getAggregation("headerTitle").getId() + "-lock");
																		oLockButton.setVisible(false);
																		oActiveEntity.HasDraftEntity = false;
																		//refresh the nodes
																		var oContainers = that.getAppComponent().getNavigationController().getViews();
																		for (var sContainer in oContainers) {
																			var oComponent = oContainers[sContainer].getComponentInstance();
																			if (oComponent.setIsRefreshRequired) {
																				oComponent.setIsRefreshRequired(true);
																			}
																		}
																	}
																})
															],
															afterClose: function () {
																oDialog.destroy();
															}
														}
													);
													oDialog.open();
												}
											}
											// enable the buttons
											oUIModel.setProperty("/enabled", true);												
										}
									}
								);
							} else {
								// enable the buttons
								oUIModel.setProperty("/enabled", true);
							}
						}
					}
				}
			});
		}
	},
	refreshBinding: function () {
		"use strict";

		sap.suite.ui.generic.template.lib.TemplateComponent.prototype.refreshBinding.apply(this, arguments);
		var oView = this.getAggregation("rootControl");
		if (oView instanceof sap.ui.core.mvc.XMLView) {
			try {
				oView.getContent()[0].getContent()[0].getSections().forEach(function (oSection) {
					oSection.getSubSections().forEach(function (oSubSection) {
						oSubSection.getBlocks().forEach(function (oBlock) {
							if (oBlock instanceof sap.ui.comp.smarttable.SmartTable) {
								oBlock.rebindTable();
							}
						});
					});
				});
			} catch (e) {
				// In case of refresh did not work
				jQuery.sap.log.error("Object Page could not rebind tables");
			}
		}
	}
});
