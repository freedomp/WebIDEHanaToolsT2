define(["sap/watt/lib/lodash/lodash"], function (_) {
	"use strict";
	return {
    	_getFileContent : function(oFile){
			if(oFile){
			    return oFile.getContent().then(function(sJsonContent){
			        try {
			            var oJson = JSON.parse(sJsonContent);
			            return oJson;
			        } catch (error){
			            var oError  = new Error(error);
			            oError.name = "ParseError";
			            throw oError;
			        }			            
			    });
			}
			else {
	            var oError  = new Error("File does not exist"); 
	            oError.name = "FileDoesNotExist";
	            throw oError;
			}
    	},
    	
    	//Verify that content length is not too big for JSON.stringify
    	_isContentLengthValid: function(oContent) {
	    	var iLength = oContent.length;
	    	if (iLength && iLength > 5000000) {
	    		return false;
	    	}
	    	return true;
	    },
    	
    	_setFileContent : function(oFile, oContent){
			if(oFile){
				if (this._isContentLengthValid(oContent)) {
				    try {
				        var sContent = JSON.stringify(oContent, null, "\t");
	    			    return oFile.setContent(sContent).then(function(){
	    			        return oFile.save().then(function() {
	    			            return true;
	    			        });
	    			    });
			        } catch (error){
			            var oError  = new Error(error);
			            oError.name = "JsonError";
			            throw oError;
			        }
				}
				else {
					var oRangeError  = new RangeError("Invalid content length");
		            throw oRangeError;
				}
		    }
			else {
	            var oError  = new Error("File does not exist"); 
	            oError.name = "FileDoesNotExist";
	            throw oError;
			}
    	},
    	
    	_getFileDocument : function(sPath, sFileName, bRecursive) {
    		var that = this;
    		
	        return this.context.service.filesystem.documentProvider.getDocument(sPath).then(function(oDocument) {
	            if (oDocument && oDocument.getEntity().isFolder()) {
    				return oDocument.getCurrentMetadata(bRecursive).then(function(aRawData) {
    				    var oRawNode = _.find(aRawData, function(oRawData) {
    				    	return oRawData.name === sFileName;
    				    });
    				    
    				    if (oRawNode) {
        					return that.context.service.filesystem.documentProvider.getDocument(oRawNode.path);
    				    }
    				});
	            }
	            
    			return oDocument;
	        });
    	},

	    readJson : function(sPath, sFileName, bRecursive){
	        var that = this;
	        return this._getFileDocument(sPath, sFileName, bRecursive).then(function(oFileDoc){
                return that._getFileContent(oFileDoc);
	        });
	    },
	    
	    findAndWriteJson : function(oContent, sPath, sFileName, bRecursive){
	        var that = this;
	        return this._getFileDocument(sPath, sFileName, bRecursive).then(function(oFileDoc){
                return that._setFileContent(oFileDoc, oContent);
	        });
	    },
	    
	    writeJson : function(oContent, sFilePath) {
	        var that = this;
	        if(sFilePath){
    	        var iLastSlesh = sFilePath.lastIndexOf("/");
    	        var sParentPath = sFilePath.substring(0,iLastSlesh);
    	        return this.context.service.filesystem.documentProvider.getDocument(sParentPath).then(function(oParentDocument){
    	            if(oParentDocument){
    	                var sFileName = sFilePath.substring(iLastSlesh + 1,sFilePath.length);
    	                return oParentDocument.touch(sFileName).then(function(oFileDoc){
    	                    return that._setFileContent(oFileDoc, oContent);
    	                });
    	            }
    	        });
	        }
	    },

		/**
		 * Updates a given json file document
		 *
		 * @param 	{object}	[oDocument]			The file document to be updated
		 * @param 	{object}	[oContent]			The content to fill the json file
		 * @returns {boolean}						true if succeed
		 *
		 */
		writeJsonByDocument : function(oDocument, oContent) {
			return this._setFileContent(oDocument, oContent);
		},

		/**
		 * Returns JSON Content;
		 * Throws exception once JSON is invalid
		 *
		 * @param 	{object}	[oDocument]			The file document to be updated
		 * @returns {object}						Content in JSON
		 *
		 */
		getJSONContent : function(oDocument) {
			if (!oDocument) {
				return Q({});
			}
			return oDocument.getContent().then(function(sContent) {
				var fnWriteEmptyContent = function(){return oDocument.setContent("{\n\n}").then(function() {
					return oDocument.save().then(function() {
						return {};
					});
				});

				};
				if (sContent === "") {
					return fnWriteEmptyContent();
				} else {
					return JSON.parse(sContent);
				}
			});
		}
	};
});