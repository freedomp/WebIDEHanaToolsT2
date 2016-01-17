define(function() {
	"use strict";
	return {
		_supported : null,
		// _fromaddress : "WebIDE",
		// _toaddress :  "limor.erez@sap.com",
		// _subject:"New bug report in Web IDE",
		// _mailtext:"Hi,\nThe following error occured in Web IDE:\n",
		// _mailBody : "For more information please see attached trace and console log.\nGood Luck!\n\nWeb IDE.",
		MAX_SAVED_LOG_SIZE : 250000,
		
		initPlugin : function(){
			var that = this; 
			this.isSupported().then(function(bReportSupported){
				if (!bReportSupported) {return;}
				var oldLog = console.error;
				window.myLog = "";
				console.error = function (message) {
					if (window.myLog.length >that.MAX_SAVED_LOG_SIZE ){ //avoid memory perf issues
						window.myLog = "";
					}
		 			window.myLog = window.myLog + "\n" + message;
					oldLog.apply(console, arguments);
				};
				window.sap.watt.reportABug = that;
				
				var guid = function() {
				function s4() {
					return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
					}
					return function() {
						return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
					};
				};
				//init Report view
				that.initReportView();
				
				//HACK which overwrites the onError initialize in the core. This is done to be able to popup the report a bug view incase of unhandled error
				window.onerror = function (message, filename, lineno, colno, oError) {
					if (!oError) {
						oError = new Error(message ? message : "no details available",
							filename ? filename : "", lineno ? lineno : undefined);
					}
					if (!window.ui5WattQunit) {
	
						var sError;
						var oNetWorkState = sap.watt.network.getNetworkState();
	
						if (!oNetWorkState.isNetworkAvailable()) {
							// On network failure send notification to user, but DON'T USE A DIALOG or I18n here
							// (which potentially cannot be loaded)
							sError = "The host is not reachable.\nPlease check your network connection.";
							alert(sError);
	
						} else if (oNetWorkState.isSessionTimeOutInPreview()) {
							// A session timout in preview occured. The messagebox may not be available.
							sError = "The preview session timed out.\nPlease restart the preview.";
							alert(sError);
	
						} else if (!oNetWorkState.isResponseOk()) {
							// Network is reachable but some unexpected http response happened, so a messagebox can
							// possibly not be rendered
							sError = "Unexpected server response.\nPlease try again later.";
							console.error("Unexpected server response: ", oNetWorkState.getLastError());
	
							// Raise popups only if the failure page is not currently displayed.
							if ($("#failure").css("display") === "none") {
								alert(sError);
							}														
	
						} else {
							// An unexpected client side problem inside the WEB IDE code happened. Most propbably
							// the message box is available to render a smart error message:
							var sUUID = guid()();
							jQuery.sap.require("sap.watt.saptoolsets.innovation.reportABug.utils.SupportMessageBox"); //I have some bug in the button names
							var messageBox = sap.watt.saptoolsets.innovation.reportABug.utils.SupportMessageBox;
							// if session is gone send notification to user
							if (oError.message === "SESSION_GONE") {
								sError = "Connection has been broken or session has expired. Copy the content of your unsaved files to an external file and then refresh to reconnect.";
								messageBox.show(sError, "WARNING", "Warning", [], null, null,
									"MSG_UNHANDLEDERROR" + sUUID);
							} else {
							// if the networkand session is available perform the unhandled error handling
								console.error("Unhandled Error", oError);
								console.error(oError.stack);
								sError = "Unhandled Error: " + oError.message;
								var vActions =  ["Report","Ok"];
								var fnCallback =  window.sap.watt.reportABug.report;
								var oDefaultAction = "Report";
								// Raise popups only if the failure page is not currently displayed.
								if ($("#failure").css("display") === "none") {
									messageBox.show(sError, "ERROR", "Error",vActions,  fnCallback,oDefaultAction, "MSG_UNHANDLEDERROR"
										+ sUUID,oError);
								}
							}
						}
					}
				};
			});
		},
		isSupported : function(){
			var that = this;
			if (!sap.watt.getEnv("internal")) {return Q(false);}
			if(this._supported === null){
				window.console.log("check if report A bug mailservice supported");
				return Q.sap.ajax({
							type:"GET",
							url:"/destinations/reportmailservice"
						}).then(function(oResponse) {
							if (oResponse[0]) {
								that._supported = true;
								return that._supported;
							}
						}).fail(function(oErr) {
								that._supported = false;
								window.console.error("Web IDE mailservice is not supported", oErr.statusText);
								return that._supported;
						});
			} else {
				return Q(this._supported);
			}
			
		},
		initReportView : function (){
			var that = this; 
			sap.ui.view("reportABugView",{
				viewName: "sap.watt.saptoolsets.innovation.plugin.reportABug.view.ReportABug",
				type: sap.ui.core.mvc.ViewType.JS,
				viewData: {
					service: that.context.service,
					context: that.context
				}
			});
		
		},
		// onStarted : function(){
		// 	//HACK for avoid default icon tootip - could not find a way to do it with ui5 icons
		// 	var btn = document.getElementById("report");
		
		// 	if(btn){
  //          	var spanBtn = btn.childNodes[0];
  //          	if (spanBtn){
  //          		spanBtn.setAttribute("title","");
  //          	}
		// 	}
			
		// },
		report : function (oResult,oError){
			if (oResult !== "Report"){	return;}
			var oReportABugView = sap.ui.getCore().byId("reportABugView");
			if ( oReportABugView){
				oReportABugView.getViewData().context.sysError = oError;
				oReportABugView.getController().openForm();	
			}
			
		}
		
	};
});