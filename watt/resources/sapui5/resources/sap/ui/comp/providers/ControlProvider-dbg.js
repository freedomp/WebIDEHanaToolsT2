/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// -------------------------------------------------------------------------------
// Generates the view metadata required for a field using SAP-Annotations metadata
// -------------------------------------------------------------------------------
sap.ui.define([
	'jquery.sap.global', 'sap/m/CheckBox', 'sap/m/ComboBox', 'sap/m/DatePicker', 'sap/m/HBox', 'sap/m/Input', 'sap/m/Text', 'sap/ui/comp/navpopover/SmartLink', 'sap/ui/comp/odata/MetadataAnalyser', 'sap/ui/comp/smartfield/ODataHelper', 'sap/ui/comp/smartfield/SmartField', 'sap/ui/comp/odata/ODataType', 'sap/ui/comp/util/FormatUtil'
], function(jQuery, CheckBox, ComboBox, DatePicker, HBox, Input, Text, SmartLink, MetadataAnalyser, ODataHelper, SmartField, ODataType, FormatUtil) {
	"use strict";

	// TODO: CleanUp!

	/**
	 * Constructs a class to generate the view/data model metadata for the controls - that can be used in table/forms etc.
	 * 
	 * @constructor
	 * @experimental This module is only for internal/experimental use!
	 * @public
	 * @param {object} mPropertyBag - PropertyBag having members model, entitySet
	 * @author Pavan Nayak
	 */
	var ControlProvider = function(mPropertyBag) {
		if (mPropertyBag) {
			this._oParentODataModel = mPropertyBag.model;
			this._oMetadataAnalyser = mPropertyBag.metadataAnalyser;
			this._aODataFieldMetadata = mPropertyBag.fieldsMetadata;
			this._oDateFormatSettings = mPropertyBag.dateFormatSettings;
			this._bEnableDescriptions = mPropertyBag.enableDescriptions;
			this._oCurrencyFormatSettings = mPropertyBag.currencyFormatSettings;
			this._oDefaultDropDownDisplayBehaviour = mPropertyBag.defaultDropDownDisplayBehaviour;
			this.useSmartField = mPropertyBag.useSmartField === "true";
			this._sEntitySet = mPropertyBag.entitySet;
		}

		if (!this._oMetadataAnalyser && this._oParentODataModel) {
			this._oMetadataAnalyser = new MetadataAnalyser(this._oParentODataModel);
			this._intialiseMetadata();
		}

		this._mSmartField = {};
		this._oHelper = new ODataHelper(this._oMetadataAnalyser.oModel);

		this._aValueListProvider = [];
		this._aValueHelpProvider = [];
	};

	/**
	 * Initialises the necessary metadata
	 * 
	 * @private
	 */
	ControlProvider.prototype._intialiseMetadata = function() {
		if (!this._aODataFieldMetadata) {
			this._aODataFieldMetadata = this._oMetadataAnalyser.getFieldsByEntitySetName(this.sEntity);
		}
	};

	/**
	 * Get the field metadata
	 * 
	 * @param {object} oFieldODataMetadata - OData metadata for the field
	 * @param {boolean} isEditable - specifies if the control shall be editable
	 * @returns {Object} the field view metadata object
	 * @public
	 */
	ControlProvider.prototype.getFieldViewMetadata = function(oFieldODataMetadata, isEditable) {
		var oFieldViewMetadata = this._createFieldMetadata(oFieldODataMetadata);
		// Create and set the template
		this._createFieldTemplate(oFieldViewMetadata, isEditable);
		return oFieldViewMetadata;
	};

	/**
	 * Creates and extends the field view with a template for the UI content
	 * 
	 * @param {object} oViewField - the view field metadata
	 * @param {boolean} isEditable - specifies if the control shall be editable
	 * @private
	 */
	ControlProvider.prototype._createFieldTemplate = function(oViewField, isEditable) {
		if (this.useSmartField) {
			oViewField.template = new SmartField({
				value: {
					path: oViewField.name
				},
				entitySet: this._sEntitySet,
				contextEditable: {
					path: "sm4rtM0d3l>/editable",
					mode: "OneWay"
				},
				controlContext: "table"
			});
			this._completeSmartField(oViewField);
		} else {
			oViewField.template = isEditable ? this._createEditableTemplate(oViewField) : this._createDisplayOnlyTemplate(oViewField);
		}
	};

	/**
	 * Completes the Smart Field template, adds especially meta data.
	 * 
	 * @param {object} oViewField the current meta data.
	 * @private
	 */
	ControlProvider.prototype._completeSmartField = function(oViewField) {
		var oData = {
			annotations: {},
			path: oViewField.name
		};

		if (!this._mSmartField.entitySetObject) {
			this._mSmartField.entitySetObject = this._oHelper.oMeta.getODataEntitySet(this._sEntitySet);
			this._mSmartField.entityType = this._oHelper.oMeta.getODataEntityType(this._mSmartField.entitySetObject.entityType);
		}

		oData.modelObject = this._oParentODataModel;
		oData.entitySetObject = this._mSmartField.entitySetObject;
		// ODataHelper expects entitySet and not entitySetObject!
		oData.entitySet = this._mSmartField.entitySetObject;
		oData.entityType = this._mSmartField.entityType;
		this._oHelper.getProperty(oData);

		oData.annotations.uom = this._oHelper.getUnitOfMeasure2(oData);
		oData.annotations.text = this._oHelper.getTextProperty2(oData);
		oData.annotations.lineitem = this._oMetadataAnalyser.getLineItemAnnotation(oData.entitySetObject.entityType);
		oData.annotations.semantic = this._oMetadataAnalyser.getSemanticObjectAnnotationFromProperty(oData.property.property); // EXC_JSHINT_037
		if (oData.property.property["sap:value-list"] || oData.property.property["com.sap.vocabularies.Common.v1.ValueList"]) {
			oData.annotations.valuelist = this._oHelper.getValueListAnnotationPath(oData);
			if (oData.property.property["sap:value-list"]) {
				oData.annotations.valuelistType = oData.property.property["sap:value-list"];
			} else {
				oData.annotations.valuelistType = this._oMetadataAnalyser.getValueListSemantics(oData.property.property["com.sap.vocabularies.Common.v1.ValueList"]);
			}
		}
		this._oHelper.getUOMValueListAnnotationPath(oData);
		delete oData.entitySet;
		oViewField.template.data("configdata", {
			"configdata": oData
		});

		oViewField.template.data("dateFormatSettings", this._oDateFormatSettings);
		oViewField.template.data("currencyFormatSettings", this._oCurrencyFormatSettings);
		oViewField.template.data("defaultDropDownDisplayBehaviour", this._oDefaultDropDownDisplayBehaviour);

		if (oData.annotations.uom) {
			var sAlign = oViewField.template.getTextAlign();

			if (sAlign === "Initial") {
				sAlign = "End";
			}
			oViewField.align = sAlign;
		}
	};

	/**
	 * Creates and extends the field view with a template for editable UI content
	 * 
	 * @param {object} oViewField - the view field
	 * @param {boolean} bBlockSmartLinkCreation - if true, no SmartLink is created independent of the semanitcObject notation
	 * @returns {sap.ui.core.Control} the template control
	 * @private
	 */
	ControlProvider.prototype._createEditableTemplate = function(oViewField, bBlockSmartLinkCreation) {
		var oTemplate = null, oFormatOptions, oConstraints, oType;
		if (oViewField.type === "Edm.DateTime" || oViewField.type === "Edm.DateTimeOffset") {
			// Create DatePicker for Date display fields
			if (oViewField.displayFormat === "Date") {
				oFormatOptions = this._oDateFormatSettings;
				oConstraints = {
					displayFormat: "Date"
				};
				oTemplate = new DatePicker({
					dateValue: {
						path: oViewField.name
					}
				});
			}
		} else if (oViewField.type === "Edm.Boolean") {
			oTemplate = new CheckBox({
				selected: {
					path: oViewField.name
				}
			});
		} else if (oViewField.type === "Edm.Decimal") {
			oConstraints = {
				precision: oViewField.precision,
				scale: oViewField.scale
			};
		}

		oType = ODataType.getType(oViewField.type, oFormatOptions, oConstraints);

		// semantic link
		if (oViewField.semanticObject && (!bBlockSmartLinkCreation)) {
			oTemplate = this._createSmartLinkFieldTemplate(oViewField, oType, jQuery.proxy(function() {
				return this._createEditableTemplate(oViewField, true);
			}, this));
		}

		// TODO: ComboBox handling!

		// Default ==> sap.m.Input
		if (!oTemplate) {
			oTemplate = new Input({
				value: {
					path: oViewField.name,
					type: oType
				}
			});

			if (oViewField.isMeasureField) {
				oTemplate.bindProperty("description", {
					path: oViewField.unit
				});
				oTemplate.setTextAlign("End");
				oTemplate.setFieldWidth("80%");
			} else if (this._bEnableDescriptions && oViewField.description) {
				oTemplate.bindProperty("description", {
					path: oViewField.description
				});
			}

			if (oViewField.hasValueListAnnotation) {
				this._associateValueHelpAndSuggest(oTemplate, oViewField);
			}
		}
		return oTemplate;
	};

	/**
	 * Associates the control with a ValueHelp Dialog and suggest using the details retrieved from the metadata (annotation)
	 * 
	 * @param {object} oControl - The control
	 * @param {object} oFieldViewMetadata - The metadata merged from OData metadata and additional control configuration
	 * @private
	 */
	ControlProvider.prototype._associateValueHelpAndSuggest = function(oControl, oFieldViewMetadata) {
		// F4 Help with selection list
		oControl.setShowValueHelp(true);
		this._aValueHelpProvider.push(new sap.ui.comp.providers.ValueHelpProvider({
			loadAnnotation: true,
			fullyQualifiedFieldName: oFieldViewMetadata.fullName,
			metadataAnalyser: this._oMetadataAnalyser,
			control: oControl,
			model: this._oParentODataModel,
			preventInitialDataFetchInValueHelpDialog: true,
			takeOverInputValue: false,
			fieldName: oFieldViewMetadata.fieldName,
			type: oFieldViewMetadata.type,
			maxLength: oFieldViewMetadata.maxLength,
			displayFormat: oFieldViewMetadata.displayFormat,
			displayBehaviour: oFieldViewMetadata.displayBehaviour,
			title: oFieldViewMetadata.label
		}));

		oControl.setShowSuggestion(true);
		oControl.setFilterSuggests(false);
		this._aValueListProvider.push(new sap.ui.comp.providers.ValueListProvider({
			loadAnnotation: true,
			fullyQualifiedFieldName: oFieldViewMetadata.fullName,
			metadataAnalyser: this._oMetadataAnalyser,
			control: oControl,
			model: this._oParentODataModel,
			typeAheadEnabled: true,
			aggregation: "suggestionRows",
			displayFormat: oFieldViewMetadata.displayFormat
		}));
	};

	/**
	 * Creates and extends the field view with a template for display only UI content
	 * 
	 * @param {object} oViewField - the view field
	 * @param {boolean} bBlockSmartLinkCreation - if true, no SmartLink is created independent of the semanitcObject notation
	 * @returns {sap.ui.core.Control} the template control
	 * @private
	 */
	ControlProvider.prototype._createDisplayOnlyTemplate = function(oViewField, bBlockSmartLinkCreation) {
		var oTemplate = null, oType = null, oFormatOptions, oConstraints, sAlign, sDisplayBehaviour, oBindingInfo;

		// Create Date type for Date display fields
		if (oViewField.displayFormat === "Date") {
			oFormatOptions = this._oDateFormatSettings;
			oConstraints = {
				displayFormat: "Date"
			};
		} else if (oViewField.type === "Edm.Decimal") {
			oConstraints = {
				precision: oViewField.precision,
				scale: oViewField.scale
			};
		}

		oType = ODataType.getType(oViewField.type, oFormatOptions, oConstraints);

		if (ODataType.isNumeric(oViewField.type) || ODataType.isDateOrTime(oViewField.type)) {
			sAlign = "End";
		}

		if (oViewField.isMeasureField) {
			oTemplate = this._createMeasureFieldTemplate(oViewField, oType);
		} else if (oViewField.semanticObject && (!bBlockSmartLinkCreation)) {
			oTemplate = this._createSmartLinkFieldTemplate(oViewField, oType, jQuery.proxy(function() {
				return this._createDisplayOnlyTemplate(oViewField, true);
			}, this));
		} else {
			oBindingInfo = {
				path: oViewField.name,
				type: oType
			};
			if (this._bEnableDescriptions && oViewField.description) {
				sDisplayBehaviour = this._oDefaultDropDownDisplayBehaviour || "descriptionAndId";
				oBindingInfo = {
					parts: [
						{
							path: oViewField.name,
							type: oType
						}, {
							path: oViewField.description
						}
					],
					formatter: function(sId, sDescription) {
						return FormatUtil.getFormattedExpressionFromDisplayBehaviour(sDisplayBehaviour, sId, sDescription);
					}
				};
			}
			oTemplate = new Text({
				wrapping: false,
				textAlign: sAlign,
				text: oBindingInfo
			});
		}

		oViewField.align = sAlign;

		return oTemplate;
	};

	/**
	 * Creates and extends the field view with a template for currency (display only) content
	 * 
	 * @param {object} oViewField - the view field
	 * @param {object} oType - the binding data type
	 * @param {function} fCreateControl - callback function which creates the control which would have been created instead of the SmartLink
	 * @returns {Object} the template
	 * @private
	 */
	ControlProvider.prototype._createSmartLinkFieldTemplate = function(oViewField, oType, fCreateControl) {
		// semantic link
		var oTemplate = new SmartLink({
			semanticObject: oViewField.semanticObject,
			semanticObjectLabel: oViewField.label,
			fieldName: oViewField.name,
			text: {
				path: oViewField.name,
				type: oType
			}
		});

		oTemplate.setCreateControlCallback(fCreateControl);

		return oTemplate;
	};

	/**
	 * Creates and extends the field view with a template for currency (display only) content
	 * 
	 * @param {object} oViewField - the view field
	 * @param {object} oType - the odata binding data type
	 * @private
	 * @returns {Object} the template
	 */
	ControlProvider.prototype._createMeasureFieldTemplate = function(oViewField, oType) {
		var oTemplate, oValueText, oUnitText, bEnableCurrencySymbol = false;

		bEnableCurrencySymbol = !!(oViewField.isCurrencyField && this._oCurrencyFormatSettings && this._oCurrencyFormatSettings.showCurrencySymbol);

		oValueText = new Text({
			wrapping: false,
			textAlign: "End",
			text: {
				parts: [
					{
						path: oViewField.name,
						type: oType
					}, {
						path: oViewField.unit
					}
				],
				formatter: oViewField.isCurrencyField ? FormatUtil.getAmountCurrencyFormatter() : FormatUtil.getMeasureUnitFormatter(),
				useRawValues: oViewField.isCurrencyField
			}
		});
		oUnitText = new Text({
			wrapping: false,
			textAlign: "Begin",
			width: "2.5em",
			text: {
				path: oViewField.unit,
				formatter: bEnableCurrencySymbol ? FormatUtil.getCurrencySymbolFormatter() : undefined
			}
		});

		// Create measure format using HBox --> we need to 2 controls to properly align the value and unit part
		oTemplate = new HBox({
			justifyContent: "End",
			items: [
				oValueText, oUnitText
			]
		});
		return oTemplate;
	};

	/**
	 * Calculates and sets additional flags and attributes for a field
	 * 
	 * @param {object} oFieldODataMetadata - OData metadata for the field
	 * @returns {object} the field view metadata
	 * @private
	 */
	ControlProvider.prototype._createFieldMetadata = function(oFieldODataMetadata) {
		var oFieldViewMetadata = {};

		oFieldViewMetadata.fullName = oFieldODataMetadata.fullName;
		oFieldViewMetadata.type = oFieldODataMetadata.type;
		oFieldViewMetadata.name = oFieldODataMetadata.name;
		oFieldViewMetadata.displayFormat = oFieldODataMetadata.displayFormat;
		oFieldViewMetadata.maxLength = oFieldODataMetadata.maxLength;
		oFieldViewMetadata.precision = oFieldODataMetadata.precision;
		oFieldViewMetadata.scale = oFieldODataMetadata.scale;
		oFieldViewMetadata.sortable = oFieldODataMetadata.sortable;
		oFieldViewMetadata.filterable = oFieldODataMetadata.filterable;
		oFieldViewMetadata.label = oFieldODataMetadata.fieldLabel || oFieldODataMetadata.name;
		oFieldViewMetadata.quickInfo = oFieldODataMetadata.quickInfo || oFieldViewMetadata.label;
		oFieldViewMetadata.aggregationRole = oFieldODataMetadata.aggregationRole;
		oFieldViewMetadata.unit = oFieldODataMetadata.unit;
		oFieldViewMetadata.description = oFieldODataMetadata.description;
		oFieldViewMetadata.isCurrencyField = oFieldODataMetadata.isCurrencyField;
		oFieldViewMetadata.isMeasureField = oFieldODataMetadata.isMeasureField;
		oFieldViewMetadata.filterType = this._getFilterType(oFieldODataMetadata);
		oFieldViewMetadata.entityName = oFieldODataMetadata.entityName;
		this._updateValueListMetadata(oFieldViewMetadata, oFieldODataMetadata);
		this._setAnnotationMetadata(oFieldViewMetadata);

		return oFieldViewMetadata;
	};

	/**
	 * Update the metadata for ValueList annotation
	 * 
	 * @param {Object} oFieldViewMetadata - view metadata for the filter field
	 * @param {object} oFieldODataMetadata - OData metadata for the filter field
	 * @private
	 */
	ControlProvider.prototype._updateValueListMetadata = function(oFieldViewMetadata, oFieldODataMetadata) {
		// First check for "sap:value-list" annotation
		oFieldViewMetadata.hasValueListAnnotation = oFieldODataMetadata["sap:value-list"] !== undefined;
		if (oFieldViewMetadata.hasValueListAnnotation) {
			oFieldViewMetadata.hasFixedValues = oFieldODataMetadata["sap:value-list"] === "fixed-values";
		} else if (oFieldODataMetadata["com.sap.vocabularies.Common.v1.ValueList"]) {
			// Then check for "com.sap.vocabularies.Common.v1.ValueList", and retrieve the semantics
			oFieldViewMetadata.hasValueListAnnotation = true;
			oFieldViewMetadata.hasFixedValues = this._oMetadataAnalyser.getValueListSemantics(oFieldODataMetadata["com.sap.vocabularies.Common.v1.ValueList"]) === "fixed-values";
		}
	};

	/**
	 * Set any annotation(s) metadata on the control
	 * 
	 * @param {Object} oFieldViewMetadata - the field view metadata
	 * @private
	 */
	ControlProvider.prototype._setAnnotationMetadata = function(oFieldViewMetadata) {
		var mAnnotation = null;
		if (!this.useSmartField && oFieldViewMetadata && oFieldViewMetadata.fullName) {
			// Update with SemanticObject annotation data
			mAnnotation = this._oMetadataAnalyser.getSemanticObjectAnnotation(oFieldViewMetadata.fullName);
			if (mAnnotation) {
				oFieldViewMetadata.semanticObject = mAnnotation.semanticObject;
			}
		}
	};
	/**
	 * Returns the filterType of the field based on metadata, else undefined
	 * 
	 * @param {object} oField - OData metadata for the field
	 * @returns {string} the filter type for the field
	 * @private
	 */
	ControlProvider.prototype._getFilterType = function(oField) {
		if (oField.type === "Edm.Decimal") {
			return "numeric";
		} else if (oField.type === "Edm.DateTime" && oField.displayFormat === "Date") {
			return "date";
		} else if (oField.type === "Edm.String") {
			return "string";
		}
		return undefined;
	};

	/**
	 * Destroys the object
	 * 
	 * @public
	 */
	ControlProvider.prototype.destroy = function() {
		var i;
		if (this._oMetadataAnalyser && this._oMetadataAnalyser.destroy) {
			this._oMetadataAnalyser.destroy();
		}
		this._oMetadataAnalyser = null;
		if (this._aValueHelpProvider) {
			i = this._aValueHelpProvider.length;
			while (i--) {
				this._aValueHelpProvider[i].destroy();
			}
		}
		this._aValueHelpProvider = null;

		if (this._aValueListProvider) {
			i = this._aValueListProvider.length;
			while (i--) {
				this._aValueListProvider[i].destroy();
			}
		}

		if (this._oHelper) {
			this._oHelper.destroy();
		}

		this._oHelper = null;
		this._mSmartField = null;
		this._aValueListProvider = null;
		this._aODataFieldMetadata = null;
		this._oCurrencyFormatter = null;
		this.bIsDestroyed = true;
	};

	return ControlProvider;

}, /* bExport= */true);
