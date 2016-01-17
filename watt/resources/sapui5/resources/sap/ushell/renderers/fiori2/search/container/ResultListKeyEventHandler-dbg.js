/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.container.ResultListKeyEventHandler');

    // dom helper
    // =======================================================================
    var domHelper = {

        getAncestorByClass: function(element, className) {
            while (element) {
                if (element.classList.contains(className)) {
                    return element;
                }
                element = element.parentElement;
            }
            return false;
        }

    };

    // result list item
    // =======================================================================
    var ResultListItem = function() {
        this.init.apply(this, arguments);
    };

    ResultListItem.prototype = {

        init: function(element, model) {
            this.element = element;
            this.model = model;
        },

        checkItem: function(nextItem) {
            /* eslint no-use-before-define:0 */

            // not null?
            if (!nextItem) {
                return null;
            }

            // check for simple result list item
            if (nextItem.classList.contains('searchResultListItem')) {
                return new ResultListItem(nextItem, this.model);
            }

            // check for tiles container
            var tileContainer = nextItem.querySelector('.sapUshellSearchTileContainer');
            if (!tileContainer) {
                return null;
            }

            // check for wrapper of first tile
            var tileWrapper = tileContainer.children.item(1);
            if (!tileWrapper) {
                return null;
            }
            if (!tileWrapper.classList.contains('sapUiHLayoutChildWrapper')) {
                return null;
            }

            // get tile
            var tile = tileWrapper.children.item(0).children.item(0);
            if (!tile) {
                return null;
            }

            return new Tile(tile, this.model);
        },

        getLowerObj: function() {
            var nextItem = this.element.nextElementSibling;
            return this.checkItem(nextItem);
        },

        getUpperObj: function() {
            var nextItem = this.element.previousElementSibling;
            return this.checkItem(nextItem);
        },

        getLeftObj: function() {
            return this.getUpperObj();
        },

        getRightObj: function() {
            return this.getLowerObj();
        },

        focus: function() {
            this.element.focus();
        }
    };

    // tile
    // =======================================================================    
    var Tile = function() {
        this.init.apply(this, arguments);
    };

    Tile.prototype = {

        init: function(element, model) {
            this.element = element;
            this.model = model;
        },

        getWrapperElement: function() {
            return this.element.parentElement.parentElement;
        },

        getResultListItemElement: function() {
            var tileContainerElement = domHelper.getAncestorByClass(this.element, 'sapUshellSearchTileContainer');
            return tileContainerElement.parentElement.parentElement;
        },

        checkElement: function(element) {
            if (!element) {
                return null;
            }
            if (!element.classList.contains('sapUiHLayoutChildWrapper')) {
                var skip = this.model.getAppSkip() + 1;
                this.model.setAppSkip(skip);
                return null;
            }
            var tile = element.children.item(0).children.item(0);
            if (!tile) {
                return null;
            }
            return new Tile(tile, this.model);
        },

        getLeftObj: function() {
            var nextTile = this.getWrapperElement().previousElementSibling;
            return this.checkElement(nextTile);
        },

        getRightObj: function() {
            var prevTile = this.getWrapperElement().nextElementSibling;
            return this.checkElement(prevTile);
        },

        getLowerObj: function() {
            return (new ResultListItem(this.getResultListItemElement(), this.model)).getLowerObj();
        },

        getUpperObj: function() {
            return (new ResultListItem(this.getResultListItemElement(), this.model)).getUpperObj();
        },

        focus: function() {
            this.element.focus();
        }
    };

    // key event handler
    // =======================================================================    
    sap.ushell.renderers.fiori2.search.container.ResultListKeyEventHandler = function() {
        this.init.apply(this, arguments);
    };

    sap.ushell.renderers.fiori2.search.container.ResultListKeyEventHandler.prototype = {

        init: function(model) {
            this.model = model;
        },

        getObject: function(element) {

            // is this a tile ?
            var tileElement = domHelper.getAncestorByClass(element, 'sapUshellTileBase');
            if (tileElement) {
                return new Tile(tileElement, this.model);
            }

            // is this a result list item ?
            var itemElement = domHelper.getAncestorByClass(element, 'searchResultListItem');
            if (itemElement) {
                return new ResultListItem(itemElement, this.model);
            }

            // this is trash
            return null;
        },

        onsapdown: function(oEvent) {
            return this.navigate('getLowerObj', oEvent);
        },

        onsapup: function(oEvent) {
            return this.navigate('getUpperObj', oEvent);
        },

        onsapleft: function(oEvent) {
            return this.navigate('getLeftObj', oEvent);
        },

        onsapright: function(oEvent) {
            return this.navigate('getRightObj', oEvent);
        },

        navigate: function(navMethod, oEvent) {
            oEvent.preventDefault();
            var obj = this.getObject(oEvent.target);
            if (!obj) {
                return;
            }
            var targetObj = obj[navMethod].apply(obj, []);
            if (!targetObj) {
                return;
            }
            targetObj.focus();
        },

        onAfterRendering: function() {
            //console.log('pai');
        }

    };

})();
