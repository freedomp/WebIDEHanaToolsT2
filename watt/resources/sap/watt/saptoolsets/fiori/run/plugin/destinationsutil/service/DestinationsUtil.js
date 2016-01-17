define([], function () {

	"use strict";

	return {

		// Get all backend destination systems from HCP
		getHcpDestinations: function () {
			var that = this;
			return this.context.service.destination.getDestinations().then(function (aUi5Destinations) {
				var aHcpDestinations = [];
				// Remove empty lines and take the name attribute
				if ((aUi5Destinations !== null) && (aUi5Destinations.length !== 0)) {
					for (var i = 0; i < aUi5Destinations.length; i++) {
						aHcpDestinations.push(aUi5Destinations[i].name);
					}
				}
				return that._sortAndUniqueArray(aHcpDestinations);
			});
		},

		// Get all backend destination systems from the project's neo-app.json file
		getNeoAppDestinations: function (oDocument) {
			var that = this;
			return this.context.service.appmetadata.getNeoMetadata(oDocument).then(function (oNeoApp) {
				var aNeoAppDestinations = [];
				if ((oNeoApp !== null) && (oNeoApp.length !== 0 )) {
					if (oNeoApp.routes.length > 0) {
						for (var i = 0; i < oNeoApp.routes.length; i++) {
							if (oNeoApp.routes[i].target.type === "destination") {
								aNeoAppDestinations.push(oNeoApp.routes[i].target.name);
							}
						}
					}
				}
				return that._sortAndUniqueArray(aNeoAppDestinations);
			});
		},

		_sortAndUniqueArray: function (aArray) {
			if (aArray.length > 0) {
				aArray = aArray.sort();
				var aResult = [aArray[0]];
				for (var i = 1; i < aArray.length; i++) { // start loop at 1 as element 0 cannot be a duplicate
					if (aArray[i - 1] !== aArray[i]) {
						aResult.push(aArray[i]);
					}
				}
				return aResult;
			} else {
				return aArray;
			}
		}
	};
});