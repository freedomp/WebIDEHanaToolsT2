sap.ui.define([
	"sap/suite/ui/generic/template/lib/TemplateViewController", "sap/ui/model/json/JSONModel", "sap/m/Table", "sap/m/Text", "sap/m/Link", "sap/ui/core/Icon", "sap/m/HBox", "sap/m/ObjectIdentifier", "sap/ui/comp/smarttable/SmartTable", "sap/ui/comp/smartfield/SmartField", "sap/suite/ui/generic/template/ListReport/nav/NavigationHandler", "sap/suite/ui/generic/template/library", "sap/suite/ui/generic/template/ListReport/nav/SelectionVariant", "sap/suite/ui/generic/template/ListReport/nav/Error"
], function(BaseController, JSONModel, Table, Text, Link, Icon, HBox, ObjectIdentifier, SmartTable, SmartField, NavigationHandler, TemplateLibrary, SelectionVariant, Error) {
	"use strict";

	var NavType = TemplateLibrary.ListReport.nav.NavType;

	var oListReportController = BaseController.extend("sap.suite.ui.generic.template.ListReport.view.ListReport", {

		bOnInitFinished: false,
		bFilterBarInitialized: false,

		onInit: function() {

			BaseController.prototype.onInit.apply(this, arguments);

			var that = this;
			var oComponent = this.getComponent();
			var oView = this.getView();
			var oTable = oView.byId("listReport");
			var sEntitySet = oComponent.getEntitySet();

			var oAdminModel = new sap.ui.model.json.JSONModel({
				HasDetail: !this.getOwnerComponent().getIsLeaf()
			});
			oAdminModel.setDefaultBindingMode("OneWay");
			oView.setModel(oAdminModel, "admin");

			//SmartFilterBar: CustomData (Edit State)
			// var oSFBModel = new sap.ui.model.odata.ODataModel("/DraftState", true);
			var oSFBModel = new sap.ui.model.json.JSONModel({
				DraftState: " "
			});
			oView.setModel(oSFBModel, "sfb");

			var fnGetUser = jQuery.sap.getObject("sap.ushell.Container.getUser");
			var oManifest = this.getOwnerComponent().getAppComponent().getMetadata().getManifestEntry("sap.ui");
			var sBookmarkIcon = (oManifest && oManifest.icons && oManifest.icons.icon) ? oManifest.icons.icon : "";
			// share Model: holds all the sharing relevant texts and info used in the XML view
			var oShareModel = new JSONModel({
				// BOOKMARK
				bookmarkIcon: sBookmarkIcon,
				bookmarkCustomUrl: function() {
					try {
						// refresh link before using document.URL as bookmark
						this.storeCurrentAppState();
					} catch (err) {
						// URL with updated app state could not be generated. Just use the current URL instead.
						jQuery.sap.log.error("ListReport.bookmarkCustomUrl: " + err);
					}
					return document.URL;
				}.bind(this),
				bookmarkServiceUrl: function() {
					if (this.oSmartTable.getTable().getBinding("rows")){
						return this.oSmartTable.getTable().getBinding("rows").getDownloadUrl() + "&$top=0&$inlinecount=allpages";
					} else if (this.oSmartTable.getTable().getBinding("items")) {
						return this.oSmartTable.getTable().getBinding("items").getDownloadUrl() + "&$top=0&$inlinecount=allpages";
					} else {
						return "";
					}
				}.bind(this),
				// JAM
				isShareInJamActive: fnGetUser ? fnGetUser().isJamActive() : false
			});
			oShareModel.setDefaultBindingMode("OneWay");
			oView.setModel(oShareModel, "share");

			this.oSmartTable = this.byId("listReport");
			this.oSmartFilterBar = this.byId("listReportFilter");

			if (sap.ui.Device.system.desktop) {
				oView.addStyleClass("sapUiSizeCompact");
				oTable.addStyleClass("sapUiSizeCondensed");
			} else {
				oTable.addStyleClass("sapUiSizeCozy");
			}

			var fnDraftFormatter = function(IsActiveEntity, HasDraftEntity) {
				return (!IsActiveEntity || (IsActiveEntity && HasDraftEntity));
			};

			var fnDraftIconFormatter = function(IsActiveEntity, HasDraftEntity, LockedBy) {
				this.removeStyleClass("sapSmartTemplatesListReportDraftInfoIcon");
				this.addStyleClass("sapSmartTemplatesListReportDraftInfoIcon");

				return ((IsActiveEntity && HasDraftEntity && LockedBy !== ''));
			};

			var fnObjectText = function(IsActiveEntity, HasDraftEntity, LockedBy) {
				return that.formatDraftLockTextGeneric(IsActiveEntity, HasDraftEntity, LockedBy, that);
			};

			var fnOnPressDraftInfo = function(oEvent) {
				var oBindingContext = oEvent.getSource().getBindingContext();
				that.oButton = oEvent.getSource();

				BaseController.prototype.fnDraftPopover.call(this, that, oBindingContext, that.oView, that.oButton);
			};

			// in draft case add the draft info to the identifier cell for the sap.m.Table
			if (oTable instanceof SmartTable) {
				for (var i = 0; i < oTable.getItems().length; i++) {
					if (oTable.getItems()[i] instanceof Table) {
						oTable = oTable.getItems()[i];

						if (oComponent.hasDraft()) {
							jQuery.sap.log.info(sEntitySet + " is draft enabled");
							var hasDraftAdministrativeData = this.getTransactionController().getDraftController().getDraftContext().hasDraftAdministrativeData(sEntitySet);

							if (!hasDraftAdministrativeData) {
								jQuery.sap.log.info(sEntitySet + " doesn't have nav. prop. DraftAdministrativeData - no admin data is shown");
							} else {
								// get template of table
								var aItems = oTable.getItems() || [];
								var oTableBinding = aItems[0];
								if (oTableBinding) {
									var aCells = oTableBinding.getCells() || [];
									var aSemanticKey = this.getTransactionController().getDraftController().getDraftContext().getSemanticKey(sEntitySet);
									var sBinding = "";
									var oIdentifier;
									var oCell;
									var oIdentifier_;
									var oCell_;

									// search for first semantic key that is in table
									// this is the current UX behavior as long as there's no annotation
									for (var k = 0; k < aSemanticKey.length; k++) {
										for (var c = 0; c < aCells.length; c++) {
											aItems = aCells[c].getItems();
											for (i = 0; i < aItems.length; i++) {
												// currently only text and identifier are supported - more to be checked
												if (aItems[i] instanceof ObjectIdentifier) {
													sBinding = aItems[i].getBindingPath("title");
												} else if (aItems[i] instanceof SmartField) {
													sBinding = aItems[i].getBindingPath("value");
												} else {
													sBinding = aItems[i].getBindingPath("text");
												}
												if (!(oCell_ && oIdentifier_)) {
													oIdentifier_ = aItems[i];
													oCell_ = aCells[c];
												}
												if (sBinding === aSemanticKey[k].name) {
													oIdentifier = aItems[i];
													oCell = aCells[c];
													break;
												}
											}
											if (oIdentifier) {
												break;
											}
										}
										if (oIdentifier) {
											break;
										}
									}

									if (!(oCell && oIdentifier)) {
										// if no semantic key was found, take the first column in the table
										oCell = oCell_;
										oIdentifier = oIdentifier_;
									}
									if (!(oCell && oIdentifier)) {
										jQuery.sap.log.info("No semantic key found in Object List - no admin data is shown");
									} else {
										if (!(oIdentifier instanceof ObjectIdentifier)) {
											// if identifier is not yet a
											// ObjectIdentifier convert it
											if (oIdentifier instanceof Text) {
												sBinding = oIdentifier.getBindingPath("text");
												oCell.removeItem(oIdentifier);
												oIdentifier = new ObjectIdentifier({
													title: {
														path: sBinding
													}
												});
												oCell.addItem(oIdentifier);
											}
										}

										var oDraftIcon = new Icon({
											src : "sap-icon://locked",
											enabled: {
												parts: [
													{
														path: 'IsActiveEntity'
													}, {
														path: 'HasDraftEntity'
													},{
														path: 'DraftAdministrativeData/InProcessByUser'
													}
												],
												formatter: fnDraftIconFormatter
											},
											visible: {
												parts: [
													{
														path: 'IsActiveEntity'
													}, {
														path: 'HasDraftEntity'
													},{
														path: 'DraftAdministrativeData/InProcessByUser'
													}
												],
												formatter: fnDraftIconFormatter
											}
										}).addStyleClass("sapUiTinyMarginTop");
										var oDraftInfo = new Link({
											enabled: {
												parts: [
													{
														path: 'IsActiveEntity'
													}, {
														path: 'HasDraftEntity'
													}
												],
												formatter: fnDraftFormatter
											},
											visible: {
												parts: [
													{
														path: 'IsActiveEntity'
													}, {
														path: 'HasDraftEntity'
													}
												],
												formatter: fnDraftFormatter
											},
											press: fnOnPressDraftInfo,
											text: {
												parts: [
													{
														path: 'IsActiveEntity'
													}, {
														path: 'HasDraftEntity'
													},{
														path: 'DraftAdministrativeData/InProcessByUser'
													}
												],
												formatter: fnObjectText
											}
										}).addStyleClass("sapUiTinyMarginTop");
										oCell.addItem(new HBox({
											items : [oDraftIcon, oDraftInfo]
										}));
									}

								}
							}

						}
					}
				}
			}

			if (sap.ushell) {
				this.oNavigationHandler = new NavigationHandler(this);
				this.bOnInitFinished = true;
				this.initAppState();
			}
		},

		initAppState: function() {
			// check if both init events for the controller and the SmartFilterBar have finished
			if (!(this.bFilterBarInitialized && this.bOnInitFinished && this.oNavigationHandler)) {
				return;
			}

			var oParseNavigationPromise = this.oNavigationHandler.parseNavigation();

			var that = this;
			oParseNavigationPromise.done(function(oAppData, oURLParameters, sNavType) {

				if (sNavType !== NavType.initial) {
					// if the app is started with any parameters, then clear the filter bar variant
					that.oSmartFilterBar.clearVariantSelection();
					that.oSmartFilterBar.setDataSuiteFormat(oAppData.selectionVariant, true);
					that.oSmartTable.setCurrentVariantId(oAppData.tableVariantId);
					that.restoreCustomAppStateData(oAppData.customData);
					that.oSmartTable.rebindTable();
				}
			});

			oParseNavigationPromise.fail(function(oError) {
				that._handleError(oError);
			});
		},

		// ---------------------------------------------
		// APP STATE HANDLING FOR BACK NAVIGATION
		// ---------------------------------------------

		// Changes the URL according to the current app state and stores the app state for later retrieval.
		storeCurrentAppState: function() {
			if (this.oNavigationHandler) {
				if (!this.oNavigationHandler.hasCrossApplicationNavigationService()) {
					return undefined;
				}
				var oAppStatePromise = this.oNavigationHandler.storeInnerAppState(this.getCurrentAppState());
				oAppStatePromise.fail(function(oError) {
					this._handleError(oError);
				}.bind(this));
				return oAppStatePromise;
			} else {
				throw "ListReport: navigation handler is not defined. Check if UShell services exist.";
			}
		},

		getCurrentAppState: function() {
			// Special handling for selection fields, for which defaults are defined:
			// If a field is visible in the SmartFilterBar and the user has cleared the input value, the field is not included in the selection
			// variant, which is returned by getDataSuiteFormat() of the SmartFilterBar. But since it was cleared by purpose, we have to store 
			// the selection with the value "", in order to set it again to an empty value, when restoring the selection after a back navigation. 
			// Otherwise, the default value would be set.
			var oSelectionVariant = new SelectionVariant(this.oSmartFilterBar.getDataSuiteFormat());
			var aVisibleFields = this.getVisibleSelectionsWithDefaults();
			for (var i = 0; i < aVisibleFields.length; i++) {
				if (!oSelectionVariant.getValue(aVisibleFields[i])) {
					oSelectionVariant.addSelectOption(aVisibleFields[i], "I", "EQ", "");
				}
			}
			return {
				selectionVariant: oSelectionVariant.toJSONString(),
				tableVariantId: this.oSmartTable.getCurrentVariantId(),
				customData: this.getCustomAppStateData()
			};
		},

		getCustomAppStateData: function() {
			// add custom data for back navigation
			var oCustomData = {};
			if (this.getCustomAppStateDataExtension) {
				this.getCustomAppStateDataExtension(oCustomData);
			}
			return oCustomData;
		},

		restoreCustomAppStateData: function(oCustomData) {
			// perform custom logic for restoring the custom data of the app state
			if (this.restoreCustomAppStateDataExtension) {
				this.restoreCustomAppStateDataExtension(oCustomData);
			}
		},

		getVisibleSelectionsWithDefaults: function() {
			// We need a list of all selection fields in the SmartFilterBar for which defaults are defined
			// (see method setSmartFilterBarDefaults) and which are currently visible.
			// This is needed by _getBackNavigationParameters in the NavigationController.
			var aVisibleFields = [];
			// if(this.oView.byId(this.sPrefix + ".DateKeyDate").getVisible()){
			// aVisibleFields.push("KeyDate");
			// }
			return aVisibleFields;
		},

		onInitSmartFilterBar: function(oEvent) {
			if (this.onInitSmartFilterBarExtension) {
				this.onInitSmartFilterBarExtension(oEvent);
			}
			this.bFilterBarInitialized = true;
			this.initAppState();
		},

		onBeforeRebindTable : function(oEvent){
			sap.suite.ui.generic.template.lib.TemplateViewController.prototype.onBeforeRebindTable.apply(this, arguments);

			if (this.onBeforeRebindTableExtension) {
				this.onBeforeRebindTableExtension(oEvent);
			}
		},

		onExit: function() {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		},

		getTable: function() {
			var oSmartTable = this.getView().byId("listReport");
			return oSmartTable.getTable();
		},

		// replaced by TemplateViewController.js - onCallActionFromList
		onCallAction: function(oEvent) {
			this.onCallActionFromList(oEvent, this.oSmartFilterBar);
		},
		/*onCallAction: function(oEvent) {
			var oSelectedContext = this.getSelectedContext();
			var oCustomData = this.getCustomData(oEvent);
			if (oSelectedContext) {

				if (oCustomData.Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
					this.oBaseViewController.callAction({
						functionImportPath : oCustomData.Action,
						context : oSelectedContext,
						sourceControl : oEvent.getSource().getParent().getParent().getTable(),
						label : oCustomData.Label
					});
				} else if (this.oNavigationHandler) {
					var mSemanticAttributes = oSelectedContext.getObject();
					delete mSemanticAttributes.__metadata;
					var sSelectionVariant = this.oSmartFilterBar.getDataSuiteFormat() || "{}";
					var mOutboundParameters = this.oNavigationHandler.mixAttributesAndSelectionVariant(mSemanticAttributes, sSelectionVariant).toJSONString();
					var oInnerAppData = {
						selectionVariant: this.oSmartFilterBar.getDataSuiteFormat(),
						tableVariantID: this.oSmartTable.getCurrentVariantId()
					};
					var fCallbackOnError = jQuery.proxy(this._handleError, this);
					this.oNavigationHandler.navigate(oCustomData.SemanticObject, oCustomData.Action, mOutboundParameters, oInnerAppData, fCallbackOnError);
				}
			}
		},

		getCustomData: function(oEvent) {
			var aCustomData = oEvent.getSource().getCustomData();
			var oCustomData = {};
			for (var i = 0; i < aCustomData.length; i++) {
				oCustomData[aCustomData[i].getKey()] = aCustomData[i].getValue();
			}
			return oCustomData;
		},*/

		getSelectedContext: function() {
			var oTable = this.getTable();

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
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
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

		onSearchButtonPressed: function() {
            //store navigation context
			this.storeForBackNavigation();
		},

		onBeforePopoverOpens: function(oEvent) {
			if (this.oNavigationHandler) {
				var oParams = oEvent.getParameters();
				var sSelectionVariant = this.oSmartFilterBar.getDataSuiteFormat();
				this.oNavigationHandler.processBeforeSmartLinkPopoverOpens(oParams, sSelectionVariant);
			} else {
				oEvent.getParameters().open();
			}
		},

		onPopoverLinkPressed: function() {
			this.storeForBackNavigation();
		},

		onAfterTableVariantSave: function() {
			this.storeForBackNavigation();
		},

		onAfterApplyTableVariant: function() {
			this.storeForBackNavigation();
		},

		onBeforeSFBVariantSave: function(oEvent) {
			/*
			 * When the app is started, the VariantManagement of the SmartFilterBar saves the initial state in the STANDARD (=default) variant and
			 * therefore this event handler is called. We do not need to store the inner app state in this case, because it is the initial state. Only
			 * for variants, saved by the user, storeForBackNavigation must be called.
			 */
			if (oEvent.getParameter("context") !== "STANDARD") {
				this.oSmartFilterBar.setFilterData({"_CUSTOM": this.getCustomAppStateData()});			
			}
			//store navigation context
			this.storeForBackNavigation();
		},

		onAfterSFBVariantLoad: function() {
			var oData = this.oSmartFilterBar.getFilterData();
			if (oData["_CUSTOM"] !== undefined) {
				this.restoreCustomAppStateData(oData["_CUSTOM"]);
			}
			//store navigation context
			this.storeForBackNavigation();
		},

		storeForBackNavigation: function() {
			try {
				this.storeCurrentAppState();
			} catch (err) {
				jQuery.sap.log.error("ListReport.storeForBackNavigation: " + err);
			}
		},

		// ---------------------------------------------
		// EVENT HANDLERS FOR COLLABORATION ACTIONS
		// ---------------------------------------------

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 *
		 * @public
		 */
		onShareEmailPress: function() {
			var oRessouceBundle = this.getView().getModel("i18n").getResourceBundle();
			try {
				// refresh link before using document.URL
				this.storeCurrentAppState().done(function() {
					sap.m.URLHelper.triggerEmail(null, oRessouceBundle.getText("EMAIL_HEADER", [
						oRessouceBundle.getText("PAGEHEADER")
					]), document.URL);
				});
			} catch (err) {
				jQuery.sap.log.error("ListReport.onShareInJamPress: " + err);
				// URL with updated app state could not be generated. Just use the current URL instead.
				sap.m.URLHelper.triggerEmail(null, oRessouceBundle.getText("EMAIL_HEADER", [
					oRessouceBundle.getText("PAGEHEADER")
				]), document.URL);
			}
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 *
		 * @public
		 */
		onShareInJamPress: function() {
			var oRessouceBundle = this.getView().getModel("i18n").getResourceBundle();
			try {
				// refresh link before using document.URL
				this.storeCurrentAppState().done(function() {
					var oShareDialog = sap.ui.getCore().createComponent({
						name: "sap.collaboration.components.fiori.sharing.dialog",
						settings: {
							object: {
								id: document.URL,
								share: oRessouceBundle.getText("PAGEHEADER")
							}
						}
					});
					oShareDialog.open();
				});
			} catch (err) {
				jQuery.sap.log.error("ListReport.onShareInJamPress: " + err);
				// URL with updated app state could not be generated. Just use the current URL instead.
				var oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: document.URL,
							share: oRessouceBundle.getText("PAGEHEADER")
						}
					}
				});
				oShareDialog.open();
			}
		},

		/**
		 * Event handler that changes the URL based on the current app state before the bookmark button is pressed
		 *
		 * @public
		 */
		onBeforePressBookmark: function() {
			try {
				// refresh link before using document.URL as bookmark
				this.storeCurrentAppState();
			} catch (err) {
				// URL with updated app state could not be generated. Just use the current URL instead.
				jQuery.sap.log.error("ListReport.onBeforePressBookmark: " + err);
			}
		},

		// ---------------------------------------------
		// END COLLABORATION ACTIONS
		// ---------------------------------------------

		onNavigateToDetail: function(oEvent) {
			var oSelectedContext = this.getSelectedContext();
			this.navigateFromListItem(oSelectedContext, this.getTable());
		},

		// ---------------------------------------------
		// MISC
		// ---------------------------------------------

		_handleError: function(oError) {
			if (oError instanceof Error) {
				oError.showMessageBox();
			}
		}

	});

	return oListReportController;

}, /* bExport= */true);
