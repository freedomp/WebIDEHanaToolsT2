/*
 * RequireJS module with API:
 * <ul>
 * <li>AdtDiscoveryFactory.getDiscovery
 * <li>public methods of AdtDiscovery, AdtDiscoveryCollectionMember
 * </ul>
 */
define( //Define this module as requireJS module and its dependencies to other requireJS modules
	[    "../lib/uritemplate-min", //$NON-NLS-1$
		"sap.watt.saptoolsets.fiori.abap.adt.communication/util/AdtCheckUtil"  // AdtCheckUtil shall not be public, //$NON-NLS-1$
	],

	function (UriTemplateLib, AdtCheckUtil) {

		if (typeof UriTemplateLib === "undefined" && typeof module !== "undefined" && typeof module.exports !== "undefined") {
			// Global variable 'module' is defined in the Web IDE test scenario (actually it should be only defined in a server-side js-scenario). 
			// Uritemplate-lib interprets 'module' in a special way, so that the require.js-dependencies do not get defined, but 'module.exports' gets defined.
			UriTemplateLib = module.exports;
		}

		/**
		 * Factory for creation of AdtUriTemplates.
		 * @constructor
		 */
		function AdtUriTemplateFactory() {

			/**
			 * The method creates an AdtUriTemplate for the given <code>uriTemplateString</code>.
			 * @param uriTemplateString	The URI template string.
			 * @returns {AdtUriTemplate} The AdtUriTemplate.
			 */
			this.createUriTemplate = function (uriTemplateString) {

				// Remark:
				// Actually the RFC6570 allows empty URI templates, but does not distinguish between undefined, null, "".
				// The library uritemplate.js allows "", but throws TypeError for undefined and null.
				// We avoid all dependencies to library-specific behavior by providing the standard ADT-behavior of precondition checks for parameters:
				// undefined, null, "" result in an CheckError.
				AdtCheckUtil.checkStringArgumentIsNotEmpty("AdtUriTemplateFactory.createUriTemplate", "uriTemplateString", uriTemplateString); //$NON-NLS-1$ //$NON-NLS-2$

				return new AdtUriTemplate(uriTemplateString);
			};

			/**
			 * This error is thrown when parsing an URI template string fails. It is an object { message, stack }
			 * with details concerning the parse error.
			 * @param message	The error message.
			 * @constructor
			 */
			this.AdtExpressionParseError = function (message) {
				this.message = message;
				this.stack = (new Error(message)).stack;
			};

			this.AdtExpressionParseError.prototype = new Error(); // not supported by all Browser versions: Object.create(Error.prototype);
			this.AdtExpressionParseError.prototype.constructor = this.AdtExpressionParseError;
			this.AdtExpressionParseError.prototype.name = "AdtExpressionParseError";

			/**
			 * This error is thrown when exanding an URI template fails due to variable expand failures.  
			 * It is an object { message, stack } with details concerning the parse error.
			 * @param message	The error message.
			 * @constructor
			 */
			this.AdtVariableExpandError = function (message) {
				this.message = message;
				this.stack = (new Error(message)).stack;
			};

			this.AdtVariableExpandError.prototype = new Error(); // not supported by all Browser versions: Object.create(Error.prototype);
			this.AdtVariableExpandError.prototype.constructor = this.AdtVariableExpandError;
			this.AdtVariableExpandError.prototype.name = "AdtVariableExpandError";
		}

		var uriTemplateFactory = new AdtUriTemplateFactory();

		/**
		 * ADT URI template as defined by RFC 6570 (see http://tools.ietf.org/html/rfc6570):
		 * "A URI Template is a compact sequence of characters for describing a range of Uniform Resource Identifiers
		 * through variable expansion. ..."
		 * <p>
		 * Simple example:<br>
		 *        URI template string: "/{var}"<br>
		 *        Variable value: var = "value"<br>
		 *        Expanded URI template string: "/value"<br>
		 * An ADT URI template is created based on an URI template string.
		 * This URI template string can be retrieved again by method <code>getTemplate</code>.
		 * Values for variables in the URI template string can be assigned by method <code>set</code>.
		 * Finally the URI template can be expanded by method <code>expand</code>.
		 */
		function AdtUriTemplate(uriTemplateString) {

			var that = this;

			var uriTemplate = undefined;
			var variableMap = {};

			/**
			 * The method returns <code>true</code> if the URI template contains a variable with the given
			 * <code>variableName</code>, else it returns <code>false</code>.
			 *
			 * In case of an error from parsing the template string an exception is thrown:
			 * one error object { message, stack } with detail information concerning the error.
			 * 
			 * @param {string} variableName  - The name of the variable.
			 * @return {boolean} Returns <code>true</code> in case the URI template contains the variable, else it returns <code>false</code>.
			 */
			this.containsVariable = function (variableName) {

				AdtCheckUtil.checkStringArgumentIsNotEmpty("AdtUriTemplate.containsVariable", "variableName", variableName);

				try {
					uriTemplate = uriTemplate || UriTemplateLib.parse(uriTemplateString);
				} catch (error) {
					throw new uriTemplateFactory.AdtExpressionParseError(error.toString());
				}

				if (typeof uriTemplate.expressions === "object" && uriTemplate.expressions !== null) {
					for (var key in uriTemplate.expressions) {
						var expression = uriTemplate.expressions[key];
						if (expression && expression !== null && typeof expression.varspecs === "object") {
							for (var key1 in expression.varspecs) {
								var varspec = expression.varspecs[key1];
								if (varspec !== null && typeof varspec.varname === "string" //
									&& varspec.varname === variableName) {
									return true;
								}
							}
						}
					}
				}
				return false;
			};

			/**
			 * The method sets the value for the given variable. This variable value is used by the expand-process
			 * for the URI template. See method <code>expand</code>.
			 * <p>
			 * The method returns the URI template, so that chained statements are possible, e.g.:
			 * uriTemplate.set("var1", "value 1").set("var2", "value_2");
			 * </p>
			 * <p>
			 * Remarks:<br>
			 * The format of the variable names and values (including rules for the encoding) is defined in RFC6570
			 * (see http://tools.ietf.org/html/rfc6570).<br>
			 * Some examples for variable values in JavaScript:
			 * <ul>
			 *     <li>simple value: string, e.g. "value", </li>
			 *     <li>list value: array of values, e.g. ["red", "green", "blue"]</li>
			 *     <li>keys value: associative array (JavaScript object), e.g. { "semi": ";", "dot": ".", "comma": ","}</li>
			 * </ul>
			 * </p>
			 *
			 * @param variableName - The name of the variable.
			 * @param value - The variable value.
			 * @return {object} The URI template.
			 */
			this.set = function (variableName, value) {

				AdtCheckUtil.checkStringArgumentIsNotEmpty("AdtUriTemplate.set", "variableName", variableName);

				variableMap[variableName] = value;
				return that;
			};

			/**
			 * The method expands the URI template using the set variable values (see method <code>set</code>). The
			 * expand process is defined in RFC6570 (see http://tools.ietf.org/html/rfc6570).
			 * <p>
			 * Example:<br>
			 * URI template string:<br>
			 *        "/sap/bc/adt/docu/abap/langu{?format,language,uri}"<br>
			 * with simple variable values:<br>
			 *        format = "eclipse",<br>
			 *        language= "EN",<br>
			 *        uri="/sap/bc/adt/oo/classes/cl_ris_adt_res_app/source/main#start=51,8",<br>
			 * The expanded URI template string:<br>
			 *        "/sap/bc/adt/docu/abap/langu?format=eclipse&language=EN&uri=%2Fsap%2Fbc%2Fadt%2Foo%2Fclasses%2Fcl_ris_adt_res_app%2Fsource%2Fmain%23start%3D51%2C8"
			 *
			 * In case of an error from parsing the template string or from variable expansion an exception is thrown:
			 * one error object { message, stack } with detail information concerning the error.
			 * 
			 * @return {string} The expanded URI template string.
			 */
			this.expand = function () {

				try {
					uriTemplate = uriTemplate || UriTemplateLib.parse(uriTemplateString);
				} catch (error) {
					throw new uriTemplateFactory.AdtExpressionParseError(error.toString());
				}

				try {
					return uriTemplate.expand(variableMap);
				} catch (error) {
					throw new uriTemplateFactory.AdtVariableExpandError(error.toString());
				}
			};

			/**
			 * The method returns the URI template string.
			 *
			 * @return {string} The URI template string.
			 */
			this.getTemplate = function () {
				return uriTemplateString; // === uriTemplate.templateText === uriTemplate.toString()
			};

		}

		return uriTemplateFactory;
	});
