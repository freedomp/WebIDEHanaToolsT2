/* global jQuery, sap, console, window  */
(function() {
    "use strict";

    // =======================================================================
    // Import packages
    // =======================================================================
    jQuery.sap.require('sap.m.Button');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchTilesContainerKeyHandler');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchTileHighlighter');
    var KeyHandler = sap.ushell.renderers.fiori2.search.controls.SearchTilesContainerKeyHandler;
    var TileHighlighter = sap.ushell.renderers.fiori2.search.controls.SearchTileHighlighter;

    // =======================================================================
    // Tiles Container
    // =======================================================================
    sap.ui.core.Control.extend('sap.ushell.renderers.fiori2.search.controls.SearchTilesContainer', {

        // metadata
        // ===================================================================
        metadata: {
            properties: {
                'totalLength': {
                    type: 'int',
                    defaultValue: 0
                },
                'maxRows': {
                    type: 'int',
                    defaultValue: 1
                },
                'highlightTerms': {
                    type: 'string',
                    defaultValue: ''
                },
                'enableKeyHandler': {
                    type: 'boolean',
                    defaultValue: true
                }
            },
            aggregations: {
                'tiles': {
                    type: 'sap.ui.core.Control',
                    multiple: true
                }
            },
            events: {
                showMore: {}
            }
        },

        // constructor
        // ===================================================================                
        constructor: function() {
            sap.ui.core.Control.prototype.constructor.apply(this, arguments);
            if (this.getEnableKeyHandler()) {
                this.addEventDelegate(new KeyHandler(this));
            }
            this.tileHighlighter = new TileHighlighter();
        },

        // setter for highlight terms
        // ===================================================================        
        setHighlightTerms: function(sTermsToHighlight) {
            // suppress rerendering since highlighting will be done
            // during _onAfterRendering()
            this.setProperty('highlightTerms', sTermsToHighlight, true);
        },

        // delayed rerender
        // ===================================================================        
        delayedRerender: function() {
            var that = this;
            setTimeout(function() {
                that.rerender();
            }, 0);
        },

        // renderer
        // ===================================================================        
        renderer: function(oRm, oControl) {

            // do we have tiles?
            var tiles = oControl.getTiles();
            if (!tiles || tiles.length === 0) {
                return;
            }

            // render start of tile container
            oRm.write('<div');
            oRm.writeControlData(oControl);
            oRm.addClass('sapUshellSearchTileContainer');
            oRm.writeClasses();
            oRm.write('>');

            // render tiles
            oControl.renderTiles(oRm, oControl);

            // render end of tile container
            oRm.write('</div>');
        },

        // process usage analytics
        // ===================================================================        
        logUsageAnalytics: function(tile) {
            var content = tile.getContent(),
                innerTile,
                model;

            if (tile.attachPress) {
                tile.attachPress(function() {
                    model = sap.ushell.renderers.fiori2.search.getModelSingleton();
                    model.analytics.logCustomEvent('FLP: Search', 'Launch App', [tile.usageAnalyticsTitle, tile.getTargetURL()]);
                    model.analytics.logCustomEvent('FLP: Application Launch point', 'Search Results', [tile.usageAnalyticsTitle, tile.getTargetURL()]);

                });
                return;
            }
            if (content.length !== 1) {
                return;
            }
            innerTile = content[0];
            if (!innerTile.attachPress) {
                return;
            }
            innerTile.attachPress(function() {
                model = sap.ushell.renderers.fiori2.search.getModelSingleton();
                model.analytics.logCustomEvent('FLP: Search', 'Launch App', [tile.usageAnalyticsTitle, innerTile.getTargetURL()]);
                model.analytics.logCustomEvent('FLP: Application Launch point', 'Search Results', [tile.usageAnalyticsTitle, innerTile.getTargetURL()]);

            });
        },

        // render tiles
        // ===================================================================        
        renderTiles: function(oRm, oControl) {

            var tiles = oControl.getTiles();

            // render tiles
            for (var i = 0; i < tiles.length; i++) {
                var tile = tiles[i];
                oControl.logUsageAnalytics(tile);
                oControl.registerAfterRenderingForTile(tile);
                oRm.write('<div');
                oRm.addClass('sapUshellSearchTileWrapper');
                oRm.writeClasses();
                oRm.writeAttribute("title", sap.ushell.resources.i18n.getText("launchTile_tooltip"));
                oRm.writeAttribute("tabindex", 0);
                oRm.write('>');
                oRm.renderControl(tile);
                oRm.write('</div>');
            }
            oControl.renderPlusTile(oRm, oControl);

            oControl.tileHighlighter.setHighlightTerms(oControl.getHighlightTerms());

        },

        // render plus tile
        // ===================================================================        
        renderPlusTile: function(oRm, oControl) {

            oRm.write('<div');
            oRm.addClass('sapUshellSearchTileWrapper');
            oRm.addClass('sapUshellSearchShowMoreTile');
            oRm.writeClasses();
            oRm.writeAttribute('style', 'display:none'); // invisible
            oRm.writeAttribute("tabindex", 0);
            oRm.write('>');
            var button = new sap.m.Button({
                text: sap.ushell.resources.i18n.getText('showMoreApps'),
                //  styled: false,
                //  lite: true,
                tooltip: sap.ushell.resources.i18n.getText('showMoreApps'),
                press: function() {
                    oControl.fireShowMore();
                }
            });
            oRm.renderControl(button);
            oRm.write('</div>');

        },

        // after rendering
        // ===================================================================        
        onAfterRendering: function(oEvent) {

            // limit rows
            while (this.getNumberRows() > this.getMaxRows()) {
                this.removeLastTile();
            }

            // check whether plus tile is needed
            var container = this.getDomRef();
            var numberTiles = container.children.length - 1;
            if (this.getTotalLength() > numberTiles) {
                this.makePlusTileVisible();
                this.cutAtRow();
            }

            // accessibility
            jQuery('.sapUshellSearchTileWrapper .sapUshellTileBase').attr('role', 'button');

        },

        // after rendering for tiles
        // ===================================================================        
        registerAfterRenderingForTile: function(tileView) {
            var that = this;
            tileView.addEventDelegate({
                onAfterRendering: function() {
                    that.tileHighlighter.highlight(tileView);
                    //tabindex is on searchTileWrapper layer
                    window.$(tileView.getDomRef()).find(".sapUshellTileBase, .sapUiCockpitReportTile").removeAttr("tabindex");
                }
            });
        },

        // make plus tile visible
        // ===================================================================                
        makePlusTileVisible: function() {
            var container = this.getDomRef();
            var plusTile = container.children.item(container.children.length - 1);
            plusTile.style.display = 'inline-block';
        },

        // remove last tile
        // ===================================================================                
        removeLastTile: function() {
            // last tile in container is always plus tile which may be visible or not:
            // index of last tile -> container.children.length - 2
            var container = this.getDomRef();
            var lastTile = container.children.item(container.children.length - 2);
            lastTile.parentNode.removeChild(lastTile);
        },

        // cut at row
        // ===================================================================                        
        cutAtRow: function() {
            var container = this.getDomRef();
            while (!this.isLastRowCompletelyFilled() || this.getNumberRows() > this.getMaxRows()) {
                if (container.children.length <= 2) {
                    break;
                }
                this.removeLastTile();
            }
        },

        // check whether last row is completely filled
        // ===================================================================                
        isLastRowCompletelyFilled: function() {
            var container = this.getDomRef();
            var tpr = this.getTilesPerRow();
            var tileXPosition = -1;
            for (var i = 0; i < tpr; ++i) {
                var tileWrapper = container.children.item(container.children.length - 1 - i);
                if (tileWrapper.style.display === 'none') {
                    tpr++;
                    continue;
                }
                if (tileXPosition < 0) {
                    tileXPosition = tileWrapper.offsetLeft;
                    continue;
                }
                if (tileWrapper.offsetLeft > tileXPosition) {
                    return false;
                }
            }
            return true;
        },

        // get number of lines
        // ===================================================================                
        getNumberRows: function() {
            var container = this.getDomRef();
            var tileXPosition = -1;
            var counter = 0;
            for (var i = 0; i < container.children.length - 1; ++i) {
                var tileWrapper = container.children.item(i);
                if (tileWrapper.style.display === 'none') {
                    continue;
                }
                if (tileXPosition < 0 || tileWrapper.offsetLeft <= tileXPosition) {
                    counter++;
                }
                tileXPosition = tileWrapper.offsetLeft;
            }
            return counter;
        },

        // get number tiles per lines
        // ===================================================================        
        getTilesPerRow: function() {
            var container = this.getDomRef();
            var tileXPosition = -1;
            var counter = 0;
            for (var i = 0; i < container.children.length; ++i) {
                var tileWrapper = container.children.item(i);
                if (tileWrapper.style.display === 'none') {
                    continue;
                }
                if (tileWrapper.offsetLeft <= tileXPosition) {
                    return counter;
                }
                counter++;
                tileXPosition = tileWrapper.offsetLeft;
            }
            return counter;
        }

    });





})();
