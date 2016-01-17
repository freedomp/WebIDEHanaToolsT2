/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/ui/fl/Utils', 'jquery.sap.global', 'sap/ui/fl/changeHandler/Base'
], function(Utils, jQuery, Base) {
	"use strict";

	/**
	 * Change handler for renaming a smart form group element.
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.RenameField
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.27.0
	 */
	var RenameField = function() {
	};
	RenameField.prototype = jQuery.sap.newObject(Base.prototype);

	/**
	 * Renames a smart form group element.
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @public
	 */
	RenameField.prototype.applyChange = function(oChangeWrapper, oControl) {
		var oChange = oChangeWrapper.getDefinition();
		if (oChange.texts && oChange.texts.fieldLabel && oChange.texts.fieldLabel.value) {
			if (!oControl) {
				throw new Error("no Control provided for renaming");
			}

			if (typeof oControl.setLabel === 'function') {
				oControl.setLabel(oChange.texts.fieldLabel.value);
			} else if (typeof oControl.setTitle === 'function') {
				oControl.setTitle(oChange.texts.fieldLabel.value);
			} else {
				throw new Error('Control does not support "renameField" change');
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
	 * @param {object} oSpecificChangeInfo with attribute fieldLabel, the new field label to be included in the change
	 * @public
	 */
	RenameField.prototype.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo) {
		var oChange = oChangeWrapper.getDefinition();
		if (oSpecificChangeInfo.fieldLabel) {
			this.setTextInChange(oChange, "fieldLabel", oSpecificChangeInfo.fieldLabel, "XFLD");
		} else {
			throw new Error("oSpecificChangeInfo.fieldLabel attribute required");
		}
	};

	return RenameField;
},
/* bExport= */true);
