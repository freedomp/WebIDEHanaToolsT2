/* eslint-disable strict */

/*
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP SE. All rights reserved
 */

// Provides ColumnsController
sap.ui.define([
	'jquery.sap.global', './BaseController', 'sap/m/library'
], function(jQuery, BaseController, library) {
	"use strict";

	// TODO: wenn an dem Column "Freeze" gesetzt wurde, sollte die Spalte nicht mehr verschoben werden können in dem
	// ColumnsPanel

	/**
	 * The ColumnsController can be used to...
	 * 
	 * @class Table Personalization Controller
	 * @extends sap.ui.comp.personalization.BaseController
	 * @author SAP SE
	 * @version 1.32.7
	 * @since 1.26.0
	 * @alias sap.ui.comp.ColumnsController
	 */
	var ColumnsController = BaseController.extend("sap.ui.comp.personalization.ColumnsController", /** @lends sap.ui.comp.personalization.ColumnsController */

	{
		constructor: function(sId, mSettings) {
			BaseController.apply(this, arguments);
			this.setType(sap.m.P13nPanelType.columns);
		},
		metadata: {
			/**
			 * Event is raised after columns data has been changed in data model
			 * 
			 * @since 1.26.0
			 */
			events: {
				afterColumnsModelDataChange: {}
			}
		}
	});

	ColumnsController.prototype.setTable = function(oTable) {
		BaseController.prototype.setTable.apply(this, arguments);

		if (oTable instanceof sap.ui.table.Table) {
			oTable.detachColumnMove(this._onColumnMove, this);
			oTable.detachColumnVisibility(this._onColumnVisibility, this);
			oTable.detachColumnResize(this._onColumnResize, this);
			oTable.attachColumnMove(this._onColumnMove, this);
			oTable.attachColumnVisibility(this._onColumnVisibility, this);
			oTable.attachColumnResize(this._onColumnResize, this);
		}

		// TODO: $ investigate this to avoid changing the transientData by e.g. variantChange
		// this._syncTable2TransientModel();
	};

	ColumnsController.prototype.getTitleText = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("PERSODIALOG_TAB_COLUMNS");
	};

	ColumnsController.prototype.reducePersistentModel = function() {
		this.syncTable2PersistentModel();
	};

	/**
	 * Does a complete JSON snapshot of the current table instance ("original") from the perspective of the columns controller; the JSON snapshot can
	 * later be applied to any table instance to recover all columns related infos of the "original" table
	 * 
	 * @returns {objects} JSON objects with meta data from existing table columns
	 */
	ColumnsController.prototype._getTable2Json = function() {
		var oJsonData = this.createPersistentStructure();
		var oTable = this.getTable();
		if (oTable) {
			oTable.getColumns().forEach(function(oColumn, iIndex) {
				if (sap.ui.comp.personalization.Util.isColumnIgnored(oColumn, this.getIgnoreColumnKeys())) {
					return;
				}
				oJsonData.columns.columnsItems.push({
					columnKey: sap.ui.comp.personalization.Util.getColumnKey(oColumn),
					index: (oColumn.getOrder ? oColumn.getOrder() : iIndex),
					visible: oColumn.getVisible(),
					width: oColumn.getWidth()
				});
			}, this);
		}

		return oJsonData;
	};

	ColumnsController.prototype.syncTable2PersistentModel = function() {

		// first put table representation into persistentData - full json representation
		BaseController.prototype.syncTable2PersistentModel.apply(this, arguments);

		// now reduce persistentData by subtracting the restoreJson from the full json representation
		var oData = this.getModel().getData();
		var oDelta = this.getChangeData(oData.persistentData, this.getTableRestoreJson());

		if (oDelta) {
			oData.persistentData.columns = oDelta.columns;
		} else {
			oData.persistentData.columns.columnsItems = [];
		}
	};

	ColumnsController.prototype.syncTable2TransientModel = function() {
		// this.getModel().getData().transientData.columns.items = jQuery.extend(true, [], this._aInitialTransientItems);
		// TODO: see ($)
		this._syncTable2TransientModel();
	};

	ColumnsController.prototype._determineTooltipText = function(oObject) {
		var sTooltip = null;

		if (oObject && oObject.getTooltip) {

			// first check whether actual object is extended by TooltipBase
			if (oObject.getTooltip() instanceof sap.ui.core.TooltipBase) {
				sTooltip = oObject.getTooltip().getTooltip_Text();
			} else {
				sTooltip = oObject.getTooltip_Text();
			}

			// If no tooltip exist now -> check whether oObject is of type analyticalColumn -> that have it's own way to get the tooltip via binding
			if (!sTooltip && oObject instanceof sap.ui.table.AnalyticalColumn) {
				sTooltip = oObject.getTooltip_AsString();
			}

			// for all other try to get tooltip from assigned label
			if (!sTooltip && oObject.getLabel && oObject.getLabel().getTooltip_Text) {
				sTooltip = oObject.getLabel().getTooltip_Text();
			}
		}

		return sTooltip;
	};

	ColumnsController.prototype._syncTable2TransientModel = function() {
		var oTable = this.getTable();
		var aItems = [];

		if (oTable) {
			if (oTable instanceof sap.ui.table.Table) {
				oTable.getColumns().forEach(function(oColumn) {
					if (sap.ui.comp.personalization.Util.isColumnIgnored(oColumn, this.getIgnoreColumnKeys())) {
						return;
					}
					var sTooltip = this._determineTooltipText(oColumn);
					aItems.push({
						columnKey: sap.ui.comp.personalization.Util.getColumnKey(oColumn),
						text: oColumn.getLabel().getText(),
						tooltip: sTooltip,
						visible: oColumn.getVisible(),
						width: oColumn.getWidth()
					});
				}, this);
			} else {
				if (oTable instanceof sap.m.Table) {
					var aColumns = oTable.getColumns();
					aColumns.sort(function(a, b) {
						var iIndexA = a.getOrder();
						var iIndexB = b.getOrder();
						if (iIndexA < iIndexB) {
							return -1;
						}
						if (iIndexA > iIndexB) {
							return 1;
						}
						return 0;
					});
					aColumns.forEach(function(oColumn) {
						if (sap.ui.comp.personalization.Util.isColumnIgnored(oColumn, this.getIgnoreColumnKeys())) {
							return;
						}
						aItems.push({
							columnKey: sap.ui.comp.personalization.Util.getColumnKey(oColumn),
							text: oColumn.getHeader().getText(),
							tooltip: (oColumn.getHeader().getTooltip() instanceof sap.ui.core.TooltipBase) ? oColumn.getHeader().getTooltip().getTooltip_Text() : oColumn.getHeader().getTooltip_Text(),
							visible: oColumn.getVisible(),
							width: oColumn.getWidth()
						});
					}, this);
				}
			}
		}

		// check if Items was changed at all and take over if it was changed
		var aItemsBefore = this.getModel().getData().transientData.columns.items;
		if (jQuery(aItems).not(aItemsBefore).length !== 0 || jQuery(aItemsBefore).not(aItems).length !== 0) {
			this.getModel().getData().transientData.columns.items = aItems;
		}

		// TODO: see ($)
		// this._aInitialTransientItems = jQuery.extend(true, [], this.getModel().getData().transientData.columns.items);
	};

	/**
	 * Set index into existing columnsItem. If it does not exist create new columnsItem with new index
	 * 
	 * @param {object} oData is the JSON based model data wherein the index shall be manipulated
	 * @param {object} oColumn is the table column
	 * @param {integer} iNewIndex is the index value that shall be set
	 * @private
	 */
	ColumnsController.prototype._setNewColumnItemIndex = function(oData, oColumn, iNewIndex) {
		var iColumnsItemIndex = -1;

		if (oColumn && iNewIndex !== null && iNewIndex !== undefined && iNewIndex > -1) {
			iColumnsItemIndex = sap.ui.comp.personalization.Util.getIndexByKey(oData.persistentData.columns.columnsItems, sap.ui.comp.personalization.Util.getColumnKey(oColumn));
			if (iColumnsItemIndex > -1) {
				oData.persistentData.columns.columnsItems[iColumnsItemIndex].index = iNewIndex;
			} else {
				oData.persistentData.columns.columnsItems.push({
					columnKey: sap.ui.comp.personalization.Util.getColumnKey(oColumn),
					index: iNewIndex
				});
			}
		}
	};

	/**
	 * Callback method for table event: ColumnMove
	 * 
	 * @param {object} oEvent that contains all information about that column move
	 * @private
	 */
	ColumnsController.prototype._onColumnMove = function(oEvent) {

		var i = 0, iNewIndex = null, oTempColumn = null;
		var oTable = null, oData = null, oColumn = null;
		var iNewColumnIndex = null, iOldColumnIndex = null;

		// get new columns information, like new index and the columns that was moved
		oColumn = oEvent.getParameter("column");
		iNewColumnIndex = oEvent.getParameter("newPos");

		this.fireBeforePotentialTableChange();

		// calculate "old" columns information
		if (oColumn) {
			oTable = this.getTable();
			iOldColumnIndex = oTable.indexOfColumn(oColumn);
		}

		// change index property in model data of columnsItems
		if (iOldColumnIndex !== null && iNewColumnIndex !== null) {
			oData = this.getModel().getData();

			if (iOldColumnIndex > iNewColumnIndex) {
				for (i = iNewColumnIndex; i <= iOldColumnIndex; i++) {
					if (i < iOldColumnIndex) {
						oTempColumn = oTable.getColumns()[i];
						iNewIndex = i + 1;
					} else {
						oTempColumn = oColumn;
						iNewIndex = oEvent.getParameter("newPos");
					}
					this._setNewColumnItemIndex(oData, oTempColumn, iNewIndex);
				}
			} else {
				for (i = iOldColumnIndex; i <= iNewColumnIndex; i++) {
					if (i === iOldColumnIndex) {
						oTempColumn = oColumn;
						iNewIndex = oEvent.getParameter("newPos");
					} else {
						oTempColumn = oTable.getColumns()[i];
						iNewIndex = i - 1;
					}
					this._setNewColumnItemIndex(oData, oTempColumn, iNewIndex);
				}
			}

			this.getModel().setData(oData, true);

			this.fireAfterPotentialTableChange();

			this.fireAfterColumnsModelDataChange();
		}
	};

	/**
	 * Callback method for table event: ColumnVisibility
	 * 
	 * @param {object} oEvent that contains all information about that column visibility
	 * @private
	 */
	ColumnsController.prototype._onColumnVisibility = function(oEvent) {
		var oData = this.getModel().getData();
		var oColumn = oEvent.getParameter("column");
		var bVisible = oEvent.getParameter("newVisible");

		this.fireBeforePotentialTableChange();

		var iIndex = sap.ui.comp.personalization.Util.getIndexByKey(oData.persistentData.columns.columnsItems, sap.ui.comp.personalization.Util.getColumnKey(oColumn));
		if (iIndex > -1) {
			oData.persistentData.columns.columnsItems[iIndex].visible = bVisible;
		} else {
			oData.persistentData.columns.columnsItems.push({
				columnKey: sap.ui.comp.personalization.Util.getColumnKey(oColumn),
				visible: bVisible
			});
		}
		this.getModel().setData(oData, true);

		this.fireAfterPotentialTableChange();

		this.fireAfterColumnsModelDataChange();
	};

	ColumnsController.prototype._onColumnResize = function(oEvent) {
		var oColumn = oEvent.getParameter("column");
		var oData = this.getModel().getData();

		this.fireBeforePotentialTableChange();

		var iIndex = sap.ui.comp.personalization.Util.getIndexByKey(oData.persistentData.columns.columnsItems, sap.ui.comp.personalization.Util.getColumnKey(oColumn));
		if (iIndex > -1) {
			oData.persistentData.columns.columnsItems[iIndex].width = oEvent.getParameter("width");
		} else {
			oData.persistentData.columns.columnsItems.push({
				columnKey: sap.ui.comp.personalization.Util.getColumnKey(oColumn),
				width: oEvent.getParameter("width")
			});
		}
		this.getModel().setData(oData, true);

		this.fireAfterPotentialTableChange();

		this.fireAfterColumnsModelDataChange();
	};

	/**
	 * Returns a ColumnsPanel control
	 * 
	 * @returns {sap.m.P13nColumnsPanel} returns a new created ColumnsPanel
	 */
	ColumnsController.prototype.getPanel = function(oPayload) {
		
		sap.ui.getCore().loadLibrary("sap.m");
		jQuery.sap.require("sap/m/P13nColumnsPanel");
		jQuery.sap.require("sap/m/P13nItem");
		jQuery.sap.require("sap/m/P13nColumnsItem");

		var that = this;
		var iVisibleItemsThreshold = -1;
		if (oPayload && oPayload.visibleItemsThreshold) {
			iVisibleItemsThreshold = oPayload.visibleItemsThreshold;
		}
		var oPanel = new sap.m.P13nColumnsPanel({
			title: this.getTitleText(),
			type: sap.m.P13nPanelType.columns,
			visibleItemsThreshold: iVisibleItemsThreshold,
			items: {
				path: '/transientData/columns/items',
				template: new sap.m.P13nItem({
					columnKey: '{columnKey}',
					text: '{text}',
					visible: '{visible}',
					tooltip: '{tooltip}',
					width: "{width}"
				})
			},
			columnsItems: {
				path: "/persistentData/columns/columnsItems",
				template: new sap.m.P13nColumnsItem({
					columnKey: "{columnKey}",
					index: "{index}",
					visible: "{visible}",
					width: "{width}"
				})
			},
			beforeNavigationTo: that.setModelFunction(that.getModel())
		});

		oPanel.attachChangeColumnsItems(function(oEvent) {
			var oData = this.getModel().getData();
			var aNewColumnsItems = oEvent.getParameter('newItems');
			var aExistingColumnsItems = oEvent.getParameter('existingItems');
			var oColumnsItem = null, sColumnKey = null;

			if (aNewColumnsItems) {
				aNewColumnsItems.forEach(function(oNewColumnsItem) {
					oColumnsItem = {
						columnKey: oNewColumnsItem.getColumnKey()
					};
					if (oNewColumnsItem.getIndex() !== undefined) {
						oColumnsItem.index = oNewColumnsItem.getIndex();
					}
					if (oNewColumnsItem.getVisible() !== undefined) {
						oColumnsItem.visible = oNewColumnsItem.getVisible();
					}
					if (oNewColumnsItem.getWidth() !== undefined) {
						oColumnsItem.width = oNewColumnsItem.getWidth();
					}
					oData.persistentData.columns.columnsItems.push(oColumnsItem);
				});
			}

			if (aExistingColumnsItems) {
				aExistingColumnsItems.forEach(function(oExistingColumnsItem) {
					oColumnsItem = null;
					sColumnKey = oExistingColumnsItem.getColumnKey();
					oColumnsItem = sap.ui.comp.personalization.Util.getArrayElementByKey("columnKey", sColumnKey, oData.persistentData.columns.columnsItems);
					if (oColumnsItem) {
						if (oExistingColumnsItem.getIndex() !== undefined) {
							oColumnsItem.index = oExistingColumnsItem.getIndex();
						}
						if (oExistingColumnsItem.getVisible() !== undefined) {
							oColumnsItem.visible = oExistingColumnsItem.getVisible();
						}
						if (oExistingColumnsItem.getWidth() !== undefined) {
							oColumnsItem.width = oExistingColumnsItem.getWidth();
						}
					}
				});
			}

		}, this);

		oPanel.attachSetData(function() {
			var oData = this.getModel().getData();
			this.getModel().setData(oData);
		}, this);

		this._correctColumnsItemsInPersistentData();
		return oPanel;
	};

	/**
	 * Callback from main controller after Reset button has been executed.
	 * 
	 * @param {object} oPayload that contains additional information from the panel
	 */
	ColumnsController.prototype.onAfterReset = function(oPayload) {
		var oPanel = null;
		if (oPayload && oPayload.columns && oPayload.columns.oPanel) {
			oPanel = oPayload.columns.oPanel;
			oPanel.reInitialize();
		}
	};

	/**
	 * Callback from main controller after OK button has been executed.
	 * 
	 * @param {object} oPayload that contains additional information from the panel
	 */
	ColumnsController.prototype.onAfterSubmit = function(oPayload) {
		this._correctColumnsItemsInPersistentData(oPayload);
		BaseController.prototype.onAfterSubmit.apply(this, arguments);
	};

	ColumnsController.prototype._correctColumnsItemsInPersistentData = function(oPayload) {
		this._removeIndexFromInvisibleColumnsItems();
		this._removeEmptyColumnsItems();
		if (oPayload) {
			this._correctColumnsItemIndexesBasedOnPayload(oPayload);
		}
	};

	/**
	 * This method recalculates indexes of all that columnsItems, which exist in payload -> selectedItems
	 * 
	 * @param {object} oPayload is an object that contains additional columnsPanel data, like list of selected items
	 */
	ColumnsController.prototype._correctColumnsItemIndexesBasedOnPayload = function(oPayload) {
		var aColumnsItems = this.getModel().getData().persistentData.columns.columnsItems;
		var oColumnsItem = null, iIndex = null, sColumnKey = null, iRunningTableIndex = -1;

		if (aColumnsItems && aColumnsItems.length > 0) {
			if (oPayload && oPayload.columns && oPayload.columns.tableItemsChanged) {

				oPayload.columns.selectedItems.forEach(function(oSelectedItem, iSelectedItemIndex) {
					iIndex = oColumnsItem = null;

					sColumnKey = oSelectedItem.columnKey;
					oColumnsItem = sap.ui.comp.personalization.Util.getArrayElementByKey("columnKey", sColumnKey, aColumnsItems);
					if (oColumnsItem && oColumnsItem.index !== undefined && oColumnsItem.index !== null) {
						iIndex = oColumnsItem.index;
					}
					if (iIndex === null || iIndex === undefined) {
						iIndex = iSelectedItemIndex;
					}

					/*
					 * Now consider special cases for indexes from existing columnsItems -> adapt iIndex
					 */

					// 1.) iIndex is lower than actual running sequence index -> increase the index to next higher index
					if (iIndex <= iRunningTableIndex) {
						iIndex = iRunningTableIndex + 1;
					}

					// 2.) iIndex is more than one sequence step away from actual running table index -> remove the gap
					if (Math.abs(iIndex - iRunningTableIndex) > 1) {
						iIndex = iRunningTableIndex + 1;
					}

					// write back new calculated index property value into actual columnsItem
					if (oColumnsItem) {
						oColumnsItem.index = iIndex;
					} else {
						oColumnsItem = {
							"columnKey": sColumnKey,
							"index": iIndex
						};
						aColumnsItems.push(oColumnsItem);
					}

					iRunningTableIndex = iIndex;
				});
			}
		}
	};

	/**
	 * This method removes all columnsItems that have no useful fill properties
	 */
	ColumnsController.prototype._removeEmptyColumnsItems = function() {
		var aColumnsItems = this.getModel().getData().persistentData.columns.columnsItems;
		var i = 0, iLength = 0, oColumnsItem = null;

		if (aColumnsItems && aColumnsItems.length) {
			iLength = aColumnsItems.length;
			for (i = 0; i < iLength; i++) {
				oColumnsItem = aColumnsItems[i];
				if (oColumnsItem) {
					if (oColumnsItem.index !== null && oColumnsItem.index !== undefined) {
						continue;
					}
					if (oColumnsItem.visible !== null && oColumnsItem.visible !== undefined) {
						continue;
					}
					if (oColumnsItem.width !== null && oColumnsItem.width !== undefined) {
						continue;
					}
					aColumnsItems.splice(i, 1);
					i -= 1;
				}
			}
		}
	};

	/**
	 * Removes the index property of <code>columnsItems</code> in persistent model data. If a <code>columnsItem</code> contains an index property
	 * but the same item is not visible (visible = false), the <code>index</code> property is removed. As a result, such a column is rearranged in
	 * alphabetically sorted columns list at the end of unselected columns inside the <code>P13nColumnsPanel</code>. For all the following
	 * <code>columnsItems</code> that contain an <code>index</code>property this correction has to be made as many times as
	 * <code>columnsItems</code> properties have been corrected.
	 */
	ColumnsController.prototype._removeIndexFromInvisibleColumnsItems = function() {
		var aColumnsItems = null, aItems = null, oItem = null, iIndexReduceFactor = 0;
		var oPersistentData = this.getModel().getData().persistentData;
		var oTransientData = this.getModel().getData().transientData;
		var bVisible = null;

		if (oPersistentData && oPersistentData.columns && oPersistentData.columns.columnsItems) {
			aColumnsItems = oPersistentData.columns.columnsItems;
			this._sortArrayByPropertyName(aColumnsItems, "index");
		}

		if (oTransientData && oTransientData.columns && oTransientData.columns.items) {
			aItems = oTransientData.columns.items;
		}

		if (aColumnsItems && aColumnsItems.length) {
			aColumnsItems.forEach(function(oColumnsItem) {
				oItem = bVisible = null;

				if (oColumnsItem.index !== undefined) {
					bVisible = oColumnsItem.visible;
					if (bVisible === undefined || bVisible === null) {
						oItem = sap.ui.comp.personalization.Util.getArrayElementByKey("columnKey", oColumnsItem.columnKey, aItems);
						if (oItem && oItem.visible !== undefined) {
							bVisible = oItem.visible;
						}
					}

					if (bVisible === false) {
						// if visible property of current columnsItem is FALSE & it contains an index property -> remove this index
						// property AND increase the indexReduceFactor
						delete oColumnsItem.index;
						iIndexReduceFactor += 1;
					} else {
						// But if visible property of current columnsItem is TRUE -> correct the index property according the
						// indexReduceFactor
						// An indexReduceFactor > 0 means that for at least one columnsItem the index was removed and for all
						// following the index property has to be correct by the indexReduceFactor
						if (oColumnsItem.index > 0 && oColumnsItem.index >= iIndexReduceFactor) {
							oColumnsItem.index -= iIndexReduceFactor;
						}
					}
				}
			});
		}
	};

	ColumnsController.prototype.syncJsonModel2Table = function(oJsonModel) {
		var oTable = this.getTable();
		var aItems = oJsonModel.columns.columnsItems;

		this.fireBeforePotentialTableChange();

		// Apply changes to a UI table
		if (oTable instanceof sap.ui.table.Table) {
			this._applyChangesToUiTableType(oTable, aItems);
		} else if (oTable instanceof sap.m.Table) {
			// Apply changes to a UI table
			this._applyChangesToMTableType(oTable, aItems);
		}

		this.fireAfterPotentialTableChange();
	};

	/**
	 * Applies changes to a table of type UI table
	 * 
	 * @param {object} oTable is the table where all personalization changes shall be allied to
	 * @param {array} aColumnsItems is an array with changes that shall be applied to oTable
	 */
	ColumnsController.prototype._applyChangesToUiTableType = function(oTable, aColumnsItems) {
		var aColumns = null, oTableColumn = null;
		var iFixedColumnCount = oTable.getFixedColumnCount();
		var iFixedColumnIndex = iFixedColumnCount === 0 ? iFixedColumnCount : iFixedColumnCount - 1;

		var fSetOrder = function(oColumnsItem, oTableColumn) {
			// Apply column order
			var iTableColumnIndex = oTable.indexOfColumn(oTableColumn);
			var iModelColumnIndex = oColumnsItem.index;
			if (iModelColumnIndex !== undefined && iTableColumnIndex !== iModelColumnIndex) {
				// TODO: was ist mit Binding, wenn Eintäge gelöscht und dann wieder hinzugefügt werden?
				oTable.removeColumn(oTableColumn);
				oTable.insertColumn(oTableColumn, iModelColumnIndex);
				// Remove "freeze" if a column was moved from the frozen zone out or column was moved inside of frozen zone.
				// Allowed is only column move outside of frozen zone.
				if (!(iTableColumnIndex > iFixedColumnIndex && iModelColumnIndex > iFixedColumnIndex)) {
					oTable.setFixedColumnCount(0);
				}
			}
		};

		var fSetVisibility = function(oColumnsItem, oTableColumn) {
			// Apply column visibility
			if (oColumnsItem.visible !== undefined && oTableColumn.getVisible() !== oColumnsItem.visible) {
				// TODO: was ist mit Binding, wenn das "Visible" Property im XML view gebunden ist?
				// In dem Beispiel von Markus K. wird die Spalte "Document Number" nicht auf Invisible gesetzt.
				oTableColumn.setVisible(oColumnsItem.visible);
			}
		};

		var fSetWidth = function(oColumnsItem, oTableColumn) {
			// Apply column width
			if (oColumnsItem.width !== undefined && oTableColumn.getWidth() !== oColumnsItem.width) {
				oTableColumn.setWidth(oColumnsItem.width);
			}
		};

		if (aColumnsItems.length) {
			aColumns = oTable.getColumns();

			// organize columnsItems by it's index to apply them in the right order
			aColumnsItems.sort(function(a, b) {
				if (a.index < b.index) {
					return -1;
				}
				if (a.index > b.index) {
					return 1;
				}
				return 0;
			});

			// apply columnsItems
			aColumnsItems.forEach(function(oColumnsItem) {
				oTableColumn = sap.ui.comp.personalization.Util.getColumn(oColumnsItem.columnKey, aColumns);
				if (oTableColumn) {
					fSetOrder(oColumnsItem, oTableColumn);
					fSetVisibility(oColumnsItem, oTableColumn);
					fSetWidth(oColumnsItem, oTableColumn);
				}
			});
		}
	};

	/**
	 * Applies changes to a table of type M table
	 * 
	 * @param {object} oTable is the table where all personalization changes shall be allied to
	 * @param {array} aColumnsItems is an array with changes that shall be applied to oTable
	 */
	ColumnsController.prototype._applyChangesToMTableType = function(oTable, aColumnsItems) {
		var oTableColumn = null, bTableRerenderingNeeded = false;
		var aColumns = oTable.getColumns();

		var fSetOrder = function(oColumnsItem, oTableColumn) {
			// Apply column order
			var iModelColumnIndex = oColumnsItem.index;
			if (iModelColumnIndex !== undefined) {
				oTableColumn.setOrder(iModelColumnIndex);
				bTableRerenderingNeeded = true;
			}
		};

		var fSetVisibility = function(oColumnsItem, oTableColumn) {
			// Apply column visibility
			if (oColumnsItem.visible !== undefined && oTableColumn.getVisible() !== oColumnsItem.visible) {
				oTableColumn.setVisible(oColumnsItem.visible);
			}
		};

		// organize columnsItems by it's index to apply them in the right order
		if (aColumnsItems.length) {
			aColumns = oTable.getColumns();

			aColumnsItems.sort(function(a, b) {
				if (a.index < b.index) {
					return -1;
				}
				if (a.index > b.index) {
					return 1;
				}
				return 0;
			});

			// apply columnsItems
			aColumnsItems.forEach(function(oColumnsItem) {
				oTableColumn = sap.ui.comp.personalization.Util.getColumn(oColumnsItem.columnKey, aColumns);
				if (oTableColumn) {
					fSetOrder(oColumnsItem, oTableColumn);
					fSetVisibility(oColumnsItem, oTableColumn);
				}
			});
		}
		// TODO: Check why table rerendering is needed for m.table when column is moved; change of visibility works fine
		if (bTableRerenderingNeeded) {
			oTable.rerender();
		}
	};

	/**
	 * Operations on columns are processed every time directly at the table. In case that something has been changed via Personalization Dialog or via
	 * user interaction at table, change is applied to the table.
	 * 
	 * @param {object} oPersistentDataBase (new) JSON object
	 * @param {object} oPersistentDataCompare (old) JSON object
	 * @returns {object} that represents the change type, like: Unchanged || TableChanged || ModelChanged
	 */
	ColumnsController.prototype.getChangeType = function(oPersistentDataBase, oPersistentDataCompare) {
		var oChangeData = this.getChangeData(oPersistentDataBase, oPersistentDataCompare);
		var that = this;
		if (oChangeData) {
			var oChangeType = sap.ui.comp.personalization.ChangeType.TableChanged;
			oChangeData.columns.columnsItems.some(function(oItem) {
				// analytical table needs to re-read data from backend even in case a column was made invisible !
				if (oItem.visible || (oItem.visible === false && that.getTable() instanceof sap.ui.table.AnalyticalTable)) {
					oChangeType = sap.ui.comp.personalization.ChangeType.ModelChanged;
					return true;
				}
			});
			return oChangeType;
		}
		return sap.ui.comp.personalization.ChangeType.Unchanged;
	};

	/**
	 * Result is XOR based difference = oPersistentDataBase - oPersistentDataCompare  (new - old) 
	 * 
	 * @param {object} oPersistentDataBase (new) JSON object which represents the current model state (Restore+PersistentData)
	 * @param {object} oPersistentDataCompare (old) JSON object which represents AlreadyKnown || Restore
	 * @returns {object} JSON object or null
	 */
	ColumnsController.prototype.getChangeData = function(oPersistentDataBase, oPersistentDataCompare) {
		// not valid
		if (!oPersistentDataCompare || !oPersistentDataCompare.columns || !oPersistentDataCompare.columns.columnsItems) {
			return null;
		}

		var oChangeData = {
			columns: sap.ui.comp.personalization.Util.copy(oPersistentDataBase.columns)
		};

		// If no changes inside of columns.columnsItems array, return null.
		// Note: the order inside of columns.columnsItems array is irrelevant.
		var bIsEqual = true;
		oPersistentDataBase.columns.columnsItems.some(function(oItem) {
			var oItemCompare = sap.ui.comp.personalization.Util.getArrayElementByKey("columnKey", oItem.columnKey, oPersistentDataCompare.columns.columnsItems);
			if (!sap.ui.comp.personalization.Util.semanticEqual(oItem, oItemCompare)) {
				// Leave forEach() as there are different items
				bIsEqual = false;
				return true;
			}
		});
		if (bIsEqual) {
			return null;
		}

		// If same items are different then delete equal properties and return the rest of item
		var aToBeDeleted = [];
		oChangeData.columns.columnsItems.forEach(function(oItem, iIndex) {
			var oItemCompare = sap.ui.comp.personalization.Util.getArrayElementByKey("columnKey", oItem.columnKey, oPersistentDataCompare.columns.columnsItems);
			if (sap.ui.comp.personalization.Util.semanticEqual(oItem, oItemCompare)) {
				// Condenser: remove items which are not changed in a chain
				aToBeDeleted.push(oItem);
				return;
			}
			for ( var property in oItem) {
				if (property === "columnKey" || !oItemCompare) {
					if (oItemCompare && oItemCompare[property] === undefined) {
						delete oItem[property];
					} else {
						continue;
					}
				}
				if (oItem[property] === oItemCompare[property]) {
					delete oItem[property];
				}
			}
			if (Object.keys(oItem).length < 2) {
				aToBeDeleted.push(oItem);
			}
		});
		aToBeDeleted.forEach(function(oItem) {
			var iIndex = sap.ui.comp.personalization.Util.getIndexByKey(oChangeData.columns.columnsItems, oItem.columnKey);
			oChangeData.columns.columnsItems.splice(iIndex, 1);
		});

		return oChangeData;
	};

	/**
	 * This method sorts a given ARRAY by a well defined property name of it's included objects. If it is required the array will be copied before.
	 * 
	 * @param {array} aArrayToBeSorted is the array that shall be sorted by the given property
	 * @param {string} sPropertyName is the property name that shall be taken as sorting criteria
	 * @param {Boolean} bTakeACopy is optional and desides whether the given arry shall be copied before its content will be sorted
	 * @returns {array} aSortedArray is the sorted array
	 */
	ColumnsController.prototype._sortArrayByPropertyName = function(aArrayToBeSorted, sPropertyName, bTakeACopy) {
		var aSortedArray = [];

		if (bTakeACopy === null || bTakeACopy === undefined) {
			bTakeACopy = false;
		}

		if (aArrayToBeSorted && aArrayToBeSorted.length > 0 && sPropertyName !== undefined && sPropertyName !== null && sPropertyName !== "") {

			if (bTakeACopy) {
				aSortedArray = jQuery.extend(true, [], aArrayToBeSorted);
			} else {
				aSortedArray = aArrayToBeSorted;
			}

			aSortedArray.sort(function(a, b) {
				var propertyA = a[sPropertyName];
				var propertyB = b[sPropertyName];
				if (propertyA < propertyB || (propertyA !== undefined && propertyB === undefined)) {
					return -1;
				}
				if (propertyA > propertyB || (propertyA === undefined && propertyB !== undefined)) {
					return 1;
				}
				return 0;
			});
		}

		return aSortedArray;
	};

	/**
	 * Sorts a given array by a well-defined property name of its included objects. If required, the array is copied before.
	 * 
	 * @param {array} aObjects is the array of objects in which the index properties are changed; aObjects needs to be sorted by the index property
	 * @param {int} iStartIndex is the start index from where the index properties shall be changed
	 * @param {int} iEndIndex is the end index to where the index properties shall be changed
	 */
	ColumnsController.prototype._recalculateIndexes = function(aObjects, iStartIndex, iEndIndex) {
		var iMinIndex = null, iMaxIndex = null, iMaxArrayIndex = null;

		if (!aObjects || !aObjects.length) {
			return;
		}

		iMaxArrayIndex = aObjects.length - 1;

		if (iStartIndex === null || iStartIndex === undefined || iStartIndex < 0 || iEndIndex === null || iEndIndex === undefined || iEndIndex < 0 || iEndIndex > iMaxArrayIndex || iStartIndex === iEndIndex) {
			return;
		}

		iMinIndex = Math.min(iStartIndex, iEndIndex);
		iMaxIndex = Math.max(iStartIndex, iEndIndex);

		// to be able to work with forEach and iIndex -> the array aObjects needs to be sorted!!
		aObjects.forEach(function(oObject, iIndex) {

			// check, whether actual object fit's into index ranges
			if (iIndex < iMinIndex || iIndex > iMaxIndex || iIndex > iMaxArrayIndex) {
				return;
			}

			if (iStartIndex > iEndIndex) {
				// UP
				oObject.index += 1;
			} else {
				// DOWN
				oObject.index -= 1;
			}
		});
	};

	/**
	 * @param {object} oPersistentDataBase: JSON object to which different properties from JSON oPersistentDataCompare are added. E.g. Restore
	 * @param {object} oPersistentDataCompare: JSON object from where the different properties are added to oPersistentDataBase. E.g. CurrentVariant ||
	 *        PersistentData
	 * @returns {object} new JSON object as union result of oPersistentDataBase and oPersistentDataCompare
	 */
	ColumnsController.prototype.getUnionData = function(oPersistentDataBase, oPersistentDataCompare) {

		// oPersistentDataCompare is empty -> result = oPersistentDataBase
		if (!oPersistentDataCompare || !oPersistentDataCompare.columns || !oPersistentDataCompare.columns.columnsItems || oPersistentDataCompare.columns.columnsItems.length === 0) {
			return oPersistentDataBase.columns ? {
				columns: jQuery.extend(true, {}, oPersistentDataBase.columns)
			} : null;
		}

		// oPersistentDataBase is empty -> result = oPersistentDataCompare
		if (!oPersistentDataBase || !oPersistentDataBase.columns || !oPersistentDataBase.columns.columnsItems) {
			return {
				columns: jQuery.extend(true, {}, oPersistentDataCompare.columns)
			};
		}

		var aDeltaColumnsItem = [];

		var oUnion = this.createPersistentStructure();

		oPersistentDataBase.columns.columnsItems.forEach(function(oColumnsItemPersistent, iIndex) {
			var oColumnsItemDelta = sap.ui.comp.personalization.Util.getArrayElementByKey("columnKey", oColumnsItemPersistent.columnKey, oPersistentDataCompare.columns.columnsItems);

			if (oColumnsItemDelta) {
				if (oColumnsItemDelta.visible !== undefined) {
					oColumnsItemPersistent.visible = oColumnsItemDelta.visible;
				}

				if (oColumnsItemDelta.width !== undefined) {
					oColumnsItemPersistent.width = oColumnsItemDelta.width;
				}

				if (oColumnsItemDelta.index !== undefined) {
					oColumnsItemPersistent.index = oColumnsItemDelta.index;
					aDeltaColumnsItem.push(oColumnsItemPersistent);
					return;
				}
			}
			oUnion.columns.columnsItems.push(oColumnsItemPersistent);
		});

		if (aDeltaColumnsItem && aDeltaColumnsItem.length > 0) {
			this._sortArrayByPropertyName(aDeltaColumnsItem, "index");
			aDeltaColumnsItem.forEach(function(oDeltaColumnsItem) {
				oUnion.columns.columnsItems.splice(oDeltaColumnsItem.index, 0, oDeltaColumnsItem);
			});
		}

		oUnion.columns.columnsItems.forEach(function(oColumnsItemUnion, iIndex) {
			oColumnsItemUnion.index = iIndex;
		});

		return oUnion;
	};

	/**
	 * Determines whether a specific column is selected or not.
	 * 
	 * @param {object} oPayload structure about the current selection coming from panel
	 * @param {string} sColumnKey column key of specific column
	 * @returns {boolean} true if specific column is selected, false if not
	 */
	ColumnsController.prototype.isColumnSelected = function(oPayload, oPersistentData, sColumnKey) {
		if (!oPayload) {
			oPersistentData.columnsItems.some(function(oColumnsItem, iIndex_) {
				if (oColumnsItem.columnKey === sColumnKey && oColumnsItem.visible) {
					iIndex = iIndex_;
					return true;
				}
			});
			return iIndex > -1;
		}

		// oPayload has been passed...
		if (!oPayload.selectedItems) {
			return false;
		}
		var iIndex = sap.ui.comp.personalization.Util.getIndexByKey(oPayload.selectedItems, sColumnKey);
		return iIndex > -1;
	};

	/**
	 * Cleans up before destruction.
	 * 
	 * @private
	 */
	ColumnsController.prototype.exit = function() {
		BaseController.prototype.exit.apply(this, arguments);

		var oTable = this.getTable();
		if (oTable && oTable instanceof sap.ui.table.Table) {
			oTable.detachColumnMove(this._onColumnMove, this);
			oTable.detachColumnVisibility(this._onColumnVisibility, this);
			oTable.detachColumnResize(this._onColumnResize, this);
		}
	};

	/* eslint-enable strict */

	return ColumnsController;

}, /* bExport= */true);
