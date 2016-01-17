/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.jsview("sap.apf.ui.reuse.view.messageHandler",{initializeHandler:function(m){this.getController().showMessage(m);},getControllerName:function(){return"sap.apf.ui.reuse.controller.messageHandler";},createContent:function(c){jQuery.sap.require("sap.m.MessageToast");jQuery.sap.require("sap.ca.ui.message.message");}});
