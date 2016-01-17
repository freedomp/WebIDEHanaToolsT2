define(function() {
	"use strict";

	var oCommand = function() {
	};

	oCommand.prototype = jQuery.extend(oCommand.prototype, {

		_oUIPart : undefined, // a service implementing UI part
		_sPerspective : undefined,
		_sID : undefined,

		execute : function() {
			var that = this;
			return this._oUIPart.isVisible().then(function(bVisible) {
				that.context.service.perspective.report("UiPartToggleState", that._oUIPart._sName+" "+ !bVisible).done();
				return that._oUIPart.setVisible(!bVisible);
			});
		},

		isAvailable : function() {
			return true;
		},

		isEnabled : function() {
			var that = this;
			return this.context.service.perspective.getCurrentPerspective().then(function(sPerspectiveName) {
				return sPerspectiveName === that._sPerspective;
			});
		},

		isActive : function() {
			var that = this;
			return Q.spread([ this._oUIPart.isVisible(), this.context.service.perspective.getCurrentPerspective() ], function(bViewIsVisible,
					sPerspectiveName) {
				return Q(bViewIsVisible && (sPerspectiveName === that._sPerspective));
			});
		},
		
		_onVisibilityChange: function(){
			var that = this;
			this.context.service.command.getCommand(this._sID).then(function(oMetaCommand){
				return that.context.service.command.context.event.fireInvalidated({ commands : [oMetaCommand] });
			}).done();
		},

		configure : function(mConfig) {
			this._oUIPart = mConfig.service;
			this._sPerspective = mConfig.perspective;
			this._sID = mConfig.id;
			this._oUIPart.attachEvent("visibilityChanged", this._onVisibilityChange, this);
		}

	});

	return oCommand;
});