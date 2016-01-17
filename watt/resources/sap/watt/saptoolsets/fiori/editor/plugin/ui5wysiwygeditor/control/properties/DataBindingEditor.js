define(
	[
		"../../utils/W5gUtils",
		"../../utils/DocuUtils",
		"../../utils/W5gBindingHelper",
		"../../utils/BindingUtils"
	],
	function (W5gUtils, DocuUtils, W5gBindingHelper, BindingUtils) {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.DataBindingEditor");

		/**
		 * Constructor for a new DataBindingEditor.
		 *
		 * @param {string=} sId id for the new control, generated automatically if no id is given
		 * @param {object=} mSettings initial settings for the new control
		 *
		 * @class
		 * WYSIWYG data binding editor control
		 * @extends sap.ui.core.Control
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.DataBindingEditor
		 */
		var DataBindingEditor = sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.DataBindingEditor",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.DataBindingEditor.prototype */ {
			metadata: {
				properties: {
					"noDefaultDataSet": {"type": "string", "defaultValue": null}
				},
				aggregations: {
					/**
					 * Hidden, for internal use only.
					 */
					"label": {"type": "sap.ui.commons.Label", "multiple": false, "visibility": "hidden"},

					/**
					 * Hidden, for internal use only.
					 */
					"field": {"type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden"},

					/**
					 * Hidden, for internal use only.
					 */
					"checkBox": {"type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden"}
				}
			},

			constructor: function () {
				sap.ui.core.Control.apply(this, arguments);

				var sId = this.getId() + "--dataSet",
					sUnbindKey = BindingUtils.getUnbindKey();

				this.bindProperty("noDefaultDataSet", {
					parts: [
						{path: "dataModel>/isMetadataExists"},
						{path: "dataModel>/viewES"},
						{path: "dataModel>/isRoot"}
					],
					formatter: function (bMetadataExists, sViewKey, bRoot) {
						if (!bMetadataExists) {
							return "binding_no_metadata_tooltip";
						}
						if (!bRoot && sViewKey === sUnbindKey) {
							return "binding_no_default_data_set_tooltip";
						}
						return null;
					}
				});

				this.setAggregation("label", new sap.ui.commons.Label({
					text: "{i18n>binding_data_sets_label}",
					labelFor: sId
				}).addStyleClass("sapWysiwygPropertyEditorLabelRow"));
				this.setAggregation("field", new sap.ui.commons.DropdownBox(sId, {
					enabled: {
						parts: [
							{path: "dataModel>/isTemplate"},
							{path: "dataModel>/isRoot"}
						],
						formatter: function (bTemplate, bRoot) {
							return bTemplate || bRoot;
						}
					},
					items: {
						path: "dataModel>/entitySets",
						template: new sap.ui.core.ListItem({
							text: "{dataModel>name}",
							key: "{dataModel>key}"
						})
					},
					selectedKey: {
						parts: [
							{path: "dataModel>/viewES"},
							{path: "dataModel>/controlES"}
						],
						formatter: function (sViewKey, sControlKey) {
							return BindingUtils.normalizeDataSetPath(sControlKey === sUnbindKey ? sViewKey : sControlKey);
						}
					},
					maxPopupItems: 5,
					width: "100%",
					change: W5gBindingHelper.onEntitySetChange,
					tooltip: {
						parts: [
							{path: "dataModel>/isMetadataExists"},
							{path: "dataModel>/isTemplate"},
							{path: "dataModel>/isRoot"},
							{path: "dataModel>/viewES"}
						],
						formatter: function (bMetadataExists, bTemplate, bRoot, sViewKey) {
							if (bTemplate || bRoot) {
								//then the dropdown is enabled, no tooltip here
								return "";
							} else {
								if (sViewKey !== sUnbindKey) {
									return DocuUtils.createDocuTooltip({
										title: "",
										text: "{i18n>binding_data_set_selected_but_disabled_tooltip}"
									});
								} else {
									return DocuUtils.createDocuTooltip({
										title: "",
										text: bMetadataExists ? "{i18n>binding_no_default_data_set_tooltip}" : "{i18n>binding_no_metadata_tooltip}"
									});
								}
							}
						}
					}
				}));
				this.setAggregation("checkBox", new sap.ui.commons.CheckBox({
					enabled: {
						parts: [
							{path: "dataModel>/viewES"},
							{path: "dataModel>/isTemplate"}
						],
						formatter: function (sViewKey, bTemplate) {
							return bTemplate || sViewKey !== sUnbindKey;
						}
					},
					tooltip: DocuUtils.createDocuTooltip({
						title: "",
						text: "{dataModel>/templateTooltip}"
					}),
					checked: "{dataModel>/isTemplate}",
					visible: "{dataModel>/isTemplateVisible}",
					text: "{i18n>binding_set_as_template_label}",
					change: W5gBindingHelper.onSetAsTemplateChange
				}));
			},

			/**
			 * Renders the HTML for the given control <code>oControl</code>, using the provided render manager <code>oRm</code>
			 *
			 * @param {sap.ui.core.RenderManager} oRm
			 *          The render manager that can be used for writing to the render output buffer.
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.DataBindingEditor} oControl
			 *          An object representation of the control that should be rendered.
			 */
			renderer: function (oRm, oControl) {
				oRm.write("<div");
				oRm.addClass("sapWysiwygDataBindingEditor");
				oRm.writeClasses();
				oRm.writeControlData(oControl);
				oRm.write(">");

				oRm.write("<div");
				oRm.addClass("sapWysiwygDataBindingEditorPadding");
				oRm.writeClasses();
				oRm.write(">");
				oRm.renderControl(oControl.getAggregation("label"));
				oRm.renderControl(oControl.getAggregation("field"));
				oRm.write("</div>");

				oRm.renderControl(oControl.getAggregation("checkBox"));
				oRm.write("</div>");
			}
		});

		/**
		 * Cleans up the element instance before destruction.
		 *
		 * @override sap.ui.core.Element.prototype.exit
		 */
		DataBindingEditor.prototype.exit = W5gUtils.destroyPrivateAggregations;

		/**
		 * Setter for property noDefaultDataSet.
		 *
		 * @param {string} sValue property value
		 * @returns {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.DataBindingEditor} this to allow method chaining
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.DataBindingEditor#setNoDefaultDataSet
		 * @function
		 * @public
		 */
		DataBindingEditor.prototype.setNoDefaultDataSet = function (sValue) {
			this.setProperty("noDefaultDataSet", sValue, true);
			var oLabel = this.getAggregation("label");

			oLabel.setTooltip(sValue ? DocuUtils.createDocuTooltip({
				text: "{i18n>" + sValue + "}"
			}) : undefined);
			oLabel.toggleStyleClass("warning", !!sValue);
			return this;
		};

		return DataBindingEditor;
	}
);
