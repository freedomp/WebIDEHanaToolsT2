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
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.suggestions.AppSuggestionProvider');

    // =======================================================================
    // apps suggestions provider
    // =======================================================================
    var module = sap.ushell.renderers.fiori2.search.suggestions.AppSuggestionProvider = function() {
        this.init.apply(this, arguments);
    };

    module.prototype = jQuery.extend(new SuggestionProvider(), {

        init: function(params) {
            // call super constructor
            SuggestionProvider.prototype.init.apply(this, arguments);
            // decorate suggestion methods (decorator prevents request overtaking)
            this.suggestApplications = SearchHelper.refuseOutdatedRequests(this.suggestApplications);
        },

        abortSuggestions: function() {
            this.suggestApplications.abort();
        },

        getSuggestions: function() {
            var that = this;

            // check that datasource is all or apps
            var dataSource = that.model.getDataSource();
            if (!dataSource.equals(that.model.allDataSource) &&
                !dataSource.equals(that.model.appDataSource)) {
                return jQuery.when([]);
            }

            // get suggestions
            var suggestionTerm = that.model.getProperty('/searchBoxTerm');
            return that.suggestApplications(suggestionTerm)
                .then(function(resultset) {
                    // search for duplicate app titles and combine them into one
                    var appSuggestions = resultset.getElements();
                    var appSuggestionsTitleDict = {};
                    for (var i = 0; i < appSuggestions.length; i++) {
                        if (appSuggestionsTitleDict[appSuggestions[i].title]) {
                            if (!appSuggestionsTitleDict[appSuggestions[i].title].alreadyFound) {
                                var appSearchUrl = "#Action-search&/searchterm=" + appSuggestions[i].title + "&datasource=" + JSON.stringify(that.model.appDataSource);
                                appSuggestionsTitleDict[appSuggestions[i].title].url = appSearchUrl;
                                var combinedAppLabel = sap.ushell.resources.i18n.getText("suggestion_in_apps", appSuggestionsTitleDict[appSuggestions[i].title].label);
                                appSuggestionsTitleDict[appSuggestions[i].title].label = combinedAppLabel;
                                appSuggestionsTitleDict[appSuggestions[i].title].alreadyFound = true;
                                var combinedAppTitle = sap.ushell.resources.i18n.getText("suggestion_in_apps", appSuggestions[i].title);
                                appSuggestionsTitleDict[combinedAppTitle] = appSuggestionsTitleDict[appSuggestions[i].title];
                                delete appSuggestionsTitleDict[appSuggestions[i].title];
                            }
                        } else {
                            appSuggestionsTitleDict[appSuggestions[i].title] = appSuggestions[i];
                        }
                    }
                    appSuggestions = [];
                    for (var appSuggestion in appSuggestionsTitleDict) {
                        if (appSuggestionsTitleDict.hasOwnProperty(appSuggestion)) {
                            appSuggestions.push(appSuggestionsTitleDict[appSuggestion]);
                        }
                    }
                    return [appSuggestions, resultset.totalResults];
                })
                .then(function(resultset) {
                    var appSuggestions = resultset[0];
                    var totalResults = resultset[1];
                    // get app suggestions
                    // var appSuggestions = resultset.getElements();

                    // set type, datasource and position
                    jQuery.each(appSuggestions, function(index, appSuggestion) {
                        appSuggestion.type = SuggestionTypes.SUGGESTION_TYPE_APPS;
                        appSuggestion.dataSource = that.model.appDataSource;
                        appSuggestion.position = SuggestionTypes.apps.position;
                    });

                    // limit app suggestions
                    var appSuggestionLimit;
                    if (that.model.isBusinessObjSearchEnabled() && that.model.isAllCategory()) {
                        appSuggestionLimit = SuggestionTypes.apps.limitDsAll;
                    } else {
                        appSuggestionLimit = SuggestionTypes.apps.limitDsApps;
                    }
                    appSuggestions = appSuggestions.slice(0, appSuggestionLimit);

                    if (totalResults > appSuggestionLimit) {
                        // if there are more apps available, add a "show all apps" suggestion at the end
                        if (dataSource.equals(that.model.appDataSource) ||  that.model.getProperty("/businessObjSearchEnabled") === false) {
                            // but only if datasource is apps or only app search is enabled (nestle changes)
                            var title = sap.ushell.resources.i18n.getText("showAllNApps", totalResults);
                            title = title.replace(/"/g, ""); //remove trailing ""
                            var tooltip = title;
                            var label = "<i>" + title + "</i>";
                            appSuggestions.push({
                                title: title,
                                tooltip: tooltip,
                                label: label,
                                dataSource: that.model.appDataSource,
                                labelRaw: that.model.getProperty("/searchBoxTerm"),
                                type: SuggestionTypes.SUGGESTION_TYPE_OBJECT_DATA
                            });
                        }
                    }
                    return appSuggestions;
                });
        },

        suggestApplications: function(searchTerm) {
            return sap.ushell.Container.getService("Search").queryApplications({
                searchTerm: searchTerm,
                searchInKeywords: true
            });
        }

    });

})();
