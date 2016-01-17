define(
	[
		"sap/watt/lib/lodash/lodash",
		"./W5gUtils",
		"./BindingUtils"
	],
	function (_, W5gUtils, BindingUtils) {
		"use strict";

// Private variables and methods
// Begin
		var
			/**
			 * Field type regular expression
			 *
			 * @const
			 * @type {string}
			 * @private
			 */
			FIELD_TYPE_REGEX = /^EDM\.(.*)/i;

		/**
		 * Filters given fields by type
		 *
		 * @param {Array<object>} aFields fields
		 * @param {string} sType type
		 * @return {Array<object>} Array of filtered fields
		 *
		 * @name _filterFieldsByType
		 * @function
		 * @private
		 */
		function _filterFieldsByType(aFields, sType) {
			var aResult = [], sImplicitType;
			aFields.forEach(function (oField) {
				if (sType === "string") {
					aResult.push(oField);
				} else {
					sImplicitType = _getImplicitType(oField.type);
					if (sImplicitType === "string" && sType === "enum") {
						aResult.push(oField);
					} else if (sImplicitType === sType) {
						aResult.push(oField);
					}
				}
			});

			return aResult;
		}

		/**
		 * Converts type implicitly
		 *
		 * @param {string} sType type name
		 * @return {string} Implicitly converted type name
		 *
		 * @name _getImplicitType
		 * @function
		 * @private
		 */
		function _getImplicitType(sType) {
			sType = (sType || "").toUpperCase();
			switch (sType) {
				case "EDM.SBYTE":
				case "EDM.INT16":
				case "EDM.INT32":
				case "EDM.INT64":
					return "int";
				case "EDM.DECIMAL":
				case "EDM.DOUBLE":
				case "EDM.SINGLE":
					return "float";
				case "EDM.BOOLEAN":
					return "boolean";
				case "EDM.STRING":
					return "string";
				default:
					if (FIELD_TYPE_REGEX.test(sType)) {
						return (FIELD_TYPE_REGEX.exec(sType)[1]).toLowerCase();
					}
					return null;
			}
		}

		/**
		 * Converts the type to a friendly readable text
		 *
		 * @param {string} sType type name
		 * @return {string} Formatted type name
		 *
		 * @name _formatTypeText
		 * @function
		 * @private
		 */
		function _formatTypeText(sType) {
			if (FIELD_TYPE_REGEX.test(sType)) {
				return (FIELD_TYPE_REGEX.exec(sType)[1]).toLowerCase();
			}
			return (sType || "").toLowerCase();
		}

		/**
		 * Updates expression value
		 *
		 * @this {sap.ui.commons.TextArea} Expression text area
		 * @param {string} sValue new expression value
		 *
		 * @name _updateExpression
		 * @function
		 * @private
		 */
		function _updateExpression(sValue) {
			this.setValue(sValue);
			this.fireLiveChange({"liveValue": sValue});
		}

		///**
		// * Validates expression value
		// *
		// * @this {sap.ui.commons.TextArea} Expression text area
		// *
		// * @name _validateExpression
		// * @function
		// * @private
		// */
		//function _validateExpression() {
		//	//TODO:...
		//}
// End
// Private variables and methods

		/**
		 * WYSIWYG property binding dialog helper
		 *
		 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.PropertyBindingDialogHelper}
		 */
		var PropertyBindingDialogHelper = {
			/**
			 * Opens a property data binding/editor dialog.
			 *
			 * @param {map} mOptions dialog options
			 *
			 * <ul>
			 * <li>'controlName' of type <code>string</code>
			 *          Control name
			 * </li>
			 * <li>'propertyName' of type <code>string</code>
			 *          Property name
			 * </li>
			 * <li>'propertyType' of type <code>string</code>
			 *          Property type
			 * </li>
			 * <li>'propertyTypeName' of type <code>string</code>
			 *          Property type name
			 * </li>
			 * <li>'propertyDefaultValue' of type <code>string</code>
			 *          Property default value
			 * </li>
			 * <li>'fields' of type <code>Array(object)</code>
			 *          An array of data fields
			 * </li>
			 * <li>'selected' of type <code>string</code>
			 *          Selected data field name
			 * </li>
			 * <li>'value' of type <code>string</code>
			 *          Current expression value
			 * </li>
			 * </ul>
			 *
			 * @return {Q} promise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.PropertyBindingDialogHelper.showPropertyEditor
			 * @function
			 * @public
			 */
			showPropertyEditor: function (mOptions) {
				var oModel = new sap.ui.model.json.JSONModel({
						value: mOptions.value,
						fields: _filterFieldsByType(mOptions.fields, mOptions.propertyType)
					}),
					sDefaultValue = mOptions.propertyDefaultValue,
					oDeferred = Q.defer(),
					sNoData = W5gUtils.getText("binding_fields_no_data", [mOptions.propertyTypeName]),
					bResult = false,
					oListBox = new sap.ui.commons.ListBox({
						items: {
							path: "fields",
							template: new sap.ui.core.ListItem({
								text: {
									parts:[
										{path: "name"},
										{path: "type"}
									],
									formatter: function(sName, sType) {
										return sName + " (" + _formatTypeText(sType) + ")";
									}
								},
								key: "{key}"
							})
						},
						width: "100%",
						visibleItems: 6
					}).addEventDelegate({
							onAfterRendering: function() {
								var sMessage = sNoData;

								var oBinding = oListBox.getBinding("items");
								if ((oBinding.aFilters || []).length) {
									sMessage = W5gUtils.getText("binding_fields_filter_no_data", [
										oSearchField.$().find("input").val(),
										mOptions.propertyTypeName
									]);
								}
								oListBox.$().attr("empty-message", sMessage);
								if (!oListBox.getItems().length) {
									oListBox.addStyleClass("emptyList");
								}
							}
						}),
					oSearchField = new sap.ui.commons.SearchField({
						enableListSuggest: false,
						showListExpander: false,
						enableClear: true,
						enableFilterMode: true,
						startSuggestion: 0,
						width: "100%",
						suggest: function (oEvent) {
							PropertyBindingDialogHelper._applyFilter(oEvent.getParameter("value"), oListBox, oExpression.getValue());
						}
					}),
					oExpression = new sap.ui.commons.TextArea({
						value: "{value}",
						width: "100%",
						height: "100%"
					}),
					oLayout = new sap.ui.commons.layout.MatrixLayout({
						width: "100%",
						height: "100%",
						widths: ["35%", "65%"],
						rows: [
							new sap.ui.commons.layout.MatrixLayoutRow({
								height: "40px",
								cells: [
									new sap.ui.commons.layout.MatrixLayoutCell({
										colSpan: 2,
										vAlign: sap.ui.commons.layout.VAlign.Top,
										padding: sap.ui.commons.layout.Padding.Both,
										content: new sap.ui.commons.FormattedTextView({
											htmlText: W5gUtils.getText("binding_description_message", [
												mOptions.propertyName,
												mOptions.controlName
											])
										})
									})
								]
							}),
							new sap.ui.commons.layout.MatrixLayoutRow({
								height: "40px",
								cells: [
									new sap.ui.commons.layout.MatrixLayoutCell({
										padding: sap.ui.commons.layout.Padding.Begin,
										vAlign: sap.ui.commons.layout.VAlign.Bottom,
										content: new sap.ui.commons.Label({
											text: "{i18n>binding_fields_label}"
										})
									}),
									new sap.ui.commons.layout.MatrixLayoutCell({
										padding: sap.ui.commons.layout.Padding.Begin,
										vAlign: sap.ui.commons.layout.VAlign.Bottom,
										content: new sap.ui.commons.Label({
											text: W5gUtils.getText("binding_expression_label", [mOptions.propertyTypeName])
										})
									})
								]
							}),
							new sap.ui.commons.layout.MatrixLayoutRow({
								cells: [
									new sap.ui.commons.layout.MatrixLayoutCell({
										padding: sap.ui.commons.layout.Padding.End,
										vAlign: sap.ui.commons.layout.VAlign.Top,
										content: new sap.ui.layout.VerticalLayout({
											content: [
												oSearchField,
												oListBox
											]
										})
									}),
									new sap.ui.commons.layout.MatrixLayoutCell({
										padding: sap.ui.commons.layout.Padding.Begin,
										vAlign: sap.ui.commons.layout.VAlign.Top,
										content: oExpression
									})
								]
							})
							//TODO
							//new sap.ui.commons.layout.MatrixLayoutRow({
							//	height: "25px",
							//	cells: [
							//		new sap.ui.commons.layout.MatrixLayoutCell(),
							//		new sap.ui.commons.layout.MatrixLayoutCell({
							//			vAlign: sap.ui.commons.layout.VAlign.Top,
							//			padding: sap.ui.commons.layout.Padding.Both,
							//			content: new sap.ui.commons.FormattedTextView({
							//				htmlText: "validation message"
							//			})
							//		})
							//	]
							//})
						]
					}).addEventDelegate({
							onAfterRendering: function () {
								W5gUtils.addPlaceHolderToSearchField(oSearchField, "binding_search_field_placeholder");
								setTimeout(function () { //waiting for ui
									var iExpressionHeight = oListBox.$().outerHeight() + oSearchField.$().outerHeight(true); //include search field margin
									oExpression.focus();
									oExpression
										.setCursorPos(oExpression.getValue().length)
										.$().css("height", iExpressionHeight + "px");
								});
							}
						}),
					aButtons = [
						//TODO
						//new sap.ui.commons.Button({
						//	text: "{i18n>binding_validate_button}",
						//	tooltip: "{i18n>binding_validate_tooltip}",
						//	press: _validateExpression.bind(oExpression)
						//}).addStyleClass("rightTBButton"),
						new sap.ui.commons.Button({
							text: "{i18n>binding_reset_button}",
							tooltip: "{i18n>binding_reset_tooltip}",
							press: _updateExpression.bind(oExpression, sDefaultValue)
						}).addStyleClass("rightTBButton"),
						new sap.ui.commons.Button({
							text: "{i18n>binding_clear_button}",
							tooltip: "{i18n>binding_clear_tooltip}",
							press: _updateExpression.bind(oExpression, "")
						}).addStyleClass("rightTBButton"),
						createButton("binding_dialog_cancel_button", false),
						createButton("binding_dialog_ok_button", true)
					],
					oDialog = new sap.ui.commons.Dialog({
						applyContentPadding: false,
						title: W5gUtils.getText("binding_property_binding_dialog_title", [mOptions.controlName]),
						resizable: false,
						modal: true,
						content: oLayout,
						buttons: aButtons,
						initialFocus: oExpression, //request initial focus
						defaultButton: aButtons[aButtons.length - 1],
						closed: onClose
					})
						.bindElement("/")
						.setModel(oModel)
						.addStyleClass("sapWysiwygDialog")
						.addStyleClass("sapWysiwygDialogWide");

				oListBox.ondblclick = function (oEvent) {
					var oSelectedItem = jQuery(oEvent.target).control()[0],
						oContext = oSelectedItem && oSelectedItem.getBindingContext();
					if (oContext && oContext.getProperty("key")) {
						var sValue = oExpression.getValue();
						var sBindValue = "{" + oContext.getProperty("key") + "}";
						oExpression.focus();
						oExpression
							.setValue(
								[
									sValue.slice(0, oExpression.getCursorPos()),
									sBindValue,
									sValue.slice(oExpression.getCursorPos())
								].join("")
						).setCursorPos(oExpression.getCursorPos() + sBindValue.length);
					}
				};

				if (sDefaultValue === undefined || sDefaultValue === null) {
					sDefaultValue = "";
				}
				sDefaultValue = sDefaultValue + "";

				W5gUtils.applyBundleTo(oDialog);
				oDialog.open();
				return oDeferred.promise;

				function createButton(sText, bValue) {
					return new sap.ui.commons.Button({
						text: "{i18n>" + sText + "}",
						press: close.bind(this, bValue)
					});
				}

				function close(bValue) {
					bResult = bValue;
					oDialog.close();
				}

				function onClose() {
					// first detach close handler (to avoid recursion and multiple reports)
					oDialog.detachClosed(onClose);
					oDialog.destroy();

					oDeferred.resolve({
						accepted: bResult,
						value: _.trim(oModel.getProperty("/value"))
					});
				}
			},

			/**
			 * Applies list filtering by given search prefix
			 *
			 * @param {string} sPrefix search string prefix
			 * @param {sap.ui.commons.ListBox} oList list box control
			 * @param {string} sExpressionValue expression value
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.PropertyBindingDialogHelper._applyFilter
			 * @function
			 * @private
			 */
			_applyFilter: function (sPrefix, oList, sExpressionValue) {
				oList.clearSelection();

				var oBinding = oList.getBinding("items");
				// Contains operator ignores case
				var oFilterItems = oBinding.filter(sPrefix ?
					[new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sPrefix)] : []);

				oList.toggleStyleClass("emptyList", !oFilterItems.aIndices.length);
			}
		};

		return PropertyBindingDialogHelper;
	}
);
