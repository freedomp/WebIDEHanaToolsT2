define(["sap/watt/common/plugin/platform/service/ui/AbstractPart"], function(AbstractPart) {
	"use strict";
	
	var fnError = function(sMessage) {
		throw new Error("MenuBar: " + sMessage);
	};

	var MenuBar = AbstractPart.extend("sap.watt.platform.plugin.menubar.service.MenuBar", {

		_oGroup : null,

		_oMenuService : null,
		_oCommandGroupService : null,
		_lastOpenedMenu : null,
		_oMenuBar : new sap.ui.commons.MenuBar({
			id : "menubar"
		}),

		init : function() {
			var self = this;
			this._oMenuService = this.context.service.menu;
			this._oCommandGroupService = this.context.service.commandGroup;
			this._oMenuBar.attachBrowserEvent("mouseover", function(oEvt) {
				self._onMenuBarHoverEvent(this, oEvt, false);
			});
			this._oMenuBar.attachBrowserEvent("mouseout", function(oEvt) {
				self._onMenuBarHoverEvent(this, oEvt, true);
			});
		},

		configure : function(mConfig) {
			var that = this;
			return this._oCommandGroupService.getGroup(mConfig.group).then(function(oGroup) {
				if (!oGroup) {
					fnError("Configured group '" + mConfig.group + "' is not defined");
				}
				return that.setGroup(oGroup);
			});
		},

		getContent : function() {
			//TODO return a promise that is resolved after everything is registered
			return this._oMenuBar;
		},

		/**
		 * Handler for hover events on menubar control
		 * TODO: should be implemented in the control itself.
		 */
		_onMenuBarHoverEvent : function(oMenuBar, oEvent, bMouseOut) {
			var jRef = jQuery(oEvent.target);
			var isActive = false;
			var isOpen = false;
			if (!jRef.attr("itemidx")) {
				jRef = jRef.parent();
			}
			jRef = jRef.attr("itemidx") ? jRef : null;
			if (!jRef) {
				return;
			}

			var oMenuItem = this._getMenuItem(oMenuBar, jRef);
			var oMenu = oMenuItem.getSubmenu();

			for ( var i = 0; i < oMenuBar.getItems().length; i++) {
				if (oMenuBar.getItems()[i].getSubmenu().isActive()) {
					isActive = true;
					if (oMenuBar.getItems()[i] == oMenuItem) {
						isOpen = true;
					}
				}
			}

			if (bMouseOut && isActive) {
				this._lastOpenedMenu = oMenu;
				jRef.addClass("active");
			}
			var self = this;
			if (oMenuItem && oMenuItem.getEnabled() && isActive && isOpen) {
				oMenu.oPopup.attachEventOnce("closed", function(evt) {
					removeActiveClass(self._lastOpenedMenu);
				});
			}

			if (oMenuItem && oMenuItem.getEnabled() && isActive && !isOpen) {
				if (oMenu && !oMenuItem._bSkipOpen) {
					if (this._lastOpenedMenu) {
						//make sure the last menu is closed properly. Important when submenu was opened.
						this._lastOpenedMenu.close();
						if (this._lastOpenedMenu.getParent() && this._lastOpenedMenu.getParent().$()) {
							this._lastOpenedMenu.getParent().$().removeClass("active");
						}
					}
					var eDock = sap.ui.core.Popup.Dock;
					oMenu.open(false, jRef.get(0), eDock.BeginTop, eDock.BeginBottom, jRef.get(0));
				}
			}

			var removeActiveClass = function(oMenu) {
				if (oMenu.getParent() && oMenu.getParent().$()) {
					oMenu.getParent().$().removeClass("active");
				}
			};
		},

		_getMenuItem : function(oMenuBar, jRef) {
			if (jRef) {
				var sItemIdx = jRef.attr("itemidx");
				if (sItemIdx) {
					if (sItemIdx == "ovrflw") {
						return "";
					} else {
						var iIdx = parseInt(sItemIdx, 10);
						return oMenuBar.getItems()[iIdx];
					}
				}
			}
		},

		setGroup : function(oGroup) {
			this._oGroup = oGroup;
			return this._oMenuService.populate(this._oMenuBar, oGroup);
		},

		_refresh : function() {
			var aItems = this._oMenuBar.getItems();
			jQuery.each(aItems, function(iIndex, oMenuItem) {
				oMenuItem.getSubmenu().destroyItems();
			});
		},

		onAfterSetSelection : function(oEvent) {
			this._refresh();
		}
	});

	return MenuBar;
});
