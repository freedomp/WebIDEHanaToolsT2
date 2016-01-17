define(function() {
	"use strict";
	return {

		_bEnabled : true,
		_handler : [],
		
		init : function(){
			if (jQuery.browser.mozilla) {
				//below doesn't work with firefox
				window.addEventListener("beforeunload", jQuery.proxy(this._onUnload, this));
			} else {
				//needs to be unloaded in tests
				jQuery(window).bind("beforeunload", jQuery.proxy(this._onUnload, this));
			}
		},
		
		addHandler : function(fHandler) {
			this._handler.push(fHandler);
		},
		
		removeHandler : function(fHandler) {
			var index = this._handler.indexOf(fHandler);
			if (index > -1) {
				this._handler.splice(index, 1);
			}
		},
		
		setEnabled : function(bEnabled) {
			this._bEnabled = bEnabled;
		},
		
		_onUnload : function(e){
			if (this._bEnabled){
				var sResult = undefined;
				jQuery.each(this._handler, function(index, fHandler){
					sResult = fHandler.apply(null);
					if (sResult){
						return false;
					}
				});
				
				if (sResult){
					if (jQuery.browser.mozilla) {
						e.returnValue = sResult;
					} else {
						return sResult;
					}
				}
			}
		}
	};
});