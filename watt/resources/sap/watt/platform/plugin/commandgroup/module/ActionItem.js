define(function() {
	"use strict";
	var sortByPrio = function(a, b) {
		return a.getPrio() - b.getPrio();
	};

	/**
	 * Item Class
	 */
	var Item = function(mConfig, oCommand) {
		this._oCommand = oCommand;
		this._sId = mConfig.id || oCommand.getId();
		this._iPrio = mConfig.prio;
		this._sLabel = mConfig.label || oCommand.getLabel();
		this._sIcon = mConfig.icon || oCommand.getIcon();
		this._sIconLabel = mConfig.iconLabel || oCommand.getIconLabel();
		this._bDefault = mConfig["default"];
	};

	Item.prototype.getId = function() {
		return this._sId;
	};

	Item.prototype.getCommand = function() {
		return this._oCommand;
	};

	Item.prototype.getIcon = function() {
		return this._sIcon;
	};

	Item.prototype.getIconLabel = function() {
		return this._sIconLabel;
	};

	Item.prototype.getPrio = function() {
		return this._iPrio;
	};

	Item.prototype.getLabel = function() {
		return this._sLabel;
	};

	Item.prototype.getValue = function() {
		return this._oCommand.getValue();
	};

	Item.prototype.setValue = function(vValue) {
		this._oCommand.setValue(vValue);
	};

	Item.prototype.isDefault = function() {
		return this._bDefault;
	};

	return Item;
});