/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.smartform.flexibility.Input.
sap.ui.define(['jquery.sap.global', 'sap/m/Input', 'sap/ui/comp/library'],
	function(jQuery, Input1, library) {
	"use strict";


	/**
	 * Constructor for a new smartform/flexibility/Input.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Input field with special focus handling
	 * @extends sap.m.Input
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartform.flexibility.Input
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Input = Input1.extend("sap.ui.comp.smartform.flexibility.Input", /** @lends sap.ui.comp.smartform.flexibility.Input.prototype */ { metadata : {

		library : "sap.ui.comp",
		events : {

			/**
			 * Fired when the field is readonly, focused and user pressed Space
			 */
			selectedByKeyboard : {}
		}
	}});

	Input.prototype.init = function() {
		Input1.prototype.init.call(this);
	};

	Input.prototype.onAfterRendering = function() {
		var oDomRef;

		Input1.prototype.onAfterRendering.apply(this);
		oDomRef = this.getDomRef();
		if (oDomRef) {
			oDomRef.tabIndex = 0;
		}
	};

	Input.prototype.onkeydown = function(oEvent) {
		var nKeyCode;

		Input1.prototype.onkeydown.apply(this, arguments);
		nKeyCode = oEvent.keyCode;
		if (nKeyCode === 32) { // Blank pressed
			if (this.getEditable() === false) {
				this.fireSelectedByKeyboard();
			}
		}
	};

	Input.prototype.onsapescape = function(oEvent) {
		Input1.prototype.onsapescape.apply(this, arguments);
		oEvent.stopPropagation(); // Prevent closing the dialog
		this.setEditable(false);
	};

	// onsapenter (compared to onkeydown) is called before the value is saved
	Input.prototype.onsapenter = function (oEvent) {
		if (!this.getValue()) {
			this.resetOnEmptyValue();
		}

		Input1.prototype.onsapenter.apply(this, arguments);
		this.setEditable(false);
	};

	Input.prototype.resetOnEmptyValue = function (oEvent) {
		if (!this.getValue()) {
			this.setValue(this._lastValue);
			this.onValueRevertedByEscape(this._lastValue);
		}
	};

	Input.prototype.onsapfocusleave = function (oEvent) {
		this.resetOnEmptyValue();
		Input1.prototype.onsapfocusleave.apply(this, arguments);
	};

	return Input;

}, /* bExport= */ true);
