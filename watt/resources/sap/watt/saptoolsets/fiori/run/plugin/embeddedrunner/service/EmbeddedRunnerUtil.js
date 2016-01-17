define(["sap/watt/saptoolsets/fiori/run/plugin/commonrunners/util/genericRunnersUtil"], function(runnerUtil) {

	"use strict";
	return {
		// Dictionary that maps system name to its applications
		_mSystemsApplicationsMap: {},
		// All systems that configure in the current account
		_oSystems: [],
		// Watt usages for destinations
		_aWattUsages: [
        "ui5_execute_abap"
         ],

		getWorkspaceApps: function() {
			var documentProviderService = this.context.service.filesystem.documentProvider;
			return documentProviderService.getRoot().then(function(oRootDocument) {
				return oRootDocument.getCurrentMetadata().then(function(aMetadataContent) {
					var aWorkspaceApps = [];
					for (var i = 0; i < aMetadataContent.length; i++) {
						var oMetadataElement = aMetadataContent[i];
						var oAppData = {};
						oAppData.wsName = oMetadataElement.name;
						oAppData.wsPath = oMetadataElement.path;
						aWorkspaceApps.push(oAppData);
					}
					return aWorkspaceApps;
				});
			});
		},

		getDefaultAppName: function(oDocument) {
			//Take app name from appDescriptor if available
			var oAppDescriptorService = this.context.service.ui5projecthandler;
			return oAppDescriptorService.getAttribute(oDocument, "sap.platform.abap").then(function(oAttribute) {
				if (oAttribute) {
					var aAttribute = oAttribute.uri.split("/");
					return aAttribute[aAttribute.length - 1];
				}
				return "";
			}).fail(function() {
				return "";
			});
		},

		getDefaultDestName: function(oDocument) {
			var oNeoappService = this.context.service.neoapp;
			//Take destination name from application neo-app.json
			return this.getDestinations().then(function(oDestinations) {
				return oNeoappService.getNeoappDocumentAndContent(oDocument).spread(function(oNeoappDocument, oNeoappContent) {
					var aRoutes = oNeoappContent.routes;
					for (var i = 0; i < aRoutes.length; i++) {
						var oRoute = aRoutes[i];
						if (oRoute.path.startsWith("/sap/opu/odata")) {
							var oRouteTarget = oRoute.target;
							if (oRouteTarget && oRouteTarget.type === "destination") {
								var sRouteTargetName = oRouteTarget.name;
								for (var j = 0; j < oDestinations.length; j++) {
									if (sRouteTargetName === oDestinations[j].name) {
										return sRouteTargetName;
									}
								}
							}
						}
					}
					return null;
				});
			});
		},

		getApplications: function(system) {
			if (this._look(system)) {
				return Q(this._look(system));
			} else {
				var that = this;
				var oSystem = this._getSystemObject(system);
				var abapRepositoryService = this.context.service.abaprepository;
				var discovery = this.context.service.discovery;
				return discovery.getStatusBySystem(oSystem).then(function(status) {
					var discoveryStatus = status;
					if (discoveryStatus) {
						return abapRepositoryService.getApplications(discoveryStatus).then(function(oApplications) {
							var aApplications = [];
							if (!oApplications) {
								return aApplications;
							}
							for (var i = 0; i < oApplications.length; i++) {
								var entry = oApplications[i].title;
								aApplications.push(entry);
							}
							that._mSystemsApplicationsMap[system] = aApplications;
							return aApplications;
						});
					}
				}).fail(function(oError) {
					throw new Error([oError.message]);
				});
			}
		},

		getDestinations: function() {
			if (this._oSystems.length > 0) {
				return Q(this._oSystems);
			} else {
				var that = this;
				var aDestinationsByUsage = [];
				var i;
				for (i = 0; i < that._aWattUsages.length; i++) {
					var wattUsage = that._aWattUsages[i];
					aDestinationsByUsage.push(this._getDestinationsByUsage(wattUsage));
				}
				return Q.all(aDestinationsByUsage).then(function(aAllDestinations) {
					for (i = 0; i < aAllDestinations.length; i++) {
						var currDestinations = aAllDestinations[i];
						if (currDestinations.length > 0) {
							that._addDestinations(currDestinations);
						}
					}
					that._removeDuplicates();
					return that._oSystems;
				});
			}
		},

		_getDestinationsByUsage: function(wattUsage) {
			var aDestinations = [];
			var DestinationService = this.context.service.destination;
			return DestinationService.getDestinations(wattUsage).then(function(aDestinationsByUsage) {
				for (var i = 0; i < aDestinationsByUsage.length; i++) {
					aDestinations.push(aDestinationsByUsage[i]);
				}
				return aDestinations;
			});
		},

		_addDestinations: function(currDestinations) {
			for (var i = 0; i < currDestinations.length; i++) {
				this._oSystems.push(currDestinations[i]);
			}
		},

		_removeDuplicates: function() {
			var alreadyAppears = [];
			var filterdSystems = [];
			for (var i = 0; i < this._oSystems.length; i++) {
				if (!runnerUtil.contains(this._oSystems[i].name, alreadyAppears)) {
					alreadyAppears.push(this._oSystems[i].name);
					filterdSystems.push(this._oSystems[i]);
				}
			}
			this._oSystems = filterdSystems;
		},

		_getSystemObject: function(system) {
			for (var i = 0; i < this._oSystems.length; i++) {
				var sCurrentSystemName = this._oSystems[i].name;
				if (system === sCurrentSystemName) {
					return this._oSystems[i];
				}
			}
			return null;
		},

		_look: function(system) {
			return this._mSystemsApplicationsMap[system];
		}
	};
});