/*!
 * @copyright@
 */
sap.ui.define(["./NavError",  "sap/ui/base/Object", "jquery.sap.global"],
	function(Error, BaseObject, jQuery) {	
	"use strict";

	/**
	 * @class
	 * creates a new instance of a SelectionVariant. If no parameter is being passed, 
	 * an new empty instance is being created which ID has been set to <code>""</code>.
	 * Passing a JSON-serialized string complying to the Selection Variant Specification will parse it
	 * and the newly created instance will contain the same information. 
	 * @extends sap.ui.base.Object
	 * @constructor
	 * @public
	 * @alias sap.ui.generic.app.navigation.service.SelectionVariant
	 * @param {string|object} [vSelectionVariant] in case of type <code>string</code> the JSON-formatted string containing a Selection Variant which shall be parsed.
	 * If of type <code>object</code> the object-styled instance of the (raw) Selection Variant is expected.
	 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>Error code</th><th>Description</th></tr>
	 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>indicating that the data format of the Selection Variant provided is inconsistent</td></tr>
	 * <tr><td>SelectionVariant.UNABLE_TO_PARSE_INPUT</td><td>indicating that the provided string is not a JSON-formatted string</td></tr>
	 * <tr><td>SelectionVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID</td><td>indicating the SelectionVariantID of the SelectionVariantID cannot be retrieved</td></tr>
	 * <tr><td>SelectionVariant.PARAMETER_WITHOUT_VALUE</td><td>indicating that a parameter was attempted to be specified, but without providing any value (even not the empty value)</td></tr>
	 * <tr><td>SelectionVariant.SELECT_OPTION_WITHOUT_PROPERTY_NAME</td><td>indicating that a selection option has been defined, but missing the Ranges definition</td></tr>
	 * <tr><td>SelectionVariant.SELECT_OPTION_RANGES_NOT_ARRAY</td><td>indicating that the Ranges definition is not an array</td></tr>
	 * </table>
	 * These exceptions can only be thrown in case that the parameter <code>vSelectionVariant</code> has been provided. 
	 */
	var SelectionVariant = BaseObject.extend("sap.ui.generic.app.navigation.service.SelectionVariant",  /** @lends sap.ui.generic.app.navigation.service.SelectionVariant */ {
		_rVALIDATE_SIGN : new RegExp("[E|I]"),
		_rVALIDATE_OPTION : new RegExp("EQ|NE|LE|GE|LT|GT|BT|CP"),
	
		constructor : function(vSelectionVariant) {
			this._mParameters = {};
			this._mSelectOptions = {};
		
			this._sId = "";
		
			if (vSelectionVariant !== undefined) {
				if (typeof vSelectionVariant === "string") {
					this._parseFromString(vSelectionVariant);
				} else if (typeof vSelectionVariant === "object") {
					this._parseFromObject(vSelectionVariant);
				} else {
					throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
				}
			}
		},
	
		/**
		 * returns the identification of this Selection Variant
		 * @returns {string} the identification of this Selection Variant as made available during construction
		 * @public
		 */
		getID : function() {
			return this._sId;
		},
	
		/**
		 * sets the identification of this Selection Variant
		 * @param {string} sId the new identification of this Selection Variant 
		 * @public
		 */
		setID : function(sId) {
			this._sId = sId;
		},
	
		/**
		 * sets the text / description of this selection variant
		 * @param {string} sNewText the new description which shall be used
		 * @public
		 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>indicating an input parameter has an invalid type</td></tr>
		 * </table>
		 */
		setText : function(sNewText) {
			if (typeof sNewText !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			this._sText = sNewText;
		},
	
		/**
		 * returns the current text / description of this selection variant.
		 * @returns {string} the current description of this selection variant.
		 * @public
		 */
		getText : function() {
			return this._sText;
		},
	
		/**
		 * sets the context URL intended for the parameters
		 * @param {string} sURL the URL of the parameter context
		 * @public
		 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>indicating an input parameter has an invalid type</td></tr>
		 * </table>
		 */
		setParameterContextUrl : function(sURL) {
			if (typeof sURL !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			this._sParameterCtxUrl = sURL;
		},
	
		/**
		 * gets the currently context url intended for the parameters
		 * @returns {string} the current context URL for the parameters
		 * @public
		 */
		getParameterContextUrl : function() {
			return this._sParameterCtxUrl;
		},
	
		/**
		 * gets the currently context URL intended for the filters
		 * @returns {string} the current context URL for the filters
		 * @public
		 */
		getFilterContextUrl : function() {
			return this._sFilterCtxUrl;
		},
	
		/**
		 * sets the context URL intended for the filters
		 * @param {string} sURL the URL of the filters
		 * @public
		 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>indicating an input parameter has an invalid type</td></tr>
		 * </table>
		 */
		setFilterContextUrl : function(sURL) {
			if (typeof sURL !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			this._sFilterCtxUrl = sURL;
		},
	
		/**
		 * sets the value of a parameter called <code>sName</code> to the new value <code>sValue</code>.
		 * If the parameter was already set before, its value is overwritten.
		 * @param {string} sName the name of the parameter which shall be set. The <code>null</code> value is not allowed 
		 * (see specification "Selection Variants for UI Navigation in Fiori", section 2.4.2.1)
		 * @param {string} sValue the value of the parameter to be set
		 * @returns {object} this instance to allow method chaining.
		 * @public
		 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.PARAMETER_WITHOUT_NAME</td><td>indicating that name of the parameter has not been specified</td></tr>
		 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>indicating an input parameter has an invalid type or the value is set to <code>null</code></td></tr>
		 * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>indicating that another SelectOption with the same name as the parameter already exists</td></tr>
		 * </table>
		 */
		addParameter : function(sName, sValue) {
			if (typeof sName !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			if (typeof sValue !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			if (sName === "") {
				throw new Error("SelectionVariant.PARAMETER_WITHOUT_NAME");
			}
		
			if (this._mSelectOptions[sName]) {
				throw new Error("SelectionVariant.PARAMETER_SELOPT_COLLISION");
			}

			this._mParameters[sName] = sValue;
		
			return this;
		},
	
		/**
		 * removes a parameter called <code>sName</code> from the selection variant
		 * @param {string} sName the name of the parameter which shall be removed
		 * @returns {object} this instance to allow method chaining.
		 * @public
		 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.PARAMETER_WITHOUT_NAME</td><td>indicating that name of the parameter has not been specified</td></tr>
		 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>indicating an input parameter has an invalid type</td></tr>
		 * </table>
		 */
		removeParameter : function(sName) {
			if (typeof sName !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			if (sName === "") {
				throw new Error("SelectionVariant.PARAMETER_WITHOUT_NAME");
			}
		
			delete this._mParameters[sName];
		
			return this;
		},
	
		/**
		 * Renames a parameter called <code>sNameOld</code> to <code>sNameNew</code>. If a parameter or a select option with
		 * the name <code>sNameNew</code> already exists, an error is thrown. If a parameter with the name <code>sNameOld</code>
		 * does not exist, nothing is changed.
		 * @param {string} sNameOld the current name of the parameter which shall be renamed
		 * @param {string} sNameNew the new name of the parameter
		 * @returns {object} this instance to allow method chaining.
		 * @public
		 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.PARAMETER_WITHOUT_NAME</td><td>indicating that the name of a parameter has not been specified</td></tr>
		 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>indicating an input parameter has an invalid type</td></tr>
		 * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>indicating that another select option with the same new name already exists</td></tr>
		 * <tr><td>SelectionVariant.PARAMETER_COLLISION</td><td>indicating that another parameter with the same new name already exists</td></tr>
		 * </table>
		 */	
		renameParameter : function(sNameOld, sNameNew) {
			if (typeof sNameOld !== "string" || typeof sNameNew !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			if (sNameOld === "" || sNameNew === "") {
				throw new Error("SelectionVariant.PARAMETER_WITHOUT_NAME");
			}
			if (this._mParameters[sNameOld] !== undefined) {
				if (this._mSelectOptions[sNameNew]) {
					throw new Error("SelectionVariant.PARAMETER_SELOPT_COLLISION");
				}
				if (this._mParameters[sNameNew]) {
					throw new Error("SelectionVariant.PARAMETER_COLLISION");
				}
				this._mParameters[sNameNew] = this._mParameters[sNameOld];
				delete this._mParameters[sNameOld];
			}
			return this;
		},
	
		/**
		 * returns the value of the parameter called <code>sName</code> if it has been set before.
		 * In case that the parameter has never been set or has been removed, <code>undefined</code> is returned.
		 * @param {string} sName the name of the parameter which shall be returned.
		 * @returns {string} the value of parameter <code>sName</code>. Note that it is not possible that the value <code>null</code> is being returned.
		 * @public
		 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>indicating an input parameter has an invalid type</td></tr>
		 * </table>
		 */
		getParameter : function(sName) {
			if (typeof sName !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			return this._mParameters[sName];
		},
	
		/**
		 * returns the set of parameter names available in this selection variant
		 * @returns {array} the list of parameter names which are valid
		 * @public
		 */
		getParameterNames : function() {
			return Object.keys(this._mParameters);
		},
	
		/**
		 * adds a new range to the list of Select Options for a given parameter.
		 * @param {string} sPropertyName the name of the property for which the selection range shall be added.
		 * @param {string} sSign the sign of the range (<b>I</b>nclude or <b>E</b>xclude)
		 * @param {string} sOption the option of the range (<b>EQ</b> for "equals", <b>NE</b> for "not equals",
		 * <b>LE</b> for "less or equals", <b>GE</b> for "greater or equals", <b>LT</b> for "less than" (and not equals),
		 * <b>GT</b> for "greater than" (and not equals), <b>BT</b> for "between", or <b>CP</b> for "contains pattern"
		 * (ABAP-styled pattern matching with the asterisk as wildcard).
		 * @param {string} sLow the single value or the lower boundary of the interval. The <code>null</code> value is not allowed 
		 * (see specification "Selection Variants for UI Navigation in Fiori", section 2.4.2.1)
		 * @param {string} [sHigh] only to be set, in case sOption is <b>BT</b>: the upper boundary of the interval.
		 * Must be <code>undefined</code> or <code>null</code> in all other cases.
		 * @return {object} this instance to allow method chaining.
		 * @public
		 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.INVALID_SIGN</td><td>indicating that the sign is an invalid expression</td></tr>
		 * <tr><td>SelectionVariant.INVALID_OPTION</td><td>indicating that the option is an invalid expression</td></tr>
		 * <tr><td>SelectionVariant.HIGH_PROVIDED_THOUGH_NOT_ALLOWED</td><td>indicating that the upper boundary was specified, though the option is not "BT"</td></tr>
		 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>indicating an input parameter has an invalid type or the value is set to <code>null</code></td></tr>
		 * <tr><td>SelectionVariant.INVALID_PROPERTY_NAME</td><td>indicating that the property name is invalid, for example, it is not specified</td></tr>
		 * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>indicating that another Parameter with the same name as the property name already exists</td></tr>
		 * </table>
		 */
		addSelectOption : function(sPropertyName, sSign, sOption, sLow, sHigh) {
			if (typeof sPropertyName !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			if (sPropertyName === "") {
				throw new Error("SelectionVariant.INVALID_PROPERTY_NAME");
			}
			if (typeof sSign !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			if (typeof sOption !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			if (typeof sLow !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			if (sOption === "BT" && typeof sHigh !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			if (!this._rVALIDATE_SIGN.test(sSign.toUpperCase())) {
				throw new Error("SelectionVariant.INVALID_SIGN");
			}
		
			if (!this._rVALIDATE_OPTION.test(sOption.toUpperCase())) {
				throw new Error("SelectionVariant.INVALID_OPTION");
			}
		
			if (this._mParameters[sPropertyName]) {
				throw new Error("SelectionVariant.PARAMETER_SELOPT_COLLISION");
			}
		
			if (sOption !== "BT") {
				// only "Between" has two parameters; for all others, sHigh may not be filled
				if ( (sHigh !== undefined) && (sHigh !== "") && (sHigh !== null)) {
					throw new Error("SelectionVariant.HIGH_PROVIDED_THOUGH_NOT_ALLOWED");
				}
			}
		
			// check, if there's already an entry for this property
			if (this._mSelectOptions[sPropertyName] === undefined) {
				// if not, create a new set of entries
				this._mSelectOptions[sPropertyName] = [];
			}
		
			var oEntry = {
				Sign : sSign.toUpperCase(),
				Option : sOption.toUpperCase(),
				Low : sLow
			};
		
			if (sOption === "BT") {
				oEntry.High = sHigh;
			} else {
				oEntry.High = null;	// Note this special case in the specification!
				// The specification requires that the "High" attribute is always 
				// available. In case that no high value is necessary, yet the value
				// may not be empty, but needs to be set to "null"
			}
		
			//check if it is necessary to add select option
			for (var i = 0; i < this._mSelectOptions[sPropertyName].length; i++) {
				var oExistingEntry = this._mSelectOptions[sPropertyName][i];
				if (oExistingEntry.Sign === oEntry.Sign && oExistingEntry.Option === oEntry.Option && oExistingEntry.Low === oEntry.Low && oExistingEntry.High === oEntry.High) {
					return this;
				}
			}
			this._mSelectOptions[sPropertyName].push(oEntry);

			return this;
		},

		/**
		 * removes a select option called <code>sName</code> from the selection variant
		 * @param {string} sName the name of the select option which shall be removed
		 * @returns {object} this instance to allow method chaining.
		 * @public
		 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.SELOPT_WITHOUT_NAME</td><td>indicating that name of the Select Option has not been specified</td></tr>
		 * <tr><td>SelectionVariant.SELOPT_WRONG_TYPE</td><td>indicating that name of the parameter <code>sName</code> is an invalid type</td></tr>
		 * </table>
		 */
		removeSelectOption : function(sName) {
			if (typeof sName !== "string") {
				throw new Error("SelectionVariant.SELOPT_WRONG_TYPE");
			}
		
			if (sName === "") {
				throw new Error("SelectionVariant.SELOPT_WITHOUT_NAME");
			}
		
			delete this._mSelectOptions[sName];
		
			return this;
		},
	
		/**
		 * Renames a select option called <code>sNameOld</code> to <code>sNameNew</code>. If a select option or a parameter
		 * with the name <code>sNameNew</code> already exists, an error is thrown. If a select option with the name <code>sNameOld</code>
		 * does not exist, nothing is changed.
		 * @param {string} sNameOld the current name of the select option property which shall be renamed
		 * @param {string} sNameNew the new name of the select option property
		 * @returns {object} this instance to allow method chaining.
		 * @public
		 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.SELOPT_WITHOUT_NAME</td><td>indicating that the name of a select option has not been specified</td></tr>
		 * <tr><td>SelectionVariant.SELOPT_WRONG_TYPE</td><td>indicating a select option has an invalid type</td></tr>
		 * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>indicating that another parameter with the same new name already exists</td></tr>
		 * <tr><td>SelectionVariant.SELOPT_COLLISION</td><td>indicating that another select option with the same new name already exists</td></tr>
		 * </table>
		 */	
		renameSelectOption : function(sNameOld, sNameNew) {
			if (typeof sNameOld !== "string" || typeof sNameNew !== "string") {
				throw new Error("SelectionVariant.SELOPT_WRONG_TYPE");
			}
			if (sNameOld === "" || sNameNew === "") {
				throw new Error("SelectionVariant.SELOPT_WITHOUT_NAME");
			}
			if (this._mSelectOptions[sNameOld] !== undefined) {
				if (this._mSelectOptions[sNameNew]) {
					throw new Error("SelectionVariant.SELOPT_COLLISION");
				}
				if (this._mParameters[sNameNew]) {
					throw new Error("SelectionVariant.PARAMETER_SELOPT_COLLISION");
				}
				this._mSelectOptions[sNameNew] = this._mSelectOptions[sNameOld];
				delete this._mSelectOptions[sNameOld];
			}
			return this;
		},
	
		/**
		 * returns the set of select options/ranges available for a given property name.
		 * @param {string} sPropertyName the name of the property for which the set of select options/ranges shall be returned.
		 * @returns {array} If <code>sPropertyName</code> is an invalid name of a property or no range exists, <code>undefined</code>
		 * is returned. Otherwise, an immutable array of ranges is returned. Each entry of the array is an object, having the 
		 * following properties:
		 * <ul>
		 * <li><code>Sign</code>: the sign of the range</li>
		 * <li><code>Option</code>: the option of the range</li>
		 * <li><code>Low</code>: the low value of the range. Note that it is not possible that the value <code>null</code> is being returned.</li>
		 * <li><code>High</code>: the high value of the range; in case that this value is not necessary, <code>null</code> (but does exist)</li>
		 * </ul>
		 * For further information on the meaning of the attributes, refer to method <code>addSelectOption</code>.
		 * @public
		 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>indicating an input parameter has an invalid type</td></tr>
		 * <tr><td>SelectionVariant.INVALID_PROPERTY_NAME</td><td>indicating that the property name is invalid, for example, it is not specified</td></tr>
		 * </table>
		 */
		getSelectOption : function(sPropertyName) {
			if (typeof sPropertyName !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			if (sPropertyName === "") {
				throw new Error("SelectionVariant.INVALID_PROPERTY_NAME");
			}
		
			var oEntries = this._mSelectOptions[sPropertyName];
			if (!oEntries) {
				return undefined;
			}
		
			return JSON.parse(JSON.stringify(oEntries)); // create an immutable clone of data to prevent obfuscation by caller.
		},
	
		/**
		 * returns the names of the properties available for this instance.
		 * @returns {array} the list of property names available for this instance.
		 * @public
		 */
		getSelectOptionsPropertyNames : function() {
			return Object.keys(this._mSelectOptions);
		},
	
		/**
		 * adds a set of Select Options to the list of Select Options for a given parameter.
		 * @param {string} sPropertyName the name of the property for which the set of select options shall be added.
		 * @param {array} aSelectOptions set of select options that shall be added.
		 * @return {object} this instance to allow method chaining.
		 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>indicating an input parameter has an invalid type</td></tr>
		 * </table>
		 * @public
		 */
		massAddSelectOption : function(sPropertyName, aSelectOptions){
			
			if (!jQuery.isArray(aSelectOptions)) {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
			
			for (var i = 0; i < aSelectOptions.length; i++){
				var oSelectOption = aSelectOptions[i];
				this.addSelectOption(sPropertyName, oSelectOption.Sign, oSelectOption.Option, oSelectOption.Low, oSelectOption.High);
			}
			
			return this;
		},
		
		/**
		 * First tries to retrieve the set of select options/ranges available for <code>sName</code> as property name. If successful, 
		 * this array of selections is being returned. If it fails, an attempt to find a parameter, whose name is <code>sName</code>, is
		 * being made. If the latter succeeds, the single value is being converted to fit in an array of selections to make it 
		 * type compatible with ranges. This array then is returned. <br />
		 * If neither a select option nor a parameter could be found, <code>undefined</code> is returned.
		 * @param {string} sName the name of the attribute for which the value shall be retrieved.
		 * @returns {array} the ranges in the select options for this specified property, or a range-converted representation of a parameter is returned.
		 * If both lookups fail, <code>undefined</code> is returned. <br />
		 * The returned ranges have the format:
		 * <ul>
		 * <li><code>Sign</code>: the sign of the range</li>
		 * <li><code>Option</code>: the option of the range</li>
		 * <li><code>Low</code>: the low value of the range. Note that it is not possible that the value <code>null</code> is being returned.</li>
		 * <li><code>High</code>: the high value of the range; in case that this value is not necessary, <code>null</code> (but does exist)</li>
		 * </ul>
		 * For further information on the meaning of the attributes, refer to method {@link #.addSelectOption addSelectOption}.
		 * @public
		 * @throws an instance of {@link sap.ui.generic.app.navigation.service.Error} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>indicating an input parameter has an invalid type</td></tr>
		 * <tr><td>SelectionVariant.INVALID_PROPERTY_NAME</td><td>indicating that the property name is invalid, for example, it is not specified</td></tr>
		 * </table>
		 */
		getValue : function(sName) {
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
						Sign : "I",
						Option : "EQ",
						Low : sParamValue,
						High : null
					}
				];
				return aValue;
			}
		
			return undefined;
		},
	
		
		/**
		 * returns <code>true</code> in case that this SelectionVariant does neither contain parameters
		 * nor ranges.
		 * @return {boolean} <code>true</code> in case that there are no parameters and no select options available in
		 * the selection variant; <code>false</code> otherwise.
		 * @public
		 */
		isEmpty : function() {
			return this.getParameterNames().length === 0 && this.getSelectOptionsPropertyNames().length === 0;
		},
	
		/**
		 * returns the external representation of the selection variant as JSON object
		 * @return {object} the external representation of this instance as a JSON object
		 * @public
		 */
		toJSONObject : function() {
			var oExternalSelectionVariant = {
				Version : { // Version attributes are not part of the official specification, 
					Major : "1", // but could be helpful later for implementing a proper lifecycle/interoperability
					Minor : "0",
					Patch : "0"
				},
				SelectionVariantID : this._sId
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
		
		/**
		 * serializes this instance into a JSON-formatted string
		 * @return {string} the JSON-formatted representation of this instance in stringified format
		 * @public
		 */
		toJSONString : function() {
			return JSON.stringify(this.toJSONObject());
		},
	
		_determineODataFilterExpression : function(oExternalSelectionVariant) {
			// TODO - specification does not indicate what is expected here in detail
			oExternalSelectionVariant.ODataFilterExpression = ""; // not supported yet - it's allowed to be optional
		},
	
		_serializeParameters : function(oExternalSelectionVariant) {
		
			if (this._mParameters.length === 0) {
				return;
			}
		
			// Note: Parameters section is optional (see specification section 2.4.2.1)
			oExternalSelectionVariant.Parameters = [];
		
			jQuery.each(this._mParameters, function(sParameterName, sParameterValue) {
				var oParObject = {
					PropertyName : sParameterName,
					PropertyValue : sParameterValue
				};
				oExternalSelectionVariant.Parameters.push(oParObject);
			});
		},
	
		_serializeSelectOptions : function(oExternalSelectionVariant) {
		
			if (this._mSelectOptions.length === 0) {
				return;
			}
		
			oExternalSelectionVariant.SelectOptions = [];
		
			jQuery.each(this._mSelectOptions, function(sPropertyName, aEntries) {
				var oSelectOption = {
					PropertyName : sPropertyName,
					Ranges : aEntries
				};
			
				oExternalSelectionVariant.SelectOptions.push(oSelectOption);
			});
		},

		_parseFromString : function(sJSONString) {
			if (sJSONString === undefined) {
				throw new Error("SelectionVariant.UNABLE_TO_PARSE_INPUT");
			}
		
			if (typeof sJSONString !== "string") {
				throw new Error("SelectionVariant.INVALID_INPUT_TYPE");
			}
		
			var oInput = JSON.parse(sJSONString);
			// the input needs to be an JSON string by specification
			
			this._parseFromObject(oInput);
		}, 
		
		_parseFromObject : function(oInput) {
		
			if (oInput.SelectionVariantID === undefined) {
				// Do not throw an error, but only write a warning into the log.
				// The SelectionVariantID is mandatory according to the specification document version 1.0, 
				// but this document is not a universally valid standard.
				// It is said that the "implementation of the SmartFilterBar" may supersede the specification.
				// Thus, also allow an initial SelectionVariantID.
	//		throw new sap.ui.generic.app.navigation.service.Error("SelectionVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID");
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
	
		_parseFromStringParameters : function(aParameters) {
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
					throw new Error("SelectionVariant.SELECT_OPTION_RANGES_NOT_ARRAY");
				}
			
				jQuery.each(oSelectOption.Ranges, jQuery.proxy(function(iIdx2, oRange) {
					this.addSelectOption(oSelectOption.PropertyName, oRange.Sign, oRange.Option, oRange.Low, oRange.High);
				}, this));
			}, this));
		}
	});

	return SelectionVariant;

});
