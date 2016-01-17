(function() {
    "use strict";

    // =======================================================================
    // import packages
    // =======================================================================    
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var SearchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.InA1SuggestionProvider');
    var InA1SuggestionProvider = sap.ushell.renderers.fiori2.search.suggestions.InA1SuggestionProvider;

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.InA2SuggestionProvider');
    var InA2SuggestionProvider = sap.ushell.renderers.fiori2.search.suggestions.InA2SuggestionProvider;

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.DataSourceSuggestionProvider');
    var DataSourceSuggestionProvider = sap.ushell.renderers.fiori2.search.suggestions.DataSourceSuggestionProvider;

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.AppSuggestionProvider');
    var AppSuggestionProvider = sap.ushell.renderers.fiori2.search.suggestions.AppSuggestionProvider;

    // =======================================================================
    // declare package
    // =======================================================================    
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.suggestions.SuggestionHandler');
    var suggestions = sap.ushell.renderers.fiori2.search.suggestions;

    // =======================================================================
    // suggestions handler
    // =======================================================================
    suggestions.SuggestionHandler = function() {
        this.init.apply(this, arguments);
    };

    suggestions.SuggestionHandler.prototype = {

        // init
        // ===================================================================
        init: function(params) {

            // members
            var that = this;
            that.model = params.model;
            that.sina = that.model.sina;
            that.suggestionProviders = [];

            // ina service suggestion provider - version 1
            that.inA1SuggestionProvider = new InA1SuggestionProvider({
                model: that.model,
                sina: that.sina,
                suggestionQuery: that.model.suggestionQuery
            });
            that.suggestionProviders.push(that.inA1SuggestionProvider);

            // ina service suggestion provider - version 2
            that.inA2SuggestionProvider = new InA2SuggestionProvider({
                model: that.model,
                sina: that.sina,
                suggestionQuery: that.model.suggestionQuery
            });
            that.suggestionProviders.push(that.inA2SuggestionProvider);

            // datasource suggestion provider
            that.dataSourceSuggestionProvider = new DataSourceSuggestionProvider({
                model: that.model,
                sina: that.sina
            });
            that.suggestionProviders.push(that.dataSourceSuggestionProvider);

            // apps suggestion provider
            that.appSuggestionProvider = new AppSuggestionProvider({
                model: that.model
            });
            that.suggestionProviders.push(that.appSuggestionProvider);

            // decorator for delayed suggestion execution, make delayed 400ms
            that.doSuggestionInternal = SearchHelper.delayedExecution(that.doSuggestionInternal, 400);

        },

        // abort suggestions
        // ===================================================================
        abortSuggestions: function(clearSuggestions) {
            if (clearSuggestions === undefined || clearSuggestions === true) {
                this.model.setProperty("/suggestions", []);
            }
            if (this.clearSuggestionTimer) {
                clearTimeout(this.clearSuggestionTimer);
                this.clearSuggestionTimer = null;
            }
            this.doSuggestionInternal.abort(); // abort time delayed calls
            this.getSuggestionProviders().done(function(suggestionProviders) {
                for (var i = 0; i < suggestionProviders.length; ++i) {
                    var suggestionProvider = suggestionProviders[i];
                    suggestionProvider.abortSuggestions();
                }
            });
        },

        // check whether server supports scope types
        // ===================================================================                        
        supportsScopeTypes: function(serverInfo) {
            for (var i = 0; i < serverInfo.rawServerInfo.Services.length; ++i) {
                var service = serverInfo.rawServerInfo.Services[i];
                if (service.Service === 'Suggestions2') {
                    for (var j = 0; j < service.Capabilities.length; ++j) {
                        var capability = service.Capabilities[j];
                        if (capability.Capability === 'ScopeTypes') {
                            return true;
                        }
                    }
                }
            }
            return false;
        },

        // get suggestion providers dependend on server capabilities
        // ===================================================================                
        getSuggestionProviders: function() {
            var that = this;
            if (that.suggestionProvidersDeferred) {
                return that.suggestionProvidersDeferred;
            }
            that.suggestionProvidersDeferred = that.sina.sinaSystem().getServerInfo().then(
                function(serverInfo) {
                    if (!serverInfo.rawServerInfo) {
                        return [that.appSuggestionProvider];
                    }
                    // 1. bo search is enabled
                    if (that.supportsScopeTypes(serverInfo)) {
                        // 1.1 new ina service
                        that.model.suggestionQuery.setOptions(['SynchronousRun',
                            'SuggestObjectData',
                            'SuggestDataSources',
                            'SuggestSearchHistory'
                        ]);
                        return [that.appSuggestionProvider, that.inA2SuggestionProvider];
                    } else {
                        // 1.2 old ina service
                        that.model.suggestionQuery.setOptions(['SynchronousRun',
                            'SuggestObjectData'
                        ]);
                        return [that.appSuggestionProvider, that.dataSourceSuggestionProvider,
                            that.inA1SuggestionProvider
                        ];
                    }
                },
                function() {
                    // 2. no bo search
                    return jQuery.when([that.appSuggestionProvider]);
                });
            return that.suggestionProvidersDeferred;
        },

        // check if suggestions are visible
        // ===================================================================                
        isSuggestionPopupVisible: function() {
            return jQuery('.searchBOSuggestion').filter(':visible').length > 0;
        },

        // do suggestions
        // ===================================================================        
        doSuggestion: function() {
            var that = this;
            if (this.isSuggestionPopupVisible()) {
                // 1. smooth update : old suggestions are cleared when new suggestion call returns
                this.abortSuggestions(false);
                // in case suggestion call needs to long:
                // clear old suggestions after 1sec
                this.clearSuggestionTimer = setTimeout(function() {
                    that.clearSuggestionTimer = null;
                    that.model.setProperty("/suggestions", []);
                }, 1000);
            } else {
                // 2. hard update : clear old suggestions immediately
                this.abortSuggestions();
            }
            this.doSuggestionInternal(); // time delayed
        },

        // do suggestion internal
        // ===================================================================        
        doSuggestionInternal: function() {
            /* eslint no-loop-func:0 */

            // don't suggest if there is no search term
            var that = this;
            var suggestionTerm = that.model.getProperty("/searchBoxTerm");
            if (suggestionTerm.length === 0) {
                return;
            }

            // no suggestions for *
            if (suggestionTerm.trim() === '*') {
                return;
            }

            // log suggestion request
            that.model.analytics.logCustomEvent('FLP: Search', 'Suggestion', [that.model.getProperty('/searchBoxTerm'),
                that.model.getProperty('/dataSource').key
            ]);

            // get suggestion providers
            that.getSuggestionProviders().done(function(suggestionProviders) {

                // get suggestions from all providers
                var first = true;
                var pending = suggestionProviders.length;
                for (var i = 0; i < suggestionProviders.length; ++i) {
                    var suggestionProvider = suggestionProviders[i];
                    suggestionProvider.getSuggestions().done(function(result) {
                        pending--;
                        if (pending > 0 && result.length === 0) {
                            return; // empty result -> return and don't update (flicker) suggestions on UI
                        }
                        if (that.clearSuggestionTimer) {
                            clearTimeout(that.clearSuggestionTimer);
                            that.clearSuggestionTimer = null;
                        }
                        that.insertSuggestions(result, first);
                        first = false;
                    });
                }

            });

        },

        // insert suggestions
        // ===================================================================        
        insertSuggestions: function(insertSuggestions, flagReplace) {
            var suggestions = this.model.getProperty('/suggestions');
            if (flagReplace) {
                suggestions = [];
            }
            var groups = this._groupByPosition(insertSuggestions);
            for (var position in groups) {
                var group = groups[position];
                this._insertSuggestions(suggestions, group);
            }
            this.model.setProperty('/suggestions', suggestions);
        },

        // group suggestions by position
        // ===================================================================        
        _groupByPosition: function(suggestions) {
            var groups = {};
            for (var i = 0; i < suggestions.length; ++i) {
                var suggestion = suggestions[i];
                var group = groups[suggestion.position];
                if (!group) {
                    group = [];
                    groups[suggestion.position] = group;
                }
                group.push(suggestion);
            }
            return groups;
        },

        // insert suggestions (with identical)
        // ===================================================================        
        _insertSuggestions: function(suggestions, insertSuggestions) {

            // get first suggestion to be inserted
            if (insertSuggestions.length <= 0) {
                return;
            }
            var insertSuggestion = insertSuggestions[0];

            // find insertion index
            var index = 0;
            for (; index < suggestions.length; ++index) {
                var suggestion = suggestions[index];
                if (suggestion.position > insertSuggestion.position) {
                    break;
                }
            }

            // insert
            var spliceArgs = [index, 0];
            spliceArgs.push.apply(spliceArgs, insertSuggestions);
            suggestions.splice.apply(suggestions, spliceArgs);

        }

    };


})();
