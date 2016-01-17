sap.ui.define(["sap/ui/commons/ListBox", "sap/ui/core/ListItem"],
	function(ListBox, ListItem) {
		"use strict";
		var _;
		var MultiSelectListBox = ListBox.extend("sap.watt.ideplatform.plugin.gitclient.ui.MultiSelectListBox", {
			metadata: {
				properties: {
					selectAllТitle: {
						type: "string",
						defaultValue: null
					}
				},
				aggregations: {
					_checkBoxes: {
						type: "sap.ui.core.Control",
						multiple: true,
						singularName: "_checkBox",
						visibility: "hidden"
					}
				}
			},

			init: function() {
				require(["sap/watt/lib/lodash/lodash"], function(lodash) {
					_ = lodash;
				});
				sap.ui.commons.ListBox.prototype.init.apply(this, arguments);
			},

			_createSingleCheckBox: function() {
				var that = this;
				return new sap.ui.commons.CheckBox({}).attachChange(function() {
					if (that.getSelectAllТitle()) {
						var aCheckBoxes = that.getAggregation("_checkBoxes");
						var iIndex = _.indexOf(aCheckBoxes, this);
						that._aSelectionMap[iIndex] = this.getChecked();
						// The render of the lines must be before check parent
						that.getRenderer().handleSelectionChanged(that);

						var oParent = aCheckBoxes[0];
						var nSelectedChildren = that.getSelectedItems().length;
						if (nSelectedChildren === 0) {
							oParent.toggle("Unchecked");
						} else if (nSelectedChildren === aCheckBoxes.length) {
							oParent.toggle("Checked");
						} else {
							oParent.toggle("Mixed");
						}
					}
				});
			},

			_createFirstSelectAllItem: function() {
				var that = this;
				var oItem = null;
				var sSelectAllTitle = this.getSelectAllТitle();
				if (this.getItems().length === 0 && sSelectAllTitle !== "") {
					oItem = new ListItem({
						text: sSelectAllTitle
					});
					sap.ui.commons.ListBox.prototype.addItem.apply(this, [oItem]);
					var oParentCheck = sap.ui.getCore().byId("pcb1");
					if (!oParentCheck){
						oParentCheck = new sap.ui.commons.TriStateCheckBox("pcb1", {}).attachChange(function() {
							if (this.getSelectionState() === "Checked") {
								that.selectAllItems();
							} else {
								that.clearSelection();
							}
						}).addStyleClass("sapIDEMultiSelectTriControl");
					}
					this.addAggregation("_checkBoxes", oParentCheck);
				}
				return oItem;
			},

			_setChecked: function(checkBox, bValue) {
				if (checkBox instanceof sap.ui.commons.CheckBox) {
					checkBox.setChecked(bValue);
					checkBox.fireChange();
				}
			}
		});

		MultiSelectListBox.prototype.setItems = function(aItems, bDestroyItems, bNoItemsChanged) {
			this.bNoItemsChangeEvent = true;
			if (bDestroyItems) {
				this.destroyItems();
			} else {
				this.removeAllItems();
			}
			this._createFirstSelectAllItem();
			for (var i = 0, l = aItems.length; i < l; i++) {
				this.addItem(aItems[i]);
			}
			this.bNoItemsChangeEvent = null;
			if (!bNoItemsChanged) {
				this.fireEvent("itemsChanged", {
					event: "setItems",
					items: aItems
				}); //private event used in DropdownBox
			}
			return this;
		};

		MultiSelectListBox.prototype.addItem = function(oItem) {
			this._createFirstSelectAllItem();
			this.addAggregation("_checkBoxes", this._createSingleCheckBox());
			return ListBox.prototype.addItem.apply(this, [oItem]);
		};

		MultiSelectListBox.prototype.insertItem = function(oItem, iIndex) {
			//TODO index must be bigger from 1
			this.insertAggregation("_checkBoxes", this._createSingleCheckBox(), iIndex);
			return ListBox.prototype.insertItem.apply(this, [oItem], iIndex);
		};

		MultiSelectListBox.prototype.removeItem = function(vElement) {
			this.removeAggregation("_checkBoxes", this.indexOfItem(vElement));
			return sap.ui.commons.ListBox.prototype.removeItem.apply(this, [vElement]);
		};

		MultiSelectListBox.prototype.removeAllItems = function() {
			this.removeAllAggregation("_checkBoxes");
			return ListBox.prototype.removeAllItems.apply(this);
		};

		MultiSelectListBox.prototype.destroyItems = function() {
			this.destroyAggregation("_checkBoxes");
			return ListBox.prototype.destroyItems.apply(this);
		};

		MultiSelectListBox.prototype.updateItems = function() {
			this.updateAggregation("_checkBoxes");
			ListBox.prototype.updateItems.apply(this);
		};

		MultiSelectListBox.prototype.setSelectedIndex = function(iSelectedIndex) {
			if (iSelectedIndex === -1) {
				return;
			}
			if ((iSelectedIndex < -1) || (iSelectedIndex > this._aSelectionMap.length - 1)) {
				return;
			} // Invalid index

			// do not select a disabled or separator item
			var aItems = this.getItems();
			if ((iSelectedIndex > -1) && (!aItems[iSelectedIndex].getEnabled() || (aItems[iSelectedIndex] instanceof sap.ui.core.SeparatorItem))) {
				return;
			}

			var checkBoxes = this.getAggregation("_checkBoxes");

			for (var i = 0; i < this._aSelectionMap.length; i++) {
				this._aSelectionMap[i] = false;
				this._setChecked(checkBoxes[i], false);
			}
			this._aSelectionMap[iSelectedIndex] = true;
			if (checkBoxes[iSelectedIndex] instanceof sap.ui.commons.TriStateCheckBox) {
				checkBoxes[iSelectedIndex].toggle("Checked");
				checkBoxes[iSelectedIndex].fireChange();
			} else {
				this._setChecked(checkBoxes[iSelectedIndex], true);
			}

			// And inform the itemNavigation about this, too
			if (this.oItemNavigation) {
				this.oItemNavigation.setSelectedIndex(this._getNavigationIndexForRealIndex(iSelectedIndex));
			}
			this.getRenderer().handleSelectionChanged(this);

			return this;
		};

		MultiSelectListBox.prototype.addSelectedIndex = function(iSelectedIndex) {
			if (iSelectedIndex === -1) {
				return;
			}

			if (!this.getAllowMultiSelect()) { // If multi-selection is not allowed, this call equals setSelectedIndex
				this.setSelectedIndex(iSelectedIndex);
			}

			// Multi-selectable case
			if ((iSelectedIndex < -1) || (iSelectedIndex > this._aSelectionMap.length - 1)) {
				return;
			} // Invalid index

			// do not select a disabled or separator item
			var aItems = this.getItems();
			if ((iSelectedIndex > -1) && (!aItems[iSelectedIndex].getEnabled() || (aItems[iSelectedIndex] instanceof sap.ui.core.SeparatorItem))) {
				return;
			}

			if (this._aSelectionMap[iSelectedIndex]) {
				return;
			} // Selection does not change

			// Was not selected before
			this._aSelectionMap[iSelectedIndex] = true;
			this._setChecked(this.getAggregation("_checkBoxes")[iSelectedIndex], true);

			this.getRenderer().handleSelectionChanged(this);

			return this;
		};

		MultiSelectListBox.prototype.removeSelectedIndex = function(iIndex) {
			if ((iIndex < 0) || (iIndex > this._aSelectionMap.length - 1)) {
				return;
			} // Invalid index

			if (!this._aSelectionMap[iIndex]) {
				return;
			} // Selection does not change

			// Was selected before
			this._aSelectionMap[iIndex] = false;
			this._setChecked(this.getAggregation("_checkBoxes")[iIndex], false);
			this.getRenderer().handleSelectionChanged(this);

			return this;
		};

		MultiSelectListBox.prototype.clearSelection = function() {
			var checkBoxes = this.getAggregation("_checkBoxes");
			for (var i = 0; i < this._aSelectionMap.length; i++) {
				if (this._aSelectionMap[i]) {
					this._aSelectionMap[i] = false;
					this._setChecked(checkBoxes[i], false);
				}
			}
			// More or less re-initialized
			this._iLastDirectlySelectedIndex = -1;
			// Reset the index also in ItemNavigation
			if (this.oItemNavigation) {
				this.oItemNavigation.setSelectedIndex(-1);
			}
			this.getRenderer().handleSelectionChanged(this);

			return this;
		};

		MultiSelectListBox.prototype.setSelectedIndices = function(aSelectedIndices) {
			var indicesToSet = [];
			var aItems = this.getItems();
			for (var i = 0; i < aSelectedIndices.length; i++) {
				if ((aSelectedIndices[i] > -1) && (aSelectedIndices[i] < this._aSelectionMap.length)) {
					if (aItems[aSelectedIndices[i]].getEnabled() && !(aItems[aSelectedIndices[i]] instanceof sap.ui.core.SeparatorItem)) {
						indicesToSet.push(aSelectedIndices[i]);
					}
				}
			}

			if (indicesToSet.length > 0) { // TODO: Disable event listening to items??
				// With multi-selection disabled, use the first valid index only
				if (!this.getAllowMultiSelect()) {
					indicesToSet = [indicesToSet[0]];
				}
			}

			var checkBoxes = this.getAggregation("_checkBoxes");

			for (i = 0; i < this._aSelectionMap.length; i++) {
				this._aSelectionMap[i] = false;
				this._setChecked(checkBoxes[i], false);
			}

			// O(n+m)
			for (i = 0; i < indicesToSet.length; i++) {
				this._aSelectionMap[indicesToSet[i]] = true;
				this._setChecked(checkBoxes[indicesToSet[i]], true);
			}
			this.getRenderer().handleSelectionChanged(this);

			return this;
		};

		MultiSelectListBox.prototype.addSelectedIndices = function(aSelectedIndices) {
			var indicesToSet = [];
			var aItems = this.getItems();
			for (var i = 0; i < aSelectedIndices.length; i++) {
				if ((aSelectedIndices[i] > -1) && (aSelectedIndices[i] < this._aSelectionMap.length)) {
					// do not select a disabled or separator item
					if (aItems[aSelectedIndices[i]].getEnabled() && !(aItems[aSelectedIndices[i]] instanceof sap.ui.core.SeparatorItem)) {
						indicesToSet.push(aSelectedIndices[i]);
					}
				}
			}

			if (indicesToSet.length > 0) { // TODO: Disable event listening to items??
				// With multi-selection disabled, use the first valid index only
				if (!this.getAllowMultiSelect()) {
					indicesToSet = [indicesToSet[0]];
				}

				// O(n+m)
				var checkBoxes = this.getAggregation("_checkBoxes");
				for (i = 0; i < indicesToSet.length; i++) {
					this._aSelectionMap[indicesToSet[i]] = true;
					this._setChecked(checkBoxes[indicesToSet[i]], true);
				}
				this.getRenderer().handleSelectionChanged(this);
			}
			return this;
		};

		MultiSelectListBox.prototype.selectAllItems = function() {
			var aItems = this.getItems();
			var checkBoxes = this.getAggregation("_checkBoxes");
			for (var i = 0; i < aItems.length; i++) {
				this._aSelectionMap[i] = true;
				this._setChecked(checkBoxes[i], true);
			}
			this.getRenderer().handleSelectionChanged(this);
			return this;
		};
		
		MultiSelectListBox.prototype.exit = function (){
			if (this.getAggregation("_checkBoxes")){
				this.destroyAggregation("_checkBoxes", true);
			}
			ListBox.prototype.exit.apply(this);
		};

		return MultiSelectListBox;
	}, /* bExport= */ true);