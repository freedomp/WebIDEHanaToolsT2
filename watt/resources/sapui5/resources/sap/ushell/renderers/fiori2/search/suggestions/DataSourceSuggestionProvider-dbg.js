(function() {
    "use strict";

    // =======================================================================
    // import packages
    // =======================================================================
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var SearchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.SuggestionProvider');
    var SuggestionProvider = sap.ushell.renderers.fiori2.search.suggestions.SuggestionProvider;

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.SuggestionTypes');
    var SuggestionTypes = sap.ushell.renderers.fiori2.search.suggestions.SuggestionTypes;

    // =======================================================================
    // declare package
    // =======================================================================
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.suggestions.DataSourceSuggestionProvider');

    // =======================================================================
    // data source suggestions provider
    // =======================================================================
    var module = sap.ushell.renderers.fiori2.search.suggestions.DataSourceSuggestionProvider = function() {
        this.init.apply(this, arguments);
    };

    module.prototype = jQuery.extend(new SuggestionProvider(), {

        init: function(params) {
            // call super constructor
            SuggestionProvider.prototype.init.apply(this, arguments);
            // decorate method for preventing request overtaking
            this.suggestDataSources = SearchHelper.refuseOutdatedRequests(this.suggestDataSources);
        },

        abortSuggestions: function() {
            this.suggestDataSources.abort();
        },

        getSuggestions: function() {

            // check that business object search is enabled
            if (!this.model.isBusinessObjSearchEnabled()) {
                return jQuery.when([]);
            }

            // suggestions only if datasource is all
            if (!this.model.getDataSource().equals(this.model.allDataSource)) {
                return jQuery.when([]);
            }

            // get suggestions
            return this.suggestDataSources();
        },

        suggestDataSources: function() {

            var that = this;

            return that.model.getServerDataSources().then(function(dataSources) {

                //add all and app DataSource so that it can also be suggested like server datasources       
                if (jQuery.inArray(that.model.appDataSource, dataSources) < 0) {
                    dataSources.unshift(that.model.appDataSource);
                }
                if (jQuery.inArray(that.model.allDataSource, dataSources) < 0) {
                    dataSources.unshift(that.model.allDataSource);
                }

                // check all data sources for matching
                // instantiate Tester with search terms
                var suggestionTerms = that.model.getProperty('/searchBoxTerm');
                // suggestion shall ignore stars
                var suggestionTermsIgnoreStar = suggestionTerms.replace(/\*/g, '');
                var oTester = new SearchHelper.Tester(suggestionTermsIgnoreStar);
                var oTestResult;
                var suggestion;
                var dsSuggestions = [];
                for (var i = 0; i < dataSources.length; ++i) {
                    var dataSource = dataSources[i];
                    if (dataSource.equals(that.model.getDataSource())) {
                        continue;
                    }
                    oTestResult = oTester.test(dataSource.label);

                    // match
                    if (oTestResult.bMatch === true) {
                        suggestion = {};
                        suggestion.label = '<i>' + sap.ushell.resources.i18n.getText("searchInPlaceholder",
                            oTestResult.sHighlightedText) + '</i>';
                        suggestion.labelRaw = '';
                        suggestion.dataSource = dataSource;
                        suggestion.type = SuggestionTypes.SUGGESTION_TYPE_DATASOURCE;
                        suggestion.position = SuggestionTypes.datasource.position;
                        dsSuggestions.push(suggestion);
                        if (dsSuggestions.length === SuggestionTypes.datasource.limit) {
                            break;
                        }
                    }
                }
                return dsSuggestions;
            });

        }

    });

})();
