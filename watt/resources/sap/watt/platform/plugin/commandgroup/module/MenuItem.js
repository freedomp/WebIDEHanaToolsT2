define(function() {
	"use strict";
	/**
	 * MenuItem Class
	 */
	var MenuItem = function(mConfig, oGroup) {
		this._sId = mConfig.id || oGroup.getId();
		this._iPrio = mConfig.prio;
		this._sLabel = mConfig.label || oGroup.getLabel();
		this._sIcon = mConfig.icon || oGroup.getIcon();
		this._sIconLabel = mConfig.iconLabel || oGroup.getIconLabel();
		this._oGroup = oGroup;
		this._sType = mConfig.type;
	};

	MenuItem.prototype.getId = function() {
		return this._sId;
	};

	MenuItem.prototype.getGroup = function() {
		return this._oGroup;
	};

	MenuItem.prototype.getIcon = function() {
		return this._sIcon;
	};

	MenuItem.prototype.getIconLabel = function() {
		return this._sIconLabel;
	};

	MenuItem.prototype.getPrio = function() {
		return this._iPrio;
	};

	MenuItem.prototype.getLabel = function() {
		return this._sLabel;
	};

	MenuItem.prototype.getType = function() {
		return this._sType;
	};

	return MenuItem;
});
