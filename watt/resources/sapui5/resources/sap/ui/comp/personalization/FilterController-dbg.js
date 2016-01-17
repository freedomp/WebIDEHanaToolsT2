/*
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP SE. All rights reserved
 */

// Provides FilterController
sap.ui.define([
	'jquery.sap.global', './BaseController', 'sap/m/library'
], function(jQuery, BaseController, library) {
	"use strict";

	/**
	 * The FilterController can be used to...
	 * 
	 * @class Table Personalization Controller
	 * @extends sap.ui.comp.personalization.BaseController
	 * @author SAP
	 * @version 1.25.0-SNAPSHOT
	 * @alias sap.ui.comp.personalization.FilterController
	 */
	var FilterController = BaseController.extend("sap.ui.comp.personalization.FilterController",
	/** @lends sap.ui.comp.personalization.FilterController */
	{
		constructor: function(sId, mSettings) {
			BaseController.apply(this, arguments);
			this.setType(sap.m.P13nPanelType.filter);
		},
		metadata: {
			events: {
				afterFilterModelDataChange: {}
			}
		}
	});

	FilterController.prototype.setTable = function(oTable) {
		BaseController.prototype.setTable.apply(this, arguments);

		if (oTable instanceof sap.ui.table.Table) {
			oTable.detachFilter(this._onFilter, this);
			oTable.attachFilter(this._onFilter, this);
		}
	};

	FilterController.prototype.getTitleText = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("PERSODIALOG_TAB_FILTER");
	};

	sap.ui.comp.personalization.FilterController.prototype._getTable2Json = function() {
		var oJsonData = this.createPersistentStructure();
		var oTable = this.getTable();
		if (oTable) {
			// This is not complete but the best we can do - problem is that the filter is not extractable from other table instances.
			if (oTable instanceof sap.ui.table.Table) {
				oTable.getColumns().forEach(function(oColumn) {
					if (sap.ui.comp.personalization.Util.isColumnIgnored(oColumn, this.getIgnoreColumnKeys())) {
						return;
					}
					if (oColumn.getFiltered()) {
						// Note: value2 is not supported by sap.ui.table.Column yet
						oJsonData.filter.filterItems.push({
							columnKey: sap.ui.comp.personalization.Util.getColumnKey(oColumn),
							operation: oColumn.getFilterOperator(),
							value1: oColumn.getFilterValue(),
							value2: "" // The Column API does not provide method for 'value2'
						});
					}
				}, this);
			}
		}
		return oJsonData;
	};

	FilterController.prototype.syncTable2TransientModel = function() {
		var oTable = this.getTable();
		var aItems = [];

		if (oTable) {
			if (oTable instanceof sap.ui.table.Table) {
				oTable.getColumns().forEach(function(oColumn) {
					if (sap.ui.comp.personalization.Util.isColumnIgnored(oColumn, this.getIgnoreColumnKeys())) {
						return;
					}
					if (sap.ui.comp.personalization.Util.isFilterable(oColumn)) {
						aItems.push({
							columnKey: sap.ui.comp.personalization.Util.getColumnKey(oColumn),
							text: oColumn.getLabel().getText(),
							tooltip: (oColumn.getTooltip() instanceof sap.ui.core.TooltipBase) ? oColumn.getTooltip().getTooltip_Text() : oColumn.getTooltip_Text(),
							maxLength: sap.ui.comp.personalization.Util._getCustomProperty(oColumn, "maxLength"),
							type: sap.ui.comp.personalization.Util.getColumnType(oColumn)
						});
					}
				}, this);
			}
			if (oTable instanceof sap.m.Table) {
				oTable.getColumns().forEach(function(oColumn) {
					if (sap.ui.comp.personalization.Util.isColumnIgnored(oColumn, this.getIgnoreColumnKeys())) {
						return;
					}
					if (sap.ui.comp.personalization.Util.isFilterable(oColumn)) {
						aItems.push({
							columnKey: sap.ui.comp.personalization.Util.getColumnKey(oColumn),
							text: oColumn.getHeader().getText(),
							tooltip: (oColumn.getHeader().getTooltip() instanceof sap.ui.core.TooltipBase) ? oColumn.getHeader().getTooltip().getTooltip_Text() : oColumn.getHeader().getTooltip_Text(),
							maxLength: sap.ui.comp.personalization.Util._getCustomProperty(oColumn, "maxLength"),
							type: sap.ui.comp.personalization.Util.getColumnType(oColumn)
						});
					}
				}, this);
			}
		}

		sap.ui.comp.personalization.Util.sortItemsByText(aItems);

		// check if Items was changed at all and take over if it was changed
		var oItemsBefore = this.getModel().getData().transientData.filter.items;
		if (jQuery(aItems).not(oItemsBefore).length !== 0 || jQuery(oItemsBefore).not(aItems).length !== 0) {
			this.getModel().getData().transientData.filter.items = aItems;
		}
	};

	FilterController.prototype._onFilter = function(oEvent) {
		// TODO: implement this method. Currently SmartTable does not support filtering directly on the table, only via
		// personalization dialog

		// this.fireBeforePotentialTableChange();
		// var oColumn = oEvent.getParameter("column");
		// var sValue = oEvent.getParameter("value");

		// if (!bColumnAdded) {
		// this._sort.sortItems = [];
		// this._sort.sortItems.push({createModelDataFromTable
		// key : "0",
		// columnKey : oColumn.getId(),
		// operation : sSortOrder
		// });
		// }
		// this.fireAfterPotentialTableChange();

		// this.fireAfterFilterModelDataChange();
	};

	FilterController.prototype._hasTableFilterableColumns = function() {
		var oTable = this.getTable();
		if (!oTable) {
			return false;
		}

		var bHasFiltering = false;
		oTable.getColumns().some(function(oColumn) {
			if (sap.ui.comp.personalization.Util.isFilterable(oColumn)) {
				bHasFiltering = true;
				return true;
			}
		});
		return bHasFiltering;
	};

	FilterController.prototype.getPanel = function(oPayload) {

		sap.ui.getCore().loadLibrary("sap.m");

		jQuery.sap.require("sap/m/P13nFilterPanel");
		jQuery.sap.require("sap/m/P13nItem");
		jQuery.sap.require("sap/m/P13nFilterItem");

		if (!this._hasTableFilterableColumns()) {
			return null;
		}
		if (oPayload && oPayload.column) {
			var sColumnKey = sap.ui.comp.personalization.Util.getColumnKey(oPayload.column);
			if (sColumnKey) {

				var aItems = this.getModel().getData().transientData.filter.items;

				aItems.forEach(function(oItem, iIndex) {
					oItem["isDefault"] = oItem.columnKey === sColumnKey;
				}, this);
			}
		}
		var that = this;
		var oPanel = new sap.m.P13nFilterPanel({
			containerQuery: true,
			type: sap.m.P13nPanelType.filter,
			title: this.getTitleText(),
			items: {
				path: "/transientData/filter/items",
				template: new sap.m.P13nItem({
					columnKey: '{columnKey}',
					text: "{text}",
					tooltip: "{tooltip}",
					maxLength: "{maxLength}",
					type: "{type}",
					isDefault: "{isDefault}"
				})
			},
			filterItems: {
				path: "/persistentData/filter/filterItems",
				template: new sap.m.P13nFilterItem({
					key: "{key}",
					columnKey: "{columnKey}",
					exclude: "{exclude}",
					operation: "{operation}",
					value1: "{value1}",
					value2: "{value2}"
				})
			},
			beforeNavigationTo: that.setModelFunction(that.getModel())
		});

		oPanel.attachAddFilterItem(function(oEvent) {
			var oData = this.getModel().getData();
			var params = oEvent.getParameters();
			var oFilterItem = {
				columnKey: params.filterItemData.getColumnKey(),
				operation: params.filterItemData.getOperation(),
				exclude: params.filterItemData.getExclude(),
				value1: params.filterItemData.getValue1(),
				value2: params.filterItemData.getValue2()
			};
			if (params.index > -1) {
				oData.persistentData.filter.filterItems.splice(params.index, 0, oFilterItem);
			} else {
				oData.persistentData.filter.filterItems.push(oFilterItem);
			}
			this.getModel().setData(oData, true);
		}, this);

		oPanel.attachRemoveFilterItem(function(oEvent) {
			var params = oEvent.getParameters();
			var oData = this.getModel().getData();
			if (params.index > -1) {
				oData.persistentData.filter.filterItems.splice(params.index, 1);
				this.getModel().setData(oData, true);
			}
		}, this);

		return oPanel;
	};

	// sap.ui.comp.personalization.FilterController.prototype.onBeforeSubmit = function() {
	// };

	FilterController.prototype.syncJsonModel2Table = function(oJsonModel) {
		var oTable = this.getTable();
		var aColumns = oTable.getColumns();
		var aColumnsUnfiltered = jQuery.extend(true, [], aColumns);

		this.fireBeforePotentialTableChange();

		if (oTable instanceof sap.ui.table.Table) {
			oJsonModel.filter.filterItems.forEach(function(oFilterItem) {
				var oColumn = sap.ui.comp.personalization.Util.getColumn(oFilterItem.columnKey, aColumns);
				if (oColumn) {
					if (!oColumn.getFiltered()) {
						oColumn.setFiltered(true);
					}
					aColumnsUnfiltered.splice(aColumnsUnfiltered.indexOf(oColumn), 1);
				}
			});

			aColumnsUnfiltered.forEach(function(oColumn) {
				if (oColumn && oColumn.getFiltered()) {
					oColumn.setFiltered(false);
				}
			});
		}

		this.fireAfterPotentialTableChange();
	};

	/**
	 * Operations on filter are processed sometime directly at the table and sometime not. In case that something has been changed via Personalization
	 * Dialog the consumer of the Personalization Dialog has to apply filtering at the table. In case that filter has been changed via user
	 * interaction at table, the change is instantly applied at the table.
	 */
	FilterController.prototype.getChangeType = function(oPersistentDataBase, oPersistentDataCompare) {
		if (!oPersistentDataCompare || !oPersistentDataCompare.filter || !oPersistentDataCompare.filter.filterItems) {
			return sap.ui.comp.personalization.ChangeType.Unchanged;
		}
		var bIsDirty = JSON.stringify(oPersistentDataBase.filter.filterItems) !== JSON.stringify(oPersistentDataCompare.filter.filterItems);

		return bIsDirty ? sap.ui.comp.personalization.ChangeType.ModelChanged : sap.ui.comp.personalization.ChangeType.Unchanged;
	};

	/**
	 * Result is XOR based difference = CurrentModelData - oPersistentDataCompare
	 * 
	 * @param {object} oPersistentDataCompare JSON object. Note: if sortItems is [] then it means that all sortItems have been deleted
	 * @returns {object} JSON object or null
	 */
	FilterController.prototype.getChangeData = function(oPersistentDataBase, oPersistentDataCompare) {
		if (!oPersistentDataBase || !oPersistentDataBase.filter || !oPersistentDataBase.filter.filterItems) {
			return this.createPersistentStructure();
		}

		if (oPersistentDataCompare && oPersistentDataCompare.filter && oPersistentDataCompare.filter.filterItems) {
			oPersistentDataCompare.filter.filterItems.forEach(function(oFilterItem) {
				delete oFilterItem.key;
			});
		}
		if (oPersistentDataBase && oPersistentDataBase.filter && oPersistentDataBase.filter.filterItems) {
			oPersistentDataBase.filter.filterItems.forEach(function(oFilterItem) {
				delete oFilterItem.key;
			});
		}

		if (!oPersistentDataCompare || !oPersistentDataCompare.filter || !oPersistentDataCompare.filter.filterItems) {
			return {
				filter: sap.ui.comp.personalization.Util.copy(oPersistentDataBase.filter)
			};
		}

		if (JSON.stringify(oPersistentDataBase.filter.filterItems) !== JSON.stringify(oPersistentDataCompare.filter.filterItems)) {
			return {
				filter: sap.ui.comp.personalization.Util.copy(oPersistentDataBase.filter)
			};
		}
		return null;
	};

	/**
	 * @param {object} oPersistentDataBase: JSON object to which different properties from JSON oPersistentDataCompare are added
	 * @param {object} oPersistentDataCompare: JSON object from where the different properties are added to oPersistentDataBase. Note: if filterItems
	 *        is [] then it means that all filterItems have been deleted
	 * @returns {object} JSON object as union result of oPersistentDataBase and oPersistentDataCompare
	 */
	FilterController.prototype.getUnionData = function(oPersistentDataBase, oPersistentDataCompare) {
		if (!oPersistentDataBase || !oPersistentDataBase.filter || !oPersistentDataBase.filter.filterItems) {
			return this.createPersistentStructure();
		}

		if (!oPersistentDataCompare || !oPersistentDataCompare.filter || !oPersistentDataCompare.filter.filterItems) {
			return {
				filter: sap.ui.comp.personalization.Util.copy(oPersistentDataBase.filter)
			};
		}

		return {
			filter: sap.ui.comp.personalization.Util.copy(oPersistentDataCompare.filter)
		};
	};

	/**
	 * Cleans up before destruction.
	 * 
	 * @private
	 */
	FilterController.prototype.exit = function() {
		BaseController.prototype.exit.apply(this, arguments);

		var oTable = this.getTable();
		if (oTable && oTable instanceof sap.ui.table.Table) {
			oTable.detachFilter(this._onFilter, this);
		}
	};

	return FilterController;

}, /* bExport= */true);
