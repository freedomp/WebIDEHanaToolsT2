/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/fl/changeHandler/Base'
], function(jQuery, Base) {
	"use strict";

	/**
	 * Change handler for removing a smart form group element.
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.RemoveField
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.27.0
	 */
	var RemoveField = function() {
	};
	RemoveField.prototype = jQuery.sap.newObject(Base.prototype);

	/**
	 * Removes a smart form group element.
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.comp.smartform.GroupElement} oField GroupElement control that matches the change selector for applying the change
	 * @public
	 */
	RemoveField.prototype.applyChange = function(oChangeWrapper, oField) {
		if (oField.getParent) {
			var oGroup = oField.getParent();
			if (oGroup.removeGroupElement) {
				oGroup.removeGroupElement(oField);
			}
		} else {
			throw new Error("no GroupElement control provided for removing the field");
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @public
	 */
	RemoveField.prototype.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo) {
		var oChange = oChangeWrapper.getDefinition();
		if (!oChange.content) {
			oChange.content = {};
		}
	};

	return RemoveField;
},
/* bExport= */true);
