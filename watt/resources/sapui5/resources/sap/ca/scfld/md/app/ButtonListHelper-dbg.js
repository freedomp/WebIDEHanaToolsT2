/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("sap.ca.scfld.md.app.ButtonListHelper");
jQuery.sap.require("sap.ca.ui.dialog.Dialog");
jQuery.sap.require("sap.ca.scfld.md.app.BarOverflow");
jQuery.sap.require("sap.ca.scfld.md.app.BarOverflowLayoutData");
jQuery.sap.require("sap.m.ButtonType");

(function () {
	/**
	 * Iterate over the array of controls (this.aButtons) and search the given button/select.
	 * @param {array} aControlObjects
	 *    Array of control objects as defined internally in ButtonListHelper.
	 * @param {sap.ui.core.Control} oControl
	 *    Control which is searched within given control objects array.
	 * @returns {oObject}
	 *    the internal representation of the control as stored in aButtons array of
	 *    ButtonListHelper.
	 */
	function findControlObject(aControlObjects, oControl) {
		var i, oObject;
		for (i = aControlObjects.length - 1; i >= 0; i -= 1) {
			oObject = aControlObjects[i];
			if (oObject.oButton === oControl || oObject.oSelect === oControl) {
				return oObject;
			}
		}
		return null;
	}

	/**
	 * Search the overflow button in given control array.
	 * @param {array} aControls. The entries are of type sap.ui.core.Control
	 * @returns {int}
	 *    the index of the overflow button within the array of given controls or undefined if not
	 *    found.
	 *
	 */
	function getIndexOfOverflow(aControls) {
		var i, oButton, oLayoutData;
		for (i = aControls.length - 1; i >= 0; i -= 1) {
			oButton = aControls[i];
			oLayoutData = oButton.getLayoutData();
			if (oLayoutData instanceof sap.ca.scfld.md.app.BarOverflowLayoutData
					&& oLayoutData.getOverflowButton()) {
				return i;
			}
		}
	}

	/**
	 * Get text from resource bundle or from given button meta data.
	 * @param {object} oBtnMeta
	 *   Button metadata; oBtnMeta.sI18nBtnTxt or oBtnMeta.sBtnTxt are used to determine the text.
	 */
	function getText(oBtnMeta, oApplicationImplementation) {
		var sText;
		if (oBtnMeta.sI18nBtnTxt) {
			var oBundle = oApplicationImplementation.AppI18nModel.getResourceBundle();
			sText = oBundle.getText(oBtnMeta.sI18nBtnTxt);
		} else {
			sText = oBtnMeta.sBtnTxt;
		}
		return sText;
	}

	/**
	 * After resize controls need to be moved from bar to overflow or back.
	 * @param {array} aControls. The entries are of type sap.ui.core.Control
	 *    If array is undefined all controls from overflow will be added to the bar again.
	 *    If array contains entries these entries will be moved from bar to overflow.
	 */
	function resized(aControls) {
		var oBar = this.oBar,
			bAddedToActionSheet = false,
			oActionSheet = this.oOverflowList.oActionSheet,
			aButtons, i, oControlObject, iIndexOfOverflow, oControl;

		if (aControls === undefined) {
			// move all to bar
			aButtons = oActionSheet.getButtons();
			iIndexOfOverflow = getIndexOfOverflow(this.oBar.getContentRight());
			for (i = 0; i < aButtons.length; i += 1) {
				oControlObject = findControlObject(this.aButtons, aButtons[i]);
				if (oControlObject.oSelect) {
					oControl = oControlObject.oSelect;
					oControl.setVisible(true);
					if (oControlObject.oButton) {
						oControlObject.oButton.setVisible(false);
					}
					// remove button
					oActionSheet.removeButton(aButtons[i]);
				} else {
					oControl = oControlObject.oButton;
					// adjust representation text, tooltip and style might be different
					if (oControl._sTextInBar !== undefined) {
						oControl.setText(oControl._sTextInBar);
					}
					if (oControl._sTypeInBar !== undefined) {
						oControl.setType(oControl._sTypeInBar);
					}
					if (oControl._sTooltip !== undefined) {
						oControl.setTooltip(oControl._sTooltip);
					}
				}
				oBar.insertContentRight(oControl,iIndexOfOverflow);
				iIndexOfOverflow++;
			}
			// finally make overflow button invisible
			oBar.getContentRight()[iIndexOfOverflow].setVisible(false);

			//TODO: remove me when UI5 fixes a bug that popup does not clear the domref if it was opened once and then is closed
			if (oActionSheet.isOpen()) {
				oActionSheet.attachEventOnce("afterClose", function () {
					oActionSheet.$().remove();
				});
			} else {
				oActionSheet.$().remove();
			}

		} else {
			// move given controls to overflow
			aControls.forEach(function (oControl) {
				oControlObject = findControlObject(this.aButtons, oControl);
				if (!oControlObject) {
					jQuery.sap.log.error("Unsupported control - " + oControl.toString());
				}
				if (oControlObject.oSelect) {
					// remove the select control from the bar
					oBar.removeContentRight(oControlObject.oSelect);
				}
				if (oControlObject.oButton) {
					oControl = oControlObject.oButton;
					// adjust representation text, tooltip and style might be different
					if (oControl._sTextInActionSheet !== undefined) {
						oControl.setText(oControl._sTextInActionSheet);
						if (oControl._sTextInActionSheet === oControl._sTooltip) {
							oControl.setTooltip("");
						}
					}
					if (oControl._sTypeInActionSheet !== undefined) {
						oControl.setType(oControl._sTypeInActionSheet);
					}
					oControl.setVisible(true);
					if (oControlObject.oSelect) {
						oControlObject.oSelect.setVisible(false);
					}
					oActionSheet.addButton(oControl);
					bAddedToActionSheet = true;
				} else {
					jQuery.sap.log.error("No button representation for control - "
						+ oControl.toString());
				}
			}, this);
			// if at least one element has been added to action sheet make overflow button visible
			if (bAddedToActionSheet) {
				oBar.getContentRight()[getIndexOfOverflow(this.oBar.getContentRight())]
					.setVisible(true);
			}
		}

	}

sap.ui.base.Object.extend("sap.ca.scfld.md.app.ButtonListHelper", {

	constructor : function (oApplicationImplementation, iMode, bAllDisabled, bAutomaticOverflow,
			sOverflowId) {
		this.oApplicationImplementation = oApplicationImplementation;
		this.bAutomaticOverflow = bAutomaticOverflow;
		this.sOverflowId = sOverflowId;
		this.iMode = iMode;
		if (this.iMode == 20) {
			this.oBar = new sap.m.Bar();
		} else if (this.iMode >= 10) {
			this.oActionSheet = new sap.m.ActionSheet();
			this.oActionSheet.setPlacement(sap.m.PlacementType.Top);
			this.oActionSheet.setShowCancelButton(true);
		}
		this.aButtons = [];
		this.bAllDisabled = bAllDisabled;
		this.startBuild();
		if (this.iMode == 25) {
			this.sDirection = "Left";
		} else {
			this.sDirection = "Right";
		}
		this.mSelections = {};
	},

	addButtonListHelper : function (oButtonListHelper) {
		if (this.oChild) {
			this.oChild.addButtonListHelper(oButtonListHelper);
		} else {
			this.oChild = oButtonListHelper;
			oButtonListHelper.bAllDisabled = this.bAllDisabled;
			delete oButtonListHelper.oModifications;
		}
	},

	startBuild : function (bKeepModifications) {
		this.mButtons = {};
		this.aCallBacks = [];
		this.oPositions = {
			iActive : 0,
			iControlPosition : 0
		};
		this.bHasOverflow = false;
		if (this.oChild) {
			this.oChild.startBuild(true);
		}
		if (this.oOverflowList) {
			this.oOverflowList.startBuild(true);
		}
		if (!bKeepModifications) {
		  this.oModifications = {
			  mChangedEnablements : {},
			  mChangedTexts : {}
		  };
		}
		// cleanup also bar, action sheet, bar overflow and overflow list
		this.aButtons = [];
		if (this.oActionSheet) {
			this.oActionSheet.destroyButtons();
		}
		if (this.oBar) {
			this.oBar.destroyContentRight();
			this.oBar.destroyContentLeft();
		}
		if (this.oBarOverflow) {
			this.oBarOverflow.destroy();
			delete this.oBarOverflow;
		}
		if (this.oOverflowList) {
			this.oOverflowList.destroy();
			delete this.oOverflowList;
		}
	},

	endBuild : function () {
		for (var i = this.oPositions.iActive; i < this.aButtons.length; i++) {
			var oControl = this.aButtons[i];
			if (oControl.oButton) {
				oControl.oButton.setVisible(false);
			}
			if (oControl.oSelect) {
				oControl.oSelect.setVisible(false);
			}
		}
		if (this.oChild) {
			this.oChild.endBuild();
		}
		if (this.oOverflowList) {
			this.oOverflowList.endBuild();
		}
		this.bIsOverflowReplaced = false;
		if (this.oModifications) {
		  for (var sId in this.oModifications.mChangedEnablements) {
			  this.setBtnEnabled(sId, this.oModifications.mChangedEnablements[sId], true);
		  }
		  for (var sId in this.oModifications.mChangedTexts) {
			  this.setBtnText(sId, this.oModifications.mChangedTexts[sId], true);
		  }
		}
		if (this.oBarOverflow) {
			// ensure that BarOverflow gets invalidated
			this.oBarOverflow.buttonTextChanged();
		}
	},

	destroy : function () {
		for (var i = 0; i < this.aButtons.length; i++) {
			var oControlObject = this.aButtons[i];
			if (oControlObject.oButton) {
				oControlObject.oButton.destroy(true);
			}
			if (oControlObject.oSelect) {
				oControlObject.oSelect.destroy(true);
			}
		}
		if (this.oBar) {
			this.oBar.destroy();
			delete this.oBar;
		}
		if (this.oActionSheet) {
			this.oActionSheet.destroy();
			delete this.oActionSheet;
		}
		if (this.oChild) {
			this.oChild.destroy();
			delete this.oChild;
		}
		if (this.oBarOverflow) {
			this.oBarOverflow.destroy();
			delete this.oBarOverflow;
		}
		if (this.oOverflowList) {
			this.oOverflowList.destroy();
			delete this.oOverflowList;
		}
	},

	/**
	 * Create an overflow button and add it to the bar. If automatic overflow is set a
	 * sap.ca.scfld.md.app.BarOverflow is registered.
	 * @return {sap.m.ActionSheet}
	 *   the action sheet in which the overflow content needs to be put in
	 */
	addOverflowButton: function () {
		var oActionSheet,
			oOverflow,
			that = this;
		if (!this.oOverflowList) {
			this.oOverflowList = new sap.ca.scfld.md.app.ButtonListHelper(this.oApplicationImplementation, 10);
			this.oOverflowList.bAllDisabled = this.bAllDisabled;
			this.oOverflowList.oBarList = this;
		}
		this.iOverflowPosition = this.oPositions.iActive;
		oOverflow = this.ensureButton(sap.ca.scfld.md.app.ButtonListHelper.getOverflowMeta(this), "b");
		oOverflow.setEnabled(true);
		oOverflow.setLayoutData(new sap.ca.scfld.md.app.BarOverflowLayoutData({
			moveToOverflow: false,
			stayInOverflow: false,
			overflowButton: true
		}));

		oActionSheet = this.oOverflowList.oActionSheet;

		if (this.bAutomaticOverflow  && !this.oBarOverflow) {
			// If there is automatic overflow, the BarOverflow is able to move buttons to the
			// overflow if the bar would get too wide otherwise. However initially all buttons
			// will be rendered directly to the bar and the overflow button is unnecessary.
			// Moving will occur during rendering. To avoid flickering we make it invisible
			// initially. It will be made visible in BarOverflow._moveControlsToOverflow.
			oOverflow.setVisible(false);
			this.oBarOverflow = new sap.ca.scfld.md.app.BarOverflow(
				this.oBar,
				oActionSheet,
				resized.bind(that)
			);
		}

		return oActionSheet;
	},

	ensureButton : function (oBtnMeta, sType, iMaxCountBeforeOverflow) {
		var oControl;
		if (iMaxCountBeforeOverflow && this.oPositions.iActive >= iMaxCountBeforeOverflow) {
			if (!this.bHasOverflow) {
				this.addOverflowButton();
				this.bHasOverflow = true;
			}
			return this.oOverflowList.ensureButton(oBtnMeta, sType);
		}
		var iButtonsCount = this.oPositions.iActive;
		if (iButtonsCount == this.aButtons.length) {
			this.aButtons.push({});
		}

		oControl = this.ensureControlAtPosition(oBtnMeta, sType, iButtonsCount, this.oPositions);
		if (this.bAutomaticOverflow) {
			oControl.setLayoutData(new sap.ca.scfld.md.app.BarOverflowLayoutData());
			// if iMaxCountBeforeOverflow is not defined button must not go to overflow
			if (!iMaxCountBeforeOverflow) {
				oControl.getLayoutData().setMoveToOverflow(false);
			}
		}
		return oControl;
	},

	setBtnEnabled : function (sId, bEnabled, bNoStorage) {
		if (this.bAllDisabled) {
			return;
		}
		var oButton = this.mButtons[sId],
			oControlObject;
		if (oButton) {
			oButton.setEnabled(bEnabled);
			if (oButton.getMetadata().getName() === "sap.m.Select") {
				// select control adjust text of button representation only
				oControlObject = findControlObject(this.aButtons, oButton);
				oButton = oControlObject.oButton;
				// set enabled state of button replacement also
				if (oButton) {
					oButton.setEnabled(bEnabled);
				}
			}
		} else {
			if (this.oChild) {
				this.oChild.setBtnEnabled(sId, bEnabled, true);
			}
			if (this.oOverflowList) {
				this.oOverflowList.setBtnEnabled(sId, bEnabled, true);
			}
		}
		if (!bNoStorage) {
			this.oModifications.mChangedEnablements[sId] = bEnabled;
		}
	},

	ensureControlAtPosition : function (oBtnMeta, sType, iButtonsCount, oPositions) {
		var oControlObject = this.aButtons[iButtonsCount], sText, sTextInActionSheet;
		if (sType == "b" || this.iMode < 20) { // selects are only possible in bars
			if (oControlObject.oSelect) {
				oPositions.iControlPosition = this.oBar["indexOfContent" + this.sDirection](oControlObject.oSelect);
				oControlObject.oSelect.setVisible(false);
			}
			if (oControlObject.oButton) {
				oControlObject.oButton.setVisible(true);
				if (this.oBar) {
					var iControlPosition = this.oBar["indexOfContent" + this.sDirection](oControlObject.oButton);
					if (iControlPosition > oPositions.iControlPosition) {
						oPositions.iControlPosition = iControlPosition;
					}
				}
			} else {
				oControlObject.oButton = new sap.m.Button({id: oBtnMeta.sControlId});
				oControlObject.oButton.attachPress(jQuery.proxy(function (oEvent) {
					if (this.aCallBacks[iButtonsCount]) {
						this.aCallBacks[iButtonsCount](oEvent);
					}
				}, this));
				oPositions.iControlPosition++;
				if (this.iMode >= 20) {
					this.oBar["insertContent" + this.sDirection](oControlObject.oButton, oPositions.iControlPosition);
				} else if (this.iMode >= 10) {
					this.oActionSheet.addButton(oControlObject.oButton);
				} else if (this.iMode == 5) {
					this.oBar.insertContentLeft(oControlObject.oButton, oPositions.iControlPosition);
				}
			}
			sText = getText(oBtnMeta, this.oApplicationImplementation);
			sTextInActionSheet = sText;
			if (!(this.iMode < 20 || !oBtnMeta.sIcon)) {
				oControlObject.oButton._sTooltip = oBtnMeta.sTooltip || sText;
				oControlObject.oButton.setTooltip(oControlObject.oButton._sTooltip);
				sText = "";
			} else if (oBtnMeta.sTooltip && oBtnMeta.sTooltip !== sText) {
				oControlObject.oButton._sTooltip = oBtnMeta.sTooltip;
				oControlObject.oButton.setTooltip(oControlObject.oButton._sTooltip);
			}
			oControlObject.oButton._sTextInActionSheet = sTextInActionSheet;
			oControlObject.oButton._sTextInBar = sText;
			if (sText != oControlObject.oButton.getText()) {
				oControlObject.oButton.setText(sText);
			}
			oControlObject.oButton._sTypeInActionSheet = sap.m.ButtonType.Default;

			if (this.iMode == 20) { // styles are only used in bars
				if (oControlObject.oButton.getType() != oBtnMeta.style) {
					oControlObject.oButton.setType(oBtnMeta.style);
					oControlObject.oButton._sTypeInBar = oBtnMeta.style;
				}
			}
			if (sType == "b") {
				this.aCallBacks[iButtonsCount] = oBtnMeta.onBtnPressed;
			} else {
				this.aCallBacks[iButtonsCount] = this.getSelectReplacement(oBtnMeta);
			}
			var oRet = oControlObject.oButton;
		} else { // select
			if (oControlObject.oButton) {
				oPositions.iControlPosition = this.oBar["indexOfContent" + this.sDirection](oControlObject.oButton);
				oControlObject.oButton.setVisible(false);
			}
			if (oControlObject.oSelect) {
				oControlObject.oSelect.setVisible(true);
				var iControlPosition = this.oBar["indexOfContent" + this.sDirection](oControlObject.oSelect);
				if (iControlPosition > oPositions.iControlPosition) {
					oPositions.iControlPosition = iControlPosition;
				}

				var sCurrentSelectedKey = oControlObject.oSelect.getSelectedKey();
				oControlObject.oSelect.destroyItems();
				oControlObject.oSelect.setSelectedKey(sCurrentSelectedKey);

			} else {
				oControlObject.oSelect = new sap.m.Select({id: oBtnMeta.sControlId
					? oBtnMeta.sControlId + "_SELECT" : undefined});
				oControlObject.oSelect.setType(sap.m.SelectType.IconOnly);
				oControlObject.oSelect.setAutoAdjustWidth(true);
				oControlObject.oSelect.setTooltip(oBtnMeta.sTooltip);
				oPositions.iControlPosition++;
				this.oBar["insertContent" + this.sDirection](oControlObject.oSelect, oPositions.iControlPosition);
				oControlObject.oSelect.attachChange(jQuery.proxy(function (oEvent) {
					var sKey = oEvent.getSource().getSelectedKey();
					if (this.aCallBacks[iButtonsCount]) {
						this.aCallBacks[iButtonsCount](sKey);
					}
				}, this));
				// if responsive bar is used create also a button for that select
				if (this.bAutomaticOverflow && !oControlObject.oButton) {
					oControlObject.oButton = new sap.m.Button();
					oControlObject.oButton.setText(
						getText(oBtnMeta, this.oApplicationImplementation)
					);
					if (oBtnMeta.sIcon) {
						oControlObject.oButton.setIcon(oBtnMeta.sIcon);
					}
					oControlObject.oButton.attachPress(jQuery.proxy(function (oEvent) {
						var fnSelect = this.getSelectReplacement(oBtnMeta);
						if (fnSelect) {
							fnSelect(oEvent);
						}
					}, this));
					oControlObject.oButton.setEnabled(!oBtnMeta.bDisabled && !this.bAllDisabled);
				}
			}

			if (oBtnMeta.sSelectedItemKey) {
				oControlObject.oSelect.setSelectedItem(oBtnMeta.sSelectedItemKey);
			}

			for ( var i = 0; i < oBtnMeta.aItems.length; i++) {
				var oSettings = oBtnMeta.aItems[i], oItem;
				if (!oSettings.id && oBtnMeta.sControlId) {
					// use stable IDs
					oSettings.id = oControlObject.oSelect.getId() + "_" + i;
				}
				var oItem = new sap.ui.core.Item(oSettings);
				oControlObject.oSelect.addItem(oItem);
			}

			if (oBtnMeta.sSelectedItemKey) {
				oControlObject.oSelect.setSelectedKey(oBtnMeta.sSelectedItemKey);
			}

			this.aCallBacks[iButtonsCount] = oBtnMeta.onChange;
			oRet = oControlObject.oSelect;
		}
		if (oBtnMeta.sIcon != oRet.getIcon()) {
			oRet.setIcon(oBtnMeta.sIcon);
		}
		if (oBtnMeta.sId) {
			this.mButtons[oBtnMeta.sId] = oRet;
		}
		oRet.setEnabled(!oBtnMeta.bDisabled && !this.bAllDisabled);
		oPositions.iActive++;
		return oRet;
	},

	/*
	 * getSelectReplacement: function(oBtnMeta){ return jQuery.proxy(function(oEvent){ var iButtonsCount =
	 * this.oBarList.iOverflowPosition; oPositions = { iActive : 0, iControlPosition :
	 * this.oBarList.oBar.indexOfContentRight(this.oBarList.aButtons[iButtonsCount].oButton), }; var oSelectMeta = {}
	 * jQuery.extend(oSelectMeta, oBtnMeta); var oBarList = this.oBarList; oSelectMeta.onChange = function(oKey){
	 * oBarList.revertOverflowReplacement(); oBtnMeta.onChange(oKey); };
	 * this.oBarList.ensureControlAtPosition(oSelectMeta, "s", iButtonsCount, oPositions); //
	 * this.oBarList.aButtons[iButtonsCount].oSelect.getPopup().open(); this.oBarList.bIsOverflowReplaced = true; },
	 * this); },
	 */

	getSelectReplacement : function (oBtnMeta) {
		var sSelectedItemKey = oBtnMeta.sSelectedItemKey;
		var fClose = function (oResult) {
			if (oResult.selectedIndex >= 0) {
				var sSelectedItemKeyNew = oBtnMeta.aItems[oResult.selectedIndex].key;
				if (sSelectedItemKeyNew != sSelectedItemKey) {
					sSelectedItemKey = sSelectedItemKeyNew;
					oBtnMeta.sSelectedItemKey = sSelectedItemKey;
				  oBtnMeta.onChange(sSelectedItemKey);
				}
			}
		};
		return function (oEvent) {
			var aItems = [];
			var iSelection = 0;
			for ( var i = 0; i < oBtnMeta.aItems.length; i++) {
				aItems.push({
					itemContent : oBtnMeta.aItems[i].text
				});
				if (oBtnMeta.aItems[i].key == sSelectedItemKey) {
					iSelection = i;
				}
			}
			sSelectedItemKey = oBtnMeta.aItems[iSelection].key;
			sap.ca.ui.dialog.selectItem.open({
				title : oEvent.getSource().getText(),
				items : aItems,
				defaultIndex : iSelection
			}, fClose);
		};
	},

	revertOverflowReplacement : function () {
		if (this.bIsOverflowReplaced) {
			this.ensureControlAtPosition(sap.ca.scfld.md.app.ButtonListHelper.getOverflowMeta(this), "b",
					this.iOverflowPosition, {});
			this.bIsOverflowReplaced = false;
		}
	},

	setBtnText : function (sId, sText, bNoStorage) {
		var oButton = this.mButtons[sId],
			oControlObject;
		if (oButton) {
			if (oButton.getMetadata().getName() === "sap.m.Select") {
				// if text is set, tooltip of select needs to be set
				oButton.setTooltip(sText);
				oButton._sTooltip = sText;
				// select control adjust text of button representation only
				oControlObject = findControlObject(this.aButtons, oButton);
				oButton = oControlObject.oButton;
			}
			if (oButton) {
				oButton.setText(sText);
				// if text is set, no tooltip is needed
				oButton.setTooltip("");
				oButton._sTooltip = "";
				if (oButton._sTextInBar) {
					oButton._sTextInBar = sText;
				}
				if (oButton._sTextInActionSheet) {
					oButton._sTextInActionSheet = sText;
				}
				if (this.oBarOverflow) {
					this.oBarOverflow.buttonTextChanged();
				}
			}
		} else {
			if (this.oChild) {
				this.oChild.setBtnText(sId, sText, true);
			}
			if (this.oOverflowList) {
				this.oOverflowList.setBtnText(sId, sText, true);
			}
		}
		if (!bNoStorage) {
			this.oModifications.mChangedTexts[sId] = sText;
		}
	},

	/**
	 * Helper to retrieve current selection for given generic button type.
	 * @param {string} sType
	 *     The type name of the generic button (e.g. "filter")
	 * @param {string} sDefaultKey
	 *     The key that should be used if there is no selection available
	 * @return {string}
	 *     The currently stored selected key for given generic button type
	 * @private
	 */
	_getCurrentSelection: function (sType, sDefaultKey) {
		if (!this.mSelections[sType]) {
			this.mSelections[sType] = sDefaultKey;
		}
		return this.mSelections[sType];
	},

	/**
	 * Update the selected key for given generic button type.
	 * @param {string} sType
	 *     The type name of the generic button (e.g. "filter")
	 * @param {string} sCurrentKey
	 *     The current selected key value for given generic button type
	 * @private
	 */
	_updateCurrentSelection: function (sType, sCurrentKey) {
		this.mSelections[sType] = sCurrentKey;
	}
});

sap.ca.scfld.md.app.ButtonListHelper.getOverflowMeta = function (oOwner) {
	return {
		sIcon : "sap-icon://overflow",
		sControlId : oOwner.sOverflowId,
		sTooltip: oOwner.oApplicationImplementation.UilibI18nModel.getResourceBundle().getText("MORE"),
		onBtnPressed : function (evt) {
			oOwner.oOverflowList.oActionSheet.openBy(evt.getSource());
		}
	};
};
})();
