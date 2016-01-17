/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
/*global sap, jQuery*/

jQuery.sap.declare("sap.apf.modeler.core.configurationEditor");
jQuery.sap.require("sap.apf.utils.utils");

(function () {
    'use strict';

    /**
     * @private
     * @name sap.apf.modeler.core.ConfigurationEditor
     * @class Configuration Editor manages the different configuration objects like categories, steps etc.
     * @param {String} configuration - ConfigurationEditor configuration guid
     * @param {Object} inject - Injection of required APF objects
     * @param {Object} inject.instance - Injected instances
     * @param {sap.apf.core.utils.MessageHandler} inject.instance.messageHandler - MessageHandler instance
     * @param {sap.apf.modeler.core.OdataProxy} inject.instance.persistenceProxy - PersistenceProxy instance
     * @param {sap.apf.modeler.core.ConfigurationHandler} inject.instance.configurationHandler - ConfigurationHandler instance
     * @param {sap.apf.modeler.core.TextPool} inject.instance.textPool - TextPool instance
     * @param {sap.apf.modeler.core.Instance} inject.instance.coreApi - Modeler core instance
     * @param {sap.ui.thirdparty.datajs} inject.instance.datajs
     * @param {Object} inject.constructor - Injected constructors
     * @param {sap.apf.core.utils.Hashtable} inject.constructor.hashtable - Hashtable constructor
     * @param {sap.apf.modeler.core.ConfigurationObjects} inject.constructor.configurationObjects
     * @param {sap.apf.modeler.core.Step} inject.constructor.step
     * @param {sap.apf.modeler.core.Representation} inject.constructor.representation
     * @param {sap.apf.modeler.core.ElementContainer} inject.constructor.elementContainer
     * @param {sap.apf.modeler.core.RegistryWrapper} inject.constructor.registryProbe
     * @param {sap.apf.core.ConfigurationFactory} inject.constructor.configurationFactory
     * @param {sap.apf.core.Metadata} inject.constructor.metadata
     * @param {sap.apf.core.EntityTypeMetadata} inject.constructor.entityTypeMetadata
     * @param {sap.apf.core.MetadataFacade} inject.constructor.metadataFacade
     * @param {sap.apf.core.MetadataProperty} inject.constructor.metadataProperty
     * @param {sap.apf.core.MetadataFactory} inject.constructor.configurationFactory
     * @param {Function} callbackAfterLoad - Callback called after load from server with signature callbackAfterLoad(instance, messageObject)
     * @param {Object} dataFromCopy - Optional parameter to set the internal state of the new instance during a copy operation
     * @constructor
     */
    sap.apf.modeler.core.ConfigurationEditor = function (configuration, inject, callbackAfterLoad, dataFromCopy) {
        var that = this;
        var applicationTitle;
        var configurationName;
        var configurationHandler = inject.instance.configurationHandler;
        var persistenceProxy = inject.instance.persistenceProxy;
        var messageHandler = inject.instance.messageHandler;
        var metadataFactory = inject.instance.metadataFactory;
        var isSaved = true;
        var stepContainer,
            categoryContainer,
            facetFilterContainer,
            navigationTargetContainer,
            categoryStepAssignmentContainer,
            serviceList;
        var configurationObjects = new inject.constructor.configurationObjects(inject);
    
        var configurationFactory = new inject.constructor.configurationFactory({
        	messageHandler : messageHandler,
        	constructor : {
        		registryProbe : inject.constructor.registryProbe
        	}
        });
        if(!dataFromCopy){
        	stepContainer        = new inject.constructor.elementContainer("Step", inject.constructor.step, inject);
            categoryContainer    = new inject.constructor.elementContainer("Category", undefined, inject);
            facetFilterContainer = new inject.constructor.elementContainer("FacetFilter", inject.constructor.facetFilter, inject);
            navigationTargetContainer = new inject.constructor.elementContainer("NavigationTarget", inject.constructor.navigationTarget, inject);
            categoryStepAssignmentContainer = new inject.constructor.elementContainer("CategoryStepAssignment", inject.constructor.elementContainer, inject);
            serviceList          = [];
        }else{
        	stepContainer        			= dataFromCopy.stepContainer;
            categoryContainer    			= dataFromCopy.categoryContainer;
            facetFilterContainer 			= dataFromCopy.facetFilterContainer;
            navigationTargetContainer       = dataFromCopy.navigationTargetContainer;
            categoryStepAssignmentContainer = dataFromCopy.categoryStepAssignmentContainer;
            serviceList          			= dataFromCopy.serviceList;	
        }
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#registerService
         * @description Registers service for value help collection. Message will be thrown in case of invalid service.
         * @param {String} serviceRoot
         * @returns {Boolean} isServiceRegistered - Returns true if service is registered successfully
         */
        this.registerService = function(serviceRoot) {
        	var isServiceRegistered = false;
        	if(serviceList.indexOf(serviceRoot) === -1) {
        		if(metadataFactory.getMetadata(serviceRoot)) {
        			serviceList.push(serviceRoot);
        			isServiceRegistered = true;
        		}
        	} else {
        		isServiceRegistered = true;
        	}
        	return isServiceRegistered;
        };
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#getAllServices
         * @description Returns all successfully registered services.
         * @returns {Object[]} serviceList
         */
        this.getAllServices = function() {
        	return serviceList;
        };
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#getAllEntitySetsOfService
         * @description Returns all entity sets of service.
         * @param {String} serviceRoot 
         * @returns {Object[]} entitySets
         */
        this.getAllEntitySetsOfService = function(serviceRoot) {
        	var entitySets = [];
        	if(serviceList.indexOf(serviceRoot) > -1) {
        		entitySets = metadataFactory.getEntitySets(serviceRoot);
        	}
        	return entitySets;
        };
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#getAllEntitySetsOfServiceWithGivenProperties
         * @description Returns all entity sets of service that have the given set of properties as filterable properties.
         * @param {String} serviceRoot 
         * @param {Array} properties
         * @returns {Object[]} entitySets
         */
        this.getAllEntitySetsOfServiceWithGivenProperties = function(serviceRoot, properties) {
        	var result = [],
        	    metadata;
        	
        	var entitySets = this.getAllEntitySetsOfService(serviceRoot);
        	if(!properties || properties.length === 0){
        		return entitySets;
        	}
        	
        	metadata = metadataFactory.getMetadata(serviceRoot);
        	
        	entitySets.forEach(function(entitySet){
        		var filterableProperties = metadata.getFilterableProperties(entitySet);
        		var hasAllProperties = true;
        		for(var i = 0; i < properties.length; i++){
        			if( filterableProperties.indexOf( properties[i]) <= -1 ){
        				hasAllProperties = false;
        				break;
        			}
        		}
        		if(hasAllProperties){
        			result.push(entitySet);
        		}
        	});
      
        	return result;
        };
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#getAllPropertiesOfEntitySet
         * @description Returns all properties of an entity set provided the entitySet has an "extension".
         *      Extension means an annotation in the entityType of metadata.xml equak to "sap:semantics"="aggregate" or "sap:semantics"="parameter".
         *      When the entityType does not have this annotation then the result array is empty.
         * @param {String} serviceRoot 
         * @param {String} entitySet 
         * @returns {Object[]} entitySetProperties
         */
        this.getAllPropertiesOfEntitySet = function(serviceRoot, entitySet) {
        	var entitySetProperties = [];
        	if(serviceList.indexOf(serviceRoot) > -1) {
        		entitySetProperties = metadataFactory.getMetadata(serviceRoot).getAllAggregatePropertiesOfEntitySet(entitySet);
        	}
        	return entitySetProperties;
        };
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#getAllKnownProperties
         * @description Returns all known properties of registered services including parameter entity set key properties. 
         * @returns {Object[]} allKnownProperties
         */
        this.getAllKnownProperties = function() {
        	var allKnownProperties = [];
        	var metadata;
        	serviceList.forEach(function(serviceRoots) {
        		metadata = metadataFactory.getMetadata(serviceRoots);
        		allKnownProperties = allKnownProperties.concat(metadata.getAllProperties());
			});
        	allKnownProperties = sap.apf.utils.eliminateDuplicatesInArray(messageHandler, allKnownProperties);
        	return allKnownProperties;
        };
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#setApplicationTitle
         * @description Set application title of analytical configuration.
         * @param {String} textKey Text key for application title
         */
        this.setApplicationTitle = function(textKey) {
            isSaved = false;
        	applicationTitle = textKey;
        };
        /**
         * @private
         * @function
         * @description Get application title of analytical configuration.
         * @name sap.apf.modeler.core.ConfigurationEditor#getApplicationTitle
         * @returns {String} textKey Text key of application title
         */
        this.getApplicationTitle = function() {
        	return applicationTitle;
        };
        /**
         * @private
         * @function
         * @description Get configuration name of analytical configuration.
         * Only needed modeler core internally in order to synchronize the configuration list of configuration handler during reset.
         * @name sap.apf.modeler.core.ConfigurationEditor#getConfigurationName
         * @returns {String} name Configuration name
         */
        this.getConfigurationName = function() {
        	if (!configurationName) {
        		configurationName = configurationHandler && configurationHandler.getConfiguration && configurationHandler.getConfiguration(configuration.id || configuration).AnalyticalConfigurationName;
        	}
            return configurationName;
        };
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#getCategoryStepAssignments
         * @description Get the assignments of steps for a given category
         * @param {String} id Category identifier
         * @returns {array|boolean} Returns the step assignments or false for a not existing category
         */
        this.getCategoryStepAssignments = function(categoryId){
        	var result = [];
        	if(!this.getCategory(categoryId)){
        		return false;
        	}
        	var categoryStepAssignment = categoryStepAssignmentContainer.getElement(categoryId);
        	if(categoryStepAssignment){
            	categoryStepAssignment.getElements().forEach(function(step){
            		result.push(step.stepId);
            	});	
        	}
        	return result;
        };
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#addCategoryStepAssignment
         * @description Create a new category step assignment
         * @param {string} categoryId
         * @param {string} stepId
         * @returns {boolean} Returns true if a new category step assignment has been created
         */
        this.addCategoryStepAssignment = function (categoryId, stepId) {
        	if(!this.getCategory(categoryId) || !this.getStep(stepId)){
        		return false;
        	}
        	var categoryStepAssignment = categoryStepAssignmentContainer.getElement(categoryId);
        	if(!categoryStepAssignment){
        		categoryStepAssignmentContainer.createElementWithProposedId({}, categoryId);
        		categoryStepAssignment = categoryStepAssignmentContainer.getElement(categoryId);
        	}
        	if(!categoryStepAssignment.getElement(stepId)){
        		categoryStepAssignment.createElementWithProposedId({stepId: stepId}, stepId);
        		return true;
        	}
        	return false;
        };
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#removeCategoryStepAssignment
         * @description Remove an existing category step assignment. 
         * @description If the last category assignment for a step is removed, the step is removed as well.
         * @description  - If the assignment changes please use first(!) addCategoryStepAssignment for the new assignments
         * @description  - Afterwards(!) remove the not needed assignments with removeCategoryStepAssignment 
         * @description  - Otherwise(!) you might loose the step object in between 
         * @param {string} categoryId - category
         * @param {string} [stepId] - optional parameter for step
         * @returns {boolean} Returns true if a category step assignment was removed
         */
        this.removeCategoryStepAssignment = function (categoryId, stepId) {
        	var removedItem;
        	
        	if(!stepId){
        		var steps = this.getCategoryStepAssignments(categoryId);
        		removedItem = categoryStepAssignmentContainer.removeElement(categoryId);
        		
        		if(removedItem){
        			_removeDanglingSteps(steps);	
        		}
        		
        		return !!removedItem;
        	}
        	
        	var categoryStepAssignment = categoryStepAssignmentContainer.getElement(categoryId);
        	if(!categoryStepAssignment){
        		return false;
        	}
        	removedItem = categoryStepAssignment.removeElement(stepId);
        	if(categoryStepAssignment.getElements().length === 0){
        		categoryStepAssignmentContainer.removeElement(categoryId);
        	}
        	
        	if(removedItem){
    			_removeDanglingSteps([stepId]);	
    		}
        	
        	return !!removedItem;
        };
        
        function _removeDanglingSteps(steps) {
        	if(!steps){
        		return;
        	}
        	steps.forEach(function(stepId){
        		if(that.getCategoriesForStep(stepId).length === 0){
        			_removeStep(stepId);
        		}
        	});
        }
        
        /**
         * Change the ordering by moving one category step assignment in the ordering before another category step assignments.
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationObjects#moveCategoryStepAssignmentBefore
         * @param {string} beforeStepId
         * @param {string} movedStepId
         * @returns {number|null} WHEN either Id is not contained or undefined THEN return null.
         *      Otherwise return the index of the index position of movedStepId, after the move.
         */
        this.moveCategoryStepAssignmentBefore = function(categoryId, beforeStepId, movedStepId) {
          	var categoryStepAssignment = categoryStepAssignmentContainer.getElement(categoryId);
        	if(!categoryStepAssignment){
        		return null;
        	}
        	return categoryStepAssignment.moveBefore(beforeStepId, movedStepId);
        };
        
        /**
         * Change the ordering of category step assignments by moving one category step assignment in the ordering to the end.
         * The move only happens within the steps for a given category
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationObjects#moveCategoryStepAssignmentToEnd
         * @param {string} categoryId
         * @param {string} stepId
         * @returns {number|null} WHEN the category step assignment is not contained or undefined THEN return null.
         *      Otherwise return the index of the index position of the stepId for the given categoryId, after the move.
         */
        this.moveCategoryStepAssignmentToEnd = function(categoryId, stepId) {
          	var categoryStepAssignment = categoryStepAssignmentContainer.getElement(categoryId);
        	if(!categoryStepAssignment){
        		return null;
        	}
        	return categoryStepAssignment.moveToEnd(stepId);
        };
        
        /**
         * Move a category step assignment up or down some places specified by distance
         * The move only happens within the steps for a given category
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#moveCategoryStepAssignmentUpOrDown
        * @param {string} categoryId
         * @param {string} stepId
         * @param {number} distance number of places
         */
        this.moveCategoryStepAssignmentUpOrDown = function(categoryId, stepId, distance) {
          	var categoryStepAssignment = categoryStepAssignmentContainer.getElement(categoryId);
        	if(!categoryStepAssignment){
        		return null;
        	}
        	return categoryStepAssignment.moveUpOrDown(stepId, distance);
        };
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#getCategory
         * @description Get an existing category
         * @param {String} id Category identifier
         * @returns {object|undefined} Returns the category object for the ID or undefined for a not existing category
         */
        this.getCategory = categoryContainer.getElement;

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#setCategory
         * @description Create a new or update an existing category. A new category object assigns a member "id" with its id.
         * @param {object} category
         * @param {string} [category.labelKey] Text key for the category
         * @param {String} [categoryId] Category identifier. If parameter is omitted, then the function has the meaning of create, otherwise update.
         * @returns{String} Returns the id of a newly created or updated category
         */
        this.setCategory = function (category, categoryId) {
            isSaved = false;
            return categoryContainer.setElement( category, categoryId);
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#createCategoryWithId
         * @description Create a new category and set its given Id.
         * @param {object} category
         * @param {string} category.labelKey Text key for the category
         * @param {String} categoryId Category identifier.
         * @returns{String} Returns the given id.
         */
        this.createCategoryWithId = function (category, categoryId) {
            isSaved = false;
            return categoryContainer.createElementWithProposedId( category, categoryId).getId();  
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#removeCategory
         * @description Remove an existing category and its corresponding steps which are not assigned to other categories.
         * @param {String} categoryId - Category identifier.
         */
        this.removeCategory = function(categoryId){
            
        	var steps = that.getCategoryStepAssignments(categoryId);
            if(steps){
            	steps.forEach(function(stepId){
            		var categories = that.getCategoriesForStep(stepId);
            		if(!categories || categories.length < 2){
            			_removeStep(stepId);
            		}
            	});
            }
            categoryContainer.removeElement(categoryId);
            
        };


        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#getCategories
         * @description Get all existing categories.
         * @returns {Object[]}
         */
        this.getCategories = categoryContainer.getElements;

        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#copyCategory
         * @function
         * @param {String} categoryId - Category identifier
         * @description Copy a category.
         * @returns {String} - New category id or undefined for not existing category
         */
        this.copyCategory = function(categoryId) {
        	var newCategoryId = categoryContainer.copyElement(categoryId),
        	    newStepId;
        	if(!newCategoryId){
        		return;
        	}
        	that.getCategoryStepAssignments(categoryId).forEach(function(stepId){
        		newStepId = _copyStep(stepId, newCategoryId);
        	});
        	return newCategoryId;
        };
        
        /**
         * Change the ordering by moving one category in the ordering before another category.
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationObjects#moveCategoryBefore
         * @param {string} beforeCategoryId
         * @param {string} movedCategoryId
         * @returns {number|null} WHEN either Id is not contained or undefined THEN return null.
         *      Otherwise return the index of the index position of movedCategoryId, after the move.
         */
        this.moveCategoryBefore = function(beforeCategoryId, movedCategoryId) {
        	return categoryContainer.moveBefore(beforeCategoryId, movedCategoryId);
        };
        
        
        /**
         * Change the ordering of categories by moving one category in the ordering to the end.
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationObjects#moveCategoryToEnd
         * @param {string} categoryId
         * @returns {number|null} WHEN the key categoryId is not contained or undefined THEN return null.
         *      Otherwise return the index of the index position of category(Id), after the move.
         */
        this.moveCategoryToEnd = function(categoryId) {
        	return categoryContainer.moveToEnd(categoryId);
        };
        
        /**
         * Move a category up or down some places specified by distance
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#moveCategoryUpOrDown
         * @param {string} categoryId id of the category, that shall be moved
         * @param {number} distance number of places
         */
        this.moveCategoryUpOrDown = function(categoryId, distance) {
        	return categoryContainer.moveUpOrDown(categoryId, distance);
        };
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationObjects#serialize
         * @description Get a serializable object for the configuration
         * @returns{Object}
         */
        this.serialize = function () {
            return configurationObjects.serializeConfiguration(that);
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#isSaved
         * @description Returns "false" if the configuration has unsaved changes, else "true"
         * @returns{Boolean}
         */
        this.isSaved = function () {
            return isSaved;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#setIsUnsaved
         * @description Sets the ConfigurationEditor to an unsaved state, such that isSaved()===false.
         * This method shall be called by the UI whenever it edited some configuration sub-entity, e.g. the entitySet of a request.
         */
        this.setIsUnsaved = function () {
            isSaved = false;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#save
         * @description Saves or modifies a configuration on database and replaces the temporary configuration id with a server generated one
         * @param {function(response, metadata, messageObject)} callback Callback returns after create/update operation has been executed
         * @param {string} callback.response ID of the saved/modified configuration
         * @param {string} callback.metadata Metadata
         * @param {sap.apf.core.MessageObject} callback.messageObject Identifier of corrupt process flow
         *
         */
        this.save = function (callback) {
            function callbackCreate(response, metadata, messageObject) {
                if (!messageObject) {
                    isSaved = true;
                    configurationName = config.AnalyticalConfigurationName;
                    configurationHandler.replaceConfigurationId(configuration.id || configuration, response.AnalyticalConfiguration);
                    configuration = response.AnalyticalConfiguration;
                }
                callback(configuration, metadata, messageObject);
            }

            function callbackUpdate(metadata, messageObject) {
                if (!messageObject) {
                    isSaved = true;
                    configurationName = config.AnalyticalConfigurationName;
                }
                callback(configuration.id || configuration, metadata, messageObject);
            }

            var config = {
                AnalyticalConfiguration: "",
                AnalyticalConfigurationName: configurationHandler.getConfiguration(configuration.id || configuration).AnalyticalConfigurationName,
                Application: configurationHandler.getApplicationId(),
                SerializedAnalyticalConfiguration: JSON.stringify(this.serialize()),
               
                //TODO: Workaround for MockServer: the following properties needs to be added at least as an empty string for every configuration. 
                //If not, these properties are not available in the result data set of the MockServer and OData requests containing one of the 
                //these select properties ($select) below will fail. 
                //Assumption: these properties are set on server side in "exits". Holds for PUT and POST. 
                CreatedByUser: "", 
                CreationUTCDateTime: null,
                LastChangeUTCDateTime: null,
                LastChangedByUser: ""
            };
            if(typeof configuration === 'string') {
                if (configuration.indexOf("apf1972-") === 0) {
                    //noinspection JSCheckFunctionSignatures
                    persistenceProxy.create("configuration", config, callbackCreate);
                } else {
                    config.AnalyticalConfiguration = configuration;
                    persistenceProxy.update("configuration", config, callbackUpdate, [{name: "AnalyticalConfiguration", value: configuration }]);
                }
            } else {
            	if (configuration.id.indexOf("apf1972-") === 0) {
            		config.AnalyticalConfiguration = "";
                    config.CreationUTCDateTime = null;
                    config.LastChangeUTCDateTime = null;
            	}else{
            		config.AnalyticalConfiguration = configuration.id;
                    config.CreationUTCDateTime = configuration.creationDate;
                    config.LastChangeUTCDateTime = configuration.lastChangeDate;
            	}
                if(configuration.updateExisting){
                    persistenceProxy.update("configuration", config, callbackUpdate,[{name: "AnalyticalConfiguration", value: configuration.id}]);
                } else {
                    
                    persistenceProxy.create("configuration", config, callbackCreate);
                }
            }
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#createFacetFilterWithId
         * @description Create an empty facet filter managed by this editor.
         * @param {string} facetFilterId - Given Id used to identify the facet filter.
         * @returns {String} - facetFilterId
         */
        this.createFacetFilterWithId = function(facetFilterId) {
           return facetFilterContainer.createElementWithProposedId(undefined, facetFilterId).getId();
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#createFacetFilter
         * @description Create an empty facet filter managed by this editor.
         * @returns {String} - facetFilterId
         */
        this.createFacetFilter = function() {
            return facetFilterContainer.createElement().getId();
        };

        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#removeFacetFilter
         * @function
         * @description Remove an existing facet filter.
         * @param {String} id
         */
        this.removeFacetFilter = facetFilterContainer.removeElement;

        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#getFacetFilter
         * @function
         * @param {String} facetFilterId
         * @returns {sap.apf.modeler.core.FacetFilter}
         */
        this.getFacetFilter = facetFilterContainer.getElement;

        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#getFacetFilters
         * @function
         * @description Get all existing facet filter.
         * @returns {sap.apf.modeler.core.FacetFilter[]} {@link sap.apf.modeler.core.FacetFilter}
         */
        this.getFacetFilters = facetFilterContainer.getElements;
        
        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#copyFacetFilter
         * @function
         * @param {String} facetFilterId
         * @description Copy a facet filter.
         * @returns {String} - New facet filter id or undefined for not existing facet filter
         */
        this.copyFacetFilter = facetFilterContainer.copyElement;      
        
        /**
         * Change the ordering by moving one facet filter in the ordering before another facet filter.
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationObjects#moveFacetFilterBefore
         * @param {string} beforeFacetFilterId
         * @param {string} movedFacetFilterId
         * @returns {number|null} WHEN either Id is not contained or undefined THEN return null.
         *      Otherwise return the index of the index position of movedFacetFilterId, after the move.
         */
        this.moveFacetFilterBefore = function(beforeFacetFilterId, movedFacetFilterId) {
        	return facetFilterContainer.moveBefore(beforeFacetFilterId, movedFacetFilterId);
        };
        
        /**
         * Change the ordering of facet filters by moving one facet filter in the ordering to the end.
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationObjects#moveFacetFilterToEnd
         * @param {string} facetFilterId
         * @returns {number|null} WHEN the key facetFilterId is not contained or undefined THEN return null.
         *      Otherwise return the index of the index position of facetFilter(Id), after the move.
         */
        this.moveFacetFilterToEnd = function(facetFilterId) {
        	return facetFilterContainer.moveToEnd(facetFilterId);
        };
        
        /**
         * Move a facet filter up or down some places specified by distance
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#moveFacetFilterUpOrDown
         * @param {string} facetFilterId id of the facetFilter, that shall be moved
         * @param {number} distance number of places
         */
        this.moveFacetFilterUpOrDown = function(facetFilterId, distance) {
        	return facetFilterContainer.moveUpOrDown(facetFilterId, distance);
        };
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#createNavigationTargetWithId
         * @description Create an empty navigation target managed by this editor.
         * @param {string} navigationTargetId - Given Id used to identify the navigation target.
         * @returns {String} - navigationTargetId
         */
        this.createNavigationTargetWithId = function(navigationTargetId) {
            return navigationTargetContainer.createElementWithProposedId(undefined, navigationTargetId).getId();
           
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#createNavigationTarget
         * @description Create an empty navigation target managed by this editor.
         * @returns {String} - navigationTargetId
         */
        this.createNavigationTarget = function() {
            return navigationTargetContainer.createElement().getId();
        };

        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#removeNavigationTarget
         * @function
         * @description Remove an existing navigation target.
         * @param {String} id
         */
        this.removeNavigationTarget = navigationTargetContainer.removeElement;

        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#getNavigationTarget
         * @function
         * @param {String} navigationTargetId
         * @returns {sap.apf.modeler.core.NavigationTarget}
         */
        this.getNavigationTarget = navigationTargetContainer.getElement;

        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#getNavigationTargets
         * @function
         * @description Get all existing navigation targets
         * @returns {sap.apf.modeler.core.NavigationTarget[]} {@link sap.apf.modeler.core.NavigationTarget}
         */
        this.getNavigationTargets = navigationTargetContainer.getElements;
        
        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#copyNavigationTarget
         * @function
         * @param {String} navigationTargetId
         * @description Copy a navigation target.
         * @returns {String} - New navigation target id or undefined for not existing navigation target
         */
        this.copyNavigationTarget = navigationTargetContainer.copyElement;  
        
        /**
         * Change the ordering by moving one navigation target in the ordering before another navigation target.
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationObjects#moveNavigationTargetBefore
         * @param {string} beforeNavigationTargetId
         * @param {string} movedNavigationTargetId
         * @returns {number|null} WHEN either Id is not contained or undefined THEN return null.
         *      Otherwise return the index of the index position of movedNavigationTargetId, after the move.
         */
        this.moveNavigationTargetBefore = function(beforeNavigationTargetId, movedNavigationTargetId) {
        	return navigationTargetContainer.moveBefore(beforeNavigationTargetId, movedNavigationTargetId);
        };
        
        /**
         * Change the ordering of navigation targets by moving one navigation target in the ordering to the end.
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationObjects#moveNavigationTargetToEnd
         * @param {string} navigationTargetId
         * @returns {number|null} WHEN the key navigationTargetId is not contained or undefined THEN return null.
         *      Otherwise return the index of the index position of navigationTarget(Id), after the move.
         */
        this.moveNavigationTargetToEnd = function(navigationTargetId) {
        	return navigationTargetContainer.moveToEnd(navigationTargetId);
        };
        
        /**
         * Move a navigation target up or down some places specified by distance
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#moveNavigationTargetUpOrDown
         * @param {string} navigationTargetId id of the navigationTarget, that shall be moved
         * @param {number} distance number of places
         */
        this.moveNavigationTargetUpOrDown = function(navigationTargetId, distance) {
        	return navigationTargetContainer.moveUpOrDown(navigationTargetId, distance);
        };
        
        /**
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#createStepWithId
         * @description Create an empty step managed by this editor.
         * @param {string} stepId - Given Id used to identify the step.
         * @returns {String} - stepId 
         */
        this.createStepWithId = function(stepId) {   
        	return stepContainer.createElementWithProposedId(undefined, stepId).getId(); 
        };
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.ConfigurationEditor#createStep
         * @description Create an empty step managed by this editor.
         * @param {string} categoryId - Given categoryId the step shall be assigned to
         * @returns {String|undefined} - stepId or undefined if the category does not exist
         */
        this.createStep = function(categoryId) {
         	if(!this.getCategory(categoryId)){
        		return;
        	}
        	var stepId = stepContainer.createElement().getId();
        	this.addCategoryStepAssignment(categoryId, stepId);
            return stepId;
        };
        
        
        var _removeStep = stepContainer.removeElement; // private now. If called from external use removeCategoryStepAssignment instead
        
        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#getStep
         * @function
         * @param {String} stepId
         * @returns {sap.apf.modeler.core.Step}
         */
        this.getStep = stepContainer.getElement;
        
        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#getSteps
         * @function
         * @description Get all existing steps.
         * @returns {sap.apf.modeler.core.Step[]} {@link sap.apf.modeler.core.Step}
         */
        this.getSteps = stepContainer.getElements;
        
        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#getStepsNotAssignedToCategory
         * @function
         * @description Returns all step ids which are not assigned to the given category ID.
         * @param {String} categoryId
         * @returns {String[]} - Step IDs
         */
        this.getStepsNotAssignedToCategory = function(categoryId) {
        	var assignedSteps = this.getCategoryStepAssignments(categoryId);
        	var unassignedSteps = [];
        	
        	that.getSteps().forEach(function(step){
        		var stepId = step.getId();
	        	if(assignedSteps.indexOf(stepId) === -1){
	        		unassignedSteps.push(stepId);
	        	}
            });
        	return unassignedSteps;
        };
        
        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#copyStep
         * @function
         * @param {String} stepId - Step identifier
         * @description Copy a step.
         * @returns {String} - New step id or false in case of error
         */
        this.copyStep = function(stepId){
        	var newStepId = _copyStep(stepId);
        	if(!newStepId){
        	 return false;
        	}
        	var categories = this.getCategoriesForStep(stepId);
        	if(categories){
             	categories.forEach(function(categoryId){
            	    that.addCategoryStepAssignment(categoryId, newStepId);
            	});	
        	}
        	return newStepId;
        };
        
        function _copyStep(stepId, categoryIdForNewStep) {
        	if(categoryIdForNewStep && !that.getCategory(categoryIdForNewStep)){
        		return false;
        	}
        	var newStepId = stepContainer.copyElement(stepId);
        	if(!newStepId){
        		return false;
        	}
        	if(categoryIdForNewStep){
        	 that.addCategoryStepAssignment(categoryIdForNewStep, newStepId);
        	}
        	return newStepId;
        }
        
        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#getCategoriesForStep
         * @function
         * @param {String} stepId - Step identifier
         * @description Get all categories the step is assigned to
         * @returns {array} - Array of category Ids 
         */
        this.getCategoriesForStep = function getCategoriesForStep(stepId){
        	var result = [];
        	var categories = that.getCategories();
        	if(categories){
             	categories.forEach(function(category){
             		var categoryId = category.getId();
            		var steps = that.getCategoryStepAssignments(categoryId);
            		if(steps && steps.indexOf(stepId) > -1){
            			result.push(categoryId);
            		}
            	});	
        	}
        	return result;
        };
        
        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#getAssignableStepsForNavigationTarget
         * @function
         * @param {String} navigationTargetId - Navigation target identifier
         * @description Get all steps that can be assigned to the given navigation target
         * @returns {array} - Array of step Ids 
         */
        this.getAssignableStepsForNavigationTarget = function(navigationTargetId){
        	var result = [];
        	that.getSteps().forEach(function(step){
        		var found = false;
        		step.getNavigationTargets().forEach(function(navTarId){
        			if(navigationTargetId === navTarId){
        				found = true;
        			}
        		});
        		if(!found){
        		 result.push(step.getId());	
        		}
        	});
        	return result;
        };
        
        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#getStepsAssignedToNavigationTarget
         * @function
         * @param {String} navigationTargetId - Navigation target identifier
         * @description Get all steps that are assigned to the given navigation target
         * @returns {array} - Array of step Ids 
         */
        this.getStepsAssignedToNavigationTarget = function(navigationTargetId){
        	var result = [];
        	that.getSteps().forEach(function(step){
        		var found = false;
        		step.getNavigationTargets().forEach(function(navTarId){
        			if(navigationTargetId === navTarId){
        				found = true;
        			}
        		});
        		if(found){
        		 result.push(step.getId());	
        		}
        	});
        	return result;
        };
        
        /**
         * @private
         * @name sap.apf.modeler.core.ConfigurationEditor#copy
         * @function
         * @description Execute a deep copy of the configuration editor and its referenced objects
         * @param {String} newConfigurationId - New configuration id for the copied instance
         * @returns {Object} sap.apf.modeler.core.ConfigurationEditor# - New configuration editor being a copy of this object
         */
        this.copy = function( newConfigurationId){
        	var dataForCopy = {
        			stepContainer        			: stepContainer,
                    categoryContainer    			: categoryContainer,
                    facetFilterContainer 			: facetFilterContainer,
                    navigationTargetContainer 		: navigationTargetContainer,
                    categoryStepAssignmentContainer : categoryStepAssignmentContainer,
                    serviceList          			: serviceList };
        	
        	var dataFromCopy = sap.apf.modeler.core.ConfigurationObjects.deepDataCopy( dataForCopy );
        	return new sap.apf.modeler.core.ConfigurationEditor(newConfigurationId, inject, undefined, dataFromCopy);
        };  
        
        if(typeof configuration === 'string') {
            if (configuration.indexOf("apf1972-") === 0) { // temporary id means new unsaved config
            	isSaved = false;
            	if(callbackAfterLoad){
            	  callbackAfterLoad(that, undefined); 
            	}
            } else {
            	if(!dataFromCopy){
	            	loadConfigurationFromServer(configuration, persistenceProxy, function(result, messageObject){
	            	   if(!messageObject){
	            		   var serializedAnalyticalConfiguration = JSON.parse(result.SerializedAnalyticalConfiguration);
	            		   that.setApplicationTitle(serializedAnalyticalConfiguration.applicationTitle);
	            		   configurationFactory.loadConfig(serializedAnalyticalConfiguration);	
	                       configurationObjects.mapToDesignTime(configurationFactory.getRegistry(), that);
	                       isSaved = true;
	                       configurationName = result.AnalyticalConfigurationName;
	                       callbackAfterLoad(that, undefined);   
	            	   } else {
	            		   callbackAfterLoad(undefined, messageObject);  
	            	   }	  
	            	});
            	}
            }
        } else {
            configurationFactory.loadConfig(configuration.content);
            configurationObjects.mapToDesignTime(configurationFactory.getRegistry(), this);
        	if(callbackAfterLoad){
          	  callbackAfterLoad(that, undefined); 
          	}
        }
        
        function loadConfigurationFromServer(configId, persistProxy, callbackAfterLoad) {
            persistProxy.readEntity(
                "configuration",
                function(result, metadata, messageObject) {
                    callbackAfterLoad(result, messageObject);
                },
                [{
                    name : "AnalyticalConfiguration",
                    value: configId
                }],
                undefined,
                true,  configurationHandler.getApplicationId()
            );
        }
    };
}());
