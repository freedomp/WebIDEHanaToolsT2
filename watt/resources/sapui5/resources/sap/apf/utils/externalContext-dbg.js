/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2015 SAP AG. All rights reserved
 */

jQuery.sap.declare('sap.apf.utils.externalContext');
jQuery.sap.require('sap.apf.core.utils.filter');

/**
 * @private
 * @class External Context
 * @description -
 * @param -
 * @name ExternalContext
 * @returns {sap.apf.utils.ExternalContext}
 */
sap.apf.utils.ExternalContext = function(inject) {
    'use strict';
    
    var deferredContext = jQuery.Deferred();
    var smartBusinessEvaluationId = inject.instance.startParameter.getEvaluationId();
    var xAppStateId = inject.instance.startParameter.getXappStateId();
    var msgH = inject.instance.messageHandler;
    var requestUrl;            
    var configurationProperties;
    var smartBusinessConfig;
    
    this.getCombinedContext = function(){
    	if(smartBusinessEvaluationId) {
        	configurationProperties = inject.functions.getConfigurationProperties();
        	smartBusinessConfig = configurationProperties && configurationProperties.smartBusiness && configurationProperties.smartBusiness.runtime;
        	if(smartBusinessConfig && smartBusinessConfig.service) {
        		requestUrl = smartBusinessConfig.service + "/EVALUATIONS('" + smartBusinessEvaluationId + "')/FILTERS?$format=json";
        		jQuery.ajax({ 
        			url : requestUrl,
        			success : function(data) {
        				var property;
        				var msgH = inject.instance.messageHandler;
        				var orFilter;
        				var andFilter = new sap.apf.core.utils.Filter(msgH);
        				var filtersForConjuction = [];
        				var termsPerProperty = {};
        				data.d.results.forEach(collectTermsPerProperty);
        				for(property in termsPerProperty) {
        					if(termsPerProperty.hasOwnProperty(property)) {
        						orFilter = new sap.apf.core.utils.Filter(msgH);
        						termsPerProperty[property].forEach(combineTermsPerProperty);
        						filtersForConjuction.push(orFilter);
        					}
        				}
        				filtersForConjuction.forEach(combineDifferentProperties);
        				deferredContext.resolve(andFilter);
    				
    					function collectTermsPerProperty(sbFilter){
    						if(!termsPerProperty[sbFilter.NAME]) {
    							termsPerProperty[sbFilter.NAME] = [];
    						} 
    						termsPerProperty[sbFilter.NAME].push(new sap.apf.core.utils.Filter(msgH, sbFilter.NAME, sbFilter.OPERATOR, sbFilter.VALUE_1, sbFilter.VALUE_2));
    					}
    					
    					function combineTermsPerProperty(filter) {
    						orFilter.addOr(filter);
    					}
    					
    					function combineDifferentProperties(filter) {
    						andFilter.addAnd(filter);
    					}
    				},
    				error : function(jqXHR, textStatus, errorThrown) {}
    			});
        	}
        } else if(xAppStateId) { //For the moment, only handling of either SmartBusiness or X-APP-STATE is required and therefore supported
        	sap.ushell.Container.getService("CrossApplicationNavigation").getAppState(inject.instance.component, xAppStateId).done(function(appContainer) {
    			var containerData = appContainer.getData();
    			if (containerData && containerData.sapApfCumulativeFilter) {
    				deferredContext.resolve(sap.apf.core.utils.Filter.transformUI5FilterToInternal(msgH, containerData.sapApfCumulativeFilter));
    			}else{
    				deferredContext.resolve(new sap.apf.core.utils.Filter(msgH));
    			}
    		});
        } else {
            deferredContext.resolve(new sap.apf.core.utils.Filter(msgH));
        }
    	return deferredContext.promise();
    };
};