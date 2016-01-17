define([ "../module/Group", "../module/ActionItem", "../module/MenuItem", "../module/InlineItem" ], function(Group, ActionItem, MenuItem,
		InlineItem) {
	"use strict";
	var fnError = function(sMessage) {
		throw new Error("CommandGroup: " + sMessage);
	};

	/**
	 * Service
	 */
	return {
		_mGroups : {},
		_sDefaultType : "action",
		_mTypes : {
			"action" : function(mConfig, oParent) {
				var that = this;
				return this.context.service.command.getCommand(mConfig.command).then(function(oCommand) {
					if (that._assertCommand(mConfig.command, oCommand, mConfig)) {
						oParent.addItem(new ActionItem(mConfig, oCommand));
					}
				});
			},
			"menu" : function(mConfig, oParent) {
				var oGroup = this.getGroup(mConfig.group);
				if (this._assertGroup(mConfig.group, oGroup, mConfig)) {
					oParent.addItem(new MenuItem(mConfig, oGroup));
				}
			},
			"inline" : function(mConfig, oParent) {
				var oGroup = this.getGroup(mConfig.group);
				if (this._assertGroup(mConfig.group, oGroup, mConfig)) {
					oParent.addItem(new InlineItem(mConfig, oGroup));
				}
			},
			"list" : function(mConfig, oParent) {
				var oGroup = this.getGroup(mConfig.group);
				if (this._assertGroup(mConfig.group, oGroup, mConfig)) {
					oParent.addItem(new MenuItem(mConfig, oGroup));
				}
			}
		},

		_assertCommand : function(sCommandId, oCommand, mConfig) {
			if (!oCommand) {
				console.warn("The command with ID '" + sCommandId + "' does not exist. Group Item: " + JSON.stringify(mConfig));
				return false;
			}
			return true;
		},

		_assertGroup : function(sGroupId, oGroup, mConfig) {
			if (!oGroup) {
				console.warn("The group with ID '" + sGroupId + "' does not exist. Group Item: " + JSON.stringify(mConfig));
				return false;
			}
			return true;
		},

		/**
		* @memberOf sap.watt.uitools.plugin.Group.service.GroupImpl
		*/
		configure : function(mConfig) {
			var that = this;
			jQuery.each(mConfig.groups || [], function(i, mGroup) {
				if (that._mGroups[mGroup.id]) {
					fnError("Group with ID '" + mGroup.id + "' is already defined");
				}
				that._mGroups[mGroup.id] = new Group(mGroup);
			});
			var aPromises = [];
			jQuery.each(mConfig.items || [], function(i, mItem) {
				var oParentGroup = that.getGroup(mItem.parent);
				if (that._assertGroup(mItem.parent, oParentGroup, mItem)) {
					var sType = mItem.type || that._sDefaultType;
					if (that._mTypes[sType]) {
						aPromises.push(that._mTypes[sType].call(that, mItem, oParentGroup));
					} else {
						fnError("Not supported command group type. Supported types are: " + Object.keys(that._mTypes).join(", "));
					}
				}
			});
			return Q.all(aPromises);
		},

		getGroup : function(sGroupID) {
			return this._mGroups[sGroupID];
		}
	};

});