/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

(function() {
    
    if (typeof window.sap !== "object" && typeof window.sap !== "function") {
        window.sap = {};
    }

    if (typeof window.sap.hana !== "object") {
        window.sap.hana = {};
    }

    if (typeof window.sap.hana.cst !== "object") {
        window.sap.hana.cst = {};
    }

    if (typeof window.constants !== "object") {
        window.constants = {};
    }

    if (typeof window.constants.catalogsystem !== "object") {
        window.constants.catalogsystem = {};
    }

    constants.catalogsystem = {
        DEBUG_ENABLED: sap.watt.getEnv("debugMode")
    };

    // The Type as general type that is relevant to the type of Document
    // Try to limit the list of the general type by using GENERAL below since it's configured in plugin json document:providers
    sap.hana.cst.CATALOG_TYPE = {
        ROOT: "root_catalog",
        GENERAL: "catalog_general", // This type will be classified into another editors (datapreview, param...), 
                            // SQL type is specified for sql editor, prepare editor,
                            // the others are metadata editor as default for artifacts
        SQL: "sql",
        // @HDI >>>
        HDI_CONTAINER: "hdi_container",
        // <<<
        SCHEMA: "schema",
        FUNCTION: "function",
        INDEX: "index",
        PROCEDURE: "procedure",
        SEQUENCE: "sequence",
        TRIGGER: "trigger",
        VIEW: "view",           // The "VIEW" consits of ROW_VIEW and COLUMN_VIEW (CALCULATED_VIEW, HIERARCHY_VIEW, JOIN_VIEW, OLAP_VIEW)
        ROW_VIEW: "row_view",   // litte confused for row_view, so row_view will be available in category and type temporarily
        COLUMN_VIEW: "column_view",
        TABLE: "table",
        TABLE_TYPE: "table_type",
        SYNONYM: "synonym"
    };

    // The category as specific type that is relevant for all artifacts in Catalog
    // category is details of type, and it is a category of editor in details, as well, default editor will be metadata editor
    sap.hana.cst.CATALOG_CATEGORY = {
        // SQL
        SQL_CONSOLE: "sql_console",
        SQL_FILE: "sql_file",
        SQL_PREPARE: "sql_prepare",

        // @HDI >>>
        HDI_CONTAINER: "hdi_container",
        // <<<
        SCHEMA: "schema",
        FUNCTION: "function",
        PROCEDURE: "procedure",
        SEQUENCE: "sequence",
        TRIGGER: "trigger",
                
        // TABLE
        ROW_TABLE: "row_table",
        COLUMN_TABLE: "column_table",
        VIRTUAL_TABLE: "virtual_table",
        EXTENDED_TABLE: "extended_table",
        
        // VIEW (ROW_VIEW, COLUMN_VIEW, MONITORVIEW)
        ROW_VIEW: "row_view",   // litte confused for row_view, so row_view will be available in category and type temporarily
        MONITORVIEW: "monitorview",
        // COLUMN_VIEW (CALCULATED_VIEW, HIERARCHY_VIEW, JOIN_VIEW, OLAP_VIEW)
        CALCULATED_VIEW: "calculated_view",
        HIERARCHY_VIEW: "hierarchy_view",
        JOIN_VIEW: "join_view",
        OLAP_VIEW: "olap_view",
        
        // SYNONYM
        FUNCTION_SYNONYM: "function_synonym",
        PROCEDURE_SYNONYM: "procedure_synonym",
        SEQUENCE_SYNONYM: "sequence_synonym",
        TRIGGER_SYNONYM: "trigger_synonym",
        INDEX_SYNONYM: "index_synonym",
        
        TABLE_SYNONYM: "table_synonym",
        ROW_TABLE_SYNONYM: "row_table_synonym",
        COLUMN_TABLE_SYNONYM: "column_table_synonym",
        // VIRTUAL_TABLE_SYNONYM: "virtual_table_synonym",
        // EXTENDED_TABLE_SYNONYM: "extended_table_synonym",
        
        VIEW_SYNONYM: "view_synonym",
        ROW_VIEW_SYNONYM: "row_view_synonym",
        COLUMN_VIEW_SYNONYM: "column_view_synonym",
        // CALCULATED_VIEW_SYNONYM: "calculated_view_synonym",
        // HIERARCHY_VIEW_SYNONYM: "hierarchy_view_synonym",
        // JOIN_VIEW_SYNONYM: "join_view_synonym",
        // OLAP_VIEW_SYNONYM: "olap_view_synonym",
        
        // INDEX
        FULLTEXT_INDEX: "fulltext_index",
        B_INDEX: "b_index",
        
        // ROOT
        ROOT_CATALOG: "rootcatalog",
        ROOT_FAVORITE: "favorite",
        ROOT_SYNONYM: "rootsynonym",
        ROOT_PUBLIC_SYNONYM: "rootpublicsynonym",
        ROOT_FUNCTION: "rootfunction",
        ROOT_INDEX: "rootindex",
        ROOT_PROCEDURE: "rootprocedure",
        ROOT_SEQUENCE: "rootsequence",
        ROOT_TRIGGER: "roottrigger",
        ROOT_TABLE: "roottable",
        ROOT_TABLE_TYPE: "roottable_type",
        ROOT_VIEW: "rootview",
        ROOT_COLUMN_VIEW: "rootcolumn_view",
        
        DATA_PREVIEW: "data_preview",
        PARAM_CONTROL: "param_control",
        NON_DOCUMENT_CATEGORY: "non_document_category"
    };

    // The ROOT CATALOG NAME is built the combination of "&" + mNodeInfo.category + "%";
    // for example the Root Trigger = "&" + sap.hana.cst.CATALOG_CATEGORY.ROOT_TRIGGER + "%"
    sap.hana.cst.CATALOG_NAME = {
        ROOT_CATALOG: "&rootcatalog%",
        ROOT_FAVORITE: "&favorite%",
        ROOT_SYNONYM: "&rootsynonym%",
        ROOT_PUBLIC_SYNONYM: "&rootpublicsynonym%",
        ROOT_FUNCTION: "&rootfunction%",
        ROOT_INDEX: "&rootindex%",
        ROOT_PROCEDURE: "&rootprocedure%",
        ROOT_SEQUENCE: "&rootsequence%",
        ROOT_TABLE: "&roottable%",
        ROOT_TRIGGER: "&roottrigger%",
        ROOT_VIEW: "&rootview%",
        ROOT_TABLE_TYPE: "&roottable_type%",
        ROOT_COLUMN_VIEW: "&rootcolumn_view%",
        NEW_SEQUENCE: "&newsequence%",
        NEW_SYNONYM: "&newsynonym%",
        NEW_SQL: "*.sql",
        NODE_LOADING: "&node_loading%",
        // @HDI >>>
        NOT_SUPPORTED_SCHEMA: "&not_supported_schema%",
        NOT_SUPPORTED_SERVICE: "&not_supported_service%"
        // <<<
    };

    sap.hana.cst.CATALOG_DISPLAY_MODE = {
        METADATAVIEW: "metadataview",
        METADATAEDIT: "metadataedit",
        CONTENTVIEW: "contentview",
        CONTENTEDIT: "contentedit"
    };

}());