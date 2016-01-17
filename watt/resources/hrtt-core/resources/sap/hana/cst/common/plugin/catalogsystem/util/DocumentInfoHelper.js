/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(function() {

    var DocumentInfoHelper = {};

    DocumentInfoHelper.getExtension = function(oDocumentInfo) {
        switch (oDocumentInfo.type) {
            case sap.hana.cst.CATALOG_TYPE.GENERAL:
                return oDocumentInfo.category;
            case sap.hana.cst.CATALOG_TYPE.SQL:
                return "sql";
            default:
                return oDocumentInfo.displayMode + "-" + oDocumentInfo.type;
        }
    };

    DocumentInfoHelper.buildParentPath = function(oDocumentInfo) {
        var sType = oDocumentInfo.type;
        var serviceName = oDocumentInfo.serviceName;

        var sParentPath = "";
        if (serviceName) {
            switch (sType) {
                case sap.hana.cst.CATALOG_TYPE.GENERAL:
                    sParentPath = this._buildParentPathForGeneralType(oDocumentInfo);
                    break;

                case sap.hana.cst.CATALOG_TYPE.SQL:
                    sParentPath = "/";
                    break;

                case sap.hana.cst.CATALOG_TYPE.VIEW:
                    sParentPath = "/" + sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_VIEW;
                    break;

                case sap.hana.cst.CATALOG_TYPE.COLUMN_VIEW:
                    sParentPath = "/" + sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_COLUMN_VIEW;
                    break;

                case sap.hana.cst.CATALOG_TYPE.TABLE:
                    sParentPath = "/" + sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_TABLE;
                    break;

                case sap.hana.cst.CATALOG_TYPE.TABLE_TYPE:
                    sParentPath = "/" + sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_PROCEDURE + "/" + sap.hana.cst.CATALOG_NAME.ROOT_TABLE_TYPE;
                    break;

                case sap.hana.cst.CATALOG_TYPE.PROCEDURE:
                    sParentPath = "/" + sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_PROCEDURE;
                    break;

                case sap.hana.cst.CATALOG_TYPE.SEQUENCE:
                    sParentPath = "/" + sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_SEQUENCE;
                    break;

                case sap.hana.cst.CATALOG_TYPE.FUNCTION:
                    sParentPath = "/" + sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_FUNCTION;
                    break;

                case sap.hana.cst.CATALOG_TYPE.TRIGGER:
                    sParentPath = "/" + sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_TRIGGER;
                    break;

                case sap.hana.cst.CATALOG_TYPE.INDEX:
                    sParentPath = "/" + sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_INDEX;
                    break;

                case sap.hana.cst.CATALOG_TYPE.SYNONYM:
                    if (serviceName === "PUBLIC") {
                        sParentPath = "/" + sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + sap.hana.cst.CATALOG_NAME.ROOT_PUBLIC_SYNONYM;
                    } else {
                        sParentPath = "/" + sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_SYNONYM;
                    }
                    break;

                default:
                    sParentPath = serviceName;
            }
        }
        return sParentPath;
    };


    DocumentInfoHelper._buildParentPathForGeneralType = function(oDocumentInfo) {
        var sCategory = oDocumentInfo.category;
        var serviceName = oDocumentInfo.serviceName;
        var sParentPath = "/";
        switch (sCategory) {
            case sap.hana.cst.CATALOG_CATEGORY.DATA_PREVIEW:
            case sap.hana.cst.CATALOG_CATEGORY.PARAM_CONTROL:
                if (oDocumentInfo.supplement && oDocumentInfo.supplement.srcDocument) {
                    var oSrcDocument = oDocumentInfo.supplement.srcDocument;
                    var oMetaSrc = oSrcDocument.getDocumentMetadata();
                    if (oMetaSrc.isColumnView()) {
                        sParentPath += sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_COLUMN_VIEW;

                    } else if (oMetaSrc.isView()) {
                        sParentPath += sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_VIEW;

                    } else if (oMetaSrc.isTable()) {
                        sParentPath += sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_TABLE;

                    } else if (oMetaSrc.isSynonym()) {
                        // if (serviceName === "PUBLIC") {
                        //     sParentPath += sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + sap.hana.cst.CATALOG_NAME.ROOT_PUBLIC_SYNONYM;
                        // } else {
                            sParentPath += sap.hana.cst.CATALOG_NAME.ROOT_CATALOG + "/" + serviceName + "/" + sap.hana.cst.CATALOG_NAME.ROOT_SYNONYM;
                        // }
                    }
                }
                break;
            default:
        }

        return sParentPath;
    };

    return DocumentInfoHelper;
});