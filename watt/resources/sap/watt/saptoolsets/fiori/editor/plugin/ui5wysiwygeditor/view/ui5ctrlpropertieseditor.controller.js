define(
	[
		"../utils/W5gBindingHelper",
		"../models/W5gPropertiesModel",
		"../control/properties/PropertiesEditorForm",
		"../utils/W5gUtils",
		"../utils/ControlMetadata"
	],
	function (W5gBindingHelper, W5gPropertiesModel, PropertiesEditorForm, W5gUtils, ControlMetadata) {
		"use strict";

		sap.ui.controller("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrlpropertieseditor", {

			/**
			 * Reference to selection owner
			 *
			 * @type {object}
			 * @private
			 */
			_oOwnerEditor: null,

			/**
			 * Reference to view
			 * @type {sap.ui.core.mvc.View}
			 * @private
			 */
			_oView: null,

			/**
			 * Deprecated text
			 *
			 * @type {string}
			 * @private
			 */
			_sDeprecated: "",

			/**
			 * Title model
			 *
			 * <ul>
			 * <li>'title' of type <code>string</code>
			 *            Control title
			 * </li>
			 * <li>'message' of type <code>string</code>
			 *            Information message
			 * </li>
			 * <li>'isDeprecated' of type <code>boolean</code>
			 *            Whether the control is deprecated
			 * </li>
			 * </ul>
			 *
			 * @type {sap.ui.model.json.JSONModel}
			 * @private
			 */
			_oTitleModel: new sap.ui.model.json.JSONModel({
				title: "",
				message: "",
				isDeprecated: false
			}),

			/**
			 * Main model
			 *
			 * <ul>
			 * <li>'properties' of type <code>Array(object)</code>
			 *            Array of control properties
			 * </li>
			 * <li>'controlName' of type <code>string</code>
			 *            Control name
			 * </li>
			 * <li>'isDeprecated' of type <code>boolean</code>
			 *            Whether the control is deprecated
			 * </li>
			 * </ul>
			 *
			 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel}
			 * @private
			 */
			_oModel: null,

			/**
			 * Reference to property editor control
			 *
			 * @private
			 */
			_oEditor: null,

			/**
			 * The last selected control if any
			 *
			 * @type {sap.ui.core.Control}
			 * @private
			 */
			_oControl: null,


			/**
			 * Checks the current selected control and adds him to
			 * <code>sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel</code> model
			 * @returns {Q} Returns promise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrlpropertieseditor#_update
			 * @function
			 * @private
			 */
			_update: function () {
				var that = this;
				return that._getSelectionOwningWindowScope().spread(function (oScope, oXmlManipulator) {
					var bCanContinue = true,
						sSpecialTitle = null;

					if (!that._oControl) {
						bCanContinue = false;
						sSpecialTitle = "properties_select_item_message";
					} else if (!that._oControl.getMetadata || !that._oControl.getMetadata()) {
						bCanContinue = false;
						sSpecialTitle = "properties_no_metadata_message";
					} else if (ControlMetadata.isControlUnsupported(that._oControl) ||
						W5gUtils.testAncestors(that._oControl, W5gUtils.isControlFragment, oScope)) {
						bCanContinue = false;
						sSpecialTitle = "unsupported_message";
					} else if (ControlMetadata.isControlToBeSupported(that._oControl)) {
						bCanContinue = false;
						sSpecialTitle = "properties_tobe_supported_message";
					}

					if (!bCanContinue) {
						if (that._oModel) {
							that._oModel.setControl(null);
						}
						that._setTitle(W5gUtils.getText(sSpecialTitle), true);
						return;
					}

					if (!that._oView.getModel()) {
						that._oView.setModel(that._oModel);
					}

					that._oModel.setControl(that._oControl, oScope, oXmlManipulator);
					that._setTitle(that._oModel.getProperty("/controlName"));
				});
			},

			/**
			 * Wrapper for _update function
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrlpropertieseditor#_updateWrapper
			 * @function
			 * @private
			 */
			_updateWrapper: function () {
				this._update().done();
			},

			/**
			 * Returns scoped window
			 * @returns {Q} Returns promise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrlpropertieseditor#_getSelectionOwningWindowScope
			 * @function
			 * @private
			 */
			_getSelectionOwningWindowScope: function () {
				if (this._oOwnerEditor && this._oOwnerEditor.getScope) {
					return Q.all([
						this._oOwnerEditor.getScope(),
						this._oOwnerEditor.getXmlManipulator()
					]);
				}
				return Q([]);
			},

			/**
			 * Sets title text. Show/hide additional text if needed
			 *
			 * @param {string} sTitle title text
			 * @param {boolean=} bIsSpecial indicates if this title is special. Changes his style accordingly
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrlpropertieseditor#_setTitle
			 * @function
			 * @private
			 */
			_setTitle: function (sTitle, bIsSpecial) {
				this._oTitleModel.setData({
					title: bIsSpecial ? "" : sTitle,
					message: bIsSpecial ? sTitle : "",
					deprecated: this._oModel && this._oModel.getProperty("/isDeprecated") ? this._sDeprecated : ""
				});
			},

			/**
			 * Initializes the element instance after creation.
			 * Called when a view is instantiated and its controls have already been created;
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrlpropertieseditor#onInit
			 * @function
			 * @public
			 */
			onInit: function () {
				this._oView = this.getView();

				this._oEditor = this.byId("propertieseditor");

				this._oView
					.setModel(this._oTitleModel, "titleModel")
					.setModel(W5gBindingHelper.getDataModel(), "dataModel");

				this._sDeprecated = W5gUtils.getText("properties_control_deprecated_label");
			},

			//!!---TODO this function and all the chain which call it (which start at onSelectionChanged in W5gProperties service)
			//-----Need to be moved to W5gEditor service and there should be the handling onSelectionChange
			/**
			 * Sets new selection if any
			 *
			 * @param {!sap.ui.core.Control} oControl new selection
			 * @param {object} oOwner Reference to the selection owner
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrlpropertieseditor#setSelection
			 * @function
			 * @public
			 */
			setSelection: function (oControl, oOwner) {
				var that = this;
				// trigger binding helper to also reload metadata if needed
				return W5gBindingHelper.setSelection(oControl).then(function () {
					if (that._oControl === oControl) {
						return;
					}

					if (that._oControl) {
						that._oControl.detachEvent("_change", that._updateWrapper.bind(that));
					}

					if (oControl) {
						oControl.attachEvent("_change", that._updateWrapper.bind(that));
					}

					if (oOwner && oOwner.instanceOf("sap.watt.common.service.editor.Editor")) {
						that._oOwnerEditor = oOwner;
					}

					that._oControl = oControl;

					return that._update().then(function () {
						that._oEditor.resetFilter();
					});
				});
			},

			/**
			 * Set the main model
			 *
			 * @param {sap.watt.common.plugin.ui5wysiwygeditor.models.W5gPropertiesModel} model object
			 *
			 * @function
			 * @public
			 */
			setModel: function (oModel) {
				this._oModel = oModel;
			}

		});
	}
);
