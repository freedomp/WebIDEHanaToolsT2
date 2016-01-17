define([ "../io/Request" ], function(Request) {
	"use strict";
	var Transfer = {

		/** 
		 * @private
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.Transfer
		 * @type {sap.watt.ideplatform.orion.orionbackend.io.Request}
		 */
		_io : Request,

		/** Exporting files and directories to the client is performed via a GET 
		 * The body of the response will be the exported files/directories in the requested format. 
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.Transfer
		 * @param {string} sExportLocation
		 * @return {Promise} a deferred promise that will provide the zipped content of the folder as ArrayBuffer
		 * 
		 */
		exportFolder : function(sExportLocation) {
		    // add a timestap at the end to avoid caching of the request in IE11
			var oRequest = this._io.createXMLHttpRequest("GET", sExportLocation + "?" + (new Date().getTime()).toString( ));
			oRequest.responseType = "arraybuffer";
			return this._io.sendXMLHttpRequest(oRequest);
		},

		/** An upload is initiated via a POST request. The request URL indicates where 
		 * the file should be located once the upload is complete. 
		 * The request must indicate the total size of the file the server should expect. 
		 * The chunked file upload service can also be used to import an archive file that will be expanded upon completion of import.
		 * This allows a large number of files to be imported into a project at once.
		 * TODO REMOTE orion docu mentions X-Xfer-Content-Length but current orion usesContent-Length
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.Transfer
		 * @param {string} sImportLocation
		 * @param {object} oContent can be a File object or a Blob object
		 * @param {boolean} bForce indicator whether import zip should overwrite existing files
		 * @return {Promise} a deferred promise that will provide the response of the import request
		 */
		importZip : function(sImportLocation, oContent, bForce) {
			var that = this;
			sImportLocation = (bForce) ? sImportLocation + "?force=true" : sImportLocation;
			var oRequest = this._io.createXMLHttpRequest("POST", sImportLocation);
			oRequest.setRequestHeader("Content-Type", "application/x-zip-compressed");
			//oRequest.setRequestHeader("X-Xfer-Content-Length", oContent.size);
			var name = (oContent.name ? oContent.name : "blob.zip");
			oRequest.setRequestHeader("Slug", name);
			oRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			if (bForce){
			    oRequest.setRequestHeader("X-Xfer-Options", "overwrite-older");
			}
			return this._io.sendXMLHttpRequest(oRequest, oContent);
		},

		// 
		/** A resumable chunked upload is initiated via a POST request.
		 * The request URL indicates where the file should be located once the upload is complete.
		 * The request must indicate the total size of the file the server should expect.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.Transfer 
		 * @param {string} sImportLocation
		 * @param {object} oContent can be a File object or a Blob object
		 * @param {string} sFileName needs to be provided in case oContent is a Blob
		 * @return {Promise} a deferred promise that will provide the response of the import request
		 */
		importFile : function(sImportLocation, oContent, sFileName) {
			var name = "";
			var that = this;
			var oRequest = this._io.createXMLHttpRequest("POST", sImportLocation);
			// default content type with "text/plain" if not provided in the Blob
			var sContentType = oContent.type ? oContent.type : "text/plain";
			oRequest.setRequestHeader("Content-Type", sContentType);
			if (oContent instanceof File) {
				name = oContent.name;
			} else if (oContent instanceof Blob) {
				if (typeof sFileName == "undefined" || sFileName == null) {
					throw new Error("Unexpected Error");
				}
				name = sFileName;
			} else {
				throw new Error("Unexpected Error");
			}

			oRequest.setRequestHeader("Slug", name);
			oRequest.setRequestHeader("X-Xfer-Options", "raw,overwrite-older");
			oRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			return this._io.sendXMLHttpRequest(oRequest, oContent);
		}

	};

	return Transfer;

});