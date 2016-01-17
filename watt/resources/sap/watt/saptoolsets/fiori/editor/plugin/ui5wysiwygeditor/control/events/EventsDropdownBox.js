define([],
	function () {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.events.EventsDropdownBox");
		jQuery.sap.require("sap.ui.commons.DropdownBox");

		//	PATCH GIT: 1360068
		//	TODO we should remove this once we adopt UI5 1.32.10
		// 	BCP: 1570879255 will be resolved
		/**
		 * Extend sap.ui.common.DropownBox to patch an issue reported on BCP: 1570879255
		 * @type {Function}
		 */
		var EventsDropdownBox = sap.ui.commons.DropdownBox.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.events.EventsDropdownBox" , {
			metadata : {},
			renderer: {}
		});

		EventsDropdownBox.prototype._doTypeAhead = function(oValue, oNewChar, bNoFilter, iItemIndex){
			if (this.__doTypeAhead === true) {
				return; // recursive from opening the Popup and the _prepareOpen-method
			}
			this.__doTypeAhead = true;
			this._sWantedSelectedKey = undefined; // something typed -> do not search again for not existing items
			this._sWantedSelectedItemId = undefined;
			this._sWantedValue = undefined;

			var oLB = this._getListBox(),
			//oSelectedItem = oLB.getSelectedItem(),
					iMaxPopupItems = this.getMaxPopupItems(),
					aItems = this.__aItems || oLB.getItems(),
					iVisibleItemsCnt = aItems.length,
			//**PATCH START**//
			// filtering and history only apply when more than a certain number of items is there
					bHistory = this.getMaxHistoryItems() > 0 && aItems.length > this._iItemsForHistory,
			//**PATCH END**//
					bFilter = !bNoFilter && bHistory,
					oNewValue = oValue + oNewChar,
					oSpecials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"), // .*+?|()[]{}\
					sRegExpValue = oNewValue.toLowerCase().replace(oSpecials, "\\$&"), //escape special characters
					rValFilter = RegExp("^" + sRegExpValue + ".*$"),
					iMove = oNewChar && oNewChar.length || 0,
					$Ref = jQuery(this.getInputDomRef());

			this.__aItems = aItems;

			if (iVisibleItemsCnt <= 0) {
				// no items -> no typeAhead possible -> everything is wrong
				this.__doTypeAhead = false;
				return false;
			}

			var aCurrentItems,
			// identify items matching already entered value (for autocomplete, item selection)
					aFilteredItems = this._getFilteredItems(aItems, rValFilter),
					bValid = aFilteredItems.length > 0;

			if (!bValid) {
				// if not valid just show all items
				bFilter = false;
			}
			// in case we have to filter, only the matching subset of the current items (the configured set) is relevant for display
			if (bFilter) {
				aCurrentItems = aFilteredItems;
			} else {
				aCurrentItems = aItems.slice(0);
			}

			var aHistoryItems = [];
			if (bHistory) {
				aHistoryItems = this._addHistoryItems(aCurrentItems, bFilter && rValFilter);
				oLB.setItems(aCurrentItems, false, true); // fire no itemsChanged event because this would update Value property
				iVisibleItemsCnt = aCurrentItems.length;
			}
			oLB.setVisibleItems(iMaxPopupItems < iVisibleItemsCnt ? iMaxPopupItems : -1);

			var oItem,
					iHistLength = aHistoryItems.length;
			var i = 0;

			if (iItemIndex >= 0) {
				// use the required item
				oItem = aItems[iItemIndex];
			}
			// if there is no filter (e.g. when opening) but a history, try to find the current value in the history
			if (!bFilter && iHistLength > 0 && bValid) {
				aHistoryItems = this._getFilteredItems(aHistoryItems, rValFilter);
				oItem = aHistoryItems[0];
			}
			// in case there is filtering in place, select the first (valid) item
			if (bFilter) {
				oItem = aFilteredItems[0];
			} else if (!oItem) {
				// in case there was no filtering and no valid item from history
				// select the first of the filtered non-history items
				if (aFilteredItems.length > 0) {
					oItem = aFilteredItems[0];
				} else {// use last valid item
					var sOldValue = $Ref.val();
					var iFirstItem = 0;
					for ( i = 0; i < aCurrentItems.length; i++) {
						var oCheckItem = aCurrentItems[i];
						if (oCheckItem.getEnabled()) {
							if (!iFirstItem) {
								iFirstItem = i;
							}
							if (oCheckItem.getText() == sOldValue) {
								oItem = oCheckItem;
								break;
							}
						}
					}
					if (!oItem) {// still no item found - use first one (can this happen???)
						oItem = aCurrentItems[iFirstItem];
					}
				}
			}
			// OK, we know what to select, let's insert search help if required
			var oSHI = this._searchHelpItem;
			if (oSHI) {
				aCurrentItems.splice(iHistLength++, 0, oSHI[0], oSHI[1]);
				oLB.setItems(aCurrentItems, false, true); // fire no itemsChanged event because this would update Value property
			}
			// find and select the item and update the text and the selection in the inputfield
			i = oLB.indexOfItem(oItem);
			var sText = oItem.getText();
			var iPos = i + 1;
			var iSize = aCurrentItems.length;
			if (aHistoryItems.length > 0) {
				iSize = iSize - 1;
			}
			if (oSHI) {
				iSize = iSize - 2;
			}
			if (iPos > aHistoryItems.length) {
				if (aHistoryItems.length > 0) {
					// no history item but history available -> remove separator from position
					iPos = iPos - 1;
				}
				if (oSHI) {
					// search help -> remove search help item and separator from position
					iPos = iPos - 2;
				}
			}
			this._updatePosInSet( $Ref, iPos, (oItem.getAdditionalText ? oItem.getAdditionalText() : ""));
			$Ref.attr("aria-setsize", iSize);
			$Ref.val(sText);
			this._sTypedChars = oNewValue;
			this._doSelect(oValue.length + iMove, sText.length);

			oLB.setSelectedIndex(i);
			if (oSHI && i == 2) {
				// special case -> search help item exist and first real item selected -> show search help too
				oLB.scrollToIndex(0);
			} else {
				oLB.scrollToIndex(i);
			}
			this._iClosedUpDownIdx = i;

			if (!bValid) {
				$Ref = this.$();
				$Ref.addClass("sapUiTfErr");
				jQuery.sap.delayedCall(300, $Ref, "removeClass", ["sapUiTfErr"]);
				// move cursor back to old position and select from there
				$Ref.cursorPos(oValue.length);
				this._doSelect(oValue.length, sText.length);
			}
			this.__doTypeAhead = false;
			return bValid;
		};

		EventsDropdownBox.prototype._prepareOpen = function() {
			//**PATCH START**//
			this._bOpening = true;
			//**PATCH END**//
			return sap.ui.commons.DropdownBox.prototype._prepareOpen.apply(this, arguments);
		};

		EventsDropdownBox.prototype._cleanupClose = function() {
			//**PATCH START**//
			this._bOpening = undefined;
			//**PATCH END**//
			return sap.ui.commons.DropdownBox.prototype._cleanupClose.apply(this, arguments);
		};

		EventsDropdownBox.prototype.applyFocusInfo = function(oFocusInfo){

			sap.ui.commons.ComboBox.prototype.applyFocusInfo.apply(this, arguments);
			//**PATCH START**//
			if (!this._bOpening && (!this.oPopup || !this.oPopup.isOpen())) {
				//**PATCH END**//
				// as popup is not open restore listbox item like on popup close
				this._cleanupClose(this._getListBox());
			}

			return this;

		};

		EventsDropdownBox.prototype.onsapfocusleave = function(oEvent) {

			var oLB = this._getListBox();
			if (oEvent.relatedControlId && jQuery.sap.containsOrEquals(oLB.getFocusDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
				this.focus();
			} else {
				//**PATCH START**//
				// we left the DropdownBox to another (unrelated) control and thus have to fire the change (if needed).
				if (this.oPopup && this.oPopup.isOpen()) {
					// close Popup before it's autoclose to reset the listbox items
					this._close();
				}
				//**PATCH END**//
				sap.ui.commons.TextField.prototype.onsapfocusleave.apply(this, arguments);
			}

		};

		return EventsDropdownBox;
	}
);