/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.apf.ui.instance");jQuery.sap.require('sap.apf.ui.utils.print');jQuery.sap.require('sap.apf.ui.utils.constants');jQuery.sap.require('sap.apf.ui.representations.lineChart');jQuery.sap.require('sap.apf.ui.representations.columnChart');jQuery.sap.require('sap.apf.ui.representations.scatterPlotChart');jQuery.sap.require('sap.apf.ui.representations.stackedColumnChart');jQuery.sap.require('sap.apf.ui.representations.table');jQuery.sap.require('sap.apf.ui.representations.pieChart');jQuery.sap.require('sap.apf.ui.representations.percentageStackedColumnChart');jQuery.sap.require('sap.apf.ui.representations.bubbleChart');jQuery.sap.require('sap.apf.ui.representations.barChart');jQuery.sap.require('sap.apf.ui.representations.stackedBarChart');jQuery.sap.require('sap.apf.ui.representations.percentageStackedBarChart');
sap.apf.ui.Instance=function(i){'use strict';i.uiApi=this;var c=i.oCoreApi;var s=i.oStartFilterHandler;var a;var b;var m;var f;var d=c.getUriGenerator().getApfLocation();this.oEventCallbacks={};jQuery.sap.includeStyleSheet(d+"resources/css/apfUi.css","apfCss");jQuery.sap.includeStyleSheet(d+"resources/css/apfPrint.css","printCss");jQuery("#printCss").attr("media","print");this.getAnalysisPath=function(){if(b===undefined){b=sap.ui.view({viewName:"sap.apf.ui.reuse.view.analysisPath",type:sap.ui.core.mvc.ViewType.JS,viewData:i});}return b;};this.getNotificationBar=function(){if(m===undefined){m=sap.ui.view({viewName:"sap.apf.ui.reuse.view.messageHandler",type:sap.ui.core.mvc.ViewType.JS,viewData:i});}return m;};this.getStepContainer=function(){if(a===undefined){a=sap.ui.view({viewName:"sap.apf.ui.reuse.view.stepContainer",type:sap.ui.core.mvc.ViewType.JS,viewData:i});}return a;};this.selectionChanged=function(r){if(r){this.getAnalysisPath().getController().refresh(0);}else{var n=c.getSteps().indexOf(c.getActiveStep());this.getAnalysisPath().getController().refresh(n+1);}c.updatePath(this.getAnalysisPath().getController().callBackForUpdatePath.bind(this.getAnalysisPath().getController()));};var e;var g=new sap.m.App().addStyleClass("sapApf");var I=false;this.createApplicationLayout=function(){if(!I){g.addPage(this.getLayoutView());I=true;}return g;};this.getLayoutView=function(){if(e===undefined){e=sap.ui.view({viewName:"sap.apf.ui.reuse.view.layout",type:sap.ui.core.mvc.ViewType.XML,viewData:i});}return e;};this.addDetailFooterContent=function(C){this.getLayoutView().getController().addDetailFooterContentLeft(C);};this.addMasterFooterContentRight=function(C){this.getLayoutView().getController().addMasterFooterContentRight(C);};this.setEventCallback=function(E,C){this.oEventCallbacks[E]=C;};this.getEventCallback=function(E){return this.oEventCallbacks[E];};this.drawFacetFilter=function(C){if(C&&C.length){f=sap.ui.view({viewName:"sap.apf.ui.reuse.view.facetFilter",type:sap.ui.core.mvc.ViewType.JS,viewData:{oCoreApi:c,oUiApi:this,aConfiguredFilters:C,oStartFilterHandler:s}});var h=this.getLayoutView().byId("subHeader");h.addItem(f.byId("idAPFFacetFilter"));}};this.contextChanged=function(r){if(f){f.getController().populateAndSelectFFListValues();}var C=this.getEventCallback(sap.apf.core.constants.eventTypes.contextChanged);if(typeof C==="function"){var S;if(!r){S=i.oFilterIdHandler.serialize();}C(S);}};this.getFacetFilterForPrint=function(){if(f){return f.byId("idAPFFacetFilter");}};this.handleStartup=function(h){var t=this;var p=jQuery.Deferred();h.done(function(j){var k=s.getStartFilters();t.contextChanged();k.done(function(C){t.drawFacetFilter(C);if(j.navigationMode==="backward"){t.getAnalysisPath().getController().bIsBackNavigation=true;c.updatePath(t.getAnalysisPath().getController().callBackForUpdatePath.bind(t.getAnalysisPath().getController()));}if(j.navigationMode==="forward"){if(c.getStartParameterFacade().getSteps()){var l=c.getStartParameterFacade().getSteps()[0].stepId;var r=c.getStartParameterFacade().getSteps()[0].representationId;var n=t.getAnalysisPath().getController().callBackForUpdatePathAndSetLastStepAsActive.bind(t.getAnalysisPath().getController());c.createFirstStep(l,r,n);}}p.resolve();});});return p.promise();};this.destroy=function(){f=undefined;this.getAnalysisPath().getToolbar().getController().oPrintHelper=undefined;this.getAnalysisPath().getCarousel().dndBox=undefined;};};