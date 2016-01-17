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
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.suggestions.InA1SuggestionProvider');

    // =======================================================================
    // ina service based suggestion provider - version 1 (old)
    // =======================================================================
    var module = sap.ushell.renderers.fiori2.search.suggestions.InA1SuggestionProvider = function() {
        this.init.apply(this, arguments);
    };

    module.prototype = jQuery.extend(new InABaseSuggestionProvider(), {

        // init
        // ===================================================================
        init: function(params) {
            // call super constructor
            InABaseSuggestionProvider.prototype.init.apply(this, arguments);
            // decorate getResultSet method for preventing request overtaking
            this.getResultSet = SearchHelper.refuseOutdatedRequests(this.getResultSet);
        },

        // get result set
        // ===================================================================    
        getResultSet: function() {
            return this.suggestionQuery.getResultSet();
        },

        // abort suggestions
        // ===================================================================        
        abortSuggestions: function() {
            this.getResultSet.abort();
        },

        // get suggestions
        // ===================================================================        
        getSuggestions: function() {

            var that = this;

            // check that BO search is enabled
            if (!that.model.isBusinessObjSearchEnabled()) {
                return jQuery.when([]);
            }

            // no suggestions for ds = apps
            if (that.model.getDataSource().equals(that.model.appDataSource)) {
                return jQuery.when([]);
            }

            // check for minimum term length
            var suggestionTerm = that.model.getProperty('/searchBoxTerm');
            if (suggestionTerm.length < 3 && that.model.isAllCategory()) {
                return jQuery.when([]);
            }

            // prepare sina suggestion query
            var splittedSuggestionTerm = that.splitSuggestionTerm(suggestionTerm);
            that.suggestionQuery.clearSearchTerms();
            if (splittedSuggestionTerm.searchTerm) {
                that.suggestionQuery.addSearchTerm(splittedSuggestionTerm.searchTerm);
            }
            that.suggestionQuery.setSuggestionTerm(splittedSuggestionTerm.suggestionTerm);
            that.suggestionQuery.setDataSource(that.model.getProperty("/dataSource"));

            // fire sina suggestion query
            return that.getResultSet().then(function(resultset) {

                // concatenate searchterm + suggestion term                
                var sinaSuggestions = resultset.getElements();
                that.concatenateSearchTerm(sinaSuggestions, splittedSuggestionTerm);

                // assemble items from result set
                var normalSuggestions = that.assembleNormalSuggestionItems(sinaSuggestions,
                    suggestionTerm);

                // add datasource label to suggestions label
                for (var i = 0; i < normalSuggestions.length; i++) {
                    var normalSuggestion = normalSuggestions[i];
                    if (that.model.isAllCategory() && normalSuggestion.dataSourceLabel) {
                        normalSuggestion.label = normalSuggestion.label +
                            " <i>in " + normalSuggestion.dataSourceLabel + "</i>";
                    }
                }

                return normalSuggestions;

            });

        },

        // assemble suggetsion item
        // ===================================================================        
        assembleNormalSuggestionItems: function(suggestions, suggestionTerm) {

            /* eslint no-lonely-if:0 */

            // suggestions are returned on three levels, example:
            // term  connector  attribute count level
            // sally all        all       10    1
            // sally employee   all       5     2 
            // sally employee   firstname 4     3
            // sally employee   lastname  1     3
            // sally customer   all       5     2
            // sally customer   name      5     3

            var that = this;
            var resultSuggestions = [];
            for (var i = 0; i < suggestions.length; i++) {

                var suggestion = suggestions[i];

                var firstSuggestionTerm;
                if (i === 0) {
                    firstSuggestionTerm = suggestion.labelRaw;
                }

                // ignore all suggestions on attribute level
                if (suggestion.attribute.value !== "$$AllAttributes$$") {
                    continue;
                }

                if (that.model.isAllCategory()) {
                    // 1. category in dropdown = all
                    if (!suggestion.dataSource.equals(that.model.allDataSource)) {
                        // 1.2 suggestion on connector level
                        if (firstSuggestionTerm === suggestion.labelRaw) {
                            // first suggestion -> suggestion on connector level are allowed
                            suggestion.dataSourceLabel = suggestion.dataSource.getLabel();
                        } else {
                            // ignore suggestion on connector level
                            continue;
                        }
                    }
                } else {
                    // 2. category in dropdown = employee
                    if (suggestion.dataSource.equals(that.model.allDataSource) === true) {
                        // 2.1 suggestion on all level
                        suggestion.dataSource = that.model.getDataSource();
                        suggestion.dataSourceLabel = suggestion.dataSource.getLabel();
                    } else {
                        // 2.2 suggestion on connector level
                        continue;
                    }
                }

                // No client-side highlighting anymore!
                //suggestion.label = SearchHelper.highlight(suggestion.labelRaw, suggestionTerm);

                // fallback in case that label is blank
                if (jQuery.type(suggestion.label) === "string" && suggestion.label.length < 1) {
                    suggestion.label = suggestion.labelRaw;
                }

                suggestion.type = SuggestionTypes.SUGGESTION_TYPE_OBJECT_DATA;
                suggestion.position = SuggestionTypes.objectData.position;
                resultSuggestions.push(suggestion);

                if (SuggestionTypes.objectData.limit === resultSuggestions.length) {
                    break;
                }
            }
            return resultSuggestions;

        }

    });

})();
