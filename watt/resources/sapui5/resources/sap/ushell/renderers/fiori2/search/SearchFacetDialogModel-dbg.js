/* global jQuery,window */
(function(global) {
    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchModel');

    sap.ushell.renderers.fiori2.search.SearchModel.extend("sap.ushell.renderers.fiori2.search.SearchFacetDialogModel", {

        constructor: function() {

            var that = this;

            sap.ushell.renderers.fiori2.search.SearchModel.prototype.constructor.apply(that, []);

            // create sina query for facet dialog popover
            that.facetQuery = that.sina.createPerspectiveQuery({
                templateFactsheet: true
            });

            that.aFilters = [];
            that.aAttributsMetaData = [];
        },

        facetDialogCall: function() {
            var that = this;

            that.facetQuery.setSearchTerms("*");
            that.facetQuery.setDataSource(that.getDataSource());
            that.facetQuery.setSkip(0);
            that.facetQuery.setFacetOptions({});
            that.resetFacetQueryFilterConditions();
            that.facetQuery.setExpand(['Grid', 'Items', 'ResultsetFacets', 'TotalCount']);
            return that.facetQuery.getResultSet().then(function(perspective) {
                // 1.1 search succeeded
                that.aAttributesMetaData = perspective.searchresultset.elements[0];
                that.setProperty('/facetDialog', that.oFacetFormatter.getDialogFacets(that.getDataSource(), perspective, that));
            }, function(error) {
                // 1.2 search failed
                return jQuery.when(true); // make deferred returned by "then" resolved
            });
        },

        //properties: sAttribute, sBindingPath
        facetDialogSingleCall: function(properties) {
            var that = this;

            that.facetQuery.setSearchTerms("*");
            that.facetQuery.setDataSource(that.getDataSource());
            that.facetQuery.setSkip(0);
            that.facetQuery.setFacetOptions({
                "MaxNumberOfReturnValues": 1000,
                "Attributes": [properties.sAttribute]
            });
            that.facetQuery.setExpand(['Grid', 'Items', 'ResultsetFacets', 'TotalCount']);

            return that.facetQuery.getResultSet().then(function(perspective) {
                var aFacets = that.oFacetFormatter.getDialogFacets(that.getDataSource(), perspective, that);
                var aItems = [];
                jQuery.each(aFacets, function(i, facet) {
                    if (properties.sAttribute === facet.dimension) {
                        aItems = facet.items;
                    }
                });
                that.setProperty(properties.sBindingPath + "/items", aItems);
            });
        },

        resetFacetQueryFilterConditions: function() {
            var that = this;
            that.facetQuery.resetFilterConditions();
            that.facetQuery.addFilterCondition('$$RenderingTemplatePlatform$$', '=', 'html');
            that.facetQuery.addFilterCondition('$$RenderingTemplateTechnology$$', '=', 'Tempo');
            that.facetQuery.addFilterCondition('$$RenderingTemplateVariant$$', '=', '');
            that.facetQuery.addFilterCondition('$$RenderingTemplateType$$', '=', 'ItemDetails');
            that.facetQuery.addFilterCondition('$$RenderingTemplateType$$', '=', 'ResultItem');
        },

        hasFilter: function(item) {
            var that = this;
            var filterCondition = item.filterCondition;
            for (var i = 0; i < that.aFilters.length; i++) {
                if (that.aFilters[i].filterCondition.equals && that.aFilters[i].filterCondition.equals(filterCondition)) {
                    return true;
                }
            }
            return false;
        },

        addFilter: function(item) {
            var that = this;
            var filterCondition = item.filterCondition;
            if (!that.hasFilter(filterCondition)) {
                that.aFilters.push(item);
            }
        },

        removeFilter: function(item) {
            var that = this;
            var filterCondition = item.filterCondition;
            for (var i = 0; i < that.aFilters.length; i++) {
                if (that.aFilters[i].filterCondition.equals && that.aFilters[i].filterCondition.equals(filterCondition)) {
                    that.aFilters.splice(i, 1);
                    return;
                }
            }
        },

        changeFilterAdvaced: function(item, bAdvanced) {
            var that = this;
            var filterCondition = item.filterCondition;
            for (var i = 0; i < that.aFilters.length; i++) {
                if (that.aFilters[i].filterCondition.equals && that.aFilters[i].filterCondition.equals(filterCondition)) {
                    that.aFilters[i].advanced = bAdvanced;
                    return;
                }
            }
        }

    });

})(window);
