/* global jQuery, sap, console, window  */
(function() {
    "use strict";

    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.controls.SearchTilesContainerKeyHandler');

    // =======================================================================
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

    // =======================================================================
    // tile
    // =======================================================================
    var Tile = function() {
        this.init.apply(this, arguments);
    };

    Tile.prototype = {

        init: function(tilesContainer, element) {
            this.tilesContainer = tilesContainer;
            this.tilesContainerElement = tilesContainer.getDomRef();
            this.element = element;
        },

        getIndexInTilesContainer: function() {
            return Array.prototype.indexOf.call(this.tilesContainerElement.children, this.element);
        },

        next: function() {
            if ((this.getIndexInTilesContainer() + 1) % this.tilesContainer.getTilesPerRow() === 0) {
                return null;
            }
            if (this.element.nextElementSibling) {
                return new Tile(this.tilesContainer, this.element.nextElementSibling);
            }
            return null;
        },

        previous: function() {
            if ((this.getIndexInTilesContainer()) % this.tilesContainer.getTilesPerRow() === 0) {
                return null;
            }
            if (this.element.previousElementSibling) {
                return new Tile(this.tilesContainer, this.element.previousElementSibling);
            }
            return null;
        },

        upper: function() {
            var index = this.getIndexInTilesContainer() - this.tilesContainer.getTilesPerRow();
            if (index < 0) {
                return null;
            }
            return new Tile(this.tilesContainer, this.tilesContainerElement.children.item(index));
        },

        lower: function() {
            var index = this.getIndexInTilesContainer() + this.tilesContainer.getTilesPerRow();
            if (index >= this.tilesContainerElement.children.length) {
                return null;
            }
            return new Tile(this.tilesContainer, this.tilesContainerElement.children.item(index));
        },

        focus: function() {
            if (this.element.classList.contains('sapUshellSearchShowMoreTile')) {
                this.element.focus();
            } else {
                this.element.focus();
                //this.element.children.item(0).children.item(0).focus();
            }
        }

    };

    // =======================================================================
    // key handler
    // =======================================================================
    var KeyHandler = sap.ushell.renderers.fiori2.search.controls.SearchTilesContainerKeyHandler = function() {
        this.init.apply(this, arguments);
    };

    KeyHandler.prototype = {

        init: function(tilesContainer) {
            this.tilesContainer = tilesContainer;
        },

        getFocusedObject: function(element) {
            var tileElement = domHelper.getAncestorByClass(element, 'sapUshellSearchTileWrapper');
            if (!tileElement) {
                return null;
            }
            return new Tile(this.tilesContainer, tileElement);
        },

        onsapdown: function(oEvent) {
            this.navigate('lower', oEvent);
        },

        onsapup: function(oEvent) {
            this.navigate('upper', oEvent);
        },

        onsapleft: function(oEvent) {
            this.navigate('previous', oEvent);
        },

        onsapright: function(oEvent) {
            this.navigate('next', oEvent);
        },

        onsapenter: function(oEvent) {

            var currentElement = oEvent.target;
            if (!currentElement) {
                return;
            }

            // show more tile
            if (currentElement.classList.contains('sapUshellSearchShowMoreTile')) {
                var button = currentElement.children.item(0);
                var buttonControl = sap.ui.getCore().byId(button.getAttribute('id'));
                buttonControl.firePress();
                return;
            }

            // regular tile
            var realElements = window.$(oEvent.target).find(".sapUshellTileBase, .sapUiCockpitReportTile");
            if (realElements.length > 0) {
                var tileControl = sap.ui.getCore().byId(window.$(realElements[0]).attr('id'));
                if (tileControl && tileControl.firePress) {
                    tileControl.firePress();
                }
            }

        },

        navigate: function(method, oEvent) {
            oEvent.stopPropagation();
            oEvent.preventDefault();
            var obj = this.getFocusedObject(oEvent.target);
            if (!obj) {
                return;
            }
            var nextObj = obj[method].apply(obj, []);
            if (!nextObj) {
                return;
            }
            nextObj.focus();
        }

    };

})();
