/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/**
 * @namespace Provides utitlity functions for the personalization dialog
 * @name sap.ui.comp.personalization.Util
 * @author SAP SE
 * @version 1.32.7
 * @private
 * @since 1.25.0
 */
sap.ui.define([
	'sap/ui/base/Object', 'sap/ui/core/MessageType'
], function(BaseObject, MessageType) {
	"use strict";
	var Util = {

		// TODO: improve the performance adding map <oColumn, columnKey>. Use this map for all relevant methods. Consider life cycle aspects [garbage
		// collection !!].

		/**
		 * Sort the columns in alphabetical order.
		 * 
		 * @param {sap.m.P13nItem} aP13nItems
		 */
		sortItemsByText: function(aP13nItems) {
			var sLanguage;
			try {
				var sLanguage = sap.ui.getCore().getConfiguration().getLocale().toString();
				if (typeof window.Intl !== 'undefined') {
					var oCollator = window.Intl.Collator(sLanguage, {
						numeric: true
					});
					aP13nItems.sort(function(a, b) {
						return oCollator.compare(a.text, b.text);
					});
				} else {
					aP13nItems.sort(function(a, b) {
						return a.text.localeCompare(b.text, sLanguage, {
							numeric: true
						});
					});
				}
			} catch (oException) {
				// this exception can happen if the configured language is not convertible to BCP47 -> getLocale will deliver an exception
			}
		},

		/**
		 * Converts string value to Date instance in filter model data <code>oPersonalisationData</code>.
		 * 
		 * @param {object} oPersonalisationData
		 * @param {sap.m.Table | sap.ui.table.Table} oTable
		 * @param {array} aColumnKeysOfDateType Optional parameter which can be passed to improve performance
		 */
		recoverPersonalisationData: function(oPersonalisationData, oTable, aColumnKeysOfDateType) {
			if (!oTable) {
				return;
			}
			if (!aColumnKeysOfDateType) {
				aColumnKeysOfDateType = this.getColumnKeysOfDateType(oTable);
			}
			if (aColumnKeysOfDateType.length && oPersonalisationData && oPersonalisationData.filter) {
				oPersonalisationData.filter.filterItems.forEach(function(oFilterItem) {
					if (aColumnKeysOfDateType.indexOf(oFilterItem.columnKey) > -1) {
						if (oFilterItem.value1 && typeof (oFilterItem.value1) === "string") {
							oFilterItem.value1 = new Date(oFilterItem.value1);
						}
						if (oFilterItem.value2 && typeof (oFilterItem.value2) === "string") {
							oFilterItem.value2 = new Date(oFilterItem.value2);
						}
					}
				}, this);
			}
		},

		/**
		 * Determines <code>columnKeys</code> of type <code>Date</code>.
		 * 
		 * @param {sap.m.Table | sap.ui.table.Table} oTable
		 * @return {array} Array of strings representing the <code>columnKeys</code>
		 */
		getColumnKeysOfDateType: function(oTable) {
			if (!oTable) {
				return [];
			}
			var aColumnKeysOfDataType = [];
			oTable.getColumns().forEach(function(oColumn) {
				if (this.getColumnType(oColumn) === "date") {
					aColumnKeysOfDataType.push(this.getColumnKey(oColumn));
				}
			}, this);
			return aColumnKeysOfDataType;
		},

		validate: function(oSetting, oPayload, oTable, oPersistentData) {
			var aResult = [];
			var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");

			if (oTable instanceof sap.ui.table.AnalyticalTable && oSetting.group && oSetting.columns) {
				oTable.getColumns().forEach(function(oColumn) {
					if (oColumn.getInResult()) {
						// if inResult=true then grouping will work 'always' (independent of visible or not) according to Sebastian Ried
						return;
					}
					var sColumnKey = this.getColumnKey(oColumn);
					var bColumnSelected = oSetting.columns.controller.isColumnSelected(oPayload.columns, oPersistentData.columns, sColumnKey);
					var bGroupSelected = oSetting.group.controller.isGroupSelected(oPayload.group, oPersistentData.group, sColumnKey);

					if (bGroupSelected && !bColumnSelected) {
						aResult.push({
							columnKey: sColumnKey,
							panelTypes: [
								sap.m.P13nPanelType.group, sap.m.P13nPanelType.columns
							],
							messageType: MessageType.Warning,
							messageText: oRB.getText("PERSODIALOG_MSG_GROUPING_NOT_POSSIBLE_DESCRIPTION")
						});
					}
				}, this);
			}
			return aResult;
		},

		getUnionOfAttribute: function(oSetting, sAttributeName) {
			var aUnion = [];
			var fAddColumnKey = function(sColumnKey) {
				if (aUnion.indexOf(sColumnKey) < 0) {
					aUnion.push(sColumnKey);
				}
			};
			for ( var sNamespace in oSetting) {
				var oNamespace = oSetting[sNamespace];
				if (!oNamespace[sAttributeName]) {
					continue;
				}
				oNamespace[sAttributeName].forEach(fAddColumnKey);
			}
			return aUnion;
		},

		getVisibleColumnKeys: function(oTable) {
			var aColumnKeys = [];
			oTable.getColumns().forEach(function(oColumn) {
				if (oColumn.getVisible()) {
					aColumnKeys.push(this.getColumnKey(oColumn));
				}
			}, this);
			return aColumnKeys;
		},

		copy: function(oObject) {
			if (oObject instanceof Array) {
				return jQuery.extend(true, [], oObject);
			}
			return jQuery.extend(true, {}, oObject);
		},

		sort: function(sKeyName, aArray) {
			var aResult = this.copy(aArray);
			aResult.sort(function(a, b) {
				var aText = a[sKeyName].toLocaleLowerCase();
				var bText = b[sKeyName].toLocaleLowerCase();

				if (aText < bText) {
					return -1;
				}
				if (aText > bText) {
					return 1;
				}
				// a must be equal to b
				return 0;
			});
			return aResult;
		},

		removeEmptyProperty: function(oObject) {
			for ( var type in oObject) {
				if (oObject[type] === null || oObject[type] === undefined) {
					delete oObject[type];
				}
			}
			return oObject;
		},

		semanticEqual: function(oItemA, oItemB) {
			if (!oItemA || !oItemB) {
				return false;
			}
			for ( var property in oItemA) {
				if (oItemB[property] === undefined || oItemA[property] !== oItemB[property]) {
					return false;
				}
			}
			return true;
		},

		/**
		 * @param {sap.ui.comp.personalization.ResetType}
		 * @returns {boolean} true if at least one property of oChangeType has 'ModelChanged' or 'TableChanged'.
		 */
		hasChangedType: function(oChangeType) {
			for ( var type in oChangeType) {
				if (oChangeType[type] === sap.ui.comp.personalization.ChangeType.ModelChanged || oChangeType[type] === sap.ui.comp.personalization.ChangeType.TableChanged) {
					return true;
				}
			}
			return false;
		},

		/**
		 * @param {sap.ui.comp.personalization.ResetType}
		 * @returns {boolean} true if at least one property of oChangeType has 'ModelChanged' or 'TableChanged'.
		 */
		isNamespaceChanged: function(oChangeType, sNamespace) {
			if (oChangeType[sNamespace]) {
				return oChangeType[sNamespace] === sap.ui.comp.personalization.ChangeType.ModelChanged || oChangeType[sNamespace] === sap.ui.comp.personalization.ChangeType.TableChanged;
			}
			return false;
		},

		/**
		 * @param {object}
		 * @returns {boolean} true if at least one property of oChangeType has 'ModelChanged' or 'TableChanged'.
		 */
		isTrueForAll: function(oObjectOfBoolean) {
			for ( var type in oObjectOfBoolean) {
				if (oObjectOfBoolean[type] === false) {
					return false;
				}
			}
			return true;
		},

		/**
		 * Returns an array of elements coming from sElements that are separated by commas.
		 * 
		 * @param {string} sElements
		 * @returns {array}
		 */
		createArrayFromString: function(sElements) {
			if (!sElements) {
				return [];
			}
			var aElements = [];
			var aRowElements = sElements.split(",");
			aRowElements.forEach(function(sField) {
				if (sField !== "") {
					aElements.push(sField.trim());
				}
			});
			return aElements;
		},

		/**
		 * @param {string} sKey
		 * @param {sap.ui.table.Column[] | sap.m.Column[]} aColumns
		 * @returns {sap.ui.table.Column | sap.m.Column | null}
		 */
		getColumn: function(sColumnKey, aColumns) {
			var oResultColumn = null;
			aColumns.some(function(oColumn) {
				if (this.getColumnKey(oColumn) === sColumnKey) {
					oResultColumn = oColumn;
					return true;
				}
			}, this);
			return oResultColumn;
		},

		/**
		 * @param {sap.m.P13nSortItem[]} aSortItems
		 * @param {string} sKey
		 * @returns {integer} Index of sKey or -1 if not found
		 */
		getIndexByKey: function(aModelItems, sColumnKey) {
			var iIndex = -1;
			aModelItems.some(function(oModelItem, i) {
				if (oModelItem.columnKey === sColumnKey) {
					iIndex = i;
					return true;
				}
			});
			return iIndex;
		},

		/**
		 * @param {sap.m.Column | sap.ui.table.Column} oColumn
		 * @returns {string | null}
		 */
		getColumnKey: function(oColumn) {
			return this._getCustomProperty(oColumn, "columnKey") || oColumn.getId();
		},

		/**
		 * @param {sap.m.Column | sap.ui.table.Column} oColumn
		 * @returns {string | null}
		 */
		getColumnType: function(oColumn) {
			return this._getCustomProperty(oColumn, "type");
		},

		/**
		 * @param {sap.m.Column | sap.ui.table.Column} oColumn
		 * @returns {boolean}
		 */
		isGroupable: function(oColumn) {
			if (oColumn instanceof sap.ui.table.AnalyticalColumn) {
				// cf. implementation of sap.ui.table.AnalyticalColumnMenu.prototype._addGroupMenuItem
				var oTable = oColumn.getParent();
				var oBinding = oTable && oTable.getBinding("rows");
				var oResultSet = oBinding && oBinding.getAnalyticalQueryResult();

				if (oTable && oResultSet && oResultSet.findDimensionByPropertyName(oColumn.getLeadingProperty()) && jQuery.inArray(oColumn.getLeadingProperty(), oBinding.getSortablePropertyNames()) > -1 && jQuery.inArray(oColumn.getLeadingProperty(), oBinding.getFilterablePropertyNames()) > -1) {
					return true;
				}
			}

			if (oColumn instanceof sap.m.Column) {
				return this.isSortable(oColumn);
			}

			// Not yet supported
			// if (oColumn instanceof sap.ui.table.Column) {
			// return oColumn.getParent().getEnableGrouping() && this.isSortable(oColumn);
			// }

			return false;
		},

		/**
		 * @param {sap.m.Column | sap.ui.table.Column} oColumn
		 * @returns {boolean}
		 */
		isSortable: function(oColumn) {
			// If oColumn implements "sortProperty" property then we take it
			if (oColumn.getSortProperty) {
				return !!oColumn.getSortProperty();
			}
			// Only if oColumn does not implement "sortProperty" property then we take "p13nData"
			if (this._getCustomProperty(oColumn, "sortProperty")) {
				return true;
			}
			return false;
		},

		/**
		 * @param {sap.m.Column | sap.ui.table.Column} oColumn
		 * @returns {boolean}
		 */
		isFilterable: function(oColumn) {
			// If oColumn implements "filterProperty" property then we take it.
			if (oColumn.getFilterProperty) {
				return !!oColumn.getFilterProperty();
			}
			// Only if oColumn does not implement "filterProperty" property then we take "p13nData".
			if (this._getCustomProperty(oColumn, "filterProperty")) {
				return true;
			}
			return false;
		},

		/**
		 * @param {sap.m.Column[] || sap.ui.table.Column[]} aColumns
		 * @returns {boolean} True if all columns support 'columnKey' or all columns do not support 'columnKey'. False in case of mixed situation.
		 */
		isConsistent: function(aColumns) {
			if (!aColumns || !aColumns.length) {
				return true;
			}
			var bConsistent = true;
			var bPersistentFirst = sap.ui.comp.personalization.Util.getColumnKey(aColumns[0]) !== aColumns[0].getId();
			aColumns.some(function(oColumn) {
				var bPersistentCurrent = sap.ui.comp.personalization.Util.getColumnKey(oColumn) !== oColumn.getId();
				if (bPersistentCurrent !== bPersistentFirst) {
					bConsistent = false;
					return true; // leave some()
				}
			});
			return bConsistent;
		},

		/**
		 * @param {string} sKeyName: property name for key
		 * @param {string} sKeyValue: kay value which is looking for
		 * @param {Array} aArray: array where the element with key value 'sKeyValue' is looking for
		 * @returns {object | null} either found array element or null if 'sKeyValue' does not exist in aArray
		 */
		getArrayElementByKey: function(sKeyName, sKeyValue, aArray) {
			if (!aArray || !aArray.length) {
				return null;
			}
			var oElement = null;
			aArray.some(function(oElement_) {
				if (oElement_[sKeyName] !== undefined && oElement_[sKeyName] === sKeyValue) {
					oElement = oElement_;
					return true;
				}
			});
			return oElement;
		},

		/**
		 * Checks whether <code>columnKey</code> of <code>oColumn</code> exists in <code>aIgnoredColumnKeys</code>.
		 * 
		 * @param {sap.ui.table.Column|sap.m.Column} oColumn The column to be checked whether it is ignored
		 * @param {array} aIgnoredColumnKeys The array with ignored column keys
		 * @returns {boolean} <code>true</code> if oColumn exists in aIgnoredColumnKeys; <code>false</code> else
		 * @public
		 */
		isColumnIgnored: function(oColumn, aIgnoredColumnKeys) {
			return aIgnoredColumnKeys.indexOf(sap.ui.comp.personalization.Util.getColumnKey(oColumn)) > -1;
		},

		/**
		 * this method will make a json snapshot of the given table instance and stores the column sorting information in the given array
		 * 
		 * @param {sap.ui.table.Table} oTable - the table where the sort data has to be extracted
		 * @param {array} aDestination - the array where the sort json data should be stored
		 * @public
		 */
		createSort2Json: function(oTable, aDestination, aIgnoreColumnKeys) {
			if (oTable) {
				if (oTable instanceof sap.ui.table.Table) {
					oTable.getColumns().forEach(function(oColumn) {
						var sColumnKey = this.getColumnKey(oColumn);
						if (this.isColumnIgnored(oColumn, aIgnoreColumnKeys)) {
							return;
						}
						if (oColumn.getSorted()) {
							aDestination.push({
								columnKey: sColumnKey,
								operation: oColumn.getSortOrder()
							});
						}
					}, this);
				}
			}
		},

		/**
		 * @param {sap.m.Column | sap.ui.table.Column} oColumn
		 * @param {string} sProperty
		 * @param {boolean} bParse
		 * @returns {object | null} either value of custom data property or null
		 */
		_getCustomProperty: function(oColumn, sProperty) {
			var oCustomData = this._getCustomData(oColumn);
			if (!oCustomData || !sProperty) {
				return null;
			}
			return oCustomData[sProperty];
		},

		/**
		 * @param {sap.m.Column | sap.ui.table.Column} oColumn
		 * @returns {object | null} either custom data object or null
		 */
		_getCustomData: function(oColumn) {
			if (!oColumn) {
				return null;
			}
			var oCustomData = oColumn.data("p13nData");
			if (typeof oCustomData === "string") {
				try {
					oCustomData = JSON.parse(oCustomData);
					oColumn.data("p13nData", oCustomData);
				} catch (oException) {
					// do not update the custom data, go ahead
				}
			}
			return oCustomData;
		}

	};
	return Util;
}, /* bExport= */true);
