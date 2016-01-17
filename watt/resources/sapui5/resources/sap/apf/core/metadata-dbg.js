/*global sap */
/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.apf.core.metadata");
jQuery.sap.require("sap.apf.utils.utils");
jQuery.sap.require("sap.apf.core.utils.fileExists");

/**
 * @class This class initializes the metadata and the annotations and merges them together. The class provides methods to access metadata information like parameters of an entity type and their
 *        data types.
 * @param {Object} oInject Injection of dependencies, which are Hashtable, MessageHandler, coreAi.
 * @param {string} sAbsolutePathToServiceDocument Absolute Path to service document like "/sap/hba/apps/wca/s/odata/wca.xsodata"
 */
sap.apf.core.Metadata = function (oInject, sAbsolutePathToServiceDocument) {
    'use strict';

    /**
     * @description Contains 'metadata'
     * @returns {String}
     */
    this.type = "metadata";
    // Private vars
    var that = this;
    var oCoreApi = oInject.coreApi;
    var aAllEntityTypes = [];
    var aAllAggregateProperties = [];
    var oHtPropertyMetadata = new oInject.hashtable(oInject.messageHandler);
    var oHtFilterableProperties = new oInject.hashtable(oInject.messageHandler);
    var oHtAllProperties = new oInject.hashtable(oInject.messageHandler);
    var oHtParameterEntitySetKeyProperties = new oInject.hashtable(oInject.messageHandler);
    var oHtEntityTypeMetadata = new oInject.hashtable(oInject.messageHandler);
    var oHtEntityTypeOfEntitySet = new oInject.hashtable(oInject.messageHandler);
    var oHtGetSapSemantics = new oInject.hashtable(oInject.messageHandler);
    var oHtAssociationByParameterEntitySet = new oInject.hashtable(oInject.messageHandler);
    var oHtAssociationByParameterEntityType = new oInject.hashtable(oInject.messageHandler);
    var oHtAssociationByAggregateEntitySet = new oInject.hashtable(oInject.messageHandler);
    var oHtEntityTypes = new oInject.hashtable(oInject.messageHandler);
    var ODataModel = oInject.ODataModel || sap.ui.model.odata.ODataModel;
    var bDeactivateFatalError = false;
    if (oInject.deactivateFatalError) {
        bDeactivateFatalError = true;
    }
    var oMetaModel;
    var sEntityTypeQualifier;
    var sEntityTypeAnnotationsPreFix;
    
    // Private functions
    /**
     * @description Returns all entity types of service documents that are referenced by an entity set
     * @returns {Array} - EntityTypes Returns entity types
     */
    function getEntityTypes() {
        return aAllEntityTypes;
    }

    function defineApiResult(input) {
    	var object;
        function moveToDataType(property) {
            if (!object.dataType) {
                object.dataType = {};
            }
            object.dataType[property] = object[property];
            delete object[property];
        }

        function map(sAlternativeName, property) {
            if (jQuery.isArray(object[property]) === true) {
                (object[property]).forEach(function(obj){
                    object[obj.name] = obj.value;
                });
                delete object[property];
            } else if (property !== "dataType" && typeof (object[property]) === "object") { // dataType is explicit set by the APF has not to be modified
                if (Object.keys(object[property]).length === 0) {
                    object[sAlternativeName] = "true";
                }
                jQuery.each(object[property], function(objProperty, itsValue){
                    object[sAlternativeName] = itsValue;
                });
                delete object[property];
            } else {
                object[sAlternativeName] = object[property];
            }
        }
        
        if(input === null){
         return {};
        }
        object = jQuery.extend(true, {}, input);
        jQuery.each(object, function( sProperty){
            switch (sProperty) {
                case 'type':
                    moveToDataType(sProperty);
                    break;
                case 'maxLength':
                    moveToDataType(sProperty);
                    break;
                case 'precision':
                    moveToDataType(sProperty);
                    break;
                default:
                    var sPropertyName = sProperty.split(".").pop();
                    if (sPropertyName.search("ISO") === 0) {
                        map(sPropertyName, sProperty);
                    } else {
                        map(sPropertyName.replace(/^./, sPropertyName[0].toLowerCase()), sProperty);
                    }
                    break;
            }
        });
        removePropertyAnnotations(object);
        return object;
    }
    
    function removePropertyAnnotations(property){
    	for(var i in property){
			if(/^sap:/.test(i)){
				delete property[i];
			}
		} 
    }

    function getParameterPropertiesFromEntityType(sEntityType, bOnlyKeyProperties) {
        if (oHtParameterEntitySetKeyProperties.hasItem(sEntityType) !== true) {
            var oEntityType;
            var oKeyProperties = {};
            var oResult = {allParameters: [], keyParameters: []};
            if (isParameterEntityType(sEntityType)){	
            	oEntityType = getEntityType(sEntityType);
	            if (oEntityType.key && oEntityType.key.propertyRef) {
	            	oEntityType.key.propertyRef.forEach(function (oPropRef) {
	                    oKeyProperties[oPropRef.name] = null;
	                });
	            }
	            oEntityType.property.forEach(function(oProperty){ 
			                var oParameter = defineApiResult(oProperty);
			                oParameter.isKey = oKeyProperties.hasOwnProperty(oParameter.name);
			                oResult.allParameters.push(oParameter);
			                if (oParameter.isKey) {
			                    oResult.keyParameters.push(oParameter);
			                }
			    });
	        }
            oHtParameterEntitySetKeyProperties.setItem(sEntityType, oResult);
        }
        if (!bOnlyKeyProperties) {
            return oHtParameterEntitySetKeyProperties.getItem(sEntityType).allParameters;
        }
        return oHtParameterEntitySetKeyProperties.getItem(sEntityType).keyParameters;
    }

    function getAllAggregatePropertiesOfEntityType(sEntityType) {
        var aPropertyNames = [];
        if (isParameterEntityType(sEntityType)) {
            sEntityType = getEntityTypeOfAggregateEntitySet(sEntityType);
        }
        if (isAggregateEntityType(sEntityType)){
	        var entityType = getEntityType(sEntityType);
	        entityType.property.forEach(function (property) {
	            aPropertyNames.push(property.name);
	        });
        }
        return aPropertyNames;
    }

    function getAllPropertiesOfExtendedEntityType(sEntityType) {
        var i;
        if (oHtAllProperties.hasItem(sEntityType) === true) {
            return oHtAllProperties.getItem(sEntityType);
        }
        var aAllProperties;
        var aPropertyNames = [];
        var aParameterNames = [];

        var sAggregateEntityType = getEntityTypeOfAggregateEntitySet(sEntityType);
        if(sAggregateEntityType && isAggregateEntityType(sAggregateEntityType)){
        	var oEntityType = getEntityType(sAggregateEntityType);
	        oEntityType.property.forEach( function(oProperty) {
	            aPropertyNames.push(oProperty.name);
	        });
        }

        var aParameters = getParameterPropertiesFromEntityType(sEntityType, false);
        for (i = 0; i < aParameters.length; i++) {
            aParameterNames.push(aParameters[i].name);
        }

        aAllProperties = aPropertyNames.concat(aParameterNames);

        oHtAllProperties.setItem(sEntityType, aAllProperties);
        return aAllProperties;
    }

    function getEntityTypeName(sEntitySet){
    	return oHtEntityTypeOfEntitySet.getItem(sEntitySet);
    }
    
    function determineEntityTypeName(sEntityTypeOrSetName) {

        var sEntityType;
        if (getEntityType(sEntityTypeOrSetName)){
            sEntityType = sEntityTypeOrSetName;
        } else {
            sEntityType = getEntityTypeName(sEntityTypeOrSetName);
            sEntityType = sEntityType || getEntityTypeName(sEntityTypeOrSetName + "Results"); // compatibility!!!
        }
        return sEntityType;
    }

    function getFilterablePropertiesFromEntityType(sEntityType) {
        if (oHtFilterableProperties.hasItem(sEntityType) === false) {
	        var aResult = [];
	        if(isAggregateEntityType(sEntityType)){
		        var oEntityType = getEntityType(sEntityType);
		        oEntityType.property.forEach(function(property){
		        	if(!(property["sap:filterable"] === "false" || property.filterable && property.filterable === "true")){
		        		aResult.push(property.name);
		        	}
		        });
	        }
	        oHtFilterableProperties.setItem(sEntityType, aResult);
        }
        return oHtFilterableProperties.getItem(sEntityType);
    }

    function isParameterEntityType(sEntityType) {
   		 return getSapSemantics(sEntityType) === "parameters";
    }
    
    function isAggregateEntityType(sEntityType) {
  		 return getSapSemantics(sEntityType) === "aggregate";
   }
    
    function getSapSemantics(sEntityType){
    	if(!oHtGetSapSemantics.hasItem(sEntityType)){
    		 var entityType = getEntityType(sEntityType);
    		 var result = entityType && entityType["sap:semantics"] || "undefined";
    		  oHtGetSapSemantics.setItem(sEntityType, result);
    	 }
    	 return  oHtGetSapSemantics.getItem(sEntityType);
    }

    function getPropertyMetadataFromEntityType(sEntityType, sPropertyName) {
        if (oHtPropertyMetadata.hasItem(sEntityType + sPropertyName) === false) {
        	var bIsParameterEntityType = isParameterEntityType(sEntityType);
            var entityType = getEntityType(sEntityType);
            var property = oMetaModel .getODataProperty(entityType, sPropertyName);
            if(!property && bIsParameterEntityType){
            	var sAggregateEntityType = getEntityTypeOfAggregateEntitySet(sEntityType);
            	entityType = getEntityType(sAggregateEntityType);
            	property = oMetaModel .getODataProperty(entityType, sPropertyName);
            }
            oHtPropertyMetadata.setItem(sEntityType + sPropertyName, defineApiResult(property));
        }
        return oHtPropertyMetadata.getItem(sEntityType + sPropertyName);
    }

    //KS sEntityType either from parameter entity set or aggregate entity set
    function getEntityTypeOfAggregateEntitySet(sEntityType) {
      	var oRelevantAssociation = oHtAssociationByParameterEntityType.getItem(sEntityType);
      	if(oRelevantAssociation){
        	return getEntityTypeName(oRelevantAssociation.toAggregateEntitySet);
        } else {
            return sEntityType;
        }
    }

    function getEntityType(sEntityType){
      if(!sEntityType){
    	  return;
      }
      if(!oHtEntityTypes.hasItem(sEntityType)){
    	  var oEntityType = oMetaModel .getODataEntityType(sEntityTypeQualifier + sEntityType);
    	  if(!oEntityType){
    		  return oEntityType;
    	  }
    	  oHtEntityTypes.setItem(sEntityType, oEntityType); 
      }
      return oHtEntityTypes.getItem(sEntityType); 
    }
    
    function initMetadata() {
        
        var oOdataModel = getOdataModel();
        var sMessageCode;
        
        if(!oOdataModel.getServiceMetadata()){
          sMessageCode = "5018";
          if (bDeactivateFatalError) {
              sMessageCode = "11013";
          }
          oInject.messageHandler.putMessage(oInject.messageHandler.createMessageObject({
              code: sMessageCode,
              aParameters: [sAbsolutePathToServiceDocument],
              oCallingObject: that
          }));
          that.failed = true;
          return;
        }
        
        oMetaModel  = oOdataModel.getMetaModel();
      
        initializeEntityTypeOfEntitySetsAndAllEntityTypes();
        
        initializeEntityTypeQualifier();
        
        initializeEntityTypeAnnotationsPreFix(oOdataModel);
        
        initializeRelevantAssociations();
    
        //>>>
       function initializeEntityTypeOfEntitySetsAndAllEntityTypes(){
       	 var oCollector = {};
       	 oMetaModel .getODataEntityContainer().entitySet.forEach( function(entitySet){
    	        	var entityType = entitySet.entityType.split(/[. ]+/).pop();
    	            oHtEntityTypeOfEntitySet.setItem(entitySet.name, entityType);   
                if(!oCollector.hasOwnProperty(entityType)){
                	oCollector[entityType] = true;
                	aAllEntityTypes.push(entityType);
                }
            });
       }
       
       function initializeEntityTypeQualifier(){
       	  var aServiceDocumentParts = oMetaModel .getODataEntityContainer().entitySet[0].entityType.split(".");
             aServiceDocumentParts.pop();
             sEntityTypeQualifier = aServiceDocumentParts.join(".") + ".";
             	
       }
       
       function initializeEntityTypeAnnotationsPreFix (odataModel){
           var oAnnotation = odataModel.getServiceAnnotations();
           if (oAnnotation && oAnnotation.aliasDefinitions && oAnnotation.aliasDefinitions.Capabilities ){
           	sEntityTypeAnnotationsPreFix = oAnnotation.aliasDefinitions.Capabilities + ".";
           }
       }
       
       function initializeRelevantAssociations() {
    	   var oEntityContainer = oMetaModel.getODataEntityContainer(); 
    	   if(!oEntityContainer.associationSet){
    		 return;
    	   }
    	   oEntityContainer.associationSet.forEach(function(oEntitySetAssociation){
    		   
    		   var sEntitySet1 = oEntitySetAssociation.end[0].entitySet,
    		       sEntitySet2 = oEntitySetAssociation.end[1].entitySet,
    		       sParameterEntitySet,
    		       sAggregateEntitySet;
    		   if(isParameterEntityType(getEntityTypeName(sEntitySet1))){
    			   sParameterEntitySet = sEntitySet1;
    		   } else if(isAggregateEntityType(getEntityTypeName(sEntitySet1))){
    			   sAggregateEntitySet = sEntitySet1;
    		   }
    		   if(isParameterEntityType(getEntityTypeName(sEntitySet2))){
    			   sParameterEntitySet = sEntitySet2;
    		   } else if(isAggregateEntityType(getEntityTypeName(sEntitySet2))){
    			   sAggregateEntitySet = sEntitySet2;
    		   }
    		   if(!sParameterEntitySet || !sAggregateEntitySet){
    			   return;
    		   }
    		   
    		   var sNavigationProperty;
    		   var oParameterEntityType = getEntityType(getEntityTypeName(sParameterEntitySet));
    		   var done;
    		   oParameterEntityType.navigationProperty.forEach(function(oNavigationProperty){
    			   
    			   if(done){
    				  return; 
    			   }
    			   if(oNavigationProperty.relationship === oEntitySetAssociation.association){
    				   sNavigationProperty = oNavigationProperty.name;
    				   done = true;
    			   }
    		   });
    		   if(!sNavigationProperty){
    			   return;
    		   }
    		   
    		  
    		   var oRelevantAssociation = { 
   					        navigationProperty      : sNavigationProperty,
	                        fromParameterEntitySet  : sParameterEntitySet,
	                        toAggregateEntitySet    : sAggregateEntitySet,
	                        fromIsUnique : undefined,
	                        toIsUnique   : undefined };
    		   
    		   if(oHtAssociationByParameterEntitySet.hasItem(sParameterEntitySet)){
    			   oRelevantAssociation.fromIsUnique = false;
    			   oHtAssociationByParameterEntitySet.getItem(sParameterEntitySet).fromIsUnique = false;
    		   } else {
    			   oRelevantAssociation.fromIsUnique = true;
    			   oHtAssociationByParameterEntitySet.setItem(sParameterEntitySet, oRelevantAssociation);
    			   oHtAssociationByParameterEntityType.setItem(getEntityTypeName(sParameterEntitySet), oRelevantAssociation);
	   		   }
    		   
    		   if(oHtAssociationByAggregateEntitySet.hasItem(sAggregateEntitySet)){
    			   oHtAssociationByAggregateEntitySet.getItem(sAggregateEntitySet).toIsUnique = false;
    		   } else {
    			   oRelevantAssociation.toIsUnique = true;
    			   oHtAssociationByAggregateEntitySet.setItem(sAggregateEntitySet, oRelevantAssociation);
    		   }
    		   
    	   });
       }
       
       function getOdataModel(){
       	 var sAnnotationUri = oCoreApi.getUriGenerator().getODataPath(sAbsolutePathToServiceDocument) + "annotation.xml";
            var bAnnotationsExist = sap.apf.core.utils.fileExists(sAnnotationUri);
            if (bAnnotationsExist) {
                 var parameterSet = {loadMetadataAsync: false, annotationURI: sAnnotationUri, json: true};
            } else {
                 parameterSet = {loadMetadataAsync: false, json: true};
            }
           
            return new ODataModel(sAbsolutePathToServiceDocument, parameterSet);           
       }
       
    }
    

    // Public functions
    /**
     * @description Returns all metadata for the property of the provided entity type
     * @param {String} sEntitySet - identifier of the used OData entity set
     * @param {String} sPropertyName - identifier of the used OData property
     * @returns {Object} - metadata of the property
     */
    this.getPropertyMetadata = function (sEntitySet, sPropertyName) {
        oInject.messageHandler.check(sEntitySet !== undefined && typeof sEntitySet === "string", "sap.apf.core.Metadata:getPropertyMetadata incorrect EntityType name or type");
        oInject.messageHandler.check(sPropertyName !== undefined && typeof sPropertyName === "string", "sap.apf.core.Metadata:getPropertyMetadata incorrect sPropertyName name or type");

        //noinspection JSLint
        var sEntityType = determineEntityTypeName(sEntitySet);
        if (!sEntityType) {
            return {};
        }

        //noinspection JSLint
        return getPropertyMetadataFromEntityType(sEntityType, sPropertyName);
    };

    /**
     * @description Returns the entity set and navigation property that are needed e. g. for building the Uri for executing an OData request
     * @param {String} sEntitySet - identifier of the used OData entity set
     * @returns {Object} 		   - uriComponents 
     * @returns {String|undefined} - uriComponents.entitySet 			- is undefined, if it cannot be determined
     * @returns {string|undefined} - uriComponents.navigationProperty 	- is undefined, if it is needed and cannot be determined
     */
    this.getUriComponents = function (sEntitySet) {
    	
        if (!getEntityTypeName(sEntitySet)) {
            if (getEntityTypeName(sEntitySet + "Results")) {
            	return {entitySet : sEntitySet + "Results", 
            		    navigationProperty : "" };
            }
            return null;
        }
        
        var oRelevantAssociation;
        switch(getSapSemantics(getEntityTypeName(sEntitySet))){
	        case "undefined":
	        	return {entitySet : sEntitySet, 
	        	        navigationProperty : "" };
	        case "parameters":
	        	oRelevantAssociation = oHtAssociationByParameterEntitySet.getItem(sEntitySet);
	        	if(!oRelevantAssociation || oRelevantAssociation.fromIsUnique === false){
	        		return {entitySet : sEntitySet, 
	        			    navigationProperty : undefined };
	        	}
	        	return {entitySet : sEntitySet, 
	             		navigationProperty : oRelevantAssociation.navigationProperty };
	        case "aggregate":
	        	oRelevantAssociation = oHtAssociationByAggregateEntitySet.getItem(sEntitySet);
	        	if(!oRelevantAssociation){
	        		return {entitySet : sEntitySet, 
	        			    navigationProperty : "" };
	        	}
	        	if(oRelevantAssociation.toIsUnique === false){
	        		return {entitySet : undefined, 
	        			    navigationProperty : undefined };
	        	}
	        	return {entitySet : oRelevantAssociation.fromParameterEntitySet, 
	        		    navigationProperty : oRelevantAssociation.navigationProperty };
        }
        
    };
    
    /**
     * @description Returns names of all filterable properties of the provided entity type.
     * @param {String} sEntitySet - identifier of the used OData entity type
     * @returns {Array} aResult - names of the filterable properties
     */
    this.getFilterableProperties = function (sEntitySet) {
        oInject.messageHandler.check(sEntitySet !== undefined && typeof sEntitySet === "string", "sap.apf.core.Metadata:getFilterableProperties incorrect EntityType name or type");

        var sEntityType = determineEntityTypeName(sEntitySet);
        if (!sEntityType) {
            return [];
        }

        sEntityType = getEntityTypeOfAggregateEntitySet(sEntityType);
        return getFilterablePropertiesFromEntityType(sEntityType);
        
    };

    /**
     * @description Returns all properties (incl. parameters) for a given entity set provided the entitySet has an "extension".
     *      Extension means an annotation in the entityType of metadata.xml which is equal to "sap:semantics"="aggregate" or "sap:semantics"="parameter".
     *      When the entityType does not have this annotation then the result array is empty.
     * @param {String} sEntitySet - identifier of the used OData entity set
     * @returns {Array} aResult - property names
     */
    this.getAllPropertiesOfExtendedEntityType = function (sEntitySet) {
        oInject.messageHandler.check(sEntitySet !== undefined && typeof sEntitySet === "string", "sap.apf.core.Metadata:getAllProperties incorrect EntityType name or type");

        var sEntityType = determineEntityTypeName(sEntitySet);
        if (!sEntityType) {
            return [];
        }
        return getAllPropertiesOfExtendedEntityType(sEntityType);
    };
    /**
     * @description Returns all aggregate properties for a given entity set.
     * @param {String} sEntitySet - identifier of the used OData entity set
     * @returns {String[]} array of aggregate property names
     */
    this.getAllAggregatePropertiesOfEntitySet = function (sEntitySet) {
        oInject.messageHandler.check(sEntitySet !== undefined && typeof sEntitySet === "string", "sap.apf.core.Metadata:getAllProperties incorrect EntityType name or type");

        var sEntityType = determineEntityTypeName(sEntitySet);

        return getAllAggregatePropertiesOfEntityType(sEntityType);
    };


    /**
     * @description Returns names of all aggregate properties of all entity types.
     *            Return empty when the entity type does not contain an annotation "sap:semantics".
     * @returns {String[]} array of all aggregate property names
     */
    this.getAllAggregateProperties = function () {
        if(aAllAggregateProperties.length === 0){
	        getEntityTypes().forEach(function (sEntityType) {
	        	if(isParameterEntityType(sEntityType) !== false) {
	        	 return;
	        	}
	            aAllAggregateProperties = aAllAggregateProperties.concat(getAllAggregatePropertiesOfEntityType(sEntityType));
	        });
	        aAllAggregateProperties = sap.apf.utils.eliminateDuplicatesInArray(oInject.messageHandler, aAllAggregateProperties);
        }
        return aAllAggregateProperties;
    };

    /**
     * @description Returns names of all properties (incl. parameters) of all entity types.
     *            Return empty when the entity type does not contain an annotation "sap:semantics".
     * @returns {String[]} array of all property names
     */
    this.getAllProperties = function () {
        var aAllProperties = [];

        getEntityTypes().forEach(function (entityType) {
            aAllProperties = aAllProperties.concat(getAllPropertiesOfExtendedEntityType(entityType));
        });
        aAllProperties = sap.apf.utils.eliminateDuplicatesInArray(oInject.messageHandler, aAllProperties);

        return aAllProperties;
    };

    /**
     * @description Returns names of all parameter entity set key properties of all entity types.
     * @returns {Array} aResult - parameter names
     */
    this.getParameterEntitySetKeyPropertiesForService = function () {
        var aAllParameters = [];

        getEntityTypes().forEach(function (entityType) {
            getParameterPropertiesFromEntityType(entityType, true).forEach(function (parameter) {
                aAllParameters.push(parameter.name);
            });
        });
        aAllParameters = sap.apf.utils.eliminateDuplicatesInArray(oInject.messageHandler, aAllParameters);

        return aAllParameters;
    };

    /**
     * @description Returns names of all key properties of all entity types.
     * @returns {Array} aResult - key names
     */
    this.getAllKeys = function () {
        var aAllKeys = [];
        var aKeys = [];

        getEntityTypes().forEach(function (entityType) {
        	if(!isParameterEntityType(entityType) && !isAggregateEntityType(entityType)){
        		return;
        	}
            var oEntityType = getEntityType(entityType);
            aKeys = [];
            if (oEntityType.key && oEntityType.key.propertyRef) {
            	oEntityType.key.propertyRef.forEach(function (propertyRef) {
                    aKeys.push(propertyRef.name);
                });
            }
            
            aAllKeys = aAllKeys.concat(aKeys);
        });
        aAllKeys = sap.apf.utils.eliminateDuplicatesInArray(oInject.messageHandler, aAllKeys);
        return aAllKeys;
    };


    /**
     * @description Returns all metadata attributes for a given property. It
     *              will be searched over all entity types for this property
     *              and the first match will be returned.
     * @param {String} sPropertyName
     *            sPropertyName - identifier of the used OData property
     * @returns {Object} - Object with attributes of the property
     */
    this.getAttributes = function (sPropertyName) {
        var done = false;
        var oPropertyAttributes;
        getEntityTypes().forEach(function (entityType) {
            if (done) {
                return;
            }
            oPropertyAttributes = getPropertyMetadataFromEntityType(entityType, sPropertyName);
            if (oPropertyAttributes.name) {
                done = true;
            }
        });
        return oPropertyAttributes;
    };
    /**
     * @description Returns metadata which includes parameter entity set key properties and their attributes (data type, default value, ...) for the provided entity type.
     * @param {String} sEntitySet - identifier of the used OData entity type
     * @returns {Array} or {undefined} - parameters of the entity type
     */
    this.getParameterEntitySetKeyProperties = function (sEntitySet) {
        oInject.messageHandler.check(sEntitySet !== undefined && typeof sEntitySet === "string", "sap.apf.core.Metadata:getParameterEntitySetKeyProperties incorrect EntityType name or type");
        var sEntityType = determineEntityTypeName(sEntitySet);

        if (!sEntityType) {
            return [];
        }
        return getParameterPropertiesFromEntityType(sEntityType, true);

    };


    /**
     * @description Returns the entityType annotations which includes extensions for OData 4.0 like "RequiresFilter"
     * @param {String} sEntitySet - identifier of the used OData entity set
     * @returns {Object} - annotations of the entity type
     */
    this.getEntityTypeAnnotations = function (sEntitySet) {    
        oInject.messageHandler.check(sEntitySet !== undefined && typeof sEntitySet === "string", "sap.apf.core.Metadata:getEntityTypeAnnotations incorrect EntityType name or type");

        var sEntityType = determineEntityTypeName(sEntitySet);

        if (oHtEntityTypeMetadata.hasItem(sEntityType) === true) {
            return oHtEntityTypeMetadata.getItem(sEntityType);
        } else {
            
            var object = {};
            
            addAnnotations(sEntityType, object);
            
            var sAggregatedEntityType = getEntityTypeOfAggregateEntitySet(sEntityType);
            if (sAggregatedEntityType !== sEntityType) {
            	addAnnotations(sAggregatedEntityType, object);
            }

            oHtEntityTypeMetadata.setItem(sEntityType, object);
            return oHtEntityTypeMetadata.getItem(sEntityType);
        }
        
        function addAnnotations(sEntityType, oAnnotations){
        	var oEntityType = getEntityType(sEntityType);
            for (var sAttributeName in oEntityType) { // jshint ignore:line
            	if(sAttributeName.indexOf(sEntityTypeAnnotationsPreFix) !== 0){         
            		continue;
            	}
                var sAnnotationName = sAttributeName.split(".").pop();
                sAnnotationName = sAnnotationName.replace(/^./, sAnnotationName[0].toLowerCase()); //!!!
                for (var shape in oEntityType[sAttributeName]) { // jshint ignore:line
                	oAnnotations[sAnnotationName] = oEntityType[sAttributeName][shape];
                }
            }
        }
    };
    /**
     * @description Returns all entity sets of the service document that can be used as entity set for analytical configuration.
     * These are all entity sets except those, that have an corresponding parameter entity set. The discovery uses the
     * associations. They are not the end of an association.
     * @returns {Array} - EntitySets Returns entity sets
     */
    this.getEntitySets = function() {

		var dependencies = {};
		var validEntitySets = [];
		var container = oMetaModel.getODataEntityContainer();
		if (container.associationSet) {
			container.associationSet.forEach(function(association) {
				
				var entitySetNameEnd, entityTypeNameEnd;
				entitySetNameEnd = association.end[1].entitySet;
				entityTypeNameEnd = determineEntityTypeName(entitySetNameEnd);
					
				if (!isParameterEntityType(entityTypeNameEnd)) {
						dependencies[association.end[1].entitySet] = true;
				}
			});
		}
		if (container.entitySet) {
			container.entitySet.forEach(function(entitySet) {
				if (!dependencies[entitySet.name]) {
					validEntitySets.push(entitySet.name);
				}
			});
		}

		return validEntitySets;
	};

    initMetadata();

}; 
