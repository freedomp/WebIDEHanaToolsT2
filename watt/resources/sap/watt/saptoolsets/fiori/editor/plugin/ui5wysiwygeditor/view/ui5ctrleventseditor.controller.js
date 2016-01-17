define(
	[
		"../models/W5gPropertiesModel",
		"../control/events/EventsEditorForm",
		"../utils/W5gUtils",
		"../utils/ControlMetadata",
		"../utils/EventBusHelper"
	],
	function (W5gPropertiesModel, EventsEditorForm, W5gUtils, ControlMetadata, EventBusHelper) {
		"use strict";

// Private variables and methods
// Begin
		var
			/**
			 * Flag that indicates if the controller available for the current view
			 *
			 * @type {boolean}
			 * @private
			 */
			_bControllerAvailable = null,

			/**
			 * Flag that indicates if it is OK to render the controller view
			 *
			 * @type {boolean}
			 * @private
			 */
			_bCanShowEvents = null;
// End
// Private variables and methods

		sap.ui.controller("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrleventseditor", {

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
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrleventseditor#_update
			 * @function
			 * @private
			 */
			_update: function () {
				var that = this;
				return that._getSelectionOwningWindowScope().spread(function (oScope) {
					var sSpecialTitle = null;

					_bCanShowEvents = true;

					if (!that._oControl) {
						_bCanShowEvents = false;
						sSpecialTitle = "events_select_item_message";
					} else if (!that._oControl.getMetadata || !that._oControl.getMetadata()) {
						_bCanShowEvents = false;
						sSpecialTitle = "properties_no_metadata_message";
					} else if (ControlMetadata.isControlUnsupported(that._oControl) ||
						W5gUtils.testAncestors(that._oControl, W5gUtils.isControlFragment, oScope)) {
						_bCanShowEvents = false;
						sSpecialTitle = "unsupported_message";
					} else if (ControlMetadata.isControlToBeSupported(that._oControl)) {
						_bCanShowEvents = false;
						sSpecialTitle = "properties_tobe_supported_message";
					} else if (!_bControllerAvailable) {
						_bCanShowEvents = false;
						sSpecialTitle = "events_controller_not_available";
					}

					if (!_bCanShowEvents) {
						that._setTitle(W5gUtils.getText(sSpecialTitle), true);
						return;
					}

					if (!that._oView.getModel()) {
						that._oView.setModel(that._oModel);
					}
				});
			},

			/**
			 * Wrapper for _update function
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrleventseditor#_updateWrapper
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
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrleventseditor#_getSelectionOwningWindowScope
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
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrleventseditor#_setTitle
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
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrleventseditor#onInit
			 * @function
			 * @public
			 */
			onInit: function () {
				this._oView = this.getView();

				this._oEditor = this.byId("eventseditor");

				this._oView.setModel(this._oTitleModel, "titleModel");

				this._sDeprecated = W5gUtils.getText("properties_control_deprecated_label");
				var that = this;
				EventBusHelper.subscribe(EventBusHelper.IDENTIFIERS.PROP_MODEL_CONTROL_UPDATED, function () {
					if (_bCanShowEvents) {
						that._setTitle(that._oModel.getProperty("/controlName"));
					}
				});
			},

			//!!---TODO this function and all the chain which call it (which start at onSelectionChanged in W5gProperties service)
			//-----Need to be moved to W5gEditor service and there should be the handling onSelectionChange
			/**
			 * Sets new selection if any
			 *
			 * @param {!sap.ui.core.Control} oControl new selection
			 * @param {object} oOwner Reference to the selection owner
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrleventseditor#setSelection
			 * @function
			 * @public
			 */
			setSelection: function (oControl, oOwner) {
				if (this._oControl === oControl) {
					return Q();
				}

				if (this._oControl) {
					this._oControl.detachEvent("_change", this._updateWrapper.bind(this));
				}

				if (oControl) {
					oControl.attachEvent("_change", this._updateWrapper.bind(this));
				}

				if (oOwner && oOwner.instanceOf("sap.watt.common.service.editor.Editor")) {
					this._oOwnerEditor = oOwner;
				}

				this._oControl = oControl;

				var that = this;
				return that._update().then(function () {
					that._oEditor.resetFilter();
				});
			},

			/**
			 * Set if the controller available for the current view
			 * value should be false if the controller not exists or cannot be parsed, o/w true
			 *
			 * @param {boolean} bValue
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrleventseditor#setControllerAvailable
			 * @function
			 * @public
			 */
			setControllerAvailable: function (bValue) {
				_bControllerAvailable = bValue;
			},

			/**
			 * Set the main model
			 *
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel} model object
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
