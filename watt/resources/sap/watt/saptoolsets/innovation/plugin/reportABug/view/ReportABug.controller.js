var _;  
    sap.ui.controller("sap.watt.saptoolsets.innovation.plugin.reportABug.view.ReportABug", {
        
        
        openForm : function(){
        	this.resetForm();
            this.getView()._oReportABugDialog.open(); 
        },
        
        cancelFeedback : function(){
            this.getView()._oReportABugDialog.close();
        },
        
        resetForm : function(){
        	this.getView().oComponentDB.setValue("");
        	this.getView().aBugDescription.setValue("");
        	this.getView().bScreenshotAllowed.setChecked(true);
        	this.getView()._oSendButton.setEnabled(false);
        },
        
        descriptionLiveChange : function(oEvent){
    		var source = oEvent.getParameter("id"),
        		liveValue = source == "oComponentDB"?oEvent.getParameter("newValue"):oEvent.getParameter("liveValue"),
				sValue = source == "oComponentDB"? this.getView().aBugDescription.getValue(): this.getView().oComponentDB.getValue(),
				bEnabled =  (liveValue != "") && sValue != "";
			this.getView()._oSendButton.setEnabled(bEnabled);
        },
        
        
        sendReport : function(){
    		var that = this;	
    		var oI18nService = that.getView().oViewData.context.i18n;
        	var _reportViaMail = function (sMessage, sStack,sSonsole,oCapture,component,description,sUserName,sUserEmail){
				
				var data = (oCapture)?atob( oCapture.substring( "data:image/png;base64,".length ) ):"";
				var asArray = new Uint8Array(data.length);
				
	
				for( var i = 0, len = data.length; i < len; ++i ) {
					asArray[i] = data.charCodeAt(i);    
				}
					var blob = new Blob( [ asArray.buffer ], {type: "image/png"} );
					var _fromaddress = oI18nService.getText("i18n", "from_address");//"WebIDE";
					sUserEmail = sUserEmail?"," + sUserEmail:"";
					var _toaddress =  "limor.erez@sap.com,shahar.man@sap.com" +sUserEmail;
					var _subject = oI18nService.getText("i18n","subject",[component]);//" - New bug report in Web IDE";
					var xmsgMailText = sStack?(oCapture?"mailtext":"mailtext_no_screenshot"):(oCapture?"mailtext_no_trace":"mailtext_no_trace_no_screenshot");
					var _mailtext = oI18nService.getText("i18n",xmsgMailText, [sMessage,description,sUserName]);//  + sMessage + //"Hi,\nThe following error occured in Web IDE:\n" + sMessage +
				//	"\nError Description: " + description + 
				//	"\nFor more information please see attached trace and console log.\nGood Luck!\n\nWeb IDE.";
					
					
					var formData = new FormData();
		   			formData.append("fromaddress", _fromaddress);
					formData.append("toaddress", _toaddress);
					formData.append("subjecttext",_subject);
					formData.append("mailtext", _mailtext);
					formData.append("trace",new Blob([sStack]));
					formData.append("console",sSonsole);
					formData.append("screenShot",blob);
		
					return Q.sap.ajax({
						type:"POST",
						url:"/destinations/reportmailservice",
						data: formData,
						processData: false,
						contentType: false
					}).then(function(oResponse) {
						if (oResponse[0]) {
							window.console.log("Bug was reported", oResponse[0]);
						}
					}).fail(function(oErr) {
							window.console.error("Unhandled Error", oErr);
					});
			};
        	
        	
        	var component = this.getView().oComponentDB.getValue();                     
        	var description = this.getView().aBugDescription.getValue();
        	var includeScreenshot = this.getView().bScreenshotAllowed.getChecked();
        	var oError = this.getView().getViewData().context.sysError;
        	if (!oError) {
        		oError = {message :description, stack: ""};
        	}
        	that.getView().oViewData.context.service.system.getSystemInfo().then(function(result) { 
        		var sUserName = result?result.sUsername :"" ;
        		var sFirstName = result?result.sFirstName :"" ;
        		var sUserEmail = result?result.sEMail :"" ;
	        	var xmsgThankyou = "bug_was_reported";
	        	if(includeScreenshot){ 
	        		require(["sap/watt/saptoolsets/innovation/plugin/reportABug/lib/html2canvas"],function(){
	        			window.html2canvas(document.body, {
							onrendered: function(canvas) {
								var oScreenshot = canvas.toDataURL("image/png");
								_reportViaMail(oError.message,oError.stack,window.myLog,oScreenshot,component,description,sUserName,sUserEmail);
								var thankYoumsgBox =  sap.ui.commons.MessageBox;
								xmsgThankyou = oError.stack?"bug_was_reported":"bug_was_reported_no_trace";
								var sMsg =  oI18nService.getText("i18n", xmsgThankyou,[sFirstName]);
								thankYoumsgBox.show(sMsg, "INFORMATION", "Information", []);
									
							}
						});
	        			
	        		}); //I have some bug in the button names
	        	}
	        	else{
	        		_reportViaMail(oError.message,oError.stack,window.myLog,null,component,description,sUserName,sUserEmail);
					var thankYoumsgBox =  sap.ui.commons.MessageBox;
					xmsgThankyou = oError.stack?"bug_was_reported_no_screenshot":"bug_was_reported_no_trace_no_screenshot";
					var sMsg =oI18nService.getText("i18n",xmsgThankyou,[sFirstName]);
					thankYoumsgBox.show(sMsg, "INFORMATION", "Information", []);
	        	}
        	});
			
        }
        
    });