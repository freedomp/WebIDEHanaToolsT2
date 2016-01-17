/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/*global sap */

sap.ui.define(["jquery.sap.global", "sap/ui/fl/changeHandler/Base", "sap/ui/fl/Utils"], function(jQuery, Base, FlexUtils) {
	"use strict";

	/**
	 * Change handler for setting properties on controls
	 *
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.Property
	 * @author SAP SE
	 * @version 1.32.7
	 * @since 1.30
	 * @private
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Property = function() {
	};

	Property.prototype = jQuery.sap.newObject(Base.prototype);

	/**
	 * Changes the properties on the given control
	 *
	 * @param {object} oChange - change object with instructions to be applied on the control
	 * @param {object} oControl - the control which has been determined by the selector id
	 * @public
	 * @name sap.ui.fl.changeHandler.Property#applyChange
	 */
	Property.prototype.applyChange = function(oChange, oControl) {

		try {
			var oDef = oChange.getDefinition();

			oDef.content.forEach(function(propertyChange){
				var propertyName = propertyChange.propertyName;
				var propertyMetadata = oControl.getMetadata().getProperties()[propertyName];
				var propertySetter = propertyMetadata._sMutator;

				oControl[propertySetter](propertyChange.newValue);
			});
		} catch (ex) {
			throw new Error("Applying property changes failed: " +  ex);
		}

	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo with attribute property which contains an array which holds objects which have attributes
	 * 				   id and index - id is the id of the field to property and index the new position of the field in the smart form group
	 * @public
	 * @name sap.ui.fl.changeHandler.Property#completeChangeContent
	 */
	Property.prototype.completeChangeContent = function(oChange, oSpecificChangeInfo) {

		var oChangeJson = oChange.getDefinition();

		if (oSpecificChangeInfo.parameters) {

			oChangeJson.content = oSpecificChangeInfo.parameters;

		} else {

			throw new Error("oSpecificChangeInfo.parameters attribute required");

		}

	};

	return Property;
}, /* bExport= */true);
