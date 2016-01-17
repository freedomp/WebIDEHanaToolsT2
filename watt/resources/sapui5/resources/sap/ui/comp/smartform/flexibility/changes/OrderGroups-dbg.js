/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/fl/changeHandler/Base', 'sap/ui/fl/Utils'
], function(jQuery, Base, FlexUtils) {
	"use strict";

	/**
	 * Change handler for reordering of groups.
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.OrderGroups
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.27.0
	 */
	var OrderGroups = function() {
	};
	OrderGroups.prototype = jQuery.sap.newObject(Base.prototype);

	/**
	 * Reorders groups.
	 *
	 * @param {object} oChange change object with instructions to be applied on the control
	 * @param {object} oControl control instance which is referred to in change selector section 
	 * @public
	 */
	OrderGroups.prototype.applyChange = function(oChange, oControl) {

		if (!oChange) {
			throw new Error("No change instance");
		}

		var oChangeJson = oChange.getDefinition();

		if (!oChangeJson.selector || !oChangeJson.content || !oChangeJson.content.orderGroups || oChangeJson.content.orderGroups.length === 0 || Object.keys(oChangeJson.selector).length !== 1) {
			throw new Error("Change format invalid");
		}

		if (!oControl || !oControl.getGroups) {
			throw new Error("No control instance or wrong control instance supplied");
		}

		// Array of groups of smart form in old order
		var aGroup = oControl.getGroups();
		var iGroupNumber = aGroup.length;

		// Array of ids of groups in new order as defined in the change
		var aKeyOrderFromChange = oChangeJson.content.orderGroups;

		var iKeyNumberInChange = aKeyOrderFromChange.length;

		// build object of groups of smart form which has their ids as key
		var oGroups = {}, oGroup = {};
		var sKey;
		var i;
		for (i = 0; i < iGroupNumber; i++) {
			oGroup = aGroup[i];
			if (!oGroup.getId()) {
				return;
			}
			sKey = oGroup.getId();
			oGroups[sKey] = oGroup;
		}

		// remove all groups from smart form
		if (iGroupNumber > 0) {
			oControl.removeAllGroups();
		}

		// reinsert groups into smart form in order given by change
		for (i = 0; i < iGroupNumber; i++) {
			sKey = aKeyOrderFromChange[i];
			if (oGroups[sKey]) {
				oControl.insertGroup(oGroups[sKey], i);
				oGroups[sKey] = null;
			}
		}

		// add groups not handled by change at the end
		i = iKeyNumberInChange;
		jQuery.each(oGroups, function(key, group) {
			if (group !== null) {
				i += 1;
				oControl.insertGroup(group, i);
			}
		});

	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo with attribute orderGroups which contains an array which holds the ids of 
	 * 				   the groups of the smart form in the desired order 
	 * @public
	 */
	OrderGroups.prototype.completeChangeContent = function(oChange, oSpecificChangeInfo) {

		var oChangeJson = oChange.getDefinition();

		if (oSpecificChangeInfo.orderGroups) {
			if (!oChangeJson.content) {
				oChangeJson.content = {};
			}
			if (!oChangeJson.content.orderGroups) {
				oChangeJson.content.orderGroups = {};
			}
			oChangeJson.content.orderGroups = oSpecificChangeInfo.orderGroups;
		} else {
			throw new Error("oSpecificChangeInfo.orderGroups attribute required");
		}

	};

	return OrderGroups;
},
/* bExport= */true);
