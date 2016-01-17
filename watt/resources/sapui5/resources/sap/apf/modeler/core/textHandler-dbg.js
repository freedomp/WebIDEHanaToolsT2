/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
/*global sap, jQuery*/

jQuery.sap.declare("sap.apf.modeler.core.textHandler");

(function () {
    'use strict';

    /**
     * @private
     * @class Provides access to message texts and ui texts for the modeler
     */
    sap.apf.modeler.core.TextHandler = function () {
    	
    	var oBundleApf, oBundleModelerSpecificTexts;
    	/**
    	 * @description returns a message text for message handling
    	 * @param {string} sRessourceKey - Key of the message in the Ressourcefile
    	 * @param {string[]} [aParameters] - Parameter for placeholder replacement in the message bundle
    	 * @returns {string}
    	 */
    	this.getMessageText = function(sRessourceKey, aParameters) {
    		return this.getText(sRessourceKey, aParameters);
    	};
    	
    	/**
    	 * @description returns text
    	 * @param {string} sRessourceKey - Key of the message in the Ressourcefile
    	 * @param {string[]} [aParameters] - Parameter for placeholder replacement in the message bundle
    	 * @returns {string}
    	 */
    	this.getText = function(sRessourceKey, aParameters) {
    		var sText;
    		
    		sText = oBundleModelerSpecificTexts.getText(sRessourceKey, aParameters);
    		if (sText !== sRessourceKey) {
				return sText;
			}
    		return oBundleApf.getText(sRessourceKey, aParameters);
    	};
    	
    	function initBundles() {
    		var sUrl;
    		var sIncludeInfo = sap.ui.getCore().getConfiguration().getOriginInfo();
    		var sModulePath = jQuery.sap.getModulePath("sap.apf");
    		
    		sUrl = sModulePath + '/modeler/resources/i18n/texts.properties';
    		oBundleModelerSpecificTexts = jQuery.sap.resources({
					url : sUrl,
					includeInfo : sIncludeInfo
				});
    		sUrl = sModulePath + '/resources/i18n/apfUi.properties';
    		oBundleApf = jQuery.sap.resources({
					url : sUrl,
					includeInfo : sIncludeInfo
			});
    		 
    	}
    	
    	 initBundles();
    };
}());