(function() {
    "use strict";

    // =======================================================================
    // import packages
    // =======================================================================
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var SearchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.InABaseSuggestionProvider');
    var InABaseSuggestionProvider = sap.ushell.renderers.fiori2.search.suggestions.InABaseSuggestionProvider;

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.SuggestionTypes');
    var SuggestionTypes = sap.ushell.renderers.fiori2.search.suggestions.SuggestionTypes;

    // =======================================================================
    // declare package
    // =======================================================================
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.suggestions.InA2SuggestionProvider');

    // =======================================================================
    // helper for buffering suggestion terms
    // =======================================================================
    var SuggestionTermBuffer = function() {
        this.init.apply(this, arguments);
    };
    SuggestionTermBuffer.prototype = {

        init: function() {
            this.terms = {};
        },

        addTerm: function(term) {
            term = term.trim().toLowerCase();
            this.terms[term] = true;
        },

        hasTerm: function(term) {
            term = term.trim().toLowerCase();
            return !!this.terms[term];
        },

        reset: function() {
            this.terms = {};
        }

    };

    // =======================================================================
    // ina based suggestion provider - version 2 (new)
    // =======================================================================
    var module = sap.ushell.renderers.fiori2.search.suggestions.InA2SuggestionProvider = function() {
        this.init.apply(this, arguments);
    };

    module.prototype = jQuery.extend(new InABaseSuggestionProvider(), {

        suggestionLimit: jQuery.device.is.phone ? 5 : 7,

        // init
        // ===================================================================
        init: function(params) {
            // call super constructor
            InABaseSuggestionProvider.prototype.init.apply(this, arguments);
            // decorate getResultSet method for preventing request overtaking
            this.getResultSet = SearchHelper.refuseOutdatedRequests(this.getResultSet);

            this.dataSourceDeferred = null;
        },

        // abort suggestions
        // ===================================================================        
        abortSuggestions: function() {
            this.getResultSet.abort();
        },

        // get result set
        // =================================================================== 
        getResultSet: function() {
            return this.suggestionQuery.getResultSet();
        },

        // get suggestions
        // ===================================================================        
        getSuggestions: function() {

            // handle client side datasource-suggestions for all and apps
            var that = this;
            var suggestions = that.getAllAndAppSuggestions();

            // check that BO search is enabled
            if (!that.model.isBusinessObjSearchEnabled()) {
                return jQuery.when(suggestions);
            }

            // no server request for ds = apps
            if (that.model.getDataSource().equals(that.model.appDataSource)) {
                return jQuery.when(suggestions);
            }

            // prepare sina suggestion query
            var suggestionTerm = that.model.getProperty('/searchBoxTerm');
            var splittedSuggestionTerm = that.splitSuggestionTerm(suggestionTerm);
            that.suggestionQuery.clearSearchTerms();
            if (splittedSuggestionTerm.searchTerm) {
                that.suggestionQuery.addSearchTerm(splittedSuggestionTerm.searchTerm);
            }
            that.suggestionQuery.setSuggestionTerm(splittedSuggestionTerm.suggestionTerm);
            if (!that.suggestionQuery.getDataSource() ||
                !that.model.getProperty('/dataSource').equals(that.suggestionQuery.getDataSource())) {
                that.suggestionQuery.resetFilterConditions();
            }
            that.suggestionQuery.setDataSource(that.model.getProperty("/dataSource"));

            // fire sina suggestion query
            return that.getResultSet().then(function(resultset) {

                // concatenate searchterm + suggestion term                
                var sinaSuggestions = resultset.getElements();
                that.concatenateSearchTerm(sinaSuggestions, splittedSuggestionTerm);

                // assemble items from result set
                var formattedSuggestions = that.formatSinaSuggestions(sinaSuggestions);
                suggestions.push.apply(suggestions, formattedSuggestions);

                return suggestions;
            });

        },

        // client side suggestions for all and apps
        // ===================================================================                
        getAllAndAppSuggestions: function() {

            if (!this.model.getDataSource().equals(this.model.allDataSource)) {
                return [];
            }

            var dataSources = [];
            dataSources.unshift(this.model.appDataSource);
            dataSources.unshift(this.model.allDataSource);

            var dsSuggestions = [];
            var suggestionTerms = this.model.getProperty('/searchBoxTerm');
            // suggestion shall ignore stars
            var suggestionTermsIgnoreStar = suggestionTerms.replace(/\*/g, '');
            var oTester = new SearchHelper.Tester(suggestionTermsIgnoreStar);

            for (var i = 0; i < dataSources.length; ++i) {
                var dataSource = dataSources[i];
                if (dataSource.key === this.model.getDataSource().key) {
                    continue;
                }
                var oTestResult = oTester.test(dataSource.label);
                if (oTestResult.bMatch === true) {
                    var suggestion = {};
                    suggestion.label = '<i>' + sap.ushell.resources.i18n.getText("searchInPlaceholder",
                        oTestResult.sHighlightedText) + '</i>';
                    suggestion.labelRaw = '';
                    suggestion.dataSource = dataSource;
                    suggestion.type = SuggestionTypes.SUGGESTION_TYPE_DATASOURCE;
                    suggestion.position = SuggestionTypes.datasource.position;
                    dsSuggestions.push(suggestion);
                }
            }
            return dsSuggestions;
        },

        // add sina suggestions
        // ===================================================================                
        formatSinaSuggestions: function(sinaSuggestions) {

            // reset global fields
            this.suggestions = [];
            this.firstSuggestionTerm = null;
            this.numberObjectDataSuggestions = 0;
            this.numberDataSourceSuggestions = 0;
            this.numberHistorySuggestions = 0;
            this.suggestionTermBuffer = new SuggestionTermBuffer();

            // first: process datasource and object data suggestions
            this.formatSinaSuggestionsInternal(sinaSuggestions, ['DataSources', 'ObjectData']);

            // second: process historic suggestions 
            // reason: a suggestion term appearing twice 
            // (in object data + history suggestions)
            // shall appear only once in UI as a object data suggestion
            this.formatSinaSuggestionsInternal(sinaSuggestions, ['SearchHistory']);

            return this.suggestions;
        },

        // format sina suggestion 
        // ===================================================================                
        formatSinaSuggestionsInternal: function(sinaSuggestions, suggestionTypes) {

            for (var i = 0; i < sinaSuggestions.length; ++i) {
                var sinaSuggestion = sinaSuggestions[i];

                // process only selected suggestion types
                if (suggestionTypes.indexOf(sinaSuggestion.scope) < 0) {
                    continue;
                }

                // process suggestion
                switch (sinaSuggestion.scope) {
                    case 'DataSources':
                        this.formatDataSourceSuggestion(sinaSuggestion);
                        break;
                    case 'ObjectData':
                        this.formatObjectDataSuggestion(sinaSuggestion);
                        break;
                    case 'SearchHistory':
                        this.formatHistorySuggestion(sinaSuggestion);
                        break;
                    default:
                        break;
                }
            }

        },

        // format datasource suggestion
        // ===================================================================
        formatDataSourceSuggestion: function(sinaSuggestion) {
            if (!this.model.getDataSource().equals(this.model.allDataSource)) {
                return;
            }
            if (this.numberDataSourceSuggestions >= SuggestionTypes.datasource.limit) {
                return;
            }
            if (!sinaSuggestion.dataSource.equals(this.model.allDataSource)) {
                return;
            }

            if (!sinaSuggestion.labelRaw) {
                return;
            }
            this.numberDataSourceSuggestions++;
            this.suggestions.push({
                label: '<i>' + sap.ushell.resources.i18n.getText("searchInPlaceholder", sinaSuggestion.label) + '</i>',
                labelRaw: '',
                dataSource: sinaSuggestion.labelRaw,
                type: SuggestionTypes.SUGGESTION_TYPE_DATASOURCE,
                position: SuggestionTypes.datasource.position
            });
        },

        // format bo suggestion
        // ===================================================================                    
        formatObjectDataSuggestion: function(sinaSuggestion) {
            /* eslint no-lonely-if:0 */

            // check size limit
            if (this.numberObjectDataSuggestions >= SuggestionTypes.objectData.limit) {
                return;
            }

            // ignore suggestions on attribute level
            if (sinaSuggestion.attribute.value !== '$$AllAttributes$$') {
                return;
            }

            // save first suggestion term
            if (this.firstSuggestionTerm === null) {
                this.firstSuggestionTerm = sinaSuggestion.labelRaw;
            }

            if (sinaSuggestion.dataSource.equals(this.model.allDataSource) === true) {
                // 1. suggestion on all level 
                this.numberObjectDataSuggestions++;
                this.suggestionTermBuffer.addTerm(sinaSuggestion.labelRaw);

                var label;
                if (this.firstSuggestionTerm === sinaSuggestion.labelRaw &&
                    this.model.getDataSource().equals(this.model.allDataSource)) {
                    // only the first suggestion on all level is displayed with 'in all'
                    label = this.assembleSearchInSuggestionLabel(sinaSuggestion);
                } else {
                    // subsequent suggestions on all level are only displayed with suggestion term
                    label = sinaSuggestion.label;
                }

                this.suggestions.push({
                    label: label,
                    labelRaw: sinaSuggestion.labelRaw,
                    position: SuggestionTypes.objectData.position,
                    type: SuggestionTypes.SUGGESTION_TYPE_OBJECT_DATA,
                    dataSource: this.model.getDataSource()
                });

            } else {

                // 2. suggestion on datasource/connector level

                // sugestions on datasource level only for first suggestion term
                // if not first suggestion term -> return
                if (this.firstSuggestionTerm !== sinaSuggestion.labelRaw) {
                    return;
                }

                // suggestions on datasource level only for scope=all
                // scope!=all -> return
                if (!this.model.getDataSource().equals(this.model.allDataSource)) {
                    return;
                }

                // assemble suggestion
                this.numberObjectDataSuggestions++;
                this.suggestions.push({
                    label: this.assembleSearchInSuggestionLabel(sinaSuggestion),
                    labelRaw: sinaSuggestion.labelRaw,
                    position: SuggestionTypes.objectData.position,
                    type: SuggestionTypes.SUGGESTION_TYPE_OBJECT_DATA,
                    dataSource: sinaSuggestion.dataSource
                });

            }

        },

        // format history suggestion
        // ===================================================================                        
        formatHistorySuggestion: function(sinaSuggestion) {

            // check size limit
            if (this.numberHistorySuggestions >= SuggestionTypes.history.limit) {
                return;
            }

            // consider only suggestion on all level
            if (sinaSuggestion.dataSource.equals(this.model.allDataSource) !== true) {
                return;
            }

            // avoid duplicate suggestion terms
            if (this.suggestionTermBuffer.hasTerm(sinaSuggestion.labelRaw)) {
                return;
            }

            // assemble suggestion
            this.numberHistorySuggestions++;
            this.suggestions.push({
                label: sinaSuggestion.label,
                labelRaw: sinaSuggestion.labelRaw,
                position: SuggestionTypes.history.position,
                type: SuggestionTypes.SUGGESTION_TYPE_HISTORY,
                dataSource: this.model.getDataSource()
            });

        },

        // assemble search in suggestion label
        // ===================================================================                                
        assembleSearchInSuggestionLabel: function(sinaSuggestion) {
            return sinaSuggestion.label + ' <i>in ' + sinaSuggestion.dataSource.label + "</i>";
        }

    });

})();
