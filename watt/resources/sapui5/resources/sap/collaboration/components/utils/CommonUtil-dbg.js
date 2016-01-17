/*!
 * @copyright@
 */

/*************************************************************
* CommonUtil helper class
*
* Common utilities functions
**************************************************************/

jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.collaboration.components.utils.MessageQueueUtil");

jQuery.sap.declare("sap.collaboration.components.utils.CommonUtil");

sap.ui.base.Object.extend("sap.collaboration.components.utils.CommonUtil",{
	
	constructor: function() {	
		this.MessageQueueUtil = new sap.collaboration.components.utils.MessageQueueUtil(); 
	},
	
	/**
	 * Gets language bundle
	 * @private
	 */
	getLanguageBundle: function() {
		if (!this.oLangBundle){
			jQuery.sap.require("jquery.sap.resources");
			var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
			this.oLangBundle = jQuery.sap.resources({
				url : jQuery.sap.getModulePath("sap.collaboration.components") + "/resources/i18n/messagebundle.properties", 
				locale: sLocale
			});
		}
		return this.oLangBundle;
	},
	
	/**
	 * Displays a MessageBox with an error message
	 * @param {oError} object The error object
	 * @private
	 */
	displayError : function(sErrorMessageMessage) {
		var self = this;
		var sMessage = "";
		var oOptions = {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: self.getLanguageBundle().getText("SYSTEM_ERROR_MESSAGEBOX_TITLE")
		};
		
		if(!sErrorMessageMessage || sErrorMessageMessage === ""){
			sMessage = self.getLanguageBundle().getText("SYSTEM_ERROR_MESSAGEBOX_GENERAL_TEXT");
		}
		else{
			sMessage = sErrorMessageMessage;
		}
		
		this.MessageQueueUtil.displayMessage(sMessage, oOptions, "MBox");
	},
	
	/**
	 * Creates a Message Toast
	 * @private
	 */
	showMessage : function(sMessage, oOptions) {
		this.MessageQueueUtil.displayMessage(sMessage, oOptions, "MToast");
	},
	/**
	 * Test if the given date is a valid date object. If the date is invalid an error message is logged.
	 * @param {Date} The date to be validated.
	 * @return {boolean} True if the object is a date, false otherwise
	 * @public
	 */
	isValidDate : function(oDate) {
	    if (Object.prototype.toString.call(oDate) !== "[object Date]" || isNaN(oDate.getTime())) {
	        jQuery.sap.log.error("DateUtils invalid date=" + oDate);
	        return false;
	    }
	    return true;
	},
	/**
	 * Returns icon based on mime type
	 * @param {oError} object The error object
	 * @private
	 */
	getIconFromMimeType : function(sVal) {

	    var sIcon = "";
	    if (!sVal) {
	        return "sap-icon://document";
	    }
	    if (sVal.indexOf('image') === 0) {
	        sIcon = "sap-icon://attachment-photo";
	    } else if (sVal.indexOf('video') === 0) {
	        sIcon = "sap-icon://attachment-video";
	    } else if (sVal.indexOf('text') === 0) {
	        sIcon = "sap-icon://attachment-text-file";
	    } else if (sVal.indexOf('audio') === 0) {
	        sIcon = "sap-icon://attachment-audio";
	    } else if (sVal.indexOf('audio') === 0) {
	        sIcon = "sap-icon://attachment-audio";
	    } else if (sVal.indexOf('application') === 0) {

	        switch (sVal) {
	            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
	            case 'application/vnd.ms-powerpoint':
	            case 'application/vnd.openxmlformats-officedocument.presentationml.template':
	                sIcon =  "sap-icon://ppt-attachment";
	                break;
	            case 'application/msword':
	            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
	            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.template':
	                sIcon =  "sap-icon://doc-attachment";
	                break;
	            case 'application/vnd.ms-excel':
	            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
	            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.template':
	                sIcon = "sap-icon://excel-attachment";
	                break;
	            case 'application/pdf':
	                sIcon = "sap-icon://pdf-attachment";
	                break;
	            case 'application/xhtml+xml':
	                sIcon = "sap-icon://attachment-html";
	                break;
	            case 'application/zip':
	            case 'application/gzip':
	                sIcon = "sap-icon://attachment-zip-file";
	                break;
	            default:
	                sIcon = "sap-icon://document";
	        }
	    } else {
	        sIcon = "sap-icon://document";
	    }
	    return sIcon;
	},
	
	/**
	 * Check if 2 arrays of objects are equal 
	 * @public
	 */	
	areArraysEqual : function(arrayA, arrayB){
		var objectsAreSame = function(x, y) {
		   var objectsAreSame = true;
		   for(var propertyName in x) {
		      if(x[propertyName] !== y[propertyName]) {
		         objectsAreSame = false;
		         break;
		      }
		   }
		   return objectsAreSame;
		};	
		
		if(arrayA.length !== arrayB.length){
			return false;
		}
		for(var i=0; i<arrayA.length; i++){
			if( !objectsAreSame(arrayA[i], arrayB[i]) ){
				return false;
			}
		}
		return true;
	},
	
	/**
	 * Convert a base64 string representation of a File into a Blob
	 * @param {string} b64Data - base64 string representation of the data
	 * @param {string} contentType - content type of file
	 * @param {string} sliceSize - slice size of files
	 * @return {Blob} Blob object 
	 * @public
	 */
	b64toBlob : function (b64Data, contentType, sliceSize) {
	    contentType = contentType || '';
	    sliceSize = sliceSize || 512;
	    
	    var byteCharacters = window.atob(b64Data);
	    var byteArrays = [];
	    
	    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
	        var slice = byteCharacters.slice(offset, offset + sliceSize);
	        
	        var byteNumbers = new Array(slice.length);
	        for (var i = 0; i < slice.length; i++) {
	            byteNumbers[i] = slice.charCodeAt(i);
	        }
	        
	        var byteArray = new window.Uint8Array(byteNumbers);
	        
	        byteArrays.push(byteArray);
	    }
	    
	    var blob = new window.Blob(byteArrays, {type: contentType});
	    return blob;
	}
});