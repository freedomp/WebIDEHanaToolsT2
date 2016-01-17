/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare('sap.apf.utils.filterIdHandler');
/**
 * @private
 * @class Filter ID handler
 * @description Provides methods that allow to manage application specific
 *              filter restrictions for each path update.
 * @param {Object}
 *            inject Object containing functions to be used by filter id handler.
 * @param {sap.apf.core.MessageHandler}
 *            msgHandler Message handler instance.
 * @name sap.apf.utils.FilterIdHandler
 * @returns {sap.apf.utils.FilterIdHandler}
 */
(function() {
    'use strict';
    sap.apf.utils.FilterIdHandler = function(inject) {
        var msgHandler = inject.instance.messageHandler;
        var uniqueConsumerId = 1;
        var internallyGeneratedIds = [];
        var filterIdToProperty = {};
        /**
         * @private
         * @function
         * @name sap.apf.utils.FilterIdHandler#add
         * @description Adds an application specfic filter ID and maps it to the property used in the filter.
         *              Creates a unique fragment and a corresponding identifier.
         *              Subsequent changes need to be done by the update method
         *              providing the identifier.
         * @param {sap.apf.utils.Filter}
         *            filter filter Requires a filter instance
         * @returns {number} Unique numeric ID to be provided for later updates
         *          of the same fragment. Consecutive numbers for the different
         *          unique IDs are not guaranteed.
         */
        this.add = function(filter) {
            filterIdToProperty[uniqueConsumerId] = getPropertyNameOfFirstFilterTerm(filter);
            internallyGeneratedIds.push(uniqueConsumerId);
            inject.functions.setRestrictionByProperty(filter);
            return uniqueConsumerId++;
        };

        /**
         * @private
         * @function
         * @name sap.apf.utils.FilterIdHandler#update
         * @description Updates a context fragment for the given identifier by
         *              fully replacing the existing one.
         * @param {id}
         *            id Either requires numeric identifier of the context
         *            fragment that was returned by add method or requires an
         *            external identifier of type string that has to be
         *            determined by the consumer. When using identifiers of type
         *            string the add method must not be used. Update is
         *            sufficient. It either overwrites an existing context
         *            fragment for the identifier or creates a new one.
         * @param {sap.apf.utils.Filter}
         *            filter Requires a filter instance
         */
        this.update = function(id, filter) {
            if (id && typeof id == 'number') {
                msgHandler.check((id > 0 && id < uniqueConsumerId), 'Passed unknown numeric identifier during update of path context handler');
                if (!(id > 0 && id < uniqueConsumerId)) {
                    return;
                }
            } else if (!id || typeof id != 'string') {
                msgHandler.check(false, 'Passed false identifier during update of path context handler');
                return;
            }
            
            inject.functions.setRestrictionByProperty(filter);
            filterIdToProperty[id] = getPropertyNameOfFirstFilterTerm(filter);
        };

        /**
         * @private
         * @function
         * @name sap.apf.utils.FilterIdHandler#get
         * @description Returns a context fragment for the given identifier
         * @param {number|string}
         *            id Requires identifier of the context fragment. The id was
         *            returned by the add method.
         * @returns {sap.apf.utils.Filter} Context assigned to identifier
         */
        this.get = function(id) {
            switch (typeof id) {
	            case 'number':
	                msgHandler.check((id > 0 && id < uniqueConsumerId), 'Passed unknown numeric identifier during get from path context handler');
	                break;
	            case 'string':
	                msgHandler.check(filterIdToProperty[id], 'Passed unknown string identifier during get from path context handler');
	                break;
            }
            return inject.functions.getRestrictionByProperty(filterIdToProperty[id]);
        };

        /**
         * @private
         * @function
         * @name sap.apf.utils.FilterIdHandler#getAllInternalIds
         * @description Returns alll internally generated IDs
         * @returns {Array} List of internally generated IDs
         */
        this.getAllInternalIds = function(id) {
            return jQuery.sap.extend(true, [], internallyGeneratedIds);
        };
        /**
         * @private
         * @function
         * @name sap.apf.utils.FilterIdHandler#serialize
         * @description Serializes the content of the filterIdHandler.
         * @returns {object} Serialized data as deep JS object
         */
        this.serialize = function() {
        	return jQuery.extend(true, {}, filterIdToProperty);
        };

        /**
         * @private
         * @function
         * @name sap.apf.utils.FilterIdHandler#deserialize
         * @description Re-initializes filter ID handler from
         *              serialized data.
         * @param deserializableData
         *            Serialized data used to re-initialize filter ID handler
         * @returns {object} Re-initialize instance of
         *          sap.apf.utils.filterIdHandler
         */
        this.deserialize = function(deserializableData) {
        	uniqueConsumerId = 1;
        	var property;
        	for(property in deserializableData){
        		if (typeof ifPossibleConvertToNumber(property) === 'number'){
        			uniqueConsumerId++;
        		}
        	}
        	filterIdToProperty = jQuery.extend(true, {}, deserializableData);
        };
        
        function getPropertyNameOfFirstFilterTerm(filter){
        	return filter.getInternalFilter().getProperties()[0];
        }
        function ifPossibleConvertToNumber(property) {
            if(isNaN(Number(property))) {
                return property;
            }
            return Number(property);
        }
    };
}());