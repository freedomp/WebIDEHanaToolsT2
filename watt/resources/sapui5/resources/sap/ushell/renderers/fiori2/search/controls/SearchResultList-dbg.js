/* global $, jQuery, sap, window */
(function() {
    "use strict";

    sap.m.List.extend('sap.ushell.renderers.fiori2.search.controls.SearchResultList', {

        renderer: 'sap.m.ListRenderer',

        onAfterRenderingParent: sap.m.List.prototype.onAfterRendering,
        onAfterRendering: function() {
            var that = this;

            // First let the original sap.m.List do its work
            that.onAfterRenderingParent();

            that._prepareResizeHandler();

            that.collectListItemsForNavigation();
        },

        collectListItemsForNavigation: function() {
            var that = this;

            var aMyListItems = that.getItems();

            if (aMyListItems.length === 0) {
                return;
            }

            var doCollectListItemsForNavigationCallback = function() {
                that._doCollectListItemsForNavigation();
            };

            // We need to be aware of any re-rendering happening inside the app tile
            // container. Thus let's listen for any re-rendering going on inside.
            for (var i = 0; i < aMyListItems.length; i++) {
                var oMyItem = aMyListItems[i];
                if (oMyItem.hasStyleClass("sapUshellSearchResultListItemApps")) {
                    var oContent = oMyItem.getContent();
                    if (oContent.length > 0) { // && oContent[0].hasStyleClass("sapUshellSearchTileContainer")) {
                        oContent[0].addEventDelegate({
                            onAfterRendering: doCollectListItemsForNavigationCallback
                        });
                    }
                }
            }

            that._doCollectListItemsForNavigation();
        },

        _doCollectListItemsForNavigation: function() {
            var that = this;

            var oFocusRef = that.getDomRef();
            if (!oFocusRef) {
                return;
            }

            var oItemNavigation = that.getItemNavigation();
            if (!oItemNavigation) {
                that._startItemNavigation();
                oItemNavigation = that.getItemNavigation();
            }

            if (!oItemNavigation) {
                return; // apparently this is a Tap-Device, e.g. an iPad
            }

            that._bItemNavigationInvalidated = false;

            // fix the item navigation to our needs:

            //Collect the dom references of the items
            var aRows = oFocusRef.getElementsByTagName("li");
            var aDomRefs = [];
            for (var i = 0; i < aRows.length; i++) {
                var oRow = aRows[i];
                if ($(oRow).hasClass("sapUshellSearchResultListItemApps")) { // Handle Tiles (including the ShowMore-Tile)

                    var aTiles = oRow.getElementsByClassName("sapUshellSearchTileWrapper");
                    for (var j = 0; j < aTiles.length; j++) {
                        if ($(aTiles[j]).hasClass("sapUshellSearchShowMoreTile")) {
                            continue;
                        }
                        aDomRefs.push(aTiles[j]);
                    }

                    // ShowMore-Tile
                    var aShowMoreButton = $(oRow).find(".sapUshellSearchShowMoreTile button");
                    if (aShowMoreButton.length > 0) {
                        aDomRefs.push(aShowMoreButton[0]);
                    }

                } else if ($(oRow).hasClass("sapUshellSearchResultListFooter")) { // Handle ShowMore-Button

                    var aShowMoreLink = oRow.getElementsByClassName("sapUshellResultListMoreFooter");
                    for (var k = 0; k < aShowMoreLink.length; k++) {
                        aDomRefs.push(aShowMoreLink[k]);
                    }

                } else if ($(oRow).hasClass("sapUshellSearchResultListItem")) { // Normal List Items
                    aDomRefs.push(oRow);
                }
            }

            //set the root dom node that surrounds the items
            //oItemNavigation.setRootDomRef(oFocusRef.children.item(0));
            if (aDomRefs.length > 0) {
                oItemNavigation.setRootDomRef(aDomRefs[0].parentElement);
            }

            //set the array of dom nodes representing the items.
            oItemNavigation.setItemDomRefs(aDomRefs);

            //turn of the cycling
            oItemNavigation.setCycling(false);
        },


        _prepareResizeHandler: function() {
            var that = this;
            that._previousWindowWidth = $(window).width();
            $(window).on("resize", function() {
                that._resizeHandler();
            });
        },

        _resizeHandler: function() {
            var that = this;

            if (that.resizeTimeoutID) {
                window.clearTimeout(that.resizeTimeoutID);
            }

            that.resizeTimeoutID = window.setTimeout(function() {
                var phoneSize = 767;
                var tabletSize = 1150;
                var windowWidth = $(window).width();
                if (windowWidth <= phoneSize && that._previousWindowWidth > phoneSize || windowWidth <= tabletSize && (that._previousWindowWidth <= phoneSize || that._previousWindowWidth > tabletSize) || windowWidth > tabletSize && that._previousWindowWidth <= tabletSize) {
                    that.rerender();
                }
                that._previousWindowWidth = windowWidth;
            }, 250);
        }


        // Since oItemNavigation is created by the parent (sap.m.List), it should
        // also be destroyed by the parent.
        //         destroy: function() {
        //             if (this.oItemNavigation) {
        //                 this.removeDelegate(this.oItemNavigation);
        //                 this.oItemNavigation.destroy();
        //             }
        //         }
    });

})();
