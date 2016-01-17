/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2015 SAP SE. All rights reserved
 */
/*global sap, jQuery*/

jQuery.sap.declare("sap.apf.modeler.core.navigationTarget");

(function () {
    'use strict';

    /**
     * @private
     * @name sap.apf.modeler.core.navigationTarget
     * @class A navigation target proxy object providing editor methods on configuration objects.
     * @param {string} [navigationTargetId] - Optional parameter - Id of the instance
     * @param {Object} inject.constructor - Injected constructors
     * @param {Object} [dataFromCopy] - Optional parameter to set the internal state of the new instance during a copy operation 
     * @constructor
     */
    sap.apf.modeler.core.NavigationTarget = function (navigationTargetId, inject, dataFromCopy) {
    	var semObject,
    	    actn,
    	    isStepSpecific = false,
    	    requestForFilterMapping, 
            targetPropertiesForFilterMapping;
    	
    	if(dataFromCopy){
    		semObject = dataFromCopy.semObject;
    		actn = dataFromCopy.actn;
    		isStepSpecific = dataFromCopy.isStepSpecific;
            requestForFilterMapping = dataFromCopy.requestForFilterMapping;
            targetPropertiesForFilterMapping = dataFromCopy.targetPropertiesForFilterMapping;
    	} else {
    		requestForFilterMapping = {}; 
            targetPropertiesForFilterMapping = new inject.constructor.elementContainer("TargetPropertyForFilterMapping", undefined, inject);
    	}
    	
    	 /**
         * @private
         * @name sap.apf.modeler.core.NavigationTarget#getId
         * @function
         * @description The immutable id of the navigation target
         * @returns {String} id
         */
        this.getId = function () {
            return navigationTargetId;
        };
    	/**
         * @private
         * @name sap.apf.modeler.core.NavigationTarget#setSemanticObject
         * @function
         * @description Set the semantic object of the navigation target
         * @param {string} semanticObject
         */
        this.setSemanticObject = function(semanticObject) {
        	semObject = semanticObject;
        };
      	/**
         * @private
         * @name sap.apf.modeler.core.NavigationTarget#getSemanticObject
         * @function
         * @description Get the semantic object of the navigation target
         * @returns {String} semantic object 
         */
        this.getSemanticObject = function() {
        	return semObject;
        };
     	/**
         * @private
         * @name sap.apf.modeler.core.NavigationTarget#setAction
         * @function
         * @description Set the action of the navigation target
         * @param {string} action
         */
        this.setAction = function(action) {
        	actn = action;
        };
      	/**
         * @private
         * @name sap.apf.modeler.core.NavigationTarget#getAction
         * @function
         * @description Get the action of the navigation target
         * @returns {String} action 
         */
        this.getAction = function() {
        	return actn;
        };
        /**
         * @private
         * @name sap.apf.modeler.core.NavigationTarget#isGlobal
         * @function
         * @description Returns true if the navigation target is a global one, otherwise false
         * @returns {boolean} 
         */
        this.isGlobal = function(){
        	return !isStepSpecific;
        };
        /**
         * @private
         * @name sap.apf.modeler.core.NavigationTarget#isStepSpecific
         * @function
         * @description Returns true if the navigation target is a step specific one, otherwise false
         * @returns {boolean} 
         */
        this.isStepSpecific = function(){
        	return isStepSpecific;
        };
        /**
         * @private
         * @name sap.apf.modeler.core.NavigationTarget#setGlobal
         * @function
         * @description Make the navigation target global
         */
        this.setGlobal = function(){
        	isStepSpecific = false;
        };
        /**
         * @private
         * @name sap.apf.modeler.core.NavigationTarget#setStepSpecific
         * @function
         * @description Make the navigation target global
         */
        this.setStepSpecific = function(){
        	isStepSpecific = true;
        };
        /**
         * @private
         * @name sap.apf.modeler.core.sap.apf.modeler.core.NavigationTarget#setFilterMappingService
         * @function
         * @description Sets the service root for filter mapping. 
         * @param {string} serviceRoot - service root for filter mapping
         */
        this.setFilterMappingService = function(serviceRoot){
        	requestForFilterMapping.service = serviceRoot;
        };
        /**
         * @private
         * @name sap.apf.modeler.core.sap.apf.modeler.core.NavigationTarget#getFilterMappingService
         * @function
         * @description Returns the service root for filter mapping. 
         * @returns {string} - Service root for filter mapping
         */
        this.getFilterMappingService = function () {
            return requestForFilterMapping.service;
        };
        /**
         * @private
         * @name sap.apf.modeler.core.sap.apf.modeler.core.NavigationTarget#setFilterMappingEntitySet
         * @function
         * @description Sets the entity set for filter mapping. 
         * @param {string} entitySet - Entity set for filter mapping
         */
        this.setFilterMappingEntitySet = function(entitySet){
        	requestForFilterMapping.entitySet = entitySet;
        };
        /**
         * @private
         * @name sap.apf.modeler.core.sap.apf.modeler.core.NavigationTarget#getFilterMappingEntitySet
         * @function
         * @description Returns the entity set for filter mapping. 
         * @returns {string} - Entity set for filter mapping
         */
        this.getFilterMappingEntitySet = function () {
            return requestForFilterMapping.entitySet;
        };
        /**
         * @private
         * @name sap.apf.modeler.core.sap.apf.modeler.core.NavigationTarget#addFilterMappingTargetProperty
         * @function
         * @description Adds a target property for filter mapping.
         * @param {string} property - Property name
         */
        this.addFilterMappingTargetProperty = function (property) {
            targetPropertiesForFilterMapping.createElementWithProposedId(undefined, property);
        };
        /**
         * @private
         * @name sap.apf.modeler.core.sap.apf.modeler.core.NavigationTarget#getFilterMappingTargetProperties
         * @function
         * @description Returns an array of target properties for filter mapping.
         * @returns {String[]}
         */
        this.getFilterMappingTargetProperties = function () {
            var propertylist = [];
            var propertyElementList = targetPropertiesForFilterMapping.getElements();
            propertyElementList.forEach(function (item) {
            	propertylist.push(item.getId());
            });
            return propertylist;
        };
        /**
         * @private
         * @name sap.apf.modeler.core.sap.apf.modeler.core.NavigationTarget#removeFilterMappingTargetProperty
         * @function
         * @description Removes a filter mapping target property
         * @param {string} property - Property name
         */
        this.removeFilterMappingTargetProperty = function (property) {
        	targetPropertiesForFilterMapping.removeElement(property);
        };
        
        /**
         * @private
         * @name sap.apf.modeler.core.NavigationTargetr#copy
         * @function
         * @description Execute a deep copy of the navigation target
         * @param {String} [newIdForCopy] - Optional new Id for the copied instance
         * @returns {Object} sap.apf.modeler.core.NavigationTarget# - New navigation target object being a copy of this object
         */
        this.copy = function( newIdForCopy ){
        	var dataForCopy = {
        			semObject 						 : semObject,
		            actn      						 : actn,
		            isStepSpecific 					 : isStepSpecific,
		            requestForFilterMapping 		 : requestForFilterMapping,
		            targetPropertiesForFilterMapping : targetPropertiesForFilterMapping};
        	var dataFromCopy = sap.apf.modeler.core.ConfigurationObjects.deepDataCopy( dataForCopy );
        	return new sap.apf.modeler.core.NavigationTarget( (newIdForCopy || this.getId()), inject, dataFromCopy);
        };
    };

}()); 