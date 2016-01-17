define([ "./Proxy", "sap/watt/lib/lodash/lodash"], function(Proxy, _) {
	"use strict";
	var ServiceRegistry = function() {
		this._mRegistry = {};
	};

	ServiceRegistry.prototype.register = function(sServiceName, mConfig) {
		if (this._mRegistry[sServiceName]) {
			throw new Error("Service " + sServiceName + " is already implemented");
		}
		this._mRegistry[sServiceName] = "Under construction";

		var that = this;
		return Proxy.create(sServiceName, mConfig).then(function(oService) {
			that._mRegistry[sServiceName] = oService;
			return oService;
		});
	};

	ServiceRegistry.prototype.get = function(sServiceName) {
		var oService = this._mRegistry[sServiceName];
		if (!oService) {
			this._error("Service not registered", sServiceName);
		}
		return oService;
	};

	ServiceRegistry.prototype.getAllServiceNames = function() {
		return _.keys(this._mRegistry);
	};

	ServiceRegistry.prototype._error = function(sMessage, sServiceName) {
		// TODO: Should we only throw errors when IDE is in debug mode?
		var aMessage = [];
		if (sServiceName) {
			aMessage.push("Service: " + sServiceName);
		}
		if (sMessage) {
			aMessage.push("Message: " + sMessage);
		}
		throw new Error(aMessage.join(" | "));
	};

	return ServiceRegistry;
});
