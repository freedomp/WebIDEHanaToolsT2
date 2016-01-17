/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/*global Promise */// declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.define([ 
	'jquery.sap.global', 
	'sap/ui/comp/odata/FieldSelectorModelConverter',
	'sap/ui/dt/ElementUtil',
	'./Utils'],
function(jQuery, FieldSelectorModelConverter, ElementUtil, Utils) {
	"use strict";

	/**
	 * Class for ModelConverter.
	 * 
	 * @class
	 * ModelConverter functionality to get a converted model from a given OData Model, which includes checks for already bound and visible properties on the UI as well as renamed labels for sap:label
	 *
	 * @author SAP SE
	 * @version 1.32.7
	 *
	 * @private
	 * @static
	 * @since 1.33
	 * @alias sap.ui.rta.ModelConverter
	 * @experimental Since 1.33. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ModelConverter = {};

	ModelConverter.getConvertedModelWithBoundAndRenamedLabels = function(oControl, aEntityTypes) {
		var that = this;
		var oModel = oControl.getModel();
		return this._getModelConverter(oModel).then(function(oFieldSelectorModelConverter) {
			return that._getFieldModel(oControl, oFieldSelectorModelConverter, aEntityTypes);
		});
	};

	ModelConverter._getModelConverter = function(oModel) {
		var oMetaModel = oModel.getMetaModel();
		return oMetaModel.loaded().then(function() {
			return new FieldSelectorModelConverter(oModel);
		}, function(oReason) {
			jQuery.sap.log.error("MetadataModel could not be loaded", oReason);
		});
	};
	
	ModelConverter._getIgnoredFields = function(oControl) {
		
		if (oControl && oControl.getIgnoredFields) {
			var sCsvIgnoredFields = oControl.getIgnoredFields();
			if (sCsvIgnoredFields) {
				var aIgnoredFields = sCsvIgnoredFields.split(",");
				return aIgnoredFields;
			}
		}
		return [];
	};
	
	/**
	 * Generates the field model based on renamed labels, already bound and visible fields as well as complex types
	 * @param  {Array} aEntityTypes List of entity types
	 * @param  {sap.ui.core.Control} oControl Currently selected control
	 * @return {Array} List of Fields for the given entity type
	 * @private
	 */
	ModelConverter._getFieldModel = function(oControl, oFieldSelectorModelConverter, aEntityTypes) {
		var aIgnoredFields = this._getIgnoredFields(oControl);
		var oConvertedModel = oFieldSelectorModelConverter.getConvertedModel(aEntityTypes, aIgnoredFields);
		
		var oVisibleAndBoundFields = this._findVisibleAndBoundFieldsAndLabelNames(oControl);

		var mVisibleAndBoundFields = oVisibleAndBoundFields.visibleAndBoundFields;
		var mFieldsAndLabelNames = oVisibleAndBoundFields.fieldsAndLabelNames;
		var mFieldsAndBoundPropertyName = oVisibleAndBoundFields.fieldsAndBoundPropertyName;
		var mBoundFieldsId = oVisibleAndBoundFields.boundFieldsId;
		var sEntityType;

		for (var z = 0; z < aEntityTypes.length; z++) {
			sEntityType = aEntityTypes[z];
			for (var i = 0; i < oConvertedModel[sEntityType].length; i++) {
				var oActModelEntity = oConvertedModel[sEntityType][i];
				var complexTypePropertyName = oFieldSelectorModelConverter.getMetaDataAnalyzer()
						._getNameOfPropertyUsingComplexType(sEntityType, oActModelEntity.entityName);
				if (mVisibleAndBoundFields[oActModelEntity.name]) {
					oActModelEntity.checked = true;
					
				}
				oActModelEntity.controlId = mBoundFieldsId[oActModelEntity.name];
				//Check for complexTypes
				if (complexTypePropertyName) {
					oActModelEntity.isComplexType = true;
					oActModelEntity.complexTypeName = complexTypePropertyName;

					if (mVisibleAndBoundFields[complexTypePropertyName + "/" + oActModelEntity.name]) {
						oActModelEntity.checked = true;
						oActModelEntity.controlId = mVisibleAndBoundFields[complexTypePropertyName + "/" + oActModelEntity.name];
					}
				}
				//Check for renamed labels
				var sFieldLabel;
				
				if (oActModelEntity.isComplexType) {
					 sFieldLabel = mFieldsAndLabelNames[oActModelEntity.complexTypeName + "/" + oActModelEntity.name];
				} else {
					sFieldLabel = mFieldsAndLabelNames[oActModelEntity.name];
				}
				if (sFieldLabel && sFieldLabel !== oActModelEntity["sap:label"]) {
					oActModelEntity.fieldLabel = sFieldLabel;
				}

				oActModelEntity.boundProperty = mFieldsAndBoundPropertyName[oActModelEntity.name];
			}
		}
		return oConvertedModel[sEntityType];
	};

	/**
	 * Finds already bound and visible fields and saves the current label value
	 * @param  {sap.ui.core.Control} oControl Currently selected control
	 * @return {Object} visibleAndBoundFields: Lists of visible and bound fields, fieldsAndLabelNames: visible and LabelValue fields
	 * @private
	 */
	ModelConverter._findVisibleAndBoundFieldsAndLabelNames = function(oControl) {
		var mVisibleAndBoundFields = [];
		var mBoundFieldsId = [];
		var mFieldsAndLabelNames = {};
		var mFieldsAndBoundPropertyName = {};
		var aElements = ElementUtil.findAllPublicElements(oControl);
		var i = 0;
		if (oControl instanceof sap.m.ObjectHeader) {
			for (i = 0; i < aElements.length; i++) {
				var oObHeaderElement = aElements[i];

				if (oObHeaderElement instanceof sap.m.ObjectAttribute) {
					mVisibleAndBoundFields.push(oObHeaderElement.getBindingPath("text"));
				}
			}
		} else if ( oControl instanceof sap.ui.comp.smartform.SmartForm) {
			for (i = 0; i < aElements.length; i++) {
				var oFormElement = aElements[i];
				if (oFormElement.mBindingInfos) {
					for ( var oInfo in oFormElement.mBindingInfos) {
						var sPath = oFormElement.mBindingInfos[oInfo].parts[0].path ? oFormElement.mBindingInfos[oInfo].parts[0].path : "";
						var oParent = oFormElement.getParent();
						if (oParent && sPath) {
							mFieldsAndBoundPropertyName[sPath] = oInfo;
							var sFieldLabel = Utils.getLabelForElement(oParent);
							if (sFieldLabel) {
								mFieldsAndLabelNames[sPath] = sFieldLabel;
							}
							if (oFormElement.getDomRef()) {
								mVisibleAndBoundFields[sPath] = oParent.getId();
							}
							mBoundFieldsId[sPath] = oParent.getId();
						}
					}
				}

			}
		}

		return {
			visibleAndBoundFields : mVisibleAndBoundFields,
			boundFieldsId : mBoundFieldsId,
			fieldsAndLabelNames : mFieldsAndLabelNames,
			fieldsAndBoundPropertyName: mFieldsAndBoundPropertyName
		};
	};

	return ModelConverter;

}, /* bExport= */true);