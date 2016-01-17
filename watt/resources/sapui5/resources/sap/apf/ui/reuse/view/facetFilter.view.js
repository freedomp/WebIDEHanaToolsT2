/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
(function(){'use strict';sap.ui.jsview("sap.apf.ui.reuse.view.facetFilter",{getControllerName:function(){return"sap.apf.ui.reuse.controller.facetFilter";},createContent:function(c){var f;var C=this.getViewData().oCoreApi;var a=this.getViewData().aConfiguredFilters;var F=[];a.forEach(function(b){f=new sap.m.FacetFilterList({title:C.getTextNotHtmlEncoded(b.getLabel()),multiSelect:b.isMultiSelection(),key:b.getPropertyName(),growing:b.isMultiSelection()?false:true,listClose:c.onListClose.bind(c)});F.push(f);});F.forEach(function(b){b.bindItems("/",new sap.m.FacetFilterItem({key:'{key}',text:'{text}',selected:'{selected}'}));var m=new sap.ui.model.json.JSONModel([]);b.setModel(m);});var o=new sap.m.FacetFilter(c.createId("idAPFFacetFilter"),{type:"Simple",showReset:true,showPopoverOKButton:true,lists:F,reset:c.onResetPress.bind(c)});return o;}});}());
