define([], function() {
    "use strict";
    return {
        createFile: function(sFileName, oSelectedDocument, oService) {
            var that = this;
            // this.schemaName = sSchemaName || "<target_schema_name>";
            return oSelectedDocument.createFile(sFileName).then(
                function(oDocument) {
                    if (typeof oDocument !== "undefined") {
                        var sContent = that.getTemplate(sFileName);
                        return Q.all([
                            oDocument.setContent(sContent),
                            oService.document.open(oDocument),
                            oService.repositorybrowser.setSelection(oDocument, true)
                        ]).then(function() {
                            return oDocument;
                        });
                    } else {
                        return false;
                    }
                });
        },

        getTemplate: function(sFileName) {
            var sNamespace, sReturn = "";
            sNamespace = "<namespace>";
            sFileName = sFileName.replace(/\.hdbfunction(?=[^.hdbfunction]*$)/, "");
            sFileName = sFileName || "<function_name>";
            sReturn = "" +
                "FUNCTION \"" + sNamespace + "::" + sFileName + "\" ( )\r\n" +
                "	RETURNS <return_parameter_list|return_table_type> \r\n" +
                "	LANGUAGE SQLSCRIPT \r\n" +
                "	SQL SECURITY INVOKER AS \r\n" +
                "BEGIN \r\n" +
                "/*****************************  \r\n" +
                "	Write your function logic \r\n" +
                " *****************************/ \r\n" +
                "END;";
            return sReturn;
        }
    };
});