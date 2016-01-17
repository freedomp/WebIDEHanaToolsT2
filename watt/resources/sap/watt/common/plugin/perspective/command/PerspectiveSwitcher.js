define(function() {
	"use strict";

	var oCommand = function() {
	};

	oCommand.prototype = jQuery.extend(oCommand.prototype, {

		_sPerspective : undefined,
		_sID : undefined,
		
		execute : function() {
			return this.context.service.perspective.renderPerspective(this._sPerspective);
		},

		isAvailable : function() {
			return true;
		},

		isEnabled : function() {
			var that = this;
			return this.context.service.perspective.getCurrentPerspective().then(function(sPerspectiveName) {
				return sPerspectiveName != that._sPerspective;
			});
		},

		isActive : function() {
			var that = this;
			return this.context.service.perspective.getCurrentPerspective().then(function(sPerspectiveName) {
				return sPerspectiveName == that._sPerspective;
			});
		},

		configure : function(mConfig) {
			this._sPerspective = mConfig.perspective;
			this._sID = mConfig.id;
		}

	});

	return oCommand;
});