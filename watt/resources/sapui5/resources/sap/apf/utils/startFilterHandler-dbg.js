/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */

jQuery.sap.declare('sap.apf.utils.startFilterHandler');
jQuery.sap.require('sap.apf.utils.filter');
jQuery.sap.require('sap.apf.core.utils.filter');

/**
 * @private
 * @class Start filter handler
 * @description -
 * @param -
 * @name sap.apf.utils.StartFilterHandler
 * @returns {sap.apf.utils.startFilterHandler}
 */
sap.apf.utils.StartFilterHandler = function(inject) {
    'use strict';
    var startFilters = [{isLevel : true}];
    var StartFilter = (inject && inject.constructor && inject.constructor.StartFilter) || sap.apf.utils.StartFilter;
    var restrictionsSetByApplication = {};
    var restrictionsInitiallySetByApplication = {};
    var msgH = inject.instance.messageHandler;
    var deferredStartFilters = jQuery.Deferred();
    var isInitialized = false;

	this.getStartFilters = function() {
		if (!isInitialized) {
			isInitialized = true;
			inject.functions.getCombinedContext().done(function(externalContextFilter) {
				var facetFilterConfigurations = inject.functions.getFacetFilterConfigurations();
				var externalContextProperties = externalContextFilter.getProperties();
				var numberOfExternalContextProperties = externalContextProperties.length; 
				var filterPropertyToBeMerged = null;

				facetFilterConfigurations.forEach(function(config) {
					for(var i = 0; i < numberOfExternalContextProperties; i++) {
						if (config.property === externalContextProperties[i]) {
							filterPropertyToBeMerged = externalContextProperties[i];
							break;
						}
					}
					if (filterPropertyToBeMerged) {
						startFilters.push(new StartFilter(inject, config, createContextForStartFilter(externalContextFilter, filterPropertyToBeMerged)));
						//Remove external context property if it has matched a configured property
						externalContextProperties.splice(externalContextProperties.indexOf(filterPropertyToBeMerged), 1);
						filterPropertyToBeMerged = null;
					} else {
						startFilters.push(new StartFilter(inject, config));
					}
				});
				//Create start filters for external context properties that have not matched a configured property 
				externalContextProperties.forEach(function(property) {
				    startFilters.unshift(new StartFilter(inject, {
				        property : property,
				        invisible : true,
				        multiSelection : true
				    }, createContextForStartFilter(externalContextFilter, property)));
				});
				setRestrictionsOnConfiguredFilters();
				deferredStartFilters.resolve(getVisibleStartFilters());
			});
		}
		return deferredStartFilters.promise();
	};
    /**
     * @description Expects an internal filter instance containing disjoint equality filter terms for a single property only.
     * If no start filter for the property exists the method creates a new instance else it updates an existing instance and merges existing values.
     * In both cases the instance provides the filter values in the value list and selected value list. 
     * @param {sap.apf.utils.Filter} filter Instance of external filter
     * @returns undefined
     */    
    this.setRestrictionByProperty = function(filter) {
        var internalFilter = filter.getInternalFilter();
        var filterValues = getListFromFilter(internalFilter);
        var propertyName = internalFilter.getProperties()[0];
        var isNewStartFilterRequired = true;
        
        getStartFilters().forEach(function(startFilter) {
            if(startFilter.getPropertyName() === propertyName) {
                startFilter.setSelectedValues(filterValues);
                isNewStartFilterRequired = false;
            }
        });
        if(isNewStartFilterRequired) {
            startFilters.unshift(new StartFilter(inject, {multiSelection : true, property : propertyName, invisible : true}, filterValues));
        }
        setRestrictionsOnConfiguredFilters();
        
        restrictionsSetByApplication[propertyName] = filter;
        if(!restrictionsInitiallySetByApplication[propertyName])  {
        	restrictionsInitiallySetByApplication[propertyName] = filter.serialize(); 
        } 
    };
    
    this.getRestrictionByProperty = function(propertyName) {
        if(restrictionsSetByApplication[propertyName]) {
            return restrictionsSetByApplication[propertyName];
        } 
        return new sap.apf.utils.Filter(msgH);
    };
    
    this.getCumulativeFilter = function() {
        var deferred = jQuery.Deferred();
        var result = new sap.apf.core.utils.Filter(msgH);
        var disjointTerms;
        var numberOfStartFilters;
        deferredStartFilters.done(function() {
            numberOfStartFilters = getStartFilters().length;
            
            if(numberOfStartFilters == 0){
            	deferred.resolve(new sap.apf.core.utils.Filter(msgH));
            }
            
            getStartFilters().forEach(function(filter) {
                filter.getSelectedValues().done(function(values) {
                	disjointTerms = new sap.apf.core.utils.Filter(msgH); 
                	if(values && values.type === 'internalFilter'){
                		disjointTerms = values;
                	} 
                	if(jQuery.isArray(values)){
                		values.forEach(function(value) {
                			disjointTerms.addOr(new sap.apf.core.utils.Filter(msgH, filter.getPropertyName(), 'eq', value));
                		});
                	}
                	result.addAnd(disjointTerms);
                    resolveIfAllSelectedValuesAvailable();
                });
            });
        });
    	return deferred.promise();

    	function resolveIfAllSelectedValuesAvailable(){
    	    numberOfStartFilters--;
    	    if(numberOfStartFilters == 0){
    	        deferred.resolve(result); 
    	    }
    	}
    };
    
    this.serialize = function() {
    	var deferred = jQuery.Deferred();
    	var numberOfStartFilters;
    	var restrictedProperty;
    	var serializedStartFilterHandler = {};
    	serializedStartFilterHandler.startFilters = [];
    	serializedStartFilterHandler.restrictionsSetByApplication = {};

    	for(restrictedProperty in restrictionsSetByApplication) {
    		serializedStartFilterHandler.restrictionsSetByApplication[restrictedProperty] = restrictionsSetByApplication[restrictedProperty].serialize();
    	}
    	
    	numberOfStartFilters = getStartFilters().length;
    	if(getStartFilters().length > 0){
    		getStartFilters().forEach(function(startFilter){
    			startFilter.serialize().done(function(serializedStartFilter){
    				serializedStartFilterHandler.startFilters.push(serializedStartFilter);
    				numberOfStartFilters--;
    				if(numberOfStartFilters == 0){
    					deferred.resolve(serializedStartFilterHandler);
    				}
    			});
    		});
    	} else {
    		deferred.resolve(serializedStartFilterHandler);
    	}
    	
    	return deferred.promise();
    };
    
    this.deserialize = function(serializedStartFilterHandler) {
    	var startFilters = getStartFilters();
    	var restrictedProperty;
    	var externalFilter;
    	restrictionsSetByApplication = {};
    	
    	serializedStartFilterHandler.startFilters.forEach(function(serializedStartFilter){
    		for(var i = 0, len = startFilters.length; i < len; i++){
    			if(serializedStartFilter.propertyName === startFilters[i].getPropertyName()){
    				startFilters[i].deserialize(serializedStartFilter);
    			}
    		}
    	});
    	
    	for(restrictedProperty in serializedStartFilterHandler.restrictionsSetByApplication) {
    	    externalFilter = new sap.apf.utils.Filter(msgH);
    	    externalFilter.deserialize(serializedStartFilterHandler.restrictionsSetByApplication[restrictedProperty]);
    	    restrictionsSetByApplication[restrictedProperty] = externalFilter;
    	}
    };
    	
    this.resetAll = function() {
        var initiallyRestrictedProperty;
    	getStartFilters().forEach(function(startFilter) {
    		startFilter.reset();
    	});
    	restrictionsSetByApplication = {};
    	for(initiallyRestrictedProperty in restrictionsInitiallySetByApplication) {
    	    restrictionsSetByApplication[initiallyRestrictedProperty] = new sap.apf.utils.Filter(msgH).deserialize(restrictionsInitiallySetByApplication[initiallyRestrictedProperty]); 
    	}
    };
    
    this.resetVisibleStartFilters = function(){
    	getVisibleStartFilters().forEach(function(startFilter) {
    		startFilter.reset();
    	});
    };

    function getListFromFilter(filter) {
        var result = [];
        filter.getFilterTerms().forEach(function(term) {
            result.push(term.getValue());
        });
        return result;
    }
    
    function createContextForStartFilter(filter, property) {
        var result = [];
        var termsForProperty = filter.getFilterTermsForProperty(property);
        var reducedFilter = filter.reduceToProperty(property);
        
        if(reducedFilter.toUrlParam().indexOf('%20and%20') > -1){
        	return reducedFilter;
        }
        
        for(var i = 0, len = termsForProperty.length; i < len; i++){
            if(termsForProperty[i].getOp() !== 'EQ'){
                return reducedFilter; 
            }
            result.push(termsForProperty[i].getValue());
        }
        return result;
    }
    
    function getVisibleStartFilters(){
    	var visibleStartFilters = [];
        getStartFilters().forEach(function(startFilter) {
    	    if(startFilter.isVisible()) {
    	        visibleStartFilters.push(startFilter);
    	    }
    	});
        return visibleStartFilters;
    }
    
    function getStartFilters(){
    	var realStartFilters = [];
    	startFilters.forEach(function(filter){
    		if(!filter.isLevel){
    			realStartFilters.push(filter);
    		}
    	});
    	return realStartFilters;
    }
    
    function getMinusOneLevelFilters(){
    	var minusOneLevelFilters = [];
    	for(var i = 0, len = startFilters.length; i < len; i++) {
    		if(!startFilters[i].isLevel) {
    			minusOneLevelFilters.push(startFilters[i]);
    		} else {
    			break;
    		}
    	}
    	return minusOneLevelFilters;
    }
    
    function setRestrictionsOnConfiguredFilters(){
        setRestrictions(buildRestrictiveFilters(getMinusOneLevelFilters()));
        
        function buildRestrictiveFilters(filters){
        	var restrictiveFilter = new sap.apf.core.utils.Filter(msgH);
        	filters.forEach(function(startFilter) {
            	var filter = new sap.apf.core.utils.Filter(msgH);
            	startFilter.getSelectedValues().done(function(values){ //TODO Enhance: logic not sufficient once filter levels are introduced. Currently used promises from minus-one-level are synchronously resolved. This will not hold true for configured filter resolution requests. 
            		if(values.type === 'internalFilter'){
            			filter.addOr(values);
            		}else{
            			values.forEach(function(value){
            				filter.addOr(startFilter.getPropertyName(), 'eq', value);
            			});
            		}
            	});
            	restrictiveFilter.addAnd(filter);
            });
        	return restrictiveFilter;
        }
        
        function setRestrictions(restrictiveFilter){
        	var isLevelReached = false;
            startFilters.forEach(function(filter) {
            	if(filter.isLevel) {
            		isLevelReached = true;
            		return;
            	}
            	if(isLevelReached) {
            		filter.setRestriction(restrictiveFilter);
            	}
            });
        }
	}
};