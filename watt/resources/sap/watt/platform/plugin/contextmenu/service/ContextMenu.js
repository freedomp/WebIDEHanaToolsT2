define([ "sap/watt/common/error/AssertError"], function(AssertError) {
	"use strict";
	/**
	 * Context Menu Class
	 */
	var ContextMenu = function() {
	};

	ContextMenu.prototype = jQuery.extend(ContextMenu.prototype, {
		_oContextMenu : null,
		_oMenuService : null,

		init : function() {
			this._oMenuService = this.context.service.menu;
			this._oContextMenu = new sap.ui.commons.Menu().addStyleClass("sapWattContextMenu");
			this._oOpenQueue = new Q.sap.Queue();
		},

		_open : function(iPageX, iPageY) {
			var that = this;

			// first check if there are some context menu entries 
			if (this._oContextMenu.getItems().length == 0) {
				return Q();
			}

			var mouseX = iPageX;
			var mouseY = iPageY;
			var X = mouseX;
			var Y = mouseY;
			var bodyX = $('body').width();
			var bodyY = $('body').height();

			if (!that._oContextMenu.getDomRef()) {
				that._oContextMenu.open(false, undefined, undefined, undefined, undefined, -2000 + " " + -2000, "none");
			}

			var contextMenuWidth = that._oContextMenu.$().context.clientWidth;
			var contextMenuHeight = that._oContextMenu.$().context.clientHeight;

			if (contextMenuHeight == 0) {
				// Ensure context menu's DOM elements are rendered already. This might not be the case after rapidly repeated clicks
				return Q.delay(0).then(function() {
					return that._open(iPageX, iPageY);
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

			that._oContextMenu.open(false, undefined, undefined, undefined, undefined, X + " " + Y, "flip");
			that._oContextMenu.attachBrowserEvent("contextmenu", function(e) {e.preventDefault();});
			return Q();

		},

		close : function() {
			this._oContextMenu.close();
		},

		open : function(oGroup, iPageX, iPageY) {
			var that = this;

			// queue open operation to avoid problem with concurrent overlapping open operations
			return this._oOpenQueue.next(function() {
				return that._oMenuService.populate(that._oContextMenu, oGroup).delay(0).then(function() {
					return that._open(iPageX, iPageY);
				});
			});
		}
	});

	return ContextMenu;
});