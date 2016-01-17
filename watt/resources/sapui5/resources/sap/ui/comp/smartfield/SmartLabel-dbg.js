/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.smartfield.SmartLabel.
sap.ui.define([
	'jquery.sap.global', 'sap/m/Label', 'sap/ui/comp/library', './BindingUtil', "./AnnotationHelper", "./SmartField"
], function(jQuery, Label, library, BindingUtil, AnnotationHelper, SmartField) {
	"use strict";

	/**
	 * Constructor for a new smartfield/SmartLabel.
	 * 
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class 
	 * The SmartLabel control extends {@link sap.m.Label sap.m.Label} and displays the label for {@link sap.ui.comp.smartfield.SmartField SmartField}.
	 * It uses the annotations 
	 * <code>sap:label</code> or <code>com.sap.vocabularies.Common.v1.Label</code> for the label text and
	 * <code>sap:quickinfo</code> or <code>com.sap.vocabularies.Common.v1.QuickInfo</code> for the tooltip.
	 * The mandatory indicator is obtained from the SmartField control. 
	 * The association with a SmartField control is built using the setLabelFor method.
	 * 
	 * @extends sap.m.Label
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartfield.SmartLabel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SmartLabel = Label.extend("sap.ui.comp.smartfield.SmartLabel", /** @lends sap.ui.comp.smartfield.SmartLabel.prototype */
	{
		metadata: {

			library: "sap.ui.comp"
		}
	});

	SmartLabel.prototype.init = function() {

		this._sSmartFieldId = null;
	};

	/**
	 * Binds the required property to mandatory property of the assigned SmartField.
	 * 
	 * @private
	 */
	SmartLabel.prototype.bindRequiredPropertyToSmartField = function() {
		var oInfo = null, oBinding = null; 

		var oSmartField = this._getField();
		
		if (oSmartField && oSmartField.getContextEditable() && oSmartField.getEditable()) {
			oBinding = new BindingUtil();
			oInfo = oSmartField.getBindingInfo("mandatory");
			if (oInfo) {
				this.bindProperty("required", oBinding.toBinding(oInfo));
			} else {
				this.setRequired(oSmartField.getMandatory());
			}
		} else {
			this.unbindProperty("required");
			this.setRequired(false);
		}
	};

	/**
	 * Binds the label properties.
	 * 
	 * @private
	 */
	SmartLabel.prototype._bindProperties = function() {

		var oSmartField = this._getField();

		if (oSmartField) {
			var oBinding = new BindingUtil();

			var oInfo = oSmartField.getBindingInfo("visible");
			if (oInfo) {
				this.bindProperty("visible", oBinding.toBinding(oInfo));
			} else {
				this.setVisible(oSmartField.getVisible());
			}

			this.bindRequiredPropertyToSmartField();

			oInfo = oSmartField.getBindingInfo("textLabel");
			if (oInfo) {
				this.bindProperty("text", oBinding.toBinding(oInfo));
			} else {
				this.setText(oSmartField.getTextLabel());
			}

			oInfo = oSmartField.getBindingInfo("tooltipLabel");
			if (oInfo) {
				this.bindProperty("tooltip", oBinding.toBinding(oInfo));
			} else {
				this.setTooltip(oSmartField.getTooltipLabel());
			}
		}

	};

	/**
	 * Triggers the obtainment of the meta data.
	 * 
	 * @private
	 */
	SmartLabel.prototype.getLabelInfo = function() {

		var oMetaDataProperty, oLabelInfo;
		
		var oSmartField = this._getField();

		if (oSmartField) {

			this._bindProperties();

			oMetaDataProperty = oSmartField.getDataProperty();
			if (oMetaDataProperty) {
				oLabelInfo = this._getLabelInfo(oMetaDataProperty);
				if (oLabelInfo) {
					if (oLabelInfo.text) {
						if (!oSmartField.getTextLabel()) {
							this.setText(oLabelInfo.text);
						}
					}
					if (oLabelInfo.quickinfo) {
						if (!oSmartField.getTooltipLabel()) {
							this.setTooltip(oLabelInfo.quickinfo);
						}
					}
				}
			}

			if (!oLabelInfo || !oLabelInfo.quickinfo) {
				if (!oSmartField.getTooltipLabel()) {
					this.setTooltip(this.getText());
				}
			}
		}
	};

	/**
	 * Assigns SmartField.
	 * 
	 * @param {sap.ui.comp.SmartField} oSmartField The associated SmartField control
	 * @public
	 */
	SmartLabel.prototype.setLabelFor = function(oSmartField) {
		
		if (oSmartField) {

			if (typeof oSmartField === 'string') {
				this._sSmartFieldId = oSmartField;				
			} else {
				this._sSmartFieldId = oSmartField.getId();
			}

			this._setLabelFor();
			
			sap.m.Label.prototype.setLabelFor.apply(this, [oSmartField]);				
		}
	};

	SmartLabel.prototype._getField = function() {
		
		if (this._sSmartFieldId) {
			return sap.ui.getCore().byId(this._sSmartFieldId);
		}
		
		return null;
	};
	
	SmartLabel.prototype._setLabelFor = function() {

		var oDataProperty;
		
		var oSmartField = this._getField();

		if (oSmartField) {
			if (oSmartField.getDataProperty) {
				oDataProperty = oSmartField.getDataProperty();
				if (oDataProperty) {
					this.getLabelInfo();
				} else {
					oSmartField.attachInitialise(jQuery.proxy(this.getLabelInfo, this));
				}
			}
		}
	};

	SmartLabel.prototype.updateLabelFor = function(aControls) {

		if (aControls && aControls.length > 0) {
			sap.m.Label.prototype.setLabelFor.apply(this, [aControls[0]]);
			aControls.splice(0, 1);
			this.updateAriaLabeledBy(aControls);
		}
	};
	
	SmartLabel.prototype.updateAriaLabeledBy = function(aControls) {

		if (aControls) {
			for (var i = 0; i < aControls.length; i++) {
				if (aControls[i].addAriaLabelledBy) {
					aControls[i].addAriaLabelledBy(this);
				}
			}
		}
	};	

	/**
	 * Retrieves all label related data from the OData property of a field
	 * 
	 * @param {object} oProperty the definition of a property of an OData entity.
	 * @returns {object} describing label specific data
	 * @private
	 */
	SmartLabel.prototype._getLabelInfo = function(oProperty) {

		var oAnnatotionHelper = new AnnotationHelper();

		if (oProperty && oProperty.property) {
			return {
				text: oAnnatotionHelper.getLabel(oProperty.property),
				quickinfo: oAnnatotionHelper.getQuickInfo(oProperty.property)
			};
		}
	};

	SmartLabel.prototype.onBeforeRendering = function() {

		if (this._sSmartFieldId) {
			this._setLabelFor();
		}
	};

	/**
	 * Cleans up the resources associated with this element and all its children. After an element has been destroyed, it can no longer be used on the
	 * UI. Applications should call this method if they don't need the element any longer.
	 * 
	 * @param {boolean} bSuppressInvalidate If set to <code>true</code>, UI element is not marked for redraw
	 * @public
	 */
	SmartLabel.prototype.destroy = function(bSuppressInvalidate) {

		this._sSmartFieldId = null;

		Label.prototype.destroy.apply(this, [
			bSuppressInvalidate
		]);
	};

	return SmartLabel;

}, /* bExport= */true);
