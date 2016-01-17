/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/* global Promise */

// Provides control sap.ui.comp.smartform.SmartForm.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/comp/library', 'sap/m/MessageBox', 'sap/ui/core/Control', 'sap/ui/layout/form/Form', 'sap/ui/layout/form/ResponsiveLayout', 'sap/ui/fl/Utils', 'sap/ui/fl/registry/Settings', 'sap/m/Label', 'sap/m/Button', 'sap/m/ButtonType', 'sap/m/Panel', 'sap/m/Toolbar', 'sap/m/ToolbarSpacer', 'sap/m/ToolbarSeparator'
], function(jQuery, library, MessageBox, Control, Form, ResponsiveLayout, Utils, Settings, Label, Button, ButtonType, Panel, Toolbar, ToolbarSpacer, ToolbarSeparator) {
	"use strict";

	/**
	 * Constructor for a new smartform/SmartForm.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The SmartForm control renders a form (sap.ui.layout.form.Form) and supports key user personalization, such as adding/hiding fields and
	 *        groups, changing the order of fields and groups, and changing labels. When used with the SmartField control the label is taken from the
	 *        metadata annotation <code>sap:label</code> if not specified in the XML view.
	 * @extends sap.ui.core.Control
	 * @author Alexander Fürbach
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartform.SmartForm
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SmartForm = Control.extend("sap.ui.comp.smartform.SmartForm", /**
																		 * @lends sap.ui.comp.smartform.SmartForm.prototype
																		 */
	{
		metadata: {

			library: "sap.ui.comp",
			properties: {

				/**
				 * Title of the form.
				 */
				title: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies whether the groups are rendered in a {@link sap.ui.layout.form.ResponsiveLayout ResponsiveLayout} with the label above
				 * the field. Each group is rendered in a new line.
				 */
				useHorizontalLayout: {
					type: "boolean",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies the minimal size in pixels of all group elements of the form if the horizontal layout is used.
				 */
				horizontalLayoutGroupElementMinWidth: {
					type: "int",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies whether a check button is added to the toolbar.
				 */
				checkButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * CSV of entity types for which the flexibility features are available.<br>
				 * For more information about SAPUI5 flexibility, refer to the Developer Guide.<br>
				 * <i>Note:</i><br>
				 * No validation is done. Please ensure that you do not add spaces or special characters.
				 */
				entityType: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies whether the control is expandable. Per default the control is not rendered as expanded.
				 */
				expandable: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * If expandable, this property indicates whether the state is expanded or not. If expanded, then the toolbar (if available) and the
				 * content is rendered; if expanded is false, then only the headerText/headerToolbar is rendered.
				 */
				expanded: {
					type: "boolean",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies whether the editable property is togglable via button.
				 */
				editTogglable: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Specifies whether the form is editable.
				 */
				editable: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * CSV of fields that must be ignored in the OData metadata by the SmartForm control.<br>
				 * <i>Note:</i><br>
				 * No validation is done. Please ensure that you do not add spaces or special characters.
				 */
				ignoredFields: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies whether the form enables flexibility features, such as adding new fields.<br>
				 * For more information about SAPUI5 flexibility, refer to the Developer Guide.
				 */
				flexEnabled: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				}
			},
			defaultAggregation: "groups",
			aggregations: {

				/**
				 * Groups are used to group form elements.
				 */
				groups: {
					type: "sap.ui.comp.smartform.Group",
					multiple: true,
					singularName: "group"
				},

				/**
				 * Content to be rendered.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * Layout settings to adjust ResponsiveGridLayout
				 */
				layout: {
					type: "sap.ui.comp.smartform.Layout",
					multiple: false
				},

				/**
				 * The Semantic Object Controller allows the user to specify and overwrite functionality for semantic object navigation.
				 */
				semanticObjectController: {
					type: "sap.ui.comp.navpopover.SemanticObjectController",
					multiple: false
				},

				/**
				 * An additional toolbar that can be added by the users, which can contain further custom buttons, controls, etc.
				 */
				customToolbar: {
					type: "sap.m.Toolbar",
					multiple: false
				},

				/**
				 * Toolbar
				 */
				toolbar: {
					type: "sap.m.Toolbar",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {

				/**
				 * Event is fired when the editable property is toggled.
				 */
				editToggled: {},

				/**
				 * Event is fired after check was performed.
				 */
				checked: {}
			}
		}
	});

	/**
	 * Initialize the control.
	 *
	 * @private
	 */
	SmartForm.prototype.init = function() {
		this._bisLayoutCreated = false;
		this._oForm = null;
		this._oPanel = null;
		this._oTitle = new Label(this.getId() + "-title-sfmain").addStyleClass("title");
		this._bUpdateToolbar = true;
		this._sResizeListenerId = "";
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");

	};

	SmartForm._bHasRegisteredToFlexibilityServices = false;
	SmartForm.prototype._resizeHandlerRegId = "";

	SmartForm.prototype.onBeforeRendering = function() {

		this._updateToolbar();
		this._createLayout();
		this._updatePanel();

		if (this.getUseHorizontalLayout() && this.getLayout() && this.getLayout().getGridDataSpan()) {
			this._propagateGridDataSpan();
			this._registerResizeHandler();
		}
	};

	/**
	 * Adds a group to the aggregation named groups.
	 *
	 * @public
	 * @param {object} Group to be added
	 */
	SmartForm.prototype.addGroup = function(oGroup) {
		this.addAggregation("groups", oGroup, true);
	};

	/**
	 * Adds some entity oObject to the aggregation identified by sAggregationName.
	 *
	 * @public
	 * @param {string} Name of the aggregation
	 * @param {object} The object representing a group
	 */
	SmartForm.prototype.addAggregation = function(sAggregationName, oObject) {
		if (sAggregationName === "groups") {
			this._insertGroup(oObject);
		} else {
			Control.prototype.addAggregation.apply(this, arguments);
		}
	};

	/**
	 * Returns the content of aggregation groups.
	 *
	 * @public
	 * @returns {array} of groups
	 */
	SmartForm.prototype.getGroups = function() {
		var aGroups = this.getAggregation('groups');

		return ((aGroups === null) ? [] : aGroups);
	};

	/**
	 * Returns the aggregated object(s) for the named aggregation.
	 *
	 * @public
	 * @param {string} Name of the aggregation
	 * @returns {array} Content of an aggregation
	 */
	SmartForm.prototype.getAggregation = function(sAggregationName) {
		var aResult = null;
		if (sAggregationName === "groups") {
			aResult = this._oForm ? this._oForm.getFormContainers() : [];
		} else {
			aResult = Control.prototype.getAggregation.apply(this, arguments);
		}

		return aResult;
	};

	/**
	 * Creates a ResponsiveGridLayout and applies settings from aggregation <code>layout together with default settings
	 *
	 * @return {sap.ui.layout.form.ResponsiveGridLayout} the layout to be used for the form.
	 * @private
	 */
	SmartForm.prototype._getLayout = function() {

		var oLayout = this.getLayout();
		var oFormLayout = null;
		var aGroups = this.getGroups();

		if (oLayout) {
			oFormLayout = new sap.ui.layout.form.ResponsiveGridLayout({
				"labelSpanL": oLayout.mProperties["labelSpanL"] ? oLayout.mProperties["labelSpanL"] : 4,
				"labelSpanM": oLayout.mProperties["labelSpanM"] ? oLayout.mProperties["labelSpanM"] : 4,
				"emptySpanL": oLayout.mProperties["emptySpanL"] ? oLayout.mProperties["emptySpanL"] : 0,
				"emptySpanM": oLayout.mProperties["emptySpanM"] ? oLayout.mProperties["emptySpanM"] : 0,
				"columnsL": oLayout.mProperties["columnsL"] ? oLayout.mProperties["columnsL"] : 3,
				"columnsM": oLayout.mProperties["columnsM"] ? oLayout.mProperties["columnsM"] : 2,
				"breakpointL": oLayout.mProperties["breakpointL"] ? oLayout.mProperties["breakpointL"] :

				1024,
				"breakpointM": oLayout.mProperties["breakpointL"] ? oLayout.mProperties["breakpointL"] :

				600
			});

		} else {
			oFormLayout = new sap.ui.layout.form.ResponsiveGridLayout({
				"labelSpanL": 4,
				"labelSpanM": 4,
				"emptySpanL": 0,
				"emptySpanM": 0,
				"columnsL": 3,
				"columnsM": 2,
				"breakpointL": 1024,
				"breakpointM": 600
			});
		}

		if (aGroups && aGroups.length < oFormLayout.getColumnsL()) {
			oFormLayout.setColumnsL(aGroups.length);
		}

		return oFormLayout;
	};

	/**
	 * Creates a toolbar and sets it into the content aggregation
	 *
	 * @private
	 */
	SmartForm.prototype._createToolbar = function() {
		if (this._oToolbar) {
			var oContent = this._oToolbar.removeContent(this._oToolbar.getId() + "-button-sfmain-editToggle");
			if (oContent) {
				oContent.destroy();
				this._oEditToggleButton = null;
			}
			oContent = this._oToolbar.removeContent(this.getId() + "-" + this._oToolbar.getId() + "-button-sfmain-check");
			if (oContent) {
				oContent.destroy();
			}
			oContent = this._oToolbar.removeContent(this.getId() + "-" + this._oToolbar.getId() + "-AdaptationButton");
			if (oContent) {
				oContent.destroy();
			}
			this._oToolbar.removeContent(this.getId() + "-title-sfmain");
		}
		this._oToolbar = new Toolbar({
			"height": "3rem"
		});
		this.setAggregation("toolbar", this._oToolbar);
	};

	SmartForm.prototype._updateToolbar = function() {
		var oCustomToolbar = this._getCustomToolbar();

		if (this._bUpdateToolbar) {
			if (oCustomToolbar) {
				this._cleanToolbar();
				this._addHeaderToToolbar();
				this._addSeparatorToToolbar();
				this._addEditTogglableToToolbar();
				this._addCheckToToolbar();
				this._addChangeModeToToolbar();
				this._removeSeparatorFromToolbar();
			} else {
				this._createToolbar();
				this._oToolbar.addStyleClass("titleBar");
				this._addHeaderToToolbar();
				this._addEditTogglableToToolbar();
				this._addCheckToToolbar();
				this._addChangeModeToToolbar();
				if (this._oToolbar.getContent().length === 1 && !this.getExpandable()) {
					this._oToolbar.destroyContent();
					this._oToolbar.destroy();
					this._oToolbar = null;
					this.setAggregation("toolbar", null);
				}
			}
			this._bUpdateToolbar = false;
		}
	};

	SmartForm.prototype._getToolbar = function() {
		var oCustomToolbar = this._getCustomToolbar();
		return oCustomToolbar || this._oToolbar;
	};

	SmartForm.prototype._updatePanel = function() {
		var that = this;
		var oToolbar = this._getToolbar();

		if (this.mProperties["expandable"]) {
			if (!this._oPanel) {
				this._oPanel = new Panel({
					"expanded": this.mProperties["expanded"],
					"expandable": true,
					"headerText": this.getTitle(),
					"headerToolbar": oToolbar
				});
				this._oPanel.attachExpand(function(oEvent) {
					that.setProperty("expanded", oEvent.getParameters()["expand"], false);
				});

				this._oPanel.addContent(this._oForm);
				this.setAggregation("content", this._oPanel);
			} else {
				this._oPanel.setExpanded(this.mProperties["expanded"]);
				this._oPanel.setHeaderToolbar(oToolbar);
			}
		} else {
			if (oToolbar) {
				oToolbar.addStyleClass("titleBar");
			}
			this.setAggregation("content", this._oForm);
		}
	};

	/**
	 * Removes content from customToolbar
	 *
	 * @private
	 */
	SmartForm.prototype._cleanToolbar = function() {
		var oCustomToolbar = this._getCustomToolbar();

		var oContent = oCustomToolbar.removeContent(oCustomToolbar.getId() + "-button-sfmain-editToggle");
		if (oContent) {
			oContent.destroy();
			this._oEditToggleButton = null;
		}
		oContent = oCustomToolbar.removeContent(this.getId() + "-" + oCustomToolbar.getId() + "-button-sfmain-check");
		if (oContent) {
			oContent.destroy();
		}
		oContent = oCustomToolbar.removeContent(this.getId() + "-" + oCustomToolbar.getId() + "-AdaptationButton");
		if (oContent) {
			oContent.destroy();
		}
		oCustomToolbar.removeContent(this.getId() + "-title-sfmain");
	};

	/**
	 * Adds a title and a toolbar separator to the toolbar.
	 *
	 * @private
	 */
	SmartForm.prototype._addHeaderToToolbar = function() {
		var oCustomToolbar = this._getCustomToolbar();
		var oToolbar = oCustomToolbar || this._oToolbar;
		var aContent = [];
		var i = 0;
		var oToolbarSpacer = null;

		if (this.getTitle() || this.mBindingInfos['title']) {
			oToolbar.insertContent(this._oTitle, 0);
		}

		if (this._oToolbar) {
			oToolbar.insertContent(new ToolbarSpacer(), 1);
		} else {
			aContent = oToolbar.getContent();
			for (i; i < aContent.length; i++) {
				if (aContent[i].getMetadata().getName() === "sap.m.ToolbarSpacer") {
					oToolbarSpacer = aContent[i];
				}
			}
			if (!oToolbarSpacer) {
				oToolbar.addContent(new ToolbarSpacer());
			}
		}
	};

	/**
	 * Adds the button to change between edit and read only mode if property <code>editTogglable</code> equals true
	 *
	 * @private
	 */
	SmartForm.prototype._addEditTogglableToToolbar = function() {
		var oCustomToolbar = this._getCustomToolbar();
		var oToolbar = oCustomToolbar || this._oToolbar;
		var that = this;
		var sIconSrc = this.getEditable() ? "sap-icon://display" : "sap-icon://edit";
		var sTooltip = this._oRb.getText(this.getEditable() ? "FORM_TOOLTIP_DISPLAY" : "FORM_TOOLTIP_EDIT");

		if (this.getEditTogglable()) {
			if (!this._oEditToggleButton) {
				this._oEditToggleButton = new Button(oToolbar.getId() + "-button-sfmain-editToggle", {
					type: ButtonType.Default,
					icon: sIconSrc,
					tooltip: sTooltip,
					press: function() {
						that._toggleEditMode();
					}
				});
			}

			oToolbar.addContent(this._oEditToggleButton);
		}
	};

	/**
	 * Sets the span of the GridData of group elements (LayoutData)
	 *
	 * @private
	 */
	SmartForm.prototype._propagateGridDataSpan = function() {
		var sSpan = this.getLayout().getGridDataSpan();
		var aGroups = this.getGroups();

		// set gridDataSpan to all group elements
		aGroups.forEach(function(oGroup) {

			var aElements = oGroup.getGroupElements();

			aElements.forEach(function(oElement) {

				var oLayout = oElement.getFields()[0].getLayoutData();

				if (oLayout) {
					oLayout.setSpan(sSpan);
				} else {
					oLayout = new sap.ui.layout.GridData({
						span: sSpan
					});
					oElement.getFields()[0].setLayoutData(oLayout);
				}

				if (oElement.getFields()[0] instanceof sap.m.VBox) {
					var oSmartField = oElement.getFields()[0].getItems()[1];
					if (oSmartField && oSmartField.setControlContext) {
						oSmartField.setControlContext(sap.ui.comp.smartfield.ControlContextType.SmartFormGrid);
					}
				}
			});
		});
	};

	/**
	 * Registers a resize handler to update the linebreaks
	 *
	 * @private
	 */
	SmartForm.prototype._registerResizeHandler = function() {

		if (this._resizeHandlerRegId) {
			return;
		}

		var that = this;
		var fResizeHandler = function() {

			var aGroups = that.getGroups();

			aGroups.forEach(function(oGroup) {
				oGroup._updateLineBreaks();
			});
		};
		this._resizeHandlerRegId = sap.ui.core.ResizeHandler.register(this._oForm, fResizeHandler);
	};

	/**
	 * Gets the span based on the current screen size
	 *
	 * @private
	 */
	SmartForm.prototype._getCurrentSpan = function() {
		var sSpan = this.getLayout().getGridDataSpan();
		var iCurrentSpan = 0;
		var aResult = [];

		if (this.getDomRef() && this._oForm) {
			if (this.getDomRef().clientWidth > this._oForm.getLayout().getBreakpointL()) {
				var L = /L([1-9]|1[0-2])/i;
				aResult = L.exec(sSpan);
				iCurrentSpan = aResult[1];
			} else if (this.getDomRef().clientWidth > this._oForm.getLayout().getBreakpointM()) {
				var M = /M([1-9]|1[0-2])/i;
				aResult = M.exec(sSpan);
				iCurrentSpan = aResult[1];
			} else {
				var S = /S([1-9]|1[0-2])/i;
				aResult = S.exec(sSpan);
				iCurrentSpan = aResult[1];
			}
		}
		return iCurrentSpan;
	};

	/**
	 * Change to edit/read only depending on the current state.
	 *
	 * @private
	 */
	SmartForm.prototype._toggleEditMode = function() {
		var bEditable = this.getEditable();
		this.setEditable(!bEditable);
	};

	/**
	 * Triggers the addition of the button for personalization to the toolbar, if change mode supported.
	 *
	 * @returns {Promise} the promise for flexibility settings
	 * @private
	 */
	SmartForm.prototype._addChangeModeToToolbar = function() {
		if (Settings.isFlexChangeMode() && Settings.isFlexibilityAdaptationButtonAllowed()) {
			return this._getAddChangeModelToToolbarPromise();
		}

		return Promise.resolve();
	};

	/**
	 * @returns {Promise} the promise for the addition of the toolbar modification.
	 * @private
	 */
	SmartForm.prototype._getAddChangeModelToToolbarPromise = function() {
		var that = this;
		var sComponentName = Utils.getComponentClassName(this);
		var mPropertyBag = {
			appDescriptor: Utils.getAppDescriptor(this),
			siteId: Utils.getSiteId(this)
		};

		var bIsFlexEnabled = this.getFlexEnabled();
		if (bIsFlexEnabled) {
			return Settings.getInstance(sComponentName, mPropertyBag).then(function(oSettings) {
				if (oSettings.isKeyUser() && Utils.checkControlId(that)) {
					that._setToolbarAndAddContent();
				}
			}, function(oError) {
			});
		} else {
			return Promise.resolve();
		}
	};

	SmartForm.prototype._setToolbarAndAddContent = function() {
		var oCustomToolbar = this._getCustomToolbar();
		var oToolbar = oCustomToolbar || this._oToolbar;

		if (!oToolbar || oToolbar.bIsDestroyed) {
			this._createToolbar();
			this._oToolbar.addStyleClass("titleBar");
			this._addHeaderToToolbar();
			oToolbar = this._oToolbar;
			this.invalidate();
		}

		oToolbar.addContent(new Button(this.getId() + "-" + oToolbar.getId() + "-AdaptationButton", {
			type: ButtonType.Default,
			icon: "sap-icon://action-settings",
			tooltip: this._oRb.getText("FORM_TOOLTIP_SETTINGS"),
			press: this._handleAdaptationButtonPress.bind(this)
		}));
	};

	SmartForm.prototype._handleAdaptationButtonPress = function() {
		var that = this;
		var oMetaModel = this.getModel().getMetaModel();
		oMetaModel.loaded().then(that._openAdaptationDialog.bind(that));
	};

	SmartForm.prototype._openAdaptationDialog = function() {
		jQuery.sap.require('sap.ui.comp.smartform.flexibility.FormP13nHandler');
		var handler = new sap.ui.comp.smartform.flexibility.FormP13nHandler();
		handler.init(this);
		handler.show();
	};

	/**
	 * Adds the button for checking.
	 *
	 * @private
	 */
	SmartForm.prototype._addCheckToToolbar = function() {
		if (!this.getEditable()) {
			return;
		}

		var oCustomToolbar = this._getCustomToolbar();
		var oToolbar = oCustomToolbar || this._oToolbar;
		var that = this;

		if (this.getCheckButton()) {
			oToolbar.addContent(new Button(this.getId() + "-" + oToolbar.getId() + "-button-sfmain-check", {
				type: ButtonType.Default,
				text: this._oRb.getText("SMART_FORM_CHECK"),
				press: function() {
					var aErroneousFields = [];
					aErroneousFields = that.check();
					that.fireChecked({
						erroneousFields: aErroneousFields
					});
				}
			}));
		}

	};

	/**
	 * Checks smart fields for client errors.
	 *
	 * @param {boolean} Determines is only visible fields in visible groups should be considered. default: <code>true</code>
	 * @returns {string[]} An array of fields with errors
	 * @public
	 */
	SmartForm.prototype.check = function(bConsiderOnlyVisible) {

		if (bConsiderOnlyVisible === undefined) {
			bConsiderOnlyVisible = true;
		}

		var aErroneousFields = this._checkClientError(bConsiderOnlyVisible);
		return aErroneousFields;
	};

	/**
	 * Check smart fields for client errors.
	 *
	 * @param {boolean} bConsiderOnlyVisible determines if only visible filters of visible groups should be considered. Default. <code>true</code>
	 * @returns {string[]} an array of fields with errors
	 * @private
	 */
	SmartForm.prototype._checkClientError = function(bConsiderOnlyVisible) {

		if (bConsiderOnlyVisible === undefined) {
			bConsiderOnlyVisible = true;
		}

		var aFields = this.getSmartFields(bConsiderOnlyVisible);
		var aErroneousFields = [];
		aFields.forEach(function(oField) {
			if (oField.checkClientError()) {

				if (bConsiderOnlyVisible && oField.getVisible) {
					if (!oField.getVisible()) {
						return;
					}
				}

				aErroneousFields.push(oField.getId());
			}
		});
		return aErroneousFields;
	};

	/**
	 * Adds a separator to the toolbar.
	 *
	 * @private
	 */
	SmartForm.prototype._addSeparatorToToolbar = function() {
		var oCustomToolbar = this._getCustomToolbar();
		var oToolbar = oCustomToolbar || this._oToolbar;
		oToolbar.addContent(new ToolbarSeparator());
	};

	/**
	 * Removes useless separators.
	 *
	 * @private
	 */
	SmartForm.prototype._removeSeparatorFromToolbar = function() {
		var oCustomToolbar = this._getCustomToolbar();
		var oToolbar = oCustomToolbar || this._oToolbar;
		var oContent = oToolbar.getContent();
		var oLastElement = null;
		var aRemoveElement = [];
		var i = 0;

		// remove last separator
		oLastElement = oContent[oContent.length - 1];
		if (oLastElement.getMetadata().getName() === "sap.m.ToolbarSeparator") {
			oToolbar.removeContent(oLastElement);
		}

		// remove superfluous separator
		oLastElement = null;
		for (i; i < oContent.length; i++) {
			if (oContent[i].getMetadata().getName() === "sap.m.ToolbarSeparator" && oLastElement.getMetadata().getName() != "sap.m.Button") {
				aRemoveElement.push(oContent[i]);
			}
			oLastElement = oContent[i];
		}
		for (i = 0; i < aRemoveElement.length; i++) {
			oToolbar.removeContent(aRemoveElement[i]);
		}
	};

	SmartForm.prototype._displayError = function(aErroneousFields) {
		var sErrorMessage, sErrorTitle;

		sErrorTitle = this._oRb.getText("FORM_CLIENT_CHECK_ERROR_TITLE");
		sErrorMessage = this._oRb.getText("FORM_CLIENT_CHECK_ERROR");

		MessageBox.show(sErrorMessage, {
			icon: MessageBox.Icon.ERROR,
			title: sErrorTitle,
			styleClass: (this.$() && this.$().closest(".sapUiSizeCompact").length) ? "sapUiSizeCompact" : ""
		});
	};

	/**
	 * Setter for property <code>editable</code>.
	 *
	 * @param {boolean} New value for property <code>editable</code>.
	 * @return {sap.ui.comp.smartform.SmartForm} <code>this</code> to allow method chaining.
	 * @public
	 */
	SmartForm.prototype.setEditable = function(bEditable) {
		var sTooltip;
		var bOldEditable = this.getEditable();
		if (bOldEditable === bEditable) {
			return this;
		}

		if (!bEditable && this.hasListeners("editToggled")) {
			var aErroneousFields = [];
			aErroneousFields = this.check(true);
			if (aErroneousFields && aErroneousFields.length > 0) {

				this._displayError(aErroneousFields);
				return this;
			}
		}

		this.setProperty("editable", bEditable);
		if (this._oForm) {
			this._oForm.setEditable(bEditable);
		}

		this.fireEditToggled({
			editable: bEditable
		});

		if (this._oEditToggleButton) {
			this._oEditToggleButton.setIcon(bEditable ? "sap-icon://display" : "sap-icon://edit");
			sTooltip = this._oRb.getText(bEditable ? "FORM_TOOLTIP_DISPLAY" : "FORM_TOOLTIP_EDIT");
			this._oEditToggleButton.setTooltip(sTooltip);
		}

		var aGroup = this.getGroups();
		aGroup.forEach(function(oGroup) {
			oGroup.setEditMode(bEditable);
		});

		this._bUpdateToolbar = true;
		return this;
	};

	/**
	 * Setter for property <code>editTogglable</code>. Default value is <code>undefined</code>.
	 *
	 * @param {boolean} New value for property <code>editTogglable</code>.
	 * @return {sap.ui.comp.smartform.SmartForm} <code>this</code> to allow method chaining.
	 * @public
	 */
	SmartForm.prototype.setEditTogglable = function(bTogglable) {
		this.setProperty("editTogglable", bTogglable);
		this._bUpdateToolbar = true;
		return this;
	};

	/**
	 * Setter for property <code>title</code>. Default value is <code>undefined</code>.
	 *
	 * @param {string} sTitle new value for property <code>title</code>.
	 * @return {sap.ui.comp.smartform.SmartForm} <code>this</code> to allow method chaining.
	 * @public
	 */
	SmartForm.prototype.setTitle = function(sTitle) {
		Control.prototype.setProperty.apply(this, [
			"title", sTitle
		]);
		this._oTitle.setText(sTitle);
		return this;
	};

	/**
	 * Setter for property <code>useHorizontalLayout</code>.
	 *
	 * @param {boolean} New value for property <code>useHorizontalLayout</code>.
	 * @return {sap.ui.comp.smartform.SmartForm} <code>this</code> to allow method chaining.
	 * @public
	 */
	SmartForm.prototype.setUseHorizontalLayout = function(bUseHorizontalLayout) {
		var oldUseHorizontalLayout = this.getProperty("useHorizontalLayout");

		if (oldUseHorizontalLayout !== bUseHorizontalLayout) {
			this.setProperty("useHorizontalLayout", bUseHorizontalLayout);

			if (bUseHorizontalLayout) {
				this.addStyleClass("sapUiCompSmartFormHorizontalLayout");
			} else {
				this.removeStyleClass("sapUiCompSmartFormHorizontalLayout");
			}

			// add groups
			var aGroup = this.getGroups();
			if (aGroup) {
				aGroup.forEach(function(oGroup) {
					oGroup.setUseHorizontalLayout(bUseHorizontalLayout);
				});
			}

			// new layout is created in OnBeforeRendering
			this._bisLayoutCreated = false;
		}

		return this;
	};

	SmartForm.prototype.setHorizontalLayoutGroupElementMinWidth = function(nMinWidth) {

		this.setProperty("horizontalLayoutGroupElementMinWidth", nMinWidth);

		// add groups
		var aGroup = this.getGroups();
		if (aGroup) {
			aGroup.forEach(function(oGroup) {
				oGroup.setHorizontalLayoutGroupElementMinWidth(nMinWidth);
			});
		}
		return this;
	};

	/**
	 * Returns the array of properties currently visible on the UI.
	 *
	 * @return {string[]} The properties currently visible
	 * @public
	 */
	SmartForm.prototype.getVisibleProperties = function() {

		var aProperty = [];

		var aGroup = this.getGroups();
		if (aGroup) {
			aGroup.forEach(function(oGroup) {
				var aGroupElement = oGroup.getGroupElements();
				if (aGroupElement) {
					aGroupElement.forEach(function(oGroupElement) {
						var aField = oGroupElement.getFields();
						if (aField) {
							aField.forEach(function(oField) {
								if (oField.getVisible()) {
									var sPath = oField.getBindingPath("value");
									if (sPath) {
										aProperty.push(sPath);
									}
								}
							});
						}
					});
				}
			});
		}

		return aProperty;

	};

	/**
	 * Setter for aggregation <code>customToolbar</code>. Default value is <code>undefined</code>.
	 *
	 * @param {sap.m.Toolbar} New value for aggregation <code>customToolbar</code>.
	 * @return {sap.ui.comp.smartform.SmartForm} <code>this</code> to allow method chaining.
	 * @public
	 */
	SmartForm.prototype.setCustomToolbar = function(oCustomToolbar) {
		if (oCustomToolbar) {
			oCustomToolbar.data('bIsSmartFormCustomToolbar', true);
		}

		this.setAggregation("customToolbar", oCustomToolbar);

		if (oCustomToolbar) {
			this._bUpdateToolbar = true;
		}
		return this;
	};

	/**
	 * Getter for aggregation <code>customToolbar</code>.
	 *
	 * @return {sap.m.Toolbar} The custom toolbar
	 * @public
	 */
	SmartForm.prototype.getCustomToolbar = function() {
		var oCustomToolbar = this._getCustomToolbar();
		return oCustomToolbar;
	};

	/**
	 * Determine CustomToolbar from own aggregation of from internal panel
	 *
	 * @return {sap.m.Toolbar} the custom toolbar
	 * @private
	 */
	SmartForm.prototype._getCustomToolbar = function() {
		var oCustomToolbar = this.getAggregation("customToolbar");
		if (!oCustomToolbar && this._oPanel) {
			oCustomToolbar = this._oPanel.getHeaderToolbar();
			if (!oCustomToolbar.data('bIsSmartFormCustomToolbar')) {
				oCustomToolbar = null;
			}
		}
		return oCustomToolbar;
	};

	/**
	 * Inserts a <code>group</code> into the aggregation named groups.
	 *
	 * @param {sap.ui.comp.smartform.Group} The group to insert
	 * @param {int} The 0-based index the group should be inserted at
	 * @return {sap.ui.comp.smartform.SmartForm} <code>this</code> to allow method chaining.
	 * @public
	 */
	SmartForm.prototype.insertGroup = function(oGroup, iIndex) {
		this.insertAggregation("groups", oGroup, iIndex);
		return this;
	};

	SmartForm.prototype.insertAggregation = function(sAggregationName, oObject, iIndex) {
		if (sAggregationName === "groups") {
			this._insertGroup(oObject, iIndex);
		} else {
			Control.prototype.insertAggregation.apply(this, arguments);
		}
	};

	/**
	 * Removes a <code>group</code> from the aggregation named groups.
	 *
	 * @param {sap.ui.comp.smartform.Group} The group to be removed
	 * @return {sap.ui.comp.smartform.SmartForm} <code>this</code> to allow method chaining.
	 * @public
	 */
	SmartForm.prototype.removeGroup = function(oGroup) {
		this.removeAggregation("groups", oGroup);
		return this;
	};

	SmartForm.prototype.removeAggregation = function(sAggregationName, oObject) {
		if (sAggregationName === "groups") {
			this._oForm.removeFormContainer(oObject);
		} else {
			Control.prototype.removeAggregation.apply(this, arguments);
		}
	};

	/**
	 * Destroys a <code>group</code> from the aggregation named groups.
	 *
	 * @return {sap.ui.comp.smartform.SmartForm} <code>this</code> to allow method chaining.
	 * @public
	 */
	SmartForm.prototype.destroyGroups = function() {
		this.destroyAggregation("groups");
		return this;
	};

	SmartForm.prototype.destroyAggregation = function(sAggregationName) {
		if (sAggregationName === "groups") {
			this._oForm.destroyFormContainers();
		} else {
			Control.prototype.insertAggregation.apply(this, arguments);
		}
	};

	/**
	 * Checks if the internal form control already exist and if not it will be created
	 *
	 * @private
	 */
	SmartForm.prototype._createForm = function() {
		if (!this._oForm) {
			this._oForm = new Form({
				"editable": this.getEditable()
			// if the form is NOT editable, only label / static texts are allowed -> no editable controls
			});
		}
	};

	/**
	 * Creates a layout for the internal form
	 *
	 * @private
	 */
	SmartForm.prototype._createLayout = function() {
		var oLayout = null;

		this._createForm();

		if (!this._bisLayoutCreated && this._oForm) {

			// Remove old existing layout from From
			oLayout = this._oForm.getLayout();
			if (oLayout) {
				oLayout.destroy();
			}

			// Create new layout based on grid or form
			if (this.mProperties["useHorizontalLayout"]) {
				if (this.getLayout() && this.getLayout().getGridDataSpan()) {
					oLayout = new sap.ui.layout.form.ResponsiveGridLayout({
						columnsL: 1,
						columnsM: 1
					});
					if (this.getLayout().getBreakpointM() > 0) {
						oLayout.setBreakpointM(this.getLayout().getBreakpointM());
					}
					if (this.getLayout().getBreakpointL() > 0) {
						oLayout.setBreakpointM(this.getLayout().getBreakpointL());
					}
				} else {
					oLayout = new sap.ui.layout.form.ResponsiveLayout();
				}
			} else {
				oLayout = this._getLayout();
			}
			this._oForm.setLayout(oLayout);
			this._bisLayoutCreated = true;
		}
	};

	/**
	 * Adds existing custom data to a given group instance
	 *
	 * @private
	 * @param {object} oGroup for which the custom data should be propagated
	 */
	SmartForm.prototype._addCustomData = function(oGroup) {
		var aCustomData = null;

		if (oGroup) {
			aCustomData = this.getCustomData();
			if (aCustomData && aCustomData.length > 0) {
				aCustomData.forEach(function(oCustomData) {
					oGroup.addCustomData(oCustomData.clone());
				});
			}
		}
	};

	/**
	 * Delegates the edit mode from the SmartForm to the given group
	 *
	 * @private
	 * @param {object} oGroup on which the editable property should be set
	 */
	SmartForm.prototype._delegateEditMode = function(oGroup) {
		if (oGroup) {
			oGroup.setEditMode(this.mProperties["editable"]);
		}
	};

	/**
	 * Inserts a given group to aggregation FormContainer in the internal Form instance at the given iIndex.
	 *
	 * @private
	 * @param {object} Group to be added
	 * @param {numeric} Position where group is inserted
	 */
	SmartForm.prototype._insertGroup = function(oGroup, iIndex) {

		// check if internal form exist and creates one if not
		this._createForm();

		// calculate index value if it is not given via interface
		if (iIndex === undefined || iIndex === null) {
			iIndex = this._oForm.getFormContainers().length;
		} else if (iIndex === -1) {
			iIndex = 0;
		}

		oGroup.setHorizontalLayoutGroupElementMinWidth(this.getHorizontalLayoutGroupElementMinWidth());
		oGroup.setUseHorizontalLayout(this.getUseHorizontalLayout());

		this._addCustomData(oGroup);
		this._delegateEditMode(oGroup);
		this._oForm.insertFormContainer(oGroup, iIndex);
	};

	/**
	 * Removes all the groups in the aggregation named groups.
	 *
	 * @return {sap.ui.comp.smartform.Group[]} an array of the removed groups (might be empty).
	 * @public
	 */
	SmartForm.prototype.removeAllGroups = function() {
		if (this._oForm) {
			this._oForm.removeAllFormContainers();
		}
		return this.removeAllAggregation("groups");
	};

	/**
	 * Generic method which is called, whenever an aggregation binding is changed. This method deletes all elements in this aggregation and recreates
	 * them according to the data model. In case a managed object needs special handling for a aggregation binding, it can create a typed
	 * update-method (e.g. "updateRows") which will be used instead of the default behaviour.
	 *
	 * @private
	 */
	SmartForm.prototype.updateAggregation = function(sAggregation) {

		Control.prototype.updateAggregation.apply(this, arguments);

		if (sAggregation === "groups") {
			this._updateClonedElements(this);
		}
	};

	/**
	 * Retrieves all the smart fields of the form.
	 *
	 * @param {boolean} Determines if only visible groups are considered; default is true
	 * @return {sap.ui.comp.smartfield.SmartField[]} An array of smart fields (might be empty).
	 * @public
	 */
	SmartForm.prototype.getSmartFields = function(bConsiderOnlyVisibleGroups) {
		var aGroups = [];
		var aGroupElements = [];
		var aElements = [];
		var aFields = [];
		var aSmartFields = [];

		if (bConsiderOnlyVisibleGroups === undefined) {
			bConsiderOnlyVisibleGroups = true;
		}

		aGroups = this.getGroups();

		aGroups.forEach(function(oGroup) {

			if (!bConsiderOnlyVisibleGroups || (bConsiderOnlyVisibleGroups && oGroup.getVisible())) {
				aGroupElements = oGroup.getGroupElements();

				aGroupElements.forEach(function(oGroupElement) {

					aFields = [];
					aElements = oGroupElement.getElements();

					aElements.forEach(function(oElement) {
						if (oElement instanceof sap.m.VBox) {
							aFields = aFields.concat(oElement.getItems());
						} else {
							aFields.push(oElement);
						}
					});

					aFields = aFields.filter(function(oField) {
						return oField instanceof sap.ui.comp.smartfield.SmartField;
					});

					aSmartFields = aSmartFields.concat(aFields);
				});
			}
		});

		return aSmartFields;
	};

	/**
	 * Clones the SmartForm control.
	 *
	 * @param {string} [sIdSuffix] A suffix to be appended to the cloned element id
	 * @param {string[]} [aLocalIds] An array of local IDs within the cloned hierarchy (internally used)
	 * @return {sap.ui.base.ManagedObject} A reference to the newly created clone
	 * @protected
	 */
	SmartForm.prototype.clone = function(sIdSuffix, aLocalIds) {
		var oClone = Control.prototype.clone.apply(this, arguments);

		var oAggregations = this.getMetadata().getAggregations();
		var sAggregation;
		var oAggregation;

		for (sAggregation in oAggregations) {
			oAggregation = this.getAggregation(sAggregation);

			// do not clone aggregation if aggregation is bound (already done by Control.prototype.clone); aggregation is filled on update
			// do not clone aggregation if already done by Control.prototype.clone
			if (this.getMetadata().hasAggregation(sAggregation) && !this.isBound(sAggregation) && ((oClone.getAggregation(sAggregation) === null) || oClone.getAggregation(sAggregation).length === 0)) {
				if (oAggregation instanceof sap.ui.base.ManagedObject) {
					oClone.addAggregation(sAggregation, oAggregation.clone(sIdSuffix, aLocalIds));
				} else if (jQuery.isArray(oAggregation)) {
					for (var i = 0; i < oAggregation.length; i++) {
						oClone.addAggregation(sAggregation, oAggregation[i].clone(sIdSuffix, aLocalIds));
					}

					if (sAggregation === "groups") {
						this._updateClonedElements(oClone);
					}

				} else if (oAggregation != null) {
					// must be an alt type
					oClone.setAggregation(sAggregation, oAggregation.clone(sIdSuffix, aLocalIds));
				}
			}
		}

		return oClone;
	};

	/**
	 * Updates controls in the hierarchy of a cloned smart form.
	 *
	 * @param {sap.ui.comp.smartform.SmartForm} The cloned smart form
	 * @protected
	 */
	SmartForm.prototype._updateClonedElements = function(oSmartForm) {
		var oField = null, oLabel = null;
		var aGroupElements = [];
		var aElements = [];
		var aFields = [];

		var aGroups = oSmartForm.getGroups();

		aGroups.forEach(function(oGroup) {

			aGroupElements = oGroup.getGroupElements();

			aGroupElements.forEach(function(oGroupElement) {

				// set the link between cloned SmartLabel and SmartField
				oField = oGroupElement._getFieldRelevantForLabel();
				oLabel = oGroupElement._getLabel();

				if (oField && oLabel) {
					oLabel.setLabelFor(oField);
				}

				// update registration for smart field events
				// cloned group elements still registered for template smart fields
				aElements = oGroupElement.getElements();

				aFields = [];

				aElements.forEach(function(oElement) {
					if (oElement instanceof sap.m.VBox) {
						aFields = aFields.concat(oElement.getItems());
					} else {
						aFields.push(oElement);
					}
				});

				aFields = aFields.filter(function(oField) {
					return !(oField instanceof Label);
				});

				aFields.forEach(function(oField) {

					if (oField.getEditable) {
						if (!oField.getEditable()) {
							oField.data("editable", false);
						}
					}
					if (oField.attachVisibleChanged) {
						oField.attachVisibleChanged(function(oEvent) {
							oGroupElement._updateFormElementVisibility();
						});
					}

					if (oField.attachContextEditableChanged) {
						oField.attachContextEditableChanged(function(oEvent) {
							oGroupElement._updateFormElementEditable(oEvent);
						});
					}

					if (oField.attachInnerControlsCreated) {
						oField.attachInnerControlsCreated(function(oEvent) {
							oGroupElement._updateFormElementLabel(oEvent);
						});
					}

				});
			});
		});

	};

	/**
	 * Cleans up the resources associated with this element and all its children.
	 *
	 * @public
	 */
	SmartForm.prototype.exit = function() {
		if (this._oForm) {
			this._oForm.destroy();
		}
		if (this._oPanel) {
			this._oPanel.destroy();
		}
		if (this._oTitle) {
			this._oTitle.destroy();
		}
		if (this._oToolbar) {
			this._oToolbar.destroy();
		}
		if (this._oEditToggleButton) {
			this._oEditToggleButton.destroy();
		}

		this._oForm = null;
		this._oPanel = null;
		this._oTitle = null;
		this._bUpdateToolbar = true;
		this._sResizeListenerId = "";
		this._oRb = null;
		this._oToolbar = null;
		this._oEditToggleButton = null;
		if (this._resizeHandlerRegId) {
			sap.ui.core.ResizeHandler.deregister(this._resizeHandlerRegId);
			this._resizeHandlerRegId = "";
		}
	};

	return SmartForm;

}, /* bExport= */true);
