/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([
    "./DbContent",
    "../parser/Semantics",
    "../template/Templates",
    "../template/KeywordTemplates",
    "../template/FunctionTemplates",
    "../template/SnippetTemplates",
    "../template/PlaceholderTemplates",
    "../template/MiscellaneousTemplates"
], function(DbContent, Semantics, Templates, KeywordTemplates, FunctionTemplates, SnippetTemplates, PlayholderTemplates, MiscellaneousTemplates) {

    "use strict";

    var ContentProvider = function() {
        this._oDbContent = null;
        this._oVariableTemplateContent = null;
        this._oAliasTemplateContent = null;
        this._oKeyWordTemplateContent = new Templates.TemplateContentAssist(KeywordTemplates.getKeywords());
        this._oFunctionTemplateContent = new Templates.TemplateContentAssist(null, FunctionTemplates.getFunctions());
        this._oSnippetTemplateContent = new Templates.TemplateContentAssist(null, SnippetTemplates.getSnippets());
        this._oDataTypeContent = new Templates.TemplateContentAssist(MiscellaneousTemplates.getDataTypes());
        this._oSchemaPrivilegeContent = new Templates.TemplateContentAssist(MiscellaneousTemplates.getSchemaPrivileges());
        this._oPlaceholderContent = new Templates.TemplateContentAssist(null, PlayholderTemplates.getPlaceholders());

    };

    ContentProvider.prototype = {
        
        buildAliasTemplateContent: function(aContents) {
            this._oAliasTemplateContent = new Templates.TemplateContentAssist(aContents);
            return this._oAliasTemplateContent;
        },
        
        getVariableTemplateContent: function(sContent) {
            var oSemantics = new Semantics(sContent);
            var aVariables = oSemantics.getVariables();
            this._oVariableTemplateContent = new Templates.TemplateContentAssist(aVariables);
            return this._oVariableTemplateContent;
        },

        getKeywordTemplateContent: function() {
            return this._oKeyWordTemplateContent;
        },

        getFunctionTemplateContent: function() {
            return this._oFunctionTemplateContent;
        },

        getSnippetTemplateContent: function() {
            return this._oSnippetTemplateContent;
        },

        getDataTypeContent: function() {
            return this._oDataTypeContent;
        },

        getSchemaPrivilegeContent: function() {
            return this._oSchemaPrivilegeContent;
        },

        getPlaceholderContent: function() {
            return this._oPlaceholderContent;
        },

        getDbContent: function(context) {
            this._oDbContent = new DbContent(context);
            return this._oDbContent;
        }
    };


    return {
        oContentProvider: null,

        getInstance: function() {
            if (this.oContentProvider === null) {
                this.oContentProvider = new ContentProvider();
            }
            return this.oContentProvider;
        }
    };
});