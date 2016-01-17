define([], function() {

	"use strict";

	return {
		/*Get Reuse libraries defined in HCP and in workspace*/
		getLibsFromHCPandWorkspace: function(bWorkspace) {
			var that = this;
			var aPromises = [that.context.service.libraryDiscovery.getLibrariesFromHCP()];
			if (bWorkspace === true) {
				aPromises.push(that.context.service.libraryDiscovery.getLibrariesFromWorkspace());
			}
			return Q.all(aPromises).spread(function(oLibHcpResult, oLibWsResult) {
				return {
					hcp: oLibHcpResult,
					ws: oLibWsResult
				};
			});
		}

	};
});