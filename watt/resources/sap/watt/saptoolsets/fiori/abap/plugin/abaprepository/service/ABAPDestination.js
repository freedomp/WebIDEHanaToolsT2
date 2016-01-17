define([], function () {

	function ABAPDestination() {

		var that = this;

		// Cache with: key = proxyUrlPrefix of the destination, value = promise for getting the AdtRestResource instance for this destination
		var cache = null;

		this.getRestResource = function (destination) {

			if (!destination || destination === null // illegal parameter
				|| (typeof destination.wattUsage !== "string") || (destination.wattUsage !== "dev_abap") // not relevant destination
				|| (typeof destination.proxyUrlPrefix !== "string") || (destination.proxyUrlPrefix.length < 1)) // missing proxyUrlPrefix (needed for communication with the ABAP server)
			{
				return Q(null);
			}
			if (!cache || cache === null || (typeof cache[destination.proxyUrlPrefix] !== "object")) {
				// Create and cache the AdtRestResource (lazy)
				cache = cache || {};
				cache[destination.proxyUrlPrefix] = that.context.service.adtRestResourceFactory.createInstance({urlPrefix: destination.proxyUrlPrefix});
			}
			// Return the cached AdtRestResource instance (performance aspect: reuse of CSRF token of the cached instance)
			return cache[destination.proxyUrlPrefix];
		};
	}

	return new ABAPDestination();
});