/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["../document/CatalogDocument",
        "../document/SqlExecutionDocument",
        "../document/CatalogEntity"
    ],
    function(CatalogDocument, SqlExecutionDocument, CatalogEntity) {

        "use strict";

        return {

            _oDAO: null,

            _aAllowedFileExtensions: null,

            configure: function(mConfig) {
                this._oDAO = mConfig.dao;
                this._aAllowedFileExtensions = mConfig.allowedFileExtensions;
            },
            /**
             * @memberOf sap.watt.common.plugin.filesystem.service.FilesystemDocumentProvider
             */
            createDocumentInternally: function(oEntity, oEventEmitter) {
                var oDocument;
                switch (oEntity.getType()) {
                    case sap.hana.cst.CATALOG_TYPE.GENERAL:
                    case sap.hana.cst.CATALOG_TYPE.SQL:
                        oDocument = new SqlExecutionDocument(this, this._oDAO, oEntity, oEventEmitter, this.context);
                        break;

                    case sap.hana.cst.CATALOG_TYPE.ROOT:
                    case sap.hana.cst.CATALOG_TYPE.SCHEMA:
                        // @HDI >>>
                    case sap.hana.cst.CATALOG_TYPE.HDI_CONTAINER:
                        // <<<
                    case sap.hana.cst.CATALOG_TYPE.TABLE:
                    case sap.hana.cst.CATALOG_TYPE.TABLE_TYPE:
                    case sap.hana.cst.CATALOG_TYPE.VIEW:
                    case sap.hana.cst.CATALOG_TYPE.ROW_VIEW:
                    case sap.hana.cst.CATALOG_TYPE.COLUMN_VIEW:
                    case sap.hana.cst.CATALOG_TYPE.PROCEDURE:
                    case sap.hana.cst.CATALOG_TYPE.FUNCTION:
                    case sap.hana.cst.CATALOG_TYPE.INDEX:
                    case sap.hana.cst.CATALOG_TYPE.SYNONYM:
                    case sap.hana.cst.CATALOG_TYPE.TRIGGER:
                    case sap.hana.cst.CATALOG_TYPE.SEQUENCE:
                    case sap.hana.cst.CATALOG_TYPE.REMOTESOURCE:
                        oDocument = new CatalogDocument(this, this._oDAO, oEntity, oEventEmitter, this.context);
                        break;
                    default:
                        throw new Error("Not supported entity type '" + oEntity.getType() + "'");
                }
                return oDocument;
            },

            getRoot: function() {

            },

            // updateDocument: function(oDocumentInfo) {
            //     var that = this;
            //     var oDoc = that.context.service.document;
            //     var oEntity = new CatalogEntity(oDocumentInfo);
            //     //First try to find existing document, otherwise fetch it
            //     return window.abc = Q.all(
            //         [
            //             oDoc.getDocument(oEntity, true)
            //         ]).spread(function(oDocument1) {
            //         if (oDocument1) {
            //             // an existed document
            //             oDocument1.update(oDocumentInfo);
            //             return oDocument1
            //         } else {
            //           throw new Error("The Document not existed before");
            //         }
            //     });
            // },

            getDocument: function(oDocumentInfo) {
                var that = this;
                oDocumentInfo.allowedFileExtensions = this._aAllowedFileExtensions;

                var oDoc = that.context.service.document;
                var oEntity = new CatalogEntity(oDocumentInfo);

                //First try to find existing document, otherwise fetch it
                return window.abc = Q.all(
                    [
                        oDoc.getDocument(oEntity, /*bNoCreate*/ true)
                    ]).spread(function(oDocument1) {
                    if (oDocument1) {
                        // an existed document, so update
                        LOG("DocumentProvider.getDocument(): Document '" + oEntity.getFullPath() + "' -> existed...");

                        oDocument1.getEntity().update(oDocumentInfo);
                        return oDocument1;
                    } else {
                        // create a new document
                        LOG("DocumentProvider.getDocument(): Document '" + oEntity.getFullPath() + "' -> new...");
                        return that._oDAO.getDocument(oDocumentInfo);
                    }
                });
            },

            search: function(oInputObject) {},

            getDocumentByKeyString: function(keyString) {}
        };

        function LOG(sText) {
            if (constants.catalogsystem.DEBUG_ENABLED) {
                console.log(sText);
            }
        }

        function ERROR(sText) {
            if (constants.catalogsystem.DEBUG_ENABLED) {
                console.error(sText);
            }
        }
    });