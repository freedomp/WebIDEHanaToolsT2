/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.apf.core.metadataFacade");
jQuery.sap.require("sap.apf.utils.utils");

/** 
 * @class Provides convenience functions for accessing metadata 
 * @param {Object} oInject - tbd
 * @param {String} sAbsolutePathToServiceDocument Absolute Path to service document
 * @returns {sap.apf.core.MetadataProperty}
 */
sap.apf.core.MetadataFacade = function(oInject, sAbsolutePathToServiceDocument) {
	/**
	 * @description Contains 'metadataFacade'
	 * @returns {String}
	 */
	this.type = "metadataFacade";
	// Private vars
	var fnMetadataProperty = oInject.metadataProperty;
	var oMessageHandler = oInject.messageHandler;
	var oMetadataFactory = oInject.metadataFactory;
	var aPropertyNames;
	var aParameterNames;
	var oProperties = {};
	
	// Public functions
	/**
	 * @description Returns all property names
	 * @param {Function} callback - callback function providing array of properties as strings
	 */
	this.getAllProperties = function(callback){
		if(aPropertyNames){
            callback(aPropertyNames);
        }else{
            var aMetadataServiceDocuments = getServiceDocuments();
            var oMetadata;
            aPropertyNames = [];
            for(var i = 0; i < aMetadataServiceDocuments.length; i++){
                oMetadata = oMetadataFactory.getMetadata(aMetadataServiceDocuments[i]);
                aPropertyNames = aPropertyNames.concat(oMetadata.getAllProperties());
            }
            aPropertyNames = sap.apf.utils.eliminateDuplicatesInArray(oMessageHandler, aPropertyNames);
            callback(aPropertyNames);
		}
	};
	/**
	 * @description Returns all properties which are paramenter key properties
	 * @param {Function} callback - callback function providing array of properties which are parameter entity set key properties as strings
	 */
	this.getAllParameterEntitySetKeyProperties = function(callback){
		if(aParameterNames){
            callback(aParameterNames);
        }else{
            var aMetadataServiceDocuments = getServiceDocuments();
            var oMetadata;
            aParameterNames = [];
            for(var i = 0; i < aMetadataServiceDocuments.length; i++){
                oMetadata = oMetadataFactory.getMetadata(aMetadataServiceDocuments[i]);
                aParameterNames = aParameterNames.concat(oMetadata.getParameterEntitySetKeyPropertiesForService());
            }
            aParameterNames = sap.apf.utils.eliminateDuplicatesInArray(oMessageHandler, aParameterNames);
            callback(aParameterNames);
		}
	};
	/**
	 * @description Returns a object of type {sap.apf.core.MetadataProperty} for
	 *              accessing attributes of a metadata property
	 * @param {String} sName - property name
	 * @param {Function} callback - callback function providing {sap.apf.core.MetadataProperty} object
	 */
	this.getProperty = function(sName, callback){
		if(oProperties[sName]){
            callback(oProperties[sName]);
        }else{
            var aMetadataServiceDocuments = getServiceDocuments();
            var oPropertyAttributes;
            var oMetadata;
            for(var i = 0; i < aMetadataServiceDocuments.length; i++){
                oMetadata = oMetadataFactory.getMetadata(aMetadataServiceDocuments[i]);
                oPropertyAttributes = oMetadata.getAttributes(sName);
                if(oPropertyAttributes.name){
                    //add attribute isHanaViewParameter
                    if(oMetadata.getParameterEntitySetKeyPropertiesForService().indexOf(sName) > -1){
                        //add attribute isKey
                        oPropertyAttributes.isParameterEntitySetKeyProperty = true;
                    }
                    if(oMetadata.getAllKeys().indexOf(sName) > -1){
                        //resolution of dataType
                        oPropertyAttributes.isKey = true;
                    }
                    break;
                }
            }

            for(var name in oPropertyAttributes){
                if(name === "dataType") {
                    for(var dataTypeName in oPropertyAttributes.dataType){
                        oPropertyAttributes[dataTypeName] = oPropertyAttributes.dataType[dataTypeName];
                    }
                }
            }

			var oMetadataProperty = new fnMetadataProperty(oPropertyAttributes);
            oProperties[sName] = oMetadataProperty;
            callback(oProperties[sName]);
		}
	};

    // Private functions
    function getServiceDocuments(){
        if(typeof sAbsolutePathToServiceDocument === "string"){
            return [sAbsolutePathToServiceDocument];
        }else{
            return oMetadataFactory.getServiceDocuments();
        }
    }
};