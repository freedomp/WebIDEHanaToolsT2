define(
		[
			"sap/watt/lib/lodash/lodash",
			"sap/watt/lib/orion/javascript/esprima/esprimaVisitor",
			"./W5gUtils",
			"./EventBusHelper",
			"sap/watt/lib/orion/ui/esprima/esprima",
			"sap/watt/lib/orion/ui/escodegen/escodegen.browser",
			"sap/watt/lib/handlebars/handlebars"
		],
		function (_, oVisitor, W5gUtils ,EventBusHelper) {
			"use strict";

// Private variables and methods
// Begin
			//TODO visitor methods taken from sap\watt\saptoolsets\fiori\project\plugin\fioriexttemplate\extendcontrollercomponent\ExtendControllerComponent.js
			//should check with component owner if can be moved to global util
			var
					/**
					 * visitor esprima - visit 1st level of controllers methods and execute collector
					 * on the context
					 *
					 * assume fiori standard of controller creation - using 'extend'
					 *
					 * @param {object} oNode esprima node
					 * @param {object} oContext esprima context
					 *
					 * @private
					 */
					_ControllerMethodsVisitor = function (oNode, oContext) {
						if (oNode.type === esprima.Syntax.CallExpression && oNode.callee && oNode.callee.property &&
								oNode.callee.property.type === esprima.Syntax.Identifier && (oNode.callee.property.name === "extend" || oNode.callee.property.name === "controller")) {
							// This is an <code>".extend()"</code> or <code>".controller()"</code> call - iterate over the methods defined in it
							var aMethods = oNode.arguments[1].properties;
							oContext.aItems = oContext.collect(aMethods , oContext);
							return false;

						}
						return true;
					},

					/**
					 * visitor esprima - injects method ast on the 1st level of controller
					 * assume fiori standard of controller creation - using 'extend'
					 *
					 * @param {object} oNode esprima node
					 * @param {object} oContext esprima context
					 *
					 * @private
					 */
					_injectControllerMethodVisitor = function (oNode, oContext) {
						if (oNode.type === esprima.Syntax.CallExpression && oNode.callee && oNode.callee.property &&
								oNode.callee.property.type === esprima.Syntax.Identifier && (oNode.callee.property.name === "extend" || oNode.callee.property.name === "controller")) {
							// This is an <code>".extend()"</code> or <code>".controller()"</code> call - iterate over the methods defined in it
							oNode.arguments[1].properties.push(oContext.methodAst);
							return false;

						}
						return true;
					},

					/**
					 * collect method signature and params from esprima node object
					 *
					 * @param {array<object>} aMethods collection of esprima nodes represent js function
					 *
					 * @private
					 */
					_methodSignaturesCollector = function(aMethods) {
						var aResult = [];
						for (var i = 0; i < aMethods.length; i++) {
							// Only copy method signatures
							if (aMethods[i].value.type !== esprima.Syntax.FunctionExpression) {
								continue;
							}

							var oMethod = aMethods[i];
							// The lifecycle methods are defined in the template, no need to copy them over
							if (oMethod.key && oMethod.key.name) {

								var signature = oMethod.key.name;
								var aParams = [];
								if (oMethod.value && oMethod.value.params && oMethod.value.params.length > 0) {
									aParams = _.map(oMethod.value.params, "name");
								}
								aResult.push({
									signature : signature,
									params : aParams
								});
							}
						}
						return aResult;
					},

					/**
					 * collect range of specific method
					 *
					 * @param {Array<object>} aMethods collection of esprima nodes represent js function
					 *
					 * @private
					 */
					_methodRangeCollector = function(aMethods , oConetxt) {
						var aResult = [];
						for (var i = 0; i < aMethods.length; i++) {
							// Only copy method signatures
							if (aMethods[i].value.type !== esprima.Syntax.FunctionExpression) {
								continue;
							}

							var oMethod = aMethods[i];
							// The lifecycle methods are defined in the template, no need to copy them over
							if (oMethod.key && oMethod.key.name) {
								if(oMethod.key.name === oConetxt.functionName) {
									aResult.push(oMethod.range);
								}
							}
						}
						return aResult;
					},

					/**
					 * Handlebars template function
					 * The function template here is assigned to <code>var d</code> in order to allow escodegen to compile it
					 * once it complied the function node is fetched from the ast
					 *
					 * @param {object} for: {funcName : <func name value>}
					 * @return {string}
					 * @function
					 */
					_methodTemplate = Handlebars.compile("var d = { " +
							"/**\n" +
							"	*@memberOf {{controllerName}}\n" +
							"	*/\n" +
							"	{{funcName}}: function(){\n " +
							"		//This code was generated by the layout editor.\n" +
							"}" +
							"}"),

					/**
					 * document service object
					 *
					 * @type {object}
					 * @private
					 */
					_oDocumentService = null,

					/**
					 * content service object
					 *
					 * @type {object}
					 * @private
					 */
					_oContentService = null;

// End
// Private variables and methods

			/**
			 * WYSIWYG event utilities.
			 */
			var EventsUtils = {

				/**
				 * Initializes EventsUtils
				 *
				 * @param {object} oContext context.service object
				 *
				 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils.init
				 * @function
				 * @public
				 */
				init: _.once(function (oContext) {
					jQuery.sap.assert(oContext, "oContext must be a valid service context");
					_oDocumentService = _.get(oContext.service, "document");
					_oContentService = _.get(oContext.service, "content");
					jQuery.sap.assert(_oDocumentService, "document service does not exists in the given context");
					jQuery.sap.assert(_oContentService, "content service does not exists in the given context");
				}),

				/**
				 * returns the methods signatures of controller object
				 *
				 * @param {string} sControllerContent js controller content
				 *
				 * @return {Array} array signatures
				 *
				 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.EventsUtils.fetchMethodsFromController
				 * @function
				 * @public
				 */
				fetchMethodsFromController: function(sControllerContent){
					var oAst, oVisitContext;

					oAst = oVisitor.parse(sControllerContent, {comment : true});
					oVisitContext = {collect : _methodSignaturesCollector};
					oVisitor.visit(oAst, oVisitContext, _ControllerMethodsVisitor);
					return oVisitContext.aItems || [];
				},

				/**
				 * returns the method range from controller object
				 *
				 * @param {string} sControllerContent js controller content
				 * @param {string} sFunctionName name of function
				 *
				 * @return {Array<number>} array with two numbers represented the start and end indexes
				 *
				 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.EventsUtils.fetchMethodRangeFromController
				 * @function
				 * @public
				 */
				fetchMethodRangeFromController: function(sControllerContent , sFunctionName){
					var oAst, oVisitContext;

					oAst = oVisitor.parse(sControllerContent, {comment : true});
					oVisitContext = {collect : _methodRangeCollector , functionName : sFunctionName};
					oVisitor.visit(oAst, oVisitContext, _ControllerMethodsVisitor);
					return _.get(oVisitContext, "aItems[0]");
				},

				/**
				 * Injects event structure to controller code
				 *
				 * @param {string} sControllerContent controller content
				 * @param {string} sFunctionSignature function name of the event signature
				 * @returns {object.<string,object>} map that contains the controller content updated with the new event and the range which the controller was added
				 */
				injectEventToController: function(sControllerContent , sFunctionSignature, sControllerName){
					var oAst, oVisitContext;

					oAst = oVisitor.parse(sControllerContent, {range: true, tokens: true, comment: true});
					oAst = escodegen.attachComments(oAst, oAst.comments, oAst.tokens);
					if(oAst.errors.length){
						//generation will fail - abort with notification
						EventBusHelper.publish(EventBusHelper.IDENTIFIERS.NOTIFICATION_BAR_ADD_MESSAGE , {sLine1 : W5gUtils.getText("events_cannot_parse_controller")});
						return;
					}

					var oMethodAst = esprima.parse(_methodTemplate({funcName : sFunctionSignature , controllerName: sControllerName}), {range: true, tokens: true, comment: true});
					oMethodAst = escodegen.attachComments(oMethodAst, oMethodAst.comments, oMethodAst.tokens);
					//here we take only the function node from the parsed AST - see template JSDoc
					oVisitContext = {methodAst: oMethodAst.body[0].declarations[0].init.properties[0]};
					oVisitor.visit(oAst, oVisitContext, _injectControllerMethodVisitor);

					return escodegen.generate(oAst, {
						comment: true,
						format: {
							quotes : "double",
							indent: {
								style : "\t"
							}
						}
					});
				},

				/**
				 * Show new function dialog
				 * @param aExistingFunctions {array} exisitng controller functions
				 *
				 * @returns {Q} Promise
				 */
				showNewFunctionDialog : function(aExistingFunctions) {

					var
							oModel = new sap.ui.model.json.JSONModel({
								value: null
							}),
							bResult = false,
							oDeferred = Q.defer(),
							oCancelBtn = new sap.ui.commons.Button({
								text: W5gUtils.getText("events_dialog_cancel_button"),
								press: close.bind(null, false)
							}),
							oOkButtom =new sap.ui.commons.Button({
								text: W5gUtils.getText("events_dialog_ok_button"),
								press: close.bind(null, true),
								enabled: false
							}),
							aButtons = [oOkButtom,oCancelBtn],
							oText = new sap.ui.commons.TextField({
								width:"100%",
								value:"{value}",
								placeholder: W5gUtils.getText('events_add_function_placeholder'),
								liveChange: validateFunctionName
							}),
							oMessageLabel = new sap.ui.commons.Label({text:W5gUtils.getText('events_add_function_message')}),
							oFieldLabel = new sap.ui.commons.Label({text:W5gUtils.getText('events_dialog_func_name_label') , labelFor: oText}),
							oLayout = new sap.ui.layout.VerticalLayout({
								content: [oMessageLabel , oFieldLabel , oText]
							}),
							oDialog = new sap.ui.commons.Dialog({
								applyContentPadding: false,
								title: W5gUtils.getText("events_new_function_dialog_title"),
								resizable: false,
								modal: true,
								content: oLayout,
								buttons: aButtons,
								defaultButton: oCancelBtn,
								closed: onClose
							}).bindElement("/").setModel(oModel).addStyleClass('wysiwygNewFunctionDialog');

					oDialog.open();

					function addErrorTooltip(sMessage , oControl) {
						var oRichTooltip = new sap.ui.commons.RichTooltip({
							text: sMessage
						}).addStyleClass("wysiwygErrorTooltip");
						oControl.setTooltip(oRichTooltip);
					}

					function validateFunctionName(oEvent) {
						var sValue = oEvent.getParameter('liveValue');
						//validate legal JS function name
						var bIsValid = true;
						var sValidationErrorMessage = "";

						if(!/^[$A-Z_][0-9A-Z_$]*$/i.test(sValue)){
							bIsValid = false;
							sValidationErrorMessage = W5gUtils.getText('events_js_function_name_error');
						} else if(aExistingFunctions && aExistingFunctions.indexOf(sValue) !== -1) {
							bIsValid = false;
							sValidationErrorMessage = W5gUtils.getText('events_js_function_exists_error');
						}

						if(!bIsValid) {
							oText.setValueState(sap.ui.core.ValueState.Error);
							oOkButtom.setEnabled(false);
							addErrorTooltip(sValidationErrorMessage , oText);
						} else {
							oText.setValueState(sap.ui.core.ValueState.None);
							oText.setTooltip("");
							oOkButtom.setEnabled(true);
						}
					}

					function close(bValue) {
						bResult = bValue;
						oDialog.close();
					}

					function onClose() {
						oDialog.detachClosed(onClose);
						oDialog.destroy();

						oDeferred.resolve({
							accepted: bResult,
							value: _.trim(oModel.getProperty("/value"))
						});
					}

					return oDeferred.promise;
				},

				/**
				 * Navigate to controller document and select the function range if function name is given
				 * @param {object} oControllerDocument controller document
				 * @param {string} sFunctionName function name
				 *
				 * @function
				 * @public
				 * @returns {Q} Promise
				 */
				navigateToControllerAndSelectFunction : function(oControllerDocument , sFunctionName) {
					var that = this;
					return oControllerDocument.getContent().then(function(sControllerContent){
						var oRange;
						if(sFunctionName) {
							oRange = that.fetchMethodRangeFromController(sControllerContent , sFunctionName);
						}
						var oContext = {service : {document: _oDocumentService , content: _oContentService}};
						return W5gUtils.goToCode(oContext , oControllerDocument , oRange);
					});
				}

			};

			return EventsUtils;
		}
);
