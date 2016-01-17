/*!
* SAP APF Analysis Path Framework
*
* (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
sap.ui.controller("sap.apf.modeler.ui.controller.titleBreadCrumb",{onInit:function(){this.oViewData=this.getView().getViewData();this.getText=this.oViewData.getText;this._addConfigStyleClass();},_addConfigStyleClass:function(){this.byId("IdBreadCrumb").addStyleClass("breadCrumb");this.byId("IdFormTitle").addStyleClass("formTitle");},setTitleAndBreadCrumb:function(f){this.byId("IdFormTitle").setText(f);}});
