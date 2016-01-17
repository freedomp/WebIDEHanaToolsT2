define([], function() {

	"use strict";

	return {
		configure: function(mConfig) {
				if (mConfig && mConfig.configParams) {
					window.swa = {
						baseUrl: mConfig.configParams.baseUrl,
						clicksEnabled: mConfig.configParams.clicksEnabled
					};
				}
		},

		report: function(sEventComponent, sEventType, sEventValue, e2eTime) {

			sEventType = "ide_" + sEventType;
			window.swa.custom1 = {
				ref: sEventComponent
			};
			window.swa.custom2 = {
				ref: e2eTime ? "USAGE_PERF" : "USAGE"
			};
			window.swa.custom8 = {
				ref: e2eTime ? e2eTime : null
			};
			return this._trackCustomEvent(sEventType, sEventValue);
		},

		_trackCustomEvent: function(sEventType, sEventValue) {
			if (window.swa.trackCustomEvent && window.swa.plugin) {
				return window.swa.trackCustomEvent(sEventType, sEventValue);
			} else {
				var interval = setInterval(function() {
					if (window.swa.trackCustomEvent && window.swa.plugin) {
						clearInterval(interval);
						return window.swa.trackCustomEvent(sEventType, sEventValue);
					}
				}, 10000);
			}
		},

		isFioriCloudEdition: false,

		setCustomProperties: function(oIDEData) {
			// custom 3 = SAP OR NONE SAP user
			window.swa.custom3 = {
				ref: oIDEData.isSAPUser ? "SAP" : "NONE_SAP"
			};
			//custom 6 = IDE version
			window.swa.custom6 = {
				ref: oIDEData.IDE_version
			};
			var that = this;

			function getLandscape() {
				return that._getLandscape(window.document.URL);
			}
			//custom 7 = Labndscape (Dev, Prod, Trial, Staging or factory)
			window.swa.custom7 = {
				ref: getLandscape
			};

			function getPerfTime() {
				return that._getPerfTime();
			}
			if (window["sap-ide-perf"]) {
				window.swa.custom8 = {
					ref: getPerfTime
				};
			}

			return this._isFioriCloudEdition().then(function(isFioriCloudEdition) {
				that.isFioriCloudEdition = isFioriCloudEdition;
			}).then(function() {
				that._initWarp();
			});
		},

		_getPerfTime: function() {
			return Date.now() - window["sap-ide-perf"];
		},

		_getLandscape: function(sURL) {
			if (sURL.indexOf("us1.hana.ondemand.com") > -1) {
				return "FACTORY_US1";
			}
			if (sURL.indexOf("us2.hana.ondemand.com") > -1) {
				return "FACTORY_US2";
			}
			if (sURL.indexOf("ap1.hana.ondemand.com") > -1) {
				return "FACTORY_AUS";
			}
			if (sURL.indexOf("hana.ondemand.com") > -1) {
				return "FACTORY_GERMANY";
			}
			if (sURL.indexOf("hanatrial.ondemand.com") > -1) {
				return "TRIAL";
			}
			if (sURL.indexOf("dispatcher.neo.ondemand.com") > -1) {
				return "PROD";
			}
			if (sURL.indexOf("staging.hanavlab.ondemand.com") > -1) {
				return "STAGING";
			}
			if (sURL.indexOf("jpaas.sapbydesign.com") > -1) {
				return "DEV";
			}
			return "UKNOWN";
		},

		_isFioriCloudEdition: function() {
			var _sPersistencyNode = "sap.watt.common.Monitoring";
			var that = this;
			var fioriCloudEditionPrefKey = "FioriCloudEditionUser";
	
			return this.context.service.preferences.get(_sPersistencyNode).then(function(prefs) {
				if (prefs && prefs[fioriCloudEditionPrefKey] !== undefined) {
					return prefs[fioriCloudEditionPrefKey];
				} else {
					return that.context.service.ajaxrequest.serviceCall("usage_fce_check", "/sap/flp/fiorilaunchpad/fiori/v1/feature_toggle/v1", "GET")
						.then(function() {
							prefs = {};
							prefs[fioriCloudEditionPrefKey] = true;
							return that.context.service.preferences.set(prefs, _sPersistencyNode).then(function() {
								return true;
							});
						}).fail(function() {
							prefs = {};
							prefs[fioriCloudEditionPrefKey] = false;
							return that.context.service.preferences.set(prefs, _sPersistencyNode).then(function() {
								return false;
							});
						});
				}
			});
		},

		_getPubtoken: function() {
			if( sap.watt.getEnv("server_type") === "local_hcproxy"){
				return "c8521440-ef31-ae42-a3d2-899d47faa04a";
			}
			var sURL = window.document.URL;
			if (sURL.indexOf("staging.hanavlab.ondemand.com") > -1) {
				return "b56e758d-4c70-5c48-95b3-7e1f57000584";
			}
			var sUsageAnalitycsEnv = sap.watt.getEnv("usage_analytics");
			if(sUsageAnalitycsEnv === "trial"){
				if (sURL.indexOf("hanatrial.ondemand.com") > -1) {
					return "4d4c4389-5436-2a46-b0b6-52f55466cc91";
				}
			}
			if(sUsageAnalitycsEnv === "factory"){
				if (sURL.indexOf(".hana.ondemand.com") > -1) {
					if (this.isFioriCloudEdition) {
						return "7ca7cffd-c500-bd40-a748-b964812ca4ef";
					}
					return "9cd40036-9be2-a644-a76b-4b955748f028";
				}
			}
			switch (sUsageAnalitycsEnv) {
				case "dev":
					return "264752cb-c7f0-d545-87f0-1481e3418df2";
				case "fiori":
					return "22a14762-30cd-0044-a322-ee69b5026bdf";
				case "prod":
					return "851bd492-e2db-5c4f-9916-9a2bbc6cefdf";
				case "selenium":
					return "a4f97033-2a5b-cf45-8558-8af24bcc31fc";
				default:
					return "7a7ab2fe-3cf9-4eab-892a-9dc80cad0ca5";
			}
		},

		_initWarp: function() {
		    window.swa.pubToken =  this._getPubtoken();
			window.swa.optOutCookieTimeout = 63113852;
			window.swa.visitorCookieTimeout = 63113852;
			var d = document,
				g = d.createElement('script'),
				s = d.getElementsByTagName('script')[0];
			g.type = 'text/javascript';
			g.defer = true;
			g.async = true;
			g.src = window.swa.baseUrl + 'js/privacy.js';
			s.parentNode.insertBefore(g, s);
		}
	};
});