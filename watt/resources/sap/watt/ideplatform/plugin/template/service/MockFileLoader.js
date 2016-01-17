define({
        
    init : function(){
        
       jQuery.sap.require("sap.ui.core.util.MockServer");  
    },

    /**
     * Creates Mock Server with a given regular expression and ZIP object with empty content
     *
     * @param {string}      sRegEx      The file content that will be returned, according to the regular expression string
     * @param {object}      oZip        The Zip file from which the content of the file will be returned
     */
    mockFromZipFile : function(sRegEx, oZip){
        
        this._createMockServer(sRegEx, null, oZip);
    },

    /**
     * Creates Mock Server with XML file type string with a given ZIP object and empty content
     *
     * @param {object}      oZip        The Zip file from which the content of the file will be returned
     */
    mockXMLFromZipFile : function(oZip){
        
        this._createMockServer(".+\\.xml$", null, oZip);
    },

    /**
     * Generates regular expression based on given URL and creates MockServer with the given content and generated
     * regular expression
     * @param {string}      sUrl      The url to be mocked using the Mock Server
     * @param {string}      sContent    The file content that will be returned, according to the regular expression string
     */
    mockFile : function(sUrl, sContent){
        
        var sRegEx = new RegExp(sap.ui.core.util.MockServer.prototype._escapeStringForRegExp(sUrl));
        this._createMockServer(sRegEx, sContent);
    },
    
    _createMockServer : function(sRegEx, sContent, oZipFile){
        
        var that = this;
		this._oMockServer = new sap.ui.core.util.MockServer({
			requests: [{
				method: "GET",
				path: new RegExp(sRegEx),
				response: function(oXhr) {
				    if (oZipFile){
				        sContent = that._getXMLContentFromZipFile(oXhr, oZipFile);
				    }
					oXhr.respond(200, {
						"Content-Type": "application/xml;charset=utf-8"
					}, sContent);
				}
			}]
		});
		
		this._oMockServer.start();   
    },
    
    _getXMLContentFromZipFile : function(oXhr, oZip){
        
        var iCacheBuster = oXhr.url.search("\/~.+~\/");
        var iStartFromIndex = oXhr.url.indexOf("/",iCacheBuster + 1);
        var sfileInZip = oXhr.url.substring(iStartFromIndex + 1);
        try {
             return oZip.file(sfileInZip).asText();
        }
        catch(err) {
             return null;
        }
    },

    /**
     * Stops and destroy Mock Server
     */
    stopMock : function(){
        if (this._oMockServer){
            this._oMockServer.stop();
            this._oMockServer.destroy();
        }
       
        sap.ui.core.util.MockServer.destroyAll();        
    }
});