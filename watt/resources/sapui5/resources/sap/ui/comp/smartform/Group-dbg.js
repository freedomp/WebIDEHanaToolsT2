/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.smartform.Group.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/comp/library', 'sap/ui/layout/ResponsiveFlowLayoutData', 'sap/ui/layout/form/FormContainer', './GroupElement'
], function(jQuery, library, ResponsiveFlowLayoutData, FormContainer, GroupElement) {
	"use strict";

	/**
	 * Constructor for a new smartform/Group.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Groups are used to group group elements.
	 * @extends sap.ui.core.Control
	 * @author Alexander Fürbach
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartform.Group
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Group = FormContainer.extend("sap.ui.comp.smartform.Group", /** @lends sap.ui.comp.smartform.Group.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			designTime: true,
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
				 * Label for the group.
				 */
				label: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}

			},
			defaultAggregation: "groupElements",
			aggregations: {

				/**
				 * A GroupElement is a combination of one label and different controls associated to this label.
				 */
				groupElements: {
					type: "sap.ui.comp.smartform.GroupElement",
					multiple: true,
					singularName: "groupElement"
				},

				/**
				 * Layout to specify how the group shall be rendered (e.g. span and line-break)
				 */
				layout: {
					type: "sap.ui.layout.GridData",
					multiple: false
				}
			},
			_visibilityDerived: false
		}
	});

	/**
	 * Initialize the control.
	 *
	 * @private
	 */
	Group.prototype.init = function() {
		FormContainer.prototype.init.apply(this, arguments);

		var oResponsiveLayout = new ResponsiveFlowLayoutData({
			"linebreak": true,
			"linebreakable": true
		});

		this.setLayoutData(oResponsiveLayout);

		this._updateFormContainerLabel();

	};

	Group.prototype.setUseHorizontalLayout = function(bValue) {
		this.setProperty("useHorizontalLayout", bValue);

		var aGroupElement = this.getGroupElements();
		if (aGroupElement) {
			aGroupElement.forEach(function(oGroupElement) {
				oGroupElement.setUseHorizontalLayout(bValue);
			});
		}
	};
	Group.prototype.setHorizontalLayoutGroupElementMinWidth = function(nValue) {
		this.setProperty("horizontalLayoutGroupElementMinWidth", nValue);

		var aGroupElement = this.getGroupElements();
		if (aGroupElement) {
			aGroupElement.forEach(function(oGroupElement) {
				oGroupElement.setHorizontalLayoutGroupElementMinWidth(nValue);
			});
		}
	};

	/**
	 * Setter for property editable of all smart fields in children hierarchy.
	 *
	 * @param {boolean} bEditMode new value for editable property of smart fields.
	 * @return {sap.ui.comp.smartform.Group} <code>this</code> to allow method chaining.
	 * @public
	 */
	Group.prototype.setEditMode = function(bEditMode) {

		var aGroupElement = this.getGroupElements();
		if (aGroupElement) {
			aGroupElement.forEach(function(oGroupElement) {
				oGroupElement.setEditMode(bEditMode);
			});
		}
		return this;
	};

	/**
	 * Updates title of form container
	 *
	 * @private
	 */
	Group.prototype._updateFormContainerLabel = function() {
		var oTitle = new sap.ui.core.Title({
			text: this.getLabel()
		});

		this.setTitle(oTitle);
	};

	/**
	 * Delegates edit mode from parent( like SmartForm ) to the given group element
	 *
	 * @private
	 * @param {object} oGroupElement on which the edit mode shall be set
	 */
	Group.prototype._delegateEditModeFromParent = function(oGroupElement) {
		var oParent = null;
		var bEditable = false;

		if (oGroupElement) {
			oParent = this.getParent();
			if (oParent && oParent.getEditable) {
				bEditable = oParent.getEditable();
				oGroupElement.setEditMode(bEditable);
			}
		}
	};

	/**
	 * Updates line breaks of group elements
	 *
	 * @private
	 */
	Group.prototype._updateLineBreaks = function() {

		if (!this.getUseHorizontalLayout()) {
			return;
		}

		var oSmartForm = this.getParent();
		if (!oSmartForm._getCurrentSpan) {
			oSmartForm = oSmartForm.getParent();
		}

		var iCurrentSpan = oSmartForm._getCurrentSpan();

		if (!iCurrentSpan) {
			return;
		}

		var aElements = this.getGroupElements();

		aElements = aElements.filter(function(oElement) {
			return oElement.getVisible();
		});

		var iCount = 0;

		aElements.forEach(function(oElement) {

			iCount = iCount + 1;
			var oLayout = oElement.getFields()[0].getLayoutData();

			if (oLayout) {
				if (iCurrentSpan * iCount > 12) {
					oLayout.setLinebreak(true);
					iCount = 1;
				} else {
					oLayout.setLinebreak(false);
				}
			}
		});

	};

	Group.prototype._updateFormContainerVisibility = function() {
		var bActualVisible = this.getVisible();

		if (bActualVisible === false && this._visibilityDerived === false) {
			return;
		}

		var aGroupElements = this.getGroupElements();

		var bVisible = false;
		bVisible = aGroupElements.some(function(oGroupElement) {
			return oGroupElement.getVisible();
		});

		if (bActualVisible !== bVisible) {
			this._visibilityDerived = true;
			FormContainer.prototype.setProperty.apply(this, [
				"visible", bVisible
			]);
		}
	};

	/**
	 * Sets the given value for the given property
	 *
	 * @param {string} sPropertyName name of the property to set
	 * @param {any} oValue value to set the property to
	 * @public
	 */
	Group.prototype.setProperty = function(sPropertyName, oValue) {

		FormContainer.prototype.setProperty.apply(this, arguments);

		if (sPropertyName === 'label') {
			this._updateFormContainerLabel();
		}
		if (sPropertyName === 'visible') {
			this._visibilityDerived = false;
		}
	};

	/**
	 * Sets a new value for property visible. Whether the control should be visible on the screen. If set to false, a placeholder is rendered instead
	 * of the real control When called with a value of null or undefined, the default value of the property will be restored. Default value is true.
	 *
	 * @param {boolean} bVisible New value for property visible
	 * @return {sap.ui.comp.smartform.Group} <code>this</code> to allow method chaining.
	 * @public
	 */
	Group.prototype.setVisible = function(bVisible) {
		this._visibilityDerived = false;
		FormContainer.prototype.setProperty.apply(this, [
			'visible', bVisible
		]);
	};

	/**
	 * Adds some entity to the given aggregation.
	 *
	 * @param {string} sAggregationName the strung identifying the aggregation that oObject should be added to.
	 * @param {sap.ui.base.ManagedObject} oObject the object to add.
	 * @return {sap.ui.comp.smartform.Group} <code>this</code> to allow method chaining.
	 * @public
	 */

	// TODO AF: do we need the handling for other aggregation, besides 'groupElements' ?? Wie passt diese Mezthode zu addGroupElemets ?? Löschen ?
	Group.prototype.addAggregation = function(sAggregationName, oObject) {
		var sInnerAggregationName = sAggregationName;
		var that = this;

		if (sAggregationName === "groupElements") {
			sInnerAggregationName = "formElements";
			this._delegateEditModeFromParent(oObject);
			oObject.setHorizontalLayoutGroupElementMinWidth(this.getHorizontalLayoutGroupElementMinWidth());
			oObject.setUseHorizontalLayout(this.getUseHorizontalLayout());
			oObject.attachVisibleChanged(function(oEvent) {
				that._updateFormContainerVisibility(oEvent);
			});
		}

		FormContainer.prototype.addAggregation.apply(this, [
			sInnerAggregationName, oObject
		]);
	};

	/**
	 * Adds some GroupElement into the aggregation <code>groupElements</code>
	 *
	 * @param {sap.ui.comp.smartform.GroupElement} oGroupElement group element to add to aggregation named groupElements.
	 * @return {sap.ui.comp.smartform.Group} <code>this</code> to allow method chaining.
	 * @public
	 */
	Group.prototype.addGroupElement = function(oGroupElement) {
		this.addAggregation("groupElements", oGroupElement);
	};

	Group.prototype.getGroupElements = function() {
		return this.getFormElements();
	};

	/**
	 * Sets a new object in the named 0..1 aggregation.
	 *
	 * @param {string} sAggregationName name of an 0..1 aggregation.
	 * @param {sap.ui.base.ManagedObject} oObject the managed object that is set as aggregated object.
	 * @return {sap.ui.comp.smartform.Group} <code>this</code> to allow method chaining.
	 * @public
	 */
	Group.prototype.setAggregation = function(sAggregationName, oObject) {
		var sInnerAggregationName = sAggregationName;
		if (sAggregationName === "layout") {
			sInnerAggregationName = "layoutData";
		}

		FormContainer.prototype.setAggregation.apply(this, [
			sInnerAggregationName, oObject
		]);
	};

	/*
	 * Group.prototype.setLayout = function(oLayout) { this.setLayoutData(oLayout); }; Group.prototype.getLayout = function() { return
	 * this.getLayoutData(); };
	 */

	/**
	 * Adds some CustomeData into the aggregation <code>customData</code>. Additionally the customData is also added to the SmartFields in the
	 * children hierarchy
	 *
	 * @param {sap.ui.core.CustomData} oCustomData the customData to add.
	 * @return {sap.ui.comp.smartform.Group} <code>this</code> to allow method chaining.
	 * @public
	 */
	Group.prototype.addCustomData = function(oCustomData) {
		FormContainer.prototype.addCustomData.apply(this, arguments);

		var aGroupElement = this.getGroupElements();
		if (aGroupElement) {
			aGroupElement.forEach(function(oGroupElement) {
				oGroupElement.addCustomData(oCustomData.clone());
			});
		}
		return this;
	};

	/**
	 * Inserts a GroupElement into the aggregation <code>groupElements</code>
	 *
	 * @param {sap.ui.comp.smartform.GroupElement} oGroupElement group element to insert into aggregation named groupElements.
	 * @param {int} iIndex the 0-based index the GroupElement should be inserted at.
	 * @return {sap.ui.comp.smartform.Group} <code>this</code> to allow method chaining.
	 * @public
	 */
	Group.prototype.insertGroupElement = function(oGroupElement, iIndex) {
		return this.insertFormElement(oGroupElement, iIndex);
	};

	/**
	 * Removes a GroupElement from the aggregation <code>groupElements</code>
	 *
	 * @param {int|string|sap.ui.comp.smartform.GroupElement} vGroupElement the GroupElement to remove or its index or id.
	 * @return {sap.ui.comp.smartform.GroupElement} the removed GroupElement or null.
	 * @public
	 */
	Group.prototype.removeGroupElement = function(vGroupElement) {
		var oGroupElement = null;
		var aGroupElement = [];
		var i = 0;

		if (vGroupElement instanceof GroupElement) {
			oGroupElement = vGroupElement;
		} else {
			aGroupElement = this.getGroupElements();
			if (aGroupElement) {
				if (typeof vGroupElement === "number") {
					oGroupElement = aGroupElement[vGroupElement];
				} else if (typeof vGroupElement === "string") {
					for (i; i < aGroupElement.length; i++) {
						if (aGroupElement[i].sId === vGroupElement) {
							oGroupElement = aGroupElement[i];
							break;
						}
					}
				}
			}
		}

		if (oGroupElement) {
			return this.removeFormElement(oGroupElement);
		} else {
			return null;
		}
	};

	/**
	 * Removes all group elements from the aggregation <code>groupElements</code>
	 *
	 * @param {int|string|sap.ui.comp.smartform.GroupElement} the GroupElement to remove or its index or id.
	 * @return {sap.ui.comp.smartform.GroupElement[]} an array of the removed elements.
	 * @public
	 */
	Group.prototype.removeAllGroupElements = function() {
		return this.removeAllFormElements();
	};

	/**
	 * Destroys all the group elements in the aggregation <code>groupElements</code>
	 *
	 * @return {sap.ui.comp.smartform.Group} <code>this</code> to allow method chaining.
	 * @public
	 */
	Group.prototype.destroyGroupElements = function() {
		return this.destroyFormElements();
	};

	return Group;

}, /* bExport= */true);
