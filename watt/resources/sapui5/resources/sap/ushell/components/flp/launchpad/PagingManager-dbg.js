// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, document, setTimeout, window */
    /*jslint plusplus: true, nomen: true, bitwise: true */

    jQuery.sap.declare("sap.ushell.components.flp.launchpad.PagingManager");
    sap.ui.base.EventProvider.extend("sap.ushell.components.flp.launchpad.PagingManager", {
        metadata : {
            publicMethods : ["setElementClass", "setContainerSize", "getNumberOfAllocatedElements", "moveToNextPage", "getTileHeight"]
        },
        constructor : function (sId, mSettings) {
            //make this class only available once
//            if (sap.ushell.components.flp.launchpad.getPagingManager && sap.ushell.components.flp.launchpad.getPagingManager()) {
//                return sap.ushell.components.flp.launchpad.getPagingManager();
//            }
            sap.ushell.components.flp.launchpad.getPagingManager = jQuery.sap.getter(this.getInterface());
            this.currentPageIndex = 0;
            this.containerHeight = mSettings.containerHeight || 0;
            this.containerWidth = mSettings.containerWidth || 0;
            this.ElementClass = mSettings.elementClassName || "";
            this.tileHeight = 0;
        },
        getTileHeight : function () {
            return this.tileHeight;
        },
        setElementClass : function (sClassName) {
            this.ElementClass = sClassName;
        },

        setContainerSize : function (nHeight, nWidth) {
            var totalNumberAllocatedTiles = this.getNumberOfAllocatedElements();
            this.containerHeight = nHeight;
            this.containerWidth = nWidth;
            this._changePageSize(totalNumberAllocatedTiles);
        },

        getNumberOfAllocatedElements : function () {
            return this._calcElementsPerPage() * this.currentPageIndex;
        },

        _changePageSize: function (totlaNumberAllocateedTiles) {
            this.currentPageIndex = Math.ceil(totlaNumberAllocateedTiles / this._calcElementsPerPage());
        },

        moveToNextPage : function () {
            this.currentPageIndex++;
        },

        _calcElementsPerPage : function () {
            var oElement = jQuery("<div>").addClass(this.ElementClass);
            jQuery('body').append(oElement);
            var elementHeight = oElement.height();
            var elementWidth = oElement.width();

            if (elementHeight < 100 || elementWidth < 100) {
                elementWidth = 100;
                elementHeight = 100;
            }

            var elementsPerRow = Math.round(this.containerWidth / elementWidth),
                elementsPerColumn = Math.round(this.containerHeight / elementHeight);
            this.tileHeight = elementHeight;

            oElement.remove();
            if (!elementsPerRow || !elementsPerColumn || elementsPerColumn === Infinity || elementsPerRow === Infinity || elementsPerColumn === 0 || elementsPerRow === 0) {
                return 10;
            }
            return elementsPerRow * elementsPerColumn;
        }
    });
}());
