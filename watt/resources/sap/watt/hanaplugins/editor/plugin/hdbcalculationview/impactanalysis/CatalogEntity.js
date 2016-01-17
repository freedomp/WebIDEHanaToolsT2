/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/common/plugin/filesystem/document/FileFolderEntity"
    ],
    function(FileFolderEntity) {

        "use strict";

        var ALLOWED_CATALOG_EXTENSIONS = null;
        
        var CatalogEntity = function(oDocumentInfo) {
            if (!oDocumentInfo.type) {
                throw new Error("The 'type' not indicate as input in CatalogEntity");
            }
            // if (oDocumentInfo.type === "sql" && oDocumentInfo.name === sap.hana.ide.CATALOG_NAME.NEW_SQL) {
            ALLOWED_CATALOG_EXTENSIONS = oDocumentInfo.allowedFileExtensions;
            this._sCategory = null;
            this._sDisplayMode = null;
            this._oMetadata = null;
            this._sDAO = oDocumentInfo.DAO;
            this._sCurrentSchema = null;
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
                if (!this._sParentPath) {
                    var sParentPath = "";
                    // Note: do not use condition "if (oDocumentInfo.parentPath)"
                    if (oDocumentInfo.parentPath !== undefined && oDocumentInfo.parentPath !== null) {
                        sParentPath = oDocumentInfo.parentPath;
                    } else {
                      //  sParentPath = DocumentInfoHelper.buildParentPath(oDocumentInfo);
                        if (oDocumentInfo.name) {
		               	var index = oDocumentInfo.name.lastIndexOf("/");
		               	sParentPath = oDocumentInfo.name.substr(0, index);
		                   }
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
            getDAO : function() {
    			return this._sDAO;
    		},
            getFullPath: function() {
                if (this.isRoot()) {
                    return "";
                }
                var name = this.sanitizeHtmlId(this._sName);
                var sPath = this._sName;
                if (this._sParentPath){
                    if (this._sParentPath.lastIndexOf("/") === this._sParentPath.length - 1) {
                        sPath = this._sParentPath + name;
                    } else {
                        sPath = this._sParentPath + "/" + name;
                    }
                } else {
                    sPath = "/" + name;
                }
                return sPath;
            },
    		isValidHtmlId : function(sValue) {
    	        var regExp = new RegExp("^[a-zA-Z](\w|\:|\.|\-)*$", "gi");
    	        return regExp.test(sValue);
    	    },
    	    sanitizeHtmlId : function(sValue) {
    	        if (!this.isValidHtmlId(sValue)) {
    	            sValue = sValue.replace(/[^\w\:\-\.]/g, "_");
    	            sValue = sValue.replace(/{|}/g, "_");
    	            return sValue;
    	        } else {
    	            return sValue;
    	        }
    	    }


        });

        return CatalogEntity;
    });
