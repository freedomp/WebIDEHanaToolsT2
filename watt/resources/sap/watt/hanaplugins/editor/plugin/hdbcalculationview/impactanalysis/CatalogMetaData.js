/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([], function() {

    var CatalogMetadata = function(oEntity) {
        this._oEntity = oEntity;
    };

    CatalogMetadata.prototype = jQuery.extend(CatalogMetadata.prototype, {

        getType: function() {
            return this._oEntity.getType();
        },

        getCategory: function() {
            return this._oEntity.getCategory();
        },

        //---IS ROOT
        isRoot: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.ROOT);
        },

        isRootCatalog: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_CATALOG);
        },

        isRootProvisioning: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_PROVISIONING);
        },

        //@RM >>>
        isRootRemoteSource: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_REMOTE_SOURCES);
        },
        //<<<

        isSubRootCatalog: function() {
            return (this.isRootSynonym() || this.isRootFunction() ||
                this.isRootIndex() || this.isRootProcedure() ||
                this.isRootSequence() || this.isRootSynonym() || this.isRootTable() ||
                this.isRootTableType() || this.isRootTrigger() ||
                this.isRootView()) || this.isRootColumnView();
        },

        isRootPublicSynonym: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_PUBLIC_SYNONYM);
        },

        isRootSynonym: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_SYNONYM);
        },

        isRootFunction: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_FUNCTION);
        },

        isRootIndex: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_INDEX);
        },

        isRootProcedure: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_PROCEDURE);
        },

        isRootSequence: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_SEQUENCE);
        },

        isRootTable: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_TABLE);
        },

        isRootTableType: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_TABLE_TYPE);
        },

        isRootTrigger: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_TRIGGER);
        },

        isRootView: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_VIEW);
        },

        isRootColumnView: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROOT_COLUMN_VIEW);
        },

        //--IS MODE
        isMetaDataView: function() {
            return (this._oEntity.getDisplayMode() === sap.hana.ide.CATALOG_DISPLAY_MODE.METADATAVIEW);
        },

        isContentView: function() {
            return (this._oEntity.getDisplayMode() === sap.hana.ide.CATALOG_DISPLAY_MODE.CONTENTVIEW);
        },

        isContentEdit: function() {
            return (this._oEntity.getDisplayMode() === sap.hana.ide.CATALOG_DISPLAY_MODE.CONTENTEDIT);
        },

        //---SCHEMA
        isSchema: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.SCHEMA);
        },

        //---TABLE
        isTable: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.TABLE);
        },

        isTableType: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.TABLE_TYPE);
        },

        //---subType
        isRowTable: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROW_TABLE);
        },

        isColumnTable: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.COLUMN_TABLE);
        },

        isVirtualTable: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.VIRTUAL_TABLE);
        },

        isExtendedTable: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.EXTENDED_TABLE);
        },

        //---PROCEDURE
        isProcedure: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.PROCEDURE);
        },

        //---FUNCTION
        isFunction: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.FUNCTION);
        },

        //---INDEX
        isIndex: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.INDEX);
        },

        //---subType
        isFullIndex: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.FULLTEXT_INDEX);
        },

        isBIndex: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.B_INDEX);
        },

        //---SYNONYM
        isSynonym: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.SYNONYM);
        },

        isPublicSynonym: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.SYNONYM && this._oEntity.getCurrentSchema() === "PUBLIC");
        },

        //---subType
        isFunctionSynonym: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.FUNCTION_SYNONYM);
        },

        isProcedureSynonym: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.PROCEDURE_SYNONYM);
        },

        isIndexSynonym: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.INDEX_SYNONYM);
        },

        isSequenceSynonym: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.SEQUENCE_SYNONYM);
        },

        isTableSynonym: function() {
            return (this.isRowTableSynonym() || this.isColumnTableSynonym());
        },
        
        isRowTableSynonym: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROW_TABLE_SYNONYM);
        },
        
        isColumnTableSynonym: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.COLUMN_TABLE_SYNONYM);
        },

        isViewSynonym: function() {
            return (this.isRowViewSynonym() || this.isColumnViewSynonym());
        },
        
        isRowViewSynonym: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.ROW_VIEW_SYNONYM);
        },
        
        isColumnViewSynonym: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.COLUMN_VIEW_SYNONYM);
        },

        isTriggerSynonym: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.TRIGGER_SYNONYM);
        },
        
        //---
        isTrigger: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.TRIGGER);
        },

        isSequence: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.SEQUENCE);
        },

        //--VIEW
        isView: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.VIEW || 
                this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.COLUMN_VIEW ||
                this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.ROW_VIEW);
        },

        isRowView: function() {
            // litte confused for row_view, so row_view will be available in category and type temporarily
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.ROW_VIEW || 
                    this._oEntity.getCategory() === sap.hana.ide.CATALOG_TYPE.ROW_VIEW);
        },
        
        //--COLUMN VIEW
        isColumnView: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.COLUMN_VIEW);
        },

        isJoinView: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.JOIN_VIEW);
        },

        isCalculatedView: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.CALCULATED_VIEW);
        },

        isHierarchyView: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.HIERARCHY_VIEW);
        },

        isOlapView: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.OLAP_VIEW);
        },
        
        //--SQL TYPE
        isSql: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.SQL);
        },

        isSqlConsole: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.SQL_CONSOLE);
        },

        isSqlFile: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.SQL_FILE);
        },
        
        isSqlPrepare: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.SQL_PREPARE);
        },
        
        //--GENERAL TYPE
        isGeneral: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_CATEGORY.CATALOG);
        },
        
        isDataPreview: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.DATA_PREVIEW);
        },

        //--NEW
        isNew: function() {
            return this.isNewSequence() || this.isNewSynonym() || this.isNewRemoteSource(); //@RM
        },

        isNewSequence: function() {
            return (this._oEntity.getOriginalName() === sap.hana.ide.CATALOG_NAME.NEW_SEQUENCE);
        },

        isNewSynonym: function() {
            return (this._oEntity.getOriginalName() === sap.hana.ide.CATALOG_NAME.NEW_SYNONYM);
        },

        //@RM >>>
        isNewRemoteSource: function() {
            return (this._oEntity.getOriginalName() === sap.hana.ide.CATALOG_NAME.NEW_REMOTESOURCE);
        },
        
        isRemoteSourceRefreshObjectsSupported: function() {
            return (this._oEntity.getObject().isRefreshObjectsSupported);
        },

        isRemoteSource: function() {
            return (this._oEntity.getType() === sap.hana.ide.CATALOG_TYPE.REMOTESOURCE);
        },

        isRemoteFolder: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.REMOTEFOLDER);
        },

        isRemoteObject: function() {
            return (this._oEntity.getCategory() === sap.hana.ide.CATALOG_CATEGORY.REMOTEOBJECT);
        },

        isRemoteObjectImportable: function() {
            return (this._oEntity.getObject().isImportable === 1);
        }
        //<<<
    });

    return CatalogMetadata;
});
