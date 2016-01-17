/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["../document/CatalogEntity",
        "../document/CatalogMetadata",
        "sap/hana/cst/common/remote/Request",
        "../../../util/MetadataService",
        "../../../util/Utils"
    ],

    function(CatalogEntity, CatalogMetadata, Request, MetadataService, Utils) {

        "use strict";

        var REST_API_MODE = true; //this Flat is apply for getting metadata of column views

        var BASE_API_URL = "/sap/hana/cst/api";

        var CatalogDAO = {

            // delegate filesystem calls to the FS DAO incase we are running in the editor
            _fsDAO: null,

            configure: function(mConfig) {
                this._fsDAO = mConfig.filesystemDAO;
            },

            getRoot: function() {},

            // called by the editor (filesystem DAO) in case of .sql file found
            createEntityFromPath: function(sPath, oMetadata) {
                var that = this;
                var sExtension = "";
                var sParentPath = "";
                var sName = sPath;
                var index = sPath ? sPath.lastIndexOf(".") : -1;
                if (index > 0) {
                    sExtension = sPath.substr(index + 1);
                    sName = sPath.substr(0, index);
                }
                index = sName ? sName.lastIndexOf("/") : -1;
                if (index > 0) {
                    sParentPath = sName.substr(0, index);
                    sName = sName.substr(index + 1);
                }
                if (sExtension) {
                    sName = sName + "." + sExtension;
                }
                var oDocumentInfo = {
                    name: sName,
                    type: sap.hana.cst.CATALOG_TYPE.SQL,
                    category: sap.hana.cst.CATALOG_CATEGORY.SQL_FILE,
                    displayMode: sap.hana.cst.CATALOG_DISPLAY_MODE.CONTENTEDIT,
                    parentPath: sParentPath,
                    currentSchema: this._currentSchemaForEditor,
                    content: "",
                    allowedFileExtensions: ["sql"]
                };
                if (this._currentSchemaForEditor) {
                    oDocumentInfo.currentSchema = this._currentSchemaForEditor;
                    return Q(that._createEntity(oDocumentInfo, oMetadata));
                } else {
                    return this.getCurrentSchema().then(function(result) {
                        that._currentSchemaForEditor = result.schemaName;
                        oDocumentInfo.currentSchema = that._currentSchemaForEditor;
                        return that._createEntity(oDocumentInfo, oMetadata);
                    });
                }
            },

            // called by the editor (filesystem DAO) in case of .sql file found
            getDocumentFromPath: function(sPath) {
                var that = this;
                var sExtension = "";
                var index = sPath ? sPath.lastIndexOf(".") : -1;
                if (index > 0) {
                    sExtension = sPath.substr(index + 1);
                }
                if (sExtension === "sql") {
                    return this.createEntityFromPath(sPath).then(function(result) {
                        return that._getDocument(result.entity, result.metadata);
                    });
                } else {
                    return this.context.service.document.getDocumentByPath(sPath);
                }
            },

            _createEntity: function(oDocumentInfo, oExistingMetadata) {
                var oEntity = new CatalogEntity(oDocumentInfo);
                var oMetadata = jQuery.extend(new CatalogMetadata(oEntity), oExistingMetadata);
                oEntity.setMetadata(oMetadata);
                var oBackendData = {
                    location: "/sap/hana/xs/dt/base/file" + oEntity.getFullPath()
                };
                oEntity.setBackendData(oBackendData);
                return {
                    entity: oEntity,
                    metadata: oMetadata
                };
            },

            getDocument: function(oDocumentInfo) {
                var result = this._createEntity(oDocumentInfo);
                return this._getDocument(result.entity, result.metadata);
            },

            _getDocument: function(oEntity, oMetadata) {
                return this.context.service.document.getDocument(oEntity).then(function(oDocument) {
                    oDocument.setDocumentMetadata(oMetadata);
                    return oDocument;
                });
            },

            readFileMetadata: function(oDocument) {
                if (oDocument.getEntity().getCategory() === sap.hana.cst.CATALOG_CATEGORY.SQL_FILE) {
                    var sLocation = oDocument.getEntity().getBackendData().location;
                    var oDeferred = Q.defer();
                    Request.send(sLocation + "?parts=meta").then(function(oResult) {
                        // Orion does not set content type properly
                        if (jQuery.type(oResult) === "string") {
                            oResult = JSON.parse(oResult);
                        }
                        var oMetadata = {};
                        oMetadata.sETag = oResult.ETag;
                        oDeferred.resolve(oMetadata);
                    }, function(oError) {
                        // unexpected error
                        throw new Error("Unexpected error" + oError.message);
                    });
                    return oDeferred.promise;
                } else {
                    var oMetadata = {};
                    oMetadata.sETag = 1;
                    return Q(oMetadata);
                }
            },

            load: function(oDocument) {
                var sValue = "";
                var oEntity = oDocument.getEntity();
                var oMetadata = oDocument.getDocumentMetadata();
                var sServiceName = oEntity.getServiceName();

                var oContent, inputObject;
                if (oEntity.isTextObject()) {
                    if (this._isSQLFileOpenedInEditor(oDocument)) {
                        return this._fsDAO.load(oDocument);
                    } else {
                        return this.readFileMetadata(oDocument).then(function(oMetadata) {
                            return {
                                mContent: oEntity.getObject(),
                                sETag: oMetadata.sETag
                            };
                        });
                    }
                } else {
                    inputObject = {
                        schemaName: oEntity.getCurrentSchema(),
                        objectName: oEntity.getOriginalName()
                    };

                    oContent = oEntity.getObject();
                    if (oContent && oContent.definition) {
                        sValue = oContent.definition;
                        return {
                            mContent: sValue
                        };
                    } else if (!oMetadata.isSqlConsole() && !oMetadata.isNew()) {

                        return this.getObjectDefinition(sServiceName, inputObject.schemaName, inputObject.objectName).then(function(rs) {
                            if (rs.content) {
                                return {
                                    mContent: rs.content
                                };
                            } else if (rs.errorCode) {
                                var sError = "";
                                if (oMetadata.isProcedure()) {
                                    sError = "/*Error occurs when getting procedure's definition from server. \nDetails: " + rs.message + "*/";
                                } else if (oMetadata.isFunction()) {
                                    sError = "/*Error occurs when getting function's definition from server. \nDetails: " + rs.message + "*/";
                                } else if (oMetadata.isTrigger()) {
                                    sError = "/*Error occurs when getting trigger's definition from server. \nDetails: " + rs.message + "*/";
                                } else if (oMetadata.isView()) {
                                    sError = "/*Error occurs when getting view's definition from server. \nDetails: " + rs.message + "*/";
                                } else if (oMetadata.isColumnView()) {
                                    sError = "/*Error occurs when getting view's definition from server. \nDetails: " + rs.message + "*/";
                                }
                                return {
                                    mContent: sError
                                };
                            } else {
                                return {
                                    mContent: ""
                                };
                            }
                        });
                    } else {
                        return {
                            mContent: ""
                        };
                    }
                }
            },

            save: function(oDocument, oPayload, sFullFilePath) {
                /*
                // delegate to filesystem DAO if running in editor
                if (this._isSQLFileOpenedInEditor(oDocument)) {
                   return this._fsDAO.save(oDocument, oPayload);
                }

                var that = this;
                var DT_BASE = "/sap/hana/xs/dt/base/file/";
                // Check if inactive content was requested
                var lbInactiveSave = false;
                var lbSuppressSuccessMessage = false;
                if (sFullFilePath === undefined || sFullFilePath === null) {
                    sFullFilePath = [oDocument.getEntity().getParentPath(), oDocument.getEntity().getName()].join('/');
                }

                if (oPayload) {
                    if (oPayload.headers) {
                        if (oPayload.headers["SapBackPack"]) {
                            var loBackPack = JSON.parse(oPayload.headers["SapBackPack"]);
                            if (loBackPack.hasOwnProperty("Activate") && loBackPack["Activate"] === false) {
                                lbInactiveSave = true;
                            }
                        }
                    }
                    if (oPayload.hasOwnProperty("suppressSuccessMessage")) {
                        lbSuppressSuccessMessage = oPayload["suppressSuccessMessage"];
                    }
                }
                return oDocument.getContent().then(function(mContent) {
                    var mHeader = {
                        headers: {
                            "Content-Type": "text/plain;charset=UTF-8"
                        }
                    };
                    if (oPayload) {
                        if (oPayload.headers) {
                            for (var header in oPayload.headers) {
                                mHeader.headers[header] = oPayload.headers[header];
                            }
                        }
                    }

                    sap.hana.cst.showSpinner();
                    return Request.send(DT_BASE + sFullFilePath, "PUT", mHeader, mContent).then(function(oResult) {
                        //TODO Update backend data in entity?

                        //TODO Clarify who is responsible for updating metadata?
                        var lsURI = oDocument.getEntity().getFullPath();
                        if (jQuery.type(oResult) === "string") {
                            oResult = JSON.parse(oResult);
                        }
                        // var lbActivated;
                        // if (oResult.CheckResult.Operations) {
                        //     lbActivated = oResult.CheckResult.Operations.Activate;
                        // }
                        // if (lbActivated === true) {
                        //     that.context.service.repositorybrowser.markActivated(oDocument);
                        //     if (!lbSuppressSuccessMessage) {
                        //         that._logger.writeSuccessMessage("File " + lsURI + " saved & activated successfully.");
                        //     }
                        // } else {
                        //     that.context.service.repositorybrowser.markSaved(oDocument);
                        //     if (!lbSuppressSuccessMessage) {
                        //         that._logger.writeSuccessMessage("File " + lsURI + " saved successfully.");
                        //     }
                        //     if (lbInactiveSave === false) {
                        //         that._logger.writeErrorMessage("Error while activating " + lsURI + ":<br>" + oResult.CheckResult.error_msg);
                        //     }
                        // }
                        return oResult.ETag;
                    }, function(oError) { // Implement showing error here
                        that._goContext.service.log.error("Catalog File", "writing file " + oDocument.getEntity().getFullPath() +
                            " failed. Error: " + oError.responseJSON.CheckResult.error_msg, ["system"]);
                    }).fin(function() {
                        sap.hana.cst.hideSpinner();
                    }); //(sUri, sMethod, mOptions, oData)
                });
                */
                /*
                var mHeader = {
                    headers: {
                        "Content-Type": "text/plain;charset=UTF-8"
                    }
                };
                if(oPayload){
                    if(oPayload.headers){
                        for(var header in oPayload.headers){
                            mHeader.headers[header] = oPayload.headers[header];
                        }
                    }
                }
                
                return this._io.send(sLocation, "PUT", mHeader, oContents);
                */
            },

            //===================================
            // Error and Success Handler
            //===================================
            _onErrorHandler: function(caller, tunnel, result) {
                var sMsg = "";
                var sText = "";
                var iErrorCode = 404;
                if (result.responseJSON) {
                    var oError = result.responseJSON;
                    if (oError.errorCode && oError.message) {
                        this.context.service.log.error("Catalog", this.context.i18n.getText("txt_error") + oError.message, ["system"]).done();
                        return oError;
                    }
                }

                sMsg = "Request backend service not succeed.";

                if (result.responseText) {
                    if (Utils.isXML(result.responseText)) {
                        sText = result.statusText;
                    } else {
                        sText = result.responseText;
                    }
                } else if (result.statusText) {
                    sText = result.statusText;
                }
                sMsg = sMsg + " " + sText;

                if (result.status) {
                    iErrorCode = result.status;
                }

                result = {
                    errorCode: iErrorCode,
                    message: sMsg
                };

                if (caller) {
                    caller(result, tunnel);
                }
                return result;
            },

            _onSuccessHandler: function(caller, tunnel, result) {
                if (caller) {
                    caller(result, tunnel);
                }
                return result;
            },

            //===================================
            // Artifact Retrieval Methods
            //===================================
            getObjectDefinition: function(sServiceName, sSchemaName, oObjectName, caller, tunnel) {
                var that = this;
                var inputObject = {
                    schemaName: sSchemaName,
                    objectName: oObjectName
                };
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/objectcontent";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    that._onErrorHandler.bind(that, caller, tunnel));
            },

            getSynonyms: function(sServiceName, sSchemaName, oObject, limitSqlObject, offsetSqlObject, caller, tunnel) {
                var that = this;
                var inputObject = {};
                if (sSchemaName === null) {
                    sSchemaName = "PUBLIC";
                }

                inputObject.schemaName = sSchemaName;
                inputObject.object = oObject;
                inputObject.limitSqlObject = limitSqlObject;
                inputObject.offsetSqlObject = offsetSqlObject;

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/synonyms";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    that._onErrorHandler.bind(that, caller, tunnel));
            },

            getSchemas: function(sServiceName, bAllSchemas, object, limitSqlObject, offsetSqlObject, caller, tunnel) {
                var that = this;
                var inputObject = {};
                inputObject.allSchemas = bAllSchemas;
                inputObject.limitSqlObject = limitSqlObject;
                inputObject.offsetSqlObject = offsetSqlObject;
                inputObject.object = object;

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/schemas";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            checkExistingSchema: function(sServiceName, sSchemaName, bSensitive, caller, tunnel) {
                var inputObject = {
                    schemaName: sSchemaName,
                    sensitive: bSensitive
                };

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/checkexistingschema";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getCurrentSchema: function(sServiceName, caller, tunnel) {
                var that = this;
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/currentschema";
                return Request.send(sURL, "GET").then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    that._onErrorHandler.bind(that, caller, tunnel));
            },

            getFunctions: function(sServiceName, schemaName, object, limitSqlObject, offsetSqlObject, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.limitSqlObject = limitSqlObject;
                inputObject.offsetSqlObject = offsetSqlObject;
                inputObject.object = object;

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/functions";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getFunctionParameters: function(serviceName, schemaName, functionName, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.name = functionName;

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/functionparameters";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getRemoteFunctionParameters: function(sServiceName, inputObject, caller, tunnel) {
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/remotefunctionparameters";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getIndexes: function(serviceName, schemaName, object, limitSqlObject, offsetSqlObject, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.limitSqlObject = limitSqlObject;
                inputObject.offsetSqlObject = offsetSqlObject;
                inputObject.object = object;

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/indexes";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getTableIndexes: function(serviceName, schemaName, tableName, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.tableName = tableName;

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/tableindexes";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getIndex: function(serviceName, schemaName, tableName, indexName, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.tableName = tableName;
                if (indexName !== null) {
                    inputObject.name = indexName;
                } else {
                    inputObject.name = '%';
                }

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/index";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getProcedures: function(serviceName, schemaName, object, limitSqlObject, offsetSqlObject, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.limitSqlObject = limitSqlObject;
                inputObject.offsetSqlObject = offsetSqlObject;
                inputObject.object = object;
                
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/procedures";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            searchProcedures: function(sServiceName, sProcedureName, caller, tunnel) {
                var inputObject = {};
                inputObject.name = sProcedureName;

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/searchprocedures";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getProcedureParameters: function(serviceName, schemaName, procedureName, caller, tunnel) {
                var inputObject = {
                    schemaName: schemaName,
                    name: procedureName
                };

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/procedure";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getSequences: function(serviceName, schemaName, object, limitSqlObject, offsetSqlObject, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.limitSqlObject = limitSqlObject;
                inputObject.object = object;
                inputObject.offsetSqlObject = offsetSqlObject;
                
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/sequences";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getTables: function(serviceName, schemaName, object, isUserDefinedType, limitSqlObject, offsetSqlObject, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.limitSqlObject = limitSqlObject;
                inputObject.offsetSqlObject = offsetSqlObject;
                inputObject.object = object;
                inputObject.isUserDefinedType = isUserDefinedType;
                
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/tables";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getVirtualTableRemoteSourceInfo: function(sServiceName, schemaName, tableName, caller, tunnel) {
                var inputObject = {
                    schemaName: schemaName,
                    tableName: tableName
                };
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/virtualtableremotesourceinfo";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getVirtualTableProperties: function(sServiceName, inputObject, caller, tunnel) {
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/virtualtableproperties";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getTableMetadata: function(serviceName, schemaName, tableName, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.tableName = tableName;

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/tablemetadata";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getTriggers: function(serviceName, schemaName, object, limitSqlObject, offsetSqlObject, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.limitSqlObject = limitSqlObject;
                inputObject.offsetSqlObject = offsetSqlObject;
                inputObject.object = object;
                
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/triggers";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getViews: function(serviceName, schemaName, object, limitSqlObject, offsetSqlObject, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.limitSqlObject = limitSqlObject;
                inputObject.offsetSqlObject = offsetSqlObject;
                inputObject.object = object;

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/views";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getColumnViews: function(serviceName, schemaName, object, limitSqlObject, offsetSqlObject, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.limitSqlObject = limitSqlObject;
                inputObject.offsetSqlObject = offsetSqlObject;
                inputObject.object = object;
                
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/columnviews";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getViewMetadata: function(serviceName, schemaName, viewName, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.viewName = viewName;

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/viewmetadata";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getColumnViewParameters: function(serviceName, schemaName, viewName, caller, tunnel) {
                if (REST_API_MODE) {
                    return this._getColumnViewParametersByREST(serviceName, viewName);
                } else {
                    return this._getColumnViewParameters(serviceName, serviceName, schemaName, viewName, caller, tunnel);
                }
            },

            _getColumnViewParameters: function(sServiceName, schemaName, viewName, caller, tunnel) {
                var inputObject = {
                    schemaName: schemaName,
                    viewName: viewName
                };
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/columnviewparameters";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            _getColumnViewParametersByREST: function(serviceName, sObjectName) {
                var oDeferred = Q.defer();
                this._getMetadataOfViewByRESTAPI(serviceName, sObjectName,
                    function(oResponse) {
                        var result = {
                            params: []
                        };
                        var aParams = [];

                        // INLINE FUNCTIONS
                        var _sortObject = function(property) {
                            var sortOrder = 1;
                            if (property[0] === "-") {
                                sortOrder = -1;
                                property = property.substr(1);
                            }
                            return function(a, b) {
                                var iResult = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;

                                //concat data type and lenght to a string as NVARCHAR(100)
                                a['dataTypeName'] = a["length"] > 0 && a['dataTypeName'].indexOf("(") === -1 ? a["dataTypeName"] + ("(") + a["length"] + ")" : a["dataTypeName"];
                                return iResult * sortOrder;
                            };
                        };

                        var _getDistinct = function(aArray) {
                            var aUnique = {},
                                aOutputArray = [];
                            if (aArray && aArray.length > 0) {
                                $.each(aArray, function(index, oItem) {
                                    // set default value to from value.
                                    if (oItem.defaultValue && oItem.defaultValue.trim() !== "") {
                                        oItem.fromVal = oItem.defaultValue;
                                    }
                                    if (!aUnique[oItem.name]) {
                                        aOutputArray.push(oItem);
                                        aUnique[oItem.name] = oItem;
                                    }
                                });
                            }
                            return aOutputArray;
                        };
                        // END - INLINE FUNCTIONS

                        if (oResponse.Message && oResponse.HttpCode && !oResponse.metadata) {
                            result = {
                                message: oResponse.Message,
                                errorCode: oResponse.HttpCode
                            };
                        } else {
                            aParams = oResponse.metadata[0].parameters;
                            result.params = aParams || [];

                            //get distinct paramters
                            result.params = _getDistinct(aParams);

                            //sort parameter by position
                            result.params.sort(_sortObject("position"));
                        }
                        return oDeferred.resolve(result);
                    },
                    function(oResponse) {
                        return oDeferred.reject(oResponse);
                    });
                return oDeferred.promise;
            },

            searchObjectsWithAttribute: function(sServiceName, sSearchValue, sSchemaName, sObjectName, sAttributeName, aMandatoryParams, caller, tunnel) {
                var inputObject = {
                    searchValue: sSearchValue,
                    schemaName: sSchemaName,
                    objectName: sObjectName,
                    attributeName: sAttributeName,
                    mandatoryParameters: aMandatoryParams
                };
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/searchobjectswithattribute";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getUnitOfMeasure: function(sServiceName, sObjectName, maxResult, caller, tunnel) {
                var inputObject = {
                    objectName: sObjectName,
                    maxEntries: maxResult
                };
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/unitofmeasure";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getCurrency: function(sServiceName, sObjectName, maxResult, caller, tunnel) {
                var inputObject = {
                    objectName: sObjectName,
                    maxEntries: maxResult
                };
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/currency";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            searchObjectsInStaticList: function(sServiceName, sSearchValue, sObjectName, sVariableName, maxResult, caller, tunnel) {
                var inputObject = {
                    searchValue: sSearchValue,
                    objectName: sObjectName,
                    variableName: sVariableName,
                    maxEntries: maxResult
                };
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/objectsinstaticlist";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getMandatoryParameters: function(serviceName, sObjectName, caller, tunnel) {
                if (REST_API_MODE) {
                    return this._getMandatoryParametersByREST(serviceName, sObjectName);
                } else {
                    return this._getMandatoryParameters(serviceName, sObjectName, caller, tunnel);
                }
            },

            _getMandatoryParametersByREST: function(serviceName, sObjectName) {
                var oDeferred = Q.defer();
                this._getMetadataOfViewByRESTAPI(serviceName, sObjectName,
                    function(oResponse) {
                        var result = {
                            params: []
                        };
                        var aParams = [];
                        if (oResponse.Message && oResponse.HttpCode && !oResponse.metadata) {
                            result = {
                                message: oResponse.Message,
                                errorCode: oResponse.HttpCode
                            };
                        } else {
                            aParams = oResponse.metadata[0].parameters;
                            aParams = aParams || [];
                            for (var i = 0; i < aParams.length; i++) {
                                var oParam = aParams[i];
                                if (oParam && oParam.isMandatory) {
                                    result.params.push(oParam);
                                }
                            }
                        }
                        return oDeferred.resolve(result);
                    },
                    function(oResponse) {
                        return oDeferred.reject(oResponse);
                    });
                return oDeferred.promise;
            },

            _getMandatoryParameters: function(sServiceName, sObjectName, caller, tunnel) {
                var inputObject = {
                    objectName: sObjectName
                };
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/mandatoryparameters";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            _getMetadataOfViewByRESTAPI: function(serviceName, viewName, fnSuccess, fnError) {
                var subType,
                    packageName,
                    aViewName,
                    objectName,
                    MAIN_MODE = "DT",
                    MAIN_TYPE = "VIEW";

                aViewName = viewName.split("/");
                packageName = aViewName[0];
                objectName = aViewName[1];
                if (aViewName.length < 2) {
                    objectName = aViewName[0];
                }

                var schemaName = "%";
                this.getColumnViews(serviceName, schemaName, viewName).then(function(oResult) {
                    var oResponse = {};
                    if (oResult && oResult.errorCode) {
                        oResponse.Message = oResult.errorCode;
                        oResponse.HttpCode = oResult.message;
                        return fnSuccess(oResponse);
                    }
                    if (oResult && oResult.columnViews && oResult.columnViews.length > 0) {
                        var oView = oResult.columnViews[0];
                        var sViewType = oView.viewType;
                        switch (sViewType) {
                            case "CALC":
                                subType = "CALCULATIONVIEW";
                                break;
                            case "OLAP":
                                subType = "ANALYTICVIEW";
                                break;
                            case "JOIN":
                                subType = "ATTRIBUTEVIEW";
                                break;
                        }
                        var metadataDetailService = MetadataService.MetadataDetails;
						metadataDetailService.getDetailsNew(oView.viewName, serviceName, fnSuccess, fnError);
                    }
                }).done();
            },

            _searchColumnViewMetadata: function(searchStr, fnSuccess) {
                var runtimeContext = {
                    "mode": [{
                        "main": "RT"
                    }],
                    "type": [{
                        "main": "VIEW"
                    }]
                };
                var designtimeContext = {
                    "mode": [{
                        "main": "DT"
                    }],
                    "type": [{
                        "main": "VIEW",
                        "sub": "ATTRIBUTEVIEW"
                    }, {
                        "main": "VIEW",
                        "sub": "ANALYTICVIEW"
                    }, {
                        "main": "VIEW",
                        "sub": "CALCULATIONVIEW"
                    }]
                };
                var context = new Array(designtimeContext, runtimeContext);
                var metadataDetailService = MetadataService.searchService;
                var searchMode = 'PATTERN',
                    maxResult = 500,
                    isFullNameSearch = true,
                    isSynonymSearch = false,
                    isCaseInsensitiveSearch = true;

                metadataDetailService.searchNew(searchStr, searchMode, maxResult, isFullNameSearch, isSynonymSearch, isCaseInsensitiveSearch, fnSuccess, function(jqXHR, textStatus) {
                    var errorText = JSON.stringify(jqXHR);
                    console.error("Error in CatalogDAO._searchColumnViewMetadata(): " + errorText);
                }, context);
            },

            getSqlObjects: function(services, objectName, filterTypes, caller, tunnel) {
                var inputObject = {};
                inputObject.services = services; // in XSA: using array instead of one schema name
                inputObject.objectName = objectName;
                inputObject.filterTypes = filterTypes;
                inputObject.allTypes = ["TABLE", "VIEW", "SEQUENCE", "PROCEDURE", "FUNCTION", "TRIGGER", /*"REMOTE SOURCE",*/ "INDEX", "SYNONYM"];
                inputObject.maxEntries = 1000;

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/catalog/metadata/sqlobjects"; // find all services that are bound by current application 
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getObjectDependencies: function(serviceName, schemaName, objectName, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.objectName = objectName;

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/objectdependencies";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getColumnsOfTable: function(serviceName, schemaName, tableName, columnName, type, context, caller, tunnel) {
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.tableName = tableName;
                inputObject.columnName = columnName;
                inputObject.type = type;
                inputObject.context = context;

                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/tablecolumns";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getColumnsOfColumnView: function(serviceName, schemaName, viewName, caller, tunnel) {
                if (REST_API_MODE) {
                    return this._getColumnsOfColumnViewByREST(serviceName, viewName);
                } else {
                    return this._getColumnsOfColumnView(serviceName, schemaName, viewName, caller, tunnel);
                }
            },

            _getColumnsOfColumnView: function(sServiceName, schemaName, viewName, caller, tunnel) {
                var inputObject = {
                    schemaName: schemaName,
                    viewName: viewName
                };
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/columnsofcolumnview";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then( 
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            _getColumnsOfColumnViewByREST: function(serviceName, viewName) {
                var oDeferred = Q.defer();
                this._getMetadataOfViewByRESTAPI(serviceName, viewName,
                    function(oResponse) {
                        var result = {
                            columns: []
                        };
                        if (oResponse.Message && oResponse.HttpCode && !oResponse.metadata) {
                            result = {
                                message: oResponse.Message,
                                errorCode: oResponse.HttpCode
                            };
                        } else {
                            result.columns = oResponse.metadata[0].columns;
                        }
                        return oDeferred.resolve(result);
                    },
                    function(oResponse) {
                        return oDeferred.reject(oResponse);
                    });

                return oDeferred.promise;
            },

            //===================================
            // Create objects
            //===================================
            createSequence: function(serviceName, object, caller, tunnel) {
                var inputObject = object || {};

                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/createSequence";
                return Request.send(sURL, "POST", null, inputObject).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            createSynonym: function(serviceName, object, caller, tunnel) {
                var inputObject = object || {};

                var sURL = BASE_API_URL + "/" + serviceName + "/catalog/metadata/createSynonym";
                return Request.send(sURL, "POST", null, inputObject).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            //===================================
            // Sql Execution Methods
            //===================================
            sqlExecute: function(sServiceName, oStatement, oSettings, caller, tunnel) {
                oSettings = oSettings || {};
                if (oStatement && oStatement.statement) {
                    oStatement.statement = encodeURI(oStatement.statement);
                }

                var inputObject = {
                    statement: oStatement,
                    maxResultSize: oSettings.maxResultSize,
                    includePosColumn: oSettings.includePosColumn,
                    limitLOBColumnSize: oSettings.limitLOBColumnSize,
                    measurePerformance: oSettings.measurePerformance
                };
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/executeStatement/sqlExecute";
                return Request.send(sURL, "POST", null, inputObject).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            sqlMultiExecute: function(sServiceName, aStatements, oSettings, caller, tunnel) {
                oSettings = oSettings || {};
                var inputObject = {
                    statements: aStatements,
                    maxResultSize: oSettings.maxResultSize,
                    limitLOBColumnSize: oSettings.limitLOBColumnSize,
                    includePosColumn: oSettings.includePosColumn,
                    measurePerformance: oSettings.measurePerformance
                };

                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/executeStatement/sqlMultiExecute";
                return Request.send(sURL, "POST", null, inputObject).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            sqlExecuteWithLimitOffset: function(sServiceName, oStatement, oSettings, caller, tunnel) {
                if (!oSettings || oSettings === undefined || oSettings === null) {
                    oSettings = {};
                }

                var inputObject = {
                    statement: oStatement,
                    maxResultSize: oSettings.maxResultSize,
                    includePosColumn: oSettings.includePosColumn,
                    limitLOBColumnSize: oSettings.limitLOBColumnSize,
                    measurePerformance: oSettings.measurePerformance,
                    limit: oSettings.limit,
                    offset: oSettings.offset
                };

                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/executeStatement/sqlExecuteWithLimitOffset";
                return Request.send(sURL, "POST", null, inputObject).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, caller, tunnel));
            },

            executeSqlWithInputParameters: function(sServiceName, oStatement, aParameters, oSettings, caller, tunnel) {
                if (!oSettings || oSettings === undefined || oSettings === null) {
                    oSettings = {};
                }

                var inputObject = {
                    statement: oStatement,
                    parameter: aParameters,
                    maxResultSize: oSettings.maxResultSize,
                    limitLOBColumnSize: oSettings.limitLOBColumnSize,
                    includePosColumn: oSettings.includePosColumn,
                    measurePerformance: oSettings.measurePerformance,
                    debugToken: oSettings.debugToken
                };

                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/executeStatement/executeSqlWithInputParameters";
                return Request.send(sURL, "POST", null, inputObject).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getPrepareStatementParameter: function(sServiceName, aStatements, caller, tunnel) {
                var inputObject = {
                    statements: aStatements
                };
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/executeStatement/getPrepareStatementParameter";
                return Request.send(sURL, "POST", null, inputObject).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            updateTable: function(sServiceName, oInputObject, caller, tunnel) {
                if (!oInputObject || oInputObject === undefined || oInputObject === null) {
                    oInputObject = {};
                }

                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/executeStatement/updateTable";
                return Request.send(sURL, "POST", null, oInputObject).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            // getPrimaryKeyColumns: function(inputObject, caller, tunnel) {
            //     if (!inputObject || inputObject === undefined || inputObject === null) {
            //         inputObject = {};
            //     }
            //     var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/getprimarykeycolumns";            
            //     return Request.send(sURL, "GET", inputObject, function(result) {
            //         if (caller) {
            //             caller(result, tunnel);
            //         }
            //     });
            // },
            

            //===================================
            // Export and Import Methods
            //===================================
            importObject: function(sServiceName, inputObject, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/importobject";
                return Request.send(sURL, "POST", null, inputObject).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            importScanFromServer: function(sServiceName, sPath, caller, tunnel) {
                var inputObject = {
                    "path": sPath
                };
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/importscanfromserver";
                return Request.send(sURL, "POST", null, inputObject).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getSystemInfo: function(caller) {
                var sURL = BASE_API_URL + "/info";
                return Request.send(sURL, "GET");
            },

            exportObjectOnServer: function(sServiceName, inputObject, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/exportobjectonserver";
                return Request.send(sURL, "POST", null, inputObject).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            //@RM >>>
            getCurrentUser: function(sServiceName, inputObject, caller, tunnel) {
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/currentUser";
                return this.net.callBackendFunction(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            //===================================
            // Drop objects
            //===================================
            dropMultiObject: function(inputObject, caller, tunnel) {
                var sURL = BASE_API_URL + "/catalog/metadata/dropmultiobject";
                return Request.send(sURL, "POST", null, inputObject).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            dropObject: function(sServiceName, inputObject, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/metadata/dropobject";
                return Request.send(sURL, "POST", null, inputObject).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            getRemoteSourceConfig: function(sServiceName, remoteSourceName, caller, tunnel) {
                var inputObject = {
                    remoteSourceName: remoteSourceName
                };
                var sSapBackPack = JSON.stringify(inputObject);
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/remotesourceconfig";
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(
                    this._onSuccessHandler.bind(this, caller, tunnel),
                    this._onErrorHandler.bind(this, caller, tunnel));
            },

            //===================================
            // Methods for file system in Editor app
            //===================================
            copyObject: function() {
                return this._fsDAO.copyObject.apply(this._fsDAO, arguments);
            },

            moveObject: function() {
                return this._fsDAO.moveObject.apply(this._fsDAO, arguments);
            },

            deleteFile: function() {
                return this._fsDAO.deleteFile.apply(this._fsDAO, arguments);
            },

            rename: function() {
                return this._fsDAO.rename.apply(this._fsDAO, arguments);
            },

            _isSQLFileOpenedInEditor: function(oDocument) {
                return this._fsDAO && oDocument && oDocument.getEntity().getCategory() === sap.hana.cst.CATALOG_CATEGORY.SQL_FILE;
            }

        };
        return CatalogDAO;
    });