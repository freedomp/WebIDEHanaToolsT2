// Oliver+Jian //TODO
// iteration 0 //TODO
/* global window, jQuery, sap, console */
// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function(global) {
    "use strict";

    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchResultListItem");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchLayout");
    jQuery.sap.require("sap.m.BusyDialog");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchResultListItemFooter");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchResultListContainer");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchNoResultScreen");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchFacetFilter");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.DivContainer");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchTilesContainer");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchResultList");
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchFilterBar');

    var SearchLayout = sap.ushell.renderers.fiori2.search.controls.SearchLayout;
    var SearchResultListItem = sap.ushell.renderers.fiori2.search.controls.SearchResultListItem;
    var SearchResultListItemFooter = sap.ushell.renderers.fiori2.search.controls.SearchResultListItemFooter;
    var SearchResultListContainer = sap.ushell.renderers.fiori2.search.controls.SearchResultListContainer;
    var SearchResultList = sap.ushell.renderers.fiori2.search.controls.SearchResultList;
    var SearchNoResultScreen = sap.ushell.renderers.fiori2.search.controls.SearchNoResultScreen;
    var searchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;


    sap.ui.jsview("sap.ushell.renderers.fiori2.search.container.Search", {

        // create content
        // ===================================================================
        createContent: function(oController) {
            var that = this;

            // main result list
            var mainResultList = that.assembleMainResultList();

            // filter contextual bar
            var filterBar = new sap.ushell.renderers.fiori2.search.controls.SearchFilterBar({
                visible: {
                    parts: [{
                        path: '/facetVisibility'
                    }, {
                        path: '/filterConditions'
                    }],
                    formatter: function(facetVisibility, filterConditions) {
                        if (!facetVisibility && filterConditions.length > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            });

            // tabstrips
            that.tabStrips = that.assembleTabStrips();

            // app result list
            that.appSearchResult = that.assembleAppSearch();

            var resultListContainer = new SearchResultListContainer({
                topList: that.appSearchResult,
                bottomList: mainResultList,
                tabStrips: that.tabStrips,
                filterBar: filterBar,
                noResultScreen: new SearchNoResultScreen({
                    searchBoxTerm: '{/lastSearchTerm}',
                    visible: {
                        parts: [{
                            path: '/count'
                        }, {
                            path: '/isBusy'
                        }],
                        formatter: function(count, isBusy) {
                            return count === 0 && !isBusy;
                        }
                    }
                })
            });

            // container for normal search result list + facets
            that.searchLayout = new SearchLayout({
                resultListContainer: resultListContainer,
                busyIndicator: new sap.m.BusyDialog(),
                isBusy: '{/isBusy}',
                showFacets: '{/facetVisibility}',
                vertical: false,
                facets: new sap.ushell.renderers.fiori2.search.controls.SearchFacetFilter()
            });

            // top container
            that.searchContainer = new sap.ushell.renderers.fiori2.search.controls.DivContainer({
                content: that.searchLayout,
                cssClass: 'sapUshellSearchContainer'
            });

            // init search focus handler
            that.oFocusHandler = new searchHelper.SearchFocusHandler(that);

            return that.searchContainer;

        },

        // tabstrips
        // ===================================================================
        assembleTabStrips: function() {

            var that = this;

            var getSelectedDataSource = function(tabBar, selectedKey) {
                var items = tabBar.getItems();
                for (var i = 0; i < items.length; ++i) {
                    var item = items[i];
                    var key = item.getKey() || item.getId();
                    if (key === selectedKey) {
                        return item.getBindingContext().getObject();
                    }
                }
                return null;
            };

            var tabBar = new sap.m.IconTabBar({
                upperCase: true,
                expandable: false,
                visible: {
                    parts: [{
                        path: '/facetVisibility'
                    }, {
                        path: '/count'
                    }],
                    formatter: function(facetVisibility, count) {
                        return !facetVisibility && count > 0;
                    }
                },
                selectedKey: {
                    path: '/tabStrips/selected/key',
                    mode: sap.ui.model.BindingMode.OneWay
                },
                select: function(event) {
                    var selectedKey;
                    if (event.getParameter) {
                        selectedKey = event.getParameter('selectedKey'); // new logic
                    }
                    if (!selectedKey) {
                        selectedKey = tabBar.getSelectedKey(); // fallback old logic
                    }
                    var dataSource = getSelectedDataSource(tabBar, selectedKey);
                    that.getModel().setDataSource(dataSource);
                }
            });
            tabBar.addStyleClass('searchTabStrips');

            tabBar.bindAggregation('items', '/tabStrips/strips', function(sId, oContext) {
                return new sap.m.IconTabFilter({
                    text: '{label}',
                    key: "{key}",
                    content: null
                });

            });

            return tabBar;
        },

        // main result list
        // ===================================================================
        assembleMainResultList: function() {

            var that = this;

            that.resultList = new SearchResultList({
                mode: sap.m.ListMode.None,
                growing: true,
                threshold: 2,
                inset: false,
                showUnread: true,
                width: "auto",
                showNoData: false,
                visible: '{/resultsVisibility}'
            });
            that.resultList.setGrowingThreshold(2000);
            that.resultList.bindAggregation("items", "/results", function(path, bData) {
                return that.assembleListItem(bData);
            });

            return that.resultList;
        },

        // app search area
        // ===================================================================
        assembleAppSearch: function() {

            var that = this;

            // tiles container
            var tileContainer = new sap.ushell.renderers.fiori2.search.controls.SearchTilesContainer({
                maxRows: 99999,
                totalLength: '{/appCount}',
                visible: '{/appsVisibility}',
                highlightTerms: '{/lastSearchTerm}',
                showMore: function() {
                    var model = that.getModel();
                    var newSkip = model.getSkip() + model.getTop();
                    model.setSkip(newSkip, false);
                    var newTop = 10 * tileContainer.getTilesPerRow();
                    model.setTop(newTop);
                }
            });

            tileContainer.bindAggregation('tiles', '/appResults', function(sId, oContext) {
                var tile = oContext.getObject().tile;
                var view = sap.ushell.Container.getService('LaunchPage').getCatalogTileView(tile);
                if (tile.getTitle) {
                    view.usageAnalyticsTitle = tile.getTitle();
                } else {
                    view.usageAnalyticsTitle = 'app';
                }
                return view;
            });

            tileContainer.addStyleClass('sapUshellSearchTileResultList');

            sap.ui.getCore().getEventBus().subscribe('searchLayoutChanged', function() {
                tileContainer.delayedRerender();
            }, this);

            return tileContainer;
        },

        // assemble title item
        // ===================================================================
        assembleTitleItem: function(oData) {
            var item = new sap.m.CustomListItem();
            var title = new sap.m.Label({
                text: "{title}"
            });
            title.addStyleClass('bucketTitle');
            item.addStyleClass('bucketTitleContainer');
            item.addContent(new sap.m.HBox({
                items: [title]
            }));
            return item;
        },

        // assemble search result footer item (show more button)
        // ===================================================================
        assembleFooterItem: function(oData) {
            var that = this;

            that.footerItem = new SearchResultListItemFooter({
                text: "{i18n>showMore}",
                showMore: function() {
                    var oCurrentModel = that.getModel();
                    var newSkip = oCurrentModel.getSkip() + 10;
                    oCurrentModel.setSkip(newSkip);
                }
            });

            var listItem = new sap.m.CustomListItem({
                content: that.footerItem
            });
            listItem.addStyleClass('sapUshellSearchResultListFooter');

            return listItem;
        },

        // assemble app container result list item
        // ===================================================================
        assembleAppContainerResultListItem: function(oData, path) {
            var that = this;
            var container = new sap.ushell.renderers.fiori2.search.controls.SearchTilesContainer({
                maxRows: sap.ui.Device.system.phone ? 2 : 1,
                totalLength: '{/appCount}',
                highlightTerms: '{/lastSearchTerm}',
                enableKeyHandler: false,
                showMore: function() {
                    var model = that.getModel();
                    model.setDataSource(model.appDataSource);
                }
            });
            container.bindAggregation('tiles', 'tiles', function(sId, oContext) {
                var tile = oContext.getObject().tile;
                var view = sap.ushell.Container.getService('LaunchPage').getCatalogTileView(tile);
                if (tile.getTitle) {
                    view.usageAnalyticsTitle = tile.getTitle();
                } else {
                    view.usageAnalyticsTitle = 'app';
                }
                return view;
            });

            var listItem = new sap.m.CustomListItem({
                content: container
            });
            listItem.addStyleClass('sapUshellSearchResultListItem');
            listItem.addStyleClass('sapUshellSearchResultListItemApps');

            sap.ui.getCore().getEventBus().subscribe('searchLayoutChanged', function() {
                container.delayedRerender();
            }, this);

            return listItem;
        },

        // assemble search result list item
        // ===================================================================
        assembleResultListItem: function(oData, path) {
            var item = new SearchResultListItem({
                title: "{$$Name$$}",
                titleUrl: "{uri}",
                type: "{dataSourceName}",
                imageUrl: "{imageUrl}",
                data: oData
            });

            var listItem = new sap.m.CustomListItem({
                content: item
            });
            listItem.addStyleClass('sapUshellSearchResultListItem');

            return listItem;
        },

        // assemble search result list item
        // ===================================================================
        assembleListItem: function(bData) {
            var that = this;
            var oData = bData.getObject();
            if (oData.type === 'title') {
                return that.assembleTitleItem(oData);
            } else if (oData.type === 'footer') {
                return that.assembleFooterItem(oData);
            } else if (oData.type === 'appcontainer') {
                return that.assembleAppContainerResultListItem(oData, bData.getPath());
            } else {
                return that.assembleResultListItem(oData, bData.getPath());
            }
        },

        // event handler search started
        // ===================================================================
        onAllSearchStarted: function() {
            if (this.oTilesContainer) {
                this.oTilesContainer.resetGrowing();
            }
            window.focusTrap = false;
        },

        // event handler search finished
        // ===================================================================
        onAllSearchFinished: function() {
            this.oFocusHandler.setFocus();
        },


        // event handler normal search finished
        // ===================================================================
        onNormalSearchFinished: function() {
            sap.ui.getCore().getEventBus().publish("closeCurtain");
        },

        // event handler app search finished
        // ===================================================================
        onAppSearchFinished: function(bla, blub, oResult) {

        },

        // set appview container
        // ===================================================================
        setAppView: function(oAppView) {
            var that = this;
            that.oAppView = oAppView;
            if (that.oTilesContainer) {
                that.oTilesContainer.setAppView(oAppView);
            }
        },

        // get controller name
        // ===================================================================
        getControllerName: function() {
            return "sap.ushell.renderers.fiori2.search.container.Search";
        }
    });


}(window));
