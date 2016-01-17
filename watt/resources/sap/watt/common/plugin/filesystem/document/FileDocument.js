define(["./AbstractFileSystemDocument"], function(AbstractFileSystemDocument) {
	"use strict";
	var FileDocument = AbstractFileSystemDocument.extend("sap.watt.common.plugin.filesystem.document.FileDocument");

	FileDocument.prototype = jQuery.extend(FileDocument.prototype, {
		refresh : function() {
			return this.reload(this);	
		},
		
		/**
		 * Deletes a file
		 */ 
		"delete": function() {
			var that = this;
			// 1. deletes a file from a backend
			// 2. get file parent document
			return Q.spread([this._oDAO.deleteFile(this), this.getParent(), that._setState({
					bExists: false
				})], function(oDeleteResult, oParentDocument) {
				// notify listeners about the deleted file and update the parent document metadata
				return oParentDocument._deleteDocumentHandler(that);
			});
		},

		readFileMetadata: function() {
            var eTag =  this.getETag(false);
            if (eTag !== null && eTag !== undefined) {
                return eTag;
            }

			return this.getETag(true);
		},

		isBinary: function() {
			//TODO really simple binary file detection, based on known file names list, to be enhanced,
			// Async because future implementations might need service calls
			switch (this.getEntity().getFileExtension().toLowerCase()) {
				case "jpg":
				case "jpeg":
				case "gif":
				case "ico":
				case "png":
				case "ttf":
				case "zip":
				case "jar":
				case "war":
				case "bmp":
				case "tif":
				case "tiff":
                case "mtar":
                    return Q(true);

				default:
					return Q(false);
			}
		},

        createFileBlob : function(){
            return this.getContent().then(function(content){
                var blob;
                if(typeof content === 'string'){
                    blob = new Blob([content], {type: 'application/text; charset=UTF-8'});
                }
                // In safari image file is opened instead of downloaded. only works if blob type is  'application/binary'
                else{
                    if(content.type && !sap.ui.Device.browser.safari){
                        blob = new Blob([content], {type:content.type});

                    }
                    else if (content.type && sap.ui.Device.browser.safari) {
                        blob = new Blob([content], {type: 'application/binary'});
                    }
                }
                return blob;
            });
        }
	});

	return FileDocument;
});