//TODO contribute back to UI5 OPA
/*!
 * @copyright@
 */

sap.ui.define(['./Matcher'], function (fnMatcher) {

	/**
	 * @class PropertyContains - checks if a property has the exact same value
	 * @extends sap.ui.test.matchers.Matcher
	 * @param {string} [name] the name of the property
	 * @param {any} [value] the value of the property
	 * @public
	 * @name sap.ui.test.matchers.PropertyContains
	 * @author SAP SE
	 * @since 1.23
	 */
	return fnMatcher.extend("sap.ui.test.matchers.PropertyContains", {

		metadata : {
			publicMethods : [ "isMatching" ],
			properties : {
				name : {
					type : "string"
				},
				value : {
					type : "any"
				}
			}
		},

		/**
		 * Getter for property <code>name</code>.
		 * 
		 * The Name of the property that is used for matching.
		 *
		 * @return {string} the value of property <code>name</code>
		 * @public
		 * @name sap.ui.test.matchers.PropertyContains#getName
		 * @function
		 */

		/**
		 * Setter for property <code>name</code>.
		 * 
		 * @param {string} sValue the value for the property <code>name</code>
		 * @return {sap.ui.test.matchers.PropertyContains} <code>this</code> to allow method chaining
		 * @public
		 * @name sap.ui.test.matchers.PropertyContains#setName
		 * @function
		 */

		/**
		 * Getter for property <code>value</code>.
		 * 
		 * The value of the property that is used for matching.
		 *
		 * @return {string} the value of property <code>value</code>
		 * @public
		 * @name sap.ui.test.matchers.PropertyContains#getValue
		 * @function
		 */

		/**
		 * Setter for property <code>value</code>.
		 * 
		 * @param {string} sValue the value for the property <code>value</code>
		 * @return {sap.ui.test.matchers.PropertyContains} <code>this</code> to allow method chaining
		 * @public
		 * @name sap.ui.test.matchers.PropertyContains#setValue
		 * @function
		 *

		/**
		 * Checks if the control has a property that matches the value
		 * 
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the property has a strictly matching value.
		 * @public
		 * @name sap.ui.test.matchers.PropertyContains#isMatching
		 * @function
		 */
		isMatching : function (oControl) {
		    if(!oControl){
		        return false;
		    }
			var sPropertyName = this.getName(),
				fnProperty = oControl["get" + jQuery.sap.charToUpperCase(sPropertyName, 0)];

			if (!fnProperty) {
				jQuery.sap.log.error("Control " + oControl.sId + " does not have a property called: " + sPropertyName);
				return false;
			}

			return fnProperty.call(oControl).indexOf(this.getValue()) !== -1;

		}
	});

}, /* bExport= */ true);