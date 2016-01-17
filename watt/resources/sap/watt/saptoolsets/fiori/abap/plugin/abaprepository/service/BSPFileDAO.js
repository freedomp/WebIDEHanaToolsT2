define([], function() {
	return {
		getDocument: function(sPath, sDAO, sVersion) {

		},

		getVersion: function(oDocument, sVersion, sDAO) {
            return "";
		},

		load: function(oDocument) {
			if (oDocument.getType() !== "file" && oDocument.getType() !== "folder") {
				throw new Error("Unsupported operation. Can't load " + oDocument.getType());
			}
			var that = this;
			return Q.all([
				that.readFileContent(oDocument),
				that.readFileMetadata(oDocument)
				]).spread(function(mContent, oMetadata) {
					return {
						mContent: mContent,
						sETag: oMetadata.sETag
					};
				});
		},

		readFileContent : function(oDocument) {

			var contentType = "text";
			if (oDocument.getType() === "folder") {
				contentType = "xml";
			}

			var resourcePath = oDocument.getEntity().getFullPath();

			var that = this;
			return this.context.service.destination.getDestinations("dev_abap").then(function(destinations) {
				var oDocExtInfo = oDocument.getExtInfo();
				var destination = that.getDestination(destinations, oDocExtInfo.origin);
				if (destination) {
					var path = destination.url + "/filestore/ui5-bsp/objects/" + encodeURIComponent(resourcePath) + "/content";

					return Q.sap.ajax({
						url : path,
						dataType : contentType
					}).then(function(response) {
                        var content = response[0];
                        if (oDocument.getExtInfo().bBeautify && oDocument.getType() === "file") {
                            return that.context.service.beautifierProcessor.beautify(content, oDocument.getEntity().getFileExtension(), null).then(function (formattedText) {
                                return formattedText;
                            }).fail(function(oError) {
								console.log(oError);
								return content;
							});
                        } else {
                            return content;
                        }
					});
				} else {
					throw new Error("Destination not found");
				}
			});
		},

		getDestination : function(destinations, system) {
			for ( var i = 0; i < destinations.length; i++) {
				var destination = destinations[i];
				if (destination.name === system.name || (destination.systemId === system.id && destination.sapClient === system.client)) {
					return destination;
				}
			}

			return undefined;
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
                readOnly : true
			};
		},

		refresh: function(oEvent) {
		},

		updateWorkspace: function(oEvent) {
		}

	};
});