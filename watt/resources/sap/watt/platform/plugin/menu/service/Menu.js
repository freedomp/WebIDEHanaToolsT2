define([ "sap.watt.platform.commandgroup/module/Group", "sap.watt.platform.commandgroup/module/ActionItem",
		"sap.watt.platform.commandgroup/module/MenuItem", "sap.watt.platform.commandgroup/module/InlineItem" ], function(Group, ActionItem,
		MenuItem, InlineItem) {
	"use strict";
	return {
		_oCommandService : null,
		_oOpenQueue : null,
		_bRTL: false,

		init : function() {
			this._oCommandService = this.context.service.command;
			this._oOpenQueue = new Q.sap.Queue();
			this._bRTL = sap.ui.getCore().getConfiguration().getRTL() 
							|| getComputedStyle(document.getElementsByTagName("html")[0], null).direction === "rtl";
		},
		
		configure: function configure(config) {
			if (!this._bRTL) {
				// up to now we support only right-aligned key bindings, i.e. only in ltr mode
				this.context.service.resource.includeStyles([{ "uri": "sap.watt.platform.menu/css/Menu.css" }]).done();
			}
		},

		createMenu : function(oGroup, sStyle) {
			sStyle = sStyle || "WattMainMenuSub";
			var that = this;
			var oMenu = new sap.ui.unified.Menu();
			oMenu.getPopup().attachEvent("opened", function() {
				//to ensure asynchronous sequences run one after the other
				that._oOpenQueue.next(function(){
					 return that._populateIfEmpty(oMenu, oGroup);
				}).fail(function(oError) {
					console.error("Failed to create a menu", oError);
				}).done();
			});
			oMenu.addStyleClass(sStyle);
			return oMenu;
		},

		_populateIfEmpty : function(oMenu, oGroup) {
			return (oMenu.getItems().length === 0) ? this.populate(oMenu, oGroup) : Q();
		},

		populate : function(oMenu, oGroup, mOptions) {
 			oMenu.destroyItems();
			mOptions = mOptions || {};
			var bFilter = mOptions.bFilter;
			var sParentId = mOptions.sParentId;
			var fnItemVisitor = mOptions.fnVisitor;
			var that = this;

			return this._createMenuStructure(oGroup, bFilter, sParentId).then(function(aMenuStructure) {
				return that._populate(oMenu, aMenuStructure, fnItemVisitor);
			});
		},

		_populate : function(oMenu, aMenuStructure, fnItemVisitor) {
			var that = this;
			var sPrefix = oMenu.getId();
			fnItemVisitor = fnItemVisitor || function(i, mItem) {
				var sKeyBindingAsText = (mItem.command) ? mItem.command.getKeyBindingAsText() : null;
				var sTextWithBinding = (sKeyBindingAsText) ? mItem.label + " (" + sKeyBindingAsText + ")" : mItem.label;
				var oMenuItem = new sap.ui.unified.MenuItem({
					id : sPrefix + mItem.id,
					text : that._bRTL ? sTextWithBinding : mItem.label,
					tooltip : (mItem.command) ? mItem.command.getKeyBindingTooltip(mItem.label) : null,
					//icon : mItem.icon,
					enabled : (mItem ? mItem.enabled : true),
					startsSection : (i > 0 && mItem.startsSection || false)
				});

				// up to now we support only right-aligned key bindings, i.e. only in ltr mode
				if (sKeyBindingAsText && !that._bRTL) {
//					sap.ui.unified.Menu._dbg = true;
					oMenuItem.onAfterRendering = function() {
						oMenuItem.$("scuttxt").text(sKeyBindingAsText);
					};
				}

				that._createHandler(oMenuItem, mItem);
				oMenu.addItem(oMenuItem);

				if (mItem.type === "menu") {
					var oSubmenu = that.createMenu(mItem.group);
					oMenuItem.setSubmenu(oSubmenu);
					oSubmenu.attachBrowserEvent("contextmenu", function(e) {e.preventDefault();});

                    return mItem.group.getItems();
                }
			};

			// Async loop
            var oPromise = Q();
			jQuery.each(aMenuStructure, function(iIndex, mItem) {
				oPromise = oPromise.then(function() {
					return fnItemVisitor(iIndex, mItem);
				});
			});
			return oPromise;
		},

		_createHandler : function(oMenuItem, mItem) {
			var oCommand = mItem.command;
			if (oCommand) {
				//TODO insert type assertion
				if (oCommand.getType() === "boolean") {
					oMenuItem.attachSelect(function() {
						oCommand.execute(!oCommand.getValue()).done();
					});
				} else {
					oMenuItem.attachSelect(function() {
						oCommand.execute(oCommand.getValue(mItem.itemId)).done();
					});
				}
			}
		},

		_createMenuItem : function(oItem, sParentId) {
			var that = this;
			return oItem.getGroup().getItems().then(function(aItems) {
				var mItem = null;
				if (aItems.length > 0) {
					var oGroup = oItem.getGroup();
					var oDefaultItem = oGroup.getDefaultItem();
					mItem = {
						"id" : that._createId(sParentId, oItem),
						"itemId" : oItem.getId(),
						"type" : oItem.getType(),
						"label" : oItem.getLabel(), //TODO i18n label
						"group" : oGroup,
						"prio" : oItem.getPrio(),
						"icon" : oItem.getIcon(),
						"iconLabel" : oItem.getIconLabel(),
						"defaultAction" : oDefaultItem ? that._createActionItem(oDefaultItem, true, sParentId) : undefined
					};
				}
				return mItem;
			});
		},

		_createInlineItems : function(oItem, bFilter, sParentId) {
			var aMenu = [];
			return this._createMenuStructure(oItem.getGroup(), bFilter, sParentId).then(function(aInlineItems) {
				jQuery.each(aInlineItems, function(iInlineItemIndex, mInlineItem) {
					mInlineItem.startsSection = mInlineItem.startsSection || iInlineItemIndex == 0;
					aMenu.push(mInlineItem);
				});
				return aMenu;
			});
		},

		_createActionItem : function(oItem, bEnabled, sParentId) {
			var oCommand = oItem.getCommand();
			// TODO: Use Classes instead of literal objects
			return {
				"id" : this._createId(sParentId, oItem),
				"itemId" : oItem.getId(),
				"type" : "action",
				"label" : oItem.getLabel(),
				"enabled" : bEnabled,
				"command" : oCommand,
				"icon" : oItem.getIcon(),
				"iconLabel" : oItem.getIconLabel(),
				"value" : oItem.getValue(),
				"prio" : oItem.getPrio()
			};
		},

		_createMenuStructure : function(oGroup, bFilter, sParentId) {
			if (oGroup == undefined) {
				return Q([]);
			}
			var that = this;
			sParentId = sParentId || oGroup.getId();
			bFilter = bFilter === false ? false : true;
			return oGroup.getItems().then(function(aItems) {
				if (bFilter) {
					return that._oCommandService.filter(aItems).then(function(aFilteredItems) {
						return that._createMenuStructureForItems(aFilteredItems, true, sParentId);
					});
				} else {
					return that._createMenuStructureForItems(aItems, bFilter, sParentId);
				}
			});
		},

		_createMenuStructureForItems : function(aItems, bFilter, sParentId) {
			var that = this;
			var aPromises = [];
			var aMenu = [];
			jQuery.each(aItems, function(iIndex, mResult) {

				var oItem = mResult;
				if (bFilter) {
					oItem = mResult.item;
				}

				if (oItem instanceof MenuItem) {
					aPromises.push(that._createMenuItem(oItem, sParentId));
				} else if (oItem instanceof InlineItem) {
					aPromises.push(that._createInlineItems(oItem, bFilter, sParentId));
				} else if (oItem instanceof ActionItem) {
					aPromises.push(that._createActionItem(oItem, bFilter ? mResult.enabled : true, sParentId));
				}
			});
			return Q.all(aPromises).then(function(aResults) {
				var bNextItemStartsSection = false;
				jQuery.each(aResults, function(iIndex, vMenuItem) {

					if (jQuery.isArray(vMenuItem)) {
						// inline items - flag can be ignored here
						bNextItemStartsSection = false;
						var iEndIndex = vMenuItem.length - 1;
						jQuery.each(vMenuItem, function(iIndex, mItem) {
							aMenu.push(mItem);
							// Make sure the next item is starting a section
							if (iIndex == iEndIndex) {
								bNextItemStartsSection = true;
							}
						});
					} else if (vMenuItem) {
						if (bNextItemStartsSection && !vMenuItem.startsSection) {
							// Item is not in an inline group, so start a new section
							vMenuItem.startsSection = true;
						}
						aMenu.push(vMenuItem);
					}
				});
				return aMenu;
			});

		},

		_createId : function(sParentId, oItem) {
			return sParentId + "-" + oItem.getId();
		}

	};
});