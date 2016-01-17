define(["sap/watt/common/plugin/platform/service/ui/AbstractPart"], function(AbstractPart) {
	"use strict";

	var Sidebar = AbstractPart.extend("sap.watt.platform.plugin.sidebar.service.Sidebar", {

		_oMenuService : null,
		_oCommandGroupService : null,
		_mLayouts : {},
		_mButtons : {},
		_mSelectedButton : {},
		_mItemToCommandMapping : {},
		_mCommandToItemMapping : {},

		init : function() {
			this._oMenuService = this.context.service.menu;
			this._oCommandGroupService = this.context.service.commandGroup;
			this._mLayouts[this.context.self._sName] = new sap.ui.layout.VerticalLayout();
			this.context.service.perspective.attachEvent("perspectiveChanged", this.onAfterSetSelection, this);
		},

		configure : function(mConfig) {
			var that = this;
			this._aStyles = mConfig.styles;
			this._mButtons[this.context.self._sName] = [];
			return this._oCommandGroupService.getGroup(mConfig.group).then(function(oGroup) {
				if (oGroup) {
					return that.setGroup(oGroup);
				}
			});
		},

		getContent : function() {
			var that = this;
			//TODO return a promise that is resolved after everything is registered
			if (this._aStyles) {
				return this.context.service.resource.includeStyles(this._aStyles).then(function() {
					return that._mLayouts[that.context.self._sName];
				});
			}
			return this._mLayouts[this.context.self._sName];
		},

		setGroup : function(oGroup) {
			var that = this;
			return this._oMenuService.populate(new sap.ui.commons.Menu(), oGroup, {
				bFilter : true,
				fnVisitor : function(iIndex, mItem) {
					if (mItem.type == "action") {
						that._mLayouts[that.context.self._sName].addContent(that._createButton(mItem));
					}
				}
			}).then(function() {
				that._filterSidebarItems();
			});
		},

		setSelectedItem : function() {

		},

		_createButton : function(mItem) {
			var sIconUri = this._getIconUri(mItem.icon);
			var oButton = new sap.ui.commons.Button({
				id : this._createId(mItem.id),
				icon : sIconUri,
				enabled : false,
				tooltip : (mItem.command) ? mItem.command.getKeyBindingTooltip(mItem.label) : mItem.label,
				press : jQuery.proxy(this._createHandler(mItem.command, mItem.command.getValue(), this._createId(mItem.id)), this)
			});
			this._mItemToCommandMapping[oButton.getId()] = mItem.command;
			this._mCommandToItemMapping[mItem.command.getId()] = oButton.getId();
			if (!sIconUri) {
				oButton.setText(mItem.label);
				// TODO: Check style
				oButton.addStyleClass("watt_sidebar_button");
			}
			this._mButtons[this.context.self._sName].push(oButton);
			return oButton;
		},

		//FIXME Redundant code: Same as in Toolbar.js
		_getIconUri : function(sIconUri) {
			if (!sIconUri){
				return sIconUri;
			}
			
			var sUri;
			if (sap.ui.core.IconPool) {
				sUri = sap.ui.core.IconPool.getIconURI(sIconUri, "watt");
				if (!sUri) {
					sUri = sap.ui.core.IconPool.getIconURI(sIconUri);
					if (!sUri) {
						sUri = require.toUrl(sIconUri);
					}
				}
			} else {
				sUri = require.toUrl(sIconUri);
			}
			
			return sUri;
		},

		_createId : function(sId) {
			return this._mLayouts[this.context.self._sName].getId() + "-" + sId;
		},

		_createHandler : function(oCommand, vValue, sButtonId) {
			return function() {
				if (oCommand.getType() === "boolean") {
					oCommand.execute(!oCommand.getValue()).done();
				} else {
					oCommand.execute(oCommand.getValue()).done();
				}
			};
		},

		_filterSidebarItems : function(aCommands) {
			var that = this;
			var aItems = this._mLayouts[this.context.self._sName].getContent();
			jQuery.each(aItems, function(i, oItem) {

				if (oItem instanceof sap.ui.commons.Button) {

					var oCommand = that._mItemToCommandMapping[oItem.getId()];

					oCommand.getState().then(function(oState) {
						
						oItem.setEnabled(oState.enabled);
						return Q();
						
					}).then(function() {

						return oCommand._oService.isActive().then(function(bVisible) {

							if (bVisible) {
								oItem.addStyleClass("selected");
								that._mSelectedButton[that.context.self._sName] = oItem;
							} else {
								oItem.removeStyleClass("selected");
								that._mSelectedButton[that.context.self._sName] = "";
							}

						});

					}).done();
				}
			});
		},

		refresh : function() {
			jQuery.each(this._aMenu, function(iIndex, oMenu) {
				oMenu.dirty = true;
			});
		},

		onAfterSetSelection : function(oEvent) {
			this._filterSidebarItems();
		},

		onInvalidated : function(oEvent) {
			this._filterSidebarItems();
		}
	});

	return Sidebar;

});