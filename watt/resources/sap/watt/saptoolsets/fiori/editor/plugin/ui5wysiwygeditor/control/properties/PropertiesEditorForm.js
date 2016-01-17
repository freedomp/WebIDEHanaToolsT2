define(
	[
		"../../utils/W5gUtils",
		"./PropertyEditor",
		"./DataBindingEditor"
	],
	function (W5gUtils, PropertyEditor, DataBindingEditor) {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertiesEditorForm");

// Private variables and methods
// Begin
		var
			/**
			 * Reference to properties form control
			 * @type {sap.ui.commons.layout.MatrixLayout}
			 * @private
			 */
			_oForm = null,

			/**
			 * Current filter value
			 *
			 * @type {string}
			 * @private
			 */
			_sFilter = "";

		/**
		 * Event handler which indicates that input cannot be parsed.
		 * Sets error message and indicates rejected value in model
		 *
		 * @this {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertiesEditorForm}

		 * @param {object} oEvent event object
		 *
		 * @name _onParseError
		 * @function
		 * @private
		 */
		function _onParseError(oEvent) {
			// Display error message via tooltip
			var oModel = this.getModel(),
				sTitle = oModel.getProperty("title", oEvent.getParameter("element").getBindingContext()),
				sMsg = W5gUtils.getText("properties_parse_error_tooltip", [
					sTitle, oEvent.getParameter("newValue"), oEvent.getParameter("type").getName()
				]),
				sDetailMsg = oEvent.getParameter("message");
			_setInputErrorMessage(oModel, oEvent, sMsg + " " + sDetailMsg);
		}

		/**
		 * Event handler which indicates that input is not valid.
		 * Sets error message and indicates rejected value in model
		 *
		 * @this {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertiesEditorForm}

		 * @param {object} oEvent event object
		 *
		 * @name _onValidationError
		 * @function
		 * @private
		 */
		function _onValidationError(oEvent) {
			_setInputErrorMessage(this.getModel(), oEvent, oEvent.getParameter("exception").message);
		}

		/**
		 * Event handler which indicates that input is valid at this point.
		 * Clears error message if any
		 *
		 * @this {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertiesEditorForm}

		 * @param {object} oEvent event object
		 *
		 * @name _onValidationSuccess
		 * @function
		 * @private
		 */
		function _onValidationSuccess(oEvent) {
			var oElement = oEvent.getParameter("element"),
				oModel = this.getModel();

			oModel.setProperty("rejectedValue", undefined, oElement.getBindingContext());

			// Clear tool tip
			oElement.setTooltip("");

			// Get UI updated
			oModel.refresh();
		}

		/**
		 * Sets error message <code>sMsg</code> and updates rejected value in <code>oModel</code>
		 *
		 * @param {sap.ui.model.Model} oModel
		 * @param {object} oEvent an event object
		 * @param {string} sMsg an error message
		 *
		 * @name _onValidationSuccess
		 * @function
		 * @private
		 */
		function _setInputErrorMessage(oModel, oEvent, sMsg) {
			var oElement = oEvent.getParameter("element");

			// Indicate rejected value in model so that error gets visualized
			oModel.setProperty("rejectedValue", oEvent.getParameter("newValue"), oElement.getBindingContext());

			// Display error message via tool tip
			oElement.setTooltip(sMsg);

			// Get UI updated
			oModel.refresh();
		}

		/**
		 * Applies current filter
		 *
		 * @param {object|string} oEvent an event object or filter value
		 *
		 * @private
		 * @name _applyFilter
		 * @function
		 */
		function _applyFilter(oEvent) {
			var oBinding = _oForm.getBinding("rows");

			var sFilter = (typeof(oEvent) === "object" ? oEvent.getParameter("value") : oEvent).toLowerCase();

			if (oBinding && _sFilter !== sFilter) {
				_sFilter = sFilter;
				oBinding.refresh(true);
			}
		}
// End
// Private variables and methods

		/**
		 * Constructor for a new PropertiesEditorForm.
		 *
		 * @param {string=} sId id for the new control, generated automatically if no id is given
		 * @param {object=} mSettings initial settings for the new control
		 *
		 * @class
		 * WYSIWYG property editor form control
		 * @extends sap.ui.core.Control
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertiesEditorForm
		 */
		var PropertiesEditorForm = sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertiesEditorForm",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertiesEditorForm.prototype */ {
			metadata: {
				properties: {
					"hasMetadata": {"type": "boolean", "defaultValue": false},

					/**
					 * Control name.
					 */
					"title": {"type": "string", "group": "Misc", "defaultValue": null},

					/**
					 * Information message.
					 */
					"message": {"type": "string", "group": "Misc", "defaultValue": null},

					/**
					 * Deprecated text.
					 */
					"deprecated": {"type": "string", "group": "Behavior", "defaultValue": null}
				},
				aggregations: {
					/**
					 * Hidden, for internal use only.
					 */
					"search": {"type": "sap.ui.commons.SearchField", "multiple": false, "visibility": "hidden"},

					/**
					 * Hidden, for internal use only.
					 */
					"dataBinding": {"type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden"},

					/**
					 * Hidden, for internal use only.
					 */
					"form": {"type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden"}
				}
			},

			constructor: function () {
				sap.ui.core.Control.apply(this, arguments);

				var sFormId = this.getId();

				// Attach handlers for parsing and validation errors triggered by entry in the control property editor
				this.attachParseError(_onParseError, this);
				this.attachValidationError(_onValidationError, this);
				this.attachValidationSuccess(_onValidationSuccess, this);

				this.bindProperty("hasMetadata", "dataModel>/isMetadataExists");

				this.setAggregation("search", new sap.ui.commons.SearchField(sFormId + "--filter", {
					enableListSuggest: false,
					showListExpander: false,
					enableClear: true,
					enableFilterMode: true,
					startSuggestion: 0,
					suggest: _applyFilter
				}).addStyleClass("sapWysiwygFilter"));

				this.setAggregation("dataBinding", new sap.ui.commons.layout.MatrixLayout({
					widths: ["100%"],
					rows: [
						new sap.ui.commons.layout.MatrixLayoutRow({
							cells: [
								new sap.ui.commons.layout.MatrixLayoutCell({
									padding: sap.ui.commons.layout.Padding.None,
									content: new DataBindingEditor()
								})
							]
						})
					]
				}));

				_oForm = new sap.ui.commons.layout.MatrixLayout({
					widths: ["100%"],
					rows: {
						path: "/properties",
						factory: function (sId, oContext) {
							var oData = oContext.getObject();
							return new sap.ui.commons.layout.MatrixLayoutRow(sId, {
								cells: [
									new sap.ui.commons.layout.MatrixLayoutCell({
										content: new PropertyEditor(sFormId + "_" + sId + "_" + oData.name, oData)
									})
								]
							});

						},
						filters: [
							new sap.ui.model.Filter("title", function (sValue) {
								return !_sFilter || sValue.toLowerCase().indexOf(_sFilter) !== -1;
							})
						]
					}
				});
				this.setAggregation("form", _oForm);
			},

			/**
			 * Renders the HTML for the given control <code>oControl</code>, using the provided render manager <code>oRm</code>
			 *
			 * @param {sap.ui.core.RenderManager} oRm
			 *          The render manager that can be used for writing to the render output buffer.
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertiesEditorForm} oControl
			 *          An object representation of the control that should be rendered.
			 */
			renderer: function (oRm, oControl) {
				// write the HTML into the render manager
				var sMessage = oControl.getMessage(),
					sDeprecated = oControl.getDeprecated();

				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.addClass("sapPropertiesEditor");
				oRm.writeClasses();
				oRm.write(">");

				oRm.write("<div");
				oRm.addClass("w5gPropertiesPanelHdr");
				oRm.writeClasses();
				oRm.write(">");

				if (sMessage) {
					oRm.write("<div");
					oRm.addClass("propertyEditorTitleSpecial");
					oRm.addClass("w5gPropertiesPanelHdrItem");
					oRm.writeClasses();
					oRm.write(">");
					oRm.writeEscaped(sMessage);
					oRm.write("</div>");

					oRm.write("</div>"); //w5gPropertiesPanelHdr/>
				} else {
					oRm.write("<div");
					oRm.addClass("w5gPropertiesTitle");
					oRm.addClass("w5gPropertiesPanelHdrItem");
					oRm.writeClasses();
					oRm.write(">");
					oRm.writeEscaped(oControl.getTitle());
					oRm.write("</div>");

					if (sDeprecated) {
						oRm.write("<div");
						oRm.addClass("w5gPropertiesDeprecated");
						oRm.addClass("w5gPropertiesPanelHdrItem");
						oRm.writeClasses();
						oRm.write(">");
						oRm.writeEscaped(sDeprecated);
						oRm.write("</div>");
					}
					oRm.write("</div>"); //w5gPropertiesPanelHdr/>

					oRm.write("<div");
					oRm.addClass("sapWysiwygDataBindingBox");
					oRm.writeClasses();
					oRm.write(">");
					oRm.renderControl(oControl.getAggregation("dataBinding"));
					oRm.write("</div>");

					oRm.renderControl(oControl.getAggregation("search"));

					oRm.write("<div");
					oRm.addClass("w5gPropertiesPanelCnt");
					oRm.writeClasses();
					oRm.write(">");
					oRm.renderControl(oControl.getAggregation("form"));
					oRm.write("</div>");
				}

				oRm.write("</div>"); //w5gPropPanel/>
			}
		});

		/**
		 * Adjusts layout, adds placeholder to search field
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertiesEditorForm#onAfterRendering
		 * @function
		 * @public
		 */
		PropertiesEditorForm.prototype.onAfterRendering = function () {
			var $elem = this.$().find(".sapWysiwygFilter");

			if ($elem.length) {
				this.$().find(".w5gPropertiesPanelCnt").css("top", $elem.position().top + $elem.outerHeight(true) + "px");
			}

			W5gUtils.addPlaceHolderToSearchField(this.getAggregation("search"), "properties_search_field_placeholder");
		};

		/**
		 * Resets current filter
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertiesEditorForm#resetFilter
		 * @function
		 * @public
		 */
		PropertiesEditorForm.prototype.resetFilter = function () {
			this.getAggregation("search").setValue("");
			_applyFilter("");
		};

		return PropertiesEditorForm;
	}
);