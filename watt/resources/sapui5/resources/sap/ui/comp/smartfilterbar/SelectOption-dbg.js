/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.smartfilterbar.SelectOption.
sap.ui.define(['jquery.sap.global', 'sap/ui/comp/library', 'sap/ui/core/Element'],
	function(jQuery, library, Element) {
	"use strict";


	
	/**
	 * Constructor for a new smartfilterbar/SelectOption.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A Select Option can be used to specify default filter values for a control configuration of the SmartFilterBar.
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartfilterbar.SelectOption
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectOption = Element.extend("sap.ui.comp.smartfilterbar.SelectOption", /** @lends sap.ui.comp.smartfilterbar.SelectOption.prototype */ { metadata : {
	
		library : "sap.ui.comp",
		properties : {
	
			/**
			 * The sign for a Select Option. Possible values are I for include or E for exclude. Constants can be found here: sap.ui.comp.smartfilterbar.SelectOption.SIGN
			 */
			sign : {type : "string", group : "Misc", defaultValue : 'I'},
	
			/**
			 * The operator for a select option. The default value is EQ "for equals". Possible values can be found here: sap.ui.comp.smartfilterbar.SelectOption.OPERATOR.
			 */
			operator : {type : "string", group : "Misc", defaultValue : 'EQ'},
	
			/**
			 * The low value for a select option.
			 */
			low : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * The high value for a select option. The high value is only required for a few operators, e.g. BT (between).
			 */
			high : {type : "string", group : "Misc", defaultValue : null}
		}
	}});
	
	SelectOption.SIGN = {
		I: "I",
		include: "I",
		E: "E",
		exclude: "E"
	};
	
	SelectOption.OPERATOR = {
		EQ: "EQ",
		NE: "NE",
		CP: "CP",
		GT: "GT",
		GE: "GE",
		LT: "LT",
		LE: "LE",
		NP: "NP",
		BT: "BT",
		NB: "NB"
	};

	return SelectOption;

}, /* bExport= */ true);
