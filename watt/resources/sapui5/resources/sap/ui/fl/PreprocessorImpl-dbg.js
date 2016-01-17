/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2014-2015 SAP SE. All rights reserved
 */
/*global Promise */

// Provides object sap.ui.fl.ProcessorImpl
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/Component', 'sap/ui/fl/FlexControllerFactory', 'sap/ui/fl/Utils'
], function(jQuery, Component, FlexControllerFactory, Utils) {
	'use strict';

	/**
	 * The implementation of the <code>Preprocessor</code> for the SAPUI5 flexibility services that can be hooked in the <code>View</code> life cycle.
	 * 
	 * @name sap.ui.fl.PreprocessorImpl
	 * @class
	 * @constructor
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.27.0
	 */
	var FlexPreprocessorImpl = function(){
	};

	/**
	 * Asynchronous view processing method.
	 * 
	 * @param {sap.ui.core.mvc.View} oView view to process
	 * @returns {jquery.sap.promise} result of the processing, promise if executed asynchronously
	 * 
	 * @public
	 */
	 FlexPreprocessorImpl.process = function(oView){
		 return Promise.resolve().then(function(){
			 var sComponentName = Utils.getComponentClassName(oView);
			 if ( !sComponentName || sComponentName.length === 0 ){
				 var sError = "no component name found for " + oView.getId();
				 jQuery.sap.log.info(sError);
				 throw new Error(sError);
			 }else {
			     var oFlexController = FlexControllerFactory.create(sComponentName);
			     return oFlexController.processView(oView);
			 }
		 }).then(function() {
			 jQuery.sap.log.debug("flex processing view " + oView.getId() + " finished");
			 return oView;
		 })["catch"](function(error) {
			 var sError = "view " + oView.getId() + ": " + error;
			 jQuery.sap.log.info(sError); //to allow control usage in applications that do not work with UI flex and components
			 // throw new Error(sError); // throw again, wenn caller handles the promise
			 return oView;
		 });
	 };
	 
	 return FlexPreprocessorImpl;

}, /* bExport= */true);