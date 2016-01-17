define(function() {

	var AnonymousService01 = function() {
		this._mConfig = {};
	};

	AnonymousService01.prototype.init = function() {
	};

	AnonymousService01.prototype.configure = function(mConfig) {
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
				;
			}
		});
	};

	AnonymousService01.prototype.method01 = function(sParam01) {
		return this._mConfig;
	};

	return AnonymousService01;

});