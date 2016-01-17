sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/generic/template/BaseViewController", "sap/ui/generic/template/ViewUtil", "sap/m/Table", "sap/suite/ui/generic/template/ListReport/nav/NavigationHandler", "sap/suite/ui/generic/template/library"], function (mvcController, BaseViewController, ViewUtil, Table, NavigationHandler /*, library */) {
	"use strict";

	return mvcController.extend("sap.suite.ui.generic.template.lib.TemplateViewController", {

		metadata: {
			library: "sap.suite.ui.generic.template"
		},

		onInit: function () {
			this.oBaseViewController = new BaseViewController();
			this.oBaseViewController.onInit({
				showMessages: function () {
					var oUIModel = this.getView().getModel("ui");
					if (oUIModel) {
						return oUIModel.getProperty("/editable") ? false : true;
					} else {
						return true;
					}
				}
			});
			this.oBaseViewController.connectToView(this.getView());
			var oComponent = this.getComponent();
			this._resourceBundle = oComponent.getModel("i18n").getResourceBundle(); //template resource bundle which gets enhanced later
			if (typeof oComponent.bindComponent === 'function') {
				oComponent.bindComponent();
			}
		},

		onShowMessages: function (oEvent) {
			var oButton = oEvent.getSource();
			this.showMessagePopover(oButton, true);
		},

		showMessagePopover: function (oButton, bToggle) {
			return this.oBaseViewController.showMessagePopover(oButton, bToggle);
		},

		handleSuccess: function (oResponse, mParameters) {
			return this.oBaseViewController.handleSuccess(oResponse, mParameters);
		},

		handleError: function (oError, mParameters) {
			return this.oBaseViewController.handleError(oError, mParameters);
		},

		getContext: function () {
			return this.oBaseViewController.getContext();
		},

		getComponent: function () {
			return this.oBaseViewController.getComponent();
		},

		getComponentContainer: function () {
			return this.oBaseViewController.getComponentContainer();
		},

		getTransactionController: function () {
			return this.oBaseViewController.getTransactionController();
		},

		getNavigationController: function () {
			return this.oBaseViewController.getNavigationController();
		},

		getDraftContext: function () {
			return this.oBaseViewController.getDraftContext();
		},

		/*
		 onContinueLater: function () {
		 var sSavedAsDraft = this._resourceBundle.getText("SAVED_AS_DRAFT"); //"The object was saved as a draft";

		 if (this.getDraftContext().hasDraft(this.getContext())) {
		 // show message with timeout to show it after navigation
		 setTimeout(function () {
		 sap.m.MessageToast.show(sSavedAsDraft);
		 }, 10);
		 }

		 return this.goBack();
		 },
		 */

		onBack: function () {
			return this.goBack();
		},

		goBack: function () {
			// TODO once navigation controller provides back method use this one
			// return this.getNavigationController().goBack(true);
			window.history.back();

		},

		onEdit: function () {
			var that = this;
			//"Expired Lock Dialog" for "unsaved changes" in case of "lock of other user expired"
			var bEditDialog = false;
			var sCreatedByUser;
			var sEntitySet = that.getComponent().getEntitySet();
			// check whether Draft exists
			if (that.getDraftContext().isDraftEnabled(sEntitySet) && that.getDraftContext().isDraftRoot(sEntitySet)) {
				//check whether is DraftAdministrativeData available
				if (that.getDraftContext().hasDraftAdministrativeData(sEntitySet)) {
					var oDraftAdministrativeData = that.getContext().getProperty("DraftAdministrativeData");
					//check whether lock by other user is expired
					if (oDraftAdministrativeData && !oDraftAdministrativeData.DraftIsProcessedByMe && !oDraftAdministrativeData.InProcessByUser) {
						bEditDialog = true;
						sCreatedByUser = oDraftAdministrativeData.CreatedByUser;
					}
				} else {
					//In case of DeepLink the DraftAdministrativeData still not retrieved
					var oBindingContext = that.getComponent().getBindingContext();
					var oModel = that.getComponent().getModel();
					oModel.read(oBindingContext.getPath(), {
						urlParameters: {
							"$expand": "SiblingEntity,DraftAdministrativeData"
						},
						success: function (oResponseData) {
							//check whether lock by other user is expired
							if (oResponseData.DraftAdministrativeData && !oResponseData.DraftAdministrativeData.DraftIsProcessedByMe && !oResponseData.DraftAdministrativeData.InProcessByUser) {
								bEditDialog = true;
								sCreatedByUser = oResponseData.DraftAdministrativeData.CreatedByUser;
								//start "Expired Lock Dialog", because lock by other user is expired
								that.expiredLockDialog(sCreatedByUser);
							}
						}
					});
					return;
				}
			}
			// Continue with edit mode or start "Expired Lock Dialog", because lock by other user is expired
			if (bEditDialog) {
				that.expiredLockDialog(sCreatedByUser);
			} else {
				that.oBaseViewController.editEntity().then(function (oContext) {
					var oDraft;
					if (that.getDraftContext().hasDraft(oContext)) {
						that._setRootPageToDirty();
						oDraft = oContext && oContext.context || oContext;
					}
					if (oDraft) {
						// navigate to draft
						that.getNavigationController().navigateToContext(oDraft, undefined, true);
					} else {
						var oUIModel = that.getView().getModel("ui");
						oUIModel.setProperty("/editable", true);
					}
				});
			}
		},

		expiredLockDialog: function (sCreatedByUser) {
			var that = this;
			var aTextParams = [sCreatedByUser];
			var sDialogContentText = that._resourceBundle.getText("DRAFT_LOCK_EXPIRED", aTextParams);
			var oDialog = new sap.m.Dialog({
				title: that._resourceBundle.getText("WARNING"),
				type: "Message",
				state: "Warning",
				content: new sap.m.Text({
					text: sDialogContentText
				}),
				buttons: [
					new sap.m.Button({
						text: that._resourceBundle.getText("EDIT"),
						press: function () {
							oDialog.close();
							//delete draft (execute by edit mode ?)
							//continue with edit mode and navigate to draft
							that.oBaseViewController.editEntity().then(function (oContext) {
								var oDraft;
								if (that.getDraftContext().hasDraft(oContext)) {
									oDraft = oContext && oContext.context || oContext;
								}
								if (oDraft) {
									// navigate to draft
									that.getNavigationController().navigateToContext(oDraft, undefined, true);
								} else {
									var oUIModel = that.getView().getModel("ui");
									oUIModel.setProperty("/editable", true);
								}
							});
						}
					}),
					new sap.m.Button({
						text: that._resourceBundle.getText("CANCEL"),
						press: function () {
							oDialog.close();
							// ready
						}
					})
				],
				afterClose: function () {
					oDialog.destroy();
				}
			});
			oDialog.open();
		},

		fnDraftPopover: function (oContext, oBindingContext, oView, oTarget) {
			if (!oContext._oPopover) {
				oContext._oPopover = sap.ui.xmlfragment("sap.suite.ui.generic.template.fragments.DraftAdminDataPopover", oContext);//this);
				oView.addDependent(oContext._oPopover);
			} else {
				oContext._oPopover.unbindElement();
			}
			var oAdminModel = new sap.ui.model.json.JSONModel({
				IsActiveEntity: oBindingContext.getProperty("IsActiveEntity"),
				HasDraftEntity: oBindingContext.getProperty("HasDraftEntity")
			});
			oContext._oPopover.setModel(oAdminModel, "admin");

			oContext._oPopover.bindElement({
				path: oBindingContext.getPath() + '/DraftAdministrativeData'
			});

			if (oContext._oPopover.getBindingContext() !== undefined && oContext._oPopover.getBindingContext() !== null) {
				oContext._oPopover.openBy(oTarget);
			} else {
				oContext._oPopover.getObjectBinding().attachDataReceived(jQuery.proxy(function () {
					oContext._oPopover.openBy(oTarget);
				}, this));
				oContext._oPopover.getObjectBinding().getModel().attachBatchRequestFailed(jQuery.proxy(function () {
					oContext._oPopover.openBy(oTarget);
				}, this));
			}
			//handling of the close button in the popover
			var oPopoverButton = sap.ui.getCore().byId(oContext._oPopover.getAggregation("_internalHeader").getAggregation("contentRight")[0].getId());
			oPopoverButton.attachPress(function (oEvent) {
				oEvent.getSource().getParent().getParent().close();
			});
		},

		formatText: function () {
			var aArgs = Array.prototype.slice.call(arguments, 1);
			var sKey = arguments[0];
			if (!sKey) {
				return '';
			}
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (aArgs.length > 0 && (aArgs[0] === null || aArgs[0] === undefined || aArgs[0] === "")) {
				if (aArgs.length > 2 && (aArgs[1] === null || aArgs[1] === undefined || aArgs[1] === "")) {
					return aArgs[2];
				} else {
					return "";
				}
			} else {
				return oBundle.getText(sKey, aArgs[0]);
			}
		},

		formatDraftLockText: function (IsActiveEntity, HasDraftEntity, LockedBy) {
			return this.formatDraftLockTextGeneric(IsActiveEntity, HasDraftEntity, LockedBy, this);
		},

		formatDraftLockTextGeneric: function (IsActiveEntity, HasDraftEntity, LockedBy, oController) {
			var oBundle = oController.getView().getModel("i18n").getResourceBundle();
			if (!IsActiveEntity) {
				// current assumption: is my Draft as I don't see other's draft -> TODO: to be checked
				return oBundle.getText("DRAFT_OBJECT");
			} else if (HasDraftEntity) {
				// current assumption: is other's Draft -> TODO: to be checked
				if (LockedBy !== '') {
					return oBundle.getText("LOCKED_OBJECT");
				} else {
					return oBundle.getText("UNSAVED_CHANGES");
				}
			} else {
				return ""; // not visible
			}
		},

		onDiscardDraft: function (oEvent) {
			var aCustomData = oEvent.getSource().getCustomData();
			var that = this;
			var oContext = that.getContext();
			var oEntity = oContext.getObject();
			var sPlacement;
			var sPopOverText;
			// Get Placement via custom data or set default to Top
			if (aCustomData && aCustomData.length && aCustomData[0]) {
				sPlacement = aCustomData[0].getValue();
			} else {
				sPlacement = sap.m.PlacementType.Top;
			}

			// Determine the right text CSS 1570522238
			if (oEntity.hasOwnProperty("HasActiveEntity") && !oContext.getProperty("IsActiveEntity") && !oContext.getProperty("HasActiveEntity")) {
				sPopOverText = this._resourceBundle.getText("CANCEL_AND_DISCARD"); //"Cancel editing and discard this object?"
			} else {
				sPopOverText = this._resourceBundle.getText("DISCARD_EDIT"); //"Cancel editing and discard all changes?"
			}

			var oPopover = new sap.m.Popover(
				{
					placement: sPlacement,
					showHeader: false,
					content: new sap.m.VBox({
						items: [new sap.m.Text({
							text: sPopOverText,
							width: '16rem'
						}),
							new sap.m.Button({
								text: this._resourceBundle.getText("DISCARD"), //'Discard',
								width: '100%',
								press: function () {
									var fnDiscardDraft = function (oActive) {
										that.oBaseViewController.deleteEntity().then(function () {
											that._setRootPageToDirty();
											if (oActive && oActive.getObject() && oActive.getObject().IsActiveEntity) {
												that.getNavigationController().navigateToContext(oActive, undefined, true);
											} else {
												// new document discarded, go back to previous page
												that.goBack();
											}
										});
									};

									var oModel = that.getView().getModel();

									if (oEntity.hasOwnProperty("HasActiveEntity") && oEntity.HasActiveEntity && oEntity.hasOwnProperty("SiblingEntity")) {
										oModel.read(oContext.getPath() + "/SiblingEntity", {
											success: function (oResponseData) {
												var oContext = oModel.getContext("/" + oModel.getKey(oResponseData));
												fnDiscardDraft(oContext);
											}
										});
									} else {
										fnDiscardDraft();
									}
								}
							})]
					})
				});

			oPopover.addStyleClass("sapUiContentPadding");

			oPopover.openBy(oEvent.getSource());
		},

		onDelete: function (oEvent) {
			var aCustomData = oEvent.getSource().getCustomData();
			var sPlacement;
			var that = this;

			// Get Placement via custom data or set default to Top
			if (aCustomData && aCustomData.length && aCustomData[0]) {
				sPlacement = aCustomData[0].getValue();
			} else {
				sPlacement = sap.m.PlacementType.Top;
			}

			var oPopover = new sap.m.ResponsivePopover({
				placement: sPlacement,
				showHeader: false,
				content: new sap.m.VBox({
					items: [new sap.m.Label({
						text: this._resourceBundle.getText("DELETE_QUESTION") //"Do you really want to delete this object?"
					}), new sap.m.Button({
						text: this._resourceBundle.getText("DELETE"), // 'Delete',
						width: '100%',
						press: function () {
							that.oBaseViewController.deleteEntity().then(function () {
								that._setOthersToDirty();
								// document was deleted, go back to previous page
								that.goBack();
							});
						}
					})]
				})
			});

			oPopover.addStyleClass("sapUiContentPadding");

			oPopover.openBy(oEvent.getSource());
		},

		onRelatedApps: function (oEvent) {
			var that = this;
			that.oButton = oEvent.getSource();
			that.oMetaModel = that.getComponent().getModel().getMetaModel();
			that.oContext = that.getContext();
			that.oParsedUrl = sap.ushell.Container.getService("URLParsing").parseShellHash(document.location.hash);
			var oLinks = sap.ushell.Container.getService("CrossApplicationNavigation").getSemanticObjectLinks(that.oParsedUrl.semanticObject);
			//var oLinks = sap.ushell.Container.getService("CrossApplicationNavigation").getSemanticObjectLinks("EPMProduct"); // test

			oLinks.done(function (aLinks) {
				var oEntity = that.oContext.getObject();
				var sEntityType = oEntity.__metadata.type;
				var oDataEntityType = that.oMetaModel.getODataEntityType(sEntityType);
				var aSemKey = oDataEntityType["com.sap.vocabularies.Common.v1.SemanticKey"];
				//var oSemKeyParam = {};
				var oParam = {};
				if (aSemKey && aSemKey.length > 0) {
					for (var j in aSemKey) {
						var sSemKey = aSemKey[j].PropertyPath;
						if (!oParam[sSemKey]) {
							oParam[sSemKey] = [];
							oParam[sSemKey].push(oEntity[sSemKey]);
						}
					}
				} else {
					// Fallback if no SemanticKey
					for (var k in oDataEntityType.key.propertyRef) {
						var sObjKey = oDataEntityType.key.propertyRef[k].name;
						if (!oParam[sObjKey]) {
							oParam[sObjKey] = [];
							oParam[sObjKey].push(oEntity[sObjKey]);
						}
					}
				}
				// filter current semanticObject-action
				var aLinksforNav = [];
				var sCurrentAction = that.oParsedUrl.semanticObject + "-" + that.oParsedUrl.action;
				for (var i in aLinks) {
					var oLink = aLinks[i];
					if (oLink.intent.indexOf(sCurrentAction) < 0) {
						aLinksforNav.push(oLink);
					}
				}
				//prepare ActionSheet
				var oActionSheet = new sap.m.ActionSheet({
					placement: sap.m.PlacementType.Bottom,
					showCancelButton: false
				});
				if (aLinksforNav.length > 0) {
					for (var n in aLinksforNav) {
						var oLinkforNav = aLinksforNav[n];
						var oBtn = new sap.m.Button({
							text: oLinkforNav.text
						});
						oBtn.attachPress(that.onPressLinkedApps, that);
						oBtn.addCustomData(new sap.ui.core.CustomData({
							key: "linkData",
							value: {
								"oParam": oParam,
								"oLinkforNav": oLinkforNav
							}
						}));
						oActionSheet.addButton(oBtn);
					}
				} else {
					var oBtnNoData = new sap.m.Button({
						text: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("LIST_NO_DATA"), //workaround until NO_RELATED_APPS is translated
						enabled: false
					});
					oActionSheet.addButton(oBtnNoData);
				}
				oActionSheet.openBy(that.oButton);
			});
		},

		onPressLinkedApps: function (oEvent) {
			var oBtn = oEvent.getSource();
			var oLinkData = oBtn.getCustomData()[0].getValue();
			// prepare navigation with SemanticKey e.q.: #SalesOrder-manage?ActiveSalesOrderID=500000096
			var str = oLinkData.oLinkforNav.intent;
			var sSemanticObject = str.substring(1, str.indexOf("-"));
			var sPos = (str.indexOf("~") > -1) ? str.indexOf("~") : str.length;
			var sAction = str.substring(str.indexOf("-") + 1, sPos);
			var oNavArguments = {
				target: {
					semanticObject: sSemanticObject,
					action: sAction
				},
				params: oLinkData.oParam
			};
			this.oCrossAppNavService = sap.ushell.Container.getService("CrossApplicationNavigation").toExternal(oNavArguments);
		},

		showMessagesButton: function (aMessages) {
			if (aMessages && aMessages.length && aMessages.length > 0) {
				return true;
			} else {
				return false;
			}
		},

		showMessagesButtonText: function (aMessages) {
			return aMessages && aMessages.length || '';
		},

		onActivate: function () {
			var that = this;
			this.oBaseViewController.activateDraftEntity().then(function (oResponse) {
				sap.m.MessageToast.show(that._resourceBundle.getText("OBJECT_SAVED"));
				if (oResponse && oResponse.context) {
					// Set Root to dirty
					that._setRootPageToDirty();

					// navigate to activate document
					that.getNavigationController().navigateToContext(oResponse.context, undefined, true);
				}
			});
		},

		onSave: function () {
			var that = this;

			// Non-Draft, save and switch back to read-only mode
			this.oBaseViewController.saveEntity().then(function (oContext) {
				var oNavigationController = that.getNavigationController();
				var oUIModel = that.getView().getModel("ui");

				oUIModel.setProperty("/editable", false);

				if (that.getComponent().getCreateMode()) {
					// in case of create mode navigate to new item
					if (oContext) {
						oNavigationController.navigateToContext(oContext, undefined, true);
					}

					setTimeout(function () {
						sap.m.MessageToast.show(this._resourceBundle.getText("OBJECT_CREATED")); //"Object was created");
					}, 10);
				} else {
					sap.m.MessageToast.show(this._resourceBundle.getText("OBJECT_SAVED")); //"Object was saved");
				}

			});
		},

		// action triggered from tables
		onCallActionFromList: function (oEvent, oSmartFilterBar) {
			var mOutboundParameters, oInnerAppData;
			if (oEvent) {
				var oTable = oEvent.getSource().getParent().getParent().getTable();
				var oContext = this._getSelectedContext(oTable);
				var oCustomData = this._getCustomData(oEvent);
				var oNavigationHandler = new NavigationHandler(this);
				if (oCustomData.Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
					this._callAction(oEvent, oCustomData, oContext, "", oTable);
				} else if (oNavigationHandler) {
					var mSemanticAttributes = oContext.getObject();
					delete mSemanticAttributes.__metadata;
					if (oSmartFilterBar) {
						var sSelectionVariant = this.oSmartFilterBar.getDataSuiteFormat() || "{}";
						mSemanticAttributes = this._filterObjectsFromJSON(mSemanticAttributes);
						mOutboundParameters = oNavigationHandler.mixAttributesAndSelectionVariant(mSemanticAttributes, sSelectionVariant).toJSONString();
						oInnerAppData = {
							selectionVariant: this.oSmartFilterBar.getDataSuiteFormat(),
							tableVariantID: this.oSmartTable.getCurrentVariantId()
						};
					} else {
						jQuery.extend(mSemanticAttributes, this.getContext().getObject());
						mOutboundParameters = this._filterObjectsFromJSON(mSemanticAttributes);
						mOutboundParameters = JSON.stringify(mOutboundParameters);
						oInnerAppData = {};
					}
					var fCallbackOnError = jQuery.proxy(this._handleError, this);
					oNavigationHandler.navigate(oCustomData.SemanticObject, oCustomData.Action, mOutboundParameters, oInnerAppData, fCallbackOnError);
				}
			}
		},

		// action triggered from details/object page
		onCallAction: function (oEvent) {
			var oCustomData = this._getCustomData(oEvent);
			var oContext = this.getContext();
			if (oContext && oCustomData.Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
				this._callAction(oEvent, oCustomData, oContext, this.getComponent().getNavigationProperty(), "");
			}
		},

		onCancel: function () {
			var oUIModel = this.getView().getModel("ui");
			oUIModel.setProperty("/editable", false);
			oUIModel.setProperty("/enabled", true);
			this.getView().getModel().resetChanges();

			if (this.getComponent().getCreateMode()) {
				// in case of create mode navigate back to list
				this.goBack();
			}
		},

		triggerPrepareOnEnterKeyPress: function () {
			var oDraftContext = this.getDraftContext();
			if (oDraftContext.isDraftEnabled(this.getComponent().getEntitySet())) {

				var that = this;

				this.getView().attachBrowserEvent("keyup", function (oBrowswerEvent) {
					if (oBrowswerEvent.keyCode === 13 && that.getView().getModel("ui").getProperty("/editable")) {
						var oContext = that.getContext();
						if (oContext && oDraftContext.hasDraftPreparationAction(oContext)) {
							that.getTransactionController().getDraftController().saveAndPrepareDraftEntity(oContext, {
								binding: that.getComponentContainer().getElementBinding()
							}).then(function (oResponse) {
								that.oBaseViewController.handleSuccess(oResponse);
								// as this is only a temporarely solution we use a private method of the UI5 baseviewcontroller, aligned with UI5
								that._setOthersToDirty();
							}, function (oError) {
								that.oBaseViewController.handleError(oError);
							});
						}
					}
				});
			}
		},

		onBeforeRebindTable: function (oEvent) {
			// still open
			var oBindingParams = oEvent.getParameter("bindingParams");
			oBindingParams.parameters = oBindingParams.parameters || {};
			var oSmartTable = oEvent.getSource();
			/* deactivated until AI support filter by NavProp
			 var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
			 if (oSmartFilterBar instanceof sap.ui.comp.smartfilterbar.SmartFilterBar) {
			 var oCustomControl = oSmartFilterBar.getControlByKey('DraftState');
			 if (oCustomControl instanceof sap.m.ComboBox) {
			 var vDraftState = oCustomControl.getSelectedKey();
			 switch (vDraftState) {
			 case "0":
			 break;
			 case "1": //Active
			 oBindingParams.filters.push(new sap.ui.model.Filter('IsActiveEntity', 'EQ', true));
			 oBindingParams.filters.push(new sap.ui.model.Filter('HasDraftEntity', 'EQ', false));
			 break;
			 case "2": //Draft
			 oBindingParams.filters.push(new sap.ui.model.Filter('IsActiveEntity', 'EQ', false));
			 oBindingParams.filters.push(new sap.ui.model.Filter('I_DraftAdministrativeDataType/DraftIsCreatedByMe', 'EQ', true ));
			 break;
			 case "3": // Locked
			 oBindingParams.filters.push(new sap.ui.model.Filter('IsActiveEntity', 'EQ', false));
			 oBindingParams.filters.push(new sap.ui.model.Filter('I_DraftAdministrativeDataType/DraftIsCreatedByMe', 'EQ', false ));
			 oBindingParams.filters.push(new sap.ui.model.Filter('I_DraftAdministrativeDataType/InProcessByUser', 'NE', ' ' ));
			 break;
			 case "4": // Unsaved changes
			 oBindingParams.filters.push(new sap.ui.model.Filter('IsActiveEntity', 'EQ', false));
			 oBindingParams.filters.push(new sap.ui.model.Filter('I_DraftAdministrativeDataType/DraftIsCreatedByMe', 'EQ', false ));
			 oBindingParams.filters.push(new sap.ui.model.Filter('I_DraftAdministrativeDataType/InProcessByUser', 'EQ', ' ' ));
			 break;
			 default:
			 break;
			 }
			 }
			 }	*/
			this.oBaseViewController.getTableQueryParameters(oSmartTable.getEntitySet(), oBindingParams);
			var aSelect = oBindingParams.parameters.select && oBindingParams.parameters.select.split(',') || [];
			var aExpands = oBindingParams.parameters && oBindingParams.parameters.expand && oBindingParams.parameters.expand.split(',') || [];
			var sEntitySet = oSmartTable.getEntitySet();

			// check if any expand is neccessary
			for (var i = 0; i < aSelect.length; i++) {
				// check if expand is neccessary
				if (aSelect[i].indexOf("/") !== -1) {
					var aParts = aSelect[i].split("/");
					// remove property from path
					aParts.pop();
					var sNavigation = aParts.join("/");
					if (aExpands.indexOf(sNavigation) === -1) {
						aExpands.push(sNavigation);
					}
				}
			}

			// add Draft Admin Data to expand if entity is Draft and Draft Root and has Draft Admin Data
			if (this.getDraftContext().isDraftEnabled(sEntitySet) && this.getDraftContext().isDraftRoot(sEntitySet)) {
				if (this.getTransactionController().getDraftController().getDraftContext().hasDraftAdministrativeData(sEntitySet)) {

					if (aSelect && aSelect.length > 0) {
						if (aSelect.indexOf("DraftAdministrativeData") === -1) {
							oBindingParams.parameters.select = oBindingParams.parameters.select + ',DraftAdministrativeData';
						}
					}

					if (aExpands.indexOf("DraftAdministrativeData") === -1) {
						aExpands.push("DraftAdministrativeData");
					}
				}
			}

			if (aExpands.length > 0) {
				oBindingParams.parameters.expand = aExpands.join(",");
			}

			// sortOrder Annotation of presentation variant - only relevant for sap.m.Table
			var aCustomData = oSmartTable.getCustomData();
			var oCustomData = {};
			for (var k = 0; k < aCustomData.length; k++) {
				oCustomData[aCustomData[k].getKey()] = aCustomData[k].getValue();
			}
			var oTable = oSmartTable.getTable();
			var oVariant = oSmartTable.fetchVariant();
			var isEmpty = true;
			for (var key in oVariant) {
				if (oVariant.hasOwnProperty(key)) {
					isEmpty = false;
				}
			}
			if (isEmpty && oTable instanceof Table && oCustomData.TemplateSortOrder) {
				var aSortOrder = oCustomData.TemplateSortOrder.split(', ');
				for (var j = 0; j < aSortOrder.length; j++) {
					var aSort = aSortOrder[j].split(' ');
					if (aSort.length > 1) {
						oBindingParams.sorter.push(new sap.ui.model.Sorter(aSort[0], aSort[1] === "true"));
					} else {
						oBindingParams.sorter.push(new sap.ui.model.Sorter(aSort[0]));
					}
				}
			}

		},

		onListNavigate: function (oEvent) {
			oEvent.getSource().detachPress("onListNavigate");
			var result = this.oBaseViewController.navigateFromListItem(oEvent.getSource());
			oEvent.getSource().attachPress("onListNavigate");
			return result;
		},

		navigateFromListItem: function (oItem, oTable) {
			return this.oBaseViewController.navigateFromListItem(oItem, oTable);
		},

		addEntry: function (oEvent) {
			var that = this;
			var oTable = ViewUtil.getParentTable(oEvent.getSource());
			return this.oBaseViewController.addEntry(oTable).then(function () {
				that._setMeToDirty();
			});
		},

		onSearch: function (oEvent) {
			// for non-smart tables
			var oTable = ViewUtil.getParentTable(oEvent.getSource());
			return this.oBaseViewController.searchOnTable(oTable, oEvent.getParameter("query"));
		},

		onChange: function (oEvent) {
			var that = this;
			var sProperty = oEvent.getSource().getBindingPath("value");

			if (this.getDraftContext().hasDraft(this.getContext())) {
				var oUIModel = this.getView().getModel("ui");
				if (oUIModel) {
					var oModel = this.getView().getModel();

					oModel.attachEventOnce("requestSent", function () {
						oUIModel.setProperty("/draftStatus", that._resourceBundle.getText("DRAFT_SAVING")); // "Draft saving..."

						/* due to concept issues not yet released
						 Don't forget to uncomment sProperty definition above
						 var aSideEffects = that.getDraftContext().getSideEffects(that.getComponent().getEntitySet(), sProperty);
						 if (aSideEffects && aSideEffects.length){
						 for (var i = 0; i < aSideEffects.length; i++){
						 var oBlocked = oUIModel.getProperty("/blocked");
						 if (!oBlocked){
						 oBlocked = {};
						 oUIModel.setProperty("/blocked", oBlocked);
						 }

						 if (aSideEffects[i].hasOwnProperty('PropertyPath')){
						 oUIModel.setProperty("/blocked/" + aSideEffects[i].PropertyPath, true);
						 }
						 }
						 }
						 */
					});
					var oRequestFailedHandler;
					var oRequestCompletedHandler = function () {
						oUIModel.setProperty("/draftStatus", that._resourceBundle.getText("DRAFT_SAVED")); // "Draft saved"
						oModel.detachEvent("requestCompleted", oRequestCompletedHandler);
						oModel.detachEvent("requestFailed", oRequestFailedHandler);
					};

					oRequestFailedHandler = function () {
						oUIModel.setProperty("/draftStatus", that._resourceBundle.getText("DRAFT_NOT_SAVED")); // "Draft not saved"
						oModel.detachEvent("requestCompleted", oRequestCompletedHandler);
						oModel.detachEvent("requestFailed", oRequestFailedHandler);
					};

					oModel.attachRequestCompleted(oRequestCompletedHandler);
					oModel.attachRequestFailed(oRequestFailedHandler);

				}
			}

			return this.oBaseViewController.modifyEntity(sProperty, oEvent.getSource());
			// unblock side effects
			/*	due to concept issues not yet released
			 .then(function () {
			 var aSideEffects = that.getDraftContext().getSideEffects(that.getComponent().getEntitySet(), sProperty);
			 if (aSideEffects && aSideEffects.length){
			 for (var i = 0; i < aSideEffects.length; i++){
			 var oBlocked = oUIModel.getProperty("/blocked");
			 if (!oBlocked){
			 oBlocked = {};
			 oUIModel.setProperty("/blocked", oBlocked);
			 }

			 if (aSideEffects[i].hasOwnProperty('PropertyPath')){
			 oUIModel.setProperty("/blocked/" + aSideEffects[i].PropertyPath, undefined);
			 }
			 }
			 }
			 });
			 */
		},

		onContactDetails: function (oEvent) {
			if (!this.oPopover) {
				this.oPopover = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getAggregation("items")[1];
			}
			this.oPopover.bindElement(oEvent.getSource().getBindingContext().getPath());
			this.oPopover.openBy(oEvent.getSource());
		},

		/* PRIVATES */

		_setEnabledOfExportToExcel: function (aToolbarContent, sEnabled) {
			var iContentLength = aToolbarContent.length;
			for (var n = iContentLength - 1; n >= 0; --n ) {
				if (aToolbarContent[n].getIcon() === "sap-icon://excel-attachment") {
					aToolbarContent[n].setProperty("enabled", sEnabled);
					break;
				}
			}
			return this;
		},

		_setRootPageToDirty: function () {
			var oViews = this.getNavigationController().getViews();
			if (oViews && oViews.root) {
				var oInstance = oViews.root.getComponentInstance();
				if (oInstance && typeof oInstance.setIsRefreshRequired === 'function') {
					oInstance.setIsRefreshRequired(true);
				}
			}
		},

		_setMeToDirty: function () {
			var oViews = this.getNavigationController().getViews();
			var sMyId = this.getComponent().getId();

			for (var sView in oViews) {
				var oInstance = oViews[sView].getComponentInstance();
				if (oInstance) {
					if (oInstance.getId() === sMyId) {
						if (typeof oInstance.setIsRefreshRequired === 'function') {
							oInstance.setIsRefreshRequired(true);
						}
						return;
					}
				}
			}
		},

		_setOthersToDirty: function () {
			var oViews = this.getNavigationController().getViews();
			var sMyId = this.getComponent().getId();

			for (var sView in oViews) {
				var oInstance = oViews[sView].getComponentInstance();
				if (oInstance) {
					if (oInstance.getId() === sMyId) {
						continue;
					}
					if (typeof oInstance.setIsRefreshRequired === 'function') {
						oInstance.setIsRefreshRequired(true);
					}
				}
			}
		},

		_getCustomData: function (oEvent) {
			var aCustomData = oEvent.getSource().getCustomData();
			var oCustomData = {};
			for (var i = 0; i < aCustomData.length; i++) {
				oCustomData[aCustomData[i].getKey()] = aCustomData[i].getValue();
			}
			return oCustomData;
		},

		_checkActionCustomData: function (oCustomData) {
			if (!oCustomData.Action) {
				throw "Template Error: Function Import Name not found in custom data";
			}

			if (!oCustomData.Label) {
				// as fallback show function import name
				oCustomData.Label = oCustomData.Action;
			}
		},

		_getSelectedContext: function (oTable) {

			var aSelectedContexts = [];
			if (oTable instanceof Table) {
				aSelectedContexts = oTable.getSelectedContexts();
			} else {
				var aIndex = oTable.getSelectedIndices();
				for (var i = 0; i < aIndex.length; i++) {
					aSelectedContexts.push(oTable.getContextByIndex(aIndex[i]));
				}
			}

			var oSelectedContext = null;
			var oBundle = new sap.ui.model.resource.ResourceModel({bundleName: "sap/suite/ui/generic/template/ListReport/i18n/i18n"}).getResourceBundle();
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			if ((!aSelectedContexts || aSelectedContexts.length === 0)) {
				sap.m.MessageBox.error(oBundle.getText("NO_ITEM_SELECTED"), {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				});
				return undefined;
			} else if (aSelectedContexts.length > 1) {
				sap.m.MessageBox.error(oBundle.getText("MULTIPLE_ITEMS_SELECTED"), {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				});
				return undefined;
			} else {
				oSelectedContext = aSelectedContexts[0];
			}
			return oSelectedContext;
		},

		_filterObjectsFromJSON: function (mJSON) {
			var mFilteredJSON = {};
			for (var sPropertyName in mJSON) {
				var vAttributeValue = mJSON[sPropertyName];
				if (jQuery.type(vAttributeValue) !== "object") {
					mFilteredJSON[sPropertyName] = vAttributeValue;
				}
			}
			return mFilteredJSON;
		},

		_handleError: function (oError) {
			if (oError instanceof Error) {
				oError.showMessageBox();
			}
		},

		// internal wrapper for call action against base view controller
		_callAction: function (oEvent, oCustomData, oContext, oNavigationProperty, oSourceControl) {
			this._checkActionCustomData(oCustomData);

			return this.oBaseViewController.callAction({
				functionImportPath: oCustomData.Action,
				context: oContext,
				sourceControl: oSourceControl,
				label: oCustomData.Label,
				navigationProperty: oNavigationProperty
			});
		},

		_getTableFromContent: function (aContent) {
			var oTable = null;
			if (aContent && aContent.length > 0) {
				for (var i = 0; i < aContent.length; i++) {
					var oContent = aContent[i];
					if (oContent instanceof sap.m.Table || oContent instanceof sap.ui.comp.smarttable.SmartTable) {
						oTable = oContent;
						return oTable;
					} else {
						try {
							oTable = this._getTableFromContent(oContent.getContent());
							if (oTable) {
								return oTable;
							}
						} catch (e) {
							continue;
						}
					}
				}
			}

			return oTable;
		}

	});
}, /* bExport= */true);
