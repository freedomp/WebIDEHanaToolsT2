/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2015 SAP SE. All rights reserved
 */
(function(){'use strict';jQuery.sap.declare("sap.apf.base.Component");jQuery.sap.require("sap.ui.core.UIComponent");jQuery.sap.require("sap.apf.api");sap.ui.core.UIComponent.extend("sap.apf.base.Component",{metadata:{"manifest":"json","publicMethods":["getApi"]},oApi:null,init:function(){if(!this.oApi){var b=sap.apf.base.Component.prototype.getMetadata().getManifest();var m=jQuery.extend({},true,this.getMetadata().getManifest());this.oApi=new sap.apf.Api(this,undefined,{manifest:m,baseManifest:b});}else{return;}sap.ui.core.UIComponent.prototype.init.apply(this,arguments);},createContent:function(){sap.ui.core.UIComponent.prototype.createContent.apply(this,arguments);return this.oApi.startApf();},exit:function(){this.oApi.destroy();},getApi:function(){return this.oApi;}});}());
