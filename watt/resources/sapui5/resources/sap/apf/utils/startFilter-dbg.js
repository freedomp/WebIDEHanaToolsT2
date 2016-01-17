/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */

jQuery.sap.declare('sap.apf.utils.startFilter');

/**
 * @private
 * @class Start filter
 * @description -
 * @param -
 * @name sap.apf.utils.StartFilter
 * @returns {sap.apf.utils.startFilter}
 */
sap.apf.utils.StartFilter = function(inject, config, context) {
	'use strict';
	
    var externallySetSelectedValues;
    var restriction;
    var deferredValueHelpRequest;
    var deferredFilterResolutionRequest;
    var initiallySelectedValues;
   
    convertRequestResponseToArrayList = convertRequestResponseToArrayList.bind(this);
    createAvailableValuesHashMap = createAvailableValuesHashMap.bind(this);
    sendFilterResolutionRequest = sendFilterResolutionRequest.bind(this);
	
	this.getPropertyName = function(){
	    return config.property;
	};
	
	this.getLabel = function(){
	    return config.label;
	};
	
    this.getAliasNameIfExistsElsePropertyName = function(){
            return config.alias || config.property;
    };
    
    this.isMultiSelection = function() {
        if(config.multiSelection === 'true' || config.multiSelection === true){
            return true;
        }
        return false;
    };
    
    this.isVisible = function() {
        if(context && context.type === 'internalFilter' && !config.filterResolutionRequest) {
            return false;
        }
        return !config.invisible;
    };
    
    this.setRestriction = function(filter){
    	deferredValueHelpRequest = undefined;
    	deferredFilterResolutionRequest = undefined;
    	restriction = filter; 
    };
    
    this.getValues = function() {
        var deferred;
        var valueHelpList = [];
        var preselectionValues;
        prependListValuesIfNotContainedInResponse = prependListValuesIfNotContainedInResponse.bind(this);
        prependFilterResolutionResponseIfNotContained = prependFilterResolutionResponseIfNotContained.bind(this);
        
    	if(config.valueHelpRequest && jQuery.isArray(context)){
    		return sendValueHelpRequest().then(function(response){
    			var valueHelpList = response.data;
    			prependListValuesIfNotContainedInResponse(context, valueHelpList);
    		    return valueHelpList;
    		});
    	}else if(context && context.type === 'internalFilter' && config.valueHelpRequest && config.filterResolutionRequest){
    		deferred = jQuery.when(sendValueHelpRequest(), sendFilterResolutionRequest());
    		return deferred.then(function(responseValueHelp, responseFilterResolution){
    			var valueHelpList = responseValueHelp.data;
    			
    			prependFilterResolutionResponseIfNotContained(responseFilterResolution.data, valueHelpList); 
    			return valueHelpList;
    		});
    	}else if(config.valueHelpRequest && ((config.preselectionDefaults && config.preselectionDefaults.length > 0) || jQuery.isFunction(config.preselectionFunction)) ){
    		return sendValueHelpRequest().then(function(response){
    			var valueHelpList = response.data;
    			var preselectionValues;
    			
    			if(config.preselectionDefaults && config.preselectionDefaults.length > 0) {
        			preselectionValues = config.preselectionDefaults;
        		} else {
        			preselectionValues = config.preselectionFunction();
        		}
    			
    			prependListValuesIfNotContainedInResponse(preselectionValues, valueHelpList);
    		    return valueHelpList;
    		});
    	}else if(config.valueHelpRequest){
    		return sendValueHelpRequest().then(function(response){
    			return response.data;
    		});
    	}else if(context && context.type === 'internalFilter' && config.filterResolutionRequest){
    		return sendFilterResolutionRequest().then(function(response){
    			return response.data;
    		});
    	}else if(jQuery.isArray(context) && config.filterResolutionRequest && !config.valueHelpRequest){
    		return sendFilterResolutionRequest().then(function(response){
    			return response.data;
    		});
    	}else if(jQuery.isArray(context)){
    		deferred = jQuery.Deferred();
    		prependListValuesIfNotContainedInResponse(context, valueHelpList);
    		deferred.resolve(valueHelpList);
    		return deferred.promise();
    	}else if(((config.preselectionDefaults && config.preselectionDefaults.length > 0) || jQuery.isFunction(config.preselectionFunction)) && !config.valueHelpRequest && !config.filterResolutionRequest && !context){
    		if(config.preselectionDefaults && config.preselectionDefaults.length > 0) {
    			preselectionValues = config.preselectionDefaults;
    		} else {
    			preselectionValues = config.preselectionFunction();
    		}
    		if(this.isMultiSelection()){
    			 prependListValuesIfNotContainedInResponse(preselectionValues, valueHelpList);
    		}else{
    			prependListValuesIfNotContainedInResponse([preselectionValues[0]], valueHelpList);
    		}
    		return jQuery.Deferred().resolve(valueHelpList).promise();
    	}else if(((config.preselectionDefaults && config.preselectionDefaults.length > 0) || jQuery.isFunction(config.preselectionFunction)) && config.filterResolutionRequest && !context){
    		if(config.preselectionDefaults && config.preselectionDefaults.length > 0) {
    			preselectionValues = config.preselectionDefaults;
    		} else {
    			preselectionValues = config.preselectionFunction();
    		}
    		if(this.isMultiSelection()){
    			 prependListValuesIfNotContainedInResponse(preselectionValues, valueHelpList);
    		}else{
    			prependListValuesIfNotContainedInResponse([preselectionValues[0]], valueHelpList);
    		}
    		return jQuery.Deferred().resolve(valueHelpList).promise();
    	}else if(context && context.type === 'internalFilter' || !context){
    		return jQuery.Deferred().resolve(null).promise();
    	}
    	
    	function prependFilterResolutionResponseIfNotContained(responseFilterResolution, responseValueHelp){
    		var valuesInValueHelp = createAvailableValuesHashMap(responseValueHelp);
    		
    		for(var i = responseFilterResolution.length - 1; i >= 0; i--) {
    			if(!valuesInValueHelp[responseFilterResolution[i][this.getAliasNameIfExistsElsePropertyName()]]) {
    				responseValueHelp.unshift(responseFilterResolution[i]);
    			}
    		}
    	}
    	function prependListValuesIfNotContainedInResponse(list, response) {
  			var valuesInresponse = createAvailableValuesHashMap(response);
			var element;
			
			for(var i = list.length - 1; i >= 0; i--) {
				if(!valuesInresponse[list[i]]) {
					element = {};
					element[this.getAliasNameIfExistsElsePropertyName()] = list[i];
					response.unshift(element);
				}
			}
    	}
    };
    
    this.getMetadata = function() {
    	if(config.valueHelpRequest){
    		return sendValueHelpRequest().then(function(response){
    			return response.metadata.getPropertyMetadata(this.getAliasNameIfExistsElsePropertyName());
    		}.bind(this));
    	}else if(config.filterResolutionRequest){
    		return sendFilterResolutionRequest().then(function(response){
    			return response.metadata.getPropertyMetadata(this.getAliasNameIfExistsElsePropertyName());
    		}.bind(this));
    	}
    	return jQuery.Deferred().resolve({});
    };
    this.setSelectedValues = function(values) {
    	if(!initiallySelectedValues){
    		initiallySelectedValues = true;
    		this.getSelectedValues().done(function(selectedValues){
    			initiallySelectedValues = selectedValues;
    		});
    	}
    	if(values.type === 'internalFilter'){
    		externallySetSelectedValues = values;
    	}else{
    		externallySetSelectedValues = jQuery.extend(true, [], values);  
    	}
    };
    this.getSelectedValues = function() {
    	var deferred = jQuery.Deferred();
    	var selectedValues;
    	var preselectionValues;
    	var availableValues;

    	if(externallySetSelectedValues) {
    		if(!config.invisible) {
    			this.getValues().done(function(values){
    				if(values !== null){
    					selectedValues = [];
    					availableValues = createAvailableValuesHashMap(values);
    					externallySetSelectedValues.forEach(function(value){
    						if(availableValues[value]){
    							selectedValues.push(value);
    						}
    					});
    					externallySetSelectedValues = selectedValues;
    				}else{
    					selectedValues = null;
    				}
    				resolvePromise();
    			});
    		} else {
    			selectedValues = externallySetSelectedValues;
    			resolvePromise();
    		}
    	}else if(jQuery.isFunction(config.preselectionFunction) && !config.valueHelpRequest){
    		selectedValues = config.preselectionFunction();
    		resolvePromise();
    	}else if(context && context.type === 'internalFilter' && !config.filterResolutionRequest) {
    		deferred.resolve(context);
    	}else if(config.filterResolutionRequest && !context && !config.valueHelpRequest && !(config.preselectionDefaults && config.preselectionDefaults.length > 0)){
    		deferred.resolve(null);
    	}else if(context && context.type === 'internalFilter' && config.filterResolutionRequest){
    		sendFilterResolutionRequest().then(function(response){
    			var filterResolutionList = convertRequestResponseToArrayList(response);
    			
    			if(this.isMultiSelection()){
    				selectedValues = filterResolutionList;
    			}else{
    				selectedValues = [filterResolutionList[0]];
    			}
    			
    			resolvePromise();
    		}.bind(this));
    	}else if(config.valueHelpRequest && !jQuery.isArray(context)){
    		sendValueHelpRequest().then(function(response){
    			var valueHelpList = [];
    			var responseList = convertRequestResponseToArrayList(response);
    			
    			if(config.preselectionDefaults && config.preselectionDefaults.length > 0){
    				preselectionValues = config.preselectionDefaults;
    			}else{
    				preselectionValues = config.preselectionFunction && config.preselectionFunction();
    			}
    			
    			if(preselectionValues) {
    				preselectionValues.forEach(function(value) {
    					if(jQuery.inArray(value, responseList) > -1) {
    						valueHelpList.push(value);
    					}
    				});
    			} else {
    				valueHelpList = responseList;
    			}
    			
    			if(this.isMultiSelection()){
    				selectedValues = valueHelpList;
    			}else{
    				selectedValues = [valueHelpList[0]];
    			}
    			
    			resolvePromise();
    		}.bind(this));
    	}else if(jQuery.isArray(context)) {
    		if(this.isMultiSelection()){
    			selectedValues = context;
    		}else{
    			selectedValues = context[0] ? [context[0]] : [];
    		}
    		
    		resolvePromise();
    	}else if(config.preselectionDefaults && config.preselectionDefaults.length > 0){
		    selectedValues = config.preselectionDefaults;
		    if(!this.isMultiSelection()) {
		        selectedValues = [selectedValues[0]];
    		}
    		resolvePromise();
    	}else{
    		deferred.resolve(null);
    	}
    	return deferred.promise();
    	
    	function resolvePromise(){
    		if(selectedValues && selectedValues.type === 'internalFilter'){
    			deferred.resolve(selectedValues);
        	}else{
        		deferred.resolve(jQuery.extend(true, [], selectedValues));
        	}
    	}
    };
    
    this.serialize = function(){
    	var deferredSerialization = jQuery.Deferred();
    	var serializedStartFilter = {
    			propertyName : this.getPropertyName()
    	};
    	this.getSelectedValues().done(function(values){
    		if(values.type === 'internalFilter'){
    			values = values.mapToSapUI5FilterExpression();
    		}
    		serializedStartFilter.selectedValues = values;
    		deferredSerialization.resolve(serializedStartFilter);
    	});
    	return deferredSerialization;
    };
    
    this.deserialize = function(serializedStartFilter){
    	if(serializedStartFilter.selectedValues.filters || serializedStartFilter.selectedValues.path){
    		serializedStartFilter.selectedValues = sap.apf.core.utils.Filter.transformUI5FilterToInternal(inject.instance.messageHandler, serializedStartFilter.selectedValues);
    	}
    	externallySetSelectedValues = undefined;
    	initiallySelectedValues = undefined;
    	context = serializedStartFilter.selectedValues;
    };
    
    this.reset = function(){
    	if(initiallySelectedValues){
    		externallySetSelectedValues = initiallySelectedValues;
    	}
    };
    
    function sendFilterResolutionRequest(){
    	var request;
    	var mergedFilter;
    	var contextFilter;
    	
    	if(jQuery.isArray(context)){
    		contextFilter = new sap.apf.core.utils.Filter(inject.instance.messageHandler);
    		context.forEach(function(value){
    			contextFilter.addOr(this.getAliasNameIfExistsElsePropertyName(), 'eq', value);
			}.bind(this));
    	}else{
    		contextFilter = context;
    	}
    	
    	if(deferredFilterResolutionRequest){
    		return deferredFilterResolutionRequest;
    	}
    	deferredFilterResolutionRequest = jQuery.Deferred();
    	
    	if(restriction){
    	    mergedFilter = new sap.apf.core.utils.Filter(inject.instance.messageHandler);
    	    mergedFilter.addAnd(restriction).addAnd(contextFilter);
    	}else{
    	    mergedFilter = contextFilter;
    	}
    	
    	request = inject.functions.createRequest(config.filterResolutionRequest);
    	request.sendGetInBatch(mergedFilter, callback, undefined);
    	return deferredFilterResolutionRequest.promise();
    	
    	function callback(response) {
    		deferredFilterResolutionRequest.resolve(response);
    	}	
    }
    function sendValueHelpRequest(){
    	var request;
    	if(deferredValueHelpRequest){
    		return deferredValueHelpRequest; 
    	}
    	deferredValueHelpRequest = jQuery.Deferred();
    	
    	request = inject.functions.createRequest(config.valueHelpRequest);
    	request.sendGetInBatch(restriction, callback, undefined);
    	return deferredValueHelpRequest.promise();
    	
    	function callback(response) {
    		deferredValueHelpRequest.resolve(response);
    	}
    }
    function convertRequestResponseToArrayList(response){
    	var values = [];
		response.data.forEach(function(val) {
			values.push(val[this.getAliasNameIfExistsElsePropertyName()]);
		}.bind(this));
		return values;
    }
    function createAvailableValuesHashMap(arrayOfResponseObjects){
    	var valuesHashMap = {};
    	arrayOfResponseObjects.forEach(function(responseObject){
    		valuesHashMap[responseObject[this.getAliasNameIfExistsElsePropertyName()]] = true;
		}.bind(this));
    	return valuesHashMap;
    }
};
