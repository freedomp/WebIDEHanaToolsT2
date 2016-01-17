/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["sap.watt.common.filesystem/document/FileFolderEntity",
        "../util/DocumentInfoHelper"
    ],
    function(FileFolderEntity, DocumentInfoHelper) {

        "use strict";

        var ALLOWED_CATALOG_EXTENSIONS = null;
        
        var CatalogEntity = function(oDocumentInfo) {
            if (!oDocumentInfo.type) {
                throw new Error("The 'type' not indicate as input in CatalogEntity");
            }
            // if (oDocumentInfo.type === "sql" && oDocumentInfo.name === sap.hana.cst.CATALOG_NAME.NEW_SQL) {
            if (oDocumentInfo.type === "sql" ){
                if(oDocumentInfo.name === sap.hana.cst.CATALOG_NAME.NEW_SQL) {
                    var duplicateName = true;
                    while (duplicateName) {
                        oDocumentInfo.name = "untitle" + CatalogEntity.prototype._iGeneratedId + ".sql";
                        CatalogEntity.prototype._iGeneratedId++;
                        duplicateName = CatalogEntity.prototype._aOpenedSqlFiles.indexOf(oDocumentInfo.name) >= 0;
                    }
                    CatalogEntity.prototype._aOpenedSqlFiles.push(oDocumentInfo.name);
                } else {
                    CatalogEntity.prototype._aOpenedSqlFiles.push(oDocumentInfo.name);
                }
            }
            ALLOWED_CATALOG_EXTENSIONS = oDocumentInfo.allowedFileExtensions;
            this._sCategory = null;
            this._sDisplayMode = null;
            this._oMetadata = null;
            this._sCurrentSchema = null;
            this._sServiceName = null;
            this._oSupplement = {};
            this._oParams = {};
            this[oDocumentInfo.type] = null;
            this._initAndUpdate(oDocumentInfo);
        };

        CatalogEntity.prototype = Object.create(FileFolderEntity.prototype);
        CatalogEntity.prototype.constructor = FileFolderEntity;

        CatalogEntity.prototype = jQuery.extend(CatalogEntity.prototype, {

            _iGeneratedId: 0,
            _aOpenedSqlFiles: [],

            _initAndUpdate: function(oDocumentInfo) {
                var sMsg = "";
                // extension
                if (oDocumentInfo.name && !this._hasExtension(oDocumentInfo.name)) { // not define extension in name
                    var sExt = "";
                    if (oDocumentInfo.type && oDocumentInfo.displayMode) {
                        sExt = oDocumentInfo.displayMode + "-" + oDocumentInfo.type;

                    } else if (oDocumentInfo.type && !oDocumentInfo.displayMode) {
                        sExt = oDocumentInfo.type;
                    }
                    if (!this._isValidExtension(sExt)) {
                        sMsg = "The extension '" + sExt + "' invalid in CatalogEntity";
                        throw new Error(sMsg);
                    }
                    oDocumentInfo.name += "." + sExt;
                }

                // current schema
                if (oDocumentInfo.currentSchema) {
                    this._sCurrentSchema = oDocumentInfo.currentSchema;
                }

                // current service Name
                if (oDocumentInfo.serviceName) {
                    this._sServiceName = oDocumentInfo.serviceName;
                }

                // * parentPath, no update. 
                if (!this._sParentPath) {
                    var sParentPath = "";
                    // Note: do not use condition "if (oDocumentInfo.parentPath)"
                    if (oDocumentInfo.parentPath !== undefined && oDocumentInfo.parentPath !== null) {
                        sParentPath = oDocumentInfo.parentPath;
                    } else {
                        sParentPath = DocumentInfoHelper.buildParentPath(oDocumentInfo);
                    }

                    // the parentPath not start with "/" so append it in the beginning
                    if (!jQuery.sap.startsWith(sParentPath, "/") ) {
                        sParentPath = "/" + sParentPath;
                    }
                    this._sParentPath = sParentPath;
                }

                // * type, no update
                if (oDocumentInfo.type && !this._sType) {
                    this._sType = oDocumentInfo.type;
                }

                // * name, no update
                if (oDocumentInfo.name && !this._sName) {
                    this._sName = oDocumentInfo.name;
                }               

                // category
                if (oDocumentInfo.category) {
                    this._sCategory = oDocumentInfo.category;
                } else {
                    this._sCategory = oDocumentInfo.type;
                }

                // displayMode
                if (oDocumentInfo.displayMode) {
                    this._sDisplayMode = oDocumentInfo.displayMode;
                }

                // supplement
                if (oDocumentInfo.supplement) {
                    // this._oSupplement = oDocumentInfo.supplement;
                    jQuery.extend(true, this._oSupplement, oDocumentInfo.supplement);
                }

                // content
                if (oDocumentInfo.content !== null && oDocumentInfo.content !== undefined) {
                    this[oDocumentInfo.type] = oDocumentInfo.content;
                }
            },

            // TODO will be removed
            update: function(oDocumentInfo) {
                this._initAndUpdate(oDocumentInfo);
            },

            // Supplement
            getSupplement: function() {
                return this._oSupplement;
            },

            setSupplement: function(oSupplement) {
                this._oSupplement = oSupplement;
            },

            isTextObject: function() {
                var oVal = this.getObject();
                return (typeof oVal === "string");
            },

            setMetadata: function(oMetadata) {
                this._oMetadata = oMetadata;
            },

            getCategory: function() {
                return this._sCategory;
            },

            getDisplayMode: function() {
                return this._sDisplayMode;
            },

            getTag: function() {
                return this.getParentPath() + "/" + this.getOriginalName();
            },

            // Object, Content
            getObject: function() {
                return this[this.getType()];
            },

            getContent: function() {
                return this.getObject();
            },

            setContent: function(oContent) {
                this[this.getType()] = oContent;
            },
            
            cleanUpContent: function() {
                delete this[this.getType()];
                this.setContent(null);
            },

            getOriginalName: function() {
                var sName = this.getName();
                if (sName) {
                    return sName.substring(0, sName.lastIndexOf("."));
                } 
                return "";
            },

            getCurrentSchema: function() {
                return this._sCurrentSchema;
            },

            setCurrentSchema: function(sValue) {
                this._sCurrentSchema = sValue;
            },

            getServiceName: function() {
                return this._sServiceName;
            },

            setServiceName: function(sValue) {
                this._sServiceName = sValue;
            },
            
            getParams: function() {
                return this._oParams;
            },

            setParams: function(oParams) {
                oParams = oParams || {};
                this._oParams = oParams;
            },

            getFileExtension: function() {
                var sExt = FileFolderEntity.prototype.getFileExtension.call(this);
                return sExt;
            },

            _isValidExtension: function(sExt) {
                return (jQuery.inArray(sExt, ALLOWED_CATALOG_EXTENSIONS) >= 0);
            },

            _hasExtension: function(sName) {
                if (sName) {
                    var aNames = sName.split(".");
                    if (aNames.length >= 2) {
                        var sLastWord = aNames[aNames.length - 1];
                        return (jQuery.inArray(sLastWord, ALLOWED_CATALOG_EXTENSIONS) >= 0);
                    } else {
                        return false;
                    }
                }
                return false;
            },

            getFullPath: function() {
                if (this.isRoot()) {
                    return "";
                }
                // var name = sap.hana.cst.sanitizeHtmlId(this._sName);
                var name = escape(this._sName);
                var sPath = "";
                if (this._sParentPath) {
                    if (this._sParentPath.lastIndexOf("/") === this._sParentPath.length - 1) {
                        sPath = this._sParentPath + name;
                    } else {
                        sPath = this._sParentPath + "/" + name;
                    }
                } else {
                    sPath = "/" + name;
                }
                return sPath;
            }
        });

        return CatalogEntity;
    });