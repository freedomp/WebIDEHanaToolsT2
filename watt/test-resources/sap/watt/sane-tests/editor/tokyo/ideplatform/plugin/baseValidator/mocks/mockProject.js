define([], function() {
	"use strict";

	var mockProject = function (serviceName, fullConfig) {
		this.settings = fullConfig;
		this.serviceName = serviceName;
		this.setProjectSetting = function (sSettingName, oSettings, oDocument) {
			this.settings[sSettingName] = oSettings;
			return Q();
		};
		this.set = function (oService, vSettings, oDocument) {
			this.settings = vSettings;
			return Q();
		};
		this.get = function (oService, oDocument) {
			return Q(this.settings);
		};
		this.getProjectSettings = function (sSettingName, oDocument) {
			return Q(this.settings[sSettingName]);
		};
		this._getServiceName = function (oService) {
			return this.serviceName;
		};
	};
	return mockProject;

});

