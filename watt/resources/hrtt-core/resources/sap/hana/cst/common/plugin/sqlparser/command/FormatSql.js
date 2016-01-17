/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define({

    execute: function() {
		var oThat = this;
		var oContentService = this.context.service.content;
		this.context.service.content.getCurrentEditor().then(function(oEditor) {
			return Q.all([oEditor.getUI5Editor(),
            oContentService.getCurrentDocument()]).spread(function(_oEditor, oDocument) {
                var sPrefix;
                if(oDocument.getEntity().getFileExtension() === "hdbprocedure"){
                    sPrefix = "CREATE\n";
                }
				if (_oEditor) {
					oThat.context.service.sqlparser.format(_oEditor, sPrefix);
				}
			});
		}).done();
	},

    isAvailable: function() {
        var oContentService = this.context.service.content;
        return oContentService.getCurrentDocument().then(function(oDocument) {
            if (oDocument) {
                var oMetadata = oDocument.getDocumentMetadata();
                if (oMetadata && oMetadata.isSql && oMetadata.isSql()) {
                    switch (oMetadata.getCategory()) {
                        case sap.hana.cst.CATALOG_CATEGORY.SQL_CONSOLE:
                        case sap.hana.cst.CATALOG_CATEGORY.SQL_FILE:
                            return true;
                        default:
                            return false;
                    }
                }
                if (oDocument.getEntity().getFileExtension() === "hdbprocedure" || oDocument.getEntity().getFileExtension() === "sql") {
                    return true;
                }
            }
            return false;
        });
    },

    isEnabled: function() {
        return true;
    }
});