/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2015 SAP SE. All rights reserved
 */
/*global jQuery, sap */

(function () {
    'use strict';

    jQuery.sap.declare("sap.apf.base.Component");
    jQuery.sap.require("sap.ui.core.UIComponent");
    jQuery.sap.require("sap.apf.api");
    /**
     * @public
     * @class Base Component for all APF based applications.
     * @name sap.apf.base.Component
     * @extends sap.ui.core.UIComponent
     * @since SAP UI5 1.30.0.
     */
    sap.ui.core.UIComponent.extend("sap.apf.base.Component", {
      
        metadata: {
        	"manifest": "json",
            "publicMethods": ["getApi"]
        },

        oApi: null,
        init: function () {
        
            if (!this.oApi) {
            	
            	var baseManifest = sap.apf.base.Component.prototype.getMetadata().getManifest();
            	
            	var manifest = jQuery.extend({}, true, this.getMetadata().getManifest());     		
                this.oApi = new sap.apf.Api(this, undefined, { manifest : manifest, baseManifest : baseManifest } );
            } else {
            	return;
            }
            sap.ui.core.UIComponent.prototype.init.apply(this, arguments); 
            
        },
        /**
         * @public
         * @description Creates the content of the component. A component that extends this component shall call this method.
         * @function
         * @name sap.apf.base.Component.prototype.createContent
         * @returns {sap.ui.core.Control} the content
         */
        createContent: function () {
        	
            sap.ui.core.UIComponent.prototype.createContent.apply(this, arguments);
            return this.oApi.startApf();
        },
        /**
         * @public
         * @description Cleanup the Component instance. The component that extends this component should call this method.
         * @function
         * @name sap.apf.base.Component.prototype.exit
         */
        exit: function () {
            this.oApi.destroy();
        },
        /**
         * @public
         * @function
         * @name sap.apf.base.Component#getApi
         * @description Returns the instance of the APF API.
         * @returns {sap.apf.Api}
         */
        getApi: function () {
            return this.oApi;
        }
    });

}());
