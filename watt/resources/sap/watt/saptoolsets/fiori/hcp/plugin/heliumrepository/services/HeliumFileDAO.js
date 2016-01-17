define(["sap/watt/lib/jszip/jszip-shim"], function(JSZip) {
	return {
		pathSeparator : "/",

		getDocument: function(sPath, sDAO, sVersion) {

		},

		getVersion: function(oDocument, sVersion, sDAO) {
			return "";
		},

		load: function(oDocument) {

			var resourcePath = oDocument.getEntity().getFullPath();
			if (resourcePath.indexOf(this.pathSeparator) === 0) {
				resourcePath = resourcePath.substring(1);
			}

			var resourceName = oDocument.getEntity().getName();
			var system = oDocument.getExtInfo().origin;
			var path = "/api/html5api/accounts/" + system.account + "/" + system.type + "s/" + system.application + "/content?pathSuffixFilter=" +
				resourceName;
			var that = this;
			return this.getJSZipFromHCP(path).then(function(jsZip) {
				var content = jsZip.file(resourcePath).asText();
				if (oDocument.getExtInfo().bBeautify && oDocument.getType() === "file") {
                    return that.context.service.beautifierProcessor.beautify(content, oDocument.getEntity().getFileExtension(), null).then(function (formattedText) {
                        return {
                            mContent: formattedText,
                            sETag: oDocument.getETag(false)
                        };
                    }).fail(function(oError) {
						console.log(oError);
						return {
							mContent: content,
							sETag: oDocument.getETag(false)
						};
					});
				} else {
                    return {
						mContent: content,
						sETag: oDocument.getETag(false)
					};
				}
			});
		},

		getJSZipFromHCP : function(path) {
			return this.getResponseFromHCP(path, "arraybuffer").then(function(response) {
				var jsZip = new JSZip(response);
				return jsZip;
			});
		},

		getResponseFromHCP : function(path, responseType) {
			var oDeferred = Q.defer();
			//for Blobs, we have to use XMLHttpRequest
			var that = this;
			var oXHR = new XMLHttpRequest();
			oXHR.open('GET', path);
			oXHR.setRequestHeader('Accept', '*/*');
			oXHR.responseType = responseType;
			oXHR.onload = function(e) {
				if (this.readyState === 4 && this.status < 300) {
					oDeferred.resolve(this.response);
				} else {
					var error = {};
					switch (this.status) {
						case 404:
						case 400:
							error.message = that.context.i18n.getText("i18n", "HeliumParentProject_404_error");
							break;
						case 401:
							error.message = that.context.i18n.getText("i18n", "HeliumParentProject_unathorized");
							break;
						default:
							error.message = that.context.i18n.getText("i18n", "HeliumParentProject_internal_error");
					}
					oDeferred.reject(error);
				}
			};
			oXHR.send();
			return oDeferred.promise;
		},

		objectExists: function(oParentFolderDocument, sRelativePath) {
			return true;
		},

		save: function(oDocument) {
			return "";
		},

		readFileMetadata: function(oDocument) {
			return {
                sETag : oDocument.getETag(false),
				readOnly: true
			};
		},

		refresh: function(oEvent) {
		},

		updateWorkspace: function(oEvent) {
		}

	};
});