(function() {
    "use strict";

    // =======================================================================
    // import packages
    // =======================================================================
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.SuggestionProvider');
    var SuggestionProvider = sap.ushell.renderers.fiori2.search.suggestions.SuggestionProvider;

    // =======================================================================
    // declare package
    // =======================================================================
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.suggestions.InABaseSuggestionProvider');

    // =======================================================================
    // base class for ina based suggestion providers
    // =======================================================================
    var module = sap.ushell.renderers.fiori2.search.suggestions.InABaseSuggestionProvider = function() {
        this.init.apply(this, arguments);
    };

    module.prototype = jQuery.extend(new SuggestionProvider(), {

        // init
        // ===================================================================
        init: function() {
            // call super constructor
            SuggestionProvider.prototype.init.apply(this, arguments);
        },

        // split suggestion term
        // ===================================================================        
        splitSuggestionTerm: function(term) {

            // split suggestions term into 
            // prefix = which is used as search term filter
            // suffix = which is actually used as thes suggestion term
            // split position is last space
            // reason:
            // document contains: "Sally Spring"
            // search input box: sally  s-> suggestion sally spring
            //                   spring s-> suggestion spring sally
            // last suggestion would not happend when just using
            // "spring s " as suggestion term            

            // check for last blank
            var splitPos = term.lastIndexOf(' ');
            if (splitPos < 0) {
                return {
                    searchTerm: null,
                    suggestionTerm: term
                };
            }

            // split search term
            var searchTerm = term.slice(0, splitPos);
            searchTerm = searchTerm.replace(/\s+$/, ""); // right trim
            if (searchTerm.length === 0) {
                return {
                    searchTerm: null,
                    suggestionTerm: term
                };
            }

            // split suggestion term
            var suggestionTerm = term.slice(splitPos);
            suggestionTerm = suggestionTerm.replace(/^\s+/, ""); // left trim
            if (suggestionTerm.length === 0) {
                return {
                    searchTerm: null,
                    suggestionTerm: term
                };
            }

            // return result
            return {
                searchTerm: searchTerm,
                suggestionTerm: suggestionTerm
            };

        },

        // regexp escaping
        // ===================================================================        
        escapeRegExp: function(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },

        // concatenate suggestion term
        // ===================================================================        
        concatenateSearchTerm: function(suggestions, splittedSuggestionTerm) {

            // reason: see splitSuggestionTerm       

            // no search term -> nothing to do
            var that = this;
            if (!splittedSuggestionTerm.searchTerm) {
                return;
            }

            // split search terms
            var searchTerms = jQuery.map(splittedSuggestionTerm.searchTerm.split(' '), function(term) {
                term = term.trim();
                return {
                    term: term,
                    regExp: new RegExp(that.escapeRegExp(term), 'i')
                };
            });

            // process all suggestions
            for (var i = 0; i < suggestions.length; ++i) {
                var suggestion = suggestions[i];

                // identify all search terms not included in suggestion
                var notFoundSearchTerms = [];
                for (var j = 0; j < searchTerms.length; ++j) {
                    var searchTerm = searchTerms[j];
                    if (!searchTerm.regExp.test(suggestion.labelRaw)) {
                        notFoundSearchTerms.push(searchTerm.term);
                    }
                }

                // prefix for suggestion = all search terms not included in suggestions
                var prefix = notFoundSearchTerms.join(' ');
                var prefixBold = jQuery.map(notFoundSearchTerms, function(term) {
                    /* eslint no-loop-func:0 */
                    return '<b>' + term + '</b>';
                }).join(' ');
                suggestion.label = prefixBold + ' ' + suggestion.label;
                suggestion.labelRaw = prefix + ' ' + suggestion.labelRaw;
            }
        }


    });

})();
