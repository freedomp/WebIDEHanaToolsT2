/* global jQuery,window */
// iteration 0

(function(global) {
    "use strict";
    /* eslint no-warning-comments:0 */

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchResultListFormatter');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.INAV2SearchFacetsFormatter');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchTabStripsFormatter');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.FacetItem');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.SuggestionHandler');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchIntentsResolver');


    var sap = global.sap;
    var SearchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;
    var SearchResultListFormatter = sap.ushell.renderers.fiori2.search.SearchResultListFormatter;
    var TabStripsFormatter = sap.ushell.renderers.fiori2.search.SearchTabStripsFormatter.Formatter;
    var SuggestionHandler = sap.ushell.renderers.fiori2.search.suggestions.SuggestionHandler;

    // =======================================================================
    // Global singleton method to get search model
    // ensure only one model instance available
    // =======================================================================
    sap.ushell.renderers.fiori2.search.getModelSingleton = function() {
        if (!sap.ushell.renderers.fiori2.search.oModel) {
            sap.ushell.renderers.fiori2.search.oModel =
                new sap.ushell.renderers.fiori2.search.SearchModel();
        }
        return sap.ushell.renderers.fiori2.search.oModel;
    };

    // =======================================================================
    // search model
    // =======================================================================
    sap.ui.model.json.JSONModel.extend("sap.ushell.renderers.fiori2.search.SearchModel", {

        constructor: function(properties) {

            var that = this;
            properties = properties || {};

            // call base class constructor
            sap.ui.model.json.JSONModel.prototype.constructor.apply(that, []);

            // parse url parameters
            that.urlParameters = that.parseUrlParameters();

            // set size limit in order to allow drop down list boxes with more than 100 entries
            that.setSizeLimit(200);

            // get sina
            that.sina = sap.ushell.Container.getService("Search").getSina();

            // create sina suggestion query
            this.suggestionQuery = this.sina.createSuggestionQuery();

            // create suggestions handler
            that.suggestionHandler = new SuggestionHandler({
                model: this
            });

            // create sina query for search for business objects (normal search)
            that.query = that.sina.createPerspectiveQuery({
                templateFactsheet: true
            });

            // reset filter conditions
            that.resetFilterConditions(false);

            // create standard datasources like ALL and APPS
            that.createAllAndAppDataSource();

            // decorate search methods (decorator prevents request overtaking)
            that.query.getResultSet = SearchHelper.refuseOutdatedRequests(that.query.getResultSet, 'search'); // normal search
            that.searchApplications = SearchHelper.refuseOutdatedRequests(that.searchApplications, 'search'); // app search

            // formatters
            that.oFacetFormatter = new sap.ushell.renderers.fiori2.search.INAV2SearchFacetsFormatter();
            that.tabStripFormatter = new TabStripsFormatter();
            that.dataSourceTree = that.tabStripFormatter.tree;

            // initial values for boTop and appTop
            that.appTopDefault = 20;
            that.boTopDefault = 10;

            // init the properties

            this.setProperty('/isInvalidated', true); // force request if query did not change

            that.setProperty('/searchBoxTerm', '');
            that.setProperty('/lastSearchTerm', null);

            that.setProperty('/isBusy', false); //show a busy indicator?

            that.setProperty('/dataSource', null);
            that.setProperty('/lastDataSource', null);

            that.setProperty('/top', 10);
            that.setProperty('/lastTop', 10);

            that.setProperty('/skip', 0);
            that.setProperty('/lastSkip', 0);

            that.setProperty('/results', []); // combined result list: apps + bos
            that.setProperty('/appResults', []); // applications result list
            that.setProperty('/boResults', []); // business object result list

            that.setProperty('/count', 0);
            that.setProperty('/boCount', 0);
            that.setProperty('/appCount', 0);

            that.setProperty('/facets', []);
            that.setProperty('/filterConditions', []);
            that.setProperty('/lastFilterConditions', []);
            that.setProperty('/dataSources', [that.allDataSource, that.appDataSource]);
            that.setProperty('/recentDataSources', []); //facets datasource tree
            that.setProperty('/businessObjSearchEnabled', true);
            that.setProperty('/suggestions', []);

            // TODO always use main result list (also for pure app results)
            that.setProperty('/resultsVisibility', true); // visibility of combined result list
            that.setProperty('/appsVisibility', true); // visibility of app result list
            // TODO rename loadFilterButtonStatus -> loadFacetVisibilityStatus?
            that.setProperty('/facetVisibility', SearchHelper.loadFilterButtonStatus()); // visibility of facet panel
            that.setProperty('/lastFacetVisibility', false); // visbility of facet panel is relevant for query

            that.resetDataSource(false);

            // initialize enterprise search
            that.initBusinessObjSearch();

            // usage analytics
            try {
                that.analytics = sap.ushell.Container.getService("UsageAnalytics");
            } catch (e) {}
            if (!that.analytics) {
                that.analytics = {
                    logCustomEvent: function() {
                        //console.log('-->',arguments[0],arguments[1],arguments[2]);
                    }
                };
            }
        },

        doSuggestion: function() {
            this.suggestionHandler.doSuggestion();
        },

        abortSuggestions: function() {
            this.suggestionHandler.abortSuggestions();
        },

        parseUrlParameters: function() {
            var oURLParsing = sap.ushell.Container.getService("URLParsing");
            var params = oURLParsing.parseParameters(window.location.search);
            var newParams = {};
            // params is an object with name value pairs. value is always an array with values
            // (useful if url parameter has multiple values)
            // Here only the first value is relevant
            for (var key in params) {
                var value = params[key];
                if (value.length !== 1) {
                    continue;
                }
                value = value[0];
                if (typeof value !== 'string') {
                    continue;
                }
                newParams[key.toLowerCase()] = value.toLowerCase();
            }
            return newParams;
        },

        setProperty: function(name, value) {
            var that = this;
            var res = sap.ui.model.json.JSONModel.prototype.setProperty.apply(this, arguments);
            switch (name) {
                case '/boResults':
                case '/appResults':
                    that.calculateResultList();
                    break;
                case '/appCount':
                case '/boCount':
                    res = that.setProperty('/count', that.getProperty('/appCount') + that.getProperty('/boCount'));
                    break;
                default:
                    break;
            }
            return res;
        },

        calculateResultList: function() {
            // init
            var that = this;
            var results = [];

            // add bo results
            var boResults = that.getProperty('/boResults');
            if (boResults && boResults.length) {
                results.push.apply(results, boResults);
            }

            // add app results (tiles)
            var tiles = that.getProperty('/appResults');
            if (tiles && tiles.length > 0) {
                var tilesItem = {
                    type: 'appcontainer',
                    tiles: tiles
                };
                if (results.length > 0) {
                    if (results.length > 3) {
                        results.splice(3, 0, tilesItem);
                    } else {
                        //results.splice(0, 0, tilesItem);
                        results.push(tilesItem);
                    }
                } else {
                    results = [tilesItem];
                }
            }

            // set property
            sap.ui.model.json.JSONModel.prototype.setProperty.apply(this, ['/results', results]);
        },

        initBusinessObjSearch: function() {

            var that = this;

            // check whether enterprise search is configured
            if (!that.isBusinessObjSearchConfigured()) {
                that.setDataSource(that.appDataSource, false);
                that.setProperty('/businessObjSearchEnabled', false);
                that.setProperty('/facetVisibility', false);
                return;
            }

            // if get server info succeeds -> enable business obj search + load datasources
            that.sina.sinaSystem().getServerInfo().done(function() {
                that.loadDataSources();
            }).fail(function() {
                that.setDataSource(that.appDataSource, false);
                that.setProperty('/businessObjSearchEnabled', false);
                that.setProperty('/facetVisibility', false);
            });

        },

        loadDataSources: function() {
            var that = this;
            that.getServerDataSources().done(function(dataSources) {
                if (!jQuery.isArray(dataSources)) {
                    dataSources = [];
                }
                dataSources = dataSources.slice();
                dataSources.splice(0, 0, that.appDataSource);
                dataSources.splice(0, 0, that.allDataSource);
                dataSources = that._concatenateLabelAndRemoteSystem(dataSources);
                that.setProperty("/dataSources", dataSources);
                that.updateDataSourceList(that.getDataSource()); // ensure that current ds is in the list (may be category)
                // start - remove, shall be fixed by UI5 //TODO
                var ds = that.getDataSource();
                that.setProperty("/dataSource", {});
                that.setProperty("/dataSource", ds);
                // end //TODO
            });
        },

        _concatenateLabelAndRemoteSystem: function(dataSources) {

            var filteredDataSources = dataSources;
            for (var i = 0; i < filteredDataSources.length - 1; i++) {
                if (filteredDataSources[i].remoteSystem !== undefined && filteredDataSources[i].remoteSystem !== "") {
                    filteredDataSources[i].label = filteredDataSources[i].label + ' ' + sap.ushell.resources.i18n.getText("textIn") + ' ' + filteredDataSources[i].remoteSystem;
                    filteredDataSources[i].labelPlural = filteredDataSources[i].labelPlural + ' ' + sap.ushell.resources.i18n.getText("textIn") + ' ' + filteredDataSources[i].remoteSystem;
                }
            }
            return filteredDataSources;
        },

        getServerDataSources: function() {
            var that = this;

            if (that.getDataSourcesDeffered) {
                return that.getDataSourcesDeffered;
            }

            that.getDataSourcesDeffered = that.sina.getAllDataSources({
                top: 1000
            });
            return that.getDataSourcesDeffered;
        },

        isBusinessObjSearchConfigured: function() {
            try {
                var config = window['sap-ushell-config'].renderers.fiori2.componentData.config;
                return config.searchBusinessObjects !== 'hidden';
            } catch (e) {
                return true;
            }
        },

        isBusinessObjSearchEnabled: function() {
            return this.getProperty('/businessObjSearchEnabled');
        },

        isFacetSearchEnabled: function() {
            if (this.urlParameters.disableeshfacets === 'true') {
                return false;
            }
            return true;
        },

        searchApplications: function(searchTerm, top, skip) {
            return sap.ushell.Container.getService("Search").queryApplications({
                searchTerm: searchTerm,
                searchInKeywords: true,
                top: top,
                skip: skip
            });
        },

        createAllAndAppDataSource: function() {

            // all data source
            this.allDataSource = this.sina.getRootDataSource();
            this.allDataSource.label = sap.ushell.resources.i18n.getText("label_all");
            this.allDataSource.labelPlural = sap.ushell.resources.i18n.getText("label_all");

            // app datasource (create sina base class instance)
            this.appDataSource = new sap.bc.ina.api.sina.base.datasource.DataSource({
                label: sap.ushell.resources.i18n.getText("label_apps"),
                labelPlural: sap.ushell.resources.i18n.getText("label_apps"),
                type: 'Apps',
                name: 'Apps'
            });

        },

        isAllCategory: function() {
            var ds = this.getProperty("/dataSource");
            return ds.equals(this.allDataSource);
        },

        isAppCategory: function() {
            var ds = this.getProperty("/dataSource");
            return ds.equals(this.appDataSource);
        },

        // All of the following *filterCondition* methods belong to facet functionality
        addFilterCondition: function(facetItem, fireQuery) {
            var that = this,
                filterCondition = facetItem.filterCondition;

            function addItemToFilterConditions(facetItem) {
                var newFilterConditions = that.getProperty("/filterConditions");
                newFilterConditions.push(facetItem);
                that.setProperty("/filterConditions", newFilterConditions);
            }

            if (filterCondition.attribute || filterCondition.conditions) { //is it an attribute filter?
                //move to searchFireQuery + doNormalsuggestion //TODO
                if (!that.query.getFilter().hasFilterCondition(filterCondition)) {
                    that.query.addFilterCondition(filterCondition);
                    addItemToFilterConditions(facetItem);
                }
                if (!that.suggestionQuery.getFilter().hasFilterCondition(filterCondition)) {
                    that.suggestionQuery.addFilterCondition(filterCondition);
                }
            } else { //or a datasource
                that.setDataSource(filterCondition, false);
            }

            if (fireQuery || fireQuery === undefined) {
                that._searchFireQuery();
            }
        },

        removeFilterCondition: function(facetItem, fireQuery) {
            var that = this,
                filterCondition = facetItem.filterCondition;

            function removeItemFromFilterConditions(facetItem) {
                var newFilterConditions = that.getProperty("/filterConditions");
                var i = that.getProperty("/filterConditions").length;
                while (i--) {
                    var fc = that.getProperty("/filterConditions")[i].filterCondition;
                    if (fc.equals(facetItem.filterCondition)) {
                        newFilterConditions.splice(i, 1);
                        break;
                    }
                }
                that.setProperty("/filterConditions", newFilterConditions);
            }

            if (filterCondition.attribute) {
                removeItemFromFilterConditions(facetItem);
                that.query.removeFilterCondition(filterCondition.attribute, filterCondition.operator, filterCondition.value);
                that.suggestionQuery.removeFilterCondition(filterCondition.attribute, filterCondition.operator, filterCondition.value);
            } else if (filterCondition.conditions) {
                removeItemFromFilterConditions(facetItem);
                that.query.getFilter().removeFilterConditionGroup(filterCondition); // TODO replace by removeFilterCondtion
                that.suggestionQuery.getFilter().removeFilterConditionGroup(filterCondition);
            } else {
                that.setDataSource(filterCondition, false);
            }

            if (fireQuery || fireQuery === undefined) {
                that._searchFireQuery();
            }
        },

        hasFilterCondition: function(filterCondition) {
            return this.query.getFilter().hasFilterCondition(filterCondition);
        },

        resetFilterConditions: function(fireQuery) {
            var that = this;
            that.query.resetFilterConditions();
            that.suggestionQuery.resetFilterConditions();
            that.setProperty("/filterConditions", []); // TODO move to new extended filter?
            that.query.addFilterCondition('$$RenderingTemplatePlatform$$', '=', 'html');
            that.query.addFilterCondition('$$RenderingTemplateTechnology$$', '=', 'Tempo');
            that.query.addFilterCondition('$$RenderingTemplateVariant$$', '=', '');
            that.query.addFilterCondition('$$RenderingTemplateType$$', '=', 'ItemDetails');
            that.query.addFilterCondition('$$RenderingTemplateType$$', '=', 'ResultItem');
            if (fireQuery || fireQuery === undefined) {
                that._searchFireQuery();
            }
        },

        getFacets: function() {
            var that = this;
            return that.getProperty('/facets');
        },

        getTop: function() {
            return this.getProperty('/top');
        },

        setTop: function(top, fireQuery) {
            this.setProperty('/top', top);
            if (fireQuery || fireQuery === undefined) {
                this._searchFireQuery();
            }
        },

        getSkip: function() {
            return this.getProperty('/skip');
        },

        setSkip: function(skip, fireQuery) {
            this.setProperty('/skip', skip);
            if (fireQuery || fireQuery === undefined) {
                this._searchFireQuery();
            }
        },

        calculatePlaceholder: function() {
            var that = this;
            if (that.isAllCategory()) {
                return sap.ushell.resources.i18n.getText("search");
            } else {
                return sap.ushell.resources.i18n.getText("searchInPlaceholder", that.getDataSource().label); //TODO plural?
            }
        },

        setFacetVisibility: function(visibility, fireQuery) {

            var that = this;

            // check for change (special for facet visibility)
            if (visibility === this.getProperty('/facetVisibility')) {
                return;
            }

            // facets are invisible or datasource is on category level or datasource is apps
            // -> set lastFacetVisibility in order to avoid firing a query
            if (!visibility ||
                that.getDataSource().getType().value === 'Category' ||
                that.isAppCategory()) {

                that.setProperty('/lastFacetVisibility', visibility);

            }

            // set new value
            this.setProperty('/facetVisibility', visibility);

            // Set button status in sap storage
            SearchHelper.saveFilterButtonStatus(visibility);

            // fire query
            if (fireQuery || fireQuery === undefined) {
                this._searchFireQuery();
            }
        },

        getFacetVisibility: function() {
            return this.getProperty('/facetVisibility');
        },

        getDataSource: function() {
            var that = this;
            return that.getProperty("/dataSource");
        },

        setDataSource: function(dataSource, fireQuery) {

            /* eslint no-empty:0 */
            var that = this;
            var oldDataSource = that.getProperty('/dataSource');
            var goingUp = false;
            var recentDataSources = that.getProperty("/recentDataSources");

            // TODO move update of recent datasource to fireQuery
            // TODO remove len
            for (var i = 0, len = recentDataSources.length; i < len; i++) {
                var ds = recentDataSources[i];
                if (dataSource.equals(ds)) {
                    goingUp = true; //user is navigating up the datasource tree
                    recentDataSources.splice(i, Number.MAX_VALUE);
                    that.setProperty("/recentDataSources", recentDataSources);
                    break;
                }
            }
            if (!goingUp) {
                // where is he going to?
                if (oldDataSource && !this.allDataSource.equals(oldDataSource) && !this.appDataSource.equals(oldDataSource)) {
                    if (this.tabStripFormatter.tree.hasChild(oldDataSource, dataSource)) {
                        // user is drilling down
                        recentDataSources.push(oldDataSource);
                    } else if (this.tabStripFormatter.tree.hasSibling(oldDataSource, dataSource)) {
                        // user is navigating to the same datasource tree level -> do nothing
                    } else if (dataSource.equals(oldDataSource)) {
                        // user clicked on the same datasource again
                        that.resetFilterConditions(false);
                    }
                }
            }
            if (this.allDataSource.equals(dataSource)) {
                that.setProperty("/recentDataSources", []);
            }

            that.updateDataSourceList(dataSource);
            that.setProperty("/dataSource", dataSource);
            that.setProperty("/searchTermPlaceholder", that.calculatePlaceholder());

            // reset top and skip to defaults
            that.setSkip(0, false);
            if (that.isAppCategory()) {
                that.setTop(that.appTopDefault, false);
            } else {
                that.setTop(that.boTopDefault, false);
            }

            if (fireQuery || fireQuery === undefined) {
                that._searchFireQuery();
            }
        },

        updateDataSourceList: function(newDataSource) {
            var dataSources = this.getProperty('/dataSources');
            // delete old categories, until all data source
            while (dataSources.length > 0 && !dataSources[0].equals(this.allDataSource)) {
                dataSources.shift();
            }
            // all and apps are surely included in existing list -> return
            if (newDataSource.equals(this.allDataSource) || newDataSource.equals(this.appDataSource)) {
                return;
            }
            // all connectors (!=category) are included in existing list -> return
            if (newDataSource && newDataSource.key) {
                if (newDataSource.key.indexOf('~') >= 0) {
                    return;
                }
            }
            // check if newDataSource exists in existing list -> return
            for (var i = 0; i < dataSources.length; ++i) {
                var dataSource = dataSources[i];
                if (dataSource.equals(newDataSource)) {
                    return;
                }
            }
            // add datasource
            dataSources.unshift(newDataSource);
            this.setProperty('/dataSources', dataSources);
        },

        resetDataSource: function(fireQuery) {
            this.setDataSource(this.allDataSource, fireQuery);
        },

        // TODO move to datasource
        getSearchBoxTerm: function() {
            var that = this;
            return that.getProperty("/searchBoxTerm");
        },

        setSearchBoxTerm: function(searchTerm, fireQuery) {
            var that = this;
            var searchTermTrimLeft = searchTerm.replace(/^\s+/, ""); // TODO rtl
            that.setProperty("/searchBoxTerm", searchTermTrimLeft);
            if (searchTermTrimLeft.length === 0) {
                return; //TODO ??
            }
            if (fireQuery || fireQuery === undefined) {
                that._searchFireQuery();
            }
        },

        invalidateQuery: function() { // TODO naming?
            this.setProperty('/isInvalidated', true);
        },

        // rename firePerspectiveQuery //TODO
        _searchFireQuery: function(bDeserialization) {
            var that = this;

            // determine whether filter changed
            var filterChanged = !that.checkFiltersIdentical(that.getProperty('/filterConditions'),
                that.getProperty('/lastFilterConditions'));

            // check whether we need to fire the query
            if (that.getProperty('/lastSearchTerm') === that.getProperty('/searchBoxTerm') &&
                that.getProperty('/lastDataSource').equals(that.getProperty('/dataSource')) &&
                that.getProperty('/lastTop') === that.getProperty('/top') &&
                that.getProperty('/lastSkip') === that.getProperty('/skip') &&
                that.getProperty('/lastFacetVisibility') === that.getProperty('/facetVisibility') &&
                !that.getProperty('/isInvalidated') &&
                !filterChanged) {
                return;
            }

            // if searchBoxTerm is empty, but lastSearchTerm is not empty, set back the searchBoxTerm 
            // (empty search term can cause performance problems therefore the old search term is
            //  restored. User needs to use '*' to force system to search for all objects)
            if (that.getProperty('/searchBoxTerm').length === 0 &&
                that.getProperty('/lastSearchTerm').length !== 0) {
                that.setProperty('/searchBoxTerm', that.getProperty('/lastSearchTerm'));
            }

            // reset top and skip if search term has changed
            if (that.getProperty('/lastSearchTerm') || that.getProperty('/lastDataSource')) {
                if (that.getProperty('/lastSearchTerm') !== that.getProperty('/searchBoxTerm') ||
                    that.getProperty('/lastDataSource') !== that.getProperty('/dataSource') ||
                    filterChanged) {
                    // 1. searchterm, datasource or filter changed -> reset top and skip
                    that.setProperty('/skip', 0);
                    if (that.isAppCategory()) {
                        that.setProperty('/top', that.appTopDefault);
                    } else {
                        that.setProperty('/top', that.boTopDefault);
                    }
                }
            }

            // reset tabstrip formatter if search term changes or filter condition
            if (that.getProperty('/lastSearchTerm') !== that.getProperty('/searchBoxTerm') || filterChanged) {
                that.tabStripFormatter.invalidateCount();
            }

            // datasource changed -> reset filter conditions
            if (!bDeserialization &&
                that.getProperty('/lastDataSource') !== null && !that.getProperty('/lastDataSource').equals(that.getProperty('/dataSource'))) {
                that.resetFilterConditions(false);
            }

            // store properties in corresponding last properties
            that.setProperty('/lastSearchTerm', that.getProperty('/searchBoxTerm'));
            that.setProperty('/lastDataSource', that.getProperty('/dataSource'));
            that.setProperty('/lastTop', that.getProperty('/top'));
            that.setProperty('/lastSkip', that.getProperty('/skip'));
            that.setProperty('/lastFacetVisibility', that.getProperty('/facetVisibility'));
            that.setProperty('/lastFilterConditions', that.cloneFilterConditions(this.getProperty('/filterConditions')));
            that.setProperty('/isInvalidated', false);

            // notify view
            sap.ui.getCore().getEventBus().publish("allSearchStarted");

            // abort suggestions
            that.abortSuggestions();

            // abort old async running search calls
            SearchHelper.abortRequests('search');

            // calculate visibility flags for apps and combined result list
            that.calculateVisibility();

            // update url silently
            that.updateSearchURLSilently();

            // log search request
            that.analytics.logCustomEvent('FLP: Search', 'Search', [that.getProperty('/searchBoxTerm'), that.getProperty('/dataSource').key]);

            // wait for all subsearch queries
            var dataSource = that.getDataSource();
            that.setProperty('/isBusy', true);
            jQuery.when.apply(null, [that.normalSearch(bDeserialization), that.appSearch(bDeserialization)])
                .done(function() {
                    that.setProperty('/tabStrips', that.tabStripFormatter.format(dataSource, that.perspective, that));
                    that.setProperty('/facets', that.oFacetFormatter.getFacets(dataSource, that.perspective, that));
                })
                .always(function() {
                    that.setProperty('/isBusy', false);
                    sap.ui.getCore().getEventBus().publish("allSearchFinished");
                });
        },

        autoStartApp: function() {
            var that = this;
            if (that.getProperty("/appCount") && that.getProperty("/appCount") === 1 && that.getProperty("/count") && that.getProperty("/count") === 1) {
                var aApps = that.getProperty("/appResults");
                if (aApps && aApps.length > 0 && aApps[0] && aApps[0].url && that.getProperty('/searchBoxTerm') && aApps[0].tooltip && that.getProperty('/searchBoxTerm').toLowerCase().trim() === aApps[0].tooltip.toLowerCase().trim()) {
                    if (aApps[0].url[0] === '#') {
                        window.location.href = aApps[0].url;
                    } else {
                        window.open(aApps[0].url, '_blank');
                    }
                }
            }
        },

        calculateVisibility: function() {
            var that = this;
            if (that.isAppCategory()) {
                that.setProperty('/resultsVisibility', false);
                that.setProperty('/appsVisibility', true);
            } else {
                that.setProperty('/resultsVisibility', true);
                that.setProperty('/appsVisibility', false);
            }
        },

        appSearch: function(bDeserialization) {
            var that = this;

            /*
            	            deserialize: false	             deserialize: true
                skip===0	NA,replace with new table	     NA, replace
                skip>0	    NA: Append to existing table	 newSkip=0
                                                             newT0p=oldTop+oldSkip
                                                             replace
            */
            var newTop = that.getTop();
            var newSkip = that.getSkip();
            if (bDeserialization === true) {
                if (that.getSkip() > 0) {
                    newTop = that.getSkip() + that.getTop();
                    newSkip = 0;
                }
            }

            if (newSkip === 0) {
                that.setProperty("/appResults", []);
                that.setProperty("/appCount", 0);
            }

            if (that.isAllCategory() || that.isAppCategory()) {
                // 1. search

                return that.searchApplications(that.getProperty('/searchBoxTerm'),
                    newTop, newSkip).then(function(oResult) {
                    // 1.1 search call succeeded
                    that.setProperty("/appCount", oResult.totalResults);
                    if (newSkip > 0) {
                        var apps = that.getProperty("/appResults").slice();
                        apps.push.apply(apps, oResult.getElements());
                        that.setProperty("/appResults", apps);
                    } else {
                        that.setProperty("/appResults", oResult.getElements());
                    }
                    sap.ui.getCore().getEventBus().publish("appSearchFinished", oResult);
                }, function() {
                    // 1.2 search call failed
                    sap.ui.getCore().getEventBus().publish("appSearchFinished");
                    return jQuery.when(true); // make deferred returned by "then" resolved
                });
            } else {
                // 2. do not search
                that.setProperty("/appResults", []);
                that.setProperty("/appCount", 0);
                sap.ui.getCore().getEventBus().publish("appSearchFinished");
            }
        },

        normalSearch: function(bDeserialization) {
            var that = this;

            if (that.isBusinessObjSearchEnabled() && !that.isAppCategory()) {
                // 1.search
                that.query.setSearchTerms(that.getSearchBoxTerm());
                that.query.setDataSource(that.getDataSource());

                /*
            	            deserialize: false	             deserialize: true
                skip===0	NA,replace with new table	     NA, replace
                skip>0	    NA: Append to existing table	 newSkip=0
                                                             newT0p=oldTop+oldSkip
                                                             replace
               */
                var newTop = that.getTop();
                var newSkip = that.getSkip();
                if (bDeserialization === true) {
                    if (that.getSkip() > 0) {
                        newTop = that.getSkip() + that.getTop();
                        newSkip = 0;
                    }
                }

                that.query.setTop(newTop);
                that.query.setSkip(newSkip);
                if (that.query.setExpand) {
                    if ((that.getFacetVisibility() && that.isFacetSearchEnabled()) ||
                        // tab strip needs data from data source facet if a category is selected because
                        // then the tab strips show also siblings. If connector is selected, the tab strip
                        // only shows All and the connector.
                        that.getDataSource().getType().value === 'Category') {
                        that.query.setExpand(['Grid', 'Items', 'ResultsetFacets', 'TotalCount']);
                    } else {
                        that.query.setExpand(['Grid', 'Items', 'TotalCount']);
                    }

                }

                return that.query.getResultSet().then(function(perspective) {
                    // 1.1 search succeeded
                    that.perspective = perspective;

                    return that._afterSearchPrepareResultList(that.perspective, newSkip > 0).then(function() {
                        sap.ui.getCore().getEventBus().publish("normalSearchFinished", {
                            append: that.getSkip() > 0,
                            resultset: that.perspective
                        });
                    });
                }, function(error) {
                    // 1.2 search failed
                    sap.ui.getCore().getEventBus().publish("normalSearchFinished", {
                        append: that.getSkip() > 0,
                        resultset: null
                    });
                    that.normalSearchErrorHandling(error);
                    that.perspective = null;
                    return jQuery.when(true); // make deferred returned by "then" resolved
                });
            } else {
                // 2. do not search
                that.setProperty("/boResults", []);
                that.setProperty("/boCount", 0);
                sap.ui.getCore().getEventBus().publish("normalSearchFinished", {
                    append: that.getSkip() > 0,
                    resultset: null
                });
            }
        },

        normalSearchErrorHandling: function(error) {

            // example error:
            // error = {};
            // error.responseText = '{"Error":{"Code":200,"Message":"Engine-Fehler"},"ErrorDetails":[{"Code":"ESH_FED_MSG020","Message":"Suchumfang ist nicht gültig HT3360~EPM_EMPLOYEES_DEMO~"}]}';
            // error.responseText = '{"Error":{"Code":200,"Message":"Engine error"},"ErrorDetails":[{"Code":"ESH_FED_MSG016",
            // "Message":"No authorization for the given list of connectors"}]}';

            //these ina service errors shall not appear as popups:
            var ignoredErrors = ["ESH_FED_MSG016"]; //<- No authorization for the given list of connectors,
            //or no connectors active (i.e. only app search is used)

            if (error) {
                if (error.status === 500) {
                    jQuery.sap.log.error(error.responseText);
                    jQuery.sap.require("sap.m.MessageBox");
                    sap.m.MessageBox.alert(error.responseText, {
                        title: "Search Error: " + error.statusText,
                        icon: sap.m.MessageBox.Icon.ERROR
                    });
                }

                if (error.responseText) {
                    var showErrorPopup = true;
                    var inaErr = jQuery.parseJSON(error.responseText);
                    var errMsg = '';
                    var detailMsg = '';
                    if (inaErr.Error) {
                        if (inaErr.Error.Message) {
                            errMsg += '' + inaErr.Error.Message;
                        }
                        if (inaErr.Error.Code) {
                            errMsg += ' (Code ' + inaErr.Error.Code + ').';
                        }
                    }
                    if (inaErr.ErrorDetails) {
                        detailMsg += '';
                        for (var i = 0; i < inaErr.ErrorDetails.length; i++) {
                            detailMsg += inaErr.ErrorDetails[i].Message + ' (Code ' + inaErr.ErrorDetails[i].Code + ')';
                            if (ignoredErrors.indexOf(inaErr.ErrorDetails[i].Code) !== -1) {
                                showErrorPopup = false;
                            }
                        }
                    }
                    jQuery.sap.log.error(errMsg + ' Details: ' + detailMsg);
                    if (showErrorPopup) {
                        jQuery.sap.require("sap.m.MessageBox");
                        sap.m.MessageBox.alert(detailMsg, {
                            title: "Search Error: " + errMsg,
                            icon: sap.m.MessageBox.Icon.ERROR
                        });
                    }
                } else {
                    var message = 'Search error:' + error.toString();
                    jQuery.sap.log.error(message);
                    jQuery.sap.require("sap.m.MessageBox");
                    sap.m.MessageBox.alert(message, {
                        title: 'Search Error',
                        icon: sap.m.MessageBox.Icon.ERROR
                    });
                }
            }
        },

        _afterSearchPrepareResultList: function(perspective, append) {
            var that = this;

            var oldResults = that.getProperty("/boResults");
            if (append) {
                oldResults.pop(); //Remove footer
            } else {
                that.setProperty("/boResults", []);
                that.setProperty("/boCount", 0);
                oldResults = that.getProperty("/boResults");
            }

            var formatter = new SearchResultListFormatter();
            var results = formatter.format(perspective.getSearchResultSet(), this.query.filter.searchTerms);

            var intentsResolver = new sap.ushell.renderers.fiori2.search.SearchIntentsResolver(that);
            var intentsProm = intentsResolver.resolveIntents(results);

            intentsProm.done(function(args) { //TODO: error handling
                var newResults = oldResults.concat(results);

                //move footer to control //TODO
                //Add footer
                //There is more
                if (newResults.length < perspective.getSearchResultSet().totalcount) {
                    var resultListFooter = {};
                    resultListFooter.type = "footer";
                    newResults.push(resultListFooter);
                }

                that.setProperty("/boCount", perspective.getSearchResultSet().totalcount);
                that.setProperty("/boResults", newResults);
            });

            return intentsProm;
        },

        createSearchURL: function() {

            // use encodeURIComponent and not encodeURI because:
            // >= in filter condition needs to be
            // encoded. If = ist not encoded the url parameter parser will use = as delimiter for
            // a parameter=value pair

            // prefix
            var sHash = "#Action-search";

            // searchterm
            sHash += "&/searchterm=" + encodeURIComponent(this.getProperty('/searchBoxTerm'));

            // datasource            
            sHash += "&datasource=" + encodeURIComponent(JSON.stringify(this.getDataSource().toURL()));

            // top
            sHash += "&top=" + this.getTop();

            // skip
            sHash += "&skip=" + this.getSkip();

            // filter conditions
            if (this.getProperty("/filterConditions").length > 0) {
                sHash += "&filter=" +
                    encodeURIComponent(JSON.stringify(this.getProperty("/filterConditions")));
            }

            return sHash;
        },

        updateSearchURLSilently: function() {
            var sHash = this.createSearchURL();
            SearchHelper.hasher.setHash(sHash);
        },

        deserializeURL: function() {

            // check if hash differs from old hash. if not -> return
            if (!SearchHelper.hasher.hasChanged()) {
                return;
            }

            // parse hash parameters
            var oURLParsing = sap.ushell.Container.getService("URLParsing");
            var appSpecificRoute = oURLParsing.splitHash(window.location.hash).appSpecificRoute;
            if (!appSpecificRoute) {
                return;
            }
            var oParameters = oURLParsing.parseParameters("?" + appSpecificRoute.substring(2));

            // make parameters lowercase
            var oParametersLowerCased = {};
            jQuery.each(oParameters, function(i, v) {
                oParametersLowerCased[i.toLowerCase()] = v[0]; // decode happens in app view deserialize url
            });

            // search term
            if (!oParametersLowerCased.searchterm) {
                return;
            }
            var searchTerm = oParametersLowerCased.searchterm;
            this.setSearchBoxTerm(searchTerm, false);

            // datasource
            var dataSource;
            if (oParametersLowerCased.datasource) {
                var dataSourceJson = JSON.parse(oParametersLowerCased.datasource);
                if (dataSourceJson.name === 'Apps') {
                    dataSource = this.appDataSource;
                } else {
                    dataSource = this.sina.createDataSource(dataSourceJson);
                }
                this.setDataSource(dataSource, false);
            } else {
                this.resetDataSource(false);
            }

            // top
            if (oParametersLowerCased.top) {
                var top = parseInt(oParametersLowerCased.top, 10);
                this.setTop(top, false);
            }

            // skip
            if (oParametersLowerCased.skip) {
                var skip = parseInt(oParametersLowerCased.skip, 10);
                this.setSkip(skip, false);
            }

            // filter conditions
            this.resetFilterConditions(false);
            if (oParametersLowerCased.filter) {
                var facetItems = JSON.parse(oParametersLowerCased.filter);
                for (var i = 0, len = facetItems.length; i < len; i++) {
                    var facetItem = new sap.ushell.renderers.fiori2.search.FacetItem(facetItems[i]);
                    this.addFilterCondition(facetItem, false);
                }
            }

            // fire query
            this._searchFireQuery(true);

        },

        checkFiltersIdentical: function(filter1, filter2) {

            // check each filter condition in filter1 against condition in filter2
            var filter2Matches = [];
            for (var i = 0; i < filter1.length; ++i) {
                var filterItem1 = filter1[i];

                var match = false;
                for (var j = 0; j < filter2.length; ++j) {
                    var filterItem2 = filter2[j];
                    if (filterItem1.filterCondition.equals(filterItem2.filterCondition)) {
                        match = true;
                        filter2Matches[j] = true;
                        break;
                    }
                }
                if (!match) {
                    return false;
                }

            }

            // check that for all filters in filter2 there is a match
            for (var k = 0; k < filter2.length; ++k) {
                if (!filter2Matches[k]) {
                    return false;
                }
            }

            return true;
        },

        cloneFilterConditions: function(filter) {
            // TODO replace by none jquery way
            var newFilter = jQuery.extend(true, [], filter);
            return newFilter;
        }

    });

})(window);
