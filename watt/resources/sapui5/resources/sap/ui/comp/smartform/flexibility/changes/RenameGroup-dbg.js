/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/ui/fl/Utils', 'jquery.sap.global', 'sap/ui/fl/changeHandler/Base'
], function(Utils, jQuery, Base) {
	"use strict";

	/**
	 * Change handler for renaming a SmartForm group.
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.RenameGroup
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.27.0
	 */
	var RenameGroup = function() {
	};
	RenameGroup.prototype = jQuery.sap.newObject(Base.prototype);

	/**
	 * Renames a form group.
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.comp.smartform.Group} oGroup Group control that matches the change selector for applying the change
	 * @public
	 */
	RenameGroup.prototype.applyChange = function(oChangeWrapper, oGroup) {
		var oChange = oChangeWrapper.getDefinition();
		if (oChange.texts && oChange.texts.groupLabel && oChange.texts.groupLabel.value) {
			if (oGroup && oGroup.setLabel) {
				oGroup.setLabel(oChange.texts.groupLabel.value);
			} else {
				throw new Error("no Group provided for renaming");
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
	 * @param {object} oSpecificChangeInfo with attribute groupLabel, the new group label to be included in the change
	 * @public
	 */
	RenameGroup.prototype.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo) {
		var oChange = oChangeWrapper.getDefinition();
		if (oSpecificChangeInfo.groupLabel) {
			this.setTextInChange(oChange, "groupLabel", oSpecificChangeInfo.groupLabel, "XFLD");
		} else {
			throw new Error("oSpecificChangeInfo.groupLabel attribute required");
		}
	};

	return RenameGroup;
},
/* bExport= */true);
