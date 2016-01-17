define(["../ui/NewHdbProcedureDialog"], function(NewHdbProcedureDialog) {
    "use strict";

    return {

        _goGUP: null,

        init: function() {
            // var that = this;
            // var loIDEUtils = this.context.service.ideutils;
            // loIDEUtils.getGeneralUtilityProvider().then(function(ioGeneralUtitlityProvider){
            //     that._goGUP = ioGeneralUtitlityProvider;
            // }).done();            
        },

        execute: function() {
            var that = this;
            return that.context.service.selection.assertNotEmpty().then(function(aSelection) {
                return aSelection[0].document.getFolderContent().then(function(aEntries) {
                    return NewHdbProcedureDialog.openCreateUI(that, aSelection[0].document, aEntries).then(function() {
                        return that.context.service.focus.attachEvent("$dialogClosed", that._dialogClosed, that);
                    });
                });
            });
        },

        isAvailable: function() {
            var that = this;
            return that.context.service.selection.assertNotEmpty().then(function(aSelection) {
                if (aSelection && aSelection[0]) {
                    var oFolderDocument = aSelection[0].document;
                    if (oFolderDocument) {
                        return that.context.service.projectType.getProjectTypes(oFolderDocument).then(function(aProjectTypes) {
                            if (aProjectTypes && aProjectTypes[0]) {
                                return aProjectTypes[0].id && aProjectTypes[0].id === "sap.hdb";
                            }
                            return false;
                        });
                    }
                }
                return false;
            });
        },

        isEnabled: function() {
            return this.context.service.repositorybrowserUtils.isSingleFolderNotRootSelection(this.context.service);
        },

        createFile: function(sFileName, oSelectedDocument) {
            var that = this;
            // this.schemaName = sSchemaName || "<target_schema_name>";
            return oSelectedDocument.createFile(sFileName).then(
                function(oDocument) {
                    if (typeof oDocument !== "undefined") {
                        var sContent = that._getTemplate(oDocument);
                        return Q.all([
                            oDocument.setContent(sContent),
                            that.context.service.document.open(oDocument),
                            that.context.service.repositorybrowser.setSelection(oDocument, true)
                        ]).then(function() {
                            return oDocument;
                        });
                    } else {
                        return false;
                    }
                });
        },

        _dialogClosed: function() {
            var that = this;
            return Q.delay(100).then(function() {
                return that.context.service.focus.setFocus(that.context.service.content).then(function() {
                    return that.context.service.focus.detachEvent("$dialogClosed", that._dialogClosed, that);
                    // return that._insertTemplate();
                });
            });
        },

        _getTemplate: function(oDocument) {
            var sProcedureName, sNamespace;
            sNamespace = "<namespace>";
            sProcedureName = "<procedure_name>";
            if (oDocument) {
                sProcedureName = oDocument.getEntity().getName();
                sProcedureName = sProcedureName.replace(/\.hdbprocedure(?=[^.hdbprocedure]*$)/, "");
            }
            return "" +
                // "PROCEDURE " + this._goGUP.packageURItoXSPath(this._goGUP.uriToParentURI(isURI)) + "::" + this._goGUP.uriToFilePrefix(isURI) + "\" ( )\r\n" +
                "PROCEDURE \"" + sNamespace + "::" + sProcedureName + "\" ( )\r\n" +
                "   LANGUAGE SQLSCRIPT\r\n" +
                "   SQL SECURITY INVOKER\r\n" +
                "   --DEFAULT SCHEMA <default_schema_name>\r\n" +
                "   READS SQL DATA AS\r\n" +
                "BEGIN\r\n" +
                "   /*************************************\r\n" +
                "       Write your procedure logic \r\n" +
                "   *************************************/\r\n" +
                "END";
        },

        _insertTemplate: function() {
            var that = this;
            var loSelectionService = this.context.service.selection;
            return loSelectionService.assertNotEmpty().then(function(iaSelection) {
                var loDocument = iaSelection[0].document;
                if (loDocument === null || loDocument.getType() !== "file") {
                    return Q(false);
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
        }
    };
});