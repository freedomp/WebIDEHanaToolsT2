/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.jsview("sap.apf.ui.reuse.view.deleteAnalysisPath",{getControllerName:function(){return"sap.apf.ui.reuse.controller.deleteAnalysisPath";},createContent:function(c){this.oController=c;this.viewData=this.getViewData();var s=this;this.oCoreApi=this.getViewData().oInject.oCoreApi;this.oUiApi=this.getViewData().oInject.uiApi;this.width=jQuery(window).height()*0.55+"px";this.height=jQuery(window).height()*0.55+"px";var l=new sap.m.List({width:s.width,height:s.height,mode:sap.m.ListMode.Delete,items:{path:"/GalleryElements",template:new sap.m.StandardListItem({title:"{AnalysisPathName}",description:"{description}",tooltip:"{AnalysisPathName}"})},"delete":function(e){var i=e.getParameter("listItem");var P=i.getProperty('title');var g=s.oController.getGuidForPath(P,s.viewData.jsonData.GalleryElements);var L={};L.item=i;L.list=l;L.guid=g;L.sPathName=P;s.oUiApi.getAnalysisPath().getToolbar().getController().getConfirmDelDialog(L);}});var p=new sap.ui.model.json.JSONModel();p.setData(this.viewData.jsonData);l.setModel(p);return l;}});
