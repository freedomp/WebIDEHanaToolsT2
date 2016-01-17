/*
 * ! @copyright@
 */
sap.ui.define([
	"./Error", "sap/suite/ui/generic/template/library"
], function(Error, TemplateLibrary) {
	"use strict";
	
	var Severity = TemplateLibrary.ListReport.nav.Severity;
	
	var SelectionVariant = sap.ui.base.Object.extend("sap.suite.ui.generic.template.ListReport.nav.SelectionVariant",
	{
		_rValidateSign: new RegExp("[E|I]"),
		_rValidateOption: new RegExp("EQ|NE|LE|GE|LT|GT|BT|CP"),

		constructor: function(vSelectionVariant) {
			this._mParameters = {};
			this._mSelectOptions = {};

			this._sId = "";

			if (vSelectionVariant !== undefined) {
				if (typeof vSelectionVariant === "string") {
					this._parseFromString(vSelectionVariant);
				} else if (typeof vSelectionVariant === "object") {
					this._parseFromObject(vSelectionVariant);
				} else {
					throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
				}
			}
		},

		getID: function() {
			return this._sId;
		},

		setID: function(sId) {
			this._sId = sId;
		},

		setText: function(sNewText) {
			if (typeof sNewText !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			this._sText = sNewText;
		},

		getText: function() {
			return this._sText;
		},

		setParameterContextUrl: function(sURL) {
			if (typeof sURL !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			this._sParameterCtxUrl = sURL;
		},

		getParameterContextUrl: function() {
			return this._sParameterCtxUrl;
		},

		getFilterContextUrl: function() {
			return this._sFilterCtxUrl;
		},

		setFilterContextUrl: function(sURL) {
			if (typeof sURL !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			this._sFilterCtxUrl = sURL;
		},

		addParameter: function(sName, sValue) {
			if (typeof sName !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			if (typeof sValue !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			if (sName === "") {
				throw new Error("SelectionVariant.PARAMETER_WITHOUT_NAME", Severity.ERROR);
			}

			if (this._mSelectOptions[sName]) {
				throw new Error("SelectionVariant.PARAMETER_SELOPT_COLLISION", Severity.ERROR);
			}

			this._mParameters[sName] = sValue;

			return this;
		},

		removeParameter: function(sName) {
			if (typeof sName !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			if (sName === "") {
				throw new Error("SelectionVariant.PARAMETER_WITHOUT_NAME", Severity.ERROR);
			}

			delete this._mParameters[sName];

			return this;
		},

		renameParameter: function(sNameOld, sNameNew) {
			if (typeof sNameOld !== "string" || typeof sNameNew !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			if (sNameOld === "" || sNameNew === "") {
				throw new Error("SelectionVariant.PARAMETER_WITHOUT_NAME", Severity.ERROR);
			}
			if (this._mParameters[sNameOld] !== undefined) {
				if (this._mSelectOptions[sNameNew]) {
					throw new Error("SelectionVariant.PARAMETER_SELOPT_COLLISION", Severity.ERROR);
				}
				if (this._mParameters[sNameNew]) {
					throw new Error("SelectionVariant.PARAMETER_COLLISION", Severity.ERROR);
				}
				this._mParameters[sNameNew] = this._mParameters[sNameOld];
				delete this._mParameters[sNameOld];
			}
			return this;
		},

		getParameter: function(sName) {
			if (typeof sName !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			return this._mParameters[sName];
		},

		getParameterNames: function() {
			return Object.keys(this._mParameters);
		},

		addSelectOption: function(sPropertyName, sSign, sOption, sLow, sHigh) {
			if (typeof sPropertyName !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			if (sPropertyName === "") {
				throw new Error("SelectionVariant.INVALID_PROPERTY_NAME", Severity.ERROR);
			}
			if (typeof sSign !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			if (typeof sOption !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			if (typeof sLow !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			if (sOption === "BT" && typeof sHigh !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			if (!this._rValidateSign.test(sSign.toUpperCase())) {
				throw new Error("SelectionVariant.INVALID_SIGN", Severity.ERROR);
			}

			if (!this._rValidateOption.test(sOption.toUpperCase())) {
				throw new Error("SelectionVariant.INVALID_OPTION", Severity.ERROR);
			}

			if (this._mParameters[sPropertyName]) {
				throw new Error("SelectionVariant.PARAMETER_SELOPT_COLLISION", Severity.ERROR);
			}

			if (sOption !== "BT") {
				// only "Between" has two parameters; for all others, sHigh may not be filled
				if ((sHigh !== undefined) && (sHigh !== "") && (sHigh !== null)) {
					throw new Error("SelectionVariant.HIGH_PROVIDED_THOUGH_NOT_ALLOWED", Severity.ERROR);
				}
			}

			// check, if there's already an entry for this property
			if (this._mSelectOptions[sPropertyName] === undefined) {
				// if not, create a new set of entries
				this._mSelectOptions[sPropertyName] = [];
			}

			var oEntry = {
				Sign: sSign.toUpperCase(),
				Option: sOption.toUpperCase(),
				Low: sLow
			};

			if (sOption === "BT") {
				oEntry.High = sHigh;
			} else {
				oEntry.High = null; // Note this special case in the specification!
				// The specification requires that the "High" attribute is always
				// available. In case that no high value is necessary, yet the value
				// may not be empty, but needs to be set to "null"
			}

			// check if it is necessary to add select option
			for (var i = 0; i < this._mSelectOptions[sPropertyName].length; i++) {
				var oExistingEntry = this._mSelectOptions[sPropertyName][i];
				if (oExistingEntry.Sign === oEntry.Sign && oExistingEntry.Option === oEntry.Option && oExistingEntry.Low === oEntry.Low && oExistingEntry.High === oEntry.High) {
					return this;
				}
			}
			this._mSelectOptions[sPropertyName].push(oEntry);

			return this;
		},

		removeSelectOption: function(sName) {
			if (typeof sName !== "string") {
				throw new Error("SelectionVariant.SELOPT_WRONG_TYPE", Severity.ERROR);
			}

			if (sName === "") {
				throw new Error("SelectionVariant.SELOPT_WITHOUT_NAME", Severity.ERROR);
			}

			delete this._mSelectOptions[sName];

			return this;
		},

		renameSelectOption: function(sNameOld, sNameNew) {
			if (typeof sNameOld !== "string" || typeof sNameNew !== "string") {
				throw new Error("SelectionVariant.SELOPT_WRONG_TYPE", Severity.ERROR);
			}
			if (sNameOld === "" || sNameNew === "") {
				throw new Error("SelectionVariant.SELOPT_WITHOUT_NAME", Severity.ERROR);
			}
			if (this._mSelectOptions[sNameOld] !== undefined) {
				if (this._mSelectOptions[sNameNew]) {
					throw new Error("SelectionVariant.SELOPT_COLLISION", Severity.ERROR);
				}
				if (this._mParameters[sNameNew]) {
					throw new Error("SelectionVariant.PARAMETER_SELOPT_COLLISION", Severity.ERROR);
				}
				this._mSelectOptions[sNameNew] = this._mSelectOptions[sNameOld];
				delete this._mSelectOptions[sNameOld];
			}
			return this;
		},

		getSelectOption: function(sPropertyName) {
			if (typeof sPropertyName !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}
			if (sPropertyName === "") {
				throw new Error("SelectionVariant.INVALID_PROPERTY_NAME", Severity.ERROR);
			}

			var oEntries = this._mSelectOptions[sPropertyName];
			if (!oEntries) {
				return undefined;
			}

			return JSON.parse(JSON.stringify(oEntries)); // create an immutable clone of data to prevent obfuscation by caller.
		},

		getSelectOptionsPropertyNames: function() {
			return Object.keys(this._mSelectOptions);
		},

		getValue: function(sName) {
			var aValue = this.getSelectOption(sName);
			if (aValue !== undefined) {
				// a range for the selection option is provided; so this is the leading one
				return aValue;
			}

			var sParamValue = this.getParameter(sName);
			if (sParamValue !== undefined) {
				// a parameter value has been provided; we need to convert it to the range format
				aValue = [
					{
						Sign: "I",
						Option: "EQ",
						Low: sParamValue,
						High: null
					}
				];
				return aValue;
			}

			return undefined;
		},

		toJSONObject: function() {
			var oExternalSelectionVariant = {
				Version: { // Version attributes are not part of the official specification,
					Major: "1", // but could be helpful later for implementing a proper lifecycle/interoperability
					Minor: "0",
					Patch: "0"
				},
				SelectionVariantID: this._sId
			};

			if (this._sParameterCtxUrl) {
				oExternalSelectionVariant.ParameterContextUrl = this._sParameterCtxUrl;
			}

			if (this._sFilterCtxUrl) {
				oExternalSelectionVariant.FilterContextUrl = this._sFilterCtxUrl;
			}

			if (this._sText) {
				oExternalSelectionVariant.Text = this._sText;
			} else {
				oExternalSelectionVariant.Text = "Selection Variant with ID " + this._sId;
			}

			this._determineODataFilterExpression(oExternalSelectionVariant);

			this._serializeParameters(oExternalSelectionVariant);
			this._serializeSelectOptions(oExternalSelectionVariant);

			return oExternalSelectionVariant;
		},

		toJSONString: function() {
			return JSON.stringify(this.toJSONObject());
		},

		_determineODataFilterExpression: function(oExternalSelectionVariant) {
			// specification does not indicate what is expected here in detail
			oExternalSelectionVariant.ODataFilterExpression = ""; // not supported yet - it's allowed to be optional
		},

		_serializeParameters: function(oExternalSelectionVariant) {

			if (this._mParameters.length === 0) {
				return;
			}

			// Note: Parameters section is optional (see specification section 2.4.2.1)
			oExternalSelectionVariant.Parameters = [];

			jQuery.each(this._mParameters, function(sParameterName, sParameterValue) {
				var oParObject = {
					PropertyName: sParameterName,
					PropertyValue: sParameterValue
				};
				oExternalSelectionVariant.Parameters.push(oParObject);
			});
		},

		_serializeSelectOptions: function(oExternalSelectionVariant) {

			if (this._mSelectOptions.length === 0) {
				return;
			}

			oExternalSelectionVariant.SelectOptions = [];

			jQuery.each(this._mSelectOptions, function(sPropertyName, aEntries) {
				var oSelectOption = {
					PropertyName: sPropertyName,
					Ranges: aEntries
				};

				oExternalSelectionVariant.SelectOptions.push(oSelectOption);
			});
		},

		_parseFromString: function(sJSONString) {
			if (sJSONString === undefined) {
				throw new Error("SelectionVariant.UNABLE_TO_PARSE_INPUT", Severity.ERROR);
			}

			if (typeof sJSONString !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE", Severity.ERROR);
			}

			var oInput = JSON.parse(sJSONString);
			// the input needs to be an JSON string by specification

			this._parseFromObject(oInput);
		},

		_parseFromObject: function(oInput) {

			if (oInput.SelectionVariantID === undefined) {
				// Do not throw an error, but only write a warning into the log.
				// The SelectionVariantID is mandatory according to the specification document version 1.0,
				// but this document is not a universally valid standard.
				// It is said that the "implementation of the SmartFilterBar" may supersede the specification.
				// Thus, also allow an initial SelectionVariantID.
				// throw new sap.suite.ui.generic.template.ListReport.nav.Error("SelectionVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID",
				// Severity.ERROR);
				jQuery.sap.log.warning("SelectionVariantID is not defined");
				oInput.SelectionVariantID = "";
			}

			this.setID(oInput.SelectionVariantID);

			if (oInput.ParameterContextUrl !== undefined && oInput.ParameterContextUrl !== "") {
				this.setParameterContextUrl(oInput.ParameterContextUrl);
			}

			if (oInput.FilterContextUrl !== undefined && oInput.FilterContextUrl !== "") {
				this.setFilterContextUrl(oInput.FilterContextUrl);
			}

			if (oInput.Text !== undefined) {
				this.setText(oInput.Text);
			}

			// note that ODataFilterExpression is ignored right now - not supported yet!

			if (oInput.Parameters) {
				this._parseFromStringParameters(oInput.Parameters);
			}

			if (oInput.SelectOptions) {
				this._parseFromStringSelectOptions(oInput.SelectOptions);
			}
		},

		_parseFromStringParameters: function(aParameters) {
			jQuery.each(aParameters, jQuery.proxy(function(iIdx, oEntry) {
				this.addParameter(oEntry.PropertyName, oEntry.PropertyValue);
			}, this));
		},

		_parseFromStringSelectOptions: function(aSelectOptions) {
			jQuery.each(aSelectOptions, jQuery.proxy(function(iIdx, oSelectOption) {

				if (!oSelectOption.Ranges) {
					jQuery.sap.log.warning("Select Option object does not contain a Ranges entry; ignoring entry");
					return true; // "continue"
				}

				if (!jQuery.isArray(oSelectOption.Ranges)) {
					throw new Error("SelectionVariant.SELECT_OPTION_RANGES_NOT_ARRAY", Severity.ERROR);
				}

				jQuery.each(oSelectOption.Ranges, jQuery.proxy(function(iIdx2, oRange) {
					this.addSelectOption(oSelectOption.PropertyName, oRange.Sign, oRange.Option, oRange.Low, oRange.High);
				}, this));
			}, this));
		}
	});

	return SelectionVariant;

});