/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/
define(["sap/hana/cst/common/remote/Request"],

    function(Request) {

        "use strict";

        var BASED_URL = "/sap/hana/cst/api";

        var Xs2CtrlDAO = {

            configure: function(mConfig) {
                this._iBindingServicesCount = 0;
            },

            /**
             *
             */
            getBindingHDIServices: function() {
                var that = this;
                var inputObject = {};
                var sUrl = BASED_URL + "/hdiservice/bindingservices";
                return Request.send(sUrl, "GET", null, inputObject).then(
                    function(result) {
                        if (result.services) {
                            that._iBindingServicesCount = result.services.length;
                        }
                        return result;
                    },
                    that._onErrorHandler.bind(that));
            },

            getBindingHDIService: function(sServiceName) {
                var that = this;
                var sUrl = BASED_URL + "/hdiservice/bindingservices/" + sServiceName;
                return Request.send(sUrl, "GET").then(
                    that._onSuccessHandler.bind(that),
                    that._onErrorHandler.bind(that));
            },

            getHDIServices: function() {
                var that = this;
                var inputObject = {};
                var sUrl = BASED_URL + "/hdiservice/services";
                return Request.send(sUrl, "GET", null, inputObject).then(function(result) {
                    var oResult = {
                        services: []
                    };
                    if (result) {
                        var oServices = JSON.parse(JSON.stringify(result));
                        var length = oServices.length;
                        var index = 0;
                        for (index = 0; index < length; index++) {
                            if (oServices[index].hasOwnProperty('metadata')) {
                                var o = {};
                                o.id = oServices[index].metadata.guid;
                                o.name = oServices[index].serviceInstanceEntity.name;
                                o.tag = oServices[index];
                                oResult.services.push(o);
                            }
                        }
                    }

                    return that._onSuccessHandler(oResult);

                }, this._onErrorHandler.bind(this));
            },
            /*
getHDIServices: function() {
var sUrl = "/v2/service_instances";
return Request.send(sUrl, "GET").then(function(oResult) {
var serviceInstances = oResult.serviceInstances;
return Request.send("/v2/service_plans", "GET").then(function(oResult) {
var servicePlans = oResult.servicePlans;
var length = servicePlans.length;
var hdiServicePlan = null;
var index = 0;
for (index = 0; index < length; index++) {
	if (servicePlans[index].servicePlanEntity.name === "hdi-shared") {
		hdiServicePlan = servicePlans[index];
		break;
	}
} // end for

var hanaServiceInstance = [];
if (hdiServicePlan !== undefined && hdiServicePlan !== null && serviceInstances !== undefined && serviceInstances !== null) {
	length = serviceInstances.length;
	for (index = 0; index < length; index++) {
		if (serviceInstances[index].serviceInstanceEntity.service_plan_guid ===
			hdiServicePlan.metadata.guid) {
			hanaServiceInstance.push(serviceInstances[index]);
		}
	}
}

var oResult2 = {
	services: []
};
var oServices = hanaServiceInstance;
for (index = 0; index < oServices.length; index++) {
	if (oServices[index].hasOwnProperty('metadata')) {
		var o = {};
		o.id = oServices[index].metadata.guid;
		o.name = oServices[index].serviceInstanceEntity.name;
		o.tag = oServices[index];
		oResult2.services.push(o);
	}
}

return oResult2;
});
});
},
*/

            getDefaultBindingService: function() {
                var sURL = BASED_URL + "/hdiservice/defaultbindingservice";
                return Request.send(sURL, "GET").then(
                    this._onSuccessHandler.bind(this),
                    this._onErrorHandler.bind(this));
            },

            /*getAppEnv: function() {
                var sURL = BASED_URL + "/hdiservice/env/app";
                return Request.send(sURL, "GET").then(
                    this._onSuccessHandler.bind(this),
                    this._onErrorHandler.bind(this));
            },*/

            getServicesEnv: function() {
                var sURL = BASED_URL + "/hdiservice/env/services";
                return Request.send(sURL, "GET").then(
                    this._onSuccessHandler.bind(this),
                    this._onErrorHandler.bind(this));
            },

            getEnv: function() {
                var sURL = BASED_URL + "/hdiservice/env";
                return Request.send(sURL, "GET").then(
                    this._onSuccessHandler.bind(this),
                    this._onErrorHandler.bind(this));
            },

            getAppInfo: function(sAppName) {
                var sURL = BASED_URL + "/hdiservice/apps/" + sAppName;
                return Request.send(sURL, "GET").then(
                    this._onSuccessHandler.bind(this),
                    this._onErrorHandler.bind(this));
            },

            getAppEnv: function(sAppId) {
                var sURL = BASED_URL + "/hdiservice/apps/" + sAppId + "/env";
                return Request.send(sURL, "GET").then(
                    this._onSuccessHandler.bind(this),
                    this._onErrorHandler.bind(this));
            },

            bindToHDIService: function(serviceId) {
                var that = this;
                var inputObject = {
                    serviceId: serviceId
                };
                var sUrl = BASED_URL + "/hdiservice/bindservice";
                return Request.send(sUrl, "POST", null, inputObject).then(
                    function(result) {
                        that._iBindingServicesCount = result.bindingServices.length;
                        that.context.event.fireBindServiceSuccess({
                            "serviceName": result.serviceName,
                            "bindingServices": result.bindingServices
                        });
                        return result;
                    },
                    this._onErrorHandler.bind(this));
            },
            bindToHDIServiceByName: function(serviceName) {
                var that = this;
                var inputObject = {
                    serviceName: serviceName
                };
                var sUrl = BASED_URL + "/hdiservice/bindservicebyname";
                return Request.send(sUrl, "POST", null, inputObject).then(
                    function(result) {
                        that._iBindingServicesCount = result.bindingServices.length;
                        that.context.event.fireBindServiceSuccess({
                            "serviceName": result.serviceName,
                            "bindingServices": result.bindingServices
                        });
                        return result;
                    },
                    this._onErrorHandler.bind(this));
            },

            unbindToHDIService: function(serviceName) {
                var that = this;
                var inputObject = {
                    serviceName: serviceName
                };
                var sUrl = BASED_URL + "/hdiservice/unbindservice";
                return Request.send(sUrl, "POST", null, inputObject).then(
                    function(result) {
                        that._iBindingServicesCount = result.bindingServices.length;
                        that.context.event.fireUnbindServiceSuccess({
                            "serviceName": result.serviceName,
                            "bindingServices": result.bindingServices
                        });
                        return result;
                    },
                    this._onErrorHandler.bind(this));
            },

            getBindingServicesCount: function() {
                return this._iBindingServicesCount;
            },

            _onErrorHandler: function(result) {
                var sMsg = "";
                if (result.responseJSON) {
                    var oError = result.responseJSON;
                    if (oError.errorCode && oError.message) {
                        return oError;
                    }
                }

                sMsg = "Request backend service not succeed.";
                if (result.responseText) {
                    sMsg = sMsg + " " + result.responseText;
                } else if (result.statusText) {
                    sMsg = sMsg + " " + result.statusText;
                }
                result = {
                    errorCode: 404,
                    message: sMsg
                };
                return result;
            },

            _onSuccessHandler: function(result) {
                return result;
            }
        };
        return Xs2CtrlDAO;
    });