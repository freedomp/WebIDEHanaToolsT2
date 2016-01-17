define({

	_dataProvider : null,
	_url : null,

	/**
	 * Intialize the DataProviderManager with a specific provider.
	 * @param oProvider - the specific data provider for RDL (AstLibrary)
	 * @param sUrl - url for fetching metadata (optional).
	 * 
	 */
	init : function(oProvider, sUrl) {
		this._dataProvider = oProvider;
		this._url = sUrl;
	},

	isInitialized : function() {
		return this._dataProvider !== null;
	},

	getUrl : function() {
		return this._url;
	},

	/**
	 * @returns a JSON representation of the metadata. the JSON root is the "entities" array.
	 * 
	 */
	getModelTemplateRepresentation : function() {
		if (this._dataProvider) {
			var oResult = {
				"entities" : []
			};
			if (this._dataProvider.dataServices) {
				oResult.entities = this._getModelRepresentationFromOData();
			} else {
				oResult.entities = this._getModelRepresentationFromRDL();
			}
			return oResult;
		}
		return null;
	},

	_getModelRepresentationFromOData : function() {
		var entities = [];
		var oSchema = this._dataProvider.dataServices.schema[0];
		var sNamespace = oSchema.namespace;
		var oEntityContatiner;
		var oEntitySet;
		var oEntityType;
		var sEntityTypeName;
		var i;
		var j;
		
		for (i=0; i<oSchema.entityContainer.length; i++) {
			oEntityContatiner = oSchema.entityContainer[i];
			for (j=0; j<oEntityContatiner.entitySet.length; j++) {
				oEntitySet = oEntityContatiner.entitySet[j];
				sEntityTypeName = oEntitySet.entityType;
				sEntityTypeName = this._removeNamespaceFromName(sEntityTypeName);
				oEntityType = this._getEntityTypeFromOData(oSchema.entityType, sEntityTypeName);
				var oExtentionsFromEntityType = this._getExtensionsFromOData(oEntityType.extensions);
				var oExtentionsFromEntitySet = this._getExtensionsFromOData(oEntitySet.extensions);
				var oEntityExtensions = this._mergeObjects(oExtentionsFromEntityType, oExtentionsFromEntitySet);
				
				var oEntity = {
					"name": oEntityContatiner.isDefaultEntityContainer ? oEntitySet.name: oEntityContatiner.name + "." + oEntitySet.name,
					"entityType": oEntitySet.entityType,
					"fullyQualifiedName": sNamespace + "." + oEntityContatiner.name + "." + oEntitySet.name,
					"elements": this._getPropertiesFromOData(oEntityType, oSchema.complexType, ""),
					"navigations": [],
					"annotations" : oEntityExtensions
				};
				entities.push(oEntity);
			}
		}
		
		for (i=0; i<oSchema.entityType.length; i++) {
			oEntityType = oSchema.entityType[i];
			var aNavigationProperties = this._getNavigationPropertiesFromOData(oSchema.association, oSchema.entityContainer[0].entitySet, oEntityType);
			if (aNavigationProperties.length) {
				for (j=0; j<entities.length;j++) {
					if (entities[j].entityType === sNamespace + "." + oEntityType.name) {
						entities[j].navigations = aNavigationProperties;
						break;
					}
				}
			}
		}
		
		return entities;
	},
	
	_removeNamespaceFromName: function(sEntityTypeName) {
		return sEntityTypeName.substring(sEntityTypeName.indexOf(".") + 1, sEntityTypeName.length);
	},
	
	_getEntityTypeFromOData: function(aEntityTypes, sEntityTypeName) {
		for (var i=0; i<aEntityTypes.length; i++) {
			var oEntityType = aEntityTypes[i];
			if (oEntityType.name === sEntityTypeName) {
				return oEntityType;
			}
		}
		return null;
	},
	
	_getPropertiesFromOData: function(oEntityType, aComplexTypes, sConcatPropertyName) {
		var aProperties = [];
		var oCurrentProperty;
		
		for (var i=0; i<oEntityType.property.length; i++) {
			oCurrentProperty = oEntityType.property[i];
			var sPropertyName =  oCurrentProperty.name;
			if (sConcatPropertyName) {
				sPropertyName = sConcatPropertyName + "/" + sPropertyName;
			}
			var oPropertyAttributes = this._getPropertyAttributes(oCurrentProperty);
			var oPropertyExtensions = this._getExtensionsFromOData(oCurrentProperty.extensions);
			var oComplexTypeProperties;
			var sPropertyType = this._normalizeType(oCurrentProperty, oPropertyExtensions);
			if (sPropertyType.indexOf(".") > -1) { // complex type
				sPropertyType = sPropertyType.substring(sPropertyType.indexOf(".") + 1, sPropertyType.length);
				oComplexTypeProperties = this._getComplexTypePropertiesFromOData(aComplexTypes, sPropertyType, oCurrentProperty.name);
				if (!oComplexTypeProperties) {
					throw "error in schema: complexType " + sPropertyType  + " does not exist";
				}
				for (var j=0; j<oComplexTypeProperties.length; j++) {
					aProperties.push(oComplexTypeProperties[j]);
				}
				continue;
			}

			var oEntityProperty = {
				"name" : sPropertyName,
				"isKey" : this._isPropertyKey(oEntityType, oCurrentProperty.name),
				"type": oCurrentProperty.type,
				"remoteType" : sPropertyType,
				"annotations" : oPropertyExtensions
			};
			var oProperty = this._mergeObjects(oEntityProperty, oPropertyAttributes);
			aProperties.push(oProperty);			
		}
		return aProperties;
	},
	
	_getComplexTypePropertiesFromOData: function(aComplexTypes, sComplexTypeName, sComplexTypePropertyName) {
		var oComplexTypeProperties;
		for (var i=0; i<aComplexTypes.length; i++) {
			var oComplexType = aComplexTypes[i];
			if (oComplexType.name === sComplexTypeName) {
				oComplexTypeProperties = this._getPropertiesFromOData(oComplexType, aComplexTypes, sComplexTypePropertyName);
				return oComplexTypeProperties;
			}
		}
		return oComplexTypeProperties;
	},
	
	_getPropertyAttributes: function(oProperty) {
		var oPropertyAttributes = {};
	    for (var attribute in oProperty) { 
	    	if (attribute === "name" || attribute === "type" || attribute === "extensions") {
	    		continue;
	    	}
	    	oPropertyAttributes[attribute] = oProperty[attribute]; 
	    }
		return oPropertyAttributes;
	},
	
	_isPropertyKey: function(oEntityType, sKeyName) {
		if (oEntityType.key && oEntityType.key.propertyRef) {
			var aKeys = oEntityType.key.propertyRef;
			for (var i=0; i<aKeys.length; i++) {
				var oKey = aKeys[i];
				if (oKey.name === sKeyName) {
					return true;
				}
			}			
		}
		return false;
	},
	
	_normalizeType: function(oProperty, oPropertyExtensions) {
		switch (oProperty.type) {
		case "Edm.String":
			if (oPropertyExtensions.filterable === "false") {
				return "LargeString";
			}
			return "String"; // default type
		case "Edm.Decimal":
			if (oProperty.precision) {
				return "Decimal";
			}
			return "DecimalFloat";
		case "Edm.Single":
			return "Decimal";
		case "Edm.DateTimeOffset":
		case "Edm.DateTime":
			if (oProperty.precision === "7") {
				return "UTCTimestamp";
			}
			return "UTCDateTime";
		case "Edm.Time":
			return "LocalTime";
		case "Edm.Int16":
		case "Edm.Int32":
		case "Edm.Int64":
		case "Edm.Byte":
		case "Edm.SByte":
			return "Integer";
		case "Edm.Double":
			return "BinaryFloat";
		case "Edm.Boolean":
			return "Boolean";
		case "Edm.Guid":
			return "UUID";
		case "Edm.Binary":
			if (oPropertyExtensions.filterable === "false") {
				return "LargeBinary";
			}
			return "Binary";
		}
		return oProperty.type;
	},

	_getExtensionsFromOData: function(aExtensions) {
		var oAnnotations = {};
		if (aExtensions) {
			for (var i=0; i<aExtensions.length; i++) {
				var extension = aExtensions[i];
				oAnnotations[extension.name] = extension.value;
			}
		}	
		return oAnnotations;
	},
	
	_mergeObjects: function(oObject1, oObject2) {
	    var oObjectMerged = {};
	    for (var attrname in oObject1) { oObjectMerged[attrname] = oObject1[attrname]; }
	    for (var attrname in oObject2) { oObjectMerged[attrname] = oObject2[attrname]; }
	    return oObjectMerged;
	},
	
	_getNavigationPropertiesFromOData: function(aAssociations, aEntities, oEntityType) {
		var aNavigationProperties = [];
		
		if (oEntityType.navigationProperty) {
			for (var i=0; i<oEntityType.navigationProperty.length; i++) {
				var oNavigationProperty = oEntityType.navigationProperty[i];
				var sRelationship = oNavigationProperty.relationship;
				sRelationship = sRelationship.substring(sRelationship.indexOf(".") + 1, sRelationship.length);
				var oAssociationEnd = this._getAssociationTargetEntityTypeFromOData(aAssociations, sRelationship, oNavigationProperty.toRole);
				if (!oAssociationEnd) {
					throw "error in schema";
				}
				var iEntityTypeIndex = this._getEntityTypeIndexFromOData(aEntities, oAssociationEnd.type);
				if (iEntityTypeIndex<0) {
					throw "error in schema";
				}
				var sMultiplicity = this._normalizeMultiplicity(oAssociationEnd.multiplicity);
				
				var oEntityNavigationProperty = {
					"name" : oNavigationProperty.name,
					"multiplicity" : sMultiplicity,
					"elements" : "@datasource.entities." + iEntityTypeIndex + ".elements",
					"navigations" : "@datasource.entities." + iEntityTypeIndex + ".navigations"
				};
				aNavigationProperties.push(oEntityNavigationProperty);			
			}
		}
		
		return aNavigationProperties;		
	},
	
	_normalizeMultiplicity: function(sMultiplicity) {
		var sMulti = sMultiplicity;
		var i = sMulti.lastIndexOf(".");
		if (i > -1) {
			sMulti = sMulti.substring(i+1, sMulti.length); 
		}	
		return sMulti;
	},
	
	_getAssociationTargetEntityTypeFromOData: function(aAssociations, sAssociationName, sRoleName) {
		for (var i=0; i<aAssociations.length; i++) {
			var oAssociation = aAssociations[i];
			if (oAssociation.name === sAssociationName) {
				for (var j=0; j<oAssociation.end.length; j++) {
					var oAssociationEnd = oAssociation.end[j];
					if (oAssociationEnd.role === sRoleName) {
						return oAssociationEnd;
					}
				}
			}
		}
		return null;
	},
	
	_getEntityTypeIndexFromOData: function(aEntityTypes, sEntityTypeName) {
		for (var i=0; i<aEntityTypes.length; i++) {
			if (aEntityTypes[i].entityType === sEntityTypeName) {
				return i;
			}
		}	
		return -1;
	},
	
	_getModelRepresentationFromRDL : function() {
		var entities = [];
			var aEntites = this._getEntitiesFromRDL();
			for ( var i = 0; i < aEntites.length; i++) {
				var aElements = aEntites[i].getElements();
				//get properties
				var aProperties = this._getPropertiesFromRDL(aElements);
				//get navigations
				var aNavigations = this._getNavigationsFromRDL(aElements, aEntites);
				
				var sEntityType;
				if (aEntites[i].annotations) {
				    sEntityType = aEntites[i].annotations.entityType;
				}
	
				//create Entity
				var oEntity = {
					"name" : aEntites[i].name,
					"entityType" : sEntityType,
					"fullyQualifiedName" : aEntites[i].fullyQualifiedName,
					"elements" : aProperties,
					"navigations" : aNavigations,
					"annotations" : aEntites[i].annotations
				};
				
				entities.push(oEntity);
			}
		return entities;
	},

	_getEntitiesFromRDL : function() {
		if (this._dataProvider) {
			var aContexts = this._dataProvider.getRoots()[0].getNestedContexts();
			if (aContexts.length > 0) {
				return this._getAllNestedEntities(aContexts);
			}
		}
		return [];
	},

	_getAllNestedEntities : function(aContexts) {
		var aEntities = [];
		for ( var i = 0; i < aContexts.length; i++) {
			var aNestedContexts = aContexts[i].getNestedContexts();
			if (aNestedContexts.length > 0) {
				aEntities = aEntities.concat(this._getAllNestedEntities(aNestedContexts));
			}
			aEntities = aEntities.concat(aContexts[i].getNestedEntities());
		}
		return aEntities;
	},

	_getPropertiesFromRDL : function(aElements) {
		var aProperties = [];
		if (aElements) {
			for ( var i = 0; i < aElements.length; i++) {
				var oElement = aElements[i];
				if (!oElement.getType().instanceOf("IAssociationType")) {
					var oProp = {
						"name" : oElement.name,
						"isKey" : oElement.isKey,
						"remoteType" : oElement.getType().name,
						"annotations" : oElement.annotations
					};
					aProperties.push(oProp);
				}
			}
		}
		return aProperties;
	},

	_getNavigationsFromRDL : function(aElements, aEntities) {
		var aNavigations = [];
		if (aElements) {
			for ( var i = 0; i < aElements.length; i++) {
				var oElement = aElements[i];
				if (oElement.getType().instanceOf("IAssociationType")) {
					var oType = oElement.getType();
					var oCardinality = oType.getCardinality();
					var sMultiplicity = "*";
					if (oCardinality.upperBound === 1) {
						sMultiplicity = "1";
					}
					var oNav = {
						"name" : oElement.name,
						"multiplicity" : sMultiplicity

					};
					
					
					var oTeargetEntity = oType.getTargetEntity();
					var iEntitySetIndex = this._getEntitySetIndexByFQName(aEntities, oTeargetEntity ? oTeargetEntity.fullyQualifiedName : "");
					if (iEntitySetIndex > -1) {
						oNav.elements = "@datasource.entities." + iEntitySetIndex + ".elements";
						oNav.navigations = "@datasource.entities." + iEntitySetIndex + ".navigations";
					}

					aNavigations.push(oNav);
				}
			}
		}
		return aNavigations;
	},

	_getEntitySetIndexByFQName : function(aEntities, sTargetEntitySetName) {
		for ( var i = 0; i < aEntities.length; i++) {
			if (aEntities[i].fullyQualifiedName && aEntities[i].fullyQualifiedName === sTargetEntitySetName) {
				return i;
			}
		}
		return -1;
	},

	_getPropertyType : function(sValue, aProperties) {
		if (!sValue || !aProperties) {
			return null;
		}
		for ( var i = 0; i < aProperties.length; i++) {
			var oProperty = aProperties[i];
			if (oProperty.name.toUpperCase() === sValue.toUpperCase()) {
				return oProperty.remoteType;
			}
		}
		return null;
	},

	/**
	 * Static method that checks if a given entity is a root entity (addressable EntitySet in OData).
	 * 
	 * @param sValue entity name
	 * 
	 * @param aEntities array of entities.
	 * 
	 * @returns true is the entity is addressable, else false.
	 */
	isRootEntity : function(sValue, aEntities) {
		for ( var i = 0; i < aEntities.length; i++) {
			var oSet = aEntities[i];
			if (oSet.name.toUpperCase() === sValue.toUpperCase()) {
				if (oSet.annotations && oSet.annotations.hasOwnProperty("addressable")) {
					return oSet.annotations.addressable;
				}

				return true;
			}
		}
		return false;
	},

	/**
	 * Static method that checks if a given property is a key property.
	 * 
	 * @param sValue entity name
	 * 
	 * @param aProperties array of properties.
	 * 
	 * @returns true is the property is a key property, else false.
	 */
	isKeyProperty : function(sValue, aProperties) {
		for ( var i = 0; i < aProperties.length; i++) {
			var oProperty = aProperties[i];
			if (oProperty.name.toUpperCase() === sValue.toUpperCase()) {
				return oProperty.isKey;
			}
		}
		return false;
	},

	/**
	 * Static method that checks if a given property is of type which represents a string.
	 * 
	 * @param sValue property name
	 * 
	 * @param aProperties array of properties.
	 * 
	 * @returns true is the property is of type which represents a string.
	 */
	isStringProperty : function(sValue, aProperties) {
		var sType = this._getPropertyType(sValue, aProperties);
		if (sType === "LargeString" || sType === "String") {
			return true;
		}
		return false;
	},

	/**
	 * Static method that checks if a given property is of type which represents a date.
	 * 
	 * @param sValue property name
	 * 
	 * @param aProperties array of properties.
	 * 
	 * @returns true is the property is of type which represents a date.
	 */
	isDateProperty : function(sValue, aProperties) {
		var sType = this._getPropertyType(sValue, aProperties);
		if (sType === "UTCTimestamp" || sType === "UTCDateTime" || sType === "LocalTime") {
			return true;
		}
		return false;
	},

	/**
	 * Static method that checks if a given property is of type which represents a number.
	 * 
	 * @param sValue property name
	 * 
	 * @param aProperties array of properties.
	 * 
	 * @returns true is the property is of type which represents a number.
	 */
	isNumericProperty : function(sValue, aProperties) {
		var sType = this._getPropertyType(sValue, aProperties);
		if (sType === "Decimal" || sType === "DecimalFloat" || sType === "Integer" || sType === "BinaryFloat") {
			return true;
		}
		return false;
	},

	/**
	 * Static method that checks if a given property is of type which represents a boolean.
	 * 
	 * @param sValue property name
	 * 
	 * @param aProperties array of properties.
	 * 
	 * @returns true is the property is of type which represents a boolean.
	 */
	isBooleanProperty : function(sValue, aProperties) {
		var sType = this._getPropertyType(sValue, aProperties);
		if (sType === "Boolean") {
			return true;
		}
		return false;
	},

	/**
	 * Static method that checks if a given property is of type which represents a binary.
	 * 
	 * @param sValue property name
	 * 
	 * @param aProperties array of properties.
	 * 
	 * @returns true is the property is of type which represents a binary.
	 */
	isBinaryProperty : function(sValue, aProperties) {
		var sType = this._getPropertyType(sValue, aProperties);
		if (sType === "LargeBinary" || sType === "Binary") {
			return true;
		}
		return false;
	},

	/**
	 * Static method that checks if a given property is of type which represents a Guid.
	 * 
	 * @param sValue property name
	 * 
	 * @param aProperties array of properties.
	 * 
	 * @returns true is the property is of type which represents a Guid.
	 */
	isGuidProperty : function(sValue, aProperties) {
		var sType = this._getPropertyType(sValue, aProperties);
		if (sType === "UUID") {
			return true;
		}
		return false;
	},

	/**
	 * Static method that checks if a given navigation is to a collection (many).
	 * 
	 * @param sValue navigation name
	 * 
	 * @param aEntities array of navigations.
	 * 
	 * @returns true is the navigation is to many, else false.
	 */
	isNavigationsToMany : function(sValue, aNavigations) {
		return this.isNavigationByMultiplicity(sValue, aNavigations, "*");
	},

	/**
	 * Static method that checks if a given navigation is to a single entity (one).
	 * 
	 * @param sValue navigation name
	 * 
	 * @param aEntities array of navigations.
	 * 
	 * @returns true is the navigation is to one, else false.
	 */
	isNavigationsToOne : function(sValue, aNavigations) {
		return this.isNavigationByMultiplicity(sValue, aNavigations, "1");
	},

	/**
	 * Static method that checks if a given navigation is to the given multiplicity.
	 * 
	 * @param sValue navigation name
	 * 
	 * @param aEntities array of navigations.
	 * 
	 * @param sMultiplicity pass '*' for many, or '1' for one.
	 * 
	 * @returns true is the navigation is to the given multiplicity, else false.
	 */
	isNavigationByMultiplicity : function(sValue, aNavigations, sMultiplicity) {
		for ( var i = 0; i < aNavigations.length; i++) {
			var oNav = aNavigations[i];
			if (oNav.name.toUpperCase() === sValue.toUpperCase()) {
				if (oNav.multiplicity != sMultiplicity) {
					return false;
				}
				return true;
			}
		}
		return false;
	}

});