/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.smartform.GroupElement.
sap.ui.define([
	'jquery.sap.global', 'sap/m/Label', "sap/m/VBox", 'sap/ui/comp/library', 'sap/ui/core/Element', 'sap/ui/layout/form/FormElement', 'sap/ui/layout/ResponsiveFlowLayoutData', 'sap/ui/comp/smartfield/SmartLabel', 'sap/ui/comp/smartfield/SmartField', 'sap/ui/comp/smartfield/BindingUtil', 'sap/ui/comp/smartfield/Configuration', 'sap/ui/core/TooltipBase'
], function(jQuery, Label, VBox, library, Element, FormElement, ResponsiveFlowLayoutData, SmartLabel, SmartField, BindingUtil, Configuration, TooltipBase) {
	"use strict";

	/**
	 * Constructor for a new smartform/GroupElement.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class A GroupElement is a combination of one label and different controls associated to this label.
	 * @extends sap.ui.core.Control
	 * @author Alexander Fürbach
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartform.GroupElement
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GroupElement = FormElement.extend("sap.ui.comp.smartform.GroupElement", /** @lends sap.ui.comp.smartform.GroupElement.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			properties: {

				/**
				 * Specifies whether the groups shall be rendered in a ResponsiveLayout with label on top of the group element. Each group will be
				 * rendered in a new line.
				 */
				useHorizontalLayout: {
					type: "boolean",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies the minimal size in pixels of all group elements of the form if horizontal Layout is used.
				 */
				horizontalLayoutGroupElementMinWidth: {
					type: "int",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Index of element to be used for label determination
				 */
				elementForLabel: {
					type: "int",
					group: "Misc",
					defaultValue: 0
				}
			},
			defaultAggregation: "elements",
			aggregations: {

				/**
				 * Aggregation of controls to be displayed together with a label.
				 */
				elements: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "element"
				}
			},
			events: {

				/**
				 * The event is fired after the visibility of the control has changed.
				 */
				visibleChanged: {}
			}
		},
		_visibilityDerived: false
	});

	/**
	 * Initialize the control.
	 *
	 * @private
	 */
	GroupElement.prototype.init = function() {
		FormElement.prototype.init.apply(this, arguments);
	};

	GroupElement.prototype._getFieldRelevantForLabel = function() {
		var aField = this.getFields();
		var aElements = [];
		var that = this;

		aField.forEach(function(oField) {
			if (oField instanceof VBox && that.getUseHorizontalLayout()) {
				aElements = aElements.concat(oField.getItems());
			} else {
				aElements.push(oField);
			}
		});

		aElements = aElements.filter(function(oField) {
			return !(oField instanceof sap.m.Label);
		});

		var iIndex = this.getElementForLabel();

		if (aElements.length > iIndex && (aElements[iIndex] instanceof SmartField)) {
			return aElements[iIndex];
		}

		return null;
	};

	GroupElement.prototype._createLabel = function(sLabel) {
		var oLabel = null;
		var oInfo = null;
		var oBindingUtil = new BindingUtil();
		var oField = this._getFieldRelevantForLabel();

		if (oField) {
			if (oField.getShowLabel()) {
				if (sLabel) {
					oField.setTextLabel(sLabel);
				}
				oLabel = new SmartLabel();
				if (sLabel) {
					oLabel.setText(sLabel);
				}
				oLabel.setLabelFor(oField);
			}
		} else {
			oInfo = this.getBindingInfo("label");
			oLabel = new Label();
			if (sLabel) {
				oLabel.setText(sLabel);
			} else if (oInfo) {
				oLabel.bindProperty("text", oBindingUtil.toBinding(oInfo));
			}
		}

		return oLabel;

	};

	GroupElement.prototype.updateLabelOfFormElement = function(aInnerElements, oSourceSmartField) {
		var oTooltip = null, bCreated = false;

		var oRelevantField = this._getFieldRelevantForLabel();

		var oLabel = this._getLabel();
		if (oLabel) { // label is always an object (see setLabel)
			if (oRelevantField && (!(oLabel instanceof SmartLabel))) {
				oLabel = this._createLabel(oLabel.getText());
				bCreated = true;
			}
		} else {
			oLabel = this._createLabel();
			bCreated = true;
		}

		if (oLabel) {
			if (oSourceSmartField && aInnerElements && (oLabel instanceof SmartLabel)) {
				if (oSourceSmartField === oRelevantField) {
					oLabel.updateLabelFor(aInnerElements);
				} else {
					oLabel.updateAriaLabeledBy(aInnerElements);
				}
			}

			var oSmartField = this._getFieldRelevantForLabel();
			if (oLabel instanceof SmartLabel) {
				if (/* oLabel.getText() && */oSmartField && oSmartField.setTextLabel) {
					if (oSmartField.getTextLabel()) { // if the label was implicitly created and the SF has a textLabel -> set the same a label text
						oLabel.setText(oSmartField.getTextLabel());
					}
				}
			}

			oTooltip = this.getTooltip();
			if (oTooltip) {
				if (oLabel instanceof SmartLabel) {
					if (oSmartField && oSmartField.setTooltipLabel) {
						oSmartField.setTooltipLabel(oTooltip.getText());
					}
				}
			} else {
				oLabel.setTooltip(oTooltip);
			}
		}

		if (bCreated) {
			this.setLabel(oLabel);
		}

	};

	GroupElement.prototype.setLabel = function(oLabel) {

		var oOldLabel, oLabelNew = oLabel;
		var aItems;
		if (typeof oLabel === "string") {

			oOldLabel = this._getLabel();
			if (oOldLabel && oOldLabel instanceof SmartLabel) {
				oOldLabel.setText(oLabel);

				oLabelNew = oOldLabel;

				var oSmartField = this._getFieldRelevantForLabel();
				if (oSmartField && oSmartField.getTextLabel && !oSmartField.getTextLabel()) {
					oSmartField.setTextLabel(oLabel);
				}

			} else {

				oLabelNew = new Label({
					text: oLabel
				});
			}
		}

		if (this.getUseHorizontalLayout()) {
			if (this.getFields()[0] instanceof VBox) {
				aItems = this.getFields()[0].getItems();
				aItems.some(function(oItem) {
					if (oItem instanceof Label) {
						oOldLabel = oItem;
						return true;
					}
				});

				if (oOldLabel) {
					oOldLabel = oLabelNew;
				} else {
					this.getFields()[0].insertItem(oLabelNew, 0);
				}
				return this;
			}
		}

		FormElement.prototype.setLabel.apply(this, [
			oLabelNew
		]);
	};

	GroupElement.prototype.setTooltip = function(oTooltip) {
		var oTooltipNew = oTooltip;
		if (typeof oTooltip === "string") {
			oTooltipNew = new TooltipBase({
				text: oTooltip
			});
		}

		FormElement.prototype.setTooltip.apply(this, [
			oTooltipNew
		]);
	};

	/**
	 * Returns the internal Label independent whether it comes direct from GroupElement or from internal used VBox
	 *
	 * @return {object} which represents the internal Label
	 * @private
	 */
	GroupElement.prototype._getLabel = function() {
		var aElements = null, aItems = null, bResult = false;
		var oLabel = FormElement.prototype.getLabel.apply(this);

		if (!oLabel) {
			aElements = this.getElements();
			if (aElements && aElements.length > 0 && aElements[0] instanceof VBox) {
				aItems = aElements[0].getItems();
				aItems.some(function(oItem) {
					bResult = false;
					if (oItem instanceof Label) {
						oLabel = oItem;
						bResult = true;
					}
					return bResult;
				});
			}
		}

		return oLabel;
	};

	/**
	 * Returns the text of the label.
	 *
	 * @return {string} text of the label.
	 * @public
	 */
	GroupElement.prototype.getLabelText = function() {
		var sLabel = "";

		var oLabel = this._getLabel();
		if (oLabel) {
			sLabel = oLabel.getText();
		}

		return sLabel;
	};

	/**
	 * Setter for property editable of all smart fields in children hierarchy.
	 *
	 * @param {boolean} bEditMode new value for editable property of smart fields.
	 * @return {sap.ui.comp.smartform.GroupElement} <code>this</code> to allow method chaining.
	 * @public
	 */
	GroupElement.prototype.setEditMode = function(bEditMode) {

		var aElement = this.getElements();
		var aItem = [];

		aElement.forEach(function(oElement) {
			if (oElement instanceof VBox) {
				aItem = oElement.getItems();
				aItem.forEach(function(oItem) {
					if (oItem instanceof SmartField) {
						if (!(oItem.data("editable") === false)) {
							oItem.setContextEditable(bEditMode);
						}
					}
				});
			} else if (oElement instanceof SmartField) {
				if (!(oElement.data("editable") === false)) {
					oElement.setContextEditable(bEditMode);
				}
			}
		});

		return this;
	};

	/**
	 * Checks whether at least one field is visible
	 *
	 * @param {array} aFields contains all that fields that shall be checked
	 * @param {boolean} bIgnoreSmartLabels defines whether SmartLabels shall be considered for visibility determination (in VBox = false)
	 * @private
	 */
	GroupElement.prototype._getVisibilityOfFields = function(aFields, bIgnoreSmartLabels) {
		var bResult = false;
		var i = 0, iLength = 0, oField = null;

		if (aFields && aFields.length) {
			iLength = aFields.length;
			for (i = 0; i < iLength; i++) {
				oField = aFields[i];
				if (oField) {

					// this case shall ignore SmartLabels if they come from VBox
					if (bIgnoreSmartLabels && oField instanceof SmartLabel) {
						continue;
					}

					if (oField instanceof VBox) {
						bResult = this._getVisibilityOfFields(oField.getItems(), true);
					} else {
						bResult = oField.getVisible();
					}
				}

				// break if at least one field is visible
				if (bResult) {
					break;
				}
			}
		}

		return bResult;
	};

	/**
	 * Updates the visibility of the FormElement
	 *
	 * @private
	 */
	GroupElement.prototype._updateFormElementVisibility = function() {
		var bActualVisible = this.getVisible();
		var bVisible = false, aFields = null;

		if (bActualVisible === false && this._visibilityDerived === false) {
			return;
		}

		aFields = this.getFields();
		if (aFields && aFields.length) {
			bVisible = this._getVisibilityOfFields(aFields);
		}

		if (bActualVisible !== bVisible) {
			this._visibilityDerived = true;
			FormElement.prototype.setProperty.apply(this, [
				'visible', bVisible
			]);
			this.fireVisibleChanged({
				visible: bVisible
			});
			if (this.getParent()) {
				this.getParent()._updateLineBreaks();
			}
		}
	};

	/**
	 * Call back method in case of editable property in SmartField was changed
	 *
	 * @private
	 */
	GroupElement.prototype._updateFormElementEditable = function(oEvent) {
		var oLabel = this._getLabel();
		if (oLabel && oLabel instanceof SmartLabel) {
			oLabel.bindRequiredPropertyToSmartField();
		}
	};

	GroupElement.prototype._updateLayout = function() {
		var that = this;
		var iMinWidth, oVBox = null;
		var aFields = [];
		var aElements = [];

		if (this.getUseHorizontalLayout()) {
			aElements = this.getFields();
			aElements.forEach(function(oElement) {
				if (oElement instanceof VBox) {
					aFields = aFields.concat(oElement.getItems());
				} else {
					aFields.push(oElement);
				}
			});
			aFields = aFields.filter(function(oField) {
				return !(oField instanceof sap.m.Label);
			});
		} else {
			aFields = this.getFields();
		}
		var oLabel = this._getLabel();

		if (this.getUseHorizontalLayout()) {
			this.removeAllFields();
			if (aFields.length > 0) {
				oVBox = new VBox({
					"items": [].concat(aFields)
				});
				oVBox.addStyleClass("sapUiCompGroupElementVBox");
				this.addField(oVBox);
			}

			if (oLabel) {
				FormElement.prototype.setLabel.apply(this, [
					new sap.m.Label()
				]);
				FormElement.prototype.destroyLabel.apply(this);
				oVBox.insertItem(oLabel, 0);

			}

			iMinWidth = this.getHorizontalLayoutGroupElementMinWidth();
			if (iMinWidth) {
				this.setLayoutData(new ResponsiveFlowLayoutData({
					minWidth: iMinWidth
				}));
			}
		} else {
			this.removeAllFields();
			aFields.forEach(function(oField) {
				that.addField(oField);
			});
		}

	};

	/**
	 * Sets the given value for the given property
	 *
	 * @param {string} sPropertyName name of the property to set
	 * @param {any} oValue value to set the property to
	 * @public
	 */
	GroupElement.prototype.setProperty = function(sPropertyName, oValue) {
		FormElement.prototype.setProperty.apply(this, [
			sPropertyName, oValue
		]);

		if (sPropertyName === 'visible') {
			this._visibilityDerived = false;
			this._updateFormElementVisibility();
		}

	};

	GroupElement.prototype.setVisible = function(bVisible) {
		this._visibilityDerived = false;
		FormElement.prototype.setProperty.apply(this, [
			'visible', bVisible
		]);
		this._updateFormElementVisibility();
	};

	GroupElement.prototype.setUseHorizontalLayout = function(bValue) {
		this.setProperty("useHorizontalLayout", bValue);

		this._updateLayout();
	};

	GroupElement.prototype.setHorizontalLayoutGroupElementMinWidth = function(nValue) {
		this.setProperty("horizontalLayoutGroupElementMinWidth", nValue);

		this._updateLayout();
	};

	/**
	 * Returns the from element.
	 *
	 * @return {sap.ui.layout.form.FormElement} the form element.
	 * @public
	 */
	GroupElement.prototype.getFormElement = function() {
		return this;
	};

	/**
	 * Adds some control into the aggregation <code>elements</code>
	 *
	 * @param {sap.ui.core.Control} oElement the control to add.
	 * @public
	 */
	GroupElement.prototype.addElement = function(oElement) {
		var that = this;
		if (oElement.getEditable) {
			if (!oElement.getEditable()) {
				oElement.data("editable", false);
			}
		}
		if (oElement.attachVisibleChanged) {
			oElement.attachVisibleChanged(function(oEvent) {
				that._updateFormElementVisibility();
			});
		}
		if (oElement.attachContextEditableChanged) {
			oElement.attachContextEditableChanged(function(oEvent) {
				that._updateFormElementEditable(oEvent);
			});
		}

		if (oElement.attachInnerControlsCreated) {
			oElement.attachInnerControlsCreated(function(oEvent) {
				that._updateFormElementLabel(oEvent);
			});
		}
		this.addField(oElement);
		this.updateLabelOfFormElement();

		this._updateLayout();
	};

	GroupElement.prototype._updateFormElementLabel = function(oEvent) {
		var aFields = this.getFields();
		if (aFields[0] instanceof VBox) {
			aFields = aFields[0].getItems();
			if (aFields[0] instanceof Label) {
				aFields.splice(0, 1);
			}
		}
		// var iIndex = this.getElementForLabel();

		// if (aFields[iIndex] === oEvent.oSource) {
		this.updateLabelOfFormElement(oEvent.getParameters(), oEvent.oSource);
		// }
	};

	/**
	 * Adds some customData into the aggregation <code>customData</code>. Additionally, customData is also added to the SmartField controls in the
	 * children hierarchy.
	 *
	 * @param {sap.ui.core.CustomData} oCustomData the customData to add.
	 * @return {sap.ui.comp.smartform.GroupElement} <code>this</code> to allow method chaining.
	 * @public
	 */
	GroupElement.prototype.addCustomData = function(oCustomData) {
		FormElement.prototype.addCustomData.apply(this, arguments);

		var aElement = this.getFields();

		aElement.forEach(function(oElement) {
			if (oElement instanceof SmartField) {
				oElement.addCustomData(oCustomData.clone());
			}
		});
		return this;
	};

	/**
	 * Inserts a control into the aggregation <code>elements</code>
	 *
	 * @param {sap.ui.core.Control} oElement the control to insert into aggregation named elements.
	 * @param {int} iIndex the 0-based index the control should be inserted at.
	 * @return {sap.ui.comp.smartform.GroupElement} <code>this</code> to allow method chaining.
	 * @public
	 */
	GroupElement.prototype.insertElement = function(oElement, iIndex) {
		this.insertField(oElement, iIndex);
		return this;
	};

	/**
	 * Getter for aggregation <code>elements</code>
	 *
	 * @return {sap.ui.core.Controls[]} an array of the removed controls.
	 * @public
	 */
	GroupElement.prototype.getElements = function() {
		return this.getFields();
	};

	/**
	 * Removes an element from the aggregation named elements.
	 *
	 * @param {int|string|sap.ui.core.Control} The element to remove or its index or ID
	 * @return {sap.ui.core.Control} The removed element or null
	 * @public
	 */
	GroupElement.prototype.removeElement = function(vElement) {
		return this.removeField(vElement);
	};

	/**
	 * Removes all the controls in the aggregation named elements.
	 *
	 * @return {sap.ui.core.Control[]} An array of the removed elements (might be empty)
	 * @public
	 */
	GroupElement.prototype.removeAllElements = function() {
		return this.removeAllFields();
	};

	GroupElement.prototype.removeAggregation = function(sAggregationName, oObject) {
		if (sAggregationName === "elements") {
			return this.removeField(oObject);
		} else {
			return Element.prototype.removeAggregation.apply(this, arguments);
		}
	};

	GroupElement.prototype.removeAllAggregation = function(sAggregationName) {
		if (sAggregationName === "elements") {
			return this.removeAllElements();
		} else {
			return Element.prototype.removeAllAggregation.apply(this, arguments);
		}
	};

	/**
	 * Determines the visibility of a group element based on elements
	 *
	 * @returns {boolean} Returns true, in case one element of the group element is visible
	 * @public
	 */
	GroupElement.prototype.getVisibleBasedOnElements = function() {
		var isVisible = true;

		var aElements = this.getElements();
		if (aElements && aElements.length > 0) {
			isVisible = aElements.some(function(oElement) {
				return oElement.getVisible();
			});
		}

		return isVisible;
	};

	return GroupElement;

}, /* bExport= */true);
