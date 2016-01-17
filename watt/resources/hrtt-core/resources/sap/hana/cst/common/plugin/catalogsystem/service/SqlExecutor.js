/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["../../../util/SqlUtil"],

    function(SqlUtil) {

        "use strict";

        return {

            _oDAO: null,
            
            _sCurrentSchema: "",
            
            _oParams: {},

            configure: function(mConfig) {
                this._oDAO = mConfig.dao;
            },
            
            //=========================================
            // Get current schema in every session
            //=========================================
            getCurrentSchema: function() {
                return this._sCurrentSchema;
            },
            
            //=========================================
            // Get params to store statement SET '<param_name>' = '<param_value>';
            //=========================================
            getParams: function() {
                return this._oParams;
            },

            setParams: function(oParams) {
                oParams = oParams || {};
                jQuery.extend(true, this._oParams, oParams);
            },

            removeParams: function(sParamName) {
                if (this._oParams[sParamName]) {
                    delete this._oParams[sParamName];
                }
            },

            //=========================================
            // Execute multiple SQL statements
            //=========================================
            execute: function(sContent, sServiceName, sCurrentSchema, oSettings, oParams) {
                return this._execute(sContent, sServiceName, sCurrentSchema, oParams, oSettings, false);
            },
            
            //=========================================
            // Prepare multiple SQL statements
            //=========================================
            prepare: function(sContent, sServiceName, sCurrentSchema, oSettings, oParams) {
                return this._execute(sContent, sServiceName, sCurrentSchema, oParams, oSettings, true);
            },

            _execute: function(sContent, sServiceName, sCurrentSchema, oParams, oSettings, bExecutePrepareStatement) {
                var that = this;
                var k;
                var aEntries = [];
                var oDeferred = Q.defer();
                var iStartMainStmt = 0;
                if (sContent && sContent.trim().length === 0) {
                    oDeferred.resolve({
                        type: null,
                        statement: null,
                        isSameStmt: false,
                        result: null
                    });
                    return oDeferred.promise;
                }
                
                // update params and schema
                jQuery.extend(true, oParams, that._oParams);
                that._sCurrentSchema = sCurrentSchema;
                that._sServiceName = sServiceName;

                // prepare the array of statements to request for execution
                var aStatements = [];

                if (!bExecutePrepareStatement) {
                    // set schema that is prepared before
                    aStatements.push({
                        statement: encodeURI("SET SCHEMA \"" + sCurrentSchema + "\""),
                        type: "UPDATE"
                    });
                    iStartMainStmt = 1;
                    
                    // set params that are prepared before
                    if (oParams) {
                        var iNumOfParams = Object.keys(oParams).length;
                        if (iNumOfParams > 0) {
                            var iCnt = 0;
                            for (var sParamName in oParams) {
                                if (oParams.hasOwnProperty(sParamName)) {
                                    var sParamValue = oParams[sParamName];
                                    if (sParamName && sParamValue) {
                                        aStatements.push({
                                            statement: encodeURI("SET '" + sParamName + "' = '" + sParamValue + "'"),
                                            type: "UPDATE"
                                        });
                                        iCnt++;
                                    }
                                }
                            }
                            // iStartMainStmt += iNumOfParams;
                            iStartMainStmt += iCnt;
                        }
                    }
                    
                    // parse content into array of statements
                    var aMainStatements = SqlUtil.prepareStatements(sContent);
                    aStatements = aStatements.concat(aMainStatements);
                    
                    // last statement to get final current schema
                    aStatements.push({
                        statement: encodeURI("SELECT CURRENT_SCHEMA FROM DUMMY"),
                        type: "SELECT"
                    });

                    that._oDAO.sqlMultiExecute(sServiceName, aStatements, oSettings,
                        function(oReturn, contentType, roundtripTime) {
                            var oEntry = null;
                            var oResponse = null;
                            var oResult = null;
                            var oNewParams = {};
                            var m = 0;

                            try {
                                if (oReturn.errorCode) {
                                    oEntry = {
                                        type: null,
                                        statement: null,
                                        schemaName: null,
                                        isSameStmt: false,
                                        result: null
                                    };
                                    oEntry.result = oReturn;
                                    return oDeferred.reject(oEntry);
                                }
                                
                                // skip the last statement
                                var length = oReturn.responses.length - 1;
                                if (oReturn.responses.length !== aStatements.length) {
                                    length = oReturn.responses.length;
                                }

                                // go through each response to get result that contains resultset
                                // one response corresponds to one statement
                                // skip prefix statements (set current schema, parameters) and postfix statement (get current statement);
                                for (k = iStartMainStmt; k < length; k++) {
                                    oResponse = oReturn.responses[k];
                                    oResult = oResponse.result;
                                    var type = oResponse.type;
                                    var schemaName = oResponse.schemaName;
                                    var statement = decodeURI(aStatements[k].statement);
                                    
                                    // error handler for each statement
                                    if (oResult.errorCode) {
                                        oEntry = {
                                            type: type,
                                            statement: statement,
                                            schemaName: null,
                                            isSameStmt: false,
                                            result: null
                                        };
                                        oEntry.result = oResult;
                                        aEntries.push(oEntry);

                                    } else {
                                        // 1. select statement
                                        if (type === "SELECT") {

                                            // PARAMETERS METADATA
                                            if (oResult.parametersMetadata) {
                                                oEntry = {
                                                    type: type,
                                                    statement: statement,
                                                    schemaName: schemaName,
                                                    isSameStmt: false,
                                                    result: null
                                                };
                                                oEntry.parametersMetadata = oResult.parametersMetadata;
                                                aEntries.push(oEntry);
                                            } else {
                                                // QUERY RESULT RETURN
                                                oEntry = {
                                                    type: type,
                                                    statement: statement,
                                                    schemaName: schemaName,
                                                    isSameStmt: false,
                                                    result: null
                                                };
                                                oEntry.result = oResult;
                                                oEntry.result.roundtripTime = roundtripTime;
                                                aEntries.push(oEntry);
                                            }
                                        
                                        // 2. call procedure statement
                                        } else if (type === "CALL") {
                                        
                                            // RESULTSET
                                            for (m = 0; m < oResult.resultSets.length; m++) {
                                                if (oResult.resultSets[m].metadata.length > 0) {
                                                    oEntry = {
                                                        type: type,
                                                        statement: statement,
                                                        schemaName: schemaName,
                                                        isSameStmt: false,
                                                        result: null
                                                    };
                                                    oEntry.result = oResult.resultSets[m];
                                                    oEntry.result.executeTime = oResult.executeTime;
                                                    oEntry.result.roundtripTime = roundtripTime;
                                                    oEntry.result.tableTypeOutputList = oResult.tableTypeOutputList;

                                                    // check if the same result set belongs to a single statement
                                                    if (m >= 1) {
                                                        oEntry.isSameStmt = true;
                                                    }
                                                    aEntries.push(oEntry);
                                                    // result.outputCount--;
                                                }
                                            }

                                            // SCALAR OUTPUT
                                            if (oResult.scalarOutputs.metadata.length > 0) {
                                                oEntry = {
                                                    type: type,
                                                    statement: statement,
                                                    schemaName: schemaName,
                                                    isSameStmt: false,
                                                    result: null
                                                };
                                                oEntry.result = oResult.scalarOutputs;
                                                oEntry.result.executeTime = oResult.executeTime;
                                                oEntry.result.roundtripTime = roundtripTime;
                                                oEntry.result.tableTypeOutputList = oResult.tableTypeOutputList;
                                                aEntries.push(oEntry);
                                            }

                                            if (oResult.resultSets.length === 1 &&
                                                oResult.resultSets[0].metadata.length === 0 &&
                                                oResult.scalarOutputs.metadata.length === 0) {
                                                oEntry = {
                                                    type: type,
                                                    statement: statement,
                                                    schemaName: schemaName,
                                                    isSameStmt: false,
                                                    result: null
                                                };

                                                oEntry.result = oResult.resultSets[0];
                                                oEntry.result.executeTime = oResult.executeTime;
                                                oEntry.result.roundtripTime = roundtripTime;
                                                oEntry.result.tableTypeOutputList = oResult.tableTypeOutputList;
                                                aEntries.push(oEntry);
                                            }

                                            // PARAMETERS METADATA
                                            if (oResult.parametersMetadata) {
                                                oEntry = {
                                                    type: type,
                                                    statement: statement,
                                                    schemaName: schemaName,
                                                    isSameStmt: false,
                                                    result: null
                                                };
                                                oEntry.parametersMetadata = oResult.parametersMetadata;
                                                aEntries.push(oEntry);
                                            }

                                        // 3. DDL statement 
                                        } else if (type === "UPDATE") {
                                            if (oResult.resultSets.length === 0) {
                                                // No result set
                                                oEntry = {
                                                    type: type,
                                                    schemaName: schemaName,
                                                    statement: statement,
                                                    isSameStmt: false,
                                                    result: null
                                                };
                                                oEntry.result = {};
                                                oEntry.result.executeTime = oResult.executeTime;
                                                oEntry.result.rowAffected = oResult.rowAffected;
                                                
                                                aEntries.push(oEntry);
                                            } else {
                                                // having result set
                                                for (m = 0; m < oResult.resultSets.length; m++) {
                                                    if (oResult.resultSets[m].metadata.length > 0) {
                                                        oEntry = {
                                                            type: type,
                                                            statement: statement,
                                                            schemaName: schemaName,
                                                            isSameStmt: false,
                                                            result: null
                                                        };
                                                        oEntry.result = oResult.resultSets[m];
                                                        oEntry.result.executeTime = oResult.executeTime;
                                                        oEntry.result.rowAffected = oResult.rowAffected;
    
                                                        // check if the same result set belongs to a single statement
                                                        if (m >= 1) {
                                                            oEntry.isSameStmt = true;
                                                        }
                                                        aEntries.push(oEntry);
                                                    }
                                                }
                                            }
                                            
                                            // parse to check if current statement is SET
                                            var oParam = SqlUtil.parseSetStmt(statement);
                                            if (oParam) {
                                                oNewParams[oParam.name] = oParam.value;
                                            }
                                        }
                                    } // end if
                                } // end for each response

                                // get the last response to update the current schema
                                var oLastResponse = oReturn.responses[oReturn.responses.length - 1];
                                if (oLastResponse && oLastResponse.result) {
                                    oResult = oLastResponse.result;
                                    if (oResult.errorCode) {
                                        oEntry = {
                                            type: oLastResponse.type,
                                            statement: aStatements[aStatements.length - 1],
                                            isSameStmt: false,
                                            result: null
                                        };
                                        oEntry.result = oResult;
                                        return oDeferred.reject(oEntry);

                                    } else if (oResult.entries) {
                                        that._sCurrentSchema = oResult.entries[0][0];
                                    }
                                }
                                
                                // update params
                                var iNumOfNewParams = Object.keys(oNewParams).length;
                                if (iNumOfNewParams) {
                                    jQuery.extend(true, that._oParams, oNewParams);
                                }

                                return oDeferred.resolve(aEntries);

                            } catch (e) {
                                // error handler for whole
                                oEntry = {
                                    type: null,
                                    statement: null,
                                    isSameStmt: false,
                                    result: null
                                };
                                oEntry.result = {
                                    errorCode: "404",
                                    message: e.message
                                };
                                return oDeferred.reject(oEntry);
                            }
                        }).done();
                
                    
                } else {
                    // parse content into array of statements
                    aStatements = SqlUtil.prepareStatements(sContent);
                    
                    this._oDAO.getPrepareStatementParameter(sServiceName, aStatements, function(oResult) {
                        if (oResult.errorCode) {
                            var oEntry = {
                                type: null,
                                statement: null,
                                isSameStmt: false,
                                result: null
                            };
                            oEntry.result = oResult;
                            return oDeferred.reject(oEntry);
                        } else {
                            // update service name and current schema
                            that._sServiceName = sServiceName;
                            that._sCurrentSchema = sCurrentSchema;

                            return oDeferred.resolve(oResult);
                        }
                    }).done();
                }

                return oDeferred.promise;
            },

            //=========================================
            // Execute single placeholder SQL statement with input parameters
            //=========================================
            executeWithInputParameters: function(sServiceName, oStmt, oInput, oSettings) {
                var aEntries = [];
                var oDeferred = Q.defer();
                var type = oStmt.type;
                var statement = decodeURI(oStmt.statement);

                if (this._oParams["DEBUG_TOKEN"]) {
                    oSettings.debugToken = this._oParams["DEBUG_TOKEN"];
                }
                
                this._oDAO.executeSqlWithInputParameters(sServiceName, oStmt, oInput, oSettings,
                    function(oResult, contentType, roundtripTime) {
                        var oEntry = null;
                        if (oResult.errorCode) {
                            oEntry = {
                                type: type,
                                statement: statement,
                                isSameStmt: false,
                                result: null
                            };
                            oEntry.result = oResult;
                            aEntries.push(oEntry);

                        } else {
                            if (type === "SELECT") {
                                oEntry = {
                                    type: type,
                                    statement: statement,
                                    isSameStmt: false,
                                    result: null
                                };
                                oEntry.result = oResult;
                                oEntry.result.executeTime = oResult.executeTime;
                                oEntry.result.roundtripTime = roundtripTime;
                                aEntries.push(oEntry);

                            } else if (type === "CALL") {
                                // RESULTSET
                                for (var m = 0; m < oResult.resultSets.length; m++) {
                                    if (oResult.resultSets[m].metadata.length > 0) {
                                        oEntry = {
                                            type: type,
                                            statement: statement,
                                            isSameStmt: false,
                                            result: null
                                        };
                                        oEntry.result = oResult.resultSets[m];
                                        oEntry.result.executeTime = oResult.executeTime;
                                        oEntry.result.roundtripTime = roundtripTime;
                                        oEntry.result.tableTypeOutputList = oResult.tableTypeOutputList;

                                        // check if the same result set belongs to a single statement
                                        if (m >= 1) {
                                            oEntry.isSameStmt = true;
                                        }
                                        aEntries.push(oEntry);
                                        // result.outputCount--;
                                    }
                                }

                                // SCALAR OUTPUT
                                if (oResult.scalarOutputs.metadata.length > 0) {
                                    oEntry = {
                                        type: type,
                                        statement: statement,
                                        isSameStmt: false,
                                        result: null
                                    };

                                    oEntry.result = oResult.scalarOutputs;
                                    oEntry.result.executeTime = oResult.executeTime;
                                    oEntry.result.roundtripTime = roundtripTime;
                                    oEntry.result.tableTypeOutputList = oResult.tableTypeOutputList;
                                    aEntries.push(oEntry);
                                }

                                if (oResult.resultSets.length === 1 &&
                                    oResult.resultSets[0].metadata.length === 0 &&
                                    oResult.scalarOutputs.metadata.length === 0) {
                                    oEntry = {
                                        type: type,
                                        statement: statement,
                                        isSameStmt: false,
                                        result: null
                                    };
                                    oEntry.result = oResult.resultSets[0];
                                    oEntry.result.executeTime = oResult.executeTime;
                                    oEntry.result.roundtripTime = roundtripTime;
                                    oEntry.result.tableTypeOutputList = oResult.tableTypeOutputList;
                                    aEntries.push(oEntry);
                                }

                            } else if (type === "UPDATE") {
                                oEntry = {
                                    type: type,
                                    statement: statement,
                                    isSameStmt: false,
                                    result: null
                                };
                                oEntry.result = oResult;
                                aEntries.push(oEntry);
                            }
                        }
                        oDeferred.resolve(aEntries);

                    }).done();

                return oDeferred.promise;
            }
        };
    });