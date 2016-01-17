define(["sap/watt/lib/lodash/lodash"], function(_) {

	"use strict";

	return {
		_oService: null,
		_aComponents: [],
		_aEventTypes: [],
		_mPerfMeasures: {},

		configure: function(mConfig) {
			if (mConfig.service) {
				this._oService = mConfig.service;
			}
			var oReportParams = mConfig.reportParams;
			for (var i = 0; i < oReportParams.length; i++) {
				var aReportComponents = oReportParams[i].components;
				var aReportEventTypes = oReportParams[i].eventTypes;
				if (aReportComponents) {
					for (var j = 0; j < aReportComponents.length; j++) {
						this._aComponents.push(aReportComponents[j]);
					}
				}
				if (aReportEventTypes) {
					for (var k = 0; k < aReportEventTypes.length; k++) {
						this._aEventTypes.push(aReportEventTypes[k]);
					}
				}
			}
			this._aComponents = _.uniq(this._aComponents);
			this._aEventTypes = _.uniq(this._aEventTypes);
		},

		onAllPluginsStarted: function() {
			var that = this;
			return this.context.service.preferences.get("UsageAnalytics").then(function(oUsageAnalyticsReportSetting) {
				if (oUsageAnalyticsReportSetting && oUsageAnalyticsReportSetting.allowTracking === false) {
					return;
				}
				var iEventComponentIndex = _.findIndex(that._aComponents, function(sComponent) {
					return sComponent === "WARP_TEST";
				});
				if (that._oService && iEventComponentIndex === -1) {
					var oIDEData = {};
					return Q.spread(that._getPromisses(), function(oUserInfo, mVersion) {
						oIDEData.isSAPUser = /(@sap.com)$/.test(oUserInfo.sEMail);
						oIDEData.IDE_version = mVersion.version.replace("SNAPSHOT", mVersion.timestamp);
						return that._oService.setCustomProperties(oIDEData);
					});
				}
			});
		},

		startPerf: function(sEventComponent, sEventType) {
			var that = this;
			return this.context.service.preferences.get("UsageAnalytics").then(function(oUsageAnalyticsReportSetting) {
				if (oUsageAnalyticsReportSetting && oUsageAnalyticsReportSetting.allowTracking === false) {
					return;
				}
				if (sEventComponent && sEventType) {
					that._mPerfMeasures[that._getPerfMeasuresKey(sEventComponent, sEventType)] = Date.now();
				}
			});
		},

		report: function(sEventComponent, sEventType, sEventValue) {
			var that = this;
			return this.context.service.preferences.get("UsageAnalytics").then(function(oUsageAnalyticsReportSetting) {
				if (oUsageAnalyticsReportSetting && oUsageAnalyticsReportSetting.allowTracking === false) {
					return;
				}
				if (that._oService) {
					var e2eTime = null;
					var sKey = that._getPerfMeasuresKey(sEventComponent, sEventType);
					var startTime = that._mPerfMeasures[sKey];
					if (startTime) {
						var endTime = Date.now();
						e2eTime = endTime - startTime;
						delete that._mPerfMeasures[sKey];
					}
					var oLogService = that.context.service.log;
					//Verify eventType --> If not configured or provided, "GENERIC_sEventType" will be assigned
					var iEventTypeIndex = _.findIndex(that._aEventTypes, function(sType) {
						return sType === sEventType;
					});
					var sGeneric = "GENERIC";
					if (iEventTypeIndex === -1) {
						sEventType = sEventType ? sGeneric + "_" + sEventType : sGeneric;
						var sInvalidEventType = "The reported Event Type: " + sEventType +
							" should be configured in the reporter's plugin Plugin.json. sEventType is set to " + sEventType;
						console.error(sInvalidEventType);
						oLogService.error("UsageMonitoring", sInvalidEventType).done();

					}
					if (sEventType.length > 25) { //only 25 chars are allowed for event type
						sEventType = sEventType.substr(0, 25);
						var sLongEventType = "Event Type " + sEventType + " is too long. Only 25 chars allowed.";
						oLogService.error("UsageMonitoring", sLongEventType).done();
						console.error(sLongEventType);
					}
					//Verify Event Component --> If not configured or provided, "GENERIC" will be assigned
					var iEventComponentIndex = _.findIndex(that._aComponents, function(sComponent) {
						return sComponent === sEventComponent;
					});
					if (iEventComponentIndex === -1) {
						sEventComponent = sEventComponent ? sGeneric + "_" + sEventComponent : sGeneric;
						var sInvalidComponent = "The reported Event Component: " + sEventComponent +
							" should be configured in the reporter's plugin Plugin.json. sEventComponent is set to " + sEventComponent;
						console.error(sInvalidComponent);
						oLogService.error("UsageMonitoring", sInvalidComponent).done();
					}
					//report
					return that._oService.report(sEventComponent, sEventType, sEventValue, e2eTime);
				}
			});
		},

		_getPerfMeasuresKey: function(sEventComponent, sEventType) {
			return sEventComponent + "~" + sEventType;
		},

		_getPromisses: function() {
			var aPromisses = [];
			aPromisses.push(this.context.service.system.getSystemInfo());
			//get IDE version
			var sUrl = jQuery.sap.getModulePath("sap.watt.uitools.version", ".json");
			aPromisses.push(
				Q(jQuery.ajax({
					url: sUrl,
					dataType: "json"
				})));
			return aPromisses;
		}
	};
});