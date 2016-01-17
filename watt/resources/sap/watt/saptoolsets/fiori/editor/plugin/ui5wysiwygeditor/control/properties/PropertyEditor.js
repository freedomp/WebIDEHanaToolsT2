define(
	[
		"sap/watt/lib/lodash/lodash",
		"../../utils/W5gUtils",
		"../../utils/DocuUtils",
		"../../utils/W5gBindingHelper",
		"../../utils/BindingUtils"
	],
	function (_, W5gUtils, DocuUtils, W5gBindingHelper, BindingUtils) {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertyEditor");
		jQuery.sap.require("sap.ui.model.type.Boolean");
		jQuery.sap.require("sap.ui.model.type.Integer");
		jQuery.sap.require("sap.ui.model.type.Float");
		jQuery.sap.require("sap.ui.model.type.String");

// Private variables and methods
// Begin
		/**
		 * Constructor for a Boolean2StringType type.
		 *
		 * @param {object=} oFormatOptions options as provided by concrete subclasses
		 * @param {object=} oConstraints constraints as supported by concrete subclasses
		 *
		 * @class
		 * Bridge type between Boolean & String
		 * @extends sap.ui.model.type.Boolean
		 *
		 * @constructor
		 * @private
		 * @alias sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.Boolean2StringType
		 */
		sap.ui.model.type.Boolean.extend("sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.Boolean2StringType",
			/** @lends sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.Boolean2StringType.prototype */ {
			formatValue: function (oValue) {
				if (oValue === undefined || oValue === null) {
					return oValue;
				}
				return oValue.toString();
			},
			parseValue: function (oValue) {
				if (oValue === undefined || oValue === null) {
					return oValue;
				}
				oValue = oValue + "";

				if (oValue.toLowerCase() === "true") {
					return true;
				}
				if (oValue.toLowerCase() === "false") {
					return false;
				}
				if (W5gUtils.isBindingValue(oValue)) {
					return null;
				}

				throw new sap.ui.model.ParseException(W5gUtils.getText("properties_parse_error_detail_boolean", [oValue]));
			}
		});

		/**
		 * Constructor for a Integer2StringType type.
		 *
		 * @param {object=} oFormatOptions options as provided by concrete subclasses
		 * @param {object=} oConstraints constraints as supported by concrete subclasses
		 *
		 * @class
		 * Bridge type between Integer & String
		 * @extends sap.ui.model.type.Integer
		 *
		 * @constructor
		 * @private
		 * @alias sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.Integer2StringType
		 */
		sap.ui.model.type.Integer.extend("sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.Integer2StringType",
			/** @lends sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.Integer2StringType.prototype */ {
			formatValue: function (oValue) {
				if (oValue === undefined || oValue === null || oValue === "") {
					return oValue;
				}
				if (W5gUtils.isBindingValue(oValue)) {
					return oValue;
				}

				var iResult = this.oOutputFormat.parse(oValue + "");
				if (isNaN(iResult)) {
					// do not format wrong value
					return oValue;
				}

				return sap.ui.model.type.Integer.prototype.formatValue.apply(this, arguments);
			},
			parseValue: function (oValue) {
				if (oValue === undefined || oValue === null) {
					return oValue;
				}
				if (W5gUtils.isBindingValue(oValue)) {
					return null;
				}
				if (oValue === "") {
					throw new sap.ui.model.ParseException(W5gUtils.getText("properties_parse_error_detail_empty_string"));
				}

				return sap.ui.model.type.Integer.prototype.parseValue.apply(this, arguments);
			}
		});

		/**
		 * Constructor for a Float2StringType type.
		 *
		 * @param {object=} oFormatOptions options as provided by concrete subclasses
		 * @param {object=} oConstraints constraints as supported by concrete subclasses
		 *
		 * @class
		 * Bridge type between Float & String
		 * @extends sap.ui.model.type.Float
		 *
		 * @constructor
		 * @private
		 * @alias sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.Float2StringType
		 */
		sap.ui.model.type.Float.extend("sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.Float2StringType",
			/** @lends sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.Float2StringType.prototype */ {
			formatValue: function (oValue) {
				if (oValue === undefined || oValue === null || oValue === "") {
					return oValue;
				}
				if (W5gUtils.isBindingValue(oValue)) {
					return oValue;
				}

				var iResult = this.oOutputFormat.parse(oValue + "");
				if (isNaN(iResult)) {
					// do not format wrong value
					return oValue;
				}

				return sap.ui.model.type.Float.prototype.formatValue.apply(this, arguments);
			},
			parseValue: function (oValue) {
				if (oValue === undefined || oValue === null) {
					return oValue;
				}
				if (W5gUtils.isBindingValue(oValue)) {
					return null;
				}
				if (oValue === "") {
					throw new sap.ui.model.ParseException(W5gUtils.getText("properties_parse_error_detail_empty_string"));
				}

				return sap.ui.model.type.Float.prototype.parseValue.apply(this, arguments);
			}
		});

		/**
		 * Constructor for a String2StringType type.
		 *
		 * @param {object=} oFormatOptions options as provided by concrete subclasses
		 * @param {object=} oConstraints constraints as supported by concrete subclasses
		 *
		 * @class
		 * Bridge type between String & String
		 * @extends sap.ui.model.type.String
		 *
		 * @constructor
		 * @private
		 * @alias sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.String2StringType
		 */
		sap.ui.model.type.String.extend("sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.String2StringType",
			/** @lends sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.String2StringType.prototype */ {
			constructor: function (sName, mEnumValues) {
				String.apply(this);

				this.sName = sName;
				this.mEnumValues = mEnumValues || {};

			},
			formatValue: function (oValue) {
				return oValue;
			},
			parseValue: function (oValue) {
				if (oValue === undefined || oValue === null) {
					return oValue;
				}
				if (W5gUtils.isBindingValue(oValue)) {
					return null;
				}
				if (this.mEnumValues[oValue]) {
					return oValue;
				}
				throw new sap.ui.model.ParseException(W5gUtils.getText("properties_parse_error_detail_enum", [oValue]));
			}
		});

		/**
		 * Binding types used with the control property editor to handle parsing and formatting
		 *
		 * @type {object<string, sap.ui.model.SimpleType>}
		 * @private
		 */
		var _mTypes = {
			boolean: sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.Boolean2StringType,
			int: sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.Integer2StringType,
			float: sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.Float2StringType,
			string: sap.ui.model.type.String
		};

		/**
		 * Returns data type for property binding
		 *
		 * @param {object} oProperty property metadata
		 * @return {sap.ui.model.type.SimpleType} data type
		 *
		 * @name _getDataType
		 * @function
		 * @private
		 */
		function _getDataType(oProperty) {
			var oTypeInstance;
			if (oProperty.type === "enum") {
				oTypeInstance = new sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.String2StringType(oProperty.typeName, oProperty.typeObject);
			} else if (oProperty.typeName === "idType") {
				oTypeInstance = oProperty.bindingType;
			} else {
				var oType = _mTypes[oProperty.type];
				if (oType) {
					oTypeInstance = new oType();
				}
			}
			if (oTypeInstance && oProperty.validator) {
				var fnOrigParse = oTypeInstance.parseValue;
				oTypeInstance.parseValue = function() {
					var retVal = fnOrigParse.apply(this, arguments);
					try {
						oProperty.validator.apply(null, arguments);
					} catch (oError) {
						throw new sap.ui.model.ParseException(oError.message);
					}
					return retVal;
				};
			}
			return oTypeInstance;
		}

		/**
		 * Creates the control for value editing.
		 *
		 * @param {string} sId id of owner editor
		 * @param {map} oParams parameters used for control creation
		 * <ul>
		 * <li>'name' of type <code>string</code> </li>
		 * <li>'type' of type <code>string</code> </li>
		 * <li>'bindingType' of type <code>sap.ui.model.SimpleType</code> </li>
		 * <li>'typeObject' of type <code>object</code> </li>
		 * <li>'editFactory' of type <code>function</code> </li>
		 * </ul>
		 *
		 * @returns {sap.ui.core.Control} Returns the created control
		 *
		 * @name _createField
		 * @function
		 * @private
		 */
		function _createField(sId, oParams) {
			var oControl,
				oBinding = {
					path: "value",
					//TODO: find the editControlFactory usage
					type: oParams.editControlFactory ? oParams.bindingType : _getDataType(oParams)
				};
			sId += "--" + oParams.name;

			if (oParams.editControlFactory) {
				oControl = oParams.editControlFactory(window, sId, oBinding, {
					valueState: "{valueState}",
					placeholder: "{placeholder}"
				});
			} else if (oParams.isIcon && oParams.typeName === "sap.ui.core.URI") {
				oControl = new sap.ui.commons.ValueHelpField(sId, {
					value: oBinding,
					valueState: "{valueState}",
					placeholder: "{placeholder}",
					tooltip: "{i18n>properties_icon_tooltip}",
					width: "100%",
					valueHelpRequest: W5gBindingHelper.openIconDialog
				});
				//Overrides the constant Tooltip_AsString which comes with the ValueHelpField control
				oControl.getTooltip_AsString = oControl.getTooltip_Text;
			} else if (oParams.type === "boolean" || oParams.type === "enum") {
				if (oParams.type === "boolean") {
					oParams.typeObject = {
						"true": true,
						"false": false
					};
				}
				oControl = new sap.ui.commons.ComboBox(sId, {
					value: oBinding,
					maxPopupItems: 5,
					valueState: "{valueState}",
					placeholder: "{placeholder}",
					width: "100%",
					items: Object.keys(oParams.typeObject || {}).map(function (sKey) {
						return new sap.ui.core.ListItem({
							text: sKey
						});
					})
				});
			} else { //oParams.type === "string" || "int" || "float"
				oControl = new sap.ui.commons.TextField(sId, {
					value: oBinding,
					valueState: "{valueState}",
					placeholder: "{placeholder}",
					width: "100%"
				});
			}
			return oControl.attachEvent("change", W5gBindingHelper.onPropertyChange);
		}

		/**
		 * Returns possible visibility value according to given settings.
		 * Can be a binding string
		 *
		 * @param {object} mSettings property metadata
		 * @return {boolean|string} false if the given property is not bindable
		 *
		 * @name _getButtonVisibilityExpression
		 * @function
		 * @private
		 */
		function _getButtonVisibilityExpression(mSettings) {
			if (mSettings.name === "id" || mSettings.editControlFactory) {
				return false;
			}
			return "{dataModel>/isMetadataExists}";
		}
// End
// Private variables and methods

		/**
		 * Constructor for a new PropertyEditor.
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
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertyEditor
		 */
		var PropertyEditor = sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertyEditor",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertyEditor.prototype */ {
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

			constructor: function (sId, mSettings) {
				if ((typeof sId !== "string") && arguments.length > 0) {
					mSettings = sId;
					if (mSettings && mSettings.id) {
						sId = mSettings["id"];
					} else {
						sId = null;
					}
				}

				sap.ui.core.Control.apply(this, [sId]);

				var oField = _createField(sId, mSettings),
					sUnbindKey = BindingUtils.getUnbindKey();

				this.setAggregation("field", oField);
				this.setAggregation("label", new sap.ui.commons.Label({
					text: "{title}",
					tooltip: DocuUtils.createDocuTooltip({} , 'properties'),
					labelFor: oField.getId()
				}));
				this.setAggregation("deprecated", new sap.ui.commons.Label({
					text: "{i18n>properties_control_deprecated_label}",
					visible: "{isDeprecated}",
					labelFor: oField.getId()
				}).addStyleClass("sapPropertiesEditorLabelAdditionalText"));
				this.setAggregation("button", new sap.ui.commons.Button({
					visible: _getButtonVisibilityExpression(mSettings),
					enabled: {
						parts: [
							{
								path: "dataModel>/isDefaultModel"
							},
							{
								path: "dataModel>/viewES"
							},
							{
								path: "dataModel>/controlES"
							}
						],
						formatter: function (bDefaultModel, sViewKey, sControlKey) {
							return bDefaultModel && (sControlKey !== sUnbindKey || sViewKey !== sUnbindKey);
						}
					},
					tooltip: {
						parts: [
							{
								path: "dataModel>/viewES"
							},
							{
								path: "dataModel>/isRoot"
							},
							{
								path: "i18n>binding_button_no_default_data_set_tooltip"
							},
							{
								path: "i18n>binding_button_default_tooltip"
							}
						],
						formatter: function (sViewKey, bRoot, sNoDataSetTooltip, sDataSetTooltip) {
							return (!bRoot && sViewKey === sUnbindKey) ? sNoDataSetTooltip : sDataSetTooltip;
						}
					},
					press: [oField, W5gBindingHelper.startPropertyBinding],
					icon: "sap-icon://chain-link"
				}));
			},

			/**
			 * Renders the HTML for the given control <code>oControl</code>, using the provided render manager <code>oRm</code>
			 *
			 * @param {sap.ui.core.RenderManager} oRm
			 *          The render manager that can be used for writing to the render output buffer.
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertyEditor} oControl
			 *          An object representation of the control that should be rendered.
			 */
			renderer: function (oRm, oControl) {
				var oButton = oControl.getAggregation("button");

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
				if (oButton.getVisible()) {
					oRm.addClass("sapWysiwygPropertyEditorFieldRowPadding");
				}
				oRm.writeClasses();
				oRm.write(">");
				oRm.renderControl(oControl.getAggregation("field"));
				oRm.renderControl(oButton);
				oRm.write("</div>");
				oRm.write("</div>");
			}
		});

		/**
		 * Adjust property label size
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertyEditor#onAfterRendering
		 * @function
		 * @public
		 */
		PropertyEditor.prototype.onAfterRendering = function () {
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
		PropertyEditor.prototype.exit = W5gUtils.destroyPrivateAggregations;

		/**
		 * Returns the DOM Element that should get the focus.
		 *
		 * @override sap.ui.core.Element.prototype.getFocusDomRef
		 */
		PropertyEditor.prototype.getFocusDomRef = function () {
			return this.getAggregation("field").getFocusDomRef();
		};

		return PropertyEditor;
	}
);
