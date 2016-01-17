/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.smartform.flexibility.FieldListNode.
sap.ui.define(['jquery.sap.global', 'sap/m/CheckBox', 'sap/m/FlexBox', 'sap/ui/comp/library', './Input', 'sap/ui/core/Control', 'sap/m/Button'],
	function(jQuery, CheckBox, FlexBox, library, Input, Control, Button) {
	"use strict";



	/**
	 * Constructor for a new smartform/flexibility/FieldListNode.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A node within the field list control
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartform.flexibility.FieldListNode
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldListNode = Control.extend("sap.ui.comp.smartform.flexibility.FieldListNode", /** @lends sap.ui.comp.smartform.flexibility.FieldListNode.prototype */ { metadata : {

		library : "sap.ui.comp",
		properties : {

			/**
			 * The label
			 */
			label : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * is visible flag
			 */
			isVisible : {type : "boolean", group : "Misc", defaultValue : null},

			/**
			 * is node selected
			 */
			isSelected : {type : "boolean", group : "Misc", defaultValue : null}
		},
		aggregations : {

			/**
			 * Nodes representing either a Form, a Group or a field
			 */
			nodes : {type : "sap.ui.comp.smartform.flexibility.FieldListNode", multiple : true, singularName : "node"},

			/**
			 * private aggregation
			 */
			layout : {type : "sap.ui.core.Control", multiple : false}
		},
		events : {

			/**
			 * node was selected
			 */
			selected : {
				parameters : {

					/**
					 * The inner node which was clicked
					 */
					target : {type : "sap.ui.comp.smartform.flexibility.FieldListNode"}
				}
			},
			/**
			 * label of node was changed
			 */
			labelChanged : {
				parameters : {

					/**
					 * The inner node which was clicked
					 */
					target : {type : "sap.ui.comp.smartform.flexibility.FieldListNode"}
				}
			},
			/**
			 * node was hidden
			 */
			nodeHidden : {
				parameters : {

					/**
					 * The inner node which was hidden
					 */
					target : {type : "sap.ui.comp.smartform.flexibility.FieldListNode"}
				}
			}
		}
	}});


	/**
	 * Init
	 *
	 * @private
	 */
	FieldListNode.prototype.init = function() {
		this._textResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");

		this._oLayout = new FlexBox({
			direction : sap.m.FlexDirection.Row,
			justifyContent: sap.m.FlexJustifyContent.SpaceBetween
		});

		// inputField
		this._oLabelInputField = new Input(this.getId() + '-Input');
		this._oLabelInputField.addStyleClass("sapUiCompFieldListNodeLabelInputField");
		this._oLabelInputField.setValue(this.getLabel());
		this._oLabelInputField.setEditable(false);
		this._oLabelInputField.attachChange(this._onLabelChanged.bind(this));
		this._oLabelInputField.attachSelectedByKeyboard(this._onLabelSelectedByKeyboard.bind(this));
		this._oLabelInputField.setLayoutData(new sap.m.FlexItemData({
		}));
		this._oLayout.addItem(this._oLabelInputField);

		// delete button
		this._oDeleteButton = new Button(this.getId() + '_Button');
		this._oDeleteButton.setType("Transparent");
		this._oDeleteButton.setIcon("sap-icon://decline");
		this._oDeleteButton.setIconDensityAware(false);
		this._oDeleteButton.setTooltip(this._textResources.getText("FORM_PERS_VIS_CHECKBOX_TOOLTIP"));
		this._oDeleteButton.attachPress(this._hideNode.bind(this));
		this._oDeleteButton.setLayoutData(new sap.m.FlexItemData({
		}));
		this._oLayout.addItem(this._oDeleteButton);

		this.setLayout(this._oLayout);
	};

	/**
	 * Overwritten - Sets the label property
	 *
	 * @param {string} sLabel Label
	 * @public
	 */
	FieldListNode.prototype.setLabel = function(sLabel) {
		this._oLabelInputField.setValue(sLabel);
		this.setProperty("label", sLabel);
	};

	/**
	 * Overwritten - Sets the isVisible property
	 *
	 * @param {boolean} bIsVisible isVisible
	 * @public
	 */
	FieldListNode.prototype.setIsVisible = function(bIsVisible) {
		if (this.getModel()) {
			this.getModel().setData(this.getModel().getData());
		}
		this.setProperty("isVisible", bIsVisible);
		this.setVisible(bIsVisible);
	};

	/**
	 * Overwritten - Sets the isSelected property
	 *
	 * @param {boolean} bIsSelected field list node selected
	 * @public
	 */
	FieldListNode.prototype.setIsSelected = function(bIsSelected) {
		if (!bIsSelected) {
			this._oLabelInputField.setEditable(false);
		}
		this.setProperty("isSelected", bIsSelected);
	};

	/**
	 * Event handler - called when the user press the hide button
	 *
	 * @param {object} oEvent Event
	 * @private
	 */
	FieldListNode.prototype._hideNode = function(oEvent) {
		this.setIsVisible(false);
		this._fireNodeHiddenAndDelegateToParent(this);
	};


	/**
	 * Event handler - called when the user changes the label
	 *
	 * @param {object} oEvent Event
	 * @public
	 */
	FieldListNode.prototype._onLabelChanged = function(oEvent) {
		var sLabel;
		sLabel = this._oLabelInputField.getValue();
		if (sLabel !== this.getLabel()) {
			this.setProperty("label", sLabel);
		}
		this._oLabelInputField.setEditable(false);
		this._fireLabelChangedAndDelegateToParent(this);
	};

	/**
	 * Event handler - called when the user has selected the label using the keyboard
	 *
	 * @param {object} oEvent Event
	 * @public
	 */
	FieldListNode.prototype._onLabelSelectedByKeyboard = function(oEvent) {
		this._oLabelInputField.setEditable(true);
		this._fireSelectedAndDelegateToParent(this);
	};

	/**
	 * Overwritten - Registers to DOM events after rendering
	 *
	 * @private
	 */
	FieldListNode.prototype.onAfterRendering = function() {
		this.registerToDOMEvents();
	};

	/**
	 * Overwritten - Registers to DOM events before rendering
	 *
	 * @private
	 */
	FieldListNode.prototype.onBeforeRendering = function() {
		this.deregisterToDOMEvents();
	};

	/**
	 * @private Registers to DOM events like mouse events
	 */
	FieldListNode.prototype.registerToDOMEvents = function() {
		jQuery("#" + this.getId()).on('click', jQuery.proxy(this._handleClick, this));
	};

	/**
	 * @private Deregisters from DOM events
	 */
	FieldListNode.prototype.deregisterToDOMEvents = function() {
		jQuery("#" + this.getId()).off('click');
	};

	/**
	 * @private Event handler, called when the user clicks somewhere into the form. Raises the Selected event.
	 * @param {object} oEvent event
	 */
	FieldListNode.prototype._handleClick = function(oEvent) {
		var target, oSourceNode;
		target = oEvent.target || oEvent.srcElement;

		if (target) {
			oSourceNode = sap.ui.getCore().byId(target.id); // Get SAPUI5 control by DOM reference
			if (!(oSourceNode instanceof FieldListNode)) {
				if (target.parentElement) {
					oSourceNode = sap.ui.getCore().byId(target.parentElement.id); // Get SAPUI5 control by DOM reference
				}
			}
		}

		// If node is already selected and label is clicked, make label editable
		if ((oSourceNode === this._oLabelInputField) && this.getIsSelected()) {
			this._oLabelInputField.setEditable(true);
		}

		// Fire event only if a field list node was clicked
		if (oSourceNode === this || oSourceNode === this._oLabelInputField) {
			this._fireSelectedAndDelegateToParent(this);
		}
	};

	/**
	 * @private Fires the is selected event for itself and for the parent field list node
	 * @param {sap.ui.comp.smartform.flexibility.FieldListNode} oFieldListNode field list node instance
	 */
	FieldListNode.prototype._fireSelectedAndDelegateToParent = createFireEventAndDelegateToParent('fireSelected', '_fireSelectedAndDelegateToParent');

	/**
	 * @private Fires the is labelChanged event for itself and for the parent field list node
	 * @param {sap.ui.comp.smartform.flexibility.FieldListNode} oFieldListNode field list node instance
	 */
	FieldListNode.prototype._fireLabelChangedAndDelegateToParent = createFireEventAndDelegateToParent('fireLabelChanged', '_fireLabelChangedAndDelegateToParent');

	/**
	 * @private Fires the is NodeHidden event for itself and for the parent field list node
	 * @param {sap.ui.comp.smartform.flexibility.FieldListNode} oFieldListNode field list node instance
	 */
	FieldListNode.prototype._fireNodeHiddenAndDelegateToParent = createFireEventAndDelegateToParent('fireNodeHidden', '_fireNodeHiddenAndDelegateToParent');

	function createFireEventAndDelegateToParent(sFunctionNameToFireEvent, sFunctionNameOnParent){
		return function(oFieldListNode){
			var oParent;

			if (!(oFieldListNode instanceof FieldListNode)) {
				return;
			}

			this[sFunctionNameToFireEvent]({
				target: oFieldListNode
			});

			// Call parent to fire event, too
			oParent = this.getParent();
			if (oParent && oParent instanceof FieldListNode) {
				oParent[sFunctionNameOnParent](oFieldListNode);
			}
		};
	}

	return FieldListNode;

}, /* bExport= */ true);
