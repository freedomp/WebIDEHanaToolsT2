/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
// -----------------------------------------------------------------------------
// Analyses the OData service metadata doc ($metadata), having SAP-Annotations,
// to resolve all properties from entities, filterable properties, etc.
// -----------------------------------------------------------------------------
/*global Promise */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/model/odata/ODataModel', 'sap/ui/model/odata/ODataAnnotations'
], function(jQuery, ODataModel, ODataAnnotations) {
	"use strict";

	/**
	 * Constructs a utility class to analyse the OData metadata document ($metadata), to resolve SAP-Annotations. \n<b>Note:</b> Please ensure that
	 * the promise returned by {@link sap.ui.model.odata.ODataMetaModel#loaded loaded} is resolved before using this class!
	 * 
	 * @constructor
	 * @experimental This module is only for internal/experimental use!
	 * @public
	 * @param {String} oResourceRootUri - The URL of the resource or ODataModel
	 * @author Pavan Nayak
	 */
	var MetadataAnalyser = function(oResourceRootUri) {
		if (typeof oResourceRootUri === "object") {
			this.oModel = oResourceRootUri;
		} else {
			this._sResourceRootUri = oResourceRootUri;
		}
		this._oMetadata = null;
		if (!this.oModel && this._sResourceRootUri) {
			this.oModel = new ODataModel(this._sResourceRootUri);
		}
		if (this.oModel) {
			this._oMetaModel = this.oModel.getMetaModel();
		}
		if (this._oMetaModel) {
			this._oMetadata = this._oMetaModel.getProperty("/");
		}

		// store the default schema
		if (this._oMetadata && this._oMetadata.dataServices) {
			this._oSchemaDefinition = this._oMetadata.dataServices.schema[0];
		}
	};

	// TODO: should we cache all these entity fields for future access?
	// this.mFilterFields[sEntityTypeName] = aFinalFilterableFields;

	/**
	 * Returns the namespace from the Schema
	 * 
	 * @returns {string} the namespace
	 * @public
	 * @deprecated Since 1.29.
	 */
	MetadataAnalyser.prototype.getNamespace = function() {
		if (this._oSchemaDefinition) {
			return this._oSchemaDefinition.namespace;
		}
	};

	/**
	 * @public Get the schema definition of the odata service
	 * @returns {Object} Get the schema definition of the odata service
	 * @deprecated Since 1.29.
	 */
	MetadataAnalyser.prototype.getSchemaDefinition = function() {
		return this._oSchemaDefinition;
	};

	/**
	 * Gets the specified attribute (sap:annotation) value from the default entity container
	 * 
	 * @param {String} sAttribute - The name of the attribute (sap:annotation) on the entity container
	 * @returns {String} The value of the specified attribute (if found)|null
	 * @public
	 */
	MetadataAnalyser.prototype.getEntityContainerAttribute = function(sAttribute) {
		var sAttributeValue = null, oEntityContainer;
		if (this._oMetaModel && sAttribute) {
			if (sAttribute.indexOf("sap:") < 0) {
				sAttribute = "sap:" + sAttribute;
			}
			oEntityContainer = this._oMetaModel.getODataEntityContainer();
			sAttributeValue = oEntityContainer[sAttribute] || null;
		}
		return sAttributeValue;
	};

	/**
	 * Gets the specified label for an Entity with non annotation
	 * 
	 * @param {string} sEntityType - name of the entity set
	 * @returns {string} - value of the label (if found)|empty
	 * @public
	 */
	MetadataAnalyser.prototype.getEntityLabelByEntityTypeName = function(sEntityType) {
		var oEntityDef = this._getEntityDefinition(sEntityType), oResult, sResult = "";
		if (oEntityDef) {
			oResult = oEntityDef["com.sap.vocabularies.Common.v1.Label"];
			if (oResult && oResult.String) {
				sResult = oResult.String;
			}
		}

		return sResult;
	};

	/**
	 * Gets the entity definition for the specified entity type
	 * 
	 * @param {String} sEntityTypeName - The entity type name as specified in the metadata document (with or without namespace)
	 * @returns {Object} entity definition
	 * @private
	 */
	MetadataAnalyser.prototype._getEntityDefinition = function(sEntityTypeName) {
		var oEntityDef = null;
		if (sEntityTypeName) {
			oEntityDef = this._oMetaModel.getODataEntityType(this._getFullyQualifiedNameForEntity(sEntityTypeName));
		}
		return oEntityDef;
	};

	/**
	 * Gets the complex type definition for the specified type
	 * 
	 * @param {String} sComplexTypeName - The complex type name as specified in the metadata document (with or without namespace)
	 * @returns {Object} entity definition
	 * @private
	 */
	MetadataAnalyser.prototype._getComplexTypeDefinition = function(sComplexTypeName) {
		var oComplexTypeDef = null;
		if (sComplexTypeName) {
			oComplexTypeDef = this._oMetaModel.getODataComplexType(this._getFullyQualifiedNameForEntity(sComplexTypeName));
		}
		return oComplexTypeDef;
	};

	/**
	 * Gets the property name of a complextype in a given entityType
	 * 
	 * @param {String} sEntityType - EntityType to search for the property
	 * @param {String} sComplexTypeEntityName - Type-Name of the complextype to resolve it.
	 * @returns {String} Returns the propertyname of the complextype as used in the given entityType
	 * @private
	 */
	MetadataAnalyser.prototype._getNameOfPropertyUsingComplexType = function(sEntityType, sComplexTypeEntityName) {
		var sCurrentNamespace = this.getNamespace();
		if (sEntityType && sComplexTypeEntityName && sCurrentNamespace) {
			var sTypeOnMainEntityType = sCurrentNamespace + "." + sComplexTypeEntityName;
			var oMainEntityTypeDef = this._getEntityDefinition(sEntityType);
			if (oMainEntityTypeDef) {
				var aProperties = oMainEntityTypeDef.property;
				if (aProperties && aProperties.length) {
					var i = 0;
					for (i = 0; i < aProperties.length; i++) {
						var oProperty = aProperties[i];
						if (oProperty && oProperty.type === sTypeOnMainEntityType) {
							return oProperty.name;
						}
					}
				}
			}
		}
		return null;
	};

	/**
	 * Removes the namespace from the specified string <br>
	 * returns string content that appears after the last "." separator <br>
	 * E.g.: if input is "com.sap.foo.EntityType", returns "EntityType" as the result
	 * 
	 * @param {string} sString String
	 * @returns {string} String without name space. If no name space was found, the original string will be returned.
	 * @public
	 */
	MetadataAnalyser.prototype.removeNamespace = function(sString) {
		var iIndex, sResult = sString;
		// Return the result
		if (sString) {
			iIndex = sString.lastIndexOf(".") + 1;
		}
		if (iIndex > 0) {
			sResult = sString.substring(iIndex);
		}
		return sResult;
	};

	/**
	 * Gets the entity type from the Entity name (EntitySet name)
	 * 
	 * @param {string} sEntitySetName - The entity name
	 * @returns {string} The entity type
	 * @private
	 */
	MetadataAnalyser.prototype.getEntityTypeNameFromEntitySetName = function(sEntitySetName) {
		var oEntitySet = null, sEntityTypeName = null;

		if (this._oMetaModel) {
			oEntitySet = this._oMetaModel.getODataEntitySet(sEntitySetName);
			if (oEntitySet) {
				sEntityTypeName = oEntitySet.entityType;
			}
		}
		return sEntityTypeName;
	};

	/**
	 * Gets the first matching entity set from the Entity Type name (EntityType name)
	 * 
	 * @param {string} sEntityTypeName - The entity name
	 * @returns {string} The entitySet name
	 * @private
	 * @deprecated Since 1.29.
	 */
	MetadataAnalyser.prototype.getEntitySetNameFromEntityTypeName = function(sEntityTypeName) {
		var sQualifiedEntity, oEntityContainer, aEntitySet, i, iLen, oEntitySet;
		// get entity type
		if (this._oMetaModel && sEntityTypeName) {
			sQualifiedEntity = this._getFullyQualifiedNameForEntity(sEntityTypeName);
			oEntityContainer = this._oMetaModel.getODataEntityContainer();
			if (oEntityContainer && sQualifiedEntity) {
				aEntitySet = oEntityContainer.entitySet;
				iLen = aEntitySet.length;
				for (i = 0; i < iLen; i++) {
					oEntitySet = aEntitySet[i];
					if (oEntitySet.entityType === sQualifiedEntity) {
						break;
					}
					oEntitySet = null;
				}
				// get entity set name
				if (oEntitySet) {
					return oEntitySet.name;
				}
			}
		}

		return null;
	};

	/**
	 * Gets a collection of keys (field names) for the specified entity name
	 * 
	 * @param {String} sEntitySetName - The entity name as specified in the metadata document
	 * @returns {Array} Array of key names
	 * @public
	 */
	MetadataAnalyser.prototype.getKeysByEntitySetName = function(sEntitySetName) {
		var aKeys = null, sEntityTypeName = null;
		if (!this._oMetaModel) {
			return undefined;
		}
		sEntityTypeName = this.getEntityTypeNameFromEntitySetName(sEntitySetName);
		if (sEntityTypeName) {
			aKeys = this.getKeysByEntityTypeName(sEntityTypeName);
		}
		return aKeys;
	};

	/**
	 * Gets a collection keys (field names) for the specified entity type
	 * 
	 * @param {String} sEntityTypeName - The entity type name as specified in the metadata document
	 * @returns {Array} Array of key names
	 * @public
	 */
	MetadataAnalyser.prototype.getKeysByEntityTypeName = function(sEntityTypeName) {
		var aKeys = null, aPropertyRefs = null, i, iLen = 0, oEntityDef = null;
		if (!this._oMetaModel) {
			return undefined;
		}
		oEntityDef = this._getEntityDefinition(sEntityTypeName);
		if (oEntityDef) {
			if (oEntityDef.key) {
				aPropertyRefs = oEntityDef.key.propertyRef;
				if (aPropertyRefs) {
					iLen = aPropertyRefs.length;
					aKeys = [];
					for (i = 0; i < iLen; i++) {
						aKeys.push(aPropertyRefs[i].name);
					}
				}
			}
		}
		return aKeys;
	};

	/**
	 * Gets a collection of fields for the specified entity name
	 * 
	 * @param {String} sEntitySetName - The entity name as specified in the metadata document
	 * @returns {Array} Array of fields
	 * @public
	 */
	MetadataAnalyser.prototype.getFieldsByEntitySetName = function(sEntitySetName) {
		var aFields = null, oEntitySet, sEntityTypeName = null;
		if (!this._oMetaModel) {
			return undefined;
		}
		oEntitySet = this._oMetaModel.getODataEntitySet(sEntitySetName);
		if (oEntitySet) {
			sEntityTypeName = oEntitySet.entityType;
		}

		if (sEntityTypeName) {
			aFields = this.getFieldsByEntityTypeName(sEntityTypeName);
			this._updateSortableOnFields(aFields, oEntitySet);
		}

		return aFields;
	};

	/**
	 * Updates/sets sortable property on fields based on the entitySet annotation (Org.OData.Capabilities.V1.SortRestrictions)
	 * 
	 * @param {Array} aFields - Array of field metadata derived from OData properties
	 * @param {Object} oEntitySet - The entity set instance from ODataMetaModel
	 * @public
	 */
	MetadataAnalyser.prototype._updateSortableOnFields = function(aFields, oEntitySet) {
		var oSortRestrictions, aNonSortableProperties, aNonSortablePaths = [], iLen, sPath, oField;
		if (!oEntitySet || !aFields) {
			return;
		}
		oSortRestrictions = oEntitySet["Org.OData.Capabilities.V1.SortRestrictions"];
		if (oSortRestrictions) {
			aNonSortableProperties = oSortRestrictions.NonSortableProperties;
		}
		if (aNonSortableProperties) {
			iLen = aNonSortableProperties.length;
			while (iLen--) {
				sPath = aNonSortableProperties[iLen].PropertyPath;
				if (sPath) {
					aNonSortablePaths.push(sPath);
				}
			}
		}
		// Loop over the fields
		iLen = aFields.length;
		while (iLen--) {
			oField = aFields[iLen];
			if (aNonSortablePaths.indexOf(oField.name) > -1) {
				oField.sortable = false;
			} else {
				oField.sortable = true;
			}
		}
	};

	/**
	 * Gets a collection of fields for the specified entity type
	 * 
	 * @param {String} sEntityTypeName - The entity type name as specified in the metadata document
	 * @returns {Array} Array of fields
	 * @public
	 */
	MetadataAnalyser.prototype.getFieldsByEntityTypeName = function(sEntityTypeName) {
		var oEntityDef;
		if (!this._oMetaModel) {
			return undefined;
		}
		oEntityDef = this._getEntityDefinition(sEntityTypeName);
		return this._getFieldsByEntityDefinition(oEntityDef);
	};

	/**
	 * Gets a collection of fields for the specified complex type
	 * 
	 * @param {String} sComplexTypeName - The complex type name as specified in the metadata document
	 * @param {string} sParentPropertyName - The name of the parent property (complex type property)
	 * @returns {Array} Array of fields
	 * @public
	 */
	MetadataAnalyser.prototype.getFieldsByComplexTypeName = function(sComplexTypeName, sParentPropertyName) {
		var oComplexDef;
		if (!this._oMetaModel) {
			return undefined;
		}
		oComplexDef = this._getComplexTypeDefinition(sComplexTypeName);
		return this._getFieldsByEntityDefinition(oComplexDef, sParentPropertyName);
	};

	/**
	 * Get an array of all entity type names
	 * 
	 * @returns {Array} Returns an array of entity type names
	 * @public
	 */
	MetadataAnalyser.prototype.getAllEntityTypeNames = function() {
		if (!this._oMetaModel) {
			return undefined;
		}
		var oSchema = this._oSchemaDefinition;
		if (oSchema.entityType && oSchema.entityType.length > 0) {
			var i = 0;
			var aResult = [];
			for (i = 0; i < oSchema.entityType.length; i++) {
				aResult.push(oSchema.entityType[i].name);
			}
			return aResult;
		}
		return null;
	};

	/**
	 * Gets a map with fields and their related semantic objects
	 * 
	 * @param {String} sEntitySetName - The entity set for which the map should be returned
	 * @returns {object} map between fields and semantic objects
	 * @public
	 */
	MetadataAnalyser.prototype.getFieldSemanticObjectMap = function(sEntitySetName) {
		var oMap = {};
		var aODataFieldMetadata = this.getFieldsByEntitySetName(sEntitySetName);
		var i, iLen = aODataFieldMetadata.length;
		for (i = 0; i < iLen; i++) {
			var oField = aODataFieldMetadata[i];
			var mAnnotation = this.getSemanticObjectAnnotation(oField.fullName);
			if (mAnnotation && mAnnotation.semanticObject) {
				oMap[oField.name] = mAnnotation.semanticObject;
			}
		}

		return oMap;
	};

	/**
	 * Gets a collection fields for the specified entity definition
	 * 
	 * @param {Object} oEntityDef - The entity definition as specified in the metadata document
	 * @param {string} sParentPropertyName - The name of the parent property (navigationProperty/complex type)
	 * @returns {Array} Array of fields
	 */
	MetadataAnalyser.prototype._getFieldsByEntityDefinition = function(oEntityDef, sParentPropertyName) {
		var aFields = null, aProperty = null, i = 0, iLen = 0, oProperty, oField, oResult;
		if (oEntityDef) {
			aProperty = oEntityDef.property;
		}
		// Enrich the fields with necessary information as an attribute (easy access)
		if (aProperty) {
			aFields = [];
			iLen = aProperty.length;
			for (i = 0; i < iLen; i++) {
				oProperty = aProperty[i];
				if (oProperty) {
					oField = jQuery.extend({}, oProperty);
					oResult = oProperty["com.sap.vocabularies.Common.v1.Label"];
					if (oResult) {
						oField.fieldLabel = oResult.String;
					}

					oResult = oProperty["com.sap.vocabularies.Common.v1.QuickInfo"];
					if (oResult) {
						oField.quickInfo = oResult.String;
					}

					oField.displayFormat = oProperty["sap:display-format"];
					oField.aggregationRole = oProperty["sap:aggregation-role"];

					oResult = oProperty["Org.OData.Measures.V1.ISOCurrency"];
					if (oResult) {
						oField.isCurrencyField = true;
						oField.isMeasureField = true;
						oField.unit = oResult.Path;
					}
					oResult = oProperty["Org.OData.Measures.V1.Unit"];
					if (oResult) {
						oField.isMeasureField = true;
						oField.unit = oResult.Path;
					}
					oResult = oProperty["com.sap.vocabularies.Common.v1.Text"];
					if (oResult) {
						oField.description = oResult.Path;
					}

					oField.filterRestriction = oProperty["sap:filter-restriction"];
					// Set filter attributes on the field
					oResult = oProperty["sap:filterable"];
					oField.filterable = oResult !== "false";
					oResult = oProperty["sap:required-in-filter"];
					oField.requiredField = oResult === "true";

					// Set the visible attribute on the field
					oResult = oProperty["com.sap.vocabularies.Common.v1.FieldControl"];
					oField.visible = !(oResult && oResult.EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/Hidden");
					oField.entityName = oEntityDef.name;
					oField.parentPropertyName = sParentPropertyName;
					oField.fullName = this._getFullyQualifiedNameForField(oProperty.name, oEntityDef);

					aFields.push(oField);
				}
			}
		}
		return aFields;
	};

	/**
	 * Gets a collection of all possible filterable fields for the specified entity name
	 * 
	 * @param {String} sEntitySetName - The entity name as specified in the metadata document
	 * @returns {Array} Array of overall filterable fields
	 * @public
	 */
	MetadataAnalyser.prototype.getAllFilterableFieldsByEntitySetName = function(sEntitySetName) {
		var aFilterGroups = [], sEntityTypeName = null;
		if (!this._oMetaModel) {
			return undefined;
		}
		sEntityTypeName = this.getEntityTypeNameFromEntitySetName(sEntitySetName);
		if (sEntityTypeName) {
			aFilterGroups = this.getAllFilterableFieldsByEntityTypeName(sEntityTypeName);
		}
		return aFilterGroups;
	};

	/**
	 * Gets a an Array of the names of all possible filterable fields for the specified entity type
	 * 
	 * @param {String} sEntityTypeName - The entity type name as specified in the metadata document
	 * @returns {Array} Array of names of overall filterable fields
	 * @public
	 */
	MetadataAnalyser.prototype.getAllFilterableFieldNamesByEntityTypeName = function(sEntityTypeName) {
		var aGroup, i, groupLength, j, fieldLength, aResult, oGroup;

		aResult = [];
		aGroup = this.getAllFilterableFieldsByEntityTypeName(sEntityTypeName);
		if (aGroup && aGroup.length) {
			groupLength = aGroup.length;
			for (i = 0; i < groupLength; i++) {
				oGroup = aGroup[i];
				if (oGroup.fields && oGroup.fields.length) {
					fieldLength = oGroup.fields.length;
					for (j = 0; j < fieldLength; j++) {
						aResult.push(oGroup.fields[j].name);
					}
				}
			}
		}
		return aResult;
	};

	/**
	 * Gets a collection of all possible filterable fields for the specified entity type
	 * 
	 * @param {String} sEntityTypeName - The entity type name as specified in the metadata document
	 * @returns {Array} Array of overall filterable fields
	 * @public
	 */
	MetadataAnalyser.prototype.getAllFilterableFieldsByEntityTypeName = function(sEntityTypeName) {
		var aFilterGroups = [], oEntityDef = null, mAssociations = null, sNavigationProperty = null, sSubEntityType = null;
		if (!this._oMetaModel) {
			return undefined;
		}
		oEntityDef = this._getEntityDefinition(sEntityTypeName);
		if (oEntityDef) {
			// filterable fields from the main entity
			aFilterGroups.push(this._getFilterableFieldsFromEntityDefinition(oEntityDef));

			// filterable fields from associations which have 0..1 or 1 cardinality
			mAssociations = this._getFilterableAssociations(oEntityDef);
			for (sNavigationProperty in mAssociations) {
				sSubEntityType = mAssociations[sNavigationProperty];
				oEntityDef = this._getEntityDefinition(sSubEntityType);
				aFilterGroups.push(this._getFilterableFieldsFromEntityDefinition(oEntityDef, sNavigationProperty));
			}
		}
		return aFilterGroups;
	};

	/**
	 * Gets an Object containing collection of filterable fields that are directly under the specified entity type
	 * 
	 * @param {Object} oEntityDef - The entity type definition from the metadata document
	 * @param {string} sParentPropertyName - The name of the parent property (navigationProperty/complex type)
	 * @returns {Object} Object containing array of filterable fields
	 * @private
	 */
	MetadataAnalyser.prototype._getFilterableFieldsFromEntityDefinition = function(oEntityDef, sParentPropertyName) {
		var oFilterData = {}, aFields = [], aProperties = null, oProp, i, iLen, oProperty = null;
		if (!this._oMetaModel || !oEntityDef) {
			return undefined;
		}
		// Set the name and label from entity into the field's group
		oProp = oEntityDef["com.sap.vocabularies.Common.v1.Label"];
		if (oProp) {
			oFilterData.groupLabel = oProp.String;
		}
		oFilterData.groupEntityName = oEntityDef.name;
		oFilterData.groupName = sParentPropertyName;

		aProperties = this._getFieldsByEntityDefinition(oEntityDef, sParentPropertyName);
		iLen = aProperties.length;
		// Extract only visible and filterable fields from all fields!
		for (i = 0; i < iLen; i++) {
			oProperty = aProperties[i];
			if (oProperty.visible && oProperty.filterable) {
				aFields.push(oProperty);
			}
		}
		oFilterData.fields = aFields;
		return oFilterData;
	};

	/**
	 * Returns the fully qualified name of a field which is e.g. "com.sap.GL.ZAF.GL_ACCOUNT/CompanyCode". Schema namespace, entity type name and field
	 * name.
	 * 
	 * @param {string} sFieldName - the name of the field/property
	 * @param {Object} oEntityType - the entity Type under which the field/property is present
	 * @returns {string} - the fully qualified name
	 * @private
	 */
	MetadataAnalyser.prototype._getFullyQualifiedNameForField = function(sFieldName, oEntityType) {
		var sNamespace, sEntityTypeName, sResult = sFieldName;
		if (oEntityType) {
			sNamespace = oEntityType.namespace;
			sEntityTypeName = oEntityType.name;
		}
		if (sNamespace && sEntityTypeName) {
			sResult = sNamespace + "." + sEntityTypeName + "/" + sFieldName;
		}
		return sResult;
	};

	/**
	 * @param {string} sFullyQualifiedFieldName Fully qualified name
	 * @returns {string} The field name without name space and without entity
	 * @public
	 */
	MetadataAnalyser.prototype.getFieldNameByFullyQualifiedFieldName = function(sFullyQualifiedFieldName) {
		var sResult, nPos;

		sResult = this.removeNamespace(sFullyQualifiedFieldName);
		nPos = sResult.indexOf("/");
		sResult = sResult.substring(nPos + 1);
		return sResult;
	};

	/**
	 * Gets a collection of filterable associations under the specified entity type
	 * 
	 * @param {Object} oEntityDef - The entity type definition from the metadata document
	 * @returns {Object} Map of filterable associations
	 * @private
	 */
	MetadataAnalyser.prototype._getFilterableAssociations = function(oEntityDef) {
		var mFilterableAssociations = {}, aNavigationProperties = null, oNavigationProperty = null, i, iLen = 0, oEndRole = null;
		if (!this._oMetaModel || !oEntityDef) {
			return undefined;
		}
		aNavigationProperties = oEntityDef.navigationProperty;
		if (aNavigationProperties && aNavigationProperties.length) {
			iLen = aNavigationProperties.length;
			for (i = 0; i < iLen; i++) {
				oNavigationProperty = aNavigationProperties[i];
				// if the navigation property is explicitly marked as not filterable; skip it
				if (oNavigationProperty["sap:filterable"] === "false") {
					continue;
				}
				// Get the End role of the navigation property
				oEndRole = this._oMetaModel.getODataAssociationEnd(oEntityDef, oNavigationProperty.name);
				if (!oEndRole || oEndRole.type === (oEntityDef.namespace + "." + oEntityDef.name)) {
					continue;
				}
				// check if the end role has cardinality 0..1 or 1
				if (oEndRole.multiplicity === "1" || oEndRole.multiplicity === "0..1") {
					// Only add filterable entities, if they were not already added
					if (mFilterableAssociations[oNavigationProperty.name] === undefined) {
						mFilterableAssociations[oNavigationProperty.name] = oEndRole.type;
					}
				}
			}
		}
		return mFilterableAssociations;
	};

	/**
	 * Retrieves the ValueList Annotation lazily for the specified property/target
	 * 
	 * @param {String} sPath the full path of the property/target (including the namespace)
	 * @returns {Promise} a Promise that would be resolved once the ValueList annotation is loaded -or- rejected if specified property path is
	 *          incorrect or value list could not be resolved
	 * @public
	 */
	MetadataAnalyser.prototype.getValueListAnnotationLazy = function(sPath) {
		var oPromise, mAnnotation = {
			additionalAnnotations: []
		}, oResolvedAnnotation, sParentFieldName, aPath, oType, sProperty, oPropertyContext, sQualifier;
		oPromise = new Promise(function(fResolve, fReject) {
			if (sPath && this._oMetaModel) {
				// Split the property path and
				aPath = sPath.split("/");
				// The type could either be an entity type or a complex type
				oType = this._oMetaModel.getODataEntityType(aPath[0]) || this._oMetaModel.getODataComplexType(aPath[0]);
				sParentFieldName = aPath[1];
				// Get the property path from the type
				sProperty = this._oMetaModel.getODataProperty(oType, sParentFieldName, true);
				if (sProperty) {
					// create property context from its path
					oPropertyContext = this._oMetaModel.createBindingContext(sProperty);

					this._oMetaModel.getODataValueLists(oPropertyContext).then(function(mValueList) {
						for (sQualifier in mValueList) {
							oResolvedAnnotation = {
								annotation: mValueList[sQualifier]
							};
							if (oResolvedAnnotation.annotation) {
								this._enrichValueHelpAnnotation(oResolvedAnnotation, sParentFieldName);
								// Check if there is no qualifier --> the default/primaryValueListAnnotation
								if (!sQualifier) {
									mAnnotation.primaryValueListAnnotation = oResolvedAnnotation;
								} else {
									// Set the qualifier on the resolved annotation
									oResolvedAnnotation.qualifier = sQualifier;
									mAnnotation.additionalAnnotations.push(oResolvedAnnotation);
								}
							}
						}
						fResolve(mAnnotation);
					}.bind(this), fReject);
					return;
				}
			}
			fReject();
		}.bind(this));
		return oPromise;
	};

	/**
	 * Retrieves the ValueList Annotation for the specified property/target
	 * 
	 * @param {String} sPath the full path of the property/target (including the namespace)
	 * @returns {Object} a Map of resolved ValueHelpList (if any) annotations
	 * @deprecated Since 1.29 - use #getValueListAnnotationLazy instead!
	 * @public
	 */
	MetadataAnalyser.prototype.getValueListAnnotation = function(sPath) {
		var mAnnotation = {
			additionalAnnotations: []
		}, oResolvedAnnotation, sParentFieldName, aPath, oType, oProperty, sQualifier;
		if (sPath && this._oMetaModel) {
			// Split the property path and
			aPath = sPath.split("/");
			// The type could either be an entity type or a complex type
			oType = this._oMetaModel.getODataEntityType(aPath[0]) || this._oMetaModel.getODataComplexType(aPath[0]);
			// Get the property from the type
			oProperty = this._oMetaModel.getODataProperty(oType, aPath[1]);
			if (oProperty) {
				sParentFieldName = oProperty.name;
				for ( var sProp in oProperty) {
					if (sProp.indexOf("com.sap.vocabularies.Common.v1.ValueList") > -1) {
						sQualifier = null;
						oResolvedAnnotation = {
							annotation: oProperty[sProp]
						};
						aPath = sProp.split("#");
						if (aPath.length === 2) {
							sQualifier = aPath[1];
						}
						if (oResolvedAnnotation.annotation) {
							this._enrichValueHelpAnnotation(oResolvedAnnotation, sParentFieldName);
							// Check if there is no qualifier --> the default/primaryValueListAnnotation
							if (!sQualifier) {
								mAnnotation.primaryValueListAnnotation = oResolvedAnnotation;
							} else {
								// Set the qualifier on the resolved annotation
								oResolvedAnnotation.qualifier = sQualifier;
								mAnnotation.additionalAnnotations.push(oResolvedAnnotation);
							}
						}
					}
				}
			}
		}
		return mAnnotation;
	};

	/**
	 * Enriches the provided Value Help annotation with key and other relevant information
	 * 
	 * @param {object} oAnnotation Annotation object
	 * @param {string} sParentFieldName - the parent field name
	 * @private
	 */
	MetadataAnalyser.prototype._enrichValueHelpAnnotation = function(oAnnotation, sParentFieldName) {
		var mResult, oResult, oEntitySet, aKeys = [], sKey, mInParams = {}, mOutParams = {}, bIsInParam, bIsOutParam, aFields = [], aValueListFields = [], aRecords, oProperty, sValueListProperty, sLocalDataProperty, oParam, iLen = 0, i = 0, iFieldLen = 0;
		if (oAnnotation && oAnnotation.annotation) {
			mResult = oAnnotation.annotation;
			if (mResult) {
				oResult = mResult["SearchSupported"];
				oAnnotation.isSearchSupported = oResult ? oResult.Bool === "true" : false;
				oResult = mResult["CollectionPath"];
				// Set the CollectionPath on the annotation
				if (oResult) {
					oAnnotation.valueListEntitySetName = oResult.String;
					if (this._oMetaModel) {
						oEntitySet = this._oMetaModel.getODataEntitySet(oAnnotation.valueListEntitySetName);
					}
					if (oEntitySet) {
						oAnnotation.valueListEntityName = oEntitySet.entityType;
						oAnnotation.semantics = oEntitySet["sap:semantics"];
						aKeys = this.getKeysByEntityTypeName(oAnnotation.valueListEntityName);
						aFields = this.getFieldsByEntityTypeName(oAnnotation.valueListEntityName);
					}
				}

				oResult = mResult["Label"];
				// Set the valueListTitle on the annotation
				if (oResult) {
					oAnnotation.valueListTitle = oResult.String;
				}

				// Get all the params to create mappings, fields, key etc
				aRecords = mResult["Parameters"];
				if (aFields && aRecords) {
					iLen = aRecords.length;
				}
				// Loop through all the parameters/records
				for (i = 0; i < iLen; i++) {
					oParam = aRecords[i];
					sValueListProperty = undefined;
					sLocalDataProperty = undefined;
					// Each Parameter on the VL annotation has max 2 properties:
					// LocalDataProperty - Path to the property on the local entity that triggered the ValueList
					// ValueListProperty - Path to property in on the ValueList entity
					oProperty = oParam["ValueListProperty"];
					if (oProperty) {
						sValueListProperty = oProperty.String;
					}
					oProperty = oParam["LocalDataProperty"];
					if (oProperty) {
						sLocalDataProperty = oProperty.PropertyPath;
					}

					bIsInParam = false;
					if (oParam.RecordType === "com.sap.vocabularies.Common.v1.ValueListParameterInOut" || oParam.RecordType === "com.sap.vocabularies.Common.v1.ValueListParameterIn") {
						bIsInParam = true;
					}
					bIsOutParam = false;
					if (oParam.RecordType === "com.sap.vocabularies.Common.v1.ValueListParameterInOut" || oParam.RecordType === "com.sap.vocabularies.Common.v1.ValueListParameterOut") {
						bIsOutParam = true;
					}

					// Mapping for In/InOut params
					if (bIsInParam) {
						mInParams[sLocalDataProperty] = sValueListProperty;
					}

					// Mapping for Out/InOut params
					if (bIsOutParam) {
						mOutParams[sLocalDataProperty] = sValueListProperty;
					}

					// For sFin/gateway; this apparently should form the columns/fields in the list!
					if (bIsOutParam || oParam.RecordType === "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly") {
						iFieldLen = aFields.length;
						while (iFieldLen--) {
							if (aFields[iFieldLen].name === sValueListProperty) {
								aValueListFields.push(aFields[iFieldLen]);
								break;
							}
						}
					}
					// The 1st InOut/Out param having the parent field as LocalDataProperty; should be the Key!
					if (!sKey && bIsOutParam && sLocalDataProperty === sParentFieldName) {
						sKey = sValueListProperty;
					}
				}
			}
			// Set the mappings, fields, keys, return key and corresponding description on the annotation
			oAnnotation.inParams = mInParams;
			oAnnotation.outParams = mOutParams;
			oAnnotation.fields = aFields;
			oAnnotation.valueListFields = aValueListFields;
			oAnnotation.keys = aKeys;
			oAnnotation.keyField = sKey;
			oAnnotation.descriptionField = this.getDescriptionFieldName(oAnnotation.keyField, oAnnotation.valueListEntitySetName);
		}
	};

	/**
	 * Gets the human readable text/description field's name from the specified Key field's name and entity name
	 * 
	 * @param {string|object} sKeyField - the name of the key field / oField - the field as present in the OData metadata
	 * @param {string} sEntityName - the name of the entity (required if the name of the field is passed as the 1st param)
	 * @returns {string} the description field name, if any
	 * @public
	 */
	MetadataAnalyser.prototype.getDescriptionFieldName = function(sKeyField, sEntityName) {
		var aFields, i = 0, iLength, oField, sDescriptionField;
		if (typeof sKeyField === "object") {
			oField = sKeyField;
		} else {
			aFields = this.getFieldsByEntitySetName(sEntityName);
			if (aFields) {
				iLength = aFields.length;
				for (i = 0; i < iLength; i++) {
					oField = aFields[i];
					if (oField.name === sKeyField) {
						// Found the specified field, exit loop
						break;
					}
					oField = null;
				}
			}
		}
		if (oField && oField["com.sap.vocabularies.Common.v1.Text"]) {
			sDescriptionField = oField["com.sap.vocabularies.Common.v1.Text"].Path;
		}
		return sDescriptionField;
	};

	/**
	 * Returns whether Search query is supported for this value help annotation
	 * 
	 * @param {object} oAnnotation - ValueHelpAnnotation
	 * @returns {boolean} whether search query is supported
	 * @public
	 */
	MetadataAnalyser.prototype.getIsSearchSupported = function(oAnnotation) {
		var bIsSearchSupported = false, oProperty;

		if (oAnnotation) {
			oProperty = oAnnotation.SearchSupported;
			if (oProperty && oProperty.Bool === "true") {
				bIsSearchSupported = true;
			}
		}

		return bIsSearchSupported;
	};

	/**
	 * Gets the valuelist entity sets semantics from the specified ValueList annotation
	 * 
	 * @param {Object} oAnnotation - the value list annotation
	 * @returns {string} - the semantics of the value list entity set (if any)
	 * @protected
	 */
	MetadataAnalyser.prototype.getValueListSemantics = function(oAnnotation) {
		var sEntitySet, oEntitySet, sSemantics;
		if (oAnnotation) {
			sEntitySet = oAnnotation["CollectionPath"] ? oAnnotation["CollectionPath"].String : undefined;
		}
		if (sEntitySet) {
			oEntitySet = this._oMetaModel.getODataEntitySet(sEntitySet);
			if (oEntitySet) {
				sSemantics = oEntitySet["sap:semantics"];
			}
		}
		return sSemantics;
	};

	/**
	 * Retrieves the LineItem Annotation for the specified target entity type
	 * 
	 * @param {String} sPath the full path of the entity type (including the namespace)
	 * @returns {Object} the resolved LineItem annotation object (if any)
	 * @public
	 */
	MetadataAnalyser.prototype.getLineItemAnnotation = function(sPath) {
		var oEntityType, aAnnotationData, oResolvedAnnotation;
		if (sPath && this._oMetaModel) {
			oEntityType = this._oMetaModel.getODataEntityType(sPath);
			if (oEntityType) {
				aAnnotationData = oEntityType["com.sap.vocabularies.UI.v1.LineItem"];
				// Resolve the annotation data into easily accessible properties
				if (aAnnotationData) {
					oResolvedAnnotation = {
						annotation: aAnnotationData
					};
					this._enrichAnnotationWithUIDataField(oResolvedAnnotation, aAnnotationData);
				}
			}
		}
		return oResolvedAnnotation;
	};

	/**
	 * Retrieves the PresentationVariant Annotation for the specified target entity type
	 * 
	 * @param {String} sPath the full path of the entity type (including the namespace)
	 * @returns {Object} the resolved PresentationVariant annotation object (if any)
	 * @public
	 */
	MetadataAnalyser.prototype.getPresentationVariantAnnotation = function(sPath) {
		var oEntityType, aAnnotationData, iLen, i, oResolvedAnnotation, oLineItemAnnotation, sLineItemPath;
		if (sPath && this._oMetaModel) {
			oEntityType = this._oMetaModel.getODataEntityType(sPath);
			if (oEntityType) {
				aAnnotationData = oEntityType["com.sap.vocabularies.UI.v1.PresentationVariant"];
				if (aAnnotationData) {
					oResolvedAnnotation = {
						annotation: aAnnotationData,
						requestAtLeastFields: [],
						sortOrderFields: []
					};
					if (aAnnotationData.Visualizations) {
						iLen = aAnnotationData.Visualizations.length;
						for (i = 0; i < iLen; i++) {
							sLineItemPath = aAnnotationData.Visualizations[i].AnnotationPath;
							if (sLineItemPath.indexOf("com.sap.vocabularies.UI.v1.LineItem") > -1) {
								// get the lineitem annotation from entityType, ignoring the @
								oLineItemAnnotation = oEntityType[sLineItemPath.substring(1)];
								// process and set the line item annotation on the resolved result
								oResolvedAnnotation.lineItemAnnotation = {
									annotation: oLineItemAnnotation
								};
								this._enrichAnnotationWithUIDataField(oResolvedAnnotation.lineItemAnnotation, oLineItemAnnotation);

								break;
							}
						}
					}
					if (aAnnotationData.RequestAtLeast) {
						iLen = aAnnotationData.RequestAtLeast.length;
						for (i = 0; i < iLen; i++) {
							oResolvedAnnotation.requestAtLeastFields.push(aAnnotationData.RequestAtLeast[i].PropertyPath);
						}
					}
					if (aAnnotationData.SortOrder) {
						iLen = aAnnotationData.SortOrder.length;
						for (i = 0; i < iLen; i++) {
							oResolvedAnnotation.sortOrderFields.push({
								name: aAnnotationData.SortOrder[i].Property.PropertyPath,
								descending: aAnnotationData.SortOrder[i].Descending ? aAnnotationData.SortOrder[i].Descending.Bool === "true" : false
							});
						}
					}
				}
			}
		}
		return oResolvedAnnotation;
	};

	/**
	 * Retrieves an array of FieldGroup Annotation for the specified target entity type
	 * 
	 * @param {String} sPath the entity type name -or- the full path of the entity type (including the namespace)
	 * @returns {Object} the resolved array of FieldGroup annotations (if any)
	 * @public
	 */
	MetadataAnalyser.prototype.getFieldGroupAnnotation = function(sPath) {
		var oEntityType, sQualifier, aPath, oResult, oAnnotation, oResolvedAnnotation, aResolvedAnnotation = [];
		if (sPath && this._oMetaModel) {
			// Field groups annotations are used also by SmartFilter, which can be used without a fully qualified path --> add support for that
			oEntityType = this._oMetaModel.getODataEntityType(this._getFullyQualifiedNameForEntity(sPath));
			if (oEntityType) {
				for ( var sProp in oEntityType) {
					if (sProp.indexOf("com.sap.vocabularies.UI.v1.FieldGroup") > -1) {
						sQualifier = null;
						oAnnotation = oEntityType[sProp];
						aPath = sProp.split("#");
						if (aPath.length === 2) {
							sQualifier = aPath[1];
						}
						if (oAnnotation) {
							oResolvedAnnotation = {
								annotation: oAnnotation
							};
							// Set the groupName of the annotation
							if (sQualifier) {
								oResolvedAnnotation.groupName = sQualifier;
							}
							// Get the label for the group
							oResult = oAnnotation["Label"];
							if (oResult) {
								// Assign the groupLabel to the annotation if it exists
								oResolvedAnnotation.groupLabel = oResult.String;
							}

							// Get the collection of UI fields
							oResult = oAnnotation["Data"];
							if (oResult) {
								this._enrichAnnotationWithUIDataField(oResolvedAnnotation, oResult);
							}
							aResolvedAnnotation.push(oResolvedAnnotation);
						}
					}
				}
			}
		}
		return aResolvedAnnotation;
	};

	/**
	 * Enriches the provided FieldGroup/LineItem annotation with UI.DataField attributes
	 * 
	 * @param {object} oAnnotation - the annotation that would be enriched
	 * @param {Array} aRecords - array of params having UI.DataField
	 * @private
	 */
	MetadataAnalyser.prototype._enrichAnnotationWithUIDataField = function(oAnnotation, aRecords) {
		var aFields = [], mLabels = {}, mImportance = {}, oProperty, sField, oParam, iLen = 0, i = 0;
		if (oAnnotation && aRecords) {
			iLen = aRecords.length;
			aFields = [];
			mLabels = {};
			for (i = 0; i < iLen; i++) {
				oParam = aRecords[i];
				// Check if term is correct
				if (oParam && oParam.RecordType === "com.sap.vocabularies.UI.v1.DataField") {
					sField = null;
					oProperty = oParam["Value"];
					if (oProperty) {
						sField = oProperty.Path;
						aFields.push(sField);
					}
					if (sField) {
						oProperty = oParam["Label"];
						if (oProperty && oProperty.String) {
							mLabels[sField] = oProperty.String;
						}
						mImportance[sField] = this._getImportanceAnnotation(oParam);
					}
				}
			}

			// Assign the resolved fields and labels to the annotation
			oAnnotation.fields = aFields;
			oAnnotation.labels = mLabels;
			oAnnotation.importance = mImportance;
		}
	};

	/**
	 * Returns the importance annotation if available
	 * 
	 * @param {Object} oParam - the parameter containing the importance annotation
	 * @returns {string} the found importance value or null
	 * @private
	 */
	MetadataAnalyser.prototype._getImportanceAnnotation = function(oParam) {
		var sImportance = null, oResult;

		oResult = oParam["com.sap.vocabularies.UI.v1.Importance"];
		if (oResult) {
			sImportance = oResult.EnumMember;
		}

		switch (sImportance) {
			case "com.sap.vocabularies.UI.v1.ImportanceType/Medium":
				return "Medium";
			case "com.sap.vocabularies.UI.v1.ImportanceType/Low":
				return "Low";
			default:
				return "High";
		}

		// return "High"; // if nothing is specified / or a unknown type is used, default to High
	};

	/**
	 * Retrieves the SemanticObject Annotation for the specified property/target
	 * 
	 * @param {String} sPath the full path of the property/target (including the namespace)
	 * @returns {Object} the resolved semanticObject annotation object (if any)
	 * @public
	 */
	MetadataAnalyser.prototype.getSemanticObjectAnnotation = function(sPath) {
		var aPath, oType, oProperty, oAnnotation;

		if (sPath && this._oMetaModel) {
			// Split the property path and
			aPath = sPath.split("/");
			// The type could either be an entity type or a complex type
			oType = this._oMetaModel.getODataEntityType(aPath[0]) || this._oMetaModel.getODataComplexType(aPath[0]);
			// Get the property from the type
			oProperty = this._oMetaModel.getODataProperty(oType, aPath[1]);
			if (oProperty) {
				oAnnotation = oProperty["com.sap.vocabularies.Common.v1.SemanticObject"];
			}
			return this._prepareSemanticObjectAnnotationFromProperty(oAnnotation);
		}
		return null;
	};

	/**
	 * Retrieves the SemanticObject Annotation for the specified property/target
	 * 
	 * @param {object} oProperty the given OData property
	 * @returns {Object} the resolved semanticObject annotation object (if any)
	 * @public
	 */
	MetadataAnalyser.prototype.getSemanticObjectAnnotationFromProperty = function(oProperty) {
		var oAnnotation;

		if (oProperty) {
			oAnnotation = oProperty["com.sap.vocabularies.Common.v1.SemanticObject"];
			return this._prepareSemanticObjectAnnotationFromProperty(oAnnotation);
		}

		return null;
	};

	/**
	 * Prepares the semantic object annotation.
	 * 
	 * @param {object} oAnnotation the original annotation
	 * @returns {object} the preparation result
	 * @private
	 */
	MetadataAnalyser.prototype._prepareSemanticObjectAnnotationFromProperty = function(oAnnotation) {
		var oResult, oResolvedAnnotation;

		if (oAnnotation) {
			oResult = oAnnotation["String"];
			if (oResult) {
				oResolvedAnnotation = {
					annotation: oAnnotation
				};
				oResolvedAnnotation.semanticObject = oResult;
			}
		}

		return oResolvedAnnotation;
	};

	/**
	 * Returns the fully qualified name of an entity which is e.g. "com.sap.GL.ZAF.GL_ACCOUNT" from the specified type name.
	 * 
	 * @param {string} sEntityTypeName - the entity Type name which needs to be converted
	 * @returns {string} - the fully qualified name for this entity
	 * @private
	 */
	MetadataAnalyser.prototype._getFullyQualifiedNameForEntity = function(sEntityTypeName) {
		var sNamespace, sResult;
		if (!sEntityTypeName) {
			return undefined;
		}
		// if entity type name already has a ".", just return it
		if (sEntityTypeName.indexOf(".") > -1) {
			return sEntityTypeName;
		}
		sNamespace = this.getNamespace();
		if (sNamespace && !(sEntityTypeName.indexOf(sNamespace) > -1)) {
			sResult = sNamespace + "." + sEntityTypeName;
		} else {
			sResult = sEntityTypeName;
		}
		return sResult;
	};

	/**
	 * Destroys the object
	 * 
	 * @public
	 */
	MetadataAnalyser.prototype.destroy = function() {
		this.oModel = null;
		this._oMetaModel = null;
		this._oMetadata = null;
		this._oSchemaDefinition = null;
		this._sResourceRootUri = null;
		this.bIsDestroyed = true;
	};

	return MetadataAnalyser;

}, /* bExport= */true);
