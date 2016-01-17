define(
	[
		"sap/watt/lib/lodash/lodash",
		"../../utils/W5gUtils",
		"../../utils/DocuUtils",
		"../../utils/EventsUtils",
		"../../utils/EventBusHelper",
		"./EventsDropdownBox"
	],
	function (_, W5gUtils, DocuUtils , EventsUtils , EventBusHelper, EventsDropdownBox) {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.events.EventHandlersEditor");
		jQuery.sap.require("sap.ui.model.type.String");

// Private variables and methods
// Begin

		/**
		 * Creates the control for value editing.
		 *
		 * @param {string} sId id of owner editor
		 * @param {string} sName parameters used for control creation
		 * <ul>
		 * <li>'name' of type <code>string</code>
		 * 			event name
		 * </li>
		 * <li>'methods' of type <code>Array(object)</code>
		 * 			list of available methods
		 * </li>
		 * </ul>
		 *
		 * @returns {sap.ui.commons.ComboBox} Returns the created control
		 *
		 * @name _createField
		 * @function
		 * @private
		 */
		function _createField(sId, sName) {
			var that = this;
			sId += "--" + sName;

			return new EventsDropdownBox(sId, {
				value: "{value}",
				maxPopupItems: 5,
				placeholder: "{placeholder}",
				searchHelpEnabled:true,
				searchHelpText:"{i18n>events_new_function_label}",
				searchHelp: function(){
					_addNewFunction.call(that , _.map(this.getItems() , function(oItem){
						return oItem.getText();
					})).done();
				},
				width: "100%",
				items: {
					path: "/methods",
					template: new sap.ui.core.ListItem({
						text: "{signature}"
					})
				}
			});

		}

		/**
		 * publish new function event
		 * @param aExistingFunctions {array} exisitng controller functions
		 * @name _createField
		 * @function
		 * @private
		 */
		function _addNewFunction(aExistingFunctions) {
			var that = this;
			return EventsUtils.showNewFunctionDialog(aExistingFunctions).then(function(oResult){
				if(oResult.accepted){
					EventBusHelper.publish(EventBusHelper.IDENTIFIERS.EVENTS_NEW_FUNC_ADDED, {
						funcName: oResult.value,
						path: that.getBindingContext().getPath() + '/value'
					});
				}
			});
		}

// End
// Private variables and methods

		/**
		 * Constructor for a new EventHandlersEditor.
		 *
		 * @param {string=} sId id for the new control, generated automatically if no id is given
		 * @param {object=} mSettings initial settings for the new control
		 *
		 * @class
		 * WYSIWYG property editor control
		 * @extends sap.ui.core.Control
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.events.EventHandlersEditor
		 */
		var EventHandlersEditor = sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.events.EventHandlersEditor",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.events.EventHandlersEditor.prototype */ {
				metadata: {
					aggregations: {
						/**
						 * Hidden, for internal use only.
						 */
						"label": { "type": "sap.ui.commons.Label", "multiple": false, "visibility": "hidden" },

						/**
						 * Hidden, for internal use only.
						 */
						"deprecated": { "type": "sap.ui.commons.Label", "multiple": false, "visibility": "hidden" },

						/**
						 * Hidden, for internal use only.
						 */
						"field": { "type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden" },

						/**
						 * Hidden, for internal use only.
						 */
						"button": { "type": "sap.ui.commons.Button", "multiple": false, "visibility": "hidden" }
					}
				},

				constructor: function (sId, sName) {

					sap.ui.core.Control.apply(this, [sId]);

					var oField = _createField.call(this ,sId, sName);

					this.setAggregation("field", oField);
					this.setAggregation("label", new sap.ui.commons.Label({
						text: "{title}",
						tooltip: DocuUtils.createDocuTooltip({} , 'events'),
						labelFor: oField.getId()
					}));
					this.setAggregation("deprecated", new sap.ui.commons.Label({
						text: "{i18n>properties_control_deprecated_label}",
						visible: "{isDeprecated}",
						labelFor: oField.getId()
					}).addStyleClass("sapPropertiesEditorLabelAdditionalText"));

					this.setAggregation("button", new sap.ui.commons.Button({
						tooltip: "{i18n>events_button_nav_to_controller_tooltip}",
						press: function(){
							EventBusHelper.publish(EventBusHelper.IDENTIFIERS.EVENTS_NAVIGATE_TO_CONTROLLER,{funcName: oField.getValue()});
						},
						icon: "sap-icon://watt/gotocode"
					}));
				},

				/**
				 * Renders the HTML for the given control <code>oControl</code>, using the provided render manager <code>oRm</code>
				 *
				 * @param {sap.ui.core.RenderManager} oRm
				 *          The render manager that can be used for writing to the render output buffer.
				 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.events.EventHandlersEditor} oControl
				 *          An object representation of the control that should be rendered.
				 */
				renderer: function (oRm, oControl) {

					oRm.write("<div");
					oRm.writeControlData(oControl);
					oRm.addClass("sapWysiwygPropertyEditor");
					oRm.writeClasses();
					oRm.write(">");

					oRm.write("<div");
					oRm.addClass("sapWysiwygPropertyEditorLabelRow");
					oRm.writeClasses();
					oRm.write(">");
					oRm.write("<div");
					oRm.addClass("sapWysiwygPropertyEditorLabelWrapper");
					oRm.writeClasses();
					oRm.write(">");
					oRm.renderControl(oControl.getAggregation("label"));
					oRm.write("</div>");
					oRm.write("<div");
					oRm.addClass("sapWysiwygPropertyEditorDeprecatedLabelWrapper");
					oRm.writeClasses();
					oRm.write(">");
					oRm.renderControl(oControl.getAggregation("deprecated"));
					oRm.write("</div>");
					oRm.write("</div>");

					oRm.write("<div");
					oRm.addClass("sapWysiwygPropertyEditorFieldRow");
					oRm.addClass("sapWysiwygPropertyEditorFieldRowPadding");
					oRm.writeClasses();
					oRm.write(">");
					oRm.renderControl(oControl.getAggregation("field"));
					oRm.renderControl(oControl.getAggregation("button"));
					oRm.write("</div>");
					oRm.write("</div>");
				}
			});

		/**
		 * Adjust event label size
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.events.EventHandlersEditor#onAfterRendering
		 * @function
		 * @public
		 */
		EventHandlersEditor.prototype.onAfterRendering = function () {
			var oDeprecated = this.getAggregation("deprecated", null),
				iDeprecatedWidth, $ref;
			if (oDeprecated) {
				$ref = oDeprecated.$();
				$ref.css("position", "absolute");
				iDeprecatedWidth = $ref.innerWidth();
				$ref.css("position", "");
				this.$().find(".sapWysiwygPropertyEditorLabelWrapper").css("right", iDeprecatedWidth + "px");
			}
		};

		/**
		 * Cleans up the element instance before destruction.
		 *
		 * @override sap.ui.core.Element.prototype.exit
		 */
		EventHandlersEditor.prototype.exit = W5gUtils.destroyPrivateAggregations;

		/**
		 * Returns the DOM Element that should get the focus.
		 *
		 * @override sap.ui.core.Element.prototype.getFocusDomRef
		 */
		EventHandlersEditor.prototype.getFocusDomRef = function () {
			return this.getAggregation("field").getFocusDomRef();
		};

		return EventHandlersEditor;
	}
);
