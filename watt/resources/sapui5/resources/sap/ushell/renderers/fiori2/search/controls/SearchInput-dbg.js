/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.Input');

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var searchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.SuggestionTypes');
    var SuggestionTypes = sap.ushell.renderers.fiori2.search.suggestions.SuggestionTypes;

    // start search
    // event               desktop+tablet         phone
    // change              fired/not used a)d)   fired/used
    // sapenter            fired/used            not fired/not used

    // request suggestions
    // event               desktop/tablet   phone
    // liveChange          fired/used       fired/used

    // mouseclick on suggestion
    // sequence  event                         desktop/table        phone
    // 1         change                        fired/not used a)    fired/not used b)
    // 2         suggestionItemSelected        fired/used           fired/used
    // 3         sapenter                      not fired            not fired

    // enter on suggestion
    // sequence  event                         desktop/table       phone (action not possible)
    // 1         change                        fired/not used a)
    // 2         suggestionItemSelected        fired/used
    // 3         sapenter                      fired/not used c)

    // a) prevented by if in change event handler
    // b) prevented by time shift logic (setTimeout in handleChangeSearchInput)
    // c) prevented by checks for changing searchTerm/datasource/paging/filterCondition in searchFireQuery method of searchModel
    // d) search input looses focus -> triggers change -> not wanted on desktop: do not register on change event instead register on sapenter event

    sap.m.Input.extend('sap.ushell.renderers.fiori2.search.controls.SearchInput', {

        constructor: function(sId, oOptions) {
            var that = this;
            oOptions = jQuery.extend({}, {
                showValueStateMessage: false,
                showTableSuggestionValueHelp: false,
                showSuggestion: true,
                filterSuggests: false,
                suggestionColumns: [new sap.m.Column({})],
                placeholder: {
                    path: '/searchTermPlaceholder',
                    mode: sap.ui.model.BindingMode.OneWay
                }
            }, oOptions);
            sap.m.Input.prototype.constructor.apply(this, [sId, oOptions]);
            this.addEventDelegate({
                onsapenter: function(oEvent) {
                    if (that.getValue() !== '') {
                        that.triggerSearch(oEvent);
                    }
                }
            });
            this.bindAggregation("suggestionRows", "/suggestions", function(sId, oContext) {
                return that.suggestionItemFactory(sId, oContext);
            });
            this.addStyleClass('searchInput');

            // disable fullscreen input on mobile
            this._bUseDialog = false;
            this._bFullScreen = false;
        },

        renderer: 'sap.m.InputRenderer',

        fireChange: function(oEvent) {
            sap.m.Input.prototype.fireChange.apply(this, arguments);
            if (sap.ui.Device.system.phone) {
                this.triggerSearch(oEvent);
            }
        },

        triggerSearch: function(oEvent) {
            var that = this;
            // workaround: when selecting a suggestion two events are fired:
            // 1) fireChange
            // 2) doHandleSuggestionItemSelected
            // we want to have only one event (the suggestion doHandleSuggestionItemSelected event)
            // because only one query shall be executed
            // --> shift fireChange to the future so that
            // doHandleSuggestionItemSelected handler can abort fireChange
            this.changeTimer = window.setTimeout(function() {
                that.changeTimer = null;

                searchHelper.subscribeOnlyOnce('triggerSearch', 'allSearchFinished', function() {
                    that.getModel().autoStartApp();
                }, that);
                that.getModel().setSearchBoxTerm(that.getValue(), false);
                that.navigateToSearchApp();

                that.destroySuggestionRows();
                that.getModel().abortSuggestions();
            }, 100);
        },

        fireLiveChange: function() {
            sap.m.Input.prototype.fireLiveChange.apply(this, arguments);
            var suggestTerm = this.getValue();
            var oModel = this.getModel();
            oModel.setSearchBoxTerm(suggestTerm, false);
            if (oModel.getSearchBoxTerm().length > 0 && !sap.ui.Device.system.phone) {
                oModel.doSuggestion();
            } else {
                this.destroySuggestionRows();
                oModel.abortSuggestions();
            }
        },

        fireSuggestionItemSelected: function(oEvent) {
            sap.m.Input.prototype.fireSuggestionItemSelected.apply(this, arguments);
            if (this.changeTimer) {
                window.clearTimeout(this.changeTimer);
                this.changeTimer = null;
            }
            this.doHandleSuggestionItemSelected(oEvent);
        },

        doHandleSuggestionItemSelected: function(oEvent) {
            var oModel = this.getModel();
            var searchBoxTerm = oModel.getSearchBoxTerm();
            var suggestion = oEvent.selectedRow.getBindingContext().getObject();
            var searchTerm = suggestion.labelRaw;
            var dataSource = suggestion.dataSource;
            var targetURL = suggestion.url;
            var type = suggestion.type;

            switch (type) {
                case SuggestionTypes.SUGGESTION_TYPE_APPS:
                    // app suggestions -> start app
                    oModel.analytics.logCustomEvent('FLP: Search', 'Suggestion Select App', [suggestion.title, targetURL, searchBoxTerm]);
                    oModel.analytics.logCustomEvent('FLP: Application Launch point', 'Search Suggestions', [suggestion.title, targetURL, searchBoxTerm]);
                    if (targetURL[0] === '#') {
                        window.location.href = targetURL;
                    } else {
                        window.open(targetURL, '_blank');
                    }
                    break;
                case SuggestionTypes.SUGGESTION_TYPE_DATASOURCE:
                    // data source suggestions
                    // -> change datasource in dropdown
                    // -> do not start search
                    oModel.analytics.logCustomEvent('FLP: Search', 'Suggestion Select Datasource', [dataSource.key, searchBoxTerm]);
                    oModel.setDataSource(dataSource, false);
                    oModel.setSearchBoxTerm('', false);
                    this.focus();
                    break;
                case SuggestionTypes.SUGGESTION_TYPE_OBJECT_DATA:
                    // object data suggestion
                    // -> change search term + change datasource + start search
                    oModel.analytics.logCustomEvent('FLP: Search', 'Suggestion Select Object Data', [searchTerm, dataSource.key, searchBoxTerm]);
                    oModel.setDataSource(dataSource, false);
                    oModel.setSearchBoxTerm(searchTerm, false);
                    this.navigateToSearchApp();
                    this.setValue(searchTerm);
                    break;
                case SuggestionTypes.SUGGESTION_TYPE_HISTORY:
                    // history
                    // -> change search term + change datasource + start search
                    oModel.analytics.logCustomEvent('FLP: Search', 'Suggestion Select History', [searchTerm, dataSource.key, searchBoxTerm]);
                    oModel.setDataSource(dataSource, false);
                    oModel.setSearchBoxTerm(searchTerm, false);
                    this.navigateToSearchApp();
                    this.setValue(searchTerm);
                    break;
                default:
                    break;
            }
        },

        suggestionItemFactory: function(sId, oContext) {

            // prefix App only for app suggestions
            var app = new sap.m.Label({
                text: {
                    path: "icon",
                    formatter: function(sValue) {
                        if (sValue) {
                            return "<i>" + sap.ushell.resources.i18n.getText("label_app") + "</i>";
                        }
                        return "";
                    }
                }
            }).addStyleClass('suggestText').addStyleClass('suggestNavItem');
            app.addEventDelegate({
                onAfterRendering: function() {
                    searchHelper.boldTagUnescaper(this.getDomRef());
                }
            }, app);

            // suggestion icon (only filled for app suggestions)
            var icon = new sap.ui.core.Icon({
                src: "{icon}"
            }).addStyleClass('suggestIcon').addStyleClass('sapUshellSearchSuggestAppIcon');

            // create label with suggestions term
            var label = new sap.m.Label({
                text: "{label}"
            }).addStyleClass('suggestText').addStyleClass('suggestNavItem');
            label.addEventDelegate({
                onAfterRendering: function() {
                    searchHelper.boldTagUnescaper(this.getDomRef());
                }
            }, label);

            // combine app, icon and label into cell
            var cell = new sap.m.CustomListItem({
                type: sap.m.ListType.Active,
                content: [app, icon, label]
            });
            var suggestion = oContext.oModel.getProperty(oContext.sPath);
            cell.getText = function() {
                return suggestion.labelRaw ? suggestion.labelRaw : '';
            };
            var listItem = new sap.m.ColumnListItem({
                cells: [cell],
                type: "Active"
            });
            if (suggestion.type === SuggestionTypes.SUGGESTION_TYPE_APPS) {
                listItem.addStyleClass('searchAppSuggestion');
            }
            if (suggestion.type === SuggestionTypes.SUGGESTION_TYPE_DATASOURCE) {
                listItem.addStyleClass('searchDataSourceSuggestion');
            }
            if (suggestion.type === SuggestionTypes.SUGGESTION_TYPE_OBJECT_DATA) {
                listItem.addStyleClass('searchBOSuggestion');
            }
            if (suggestion.type === SuggestionTypes.SUGGESTION_TYPE_HISTORY) {
                listItem.addStyleClass('searchHistorySuggestion');
            }
            listItem.addStyleClass('searchSuggestion');
            return listItem;
        },

        navigateToSearchApp: function() {

            // continue?
            if (this.getModel().getProperty('/searchBoxTerm') === "") {
                return;
            }

            if (window.location.hash.indexOf('#Action-search') === 0) {
                // app running -> just fire query
                this.getModel()._searchFireQuery();
            } else {
                // app not running -> start via hash
                // change hash:
                // -do not use Searchhelper.hasher here
                // -this is starting the search app from outside
                var sHash = this.getModel().createSearchURL();
                window.location.hash = sHash;
            }

        }


    });

})();
