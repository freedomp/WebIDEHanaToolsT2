/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.smartfield.Configuration.
sap.ui.define(["jquery.sap.global", "sap/ui/comp/library", "sap/ui/core/Element"], function(jQuery, library, Element) {
	"use strict";
	
	/**
	 * Constructor for a new smartfield/Configuration.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The configuration allows to further define the behavior of a SmartField.
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartfield.Configuration
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Configuration = Element.extend("sap.ui.comp.smartfield.Configuration", /** @lends sap.ui.comp.smartfield.Configuration.prototype */ { metadata : {
	
		library : "sap.ui.comp",
		properties : {
	
			/**
			 * By default the SmartField chooses the controls it hosts by interpreting OData meta data. This property allows to overwrite the default behavior to some
			 * extent; for example this property allows to define that an OData property of type Edm.Boolean is displayed as combo box.
			 */
			controlType : {type : "sap.ui.comp.smartfield.ControlType", group : "Misc", defaultValue : null},
	
			/**
			 * The property specifies how value helps available for input fields are presented; for example whether for the result of a value help request
			 * descriptions of the values that can possibly be chosen from the value help are displayed.
			 */
			displayBehaviour : {type : "sap.ui.comp.smartfield.DisplayBehaviour", group : "Misc", defaultValue : null}			
		}
	}});
	

	return Configuration;

}, /* bExport= */ true);
