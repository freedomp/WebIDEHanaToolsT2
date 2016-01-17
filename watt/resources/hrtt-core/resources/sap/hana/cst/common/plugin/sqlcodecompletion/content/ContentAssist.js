/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([
    "./ContentProvider",
    "../parser/ParserAssist"
], function(ContentProvider, ParserAssist) {

    "use strict";

    var ContentAssist = function(context, sCurrentSchema, sCurrentService) {
        this._oParser = new ParserAssist(sCurrentSchema, sCurrentService, context);
        this._oDataTypeContent = ContentProvider.getInstance().getDataTypeContent();
        this._oKeywordTemplateContent = ContentProvider.getInstance().getKeywordTemplateContent();
        this._oFunctionTemplateContent = ContentProvider.getInstance().getFunctionTemplateContent();
        this._oSnippetTemplateContent = ContentProvider.getInstance().getSnippetTemplateContent();
        this._oSchemaPrivilegeContent = ContentProvider.getInstance().getSchemaPrivilegeContent();
        this._oPlaceholderContent = ContentProvider.getInstance().getPlaceholderContent();
        this._oAliasTemplateContent = null;
        this._oVariableTemplateContent = null;
        this._oDbContent = ContentProvider.getInstance().getDbContent(context);

        this._oContext = null;
    };

    ContentAssist.prototype = {

        _candidateAliasProposals: function() {
            var d = Q.defer();
            var proposals = this._oAliasTemplateContent.computeKeywordProposals(this._oContext.buffer,
                this._oContext.offset, this._oContext);
            d.resolve(proposals);
            return d.promise;
        },
        
        _candidateVariablesProposals: function() {
            var that = this;
            that._oVariableTemplateContent = ContentProvider.getInstance().getVariableTemplateContent(this._oContext.contextInPre.content);
            var d = Q.defer();
            var sPrefix = this._oContext.prefix;
            var proposals = this._oVariableTemplateContent.computeKeywordProposalsWithPrefixChar(":", sPrefix, this._oContext);
            d.resolve(proposals);
            return d.promise;
        },

        _candidateFunctionProposals: function() {
            var d = Q.defer();
            var proposals = this._oFunctionTemplateContent.computeTemplateProposals(this._oContext.buffer,
                this._oContext.offset, this._oContext);
            d.resolve(proposals);
            return d.promise;
        },

        _candidateSnippetProposals: function() {
            var d = Q.defer();
            if (!this._oContext.ignoreSnippetProposals) {
                var proposals = this._oSnippetTemplateContent.computeTemplateProposals(this._oContext.buffer,
                    this._oContext.offset, this._oContext);
                d.resolve(proposals);
            }
            return d.promise;
        },

        _candidatePlaceholderProposals: function() {
            var d = Q.defer();
            var proposals = this._oPlaceholderContent.computeTemplateProposals(this._oContext.buffer,
                this._oContext.offset, this._oContext);
            d.resolve(proposals);
            return d.promise;
        },

        _candidateKeywordProposals: function() {
            var d = Q.defer();
            if (!this._oContext.ignoreKeywordProposals) {
                var proposals = this._oKeywordTemplateContent.computeKeywordProposals(this._oContext.buffer,
                    this._oContext.offset, this._oContext);
                d.resolve(proposals);
            }
            return d.promise;
        },

        _candidateDataTypeProposals: function() {
            var d = Q.defer();
            var proposals = this._oDataTypeContent.computeKeywordProposals(this._oContext.buffer,
                this._oContext.offset, this._oContext);
            d.resolve(proposals);
            return d.promise;
        },

        /**
         * filter and sort the proposals as suggestions
         */
        filterAndSortProposals: function(proposalsObj) {
            var snippetcategory = this.category.XML_SNIPPET;
            proposalsObj.sort(function(a, b) {
                if ((a === undefined) || (b === undefined)) {
                    return 0;
                }

                if (a.description.toLowerCase() < b.description.toLowerCase()) {
                    return -1;
                } else if (a.description.toLowerCase() > b.description.toLowerCase()) {
                    return 1;
                } else {
                    if (a.category == snippetcategory) {
                        return 1;
                    } if (b.category == snippetcategory) {
                        return -1;
                    } else {
                        return 0;
                    }
                }
            });
            return proposalsObj;
        },

        /**
         * implements the content assist API
         */
        computeProposals: function(oContentStatus) {
            var promises = [];
            var that = this;

            return this._oParser.parse(oContentStatus).then(function(oContext) {
                var oSettings = {
                    matchAll: true
                };
                that._oContext = oContext;
                that._oAliasTemplateContent = ContentProvider.getInstance().buildAliasTemplateContent(oContext.selectableObjects);

                switch (oContext.contextInPre.name) {
                    case "create_public_synonym_for":
                    case "create_synonym_for":
                        //todo
                        promises = promises.concat(that._populateCommonProposals(oContext));
                        break;

                    case "rename_column":
                        //todo
                        promises = promises.concat(that._populateCommonProposals(oContext));
                        break;

                    case "drop_type":
                        promises.push(that._oDbContent.computeTableTypeSuggest(oContext, oSettings));
                        //promises.push(that._oDbContent.computeSchemaProposals(oContext));
                        promises = promises.concat(that._populateCommonProposals(oContext));
                        break;

                    case "select":
                        if (oContext.aliasName !== "") {
                            promises.push(that._oDbContent.computeColumnsOfTableSuggest(oContext));
                        } else {
                            if (oContext.schemaName === "%") {
                                promises.push(that._candidateAliasProposals());
                                promises.push(that._candidateVariablesProposals());
                                promises.push(that._oDbContent.computeColumnsSuggest(oContext));
                                promises.push(that._candidateFunctionProposals());
                                promises.push(that._oDbContent.computeFunctionSuggest(oContext, oSettings));
                                //promises.push(that._oDbContent.computeSchemaProposals(oContext));
                                promises.push(that._candidateSnippetProposals());
                                promises.push(that._candidateKeywordProposals());

                            } else if (oContext.schemaName !== "" && oContext.objectName === "") {
                                if (oContext.schemaName.toUpperCase() === "PUBLIC") {
                                    promises.push(that._oDbContent.computeSynonymSuggest(oContext, oSettings));
                                } else {
                                    // SELECT * FROM <schema-name>.<synonym-name>/<table-name>
                                    promises.push(that._oDbContent.computeTableViewSuggest(oContext, oSettings));
                                    // promises.push(that._oDbContent.computeSynonymSuggest(oContext));
                                   // promises.push(that._oDbContent.computeSchemaProposals(oContext));
                                }

                            } else if (oContext.schemaName !== "" && oContext.objectName !== "") {
                                promises.push(that._candidateFunctionProposals());
                                promises.push(that._oDbContent.computeFunctionSuggest(oContext, oSettings));
                                promises.push(that._candidateSnippetProposals());
                            }
                        }
                        break;
                    case "select_from_where":
                    case "select_from_join":
                    case "define_columns_in_select":
                    case "define_columns_in_select_from_where":
                    case "define_columns_in_select_from_join":
                        if (oContext.aliasName !== "") {
                            promises.push(that._oDbContent.computeColumnsOfTableSuggest(oContext));

                        } else {
                            if (oContext.schemaName === "%") {
                                promises.push(that._candidateAliasProposals());
                                promises.push(that._candidateVariablesProposals());
                                promises.push(that._oDbContent.computeColumnsSuggest(oContext));
                                promises.push(that._candidateFunctionProposals());
                                promises.push(that._oDbContent.computeFunctionSuggest(oContext, oSettings));
                                if (oContext.schemaName.toUpperCase() === "PUBLIC") {
                                    promises.push(that._oDbContent.computeSynonymSuggest(oContext));
                                } else {
                                    // SELECT * FROM <schema-name>.<synonym-name>/<table-name>
                                    promises.push(that._oDbContent.computeTableViewSuggest(oContext, oSettings));
                                    // promises.push(that._oDbContent.computeSynonymSuggest(oContext));
                                   // promises.push(that._oDbContent.computeSchemaProposals(oContext));
                                }
                               // promises.push(that._oDbContent.computeSchemaProposals(oContext));
                                promises.push(that._candidateSnippetProposals());
                                promises.push(that._candidateKeywordProposals());

                            } else if (oContext.schemaName !== "" && oContext.objectName === "") {
                                if (oContext.schemaName.toUpperCase() === "PUBLIC") {
                                    promises.push(that._oDbContent.computeSynonymSuggest(oContext, oSettings));
                                } else {
                                    // SELECT * FROM <schema-name>.<synonym-name>/<table-name>
                                    promises.push(that._oDbContent.computeTableViewSuggest(oContext, oSettings));
                                    // promises.push(that._oDbContent.computeSynonymSuggest(oContext));
                                   // promises.push(that._oDbContent.computeSchemaProposals(oContext));
                                }

                            } else if (oContext.schemaName !== "" && oContext.objectName !== "") {
                                promises.push(that._candidateFunctionProposals());
                                promises.push(that._oDbContent.computeFunctionSuggest(oContext, oSettings));
                                if (oContext.schemaName.toUpperCase() === "PUBLIC") {
                                    promises.push(that._oDbContent.computeSynonymSuggest(oContext, oSettings));
                                } else {
                                    // SELECT * FROM <schema-name>.<synonym-name>/<table-name>
                                    promises.push(that._oDbContent.computeTableViewSuggest(oContext, oSettings));
                                    // promises.push(that._oDbContent.computeSynonymSuggest(oContext));
                                    //promises.push(that._oDbContent.computeSchemaProposals(oContext));
                                }
                                promises.push(that._candidateSnippetProposals());
                            }
                        }
                        break;

                    case "load":
                    case "unload":
                    case "update":
                    case "upsert":
                    case "update_set_from":
                    case "select_from":
                    case "delete_from":
                    case "insert_into":
                    case "truncate_table":
                    case "drop_table":
                    case "drop_view":
                    case "create_trigger_on":
                    case "lock_table":
                    case "merge_delta_of":
                    case "rename_table":
                    case "define_table_in_select_from":
                         if (oContext.schemaName === "%") {
                            promises.push(that._candidateVariablesProposals());
                            // SELECT * FROM <schema-name>.<synonym-name>/<table-name>
                            promises.push(that._oDbContent.computeTableViewSuggest(oContext, oSettings));
                           // promises.push(that._oDbContent.computeSchemaProposals(oContext));
                            // promises.push(that._candidateFunctionProposals());
                            // promises.push(that._candidateKeywordProposals());
                             
                        } else if (oContext.schemaName.toUpperCase() === "PUBLIC") {
                            // SELECT * FROM PUBLIC.
                            promises.push(that._oDbContent.computeSynonymSuggest(oContext, oSettings));
                            
                        } else {
                            // SELECT * FROM <schema-name>.<synonym-name>/<table-name>
                            promises.push(that._oDbContent.computeTableViewSuggest(oContext, oSettings));
                        }
                        promises = promises.concat(that._populateCommonProposals(oContext));
                        break;

                    case "drop_function":
                        promises.push(that._oDbContent.computeFunctionSuggest(oContext, oSettings));
                       // promises.push(that._oDbContent.computeSchemaProposals(oContext));
                        promises = promises.concat(that._populateCommonProposals(oContext, {suggestBackendFunction: false}));
                        break;

                    case "call":
                        // CALL "PUBLIC".<procedure-name>
                        if (oContext.schemaName.toUpperCase() === "PUBLIC") {
                            promises.push(that._oDbContent.computeSynonymSuggest(oContext, oSettings));
                            
                        // CALL <schema-name>.<procedure-name>
                        } else {
                            promises.push(that._oDbContent.computeProcedureSuggest(oContext, oSettings));
                            // promises.push(that._oDbContent.computeSchemaProposals(oContext));
                        }
                        promises = promises.concat(that._populateCommonProposals(oContext));
                        break;
                    
                    case "create_procedure_()_default_schema":
                        //promises.push(that._oDbContent.computeSchemaProposals(oContext));
                        break;
                        
                    case "drop_procedure":
                    case "alter_procedure":
                        promises.push(that._oDbContent.computeProcedureSuggest(oContext, oSettings));
                        //promises.push(that._oDbContent.computeSchemaProposals(oContext));
                        promises = promises.concat(that._populateCommonProposals(oContext));
                        break;

                    case "drop_synonym":
                        promises.push(that._oDbContent.computeSynonymSuggest(oContext, oSettings));
                        //promises.push(that._oDbContent.computeSchemaProposals(oContext));
                        promises = promises.concat(that._populateCommonProposals(oContext));
                        break;

                    case "drop_sequence":
                        promises.push(that._oDbContent.computeSequenceSuggest(oContext, oSettings));
                       // promises.push(that._oDbContent.computeSchemaProposals(oContext));
                        promises = promises.concat(that._populateCommonProposals(oContext));
                        break;

                    case "drop_trigger":
                        promises.push(that._oDbContent.computeTriggerSuggest(oContext, oSettings));
                      //  promises.push(that._oDbContent.computeSchemaProposals(oContext));
                        promises = promises.concat(that._populateCommonProposals(oContext));
                        break;

                    case "set_schema":
                    case "drop_schema":
                    case "grant_on_schema":
                    case "revoke_on_schema":
                    case "select_on_schema":
                       // promises.push(that._oDbContent.computeSchemaProposals(oContext));
                        promises = promises.concat(that._populateCommonProposals(oContext));
                        break;

                    case "drop_index":
                    case "rename_index":
                        // todo
                        promises = promises.concat(that._populateCommonProposals(oContext));
                        break;

                    case "drop_role":
                        //promises.push(that._oDbContent.computeRoleSuggest(oContext, oSettings));
                        promises = promises.concat(that._populateCommonProposals(oContext));
                        break;

                    case "connect":
                    case "drop_user":
                    case "alter_user":
                    case "create_credential_for_user":
                        //promises.push(that._oDbContent.computeUserSuggest(oContext, oSettings));
                        break;

                    case "grant":
                    case "revoke":
                    case "define_object_in_grant":
                    case "define_object_in_revoke":
                        // DROP, CREATE ANY, INSERT, SELECT, UPDATE, DELETE, EXECUTE, DEDUG, ALTER
                       // promises.push(that._oDbContent.computeObjectPrivilegeSuggest(oContext, oSettings));
                        // AUDIT AMDIN, BACK UP, INIFILE ADMIN
                       // promises.push(that._oDbContent.computeSystemPrivilegeSuggest(oContext, oSettings));
                        // ROLES
                        //promises.push(that._oDbContent.computeRoleSuggest(oContext, oSettings));
                        // _SYS_BI_CP_ALL
                        //promises.push(that._oDbContent.computeAnalyticalPrivielgeSuggest(oContext, oSettings));
                        break;

                    case "grant_on":
                    case "revoke_on":
                        promises.push(that._oDbContent.computeSqlObjectSuggest(oContext, oSettings));
                      //  promises.push(that._oDbContent.computeSchemaProposals(oContext));
                        break;

                    case "grant_on_schema_to":
                    case "grant_on_remote_source_to":
                    case "grant_on_to":
                    case "grant_to":
                    case "revoke_on_schema_from":
                    case "revoke_on_remote_source_from":
                    case "revoke_on_from":
                    case "revoke_from":
                      //  promises.push(that._oDbContent.computeSecurityObjectSuggest(oContext, oSettings));
                        break;

                    case "alter_saml_provider":
                    case "drop_saml_provider":
                     //   promises.push(that._oDbContent.computeSAMLProviderSuggest(oContext, oSettings));
                        break;

                    default:
                        //========================
                        // define data type
                        //========================
                        if (jQuery.sap.startsWith(oContext.contextInPre.name, "define_datatype")) {
                            // avoid in case "SAP_XS_LM_PE"."sap
                            if (oContext.schemaName === "%") {
                                promises.push(that._candidateDataTypeProposals());
                            }
                            promises.push(that._oDbContent.computeTableTypeAndTableSuggest(oContext, {
                                matchAll: true
                            }));
                           // promises.push(that._oDbContent.computeSchemaProposals(oContext));

                            //========================
                            // define data table
                            //========================
                        } else if (jQuery.sap.startsWith(oContext.contextInPre.name, "define_table")) {
                            // SELECT * FROM PUBLIC.
                            if (oContext.schemaName.toUpperCase() === "PUBLIC") {
                                promises.push(that._oDbContent.computeSynonymSuggest(oContext, oSettings));
                            } else {
                                promises.push(that._candidateVariablesProposals());
                                // SELECT * FROM <schema-name>.<synonym-name>/<table-name>
                                promises.push(that._oDbContent.computeTableViewSuggest(oContext, oSettings));
                                // promises.push(that._oDbContent.computeSynonymSuggest(oContext));
                               // promises.push(that._oDbContent.computeSchemaProposals(oContext));
                                promises.push(that._candidateFunctionProposals());
                                promises.push(that._candidateKeywordProposals());
                            }

                            //========================
                            // NONE
                            //========================
                        } else {
                            switch (oContext.contextInPost.name) {
                                case "define_datatype_for_array":
                                case "define_datatype_for_array[]":
                                    promises.push(that._candidateDataTypeProposals());
                                    // break;   // do not indicate break here
                                default:
                                    if (oContext.schemaName !== '%') {
                                        promises.push(that._oDbContent.computeSqlObjectSuggest(oContext, oSettings));

                                    } else {
                                        promises.push(that._candidateVariablesProposals());
                                        promises.push(that._candidateSnippetProposals());
                                        promises.push(that._candidateKeywordProposals());
                                        promises.push(that._candidateFunctionProposals());
                                        promises.push(that._candidatePlaceholderProposals());
                                        promises.push(that._oDbContent.computeFunctionSuggest(oContext, oSettings));
                                        //promises.push(that._oDbContent.computeSchemaProposals(oContext));
                                    }
                            }
                        }
                }

                return Q.all(promises).then(function(proposals) {
                    var oRet = {};
                    oRet.isValue = false;
                    oRet.proposals = [];
                    oRet.prefix = that._oContext.prefix;
                    if(proposals.errorCode){
                        return [];
                    }
                    // for (var i in proposals) {
                    for (var i = 0; i < proposals.length; i ++) {
                        if (proposals[i]) {
                            oRet.proposals = oRet.proposals.concat(proposals[i]);
                        }
                    }

                    return oRet;
                });
            });
        },
        
        _populateCommonProposals: function(oContext, settings) {
            settings = settings || {};
            settings.suggestBackendFunction = settings.suggestBackendFunction || true;
            var that = this;
            var promises = [];
            promises.push(that._candidateFunctionProposals());
            if (settings.suggestBackendFunction) {
                promises.push(that._oDbContent.computeFunctionSuggest(oContext));
            }
            promises.push(that._candidateKeywordProposals());
            return promises;
        }
        
    };
    return ContentAssist;
});