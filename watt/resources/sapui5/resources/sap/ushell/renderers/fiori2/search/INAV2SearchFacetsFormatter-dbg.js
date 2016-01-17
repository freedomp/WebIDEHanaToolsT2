(function() {
    "use strict";

    jQuery.sap.require("sap.ui.core.format.NumberFormat");
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.INAV2SearchFacetsFormatter');
    var module = sap.ushell.renderers.fiori2.search.INAV2SearchFacetsFormatter = function() {
        this.init.apply(this, arguments);
    };

    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.Facet');
    var Facet = sap.ushell.renderers.fiori2.search.Facet = function() {
        this.init.apply(this, arguments);
    };

    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.FacetItem');
    var FacetItem = sap.ushell.renderers.fiori2.search.FacetItem = function() {
        this.init.apply(this, arguments);
    };

    // =======================================================================
    // Facet
    // =======================================================================
    Facet.prototype = {

        init: function(properties) {
            this.title = properties.title;
            this.facetType = properties.facetType; //datasource or attribute
            this.dimension = properties.dimension;
            this.items = properties.items || [];
        },

        /**
         * Checks if the facet has the given filter condition
         * @param   {object}  filterCondition the condition to check for in this facet
         * @returns {Boolean} true if the filtercondition was found in this facet
         */
        hasFilterCondition: function(filterCondition) {
            for (var i = 0, len = this.items.length; i < len; i++) {
                var fc = this.items[i].filterCondition || this.items[i];
                if (fc.equals && fc.equals(filterCondition)) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Checks if this facet has at least one filter condition
         * @returns {Boolean} true if it has at least one filter condition, false otherwise
         */
        hasFilterConditions: function() {
            for (var i = 0, len = this.items.length; i < len; i++) {
                if (this.items[i].filterCondition) {
                    return true;
                }
            }
            return false;
        },

        removeItem: function(facetItem) {
            for (var i = 0, len = this.items.length; i < len; i++) {
                var fc = this.items[i].filterCondition || this.items[i];
                if (fc.equals && facetItem.filterCondition && fc.equals(facetItem.filterCondition)) {
                    return this.items.splice(i, 1);
                }
            }
        }

    };


    FacetItem.prototype = {

        init: function(properties) {
            var sina = sap.ushell.Container.getService("Search").getSina();
            this.id = properties.id;
            this.label = properties.label;
            this.value = properties.value;
            this.valueLabel = typeof this.value === "number" ? sap.ui.core.format.NumberFormat.getIntegerInstance({
                style: "short"
                    //style: "standard",
                    //groupingEnabled: true
            }).format(this.value) : "";
            this.facetTitle = properties.facetTitle || "";
            if (properties.filterCondition.attribute) { //is it an attribute filter?
                var condition = this.createSinaFilterCondition(properties.filterCondition);
                this.filterCondition = condition;
            } else if (properties.filterCondition.conditions) { //or a filter group
                var conditionGroup = sina.createFilterConditionGroup(properties.filterCondition);
                for (var i = 0, len = conditionGroup.conditions.length; i < len; i++) {
                    //replace plain objects with instances of sina filter conditions
                    conditionGroup.conditions[i] =
                        this.createSinaFilterCondition(conditionGroup.conditions[i]);
                }
                this.filterCondition = conditionGroup;
            } else {
                this.filterCondition = properties.filterCondition;
            }
            this.selected = properties.selected;
            this.level = properties.level ||  0;
        },

        equals: function(otherFacetItem) {
            return (this.id === otherFacetItem.id && this.label === otherFacetItem.label && this.value === otherFacetItem.value && this.filterCondition.equals(otherFacetItem.filterCondition));
        },

        createSinaFilterCondition: function(properties) {
            // special create logic: inav2 extended properties need to be passed to 
            // sina filter constructor on properties level
            // otherwise recursive structures will be created
            var sina = sap.ushell.Container.getService("Search").getSina();
            if (properties.inaV2_extended_properties) {
                var newProperties = jQuery.extend({}, properties);
                delete newProperties.inaV2_extended_properties;
                var inaV2ExtendedProperties = jQuery.extend({}, properties.inaV2_extended_properties);
                delete inaV2ExtendedProperties.attribute;
                delete inaV2ExtendedProperties.operator;
                delete inaV2ExtendedProperties.value;
                newProperties = jQuery.extend(newProperties, inaV2ExtendedProperties);

                return sina.createFilterCondition(newProperties);
            } else {
                return sina.createFilterCondition(properties);
            }
        }

    };

    module.prototype = {
        init: function() {
            this.level = 0;
        },

        _getAllDataSourceFacetItem: function(oSearchModel) {
            var allDataSource = oSearchModel.allDataSource;
            var fi = new FacetItem({
                label: allDataSource.getLabelPlural(),
                filterCondition: allDataSource,
                selected: oSearchModel.getProperty("/dataSource").equals(allDataSource),
                level: 0
            });
            if (fi.selected) {
                //count is only correct if all is selected
                fi.value = oSearchModel.getProperty("/boCount") + oSearchModel.getProperty("/appCount");
            }
            return fi;
        },

        _getAppsDataSourceFacetItem: function(oSearchModel) {
            var appDataSource = oSearchModel.appDataSource;
            var fi = new FacetItem({
                label: appDataSource.getLabelPlural(),
                filterCondition: appDataSource,
                selected: oSearchModel.getProperty("/dataSource").equals(appDataSource),
                value: oSearchModel.getProperty("/appCount"),
                level: 1
            });
            return fi;
        },

        _getCurrentDataSourceFacetItem: function(oSearchModel) {
            var currentDS = oSearchModel.getProperty("/dataSource");
            if (currentDS.equals(oSearchModel.appDataSource)) {
                return this._getAppsDataSourceFacetItem(oSearchModel);
            }
            if (currentDS.equals(oSearchModel.allDataSource)) {
                return this._getAllDataSourceFacetItem(oSearchModel);
            }
            var currentDSFacetItem = new FacetItem({
                label: currentDS.getLabelPlural(),
                value: oSearchModel.getProperty("/boCount"),
                filterCondition: currentDS,
                selected: true,
                level: this.level
            });
            return currentDSFacetItem;
        },

        _getRecentDataSourcesTree: function(oSearchModel) {
            var aRecentDataSources = [];
            for (var i = 0, len = oSearchModel.getProperty('/recentDataSources').length; i < len; i++) {
                var ds = oSearchModel.getProperty('/recentDataSources')[i];
                if (!ds) {
                    continue;
                }
                var dsFacetItem = new FacetItem({
                    label: ds.getLabelPlural(),
                    filterCondition: ds,
                    selected: false,
                    level: 0
                });
                aRecentDataSources.push(dsFacetItem);
            }
            return aRecentDataSources;
        },

        getDataSourceFacetFromPerspective: function(oINAPerspective, oSearchModel) {
            var that = this;
            var oDataSourceFacet = new Facet({
                facetType: "datasource",
                title: "Search In"
            });
            var currentDS = oSearchModel.getProperty("/dataSource");
            var currentDSFacetItem;
            this.level = 0;
            var aAllDataSourceFacetItems = oINAPerspective.getChartFacets().filter(function(element) {
                return element.facetType === "datasource";
            });
            if (aAllDataSourceFacetItems.length > 0 && aAllDataSourceFacetItems[0].query.resultSet.elements.length > 0) {
                aAllDataSourceFacetItems = aAllDataSourceFacetItems[0].query.resultSet.elements;
            } else {
                aAllDataSourceFacetItems = [];
            }

            function addChildrenOfCurrentDS(level) {
                //add children with data from the perspective call:
                for (var j = 0, lenJ = aAllDataSourceFacetItems.length; j < lenJ; j++) {
                    var ds = aAllDataSourceFacetItems[j].dataSource;
                    var fi = new FacetItem({
                        label: ds.getLabelPlural(),
                        value: aAllDataSourceFacetItems[j].valueRaw,
                        filterCondition: ds,
                        selected: currentDS.equals(ds),
                        level: level || that.level
                    });
                    oDataSourceFacet.items.push(fi);
                }
            }

            oDataSourceFacet.items.push(this._getAllDataSourceFacetItem(oSearchModel));
            this.level++;
            if (currentDS.equals(oSearchModel.allDataSource)) {
                oDataSourceFacet.items.push(this._getAppsDataSourceFacetItem(oSearchModel));
                addChildrenOfCurrentDS();
                return oDataSourceFacet;
            }

            // add parent DS
            oDataSourceFacet.items.push.apply(oDataSourceFacet.items, this._getRecentDataSourcesTree(oSearchModel));

            // 1) get children of parent DS (aka the siblings of the currentDS)
            var parentNode;
            if (oSearchModel.dataSourceTree.findNode(currentDS)) {
                parentNode = oSearchModel.dataSourceTree.findNode(currentDS).parent;
            }
            // 2) iterate through the children and create facet items with data from the dataSourceTree
            if (parentNode) {
                for (var i = 0, len = parentNode.children.length; i < len; i++) {
                    var siblingNode = parentNode.children[i];
                    var siblingDS = siblingNode.dataSource;
                    var siblingFacetItem = new FacetItem({
                        label: siblingDS.getLabelPlural(),
                        value: siblingNode.count,
                        filterCondition: siblingDS,
                        selected: false,
                        level: that.level
                    });
                    // add the app datasource at the appropriate position:
                    if (siblingDS.equals(oSearchModel.appDataSource)) {
                        oDataSourceFacet.items.splice(1, 0, siblingFacetItem);
                    } else {
                        oDataSourceFacet.items.push(siblingFacetItem);
                    }
                    // 3) is child === currentDS?
                    if (siblingDS.equals(currentDS)) {
                        // 4) YES -> add children of currentDS
                        currentDSFacetItem = siblingFacetItem;
                        currentDSFacetItem.selected = true;
                        if (!siblingDS.equals(oSearchModel.appDataSource)) {
                            addChildrenOfCurrentDS(that.level + 1);
                        }
                    }

                }
            }

            if (!currentDSFacetItem) {
                // current DS was not found in parent, so current DS is root
                // probaby after a page refresh
                oDataSourceFacet.items.push(this._getCurrentDataSourceFacetItem(oSearchModel));
                addChildrenOfCurrentDS();
            }

            return oDataSourceFacet;
        },

        getAttributeFacetsFromPerspective: function(resultSet, oSearchModel, bFacetDialog) {
            var aServerSideFacets = resultSet.getChartFacets().filter(function(element) {
                return element.facetType === "attribute";
            });
            var aClientSideFacets = [];
            var oClientSideFacetsWithSelection = {};
            var aClientSideFacetsByTitle = {};
            var aSelectedFacetItems = oSearchModel.getProperty("/filterConditions").reverse();

            // extract facets from server response:
            for (var i = 0, len = aServerSideFacets.length; i < len; i++) {
                var oServerSideFacet = aServerSideFacets[i];
                var oClientSideFacet = new Facet({
                    title: oServerSideFacet.title,
                    facetType: oServerSideFacet.facetType,
                    dimension: oServerSideFacet.dimension
                });
                if (!oServerSideFacet.query.resultSet || !oServerSideFacet.query.resultSet.elements || oServerSideFacet.query.resultSet.elements.length === 0) {
                    continue;
                }
                for (var j = 0; j < oServerSideFacet.query.resultSet.elements.length; j++) {
                    var oFacetListItem = oServerSideFacet.query.resultSet.elements[j];
                    var item = new FacetItem({
                        value: oFacetListItem.valueRaw,
                        filterCondition: oFacetListItem.dataSource || oFacetListItem.labelRaw,
                        facetTitle: oServerSideFacet.title,
                        label: oFacetListItem.label,
                        selected: false,
                        level: 0
                    });
                    if (bFacetDialog) {
                        item.advanced = false;
                    }
                    oClientSideFacet.items.push(item);
                }
                aClientSideFacetsByTitle[oServerSideFacet.title] = oClientSideFacet;
                aClientSideFacets.push(oClientSideFacet);
            }

            // add selected facet items:
            for (var k = 0, lenK = aSelectedFacetItems.length; k < lenK; k++) {
                var oSelectedFacetItem = aSelectedFacetItems[k];
                var oClientSideFacetWithSelection = aClientSideFacetsByTitle[oSelectedFacetItem.facetTitle];
                oSelectedFacetItem.selected = true;
                oSelectedFacetItem.value = null;
                oSelectedFacetItem.valueLabel = null;
                if (!oClientSideFacetWithSelection) {
                    // facet was not send from server -> create it
                    oClientSideFacetWithSelection = new Facet({
                        dimension: oSelectedFacetItem.filterCondition.attribute ? oSelectedFacetItem.filterCondition.attribute : oSelectedFacetItem.filterCondition.conditions[0].attribute,
                        title: oSelectedFacetItem.facetTitle,
                        facetType: "attribute",
                        items: [oSelectedFacetItem]
                    });
                    aClientSideFacetsByTitle[oSelectedFacetItem.facetTitle] = oClientSideFacetWithSelection;
                    aClientSideFacets.splice(0, 0, oClientSideFacetWithSelection); //insert selected facets on top
                } else {
                    // remove and insert selected facet on top, only in facet panel
                    if (!bFacetDialog) {
                        var indexOfClientSideFacetWithSelection = aClientSideFacets.indexOf(oClientSideFacetWithSelection);
                        aClientSideFacets.splice(indexOfClientSideFacetWithSelection, 1);
                        aClientSideFacets.splice(0, 0, oClientSideFacetWithSelection);
                    }
                    // facet with the same title as a already selected facetitems facet was sent by the server
                    // -> merge the item into this facet. If the same facet item already exists just select it
                    var facetItemFoundInFacet = false;
                    for (var m = 0, lenM = oClientSideFacetWithSelection.items.length; m < lenM; m++) {
                        var facetItem = oClientSideFacetWithSelection.items[m];
                        if (oSelectedFacetItem.filterCondition.equals(facetItem.filterCondition)) {
                            facetItem.selected = true;
                            facetItemFoundInFacet = true;
                            if (!bFacetDialog) {
                                facetItem.value = null;
                                facetItem.valueLabel = null;
                            }
                        }
                    }
                    if (!facetItemFoundInFacet) {
                        // there is no such facet item -> add the facet item to the facet
                        oClientSideFacetWithSelection.items.splice(0, 0, oSelectedFacetItem);
                        if (bFacetDialog) {
                            oSelectedFacetItem.advanced = true;
                            if (oSelectedFacetItem.filterCondition.attribute) {
                                var dataType = oSearchModel.aAttributesMetaData[oSelectedFacetItem.filterCondition.attribute].$$MetaData$$.dataType;
                                if (dataType === "Double") {
                                    oSelectedFacetItem.advanced = false;
                                }
                            }
                        }
                    }
                }
                oClientSideFacetsWithSelection[oSelectedFacetItem.facetTitle] = oClientSideFacetWithSelection;
            }

            if (!bFacetDialog) {
                // remove all unselected attributes in facets which have selections
                // and make them single selected
                for (var facetTitle in oClientSideFacetsWithSelection) {
                    if (oClientSideFacetsWithSelection.hasOwnProperty(facetTitle)) {
                        var facet = oClientSideFacetsWithSelection[facetTitle];
                        for (var n = facet.items.length - 1; n >= 0; n--) {
                            var itemN = facet.items[n];
                            if (!itemN.selected) {
                                facet.items.splice(n, 1);
                            }
                        }
                    }
                }
            }

            return aClientSideFacets;
        },

        getFacets: function(oDataSource, oINAPerspective, oSearchModel) {

            // return without perspective
            if (!oINAPerspective) {
                return [];
            }

            // generate datasource facet
            var aFacets = [this.getDataSourceFacetFromPerspective(oINAPerspective, oSearchModel)];

            // check attribute facets enabled
            if (!oSearchModel.isFacetSearchEnabled()) {
                return aFacets;
            }

            // generate attribute facets
            if (!oDataSource.equals(oSearchModel.appDataSource)) {
                var aAttributeFacets = this.getAttributeFacetsFromPerspective(oINAPerspective, oSearchModel, false);
                if (aAttributeFacets.length > 0) {
                    aFacets.push.apply(aFacets, aAttributeFacets);
                }
            }

            return aFacets;
        },

        getDialogFacets: function(oDataSource, oINAPerspective, oSearchModel) {

            //            var aFacets = this.getFacets(oDataSource, oINAPerspective, oSearchModel);
            //            var oSearchFacet = new Facet({
            //                facetType: "search",
            //                title: "Search For"
            //            });
            //            aFacets.splice(1, 0, oSearchFacet);
            var aFacets = [];

            if (!oDataSource.equals(oSearchModel.appDataSource)) {
                aFacets = this.getAttributeFacetsFromPerspective(oINAPerspective, oSearchModel, true);
            }

            return aFacets;
        }

    };

})();
