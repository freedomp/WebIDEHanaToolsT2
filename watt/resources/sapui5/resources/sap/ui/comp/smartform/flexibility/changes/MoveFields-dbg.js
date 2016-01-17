/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/fl/changeHandler/Base', 'sap/ui/fl/Utils'
], function(jQuery, Base, FlexUtils) {
	"use strict";

	/**
	 * Change handler for moving of fields within/between groups.
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.MoveFields
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.27.0
	 */
	var MoveFields = function() {
	};
	MoveFields.prototype = jQuery.sap.newObject(Base.prototype);

	/**
	 * Moves field(s) within a group or between groups.
	 *
	 * @param {object} oChange change object with instructions to be applied on the control
	 * @param {object} oGroup Smart form group instance which is referred to in change selector section 
	 * @public
	 */
	MoveFields.prototype.applyChange = function(oChange, oGroup) {

		if (!oChange) {
			throw new Error("No change instance");
		}

		var oChangeJson = oChange.getDefinition();

		if (!oChangeJson.selector || !oChangeJson.content || !oChangeJson.content.moveFields || oChangeJson.content.moveFields.length === 0 || Object.keys(oChangeJson.selector).length !== 1) {
			throw new Error("Change format invalid");
		}

		if (!oGroup || !oGroup.getGroupElements || !oGroup.getId) {
			throw new Error("No smart form group instance supplied");
		}

		// determine target group of move
		var oTargetGroup = oGroup;
		var bTargetDiffers = false;

		if (oChangeJson.content.targetId) {
			var sSourceKey = oGroup.getId();
			if (sSourceKey !== oChangeJson.content.targetId) {
				oTargetGroup = sap.ui.getCore().byId(oChangeJson.content.targetId);
				bTargetDiffers = true;
			}
		}
		
		// Array of fields of smart form group in old order
		var aFields = oGroup.getGroupElements();
		if (!aFields) {
			return;
		}
		var iFieldNumber = aFields.length;

		// move is within a group - adapt order of fields in aFields according to the change
		// move is between groups - remove field from source group and insert it at target group
		var oField = {}, oMoveField = {};
		var iMoveFields = oChangeJson.content.moveFields.length;
		var iIndex, i, j;

		for (i = 0; i < iMoveFields; i++) {

			oMoveField = oChangeJson.content.moveFields[i];

			if (!oMoveField.id) {
				throw new Error("Change format invalid - moveFields element has no id attribute");
			}
			if (typeof (oMoveField.index) !== "number") {
				throw new Error("Change format invalid - moveFields element index attribute is no number");
			}
			
			// determine the index of the field to move in aFields 
			iIndex = -1;
			for (j = 0; j < iFieldNumber; j++) {
				var sControlId = aFields[j].getId();
				if (sControlId === oMoveField.id) {
					iIndex = j;
					break;
				}
			}

			// move within group and position of field is unchanged
			if (bTargetDiffers === false && iIndex === oMoveField.index) {
				continue;
			}
			// field not found in source group
			if (iIndex === -1) {
				continue;
			}

			// get the field to move
			oField = aFields[iIndex];
			
			// move is between groups - remove field from source group
			// and insert it at target group
			if (bTargetDiffers === true) {
				oGroup.removeGroupElement(oField);
				oTargetGroup.insertGroupElement(oField, oMoveField.index);
				continue;
			}

			// move is within a group
			// remove the field to move from aFields
			aFields.splice(iIndex, 1);

			// reinsert the field to aFields at the new index
			if (bTargetDiffers === false) {
				aFields.splice(oMoveField.index, 0, oField);
			}

		}
		
		// in case of move between groups we are done
		if (bTargetDiffers === true) {
			return;
		}

		// remove all fields from smart form group (source)
		oGroup.removeAllGroupElements();

		// reinsert fields into smart form group in new order (source)
		for (i = 0; i < iFieldNumber; i++) {
			oGroup.insertGroupElement(aFields[i], i);
		}

	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo with attribute moveFields which contains an array which holds objects which have attributes
	 * 				   id and index - id is the id of the field to move and index the new position of the field in the smart form group 
	 * @public
	 * @function
	 * @name sap.ui.fl.changeHandler.MoveGroups#completeChangeContent
	 */
	MoveFields.prototype.completeChangeContent = function(oChange, oSpecificChangeInfo) {

		var oChangeJson = oChange.getDefinition();

		if (oSpecificChangeInfo.moveFields) {

			var oMoveField = {};
			var i, iLength = oSpecificChangeInfo.moveFields.length;

			if (iLength === 0) {
				throw new Error("MoveFields array is empty");
			}

			for (i = 0; i < iLength; i++) {
				oMoveField = oSpecificChangeInfo.moveFields[i];
				if (!oMoveField.id) {
					throw new Error("MoveFields element has no id attribute");
				}
				if (typeof (oMoveField.index) !== "number") {
					throw new Error("Index attribute at MoveFields element is no number");
				}
			}

			if (!oChangeJson.content) {
				oChangeJson.content = {};
			}

			if (!oChangeJson.content.moveFields) {
				oChangeJson.content.moveFields = [];
			}

			oChangeJson.content.moveFields = oSpecificChangeInfo.moveFields;

			if (oSpecificChangeInfo.targetId) {
				oChangeJson.content.targetId = oSpecificChangeInfo.targetId;
			}

		} else {

			throw new Error("oSpecificChangeInfo.moveFields attribute required");

		}

	};

	return MoveFields;
},
/* bExport= */true);
