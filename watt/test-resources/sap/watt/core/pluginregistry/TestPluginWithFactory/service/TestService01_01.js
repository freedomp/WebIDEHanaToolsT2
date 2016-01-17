define(function() {
	
	var Impl = function() {
		this._mConfig = {};
	};
		
	Impl.prototype.init = function() {
	
	};
		
	Impl.prototype.configure = function(mConfig) {
		var that = this;
		jQuery.each(mConfig, function(sKey, vVal) {

			if (jQuery.isArray(vVal)) {
				if (that._mConfig[sKey]) {
					jQuery.merge(that._mConfig[sKey], vVal);
				} else {
					that._mConfig[sKey] = vVal;
				}
			} else {
				that._mConfig[sKey] = (typeof vVal != "undefined") ? vVal : that._mConfig[sKey];
			}
		});
	};

	Impl.prototype.method01 = function() {
		return this._mConfig.configurationProperty01;
	};
	
		Impl.prototype.method02 = function() {
		return this._mConfig.configurationProperty02;
	};

	Impl.prototype.method01triggerFireEvent01 = function() {
		this.context.event.fire("event01", {
			param01 : "aValueForParam01"
		});
	};
	
	return Impl;
});