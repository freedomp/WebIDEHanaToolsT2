define([], function() {

	TestService01_Configured = function() {
		this._mConfig = {};
	};

	TestService01_Configured.prototype.init = function() {
	};

	TestService01_Configured.prototype.configure = function(mConfig) {
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

	TestService01_Configured.prototype.method01 = function(sParam01) {
		if (typeof this._mConfig.configurationProperty01_not_multiple == "undefined") {
			return "IsUndefined";
		} else {
			return this._mConfig.configurationProperty01_not_multiple;
		}

	};

	TestService01_Configured.prototype.method02_callAnonymousServices = function(sParam01) {
		var oDeferred = Q.defer();
		var aPluginPromises = [];

		for ( var i = 0; i < this._mConfig.configurationProperty03_anonymousService.length; i++) {
			aPluginPromises.push(this._mConfig.configurationProperty03_anonymousService[i].method01());
		}
		;

		return Q.all(aPluginPromises).then(function() {
			oDeferred.resolve();
		});
	};

	TestService01_Configured.prototype.method03_callAnonymousService_wo_Configuration = function(sParam01) {
		return this._mConfig.configurationProperty04_anonymousService_wo_Configuration[0].method01();
	};

	TestService01_Configured.prototype.callChildServicesOfSameTypeSimpleDefinition = function() {
		return this._mConfig.childServicesOfSameTypeSimpleDefition[0].method01();
	};

	TestService01_Configured.prototype.callChildServicesOfSameType = function() {
		return this._mConfig.childServicesOfSameType[0].service.method01();
	};

	TestService01_Configured.prototype.callAnonymousServiceThatIsConfiguredInArrayOfComplexType = function() {
		return this._mConfig.configurationProperty06_withArrayOfComplexType_withAnonymousService[0][1].service.method01();
	};

	return TestService01_Configured;

});