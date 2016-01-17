/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.smartfield.SmartField.
sap.ui.define([ "jquery.sap.global", "sap/ui/comp/library", "./JSONControlFactory", "./ODataControlFactory", "./BindingUtil", "./SideEffectUtil", "./ODataHelper", "sap/ui/core/Control", "sap/ui/model/ParseException", "sap/ui/model/ValidateException" ], function(jQuery, library, JSONControlFactory, ODataControlFactory, BindingUtil, SideEffectUtil, ODataHelper, Control, ParseException, ValidateException) { //EXC_JSHINT_034  //EXC_JSHINT_037
	"use strict";

	/**
	 * Constructor for a new smartfield/SmartField.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The SmartField control is a wrapper for other controls. It interprets OData metadata to determine the control that has to be
	 *        instantiated. The OData entity is derived from the control's binding context. The OData entity's property that is changed or
	 *        displayed with the control is derived from the control's value property.
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartfield.SmartField
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SmartField = Control.extend("sap.ui.comp.smartfield.SmartField", /** @lends sap.ui.comp.smartfield.SmartField.prototype */ { metadata : {
		library : "sap.ui.comp",
		properties : {
			/**
			 * The value property keeps the current value of the control. If a binding expression is configured, this is used to determine the property of an OData entity.
			 */
			value : {type : "any", group : "Misc", defaultValue : null},

			/**
			 * Enables the control.
			 */
			enabled : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * The name of an entity set for which the control manages values. This is an optional property.
			 */
			entitySet : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Sets the control into an editable mode or a display mode.
			 */
			editable : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Notifies the control whether controls using the SmartField are editable or not.
			 * @since 1.31.0
			 */
			contextEditable : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * The width can be set to an absolute value.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

			/**
			 * Horizontal alignment of the text.
			 */
			textAlign : {type : "sap.ui.core.TextAlign", group : "Misc", defaultValue : sap.ui.core.TextAlign.Initial},

			/**
			 * Text shown when no value available.
			 */
			placeholder : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * To be used in the HTML code (for example, for HTML forms that send data to the server via 'submit').
			 */
			name : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Visualizes warnings or errors.
			 */
			valueState : {type : "sap.ui.core.ValueState", group : "Appearance", defaultValue : sap.ui.core.ValueState.None},

			/**
			 * The text which is shown in the value state message popup.
			 */
			valueStateText : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * The text which is shown in the value state message popup.
			 */
			showValueStateMessage : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Data types to be used, if the SmartField control is interacting with a JSON model. If the value property of the control is
			 * bound to a property of an OData entity set, this property is not considered.
			 * @deprecated Since 1.31.0
			 */
			jsontype : {type : "sap.ui.comp.smartfield.JSONType", group : "Misc", defaultValue : null},

			/**
			 * Mandatory property.
			 */
			mandatory : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Maximum number of characters. Value <code>0</code> means the feature is switched off.
			 */
			maxLength : {type : "int", group : "Misc", defaultValue : 0},

			/**
			 * If set to <code>true</code>, the suggestion feature for a hosted control is enabled, if the hosted control supports it.
			 */
			showSuggestion : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * If set to true, a value help indicator will be displayed inside the hosted control, if the hosted control supports this.
			 */
			showValueHelp : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * If set to false the label is not displayed.
			 */
			showLabel : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * This property contains the text of an associated smart label.
			 */
			textLabel : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * This property contains the tool tip of the associated smart label.
			 */
			tooltipLabel : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Visible state of the unit, if the SmartField control addresses unit of measure use cases, for example, an amount and its associated currency.
			 */
			uomVisible : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Editable state of the unit, if the SmartField control addresses unit of measure use cases, for example, an amount and its associated currency.
			 */
			uomEditable : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Enabled state of the unit, if the SmartField control addresses unit of measure use cases, for example, an amount and its associated currency.
			 */
			uomEnabled : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Contains a URL which is used to render a link. The link is rendered, if the OData property which the value property of the control is bound to is of type <code>Edm.String</code>
			 * and the Smart Field is in display mode.
			 */
			url : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * This property is for internal use only.
			 *
			 * @since 1.31.0
			 */
			uomEditState : {type : "int", group : "Misc", defaultValue : -1},

			/**
			 * Defines in which context the layout of the smart field has to be interpreted.
			 *
			 * @since 1.31.0
			 */
			controlContext : {type : "sap.ui.comp.smartfield.ControlContextType", group : "Misc", defaultValue : sap.ui.comp.smartfield.ControlContextType.None},

			/**
			 * Proposes a control to be rendered. The smart field may ignore the proposal.
			 *
			 * @since 1.31.0
			 */
			proposedControl : {type : "sap.ui.comp.smartfield.ControlProposalType", group : "Misc", defaultValue : sap.ui.comp.smartfield.ControlProposalType.None}
		},
		aggregations : {
			/**
			 * The content aggregation is used to hold the control that is hosted by the SmartField control.
			 */
			_content : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"},

			/**
			 * Optional configuration for SmartField.
			 */
			configuration : {type : "sap.ui.comp.smartfield.Configuration", multiple : false}
		},
		events : {
			/**
			 * The OData entity set is either derived from the control's binding context or from control's entity set property, if a
			 * value for it is specified. In both cases this event is fired.
			 */
			entitySetFound : {},

			/**
			 * The event is fired after the text in the field has changed and the focus leaves the TextField or Enter is pressed.
			 */
			change : {},

			/**
			 * The event is fired after the smart field has calculated its metadata.
			 */
			initialise : {},

			/**
			 * The event is fired after the visibility of the control has changed.
			 */
			visibleChanged: {},

			/**
			 * The event is fired after the value of editable property of the control has changed.
			 *
			 * @since 1.30.0
			 */
			editableChanged: {},

			/**
			 * The event is fired after the context editable property of the control has changed.
			 *
			 * @since 1.31.0
			 */
			contextEditableChanged: {},

			/**
			 * The event is fired after the inner controls have been created.
			 */
			innerControlsCreated: {},

			/**
			 * The event is fired when after selection of values with value help or auto-suggest, the model is updated with the selected data.
			 *
			 * @since 1.31.0
			 */
			valueListChanged: {}
		}
	}});

	/**
	 * Returns the Edm data type of either the OData property to which the value property of the control is bound or the data
	 * type of the attribute in the JSON model used. If no model is available null is returned.
	 *
	 * @name sap.ui.comp.smartfield.SmartField#getDataType
	 * @function
	 * @type string
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * If the control's value property is bound to an OData property that semantically represents a unit of measure, the value of the current unit of measure is returned.
	 * Otherwise <code>null</code> is returned.
	 *
	 * @name sap.ui.comp.smartfield.SmartField#getUnitOfMeasure
	 * @function
	 * @type string
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * If the control's value property is bound to an OData property that semantically represents a unit of measure, the value of the current unit of measure can be changed.
	 *
	 * @name sap.ui.comp.smartfield.SmartField#setUnitOfMeasure
	 * @function
	 * @param {string} sSUnit
	 *         The new unit of measure to be set.
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Initialize the control.
	 *
	 * @private
	 */
	SmartField.prototype.init = function() {
		this._oSideEffects = new SideEffectUtil(this);
		this._oFactory = null;
		this._oControl = {
			display: null,
			edit: null,
			current: null
		};
		this._oValue = {
			display: null,
			edit: null,
			uom: null,
			uomset: null
		};
		this._oError = {
			bComplex: false,
			bFirst: false,
			bSecond: false
		};
		this._oValueBind = null;
		this._oUtil = new BindingUtil();
	};

	/**
	 * Setter for property <code>visible</code>. Default value is <code>true</code>.
	 *
	 * @param {boolean} bValue New value for property <code>editable</code>
	 * @param {boolean} bSuppressInvalidate If <code>true</code>, the managed object is not marked as changed
	 * @return {sap.ui.comp.smartfield.SmartField} <code>this</code> to allow method chaining
	 * @public
	 */
	SmartField.prototype.setVisible = function(bValue, bSuppressInvalidate) {  //EXC_JSHINT_002
		Control.prototype.setVisible.apply(this, arguments);
		this.fireVisibleChanged({
			visible: bValue
		});
		return this;
	};

	/**
	 * Setter for property <code>editable</code>. Default value is <code>false</code>.
	 *
	 * @param {boolean} bValue New value for property <code>editable</code>
	 * @return {sap.ui.comp.smartfield.SmartField} <code>this</code> to allow method chaining
	 * @public
	 */
	SmartField.prototype.setEditable = function(bValue) {
		this.setProperty("editable", bValue, true);
		this._toggleControl();
		this.fireEditableChanged({
			editable: bValue
		});
		return this;
	};

	/**
	 * Setter for property <code>contextEditable</code>. Default value is <code>false</code>.
	 *
	 * @param {boolean} bValue New value for property <code>editable</code>
	 * @return {sap.ui.comp.smartfield.SmartField} <code>this</code> to allow method chaining
	 * @public
	 * @since 1.31.0
	 */
	SmartField.prototype.setContextEditable = function(bValue) {
		this.setProperty("contextEditable", bValue, true);
		this._toggleControl();
		this.fireContextEditableChanged({
			editable: bValue
		});
		return this;
	};

	/**
	 * Setter for property <code>width</code>.
	 *
	 * @param {string} sWidth The new value for property <code>width</code>
	 * @return {sap.ui.comp.smartfield.SmartField} <code>this</code> to allow method chaining
	 * @public
	 */
	SmartField.prototype.setWidth = function(sWidth) {
		this.setProperty("width", sWidth, true);
		this._setWidthOnInnerControl();
		return this;
	};

	/**
	 * Sets the SmartField's width to the inner control
	 *
	 * @return {sap.ui.comp.smartfield.SmartField} <code>this</code> to allow method chaining
	 * @private
	 */
	SmartField.prototype._setWidthOnInnerControl = function() {
		var oChild, sWidth;

		oChild = this.getAggregation("_content");

		if (oChild && oChild.setWidth) {
			sWidth = this.getWidth();

			// set the width if and only if a value other than the default is available (default is "")
			// the problem is that some controls (e.g. sap.m.Select and sap.m.ComboBox) have a width set during creation
			// we do not want to invalidate this.
			// if there are problems, always check these controls.
			if (sWidth) {
				oChild.setWidth(sWidth);
			}
		}

		return this;
	};

	/**
	 * Setter for property <code>url</code>. Default value is <code>null</code>.
	 *
	 * @param {string} sValue The new value for property <code>url</code>
	 * @return {sap.ui.comp.smartfield.SmartField} <code>this</code> to allow method chaining
	 * @since 1.29
	 * @public
	 */
	SmartField.prototype.setUrl = function(sValue) {
		this.setProperty("url", sValue, true);
		return this;
	};

	/**
	 * Setter for property <code>entitySet</code>. Default value is <code>undefined</code>.
	 *
	 * @param {string} sValue The new value for property <code>entitySet</code>
	 * @return {sap.ui.comp.smartfield.SmartField} <code>this</code> to allow method chaining
	 * @public
	 */
	SmartField.prototype.setEntitySet = function(sValue) {
		this.setProperty("entitySet", sValue, true);
		this.fireEntitySetFound({
			entitySet: sValue
		});
		return this;
	};

	/**
	 * Setter for property <code>enabled</code>. Default value is <code>true</code>.
	 *
	 * @param {boolean} bValue The new value for property <code>enabled</code>.
	 * @return {sap.ui.comp.smartfield.SmartField} <code>this</code> to allow method chaining
	 * @public
	 */
	SmartField.prototype.setEnabled = function(bValue) {
		this.setProperty("enabled", bValue, true);
		this._toggleControl();
		return this;
	};

	/**
	 * Returns the value of the <code>value</code> property.
	 *
	 * @return {any} The value of the property
	 * @public
	 */
	SmartField.prototype.getValue = function() {
		var sProp, fProp;

		// as two-way-binding cannot be assumed to be a prerequisite,
		// check for a call-back and return the current value.
		sProp = this._getMode();
		fProp = this._oValue[sProp];

		if (fProp) {
			return fProp();
		}

		// as fall-back return the property value.
		return this.getProperty("value");
	};

	/**
	 * Getter for property <code>valueState</code>. Default value is <code>None</code>.
	 *
	 * @return {sap.ui.core.ValueState} The property value
	 * @public
	 */
	SmartField.prototype.getValueState = function() {
		var aChildren, iIndex;

		aChildren = this.getInnerControls();
		iIndex = this._getMaxSeverity(aChildren);

		if (iIndex > -1) {
			return aChildren[iIndex].getValueState();
		}

		return sap.ui.core.ValueState.None;
	};

	/**
	 * Setter for property <code>valueState</code>. Default value is <code>None</code>.
	 *
	 * @param {sap.ui.core.ValueState} sValueState The new value for property <code>valueState</code>
	 * @return {sap.ui.comp.SmartField} <code>this</code> to allow method chaining
	 * @since 1.30.0
	 * @public
	 */
	SmartField.prototype.setValueState = function(sValueState) {
		var aChildren, oChild, sMethod = "setSimpleClientError";

		aChildren = this.getInnerControls();

		if (aChildren && aChildren.length) {
			oChild = aChildren[0];

			if (aChildren.length > 1) {
				sMethod = "setComplexClientErrorFirstOperand";
			}
		}

		// forward the value state to the child control.
		// in unit of measure use cases and generally, if more than one control is hosted,
		// set a possible error on the first child.
		if (oChild && oChild.setValueState) {
			oChild.setValueState(sValueState);
			this[sMethod](sValueState === sap.ui.core.ValueState.Error);
		}

		return this;
	};

	/**
	 * Getter for property <code>valueStateText</code>. Default value is empty/<code>undefined</code>.
	 *
	 * @return {string} The property value
	 * @public
	 */
	SmartField.prototype.getValueStateText = function() {
		var aChildren, iIndex;

		aChildren = this.getInnerControls();
		iIndex = this._getMaxSeverity(aChildren);

		if (iIndex > -1) {
			return aChildren[iIndex].getValueStateText();
		}

		return this.getProperty("valueStateText");
	};

	/**
	 * Setter for property <code>valueStateText</code>. Default value is empty/<code>undefined</code>.
	 *
	 * @param {string} sText The new value for property <code>valueStateText</code>
	 * @return {sap.ui.comp.SmartField} <code>this</code> to allow method chaining
	 * @since 1.29
	 * @public
	 */
	SmartField.prototype.setValueStateText = function(sText) {
		var aChildren, oChild;

		aChildren = this.getInnerControls();

		if (aChildren && aChildren.length) {
			oChild = aChildren[0];
		}

		// forward the value state to the child control.
		// in unit of measure use cases and generally, if more than one control is hosted,
		// set a possible error on the first child.
		if (oChild && oChild.setValueStateText) {
			oChild.setValueStateText(sText);
		}

		return this;
	};

	/**
	 * Calculates the index of the child control with the most severe message.
	 *
	 * @param {array} aChildren The currently available child controls
	 * @returns {integer} The index of the child control with the most severe message, can be <code>-1</code>
	 * @private
	 */
	SmartField.prototype._getMaxSeverity = function(aChildren) {
		var oState, oChild, i, len, iState = 0, iIndex = -1, mState = {
			"Error": 3,
			"Warning": 2,
			"Success": 1,
			"None": 0
		};

		len = aChildren.length;

		for (i = 0; i < len; i++) {
			oChild = aChildren[i];

			if (oChild.getValueState) {
				oState = oChild.getValueState();

				if (oState && mState[oState] > iState) {
					iState = mState[oState];
					iIndex = i;
				}
			}
		}

		return iIndex;
	};

	/**
	 * Returns the DOM element that gets the focus.
	 *
	 * @returns {sap.ui.core.Element} The DOM element that should get the focus, can be <code>null</code>
	 * @public
	 */
	SmartField.prototype.getFocusDomRef = function() {
		var aChildren, oChild, len;

		aChildren = this.getInnerControls();
		len = aChildren.length;

		if (len > 0) {
			oChild = aChildren[0];
		}

		if (oChild && oChild.getFocusDomRef) {
			return oChild.getFocusDomRef();
		}

		return sap.ui.core.Element.prototype.getFocusDomRef.apply(this, []);
	};

	/**
	 * Updates the binding context of this object and all aggregated children.
	 *
	 * @param {boolean} bSkipLocal If set to <code>true</code>, the binding context of this object is not updated, aggregated children are
	 *        considered
	 * @param {boolean} bSkipChildren If set to <code>true</code>, the binding context of aggregated children is not updated
	 * @param {string} sModelName The optional name of a specific model to update
	 * @param {boolean} bUpdateAll If set to <code>true</code>, all known models are used for the update
	 * @private
	 */
	SmartField.prototype.updateBindingContext = function(bSkipLocal, bSkipChildren, sModelName, bUpdateAll) {
		this._init(sModelName);

		if (this._oFactory) {
			if (this._oFactory.bind) {
				this._oFactory.bind();
			} else {
				this._toggleControl();
			}
		}

		Control.prototype.updateBindingContext.apply(this, [
			bSkipLocal, bSkipChildren, sModelName, bUpdateAll
		]);
	};

	/**
	 * Returns the current SmartField's edit mode
	 *
	 * @returns {string} Returns "edit" or "display" or "display_uom"
	 * @private
	 */
	SmartField.prototype._getMode = function() {
		var bEditable = this.getEditable(), bEnabled = this.getEnabled(), bContextEditable = this.getContextEditable();

		// check for configuration.
		if (this.getControlContext() === "responsiveTable" && this.data("suppressUnit") !== "true") {
			// somehow the control is disabled
			if (!bEditable || !bContextEditable || !bEnabled || (this.getUomEditState() === 0)) {
				return "display_uom";
			}
		}

		return bEditable && bEnabled && bContextEditable ? "edit" : "display";
	};

	/**
	 * Sets the current control, depending on <code>displayMode</code> and the binding of the <code>value</code> property of the current control. If
	 * necessary a control is created.
	 *
	 * @private
	 */
	SmartField.prototype._toggleControl = function() {
		var sMode, oValue, oConfig, bCreate = true;

		sMode = this._getMode();

		if (sMode === "edit" || sMode === "display_uom") { // always create control if in edit mode
			// _createControl sets the current mode.
			this._createControl(sMode);
		} else {
			oValue = this.getValue();

			// optimization for table use cases only.
			// if it is not a table, no configuration data set.
			oConfig = this.data("configdata");

			if (oConfig && oConfig.configdata && !oConfig.configdata.isUOM) {
				if (oValue === null || oValue === "") {
					bCreate = false;
				}
			}

			if (bCreate) { // in display mode, only create control if value is not empty
				// _createControl sets the current mode.
				this._createControl(sMode);
			} else {
				this.setAggregation("_content", null); // if value is empty, our content has to be null
				// better set the current mode, otherwise toggling gets out-of-sync.
				this._oControl.current = "display";
			}
		}

		this._setWidthOnInnerControl();
	};

	/**
	 * Setter for property <code>value</code>. Default value is <code>true</code>.
	 *
	 * @param {object} oValue The new value for property <code>value</code>
	 * @return {sap.ui.comp.smartfield.SmartField} <code>this</code> to allow method chaining
	 * @public
	 */
	SmartField.prototype.setValue = function(oValue) {
		var oReturnValue = this.setProperty("value", oValue);

		if (this._oFactory && !this._oFactory.bPending) {
			this._toggleControl();
		}

		return oReturnValue;
	};

	/**
	 * Creates the actual control depending on the current edit mode and sets it to the SmartField's content
	 *
	 * @param {string} sMode The current edit mode, either "edit" or "display"
	 * @private
	 */
	SmartField.prototype._createControl = function(sMode) {
		var oControl;

		if (this._oFactory) {
			if (sMode !== this._oControl.current || !this._oControl[sMode]) {
				if (!this._oControl[sMode]) {
					// create the control and set it.
					oControl = this._oFactory.createControl();

					if (oControl) {
						this._oControl[sMode] = oControl.control;
						this._placeCallBacks(oControl, sMode);
					}
				}

				// set the content.
				this._oControl.current = sMode;
				this.setAggregation("_content", this._oControl[sMode]);

				this.fireInnerControlsCreated(this.getInnerControls());
			} else {
				if (!this.getAggregation("_content")) {
					this.setAggregation("_content", this._oControl[sMode]);
				}
			}
		}
	};

	/**
	 * Sets the available call-backs after successful control creation.
	 *
	 * @param {sap.ui.core.Control} oControl The given control
	 * @param {string} sMode The current mode, either "edit" or "display"
	 * @private
	 */
	SmartField.prototype._placeCallBacks = function(oControl, sMode) {
		// set the value call-back.
		if (oControl.params && oControl.params.getValue) {
			this._oValue[sMode] = oControl.params.getValue;
		}

		// set the unit-of-measure-get call-back.
		if (oControl.params && oControl.params.uom) {
			this._oValue.uom = oControl.params.uom;
		}

		// set the unit-of-measure-set call-back.
		if (oControl.params && oControl.params.uomset) {
			this._oValue.uomset = oControl.params.uomset;
		}
	};

	/**
	 * Initializes the control, if it has not already been initialized.
	 *
	 * @param {string} sModelName The name of the model currently used
	 * @private
	 */
	SmartField.prototype._init = function(sModelName) {
		var oModel, oBindingInfo, oConfig;

		if (!this._oFactory) {
			oConfig = this.data("configdata");

			if (!oConfig) {
				oModel = this.getModel(sModelName);
			}

			oBindingInfo = this._getBindingInfo(sModelName, "value");

			if (oBindingInfo) {
				if (oConfig || oModel) {
					this._oFactory = this._createFactory(sModelName, oModel, oBindingInfo, oConfig);
				}
			} else if (oModel && !(oModel instanceof sap.ui.model.json.JSONModel)) {
				if (this.getBindingInfo("url") || this.getUrl()) {
					if (oConfig || oModel) {
						this._oFactory = this._createFactory(sModelName, oModel, oBindingInfo, oConfig);
					}
				}
			}
		}
	};

	/**
	 * Creates the control factory and returns it. If the variable <code>oModel</code> is <code>null</code> or <code>undefined</code>,
	 * <code>null</code> is returned.
	 *
	 * @param {string} sModelName The name of the model currently used
	 * @param {sap.ui.model.Model} oModel The model currently used
	 * @param {object} oBindingInfo The binding information from the control for the <code>value</code> property
	 * @param {object} oConfig Optional control configuration
	 * @returns {sap.ui.comp.smartfield.ControlFactoryBase} the new control factory instance
	 * @private
	 */
	SmartField.prototype._createFactory = function(sModelName, oModel, oBindingInfo, oConfig) {
		var sEntitySet, oParam;

		// check whether JSONControlFactoryl can be created.
		if (oModel && oModel instanceof sap.ui.model.json.JSONModel) {
			return new JSONControlFactory(oModel, this, {
				model: sModelName,
				path: oBindingInfo.path
			});
		}

		// check whether ODataControlFactory can be created.
		if (!oConfig) {
			sEntitySet = this._getEntitySet(sModelName);
		}

		if (sEntitySet || oConfig) {
			if (oConfig) {
				oParam = oConfig.configdata;
			} else {
				oParam = {
					entitySet: sEntitySet,
					model: sModelName,
					path: (oBindingInfo && oBindingInfo.path) ? oBindingInfo.path : ""
				};
			}

			return new ODataControlFactory(oModel, this, oParam);
		}

		return null;
	};

	/**
	 * Calculates the <code>entitySet</code> that is interpreted by this control. The calculation uses either the <code>bindingContext</code> of this
	 * control or alternatively the property <code>entitySet</code>.
	 *
	 * @param {string} sModelName The name of the model currently used
	 * @returns {string} The <code>entitySet</code> that is interpreted by this control
	 * @private
	 */
	SmartField.prototype._getEntitySet = function(sModelName) {
		var oBindingContext, sEntitySet;

		// check the entity set property.
		sEntitySet = this.getEntitySet();

		if (sEntitySet && !sModelName) {
			return sEntitySet;
		}

		// take the entity set from the binding context.
		oBindingContext = this.getBindingContext(sModelName);

		if (oBindingContext) {
			// check for a defective binding.
			if (!oBindingContext.sPath || (oBindingContext.sPath && oBindingContext.sPath === "/undefined")) {
				return null;
			}

			sEntitySet = this._oUtil.correctPath(oBindingContext.sPath);
			this.fireEntitySetFound({
				entitySet: sEntitySet
			});

			return sEntitySet;
		}

		return null;
	};

	/**
	 * Returns the binding information for the given property or aggregation. The binding information contains information about path, binding object,
	 * format options, sorter, filter etc. for the property or aggregation.
	 *
	 * @param {string} sModel The optional name of a specific model to update
	 * @param {string} sName The name of the property or aggregation
	 * @returns {object} Binding information of the value binding of this control, if the model is the appropriate one, <code>null</code> otherwise
	 * @private
	 */
	SmartField.prototype._getBindingInfo = function(sModel, sName) {
		if (!this._oValueBind) {
			this._oValueBind = this.getBindingInfo(sName);

			try {
				this._oValueBind = this._oValueBind.parts[0];
			} catch (ex) {
				// ignore
			}
		}

		if (this._oValueBind) {
			if (!this._oValueBind.model && !sModel) {
				return this._oValueBind;
			}

			if (this._oValueBind.model === sModel) {
				return this._oValueBind;
			}
		}

		return null;
	};

	/**
	 * Returns the EDM data type of the OData property to which the value property of the control is bound to.
	 * If no model or no OData property is available <code>null</code> is returned.
	 *
	 * @returns {string} The data type to which the value property is bound.
	 * @public
	 */
	SmartField.prototype.getDataType = function() {
		var oProp;

		if (this._oFactory) {
			// only ODataControlFactory has the method getDataType.
			if (this._oFactory.getDataProperty) {
				oProp = this._oFactory.getDataProperty();

				if (oProp) {
					return oProp.property.type;
				}
			}

			return this.getJsonType();
		}

		return null;
	};

	/**
	 * Returns the OData property to which the <code>value</code> property of the control is bound.
	 *
	 * @returns {object} The OData property.
	 * @public
	 */
	SmartField.prototype.getDataProperty = function() {
		if (this._oFactory) {
			// only ODataControlFactory has the method getDataProperty.
			if (this._oFactory.getDataProperty) {
				return this._oFactory.getDataProperty();
			}

			return null;
		}

		return null;
	};

	/**
	 * If the OData property to which the control's value property is bound semantically represents a unit of measure, the value of the current unit of measure
	 * is returned. Otherwise <code>null</code> is returned.
	 *
	 * @returns {any} The current unit of measure is returned, which can be <code>null</code
	 * @public
	 */
	SmartField.prototype.getUnitOfMeasure = function() {
		if (this._oValue.uom) {
			return this._oValue.uom();
		}

		return null;
	};

	/**
	 * If the OData property the control's value property is bound to semantically represents a unit of measure, the value of the current unit of measure
	 * can be changed.
	 *
	 * @param {string} sUnit The new unit of measure to be set.
	 * @public
	 */
	SmartField.prototype.setUnitOfMeasure = function(sUnit) {
		if (sUnit && this._oValue.uomset) {
			this._oValue.uomset(sUnit);
		}
	};

	/**
	 * Marks the SmartField control as having a client error.
	 *
	 * @param {boolean} bError If set to <code>true</code> the field is marked as having an error
	 * @private
	 */
	SmartField.prototype.setSimpleClientError = function(bError) {
		this._oError.bFirst = bError;
	};

	/**
	 * Marks the SmartField control as having a client error.
	 *
	 * @param {boolean} bError If set to <code>true</code> the field is marked as having an error
	 * @private
	 */
	SmartField.prototype.setComplexClientErrorFirstOperand = function(bError) {
		this._oError.bComplex = true;
		this._oError.bFirst = bError;
	};

	/**
	 * Marks the SmartField control as having a client error.
	 *
	 * @param {boolean} bError If set to <code>true</code> the field is marked as having an error
	 * @private
	 */
	SmartField.prototype.setComplexClientErrorSecondOperand = function(bError) {
		this._oError.bComplex = true;
		this._oError.bSecond = bError;
	};

	/**
	 * Marks the SmartField control as having a client error.
	 *
	 * @param {boolean} bError If set to <code>true</code> the field is marked as having an error
	 * @private
	 */
	SmartField.prototype.setComplexClientErrorSecondOperandNested = function(bError) {
		var oParent = this.getParent().getParent();
		oParent.setComplexClientErrorSecondOperand(bError);
	};

	/**
	 * Returns whether a client error has been detected.
	 *
	 * @returns {boolean} <code>true</code>, if a client error has been detected, <code>false</code> otherwise
	 * @private
	 */
	SmartField.prototype._hasClientError = function() {
		if (this._oError.bComplex) {
			return this._oError.bFirst || this._oError.bSecond;
		}

		return this._oError.bFirst;
	};

	/**
	 * Returns whether a client error has been detected. Additionally the error message is shown, if
	 * this is not the case already.
	 *
	 * @returns {boolean} <code>true</code>, if a client error has been detected, <code>false</code> otherwise
	 * @public
	 */
	SmartField.prototype.checkClientError = function() {
		var aChildren, len, i;

		// in display mode: no error.
		if (this._getMode() === "display") {
			return false;
		}

		// a client error has already been detected.
		if (this._hasClientError()) {
			return true;
		}

		// check again.
		aChildren = this.getInnerControls();
		len = aChildren.length;

		for (i = 0; i < len; i++) {
			this._checkClientError(aChildren[i]);
		}

		// return a possibly detected error.
		return this._hasClientError();
	};

	/**
	 * Checks for a client error on the given control. Additionally the error message is shown, if this is not the case already.
	 *
	 * @param {sap.ui.core.Control} oControl The control to be checked
	 * @private
	 */
	SmartField.prototype._checkClientError = function(oControl) {
		var sValue = null, oType = null, oParsedValue = null;

		var oBind, sMethod, sParam, mParameters = {
			"sap.m.Input": "value",
			"sap.m.DatePicker": "value",
			"sap.m.ComboBox": "selectedKey"
		};

		if (oControl) {
			sParam = mParameters[oControl.getMetadata()._sClassName];
		}

		if (sParam) {
			oBind = oControl.getBinding(sParam);
		}

		if (oBind) {
			try {
				sMethod = "get" + sParam.substring(0, 1).toUpperCase() + sParam.substring(1);
				sValue = oControl[sMethod]();
				oType = oBind.getType();
				if (oBind.sInternalType) {
					oParsedValue = oType.parseValue(sValue, oBind.sInternalType);
					oType.validateValue(oParsedValue);
				}
			} catch (ex) {
				if (ex instanceof ParseException) {
					oControl.fireParseError({
						exception: ex
					});
				}

				if (ex instanceof ValidateException) {
					oControl.fireValidationError({
						exception: ex
					});
				}
			}
		}
	};

	/**
	 * Returns whether the current control context points to a table.
	 *
	 * @returns {boolean} <code>true</code> if the current SmartField control is used inside a table, <code>false</code> otherwise
	 */
	SmartField.prototype.isContextTable = function() {
		return (this.getControlContext() === "responsiveTable" || this.getControlContext() === "table" || this.getControlContext() === "smartFormGrid");
	};

	/**
	 * Resolves the controls hosted currently by this SmartField.
	 *
	 * @returns {array} The controls hosted currently by this SmartField
	 * @public
	 */
	SmartField.prototype.getInnerControls = function() {
		var oContent, fContent, mComplex = {
			"sap.m.HBox": function(oControl) {
				var oChild, aItems, len = 0;

				aItems = oControl.getItems();

				if (aItems) {
					len = aItems.length;
				}

				if (len === 0) {
					return [];
				}

				if (len === 1) {
					return [ aItems[0] ];
				}

				oChild = aItems[1].getAggregation("_content");

				if (oChild) {
					return [ aItems[0], oChild ];
				}

				return [ aItems[0] ];
			},
			"sap.ui.comp.navpopover.SmartLink": function(oControl) {
				var oItem = oControl.getAggregation("innerControl");

				if (oItem) {
					return [ oItem ];
				}

				return [];
			}
		};

		oContent = this.getAggregation("_content");

		if (oContent) {
			fContent = mComplex[oContent.getMetadata()._sClassName];
		}

		if (fContent) {
			return fContent(oContent);
		}

		if (oContent) {
			return [ oContent ];
		}

		return [];
	};

	//
	// The function is called when the rendering of the control is completed.
	//
	// @public
	//
/*
	SmartField.prototype.onAfterRendering = function() {
		var oView, oMetaData, sMode = this._getMode();

		// base class.
		if (Control.prototype.onAfterRendering) {
			Control.prototype.onAfterRendering.apply(this);
		}

		if (this.getUseSideEffects() && this._oFactory && this._oFactory.getMetaData && sMode === "edit" && !this._bSideEffects) {
			this._bSideEffects = true;

			// get the parent view.
			oView = this._getView();

			// now set the field group ids.
			if (oView) {
				oMetaData = this._oFactory.getMetaData();

				if (oMetaData) {
					this._setFieldGroup(oMetaData, oView);
				}
			}
		}
	};
*/
	//**
	// * Sets the field group ID according to the side effects annotation.
	// *
	// * @param {object} oMetaData the meta data used to create the control
	// * @param {object} oMetaData.entitySet the OData entity set definition
	// * @param {object} oMetaData.entityType the OData entity type definition
	// * @param {object} oMetaData.property the OData property definition
	// * @param {string} oMetaData.path the binding path
	// * @param {sap.ui.core.mvc.View} oView the current view
	// * @private
	// */
/*
	SmartField.prototype._setFieldGroup = function(oMetaData, oView) {
		var aControls, sID = this._oSideEffects.getFieldGroupID(oMetaData, oView);

		if (sID) {
			aControls = this.getInnerControls();

			if (aControls.length) {
				aControls[0].setFieldGroupIds([ sID ]);
				//len = aControls.length;
				//
				//for (i = 0; i < len; i++) {
				//	aControls[i].setFieldGroupIds([ sID ]);
				//}
			}
		}
	};
*/
	//
	// * Returns the current view instance.
	// *
	// * @returns {sap.ui.core.mvc.View} the current view instance or <code>null</code>.
	// */
/*
	SmartField.prototype._getView = function() {
		var oObj = this.getParent();

		while (oObj) {
			if (oObj instanceof sap.ui.core.mvc.View) {
				return oObj;
			}

			oObj = oObj.getParent();
		}

		return null;
	};
*/
	/**
	 * Cleans up the resources associated with this element and all its children.
	 *
	 * @private
	 */
	SmartField.prototype.exit = function() {
		var oInactiveInnerControl = null;

		if (this._oSideEffects) {
			this._oSideEffects.destroy();
		}

		if (this._oUtil) {
			this._oUtil.destroy();
		}

		if (this._oFactory) {
			this._oFactory.destroy();
		}

		if (this._getMode() === "edit") {
			oInactiveInnerControl = this._oControl["display"]; // EXC_JSHINT_018
		} else {
			oInactiveInnerControl = this._oControl["edit"]; // EXC_JSHINT_018
		}

		if (oInactiveInnerControl && oInactiveInnerControl.destroy) {
			oInactiveInnerControl.destroy();
		}

		this._oUtil = null;
		this._oError = null;
		this._oValue = null;
		this._oFactory = null;
		this._oControl = null;
		this._oValueBind = null;
		this._oSideEffects = null;
	};

	/**
	 * Calculates the paths to the annotations used by the SmartField.
	 *
	 * @param {sap.ui.model.odata.ODataMetaModel} oMetaModel The given OData meta model
	 * @param {object} oEntitySet The given entity set
	 * @param {string} sValueBinding The path identifying the OData property the value property of the SmartField is bound to
	 * @param {bolean} bNavigationPathsOnly If set to <code>true</code>, no properties are returned
	 * @returns {array} The resulting paths are returned
	 * @public
	 */
	SmartField.getSupportedAnnotationPaths = function(oMetaModel, oEntitySet, sValueBinding, bNavigationPathsOnly) {
		var oConfig, oUOM, aResult = [], oMetaData;

		if (oMetaModel && oEntitySet && sValueBinding) {
			// prepare the meta data.
			oMetaData = {
				entitySet: oEntitySet,
				entityType: oMetaModel.getODataEntityType(oEntitySet.entityType),
				path: sValueBinding
			};

			// get the config.
			oConfig = {
				helper: new ODataHelper(null, null, oMetaModel)
			};

			if (bNavigationPathsOnly) {
				oConfig.navigationPathOnly = bNavigationPathsOnly;
			}

			// complete the meta data.
			oConfig.helper.getProperty(oMetaData);

			// get the annotations from the entity set.
			SmartField._getFromEntitySet(aResult, oMetaData, oConfig);

			// get the annotations from the property.
			SmartField._getFromProperty(aResult, oMetaData, oConfig);

			// get the annotations from a unit of measure.
			oUOM = oConfig.helper.getUnitOfMeasure2(oMetaData);

			if (oUOM) {
				SmartField._getFromProperty(aResult, oUOM, oConfig);
			}

			// destroy the helper class.
			oConfig.helper.destroy();
		}

		return aResult;
	};

	/**
	 * Calculates the paths to the annotations on entity set.
	 *
	 * @param {array} aResult The resulting paths
	 * @param {object} oMetaData The given meta data
	 * @param {object} oMetaData.entitySet The OData entity set definition
	 * @param {object} oMetaData.entityType The OData entity type definition
	 * @param {object} oMetaData.property The OData property definition
	 * @param {object} oConfig The given configuration
	 * @param {sap.ui.comp.smartfield.ODataHelper} oConfig.helper The given helper
	 * @param {boolean} oConfig.navigationPathOnly If set to <code>true</code>, no properties will be returned
	 * @private
	 */
	SmartField._getFromEntitySet = function(aResult, oMetaData, oConfig) {
		var sPath;

		if (oMetaData.entitySet) {
			sPath = oConfig.helper.oAnnotation.getUpdateEntitySetPath(oMetaData.entitySet);
			SmartField._push(sPath, aResult, oMetaData, oConfig);
		}
	};

	/**
	 * Pushes a path, if it is not null.
	 *
	 * @param {string} sPath The given path
	 * @param {array} aResult The resulting paths
	 * @param {object} oMetaData The given meta data
	 * @param {object} oMetaData.entitySet The OData entity set definition
	 * @param {object} oMetaData.entityType The OData entity type definition
	 * @param {object} oMetaData.property The OData property definition
	 * @param {object} oConfig The given configuration
	 * @param {sap.ui.comp.smartfield.ODataHelper} oConfig.helper The given helper
	 * @param {boolean} oConfig.navigationPathOnly If set to <code>true</code>, no properties will be returned
	 * @private
	 */
	SmartField._push = function(sPath, aResult, oMetaData, oConfig) {
		var aPath, sPart, len, sOut, oResult = {};

		if (sPath) {
			if (oConfig.navigationPathOnly) {
				aPath = sPath.split("/");
				len = aPath.length;
				oResult.entityType = oMetaData.entityType;

				while (len--) {
					sPart = aPath.shift();

					if (sPart === "") {
						continue;
					}

					oResult = oConfig.helper.getNavigationProperty(oResult.entityType, sPart);

					if (!oResult.entitySet) {
						break;
					}

					if (sOut) {
						sOut = sOut + "/" + sPart;
					} else {
						sOut = sPart;
					}
				}
			} else {
				sOut = sPath;
			}
		}

		if (sOut) {
			if (oMetaData.navigationPath) {
				aResult.push(oMetaData.navigationPath + "/" + sOut);
			} else {
				aResult.push(sOut);
			}
		}
	};

	/**
	 * Calculates the paths to the annotations on property.
	 *
	 * @param {array} aResult The resulting path.
	 * @param {object} oMetaData The given meta data
	 * @param {object} oMetaData.entitySet The OData entity set definition
	 * @param {object} oMetaData.entityType The OData entity type definition
	 * @param {object} oMetaData.property The OData property definition
	 * @param {object} oConfig The given configuration
	 * @param {sap.ui.comp.smartfield.ODataHelper} oConfig.helper The given helper
	 * @param {boolean} oConfig.navigationPathOnly If set to <code>true</code>, no properties will be returned
	 * @private
	 */
	SmartField._getFromProperty = function(aResult, oMetaData, oConfig) {
		var sPath;

		if (oMetaData.property.property) {
			sPath = oConfig.helper.oAnnotation.getText(oMetaData.property.property);
			SmartField._push(sPath, aResult, oMetaData, oConfig);

			sPath = oConfig.helper.oAnnotation.getUnit(oMetaData.property.property);
			SmartField._push(sPath, aResult, oMetaData, oConfig);

			sPath = oConfig.helper.oAnnotation.getFieldControlPath(oMetaData.property.property);
			SmartField._push(sPath, aResult, oMetaData, oConfig);
		}
	};

	return SmartField;

}, /* bExport= */ true);
