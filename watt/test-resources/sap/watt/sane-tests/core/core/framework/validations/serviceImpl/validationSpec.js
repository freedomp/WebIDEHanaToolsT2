define(["sap/watt/core/Validations", "sap/watt/core/PluginRegistry", "sap/watt/lib/lodash/lodash"], function (Validations, PluginRegistry, _) {
	"use strict";

	// when running locally make sure to supply the url param ?sap-ide-debug otherwise it will use the pre-load config json
	// which is only created during the maven build and thus the definitions(plugins/service jsons) may not be in sync with the implementations
	describe("Performing validations on Core Model and runtime", function () {

		// if you fix your service so that it can pass this test, it must be removed from this vector
		// one should NEVER add a serviceName to this vector. this is just a stop gap measure to enable testing
		// for currently valid services
		var aServicesThatCurrentlyFailCheck = {
			jsASTManager: "NA",
			collaboration: "NA",
			editor: "edt",
			"intellisence.guidance": "edt",
			beautifier: "edt",
			compare: "git",
			uicontent: "ext",
			applicationsdialogservice: "dpl",
			"git.configurations": "git",
			clone: "git",
			gitdispatcher: "git",
			gitconflicts: "git",
			"git.settings": "git",
			gitFileDAO: "git",
			git: "git"
		};

		var aServicesThatCurrentlyFailLoading = ["adtDiscoveryFactory", "deploywizard"];
		var aAllServicesExclusions = _.union(aServicesThatCurrentlyFailLoading, _.keys(aServicesThatCurrentlyFailCheck));

		it("check all interfaces have implemented all their methods", function () {
			var serviceRegistry = PluginRegistry.$getServiceRegistry();

			var mServicesToCheck = _.omit(serviceRegistry._mRegistry, aAllServicesExclusions);
			var oCheckPromise = Validations.checkAllMethodsOnInterfaceImplemented_forAll(mServicesToCheck);

			return oCheckPromise.then(function (mServiceNameToUnimplementedMethods) {
				var oReportByComponent = createReportByComponent(mServiceNameToUnimplementedMethods);
				assert.ok(_.isEmpty(mServiceNameToUnimplementedMethods),
					"services with unimplemented methods --> :\n" + JSON.stringify(oReportByComponent, null, '\t'));
			}, function (err) {
				assert.ok(false, err.message);
			}).done();
		});

		function createReportByComponent(mServiceNameToUnimplementedMethods) {

			var mWithComponentTag = _.mapValues(mServiceNameToUnimplementedMethods, function (aUnimplementedMethods, sServiceName) {
				var sTagFromBlackList = aServicesThatCurrentlyFailCheck[sServiceName];
				return {
					serviceName: sServiceName,
					unimplementedMethods: aUnimplementedMethods
				};
			});

			return _.groupBy(mWithComponentTag, function (aUnimplementedMethods, sServiceName) {
				var sTagFromBlackList = aServicesThatCurrentlyFailCheck[sServiceName];
				var sComponentTag = _.isUndefined(sTagFromBlackList) ? "NA" : sTagFromBlackList;
				return sComponentTag;
			});
		}
	});
});