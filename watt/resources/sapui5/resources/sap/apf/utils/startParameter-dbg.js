/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */

(function () {
	'use strict';

	jQuery.sap.declare('sap.apf.utils.startParameter');
	
	/**
	 * @private 
	 * @class Provides convenience functions to receive parameter set through component`s startup parameter or basic URL parameter.
	 * 		  When both parameter are set then the component`s startup parameter wins.
	 * @param {object} component 
	 */
	sap.apf.utils.StartParameter = function(component){
		var analyticalConfigurationId = null;
		var stepId = null;
		var representationId = null;
		var appConfigPath;
		var evaluationId;
		var startParameters;
		var lrepActive = false;
		var sapClient;
		var filterReduction = false;
		
		if(component && component.getComponentData && component.getComponentData() && component.getComponentData().startupParameters) {
			startParameters = component.getComponentData().startupParameters;
			if(startParameters['sap-apf-configuration-id']) {
				analyticalConfigurationId = startParameters['sap-apf-configuration-id'][0];
			}
			if(startParameters['sap-apf-step-id']) {
				stepId = startParameters['sap-apf-step-id'][0];
			}
			if(startParameters['sap-apf-representation-id']) {
				representationId = startParameters['sap-apf-representation-id'][0];
			}
			if(startParameters['sap-apf-app-config-path']) {
				appConfigPath = startParameters['sap-apf-app-config-path'][0];
			}
			if(startParameters['evaluationId']) {
				evaluationId = startParameters['evaluationId'][0];
			}
			if(startParameters['sap-apf-activate-lrep']) {
				lrepActive = startParameters['sap-apf-activate-lrep'][0];
			}
			if(startParameters['sap-client']) {
				sapClient = startParameters['sap-client'][0];
			}
			if(startParameters['sap-apf-filter-reduction']) {
				filterReduction = startParameters['sap-apf-filter-reduction'][0];
			}
			
		}
		
		/**
		 * @private
		 * @function
		 * @name sap.apf.utils.StartParameter#getSteps
		 * @description Returns analytical configuration ID. In case of lrep, it also returns applicationId
		 * @returns {undefined|object} with format { configurationId : "xxx", applicationId : "yyy" }
		 */
		this.getAnalyticalConfigurationId = function() {
			var parameters, config;
			
			if (!analyticalConfigurationId) {
				analyticalConfigurationId = jQuery.sap.getUriParameters().get('sap-apf-configuration-id');
			}
			if (analyticalConfigurationId) {
				config = {};
				parameters = analyticalConfigurationId.split(".");
				
				if (parameters.length === 2) {
				    config.applicationId = parameters[0]
					config.configurationId = parameters[1];
				} else {
					config.configurationId = analyticalConfigurationId;
				} 
			}
			
			return config;
		};

        /**
         * @private
         * @function
         * @name sap.apf.utils.StartParameter#getAnalyticalConfigurationId
         * @description Returns step IDs and representation IDs.
         * @returns {Array} steps Step contains step ID and optional representation ID
         */
		this.getSteps = function() {
			if(!stepId) {
				stepId = jQuery.sap.getUriParameters().get('sap-apf-step-id');
			}
			if(!representationId) {
				representationId = jQuery.sap.getUriParameters().get('sap-apf-representation-id');
			}
			if(!stepId) {
				return null;
			} else {
				return [{
					stepId : stepId,
					representationId : representationId
				}];
			}
		};
		
		/**
         * @private
         * @function
         * @name sap.apf.utils.StartParameter#getXappStateId
         * @description Returns sap-xapp-state ID from URL hash
         * @returns {string} sap-xapp-state ID
         */
		this.getXappStateId = function() {
				var xappStateKeyMatcher = /(?:sap-xapp-state=)([^&=]+)/;
				var xappMatch = xappStateKeyMatcher.exec(window.location.hash);
				
				if(xappMatch){
					return xappMatch[1];
				}else{
					return null;
				}
		};
		
		this.getApplicationConfigurationPath = function() {
			return appConfigPath;
		};
		
		this.getEvaluationId = function() {
			return evaluationId;
		};
		
		this.isLrepActive = function() {
			return lrepActive;
		};
		
		this.getSapClient = function() {
			return sapClient;
		};
		
		this.isFilterReductionActive = function() {
			return filterReduction;
		}
	};
}());