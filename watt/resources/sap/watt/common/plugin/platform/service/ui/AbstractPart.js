define([], function() {
	"use strict";
	var AbstractPart = sap.ui.base.Object.extend("sap.watt.common.plugin.platform.service.ui.AbstractPart", {

		_bVisible : null,
		_aStyles : null,

		configure : function(mConfig) {
			this._aStyles = mConfig.styles;
			return Q();
		},
		
		getTitle : function() {
			return this.getMetadata().getName();
		},
		
		getTooltip : function() {
			return this.getMetadata().getName();
		},

		getFocusElement : function() {
			return this.getContent();
		},

		focus : function() {
			return this.context.service.focus.setFocus(this.context.self);
		},

		getContent : function() {
			if (this._aStyles) {
				return this.context.service.resource.includeStyles(this._aStyles).thenResolve(null);
			} else {
				return Q();
			}
		},

		setVisible : function(bVisible) {
			var that = this;
			if (this._bVisible !== bVisible) {
				return this.context.event.fireVisibilityChanged({
					visible : bVisible
				}).then(function() {
					that._bVisible = bVisible;
				}).fail(function(oError){
					console.error("AbstractUIPart: could not change visibility", oError);
				});
			} else {
				return Q();
			}
		},

		isVisible : function() {
			return !!this._bVisible;
		}
	});

	return AbstractPart;
});
