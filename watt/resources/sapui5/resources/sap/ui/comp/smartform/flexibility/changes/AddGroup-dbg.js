/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/ui/fl/Utils', 'jquery.sap.global', 'sap/ui/fl/changeHandler/Base'
], function(Utils, jQuery, Base) {
	"use strict";

	/**
	 * Change handler for adding a smart form group.
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.AddGroup
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.27.0
	 */
	var AddGroup = function() {
	};
	AddGroup.prototype = jQuery.sap.newObject(Base.prototype);

	/**
	 * Adds a smart form group.
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.comp.smartform.SmartForm} oForm smart form control that matches the change selector for applying the change
	 * @param {object} oControlMap flat list of ids that point to control instances
	 * @public
	 */
	AddGroup.prototype.applyChange = function(oChangeWrapper, oForm) {
		var oChange = oChangeWrapper.getDefinition();
		if (oChange.texts && oChange.texts.groupLabel && oChange.texts.groupLabel.value && oChange.content && oChange.content.group && oChange.content.group.id) {
			jQuery.sap.require("sap.ui.comp.smartform.Group"); //revise in future when concept for accessing controls within change handlers is available
			var oGroup = new sap.ui.comp.smartform.Group(oChange.content.group.id);
			if (oGroup.setLabel) {
				oGroup.setLabel(oChange.texts.groupLabel.value);
			}
			if (oForm && oForm.insertGroup) {
				oForm.insertGroup(oGroup, oChange.content.group.index);
			} else {
				throw new Error("no parent form provided for adding the group");
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
	 * @param {object} oSpecificChangeInfo with attributes "groupLabel", the group label to be included in the change and "newControlId", the control ID for the control to be added
	 * @public
	 */
	AddGroup.prototype.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo) {
		var oChange = oChangeWrapper.getDefinition();
		if (oSpecificChangeInfo.groupLabel) {
			this.setTextInChange(oChange, "groupLabel", oSpecificChangeInfo.groupLabel, "XFLD");
		} else {
			throw new Error("oSpecificChangeInfo.groupLabel attribute required");
		}
		if (!oChange.content) {
			oChange.content = {};
		}
		if (!oChange.content.group) {
			oChange.content.group = {};
		}
		if ( oSpecificChangeInfo.newControlId ){
			oChange.content.group.id = oSpecificChangeInfo.newControlId;
		}else {
			throw new Error("oSpecificChangeInfo.newControlId attribute required");
		}
		if (oSpecificChangeInfo.index === undefined) {
			throw new Error("oSpecificChangeInfo.index attribute required");
		} else {
			oChange.content.group.index = oSpecificChangeInfo.index;
		}
	};

	return AddGroup;
},
/* bExport= */true);
