define(function() {
	"use strict";
	var sortByPrio = function(a, b) {
		return a.getPrio() - b.getPrio();
	};

	/**
	 * InlineItem Class
	 */
	var InlineItem = function(mConfig, oGroup) {
		this._sId = mConfig.id || oGroup.getId();
		this._iPrio = mConfig.prio;
		this._sLabel = mConfig.label;
		this._oGroup = oGroup;
	};

	InlineItem.prototype.getId = function() {
		return this._sId;
	};

	InlineItem.prototype.getGroup = function() {
		return this._oGroup;
	};

	InlineItem.prototype.getPrio = function() {
		return this._iPrio;
	};

	InlineItem.prototype.getLabel = function() {
		return this._sLabel;
	};

	return InlineItem;
});