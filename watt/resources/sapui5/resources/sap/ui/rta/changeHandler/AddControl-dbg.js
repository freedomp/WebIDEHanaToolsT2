/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/*global sap */

sap.ui.define(["jquery.sap.global", "sap/ui/fl/changeHandler/Base"], function(jQuery, Base) {
	"use strict";

	/**
	 * Change handler for adding of fields to a group.
	 * @constructor
	 * @alias sap.ui.rta.changeHandler.AddControl
	 * @author SAP SE
	 * @version 1.32.7
	 * @since 1.30
	 * @private
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var AddControl = function() {
	};

	AddControl.prototype = jQuery.sap.newObject(Base.prototype);

	/**
	 * Moves field(s) within a group or between groups.
	 *
	 * @param {object} oChange change object with instructions to be applied on the control
	 * @param {object} oControl Smart form group instance which is referred to in change selector section
	 * @public
	 * @function
	 * @name sap.ui.rta.changeHandler.AddControl#applyChange
	 */
	AddControl.prototype.applyChange = function(oChange, oControl) {

		try {
			var oDef = oChange.getDefinition();
			var oClass = jQuery.sap.getObject(oDef.content.field.jsType);

			var oNewControl = new oClass({
				id : oDef.content.field.id,
				text : oDef.content.field.value
			});

			if (oNewControl.setTitle) {
				oNewControl.setTitle(oDef.texts.fieldLabel.value);
			}
			
			oControl.addAggregation(oDef.content.aggregation, oNewControl);

		} catch (ex) {
			throw new Error("Applying add control changes failed: " +  ex);
		}


	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChangeWrapper change object to be completed
	 * @param {object} oSpecificChangeInfo with attribute move which contains an array which holds objects which have attributes
	 * 				   id and index - id is the id of the field to move and index the new position of the field in the smart form group
	 * @public
	 * @function
	 * @name sap.ui.rta.changeHandler.AddControl#completeChangeContent
	 */
	AddControl.prototype.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo) {
		var oChange = oChangeWrapper.getDefinition();
		if (oSpecificChangeInfo.fieldLabel) {
			this.setTextInChange(oChange, "fieldLabel", oSpecificChangeInfo.fieldLabel, "XFLD");
		} else {
			throw new Error("oSpecificChangeInfo.fieldLabel attribute required");
		}
		if (!oChange.content) {
			oChange.content = {};
		}
		if (!oChange.content.field) {
			oChange.content.field = {};
		}
		if (oSpecificChangeInfo.fieldValue) {
			oChange.content.field.value = oSpecificChangeInfo.fieldValue;
		} else {
			throw new Error("oSpecificChangeInfo.fieldValue attribute required");
		}
		if (oSpecificChangeInfo.valueProperty) {
			oChange.content.field.valueProperty = oSpecificChangeInfo.valueProperty;
		} else {
			throw new Error("oSpecificChangeInfo.valueProperty attribute required");
		}
		if ( oSpecificChangeInfo.newControlId ){
			oChange.content.field.id = oSpecificChangeInfo.newControlId;
		}else {
			throw new Error("oSpecificChangeInfo.newControlId attribute required");
		}
		if (oSpecificChangeInfo.jsType) {
			oChange.content.field.jsType = oSpecificChangeInfo.jsType;/**/
		} else {
			throw new Error("oSpecificChangeInfo.jsType attribute required");
		}
		if (oSpecificChangeInfo.index === undefined) {
			throw new Error("oSpecificChangeInfo.index attribute required");
		} else {
			oChange.content.field.index = oSpecificChangeInfo.index;
		}
		if (oSpecificChangeInfo.entitySet){
			//an optional entity set can be configured
			oChange.content.field.entitySet = oSpecificChangeInfo.entitySet;
		}

	};

	return AddControl;
}, /* bExport= */true);
