/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/*global sap */

sap.ui.define(["jquery.sap.global", "sap/ui/fl/changeHandler/Base", "sap/ui/fl/Utils"], function(jQuery, Base, FlexUtils) {
	"use strict";

	/**
	 * Change handler for moving of fields within/between groups.
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.MoveFields
	 * @author SAP SE
	 * @version 1.32.7
	 * @since 1.30
	 * @private
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Move = function() {
	};

	Move.prototype = jQuery.sap.newObject(Base.prototype);

	/**
	 * Moves field(s) within a group or between groups.
	 *
	 * @param {object} oChange change object with instructions to be applied on the control
	 * @param {object} oGroup Smart form group instance which is referred to in change selector section
	 * @public
	 * @function
	 * @name sap.ui.fl.changeHandler.Move#applyChange
	 */
	Move.prototype.applyChange = function(oChange, oControl) {

		try {
			var oDef = oChange.getDefinition();

			oDef.content.forEach(function(moveChange){

				var sourceContainer = sap.ui.getCore().byId(moveChange.sourceContainerId);
				var targetContainer = sap.ui.getCore().byId(moveChange.targetContainerId);

				sourceContainer.removeAggregation(oControl.sParentAggregationName, oControl);
				targetContainer.insertAggregation(moveChange.targetAggregation, oControl, moveChange.index);
				
			});
		} catch (ex) {
			throw new Error("Applying move changes failed: " +  ex);
		}


	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo with attribute move which contains an array which holds objects which have attributes
	 * 				   id and index - id is the id of the field to move and index the new position of the field in the smart form group
	 * @public
	 * @function
	 * @name sap.ui.fl.changeHandler.MoveGroups#completeChangeContent
	 */
	Move.prototype.completeChangeContent = function(oChange, oSpecificChangeInfo) {

		var oChangeJson = oChange.getDefinition();

		if (oSpecificChangeInfo.parameters) {

			oChangeJson.content = oSpecificChangeInfo.parameters;

		} else {

			throw new Error("oSpecificChangeInfo.parameters attribute required");

		}

	};

	return Move;
}, /* bExport= */true);
