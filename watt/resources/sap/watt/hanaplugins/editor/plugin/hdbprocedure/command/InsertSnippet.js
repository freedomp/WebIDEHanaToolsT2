define(["../util/Request"], function(ioRequest) {
    return {
        _goIO: ioRequest,
        _goGUP: null,
        
        init: function(){
            var that = this;
            var loIDEUtils = this.context.service.ideutils;
            loIDEUtils.getGeneralUtilityProvider().then(function(ioGeneralUtitlityProvider){
                that._goGUP = ioGeneralUtitlityProvider;
            }).done();            
        },

        execute: function() {
            var that = this;

            var loSelectionService = this.context.service.selection;
            var loIDEUtils = this.context.service.ideutils;
            return loSelectionService.assertNotEmpty().then(function(iaSelection) {
                var loDocument = iaSelection[0].document;
                if (loDocument === null || loDocument.getType() !== "file") {
                    return false;
                }
                var lsURI = loDocument.getEntity().getFullPath().substr(1);
                var lsFileExtension = loDocument.getEntity().getFileExtension();
                if (lsFileExtension.toLowerCase() === 'hdbprocedure') {
                    var lsGeneratedTemplateContent = that._getTemplate(lsURI);
                    that._goGUP.writeToCurrentFile(lsGeneratedTemplateContent).done();
                } else {
                    return false;
                }
            });
        },

        isAvailable: function() {
            var that = this;

            var loSelectionService = this.context.service.selection;
            return loSelectionService.assertNotEmpty().then(function(iaSelection) {
                var loDocument = iaSelection[0].document;
                if (loDocument === null || loDocument.getType() !== "file") {
                    return false;
                }
                var lsFileExtension = loDocument.getEntity().getFileExtension();
                if (lsFileExtension.toLowerCase() === 'hdbprocedure') {
                    return true;
                } else {
                    return false;
                }
            });
        },

        isEnabled: function() {
            return true;
        },
        
        _getTemplate: function(isURI) {
            return "" +
                "PROCEDURE \"<target_schema_name>\".\"" + this._goGUP.packageURItoXSPath(this._goGUP.uriToParentURI(isURI)) + "::" + this._goGUP.uriToFilePrefix(isURI) + "\" ( )\r\n" +
                "   LANGUAGE SQLSCRIPT\r\n"                     +
                "   SQL SECURITY INVOKER\r\n"                   +
				"   --DEFAULT SCHEMA <default_schema_name>\r\n" +
                "   READS SQL DATA AS\r\n"                      +
                "BEGIN\r\n"                                  +
                "   /*************************************\r\n" +
                "       Write your procedure logic \r\n"     +
                "   *************************************/\r\n" +
                "END";
        }        
    };
});