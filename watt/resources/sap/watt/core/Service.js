define([ "./Proxy" ], function(Proxy) {
	"use strict";
	var Service = {

		/**
		 * The service registry.
		 * @static
		 * @private
		 */
		_mRegistry : {},

		/**
		 * registration of service is moved to ServiceRegistry. Service.get() is still used, but deprecated
		 * Provide with ServiceRegistry and keep Service.get() alive until all references changed 
		 */
		$setServiceRegistry : function(oServiceRegistry) {
			this._oServiceRegistry = oServiceRegistry;
		},

		get : function(sServiceName) {
			//deprecated call
			var aStack;
			try {
				throw new Error();
			} catch (e) {
				aStack = e.stack.split("\n");
			}
			var sCaller = aStack[2] || "caller unkown";
			console.error("Deprecated: Service.get() - use context.service instead - Caller: " + sCaller);
			return this._oServiceRegistry.get(sServiceName);
		}

	};

	return Service;

});