/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.jsview("sap.apf.ui.reuse.view.stepContainer",{getStepToolbar:function(){return this.oStepToolbar;},getControllerName:function(){return"sap.apf.ui.reuse.controller.stepContainer";},createContent:function(c){var v=this.getViewData();this.oStepToolbar=sap.ui.view({viewName:"sap.apf.ui.reuse.view.stepToolbar",type:sap.ui.core.mvc.ViewType.JS,viewData:v});this.stepLayout=new sap.ui.layout.VerticalLayout({content:[this.oStepToolbar],width:"100%"});this.vLayout=new sap.ui.layout.VerticalLayout({content:this.stepLayout,width:"100%"});this.vLayout.setBusy(true);return this.vLayout;}});
