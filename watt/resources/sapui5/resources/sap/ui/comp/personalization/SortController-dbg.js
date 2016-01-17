/*
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP SE. All rights reserved
 */

// Provides SortController
sap.ui.define([
	'jquery.sap.global', './BaseController', 'sap/m/library'
], function(jQuery, BaseController, library) {
	"use strict";

	/**
	 * The SortController can be used to...
	 * 
	 * @class Table Personalization Controller
	 * @extends sap.ui.comp.personalization.BaseController
	 * @author SAP
	 * @version 1.25.0-SNAPSHOT
	 * @alias sap.ui.comp.personalization.SortController
	 */
	var SortController = BaseController.extend("sap.ui.comp.personalization.SortController",
	/** @lends sap.ui.comp.personalization.SortController */
	{
		constructor: function(sId, mSettings) {
			BaseController.apply(this, arguments);
			this.setType(sap.m.P13nPanelType.sort);
		},
		metadata: {
			events: {
				afterSortModelDataChange: {}
			}
		}
	});

	SortController.prototype.setTable = function(oTable) {
		BaseController.prototype.setTable.apply(this, arguments);

		if (oTable instanceof sap.ui.table.Table) {
			oTable.detachSort(this._onSort, this);
			oTable.attachSort(this._onSort, this);
		}
	};

	SortController.prototype.getTitleText = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("PERSODIALOG_TAB_SORT");
	};

	/**
	 * this method will make a complete json snapshot of the current table instance ("original") from the perspective of the columns controller; the
	 * json snapshot can later be applied to any table instance to recover all columns related infos of the "original" table TODO: This really only
	 * works for when max 1 sort criteria is defined since otherwise potentially order of sort criteria is destroyed
	 */
	SortController.prototype._getTable2Json = function() {
		var oJsonData = this.createPersistentStructure();
		var oTable = this.getTable();
		sap.ui.comp.personalization.Util.createSort2Json(oTable, oJsonData.sort.sortItems, this.getIgnoreColumnKeys());
		return oJsonData;
	};

	SortController.prototype.syncTable2TransientModel = function() {
		var oTable = this.getTable();
		var aItems = [];

		if (oTable) {
			if (oTable instanceof sap.ui.table.Table) {
				oTable.getColumns().forEach(function(oColumn) {
					if (sap.ui.comp.personalization.Util.isColumnIgnored(oColumn, this.getIgnoreColumnKeys())) {
						return;
					}
					if (sap.ui.comp.personalization.Util.isSortable(oColumn)) {
						aItems.push({
							columnKey: sap.ui.comp.personalization.Util.getColumnKey(oColumn),
							text: oColumn.getLabel().getText(),
							tooltip: (oColumn.getTooltip() instanceof sap.ui.core.TooltipBase) ? oColumn.getTooltip().getTooltip_Text() : oColumn.getTooltip_Text()
						});
					}
				}, this);
			}
			if (oTable instanceof sap.m.Table) {
				oTable.getColumns().forEach(function(oColumn) {
					if (sap.ui.comp.personalization.Util.isColumnIgnored(oColumn, this.getIgnoreColumnKeys())) {
						return;
					}
					if (sap.ui.comp.personalization.Util.isSortable(oColumn)) {
						aItems.push({
							columnKey: sap.ui.comp.personalization.Util.getColumnKey(oColumn),
							text: oColumn.getHeader().getText(),
							tooltip: (oColumn.getHeader().getTooltip() instanceof sap.ui.core.TooltipBase) ? oColumn.getHeader().getTooltip().getTooltip_Text() : oColumn.getHeader().getTooltip_Text()
						});
					}
				}, this);
			}
		}

		sap.ui.comp.personalization.Util.sortItemsByText(aItems);

		aItems.splice(0, 0, {
			key: null,
			text: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_SELECTION_NONE")
		});

		// check if items was changed at all and take over if it was changed
		// TODO: clean up here
		var aItemsBefore = this.getModel().getData().transientData.sort.items;
		if (jQuery(aItems).not(aItemsBefore).length !== 0 || jQuery(aItemsBefore).not(aItems).length !== 0) {
			this.getModel().getData().transientData.sort.items = aItems;
		}
	};

	SortController.prototype._onSort = function(oEvent) {
		oEvent.preventDefault();
		var bAdded = oEvent.mParameters.columnAdded;

		var oTable = this.getTable();
		if (typeof oTable === "string") {
			oTable = sap.ui.getCore().byId(oTable);
		}

		this.fireBeforePotentialTableChange();

		// remove existing sortings
		if (!bAdded) {
			oTable.getColumns().forEach(function(oColumn, index) {
				if (oColumn.setSorted) {
					oColumn.setSorted(false);
				}
			}, this);
		}
		var oColumn = oEvent.mParameters.column;
		if (oColumn && oColumn.setSorted) {
			oColumn.setSorted(true);
			oColumn.setSortOrder(oEvent.mParameters.sortOrder);
		}

		var oSortData = this.getModel().getData().persistentData.sort;

		if (!bAdded) {
			oSortData.sortItems = [];
		}

		var i = sap.ui.comp.personalization.Util.getIndexByKey(oSortData.sortItems, sap.ui.comp.personalization.Util.getColumnKey(oColumn));
		if (i > -1) {
			oSortData.sortItems.splice(i, 1);
		}
		oSortData.sortItems.push({
			columnKey: sap.ui.comp.personalization.Util.getColumnKey(oColumn),
			operation: oEvent.mParameters.sortOrder
		});

		this.fireAfterPotentialTableChange();

		this.fireAfterSortModelDataChange();
	};

	SortController.prototype._hasTableSortableColumns = function() {
		var oTable = this.getTable();
		if (!oTable) {
			return false;
		}

		var bHasSorting = false;
		oTable.getColumns().some(function(oColumn) {
			if (sap.ui.comp.personalization.Util.isSortable(oColumn)) {
				bHasSorting = true;
				return true;
			}
		});

		return bHasSorting;
	};

	SortController.prototype.getPanel = function() {

		sap.ui.getCore().loadLibrary("sap.m");

		jQuery.sap.require("sap/m/P13nSortPanel");
		jQuery.sap.require("sap/m/P13nItem");
		jQuery.sap.require("sap/m/P13nSortItem");

		if (!this._hasTableSortableColumns()) {
			return null;
		}
		var that = this;
		var oPanel = new sap.m.P13nSortPanel({
			type: sap.m.P13nPanelType.sort,
			title: this.getTitleText(),
			containerQuery: true,
			items: {
				path: "/transientData/sort/items",
				template: new sap.m.P13nItem({
					columnKey: "{columnKey}",
					text: "{text}",
					tooltip: "{tooltip}",
					maxLength: "{maxlength}",
					type: "{type}"
				})
			},
			sortItems: {
				path: "/persistentData/sort/sortItems",
				template: new sap.m.P13nSortItem({
					columnKey: "{columnKey}",
					operation: "{operation}"
				})
			},
			beforeNavigationTo: that.setModelFunction(that.getModel())
		});

		oPanel.attachAddSortItem(function(oEvent) {
			var oData = this.getModel().getData();
			var params = oEvent.getParameters();
			var oSortItem = {
				columnKey: params.sortItemData.getColumnKey(),
				operation: params.sortItemData.getOperation()
			};
			if (params.index > -1) {
				oData.persistentData.sort.sortItems.splice(params.index, 0, oSortItem);
			} else {
				oData.persistentData.sort.sortItems.push(oSortItem);
			}
			this.getModel().setData(oData, true);
		}, this);

		oPanel.attachRemoveSortItem(function(oEvent) {
			var params = oEvent.getParameters();
			var oData = this.getModel().getData();
			if (params.index > -1) {
				oData.persistentData.sort.sortItems.splice(params.index, 1);
				this.getModel().setData(oData, true);
			}
		}, this);

		return oPanel;
	};

	SortController.prototype.syncJsonModel2Table = function(oJsonModel) {
		var oTable = this.getTable();
		var aColumns = oTable.getColumns();
		var aColumnsUnsorted = jQuery.extend(true, [], aColumns);

		this.fireBeforePotentialTableChange();

		if (oTable instanceof sap.ui.table.Table) {
			oJsonModel.sort.sortItems.forEach(function(oSortItem) {
				var oColumn = sap.ui.comp.personalization.Util.getColumn(oSortItem.columnKey, aColumns);
				if (!oColumn) {
					return;
				}
				if (!oColumn.getSorted()) {
					oColumn.setSorted(true);
				}
				if (oColumn.getSortOrder() !== oSortItem.operation) {
					oColumn.setSortOrder(oSortItem.operation);
				}
				aColumnsUnsorted.splice(aColumnsUnsorted.indexOf(oColumn), 1);
			});

			aColumnsUnsorted.forEach(function(oColumn) {
				if (oColumn && oColumn.getSorted()) {
					oColumn.setSorted(false);
				}
			});
		}

		this.fireAfterPotentialTableChange();
	};

	/**
	 * Operations on sorting are processed sometime directly at the table and sometime not. In case that something has been changed via
	 * Personalization Dialog the consumer of the Personalization Dialog has to apply sorting at the table. In case that sorting has been changed via
	 * user interaction at table, the change is instantly applied at the table.
	 * 
	 * @returns {sap.ui.comp.personalization.ChangeType}
	 */
	SortController.prototype.getChangeType = function(oPersistentDataBase, oPersistentDataCompare) {
		if (!oPersistentDataCompare || !oPersistentDataCompare.sort || !oPersistentDataCompare.sort.sortItems) {
			return sap.ui.comp.personalization.ChangeType.Unchanged;
		}
		var bIsDirty = JSON.stringify(oPersistentDataBase.sort.sortItems) !== JSON.stringify(oPersistentDataCompare.sort.sortItems);

		return bIsDirty ? sap.ui.comp.personalization.ChangeType.ModelChanged : sap.ui.comp.personalization.ChangeType.Unchanged;
	};

	/**
	 * Result is XOR based difference = oPersistentDataBase - oPersistentDataCompare
	 * 
	 * @param {object} oPersistentDataCompare JSON object. Note: if sortItems is [] then it means that all sortItems have been deleted
	 * @returns {object} JSON object or empty object
	 */
	SortController.prototype.getChangeData = function(oPersistentDataBase, oPersistentDataCompare) {

		if (!oPersistentDataBase || !oPersistentDataBase.sort || !oPersistentDataBase.sort.sortItems) {
			return {
				sort: {
					sortItems: []
				}
			};
		}

		if (!oPersistentDataCompare || !oPersistentDataCompare.sort || !oPersistentDataCompare.sort.sortItems) {
			return {
				sort: sap.ui.comp.personalization.Util.copy(oPersistentDataBase.sort)
			};
		}

		if (JSON.stringify(oPersistentDataBase.sort.sortItems) !== JSON.stringify(oPersistentDataCompare.sort.sortItems)) {
			return {
				sort: sap.ui.comp.personalization.Util.copy(oPersistentDataBase.sort)
			};
		}
		return null;
	};

	/**
	 * @param {object} oPersistentDataBase: JSON object to which different properties from JSON oPersistentDataCompare are added
	 * @param {object} oPersistentDataCompare: JSON object from where the different properties are added to oPersistentDataBase. Note: if sortItems is []
	 *        then it means that all sortItems have been deleted
	 * @returns {object} new JSON object as union result of oPersistentDataBase and oPersistentDataCompare
	 */
	SortController.prototype.getUnionData = function(oPersistentDataBase, oPersistentDataCompare) {
		// not valid
		if (!oPersistentDataCompare || !oPersistentDataCompare.sort || !oPersistentDataCompare.sort.sortItems) {
			return {
				sort: sap.ui.comp.personalization.Util.copy(oPersistentDataBase.sort)
			};
		}

		return {
			sort: sap.ui.comp.personalization.Util.copy(oPersistentDataCompare.sort)
		};
	};

	/**
	 * Cleans up before destruction.
	 * 
	 * @private
	 */
	SortController.prototype.exit = function() {
		BaseController.prototype.exit.apply(this, arguments);

		var oTable = this.getTable();
		if (oTable && oTable instanceof sap.ui.table.Table) {
			oTable.detachSort(this._onSort, this);
		}
	};

	return SortController;

}, /* bExport= */true);
