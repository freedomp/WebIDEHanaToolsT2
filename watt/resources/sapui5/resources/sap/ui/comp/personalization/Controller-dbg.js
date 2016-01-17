/* eslint-disable strict */

/*
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP SE. All rights reserved
 */

// Provides Controller
sap.ui.define([
	'jquery.sap.global', 'sap/ui/base/ManagedObject', './ColumnsController', './FilterController', './GroupController', './SortController', './Util', 'sap/ui/comp/library'
], function(jQuery, ManagedObject, ColumnsController, FilterController, GroupController, SortController, Util, CompLibrary) {
	"use strict";

	/**
	 * Constructor for a new controller of P13nDialog.
	 * 
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The personalization Controller provides capabilities in order to orchestrate the P13nDialog.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version 1.32.7
	 * @constructor
	 * @experimental This module is only for internal/experimental use!
	 * @private
	 * @since 1.26.0
	 * @alias sap.ui.comp.personalization.Controller
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Controller = ManagedObject.extend("sap.ui.comp.personalization.Controller", /** @lends sap.ui.comp.personalization.Controller */
	{
		constructor: function(sId, mSettings) {
			ManagedObject.apply(this, arguments);
		},
		metadata: {
			publicMethods: [
				"setPersonalizationData"
			],
			properties: {

				/**
				 * For each panel type, the <code>setting</code> property can contain <code>visible</code>, <code>controller</code>,
				 * <code>payload</code> and <code>ignoreColumnKeys</code> attributes can be defined. The <code>setting</code> property is used
				 * in a black list, meaning that specific panels can be overwritten. In this example, the Group panel will not be shown, and for the
				 * Columns panel the <code>visibleItemsThreshold</code> is set to 10. The attribute <code>ignoreColumnKeys</code> provides an
				 * array of column keys which should be ignored in the Columns panel. Additionally, a new controller instance can be defined.
				 * 
				 * <pre><code>
				 * {
				 * 	group: {
				 * 		visible: false,
				 * 		ignoreColumnKeys: []
				 * 	},
				 * 	columns: {
				 * 		visible: true,
				 * 		payload: {
				 * 			visibleItemsThreshold: 10
				 * 		},
				 * 		ignoreColumnKeys: [],
				 * 		controller: new sap.ui.comp.personalization.TestController(&quot;TestController&quot;)
				 * 	}
				 * }
				 * </code></pre>
				 */
				setting: {
					type: "object",
					defaultValue: null
				},
				/**
				 * The current state can be set back either to the state of initial table (ResetFull) or to the specific state of the table
				 * (ResetPartial) which has been set via <code>setPersonalizationData</code> method
				 */
				resetToInitialTableState: {
					type: "boolean",
					defaultValue: true
				}
			},
			associations: {
				/**
				 * Table on which the personalization will be performed.
				 */
				table: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {
				/**
				 * If a table is manipulated directly, such as column move, column resize etc., this event is raised <b>before</b> the action has
				 * been finished. However, that does not mean that the table is really changed. For example, the column touched could be moved to a
				 * new position or could also be dropped at the old position.
				 */
				beforePotentialTableChange: {},
				/**
				 * If a table is manipulated directly, such as column move, column resize etc., this event is raised <b>after</b> the action has been
				 * finished. However, that does not mean that the table is really changed. For example, the column touched could be moved to a new
				 * position or could also be dropped at the old position.
				 */
				afterPotentialTableChange: {},

				/**
				 * Event is fired if the personalization model data is changed
				 */
				afterP13nModelDataChange: {
					parameters: {
						/**
						 * Reason for change
						 */
						changeReason: {
							type: "sap.ui.comp.personalization.ResetType"
						},
						/**
						 * Fragment of model data in JSON format that is relevant for persistence.
						 */
						persistentData: {
							type: "object"
						},
						/**
						 * Fragment of model data in JSON format that has been changed since last <code>afterP13nModelDataChange</code> event was
						 * raised. Consumers of the personalization dialog have to react to it in order to sort or filter the table.
						 */
						changeData: {
							type: "object"
						},
						/**
						 * Information about what has been changed since last <code>afterP13nModelDataChange</code> event was raised. Consumers of
						 * the personalization dialog have to react to it in order to sort or filter the table.
						 */
						changeType: {
							type: "sap.ui.comp.personalization.ChangeType"
						},
						/**
						 * Information about what has been changed since last variant was set. Consumers of the personalization dialog have to react
						 * to it in order to show dirty flag.
						 */
						changeTypeVariant: {
							type: "sap.ui.comp.personalization.ChangeType"
						}
					}
				}
			},
			library: "sap.ui.comp"
		}

	});

	/**
	 * Setter for <code>setting</code> property. Using <code>setting</code> you can define whether a panel needs to be taken into account. If no
	 * <code>setting</code> has been defined for a particular panel, the default panel will be used. Once a controller <code>setting</code> has
	 * been set, the personalization dialog shows the number of panels as defined.
	 * 
	 * @overwrite
	 * @function
	 * @sap.ui.comp.personalization.Controller.prototype.setSetting
	 * @param {object} oSetting contains panel settings, such as visibility
	 * @returns {object} actual controller instance: this
	 */
	Controller.prototype.setSetting = function(oSetting) {
		oSetting = this.validateProperty("setting", oSetting);
		this.setProperty("setting", oSetting, true); // no rerendering
		if (!oSetting) {
			return this;
		}

		this._oSettingCurrent = Util.copy(this._oSettingOriginal);

		for ( var type in oSetting) {
			if (oSetting[type].visible === false) {
				delete this._oSettingCurrent[type];
				continue;
			}
			if (this._oSettingCurrent[type] && this._oSettingCurrent[type].visible === true) {
				// Take over well known panels
				this._oSettingCurrent[type].controller = oSetting[type].controller ? oSetting[type].controller : this._oSettingCurrent[type].controller;
				this._oSettingCurrent[type].payload = oSetting[type].payload ? oSetting[type].payload : undefined;
				this._oSettingCurrent[type].ignoreColumnKeys = oSetting[type].ignoreColumnKeys ? oSetting[type].ignoreColumnKeys : [];
			} else {
				// Take over custom panels
				this._oSettingCurrent[type] = {
					visible: oSetting[type].visible,
					controller: oSetting[type].controller ? oSetting[type].controller : undefined,
					payload: oSetting[type].payload ? oSetting[type].payload : undefined,
					ignoreColumnKeys: oSetting[type].ignoreColumnKeys ? oSetting[type].ignoreColumnKeys : []
				};
			}
		}

		// Do some checks on updated '_oSettingCurrent'
		this._removeUnsupportedNamespaces();
		this._checkIgnoredColumnKeys();

		this._masterSync(Controller.SyncReason.NewSetting, null);
		return this;
	};

	/**
	 * @overwrite
	 * @function
	 * @sap.ui.comp.personalization.Controller.prototype.setTable
	 * @param {object} oTable contains the table instance for which personalization is done
	 * @returns {object} actual controller instance: this
	 */
	Controller.prototype.setTable = function(oTable) {
		this.setAssociation("table", oTable);
		if (!oTable) {
			return this;
		}
		this._removeUnsupportedNamespaces();
		this._checkIgnoredColumnKeys();

		var aColumns = this.getTable().getColumns();

		if (!Util.isConsistent(aColumns)) {
			throw "The table instance provided contain some columns for which a columnKey is provided, some for which a columnKey is not provided. This is not allowed ! ";
		}

		this._masterSync(Controller.SyncReason.NewTable, null);
		return this;
	};

	Controller.prototype.getTable = function() {
		var oTable = this.getAssociation("table");
		if (typeof oTable === "string") {
			oTable = sap.ui.getCore().byId(oTable);
		}
		return oTable;
	};

	Controller.prototype.getModel = function() {
		return this._oModel;
	};

	/**
	 * Initializes the personalization Controller instance after creation.
	 * 
	 * @protected
	 */
	Controller.prototype.init = function() {
		var that = this;
		this._oDialog = null;
		this._oPayload = null;
		this._oPersistentDataRestore = null;
		this._oPersistentDataCurrentVariant = null;
		this._oPersistentDataAlreadyKnown = null;
		this._oPersistentDataBeforeOpen = null;
		this._oModel = null;
		this._aColumnKeysOfDateType = [];

		// default: all panels are set to visible

		// NOTE: instantiating the sub-Controllers only when opening the dialog is
		// too late since this data could be set before this and we expect
		// sub-Controllers to handle these data
		this._oSettingOriginal = {
			columns: {
				controller: new ColumnsController({
					afterColumnsModelDataChange: function(oEvent) {
						that._fireChangeEvent();
					},
					beforePotentialTableChange: function(oEvent) {
						that.fireBeforePotentialTableChange();
					},
					afterPotentialTableChange: function(oEvent) {
						that.fireAfterPotentialTableChange();
					}
				}),
				visible: true
			},
			sort: {
				controller: new SortController({
					afterSortModelDataChange: function(oEvent) {
						that._fireChangeEvent();
					},
					beforePotentialTableChange: function(oEvent) {
						that.fireBeforePotentialTableChange();
					},
					afterPotentialTableChange: function(oEvent) {
						that.fireAfterPotentialTableChange();
					}
				}),
				visible: true
			},
			filter: {
				controller: new FilterController({
					afterFilterModelDataChange: function(oEvent) {
						that._fireChangeEvent();
					},
					beforePotentialTableChange: function(oEvent) {
						that.fireBeforePotentialTableChange();
					},
					afterPotentialTableChange: function(oEvent) {
						that.fireAfterPotentialTableChange();
					}
				}),
				visible: true
			},
			group: {
				controller: new GroupController({
					afterGroupModelDataChange: function(oEvent) {
						that._fireChangeEvent();
					},
					beforePotentialTableChange: function(oEvent) {
						that.fireBeforePotentialTableChange();
					},
					afterPotentialTableChange: function(oEvent) {
						that.fireAfterPotentialTableChange();
					}
				}),
				visible: true
			}
		};

		this._oSettingCurrent = Util.copy(this._oSettingOriginal);
		this._oInitialVisiblePanelType = this._getInitialVisiblePanelType();
	};

	/**
	 * Opens the personalization dialog
	 * 
	 * @param {object} oSettingsForOpen contains additional settings information for opening the dialog with its panels. Settings information is used
	 *        in the manner of white list, meaning that only specified panels are considered. Example for a dialog with sort and filter panels:
	 * 
	 * <pre><code>
	 * {
	 * 	sort: {
	 * 		visible: true
	 * 	},
	 * 	filter: {
	 * 		visible: true
	 * 	}
	 * }
	 * </code></pre>
	 */
	Controller.prototype.openDialog = function(oSettingsForOpen) {

		// we assume at this point that the binding is done !!
		this._masterSync(Controller.SyncReason.NewTableBinding, null);

		this._oDialog = new sap.m.P13nDialog({
			stretch: sap.ui.Device.system.phone,
			showReset: true,
			initialVisiblePanelType: this._oInitialVisiblePanelType,
			validationExecutor: jQuery.proxy(this._handleDialogValidate, this)
		});

		// Set compact style class if the table is compact too
		this._oDialog.toggleStyleClass("sapUiSizeCompact", !!jQuery(this.getTable().getDomRef()).closest(".sapUiSizeCompact").length);

		var oSettingForOpen = this._mixSetting(this._oSettingCurrent, oSettingsForOpen);

		var oPanels = this._callControllers(oSettingForOpen, "getPanel");
		for ( var type in oSettingForOpen) {
			if (oPanels[type]) {
				this._oDialog.addPanel(oPanels[type]);
			}
		}

		this._oPersistentDataBeforeOpen = this._getPersistentDataCopy();

		this._oDialog.attachOk(this._handleDialogOk, this);
		this._oDialog.attachCancel(this._handleDialogCancel, this);
		this._oDialog.attachReset(this._handleDialogReset, this);
		this._oDialog.attachAfterClose(this._handleDialogAfterClose, this);

		this._oDialog.open();
	};

	Controller.prototype._mixSetting = function(oSettingGlobal, oSetting) {
		if (!oSetting) {
			return oSettingGlobal;
		}
		for ( var type in oSetting) {
			if (oSetting[type].visible && oSettingGlobal[type] && oSettingGlobal[type].visible) {
				oSetting[type].controller = oSettingGlobal[type].controller;
				// Payload on oSetting has higher priority then payload on oSettingGlobal
				if (!oSetting[type].payload) {
					oSetting[type].payload = oSettingGlobal[type].payload;
				}
			}
		}
		return oSetting;
	};

	sap.ui.comp.personalization.Controller.prototype._getSettingOfPanels = function() {
		if (!this._oDialog || !this._oDialog.getPanels()) {
			return {};
		}
		var oSetting = {};
		this._oDialog.getPanels().forEach(function(oPanel) {
			var sType = oPanel.getType();
			oSetting[sType] = {
				controller: this._oSettingCurrent[sType].controller,
				visible: this._oSettingCurrent[sType].visible
			};
		}, this);
		return oSetting;
	};

	Controller.prototype._getPersistentDataCopy = function() {
		var oPersistentData = {};
		if (this.getModel() && this.getModel().getData().persistentData) {
			oPersistentData = Util.copy(this.getModel().getData().persistentData);
		}
		return oPersistentData;
	};

	/**
	 * Setter for personalization model. Note: for data of type Date the object instance is expected and not string representation.
	 * 
	 * @param{object} oNewPersistentData contains personalization data that is taken over into the model
	 */
	Controller.prototype.setPersonalizationData = function(oNewPersistentData) {
		if (!this._sanityCheck(oNewPersistentData)) {
			return;
		}

		this._masterSync(Controller.SyncReason.NewModelData, oNewPersistentData);

		if (this.getTable() && this.getTable().setFixedColumnCount) {
			this.getTable().setFixedColumnCount(0);
		}

		this._fireChangeEvent();

		// The variable "this._oPersistentDataAlreadyKnown" is already set up-to-date in _fireChangeEvent()
	};

	/**
	 * @param {sap.ui.comp.personalization.ResetType} sResetType is optional.
	 */
	Controller.prototype.resetPersonalization = function(sResetType) {
		// TODO: compare with _handleDialogReset: make common method and parameter 'silent' 'isOpen'

		var bResetToInitialTableState = this.getResetToInitialTableState();
		if (sResetType === sap.ui.comp.personalization.ResetType.ResetFull || sResetType === sap.ui.comp.personalization.ResetType.ResetPartial) {
			bResetToInitialTableState = (sResetType === sap.ui.comp.personalization.ResetType.ResetFull);
		}

		if (bResetToInitialTableState) {
			this._masterSync(Controller.SyncReason.ResetModelData, null);
			this._fireChangeEvent(sap.ui.comp.personalization.ResetType.ResetFull);
		} else {
			this._masterSync(Controller.SyncReason.ResetModelDataVariant, null);
			this._fireChangeEvent(sap.ui.comp.personalization.ResetType.ResetPartial);

		}
		// The variable "this._oPersistentDataAlreadyKnown" is already set up-to-date in _fireChangeEvent()
	};

	/**
	 * Handle the dialog "reset" event
	 * 
	 * @param {object} oEvent is of type sap.ui.base.Event and contains information about source object where event was raised
	 */
	Controller.prototype._handleDialogReset = function(oEvent) {
		if (this.getResetToInitialTableState()) {
			this._masterSync(Controller.SyncReason.ResetModelData, null);
		} else {
			this._masterSync(Controller.SyncReason.ResetModelDataVariant, null);
		}

		var relevantControllers = this._getSettingOfPanels();
		this._callControllers(relevantControllers, "onAfterReset", oEvent.getParameter("payload"));

		// Note: do not fire event since triggering reset does not mean that this reset will be actually submitted.
		// Could even consider to hold back _masterSync

	};

	/**
	 * Handle the dialog "close" event
	 * 
	 * @param {object} oEvent is of type sap.ui.base.Event and contains information about source object where event was raised
	 */
	Controller.prototype._handleDialogCancel = function(oEvent) {

		this._oDialog.detachCancel(this._handleDialogCancel, this);

		this._oDialog.close();
	};

	/**
	 * Handle the dialog "ok" event
	 * 
	 * @param {object} oEvent is of type sap.ui.base.Event and contains information about source object where event was raised
	 */
	Controller.prototype._handleDialogOk = function(oEvent) {

		this._oDialog.detachOk(this._handleDialogOk, this);

		// TODO: consider to improve this ! Perhaps better to transport payload as custom data on dialog though then we must potentially take more
		// care about life cycle of the dialog
		this._oPayload = {
			trigger: "ok",
			payload: oEvent.getParameter("payload")
		};

		this._oDialog.close();
	};

	/**
	 * Handles the Validate event of the dialog.
	 * 
	 * @param {object} oEvent is of type sap.ui.base.Event and contains payload and callback function.
	 */
	Controller.prototype._handleDialogValidate = function(oPayload) {
		var oSetting = this._getSettingOfPanels();
		var oPersistentDataTotal = this._callControllers(oSetting, "getUnionData", Util.copy(this._oPersistentDataRestore), this._getPersistentDataCopy());
		return sap.ui.comp.personalization.Util.validate(oSetting, oPayload, this.getTable(), oPersistentDataTotal);
	};

	/**
	 * Get first property of current setting object
	 * 
	 * @returns {string} that represents the panel type
	 */
	Controller.prototype._getInitialVisiblePanelType = function() {
		for ( var type in this._oSettingCurrent) {
			return type;
		}
	};

	Controller.prototype._handleDialogAfterClose = function() {
		var that = this;
		var _oPayload = this._oPayload;

		// Store the latest open panel
		this._oInitialVisiblePanelType = this._oDialog.getVisiblePanel() ? this._oDialog.getVisiblePanel().getType() : this._getInitialVisiblePanelType();

		if (_oPayload && _oPayload.trigger === "ok") {
			setTimeout(function() {
				var oSettingOfVisiblePanels = that._getSettingOfPanels();
				if (that._oDialog) {
					that._oDialog.destroy();
					that._oDialog = null;
				}

				that._callControllers(oSettingOfVisiblePanels, "onAfterSubmit", that._oPayload.payload);
				that._oPayload = null;
				that._fireChangeEvent();
				that._oPersistentDataBeforeOpen = null;
			}, 0);

		} else {
			setTimeout(function() {
				if (that._oDialog) {
					that._oDialog.destroy();
					that._oDialog = null;
				}
				// call _masterSync only after dialog has been closed and destroyed, otherwise changing the model will update the
				// dialog's bindings which causes performance issues
				that._masterSync(Controller.SyncReason.NewModelData, that._oPersistentDataBeforeOpen);
				that._oPersistentDataBeforeOpen = null;
			}, 0);

		}

	};

	/**
	 * setSetting can be called after setTable() is called. It is recommended to avoid communicating with MiniControllers in case MiniControllers are
	 * not final yet.
	 * 
	 * @param {string} sUseCase for execution of masterSync
	 * @param {object} oNewPersistentData
	 */
	Controller.prototype._masterSync = function(sUseCase, oNewPersistentData) {
		var type = null, oJson = null;

		switch (sUseCase) {

			case Controller.SyncReason.NewTableBinding:

				this._callControllers(this._oSettingCurrent, "syncTable2TransientModel");
				break;

			case Controller.SyncReason.NewTable:

				this.initializeModel();
				// e.g. set up event handlers based on table instance
				this._callControllers(this._oSettingCurrent, "setTable", this.getTable());
				// Set model binding size dependent of column length in model data.
				// This is necessary as otherwise the table does show maximum 100 items.
				// We assume that filter with more than 1000 conditions is unrealistic
				this.getModel().setSizeLimit(this.getTable().getColumns().length + 1000);

				// take snapshot of table so that we can restore this state later
				this._callControllers(this._oSettingCurrent, "createTableRestoreJson");

				// no new persistent data was provided from outside - in this case the table instance represent the correct
				// state of persistent data which is why we update the persistent data from the table. There are limitations though,
				// since we cannot ask the table for filter and sort info e.g.
				this._callControllers(this._oSettingCurrent, "syncTable2PersistentModel");

				// re-build transient data to reflect 'final' state of table (TODO: lazy optimization possible, i.e. move to
				// getPanel e.g.)
				this._callControllers(this._oSettingCurrent, "syncTable2TransientModel");

				// Copy the current table state in order to put back in case that it is needed (aka standard variant).
				oJson = this._callControllers(this._oSettingCurrent, "getTableRestoreJson");
				this._oPersistentDataRestore = Util.copy(oJson);

				// TODO: should we check if _oPersistentDataCurrentVariant is existing first?
				this._oPersistentDataCurrentVariant = {};

				this._aColumnKeysOfDateType = [];

				// Notice that _getPersistentDataCopy() is equal to <subController>._getTable2Json
				this._oPersistentDataAlreadyKnown = Util.copy(this._oPersistentDataRestore);
				break;

			case Controller.SyncReason.NewSetting:

				this.initializeModel();
				// e.g. set up event handlers based on table instance
				if (this.getTable()) {
					this._callControllers(this._oSettingCurrent, "setTable", this.getTable());
					this.getModel().setSizeLimit(this.getTable().getColumns().length + 1000);
				}

				this._callControllers(this._oSettingCurrent, "setIgnoreColumnKeys");

				// take snapshot of table so that we can restore this state later
				this._callControllers(this._oSettingCurrent, "createTableRestoreJson");

				// no new persistent data was provided from outside - in this case the table instance represent the correct
				// state of persistent data which is why we update the persistent data from the table. There are limitations though,
				// since we cannot ask the table for filter and sort info e.g.
				this._callControllers(this._oSettingCurrent, "syncTable2PersistentModel");

				// re-build transient data to reflect 'final' state of table (TODO: lazy optimization possible, i.e. move to
				// getPanel e.g.)
				this._callControllers(this._oSettingCurrent, "syncTable2TransientModel");

				// Copy the current table state in order to put back in case that it is needed (aka standard variant).
				oJson = this._callControllers(this._oSettingCurrent, "getTableRestoreJson");
				this._oPersistentDataRestore = Util.copy(oJson);

				// this._oPersistentDataCurrentVariant = this._getPersistentDataCopy();

				// Notice that _getPersistentDataCopy() is equal to <subController>._getTable2Json
				this._oPersistentDataAlreadyKnown = Util.copy(this._oPersistentDataRestore);

				// Reduce data to current setting in case that setSetting() is called after setTable()
				for (type in this._oPersistentDataRestore) {
					if (!this._oSettingCurrent[type]) {
						delete this._oPersistentDataRestore[type];
					}
				}
				// Reduce data to current setting in case that setSetting() is called after setTable()
				for (type in this._oPersistentDataAlreadyKnown) {
					if (!this._oSettingCurrent[type]) {
						delete this._oPersistentDataAlreadyKnown[type];
					}
				}
				// Reduce data to current setting in case that setSetting() is called after setTable()
				for (type in this._oPersistentDataCurrentVariant) {
					if (!this._oSettingCurrent[type]) {
						delete this._oPersistentDataCurrentVariant[type];
					}
				}
				break;

			case Controller.SyncReason.NewModelData:
				if (oNewPersistentData === null) {
					oNewPersistentData = {};
				}

				// Note: when calling syncJsonModel2Table we need to ensure that we enrich oNewPersistentData with the
				// _oPersistentDataRestore (think of the example in which oNewPersistentData is empty then the table wouldn't be changed)

				var oPersistentDataTotal = this._callControllers(this._oSettingCurrent, "getUnionData", Util.copy(this._oPersistentDataRestore), Util.copy(oNewPersistentData));
				this.initializeModel(oPersistentDataTotal);

				this._callControllers(this._oSettingCurrent, "syncJsonModel2Table", oPersistentDataTotal);

				this._callControllers(this._oSettingCurrent, "reducePersistentModel");

				// re-build transient data to reflect 'final' state of table (TODO: lazy optimization possible, i.e. move to
				// getPanel e.g.)
				this._callControllers(this._oSettingCurrent, "syncTable2TransientModel");

				this._oPersistentDataCurrentVariant = Util.copy(oNewPersistentData);

				// Note: since the consumer in this case also wants the change events, we do *not* update the
				// _oPersistentDataAlreadyKnown here
				// this._oPersistentDataAlreadyKnown = this._getPersistentDataCopy();
				break;

			case Controller.SyncReason.ResetModelData:

				var oPersistentDataNew = this._projectRestoreData2PersistentModel4Panels(this._oPersistentDataRestore);
				this.initializeModel(oPersistentDataNew);

				// Note: persistentData to table is not enough since we must first revert table back to restore version - remember
				// oNewPersistentData is restore!
				this._callControllers(this._oSettingCurrent, "syncJsonModel2Table", Util.copy(oPersistentDataNew));

				this._callControllers(this._oSettingCurrent, "reducePersistentModel");

				// re-build transient data to reflect 'final' state of table (TODO: lazy optimization possible, i.e. move to
				// getPanel e.g.)
				this._callControllers(this._oSettingCurrent, "syncTable2TransientModel");

				// Note: since the consumer in this case also want the change events, we do *not* update the
				// _oPersistentDataAlreadyKnown here
				// this._oPersistentDataAlreadyKnown = this._getPersistentDataCopy();
				break;

			case Controller.SyncReason.ResetModelDataVariant:
							
				// Note: when calling syncJsonModel2Table we need to ensure that we enrich _oPersistentDataCurrentVariant with the
				// _oPersistentDataRestore (think of the example in which _oPersistentDataCurrentVariant is empty then the table wouldn't be
				// changed). This comment is similar to the one for "case Controller.SyncReason.ResetModelData:".
				var oPersistentDataNew = this._projectRestoreData2PersistentModel4Panels(this._oPersistentDataCurrentVariant);				
				var oPersistentDataCurrentVariantTotal = this._callControllers(this._oSettingCurrent, "getUnionData", Util.copy(this._oPersistentDataRestore), Util.copy(oPersistentDataNew));						
				this.initializeModel(oPersistentDataCurrentVariantTotal);
				
				this._callControllers(this._oSettingCurrent, "syncJsonModel2Table", oPersistentDataCurrentVariantTotal);

				this._callControllers(this._oSettingCurrent, "reducePersistentModel");

				this._callControllers(this._oSettingCurrent, "syncTable2TransientModel");

				// Note: since the consumer in this case also want the change events, we do *not* update the
				// _oPersistentDataAlreadyKnown here
				// this._oPersistentDataAlreadyKnown = this._getPersistentDataCopy();
				break;
			default:
		}
		this.getModel().refresh();
	};

	/**
	 * @param {object} oNewPersistentData for initializing the model
	 */
	Controller.prototype.initializeModel = function(oNewPersistentData) {
		if (!this.getModel()) {
			this._oModel = new sap.ui.model.json.JSONModel();
			this._oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		}

		var oNewPersistentDataCopy = null;
		if (oNewPersistentData) {
			oNewPersistentDataCopy = Util.copy(oNewPersistentData);
		}

		var oCurrentPersistentData = oNewPersistentDataCopy || ((this.getModel().getData() && this.getModel().getData().persistentData) ? this.getModel().getData().persistentData : {});

		// Reduce persistent data to current setting
		for ( var type in oCurrentPersistentData) {
			if (!this._oSettingCurrent[type]) {
				delete oCurrentPersistentData[type];
			}
		}

		this.getModel().setData({
			transientData: {},
			persistentData: oCurrentPersistentData
		});

		this._callControllers(this._oSettingCurrent, "initializeModel", this.getModel());
	};

	/**
	 * Fire 'afterP13nModelDataChange' event with model data and change information.
	 * 
	 * @param {sap.ui.comp.personalization.ResetType} sResetType is optional. Contains the reason why it has been changed
	 */
	Controller.prototype._fireChangeEvent = function(sResetType) {
		var oChangeInformation = {};
		// relevant change for consumer, delta : (restore + persistent) - oPersistentDataAlreadyKnown

		// oPersistentDataTotal : = restore + persistent, i.e. delta = oPersistentDataTotal - oPersistentDataAlreadyKnown
		var oPersistentDataTotal = this._callControllers(this._oSettingCurrent, "getUnionData", Util.copy(this._oPersistentDataRestore), this._getPersistentDataCopy());

		var sChangeType = this._callControllers(this._oSettingCurrent, "getChangeType", oPersistentDataTotal, Util.copy(this._oPersistentDataAlreadyKnown));

		var oPersistentDataCurrentVariantTotal = this._callControllers(this._oSettingCurrent, "getUnionData", Util.copy(this._oPersistentDataRestore), Util.copy(this._oPersistentDataCurrentVariant));
		oChangeInformation.changeTypeVariant = this._callControllers(this._oSettingCurrent, "getChangeType", oPersistentDataTotal, oPersistentDataCurrentVariantTotal);

		var oPersistentDataAlreadyKnownCopy = Util.copy(this._oPersistentDataAlreadyKnown);
		oChangeInformation.changeType = this._callControllers(this._oSettingCurrent, "getChangeType", oPersistentDataTotal, oPersistentDataAlreadyKnownCopy);

		if (!Util.hasChangedType(sChangeType) && !Util.hasChangedType(oChangeInformation.changeTypeVariant)) {
			return;
		}

		if (!this._aColumnKeysOfDateType.length && (Util.isNamespaceChanged(oChangeInformation.changeType, sap.m.P13nPanelType.filter) || Util.isNamespaceChanged(oChangeInformation.changeTypeVariant, sap.m.P13nPanelType.filter))) {
			this._aColumnKeysOfDateType = Util.getColumnKeysOfDateType(this.getTable());
		}

		if (sResetType === sap.ui.comp.personalization.ResetType.ResetFull || sResetType === sap.ui.comp.personalization.ResetType.ResetPartial) {
			oChangeInformation.changeReason = sResetType;
		}

		var oChangeData = this._callControllers(this._oSettingCurrent, "getChangeData", oPersistentDataTotal, oPersistentDataAlreadyKnownCopy);
		oChangeInformation.changeData = Util.removeEmptyProperty(oChangeData);
		Util.recoverPersonalisationData(oChangeInformation.changeData, this.getTable(), this._aColumnKeysOfDateType);

		var oPersistentDataRestoreCopy = Util.copy(this._oPersistentDataRestore);
		var oPersistentData = this._callControllers(this._oSettingCurrent, "getChangeData", oPersistentDataTotal, oPersistentDataRestoreCopy);
		oChangeInformation.persistentData = Util.removeEmptyProperty(oPersistentData);
		Util.recoverPersonalisationData(oChangeInformation.persistentData, this.getTable(), this._aColumnKeysOfDateType);

		this.fireAfterP13nModelDataChange(oChangeInformation);

		// calculate new version of 'AlreadyKnown' by adding above calculated 'small' delta to 'AlreadyKnown'
		this._oPersistentDataAlreadyKnown = this._callControllers(this._oSettingCurrent, "getUnionData", Util.copy(this._oPersistentDataAlreadyKnown), Util.copy(oChangeInformation.changeData));
	};

	Controller.prototype._projectRestoreData2PersistentModel4Panels = function(oPersistentData) {
		if (!this._oDialog || jQuery.isEmptyObject(oPersistentData)) {
			return oPersistentData;
		}
		var oPersistentDataCopy = this._getPersistentDataCopy();
		var aPanels = this._oDialog.getPanels();
		aPanels.forEach(function(oPanel) {
			if (oPersistentData[oPanel.getType()]) {
				oPersistentDataCopy[oPanel.getType()] = Util.copy(oPersistentData[oPanel.getType()]);
			} else {
				delete oPersistentDataCopy[oPanel.getType()];
			}
		});
		return oPersistentDataCopy;
	};

	Controller.prototype._checkIgnoredColumnKeys = function() {
		var oTable = this.getTable();
		if (!oTable) {
			return;
		}
		var aIgnoredColumnKeys = Util.getUnionOfAttribute(this._oSettingCurrent, "ignoreColumnKeys");
		var aVisibleColumnKeys = Util.getVisibleColumnKeys(oTable);
		aIgnoredColumnKeys.some(function(sColumnKey) {
			if (aVisibleColumnKeys.indexOf(sColumnKey) > -1) {
				throw "The provided 'ignoreColumnKeys' are inconsistent. No columns specified as ignored is allowed to be visible.";
			}
		});

		var that = this;
		oTable.getColumns().forEach(function(oColumn) {
			var fSetVisibleOrigin = jQuery.proxy(oColumn.setVisible, oColumn);
			var fSetVisibleOverwritten = function(bVisible) {
				if (bVisible) {
					var aIgnoredColumnKeys = Util.getUnionOfAttribute(that._oSettingCurrent, "ignoreColumnKeys");
					if (aIgnoredColumnKeys.indexOf(Util.getColumnKey(this)) > -1) {
						throw "The provided 'ignoreColumnKeys' are inconsistent. No column specified as ignored is allowed to be visible. " + this;
					}
				}
				fSetVisibleOrigin(bVisible);
			};
			if (oColumn.setVisible.toString() === fSetVisibleOverwritten.toString()) {
				// Do nothing if due to recursion the method is already overwritten.
				return;
			}
			oColumn.setVisible = fSetVisibleOverwritten;
		});
	};

	/**
	 * Special case for tables of type sap.ui.table.Table (with exception of AnalyticalTable). Currently sap.ui.table.Table does not support grouping
	 * feature as expected.
	 */
	Controller.prototype._removeUnsupportedNamespaces = function() {
		var oTable = this.getTable();
		if (oTable && oTable instanceof sap.ui.table.Table && !(oTable instanceof sap.ui.table.AnalyticalTable)) {
			delete this._oSettingCurrent.group;
		}
	};

	/**
	 * Gets arguments of corresponding type.
	 * 
	 * @param {array} aArgs contains all arguments in which the search for type is done
	 * @param {string} sType is the type for which the search is done
	 * @returns {array} aResult contains the identified arguments
	 */
	Controller.prototype._getArgumentsByType = function(aArgs, sType) {
		var aResult = [], oObject = null;

		if (aArgs && aArgs.length && sType) {
			aArgs.forEach(function(oArg) {
				if (oArg && oArg[sType] && typeof oArg[sType] !== "function") {
					oObject = {};
					oObject[sType] = oArg[sType];
					aResult.push(oObject);
				} else {
					aResult.push(oArg);
				}
			});
		}

		return aResult;
	};

	/**
	 * Calls a method "sMethodName" of all controllers in generic way.
	 * 
	 * @param {string} oSettings contains additional setting for execution of mini-controller methods
	 * @param {string} sMethodName that is executed in the mini-controller
	 * @returns {object} oResult contains the result of the called mini-controller method packaged into mini-controller specific namespace.
	 */
	Controller.prototype._callControllers = function(oSettings, sMethodName) {
		var type = null, oSetting = null, oController = null, aArgsPartially = null;
		var oResults = {}, aArgs = Array.prototype.slice.call(arguments, 2);

		for (type in oSettings) {
			oSetting = oController = aArgsPartially = null;

			oSetting = oSettings[type];
			oController = oSetting.controller;
			if (!oController || !oSetting.visible || !oController[sMethodName]) {
				continue;
			}
			aArgsPartially = this._getArgumentsByType(aArgs, type);
			if (sMethodName === "getPanel") {
				aArgsPartially.push(oSetting.payload);
			} else if (sMethodName === "setIgnoreColumnKeys") {
				aArgsPartially.push(oSetting.ignoreColumnKeys);
			}
			var oResult = oController[sMethodName].apply(oController, aArgsPartially);
			if (oResult !== null && oResult !== undefined && oResult[type] !== undefined) {
				oResults[type] = oResult[type];
			} else {
				oResults[type] = oResult;
			}
		}
		return oResults;
	};

	Controller.prototype._sanityCheck = function(oNewPersistentData) {
		// TODO: sanity check
		// Only allow the right format e.g. "sort.sortItems" but not "sort".
		// {} is also allowed i.e. all personalization data are deleted.
		// null is also allowed i.e. go back to restore
		return true;
	};

	/**
	 * Cleans up before destruction.
	 */
	Controller.prototype.exit = function() {
		var type;

		// destroy dialog
		if (this._oDialog) {
			this._oDialog.destroy();
			this._oDialog = null;
		}

		// destroy controller
		this._callControllers(this._oSettingCurrent, "destroy");
		for (type in this._oSettingCurrent) {
			this._oSettingCurrent[type] = null;
		}
		this._oSettingCurrent = null;
		for (type in this._oSettingOriginal) {
			this._oSettingOriginal[type] = null;
		}
		this._oSettingOriginal = null;

		// destroy model and its data
		if (this.getModel()) {
			this.getModel().destroy();
			this._oModel = null;
		}
		this._oPersistentDataRestore = null;
		this._oPersistentDataCurrentVariant = null;
		this._oPersistentDataAlreadyKnown = null;
		this._oPersistentDataBeforeOpen = null;
		this._oPayload = null;
	};

	Controller.SyncReason = {
		//
		NewTable: 0,
		// 
		NewSetting: 1,
		// 
		NewModelData: 2,
		//
		ResetModelData: 3,
		//
		ResetModelDataVariant: 4,
		//
		NewTableBinding: 5
	};

	/* eslint-enable strict */

	return Controller;

}, /* bExport= */true);
