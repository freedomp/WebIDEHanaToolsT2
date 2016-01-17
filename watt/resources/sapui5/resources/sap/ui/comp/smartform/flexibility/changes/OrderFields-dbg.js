/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/fl/changeHandler/Base', 'sap/ui/fl/Utils'
], function(jQuery, Base, FlexUtils) {
	"use strict";

	/**
	 * Change handler for reordering of fields within a group.
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.OrderFields
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.27.0
	 */
	var OrderFields = function() {
	};
	OrderFields.prototype = jQuery.sap.newObject(Base.prototype);

	/**
	 * Reorders groups.
	 *
	 * @param {object} oChange change object with instructions to be applied on the control map
	 * @param {object} oControl control instance which is referred to in change selector section 
	 * @public
	 */
	OrderFields.prototype.applyChange = function(oChange, oControl) {

		if (!oChange) {
			throw new Error("No change instance");
		}

		var oChangeJson = oChange.getDefinition();

		if (!oChangeJson.selector || !oChangeJson.content || !oChangeJson.content.orderFields || oChangeJson.content.orderFields.length === 0 || Object.keys(oChangeJson.selector).length !== 1) {
			throw new Error("Change format invalid");
		}

		if (!oControl || !oControl.getGroupElements) {
			throw new Error("No control instance or wrong control instance supplied");
		}

		// Array of group elements of smart form in old order
		var aGroupElement = oControl.getGroupElements();
		var iGroupElementNumber = aGroupElement.length;

		// Array of ids of group elements in new order as defined in the change
		var aKeyOrderFromChange = oChangeJson.content.orderFields;

		var iKeyNumberInChange = aKeyOrderFromChange.length;

		// build object of group elements of smart form group which has their ids as key
		var oGroupElements = {}, oGroupElement = {};
		var sKey;
		var i;
		for (i = 0; i < iGroupElementNumber; i++) {
			oGroupElement = aGroupElement[i];
			if (!oGroupElement.getId()) {
				return;
			}
			sKey = oGroupElement.getId();
			oGroupElements[sKey] = oGroupElement;
		}

		// remove all group elements from smart form group
		oControl.removeAllGroupElements();

		// reinsert group elements into smart form group in order given by change
		for (i = 0; i < iGroupElementNumber; i++) {
			sKey = aKeyOrderFromChange[i];
			if (oGroupElements[sKey]) {
				oControl.insertGroupElement(oGroupElements[sKey], i);
				oGroupElements[sKey] = null;
			}
		}

		// add group elements not handled by change at the end
		i = iKeyNumberInChange;
		jQuery.each(oGroupElements, function(key, element) {
			if (element !== null) {
				i += 1;
				oControl.insertGroupElement(element, i);
			}
		});

	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo with attribute orderFields which contains an array which holds the ids of 
	 * 				   the group elements of the smart form group in the desired order 
	 * @public
	 */
	OrderFields.prototype.completeChangeContent = function(oChange, oSpecificChangeInfo) {

		var oChangeJson = oChange.getDefinition();

		if (oSpecificChangeInfo.orderFields) {
			if (!oChangeJson.content) {
				oChangeJson.content = {};
			}
			if (!oChangeJson.content.orderFields) {
				oChangeJson.content.orderFields = {};
			}
			oChangeJson.content.orderFields = oSpecificChangeInfo.orderFields;
		} else {
			throw new Error("oSpecificChangeInfo.orderFields attribute required");
		}

	};

	return OrderFields;
},
/* bExport= */true);
