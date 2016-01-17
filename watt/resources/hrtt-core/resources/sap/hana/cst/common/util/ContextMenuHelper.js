/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(function() {

    "use strict";

    var ContextMenuHelper = function(oContextMenu) {
        var that = this;
        that._oContextMenu = oContextMenu;
    };

    ContextMenuHelper.prototype = jQuery.extend(ContextMenuHelper.prototype, {

        open: function(oEvent) {
            var that = this;
            oEvent.preventDefault();
            oEvent.stopPropagation();
            var iPageX = oEvent.pageX;
            var iPageY = oEvent.pageY;
            that._open(iPageX, iPageY);
        },

        _open: function(iPageX, iPageY) {
            var that = this;
            var mouseX = iPageX;
            var mouseY = iPageY;
            var X = mouseX;
            var Y = mouseY;
            var bodyX = $('body').width();
            var bodyY = $('body').height();

            if (!that._oContextMenu.getDomRef()) {
                that._oContextMenu.open(false, null, null, null, null, -2000 + " " + -2000, "none");
            }

            var contextMenuWidth = that._oContextMenu.$().context.clientWidth;
            var contextMenuHeight = that._oContextMenu.$().context.clientHeight;

            if (contextMenuHeight === 0) {
                // Ensure context menu's DOM elements are rendered already. This might not be the case after rapidly repeated clicks
                return Q.delay(0).then(function() {
                    return that._open(iPageX, iPageY, that._oContextMenu);
                });
            }

            var xFlipOffset = (bodyX - mouseX < contextMenuWidth) ? contextMenuWidth : 0;
            var yFlipOffset = (bodyY - mouseY < contextMenuHeight) ? contextMenuHeight : 0;

            X = ((bodyX / 2 - mouseX) * -1) + contextMenuWidth / 2 + 2 - xFlipOffset;
            Y = ((bodyY / 2 - mouseY) * -1) + contextMenuHeight / 2 + 2 - yFlipOffset;

            var yOffset = mouseY - contextMenuHeight;
            if (yOffset < 0 && yFlipOffset != 0) {
                Y = Y - yOffset;
            }

            that._oContextMenu.close();
            that._oContextMenu.open(false, null, null, null, null, X + " " + Y, "flip");
        }
    });

    return ContextMenuHelper;
});