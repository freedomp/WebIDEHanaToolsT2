/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// -----------------------------------------------------------------------------
// Generates the view metadata required for SmartTable using SAP-Annotations metadata
// -----------------------------------------------------------------------------
sap.ui.define([
	'jquery.sap.global', 'sap/ui/comp/odata/MetadataAnalyser', './ControlProvider', 'sap/ui/comp/util/FormatUtil'
], function(jQuery, MetadataAnalyser, ControlProvider, FormatUtil) {
	"use strict";

	/**
	 * Constructs a class to generate the view/data model metadata for the SmartTable from the SAP-Annotations metadata
	 * 
	 * @constructor
	 * @experimental This module is only for internal/experimental use!
	 * @public
	 * @param {object} mPropertyBag - PropertyBag having members model, entitySet
	 * @author Pavan Nayak
	 */
	var TableProvider = function(mPropertyBag) {
		if (mPropertyBag) {
			this._oParentODataModel = mPropertyBag.model;
			this.sEntitySet = mPropertyBag.entitySet;
			this._sIgnoredFields = mPropertyBag.ignoredFields;
			this._sInitiallyVisibleFields = mPropertyBag.initiallyVisibleFields;
			this.isEditableTable = mPropertyBag.isEditableTable;
			this._isAnalyticalTable = mPropertyBag.isAnalyticalTable;
			this.useSmartField = mPropertyBag.useSmartField;
			this.enableInResultForLineItem = mPropertyBag.enableInResultForLineItem === "true";
			try {
				this._oDateFormatSettings = mPropertyBag.dateFormatSettings ? JSON.parse(mPropertyBag.dateFormatSettings) : undefined;
				this._oCurrencyFormatSettings = mPropertyBag.currencyFormatSettings ? JSON.parse(mPropertyBag.currencyFormatSettings) : undefined;
				this._oDefaultDropDownDisplayBehaviour = mPropertyBag.defaultDropDownDisplayBehaviour;
			} catch (ex) {
				// Invalid dateformat provided!
			}
		}
		this._aODataFieldMetadata = [];
		this._aTableViewMetadata = [];
		this._aIgnoredFields = [];
		this._oMetadataAnalyser = new MetadataAnalyser(this._oParentODataModel);
		this._intialiseMetadata();
	};

	/**
	 * Initialises the necessary table metadata
	 * 
	 * @private
	 */
	TableProvider.prototype._intialiseMetadata = function() {
		var aTableViewMetadata = [], i, iLen, oField, oTableViewField, fSorter, sSupportedFormats, sFullyQualifiedEntityTypeName;
		this._aODataFieldMetadata = this._oMetadataAnalyser.getFieldsByEntitySetName(this.sEntitySet);
		sFullyQualifiedEntityTypeName = this._oMetadataAnalyser.getEntityTypeNameFromEntitySetName(this.sEntitySet);
		this._oPresentationVariant = this._oMetadataAnalyser.getPresentationVariantAnnotation(sFullyQualifiedEntityTypeName);
		if (this._oPresentationVariant) {
			this._oLineItemAnnotation = this._oPresentationVariant.lineItemAnnotation;
		} else {
			this._oLineItemAnnotation = this._oMetadataAnalyser.getLineItemAnnotation(sFullyQualifiedEntityTypeName);
		}
		sSupportedFormats = this._oMetadataAnalyser.getEntityContainerAttribute("supported-formats");
		if (sSupportedFormats) {
			this._bSupportsExcelExport = sSupportedFormats.indexOf("xlsx") > -1;
		}
		this._generateIgnoredFieldsArray();

		this._oControlProvider = new ControlProvider({
			metadataAnalyser: this._oMetadataAnalyser,
			model: this._oParentODataModel,
			fieldsMetadata: this._aODataFieldMetadata,
			dateFormatSettings: this._oDateFormatSettings,
			currencyFormatSettings: this._oCurrencyFormatSettings,
			defaultDropDownDisplayBehaviour: this._oDefaultDropDownDisplayBehaviour,
			useSmartField: this.useSmartField,
			enableDescriptions: !this._isAnalyticalTable,
			entitySet: this.sEntitySet
		});

		this._oFieldSemanticObjectMap = {};

		if (this._aODataFieldMetadata) {
			iLen = this._aODataFieldMetadata.length;
		}
		for (i = 0; i < iLen; i++) {
			oField = this._aODataFieldMetadata[i];
			// Ignore the fields in the ignored list -or- the one marked with visible="false" in annotation
			if (this._aIgnoredFields.indexOf(oField.name) > -1 || !oField.visible) {
				continue;
			}
			// Check if field is not a Primitive type --> only generate metadata for primitive/simple type fields
			if (oField.type.indexOf("Edm.") === 0) {
				oTableViewField = this._oControlProvider.getFieldViewMetadata(oField, this.isEditableTable);
				this._enrichWithTableViewMetadata(oField, oTableViewField);
				aTableViewMetadata.push(oTableViewField);
				if (oTableViewField.semanticObject) {
					this._oFieldSemanticObjectMap[oTableViewField.name] = oTableViewField.semanticObject;
				}
			}
		}

		// Sorter function for sorting based on index (undefined has lower prio)
		fSorter = function(field1, field2) {
			if (field1.index || field1.index === 0) {
				if (field2.index || field2.index === 0) {
					// both fields have an index --> return the difference
					return field1.index - field2.index;
				}
				// Only field1 has an index --> it should be shown before field2
				return -1;
			}
			if (field2.index || field2.index === 0) {
				// Only field2 has an index --> field1 should be shown after field2
				return 1;
			}
			// both are equal (in our case no index present) --> keep the existing order
			return 0;
		};
		// Sort the array based on LineItem annotation order
		this._aTableViewMetadata = aTableViewMetadata.sort(fSorter);
	};

	/**
	 * Get the field semantic object map.
	 * 
	 * @returns {object} the semantic object map
	 * @public
	 */
	TableProvider.prototype.getFieldSemanticObjectMap = function() {
		return this._oFieldSemanticObjectMap;
	};

	/**
	 * Get the fields that can be added as Columns
	 * 
	 * @returns {Array} the table view metadata
	 * @public
	 */
	TableProvider.prototype.getTableViewMetadata = function() {
		return this._aTableViewMetadata;
	};

	/**
	 * Returns a flag indicating whether excel export is supported by this table (OData service).
	 * 
	 * @returns {boolean} whether excel export is supported
	 * @public
	 */
	TableProvider.prototype.getSupportsExcelExport = function() {
		return this._bSupportsExcelExport;
	};

	/**
	 * Returns a flag indicating whether date handling with UTC is enabled for the table.
	 * 
	 * @returns {boolean} whether UTC date handling is enabled
	 * @public
	 */
	TableProvider.prototype.getIsUTCDateHandlingEnabled = function() {
		return this._oDateFormatSettings ? this._oDateFormatSettings.UTC : false;
	};

	/**
	 * Generate an array of fields that need to be ignored in the SmartTable (if any)
	 * 
	 * @private
	 */
	TableProvider.prototype._generateIgnoredFieldsArray = function() {
		if (this._sIgnoredFields) {
			this._aIgnoredFields = this._sIgnoredFields.split(",");
		}
	};

	/**
	 * Calculates additional flags and attributes for a field e.g. whether TypeAhead is switched on
	 * 
	 * @param {object} oFieldODataMetadata - OData metadata for the table field
	 * @param {object} oFieldViewMetadata - the table view field
	 * @private
	 */
	TableProvider.prototype._enrichWithTableViewMetadata = function(oFieldODataMetadata, oFieldViewMetadata) {
		var sAdditionalProperty;
		// Label is already set and can be updated if present in the LineItem annotation
		this._updateLabel(oFieldViewMetadata);
		oFieldViewMetadata.isInitiallyVisible = this._isInitiallyVisible(oFieldODataMetadata);
		oFieldViewMetadata.index = this._getIndex(oFieldODataMetadata);
		oFieldViewMetadata.width = FormatUtil.getWidth(oFieldODataMetadata);

		// additional property handling for table
		if (oFieldViewMetadata.isMeasureField && oFieldViewMetadata.unit) {
			sAdditionalProperty = oFieldViewMetadata.unit;
		} else if (oFieldViewMetadata.description) {
			sAdditionalProperty = oFieldViewMetadata.description;
		}
		oFieldViewMetadata.additionalProperty = sAdditionalProperty;

		// aggregation-role= "measure" --> columns shall be summed on the UI (analytical table)
		oFieldViewMetadata.summed = oFieldODataMetadata.aggregationRole === "measure";
		// set the inResult from metadata
		this._setInResult(oFieldViewMetadata);
		// set the sortOrder from metadata
		this._setSortOrder(oFieldViewMetadata);
	};

	/**
	 * Returns a flag indicating whether the field should be initially visible on the UI *
	 * 
	 * @param {object} oField - OData metadata for the table field
	 * @returns {boolean} if the field should be initially visible
	 * @private
	 */
	TableProvider.prototype._isInitiallyVisible = function(oField) {
		var bInitiallyVisible = false;
		// Check if field exists in LineItem annotation (based on prio)
		if (this._oLineItemAnnotation && this._oLineItemAnnotation.fields) {
			bInitiallyVisible = this._oLineItemAnnotation.fields.indexOf(oField.name) > -1;

			if (bInitiallyVisible && !sap.ui.Device.system.desktop) {
				var sImportance = this._getFieldImportance(oField);
				if (sImportance) {
					if (sap.ui.Device.system.tablet) {
						bInitiallyVisible = sImportance === "High" || sImportance === "Medium"; // on tablets only show initially importance
						// high/medium columns
					} else if (sap.ui.Device.system.phone) {
						bInitiallyVisible = sImportance === "High"; // on phones only show initially importance high columns
					}
				}
			}
		}
		// Also check if field is part of SmartTable configuration
		if (!bInitiallyVisible && this._sInitiallyVisibleFields) {
			bInitiallyVisible = this._sInitiallyVisibleFields.indexOf(oField.name) > -1;
		}
		return bInitiallyVisible;
	};

	/**
	 * Sets inResult on the field metadata if the field exists in the RequestAtLeast of PresentationVariant annotation (or when
	 * enableInResultForLineItem is set, from LineItem annotation)
	 * 
	 * @param {object} oField - OData metadata for the table field
	 * @private
	 */
	TableProvider.prototype._setInResult = function(oField) {
		// first check if field is part of PresentationVariant-->RequestAtLeastFields
		if (this._oPresentationVariant) {
			if (this._oPresentationVariant.requestAtLeastFields && this._oPresentationVariant.requestAtLeastFields.indexOf(oField.name) > -1) {
				oField.inResult = true;
			}
		} else if (this.enableInResultForLineItem) {
			// else set inResult based on LineItem (mainly relevant for AnalyticalTable) only in non PresentationVariant use case
			if (this._oLineItemAnnotation && this._oLineItemAnnotation.fields && this._oLineItemAnnotation.fields.indexOf(oField.name) > -1) {
				oField.inResult = true;
			}
		}
	};

	/**
	 * Sets sorting realted info (sorted and sortOrder) on the field metadata if the field exists in the SortOrder of PresentationVariant annotation
	 * 
	 * @param {object} oField - OData metadata for the table field
	 * @private
	 */
	TableProvider.prototype._setSortOrder = function(oField) {
		var iLen;
		// first check if field is part of PresentationVariant-->SortOrder
		if (this._oPresentationVariant && this._oPresentationVariant.sortOrderFields) {
			iLen = this._oPresentationVariant.sortOrderFields.length;
			for (var i = 0; i < iLen; i++) {
				if (this._oPresentationVariant.sortOrderFields[i].name === oField.name) {
					oField.sorted = true;
					oField.sortOrder = this._oPresentationVariant.sortOrderFields[i].descending ? "Descending" : "Ascending";
					break;
				}
			}
		}
	};

	/**
	 * Returns the important annotation for the given field or null
	 * 
	 * @param {object} oField - OData metadata for the table field
	 * @returns {string} the important annotation
	 * @private
	 */
	TableProvider.prototype._getFieldImportance = function(oField) {
		var sReturnValue = null;

		if (this._oLineItemAnnotation && this._oLineItemAnnotation.importance) {
			sReturnValue = this._oLineItemAnnotation.importance[oField.name];
		}

		return sReturnValue;
	};

	/**
	 * Returns the index if the field from LineItem annotation, if it was found
	 * 
	 * @param {object} oField - OData metadata for the table field
	 * @returns {string} the index of the field (or undefined)
	 * @private
	 */
	TableProvider.prototype._getIndex = function(oField) {
		var iIndex = -1, iLength = 0;
		// Get the field order from LineItem annotation
		if (this._oLineItemAnnotation && this._oLineItemAnnotation.fields) {
			iLength = this._oLineItemAnnotation.fields.length;
			iIndex = this._oLineItemAnnotation.fields.indexOf(oField.name);
		}
		// If LineItem exists try to make configuration fields appear at the end
		if (iIndex < 0 && this._sInitiallyVisibleFields) {
			iIndex = this._sInitiallyVisibleFields.indexOf(oField.name) + iLength;
		}
		if (iIndex > -1) {
			return iIndex;
		}
		return undefined;
	};

	/**
	 * Updated the label from LineItem annotation metadata (if it exists)
	 * 
	 * @param {object} oField - OData view metadata of the field
	 * @private
	 */
	TableProvider.prototype._updateLabel = function(oField) {
		var sLabel;
		if (this._oLineItemAnnotation && this._oLineItemAnnotation.labels) {
			sLabel = this._oLineItemAnnotation.labels[oField.name];
		}
		if (sLabel) {
			oField.label = sLabel;

			if (oField.template && oField.template.setSemanticObjectLabel) { // SmartLink needs to know the overwritten name, as it is displayed in
				// the
				// navigation popover
				oField.template.setSemanticObjectLabel(oField.label);
			}
		}
	};

	/**
	 * Destroys the object
	 * 
	 * @public
	 */
	TableProvider.prototype.destroy = function() {
		if (this._oMetadataAnalyser && this._oMetadataAnalyser.destroy) {
			this._oMetadataAnalyser.destroy();
		}
		this._oMetadataAnalyser = null;
		this._aODataFieldMetadata = null;
		this._aTableViewMetadata = null;
		this._aIgnoredFields = null;
		this._sIgnoredFields = null;
		this._sInitiallyVisibleFields = null;
		this.bIsDestroyed = true;
	};

	return TableProvider;

}, /* bExport= */true);
