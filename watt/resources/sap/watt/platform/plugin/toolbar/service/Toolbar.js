define([ "sap/watt/common/plugin/platform/service/ui/AbstractPart" ], function(AbstractPart) {
	"use strict";

	var fnError = function(sMessage) {
		throw new Error("Toolbar: " + sMessage);
	};

	/**
	 * Toolbar Class
	 */
	var Toolbar = AbstractPart.extend("sap.watt.platform.plugin.toolbar.service.Toolbar", {

		_aItems : [],
		_oCommandService : null,
		_oCommandGroupService : null,
		_oMenuService : null,
		_oToolbar : null,
		_mItemToCommandMapping : {},
		_mSplitButtonMapping : {},
		_mComboBoxGroupMapping : {},

		init : function() {
			//TODO PeterM: rework requiring of ui5 dependencies
			jQuery.sap.require("sap.ui.core.IconPool");
			this._oMenuService = this.context.service.menu;
			this._oCommandGroupService = this.context.service["commandGroup"];
			this._oCommandService = this.context.service["command"];
			this._oToolbar = new sap.ui.commons.Toolbar();
		},

		getContent : function() {
			var that = this;
			return this.context.service.usernotificationbar.getContent().then(function(aNotificationBarItems) {
				for ( var i = 0; i < aNotificationBarItems.length; i++) {
					that._oToolbar.addRightItem(aNotificationBarItems[i]);
				}
				return that._oToolbar;
			});

		},

		configure : function(mConfig) {
			var that = this;
			var aPromises = [];
			var that = this;
			return this._oCommandGroupService.getGroup(mConfig.group).then(function(oGroup) {
				if (!oGroup) {
					fnError("Configured group '" + mConfig.group + "' is not defined");
				}
				return that.setGroup(oGroup);
			});

		},

		setGroup : function(oGroup) {
			var that = this;
			this._oGroup = oGroup;
			return this._oMenuService.populate(this._oToolbar, oGroup, {
				bFilter : false,
				fnVisitor : function(iIndex, mItem) {
					if (mItem.startsSection) {
						that._oToolbar.addItem(new sap.ui.commons.ToolbarSeparator({
							design : sap.ui.commons.ToolbarSeparatorDesign.FullHeight
						}));
					}
					if (mItem.type == "action") {
						that._oToolbar.addItem(that._createButton(mItem));
					} else if (mItem.type == "menu") {
						if (mItem.defaultAction) {
							that._mSplitButtonMapping[that._createId(mItem.defaultAction.id)] = that._createId(mItem.id);
							that._oToolbar.addItem(that._createButton(mItem.defaultAction));
						}
						return that._oMenuService.createMenu(mItem.group).then(function(oMenu) {
							// this = scope of the menu service
							that._oToolbar.addItem(that._createMenuButton(mItem, oMenu, !!mItem.defaultAction));
						});
					} else if (mItem.type == "list") {
						that._oToolbar.addItem(that._createListBox(mItem));
						that._mComboBoxGroupMapping[that._createId(mItem.id)] = mItem.group;
					}
				}
			}).then(function() {
				that._filterToolbar();
			});
		},

		_createId : function(sId) {
			return this._oToolbar.getId() + "-" + sId;
		},

		//FIXME Redundant code: Same as in Sidebar.js
		_getIconUri : function(sIconUri) {
			if (!sIconUri) {
				return sIconUri;
			}
			var sUri = sap.ui.core.IconPool.getIconURI(sIconUri, "watt");
			if (!sUri) {
				sUri = sap.ui.core.IconPool.getIconURI(sIconUri);
				if (!sUri) {
					sUri = require.toUrl(sIconUri);
				}
			}
			return sUri;
		},

		_createButton : function(mItem) {
			var sIconUri = this._getIconUri(mItem.icon);

			var oButton = new sap.ui.commons.Button({
				id : this._createId(mItem.id),
				icon : sIconUri,
				enabled : false,
				//oItem.iconLabel means show icon and label of Button
				text : mItem.iconLabel,
				tooltip : (mItem.command) ? mItem.command.getKeyBindingTooltip(mItem.label) : mItem.label,
				press : this._createHandler(mItem.command, mItem.value)
			});
			this._mItemToCommandMapping[oButton.getId()] = mItem.command;
			if (mItem.iconLabel) {
				oButton.addStyleClass("watt_toolbar_text");
			}
			if (!sIconUri && !mItem.iconLabel) {
				oButton.setText(mItem.label);
			}
			return oButton;
		},

		_createMenuButton : function(mItem, oMenu, bIsSplitMenu) {
			var that = this;
			var sIconUri = this._getIconUri(mItem.icon);

			var oMenuButton = new sap.ui.commons.MenuButton({
				id : this._createId(mItem.id),
				icon : !bIsSplitMenu ? sIconUri : null,
				text : !bIsSplitMenu ? mItem.iconLabel : null,
				tooltip : (mItem.command) ? mItem.command.getKeyBindingTooltip(mItem.label) : mItem.label
			});
			if (!bIsSplitMenu && mItem.iconLabel) {
				oMenuButton.addStyleClass("watt_toolbar_menubutton_text");
			}
			if (bIsSplitMenu) {
				that._attachSplitButtonEvents(oMenuButton);
				oMenuButton.addStyleClass("watt_toolbar_menubutton_split");
			}

			if (!sIconUri && !bIsSplitMenu && !mItem.iconLabel) {
				oMenuButton.setText(mItem.label);
			}

			oMenuButton.setMenu(oMenu);
			return oMenuButton;
		},

		_attachSplitButtonEvents : function(oMenuButton) {
			for ( var key in this._mSplitButtonMapping) {
				if (oMenuButton.getId() == this._mSplitButtonMapping[key]) {
					var oButton = sap.ui.getCore().byId(key);
					oButton.addStyleClass("watt_toolbar_splitbutton_master");
					oButton.attachBrowserEvent("mouseover", function(oEvent) {
						this.addStyleClass("watt_toolbar_splitbutton");
						oMenuButton.addStyleClass("watt_toolbar_splitbutton");
					});
					oButton.attachBrowserEvent("mouseout", function(oEvent) {
						this.removeStyleClass("watt_toolbar_splitbutton");
						oMenuButton.removeStyleClass("watt_toolbar_splitbutton");
					});
				}
			}
			oMenuButton.attachBrowserEvent("mouseover", function(oEvent) {
				this.addStyleClass("watt_toolbar_splitbutton");
				oButton.addStyleClass("watt_toolbar_splitbutton");
			});
			oMenuButton.attachBrowserEvent("mouseout", function(oEvent) {
				this.removeStyleClass("watt_toolbar_splitbutton");
				oButton.removeStyleClass("watt_toolbar_splitbutton");
			});
		},

		_createListBox : function(mItem) {
			var that = this;
			var oListBox = new sap.ui.commons.ComboBox({
				id : this._createId(mItem.id)
			});
			oListBox.attachChange(that._onDDBoxChange, that);

//			oListBox.getPopup().attachEvent("opened", function() {
//				if (oListBox.getItems().length === 0) {
//					that._populateListBox(oListBox, mItem.group).done();
//				}
//			});
			that._populateListBox(oListBox, mItem.group).done();

			return oListBox;
		},

		_populateListBox : function(oListBox, oGroup) {
			if (oGroup) {
				return oGroup.getItems().then(function(aItems) {
					for ( var i = 0; i < aItems.length; i++) {
						var oItem = aItems[i];
						var oListItem = new sap.ui.core.ListItem({
							text : oItem.getCommand().getLabel(),
							key : oItem.getCommand().getId()
						});
						oListBox.addItem(oListItem);
					}
				});
			}
		},

		_onDDBoxChange : function(oEvent) {
			var oSelItem = oEvent.getParameter("selectedItem");
			if (!oSelItem) {
				return;
			}
			var sCommandId = oSelItem.getKey();
			if (!sCommandId) {
				return;
			}
			this._oCommandService.getCommand(sCommandId).then(function(oCommand) {
				oCommand.execute();
			});
		},

		onAfterSetSelection : function(oEvent) {
			this._filterToolbar();
		},

		_filterToolbar : function() {
			var that = this;
			var aItems = this._oToolbar.getItems();
			jQuery.each(aItems, function(i, oItem) {
				if (oItem instanceof sap.ui.commons.MenuButton) {
					var oMenu = oItem.getMenu();
					oMenu.destroyItems();
				} else if (oItem instanceof sap.ui.commons.Button) {
					var oCommand = that._mItemToCommandMapping[oItem.getId()];
					oCommand.getState().then(function(oState) {
						oItem.setEnabled(oState.enabled);
						oItem.setVisible(oState.available);
						var sMenuButtonPart = that._mSplitButtonMapping[oItem.getId()];
						if (sMenuButtonPart) {
							var oMenuButton = sap.ui.getCore().byId(sMenuButtonPart);
							if (oMenuButton) {
								// the menu of the split button may be enabled although the defaultAction is disabled
								//oMenuButton.setEnabled(oState.enabled);
								oMenuButton.setVisible(oState.available);
							}
						}
					}).done();
				}
				if (oItem instanceof sap.ui.commons.ComboBox) {
//					oItem.removeAllItems();
//					var oGroup = that._mComboBoxGroupMapping[oItem.getId()];
//					that._populateListBox(oItem, oGroup).done();
					var aItems = oItem.getItems();
					jQuery.each(aItems, function(i, oItem) {
						var sCommandId = oItem.getKey();
						if (sCommandId) {
							that._oCommandService.getCommand(sCommandId).then(function(oCommand) {
								oCommand.getState().then(function(oState) {
									oItem.setEnabled(oState.enabled);
									oItem.setVisible(oState.available);
								});
							});
						}
					});
				}
			});
		},

		_createHandler : function(oCommand, vValue) {
			return function() {
				oCommand.execute(vValue).done();
			};
		}

	});

	return Toolbar;
});
