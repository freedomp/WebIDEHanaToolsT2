// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, $ */
    /*jslint nomen: true */

    jQuery.sap.require("sap.ui.core.IconPool");
    jQuery.sap.require("sap.ushell.ui.launchpad.Tile");
    jQuery.sap.require("sap.ushell.ui.launchpad.TileContainer");
    jQuery.sap.require("sap.ushell.ui.launchpad.Panel");

    sap.ui.jsview("sap.ushell.components.flp.launchpad.catalog.Catalog", {

        oController: null,

        createContent: function (oController) {
            this.parentComponent = sap.ui.core.Component.getOwnerComponentFor(this);
            var oModel = this.parentComponent.getModel();
            this.setModel(oModel);
            this.oController = oController;
            this.addEventDelegate({
                onAfterShow: function () {
                    var homeBtn = sap.ui.getCore().byId("homeBtn");
                    if (homeBtn) {
                        sap.ushell.renderers.fiori2.RendererExtensions.addHeaderItem(homeBtn, "home");
                    }
                },
                onBeforeShow: function () {
                    oModel.setProperty("/currentViewName", "catalog");
                    //hide header in mobile
                    var isMobile = sap.ui.Device.system.phone;
                    sap.ushell.renderers.fiori2.RendererExtensions.setHeaderHiding(isMobile);
                    //Close left panel if it is opened
                    sap.ushell.renderers.fiori2.RendererExtensions.setLeftPaneVisibility("home", false);

                },

                onAfterHide: function () {
                    var homeBtn = sap.ui.getCore().byId("homeBtn");
                    if (homeBtn) {
                        sap.ushell.renderers.fiori2.RendererExtensions.removeHeaderItem(homeBtn, "home");
                    }
                }
            });

            function iflong(sLong) {
                return ((sLong !== null) && (sLong === "1x2" || sLong === "2x2")) || false;
            }
            function iftall(size) {
                return ((size !== null) && (size === "2x2" || size === "2x1")) || false;
            }
            function to_int(v) {
                return parseInt(v, 10) || 0;
            }
            function get_icon(aGroupsIDs, sGroupContextModelPath, sGroupContextId) {
                var sIconName;

                if (sGroupContextModelPath) {

                   // If in group context - the icon is determined according to whether this catalog tile exists in the group or not   
                    var iCatalogTileInGroup = $.inArray(sGroupContextId, aGroupsIDs);
                    sIconName = iCatalogTileInGroup !== -1 ? "accept" : "add";
                } else {
                    sIconName = (aGroupsIDs && aGroupsIDs.length > 0) ? "accept" : "add";
                }
                return sap.ui.core.IconPool.getIconURI(sIconName);
            }

            function get_tooltip(sAddTileGroups, sAddTileToMoreGroups, aGroupsIDs, sGroupContextModelPath, sGroupContextId, sGroupContextTitle) {
                var sTooltip;

                if (sGroupContextModelPath) {
                    var oResourceBundle = sap.ushell.resources.i18n,
                        iCatalogTileInGroup = $.inArray(sGroupContextId, aGroupsIDs);

                    sTooltip = oResourceBundle.getText(iCatalogTileInGroup !== -1 ? "removeAssociatedTileFromContextGroup" : "addAssociatedTileToContextGroup", sGroupContextTitle);
                } else {
                    sTooltip = aGroupsIDs && aGroupsIDs.length ? sAddTileToMoreGroups : sAddTileGroups;
                }
                return sTooltip;
            }

            var oButton = new sap.m.Button({
                icon : {
                    // The "parts" array includes /groupContext/path and associatedGroups/length in order to support tile footer icon change in two cases:
                    //  1. When the catalog is in the context of a group, and the user navigates back to the dashboard  
                    //      and then opens the catalog again, but this time not in a context of a group.
                    //      In this case the footer icons should be changed  and the trigger is the change in /groupContext property in the model.    
                    //  2. When the catalog is in the context of a group, and the user clicks a tile's footer.
                    //     In this case the icon should be changed, and the trigger is the item that is added/removed to/from associatedGroups 
                    //     (i.e. the change in the length of associatedGroups of the relevant catalog tile model)
                    parts: ["associatedGroups", "associatedGroups/length", "/groupContext/path", "/groupContext/id"],
                    formatter : function (aAssociatedGroups, associatedGroupsLength, sGroupContextModelPath, sGroupContextId) {
                        return get_icon(aAssociatedGroups, sGroupContextModelPath, sGroupContextId);
                    }
                },
                tooltip: {
                    parts: ["i18n>addTileToGroup", "i18n>addAssociatedTileToGroup", "associatedGroups", "associatedGroups/length", "/groupContext/path", "/groupContext/id", "/groupContext/title"],
                    formatter : function (sAddTileGroups, sAddTileToMoreGroups, aGroupsIDs, associatedGroupsLength, sGroupContextModelPath, sGroupContextId, sGroupContextTitle) {
                        return get_tooltip(sAddTileGroups, sAddTileToMoreGroups, aGroupsIDs, sGroupContextModelPath, sGroupContextId, sGroupContextTitle);
                    }
                },
                press : [ oController.onTileFooterClick, oController ]
            }), oTileTemplate = new sap.ushell.ui.launchpad.Tile({
                afterRendering : [ oController.onTileAfterRendering, oController ],
                tileViews : {
                    path : "content",
                    factory : function (sId, oContext) { return oContext.getObject(); }
                },
                footItems : [oButton],
                "long" : {
                    path : "size",
                    formatter : iflong
                },
                "tall" : {
                    path : "size",
                    formatter : iftall
                },
                index: {
                    path : "id",
                    formatter : to_int
                },
                tileCatalogId : "{id}",
                press : [ oController.catalogTilePress, oController ]
            }), tilesContainer = new sap.ushell.ui.launchpad.TileContainer("catalogTiles", {
                showHeader : false,
                showPlaceholder : false,
                showGroupHeader : "{/showCatalogHeaders}",
                noDataText: "{/catalogsNoDataText}",
                groupHeaderLevel : sap.m.HeaderLevel.H3,
                showNoData : true,
                tiles : {
                    path : "/catalogTiles",
                    template : oTileTemplate,
                    sorter : new sap.ui.model.Sorter("catalogIndex", false, function (oContext) {
                        return (oContext && oContext.getProperty("catalog")) || "";
                    })
                },
                afterRendering : function (oEvent) {
                    var oModel = this.getModel(),
                        buttons,
                        i;
                    //because the catalog can be loaded with a filter in the URL we also have to
                    //check if tiles exist in the model, and not just in the UI control
                    if (this.getTiles().length || oModel.getProperty('/catalogTiles/length')) {
                        //Enable tiles search/filter only after tiles are rendered.
                        //Timeout needed because of some bug in UI5 that doesn't enable control on this point.
                        setTimeout(function () {
                            sap.ui.getCore().byId("catalogSearch").setEnabled(true);
                        });
                        oModel.setProperty("/catalogsNoDataText", sap.ushell.resources.i18n.getText('noFilteredItems'));
                        sap.ui.getCore().getEventBus().publish("launchpad", "contentRendered");
                        if (!sap.ui.Device.os.ios) {
                            sap.ui.getCore().getEventBus().publish("launchpad", "contentRefresh");
                        }
                    }
                    jQuery.sap.byId("catalogTiles").removeAttr("tabindex", 0);
                    jQuery.sap.byId("catalogTilesPage-intHeader-BarPH").removeAttr("tabindex", 0);

                    // disable '+/v' buttons tabindex so the won't be part of the TAB cycle
                    buttons = jQuery(".sapUshellTile button");
                    for (i = 0; i < buttons.length; i++) {
                        buttons[i].setAttribute("tabindex", -1);
                    }
                }
            });

            tilesContainer.addEventDelegate({
                onsapskipback: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        var nextElement = jQuery("#catalogSelect");
                        nextElement.focus();
                    } catch (e) {
                    }
                }
            });

            oButton.constructor.prototype.setIcon = function (v) {
                this.setProperty("icon", v, true);          // set property, but suppress rerendering
                if (v && this._image && this._image.setSrc) {
                    this._image.setSrc(v);                  // set property of internal control
                }
                return this;
            };

            var oFilterVisibleTiles = new sap.ui.model.Filter("numIntentSupportedTiles", sap.ui.model.FilterOperator.NE, 0),
                oCatalogSelect = new sap.m.Select("catalogSelect", {
                    visible: "{/catalogSelection}",
                    name : "Browse",
                    tooltip: "{i18n>catalogSelect_tooltip}",
                    width: "17rem",
                    items : {
                        path : "/catalogs",
                        template : new sap.ui.core.ListItem({
                            text : "{title}"
                        }),
                        filters: [oFilterVisibleTiles]
                    },
                    change : [ oController.onCategoryFilter, oController ]
                }),

            /*
             override original onAfterRendering as currently sap.m.Select
             does not support afterRendering handler in the constructor
             this is done to support tab order accessibility
             */
                origCatalogSelectOnAfterRendering = oCatalogSelect.onAfterRendering;
            oCatalogSelect.addEventDelegate({
                onsapskipforward: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                        sap.ushell.components.flp.ComponentKeysHandler.setFocusOnCatalogTile();
                        var firstTile = jQuery('#catalogTiles .sapUshellTile:visible:first');
                        firstTile.focus();
                    } catch (e) {
                    }
                },
                onsaptabprevious: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                        var nextElement = jQuery("#catalogTilesPage header button")[0];
                        nextElement.focus();
                    } catch (e) {
                    }
                },
                onsapskipback: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                        var nextElement = jQuery("#catalogTilesPage header button")[0];
                        nextElement.focus();
                    } catch (e) {
                    }
                }
            });
            // if xRay is enabled
            if (oModel.getProperty("/enableHelp")) {
                oCatalogSelect.addStyleClass('help-id-catalogCategorySelect');// xRay help ID
            }
            oCatalogSelect.onAfterRendering = function () {
                if (origCatalogSelectOnAfterRendering) {
                    origCatalogSelectOnAfterRendering.apply(this, arguments);
                }
                jQuery.sap.byId("catalogSelect").attr("tabindex", 0);
            };

            /*
             * setting followOf to false, so the popover won't close on IE.
             */
            var origOnAfterRenderingPopover = oCatalogSelect._onAfterRenderingPopover;
            oCatalogSelect._onAfterRenderingPopover = function () {
                if (this._oPopover) {
                    this._oPopover.setFollowOf(false);
                }
                if (origOnAfterRenderingPopover) {
                    origOnAfterRenderingPopover.apply(this, arguments);
                }
            };

            var oCatalogSearch = new sap.m.SearchField("catalogSearch", {
                    visible: "{/searchFiltering}",
                    tooltip: "{i18n>catalogSearch_tooltip}",
                    width: "17rem",
                    enabled: false, //we Disable search/filtering of tiles till they will be rendered, to avoid bugs.
                    value: {path: "/catalogSearchFilter"},
                    placeholder: "{i18n>search_catalog}",
                    liveChange : [ oController.onLiveFilter, oController ]
                }).addStyleClass("sapUshellCatalogSearch"),

                /*
                 override original onAfterRendering as currently sap.m.Select
                 does not support afterRendering handler in the constructor,
                 this is done to support tab order accessibility
                */
                origCatalogSearchOnAfterRendering = oCatalogSearch.onAfterRendering;

            // if xRay is enabled
            if (oModel.getProperty("/enableHelp")) {
                oCatalogSearch.addStyleClass('help-id-catalogSearch');// xRay help ID
            }
            oCatalogSearch.onAfterRendering = function () {
                origCatalogSearchOnAfterRendering.apply(this, arguments);
                jQuery.sap.byId("catalogSearch").find("input").attr("tabindex", 0);
                //set as large element for F6 keyboard navigation
                this.data("sap-ui-fastnavgroup", "true", true /*Write into DOM*/);
            };

            oCatalogSearch.addEventDelegate({
                onsapskipback: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        var nextElement = jQuery("#catalogTilesPage header button")[0];
                        nextElement.focus();
                    } catch (e) {
                    }
                },
                onsapskipforward: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        var firstTile = jQuery('#catalogTiles .sapUshellTile:visible:first');
                        sap.ushell.components.flp.ComponentKeysHandler.setTileFocus(firstTile);
                    } catch (e) {
                    }
                },
                onsaptabnext: function (oEvent) {
                    try {
                        if (!oCatalogTagFilter.getVisible()) {
                            oEvent.preventDefault();
                            var aVisibleTiles = jQuery(".sapUshellTile:visible"),
                                jqTile = jQuery(aVisibleTiles[0]);
                            sap.ushell.components.flp.ComponentKeysHandler.setFocusOnCatalogTile();
                            jqTile.focus();
                        }
                    } catch (e) {
                    }
                }
            });

            var oCatalogTagFilter = new sap.m.MultiComboBox("catalogTagFilter", {
                visible: "{/tagFiltering}",
                selectedKeys: {
                    path: "/selectedTags",
                    mode: sap.ui.model.BindingMode.TwoWay
                },
                tooltip: "{i18n>catalogTilesTagfilter_tooltip}",
                width: "17rem",
                placeholder: "{i18n>catalogTilesTagfilter_HintText}",
                //Use catalogs model as a demo content until the real model is implemented
                items : {
                    path : "/tagList",
                    sorter : new sap.ui.model.Sorter("tag", false, false),
                    template : new sap.ui.core.ListItem({
                        text : "{tag}",
                        key : "{tag}"
                    })
                },
                selectionChange : [ oController.onTagsFilter, oController ]
            });

            // if xRay is enabled
            if (oModel.getProperty("/enableHelp")) {
                oCatalogTagFilter.addStyleClass('help-id-catalogTagFilter');// xRay help ID
            }
            oCatalogTagFilter.addEventDelegate({
                onsaptabnext: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        var aVisibleTiles = jQuery(".sapUshellTile:visible"),
                            jqTile = jQuery(aVisibleTiles[0]);
                        sap.ushell.components.flp.ComponentKeysHandler.setFocusOnCatalogTile();
                        jqTile.focus();
                    } catch (e) {
                    }
                },
                onsapskipback: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        jQuery("#catalogSelect").focus();
                    } catch (e) {
                    }
                },
                onsapskipforward: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        var firstTile = jQuery('#catalogTiles .sapUshellTile:visible:first');
                        sap.ushell.components.flp.ComponentKeysHandler.setTileFocus(firstTile);
                    } catch (e) {
                    }
                }
            });

            var oDetailPage = new sap.m.Page("catalogTilesPage", {
                showHeader : true,
                showFooter : false,
                showNavButton : true,
                title : {
                    parts : ["/groupContext/title"],
                    formatter : function (title) {
                        var oResourceBundle = sap.ushell.resources.i18n;
                        return !title ? oResourceBundle.getText("tile_catalog") : oResourceBundle.getText("catalog_group_context_title", title);
                    }
                },
                content : [ new sap.ushell.ui.launchpad.Panel({
                    translucent : true,
                    headerText : "",
                    headerLevel : sap.m.HeaderLevel.H2,
                    headerBar : new sap.m.Bar("catalogHeader", {
                        translucent : true,
                        tooltip: "{i18n>tile_catalog_header_tooltip}",
                        contentLeft : [ oCatalogSelect, oCatalogSearch, oCatalogTagFilter]
                    }).addStyleClass("sapUshellCatalogHeaderBar"),
                    content : [ tilesContainer]
                }).addStyleClass("sapUshellCatalogPage")],
                navButtonPress : [oController.onNavButtonPress, oController]
            });

            oDetailPage.addDelegate({
                onAfterRendering: function () {
                    //set initial focus
                    jQuery("#catalogTilesPage header button").attr("tabindex", -1);
                }
            });

            return oDetailPage;
        },

        getControllerName: function () {
            return "sap.ushell.components.flp.launchpad.catalog.Catalog";
        }
    });
}());
