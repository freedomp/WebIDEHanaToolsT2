/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["./CatalogDocument", "../../../util/SqlUtil", "sap.watt.common.document/Document"],

    function(CatalogDocument, SqlUtil, Document) {

        var SqlExecutionDocument = CatalogDocument.extend("sap.hana.cst.catalog.plugin.catalogsystem.document.SqlExecutionDocument", {
            constructor: function(oOwner, oDAO, mEntity, oEventEmitter, context) {
                CatalogDocument.call(this, oOwner, oDAO, mEntity, oEventEmitter);

                this._mState.sETag = 1;
                this._sCurrentSelection = "";
                this._iCurrentRow = 0;
                this._iMaxResultSize = 1000;
                this._bIncludePosColumn = false;
                this._iLimitLOBColumnSize = 1024;
                this._bMeasurePerformance = false;
                this.context = context;
            }
        });

        SqlExecutionDocument.prototype = jQuery.extend(CatalogDocument.prototype, {

            //=========================================
            // Setter members
            //=========================================
            setCurrentRow: function(value) {
                this._iCurrentRow = value;
            },

            setCurrentSelection: function(value) {
                this._sCurrentSelection = value;
            },

            setMaxResultSize: function(value) {
                this._iMaxResultSize = value;
            },

            setLimitLOBColumnSize: function(value) {
                this._iLimitLOBColumnSize = value;
            },

            setMeasurePerformance: function(value) {
                this._bMeasurePerformance = value;
            },

            //=========================================
            // Getter members
            //=========================================
            getMeasurePerformance: function() {
                return this._bMeasurePerformance;
            },

            //=========================================
            // Execute SQL statement in current line
            //=========================================
            executeSqlInline: function() {
                var sCurrentSchema = this._mEntity.getCurrentSchema();
                var sServiceName = this._mEntity.getServiceName();
                var oParams = this._mEntity.getParams();
                var aLines = this._mContent.split("\n");
                var content;
                if (this._iCurrentRow >= 0 && this._iCurrentRow < aLines.length) {
                    // replace all line by white character except current line
                    for (var i = 0; i < aLines.length; i++) {
                        if (this._iCurrentRow !== i) {
                            aLines[i] = "";
                        }
                        content = aLines.join("\n");
                    }
                }
                return this._execute(content, sServiceName, sCurrentSchema, false, oParams, true);
            },

            //=========================================
            // Execute and Prepare SQL statement with the current data state
            //=========================================
            executeSql: function() {
                var sCurrentSchema = this._mEntity.getCurrentSchema();
                var sServiceName = this._mEntity.getServiceName();
                var oParams = this._mEntity.getParams();
                var content = this._sCurrentSelection;
                if (!content || content.length === 0) {
                    content = this._mContent;
                }
                return this._execute(content, sServiceName, sCurrentSchema, false, oParams, true);
            },

            prepareSql: function() {
                var sCurrentSchema = this._mEntity.getCurrentSchema();
                var sServiceName = this._mEntity.getServiceName();
                var oParams = this._mEntity.getParams();
                var content = this._sCurrentSelection;
                if (!content || content.length === 0) {
                    content = this._mContent;
                }
                return this._execute(content, sServiceName, sCurrentSchema, true, oParams, true);
            },

            //=========================================
            // Execute and Prepare SQL statement with the input data state (current schema, parameters)
            //=========================================
            execute: function(content, sServiceName, sCurrentSchema, aParams, bUpdateSchemaParams) {
                if (!content || !sCurrentSchema || !sServiceName) {
                    return Q(false);
                }
                return this._execute(content, sServiceName, sCurrentSchema, false, aParams, bUpdateSchemaParams);
            },

            prepare: function(content, sServiceName, sCurrentSchema, aParams, bUpdateSchemaParams) {
                if (!content || !sCurrentSchema || !sServiceName) {
                    return Q(false);
                }
                return this._execute(content, sServiceName, sCurrentSchema, true, aParams, bUpdateSchemaParams);
            },

            //=========================================
            // The private method to Execute and Prepare SQL statement
            //=========================================
            _execute: function(sContent, sServiceName, sCurrentSchema, bPrepareStatement, aParams, bUpdateSchemaParams) {
                bUpdateSchemaParams = bUpdateSchemaParams || false;
                var that = this;
                if (!sContent || !sCurrentSchema || !sServiceName) {
                    return Q(false);
                }

                var oSettings = {
                    maxResultSize: this._iMaxResultSize,
                    includePosColumn: true,
                    limitLOBColumnSize: this._iLimitLOBColumnSize,
                    measurePerformance: this._bMeasurePerformance
                };
                var oSqlExecutorService = this.context.service.sqlExecutor;
                if (bPrepareStatement === true) {
                    return oSqlExecutorService.prepare(sContent, sServiceName, sCurrentSchema, oSettings, aParams).then(function(oResult) {
                        if (bUpdateSchemaParams) {
                            return Q.all([oSqlExecutorService.getCurrentSchema(), oSqlExecutorService.getParams()]).spread(
                                function(sSchemaName, oUpdatedParams) {
                                    // inject schema
                                    that._mEntity.setCurrentSchema(sSchemaName);

                                    // inject params
                                    var oCloneParams = {};
                                    oUpdatedParams = oUpdatedParams || {};
                                    jQuery.extend(true, oCloneParams, oUpdatedParams);
                                    that._mEntity.setParams(oCloneParams);
                                    return oResult;
                                });
                        } else {
                            return oResult;
                        }
                    });
                } else {
                    return oSqlExecutorService.execute(sContent, sServiceName, sCurrentSchema, oSettings, aParams).then(function(oResult) {
                        if (bUpdateSchemaParams) {
                            return Q.all([oSqlExecutorService.getCurrentSchema(), oSqlExecutorService.getParams()]).spread(
                                function(sSchemaName, oUpdatedParams) {
                                    // inject schema
                                    that._mEntity.setCurrentSchema(sSchemaName);

                                    // inject params
                                    var oCloneParams = {};
                                    oUpdatedParams = oUpdatedParams || {};
                                    jQuery.extend(true, oCloneParams, oUpdatedParams);
                                    that._mEntity.setParams(oCloneParams);
                                    return oResult;
                                });
                        } else {
                            return oResult;
                        }
                    });
                }
            },

            //=========================================
            // Execute SQL statement with input parameters
            //=========================================
            executeSqlWithInputParameters: function(oStmt, oInputParams) {
                var sServiceName = this._mEntity.getServiceName();
                var oSettings = {
                    maxResultSize: this._iMaxResultSize,
                    includePosColumn: true,
                    limitLOBColumnSize: this._iLimitLOBColumnSize,
                    measurePerformance: this._bMeasurePerformance
                };
                return this.context.service.sqlExecutor.executeWithInputParameters(sServiceName, oStmt, oInputParams, oSettings);
            },

            //=========================================
            // Overwrite to flush content
            //=========================================
            _notApplyDirty: function() {
                var oMetadata = this.getDocumentMetadata();
                return oMetadata.isSqlConsole() ||
                    oMetadata.isTrigger() ||
                    oMetadata.isProcedure() ||
                    oMetadata.isFunction() ||
                    oMetadata.getCategory() === sap.hana.cst.CATALOG_CATEGORY.PARAM_CONTROL;
            },

            //=========================================
            // Set the dirty state for current document
            //=========================================
            setDirty: function(bDirty) {
                return this._setState({
                    bDirty: bDirty
                });
            },

            setContent: function(mContent, oSource) {
                var that = this;
                return this._ensureLoaded().then(function() {
                    if (that._mContent !== mContent) {
                        that._mContent = mContent;
                        var bDirty = (mContent === that._savedContent || that._notApplyDirty()) ? false : true;
                        //var bDirty = false;
                        return that._setState({
                            bDirty: bDirty
                        }).then(function() {
                            return that._oEventEmitter.fireChanged({
                                document: that,
                                changeType: "content",
                                options: {
                                    source: oSource
                                }
                            });
                        });
                    }
                });
            },

            // used in editor only
            copy: function(oTargetFolderDocument, sTargetName, bForce) {
                var that = this;
                return this._oDAO.copyObject(this, oTargetFolderDocument, sTargetName, bForce).then(function(oNewDocument) {
                    return oTargetFolderDocument.refresh(oNewDocument).then(function() {
                        return oNewDocument;
                    });
                });
            },

            // used in editor only
            move: function(oTargetParentFolderDocument, sTargetName) {
                var that = this;
                var sOldKeyString = this.getEntity().getKeyString();
                var _oParent;
                var _oRenamedDocument;
                return this.getParent().then(function(oParent) {
                    _oParent = oParent;
                    return that._oDAO.moveObject(that, oTargetParentFolderDocument, sTargetName);
                }).then(function(oRenamedDocument) {
                    _oRenamedDocument = oRenamedDocument;

                    return that._notifyAboutMove(oRenamedDocument);
                }).then(function() {
                    var mProms = [];
                    if (_oParent.getEntity().contains(oTargetParentFolderDocument.getEntity())) {
                        mProms.push(_oParent.refresh(_oRenamedDocument, that));
                    } else {
                        if (!oTargetParentFolderDocument.getEntity().contains(_oParent.getEntity())) {
                            mProms.push(oTargetParentFolderDocument.refresh(_oRenamedDocument));
                            mProms.push(_oParent.refresh(null, that));
                        } else {
                            mProms.push(oTargetParentFolderDocument.refresh(_oRenamedDocument, that));
                        }
                    }
                    return Q.all(mProms);
                }).then(function() {
                    return _oRenamedDocument;
                });
            },

            // used in editor only
            "delete": function() {
                var that = this;
                return this._oDAO.deleteFile(this).then(function() {
                    return that._setState({
                        bExists: false
                    });
                }).then(function() {
                    return that.getParent();
                }).then(function(oParent) {
                    return oParent.refresh(null, that);
                });
            },

            // required by repositorybrowser to perform refresh
            getParent: function() {
                return this._oDAO.getDocumentFromPath(this.getEntity().getParentPath());
            },

            needToReloadCheck: function() {
                return Document.prototype.needToReloadCheck.apply(this, arguments);
            }

        });
        return SqlExecutionDocument;
    });