/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/*global window*/
/**
 **@class messageHandler
 **@name messageHandler 
 **@memberOf sap.apf.ui.reuse.controller
 **@description controller for view.messageHandler
 * 
 */
/**/
sap.ui.controller("sap.apf.ui.reuse.controller.messageHandler", {
	/**
	 **@this {sap.apf.ui.reuse.controller.messageHandler}
	 */
	onInit : function() {
		this.oCoreApi = this.getView().getViewData().oCoreApi;
		this.oUiApi = this.getView().getViewData().uiApi;
	},
	/**
	 **@memberOf sap.apf.ui.reuse.controller.messageHandler
	 **@method showMessage
	 **@param {string} sText Message text
	 **@param {string} severity Message severity
	 **@description  error messages to be shown on notification bar
	 */
	showMessage : function(oMessageObject) {
		var sText = oMessageObject.getMessage();
		var sCode = oMessageObject.getCode();
		var severity = oMessageObject.getSeverity();
		var dateTime = oMessageObject.getTimestampAsdateObject();
		var oMessage = new sap.ui.core.Message({
			text : sText,
			timestamp : dateTime
		});
		var fatal = sap.apf.core.constants.message.severity.fatal;
		var warning = sap.apf.core.constants.message.severity.warning;
		var technError = sap.apf.core.constants.message.severity.technError;
		var error = sap.apf.core.constants.message.severity.error;
		var self = this;
		switch (severity) {
			case fatal:
				oMessage.setLevel(sap.ui.core.MessageType.Error);
				this.oUiApi.getLayoutView().setBusy(false);
				self.showDialog(sText, sCode);
				break;
			case warning:
				oMessage.setLevel(sap.ui.core.MessageType.Warning);
				break;
			case error:
				this.oUiApi.getLayoutView().setBusy(false);
				oMessage.setLevel(sap.ui.core.MessageType.Error);
				break;
			case technError:
				/**Technical Error being logged already from core messageHandler.js */
//				var techText = this.oCoreApi.getTextNotHtmlEncoded("technical-error");
//				var oURLParameters = jQuery.sap.getUriParameters().mParams;
//				var debugMode = oURLParameters["sap-ui-debug"] || [ jQuery.sap.debug().toString() ];
//				if (debugMode !== undefined && debugMode[0] === "true") {
//					jQuery.sap.log.error(techText + sText);
//					jQuery.sap.log.error(oMessageObject.getStack());
//				}
				break;
			default:
				jQuery.sap.log.error("Error type not defined");
				break;
		}
		if (severity === fatal || severity === warning || severity === error) {
			jQuery.sap.require("sap.m.MessageToast");
			sap.m.MessageToast.show(oMessage.getText(), {
				duration : 3000,
				width : "40%",
				my : "center bottom",
				at : "center bottom",
				of : window,
				offset : "0 -50",
				collision : "fit fit",
				onClose : null,
				autoClose : true,
				animationTimingFunction : "ease",
				animationDuration : 2000
			});
		}
	},
	/**
	 **@memberOf sap.apf.ui.reuse.controller.messageHandler
	 **@method showDialog
	 **@param {string} sText Message text
	 **@description  shows dialog for fatal errors
	 */
	showDialog : function(sText) {
		var self = this;
		var buttonText = this.oCoreApi.getTextNotHtmlEncoded("application-logout");
		var dialogTitle = this.oCoreApi.getTextNotHtmlEncoded("fatal-error");
		var aLogMessages = this.oCoreApi.getLogMessages();
		var sessionTimeOut = false;
		var i;
		for(i = 0; i < aLogMessages.length; i++) {
			if (aLogMessages[i].search(5021) !== -1) {
				sessionTimeOut = true;
				break;
			}
		}
		if (sessionTimeOut === true) {
			sText = this.oCoreApi.getTextNotHtmlEncoded("application-reload");
			buttonText = this.oCoreApi.getTextNotHtmlEncoded("reload-button");
			dialogTitle = this.oCoreApi.getTextNotHtmlEncoded("sessionTimeout");
		}
		var sDetailedText;
		for( i = 0; i < aLogMessages.length; i++) {
			if (sDetailedText){
				sDetailedText = sDetailedText + "\n" + aLogMessages[i];
			} else {
				sDetailedText = aLogMessages[i];
			}
		}
		//this uses the ushell function
		var bIsMsgBoxClosed = false;
		self.fnClose = function() {
			bIsMsgBoxClosed = true;
			if(window.location.hash){
				window.location.hash = "";
			}
			
		};
		sap.ca.ui.message.showMessageBox({
			type : sap.ca.ui.message.Type.ERROR,
			message : sText,
			details : sDetailedText
			}, self.fnClose);
	}
});