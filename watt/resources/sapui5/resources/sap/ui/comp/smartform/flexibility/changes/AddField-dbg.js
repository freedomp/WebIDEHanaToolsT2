/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/fl/Utils', 'sap/ui/fl/changeHandler/Base'
], function(jQuery, Utils, Base) {
	"use strict";

	/**
	 * Change handler for adding a smart form group element (representing a field).
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.AddField
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.27.0
	 */
	var AddField = function() {
	};
	AddField.prototype = jQuery.sap.newObject(Base.prototype);

	/**
	 * Adds a smart form group element incl. a value control.
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.comp.smartform.Group} oGroup group control that matches the change selector for applying the change
	 * @public
	 */
	AddField.prototype.applyChange = function(oChangeWrapper, oGroup) {
		var oChange = oChangeWrapper.getDefinition();
		if (oChange.texts && oChange.texts.fieldLabel && oChange.texts.fieldLabel.value && oChange.content && oChange.content.field && oChange.content.field.id && oChange.content.field.jsType && oChange.content.field.value && oChange.content.field.valueProperty) {
			jQuery.sap.require("sap.ui.comp.smartform.GroupElement"); //revise in future when concept for accessing controls within change handlers is available
			var oGroupElement = new sap.ui.comp.smartform.GroupElement(oChange.content.field.id);
			if (oGroupElement.setLabel) {
				oGroupElement.setLabel(oChange.texts.fieldLabel.value);
			}
			//create the value control
			var ValueControlClass = this._getControlClass(oChange.content.field.jsType);
			var oValueControl = new ValueControlClass();
			if (oValueControl) {
				oValueControl.bindProperty(oChange.content.field.valueProperty, oChange.content.field.value);
				if ( oChange.content.field.entitySet && oValueControl.setEntitySet ){
					oValueControl.setEntitySet(oChange.content.field.entitySet);
				}
				oGroupElement.addElement(oValueControl);
			}
			//add group element to the existing group
			if (oGroup && oGroup.insertGroupElement) {
				oGroup.insertGroupElement(oGroupElement, oChange.content.field.index);	
			} else {
				throw new Error("no parent group provided for adding the field");
			}
		} else {
			Utils.log.error("Change does not contain sufficient information to be applied: [" + oChange.layer + "]" + oChange.namespace + "/" + oChange.fileName + "." + oChange.fileType);
			//however subsequent changes should be applied
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo with attributes "fieldLabel", the field label to be included in the change,
	 * 								 "fieldValue", the value for the control that displays the value, 
	 * 								 "valueProperty", the control property that holds the field value,
	 * 								 "newControlId", the control ID for the control to be added
	 * 								 and "jsType", the JavaScript control for the field value.
	 * @public
	 */
	AddField.prototype.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo) {
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
			oChange.content.field.jsType = oSpecificChangeInfo.jsType;
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

	/**
	 * Gets the control class from the dom for a given JavaScript type string.
	 *
	 * @param {string} sJsType - the JS type string; example "sap.ui.commons.TextView"
	 * @returns {sap.ui.core.Control} UI5 control class
	 * @private
	 */
	AddField.prototype._getControlClass = function(sJsType) {
		var oResult;
		jQuery.sap.require(sJsType);
		var aSegments = sJsType.split(".");
		var oJsClass = window;
		jQuery.each(aSegments, function(i, sSegment) {
			oJsClass = oJsClass[sSegment];
		});
		if (typeof (oJsClass) == "function") {
			oResult = oJsClass;
		}
		return oResult;
	};

	return AddField;
},
/* bExport= */true);
