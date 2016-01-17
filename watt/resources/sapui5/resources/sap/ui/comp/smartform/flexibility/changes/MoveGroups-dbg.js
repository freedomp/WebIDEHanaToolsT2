/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/fl/changeHandler/Base', 'sap/ui/fl/Utils'
], function(jQuery, Base, FlexUtils) {
	"use strict";

	/**
	 * Change handler for moving of groups inside a smart form.
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.MoveGroups
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.27.0
	 */
	var MoveGroups = function() {
	};
	MoveGroups.prototype = jQuery.sap.newObject(Base.prototype);

	/**
	 * Moves group(s) inside a smart form.
	 *
	 * @param {object} oChange change object with instructions to be applied on the control
	 * @param {object} oSmartForm Smart form instance which is referred to in change selector section 
	 * @public
	 */
	MoveGroups.prototype.applyChange = function(oChange, oSmartForm) {

		if (!oChange) {
			throw new Error("No change instance");
		}

		var oChangeJson = oChange.getDefinition();

		if (!oChangeJson.selector || !oChangeJson.content || !oChangeJson.content.moveGroups || oChangeJson.content.moveGroups.length === 0 || Object.keys(oChangeJson.selector).length !== 1) {
			throw new Error("Change format invalid");
		}

		if (!oSmartForm || !oSmartForm.getGroups) {
			throw new Error("No smart form instance supplied");
		}

		// Array of groups of smart form in old order
		var aGroups = [];
		aGroups = oSmartForm.getGroups();
		if (aGroups.length === 0) {
			return;
		}
		var iGroupNumber = aGroups.length;

		// adapt order of groups in aGroups according to the change
		var oGroup = {}, oMoveGroup = {};
		var iMoveGroups = oChangeJson.content.moveGroups.length;
		var iIndex;
		var i, j;

		for (i = 0; i < iMoveGroups; i++) {

			oMoveGroup = oChangeJson.content.moveGroups[i];

			if (!oMoveGroup.id) {
				throw new Error("Change format invalid - moveGroups element has no id attribute");
			}
			if (typeof (oMoveGroup.index) !== "number") {
				throw new Error("Change format invalid - moveGroups element index attribute is no number");
			}

			// determine the index of the group to move in aGroups 
			iIndex = -1;
			for (j = 0; j < iGroupNumber; j++) {
				if (aGroups[j].getId() === oMoveGroup.id) {
					iIndex = j;
					break;
				}
			}

			if (iIndex === oMoveGroup.index || iIndex === -1) {
				continue;
			}

			// memorize the group to move
			oGroup = aGroups[iIndex];

			// remove the group to move from aGroups
			aGroups.splice(iIndex, 1);

			// reinsert the group to aGroups at the new index
			aGroups.splice(oMoveGroup.index, 0, oGroup);

		}

		// remove all groups from smart form
		oSmartForm.removeAllGroups();

		// reinsert groups into smart form in new order
		for (i = 0; i < iGroupNumber; i++) {
			oSmartForm.insertGroup(aGroups[i], i);
		}

	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo with attribute moveGroups which contains an array which holds objects which have attributes
	 * 				   id and index - id is the id of the group to move and index the new position of the group in the smart form 
	 * @public
	 */
	MoveGroups.prototype.completeChangeContent = function(oChange, oSpecificChangeInfo) {

		var oChangeJson = oChange.getDefinition();

		if (oSpecificChangeInfo.moveGroups) {

			var oMoveGroup = {};
			var i, iLength = oSpecificChangeInfo.moveGroups.length;

			if (iLength === 0) {
				throw new Error("MoveGroups array is empty");
			}

			for (i = 0; i < iLength; i++) {
				oMoveGroup = oSpecificChangeInfo.moveGroups[i];
				if (!oMoveGroup.id) {
					throw new Error("MoveGroups element has no id attribute");
				}
				if (typeof (oMoveGroup.index) !== "number") {
					throw new Error("Index attribute at MoveGroups element is no number");
				}
			}

			if (!oChangeJson.content) {
				oChangeJson.content = {};
			}

			if (!oChangeJson.content.moveGroups) {
				oChangeJson.content.moveGroups = [];
			}

			oChangeJson.content.moveGroups = oSpecificChangeInfo.moveGroups;

		} else {

			throw new Error("oSpecificChangeInfo.moveGroups attribute required");

		}

	};

	return MoveGroups;
},
/* bExport= */true);
