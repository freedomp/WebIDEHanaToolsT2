/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/**
 * @class messageHandler
 * @memberOf sap.apf.ui.reuse.view
 * @name messageHandler
 */
sap.ui.jsview("sap.apf.ui.reuse.view.messageHandler", {
	/**
	 * @this {sap.apf.ui.reuse.view.messageHandler}
	 * @description messageHandler view
	 */
	/**
	 * @memberOf sap.apf.ui.reuse.view.messageHandler
	 * @method initializeHandler
	 * @param oMessageObject
	 * @description UI handle for error messages to be shown on notification bar
	 */
	initializeHandler : function(oMessageObject) {
		this.getController().showMessage(oMessageObject);
	},
	getControllerName : function() {
		return "sap.apf.ui.reuse.controller.messageHandler";
	},
	createContent : function(oController) {
		jQuery.sap.require("sap.m.MessageToast");
		jQuery.sap.require("sap.ca.ui.message.message");
		
	}
});