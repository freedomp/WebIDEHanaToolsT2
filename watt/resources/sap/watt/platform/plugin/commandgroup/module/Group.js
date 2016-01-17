define([ "sap/watt/common/error/AssertError" ], function(AssertError) {
	"use strict";
	var sortByPrio = function(a, b) {
		return a.getPrio() - b.getPrio();
	};

	/**
	 * Group Class
	 */
	var Group = function(mConfig, oCommand) {
		this._sId = mConfig.id;
		this._oCommand = oCommand;
		this._aItems = [];
		this._sLabel = mConfig.label;
		this._sIcon = mConfig.icon;
		this._sIconLabel = mConfig.iconLabel;
		this._oService = mConfig.service;
	};

	Group.prototype.getId = function() {
		return this._sId;
	};

	Group.prototype.addItem = function(oItem) {
		if (this._oService) {
			throw new Error("The items of the group '" + this.getId() + "' are retrieved dynamically. Adding items is not allowed");
		}
		this._aItems.push(oItem);
		this._aItems.sort(sortByPrio);
	};

	Group.prototype.getItems = function() {
		if (this._oService) {
			var sGroupId = this.getId();
			return this._oService.getItems(sGroupId).then(null, function(oError) {
				if (oError instanceof AssertError) {
					return [];
				} else {
					throw oError;
				}
			});
		} else {
			return Q(this._aItems);
		}
	};

	Group.prototype.getCommand = function() {
		return this._oCommand;
	};

	Group.prototype.getIcon = function() {
		return this._sIcon;
	};

	Group.prototype.getIconLabel = function() {
		return this._sIconLabel;
	};

	Group.prototype.getLabel = function() {
		return this._sLabel;
	};

	Group.prototype.getDefaultItem = function() {
		// Return the first item in the by prio sorted items array
		for ( var i = 0; i < this._aItems.length; i++) {
			var oItem = this._aItems[i];
			if (oItem.isDefault && oItem.isDefault()) {
				return oItem;
			}
		}
	};

	return Group;
});