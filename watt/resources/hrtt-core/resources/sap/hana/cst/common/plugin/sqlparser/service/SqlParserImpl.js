/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*global ace, performance*/
define(["../util/Formatter"],

    function(Formatter) {

        "use strict";
        var Range = ace.require('ace/range').Range;
        
        var ISqlParser = {

            parser: null,

            init: function() {
                var that = this,
                    oDeferred = Q.defer();

                require(["sap/hana/cst/common/lib/sqlparser/parser/sqlparser",
                        "sap/hana/cst/common/lib/sqlparser/tool-support/WorkerClient",
                        "sap/hana/cst/common/lib/sqlparser/tool-support/TokenTooltip"], 
                    function(sqlparser, worker, TokenTooltip){

                        that.makeParse = sqlparser.makeParse;
                        that.makeConfig = sqlparser.makeConfig;
                        worker.start({ moduleLoaderUrl: "/sap/watt/lib/requirejs/require.js" });
                        that.worker = worker;
                        that.TokenTooltip = TokenTooltip;

                        if (typeof performance === "undefined") {
                            that.perf = {
                                now: function() {
                                    return Date.now();
                                }
                            };
                        } else {
                            that.perf = performance;
                        }
                        that.resolved = {};
                        that.resolved.value = JSON.stringify({
                            "table": [{
                                "expand": true,
                                "kind": "table",
                                "name": "T",
                                "resolved": true,
                                "schema": "S",
                                "columns": [{
                                    "dataType": "INTEGER",
                                    "kind": "column",
                                    "name": "C",
                                    "resolved": true
                                }]
                            }]
                        }, undefined, 4);
                        return oDeferred.resolve();
                });
                return oDeferred.promise;
            },

            setSource: function(sQuery, oEditor, sPrefix, currentSchema, serviceName) {
                var that = this;
                this.init();
                this.worker.send("setSource", {
                    src: sQuery,
                    prefix: sPrefix,
                    currentSchema: currentSchema,
                    metadataUrl: "/sap/hana/cst/api/" + serviceName + "/catalog/metadata/sqlobjects"
                }, function(data) {
                    that.translateError(data.messages, oEditor);
                });
                return sQuery;
            },

            parse: function(sQuery, oEditor, sPrefix) {
                var that = this;
                this.init();
                this.worker.send("parse", {
                    src: sQuery,
                    prefix: sPrefix
                }, function(data) {
                    that.translateError(data.messages, oEditor);
                });
                return sQuery;
            },

            parseWithCallback: function(sQuery, fnCallback) {
                this.init();
                this.worker.parse(sQuery, fnCallback);
                return sQuery;
            },

            translateError: function(aMessages, oEditor) {
                var i, aMarkers, fromPos, toPos, sText, sType, sMarker, oSession, oDocument, aAnnotations = [];
                if (oEditor) {
                    oSession = oEditor.getSession();
                    oDocument = oSession.getDocument();
                    
                    aMarkers = Object.keys(oSession.getMarkers(true));
                    for (i = 0; i < aMarkers.length; i++) {
                        oSession.removeMarker(aMarkers[i]);
                    }

                    for (i = 0; i < aMessages.length; i++) {
                        fromPos = oDocument.indexToPosition(aMessages[i].fromPos);
                        toPos = oDocument.indexToPosition(aMessages[i].toPos);
                        sType = aMessages[i].type.toLowerCase();
                        sText = aMessages[i].type;
                        if (sType === "semanticerror") {
                            sType = "error";
                            sText = "Semantic Error";
                        }
                        sText += ": " + this.context.i18n.getText("i18n", aMessages[i].code, aMessages[i].params);
                        sMarker = oSession.addMarker(new Range(fromPos.row, fromPos.column, toPos.row, toPos.column), 
                            "acmark_error " + "errorType_" + sType, "line", true);
                        aAnnotations.push({
                            column: fromPos.column,
                            row: fromPos.row,
                            text: sText,
                            type: sType,
                            markerId: sMarker
                        });
                    }
                    oEditor.setAnnotations(aAnnotations);
                }
            },

            setTokenTooltip: function(oEditor, sPrefix) {
                var oNativeEditor = oEditor ? oEditor.getNativeEditor() : null;
                return oNativeEditor ? new this.TokenTooltip(oNativeEditor, this.worker, { useCtrlKey: true, prefix: sPrefix }) : null;
            },

            format: function(oEditor, sPrefix) {
                var sQuery = oEditor.getValue();
                this.init();
                this.worker.send("parse", {
                    src: sQuery,
                    prefix: sPrefix
                }, function(data) {
                    var formatter = new Formatter();
                    var sResult = formatter.formatQueries(sQuery, data);
                    if (oEditor && oEditor.setDocValue) {
                        if (sPrefix) {
                            sResult = sResult.replace(/^CREATE /g, "");
                        }
                        oEditor.setDocValue(sResult);
                    }
                });
                return sQuery;
            },

            formatWithCallback: function(sQuery, fnCallback, sPrefix) {
                this.init();
                this.worker.send("parse", {
                    src: sQuery,
                    prefix: sPrefix
                }, function(data) {
                    var formatter = new Formatter();
                    var sResult = formatter.formatQueries(sQuery, data);
                    
                    if (fnCallback) {
                        fnCallback(sResult);
                    }
                });
                return sQuery;
            },

            addFilterStm: function(sQuery, sWhereCls, fnCallback) {
                return this.worker.send("parse", {
                    src: sQuery
                }, function(data) {
                    var formatter = new Formatter();
                    var sResult = formatter.insertWhereClsIntoStm(data.statements[0], sWhereCls);
                    if (fnCallback) {
                        fnCallback(sResult);
                    }
                    return sResult;
                });
            },

            onDocumentChanged: function(oEvent){
                var that = this,
                    sPrefix, oEntity,
                    oDocument = oEvent.params.document;
                if (oDocument && (oDocument.getType() === "sql" || oDocument.getEntity().getFileExtension() === "hdbprocedure")) {
                    if (oDocument.iParserTimeOut) {
                        clearTimeout(oDocument.iParserTimeOut);
                    }
                    oDocument.iParserTimeOut = setTimeout(function() {
                        that.context.service.content.getCurrentEditor().then(function(oEditor) {
                            if (oEditor && oEditor.getUI5Editor) {
                                return oEditor.getUI5Editor().then(function(oUI5Editor) {
                                    if (oUI5Editor) {
                                        oEntity = oDocument.getEntity();
                                        sPrefix = oEntity.getFileExtension() === "hdbprocedure" ? "CREATE\n" : undefined;
                                        return that.setSource(oDocument._mContent, oUI5Editor, sPrefix, oEntity.getCurrentSchema(), oEntity.getServiceName());
                                    }
                                    return false;
                                });
                            }
                            return false;
                        }).done();
                    }, 500);
                }
            }
        };
        return ISqlParser;
    }
);