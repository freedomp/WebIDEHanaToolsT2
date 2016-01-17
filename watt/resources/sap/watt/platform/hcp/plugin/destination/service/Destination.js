define(["sap/watt/lib/lodash/lodash"], function(_) {
	"use strict";
	return {

		// destinations registry
		_mDestinations : [],
		_DESTINATIONS_PATH : sap.watt.getEnv("context_root") + "destinations",
		_API_PATH : sap.watt.getEnv("context_root") + "api",
		_API_LIST_DESTINATIONS : "/listDestinations",
		_mUsages : {},
		
		configure : function(mConfig) {
			var that = this;
			that._mConfig = mConfig;

			// collect registered usages
			jQuery.each(mConfig.usages, function(iIndex, mSettings) {
			    //check for duplicate usages
			    if (that._mUsages.hasOwnProperty(mSettings.name)) {
			        that.context.service.log.error("destination",
										that.context.i18n.getText("i18n", "destination_errorDuplicateUsage", mSettings.name), [ "system" ]).done();
			    }
			    that._mUsages[mSettings.name] = mSettings.path;
			});

		
		},
		
		loadDestinations : function() {
		    var that = this;
			var sPath = this._API_PATH + this._API_LIST_DESTINATIONS;
			var oXhr = jQuery.ajax(sPath);
			return Q(oXhr)
					.then(
							function() {
								if (oXhr.responseText) {
									//parse array and fill destination registry
									var aDestinations = JSON.parse(oXhr.responseText);
									for ( var i in aDestinations) {
										try {
											// to ensure that former created destinations with old property names RDEUsage, RDESystem still work
											// first check for the new property names WebIDEUsage, WebIDESystem and use old names as fallback
											// but we raise a deprecated warning in the console
											if (aDestinations[i]["RDEUsage"] || aDestinations[i]["RDEEnabled"]
													|| aDestinations[i]["RDESystem"]) {
												that.context.service.log.warn(
														"destination",
														that.context.i18n.getText("i18n", "destination_deprecatedPropertyName",
																aDestinations[i].Name), [ "system" ]).done();
											}
											// multi-usage indicated in WebIDEUsage with , separation
											var sUsage = aDestinations[i]["WebIDEUsage"] ? aDestinations[i]["WebIDEUsage"]
													: aDestinations[i]["RDEUsage"];
											var aAdditionalData =  aDestinations[i]["WebIDEAdditionalData"] ? aDestinations[i]["WebIDEAdditionalData"].split(",") : [];
											var aUsage = sUsage.split(",");
											var client = "";
											if (aDestinations[i].hasOwnProperty("sap-client")) {
												client = aDestinations[i]["sap-client"];
											}
											for ( var j in aUsage) {
												var sUsage = aUsage[j].trim();
                                    var sProxyUrlPrefix = that._calculateProxyUrlPrefix(aDestinations[i]);
												that
														._addDestination({
															name : aDestinations[i].Name,
															description : aDestinations[i].Description
																	&& aDestinations[i].Description.length > 0 ? aDestinations[i].Description
																	: aDestinations[i].Name,
                                            				proxyUrlPrefix: sProxyUrlPrefix,
															path : that._calculatePath(aDestinations[i], sUsage),
                                            				url: that._calculateUrl(aDestinations[i], sUsage, sProxyUrlPrefix),
															wattUsage : sUsage,
															systemId : aDestinations[i]["WebIDESystem"] ? aDestinations[i]["WebIDESystem"]
																	: aDestinations[i]["RDESystem"],
															entryPath : that._calculateEntryPath(aDestinations[i], sUsage),
															sapClient : client,
															additionalData : aAdditionalData 
														});
											}
										} catch (e) {
											that.context.service.log.warn(
													"destination",
													that.context.i18n
															.getText("i18n", "destination_validDestination", aDestinations[i].Name),
													[ "system" ]).done();
										}
									}
								}

							},
							function(oXHR) {
								that.context.service.log.error("destination",
										that.context.i18n.getText("i18n", "destination_errorFetchDestinationList"), [ "system" ]).done();
							});
		},

		getDestinations : function(sWattUsage, bShouldSort, sSortBy) {
			var aDestinations = [];
			for ( var i in this._mDestinations) {
				if ((sWattUsage && this._mDestinations[i].wattUsage == sWattUsage) || !sWattUsage) {
					aDestinations.push(this._mDestinations[i]);
				}
			}
			
			if (bShouldSort) {
			    if (!sSortBy) {
			        sSortBy = "name"; // Default
			    }
			    aDestinations = _.sortBy(aDestinations, sSortBy);
			}
			
			return aDestinations;
		},

		getDestination : function(sName) {
			var aDestinations = [];
			for ( var i in this._mDestinations) {
				if (sName && this._mDestinations[i].name == sName) {
					aDestinations.push(this._mDestinations[i]);
				}
			}
			return aDestinations;
		},

		_addDestination : function(oDestination) {
			var that = this;
			if (!oDestination || !oDestination.name || !oDestination.wattUsage || !oDestination.url || (oDestination.wattUsage && this._mUsages[oDestination.wattUsage] === undefined)) {
				that.context.service.log.warn("destination",
						that.context.i18n.getText("i18n", "destination_validDestination", oDestination.name), [ "system" ]).done();
			} else {
				// destination with name and usage needs to be unique
				if (this._mDestinations["name"] != oDestination.name
						|| (this._mDestinations["name"] == oDestination.name && this._mDestinations["wattUsage"] != oDestination.wattUsage)) {
					this._mDestinations.push(oDestination);
				} else {
					that.context.service.log.error("destination",
							that.context.i18n.getText("i18n", "destination_destinationExists", oDestination.name, oDestination.wattUsage),
							[ "system" ]).done();
				}
			}
		},

        _calculateProxyUrlPrefix: function (mDestination) {
            return this._DESTINATIONS_PATH + '/' + mDestination.Name;
        },

        _calculateUrl: function (mDestination, sUsage, proxyUrlPrefix) {
			// if path empty add hard coded path from usage
            return (mDestination.Path && mDestination.Path.length > 1) ? proxyUrlPrefix : proxyUrlPrefix + this._mUsages[sUsage];
		},

		_calculatePath : function(mDestination, sUsage) {
			// if path not empty use path else get hard coded path from usage
			return (mDestination.Path && mDestination.Path.length > 1) ? mDestination.Path : this._mUsages[sUsage];
		},

		_calculateEntryPath : function(mDestination, sUsage) {
			// if path not empty entryPath is undefined else get hard coded entryPath from usage
			return (mDestination.Path && mDestination.Path.length > 1) ? undefined : this._mUsages[sUsage];
        }
	};
});