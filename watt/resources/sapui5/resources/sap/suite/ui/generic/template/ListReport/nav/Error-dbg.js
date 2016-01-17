/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/base/EventProvider", "sap/suite/ui/generic/template/library", "sap/m/MessageBox"
], function(jQuery, EventProvider, TemplateLibrary, MessageBox) {
	"use strict";
	var SeverityType = TemplateLibrary.ListReport.nav.SeverityType;

	var LibError = EventProvider.extend("sap.suite.ui.generic.template.ListReport.nav.Error",
	{

		metadata: {
			publicMethods: [
				// getter methods of properties
				"getErrorCode", "getSeverity", "getPrevious", "getI18n", "getTextKey", "getParameters",
				// additional methods
				"resolveUIText", "resolveUITextDeep", "showMessageBox", "getErrorObject", "setUIText", "getUIText"
			],
			properties: []
		},

		constructor: function(sErrorCode, sSeverity, oPrevious, mUIText) {
			EventProvider.apply(this);

			this._sErrorCode = sErrorCode;
			this._sSeverity = sSeverity;
			this._oPrevious = oPrevious;

			this.setUIText(mUIText);
		},

		_sErrorCode: "",
		_sSeverity: "",
		_oPrevious: null,
		_mUIText: {
			oi18n: null,
			sTextKey: "",
			aParams: []
		}

	});

	LibError.prototype.getErrorCode = function() {
		return this._sErrorCode;
	};

	LibError.prototype.getSeverity = function() {
		return this._sSeverity;
	};

	LibError.prototype.getPrevious = function() {
		return this._oPrevious;
	};

	LibError.prototype.getI18n = function() {
		return this._mUIText.oi18n;
	};

	LibError.prototype.getTextKey = function() {
		return this._mUIText.sTextKey;
	};

	LibError.prototype.getParameters = function() {
		return this._mUIText.aParams;
	};

	LibError.prototype.getUIText = function() {
		return this._mUIText;
	};

	LibError.prototype.setUIText = function(mUIText) {
		if (typeof mUIText === "undefined") {
			return;
		}

		this._mUIText = {}; // create a new instance not at the level of the prototype, but on the level of the instance!
		this._mUIText.oi18n = mUIText.oi18n;
		this._mUIText.sTextKey = mUIText.sTextKey;
		this._mUIText.aParams = mUIText.aParams;

		if (typeof mUIText.oi18n !== "undefined" || typeof mUIText.sTextKey !== "undefined" || typeof mUIText.aParams !== "undefined") {
			jQuery.sap.assert(typeof mUIText.oi18n !== "undefined", "Specifying an error text message, but no i18n reference was provided");
			jQuery.sap.assert(typeof mUIText.sTextKey !== "undefined", "Specifying an error text message, but no text key was provided");
		}
	};

	LibError.prototype.isUITextAvailable = function() {
		return this._mUIText.sTextKey !== "" && typeof this._mUIText.oi18n !== undefined;
	};

	LibError.prototype.resolveUIText = function() {
		jQuery.sap.assert(typeof this._mUIText.oi18n !== "undefined", "Call to resolveUIText without a proper UI Text configuration: i18n object is missing");
		if (!this.isUITextAvailable()) {
			return "";
		}

		var aGetTextArgs = [
			this._mUIText.sTextKey
		];

		// add the parameters of the text
		if (typeof this._mUIText.aParams !== "undefined") {
			aGetTextArgs.push(this._mUIText.aParams);
		}

		return this._mUIText.oi18n.getText.apply(this._mUIText.oi18n, aGetTextArgs);
	};

	LibError.prototype.resolveUITextDeep = function() {
		var vResult = this._iterateThroughPreviousChain(function(oError) {
			if (!oError.isUITextAvailable()) {
				return undefined; // search for the next one
			}

			// oError can create a UIText
			return oError.resolveUIText();
		});

		if (typeof vResult === "undefined") {
			// there is no Error in the chain which is able to provide a UI Text
			return "";
		}

		return vResult;
	};

	LibError.prototype._iterateThroughPreviousChain = function(fVisitor) {
		var that = this; // oCurrentError
		var vResult;

		while (typeof that !== "undefined" && that !== null) {
			vResult = fVisitor(that);
			if (typeof vResult !== "undefined") {
				// fTask found what it searched for
				return vResult;
			}
			that = this._oPrevious;
		}

		return undefined;
	};

	LibError.prototype.showMessageBox = function(bDeep) {
		if (typeof bDeep === "undefined") {
			bDeep = false;
		}

		var sUIText = "", sSeverity = "";
		if (bDeep) {
			var vResult = this._iterateThroughPreviousChain(function(oError) {
				if (!oError.isUITextAvailable()) {
					return undefined; // search for the next one
				}

				// oError can create a UIText
				return {
					severity: oError._sSeverity,
					text: oError.resolveUIText()
				};
			});

			if (typeof vResult === "undefined") {
				jQuery.sap.assert(this.isUITextAvailable(), "Call to showMessagePopup on an error chain which does not have a proper UI Text");
				return;
			}
			sSeverity = vResult.severity;
			sUIText = vResult.text;

		} else {
			jQuery.sap.assert(this.isUITextAvailable(), "Call to showMessagePopup on an error without proper UI Text");

			sSeverity = this._sSeverity;
			sUIText = this.resolveUIText();
		}

		var sType;

		switch (sSeverity) {
			case SeverityType.ERROR:
				sType = MessageBox.Icon.ERROR;
				break;
			case SeverityType.INFO:
				sType = MessageBox.Icon.INFORMATION;
				break;
			case SeverityType.WARNING:
				sType = MessageBox.Icon.WARNING;
				break;
			case SeverityType.SUCCESS:
				sType = MessageBox.Icon.SUCCESS;
				break;
			default:
				jQuery.sap.assert(false, "Call to showMessagePopup on an error without proper Severity Type. Using SUCCESS as default");
				sType = MessageBox.Icon.SUCCESS;
		}

		MessageBox.show(sUIText, {
			icon: sType
		});
	};

	LibError.prototype.getErrorObject = function() {
		var oErrorObject = null;
		if (!this.isUITextAvailable()) {
			oErrorObject = new Error();
		} else {
			oErrorObject = new Error(this.resolveUIText());
		}

		oErrorObject.origin = this;
		return oErrorObject;
	};

	// final step for library
	return LibError;
});
