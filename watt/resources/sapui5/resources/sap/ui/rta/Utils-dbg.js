/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/*global Promise */// declare unusual global vars for JSLint/SAPUI5 validation

// Provides object sap.ui.rta.Utils.
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/fl/Utils",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/ElementUtil",
	"sap/ui/comp/odata/FieldSelectorModelConverter",
	"sap/ui/fl/registry/Settings",
	'sap/ui/comp/smartform/GroupElement',
	'sap/ui/comp/smartform/Group',
	'sap/ui/comp/smartfield/SmartField'
],
function(jQuery, FlexUtils, OverlayUtil, ElementUtil, FieldSelectorModelConverter, Settings, GroupElement, Group, SmartField) {
	"use strict";

	/**
	 * Class for Utils.
	 * 
	 * @class
	 * Utility functionality to work with controls, e.g. iterate through aggregations, find parents, ...
	 *
	 * @author SAP SE
	 * @version 1.32.7
	 *
	 * @private
	 * @static
	 * @since 1.30
	 * @alias sap.ui.rta.Utils
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var Utils = {};

	Utils._aEditableTypes = ["sap.ui.comp.smartform.SmartForm", "sap.ui.comp.smartform.Group", "sap.ui.comp.smartform.GroupElement"];
	Utils._sFocusableOverlayClass = ".sapUiDtOverlaySelectable";

	/**
	 * Utility function to check via backend calls if the custom field button shall be enabled or not
	 * @param  {sap.ui.core.Control}  oControl Control to be checked
	 * @return {Boolean}          true if CustomFieldCreation functionality is to be enabled, false if not
	 */
	Utils.isCustomFieldAvailable = function(oControl) {
		jQuery.sap.require("sap.ui.fl.fieldExt.Access");

		var sComponentName = FlexUtils.getComponentClassName(oControl);
		var bShowCreateExtFieldButton = false;
		var oFieldSelectorModelConverter = new FieldSelectorModelConverter(oControl.getModel());
		var sSelectedKey;

		//call this function to create Entity array
		oFieldSelectorModelConverter.getConvertedModel();

		return Settings.getInstance(sComponentName).then(function(oSettings) {
			if (oSettings.isModelS) {
				bShowCreateExtFieldButton = oSettings.isModelS();
			}
			if (!bShowCreateExtFieldButton) {
				return Promise.resolve();
			} else {
				var oMDA = oFieldSelectorModelConverter.getMetaDataAnalyzer();
				try {
					var aSelectedKeys = oFieldSelectorModelConverter.getEntityTypes();
					if (aSelectedKeys && aSelectedKeys.length > 0) {
						sSelectedKey = aSelectedKeys[0].key;
					}
					var oPromise = sap.ui.fl.fieldExt.Access.getBusinessContexts(oMDA.oModel.sServiceUrl, sSelectedKey);
					oPromise.fail(function(oError) {
						if (oError) {
							if (jQuery.isArray(oError.errorMessages)) {
								for (var i = 0; i < oError.errorMessages.length; i++) {
									jQuery.sap.log.error(oError.errorMessages[i].text);
								}
							}
						}
						return Promise.resolve();
					});
					return oPromise.then(function(oResult) {
						if (oResult) {
							if (oResult.BusinessContexts) {
								if (oResult.BusinessContexts.length > 0) {
									return Promise.resolve(oResult);
								}
							}
						}
					});
				} catch (oError) {
					jQuery.sap.log.error("exception occured in sap.ui.fl.fieldExt.Access.getBusinessContexts");
					return Promise.resolve();
				}
			}
		});
	};

	/**
	 * Checks if element is hideable
	 * 
	 * @return {boolean} whether the element can be hidden or not
	 * @public
	 */
	Utils.isElementHideable = function(oElement) {
		return ((oElement instanceof GroupElement || oElement instanceof Group) && !this.isElementMandatory(oElement)); 
	};

	/**
	 * Checks if element is mandatory
	 * 
	 * @return {boolean} whether the element is mandatory or not
	 * @public
	 */
	Utils.isElementMandatory = function(oElement) {		
		var bMandatory = false;
		
		if (oElement instanceof GroupElement) {
			var aFields = oElement.getFields();
			for (var i = 0; i < aFields.length; i++) {
				var oGroupElement = aFields[i];
				if (oGroupElement instanceof SmartField) {
					bMandatory = oGroupElement.getMandatory();
					if (bMandatory) {
						// Break searching all SmartFields and get back on the 
						// first found mandatory rendered SmartField
						break;
					}
				}
			}
		} else if (oElement instanceof Group) {
			var aGroupElements = oElement.getGroupElements();
			for (var j = 0; j < aGroupElements.length; j++) {
				return this.isElementMandatory(aGroupElements[j]);
			}
		}
		return bMandatory;
	};


	/**
	 * Check if overlay is mutable in runtime
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay overlay object
	 * @private
	 */
	Utils.isOverlayMutable = function(oOverlay) {
		var oElement = oOverlay.getElementInstance();
		var bIsOfEditableType, bIsVisible, bHasStableId, bBlockHasStableId;

		bIsOfEditableType = this._aEditableTypes.some(function(sType) {
			return ElementUtil.isInstanceOf(oElement, sType);
		});

		if (bIsOfEditableType) {
			bIsVisible = oElement.getVisible ? oElement.getVisible() : true;

			if (bIsVisible) {
				bHasStableId = FlexUtils.checkControlId(oElement);

				if (bHasStableId) {
					if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.SmartForm")) {
						bBlockHasStableId = bHasStableId;
					} else {
						var oBlockOverlay = oOverlay.getParentElementOverlay();
						var oBlock = oBlockOverlay ? oBlockOverlay.getElementInstance() : null;
						bBlockHasStableId = oBlock && FlexUtils.checkControlId(oBlock);
					}
				}
			}
			
		
		}

		return bIsOfEditableType && bHasStableId && bBlockHasStableId;
	};
	
	/**
	 * Secure extract a label from an element
	 * @param  {Object} any Object
	 * @return {String} a label string or undefined
	 */
	Utils.getLabelForElement = function(oElement) {
		// first try getlabelText(), if not available try getLabel().getText()
		var sFieldLabel = oElement.getLabelText ? oElement.getLabelText() : undefined;
		if (!sFieldLabel) {
			sFieldLabel = oElement.getLabel ? oElement.getLabel() : undefined;
		}
		if (!sFieldLabel) {
			sFieldLabel = oElement.getText ? oElement.getText() : undefined;
		}
		return (typeof sFieldLabel) === "string" ? sFieldLabel : undefined;
	};

	/**
	 * Checks if overlay is selectable in RTA (selectable also means focusable for RTA)
	 * @param {sap.ui.dt.ElementOverlay} oOverlay to check
	 * @return  {boolean} if is selectable
	 * @private
	 */
	Utils.isOverlaySelectable = function(oOverlay) {
		// check the real DOM visibility should be preformed while oOverlay.isVisible() can be true, but if element has no geometry, overlay will not be visible in UI
		return oOverlay.isSelectable() && oOverlay.$().is(":visible");
	};
	
	/**
	 * Returns the previous editable overlay
	 * @return  {sap.ui.dt.ElementOverlay} overlay object
	 * @private
	 */
	Utils.getPreviousSelectableOverlay = function(oOverlay) {
		var oPreviousOverlay = OverlayUtil.getPreviousOverlay(oOverlay);

		while (oPreviousOverlay && !this.isOverlaySelectable(oPreviousOverlay)) {
			oPreviousOverlay = OverlayUtil.getPreviousOverlay(oPreviousOverlay);
		}
		return oPreviousOverlay;
	};

	/**
	 * Returns the next editable overlay
	 * @return  {sap.ui.dt.ElementOverlay} overlay object
	 * @private
	 */
	Utils.getNextSelectableOverlay = function(oOverlay) {
		var oNextOverlay = OverlayUtil.getNextOverlay(oOverlay);
		
		while (oNextOverlay && !this.isOverlaySelectable(oNextOverlay)) {
			oNextOverlay = OverlayUtil.getNextOverlay(oNextOverlay);
		}
		return oNextOverlay;
	};

	/**
	 * Returns overlay instance for an overlay's dom element
	 * @param {element} oDomRef DOM element
	 * @return  {sap.ui.dt.ElementOverlay} overlay object
	 * @private
	 */
	Utils.getOverlayInstanceForDom = function(oDomRef) {
		var sId = jQuery(oDomRef).attr("id");
		if (sId) {
			return sap.ui.getCore().byId(sId);
		}
	};

	/**
	 * Returns the first focusable overlay
	 * @return  {sap.ui.dt.ElementOverlay} overlay object
	 * @private
	 */
	Utils.getFirstFocusableOverlay = function() {
		var $overlay = jQuery(this._sFocusableOverlayClass).first();
		var oOverlay = this.getOverlayInstanceForDom($overlay);
		if (!this.isOverlaySelectable(oOverlay)) {
			oOverlay = this.getNextSelectableOverlay(oOverlay);
		}
		return oOverlay;
	};

	/**
	 * Returns the last focusable overlay
	 * @return  {sap.ui.dt.ElementOverlay} overlay object
	 * @private
	 */
	Utils.getLastFocusableOverlay = function() {
		var $overlay = jQuery(this._sFocusableOverlayClass).last();
		var oOverlay = this.getOverlayInstanceForDom($overlay);
		if (!this.isOverlaySelectable(oOverlay)) {
			oOverlay = this.getPreviousSelectableOverlay(oOverlay);
		}
		return oOverlay;
	};

	/**
	 * Returns the next focusable overlay
	 * @return  {sap.ui.dt.ElementOverlay} overlay object
	 * @private
	 */
	Utils.getNextFocusableOverlay = function() {
		var oFocusedOverlay = this.getFocusedOverlay();
		if (oFocusedOverlay) {
			return this.getNextSelectableOverlay(oFocusedOverlay);
		}
	};
	
	/**
	 * Returns the previous focusable overlay
	 * @return  {sap.ui.dt.ElementOverlay} overlay object
	 * @private
	 */
	Utils.getPreviousFocusableOverlay = function() {
		var oFocusedOverlay = this.getFocusedOverlay();
		if (oFocusedOverlay) {
			return this.getPreviousSelectableOverlay(oFocusedOverlay);
		}
	};
	
	/**
	 * Returns the focused overlay
	 * @return  {sap.ui.dt.ElementOverlay} overlay object
	 * @private
	 */
	Utils.getFocusedOverlay = function() {
		var oElement = sap.ui.getCore().byId(document.activeElement.id);
		if (oElement instanceof sap.ui.dt.ElementOverlay) {
			return oElement;
		}
	};

	/**
	 * Returns the first focusable child overlay
	 * @return  {sap.ui.dt.ElementOverlay} overlay object
	 * @private
	 */
	Utils.getFirstFocusableChildOverlay = function(oOverlay) {
		var oFirstFocusableChildOverlay = OverlayUtil.getFirstChildOverlay(oOverlay);

		while (oFirstFocusableChildOverlay && !this.isOverlaySelectable(oFirstFocusableChildOverlay)) {
			oFirstFocusableChildOverlay = OverlayUtil.getNextSiblingOverlay(oFirstFocusableChildOverlay);
		}
		return oFirstFocusableChildOverlay;
	};

	/**
	 * Returns the next focusable sibling overlay
	 * @return  {sap.ui.dt.ElementOverlay} overlay object
	 * @private
	 */
	Utils.getNextFocusableSiblingOverlay = function(oOverlay) {
		var oNextFocusableSiblingOverlay = OverlayUtil.getNextSiblingOverlay(oOverlay);

		while (oNextFocusableSiblingOverlay && !this.isOverlaySelectable(oNextFocusableSiblingOverlay)) {
			oNextFocusableSiblingOverlay = OverlayUtil.getNextSiblingOverlay(oNextFocusableSiblingOverlay);
		}
		return oNextFocusableSiblingOverlay;
	};

	/**
	 * Returns the previous focusable sibling overlay
	 * @return  {sap.ui.dt.ElementOverlay} overlay object
	 * @private
	 */
	Utils.getPreviousFocusableSiblingOverlay = function(oOverlay) {
		var oPreviousFocusableSiblingOverlay = OverlayUtil.getPreviousSiblingOverlay(oOverlay);

		while (oPreviousFocusableSiblingOverlay && !this.isOverlaySelectable(oPreviousFocusableSiblingOverlay)) {
			oPreviousFocusableSiblingOverlay = OverlayUtil.getPreviousSiblingOverlay(oPreviousFocusableSiblingOverlay);
		}
		return oPreviousFocusableSiblingOverlay;
	};

	/**
	 * get closest view in parent tree for an element
	 * @param  {sap.ui.core.Element} oElement element object
	 * @return {sap.ui.core.Element} oElement element object
	 * @private
	 */
	Utils.getClosestViewFor = function(oElement) {
		if (!oElement && !oElement.getParent) {
			return;
		}
		var oParentElement = oElement.getParent();
		if (oParentElement && oParentElement.getMetadata().getName() !== "sap.ui.core.mvc.XMLView") {
			return this.getClosestViewFor(oParentElement);
		}
		return oParentElement;
	};

	/*
	 * Looks for parent control with specified class name
	 * @param  {sap.ui.core.Control} oControl Control to be checked
	 * @param  {string} sType class name of parent control
	 * @return {sap.ui.core.Control} the parent control
	 * @private
	 */
	Utils.getClosestTypeForControl = function(oControl, sType) {
		var oParentElement = oControl.getParent();
		if (oParentElement && oParentElement.getMetadata().getName() !== sType) {
			return this.getClosestTypeForControl(oParentElement, sType);
		}
		return oParentElement;
	};

	/*
	 * Checks if control is supported
	 * @param  {sap.ui.core.Control} oControl Control to be checked
	 * @private
	 */
	Utils._checkIsSupportedControl = function(oControl, aSupportedControls) {
		for (var i = 0; i < aSupportedControls.length; i++) {
			if (oControl instanceof aSupportedControls[i]) {
				return true;
			}
		}
	};

	/*
	 * Checks whether a Group has Fields which are not bound to an OData model.
	 * @param  {sap.ui.comp.smartform.Group} oGroup Control to be checked
	 * @returns {boolean} false if group has no fields with oData binding.
	 * @private
	 */
	Utils.hasGroupUnBoundFields = function(oGroup) {
		var aElements = oGroup.getGroupElements();
		for (var j = 0; j < aElements.length; j++) {
			var oElement = aElements[j];
			if (!this.hasGroupElementBoundFields(oElement)) {
				return true;
			}
		}
		return false;
	};

	/*
	 * Checks whether a GroupElement has Fields which are bound to an OData model.
	 * @param  {sap.ui.comp.smartform.GroupElement} GroupElement Control to be checked
	 * @returns {boolean} true if one field has oData binding.
	 * @private
	 */
	Utils.hasGroupElementBoundFields = function(oGroupElement) {
		var aElements = oGroupElement.getFields();
		if (aElements.length === 0) {
			return true;
		}
		for (var j = 0; j < aElements.length; j++) {
			var oElement = aElements[j];
			if (!oElement.getDomRef()) {
				continue;
			}
			if (this._isElementBound(oElement)) {
				return true;
			}
		}
		return false;
	};

	/*
	 * Checks whether an Element is bound to an OData Model.
	 * @param  {sap.ui.core.Element} oElement element to be checked
	 * @returns {boolean} true if element has oData binding.
	 * @private
	 */
	Utils._isElementBound = function(oElement) {
		var mBindingInfos = oElement.mBindingInfos;
		//No Binding at all
		if (Object.keys(mBindingInfos).length === 0) {
			return false;
		} else {
			for (var oPropertyName in mBindingInfos) {
				var aParts = mBindingInfos[oPropertyName].parts;
				for (var i = 0; i < aParts.length; i++) {
					if (aParts[i].model) {
						var sModelName = oElement.getModel(aParts[i].model).getMetadata().getName();
						if (sModelName === "sap.ui.model.odata.ODataModel" || sModelName === "sap.ui.model.odata.v2.ODataModel") {
							return true;
						}
					} else {
						var sModelName = oElement.getModel().getMetadata().getName();
						if (sModelName === "sap.ui.model.odata.ODataModel" || sModelName === "sap.ui.model.odata.v2.ODataModel") {
							return true;
						}
					}
				}
			}
		}
	};

	/**
	 * Walks up the DOM to find the next supported block element
	 * @param  {sap.ui.core.Control} oControl Control to be checked
	 * @return {sap.ui.core.Control} the next supported block control
	 * @private
	 */
	Utils.findSupportedBlock = function(oControl, aSupportedControls) {
		if (this._checkIsSupportedControl(oControl, aSupportedControls)) {
			return oControl;
		} else {
			oControl = oControl.getParent();
			while (oControl) {
				if (this._checkIsSupportedControl(oControl, aSupportedControls)) {
					return oControl;
				}
				oControl = oControl.getParent();
			}
		}
	};

	Utils.createFieldLabelId = function(oGroup, sEntityType, oField) {
		var sControlId = oGroup.getId() + "_" + sEntityType + "_" + oField.getBindingPath("value");
		sControlId = sControlId.replace("/", "_");
		return sControlId;
	};

	return Utils;
}, /* bExport= */ true);
