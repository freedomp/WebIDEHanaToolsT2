define([], function () {
	"use strict";
	return {
		_oDocument: null,
		_aSourceDestinations: null,
		_aTargetDestinations: null,

		setServiceData: function (oDocument, aSourceDestinations, aTargetDestinations) {
			this._oDocument = oDocument;
			this._aSourceDestinations = aSourceDestinations;
			this._aTargetDestinations = aTargetDestinations;
		},

		getDocument: function () {
			return this._oDocument;
		},

		getSourceDestinations: function () {
			return this._aSourceDestinations;
		},

		getTargetDestinations: function () {
			return this._aTargetDestinations;
		},

		getBackendSystemModel: function (oModel) {
			return oModel.getProperty("/backendSystem");
		},
		
		onTargetChanged: function (oModel, index, sValue) {
			// Read the model
			var oTargetDestination = oModel.getProperty("/backendSystem");
			// Update the new destination
			oTargetDestination[index].destinations = sValue;
			// Set model with the new value
			oModel.setProperty("/backendSystem", oTargetDestination);
		},

		updateModel: function (oEvent) {
			// Check that the model is synced with the list of source destinations:
			// 1. Remove systems that do not exist any more in the list of source destinations but are still in the model.
			// 2. Add systems that exist in the list of source destinations but are not in the model.
			// And check that the model is sorted by source destination system

			// Update model in case of change in systems
			var aModelBackendSystems = oEvent.getModel().getProperty("/backendSystem");
			var aSourceDestinations = this._aSourceDestinations;
			var aTargetDestinations = this._aTargetDestinations;
			if(aModelBackendSystems){
				if (!this._isModelUpdated(aModelBackendSystems, aSourceDestinations)) {
					// Remove systems that do not exist any more in the list of source destinations but are still in the model
					for (var i = 0; i < aModelBackendSystems.length; i++) {
						var bExistsInSource = false;
						var sCurrModelsource = aModelBackendSystems[i].source;
						for (var j = 0; j < aSourceDestinations.length; j++) {
							var sCurrSourceDestination = aSourceDestinations[j];
							if (sCurrModelsource == sCurrSourceDestination) {
								// system found
								bExistsInSource = true;
								break;
							}
						}
						if (!bExistsInSource) {
							// Remove this system from the model since it is not in the list of source destinations any more
							aModelBackendSystems.splice(i, 1);
							i--;
						}
					}
	
					// Add systems that exist in the list of source destinations but are not in the model
					for (var j = 0; j < aSourceDestinations.length; j++) {
						var bExistsInModel = false;
						var sCurrSourceDestination = aSourceDestinations[j];
						for (var i = 0; i < aModelBackendSystems.length; i++) {
							var sCurrModelsource = aModelBackendSystems[i].source;
							if (sCurrModelsource == sCurrSourceDestination) {
								// found
								bExistsInModel = true;
								break;
							}
						}
						if (!bExistsInModel) {
							// Add this system to the model since it is in the list of source destinations but not in the model
							var sDestination = "";
							// Look for a match to this source system in the Target systems
							for (var k = 0; k < aTargetDestinations.length; k++) {
								var sCurrTargetDestination = aTargetDestinations[k];
								if (sCurrTargetDestination == sCurrSourceDestination) {
									// Match found
									sDestination = sCurrTargetDestination;
									break;
								}
							}
	
							var newSystem = {
								source: sCurrSourceDestination,
								destinations: sDestination
							};
							aModelBackendSystems.push(newSystem);
						}
					}
	
					// Sort model 
					aModelBackendSystems.sort(this._backendSystemsCompare);
	
					// Update the model if needed
					oEvent.getModel().setProperty("/backendSystem", aModelBackendSystems);
				}
			} else { //aModelBackendSystems does not exist
				aModelBackendSystems = [];
				// Add systems that exist in the list of source destinations but are not in the model
				for (var j = 0; j < aSourceDestinations.length; j++) {
					var sCurrSourceDestination = aSourceDestinations[j];
					// Add this system to the model since it is in the list of source destinations but not in the model
					var sDestination = "";
					// Look for a match to this source system in the Target systems
					for (var k = 0; k < aTargetDestinations.length; k++) {
						var sCurrTargetDestination = aTargetDestinations[k];
						if (sCurrTargetDestination == sCurrSourceDestination) {
							// Match found
							sDestination = sCurrTargetDestination;
							break;
						}
					}
					var newSystem = {
						source: sCurrSourceDestination,
						destinations: sDestination
					};
					aModelBackendSystems.push(newSystem);
				}
				// Update the model
				oEvent.getModel().setProperty("/backendSystem", aModelBackendSystems);
			}
		},

		_isModelUpdated: function (aModelBackendSystems, aSourceDestinations) {
			// In most cases no update will be needed, so to improve performance do a fast check that the model is updated.
			// Since aSourceDestinations is already sorted we can only check the same indexes. In most cases this will pass. If not, we will update the model.
			if (!aModelBackendSystems || aModelBackendSystems.length != aSourceDestinations.length) {
				return false;
			}

			for (var k = 0; k < aModelBackendSystems.length; k++) {
				var bExistsInSource = false;
				var sCurrModelsource = aModelBackendSystems[k].source;
				var sCurrSourceDestination = aSourceDestinations[k];
				if (sCurrModelsource != sCurrSourceDestination) {
					return false;
				}
			}
			return true;
		},

		// Sort backend Systems alphabetically 
		_backendSystemsCompare: function (a, b) {
			if (a.source < b.source) {
				return -1;
			}
			if (a.source > b.source) {
				return 1;
			}
			return 0;
		}


	};
});